export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SportId, getSportConfig } from "@/lib/sports/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

// POST upload video and analyze
export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const formData = await req.formData();
        const file = formData.get("video") as File;
        const sport = (formData.get("sport") as SportId) || "basketball";
        const analysisType = (formData.get("analysis_type") as string) || "";

        if (!file) {
            return NextResponse.json({ error: "Video file is required" }, { status: 400 });
        }

        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Max 50MB." }, { status: 400 });
        }

        const config = getSportConfig(sport);
        const analysisTypeDef = config.formAnalysisTypes.find((t) => t.key === analysisType);
        if (!analysisTypeDef) {
            return NextResponse.json({ error: "Invalid analysis type" }, { status: 400 });
        }

        // 1. Upload to Supabase Storage
        const timestamp = Date.now();
        const filePath = `${userId}/${timestamp}-${file.name}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await supabase.storage
            .from("form-videos")
            .upload(filePath, buffer, { contentType: file.type });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
            .from("form-videos")
            .getPublicUrl(filePath);

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

        // 3. Analyze with Gemini Vision
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const videoData = {
                inlineData: {
                    mimeType: file.type,
                    data: buffer.toString("base64"),
                },
            };

            const result = await model.generateContent([
                analysisTypeDef.promptTemplate,
                videoData,
            ]);

            const responseText = result.response.text();
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
            console.error("Gemini Vision error:", aiError);
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
