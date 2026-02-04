export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const sport = req.nextUrl.searchParams.get("sport") || "basketball";

        const { data: ratings, error } = await supabase
            .from("skill_ratings")
            .select("*")
            .eq("user_id", session.user.id)
            .eq("sport", sport)
            .order("assessed_at", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ ratings: ratings || [] });
    } catch (error) {
        console.error("GET /api/skill-ratings error:", error);
        return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 });
    }
}
