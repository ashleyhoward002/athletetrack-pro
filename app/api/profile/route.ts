export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// GET the current user's profile
export async function GET(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

        if (error && error.code !== "PGRST116") {
            throw error;
        }

        return NextResponse.json({
            profile: profile || {
                id: session.user.id,
                full_name: session.user.email?.split("@")[0] || "Athlete",
            },
        });
    } catch (error) {
        console.error("GET /api/profile error:", error);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}

// PATCH update the current user's profile
export async function PATCH(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Only allow updating certain fields
        const allowedFields = ["full_name", "username", "avatar_url", "bio"];
        const updates: Record<string, any> = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        updates.updated_at = new Date().toISOString();

        const { data: profile, error } = await supabase
            .from("profiles")
            .upsert({
                id: session.user.id,
                ...updates,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ profile });
    } catch (error) {
        console.error("PATCH /api/profile error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
