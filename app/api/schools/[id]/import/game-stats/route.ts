export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import * as XLSX from "xlsx";
import { SportId } from "@/lib/sports/config";

interface GameStatRow {
    player_name?: string;
    jersey_number?: number;
    [key: string]: any;
}

interface ImportResult {
    success: boolean;
    player: string;
    error?: string;
    game_id?: string;
    matched_athlete?: string;
}

// Normalize column names for matching
function normalizeColumnName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Common stat column mappings
const STAT_COLUMN_MAPPINGS: Record<string, string[]> = {
    // Basketball
    points: ["points", "pts", "pt", "score"],
    minutes: ["minutes", "min", "mins", "mp"],
    fg_made: ["fgm", "fgmade", "fieldgoalsmade", "2pm"],
    fg_attempted: ["fga", "fgattempted", "fieldgoalsattempted", "2pa"],
    three_made: ["3pm", "threemade", "3ptmade", "threepointers", "3m"],
    three_attempted: ["3pa", "threeattempted", "3ptattempted", "3a"],
    ft_made: ["ftm", "ftmade", "freethrowsmade", "freethrows"],
    ft_attempted: ["fta", "ftattempted", "freethrowsattempted"],
    rebounds_off: ["oreb", "offreb", "offensiverebounds", "or"],
    rebounds_def: ["dreb", "defreb", "defensiverebounds", "dr"],
    rebounds: ["reb", "rebounds", "totalrebounds", "trb"],
    assists: ["ast", "assists", "a"],
    steals: ["stl", "steals", "st"],
    blocks: ["blk", "blocks", "bl"],
    turnovers: ["to", "turnovers", "tov"],
    fouls: ["pf", "fouls", "personalfouls", "f"],

    // Baseball/Softball
    at_bats: ["ab", "atbats"],
    hits: ["h", "hits"],
    runs: ["r", "runs"],
    rbi: ["rbi", "runsbattedin"],
    doubles: ["2b", "doubles"],
    triples: ["3b", "triples"],
    home_runs: ["hr", "homeruns", "homers"],
    walks: ["bb", "walks"],
    strikeouts: ["k", "so", "strikeouts"],
    stolen_bases: ["sb", "stolenbases"],
    innings_pitched: ["ip", "inningspitched"],
    earned_runs: ["er", "earnedruns"],
    hits_allowed: ["ha", "hitsallowed"],
    walks_allowed: ["bba", "walksallowed"],
    strikeouts_pitched: ["kp", "strikeoutspitched"],

    // Soccer
    goals: ["g", "goals"],
    assists_soccer: ["a", "assists"],
    shots: ["sh", "shots"],
    shots_on_goal: ["sog", "shotsongoal"],
    saves: ["sv", "saves"],
    goals_allowed: ["ga", "goalsallowed"],

    // Football
    passing_yards: ["passyds", "passingyards", "pyds"],
    passing_tds: ["passtd", "passingtds", "ptd"],
    interceptions: ["int", "interceptions"],
    rushing_yards: ["rushyds", "rushingyards", "ryds"],
    rushing_tds: ["rushtd", "rushingtds", "rtd"],
    receiving_yards: ["recyds", "receivingyards"],
    receptions: ["rec", "receptions", "catches"],
    receiving_tds: ["rectd", "receivingtds"],
    tackles: ["tkl", "tackles"],
    sacks: ["sack", "sacks"],
};

// Player identification columns
const PLAYER_COLUMN_MAPPINGS: Record<string, string[]> = {
    player_name: ["name", "player", "playername", "athlete", "studentname"],
    jersey_number: ["jersey", "number", "num", "jerseynumber", "no"],
};

function mapColumns(headers: string[]): { player: Record<string, number>; stats: Record<string, number> } {
    const playerMap: Record<string, number> = {};
    const statsMap: Record<string, number> = {};

    headers.forEach((header, index) => {
        const normalized = normalizeColumnName(header);

        // Check player columns
        for (const [field, variations] of Object.entries(PLAYER_COLUMN_MAPPINGS)) {
            if (variations.includes(normalized)) {
                playerMap[field] = index;
                return;
            }
        }

        // Check stat columns
        for (const [field, variations] of Object.entries(STAT_COLUMN_MAPPINGS)) {
            if (variations.includes(normalized)) {
                statsMap[field] = index;
                return;
            }
        }

        // If not mapped, include as custom stat (if it looks like a number column)
        if (normalized && !["", "total", "avg", "average"].includes(normalized)) {
            statsMap[header.toLowerCase().replace(/\s+/g, "_")] = index;
        }
    });

    return { player: playerMap, stats: statsMap };
}

// POST: import game stats from file
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const schoolId = params.id;

        // Check if user is admin/owner of this school
        const { data: membership } = await supabase
            .from("school_members")
            .select("role")
            .eq("school_id", schoolId)
            .eq("user_id", session.user.id)
            .single();

        if (!membership) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get form data
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const gameDate = formData.get("game_date") as string;
        const opponent = formData.get("opponent") as string;
        const sport = (formData.get("sport") as SportId) || "basketball";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }
        if (!gameDate) {
            return NextResponse.json({ error: "Game date is required" }, { status: 400 });
        }
        if (!opponent) {
            return NextResponse.json({ error: "Opponent name is required" }, { status: 400 });
        }

        // Read file
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        if (rows.length < 2) {
            return NextResponse.json({ error: "File must have headers and at least one data row" }, { status: 400 });
        }

        // Map columns
        const headers = rows[0].map(h => String(h || ""));
        const { player: playerMap, stats: statsMap } = mapColumns(headers);

        if (playerMap.player_name === undefined && playerMap.jersey_number === undefined) {
            return NextResponse.json({
                error: "Could not find player identification column (Name or Jersey Number)",
                detected_columns: headers
            }, { status: 400 });
        }

        // Get school athletes for matching
        const { data: schoolStudents } = await supabase
            .from("school_students")
            .select(`
                id,
                athlete_id,
                athletes (
                    id,
                    name,
                    jersey_number
                )
            `)
            .eq("school_id", schoolId);

        const athletes = (schoolStudents || []).map((s: any) => ({
            student_id: s.id,
            athlete_id: s.athlete_id,
            name: s.athletes?.name?.toLowerCase().trim() || "",
            jersey_number: s.athletes?.jersey_number
        }));

        // Process each row
        const results: ImportResult[] = [];
        const dataRows = rows.slice(1).filter(row => {
            // Filter rows that have at least a player identifier
            const hasName = playerMap.player_name !== undefined && row[playerMap.player_name];
            const hasJersey = playerMap.jersey_number !== undefined && row[playerMap.jersey_number];
            return hasName || hasJersey;
        });

        for (const row of dataRows) {
            const playerName = playerMap.player_name !== undefined
                ? String(row[playerMap.player_name] || "").trim()
                : "";
            const jerseyNumber = playerMap.jersey_number !== undefined
                ? parseInt(row[playerMap.jersey_number]) || null
                : null;

            const playerIdentifier = playerName || `#${jerseyNumber}`;

            // Match athlete
            let matchedAthlete = null;

            // Try matching by name first
            if (playerName) {
                const nameLower = playerName.toLowerCase();
                matchedAthlete = athletes.find(a =>
                    a.name === nameLower ||
                    a.name.includes(nameLower) ||
                    nameLower.includes(a.name)
                );
            }

            // Try matching by jersey number if no name match
            if (!matchedAthlete && jerseyNumber) {
                matchedAthlete = athletes.find(a => a.jersey_number === jerseyNumber);
            }

            if (!matchedAthlete) {
                results.push({
                    success: false,
                    player: playerIdentifier,
                    error: "No matching athlete found in school roster"
                });
                continue;
            }

            // Build stats object
            const gameStats: Record<string, number> = {};
            for (const [statKey, colIndex] of Object.entries(statsMap)) {
                const value = parseFloat(row[colIndex]);
                if (!isNaN(value)) {
                    gameStats[statKey] = value;
                }
            }

            // Handle combined rebounds if separate not provided
            if (gameStats.rebounds && !gameStats.rebounds_off && !gameStats.rebounds_def) {
                // Split evenly as estimate
                gameStats.rebounds_off = Math.floor(gameStats.rebounds * 0.3);
                gameStats.rebounds_def = gameStats.rebounds - gameStats.rebounds_off;
                delete gameStats.rebounds;
            }

            // Build game data
            const gameData: Record<string, any> = {
                user_id: session.user.id,
                athlete_id: matchedAthlete.athlete_id,
                date: gameDate,
                opponent,
                sport,
                stats: gameStats,
            };

            // Add legacy basketball columns
            if (sport === "basketball") {
                gameData.minutes = gameStats.minutes || 0;
                gameData.points = gameStats.points || 0;
                gameData.fg_made = gameStats.fg_made || 0;
                gameData.fg_attempted = gameStats.fg_attempted || 0;
                gameData.three_made = gameStats.three_made || 0;
                gameData.three_attempted = gameStats.three_attempted || 0;
                gameData.ft_made = gameStats.ft_made || 0;
                gameData.ft_attempted = gameStats.ft_attempted || 0;
                gameData.rebounds_off = gameStats.rebounds_off || 0;
                gameData.rebounds_def = gameStats.rebounds_def || 0;
                gameData.assists = gameStats.assists || 0;
                gameData.steals = gameStats.steals || 0;
                gameData.blocks = gameStats.blocks || 0;
                gameData.turnovers = gameStats.turnovers || 0;
                gameData.fouls = gameStats.fouls || 0;
            }

            try {
                const { data: game, error: gameError } = await supabase
                    .from("games")
                    .insert(gameData)
                    .select()
                    .single();

                if (gameError || !game) {
                    results.push({
                        success: false,
                        player: playerIdentifier,
                        error: gameError?.message || "Failed to create game record"
                    });
                    continue;
                }

                results.push({
                    success: true,
                    player: playerIdentifier,
                    game_id: game.id,
                    matched_athlete: matchedAthlete.name
                });

            } catch (err: any) {
                results.push({
                    success: false,
                    player: playerIdentifier,
                    error: err.message || "Unknown error"
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        return NextResponse.json({
            message: `Created ${successCount} game records${failCount > 0 ? `, ${failCount} failed` : ""}`,
            game_info: {
                date: gameDate,
                opponent,
                sport
            },
            results,
            summary: {
                total: results.length,
                success: successCount,
                failed: failCount,
                stats_detected: Object.keys(statsMap)
            }
        });

    } catch (error: any) {
        console.error("Game stats import error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to import game stats" },
            { status: 500 }
        );
    }
}
