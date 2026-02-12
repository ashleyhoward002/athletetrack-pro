// Gemini prompts for skeleton/pose detection

import { JointName, JOINT_NAMES } from "./types";

/**
 * Generate a prompt for Gemini to detect skeleton joints in a video frame/image
 */
export function getSkeletonDetectionPrompt(sportContext?: string): string {
    const jointList = JOINT_NAMES.join(", ");

    const sportContextNote = sportContext
        ? `\nThis is a ${sportContext} video, so pay special attention to joints relevant to ${sportContext} movements.`
        : "";

    return `You are an expert computer vision system specializing in human pose estimation. Analyze this video and detect the position of body joints for the person performing the athletic movement.

For each KEY FRAME in the video (approximately every 0.5 seconds or at moments of significant movement), provide the normalized (0-1) x,y coordinates for these joints:
${jointList}

Coordinate system:
- x: 0 = left edge, 1 = right edge of frame
- y: 0 = top edge, 1 = bottom edge of frame
- If a joint is not visible or occluded, set visible to false
${sportContextNote}

Respond ONLY with valid JSON in this exact format:
{
  "frames": [
    {
      "frameNumber": 0,
      "timestamp": 0.0,
      "joints": [
        { "name": "nose", "position": { "x": 0.5, "y": 0.2 }, "visible": true },
        { "name": "left_shoulder", "position": { "x": 0.4, "y": 0.35 }, "visible": true },
        ...
      ]
    },
    ...
  ],
  "fps": 30,
  "totalFrames": 10,
  "duration": 5.0
}

Include joints even if estimated. Focus on accuracy for the main athlete in frame. Analyze 5-15 key frames depending on video length.`;
}

/**
 * Generate a prompt for single frame skeleton detection
 */
export function getSingleFrameSkeletonPrompt(sportContext?: string): string {
    const jointList = JOINT_NAMES.join(", ");

    const sportContextNote = sportContext
        ? `\nThis is a ${sportContext} image, so pay special attention to joints relevant to ${sportContext} movements.`
        : "";

    return `Analyze this image and detect the position of body joints for the main person visible.

Detect these joints with normalized (0-1) x,y coordinates:
${jointList}

Coordinate system:
- x: 0 = left edge, 1 = right edge
- y: 0 = top edge, 1 = bottom edge
- Mark visible as false if a joint is not visible
${sportContextNote}

Respond ONLY with valid JSON:
{
  "joints": [
    { "name": "nose", "position": { "x": 0.5, "y": 0.2 }, "visible": true },
    { "name": "left_shoulder", "position": { "x": 0.4, "y": 0.35 }, "visible": true },
    ...
  ]
}

Include all ${JOINT_NAMES.length} joints. Estimate positions even if partially occluded.`;
}

/**
 * Generate a prompt for form analysis with skeleton awareness
 */
export function getFormAnalysisWithSkeletonPrompt(
    basePrompt: string,
    sportContext: string
): string {
    return `${basePrompt}

Additionally, provide the normalized (0-1) x,y coordinates for key body joints at the most important moment (e.g., release point for shooting, impact point for hitting).

Include these joints in your analysis:
- nose, left_shoulder, right_shoulder
- left_elbow, right_elbow, left_wrist, right_wrist
- left_hip, right_hip, left_knee, right_knee
- left_ankle, right_ankle

Add a "skeleton" field to your response with this structure:
{
  "skeleton": {
    "timestamp": 1.5,
    "joints": [
      { "name": "nose", "position": { "x": 0.5, "y": 0.2 }, "visible": true },
      ...
    ]
  }
}`;
}

/**
 * Common angle definitions for sports analysis
 */
export const SPORTS_ANGLE_DEFINITIONS: Record<string, {
    name: string;
    joints: [JointName, JointName, JointName];
    description: string;
    idealRange?: [number, number];
}[]> = {
    basketball: [
        {
            name: "Shooting Elbow",
            joints: ["right_shoulder", "right_elbow", "right_wrist"],
            description: "Elbow angle during shot release",
            idealRange: [90, 110],
        },
        {
            name: "Knee Bend",
            joints: ["right_hip", "right_knee", "right_ankle"],
            description: "Knee flexion during shot preparation",
            idealRange: [100, 140],
        },
        {
            name: "Guide Arm",
            joints: ["left_shoulder", "left_elbow", "left_wrist"],
            description: "Guide hand elbow position",
            idealRange: [70, 100],
        },
    ],
    baseball: [
        {
            name: "Elbow Angle",
            joints: ["right_shoulder", "right_elbow", "right_wrist"],
            description: "Throwing arm elbow angle",
            idealRange: [80, 100],
        },
        {
            name: "Back Knee",
            joints: ["right_hip", "right_knee", "right_ankle"],
            description: "Back leg knee bend",
            idealRange: [130, 160],
        },
        {
            name: "Front Knee",
            joints: ["left_hip", "left_knee", "left_ankle"],
            description: "Front leg knee position at release",
            idealRange: [150, 180],
        },
    ],
    soccer: [
        {
            name: "Kicking Knee",
            joints: ["right_hip", "right_knee", "right_ankle"],
            description: "Kicking leg knee angle at contact",
            idealRange: [140, 170],
        },
        {
            name: "Plant Leg",
            joints: ["left_hip", "left_knee", "left_ankle"],
            description: "Plant leg knee angle",
            idealRange: [150, 175],
        },
        {
            name: "Hip Rotation",
            joints: ["left_hip", "right_hip", "right_knee"],
            description: "Hip opening during kick",
        },
    ],
    football: [
        {
            name: "Throwing Elbow",
            joints: ["right_shoulder", "right_elbow", "right_wrist"],
            description: "Quarterback throwing arm angle",
            idealRange: [85, 105],
        },
        {
            name: "Hip Angle",
            joints: ["right_shoulder", "right_hip", "right_knee"],
            description: "Hip rotation during throw",
            idealRange: [150, 180],
        },
    ],
    tennis: [
        {
            name: "Serve Elbow",
            joints: ["right_shoulder", "right_elbow", "right_wrist"],
            description: "Elbow angle at trophy position",
            idealRange: [80, 110],
        },
        {
            name: "Knee Bend",
            joints: ["right_hip", "right_knee", "right_ankle"],
            description: "Knee flexion during serve",
            idealRange: [110, 140],
        },
        {
            name: "Hip Angle",
            joints: ["left_shoulder", "left_hip", "left_knee"],
            description: "Body coil angle",
        },
    ],
    volleyball: [
        {
            name: "Attack Arm",
            joints: ["right_shoulder", "right_elbow", "right_wrist"],
            description: "Arm swing elbow angle",
            idealRange: [160, 180],
        },
        {
            name: "Approach Knee",
            joints: ["right_hip", "right_knee", "right_ankle"],
            description: "Knee angle before jump",
            idealRange: [100, 130],
        },
    ],
};
