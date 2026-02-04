export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// POST: join a team via invite code
export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { invite_code } = body;

        if (!invite_code || invite_code.trim().length === 0) {
            return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
        }

        // Find team by invite code
        const { data: team } = await supabase
            .from("teams")
            .select("*")
            .eq("invite_code", invite_code.trim())
            .single();

        if (!team) {
            return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
        }

        // Check if already a member
        const { data: existing } = await supabase
            .from("team_members")
            .select("id")
            .eq("team_id", team.id)
            .eq("user_id", session.user.id)
            .single();

        if (existing) {
            return NextResponse.json({ error: "Already a member of this team" }, { status: 409 });
        }

        // Check member capacity
        const { count } = await supabase
            .from("team_members")
            .select("id", { count: "exact", head: true })
            .eq("team_id", team.id);

        if (count && count >= team.max_members) {
            return NextResponse.json({ error: "Team is full" }, { status: 400 });
        }

        // Join the team
        const { error } = await supabase
            .from("team_members")
            .insert({
                team_id: team.id,
                user_id: session.user.id,
                role: "member",
            });

        if (error) {
            console.error("Join team error:", error);
            return NextResponse.json({ error: "Failed to join team" }, { status: 500 });
        }

        return NextResponse.json({ team });
    } catch (error) {
        console.error("POST /api/teams/join error:", error);
        return NextResponse.json({ error: "Failed to join team" }, { status: 500 });
    }
}
