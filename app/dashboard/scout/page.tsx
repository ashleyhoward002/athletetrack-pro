"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import HelpIcon from "@/components/ui/HelpIcon";
import { SPORT_LIST, SportId } from "@/lib/sports/config";
import toast from "react-hot-toast";

export default function ScoutPage() {
    const [targetName, setTargetName] = useState("");
    const [selectedSport, setSelectedSport] = useState<SportId>("basketball");
    const [isScouting, setIsScouting] = useState(false);
    const [report, setReport] = useState<any>(null);

    const handleScout = async () => {
        if (!targetName) {
            toast.error("Please enter an athlete or team name");
            return;
        }
        setIsScouting(true);
        setReport(null);

        try {
            const res = await fetch("/api/scout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    target_name: targetName,
                    sport: selectedSport,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to generate report");
            }

            const data = await res.json();
            setReport(data.report);
        } catch (error: any) {
            toast.error(error.message || "Failed to generate scouting report");
        } finally {
            setIsScouting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A192F] text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                            AI Scout Agent
                        </h1>
                        <HelpIcon section="scout" tooltip="Learn how to use Scout" />
                    </div>
                    <p className="text-gray-400">
                        Deploy autonomous agents to analyze rivals and find recruiters.
                    </p>
                </div>

                <GlassCard className="p-8 space-y-6">
                    {/* Sport Selector */}
                    <div className="flex flex-wrap gap-2">
                        {SPORT_LIST.map(sport => (
                            <button
                                key={sport.id}
                                className={`btn btn-sm ${selectedSport === sport.id ? "bg-cyan-500 text-white border-cyan-500" : "btn-ghost text-white border-white/20"}`}
                                onClick={() => setSelectedSport(sport.id)}
                            >
                                {sport.icon} {sport.name}
                            </button>
                        ))}
                    </div>

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
                                onKeyDown={(e) => e.key === "Enter" && handleScout()}
                            />
                            <button
                                className={`btn btn-primary bg-gradient-to-r from-cyan-500 to-blue-600 border-none text-white ${isScouting ? "loading" : ""}`}
                                onClick={handleScout}
                                disabled={isScouting}
                            >
                                {isScouting ? "Analyzing..." : "Run Analysis"}
                            </button>
                        </div>
                        <label className="label">
                            <span className="label-text-alt text-gray-500">
                                AI-powered scouting analysis for any athlete or team name
                            </span>
                        </label>
                    </div>
                </GlassCard>

                {report && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <div className="text-4xl">
                                {SPORT_LIST.find(s => s.id === report.sport)?.icon || "🏆"}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{report.name}</h2>
                                <p className="text-gray-400 capitalize">{report.sport} Scouting Report</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Stats */}
                            <GlassCard className="p-6 border-l-4 border-l-cyan-400">
                                <h3 className="text-xl font-bold mb-4">Stat Profile</h3>
                                <div className="space-y-3">
                                    {Object.entries(report.stats || {}).map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center border-b border-white/5 pb-2">
                                            <span className="text-gray-400">{key}</span>
                                            <span className="font-mono text-cyan-300">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>

                            {/* Strengths & Weaknesses */}
                            <GlassCard className="p-6 border-l-4 border-l-green-500">
                                <h3 className="text-xl font-bold mb-4">Analysis</h3>

                                {report.strengths?.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-semibold text-green-400 mb-2">Strengths</h4>
                                        <ul className="space-y-1">
                                            {report.strengths.map((s: string, i: number) => (
                                                <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                                    <span className="text-green-400">+</span> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {report.weaknesses?.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-semibold text-orange-400 mb-2">Areas to Exploit</h4>
                                        <ul className="space-y-1">
                                            {report.weaknesses.map((w: string, i: number) => (
                                                <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                                    <span className="text-orange-400">-</span> {w}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {report.tendencies?.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-purple-400 mb-2">Tendencies</h4>
                                        <ul className="space-y-1">
                                            {report.tendencies.map((t: string, i: number) => (
                                                <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                                    <span className="text-purple-400">→</span> {t}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </GlassCard>
                        </div>

                        {/* Notes */}
                        <GlassCard className="p-6 border-l-4 border-l-purple-500">
                            <h3 className="text-xl font-bold mb-4">Scouting Summary</h3>
                            <p className="text-gray-300 leading-relaxed">
                                {report.notes}
                            </p>
                        </GlassCard>
                    </div>
                )}
            </div>
        </div>
    );
}
