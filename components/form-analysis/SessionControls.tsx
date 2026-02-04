"use client";

type SessionState = "idle" | "setup" | "active" | "ending" | "saving" | "done";

interface SessionControlsProps {
    sessionState: SessionState;
    onStart: () => void;
    onEnd: () => void;
    duration: number; // in seconds
    volume: number;
    connected: boolean;
}

export default function SessionControls({
    sessionState,
    onStart,
    onEnd,
    duration,
    volume,
    connected,
}: SessionControlsProps) {
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${String(s).padStart(2, "0")}`;
    };

    return (
        <div className="flex items-center justify-between gap-4 p-4 bg-base-200 rounded-lg">
            <div className="flex items-center gap-3">
                {/* Session Timer */}
                {sessionState === "active" && (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-error animate-pulse" />
                        <span className="font-mono text-lg font-bold">
                            {formatTime(duration)}
                        </span>
                    </div>
                )}

                {/* Connection Status */}
                {sessionState === "active" && (
                    <span className={`badge badge-sm ${connected ? "badge-success" : "badge-error"}`}>
                        {connected ? "Connected" : "Disconnected"}
                    </span>
                )}
            </div>

            {/* Volume Meter */}
            {sessionState === "active" && (
                <div className="flex-1 max-w-xs">
                    <div className="w-full bg-base-300 rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-100"
                            style={{ width: `${Math.min(volume * 100, 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div>
                {sessionState === "idle" || sessionState === "setup" ? (
                    <button
                        className="btn btn-primary"
                        onClick={onStart}
                        disabled={sessionState === "setup"}
                    >
                        {sessionState === "setup" ? (
                            <>
                                <span className="loading loading-spinner loading-sm" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Start Session
                            </>
                        )}
                    </button>
                ) : sessionState === "active" ? (
                    <button className="btn btn-error" onClick={onEnd}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                        End Session
                    </button>
                ) : sessionState === "ending" || sessionState === "saving" ? (
                    <button className="btn btn-disabled" disabled>
                        <span className="loading loading-spinner loading-sm" />
                        {sessionState === "ending" ? "Stopping..." : "Saving session..."}
                    </button>
                ) : null}
            </div>
        </div>
    );
}
