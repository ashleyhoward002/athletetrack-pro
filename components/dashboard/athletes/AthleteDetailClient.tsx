"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { getSportConfig, SportId } from "@/lib/sports/config";

type Athlete = {
  id: string;
  name: string;
  birth_date: string | null;
  position: string | null;
  primary_sport: SportId;
  sports: SportId[] | null;
  school: string | null;
  team_name: string | null;
  level: string | null;
  jersey_number: number | null;
  created_at: string;
};

type Game = {
  id: string;
  date: string;
  opponent: string;
  sport: string;
  points?: number;
  stats?: Record<string, unknown>;
};

type PhysicalMetric = {
  id: string;
  measured_at: string;
  height_inches: number | null;
  weight_lbs: number | null;
  vertical_jump_inches: number | null;
  wingspan_inches: number | null;
};

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  earned_at: string;
};

export default function AthleteDetailClient({
  athleteId,
}: {
  athleteId: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [metrics, setMetrics] = useState<PhysicalMetric[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Fetch athlete
    const { data: athleteData, error: athleteError } = await supabase
      .from("athletes")
      .select("*")
      .eq("id", athleteId)
      .single();

    if (athleteError || !athleteData) {
      toast.error("Athlete not found");
      router.push("/dashboard/athletes");
      return;
    }

    setAthlete(athleteData);

    // Fetch games
    const { data: gamesData } = await supabase
      .from("games")
      .select("id, date, opponent, sport, points, stats")
      .eq("athlete_id", athleteId)
      .order("date", { ascending: false })
      .limit(10);

    setGames(gamesData || []);

    // Fetch physical metrics
    const { data: metricsData } = await supabase
      .from("physical_metrics")
      .select("*")
      .eq("athlete_id", athleteId)
      .order("measured_at", { ascending: false })
      .limit(5);

    setMetrics(metricsData || []);

    // Fetch badges (through athlete_badges join)
    const { data: badgesData } = await supabase
      .from("athlete_badges")
      .select(`
        earned_at,
        badges (
          id,
          name,
          description,
          icon,
          category,
          rarity
        )
      `)
      .eq("user_id", athleteData.user_id)
      .order("earned_at", { ascending: false })
      .limit(6);

    if (badgesData) {
      const formattedBadges = badgesData
        .filter((b) => b.badges)
        .map((b) => ({
          ...(b.badges as unknown as Badge),
          earned_at: b.earned_at,
        }));
      setBadges(formattedBadges);
    }

    setLoading(false);
  }, [athleteId, router, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const diff = Date.now() - new Date(birthDate).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getGameResult = (game: Game) => {
    if (game.stats && typeof game.stats === "object" && "result" in game.stats) {
      return game.stats.result as string;
    }
    return null;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "text-yellow-500";
      case "epic":
        return "text-purple-500";
      case "rare":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!athlete) {
    return null;
  }

  const sportConfig = getSportConfig(athlete.primary_sport);

  return (
    <>
      {/* Back button and header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/athletes" className="btn btn-ghost btn-sm">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>
      </div>

      {/* Athlete Header Card */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar/Jersey */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
                {athlete.jersey_number != null ? (
                  <span className="font-bold text-primary">
                    #{athlete.jersey_number}
                  </span>
                ) : (
                  <span>{sportConfig.icon}</span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-grow">
              <h1 className="text-3xl font-bold">{athlete.name}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="badge badge-primary badge-lg">
                  {sportConfig.icon} {sportConfig.name}
                </span>
                {athlete.position && (
                  <span className="badge badge-ghost badge-lg">
                    {athlete.position}
                  </span>
                )}
                {athlete.level && (
                  <span className="badge badge-outline badge-lg">
                    {athlete.level}
                  </span>
                )}
              </div>
              <div className="mt-3 text-base-content/70 flex flex-wrap gap-4">
                {athlete.team_name && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {athlete.team_name}
                  </span>
                )}
                {athlete.school && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    {athlete.school}
                  </span>
                )}
                {getAge(athlete.birth_date) && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {getAge(athlete.birth_date)} years old
                  </span>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="stat bg-base-200 rounded-lg px-6">
                <div className="stat-title">Games</div>
                <div className="stat-value text-primary">{games.length}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg px-6">
                <div className="stat-title">Badges</div>
                <div className="stat-value text-secondary">{badges.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Games */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Recent Games
            </h2>
            {games.length === 0 ? (
              <p className="text-base-content/50 py-4">No games recorded yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Opponent</th>
                      <th>Points</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map((game) => (
                      <tr key={game.id} className="hover">
                        <td>{formatDate(game.date)}</td>
                        <td>{game.opponent}</td>
                        <td>
                          {game.points != null ? (
                            <span className="font-semibold">{game.points}</span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          {getGameResult(game) ? (
                            <span
                              className={`badge badge-sm ${
                                getGameResult(game)?.startsWith("W")
                                  ? "badge-success"
                                  : getGameResult(game)?.startsWith("L")
                                  ? "badge-error"
                                  : "badge-warning"
                              }`}
                            >
                              {getGameResult(game)}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Physical Development */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Physical Development
            </h2>
            {metrics.length === 0 ? (
              <p className="text-base-content/50 py-4">No measurements recorded yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Height</th>
                      <th>Weight</th>
                      <th>Vertical</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((m) => (
                      <tr key={m.id}>
                        <td>{formatDate(m.measured_at)}</td>
                        <td>
                          {m.height_inches
                            ? `${Math.floor(m.height_inches / 12)}'${m.height_inches % 12}"`
                            : "-"}
                        </td>
                        <td>{m.weight_lbs ? `${m.weight_lbs} lbs` : "-"}</td>
                        <td>
                          {m.vertical_jump_inches
                            ? `${m.vertical_jump_inches}"`
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="card bg-base-100 shadow lg:col-span-2">
          <div className="card-body">
            <h2 className="card-title">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Badges Earned
            </h2>
            {badges.length === 0 ? (
              <p className="text-base-content/50 py-4">No badges earned yet</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center p-4 bg-base-200 rounded-lg text-center"
                  >
                    <span className="text-3xl mb-2">{badge.icon}</span>
                    <span className={`font-semibold ${getRarityColor(badge.rarity)}`}>
                      {badge.name}
                    </span>
                    <span className="text-xs text-base-content/50 mt-1">
                      {badge.description}
                    </span>
                    <span className="text-xs text-base-content/40 mt-2">
                      {formatDate(badge.earned_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
