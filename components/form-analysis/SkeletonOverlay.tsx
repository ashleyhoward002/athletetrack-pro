"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
    SkeletonFrame,
    SkeletonJoint,
    SKELETON_CONNECTIONS,
    getJointColor,
    getConnectionColor,
    JointName,
} from "@/lib/skeleton/types";
import {
    calculateJointAngle,
    evaluateAngle,
} from "@/lib/skeleton/angles";
import { SPORTS_ANGLE_DEFINITIONS } from "@/lib/skeleton/prompts";

interface SkeletonOverlayProps {
    frames: SkeletonFrame[];
    currentTime: number;
    videoWidth: number;
    videoHeight: number;
    sport?: string;
    showAngles?: boolean;
    showJointLabels?: boolean;
    jointRadius?: number;
    lineWidth?: number;
    opacity?: number;
}

export default function SkeletonOverlay({
    frames,
    currentTime,
    videoWidth,
    videoHeight,
    sport = "basketball",
    showAngles = true,
    showJointLabels = false,
    jointRadius = 6,
    lineWidth = 3,
    opacity = 0.9,
}: SkeletonOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [currentFrame, setCurrentFrame] = useState<SkeletonFrame | null>(null);

    // Find the closest frame to the current video time
    useEffect(() => {
        if (!frames || frames.length === 0) {
            setCurrentFrame(null);
            return;
        }

        // Find frame with closest timestamp
        let closestFrame = frames[0];
        let minDiff = Math.abs(frames[0].timestamp - currentTime);

        for (const frame of frames) {
            const diff = Math.abs(frame.timestamp - currentTime);
            if (diff < minDiff) {
                minDiff = diff;
                closestFrame = frame;
            }
        }

        // Only use frame if within 0.5 seconds
        if (minDiff <= 0.5) {
            setCurrentFrame(closestFrame);
        } else {
            setCurrentFrame(null);
        }
    }, [frames, currentTime]);

    // Draw the skeleton
    const drawSkeleton = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx || !currentFrame) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const joints = currentFrame.joints;
        const jointMap = new Map<JointName, SkeletonJoint>();
        joints.forEach((j) => jointMap.set(j.name, j));

        ctx.globalAlpha = opacity;

        // Draw connections first (so joints appear on top)
        ctx.lineWidth = lineWidth;
        for (const [joint1Name, joint2Name] of SKELETON_CONNECTIONS) {
            const joint1 = jointMap.get(joint1Name);
            const joint2 = jointMap.get(joint2Name);

            if (joint1?.visible && joint2?.visible) {
                const x1 = joint1.position.x * videoWidth;
                const y1 = joint1.position.y * videoHeight;
                const x2 = joint2.position.x * videoWidth;
                const y2 = joint2.position.y * videoHeight;

                // Draw line with gradient
                const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
                gradient.addColorStop(0, getJointColor(joint1Name));
                gradient.addColorStop(1, getJointColor(joint2Name));

                ctx.strokeStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }

        // Draw joints
        for (const joint of joints) {
            if (!joint.visible) continue;

            const x = joint.position.x * videoWidth;
            const y = joint.position.y * videoHeight;

            // Draw joint circle
            ctx.fillStyle = getJointColor(joint.name);
            ctx.beginPath();
            ctx.arc(x, y, jointRadius, 0, Math.PI * 2);
            ctx.fill();

            // Draw white border
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw label if enabled
            if (showJointLabels) {
                ctx.fillStyle = "white";
                ctx.font = "10px system-ui";
                ctx.textAlign = "center";
                ctx.fillText(joint.name.replace("_", " "), x, y - jointRadius - 4);
            }
        }

        // Draw angle measurements if enabled
        if (showAngles && sport) {
            const angleDefinitions = SPORTS_ANGLE_DEFINITIONS[sport] || [];
            let yOffset = 20;

            for (const def of angleDefinitions) {
                const angle = calculateJointAngle(
                    joints,
                    def.joints[0],
                    def.joints[1],
                    def.joints[2]
                );

                if (angle !== null) {
                    const evaluation = evaluateAngle(angle, def.idealRange);

                    // Draw angle arc at vertex
                    const vertex = jointMap.get(def.joints[1]);
                    if (vertex?.visible) {
                        const vx = vertex.position.x * videoWidth;
                        const vy = vertex.position.y * videoHeight;

                        // Draw angle indicator
                        ctx.strokeStyle =
                            evaluation.status === "good"
                                ? "#22c55e"
                                : evaluation.status === "warning"
                                ? "#eab308"
                                : "#ef4444";
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(vx, vy, jointRadius + 4, 0, Math.PI * 2);
                        ctx.stroke();
                    }

                    // Draw angle text on side panel
                    ctx.fillStyle =
                        evaluation.status === "good"
                            ? "#22c55e"
                            : evaluation.status === "warning"
                            ? "#eab308"
                            : "#ef4444";
                    ctx.font = "bold 12px system-ui";
                    ctx.textAlign = "left";
                    ctx.fillText(
                        `${def.name}: ${angle.toFixed(0)}°`,
                        10,
                        yOffset
                    );
                    yOffset += 18;
                }
            }
        }

        ctx.globalAlpha = 1;
    }, [currentFrame, videoWidth, videoHeight, sport, showAngles, showJointLabels, jointRadius, lineWidth, opacity]);

    // Redraw when frame changes
    useEffect(() => {
        drawSkeleton();
    }, [drawSkeleton]);

    if (!currentFrame) {
        return null;
    }

    return (
        <canvas
            ref={canvasRef}
            width={videoWidth}
            height={videoHeight}
            className="absolute inset-0 pointer-events-none"
            style={{ width: videoWidth, height: videoHeight }}
        />
    );
}

// Skeleton controls component
interface SkeletonControlsProps {
    showSkeleton: boolean;
    onToggleSkeleton: (show: boolean) => void;
    showAngles: boolean;
    onToggleAngles: (show: boolean) => void;
    showLabels: boolean;
    onToggleLabels: (show: boolean) => void;
    opacity: number;
    onOpacityChange: (opacity: number) => void;
}

export function SkeletonControls({
    showSkeleton,
    onToggleSkeleton,
    showAngles,
    onToggleAngles,
    showLabels,
    onToggleLabels,
    opacity,
    onOpacityChange,
}: SkeletonControlsProps) {
    return (
        <div className="flex flex-wrap items-center gap-4 p-3 bg-base-200 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={showSkeleton}
                    onChange={(e) => onToggleSkeleton(e.target.checked)}
                    className="checkbox checkbox-primary checkbox-sm"
                />
                <span className="text-sm font-medium">Show Skeleton</span>
            </label>

            {showSkeleton && (
                <>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showAngles}
                            onChange={(e) => onToggleAngles(e.target.checked)}
                            className="checkbox checkbox-secondary checkbox-sm"
                        />
                        <span className="text-sm">Angles</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showLabels}
                            onChange={(e) => onToggleLabels(e.target.checked)}
                            className="checkbox checkbox-accent checkbox-sm"
                        />
                        <span className="text-sm">Labels</span>
                    </label>

                    <div className="flex items-center gap-2">
                        <span className="text-sm">Opacity:</span>
                        <input
                            type="range"
                            min="0.3"
                            max="1"
                            step="0.1"
                            value={opacity}
                            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                            className="range range-xs range-primary w-20"
                        />
                    </div>
                </>
            )}
        </div>
    );
}

// Angle panel component to show detailed angle measurements
interface AnglePanelProps {
    frame: SkeletonFrame | null;
    sport: string;
}

export function AnglePanel({ frame, sport }: AnglePanelProps) {
    if (!frame) {
        return (
            <div className="p-4 bg-base-200 rounded-lg text-center text-base-content/60">
                No skeleton data for current frame
            </div>
        );
    }

    const angleDefinitions = SPORTS_ANGLE_DEFINITIONS[sport] || [];

    return (
        <div className="p-4 bg-base-200 rounded-lg space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wide text-base-content/70">
                Joint Angles
            </h4>

            {angleDefinitions.map((def) => {
                const angle = calculateJointAngle(
                    frame.joints,
                    def.joints[0],
                    def.joints[1],
                    def.joints[2]
                );

                if (angle === null) {
                    return (
                        <div key={def.name} className="flex items-center justify-between text-sm">
                            <span className="text-base-content/60">{def.name}</span>
                            <span className="text-base-content/40">--</span>
                        </div>
                    );
                }

                const evaluation = evaluateAngle(angle, def.idealRange);
                const statusColor =
                    evaluation.status === "good"
                        ? "text-success"
                        : evaluation.status === "warning"
                        ? "text-warning"
                        : "text-error";

                const progressValue = def.idealRange
                    ? Math.min(100, Math.max(0, ((angle - def.idealRange[0]) / (def.idealRange[1] - def.idealRange[0])) * 100))
                    : 50;

                return (
                    <div key={def.name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{def.name}</span>
                            <span className={`font-bold ${statusColor}`}>
                                {angle.toFixed(0)}°
                            </span>
                        </div>
                        {def.idealRange && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-base-content/50">
                                    {def.idealRange[0]}°
                                </span>
                                <progress
                                    className={`progress w-full h-2 ${
                                        evaluation.status === "good"
                                            ? "progress-success"
                                            : evaluation.status === "warning"
                                            ? "progress-warning"
                                            : "progress-error"
                                    }`}
                                    value={progressValue}
                                    max="100"
                                />
                                <span className="text-xs text-base-content/50">
                                    {def.idealRange[1]}°
                                </span>
                            </div>
                        )}
                        <p className="text-xs text-base-content/50">{def.description}</p>
                    </div>
                );
            })}
        </div>
    );
}
