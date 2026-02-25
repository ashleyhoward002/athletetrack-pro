"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  VideoUpload,
  VideoAnalysis,
  VideoHighlight,
  ShotFormResults,
  HighlightDetectionResults,
} from "@/types/video";
import config from "@/config";
import { toast } from "react-hot-toast";

export default function VideoDetailPage() {
  const params = useParams();
  const videoId = params.id as string;
  const supabase = createClient();
  const colors = config.brandColors;
  const videoRef = useRef<HTMLVideoElement>(null);

  const [video, setVideo] = useState<VideoUpload | null>(null);
  const [analyses, setAnalyses] = useState<VideoAnalysis[]>([]);
  const [highlights, setHighlights] = useState<VideoHighlight[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"analysis" | "highlights" | "tips">(
    "analysis"
  );
  const [currentTime, setCurrentTime] = useState(0);

  const fetchVideo = useCallback(async () => {
    setLoading(true);

    // Fetch video
    const { data: videoData, error: videoError } = await supabase
      .from("video_uploads")
      .select("*, athletes(id, name)")
      .eq("id", videoId)
      .single();

    if (videoError || !videoData) {
      setLoading(false);
      return;
    }

    setVideo(videoData as VideoUpload);

    // Get signed URL for video
    if (videoData.storage_path) {
      const { data } = await supabase.storage
        .from("athlete-videos")
        .createSignedUrl(videoData.storage_path, 3600);

      if (data?.signedUrl) {
        setVideoUrl(data.signedUrl);
      }
    }

    // Fetch analyses
    const { data: analysesData } = await supabase
      .from("video_analyses")
      .select("*")
      .eq("video_id", videoId);

    if (analysesData) {
      setAnalyses(analysesData as VideoAnalysis[]);
    }

    // Fetch highlights
    const { data: highlightsData } = await supabase
      .from("video_highlights")
      .select("*")
      .eq("video_id", videoId)
      .order("start_time_seconds");

    if (highlightsData) {
      setHighlights(highlightsData as VideoHighlight[]);
    }

    setLoading(false);
  }, [videoId, supabase]);

  useEffect(() => {
    fetchVideo();
  }, [fetchVideo]);

  const toggleRecruitingClip = async (highlightId: string, isRecruiting: boolean) => {
    const { error } = await supabase
      .from("video_highlights")
      .update({ is_recruiting_clip: isRecruiting })
      .eq("id", highlightId);

    if (!error) {
      setHighlights((prev) =>
        prev.map((h) =>
          h.id === highlightId ? { ...h, is_recruiting_clip: isRecruiting } : h
        )
      );
      toast.success(
        isRecruiting ? "Added to recruiting profile" : "Removed from recruiting profile"
      );
    }
  };

  const seekToTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const shotFormAnalysis = analyses.find(
    (a) => a.analysis_type === "shot_form"
  )?.results_json as ShotFormResults | undefined;

  const highlightAnalysis = analyses.find(
    (a) => a.analysis_type === "highlight_detection"
  )?.results_json as HighlightDetectionResults | undefined;

  const coachingTips =
    analyses.find((a) => a.analysis_type === "shot_form")?.ai_coaching_tips || "";

  const getScoreColor = (score: number): string => {
    if (score >= 85) return colors.mint;
    if (score >= 70) return colors.teal;
    if (score >= 55) return "#f59e0b";
    return "#ef4444";
  };

  const getHighlightTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      shot_made: "🏀",
      assist: "🎯",
      block: "🖐️",
      steal: "⚡",
      dunk: "🔥",
      custom: "⭐",
    };
    return icons[type] || "⭐";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Video not found</h2>
          <Link
            href="/dashboard/videos"
            className="text-teal-600 hover:underline"
          >
            Back to videos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link
            href="/dashboard/videos"
            className="p-2 -ml-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-slate-800 truncate">
              {video.title || video.original_filename || "Video Analysis"}
            </h1>
            <p className="text-sm text-slate-500">
              {video.athletes?.name} • {formatDate(video.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            <div className="bg-slate-900 rounded-xl overflow-hidden">
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="w-full aspect-video"
                  poster={video.thumbnail_url || undefined}
                  onTimeUpdate={(e) =>
                    setCurrentTime((e.target as HTMLVideoElement).currentTime)
                  }
                />
              ) : (
                <div className="aspect-video flex items-center justify-center">
                  <p className="text-slate-400">Video unavailable</p>
                </div>
              )}
            </div>

            {/* Highlights Timeline */}
            {highlights.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-3">
                  Highlights ({highlights.length})
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {highlights.map((highlight) => (
                    <button
                      key={highlight.id}
                      onClick={() => seekToTime(highlight.start_time_seconds)}
                      className={`flex-shrink-0 p-3 rounded-lg border transition ${
                        currentTime >= highlight.start_time_seconds &&
                        currentTime <= highlight.end_time_seconds
                          ? "border-teal-500 bg-teal-50"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {getHighlightTypeIcon(highlight.highlight_type)}
                        </span>
                        <span className="text-sm font-medium text-slate-700 capitalize">
                          {highlight.highlight_type.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {formatTime(highlight.start_time_seconds)} -{" "}
                        {formatTime(highlight.end_time_seconds)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Analysis Panel */}
          <div className="space-y-4">
            {/* Tabs */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex border-b border-slate-200">
                {(["analysis", "highlights", "tips"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-medium transition ${
                      activeTab === tab
                        ? "text-teal-600 border-b-2 border-teal-600 -mb-px"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {/* Analysis Tab */}
                {activeTab === "analysis" && shotFormAnalysis && (
                  <div className="space-y-4">
                    {/* Overall Score */}
                    <div className="text-center py-4">
                      <div
                        className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-3"
                        style={{
                          backgroundColor: `${getScoreColor(
                            shotFormAnalysis.overall_score
                          )}20`,
                        }}
                      >
                        <span
                          className="text-3xl font-bold"
                          style={{
                            color: getScoreColor(shotFormAnalysis.overall_score),
                          }}
                        >
                          {shotFormAnalysis.overall_score}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">
                        Overall Form Score
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Based on {shotFormAnalysis.shots_analyzed} shots analyzed
                      </p>
                    </div>

                    {/* Metrics */}
                    <div className="space-y-3">
                      {Object.entries(shotFormAnalysis.metrics).map(
                        ([key, metric]) => (
                          <div
                            key={key}
                            className="bg-slate-50 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-slate-700 capitalize">
                                {key.replace("_", " ")}
                              </span>
                              <span
                                className="text-sm font-bold"
                                style={{ color: getScoreColor(metric.score) }}
                              >
                                {metric.score}
                              </span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${metric.score}%`,
                                  backgroundColor: getScoreColor(metric.score),
                                }}
                              />
                            </div>
                            <p className="text-xs text-slate-500">
                              {metric.description}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "analysis" && !shotFormAnalysis && (
                  <div className="text-center py-8">
                    <p className="text-slate-500">
                      No form analysis available for this video.
                    </p>
                  </div>
                )}

                {/* Highlights Tab */}
                {activeTab === "highlights" && (
                  <div className="space-y-3">
                    {highlights.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-slate-500">
                          No highlights detected in this video.
                        </p>
                      </div>
                    ) : (
                      highlights.map((highlight) => (
                        <div
                          key={highlight.id}
                          className="bg-slate-50 rounded-lg p-3"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {getHighlightTypeIcon(highlight.highlight_type)}
                              </span>
                              <div>
                                <p className="text-sm font-medium text-slate-700 capitalize">
                                  {highlight.highlight_type.replace("_", " ")}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {formatTime(highlight.start_time_seconds)} -{" "}
                                  {formatTime(highlight.end_time_seconds)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => seekToTime(highlight.start_time_seconds)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() =>
                                toggleRecruitingClip(
                                  highlight.id,
                                  !highlight.is_recruiting_clip
                                )
                              }
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                                highlight.is_recruiting_clip
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                              }`}
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill={
                                  highlight.is_recruiting_clip
                                    ? "currentColor"
                                    : "none"
                                }
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                />
                              </svg>
                              {highlight.is_recruiting_clip
                                ? "In Recruiting Profile"
                                : "Add to Recruiting"}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tips Tab */}
                {activeTab === "tips" && (
                  <div className="space-y-4">
                    {coachingTips ? (
                      <div className="prose prose-sm max-w-none">
                        {coachingTips.split("\n\n").map((tip, i) => (
                          <div
                            key={i}
                            className="bg-slate-50 rounded-lg p-4 mb-3"
                          >
                            {tip.split("\n").map((line, j) => {
                              if (line.startsWith("**") && line.endsWith("**")) {
                                return null;
                              }
                              if (line.startsWith("**")) {
                                const match = line.match(
                                  /\*\*(.+)\*\*\s*\((.+)\)/
                                );
                                if (match) {
                                  const priority = match[2].toLowerCase();
                                  return (
                                    <div
                                      key={j}
                                      className="flex items-center gap-2 mb-2"
                                    >
                                      <span className="font-semibold text-slate-800">
                                        {match[1]}
                                      </span>
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${
                                          priority.includes("high")
                                            ? "bg-red-100 text-red-700"
                                            : "bg-amber-100 text-amber-700"
                                        }`}
                                      >
                                        {match[2]}
                                      </span>
                                    </div>
                                  );
                                }
                              }
                              if (line.startsWith("Drill:")) {
                                return (
                                  <div
                                    key={j}
                                    className="flex items-center gap-2 mt-2 p-2 bg-teal-50 rounded text-sm"
                                    style={{ color: colors.teal }}
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                      />
                                    </svg>
                                    <span>{line.replace("Drill: ", "")}</span>
                                  </div>
                                );
                              }
                              return (
                                <p key={j} className="text-sm text-slate-600">
                                  {line}
                                </p>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-500">
                          No coaching tips available for this video.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Video Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Video Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Athlete</span>
                  <span className="text-slate-800 font-medium">
                    {video.athletes?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sport</span>
                  <span className="text-slate-800 font-medium capitalize">
                    {video.sport}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration</span>
                  <span className="text-slate-800 font-medium">
                    {video.duration_seconds
                      ? formatTime(video.duration_seconds)
                      : "--:--"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Uploaded</span>
                  <span className="text-slate-800 font-medium">
                    {formatDate(video.created_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source</span>
                  <span className="text-slate-800 font-medium capitalize">
                    {video.source.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
