export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { query, sport } = await req.json();
        const sportName = sport || "basketball";

        // 1. Generate embedding for the user query
        const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const embeddingResult = await embeddingModel.embedContent(query);
        const queryEmbedding = embeddingResult.embedding.values;

        // 2. Search for relevant documents using the RPC function
        const { data: documents, error: searchError } = await supabase.rpc("match_documents", {
            query_embedding: queryEmbedding,
            match_threshold: 0.5, // Adjust similarity threshold
            match_count: 5
        });

        // 3. Fetch available drills for the sport
        const { data: drills } = await supabase
            .from("drills")
            .select("name, category, difficulty, description")
            .eq("sport", sportName)
            .limit(5);

        if (searchError) {
            console.error("Vector search error:", searchError);
            throw searchError;
        }

        // 4. Construct the context
        const contextText = documents?.map((doc: any) => doc.content).join("\n---\n") || "";
        const drillsText = drills?.map((d: any) => `- ${d.name} (${d.category}, ${d.difficulty}): ${d.description}`).join("\n") || "";

        // 4. Generate answer with Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or gemini-1.5-pro

        const prompt = `You are an expert ${sportName} coach and analyst.
    Use the following context to answer the user's question.
    If the answer is not in the context, use your general ${sportName} knowledge but prioritize the context.
    
    Context:
    ${contextText}

    Available Drills:
    ${drillsText}
    
    User Question: ${query}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const answer = response.text();

        return NextResponse.json({ answer });

    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json(
            { error: "Failed to generate answer" },
            { status: 500 }
        );
    }
}
