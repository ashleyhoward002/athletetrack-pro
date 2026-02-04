"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StreakBanner from "@/components/training/StreakBanner";
import ProgramCard from "@/components/training/ProgramCard";
import { SPORT_LIST, SportId } from "@/lib/sports/config";

export default function TrainingPage() {
    const [programs, setPrograms] = useState<any[]>([]);
    const [recentCompletions, setRecentCompletions] = useState<any[]>([]);
    const [selectedSport, setSelectedSport] = useState<SportId | "all">("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const sportParam = selectedSport !== "all" ? `?sport=${selectedSport}` : "";
                const [programsRes, completionsRes] = await Promise.all([
                    fetch(`/api/programs${sportParam}`),
                    fetch("/api/drill-completions?limit=10"),
                ]);

                const programsData = await programsRes.json();
                const completionsData = await completionsRes.json();

                setPrograms(programsData.programs || []);
                setRecentCompletions(completionsData.completions || []);
            } catch {
                setPrograms([]);
                setRecentCompletions([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedSport]);

    const activePrograms = programs.filter((p) => p.status === "active");
    const completedPrograms = programs.filter((p) => p.status === "completed");

    return (
        <main className="min-h-screen p-4 md:p-8 pb-24">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold">Training Hub</h1>
                        <p className="text-base-content/60">
                            Track your workouts, build programs, and level up your game.
                        </p>
                    </div>
                    <Link href="/dashboard/training/programs/new" className="btn btn-primary">
                        + New Program
                    </Link>
                </div>

                {/* Streak Banner */}
                <StreakBanner />

                {/* Sport Filter */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        className={`btn btn-sm ${selectedSport === "all" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setSelectedSport("all")}
                    >
                        All Sports
                    </button>
                    {SPORT_LIST.map((s) => (
                        <button
                            key={s.id}
                            className={`btn btn-sm ${selectedSport === s.id ? "btn-primary" : "btn-ghost"}`}
                            onClick={() => setSelectedSport(s.id)}
                        >
                            {s.icon} {s.name}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Active Programs */}
                            <div>
                                <h2 className="text-xl font-bold mb-3">Active Programs</h2>
                                {activePrograms.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {activePrograms.map((p) => (
                                            <ProgramCard key={p.id} program={p} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="card bg-base-200">
                                        <div className="card-body text-center py-8">
                                            <p className="text-base-content/50">
                                                No active programs.
                                            </p>
                                            <Link
                                                href="/dashboard/training/programs/new"
                                                className="btn btn-sm btn-primary mt-2"
                                            >
                                                Create Your First Program
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Completed Programs */}
                            {completedPrograms.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-bold mb-3">Completed Programs</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {completedPrograms.map((p) => (
                                            <ProgramCard key={p.id} program={p} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Recent Activity */}
                        <div className="space-y-6">
                            <div className="card bg-base-200">
                                <div className="card-body">
                                    <h3 className="card-title text-lg">Recent Activity</h3>
                                    {recentCompletions.length > 0 ? (
                                        <div className="space-y-3">
                                            {recentCompletions.map((c: any) => (
                                                <div
                                                    key={c.id}
                                                    className="flex items-center justify-between text-sm"
                                                >
                                                    <div>
                                                        <div className="font-medium">
                                                            {c.drills?.name || "Drill"}
                                                        </div>
                                                        <div className="text-xs text-base-content/50">
                                                            {new Date(c.completed_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <span className="badge badge-sm badge-warning">
                                                        +{c.xp_earned} XP
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-base-content/50">
                                            No recent activity. Complete a drill to get started!
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="card bg-base-200">
                                <div className="card-body">
                                    <h3 className="card-title text-lg">Quick Links</h3>
                                    <div className="space-y-2">
                                        <Link
                                            href="/dashboard/drills"
                                            className="btn btn-sm btn-ghost justify-start w-full"
                                        >
                                            Drill Library
                                        </Link>
                                        <Link
                                            href="/dashboard/skills"
                                            className="btn btn-sm btn-ghost justify-start w-full"
                                        >
                                            Skill Trees
                                        </Link>
                                        <Link
                                            href="/dashboard/form-analysis"
                                            className="btn btn-sm btn-ghost justify-start w-full"
                                        >
                                            Form Analysis
                                        </Link>
                                        <Link
                                            href="/dashboard/achievements"
                                            className="btn btn-sm btn-ghost justify-start w-full"
                                        >
                                            Achievements
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
