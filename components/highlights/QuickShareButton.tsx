"use client";

import { useState, useEffect } from "react";
import ShareableHighlightCard from "./ShareableHighlightCard";
import {
    HighlightCardData,
    buildGameHighlightCard,
    detectCareerHighs,
    GameStats,
} from "@/lib/highlights";
import { SportId } from "@/lib/sports/config";

interface QuickShareButtonProps {
    game: {
        id: string;
        date: string;
        opponent: string;
        sport?: string;
        stats?: Record<string, number>;
    };
    allGames?: any[];
    athleteName?: string;
    className?: string;
    variant?: "icon" | "button";
}

export default function QuickShareButton({
    game,
    allGames = [],
    athleteName = "Athlete",
    className = "",
    variant = "icon",
}: QuickShareButtonProps) {
    const [showShare, setShowShare] = useState(false);
    const [cardData, setCardData] = useState<HighlightCardData | null>(null);

    const handleClick = () => {
        const sport = (game.sport || "basketball") as SportId;

        const gameStats: GameStats = {
            id: game.id,
            date: game.date,
            opponent: game.opponent,
            sport,
            stats: game.stats || {},
        };

        // Get other games for career high comparison
        const otherGames: GameStats[] = allGames
            .filter((g) => g.id !== game.id)
            .map((g) => ({
                id: g.id,
                date: g.date,
                opponent: g.opponent,
                sport: (g.sport || "basketball") as SportId,
                stats: g.stats || {},
            }));

        const careerHighs = detectCareerHighs(gameStats, otherGames);
        const card = buildGameHighlightCard(gameStats, athleteName, careerHighs);

        setCardData(card);
        setShowShare(true);
    };

    if (variant === "icon") {
        return (
            <>
                <button
                    onClick={handleClick}
                    className={`btn btn-ghost btn-sm btn-circle ${className}`}
                    title="Share highlight"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                </button>

                {showShare && cardData && (
                    <ShareableHighlightCard
                        data={cardData}
                        onClose={() => setShowShare(false)}
                    />
                )}
            </>
        );
    }

    return (
        <>
            <button
                onClick={handleClick}
                className={`btn btn-sm btn-ghost gap-1 ${className}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
            </button>

            {showShare && cardData && (
                <ShareableHighlightCard
                    data={cardData}
                    onClose={() => setShowShare(false)}
                />
            )}
        </>
    );
}
