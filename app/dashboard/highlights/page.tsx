"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HighlightCard from "@/components/highlights/HighlightCard";
import ShareableHighlightCard from "@/components/highlights/ShareableHighlightCard";
import {
    HighlightCardData,
    buildGameHighlightCard,
    buildWeeklyRecapCard,
    detectCareerHighs,
    GameStats,
    SPORT_EMOJI,
} from "@/lib/highlights";
import { SportId, SPORT_LIST, DEFAULT_SPORT } from "@/lib/sports/config";

export default function HighlightsPage() {
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState<HighlightCardData | null>(null);
    const [sport, setSport] = useState<SportId>(DEFAULT_SPORT);
    const [athleteName, setAthleteName] = useState("Athlete");
    const [activeTab, setActiveTab] = useState<"games" | "weekly">("games");

    useEffect(() => {
        fetchGames();
        fetchProfile();
    }, [sport]);

    const fetchGames = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/games?sport=${sport}&limit=50`);
            const data = await res.json();
            setGames(data.games || []);
        } catch {
            setGames([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/profile");
            if (res.ok) {
                const data = await res.json();
                if (data.profile?.full_name) {
                    setAthleteName(data.profile.full_name);
                }
            }
        } catch {
            // Use default name
        }
    };

    const generateGameCard = (game: any): HighlightCardData => {
        const gameStats: GameStats = {
            id: game.id,
            date: game.date,
            opponent: game.opponent,
            sport: game.sport || sport,
            stats: game.stats || {},
        };

        // Get all other games for career high comparison
        const otherGames: GameStats[] = games
            .filter((g) => g.id !== game.id)
            .map((g) => ({
                id: g.id,
                date: g.date,
                opponent: g.opponent,
                sport: g.sport || sport,
                stats: g.stats || {},
            }));

        const careerHighs = detectCareerHighs(gameStats, otherGames);
        return buildGameHighlightCard(gameStats, athleteName, careerHighs);
    };

    const generateWeeklyRecap = (): HighlightCardData | null => {
        if (games.length === 0) return null;

        // Get games from the last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentGames = games.filter((g) => {
            const gameDate = new Date(g.date);
            return gameDate >= oneWeekAgo;
        });

        if (recentGames.length === 0) return null;

        const gameStats: GameStats[] = recentGames.map((g) => ({
            id: g.id,
            date: g.date,
            opponent: g.opponent,
            sport: g.sport || sport,
            stats: g.stats || {},
        }));

        const today = new Date();
        const weekLabel = `Week of ${today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

        return buildWeeklyRecapCard(gameStats, athleteName, sport, weekLabel);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    // Find games with career highs
    const gamesWithHighlights = games.map((game) => {
        const card = generateGameCard(game);
        return {
            game,
            card,
            hasCareerHigh: card.type === "career_high",
        };
    });

    const weeklyRecap = generateWeeklyRecap();

    return (
        <main className="min-h-screen p-4 md:p-8 pb-24">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="btn btn-circle btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold">Highlight Cards</h1>
                        <p className="text-base-content/60">
                            Create shareable cards for your best performances
                        </p>
                    </div>
                </div>

                {/* Athlete Name Input */}
                <div className="card bg-base-200">
                    <div className="card-body py-4">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="form-control flex-1 min-w-[200px]">
                                <label className="label">
                                    <span className="label-text">Athlete Name (shown on cards)</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered"
                                    value={athleteName}
                                    onChange={(e) => setAthleteName(e.target.value)}
                                    placeholder="Enter name"
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {SPORT_LIST.map((s) => (
                                    <button
                                        key={s.id}
                                        className={`btn btn-sm ${sport === s.id ? "btn-primary" : "btn-ghost"}`}
                                        onClick={() => setSport(s.id)}
                                    >
                                        {s.icon} {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs tabs-boxed w-fit">
                    <button
                        className={`tab ${activeTab === "games" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("games")}
                    >
                        Game Highlights
                    </button>
                    <button
                        className={`tab ${activeTab === "weekly" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("weekly")}
                    >
                        Weekly Recap
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg" />
                    </div>
                ) : (
                    <>
                        {/* Game Highlights Tab */}
                        {activeTab === "games" && (
                            <>
                                {games.length === 0 ? (
                                    <div className="card bg-base-200">
                                        <div className="card-body items-center text-center py-12">
                                            <div className="text-6xl mb-4">{SPORT_EMOJI[sport]}</div>
                                            <h3 className="text-xl font-bold">No Games Yet</h3>
                                            <p className="text-base-content/60">
                                                Log some games to create shareable highlight cards!
                                            </p>
                                            <Link href="/dashboard" className="btn btn-primary mt-4">
                                                Go to Dashboard
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {gamesWithHighlights.map(({ game, card, hasCareerHigh }) => (
                                            <div key={game.id} className="relative group">
                                                {/* Career High Badge */}
                                                {hasCareerHigh && (
                                                    <div className="absolute -top-2 -right-2 z-10">
                                                        <span className="badge badge-warning gap-1">
                                                            🔥 Career High
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Card Preview */}
                                                <div
                                                    className="cursor-pointer transform transition-transform hover:scale-[1.02]"
                                                    onClick={() => setSelectedCard(card)}
                                                >
                                                    <div className="transform scale-[0.6] origin-top-left">
                                                        <HighlightCard data={card} format="square" />
                                                    </div>
                                                </div>

                                                {/* Game Info */}
                                                <div className="mt-[-100px] ml-2">
                                                    <p className="font-semibold">
                                                        vs {game.opponent}
                                                    </p>
                                                    <p className="text-sm text-base-content/60">
                                                        {formatDate(game.date)}
                                                    </p>
                                                    <button
                                                        onClick={() => setSelectedCard(card)}
                                                        className="btn btn-sm btn-primary mt-2"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                        </svg>
                                                        Share
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Weekly Recap Tab */}
                        {activeTab === "weekly" && (
                            <>
                                {!weeklyRecap ? (
                                    <div className="card bg-base-200">
                                        <div className="card-body items-center text-center py-12">
                                            <div className="text-6xl mb-4">📊</div>
                                            <h3 className="text-xl font-bold">No Recent Games</h3>
                                            <p className="text-base-content/60">
                                                Log games from the past week to generate a weekly recap card.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-6">
                                        <div
                                            className="cursor-pointer transform transition-transform hover:scale-[1.02]"
                                            onClick={() => setSelectedCard(weeklyRecap)}
                                        >
                                            <HighlightCard data={weeklyRecap} format="square" />
                                        </div>
                                        <button
                                            onClick={() => setSelectedCard(weeklyRecap)}
                                            className="btn btn-primary"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                            </svg>
                                            Share Weekly Recap
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Share Modal */}
            {selectedCard && (
                <ShareableHighlightCard
                    data={selectedCard}
                    onClose={() => setSelectedCard(null)}
                />
            )}
        </main>
    );
}
