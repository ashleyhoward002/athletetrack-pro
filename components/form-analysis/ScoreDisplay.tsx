"use client";

interface ScoreDisplayProps {
    score: number;
}

export default function ScoreDisplay({ score }: ScoreDisplayProps) {
    const color = score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-error";

    return (
        <div className="card bg-base-200">
            <div className="card-body items-center text-center">
                <div className={`text-6xl font-bold ${color}`}>
                    {score}
                </div>
                <p className="text-base-content/60">Overall Score</p>
            </div>
        </div>
    );
}
