export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// GET drill completions for the authenticated user
export async function GET(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
        const drillId = req.nextUrl.searchParams.get("drill_id");

        let query = supabase
            .from("drill_completions")
            .select("*, drills(name, category, sport, xp_reward)")
            .eq("user_id", session.user.id)
            .order("completed_at", { ascending: false })
            .limit(limit);

        if (drillId) query = query.eq("drill_id", drillId);

        const { data: completions, error } = await query;

        if (error) throw error;

        return NextResponse.json({ completions: completions || [] });
    } catch (error) {
        console.error("GET /api/drill-completions error:", error);
        return NextResponse.json({ error: "Failed to fetch completions" }, { status: 500 });
    }
}

// POST record a drill completion
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
        const { drill_id, program_day_id, duration_seconds, notes, rating } = body;

        if (!drill_id) {
            return NextResponse.json({ error: "drill_id is required" }, { status: 400 });
        }

        // Get the drill to determine XP reward
        const { data: drill } = await supabase
            .from("drills")
            .select("xp_reward, skill_node_ids")
            .eq("id", drill_id)
            .single();

        const baseXp = 25;
        const drillXp = drill?.xp_reward || 0;
        const totalXp = baseXp + drillXp;

        // 1. Insert drill completion
        const { data: completion, error: completionError } = await supabase
            .from("drill_completions")
            .insert({
                user_id: userId,
                drill_id,
                program_day_id: program_day_id || null,
                duration_seconds: duration_seconds || null,
                notes: notes || null,
                rating: rating || null,
                xp_earned: totalXp,
            })
            .select()
            .single();

        if (completionError) throw completionError;

        // 2. Update streak and XP
        const today = new Date().toISOString().split("T")[0];

        const { data: existingStreak } = await supabase
            .from("athlete_streaks")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (existingStreak) {
            const lastDate = existingStreak.last_activity_date;
            let newStreak = existingStreak.current_streak;

            if (lastDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split("T")[0];

                if (lastDate === yesterdayStr) {
                    newStreak += 1;
                } else if (lastDate !== today) {
                    newStreak = 1;
                }
            }

            const newTotalXp = existingStreak.total_xp + totalXp;
            const newLevel = Math.floor(Math.sqrt(newTotalXp / 100)) + 1;

            await supabase
                .from("athlete_streaks")
                .update({
                    current_streak: newStreak,
                    longest_streak: Math.max(newStreak, existingStreak.longest_streak),
                    last_activity_date: today,
                    total_xp: newTotalXp,
                    level: newLevel,
                    updated_at: new Date().toISOString(),
                })
                .eq("user_id", userId);
        } else {
            await supabase
                .from("athlete_streaks")
                .insert({
                    user_id: userId,
                    current_streak: 1,
                    longest_streak: 1,
                    last_activity_date: today,
                    total_xp: totalXp,
                    level: 1,
                });
        }

        // 3. Update skill node progress if drill is linked to skill nodes
        if (drill?.skill_node_ids && drill.skill_node_ids.length > 0) {
            for (const nodeId of drill.skill_node_ids) {
                // Upsert progress
                const { data: existing } = await supabase
                    .from("athlete_skill_progress")
                    .select("*")
                    .eq("user_id", userId)
                    .eq("skill_node_id", nodeId)
                    .single();

                if (existing && existing.status !== "completed") {
                    const newXp = existing.xp_earned + totalXp;

                    // Check if XP threshold met
                    const { data: node } = await supabase
                        .from("skill_nodes")
                        .select("xp_required")
                        .eq("id", nodeId)
                        .single();

                    const isCompleted = node && newXp >= node.xp_required;

                    await supabase
                        .from("athlete_skill_progress")
                        .update({
                            xp_earned: newXp,
                            status: isCompleted ? "completed" : "in_progress",
                            completed_at: isCompleted ? new Date().toISOString() : null,
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", existing.id);
                } else if (!existing) {
                    await supabase
                        .from("athlete_skill_progress")
                        .insert({
                            user_id: userId,
                            skill_node_id: nodeId,
                            status: "in_progress",
                            xp_earned: totalXp,
                        });
                }
            }
        }

        // 4. Update challenge progress
        const { data: activeChallenges } = await supabase
            .from("athlete_challenges")
            .select("*, challenges(*)")
            .eq("user_id", userId)
            .eq("status", "active");

        if (activeChallenges) {
            for (const ac of activeChallenges) {
                const criteria = ac.challenges?.criteria;
                if (!criteria) continue;

                if (criteria.metric === "drill_completions" || criteria.metric === "total_drill_completions") {
                    const newProgress = ac.progress + 1;
                    const isCompleted = newProgress >= ac.target;

                    await supabase
                        .from("athlete_challenges")
                        .update({
                            progress: newProgress,
                            status: isCompleted ? "completed" : "active",
                            completed_at: isCompleted ? new Date().toISOString() : null,
                        })
                        .eq("id", ac.id);
                }
            }
        }

        return NextResponse.json({
            completion,
            xp_earned: totalXp,
        }, { status: 201 });
    } catch (error) {
        console.error("POST /api/drill-completions error:", error);
        return NextResponse.json({ error: "Failed to record completion" }, { status: 500 });
    }
}
