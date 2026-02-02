'use client';

import { useEffect, useState } from 'react';
import {
    SportId,
    DEFAULT_SPORT,
    getSportConfig,
    sumStats,
} from '@/lib/sports/config';

interface Goal {
    label: string;
    current: number;
    target: number;
    color: string;
}

const COLORS = ['primary', 'success', 'secondary', 'accent', 'info'];

export default function ProgressTracking() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const sport: SportId = DEFAULT_SPORT;
            const res = await fetch(`/api/games?sport=${sport}`);
            const data = await res.json();
            const games = data.games || [];

            if (games.length === 0) {
                setGoals([]);
                return;
            }

            const config = getSportConfig(sport);
            const totals = sumStats(games.map((g: any) => ({ stats: g.stats || {} })));
            const count = games.length;

            // Build goals from average cards with reasonable targets
            const result: Goal[] = config.averageCards.slice(0, 4).map((card, i) => {
                const current = card.compute(totals, count);
                // Set target as 10% above current (or at least current + 1 for small values)
                const target = current > 10 ? Math.ceil(current * 1.1) : Math.ceil(current + 1);
                return {
                    label: card.label,
                    current: parseFloat(current.toFixed(1)),
                    target,
                    color: COLORS[i % COLORS.length],
                };
            });

            setGoals(result);
        } catch {
            setGoals([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="card bg-base-200">
                <div className="card-body">
                    <h2 className="card-title">Progress to Goals</h2>
                    <div className="flex justify-center py-4">
                        <span className="loading loading-spinner loading-sm" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-base-200">
            <div className="card-body">
                <h2 className="card-title">Progress to Goals</h2>
                {goals.length === 0 ? (
                    <p className="text-sm text-base-content/50">Log games to see progress tracking.</p>
                ) : (
                    <div className="space-y-4">
                        {goals.map((goal) => (
                            <div key={goal.label}>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium">{goal.label}</span>
                                    <span className="text-sm">{goal.current}/{goal.target}</span>
                                </div>
                                <progress
                                    className={`progress progress-${goal.color}`}
                                    value={goal.current}
                                    max={goal.target}
                                ></progress>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
