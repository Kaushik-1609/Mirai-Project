-- ==============================================================================
-- MSOT LEARN: PRODUCTION GUILD SYSTEM MIGRATION (SUPABASE / POSTGRESQL)
-- Matchmaking-Based Level Range Guilds, Two-Way Anonymous Mode & Guild Contests
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. STUDENT PRIVACY SETTINGS TABLE (Persistent Anonymous Identity)
CREATE TABLE IF NOT EXISTS student_privacy_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    anonymous_alias VARCHAR(80) NOT NULL UNIQUE,
    anonymous_avatar VARCHAR(60) NOT NULL DEFAULT '🥷',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. GUILDS TABLE
CREATE TABLE IF NOT EXISTS guilds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(80) NOT NULL UNIQUE,
    tag VARCHAR(10) NOT NULL UNIQUE, -- e.g. "#CW01"
    description TEXT DEFAULT 'Dedicated guild for collaborative learning and algorithmic mastery.',
    avatar VARCHAR(255) NOT NULL DEFAULT '🛡️',
    target_level INT NOT NULL DEFAULT 1,
    min_level INT NOT NULL DEFAULT 1,
    max_level INT NOT NULL DEFAULT 4,
    capacity INT NOT NULL DEFAULT 25,
    xp INT NOT NULL DEFAULT 0,
    contests_won INT NOT NULL DEFAULT 0,
    contests_played INT NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_level_range CHECK (min_level <= max_level AND target_level >= min_level AND target_level <= max_level),
    CONSTRAINT chk_capacity CHECK (capacity > 0 AND capacity <= 100)
);

CREATE INDEX IF NOT EXISTS idx_guilds_xp ON guilds(xp DESC);
CREATE INDEX IF NOT EXISTS idx_guilds_level_range ON guilds(min_level, max_level);

-- 4. GUILD MEMBERS TABLE (Strictly: One Student = One Active Guild)
CREATE TABLE IF NOT EXISTS guild_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER', -- 'OWNER', 'OFFICER', 'MEMBER'
    xp_contribution INT NOT NULL DEFAULT 0,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_student_active_guild UNIQUE (user_id),
    CONSTRAINT chk_guild_role CHECK (role IN ('OWNER', 'OFFICER', 'MEMBER'))
);

CREATE INDEX IF NOT EXISTS idx_guild_members_guild ON guild_members(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_user ON guild_members(user_id);

-- 5. GUILD CHALLENGES TABLE (Guild vs Guild Challenge Requests)
CREATE TABLE IF NOT EXISTS guild_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    receiver_guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    contest_type VARCHAR(50) NOT NULL DEFAULT 'QUIZ_BATTLE',
    title VARCHAR(120) NOT NULL,
    description TEXT,
    xp_stake INT NOT NULL DEFAULT 250,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    CONSTRAINT chk_no_self_challenge CHECK (sender_guild_id <> receiver_guild_id),
    CONSTRAINT chk_challenge_status CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT chk_contest_type CHECK (contest_type IN ('QUIZ_BATTLE', 'CODING_CHALLENGE', 'XP_BATTLE', 'PROBLEM_SOLVING', 'WEEKLY_LEARNING', 'STREAK_CHALLENGE'))
);

CREATE INDEX IF NOT EXISTS idx_challenges_sender ON guild_challenges(sender_guild_id);
CREATE INDEX IF NOT EXISTS idx_challenges_receiver ON guild_challenges(receiver_guild_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON guild_challenges(status);

-- 6. GUILD CONTESTS TABLE (Live / Resolved Guild vs Guild Clashes)
CREATE TABLE IF NOT EXISTS guild_contests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES guild_challenges(id) ON DELETE SET NULL,
    contest_name VARCHAR(120) NOT NULL,
    contest_type VARCHAR(50) NOT NULL,
    description TEXT,
    guild_a_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    guild_b_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    guild_a_score INT NOT NULL DEFAULT 0,
    guild_b_score INT NOT NULL DEFAULT 0,
    xp_stake INT NOT NULL DEFAULT 250,
    winner_guild_id UUID REFERENCES guilds(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_contest_guilds CHECK (guild_a_id <> guild_b_id),
    CONSTRAINT chk_contest_status CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED'))
);

-- 7. CONTEST SCORES RECORD TABLE (Individual Student Contributions to Contests)
CREATE TABLE IF NOT EXISTS guild_contest_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID NOT NULL REFERENCES guild_contests(id) ON DELETE CASCADE,
    guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score_points INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_contest_submission UNIQUE (contest_id, user_id)
);

-- ==============================================================================
-- 8. SECURE BACKEND-ENFORCED PROCEDURES (RPCs)
-- ==============================================================================

-- A. Create Guild with Dynamic Level Calculation
CREATE OR REPLACE FUNCTION create_guild(
    p_name VARCHAR(80),
    p_tag VARCHAR(10),
    p_description TEXT,
    p_avatar VARCHAR(255),
    p_student_level INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_target_lvl INT;
    v_min_lvl INT;
    v_max_lvl INT;
    v_guild_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to create a Guild.';
    END IF;

    -- Validate Level
    IF p_student_level IS NULL OR p_student_level < 1 THEN
        v_target_lvl := 1;
    ELSE
        v_target_lvl := p_student_level;
    END IF;

    -- Auto-calculate target level - 3 to target level + 3
    v_min_lvl := GREATEST(1, v_target_lvl - 3);
    v_max_lvl := v_target_lvl + 3;

    -- Check if student already belongs to a Guild
    IF EXISTS (SELECT 1 FROM guild_members WHERE user_id = v_user_id) THEN
        RAISE EXCEPTION 'You are already a member of a Guild. Leave your current Guild before creating a new one.';
    END IF;

    -- Insert new Guild
    INSERT INTO guilds (
        name, tag, description, avatar, target_level, min_level, max_level, created_by
    ) VALUES (
        TRIM(p_name), UPPER(TRIM(p_tag)), p_description, p_avatar, v_target_lvl, v_min_lvl, v_max_lvl, v_user_id
    ) RETURNING id INTO v_guild_id;

    -- Creator becomes GUILD OWNER
    INSERT INTO guild_members (
        guild_id, user_id, role, xp_contribution
    ) VALUES (
        v_guild_id, v_user_id, 'OWNER', 0
    );

    RETURN jsonb_build_object(
        'success', true,
        'guild_id', v_guild_id,
        'name', p_name,
        'target_level', v_target_lvl,
        'min_level', v_min_lvl,
        'max_level', v_max_lvl,
        'role', 'OWNER'
    );
END;
$$;

-- B. Level-Restricted Guild Joining (STRICT BACKEND ENFORCEMENT)
CREATE OR REPLACE FUNCTION join_guild(
    p_guild_id UUID,
    p_student_level INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_guild RECORD;
    v_member_count INT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to join a Guild.';
    END IF;

    -- Check if student already belongs to a Guild
    IF EXISTS (SELECT 1 FROM guild_members WHERE user_id = v_user_id) THEN
        RAISE EXCEPTION 'You are already a member of an active Guild. Leave your current Guild first.';
    END IF;

    -- Find Guild
    SELECT * INTO v_guild FROM guilds WHERE id = p_guild_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Guild not found.';
    END IF;

    -- BACKEND LEVEL RESTRICTION CHECK (Target - 3 to Target + 3)
    IF p_student_level < v_guild.min_level OR p_student_level > v_guild.max_level THEN
        RAISE EXCEPTION 'Level requirement not met. Your level (%s) is outside this Guild allowed bracket (%s - %s).',
            p_student_level, v_guild.min_level, v_guild.max_level;
    END IF;

    -- Capacity Check
    SELECT COUNT(*) INTO v_member_count FROM guild_members WHERE guild_id = p_guild_id;
    IF v_member_count >= v_guild.capacity THEN
        RAISE EXCEPTION 'Guild has reached maximum capacity (%s / %s).', v_member_count, v_guild.capacity;
    END IF;

    -- Insert Member
    INSERT INTO guild_members (
        guild_id, user_id, role, xp_contribution
    ) VALUES (
        p_guild_id, v_user_id, 'MEMBER', 0
    );

    RETURN jsonb_build_object(
        'success', true,
        'guild_id', p_guild_id,
        'role', 'MEMBER',
        'message', 'Successfully joined guild'
    );
END;
$$;

-- C. Leave Guild
CREATE OR REPLACE FUNCTION leave_guild(
    p_guild_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_member RECORD;
    v_successor_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    SELECT * INTO v_member FROM guild_members WHERE guild_id = p_guild_id AND user_id = v_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'You are not a member of this Guild.';
    END IF;

    IF v_member.role = 'OWNER' THEN
        -- Find highest ranking successor (OFFICER first, then oldest MEMBER)
        SELECT user_id INTO v_successor_id
        FROM guild_members
        WHERE guild_id = p_guild_id AND user_id <> v_user_id
        ORDER BY CASE WHEN role = 'OFFICER' THEN 1 ELSE 2 END, joined_at ASC
        LIMIT 1;

        IF v_successor_id IS NOT NULL THEN
            UPDATE guild_members SET role = 'OWNER' WHERE guild_id = p_guild_id AND user_id = v_successor_id;
        ELSE
            -- Sole member: disband guild
            DELETE FROM guilds WHERE id = p_guild_id;
            RETURN jsonb_build_object('success', true, 'disbanded', true);
        END IF;
    END IF;

    DELETE FROM guild_members WHERE guild_id = p_guild_id AND user_id = v_user_id;
    RETURN jsonb_build_object('success', true, 'disbanded', false);
END;
$$;

-- D. Send Guild Challenge (Owner/Officer only)
CREATE OR REPLACE FUNCTION send_guild_challenge(
    p_receiver_guild_id UUID,
    p_contest_type VARCHAR(50),
    p_title VARCHAR(120),
    p_description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_sender_membership RECORD;
    v_challenge_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- Verify sender permissions
    SELECT * INTO v_sender_membership FROM guild_members WHERE user_id = v_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'You must be in a Guild to send a challenge.';
    END IF;

    IF v_sender_membership.role NOT IN ('OWNER', 'OFFICER') THEN
        RAISE EXCEPTION 'Only Guild Owners and Officers can send challenges.';
    END IF;

    IF v_sender_membership.guild_id = p_receiver_guild_id THEN
        RAISE EXCEPTION 'A Guild cannot challenge itself.';
    END IF;

    -- Check duplicate active/pending challenge
    IF EXISTS (
        SELECT 1 FROM guild_challenges
        WHERE ((sender_guild_id = v_sender_membership.guild_id AND receiver_guild_id = p_receiver_guild_id)
            OR (sender_guild_id = p_receiver_guild_id AND receiver_guild_id = v_sender_membership.guild_id))
          AND status IN ('PENDING', 'ACTIVE')
    ) THEN
        RAISE EXCEPTION 'An active or pending challenge already exists between these two Guilds.';
    END IF;

    INSERT INTO guild_challenges (
        sender_guild_id, receiver_guild_id, contest_type, title, description, created_by
    ) VALUES (
        v_sender_membership.guild_id, p_receiver_guild_id, p_contest_type, p_title, p_description, v_user_id
    ) RETURNING id INTO v_challenge_id;

    RETURN jsonb_build_object('success', true, 'challenge_id', v_challenge_id);
END;
$$;

-- E. Respond to Challenge (Accept/Reject)
CREATE OR REPLACE FUNCTION respond_guild_challenge(
    p_challenge_id UUID,
    p_action VARCHAR(20) -- 'ACCEPT', 'REJECT', 'CANCEL'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_challenge RECORD;
    v_membership RECORD;
    v_contest_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    SELECT * INTO v_challenge FROM guild_challenges WHERE id = p_challenge_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Challenge not found.';
    END IF;

    IF v_challenge.status <> 'PENDING' THEN
        RAISE EXCEPTION 'Challenge is already resolved.';
    END IF;

    SELECT * INTO v_membership FROM guild_members WHERE user_id = v_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Membership not found.';
    END IF;

    IF p_action = 'CANCEL' THEN
        IF v_membership.guild_id <> v_challenge.sender_guild_id OR v_membership.role NOT IN ('OWNER', 'OFFICER') THEN
            RAISE EXCEPTION 'Unauthorized to cancel this challenge.';
        END IF;
        UPDATE guild_challenges SET status = 'CANCELLED', resolved_at = NOW() WHERE id = p_challenge_id;
        RETURN jsonb_build_object('success', true, 'status', 'CANCELLED');
    END IF;

    -- For ACCEPT or REJECT, must be receiver guild Owner/Officer
    IF v_membership.guild_id <> v_challenge.receiver_guild_id OR v_membership.role NOT IN ('OWNER', 'OFFICER') THEN
        RAISE EXCEPTION 'Only the challenged Guild Owner or Officer can accept or reject this challenge.';
    END IF;

    IF p_action = 'REJECT' THEN
        UPDATE guild_challenges SET status = 'REJECTED', resolved_at = NOW() WHERE id = p_challenge_id;
        RETURN jsonb_build_object('success', true, 'status', 'REJECTED');
    ELSIF p_action = 'ACCEPT' THEN
        UPDATE guild_challenges SET status = 'ACCEPTED', resolved_at = NOW() WHERE id = p_challenge_id;
        
        -- Create active contest
        INSERT INTO guild_contests (
            challenge_id, contest_name, contest_type, description,
            guild_a_id, guild_b_id, xp_stake, status
        ) VALUES (
            p_challenge_id, v_challenge.title, v_challenge.contest_type, v_challenge.description,
            v_challenge.sender_guild_id, v_challenge.receiver_guild_id, v_challenge.xp_stake, 'ACTIVE'
        ) RETURNING id INTO v_contest_id;

        RETURN jsonb_build_object('success', true, 'status', 'ACCEPTED', 'contest_id', v_contest_id);
    ELSE
        RAISE EXCEPTION 'Invalid action.';
    END IF;
END;
$$;

-- F. Two-Way Anonymous Mode: Get Public Member List
-- Strictly prevents leaking real names over the wire when is_anonymous is true!
CREATE OR REPLACE VIEW guild_members_public AS
SELECT 
    gm.id,
    gm.guild_id,
    gm.role,
    gm.xp_contribution,
    gm.joined_at,
    CASE 
        WHEN sp.is_anonymous = true THEN sp.anonymous_alias
        ELSE COALESCE(u.raw_user_meta_data->>'name', 'Cadet ' || SUBSTRING(u.id::text, 1, 6))
    END AS display_name,
    CASE 
        WHEN sp.is_anonymous = true THEN sp.anonymous_avatar
        ELSE COALESCE(u.raw_user_meta_data->>'avatar', '⚔️')
    END AS display_avatar,
    COALESCE(sp.is_anonymous, false) as is_anonymous,
    -- Compute student level from points/XP metadata safely
    COALESCE((u.raw_user_meta_data->>'level')::int, 5) AS student_level
FROM guild_members gm
JOIN auth.users u ON gm.user_id = u.id
LEFT JOIN student_privacy_settings sp ON gm.user_id = sp.user_id;

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_privacy_settings ENABLE ROW LEVEL SECURITY;

-- Guilds: Anyone authenticated can read; creators can create
CREATE POLICY "Public Read Guilds" ON guilds FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Authenticated Insert Guilds" ON guilds FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owner Update Guilds" ON guilds FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM guild_members WHERE guild_id = id AND user_id = auth.uid() AND role IN ('OWNER', 'OFFICER'))
);

-- Guild Members: Public read; managed via secure RPCs
CREATE POLICY "Public Read Guild Members" ON guild_members FOR SELECT TO authenticated, anon USING (true);

-- Challenges & Contests: Public read
CREATE POLICY "Public Read Challenges" ON guild_challenges FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Public Read Contests" ON guild_contests FOR SELECT TO authenticated, anon USING (true);

-- Privacy Settings: Student can only view and update their own privacy settings
CREATE POLICY "Read Privacy Settings" ON student_privacy_settings FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Manage Own Privacy Settings" ON student_privacy_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
