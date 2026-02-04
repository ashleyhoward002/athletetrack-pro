"use client";

import Link from "next/link";

interface LiveSessionSummaryProps {
    analysisId: string;
    score?: number;
    status: "completed" | "failed";
}

export default function LiveSessionSummary({ analysisId, score, status }: LiveSessionSummaryProps) {
    const scoreColor = score
        ? score >= 80
            ? "text-success"
            : score >= 60
                ? "text-warning"
                : "text-error"
        : "";

    return (
        <div className="card bg-base-200">
            <div className="card-body items-center text-center">
                <div className="text-4xl mb-2">
                    {status === "completed" ? "✅" : "⚠️"}
                </div>
                <h3 className="card-title">
                    {status === "completed" ? "Session Saved!" : "Session Saved (Analysis Failed)"}
                </h3>
                {score && (
                    <div className={`text-5xl font-bold ${scoreColor} my-2`}>
                        {score}
                    </div>
                )}
                <p className="text-sm text-base-content/60 mb-4">
                    {status === "completed"
                        ? "Your live coaching session has been analyzed. View the full breakdown below."
                        : "Your session recording was saved but the AI summary could not be generated. You can still review the video."}
                </p>
                <div className="flex gap-3">
                    <Link href={`/dashboard/form-analysis/${analysisId}`} className="btn btn-primary">
                        View Full Analysis
                    </Link>
                    <Link href="/dashboard/form-analysis" className="btn btn-ghost">
                        Back to Form Analysis
                    </Link>
                </div>
            </div>
        </div>
    );
}
