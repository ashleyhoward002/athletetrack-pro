"use client";

import { useState } from "react";

interface DrillVideoPlayerProps {
    videoUrl: string;
    className?: string;
    showThumbnailOnly?: boolean;
    onPlay?: () => void;
}

// Extract YouTube video ID from various URL formats
function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\s?]+)/,
        /youtube\.com\/shorts\/([^&\s?]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// Get YouTube thumbnail URL
function getYouTubeThumbnail(videoId: string, quality: "default" | "mq" | "hq" | "maxres" = "mq"): string {
    const qualityMap = {
        default: "default",
        mq: "mqdefault",
        hq: "hqdefault",
        maxres: "maxresdefault",
    };
    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

export function DrillVideoThumbnail({
    videoUrl,
    className = "",
    onClick,
}: {
    videoUrl: string;
    className?: string;
    onClick?: () => void;
}) {
    const youtubeId = extractYouTubeId(videoUrl);

    if (!youtubeId) {
        return null;
    }

    return (
        <div
            className={`relative cursor-pointer group ${className}`}
            onClick={onClick}
        >
            <img
                src={getYouTubeThumbnail(youtubeId, "mq")}
                alt="Video thumbnail"
                className="w-full h-full object-cover rounded-lg"
            />
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors rounded-lg">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

export function DrillVideoEmbed({
    videoUrl,
    className = "",
}: {
    videoUrl: string;
    className?: string;
}) {
    const youtubeId = extractYouTubeId(videoUrl);

    if (!youtubeId) {
        // Fallback for non-YouTube URLs
        return (
            <div className={`bg-base-300 rounded-lg p-4 text-center ${className}`}>
                <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                    Open Video
                </a>
            </div>
        );
    }

    return (
        <div className={`relative w-full aspect-video ${className}`}>
            <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                title="Drill Tutorial Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full rounded-lg"
            />
        </div>
    );
}

export default function DrillVideoPlayer({
    videoUrl,
    className = "",
    showThumbnailOnly = false,
    onPlay,
}: DrillVideoPlayerProps) {
    const [showEmbed, setShowEmbed] = useState(false);
    const youtubeId = extractYouTubeId(videoUrl);

    if (!youtubeId && !videoUrl) {
        return null;
    }

    if (showThumbnailOnly || !showEmbed) {
        return (
            <DrillVideoThumbnail
                videoUrl={videoUrl}
                className={className}
                onClick={() => {
                    setShowEmbed(true);
                    onPlay?.();
                }}
            />
        );
    }

    return <DrillVideoEmbed videoUrl={videoUrl} className={className} />;
}

// Video modal component for full-screen viewing
export function DrillVideoModal({
    videoUrl,
    isOpen,
    onClose,
    title,
}: {
    videoUrl: string;
    isOpen: boolean;
    onClose: () => void;
    title?: string;
}) {
    if (!isOpen) return null;

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-4xl bg-base-100 p-0">
                <div className="flex justify-between items-center p-4 border-b border-base-300">
                    <h3 className="font-bold text-lg">{title || "Tutorial Video"}</h3>
                    <button
                        className="btn btn-sm btn-circle btn-ghost"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                <div className="p-4">
                    <DrillVideoEmbed videoUrl={videoUrl} />
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
}

// Utility export for checking if URL is YouTube
export function isYouTubeUrl(url: string): boolean {
    return extractYouTubeId(url) !== null;
}

export { extractYouTubeId, getYouTubeThumbnail };
