import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { SportId, getSportConfig, sumStats } from "@/lib/sports/config";

// GET all games for the authenticated user
export async function GET(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        // Get query parameters for filtering
        const searchParams = req.nextUrl.searchParams;
        const limit = parseInt(searchParams.get("limit") || "20");
        const page = parseInt(searchParams.get("page") || "1");
        const sport = searchParams.get("sport") as SportId | null;

        // Build query
        let query = supabase
            .from("games")
            .select("*", { count: "exact" })
            .eq("user_id", userId)
            .order("date", { ascending: false });

        // Filter by sport if provided
        if (sport) {
            query = query.eq("sport", sport);
        }

        const { data: games, count, error: dbError } = await query
            .range((page - 1) * limit, page * limit - 1);

        if (dbError) {
            console.error("Supabase error:", dbError);
            throw dbError;
        }

        // Calculate averages using the stats JSONB column
        let allGamesQuery = supabase
            .from("games")
            .select("stats, sport")
            .eq("user_id", userId);

        if (sport) {
            allGamesQuery = allGamesQuery.eq("sport", sport);
        }

        const { data: allGames } = await allGamesQuery;
        const totalGames = allGames?.length || 0;

        let averages: Record<string, string> | null = null;
        if (totalGames > 0 && allGames) {
            // Use the sport config to compute averages dynamically
            const targetSport = sport || "basketball";
            const config = getSportConfig(targetSport);
            const totals = sumStats(allGames.map(g => ({ stats: g.stats || {} })));

            averages = {};
            for (const card of config.averageCards) {
                const value = card.compute(totals, totalGames);
                averages[card.key] = card.format(value);
            }
        }

        return NextResponse.json({
            games: games || [],
            totalGames: count || 0,
            averages,
            page,
            totalPages: Math.ceil((count || 0) / limit),
        });

    } catch (error) {
        console.error("GET /api/games error:", error);
        return NextResponse.json(
            { error: "Failed to fetch games" },
            { status: 500 }
        );
    }
}

// POST create a new game
export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await req.json();
        const sport: SportId = body.sport || "basketball";
        const stats: Record<string, number> = body.stats || {};

        const gameData: Record<string, any> = {
            user_id: userId,
            date: body.date,
            opponent: body.opponent,
            sport,
            stats,
            athlete_id: body.athlete_id || null,
            season_id: body.season_id || null,
        };

        // For basketball, also write legacy columns for backward compat
        if (sport === "basketball") {
            gameData.minutes = stats.minutes || 0;
            gameData.points = stats.points || 0;
            gameData.fg_made = stats.fg_made || 0;
            gameData.fg_attempted = stats.fg_attempted || 0;
            gameData.three_made = stats.three_made || 0;
            gameData.three_attempted = stats.three_attempted || 0;
            gameData.ft_made = stats.ft_made || 0;
            gameData.ft_attempted = stats.ft_attempted || 0;
            gameData.rebounds_off = stats.rebounds_off || 0;
            gameData.rebounds_def = stats.rebounds_def || 0;
            gameData.assists = stats.assists || 0;
            gameData.steals = stats.steals || 0;
            gameData.blocks = stats.blocks || 0;
            gameData.turnovers = stats.turnovers || 0;
            gameData.fouls = stats.fouls || 0;
        }

        const { data, error } = await supabase
            .from("games")
            .insert(gameData)
            .select()
            .single();

        if (error) {
            console.error("Supabase insert error:", error);
            throw error;
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("POST /api/games error:", error);
        return NextResponse.json(
            { error: "Failed to create game" },
            { status: 500 }
        );
    }
}
