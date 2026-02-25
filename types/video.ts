// Video Upload & Analysis Types

export type VideoStatus = 'uploading' | 'processing' | 'analyzed' | 'failed';
export type VideoSource = 'phone' | 'veo_import' | 'veo_go';
export type AnalysisType = 'shot_form' | 'highlight_detection' | 'game_summary';
export type HighlightType = 'shot_made' | 'assist' | 'block' | 'steal' | 'dunk' | 'custom';

export interface VideoUpload {
  id: string;
  user_id: string;
  athlete_id: string;
  storage_path: string;
  thumbnail_url: string | null;
  original_filename: string | null;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  status: VideoStatus;
  source: VideoSource;
  sport: string;
  title: string | null;
  description: string | null;
  game_date: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  athletes?: {
    id: string;
    name: string;
  };
}

export interface VideoAnalysis {
  id: string;
  video_id: string;
  analysis_type: AnalysisType;
  results_json: ShotFormResults | HighlightDetectionResults | GameSummaryResults;
  ai_coaching_tips: string | null;
  confidence_score: number | null;
  processed_at: string;
  created_at: string;
}

export interface VideoHighlight {
  id: string;
  video_id: string;
  athlete_id: string;
  start_time_seconds: number;
  end_time_seconds: number;
  highlight_type: HighlightType;
  title: string | null;
  thumbnail_url: string | null;
  is_recruiting_clip: boolean;
  created_at: string;
}

// Analysis Result Types
export interface ShotFormResults {
  type: 'shot_form';
  shots_analyzed: number;
  overall_score: number; // 0-100
  metrics: {
    elbow_alignment: {
      score: number;
      description: string;
    };
    follow_through: {
      score: number;
      description: string;
    };
    knee_bend: {
      score: number;
      description: string;
    };
    release_point: {
      score: number;
      description: string;
    };
    balance: {
      score: number;
      description: string;
    };
  };
  pose_data?: MediaPipePoseData[];
}

export interface MediaPipePoseData {
  timestamp_ms: number;
  landmarks: {
    x: number;
    y: number;
    z: number;
    visibility: number;
  }[];
  joint_angles: {
    right_elbow: number;
    left_elbow: number;
    right_knee: number;
    left_knee: number;
    right_shoulder: number;
    left_shoulder: number;
  };
}

export interface HighlightDetectionResults {
  type: 'highlight_detection';
  total_highlights: number;
  highlights: DetectedHighlight[];
}

export interface DetectedHighlight {
  start_time: number;
  end_time: number;
  type: HighlightType;
  confidence: number;
  description: string;
}

export interface GameSummaryResults {
  type: 'game_summary';
  duration_analyzed: number;
  key_moments: {
    time: number;
    description: string;
    importance: 'high' | 'medium' | 'low';
  }[];
  stats_detected: Record<string, number>;
}

// Upload State Types
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface VideoUploadState {
  file: File | null;
  athleteId: string | null;
  status: 'idle' | 'validating' | 'generating_thumbnail' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: UploadProgress;
  error: string | null;
  videoId: string | null;
  thumbnailUrl: string | null;
}

// Form Types
export interface VideoUploadForm {
  athleteId: string;
  title?: string;
  description?: string;
  gameDate?: string;
  sport?: string;
}

// Video with full relations
export interface VideoWithAnalysis extends VideoUpload {
  analyses: VideoAnalysis[];
  highlights: VideoHighlight[];
}

// Coaching tips structure
export interface CoachingTip {
  category: 'form' | 'technique' | 'strength' | 'consistency';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  drillSuggestion?: string;
}
