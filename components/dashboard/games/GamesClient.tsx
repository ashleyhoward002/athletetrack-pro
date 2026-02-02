"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import GameModal, { GameFormData } from "./GameModal";
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

export default function GamesClient() {
  const supabase = createClient();
  const [games, setGames] = useState<Game[]>([]);
  const [athletes, setAthletes] = useState<SelectOption[]>([]);
  const [seasons, setSeasons] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Game | null>(null);
  const [filterAthlete, setFilterAthlete] = useState("");
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

  const handleSubmit = async (form: GameFormData) => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Not authenticated");
      setSaving(false);
      return;
    }

    const numStats: Record<string, number> = {};
    for (const [k, v] of Object.entries(form.stats)) {
      numStats[k] = parseFloat(v) || 0;
    }

    const row: Record<string, any> = {
      user_id: user.id,
      athlete_id: form.athlete_id || null,
      season_id: form.season_id || null,
      date: form.date,
      opponent: form.opponent,
      sport: form.sport,
      stats: numStats,
    };

    // Write legacy columns for basketball backward compat
    if (form.sport === "basketball") {
      row.minutes = numStats.minutes || 0;
      row.points = numStats.points || 0;
      row.fg_made = numStats.fg_made || 0;
      row.fg_attempted = numStats.fg_attempted || 0;
      row.three_made = numStats.three_made || 0;
      row.three_attempted = numStats.three_attempted || 0;
      row.ft_made = numStats.ft_made || 0;
      row.ft_attempted = numStats.ft_attempted || 0;
      row.rebounds_off = numStats.rebounds_off || 0;
      row.rebounds_def = numStats.rebounds_def || 0;
      row.assists = numStats.assists || 0;
      row.steals = numStats.steals || 0;
      row.blocks = numStats.blocks || 0;
      row.turnovers = numStats.turnovers || 0;
      row.fouls = numStats.fouls || 0;
    }

    if (editingGame) {
      const { error } = await supabase
        .from("games")
        .update(row)
        .eq("id", editingGame.id);
      if (error) toast.error(error.message);
      else toast.success("Game updated");
    } else {
      const { error } = await supabase.from("games").insert(row);
      if (error) toast.error(error.message);
      else toast.success("Game logged");
    }

    setSaving(false);
    setModalOpen(false);
    setEditingGame(null);
    fetchData();
  };

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

  const openAdd = () => {
    setEditingGame(null);
    setModalOpen(true);
  };

  const openEdit = (game: Game) => {
    setEditingGame(game);
    setModalOpen(true);
  };

  const filtered = games.filter((g) => {
    if (filterAthlete && g.athlete_id !== filterAthlete) return false;
    if (filterSport && g.sport !== filterSport) return false;
    return true;
  });

  const fmtDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const gameToFormData = (game: Game): GameFormData => {
    const sport = game.sport || DEFAULT_SPORT;
    const config = getSportConfig(sport);
    const stats: Record<string, string> = {};
    for (const field of config.statFields) {
      stats[field.key] = String(game.stats?.[field.key] ?? 0);
    }
    return {
      athlete_id: game.athlete_id ?? "",
      season_id: game.season_id ?? "",
      date: game.date,
      opponent: game.opponent,
      sport,
      stats,
    };
  };

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
        <button className="btn btn-primary" onClick={openAdd}>
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
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        {/* Sport filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            className={`btn btn-sm ${!filterSport ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilterSport("")}
          >
            All Sports
          </button>
          {SPORT_LIST.map((s) => (
            <button
              key={s.id}
              className={`btn btn-sm ${filterSport === s.id ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFilterSport(s.id)}
            >
              {s.icon} {s.name}
            </button>
          ))}
        </div>

        {/* Athlete filter */}
        {athletes.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            <span className="self-center text-xs text-base-content/50">|</span>
            <button
              className={`btn btn-sm ${!filterAthlete ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFilterAthlete("")}
            >
              All Athletes
            </button>
            {athletes.map((a) => (
              <button
                key={a.id}
                className={`btn btn-sm ${filterAthlete === a.id ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setFilterAthlete(a.id)}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
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
            <button
              className="btn btn-primary mt-4"
              onClick={openAdd}
              disabled={athletes.length === 0}
            >
              Log First Game
            </button>
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

            return (
              <div
                key={game.id}
                className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow"
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

                    {/* Middle: key stats from tableColumns (first 4) */}
                    <div className="flex gap-4 text-center flex-wrap">
                      {config.tableColumns.slice(0, 5).map((col) => (
                        <div key={col.key}>
                          <div className="text-lg font-bold leading-none">
                            {col.compute(stats)}
                          </div>
                          <div className="text-[10px] text-base-content/50 uppercase tracking-wider">
                            {col.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right: actions */}
                    <div className="flex gap-1 sm:flex-col">
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => openEdit(game)}
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
                      </button>
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

      {/* Add/Edit Modal */}
      <GameModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingGame(null);
        }}
        onSubmit={handleSubmit}
        loading={saving}
        athletes={athletes}
        seasons={seasons}
        initialData={editingGame ? gameToFormData(editingGame) : null}
      />

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
