"use client";

import AnalysisHistoryCard from "./AnalysisHistoryCard";

interface AnalysisHistoryGridProps {
    analyses: any[];
    loading: boolean;
}

export default function AnalysisHistoryGrid({ analyses, loading }: AnalysisHistoryGridProps) {
    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    if (analyses.length === 0) {
        return (
            <div className="text-center py-12 text-base-content/50">
                No analyses yet. Upload your first video above or start a live session!
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyses.map((a) => (
                <AnalysisHistoryCard key={a.id} analysis={a} />
            ))}
        </div>
    );
}
