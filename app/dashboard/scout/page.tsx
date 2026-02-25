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
            toast.error("Please enter an athlete name");
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
                        Search your database or the web for athlete stats and AI-powered insights
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
                            <span className="label-text text-gray-300">Search Athlete</span>
                        </label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Search by athlete name..."
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
                                {isScouting ? "Analyzing..." : "Scout"}
                            </button>
                        </div>
                        <label className="label">
                            <span className="label-text-alt text-gray-500">
                                First searches your database, then searches the web for public stats if not found
                            </span>
                        </label>
                    </div>
                </GlassCard>

                {report && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Header */}
                        <GlassCard className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="text-5xl">
                                    {SPORT_LIST.find(s => s.id === report.sport)?.icon || "🏆"}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-bold text-white">{report.name}</h2>
                                        {report.jersey && (
                                            <span className="badge badge-lg badge-outline text-cyan-400 border-cyan-400">
                                                #{report.jersey}
                                            </span>
                                        )}
                                        <span className={`badge ${
                                            report.status === "Complete" ? "badge-success" :
                                            report.status === "Not Found" ? "badge-error" :
                                            "badge-warning"
                                        }`}>
                                            {report.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-400">
                                        {report.position && <span>{report.position}</span>}
                                        {report.position && (report.school || report.team) && <span>•</span>}
                                        {report.school && <span>{report.school}</span>}
                                        {report.team && !report.school && <span>{report.team}</span>}
                                        {report.gamesAnalyzed > 0 && (
                                            <>
                                                <span>•</span>
                                                <span className="text-cyan-400">{report.gamesAnalyzed} games analyzed</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {report.source === "database" && (
                                    <div className="badge badge-outline badge-sm text-green-400 border-green-400">
                                        Real Data
                                    </div>
                                )}
                                {report.source === "web" && (
                                    <div className="badge badge-outline badge-sm text-blue-400 border-blue-400">
                                        Web Data
                                    </div>
                                )}
                            </div>
                        </GlassCard>

                        {/* Not Found or No Games State */}
                        {(report.status === "Not Found" || report.status === "No Games" || report.status === "Not Found Online" || report.status === "Search Error" || report.status === "Parse Error") && (
                            <GlassCard className="p-6 border-l-4 border-l-yellow-500">
                                <p className="text-gray-300">{report.notes}</p>
                                {report.status === "Not Found" && (
                                    <p className="text-sm text-gray-500 mt-3">
                                        Tip: Web search is enabled - the athlete may not have public stats available yet.
                                    </p>
                                )}
                            </GlassCard>
                        )}

                        {/* Stats and Analysis - only show if we have data */}
                        {report.status === "Complete" && (
                            <>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Stats */}
                                    <GlassCard className="p-6 border-l-4 border-l-cyan-400">
                                        <h3 className="text-xl font-bold mb-4">Season Averages</h3>
                                        <div className="space-y-3">
                                            {Object.entries(report.stats || {}).map(([key, value]) => (
                                                <div key={key} className="flex justify-between items-center border-b border-white/5 pb-2">
                                                    <span className="text-gray-400">{key}</span>
                                                    <span className="font-mono text-cyan-300 text-lg">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </GlassCard>

                                    {/* Strengths & Weaknesses */}
                                    <GlassCard className="p-6 border-l-4 border-l-green-500">
                                        <h3 className="text-xl font-bold mb-4">AI Analysis</h3>

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
                                                <h4 className="text-sm font-semibold text-orange-400 mb-2">Areas to Improve</h4>
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

                                {/* Achievements & Recruiting (Web Only) */}
                                {report.source === "web" && (report.achievements?.length > 0 || report.recruiting || report.recentGames?.length > 0) && (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {report.achievements?.length > 0 && (
                                            <GlassCard className="p-6 border-l-4 border-l-yellow-500">
                                                <h3 className="text-xl font-bold mb-4">Achievements</h3>
                                                <ul className="space-y-2">
                                                    {report.achievements.map((a: string, i: number) => (
                                                        <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                                            <span className="text-yellow-400">🏆</span> {a}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </GlassCard>
                                        )}

                                        {(report.recruiting || report.recentGames?.length > 0) && (
                                            <GlassCard className="p-6 border-l-4 border-l-blue-500">
                                                {report.recruiting && (
                                                    <div className="mb-4">
                                                        <h3 className="text-xl font-bold mb-2">Recruiting Status</h3>
                                                        <p className="text-gray-300 text-sm">{report.recruiting}</p>
                                                    </div>
                                                )}
                                                {report.recentGames?.length > 0 && (
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-blue-400 mb-2">Notable Performances</h4>
                                                        <ul className="space-y-1">
                                                            {report.recentGames.map((g: string, i: number) => (
                                                                <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                                                    <span className="text-blue-400">📊</span> {g}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </GlassCard>
                                        )}
                                    </div>
                                )}

                                {/* Scouting Summary */}
                                {report.notes && (
                                    <GlassCard className="p-6 border-l-4 border-l-purple-500">
                                        <h3 className="text-xl font-bold mb-4">Scouting Summary</h3>
                                        <p className="text-gray-300 leading-relaxed">
                                            {report.notes}
                                        </p>
                                        {report.projectedCeiling && (
                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                <h4 className="text-sm font-semibold text-cyan-400 mb-1">Projected Ceiling</h4>
                                                <p className="text-gray-300 text-sm">{report.projectedCeiling}</p>
                                            </div>
                                        )}
                                    </GlassCard>
                                )}

                                {/* Sources & Disclaimer (Web Only) */}
                                {report.source === "web" && (
                                    <div className="space-y-4">
                                        {report.sources?.length > 0 && (
                                            <div className="text-sm text-gray-500">
                                                <span className="font-semibold">Sources:</span>{" "}
                                                {report.sources.join(", ")}
                                            </div>
                                        )}
                                        {report.disclaimer && (
                                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                                <p className="text-yellow-400 text-sm">
                                                    ⚠️ {report.disclaimer}
                                                </p>
                                            </div>
                                        )}
                                        {report.lastUpdated && (
                                            <div className="text-xs text-gray-600 text-center">
                                                Information as of: {report.lastUpdated}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Multiple matches indicator */}
                        {report.matchedAthletes?.length > 1 && (
                            <div className="text-sm text-gray-500 text-center">
                                Found {report.matchedAthletes.length} athletes matching &quot;{targetName}&quot;. Showing first result.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
