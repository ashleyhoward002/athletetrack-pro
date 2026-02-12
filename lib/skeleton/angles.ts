// Angle calculation utilities for skeleton analysis

import {
    Point2D,
    SkeletonJoint,
    SkeletonFrame,
    JointName,
    AngleMeasurement,
} from "./types";
import { SPORTS_ANGLE_DEFINITIONS } from "./prompts";

/**
 * Calculate the angle between three points (vertex is the middle point)
 * Returns angle in degrees (0-180)
 */
export function calculateAngle(
    pointA: Point2D,
    vertex: Point2D,
    pointC: Point2D
): number {
    // Vector from vertex to A
    const vectorA = {
        x: pointA.x - vertex.x,
        y: pointA.y - vertex.y,
    };

    // Vector from vertex to C
    const vectorC = {
        x: pointC.x - vertex.x,
        y: pointC.y - vertex.y,
    };

    // Dot product
    const dotProduct = vectorA.x * vectorC.x + vectorA.y * vectorC.y;

    // Magnitudes
    const magnitudeA = Math.sqrt(vectorA.x ** 2 + vectorA.y ** 2);
    const magnitudeC = Math.sqrt(vectorC.x ** 2 + vectorC.y ** 2);

    // Avoid division by zero
    if (magnitudeA === 0 || magnitudeC === 0) {
        return 0;
    }

    // Calculate angle using dot product formula
    const cosAngle = Math.max(-1, Math.min(1, dotProduct / (magnitudeA * magnitudeC)));
    const angleRadians = Math.acos(cosAngle);

    // Convert to degrees
    return angleRadians * (180 / Math.PI);
}

/**
 * Get a joint by name from a skeleton frame
 */
export function getJoint(
    joints: SkeletonJoint[],
    name: JointName
): SkeletonJoint | undefined {
    return joints.find((j) => j.name === name);
}

/**
 * Calculate angle between three joints
 */
export function calculateJointAngle(
    joints: SkeletonJoint[],
    joint1Name: JointName,
    vertexName: JointName,
    joint3Name: JointName
): number | null {
    const joint1 = getJoint(joints, joint1Name);
    const vertex = getJoint(joints, vertexName);
    const joint3 = getJoint(joints, joint3Name);

    if (!joint1?.visible || !vertex?.visible || !joint3?.visible) {
        return null;
    }

    return calculateAngle(joint1.position, vertex.position, joint3.position);
}

/**
 * Calculate all angles for a specific sport from a skeleton frame
 */
export function calculateSportsAngles(
    frame: SkeletonFrame,
    sport: string
): AngleMeasurement[] {
    const angleDefinitions = SPORTS_ANGLE_DEFINITIONS[sport] || [];
    const measurements: AngleMeasurement[] = [];

    for (const def of angleDefinitions) {
        const angle = calculateJointAngle(
            frame.joints,
            def.joints[0],
            def.joints[1],
            def.joints[2]
        );

        if (angle !== null) {
            measurements.push({
                name: def.name,
                angle: Math.round(angle * 10) / 10, // Round to 1 decimal
                joints: def.joints,
                timestamp: frame.timestamp,
                frameNumber: frame.frameNumber,
            });
        }
    }

    return measurements;
}

/**
 * Calculate the distance between two points (normalized 0-1)
 */
export function calculateDistance(pointA: Point2D, pointB: Point2D): number {
    return Math.sqrt((pointB.x - pointA.x) ** 2 + (pointB.y - pointA.y) ** 2);
}

/**
 * Calculate body segment lengths for proportion analysis
 */
export function calculateSegmentLengths(joints: SkeletonJoint[]): Record<string, number> {
    const lengths: Record<string, number> = {};

    const segments: [JointName, JointName, string][] = [
        ["left_shoulder", "left_elbow", "left_upper_arm"],
        ["left_elbow", "left_wrist", "left_forearm"],
        ["right_shoulder", "right_elbow", "right_upper_arm"],
        ["right_elbow", "right_wrist", "right_forearm"],
        ["left_hip", "left_knee", "left_thigh"],
        ["left_knee", "left_ankle", "left_shin"],
        ["right_hip", "right_knee", "right_thigh"],
        ["right_knee", "right_ankle", "right_shin"],
        ["left_shoulder", "left_hip", "left_torso"],
        ["right_shoulder", "right_hip", "right_torso"],
        ["left_shoulder", "right_shoulder", "shoulder_width"],
        ["left_hip", "right_hip", "hip_width"],
    ];

    for (const [joint1Name, joint2Name, segmentName] of segments) {
        const joint1 = getJoint(joints, joint1Name);
        const joint2 = getJoint(joints, joint2Name);

        if (joint1?.visible && joint2?.visible) {
            lengths[segmentName] = calculateDistance(joint1.position, joint2.position);
        }
    }

    return lengths;
}

/**
 * Calculate center of mass (simplified using hip midpoint)
 */
export function calculateCenterOfMass(joints: SkeletonJoint[]): Point2D | null {
    const leftHip = getJoint(joints, "left_hip");
    const rightHip = getJoint(joints, "right_hip");

    if (!leftHip?.visible || !rightHip?.visible) {
        return null;
    }

    return {
        x: (leftHip.position.x + rightHip.position.x) / 2,
        y: (leftHip.position.y + rightHip.position.y) / 2,
    };
}

/**
 * Determine if the athlete is in a balanced stance
 * (center of mass roughly between ankles horizontally)
 */
export function isBalanced(joints: SkeletonJoint[], threshold = 0.1): boolean {
    const centerOfMass = calculateCenterOfMass(joints);
    const leftAnkle = getJoint(joints, "left_ankle");
    const rightAnkle = getJoint(joints, "right_ankle");

    if (!centerOfMass || !leftAnkle?.visible || !rightAnkle?.visible) {
        return true; // Assume balanced if we can't determine
    }

    const ankleCenter = (leftAnkle.position.x + rightAnkle.position.x) / 2;
    const ankleSpread = Math.abs(leftAnkle.position.x - rightAnkle.position.x);

    // Check if center of mass is within threshold of ankle center
    const horizontalOffset = Math.abs(centerOfMass.x - ankleCenter);

    return horizontalOffset <= ankleSpread / 2 + threshold;
}

/**
 * Evaluate angle against ideal range
 */
export function evaluateAngle(
    angle: number,
    idealRange?: [number, number]
): { status: "good" | "warning" | "poor"; message: string } {
    if (!idealRange) {
        return { status: "good", message: `${angle.toFixed(0)}°` };
    }

    const [min, max] = idealRange;

    if (angle >= min && angle <= max) {
        return {
            status: "good",
            message: `${angle.toFixed(0)}° (ideal: ${min}-${max}°)`,
        };
    }

    const diff = angle < min ? min - angle : angle - max;

    if (diff <= 15) {
        return {
            status: "warning",
            message: `${angle.toFixed(0)}° (ideal: ${min}-${max}°) - slightly ${angle < min ? "low" : "high"}`,
        };
    }

    return {
        status: "poor",
        message: `${angle.toFixed(0)}° (ideal: ${min}-${max}°) - needs adjustment`,
    };
}

/**
 * Track joint velocity between frames (for power/speed analysis)
 */
export function calculateJointVelocity(
    frame1: SkeletonFrame,
    frame2: SkeletonFrame,
    jointName: JointName
): number | null {
    const joint1 = getJoint(frame1.joints, jointName);
    const joint2 = getJoint(frame2.joints, jointName);

    if (!joint1?.visible || !joint2?.visible) {
        return null;
    }

    const timeDelta = frame2.timestamp - frame1.timestamp;
    if (timeDelta <= 0) return null;

    const distance = calculateDistance(joint1.position, joint2.position);

    // Return velocity in normalized units per second
    return distance / timeDelta;
}

/**
 * Find the frame with maximum joint velocity (e.g., peak hand speed during throw)
 */
export function findPeakVelocityFrame(
    frames: SkeletonFrame[],
    jointName: JointName
): { frameNumber: number; velocity: number } | null {
    let maxVelocity = 0;
    let peakFrame = -1;

    for (let i = 1; i < frames.length; i++) {
        const velocity = calculateJointVelocity(frames[i - 1], frames[i], jointName);
        if (velocity !== null && velocity > maxVelocity) {
            maxVelocity = velocity;
            peakFrame = frames[i].frameNumber;
        }
    }

    if (peakFrame === -1) return null;

    return {
        frameNumber: peakFrame,
        velocity: maxVelocity,
    };
}
