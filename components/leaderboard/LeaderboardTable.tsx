"use client";

import { LeaderboardCategory, LeaderboardEntry } from "@/types/training";

interface LeaderboardTableProps {
    entries: LeaderboardEntry[];
    category: LeaderboardCategory;
    currentUserId: string;
    loading: boolean;
}

const MEDAL_STYLES: Record<number, string> = {
    1: "badge badge-warning font-bold",
    2: "badge bg-gray-300 text-gray-800 font-bold",
    3: "badge bg-amber-700 text-white font-bold",
};

export default function LeaderboardTable({ entries, category, currentUserId, loading }: LeaderboardTableProps) {
    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="card bg-base-200">
                <div className="card-body items-center text-center py-12">
                    <div className="text-4xl mb-2">🏆</div>
                    <h3 className="font-bold text-lg">No Rankings Yet</h3>
                    <p className="text-base-content/60">
                        Complete drills and challenges to start climbing the leaderboard!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
                <thead>
                    <tr>
                        <th className="w-16">Rank</th>
                        <th>Athlete</th>
                        {category === "xp" && (
                            <>
                                <th className="text-right">Level</th>
                                <th className="text-right">XP</th>
                                <th className="text-right hidden sm:table-cell">Drills</th>
                            </>
                        )}
                        {category === "streaks" && (
                            <>
                                <th className="text-right">Current</th>
                                <th className="text-right">Best</th>
                            </>
                        )}
                        {category === "drills" && (
                            <>
                                <th className="text-right">Completed</th>
                                <th className="text-right hidden sm:table-cell">XP Earned</th>
                            </>
                        )}
                        {category === "badges" && (
                            <th className="text-right">Earned</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {entries.map((entry) => {
                        const isMe = entry.user_id === currentUserId;
                        const rank = Number(entry.rank);
                        return (
                            <tr
                                key={entry.user_id}
                                className={isMe ? "bg-primary/10" : ""}
                            >
                                <td>
                                    {MEDAL_STYLES[rank] ? (
                                        <span className={MEDAL_STYLES[rank]}>
                                            {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                                        </span>
                                    ) : (
                                        <span className="font-mono text-base-content/70">#{rank}</span>
                                    )}
                                </td>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="w-8 rounded-full">
                                                <img
                                                    src={
                                                        entry.avatar_url ||
                                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.display_name)}&background=6366f1&color=fff&size=32`
                                                    }
                                                    alt={entry.display_name}
                                                />
                                            </div>
                                        </div>
                                        <span className={`font-medium ${isMe ? "text-primary font-bold" : ""}`}>
                                            {entry.display_name}
                                            {isMe && <span className="text-xs ml-1 text-primary">(You)</span>}
                                        </span>
                                    </div>
                                </td>
                                {category === "xp" && (
                                    <>
                                        <td className="text-right">
                                            <span className="badge badge-sm badge-outline">Lv.{entry.level}</span>
                                        </td>
                                        <td className="text-right font-semibold">
                                            {(entry.total_xp || 0).toLocaleString()}
                                        </td>
                                        <td className="text-right hidden sm:table-cell text-base-content/60">
                                            {entry.drill_count || 0}
                                        </td>
                                    </>
                                )}
                                {category === "streaks" && (
                                    <>
                                        <td className="text-right font-semibold">
                                            🔥 {entry.current_streak || 0}
                                        </td>
                                        <td className="text-right text-base-content/60">
                                            {entry.longest_streak || 0}
                                        </td>
                                    </>
                                )}
                                {category === "drills" && (
                                    <>
                                        <td className="text-right font-semibold">
                                            {(entry.drills_completed || 0).toLocaleString()}
                                        </td>
                                        <td className="text-right hidden sm:table-cell text-base-content/60">
                                            {(entry.total_xp_earned || 0).toLocaleString()} XP
                                        </td>
                                    </>
                                )}
                                {category === "badges" && (
                                    <td className="text-right font-semibold">
                                        🏅 {entry.badges_earned || 0}
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
