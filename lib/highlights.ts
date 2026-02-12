// Highlight detection and card data utilities

import { SportId, getSportConfig } from "./sports/config";

export interface GameStats {
    id: string;
    date: string;
    opponent: string;
    sport: SportId;
    stats: Record<string, number>;
}

export interface CareerHigh {
    statKey: string;
    statLabel: string;
    value: number;
    previousHigh: number;
    isNew: boolean;
}

export interface HighlightCardData {
    type: "game" | "career_high" | "weekly_recap" | "season_summary";
    sport: SportId;
    athleteName: string;
    date: string;
    opponent?: string;
    stats: { label: string; value: string | number; highlight?: boolean }[];
    careerHighs?: CareerHigh[];
    title?: string;
    subtitle?: string;
    accentColor?: string;
}

// Key stats to track for career highs per sport
const CAREER_HIGH_STATS: Record<SportId, string[]> = {
    basketball: ["points", "rebounds_off", "rebounds_def", "assists", "steals", "blocks"],
    baseball: ["hits", "runs", "rbi", "home_runs", "stolen_bases", "strikeouts_pitched"],
    soccer: ["goals", "assists", "shots_on_target", "saves", "tackles"],
    football: ["passing_yards", "rushing_yards", "receiving_yards", "touchdowns", "tackles", "sacks"],
    tennis: ["aces", "winners", "games_won", "sets_won"],
    volleyball: ["kills", "assists", "blocks", "digs", "aces"],
};

/**
 * Detect career highs by comparing current game stats to historical games
 */
export function detectCareerHighs(
    currentGame: GameStats,
    historicalGames: GameStats[]
): CareerHigh[] {
    const sport = currentGame.sport;
    const config = getSportConfig(sport);
    const statsToCheck = CAREER_HIGH_STATS[sport] || [];
    const careerHighs: CareerHigh[] = [];

    for (const statKey of statsToCheck) {
        const currentValue = currentGame.stats[statKey] || 0;
        if (currentValue === 0) continue;

        // Find the previous high for this stat
        let previousHigh = 0;
        for (const game of historicalGames) {
            if (game.id === currentGame.id) continue;
            const value = game.stats?.[statKey] || 0;
            if (value > previousHigh) {
                previousHigh = value;
            }
        }

        // Check if current value is a new career high
        if (currentValue > previousHigh) {
            const statField = config.statFields.find((f) => f.key === statKey);
            careerHighs.push({
                statKey,
                statLabel: statField?.label || statKey,
                value: currentValue,
                previousHigh,
                isNew: true,
            });
        }
    }

    return careerHighs;
}

/**
 * Calculate total rebounds for basketball
 */
function getTotalRebounds(stats: Record<string, number>): number {
    return (stats.rebounds_off || 0) + (stats.rebounds_def || 0);
}

/**
 * Build highlight card data for a game
 */
export function buildGameHighlightCard(
    game: GameStats,
    athleteName: string,
    careerHighs: CareerHigh[] = []
): HighlightCardData {
    const config = getSportConfig(game.sport);
    const stats: { label: string; value: string | number; highlight?: boolean }[] = [];

    // Get the most impressive stats based on sport
    if (game.sport === "basketball") {
        stats.push({
            label: "PTS",
            value: game.stats.points || 0,
            highlight: careerHighs.some((ch) => ch.statKey === "points"),
        });
        stats.push({
            label: "REB",
            value: getTotalRebounds(game.stats),
            highlight: careerHighs.some((ch) => ch.statKey === "rebounds_off" || ch.statKey === "rebounds_def"),
        });
        stats.push({
            label: "AST",
            value: game.stats.assists || 0,
            highlight: careerHighs.some((ch) => ch.statKey === "assists"),
        });
    } else if (game.sport === "soccer") {
        stats.push({
            label: "Goals",
            value: game.stats.goals || 0,
            highlight: careerHighs.some((ch) => ch.statKey === "goals"),
        });
        stats.push({
            label: "Assists",
            value: game.stats.assists || 0,
            highlight: careerHighs.some((ch) => ch.statKey === "assists"),
        });
        stats.push({
            label: "Shots",
            value: game.stats.shots_on_target || 0,
        });
    } else if (game.sport === "baseball") {
        stats.push({
            label: "Hits",
            value: game.stats.hits || 0,
            highlight: careerHighs.some((ch) => ch.statKey === "hits"),
        });
        stats.push({
            label: "RBI",
            value: game.stats.rbi || 0,
            highlight: careerHighs.some((ch) => ch.statKey === "rbi"),
        });
        stats.push({
            label: "Runs",
            value: game.stats.runs || 0,
            highlight: careerHighs.some((ch) => ch.statKey === "runs"),
        });
    } else if (game.sport === "football") {
        if ((game.stats.passing_yards || 0) > 0) {
            stats.push({ label: "Pass YDs", value: game.stats.passing_yards || 0 });
        }
        if ((game.stats.rushing_yards || 0) > 0) {
            stats.push({ label: "Rush YDs", value: game.stats.rushing_yards || 0 });
        }
        if ((game.stats.receiving_yards || 0) > 0) {
            stats.push({ label: "Rec YDs", value: game.stats.receiving_yards || 0 });
        }
        stats.push({
            label: "TDs",
            value: game.stats.touchdowns || 0,
            highlight: careerHighs.some((ch) => ch.statKey === "touchdowns"),
        });
    } else if (game.sport === "volleyball") {
        stats.push({
            label: "Kills",
            value: game.stats.kills || 0,
            highlight: careerHighs.some((ch) => ch.statKey === "kills"),
        });
        stats.push({
            label: "Assists",
            value: game.stats.assists || 0,
        });
        stats.push({
            label: "Digs",
            value: game.stats.digs || 0,
        });
    } else if (game.sport === "tennis") {
        stats.push({
            label: "Aces",
            value: game.stats.aces || 0,
        });
        stats.push({
            label: "Winners",
            value: game.stats.winners || 0,
        });
        stats.push({
            label: "Games Won",
            value: game.stats.games_won || 0,
        });
    }

    const hasCareerHigh = careerHighs.length > 0;

    return {
        type: hasCareerHigh ? "career_high" : "game",
        sport: game.sport,
        athleteName,
        date: game.date,
        opponent: game.opponent,
        stats,
        careerHighs: hasCareerHigh ? careerHighs : undefined,
        title: hasCareerHigh ? "Career High!" : "Game Highlight",
        subtitle: `vs ${game.opponent}`,
    };
}

/**
 * Build weekly recap card data
 */
export function buildWeeklyRecapCard(
    games: GameStats[],
    athleteName: string,
    sport: SportId,
    weekLabel: string
): HighlightCardData {
    const config = getSportConfig(sport);
    const gameCount = games.length;

    // Calculate totals/averages
    const totals: Record<string, number> = {};
    for (const game of games) {
        for (const [key, value] of Object.entries(game.stats || {})) {
            totals[key] = (totals[key] || 0) + (value || 0);
        }
    }

    const stats: { label: string; value: string | number }[] = [];

    if (sport === "basketball") {
        const avgPts = gameCount > 0 ? (totals.points || 0) / gameCount : 0;
        const avgReb = gameCount > 0 ? (getTotalRebounds(totals)) / gameCount : 0;
        const avgAst = gameCount > 0 ? (totals.assists || 0) / gameCount : 0;

        stats.push({ label: "AVG PTS", value: avgPts.toFixed(1) });
        stats.push({ label: "AVG REB", value: avgReb.toFixed(1) });
        stats.push({ label: "AVG AST", value: avgAst.toFixed(1) });
    } else if (sport === "soccer") {
        stats.push({ label: "Goals", value: totals.goals || 0 });
        stats.push({ label: "Assists", value: totals.assists || 0 });
        stats.push({ label: "Games", value: gameCount });
    } else {
        // Generic fallback
        stats.push({ label: "Games", value: gameCount });
    }

    return {
        type: "weekly_recap",
        sport,
        athleteName,
        date: weekLabel,
        stats,
        title: "Week in Review",
        subtitle: `${gameCount} game${gameCount !== 1 ? "s" : ""} played`,
    };
}

// Sport accent colors
export const SPORT_COLORS: Record<SportId, { primary: string; secondary: string; gradient: string }> = {
    basketball: {
        primary: "#f97316", // Orange
        secondary: "#ea580c",
        gradient: "from-orange-500 to-red-600",
    },
    baseball: {
        primary: "#dc2626", // Red
        secondary: "#b91c1c",
        gradient: "from-red-500 to-red-700",
    },
    soccer: {
        primary: "#22c55e", // Green
        secondary: "#16a34a",
        gradient: "from-green-500 to-emerald-600",
    },
    football: {
        primary: "#8b5cf6", // Purple
        secondary: "#7c3aed",
        gradient: "from-purple-500 to-indigo-600",
    },
    tennis: {
        primary: "#eab308", // Yellow
        secondary: "#ca8a04",
        gradient: "from-yellow-400 to-lime-500",
    },
    volleyball: {
        primary: "#3b82f6", // Blue
        secondary: "#2563eb",
        gradient: "from-blue-500 to-cyan-500",
    },
};

export const SPORT_EMOJI: Record<SportId, string> = {
    basketball: "🏀",
    baseball: "⚾",
    soccer: "⚽",
    football: "🏈",
    tennis: "🎾",
    volleyball: "🏐",
};
