import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// Returns the Gemini API key to authenticated users only.
// This prevents the key from being hardcoded in the client bundle.
export async function GET() {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 });
        }

        return NextResponse.json({ apiKey });
    } catch (error) {
        console.error("GET /api/gemini-key error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
