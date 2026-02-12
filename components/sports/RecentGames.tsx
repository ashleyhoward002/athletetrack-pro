'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    SportId,
    DEFAULT_SPORT,
    SPORT_LIST,
    getSportConfig,
} from '@/lib/sports/config';
import QuickShareButton from '@/components/highlights/QuickShareButton';

export default function RecentGames() {
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sport, setSport] = useState<SportId>(DEFAULT_SPORT);

    useEffect(() => {
        fetchGames();
    }, [sport]);

    const fetchGames = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/games?sport=${sport}&limit=10`);
            const data = await response.json();
            setGames(data.games || []);
        } catch (error) {
            toast.error('Failed to load games');
        } finally {
            setLoading(false);
        }
    };

    const config = getSportConfig(sport);

    if (loading) return <div className="loading loading-spinner loading-lg"></div>;

    return (
        <div className="card bg-base-200">
            <div className="card-body">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="card-title">Recent Games</h2>
                    <div className="flex gap-1">
                        {SPORT_LIST.map((s) => (
                            <button
                                key={s.id}
                                className={`btn btn-xs ${sport === s.id ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setSport(s.id)}
                            >
                                {s.icon}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Opponent</th>
                                {config.tableColumns.slice(0, 5).map((col) => (
                                    <th key={col.key} className="text-right">{col.label}</th>
                                ))}
                                <th className="text-center w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {games.length > 0 ? (
                                games.map((game: any) => (
                                    <tr key={game.id}>
                                        <td>{new Date(game.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                        <td>{game.opponent}</td>
                                        {config.tableColumns.slice(0, 5).map((col) => (
                                            <td key={col.key} className="text-right">
                                                {col.compute(game.stats || {})}
                                            </td>
                                        ))}
                                        <td className="text-center">
                                            <QuickShareButton
                                                game={game}
                                                allGames={games}
                                                variant="icon"
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3 + config.tableColumns.slice(0, 5).length} className="text-center">
                                        No {config.name.toLowerCase()} games recorded yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
