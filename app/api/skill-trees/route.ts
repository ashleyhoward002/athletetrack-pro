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

        const sport = req.nextUrl.searchParams.get("sport") || "basketball";

        // Fetch skill trees with nodes
        const { data: trees, error: treesError } = await supabase
            .from("skill_trees")
            .select("*, skill_nodes(*)")
            .eq("sport", sport)
            .order("display_order", { ascending: true });

        if (treesError) throw treesError;

        // Fetch user progress
        const nodeIds = (trees || []).flatMap((t: any) =>
            (t.skill_nodes || []).map((n: any) => n.id)
        );

        let progress: any[] = [];
        if (nodeIds.length > 0) {
            const { data: progressData } = await supabase
                .from("athlete_skill_progress")
                .select("*")
                .eq("user_id", session.user.id)
                .in("skill_node_id", nodeIds);
            progress = progressData || [];
        }

        // Merge progress into nodes
        const treesWithProgress = (trees || []).map((tree: any) => ({
            ...tree,
            skill_nodes: (tree.skill_nodes || [])
                .sort((a: any, b: any) => a.display_order - b.display_order)
                .map((node: any) => ({
                    ...node,
                    progress: progress.find((p) => p.skill_node_id === node.id) || null,
                })),
        }));

        return NextResponse.json({ trees: treesWithProgress });
    } catch (error) {
        console.error("GET /api/skill-trees error:", error);
        return NextResponse.json({ error: "Failed to fetch skill trees" }, { status: 500 });
    }
}
