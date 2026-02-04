export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// GET: list user's teams + optionally search all teams
export async function GET(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const search = req.nextUrl.searchParams.get("search");

        // Get user's teams with member counts
        const { data: myMemberships } = await supabase
            .from("team_members")
            .select("team_id, role, teams(*)")
            .eq("user_id", session.user.id);

        const myTeams = (myMemberships || []).map((m: any) => ({
            ...m.teams,
            role: m.role,
        }));

        // Get member counts for user's teams
        for (const team of myTeams) {
            const { count } = await supabase
                .from("team_members")
                .select("id", { count: "exact", head: true })
                .eq("team_id", team.id);
            team.member_count = count || 0;
        }

        let searchResults: any[] = [];
        if (search) {
            const { data: teams } = await supabase
                .from("teams")
                .select("*")
                .ilike("name", `%${search}%`)
                .limit(20);

            if (teams) {
                const myTeamIds = new Set(myTeams.map((t: any) => t.id));
                searchResults = teams.filter((t: any) => !myTeamIds.has(t.id));

                for (const team of searchResults) {
                    const { count } = await supabase
                        .from("team_members")
                        .select("id", { count: "exact", head: true })
                        .eq("team_id", team.id);
                    team.member_count = count || 0;
                }
            }
        }

        return NextResponse.json({ my_teams: myTeams, search_results: searchResults });
    } catch (error) {
        console.error("GET /api/teams error:", error);
        return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
    }
}

// POST: create a new team
export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, sport } = body;

        if (!name || name.trim().length === 0) {
            return NextResponse.json({ error: "Team name is required" }, { status: 400 });
        }

        const { data: team, error: teamError } = await supabase
            .from("teams")
            .insert({
                name: name.trim(),
                description: description || null,
                sport: sport || null,
                created_by: session.user.id,
            })
            .select()
            .single();

        if (teamError || !team) {
            console.error("Create team error:", teamError);
            return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
        }

        // Add creator as owner
        const { error: memberError } = await supabase
            .from("team_members")
            .insert({
                team_id: team.id,
                user_id: session.user.id,
                role: "owner",
            });

        if (memberError) {
            console.error("Add owner error:", memberError);
        }

        return NextResponse.json({ team }, { status: 201 });
    } catch (error) {
        console.error("POST /api/teams error:", error);
        return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
    }
}
