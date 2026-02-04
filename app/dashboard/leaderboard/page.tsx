"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { SportId } from "@/lib/sports/config";
import {
    LeaderboardCategory,
    LeaderboardTimePeriod,
    LeaderboardEntry,
    UserRank,
    Team,
} from "@/types/training";
import UserRankCard from "@/components/leaderboard/UserRankCard";
import LeaderboardFilters from "@/components/leaderboard/LeaderboardFilters";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import Link from "next/link";

export default function LeaderboardPage() {
    const supabase = createClient();

    const [category, setCategory] = useState<LeaderboardCategory>("xp");
    const [timePeriod, setTimePeriod] = useState<LeaderboardTimePeriod>("all_time");
    const [sport, setSport] = useState<SportId | null>(null);
    const [teamId, setTeamId] = useState<string | null>(null);

    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [userRank, setUserRank] = useState<UserRank | null>(null);
    const [myTeams, setMyTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState("");
    const [userName, setUserName] = useState("You");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Get user info once
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "You");
                setAvatarUrl(user.user_metadata?.avatar_url || null);
            }
        };
        getUser();
    }, []);

    // Fetch teams once
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await fetch("/api/teams");
                const data = await res.json();
                if (res.ok) {
                    setMyTeams(data.my_teams || []);
                }
            } catch {
                // Teams fetch failed silently
            }
        };
        fetchTeams();
    }, []);

    // Fetch leaderboard when filters change
    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    category,
                    time_period: timePeriod,
                });
                if (sport) params.set("sport", sport);
                if (teamId) params.set("team_id", teamId);

                const res = await fetch(`/api/leaderboard?${params}`);
                const data = await res.json();

                if (res.ok) {
                    setEntries(data.entries || []);
                    setUserRank(data.user_rank || null);
                }
            } catch {
                // Leaderboard fetch failed
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [category, timePeriod, sport, teamId]);

    return (
        <main className="min-h-screen p-4 md:p-8 pb-24">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold">Leaderboard</h1>
                        <p className="text-base-content/60 mt-1">
                            See how you stack up against other athletes
                        </p>
                    </div>
                    <Link href="/dashboard/leaderboard/teams" className="btn btn-sm btn-outline">
                        Manage Teams
                    </Link>
                </div>

                {/* Your Rank */}
                <UserRankCard
                    userRank={userRank}
                    category={category}
                    loading={loading}
                    userName={userName}
                    avatarUrl={avatarUrl}
                />

                {/* Filters */}
                <LeaderboardFilters
                    category={category}
                    setCategory={setCategory}
                    timePeriod={timePeriod}
                    setTimePeriod={setTimePeriod}
                    sport={sport}
                    setSport={setSport}
                    teamId={teamId}
                    setTeamId={setTeamId}
                    myTeams={myTeams}
                />

                {/* Leaderboard Table */}
                <LeaderboardTable
                    entries={entries}
                    category={category}
                    currentUserId={userId}
                    loading={loading}
                />
            </div>
        </main>
    );
}
