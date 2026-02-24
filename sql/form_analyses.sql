-- ============================================================
-- Form Analyses Table
-- ============================================================
-- Stores video form analysis results from AI
-- Each record represents one video analysis session
-- ============================================================

-- Create the form_analyses table
CREATE TABLE IF NOT EXISTS form_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  analysis_type TEXT NOT NULL,
  video_url TEXT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  ai_feedback JSONB,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  source TEXT DEFAULT 'upload' CHECK (source IN ('upload', 'live')),
  session_duration_seconds INTEGER,
  session_transcript JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_form_analyses_user_id ON form_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_form_analyses_sport ON form_analyses(sport);
CREATE INDEX IF NOT EXISTS idx_form_analyses_created_at ON form_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_analyses_status ON form_analyses(status);

-- Enable Row Level Security
ALTER TABLE form_analyses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own analyses
CREATE POLICY "Users can view own form analyses" ON form_analyses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own analyses
CREATE POLICY "Users can create own form analyses" ON form_analyses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own analyses
CREATE POLICY "Users can update own form analyses" ON form_analyses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own analyses
CREATE POLICY "Users can delete own form analyses" ON form_analyses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_form_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER form_analyses_updated_at
  BEFORE UPDATE ON form_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_form_analyses_updated_at();

-- ============================================================
-- Storage bucket setup (run in Supabase dashboard)
-- ============================================================
-- 1. Create bucket named "form-videos"
-- 2. Set to private (not public)
-- 3. Add RLS policies:
--
-- Policy for uploads (INSERT):
-- (bucket_id = 'form-videos' AND auth.uid()::text = (storage.foldername(name))[1])
--
-- Policy for downloads (SELECT):
-- (bucket_id = 'form-videos' AND auth.uid()::text = (storage.foldername(name))[1])
--
-- Policy for deletes (DELETE):
-- (bucket_id = 'form-videos' AND auth.uid()::text = (storage.foldername(name))[1])
-- ============================================================
