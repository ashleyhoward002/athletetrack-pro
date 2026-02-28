"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SportId, getSportConfig } from "@/lib/sports/config";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import SportAnalysisSelector from "@/components/form-analysis/SportAnalysisSelector";
import AnalysisHistoryGrid from "@/components/form-analysis/AnalysisHistoryGrid";
import ScoreProgressChart from "@/components/form-analysis/ScoreProgressChart";
import HelpIcon from "@/components/ui/HelpIcon";
import { FeatureGate } from "@/components/FeatureGate";

type VideoSource = "upload" | "youtube";

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

export default function FormAnalysisPage() {
    const [analyses, setAnalyses] = useState<any[]>([]);
    const [sport, setSport] = useState<SportId>("basketball");
    const [analysisType, setAnalysisType] = useState("");
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [videoSource, setVideoSource] = useState<VideoSource>("upload");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [youtubeId, setYoutubeId] = useState<string | null>(null);

    const config = getSportConfig(sport);

    // Validate YouTube URL and extract ID
    useEffect(() => {
        if (youtubeUrl) {
            const id = extractYouTubeId(youtubeUrl);
            setYoutubeId(id);
        } else {
            setYoutubeId(null);
        }
    }, [youtubeUrl]);

    useEffect(() => {
        if (config.formAnalysisTypes.length > 0) {
            setAnalysisType(config.formAnalysisTypes[0].key);
        }
    }, [sport]);

    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const fetchAnalyses = async () => {
        try {
            const res = await fetch("/api/form-analysis");
            const data = await res.json();
            setAnalyses(data.analyses || []);
        } catch {
            setAnalyses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalyses();
    }, []);

    const handleDeleteRequest = (id: string) => {
        setDeleteTarget(id);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            const res = await fetch(`/api/form-analysis?id=${deleteTarget}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Delete failed");
            toast.success("Analysis deleted");
            fetchAnalyses();
        } catch {
            toast.error("Failed to delete analysis");
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (videoSource === "upload") {
            if (!selectedFile) {
                toast.error("Please select a video file");
                return;
            }

            if (selectedFile.size > 20 * 1024 * 1024) {
                toast.error("Video must be under 20MB. Try a shorter clip.");
                return;
            }

            setUploading(true);
            try {
                // Upload video directly to Supabase Storage from client
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Not authenticated");

                const timestamp = Date.now();
                const storagePath = `${user.id}/${timestamp}-${selectedFile.name}`;

                const { error: uploadError } = await supabase.storage
                    .from("form-videos")
                    .upload(storagePath, selectedFile, { contentType: selectedFile.type });

                if (uploadError) throw uploadError;

                // Send only metadata to API route
                const res = await fetch("/api/form-analysis", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        video_path: storagePath,
                        video_source: "upload",
                        sport,
                        analysis_type: analysisType,
                        mime_type: selectedFile.type,
                    }),
                });

                if (!res.ok) throw new Error("Upload failed");

                const data = await res.json();
                if (data.analysis?.status === "completed") {
                    toast.success("Analysis complete!");
                } else if (data.analysis?.status === "failed") {
                    toast.error("Analysis failed. Try a shorter video or different format.");
                }

                setSelectedFile(null);
                fetchAnalyses();
            } catch {
                toast.error("Failed to upload and analyze video");
            } finally {
                setUploading(false);
            }
        } else {
            // YouTube URL submission
            if (!youtubeId) {
                toast.error("Please enter a valid YouTube URL");
                return;
            }

            setUploading(true);
            try {
                const res = await fetch("/api/form-analysis", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        video_source: "youtube",
                        youtube_url: youtubeUrl,
                        youtube_video_id: youtubeId,
                        sport,
                        analysis_type: analysisType,
                    }),
                });

                if (!res.ok) throw new Error("Analysis failed");

                const data = await res.json();
                if (data.analysis?.status === "completed") {
                    toast.success("Analysis complete!");
                } else if (data.analysis?.status === "failed") {
                    toast.error("Analysis failed. The video may be too long or unavailable.");
                }

                setYoutubeUrl("");
                setYoutubeId(null);
                fetchAnalyses();
            } catch {
                toast.error("Failed to analyze YouTube video");
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <main className="min-h-screen p-4 md:p-8 pb-24">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="btn btn-circle btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-extrabold">Form Analysis</h1>
                            <HelpIcon section="form" tooltip="Learn how to use form analysis" />
                        </div>
                        <p className="text-base-content/60">
                            Upload videos of your technique and get AI-powered feedback on your form.
                        </p>
                    </div>
                </div>

                <FeatureGate feature="formAnalysis">
                {/* Live Session CTA */}
                <Link href="/dashboard/form-analysis/live">
                    <div className="card bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 hover:border-primary/60 transition-all cursor-pointer">
                        <div className="card-body flex-row items-center gap-4">
                            <div className="text-4xl">🎥</div>
                            <div className="flex-1">
                                <h3 className="card-title">Live Coaching Session</h3>
                                <p className="text-sm text-base-content/60">
                                    Get real-time voice and text feedback from your AI coach while you practice. Uses your webcam to analyze form live.
                                </p>
                            </div>
                            <div className="btn btn-primary">
                                Start Live Session
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Upload Section */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <h3 className="card-title">Analyze Your Form</h3>

                        {/* Source Tabs */}
                        <div className="tabs tabs-boxed mb-4 w-fit">
                            <button
                                type="button"
                                className={`tab ${videoSource === "upload" ? "tab-active" : ""}`}
                                onClick={() => setVideoSource("upload")}
                            >
                                📁 Upload Video
                            </button>
                            <button
                                type="button"
                                className={`tab ${videoSource === "youtube" ? "tab-active" : ""}`}
                                onClick={() => setVideoSource("youtube")}
                            >
                                ▶️ YouTube URL
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <SportAnalysisSelector
                                    sport={sport}
                                    onSportChange={setSport}
                                    analysisType={analysisType}
                                    onAnalysisTypeChange={setAnalysisType}
                                />

                                {videoSource === "upload" ? (
                                    <div className="form-control">
                                        <label className="label"><span className="label-text">Video File</span></label>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            className="file-input file-input-bordered"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                ) : (
                                    <div className="form-control">
                                        <label className="label"><span className="label-text">YouTube URL</span></label>
                                        <input
                                            type="url"
                                            placeholder="https://youtube.com/watch?v=..."
                                            className={`input input-bordered ${youtubeUrl && !youtubeId ? "input-error" : youtubeId ? "input-success" : ""}`}
                                            value={youtubeUrl}
                                            onChange={(e) => setYoutubeUrl(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* File preview */}
                            {videoSource === "upload" && selectedFile && (
                                <p className="text-sm text-base-content/60">
                                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)}MB)
                                </p>
                            )}

                            {/* YouTube preview */}
                            {videoSource === "youtube" && youtubeId && (
                                <div className="bg-base-300 rounded-lg p-4">
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                                            alt="Video thumbnail"
                                            className="w-32 h-20 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-success">Valid YouTube URL</p>
                                            <p className="text-xs text-base-content/60 mt-1">
                                                Video ID: {youtubeId}
                                            </p>
                                            <p className="text-xs text-base-content/50 mt-2">
                                                Note: Skeleton overlay is not available for YouTube videos. AI analysis will still evaluate your form.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {videoSource === "youtube" && youtubeUrl && !youtubeId && (
                                <p className="text-sm text-error">
                                    Invalid YouTube URL. Please use a link like youtube.com/watch?v=... or youtu.be/...
                                </p>
                            )}

                            <button
                                type="submit"
                                className={`btn btn-primary ${uploading ? "loading" : ""}`}
                                disabled={
                                    uploading ||
                                    (videoSource === "upload" && !selectedFile) ||
                                    (videoSource === "youtube" && !youtubeId)
                                }
                            >
                                {uploading
                                    ? "Analyzing... (this may take a moment)"
                                    : videoSource === "upload"
                                        ? "Upload & Analyze"
                                        : "Analyze YouTube Video"
                                }
                            </button>
                        </form>
                    </div>
                </div>

                {/* Score Progress Chart */}
                {!loading && analyses.length >= 2 && (
                    <ScoreProgressChart analyses={analyses} />
                )}

                {/* Analysis History */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold">Analysis History</h2>
                        {analyses.filter((a) => a.status === "completed").length >= 2 && (
                            <Link href="/dashboard/form-analysis/compare" className="btn btn-sm btn-ghost">
                                Compare Analyses
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </Link>
                        )}
                    </div>
                    <AnalysisHistoryGrid analyses={analyses} loading={loading} onDelete={handleDeleteRequest} />
                </div>
                </FeatureGate>
            </div>

            {/* Delete Confirmation Modal */}
            <dialog className={`modal ${deleteTarget ? "modal-open" : ""}`}>
                <div className="modal-box max-w-sm">
                    <h3 className="font-bold text-lg">Delete Analysis</h3>
                    <p className="py-4 text-base-content/70">
                        Are you sure you want to delete this analysis? The video will also be removed. This cannot be undone.
                    </p>
                    <div className="modal-action">
                        <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </button>
                        <button className="btn btn-error" onClick={handleDeleteConfirm}>
                            Delete
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setDeleteTarget(null)}>close</button>
                </form>
            </dialog>
        </main>
    );
}
