"use client";

import { LeaderboardCategory, UserRank } from "@/types/training";

interface UserRankCardProps {
    userRank: UserRank | null;
    category: LeaderboardCategory;
    loading: boolean;
    userName: string;
    avatarUrl: string | null;
}

const CATEGORY_LABELS: Record<LeaderboardCategory, string> = {
    xp: "XP",
    streaks: "Day Streak",
    drills: "Drills",
    badges: "Badges",
};

function formatValue(value: number, category: LeaderboardCategory): string {
    if (category === "xp") return `${value.toLocaleString()} XP`;
    if (category === "streaks") return `${value}-day streak`;
    if (category === "drills") return `${value} drills`;
    if (category === "badges") return `${value} badges`;
    return String(value);
}

function getOrdinal(n: number): string {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function UserRankCard({ userRank, category, loading, userName, avatarUrl }: UserRankCardProps) {
    if (loading) {
        return (
            <div className="card bg-primary/10 border border-primary/20">
                <div className="card-body flex-row items-center gap-4 py-4">
                    <div className="h-12 w-12 bg-base-300 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-base-300 rounded w-32 animate-pulse" />
                        <div className="h-3 bg-base-300 rounded w-24 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-primary/10 border border-primary/20">
            <div className="card-body flex-row items-center gap-4 py-4">
                {/* Rank */}
                <div className="text-center min-w-[60px]">
                    <div className="text-2xl font-extrabold text-primary">
                        {userRank ? getOrdinal(userRank.rank) : "--"}
                    </div>
                    <div className="text-xs text-base-content/50 uppercase">Your Rank</div>
                </div>

                {/* Divider */}
                <div className="divider divider-horizontal mx-0" />

                {/* User info */}
                <div className="flex items-center gap-3 flex-1">
                    <div className="avatar">
                        <div className="w-10 rounded-full">
                            <img
                                src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6366f1&color=fff&size=40`}
                                alt={userName}
                            />
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold">{userName}</p>
                        <p className="text-sm text-base-content/60">
                            {userRank ? formatValue(userRank.value, category) : `0 ${CATEGORY_LABELS[category]}`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
