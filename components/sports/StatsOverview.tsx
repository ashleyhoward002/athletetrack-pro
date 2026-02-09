'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import AnimatedCard from '@/components/ui/AnimatedCard';
import CountUp from '@/components/ui/CountUp';
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
                    {cards.map((stat, index) => {
                        // Extract numeric value for animation
                        const numericValue = parseFloat(stat.value.replace(/[^0-9.-]/g, ''));
                        const isNumeric = !isNaN(numericValue);
                        const hasPercent = stat.value.includes('%');
                        const decimals = stat.value.includes('.') ? (stat.value.split('.')[1]?.replace(/[^0-9]/g, '').length || 0) : 0;

                        return (
                            <AnimatedCard
                                key={index}
                                className="bg-base-200/50 rounded-xl"
                                glowColor={index === 0 ? "rgba(34, 197, 94, 0.4)" : "rgba(99, 102, 241, 0.4)"}
                            >
                                <div className="p-4">
                                    <p className="text-xs font-semibold opacity-70">{stat.label}</p>
                                    <p className="text-2xl font-bold">
                                        {isNumeric ? (
                                            <CountUp
                                                end={numericValue}
                                                decimals={decimals}
                                                suffix={hasPercent ? "%" : ""}
                                                duration={1500}
                                            />
                                        ) : (
                                            stat.value
                                        )}
                                    </p>
                                </div>
                            </AnimatedCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
