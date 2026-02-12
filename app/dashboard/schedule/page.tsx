"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    gameToCalendarEvent,
    generateGoogleCalendarUrl,
    downloadICS,
    generateICS,
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

export default function SchedulePage() {
    const [games, setGames] = useState<ScheduledGame[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [filter, setFilter] = useState<"upcoming" | "all">("upcoming");

    const fetchGames = async () => {
        setLoading(true);
        try {
            const url = filter === "upcoming"
                ? "/api/scheduled-games?upcoming=true"
                : "/api/scheduled-games";
            const res = await fetch(url);
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
    }, [filter]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            const res = await fetch(`/api/scheduled-games?id=${deleteTarget}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Delete failed");
            toast.success("Game removed from schedule");
            fetchGames();
        } catch {
            toast.error("Failed to delete game");
        } finally {
            setDeleteTarget(null);
        }
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

    const handleExportAll = () => {
        if (games.length === 0) {
            toast.error("No games to export");
            return;
        }

        // Generate combined ICS for all games
        const events = games.map((game) => gameToCalendarEvent(game));

        // Create a combined ICS with multiple events
        const lines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//AthleteTrack Pro//Game Schedule//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
        ];

        events.forEach((event, index) => {
            const uid = `game-${index}-${Date.now()}@athletetrack.app`;
            const now = new Date();
            const formatDate = (date: Date, allDay: boolean): string => {
                if (allDay) {
                    return date.toISOString().split("T")[0].replace(/-/g, "");
                }
                return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
            };

            const endDate = event.endDate || new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000);

            lines.push("BEGIN:VEVENT");
            lines.push(`UID:${uid}`);
            lines.push(`DTSTAMP:${formatDate(now, false)}`);

            if (event.allDay) {
                lines.push(`DTSTART;VALUE=DATE:${formatDate(event.startDate, true)}`);
                lines.push(`DTEND;VALUE=DATE:${formatDate(new Date(event.startDate.getTime() + 24 * 60 * 60 * 1000), true)}`);
            } else {
                lines.push(`DTSTART:${formatDate(event.startDate, false)}`);
                lines.push(`DTEND:${formatDate(endDate, false)}`);
            }

            lines.push(`SUMMARY:${event.title.replace(/,/g, "\\,")}`);
            if (event.description) lines.push(`DESCRIPTION:${event.description.replace(/\n/g, "\\n").replace(/,/g, "\\,")}`);
            if (event.location) lines.push(`LOCATION:${event.location.replace(/,/g, "\\,")}`);
            lines.push("END:VEVENT");
        });

        lines.push("END:VCALENDAR");

        const icsContent = lines.join("\r\n");
        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "athletetrack-schedule.ics";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(`Exported ${games.length} games to calendar file`);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (timeStr: string | null) => {
        if (!timeStr) return "TBD";
        const [hours, minutes] = timeStr.split(":");
        const h = parseInt(hours);
        const ampm = h >= 12 ? "PM" : "AM";
        const hour12 = h % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const isPast = (dateStr: string) => {
        const date = new Date(dateStr + "T23:59:59");
        return date < new Date();
    };

    // Group games by month
    const groupedGames = games.reduce((acc, game) => {
        const date = new Date(game.game_date + "T00:00:00");
        const monthKey = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        if (!acc[monthKey]) acc[monthKey] = [];
        acc[monthKey].push(game);
        return acc;
    }, {} as Record<string, ScheduledGame[]>);

    return (
        <main className="min-h-screen p-4 md:p-8 pb-24">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="btn btn-circle btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-extrabold">Game Schedule</h1>
                        <p className="text-base-content/60">
                            Manage your upcoming games and sync to your calendar
                        </p>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="btn-group">
                        <button
                            className={`btn btn-sm ${filter === "upcoming" ? "btn-active" : ""}`}
                            onClick={() => setFilter("upcoming")}
                        >
                            Upcoming
                        </button>
                        <button
                            className={`btn btn-sm ${filter === "all" ? "btn-active" : ""}`}
                            onClick={() => setFilter("all")}
                        >
                            All Games
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleExportAll}
                            className="btn btn-sm btn-outline"
                            disabled={games.length === 0}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export All
                        </button>
                    </div>
                </div>

                {/* Games List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg" />
                    </div>
                ) : games.length === 0 ? (
                    <div className="card bg-base-200">
                        <div className="card-body items-center text-center py-12">
                            <div className="text-6xl mb-4">📅</div>
                            <h3 className="text-xl font-bold">No Games Scheduled</h3>
                            <p className="text-base-content/60 max-w-md">
                                {filter === "upcoming"
                                    ? "You don't have any upcoming games. Schedule one from the dashboard!"
                                    : "You haven't scheduled any games yet."}
                            </p>
                            <Link href="/dashboard" className="btn btn-primary mt-4">
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedGames).map(([month, monthGames]) => (
                            <div key={month}>
                                <h2 className="text-lg font-bold mb-3 text-base-content/70">{month}</h2>
                                <div className="space-y-3">
                                    {monthGames.map((game) => (
                                        <div
                                            key={game.id}
                                            className={`card ${isPast(game.game_date) ? "bg-base-200 opacity-60" : "bg-base-200"}`}
                                        >
                                            <div className="card-body p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="text-4xl">
                                                            {SPORT_EMOJI[game.sport] || "🏆"}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-lg">
                                                                {game.is_home_game ? "vs" : "@"} {game.opponent}
                                                            </h3>
                                                            <div className="text-sm text-base-content/60 space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    {formatDate(game.game_date)}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    {formatTime(game.game_time)}
                                                                </div>
                                                                {game.location && (
                                                                    <div className="flex items-center gap-2">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        </svg>
                                                                        {game.location}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {game.notes && (
                                                                <p className="text-sm text-base-content/50 mt-2 italic">
                                                                    {game.notes}
                                                                </p>
                                                            )}
                                                            <div className="flex gap-2 mt-2">
                                                                <span className={`badge badge-sm ${game.is_home_game ? "badge-primary" : "badge-secondary"}`}>
                                                                    {game.is_home_game ? "Home" : "Away"}
                                                                </span>
                                                                {game.reminder_enabled && (
                                                                    <span className="badge badge-sm badge-ghost">
                                                                        🔔 Reminder On
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex gap-2">
                                                        <div className="dropdown dropdown-end">
                                                            <label tabIndex={0} className="btn btn-sm btn-ghost">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                Add to Calendar
                                                            </label>
                                                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52">
                                                                <li>
                                                                    <button onClick={() => handleAddToCalendar(game, "google")}>
                                                                        Google Calendar
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button onClick={() => handleAddToCalendar(game, "ics")}>
                                                                        Download .ics File
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <button
                                                            onClick={() => setDeleteTarget(game.id)}
                                                            className="btn btn-sm btn-ghost text-error"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <dialog className={`modal ${deleteTarget ? "modal-open" : ""}`}>
                <div className="modal-box max-w-sm">
                    <h3 className="font-bold text-lg">Remove Game</h3>
                    <p className="py-4 text-base-content/70">
                        Are you sure you want to remove this game from your schedule?
                    </p>
                    <div className="modal-action">
                        <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </button>
                        <button className="btn btn-error" onClick={handleDelete}>
                            Remove
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setDeleteTarget(null)}>close</button>
                </form>
            </dialog>
        </main>
    );
}
