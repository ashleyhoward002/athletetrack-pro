export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// GET: get parent's linked children with their stats
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

    // Get all parent links for this user
    const { data: parentLinks, error: linksError } = await supabase
      .from("parent_student_links")
      .select(
        `
        id,
        relationship,
        verified,
        school_students (
          id,
          school_id,
          athlete_id,
          grade,
          enrollment_status,
          birth_date,
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
        )
      `
      )
      .eq("parent_user_id", session.user.id)
      .eq("verified", true);

    if (linksError) {
      console.error("Fetch children error:", linksError);
      return NextResponse.json(
        { error: "Failed to fetch children" },
        { status: 500 }
      );
    }

    // For each child, get recent games and stats summary
    const children = await Promise.all(
      (parentLinks || []).map(async (link: any) => {
        const student = link.school_students;
        const athlete = student?.athletes;
        const school = student?.schools;

        if (!athlete) return null;

        // Get recent games (last 5)
        const { data: recentGames } = await supabase
          .from("games")
          .select("id, date, opponent, sport, stats")
          .eq("athlete_id", athlete.id)
          .order("date", { ascending: false })
          .limit(5);

        // Calculate stats summary (averages for the primary sport)
        const { data: allGames } = await supabase
          .from("games")
          .select("stats, sport")
          .eq("athlete_id", athlete.id)
          .eq("sport", athlete.primary_sport);

        // Compute averages from games
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

        // Calculate age
        const birthDate = new Date(student.birth_date);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        return {
          link_id: link.id,
          relationship: link.relationship,
          student: {
            id: student.id,
            grade: student.grade,
            enrollment_status: student.enrollment_status,
            age,
          },
          athlete: {
            id: athlete.id,
            name: athlete.name,
            primary_sport: athlete.primary_sport,
            sports: athlete.sports,
            position: athlete.position,
            jersey_number: athlete.jersey_number,
          },
          school: school
            ? {
                id: school.id,
                name: school.name,
                address: school.address,
              }
            : null,
          recent_games: recentGames || [],
          stats_summary: statsSummary,
          total_games: allGames?.length || 0,
        };
      })
    );

    // Filter out null entries
    const validChildren = children.filter((c) => c !== null);

    return NextResponse.json({ children: validChildren });
  } catch (error) {
    console.error("GET /api/parent/children error:", error);
    return NextResponse.json(
      { error: "Failed to fetch children" },
      { status: 500 }
    );
  }
}
