-- =============================================================================
-- MSOT LEARN — ANTI-CHEATING & AUDIT SYSTEM SCHEMA
-- Production-Ready Security, Explainable Flags, Fair Review & XP Adjustments
-- =============================================================================

-- 1. Detection Rule Configurations (Configurable by Admin)
CREATE TABLE IF NOT EXISTS integrity_rule_configs (
    rule_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    risk_weight TEXT DEFAULT 'MEDIUM' CHECK (risk_weight IN ('LOW', 'MEDIUM', 'HIGH')),
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_by TEXT DEFAULT 'system_admin',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Configurable Rules
INSERT INTO integrity_rule_configs (rule_id, name, description, is_enabled, risk_weight, parameters, updated_by)
VALUES 
    (
        'RULE_FAST_SOLVE',
        'Unusually Fast Question Completion',
        'Detects questions solved significantly faster than calibrated difficulty baseline. Evaluates question type, prior attempts, and trusted timestamps.',
        true,
        'MEDIUM',
        '{
            "threshold_easy_ms": 3000,
            "threshold_medium_ms": 7000,
            "threshold_hard_ms": 15000,
            "min_confidence_confidence_req": true,
            "familiar_question_discount_pct": 50
        }'::jsonb,
        'system_init'
    ),
    (
        'RULE_SUBMISSION_SPAM',
        'Submission Flood & Rate Abuse',
        'Detects excessive rapid submission attempts and automated spam cycles designed to overwhelm evaluation gates.',
        true,
        'HIGH',
        '{
            "max_submissions_window_sec": 15,
            "max_submissions_count": 10,
            "duplicate_payload_limit": 4
        }'::jsonb,
        'system_init'
    ),
    (
        'RULE_XP_MANIPULATION',
        'XP Award & Replay Exploit Detection',
        'Detects replayed transaction tokens, duplicate claims for the same event, and mathematical XP surges inconsistent with learning activity.',
        true,
        'HIGH',
        '{
            "max_hourly_xp_gain": 2000,
            "prevent_duplicate_event_tokens": true,
            "require_transaction_idempotency": true
        }'::jsonb,
        'system_init'
    ),
    (
        'RULE_SESSION_ANOMALY',
        'Timer & Study Session Anomaly',
        'Detects negative or impossible durations, overlapping multi-platform study sessions, and client-server clock desynchronization.',
        true,
        'MEDIUM',
        '{
            "max_single_session_hours": 12,
            "max_allowed_clock_skew_ms": 300000,
            "flag_overlapping_sessions": true
        }'::jsonb,
        'system_init'
    )
ON CONFLICT (rule_id) DO NOTHING;

-- 2. Learning & System Events Log (Privacy-conscious audit trace)
CREATE TABLE IF NOT EXISTS integrity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    student_name TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'QUESTION_START', 'QUESTION_SUBMIT', 'QUESTION_SOLVED', 'SOLUTION_VERIFIED',
        'ATTEMPT_FAILED', 'XP_AWARDED', 'XP_DEDUCTED', 'SESSION_START', 'SESSION_PAUSE',
        'SESSION_RESUME', 'SESSION_FINISH', 'REWARD_PURCHASE', 'REWARD_CONSUME', 'DUPLICATE_REQUEST'
    )),
    source_id TEXT,
    duration_ms INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integrity_events_student ON integrity_events(student_id);
CREATE INDEX IF NOT EXISTS idx_integrity_events_type ON integrity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_integrity_events_created ON integrity_events(created_at DESC);

-- 3. Reviewable Integrity Flags (Signals for investigation, not proof of guilt)
CREATE TABLE IF NOT EXISTS integrity_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_code TEXT NOT NULL UNIQUE,
    student_id TEXT NOT NULL,
    student_name TEXT,
    student_email TEXT,
    event_id TEXT,
    session_id TEXT,
    rule_id TEXT NOT NULL REFERENCES integrity_rule_configs(rule_id),
    rule_version TEXT DEFAULT '1.0',
    risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    reason TEXT NOT NULL,
    expected_behavior TEXT NOT NULL,
    actual_behavior TEXT NOT NULL,
    evidence JSONB DEFAULT '{}'::jsonb,
    related_tx_id TEXT,
    review_status TEXT DEFAULT 'PENDING' CHECK (review_status IN ('PENDING', 'UNDER_REVIEW', 'DISMISSED', 'RESOLVED', 'ESCALATED')),
    assigned_reviewer TEXT,
    review_notes TEXT,
    final_decision TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integrity_flags_student ON integrity_flags(student_id);
CREATE INDEX IF NOT EXISTS idx_integrity_flags_status ON integrity_flags(review_status);
CREATE INDEX IF NOT EXISTS idx_integrity_flags_risk ON integrity_flags(risk_level);
CREATE INDEX IF NOT EXISTS idx_integrity_flags_rule ON integrity_flags(rule_id);

-- 4. Immutable Review Decisions & Audit Trail
CREATE TABLE IF NOT EXISTS integrity_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_id UUID REFERENCES integrity_flags(id) ON DELETE CASCADE,
    reviewer_id TEXT NOT NULL,
    reviewer_name TEXT NOT NULL,
    reviewer_role TEXT NOT NULL CHECK (reviewer_role IN ('FACULTY', 'ADMIN')),
    decision TEXT NOT NULL CHECK (decision IN (
        'UNDER_REVIEW', 'DISMISSED_FALSE_POSITIVE', 'TECHNICAL_ISSUE',
        'CONFIRMED_VIOLATION', 'ESCALATED_TO_ADMIN', 'REJECT_APPEAL', 'UPHOLD_APPEAL'
    )),
    decision_reason TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integrity_reviews_flag ON integrity_reviews(flag_id);

-- 5. Permission-Controlled Faculty XP Adjustments (Atomic & Auditable)
CREATE TABLE IF NOT EXISTS xp_adjustment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_code TEXT NOT NULL UNIQUE,
    student_id TEXT NOT NULL,
    student_name TEXT,
    case_id TEXT,
    action_type TEXT NOT NULL CHECK (action_type IN ('AWARD', 'DEDUCT', 'REVERSE')),
    xp_amount INTEGER NOT NULL CHECK (xp_amount > 0),
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reason TEXT NOT NULL,
    requested_by TEXT NOT NULL,
    requested_by_name TEXT,
    requested_by_role TEXT NOT NULL CHECK (requested_by_role IN ('FACULTY', 'ADMIN')),
    status TEXT DEFAULT 'APPLIED' CHECK (status IN ('PENDING_ADMIN_APPROVAL', 'APPLIED', 'REJECTED')),
    approved_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_adjustments_student ON xp_adjustment_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_xp_adjustments_case ON xp_adjustment_requests(case_id);

-- 6. Student Fairness & Appeals Table
CREATE TABLE IF NOT EXISTS student_appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    student_name TEXT,
    explanation TEXT NOT NULL,
    supporting_context TEXT,
    status TEXT DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'IN_REVIEW', 'UPHELD', 'OVERTURNED')),
    reviewer_notes TEXT,
    resolved_by TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_appeals_student ON student_appeals(student_id);
CREATE INDEX IF NOT EXISTS idx_student_appeals_flag ON student_appeals(flag_id);

-- 7. Row Level Security Policies
ALTER TABLE integrity_rule_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrity_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrity_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_adjustment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_appeals ENABLE ROW LEVEL SECURITY;

-- Rule Configs: Read by all authenticated users, modified only by Admins
CREATE POLICY "Rule configs are viewable by authenticated users"
    ON integrity_rule_configs FOR SELECT
    TO authenticated
    USING (true);

-- Flags: Students can view flags concerning themselves only; Faculty and Admins view all
CREATE POLICY "Students see own flags; Faculty and Admin see all"
    ON integrity_flags FOR SELECT
    TO authenticated
    USING (
        auth.uid()::text = student_id OR
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('FACULTY', 'ADMIN')
        )
    );

-- Appeals: Students view/insert own appeals; Faculty and Admin manage all
CREATE POLICY "Students can view and create own appeals"
    ON student_appeals FOR SELECT
    TO authenticated
    USING (
        auth.uid()::text = student_id OR
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('FACULTY', 'ADMIN')
        )
    );

CREATE POLICY "Students can submit own appeals"
    ON student_appeals FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::text = student_id);

-- XP Adjustments: Viewable by affected student, Faculty, and Admin
CREATE POLICY "XP adjustments viewable by student, faculty, admin"
    ON xp_adjustment_requests FOR SELECT
    TO authenticated
    USING (
        auth.uid()::text = student_id OR
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('FACULTY', 'ADMIN')
        )
    );
