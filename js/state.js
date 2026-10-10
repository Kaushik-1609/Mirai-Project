/**
 * MSOT LEARN — Production-Grade Gamified Learning Platform Engine
 * Principles:
 * 1. Learning First: Every XP point corresponds to verified educational actions
 * 2. Fair & Inclusive: Multi-dimensional leaderboards (Weekly, Improvement, Consistency, Personal Bests)
 * 3. Separate From Grades: XP/Leagues never alter academic transcripts
 *
 * Implements:
 * - Role-Based Access Control (STUDENT, FACULTY, ADMIN)
 * - Configurable XP Rule Engine (xp_rules table with admin live updates)
 * - Immutable XP Transaction Ledger (xp_transactions)
 * - Increasing Level Progression Curve (Level 12 dashboard support)
 * - Streak System with Freeze Shield Tokens
 * - 5-Category Badges Vault (Learning, Consistency, Improvement, Community, Challenge)
 * - Active Quests System with automated progress tracking
 * - Weekly Leagues with Weekly XP resets & Anonymous Mode ("Anonymous Student #482")
 * - Real-Time Team Battles (Section A vs Section B Sprint & Tri-Campus Clash)
 * - Faculty Engagement KPIs (78% DAS, 91% WAS, 84% Quiz, 6.8d Streak, 12 Inactive)
 * - AI Question Generation & Review Pipeline
 */

const STORAGE_KEY = 'MSOT_LEARN_STATE_V2';

// 1. CONFIGURABLE XP RULE ENGINE TABLE (Database model: xp_rules)
const DEFAULT_XP_RULES = {
    ATTEND_CLASS: {
        id: 'rule-01',
        action_type: 'ATTEND_CLASS',
        base_xp: 20,
        max_daily_xp: 40,
        enabled: true,
        multiplier: 1.0,
        description: 'Student daily & lecture attendance verified (+20 XP, fuels streak)'
    },
    SOLVE_QUESTION: {
        id: 'rule-solve-q',
        action_type: 'SOLVE_QUESTION',
        base_xp: 10,
        max_daily_xp: 500,
        enabled: true,
        multiplier: 1.0,
        description: 'Per question solved (+10 XP per question)'
    },
    HOMEWORK: {
        id: 'rule-02',
        action_type: 'HOMEWORK',
        base_xp: 20,
        max_daily_xp: 40,
        enabled: true,
        multiplier: 1.0,
        description: 'Per assignment completed on time'
    },
    DAILY_QUIZ: {
        id: 'rule-03',
        action_type: 'DAILY_QUIZ',
        base_xp: 15,
        max_daily_xp: 15,
        enabled: true,
        multiplier: 1.0,
        description: 'Daily quiz completion bonus'
    },
    QUIZ_CORRECT: {
        id: 'rule-04',
        action_type: 'QUIZ_CORRECT',
        base_xp: 5,
        max_daily_xp: 25,
        enabled: true,
        multiplier: 1.0,
        description: 'Per correct question in daily trial'
    },
    BIWEEKLY_TEST: {
        id: 'rule-05',
        action_type: 'BIWEEKLY_TEST',
        base_xp: 50,
        max_daily_xp: 50,
        enabled: true,
        multiplier: 1.0,
        description: 'Formula: Test Score % divided by 2'
    },
    CODING_EASY: {
        id: 'rule-06',
        action_type: 'CODING_EASY',
        base_xp: 10,
        max_daily_xp: 100,
        enabled: true,
        multiplier: 1.0,
        description: 'Verified easy algorithm solution'
    },
    CODING_MEDIUM: {
        id: 'rule-07',
        action_type: 'CODING_MEDIUM',
        base_xp: 20,
        max_daily_xp: 200,
        enabled: true,
        multiplier: 1.0,
        description: 'Verified medium algorithm solution'
    },
    CODING_HARD: {
        id: 'rule-08',
        action_type: 'CODING_HARD',
        base_xp: 40,
        max_daily_xp: 400,
        enabled: true,
        multiplier: 1.0,
        description: 'Verified hard algorithm solution'
    },
    CLUB_ACTIVITY: {
        id: 'rule-09',
        action_type: 'CLUB_ACTIVITY',
        base_xp: 25,
        max_daily_xp: 25,
        enabled: true,
        multiplier: 1.0,
        description: 'Verified tech club workshop participation'
    },
    SEVEN_DAY_STREAK: {
        id: 'rule-10',
        action_type: 'SEVEN_DAY_STREAK',
        base_xp: 50,
        max_daily_xp: 50,
        enabled: true,
        multiplier: 1.0,
        description: '7-Day consistent learning streak bonus'
    },
    HELP_PEER: {
        id: 'rule-11',
        action_type: 'HELP_PEER',
        base_xp: 15,
        max_daily_xp: 45,
        enabled: true,
        multiplier: 1.0,
        description: 'Accepted answer helping a classmate (max 3/day)'
    },
    GAME_TOPIC_CLEAR: {
        id: 'rule-12',
        action_type: 'GAME_TOPIC_CLEAR',
        base_xp: 35,
        max_daily_xp: 350,
        enabled: true,
        multiplier: 1.0,
        description: 'Complete 10-question curriculum topic game'
    }
};

// 2. INCREASING LEVEL SYSTEM FORMULA
// Level 1: 0, Level 2: 100, Level 3: 250, Level 4: 450, Level 5: 700... Level 12: 3,850 XP
function calculateLevelData(lifetimeXP) {
    let level = 1;
    let threshold = 0;
    let step = 100;

    while (true) {
        let nextThreshold = threshold + step;
        if (lifetimeXP < nextThreshold) {
            const currentLevelXP = lifetimeXP - threshold;
            const xpNeededForLevel = step;
            return {
                level,
                currentLevelXP,
                xpNeededForLevel,
                progressPercent: Math.min(100, Math.round((currentLevelXP / xpNeededForLevel) * 100)),
                threshold
            };
        }
        threshold = nextThreshold;
        level++;
        step += 50; // Increasing XP curve: 100, 150, 200, 250, 300...
    }
}

function normalizeSection(sec) {
    if (!sec) return 'Section Alpha';
    const s = String(sec).trim();
    if (s === 'Section Beta' || s === 'Beta' || s === 'Section B' || s === 'B') return 'Section Beta';
    if (s === 'Section Alpha' || s === 'Alpha' || s === 'Section A' || s === 'A') return 'Section Alpha';
    return s;
}

// 3. DEFAULT STUDENT STATE (Matching Prompt Dashboard: Level 12, 1,240/1,500 XP, 7-Day Streak)
const DEFAULT_STUDENT = {
    id: 'ADM-MSOT-001',
    name: 'Utkarsh Raj',
    alias: '@utkarsh_admin',
    avatar: '🛡️',
    role: 'ADMIN',
    year: 'System Administrator',
    semester: 'Master Governance',
    batch: 'Class of 2026',
    section: 'Section Alpha',
    campus: 'Mirai Central Campus',
    lifetimeXP: 4490, // Gives Level 12 with 1,240 / 1,500 XP
    weeklyXP: 380,
    streak: 7,
    streakFreezes: 2,
    maxStreak: 18,
    questionsSolved: 32,
    weeklyTimeSpentMinutes: 385, // ~6h 25m spent on site
    anonymousMode: false,
    faction: 'crimson',
    league: 'Cadet League',
    leagueRank: 8,
    badges: [
        'first_quiz', 'recursion_rookie', 'debugging_pro', 'streak_7', 'helpful_peer', 
        'personal_best', 'chief_inspector', 'operator_master', 'navigator'
    ],
    completedGames: ['game_cpp_1', 'game_cpp_3', 'game_html_4'],
    lastDailyQuizDate: null,
    dailyCodingCount: 3,
    dailyHelpCount: 1,
    personalBests: [
        { metric: 'Quickest Perfect Quiz', value: '5/5 in 38s', date: 'Yesterday' },
        { metric: 'Highest Weekly XP Surge', value: '+520 XP', date: 'Last Week' },
        { metric: 'Longest Unbroken Streak', value: '18 Days', date: 'Last Month' }
    ]
};

// 4. ACTIVE QUESTS WITH REWARD SYSTEM
const DEFAULT_QUESTS = [
    {
        id: 'quest-01',
        title: 'Recursion Awakening',
        category: 'Topic Quest',
        description: 'Master call stacks, base conditions, and memory recursion in C++.',
        xpReward: 150,
        badgeReward: 'Recursion Master',
        completed: false,
        tasks: [
            { id: 't1', text: 'Complete recursion foundation lesson', done: true },
            { id: 't2', text: 'Solve 3 recursion coding problems (2/3)', done: false },
            { id: 't3', text: 'Score 80%+ in daily recursion quiz', done: false },
            { id: 't4', text: 'Help one classmate on recursion stack debug', done: true }
        ]
    },
    {
        id: 'quest-02',
        title: 'Daily Micro-Learning Gauntlet',
        category: 'Daily Quest',
        description: 'Maintain sharp cognitive retention across this week\'s syllabus.',
        xpReward: 60,
        badgeReward: null,
        completed: false,
        tasks: [
            { id: 't5', text: 'Complete today\'s 5-question speed quiz', done: false },
            { id: 't6', text: 'Review 1 weak topic explanation', done: true },
            { id: 't7', text: 'Engage in peer discussion board', done: false }
        ]
    },
    {
        id: 'quest-03',
        title: 'Web Architecture Sprint',
        category: 'Weekly Quest',
        description: 'Construct responsive semantic HTML5 layouts and forms.',
        xpReward: 120,
        badgeReward: 'Architect Cadet',
        completed: false,
        tasks: [
            { id: 't8', text: 'Clear City Planner Semantic Tag Trial', done: true },
            { id: 't9', text: 'Clear Form Master Registration Trial', done: true },
            { id: 't10', text: 'Verify accessible viewport meta attributes', done: false }
        ]
    }
];

// 5. 5-CATEGORY COMPREHENSIVE BADGES VAULT (Section 12)
const ALL_BADGES_CATALOG = {
    learning: [
        { id: 'first_quiz', name: 'First Quiz', icon: '📝', cat: 'Learning', desc: 'Completed your very first daily trial' },
        { id: 'quiz_master', name: 'Quiz Master', icon: '🎯', cat: 'Learning', desc: 'Scored 100% on 5 consecutive daily quizzes' },
        { id: 'recursion_rookie', name: 'Recursion Rookie', icon: '🌀', cat: 'Learning', desc: 'Successfully traced 10 recursive call trees' },
        { id: 'debugging_pro', name: 'Debugging Pro', icon: '🛠️', cat: 'Learning', desc: 'Found and resolved 15 code compilation bugs' },
        { id: 'assignment_finisher', name: 'Assignment Finisher', icon: '📚', cat: 'Learning', desc: 'Submitted all weekly homework on-time for 3 weeks' }
    ],
    consistency: [
        { id: 'streak_7', name: '7 Day Streak', icon: '🔥', cat: 'Consistency', desc: 'Maintained 7 consecutive active study days' },
        { id: 'streak_14', name: '14 Day Streak', icon: '⚡', cat: 'Consistency', desc: 'Kept the fire burning for two unbroken weeks' },
        { id: 'streak_30', name: '30 Day Streak', icon: '🌟', cat: 'Consistency', desc: 'A full calendar month of verified learning' }
    ],
    improvement: [
        { id: 'test_improve_10', name: '+10% Test Improvement', icon: '📈', cat: 'Improvement', desc: 'Raised bi-weekly test score by 10%+' },
        { id: 'test_improve_15', name: '+15% Test Improvement', icon: '🚀', cat: 'Improvement', desc: 'Demonstrated massive leap in conceptual test scores' },
        { id: 'personal_best', name: 'Personal Best', icon: '👑', cat: 'Improvement', desc: 'Shattered personal highest accuracy speed record' }
    ],
    community: [
        { id: 'helpful_peer', name: 'Helpful Peer', icon: '🤝', cat: 'Community', desc: 'Answered a classmate\'s doubt marked as accepted' },
        { id: 'mentor', name: 'Mentor', icon: '🌱', cat: 'Community', desc: 'Assisted 10 different peers in discussion forums' },
        { id: 'discussion_hero', name: 'Discussion Hero', icon: '💬', cat: 'Community', desc: 'Authored top-rated conceptual walkthrough on syllabus' }
    ],
    challenge: [
        { id: 'quest_complete', name: 'Quest Complete', icon: '🗺️', cat: 'Challenge', desc: 'Conquered an entire multi-stage topic quest' },
        { id: 'boss_battle_winner', name: 'Boss Battle Winner', icon: '⚔️', cat: 'Challenge', desc: 'Defeated the Cyber Mecha Demon in Operator Boss Battle' },
        { id: 'team_battle_champion', name: 'Team Battle Champion', icon: '🏆', cat: 'Challenge', desc: 'Scored top quartile in Section Weekend Coding Sprint' }
    ]
};

// 6. IMMUTABLE XP TRANSACTIONS LEDGER (Database model: xp_transactions)
const SEED_XP_TRANSACTIONS = [
    {
        id: 'tx-801',
        student_id: 'MSOT-2026-482',
        action_type: 'HOMEWORK',
        source_id: 'assign-c-pointers',
        xp_amount: 20,
        multiplier: 1.0,
        reason: 'Pointer Arithmetic & Memory Layout Homework submitted on-time',
        metadata: { course: 'CS-201', grade: '96%' },
        created_at: 'Today 10:30 AM',
        created_by: 'system_auto',
        status: 'VALID'
    },
    {
        id: 'tx-802',
        student_id: 'MSOT-2026-482',
        action_type: 'DAILY_QUIZ',
        source_id: 'quiz-day-42',
        xp_amount: 15,
        multiplier: 1.0,
        reason: 'Completed Daily Micro-Learning Trial (Recursion & Loops)',
        metadata: { score: '4/5', duration_sec: 42 },
        created_at: 'Today 09:20 AM',
        created_by: 'system_auto',
        status: 'VALID'
    },
    {
        id: 'tx-803',
        student_id: 'MSOT-2026-482',
        action_type: 'QUIZ_CORRECT',
        source_id: 'quiz-day-42-q',
        xp_amount: 20,
        multiplier: 1.0,
        reason: '4 Correct Answers in Daily Quiz (+5 XP each)',
        metadata: { correct_count: 4 },
        created_at: 'Today 09:20 AM',
        created_by: 'system_auto',
        status: 'VALID'
    },
    {
        id: 'tx-804',
        student_id: 'MSOT-2026-482',
        action_type: 'SEVEN_DAY_STREAK',
        source_id: 'streak-milestone-7',
        xp_amount: 50,
        multiplier: 1.0,
        reason: 'Achieved unbroken 7-day learning milestone',
        metadata: { streak_length: 7 },
        created_at: 'Yesterday 11:45 PM',
        created_by: 'system_auto',
        status: 'VALID'
    },
    {
        id: 'tx-805',
        student_id: 'MSOT-2026-482',
        action_type: 'ATTEND_CLASS',
        source_id: 'class-lecture-sysprog',
        xp_amount: 10,
        multiplier: 1.0,
        reason: 'Official Attendance: Systems Programming in C++',
        metadata: { faculty: 'Prof. Arisaka', hall: 'L-04' },
        created_at: 'Yesterday 02:00 PM',
        created_by: 'faculty_arisaka',
        status: 'VALID'
    },
    {
        id: 'tx-806',
        student_id: 'MSOT-2026-482',
        action_type: 'HELP_PEER',
        source_id: 'forum-q-992',
        xp_amount: 15,
        multiplier: 1.0,
        reason: 'Explanation on pass-by-reference accepted by cadet Kanna',
        metadata: { peer_id: 'MSOT-2026-118' },
        created_at: '2 days ago',
        created_by: 'system_auto',
        status: 'VALID'
    }
];

// 7. REAL-TIME TEAM BATTLE: SECTION ALPHA vs SECTION BETA (Weekend Coding Sprint)
const DEFAULT_SECTION_BATTLE = {
    title: 'Weekend Coding Sprint',
    duration: '2 Hours (Live Active)',
    sectionA: { name: 'SECTION ALPHA (Cybernetics)', points: 2840, solvedCount: 114 },
    sectionB: { name: 'SECTION BETA (Systems & Web)', points: 2410, solvedCount: 98 },
    scoringGuide: 'Easy = 10 XP • Medium = 20 XP • Hard = 40 XP',
    recentSubmissions: [
        { cadet: 'Section Alpha Cadet', problem: 'Binary Search Tree Balancing', diff: 'Hard', xp: 40, time: '3s ago' },
        { cadet: 'Section Beta Cadet', problem: 'Two-Pointer String Reversal', diff: 'Easy', xp: 10, time: '7s ago' },
        { cadet: 'Section Alpha Cadet', problem: 'Linked List Cycle Detection', diff: 'Medium', xp: 20, time: '12s ago' }
    ]
};

// 8. MULTI-DIMENSIONAL FAIRNESS LEADERBOARDS (Section 15)
const SEED_FAIRNESS_BOARDS = {
    weeklyXP: [],
    mostImproved: [],
    consistency: []
};

// 9. FACULTY ENGAGEMENT KPIS & TOPIC DIFFICULTY RADAR (Section 18)
const DEFAULT_FACULTY_KPIS = {
    dailyActivePct: 78,
    weeklyActivePct: 91,
    quizCompletionPct: 84,
    avgStreakDays: 6.8,
    inactiveStudentsCount: 12,
    topicDifficulty: [
        { topic: 'Recursion & Stack Frames', accuracy: 42, need: 'High Vulnerability' },
        { topic: 'Functions & Reference Scope', accuracy: 54, need: 'Moderate' },
        { topic: 'HTML Tables & Colspan/Rowspan', accuracy: 61, need: 'Moderate' },
        { topic: 'Operators & Modulo Precedence', accuracy: 78, need: 'Well Mastered' }
    ]
};

// 10. AI GENERATED QUESTIONS QUEUE (Faculty Human-In-The-Loop Approval Workflow)
const DEFAULT_AI_QUESTION_QUEUE = [
    {
        id: 'ai-q-101',
        subject: 'C++',
        topic: 'Recursion',
        difficulty: 'Medium',
        prompt: 'What happens if a recursive function does not define a base condition?',
        options: ['It compiles to a while loop', 'It causes stack overflow memory exhaustion', 'It returns 0 automatically', 'It throws a syntax warning'],
        correctIndex: 1,
        explanation: 'Without a terminating base condition, recursive calls push activation frames indefinitely until the call stack memory is exhausted (Stack Overflow).',
        status: 'PENDING_REVIEW', // PENDING_REVIEW | APPROVED | REJECTED
        generatedAt: '10 mins ago'
    },
    {
        id: 'ai-q-102',
        subject: 'Web Development',
        topic: 'Semantic HTML',
        difficulty: 'Easy',
        prompt: 'Why should a blog post be enclosed inside <article> instead of generic <div>?',
        options: ['It makes text bold automatically', 'It signifies self-contained, syndicate-ready standalone content for assistive tech and SEO', 'It forces responsive padding', 'It is required for CSS styling'],
        correctIndex: 1,
        explanation: '<article> is a semantic landmark indicating independent content that can be distributed on its own.',
        status: 'PENDING_REVIEW',
        generatedAt: '15 mins ago'
    }
];

// 11. WEEKEND ASSIGNMENTS (Pushed dynamically by instructors)
const DEFAULT_WEEKEND_ASSIGNMENTS = [];

class MSOTPlatformState {
    constructor() {
        this.currentRole = 'STUDENT'; // 'STUDENT' | 'FACULTY' | 'ADMIN'
        this.currentUserEmail = null;
        this.load();
    }

    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                this.currentRole = parsed.currentRole || 'STUDENT';
                this.currentUserEmail = parsed.currentUserEmail || null;
                this.student = parsed.student || DEFAULT_STUDENT;
                this.rules = parsed.rules || DEFAULT_XP_RULES;
                this.transactions = parsed.transactions || SEED_XP_TRANSACTIONS;
                this.quests = parsed.quests || DEFAULT_QUESTS;
                this.battle = parsed.battle || DEFAULT_SECTION_BATTLE;
                this.fairness = parsed.fairness || SEED_FAIRNESS_BOARDS;
                this.facultyKPIs = parsed.facultyKPIs || DEFAULT_FACULTY_KPIS;
                this.aiQueue = parsed.aiQueue || DEFAULT_AI_QUESTION_QUEUE;
                // Only show assignments genuinely pushed by the user/instructor (exclude any old demo assign-w IDs)
                this.assignments = (Array.isArray(parsed.assignments))
                    ? parsed.assignments.filter(a => a && a.id && !String(a.id).startsWith('assign-w'))
                    : [];
                this.leagues = [];
                if (typeof this.student.questionsSolved !== 'number') this.student.questionsSolved = 32;
                if (typeof this.student.weeklyTimeSpentMinutes !== 'number') this.student.weeklyTimeSpentMinutes = 385;
                if (!Array.isArray(this.student.completedAssignments)) this.student.completedAssignments = [];
                this.student.completedAssignments = this.student.completedAssignments.filter(id => !String(id).startsWith('assign-w'));
                if (!this.student.league || this.student.league.includes('Gold') || this.student.league.includes('Bronze')) {
                    this.student.league = 'Cadet League';
                }
                return;
            }
        } catch (e) {
            console.warn('Initializing fresh MSOT Learn State', e);
        }
        // Defaults
        this.currentRole = 'STUDENT';
        this.currentUserEmail = null;
        this.student = JSON.parse(JSON.stringify(DEFAULT_STUDENT));
        this.rules = JSON.parse(JSON.stringify(DEFAULT_XP_RULES));
        this.transactions = JSON.parse(JSON.stringify(SEED_XP_TRANSACTIONS));
        this.quests = JSON.parse(JSON.stringify(DEFAULT_QUESTS));
        this.battle = JSON.parse(JSON.stringify(DEFAULT_SECTION_BATTLE));
        this.fairness = JSON.parse(JSON.stringify(SEED_FAIRNESS_BOARDS));
        this.facultyKPIs = JSON.parse(JSON.stringify(DEFAULT_FACULTY_KPIS));
        this.aiQueue = JSON.parse(JSON.stringify(DEFAULT_AI_QUESTION_QUEUE));
        this.assignments = [];
        this.leagues = [];
        this.save();
    }

    // Dynamic User Switcher: isolates student profile, XP, streak, and badges per user account
    switchUser(userSession) {
        if (!userSession || !userSession.email) return;
        const email = userSession.email.toLowerCase().trim();
        this.currentUserEmail = email;

        const isDemoStudent = (email === 'student@msot.edu');
        const isUtkarshAdmin = (
            (userSession.name && userSession.name.trim().toLowerCase() === 'utkarsh raj') ||
            (userSession.username && userSession.username.toLowerCase().includes('utkarsh')) ||
            email.includes('utkarsh') ||
            email === 'admin@msot.edu' ||
            (userSession.role && userSession.role.toUpperCase() === 'ADMIN')
        );
        const userStoreKey = `MSOT_STUDENT_PROFILE_${email.replace(/[^a-z0-9]/g, '_')}`;

        if (isUtkarshAdmin) {
            const saved = localStorage.getItem(userStoreKey);
            this.student = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_STUDENT));
            this.student.name = 'Utkarsh Raj';
            this.student.role = 'ADMIN';
            this.student.avatar = this.student.avatar || '🛡️';
            this.currentRole = 'ADMIN';
        } else if (isDemoStudent) {
            // Built-in Demo student retains demo stats under Cadet Aarav
            const saved = localStorage.getItem(userStoreKey);
            this.student = saved ? JSON.parse(saved) : {
                ...JSON.parse(JSON.stringify(DEFAULT_STUDENT)),
                name: userSession.name || 'Utkarsh Cadet',
                username: userSession.username || 'utkarsh_cadet',
                alias: userSession.alias || '@utkarsh_cadet',
                id: userSession.studentId || 'MSOT-2026-004',
                role: 'STUDENT',
                avatar: userSession.avatar || '⚔️'
            };
        } else {
            // Registered cadet / custom account
            const saved = localStorage.getItem(userStoreKey);
            if (saved) {
                this.student = JSON.parse(saved);
                // Synchronize any newly provided userSession fields
                if (userSession.name) this.student.name = userSession.name;
                if (userSession.username) {
                    this.student.username = userSession.username.replace(/^@/, '');
                    this.student.alias = `@${this.student.username}`;
                }
                if (userSession.studentId) this.student.id = userSession.studentId;
                if (userSession.year) this.student.year = userSession.year;
                if (userSession.semester) this.student.semester = userSession.semester;
                if (userSession.section) this.student.section = userSession.section;
                if (userSession.branch) this.student.branch = userSession.branch;
                if (userSession.phone) this.student.phone = userSession.phone;
                if (userSession.avatar) this.student.avatar = userSession.avatar;
                if (userSession.track) this.student.track = userSession.track;
                if (userSession.role) this.student.role = userSession.role;
            } else {
                // Initialize fresh cadet profile with the user's EXACT filled registration details (NO RANDOM VALUES!)
                const cleanUser = (userSession.username || email.split('@')[0]).replace(/^@/, '');
                const cadetId = userSession.studentId || userSession.id || `MSOT-${cleanUser.toUpperCase()}`;
                this.student = {
                    id: cadetId,
                    email: email,
                    name: userSession.name || cleanUser,
                    username: cleanUser,
                    alias: `@${cleanUser}`,
                    avatar: userSession.avatar || '⚔️',
                    role: userSession.role || 'Student',
                    year: userSession.year || '2nd Year',
                    semester: userSession.semester || 'Semester 4',
                    batch: 'Class of 2026',
                    section: normalizeSection(userSession.section),
                    branch: userSession.branch || 'Computer Science & Engineering (CSE)',
                    phone: userSession.phone || '',
                    campus: 'Mirai Central Campus',
                    track: userSession.track || 'C++ Algorithms & DSA',
                    lifetimeXP: 50,
                    weeklyXP: 50,
                    streak: 1,
                    streakFreezes: 1,
                    maxStreak: 1,
                    questionsSolved: 5,
                    weeklyTimeSpentMinutes: 65,
                    anonymousMode: false,
                    faction: (normalizeSection(userSession.section) === 'Section Beta') ? 'emerald' : 'crimson',
                    league: 'Cadet League',
                    leagueRank: 18,
                    badges: ['first_quiz'],
                    completedGames: [],
                    lastDailyQuizDate: null,
                    dailyCodingCount: 0,
                    dailyHelpCount: 0,
                    personalBests: [
                        { metric: 'Quickest Perfect Quiz', value: '5/5 in 45s', date: 'Recent' },
                        { metric: 'Highest Weekly XP Surge', value: '+50 XP', date: 'This Week' },
                        { metric: 'Longest Unbroken Streak', value: '1 Day', date: 'Active' }
                    ]
                };
                localStorage.setItem(userStoreKey, JSON.stringify(this.student));
            }
        }

        // Safety guarantees: Ensure all fields and arrays exist on loaded or new student profile
        if (this.student) {
            const cleanUser = (this.student.username || this.student.alias || email.split('@')[0]).replace(/^@/, '');
            this.student.username = cleanUser;
            this.student.alias = `@${cleanUser}`;
            if (!this.student.id) this.student.id = userSession.studentId || `MSOT-${cleanUser.toUpperCase()}`;
            if (!this.student.name) this.student.name = userSession.name || cleanUser;
            if (isUtkarshAdmin) {
                this.student.name = 'Utkarsh Raj';
                this.student.role = 'ADMIN';
                this.student.avatar = this.student.avatar || '🛡️';
                this.currentRole = 'ADMIN';
            } else {
                if (!this.student.role) this.student.role = userSession.role || 'Student';
            }
            if (!this.student.year) this.student.year = userSession.year || '2nd Year';
            if (!this.student.semester) this.student.semester = userSession.semester || 'Semester 4';
            this.student.section = normalizeSection(this.student.section || userSession.section);
            this.student.faction = (this.student.section === 'Section Beta') ? 'emerald' : 'crimson';
            if (!this.student.branch) this.student.branch = userSession.branch || 'Computer Science & Engineering (CSE)';
            if (userSession.phone) this.student.phone = userSession.phone;
            if (!this.student.batch) this.student.batch = 'Class of 2026';
            if (!this.student.campus) this.student.campus = 'Mirai Central Campus';
            if (!this.student.avatar) this.student.avatar = isUtkarshAdmin ? '🛡️' : (userSession.avatar || '⚔️');
            this.student.league = 'Cadet League';
            if (typeof this.student.streak !== 'number') this.student.streak = 1;
            this.student.isStreakFrozen = !!this.student.isStreakFrozen;
            this.student.streakFrozenDate = this.student.streakFrozenDate || null;
            this.student.maxFreezeDays = 2;
            this.student.lastActiveDate = this.student.lastActiveDate || new Date().toISOString().split('T')[0];
            if (!Array.isArray(this.student.attendanceHistory)) this.student.attendanceHistory = [];
            if (typeof this.student.questionsSolved !== 'number') this.student.questionsSolved = 0;
            if (typeof this.student.weeklyTimeSpentMinutes !== 'number') this.student.weeklyTimeSpentMinutes = 385;
            if (typeof this.student.leagueRank !== 'number') this.student.leagueRank = 8;
            if (!Array.isArray(this.student.badges)) this.student.badges = ['first_quiz'];
            if (!Array.isArray(this.student.completedGames)) this.student.completedGames = [];
            if (!Array.isArray(this.student.personalBests) || this.student.personalBests.length === 0) {
                this.student.personalBests = [
                    { metric: 'Quickest Perfect Quiz', value: '5/5 in 45s', date: 'Recent' },
                    { metric: 'Highest Weekly XP Surge', value: '+50 XP', date: 'This Week' },
                    { metric: 'Longest Unbroken Streak', value: `${this.student.streak || 1} Days`, date: 'Current' }
                ];
            }
            this.evaluateStreakStatus();
        }

        if (userSession.role) {
            this.currentRole = userSession.role;
        }

        this.save();
    }

    updateStudentProfile(updates) {
        if (!this.student) return;
        if (updates.section) {
            updates.section = normalizeSection(updates.section);
            updates.faction = (updates.section === 'Section Beta') ? 'emerald' : 'crimson';
        }
        Object.assign(this.student, updates);
        this.save();
        if (window.msotPlatform) {
            if (window.msotPlatform.renderStudentProfile) window.msotPlatform.renderStudentProfile();
            if (window.msotPlatform.updateHeaderStats) window.msotPlatform.updateHeaderStats();
        }
    }

    save() {
        try {
            if (this.currentUserEmail) {
                const userStoreKey = `MSOT_STUDENT_PROFILE_${this.currentUserEmail.replace(/[^a-z0-9]/g, '_')}`;
                localStorage.setItem(userStoreKey, JSON.stringify(this.student));
            }
            const payload = {
                currentRole: this.currentRole,
                currentUserEmail: this.currentUserEmail,
                student: this.student,
                rules: this.rules,
                transactions: this.transactions,
                quests: this.quests,
                battle: this.battle,
                fairness: this.fairness,
                facultyKPIs: this.facultyKPIs,
                aiQueue: this.aiQueue,
                assignments: this.assignments,
                leagues: this.leagues
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (e) {
            console.error('Failed to save MSOT State', e);
        }
    }

    // Push new weekend assignment (by faculty, admin, or instructor)
    pushAssignment(data) {
        if (!data || !data.title) return null;
        const curRole = (this.currentRole || this.student?.role || 'STUDENT').toUpperCase();
        if (curRole !== 'ADMIN' && curRole !== 'FACULTY') {
            console.warn('Blocked unauthorized assignment push from non-admin role:', curRole);
            return null;
        }
        if (!Array.isArray(this.assignments)) this.assignments = [];

        const newAssignment = {
            id: 'assign-' + Date.now(),
            title: data.title.trim(),
            difficulty: (data.difficulty || 'MEDIUM').toUpperCase(),
            track: data.track || 'Algorithms & Data Structures',
            weekNumber: data.weekNumber || `WEEK ${this.assignments.length + 1} WEEKEND`,
            dueDate: data.dueDate || 'Sunday 23:59 PM',
            xpReward: Number(data.xpReward) || 50,
            tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map(t => t.trim()) : ['Algorithm']),
            description: data.description || 'Solve this algorithmic challenge using optimal time and space complexity.',
            starterCode: data.starterCode || {
                javascript: `function solution(input) {\n    // Write your code here\n    return input;\n}`,
                python: `def solution(input):\n    # Write your code here\n    return input`,
                cpp: `#include <iostream>\n\nint main() {\n    // Write your code here\n    std::cout << "Done" << std::endl;\n    return 0;\n}`
            },
            testCases: Array.isArray(data.testCases) && data.testCases.length > 0 ? data.testCases : [
                { id: 1, input: 'Sample Input 1', args: ['Sample Input 1'], expected: 'Sample Input 1' }
            ],
            createdAt: new Date().toLocaleDateString(),
            createdBy: this.currentUserEmail || 'System Administrator'
        };

        this.assignments.unshift(newAssignment);
        this.save();
        return newAssignment;
    }

    // Delete weekend assignment (Admin & Faculty facility)
    deleteAssignment(id) {
        if (!id || !Array.isArray(this.assignments)) return false;
        const curRole = (this.currentRole || this.student?.role || 'STUDENT').toUpperCase();
        if (curRole !== 'ADMIN' && curRole !== 'FACULTY') {
            console.warn('Blocked unauthorized assignment delete from non-admin role:', curRole);
            return false;
        }
        const initialLen = this.assignments.length;
        this.assignments = this.assignments.filter(a => a.id !== id);
        if (this.assignments.length !== initialLen) {
            this.save();
            return true;
        }
        return false;
    }

    // Submit assignment solution & award verified XP
    submitAssignment(assignmentId, code, language, passedCount, totalCount) {
        const assignment = (this.assignments || []).find(a => a.id === assignmentId);
        if (!assignment) return { success: false, reason: 'Assignment not found' };

        if (!Array.isArray(this.student.completedAssignments)) {
            this.student.completedAssignments = [];
        }

        const isNewCompletion = !this.student.completedAssignments.includes(assignmentId);
        if (isNewCompletion) {
            this.student.completedAssignments.push(assignmentId);
        }

        // Award XP
        const xpAmount = isNewCompletion ? (assignment.xpReward || 50) : 10;
        const xpRes = this.recordXP(
            'HOMEWORK',
            xpAmount,
            `Weekend Code Sprint: ${assignment.title} (${language})`,
            {
                assignmentId: assignmentId,
                language: language,
                passedCount: passedCount,
                totalCount: totalCount,
                questionCount: isNewCompletion ? 1 : 0
            }
        );

        this.save();

        return {
            success: true,
            isNewCompletion: isNewCompletion,
            xpAwarded: xpAmount,
            assignment: assignment,
            totalXP: this.student.lifetimeXP,
            leveledUp: xpRes.leveledUp,
            newLevel: xpRes.newLevel
        };
    }

    // Role Switcher (STUDENT <-> FACULTY <-> ADMIN)
    setRole(newRole) {
        if (['STUDENT', 'FACULTY', 'ADMIN'].includes(newRole)) {
            this.currentRole = newRole;
            this.save();
            return true;
        }
        return false;
    }

    // Atomic XP Award with immutable transaction record
    recordXP(actionKey, customXP = null, reason = '', metadata = {}, createdBy = 'system_auto') {
        const rule = this.rules[actionKey] || { base_xp: customXP || 10, multiplier: 1.0, max_daily_xp: 500, enabled: true };
        if (!rule.enabled) {
            return { awarded: 0, reason: `Rule ${actionKey} is currently disabled by Admin` };
        }

        const xpAmount = customXP !== null ? customXP : Math.round(rule.base_xp * (rule.multiplier || 1.0));

        // Create Immutable Transaction
        const tx = {
            id: 'tx-' + Date.now(),
            student_id: this.student.id,
            action_type: actionKey,
            source_id: metadata.source_id || 'manual_action',
            xp_amount: xpAmount,
            multiplier: rule.multiplier || 1.0,
            reason: reason || rule.description,
            metadata: metadata,
            created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today',
            created_by: createdBy,
            status: 'VALID'
        };

        this.transactions.unshift(tx);
        if (this.transactions.length > 100) this.transactions.pop();

        // Update student lifetime & weekly XP
        this.student.lifetimeXP += xpAmount;
        this.student.weeklyXP += xpAmount;

        // Track questions solved
        if (actionKey === 'GAME_TOPIC_CLEAR' || actionKey.startsWith('CODING_') || actionKey === 'DAILY_QUIZ' || actionKey === 'QUIZ_CORRECT' || actionKey === 'SOLVE_QUESTION') {
            const qInc = metadata.questionCount || (actionKey === 'GAME_TOPIC_CLEAR' ? 5 : (actionKey === 'DAILY_QUIZ' ? 5 : 1));
            this.student.questionsSolved = (this.student.questionsSolved || 0) + qInc;
        }

        // Daily activity tracking (maintains daily activeness and streak)
        if (['ATTEND_CLASS', 'SOLVE_QUESTION', 'GAME_TOPIC_CLEAR', 'DAILY_QUIZ', 'QUIZ_CORRECT', 'HOMEWORK'].includes(actionKey)) {
            this.recordDailyActivity();
        }

        // Check for Level-Up Celebration
        const oldLevel = calculateLevelData(this.student.lifetimeXP - xpAmount).level;
        const newLevel = calculateLevelData(this.student.lifetimeXP).level;
        const leveledUp = newLevel > oldLevel;

        // Also add to Section Alpha / Beta battle tally based on cadet's section
        const isBeta = (this.student.section === 'Section Beta' || this.student.section === 'Beta' || this.student.section === 'Section B');
        if (this.battle) {
            const target = isBeta ? this.battle.sectionB : this.battle.sectionA;
            if (target) {
                target.points += xpAmount;
                target.solvedCount++;
            }
        }

        this.save();

        if (window.msotPlatform && typeof window.msotPlatform.showXPGainToast === 'function') {
            window.msotPlatform.showXPGainToast(xpAmount, reason || rule.description, actionKey, tx);
        }

        return {
            awarded: xpAmount,
            txId: tx.id,
            leveledUp: leveledUp,
            newLevel: newLevel,
            totalXP: this.student.lifetimeXP
        };
    }

    // Evaluate Streak Status (Evaluates active streak & strict 2-Day Freeze limit)
    evaluateStreakStatus() {
        if (!this.student) return { status: 'NO_STUDENT' };
        const todayStr = new Date().toISOString().split('T')[0];
        const lastActive = this.student.lastActiveDate || todayStr;

        if (this.student.isStreakFrozen) {
            const frozenTime = this.student.streakFrozenDate ? new Date(this.student.streakFrozenDate).getTime() : Date.now();
            const elapsedDays = Math.floor((Date.now() - frozenTime) / (1000 * 60 * 60 * 24));

            if (elapsedDays > 2) {
                // EXCEEDED 2-DAY FREEZE LIMIT: STREAK RESETS TO 1!
                this.student.isStreakFrozen = false;
                this.student.streakFrozenDate = null;
                this.student.streak = 1;
                this.student.lastActiveDate = todayStr;
                this.save();
                return {
                    status: 'RESET_EXPIRED',
                    streak: 1,
                    message: 'Streak Freeze expired after 2 days. Your streak has reset to 1 Day.'
                };
            } else {
                return {
                    status: 'FROZEN',
                    streak: this.student.streak,
                    elapsedDays: elapsedDays,
                    remainingDays: Math.max(0, 2 - elapsedDays),
                    message: `Streak is frozen (${elapsedDays} of 2 days used). Return within 2 days to keep your streak unbroken!`
                };
            }
        } else {
            const diffDays = Math.floor((new Date(todayStr) - new Date(lastActive)) / (1000 * 60 * 60 * 24));
            if (diffDays > 1) {
                // Missed day without activating streak freeze: streak resets
                this.student.streak = 1;
                this.student.lastActiveDate = todayStr;
                this.save();
                return {
                    status: 'RESET_MISSED',
                    streak: 1,
                    message: 'Missed learning activity without activating Streak Freeze. Streak reset to 1 Day.'
                };
            }
            return {
                status: 'ACTIVE',
                streak: this.student.streak
            };
        }
    }

    // Toggle Streak Freeze (Protected for up to 2 days)
    toggleStreakFreeze() {
        if (!this.student) return { success: false, message: 'No active student profile' };

        if (this.student.isStreakFrozen) {
            // Unfreeze & resume active streak
            this.student.isStreakFrozen = false;
            this.student.streakFrozenDate = null;
            this.save();
            return {
                success: true,
                isFrozen: false,
                streak: this.student.streak,
                message: `🔥 Streak Unfrozen! Your active streak of ${this.student.streak} Days is ready to continue.`
            };
        } else {
            // Activate Streak Freeze for up to 2 days
            this.student.isStreakFrozen = true;
            this.student.streakFrozenDate = new Date().toISOString();
            this.save();
            return {
                success: true,
                isFrozen: true,
                streak: this.student.streak,
                message: `🧊 Streak Frozen! Protected for up to 2 days while away. Return within 2 days to continue your streak unbroken!`
            };
        }
    }

    // Record daily activeness (Called on attendance, questions, quizzes, or lab work)
    recordDailyActivity() {
        if (!this.student) return;
        const todayStr = new Date().toISOString().split('T')[0];
        const lastActive = this.student.lastActiveDate || '';

        if (this.student.isStreakFrozen) {
            const frozenTime = this.student.streakFrozenDate ? new Date(this.student.streakFrozenDate).getTime() : Date.now();
            const elapsedDays = Math.floor((Date.now() - frozenTime) / (1000 * 60 * 60 * 24));

            if (elapsedDays <= 2) {
                // Returned within 2-day limit: Streak continues unbroken!
                this.student.isStreakFrozen = false;
                this.student.streakFrozenDate = null;
                this.student.streak = (this.student.streak || 1) + 1;
                this.student.lastActiveDate = todayStr;
                this.save();
                return {
                    unfrozen: true,
                    streak: this.student.streak,
                    message: `❄️ Welcome Back! You returned within 2 days—your streak was preserved and surged to ${this.student.streak} Days 🔥!`
                };
            } else {
                // Exceeded 2 days while frozen: streak resets
                this.student.isStreakFrozen = false;
                this.student.streakFrozenDate = null;
                this.student.streak = 1;
                this.student.lastActiveDate = todayStr;
                this.save();
                return {
                    unfrozen: true,
                    reset: true,
                    streak: 1,
                    message: 'Streak Freeze expired after 2 days. Streak restarted at 1 Day.'
                };
            }
        }

        // Standard active streak increment
        if (lastActive !== todayStr) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            if (lastActive === yesterday) {
                this.student.streak = (this.student.streak || 0) + 1;
            } else if (!lastActive) {
                this.student.streak = 1;
            } else {
                this.student.streak = 1;
            }
            this.student.lastActiveDate = todayStr;
            this.save();
        }
    }

    // Mark daily student attendance (+20 XP, directly fuels daily streak)
    markDailyAttendance() {
        if (!this.student) return { success: false, message: 'No active cadet profile' };
        const todayStr = new Date().toISOString().split('T')[0];
        if (!Array.isArray(this.student.attendanceHistory)) {
            this.student.attendanceHistory = [];
        }

        if (this.student.attendanceHistory.includes(todayStr)) {
            return {
                success: false,
                alreadyMarked: true,
                streak: this.student.streak,
                message: `✔ Today's attendance is already verified! Current streak: ${this.student.streak} Days 🔥.`
            };
        }

        this.student.attendanceHistory.push(todayStr);
        this.recordDailyActivity();

        // Award verified attendance XP (+20 XP)
        const xpRes = this.recordXP('ATTEND_CLASS', 20, 'Daily Student Attendance Verified (+20 XP)', { date: todayStr });

        return {
            success: true,
            awarded: 20,
            streak: this.student.streak,
            totalXP: this.student.lifetimeXP,
            message: `🏫 Attendance Verified! Awarded +20 XP. Daily streak is now ${this.student.streak} Days 🔥.`
        };
    }

    // Solve Question XP: Every question solved increases XP by +10 XP
    solveQuestionXP(count = 1, topic = 'Curriculum Practice') {
        if (!this.student) return { success: false };
        const xpAmount = count * 10;
        this.student.questionsSolved = (this.student.questionsSolved || 0) + count;
        this.recordDailyActivity();
        const xpRes = this.recordXP('SOLVE_QUESTION', xpAmount, `Solved ${count} question(s) in ${topic} (+${xpAmount} XP)`, {
            questionCount: count,
            topic: topic
        });
        return {
            success: true,
            xpAwarded: xpAmount,
            questionsSolved: this.student.questionsSolved,
            streak: this.student.streak,
            totalXP: this.student.lifetimeXP
        };
    }

    // Query ONLY genuinely registered student accounts (excludes demo users)
    getRegisteredStudents() {
        const studentMap = new Map();

        // 1. Scan registered accounts from MSOT_LEARN_ACCOUNTS_V2
        try {
            const rawAccounts = localStorage.getItem('MSOT_LEARN_ACCOUNTS_V2');
            if (rawAccounts) {
                const accounts = JSON.parse(rawAccounts);
                Object.values(accounts).forEach(acc => {
                    if (!acc || !acc.email) return;
                    const role = (acc.role || 'STUDENT').toUpperCase();
                    if (role === 'FACULTY' || role === 'ADMIN') return;

                    const email = acc.email.toLowerCase().trim();
                    const cleanUser = (acc.username || acc.name || email.split('@')[0]).replace(/^@/, '').trim();
                    const cadetId = acc.studentId || acc.id || `MSOT-${cleanUser.toUpperCase()}`;

                    const userKey = `MSOT_STUDENT_PROFILE_${email.replace(/[^a-z0-9]/g, '_')}`;
                    let prof = null;
                    try {
                        const profRaw = localStorage.getItem(userKey);
                        if (profRaw) prof = JSON.parse(profRaw);
                    } catch(e) {}

                    studentMap.set(email, {
                        id: cadetId,
                        email: email,
                        name: prof?.name || acc.name || cleanUser,
                        username: cleanUser,
                        alias: prof?.alias || acc.alias || `@${cleanUser}`,
                        avatar: prof?.avatar || acc.avatar || '⚔️',
                        section: prof?.section || acc.section || 'Section Alpha',
                        handle: `@${cleanUser}`,
                        questionsSolved: typeof prof?.questionsSolved === 'number' ? prof.questionsSolved : (typeof acc.questionsSolved === 'number' ? acc.questionsSolved : 0),
                        weeklyXP: typeof prof?.weeklyXP === 'number' ? prof.weeklyXP : (typeof acc.weeklyXP === 'number' ? acc.weeklyXP : 50),
                        streak: typeof prof?.streak === 'number' ? prof.streak : (typeof acc.streak === 'number' ? acc.streak : 1),
                        weeklyTimeSpentMinutes: typeof prof?.weeklyTimeSpentMinutes === 'number' ? prof.weeklyTimeSpentMinutes : (typeof acc.weeklyTimeSpentMinutes === 'number' ? acc.weeklyTimeSpentMinutes : 0),
                        trend: 'same',
                        isSelf: false
                    });
                });
            }
        } catch(e) {
            console.warn('Error reading registered accounts:', e);
        }

        // 2. Scan localStorage for any other registered student profiles
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('MSOT_STUDENT_PROFILE_')) {
                    const prof = JSON.parse(localStorage.getItem(key));
                    if (prof && prof.email) {
                        const role = (prof.role || 'STUDENT').toUpperCase();
                        if (role === 'FACULTY' || role === 'ADMIN') continue;

                        const email = prof.email.toLowerCase().trim();
                        if (!studentMap.has(email)) {
                            const cleanUser = (prof.username || prof.name || email.split('@')[0]).replace(/^@/, '').trim();
                            const cadetId = prof.id || `MSOT-${cleanUser.toUpperCase()}`;
                            studentMap.set(email, {
                                id: cadetId,
                                email: email,
                                name: prof.name || cleanUser,
                                username: cleanUser,
                                alias: prof.alias || `@${cleanUser}`,
                                avatar: prof.avatar || '⚔️',
                                section: prof.section || 'Section Alpha',
                                handle: `@${cleanUser}`,
                                questionsSolved: typeof prof.questionsSolved === 'number' ? prof.questionsSolved : 0,
                                weeklyXP: typeof prof.weeklyXP === 'number' ? prof.weeklyXP : 50,
                                streak: typeof prof.streak === 'number' ? prof.streak : 1,
                                weeklyTimeSpentMinutes: typeof prof.weeklyTimeSpentMinutes === 'number' ? prof.weeklyTimeSpentMinutes : 0,
                                trend: 'same',
                                isSelf: false
                            });
                        }
                    }
                }
            }
        } catch(e) {}

        // 3. Always include currently logged-in student if role is STUDENT
        const s = this.student;
        if (s && (s.role || '').toUpperCase() === 'STUDENT') {
            const selfEmail = (s.email || this.currentUserEmail || 'student@msot.edu').toLowerCase().trim();
            const selfClean = (s.username || s.name || selfEmail.split('@')[0]).replace(/^@/, '').trim();
            const selfId = s.id || `MSOT-${selfClean.toUpperCase()}`;

            studentMap.set(selfEmail, {
                id: selfId,
                email: selfEmail,
                name: s.name || selfClean,
                username: selfClean,
                alias: s.alias || `@${selfClean}`,
                avatar: s.avatar || '⚔️',
                section: s.section || 'Section Alpha',
                handle: `@${selfClean}`,
                questionsSolved: typeof s.questionsSolved === 'number' ? s.questionsSolved : 0,
                weeklyXP: typeof s.weeklyXP === 'number' ? s.weeklyXP : 0,
                streak: typeof s.streak === 'number' ? s.streak : 1,
                weeklyTimeSpentMinutes: typeof s.weeklyTimeSpentMinutes === 'number' ? s.weeklyTimeSpentMinutes : 0,
                trend: 'same',
                isSelf: true
            });
        }

        const list = Array.from(studentMap.values());

        // Sort descending by weeklyXP, tiebreaker questionsSolved
        list.sort((a, b) => {
            if (b.weeklyXP !== a.weeklyXP) return b.weeklyXP - a.weeklyXP;
            return (b.questionsSolved || 0) - (a.questionsSolved || 0);
        });

        // Compute 1-indexed ranks and update current student profile leagueRank
        list.forEach((cadet, index) => {
            cadet.rank = index + 1;
            if (cadet.isSelf && this.student) {
                this.student.leagueRank = cadet.rank;
            }
        });

        return list;
    }

    // Get live cohort leaderboard containing ONLY registered cadets
    getLeagueStandings() {
        return this.getRegisteredStudents();
    }

    // Faculty override: Void XP transaction with immutable audit trail
    voidTransaction(txId, voidReason) {
        const tx = this.transactions.find(t => t.id === txId);
        if (tx && tx.status === 'VALID') {
            tx.status = 'VOIDED';
            tx.metadata.void_reason = voidReason;
            tx.metadata.voided_at = new Date().toLocaleString();
            tx.metadata.voided_by = 'faculty_override';

            // Deduct XP
            this.student.lifetimeXP = Math.max(0, this.student.lifetimeXP - tx.xp_amount);
            this.student.weeklyXP = Math.max(0, this.student.weeklyXP - tx.xp_amount);

            this.save();
            return true;
        }
        return false;
    }

    // Admin updates XP Rule without code changes
    updateRule(ruleKey, updates) {
        if (this.rules[ruleKey]) {
            this.rules[ruleKey] = { ...this.rules[ruleKey], ...updates, updated_at: new Date().toISOString() };
            this.save();
            return true;
        }
        return false;
    }

    // Quest step toggle
    toggleQuestTask(questId, taskId) {
        const q = this.quests.find(item => item.id === questId);
        if (q) {
            const task = q.tasks.find(t => t.id === taskId);
            if (task) {
                task.done = !task.done;
                // Check if all done
                const allDone = q.tasks.every(t => t.done);
                if (allDone && !q.completed) {
                    q.completed = true;
                    this.recordXP('GAME_TOPIC_CLEAR', q.xpReward, `Completed Quest: ${q.title}`);
                    if (q.badgeReward) {
                        this.awardBadge(q.badgeReward);
                    }
                }
                this.save();
                return { done: task.done, questCompleted: q.completed };
            }
        }
        return null;
    }

    awardXP(actionKey, customXP = null, reason = '') {
        return this.recordXP(actionKey, customXP, reason);
    }

    awardBadge(badgeId) {
        if (!this.student.badges.includes(badgeId)) {
            this.student.badges.push(badgeId);
            this.save();
            return true;
        }
        return false;
    }

    toggleAnonymousMode() {
        this.student.anonymousMode = !this.student.anonymousMode;
        this.save();
        return this.student.anonymousMode;
    }

    // Faculty approves AI question to enter official bank
    approveAIQuestion(qId) {
        const item = this.aiQueue.find(q => q.id === qId);
        if (item) {
            item.status = 'APPROVED';
            // Also append into global question bank if exists
            if (window.MIRAI_GAMES && window.MIRAI_GAMES[0]) {
                window.MIRAI_GAMES[0].questions.push({
                    num: window.MIRAI_GAMES[0].questions.length + 1,
                    type: 'Multiple Choice',
                    prompt: item.prompt,
                    code: item.code || '',
                    options: item.options,
                    correctIndex: item.correctIndex,
                    hint: 'Faculty Reviewed Question',
                    explanation: item.explanation
                });
            }
            this.save();
            return true;
        }
        return false;
    }

    rejectAIQuestion(qId) {
        const item = this.aiQueue.find(q => q.id === qId);
        if (item) {
            item.status = 'REJECTED';
            this.save();
            return true;
        }
        return false;
    }

    // Add generated AI draft questions
    queueAIQuestions(questionsList) {
        this.aiQueue.unshift(...questionsList);
        this.save();
    }
}

// Global state singleton
window.msotState = new MSOTPlatformState();
// Backward compatibility pointer
window.miraiState = window.msotState;
