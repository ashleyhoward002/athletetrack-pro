"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProgramDayView from "@/components/training/ProgramDayView";
import toast from "react-hot-toast";

export default function ProgramDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [program, setProgram] = useState<any>(null);
    const [completions, setCompletions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProgram = async () => {
        try {
            const res = await fetch(`/api/programs/${params.id}`);
            if (!res.ok) throw new Error("Not found");
            const data = await res.json();
            setProgram(data.program);
            setCompletions(data.completions || []);
        } catch {
            toast.error("Program not found");
            router.push("/dashboard/training");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgram();
    }, [params.id]);

    const handleStatusChange = async (status: string) => {
        try {
            await fetch(`/api/programs/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            toast.success(`Program ${status}`);
            fetchProgram();
        } catch {
            toast.error("Failed to update program");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this program?")) return;
        try {
            await fetch(`/api/programs/${params.id}`, { method: "DELETE" });
            toast.success("Program deleted");
            router.push("/dashboard/training");
        } catch {
            toast.error("Failed to delete program");
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg" />
            </main>
        );
    }

    if (!program) return null;

    const days = program.program_days || [];
    const totalDrills = days.reduce(
        (sum: number, d: any) => sum + (d.program_day_drills?.length || 0),
        0
    );
    const completedDrills = days.reduce(
        (sum: number, d: any) =>
            sum +
            (d.program_day_drills?.filter((dd: any) =>
                completions.some(
                    (c) => c.drill_id === dd.drill_id && c.program_day_id === d.id
                )
            ).length || 0),
        0
    );
    const progress = totalDrills > 0 ? Math.round((completedDrills / totalDrills) * 100) : 0;

    // Group days by week
    const weeks: Record<number, any[]> = {};
    for (const day of days) {
        const wk = day.week_number || 1;
        if (!weeks[wk]) weeks[wk] = [];
        weeks[wk].push(day);
    }

    return (
        <main className="min-h-screen p-4 md:p-8 pb-24">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/training" className="btn btn-circle btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-extrabold">{program.name}</h1>
                        {program.description && (
                            <p className="text-base-content/60">{program.description}</p>
                        )}
                    </div>
                </div>

                {/* Progress & Actions */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex-1">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>{completedDrills}/{totalDrills} drills completed</span>
                                    <span className="font-bold">{progress}%</span>
                                </div>
                                <progress className="progress progress-primary w-full" value={progress} max={100} />
                            </div>
                            <div className="flex gap-2">
                                {program.status === "active" && (
                                    <>
                                        <button className="btn btn-sm btn-ghost" onClick={() => handleStatusChange("paused")}>Pause</button>
                                        <button className="btn btn-sm btn-success" onClick={() => handleStatusChange("completed")}>Mark Complete</button>
                                    </>
                                )}
                                {program.status === "paused" && (
                                    <button className="btn btn-sm btn-primary" onClick={() => handleStatusChange("active")}>Resume</button>
                                )}
                                <button className="btn btn-sm btn-error btn-ghost" onClick={handleDelete}>Delete</button>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <span className="badge badge-sm">{program.sport}</span>
                            <span className="badge badge-sm">{program.difficulty}</span>
                            <span className="badge badge-sm">{program.duration_weeks} week{program.duration_weeks > 1 ? "s" : ""}</span>
                            <span className={`badge badge-sm ${program.status === "active" ? "badge-primary" : "badge-ghost"}`}>{program.status}</span>
                        </div>
                    </div>
                </div>

                {/* Days by Week */}
                {Object.entries(weeks)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([weekNum, weekDays]) => (
                        <div key={weekNum}>
                            <h2 className="text-xl font-bold mb-3">Week {weekNum}</h2>
                            <div className="space-y-3">
                                {weekDays
                                    .sort((a: any, b: any) => a.day_number - b.day_number)
                                    .map((day: any) => (
                                        <ProgramDayView
                                            key={day.id}
                                            day={day}
                                            completions={completions}
                                            onDrillCompleted={fetchProgram}
                                        />
                                    ))}
                            </div>
                        </div>
                    ))}
            </div>
        </main>
    );
}
