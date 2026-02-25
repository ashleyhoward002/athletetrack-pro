"use client";

interface ScoreDisplayProps {
    score: number;
    analysisType?: string;
}

// Score ranges and their meanings
const getScoreInfo = (score: number) => {
    if (score >= 90) {
        return {
            label: "Excellent",
            color: "text-success",
            bgColor: "bg-success/10",
            ringColor: "ring-success",
            description: "Outstanding technique! You're performing at a high level.",
            nextSteps: "Focus on consistency and advanced variations to maintain your edge.",
            icon: "🏆",
        };
    }
    if (score >= 80) {
        return {
            label: "Great",
            color: "text-success",
            bgColor: "bg-success/10",
            ringColor: "ring-success",
            description: "Strong fundamentals with good execution.",
            nextSteps: "Minor refinements can take you to the next level.",
            icon: "⭐",
        };
    }
    if (score >= 70) {
        return {
            label: "Good",
            color: "text-info",
            bgColor: "bg-info/10",
            ringColor: "ring-info",
            description: "Solid foundation with room for improvement.",
            nextSteps: "Focus on the specific areas highlighted below to level up.",
            icon: "👍",
        };
    }
    if (score >= 60) {
        return {
            label: "Developing",
            color: "text-warning",
            bgColor: "bg-warning/10",
            ringColor: "ring-warning",
            description: "You're building the basics but need more practice.",
            nextSteps: "Work on the fundamentals with the recommended drills.",
            icon: "📈",
        };
    }
    if (score >= 40) {
        return {
            label: "Needs Work",
            color: "text-warning",
            bgColor: "bg-warning/10",
            ringColor: "ring-warning",
            description: "Several areas need attention to improve your technique.",
            nextSteps: "Start with basic drills and focus on one improvement at a time.",
            icon: "💪",
        };
    }
    if (score >= 20) {
        return {
            label: "Beginner",
            color: "text-error",
            bgColor: "bg-error/10",
            ringColor: "ring-error",
            description: "You're just getting started—everyone begins here!",
            nextSteps: "Focus on learning the basic mechanics with beginner drills.",
            icon: "🌱",
        };
    }
    return {
        label: "No Data",
        color: "text-base-content/50",
        bgColor: "bg-base-300",
        ringColor: "ring-base-300",
        description: "Not enough data to evaluate your technique.",
        nextSteps: "Try recording a longer session with clear visibility of your form.",
        icon: "📹",
    };
};

export default function ScoreDisplay({ score, analysisType }: ScoreDisplayProps) {
    const info = getScoreInfo(score);

    return (
        <div className={`card ${info.bgColor} ring-2 ${info.ringColor}`}>
            <div className="card-body">
                <div className="flex items-center gap-6">
                    {/* Score Circle */}
                    <div className="flex flex-col items-center">
                        <div
                            className="radial-progress text-primary"
                            style={{
                                "--value": score,
                                "--size": "7rem",
                                "--thickness": "6px",
                            } as React.CSSProperties}
                        >
                            <div className="flex flex-col items-center">
                                <span className={`text-3xl font-bold ${info.color}`}>{score}</span>
                                <span className="text-xs text-base-content/50">/100</span>
                            </div>
                        </div>
                    </div>

                    {/* Score Explanation */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{info.icon}</span>
                            <span className={`text-xl font-bold ${info.color}`}>{info.label}</span>
                        </div>
                        <p className="text-base-content/70 mb-2">{info.description}</p>
                        <div className="flex items-start gap-2 text-sm">
                            <span className="text-primary font-semibold">Next:</span>
                            <span className="text-base-content/60">{info.nextSteps}</span>
                        </div>
                    </div>
                </div>

                {/* Score Scale */}
                <div className="mt-4 pt-4 border-t border-base-content/10">
                    <div className="flex justify-between text-xs text-base-content/50 mb-1">
                        <span>Beginner</span>
                        <span>Developing</span>
                        <span>Good</span>
                        <span>Great</span>
                        <span>Excellent</span>
                    </div>
                    <div className="w-full h-2 bg-base-300 rounded-full overflow-hidden">
                        <div className="h-full flex">
                            <div className="flex-1 bg-error/50" />
                            <div className="flex-1 bg-warning/50" />
                            <div className="flex-1 bg-info/50" />
                            <div className="flex-1 bg-success/70" />
                            <div className="flex-1 bg-success" />
                        </div>
                    </div>
                    <div
                        className="relative h-0"
                        style={{ marginTop: "-10px" }}
                    >
                        <div
                            className="absolute w-3 h-3 bg-base-content rounded-full border-2 border-base-100 transform -translate-x-1/2"
                            style={{ left: `${score}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
