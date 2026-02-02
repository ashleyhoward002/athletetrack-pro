"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AuroraHero } from "@/components/ui/AuroraHero";

export default function ScoutPage() {
    const [targetName, setTargetName] = useState("");
    const [isScouting, setIsScouting] = useState(false);
    const [report, setReport] = useState<any>(null);

    const handleScout = async () => {
        if (!targetName) return;
        setIsScouting(true);
        setReport(null);

        // SIMULATION: In a real app, this would call /api/scout which uses Hyperbrowser/Gemini
        // To scrape MaxPreps/Hudl/social media.
        setTimeout(() => {
            setReport({
                name: targetName,
                status: "Complete",
                stats: {
                    "PPG": "18.5",
                    "Rebounds": "6.2",
                    "Weakness": "Left-hand drives",
                    "Tendency": "Shoots 80% from right corner"
                },
                notes: "Subject shows strong offensive capability but struggles with defensive rotations. Recent footage suggests a minor ankle injury favoring the left side."
            });
            setIsScouting(false);
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-[#0A192F] text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                        AI Scout Agent
                    </h1>
                    <p className="text-gray-400">
                        Deploy autonomous agents to analyze rivals and find recruiters.
                    </p>
                </div>

                <GlassCard className="p-8 space-y-6">
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text text-gray-300">Target Athlete / Team</span>
                        </label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="e.g. 'Bronny James' or 'Mater Academy'"
                                className="input input-bordered w-full bg-white/5 border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                                value={targetName}
                                onChange={(e) => setTargetName(e.target.value)}
                            />
                            <button
                                className={`btn btn-primary bg-gradient-to-r from-cyan-500 to-blue-600 border-none text-white ${isScouting ? "loading" : ""}`}
                                onClick={handleScout}
                                disabled={isScouting}
                            >
                                {isScouting ? "Deploying Agents..." : "Run Analysis"}
                            </button>
                        </div>
                        <label className="label">
                            <span className="label-text-alt text-gray-500">
                                * Uses Hyperbrowser™ technology to scan public records.
                            </span>
                        </label>
                    </div>
                </GlassCard>

                {report && (
                    <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <GlassCard className="p-6 border-l-4 border-l-cyan-400">
                            <h3 className="text-xl font-bold mb-4">Stat Profile</h3>
                            <div className="space-y-3">
                                {Object.entries(report.stats).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-gray-400">{key}</span>
                                        <span className="font-mono text-cyan-300">{(value as string)}</span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6 border-l-4 border-l-purple-500">
                            <h3 className="text-xl font-bold mb-4">AI Scouting Notes</h3>
                            <p className="text-gray-300 leading-relaxed">
                                {report.notes}
                            </p>
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <button className="btn btn-sm btn-outline text-purple-300 hover:bg-purple-500 hover:border-purple-500">
                                    View Source Footage
                                </button>
                            </div>
                        </GlassCard>
                    </div>
                )}
            </div>
        </div>
    );
}
