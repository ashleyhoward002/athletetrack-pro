"use client";

interface StickyScoreBannerProps {
    athleteName: string;
    opponent: string;
    points: number;
    rebounds: number;
    assists: number;
    timerFormatted: string;
    isTimerRunning: boolean;
    onTimerToggle: () => void;
    flashScore?: boolean;
}

export default function StickyScoreBanner({
    athleteName,
    opponent,
    points,
    rebounds,
    assists,
    timerFormatted,
    isTimerRunning,
    onTimerToggle,
    flashScore = false,
}: StickyScoreBannerProps) {
    return (
        <div
            className={`
                sticky top-0 z-20 rounded-xl shadow-lg
                transition-all duration-300
                ${flashScore ? "ring-4 ring-[#10B981]" : ""}
            `}
            style={{ backgroundColor: "#0F1B2D" }}
        >
            <div className="px-4 py-3">
                {/* Player vs Opponent */}
                <div className="text-center text-white/80 text-sm mb-2">
                    <span className="font-semibold text-white">{athleteName || "Player"}</span>
                    <span className="mx-2">vs</span>
                    <span>{opponent || "Opponent"}</span>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-center gap-6 text-white">
                    <div className="text-center">
                        <div
                            className={`
                                text-4xl font-black transition-transform duration-150
                                ${flashScore ? "scale-110" : "scale-100"}
                            `}
                            style={{ color: "#FF6B35" }}
                        >
                            {points}
                        </div>
                        <div className="text-xs text-white/60 uppercase tracking-wide">PTS</div>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="text-center">
                        <div className="text-2xl font-bold">{rebounds}</div>
                        <div className="text-xs text-white/60 uppercase tracking-wide">REB</div>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="text-center">
                        <div className="text-2xl font-bold">{assists}</div>
                        <div className="text-xs text-white/60 uppercase tracking-wide">AST</div>
                    </div>
                </div>

                {/* Timer */}
                <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-white/10">
                    <span className="text-white/60 text-sm">Game Time:</span>
                    <span className="text-white font-mono text-lg font-semibold">
                        {timerFormatted}
                    </span>
                    <button
                        type="button"
                        onClick={onTimerToggle}
                        className={`
                            w-8 h-8 rounded-full flex items-center justify-center
                            transition-colors
                            ${isTimerRunning
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-[#10B981] hover:bg-[#0d9668]"
                            }
                        `}
                        aria-label={isTimerRunning ? "Pause timer" : "Start timer"}
                    >
                        {isTimerRunning ? (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
