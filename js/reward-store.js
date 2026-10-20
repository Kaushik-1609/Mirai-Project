/**
 * MSOT LEARN — Reward Store & Digital Asset Vault
 * Category Restrictions: Only the 8 Approved Categories
 *   1. avatar (Avatar Store)
 *   2. profile_customization (Profile Customization)
 *   3. xp_shield (XP Shield)
 *   4. streak_freeze (Streak Freeze)
 *   5. mystery_box (Mystery Box)
 *   6. elite_membership (Elite Membership)
 *   7. guild_rewards (Guild Rewards)
 *   8. seasonal_collectibles (Seasonal Collectibles)
 */

(function () {
    const STORAGE_KEY_PREFIX = 'MSOT_REWARD_STORE_';
    const FREEZES_KEY_PREFIX = 'MSOT_STREAK_FREEZES_';
    const INVENTORY_KEY_PREFIX = 'MSOT_STUDY_INVENTORY_';
    const LEDGER_KEY_PREFIX = 'MSOT_REWARD_TRANSACTIONS_';

    // Seed Catalog containing ONLY the 8 Approved Categories with distinct emoji symbols
    const DEFAULT_CATALOG = [
        // 1. Avatar Store
        {
            id: 'av_ronin_apprentice',
            category: 'avatar',
            name: 'Ronin Apprentice',
            description: 'Disciplined martial coder beginning the sacred path of algorithms.',
            rarity: 'Common',
            xpPrice: 250,
            symbol: '🥷',
            asset: '🥷',
            previewData: { type: 'avatar', symbol: '🥷' },
            isActive: true,
            isRepeatable: false,
            mysteryWeight: 35
        },
        {
            id: 'av_cyber_shinobi',
            category: 'avatar',
            name: 'Cyber Shinobi',
            description: 'Stealthy debugger equipped with high-frequency neon katana.',
            rarity: 'Rare',
            xpPrice: 600,
            symbol: '⚡',
            asset: '⚡',
            previewData: { type: 'avatar', symbol: '⚡' },
            isActive: true,
            isRepeatable: false,
            mysteryWeight: 25
        },
        {
            id: 'av_void_samurai',
            category: 'avatar',
            name: 'Void Samurai',
            description: 'Master of low-level memory allocation and pointer discipline.',
            rarity: 'Epic',
            xpPrice: 1200,
            symbol: '⚔️',
            asset: '⚔️',
            previewData: { type: 'avatar', symbol: '⚔️' },
            isActive: true,
            isRepeatable: false,
            mysteryWeight: 15
        },
        {
            id: 'av_asur_ascendant',
            category: 'avatar',
            name: 'Asur Ascendant',
            description: 'Legendary guardian crowned with ancient technological flame.',
            rarity: 'Legendary',
            xpPrice: 2500,
            symbol: '👹',
            asset: '👹',
            previewData: { type: 'avatar', symbol: '👹' },
            isActive: true,
            isRepeatable: false,
            mysteryWeight: 5
        },

        // 2. Profile Customization
        {
            id: 'frame_neon_pulse',
            category: 'profile_customization',
            name: 'Neon Pulse Frame',
            description: 'Pulsing cyan glowing border around your cadet dossier card.',
            rarity: 'Rare',
            xpPrice: 450,
            symbol: '🖼️',
            asset: '🖼️',
            previewData: { slot: 'frame', cssClass: 'frame-neon-pulse', borderColor: '#00f0ff', symbol: '🖼️' },
            isActive: true,
            isRepeatable: false,
            mysteryWeight: 25
        },
        {
            id: 'frame_tokyo_gold',
            category: 'profile_customization',
            name: 'Imperial Gold Frame',
            description: 'Prestige golden filigree forged for high-ranking academy scholars.',
            rarity: 'Epic',
            xpPrice: 950,
            symbol: '✨',
            asset: '✨',
            previewData: { slot: 'frame', cssClass: 'frame-tokyo-gold', borderColor: '#f59e0b', symbol: '✨' },
            isActive: true,
            isRepeatable: false,
            mysteryWeight: 15
        },
        {
            id: 'bg_cyber_matrix',
            category: 'profile_customization',
            name: 'Matrix Grid Background',
            description: 'Animated dark synthwave grid backdrop for your profile card.',
            rarity: 'Rare',
            xpPrice: 400,
            symbol: '🌌',
            asset: '🌌',
            previewData: { slot: 'background', cssClass: 'bg-cyber-matrix', symbol: '🌌' },
            isActive: true,
            isRepeatable: false,
            mysteryWeight: 20
        },
        {
            id: 'nameplate_glitch_chroma',
            category: 'profile_customization',
            name: 'Glitch Chroma Nameplate',
            description: 'Chromatic aberration styled nameplate banner badge.',
            rarity: 'Epic',
            xpPrice: 850,
            symbol: '🏷️',
            asset: '🏷️',
            previewData: { slot: 'nameplate', cssClass: 'nameplate-glitch', symbol: '🏷️' },
            isActive: true,
            isRepeatable: false,
            mysteryWeight: 15
        },
        {
            id: 'effect_fire_spark',
            category: 'profile_customization',
            name: 'Blazing Ember Effect',
            description: 'Subtle fiery sparks hovering over your avatar crest.',
            rarity: 'Legendary',
            xpPrice: 1500,
            symbol: '🔥',
            asset: '🔥',
            previewData: { slot: 'effect', cssClass: 'effect-ember', symbol: '🔥' },
            isActive: true,
            isRepeatable: false,
            mysteryWeight: 8
        },

        // 3. XP Shield
        {
            id: 'shield_battle_ward_100',
            category: 'xp_shield',
            name: 'Battle XP Shield',
            description: 'Consumable ward protecting against up to 100 XP deduction in penalty-enabled matches.',
            rarity: 'Rare',
            xpPrice: 300,
            symbol: '🛡️',
            asset: '🛡️',
            previewData: { maxProtection: 100, symbol: '🛡️' },
            isActive: true,
            isRepeatable: true,
            mysteryWeight: 25
        },

        // 4. Streak Freeze
        {
            id: 'freeze_streak_token',
            category: 'streak_freeze',
            name: 'Emergency Streak Freeze',
            description: 'Emergency 24hr streak protection when your 3 free monthly freezes are used.',
            rarity: 'Rare',
            xpPrice: 1000,
            symbol: '🧊',
            asset: '🧊',
            previewData: { protectionHours: 24, symbol: '🧊' },
            isActive: true,
            isRepeatable: true,
            mysteryWeight: 20
        },

        // 5. Mystery Box
        {
            id: 'box_mirai_mystery',
            category: 'mystery_box',
            name: 'Neo-Tokyo Mystery Box',
            description: 'Open to unveil a random reward from the 8 approved categories with transparent odds!',
            rarity: 'Epic',
            xpPrice: 500,
            symbol: '🎁',
            asset: '🎁',
            previewData: { dropPool: 'approved_categories', symbol: '🎁' },
            isActive: true,
            isRepeatable: true,
            mysteryWeight: 0
        },

        // 6. Elite Membership
        {
            id: 'sub_elite_pass_30d',
            category: 'elite_membership',
            name: 'Elite Scholar (30 Days)',
            description: '30-day VIP pass featuring exclusive Crown badge, Royal Violet theme, and VIP tag.',
            rarity: 'Epic',
            xpPrice: 1800,
            symbol: '👑',
            asset: '👑',
            previewData: { durationDays: 30, badge: '👑 ELITE', symbol: '👑' },
            isActive: true,
            isRepeatable: true,
            mysteryWeight: 10
        },
        {
            id: 'sub_elite_pass_lifetime',
            category: 'elite_membership',
            name: 'Grandmaster Status (Lifetime)',
            description: 'Permanent prestigious academy designation and exclusive theme.',
            rarity: 'Legendary',
            xpPrice: 5000,
            symbol: '💎',
            asset: '💎',
            previewData: { durationDays: null, badge: '💎 GRANDMASTER', symbol: '💎' },
            isActive: true,
            isRepeatable: false,
            mysteryWeight: 3
        },

        // 7. Guild Rewards
        {
            id: 'guild_banner_dragon',
            category: 'guild_rewards',
            name: 'Celestial Dragon Guild Banner',
            description: 'Majestic dragon sigil for your guild headquarters. Equipable by Guild Officers.',
            rarity: 'Epic',
            xpPrice: 1200,
            symbol: '🐉',
            asset: '🐉',
            previewData: { target: 'guild_banner', symbol: '🐉' },
            isActive: true,
            isRepeatable: false,
            mysteryWeight: 10
        },
        {
            id: 'guild_theme_crimson',
            category: 'guild_rewards',
            name: 'Crimson Shogun Guild Theme',
            description: 'Imperial red neon palette styling for your guild hall.',
            rarity: 'Rare',
            xpPrice: 800,
            symbol: '⛩️',
            asset: '⛩️',
            previewData: { target: 'guild_theme', symbol: '⛩️' },
            isActive: true,
            isRepeatable: false,
            mysteryWeight: 15
        },
        {
            id: 'guild_title_vanguard',
            category: 'guild_rewards',
            name: 'Guild Vanguard Title',
            description: 'Personal profile prefix showing devotion to your guild battalion.',
            rarity: 'Common',
            xpPrice: 350,
            symbol: '🛡️',
            asset: '🛡️',
            previewData: { target: 'personal_title', symbol: '🛡️' },
            isActive: true,
            isRepeatable: false,
            mysteryWeight: 25
        },

        // 8. Seasonal Collectibles
        {
            id: 'season_autumn_kitsune',
            category: 'seasonal_collectibles',
            name: 'Autumn Kitsune Avatar',
            description: 'Limited seasonal spiritual fox avatar. Preserved forever once acquired!',
            rarity: 'Legendary',
            xpPrice: 1600,
            symbol: '🦊',
            asset: '🦊',
            previewData: { season: 'Autumn 2026', activeUntil: '2026-11-30', symbol: '🦊' },
            isActive: true,
            isRepeatable: false,
            mysteryWeight: 5
        },
        {
            id: 'season_halloween_specter',
            category: 'seasonal_collectibles',
            name: 'Cyber Specter Frame',
            description: 'Limited spectral violet profile border for the academy Autumn Festival.',
            rarity: 'Epic',
            xpPrice: 1100,
            symbol: '🎃',
            asset: '🎃',
            previewData: { season: 'Spooky Lab 2026', activeUntil: '2026-11-15', symbol: '🎃' },
            isActive: true,
            isRepeatable: false,
            mysteryWeight: 10
        }
    ];

    class RewardStoreController {
        constructor() {
            this.catalog = [];
            this.inventory = [];
            this.transactions = [];
            this.streakFreezeState = {
                month: this.getAsiaKolkataMonthString(),
                freeUsed: 0,
                paidCount: 0,
                activeUntil: null
            };
            this.eliteMembership = null;
            this.activeCategory = 'ALL';
            this.activeViewTab = 'store'; // 'store', 'inventory', 'ledger'
            this.supabase = null;
            this.processingPurchase = false;
        }

        init() {
            this.initSupabase();
            this.loadCatalog();
            this.loadUserData();
            this.checkMonthlyFreezeReset();
            this.startFreezeTimerTicker();
            console.log('🎁 MSOT Reward Store Engine initialized.');
        }

        initSupabase() {
            if (window.supabaseClient) {
                this.supabase = window.supabaseClient;
            } else if (window.msotAuth?.supabaseClient) {
                this.supabase = window.msotAuth.supabaseClient;
            }
        }

        getCurrentUserId() {
            const session = window.msotAuth?.session;
            return session?.id || session?.email || 'guest_cadet';
        }

        getStorageKey(prefix) {
            return `${prefix}${this.getCurrentUserId()}`;
        }

        getAsiaKolkataMonthString() {
            try {
                const now = new Date();
                const formatter = new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'Asia/Kolkata',
                    year: 'numeric',
                    month: '2-digit'
                });
                return formatter.format(now); // 'YYYY-MM'
            } catch (e) {
                const d = new Date();
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            }
        }

        // =========================================================================
        // DATA LOADING & PERSISTENCE
        // =========================================================================

        getItemSymbol(item) {
            if (!item) return '🎁';
            if (item.symbol) return item.symbol;
            if (item.asset && /\p{Extended_Pictographic}/u.test(item.asset)) return item.asset;
            if (item.previewData && item.previewData.symbol) return item.previewData.symbol;

            const cat = (item.category || '').toLowerCase();
            const name = (item.name || '').toLowerCase();

            if (cat === 'avatar') return '🥷';
            if (cat === 'xp_shield') return '🛡️';
            if (cat === 'streak_freeze') return '🧊';
            if (cat === 'mystery_box') return '🎁';
            if (cat === 'elite_membership') {
                return name.includes('lifetime') || name.includes('grandmaster') ? '💎' : '👑';
            }
            if (cat === 'guild_rewards') {
                if (name.includes('dragon')) return '🐉';
                if (name.includes('theme')) return '⛩️';
                return '🛡️';
            }
            if (cat === 'seasonal_collectibles') {
                if (name.includes('specter') || name.includes('halloween')) return '🎃';
                if (name.includes('kitsune')) return '🦊';
                return '🍂';
            }
            if (cat === 'profile_customization') {
                if (name.includes('frame') || name.includes('border')) return '🖼️';
                if (name.includes('bg') || name.includes('background') || name.includes('grid')) return '🌌';
                if (name.includes('nameplate')) return '🏷️';
                if (name.includes('fire') || name.includes('ember') || name.includes('spark')) return '🔥';
                return '✨';
            }
            return '🎁';
        }

        loadCatalog() {
            try {
                const localCatalog = localStorage.getItem('MSOT_STORE_CATALOG');
                if (localCatalog) {
                    const parsed = JSON.parse(localCatalog);
                    // Merge with DEFAULT_CATALOG so updated symbols and emoji assets are always active
                    this.catalog = DEFAULT_CATALOG.map(def => {
                        const existing = parsed.find(p => p.id === def.id);
                        return existing ? { ...def, ...existing, symbol: def.symbol, asset: def.asset } : def;
                    });
                } else {
                    this.catalog = DEFAULT_CATALOG;
                    this.saveCatalog();
                }
            } catch (e) {
                this.catalog = DEFAULT_CATALOG;
            }
        }

        saveCatalog() {
            try {
                localStorage.setItem('MSOT_STORE_CATALOG', JSON.stringify(this.catalog));
            } catch (e) {}
        }

        async loadUserData() {
            const userId = this.getCurrentUserId();

            // 1. Try Supabase
            if (this.supabase && userId !== 'guest_cadet') {
                try {
                    const [invRes, txRes, freezeRes, eliteRes] = await Promise.all([
                        this.supabase.from('student_inventory').select('*').eq('user_id', userId),
                        this.supabase.from('reward_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
                        this.supabase.from('student_streak_freezes').select('*').eq('user_id', userId).maybeSingle(),
                        this.supabase.from('student_elite_memberships').select('*').eq('user_id', userId).maybeSingle()
                    ]);

                    if (!invRes.error && Array.isArray(invRes.data)) this.inventory = invRes.data;
                    if (!txRes.error && Array.isArray(txRes.data)) this.transactions = txRes.data;
                    if (!freezeRes.error && freezeRes.data) {
                        this.streakFreezeState = {
                            month: freezeRes.data.free_allowance_month,
                            freeUsed: freezeRes.data.free_freezes_used || 0,
                            paidCount: freezeRes.data.paid_freezes_count || 0,
                            activeUntil: freezeRes.data.active_freeze_until ? new Date(freezeRes.data.active_freeze_until).getTime() : null
                        };
                    }
                    if (!eliteRes.error && eliteRes.data) {
                        this.eliteMembership = eliteRes.data;
                    }
                    this.saveLocalUserData();
                    this.renderAll();
                    return;
                } catch (e) {
                    console.warn('Supabase Reward Store sync note (using local cache):', e.message);
                }
            }

            // 2. LocalStorage Fallback
            try {
                const inv = localStorage.getItem(this.getStorageKey(INVENTORY_KEY_PREFIX));
                if (inv) this.inventory = JSON.parse(inv);

                const tx = localStorage.getItem(this.getStorageKey(LEDGER_KEY_PREFIX));
                if (tx) this.transactions = JSON.parse(tx);

                const freeze = localStorage.getItem(this.getStorageKey(FREEZES_KEY_PREFIX));
                if (freeze) this.streakFreezeState = JSON.parse(freeze);
            } catch (e) {}

            this.checkMonthlyFreezeReset();
            this.renderAll();
        }

        saveLocalUserData() {
            try {
                localStorage.setItem(this.getStorageKey(INVENTORY_KEY_PREFIX), JSON.stringify(this.inventory));
                localStorage.setItem(this.getStorageKey(LEDGER_KEY_PREFIX), JSON.stringify(this.transactions));
                localStorage.setItem(this.getStorageKey(FREEZES_KEY_PREFIX), JSON.stringify(this.streakFreezeState));
            } catch (e) {}
        }

        // =========================================================================
        // FEATURE 4: MONTHLY STREAK FREEZE RULES (Asia/Kolkata Calendar)
        // =========================================================================

        checkMonthlyFreezeReset() {
            const currentMonth = this.getAsiaKolkataMonthString();
            if (this.streakFreezeState.month !== currentMonth) {
                // Month boundary change: reset free allowance to 3 without canceling active freeze!
                this.streakFreezeState.month = currentMonth;
                this.streakFreezeState.freeUsed = 0;
                this.saveLocalUserData();
                this.syncFreezeStateToSupabase();
            }
        }

        getRemainingFreeFreezes() {
            this.checkMonthlyFreezeReset();
            return Math.max(0, 3 - (this.streakFreezeState.freeUsed || 0));
        }

        isFreezeActive() {
            if (!this.streakFreezeState.activeUntil) return false;
            return Date.now() < this.streakFreezeState.activeUntil;
        }

        async activateStreakFreeze() {
            if (this.isFreezeActive()) {
                const remainingHours = Math.ceil((this.streakFreezeState.activeUntil - Date.now()) / (1000 * 3600));
                alert(`⚠️ You already have an active Streak Freeze protecting your streak for another ${remainingHours} hours. Multiple freezes cannot be activated simultaneously.`);
                return;
            }

            this.checkMonthlyFreezeReset();
            const freeLeft = this.getRemainingFreeFreezes();

            if (freeLeft > 0) {
                // Consume 1 free freeze
                this.streakFreezeState.freeUsed++;
                const expireAt = Date.now() + (24 * 60 * 60 * 1000); // exactly 24 hours
                this.streakFreezeState.activeUntil = expireAt;

                // Sync with existing student streak in window.msotState
                if (window.msotState?.student) {
                    window.msotState.student.isStreakFrozen = true;
                    window.msotState.student.streakFrozenDate = new Date().toISOString();
                    window.msotState.save();
                }

                this.logTransaction({
                    item_id: 'freeze_free_monthly',
                    transaction_type: 'CONSUME',
                    xp_amount: 0,
                    metadata: { type: 'free_monthly_freeze', month: this.streakFreezeState.month }
                });

                this.saveLocalUserData();
                this.syncFreezeStateToSupabase();
                this.renderAll();

                if (typeof window.showToast === 'function') {
                    window.showToast(`🧊 Activated 24h Streak Freeze! (${this.getRemainingFreeFreezes()} free left this month)`);
                }
            } else if (this.streakFreezeState.paidCount > 0) {
                // Consume 1 paid freeze
                this.streakFreezeState.paidCount--;
                const expireAt = Date.now() + (24 * 60 * 60 * 1000);
                this.streakFreezeState.activeUntil = expireAt;

                if (window.msotState?.student) {
                    window.msotState.student.isStreakFrozen = true;
                    window.msotState.student.streakFrozenDate = new Date().toISOString();
                    window.msotState.save();
                }

                this.logTransaction({
                    item_id: 'freeze_streak_token',
                    transaction_type: 'CONSUME',
                    xp_amount: 0,
                    metadata: { type: 'paid_freeze_token' }
                });

                this.saveLocalUserData();
                this.syncFreezeStateToSupabase();
                this.renderAll();

                if (typeof window.showToast === 'function') {
                    window.showToast('🧊 Activated 24h Streak Freeze from inventory!');
                }
            } else {
                // Free allowance depleted & no paid freezes in stock: prompt to purchase for 1,000 XP
                if (confirm('You have used all 3 free monthly Streak Freezes for this calendar month. Would you like to purchase an Emergency Streak Freeze for 1,000 XP?')) {
                    await this.purchaseItem('freeze_streak_token');
                }
            }
        }

        async syncFreezeStateToSupabase() {
            if (!this.supabase || this.getCurrentUserId() === 'guest_cadet') return;
            try {
                await this.supabase.from('student_streak_freezes').upsert({
                    user_id: this.getCurrentUserId(),
                    free_allowance_month: this.streakFreezeState.month,
                    free_freezes_used: this.streakFreezeState.freeUsed,
                    paid_freezes_count: this.streakFreezeState.paidCount,
                    active_freeze_until: this.streakFreezeState.activeUntil ? new Date(this.streakFreezeState.activeUntil).toISOString() : null,
                    last_activated_at: new Date().toISOString()
                });
            } catch (e) {}
        }

        startFreezeTimerTicker() {
            setInterval(() => {
                const countdownEl = document.getElementById('rsFreezeCountdown');
                if (countdownEl) {
                    if (this.isFreezeActive()) {
                        const msLeft = this.streakFreezeState.activeUntil - Date.now();
                        const hrs = Math.floor(msLeft / (1000 * 3600));
                        const mins = Math.floor((msLeft % (1000 * 3600)) / (1000 * 60));
                        const secs = Math.floor((msLeft % (1000 * 60)) / 1000);
                        countdownEl.textContent = `PROTECTED: ${hrs}h ${mins}m ${secs}s`;
                    } else {
                        countdownEl.textContent = 'NO ACTIVE FREEZE';
                    }
                }
            }, 1000);
        }

        // =========================================================================
        // ATOMIC PURCHASE WORKFLOW
        // =========================================================================

        async purchaseItem(itemId) {
            if (this.processingPurchase) return;
            const item = this.catalog.find(i => i.id === itemId);
            if (!item) {
                alert('Reward item not found.');
                return;
            }

            if (!item.isActive) {
                alert('This item is currently unavailable in the store.');
                return;
            }

            // Seasonal check
            if (item.category === 'seasonal_collectibles' && item.previewData?.activeUntil) {
                const expiry = new Date(item.previewData.activeUntil).getTime();
                if (Date.now() > expiry) {
                    alert('The availability window for this seasonal collectible has ended.');
                    return;
                }
            }

            // Duplicate check for non-repeatables
            const existingInv = this.inventory.find(inv => inv.item_id === itemId);
            if (!item.isRepeatable && existingInv && (existingInv.quantity || 1) > 0) {
                alert(`You already own "${item.name}". Unique cosmetics cannot be purchased twice.`);
                return;
            }

            // Get current student XP balance
            const studentXP = window.msotState?.student?.lifetimeXP || 0;
            if (studentXP < item.xpPrice) {
                alert(`Insufficient XP! You need ${item.xpPrice.toLocaleString()} XP, but only have ${studentXP.toLocaleString()} XP.`);
                return;
            }

            if (!confirm(`Confirm purchase of "${item.name}" for ${item.xpPrice.toLocaleString()} XP?`)) {
                return;
            }

            this.processingPurchase = true;
            const idempotencyKey = 'buy_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

            try {
                // 1. Deduct XP atomically
                const balanceBefore = studentXP;
                const balanceAfter = studentXP - item.xpPrice;

                if (window.msotState?.student) {
                    window.msotState.student.lifetimeXP = balanceAfter;
                    window.msotState.save();
                }

                // 2. Grant inventory / entitlement
                if (itemId === 'freeze_streak_token') {
                    this.streakFreezeState.paidCount++;
                    this.syncFreezeStateToSupabase();
                } else if (itemId === 'box_mirai_mystery') {
                    // Mystery Box opened immediately or added to inventory
                    this.openMysteryBox(idempotencyKey);
                    this.processingPurchase = false;
                    return;
                } else if (item.category === 'elite_membership') {
                    this.grantEliteMembership(item);
                } else {
                    if (existingInv) {
                        existingInv.quantity = (existingInv.quantity || 1) + 1;
                    } else {
                        this.inventory.push({
                            id: 'inv_' + Date.now(),
                            item_id: itemId,
                            quantity: 1,
                            is_equipped: false,
                            customization_slot: item.previewData?.slot || (item.category === 'avatar' ? 'avatar' : 'none'),
                            acquired_at: new Date().toISOString()
                        });
                    }
                }

                // 3. Log into transaction ledger
                this.logTransaction({
                    idempotency_key: idempotencyKey,
                    item_id: itemId,
                    transaction_type: 'PURCHASE',
                    xp_amount: item.xpPrice,
                    xp_balance_before: balanceBefore,
                    xp_balance_after: balanceAfter,
                    status: 'COMPLETED',
                    metadata: { itemName: item.name, category: item.category }
                });

                // 4. Sync to Supabase
                this.syncPurchaseToSupabase(itemId, item.xpPrice, idempotencyKey);

                this.saveLocalUserData();
                this.renderAll();

                if (typeof window.showToast === 'function') {
                    window.showToast(`🎉 Purchased "${item.name}" for ${item.xpPrice} XP!`);
                }
            } catch (err) {
                console.error('Purchase transaction error:', err);
                alert('Purchase could not be completed. Your XP balance has been protected.');
            } finally {
                this.processingPurchase = false;
            }
        }

        async syncPurchaseToSupabase(itemId, xpPrice, idempotencyKey) {
            if (!this.supabase || this.getCurrentUserId() === 'guest_cadet') return;
            try {
                await this.supabase.from('student_inventory').upsert({
                    user_id: this.getCurrentUserId(),
                    item_id: itemId,
                    quantity: 1,
                    acquired_at: new Date().toISOString()
                }, { onConflict: 'user_id,item_id' });
            } catch (e) {}
        }

        logTransaction(data) {
            const tx = {
                id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                idempotency_key: data.idempotency_key || 'tx_' + Date.now(),
                user_id: this.getCurrentUserId(),
                item_id: data.item_id,
                transaction_type: data.transaction_type || 'PURCHASE',
                xp_amount: data.xp_amount || 0,
                xp_balance_before: data.xp_balance_before || (window.msotState?.student?.lifetimeXP || 0),
                xp_balance_after: data.xp_balance_after || (window.msotState?.student?.lifetimeXP || 0),
                status: data.status || 'COMPLETED',
                metadata: data.metadata || {},
                created_at: new Date().toISOString()
            };

            this.transactions.unshift(tx);
            if (this.supabase && this.getCurrentUserId() !== 'guest_cadet') {
                this.supabase.from('reward_transactions').insert(tx).catch(() => {});
            }
        }

        // =========================================================================
        // FEATURE 5: MYSTERY BOX (Transparent Auditable Odds)
        // =========================================================================

        openMysteryBox(idempotencyKey) {
            // Drop Pool: Only eligible items from the approved 8 categories with mystery weights
            const pool = this.catalog.filter(i => i.id !== 'box_mirai_mystery' && (i.mysteryWeight || 0) > 0);
            const totalWeight = pool.reduce((acc, i) => acc + (i.mysteryWeight || 1), 0);

            let random = Math.floor(Math.random() * totalWeight);
            let selected = pool[0];

            for (const item of pool) {
                if (random < item.mysteryWeight) {
                    selected = item;
                    break;
                }
                random -= item.mysteryWeight;
            }

            // Check if already owned non-repeatable
            const alreadyOwned = this.inventory.some(inv => inv.item_id === selected.id);
            let rewardItem = selected;

            if (alreadyOwned && !selected.isRepeatable) {
                // Duplicate policy: grant 1 Battle XP Shield consumable instead so XP is never wasted!
                rewardItem = this.catalog.find(i => i.id === 'shield_battle_ward_100') || selected;
            }

            // Grant won item to inventory
            const existingInv = this.inventory.find(inv => inv.item_id === rewardItem.id);
            if (existingInv) {
                existingInv.quantity = (existingInv.quantity || 1) + 1;
            } else {
                this.inventory.push({
                    id: 'inv_' + Date.now(),
                    item_id: rewardItem.id,
                    quantity: 1,
                    is_equipped: false,
                    customization_slot: rewardItem.previewData?.slot || (rewardItem.category === 'avatar' ? 'avatar' : 'none'),
                    acquired_at: new Date().toISOString()
                });
            }

            this.logTransaction({
                idempotency_key: idempotencyKey,
                item_id: 'box_mirai_mystery',
                transaction_type: 'MYSTERY_BOX_OPEN',
                xp_amount: 500,
                metadata: { wonItemId: rewardItem.id, wonItemName: rewardItem.name, rarity: rewardItem.rarity }
            });

            this.saveLocalUserData();
            this.renderAll();

            // Display animated mystery reveal modal
            this.showMysteryRevealModal(rewardItem);
        }

        showMysteryRevealModal(item) {
            const modal = document.getElementById('rsMysteryModal');
            const chestAnim = document.getElementById('rsChestAnim');
            const titleEl = document.getElementById('rsWonItemTitle');
            const descEl = document.getElementById('rsWonItemDesc');
            const assetEl = document.getElementById('rsWonItemAsset');
            if (!modal) return;

            if (chestAnim) chestAnim.textContent = '🎁';
            if (titleEl) titleEl.textContent = 'Unboxing Mystery Box...';
            if (descEl) descEl.textContent = 'Calculating algorithmic reward...';
            if (assetEl) assetEl.textContent = '✨';

            modal.classList.add('open');

            setTimeout(() => {
                if (chestAnim) chestAnim.textContent = '💥';
                if (assetEl) assetEl.textContent = item.asset || '🎁';
                if (titleEl) titleEl.innerHTML = `<span style="color:#fbbf24;">${this.escapeHtml(item.name)}</span> (${item.rarity})`;
                if (descEl) descEl.textContent = item.description;
            }, 800);
        }

        closeMysteryModal() {
            const modal = document.getElementById('rsMysteryModal');
            if (modal) modal.classList.remove('open');
        }

        // =========================================================================
        // FEATURE 6: ELITE MEMBERSHIP
        // =========================================================================

        grantEliteMembership(item) {
            const isLifetime = item.previewData?.durationDays === null;
            const expiry = isLifetime ? null : new Date(Date.now() + (item.previewData.durationDays * 24 * 3600 * 1000)).toISOString();

            this.eliteMembership = {
                isActive: true,
                tier: isLifetime ? 'GRANDMASTER' : 'ELITE',
                expiresAt: expiry,
                purchasedAt: new Date().toISOString()
            };

            // Update student profile title
            if (window.msotState?.student) {
                window.msotState.student.eliteStatus = this.eliteMembership.tier;
                window.msotState.save();
            }

            if (this.supabase && this.getCurrentUserId() !== 'guest_cadet') {
                this.supabase.from('student_elite_memberships').upsert({
                    user_id: this.getCurrentUserId(),
                    is_active: true,
                    tier: this.eliteMembership.tier,
                    expires_at: expiry,
                    purchased_at: new Date().toISOString()
                }).catch(() => {});
            }
        }

        // =========================================================================
        // FEATURE 1 & 2: EQUIP & USE DIGITAL REWARDS
        // =========================================================================

        equipItem(itemId) {
            const item = this.catalog.find(i => i.id === itemId);
            if (!item) return;

            // Unequip any item in same slot
            const targetSlot = item.previewData?.slot || (item.category === 'avatar' ? 'avatar' : 'none');
            this.inventory.forEach(inv => {
                const it = this.catalog.find(c => c.id === inv.item_id);
                const s = it?.previewData?.slot || (it?.category === 'avatar' ? 'avatar' : 'none');
                if (s === targetSlot) {
                    inv.is_equipped = (inv.item_id === itemId);
                }
            });

            // If avatar, update student's profile avatar across platform
            if (item.category === 'avatar') {
                if (window.msotState?.student) {
                    window.msotState.student.avatar = item.asset;
                    window.msotState.save();
                }
                if (window.msotAuth?.session) {
                    window.msotAuth.session.avatar = item.asset;
                    try { localStorage.setItem('MSOT_LEARN_AUTH_SESSION_V1', JSON.stringify(window.msotAuth.session)); } catch (e) {}
                }
            }

            this.saveLocalUserData();
            this.renderAll();

            if (typeof window.showToast === 'function') {
                window.showToast(`✨ Equipped "${item.name}"!`);
            }
        }

        unequipItem(itemId) {
            const inv = this.inventory.find(i => i.item_id === itemId);
            if (inv) {
                inv.is_equipped = false;
                this.saveLocalUserData();
                this.renderAll();
                if (typeof window.showToast === 'function') {
                    window.showToast('Item unequipped.');
                }
            }
        }

        useConsumableShield(itemId) {
            const inv = this.inventory.find(i => i.item_id === itemId);
            if (!inv || (inv.quantity || 0) <= 0) {
                alert('No shields available in your inventory.');
                return;
            }

            inv.quantity--;
            this.logTransaction({
                item_id: itemId,
                transaction_type: 'CONSUME',
                xp_amount: 0,
                metadata: { note: 'Activated Battle XP Ward' }
            });

            this.saveLocalUserData();
            this.renderAll();

            alert('🛡️ Battle XP Shield Activated! Protects your next battle match against up to 100 XP deduction.');
        }

        async refundTransaction(txId) {
            const txIndex = this.transactions.findIndex(t => t.id === txId);
            if (txIndex === -1) {
                return { success: false, message: 'Transaction not found.' };
            }

            const tx = this.transactions[txIndex];
            if (tx.status === 'REFUNDED') {
                return { success: false, message: 'Transaction has already been refunded.' };
            }

            const refundAmount = tx.xp_amount || 0;
            // Restore XP atomically to student balance
            if (window.msotState?.student && refundAmount > 0) {
                window.msotState.student.lifetimeXP = (window.msotState.student.lifetimeXP || 0) + refundAmount;
                window.msotState.save();
            }

            // Reverse inventory / entitlement grants
            if (tx.item_id === 'freeze_streak_token') {
                if (this.streakFreezeState.paidCount > 0) {
                    this.streakFreezeState.paidCount--;
                    this.syncFreezeStateToSupabase();
                }
            } else if (tx.item_id !== 'box_mirai_mystery') {
                const invIndex = this.inventory.findIndex(i => i.item_id === tx.item_id);
                if (invIndex !== -1) {
                    const inv = this.inventory[invIndex];
                    if ((inv.quantity || 1) > 1) {
                        inv.quantity--;
                    } else {
                        // If it was equipped avatar, revert avatar to default
                        const item = this.catalog.find(c => c.id === tx.item_id);
                        if (item && item.category === 'avatar' && window.msotState?.student?.avatar === item.asset) {
                            window.msotState.student.avatar = '🧑‍💻';
                            window.msotState.save();
                        }
                        this.inventory.splice(invIndex, 1);
                    }
                }
            }

            // Mark transaction as refunded
            tx.status = 'REFUNDED';
            tx.metadata = tx.metadata || {};
            tx.metadata.refunded_at = new Date().toISOString();

            // Log refund ledger entry for complete audit trail
            this.logTransaction({
                item_id: tx.item_id,
                transaction_type: 'REFUND',
                xp_amount: refundAmount,
                xp_balance_before: (window.msotState?.student?.lifetimeXP || 0) - refundAmount,
                xp_balance_after: window.msotState?.student?.lifetimeXP || 0,
                status: 'COMPLETED',
                metadata: { originalTxId: txId, reason: 'Admin authorized refund' }
            });

            this.saveLocalUserData();
            this.renderAll();

            // Sync refund status to Supabase if connected
            if (this.supabase && this.getCurrentUserId() !== 'guest_cadet') {
                try {
                    await this.supabase.from('reward_transactions').update({ status: 'REFUNDED' }).eq('id', txId);
                } catch (e) {}
            }

            return { success: true, message: `Successfully refunded ${refundAmount} XP to student.` };
        }


        // =========================================================================
        // RENDERING VIEWS
        // =========================================================================

        setCategoryFilter(cat) {
            this.activeCategory = cat;
            document.querySelectorAll('.rs-cat-pill').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.cat === cat);
            });
            this.renderStoreCatalog();
        }

        switchViewTab(tabName) {
            this.activeViewTab = tabName;
            document.querySelectorAll('.rs-tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === tabName);
            });
            document.querySelectorAll('.rs-view-stage').forEach(stage => {
                stage.classList.toggle('active', stage.id === `rsView_${tabName}`);
            });

            if (tabName === 'store') this.renderStoreCatalog();
            if (tabName === 'inventory') this.renderInventory();
            if (tabName === 'ledger') this.renderLedger();
        }

        renderHUD() {
            const xpValEl = document.getElementById('rsHudXP');
            const freezeCountEl = document.getElementById('rsHudFreezes');
            const bannerLeftEl = document.getElementById('rsFreezeLeftBadge');
            const countdownEl = document.getElementById('rsFreezeCountdown');

            const currentXP = window.msotState?.student?.lifetimeXP || 0;
            if (xpValEl) xpValEl.textContent = `${currentXP.toLocaleString()} XP`;

            const freeLeft = this.getRemainingFreeFreezes();
            const paidStock = this.streakFreezeState.paidCount || 0;

            if (freezeCountEl) {
                freezeCountEl.textContent = `${freeLeft} Free / ${paidStock} Paid`;
            }

            if (bannerLeftEl) {
                bannerLeftEl.textContent = `${freeLeft} of 3 Free Monthly Freezes Left`;
            }

            if (countdownEl) {
                if (this.isFreezeActive()) {
                    const msLeft = this.streakFreezeState.activeUntil - Date.now();
                    const hrs = Math.ceil(msLeft / (1000 * 3600));
                    countdownEl.textContent = `PROTECTED: ~${hrs}h remaining`;
                } else {
                    countdownEl.textContent = 'NO ACTIVE FREEZE';
                }
            }
        }

        renderStoreCatalog() {
            const gridEl = document.getElementById('rsStoreCatalogGrid');
            if (!gridEl) return;

            const filtered = this.catalog.filter(item => {
                if (!item.isActive) return false;
                if (this.activeCategory !== 'ALL' && item.category !== this.activeCategory) return false;
                return true;
            });

            gridEl.innerHTML = filtered.map(item => {
                const inv = this.inventory.find(i => i.item_id === item.id);
                const isOwned = !!inv && (inv.quantity || 1) > 0;
                const isEquipped = !!inv && !!inv.is_equipped;
                const symbol = this.getItemSymbol(item);
                const cleanName = item.name.replace(/^[\p{Extended_Pictographic}\uFE0F\s]+/u, '').trim();

                let actionBtnHtml = `
                    <button type="button" class="rs-btn-action rs-btn-buy" onclick="window.msotStore && window.msotStore.purchaseItem('${item.id}')">
                        Purchase
                    </button>
                `;

                if (isOwned && !item.isRepeatable) {
                    if (isEquipped) {
                        actionBtnHtml = `<span class="rs-btn-action rs-btn-equipped">✓ Equipped</span>`;
                    } else if (item.category === 'avatar' || item.category === 'profile_customization') {
                        actionBtnHtml = `
                            <button type="button" class="rs-btn-action rs-btn-equip" onclick="window.msotStore && window.msotStore.equipItem('${item.id}')">
                                Equip
                            </button>
                        `;
                    } else {
                        actionBtnHtml = `<span class="rs-owned-pill">Owned</span>`;
                    }
                }

                return `
                    <div class="rs-item-card">
                        <div>
                            <div class="rs-card-top">
                                <span class="rs-rarity-badge rs-rarity-${item.rarity.toLowerCase()}">${item.rarity}</span>
                                ${isOwned && !item.isRepeatable ? '<span class="rs-owned-pill">Owned</span>' : ''}
                            </div>
                            <div class="rs-item-preview-box">
                                <span style="font-size:2.8rem; line-height:1; display:inline-block;">${symbol}</span>
                            </div>
                            <h4 class="rs-item-name">
                                <span class="rs-item-title-symbol" style="margin-right:6px;">${symbol}</span>${this.escapeHtml(cleanName)}
                            </h4>
                            <p class="rs-item-desc">${this.escapeHtml(item.description)}</p>
                        </div>
                        <div class="rs-card-footer">
                            <span class="rs-price-tag">🪙 ${item.xpPrice.toLocaleString()} XP</span>
                            ${actionBtnHtml}
                        </div>
                    </div>
                `;
            }).join('');
        }

        renderInventory() {
            const tableBody = document.getElementById('rsInventoryTableBody');
            if (!tableBody) return;

            if (this.inventory.length === 0 && this.streakFreezeState.paidCount === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 30px; color: var(--text-muted);">
                            Your inventory is empty. Visit the Reward Store to unlock avatars, profile cosmetics, and shields!
                        </td>
                    </tr>
                `;
                return;
            }

            const rows = [];

            // Add paid streak freezes if any
            if (this.streakFreezeState.paidCount > 0) {
                rows.push(`
                    <tr>
                        <td><span style="font-size:1.5rem;">🧊</span></td>
                        <td><strong><span style="margin-right:4px;">🧊</span>Emergency Streak Freeze Token</strong></td>
                        <td><span class="rs-rarity-badge rs-rarity-rare">Rare</span></td>
                        <td>x${this.streakFreezeState.paidCount}</td>
                        <td>
                            <button type="button" class="rs-btn-action rs-btn-buy" style="padding:4px 10px; font-size:0.75rem;" onclick="window.msotStore && window.msotStore.activateStreakFreeze()">
                                Activate (24h)
                            </button>
                        </td>
                    </tr>
                `);
            }

            this.inventory.forEach(inv => {
                const item = this.catalog.find(i => i.id === inv.item_id);
                if (!item) return;
                const symbol = this.getItemSymbol(item);
                const cleanName = item.name.replace(/^[\p{Extended_Pictographic}\uFE0F\s]+/u, '').trim();

                let actionHtml = '—';
                if (item.category === 'avatar' || item.category === 'profile_customization') {
                    if (inv.is_equipped) {
                        actionHtml = `<button type="button" class="rs-btn-action rs-btn-equipped" onclick="window.msotStore && window.msotStore.unequipItem('${item.id}')">Unequip</button>`;
                    } else {
                        actionHtml = `<button type="button" class="rs-btn-action rs-btn-equip" onclick="window.msotStore && window.msotStore.equipItem('${item.id}')">Equip</button>`;
                    }
                } else if (item.category === 'xp_shield') {
                    actionHtml = `<button type="button" class="rs-btn-action rs-btn-buy" style="padding:4px 10px; font-size:0.75rem;" onclick="window.msotStore && window.msotStore.useConsumableShield('${item.id}')">Use Shield</button>`;
                }

                rows.push(`
                    <tr>
                        <td><span style="font-size:1.5rem;">${symbol}</span></td>
                        <td>
                            <div style="font-weight:700; color:#fff;">
                                <span style="margin-right:4px;">${symbol}</span>${this.escapeHtml(cleanName)}
                            </div>
                            <div style="font-size:0.75rem; color:#94a3b8;">${this.escapeHtml(item.category.replace('_', ' '))}</div>
                        </td>
                        <td><span class="rs-rarity-badge rs-rarity-${item.rarity.toLowerCase()}">${item.rarity}</span></td>
                        <td>x${inv.quantity || 1}</td>
                        <td>${actionHtml}</td>
                    </tr>
                `);
            });

            tableBody.innerHTML = rows.join('');
        }

        renderLedger() {
            const tableBody = document.getElementById('rsLedgerTableBody');
            if (!tableBody) return;

            if (this.transactions.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">
                            No purchase transactions recorded yet.
                        </td>
                    </tr>
                `;
                return;
            }

            tableBody.innerHTML = this.transactions.map(tx => {
                const item = this.catalog.find(i => i.id === tx.item_id);
                const name = item?.name || tx.metadata?.itemName || tx.item_id;
                const dateStr = new Date(tx.created_at).toLocaleString();

                return `
                    <tr>
                        <td style="font-family:monospace; font-size:0.75rem; color:#94a3b8;">${tx.id.substring(0, 10)}...</td>
                        <td><strong>${this.escapeHtml(name)}</strong></td>
                        <td><span style="font-weight:700; color:#c4b5fd;">${tx.transaction_type}</span></td>
                        <td><span style="color:#fbbf24; font-weight:700;">-${tx.xp_amount} XP</span></td>
                        <td>${tx.xp_balance_after.toLocaleString()} XP</td>
                        <td style="font-size:0.75rem; color:#94a3b8;">${dateStr}</td>
                    </tr>
                `;
            }).join('');
        }

        renderAll() {
            this.renderHUD();
            this.renderStoreCatalog();
            this.renderInventory();
            this.renderLedger();
        }

        initView() {
            this.loadUserData();
            this.switchViewTab(this.activeViewTab || 'store');
        }

        escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }
    }

    // Export singleton
    window.msotStore = new RewardStoreController();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.msotStore.init());
    } else {
        window.msotStore.init();
    }
})();
