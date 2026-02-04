"use client";

import { useState } from "react";
import DrillCompletionModal from "./DrillCompletionModal";

interface Drill {
    id: string;
    name: string;
    category: string;
    difficulty: string;
    description: string;
    duration_minutes: number;
    sets: number;
    reps: number;
    video_url: string | null;
}

interface DayDrill {
    id: string;
    drill_id: string;
    order_index: number;
    sets_override: number | null;
    reps_override: number | null;
    notes: string | null;
    drills: Drill;
}

interface ProgramDayViewProps {
    day: {
        id: string;
        day_number: number;
        week_number: number;
        name: string | null;
        rest_day: boolean;
        program_day_drills: DayDrill[];
    };
    completions: { drill_id: string; program_day_id: string }[];
    onDrillCompleted: () => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
    Rookie: "badge-success",
    Pro: "badge-warning",
    "All-Star": "badge-error",
};

export default function ProgramDayView({
    day,
    completions,
    onDrillCompleted,
}: ProgramDayViewProps) {
    const [completingDrill, setCompletingDrill] = useState<DayDrill | null>(null);

    if (day.rest_day) {
        return (
            <div className="card bg-base-200">
                <div className="card-body py-4 px-5">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">😴</span>
                        <div>
                            <h4 className="font-semibold">
                                Day {day.day_number}: Rest Day
                            </h4>
                            <p className="text-sm text-base-content/60">
                                Recovery is part of training
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const dayCompletions = completions.filter(
        (c) => c.program_day_id === day.id
    );

    const isDrillCompleted = (drillId: string) =>
        dayCompletions.some((c) => c.drill_id === drillId);

    const completedCount = day.program_day_drills.filter((dd) =>
        isDrillCompleted(dd.drill_id)
    ).length;

    return (
        <>
            <div className="card bg-base-200">
                <div className="card-body p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold">
                            Day {day.day_number}
                            {day.name ? `: ${day.name}` : ""}
                        </h4>
                        <span className="text-sm text-base-content/60">
                            {completedCount}/{day.program_day_drills.length} done
                        </span>
                    </div>

                    <div className="space-y-2">
                        {day.program_day_drills.map((dd) => {
                            const drill = dd.drills;
                            const completed = isDrillCompleted(dd.drill_id);
                            const sets = dd.sets_override || drill.sets;
                            const reps = dd.reps_override || drill.reps;

                            return (
                                <div
                                    key={dd.id}
                                    className={`flex items-center justify-between p-3 rounded-lg ${
                                        completed
                                            ? "bg-success/10 border border-success/30"
                                            : "bg-base-300"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                                completed
                                                    ? "bg-success text-success-content"
                                                    : "bg-base-content/20"
                                            }`}
                                        >
                                            {completed ? "✓" : dd.order_index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">
                                                {drill.name}
                                            </div>
                                            <div className="text-xs text-base-content/60">
                                                {sets}x{reps} &middot;{" "}
                                                {drill.duration_minutes}min
                                                <span
                                                    className={`badge badge-xs ml-2 ${
                                                        DIFFICULTY_COLORS[drill.difficulty] ||
                                                        "badge-ghost"
                                                    }`}
                                                >
                                                    {drill.difficulty}
                                                </span>
                                            </div>
                                            {dd.notes && (
                                                <div className="text-xs text-info mt-1">
                                                    {dd.notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {!completed && (
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => setCompletingDrill(dd)}
                                        >
                                            Complete
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {completingDrill && (
                <DrillCompletionModal
                    drillId={completingDrill.drill_id}
                    drillName={completingDrill.drills.name}
                    programDayId={day.id}
                    onComplete={() => {
                        setCompletingDrill(null);
                        onDrillCompleted();
                    }}
                    onClose={() => setCompletingDrill(null)}
                />
            )}
        </>
    );
}
