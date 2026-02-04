export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { GoogleGenAI } from "@google/genai";
import { SportId, getSportConfig } from "@/lib/sports/config";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// POST: Process a live coaching session (video already uploaded to Storage by client)
// Uses the real-time coaching transcript to generate the summary analysis,
// which is fast (text-only) and avoids Vercel serverless function timeouts.
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

        // 3. Generate summary from the coaching transcript (text-only, fast)
        // The live session already analyzed form in real-time. We summarize
        // that coaching feedback into the structured format.
        try {
            const transcriptText = sessionTranscript
                .map((entry: { timestamp: number; text: string }) => {
                    const mins = Math.floor(entry.timestamp / 60000);
                    const secs = Math.floor((entry.timestamp % 60000) / 1000);
                    return `[${mins}:${String(secs).padStart(2, "0")}] ${entry.text}`;
                })
                .join("\n");

            const summaryPrompt = `You are an expert ${config.name.toLowerCase()} coach. A live coaching session just ended where an AI coach provided real-time feedback on an athlete's ${analysisTypeDef.label.toLowerCase()} for ${Math.floor(sessionDuration / 60)} minutes.

Below is the timestamped transcript of all coaching feedback given during the session:

${transcriptText || "(No coaching feedback was recorded during this session)"}

Based on this coaching transcript, provide a comprehensive summary analysis. Consider the progression of feedback - did the athlete improve during the session? What were the recurring themes?

Return your analysis as JSON with this exact structure:
{"overall_score": <1-100>, "strengths": ["..."], "improvements": ["..."], "detailed_analysis": "...", "drill_recommendations": ["..."]}`;

            const result = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: summaryPrompt,
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
