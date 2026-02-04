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

        // Get active challenges for the user
        const { data: activeChallenges, error } = await supabase
            .from("athlete_challenges")
            .select("*, challenges(*)")
            .eq("user_id", session.user.id)
            .eq("status", "active")
            .order("started_at", { ascending: false });

        if (error) throw error;

        // Also get recently completed
        const { data: completed } = await supabase
            .from("athlete_challenges")
            .select("*, challenges(*)")
            .eq("user_id", session.user.id)
            .eq("status", "completed")
            .order("completed_at", { ascending: false })
            .limit(10);

        return NextResponse.json({
            active: activeChallenges || [],
            completed: completed || [],
        });
    } catch (error) {
        console.error("GET /api/challenges error:", error);
        return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });
    }
}
