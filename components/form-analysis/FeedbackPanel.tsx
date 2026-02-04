"use client";

interface FeedbackPanelProps {
    feedback: {
        strengths?: string[];
        improvements?: string[];
    };
}

export default function FeedbackPanel({ feedback }: FeedbackPanelProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card bg-success/10 border border-success/30">
                <div className="card-body">
                    <h3 className="card-title text-success">Strengths</h3>
                    <ul className="space-y-2">
                        {feedback.strengths?.map((s, i) => (
                            <li key={i} className="flex gap-2 text-sm">
                                <span className="text-success mt-0.5">+</span>
                                <span>{s}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="card bg-warning/10 border border-warning/30">
                <div className="card-body">
                    <h3 className="card-title text-warning">Areas to Improve</h3>
                    <ul className="space-y-2">
                        {feedback.improvements?.map((s, i) => (
                            <li key={i} className="flex gap-2 text-sm">
                                <span className="text-warning mt-0.5">!</span>
                                <span>{s}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
