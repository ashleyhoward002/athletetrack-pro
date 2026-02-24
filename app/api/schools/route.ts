export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { CreateSchoolRequest } from "@/types/school";

// GET: list user's schools
export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's schools with membership info
    const { data: memberships, error } = await supabase
      .from("school_members")
      .select("school_id, role, schools(*)")
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Fetch schools error:", error);
      return NextResponse.json(
        { error: "Failed to fetch schools" },
        { status: 500 }
      );
    }

    const schools = await Promise.all(
      (memberships || []).map(async (m: any) => {
        // Get student count
        const { count: studentCount } = await supabase
          .from("school_students")
          .select("id", { count: "exact", head: true })
          .eq("school_id", m.school_id);

        // Get member count
        const { count: memberCount } = await supabase
          .from("school_members")
          .select("id", { count: "exact", head: true })
          .eq("school_id", m.school_id);

        return {
          ...m.schools,
          role: m.role,
          student_count: studentCount || 0,
          member_count: memberCount || 0,
        };
      })
    );

    return NextResponse.json({ schools });
  } catch (error) {
    console.error("GET /api/schools error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schools" },
      { status: 500 }
    );
  }
}

// POST: create a new school
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

    const body: CreateSchoolRequest = await req.json();
    const { name, domain, address } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "School name is required" },
        { status: 400 }
      );
    }

    // Create the school
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .insert({
        name: name.trim(),
        domain: domain?.trim() || null,
        address: address?.trim() || null,
        admin_user_id: session.user.id,
      })
      .select()
      .single();

    if (schoolError || !school) {
      console.error("Create school error:", schoolError);
      return NextResponse.json(
        { error: "Failed to create school" },
        { status: 500 }
      );
    }

    // Add creator as owner
    const { error: memberError } = await supabase
      .from("school_members")
      .insert({
        school_id: school.id,
        user_id: session.user.id,
        role: "owner",
      });

    if (memberError) {
      console.error("Add owner error:", memberError);
    }

    return NextResponse.json({ school }, { status: 201 });
  } catch (error) {
    console.error("POST /api/schools error:", error);
    return NextResponse.json(
      { error: "Failed to create school" },
      { status: 500 }
    );
  }
}
