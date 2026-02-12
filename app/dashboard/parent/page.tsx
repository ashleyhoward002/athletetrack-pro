"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SportId, SPORT_LIST, getSportConfig } from "@/lib/sports/config";

interface WeeklySummary {
    gamesPlayed: number;
    avgPoints: number;
    avgRebounds: number;
    avgAssists: number;
    formScore: number | null;
    formChange: number | null;
    practiceHours: number;
}

interface Expense {
    id: string;
    category: string;
    description: string | null;
    amount: string;
    expense_date: string;
    sport: string;
}

const EXPENSE_CATEGORIES = [
    { id: "registration", label: "Team Registration", icon: "📋" },
    { id: "equipment", label: "Equipment & Gear", icon: "🎒" },
    { id: "travel", label: "Travel", icon: "🚗" },
    { id: "lodging", label: "Lodging", icon: "🏨" },
    { id: "camps", label: "Camps & Clinics", icon: "⛺" },
    { id: "lessons", label: "Private Lessons", icon: "👨‍🏫" },
    { id: "uniforms", label: "Uniforms & Apparel", icon: "👕" },
    { id: "tournaments", label: "Tournament Fees", icon: "🏆" },
    { id: "membership", label: "Gym/Club Membership", icon: "🏢" },
    { id: "other", label: "Other", icon: "📦" },
];

export default function ParentDashboardPage() {
    const [athleteName, setAthleteName] = useState("Your Athlete");
    const [loading, setLoading] = useState(true);
    const [games, setGames] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [expenseTotals, setExpenseTotals] = useState<Record<string, number>>({});
    const [grandTotal, setGrandTotal] = useState(0);
    const [upcomingGames, setUpcomingGames] = useState<any[]>([]);
    const [formAnalyses, setFormAnalyses] = useState<any[]>([]);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [selectedYear] = useState(new Date().getFullYear());
    const [budgetGoal, setBudgetGoal] = useState(1200); // Default budget

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchProfile(),
                fetchGames(),
                fetchExpenses(),
                fetchUpcomingGames(),
                fetchFormAnalyses(),
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/profile");
            if (res.ok) {
                const data = await res.json();
                if (data.profile?.full_name) {
                    setAthleteName(data.profile.full_name);
                }
            }
        } catch {}
    };

    const fetchGames = async () => {
        try {
            const res = await fetch("/api/games?limit=50");
            const data = await res.json();
            setGames(data.games || []);
        } catch {
            setGames([]);
        }
    };

    const fetchExpenses = async () => {
        try {
            const res = await fetch(`/api/expenses?year=${selectedYear}`);
            const data = await res.json();
            setExpenses(data.expenses || []);
            setExpenseTotals(data.totals || {});
            setGrandTotal(data.grandTotal || 0);
        } catch {
            setExpenses([]);
        }
    };

    const fetchUpcomingGames = async () => {
        try {
            const res = await fetch("/api/scheduled-games?upcoming=true&limit=3");
            const data = await res.json();
            setUpcomingGames(data.games || []);
        } catch {
            setUpcomingGames([]);
        }
    };

    const fetchFormAnalyses = async () => {
        try {
            const res = await fetch("/api/form-analysis");
            const data = await res.json();
            setFormAnalyses((data.analyses || []).filter((a: any) => a.status === "completed"));
        } catch {
            setFormAnalyses([]);
        }
    };

    // Calculate weekly summary
    const getWeeklySummary = (): WeeklySummary => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentGames = games.filter((g) => new Date(g.date) >= oneWeekAgo);
        const gamesPlayed = recentGames.length;

        let totalPoints = 0, totalRebounds = 0, totalAssists = 0;
        for (const game of recentGames) {
            const stats = game.stats || {};
            totalPoints += stats.points || 0;
            totalRebounds += (stats.rebounds_off || 0) + (stats.rebounds_def || 0);
            totalAssists += stats.assists || 0;
        }

        // Get form analysis progress
        const recentAnalyses = formAnalyses
            .filter((a) => new Date(a.created_at) >= oneWeekAgo)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const formScore = recentAnalyses[0]?.overall_score || null;
        const previousScore = formAnalyses.find(
            (a) => new Date(a.created_at) < oneWeekAgo
        )?.overall_score;
        const formChange = formScore && previousScore ? formScore - previousScore : null;

        return {
            gamesPlayed,
            avgPoints: gamesPlayed > 0 ? totalPoints / gamesPlayed : 0,
            avgRebounds: gamesPlayed > 0 ? totalRebounds / gamesPlayed : 0,
            avgAssists: gamesPlayed > 0 ? totalAssists / gamesPlayed : 0,
            formScore,
            formChange,
            practiceHours: recentAnalyses.length * 0.5, // Estimate
        };
    };

    const weekly = getWeeklySummary();
    const budgetPercent = Math.min((grandTotal / budgetGoal) * 100, 100);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg" />
            </main>
        );
    }

    return (
        <main className="min-h-screen p-4 md:p-8 pb-24 bg-base-100">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-base-content/60 text-sm">Parent Dashboard</p>
                        <h1 className="text-3xl font-extrabold">{athleteName}'s Week</h1>
                    </div>
                    <Link href="/dashboard" className="btn btn-ghost btn-sm">
                        Full Dashboard →
                    </Link>
                </div>

                {/* Weekly Summary Card */}
                <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                    <div className="card-body">
                        <h2 className="card-title text-lg">This Week's Summary</h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary">{weekly.gamesPlayed}</div>
                                <div className="text-sm text-base-content/60">Games Played</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">{weekly.avgPoints.toFixed(1)}</div>
                                <div className="text-sm text-base-content/60">Avg Points</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">{weekly.avgRebounds.toFixed(1)}</div>
                                <div className="text-sm text-base-content/60">Avg Rebounds</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">{weekly.avgAssists.toFixed(1)}</div>
                                <div className="text-sm text-base-content/60">Avg Assists</div>
                            </div>
                        </div>

                        {/* Form Progress */}
                        {weekly.formScore !== null && (
                            <div className="mt-4 p-3 bg-base-100/50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Form Analysis Score</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold">{weekly.formScore}</span>
                                        {weekly.formChange !== null && (
                                            <span className={`badge ${weekly.formChange > 0 ? "badge-success" : weekly.formChange < 0 ? "badge-error" : "badge-ghost"}`}>
                                                {weekly.formChange > 0 ? "+" : ""}{weekly.formChange}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {weekly.gamesPlayed === 0 && (
                            <p className="text-center text-base-content/50 mt-4">
                                No games recorded this week
                            </p>
                        )}
                    </div>
                </div>

                {/* Upcoming Games */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <h2 className="card-title text-lg">
                                <span>📅</span> Upcoming Games
                            </h2>
                            <Link href="/dashboard/schedule" className="btn btn-ghost btn-xs">
                                View All
                            </Link>
                        </div>

                        {upcomingGames.length === 0 ? (
                            <p className="text-center text-base-content/50 py-4">
                                No upcoming games scheduled
                            </p>
                        ) : (
                            <div className="space-y-2 mt-2">
                                {upcomingGames.map((game) => (
                                    <div key={game.id} className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
                                        <div>
                                            <div className="font-semibold">
                                                {game.is_home_game ? "vs" : "@"} {game.opponent}
                                            </div>
                                            <div className="text-sm text-base-content/60">
                                                {formatDate(game.game_date)}
                                                {game.game_time && ` • ${game.game_time.slice(0, 5)}`}
                                            </div>
                                        </div>
                                        {game.location && (
                                            <div className="text-sm text-base-content/50 text-right max-w-[150px] truncate">
                                                📍 {game.location}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Season Spending */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <h2 className="card-title text-lg">
                                <span>💰</span> {selectedYear} Season Spending
                            </h2>
                            <button
                                onClick={() => setShowExpenseModal(true)}
                                className="btn btn-primary btn-sm"
                            >
                                + Add Expense
                            </button>
                        </div>

                        {/* Budget Progress */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-base-content/60">
                                    {formatCurrency(grandTotal)} of {formatCurrency(budgetGoal)} budget
                                </span>
                                <span className="text-sm font-medium">
                                    {budgetPercent.toFixed(0)}%
                                </span>
                            </div>
                            <progress
                                className={`progress w-full ${budgetPercent > 90 ? "progress-error" : budgetPercent > 70 ? "progress-warning" : "progress-success"}`}
                                value={budgetPercent}
                                max="100"
                            />
                            <div className="flex items-center justify-between mt-1">
                                <button
                                    onClick={() => setBudgetGoal(Math.max(500, budgetGoal - 100))}
                                    className="btn btn-ghost btn-xs"
                                >
                                    -
                                </button>
                                <span className="text-xs text-base-content/50">Adjust budget goal</span>
                                <button
                                    onClick={() => setBudgetGoal(budgetGoal + 100)}
                                    className="btn btn-ghost btn-xs"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Spending by Category */}
                        {Object.keys(expenseTotals).length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h3 className="text-sm font-semibold text-base-content/70">By Category</h3>
                                {Object.entries(expenseTotals)
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 5)
                                    .map(([category, amount]) => {
                                        const cat = EXPENSE_CATEGORIES.find((c) => c.id === category);
                                        const percent = (amount / grandTotal) * 100;
                                        return (
                                            <div key={category} className="flex items-center gap-3">
                                                <span className="text-lg">{cat?.icon || "📦"}</span>
                                                <div className="flex-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span>{cat?.label || category}</span>
                                                        <span className="font-medium">{formatCurrency(amount)}</span>
                                                    </div>
                                                    <progress
                                                        className="progress progress-primary h-1"
                                                        value={percent}
                                                        max="100"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}

                        {grandTotal === 0 && (
                            <p className="text-center text-base-content/50 py-4">
                                No expenses tracked yet. Add your first expense to start tracking!
                            </p>
                        )}

                        {/* Recent Expenses */}
                        {expenses.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-sm font-semibold text-base-content/70 mb-2">Recent</h3>
                                <div className="space-y-1">
                                    {expenses.slice(0, 3).map((expense) => {
                                        const cat = EXPENSE_CATEGORIES.find((c) => c.id === expense.category);
                                        return (
                                            <div key={expense.id} className="flex items-center justify-between text-sm p-2 bg-base-100 rounded">
                                                <div className="flex items-center gap-2">
                                                    <span>{cat?.icon}</span>
                                                    <span>{expense.description || cat?.label}</span>
                                                </div>
                                                <span className="font-medium">{formatCurrency(parseFloat(expense.amount))}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Stats Comparison */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <h2 className="card-title text-lg">
                            <span>📈</span> Season Progress
                        </h2>

                        {games.length >= 2 ? (
                            <div className="mt-4">
                                {(() => {
                                    // Compare first 5 games vs last 5 games
                                    const sortedGames = [...games].sort(
                                        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                                    );
                                    const firstGames = sortedGames.slice(0, Math.min(5, Math.floor(games.length / 2)));
                                    const lastGames = sortedGames.slice(-Math.min(5, Math.floor(games.length / 2)));

                                    const calcAvg = (gameList: any[], stat: string) => {
                                        const total = gameList.reduce((sum, g) => sum + (g.stats?.[stat] || 0), 0);
                                        return gameList.length > 0 ? total / gameList.length : 0;
                                    };

                                    const stats = [
                                        { label: "Points", key: "points" },
                                        { label: "Assists", key: "assists" },
                                    ];

                                    return (
                                        <div className="space-y-3">
                                            <p className="text-sm text-base-content/60">
                                                Comparing first {firstGames.length} games vs last {lastGames.length} games
                                            </p>
                                            {stats.map((stat) => {
                                                const early = calcAvg(firstGames, stat.key);
                                                const recent = calcAvg(lastGames, stat.key);
                                                const change = recent - early;
                                                const percentChange = early > 0 ? (change / early) * 100 : 0;

                                                return (
                                                    <div key={stat.key} className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
                                                        <span className="font-medium">{stat.label}</span>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-base-content/50">{early.toFixed(1)}</span>
                                                            <span className="text-lg">→</span>
                                                            <span className="font-bold">{recent.toFixed(1)}</span>
                                                            <span className={`badge ${change > 0 ? "badge-success" : change < 0 ? "badge-error" : "badge-ghost"}`}>
                                                                {change > 0 ? "+" : ""}{percentChange.toFixed(0)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>
                        ) : (
                            <p className="text-center text-base-content/50 py-4">
                                Need more games to show progress comparison
                            </p>
                        )}
                    </div>
                </div>

                {/* Share with Family */}
                <div className="card bg-gradient-to-r from-accent/10 to-secondary/10 border border-accent/20">
                    <div className="card-body">
                        <h2 className="card-title text-lg">
                            <span>👨‍👩‍👧</span> Share with Family
                        </h2>
                        <p className="text-sm text-base-content/60">
                            Create a shareable progress card for grandparents and family members!
                        </p>
                        <div className="mt-2">
                            <Link href="/dashboard/highlights" className="btn btn-accent btn-sm">
                                Create Shareable Card
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="flex justify-center gap-4 pt-4">
                    <Link href="/dashboard" className="btn btn-ghost">
                        ← Back to Full Dashboard
                    </Link>
                </div>
            </div>

            {/* Add Expense Modal */}
            {showExpenseModal && (
                <AddExpenseModal
                    onClose={() => setShowExpenseModal(false)}
                    onSuccess={() => {
                        setShowExpenseModal(false);
                        fetchExpenses();
                    }}
                />
            )}
        </main>
    );
}

// Add Expense Modal Component
function AddExpenseModal({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        sport: "basketball",
        category: "registration",
        description: "",
        amount: "",
        expense_date: new Date().toISOString().split("T")[0],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                }),
            });

            if (!res.ok) throw new Error("Failed to add expense");
            onSuccess();
        } catch {
            alert("Failed to add expense");
        } finally {
            setLoading(false);
        }
    };

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-md">
                <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={onClose}
                >
                    ✕
                </button>

                <h3 className="font-bold text-lg mb-4">Add Expense</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Category */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Category</span>
                        </label>
                        <select
                            className="select select-bordered"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            {EXPENSE_CATEGORIES.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Amount ($)</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="input input-bordered"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Description (optional)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Spring season registration"
                            className="input input-bordered"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Date */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Date</span>
                        </label>
                        <input
                            type="date"
                            className="input input-bordered"
                            value={formData.expense_date}
                            onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                            required
                        />
                    </div>

                    {/* Sport */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Sport</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {SPORT_LIST.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    className={`btn btn-sm ${formData.sport === s.id ? "btn-primary" : "btn-ghost"}`}
                                    onClick={() => setFormData({ ...formData, sport: s.id })}
                                >
                                    {s.icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="modal-action">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`btn btn-primary ${loading ? "loading" : ""}`}
                            disabled={loading || !formData.amount}
                        >
                            Add Expense
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
}
