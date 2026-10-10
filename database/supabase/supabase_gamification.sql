-- ==============================================================================
-- SUPABASE POSTGRESQL MIGRATION: INCLUSIVE GAMIFICATION ENGINE
-- Supports Row Level Security (RLS) and real-time triggers for unlocks
-- ==============================================================================

-- 1. Create Enums
CREATE TYPE badge_category AS ENUM ('IMPROVEMENT', 'CONSISTENCY', 'MASTERY', 'COMMUNITY', 'FUN');
CREATE TYPE rarity_tier AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC');
CREATE TYPE criteria_type AS ENUM (
  'TEST_IMPROVEMENT_PERCENT',
  'STREAK_DAYS',
  'QUESTIONS_SOLVED',
  'PEER_HELP_COUNT',
  'ATTENDANCE_COUNT',
  'SPEED_ACCURACY',
  'SPECIAL_EVENT'
);
CREATE TYPE quest_type AS ENUM ('DAILY', 'WEEKLY', 'MILESTONE', 'SPECIAL');

-- 2. Badges Table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(80) UNIQUE NOT NULL,
  title VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  unlock_instruction TEXT NOT NULL,
  category badge_category NOT NULL DEFAULT 'IMPROVEMENT',
  rarity rarity_tier NOT NULL DEFAULT 'COMMON',
  icon_name VARCHAR(60) NOT NULL DEFAULT 'Award',
  badge_color_hex VARCHAR(10) NOT NULL DEFAULT '#00f0ff',
  xp_reward INT NOT NULL DEFAULT 50,
  criteria_type criteria_type NOT NULL DEFAULT 'QUESTIONS_SOLVED',
  criteria_threshold NUMERIC NOT NULL DEFAULT 1,
  criteria_metadata JSONB DEFAULT '{}'::jsonb,
  is_secret BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Student Badges Mapping Table
CREATE TABLE IF NOT EXISTS student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress_value NUMERIC NOT NULL DEFAULT 0,
  is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  has_seen_celebration BOOLEAN NOT NULL DEFAULT FALSE,
  context_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_student_badge UNIQUE (student_id, badge_id)
);

-- 4. Quests Table
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(80) UNIQUE NOT NULL,
  title VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  category badge_category NOT NULL DEFAULT 'IMPROVEMENT',
  quest_type quest_type NOT NULL DEFAULT 'DAILY',
  target_count INT NOT NULL DEFAULT 5,
  unit_label VARCHAR(60) NOT NULL DEFAULT 'Problems solved',
  xp_reward INT NOT NULL DEFAULT 30,
  reward_badge_id UUID REFERENCES badges(id) ON DELETE SET NULL,
  criteria_type criteria_type NOT NULL DEFAULT 'QUESTIONS_SOLVED',
  criteria_metadata JSONB DEFAULT '{}'::jsonb,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Student Quests Progress Table
CREATE TABLE IF NOT EXISTS student_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  current_progress INT NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  is_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_student_quest UNIQUE (student_id, quest_id)
);

-- 6. Indexes for High-Velocity Leaderboard and Profile Rendering
CREATE INDEX IF NOT EXISTS idx_badges_cat ON badges(category);
CREATE INDEX IF NOT EXISTS idx_student_badges_student ON student_badges(student_id, is_unlocked);
CREATE INDEX IF NOT EXISTS idx_student_quests_student ON student_quests(student_id, is_completed);

-- 7. Row Level Security Policies
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Public read for quests" ON quests FOR SELECT USING (true);
CREATE POLICY "Students can read their own badges" ON student_badges FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can read their own quests" ON student_quests FOR SELECT USING (auth.uid() = student_id);
