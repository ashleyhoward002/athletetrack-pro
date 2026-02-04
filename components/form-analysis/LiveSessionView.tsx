"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { SportId, getSportConfig } from "@/lib/sports/config";
import { useLiveAPIContext } from "@/components/ai/LiveAPIContext";
import { LiveServerContent } from "@google/genai";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import SportAnalysisSelector from "./SportAnalysisSelector";
import WebcamPreview from "./WebcamPreview";
import LiveFeedbackOverlay, { FeedbackEntry } from "./LiveFeedbackOverlay";
import SessionControls from "./SessionControls";
import LiveSessionSummary from "./LiveSessionSummary";
import CameraSetupGuide from "./CameraSetupGuide";

type SessionState = "idle" | "setup" | "active" | "ending" | "saving" | "done";

function buildCoachingPrompt(sport: SportId, analysisType: string): string {
    const config = getSportConfig(sport);
    const typeDef = config.formAnalysisTypes.find((t) => t.key === analysisType);
    if (!typeDef) return "You are a sports coach providing real-time form feedback.";

    // Extract mechanics from the prompt template
    const lines = typeDef.promptTemplate.split("\n");
    const mechanicsLines = lines.filter((l) => /^\d+\./.test(l.trim()));
    const mechanicsText = mechanicsLines.join("\n");

    return `You are a real-time AI ${config.name.toLowerCase()} coach providing live coaching on ${typeDef.label.toLowerCase()}. You are watching a live video feed of an athlete practicing.

Provide short, actionable voice coaching cues as you observe their technique. Focus on:
${mechanicsText}

Rules:
- Keep each piece of feedback to 1-2 sentences
- Be encouraging but specific about what you see
- Address the athlete directly ("Nice follow-through!" or "Try to bend your knees more")
- Call out both good form and needed corrections in real-time
- If the athlete is not visible or not performing, encourage them to get started or adjust their camera`;
}

export default function LiveSessionView() {
    const liveAPI = useLiveAPIContext();

    const [sessionState, setSessionState] = useState<SessionState>("idle");
    const [sport, setSport] = useState<SportId>("basketball");
    const [analysisType, setAnalysisType] = useState("");
    const [feedbackCards, setFeedbackCards] = useState<FeedbackEntry[]>([]);
    const [duration, setDuration] = useState(0);
    const [savedAnalysis, setSavedAnalysis] = useState<{ id: string; score?: number; status: "completed" | "failed" } | null>(null);

    const sessionStartRef = useRef<number>(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const config = getSportConfig(sport);

    // Set initial analysis type
    useEffect(() => {
        if (config.formAnalysisTypes.length > 0 && !analysisType) {
            setAnalysisType(config.formAnalysisTypes[0].key);
        }
    }, [sport, config, analysisType]);

    // Reset analysis type when sport changes
    const handleSportChange = useCallback((newSport: SportId) => {
        setSport(newSport);
        const newConfig = getSportConfig(newSport);
        if (newConfig.formAnalysisTypes.length > 0) {
            setAnalysisType(newConfig.formAnalysisTypes[0].key);
        }
    }, []);

    // Listen for text content from the Gemini Live API
    useEffect(() => {
        if (!liveAPI?.client || sessionState !== "active") return;

        const handleContent = (content: LiveServerContent) => {
            if ("modelTurn" in content && content.modelTurn?.parts) {
                const textParts = content.modelTurn.parts.filter((p) => p.text);
                textParts.forEach((part) => {
                    if (part.text) {
                        setFeedbackCards((prev) => [
                            ...prev,
                            {
                                timestamp: Date.now() - sessionStartRef.current,
                                text: part.text!,
                                type: "coaching",
                            },
                        ]);
                    }
                });
            }
        };

        liveAPI.client.on("content", handleContent);
        return () => {
            liveAPI.client.off("content", handleContent);
        };
    }, [liveAPI?.client, sessionState]);

    // Session timer
    useEffect(() => {
        if (sessionState === "active") {
            timerRef.current = setInterval(() => {
                setDuration(Math.floor((Date.now() - sessionStartRef.current) / 1000));
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [sessionState]);

    const handleStart = useCallback(async () => {
        if (!liveAPI) {
            toast.error("Live API not available. Please wait for initialization.");
            return;
        }

        setSessionState("setup");
        setFeedbackCards([]);
        setDuration(0);
        setSavedAnalysis(null);

        try {
            // Configure the Live API for form coaching
            liveAPI.setConfig({
                responseModalities: ["audio", "text"] as any,
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
                },
                systemInstruction: {
                    parts: [{ text: buildCoachingPrompt(sport, analysisType) }],
                },
            });

            // Small delay to let config propagate
            await new Promise((r) => setTimeout(r, 200));

            await liveAPI.connect();
            sessionStartRef.current = Date.now();
            setSessionState("active");
            toast.success("Live coaching session started!");
        } catch (err) {
            console.error("Failed to start session:", err);
            toast.error("Failed to connect to AI coach. Please try again.");
            setSessionState("idle");
        }
    }, [liveAPI, sport, analysisType]);

    const handleEnd = useCallback(async () => {
        setSessionState("ending");

        // Stop the MediaRecorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }

        // Disconnect from Gemini Live API
        if (liveAPI) {
            await liveAPI.disconnect();
        }

        // Wait for recorder to finalize
        await new Promise((r) => setTimeout(r, 500));

        setSessionState("saving");

        try {
            // Assemble the recorded video
            const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });

            if (blob.size === 0) {
                toast.error("No video data recorded. Session not saved.");
                setSessionState("idle");
                return;
            }

            const sessionDuration = Math.floor((Date.now() - sessionStartRef.current) / 1000);

            // Upload video directly to Supabase Storage from the client
            // (avoids Next.js API route body size limits)
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const timestamp = Date.now();
            const storagePath = `${user.id}/live-${timestamp}.webm`;

            const { error: uploadError } = await supabase.storage
                .from("form-videos")
                .upload(storagePath, blob, { contentType: "video/webm" });

            if (uploadError) throw uploadError;

            // Send only metadata to API route (no large file in request body)
            const res = await fetch("/api/form-analysis/live", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    video_path: storagePath,
                    sport,
                    analysis_type: analysisType,
                    session_duration_seconds: sessionDuration,
                    session_transcript: feedbackCards,
                }),
            });

            if (!res.ok) throw new Error("Failed to save session");

            const data = await res.json();
            setSavedAnalysis({
                id: data.analysis.id,
                score: data.analysis.overall_score,
                status: data.analysis.status,
            });

            setSessionState("done");
            toast.success("Session saved and analyzed!");
        } catch (err) {
            console.error("Failed to save session:", err);
            toast.error("Failed to save session. Please try again.");
            setSessionState("idle");
        }
    }, [liveAPI, sport, analysisType, feedbackCards]);

    // API not ready yet
    if (!liveAPI) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg" />
                    <p className="mt-3 text-base-content/60">Initializing AI coach...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/form-analysis" className="btn btn-circle btn-ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold">Live Coaching Session</h1>
                    <p className="text-base-content/60">
                        Your AI coach will watch your form in real-time and provide voice + text feedback.
                    </p>
                </div>
            </div>

            {/* Sport & Type Selection (only when idle) */}
            {sessionState === "idle" && (
                <div className="card bg-base-200">
                    <div className="card-body">
                        <h3 className="card-title">Choose what to practice</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SportAnalysisSelector
                                sport={sport}
                                onSportChange={handleSportChange}
                                analysisType={analysisType}
                                onAnalysisTypeChange={setAnalysisType}
                            />
                        </div>
                        <p className="text-sm text-base-content/50 mt-2">
                            {config.formAnalysisTypes.find((t) => t.key === analysisType)?.description}
                        </p>
                    </div>
                </div>
            )}

            {/* Camera Setup Guide (only when idle) */}
            {sessionState === "idle" && <CameraSetupGuide />}

            {/* Webcam + Feedback Overlay */}
            {sessionState !== "done" && (
                <div className="relative rounded-lg overflow-hidden bg-black">
                    <WebcamPreview
                        client={liveAPI.client}
                        isActive={sessionState === "active"}
                        mediaRecorderRef={mediaRecorderRef}
                        recordedChunksRef={recordedChunksRef}
                    />
                    {sessionState === "active" && (
                        <LiveFeedbackOverlay feedbackCards={feedbackCards} />
                    )}
                </div>
            )}

            {/* Controls */}
            {sessionState !== "done" && (
                <SessionControls
                    sessionState={sessionState}
                    onStart={handleStart}
                    onEnd={handleEnd}
                    duration={duration}
                    volume={liveAPI.volume}
                    connected={liveAPI.connected}
                />
            )}

            {/* Saving Indicator */}
            {sessionState === "saving" && (
                <div className="card bg-base-200">
                    <div className="card-body items-center text-center">
                        <span className="loading loading-spinner loading-lg" />
                        <p className="mt-2 text-base-content/60">
                            Saving your session and generating analysis summary...
                        </p>
                        <p className="text-xs text-base-content/40">This may take a moment for longer sessions.</p>
                    </div>
                </div>
            )}

            {/* Session Complete Summary */}
            {sessionState === "done" && savedAnalysis && (
                <LiveSessionSummary
                    analysisId={savedAnalysis.id}
                    score={savedAnalysis.score}
                    status={savedAnalysis.status}
                />
            )}

            {/* Feedback Log (visible during active session) */}
            {sessionState === "active" && feedbackCards.length > 0 && (
                <div className="card bg-base-200">
                    <div className="card-body">
                        <h3 className="card-title text-sm">Coaching Log</h3>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                            {feedbackCards.map((entry, i) => (
                                <div key={i} className="flex gap-3 text-xs">
                                    <span className="text-base-content/40 font-mono min-w-[40px]">
                                        {Math.floor(entry.timestamp / 60000)}:{String(Math.floor((entry.timestamp % 60000) / 1000)).padStart(2, "0")}
                                    </span>
                                    <span className="text-base-content/70">{entry.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
