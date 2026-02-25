"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

type Athlete = { id: string; name: string; jersey_number: number | null };
type Season = { id: string; name: string; is_current: boolean };

interface QuickStats {
  fg_made: number;
  fg_attempted: number;
  three_made: number;
  three_attempted: number;
  ft_made: number;
  ft_attempted: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
}

const initialStats: QuickStats = {
  fg_made: 0,
  fg_attempted: 0,
  three_made: 0,
  three_attempted: 0,
  ft_made: 0,
  ft_attempted: 0,
  rebounds: 0,
  assists: 0,
  steals: 0,
  blocks: 0,
  turnovers: 0,
  fouls: 0,
};

export default function QuickStatEntry() {
  const router = useRouter();
  const supabase = createClient();

  const [isOpen, setIsOpen] = useState(false);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [athleteId, setAthleteId] = useState("");
  const [seasonId, setSeasonId] = useState("");
  const [opponent, setOpponent] = useState("");
  const [stats, setStats] = useState<QuickStats>(initialStats);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Calculate points
  const twoPointers = stats.fg_made - stats.three_made;
  const points = twoPointers * 2 + stats.three_made * 3 + stats.ft_made;

  // Fetch athletes and seasons on mount
  useEffect(() => {
    const fetchData = async () => {
      const [athletesRes, seasonsRes] = await Promise.all([
        supabase.from("athletes").select("id, name, jersey_number").order("name"),
        supabase.from("seasons").select("id, name, is_current").order("start_date", { ascending: false }),
      ]);

      if (athletesRes.data) {
        setAthletes(athletesRes.data);
        if (athletesRes.data.length > 0) {
          setAthleteId(athletesRes.data[0].id);
        }
      }

      if (seasonsRes.data) {
        setSeasons(seasonsRes.data);
        const currentSeason = seasonsRes.data.find((s) => s.is_current);
        if (currentSeason) {
          setSeasonId(currentSeason.id);
        }
      }

      setInitialized(true);
    };

    fetchData();
  }, []);

  const increment = useCallback((key: keyof QuickStats, amount = 1) => {
    setStats((prev) => ({ ...prev, [key]: prev[key] + amount }));
  }, []);

  const handleSaveAndClose = async () => {
    if (!athleteId) {
      toast.error("Select an athlete");
      return;
    }
    if (!opponent.trim()) {
      toast.error("Enter opponent name");
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

    // Split rebounds evenly between off/def (user can adjust in full form)
    const rebOff = Math.floor(stats.rebounds / 2);
    const rebDef = stats.rebounds - rebOff;

    const row = {
      user_id: user.id,
      athlete_id: athleteId,
      season_id: seasonId || null,
      date: new Date().toISOString().split("T")[0],
      opponent: opponent.trim(),
      sport: "basketball",
      minutes: 0,
      points,
      fg_made: stats.fg_made,
      fg_attempted: stats.fg_attempted,
      three_made: stats.three_made,
      three_attempted: stats.three_attempted,
      ft_made: stats.ft_made,
      ft_attempted: stats.ft_attempted,
      rebounds_off: rebOff,
      rebounds_def: rebDef,
      assists: stats.assists,
      steals: stats.steals,
      blocks: stats.blocks,
      turnovers: stats.turnovers,
      fouls: stats.fouls,
      stats: {
        ...stats,
        points,
        rebounds_off: rebOff,
        rebounds_def: rebDef,
      },
    };

    const { error } = await supabase.from("games").insert(row);

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    toast.success("Game saved!");
    setStats(initialStats);
    setOpponent("");
    setIsOpen(false);
    setSaving(false);
  };

  const handleExpand = () => {
    // Build query params to preserve current data
    const params = new URLSearchParams();
    if (athleteId) params.set("athlete", athleteId);
    if (seasonId) params.set("season", seasonId);
    if (opponent) params.set("opponent", opponent);

    // Store stats in sessionStorage for the full form to pick up
    sessionStorage.setItem("quickEntryStats", JSON.stringify({
      ...stats,
      points,
      rebounds_off: Math.floor(stats.rebounds / 2),
      rebounds_def: stats.rebounds - Math.floor(stats.rebounds / 2),
    }));

    router.push(`/dashboard/games/new?${params.toString()}`);
  };

  const selectedAthlete = athletes.find((a) => a.id === athleteId);

  // Quick action button
  const QuickButton = ({
    label,
    onClick,
    color = "primary",
    size = "normal",
  }: {
    label: string;
    onClick: () => void;
    color?: "primary" | "success" | "error" | "warning";
    size?: "normal" | "small";
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`btn ${
        size === "small" ? "btn-sm" : ""
      } btn-${color} flex-1 min-h-[44px] text-xs font-bold`}
    >
      {label}
    </button>
  );

  if (!initialized) return null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 btn btn-circle btn-lg btn-primary shadow-xl"
        aria-label="Quick stat entry"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="relative bg-base-100 w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary text-primary-content p-4 rounded-t-2xl sm:rounded-t-2xl">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost btn-sm btn-circle text-primary-content"
                >
                  ✕
                </button>
                <div className="text-center flex-1">
                  <div className="text-sm opacity-80">
                    {selectedAthlete?.name || "Select Athlete"}
                    {selectedAthlete?.jersey_number && ` #${selectedAthlete.jersey_number}`}
                  </div>
                  <div className="text-xs opacity-60">
                    vs {opponent || "Opponent"}
                  </div>
                </div>
                <div className="w-8" /> {/* Spacer */}
              </div>
              <div className="text-center mt-2">
                <span className="text-4xl font-black">{points}</span>
                <span className="text-lg opacity-80 ml-1">PTS</span>
              </div>
            </div>

            {/* Setup (collapsed when opponent is set) */}
            {!opponent && (
              <div className="p-4 border-b border-base-200 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="select select-bordered select-sm w-full"
                    value={athleteId}
                    onChange={(e) => setAthleteId(e.target.value)}
                  >
                    {athletes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Opponent"
                    className="input input-bordered input-sm w-full"
                    value={opponent}
                    onChange={(e) => setOpponent(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Quick Stat Buttons */}
            <div className="p-4 space-y-3">
              {/* Shooting */}
              <div className="grid grid-cols-3 gap-2">
                <QuickButton
                  label={`2PT ✓ (${twoPointers})`}
                  onClick={() => {
                    increment("fg_made");
                    increment("fg_attempted");
                  }}
                  color="success"
                />
                <QuickButton
                  label={`3PT ✓ (${stats.three_made})`}
                  onClick={() => {
                    increment("fg_made");
                    increment("fg_attempted");
                    increment("three_made");
                    increment("three_attempted");
                  }}
                  color="success"
                />
                <QuickButton
                  label={`FT ✓ (${stats.ft_made})`}
                  onClick={() => {
                    increment("ft_made");
                    increment("ft_attempted");
                  }}
                  color="success"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <QuickButton
                  label="2PT ✗"
                  onClick={() => increment("fg_attempted")}
                  color="error"
                  size="small"
                />
                <QuickButton
                  label="3PT ✗"
                  onClick={() => {
                    increment("fg_attempted");
                    increment("three_attempted");
                  }}
                  color="error"
                  size="small"
                />
                <QuickButton
                  label="FT ✗"
                  onClick={() => increment("ft_attempted")}
                  color="error"
                  size="small"
                />
              </div>

              {/* Other stats */}
              <div className="grid grid-cols-4 gap-2">
                <QuickButton
                  label={`REB (${stats.rebounds})`}
                  onClick={() => increment("rebounds")}
                  color="primary"
                />
                <QuickButton
                  label={`AST (${stats.assists})`}
                  onClick={() => increment("assists")}
                  color="primary"
                />
                <QuickButton
                  label={`STL (${stats.steals})`}
                  onClick={() => increment("steals")}
                  color="primary"
                />
                <QuickButton
                  label={`BLK (${stats.blocks})`}
                  onClick={() => increment("blocks")}
                  color="primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <QuickButton
                  label={`TO (${stats.turnovers})`}
                  onClick={() => increment("turnovers")}
                  color="warning"
                />
                <QuickButton
                  label={`FOUL (${stats.fouls})`}
                  onClick={() => increment("fouls")}
                  color="warning"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleSaveAndClose}
                  disabled={saving || !opponent}
                  className="btn btn-primary w-full"
                >
                  {saving ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    "Save & Close"
                  )}
                </button>
                <button
                  onClick={handleExpand}
                  className="btn btn-ghost btn-sm w-full"
                >
                  Expand to Full Form →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
