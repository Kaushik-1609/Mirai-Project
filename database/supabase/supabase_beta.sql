-- ==============================================================================
-- SUPABASE POSTGRESQL MIGRATION: BETA AI LEARNING COMPANION
-- Tables: beta_conversations, beta_messages
-- Features: User-scoped conversations, persistent chat history, Row Level Security
-- ==============================================================================

-- 1. Create beta_conversations Table
CREATE TABLE IF NOT EXISTS beta_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'New Learning Session',
    system_mode VARCHAR(60) NOT NULL DEFAULT 'all_in_one',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create beta_messages Table
CREATE TABLE IF NOT EXISTS beta_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES beta_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_beta_conv_user ON beta_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_beta_msg_conv ON beta_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_beta_msg_user ON beta_messages(user_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE beta_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_messages ENABLE ROW LEVEL SECURITY;

-- 5. Strict RLS Policies: Conversations
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'beta_conversations' AND policyname = 'Users can view their own beta conversations') THEN
        CREATE POLICY "Users can view their own beta conversations"
            ON beta_conversations FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'beta_conversations' AND policyname = 'Users can insert their own beta conversations') THEN
        CREATE POLICY "Users can insert their own beta conversations"
            ON beta_conversations FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'beta_conversations' AND policyname = 'Users can update their own beta conversations') THEN
        CREATE POLICY "Users can update their own beta conversations"
            ON beta_conversations FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'beta_conversations' AND policyname = 'Users can delete their own beta conversations') THEN
        CREATE POLICY "Users can delete their own beta conversations"
            ON beta_conversations FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- 6. Strict RLS Policies: Messages
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'beta_messages' AND policyname = 'Users can view their own beta messages') THEN
        CREATE POLICY "Users can view their own beta messages"
            ON beta_messages FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'beta_messages' AND policyname = 'Users can insert their own beta messages') THEN
        CREATE POLICY "Users can insert their own beta messages"
            ON beta_messages FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'beta_messages' AND policyname = 'Users can delete their own beta messages') THEN
        CREATE POLICY "Users can delete their own beta messages"
            ON beta_messages FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;
