"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { useGameTimer } from "@/hooks/useGameTimer";
import SimpleModeButton from "@/components/games/SimpleModeButton";
import StickyScoreBanner from "@/components/games/StickyScoreBanner";
import FollowUpModal from "@/components/games/FollowUpModal";
import EventLog, { GameEvent } from "@/components/games/EventLog";

type Athlete = { id: string; name: string; jersey_number: number | null };
type Season = { id: string; name: string; is_current: boolean };
type EntryMode = "simple" | "advanced";

// Basketball stat structure for the +/- entry UI
interface GameStats {
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

// Tooltips for Simple Mode
const tooltips = {
  made_2pt: "A basket from inside the 3-point line",
  made_3pt: "A basket from behind the 3-point line",
  made_ft: "A successful free throw after a foul",
  missed_shot: "Any shot that didn't go in",
  missed_ft: "A free throw attempt that didn't go in",
  rebound: "Grabbing the ball after a missed shot",
  assist: "A pass that leads to a teammate scoring",
  steal: "Taking the ball from the other team",
  block: "Swatting away the opponent's shot",
  turnover: "Losing the ball (bad pass, travel, etc.)",
  foul: "Illegal contact with an opponent",
};

export default function NewGamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const supabase = createClient();

  // Mode state - load from localStorage
  const [mode, setMode] = useState<EntryMode>("simple");
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

  // Simple mode state
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [followUp, setFollowUp] = useState<{
    type: "missed_shot" | "rebound";
    pendingEvent?: Partial<GameEvent>;
  } | null>(null);
  const [flashScore, setFlashScore] = useState(false);
  const timer = useGameTimer();

  // Load mode preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("game_entry_mode");
    if (savedMode === "advanced") {
      setMode("advanced");
    }
  }, []);

  // Save mode preference
  const toggleMode = () => {
    const newMode = mode === "simple" ? "advanced" : "simple";
    setMode(newMode);
    localStorage.setItem("game_entry_mode", newMode);
  };

  // Calculate stats from events (for Simple mode)
  const statsFromEvents = useMemo(() => {
    const activeEvents = events.filter((e) => !e.is_undone);
    const result = { ...initialStats };

    activeEvents.forEach((event) => {
      switch (event.event_type) {
        case "made_2pt":
          result.fg_made += 1;
          result.fg_attempted += 1;
          break;
        case "made_3pt":
          result.three_made += 1;
          result.three_attempted += 1;
          result.fg_made += 1;
          result.fg_attempted += 1;
          break;
        case "made_ft":
          result.ft_made += 1;
          result.ft_attempted += 1;
          break;
        case "missed_2pt":
          result.fg_attempted += 1;
          break;
        case "missed_3pt":
          result.three_attempted += 1;
          result.fg_attempted += 1;
          break;
        case "missed_ft":
          result.ft_attempted += 1;
          break;
        case "rebound_off":
          result.rebounds_off += 1;
          break;
        case "rebound_def":
          result.rebounds_def += 1;
          break;
        case "assist":
          result.assists += 1;
          break;
        case "steal":
          result.steals += 1;
          break;
        case "block":
          result.blocks += 1;
          break;
        case "turnover":
          result.turnovers += 1;
          break;
        case "foul":
          result.fouls += 1;
          break;
      }
    });

    return result;
  }, [events]);

  // Computed stats (works for both modes)
  const computed = useMemo(() => {
    const s = mode === "simple" ? statsFromEvents : stats;
    const points =
      (s.fg_made - s.three_made) * 2 + s.three_made * 3 + s.ft_made;
    const totalRebounds = s.rebounds_off + s.rebounds_def;
    const fgPct =
      s.fg_attempted > 0
        ? ((s.fg_made / s.fg_attempted) * 100).toFixed(1)
        : "0.0";
    const threePct =
      s.three_attempted > 0
        ? ((s.three_made / s.three_attempted) * 100).toFixed(1)
        : "0.0";
    const ftPct =
      s.ft_attempted > 0 ? ((s.ft_made / s.ft_attempted) * 100).toFixed(1) : "0.0";
    const efficiency =
      points +
      totalRebounds +
      s.assists +
      s.steals +
      s.blocks -
      s.turnovers -
      (s.fg_attempted - s.fg_made) -
      (s.ft_attempted - s.ft_made);

    return { points, totalRebounds, fgPct, threePct, ftPct, efficiency, assists: s.assists };
  }, [mode, stats, statsFromEvents]);

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

      // If editing, load the existing game and switch to advanced mode
      if (editId) {
        setMode("advanced");
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

  // Advanced mode helpers
  const increment = useCallback((key: keyof GameStats, amount = 1) => {
    setStats((prev) => ({ ...prev, [key]: Math.max(0, prev[key] + amount) }));
  }, []);

  const decrement = useCallback((key: keyof GameStats, amount = 1) => {
    setStats((prev) => ({ ...prev, [key]: Math.max(0, prev[key] - amount) }));
  }, []);

  // Simple mode: Add event
  const addEvent = useCallback(
    async (eventType: string) => {
      const newEvent: GameEvent = {
        id: crypto.randomUUID(),
        event_type: eventType,
        game_clock_seconds: timer.seconds,
        created_at: new Date().toISOString(),
        is_undone: false,
      };

      setEvents((prev) => [...prev, newEvent]);

      // Flash the score
      setFlashScore(true);
      setTimeout(() => setFlashScore(false), 300);

      // Haptic feedback
      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }
    },
    [timer.seconds]
  );

  // Simple mode: Undo last event
  const undoLastEvent = useCallback(() => {
    setEvents((prev) => {
      const lastActive = [...prev].reverse().find((e) => !e.is_undone);
      if (!lastActive) return prev;
      return prev.map((e) =>
        e.id === lastActive.id ? { ...e, is_undone: true } : e
      );
    });
  }, []);

  // Handle simple mode button clicks
  const handleSimpleAction = (action: string) => {
    switch (action) {
      case "made_2pt":
      case "made_3pt":
      case "made_ft":
      case "assist":
      case "steal":
      case "block":
      case "turnover":
      case "foul":
        addEvent(action);
        break;
      case "missed_shot":
        setFollowUp({ type: "missed_shot" });
        break;
      case "missed_ft":
        addEvent("missed_ft");
        break;
      case "rebound":
        setFollowUp({ type: "rebound" });
        break;
    }
  };

  // Handle follow-up selection
  const handleFollowUpSelect = (value: string) => {
    if (followUp?.type === "missed_shot") {
      addEvent(value === "yes" ? "missed_3pt" : "missed_2pt");
    } else if (followUp?.type === "rebound") {
      addEvent(value === "off" ? "rebound_off" : "rebound_def");
    }
    setFollowUp(null);
  };

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

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Not authenticated");
      setSaving(false);
      return;
    }

    // Use stats from events in simple mode, direct stats in advanced mode
    const finalStats = mode === "simple" ? statsFromEvents : stats;
    finalStats.minutes = mode === "simple" ? Math.floor(timer.seconds / 60) : stats.minutes;

    const points =
      (finalStats.fg_made - finalStats.three_made) * 2 +
      finalStats.three_made * 3 +
      finalStats.ft_made;

    const row = {
      user_id: user.id,
      athlete_id: athleteId,
      season_id: seasonId || null,
      date,
      opponent: opponent.trim(),
      sport: "basketball",
      minutes: finalStats.minutes,
      points,
      fg_made: finalStats.fg_made,
      fg_attempted: finalStats.fg_attempted,
      three_made: finalStats.three_made,
      three_attempted: finalStats.three_attempted,
      ft_made: finalStats.ft_made,
      ft_attempted: finalStats.ft_attempted,
      rebounds_off: finalStats.rebounds_off,
      rebounds_def: finalStats.rebounds_def,
      assists: finalStats.assists,
      steals: finalStats.steals,
      blocks: finalStats.blocks,
      turnovers: finalStats.turnovers,
      fouls: finalStats.fouls,
      stats: { ...finalStats, points },
    };

    let gameId = editId;

    if (editId) {
      const result = await supabase.from("games").update(row).eq("id", editId);
      if (result.error) {
        toast.error(result.error.message);
        setSaving(false);
        return;
      }
    } else {
      const result = await supabase.from("games").insert(row).select().single();
      if (result.error) {
        toast.error(result.error.message);
        setSaving(false);
        return;
      }
      gameId = result.data?.id;
    }

    // Save events to game_events table (only in simple mode for new games)
    if (mode === "simple" && !editId && gameId && events.length > 0) {
      const eventRows = events.map((e) => ({
        game_id: gameId,
        athlete_id: athleteId,
        user_id: user.id,
        event_type: e.event_type,
        game_clock_seconds: e.game_clock_seconds,
        is_undone: e.is_undone,
      }));

      await supabase.from("game_events").insert(eventRows);
    }

    toast.success(editId ? "Game updated!" : "Game saved!");

    if (gameId) {
      router.push(`/dashboard/games/${gameId}`);
    } else {
      router.push("/dashboard/games");
    }
  };

  // Advanced mode stat buttons
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
            if (attemptKey) increment(attemptKey);
          }}
          className="btn btn-circle btn-sm md:btn-md bg-base-200 hover:bg-success/20 text-lg font-bold min-h-[48px] min-w-[48px]"
        >
          +
        </button>
      </div>
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
      <div className="bg-base-100 shadow-sm">
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
            onClick={toggleMode}
            className="btn btn-ghost btn-sm text-xs"
          >
            {mode === "simple" ? "Advanced" : "Simple"} →
          </button>
        </div>
      </div>

      {/* Game Info - shown in both modes */}
      <div className="p-4">
        <div className="card bg-base-100 shadow-sm mb-4">
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
            </div>
          </div>
        </div>
      </div>

      {/* SIMPLE MODE */}
      {mode === "simple" && (
        <div className="px-4 space-y-4">
          {/* Sticky Score Banner */}
          <StickyScoreBanner
            athleteName={selectedAthlete?.name || ""}
            opponent={opponent}
            points={computed.points}
            rebounds={computed.totalRebounds}
            assists={computed.assists}
            timerFormatted={timer.formatted}
            isTimerRunning={timer.isRunning}
            onTimerToggle={timer.toggle}
            flashScore={flashScore}
          />

          {/* Scoring Buttons (Large) */}
          <div className="space-y-3">
            <SimpleModeButton
              label="Made 2-Pointer"
              subtitle="+2 points"
              tooltip={tooltips.made_2pt}
              color="teal"
              size="large"
              onClick={() => handleSimpleAction("made_2pt")}
            />
            <SimpleModeButton
              label="Made 3-Pointer"
              subtitle="+3 points"
              tooltip={tooltips.made_3pt}
              color="orange"
              size="large"
              onClick={() => handleSimpleAction("made_3pt")}
            />
            <SimpleModeButton
              label="Made Free Throw"
              subtitle="+1 point"
              tooltip={tooltips.made_ft}
              color="mint"
              size="large"
              onClick={() => handleSimpleAction("made_ft")}
            />
          </div>

          {/* Missed Shots */}
          <div className="grid grid-cols-2 gap-3">
            <SimpleModeButton
              label="Missed Shot"
              tooltip={tooltips.missed_shot}
              color="gray"
              size="medium"
              onClick={() => handleSimpleAction("missed_shot")}
            />
            <SimpleModeButton
              label="Missed Free Throw"
              tooltip={tooltips.missed_ft}
              color="gray"
              size="medium"
              onClick={() => handleSimpleAction("missed_ft")}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-base-300" />
            <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
              Play Stats
            </span>
            <div className="flex-1 h-px bg-base-300" />
          </div>

          {/* Play Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <SimpleModeButton
              label="Rebound"
              tooltip={tooltips.rebound}
              color="teal"
              size="medium"
              onClick={() => handleSimpleAction("rebound")}
            />
            <SimpleModeButton
              label="Assist"
              tooltip={tooltips.assist}
              color="teal"
              size="medium"
              onClick={() => handleSimpleAction("assist")}
            />
            <SimpleModeButton
              label="Steal"
              tooltip={tooltips.steal}
              color="teal"
              size="medium"
              onClick={() => handleSimpleAction("steal")}
            />
            <SimpleModeButton
              label="Block"
              tooltip={tooltips.block}
              color="teal"
              size="medium"
              onClick={() => handleSimpleAction("block")}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-base-300" />
            <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
              Negative Plays
            </span>
            <div className="flex-1 h-px bg-base-300" />
          </div>

          {/* Negative Play Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <SimpleModeButton
              label="Turnover"
              tooltip={tooltips.turnover}
              color="red"
              size="small"
              onClick={() => handleSimpleAction("turnover")}
            />
            <SimpleModeButton
              label="Foul"
              tooltip={tooltips.foul}
              color="red"
              size="small"
              onClick={() => handleSimpleAction("foul")}
            />
          </div>

          {/* Event Log */}
          <EventLog
            events={events}
            onUndo={undoLastEvent}
            canUndo={events.some((e) => !e.is_undone)}
          />
        </div>
      )}

      {/* ADVANCED MODE */}
      {mode === "advanced" && (
        <div className="px-4 space-y-4">
          {/* Live Scoreboard */}
          <div className="bg-gradient-to-r from-primary to-secondary text-primary-content p-4 rounded-xl">
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

          {editId && (
            <div className="pt-4">
              <Link href={`/dashboard/games/${editId}`} className="btn btn-ghost w-full">
                Cancel
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Follow-up Modal */}
      <FollowUpModal
        isOpen={followUp !== null}
        question={
          followUp?.type === "missed_shot"
            ? "Was it a 3-pointer?"
            : "Offensive or Defensive?"
        }
        options={
          followUp?.type === "missed_shot"
            ? [
                { label: "Yes, 3-pointer", value: "yes", color: "orange" },
                { label: "No, 2-pointer", value: "no", color: "teal" },
              ]
            : [
                { label: "Offensive", value: "off", color: "orange" },
                { label: "Defensive", value: "def", color: "teal" },
              ]
        }
        onSelect={handleFollowUpSelect}
        onClose={() => {
          // Default behavior when skipped
          if (followUp?.type === "missed_shot") {
            addEvent("missed_2pt");
          } else if (followUp?.type === "rebound") {
            addEvent("rebound_def");
          }
          setFollowUp(null);
        }}
      />

      {/* Floating save button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-base-100 border-t border-base-300">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary w-full"
          style={{ backgroundColor: "#00B4D8" }}
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
