"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SPORT_LIST, SportId, getSportConfig } from "@/lib/sports/config";
import toast from "react-hot-toast";

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

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-success";
        if (score >= 60) return "text-warning";
        return "text-error";
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

                {/* Upload Section */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <h3 className="card-title">Upload Video for Analysis</h3>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="form-control">
                                    <label className="label"><span className="label-text">Sport</span></label>
                                    <select
                                        className="select select-bordered"
                                        value={sport}
                                        onChange={(e) => setSport(e.target.value as SportId)}
                                    >
                                        {SPORT_LIST.map((s) => (
                                            <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text">Analysis Type</span></label>
                                    <select
                                        className="select select-bordered"
                                        value={analysisType}
                                        onChange={(e) => setAnalysisType(e.target.value)}
                                    >
                                        {config.formAnalysisTypes.map((t) => (
                                            <option key={t.key} value={t.key}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
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

                {/* Analysis History */}
                <div>
                    <h2 className="text-xl font-bold mb-3">Analysis History</h2>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <span className="loading loading-spinner loading-lg" />
                        </div>
                    ) : analyses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analyses.map((a) => (
                                <Link key={a.id} href={`/dashboard/form-analysis/${a.id}`}>
                                    <div className="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer">
                                        <div className="card-body p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold">
                                                        {config.formAnalysisTypes.find((t) => t.key === a.analysis_type)?.label || a.analysis_type}
                                                    </h3>
                                                    <p className="text-sm text-base-content/60">
                                                        {new Date(a.created_at).toLocaleDateString()} &middot;{" "}
                                                        <span className="badge badge-xs">{a.sport}</span>
                                                    </p>
                                                </div>
                                                {a.overall_score ? (
                                                    <div className={`text-2xl font-bold ${getScoreColor(a.overall_score)}`}>
                                                        {a.overall_score}
                                                    </div>
                                                ) : (
                                                    <span className={`badge badge-sm ${a.status === "processing" ? "badge-warning" : "badge-error"}`}>
                                                        {a.status}
                                                    </span>
                                                )}
                                            </div>
                                            {a.ai_feedback && (
                                                <div className="mt-2 text-sm">
                                                    <span className="text-success">{a.ai_feedback.strengths?.length || 0} strengths</span>
                                                    {" / "}
                                                    <span className="text-warning">{a.ai_feedback.improvements?.length || 0} areas to improve</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-base-content/50">
                            No analyses yet. Upload your first video above!
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
