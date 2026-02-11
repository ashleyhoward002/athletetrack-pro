-- ============================================================
-- Physical Development Metrics Table
-- ============================================================
-- Stores physical/athletic measurements for athletes over time
-- Each record represents a measurement session with multiple metrics
-- ============================================================

-- Create the athlete_physical_metrics table
CREATE TABLE IF NOT EXISTS athlete_physical_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  sport TEXT NOT NULL DEFAULT 'basketball',
  metrics JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_physical_metrics_athlete_id ON athlete_physical_metrics(athlete_id);
CREATE INDEX IF NOT EXISTS idx_physical_metrics_sport ON athlete_physical_metrics(sport);
CREATE INDEX IF NOT EXISTS idx_physical_metrics_recorded_at ON athlete_physical_metrics(recorded_at DESC);

-- Enable Row Level Security
ALTER TABLE athlete_physical_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own athletes' metrics
CREATE POLICY "Users can view own athlete metrics" ON athlete_physical_metrics
  FOR SELECT
  USING (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert metrics for their own athletes
CREATE POLICY "Users can insert own athlete metrics" ON athlete_physical_metrics
  FOR INSERT
  WITH CHECK (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update their own athletes' metrics
CREATE POLICY "Users can update own athlete metrics" ON athlete_physical_metrics
  FOR UPDATE
  USING (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete their own athletes' metrics
CREATE POLICY "Users can delete own athlete metrics" ON athlete_physical_metrics
  FOR DELETE
  USING (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_physical_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER physical_metrics_updated_at
  BEFORE UPDATE ON athlete_physical_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_physical_metrics_updated_at();

-- ============================================================
-- Example queries:
-- ============================================================

-- Get latest metrics for an athlete
-- SELECT * FROM athlete_physical_metrics
-- WHERE athlete_id = 'uuid-here'
-- ORDER BY recorded_at DESC
-- LIMIT 1;

-- Get all metrics history for an athlete in a specific sport
-- SELECT * FROM athlete_physical_metrics
-- WHERE athlete_id = 'uuid-here' AND sport = 'basketball'
-- ORDER BY recorded_at DESC;

-- Get specific metric value over time
-- SELECT
--   recorded_at,
--   metrics->>'vertical_jump' as vertical_jump
-- FROM athlete_physical_metrics
-- WHERE athlete_id = 'uuid-here'
-- ORDER BY recorded_at;
