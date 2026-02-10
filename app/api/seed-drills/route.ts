export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const PRELOADED_DRILLS = [
  // Basketball
  { sport: "basketball", name: "Mikan Drill", category: "Shooting", difficulty: "Rookie", duration_minutes: 10, sets: 3, reps: 10, description: "Stand under the basket. Shoot a right-hand layup, grab the ball, immediately shoot a left-hand layup. Repeat alternating sides. Focus on soft touch off the glass.", is_curated: true },
  { sport: "basketball", name: "Form Shooting", category: "Shooting", difficulty: "Rookie", duration_minutes: 15, sets: 5, reps: 10, description: "Start 3 feet from basket. Focus on BEEF: Balance, Eyes on target, Elbow in, Follow through. Make 10 shots before moving back. Progress to free throw line.", is_curated: true },
  { sport: "basketball", name: "Two-Ball Dribbling", category: "Ball Handling", difficulty: "Pro", duration_minutes: 10, sets: 3, reps: 1, description: "Dribble two balls simultaneously. Start with same-time dribbles, then alternate. Progress to crossovers and between-the-legs moves with both balls.", is_curated: true },
  { sport: "basketball", name: "Suicide Sprints", category: "Conditioning", difficulty: "All-Star", duration_minutes: 15, sets: 5, reps: 1, description: "Sprint to free throw line and back, half court and back, opposite free throw and back, full court and back. Rest 30 seconds between sets.", is_curated: true },
  { sport: "basketball", name: "Defensive Slides", category: "Defense", difficulty: "Rookie", duration_minutes: 10, sets: 4, reps: 1, description: "Get in defensive stance. Slide left to sideline, then right to opposite sideline. Keep hips low, don't cross feet. 30 seconds per set.", is_curated: true },
  { sport: "basketball", name: "3-Man Weave", category: "Passing", difficulty: "Pro", duration_minutes: 15, sets: 10, reps: 1, description: "Three players weave down court passing without dribbling. Pass and go behind the receiver. Finish with a layup. Jog back and repeat.", is_curated: true },

  // Baseball
  { sport: "baseball", name: "Tee Work", category: "Hitting", difficulty: "Rookie", duration_minutes: 20, sets: 5, reps: 20, description: "Set tee at different heights and positions. Focus on driving through the ball with level swing. Work inside, middle, and outside pitch locations.", is_curated: true },
  { sport: "baseball", name: "Soft Toss", category: "Hitting", difficulty: "Rookie", duration_minutes: 15, sets: 4, reps: 15, description: "Partner tosses balls from the side at 45-degree angle. Focus on timing and contact point. Vary locations: inside, middle, outside.", is_curated: true },
  { sport: "baseball", name: "Long Toss", category: "Throwing", difficulty: "Pro", duration_minutes: 20, sets: 1, reps: 30, description: "Start at 60 feet, gradually increase to max distance. Focus on arc and arm action. Work back in with increased intensity. Essential for arm strength.", is_curated: true },
  { sport: "baseball", name: "Ground Ball Triangle", category: "Fielding", difficulty: "Rookie", duration_minutes: 15, sets: 3, reps: 10, description: "Set up three cones in triangle. Field ground ball, shuffle to cone, throw to target. Rotate positions. Focus on footwork and quick transfers.", is_curated: true },
  { sport: "baseball", name: "Pitcher Fielding Practice", category: "Pitching", difficulty: "Pro", duration_minutes: 15, sets: 3, reps: 10, description: "Practice fielding comebackers, covering first base, and fielding bunts. Work on quick reactions off the mound.", is_curated: true },
  { sport: "baseball", name: "Baserunning Circuit", category: "Baserunning", difficulty: "Rookie", duration_minutes: 15, sets: 5, reps: 1, description: "Run bases focusing on proper turns. Practice leads, reads on fly balls, and tagging up. Time home-to-home and home-to-first.", is_curated: true },

  // Soccer
  { sport: "soccer", name: "Cone Dribbling", category: "Dribbling", difficulty: "Rookie", duration_minutes: 15, sets: 5, reps: 1, description: "Set up 10 cones in a line, 2 feet apart. Dribble through using inside/outside of both feet. Progress to using sole taps and pull-backs.", is_curated: true },
  { sport: "soccer", name: "Wall Passing", category: "Passing", difficulty: "Rookie", duration_minutes: 15, sets: 4, reps: 25, description: "Stand 10 feet from wall. Pass with inside of foot, receive with opposite foot. Alternate feet. Progress to one-touch passing.", is_curated: true },
  { sport: "soccer", name: "Shooting Accuracy", category: "Shooting", difficulty: "Pro", duration_minutes: 20, sets: 4, reps: 10, description: "Place targets in corners of goal. Shoot from 18 yards, aiming for specific targets. Track accuracy percentage. Work on both feet.", is_curated: true },
  { sport: "soccer", name: "1v1 Defending", category: "Defending", difficulty: "Pro", duration_minutes: 20, sets: 10, reps: 1, description: "One attacker vs one defender in 10x10 yard grid. Defender works on positioning, timing tackles, and forcing attacker wide. Rotate roles.", is_curated: true },
  { sport: "soccer", name: "Juggling Challenge", category: "Ball Control", difficulty: "Rookie", duration_minutes: 10, sets: 5, reps: 1, description: "Keep ball in air using feet, thighs, and head. Start with one touch and catch, progress to consecutive touches. Track personal best.", is_curated: true },
  { sport: "soccer", name: "Box Conditioning", category: "Conditioning", difficulty: "All-Star", duration_minutes: 20, sets: 6, reps: 1, description: "Sprint 40 yards, jog 40 yards, sprint 40 yards, jog 40 yards (box shape). Rest 1 minute. Simulates game intensity.", is_curated: true },

  // Football
  { sport: "football", name: "Ladder Footwork", category: "Agility", difficulty: "Rookie", duration_minutes: 15, sets: 5, reps: 2, description: "Various ladder patterns: high knees, lateral shuffle, icky shuffle, in-out. Focus on quick feet and arm drive. Time each rep.", is_curated: true },
  { sport: "football", name: "Route Running", category: "Receiving", difficulty: "Pro", duration_minutes: 20, sets: 10, reps: 1, description: "Run full route tree: slant, out, comeback, post, corner, go. Focus on crisp breaks and consistent depth. Add ball catches.", is_curated: true },
  { sport: "football", name: "Form Tackling", category: "Tackling", difficulty: "Rookie", duration_minutes: 15, sets: 4, reps: 8, description: "Partner holds shield. Practice proper form: head up, wrap arms, drive through. Progress from walk-through to full speed.", is_curated: true },
  { sport: "football", name: "QB Dropbacks", category: "Passing", difficulty: "Pro", duration_minutes: 15, sets: 5, reps: 10, description: "Practice 3-step, 5-step, and 7-step drops. Focus on depth, balance at top of drop, and quick release. Add target throws.", is_curated: true },
  { sport: "football", name: "Cone Shuttle", category: "Conditioning", difficulty: "All-Star", duration_minutes: 15, sets: 8, reps: 1, description: "5-10-5 drill (pro agility). Start in 3-point stance, sprint 5 yards, touch line, sprint 10 yards, touch line, sprint 5 yards. Time each rep.", is_curated: true },
  { sport: "football", name: "Ball Security Gauntlet", category: "Ball Handling", difficulty: "Pro", duration_minutes: 10, sets: 5, reps: 1, description: "Run through line of teammates trying to strip ball. Practice high-and-tight carry. Switch ball to outside arm at sidelines.", is_curated: true },

  // Tennis
  { sport: "tennis", name: "Rally Consistency", category: "Groundstrokes", difficulty: "Rookie", duration_minutes: 20, sets: 5, reps: 20, description: "Rally with partner aiming for 20 consecutive shots. Focus on consistent depth and placement. Track longest rally.", is_curated: true },
  { sport: "tennis", name: "Serve Accuracy", category: "Serving", difficulty: "Pro", duration_minutes: 20, sets: 4, reps: 10, description: "Place targets in serve boxes. Aim for specific targets. Track percentage for each location. Work on both first and second serves.", is_curated: true },
  { sport: "tennis", name: "Volley Touch", category: "Net Play", difficulty: "Pro", duration_minutes: 15, sets: 4, reps: 15, description: "Partner feeds balls at net. Practice punch volleys, drop volleys, and overhead smashes. Focus on soft hands and placement.", is_curated: true },
  { sport: "tennis", name: "Figure 8 Footwork", category: "Footwork", difficulty: "Rookie", duration_minutes: 10, sets: 5, reps: 2, description: "Set up 4 cones in square. Move in figure-8 pattern using split steps, shuffle, and crossover steps. Focus on balance and recovery.", is_curated: true },
  { sport: "tennis", name: "Approach Shot Practice", category: "Approach Shots", difficulty: "Pro", duration_minutes: 15, sets: 4, reps: 10, description: "Start at baseline. Hit short ball, approach to net, finish with volley. Practice down-the-line and crosscourt approaches.", is_curated: true },
  { sport: "tennis", name: "Sprint & Recovery", category: "Conditioning", difficulty: "All-Star", duration_minutes: 15, sets: 10, reps: 1, description: "Start at center mark. Sprint to touch singles sideline, recover to center, sprint to other sideline. Rest 20 seconds between sets.", is_curated: true },

  // Volleyball
  { sport: "volleyball", name: "Pepper Drill", category: "Passing", difficulty: "Rookie", duration_minutes: 15, sets: 3, reps: 1, description: "Partner drill: bump-set-spike sequence. Control is key - keep ball between partners. 3 minutes per set without dropping.", is_curated: true },
  { sport: "volleyball", name: "Serving Target Practice", category: "Serving", difficulty: "Pro", duration_minutes: 20, sets: 4, reps: 10, description: "Place targets (cones/towels) in different zones. Serve to specific targets. Track accuracy. Practice float and topspin serves.", is_curated: true },
  { sport: "volleyball", name: "Hitting Lines", category: "Attacking", difficulty: "Pro", duration_minutes: 20, sets: 4, reps: 8, description: "Setter feeds balls. Practice approach timing, arm swing, and shot selection. Work on line shots, cross-court, and tips.", is_curated: true },
  { sport: "volleyball", name: "Block Timing", category: "Blocking", difficulty: "Pro", duration_minutes: 15, sets: 4, reps: 10, description: "Partner simulates sets. Practice timing jump to meet ball at peak. Focus on penetrating hands over net and sealing the block.", is_curated: true },
  { sport: "volleyball", name: "Defensive Reaction", category: "Defense", difficulty: "All-Star", duration_minutes: 15, sets: 5, reps: 1, description: "Coach or partner hits balls in random directions. Work on reading hitter, quick reactions, and digging to target. 1 minute per set.", is_curated: true },
  { sport: "volleyball", name: "Setting Accuracy", category: "Setting", difficulty: "Rookie", duration_minutes: 15, sets: 4, reps: 15, description: "Set to targets placed at antenna. Practice setting from different positions on court. Focus on hand position and consistent height.", is_curated: true },
];

export async function POST() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if drills already exist
    const { count } = await supabase
      .from("drills")
      .select("*", { count: "exact", head: true })
      .eq("is_curated", true);

    if (count && count > 0) {
      return NextResponse.json({
        message: "Drills already seeded",
        count: count
      });
    }

    // Insert all preloaded drills
    const { data, error } = await supabase
      .from("drills")
      .insert(PRELOADED_DRILLS)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Drills seeded successfully",
      count: data?.length || 0
    });
  } catch (err) {
    console.error("Seed drills error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
