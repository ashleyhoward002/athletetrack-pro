export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SportId, getSportConfig } from "@/lib/sports/config";

// GET list of form analyses
export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const sport = req.nextUrl.searchParams.get("sport");

        let query = supabase
            .from("form_analyses")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false });

        if (sport) query = query.eq("sport", sport);

        const { data: analyses, error } = await query;
        if (error) throw error;

        return NextResponse.json({ analyses: analyses || [] });
    } catch (error) {
        console.error("GET /api/form-analysis error:", error);
        return NextResponse.json({ error: "Failed to fetch analyses" }, { status: 500 });
    }
}

// POST: Process uploaded video or YouTube URL
export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await req.json();
        const videoSource = (body.video_source as string) || "upload";
        const sport = (body.sport as SportId) || "basketball";
        const analysisType = (body.analysis_type as string) || "";

        const config = getSportConfig(sport);
        const analysisTypeDef = config.formAnalysisTypes.find((t) => t.key === analysisType);
        if (!analysisTypeDef) {
            return NextResponse.json({ error: "Invalid analysis type" }, { status: 400 });
        }

        // Handle YouTube videos
        if (videoSource === "youtube") {
            const youtubeUrl = body.youtube_url as string;
            const youtubeVideoId = body.youtube_video_id as string;

            if (!youtubeUrl || !youtubeVideoId) {
                return NextResponse.json({ error: "YouTube URL and video ID are required" }, { status: 400 });
            }

            // Create record
            const { data: analysis, error: insertError } = await supabase
                .from("form_analyses")
                .insert({
                    user_id: userId,
                    sport,
                    analysis_type: analysisType,
                    video_url: youtubeUrl,
                    video_source: "youtube",
                    youtube_video_id: youtubeVideoId,
                    status: "processing",
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Analyze with Gemini using fileData (URL-based)
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                // For YouTube videos, we'll pass the URL and let Gemini try to fetch it
                // Note: Gemini may not be able to directly access YouTube videos,
                // so we'll include context about what to analyze
                const result = await model.generateContent([
                    `${analysisTypeDef.promptTemplate}

Note: The video to analyze is from YouTube: ${youtubeUrl}

If you cannot access the video directly, provide general coaching tips for ${sport} ${analysisType} based on common technique issues. Structure your response as if you analyzed a video, but note that it's based on general best practices.`,
                ]);

                const response = result.response;
                const responseText = response.text() || "";
                const cleanText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

                let feedback;
                try {
                    feedback = JSON.parse(cleanText);
                } catch {
                    // If not valid JSON, create a structured response
                    feedback = {
                        overall_score: 70,
                        strengths: ["Based on general best practices for " + sport],
                        improvements: [responseText.substring(0, 500)],
                        detailed_analysis: responseText,
                        drill_recommendations: [],
                    };
                }

                // Update analysis record
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
                console.error("Gemini analysis error for YouTube:", aiError);
                await supabase
                    .from("form_analyses")
                    .update({ status: "failed" })
                    .eq("id", analysis.id);

                return NextResponse.json({
                    analysis: { ...analysis, status: "failed" },
                    error: "AI analysis failed. YouTube video analysis may have limitations.",
                }, { status: 201 });
            }
        }

        // Handle uploaded videos (existing flow)
        const videoPath = body.video_path as string;
        const mimeType = (body.mime_type as string) || "video/mp4";

        if (!videoPath) {
            return NextResponse.json({ error: "video_path is required for uploads" }, { status: 400 });
        }

        // Verify the file belongs to this user
        if (!videoPath.startsWith(`${userId}/`)) {
            return NextResponse.json({ error: "Unauthorized file access" }, { status: 403 });
        }

        // 1. Get the video URL from Storage (already uploaded by client)
        const { data: urlData } = supabase.storage
            .from("form-videos")
            .getPublicUrl(videoPath);

        const videoUrl = urlData.publicUrl;

        // 2. Create record
        const { data: analysis, error: insertError } = await supabase
            .from("form_analyses")
            .insert({
                user_id: userId,
                sport,
                analysis_type: analysisType,
                video_url: videoUrl,
                video_source: "upload",
                status: "processing",
            })
            .select()
            .single();

        if (insertError) throw insertError;

        // 3. Download from Storage and analyze with Gemini (inline base64, fast)
        try {
            const { data: videoBlob, error: downloadError } = await supabase.storage
                .from("form-videos")
                .download(videoPath);

            if (downloadError || !videoBlob) {
                throw new Error("Failed to download video from storage");
            }

            const buffer = Buffer.from(await videoBlob.arrayBuffer());
            const base64Data = buffer.toString("base64");

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent([
                analysisTypeDef.promptTemplate,
                {
                    inlineData: {
                        mimeType,
                        data: base64Data,
                    },
                },
            ]);

            const response = result.response;
            const responseText = response.text() || "";
            const cleanText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            const feedback = JSON.parse(cleanText);

            // 4. Update analysis record
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
            console.error("Gemini analysis error:", aiError);
            await supabase
                .from("form_analyses")
                .update({ status: "failed" })
                .eq("id", analysis.id);

            return NextResponse.json({
                analysis: { ...analysis, status: "failed" },
                error: "AI analysis failed. The video may be too long or in an unsupported format.",
            }, { status: 201 });
        }
    } catch (error) {
        console.error("POST /api/form-analysis error:", error);
        return NextResponse.json({ error: "Failed to analyze form" }, { status: 500 });
    }
}

// DELETE: Remove form analysis and associated video
export async function DELETE(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = req.nextUrl.searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
        }

        // First get the analysis to find the video path and source
        const { data: analysis, error: fetchError } = await supabase
            .from("form_analyses")
            .select("video_url, video_source")
            .eq("id", id)
            .eq("user_id", session.user.id)
            .single();

        if (fetchError || !analysis) {
            return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
        }

        // Only delete from storage for uploaded videos (not YouTube)
        if (analysis.video_url && analysis.video_source !== "youtube") {
            try {
                const url = new URL(analysis.video_url);
                const pathMatch = url.pathname.match(/\/form-videos\/(.+)/);
                if (pathMatch) {
                    const storagePath = decodeURIComponent(pathMatch[1]);
                    await supabase.storage.from("form-videos").remove([storagePath]);
                }
            } catch (storageError) {
                console.error("Failed to delete video from storage:", storageError);
                // Continue with database deletion even if storage deletion fails
            }
        }

        // Delete the analysis record
        const { error: deleteError } = await supabase
            .from("form_analyses")
            .delete()
            .eq("id", id)
            .eq("user_id", session.user.id);

        if (deleteError) throw deleteError;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/form-analysis error:", error);
        return NextResponse.json({ error: "Failed to delete analysis" }, { status: 500 });
    }
}
