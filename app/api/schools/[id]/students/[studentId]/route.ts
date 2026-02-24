export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { UpdateStudentRequest } from "@/types/school";

// GET: get single student details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; studentId: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: schoolId, studentId } = params;

    // Get student with athlete info
    const { data: student, error } = await supabase
      .from("school_students")
      .select(
        `
        *,
        athletes (
          id,
          name,
          primary_sport,
          sports,
          position,
          jersey_number
        )
      `
      )
      .eq("id", studentId)
      .eq("school_id", schoolId)
      .single();

    if (error || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get parent links
    const { data: parentLinks } = await supabase
      .from("parent_student_links")
      .select("*, profiles(full_name)")
      .eq("school_student_id", studentId);

    return NextResponse.json({
      student: {
        ...student,
        athlete: student.athletes,
        parent_links: (parentLinks || []).map((pl: any) => ({
          ...pl,
          parent_name: pl.profiles?.full_name,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/schools/[id]/students/[studentId] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    );
  }
}

// PATCH: update student
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; studentId: string } }
) {
  try {
    const cookieStore = await cookies();
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

    const body: UpdateStudentRequest = await req.json();

    // Get current student to find athlete_id
    const { data: currentStudent } = await supabase
      .from("school_students")
      .select("athlete_id")
      .eq("id", studentId)
      .eq("school_id", schoolId)
      .single();

    if (!currentStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Update school_students fields
    const studentUpdates: Record<string, any> = {};
    if (body.grade !== undefined) studentUpdates.grade = body.grade;
    if (body.enrollment_status !== undefined)
      studentUpdates.enrollment_status = body.enrollment_status;

    if (Object.keys(studentUpdates).length > 0) {
      const { error: studentError } = await supabase
        .from("school_students")
        .update(studentUpdates)
        .eq("id", studentId);

      if (studentError) {
        console.error("Update student error:", studentError);
        return NextResponse.json(
          { error: "Failed to update student" },
          { status: 500 }
        );
      }
    }

    // Update athlete fields
    const athleteUpdates: Record<string, any> = {};
    if (body.position !== undefined) athleteUpdates.position = body.position;
    if (body.jersey_number !== undefined)
      athleteUpdates.jersey_number = body.jersey_number;

    if (Object.keys(athleteUpdates).length > 0) {
      const { error: athleteError } = await supabase
        .from("athletes")
        .update(athleteUpdates)
        .eq("id", currentStudent.athlete_id);

      if (athleteError) {
        console.error("Update athlete error:", athleteError);
      }
    }

    // Fetch updated student
    const { data: student } = await supabase
      .from("school_students")
      .select(
        `
        *,
        athletes (
          id,
          name,
          primary_sport,
          sports,
          position,
          jersey_number
        )
      `
      )
      .eq("id", studentId)
      .single();

    return NextResponse.json({ student });
  } catch (error) {
    console.error("PATCH /api/schools/[id]/students/[studentId] error:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

// DELETE: remove student from school
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; studentId: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: schoolId, studentId } = params;

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

    // Get student to find athlete_id
    const { data: student } = await supabase
      .from("school_students")
      .select("athlete_id")
      .eq("id", studentId)
      .eq("school_id", schoolId)
      .single();

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Delete school_student (cascade will handle parent_links)
    const { error: deleteError } = await supabase
      .from("school_students")
      .delete()
      .eq("id", studentId);

    if (deleteError) {
      console.error("Delete student error:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove student" },
        { status: 500 }
      );
    }

    // Optionally delete the athlete record too
    // (Or keep it if there's other data attached)
    await supabase.from("athletes").delete().eq("id", student.athlete_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "DELETE /api/schools/[id]/students/[studentId] error:",
      error
    );
    return NextResponse.json(
      { error: "Failed to remove student" },
      { status: 500 }
    );
  }
}
