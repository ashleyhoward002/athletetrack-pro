"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

const AVAILABLE_SPORTS = [
    { id: "basketball", label: "Basketball", emoji: "🏀" },
    { id: "baseball", label: "Baseball", emoji: "⚾" },
    { id: "soccer", label: "Soccer", emoji: "⚽" },
    { id: "football", label: "Football", emoji: "🏈" },
    { id: "tennis", label: "Tennis", emoji: "🎾" },
    { id: "volleyball", label: "Volleyball", emoji: "🏐" },
    { id: "conditioning", label: "Conditioning", emoji: "💪" },
];

export default function DocumentUpload() {
    const supabase = createClient();
    const { role, isAdmin } = useUserRole();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [activeTab, setActiveTab] = useState<"upload" | "video" | "playbook">("upload");
    const [selectedSports, setSelectedSports] = useState<string[]>(["conditioning"]);

    // Video link state
    const [videoUrl, setVideoUrl] = useState("");
    const [videoTitle, setVideoTitle] = useState("");
    const [videoSport, setVideoSport] = useState("basketball");
    const [videoCategory, setVideoCategory] = useState("");
    const [savingVideo, setSavingVideo] = useState(false);

    const toggleSport = (sportId: string) => {
        setSelectedSports(prev =>
            prev.includes(sportId)
                ? prev.filter(s => s !== sportId)
                : [...prev, sportId]
        );
    };

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

            toast.success("Document processed and added to knowledge base!");
            setFile(null);
            // Reset file input
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload document");
        } finally {
            setUploading(false);
        }
    };

    const handleSeedKnowledgeBase = async () => {
        if (selectedSports.length === 0) {
            toast.error("Please select at least one sport");
            return;
        }

        setSeeding(true);
        try {
            const response = await fetch("/api/seed-knowledge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sports: selectedSports }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Seeding failed");
            }

            const data = await response.json();
            toast.success(`Knowledge base loaded! Added ${data.documentsAdded} documents.`);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to seed knowledge base");
        } finally {
            setSeeding(false);
        }
    };

    const extractYouTubeId = (url: string) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
        return match ? match[1] : null;
    };

    const handleSaveVideo = async () => {
        if (!videoUrl || !videoTitle) {
            toast.error("Please enter a title and URL");
            return;
        }

        const youtubeId = extractYouTubeId(videoUrl);

        setSavingVideo(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase.from("training_resources").insert({
                user_id: user.id,
                title: videoTitle,
                url: videoUrl,
                resource_type: "video",
                sport: videoSport,
                category: videoCategory || null,
                thumbnail_url: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null,
            });

            if (error) throw error;

            toast.success("Training video saved!");
            setVideoUrl("");
            setVideoTitle("");
            setVideoCategory("");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to save video");
        } finally {
            setSavingVideo(false);
        }
    };

    const handleSavePlaybook = async () => {
        if (!file) return;

        setUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Upload file to storage
            const fileExt = file.name.split(".").pop();
            const fileName = `${user.id}/${Date.now()}-${file.name}`;

            const { error: uploadError } = await supabase.storage
                .from("playbooks")
                .upload(fileName, file);

            if (uploadError) {
                if (uploadError.message.includes("not found")) {
                    toast.error("Playbook storage not configured");
                    return;
                }
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from("playbooks")
                .getPublicUrl(fileName);

            // Save to training_resources
            const { error } = await supabase.from("training_resources").insert({
                user_id: user.id,
                title: file.name.replace(/\.[^/.]+$/, ""),
                url: publicUrl,
                resource_type: "playbook",
                sport: videoSport,
                is_public: false,
            });

            if (error) throw error;

            // Also process for RAG
            const formData = new FormData();
            formData.append("file", file);
            await fetch("/api/upload", { method: "POST", body: formData });

            toast.success("Playbook uploaded and added to knowledge base!");
            setFile(null);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to upload playbook");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
                <h2 className="card-title flex items-center gap-2">
                    Knowledge Base
                    <span className="badge badge-primary badge-sm">RAG</span>
                </h2>

                {/* Tabs */}
                <div className="tabs tabs-boxed bg-base-300">
                    <button
                        className={`tab ${activeTab === "upload" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("upload")}
                    >
                        Documents
                    </button>
                    <button
                        className={`tab ${activeTab === "video" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("video")}
                    >
                        Videos
                    </button>
                    {(isAdmin || role === "coach") && (
                        <button
                            className={`tab ${activeTab === "playbook" ? "tab-active" : ""}`}
                            onClick={() => setActiveTab("playbook")}
                        >
                            Playbooks
                        </button>
                    )}
                </div>

                {/* Document Upload Tab */}
                {activeTab === "upload" && (
                    <div className="space-y-3">
                        <p className="text-sm opacity-70">
                            Upload training documents to teach the AI coach.
                        </p>

                        <div className="form-control w-full">
                            <input
                                type="file"
                                accept=".txt,.pdf,.md"
                                onChange={handleFileChange}
                                className="file-input file-input-bordered file-input-sm w-full"
                            />
                        </div>

                        <button
                            className="btn btn-primary btn-sm w-full"
                            onClick={handleUpload}
                            disabled={!file || uploading}
                        >
                            {uploading ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                "Upload & Vectorize"
                            )}
                        </button>

                        <div className="divider text-xs opacity-50 my-2">OR LOAD PRE-BUILT GUIDES</div>

                        {/* Sport Selection */}
                        <div className="flex flex-wrap gap-1.5">
                            {AVAILABLE_SPORTS.map((sport) => (
                                <button
                                    key={sport.id}
                                    type="button"
                                    onClick={() => toggleSport(sport.id)}
                                    className={`btn btn-xs ${
                                        selectedSports.includes(sport.id)
                                            ? "btn-primary"
                                            : "btn-ghost border border-base-300"
                                    }`}
                                >
                                    {sport.emoji} {sport.label}
                                </button>
                            ))}
                        </div>

                        <button
                            className="btn btn-success btn-sm w-full"
                            onClick={handleSeedKnowledgeBase}
                            disabled={seeding || selectedSports.length === 0}
                        >
                            {seeding ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Load {selectedSports.length} Guide{selectedSports.length !== 1 ? "s" : ""}
                                </>
                            )}
                        </button>
                        <p className="text-xs text-center opacity-50">
                            Select your sport(s) above, then click to load
                        </p>
                    </div>
                )}

                {/* Video Links Tab */}
                {activeTab === "video" && (
                    <div className="space-y-3">
                        <p className="text-sm opacity-70">
                            Save YouTube training videos for quick reference.
                        </p>

                        <input
                            type="text"
                            placeholder="Video title"
                            value={videoTitle}
                            onChange={(e) => setVideoTitle(e.target.value)}
                            className="input input-bordered input-sm w-full"
                        />

                        <input
                            type="url"
                            placeholder="YouTube URL"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            className="input input-bordered input-sm w-full"
                        />

                        <div className="flex gap-2">
                            <select
                                value={videoSport}
                                onChange={(e) => setVideoSport(e.target.value)}
                                className="select select-bordered select-sm flex-1"
                            >
                                <option value="basketball">Basketball</option>
                                <option value="baseball">Baseball</option>
                                <option value="soccer">Soccer</option>
                                <option value="football">Football</option>
                                <option value="tennis">Tennis</option>
                                <option value="volleyball">Volleyball</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Category (optional)"
                                value={videoCategory}
                                onChange={(e) => setVideoCategory(e.target.value)}
                                className="input input-bordered input-sm flex-1"
                            />
                        </div>

                        {videoUrl && extractYouTubeId(videoUrl) && (
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-base-300">
                                <img
                                    src={`https://img.youtube.com/vi/${extractYouTubeId(videoUrl)}/mqdefault.jpg`}
                                    alt="Video thumbnail"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <button
                            className="btn btn-primary btn-sm w-full"
                            onClick={handleSaveVideo}
                            disabled={!videoUrl || !videoTitle || savingVideo}
                        >
                            {savingVideo ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                "Save Training Video"
                            )}
                        </button>
                    </div>
                )}

                {/* Playbook Tab (Coaches/Admins only) */}
                {activeTab === "playbook" && (isAdmin || role === "coach") && (
                    <div className="space-y-3">
                        <p className="text-sm opacity-70">
                            Upload team playbooks and strategies. These will be private and added to your AI coach's knowledge.
                        </p>

                        <select
                            value={videoSport}
                            onChange={(e) => setVideoSport(e.target.value)}
                            className="select select-bordered select-sm w-full"
                        >
                            <option value="basketball">Basketball</option>
                            <option value="baseball">Baseball</option>
                            <option value="soccer">Soccer</option>
                            <option value="football">Football</option>
                            <option value="tennis">Tennis</option>
                            <option value="volleyball">Volleyball</option>
                        </select>

                        <div className="form-control w-full">
                            <input
                                type="file"
                                accept=".txt,.pdf,.md,.doc,.docx"
                                onChange={handleFileChange}
                                className="file-input file-input-bordered file-input-sm w-full"
                            />
                        </div>

                        <button
                            className="btn btn-primary btn-sm w-full"
                            onClick={handleSavePlaybook}
                            disabled={!file || uploading}
                        >
                            {uploading ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Upload Playbook
                                </>
                            )}
                        </button>

                        <div className="alert alert-info text-xs py-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Playbooks are private and only visible to you.</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
