-- ==============================================================================
-- SUPABASE POSTGRESQL MIGRATION: THREE-ROLE RBAC & ACADEMIC GOVERNANCE
-- Roles: admin, faculty, student
-- Features: Profiles, Questions Bank, Submissions, User Stats, Audit Logs, RLS
-- ==============================================================================

-- 1. Create Enums
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'faculty', 'student');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
        CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
        CREATE TYPE activity_type AS ENUM ('daily_trial', 'weekend_lab', 'general');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_difficulty') THEN
        CREATE TYPE question_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
    END IF;
END $$;

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(120) NOT NULL,
    username VARCHAR(60) NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'student',
    avatar VARCHAR(255) DEFAULT '⚔️',
    status account_status NOT NULL DEFAULT 'active',
    student_id VARCHAR(60),
    year VARCHAR(40) DEFAULT '2nd Year',
    semester VARCHAR(40) DEFAULT 'Semester 4',
    section VARCHAR(40) DEFAULT 'Section Alpha',
    branch VARCHAR(100) DEFAULT 'Computer Science & Engineering (CSE)',
    phone VARCHAR(40),
    track VARCHAR(100) DEFAULT 'C++ Algorithms & DSA',
    anonymous_mode BOOLEAN DEFAULT FALSE,
    anonymous_alias VARCHAR(60),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for role lookups and security
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 3. Questions Table (Daily Trials & Weekend Labs)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    options JSONB NOT NULL, -- e.g. [{"id": "A", "text": "4"}, {"id": "B", "text": "8"}]
    correct_answer VARCHAR(50) NOT NULL, -- e.g. "A" or option identifier
    explanation TEXT,
    difficulty question_difficulty NOT NULL DEFAULT 'beginner',
    category VARCHAR(100) NOT NULL DEFAULT 'C++ DSA',
    activity_type activity_type NOT NULL DEFAULT 'daily_trial',
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    creator_email VARCHAR(255),
    creator_name VARCHAR(120),
    xp_reward INT NOT NULL DEFAULT 15,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_activity ON questions(activity_type, is_published);
CREATE INDEX IF NOT EXISTS idx_questions_creator ON questions(creator_id);

-- 4. Submissions Table (Verified Answer Attempts)
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    submitted_answer VARCHAR(50) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    xp_awarded INT NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_question ON submissions(question_id);

-- 5. User Stats Table (Student Scores, XP, Streaks & Progress)
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    xp INT NOT NULL DEFAULT 0,
    streak INT NOT NULL DEFAULT 1,
    freeze_shields INT NOT NULL DEFAULT 2,
    questions_solved INT NOT NULL DEFAULT 0,
    time_spent_mins INT NOT NULL DEFAULT 0,
    last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_stats_xp ON user_stats(xp DESC);

-- 6. Platform Audit Logs Table (Administrative Security History)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_email VARCHAR(255) NOT NULL,
    actor_role user_role NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(60),
    target_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    ip_hint VARCHAR(60),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get caller role from profiles
CREATE OR REPLACE FUNCTION get_auth_user_role()
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles read public" ON profiles;
CREATE POLICY "Profiles read public" ON profiles
    FOR SELECT USING (status = 'active' OR auth.uid() = id OR get_auth_user_role() = 'admin');

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND 
        role = (SELECT role FROM profiles WHERE id = auth.uid()) -- Cannot change own role!
    );

DROP POLICY IF EXISTS "Admins manage all profiles" ON profiles;
CREATE POLICY "Admins manage all profiles" ON profiles
    FOR ALL USING (get_auth_user_role() = 'admin');

-- Questions Policies
DROP POLICY IF EXISTS "Students read published questions" ON questions;
CREATE POLICY "Students read published questions" ON questions
    FOR SELECT USING (is_published = TRUE OR creator_id = auth.uid() OR get_auth_user_role() IN ('admin', 'faculty'));

DROP POLICY IF EXISTS "Faculty manage own questions" ON questions;
CREATE POLICY "Faculty manage own questions" ON questions
    FOR ALL USING (
        get_auth_user_role() IN ('faculty', 'admin') AND 
        (creator_id = auth.uid() OR get_auth_user_role() = 'admin')
    );

-- Submissions Policies
DROP POLICY IF EXISTS "Students read own submissions" ON submissions;
CREATE POLICY "Students read own submissions" ON submissions
    FOR SELECT USING (
        student_id = auth.uid() OR 
        get_auth_user_role() IN ('admin', 'faculty')
    );

-- User Stats Policies
DROP POLICY IF EXISTS "Stats read public" ON user_stats;
CREATE POLICY "Stats read public" ON user_stats
    FOR SELECT USING (TRUE);

-- Audit Logs Policies
DROP POLICY IF EXISTS "Admins read audit logs" ON audit_logs;
CREATE POLICY "Admins read audit logs" ON audit_logs
    FOR SELECT USING (get_auth_user_role() = 'admin');

-- ==============================================================================
-- 8. SECURE STORED PROCEDURES (RPCS)
-- ==============================================================================

-- Secure submission handler: Server checks answer, calculates XP, and updates stats atomically
CREATE OR REPLACE FUNCTION submit_question_answer(
    p_question_id UUID,
    p_submitted_answer VARCHAR(50)
)
RETURNS JSONB AS $$
DECLARE
    v_student_id UUID;
    v_student_role user_role;
    v_student_status account_status;
    v_correct_answer VARCHAR(50);
    v_xp_reward INT;
    v_explanation TEXT;
    v_is_correct BOOLEAN;
    v_awarded INT := 0;
BEGIN
    v_student_id := auth.uid();
    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to submit answer';
    END IF;

    -- Verify student profile
    SELECT role, status INTO v_student_role, v_student_status
    FROM profiles WHERE id = v_student_id;

    IF v_student_status != 'active' THEN
        RAISE EXCEPTION 'Account is inactive or suspended';
    END IF;

    -- Fetch question details
    SELECT correct_answer, xp_reward, explanation
    INTO v_correct_answer, v_xp_reward, v_explanation
    FROM questions WHERE id = p_question_id AND is_published = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Question not found or not published';
    END IF;

    v_is_correct := (TRIM(LOWER(p_submitted_answer)) = TRIM(LOWER(v_correct_answer)));

    IF v_is_correct THEN
        v_awarded := COALESCE(v_xp_reward, 15);
    ELSE
        v_awarded := 0;
    END IF;

    -- Record submission
    INSERT INTO submissions (student_id, question_id, submitted_answer, is_correct, xp_awarded)
    VALUES (v_student_id, p_question_id, p_submitted_answer, v_is_correct, v_awarded);

    -- Atomically update student stats
    INSERT INTO user_stats (user_id, xp, questions_solved, last_active)
    VALUES (v_student_id, v_awarded, (CASE WHEN v_is_correct THEN 1 ELSE 0 END), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        xp = user_stats.xp + v_awarded,
        questions_solved = user_stats.questions_solved + (CASE WHEN v_is_correct THEN 1 ELSE 0 END),
        last_active = NOW();

    RETURN jsonb_build_object(
        'success', TRUE,
        'is_correct', v_is_correct,
        'xp_awarded', v_awarded,
        'correct_answer', (CASE WHEN v_is_correct THEN v_correct_answer ELSE NULL END),
        'explanation', v_explanation
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin user management procedure
CREATE OR REPLACE FUNCTION admin_manage_user(
    p_target_user_id UUID,
    p_new_role user_role,
    p_new_status account_status
)
RETURNS JSONB AS $$
DECLARE
    v_caller_role user_role;
    v_caller_email VARCHAR(255);
BEGIN
    SELECT role, email INTO v_caller_role, v_caller_email
    FROM profiles WHERE id = auth.uid();

    IF v_caller_role != 'admin' THEN
        RAISE EXCEPTION 'Permission Denied: Only Admins can modify user roles or account status.';
    END IF;

    UPDATE profiles
    SET role = p_new_role,
        status = p_new_status,
        updated_at = NOW()
    WHERE id = p_target_user_id;

    -- Log action in audit logs
    INSERT INTO audit_logs (actor_id, actor_email, actor_role, action, target_type, target_id, details)
    VALUES (
        auth.uid(),
        v_caller_email,
        'admin',
        'ADMIN_UPDATE_USER_ROLE_STATUS',
        'profile',
        p_target_user_id::text,
        jsonb_build_object('new_role', p_new_role, 'new_status', p_new_status)
    );

    RETURN jsonb_build_object('success', TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 9. ACADEMIC ASSIGNMENTS TABLE (FACULTY AUTHORING & PUBLISHING)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    creator_name VARCHAR(120),
    creator_email VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL DEFAULT 'C++ DSA',
    topic VARCHAR(100),
    deadline TIMESTAMPTZ,
    xp_reward INT NOT NULL DEFAULT 50,
    max_marks INT NOT NULL DEFAULT 100,
    target_section VARCHAR(40) DEFAULT 'ALL',
    resource_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignments_published ON assignments(is_published, target_section);
CREATE INDEX IF NOT EXISTS idx_assignments_creator ON assignments(creator_id);

-- ==============================================================================
-- 10. ASSIGNMENT SUBMISSIONS TABLE (STUDENT SUBMISSIONS & GRADING)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    student_name VARCHAR(120),
    student_email VARCHAR(255),
    submission_content TEXT NOT NULL,
    file_url TEXT,
    status VARCHAR(40) NOT NULL DEFAULT 'SUBMITTED', -- 'SUBMITTED', 'GRADED', 'REJECTED'
    grade_score INT DEFAULT NULL,
    grade_xp INT DEFAULT 0,
    feedback TEXT,
    graded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    graded_by_name VARCHAR(120),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    graded_at TIMESTAMPTZ,
    CONSTRAINT unique_student_assignment UNIQUE (assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assign ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id);

-- ==============================================================================
-- 11. STUDENT INACTIVITY REASONS TABLE (LEAVE & ABSENCE NOTICES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS student_inactivity_reasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    student_name VARCHAR(120),
    student_email VARCHAR(255),
    category VARCHAR(60) NOT NULL, -- 'PERSONAL', 'HEALTH', 'ACADEMIC_WORKLOAD', 'TECHNICAL_ISSUE', 'LEAVE', 'OTHER'
    reason_text TEXT NOT NULL,
    date_from DATE,
    date_to DATE,
    status VARCHAR(40) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ACKNOWLEDGED', 'EXCUSED'
    faculty_response TEXT,
    responded_by_name VARCHAR(120),
    responded_by_email VARCHAR(255),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inactivity_student ON student_inactivity_reasons(student_id);
CREATE INDEX IF NOT EXISTS idx_inactivity_status ON student_inactivity_reasons(status);

-- ==============================================================================
-- 12. ACADEMIC MESSAGES & COMMUNICATION TABLE (FACULTY ↔️ STUDENT)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS student_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sender_name VARCHAR(120) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    sender_role user_role NOT NULL,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_name VARCHAR(120) NOT NULL,
    receiver_email VARCHAR(255) NOT NULL,
    subject VARCHAR(200),
    content TEXT NOT NULL,
    related_assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
    related_reason_id UUID REFERENCES student_inactivity_reasons(id) ON DELETE SET NULL,
    in_reply_to UUID REFERENCES student_messages(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_receiver ON student_messages(receiver_id, is_read);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON student_messages(sender_id);

-- ==============================================================================
-- 13. RLS POLICIES FOR ACADEMIC MANAGEMENT TABLES
-- ==============================================================================

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_inactivity_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_messages ENABLE ROW LEVEL SECURITY;

-- Assignments Policies
DROP POLICY IF EXISTS "Students read published assignments" ON assignments;
CREATE POLICY "Students read published assignments" ON assignments
    FOR SELECT USING (
        is_published = TRUE OR 
        creator_id = auth.uid() OR 
        get_auth_user_role() IN ('faculty', 'admin')
    );

DROP POLICY IF EXISTS "Faculty manage assignments" ON assignments;
CREATE POLICY "Faculty manage assignments" ON assignments
    FOR ALL USING (
        get_auth_user_role() IN ('faculty', 'admin') AND 
        (creator_id = auth.uid() OR get_auth_user_role() = 'admin')
    );

-- Assignment Submissions Policies
DROP POLICY IF EXISTS "Students read own submissions" ON assignment_submissions;
CREATE POLICY "Students read own submissions" ON assignment_submissions
    FOR SELECT USING (
        student_id = auth.uid() OR 
        get_auth_user_role() IN ('faculty', 'admin')
    );

DROP POLICY IF EXISTS "Students insert own submissions" ON assignment_submissions;
CREATE POLICY "Students insert own submissions" ON assignment_submissions
    FOR INSERT WITH CHECK (
        student_id = auth.uid() AND 
        get_auth_user_role() = 'student'
    );

DROP POLICY IF EXISTS "Faculty grade assignment submissions" ON assignment_submissions;
CREATE POLICY "Faculty grade assignment submissions" ON assignment_submissions
    FOR UPDATE USING (
        get_auth_user_role() IN ('faculty', 'admin')
    );

-- Student Inactivity Reasons Policies
DROP POLICY IF EXISTS "Students read own inactivity reasons" ON student_inactivity_reasons;
CREATE POLICY "Students read own inactivity reasons" ON student_inactivity_reasons
    FOR SELECT USING (
        student_id = auth.uid() OR 
        get_auth_user_role() IN ('faculty', 'admin')
    );

DROP POLICY IF EXISTS "Students submit inactivity reasons" ON student_inactivity_reasons;
CREATE POLICY "Students submit inactivity reasons" ON student_inactivity_reasons
    FOR INSERT WITH CHECK (
        student_id = auth.uid()
    );

DROP POLICY IF EXISTS "Faculty respond to inactivity reasons" ON student_inactivity_reasons;
CREATE POLICY "Faculty respond to inactivity reasons" ON student_inactivity_reasons
    FOR UPDATE USING (
        get_auth_user_role() IN ('faculty', 'admin')
    );

-- Student Messages Policies
DROP POLICY IF EXISTS "Users read own messages" ON student_messages;
CREATE POLICY "Users read own messages" ON student_messages
    FOR SELECT USING (
        sender_id = auth.uid() OR 
        receiver_id = auth.uid() OR 
        get_auth_user_role() = 'admin'
    );

DROP POLICY IF EXISTS "Users send messages" ON student_messages;
CREATE POLICY "Users send messages" ON student_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() OR
        get_auth_user_role() = 'admin'
    );

