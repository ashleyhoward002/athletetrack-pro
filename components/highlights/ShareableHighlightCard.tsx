"use client";

import { useRef, useState } from "react";
import { toPng, toJpeg } from "html-to-image";
import toast from "react-hot-toast";
import HighlightCard from "./HighlightCard";
import { HighlightCardData } from "@/lib/highlights";

interface ShareableHighlightCardProps {
    data: HighlightCardData;
    onClose?: () => void;
}

type CardFormat = "square" | "story" | "wide";

export default function ShareableHighlightCard({
    data,
    onClose,
}: ShareableHighlightCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [format, setFormat] = useState<CardFormat>("square");
    const [isExporting, setIsExporting] = useState(false);

    const formatOptions: { id: CardFormat; label: string; desc: string }[] = [
        { id: "square", label: "Square", desc: "1:1 - Instagram Feed" },
        { id: "story", label: "Story", desc: "9:16 - Stories/Reels" },
        { id: "wide", label: "Wide", desc: "1.91:1 - Twitter/Facebook" },
    ];

    const downloadImage = async (imageFormat: "png" | "jpeg" = "png") => {
        if (!cardRef.current) return;

        setIsExporting(true);
        try {
            const dataUrl =
                imageFormat === "png"
                    ? await toPng(cardRef.current, {
                          quality: 1,
                          pixelRatio: 2,
                          backgroundColor: "#000",
                      })
                    : await toJpeg(cardRef.current, {
                          quality: 0.95,
                          pixelRatio: 2,
                          backgroundColor: "#000",
                      });

            const link = document.createElement("a");
            link.download = `${data.athleteName.replace(/\s+/g, "-")}-highlight.${imageFormat}`;
            link.href = dataUrl;
            link.click();

            toast.success("Image downloaded!");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to export image");
        } finally {
            setIsExporting(false);
        }
    };

    const shareImage = async () => {
        if (!cardRef.current) return;

        // Check if Web Share API is supported
        if (!navigator.share || !navigator.canShare) {
            toast.error("Sharing not supported on this device. Try downloading instead.");
            return;
        }

        setIsExporting(true);
        try {
            const dataUrl = await toPng(cardRef.current, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: "#000",
            });

            // Convert data URL to blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], "highlight.png", { type: "image/png" });

            // Check if we can share files
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `${data.athleteName} - Game Highlight`,
                    text: data.type === "career_high"
                        ? `🔥 Career High! Check out ${data.athleteName}'s performance!`
                        : `Check out ${data.athleteName}'s game highlight!`,
                });
                toast.success("Shared successfully!");
            } else {
                // Fallback to just sharing text
                await navigator.share({
                    title: `${data.athleteName} - Game Highlight`,
                    text: `${data.athleteName} put up ${data.stats.map(s => `${s.value} ${s.label}`).join(", ")}! #AthleteTrackPro`,
                });
                toast.success("Shared!");
            }
        } catch (error: any) {
            if (error.name !== "AbortError") {
                console.error("Share failed:", error);
                toast.error("Failed to share");
            }
        } finally {
            setIsExporting(false);
        }
    };

    const copyToClipboard = async () => {
        if (!cardRef.current) return;

        setIsExporting(true);
        try {
            const dataUrl = await toPng(cardRef.current, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: "#000",
            });

            // Convert to blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();

            // Try to copy to clipboard
            await navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob }),
            ]);

            toast.success("Copied to clipboard!");
        } catch (error) {
            console.error("Copy failed:", error);
            toast.error("Failed to copy. Try downloading instead.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-base-100 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-300">
                    <h3 className="text-xl font-bold">Share Highlight</h3>
                    {onClose && (
                        <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                            ✕
                        </button>
                    )}
                </div>

                <div className="p-4 space-y-4">
                    {/* Format Selector */}
                    <div>
                        <label className="label">
                            <span className="label-text font-semibold">Card Format</span>
                        </label>
                        <div className="flex gap-2">
                            {formatOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setFormat(opt.id)}
                                    className={`btn btn-sm flex-1 ${format === opt.id ? "btn-primary" : "btn-ghost"}`}
                                >
                                    <div className="text-center">
                                        <div>{opt.label}</div>
                                        <div className="text-xs opacity-70">{opt.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Card Preview */}
                    <div className="flex justify-center py-4 bg-base-200 rounded-xl overflow-auto">
                        <div className="transform scale-75 origin-center">
                            <HighlightCard ref={cardRef} data={data} format={format} />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => downloadImage("png")}
                            disabled={isExporting}
                            className="btn btn-outline"
                        >
                            {isExporting ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            )}
                            Download PNG
                        </button>

                        <button
                            onClick={copyToClipboard}
                            disabled={isExporting}
                            className="btn btn-outline"
                        >
                            {isExporting ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                            Copy to Clipboard
                        </button>

                        <button
                            onClick={shareImage}
                            disabled={isExporting}
                            className="btn btn-primary col-span-2"
                        >
                            {isExporting ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            )}
                            Share
                        </button>
                    </div>

                    {/* Social tip */}
                    <p className="text-center text-sm text-base-content/50">
                        Perfect for sharing on Instagram, Twitter, or sending to family!
                    </p>
                </div>
            </div>
        </div>
    );
}
