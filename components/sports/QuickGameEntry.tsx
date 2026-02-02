'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
    SportId,
    DEFAULT_SPORT,
    SPORT_LIST,
    getSportConfig,
    groupStatFields,
} from '@/lib/sports/config';

export default function QuickGameEntry({ isModal = false }: { isModal?: boolean }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [sport, setSport] = useState<SportId>(DEFAULT_SPORT);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [opponent, setOpponent] = useState('');
    const [stats, setStats] = useState<Record<string, string>>(() => buildEmptyStats(DEFAULT_SPORT));

    function buildEmptyStats(s: SportId): Record<string, string> {
        const config = getSportConfig(s);
        const empty: Record<string, string> = {};
        for (const field of config.statFields) {
            empty[field.key] = '0';
        }
        return empty;
    }

    const handleSportChange = (s: SportId) => {
        setSport(s);
        setStats(buildEmptyStats(s));
    };

    const resetForm = () => {
        setDate(new Date().toISOString().split('T')[0]);
        setOpponent('');
        setStats(buildEmptyStats(sport));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const numStats: Record<string, number> = {};
            for (const [k, v] of Object.entries(stats)) {
                numStats[k] = parseFloat(v) || 0;
            }

            const response = await fetch('/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, opponent, sport, stats: numStats }),
            });

            if (!response.ok) throw new Error('Failed to save game');

            toast.success('Game saved successfully!');
            resetForm();
            setIsExpanded(false);

            if (isModal) {
                const modal = document.getElementById('quick-entry-modal') as HTMLInputElement;
                if (modal) modal.checked = false;
            }
        } catch (error) {
            toast.error('Failed to save game. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const config = getSportConfig(sport);
    const groups = groupStatFields(config.statFields);

    if (!isModal && !isExpanded) {
        return (
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="card-title">Quick Game Entry</h2>
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="btn btn-primary btn-sm"
                        >
                            Add Game
                        </button>
                    </div>
                    <p className="text-base-content/60 text-sm">
                        Quickly log a game for any sport. Click &quot;Add Game&quot; to get started.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={!isModal ? "card bg-base-200 shadow-xl" : ""}>
            <div className={!isModal ? "card-body" : ""}>
                {!isModal && (
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="card-title">Quick Game Entry</h2>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="btn btn-ghost btn-sm"
                        >
                            Collapse
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Sport selector */}
                    <div className="flex gap-2 flex-wrap">
                        {SPORT_LIST.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                className={`btn btn-sm ${sport === s.id ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => handleSportChange(s.id)}
                            >
                                {s.icon} {s.name}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Date</span>
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="input input-bordered"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Opponent</span>
                            </label>
                            <input
                                type="text"
                                value={opponent}
                                onChange={(e) => setOpponent(e.target.value)}
                                placeholder="Team name"
                                className="input input-bordered"
                                required
                            />
                        </div>
                    </div>

                    {/* Dynamic stat fields by group */}
                    {Object.entries(groups).map(([groupName, fields]) => (
                        <div key={groupName}>
                            <div className="divider text-xs">{groupName}</div>
                            <div className="grid grid-cols-4 gap-3">
                                {fields.map((field) => (
                                    <div key={field.key} className="form-control">
                                        <label className="label">
                                            <span className="label-text text-xs">{field.label}</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={field.max}
                                            step={field.type === 'decimal' ? '0.1' : '1'}
                                            value={stats[field.key] ?? '0'}
                                            onChange={(e) =>
                                                setStats((prev) => ({ ...prev, [field.key]: e.target.value }))
                                            }
                                            className="input input-bordered input-sm text-center"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className={`btn btn-success flex-1 ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Game'}
                        </button>
                        {!isModal && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsExpanded(false);
                                    resetForm();
                                }}
                                className="btn btn-ghost"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
