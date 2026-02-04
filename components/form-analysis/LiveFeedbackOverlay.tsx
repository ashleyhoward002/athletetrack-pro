"use client";

import { useEffect, useRef } from "react";

export interface FeedbackEntry {
    timestamp: number;
    text: string;
    type: "coaching";
}

interface LiveFeedbackOverlayProps {
    feedbackCards: FeedbackEntry[];
}

export default function LiveFeedbackOverlay({ feedbackCards }: LiveFeedbackOverlayProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest feedback
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [feedbackCards]);

    // Show only the most recent 4 entries
    const recentFeedback = feedbackCards.slice(-4);

    if (recentFeedback.length === 0) {
        return (
            <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 text-white/60 text-sm text-center">
                    Waiting for AI coach feedback...
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="absolute bottom-4 left-4 right-4 space-y-2 max-h-48 overflow-y-auto"
        >
            {recentFeedback.map((entry, i) => {
                const isLatest = i === recentFeedback.length - 1;
                return (
                    <div
                        key={`${entry.timestamp}-${i}`}
                        className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 text-white text-sm transition-opacity duration-500 ${
                            isLatest ? "opacity-100" : "opacity-70"
                        }`}
                    >
                        <span className="text-white/40 text-xs font-mono mr-2">
                            {Math.floor(entry.timestamp / 60000)}:{String(Math.floor((entry.timestamp % 60000) / 1000)).padStart(2, "0")}
                        </span>
                        {entry.text}
                    </div>
                );
            })}
        </div>
    );
}
