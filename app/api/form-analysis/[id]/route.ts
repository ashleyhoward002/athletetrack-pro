export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: analysis, error } = await supabase
            .from("form_analyses")
            .select("*")
            .eq("id", params.id)
            .eq("user_id", session.user.id)
            .single();

        if (error || !analysis) {
            return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
        }

        return NextResponse.json({ analysis });
    } catch (error) {
        console.error("GET /api/form-analysis/[id] error:", error);
        return NextResponse.json({ error: "Failed to fetch analysis" }, { status: 500 });
    }
}
