export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { ParentJoinRequest } from "@/types/school";

// POST: parent joins via invite code
export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ParentJoinRequest = await req.json();
    const { invite_code } = body;

    if (!invite_code || invite_code.trim().length === 0) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    // Find parent link by invite code
    const { data: parentLink, error: linkError } = await supabase
      .from("parent_student_links")
      .select(
        `
        *,
        school_students (
          id,
          school_id,
          athlete_id,
          grade,
          athletes (
            name
          ),
          schools (
            id,
            name
          )
        )
      `
      )
      .eq("invite_code", invite_code.trim().toUpperCase())
      .single();

    if (linkError || !parentLink) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      );
    }

    // Check if this link is already claimed by someone else
    if (parentLink.parent_user_id && parentLink.parent_user_id !== session.user.id) {
      return NextResponse.json(
        { error: "This invite code has already been used" },
        { status: 400 }
      );
    }

    // If already linked to this user, just return success
    if (parentLink.parent_user_id === session.user.id) {
      return NextResponse.json({
        message: "Already linked to this child",
        child: {
          name: parentLink.school_students?.athletes?.name,
          school: parentLink.school_students?.schools?.name,
        },
      });
    }

    // Link the parent to the student
    const { error: updateError } = await supabase
      .from("parent_student_links")
      .update({
        parent_user_id: session.user.id,
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq("id", parentLink.id);

    if (updateError) {
      console.error("Link parent error:", updateError);
      return NextResponse.json(
        { error: "Failed to link account" },
        { status: 500 }
      );
    }

    // Update user's profile role to 'parent' if not already set
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile && (!profile.role || profile.role === "member")) {
      await supabase
        .from("profiles")
        .update({ role: "parent" })
        .eq("id", session.user.id);
    }

    return NextResponse.json({
      message: "Successfully linked to your child",
      child: {
        name: parentLink.school_students?.athletes?.name,
        school: parentLink.school_students?.schools?.name,
        grade: parentLink.school_students?.grade,
      },
    });
  } catch (error) {
    console.error("POST /api/parent/join error:", error);
    return NextResponse.json(
      { error: "Failed to process invite code" },
      { status: 500 }
    );
  }
}
