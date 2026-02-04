'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { getSportConfig, sumStats } from '@/lib/sports/config';

interface StatCard {
    label: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    color: string;
}

export default function StatsOverview() {
    const [stats, setStats] = useState<StatCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/games?sport=basketball');
            const data = await res.json();
            const games = data.games || [];

            if (games.length === 0) {
                setStats([]);
                return;
            }

            const config = getSportConfig('basketball');
            const totals = sumStats(games.map((g: any) => ({ stats: g.stats || {} })));
            const gamesPlayed = games.length;

            const result: StatCard[] = [
                { label: 'Games Played', value: gamesPlayed, color: 'primary' },
            ];

            // Compute averages from config
            for (const card of config.averageCards) {
                const value = card.compute(totals, gamesPlayed);
                const formatted = card.format(value);
                result.push({ label: card.label, value: formatted, color: 'success' });
            }

            setStats(result);
        } catch {
            setStats([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-4">
                <span className="loading loading-spinner loading-sm text-primary" />
            </div>
        );
    }

    if (stats.length === 0) {
        return <p className="text-sm text-base-content/50">No basketball games logged yet.</p>;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat, index) => (
                <GlassCard key={index} className="border-0 bg-base-200/50">
                    <div className="">
                        <p className="text-xs font-semibold opacity-70">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        {stat.change && (
                            <div className="flex items-center gap-1 mt-1">
                                <span className={`text-lg ${stat.trend === 'up' ? 'text-success' : stat.trend === 'down' ? 'text-error' : 'text-base-content'}`}>
                                    {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'}
                                </span>
                                <span className="text-xs">{stat.change}</span>
                            </div>
                        )}
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}
