"use client";

import Link from "next/link";
import { getSportConfig, SportId } from "@/lib/sports/config";

interface AnalysisHistoryCardProps {
    analysis: any;
    onDelete?: (id: string) => void;
}

export default function AnalysisHistoryCard({ analysis, onDelete }: AnalysisHistoryCardProps) {
    const config = getSportConfig(analysis.sport as SportId);

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-success";
        if (score >= 60) return "text-warning";
        return "text-error";
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDelete) {
            onDelete(analysis.id);
        }
    };

    return (
        <div className="card bg-base-200 hover:bg-base-300 transition-colors">
            <div className="card-body p-4">
                <div className="flex justify-between items-start">
                    <Link href={`/dashboard/form-analysis/${analysis.id}`} className="flex-1">
                        <div>
                            <h3 className="font-bold hover:text-primary transition-colors">
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
                    </Link>
                    <div className="flex items-center gap-2">
                        {analysis.overall_score ? (
                            <div className={`text-2xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                                {analysis.overall_score}
                            </div>
                        ) : (
                            <span className={`badge badge-sm ${analysis.status === "processing" ? "badge-warning" : "badge-error"}`}>
                                {analysis.status}
                            </span>
                        )}
                        {onDelete && (
                            <button
                                onClick={handleDelete}
                                className="btn btn-ghost btn-xs text-error"
                                title="Delete analysis"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                {analysis.ai_feedback && (
                    <Link href={`/dashboard/form-analysis/${analysis.id}`}>
                        <div className="mt-2 text-sm">
                            <span className="text-success">{analysis.ai_feedback.strengths?.length || 0} strengths</span>
                            {" / "}
                            <span className="text-warning">{analysis.ai_feedback.improvements?.length || 0} areas to improve</span>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
}
