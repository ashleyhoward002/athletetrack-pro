"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSportConfig, SportId } from "@/lib/sports/config";
import ScoreDisplay from "@/components/form-analysis/ScoreDisplay";
import FeedbackPanel from "@/components/form-analysis/FeedbackPanel";
import VideoComparePlayer from "@/components/form-analysis/VideoComparePlayer";

export default function CompareAnalysesPage() {
    const [analyses, setAnalyses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [leftId, setLeftId] = useState("");
    const [rightId, setRightId] = useState("");
    const [showFeedback, setShowFeedback] = useState(false);

    useEffect(() => {
        fetch("/api/form-analysis")
            .then((r) => r.json())
            .then((data) => {
                const completed = (data.analyses || []).filter(
                    (a: any) => a.status === "completed" && a.overall_score && a.video_url
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

    const getShortLabel = (analysis: any) => {
        if (!analysis) return "";
        const date = new Date(analysis.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return date;
    };

    const getScoreDiff = () => {
        if (!leftAnalysis || !rightAnalysis) return null;
        const diff = rightAnalysis.overall_score - leftAnalysis.overall_score;
        if (diff > 0) return { text: `+${diff}`, color: "text-success", icon: "↑" };
        if (diff < 0) return { text: `${diff}`, color: "text-error", icon: "↓" };
        return { text: "0", color: "text-base-content/50", icon: "=" };
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
                    <div className="text-6xl mb-4">📹</div>
                    <h2 className="text-2xl font-bold mb-2">Need More Videos</h2>
                    <p className="text-base-content/60 mb-6">
                        You need at least 2 completed video analyses to compare your progress.
                        Upload more videos or do more live sessions!
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
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/form-analysis" className="btn btn-circle btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold">Compare Videos</h1>
                        <p className="text-base-content/60">
                            Watch your progress side by side with synced playback
                        </p>
                    </div>
                </div>

                {/* Selectors */}
                <div className="card bg-base-200">
                    <div className="card-body py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-bold flex items-center gap-2">
                                        <span className="badge badge-outline">Before</span>
                                        Earlier Session
                                    </span>
                                </label>
                                <select
                                    className="select select-bordered"
                                    value={leftId}
                                    onChange={(e) => setLeftId(e.target.value)}
                                >
                                    <option value="">Select an analysis...</option>
                                    {analyses.map((a) => (
                                        <option key={a.id} value={a.id} disabled={a.id === rightId}>
                                            {getLabel(a)} (Score: {a.overall_score})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-bold flex items-center gap-2">
                                        <span className="badge badge-success">After</span>
                                        Later Session
                                    </span>
                                </label>
                                <select
                                    className="select select-bordered"
                                    value={rightId}
                                    onChange={(e) => setRightId(e.target.value)}
                                >
                                    <option value="">Select an analysis...</option>
                                    {analyses.map((a) => (
                                        <option key={a.id} value={a.id} disabled={a.id === leftId}>
                                            {getLabel(a)} (Score: {a.overall_score})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video Comparison */}
                {leftAnalysis && rightAnalysis && (
                    <>
                        {/* Score Summary Bar */}
                        <div className="card bg-gradient-to-r from-base-200 to-base-300">
                            <div className="card-body py-4">
                                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
                                    <div className="text-center">
                                        <p className="text-xs text-base-content/50 uppercase tracking-wide">Before</p>
                                        <p className="text-3xl font-bold">{leftAnalysis.overall_score}</p>
                                        <p className="text-sm text-base-content/60">{getShortLabel(leftAnalysis)}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-base-content/50 uppercase tracking-wide">Progress</p>
                                        <div className={`text-4xl font-bold ${scoreDiff?.color}`}>
                                            {scoreDiff?.icon} {scoreDiff?.text}
                                        </div>
                                        <p className="text-sm text-base-content/60">points</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-base-content/50 uppercase tracking-wide">After</p>
                                        <p className="text-3xl font-bold text-success">{rightAnalysis.overall_score}</p>
                                        <p className="text-sm text-base-content/60">{getShortLabel(rightAnalysis)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Video Player */}
                        <VideoComparePlayer
                            leftVideoUrl={leftAnalysis.video_url}
                            rightVideoUrl={rightAnalysis.video_url}
                            leftLabel={`Before: ${getShortLabel(leftAnalysis)}`}
                            rightLabel={`After: ${getShortLabel(rightAnalysis)}`}
                        />

                        {/* Toggle Feedback Details */}
                        <div className="flex justify-center">
                            <button
                                onClick={() => setShowFeedback(!showFeedback)}
                                className="btn btn-ghost gap-2"
                            >
                                {showFeedback ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                        Hide AI Feedback
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                        Show AI Feedback Details
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Feedback Comparison (Collapsible) */}
                        {showFeedback && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Feedback */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="badge badge-lg badge-outline">Before</span>
                                        <h3 className="font-bold text-lg">{getLabel(leftAnalysis)}</h3>
                                    </div>
                                    <ScoreDisplay score={leftAnalysis.overall_score} />
                                    {leftAnalysis.ai_feedback && (
                                        <FeedbackPanel feedback={leftAnalysis.ai_feedback} />
                                    )}
                                    {leftAnalysis.ai_feedback?.detailed_analysis && (
                                        <div className="card bg-base-200">
                                            <div className="card-body">
                                                <h4 className="font-semibold text-sm mb-2">Detailed Analysis</h4>
                                                <p className="text-sm text-base-content/70">
                                                    {leftAnalysis.ai_feedback.detailed_analysis}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Feedback */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="badge badge-lg badge-success">After</span>
                                        <h3 className="font-bold text-lg">{getLabel(rightAnalysis)}</h3>
                                    </div>
                                    <ScoreDisplay score={rightAnalysis.overall_score} />
                                    {rightAnalysis.ai_feedback && (
                                        <FeedbackPanel feedback={rightAnalysis.ai_feedback} />
                                    )}
                                    {rightAnalysis.ai_feedback?.detailed_analysis && (
                                        <div className="card bg-base-200">
                                            <div className="card-body">
                                                <h4 className="font-semibold text-sm mb-2">Detailed Analysis</h4>
                                                <p className="text-sm text-base-content/70">
                                                    {rightAnalysis.ai_feedback.detailed_analysis}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Improvement Tips */}
                        {scoreDiff && parseInt(scoreDiff.text) > 0 && (
                            <div className="card bg-success/10 border border-success/30">
                                <div className="card-body py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl">🎉</div>
                                        <div>
                                            <h4 className="font-bold text-success">Great Progress!</h4>
                                            <p className="text-sm text-base-content/70">
                                                You've improved by {scoreDiff.text} points. Keep up the consistent practice!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
