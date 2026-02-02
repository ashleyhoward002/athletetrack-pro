'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import {
    SportId,
    DEFAULT_SPORT,
    SPORT_LIST,
    getSportConfig,
    sumStats,
} from '@/lib/sports/config';

interface StatCard {
    label: string;
    value: string;
}

export default function StatsOverview() {
    const [sport, setSport] = useState<SportId>(DEFAULT_SPORT);
    const [cards, setCards] = useState<StatCard[]>([]);
    const [gameCount, setGameCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [sport]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/games?sport=${sport}`);
            const data = await res.json();
            const games = data.games || [];
            setGameCount(games.length);

            if (games.length === 0) {
                setCards([]);
                return;
            }

            const config = getSportConfig(sport);
            const totals = sumStats(games.map((g: any) => ({ stats: g.stats || {} })));
            const result: StatCard[] = [
                { label: 'Games', value: String(games.length) },
            ];

            for (const card of config.averageCards) {
                const value = card.compute(totals, games.length);
                result.push({ label: card.label, value: card.format(value) });
            }

            setCards(result);
        } catch {
            setCards([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
                {SPORT_LIST.map((s) => (
                    <button
                        key={s.id}
                        className={`btn btn-xs ${sport === s.id ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setSport(s.id)}
                    >
                        {s.icon} {s.name}
                    </button>
                ))}
            </div>
            {loading ? (
                <div className="flex justify-center py-4">
                    <span className="loading loading-spinner loading-sm text-primary" />
                </div>
            ) : cards.length === 0 ? (
                <p className="text-sm text-base-content/50">No {getSportConfig(sport).name} games logged yet.</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {cards.map((stat, index) => (
                        <GlassCard key={index} className="border-0 bg-base-200/50">
                            <div>
                                <p className="text-xs font-semibold opacity-70">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
}
