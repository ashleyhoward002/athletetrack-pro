"use client";

interface DrillRecommendationsProps {
    drills: string[];
}

export default function DrillRecommendations({ drills }: DrillRecommendationsProps) {
    if (!drills.length) return null;

    return (
        <div className="card bg-base-200">
            <div className="card-body">
                <h3 className="card-title">Recommended Drills</h3>
                <div className="flex flex-wrap gap-2">
                    {drills.map((d, i) => (
                        <span key={i} className="badge badge-outline badge-primary">{d}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
