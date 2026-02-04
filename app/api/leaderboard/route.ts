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

        const { searchParams } = req.nextUrl;
        const category = searchParams.get("category") || "xp";
        const timePeriod = searchParams.get("time_period") || "all_time";
        const sport = searchParams.get("sport") || null;
        const teamId = searchParams.get("team_id") || null;
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        let entries: any[] = [];
        let rpcError: any = null;

        switch (category) {
            case "xp": {
                const { data, error } = await supabase.rpc("get_leaderboard_xp", {
                    p_time_period: timePeriod,
                    p_sport: sport,
                    p_team_id: teamId,
                    p_limit: limit,
                    p_offset: offset,
                });
                entries = data || [];
                rpcError = error;
                break;
            }
            case "streaks": {
                const { data, error } = await supabase.rpc("get_leaderboard_streaks", {
                    p_streak_type: "current",
                    p_team_id: teamId,
                    p_limit: limit,
                    p_offset: offset,
                });
                entries = data || [];
                rpcError = error;
                break;
            }
            case "drills": {
                const { data, error } = await supabase.rpc("get_leaderboard_drills", {
                    p_time_period: timePeriod,
                    p_sport: sport,
                    p_team_id: teamId,
                    p_limit: limit,
                    p_offset: offset,
                });
                entries = data || [];
                rpcError = error;
                break;
            }
            case "badges": {
                const { data, error } = await supabase.rpc("get_leaderboard_badges", {
                    p_team_id: teamId,
                    p_limit: limit,
                    p_offset: offset,
                });
                entries = data || [];
                rpcError = error;
                break;
            }
        }

        if (rpcError) {
            console.error("Leaderboard RPC error:", rpcError);
            return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
        }

        // Get current user's rank
        const { data: userRankData } = await supabase.rpc("get_user_rank", {
            p_user_id: session.user.id,
            p_category: category,
            p_time_period: timePeriod,
            p_sport: sport,
            p_team_id: teamId,
        });

        const userRank = userRankData && userRankData.length > 0
            ? { rank: Number(userRankData[0].rank), value: Number(userRankData[0].value) }
            : null;

        return NextResponse.json({
            entries,
            user_rank: userRank,
        });
    } catch (error) {
        console.error("GET /api/leaderboard error:", error);
        return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}
