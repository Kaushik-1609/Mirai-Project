-- ==============================================================================
-- SUPABASE MIGRATION: MATCHMAKING MICRO-LEAGUES & INCOGNITO SYSTEM
-- Exactly 20 Students per League Room with Top 5 Promotion & Bottom 5 Relegation
-- ==============================================================================

-- 1. Create Enums
CREATE TYPE league_tier AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');
CREATE TYPE movement_zone AS ENUM ('PROMOTION', 'SAFE', 'RELEGATION');
CREATE TYPE leaderboard_status AS ENUM ('ACTIVE', 'RESOLVED');

-- 2. Update Profiles / Users Table for Incognito Privacy
ALTER TABLE auth.users 
  ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS anonymous_gamertag VARCHAR(60) DEFAULT 'Ninja_Coder_007',
  ADD COLUMN IF NOT EXISTS current_tier league_tier DEFAULT 'BRONZE';

-- 3. Weekly Leaderboards (20-Student Isolation Rooms)
CREATE TABLE IF NOT EXISTS weekly_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier league_tier NOT NULL DEFAULT 'BRONZE',
  group_code VARCHAR(80) NOT NULL, -- e.g. "GOLD-ROOM-042"
  week_number INT NOT NULL,
  year INT NOT NULL,
  status leaderboard_status NOT NULL DEFAULT 'ACTIVE',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  max_capacity INT NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_group_week UNIQUE (group_code, week_number, year)
);

-- 4. Leaderboard Entries Table
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_id UUID NOT NULL REFERENCES weekly_leaderboards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weekly_xp INT NOT NULL DEFAULT 0,
  questions_solved INT NOT NULL DEFAULT 0,
  study_streak_days INT NOT NULL DEFAULT 1,
  current_rank INT NOT NULL DEFAULT 20,
  zone movement_zone NOT NULL DEFAULT 'SAFE',
  is_incognito BOOLEAN NOT NULL DEFAULT FALSE,
  rendered_name VARCHAR(100) NOT NULL,
  rendered_avatar VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_leaderboard_user UNIQUE (leaderboard_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_entries_xp ON leaderboard_entries(leaderboard_id, weekly_xp DESC);
