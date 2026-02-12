"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import SkeletonOverlay, { SkeletonControls, AnglePanel } from "./SkeletonOverlay";
import { SkeletonFrame } from "@/lib/skeleton/types";

interface VideoWithSkeletonProps {
    videoUrl: string;
    videoPath?: string; // Storage path for skeleton analysis
    sport?: string;
    className?: string;
    onSkeletonAnalyzed?: (frames: SkeletonFrame[]) => void;
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.5, 2];

export default function VideoWithSkeleton({
    videoUrl,
    videoPath,
    sport = "basketball",
    className = "",
    onSkeletonAnalyzed,
}: VideoWithSkeletonProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Video state
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 360 });

    // Skeleton state
    const [skeletonFrames, setSkeletonFrames] = useState<SkeletonFrame[]>([]);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const [showAngles, setShowAngles] = useState(true);
    const [showLabels, setShowLabels] = useState(false);
    const [skeletonOpacity, setSkeletonOpacity] = useState(0.9);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

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

    // Duration and dimensions loaded handler
    const handleLoadedMetadata = () => {
        const video = videoRef.current;
        if (video) {
            setDuration(video.duration);
            setVideoDimensions({
                width: video.videoWidth,
                height: video.videoHeight,
            });
        }
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

    // Analyze skeleton
    const analyzeForSkeleton = async () => {
        if (!videoPath) {
            setAnalysisError("Video path not available for analysis");
            return;
        }

        setIsAnalyzing(true);
        setAnalysisError(null);

        try {
            const response = await fetch("/api/skeleton-analysis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    video_path: videoPath,
                    sport,
                    mime_type: "video/mp4",
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Analysis failed");
            }

            setSkeletonFrames(data.frames || []);
            onSkeletonAnalyzed?.(data.frames || []);
        } catch (error) {
            console.error("Skeleton analysis error:", error);
            setAnalysisError(error instanceof Error ? error.message : "Analysis failed");
        } finally {
            setIsAnalyzing(false);
        }
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
                case "KeyS":
                    e.preventDefault();
                    setShowSkeleton((s) => !s);
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handlePlayPause]);

    // Get current skeleton frame
    const getCurrentFrame = (): SkeletonFrame | null => {
        if (!skeletonFrames.length) return null;

        let closestFrame = skeletonFrames[0];
        let minDiff = Math.abs(skeletonFrames[0].timestamp - progress);

        for (const frame of skeletonFrames) {
            const diff = Math.abs(frame.timestamp - progress);
            if (diff < minDiff) {
                minDiff = diff;
                closestFrame = frame;
            }
        }

        return minDiff <= 0.5 ? closestFrame : null;
    };

    // Calculate display dimensions (fit container while maintaining aspect ratio)
    const getDisplayDimensions = () => {
        const container = containerRef.current;
        if (!container) return { width: 640, height: 360 };

        const containerWidth = container.clientWidth;
        const maxHeight = 500;

        const videoAspect = videoDimensions.width / videoDimensions.height;
        let displayWidth = containerWidth;
        let displayHeight = containerWidth / videoAspect;

        if (displayHeight > maxHeight) {
            displayHeight = maxHeight;
            displayWidth = maxHeight * videoAspect;
        }

        return { width: displayWidth, height: displayHeight };
    };

    const displayDims = getDisplayDimensions();

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Skeleton Controls */}
            <div className="flex flex-wrap items-center gap-4">
                <SkeletonControls
                    showSkeleton={showSkeleton}
                    onToggleSkeleton={setShowSkeleton}
                    showAngles={showAngles}
                    onToggleAngles={setShowAngles}
                    showLabels={showLabels}
                    onToggleLabels={setShowLabels}
                    opacity={skeletonOpacity}
                    onOpacityChange={setSkeletonOpacity}
                />

                {videoPath && (
                    <button
                        onClick={analyzeForSkeleton}
                        disabled={isAnalyzing}
                        className="btn btn-primary btn-sm"
                    >
                        {isAnalyzing ? (
                            <>
                                <span className="loading loading-spinner loading-xs" />
                                Analyzing...
                            </>
                        ) : skeletonFrames.length > 0 ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Re-analyze Skeleton
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                Analyze Skeleton
                            </>
                        )}
                    </button>
                )}
            </div>

            {analysisError && (
                <div className="alert alert-error text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{analysisError}</span>
                </div>
            )}

            {skeletonFrames.length > 0 && (
                <div className="text-sm text-success">
                    {skeletonFrames.length} skeleton frames detected
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Video Container */}
                <div className="lg:col-span-2">
                    <div
                        ref={containerRef}
                        className="relative bg-black rounded-lg overflow-hidden"
                        style={{ maxWidth: displayDims.width }}
                    >
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            className="w-full object-contain"
                            style={{ maxHeight: 500 }}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onEnded={handleVideoEnded}
                            onClick={handlePlayPause}
                            playsInline
                        />

                        {/* Skeleton Overlay */}
                        {showSkeleton && skeletonFrames.length > 0 && (
                            <SkeletonOverlay
                                frames={skeletonFrames}
                                currentTime={progress}
                                videoWidth={displayDims.width}
                                videoHeight={displayDims.height}
                                sport={sport}
                                showAngles={showAngles}
                                showJointLabels={showLabels}
                                opacity={skeletonOpacity}
                            />
                        )}

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
                    <div className="flex items-center gap-3 mt-3">
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
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
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
                    <p className="text-center text-xs text-base-content/40 mt-2">
                        Space = Play/Pause | S = Toggle Skeleton | ← → = Frame step | R = Reset
                    </p>
                </div>

                {/* Angle Panel */}
                {showSkeleton && skeletonFrames.length > 0 && (
                    <div className="lg:col-span-1">
                        <AnglePanel frame={getCurrentFrame()} sport={sport} />
                    </div>
                )}
            </div>
        </div>
    );
}
