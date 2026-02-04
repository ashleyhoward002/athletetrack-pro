"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { GenAILiveClient } from "@/lib/live-api/genai-live-client";
import AudioRecordingWorklet from "@/lib/live-api/worklets/audio-processing";

type CameraStatus = "requesting" | "ready" | "denied" | "error";

interface WebcamPreviewProps {
    client: GenAILiveClient;
    isActive: boolean;
    mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
    recordedChunksRef: React.MutableRefObject<Blob[]>;
    onStreamReady?: (stream: MediaStream) => void;
    onCameraStatusChange?: (status: CameraStatus) => void;
}

export default function WebcamPreview({
    client,
    isActive,
    mediaRecorderRef,
    recordedChunksRef,
    onStreamReady,
    onCameraStatusChange,
}: WebcamPreviewProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioWorkletRef = useRef<AudioWorkletNode | null>(null);
    const [cameraStatus, setCameraStatus] = useState<CameraStatus>("requesting");

    const updateStatus = useCallback((status: CameraStatus) => {
        setCameraStatus(status);
        onCameraStatusChange?.(status);
    }, [onCameraStatusChange]);

    // Request webcam access
    const startWebcam = useCallback(async () => {
        updateStatus("requesting");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: "user" },
                audio: true,
            });
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            updateStatus("ready");
            onStreamReady?.(stream);
        } catch (err: any) {
            console.error("Failed to access webcam:", err);
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                updateStatus("denied");
            } else {
                updateStatus("error");
            }
        }
    }, [onStreamReady, updateStatus]);

    // Set up audio streaming to Gemini Live API (mic -> AudioWorklet -> base64 PCM -> sendRealtimeInput)
    const startAudioStreaming = useCallback(async () => {
        if (!streamRef.current || !client.session) return;

        try {
            const audioCtx = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = audioCtx;

            const source = audioCtx.createMediaStreamSource(streamRef.current);

            // Register the audio recording worklet
            const workletBlob = new Blob([AudioRecordingWorklet], { type: "application/javascript" });
            const workletUrl = URL.createObjectURL(workletBlob);
            await audioCtx.audioWorklet.addModule(workletUrl);
            URL.revokeObjectURL(workletUrl);

            const workletNode = new AudioWorkletNode(audioCtx, "AudioProcessingWorklet");
            audioWorkletRef.current = workletNode;

            workletNode.port.onmessage = (ev) => {
                if (ev.data?.event === "chunk" && ev.data.data?.int16arrayBuffer) {
                    const buffer = ev.data.data.int16arrayBuffer as ArrayBuffer;
                    // Convert ArrayBuffer to base64
                    const bytes = new Uint8Array(buffer);
                    let binary = "";
                    for (let i = 0; i < bytes.byteLength; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    const base64 = btoa(binary);

                    if (client.session) {
                        client.sendRealtimeInput([
                            { mimeType: "audio/pcm;rate=16000", data: base64 },
                        ]);
                    }
                }
            };

            source.connect(workletNode);
            workletNode.connect(audioCtx.destination); // needed for worklet to process
        } catch (err) {
            console.error("Failed to set up audio streaming:", err);
        }
    }, [client]);

    const stopAudioStreaming = useCallback(() => {
        if (audioWorkletRef.current) {
            audioWorkletRef.current.disconnect();
            audioWorkletRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    }, []);

    // Capture video frames and send to Gemini Live API
    const startFrameCapture = useCallback(() => {
        if (frameIntervalRef.current) return;

        frameIntervalRef.current = setInterval(() => {
            if (!videoRef.current || !canvasRef.current || !client.session) return;

            const canvas = canvasRef.current;
            const video = videoRef.current;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            canvas.width = 640;
            canvas.height = 480;
            ctx.drawImage(video, 0, 0, 640, 480);

            const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
            const base64 = dataUrl.split(",")[1];

            if (base64) {
                client.sendRealtimeInput([
                    { mimeType: "image/jpeg", data: base64 },
                ]);
            }
        }, 1000); // 1 FPS for form analysis
    }, [client]);

    const stopFrameCapture = useCallback(() => {
        if (frameIntervalRef.current) {
            clearInterval(frameIntervalRef.current);
            frameIntervalRef.current = null;
        }
    }, []);

    // Start MediaRecorder for session recording
    const startRecording = useCallback(() => {
        if (!streamRef.current) return;

        recordedChunksRef.current = [];

        const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
            ? "video/webm;codecs=vp9,opus"
            : "video/webm";

        const recorder = new MediaRecorder(streamRef.current, { mimeType });

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                recordedChunksRef.current.push(e.data);
            }
        };

        recorder.start(1000); // 1-second chunks
        mediaRecorderRef.current = recorder;
    }, [mediaRecorderRef, recordedChunksRef]);

    // Start webcam on mount
    useEffect(() => {
        startWebcam();

        return () => {
            // Cleanup on unmount
            stopFrameCapture();
            stopAudioStreaming();
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
        };
    }, [startWebcam, stopFrameCapture, stopAudioStreaming]);

    // Start/stop frame capture, audio streaming, and recording based on isActive
    useEffect(() => {
        if (isActive && streamRef.current) {
            startFrameCapture();
            startAudioStreaming();
            startRecording();
        } else {
            stopFrameCapture();
            stopAudioStreaming();
        }
    }, [isActive, startFrameCapture, stopFrameCapture, startAudioStreaming, stopAudioStreaming, startRecording]);

    // Permission denied view
    if (cameraStatus === "denied") {
        return (
            <div className="flex items-center justify-center bg-base-300 rounded-lg p-8" style={{ minHeight: "320px" }}>
                <div className="text-center max-w-md">
                    <div className="text-5xl mb-4">🚫</div>
                    <h3 className="text-lg font-bold mb-2">Camera Access Denied</h3>
                    <p className="text-sm text-base-content/60 mb-4">
                        Live coaching requires access to your camera and microphone. Please allow access in your browser settings and reload the page.
                    </p>
                    <div className="text-xs text-base-content/40 space-y-1">
                        <p><strong>Chrome:</strong> Click the camera icon in the address bar, then &quot;Allow&quot;</p>
                        <p><strong>Firefox:</strong> Click the lock icon in the address bar, then Permissions</p>
                        <p><strong>Safari:</strong> Go to Settings &gt; Websites &gt; Camera</p>
                    </div>
                    <button className="btn btn-primary btn-sm mt-4" onClick={startWebcam}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Generic error view
    if (cameraStatus === "error") {
        return (
            <div className="flex items-center justify-center bg-base-300 rounded-lg p-8" style={{ minHeight: "320px" }}>
                <div className="text-center max-w-md">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h3 className="text-lg font-bold mb-2">Camera Not Available</h3>
                    <p className="text-sm text-base-content/60 mb-4">
                        Could not access your camera. Make sure no other app is using it and try again.
                    </p>
                    <button className="btn btn-primary btn-sm" onClick={startWebcam}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg bg-black"
                style={{ maxHeight: "480px", objectFit: "contain" }}
            />
            <canvas ref={canvasRef} className="hidden" />
            {cameraStatus === "requesting" && (
                <div className="absolute inset-0 flex items-center justify-center bg-base-300 rounded-lg">
                    <div className="text-center">
                        <span className="loading loading-spinner loading-lg" />
                        <p className="mt-2 text-sm text-base-content/60">Requesting camera access...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
