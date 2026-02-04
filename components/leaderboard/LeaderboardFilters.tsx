"use client";

import { LeaderboardCategory, LeaderboardTimePeriod, Team } from "@/types/training";
import { SportId, SPORT_LIST } from "@/lib/sports/config";

interface LeaderboardFiltersProps {
    category: LeaderboardCategory;
    setCategory: (c: LeaderboardCategory) => void;
    timePeriod: LeaderboardTimePeriod;
    setTimePeriod: (t: LeaderboardTimePeriod) => void;
    sport: SportId | null;
    setSport: (s: SportId | null) => void;
    teamId: string | null;
    setTeamId: (id: string | null) => void;
    myTeams: Team[];
}

const CATEGORIES: { value: LeaderboardCategory; label: string }[] = [
    { value: "xp", label: "XP / Level" },
    { value: "streaks", label: "Streaks" },
    { value: "drills", label: "Drills" },
    { value: "badges", label: "Badges" },
];

const TIME_PERIODS: { value: LeaderboardTimePeriod; label: string }[] = [
    { value: "all_time", label: "All Time" },
    { value: "weekly", label: "This Week" },
    { value: "monthly", label: "This Month" },
];

const hasTimePeriod = (category: LeaderboardCategory) =>
    category === "xp" || category === "drills";

const hasSportFilter = (category: LeaderboardCategory) =>
    category === "xp" || category === "drills";

export default function LeaderboardFilters({
    category, setCategory,
    timePeriod, setTimePeriod,
    sport, setSport,
    teamId, setTeamId,
    myTeams,
}: LeaderboardFiltersProps) {
    return (
        <div className="space-y-3">
            {/* Scope: Global vs Teams */}
            {myTeams.length > 0 && (
                <div className="tabs tabs-boxed bg-base-200 inline-flex">
                    <button
                        className={`tab ${teamId === null ? "tab-active" : ""}`}
                        onClick={() => setTeamId(null)}
                    >
                        Global
                    </button>
                    {myTeams.map((team) => (
                        <button
                            key={team.id}
                            className={`tab ${teamId === team.id ? "tab-active" : ""}`}
                            onClick={() => setTeamId(team.id)}
                        >
                            {team.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Category */}
            <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                    <button
                        key={c.value}
                        className={`btn btn-sm ${category === c.value ? "btn-primary" : "btn-ghost border border-base-300"}`}
                        onClick={() => setCategory(c.value)}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {/* Time Period + Sport Filter */}
            <div className="flex flex-wrap items-center gap-3">
                {hasTimePeriod(category) && (
                    <div className="tabs tabs-boxed tabs-sm bg-base-200">
                        {TIME_PERIODS.map((tp) => (
                            <button
                                key={tp.value}
                                className={`tab tab-sm ${timePeriod === tp.value ? "tab-active" : ""}`}
                                onClick={() => setTimePeriod(tp.value)}
                            >
                                {tp.label}
                            </button>
                        ))}
                    </div>
                )}

                {hasSportFilter(category) && (
                    <div className="flex gap-1">
                        <button
                            className={`btn btn-xs ${sport === null ? "btn-secondary" : "btn-ghost border border-base-300"}`}
                            onClick={() => setSport(null)}
                        >
                            All Sports
                        </button>
                        {SPORT_LIST.map((s) => (
                            <button
                                key={s.id}
                                className={`btn btn-xs ${sport === s.id ? "btn-secondary" : "btn-ghost border border-base-300"}`}
                                onClick={() => setSport(s.id)}
                            >
                                {s.icon} {s.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
