"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  VideoUploadState,
  VideoUploadForm,
  UploadProgress,
  ShotFormResults,
  HighlightDetectionResults,
  CoachingTip,
} from "@/types/video";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

interface UseVideoUploadReturn {
  state: VideoUploadState;
  selectFile: (file: File) => Promise<boolean>;
  startUpload: (form: VideoUploadForm) => Promise<string | null>;
  reset: () => void;
  validateFile: (file: File) => { valid: boolean; error?: string };
}

export function useVideoUpload(): UseVideoUploadReturn {
  const [state, setState] = useState<VideoUploadState>({
    file: null,
    athleteId: null,
    status: "idle",
    progress: { loaded: 0, total: 0, percentage: 0 },
    error: null,
    videoId: null,
    thumbnailUrl: null,
  });

  const supabase = createClient();

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return {
          valid: false,
          error: `Invalid file type. Please upload MP4, MOV, or WebM files.`,
        };
      }

      if (file.size > MAX_FILE_SIZE) {
        return {
          valid: false,
          error: `File too large. Maximum size is 500MB.`,
        };
      }

      return { valid: true };
    },
    []
  );

  const generateThumbnail = useCallback(
    async (file: File): Promise<string | null> => {
      return new Promise((resolve) => {
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;

        video.onloadeddata = () => {
          // Seek to 1 second or 10% of the video, whichever is smaller
          video.currentTime = Math.min(1, video.duration * 0.1);
        };

        video.onseeked = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumbnailDataUrl = canvas.toDataURL("image/jpeg", 0.8);
            resolve(thumbnailDataUrl);
          } else {
            resolve(null);
          }

          URL.revokeObjectURL(video.src);
        };

        video.onerror = () => {
          resolve(null);
          URL.revokeObjectURL(video.src);
        };

        video.src = URL.createObjectURL(file);
      });
    },
    []
  );

  const getVideoDuration = useCallback(async (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        resolve(Math.round(video.duration));
        URL.revokeObjectURL(video.src);
      };

      video.onerror = () => {
        resolve(0);
        URL.revokeObjectURL(video.src);
      };

      video.src = URL.createObjectURL(file);
    });
  }, []);

  const selectFile = useCallback(
    async (file: File): Promise<boolean> => {
      const validation = validateFile(file);

      if (!validation.valid) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: validation.error || "Invalid file",
        }));
        return false;
      }

      setState((prev) => ({
        ...prev,
        file,
        status: "generating_thumbnail",
        error: null,
      }));

      const thumbnailUrl = await generateThumbnail(file);

      setState((prev) => ({
        ...prev,
        thumbnailUrl,
        status: "idle",
      }));

      return true;
    },
    [validateFile, generateThumbnail]
  );

  const uploadThumbnail = useCallback(
    async (
      thumbnailDataUrl: string,
      userId: string,
      athleteId: string,
      timestamp: number
    ): Promise<string | null> => {
      try {
        // Convert data URL to blob
        const response = await fetch(thumbnailDataUrl);
        const blob = await response.blob();

        const thumbnailPath = `${userId}/${athleteId}/${timestamp}_thumb.jpg`;

        const { error } = await supabase.storage
          .from("video-thumbnails")
          .upload(thumbnailPath, blob, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (error) {
          console.error("Thumbnail upload error:", error);
          return null;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("video-thumbnails").getPublicUrl(thumbnailPath);

        return publicUrl;
      } catch (err) {
        console.error("Thumbnail upload failed:", err);
        return null;
      }
    },
    [supabase]
  );

  const startUpload = useCallback(
    async (form: VideoUploadForm): Promise<string | null> => {
      if (!state.file) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: "No file selected",
        }));
        return null;
      }

      setState((prev) => ({
        ...prev,
        athleteId: form.athleteId,
        status: "uploading",
        error: null,
      }));

      try {
        // Get user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Not authenticated");
        }

        const timestamp = Date.now();
        const fileExt = state.file.name.split(".").pop() || "mp4";
        const storagePath = `${user.id}/${form.athleteId}/${timestamp}.${fileExt}`;

        // Get video duration
        const duration = await getVideoDuration(state.file);

        // Upload thumbnail first if we have one
        let thumbnailUrl: string | null = null;
        if (state.thumbnailUrl) {
          thumbnailUrl = await uploadThumbnail(
            state.thumbnailUrl,
            user.id,
            form.athleteId,
            timestamp
          );
        }

        // Create video record first with uploading status
        const { data: videoRecord, error: insertError } = await supabase
          .from("video_uploads")
          .insert({
            user_id: user.id,
            athlete_id: form.athleteId,
            storage_path: storagePath,
            thumbnail_url: thumbnailUrl,
            original_filename: state.file.name,
            duration_seconds: duration,
            file_size_bytes: state.file.size,
            status: "uploading",
            source: "phone",
            sport: form.sport || "basketball",
            title: form.title || null,
            description: form.description || null,
            game_date: form.gameDate || null,
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(`Failed to create video record: ${insertError.message}`);
        }

        // Upload video to storage
        const { error: uploadError } = await supabase.storage
          .from("athlete-videos")
          .upload(storagePath, state.file, {
            contentType: state.file.type,
            upsert: false,
          });

        if (uploadError) {
          // Update status to failed
          await supabase
            .from("video_uploads")
            .update({ status: "failed" })
            .eq("id", videoRecord.id);

          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Update status to processing
        await supabase
          .from("video_uploads")
          .update({ status: "processing" })
          .eq("id", videoRecord.id);

        setState((prev) => ({
          ...prev,
          status: "processing",
          videoId: videoRecord.id,
        }));

        // Generate mock analysis (real MediaPipe processing will replace this)
        await generateMockAnalysis(videoRecord.id, form.athleteId, duration);

        // Update status to analyzed
        await supabase
          .from("video_uploads")
          .update({ status: "analyzed" })
          .eq("id", videoRecord.id);

        setState((prev) => ({
          ...prev,
          status: "complete",
        }));

        return videoRecord.id;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";

        setState((prev) => ({
          ...prev,
          status: "error",
          error: errorMessage,
        }));

        return null;
      }
    },
    [state.file, state.thumbnailUrl, supabase, getVideoDuration, uploadThumbnail]
  );

  const generateMockAnalysis = async (
    videoId: string,
    athleteId: string,
    duration: number
  ) => {
    // Generate mock shot form analysis
    const shotFormResults: ShotFormResults = {
      type: "shot_form",
      shots_analyzed: Math.floor(Math.random() * 10) + 3,
      overall_score: Math.floor(Math.random() * 30) + 65, // 65-95
      metrics: {
        elbow_alignment: {
          score: Math.floor(Math.random() * 25) + 70,
          description: "Elbow positioned slightly outside shoulder line",
        },
        follow_through: {
          score: Math.floor(Math.random() * 20) + 75,
          description: "Good extension, could hold finish longer",
        },
        knee_bend: {
          score: Math.floor(Math.random() * 30) + 65,
          description: "Moderate knee bend, try deeper squat for more power",
        },
        release_point: {
          score: Math.floor(Math.random() * 20) + 78,
          description: "Consistent release height, good arc",
        },
        balance: {
          score: Math.floor(Math.random() * 25) + 72,
          description: "Slight lean on landing, work on core stability",
        },
      },
    };

    const coachingTips = generateCoachingTips(shotFormResults);

    // Insert shot form analysis
    await supabase.from("video_analyses").insert({
      video_id: videoId,
      analysis_type: "shot_form",
      results_json: shotFormResults,
      ai_coaching_tips: coachingTips,
      confidence_score: 0.85 + Math.random() * 0.1,
    });

    // Generate mock highlights
    const numHighlights = Math.floor(Math.random() * 4) + 2;
    const highlights: HighlightDetectionResults = {
      type: "highlight_detection",
      total_highlights: numHighlights,
      highlights: [],
    };

    const highlightTypes: Array<
      "shot_made" | "assist" | "block" | "steal" | "dunk"
    > = ["shot_made", "shot_made", "assist", "block", "steal"];

    for (let i = 0; i < numHighlights; i++) {
      const startTime = (duration / (numHighlights + 1)) * (i + 1);
      highlights.highlights.push({
        start_time: startTime,
        end_time: startTime + 5 + Math.random() * 5,
        type: highlightTypes[Math.floor(Math.random() * highlightTypes.length)],
        confidence: 0.7 + Math.random() * 0.25,
        description: `Detected ${highlightTypes[i % highlightTypes.length]} at ${Math.floor(startTime)}s`,
      });
    }

    // Insert highlight detection analysis
    await supabase.from("video_analyses").insert({
      video_id: videoId,
      analysis_type: "highlight_detection",
      results_json: highlights,
      confidence_score: 0.8 + Math.random() * 0.15,
    });

    // Insert individual highlight clips
    for (const h of highlights.highlights) {
      await supabase.from("video_highlights").insert({
        video_id: videoId,
        athlete_id: athleteId,
        start_time_seconds: h.start_time,
        end_time_seconds: h.end_time,
        highlight_type: h.type,
        title: h.description,
        is_recruiting_clip: Math.random() > 0.7,
      });
    }
  };

  const generateCoachingTips = (results: ShotFormResults): string => {
    const tips: CoachingTip[] = [];

    if (results.metrics.elbow_alignment.score < 80) {
      tips.push({
        category: "form",
        title: "Elbow Alignment",
        description:
          "Focus on keeping your elbow directly under the ball and in line with the basket. Practice shooting with your elbow touching a wall to build muscle memory.",
        priority: "high",
        drillSuggestion: "Wall Elbow Drill - 50 reps daily",
      });
    }

    if (results.metrics.knee_bend.score < 75) {
      tips.push({
        category: "strength",
        title: "Leg Power",
        description:
          "Your shot would benefit from a deeper knee bend. This generates more power from your legs and reduces arm fatigue over time.",
        priority: "medium",
        drillSuggestion: "Jump squats - 3 sets of 15",
      });
    }

    if (results.metrics.follow_through.score < 80) {
      tips.push({
        category: "technique",
        title: "Follow Through",
        description:
          "Hold your follow-through position until the ball reaches the rim. Your wrist should be relaxed, fingers pointing down toward the basket.",
        priority: "high",
        drillSuggestion: "One-hand form shooting - 100 makes",
      });
    }

    if (results.metrics.balance.score < 75) {
      tips.push({
        category: "consistency",
        title: "Landing Balance",
        description:
          "Work on landing in the same spot you jumped from. Core stability exercises will help maintain balance through your shot.",
        priority: "medium",
        drillSuggestion: "Single-leg balance holds - 30 seconds each leg",
      });
    }

    // Format tips as readable text
    return tips
      .map(
        (tip) =>
          `**${tip.title}** (${tip.priority} priority)\n${tip.description}\nDrill: ${tip.drillSuggestion}`
      )
      .join("\n\n");
  };

  const reset = useCallback(() => {
    setState({
      file: null,
      athleteId: null,
      status: "idle",
      progress: { loaded: 0, total: 0, percentage: 0 },
      error: null,
      videoId: null,
      thumbnailUrl: null,
    });
  }, []);

  return {
    state,
    selectFile,
    startUpload,
    reset,
    validateFile,
  };
}

// Utility hook for fetching videos
export function useVideos(athleteId?: string) {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("video_uploads")
        .select("*, athletes(id, name)")
        .order("created_at", { ascending: false });

      if (athleteId) {
        query = query.eq("athlete_id", athleteId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setVideos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  }, [athleteId, supabase]);

  return { videos, loading, error, refetch: fetchVideos };
}

// Utility hook for fetching a single video with analysis
export function useVideoDetail(videoId: string) {
  const [video, setVideo] = useState<any | null>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchVideo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch video
      const { data: videoData, error: videoError } = await supabase
        .from("video_uploads")
        .select("*, athletes(id, name)")
        .eq("id", videoId)
        .single();

      if (videoError) throw videoError;

      // Fetch analyses
      const { data: analysesData, error: analysesError } = await supabase
        .from("video_analyses")
        .select("*")
        .eq("video_id", videoId);

      if (analysesError) throw analysesError;

      // Fetch highlights
      const { data: highlightsData, error: highlightsError } = await supabase
        .from("video_highlights")
        .select("*")
        .eq("video_id", videoId)
        .order("start_time_seconds");

      if (highlightsError) throw highlightsError;

      setVideo(videoData);
      setAnalyses(analysesData || []);
      setHighlights(highlightsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch video");
    } finally {
      setLoading(false);
    }
  }, [videoId, supabase]);

  const getVideoUrl = useCallback(async (): Promise<string | null> => {
    if (!video?.storage_path) return null;

    const { data } = await supabase.storage
      .from("athlete-videos")
      .createSignedUrl(video.storage_path, 3600); // 1 hour expiry

    return data?.signedUrl || null;
  }, [video, supabase]);

  const toggleRecruitingClip = useCallback(
    async (highlightId: string, isRecruiting: boolean) => {
      const { error } = await supabase
        .from("video_highlights")
        .update({ is_recruiting_clip: isRecruiting })
        .eq("id", highlightId);

      if (!error) {
        setHighlights((prev) =>
          prev.map((h) =>
            h.id === highlightId ? { ...h, is_recruiting_clip: isRecruiting } : h
          )
        );
      }

      return !error;
    },
    [supabase]
  );

  return {
    video,
    analyses,
    highlights,
    loading,
    error,
    refetch: fetchVideo,
    getVideoUrl,
    toggleRecruitingClip,
  };
}
