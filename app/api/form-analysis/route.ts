export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SportId, getSportConfig } from "@/lib/sports/config";

// GET list of form analyses
export async function GET(req: NextRequest) {
    try {
        const cookieStore = cookies();
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

// POST: Process uploaded video (video already uploaded to Storage by client)
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
        const mimeType = (body.mime_type as string) || "video/mp4";

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

        // 2. Create record
        const { data: analysis, error: insertError } = await supabase
            .from("form_analyses")
            .insert({
                user_id: userId,
                sport,
                analysis_type: analysisType,
                video_url: videoUrl,
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
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = req.nextUrl.searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
        }

        // First get the analysis to find the video path
        const { data: analysis, error: fetchError } = await supabase
            .from("form_analyses")
            .select("video_url")
            .eq("id", id)
            .eq("user_id", session.user.id)
            .single();

        if (fetchError || !analysis) {
            return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
        }

        // Extract storage path from video URL and delete from storage
        if (analysis.video_url) {
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
