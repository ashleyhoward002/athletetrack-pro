"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface VideoComparePlayerProps {
    leftVideoUrl: string;
    rightVideoUrl: string;
    leftLabel: string;
    rightLabel: string;
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.5, 2];

export default function VideoComparePlayer({
    leftVideoUrl,
    rightVideoUrl,
    leftLabel,
    rightLabel,
}: VideoComparePlayerProps) {
    const leftVideoRef = useRef<HTMLVideoElement>(null);
    const rightVideoRef = useRef<HTMLVideoElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isSynced, setIsSynced] = useState(true);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [leftProgress, setLeftProgress] = useState(0);
    const [rightProgress, setRightProgress] = useState(0);
    const [leftDuration, setLeftDuration] = useState(0);
    const [rightDuration, setRightDuration] = useState(0);

    // Update playback speed on both videos
    useEffect(() => {
        if (leftVideoRef.current) leftVideoRef.current.playbackRate = playbackSpeed;
        if (rightVideoRef.current) rightVideoRef.current.playbackRate = playbackSpeed;
    }, [playbackSpeed]);

    // Play/Pause handlers
    const handlePlayPause = useCallback(() => {
        const leftVideo = leftVideoRef.current;
        const rightVideo = rightVideoRef.current;

        if (isPlaying) {
            leftVideo?.pause();
            rightVideo?.pause();
        } else {
            leftVideo?.play();
            if (isSynced) rightVideo?.play();
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying, isSynced]);

    // Sync toggle
    const handleSyncToggle = () => {
        setIsSynced(!isSynced);
        if (!isSynced && isPlaying) {
            // When enabling sync while playing, sync the right video to left
            const leftVideo = leftVideoRef.current;
            const rightVideo = rightVideoRef.current;
            if (leftVideo && rightVideo) {
                rightVideo.currentTime = leftVideo.currentTime;
                rightVideo.play();
            }
        }
    };

    // Reset both videos to start
    const handleReset = () => {
        const leftVideo = leftVideoRef.current;
        const rightVideo = rightVideoRef.current;
        if (leftVideo) leftVideo.currentTime = 0;
        if (rightVideo) rightVideo.currentTime = 0;
        setIsPlaying(false);
        leftVideo?.pause();
        rightVideo?.pause();
    };

    // Step frame forward (approximate ~1/30 sec)
    const handleStepForward = () => {
        const leftVideo = leftVideoRef.current;
        const rightVideo = rightVideoRef.current;
        if (leftVideo) leftVideo.currentTime = Math.min(leftVideo.currentTime + 0.033, leftVideo.duration);
        if (isSynced && rightVideo) rightVideo.currentTime = Math.min(rightVideo.currentTime + 0.033, rightVideo.duration);
    };

    // Step frame backward
    const handleStepBackward = () => {
        const leftVideo = leftVideoRef.current;
        const rightVideo = rightVideoRef.current;
        if (leftVideo) leftVideo.currentTime = Math.max(leftVideo.currentTime - 0.033, 0);
        if (isSynced && rightVideo) rightVideo.currentTime = Math.max(rightVideo.currentTime - 0.033, 0);
    };

    // Time update handlers
    const handleLeftTimeUpdate = () => {
        const video = leftVideoRef.current;
        if (video) setLeftProgress(video.currentTime);
    };

    const handleRightTimeUpdate = () => {
        const video = rightVideoRef.current;
        if (video) setRightProgress(video.currentTime);
    };

    // Duration loaded handlers
    const handleLeftLoadedMetadata = () => {
        const video = leftVideoRef.current;
        if (video) setLeftDuration(video.duration);
    };

    const handleRightLoadedMetadata = () => {
        const video = rightVideoRef.current;
        if (video) setRightDuration(video.duration);
    };

    // Seek handler for progress bars
    const handleLeftSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        const leftVideo = leftVideoRef.current;
        const rightVideo = rightVideoRef.current;
        if (leftVideo) leftVideo.currentTime = time;
        if (isSynced && rightVideo) rightVideo.currentTime = time;
    };

    const handleRightSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        const rightVideo = rightVideoRef.current;
        if (rightVideo) rightVideo.currentTime = time;
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
            if (e.target instanceof HTMLInputElement) return;

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
        <div className="space-y-4">
            {/* Video Players */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Video */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="badge badge-lg badge-outline">{leftLabel}</span>
                        <span className="text-sm text-base-content/60 font-mono">
                            {formatTime(leftProgress)} / {formatTime(leftDuration)}
                        </span>
                    </div>
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                        <video
                            ref={leftVideoRef}
                            src={leftVideoUrl}
                            className="w-full h-full object-contain"
                            onTimeUpdate={handleLeftTimeUpdate}
                            onLoadedMetadata={handleLeftLoadedMetadata}
                            onEnded={handleVideoEnded}
                            playsInline
                        />
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={leftDuration || 100}
                        step={0.01}
                        value={leftProgress}
                        onChange={handleLeftSeek}
                        className="range range-xs range-primary w-full"
                    />
                </div>

                {/* Right Video */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="badge badge-lg badge-success">{rightLabel}</span>
                        <span className="text-sm text-base-content/60 font-mono">
                            {formatTime(rightProgress)} / {formatTime(rightDuration)}
                        </span>
                    </div>
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                        <video
                            ref={rightVideoRef}
                            src={rightVideoUrl}
                            className="w-full h-full object-contain"
                            onTimeUpdate={handleRightTimeUpdate}
                            onLoadedMetadata={handleRightLoadedMetadata}
                            onEnded={handleVideoEnded}
                            playsInline
                        />
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={rightDuration || 100}
                        step={0.01}
                        value={rightProgress}
                        onChange={handleRightSeek}
                        className="range range-xs range-success w-full"
                        disabled={isSynced}
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="card bg-base-200">
                <div className="card-body py-4">
                    <div className="flex flex-wrap items-center justify-center gap-3">
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

                        <div className="divider divider-horizontal mx-0"></div>

                        {/* Sync Toggle */}
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isSynced}
                                onChange={handleSyncToggle}
                                className="toggle toggle-primary toggle-sm"
                            />
                            <span className="text-sm font-medium">Sync</span>
                        </label>

                        <div className="divider divider-horizontal mx-0"></div>

                        {/* Speed Controls */}
                        <div className="flex items-center gap-1">
                            <span className="text-sm text-base-content/60 mr-1">Speed:</span>
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

                    {/* Keyboard shortcuts hint */}
                    <p className="text-center text-xs text-base-content/40 mt-2">
                        Keyboard: Space = Play/Pause | ← → = Frame step | R = Reset
                    </p>
                </div>
            </div>
        </div>
    );
}
