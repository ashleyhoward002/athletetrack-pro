export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { EnrollStudentRequest } from "@/types/school";

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
function generateInviteCode(length: number = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// GET: list students in school
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

    // Get students with athlete info
    const { data: students, error } = await supabase
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
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch students error:", error);
      return NextResponse.json(
        { error: "Failed to fetch students" },
        { status: 500 }
      );
    }

    // Get parent links for each student
    const formattedStudents = await Promise.all(
      (students || []).map(async (s: any) => {
        const { data: parentLinks } = await supabase
          .from("parent_student_links")
          .select("id, relationship, verified, invite_code")
          .eq("school_student_id", s.id);

        const age = calculateAge(s.birth_date);
        return {
          ...s,
          athlete_name: s.athletes?.name,
          athlete: s.athletes,
          age,
          can_have_account: age >= 13,
          has_account: !!s.student_user_id,
          parent_links: parentLinks || [],
        };
      })
    );

    return NextResponse.json({ students: formattedStudents });
  } catch (error) {
    console.error("GET /api/schools/[id]/students error:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

// POST: enroll a new student
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

    // Check student capacity
    const { data: school } = await supabase
      .from("schools")
      .select("max_students")
      .eq("id", schoolId)
      .single();

    const { count: currentCount } = await supabase
      .from("school_students")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId);

    if (school && currentCount !== null && currentCount >= school.max_students) {
      return NextResponse.json(
        { error: "School has reached maximum student capacity" },
        { status: 400 }
      );
    }

    const body: EnrollStudentRequest = await req.json();
    const { name, birth_date, grade, primary_sport, sports, position, jersey_number } =
      body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Student name is required" },
        { status: 400 }
      );
    }

    if (!birth_date) {
      return NextResponse.json(
        { error: "Birth date is required" },
        { status: 400 }
      );
    }

    // Create athlete record first
    const { data: athlete, error: athleteError } = await supabase
      .from("athletes")
      .insert({
        user_id: session.user.id, // School admin owns the athlete initially
        name: name.trim(),
        birth_date,
        primary_sport: primary_sport || "basketball",
        sports: sports || [primary_sport || "basketball"],
        position: position || null,
        jersey_number: jersey_number || null,
        school: "", // Will be linked via school_students
      })
      .select()
      .single();

    if (athleteError || !athlete) {
      console.error("Create athlete error:", athleteError);
      return NextResponse.json(
        { error: "Failed to create athlete profile" },
        { status: 500 }
      );
    }

    // Calculate age and generate student code if 13+
    const age = calculateAge(birth_date);
    const studentInviteCode = age >= 13 ? generateInviteCode(10) : null;

    // Create school student record
    const { data: student, error: studentError } = await supabase
      .from("school_students")
      .insert({
        school_id: schoolId,
        athlete_id: athlete.id,
        grade: grade || null,
        birth_date,
        student_invite_code: studentInviteCode,
      })
      .select()
      .single();

    if (studentError || !student) {
      console.error("Create student error:", studentError);
      // Rollback athlete creation
      await supabase.from("athletes").delete().eq("id", athlete.id);
      return NextResponse.json(
        { error: "Failed to enroll student" },
        { status: 500 }
      );
    }

    // Create a parent invite link
    const { data: parentLink, error: parentLinkError } = await supabase
      .from("parent_student_links")
      .insert({
        school_student_id: student.id,
        relationship: "parent",
      })
      .select()
      .single();

    if (parentLinkError) {
      console.error("Create parent link error:", parentLinkError);
    }

    return NextResponse.json(
      {
        student: {
          ...student,
          athlete,
          age,
          can_have_account: age >= 13,
          has_account: false,
          parent_invite_code: parentLink?.invite_code,
          student_invite_code: studentInviteCode,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/schools/[id]/students error:", error);
    return NextResponse.json(
      { error: "Failed to enroll student" },
      { status: 500 }
    );
  }
}
