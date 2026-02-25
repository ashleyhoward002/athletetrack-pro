"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

type Athlete = { id: string; name: string; jersey_number: number | null };
type Season = { id: string; name: string; is_current: boolean };

// Basketball stat structure for the +/- entry UI
interface GameStats {
  // Shooting
  fg_made: number;
  fg_attempted: number;
  three_made: number;
  three_attempted: number;
  ft_made: number;
  ft_attempted: number;
  // Rebounds
  rebounds_off: number;
  rebounds_def: number;
  // Playmaking
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  // Other
  minutes: number;
  fouls: number;
}

const initialStats: GameStats = {
  fg_made: 0,
  fg_attempted: 0,
  three_made: 0,
  three_attempted: 0,
  ft_made: 0,
  ft_attempted: 0,
  rebounds_off: 0,
  rebounds_def: 0,
  assists: 0,
  steals: 0,
  blocks: 0,
  turnovers: 0,
  minutes: 0,
  fouls: 0,
};

export default function NewGamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);

  // Form state
  const [athleteId, setAthleteId] = useState("");
  const [seasonId, setSeasonId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [opponent, setOpponent] = useState("");
  const [stats, setStats] = useState<GameStats>(initialStats);

  // Computed stats
  const computed = useMemo(() => {
    const points =
      (stats.fg_made - stats.three_made) * 2 +
      stats.three_made * 3 +
      stats.ft_made;
    const totalRebounds = stats.rebounds_off + stats.rebounds_def;
    const fgPct =
      stats.fg_attempted > 0
        ? ((stats.fg_made / stats.fg_attempted) * 100).toFixed(1)
        : "0.0";
    const threePct =
      stats.three_attempted > 0
        ? ((stats.three_made / stats.three_attempted) * 100).toFixed(1)
        : "0.0";
    const ftPct =
      stats.ft_attempted > 0
        ? ((stats.ft_made / stats.ft_attempted) * 100).toFixed(1)
        : "0.0";
    // Efficiency: points + reb + ast + stl + blk - to - missed FG - missed FT
    const efficiency =
      points +
      totalRebounds +
      stats.assists +
      stats.steals +
      stats.blocks -
      stats.turnovers -
      (stats.fg_attempted - stats.fg_made) -
      (stats.ft_attempted - stats.ft_made);

    return { points, totalRebounds, fgPct, threePct, ftPct, efficiency };
  }, [stats]);

  // Fetch athletes and seasons
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [athletesRes, seasonsRes] = await Promise.all([
        supabase.from("athletes").select("id, name, jersey_number").order("name"),
        supabase.from("seasons").select("id, name, is_current").order("start_date", { ascending: false }),
      ]);

      if (athletesRes.data) {
        setAthletes(athletesRes.data);
        if (!editId && athletesRes.data.length > 0) {
          setAthleteId(athletesRes.data[0].id);
        }
      }

      if (seasonsRes.data) {
        setSeasons(seasonsRes.data);
        const currentSeason = seasonsRes.data.find((s) => s.is_current);
        if (!editId && currentSeason) {
          setSeasonId(currentSeason.id);
        }
      }

      // If editing, load the existing game
      if (editId) {
        const { data: game } = await supabase
          .from("games")
          .select("*")
          .eq("id", editId)
          .single();

        if (game) {
          setAthleteId(game.athlete_id || "");
          setSeasonId(game.season_id || "");
          setDate(game.date);
          setOpponent(game.opponent);
          setStats({
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
            minutes: game.minutes || game.stats?.minutes || 0,
            fouls: game.fouls || game.stats?.fouls || 0,
          });
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [editId]);

  // Stat increment/decrement helpers
  const increment = useCallback((key: keyof GameStats, amount = 1) => {
    setStats((prev) => ({ ...prev, [key]: Math.max(0, prev[key] + amount) }));
  }, []);

  const decrement = useCallback((key: keyof GameStats, amount = 1) => {
    setStats((prev) => ({ ...prev, [key]: Math.max(0, prev[key] - amount) }));
  }, []);

  // Save handler
  const handleSave = async () => {
    if (!athleteId) {
      toast.error("Please select an athlete");
      return;
    }
    if (!opponent.trim()) {
      toast.error("Please enter opponent name");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Not authenticated");
      setSaving(false);
      return;
    }

    // Calculate points for storage
    const points =
      (stats.fg_made - stats.three_made) * 2 +
      stats.three_made * 3 +
      stats.ft_made;

    const row = {
      user_id: user.id,
      athlete_id: athleteId,
      season_id: seasonId || null,
      date,
      opponent: opponent.trim(),
      sport: "basketball",
      // Legacy columns
      minutes: stats.minutes,
      points,
      fg_made: stats.fg_made,
      fg_attempted: stats.fg_attempted,
      three_made: stats.three_made,
      three_attempted: stats.three_attempted,
      ft_made: stats.ft_made,
      ft_attempted: stats.ft_attempted,
      rebounds_off: stats.rebounds_off,
      rebounds_def: stats.rebounds_def,
      assists: stats.assists,
      steals: stats.steals,
      blocks: stats.blocks,
      turnovers: stats.turnovers,
      fouls: stats.fouls,
      // JSONB stats
      stats: { ...stats, points },
    };

    let result;
    if (editId) {
      result = await supabase.from("games").update(row).eq("id", editId);
    } else {
      result = await supabase.from("games").insert(row).select().single();
    }

    if (result.error) {
      toast.error(result.error.message);
      setSaving(false);
      return;
    }

    toast.success(editId ? "Game updated!" : "Game saved!");

    // Redirect to game detail or list
    if (editId) {
      router.push(`/dashboard/games/${editId}`);
    } else if (result.data?.id) {
      router.push(`/dashboard/games/${result.data.id}`);
    } else {
      router.push("/dashboard/games");
    }
  };

  // Stat button component - large touch targets for mobile
  const StatButton = ({
    label,
    value,
    statKey,
    showAttempts,
    attemptKey,
  }: {
    label: string;
    value: number;
    statKey: keyof GameStats;
    showAttempts?: boolean;
    attemptKey?: keyof GameStats;
  }) => (
    <div className="flex flex-col items-center bg-base-100 rounded-xl p-3 shadow-sm">
      <span className="text-xs text-base-content/60 font-medium mb-1">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => decrement(statKey)}
          className="btn btn-circle btn-sm md:btn-md bg-base-200 hover:bg-error/20 text-lg font-bold min-h-[48px] min-w-[48px]"
          disabled={value <= 0}
        >
          −
        </button>
        <div className="text-center min-w-[40px]">
          <span className="text-2xl md:text-3xl font-bold">{value}</span>
          {showAttempts && attemptKey && (
            <span className="text-base-content/50 text-sm">/{stats[attemptKey]}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            increment(statKey);
            // Auto-increment attempts for made shots
            if (attemptKey) {
              increment(attemptKey);
            }
          }}
          className="btn btn-circle btn-sm md:btn-md bg-base-200 hover:bg-success/20 text-lg font-bold min-h-[48px] min-w-[48px]"
        >
          +
        </button>
      </div>
      {/* Miss button for shooting stats */}
      {attemptKey && (
        <button
          type="button"
          onClick={() => increment(attemptKey)}
          className="btn btn-xs btn-ghost text-base-content/50 mt-1"
        >
          Miss
        </button>
      )}
    </div>
  );

  // Simple stat button without attempts
  const SimpleStatButton = ({
    label,
    value,
    statKey,
  }: {
    label: string;
    value: number;
    statKey: keyof GameStats;
  }) => (
    <div className="flex flex-col items-center bg-base-100 rounded-xl p-3 shadow-sm">
      <span className="text-xs text-base-content/60 font-medium mb-1">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => decrement(statKey)}
          className="btn btn-circle btn-sm md:btn-md bg-base-200 hover:bg-error/20 text-lg font-bold min-h-[48px] min-w-[48px]"
          disabled={value <= 0}
        >
          −
        </button>
        <span className="text-2xl md:text-3xl font-bold min-w-[40px] text-center">
          {value}
        </span>
        <button
          type="button"
          onClick={() => increment(statKey)}
          className="btn btn-circle btn-sm md:btn-md bg-base-200 hover:bg-success/20 text-lg font-bold min-h-[48px] min-w-[48px]"
        >
          +
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const selectedAthlete = athletes.find((a) => a.id === athleteId);

  return (
    <div className="min-h-screen bg-base-200 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-base-100 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <Link href="/dashboard/games" className="btn btn-ghost btn-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-lg font-bold">
            {editId ? "Edit Game" : "Log Game"}
          </h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary btn-sm"
          >
            {saving ? (
              <span className="loading loading-spinner loading-sm" />
            ) : editId ? (
              "Update"
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>

      {/* Live Scoreboard */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-content p-4">
        <div className="text-center mb-2">
          <span className="text-sm opacity-80">
            {selectedAthlete?.name || "Select Athlete"}{" "}
            {selectedAthlete?.jersey_number && `#${selectedAthlete.jersey_number}`}
          </span>
          <span className="mx-2 opacity-60">vs</span>
          <span className="text-sm opacity-80">{opponent || "Opponent"}</span>
        </div>
        <div className="text-center">
          <span className="text-5xl md:text-6xl font-black">{computed.points}</span>
          <span className="text-xl opacity-80 ml-2">PTS</span>
        </div>
        <div className="flex justify-center gap-6 mt-3 text-sm">
          <div className="text-center">
            <div className="font-bold">{computed.totalRebounds}</div>
            <div className="opacity-70 text-xs">REB</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{stats.assists}</div>
            <div className="opacity-70 text-xs">AST</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{computed.fgPct}%</div>
            <div className="opacity-70 text-xs">FG%</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{computed.threePct}%</div>
            <div className="opacity-70 text-xs">3P%</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{computed.efficiency}</div>
            <div className="opacity-70 text-xs">EFF</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Game Info */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">Athlete</span>
                </label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={athleteId}
                  onChange={(e) => setAthleteId(e.target.value)}
                >
                  <option value="">Select...</option>
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} {a.jersey_number && `#${a.jersey_number}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">Season</span>
                </label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={seasonId}
                  onChange={(e) => setSeasonId(e.target.value)}
                >
                  <option value="">None</option>
                  {seasons.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.is_current && "★"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered input-sm w-full"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">Opponent</span>
                </label>
                <input
                  type="text"
                  placeholder="Team name"
                  className="input input-bordered input-sm w-full"
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scoring Section */}
        <div>
          <h3 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2 px-1">
            Scoring
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <StatButton
              label="2PT"
              value={stats.fg_made - stats.three_made}
              statKey="fg_made"
              showAttempts
              attemptKey="fg_attempted"
            />
            <StatButton
              label="3PT"
              value={stats.three_made}
              statKey="three_made"
              showAttempts
              attemptKey="three_attempted"
            />
            <StatButton
              label="FT"
              value={stats.ft_made}
              statKey="ft_made"
              showAttempts
              attemptKey="ft_attempted"
            />
          </div>
        </div>

        {/* Rebounds Section */}
        <div>
          <h3 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2 px-1">
            Rebounds
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <SimpleStatButton label="Offensive" value={stats.rebounds_off} statKey="rebounds_off" />
            <SimpleStatButton label="Defensive" value={stats.rebounds_def} statKey="rebounds_def" />
          </div>
        </div>

        {/* Playmaking Section */}
        <div>
          <h3 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2 px-1">
            Playmaking
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <SimpleStatButton label="Assists" value={stats.assists} statKey="assists" />
            <SimpleStatButton label="Steals" value={stats.steals} statKey="steals" />
            <SimpleStatButton label="Blocks" value={stats.blocks} statKey="blocks" />
            <SimpleStatButton label="Turnovers" value={stats.turnovers} statKey="turnovers" />
          </div>
        </div>

        {/* Other Section */}
        <div>
          <h3 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2 px-1">
            Other
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <SimpleStatButton label="Minutes" value={stats.minutes} statKey="minutes" />
            <SimpleStatButton label="Fouls" value={stats.fouls} statKey="fouls" />
          </div>
        </div>

        {/* Cancel button for edit mode */}
        {editId && (
          <div className="pt-4">
            <Link href={`/dashboard/games/${editId}`} className="btn btn-ghost w-full">
              Cancel
            </Link>
          </div>
        )}
      </div>

      {/* Floating save button for mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-base-100 border-t border-base-300 md:hidden">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary w-full"
        >
          {saving ? (
            <span className="loading loading-spinner" />
          ) : editId ? (
            "Update Game"
          ) : (
            "Save Game"
          )}
        </button>
      </div>
    </div>
  );
}
