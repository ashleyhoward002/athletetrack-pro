"use client";

export interface GameEvent {
    id: string;
    event_type: string;
    game_clock_seconds: number | null;
    created_at: string;
    is_undone: boolean;
}

interface EventLogProps {
    events: GameEvent[];
    onUndo: () => void;
    canUndo: boolean;
}

const eventLabels: Record<string, { label: string; color: string; points?: number }> = {
    made_2pt: { label: "Made 2-pointer", color: "text-[#00B4D8]", points: 2 },
    made_3pt: { label: "Made 3-pointer", color: "text-[#FF6B35]", points: 3 },
    made_ft: { label: "Made free throw", color: "text-[#10B981]", points: 1 },
    missed_2pt: { label: "Missed 2-pointer", color: "text-gray-500" },
    missed_3pt: { label: "Missed 3-pointer", color: "text-gray-500" },
    missed_ft: { label: "Missed free throw", color: "text-gray-500" },
    rebound_off: { label: "Offensive rebound", color: "text-[#00B4D8]" },
    rebound_def: { label: "Defensive rebound", color: "text-[#00B4D8]" },
    assist: { label: "Assist", color: "text-[#00B4D8]" },
    steal: { label: "Steal", color: "text-[#00B4D8]" },
    block: { label: "Block", color: "text-[#00B4D8]" },
    turnover: { label: "Turnover", color: "text-red-500" },
    foul: { label: "Foul", color: "text-red-500" },
};

function formatTime(seconds: number | null): string {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
}

export default function EventLog({ events, onUndo, canUndo }: EventLogProps) {
    const activeEvents = events.filter((e) => !e.is_undone);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Header with Undo */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Event Log</h3>
                <button
                    type="button"
                    onClick={onUndo}
                    disabled={!canUndo}
                    className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                        transition-colors
                        ${canUndo
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }
                    `}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Undo Last
                </button>
            </div>

            {/* Event List */}
            <div className="max-h-48 overflow-y-auto">
                {activeEvents.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-400 text-sm">
                        Tap buttons above to start tracking plays
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {activeEvents
                            .slice()
                            .reverse()
                            .map((event) => {
                                const info = eventLabels[event.event_type] || {
                                    label: event.event_type,
                                    color: "text-gray-600",
                                };
                                return (
                                    <div
                                        key={event.id}
                                        className="flex items-center gap-3 px-4 py-2.5"
                                    >
                                        <span className="text-xs text-gray-400 font-mono w-12">
                                            {formatTime(event.game_clock_seconds)}
                                        </span>
                                        <span className={`flex-1 text-sm font-medium ${info.color}`}>
                                            {info.label}
                                        </span>
                                        {info.points && (
                                            <span className="text-xs font-semibold text-[#10B981]">
                                                +{info.points} pts
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>

            {/* Summary */}
            {activeEvents.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 rounded-b-xl text-xs text-gray-500 text-center">
                    {activeEvents.length} play{activeEvents.length !== 1 ? "s" : ""} recorded
                </div>
            )}
        </div>
    );
}
