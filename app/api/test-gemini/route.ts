export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
    try {
        // Check if API key exists
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                status: "error",
                message: "GEMINI_API_KEY is not configured in environment variables"
            }, { status: 500 });
        }

        // Test the API
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent("Say 'API working!' in 3 words or less");
        const response = result.response;
        const text = response.text();

        return NextResponse.json({
            status: "success",
            message: "Gemini API is working",
            response: text
        });

    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: error?.message || "Unknown error",
            details: String(error)
        }, { status: 500 });
    }
}
