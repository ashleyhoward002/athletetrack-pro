"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSportConfig } from "@/lib/sports/config";
import ScoreDisplay from "@/components/form-analysis/ScoreDisplay";
import FeedbackPanel from "@/components/form-analysis/FeedbackPanel";
import DetailedAnalysis from "@/components/form-analysis/DetailedAnalysis";
import DrillRecommendations from "@/components/form-analysis/DrillRecommendations";

export default function FormAnalysisDetailPage() {
    const params = useParams();
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/form-analysis/${params.id}`)
            .then((r) => r.json())
            .then((data) => setAnalysis(data.analysis))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [params.id]);

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg" />
            </main>
        );
    }

    if (!analysis) {
        return (
            <main className="min-h-screen p-8">
                <p>Analysis not found.</p>
                <Link href="/dashboard/form-analysis" className="btn btn-primary mt-4">Back</Link>
            </main>
        );
    }

    const config = getSportConfig(analysis.sport);
    const typeDef = config.formAnalysisTypes.find((t) => t.key === analysis.analysis_type);
    const feedback = analysis.ai_feedback;

    return (
        <main className="min-h-screen p-4 md:p-8 pb-24">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/form-analysis" className="btn btn-circle btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold">
                            {typeDef?.label || analysis.analysis_type}
                        </h1>
                        <p className="text-base-content/60">
                            {new Date(analysis.created_at).toLocaleDateString()} &middot;{" "}
                            {config.icon} {config.name}
                            {analysis.source === "live" && (
                                <span className="badge badge-sm badge-primary ml-2">Live Session</span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Video */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <video
                            src={analysis.video_url}
                            controls
                            className="w-full rounded-lg max-h-96 object-contain bg-black"
                        />
                    </div>
                </div>

                {/* Live Session Info */}
                {analysis.source === "live" && analysis.session_duration_seconds && (
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h3 className="card-title">Session Info</h3>
                            <p className="text-sm text-base-content/60">
                                Duration: {Math.floor(analysis.session_duration_seconds / 60)}m {analysis.session_duration_seconds % 60}s
                            </p>
                        </div>
                    </div>
                )}

                {/* Score */}
                {analysis.overall_score && <ScoreDisplay score={analysis.overall_score} />}

                {/* Strengths & Improvements */}
                {feedback && <FeedbackPanel feedback={feedback} />}

                {/* Detailed Analysis */}
                {feedback?.detailed_analysis && <DetailedAnalysis text={feedback.detailed_analysis} />}

                {/* Drill Recommendations */}
                {feedback?.drill_recommendations?.length > 0 && (
                    <DrillRecommendations drills={feedback.drill_recommendations} />
                )}

                {/* Live Session Transcript */}
                {analysis.source === "live" && analysis.session_transcript?.length > 0 && (
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h3 className="card-title">Live Coaching Transcript</h3>
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {analysis.session_transcript.map((entry: any, i: number) => (
                                    <div key={i} className="flex gap-3 text-sm">
                                        <span className="text-base-content/40 font-mono min-w-[50px]">
                                            {Math.floor(entry.timestamp / 60000)}:{String(Math.floor((entry.timestamp % 60000) / 1000)).padStart(2, "0")}
                                        </span>
                                        <span>{entry.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
