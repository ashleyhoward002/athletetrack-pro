import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateEmbedding(text: string): Promise<number[]> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY not configured");
    }

    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
}
