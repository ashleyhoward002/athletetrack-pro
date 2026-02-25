"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { VideoUpload, VideoStatus } from "@/types/video";
import config from "@/config";

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoUpload[]>([]);
  const [athletes, setAthletes] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("all");

  const supabase = createClient();
  const colors = config.brandColors;

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Fetch athletes
    const { data: athleteData } = await supabase
      .from("athletes")
      .select("id, name")
      .order("name");

    if (athleteData) {
      setAthletes(athleteData);
    }

    // Fetch videos
    let query = supabase
      .from("video_uploads")
      .select("*, athletes(id, name)")
      .order("created_at", { ascending: false });

    if (selectedAthleteId !== "all") {
      query = query.eq("athlete_id", selectedAthleteId);
    }

    const { data: videoData, error } = await query;

    if (!error && videoData) {
      setVideos(videoData as VideoUpload[]);
    }

    setLoading(false);
  }, [supabase, selectedAthleteId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusBadge = (status: VideoStatus) => {
    const badges = {
      uploading: {
        bg: "#fef3c7",
        text: "#d97706",
        label: "Uploading",
      },
      processing: {
        bg: "#dbeafe",
        text: "#2563eb",
        label: "Processing",
      },
      analyzed: {
        bg: "#d1fae5",
        text: "#059669",
        label: "Analyzed",
      },
      failed: {
        bg: "#fee2e2",
        text: "#dc2626",
        label: "Failed",
      },
    };

    const badge = badges[status];
    return (
      <span
        className="px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ backgroundColor: badge.bg, color: badge.text }}
      >
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: "#f8fafc" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Videos</h1>
            <p className="text-slate-600 mt-1">
              Upload game footage and get AI-powered analysis
            </p>
          </div>
          <Link
            href="/dashboard/upload"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: colors.electricOrange }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Upload Video
          </Link>
        </div>

        {/* Filter */}
        {athletes.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700">
                Filter by Athlete:
              </label>
              <select
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Athletes</option>
                {athletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${colors.teal}15` }}
            >
              <svg
                className="w-10 h-10"
                style={{ color: colors.teal }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No videos yet
            </h3>
            <p className="text-slate-600 mb-6 max-w-sm mx-auto">
              Film your kid, upload the clip, and let AI do the rest. Get instant
              analysis, coaching tips, and highlight reels.
            </p>
            <Link
              href="/dashboard/upload"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: colors.electricOrange }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Upload Your First Video
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <Link
                key={video.id}
                href={`/dashboard/videos/${video.id}`}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-900">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title || "Video thumbnail"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs font-medium rounded">
                    {formatDuration(video.duration_seconds)}
                  </div>

                  {/* Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/30">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-slate-800 ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Processing Overlay */}
                  {(video.status === "uploading" || video.status === "processing") && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                      <div className="text-center">
                        <svg
                          className="animate-spin w-8 h-8 mx-auto mb-2"
                          style={{ color: colors.teal }}
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <p className="text-white text-sm">
                          {video.status === "processing" ? "Analyzing..." : "Uploading..."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-slate-800 line-clamp-1">
                      {video.title || video.original_filename || "Untitled Video"}
                    </h3>
                    {getStatusBadge(video.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {video.athletes?.name || "Unknown"}
                    </span>
                    <span>•</span>
                    <span>{formatDate(video.created_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
