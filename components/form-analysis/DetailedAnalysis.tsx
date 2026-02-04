"use client";

interface DetailedAnalysisProps {
    text: string;
}

export default function DetailedAnalysis({ text }: DetailedAnalysisProps) {
    return (
        <div className="card bg-base-200">
            <div className="card-body">
                <h3 className="card-title">Detailed Analysis</h3>
                <div className="prose prose-sm max-w-none">
                    {text.split("\n").map((p, i) => (
                        <p key={i}>{p}</p>
                    ))}
                </div>
            </div>
        </div>
    );
}
