export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
        }

        const body = await req.json();
        const targetName = body.target_name as string;
        const sport = body.sport as string || "basketball";

        if (!targetName) {
            return NextResponse.json({ error: "target_name is required" }, { status: 400 });
        }

        const prompt = `You are an AI sports scout assistant. Generate a realistic scouting report for a hypothetical athlete or team named "${targetName}" playing ${sport}.

Create a JSON response with this structure:
{
    "name": "${targetName}",
    "sport": "${sport}",
    "status": "Complete",
    "stats": {
        // Include 4-6 relevant statistics for the sport
        // For basketball: PPG, RPG, APG, FG%, 3P%, etc.
        // For baseball: AVG, HR, RBI, OPS, ERA, etc.
        // For soccer: Goals, Assists, Pass%, etc.
        // For football: Yards, TDs, Completion%, etc.
        // For tennis: Aces, Win%, First Serve%, etc.
        // For volleyball: Kills, Blocks, Digs, etc.
    },
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2"],
    "tendencies": ["tendency1", "tendency2"],
    "notes": "A 2-3 sentence overall assessment of the athlete/team including playing style and areas of focus."
}

Make the statistics realistic for a competitive amateur/high school level player. Be creative but realistic with the assessment. Return only the JSON, no markdown.`;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const responseText = response.text() || "";
        const cleanText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        try {
            const report = JSON.parse(cleanText);
            return NextResponse.json({ report });
        } catch {
            // If JSON parsing fails, return the raw text in a structured format
            return NextResponse.json({
                report: {
                    name: targetName,
                    sport: sport,
                    status: "Complete",
                    stats: {},
                    notes: cleanText,
                }
            });
        }
    } catch (error) {
        console.error("Scout API error:", error);
        return NextResponse.json({ error: "Failed to generate scouting report" }, { status: 500 });
    }
}
