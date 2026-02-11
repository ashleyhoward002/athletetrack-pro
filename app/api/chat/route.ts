export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

        const { query, sport } = await req.json();
        const sportName = sport || "basketball";

        // Fetch user's recent games for context
        const { data: recentGames } = await supabase
            .from("games")
            .select("*")
            .eq("user_id", session.user.id)
            .order("date", { ascending: false })
            .limit(5);

        // Fetch available drills for the sport
        const { data: drills } = await supabase
            .from("drills")
            .select("name, category, difficulty, description")
            .eq("sport", sportName)
            .limit(10);

        // Try to get uploaded documents if any exist
        let contextText = "";
        try {
            // Generate embedding for the query
            const embeddingResult = await ai.models.embedContent({
                model: "text-embedding-004",
                contents: [{ role: "user", parts: [{ text: query }] }],
            });

            if (embeddingResult.embedding?.values) {
                const { data: documents } = await supabase.rpc("match_documents", {
                    query_embedding: embeddingResult.embedding.values,
                    match_threshold: 0.5,
                    match_count: 5
                });
                contextText = documents?.map((doc: any) => doc.content).join("\n---\n") || "";
            }
        } catch (embError) {
            // If embeddings fail, continue without document context
            console.log("Embedding/document search skipped:", embError);
        }

        // Build stats context from recent games
        let statsContext = "";
        if (recentGames && recentGames.length > 0) {
            statsContext = "Recent Game Stats:\n" + recentGames.map((g: any) => {
                if (sportName === "basketball") {
                    return `- vs ${g.opponent} (${g.date}): ${g.points || 0} pts, ${(g.rebounds_off || 0) + (g.rebounds_def || 0)} reb, ${g.assists || 0} ast`;
                }
                return `- vs ${g.opponent} (${g.date}): ${JSON.stringify(g.stats || {})}`;
            }).join("\n");
        }

        const drillsText = drills?.map((d: any) => `- ${d.name} (${d.category}, ${d.difficulty}): ${d.description}`).join("\n") || "";

        const prompt = `You are an expert ${sportName} coach and analyst helping a youth athlete improve.
Use the following context to answer the user's question. Be encouraging but honest.
If providing drill recommendations, mention specific drills from the list when relevant.

${contextText ? `Uploaded Documents:\n${contextText}\n` : ""}
${statsContext ? `\n${statsContext}\n` : ""}
${drillsText ? `\nAvailable Drills:\n${drillsText}\n` : ""}

User Question: ${query}

Provide a helpful, concise response (2-4 paragraphs max). If recommending drills, explain why they would help.`;

        const result = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const answer = result.text || "I apologize, I couldn't generate a response. Please try again.";

        return NextResponse.json({ answer });

    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json(
            { error: "Failed to generate answer. Please check your API configuration." },
            { status: 500 }
        );
    }
}
