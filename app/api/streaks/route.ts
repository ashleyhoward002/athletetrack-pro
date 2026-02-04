export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// GET current streak, XP, and level for the authenticated user
export async function GET(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: streak } = await supabase
            .from("athlete_streaks")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

        if (!streak) {
            return NextResponse.json({
                streak: {
                    current_streak: 0,
                    longest_streak: 0,
                    last_activity_date: null,
                    total_xp: 0,
                    level: 1,
                },
            });
        }

        // Check if streak is still active (last activity was today or yesterday)
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        let currentStreak = streak.current_streak;
        if (streak.last_activity_date !== today && streak.last_activity_date !== yesterdayStr) {
            currentStreak = 0;
            // Update in DB
            await supabase
                .from("athlete_streaks")
                .update({ current_streak: 0, updated_at: new Date().toISOString() })
                .eq("user_id", session.user.id);
        }

        // Calculate level info
        const totalXp = streak.total_xp;
        const currentLevel = Math.floor(Math.sqrt(totalXp / 100)) + 1;
        const currentLevelXp = (currentLevel - 1) * (currentLevel - 1) * 100;
        const nextLevelXp = currentLevel * currentLevel * 100;
        const xpInLevel = totalXp - currentLevelXp;
        const xpNeeded = nextLevelXp - currentLevelXp;

        return NextResponse.json({
            streak: {
                ...streak,
                current_streak: currentStreak,
            },
            level_info: {
                level: currentLevel,
                xp_in_level: xpInLevel,
                xp_needed: xpNeeded,
                progress: xpNeeded > 0 ? xpInLevel / xpNeeded : 0,
            },
        });
    } catch (error) {
        console.error("GET /api/streaks error:", error);
        return NextResponse.json({ error: "Failed to fetch streak" }, { status: 500 });
    }
}
