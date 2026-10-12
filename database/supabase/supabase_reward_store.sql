-- ==============================================================================
-- SUPABASE POSTGRESQL MIGRATION: REWARD STORE & XP ECONOMY ENGINE
-- Only Eight Approved Categories:
--   1. Avatar Store (avatar)
--   2. Profile Customization (profile_customization)
--   3. XP Shield (xp_shield)
--   4. Streak Freeze (streak_freeze)
--   5. Mystery Box (mystery_box)
--   6. Elite Membership (elite_membership)
--   7. Guild Rewards (guild_rewards)
--   8. Seasonal Collectibles (seasonal_collectibles)
--
-- Security:
--   - Atomic server-side purchase transactions
--   - Strict Row Level Security (RLS) on student inventories and ledgers
--   - Idempotent purchase requests preventing double-deductions
--   - Timezone-aware (Asia/Kolkata) monthly streak freeze tracking (3 free / month)
-- ==============================================================================

-- 1. Create reward_store_items Table (Catalog)
CREATE TABLE IF NOT EXISTS reward_store_items (
    id VARCHAR(80) PRIMARY KEY,
    category VARCHAR(40) NOT NULL CHECK (category IN (
        'avatar',
        'profile_customization',
        'xp_shield',
        'streak_freeze',
        'mystery_box',
        'elite_membership',
        'guild_rewards',
        'seasonal_collectibles'
    )),
    name VARCHAR(120) NOT NULL,
    description TEXT,
    rarity VARCHAR(30) NOT NULL DEFAULT 'Common' CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Legendary')),
    xp_price INT NOT NULL CHECK (xp_price >= 0),
    asset_url TEXT,
    preview_data JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_repeatable BOOLEAN NOT NULL DEFAULT FALSE,
    seasonal_start_at TIMESTAMPTZ,
    seasonal_end_at TIMESTAMPTZ,
    mystery_box_weight INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create student_inventory Table
CREATE TABLE IF NOT EXISTS student_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id VARCHAR(80) NOT NULL REFERENCES reward_store_items(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    is_equipped BOOLEAN NOT NULL DEFAULT FALSE,
    customization_slot VARCHAR(40) DEFAULT 'none',
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT unique_user_item_slot UNIQUE (user_id, item_id)
);

-- 3. Create reward_transactions Table (Auditable Ledger)
CREATE TABLE IF NOT EXISTS reward_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key VARCHAR(120) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id VARCHAR(80) REFERENCES reward_store_items(id),
    transaction_type VARCHAR(40) NOT NULL CHECK (transaction_type IN ('PURCHASE', 'MYSTERY_BOX_OPEN', 'CONSUME', 'REFUND')),
    xp_amount INT NOT NULL,
    xp_balance_before INT NOT NULL,
    xp_balance_after INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'REFUNDED', 'FAILED')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create student_streak_freezes Table (3 Free/Month in Asia/Kolkata + Paid @ 1000 XP)
CREATE TABLE IF NOT EXISTS student_streak_freezes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    free_allowance_month VARCHAR(7) NOT NULL, -- e.g. '2026-10' in Asia/Kolkata
    free_freezes_used INT NOT NULL DEFAULT 0 CHECK (free_freezes_used BETWEEN 0 AND 3),
    paid_freezes_count INT NOT NULL DEFAULT 0 CHECK (paid_freezes_count >= 0),
    active_freeze_until TIMESTAMPTZ,
    last_activated_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create student_elite_memberships Table
CREATE TABLE IF NOT EXISTS student_elite_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    tier VARCHAR(40) NOT NULL DEFAULT 'ELITE',
    expires_at TIMESTAMPTZ, -- NULL means lifetime/permanent
    purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_store_items_cat ON reward_store_items(category, is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_user ON student_inventory(user_id, is_equipped);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON reward_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_freezes_user ON student_streak_freezes(user_id);

-- 7. Enable Row Level Security
ALTER TABLE reward_store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_streak_freezes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_elite_memberships ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies
-- Catalog: Public read-only for active items
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reward_store_items' AND policyname = 'Anyone can view active store items') THEN
        CREATE POLICY "Anyone can view active store items"
            ON reward_store_items FOR SELECT
            USING (is_active = TRUE OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
    END IF;

    -- Inventory: Students can view their own inventory
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_inventory' AND policyname = 'Users view own inventory') THEN
        CREATE POLICY "Users view own inventory"
            ON student_inventory FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    -- Inventory: Students can update equip state on their own items
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_inventory' AND policyname = 'Users update equip on own inventory') THEN
        CREATE POLICY "Users update equip on own inventory"
            ON student_inventory FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    -- Transactions: Students can view their own transactions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reward_transactions' AND policyname = 'Users view own transactions') THEN
        CREATE POLICY "Users view own transactions"
            ON reward_transactions FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    -- Streak Freezes: Students view own freeze record
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_streak_freezes' AND policyname = 'Users view own freezes') THEN
        CREATE POLICY "Users view own freezes"
            ON student_streak_freezes FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    -- Elite Memberships: Students view own membership
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_elite_memberships' AND policyname = 'Users view own membership') THEN
        CREATE POLICY "Users view own membership"
            ON student_elite_memberships FOR SELECT
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- 9. Seed Approved Catalog Items (ONLY the 8 Categories)
INSERT INTO reward_store_items (id, category, name, description, rarity, xp_price, asset_url, preview_data, is_active, is_repeatable, mystery_box_weight)
VALUES
-- 1. Avatar Store
('av_ronin_apprentice', 'avatar', 'Ronin Apprentice', 'Disciplined martial coder beginning the path of algorithms.', 'Common', 250, '🥷', '{"type":"avatar","symbol":"🥷"}'::jsonb, TRUE, FALSE, 35),
('av_cyber_shinobi', 'avatar', 'Cyber Shinobi', 'Stealthy debugger equipped with high-frequency neon katana.', 'Rare', 600, '⚡', '{"type":"avatar","symbol":"⚡"}'::jsonb, TRUE, FALSE, 25),
('av_void_samurai', 'avatar', 'Void Samurai', 'Master of low-level memory allocation and pointer discipline.', 'Epic', 1200, '⚔️', '{"type":"avatar","symbol":"⚔️"}'::jsonb, TRUE, FALSE, 15),
('av_asur_ascendant', 'avatar', 'Asur Ascendant', 'Legendary guardian crowned with ancient technological flame.', 'Legendary', 2500, '👹', '{"type":"avatar","symbol":"👹"}'::jsonb, TRUE, FALSE, 5),

-- 2. Profile Customization
('frame_neon_pulse', 'profile_customization', 'Neon Pulse Frame', 'Pulsing cyan border around your cadet dossier card.', 'Rare', 450, 'border-neon', '{"slot":"frame","cssClass":"frame-neon-pulse","borderColor":"#00f0ff"}'::jsonb, TRUE, FALSE, 25),
('frame_tokyo_gold', 'profile_customization', 'Imperial Gold Frame', 'Prestige golden filigree forged for high-ranking academy scholars.', 'Epic', 950, 'border-gold', '{"slot":"frame","cssClass":"frame-tokyo-gold","borderColor":"#f59e0b"}'::jsonb, TRUE, FALSE, 15),
('bg_cyber_matrix', 'profile_customization', 'Matrix Grid Background', 'Animated dark synthwave grid backdrop for your profile card.', 'Rare', 400, 'bg-matrix', '{"slot":"background","cssClass":"bg-cyber-matrix"}'::jsonb, TRUE, FALSE, 20),
('nameplate_glitch_chroma', 'profile_customization', 'Glitch Chroma Nameplate', 'Chromatic aberration styled nameplate banner.', 'Epic', 850, 'np-glitch', '{"slot":"nameplate","cssClass":"nameplate-glitch"}'::jsonb, TRUE, FALSE, 15),
('effect_fire_spark', 'profile_customization', 'Blazing Ember Effect', 'Subtle fiery sparks hovering over your avatar crest.', 'Legendary', 1500, 'fx-ember', '{"slot":"effect","cssClass":"effect-ember"}'::jsonb, TRUE, FALSE, 8),

-- 3. XP Shield
('shield_battle_ward_100', 'xp_shield', 'Battle XP Shield', 'Consumable ward protecting against up to 100 XP deduction in penalty-enabled matches.', 'Rare', 300, '🛡️', '{"maxProtection":100}'::jsonb, TRUE, TRUE, 25),

-- 4. Streak Freeze
('freeze_streak_token', 'streak_freeze', 'Emergency Streak Freeze', 'Purchasable after using your 3 free monthly freezes. Protects your streak for 24 hours.', 'Rare', 1000, '🧊', '{"protectionHours":24}'::jsonb, TRUE, TRUE, 20),

-- 5. Mystery Box
('box_mirai_mystery', 'mystery_box', 'Neo-Tokyo Mystery Box', 'Open to unveil a random reward from the 8 approved categories! Transparent odds disclosed.', 'Epic', 500, '🎁', '{"dropPool":"approved_categories"}'::jsonb, TRUE, TRUE, 0),

-- 6. Elite Membership
('sub_elite_pass_30d', 'elite_membership', 'Elite Scholar (30 Days)', '30-day VIP pass featuring exclusive Crown badge, Royal Violet theme, and VIP tag.', 'Epic', 1800, '👑', '{"durationDays":30,"badge":"👑 ELITE"}'::jsonb, TRUE, TRUE, 10),
('sub_elite_pass_lifetime', 'elite_membership', 'Grandmaster Status (Lifetime)', 'Permanent prestigious academy designation and exclusive theme.', 'Legendary', 5000, '💎', '{"durationDays":null,"badge":"💎 GRANDMASTER"}'::jsonb, TRUE, FALSE, 3),

-- 7. Guild Rewards
('guild_banner_dragon', 'guild_rewards', 'Celestial Dragon Guild Banner', 'Majestic dragon sigil for your guild headquarters. Equipable by Guild Officers.', 'Epic', 1200, '🐉', '{"target":"guild_banner"}'::jsonb, TRUE, FALSE, 10),
('guild_theme_crimson', 'guild_rewards', 'Crimson Shogun Guild Theme', 'Imperial red neon palette styling for your guild hall.', 'Rare', 800, '⛩️', '{"target":"guild_theme"}'::jsonb, TRUE, FALSE, 15),
('guild_title_vanguard', 'guild_rewards', 'Guild Vanguard Title', 'Personal profile prefix showing devotion to your guild battalion.', 'Common', 350, '🛡️', '{"target":"personal_title"}'::jsonb, TRUE, FALSE, 25),

-- 8. Seasonal Collectibles
('season_autumn_kitsune', 'seasonal_collectibles', 'Autumn Kitsune Avatar', 'Limited seasonal spiritual fox avatar. Preserved forever once acquired!', 'Legendary', 1600, '🦊', '{"season":"Autumn 2026","activeUntil":"2026-11-30"}'::jsonb, TRUE, FALSE, 5),
('season_halloween_specter', 'seasonal_collectibles', 'Cyber Specter Frame', 'Limited spectral violet profile border for the academy Autumn Festival.', 'Epic', 1100, '🎃', '{"season":"Spooky Lab 2026","activeUntil":"2026-11-15"}'::jsonb, TRUE, FALSE, 10)

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    xp_price = EXCLUDED.xp_price,
    rarity = EXCLUDED.rarity,
    preview_data = EXCLUDED.preview_data,
    mystery_box_weight = EXCLUDED.mystery_box_weight;
