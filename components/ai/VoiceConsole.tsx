"use client";

import { useLiveAPIContext } from "./LiveAPIContext";
import { useEffect, useRef } from "react";

export default function VoiceConsole() {
    const liveAPI = useLiveAPIContext();
    const videoRef = useRef<HTMLVideoElement>(null);

    const connected = liveAPI?.connected ?? false;
    const connect = liveAPI?.connect;
    const disconnect = liveAPI?.disconnect;
    const volume = liveAPI?.volume ?? 0;

    useEffect(() => {
        // Basic visualization of volume
        if (videoRef.current) {
            // Can be used for video preview if implemented
        }
    }, []);

    return (
        <div className="card bg-base-200 border-2 border-primary">
            <div className="card-body">
                <h2 className="card-title flex justify-between">
                    <span>🎙️ Live AI Coach</span>
                    {connected ? (
                        <span className="badge badge-success">Live</span>
                    ) : (
                        <span className="badge badge-primary">Ready</span>
                    )}
                </h2>

                <p className="text-sm opacity-70">
                    Talk to your stats assistant in real-time.
                </p>

                <div className="flex flex-col items-center gap-4 my-4">
                    <button
                        className={`btn btn-circle btn-lg ${connected ? "btn-error" : "btn-primary"} shadow-lg`}
                        onClick={connected ? disconnect : connect}
                        disabled={!liveAPI}
                    >
                        {connected ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        )}
                    </button>

                    <div className="w-full bg-base-300 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                        <div
                            className="bg-primary h-2.5 rounded-full transition-all duration-100"
                            style={{ width: `${Math.min(volume * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
