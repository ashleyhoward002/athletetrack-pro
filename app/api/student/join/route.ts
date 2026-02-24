export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { StudentJoinRequest } from "@/types/school";

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

// POST: student (13+) joins via invite code
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: StudentJoinRequest = await req.json();
    const { invite_code } = body;

    if (!invite_code || invite_code.trim().length === 0) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    // Find school student by invite code
    const { data: student, error: studentError } = await supabase
      .from("school_students")
      .select(
        `
        *,
        athletes (
          id,
          name,
          primary_sport
        ),
        schools (
          id,
          name
        )
      `
      )
      .eq("student_invite_code", invite_code.trim().toUpperCase())
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      );
    }

    // Check if student is 13+
    const age = calculateAge(student.birth_date);
    if (age < 13) {
      return NextResponse.json(
        { error: "Student must be 13 or older to create their own account" },
        { status: 400 }
      );
    }

    // Check if this student already has an account linked
    if (student.student_user_id && student.student_user_id !== session.user.id) {
      return NextResponse.json(
        { error: "This student profile is already linked to another account" },
        { status: 400 }
      );
    }

    // If already linked to this user, just return success
    if (student.student_user_id === session.user.id) {
      return NextResponse.json({
        message: "Already linked to your student profile",
        student: {
          name: student.athletes?.name,
          school: student.schools?.name,
        },
      });
    }

    // Link the student user to their profile
    const { error: updateError } = await supabase
      .from("school_students")
      .update({
        student_user_id: session.user.id,
        student_invite_code: null, // Clear the invite code after use
      })
      .eq("id", student.id);

    if (updateError) {
      console.error("Link student error:", updateError);
      return NextResponse.json(
        { error: "Failed to link account" },
        { status: 500 }
      );
    }

    // Update the athlete's user_id to the student
    await supabase
      .from("athletes")
      .update({ user_id: session.user.id })
      .eq("id", student.athlete_id);

    // Update user's profile role to 'student'
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile && (!profile.role || profile.role === "member")) {
      await supabase
        .from("profiles")
        .update({ role: "student" })
        .eq("id", session.user.id);
    }

    return NextResponse.json({
      message: "Successfully linked to your student profile",
      student: {
        name: student.athletes?.name,
        school: student.schools?.name,
        sport: student.athletes?.primary_sport,
        grade: student.grade,
      },
    });
  } catch (error) {
    console.error("POST /api/student/join error:", error);
    return NextResponse.json(
      { error: "Failed to process invite code" },
      { status: 500 }
    );
  }
}

// GET: get student's own profile
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find student profile linked to this user
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
        ),
        schools (
          id,
          name,
          address
        )
      `
      )
      .eq("student_user_id", session.user.id)
      .single();

    if (error || !student) {
      return NextResponse.json(
        { error: "No student profile linked to this account" },
        { status: 404 }
      );
    }

    // Get recent games
    const { data: recentGames } = await supabase
      .from("games")
      .select("id, date, opponent, sport, stats")
      .eq("athlete_id", student.athlete_id)
      .order("date", { ascending: false })
      .limit(10);

    // Calculate stats summary
    const { data: allGames } = await supabase
      .from("games")
      .select("stats, sport")
      .eq("athlete_id", student.athlete_id)
      .eq("sport", student.athletes?.primary_sport);

    const statsSummary: Record<string, number> = {};
    if (allGames && allGames.length > 0) {
      const statsFields = Object.keys(allGames[0].stats || {});
      for (const field of statsFields) {
        const values = allGames
          .map((g: any) => g.stats?.[field])
          .filter((v) => typeof v === "number");
        if (values.length > 0) {
          statsSummary[field] =
            Math.round(
              (values.reduce((a: number, b: number) => a + b, 0) / values.length) * 10
            ) / 10;
        }
      }
    }

    return NextResponse.json({
      student: {
        id: student.id,
        grade: student.grade,
        enrollment_status: student.enrollment_status,
      },
      athlete: student.athletes,
      school: student.schools,
      recent_games: recentGames || [],
      stats_summary: statsSummary,
      total_games: allGames?.length || 0,
    });
  } catch (error) {
    console.error("GET /api/student/join error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
