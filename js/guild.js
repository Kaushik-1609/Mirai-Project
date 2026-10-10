/**
 * MSOT LEARN — Production Educational Guild System & Level-Restricted Matchmaking
 * Integrated into the existing League Section
 * 
 * Features:
 * - Dynamic Level-Based Guild Membership: [Target Level - 3] to [Target Level + 3]
 * - One Student = One Active Guild Constraint
 * - Guild Roles: Owner, Officer, Member with permission enforcement
 * - Two-Way Anonymous Mode Privacy Protection across League & Guild UI
 * - Guild vs Guild Challenges & Live Contests (Quiz Battle, Coding Challenge, XP Battle, etc.)
 * - Dynamic Guild Leaderboard ranked by real Guild XP
 * - Supabase Backend Synchronization + Persistent Reactive Client State
 */

(function () {
    const STORAGE_KEY = 'MSOT_LEARN_GUILD_SYSTEM_V1';
    const PRIVACY_KEY = 'MSOT_LEARN_STUDENT_PRIVACY_V1';

    // ─── Default Initial Guild Ecosystem (Balanced around Student Levels) ────
    const DEFAULT_GUILDS = [
        {
            id: 'g-alpha-01',
            name: 'Code Warriors',
            tag: '#CW01',
            description: 'Elite algorithm solvers and C++ competitive programming disciples.',
            avatar: '⚔️',
            targetLevel: 12,
            minLevel: 9,
            maxLevel: 15,
            capacity: 25,
            xp: 14850,
            contestsWon: 18,
            contestsPlayed: 21,
            createdBy: 'ADM-MSOT-001',
            members: [
                {
                    userId: 'ADM-MSOT-001',
                    name: 'Utkarsh Raj',
                    alias: 'ShadowCoder_001',
                    avatar: '🛡️',
                    role: 'OWNER',
                    level: 12,
                    xpContribution: 4200,
                    joinedAt: '2026-09-15'
                },
                {
                    userId: 'usr_harsh_01',
                    name: 'Harsh',
                    alias: 'harsjh5217',
                    avatar: '👑',
                    role: 'OFFICER',
                    level: 13,
                    xpContribution: 3850,
                    joinedAt: '2026-09-18'
                },
                {
                    userId: 'usr_harsh_singh_02',
                    name: 'Harsh Singh',
                    alias: 'harshsingh',
                    avatar: '⚔️',
                    role: 'OFFICER',
                    level: 11,
                    xpContribution: 3400,
                    joinedAt: '2026-09-20'
                },
                {
                    userId: 'usr_utkarsh_cadet_03',
                    name: 'Utkarsh Cadet',
                    alias: 'utkarsh_cadet',
                    avatar: '⚡',
                    role: 'MEMBER',
                    level: 10,
                    xpContribution: 2100,
                    joinedAt: '2026-09-25'
                },
                {
                    userId: 'usr_aarav_04',
                    name: 'Aarav',
                    alias: 'aarav',
                    avatar: '🔥',
                    role: 'MEMBER',
                    level: 12,
                    xpContribution: 1300,
                    joinedAt: '2026-10-01'
                }
            ]
        },
        {
            id: 'g-beta-02',
            name: 'AI Masters',
            tag: '#AIM1',
            description: 'Deep learning research cohort and neural architecture builders.',
            avatar: '🧠',
            targetLevel: 11,
            minLevel: 8,
            maxLevel: 14,
            capacity: 25,
            xp: 13420,
            contestsWon: 15,
            contestsPlayed: 19,
            createdBy: 'cadet-ai-lead',
            members: [
                {
                    userId: 'cadet-ai-lead',
                    name: 'Siddharth Sen',
                    alias: 'NeuralSensei_88',
                    avatar: '🧠',
                    role: 'OWNER',
                    level: 14,
                    xpContribution: 4100,
                    joinedAt: '2026-09-16'
                },
                {
                    userId: 'cadet-ai-02',
                    name: 'Kavya Nair',
                    alias: 'MatrixDiva_21',
                    avatar: '💎',
                    role: 'OFFICER',
                    level: 11,
                    xpContribution: 3600,
                    joinedAt: '2026-09-19'
                },
                {
                    userId: 'cadet-ai-03',
                    name: 'Devansh Roy',
                    alias: 'TensorTitan_05',
                    avatar: '🔥',
                    role: 'MEMBER',
                    level: 9,
                    xpContribution: 2900,
                    joinedAt: '2026-09-22'
                },
                {
                    userId: 'cadet-ai-04',
                    name: 'Meera Iyer',
                    alias: 'OptimaCoder_33',
                    avatar: '✨',
                    role: 'MEMBER',
                    level: 12,
                    xpContribution: 2820,
                    joinedAt: '2026-09-28'
                }
            ]
        },
        {
            id: 'g-gamma-03',
            name: 'Algorithm Titans',
            tag: '#AT09',
            description: 'Dynamic programming speed-runners and tree-traversal masters.',
            avatar: '⚡',
            targetLevel: 6,
            minLevel: 3,
            maxLevel: 9,
            capacity: 25,
            xp: 11200,
            contestsWon: 12,
            contestsPlayed: 16,
            createdBy: 'cadet-algo-01',
            members: [
                {
                    userId: 'cadet-algo-01',
                    name: 'Arjun Das',
                    alias: 'RecursionRonin_77',
                    avatar: '⚡',
                    role: 'OWNER',
                    level: 7,
                    xpContribution: 3800,
                    joinedAt: '2026-09-18'
                },
                {
                    userId: 'cadet-algo-02',
                    name: 'Sneha Kapoor',
                    alias: 'BitShiftQueen_19',
                    avatar: '🦊',
                    role: 'OFFICER',
                    level: 6,
                    xpContribution: 3100,
                    joinedAt: '2026-09-21'
                },
                {
                    userId: 'cadet-algo-03',
                    name: 'Kabir Joshi',
                    alias: 'BinaryBeast_44',
                    avatar: '🏹',
                    role: 'MEMBER',
                    level: 5,
                    xpContribution: 2400,
                    joinedAt: '2026-09-27'
                },
                {
                    userId: 'cadet-algo-04',
                    name: 'Tara Ghosh',
                    alias: 'GraphGuru_82',
                    avatar: '🌟',
                    role: 'MEMBER',
                    level: 8,
                    xpContribution: 1900,
                    joinedAt: '2026-10-02'
                }
            ]
        },
        {
            id: 'g-delta-04',
            name: 'Cyber Samurai',
            tag: '#CS07',
            description: 'Web architecture, system security, and compiler optimization specialists.',
            avatar: '🥷',
            targetLevel: 4,
            minLevel: 1,
            maxLevel: 7,
            capacity: 25,
            xp: 8950,
            contestsWon: 9,
            contestsPlayed: 14,
            createdBy: 'cadet-cyber-01',
            members: [
                {
                    userId: 'cadet-cyber-01',
                    name: 'Aryan Saxena',
                    alias: 'GhostTerminal_11',
                    avatar: '🥷',
                    role: 'OWNER',
                    level: 5,
                    xpContribution: 3200,
                    joinedAt: '2026-09-22'
                },
                {
                    userId: 'cadet-cyber-02',
                    name: 'Tanvi Bansal',
                    alias: 'CipherNeko_92',
                    avatar: '🐱',
                    role: 'MEMBER',
                    level: 4,
                    xpContribution: 2900,
                    joinedAt: '2026-09-24'
                },
                {
                    userId: 'cadet-cyber-03',
                    name: 'Yash Vardhan',
                    alias: 'KernelSamurai_03',
                    avatar: '🗡️',
                    role: 'MEMBER',
                    level: 3,
                    xpContribution: 2850,
                    joinedAt: '2026-09-29'
                }
            ]
        }
    ];

    // ─── Default Active Contests & Challenges ────────────────────────────────
    const DEFAULT_CHALLENGES = [
        {
            id: 'ch-01',
            senderGuildId: 'g-beta-02',
            receiverGuildId: 'g-alpha-01',
            contestType: 'QUIZ_BATTLE',
            title: 'C++ vs Python Algorithmic Gauntlet',
            description: '5-minute rapid speed trial testing recursion & tree traversal.',
            xpStake: 300,
            status: 'ACCEPTED',
            createdBy: 'cadet-ai-lead',
            createdAt: '2026-10-08T10:00:00Z',
            resolvedAt: null
        },
        {
            id: 'ch-02',
            senderGuildId: 'g-gamma-03',
            receiverGuildId: 'g-alpha-01',
            contestType: 'XP_BATTLE',
            title: 'Weekend 24-Hour Code Sprint',
            description: 'The guild that solves the most compiler practice problems wins 400 XP.',
            xpStake: 400,
            status: 'PENDING',
            createdBy: 'cadet-algo-01',
            createdAt: '2026-10-09T14:30:00Z',
            resolvedAt: null
        }
    ];

    const DEFAULT_CONTESTS = [
        {
            id: 'ct-01',
            challengeId: 'ch-01',
            contestName: 'C++ vs Python Algorithmic Gauntlet',
            contestType: 'QUIZ_BATTLE',
            description: 'Speed trial showdown: First team to 500 points claims the bounty.',
            guildAId: 'g-alpha-01',
            guildBId: 'g-beta-02',
            guildAScore: 380,
            guildBScore: 320,
            xpStake: 300,
            winnerGuildId: null,
            status: 'ACTIVE',
            startsAt: '2026-10-09T18:00:00Z',
            endsAt: '2026-10-11T18:00:00Z'
        }
    ];

    class GuildManager {
        constructor() {
            this.activeSubTab = 'cadet-board'; // 'cadet-board', 'my-guild', 'find-guild', 'guild-battles', 'guild-rankings', 'create-guild'
            this.guilds = [];
            this.challenges = [];
            this.contests = [];
            this.myGuildId = null;
            this.searchTerm = '';
            this.selectedLevelFilter = 'all'; // 'all', 'eligible', or specific range
            this.privacySettings = {};

            this.loadState();
        }

        // ─── State Persistence & Hydration ───────────────────────────────────
        loadState() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    this.guilds = parsed.guilds || DEFAULT_GUILDS;
                    this.challenges = parsed.challenges || DEFAULT_CHALLENGES;
                    this.contests = parsed.contests || DEFAULT_CONTESTS;
                } else {
                    this.guilds = JSON.parse(JSON.stringify(DEFAULT_GUILDS));
                    this.challenges = JSON.parse(JSON.stringify(DEFAULT_CHALLENGES));
                    this.contests = JSON.parse(JSON.stringify(DEFAULT_CONTESTS));
                    this.saveState();
                }
            } catch (e) {
                console.error("Guild state load error, resetting:", e);
                this.guilds = JSON.parse(JSON.stringify(DEFAULT_GUILDS));
                this.challenges = JSON.parse(JSON.stringify(DEFAULT_CHALLENGES));
                this.contests = JSON.parse(JSON.stringify(DEFAULT_CONTESTS));
            }

            try {
                const privStored = localStorage.getItem(PRIVACY_KEY);
                this.privacySettings = privStored ? JSON.parse(privStored) : {};
            } catch (e) {
                this.privacySettings = {};
            }

            // Sync with Supabase in background
            this.syncWithSupabase();
        }

        saveState() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    guilds: this.guilds,
                    challenges: this.challenges,
                    contests: this.contests
                }));
            } catch (e) {
                console.warn("Guild save error:", e);
            }
        }

        // ─── Supabase Backend Synchronization ────────────────────────────────
        async syncWithSupabase() {
            const client = window.supabaseClient || window.msotSupabase;
            if (!client) return;

            try {
                // Attempt to fetch live guilds from Supabase
                const { data: remoteGuilds, error } = await client.from('guilds').select('*, guild_members(*)');
                if (!error && remoteGuilds && remoteGuilds.length > 0) {
                    // Merge remote guilds
                    remoteGuilds.forEach(rg => {
                        const existingIdx = this.guilds.findIndex(g => g.id === rg.id || g.tag === rg.tag);
                        const mapped = {
                            id: rg.id,
                            name: rg.name,
                            tag: rg.tag,
                            description: rg.description,
                            avatar: rg.avatar || '🛡️',
                            targetLevel: rg.target_level,
                            minLevel: rg.min_level,
                            maxLevel: rg.max_level,
                            capacity: rg.capacity || 25,
                            xp: rg.xp || 0,
                            contestsWon: rg.contests_won || 0,
                            contestsPlayed: rg.contests_played || 0,
                            createdBy: rg.created_by,
                            members: (rg.guild_members || []).map(m => ({
                                userId: m.user_id,
                                role: m.role,
                                xpContribution: m.xp_contribution || 0,
                                joinedAt: m.joined_at
                            }))
                        };
                        if (existingIdx !== -1) {
                            this.guilds[existingIdx] = mapped;
                        } else {
                            this.guilds.push(mapped);
                        }
                    });
                    this.saveState();
                }
            } catch (err) {
                // Graceful fallback to local cache
                console.log("Supabase Guild sync: working in connected local-cache mode.");
            }
        }

        // ─── Student Level Calculation ───────────────────────────────────────
        getStudentLevel() {
            if (window.msotState && window.msotState.student) {
                const s = window.msotState.student;
                if (typeof window.msotState.calculateLevelData === 'function') {
                    return window.msotState.calculateLevelData(s.lifetimeXP || 0).level || 1;
                }
                return s.level || 5;
            }
            return 5;
        }

        getCurrentStudentId() {
            if (window.msotState && window.msotState.student) {
                return window.msotState.student.id || 'ADM-MSOT-001';
            }
            return 'ADM-MSOT-001';
        }

        getCurrentStudent() {
            if (window.msotState && window.msotState.student) {
                return window.msotState.student;
            }
            return {
                id: 'ADM-MSOT-001',
                name: 'Utkarsh Raj',
                alias: '@utkarsh_admin',
                avatar: '🛡️',
                anonymousMode: false
            };
        }

        // ─── Active Guild Lookup ─────────────────────────────────────────────
        getMyGuild() {
            const studentId = this.getCurrentStudentId();
            for (const g of this.guilds) {
                if (g.members && g.members.some(m => m.userId === studentId)) {
                    return g;
                }
            }
            return null;
        }

        getMyMembership(guild) {
            if (!guild || !guild.members) return null;
            const studentId = this.getCurrentStudentId();
            return guild.members.find(m => m.userId === studentId) || null;
        }

        // ─── Two-Way Anonymous Mode Privacy Filter ───────────────────────────
        getDisplayIdentity(member) {
            const isSelf = member.userId === this.getCurrentStudentId();
            const currentStudent = this.getCurrentStudent();
            const isGloballyAnon = !!currentStudent.anonymousMode;

            // Stable persistent alias generator
            let stableAlias = member.alias;
            if (!stableAlias) {
                stableAlias = `Cadet_${(member.userId || 'user').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6)}`;
            }

            if (isSelf) {
                if (isGloballyAnon) {
                    return {
                        name: `${stableAlias} (You)`,
                        avatar: '🥷',
                        isAnon: true
                    };
                }
                return {
                    name: `${member.name || currentStudent.name} (You)`,
                    avatar: member.avatar || currentStudent.avatar || '🛡️',
                    isAnon: false
                };
            }

            // Other members: check if they have anonymous mode enabled
            const memberPriv = this.privacySettings[member.userId];
            const isMemberAnon = memberPriv ? memberPriv.isAnonymous : (isGloballyAnon || member.isAnonymous);

            if (isMemberAnon) {
                return {
                    name: stableAlias,
                    avatar: '🥷',
                    isAnon: true
                };
            }

            return {
                name: member.name || stableAlias,
                avatar: member.avatar || '⚔️',
                isAnon: false
            };
        }

        toggleAnonymousMode() {
            if (window.msotState) {
                window.msotState.student.anonymousMode = !window.msotState.student.anonymousMode;
                window.msotState.save();
            }
            this.render();
            if (window.msotPlatform && window.msotPlatform.renderLeagues) {
                window.msotPlatform.renderLeagues();
            }
            if (window.miraiAudio) window.miraiAudio.playClick();
        }

        // ─── Dynamic Level Calculation & Validation [Target-3 to Target+3] ──
        calculateLevelRange(studentLevel) {
            const target = Math.max(1, parseInt(studentLevel) || 1);
            const min = Math.max(1, target - 3);
            const max = target + 3;
            return { target, min, max };
        }

        isStudentEligibleForGuild(guild) {
            const level = this.getStudentLevel();
            return level >= guild.minLevel && level <= guild.maxLevel;
        }

        // ─── Action: Create Guild ─────────────────────────────────────────────
        async createGuild({ name, tag, description, avatar }) {
            const student = this.getCurrentStudent();
            const studentId = this.getCurrentStudentId();
            const studentLevel = this.getStudentLevel();

            // 1. Check existing membership
            const existing = this.getMyGuild();
            if (existing) {
                throw new Error(`You are already a member of "${existing.name}". You must leave your current guild before creating a new one.`);
            }

            // 2. Validate inputs
            const cleanName = (name || '').trim();
            let cleanTag = (tag || '').trim().toUpperCase();
            if (!cleanTag.startsWith('#')) cleanTag = '#' + cleanTag;

            if (cleanName.length < 3 || cleanName.length > 50) {
                throw new Error("Guild Name must be between 3 and 50 characters.");
            }
            if (cleanTag.length < 3 || cleanTag.length > 8) {
                throw new Error("Guild Tag must be 3 to 8 characters (e.g. #CW01).");
            }

            // 3. Check uniqueness
            if (this.guilds.some(g => g.name.toLowerCase() === cleanName.toLowerCase())) {
                throw new Error(`A Guild with the name "${cleanName}" already exists. Please choose a unique name.`);
            }
            if (this.guilds.some(g => g.tag.toLowerCase() === cleanTag.toLowerCase())) {
                throw new Error(`The Guild Tag "${cleanTag}" is already taken.`);
            }

            // 4. Dynamic Level Calculation based on creator's level
            const range = this.calculateLevelRange(studentLevel);

            const newGuild = {
                id: `guild-${Date.now()}`,
                name: cleanName,
                tag: cleanTag,
                description: (description || 'Collaborative learning and quest mastery squad.').trim(),
                avatar: avatar || '🛡️',
                targetLevel: range.target,
                minLevel: range.min,
                maxLevel: range.max,
                capacity: 25,
                xp: 100, // Founding bonus
                contestsWon: 0,
                contestsPlayed: 0,
                createdBy: studentId,
                members: [
                    {
                        userId: studentId,
                        name: student.name,
                        alias: student.alias ? student.alias.replace(/^@/, '') : `Founder_${studentId.slice(-4)}`,
                        avatar: student.avatar || '🛡️',
                        role: 'OWNER',
                        level: studentLevel,
                        xpContribution: 100,
                        joinedAt: new Date().toISOString()
                    }
                ]
            };

            this.guilds.unshift(newGuild);
            this.saveState();

            // Attempt Supabase RPC execution
            const client = window.supabaseClient || window.msotSupabase;
            if (client) {
                try {
                    await client.rpc('create_guild', {
                        p_name: cleanName,
                        p_tag: cleanTag,
                        p_description: newGuild.description,
                        p_avatar: newGuild.avatar,
                        p_student_level: studentLevel
                    });
                } catch (e) {
                    console.log("Supabase RPC note (using synchronized local state):", e.message);
                }
            }

            if (window.miraiAudio) window.miraiAudio.playVictory();
            this.switchLeagueSubTab('my-guild');
            return newGuild;
        }

        // ─── Action: Join Guild with Strict Level Validation ─────────────────
        async joinGuild(guildId) {
            const guild = this.guilds.find(g => g.id === guildId);
            if (!guild) throw new Error("Guild not found.");

            const studentId = this.getCurrentStudentId();
            const studentLevel = this.getStudentLevel();
            const student = this.getCurrentStudent();

            // 1. One student = One Guild Check
            const existing = this.getMyGuild();
            if (existing) {
                throw new Error(`You are already a member of "${existing.name}". Leave your current guild before joining another.`);
            }

            // 2. BACKEND/DYNAMIC LEVEL RESTRICTION CHECK [Target-3 to Target+3]
            if (studentLevel < guild.minLevel || studentLevel > guild.maxLevel) {
                throw new Error(`Level requirement not met! Your level (${studentLevel}) is outside this Guild's required range of Level ${guild.minLevel} - ${guild.maxLevel}.`);
            }

            // 3. Capacity Check
            if (guild.members.length >= guild.capacity) {
                throw new Error(`Guild is full! Maximum capacity of ${guild.capacity} members reached.`);
            }

            // 4. Add member
            guild.members.push({
                userId: studentId,
                name: student.name,
                alias: student.alias ? student.alias.replace(/^@/, '') : `Cadet_${studentId.slice(-4)}`,
                avatar: student.avatar || '⚔️',
                role: 'MEMBER',
                level: studentLevel,
                xpContribution: 0,
                joinedAt: new Date().toISOString()
            });

            this.saveState();

            // Attempt Supabase RPC
            const client = window.supabaseClient || window.msotSupabase;
            if (client) {
                try {
                    await client.rpc('join_guild', {
                        p_guild_id: guildId,
                        p_student_level: studentLevel
                    });
                } catch (e) {
                    console.log("Supabase join_guild note:", e.message);
                }
            }

            if (window.miraiAudio) window.miraiAudio.playSuccess();
            this.switchLeagueSubTab('my-guild');
            return guild;
        }

        // ─── Action: Leave Guild ─────────────────────────────────────────────
        async leaveGuild(guildId) {
            const guild = this.guilds.find(g => g.id === guildId);
            if (!guild) throw new Error("Guild not found.");

            const studentId = this.getCurrentStudentId();
            const memIdx = guild.members.findIndex(m => m.userId === studentId);
            if (memIdx === -1) throw new Error("You are not a member of this Guild.");

            const member = guild.members[memIdx];

            if (member.role === 'OWNER') {
                if (guild.members.length > 1) {
                    // Transfer ownership to officer or oldest member
                    const successor = guild.members.find(m => m.userId !== studentId && m.role === 'OFFICER')
                        || guild.members.find(m => m.userId !== studentId);
                    if (successor) successor.role = 'OWNER';
                    guild.members.splice(memIdx, 1);
                } else {
                    // Sole member leaves: disband guild
                    this.guilds = this.guilds.filter(g => g.id !== guildId);
                }
            } else {
                guild.members.splice(memIdx, 1);
            }

            this.saveState();

            const client = window.supabaseClient || window.msotSupabase;
            if (client) {
                try {
                    await client.rpc('leave_guild', { p_guild_id: guildId });
                } catch (e) {
                    console.log("Supabase leave_guild note:", e.message);
                }
            }

            if (window.miraiAudio) window.miraiAudio.playClick();
            this.switchLeagueSubTab('find-guild');
        }

        // ─── Action: Member Management (Owner/Officer only) ───────────────────
        manageMember(guildId, targetUserId, action) {
            const guild = this.guilds.find(g => g.id === guildId);
            if (!guild) return;

            const myMem = this.getMyMembership(guild);
            if (!myMem || (myMem.role !== 'OWNER' && myMem.role !== 'OFFICER')) {
                throw new Error("Unauthorized: Only Guild Owners and Officers can manage members.");
            }

            const targetMem = guild.members.find(m => m.userId === targetUserId);
            if (!targetMem) throw new Error("Member not found in Guild.");

            if (targetMem.role === 'OWNER') {
                throw new Error("Cannot modify the Guild Owner.");
            }

            if (action === 'KICK') {
                guild.members = guild.members.filter(m => m.userId !== targetUserId);
            } else if (action === 'PROMOTE') {
                if (myMem.role !== 'OWNER') throw new Error("Only the Owner can promote officers.");
                targetMem.role = 'OFFICER';
            } else if (action === 'DEMOTE') {
                if (myMem.role !== 'OWNER') throw new Error("Only the Owner can demote officers.");
                targetMem.role = 'MEMBER';
            }

            this.saveState();
            if (window.miraiAudio) window.miraiAudio.playClick();
            this.render();
        }

        // ─── Action: Send Guild Challenge ─────────────────────────────────────
        sendChallenge(targetGuildId, contestType, title, description) {
            const myGuild = this.getMyGuild();
            if (!myGuild) throw new Error("You must belong to a Guild to issue a challenge.");

            const myMem = this.getMyMembership(myGuild);
            if (!myMem || (myMem.role !== 'OWNER' && myMem.role !== 'OFFICER')) {
                throw new Error("Only Guild Owners and Officers can issue challenges.");
            }

            if (myGuild.id === targetGuildId) {
                throw new Error("A Guild cannot challenge itself.");
            }

            const targetGuild = this.guilds.find(g => g.id === targetGuildId);
            if (!targetGuild) throw new Error("Challenged Guild not found.");

            // Check duplicate active or pending challenge
            const hasDuplicate = this.challenges.some(c => 
                ((c.senderGuildId === myGuild.id && c.receiverGuildId === targetGuildId) ||
                 (c.senderGuildId === targetGuildId && c.receiverGuildId === myGuild.id)) &&
                (c.status === 'PENDING' || c.status === 'ACTIVE')
            );
            if (hasDuplicate) {
                throw new Error("An active or pending challenge already exists between your Guild and this Guild.");
            }

            const challenge = {
                id: `ch-${Date.now()}`,
                senderGuildId: myGuild.id,
                receiverGuildId: targetGuildId,
                contestType: contestType || 'QUIZ_BATTLE',
                title: title || `${myGuild.name} vs ${targetGuild.name} Clash`,
                description: description || 'Educational speed sprint challenge.',
                xpStake: 300,
                status: 'PENDING',
                createdBy: this.getCurrentStudentId(),
                createdAt: new Date().toISOString(),
                resolvedAt: null
            };

            this.challenges.unshift(challenge);
            this.saveState();

            if (window.miraiAudio) window.miraiAudio.playVictory();
            this.switchLeagueSubTab('guild-battles');
            return challenge;
        }

        // ─── Action: Respond to Challenge ─────────────────────────────────────
        respondChallenge(challengeId, action) {
            const ch = this.challenges.find(c => c.id === challengeId);
            if (!ch) throw new Error("Challenge not found.");

            const myGuild = this.getMyGuild();
            if (!myGuild) throw new Error("Unauthorized.");

            const myMem = this.getMyMembership(myGuild);
            if (!myMem || (myMem.role !== 'OWNER' && myMem.role !== 'OFFICER')) {
                throw new Error("Only Guild Owners and Officers can respond to challenges.");
            }

            if (action === 'ACCEPT') {
                if (ch.receiverGuildId !== myGuild.id) throw new Error("Only the challenged guild can accept.");
                ch.status = 'ACCEPTED';
                ch.resolvedAt = new Date().toISOString();

                // Start active contest
                const contest = {
                    id: `ct-${Date.now()}`,
                    challengeId: ch.id,
                    contestName: ch.title,
                    contestType: ch.contestType,
                    description: ch.description,
                    guildAId: ch.senderGuildId,
                    guildBId: ch.receiverGuildId,
                    guildAScore: 0,
                    guildBScore: 0,
                    xpStake: ch.xpStake,
                    winnerGuildId: null,
                    status: 'ACTIVE',
                    startsAt: new Date().toISOString(),
                    endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                };
                this.contests.unshift(contest);
                if (window.miraiAudio) window.miraiAudio.playVictory();
            } else if (action === 'REJECT') {
                if (ch.receiverGuildId !== myGuild.id) throw new Error("Only the challenged guild can reject.");
                ch.status = 'REJECTED';
                ch.resolvedAt = new Date().toISOString();
                if (window.miraiAudio) window.miraiAudio.playClick();
            } else if (action === 'CANCEL') {
                if (ch.senderGuildId !== myGuild.id) throw new Error("Only the challenge creator can cancel.");
                ch.status = 'CANCELLED';
                ch.resolvedAt = new Date().toISOString();
                if (window.miraiAudio) window.miraiAudio.playClick();
            }

            this.saveState();
            this.render();
        }

        // ─── Action: Contribute Points to Guild Contest ───────────────────────
        contributeToContest(contestId, points = 25) {
            const ct = this.contests.find(c => c.id === contestId);
            if (!ct || ct.status !== 'ACTIVE') return;

            const myGuild = this.getMyGuild();
            if (!myGuild) return;

            if (ct.guildAId === myGuild.id) {
                ct.guildAScore += points;
                myGuild.xp += points;
            } else if (ct.guildBId === myGuild.id) {
                ct.guildBScore += points;
                myGuild.xp += points;
            } else {
                return;
            }

            // Check if win condition reached (e.g. 500 points)
            if (ct.guildAScore >= 500) {
                ct.winnerGuildId = ct.guildAId;
                ct.status = 'COMPLETED';
                const winGuild = this.guilds.find(g => g.id === ct.guildAId);
                if (winGuild) {
                    winGuild.xp += ct.xpStake;
                    winGuild.contestsWon = (winGuild.contestsWon || 0) + 1;
                    winGuild.contestsPlayed = (winGuild.contestsPlayed || 0) + 1;
                }
            } else if (ct.guildBScore >= 500) {
                ct.winnerGuildId = ct.guildBId;
                ct.status = 'COMPLETED';
                const winGuild = this.guilds.find(g => g.id === ct.guildBId);
                if (winGuild) {
                    winGuild.xp += ct.xpStake;
                    winGuild.contestsWon = (winGuild.contestsWon || 0) + 1;
                    winGuild.contestsPlayed = (winGuild.contestsPlayed || 0) + 1;
                }
            }

            this.saveState();
            if (window.miraiAudio) window.miraiAudio.playLevelUp();
            this.render();
        }

        // ─── Tab Switching ───────────────────────────────────────────────────
        switchLeagueSubTab(tabName) {
            if (this.activeSubTab === 'arena-league' && tabName !== 'arena-league') {
                if (window.unmountReactLeagueModule) window.unmountReactLeagueModule('guildSystemMount');
            }
            this.activeSubTab = tabName;
            this.render();
            if (window.miraiAudio) window.miraiAudio.playClick();
        }

        // ─── Filter & Search Helpers ─────────────────────────────────────────
        setSearchTerm(term) {
            this.searchTerm = (term || '').trim().toLowerCase();
            this.renderFindGuildList();
        }

        setLevelFilter(filter) {
            this.selectedLevelFilter = filter;
            this.renderFindGuildList();
        }

        // ─── Main Render Dispatcher ──────────────────────────────────────────
        render() {
            const container = document.getElementById('guildSystemMount');
            if (!container) return;

            // Update sub-nav active classes
            document.querySelectorAll('.league-subnav-btn').forEach(btn => {
                if (btn.dataset.subtab === this.activeSubTab) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Update badges in subnav
            const myGuild = this.getMyGuild();
            const myBadge = document.getElementById('myGuildBadge');
            if (myBadge) {
                if (myGuild) {
                    myBadge.style.display = 'inline-block';
                    myBadge.innerText = myGuild.tag;
                } else {
                    myBadge.style.display = 'none';
                }
            }

            const activeBattlesBadge = document.getElementById('activeBattlesBadge');
            const activeCount = this.contests.filter(c => c.status === 'ACTIVE').length;
            if (activeBattlesBadge) {
                if (activeCount > 0) {
                    activeBattlesBadge.style.display = 'inline-block';
                    activeBattlesBadge.innerText = `${activeCount} LIVE`;
                } else {
                    activeBattlesBadge.style.display = 'none';
                }
            }

            // Hide/Show Existing Cadet Leaderboard content when switching tabs
            const existingCadetBoard = document.getElementById('existingCadetLeaderboardContent');
            const existingFairness = document.getElementById('fairnessLeaderboardContainer');
            const existingQuests = document.getElementById('questsSectionContainer');

            if (this.activeSubTab === 'cadet-board') {
                if (existingCadetBoard) existingCadetBoard.style.display = 'block';
                if (existingFairness) existingFairness.style.display = 'block';
                if (existingQuests) existingQuests.style.display = 'block';
                container.innerHTML = '';
                return;
            } else {
                if (existingCadetBoard) existingCadetBoard.style.display = 'none';
                if (existingFairness) existingFairness.style.display = 'none';
                if (existingQuests) existingQuests.style.display = 'none';
            }

            // Render selected Guild module
            switch (this.activeSubTab) {
                case 'arena-league':
                    container.innerHTML = '';
                    if (window.mountReactLeagueModule) {
                        window.mountReactLeagueModule('guildSystemMount');
                    }
                    break;
                case 'my-guild':
                    container.innerHTML = this.renderMyGuildView();
                    break;
                case 'find-guild':
                    container.innerHTML = this.renderFindGuildView();
                    break;
                case 'guild-battles':
                    container.innerHTML = this.renderGuildBattlesView();
                    break;
                case 'guild-rankings':
                    container.innerHTML = this.renderGuildRankingsView();
                    break;
                case 'create-guild':
                    container.innerHTML = this.renderCreateGuildView();
                    break;
                default:
                    container.innerHTML = '';
            }
        }

        // ─── View 1: My Guild View ───────────────────────────────────────────
        renderMyGuildView() {
            const guild = this.getMyGuild();
            const studentLevel = this.getStudentLevel();

            if (!guild) {
                return `
                    <div class="guild-empty-banner">
                        <div class="geb-icon">🛡️</div>
                        <h3>You Haven't Joined a Guild Yet</h3>
                        <p>Join an active learning guild within your level bracket (Level ${Math.max(1, studentLevel - 3)} - ${studentLevel + 3}) or create your own guild to battle other teams!</p>
                        <div class="geb-actions">
                            <button class="guild-btn primary-glow" onclick="window.msotGuild.switchLeagueSubTab('find-guild')">
                                🔍 BROWSE GUILDS
                            </button>
                            <button class="guild-btn secondary-ghost" onclick="window.msotGuild.switchLeagueSubTab('create-guild')">
                                ➕ CREATE A GUILD
                            </button>
                        </div>
                    </div>
                `;
            }

            const myMem = this.getMyMembership(guild);
            const isOwner = myMem && myMem.role === 'OWNER';
            const isOfficer = myMem && (myMem.role === 'OWNER' || myMem.role === 'OFFICER');

            return `
                <div class="guild-dossier-card scroll-reveal">
                    <!-- Guild Header Banner -->
                    <div class="guild-dossier-header">
                        <div class="gdh-brand">
                            <div class="gdh-avatar">${guild.avatar || '🛡️'}</div>
                            <div class="gdh-title-wrap">
                                <div class="gdh-name-row">
                                    <h2 class="gdh-name">${guild.name}</h2>
                                    <span class="gdh-tag">${guild.tag}</span>
                                    <span class="gdh-role-pill ${myMem.role.toLowerCase()}">${myMem.role}</span>
                                </div>
                                <p class="gdh-desc">${guild.description}</p>
                            </div>
                        </div>
                        <div class="gdh-actions">
                            ${isOfficer ? `
                                <button class="guild-btn war-glow" onclick="window.msotGuild.openChallengeModal('${guild.id}')">
                                    ⚔️ ISSUE CHALLENGE
                                </button>
                            ` : ''}
                            <button class="guild-btn danger-outline" onclick="if(confirm('Are you sure you want to leave ${guild.name}?')) window.msotGuild.leaveGuild('${guild.id}')">
                                🚪 LEAVE GUILD
                            </button>
                        </div>
                    </div>

                    <!-- Guild Stats Metric Strip -->
                    <div class="guild-metrics-strip">
                        <div class="gm-item">
                            <span class="gm-label">TARGET LEVEL</span>
                            <span class="gm-val highlight-cyan">LVL ${guild.targetLevel}</span>
                        </div>
                        <div class="gm-item">
                            <span class="gm-label">ALLOWED BRACKET</span>
                            <span class="gm-val highlight-green">LVL ${guild.minLevel} – ${guild.maxLevel}</span>
                        </div>
                        <div class="gm-item">
                            <span class="gm-label">TOTAL GUILD XP</span>
                            <span class="gm-val highlight-gold">${guild.xp.toLocaleString()} XP</span>
                        </div>
                        <div class="gm-item">
                            <span class="gm-label">MEMBERS</span>
                            <span class="gm-val">${guild.members.length} / ${guild.capacity}</span>
                        </div>
                        <div class="gm-item">
                            <span class="gm-label">CONTEST RECORD</span>
                            <span class="gm-val">${guild.contestsWon || 0}W / ${(guild.contestsPlayed || 0) - (guild.contestsWon || 0)}L</span>
                        </div>
                    </div>

                    <!-- Members Roster Table -->
                    <div class="guild-roster-box">
                        <div class="roster-top-bar">
                            <h3>GUILD ROSTER (${guild.members.length} MEMBERS)</h3>
                            <span class="roster-hint">Protected by Two-Way Anonymous Mode Privacy</span>
                        </div>
                        <div class="league-table-wrap">
                            <table class="league-table guild-table">
                                <thead>
                                    <tr>
                                        <th>CADET</th>
                                        <th>LEVEL</th>
                                        <th>GUILD ROLE</th>
                                        <th>XP CONTRIBUTION</th>
                                        <th>JOINED</th>
                                        ${isOfficer ? '<th>ACTIONS</th>' : ''}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${guild.members.map(m => {
                                        const identity = this.getDisplayIdentity(m);
                                        const isSelf = m.userId === this.getCurrentStudentId();
                                        return `
                                            <tr class="${isSelf ? 'active-cadet-row' : ''}">
                                                <td>
                                                    <div class="cadet-cell-wrap">
                                                        <span class="cadet-avatar-badge">${identity.avatar}</span>
                                                        <div class="cadet-name-info">
                                                            <strong class="cadet-full-name">${identity.name}</strong>
                                                            ${identity.isAnon ? '<span class="anon-pill">ANONYMOUS</span>' : ''}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span class="lvl-badge">LVL ${m.level || 5}</span></td>
                                                <td><span class="role-badge ${m.role.toLowerCase()}">${m.role}</span></td>
                                                <td><span class="xp-val">+${(m.xpContribution || 0).toLocaleString()} XP</span></td>
                                                <td><span class="date-txt">${m.joinedAt ? m.joinedAt.split('T')[0] : 'Active'}</span></td>
                                                ${isOfficer ? `
                                                    <td>
                                                        ${!isSelf && m.role !== 'OWNER' ? `
                                                            <div class="roster-action-btns">
                                                                ${isOwner && m.role === 'MEMBER' ? `
                                                                    <button class="tbl-btn promote" title="Promote to Officer" onclick="window.msotGuild.manageMember('${guild.id}', '${m.userId}', 'PROMOTE')">▲ Officer</button>
                                                                ` : ''}
                                                                ${isOwner && m.role === 'OFFICER' ? `
                                                                    <button class="tbl-btn demote" title="Demote to Member" onclick="window.msotGuild.manageMember('${guild.id}', '${m.userId}', 'DEMOTE')">▼ Demote</button>
                                                                ` : ''}
                                                                <button class="tbl-btn kick" title="Kick member" onclick="if(confirm('Remove this member?')) window.msotGuild.manageMember('${guild.id}', '${m.userId}', 'KICK')">✕ Kick</button>
                                                            </div>
                                                        ` : '<span style="color:var(--text-muted); font-size:11px;">–</span>'}
                                                    </td>
                                                ` : ''}
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }

        // ─── View 2: Find & Discover Guilds ──────────────────────────────────
        renderFindGuildView() {
            const studentLevel = this.getStudentLevel();
            const myGuild = this.getMyGuild();

            return `
                <div class="guild-discovery-wrap scroll-reveal">
                    <!-- Controls Bar -->
                    <div class="discovery-header-card">
                        <div class="dh-left">
                            <span class="fairness-tag">MATCHMAKING & FAIR COHORT BRACKETS</span>
                            <h2 class="section-title">FIND & JOIN A LEARNING GUILD</h2>
                            <p class="section-subtitle">
                                Your current rank: <strong>Level ${studentLevel}</strong>. Guilds enforce level limits (Target ± 3) to ensure fair competitive learning.
                            </p>
                        </div>
                        <div class="dh-right">
                            <div class="search-input-wrap">
                                <span class="si-icon">🔍</span>
                                <input type="text" id="guildSearchInput" placeholder="Search by Guild Name or Tag..." 
                                       value="${this.searchTerm}" 
                                       oninput="window.msotGuild.setSearchTerm(this.value)">
                            </div>
                            <div class="filter-pills">
                                <button class="fp-btn ${this.selectedLevelFilter === 'all' ? 'active' : ''}" 
                                        onclick="window.msotGuild.setLevelFilter('all')">All Guilds</button>
                                <button class="fp-btn ${this.selectedLevelFilter === 'eligible' ? 'active' : ''}" 
                                        onclick="window.msotGuild.setLevelFilter('eligible')">Eligible for Me (Lvl ${Math.max(1, studentLevel - 3)}–${studentLevel + 3})</button>
                            </div>
                        </div>
                    </div>

                    ${myGuild ? `
                        <div class="current-membership-alert">
                            <span>🛡️ You are currently a member of <strong>${myGuild.name}</strong> (${myGuild.tag}).</span>
                            <div class="cma-actions">
                                <button class="cma-btn" onclick="window.msotGuild.switchLeagueSubTab('my-guild')">View My Guild</button>
                                <button class="cma-btn danger" onclick="if(confirm('Leave ${myGuild.name}?')) window.msotGuild.leaveGuild('${myGuild.id}')">Leave Guild</button>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Guild Cards Grid -->
                    <div class="guild-cards-grid" id="guildCardsGrid">
                        ${this.renderGuildCardsHtml()}
                    </div>
                </div>
            `;
        }

        renderFindGuildList() {
            const grid = document.getElementById('guildCardsGrid');
            if (grid) {
                grid.innerHTML = this.renderGuildCardsHtml();
            }
        }

        renderGuildCardsHtml() {
            const studentLevel = this.getStudentLevel();
            const myGuild = this.getMyGuild();

            let list = [...this.guilds];

            // Apply search
            if (this.searchTerm) {
                list = list.filter(g => 
                    g.name.toLowerCase().includes(this.searchTerm) || 
                    g.tag.toLowerCase().includes(this.searchTerm) ||
                    (g.description || '').toLowerCase().includes(this.searchTerm)
                );
            }

            // Apply level eligibility filter
            if (this.selectedLevelFilter === 'eligible') {
                list = list.filter(g => studentLevel >= g.minLevel && studentLevel <= g.maxLevel);
            }

            // Sort by XP rank
            list.sort((a, b) => (b.xp || 0) - (a.xp || 0));

            if (list.length === 0) {
                return `
                    <div class="no-guilds-box" style="grid-column: 1 / -1;">
                        <div style="font-size: 32px; margin-bottom: 8px;">🛡️</div>
                        <h4>No Guilds Found</h4>
                        <p>No guilds match your search query or level filters. Try broadening your criteria or create a new guild!</p>
                        <button class="guild-btn primary-glow mt-10" onclick="window.msotGuild.switchLeagueSubTab('create-guild')">➕ CREATE GUILD</button>
                    </div>
                `;
            }

            return list.map((g, idx) => {
                const isMemberOfThis = myGuild && myGuild.id === g.id;
                const isEligible = studentLevel >= g.minLevel && studentLevel <= g.maxLevel;
                const isFull = g.members.length >= g.capacity;

                return `
                    <div class="guild-card ${isMemberOfThis ? 'card-my-guild' : ''} ${!isEligible ? 'card-ineligible' : ''}">
                        <div class="gc-top">
                            <div class="gc-avatar">${g.avatar || '🛡️'}</div>
                            <div class="gc-meta">
                                <div class="gc-title-row">
                                    <h3 class="gc-name">${g.name}</h3>
                                    <span class="gc-tag">${g.tag}</span>
                                </div>
                                <div class="gc-rank-badge">#${idx + 1} • ${g.xp.toLocaleString()} XP</div>
                            </div>
                        </div>

                        <p class="gc-desc">${g.description || 'Dedicated learning guild.'}</p>

                        <!-- Level Bracket Pillar -->
                        <div class="gc-bracket-pill ${isEligible ? 'eligible' : 'ineligible'}">
                            <span class="gbp-label">LEVEL BRACKET:</span>
                            <strong>LEVEL ${g.minLevel} – ${g.maxLevel}</strong>
                            ${isEligible 
                                ? '<span class="status-chip success">✓ ELIGIBLE</span>' 
                                : `<span class="status-chip fail">✕ REQUIRES LVL ${g.minLevel}–${g.maxLevel}</span>`}
                        </div>

                        <!-- Capacity Bar -->
                        <div class="gc-capacity-wrap">
                            <div class="gc-cap-info">
                                <span>Members</span>
                                <strong>${g.members.length} / ${g.capacity}</strong>
                            </div>
                            <div class="gc-cap-bar">
                                <div class="gc-cap-fill" style="width: ${Math.min(100, Math.round((g.members.length / g.capacity) * 100))}%;"></div>
                            </div>
                        </div>

                        <!-- Join / Status Button -->
                        <div class="gc-foot">
                            ${isMemberOfThis ? `
                                <button class="guild-btn success-btn w-full" onclick="window.msotGuild.switchLeagueSubTab('my-guild')">
                                    ✓ MY GUILD
                                </button>
                            ` : (myGuild ? `
                                <button class="guild-btn disabled-btn w-full" disabled title="You are already in another guild">
                                    Already in a Guild
                                </button>
                            ` : (!isEligible ? `
                                <button class="guild-btn disabled-btn w-full" disabled title="Your level (${studentLevel}) does not meet the guild bracket (${g.minLevel}-${g.maxLevel})">
                                    Level Requirement Not Met
                                </button>
                            ` : (isFull ? `
                                <button class="guild-btn disabled-btn w-full" disabled>
                                    Guild Full (${g.capacity}/${g.capacity})
                                </button>
                            ` : `
                                <button class="guild-btn primary-glow w-full" onclick="window.msotGuild.joinGuild('${g.id}')">
                                    ⚔️ JOIN GUILD
                                </button>
                            `)))}
                        </div>
                    </div>
                `;
            }).join('');
        }

        // ─── View 3: Guild vs Guild Battles & Contests ────────────────────────
        renderGuildBattlesView() {
            const myGuild = this.getMyGuild();
            const myMem = myGuild ? this.getMyMembership(myGuild) : null;
            const isOfficer = myMem && (myMem.role === 'OWNER' || myMem.role === 'OFFICER');

            return `
                <div class="guild-battles-wrap scroll-reveal">
                    <!-- Battles Intro -->
                    <div class="battles-header-card">
                        <div class="bh-left">
                            <span class="fairness-tag">EDUCATIONAL CLAN CLASH & COLLABORATIVE ARENA</span>
                            <h2 class="section-title">GUILD VS GUILD CHALLENGES</h2>
                            <p class="section-subtitle">
                                Challenge opposing guilds in <strong>Quiz Battles</strong>, <strong>Coding Sprints</strong>, and <strong>24-Hour XP Gauntlets</strong>. 
                                Points scored by members increase your Guild XP and unlock prestigious badges.
                            </p>
                        </div>
                        <div class="bh-right">
                            ${myGuild && isOfficer ? `
                                <button class="guild-btn war-glow" onclick="window.msotGuild.openChallengeModal('${myGuild.id}')">
                                    ⚔️ ISSUE NEW CHALLENGE
                                </button>
                            ` : (myGuild ? `
                                <span class="bh-hint">Only Guild Owners & Officers can issue challenges.</span>
                            ` : `
                                <button class="guild-btn primary-glow" onclick="window.msotGuild.switchLeagueSubTab('find-guild')">
                                    🛡️ JOIN A GUILD TO BATTLE
                                </button>
                            `)}
                        </div>
                    </div>

                    <!-- Live Contests Section -->
                    <div class="contests-block">
                        <div class="cb-title-bar">
                            <div class="live-dot-wrap">
                                <span class="live-pulse-dot"></span>
                                <h3>LIVE & UPCOMING CONTESTS</h3>
                            </div>
                            <span class="cb-hint">Real-Time Team XP Staking</span>
                        </div>

                        ${this.contests.length === 0 ? `
                            <div class="empty-contests-box">
                                <div style="font-size: 32px; margin-bottom: 8px;">⚔️</div>
                                <h4>No Active Contests Right Now</h4>
                                <p>Issue a challenge to another guild or accept pending challenges below to launch a contest!</p>
                            </div>
                        ` : `
                            <div class="contests-grid">
                                ${this.contests.map(ct => {
                                    const guildA = this.guilds.find(g => g.id === ct.guildAId) || { name: 'Guild A', tag: '#GA', avatar: '🛡️' };
                                    const guildB = this.guilds.find(g => g.id === ct.guildBId) || { name: 'Guild B', tag: '#GB', avatar: '⚔️' };
                                    const totalScore = (ct.guildAScore + ct.guildBScore) || 1;
                                    const aPercent = Math.round((ct.guildAScore / totalScore) * 100);
                                    const isParticipant = myGuild && (myGuild.id === ct.guildAId || myGuild.id === ct.guildBId);

                                    return `
                                        <div class="contest-card ${ct.status.toLowerCase()}">
                                            <div class="ct-header">
                                                <span class="ct-type-badge">${ct.contestType.replace('_', ' ')}</span>
                                                <span class="ct-stake-badge">Bounty: +${ct.xpStake} Guild XP</span>
                                                <span class="ct-status-pill ${ct.status.toLowerCase()}">${ct.status}</span>
                                            </div>

                                            <h4 class="ct-title">${ct.contestName}</h4>
                                            <p class="ct-desc">${ct.description}</p>

                                            <!-- Versus Battle Meter -->
                                            <div class="ct-clash-board">
                                                <div class="ct-team ct-team-a">
                                                    <span class="ct-team-avatar">${guildA.avatar}</span>
                                                    <strong class="ct-team-name">${guildA.name}</strong>
                                                    <span class="ct-team-score">${ct.guildAScore} PTS</span>
                                                </div>

                                                <div class="ct-vs-badge">VS</div>

                                                <div class="ct-team ct-team-b">
                                                    <span class="ct-team-avatar">${guildB.avatar}</span>
                                                    <strong class="ct-team-name">${guildB.name}</strong>
                                                    <span class="ct-team-score">${ct.guildBScore} PTS</span>
                                                </div>
                                            </div>

                                            <!-- Progress Bar -->
                                            <div class="ct-bar-wrap">
                                                <div class="ct-bar-fill-a" style="width: ${aPercent}%;"></div>
                                                <div class="ct-bar-fill-b" style="width: ${100 - aPercent}%;"></div>
                                            </div>

                                            <!-- Action Button -->
                                            <div class="ct-action-row">
                                                ${ct.status === 'ACTIVE' && isParticipant ? `
                                                    <button class="guild-btn war-glow w-full" onclick="window.msotGuild.contributeToContest('${ct.id}', 25)">
                                                        ⚡ EARN +25 PTS FOR ${myGuild.tag}
                                                    </button>
                                                ` : (ct.status === 'COMPLETED' ? `
                                                    <div class="winner-banner">
                                                        🏆 WINNER: ${ct.winnerGuildId === ct.guildAId ? guildA.name : guildB.name}
                                                    </div>
                                                ` : `
                                                    <span class="spectator-txt">Spectating Live Battle</span>
                                                `)}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `}
                    </div>

                    <!-- Pending Challenges Section -->
                    <div class="challenges-block">
                        <div class="cb-title-bar">
                            <h3>CHALLENGE INBOX & REQUESTS (${this.challenges.length})</h3>
                        </div>

                        ${this.challenges.length === 0 ? `
                            <p style="color:var(--text-muted); font-size:13px;">No pending challenge requests.</p>
                        ` : `
                            <div class="challenges-list">
                                ${this.challenges.map(ch => {
                                    const sender = this.guilds.find(g => g.id === ch.senderGuildId) || { name: 'Challenger', tag: '#CH' };
                                    const receiver = this.guilds.find(g => g.id === ch.receiverGuildId) || { name: 'Defender', tag: '#DF' };
                                    const isReceiver = myGuild && myGuild.id === ch.receiverGuildId;
                                    const isSender = myGuild && myGuild.id === ch.senderGuildId;

                                    return `
                                        <div class="challenge-item ${ch.status.toLowerCase()}">
                                            <div class="ci-left">
                                                <span class="ci-type">${ch.contestType.replace('_', ' ')}</span>
                                                <h4 class="ci-title">${ch.title}</h4>
                                                <div class="ci-meta">
                                                    <span>${sender.name} (${sender.tag})</span>
                                                    <span>⚔️ VS ⚔️</span>
                                                    <span>${receiver.name} (${receiver.tag})</span>
                                                    <span class="ci-stake">Stake: +${ch.xpStake} XP</span>
                                                </div>
                                            </div>
                                            <div class="ci-right">
                                                <span class="status-chip ${ch.status.toLowerCase()}">${ch.status}</span>
                                                ${ch.status === 'PENDING' && isReceiver && isOfficer ? `
                                                    <div class="ci-btn-group">
                                                        <button class="guild-btn success-btn sm" onclick="window.msotGuild.respondChallenge('${ch.id}', 'ACCEPT')">Accept</button>
                                                        <button class="guild-btn danger-outline sm" onclick="window.msotGuild.respondChallenge('${ch.id}', 'REJECT')">Decline</button>
                                                    </div>
                                                ` : ''}
                                                ${ch.status === 'PENDING' && isSender && isOfficer ? `
                                                    <button class="guild-btn danger-outline sm" onclick="window.msotGuild.respondChallenge('${ch.id}', 'CANCEL')">Cancel</button>
                                                ` : ''}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `}
                    </div>
                </div>
            `;
        }

        // ─── View 4: Dynamic Guild Leaderboard Rankings ───────────────────────
        renderGuildRankingsView() {
            const sortedGuilds = [...this.guilds].sort((a, b) => (b.xp || 0) - (a.xp || 0));
            const myGuild = this.getMyGuild();

            return `
                <div class="guild-rankings-wrap scroll-reveal">
                    <div class="section-intro-block">
                        <span class="section-tagline">OFFICIAL CLAN RANKINGS & COHORT HONORS</span>
                        <h2 class="section-title">GLOBAL GUILD LEADERBOARD</h2>
                        <p class="section-subtitle">
                            Guilds compete for seasonal trophies through collective problem solving, test performance, and guild-vs-guild victories.
                        </p>
                    </div>

                    <div class="leagues-wrapper">
                        <div class="league-table-wrap">
                            <table class="league-table">
                                <thead>
                                    <tr>
                                        <th class="th-rank">RANK</th>
                                        <th class="th-cadet">GUILD NAME</th>
                                        <th>LEVEL BRACKET</th>
                                        <th>MEMBERS</th>
                                        <th>BATTLES WON</th>
                                        <th class="th-xp">TOTAL GUILD XP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${sortedGuilds.map((g, idx) => {
                                        const rank = idx + 1;
                                        const isMine = myGuild && myGuild.id === g.id;
                                        let rankBadge = `${rank}`;
                                        if (rank === 1) rankBadge = `🥇 1`;
                                        else if (rank === 2) rankBadge = `🥈 2`;
                                        else if (rank === 3) rankBadge = `🥉 3`;

                                        return `
                                            <tr class="${isMine ? 'active-cadet-row' : ''}">
                                                <td>
                                                    <div class="rank-badge rank-${rank <= 3 ? rank : 'other'}">${rankBadge}</div>
                                                </td>
                                                <td>
                                                    <div class="cadet-cell-wrap">
                                                        <span class="cadet-avatar-badge">${g.avatar || '🛡️'}</span>
                                                        <div class="cadet-name-info">
                                                            <strong class="cadet-full-name">${g.name} ${isMine ? '(Your Guild)' : ''}</strong>
                                                            <span class="cadet-track-sub">${g.tag}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span class="lvl-badge">LVL ${g.minLevel} – ${g.maxLevel}</span></td>
                                                <td>${g.members.length} / ${g.capacity}</td>
                                                <td><span style="color:#00ff88; font-weight:700;">${g.contestsWon || 0} Wins</span></td>
                                                <td><span class="xp-val highlight-gold">${g.xp.toLocaleString()} XP</span></td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }

        // ─── View 5: Create Guild with Dynamic Level Calculation ─────────────
        renderCreateGuildView() {
            const studentLevel = this.getStudentLevel();
            const range = this.calculateLevelRange(studentLevel);
            const myGuild = this.getMyGuild();

            if (myGuild) {
                return `
                    <div class="guild-empty-banner">
                        <div class="geb-icon">⚠️</div>
                        <h3>You Already Belong to a Guild</h3>
                        <p>You are an active member of <strong>${myGuild.name}</strong> (${myGuild.tag}). Under the fair competition rules, each student can only belong to one active guild at a time.</p>
                        <div class="geb-actions">
                            <button class="guild-btn primary-glow" onclick="window.msotGuild.switchLeagueSubTab('my-guild')">VIEW MY GUILD</button>
                            <button class="guild-btn danger-outline" onclick="if(confirm('Leave ${myGuild.name}?')) window.msotGuild.leaveGuild('${myGuild.id}')">LEAVE CURRENT GUILD</button>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="guild-creation-card scroll-reveal">
                    <div class="gcc-header">
                        <span class="fairness-tag">FOUND A NEW COHORT SQUAD</span>
                        <h2 class="section-title">CREATE A LEARNING GUILD</h2>
                        <p class="section-subtitle">
                            As founder, you automatically become the <strong>Guild Owner</strong>. 
                            The Guild's membership level range is automatically locked to your current student level to ensure fair matchmaking.
                        </p>
                    </div>

                    <!-- Automatic Dynamic Level Calculation Banner -->
                    <div class="level-calculation-infobox">
                        <div class="lci-icon">⚡</div>
                        <div class="lci-details">
                            <h4>DYNAMIC LEVEL BRACKET CALCULATION (AUTOMATIC)</h4>
                            <div class="lci-formula-row">
                                <div class="lci-formula-step">
                                    <span class="step-lbl">Your Student Level</span>
                                    <strong class="step-val highlight-cyan">Level ${studentLevel}</strong>
                                </div>
                                <div class="lci-op">➔</div>
                                <div class="lci-formula-step">
                                    <span class="step-lbl">Guild Target Level</span>
                                    <strong class="step-val">Level ${range.target}</strong>
                                </div>
                                <div class="lci-op">➔</div>
                                <div class="lci-formula-step">
                                    <span class="step-lbl">Allowed Member Range [±3]</span>
                                    <strong class="step-val highlight-green">Level ${range.min} – Level ${range.max}</strong>
                                </div>
                            </div>
                            <p class="lci-note">Only students between Level ${range.min} and Level ${range.max} will be eligible to join your guild.</p>
                        </div>
                    </div>

                    <!-- Creation Form -->
                    <form class="guild-create-form" onsubmit="window.msotGuild.handleCreateFormSubmit(event)">
                        <div class="form-row">
                            <div class="form-col">
                                <label for="guildNameInput">Guild Name *</label>
                                <input type="text" id="guildNameInput" required placeholder="e.g. Code Warriors, Algorithm Knights" maxlength="50">
                            </div>
                            <div class="form-col">
                                <label for="guildTagInput">Guild Tag (Unique) *</label>
                                <input type="text" id="guildTagInput" required placeholder="#CW01, #AI99" maxlength="8">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="guildDescInput">Guild Mission & Philosophy</label>
                            <textarea id="guildDescInput" rows="3" placeholder="Describe your guild's focus (e.g. C++ Algorithms, Web Dev, Daily Streak consistency)..."></textarea>
                        </div>

                        <div class="form-group">
                            <label>Guild Crest Avatar</label>
                            <div class="avatar-selector-grid">
                                ${['🛡️', '⚔️', '🧠', '⚡', '🥷', '💎', '🔥', '🌸', '🎯', '🔮', '🦊', '🐱'].map((icon, idx) => `
                                    <label class="avatar-option-pill">
                                        <input type="radio" name="guildAvatar" value="${icon}" ${idx === 0 ? 'checked' : ''}>
                                        <span class="ao-icon">${icon}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <div class="form-foot">
                            <button type="submit" class="guild-btn primary-glow lg">
                                ⛩️ INITIATE & FOUND GUILD
                            </button>
                        </div>
                    </form>
                </div>
            `;
        }

        async handleCreateFormSubmit(e) {
            e.preventDefault();
            const name = document.getElementById('guildNameInput')?.value;
            const tag = document.getElementById('guildTagInput')?.value;
            const description = document.getElementById('guildDescInput')?.value;
            const avatar = document.querySelector('input[name="guildAvatar"]:checked')?.value || '🛡️';

            try {
                await this.createGuild({ name, tag, description, avatar });
            } catch (err) {
                alert(err.message);
            }
        }

        // ─── Modal: Send Challenge ───────────────────────────────────────────
        openChallengeModal(senderGuildId) {
            const senderGuild = this.guilds.find(g => g.id === senderGuildId);
            if (!senderGuild) return;

            const targets = this.guilds.filter(g => g.id !== senderGuildId);

            const modalHtml = `
                <div class="guild-modal-overlay" id="challengeModalOverlay" onclick="if(event.target === this) this.remove()">
                    <div class="guild-modal-card">
                        <div class="gmc-header">
                            <h3>⚔️ ISSUE GUILD CHALLENGE</h3>
                            <button class="gmc-close" onclick="document.getElementById('challengeModalOverlay').remove()">✕</button>
                        </div>
                        <form onsubmit="window.msotGuild.handleChallengeSubmit(event, '${senderGuildId}')">
                            <div class="form-group">
                                <label>Target Opponent Guild *</label>
                                <select id="challengeTargetGuild" required>
                                    ${targets.map(t => `<option value="${t.id}">${t.name} (${t.tag}) • Lvl ${t.minLevel}-${t.maxLevel} • ${t.xp.toLocaleString()} XP</option>`).join('')}
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Contest Type *</label>
                                <select id="challengeContestType" required>
                                    <option value="QUIZ_BATTLE">⚡ Quiz Battle (Speed Trial Showdown)</option>
                                    <option value="CODING_CHALLENGE">💻 Coding Challenge (Algorithm Sprint)</option>
                                    <option value="XP_BATTLE">🔥 XP Battle (24-Hour Cohort Surge)</option>
                                    <option value="PROBLEM_SOLVING">🧩 Problem Solving Gauntlet</option>
                                    <option value="WEEKLY_LEARNING">📚 Weekly Learning Sprint</option>
                                    <option value="STREAK_CHALLENGE">🛡️ Streak Challenge (Consistency Clash)</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Challenge Title *</label>
                                <input type="text" id="challengeTitleInput" required placeholder="e.g. Sacred Algorithm Showdown" value="${senderGuild.name} Clash">
                            </div>

                            <div class="form-group">
                                <label>Bounty Stake</label>
                                <select id="challengeStake">
                                    <option value="250">+250 Guild XP Bounty</option>
                                    <option value="350" selected>+350 Guild XP Bounty</option>
                                    <option value="500">+500 Guild XP Bounty</option>
                                </select>
                            </div>

                            <div class="modal-actions">
                                <button type="button" class="guild-btn secondary-ghost" onclick="document.getElementById('challengeModalOverlay').remove()">Cancel</button>
                                <button type="submit" class="guild-btn war-glow">SEND CHALLENGE</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            const existing = document.getElementById('challengeModalOverlay');
            if (existing) existing.remove();
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        handleChallengeSubmit(e, senderGuildId) {
            e.preventDefault();
            const targetId = document.getElementById('challengeTargetGuild')?.value;
            const contestType = document.getElementById('challengeContestType')?.value;
            const title = document.getElementById('challengeTitleInput')?.value;
            const stake = parseInt(document.getElementById('challengeStake')?.value) || 300;

            try {
                this.sendChallenge(targetId, contestType, title, `Educational ${contestType.replace('_', ' ')} showdown.`);
                const modal = document.getElementById('challengeModalOverlay');
                if (modal) modal.remove();
            } catch (err) {
                alert(err.message);
            }
        }
    }

    // Initialize Global Singleton
    window.msotGuild = new GuildManager();
})();
