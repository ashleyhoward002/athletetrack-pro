export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { SchoolRole } from "@/types/school";

// GET: list school members
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

    const { data: members, error } = await supabase
      .from("school_members")
      .select("*, profiles(full_name, avatar_url)")
      .eq("school_id", schoolId)
      .order("role")
      .order("joined_at");

    if (error) {
      console.error("Fetch members error:", error);
      return NextResponse.json(
        { error: "Failed to fetch members" },
        { status: 500 }
      );
    }

    const formattedMembers = (members || []).map((m: any) => ({
      id: m.id,
      school_id: m.school_id,
      user_id: m.user_id,
      role: m.role,
      joined_at: m.joined_at,
      display_name: m.profiles?.full_name || "Unknown",
      avatar_url: m.profiles?.avatar_url,
    }));

    return NextResponse.json({ members: formattedMembers });
  } catch (error) {
    console.error("GET /api/schools/[id]/members error:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

// POST: add a member (admin/owner only)
export async function POST(
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

    const body = await req.json();
    const { user_id, role } = body as { user_id: string; role: SchoolRole };

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!role || !["admin", "teacher"].includes(role)) {
      return NextResponse.json(
        { error: "Valid role is required (admin or teacher)" },
        { status: 400 }
      );
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from("school_members")
      .select("id")
      .eq("school_id", schoolId)
      .eq("user_id", user_id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member" },
        { status: 400 }
      );
    }

    const { data: member, error } = await supabase
      .from("school_members")
      .insert({
        school_id: schoolId,
        user_id,
        role,
      })
      .select()
      .single();

    if (error) {
      console.error("Add member error:", error);
      return NextResponse.json(
        { error: "Failed to add member" },
        { status: 500 }
      );
    }

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error("POST /api/schools/[id]/members error:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}

// PATCH: update member role (admin/owner only)
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

    const body = await req.json();
    const { member_id, role } = body as { member_id: string; role: SchoolRole };

    if (!member_id || !role) {
      return NextResponse.json(
        { error: "Member ID and role are required" },
        { status: 400 }
      );
    }

    // Cannot change owner role unless you are owner
    const { data: targetMember } = await supabase
      .from("school_members")
      .select("role")
      .eq("id", member_id)
      .single();

    if (targetMember?.role === "owner" && membership.role !== "owner") {
      return NextResponse.json(
        { error: "Cannot modify owner" },
        { status: 403 }
      );
    }

    const { data: member, error } = await supabase
      .from("school_members")
      .update({ role })
      .eq("id", member_id)
      .eq("school_id", schoolId)
      .select()
      .single();

    if (error) {
      console.error("Update member error:", error);
      return NextResponse.json(
        { error: "Failed to update member" },
        { status: 500 }
      );
    }

    return NextResponse.json({ member });
  } catch (error) {
    console.error("PATCH /api/schools/[id]/members error:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}

// DELETE: remove member (admin/owner or self)
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
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("member_id");

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Get the member being removed
    const { data: targetMember } = await supabase
      .from("school_members")
      .select("user_id, role")
      .eq("id", memberId)
      .eq("school_id", schoolId)
      .single();

    if (!targetMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check if user is admin/owner or removing themselves
    const { data: membership } = await supabase
      .from("school_members")
      .select("role")
      .eq("school_id", schoolId)
      .eq("user_id", session.user.id)
      .single();

    const isSelf = targetMember.user_id === session.user.id;
    const isAdminOrOwner =
      membership && ["owner", "admin"].includes(membership.role);

    if (!isSelf && !isAdminOrOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Cannot remove owner
    if (targetMember.role === "owner") {
      return NextResponse.json(
        { error: "Cannot remove school owner" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("school_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      console.error("Remove member error:", error);
      return NextResponse.json(
        { error: "Failed to remove member" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/schools/[id]/members error:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
