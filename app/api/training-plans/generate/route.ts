export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SportId, getSportConfig, sumStats } from "@/lib/sports/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await req.json();
        const sport = (body.sport || "basketball") as SportId;
        const weeks = body.weeks || 2;

        const config = getSportConfig(sport);

        // 1. Fetch user's games
        const { data: games } = await supabase
            .from("games")
            .select("stats")
            .eq("user_id", userId)
            .eq("sport", sport)
            .order("date", { ascending: false })
            .limit(20);

        const gameCount = games?.length || 0;
        const totals = gameCount > 0 ? sumStats(games!.map((g) => ({ stats: g.stats || {} }))) : {};

        // 2. Compute skill ratings
        const skillRatings = config.skillAreas.map((area) => ({
            skill_area: area.key,
            label: area.label,
            rating: area.computeRating(totals, gameCount),
        }));

        // 3. Compute averages
        const averages: Record<string, string> = {};
        for (const card of config.averageCards) {
            const value = card.compute(totals, gameCount);
            averages[card.key] = `${card.label}: ${card.format(value)}`;
        }

        // 4. Fetch available drills
        const { data: drills } = await supabase
            .from("drills")
            .select("id, name, category, difficulty, duration_minutes, sets, reps")
            .eq("sport", sport)
            .limit(50);

        const drillsList = (drills || [])
            .map((d) => `- "${d.name}" (${d.category}, ${d.difficulty}, ${d.duration_minutes}min, ${d.sets}x${d.reps})`)
            .join("\n");

        // 5. Call Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are an expert ${config.name} coach creating a personalized training plan.

ATHLETE STATS (last ${gameCount} games):
${Object.values(averages).join("\n")}

SKILL RATINGS (1-100):
${skillRatings.map((r) => `${r.label}: ${r.rating}`).join("\n")}

AVAILABLE DRILLS:
${drillsList || "No drills available yet - suggest generic drill names."}

Generate a ${weeks}-week training plan that:
1. Identifies top 3 weaknesses based on the stats
2. Creates daily workouts (5-6 days/week with 1-2 rest days) focusing on improvement areas
3. Balances skill development with conditioning
4. Uses the available drills by EXACT name where possible

Return ONLY valid JSON with this structure (no markdown, no code blocks):
{
  "name": "string - a descriptive plan name",
  "analysis": {
    "weaknesses": [{"area": "string", "score": number, "detail": "string"}],
    "strengths": [{"area": "string", "score": number, "detail": "string"}],
    "focus_areas": ["string"]
  },
  "weeks": [{
    "week_number": 1,
    "days": [{
      "day_number": 1,
      "name": "string - e.g. Shooting Focus",
      "rest_day": false,
      "drills": [{"drill_name": "string - exact drill name", "sets": 3, "reps": 10, "notes": "string"}]
    }]
  }]
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse the JSON response
        let parsed;
        try {
            // Try direct parse first, then try extracting JSON from markdown
            const cleanText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            parsed = JSON.parse(cleanText);
        } catch {
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }

        // 6. Create workout program
        const { data: program, error: programError } = await supabase
            .from("workout_programs")
            .insert({
                user_id: userId,
                sport,
                name: parsed.name || `AI ${config.name} Plan`,
                description: `AI-generated plan focusing on: ${parsed.analysis?.focus_areas?.join(", ") || "overall improvement"}`,
                difficulty: "Pro",
                duration_weeks: weeks,
                is_ai_generated: true,
                source: "ai",
            })
            .select()
            .single();

        if (programError) throw programError;

        // 7. Create program days and link drills
        const drillMap = new Map((drills || []).map((d) => [d.name.toLowerCase(), d]));

        for (const week of parsed.weeks || []) {
            for (const day of week.days || []) {
                const { data: programDay } = await supabase
                    .from("program_days")
                    .insert({
                        program_id: program.id,
                        day_number: day.day_number,
                        week_number: week.week_number,
                        name: day.name || null,
                        rest_day: day.rest_day || false,
                    })
                    .select()
                    .single();

                if (programDay && !day.rest_day && day.drills) {
                    for (let i = 0; i < day.drills.length; i++) {
                        const drillRef = day.drills[i];
                        const matchedDrill = drillMap.get(drillRef.drill_name?.toLowerCase());
                        if (matchedDrill) {
                            await supabase.from("program_day_drills").insert({
                                program_day_id: programDay.id,
                                drill_id: matchedDrill.id,
                                order_index: i,
                                sets_override: drillRef.sets || null,
                                reps_override: drillRef.reps || null,
                                notes: drillRef.notes || null,
                            });
                        }
                    }
                }
            }
        }

        // 8. Create training plan record
        const { data: plan, error: planError } = await supabase
            .from("training_plans")
            .insert({
                user_id: userId,
                sport,
                name: parsed.name || `AI ${config.name} Plan`,
                ai_analysis: parsed.analysis || null,
                program_id: program.id,
            })
            .select()
            .single();

        if (planError) throw planError;

        // 9. Save skill ratings for history
        for (const sr of skillRatings) {
            await supabase.from("skill_ratings").insert({
                user_id: userId,
                sport,
                skill_area: sr.skill_area,
                rating: Math.round(sr.rating),
                source: "game_derived",
            });
        }

        return NextResponse.json({ plan, program }, { status: 201 });
    } catch (error) {
        console.error("POST /api/training-plans/generate error:", error);
        return NextResponse.json({ error: "Failed to generate training plan" }, { status: 500 });
    }
}
