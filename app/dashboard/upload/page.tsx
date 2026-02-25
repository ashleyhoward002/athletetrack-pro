"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useVideoUpload } from "@/hooks/useVideoUpload";
import { toast } from "react-hot-toast";
import config from "@/config";

interface Athlete {
  id: string;
  name: string;
  primary_sport: string;
}

export default function UploadPage() {
  const router = useRouter();
  const supabase = createClient();
  const colors = config.brandColors;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loadingAthletes, setLoadingAthletes] = useState(true);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [gameDate, setGameDate] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const { state, selectFile, startUpload, reset, validateFile } = useVideoUpload();

  // Fetch athletes on mount
  useEffect(() => {
    const fetchAthletes = async () => {
      const { data, error } = await supabase
        .from("athletes")
        .select("id, name, primary_sport")
        .order("name");

      if (!error && data) {
        setAthletes(data);
        if (data.length === 1) {
          setSelectedAthleteId(data[0].id);
        }
      }
      setLoadingAthletes(false);
    };

    fetchAthletes();
  }, [supabase]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      const success = await selectFile(file);
      if (!success) {
        toast.error(state.error || "Invalid file");
      }
    },
    [selectFile, state.error]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedAthleteId) {
      toast.error("Please select an athlete first");
      return;
    }

    if (!state.file) {
      toast.error("Please select a video file");
      return;
    }

    const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId);

    const videoId = await startUpload({
      athleteId: selectedAthleteId,
      title: title || undefined,
      gameDate: gameDate || undefined,
      sport: selectedAthlete?.primary_sport || "basketball",
    });

    if (videoId) {
      toast.success("Video uploaded and analyzed!");
      router.push(`/dashboard/videos/${videoId}`);
    } else {
      toast.error(state.error || "Upload failed");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isUploading =
    state.status === "uploading" ||
    state.status === "processing" ||
    state.status === "generating_thumbnail";

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: "#f8fafc" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/videos"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Videos
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Upload Video</h1>
          <p className="text-slate-600 mt-1">
            Film your athlete's game or practice, and let AI analyze their performance.
          </p>
        </div>

        {/* Athlete Selector */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Athlete <span className="text-red-500">*</span>
          </label>
          {loadingAthletes ? (
            <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          ) : athletes.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-slate-500 text-sm mb-3">
                You need to add an athlete first
              </p>
              <Link
                href="/dashboard/athletes"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: colors.teal }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Athlete
              </Link>
            </div>
          ) : (
            <select
              value={selectedAthleteId}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              disabled={isUploading}
            >
              <option value="">Choose an athlete...</option>
              {athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name} ({athlete.primary_sport})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Video Dropzone */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Video File <span className="text-red-500">*</span>
          </label>

          {!state.file ? (
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragOver
                  ? "border-teal-500 bg-teal-50"
                  : "border-slate-300 hover:border-slate-400"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${colors.teal}15` }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: colors.teal }}
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
              </div>

              <p className="text-slate-700 font-medium mb-1">
                Drag and drop your video here
              </p>
              <p className="text-slate-500 text-sm mb-4">
                or tap to select from your device
              </p>
              <p className="text-slate-400 text-xs">
                MP4, MOV, or WebM • Max 500MB
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {/* Thumbnail Preview */}
              <div className="relative aspect-video bg-slate-900">
                {state.thumbnailUrl ? (
                  <img
                    src={state.thumbnailUrl}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-slate-600"
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

                {/* Processing Overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center">
                    <div className="relative w-16 h-16 mb-4">
                      <svg
                        className="animate-spin w-16 h-16"
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
                          style={{ color: colors.teal }}
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          style={{ color: colors.teal }}
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                    <p className="text-white font-medium mb-1">
                      {state.status === "uploading"
                        ? "Uploading..."
                        : state.status === "processing"
                        ? "Analyzing with AI..."
                        : "Preparing..."}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {state.status === "processing"
                        ? "Detecting highlights & analyzing form"
                        : "Please wait"}
                    </p>
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="p-4 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${colors.teal}15` }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: colors.teal }}
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
                  <div>
                    <p className="font-medium text-slate-800 text-sm truncate max-w-[200px]">
                      {state.file.name}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {formatFileSize(state.file.size)}
                    </p>
                  </div>
                </div>

                {!isUploading && (
                  <button
                    onClick={() => {
                      reset();
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {state.error && (
            <p className="mt-2 text-sm text-red-600">{state.error}</p>
          )}
        </div>

        {/* Optional Fields */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <p className="text-sm font-medium text-slate-700 mb-3">
            Optional Details
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Video Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Practice Session - Shooting Drills"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                disabled={isUploading}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Game/Practice Date
              </label>
              <input
                type="date"
                value={gameDate}
                onChange={(e) => setGameDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                disabled={isUploading}
              />
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedAthleteId || !state.file || isUploading}
          className="w-full py-3 rounded-xl font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor:
              !selectedAthleteId || !state.file || isUploading
                ? "#94a3b8"
                : colors.electricOrange,
          }}
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {state.status === "processing" ? "Analyzing..." : "Uploading..."}
            </span>
          ) : (
            "Upload & Analyze"
          )}
        </button>

        {/* Info */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${colors.teal}15` }}
            >
              <svg
                className="w-4 h-4"
                style={{ color: colors.teal }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-700 font-medium mb-1">
                What happens after upload?
              </p>
              <ul className="text-xs text-slate-500 space-y-1">
                <li>• AI analyzes shooting form and technique</li>
                <li>• Highlights are automatically detected</li>
                <li>• You'll get personalized coaching tips</li>
                <li>• Best clips can be added to recruiting profile</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
