export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// GET a single program with days and drills
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: program, error } = await supabase
            .from("workout_programs")
            .select("*")
            .eq("id", params.id)
            .eq("user_id", session.user.id)
            .single();

        if (error || !program) {
            return NextResponse.json({ error: "Program not found" }, { status: 404 });
        }

        // Get days with drills
        const { data: days } = await supabase
            .from("program_days")
            .select(`
                *,
                program_day_drills (
                    *,
                    drills (*)
                )
            `)
            .eq("program_id", program.id)
            .order("week_number", { ascending: true })
            .order("day_number", { ascending: true });

        // Get completions for this program's days
        const dayIds = (days || []).map((d) => d.id);
        let completions: any[] = [];
        if (dayIds.length > 0) {
            const { data: comps } = await supabase
                .from("drill_completions")
                .select("*")
                .eq("user_id", session.user.id)
                .in("program_day_id", dayIds);
            completions = comps || [];
        }

        // Sort drills within each day by order_index
        const sortedDays = (days || []).map((day) => ({
            ...day,
            program_day_drills: (day.program_day_drills || []).sort(
                (a: any, b: any) => a.order_index - b.order_index
            ),
        }));

        return NextResponse.json({
            program: {
                ...program,
                program_days: sortedDays,
            },
            completions,
        });
    } catch (error) {
        console.error("GET /api/programs/[id] error:", error);
        return NextResponse.json({ error: "Failed to fetch program" }, { status: 500 });
    }
}

// PUT update a program
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, status, difficulty } = body;

        const updates: Record<string, any> = { updated_at: new Date().toISOString() };
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (status !== undefined) updates.status = status;
        if (difficulty !== undefined) updates.difficulty = difficulty;

        const { data: program, error } = await supabase
            .from("workout_programs")
            .update(updates)
            .eq("id", params.id)
            .eq("user_id", session.user.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ program });
    } catch (error) {
        console.error("PUT /api/programs/[id] error:", error);
        return NextResponse.json({ error: "Failed to update program" }, { status: 500 });
    }
}

// DELETE a program
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { error } = await supabase
            .from("workout_programs")
            .delete()
            .eq("id", params.id)
            .eq("user_id", session.user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/programs/[id] error:", error);
        return NextResponse.json({ error: "Failed to delete program" }, { status: 500 });
    }
}
