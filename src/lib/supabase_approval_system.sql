-- ==============================================================================
-- SUPABASE POSTGRESQL MIGRATION: ROLE-BASED ADMIN APPROVAL & NOTIFICATION SYSTEM
-- Features:
--   1. Approval status lifecycle: 'pending', 'approved', 'rejected', 'suspended'
--   2. Strict role protection: Users cannot self-assign Admin or change own role/status
--   3. Persistent Admin Notifications for new Student/Faculty registrations
--   4. Stored Procedure for atomic Admin Approval / Rejection with Audit Logging
--   5. Row Level Security (RLS) policies enforcing role boundaries
-- ==============================================================================

-- 1. Ensure required ENUMs or Column Constraints
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'faculty', 'student');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
        CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
    ELSE
        -- Add 'pending' to account_status enum if not present
        BEGIN
            ALTER TYPE account_status ADD VALUE IF NOT EXISTS 'pending';
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    END IF;
END $$;

-- 2. Extend Profiles Table with Approval Columns
ALTER TABLE IF EXISTS profiles
    ADD COLUMN IF NOT EXISTS approval_status VARCHAR(40) NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS requested_role user_role NOT NULL DEFAULT 'student',
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_profiles_requested_role ON profiles(requested_role);

-- Ensure existing seed admin and faculty accounts are marked APPROVED
UPDATE profiles
SET approval_status = 'approved',
    status = 'active'
WHERE email IN (
    'admin@msot.edu',
    'utkarshraj142006@gmail.com',
    'faculty@msot.edu',
    'student@msot.edu',
    'harsh5217a@gmail.com',
    'billiff98015@gmail.com'
) OR role = 'admin';

-- 3. Admin Notifications Table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    user_name VARCHAR(120) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    requested_role user_role NOT NULL DEFAULT 'student',
    notification_type VARCHAR(60) NOT NULL DEFAULT 'REGISTRATION_REQUEST',
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_user ON admin_notifications(user_id);

-- 4. Automatic Admin Notification Trigger on New Pending Profile
CREATE OR REPLACE FUNCTION notify_admin_on_new_registration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.approval_status = 'pending' THEN
        INSERT INTO admin_notifications (
            user_id,
            user_name,
            user_email,
            requested_role,
            notification_type,
            message,
            read,
            created_at
        ) VALUES (
            NEW.id,
            NEW.display_name,
            NEW.email,
            NEW.requested_role,
            'REGISTRATION_REQUEST',
            'New ' || UPPER(NEW.requested_role::text) || ' registration requires Admin approval: ' || NEW.display_name || ' (' || NEW.email || ')',
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

-- 5. Atomic Admin Approval / Rejection Stored Procedure
CREATE OR REPLACE FUNCTION admin_decide_registration(
    p_user_id UUID,
    p_decision VARCHAR(30), -- 'approve', 'reject', 'suspend', 'restore'
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_admin_id UUID;
    v_admin_role user_role;
    v_admin_email VARCHAR(255);
    v_target_profile profiles%ROWTYPE;
BEGIN
    v_admin_id := auth.uid();
    
    -- Security verification: Caller MUST be authenticated and have Admin role
    SELECT role, email INTO v_admin_role, v_admin_email
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
                'name', v_target_profile.display_name
            )
        );

        RETURN jsonb_build_object('success', TRUE, 'status', 'approved', 'role', v_target_profile.requested_role);

    ELSIF LOWER(p_decision) = 'reject' THEN
        -- Set rejected status and store optional rejection reason
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
                'name', v_target_profile.display_name
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

-- 6. Row Level Security (RLS) Policies
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can read, update, delete all notifications
DROP POLICY IF EXISTS "Admins read notifications" ON admin_notifications;
CREATE POLICY "Admins read notifications" ON admin_notifications
    FOR SELECT USING (get_auth_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins update notifications" ON admin_notifications;
CREATE POLICY "Admins update notifications" ON admin_notifications
    FOR UPDATE USING (get_auth_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins delete notifications" ON admin_notifications;
CREATE POLICY "Admins delete notifications" ON admin_notifications
    FOR DELETE USING (get_auth_user_role() = 'admin');

-- Authenticated users or security-definer triggers can insert registration notifications
DROP POLICY IF EXISTS "Users or triggers insert notifications" ON admin_notifications;
CREATE POLICY "Users or triggers insert notifications" ON admin_notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id OR get_auth_user_role() = 'admin' OR auth.uid() IS NOT NULL);

-- Strict Profile RLS: Prevent self-escalation
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        role = (SELECT role FROM profiles WHERE id = auth.uid()) AND -- Cannot change role!
        approval_status = (SELECT approval_status FROM profiles WHERE id = auth.uid()) AND -- Cannot approve self!
        status = (SELECT status FROM profiles WHERE id = auth.uid()) -- Cannot change status!
    );

DROP POLICY IF EXISTS "Admins manage all profiles" ON profiles;
CREATE POLICY "Admins manage all profiles" ON profiles
    FOR ALL USING (get_auth_user_role() = 'admin');
