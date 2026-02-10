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

        const sport = req.nextUrl.searchParams.get("sport");

        let query = supabase
            .from("drills")
            .select("*")
            .order("name", { ascending: true });

        if (sport) {
            query = query.eq("sport", sport);
        }

        const { data: drills, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ drills });
    } catch (err) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, category, difficulty, description, video_url, duration_minutes, sets, reps } = body;

        // Basic validation
        if (!name || !category || !difficulty) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const sport = body.sport || "basketball";

        const { data, error } = await supabase
            .from("drills")
            .insert([{
                name, category, difficulty, description, video_url, sport,
                duration_minutes: duration_minutes || 10,
                sets: sets || 3,
                reps: reps || 10,
            }])
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ drill: data[0] });
    } catch (err) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, name, category, difficulty, description, video_url, sport, duration_minutes, sets, reps } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing drill ID" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("drills")
            .update({
                name, category, difficulty, description, video_url, sport,
                duration_minutes: duration_minutes || 10,
                sets: sets || 3,
                reps: reps || 10,
            })
            .eq("id", id)
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ drill: data[0] });
    } catch (err) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

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
            return NextResponse.json({ error: "Missing drill ID" }, { status: 400 });
        }

        const { error } = await supabase
            .from("drills")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
