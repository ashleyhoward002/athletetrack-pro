"use client";

import { useState } from "react";
import toast from "react-hot-toast";

const EXAMPLE_CONTENT = `Basketball Shooting Fundamentals

The BEEF Method for Perfect Shooting Form:
- Balance: Feet shoulder-width apart, knees slightly bent
- Eyes: Focus on the back of the rim throughout the shot
- Elbow: Keep shooting elbow under the ball, forming an "L"
- Follow-through: Snap wrist down, fingers pointing at the rim

Common Shooting Mistakes to Avoid:
1. Thumb flicking - Keep guide hand still
2. Fading away - Jump straight up
3. Rushing the shot - Take your time, use proper form
4. Flat arc - Aim for 45-degree arc on release

Practice Drill: Form Shooting
Start 3 feet from basket, focus purely on form. Make 10 in a row before moving back. Use one hand only to develop muscle memory.

Free Throw Routine:
1. Take a deep breath at the line
2. Bounce ball 3 times (or your preferred routine)
3. Find your target (back of rim)
4. Bend knees, set elbow
5. Shoot in one fluid motion
6. Hold follow-through until ball goes through`;

export default function DocumentUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [showExamples, setShowExamples] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            toast.success("Document processed and vectorized!");
            setFile(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload document");
        } finally {
            setUploading(false);
        }
    };

    const handleUploadSample = async () => {
        setUploading(true);
        try {
            const blob = new Blob([EXAMPLE_CONTENT], { type: "text/plain" });
            const sampleFile = new File([blob], "basketball-shooting-guide.txt", { type: "text/plain" });

            const formData = new FormData();
            formData.append("file", sampleFile);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");

            toast.success("Sample knowledge base loaded!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to load sample content");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
                <h2 className="card-title flex items-center gap-2">
                    Knowledge Base Upload
                    <span className="badge badge-primary badge-sm">RAG</span>
                </h2>

                <p className="text-sm opacity-70">
                    Upload training documents to teach the AI coach about specific techniques,
                    drills, or strategies. The AI will use this knowledge to answer questions.
                </p>

                {/* What to Upload */}
                <div className="bg-base-300/50 rounded-lg p-3 text-sm space-y-2">
                    <p className="font-semibold">What can you upload?</p>
                    <ul className="list-disc list-inside text-base-content/70 space-y-1">
                        <li>Training guides & drill instructions</li>
                        <li>Coaching manuals & playbooks</li>
                        <li>Sport-specific technique articles</li>
                        <li>Practice plans & workout routines</li>
                    </ul>
                </div>

                {/* File Upload */}
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Choose a file (.txt, .pdf, .md)</span>
                    </label>
                    <input
                        type="file"
                        accept=".txt,.pdf,.md"
                        onChange={handleFileChange}
                        className="file-input file-input-bordered w-full"
                    />
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                    <button
                        className="btn btn-primary flex-1"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                    >
                        {uploading ? <span className="loading loading-spinner loading-sm"></span> : "Upload & Vectorize"}
                    </button>
                    <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setShowExamples(!showExamples)}
                    >
                        {showExamples ? "Hide" : "Show"} Example
                    </button>
                </div>

                {/* Quick Start Option */}
                <div className="divider text-xs opacity-50">OR</div>

                <button
                    className="btn btn-success btn-sm w-full"
                    onClick={handleUploadSample}
                    disabled={uploading}
                >
                    Load Sample Basketball Guide
                </button>
                <p className="text-xs text-center opacity-50">
                    Adds shooting fundamentals to test the RAG chatbot
                </p>

                {/* Example Content Preview */}
                {showExamples && (
                    <div className="mt-3 p-3 bg-base-300 rounded-lg">
                        <p className="text-xs font-semibold mb-2 opacity-70">Example content format:</p>
                        <pre className="text-xs whitespace-pre-wrap opacity-80 max-h-40 overflow-y-auto">
                            {EXAMPLE_CONTENT.slice(0, 500)}...
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
