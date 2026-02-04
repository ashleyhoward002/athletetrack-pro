"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSportConfig } from "@/lib/sports/config";

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

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-success";
        if (score >= 60) return "text-warning";
        return "text-error";
    };

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

                {/* Score */}
                {analysis.overall_score && (
                    <div className="card bg-base-200">
                        <div className="card-body items-center text-center">
                            <div className={`text-6xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                                {analysis.overall_score}
                            </div>
                            <p className="text-base-content/60">Overall Score</p>
                        </div>
                    </div>
                )}

                {feedback && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Strengths */}
                        <div className="card bg-success/10 border border-success/30">
                            <div className="card-body">
                                <h3 className="card-title text-success">Strengths</h3>
                                <ul className="space-y-2">
                                    {feedback.strengths?.map((s: string, i: number) => (
                                        <li key={i} className="flex gap-2 text-sm">
                                            <span className="text-success mt-0.5">+</span>
                                            <span>{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Improvements */}
                        <div className="card bg-warning/10 border border-warning/30">
                            <div className="card-body">
                                <h3 className="card-title text-warning">Areas to Improve</h3>
                                <ul className="space-y-2">
                                    {feedback.improvements?.map((s: string, i: number) => (
                                        <li key={i} className="flex gap-2 text-sm">
                                            <span className="text-warning mt-0.5">!</span>
                                            <span>{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Detailed Analysis */}
                {feedback?.detailed_analysis && (
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h3 className="card-title">Detailed Analysis</h3>
                            <div className="prose prose-sm max-w-none">
                                {feedback.detailed_analysis.split("\n").map((p: string, i: number) => (
                                    <p key={i}>{p}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Drill Recommendations */}
                {feedback?.drill_recommendations?.length > 0 && (
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h3 className="card-title">Recommended Drills</h3>
                            <div className="flex flex-wrap gap-2">
                                {feedback.drill_recommendations.map((d: string, i: number) => (
                                    <span key={i} className="badge badge-outline badge-primary">{d}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
