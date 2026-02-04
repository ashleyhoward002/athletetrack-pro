"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SPORT_LIST, SportId, getSportConfig } from "@/lib/sports/config";
import toast from "react-hot-toast";

interface DrillOption {
    id: string;
    name: string;
    category: string;
    difficulty: string;
    duration_minutes: number;
    sets: number;
    reps: number;
}

interface DayConfig {
    day_number: number;
    week_number: number;
    name: string;
    rest_day: boolean;
    drills: { drill_id: string; sets_override?: number; reps_override?: number; notes?: string }[];
}

export default function CreateProgramForm() {
    const router = useRouter();
    const [sport, setSport] = useState<SportId>("basketball");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [difficulty, setDifficulty] = useState("Rookie");
    const [durationWeeks, setDurationWeeks] = useState(1);
    const [days, setDays] = useState<DayConfig[]>([
        { day_number: 1, week_number: 1, name: "", rest_day: false, drills: [] },
    ]);
    const [availableDrills, setAvailableDrills] = useState<DrillOption[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch(`/api/drills?sport=${sport}`)
            .then((r) => r.json())
            .then((data) => setAvailableDrills(data.drills || []))
            .catch(() => setAvailableDrills([]));
    }, [sport]);

    const addDay = () => {
        const maxDay = Math.max(...days.map((d) => d.day_number), 0);
        const weekNum = Math.ceil((maxDay + 1) / 7) || 1;
        setDays([
            ...days,
            {
                day_number: maxDay + 1,
                week_number: weekNum,
                name: "",
                rest_day: false,
                drills: [],
            },
        ]);
    };

    const removeDay = (index: number) => {
        setDays(days.filter((_, i) => i !== index));
    };

    const updateDay = (index: number, updates: Partial<DayConfig>) => {
        setDays(days.map((d, i) => (i === index ? { ...d, ...updates } : d)));
    };

    const addDrillToDay = (dayIndex: number, drillId: string) => {
        const day = days[dayIndex];
        if (day.drills.some((d) => d.drill_id === drillId)) return;
        updateDay(dayIndex, {
            drills: [...day.drills, { drill_id: drillId }],
        });
    };

    const removeDrillFromDay = (dayIndex: number, drillIndex: number) => {
        const day = days[dayIndex];
        updateDay(dayIndex, {
            drills: day.drills.filter((_, i) => i !== drillIndex),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Program name is required");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/programs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description: description || null,
                    sport,
                    difficulty,
                    duration_weeks: durationWeeks,
                    days,
                }),
            });

            if (!res.ok) throw new Error("Failed to create program");

            const data = await res.json();
            toast.success("Program created!");
            router.push(`/dashboard/training/programs/${data.program.id}`);
        } catch (error) {
            toast.error("Failed to create program");
        } finally {
            setLoading(false);
        }
    };

    const getDrillName = (drillId: string) =>
        availableDrills.find((d) => d.id === drillId)?.name || "Unknown Drill";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <h3 className="card-title">Program Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Program Name</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Pre-Season Shooting Program"
                                className="input input-bordered"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Sport</span>
                            </label>
                            <select
                                className="select select-bordered"
                                value={sport}
                                onChange={(e) => setSport(e.target.value as SportId)}
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
                                <span className="label-text">Difficulty</span>
                            </label>
                            <select
                                className="select select-bordered"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <option>Rookie</option>
                                <option>Pro</option>
                                <option>All-Star</option>
                            </select>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Duration (weeks)</span>
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={12}
                                className="input input-bordered"
                                value={durationWeeks}
                                onChange={(e) =>
                                    setDurationWeeks(parseInt(e.target.value) || 1)
                                }
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Description (optional)</span>
                        </label>
                        <textarea
                            placeholder="What is this program about?"
                            className="textarea textarea-bordered"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Days */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <div className="flex justify-between items-center">
                        <h3 className="card-title">Training Days</h3>
                        <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={addDay}
                        >
                            + Add Day
                        </button>
                    </div>

                    <div className="space-y-4 mt-4">
                        {days.map((day, dayIndex) => (
                            <div
                                key={dayIndex}
                                className="bg-base-300 rounded-lg p-4"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">
                                            Day {day.day_number}
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Day name (optional)"
                                            className="input input-sm input-bordered"
                                            value={day.name}
                                            onChange={(e) =>
                                                updateDay(dayIndex, {
                                                    name: e.target.value,
                                                })
                                            }
                                        />
                                        <label className="label cursor-pointer gap-2">
                                            <span className="label-text text-sm">
                                                Rest Day
                                            </span>
                                            <input
                                                type="checkbox"
                                                className="toggle toggle-sm"
                                                checked={day.rest_day}
                                                onChange={(e) =>
                                                    updateDay(dayIndex, {
                                                        rest_day: e.target.checked,
                                                    })
                                                }
                                            />
                                        </label>
                                    </div>
                                    {days.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-ghost btn-error"
                                            onClick={() => removeDay(dayIndex)}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                {!day.rest_day && (
                                    <>
                                        {/* Drill selector */}
                                        <select
                                            className="select select-bordered select-sm w-full mb-2"
                                            value=""
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    addDrillToDay(
                                                        dayIndex,
                                                        e.target.value
                                                    );
                                                    e.target.value = "";
                                                }
                                            }}
                                        >
                                            <option value="">
                                                + Add a drill...
                                            </option>
                                            {availableDrills.map((drill) => (
                                                <option
                                                    key={drill.id}
                                                    value={drill.id}
                                                >
                                                    {drill.name} ({drill.category},{" "}
                                                    {drill.difficulty})
                                                </option>
                                            ))}
                                        </select>

                                        {/* Selected drills */}
                                        <div className="space-y-1">
                                            {day.drills.map((drill, drillIdx) => (
                                                <div
                                                    key={drillIdx}
                                                    className="flex items-center justify-between bg-base-200 rounded px-3 py-2 text-sm"
                                                >
                                                    <span>
                                                        {drillIdx + 1}.{" "}
                                                        {getDrillName(
                                                            drill.drill_id
                                                        )}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-ghost"
                                                        onClick={() =>
                                                            removeDrillFromDay(
                                                                dayIndex,
                                                                drillIdx
                                                            )
                                                        }
                                                    >
                                                        x
                                                    </button>
                                                </div>
                                            ))}
                                            {day.drills.length === 0 && (
                                                <p className="text-xs text-base-content/50 py-2">
                                                    No drills added yet. Select
                                                    from the dropdown above.
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
                disabled={loading}
            >
                {loading ? "Creating Program..." : "Create Program"}
            </button>
        </form>
    );
}
