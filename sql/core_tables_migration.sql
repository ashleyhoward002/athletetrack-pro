-- ============================================================
-- Core Tables Migration
-- ============================================================
-- Run this in Supabase SQL Editor to create all missing tables
-- that the app requires (athletes, scheduled_games, sports_expenses)
-- and add missing columns to the games table.
-- ============================================================

-- ============================================================
-- 1. ATHLETES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS athletes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE,
  position TEXT,
  primary_sport TEXT NOT NULL DEFAULT 'basketball',
  sports TEXT[],
  school TEXT,
  team_name TEXT,
  level TEXT,
  jersey_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_athletes_user_id ON athletes(user_id);
CREATE INDEX IF NOT EXISTS idx_athletes_name ON athletes(name);

-- Enable RLS
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own athletes" ON athletes;
CREATE POLICY "Users can view own athletes" ON athletes
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own athletes" ON athletes;
CREATE POLICY "Users can insert own athletes" ON athletes
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own athletes" ON athletes;
CREATE POLICY "Users can update own athletes" ON athletes
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own athletes" ON athletes;
CREATE POLICY "Users can delete own athletes" ON athletes
  FOR DELETE USING (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON athletes TO authenticated;

-- ============================================================
-- 2. GAMES TABLE - Add missing columns
-- ============================================================
-- The games table may already exist from schema.sql.
-- Add the new columns that the multi-sport API expects.
ALTER TABLE games ADD COLUMN IF NOT EXISTS sport TEXT NOT NULL DEFAULT 'basketball';
ALTER TABLE games ADD COLUMN IF NOT EXISTS stats JSONB NOT NULL DEFAULT '{}';
ALTER TABLE games ADD COLUMN IF NOT EXISTS athlete_id UUID REFERENCES athletes(id) ON DELETE SET NULL;
ALTER TABLE games ADD COLUMN IF NOT EXISTS season_id UUID;

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_games_sport ON games(sport);
CREATE INDEX IF NOT EXISTS idx_games_athlete_id ON games(athlete_id);

-- Grant permissions (in case not already granted)
GRANT ALL ON games TO authenticated;

-- ============================================================
-- 3. SCHEDULED GAMES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS scheduled_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES athletes(id) ON DELETE SET NULL,
  sport TEXT NOT NULL DEFAULT 'basketball',
  opponent TEXT NOT NULL,
  game_date DATE NOT NULL,
  game_time TIME,
  location TEXT,
  notes TEXT,
  is_home_game BOOLEAN NOT NULL DEFAULT true,
  reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_hours_before INTEGER NOT NULL DEFAULT 24,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_games_user_id ON scheduled_games(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_games_game_date ON scheduled_games(game_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_games_athlete_id ON scheduled_games(athlete_id);

-- Enable RLS
ALTER TABLE scheduled_games ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own scheduled games" ON scheduled_games;
CREATE POLICY "Users can view own scheduled games" ON scheduled_games
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own scheduled games" ON scheduled_games;
CREATE POLICY "Users can insert own scheduled games" ON scheduled_games
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own scheduled games" ON scheduled_games;
CREATE POLICY "Users can update own scheduled games" ON scheduled_games
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own scheduled games" ON scheduled_games;
CREATE POLICY "Users can delete own scheduled games" ON scheduled_games
  FOR DELETE USING (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON scheduled_games TO authenticated;

-- ============================================================
-- 4. SPORTS EXPENSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS sports_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES athletes(id) ON DELETE SET NULL,
  sport TEXT NOT NULL DEFAULT 'basketball',
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  season TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sports_expenses_user_id ON sports_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_sports_expenses_date ON sports_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_sports_expenses_athlete_id ON sports_expenses(athlete_id);
CREATE INDEX IF NOT EXISTS idx_sports_expenses_category ON sports_expenses(category);

-- Enable RLS
ALTER TABLE sports_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own expenses" ON sports_expenses;
CREATE POLICY "Users can view own expenses" ON sports_expenses
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own expenses" ON sports_expenses;
CREATE POLICY "Users can insert own expenses" ON sports_expenses
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own expenses" ON sports_expenses;
CREATE POLICY "Users can update own expenses" ON sports_expenses
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own expenses" ON sports_expenses;
CREATE POLICY "Users can delete own expenses" ON sports_expenses
  FOR DELETE USING (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON sports_expenses TO authenticated;

-- ============================================================
-- 5. UPDATED_AT TRIGGERS
-- ============================================================

-- Athletes
CREATE OR REPLACE FUNCTION update_athletes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS athletes_updated_at ON athletes;
CREATE TRIGGER athletes_updated_at
  BEFORE UPDATE ON athletes
  FOR EACH ROW
  EXECUTE FUNCTION update_athletes_updated_at();

-- Scheduled Games
CREATE OR REPLACE FUNCTION update_scheduled_games_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS scheduled_games_updated_at ON scheduled_games;
CREATE TRIGGER scheduled_games_updated_at
  BEFORE UPDATE ON scheduled_games
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_games_updated_at();

-- Sports Expenses
CREATE OR REPLACE FUNCTION update_sports_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sports_expenses_updated_at ON sports_expenses;
CREATE TRIGGER sports_expenses_updated_at
  BEFORE UPDATE ON sports_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_sports_expenses_updated_at();
