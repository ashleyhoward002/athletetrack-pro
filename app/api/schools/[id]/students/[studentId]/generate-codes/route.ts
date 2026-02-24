export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// Helper to calculate age
function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Helper to generate invite code
function generateInviteCode(length: number = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// POST: generate new invite codes for a student
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; studentId: string } }
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

    const { id: schoolId, studentId } = params;

    // Check if user is a member of this school
    const { data: membership } = await supabase
      .from("school_members")
      .select("role")
      .eq("school_id", schoolId)
      .eq("user_id", session.user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get student info
    const { data: student, error: studentError } = await supabase
      .from("school_students")
      .select("*, athletes(name)")
      .eq("id", studentId)
      .eq("school_id", schoolId)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const body = await req.json();
    const { type, relationship } = body as {
      type: "parent" | "student";
      relationship?: string;
    };

    if (!type || !["parent", "student"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'parent' or 'student'" },
        { status: 400 }
      );
    }

    if (type === "parent") {
      // Create a new parent invite link
      const newCode = generateInviteCode(10);
      const { data: parentLink, error: linkError } = await supabase
        .from("parent_student_links")
        .insert({
          school_student_id: studentId,
          relationship: relationship || "parent",
          invite_code: newCode,
        })
        .select()
        .single();

      if (linkError) {
        console.error("Create parent link error:", linkError);
        return NextResponse.json(
          { error: "Failed to generate parent code" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        invite_code: parentLink.invite_code,
        type: "parent",
        relationship: parentLink.relationship,
      });
    }

    if (type === "student") {
      // Check if student is 13+
      const age = calculateAge(student.birth_date);
      if (age < 13) {
        return NextResponse.json(
          { error: "Student must be 13 or older to have their own account" },
          { status: 400 }
        );
      }

      // Generate new student invite code
      const newCode = generateInviteCode(10);
      const { error: updateError } = await supabase
        .from("school_students")
        .update({ student_invite_code: newCode })
        .eq("id", studentId);

      if (updateError) {
        console.error("Update student code error:", updateError);
        return NextResponse.json(
          { error: "Failed to generate student code" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        invite_code: newCode,
        type: "student",
      });
    }
  } catch (error) {
    console.error(
      "POST /api/schools/[id]/students/[studentId]/generate-codes error:",
      error
    );
    return NextResponse.json(
      { error: "Failed to generate codes" },
      { status: 500 }
    );
  }
}

// GET: get existing invite codes for a student
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; studentId: string } }
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

    const { id: schoolId, studentId } = params;

    // Check if user is a member of this school
    const { data: membership } = await supabase
      .from("school_members")
      .select("role")
      .eq("school_id", schoolId)
      .eq("user_id", session.user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get student info
    const { data: student } = await supabase
      .from("school_students")
      .select("student_invite_code, birth_date")
      .eq("id", studentId)
      .eq("school_id", schoolId)
      .single();

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get parent invite codes
    const { data: parentLinks } = await supabase
      .from("parent_student_links")
      .select("id, invite_code, relationship, verified, parent_user_id")
      .eq("school_student_id", studentId)
      .order("created_at");

    const age = calculateAge(student.birth_date);

    return NextResponse.json({
      student_invite_code: student.student_invite_code,
      can_have_student_code: age >= 13,
      parent_invite_codes: (parentLinks || []).map((pl: any) => ({
        id: pl.id,
        invite_code: pl.invite_code,
        relationship: pl.relationship,
        verified: pl.verified,
        claimed: !!pl.parent_user_id,
      })),
    });
  } catch (error) {
    console.error(
      "GET /api/schools/[id]/students/[studentId]/generate-codes error:",
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch codes" },
      { status: 500 }
    );
  }
}
