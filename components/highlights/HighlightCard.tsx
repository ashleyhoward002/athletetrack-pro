"use client";

import { forwardRef } from "react";
import { HighlightCardData, SPORT_COLORS, SPORT_EMOJI } from "@/lib/highlights";

interface HighlightCardProps {
    data: HighlightCardData;
    format?: "square" | "story" | "wide";
}

const HighlightCard = forwardRef<HTMLDivElement, HighlightCardProps>(
    ({ data, format = "square" }, ref) => {
        const colors = SPORT_COLORS[data.sport];
        const emoji = SPORT_EMOJI[data.sport];

        const formatDate = (dateStr: string) => {
            // Check if it's already a formatted string (like "Week of Mar 1")
            if (dateStr.includes("Week") || dateStr.includes("Season")) {
                return dateStr;
            }
            const date = new Date(dateStr + "T00:00:00");
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        };

        // Dimensions based on format
        const dimensions = {
            square: { width: 400, height: 400, padding: "p-6" },
            story: { width: 360, height: 640, padding: "p-8" },
            wide: { width: 600, height: 315, padding: "p-6" },
        }[format];

        const isCareerHigh = data.type === "career_high";
        const isWeeklyRecap = data.type === "weekly_recap";

        return (
            <div
                ref={ref}
                className={`relative overflow-hidden ${dimensions.padding} bg-gradient-to-br ${colors.gradient}`}
                style={{
                    width: dimensions.width,
                    height: dimensions.height,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                }}
            >
                {/* Background pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: "24px 24px",
                    }}
                />

                {/* Glow effect for career highs */}
                {isCareerHigh && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-300/30 rounded-full blur-3xl" />
                )}

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col text-white">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl">{emoji}</span>
                            <span className="text-sm font-medium opacity-90 uppercase tracking-wider">
                                {data.sport}
                            </span>
                        </div>
                        {isCareerHigh && (
                            <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                                <span>🔥</span>
                                <span>CAREER HIGH</span>
                            </div>
                        )}
                        {isWeeklyRecap && (
                            <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                                WEEKLY RECAP
                            </div>
                        )}
                    </div>

                    {/* Main content - centered */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        {/* Athlete name */}
                        <h2
                            className="font-extrabold uppercase tracking-tight"
                            style={{ fontSize: format === "story" ? "2rem" : "1.75rem" }}
                        >
                            {data.athleteName}
                        </h2>

                        {/* Opponent/subtitle */}
                        {data.subtitle && (
                            <p className="text-white/80 text-lg mt-1">{data.subtitle}</p>
                        )}

                        {/* Stats */}
                        <div
                            className={`flex items-center justify-center gap-${format === "wide" ? "8" : "6"} mt-6`}
                        >
                            {data.stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div
                                        className={`font-black ${stat.highlight ? "text-yellow-300" : "text-white"}`}
                                        style={{
                                            fontSize: format === "story" ? "3.5rem" : "3rem",
                                            lineHeight: 1,
                                            textShadow: stat.highlight
                                                ? "0 0 20px rgba(253, 224, 71, 0.5)"
                                                : "none",
                                        }}
                                    >
                                        {stat.value}
                                    </div>
                                    <div className="text-white/70 text-sm font-semibold uppercase tracking-wider mt-1">
                                        {stat.label}
                                    </div>
                                    {stat.highlight && (
                                        <div className="text-yellow-300 text-xs mt-1">NEW HIGH!</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Career high details */}
                        {isCareerHigh && data.careerHighs && data.careerHighs.length > 0 && (
                            <div className="mt-4 text-sm text-white/70">
                                {data.careerHighs.map((ch, i) => (
                                    <span key={ch.statKey}>
                                        {i > 0 && " • "}
                                        Previous {ch.statLabel}: {ch.previousHigh}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">{formatDate(data.date)}</span>
                        <div className="flex items-center gap-1 text-white/50">
                            <span className="font-semibold">AthleteTrack</span>
                            <span>Pro</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

HighlightCard.displayName = "HighlightCard";

export default HighlightCard;
