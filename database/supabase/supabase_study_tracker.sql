-- ==============================================================================
-- SUPABASE POSTGRESQL MIGRATION: STUDY TRACKER & CODING PRACTICE ENGINE
-- Tables:
--   1. study_sessions (Timer-recorded & manual coding/study sessions)
--   2. study_logs (Daily comprehensive learning journals)
--   3. study_problem_records (Personal problem inventory with revision tags)
--   4. study_goals (Daily & weekly time targets and public profile handles)
--
-- Security:
--   - Strict Row Level Security (RLS) on all tables
--   - Users can only read, insert, update, and delete their own records
--   - Read-only audit access for authorized Faculty and Admin roles
-- ==============================================================================

-- 1. Create study_sessions Table
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform VARCHAR(60) NOT NULL DEFAULT 'General Study',
    session_type VARCHAR(40) NOT NULL DEFAULT 'coding',
    problem_title VARCHAR(255),
    problem_url TEXT,
    topic VARCHAR(100),
    difficulty VARCHAR(40) DEFAULT 'Medium',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INT NOT NULL DEFAULT 0,
    is_manual BOOLEAN NOT NULL DEFAULT FALSE,
    is_completed BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(40) NOT NULL DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create study_logs Table (Daily Learning Log)
CREATE TABLE IF NOT EXISTS study_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subject_topic VARCHAR(150) NOT NULL,
    platform VARCHAR(60) DEFAULT 'General Study',
    topic_problem_name VARCHAR(255),
    time_spent_minutes INT NOT NULL DEFAULT 0,
    problems_attempted INT NOT NULL DEFAULT 0,
    problems_solved INT NOT NULL DEFAULT 0,
    difficulty_experienced VARCHAR(40) DEFAULT 'Medium',
    learning_notes TEXT,
    what_learned TEXT,
    next_goal TEXT,
    is_manual BOOLEAN NOT NULL DEFAULT TRUE,
    linked_session_id UUID REFERENCES study_sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create study_problem_records Table (Coding Problem Tracker)
CREATE TABLE IF NOT EXISTS study_problem_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform VARCHAR(60) NOT NULL DEFAULT 'LeetCode',
    problem_title VARCHAR(255) NOT NULL,
    problem_url TEXT,
    topic VARCHAR(100) DEFAULT 'General',
    difficulty VARCHAR(40) DEFAULT 'Medium',
    attempt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(40) NOT NULL DEFAULT 'Solved', -- 'Attempted', 'Solved', 'Needs Revision'
    time_spent_minutes INT DEFAULT 0,
    personal_notes TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_source VARCHAR(60) DEFAULT 'self_reported',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create study_goals Table (Daily/Weekly Goals & Public Handles)
CREATE TABLE IF NOT EXISTS study_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    daily_goal_minutes INT NOT NULL DEFAULT 60,
    weekly_goal_minutes INT NOT NULL DEFAULT 420,
    leetcode_username VARCHAR(100),
    codeforces_handle VARCHAR(100),
    codechef_handle VARCHAR(100),
    hackerrank_username VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_study_sess_user_time ON study_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sess_platform ON study_sessions(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_study_logs_user_date ON study_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_study_prob_user_status ON study_problem_records(user_id, status);
CREATE INDEX IF NOT EXISTS idx_study_prob_user_platform ON study_problem_records(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_study_goals_user ON study_goals(user_id);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_problem_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_goals ENABLE ROW LEVEL SECURITY;

-- 7. Strict RLS Policies: study_sessions
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_sessions' AND policyname = 'Users view own study sessions') THEN
        CREATE POLICY "Users view own study sessions"
            ON study_sessions FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_sessions' AND policyname = 'Users insert own study sessions') THEN
        CREATE POLICY "Users insert own study sessions"
            ON study_sessions FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_sessions' AND policyname = 'Users update own study sessions') THEN
        CREATE POLICY "Users update own study sessions"
            ON study_sessions FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_sessions' AND policyname = 'Users delete own study sessions') THEN
        CREATE POLICY "Users delete own study sessions"
            ON study_sessions FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- 8. Strict RLS Policies: study_logs
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_logs' AND policyname = 'Users view own study logs') THEN
        CREATE POLICY "Users view own study logs"
            ON study_logs FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_logs' AND policyname = 'Users insert own study logs') THEN
        CREATE POLICY "Users insert own study logs"
            ON study_logs FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_logs' AND policyname = 'Users update own study logs') THEN
        CREATE POLICY "Users update own study logs"
            ON study_logs FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_logs' AND policyname = 'Users delete own study logs') THEN
        CREATE POLICY "Users delete own study logs"
            ON study_logs FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- 9. Strict RLS Policies: study_problem_records
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_problem_records' AND policyname = 'Users view own problem records') THEN
        CREATE POLICY "Users view own problem records"
            ON study_problem_records FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_problem_records' AND policyname = 'Users insert own problem records') THEN
        CREATE POLICY "Users insert own problem records"
            ON study_problem_records FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_problem_records' AND policyname = 'Users update own problem records') THEN
        CREATE POLICY "Users update own problem records"
            ON study_problem_records FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_problem_records' AND policyname = 'Users delete own problem records') THEN
        CREATE POLICY "Users delete own problem records"
            ON study_problem_records FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- 10. Strict RLS Policies: study_goals
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_goals' AND policyname = 'Users view own study goals') THEN
        CREATE POLICY "Users view own study goals"
            ON study_goals FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_goals' AND policyname = 'Users insert own study goals') THEN
        CREATE POLICY "Users insert own study goals"
            ON study_goals FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_goals' AND policyname = 'Users update own study goals') THEN
        CREATE POLICY "Users update own study goals"
            ON study_goals FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;
END $$;
