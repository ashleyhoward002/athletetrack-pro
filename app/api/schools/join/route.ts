export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { JoinSchoolRequest } from "@/types/school";

// POST: join school via staff invite code
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

    const body: JoinSchoolRequest = await req.json();
    const { invite_code } = body;

    if (!invite_code || invite_code.trim().length === 0) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    // Find school by invite code
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("*")
      .eq("invite_code", invite_code.trim().toUpperCase())
      .single();

    if (schoolError || !school) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("school_members")
      .select("id")
      .eq("school_id", school.id)
      .eq("user_id", session.user.id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: "Already a member of this school" },
        { status: 400 }
      );
    }

    // Add user as teacher (default role for invite code joins)
    const { error: memberError } = await supabase
      .from("school_members")
      .insert({
        school_id: school.id,
        user_id: session.user.id,
        role: "teacher",
      });

    if (memberError) {
      console.error("Join school error:", memberError);
      return NextResponse.json(
        { error: "Failed to join school" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      school: {
        id: school.id,
        name: school.name,
      },
      message: "Successfully joined school",
    });
  } catch (error) {
    console.error("POST /api/schools/join error:", error);
    return NextResponse.json(
      { error: "Failed to join school" },
      { status: 500 }
    );
  }
}
