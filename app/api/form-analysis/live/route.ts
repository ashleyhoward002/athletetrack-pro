export const dynamic = "force-dynamic";
export const maxDuration = 120; // Allow up to 2 minutes for video processing

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { GoogleGenAI, FileState } from "@google/genai";
import { SportId, getSportConfig } from "@/lib/sports/config";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// POST: Process a live coaching session recording (video already uploaded to Storage by client)
export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await req.json();
        const videoPath = body.video_path as string;
        const sport = (body.sport as SportId) || "basketball";
        const analysisType = (body.analysis_type as string) || "";
        const sessionDuration = parseInt(body.session_duration_seconds) || 0;
        const sessionTranscript = Array.isArray(body.session_transcript) ? body.session_transcript : [];

        if (!videoPath) {
            return NextResponse.json({ error: "video_path is required" }, { status: 400 });
        }

        // Verify the file belongs to this user
        if (!videoPath.startsWith(`${userId}/`)) {
            return NextResponse.json({ error: "Unauthorized file access" }, { status: 403 });
        }

        const config = getSportConfig(sport);
        const analysisTypeDef = config.formAnalysisTypes.find((t) => t.key === analysisType);
        if (!analysisTypeDef) {
            return NextResponse.json({ error: "Invalid analysis type" }, { status: 400 });
        }

        // 1. Get the video URL from Storage (already uploaded by client)
        const { data: urlData } = supabase.storage
            .from("form-videos")
            .getPublicUrl(videoPath);

        const videoUrl = urlData.publicUrl;

        // 2. Create record with live session metadata
        const { data: analysis, error: insertError } = await supabase
            .from("form_analyses")
            .insert({
                user_id: userId,
                sport,
                analysis_type: analysisType,
                video_url: videoUrl,
                status: "processing",
                source: "live",
                session_duration_seconds: sessionDuration,
                session_transcript: sessionTranscript,
            })
            .select()
            .single();

        if (insertError) throw insertError;

        // 3. Download video from Storage, upload to Gemini File API, then generate summary
        try {
            // Download the video from Supabase Storage
            const { data: videoBlob, error: downloadError } = await supabase.storage
                .from("form-videos")
                .download(videoPath);

            if (downloadError || !videoBlob) {
                throw new Error("Failed to download video from storage");
            }

            // Upload to Gemini's File API (handles large files)
            const uploadedFile = await ai.files.upload({
                file: new Blob([await videoBlob.arrayBuffer()], { type: "video/webm" }),
                config: {
                    mimeType: "video/webm",
                    displayName: `live-session-${Date.now()}.webm`,
                },
            });

            // Poll until Gemini has finished processing the video
            let fileMetadata = await ai.files.get({ name: uploadedFile.name! });
            const maxWait = 60_000; // 60 second timeout
            const pollStart = Date.now();
            while (
                fileMetadata.state === FileState.PROCESSING &&
                Date.now() - pollStart < maxWait
            ) {
                await new Promise((r) => setTimeout(r, 2000));
                fileMetadata = await ai.files.get({ name: uploadedFile.name! });
            }

            if (fileMetadata.state !== FileState.ACTIVE) {
                throw new Error(
                    `Gemini file processing failed or timed out (state: ${fileMetadata.state})`
                );
            }

            const summaryPrompt = `This is a recorded live coaching session. The athlete was practicing their ${analysisTypeDef.label.toLowerCase()} for ${Math.floor(sessionDuration / 60)} minutes.

${analysisTypeDef.promptTemplate}`;

            const result = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: summaryPrompt },
                            {
                                fileData: {
                                    fileUri: fileMetadata.uri!,
                                    mimeType: "video/webm",
                                },
                            },
                        ],
                    },
                ],
            });

            const responseText = result.text || "";
            const cleanText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            const feedback = JSON.parse(cleanText);

            // 4. Update analysis record with AI feedback
            await supabase
                .from("form_analyses")
                .update({
                    status: "completed",
                    ai_feedback: feedback,
                    overall_score: feedback.overall_score || null,
                })
                .eq("id", analysis.id);

            // Clean up the uploaded file from Gemini (fire-and-forget)
            ai.files.delete({ name: uploadedFile.name! }).catch(() => {});

            return NextResponse.json({
                analysis: {
                    ...analysis,
                    status: "completed",
                    ai_feedback: feedback,
                    overall_score: feedback.overall_score,
                },
            }, { status: 201 });
        } catch (aiError) {
            console.error("Gemini analysis error for live session:", aiError);

            // Still save the session even if AI summary fails
            await supabase
                .from("form_analyses")
                .update({ status: "failed" })
                .eq("id", analysis.id);

            return NextResponse.json({
                analysis: { ...analysis, status: "failed" },
                error: "AI summary analysis failed, but your session recording was saved.",
            }, { status: 201 });
        }
    } catch (error) {
        console.error("POST /api/form-analysis/live error:", error);
        return NextResponse.json({ error: "Failed to save live session" }, { status: 500 });
    }
}
