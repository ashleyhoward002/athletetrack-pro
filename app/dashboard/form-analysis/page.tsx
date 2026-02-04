"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SportId, getSportConfig } from "@/lib/sports/config";
import toast from "react-hot-toast";
import SportAnalysisSelector from "@/components/form-analysis/SportAnalysisSelector";
import AnalysisHistoryGrid from "@/components/form-analysis/AnalysisHistoryGrid";
import ScoreProgressChart from "@/components/form-analysis/ScoreProgressChart";

export default function FormAnalysisPage() {
    const [analyses, setAnalyses] = useState<any[]>([]);
    const [sport, setSport] = useState<SportId>("basketball");
    const [analysisType, setAnalysisType] = useState("");
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const config = getSportConfig(sport);

    useEffect(() => {
        if (config.formAnalysisTypes.length > 0) {
            setAnalysisType(config.formAnalysisTypes[0].key);
        }
    }, [sport]);

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

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error("Please select a video file");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("video", selectedFile);
            formData.append("sport", sport);
            formData.append("analysis_type", analysisType);

            const res = await fetch("/api/form-analysis", {
                method: "POST",
                body: formData,
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
                        <h1 className="text-3xl font-extrabold">Form Analysis</h1>
                        <p className="text-base-content/60">
                            Upload videos of your technique and get AI-powered feedback on your form.
                        </p>
                    </div>
                </div>

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
                        <h3 className="card-title">Upload Video for Analysis</h3>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <SportAnalysisSelector
                                    sport={sport}
                                    onSportChange={setSport}
                                    analysisType={analysisType}
                                    onAnalysisTypeChange={setAnalysisType}
                                />
                                <div className="form-control">
                                    <label className="label"><span className="label-text">Video File</span></label>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="file-input file-input-bordered"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    />
                                </div>
                            </div>

                            {selectedFile && (
                                <p className="text-sm text-base-content/60">
                                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)}MB)
                                </p>
                            )}

                            <button
                                type="submit"
                                className={`btn btn-primary ${uploading ? "loading" : ""}`}
                                disabled={uploading || !selectedFile}
                            >
                                {uploading ? "Analyzing... (this may take a moment)" : "Upload & Analyze"}
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
                    <AnalysisHistoryGrid analyses={analyses} loading={loading} />
                </div>
            </div>
        </main>
    );
}
