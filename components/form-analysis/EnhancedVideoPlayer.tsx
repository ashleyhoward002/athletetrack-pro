"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface EnhancedVideoPlayerProps {
    videoUrl: string;
    className?: string;
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.5, 2];

export default function EnhancedVideoPlayer({
    videoUrl,
    className = "",
}: EnhancedVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);

    // Update playback speed
    useEffect(() => {
        if (videoRef.current) videoRef.current.playbackRate = playbackSpeed;
    }, [playbackSpeed]);

    // Play/Pause handler
    const handlePlayPause = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    // Reset video
    const handleReset = () => {
        const video = videoRef.current;
        if (video) {
            video.currentTime = 0;
            video.pause();
            setIsPlaying(false);
        }
    };

    // Step frame forward (~1/30 sec)
    const handleStepForward = () => {
        const video = videoRef.current;
        if (video) {
            video.pause();
            setIsPlaying(false);
            video.currentTime = Math.min(video.currentTime + 0.033, video.duration);
        }
    };

    // Step frame backward
    const handleStepBackward = () => {
        const video = videoRef.current;
        if (video) {
            video.pause();
            setIsPlaying(false);
            video.currentTime = Math.max(video.currentTime - 0.033, 0);
        }
    };

    // Time update handler
    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (video) setProgress(video.currentTime);
    };

    // Duration loaded handler
    const handleLoadedMetadata = () => {
        const video = videoRef.current;
        if (video) setDuration(video.duration);
    };

    // Seek handler
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        const video = videoRef.current;
        if (video) video.currentTime = time;
    };

    // Handle video end
    const handleVideoEnded = () => {
        setIsPlaying(false);
    };

    // Format time display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.code) {
                case "Space":
                    e.preventDefault();
                    handlePlayPause();
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    handleStepBackward();
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    handleStepForward();
                    break;
                case "KeyR":
                    e.preventDefault();
                    handleReset();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handlePlayPause]);

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Video Container */}
            <div
                className="relative bg-black rounded-lg overflow-hidden"
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(true)}
            >
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full max-h-[500px] object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleVideoEnded}
                    onClick={handlePlayPause}
                    playsInline
                />

                {/* Play overlay when paused */}
                {!isPlaying && (
                    <div
                        className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
                        onClick={handlePlayPause}
                    >
                        <div className="btn btn-circle btn-lg btn-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Speed indicator */}
                {playbackSpeed !== 1 && (
                    <div className="absolute top-3 right-3 badge badge-primary badge-lg">
                        {playbackSpeed}x
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-base-content/60 min-w-[45px]">
                    {formatTime(progress)}
                </span>
                <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.01}
                    value={progress}
                    onChange={handleSeek}
                    className="range range-sm range-primary flex-1"
                />
                <span className="text-sm font-mono text-base-content/60 min-w-[45px]">
                    {formatTime(duration)}
                </span>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2">
                {/* Frame Step Back */}
                <button
                    onClick={handleStepBackward}
                    className="btn btn-sm btn-ghost"
                    title="Step back (←)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                    </svg>
                </button>

                {/* Play/Pause */}
                <button
                    onClick={handlePlayPause}
                    className="btn btn-primary btn-circle"
                    title="Play/Pause (Space)"
                >
                    {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                </button>

                {/* Frame Step Forward */}
                <button
                    onClick={handleStepForward}
                    className="btn btn-sm btn-ghost"
                    title="Step forward (→)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                    </svg>
                </button>

                {/* Reset */}
                <button
                    onClick={handleReset}
                    className="btn btn-sm btn-ghost"
                    title="Reset (R)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>

                <div className="divider divider-horizontal mx-1"></div>

                {/* Speed Controls */}
                <div className="flex items-center gap-1">
                    <span className="text-xs text-base-content/60 mr-1 hidden sm:inline">Speed:</span>
                    {PLAYBACK_SPEEDS.map((speed) => (
                        <button
                            key={speed}
                            onClick={() => setPlaybackSpeed(speed)}
                            className={`btn btn-xs ${playbackSpeed === speed ? "btn-primary" : "btn-ghost"}`}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>
            </div>

            {/* Keyboard hint */}
            <p className="text-center text-xs text-base-content/40">
                Space = Play/Pause | ← → = Frame step | R = Reset
            </p>
        </div>
    );
}
