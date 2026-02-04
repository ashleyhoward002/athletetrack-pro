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

        const sport = req.nextUrl.searchParams.get("sport");

        let query = supabase
            .from("training_plans")
            .select("*, workout_programs(*)")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false });

        if (sport) query = query.eq("sport", sport);

        const { data: plans, error } = await query;
        if (error) throw error;

        return NextResponse.json({ plans: plans || [] });
    } catch (error) {
        console.error("GET /api/training-plans error:", error);
        return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
    }
}
