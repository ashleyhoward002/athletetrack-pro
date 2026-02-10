"use client";

import { useEffect, useState } from "react";
import StreakBanner from "@/components/training/StreakBanner";
import toast from "react-hot-toast";
import { SPORT_LIST, SportId } from "@/lib/sports/config";

const RARITY_COLORS: Record<string, string> = {
    common: "border-base-content/20",
    rare: "border-info",
    epic: "border-secondary",
    legendary: "border-warning",
};

const RARITY_BG: Record<string, string> = {
    common: "bg-base-200",
    rare: "bg-info/10",
    epic: "bg-secondary/10",
    legendary: "bg-warning/10",
};

export default function AchievementsPage() {
    const [badges, setBadges] = useState<any[]>([]);
    const [activeChallenges, setActiveChallenges] = useState<any[]>([]);
    const [completedChallenges, setCompletedChallenges] = useState<any[]>([]);
    const [earnedCount, setEarnedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filterSport, setFilterSport] = useState<SportId | "all">("all");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Assign challenges if needed
                await fetch("/api/challenges/assign", { method: "POST" });

                const [badgesRes, challengesRes] = await Promise.all([
                    fetch("/api/badges"),
                    fetch("/api/challenges"),
                ]);

                const badgesData = await badgesRes.json();
                const challengesData = await challengesRes.json();

                setBadges(badgesData.badges || []);
                setEarnedCount(badgesData.earned_count || 0);
                setTotalCount(badgesData.total_count || 0);
                setActiveChallenges(challengesData.active || []);
                setCompletedChallenges(challengesData.completed || []);
            } catch {
                toast.error("Failed to load achievements");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg" />
            </main>
        );
    }

    return (
        <main className="min-h-screen p-4 md:p-8 pb-24">
            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-extrabold">Achievements</h1>
                    <p className="text-base-content/60">
                        Track your streak, complete challenges, and collect badges.
                    </p>
                </div>

                {/* Streak */}
                <StreakBanner />

                {/* Sport Filter */}
                <div className="flex flex-wrap gap-2">
                    <button
                        className={`btn btn-sm ${filterSport === "all" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setFilterSport("all")}
                    >
                        All Sports
                    </button>
                    {SPORT_LIST.map(sport => (
                        <button
                            key={sport.id}
                            className={`btn btn-sm ${filterSport === sport.id ? "btn-primary" : "btn-ghost"}`}
                            onClick={() => setFilterSport(sport.id)}
                        >
                            {sport.icon} {sport.name}
                        </button>
                    ))}
                </div>

                {/* Active Challenges */}
                <div>
                    <h2 className="text-xl font-bold mb-3">Active Challenges</h2>
                    {(() => {
                        const filteredActive = filterSport === "all"
                            ? activeChallenges
                            : activeChallenges.filter(ac => !ac.challenges?.sport || ac.challenges?.sport === filterSport);
                        return filteredActive.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredActive.map((ac) => (
                                <div key={ac.id} className="card bg-base-200">
                                    <div className="card-body p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold">{ac.challenges?.name}</h3>
                                                <p className="text-sm text-base-content/60">
                                                    {ac.challenges?.description}
                                                </p>
                                            </div>
                                            <span className="badge badge-sm badge-warning">
                                                +{ac.challenges?.xp_reward} XP
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>{ac.progress}/{ac.target}</span>
                                                <span>{Math.round((ac.progress / ac.target) * 100)}%</span>
                                            </div>
                                            <progress
                                                className="progress progress-primary w-full"
                                                value={ac.progress}
                                                max={ac.target}
                                            />
                                        </div>
                                        <div className="flex gap-1 mt-1">
                                            <span className="badge badge-xs badge-outline">
                                                {ac.challenges?.type}
                                            </span>
                                            {ac.challenges?.sport && (
                                                <span className="badge badge-xs badge-outline">
                                                    {ac.challenges.sport}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        ) : (
                            <div className="card bg-base-200">
                                <div className="card-body text-center py-8 text-base-content/50">
                                    No active challenges{filterSport !== "all" ? ` for ${filterSport}` : ""}. Complete some drills to earn challenges!
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Badges */}
                <div>
                    <h2 className="text-xl font-bold mb-1">
                        Badges ({earnedCount}/{totalCount})
                    </h2>
                    <p className="text-sm text-base-content/60 mb-3">
                        Earn badges by completing challenges, maintaining streaks, and mastering skills.
                    </p>
                    {badges.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {badges.map((badge) => (
                                <div
                                    key={badge.id}
                                    className={`card border-2 ${
                                        badge.earned
                                            ? RARITY_COLORS[badge.rarity]
                                            : "border-base-content/10 opacity-40 grayscale"
                                    } ${badge.earned ? RARITY_BG[badge.rarity] : "bg-base-200"}`}
                                >
                                    <div className="card-body items-center text-center p-3">
                                        <div className="text-3xl">{badge.icon}</div>
                                        <h4 className="font-bold text-xs">{badge.name}</h4>
                                        <p className="text-xs text-base-content/60 line-clamp-2">
                                            {badge.description}
                                        </p>
                                        <span className="badge badge-xs">
                                            {badge.rarity}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-base-content/50">
                            No badges available yet. Check back soon!
                        </div>
                    )}
                </div>

                {/* Recently Completed Challenges */}
                {(() => {
                    const filteredCompleted = filterSport === "all"
                        ? completedChallenges
                        : completedChallenges.filter(ac => !ac.challenges?.sport || ac.challenges?.sport === filterSport);
                    return filteredCompleted.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold mb-3">Completed Challenges</h2>
                            <div className="space-y-2">
                                {filteredCompleted.map((ac) => (
                                    <div key={ac.id} className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                                        <div>
                                            <span className="font-medium text-sm">{ac.challenges?.name}</span>
                                            {ac.challenges?.sport && (
                                                <span className="badge badge-xs badge-outline ml-2">{ac.challenges.sport}</span>
                                            )}
                                            <span className="text-xs text-base-content/50 ml-2">
                                                {ac.completed_at && new Date(ac.completed_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <span className="badge badge-sm badge-success">
                                            +{ac.challenges?.xp_reward} XP
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })()}
            </div>
        </main>
    );
}
