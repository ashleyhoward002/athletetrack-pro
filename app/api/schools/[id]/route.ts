export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { UpdateSchoolRequest } from "@/types/school";

// GET: get school details with members
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schoolId = params.id;

    // Get school details
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("*")
      .eq("id", schoolId)
      .single();

    if (schoolError || !school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    // Get members with profile info
    const { data: members } = await supabase
      .from("school_members")
      .select("*, profiles(full_name, avatar_url)")
      .eq("school_id", schoolId)
      .order("joined_at");

    const formattedMembers = (members || []).map((m: any) => ({
      id: m.id,
      school_id: m.school_id,
      user_id: m.user_id,
      role: m.role,
      joined_at: m.joined_at,
      display_name: m.profiles?.full_name || "Unknown",
      avatar_url: m.profiles?.avatar_url,
    }));

    // Get student count
    const { count: studentCount } = await supabase
      .from("school_students")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId);

    // Get user's role in this school
    const { data: membership } = await supabase
      .from("school_members")
      .select("role")
      .eq("school_id", schoolId)
      .eq("user_id", session.user.id)
      .single();

    return NextResponse.json({
      school: {
        ...school,
        student_count: studentCount || 0,
        member_count: formattedMembers.length,
      },
      members: formattedMembers,
      user_role: membership?.role || null,
    });
  } catch (error) {
    console.error("GET /api/schools/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch school" },
      { status: 500 }
    );
  }
}

// PATCH: update school (admin/owner only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schoolId = params.id;

    // Check if user is admin/owner
    const { data: membership } = await supabase
      .from("school_members")
      .select("role")
      .eq("school_id", schoolId)
      .eq("user_id", session.user.id)
      .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: UpdateSchoolRequest = await req.json();
    const updates: Record<string, any> = {};

    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.domain !== undefined) updates.domain = body.domain?.trim() || null;
    if (body.address !== undefined)
      updates.address = body.address?.trim() || null;
    if (body.max_students !== undefined) updates.max_students = body.max_students;

    updates.updated_at = new Date().toISOString();

    const { data: school, error } = await supabase
      .from("schools")
      .update(updates)
      .eq("id", schoolId)
      .select()
      .single();

    if (error) {
      console.error("Update school error:", error);
      return NextResponse.json(
        { error: "Failed to update school" },
        { status: 500 }
      );
    }

    return NextResponse.json({ school });
  } catch (error) {
    console.error("PATCH /api/schools/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update school" },
      { status: 500 }
    );
  }
}

// DELETE: delete school (owner only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schoolId = params.id;

    // Check if user is owner
    const { data: membership } = await supabase
      .from("school_members")
      .select("role")
      .eq("school_id", schoolId)
      .eq("user_id", session.user.id)
      .single();

    if (!membership || membership.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete school (cascade will handle members, students, etc.)
    const { error } = await supabase.from("schools").delete().eq("id", schoolId);

    if (error) {
      console.error("Delete school error:", error);
      return NextResponse.json(
        { error: "Failed to delete school" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/schools/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete school" },
      { status: 500 }
    );
  }
}
