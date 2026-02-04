"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SPORT_LIST, SportId, getSportConfig } from "@/lib/sports/config";

export default function AddDrillForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [sport, setSport] = useState<SportId>("basketball");
    const [formData, setFormData] = useState({
        name: "",
        category: "Shooting",
        difficulty: "Rookie",
        description: "",
        video_url: "",
        duration_minutes: 10,
        sets: 3,
        reps: 10,
    });

    const config = getSportConfig(sport);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/drills", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    sport,
                    duration_minutes: formData.duration_minutes || 10,
                    sets: formData.sets || 3,
                    reps: formData.reps || 10,
                }),
            });

            if (!res.ok) throw new Error("Failed to add drill");

            setFormData({
                name: "",
                category: config.drillCategories[0] || "Shooting",
                difficulty: "Rookie",
                description: "",
                video_url: "",
                duration_minutes: 10,
                sets: 3,
                reps: 10,
            });
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Error adding drill");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sport Selector */}
            <div className="form-control">
                <label className="label">
                    <span className="label-text text-white">Sport</span>
                </label>
                <select
                    className="select select-bordered w-full bg-white/10 border-white/20 text-white focus:outline-none focus:border-primary"
                    value={sport}
                    onChange={(e) => {
                        const newSport = e.target.value as SportId;
                        setSport(newSport);
                        const newConfig = getSportConfig(newSport);
                        setFormData({
                            ...formData,
                            category: newConfig.drillCategories[0] || "",
                        });
                    }}
                >
                    {SPORT_LIST.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.icon} {s.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text text-white">Drill Name</span>
                </label>
                <input
                    type="text"
                    required
                    placeholder="e.g. Mikan Drill"
                    className="input input-bordered w-full bg-white/10 border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text text-white">Category</span>
                    </label>
                    <select
                        className="select select-bordered w-full bg-white/10 border-white/20 text-white focus:outline-none focus:border-primary"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        {config.drillCategories.map((cat) => (
                            <option key={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text text-white">Difficulty</span>
                    </label>
                    <select
                        className="select select-bordered w-full bg-white/10 border-white/20 text-white focus:outline-none focus:border-primary"
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    >
                        <option>Rookie</option>
                        <option>Pro</option>
                        <option>All-Star</option>
                    </select>
                </div>
            </div>

            {/* Duration, Sets, Reps */}
            <div className="grid grid-cols-3 gap-3">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text text-white text-xs">Duration (min)</span>
                    </label>
                    <input
                        type="number"
                        min={1}
                        className="input input-bordered input-sm bg-white/10 border-white/20 text-white"
                        value={formData.duration_minutes}
                        onChange={(e) =>
                            setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 10 })
                        }
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text text-white text-xs">Sets</span>
                    </label>
                    <input
                        type="number"
                        min={1}
                        className="input input-bordered input-sm bg-white/10 border-white/20 text-white"
                        value={formData.sets}
                        onChange={(e) =>
                            setFormData({ ...formData, sets: parseInt(e.target.value) || 3 })
                        }
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text text-white text-xs">Reps</span>
                    </label>
                    <input
                        type="number"
                        min={1}
                        className="input input-bordered input-sm bg-white/10 border-white/20 text-white"
                        value={formData.reps}
                        onChange={(e) =>
                            setFormData({ ...formData, reps: parseInt(e.target.value) || 10 })
                        }
                    />
                </div>
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text text-white">Description</span>
                </label>
                <textarea
                    required
                    placeholder="Describe the drill steps..."
                    className="textarea textarea-bordered h-24 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text text-white">Video URL (Optional)</span>
                </label>
                <input
                    type="url"
                    placeholder="https://youtube.com/..."
                    className="input input-bordered w-full bg-white/10 border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                />
            </div>

            <button
                type="submit"
                className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
                disabled={loading}
            >
                {loading ? "Adding Drill..." : "Add Drill"}
            </button>
        </form>
    );
}
