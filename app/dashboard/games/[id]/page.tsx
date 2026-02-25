"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

type Game = {
  id: string;
  user_id: string;
  athlete_id: string | null;
  season_id: string | null;
  date: string;
  opponent: string;
  sport: string;
  minutes: number;
  points: number;
  fg_made: number;
  fg_attempted: number;
  three_made: number;
  three_attempted: number;
  ft_made: number;
  ft_attempted: number;
  rebounds_off: number;
  rebounds_def: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  stats: Record<string, number>;
  athletes?: { id: string; name: string; jersey_number: number | null } | null;
  seasons?: { id: string; name: string } | null;
};

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const supabase = createClient();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("games")
        .select("*, athletes(id, name, jersey_number), seasons(id, name)")
        .eq("id", gameId)
        .single();

      if (error || !data) {
        toast.error("Game not found");
        router.push("/dashboard/games");
        return;
      }

      setGame(data);
      setLoading(false);
    };

    fetchGame();
  }, [gameId, router]);

  const handleDelete = async () => {
    if (!game) return;
    setDeleting(true);

    const { error } = await supabase.from("games").delete().eq("id", game.id);

    if (error) {
      toast.error(error.message);
      setDeleting(false);
      return;
    }

    toast.success("Game deleted");
    router.push("/dashboard/games");
  };

  const fmtDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!game) return null;

  // Pull stats from either legacy columns or jsonb
  const stats = {
    minutes: game.minutes || game.stats?.minutes || 0,
    points: game.points || game.stats?.points || 0,
    fg_made: game.fg_made || game.stats?.fg_made || 0,
    fg_attempted: game.fg_attempted || game.stats?.fg_attempted || 0,
    three_made: game.three_made || game.stats?.three_made || 0,
    three_attempted: game.three_attempted || game.stats?.three_attempted || 0,
    ft_made: game.ft_made || game.stats?.ft_made || 0,
    ft_attempted: game.ft_attempted || game.stats?.ft_attempted || 0,
    rebounds_off: game.rebounds_off || game.stats?.rebounds_off || 0,
    rebounds_def: game.rebounds_def || game.stats?.rebounds_def || 0,
    assists: game.assists || game.stats?.assists || 0,
    steals: game.steals || game.stats?.steals || 0,
    blocks: game.blocks || game.stats?.blocks || 0,
    turnovers: game.turnovers || game.stats?.turnovers || 0,
    fouls: game.fouls || game.stats?.fouls || 0,
  };

  // Computed stats
  const totalRebounds = stats.rebounds_off + stats.rebounds_def;
  const fgPct = stats.fg_attempted > 0
    ? ((stats.fg_made / stats.fg_attempted) * 100).toFixed(1)
    : "0.0";
  const threePct = stats.three_attempted > 0
    ? ((stats.three_made / stats.three_attempted) * 100).toFixed(1)
    : "0.0";
  const ftPct = stats.ft_attempted > 0
    ? ((stats.ft_made / stats.ft_attempted) * 100).toFixed(1)
    : "0.0";

  // Advanced stats
  // Efficiency: points + reb + ast + stl + blk - to - missed FG - missed FT
  const efficiency =
    stats.points +
    totalRebounds +
    stats.assists +
    stats.steals +
    stats.blocks -
    stats.turnovers -
    (stats.fg_attempted - stats.fg_made) -
    (stats.ft_attempted - stats.ft_made);

  // Points per minute
  const ppm = stats.minutes > 0
    ? (stats.points / stats.minutes).toFixed(2)
    : "0.00";

  // Assist-to-turnover ratio
  const astToRatio = (stats.assists / Math.max(stats.turnovers, 1)).toFixed(2);

  // True shooting %: points / (2 * (fg_attempted + 0.44 * ft_attempted)) * 100
  const tsAttempts = stats.fg_attempted + 0.44 * stats.ft_attempted;
  const trueShootingPct = tsAttempts > 0
    ? ((stats.points / (2 * tsAttempts)) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-base-200 pb-8">
      {/* Header */}
      <div className="bg-base-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/games" className="btn btn-ghost btn-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Games
            </Link>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/games/new?id=${game.id}`}
                className="btn btn-ghost btn-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn btn-ghost btn-sm text-error"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Game Header */}
        <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content">
          <div className="card-body text-center py-8">
            <div className="text-sm opacity-80 mb-1">
              {game.seasons?.name || "No Season"}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {game.athletes?.name || "Unknown Athlete"}
              {game.athletes?.jersey_number && (
                <span className="opacity-80"> #{game.athletes.jersey_number}</span>
              )}
            </h1>
            <div className="text-xl md:text-2xl font-semibold mt-2">
              vs {game.opponent}
            </div>
            <div className="text-sm opacity-80 mt-1">{fmtDate(game.date)}</div>

            {/* Big stats */}
            <div className="flex justify-center gap-8 mt-6">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black">{stats.points}</div>
                <div className="text-xs opacity-70 uppercase tracking-wider">PTS</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black">{totalRebounds}</div>
                <div className="text-xs opacity-70 uppercase tracking-wider">REB</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black">{stats.assists}</div>
                <div className="text-xs opacity-70 uppercase tracking-wider">AST</div>
              </div>
            </div>
          </div>
        </div>

        {/* Shooting Stats */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-sm font-semibold text-base-content/60 uppercase tracking-wider">
              Shooting
            </h2>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className="text-center p-4 bg-base-200 rounded-lg">
                <div className="text-2xl font-bold">
                  {stats.fg_made}-{stats.fg_attempted}
                </div>
                <div className="text-lg font-semibold text-primary">{fgPct}%</div>
                <div className="text-xs text-base-content/60">FG</div>
              </div>
              <div className="text-center p-4 bg-base-200 rounded-lg">
                <div className="text-2xl font-bold">
                  {stats.three_made}-{stats.three_attempted}
                </div>
                <div className="text-lg font-semibold text-primary">{threePct}%</div>
                <div className="text-xs text-base-content/60">3PT</div>
              </div>
              <div className="text-center p-4 bg-base-200 rounded-lg">
                <div className="text-2xl font-bold">
                  {stats.ft_made}-{stats.ft_attempted}
                </div>
                <div className="text-lg font-semibold text-primary">{ftPct}%</div>
                <div className="text-xs text-base-content/60">FT</div>
              </div>
            </div>
          </div>
        </div>

        {/* Counting Stats */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-sm font-semibold text-base-content/60 uppercase tracking-wider">
              Counting Stats
            </h2>
            <div className="grid grid-cols-5 gap-3 mt-2">
              <StatBox label="PTS" value={stats.points} />
              <StatBox label="OREB" value={stats.rebounds_off} />
              <StatBox label="DREB" value={stats.rebounds_def} />
              <StatBox label="REB" value={totalRebounds} highlight />
              <StatBox label="AST" value={stats.assists} />
              <StatBox label="STL" value={stats.steals} />
              <StatBox label="BLK" value={stats.blocks} />
              <StatBox label="TO" value={stats.turnovers} negative />
              <StatBox label="PF" value={stats.fouls} />
              <StatBox label="MIN" value={stats.minutes} />
            </div>
          </div>
        </div>

        {/* Advanced Stats */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-sm font-semibold text-base-content/60 uppercase tracking-wider">
              Advanced
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              <div className="text-center p-4 bg-base-200 rounded-lg">
                <div className="text-2xl font-bold">{efficiency}</div>
                <div className="text-xs text-base-content/60">Efficiency Rating</div>
              </div>
              <div className="text-center p-4 bg-base-200 rounded-lg">
                <div className="text-2xl font-bold">{ppm}</div>
                <div className="text-xs text-base-content/60">Points/Min</div>
              </div>
              <div className="text-center p-4 bg-base-200 rounded-lg">
                <div className="text-2xl font-bold">{astToRatio}</div>
                <div className="text-xs text-base-content/60">AST/TO Ratio</div>
              </div>
              <div className="text-center p-4 bg-base-200 rounded-lg">
                <div className="text-2xl font-bold">{trueShootingPct}%</div>
                <div className="text-xs text-base-content/60">True Shooting %</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <dialog className={`modal ${showDeleteModal ? "modal-open" : ""}`}>
        <div className="modal-box max-w-sm">
          <h3 className="font-bold text-lg">Delete Game</h3>
          <p className="py-4 text-base-content/70">
            Are you sure you want to delete this game vs <strong>{game.opponent}</strong>?
            This action cannot be undone.
          </p>
          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              className="btn btn-error"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setShowDeleteModal(false)}>close</button>
        </form>
      </dialog>
    </div>
  );
}

function StatBox({
  label,
  value,
  highlight,
  negative,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={`text-center p-3 rounded-lg ${
        highlight
          ? "bg-primary/10 border border-primary/20"
          : negative
          ? "bg-error/10"
          : "bg-base-200"
      }`}
    >
      <div className={`text-xl font-bold ${negative && value > 0 ? "text-error" : ""}`}>
        {value}
      </div>
      <div className="text-[10px] text-base-content/60 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
