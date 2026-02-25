export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface GameStats {
    points?: number;
    rebounds_off?: number;
    rebounds_def?: number;
    assists?: number;
    steals?: number;
    blocks?: number;
    turnovers?: number;
    fg_made?: number;
    fg_attempted?: number;
    three_made?: number;
    three_attempted?: number;
    ft_made?: number;
    ft_attempted?: number;
    minutes?: number;
    stats?: Record<string, number>;
}

interface Athlete {
    id: string;
    name: string;
    position: string | null;
    school: string | null;
    team_name: string | null;
    primary_sport: string;
    jersey_number: number | null;
}

interface Game extends GameStats {
    id: string;
    date: string;
    opponent: string;
    sport: string;
}

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const targetName = body.target_name as string;
        const sport = body.sport as string || "basketball";

        if (!targetName) {
            return NextResponse.json({ error: "target_name is required" }, { status: 400 });
        }

        // Search for athletes matching the name (case-insensitive fuzzy search)
        const { data: athletes, error: athleteError } = await supabase
            .from("athletes")
            .select("id, name, position, school, team_name, primary_sport, jersey_number")
            .ilike("name", `%${targetName}%`)
            .limit(5);

        if (athleteError) {
            console.error("Athlete search error:", athleteError);
            return NextResponse.json({ error: "Failed to search athletes" }, { status: 500 });
        }

        // If no athletes found, return a message
        if (!athletes || athletes.length === 0) {
            return NextResponse.json({
                report: {
                    name: targetName,
                    sport: sport,
                    status: "Not Found",
                    stats: {},
                    strengths: [],
                    weaknesses: [],
                    tendencies: [],
                    notes: `No athlete named "${targetName}" found in the database. Try searching for an athlete you've added to the system.`,
                    source: "database"
                }
            });
        }

        // Use the first matching athlete
        const athlete = athletes[0] as Athlete;

        // Fetch all games for this athlete
        const { data: games, error: gamesError } = await supabase
            .from("games")
            .select("*")
            .eq("athlete_id", athlete.id)
            .order("date", { ascending: false });

        if (gamesError) {
            console.error("Games fetch error:", gamesError);
        }

        const gamesList = (games || []) as Game[];
        const totalGames = gamesList.length;

        if (totalGames === 0) {
            return NextResponse.json({
                report: {
                    name: athlete.name,
                    sport: athlete.primary_sport || sport,
                    status: "No Games",
                    position: athlete.position,
                    school: athlete.school,
                    team: athlete.team_name,
                    jersey: athlete.jersey_number,
                    stats: {},
                    strengths: [],
                    weaknesses: [],
                    tendencies: [],
                    notes: `Found ${athlete.name} but no game data recorded yet. Add some games to get a scouting report.`,
                    source: "database",
                    gamesAnalyzed: 0
                }
            });
        }

        // Calculate real statistics based on sport
        const calculatedStats = calculateStats(gamesList, athlete.primary_sport || sport);

        // If no Gemini key, return just the raw stats
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                report: {
                    name: athlete.name,
                    sport: athlete.primary_sport || sport,
                    status: "Complete",
                    position: athlete.position,
                    school: athlete.school,
                    team: athlete.team_name,
                    jersey: athlete.jersey_number,
                    stats: calculatedStats,
                    strengths: [],
                    weaknesses: [],
                    tendencies: [],
                    notes: "AI analysis unavailable - showing raw statistics only.",
                    source: "database",
                    gamesAnalyzed: totalGames
                }
            });
        }

        // Use AI to analyze the REAL data
        const prompt = `You are an expert sports scout analyzing REAL game data. Based on the following actual statistics from ${totalGames} games, provide a professional scouting report.

ATHLETE INFO:
- Name: ${athlete.name}
- Sport: ${athlete.primary_sport || sport}
- Position: ${athlete.position || "Unknown"}
- School/Team: ${athlete.school || athlete.team_name || "Unknown"}

ACTUAL STATISTICS (per game averages from ${totalGames} games):
${JSON.stringify(calculatedStats, null, 2)}

RECENT GAME LOG (last 5 games):
${JSON.stringify(gamesList.slice(0, 5).map(g => ({
    date: g.date,
    opponent: g.opponent,
    points: g.points,
    rebounds: (g.rebounds_off || 0) + (g.rebounds_def || 0),
    assists: g.assists,
    steals: g.steals,
    blocks: g.blocks
})), null, 2)}

Based on this REAL data, provide analysis in this JSON format:
{
    "strengths": ["3 specific strengths based on the stats - be specific with numbers"],
    "weaknesses": ["2-3 areas for improvement based on the stats"],
    "tendencies": ["2-3 playing tendencies you can identify from the data"],
    "notes": "A 2-3 sentence professional scouting assessment based on the real numbers. Reference specific stats.",
    "projectedCeiling": "Brief assessment of potential"
}

Be analytical and specific. Reference actual numbers from the data. Return only valid JSON.`;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const responseText = response.text() || "";
        const cleanText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        let aiAnalysis = {
            strengths: [] as string[],
            weaknesses: [] as string[],
            tendencies: [] as string[],
            notes: "",
            projectedCeiling: ""
        };

        try {
            aiAnalysis = JSON.parse(cleanText);
        } catch {
            aiAnalysis.notes = "AI analysis parsing failed. Raw stats displayed.";
        }

        return NextResponse.json({
            report: {
                name: athlete.name,
                sport: athlete.primary_sport || sport,
                status: "Complete",
                position: athlete.position,
                school: athlete.school,
                team: athlete.team_name,
                jersey: athlete.jersey_number,
                stats: calculatedStats,
                strengths: aiAnalysis.strengths || [],
                weaknesses: aiAnalysis.weaknesses || [],
                tendencies: aiAnalysis.tendencies || [],
                notes: aiAnalysis.notes || "",
                projectedCeiling: aiAnalysis.projectedCeiling || "",
                source: "database",
                gamesAnalyzed: totalGames,
                matchedAthletes: athletes.map((a: Athlete) => ({ id: a.id, name: a.name }))
            }
        });

    } catch (error) {
        console.error("Scout API error:", error);
        return NextResponse.json({ error: "Failed to generate scouting report" }, { status: 500 });
    }
}

function calculateStats(games: Game[], sport: string): Record<string, string | number> {
    const totalGames = games.length;
    if (totalGames === 0) return {};

    if (sport === "basketball") {
        const totals = games.reduce((acc, game) => ({
            points: acc.points + (game.points || 0),
            rebounds: acc.rebounds + (game.rebounds_off || 0) + (game.rebounds_def || 0),
            assists: acc.assists + (game.assists || 0),
            steals: acc.steals + (game.steals || 0),
            blocks: acc.blocks + (game.blocks || 0),
            turnovers: acc.turnovers + (game.turnovers || 0),
            fgMade: acc.fgMade + (game.fg_made || 0),
            fgAttempted: acc.fgAttempted + (game.fg_attempted || 0),
            threeMade: acc.threeMade + (game.three_made || 0),
            threeAttempted: acc.threeAttempted + (game.three_attempted || 0),
            ftMade: acc.ftMade + (game.ft_made || 0),
            ftAttempted: acc.ftAttempted + (game.ft_attempted || 0),
            minutes: acc.minutes + (game.minutes || 0),
        }), {
            points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0,
            turnovers: 0, fgMade: 0, fgAttempted: 0, threeMade: 0,
            threeAttempted: 0, ftMade: 0, ftAttempted: 0, minutes: 0
        });

        return {
            "PPG": (totals.points / totalGames).toFixed(1),
            "RPG": (totals.rebounds / totalGames).toFixed(1),
            "APG": (totals.assists / totalGames).toFixed(1),
            "SPG": (totals.steals / totalGames).toFixed(1),
            "BPG": (totals.blocks / totalGames).toFixed(1),
            "TPG": (totals.turnovers / totalGames).toFixed(1),
            "FG%": totals.fgAttempted > 0 ? ((totals.fgMade / totals.fgAttempted) * 100).toFixed(1) + "%" : "N/A",
            "3P%": totals.threeAttempted > 0 ? ((totals.threeMade / totals.threeAttempted) * 100).toFixed(1) + "%" : "N/A",
            "FT%": totals.ftAttempted > 0 ? ((totals.ftMade / totals.ftAttempted) * 100).toFixed(1) + "%" : "N/A",
            "MPG": (totals.minutes / totalGames).toFixed(1),
            "Games": totalGames
        };
    }

    // For other sports, aggregate the stats jsonb field
    const allStats: Record<string, number[]> = {};

    games.forEach(game => {
        const gameStats = game.stats || {};
        Object.entries(gameStats).forEach(([key, value]) => {
            if (typeof value === 'number') {
                if (!allStats[key]) allStats[key] = [];
                allStats[key].push(value);
            }
        });
    });

    const avgStats: Record<string, string | number> = { "Games": totalGames };
    Object.entries(allStats).forEach(([key, values]) => {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        avgStats[key] = avg.toFixed(1);
    });

    return avgStats;
}
