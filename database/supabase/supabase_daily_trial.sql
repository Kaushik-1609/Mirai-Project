-- ==============================================================================
-- SUPABASE MIGRATION: MSOT LEARN DAILY TRIAL SYSTEM (DSA in C++ & HTML Web)
-- Strict Row-Level Security, Atomic Idempotency & Score Safeguards
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.daily_trial_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    trial_date DATE NOT NULL,                      -- Based on Asia/Kolkata Calendar (YYYY-MM-DD)
    day_number INT NOT NULL CHECK (day_number BETWEEN 1 AND 7),
    subject VARCHAR(20) NOT NULL CHECK (subject IN ('dsa', 'html')),
    score INT NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 60),
    max_score INT NOT NULL DEFAULT 60,
    correct_count INT NOT NULL DEFAULT 0 CHECK (correct_count >= 0 AND correct_count <= 5),
    incorrect_count INT NOT NULL DEFAULT 0 CHECK (incorrect_count >= 0 AND incorrect_count <= 5),
    total_questions INT NOT NULL DEFAULT 5,
    answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_date_subject UNIQUE (user_email, trial_date, subject)
);

CREATE INDEX IF NOT EXISTS idx_dt_user_date ON public.daily_trial_attempts(user_email, trial_date);
CREATE INDEX IF NOT EXISTS idx_dt_subject ON public.daily_trial_attempts(subject, trial_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.daily_trial_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Students can view their own daily trial attempts" ON public.daily_trial_attempts;
DROP POLICY IF EXISTS "Students can insert their own daily trial attempts" ON public.daily_trial_attempts;
DROP POLICY IF EXISTS "Students can update their own in-progress daily trials" ON public.daily_trial_attempts;
DROP POLICY IF EXISTS "Admins and Faculty can inspect all daily trial attempts" ON public.daily_trial_attempts;

-- Policy 1: Students can only view their own private daily trial attempts
CREATE POLICY "Students can view their own daily trial attempts"
    ON public.daily_trial_attempts FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id OR 
        lower(user_email) = lower(auth.jwt() ->> 'email')
    );

-- Policy 2: Students can only insert for their own account
CREATE POLICY "Students can insert their own daily trial attempts"
    ON public.daily_trial_attempts FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id OR 
        lower(user_email) = lower(auth.jwt() ->> 'email')
    );

-- Policy 3: Students can update their own attempts
CREATE POLICY "Students can update their own in-progress daily trials"
    ON public.daily_trial_attempts FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = user_id OR 
        lower(user_email) = lower(auth.jwt() ->> 'email')
    );

-- Policy 4: Admins and Faculty can inspect attempts for pedagogical analytics
CREATE POLICY "Admins and Faculty can inspect all daily trial attempts"
    ON public.daily_trial_attempts FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('faculty', 'admin', 'master_admin')
        )
    );

-- Function: Atomic upsert of daily trial progress preventing duplicate awards
CREATE OR REPLACE FUNCTION public.sync_daily_trial_attempt(
    p_user_email TEXT,
    p_trial_date DATE,
    p_day_number INT,
    p_subject TEXT,
    p_score INT,
    p_correct_count INT,
    p_incorrect_count INT,
    p_answers JSONB,
    p_is_completed BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_record RECORD;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(p_user_email) LIMIT 1;
    
    INSERT INTO public.daily_trial_attempts (
        user_id,
        user_email,
        trial_date,
        day_number,
        subject,
        score,
        correct_count,
        incorrect_count,
        answers_json,
        is_completed,
        completed_at,
        updated_at
    ) VALUES (
        v_user_id,
        lower(p_user_email),
        p_trial_date,
        p_day_number,
        p_subject,
        LEAST(60, GREATEST(0, p_score)),
        LEAST(5, GREATEST(0, p_correct_count)),
        LEAST(5, GREATEST(0, p_incorrect_count)),
        p_answers,
        p_is_completed,
        CASE WHEN p_is_completed THEN NOW() ELSE NULL END,
        NOW()
    )
    ON CONFLICT (user_email, trial_date, subject) DO UPDATE SET
        score = GREATEST(daily_trial_attempts.score, EXCLUDED.score),
        correct_count = EXCLUDED.correct_count,
        incorrect_count = EXCLUDED.incorrect_count,
        answers_json = EXCLUDED.answers_json,
        is_completed = (daily_trial_attempts.is_completed OR EXCLUDED.is_completed),
        completed_at = COALESCE(daily_trial_attempts.completed_at, EXCLUDED.completed_at),
        updated_at = NOW()
    RETURNING * INTO v_record;

    RETURN to_jsonb(v_record);
END;
$$;
