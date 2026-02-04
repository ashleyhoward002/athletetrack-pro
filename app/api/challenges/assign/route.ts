export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// POST: Assign daily/weekly challenges to the user
export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const today = new Date().toISOString().split("T")[0];

        // Check if user already has challenges for today
        const { data: existing } = await supabase
            .from("athlete_challenges")
            .select("challenge_id")
            .eq("user_id", userId)
            .eq("status", "active")
            .gte("started_at", today);

        const existingIds = new Set((existing || []).map((e) => e.challenge_id));

        // Get available daily challenges
        const { data: dailyChallenges } = await supabase
            .from("challenges")
            .select("*")
            .eq("type", "daily")
            .eq("is_active", true);

        // Get available weekly challenges (assign on first day of week)
        const dayOfWeek = new Date().getDay();
        let weeklyChallenges: any[] = [];
        if (dayOfWeek === 1) {
            // Monday
            const { data } = await supabase
                .from("challenges")
                .select("*")
                .eq("type", "weekly")
                .eq("is_active", true);
            weeklyChallenges = data || [];
        }

        // Assign up to 3 daily challenges
        const toAssign = [
            ...(dailyChallenges || []).filter((c) => !existingIds.has(c.id)).slice(0, 3),
            ...weeklyChallenges.filter((c) => !existingIds.has(c.id)).slice(0, 2),
        ];

        const assigned = [];
        for (const challenge of toAssign) {
            const { data, error } = await supabase
                .from("athlete_challenges")
                .insert({
                    user_id: userId,
                    challenge_id: challenge.id,
                    progress: 0,
                    target: challenge.criteria.target,
                    status: "active",
                })
                .select("*, challenges(*)")
                .single();

            if (!error && data) assigned.push(data);
        }

        return NextResponse.json({ assigned });
    } catch (error) {
        console.error("POST /api/challenges/assign error:", error);
        return NextResponse.json({ error: "Failed to assign challenges" }, { status: 500 });
    }
}
