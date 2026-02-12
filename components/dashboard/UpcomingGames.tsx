"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    gameToCalendarEvent,
    generateGoogleCalendarUrl,
    downloadICS,
} from "@/lib/calendar";

interface ScheduledGame {
    id: string;
    sport: string;
    opponent: string;
    game_date: string;
    game_time: string | null;
    location: string | null;
    notes: string | null;
    is_home_game: boolean;
    reminder_enabled: boolean;
    athletes?: { name: string } | null;
}

const SPORT_EMOJI: Record<string, string> = {
    basketball: "🏀",
    baseball: "⚾",
    soccer: "⚽",
    football: "🏈",
    tennis: "🎾",
    volleyball: "🏐",
};

export default function UpcomingGames() {
    const [games, setGames] = useState<ScheduledGame[]>([]);
    const [loading, setLoading] = useState(true);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    const fetchGames = async () => {
        try {
            const res = await fetch("/api/scheduled-games?upcoming=true&limit=5");
            const data = await res.json();
            setGames(data.games || []);
        } catch {
            setGames([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
    }, []);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.getTime() === today.getTime()) {
            return "Today";
        }
        if (date.getTime() === tomorrow.getTime()) {
            return "Tomorrow";
        }

        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (timeStr: string | null) => {
        if (!timeStr) return null;
        const [hours, minutes] = timeStr.split(":");
        const h = parseInt(hours);
        const ampm = h >= 12 ? "PM" : "AM";
        const hour12 = h % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const getDaysUntil = (dateStr: string) => {
        const date = new Date(dateStr + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleAddToCalendar = (game: ScheduledGame, type: "google" | "ics") => {
        const event = gameToCalendarEvent(game);

        if (type === "google") {
            window.open(generateGoogleCalendarUrl(event), "_blank");
        } else {
            const filename = `${game.sport}-vs-${game.opponent.replace(/\s+/g, "-")}.ics`;
            downloadICS(event, filename);
        }
    };

    if (loading) {
        return (
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Upcoming Games</h2>
                    <div className="flex justify-center py-4">
                        <span className="loading loading-spinner" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="card-title">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Upcoming Games
                        </h2>
                        <button
                            onClick={() => setShowScheduleModal(true)}
                            className="btn btn-primary btn-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Schedule
                        </button>
                    </div>

                    {games.length === 0 ? (
                        <div className="text-center py-6">
                            <div className="text-4xl mb-2">📅</div>
                            <p className="text-base-content/60 text-sm">No upcoming games scheduled</p>
                            <button
                                onClick={() => setShowScheduleModal(true)}
                                className="btn btn-ghost btn-sm mt-2"
                            >
                                Schedule your first game
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {games.map((game) => {
                                const daysUntil = getDaysUntil(game.game_date);
                                const isToday = daysUntil === 0;
                                const isTomorrow = daysUntil === 1;

                                return (
                                    <div
                                        key={game.id}
                                        className={`card ${isToday ? "bg-primary/10 border border-primary/30" : "bg-base-100"}`}
                                    >
                                        <div className="card-body p-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-2xl">
                                                        {SPORT_EMOJI[game.sport] || "🏆"}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">
                                                            {game.is_home_game ? "vs" : "@"} {game.opponent}
                                                        </div>
                                                        <div className="text-sm text-base-content/60 flex flex-wrap items-center gap-x-2">
                                                            <span className={isToday ? "text-primary font-semibold" : isTomorrow ? "text-warning font-medium" : ""}>
                                                                {formatDate(game.game_date)}
                                                            </span>
                                                            {game.game_time && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>{formatTime(game.game_time)}</span>
                                                                </>
                                                            )}
                                                            {game.location && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="truncate max-w-[120px]">{game.location}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Calendar dropdown */}
                                                <div className="dropdown dropdown-end">
                                                    <label tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </label>
                                                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52">
                                                        <li>
                                                            <button onClick={() => handleAddToCalendar(game, "google")}>
                                                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                                    <path fill="currentColor" d="M12 22q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Z"/>
                                                                </svg>
                                                                Google Calendar
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button onClick={() => handleAddToCalendar(game, "ics")}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                </svg>
                                                                Download .ics
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>

                                            {isToday && (
                                                <div className="badge badge-primary badge-sm mt-1">Game Day!</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {games.length >= 5 && (
                                <Link href="/dashboard/schedule" className="btn btn-ghost btn-sm w-full">
                                    View All Scheduled Games
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Schedule Game Modal */}
            <ScheduleGameModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                onSuccess={() => {
                    setShowScheduleModal(false);
                    fetchGames();
                }}
            />
        </>
    );
}

// Schedule Game Modal Component
function ScheduleGameModal({
    isOpen,
    onClose,
    onSuccess,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        sport: "basketball",
        opponent: "",
        game_date: "",
        game_time: "",
        location: "",
        notes: "",
        is_home_game: true,
        reminder_enabled: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/scheduled-games", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    game_time: formData.game_time || null,
                    location: formData.location || null,
                    notes: formData.notes || null,
                }),
            });

            if (!res.ok) throw new Error("Failed to schedule game");

            // Reset form
            setFormData({
                sport: "basketball",
                opponent: "",
                game_date: "",
                game_time: "",
                location: "",
                notes: "",
                is_home_game: true,
                reminder_enabled: true,
            });

            onSuccess();
        } catch {
            alert("Failed to schedule game. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const SPORTS = [
        { id: "basketball", name: "Basketball", icon: "🏀" },
        { id: "baseball", name: "Baseball", icon: "⚾" },
        { id: "soccer", name: "Soccer", icon: "⚽" },
        { id: "football", name: "Football", icon: "🏈" },
        { id: "tennis", name: "Tennis", icon: "🎾" },
        { id: "volleyball", name: "Volleyball", icon: "🏐" },
    ];

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-lg">
                <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={onClose}
                >
                    ✕
                </button>

                <h3 className="font-bold text-lg mb-4">Schedule a Game</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Sport Selection */}
                    <div className="flex flex-wrap gap-2">
                        {SPORTS.map((sport) => (
                            <button
                                key={sport.id}
                                type="button"
                                className={`btn btn-sm ${formData.sport === sport.id ? "btn-primary" : "btn-ghost"}`}
                                onClick={() => setFormData({ ...formData, sport: sport.id })}
                            >
                                {sport.icon} {sport.name}
                            </button>
                        ))}
                    </div>

                    {/* Opponent */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Opponent</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Team name"
                            className="input input-bordered"
                            value={formData.opponent}
                            onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                            required
                        />
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Date</span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered"
                                value={formData.game_date}
                                onChange={(e) => setFormData({ ...formData, game_date: e.target.value })}
                                min={new Date().toISOString().split("T")[0]}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Time (optional)</span>
                            </label>
                            <input
                                type="time"
                                className="input input-bordered"
                                value={formData.game_time}
                                onChange={(e) => setFormData({ ...formData, game_time: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Location (optional)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Gym or field address"
                            className="input input-bordered"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    {/* Home/Away Toggle */}
                    <div className="form-control">
                        <label className="label cursor-pointer justify-start gap-3">
                            <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={formData.is_home_game}
                                onChange={(e) => setFormData({ ...formData, is_home_game: e.target.checked })}
                            />
                            <span className="label-text">
                                {formData.is_home_game ? "Home Game" : "Away Game"}
                            </span>
                        </label>
                    </div>

                    {/* Reminder Toggle */}
                    <div className="form-control">
                        <label className="label cursor-pointer justify-start gap-3">
                            <input
                                type="checkbox"
                                className="toggle toggle-success"
                                checked={formData.reminder_enabled}
                                onChange={(e) => setFormData({ ...formData, reminder_enabled: e.target.checked })}
                            />
                            <span className="label-text">
                                Send me a reminder before the game
                            </span>
                        </label>
                    </div>

                    {/* Notes */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Notes (optional)</span>
                        </label>
                        <textarea
                            placeholder="Any notes about this game..."
                            className="textarea textarea-bordered"
                            rows={2}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    {/* Submit */}
                    <div className="modal-action">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`btn btn-primary ${loading ? "loading" : ""}`}
                            disabled={loading}
                        >
                            {loading ? "Scheduling..." : "Schedule Game"}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
}
