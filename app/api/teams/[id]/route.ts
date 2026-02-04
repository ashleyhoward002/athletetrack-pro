export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// GET: team detail with members
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: team } = await supabase
            .from("teams")
            .select("*")
            .eq("id", params.id)
            .single();

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        const { data: members } = await supabase
            .from("team_members")
            .select("*, profiles(full_name, avatar_url)")
            .eq("team_id", params.id)
            .order("joined_at", { ascending: true });

        const formattedMembers = (members || []).map((m: any) => ({
            id: m.id,
            team_id: m.team_id,
            user_id: m.user_id,
            role: m.role,
            joined_at: m.joined_at,
            display_name: m.profiles?.full_name || "Anonymous",
            avatar_url: m.profiles?.avatar_url || null,
        }));

        return NextResponse.json({ team, members: formattedMembers });
    } catch (error) {
        console.error("GET /api/teams/[id] error:", error);
        return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
    }
}

// PATCH: update team (owner only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, sport } = body;

        const { data: team, error } = await supabase
            .from("teams")
            .update({
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(sport !== undefined && { sport }),
                updated_at: new Date().toISOString(),
            })
            .eq("id", params.id)
            .eq("created_by", session.user.id)
            .select()
            .single();

        if (error || !team) {
            return NextResponse.json({ error: "Failed to update team or not authorized" }, { status: 403 });
        }

        return NextResponse.json({ team });
    } catch (error) {
        console.error("PATCH /api/teams/[id] error:", error);
        return NextResponse.json({ error: "Failed to update team" }, { status: 500 });
    }
}

// DELETE: delete team (owner only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { error } = await supabase
            .from("teams")
            .delete()
            .eq("id", params.id)
            .eq("created_by", session.user.id);

        if (error) {
            return NextResponse.json({ error: "Failed to delete team or not authorized" }, { status: 403 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/teams/[id] error:", error);
        return NextResponse.json({ error: "Failed to delete team" }, { status: 500 });
    }
}
