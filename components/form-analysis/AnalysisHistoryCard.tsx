"use client";

import Link from "next/link";
import { getSportConfig, SportId } from "@/lib/sports/config";

interface AnalysisHistoryCardProps {
    analysis: any;
}

export default function AnalysisHistoryCard({ analysis }: AnalysisHistoryCardProps) {
    const config = getSportConfig(analysis.sport as SportId);

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-success";
        if (score >= 60) return "text-warning";
        return "text-error";
    };

    return (
        <Link href={`/dashboard/form-analysis/${analysis.id}`}>
            <div className="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer">
                <div className="card-body p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold">
                                {config.formAnalysisTypes.find((t) => t.key === analysis.analysis_type)?.label || analysis.analysis_type}
                            </h3>
                            <p className="text-sm text-base-content/60">
                                {new Date(analysis.created_at).toLocaleDateString()} &middot;{" "}
                                <span className="badge badge-xs">{analysis.sport}</span>
                                {analysis.source === "live" && (
                                    <span className="badge badge-xs badge-primary ml-1">Live</span>
                                )}
                            </p>
                        </div>
                        {analysis.overall_score ? (
                            <div className={`text-2xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                                {analysis.overall_score}
                            </div>
                        ) : (
                            <span className={`badge badge-sm ${analysis.status === "processing" ? "badge-warning" : "badge-error"}`}>
                                {analysis.status}
                            </span>
                        )}
                    </div>
                    {analysis.ai_feedback && (
                        <div className="mt-2 text-sm">
                            <span className="text-success">{analysis.ai_feedback.strengths?.length || 0} strengths</span>
                            {" / "}
                            <span className="text-warning">{analysis.ai_feedback.improvements?.length || 0} areas to improve</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
