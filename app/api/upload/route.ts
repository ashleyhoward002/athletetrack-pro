export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

async function generateEmbedding(text: string, accessToken: string): Promise<number[]> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-embeddings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ text }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate embedding");
    }

    const data = await response.json();
    return data.embedding;
}

export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        // Auth check
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Read file content
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let textContent = "";

        if (file.type === "application/pdf") {
            const pdf = (await import("pdf-parse")).default;
            const data = await pdf(buffer);
            textContent = data.text;
        } else {
            // Assume text/md
            textContent = buffer.toString("utf-8");
        }

        if (!textContent) {
            return NextResponse.json({ error: "Could not extract text" }, { status: 400 });
        }

        // Split text into chunks (simplistic chunking)
        const chunkSize = 1000;
        const chunks = [];
        for (let i = 0; i < textContent.length; i += chunkSize) {
            chunks.push(textContent.slice(i, i + chunkSize));
        }

        // Generate embeddings using Edge Function and store
        const accessToken = session.access_token;

        for (const chunk of chunks) {
            const embedding = await generateEmbedding(chunk, accessToken);

            const { error } = await supabase.from("documents").insert({
                user_id: session.user.id,
                content: chunk,
                embedding: embedding,
                metadata: { filename: file.name, type: file.type }
            });

            if (error) {
                console.error("Supabase insert error:", error);
            }
        }

        return NextResponse.json({ success: true, chunks: chunks.length });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
