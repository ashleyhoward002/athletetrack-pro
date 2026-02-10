"use client";

import { useEffect, useState } from "react";
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
    const [startingDrill, setStartingDrill] = useState<string | null>(null);

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

    const handleStartDrill = async (drill: Drill) => {
        setStartingDrill(drill.id);
        try {
            // Log drill completion (could add more tracking later)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from("drill_completions").insert({
                    user_id: user.id,
                    drill_id: drill.id,
                    completed_at: new Date().toISOString(),
                });
                toast.success(`Started: ${drill.name}`);
            }
        } catch (error) {
            console.error("Failed to log drill:", error);
        } finally {
            setStartingDrill(null);
        }
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
                                className={`btn btn-sm btn-primary ${startingDrill === drill.id ? "loading" : ""}`}
                                onClick={() => handleStartDrill(drill)}
                                disabled={startingDrill === drill.id}
                            >
                                {startingDrill === drill.id ? "" : "Start"}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
