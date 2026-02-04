export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { basketballSkillTrees } from "@/lib/sports/seed/basketball-skills";
import { baseballSkillTrees } from "@/lib/sports/seed/baseball-skills";
import { soccerSkillTrees } from "@/lib/sports/seed/soccer-skills";
import { badgesSeed } from "@/lib/sports/seed/badges";
import { challengesSeed } from "@/lib/sports/seed/challenges";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const results: Record<string, number> = {};

        // 1. Seed Skill Trees
        const allTrees = [
            ...basketballSkillTrees.map((t) => ({ ...t, sport: "basketball" })),
            ...baseballSkillTrees.map((t) => ({ ...t, sport: "baseball" })),
            ...soccerSkillTrees.map((t) => ({ ...t, sport: "soccer" })),
        ];

        let treesCreated = 0;
        let nodesCreated = 0;

        for (const tree of allTrees) {
            // Check if tree already exists
            const { data: existing } = await supabase
                .from("skill_trees")
                .select("id")
                .eq("sport", tree.sport)
                .eq("name", tree.name)
                .single();

            if (existing) continue;

            const { data: insertedTree, error: treeError } = await supabase
                .from("skill_trees")
                .insert({
                    sport: tree.sport,
                    name: tree.name,
                    description: tree.description,
                    icon: tree.icon,
                    display_order: tree.display_order,
                })
                .select()
                .single();

            if (treeError || !insertedTree) {
                console.error("Failed to insert tree:", tree.name, treeError);
                continue;
            }

            treesCreated++;

            // Insert nodes
            for (const node of tree.nodes) {
                const { error: nodeError } = await supabase
                    .from("skill_nodes")
                    .insert({
                        tree_id: insertedTree.id,
                        name: node.name,
                        description: node.description,
                        level: node.level,
                        xp_required: node.xp_required,
                        icon: node.icon,
                        display_order: node.display_order,
                    });

                if (!nodeError) nodesCreated++;
            }
        }

        results.skill_trees = treesCreated;
        results.skill_nodes = nodesCreated;

        // 2. Seed Badges
        let badgesCreated = 0;
        for (const badge of badgesSeed) {
            const { data: existing } = await supabase
                .from("badges")
                .select("id")
                .eq("name", badge.name)
                .single();

            if (existing) continue;

            const { error } = await supabase
                .from("badges")
                .insert(badge);

            if (!error) badgesCreated++;
        }
        results.badges = badgesCreated;

        // 3. Seed Challenges
        let challengesCreated = 0;
        for (const challenge of challengesSeed) {
            const { data: existing } = await supabase
                .from("challenges")
                .select("id")
                .eq("name", challenge.name)
                .eq("type", challenge.type)
                .single();

            if (existing) continue;

            const { error } = await supabase
                .from("challenges")
                .insert(challenge);

            if (!error) challengesCreated++;
        }
        results.challenges = challengesCreated;

        return NextResponse.json({
            message: "Seed completed successfully",
            results,
        });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json({ error: "Seed failed" }, { status: 500 });
    }
}
