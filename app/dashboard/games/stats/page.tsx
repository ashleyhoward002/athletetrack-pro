"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Athlete = { id: string; name: string };
type Season = { id: string; name: string; is_current: boolean };
type Game = {
  id: string;
  date: string;
  opponent: string;
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
  minutes: number;
  stats: Record<string, number>;
};

export default function GameStatsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");

  // Fetch athletes and seasons
  useEffect(() => {
    const fetchData = async () => {
      const [athletesRes, seasonsRes] = await Promise.all([
        supabase.from("athletes").select("id, name").order("name"),
        supabase.from("seasons").select("id, name, is_current").order("start_date", { ascending: false }),
      ]);

      if (athletesRes.data) {
        setAthletes(athletesRes.data);
        if (athletesRes.data.length > 0) {
          setSelectedAthlete(athletesRes.data[0].id);
        }
      }

      if (seasonsRes.data) {
        setSeasons(seasonsRes.data);
        const currentSeason = seasonsRes.data.find((s) => s.is_current);
        if (currentSeason) {
          setSelectedSeason(currentSeason.id);
        }
      }
    };

    fetchData();
  }, []);

  // Fetch games when athlete/season changes
  useEffect(() => {
    const fetchGames = async () => {
      if (!selectedAthlete) {
        setGames([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      let query = supabase
        .from("games")
        .select("*")
        .eq("athlete_id", selectedAthlete)
        .eq("sport", "basketball")
        .order("date", { ascending: true });

      if (selectedSeason) {
        query = query.eq("season_id", selectedSeason);
      }

      const { data } = await query;
      setGames(data || []);
      setLoading(false);
    };

    fetchGames();
  }, [selectedAthlete, selectedSeason]);

  // Calculate season averages
  const averages = useMemo(() => {
    if (games.length === 0) {
      return {
        ppg: 0, rpg: 0, apg: 0, spg: 0, bpg: 0, topg: 0, mpg: 0,
        fgPct: 0, threePct: 0, ftPct: 0,
      };
    }

    const totals = games.reduce(
      (acc, g) => {
        const pts = g.points || g.stats?.points || 0;
        const rebOff = g.rebounds_off || g.stats?.rebounds_off || 0;
        const rebDef = g.rebounds_def || g.stats?.rebounds_def || 0;
        const ast = g.assists || g.stats?.assists || 0;
        const stl = g.steals || g.stats?.steals || 0;
        const blk = g.blocks || g.stats?.blocks || 0;
        const to = g.turnovers || g.stats?.turnovers || 0;
        const min = g.minutes || g.stats?.minutes || 0;
        const fgm = g.fg_made || g.stats?.fg_made || 0;
        const fga = g.fg_attempted || g.stats?.fg_attempted || 0;
        const tpm = g.three_made || g.stats?.three_made || 0;
        const tpa = g.three_attempted || g.stats?.three_attempted || 0;
        const ftm = g.ft_made || g.stats?.ft_made || 0;
        const fta = g.ft_attempted || g.stats?.ft_attempted || 0;

        return {
          points: acc.points + pts,
          rebounds: acc.rebounds + rebOff + rebDef,
          assists: acc.assists + ast,
          steals: acc.steals + stl,
          blocks: acc.blocks + blk,
          turnovers: acc.turnovers + to,
          minutes: acc.minutes + min,
          fgMade: acc.fgMade + fgm,
          fgAttempted: acc.fgAttempted + fga,
          threeMade: acc.threeMade + tpm,
          threeAttempted: acc.threeAttempted + tpa,
          ftMade: acc.ftMade + ftm,
          ftAttempted: acc.ftAttempted + fta,
        };
      },
      {
        points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0,
        turnovers: 0, minutes: 0, fgMade: 0, fgAttempted: 0,
        threeMade: 0, threeAttempted: 0, ftMade: 0, ftAttempted: 0,
      }
    );

    const n = games.length;
    return {
      ppg: (totals.points / n).toFixed(1),
      rpg: (totals.rebounds / n).toFixed(1),
      apg: (totals.assists / n).toFixed(1),
      spg: (totals.steals / n).toFixed(1),
      bpg: (totals.blocks / n).toFixed(1),
      topg: (totals.turnovers / n).toFixed(1),
      mpg: (totals.minutes / n).toFixed(1),
      fgPct: totals.fgAttempted > 0
        ? ((totals.fgMade / totals.fgAttempted) * 100).toFixed(1)
        : "0.0",
      threePct: totals.threeAttempted > 0
        ? ((totals.threeMade / totals.threeAttempted) * 100).toFixed(1)
        : "0.0",
      ftPct: totals.ftAttempted > 0
        ? ((totals.ftMade / totals.ftAttempted) * 100).toFixed(1)
        : "0.0",
    };
  }, [games]);

  // Find personal bests
  const personalBests = useMemo(() => {
    if (games.length === 0) return {};

    const bests: Record<string, { value: number; gameId: string }> = {};

    games.forEach((g) => {
      const pts = g.points || g.stats?.points || 0;
      const reb = (g.rebounds_off || 0) + (g.rebounds_def || 0);
      const ast = g.assists || g.stats?.assists || 0;
      const stl = g.steals || g.stats?.steals || 0;
      const blk = g.blocks || g.stats?.blocks || 0;

      if (!bests.points || pts > bests.points.value) {
        bests.points = { value: pts, gameId: g.id };
      }
      if (!bests.rebounds || reb > bests.rebounds.value) {
        bests.rebounds = { value: reb, gameId: g.id };
      }
      if (!bests.assists || ast > bests.assists.value) {
        bests.assists = { value: ast, gameId: g.id };
      }
      if (!bests.steals || stl > bests.steals.value) {
        bests.steals = { value: stl, gameId: g.id };
      }
      if (!bests.blocks || blk > bests.blocks.value) {
        bests.blocks = { value: blk, gameId: g.id };
      }
    });

    return bests;
  }, [games]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return games.map((g, i) => {
      const pts = g.points || g.stats?.points || 0;
      const rebOff = g.rebounds_off || g.stats?.rebounds_off || 0;
      const rebDef = g.rebounds_def || g.stats?.rebounds_def || 0;
      const ast = g.assists || g.stats?.assists || 0;
      const fgm = g.fg_made || g.stats?.fg_made || 0;
      const fga = g.fg_attempted || g.stats?.fg_attempted || 0;
      const tpm = g.three_made || g.stats?.three_made || 0;
      const tpa = g.three_attempted || g.stats?.three_attempted || 0;
      const ftm = g.ft_made || g.stats?.ft_made || 0;
      const fta = g.ft_attempted || g.stats?.ft_attempted || 0;

      return {
        game: `G${i + 1}`,
        opponent: g.opponent,
        date: new Date(g.date + "T00:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        points: pts,
        rebounds: rebOff + rebDef,
        assists: ast,
        fgPct: fga > 0 ? Math.round((fgm / fga) * 100) : 0,
        threePct: tpa > 0 ? Math.round((tpm / tpa) * 100) : 0,
        ftPct: fta > 0 ? Math.round((ftm / fta) * 100) : 0,
      };
    });
  }, [games]);

  const fmtDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Season Stats</h1>
          <p className="text-base-content/70 mt-1">
            Averages and trends across {games.length} game{games.length !== 1 && "s"}
          </p>
        </div>
        <Link href="/dashboard/games" className="btn btn-ghost btn-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Games
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <select
          className="select select-bordered"
          value={selectedAthlete}
          onChange={(e) => setSelectedAthlete(e.target.value)}
        >
          <option value="">Select Athlete</option>
          {athletes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          className="select select-bordered"
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
        >
          <option value="">All Seasons</option>
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.is_current && "(Current)"}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {!loading && games.length === 0 && (
        <div className="card bg-base-100 shadow">
          <div className="card-body items-center text-center py-16">
            <h3 className="text-lg font-semibold">No games found</h3>
            <p className="text-base-content/60">
              {selectedAthlete
                ? "No games recorded for this athlete/season combination."
                : "Select an athlete to see their stats."}
            </p>
            <Link href="/dashboard/games/new" className="btn btn-primary mt-4">
              Log First Game
            </Link>
          </div>
        </div>
      )}

      {!loading && games.length > 0 && (
        <>
          {/* Season Averages */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-sm font-semibold text-base-content/60 uppercase tracking-wider">
                Season Averages
              </h2>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-3 mt-2">
                <AvgCard label="PPG" value={averages.ppg} />
                <AvgCard label="RPG" value={averages.rpg} />
                <AvgCard label="APG" value={averages.apg} />
                <AvgCard label="SPG" value={averages.spg} />
                <AvgCard label="BPG" value={averages.bpg} />
                <AvgCard label="FG%" value={averages.fgPct} suffix="%" />
                <AvgCard label="3PT%" value={averages.threePct} suffix="%" />
                <AvgCard label="FT%" value={averages.ftPct} suffix="%" />
                <AvgCard label="TOPG" value={averages.topg} negative />
                <AvgCard label="MPG" value={averages.mpg} />
              </div>
            </div>
          </div>

          {/* Points Trend Chart */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-sm font-semibold text-base-content/60 uppercase tracking-wider">
                Points Per Game Trend
              </h2>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-base-100 border border-base-300 rounded-lg p-2 shadow-lg">
                              <p className="font-semibold">vs {data.opponent}</p>
                              <p className="text-sm text-base-content/70">{data.date}</p>
                              <p className="text-primary font-bold">{data.points} PTS</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="points"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Shooting Percentages Chart */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-sm font-semibold text-base-content/60 uppercase tracking-wider">
                Shooting Percentages
              </h2>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="fgPct"
                      name="FG%"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="threePct"
                      name="3PT%"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ftPct"
                      name="FT%"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Rebounds + Assists Bar Chart */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-sm font-semibold text-base-content/60 uppercase tracking-wider">
                Rebounds & Assists
              </h2>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rebounds" name="Rebounds" fill="#22c55e" stackId="a" />
                    <Bar dataKey="assists" name="Assists" fill="#f59e0b" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Game Log Table */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-sm font-semibold text-base-content/60 uppercase tracking-wider">
                Game Log
              </h2>
              <div className="overflow-x-auto mt-2">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Opponent</th>
                      <th className="text-center">PTS</th>
                      <th className="text-center">REB</th>
                      <th className="text-center">AST</th>
                      <th className="text-center">STL</th>
                      <th className="text-center">BLK</th>
                      <th className="text-center">FG%</th>
                      <th className="text-center">3P%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.slice().reverse().map((g) => {
                      const pts = g.points || g.stats?.points || 0;
                      const reb = (g.rebounds_off || 0) + (g.rebounds_def || 0);
                      const ast = g.assists || g.stats?.assists || 0;
                      const stl = g.steals || g.stats?.steals || 0;
                      const blk = g.blocks || g.stats?.blocks || 0;
                      const fga = g.fg_attempted || g.stats?.fg_attempted || 0;
                      const fgm = g.fg_made || g.stats?.fg_made || 0;
                      const tpa = g.three_attempted || g.stats?.three_attempted || 0;
                      const tpm = g.three_made || g.stats?.three_made || 0;

                      const isPtsBest = personalBests.points?.gameId === g.id;
                      const isRebBest = personalBests.rebounds?.gameId === g.id;
                      const isAstBest = personalBests.assists?.gameId === g.id;

                      return (
                        <tr key={g.id} className="hover">
                          <td className="whitespace-nowrap">{fmtDate(g.date)}</td>
                          <td>
                            <Link
                              href={`/dashboard/games/${g.id}`}
                              className="link link-hover"
                            >
                              vs {g.opponent}
                            </Link>
                          </td>
                          <td className="text-center font-medium">
                            {pts}
                            {isPtsBest && <span className="ml-1 text-warning">★</span>}
                          </td>
                          <td className="text-center">
                            {reb}
                            {isRebBest && <span className="ml-1 text-warning">★</span>}
                          </td>
                          <td className="text-center">
                            {ast}
                            {isAstBest && <span className="ml-1 text-warning">★</span>}
                          </td>
                          <td className="text-center">{stl}</td>
                          <td className="text-center">{blk}</td>
                          <td className="text-center">
                            {fga > 0 ? Math.round((fgm / fga) * 100) : 0}%
                          </td>
                          <td className="text-center">
                            {tpa > 0 ? Math.round((tpm / tpa) * 100) : 0}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AvgCard({
  label,
  value,
  suffix,
  negative,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  negative?: boolean;
}) {
  return (
    <div className="text-center p-3 bg-base-200 rounded-lg">
      <div className={`text-xl font-bold ${negative ? "text-error" : ""}`}>
        {value}{suffix || ""}
      </div>
      <div className="text-[10px] text-base-content/60 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
