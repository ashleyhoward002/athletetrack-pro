// Skeleton joint definitions and types for pose estimation

export interface Point2D {
    x: number; // 0-1 normalized (percentage of frame width)
    y: number; // 0-1 normalized (percentage of frame height)
    confidence?: number; // 0-1 confidence score
}

export interface SkeletonJoint {
    name: JointName;
    position: Point2D;
    visible: boolean;
}

// Standard pose landmarks (compatible with MediaPipe/OpenPose naming)
export type JointName =
    | "nose"
    | "left_eye"
    | "right_eye"
    | "left_ear"
    | "right_ear"
    | "left_shoulder"
    | "right_shoulder"
    | "left_elbow"
    | "right_elbow"
    | "left_wrist"
    | "right_wrist"
    | "left_hip"
    | "right_hip"
    | "left_knee"
    | "right_knee"
    | "left_ankle"
    | "right_ankle";

export const JOINT_NAMES: JointName[] = [
    "nose",
    "left_eye",
    "right_eye",
    "left_ear",
    "right_ear",
    "left_shoulder",
    "right_shoulder",
    "left_elbow",
    "right_elbow",
    "left_wrist",
    "right_wrist",
    "left_hip",
    "right_hip",
    "left_knee",
    "right_knee",
    "left_ankle",
    "right_ankle",
];

// Connections between joints to draw the skeleton
export const SKELETON_CONNECTIONS: [JointName, JointName][] = [
    // Face
    ["nose", "left_eye"],
    ["nose", "right_eye"],
    ["left_eye", "left_ear"],
    ["right_eye", "right_ear"],
    // Upper body
    ["left_shoulder", "right_shoulder"],
    ["left_shoulder", "left_elbow"],
    ["right_shoulder", "right_elbow"],
    ["left_elbow", "left_wrist"],
    ["right_elbow", "right_wrist"],
    // Torso
    ["left_shoulder", "left_hip"],
    ["right_shoulder", "right_hip"],
    ["left_hip", "right_hip"],
    // Lower body
    ["left_hip", "left_knee"],
    ["right_hip", "right_knee"],
    ["left_knee", "left_ankle"],
    ["right_knee", "right_ankle"],
];

// Color scheme for different body parts
export const JOINT_COLORS: Record<string, string> = {
    face: "#00ff00",      // Green for face
    arm_left: "#ff6b6b",  // Red for left arm
    arm_right: "#4ecdc4", // Teal for right arm
    torso: "#ffe66d",     // Yellow for torso
    leg_left: "#ff6b6b",  // Red for left leg
    leg_right: "#4ecdc4", // Teal for right leg
};

export function getJointColor(joint: JointName): string {
    if (["nose", "left_eye", "right_eye", "left_ear", "right_ear"].includes(joint)) {
        return JOINT_COLORS.face;
    }
    if (["left_shoulder", "left_elbow", "left_wrist"].includes(joint)) {
        return JOINT_COLORS.arm_left;
    }
    if (["right_shoulder", "right_elbow", "right_wrist"].includes(joint)) {
        return JOINT_COLORS.arm_right;
    }
    if (["left_hip", "left_knee", "left_ankle"].includes(joint)) {
        return JOINT_COLORS.leg_left;
    }
    if (["right_hip", "right_knee", "right_ankle"].includes(joint)) {
        return JOINT_COLORS.leg_right;
    }
    return JOINT_COLORS.torso;
}

export function getConnectionColor(joint1: JointName, joint2: JointName): string {
    // Use the color of the "lower" joint in the hierarchy
    const endJoint = joint2;
    return getJointColor(endJoint);
}

// Skeleton frame data (single frame)
export interface SkeletonFrame {
    frameNumber: number;
    timestamp: number; // seconds
    joints: SkeletonJoint[];
}

// Complete skeleton analysis result
export interface SkeletonAnalysis {
    id: string;
    videoUrl: string;
    frames: SkeletonFrame[];
    fps: number;
    totalFrames: number;
    duration: number;
    analyzedAt: string;
}

// Angle measurement result
export interface AngleMeasurement {
    name: string;
    angle: number; // degrees
    joints: [JointName, JointName, JointName]; // vertex is middle joint
    timestamp: number;
    frameNumber: number;
}

// Common sports-specific angles
export interface SportsAngles {
    // Shooting form
    elbowAngle?: number;        // Elbow bend
    kneeAngle?: number;         // Knee bend
    shoulderAngle?: number;     // Arm elevation

    // General posture
    trunkAngle?: number;        // Forward/back lean
    hipAngle?: number;          // Hip flexion

    // Lower body
    ankleAngle?: number;        // Ankle dorsiflexion
}

// Analysis options
export interface SkeletonAnalysisOptions {
    sampleRate?: number;        // Analyze every N frames (default: 5)
    includeAngles?: boolean;    // Calculate key angles
    sportContext?: string;      // Sport for context-specific analysis
}
