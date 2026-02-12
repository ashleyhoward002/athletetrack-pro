"use client";

import { forwardRef } from "react";

interface FamilyProgressCardProps {
    athleteName: string;
    sport: string;
    period: string; // e.g., "March 2026" or "Spring 2026 Season"
    stats: {
        gamesPlayed: number;
        avgPoints: number;
        avgRebounds?: number;
        avgAssists?: number;
    };
    progress?: {
        label: string;
        before: number;
        after: number;
    }[];
    achievements?: string[];
}

const SPORT_COLORS: Record<string, { gradient: string; accent: string }> = {
    basketball: { gradient: "from-orange-500 to-red-600", accent: "#f97316" },
    baseball: { gradient: "from-red-500 to-red-700", accent: "#dc2626" },
    soccer: { gradient: "from-green-500 to-emerald-600", accent: "#22c55e" },
    football: { gradient: "from-purple-500 to-indigo-600", accent: "#8b5cf6" },
    tennis: { gradient: "from-yellow-400 to-lime-500", accent: "#eab308" },
    volleyball: { gradient: "from-blue-500 to-cyan-500", accent: "#3b82f6" },
};

const SPORT_EMOJI: Record<string, string> = {
    basketball: "🏀",
    baseball: "⚾",
    soccer: "⚽",
    football: "🏈",
    tennis: "🎾",
    volleyball: "🏐",
};

const FamilyProgressCard = forwardRef<HTMLDivElement, FamilyProgressCardProps>(
    ({ athleteName, sport, period, stats, progress, achievements }, ref) => {
        const colors = SPORT_COLORS[sport] || SPORT_COLORS.basketball;
        const emoji = SPORT_EMOJI[sport] || "🏆";

        return (
            <div
                ref={ref}
                className={`relative overflow-hidden p-8 bg-gradient-to-br ${colors.gradient}`}
                style={{
                    width: 400,
                    height: 500,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                }}
            >
                {/* Background pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: "20px 20px",
                    }}
                />

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col text-white">
                    {/* Header */}
                    <div className="text-center">
                        <div className="text-5xl mb-2">{emoji}</div>
                        <h2 className="text-2xl font-extrabold uppercase tracking-tight">
                            {athleteName}
                        </h2>
                        <p className="text-white/70 text-sm mt-1">{period}</p>
                    </div>

                    {/* Main Stats */}
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="grid grid-cols-2 gap-4 my-6">
                            <div className="text-center bg-white/10 rounded-xl p-4">
                                <div className="text-4xl font-black">{stats.gamesPlayed}</div>
                                <div className="text-white/70 text-sm">Games</div>
                            </div>
                            <div className="text-center bg-white/10 rounded-xl p-4">
                                <div className="text-4xl font-black">{stats.avgPoints.toFixed(1)}</div>
                                <div className="text-white/70 text-sm">Avg Points</div>
                            </div>
                        </div>

                        {/* Progress indicators */}
                        {progress && progress.length > 0 && (
                            <div className="space-y-2">
                                {progress.slice(0, 2).map((p, i) => {
                                    const change = p.after - p.before;
                                    const isPositive = change > 0;
                                    return (
                                        <div key={i} className="flex items-center justify-between bg-white/10 rounded-lg px-4 py-2">
                                            <span className="text-sm">{p.label}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white/50">{p.before.toFixed(1)}</span>
                                                <span>→</span>
                                                <span className="font-bold">{p.after.toFixed(1)}</span>
                                                <span className={`text-sm ${isPositive ? "text-green-300" : "text-red-300"}`}>
                                                    {isPositive ? "↑" : "↓"}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Achievements */}
                        {achievements && achievements.length > 0 && (
                            <div className="mt-4 text-center">
                                <p className="text-white/60 text-xs uppercase tracking-wider mb-2">Achievements</p>
                                <div className="flex justify-center gap-2 flex-wrap">
                                    {achievements.slice(0, 3).map((achievement, i) => (
                                        <span key={i} className="badge bg-white/20 border-none text-white text-xs">
                                            {achievement}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-center">
                        <p className="text-white/50 text-xs">
                            Made with ❤️ by AthleteTrack Pro
                        </p>
                    </div>
                </div>
            </div>
        );
    }
);

FamilyProgressCard.displayName = "FamilyProgressCard";

export default FamilyProgressCard;
