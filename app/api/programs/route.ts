export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { SportId } from "@/lib/sports/config";

// GET all workout programs for the authenticated user
export async function GET(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const sport = req.nextUrl.searchParams.get("sport") as SportId | null;
        const status = req.nextUrl.searchParams.get("status");

        let query = supabase
            .from("workout_programs")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false });

        if (sport) query = query.eq("sport", sport);
        if (status) query = query.eq("status", status);

        const { data: programs, error } = await query;

        if (error) throw error;

        // For each program, get completion progress
        const programsWithProgress = await Promise.all(
            (programs || []).map(async (program) => {
                const { data: days } = await supabase
                    .from("program_days")
                    .select("id")
                    .eq("program_id", program.id)
                    .eq("rest_day", false);

                const dayIds = (days || []).map((d) => d.id);
                let totalDrills = 0;
                let completedDrills = 0;

                if (dayIds.length > 0) {
                    const { count: drillCount } = await supabase
                        .from("program_day_drills")
                        .select("*", { count: "exact", head: true })
                        .in("program_day_id", dayIds);

                    totalDrills = drillCount || 0;

                    const { count: completionCount } = await supabase
                        .from("drill_completions")
                        .select("*", { count: "exact", head: true })
                        .eq("user_id", session.user.id)
                        .in("program_day_id", dayIds);

                    completedDrills = completionCount || 0;
                }

                return {
                    ...program,
                    total_drills: totalDrills,
                    completed_drills: completedDrills,
                    progress: totalDrills > 0 ? Math.round((completedDrills / totalDrills) * 100) : 0,
                };
            })
        );

        return NextResponse.json({ programs: programsWithProgress });
    } catch (error) {
        console.error("GET /api/programs error:", error);
        return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 });
    }
}

// POST create a new workout program
export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, sport, difficulty, duration_weeks, days } = body;

        if (!name || !sport) {
            return NextResponse.json({ error: "Name and sport are required" }, { status: 400 });
        }

        // Create the program
        const { data: program, error: programError } = await supabase
            .from("workout_programs")
            .insert({
                user_id: session.user.id,
                name,
                description: description || null,
                sport,
                difficulty: difficulty || "Rookie",
                duration_weeks: duration_weeks || 1,
                source: "custom",
            })
            .select()
            .single();

        if (programError) throw programError;

        // Create program days and their drills if provided
        if (days && Array.isArray(days)) {
            for (const day of days) {
                const { data: programDay, error: dayError } = await supabase
                    .from("program_days")
                    .insert({
                        program_id: program.id,
                        day_number: day.day_number,
                        week_number: day.week_number || 1,
                        name: day.name || null,
                        rest_day: day.rest_day || false,
                    })
                    .select()
                    .single();

                if (dayError) throw dayError;

                if (day.drills && Array.isArray(day.drills) && !day.rest_day) {
                    const drillInserts = day.drills.map((drill: any, idx: number) => ({
                        program_day_id: programDay.id,
                        drill_id: drill.drill_id,
                        order_index: idx,
                        sets_override: drill.sets_override || null,
                        reps_override: drill.reps_override || null,
                        notes: drill.notes || null,
                    }));

                    const { error: drillError } = await supabase
                        .from("program_day_drills")
                        .insert(drillInserts);

                    if (drillError) throw drillError;
                }
            }
        }

        return NextResponse.json({ program }, { status: 201 });
    } catch (error) {
        console.error("POST /api/programs error:", error);
        return NextResponse.json({ error: "Failed to create program" }, { status: 500 });
    }
}
