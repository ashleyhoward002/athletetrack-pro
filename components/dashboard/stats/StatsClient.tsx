"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  SportId,
  DEFAULT_SPORT,
  SPORT_LIST,
  getSportConfig,
  sumStats,
} from "@/lib/sports/config";
import StatTooltip from "@/components/ui/StatTooltip";
import HelpIcon from "@/components/ui/HelpIcon";

type Game = {
  id: string;
  athlete_id: string | null;
  date: string;
  opponent: string;
  sport: SportId;
  stats: Record<string, number>;
  athletes?: { id: string; name: string } | null;
};

type SelectOption = { id: string; label: string };

export default function StatsClient() {
  const supabase = createClient();
  const [games, setGames] = useState<Game[]>([]);
  const [athletes, setAthletes] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAthlete, setFilterAthlete] = useState("");
  const [filterSport, setFilterSport] = useState<SportId>(DEFAULT_SPORT);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [gamesRes, athletesRes] = await Promise.all([
      supabase
        .from("games")
        .select("*, athletes(id, name)")
        .order("date", { ascending: true }),
      supabase.from("athletes").select("id, name").order("name"),
    ]);

    if (gamesRes.error) toast.error("Failed to load stats");
    else setGames(gamesRes.data || []);

    setAthletes(
      (athletesRes.data || []).map((a) => ({ id: a.id, label: a.name }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const config = getSportConfig(filterSport);

  const filtered = useMemo(
    () =>
      games.filter((g) => {
        if (filterAthlete && g.athlete_id !== filterAthlete) return false;
        if ((g.sport || DEFAULT_SPORT) !== filterSport) return false;
        return true;
      }),
    [games, filterAthlete, filterSport]
  );

  const count = filtered.length;

  // Averages from config
  const averages = useMemo(() => {
    if (count === 0) return null;
    const totals = sumStats(filtered.map((g) => ({ stats: g.stats || {} })));
    const result: Record<string, string> = {};
    for (const card of config.averageCards) {
      const value = card.compute(totals, count);
      result[card.key] = card.format(value);
    }
    return result;
  }, [filtered, count, config]);

  // Season highs from table columns
  const highs = useMemo(() => {
    if (count === 0) return null;
    const result: Record<string, string | number> = {};
    for (const col of config.tableColumns.slice(0, 5)) {
      let max = -Infinity;
      for (const g of filtered) {
        const val = col.compute(g.stats || {});
        const num = typeof val === "string" ? parseFloat(val) || 0 : val;
        if (num > max) max = num;
      }
      result[col.key] = max === -Infinity ? 0 : max;
    }
    return result;
  }, [filtered, count, config]);

  // Trend chart data
  const trendData = useMemo(
    () =>
      filtered.map((g) => {
        const row: Record<string, any> = {
          date: new Date(g.date + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          opponent: g.opponent,
        };
        for (const line of config.trendChartLines) {
          row[line.label] = line.compute(g.stats || {});
        }
        return row;
      }),
    [filtered, config]
  );

  // Percentage chart data
  const pctData = useMemo(
    () =>
      filtered.map((g) => {
        const row: Record<string, any> = {
          date: new Date(g.date + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        };
        for (const line of config.percentageChartLines) {
          row[line.label] = parseFloat(line.compute(g.stats || {}).toFixed(1));
        }
        return row;
      }),
    [filtered, config]
  );

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold">Stats</h1>
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl md:text-4xl font-extrabold">Stats</h1>
          <HelpIcon section="stats" tooltip="Learn what stats mean" />
        </div>
        <p className="text-base-content/70 mt-1">
          Performance analytics across {count} game{count !== 1 && "s"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        {/* Sport filter */}
        <div className="flex gap-2 flex-wrap">
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

      {/* Empty state */}
      {count === 0 && (
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="text-lg font-semibold mt-4">
              No {config.name} game data yet
            </h3>
            <p className="text-base-content/60 max-w-sm">
              Log {config.name.toLowerCase()} games from the Games page to see
              performance analytics here.
            </p>
          </div>
        </div>
      )}

      {count > 0 && averages && (
        <>
          {/* Season Averages */}
          <div
            className={`grid gap-3`}
            style={{
              gridTemplateColumns: `repeat(${Math.min(config.averageCards.length, 6)}, minmax(0, 1fr))`,
            }}
          >
            {config.averageCards.map((card, i) => (
              <div
                key={card.key}
                className={`card shadow-sm ${i === 0 ? "bg-primary text-primary-content" : "bg-base-100"}`}
              >
                <div className="card-body p-4 items-center text-center">
                  <div className="text-2xl font-extrabold">
                    {averages[card.key]}
                  </div>
                  <div
                    className={`text-xs uppercase tracking-wider inline-flex items-center gap-1 ${i === 0 ? "text-primary-content/70" : "text-base-content/50"}`}
                  >
                    {card.label}
                    <StatTooltip description={card.description} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Season Highs */}
          {highs && (
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-5">
                <h2 className="font-bold text-sm uppercase tracking-wider text-base-content/50 mb-3">
                  Season Highs
                </h2>
                <div
                  className="grid gap-3 text-center"
                  style={{
                    gridTemplateColumns: `repeat(${Object.keys(highs).length}, minmax(0, 1fr))`,
                  }}
                >
                  {config.tableColumns.slice(0, 5).map((col) => (
                    <div key={col.key}>
                      <div className="text-2xl font-extrabold">
                        {highs[col.key]}
                      </div>
                      <div className="text-[10px] text-base-content/50 uppercase tracking-wider inline-flex items-center gap-0.5">
                        {col.label}
                        <StatTooltip description={col.description} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trend Chart */}
          {trendData.length >= 2 && config.trendChartLines.length > 0 && (
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-5">
                <h2 className="font-bold text-sm uppercase tracking-wider text-base-content/50 mb-3">
                  Performance Trend
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                      />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "0.5rem",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,.1)",
                        }}
                      />
                      <Legend iconSize={10} />
                      {config.trendChartLines.map((line, i) => (
                        <Line
                          key={line.dataKey}
                          type="monotone"
                          dataKey={line.label}
                          stroke={line.color}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={i === 0 ? { r: 5 } : undefined}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Percentage Chart */}
          {pctData.length >= 2 && config.percentageChartLines.length > 0 && (
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-5">
                <h2 className="font-bold text-sm uppercase tracking-wider text-base-content/50 mb-3">
                  Percentage Stats by Game
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pctData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        formatter={(value: number) => `${value}%`}
                        contentStyle={{
                          borderRadius: "0.5rem",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,.1)",
                        }}
                      />
                      <Legend iconSize={10} />
                      {config.percentageChartLines.map((line) => (
                        <Bar
                          key={line.dataKey}
                          dataKey={line.label}
                          fill={line.color}
                          radius={[2, 2, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Game Log Table */}
          <div className="card bg-base-100 shadow-sm overflow-x-auto">
            <div className="card-body p-5">
              <h2 className="font-bold text-sm uppercase tracking-wider text-base-content/50 mb-3">
                Game Log
              </h2>
              <table className="table table-xs table-zebra">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Opponent</th>
                    {!filterAthlete && (
                      <th className="hidden md:table-cell">Athlete</th>
                    )}
                    {config.tableColumns.map((col) => (
                      <th key={col.key} className="text-right">
                        <span className="inline-flex items-center gap-0.5">
                          {col.label}
                          <StatTooltip description={col.description} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...filtered].reverse().map((g) => (
                    <tr key={g.id}>
                      <td className="whitespace-nowrap">
                        {new Date(g.date + "T00:00:00").toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </td>
                      <td>{g.opponent}</td>
                      {!filterAthlete && (
                        <td className="hidden md:table-cell">
                          {g.athletes?.name ?? "—"}
                        </td>
                      )}
                      {config.tableColumns.map((col) => (
                        <td key={col.key} className="text-right">
                          {col.compute(g.stats || {})}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
