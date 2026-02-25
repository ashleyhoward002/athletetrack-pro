export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// Realistic basketball game stats generator
function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateBasketballGame(
  opponent: string,
  date: string,
  skill: "good" | "avg" | "great"
) {
  const ranges = {
    good: { pts: [12, 22], fgm: [5, 9], fga: [10, 16], tpm: [1, 3], tpa: [3, 7], ftm: [2, 5], fta: [3, 6], oreb: [1, 3], dreb: [3, 7], ast: [3, 7], stl: [1, 3], blk: [0, 2], to: [1, 3], fouls: [1, 3], min: [24, 32] },
    avg:  { pts: [6, 14], fgm: [3, 6], fga: [8, 14], tpm: [0, 2], tpa: [2, 5], ftm: [1, 3], fta: [2, 4], oreb: [0, 2], dreb: [2, 5], ast: [1, 4], stl: [0, 2], blk: [0, 1], to: [2, 4], fouls: [2, 4], min: [18, 26] },
    great:{ pts: [18, 30], fgm: [7, 12], fga: [12, 20], tpm: [2, 5], tpa: [4, 8], ftm: [3, 6], fta: [4, 7], oreb: [2, 4], dreb: [5, 10], ast: [4, 9], stl: [2, 4], blk: [1, 3], to: [0, 2], fouls: [1, 2], min: [28, 36] },
  };
  const r = ranges[skill];

  const fg_made = randomBetween(...r.fgm);
  const fg_attempted = Math.max(fg_made, randomBetween(...r.fga));
  const three_made = randomBetween(...r.tpm);
  const three_attempted = Math.max(three_made, randomBetween(...r.tpa));
  const ft_made = randomBetween(...r.ftm);
  const ft_attempted = Math.max(ft_made, randomBetween(...r.fta));
  const points = (fg_made - three_made) * 2 + three_made * 3 + ft_made;

  const stats = {
    minutes: randomBetween(...r.min),
    points,
    fg_made,
    fg_attempted,
    three_made,
    three_attempted,
    ft_made,
    ft_attempted,
    rebounds_off: randomBetween(...r.oreb),
    rebounds_def: randomBetween(...r.dreb),
    assists: randomBetween(...r.ast),
    steals: randomBetween(...r.stl),
    blocks: randomBetween(...r.blk),
    turnovers: randomBetween(...r.to),
    fouls: randomBetween(...r.fouls),
  };

  return { opponent, date, sport: "basketball", stats };
}

function generateSoccerGame(
  opponent: string,
  date: string,
  skill: "good" | "avg" | "great"
) {
  const ranges = {
    good:  { min: [60, 80], goals: [0, 1], assists: [0, 1], shots: [2, 5], sog: [1, 3], passes: [20, 35], pass_acc: [70, 85], tackles: [2, 5], interceptions: [1, 3], fouls: [0, 2], saves: [0, 0] },
    avg:   { min: [45, 70], goals: [0, 0], assists: [0, 1], shots: [1, 3], sog: [0, 2], passes: [15, 25], pass_acc: [60, 78], tackles: [1, 4], interceptions: [0, 2], fouls: [1, 3], saves: [0, 0] },
    great: { min: [75, 90], goals: [1, 3], assists: [1, 2], shots: [3, 7], sog: [2, 5], passes: [30, 50], pass_acc: [78, 92], tackles: [3, 6], interceptions: [2, 4], fouls: [0, 1], saves: [0, 0] },
  };
  const r = ranges[skill];

  const shots_on_goal = randomBetween(...r.sog);
  const stats = {
    minutes_played: randomBetween(...r.min),
    goals: randomBetween(...r.goals),
    assists: randomBetween(...r.assists),
    shots: Math.max(shots_on_goal, randomBetween(...r.shots)),
    shots_on_goal,
    passes_completed: randomBetween(...r.passes),
    pass_accuracy: randomBetween(...r.pass_acc),
    tackles: randomBetween(...r.tackles),
    interceptions: randomBetween(...r.interceptions),
    fouls_committed: randomBetween(...r.fouls),
    saves: randomBetween(...r.saves),
  };

  return { opponent, date, sport: "soccer", stats };
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const results: Record<string, number> = {};

    // ---- 1. ATHLETES ----
    const athleteRows = [
      {
        user_id: userId,
        name: "Marcus Johnson",
        birth_date: "2011-03-15",
        position: "SG",
        primary_sport: "basketball",
        sports: ["basketball"],
        school: "Lincoln Middle School",
        team_name: "Lincoln Lions",
        level: "JV",
        jersey_number: 23,
      },
      {
        user_id: userId,
        name: "Sophia Martinez",
        birth_date: "2012-07-22",
        position: "PG",
        primary_sport: "basketball",
        sports: ["basketball", "soccer"],
        school: "Lincoln Middle School",
        team_name: "Lincoln Lions",
        level: "Varsity",
        jersey_number: 11,
      },
      {
        user_id: userId,
        name: "Jayden Williams",
        birth_date: "2013-11-08",
        position: "Forward",
        primary_sport: "soccer",
        sports: ["soccer"],
        school: "Riverside Elementary",
        team_name: "Riverside Rapids",
        level: "Recreational",
        jersey_number: 7,
      },
    ];

    const { data: athletes, error: athErr } = await supabase
      .from("athletes")
      .insert(athleteRows)
      .select();

    if (athErr) {
      // Athletes may already exist — try to fetch existing
      const { data: existing } = await supabase
        .from("athletes")
        .select("*")
        .eq("user_id", userId);

      if (!existing || existing.length === 0) {
        return NextResponse.json(
          { error: "Failed to create athletes: " + athErr.message },
          { status: 500 }
        );
      }
      // Use existing athletes
      results.athletes_existing = existing.length;
    } else {
      results.athletes = athletes?.length || 0;
    }

    // Fetch athlete IDs
    const { data: allAthletes } = await supabase
      .from("athletes")
      .select("id, name, primary_sport")
      .eq("user_id", userId);

    const marcus = allAthletes?.find((a) => a.name === "Marcus Johnson");
    const sophia = allAthletes?.find((a) => a.name === "Sophia Martinez");
    const jayden = allAthletes?.find((a) => a.name === "Jayden Williams");

    // ---- 2. BASKETBALL GAMES (Marcus — 12 games over the season) ----
    const basketballGames = [
      generateBasketballGame("Westside Warriors", "2025-11-15", "avg"),
      generateBasketballGame("Eastview Eagles", "2025-11-22", "avg"),
      generateBasketballGame("Northridge Wolves", "2025-12-06", "good"),
      generateBasketballGame("Central Cougars", "2025-12-13", "avg"),
      generateBasketballGame("Lakewood Bears", "2025-12-20", "good"),
      generateBasketballGame("Valley Hawks", "2026-01-10", "good"),
      generateBasketballGame("Summit Storm", "2026-01-17", "great"),
      generateBasketballGame("Hillcrest Knights", "2026-01-24", "good"),
      generateBasketballGame("Westside Warriors", "2026-01-31", "great"),
      generateBasketballGame("Oakdale Tigers", "2026-02-07", "good"),
      generateBasketballGame("Eastview Eagles", "2026-02-14", "great"),
      generateBasketballGame("Central Cougars", "2026-02-21", "great"),
    ];

    // Sophia's basketball games (8 games)
    const sophiaBasketball = [
      generateBasketballGame("Maple Grove Mustangs", "2025-12-05", "good"),
      generateBasketballGame("Cedar Park Panthers", "2025-12-12", "avg"),
      generateBasketballGame("Pine Valley Wildcats", "2025-12-19", "good"),
      generateBasketballGame("Brookfield Bulldogs", "2026-01-09", "great"),
      generateBasketballGame("Silver Lake Sharks", "2026-01-16", "good"),
      generateBasketballGame("Elm Street Rockets", "2026-01-30", "great"),
      generateBasketballGame("Maple Grove Mustangs", "2026-02-06", "great"),
      generateBasketballGame("Cedar Park Panthers", "2026-02-20", "good"),
    ];

    // Jayden's soccer games (8 games)
    const soccerGames = [
      generateSoccerGame("River City FC", "2025-09-13", "avg"),
      generateSoccerGame("Mountain View United", "2025-09-20", "avg"),
      generateSoccerGame("Sunset SC", "2025-10-04", "good"),
      generateSoccerGame("Harbor Town FC", "2025-10-18", "good"),
      generateSoccerGame("Green Valley Strikers", "2025-11-01", "avg"),
      generateSoccerGame("Coastal Waves", "2025-11-15", "great"),
      generateSoccerGame("River City FC", "2025-11-29", "great"),
      generateSoccerGame("Mountain View United", "2025-12-06", "good"),
    ];

    const gameRows = [
      ...basketballGames.map((g) => ({
        user_id: userId,
        athlete_id: marcus?.id || null,
        ...g,
        // Legacy columns for basketball
        minutes: g.stats.minutes,
        points: g.stats.points,
        fg_made: g.stats.fg_made,
        fg_attempted: g.stats.fg_attempted,
        three_made: g.stats.three_made,
        three_attempted: g.stats.three_attempted,
        ft_made: g.stats.ft_made,
        ft_attempted: g.stats.ft_attempted,
        rebounds_off: g.stats.rebounds_off,
        rebounds_def: g.stats.rebounds_def,
        assists: g.stats.assists,
        steals: g.stats.steals,
        blocks: g.stats.blocks,
        turnovers: g.stats.turnovers,
        fouls: g.stats.fouls,
      })),
      ...sophiaBasketball.map((g) => ({
        user_id: userId,
        athlete_id: sophia?.id || null,
        ...g,
        minutes: g.stats.minutes,
        points: g.stats.points,
        fg_made: g.stats.fg_made,
        fg_attempted: g.stats.fg_attempted,
        three_made: g.stats.three_made,
        three_attempted: g.stats.three_attempted,
        ft_made: g.stats.ft_made,
        ft_attempted: g.stats.ft_attempted,
        rebounds_off: g.stats.rebounds_off,
        rebounds_def: g.stats.rebounds_def,
        assists: g.stats.assists,
        steals: g.stats.steals,
        blocks: g.stats.blocks,
        turnovers: g.stats.turnovers,
        fouls: g.stats.fouls,
      })),
      ...soccerGames.map((g) => ({
        user_id: userId,
        athlete_id: jayden?.id || null,
        ...g,
      })),
    ];

    const { data: games, error: gameErr } = await supabase
      .from("games")
      .insert(gameRows)
      .select();

    if (gameErr) {
      console.error("Games seed error:", gameErr);
      results.games_error = 1;
    } else {
      results.games = games?.length || 0;
    }

    // ---- 3. SCHEDULED GAMES (upcoming) ----
    const scheduledRows = [
      {
        user_id: userId,
        athlete_id: marcus?.id || null,
        sport: "basketball",
        opponent: "Lakewood Bears",
        game_date: "2026-03-01",
        game_time: "16:30",
        location: "Lincoln Middle School Gym",
        is_home_game: true,
        notes: "Senior night - arrive early",
        reminder_enabled: true,
        reminder_hours_before: 24,
      },
      {
        user_id: userId,
        athlete_id: marcus?.id || null,
        sport: "basketball",
        opponent: "Summit Storm",
        game_date: "2026-03-07",
        game_time: "18:00",
        location: "Summit Community Center",
        is_home_game: false,
        notes: "Playoff qualifier",
        reminder_enabled: true,
        reminder_hours_before: 24,
      },
      {
        user_id: userId,
        athlete_id: sophia?.id || null,
        sport: "basketball",
        opponent: "Silver Lake Sharks",
        game_date: "2026-03-04",
        game_time: "17:00",
        location: "Silver Lake High School",
        is_home_game: false,
        reminder_enabled: true,
        reminder_hours_before: 12,
      },
      {
        user_id: userId,
        athlete_id: jayden?.id || null,
        sport: "soccer",
        opponent: "Coastal Waves",
        game_date: "2026-03-08",
        game_time: "10:00",
        location: "Riverside Park Field 3",
        is_home_game: true,
        notes: "Spring season opener",
        reminder_enabled: true,
        reminder_hours_before: 24,
      },
      {
        user_id: userId,
        athlete_id: marcus?.id || null,
        sport: "basketball",
        opponent: "Hillcrest Knights",
        game_date: "2026-03-14",
        game_time: "15:00",
        location: "District Tournament - Main Arena",
        is_home_game: false,
        notes: "District championship semifinal",
        reminder_enabled: true,
        reminder_hours_before: 48,
      },
    ];

    const { data: scheduled, error: schedErr } = await supabase
      .from("scheduled_games")
      .insert(scheduledRows)
      .select();

    if (schedErr) {
      console.error("Scheduled games seed error:", schedErr);
      results.scheduled_error = 1;
    } else {
      results.scheduled_games = scheduled?.length || 0;
    }

    // ---- 4. EXPENSES ----
    const expenseRows = [
      { user_id: userId, athlete_id: marcus?.id || null, sport: "basketball", category: "Equipment", description: "Nike Lebron 21 basketball shoes", amount: 164.99, expense_date: "2025-11-02", season: "2025-2026", is_recurring: false },
      { user_id: userId, athlete_id: marcus?.id || null, sport: "basketball", category: "Registration", description: "Lincoln Lions league registration fee", amount: 250.00, expense_date: "2025-10-15", season: "2025-2026", is_recurring: false },
      { user_id: userId, athlete_id: marcus?.id || null, sport: "basketball", category: "Training", description: "Private shooting coach (8 sessions)", amount: 400.00, expense_date: "2025-11-20", season: "2025-2026", is_recurring: false },
      { user_id: userId, athlete_id: marcus?.id || null, sport: "basketball", category: "Travel", description: "Gas & food for away games (Dec)", amount: 85.50, expense_date: "2025-12-31", season: "2025-2026", is_recurring: true },
      { user_id: userId, athlete_id: marcus?.id || null, sport: "basketball", category: "Equipment", description: "Spalding indoor/outdoor basketball", amount: 34.99, expense_date: "2026-01-05", season: "2025-2026", is_recurring: false },
      { user_id: userId, athlete_id: marcus?.id || null, sport: "basketball", category: "Travel", description: "Gas & food for away games (Jan)", amount: 92.00, expense_date: "2026-01-31", season: "2025-2026", is_recurring: true },
      { user_id: userId, athlete_id: sophia?.id || null, sport: "basketball", category: "Registration", description: "AAU spring tournament entry", amount: 175.00, expense_date: "2026-02-01", season: "2025-2026", is_recurring: false },
      { user_id: userId, athlete_id: sophia?.id || null, sport: "basketball", category: "Equipment", description: "Under Armour Curry 12 shoes", amount: 139.99, expense_date: "2025-11-10", season: "2025-2026", is_recurring: false },
      { user_id: userId, athlete_id: jayden?.id || null, sport: "soccer", category: "Equipment", description: "Adidas Predator soccer cleats", amount: 89.99, expense_date: "2025-09-01", season: "Fall 2025", is_recurring: false },
      { user_id: userId, athlete_id: jayden?.id || null, sport: "soccer", category: "Registration", description: "Riverside Rapids rec league fee", amount: 180.00, expense_date: "2025-08-20", season: "Fall 2025", is_recurring: false },
      { user_id: userId, athlete_id: jayden?.id || null, sport: "soccer", category: "Equipment", description: "Shin guards and socks", amount: 32.50, expense_date: "2025-09-01", season: "Fall 2025", is_recurring: false },
      { user_id: userId, athlete_id: marcus?.id || null, sport: "basketball", category: "Camp", description: "Winter basketball skills camp", amount: 325.00, expense_date: "2025-12-26", season: "2025-2026", is_recurring: false },
    ];

    const { data: expenses, error: expErr } = await supabase
      .from("sports_expenses")
      .insert(expenseRows)
      .select();

    if (expErr) {
      console.error("Expenses seed error:", expErr);
      results.expenses_error = 1;
    } else {
      results.expenses = expenses?.length || 0;
    }

    return NextResponse.json({
      message: "Demo data seeded successfully!",
      results,
      athletes: allAthletes?.map((a) => a.name) || [],
    });
  } catch (error) {
    console.error("Seed demo error:", error);
    return NextResponse.json(
      { error: "Seed failed: " + (error as Error).message },
      { status: 500 }
    );
  }
}
