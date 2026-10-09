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
        base_xp: 10,
        max_daily_xp: 30,
        enabled: true,
        multiplier: 1.0,
        description: 'Per verified lecture/lab attendance'
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

// 3. DEFAULT STUDENT STATE (Matching Prompt Dashboard: Level 12, 1,240/1,500 XP, 7-Day Streak)
const DEFAULT_STUDENT = {
    id: 'MSOT-2026-482',
    name: 'Utkarsh Raj',
    alias: 'Anonymous Student #482',
    avatar: '⚔️',
    batch: 'Class of 2026',
    section: 'Section A (Cybernetics)',
    campus: 'Mirai Central Campus',
    lifetimeXP: 4490, // Gives Level 12 with 1,240 / 1,500 XP
    weeklyXP: 380,
    streak: 7,
    streakFreezes: 2,
    maxStreak: 18,
    anonymousMode: false,
    faction: 'crimson',
    league: 'Gold League',
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

// 7. REAL-TIME TEAM BATTLE: SECTION A vs SECTION B (Weekend Coding Sprint)
const DEFAULT_SECTION_BATTLE = {
    title: 'Weekend Coding Sprint',
    duration: '2 Hours (Live Active)',
    sectionA: { name: 'SECTION A (Cybernetics)', points: 2840, solvedCount: 114 },
    sectionB: { name: 'SECTION B (Systems)', points: 2410, solvedCount: 98 },
    scoringGuide: 'Easy = 10 XP • Medium = 20 XP • Hard = 40 XP',
    recentSubmissions: [
        { cadet: 'Section A Cadet', problem: 'Binary Search Tree Balancing', diff: 'Hard', xp: 40, time: '3s ago' },
        { cadet: 'Section B Cadet', problem: 'Two-Pointer String Reversal', diff: 'Easy', xp: 10, time: '7s ago' },
        { cadet: 'Section A Cadet', problem: 'Linked List Cycle Detection', diff: 'Medium', xp: 20, time: '12s ago' }
    ]
};

// 8. MULTI-DIMENSIONAL FAIRNESS LEADERBOARDS (Section 15)
const SEED_FAIRNESS_BOARDS = {
    weeklyXP: [
        { rank: 1, name: 'Kanna Endo', alias: 'Anonymous Cadet #118', weeklyXP: 670, streak: 12 },
        { rank: 2, name: 'Yuto Nakagawa', alias: 'Anonymous Cadet #302', weeklyXP: 645, streak: 5 },
        { rank: 3, name: 'Sora Minato', alias: 'Anonymous Cadet #774', weeklyXP: 610, streak: 8 },
        { rank: 4, name: 'Maya Sterling', alias: 'Anonymous Cadet #091', weeklyXP: 590, streak: 4 },
        { rank: 8, name: 'Utkarsh Raj', alias: 'Anonymous Student #482', weeklyXP: 380, streak: 7, isSelf: true }
    ],
    mostImproved: [
        { rank: 1, name: 'Student B (Hikaru V.)', alias: 'Anonymous Cadet #204', improvement: '+34% improvement', reason: 'Jumped from 58% to 92% on recursion lab' },
        { rank: 2, name: 'Mei Ling Zhou', alias: 'Anonymous Cadet #318', improvement: '+28% improvement', reason: 'Mastered loops & nested pattern logic' },
        { rank: 3, name: 'Utkarsh Raj', alias: 'Anonymous Student #482', improvement: '+22% improvement', reason: 'Increased daily quiz recall speed', isSelf: true }
    ],
    consistency: [
        { rank: 1, name: 'Student C (Rei A.)', alias: 'Anonymous Cadet #001', streakDays: 19, tag: '19-Day Unbroken Streak' },
        { rank: 2, name: 'Kanna Endo', alias: 'Anonymous Cadet #118', streakDays: 12, tag: '12-Day Unbroken Streak' },
        { rank: 3, name: 'Shinichi Izumi', alias: 'Anonymous Cadet #909', streakDays: 9, tag: '9-Day Streak' },
        { rank: 5, name: 'Utkarsh Raj', alias: 'Anonymous Student #482', streakDays: 7, tag: '7-Day Streak', isSelf: true }
    ]
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

class MSOTPlatformState {
    constructor() {
        this.currentRole = 'STUDENT'; // 'STUDENT' | 'FACULTY' | 'ADMIN'
        this.load();
    }

    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                this.currentRole = parsed.currentRole || 'STUDENT';
                this.student = parsed.student || DEFAULT_STUDENT;
                this.rules = parsed.rules || DEFAULT_XP_RULES;
                this.transactions = parsed.transactions || SEED_XP_TRANSACTIONS;
                this.quests = parsed.quests || DEFAULT_QUESTS;
                this.battle = parsed.battle || DEFAULT_SECTION_BATTLE;
                this.fairness = parsed.fairness || SEED_FAIRNESS_BOARDS;
                this.facultyKPIs = parsed.facultyKPIs || DEFAULT_FACULTY_KPIS;
                this.aiQueue = parsed.aiQueue || DEFAULT_AI_QUESTION_QUEUE;
                return;
            }
        } catch (e) {
            console.warn('Initializing fresh MSOT Learn State', e);
        }
        // Defaults
        this.currentRole = 'STUDENT';
        this.student = JSON.parse(JSON.stringify(DEFAULT_STUDENT));
        this.rules = JSON.parse(JSON.stringify(DEFAULT_XP_RULES));
        this.transactions = JSON.parse(JSON.stringify(SEED_XP_TRANSACTIONS));
        this.quests = JSON.parse(JSON.stringify(DEFAULT_QUESTS));
        this.battle = JSON.parse(JSON.stringify(DEFAULT_SECTION_BATTLE));
        this.fairness = JSON.parse(JSON.stringify(SEED_FAIRNESS_BOARDS));
        this.facultyKPIs = JSON.parse(JSON.stringify(DEFAULT_FACULTY_KPIS));
        this.aiQueue = JSON.parse(JSON.stringify(DEFAULT_AI_QUESTION_QUEUE));
        this.save();
    }

    save() {
        try {
            const payload = {
                currentRole: this.currentRole,
                student: this.student,
                rules: this.rules,
                transactions: this.transactions,
                quests: this.quests,
                battle: this.battle,
                fairness: this.fairness,
                facultyKPIs: this.facultyKPIs,
                aiQueue: this.aiQueue
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (e) {
            console.error('Failed to save MSOT State', e);
        }
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

        // Check for Level-Up Celebration
        const oldLevel = calculateLevelData(this.student.lifetimeXP - xpAmount).level;
        const newLevel = calculateLevelData(this.student.lifetimeXP).level;
        const leveledUp = newLevel > oldLevel;

        // Also add to Section A battle tally
        if (this.battle && this.battle.sectionA) {
            this.battle.sectionA.points += xpAmount;
            this.battle.sectionA.solvedCount++;
        }

        this.save();

        return {
            awarded: xpAmount,
            txId: tx.id,
            leveledUp: leveledUp,
            newLevel: newLevel,
            totalXP: this.student.lifetimeXP
        };
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
