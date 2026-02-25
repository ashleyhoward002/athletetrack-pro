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
        const searchWeb = body.search_web !== false; // Default to true

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
        }

        // If athlete found in database, use database stats
        if (athletes && athletes.length > 0) {
            return await generateDatabaseReport(athletes, supabase, sport);
        }

        // If not found in database and web search enabled, search the web
        if (searchWeb && process.env.GEMINI_API_KEY) {
            return await generateWebReport(targetName, sport);
        }

        // No results
        return NextResponse.json({
            report: {
                name: targetName,
                sport: sport,
                status: "Not Found",
                stats: {},
                strengths: [],
                weaknesses: [],
                tendencies: [],
                notes: `No athlete named "${targetName}" found in your database. Add them to track their stats, or enable web search to find public information.`,
                source: "none"
            }
        });

    } catch (error) {
        console.error("Scout API error:", error);
        return NextResponse.json({ error: "Failed to generate scouting report" }, { status: 500 });
    }
}

async function generateWebReport(targetName: string, sport: string) {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({
            report: {
                name: targetName,
                sport: sport,
                status: "Error",
                notes: "GEMINI_API_KEY not configured for web search.",
                source: "web"
            }
        });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    // Use Gemini to search and compile information
    const searchPrompt = `You are a sports scout researcher. Search for and compile information about the athlete "${targetName}" who plays ${sport}.

Find the following information from public sources (MaxPreps, ESPN, Hudl, news articles, social media, school websites):

1. Full name and any nicknames
2. Current school/team and previous schools
3. Position(s) played
4. Class/Grade or graduation year
5. Height and weight if available
6. Key statistics (be specific with numbers - PPG, RPG, APG for basketball, etc.)
7. Recent notable performances or achievements
8. Recruiting status, offers, or commitments if applicable
9. Playing style and strengths
10. Areas for improvement

If you cannot find information about this specific athlete, say so clearly. Do not make up statistics.

Return your findings in this JSON format:
{
    "found": true/false,
    "name": "Full name",
    "school": "Current school",
    "team": "Team name if different",
    "position": "Position(s)",
    "classYear": "Grade/Class year",
    "height": "Height if known",
    "weight": "Weight if known",
    "stats": {
        "PPG": "value or null",
        "RPG": "value or null",
        "APG": "value or null",
        // include relevant stats for the sport
    },
    "recentGames": ["Notable game 1", "Notable game 2"],
    "achievements": ["Achievement 1", "Achievement 2"],
    "recruiting": "Recruiting status/offers if known",
    "strengths": ["Strength 1", "Strength 2", "Strength 3"],
    "weaknesses": ["Area to improve 1", "Area to improve 2"],
    "tendencies": ["Playing tendency 1", "Playing tendency 2"],
    "notes": "2-3 sentence scouting summary",
    "sources": ["Source 1", "Source 2"],
    "lastUpdated": "When this info is from if known"
}

Be thorough but only include verified information. Return only valid JSON.`;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        const result = await model.generateContent(searchPrompt);
        const response = result.response;
        const responseText = response.text() || "";
        const cleanText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        let webData;
        try {
            webData = JSON.parse(cleanText);
        } catch {
            return NextResponse.json({
                report: {
                    name: targetName,
                    sport: sport,
                    status: "Parse Error",
                    notes: "Could not parse web search results. The athlete may not have public stats available.",
                    source: "web"
                }
            });
        }

        if (!webData.found) {
            return NextResponse.json({
                report: {
                    name: targetName,
                    sport: sport,
                    status: "Not Found Online",
                    stats: {},
                    strengths: [],
                    weaknesses: [],
                    tendencies: [],
                    notes: webData.notes || `Could not find public information about "${targetName}". They may not have online stats available yet.`,
                    source: "web"
                }
            });
        }

        // Format stats for display
        const formattedStats: Record<string, string | number> = {};
        if (webData.stats) {
            Object.entries(webData.stats).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== "null") {
                    formattedStats[key] = String(value);
                }
            });
        }
        if (webData.height) formattedStats["Height"] = webData.height;
        if (webData.weight) formattedStats["Weight"] = webData.weight;
        if (webData.classYear) formattedStats["Class"] = webData.classYear;

        return NextResponse.json({
            report: {
                name: webData.name || targetName,
                sport: sport,
                status: "Complete",
                position: webData.position || null,
                school: webData.school || null,
                team: webData.team || null,
                stats: formattedStats,
                recentGames: webData.recentGames || [],
                achievements: webData.achievements || [],
                recruiting: webData.recruiting || null,
                strengths: webData.strengths || [],
                weaknesses: webData.weaknesses || [],
                tendencies: webData.tendencies || [],
                notes: webData.notes || "",
                sources: webData.sources || [],
                lastUpdated: webData.lastUpdated || null,
                source: "web",
                disclaimer: "Stats compiled from public sources. Verify accuracy before making decisions."
            }
        });

    } catch (error) {
        console.error("Web search error:", error);
        return NextResponse.json({
            report: {
                name: targetName,
                sport: sport,
                status: "Search Error",
                notes: "Failed to search for athlete online. Please try again.",
                source: "web"
            }
        });
    }
}

async function generateDatabaseReport(athletes: Athlete[], supabase: any, sport: string) {
    const athlete = athletes[0];

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
