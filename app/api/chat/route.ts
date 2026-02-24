export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateEmbedding } from "@/lib/embeddings";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
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

        // 1. Fetch user's recent games for context
        const { data: recentGames } = await supabase
            .from("games")
            .select("*")
            .eq("user_id", session.user.id)
            .order("date", { ascending: false })
            .limit(5);

        // 2. Fetch available drills for the sport
        const { data: drills } = await supabase
            .from("drills")
            .select("name, category, difficulty, description")
            .eq("sport", sportName)
            .limit(10);

        // 3. RAG: Search knowledge base for relevant content
        let knowledgeContext = "";
        try {
            const queryEmbedding = await generateEmbedding(query);

            // Perform vector similarity search using pgvector
            const { data: docs, error: searchError } = await supabase.rpc(
                "match_documents",
                {
                    query_embedding: queryEmbedding,
                    match_threshold: 0.5,
                    match_count: 3,
                    filter_sport: sportName
                }
            );

            if (!searchError && docs && docs.length > 0) {
                knowledgeContext = "Relevant Training Knowledge:\n" +
                    docs.map((d: any) => d.content).join("\n\n");
            }
        } catch (ragError) {
            console.log("RAG search skipped (function may not exist yet):", ragError);
            // Continue without RAG context - not a critical failure
        }

        // 4. Build stats context from recent games
        let statsContext = "";
        if (recentGames && recentGames.length > 0) {
            statsContext = "Recent Game Stats:\n" + recentGames.map((g: any) => {
                if (sportName === "basketball") {
                    return `- vs ${g.opponent} (${g.date}): ${g.points || 0} pts, ${(g.rebounds_off || 0) + (g.rebounds_def || 0)} reb, ${g.assists || 0} ast`;
                }
                return `- vs ${g.opponent} (${g.date}): ${JSON.stringify(g.stats || {})}`;
            }).join("\n");
        }

        const drillsText = drills?.map((d: any) =>
            `- ${d.name} (${d.category}, ${d.difficulty}): ${d.description}`
        ).join("\n") || "";

        // 5. Build the prompt with all context
        const systemPrompt = `You are an expert athletic coach assistant for ${sportName}.
You help athletes and parents understand stats, improve performance, and develop skills.
Be encouraging but specific. Give actionable advice based on the athlete's actual performance data when available.
Keep responses concise but helpful.`;

        const contextParts = [];
        if (knowledgeContext) contextParts.push(knowledgeContext);
        if (statsContext) contextParts.push(statsContext);
        if (drillsText) contextParts.push(`Available Drills:\n${drillsText}`);

        const fullPrompt = contextParts.length > 0
            ? `${systemPrompt}\n\nContext:\n${contextParts.join("\n\n")}\n\nUser Question: ${query}`
            : `${systemPrompt}\n\nUser Question: ${query}`;

        // 6. Call Gemini directly
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        const answer = response.text();

        return NextResponse.json({ answer });

    } catch (error: any) {
        console.error("Chat error:", error?.message || error);
        return NextResponse.json(
            { error: error?.message || "Failed to generate answer." },
            { status: 500 }
        );
    }
}
