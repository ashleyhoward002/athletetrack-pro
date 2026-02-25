-- Video Upload & Analysis Pipeline Tables
-- Run this migration in Supabase SQL Editor

-- Create enum types
DO $$ BEGIN
  CREATE TYPE video_status AS ENUM ('uploading', 'processing', 'analyzed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE video_source AS ENUM ('phone', 'veo_import', 'veo_go');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE analysis_type AS ENUM ('shot_form', 'highlight_detection', 'game_summary');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE highlight_type AS ENUM ('shot_made', 'assist', 'block', 'steal', 'dunk', 'custom');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Video Uploads Table
CREATE TABLE IF NOT EXISTS video_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  thumbnail_url TEXT,
  original_filename TEXT,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  status video_status NOT NULL DEFAULT 'uploading',
  source video_source NOT NULL DEFAULT 'phone',
  sport TEXT NOT NULL DEFAULT 'basketball',
  title TEXT,
  description TEXT,
  game_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Video Analyses Table
CREATE TABLE IF NOT EXISTS video_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES video_uploads(id) ON DELETE CASCADE,
  analysis_type analysis_type NOT NULL,
  results_json JSONB NOT NULL DEFAULT '{}',
  ai_coaching_tips TEXT,
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Video Highlights Table
CREATE TABLE IF NOT EXISTS video_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES video_uploads(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  start_time_seconds FLOAT NOT NULL,
  end_time_seconds FLOAT NOT NULL,
  highlight_type highlight_type NOT NULL DEFAULT 'custom',
  title TEXT,
  thumbnail_url TEXT,
  is_recruiting_clip BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_time_range CHECK (end_time_seconds > start_time_seconds)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_uploads_user_id ON video_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_video_uploads_athlete_id ON video_uploads(athlete_id);
CREATE INDEX IF NOT EXISTS idx_video_uploads_status ON video_uploads(status);
CREATE INDEX IF NOT EXISTS idx_video_uploads_created_at ON video_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_analyses_video_id ON video_analyses(video_id);
CREATE INDEX IF NOT EXISTS idx_video_highlights_video_id ON video_highlights(video_id);
CREATE INDEX IF NOT EXISTS idx_video_highlights_athlete_id ON video_highlights(athlete_id);
CREATE INDEX IF NOT EXISTS idx_video_highlights_recruiting ON video_highlights(is_recruiting_clip) WHERE is_recruiting_clip = true;

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_video_uploads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS video_uploads_updated_at ON video_uploads;
CREATE TRIGGER video_uploads_updated_at
  BEFORE UPDATE ON video_uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_video_uploads_updated_at();

-- Enable Row Level Security
ALTER TABLE video_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_highlights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_uploads
DROP POLICY IF EXISTS "Users can view own videos" ON video_uploads;
CREATE POLICY "Users can view own videos" ON video_uploads
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own videos" ON video_uploads;
CREATE POLICY "Users can insert own videos" ON video_uploads
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own videos" ON video_uploads;
CREATE POLICY "Users can update own videos" ON video_uploads
  FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own videos" ON video_uploads;
CREATE POLICY "Users can delete own videos" ON video_uploads
  FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for video_analyses
DROP POLICY IF EXISTS "Users can view analyses of own videos" ON video_analyses;
CREATE POLICY "Users can view analyses of own videos" ON video_analyses
  FOR SELECT
  USING (
    video_id IN (SELECT id FROM video_uploads WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert analyses for own videos" ON video_analyses;
CREATE POLICY "Users can insert analyses for own videos" ON video_analyses
  FOR INSERT
  WITH CHECK (
    video_id IN (SELECT id FROM video_uploads WHERE user_id = auth.uid())
  );

-- RLS Policies for video_highlights
DROP POLICY IF EXISTS "Users can view highlights of own videos" ON video_highlights;
CREATE POLICY "Users can view highlights of own videos" ON video_highlights
  FOR SELECT
  USING (
    video_id IN (SELECT id FROM video_uploads WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert highlights for own videos" ON video_highlights;
CREATE POLICY "Users can insert highlights for own videos" ON video_highlights
  FOR INSERT
  WITH CHECK (
    video_id IN (SELECT id FROM video_uploads WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own highlights" ON video_highlights;
CREATE POLICY "Users can update own highlights" ON video_highlights
  FOR UPDATE
  USING (
    video_id IN (SELECT id FROM video_uploads WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete own highlights" ON video_highlights;
CREATE POLICY "Users can delete own highlights" ON video_highlights
  FOR DELETE
  USING (
    video_id IN (SELECT id FROM video_uploads WHERE user_id = auth.uid())
  );

-- Grant permissions
GRANT ALL ON video_uploads TO authenticated;
GRANT ALL ON video_analyses TO authenticated;
GRANT ALL ON video_highlights TO authenticated;
