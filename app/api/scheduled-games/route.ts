export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// GET all scheduled games for the authenticated user
export async function GET(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = req.nextUrl.searchParams;
        const upcoming = searchParams.get("upcoming") === "true";
        const limit = parseInt(searchParams.get("limit") || "50");

        let query = supabase
            .from("scheduled_games")
            .select("*, athletes(name)")
            .eq("user_id", session.user.id)
            .order("game_date", { ascending: true })
            .order("game_time", { ascending: true, nullsFirst: false });

        // Filter to only upcoming games if requested
        if (upcoming) {
            const today = new Date().toISOString().split("T")[0];
            query = query.gte("game_date", today);
        }

        query = query.limit(limit);

        const { data: games, error } = await query;

        if (error) throw error;

        return NextResponse.json({ games: games || [] });
    } catch (error) {
        console.error("GET /api/scheduled-games error:", error);
        return NextResponse.json({ error: "Failed to fetch scheduled games" }, { status: 500 });
    }
}

// POST create a new scheduled game
export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        const gameData = {
            user_id: session.user.id,
            athlete_id: body.athlete_id || null,
            sport: body.sport || "basketball",
            opponent: body.opponent,
            game_date: body.game_date,
            game_time: body.game_time || null,
            location: body.location || null,
            notes: body.notes || null,
            is_home_game: body.is_home_game ?? true,
            reminder_enabled: body.reminder_enabled ?? true,
            reminder_hours_before: body.reminder_hours_before || 24,
        };

        const { data, error } = await supabase
            .from("scheduled_games")
            .insert(gameData)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("POST /api/scheduled-games error:", error);
        return NextResponse.json({ error: "Failed to create scheduled game" }, { status: 500 });
    }
}

// DELETE a scheduled game
export async function DELETE(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = req.nextUrl.searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
        }

        const { error } = await supabase
            .from("scheduled_games")
            .delete()
            .eq("id", id)
            .eq("user_id", session.user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/scheduled-games error:", error);
        return NextResponse.json({ error: "Failed to delete scheduled game" }, { status: 500 });
    }
}
