"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SPORT_LIST, SportId } from "@/lib/sports/config";
import toast from "react-hot-toast";

export default function TrainingPlansPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [selectedSport, setSelectedSport] = useState<SportId>("basketball");
    const [generating, setGenerating] = useState(false);
    const [weeks, setWeeks] = useState(2);
    const [loading, setLoading] = useState(true);

    const fetchPlans = async () => {
        try {
            const res = await fetch(`/api/training-plans?sport=${selectedSport}`);
            const data = await res.json();
            setPlans(data.plans || []);
        } catch {
            setPlans([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchPlans();
    }, [selectedSport]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await fetch("/api/training-plans/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sport: selectedSport, weeks }),
            });

            if (!res.ok) throw new Error("Failed");

            const data = await res.json();
            toast.success("Training plan generated!");
            fetchPlans();
        } catch {
            toast.error("Failed to generate plan. Make sure you have some game data logged.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <main className="min-h-screen p-4 md:p-8 pb-24">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/training" className="btn btn-circle btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold">AI Training Plans</h1>
                        <p className="text-base-content/60">
                            AI analyzes your game stats and generates personalized training programs.
                        </p>
                    </div>
                </div>

                {/* Generate Section */}
                <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30">
                    <div className="card-body">
                        <h3 className="card-title">Generate New Plan</h3>
                        <p className="text-sm text-base-content/70">
                            The AI will analyze your recent game performance, identify weaknesses, and create a structured workout program.
                        </p>
                        <div className="flex items-end gap-4 mt-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Sport</span></label>
                                <select
                                    className="select select-bordered"
                                    value={selectedSport}
                                    onChange={(e) => setSelectedSport(e.target.value as SportId)}
                                >
                                    {SPORT_LIST.map((s) => (
                                        <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Duration</span></label>
                                <select
                                    className="select select-bordered"
                                    value={weeks}
                                    onChange={(e) => setWeeks(parseInt(e.target.value))}
                                >
                                    <option value={1}>1 week</option>
                                    <option value={2}>2 weeks</option>
                                    <option value={4}>4 weeks</option>
                                </select>
                            </div>
                            <button
                                className={`btn btn-primary ${generating ? "loading" : ""}`}
                                onClick={handleGenerate}
                                disabled={generating}
                            >
                                {generating ? "Analyzing stats..." : "Generate Plan"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Plans List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg" />
                    </div>
                ) : plans.length > 0 ? (
                    <div className="space-y-4">
                        {plans.map((plan) => (
                            <div key={plan.id} className="card bg-base-200">
                                <div className="card-body">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg">{plan.name}</h3>
                                            <p className="text-sm text-base-content/60">
                                                {new Date(plan.created_at).toLocaleDateString()} &middot;{" "}
                                                <span className="badge badge-sm">{plan.sport}</span>
                                            </p>
                                        </div>
                                        <span className={`badge ${plan.status === "active" ? "badge-primary" : "badge-ghost"}`}>
                                            {plan.status}
                                        </span>
                                    </div>

                                    {plan.ai_analysis && (
                                        <div className="mt-3 space-y-2">
                                            {plan.ai_analysis.focus_areas && (
                                                <div className="flex gap-1 flex-wrap">
                                                    <span className="text-xs text-base-content/50">Focus:</span>
                                                    {plan.ai_analysis.focus_areas.map((area: string, i: number) => (
                                                        <span key={i} className="badge badge-xs badge-outline">{area}</span>
                                                    ))}
                                                </div>
                                            )}
                                            {plan.ai_analysis.weaknesses?.length > 0 && (
                                                <div className="text-sm">
                                                    <span className="text-warning font-medium">Areas to improve: </span>
                                                    {plan.ai_analysis.weaknesses.map((w: any) => w.area).join(", ")}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {plan.program_id && (
                                        <div className="card-actions mt-3">
                                            <Link
                                                href={`/dashboard/training/programs/${plan.program_id}`}
                                                className="btn btn-sm btn-primary"
                                            >
                                                View Program
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-base-content/50">
                        No training plans yet. Generate your first AI plan above!
                    </div>
                )}
            </div>
        </main>
    );
}
