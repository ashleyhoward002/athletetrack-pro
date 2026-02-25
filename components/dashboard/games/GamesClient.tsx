"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import {
  SportId,
  DEFAULT_SPORT,
  SPORT_LIST,
  getSportConfig,
} from "@/lib/sports/config";

type Game = {
  id: string;
  athlete_id: string | null;
  season_id: string | null;
  date: string;
  opponent: string;
  sport: SportId;
  stats: Record<string, number>;
  created_at: string;
  athletes?: { id: string; name: string } | null;
  seasons?: { id: string; name: string } | null;
};

type SelectOption = { id: string; label: string };

// Calculate efficiency rating
function calcEfficiency(stats: Record<string, number>): number {
  const points = stats.points || 0;
  const reboundsOff = stats.rebounds_off || 0;
  const reboundsDef = stats.rebounds_def || 0;
  const assists = stats.assists || 0;
  const steals = stats.steals || 0;
  const blocks = stats.blocks || 0;
  const turnovers = stats.turnovers || 0;
  const fgAttempted = stats.fg_attempted || 0;
  const fgMade = stats.fg_made || 0;
  const ftAttempted = stats.ft_attempted || 0;
  const ftMade = stats.ft_made || 0;

  return (
    points +
    reboundsOff +
    reboundsDef +
    assists +
    steals +
    blocks -
    turnovers -
    (fgAttempted - fgMade) -
    (ftAttempted - ftMade)
  );
}

export default function GamesClient() {
  const router = useRouter();
  const supabase = createClient();
  const [games, setGames] = useState<Game[]>([]);
  const [athletes, setAthletes] = useState<SelectOption[]>([]);
  const [seasons, setSeasons] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Game | null>(null);
  const [filterAthlete, setFilterAthlete] = useState("");
  const [filterSeason, setFilterSeason] = useState("");
  const [filterSport, setFilterSport] = useState<SportId | "">("");

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [gamesRes, athletesRes, seasonsRes] = await Promise.all([
      supabase
        .from("games")
        .select("*, athletes(id, name), seasons(id, name)")
        .order("date", { ascending: false }),
      supabase.from("athletes").select("id, name").order("name"),
      supabase.from("seasons").select("id, name").order("start_date", { ascending: false }),
    ]);

    if (gamesRes.error) {
      toast.error("Failed to load games");
    } else {
      setGames(gamesRes.data || []);
    }

    setAthletes(
      (athletesRes.data || []).map((a) => ({ id: a.id, label: a.name }))
    );
    setSeasons(
      (seasonsRes.data || []).map((s) => ({ id: s.id, label: s.name }))
    );

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase
      .from("games")
      .delete()
      .eq("id", deleteTarget.id);
    if (error) toast.error(error.message);
    else toast.success("Game deleted");
    setDeleteTarget(null);
    fetchData();
  };

  const filtered = games.filter((g) => {
    if (filterAthlete && g.athlete_id !== filterAthlete) return false;
    if (filterSeason && g.season_id !== filterSeason) return false;
    if (filterSport && g.sport !== filterSport) return false;
    return true;
  });

  const fmtDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Games</h1>
          <p className="text-base-content/70 mt-1">
            {games.length} game{games.length !== 1 && "s"} recorded
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/games/stats" className="btn btn-ghost">
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Stats
          </Link>
          <Link href="/dashboard/games/new" className="btn btn-primary">
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Log Game
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap items-center">
        {/* Athlete filter dropdown */}
        <select
          className="select select-bordered select-sm"
          value={filterAthlete}
          onChange={(e) => setFilterAthlete(e.target.value)}
        >
          <option value="">All Athletes</option>
          {athletes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>

        {/* Season filter dropdown */}
        <select
          className="select select-bordered select-sm"
          value={filterSeason}
          onChange={(e) => setFilterSeason(e.target.value)}
        >
          <option value="">All Seasons</option>
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Sport filter buttons */}
        <div className="flex gap-1 flex-wrap">
          <button
            className={`btn btn-xs ${!filterSport ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilterSport("")}
          >
            All
          </button>
          {SPORT_LIST.map((s) => (
            <button
              key={s.id}
              className={`btn btn-xs ${filterSport === s.id ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFilterSport(s.id)}
            >
              {s.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {/* Empty */}
      {!loading && games.length === 0 && (
        <div className="card bg-base-100 shadow">
          <div className="card-body items-center text-center py-16">
            <svg
              className="w-16 h-16 text-base-content/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold mt-4">No games yet</h3>
            <p className="text-base-content/60 max-w-sm">
              {athletes.length === 0
                ? "Add an athlete first, then log their games here."
                : "Log your first game to start tracking performance."}
            </p>
            <Link
              href="/dashboard/games/new"
              className={`btn btn-primary mt-4 ${athletes.length === 0 ? "btn-disabled" : ""}`}
            >
              Log First Game
            </Link>
          </div>
        </div>
      )}

      {/* Game cards */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((game) => {
            const sport = game.sport || DEFAULT_SPORT;
            const config = getSportConfig(sport);
            const stats = game.stats || {};
            const totalRebounds = (stats.rebounds_off || 0) + (stats.rebounds_def || 0);
            const fgPct = stats.fg_attempted > 0
              ? ((stats.fg_made / stats.fg_attempted) * 100).toFixed(0) + "%"
              : "-";
            const efficiency = calcEfficiency(stats);

            return (
              <div
                key={game.id}
                className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/games/${game.id}`)}
              >
                <div className="card-body p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Left: date, opponent, athlete, sport badge */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm">{config.icon}</span>
                        <span className="font-semibold">
                          vs {game.opponent}
                        </span>
                        <span className="text-sm text-base-content/50">
                          {fmtDate(game.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-base-content/50">
                        {game.athletes && (
                          <span className="badge badge-ghost badge-xs">
                            {game.athletes.name}
                          </span>
                        )}
                        {game.seasons && (
                          <span className="badge badge-ghost badge-xs">
                            {game.seasons.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: key stats */}
                    <div className="flex gap-4 text-center flex-wrap">
                      <div>
                        <div className="text-lg font-bold leading-none">{stats.points || 0}</div>
                        <div className="text-[10px] text-base-content/50 uppercase tracking-wider">PTS</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold leading-none">{totalRebounds}</div>
                        <div className="text-[10px] text-base-content/50 uppercase tracking-wider">REB</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold leading-none">{stats.assists || 0}</div>
                        <div className="text-[10px] text-base-content/50 uppercase tracking-wider">AST</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold leading-none">{fgPct}</div>
                        <div className="text-[10px] text-base-content/50 uppercase tracking-wider">FG%</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold leading-none">{efficiency}</div>
                        <div className="text-[10px] text-base-content/50 uppercase tracking-wider">EFF</div>
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex gap-1 sm:flex-col" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/dashboard/games/new?id=${game.id}`}
                        className="btn btn-ghost btn-xs"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </Link>
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => setDeleteTarget(game)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No filter results */}
      {!loading && games.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12 text-base-content/50">
          No games match the current filters.
        </div>
      )}

      {/* Delete Confirmation */}
      <dialog className={`modal ${deleteTarget ? "modal-open" : ""}`}>
        <div className="modal-box max-w-sm">
          <h3 className="font-bold text-lg">Delete Game</h3>
          <p className="py-4 text-base-content/70">
            Delete the game vs <strong>{deleteTarget?.opponent}</strong> on{" "}
            {deleteTarget?.date}? This cannot be undone.
          </p>
          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button className="btn btn-error" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setDeleteTarget(null)}>close</button>
        </form>
      </dialog>
    </>
  );
}
