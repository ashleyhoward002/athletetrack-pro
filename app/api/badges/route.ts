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

        // Get all badges
        const { data: allBadges } = await supabase
            .from("badges")
            .select("*")
            .order("category", { ascending: true });

        // Get user's earned badges
        const { data: earned } = await supabase
            .from("athlete_badges")
            .select("*, badges(*)")
            .eq("user_id", session.user.id)
            .order("earned_at", { ascending: false });

        const earnedIds = new Set((earned || []).map((e) => e.badge_id));

        const badges = (allBadges || []).map((badge) => ({
            ...badge,
            earned: earnedIds.has(badge.id),
            earned_at: earned?.find((e) => e.badge_id === badge.id)?.earned_at || null,
        }));

        return NextResponse.json({ badges, earned_count: earnedIds.size, total_count: allBadges?.length || 0 });
    } catch (error) {
        console.error("GET /api/badges error:", error);
        return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
    }
}
