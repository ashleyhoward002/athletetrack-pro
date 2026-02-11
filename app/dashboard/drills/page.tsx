"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import HelpIcon from "@/components/ui/HelpIcon";
import toast from "react-hot-toast";
import { SPORT_LIST, SportId, getSportConfig } from "@/lib/sports/config";

type Drill = {
    id: string;
    name: string;
    category: string;
    difficulty: string;
    description: string;
    video_url: string | null;
    sport: SportId;
    duration_minutes: number;
    sets: number;
    reps: number;
    is_curated: boolean;
};

type Program = {
    id: string;
    name: string;
    sport: string;
    status: string;
};

type DrillFormData = {
    name: string;
    category: string;
    difficulty: string;
    description: string;
    video_url: string;
    sport: SportId;
    duration_minutes: number;
    sets: number;
    reps: number;
};

const emptyForm: DrillFormData = {
    name: "",
    category: "Shooting",
    difficulty: "Rookie",
    description: "",
    video_url: "",
    sport: "basketball",
    duration_minutes: 10,
    sets: 3,
    reps: 10,
};

export default function DrillsPage() {
    const supabase = createClient();
    const [drills, setDrills] = useState<Drill[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingDrill, setEditingDrill] = useState<Drill | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Drill | null>(null);
    const [filterSport, setFilterSport] = useState<SportId | "all">("all");
    const [formData, setFormData] = useState<DrillFormData>(emptyForm);
    const [startingDrill, setStartingDrill] = useState<string | null>(null);
    const [viewingDrill, setViewingDrill] = useState<Drill | null>(null);
    const [addToProgramDrill, setAddToProgramDrill] = useState<Drill | null>(null);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loadingPrograms, setLoadingPrograms] = useState(false);
    const [addingToProgram, setAddingToProgram] = useState<string | null>(null);

    const fetchDrills = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("drills")
            .select("*")
            .order("sport")
            .order("category")
            .order("name");

        if (error) {
            toast.error("Failed to load drills");
        } else {
            setDrills(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchDrills();
    }, [fetchDrills]);

    const config = getSportConfig(formData.sport);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const method = editingDrill ? "PUT" : "POST";
            const body = editingDrill
                ? { ...formData, id: editingDrill.id }
                : formData;

            const res = await fetch("/api/drills", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error("Failed to save drill");

            toast.success(editingDrill ? "Drill updated!" : "Drill added!");
            setModalOpen(false);
            setEditingDrill(null);
            setFormData(emptyForm);
            fetchDrills();
        } catch (error) {
            toast.error("Error saving drill");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            const res = await fetch(`/api/drills?id=${deleteTarget.id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            toast.success("Drill deleted");
            setDeleteTarget(null);
            fetchDrills();
        } catch (error) {
            toast.error("Error deleting drill");
        }
    };

    const handleSeedDrills = async () => {
        setSeeding(true);
        try {
            const res = await fetch("/api/seed-drills", { method: "POST" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to seed drills");

            toast.success(`Loaded ${data.count || 36} sample drills!`);
            fetchDrills();
        } catch (error: any) {
            toast.error(error.message || "Error loading sample drills");
        } finally {
            setSeeding(false);
        }
    };

    const handleStartDrill = async (drill: Drill) => {
        setStartingDrill(drill.id);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Not authenticated");
                return;
            }

            // Log drill completion
            const { error } = await supabase.from("drill_completions").insert({
                user_id: user.id,
                drill_id: drill.id,
                completed_at: new Date().toISOString(),
                xp_earned: 25, // Default XP
            });

            if (error) throw error;

            toast.success(
                <div>
                    <div className="font-bold">Drill Started!</div>
                    <div className="text-sm">{drill.name} - {drill.sets} sets x {drill.reps} reps</div>
                </div>,
                { duration: 4000 }
            );
        } catch (error) {
            console.error("Failed to start drill:", error);
            toast.error("Failed to log drill");
        } finally {
            setStartingDrill(null);
        }
    };

    const fetchPrograms = async (sport: SportId) => {
        setLoadingPrograms(true);
        try {
            const res = await fetch(`/api/programs?sport=${sport}&status=active`);
            const data = await res.json();
            setPrograms(data.programs || []);
        } catch {
            setPrograms([]);
        } finally {
            setLoadingPrograms(false);
        }
    };

    const openAddToProgram = (drill: Drill) => {
        setAddToProgramDrill(drill);
        fetchPrograms(drill.sport);
    };

    const handleAddToProgram = async (programId: string) => {
        if (!addToProgramDrill) return;
        setAddingToProgram(programId);

        try {
            // Fetch the program to get its days
            const res = await fetch(`/api/programs/${programId}`);
            if (!res.ok) throw new Error("Failed to fetch program");
            const data = await res.json();
            const program = data.program;
            const days = program.program_days || [];

            if (days.length === 0) {
                toast.error("This program has no training days. Edit the program first.");
                return;
            }

            // Add to the last day (or first non-rest day)
            const targetDay = days.find((d: any) => !d.rest_day) || days[0];

            const { error } = await supabase.from("program_day_drills").insert({
                program_day_id: targetDay.id,
                drill_id: addToProgramDrill.id,
                order_index: (targetDay.program_day_drills?.length || 0) + 1,
            });

            if (error) throw error;

            toast.success(`Added "${addToProgramDrill.name}" to ${program.name}!`);
            setAddToProgramDrill(null);
        } catch (error) {
            console.error("Failed to add to program:", error);
            toast.error("Failed to add drill to program");
        } finally {
            setAddingToProgram(null);
        }
    };

    const openAdd = () => {
        setEditingDrill(null);
        setFormData(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (drill: Drill) => {
        setEditingDrill(drill);
        setFormData({
            name: drill.name,
            category: drill.category,
            difficulty: drill.difficulty,
            description: drill.description,
            video_url: drill.video_url || "",
            sport: drill.sport,
            duration_minutes: drill.duration_minutes,
            sets: drill.sets,
            reps: drill.reps,
        });
        setModalOpen(true);
    };

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case "Rookie": return "badge-success";
            case "Pro": return "badge-warning";
            case "All-Star": return "badge-error";
            default: return "badge-ghost";
        }
    };

    const getSportEmoji = (sport: SportId) => {
        const s = SPORT_LIST.find(sp => sp.id === sport);
        return s?.icon || "";
    };

    const filteredDrills = filterSport === "all"
        ? drills
        : drills.filter(d => d.sport === filterSport);

    const hasCuratedDrills = drills.some(d => d.is_curated);

    return (
        <main className="min-h-screen p-4 md:p-8 pb-24 bg-gradient-to-br from-[#0A192F] to-[#004D99]">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="btn btn-circle btn-ghost text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl md:text-4xl font-extrabold text-white">Drill Library</h1>
                                <HelpIcon section="drills" tooltip="Learn how to use drills" />
                            </div>
                            <p className="text-blue-200">{drills.length} drills available</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {!hasCuratedDrills && (
                            <button
                                className={`btn btn-success ${seeding ? "loading" : ""}`}
                                onClick={handleSeedDrills}
                                disabled={seeding}
                            >
                                {seeding ? "Loading..." : "Load Sample Drills"}
                            </button>
                        )}
                        <button className="btn btn-primary" onClick={openAdd}>
                            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Drill
                        </button>
                    </div>
                </div>

                {/* Sport Filter */}
                <div className="flex flex-wrap gap-2">
                    <button
                        className={`btn btn-sm ${filterSport === "all" ? "btn-primary" : "btn-ghost text-white border-white/20"}`}
                        onClick={() => setFilterSport("all")}
                    >
                        All Sports
                    </button>
                    {SPORT_LIST.map(sport => (
                        <button
                            key={sport.id}
                            className={`btn btn-sm ${filterSport === sport.id ? "btn-primary" : "btn-ghost text-white border-white/20"}`}
                            onClick={() => setFilterSport(sport.id)}
                        >
                            {sport.icon} {sport.name}
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center py-16">
                        <span className="loading loading-spinner loading-lg text-primary" />
                    </div>
                )}

                {/* Empty State */}
                {!loading && drills.length === 0 && (
                    <GlassCard className="text-center py-16">
                        <svg className="w-16 h-16 mx-auto text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="text-xl font-semibold text-white mt-4">No drills yet</h3>
                        <p className="text-white/60 mt-2 max-w-md mx-auto">
                            Load sample drills to get started, or create your own custom drills.
                        </p>
                        <div className="flex gap-2 justify-center mt-6">
                            <button className="btn btn-success" onClick={handleSeedDrills} disabled={seeding}>
                                {seeding ? "Loading..." : "Load Sample Drills"}
                            </button>
                            <button className="btn btn-primary" onClick={openAdd}>
                                Create Custom Drill
                            </button>
                        </div>
                    </GlassCard>
                )}

                {/* Drills Grid */}
                {!loading && filteredDrills.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredDrills.map((drill) => (
                            <GlassCard key={drill.id} className="hover:scale-[1.02] transition-transform">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex gap-2">
                                        <span className="badge badge-outline text-white">{getSportEmoji(drill.sport)} {drill.sport}</span>
                                        <span className="badge badge-outline text-white">{drill.category}</span>
                                    </div>
                                    <span className={`badge ${getDifficultyColor(drill.difficulty)}`}>{drill.difficulty}</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{drill.name}</h3>
                                <p className="text-gray-300 text-sm mb-3 line-clamp-3">{drill.description}</p>

                                <div className="flex gap-3 text-xs text-white/60 mb-4">
                                    <span>{drill.duration_minutes} min</span>
                                    <span>{drill.sets} sets</span>
                                    <span>{drill.reps} reps</span>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <button
                                            className={`btn btn-sm btn-success ${startingDrill === drill.id ? "loading" : ""}`}
                                            onClick={() => handleStartDrill(drill)}
                                            disabled={startingDrill === drill.id}
                                        >
                                            {startingDrill === drill.id ? "" : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                    </svg>
                                                    Start
                                                </>
                                            )}
                                        </button>
                                        <div className="flex gap-1">
                                            <button
                                                className="btn btn-ghost btn-xs text-info"
                                                onClick={() => setViewingDrill(drill)}
                                                title="View details"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-xs text-primary"
                                                onClick={() => openAddToProgram(drill)}
                                                title="Add to program"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </button>
                                            {drill.video_url && (
                                                <a
                                                    href={drill.video_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-ghost btn-xs text-warning"
                                                    title="Watch video"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                                    </svg>
                                                </a>
                                            )}
                                            <button
                                                className="btn btn-ghost btn-xs text-white"
                                                onClick={() => openEdit(drill)}
                                                title="Edit drill"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-xs text-error"
                                                onClick={() => setDeleteTarget(drill)}
                                                title="Delete drill"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {drill.is_curated && (
                                    <div className="mt-2">
                                        <span className="badge badge-sm badge-ghost text-white/50">Sample Drill</span>
                                    </div>
                                )}
                            </GlassCard>
                        ))}
                    </div>
                )}

                {/* No Results for Filter */}
                {!loading && drills.length > 0 && filteredDrills.length === 0 && (
                    <div className="text-center py-12 text-white/50">
                        No drills found for {filterSport}. Try a different sport or add one!
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <dialog className={`modal ${modalOpen ? "modal-open" : ""}`}>
                <div className="modal-box bg-base-100 max-w-lg">
                    <h3 className="font-bold text-lg mb-4">
                        {editingDrill ? "Edit Drill" : "Add New Drill"}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Sport */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Sport</span>
                            </label>
                            <select
                                className="select select-bordered w-full"
                                value={formData.sport}
                                onChange={(e) => {
                                    const newSport = e.target.value as SportId;
                                    const newConfig = getSportConfig(newSport);
                                    setFormData({
                                        ...formData,
                                        sport: newSport,
                                        category: newConfig.drillCategories[0] || "",
                                    });
                                }}
                            >
                                {SPORT_LIST.map(s => (
                                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Name */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Drill Name</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Mikan Drill"
                                className="input input-bordered w-full"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Category & Difficulty */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Category</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {config.drillCategories.map(cat => (
                                        <option key={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Difficulty</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
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
                                    <span className="label-text text-xs">Duration (min)</span>
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    className="input input-bordered input-sm"
                                    value={formData.duration_minutes}
                                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 10 })}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-xs">Sets</span>
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    className="input input-bordered input-sm"
                                    value={formData.sets}
                                    onChange={(e) => setFormData({ ...formData, sets: parseInt(e.target.value) || 3 })}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-xs">Reps</span>
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    className="input input-bordered input-sm"
                                    value={formData.reps}
                                    onChange={(e) => setFormData({ ...formData, reps: parseInt(e.target.value) || 10 })}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Description</span>
                            </label>
                            <textarea
                                required
                                placeholder="Describe the drill steps..."
                                className="textarea textarea-bordered h-24"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Video URL */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Video URL (Optional)</span>
                            </label>
                            <input
                                type="url"
                                placeholder="https://youtube.com/..."
                                className="input input-bordered w-full"
                                value={formData.video_url}
                                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                            />
                        </div>

                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => {
                                    setModalOpen(false);
                                    setEditingDrill(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`btn btn-primary ${saving ? "loading" : ""}`}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : editingDrill ? "Update" : "Add Drill"}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => { setModalOpen(false); setEditingDrill(null); }}>close</button>
                </form>
            </dialog>

            {/* Delete Confirmation */}
            <dialog className={`modal ${deleteTarget ? "modal-open" : ""}`}>
                <div className="modal-box max-w-sm">
                    <h3 className="font-bold text-lg">Delete Drill</h3>
                    <p className="py-4 text-base-content/70">
                        Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
                    </p>
                    <div className="modal-action">
                        <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </button>
                        <button className="btn btn-error" onClick={handleDelete}>
                            Delete
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setDeleteTarget(null)}>close</button>
                </form>
            </dialog>

            {/* Drill Detail Modal */}
            <dialog className={`modal ${viewingDrill ? "modal-open" : ""}`}>
                <div className="modal-box max-w-2xl bg-base-100">
                    {viewingDrill && (
                        <>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-2xl">{viewingDrill.name}</h3>
                                    <div className="flex gap-2 mt-2">
                                        <span className="badge">{getSportEmoji(viewingDrill.sport)} {viewingDrill.sport}</span>
                                        <span className="badge">{viewingDrill.category}</span>
                                        <span className={`badge ${getDifficultyColor(viewingDrill.difficulty)}`}>{viewingDrill.difficulty}</span>
                                    </div>
                                </div>
                                <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setViewingDrill(null)}>✕</button>
                            </div>

                            <div className="divider"></div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-sm text-base-content/60 mb-1">Description</h4>
                                    <p className="text-base-content">{viewingDrill.description}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-base-200 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-primary">{viewingDrill.duration_minutes}</div>
                                        <div className="text-xs text-base-content/60">Minutes</div>
                                    </div>
                                    <div className="bg-base-200 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-secondary">{viewingDrill.sets}</div>
                                        <div className="text-xs text-base-content/60">Sets</div>
                                    </div>
                                    <div className="bg-base-200 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-accent">{viewingDrill.reps}</div>
                                        <div className="text-xs text-base-content/60">Reps</div>
                                    </div>
                                </div>

                                {viewingDrill.video_url && (
                                    <div>
                                        <h4 className="font-semibold text-sm text-base-content/60 mb-2">Video Tutorial</h4>
                                        <a
                                            href={viewingDrill.video_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline btn-primary w-full"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                            </svg>
                                            Watch Video
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="modal-action">
                                <button className="btn btn-ghost" onClick={() => setViewingDrill(null)}>Close</button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        openAddToProgram(viewingDrill);
                                        setViewingDrill(null);
                                    }}
                                >
                                    Add to Program
                                </button>
                                <button
                                    className={`btn btn-success ${startingDrill === viewingDrill.id ? "loading" : ""}`}
                                    onClick={() => handleStartDrill(viewingDrill)}
                                    disabled={startingDrill === viewingDrill.id}
                                >
                                    {startingDrill === viewingDrill.id ? "" : "Start Drill"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setViewingDrill(null)}>close</button>
                </form>
            </dialog>

            {/* Add to Program Modal */}
            <dialog className={`modal ${addToProgramDrill ? "modal-open" : ""}`}>
                <div className="modal-box max-w-md bg-base-100">
                    <h3 className="font-bold text-lg mb-2">Add to Training Program</h3>
                    {addToProgramDrill && (
                        <p className="text-base-content/60 text-sm mb-4">
                            Add <strong>{addToProgramDrill.name}</strong> to one of your active programs:
                        </p>
                    )}

                    {loadingPrograms ? (
                        <div className="flex justify-center py-8">
                            <span className="loading loading-spinner loading-md" />
                        </div>
                    ) : programs.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-base-content/60 mb-4">No active training programs found for this sport.</p>
                            <Link href="/dashboard/training/programs/new" className="btn btn-primary btn-sm">
                                Create a Program
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {programs.map((program) => (
                                <button
                                    key={program.id}
                                    className={`btn btn-block justify-start ${addingToProgram === program.id ? "loading" : ""}`}
                                    onClick={() => handleAddToProgram(program.id)}
                                    disabled={addingToProgram !== null}
                                >
                                    {addingToProgram !== program.id && (
                                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    )}
                                    {program.name}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="modal-action">
                        <button className="btn btn-ghost" onClick={() => setAddToProgramDrill(null)}>
                            Cancel
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setAddToProgramDrill(null)}>close</button>
                </form>
            </dialog>
        </main>
    );
}
