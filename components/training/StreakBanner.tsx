"use client";

import { useEffect, useState } from "react";
import { xpToNextLevel } from "@/types/training";

interface StreakData {
    current_streak: number;
    longest_streak: number;
    total_xp: number;
    level: number;
}

interface LevelInfo {
    level: number;
    xp_in_level: number;
    xp_needed: number;
    progress: number;
}

export default function StreakBanner() {
    const [streak, setStreak] = useState<StreakData | null>(null);
    const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/streaks")
            .then((r) => r.json())
            .then((data) => {
                setStreak(data.streak);
                setLevelInfo(data.level_info);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="card bg-base-200">
                <div className="card-body py-3 flex-row items-center gap-4">
                    <span className="loading loading-spinner loading-sm" />
                </div>
            </div>
        );
    }

    if (!streak) return null;

    const info = levelInfo || xpToNextLevel(streak.total_xp);

    return (
        <div className="card bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30">
            <div className="card-body py-3 px-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    {/* Streak */}
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">
                            {streak.current_streak > 0 ? "🔥" : "❄️"}
                        </div>
                        <div>
                            <div className="text-lg font-bold">
                                {streak.current_streak} Day Streak
                            </div>
                            <div className="text-xs text-base-content/60">
                                Best: {streak.longest_streak} days
                            </div>
                        </div>
                    </div>

                    {/* Level & XP */}
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="badge badge-primary badge-lg font-bold">
                                LVL {"level" in info ? info.level : (info as any).currentLevel}
                            </div>
                        </div>
                        <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                                <span>{streak.total_xp} XP</span>
                                <span>
                                    {"xp_in_level" in info
                                        ? `${info.xp_in_level}/${info.xp_needed}`
                                        : `${(info as any).xpInCurrentLevel}/${(info as any).xpNeededForNext}`}
                                </span>
                            </div>
                            <progress
                                className="progress progress-warning w-full"
                                value={
                                    "progress" in info
                                        ? info.progress * 100
                                        : (info as any).progress * 100
                                }
                                max={100}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
