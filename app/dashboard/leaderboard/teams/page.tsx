"use client";

import { useEffect, useState } from "react";
import { Team, TeamRole } from "@/types/training";
import TeamCard from "@/components/leaderboard/TeamCard";
import CreateTeamModal from "@/components/leaderboard/CreateTeamModal";
import JoinTeamForm from "@/components/leaderboard/JoinTeamForm";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TeamsPage() {
    const router = useRouter();
    const [myTeams, setMyTeams] = useState<(Team & { role?: TeamRole })[]>([]);
    const [searchResults, setSearchResults] = useState<Team[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    const fetchTeams = async (search?: string) => {
        try {
            const params = search ? `?search=${encodeURIComponent(search)}` : "";
            const res = await fetch(`/api/teams${params}`);
            const data = await res.json();
            if (res.ok) {
                setMyTeams(data.my_teams || []);
                setSearchResults(data.search_results || []);
            }
        } catch {
            toast.error("Failed to load teams");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            fetchTeams(searchQuery.trim());
        }
    };

    const handleLeave = async (teamId: string) => {
        const team = myTeams.find((t) => t.id === teamId);
        const action = team?.role === "owner" ? "delete" : "leave";
        if (!confirm(`Are you sure you want to ${action} this team?`)) return;

        try {
            const res = await fetch(`/api/teams/${teamId}/leave`, { method: "POST" });
            if (res.ok) {
                toast.success(action === "delete" ? "Team deleted" : "Left team");
                fetchTeams();
            } else {
                const data = await res.json();
                toast.error(data.error || `Failed to ${action} team`);
            }
        } catch {
            toast.error(`Failed to ${action} team`);
        }
    };

    const handleSelect = (teamId: string) => {
        router.push(`/dashboard/leaderboard?team=${teamId}`);
    };

    if (loading) {
        return (
            <main className="min-h-screen p-4 md:p-8 pb-24">
                <div className="max-w-3xl mx-auto flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg" />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-4 md:p-8 pb-24">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/dashboard/leaderboard" className="btn btn-ghost btn-sm btn-square">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <h1 className="text-3xl font-extrabold">Teams</h1>
                        </div>
                        <p className="text-base-content/60">
                            Create or join teams to compete with friends
                        </p>
                    </div>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowCreate(true)}
                    >
                        + Create Team
                    </button>
                </div>

                {/* Join a Team */}
                <div className="card bg-base-100 border border-base-300">
                    <div className="card-body p-4">
                        <h2 className="font-bold mb-2">Join a Team</h2>
                        <JoinTeamForm onJoined={() => fetchTeams()} />
                    </div>
                </div>

                {/* My Teams */}
                <div>
                    <h2 className="font-bold text-lg mb-3">My Teams</h2>
                    {myTeams.length === 0 ? (
                        <div className="card bg-base-200">
                            <div className="card-body items-center text-center py-8">
                                <div className="text-3xl mb-2">👥</div>
                                <p className="text-base-content/60">
                                    You haven&apos;t joined any teams yet. Create one or use an invite code!
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {myTeams.map((team) => (
                                <TeamCard
                                    key={team.id}
                                    team={team}
                                    onLeave={handleLeave}
                                    onSelect={handleSelect}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Find Teams */}
                <div>
                    <h2 className="font-bold text-lg mb-3">Find Teams</h2>
                    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                        <input
                            type="text"
                            className="input input-bordered input-sm flex-1"
                            placeholder="Search by team name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="btn btn-sm btn-outline"
                            disabled={!searchQuery.trim()}
                        >
                            Search
                        </button>
                    </form>
                    {searchResults.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {searchResults.map((team) => (
                                <TeamCard
                                    key={team.id}
                                    team={team}
                                    showActions={false}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <CreateTeamModal
                    open={showCreate}
                    onClose={() => setShowCreate(false)}
                    onCreated={() => fetchTeams()}
                />
            </div>
        </main>
    );
}
