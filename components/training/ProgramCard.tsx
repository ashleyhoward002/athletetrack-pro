"use client";

import Link from "next/link";

interface ProgramCardProps {
    program: {
        id: string;
        name: string;
        description: string | null;
        sport: string;
        difficulty: string;
        duration_weeks: number;
        status: string;
        is_ai_generated: boolean;
        total_drills: number;
        completed_drills: number;
        progress: number;
    };
}

const SPORT_ICONS: Record<string, string> = {
    basketball: "🏀",
    baseball: "⚾",
    soccer: "⚽",
};

const DIFFICULTY_COLORS: Record<string, string> = {
    Rookie: "badge-success",
    Pro: "badge-warning",
    "All-Star": "badge-error",
};

const STATUS_COLORS: Record<string, string> = {
    active: "badge-primary",
    paused: "badge-ghost",
    completed: "badge-success",
    archived: "badge-ghost",
};

export default function ProgramCard({ program }: ProgramCardProps) {
    return (
        <Link href={`/dashboard/training/programs/${program.id}`}>
            <div className="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer">
                <div className="card-body p-4">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">
                                {SPORT_ICONS[program.sport] || "🏆"}
                            </span>
                            <div>
                                <h3 className="font-bold text-lg">{program.name}</h3>
                                {program.description && (
                                    <p className="text-sm text-base-content/60 line-clamp-1">
                                        {program.description}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <span className={`badge badge-sm ${DIFFICULTY_COLORS[program.difficulty] || "badge-ghost"}`}>
                                {program.difficulty}
                            </span>
                            <span className={`badge badge-sm ${STATUS_COLORS[program.status] || "badge-ghost"}`}>
                                {program.status}
                            </span>
                        </div>
                    </div>

                    <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                            <span>
                                {program.completed_drills}/{program.total_drills} drills
                            </span>
                            <span className="font-medium">{program.progress}%</span>
                        </div>
                        <progress
                            className="progress progress-primary w-full"
                            value={program.progress}
                            max={100}
                        />
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-xs text-base-content/50">
                        <span>{program.duration_weeks} week{program.duration_weeks > 1 ? "s" : ""}</span>
                        {program.is_ai_generated && (
                            <span className="badge badge-xs badge-info">AI Generated</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
