"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import config from "@/config";

export default function VideoUploadCTA() {
  const [recentVideoCount, setRecentVideoCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const colors = config.brandColors;

  useEffect(() => {
    const fetchVideos = async () => {
      const { count } = await supabase
        .from("video_uploads")
        .select("*", { count: "exact", head: true });

      setRecentVideoCount(count || 0);
      setLoading(false);
    };

    fetchVideos();
  }, [supabase]);

  if (loading) {
    return (
      <div className="bg-base-100 rounded-2xl p-6 border border-base-300 animate-pulse">
        <div className="h-24 bg-base-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6 border overflow-hidden relative"
      style={{
        backgroundColor: colors.darkNavy,
        borderColor: "rgba(255,255,255,0.1)",
      }}
    >
      {/* Background gradient accent */}
      <div
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: colors.electricOrange }}
      />

      <div className="relative">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${colors.electricOrange}20` }}
          >
            <svg
              className="w-6 h-6"
              style={{ color: colors.electricOrange }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg mb-1">
              AI Video Analysis
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              {recentVideoCount === 0
                ? "Upload game footage and get instant AI analysis with coaching tips and highlight detection."
                : `You have ${recentVideoCount} video${recentVideoCount === 1 ? "" : "s"}. Upload more to track improvement over time.`}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/upload"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-white transition hover:opacity-90"
                style={{ backgroundColor: colors.electricOrange }}
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
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Upload Video
              </Link>
              {recentVideoCount > 0 && (
                <Link
                  href="/dashboard/videos"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white transition"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  View All Videos
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Features list */}
        <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-white/10">
          {[
            { icon: "🏀", label: "Shot Form Analysis" },
            { icon: "🎬", label: "Auto Highlights" },
            { icon: "💡", label: "AI Coaching Tips" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-2 text-sm text-slate-300"
            >
              <span>{feature.icon}</span>
              <span>{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
