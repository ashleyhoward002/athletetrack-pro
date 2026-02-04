"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSportConfig, SportId } from "@/lib/sports/config";
import ScoreDisplay from "@/components/form-analysis/ScoreDisplay";
import FeedbackPanel from "@/components/form-analysis/FeedbackPanel";

export default function CompareAnalysesPage() {
    const [analyses, setAnalyses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [leftId, setLeftId] = useState("");
    const [rightId, setRightId] = useState("");

    useEffect(() => {
        fetch("/api/form-analysis")
            .then((r) => r.json())
            .then((data) => {
                const completed = (data.analyses || []).filter(
                    (a: any) => a.status === "completed" && a.overall_score
                );
                setAnalyses(completed);
                // Default: compare the two most recent
                if (completed.length >= 2) {
                    setLeftId(completed[1].id);
                    setRightId(completed[0].id);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const leftAnalysis = analyses.find((a) => a.id === leftId);
    const rightAnalysis = analyses.find((a) => a.id === rightId);

    const getLabel = (analysis: any) => {
        if (!analysis) return "";
        const config = getSportConfig(analysis.sport as SportId);
        const typeDef = config.formAnalysisTypes.find((t: any) => t.key === analysis.analysis_type);
        const date = new Date(analysis.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return `${typeDef?.label || analysis.analysis_type} - ${date}`;
    };

    const getScoreDiff = () => {
        if (!leftAnalysis || !rightAnalysis) return null;
        const diff = rightAnalysis.overall_score - leftAnalysis.overall_score;
        if (diff > 0) return { text: `+${diff}`, color: "text-success" };
        if (diff < 0) return { text: `${diff}`, color: "text-error" };
        return { text: "0", color: "text-base-content/50" };
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg" />
            </main>
        );
    }

    if (analyses.length < 2) {
        return (
            <main className="min-h-screen p-4 md:p-8">
                <div className="max-w-4xl mx-auto text-center py-20">
                    <p className="text-base-content/60 mb-4">
                        You need at least 2 completed analyses to compare. Upload more videos or do more live sessions!
                    </p>
                    <Link href="/dashboard/form-analysis" className="btn btn-primary">
                        Back to Form Analysis
                    </Link>
                </div>
            </main>
        );
    }

    const scoreDiff = getScoreDiff();

    return (
        <main className="min-h-screen p-4 md:p-8 pb-24">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/form-analysis" className="btn btn-circle btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold">Compare Analyses</h1>
                        <p className="text-base-content/60">
                            Pick two analyses to see your progress side by side.
                        </p>
                    </div>
                </div>

                {/* Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label"><span className="label-text font-bold">Earlier Session</span></label>
                        <select
                            className="select select-bordered"
                            value={leftId}
                            onChange={(e) => setLeftId(e.target.value)}
                        >
                            <option value="">Select an analysis...</option>
                            {analyses.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {getLabel(a)} (Score: {a.overall_score})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-bold">Later Session</span></label>
                        <select
                            className="select select-bordered"
                            value={rightId}
                            onChange={(e) => setRightId(e.target.value)}
                        >
                            <option value="">Select an analysis...</option>
                            {analyses.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {getLabel(a)} (Score: {a.overall_score})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Score Comparison */}
                {leftAnalysis && rightAnalysis && (
                    <>
                        <div className="grid grid-cols-3 gap-4 items-center">
                            <div className="text-center">
                                <p className="text-sm text-base-content/60 mb-1">Earlier</p>
                                <ScoreDisplay score={leftAnalysis.overall_score} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-base-content/60 mb-1">Change</p>
                                <div className="card bg-base-200">
                                    <div className="card-body items-center py-4">
                                        <div className={`text-4xl font-bold ${scoreDiff?.color}`}>
                                            {scoreDiff?.text}
                                        </div>
                                        <p className="text-base-content/60 text-sm">points</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-base-content/60 mb-1">Later</p>
                                <ScoreDisplay score={rightAnalysis.overall_score} />
                            </div>
                        </div>

                        {/* Feedback Comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg">{getLabel(leftAnalysis)}</h3>
                                {leftAnalysis.ai_feedback && (
                                    <FeedbackPanel feedback={leftAnalysis.ai_feedback} />
                                )}
                                {leftAnalysis.ai_feedback?.detailed_analysis && (
                                    <div className="card bg-base-200">
                                        <div className="card-body">
                                            <p className="text-sm text-base-content/70">
                                                {leftAnalysis.ai_feedback.detailed_analysis}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Right */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg">{getLabel(rightAnalysis)}</h3>
                                {rightAnalysis.ai_feedback && (
                                    <FeedbackPanel feedback={rightAnalysis.ai_feedback} />
                                )}
                                {rightAnalysis.ai_feedback?.detailed_analysis && (
                                    <div className="card bg-base-200">
                                        <div className="card-body">
                                            <p className="text-sm text-base-content/70">
                                                {rightAnalysis.ai_feedback.detailed_analysis}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
