export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// POST: leave a team
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check membership
        const { data: membership } = await supabase
            .from("team_members")
            .select("id, role")
            .eq("team_id", params.id)
            .eq("user_id", session.user.id)
            .single();

        if (!membership) {
            return NextResponse.json({ error: "Not a member of this team" }, { status: 404 });
        }

        // If owner, check if there are other members
        if (membership.role === "owner") {
            const { count } = await supabase
                .from("team_members")
                .select("id", { count: "exact", head: true })
                .eq("team_id", params.id);

            if (count && count > 1) {
                return NextResponse.json(
                    { error: "As the owner, please transfer ownership or delete the team first" },
                    { status: 400 }
                );
            }

            // Sole member — delete the team (cascade deletes membership)
            const { error: deleteError } = await supabase
                .from("teams")
                .delete()
                .eq("id", params.id);

            if (deleteError) {
                return NextResponse.json({ error: "Failed to delete team" }, { status: 500 });
            }

            return NextResponse.json({ success: true, deleted: true });
        }

        // Regular member — just remove membership
        const { error } = await supabase
            .from("team_members")
            .delete()
            .eq("team_id", params.id)
            .eq("user_id", session.user.id);

        if (error) {
            return NextResponse.json({ error: "Failed to leave team" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("POST /api/teams/[id]/leave error:", error);
        return NextResponse.json({ error: "Failed to leave team" }, { status: 500 });
    }
}
