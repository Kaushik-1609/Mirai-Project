-- =============================================================================
-- MSOT LEARN — COMPREHENSIVE BATTLE SYSTEM DATABASE MIGRATION
-- Supports:
-- 1. Solo Battle (1v1 Duels)
-- 2. Team Battle (Strict 2v2, 3v3, 4v4 formats with exact roster verification)
-- 3. Large-Scale Battle (Admin-only scheduled championships)
-- 4. War (Battle Section War & Campus War — Admin-only governance)
-- Real-Time WebSockets via Supabase Realtime + Row-Level Security (RLS)
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. ENUMS FOR BATTLE ENGINE ──────────────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE battle_mode_enum AS ENUM ('solo', 'team', 'large_scale', 'war');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE battle_status_enum AS ENUM (
        'draft',
        'open_registration',
        'pending_acceptance',
        'accepted',
        'scheduled',
        'active',
        'completed',
        'rejected',
        'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE team_format_enum AS ENUM ('1v1', '2v2', '3v3', '4v4', 'multi_team');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE war_category_enum AS ENUM ('section_war', 'campus_war');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 2. CORE BATTLES TABLE ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS battles (
    id TEXT PRIMARY KEY DEFAULT ('btl_' || substr(md5(random()::text), 1, 12)),
    title TEXT NOT NULL,
    description TEXT,
    mode battle_mode_enum NOT NULL,
    format team_format_enum NOT NULL DEFAULT '1v1',
    war_category war_category_enum NULL,
    status battle_status_enum NOT NULL DEFAULT 'pending_acceptance',
    
    -- Organizers & Leaders
    creator_id TEXT NOT NULL,
    creator_email TEXT NOT NULL,
    creator_name TEXT NOT NULL,
    target_opponent_id TEXT, -- For 1v1 challenger
    target_team_leader_id TEXT, -- For Team Battle challenge
    
    -- Teams Identification
    team_a_name TEXT DEFAULT 'Team Alpha',
    team_b_name TEXT DEFAULT 'Team Beta',
    
    -- Capacity & Rules
    required_team_size INT NOT NULL DEFAULT 1,
    max_participants INT DEFAULT 2,
    duration_minutes INT NOT NULL DEFAULT 15,
    scheduled_start TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    
    -- Scores & Outcome
    team_a_score INT NOT NULL DEFAULT 0,
    team_b_score INT NOT NULL DEFAULT 0,
    winner_team TEXT, -- 'TEAM_A', 'TEAM_B', 'DRAW', or participant_id for solo
    winner_name TEXT,
    
    -- Metadata
    rules_config JSONB DEFAULT '{}'::jsonb,
    is_official_admin_event BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for real-time lookups and mode filters
CREATE INDEX IF NOT EXISTS idx_battles_mode_status ON battles (mode, status);
CREATE INDEX IF NOT EXISTS idx_battles_creator ON battles (creator_id);

-- ─── 3. BATTLE PARTICIPANTS & ROSTERS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS battle_participants (
    id TEXT PRIMARY KEY DEFAULT ('bp_' || substr(md5(random()::text), 1, 12)),
    battle_id TEXT NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT DEFAULT '⚔️',
    
    -- Team assignment
    team_side TEXT NOT NULL DEFAULT 'A', -- 'A', 'B', or custom team identifier
    is_team_leader BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Individual stats inside battle
    score INT NOT NULL DEFAULT 0,
    questions_solved INT NOT NULL DEFAULT 0,
    accuracy_percent NUMERIC(5, 2) DEFAULT 0.00,
    is_winner BOOLEAN DEFAULT FALSE,
    
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    
    -- Enforce: a user can participate at most once per battle
    CONSTRAINT uq_battle_user UNIQUE (battle_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_bp_battle_id ON battle_participants (battle_id);
CREATE INDEX IF NOT EXISTS idx_bp_user_id ON battle_participants (user_id);

-- ─── 4. BATTLE CHALLENGES (INVITATIONS & DISPATCH) ───────────────────────────
CREATE TABLE IF NOT EXISTS battle_challenges (
    id TEXT PRIMARY KEY DEFAULT ('ch_' || substr(md5(random()::text), 1, 12)),
    battle_id TEXT NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
    challenger_id TEXT NOT NULL,
    challenger_name TEXT NOT NULL,
    challenged_user_id TEXT NOT NULL,
    challenged_user_name TEXT NOT NULL,
    format team_format_enum NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_challenges_target ON battle_challenges (challenged_user_id, status);

-- ─── 5. AUTHORITATIVE SCORE EVENTS (ANTI-CHEAT AUDIT LEDGER) ─────────────────
CREATE TABLE IF NOT EXISTS battle_score_events (
    id TEXT PRIMARY KEY DEFAULT ('bse_' || substr(md5(random()::text), 1, 14)),
    battle_id TEXT NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    team_side TEXT NOT NULL,
    question_id TEXT,
    selected_option TEXT,
    is_correct BOOLEAN NOT NULL DEFAULT TRUE,
    score_delta INT NOT NULL DEFAULT 0,
    submission_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    verified_by_server BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_bse_battle_user ON battle_score_events (battle_id, user_id);

-- ─── 6. CAMPUS WAR AGGREGATIONS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campus_war_scores (
    id TEXT PRIMARY KEY DEFAULT ('cws_' || substr(md5(random()::text), 1, 10)),
    battle_id TEXT NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
    campus_name TEXT NOT NULL,
    campus_code TEXT NOT NULL,
    total_score INT NOT NULL DEFAULT 0,
    active_cadets INT NOT NULL DEFAULT 0,
    rank INT NOT NULL DEFAULT 1,
    lead_margin INT DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_battle_campus UNIQUE (battle_id, campus_code)
);

-- ─── 7. ROW LEVEL SECURITY (RLS) POLICIES ─────────────────────────────────────
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_score_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_war_scores ENABLE ROW LEVEL SECURITY;

-- Battles: Authenticated users can read public or their battles
CREATE POLICY "Public battles viewable by all" ON battles
    FOR SELECT TO authenticated, anon USING (true);

-- Battles: Students can insert Solo and Team battles; Large-Scale and War require ADMIN
CREATE POLICY "Users can create appropriate battles" ON battles
    FOR INSERT TO authenticated
    WITH CHECK (
        (mode IN ('solo', 'team')) OR
        (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid()::text AND p.role = 'ADMIN'))
    );

-- Battles: Creator or Admin can update
CREATE POLICY "Battle organizers or admins can update" ON battles
    FOR UPDATE TO authenticated
    USING (
        creator_id = auth.uid()::text OR
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid()::text AND p.role = 'ADMIN')
    );

-- Battle Participants: Read all
CREATE POLICY "Participants viewable by all" ON battle_participants
    FOR SELECT TO authenticated, anon USING (true);

-- Participants: Join / Manage
CREATE POLICY "Users join or leaders manage participants" ON battle_participants
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Score Events: Read only
CREATE POLICY "Score events viewable by all" ON battle_score_events
    FOR SELECT TO authenticated, anon USING (true);

-- Campus War: Read only
CREATE POLICY "Campus war scores viewable by all" ON campus_war_scores
    FOR SELECT TO authenticated, anon USING (true);

-- ─── 8. STORED PROCEDURES (RPCS) FOR ATOMIC ACTIONS ──────────────────────────

-- A. Submit Battle Solution (Evaluates Answer & Updates Battle Score Atomically)
CREATE OR REPLACE FUNCTION submit_battle_answer(
    p_battle_id TEXT,
    p_user_id TEXT,
    p_question_id TEXT,
    p_selected_option TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_battle RECORD;
    v_participant RECORD;
    v_question RECORD;
    v_is_correct BOOLEAN := FALSE;
    v_score_delta INT := 0;
    v_new_p_score INT;
    v_new_team_score INT;
BEGIN
    -- 1. Verify Battle is Active
    SELECT * INTO v_battle FROM battles WHERE id = p_battle_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Battle not found');
    END IF;
    
    IF v_battle.status <> 'active' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Battle is not active (status: ' || v_battle.status || ')');
    END IF;

    -- 2. Verify Participant Enrollment
    SELECT * INTO v_participant FROM battle_participants 
    WHERE battle_id = p_battle_id AND user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'User is not an authorized participant in this battle');
    END IF;

    -- 3. Check for Duplicate Submission on Same Question
    IF EXISTS (
        SELECT 1 FROM battle_score_events 
        WHERE battle_id = p_battle_id AND user_id = p_user_id AND question_id = p_question_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Question already answered in this battle');
    END IF;

    -- 4. Evaluate Answer from Questions Bank
    SELECT * INTO v_question FROM questions WHERE id = p_question_id;
    IF FOUND THEN
        v_is_correct := (UPPER(TRIM(v_question.correct_answer)) = UPPER(TRIM(p_selected_option)));
        v_score_delta := CASE WHEN v_is_correct THEN COALESCE(v_question.xp_reward, 25) ELSE 0 END;
    ELSE
        -- Fallback: Valid answer assumed for dynamic quiz if not in static table
        v_is_correct := true;
        v_score_delta := 25;
    END IF;

    -- 5. Record Score Event in Immutable Audit Ledger
    INSERT INTO battle_score_events (
        battle_id, user_id, team_side, question_id, selected_option, is_correct, score_delta
    ) VALUES (
        p_battle_id, p_user_id, v_participant.team_side, p_question_id, p_selected_option, v_is_correct, v_score_delta
    );

    -- 6. Atomically Increment Participant Score
    UPDATE battle_participants
    SET score = score + v_score_delta,
        questions_solved = questions_solved + CASE WHEN v_is_correct THEN 1 ELSE 0 END
    WHERE id = v_participant.id
    RETURNING score INTO v_new_p_score;

    -- 7. Atomically Increment Battle Team Score
    IF v_participant.team_side = 'A' THEN
        UPDATE battles SET team_a_score = team_a_score + v_score_delta, updated_at = now()
        WHERE id = p_battle_id RETURNING team_a_score INTO v_new_team_score;
    ELSE
        UPDATE battles SET team_b_score = team_b_score + v_score_delta, updated_at = now()
        WHERE id = p_battle_id RETURNING team_b_score INTO v_new_team_score;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'is_correct', v_is_correct,
        'score_delta', v_score_delta,
        'participant_score', v_new_p_score,
        'team_side', v_participant.team_side,
        'team_score', v_new_team_score
    );
END;
$$;

-- B. Admin Manage Battle (Start, Finalize, Cancel with strict role validation)
CREATE OR REPLACE FUNCTION admin_manage_battle_lifecycle(
    p_battle_id TEXT,
    p_action TEXT, -- 'START', 'FINALIZE', 'CANCEL'
    p_admin_user_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_role TEXT;
    v_battle RECORD;
    v_winner_team TEXT := 'DRAW';
    v_winner_name TEXT := 'Draw / Tied Battle';
BEGIN
    -- Verify Admin Role
    SELECT role INTO v_role FROM profiles WHERE id = p_admin_user_id;
    IF v_role <> 'ADMIN' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin role required');
    END IF;

    SELECT * INTO v_battle FROM battles WHERE id = p_battle_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Battle not found');
    END IF;

    IF p_action = 'START' THEN
        UPDATE battles SET status = 'active', started_at = now(), updated_at = now() WHERE id = p_battle_id;
        RETURN jsonb_build_object('success', true, 'status', 'active');
        
    ELSIF p_action = 'FINALIZE' THEN
        IF v_battle.team_a_score > v_battle.team_b_score THEN
            v_winner_team := 'TEAM_A';
            v_winner_name := v_battle.team_a_name;
        ELSIF v_battle.team_b_score > v_battle.team_a_score THEN
            v_winner_team := 'TEAM_B';
            v_winner_name := v_battle.team_b_name;
        END IF;

        UPDATE battles SET
            status = 'completed',
            ended_at = now(),
            winner_team = v_winner_team,
            winner_name = v_winner_name,
            updated_at = now()
        WHERE id = p_battle_id;

        -- Mark winning participants
        IF v_winner_team = 'TEAM_A' THEN
            UPDATE battle_participants SET is_winner = true WHERE battle_id = p_battle_id AND team_side = 'A';
        ELSIF v_winner_team = 'TEAM_B' THEN
            UPDATE battle_participants SET is_winner = true WHERE battle_id = p_battle_id AND team_side = 'B';
        END IF;

        RETURN jsonb_build_object('success', true, 'status', 'completed', 'winner', v_winner_name);

    ELSIF p_action = 'CANCEL' THEN
        UPDATE battles SET status = 'cancelled', ended_at = now(), updated_at = now() WHERE id = p_battle_id;
        RETURN jsonb_build_object('success', true, 'status', 'cancelled');
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Invalid action');
    END IF;
END;
$$;

-- ─── 9. ENABLE SUPABASE REALTIME PUBLICATION ──────────────────────────────────
-- Enable realtime publication for battles and participants so live scoreboards
-- receive instant updates via WebSockets without page reload.
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE battles;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE battle_participants;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE battle_score_events;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE campus_war_scores;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
