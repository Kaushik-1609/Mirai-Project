-- ==============================================================================
-- SUPABASE POSTGRESQL MIGRATION: ROLE-BASED ADMIN APPROVAL & NOTIFICATION SYSTEM
-- ==============================================================================
-- Features:
--   1. Strict 3-tier Role architecture: 'admin', 'faculty', 'student'
--   2. Approval status lifecycle: 'pending', 'approved', 'rejected', 'suspended'
--   3. Public signup security: Cannot self-assign Admin or self-approve
--   4. Real-time persistent Admin Notifications for Student and Faculty signups
--   5. Stored Procedure for atomic Admin Approval, Rejection, Suspension, and Restoration
--   6. Full Row Level Security (RLS) policies enforcing role and status boundaries
-- ==============================================================================

-- 1. Ensure required ENUMs
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'faculty', 'student');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
        CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
    ELSE
        BEGIN
            ALTER TYPE account_status ADD VALUE IF NOT EXISTS 'pending';
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    END IF;
END $$;

-- 2. Ensure base profiles table exists and has all required columns
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(120),
    full_name VARCHAR(120),
    username VARCHAR(60),
    role user_role NOT NULL DEFAULT 'student',
    status account_status NOT NULL DEFAULT 'pending',
    avatar VARCHAR(255) DEFAULT '⚔️',
    student_id VARCHAR(60),
    year VARCHAR(40) DEFAULT '2nd Year',
    semester VARCHAR(40) DEFAULT 'Semester 4',
    section VARCHAR(40) DEFAULT 'Section Alpha',
    branch VARCHAR(100) DEFAULT 'Computer Science & Engineering (CSE)',
    phone VARCHAR(40),
    track VARCHAR(100) DEFAULT 'C++ Algorithms & DSA',
    approval_status VARCHAR(40) NOT NULL DEFAULT 'pending',
    requested_role user_role NOT NULL DEFAULT 'student',
    rejection_reason TEXT,
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safely extend profiles table if it already existed with partial schema
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS display_name VARCHAR(120),
    ADD COLUMN IF NOT EXISTS full_name VARCHAR(120),
    ADD COLUMN IF NOT EXISTS username VARCHAR(60),
    ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'student',
    ADD COLUMN IF NOT EXISTS status account_status NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS avatar VARCHAR(255) DEFAULT '⚔️',
    ADD COLUMN IF NOT EXISTS student_id VARCHAR(60),
    ADD COLUMN IF NOT EXISTS year VARCHAR(40) DEFAULT '2nd Year',
    ADD COLUMN IF NOT EXISTS semester VARCHAR(40) DEFAULT 'Semester 4',
    ADD COLUMN IF NOT EXISTS section VARCHAR(40) DEFAULT 'Section Alpha',
    ADD COLUMN IF NOT EXISTS branch VARCHAR(100) DEFAULT 'Computer Science & Engineering (CSE)',
    ADD COLUMN IF NOT EXISTS phone VARCHAR(40),
    ADD COLUMN IF NOT EXISTS track VARCHAR(100) DEFAULT 'C++ Algorithms & DSA',
    ADD COLUMN IF NOT EXISTS approval_status VARCHAR(40) NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS requested_role user_role NOT NULL DEFAULT 'student',
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_profiles_requested_role ON profiles(requested_role);

-- Helper function: get caller role
CREATE OR REPLACE FUNCTION get_auth_user_role()
RETURNS VARCHAR AS $$
    SELECT role::text FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_email VARCHAR(255),
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(60),
    target_id VARCHAR(255),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);

-- 4. Admin Notifications Table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    user_name VARCHAR(120) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    requested_role user_role NOT NULL DEFAULT 'student',
    notification_type VARCHAR(60) NOT NULL DEFAULT 'REGISTRATION_REQUEST',
    title VARCHAR(255) DEFAULT 'New registration requires approval.',
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_user ON admin_notifications(user_id);

-- 5. Seed default Admin and Faculty accounts as APPROVED
UPDATE profiles
SET approval_status = 'approved',
    status = 'active'
WHERE email IN (
    'admin@msot.edu',
    'utkarshraj142006@gmail.com',
    'faculty@msot.edu',
    'student@msot.edu'
) OR role = 'admin';

-- 6. Trigger: Prevent self-assignment of Admin role or Self-Approval
CREATE OR REPLACE FUNCTION protect_profile_role_and_approval()
RETURNS TRIGGER AS $$
DECLARE
    v_caller_role VARCHAR;
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Prevent public signup from assigning admin role
        IF NEW.requested_role = 'admin' OR NEW.role = 'admin' THEN
            IF auth.uid() IS NOT NULL THEN
                SELECT role::text INTO v_caller_role FROM profiles WHERE id = auth.uid();
                IF v_caller_role != 'admin' THEN
                    RAISE EXCEPTION 'Security Alert: Public users cannot create Admin accounts.';
                END IF;
            ELSE
                RAISE EXCEPTION 'Security Alert: Public users cannot create Admin accounts.';
            END IF;
        END IF;

        -- Force new public registrations to pending status
        IF NEW.approval_status IS NULL OR NEW.approval_status != 'approved' THEN
            NEW.approval_status := 'pending';
            NEW.status := 'pending';
        END IF;
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        -- Prevent non-admins from changing role or approval status
        IF auth.uid() IS NOT NULL THEN
            SELECT role::text INTO v_caller_role FROM profiles WHERE id = auth.uid();
            IF v_caller_role != 'admin' THEN
                IF NEW.role != OLD.role THEN
                    RAISE EXCEPTION 'Security Alert: You cannot modify your own role.';
                END IF;
                IF NEW.approval_status != OLD.approval_status THEN
                    RAISE EXCEPTION 'Security Alert: You cannot modify your account approval status.';
                END IF;
                IF NEW.status != OLD.status THEN
                    RAISE EXCEPTION 'Security Alert: You cannot modify your account status.';
                END IF;
            END IF;
        END IF;
        NEW.updated_at := NOW();
        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON profiles;
CREATE TRIGGER trg_protect_profile_role
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION protect_profile_role_and_approval();

-- 7. Trigger: Auto-create Admin Notification on new PENDING registration
CREATE OR REPLACE FUNCTION notify_admin_on_new_registration()
RETURNS TRIGGER AS $$
DECLARE
    v_name VARCHAR(120);
BEGIN
    IF NEW.approval_status = 'pending' THEN
        v_name := COALESCE(NEW.display_name, NEW.full_name, NEW.username, NEW.email);
        INSERT INTO admin_notifications (
            user_id,
            user_name,
            user_email,
            requested_role,
            notification_type,
            title,
            message,
            read,
            created_at
        ) VALUES (
            NEW.id,
            v_name,
            NEW.email,
            NEW.requested_role,
            'REGISTRATION_REQUEST',
            'New ' || UPPER(NEW.requested_role::text) || ' registration requires approval.',
            v_name || ' (' || NEW.email || ') submitted registration for ' || UPPER(NEW.requested_role::text) || ' role and is awaiting administrative verification.',
            FALSE,
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_admin_on_registration ON profiles;
CREATE TRIGGER trg_notify_admin_on_registration
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION notify_admin_on_new_registration();

-- 8. Stored Procedure: Admin Decision on Registration (Approve, Reject, Suspend, Restore)
CREATE OR REPLACE FUNCTION admin_decide_registration(
    p_user_id UUID,
    p_decision VARCHAR(30), -- 'approve', 'reject', 'suspend', 'restore'
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_admin_id UUID;
    v_admin_role VARCHAR;
    v_admin_email VARCHAR(255);
    v_target_profile profiles%ROWTYPE;
BEGIN
    v_admin_id := auth.uid();
    
    -- Security verification: Caller MUST be authenticated and have Admin role
    SELECT role::text, email INTO v_admin_role, v_admin_email
    FROM profiles
    WHERE id = v_admin_id;

    IF v_admin_role != 'admin' THEN
        RAISE EXCEPTION 'Access Denied: Only platform Administrators can approve or reject registrations.';
    END IF;

    -- Fetch target candidate
    SELECT * INTO v_target_profile
    FROM profiles
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Registration candidate profile not found for ID: %', p_user_id;
    END IF;

    IF LOWER(p_decision) = 'approve' THEN
        -- Assign requested role, set active status, timestamp decision
        UPDATE profiles
        SET role = v_target_profile.requested_role,
            status = 'active',
            approval_status = 'approved',
            rejection_reason = NULL,
            approved_at = NOW(),
            approved_by = v_admin_id,
            updated_at = NOW()
        WHERE id = p_user_id;

        -- Mark associated notification as read
        UPDATE admin_notifications
        SET read = TRUE,
            read_at = NOW()
        WHERE user_id = p_user_id;

        -- Record in audit log
        INSERT INTO audit_logs (actor_id, actor_email, actor_role, action, target_type, target_id, details)
        VALUES (
            v_admin_id,
            v_admin_email,
            'admin',
            'ADMIN_APPROVE_REGISTRATION',
            'profile',
            p_user_id::text,
            jsonb_build_object(
                'approved_role', v_target_profile.requested_role,
                'email', v_target_profile.email,
                'name', COALESCE(v_target_profile.display_name, v_target_profile.full_name)
            )
        );

        RETURN jsonb_build_object('success', TRUE, 'status', 'approved', 'role', v_target_profile.requested_role);

    ELSIF LOWER(p_decision) = 'reject' THEN
        -- Set rejected status and store rejection reason
        UPDATE profiles
        SET status = 'inactive',
            approval_status = 'rejected',
            rejection_reason = COALESCE(p_reason, 'Registration not approved by Administrator'),
            updated_at = NOW()
        WHERE id = p_user_id;

        -- Mark notification as read
        UPDATE admin_notifications
        SET read = TRUE,
            read_at = NOW()
        WHERE user_id = p_user_id;

        -- Record in audit log
        INSERT INTO audit_logs (actor_id, actor_email, actor_role, action, target_type, target_id, details)
        VALUES (
            v_admin_id,
            v_admin_email,
            'admin',
            'ADMIN_REJECT_REGISTRATION',
            'profile',
            p_user_id::text,
            jsonb_build_object(
                'reason', p_reason,
                'email', v_target_profile.email,
                'name', COALESCE(v_target_profile.display_name, v_target_profile.full_name)
            )
        );

        RETURN jsonb_build_object('success', TRUE, 'status', 'rejected', 'reason', p_reason);

    ELSIF LOWER(p_decision) = 'suspend' THEN
        UPDATE profiles
        SET status = 'suspended',
            approval_status = 'suspended',
            updated_at = NOW()
        WHERE id = p_user_id;

        INSERT INTO audit_logs (actor_id, actor_email, actor_role, action, target_type, target_id, details)
        VALUES (
            v_admin_id,
            v_admin_email,
            'admin',
            'ADMIN_SUSPEND_ACCOUNT',
            'profile',
            p_user_id::text,
            jsonb_build_object('email', v_target_profile.email)
        );

        RETURN jsonb_build_object('success', TRUE, 'status', 'suspended');

    ELSIF LOWER(p_decision) = 'restore' THEN
        UPDATE profiles
        SET status = 'active',
            approval_status = 'approved',
            updated_at = NOW()
        WHERE id = p_user_id;

        INSERT INTO audit_logs (actor_id, actor_email, actor_role, action, target_type, target_id, details)
        VALUES (
            v_admin_id,
            v_admin_email,
            'admin',
            'ADMIN_RESTORE_ACCOUNT',
            'profile',
            p_user_id::text,
            jsonb_build_object('email', v_target_profile.email)
        );

        RETURN jsonb_build_object('success', TRUE, 'status', 'approved');

    ELSE
        RAISE EXCEPTION 'Invalid decision action: %. Allowed: approve, reject, suspend, restore', p_decision;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
DROP POLICY IF EXISTS "Profiles read access" ON profiles;
CREATE POLICY "Profiles read access" ON profiles
    FOR SELECT USING (
        status = 'active' OR
        auth.uid() = id OR
        get_auth_user_role() = 'admin'
    );

DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
CREATE POLICY "Users insert own profile" ON profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id AND
        role != 'admin' AND
        approval_status = 'pending'
    );

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        role = (SELECT role FROM profiles WHERE id = auth.uid()) AND
        approval_status = (SELECT approval_status FROM profiles WHERE id = auth.uid()) AND
        status = (SELECT status FROM profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins manage all profiles" ON profiles;
CREATE POLICY "Admins manage all profiles" ON profiles
    FOR ALL USING (get_auth_user_role() = 'admin');

-- Admin Notifications RLS
DROP POLICY IF EXISTS "Admins read notifications" ON admin_notifications;
CREATE POLICY "Admins read notifications" ON admin_notifications
    FOR SELECT USING (get_auth_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins update notifications" ON admin_notifications;
CREATE POLICY "Admins update notifications" ON admin_notifications
    FOR UPDATE USING (get_auth_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins delete notifications" ON admin_notifications;
CREATE POLICY "Admins delete notifications" ON admin_notifications
    FOR DELETE USING (get_auth_user_role() = 'admin');

DROP POLICY IF EXISTS "Users or triggers insert notifications" ON admin_notifications;
CREATE POLICY "Users or triggers insert notifications" ON admin_notifications
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR
        get_auth_user_role() = 'admin' OR
        auth.uid() IS NOT NULL
    );

-- Audit Logs RLS
DROP POLICY IF EXISTS "Admins read audit logs" ON audit_logs;
CREATE POLICY "Admins read audit logs" ON audit_logs
    FOR SELECT USING (get_auth_user_role() = 'admin');

DROP POLICY IF EXISTS "Insert audit logs" ON audit_logs;
CREATE POLICY "Insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
