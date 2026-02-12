"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { SportId, getSportConfig } from "@/lib/sports/config";
import toast from "react-hot-toast";

type Drill = {
    id: string;
    name: string;
    category: string;
    difficulty: string;
    description: string;
    sport: SportId;
    duration_minutes: number;
    sets: number;
    reps: number;
};

export default function QuickDrills() {
    const supabase = createClient();
    const [drills, setDrills] = useState<Drill[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeDrill, setActiveDrill] = useState<Drill | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [currentSet, setCurrentSet] = useState(1);
    const [completedReps, setCompletedReps] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchDrills = async () => {
            const { data, error } = await supabase
                .from("drills")
                .select("*")
                .limit(4)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Failed to fetch drills:", error);
            } else {
                setDrills(data || []);
            }
            setLoading(false);
        };

        fetchDrills();
    }, []);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            toast.success("Time's up! Great work!");
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isRunning, timeLeft]);

    const handleStartDrill = (drill: Drill) => {
        setActiveDrill(drill);
        setTimeLeft(drill.duration_minutes * 60);
        setCurrentSet(1);
        setCompletedReps(0);
        setIsRunning(false);
    };

    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        if (activeDrill) {
            setTimeLeft(activeDrill.duration_minutes * 60);
            setIsRunning(false);
        }
    };

    const completeSet = async () => {
        if (!activeDrill) return;

        setCompletedReps(prev => prev + activeDrill.reps);

        if (currentSet < activeDrill.sets) {
            setCurrentSet(prev => prev + 1);
            toast.success(`Set ${currentSet} complete! ${activeDrill.sets - currentSet} sets left.`);
        } else {
            // All sets complete - log it
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from("drill_completions").insert({
                    user_id: user.id,
                    drill_id: activeDrill.id,
                    completed_at: new Date().toISOString(),
                    duration_seconds: activeDrill.duration_minutes * 60 - timeLeft,
                });
            }
            toast.success("Drill complete! Great job!");
            setActiveDrill(null);
        }
    };

    const closeDrill = () => {
        setActiveDrill(null);
        setIsRunning(false);
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case "Rookie": return "badge-success";
            case "Pro": return "badge-warning";
            case "All-Star": return "badge-error";
            default: return "badge-ghost";
        }
    };

    const getSportEmoji = (sport: SportId) => {
        return getSportConfig(sport).icon;
    };

    if (loading) {
        return (
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h3 className="card-title">Quick Drills</h3>
                    <div className="flex justify-center py-8">
                        <span className="loading loading-spinner loading-md" />
                    </div>
                </div>
            </div>
        );
    }

    if (drills.length === 0) {
        return (
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h3 className="card-title">Quick Drills</h3>
                    <p className="text-base-content/60 text-sm">No drills loaded yet.</p>
                    <Link href="/dashboard/drills" className="btn btn-primary btn-sm mt-2">
                        Load Drills
                    </Link>
                </div>
            </div>
        );
    }

    // Active drill session view
    if (activeDrill) {
        return (
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-2xl mr-2">{getSportEmoji(activeDrill.sport)}</span>
                            <h3 className="card-title inline">{activeDrill.name}</h3>
                        </div>
                        <button onClick={closeDrill} className="btn btn-ghost btn-sm btn-circle">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Timer */}
                    <div className="text-center py-6">
                        <div className={`text-6xl font-mono font-bold ${timeLeft <= 10 && timeLeft > 0 ? "text-error animate-pulse" : ""}`}>
                            {formatTime(timeLeft)}
                        </div>
                        <div className="flex justify-center gap-2 mt-4">
                            <button onClick={toggleTimer} className={`btn ${isRunning ? "btn-warning" : "btn-success"}`}>
                                {isRunning ? "Pause" : "Start Timer"}
                            </button>
                            <button onClick={resetTimer} className="btn btn-outline">
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-base-300 p-3 rounded-lg mb-4">
                        <p className="text-sm">{activeDrill.description || "Complete the drill with good form!"}</p>
                    </div>

                    {/* Sets & Reps Tracker */}
                    <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                        <div className="stat">
                            <div className="stat-title">Current Set</div>
                            <div className="stat-value text-primary">{currentSet} / {activeDrill.sets}</div>
                        </div>
                        <div className="stat">
                            <div className="stat-title">Reps per Set</div>
                            <div className="stat-value">{activeDrill.reps}</div>
                        </div>
                        <div className="stat">
                            <div className="stat-title">Total Reps Done</div>
                            <div className="stat-value text-success">{completedReps}</div>
                        </div>
                    </div>

                    {/* Complete Set Button */}
                    <button onClick={completeSet} className="btn btn-primary btn-lg w-full mt-4">
                        {currentSet < activeDrill.sets ? `Complete Set ${currentSet}` : "Finish Drill"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
                <div className="flex justify-between items-center">
                    <h3 className="card-title">Quick Drills</h3>
                    <Link href="/dashboard/drills" className="btn btn-ghost btn-xs">
                        View All
                    </Link>
                </div>

                <div className="space-y-3 mt-2">
                    {drills.map((drill) => (
                        <div
                            key={drill.id}
                            className="flex items-center justify-between p-3 bg-base-300 rounded-lg hover:bg-base-100 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span>{getSportEmoji(drill.sport)}</span>
                                    <span className="font-medium truncate">{drill.name}</span>
                                </div>
                                <div className="flex gap-2 mt-1">
                                    <span className={`badge badge-xs ${getDifficultyColor(drill.difficulty)}`}>
                                        {drill.difficulty}
                                    </span>
                                    <span className="text-xs text-base-content/50">
                                        {drill.duration_minutes} min
                                    </span>
                                </div>
                            </div>
                            <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleStartDrill(drill)}
                            >
                                Start
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
