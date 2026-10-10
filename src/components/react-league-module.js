/**
 * ==============================================================================
 * MSOT LEARN - REACT + FRAMER MOTION + TAILWIND CSS LEAGUE ARENA MODULE
 * ==============================================================================
 * Technologies: React.js (v18), Framer Motion, Tailwind CSS, JavaScript (ES6)
 * Description: Real-time 20-Cadet Matchmaking Micro-Leagues with Incognito
 * Privacy Toggle and Framer Motion spring physics.
 */

(function () {
    const React = window.React;
    const ReactDOM = window.ReactDOM;
    const Motion = window.Motion || (window.framerMotion ? window.framerMotion : null);

    if (!React || !ReactDOM) {
        console.warn('React or ReactDOM not loaded yet.');
        return;
    }

    const h = React.createElement;
    const useState = React.useState;
    const useEffect = React.useEffect;
    const useMemo = React.useMemo;

    // Motion component helper (falls back to regular HTML tag if Framer Motion isn't ready)
    function m(tag) {
        if (Motion && Motion.motion && Motion.motion[tag]) {
            return Motion.motion[tag];
        }
        return tag;
    }

    // High quality 20-cadet seed data matching room GOLD-ROOM-042
    const INITIAL_CADETS_20 = [
        { userId: 'c-01', currentRank: 1, realName: 'Harsh', gamerTag: 'harsjh5217', realAvatar: '👑', anonymousAvatar: '🥷', weeklyXP: 1420, questionsSolved: 48, streakDays: 14, isAnonymous: false, isCurrentUser: false, zone: 'PROMOTION', trend: 'UP' },
        { userId: 'c-02', currentRank: 2, realName: 'Harsh Singh', gamerTag: 'harshsingh', realAvatar: '⚔️', anonymousAvatar: '🎭', weeklyXP: 1280, questionsSolved: 42, streakDays: 12, isAnonymous: false, isCurrentUser: false, zone: 'PROMOTION', trend: 'SAME' },
        { userId: 'c-03', currentRank: 3, realName: 'Utkarsh Cadet', gamerTag: 'utkarsh_cadet', realAvatar: '⚡', anonymousAvatar: '🦾', weeklyXP: 1150, questionsSolved: 39, streakDays: 9, isAnonymous: false, isCurrentUser: false, zone: 'PROMOTION', trend: 'UP' },
        { userId: 'c-04', currentRank: 4, realName: 'Utkarsh Raj', gamerTag: 'utkarsh_admin', realAvatar: '🛡️', anonymousAvatar: '🦊', weeklyXP: 990, questionsSolved: 33, streakDays: 8, isAnonymous: false, isCurrentUser: true, zone: 'PROMOTION', trend: 'UP' },
        { userId: 'c-05', currentRank: 5, realName: 'Aarav', gamerTag: 'aarav', realAvatar: '🔥', anonymousAvatar: '👻', weeklyXP: 870, questionsSolved: 28, streakDays: 6, isAnonymous: false, isCurrentUser: false, zone: 'PROMOTION', trend: 'DOWN' },
        { userId: 'c-06', currentRank: 6, realName: 'Kavya Nair', gamerTag: 'Neon_Specter', realAvatar: '🔮', anonymousAvatar: '🐉', weeklyXP: 780, questionsSolved: 26, streakDays: 7, isAnonymous: false, isCurrentUser: false, zone: 'SAFE', trend: 'SAME' },
        { userId: 'c-07', currentRank: 7, realName: 'Ishaan Verma', gamerTag: 'Glitch_Shogun', realAvatar: '🔥', anonymousAvatar: '⚡', weeklyXP: 720, questionsSolved: 23, streakDays: 5, isAnonymous: true, isCurrentUser: false, zone: 'SAFE', trend: 'UP' },
        { userId: 'c-08', currentRank: 8, realName: 'Sanya Kapoor', gamerTag: 'Apex_Shinobi', realAvatar: '🎯', anonymousAvatar: '🥷', weeklyXP: 680, questionsSolved: 21, streakDays: 5, isAnonymous: false, isCurrentUser: false, zone: 'SAFE', trend: 'SAME' },
        { userId: 'c-09', currentRank: 9, realName: 'Arjun Das', gamerTag: 'Void_Sentinel', realAvatar: '🦾', anonymousAvatar: '👾', weeklyXP: 640, questionsSolved: 20, streakDays: 4, isAnonymous: false, isCurrentUser: false, zone: 'SAFE', trend: 'DOWN' },
        { userId: 'c-10', currentRank: 10, realName: 'Diya Sen', gamerTag: 'Solar_Enigma', realAvatar: '✨', anonymousAvatar: '🦉', weeklyXP: 600, questionsSolved: 19, streakDays: 5, isAnonymous: true, isCurrentUser: false, zone: 'SAFE', trend: 'SAME' },
        { userId: 'c-11', currentRank: 11, realName: 'Kabir Joshi', gamerTag: 'Shadow_Reeve', realAvatar: '🦅', anonymousAvatar: '🐺', weeklyXP: 550, questionsSolved: 18, streakDays: 4, isAnonymous: false, isCurrentUser: false, zone: 'SAFE', trend: 'UP' },
        { userId: 'c-12', currentRank: 12, realName: 'Meera Rao', gamerTag: 'Astral_Warden', realAvatar: '🌙', anonymousAvatar: '🪐', weeklyXP: 510, questionsSolved: 16, streakDays: 3, isAnonymous: false, isCurrentUser: false, zone: 'SAFE', trend: 'DOWN' },
        { userId: 'c-13', currentRank: 13, realName: 'Aditya Bhat', gamerTag: 'Binary_Monk', realAvatar: '🧘', anonymousAvatar: '🥋', weeklyXP: 480, questionsSolved: 15, streakDays: 3, isAnonymous: true, isCurrentUser: false, zone: 'SAFE', trend: 'SAME' },
        { userId: 'c-14', currentRank: 14, realName: 'Tanvi Pillai', gamerTag: 'Cipher_Lotus', realAvatar: '🪷', anonymousAvatar: '🌺', weeklyXP: 440, questionsSolved: 14, streakDays: 2, isAnonymous: false, isCurrentUser: false, zone: 'SAFE', trend: 'UP' },
        { userId: 'c-15', currentRank: 15, realName: 'Vikram Singh', gamerTag: 'Iron_Titan', realAvatar: '⚔️', anonymousAvatar: '🗿', weeklyXP: 410, questionsSolved: 13, streakDays: 2, isAnonymous: false, isCurrentUser: false, zone: 'SAFE', trend: 'DOWN' },
        { userId: 'c-16', currentRank: 16, realName: 'Rhea Choudhury', gamerTag: 'Frost_Wraith', realAvatar: '❄️', anonymousAvatar: '🧊', weeklyXP: 360, questionsSolved: 11, streakDays: 1, isAnonymous: true, isCurrentUser: false, zone: 'RELEGATION', trend: 'DOWN' },
        { userId: 'c-17', currentRank: 17, realName: 'Harsh Vardhan', gamerTag: 'Ghost_Protocol', realAvatar: '🧭', anonymousAvatar: '👤', weeklyXP: 310, questionsSolved: 9, streakDays: 1, isAnonymous: false, isCurrentUser: false, zone: 'RELEGATION', trend: 'SAME' },
        { userId: 'c-18', currentRank: 18, realName: 'Sneha Kulkarni', gamerTag: 'Mirai_Nomad', realAvatar: '⛵', anonymousAvatar: '🌊', weeklyXP: 250, questionsSolved: 7, streakDays: 0, isAnonymous: false, isCurrentUser: false, zone: 'RELEGATION', trend: 'DOWN' },
        { userId: 'c-19', currentRank: 19, realName: 'Yash Mallick', gamerTag: 'Static_Viper', realAvatar: '🐍', anonymousAvatar: '🦂', weeklyXP: 190, questionsSolved: 5, streakDays: 0, isAnonymous: true, isCurrentUser: false, zone: 'RELEGATION', trend: 'DOWN' },
        { userId: 'c-20', currentRank: 20, realName: 'Nikhil Rane', gamerTag: 'Rogue_Cipher', realAvatar: '🎲', anonymousAvatar: '🥷', weeklyXP: 110, questionsSolved: 3, streakDays: 0, isAnonymous: false, isCurrentUser: false, zone: 'RELEGATION', trend: 'SAME' }
    ];

    const TIER_COLORS = {
        BRONZE: { name: 'BRONZE LEAGUE', color: '#cd7f32', border: 'border-[#cd7f32]/35', bg: 'bg-[#cd7f32]/10', glow: 'shadow-[0_0_20px_rgba(205,127,50,0.18)]' },
        SILVER: { name: 'SILVER LEAGUE', color: '#e2e8f0', border: 'border-slate-400/30', bg: 'bg-slate-400/10', glow: 'shadow-[0_0_20px_rgba(226,232,240,0.18)]' },
        GOLD: { name: 'GOLD LEAGUE', color: '#f59e0b', border: 'border-amber-400/35', bg: 'bg-amber-400/10', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]' },
        PLATINUM: { name: 'PLATINUM LEAGUE', color: '#38bdf8', border: 'border-cyan-400/35', bg: 'bg-cyan-400/10', glow: 'shadow-[0_0_20px_rgba(56,189,248,0.22)]' },
        DIAMOND: { name: 'DIAMOND LEAGUE', color: '#c084fc', border: 'border-purple-400/35', bg: 'bg-purple-400/10', glow: 'shadow-[0_0_20px_rgba(192,132,252,0.22)]' }
    };

    // Anonymous Toggle Sub-Component
    function AnonymousToggleComponent(props) {
        const isAnon = props.isAnonymous;
        const currentCadet = props.cadet;

        return h('div', {
            className: 'w-full bg-[#0c0e18]/90 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all'
        }, [
            // Ambient glow
            h('div', {
                key: 'glow',
                className: `absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all ${
                    isAnon ? 'bg-purple-600/15' : 'bg-cyan-500/10'
                }`
            }),
            h('div', {
                key: 'inner',
                className: 'flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10'
            }, [
                // Left: Avatar + Identity with Framer Motion spring
                h('div', { key: 'avatar-info', className: 'flex items-center gap-4' }, [
                    h(m('div'), {
                        key: isAnon ? 'ninja-avatar' : 'real-avatar',
                        initial: { scale: 0.8, rotate: -15, opacity: 0 },
                        animate: { scale: 1, rotate: 0, opacity: 1 },
                        transition: { type: 'spring', damping: 14, stiffness: 220 },
                        className: `w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl border-2 shadow-lg transition-colors ${
                            isAnon
                                ? 'bg-gradient-to-br from-purple-950/60 to-zinc-950 border-purple-500/50 shadow-[0_0_18px_rgba(168,85,247,0.3)]'
                                : 'bg-gradient-to-br from-cyan-950/40 to-zinc-900 border-cyan-400/50 shadow-[0_0_18px_rgba(6,182,212,0.25)]'
                        }`
                    }, isAnon ? currentCadet.anonymousAvatar : currentCadet.realAvatar),
                    h('div', { key: 'text-info' }, [
                        h('div', { className: 'flex items-center gap-2' }, [
                            h('span', { className: 'text-[11px] font-mono font-black uppercase tracking-wider text-zinc-400' }, 'ACTIVE IDENTITY:'),
                            h('span', {
                                className: `text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                                    isAnon
                                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                                        : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                                }`
                            }, isAnon ? '🥷 INCOGNITO MASKED' : '🛡️ PUBLIC PROFILE')
                        ]),
                        h('div', { className: 'text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5' }, [
                            h('span', { className: isAnon ? 'text-purple-400 font-mono' : 'text-white' },
                                isAnon ? currentCadet.gamerTag : currentCadet.realName
                            ),
                            h('span', { className: 'text-xs text-zinc-400' }, isAnon ? '✦ HIDDEN' : '✓ VERIFIED')
                        ]),
                        h('p', { className: 'text-xs text-zinc-400 mt-0.5 max-w-sm sm:max-w-md' },
                            isAnon
                                ? 'Your real identity and photo are masked from other students in the 20-cadet room.'
                                : 'Your real cadet name and photo are visible on the cohort leaderboard.'
                        )
                    ])
                ]),
                // Right: Switch Control
                h('div', {
                    key: 'toggle-btn-box',
                    className: 'flex items-center gap-4 bg-zinc-950/80 border border-white/10 p-3.5 sm:p-4 rounded-xl self-stretch md:self-auto justify-between md:justify-start'
                }, [
                    h('div', { className: 'flex flex-col' }, [
                        h('span', { className: 'text-xs sm:text-sm font-black text-white font-mono flex items-center gap-1.5' }, [
                            '🛡️ Go Anonymous'
                        ]),
                        h('span', { className: 'text-[11px] text-zinc-500 font-mono' },
                            isAnon ? 'Mask Active (Hidden)' : 'Click to Mask Real Name'
                        )
                    ]),
                    h('button', {
                        type: 'button',
                        role: 'switch',
                        'aria-checked': isAnon,
                        onClick: function () {
                            props.onToggle(!isAnon);
                            if (window.miraiAudio && window.miraiAudio.playClick) window.miraiAudio.playClick();
                        },
                        className: `w-14 h-8 rounded-full p-1 transition-colors duration-300 cursor-pointer relative focus:outline-none ${
                            isAnon ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-zinc-800'
                        }`
                    }, [
                        h(m('div'), {
                            layout: true,
                            transition: { type: 'spring', stiffness: 500, damping: 30 },
                            className: `w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-xs font-bold ${
                                isAnon ? 'ml-auto text-purple-600' : 'text-zinc-600'
                            }`
                        }, isAnon ? '🥷' : '👁️')
                    ])
                ])
            ])
        ]);
    }

    // Main React Weekly Leagues Module Component
    function ReactWeeklyLeaguesModule() {
        const [tier, setTier] = useState('GOLD');
        const [isAnonymous, setIsAnonymous] = useState(false);
        const [search, setSearch] = useState('');

        const currentCadet = useMemo(function () {
            // Check if user is logged in via MSOT auth session
            const session = (window.msotAuth && window.msotAuth.session) || (window.msotState && window.msotState.student) || null;
            const u = (session && session.user) ? session.user : session;
            if (u && (u.name || u.email)) {
                return {
                    userId: u.id || u.studentId || 'c-user',
                    realName: u.name || 'Utkarsh Raj',
                    gamerTag: u.username || u.alias || 'utkarsh_admin',
                    realAvatar: u.avatar || '🛡️',
                    anonymousAvatar: '🥷',
                    weeklyXP: u.weeklyXP || 1050,
                    questionsSolved: u.questionsSolved || 35,
                    streakDays: u.streak || 8
                };
            }
            return INITIAL_CADETS_20[3];
        }, []);

        const tierConfig = TIER_COLORS[tier] || TIER_COLORS.GOLD;

        const filteredCadets = useMemo(function () {
            let list = INITIAL_CADETS_20.map(function (cadet) {
                if (cadet.isCurrentUser) {
                    return Object.assign({}, cadet, {
                        realName: currentCadet.realName,
                        gamerTag: currentCadet.gamerTag,
                        realAvatar: currentCadet.realAvatar
                    });
                }
                return cadet;
            });
            if (search.trim()) {
                const s = search.toLowerCase();
                list = list.filter(function (c) {
                    return c.realName.toLowerCase().indexOf(s) !== -1 || c.gamerTag.toLowerCase().indexOf(s) !== -1;
                });
            }
            return list;
        }, [search, currentCadet]);

        return h('div', {
            className: 'w-full max-w-7xl mx-auto py-6 px-3 sm:px-6 flex flex-col gap-6 font-sans text-white'
        }, [
            // Top Tier Selector Bar
            h('div', {
                key: 'tier-bar',
                className: 'flex flex-wrap items-center justify-between gap-4 bg-zinc-900/70 p-3 rounded-2xl border border-white/10 backdrop-blur-md'
            }, [
                h('div', { className: 'flex items-center gap-2 overflow-x-auto py-1' },
                    ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'].map(function (tName) {
                        const active = tier === tName;
                        return h('button', {
                            key: tName,
                            type: 'button',
                            onClick: function () {
                                setTier(tName);
                                if (window.miraiAudio && window.miraiAudio.playClick) window.miraiAudio.playClick();
                            },
                            className: `px-4 py-2 rounded-xl text-xs font-mono font-black tracking-widest uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                                active
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-105'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                            }`
                        }, ['🏆 ', tName]);
                    })
                ),
                h('div', { className: 'flex items-center gap-2 text-xs font-mono text-zinc-400' }, [
                    h('span', { className: 'text-cyan-400 font-bold' }, 'ℹ️ MICRO-MATCHMAKING:'),
                    h('span', null, 'Exactly 20 students per isolated room')
                ])
            ]),

            // Incognito Masking Toggle
            h(AnonymousToggleComponent, {
                key: 'anon-toggle',
                isAnonymous: isAnonymous,
                cadet: currentCadet,
                onToggle: function (val) {
                    setIsAnonymous(val);
                }
            }),

            // The 20-Cadet Table Card
            h('div', {
                key: 'table-card',
                className: `w-full bg-[#080912]/95 border ${tierConfig.border} rounded-2xl p-4 sm:p-6 backdrop-blur-2xl ${tierConfig.glow} shadow-2xl relative overflow-hidden`
            }, [
                // Header Info
                h('div', {
                    key: 'table-header',
                    className: 'flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10'
                }, [
                    h('div', null, [
                        h('div', { className: 'flex items-center gap-2 mb-2' }, [
                            h('span', {
                                className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-black tracking-widest uppercase border ${tierConfig.bg} ${tierConfig.border}`
                            }, ['🏆 ', tierConfig.name]),
                            h('span', { className: 'text-xs font-mono text-zinc-500 px-2 py-0.5 rounded bg-white/5' },
                                `ROOM: ${tier}-MICRO-042`
                            )
                        ]),
                        h('h2', { className: 'text-2xl sm:text-3xl font-black text-white tracking-tight' },
                            'COHORT 20-CADET MATCHMAKING'
                        ),
                        h('p', { className: 'text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl' },
                            'Rankings reset every Sunday at midnight. Top 5 promote to higher tier, Bottom 5 relegate.'
                        )
                    ]),
                    // Resolution countdown
                    h('div', { className: 'flex items-center gap-3 bg-zinc-900/90 border border-white/10 px-5 py-3 rounded-xl font-mono' }, [
                        h('span', { className: 'text-xl' }, '⏱️'),
                        h('div', null, [
                            h('div', { className: 'text-[10px] text-zinc-400 uppercase tracking-widest font-bold' }, 'LEAGUE RESOLUTION'),
                            h('div', { className: 'text-sm font-black text-white' }, 'Sunday 23:59 PM (48h left)')
                        ])
                    ])
                ]),

                // Zone Legend Bars
                h('div', {
                    key: 'zones-legend',
                    className: 'grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 text-xs font-mono font-bold border-b border-white/5'
                }, [
                    h('div', { className: 'flex items-center gap-2 bg-emerald-950/30 border border-emerald-500/30 px-3.5 py-2 rounded-lg text-emerald-400' }, [
                        '⬆️ PROMOTION ZONE (Ranks 1 – 5)'
                    ]),
                    h('div', { className: 'flex items-center gap-2 bg-zinc-900/40 border border-white/10 px-3.5 py-2 rounded-lg text-zinc-400' }, [
                        '➖ SAFE ZONE (Ranks 6 – 15)'
                    ]),
                    h('div', { className: 'flex items-center gap-2 bg-rose-950/30 border border-rose-500/30 px-3.5 py-2 rounded-lg text-rose-400' }, [
                        '⬇️ RELEGATION DANGER (Ranks 16 – 20)'
                    ])
                ]),

                // Cadet Rows List with Framer Motion Stagger
                h('div', { key: 'cadets-list', className: 'flex flex-col gap-2 pt-4' },
                    filteredCadets.map(function (cadet, idx) {
                        const isCurrentUser = cadet.isCurrentUser;
                        const isPromo = cadet.currentRank <= 5;
                        const isReleg = cadet.currentRank >= 16;
                        const isMasked = isCurrentUser ? isAnonymous : cadet.isAnonymous;
                        const nameToDisplay = isCurrentUser ? (isAnonymous ? cadet.gamerTag : cadet.realName) : (cadet.isAnonymous ? cadet.gamerTag : cadet.realName);
                        const avatarToDisplay = isCurrentUser ? (isAnonymous ? cadet.anonymousAvatar : cadet.realAvatar) : (cadet.isAnonymous ? cadet.anonymousAvatar : cadet.realAvatar);

                        return h(React.Fragment, { key: cadet.userId }, [
                            // Divider markers
                            idx === 0 && h('div', { className: 'text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-2 py-1' }, [
                                h('span', { className: 'w-2 h-2 rounded-full bg-emerald-400 animate-ping' }),
                                'TOP 5 CADETS ADVANCE TO NEXT TIER'
                            ]),
                            idx === 5 && h('div', { className: 'text-[11px] font-mono font-bold text-zinc-500 flex items-center gap-2 pt-3 pb-1 border-t border-white/5' }, [
                                '─── SAFE ZONE (RETAIN TIER) ───'
                            ]),
                            idx === 15 && h('div', { className: 'text-[11px] font-mono font-bold text-rose-400 flex items-center gap-2 pt-3 pb-1 border-t border-white/5' }, [
                                '⚠️ BOTTOM 5 CADETS RELEGATE TO LOWER TIER'
                            ]),

                            // Cadet Row with Framer Motion entry animation
                            h(m('div'), {
                                initial: { opacity: 0, y: 8 },
                                animate: { opacity: 1, y: 0 },
                                transition: { delay: idx * 0.02 },
                                className: `flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all relative overflow-hidden ${
                                    isCurrentUser
                                        ? 'bg-gradient-to-r from-cyan-950/60 via-[#101930] to-cyan-950/60 border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.35)] ring-1 ring-cyan-400'
                                        : isPromo
                                        ? 'bg-emerald-950/15 border-emerald-500/25 hover:border-emerald-500/50'
                                        : isReleg
                                        ? 'bg-rose-950/15 border-rose-500/25 hover:border-rose-500/50'
                                        : 'bg-zinc-900/50 border-white/5 hover:border-white/20'
                                }`
                            }, [
                                // Active user edge indicator
                                isCurrentUser && h('div', {
                                    className: 'absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 via-emerald-400 to-cyan-400 animate-pulse'
                                }),

                                // Left: Rank, Avatar & Name
                                h('div', { className: 'flex items-center gap-3 sm:gap-4 min-w-0' }, [
                                    // Rank Number Box
                                    h('div', {
                                        className: `w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                                            cadet.currentRank === 1
                                                ? 'bg-gradient-to-br from-amber-300 to-amber-600 text-black shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                                                : cadet.currentRank === 2
                                                ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-black shadow-[0_0_12px_rgba(203,213,225,0.4)]'
                                                : cadet.currentRank === 3
                                                ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                                                : 'bg-zinc-900 border border-white/10 text-zinc-400'
                                        }`
                                    }, cadet.currentRank === 1 ? '👑' : cadet.currentRank),

                                    // Avatar
                                    h('div', {
                                        className: `w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xl border ${
                                            isCurrentUser
                                                ? 'border-cyan-400 bg-cyan-950/50'
                                                : isMasked
                                                ? 'border-purple-500/50 bg-purple-950/30'
                                                : 'border-white/10 bg-zinc-900'
                                        }`
                                    }, avatarToDisplay),

                                    // Cadet Meta
                                    h('div', { className: 'min-w-0 flex flex-col' }, [
                                        h('div', { className: 'flex items-center gap-2' }, [
                                            h('span', {
                                                className: `text-sm sm:text-base font-black truncate ${
                                                    isCurrentUser
                                                        ? 'text-cyan-300 font-mono'
                                                        : isMasked
                                                        ? 'text-purple-300 font-mono'
                                                        : 'text-white'
                                                }`
                                            }, nameToDisplay),
                                            isCurrentUser && h('span', {
                                                className: 'px-2 py-0.5 rounded-full bg-cyan-400 text-black text-[9px] font-black font-mono'
                                            }, 'YOU'),
                                            isMasked && h('span', {
                                                className: 'text-[10px] text-purple-400 font-mono px-1.5 py-0.5 rounded bg-purple-950/40 border border-purple-500/30'
                                            }, '🥷 MASKED')
                                        ]),
                                        h('div', { className: 'flex items-center gap-3 text-[11px] text-zinc-500 font-mono mt-0.5' }, [
                                            h('span', null, `${cadet.questionsSolved} Solved`),
                                            h('span', null, '•'),
                                            h('span', { className: 'text-amber-400' }, `🔥 ${cadet.streakDays}d Streak`)
                                        ])
                                    ])
                                ]),

                                // Right: XP & Trend
                                h('div', { className: 'flex items-center gap-3 sm:gap-6 flex-shrink-0' }, [
                                    h('div', { className: 'hidden sm:flex items-center font-mono text-xs' }, [
                                        cadet.trend === 'UP' && h('span', { className: 'text-emerald-400' }, '▲ +2'),
                                        cadet.trend === 'DOWN' && h('span', { className: 'text-rose-400' }, '▼ -1'),
                                        cadet.trend === 'SAME' && h('span', { className: 'text-zinc-600' }, '—')
                                    ]),
                                    h('div', {
                                        className: `px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border text-right font-mono ${
                                            isPromo
                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                                : isReleg
                                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                                                : 'bg-zinc-900 border-white/10 text-white'
                                        }`
                                    }, [
                                        h('div', { className: 'text-[9px] text-zinc-400 font-bold uppercase' }, 'WEEKLY XP'),
                                        h('div', { className: 'text-sm sm:text-base font-black text-cyan-400' }, `⚡ ${cadet.weeklyXP.toLocaleString()}`)
                                    ])
                                ])
                            ])
                        ]);
                    })
                )
            ])
        ]);
    }

    // Global mount function to inject the React module into any container element
    window.mountReactLeagueModule = function (containerId) {
        const target = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        if (!target) return;

        try {
            if (ReactDOM.createRoot) {
                if (!target._msotReactRoot) {
                    target._msotReactRoot = ReactDOM.createRoot(target);
                }
                target._msotReactRoot.render(React.createElement(ReactWeeklyLeaguesModule));
            } else if (ReactDOM.render) {
                ReactDOM.render(React.createElement(ReactWeeklyLeaguesModule), target);
            }
        } catch (err) {
            console.error('Failed to render React League Module:', err);
        }
    };

    window.unmountReactLeagueModule = function (containerId) {
        const target = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        if (target && target._msotReactRoot) {
            target._msotReactRoot.unmount();
            target._msotReactRoot = null;
        }
    };

    console.log('✓ MSOT React + Framer Motion + Tailwind League Arena module initialized.');
})();
