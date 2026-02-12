export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSkeletonDetectionPrompt, getSingleFrameSkeletonPrompt } from "@/lib/skeleton/prompts";
import { SkeletonFrame, SkeletonJoint, JOINT_NAMES, JointName } from "@/lib/skeleton/types";

// POST: Analyze video/image for skeleton detection
export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const videoPath = body.video_path as string;
        const sport = body.sport as string || "basketball";
        const mimeType = body.mime_type as string || "video/mp4";
        const isImage = mimeType.startsWith("image/");

        if (!videoPath) {
            return NextResponse.json({ error: "video_path is required" }, { status: 400 });
        }

        // Verify the file belongs to this user
        if (!videoPath.startsWith(`${session.user.id}/`)) {
            return NextResponse.json({ error: "Unauthorized file access" }, { status: 403 });
        }

        // Download from Storage
        const { data: mediaBlob, error: downloadError } = await supabase.storage
            .from("form-videos")
            .download(videoPath);

        if (downloadError || !mediaBlob) {
            return NextResponse.json({ error: "Failed to download media" }, { status: 500 });
        }

        const buffer = Buffer.from(await mediaBlob.arrayBuffer());
        const base64Data = buffer.toString("base64");

        // Call Gemini for skeleton detection
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = isImage
            ? getSingleFrameSkeletonPrompt(sport)
            : getSkeletonDetectionPrompt(sport);

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType,
                    data: base64Data,
                },
            },
        ]);

        const response = result.response;
        const responseText = response.text() || "";
        const cleanText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        let skeletonData;
        try {
            skeletonData = JSON.parse(cleanText);
        } catch (parseError) {
            console.error("Failed to parse skeleton response:", cleanText);
            return NextResponse.json({
                error: "Failed to parse AI response",
                rawResponse: cleanText.substring(0, 500),
            }, { status: 500 });
        }

        // Validate and normalize the response
        let frames: SkeletonFrame[];

        if (isImage) {
            // Single frame response
            frames = [{
                frameNumber: 0,
                timestamp: 0,
                joints: normalizeJoints(skeletonData.joints || []),
            }];
        } else {
            // Multi-frame response
            frames = (skeletonData.frames || []).map((frame: any, index: number) => ({
                frameNumber: frame.frameNumber ?? index,
                timestamp: frame.timestamp ?? index * 0.5,
                joints: normalizeJoints(frame.joints || []),
            }));
        }

        return NextResponse.json({
            frames,
            fps: skeletonData.fps || 30,
            totalFrames: frames.length,
            duration: skeletonData.duration || (frames.length > 0 ? frames[frames.length - 1].timestamp : 0),
            sport,
        });

    } catch (error) {
        console.error("POST /api/skeleton-analysis error:", error);
        return NextResponse.json({
            error: "Skeleton analysis failed",
            details: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}

// Normalize joints to ensure all expected joints are present
function normalizeJoints(joints: any[]): SkeletonJoint[] {
    const jointMap = new Map<string, SkeletonJoint>();

    // Add detected joints
    for (const joint of joints) {
        if (joint.name && joint.position) {
            jointMap.set(joint.name, {
                name: joint.name as JointName,
                position: {
                    x: clamp(joint.position.x ?? 0.5, 0, 1),
                    y: clamp(joint.position.y ?? 0.5, 0, 1),
                    confidence: joint.position.confidence,
                },
                visible: joint.visible !== false,
            });
        }
    }

    // Ensure all joints are present (mark as not visible if missing)
    const normalizedJoints: SkeletonJoint[] = [];
    for (const jointName of JOINT_NAMES) {
        if (jointMap.has(jointName)) {
            normalizedJoints.push(jointMap.get(jointName)!);
        } else {
            normalizedJoints.push({
                name: jointName,
                position: { x: 0.5, y: 0.5 },
                visible: false,
            });
        }
    }

    return normalizedJoints;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
