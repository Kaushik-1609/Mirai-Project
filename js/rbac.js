/**
 * MSOT LEARN — Production Role-Based Access Control (RBAC) & Academic Governance Engine
 * Supports:
 * - Roles: ADMIN, FACULTY, STUDENT with strict privilege boundaries
 * - Admin Complete Platform Control: Faculty Management, Student Ecosystem, Assignments Oversight, Central Requests & Messaging
 * - Faculty Student Management: My Students, Student Activity Tracker (Active, Recently Active, Inactive, Long Inactive),
 *   Assignment Authoring & Publishing, Submissions Review & Grading, Inactivity Reasons Review & Response, 2-Way Communication
 * - Student Experience: View Faculty Assignments, Submissions with feedback, Inactivity Reason submission, Academic Inbox & Replies
 * - Strict RLS & Backend Sync with resilient local fallback
 */

(function () {
    const STORAGE_QUESTIONS_KEY       = 'MSOT_QUESTIONS_BANK_V1';
    const STORAGE_AUDIT_KEY           = 'MSOT_AUDIT_LOGS_V1';
    const STORAGE_SUBMISSIONS_KEY     = 'MSOT_SUBMISSIONS_V1';
    const STORAGE_ASSIGNMENTS_KEY     = 'MSOT_ASSIGNMENTS_V2';
    const STORAGE_ASSIGNMENT_SUBS_KEY = 'MSOT_ASSIGNMENT_SUBS_V2';
    const STORAGE_INACTIVITY_KEY      = 'MSOT_INACTIVITY_REASONS_V2';
    const STORAGE_MESSAGES_KEY        = 'MSOT_ACADEMIC_MESSAGES_V2';

    function safeAlert(msg) {
        console.warn("[RBAC Notice]", msg);
        try {
            if (typeof window.showToast === 'function') {
                window.showToast(msg);
            }
        } catch(e){}
    }

    // ─── Seed Questions ────────────────────────────────────────────────────────
    const SEED_QUESTIONS = [
        {
            id: 'q-seed-01',
            title: 'Pointer Arithmetic & Array Dereferencing',
            description: 'Evaluate output of C++ pointer offset arithmetic on contiguous integer array.',
            options: [
                { id: 'A', text: 'Output: 30' },
                { id: 'B', text: 'Output: 40' },
                { id: 'C', text: 'Segmentation Fault' },
                { id: 'D', text: 'Output: 10' }
            ],
            correct_answer: 'A',
            explanation: 'In C++, *(arr + 2) points to the 3rd element of arr ({10, 20, 30, 40}), which evaluates directly to 30.',
            difficulty: 'beginner',
            category: 'C++ DSA',
            activity_type: 'daily_trial',
            is_published: true,
            creator_email: 'admin@msot.edu',
            creator_name: 'Utkarsh Raj',
            xp_reward: 15,
            created_at: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        {
            id: 'q-seed-02',
            title: 'Time Complexity of Binary Search Tree Lookup',
            description: 'Identify the worst-case time complexity of searching a node in an unbalanced BST.',
            options: [
                { id: 'A', text: 'O(log N)' },
                { id: 'B', text: 'O(N)' },
                { id: 'C', text: 'O(1)' },
                { id: 'D', text: 'O(N log N)' }
            ],
            correct_answer: 'B',
            explanation: 'When a BST degenerates into a skewed linear linked list (unbalanced), worst-case search becomes O(N).',
            difficulty: 'intermediate',
            category: 'C++ DSA',
            activity_type: 'daily_trial',
            is_published: true,
            creator_email: 'admin@msot.edu',
            creator_name: 'Utkarsh Raj',
            xp_reward: 20,
            created_at: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
            id: 'q-seed-03',
            title: 'Memory Leaks & Smart Pointers in C++17',
            description: 'Which smart pointer prevents cyclical reference memory leaks in node graphs?',
            options: [
                { id: 'A', text: 'std::unique_ptr' },
                { id: 'B', text: 'std::shared_ptr' },
                { id: 'C', text: 'std::weak_ptr' },
                { id: 'D', text: 'std::auto_ptr' }
            ],
            correct_answer: 'C',
            explanation: 'std::weak_ptr holds a non-owning weak reference to an object managed by std::shared_ptr, breaking reference cycles.',
            difficulty: 'advanced',
            category: 'C++ Memory Models',
            activity_type: 'daily_trial',
            is_published: true,
            creator_email: 'admin@msot.edu',
            creator_name: 'Utkarsh Raj',
            xp_reward: 25,
            created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 'q-seed-04',
            title: 'Weekend Lab Sprint: Two Sum Optimized Hash Map',
            description: 'Determine optimal auxiliary space complexity for Two Sum using an unordered hash map.',
            options: [
                { id: 'A', text: 'O(1) Aux Space' },
                { id: 'B', text: 'O(N) Aux Space' },
                { id: 'C', text: 'O(N^2) Aux Space' },
                { id: 'D', text: 'O(log N) Aux Space' }
            ],
            correct_answer: 'B',
            explanation: 'The hash map stores at most N elements during a single traversal, requiring O(N) auxiliary space.',
            difficulty: 'intermediate',
            category: 'Weekend Algorithm Lab',
            activity_type: 'weekend_lab',
            is_published: true,
            creator_email: 'admin@msot.edu',
            creator_name: 'Utkarsh Raj',
            xp_reward: 35,
            created_at: new Date(Date.now() - 86400000 * 4).toISOString()
        },
        {
            id: 'q-seed-05',
            title: 'Weekend Lab Sprint: Sliding Window Maximum',
            description: 'Which data structure achieves amortized O(N) time for monotonic sliding window maximum?',
            options: [
                { id: 'A', text: 'Min-Heap (Priority Queue)' },
                { id: 'B', text: 'Monotonic Double-Ended Queue (std::deque)' },
                { id: 'C', text: 'Balanced AVL Tree' },
                { id: 'D', text: 'Standard FIFO Queue' }
            ],
            correct_answer: 'B',
            explanation: 'A monotonic double-ended queue maintains candidate indices in descending value order, amortizing insertions and pops to O(1) per element.',
            difficulty: 'advanced',
            category: 'Weekend Algorithm Lab',
            activity_type: 'weekend_lab',
            is_published: true,
            creator_email: 'admin@msot.edu',
            creator_name: 'Utkarsh Raj',
            xp_reward: 50,
            created_at: new Date(Date.now() - 86400000 * 2).toISOString()
        }
    ];

    // ─── Seed Faculty Assignments ─────────────────────────────────────────────
    const SEED_ASSIGNMENTS = [
        {
            id: 'asg-01',
            title: 'Pointer Offsets & Dynamic Memory Allocator in C++',
            description: 'Implement a custom vector container with capacity doubling, pointer offset dereferencing, and destructor cleanups without memory leaks. Test with 10,000 push_back operations.',
            subject: 'C++ Systems Architecture',
            topic: 'Dynamic Arrays & Pointers',
            deadline: new Date(Date.now() + 86400000 * 4).toISOString(),
            xp_reward: 50,
            max_marks: 100,
            target_section: 'ALL',
            resource_url: 'https://en.cppreference.com/w/cpp/memory',
            is_published: true,
            status: 'ACTIVE',
            creator_id: 'usr_admin_01',
            creator_name: 'Utkarsh Raj',
            creator_email: 'admin@msot.edu',
            created_at: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        {
            id: 'asg-02',
            title: 'Binary Search Tree Balancing & Invariant Check',
            description: 'Write an algorithm to verify whether an arbitrary binary tree satisfies the BST invariant property in O(N) time complexity and compute the node balance factor.',
            subject: 'Data Structures & Algorithms',
            topic: 'Trees & Recursion',
            deadline: new Date(Date.now() + 86400000 * 6).toISOString(),
            xp_reward: 65,
            max_marks: 100,
            target_section: 'Section Alpha',
            resource_url: 'https://en.wikipedia.org/wiki/Binary_search_tree',
            is_published: true,
            status: 'ACTIVE',
            creator_id: 'usr_admin_01',
            creator_name: 'Utkarsh Raj',
            creator_email: 'admin@msot.edu',
            created_at: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
            id: 'asg-03',
            title: 'HTML5 Semantic Microdata & Accessibility Audit',
            description: 'Construct a compliant accessible card component utilizing semantic HTML5 tags, ARIA live-regions, keyboard tab navigation, and Schema.org microdata.',
            subject: 'Web Architecture',
            topic: 'Semantic HTML & A11y',
            deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
            xp_reward: 45,
            max_marks: 100,
            target_section: 'ALL',
            resource_url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility',
            is_published: true,
            status: 'ACTIVE',
            creator_id: 'usr_admin_01',
            creator_name: 'Utkarsh Raj',
            creator_email: 'admin@msot.edu',
            created_at: new Date(Date.now() - 86400000 * 4).toISOString()
        },
        {
            id: 'asg-04',
            title: 'Graph BFS Shortest Path & Queue Serialization',
            description: 'Implement breadth-first search to find the shortest unweighted path in a 100-node graph and return the serialized traversal array.',
            subject: 'Algorithms & Discrete Math',
            topic: 'Graphs & Queues',
            deadline: new Date(Date.now() + 86400000 * 9).toISOString(),
            xp_reward: 80,
            max_marks: 100,
            target_section: 'Section Beta',
            resource_url: 'https://en.wikipedia.org/wiki/Breadth-first_search',
            is_published: false,
            status: 'DRAFT',
            creator_id: 'usr_admin_01',
            creator_name: 'Utkarsh Raj',
            creator_email: 'admin@msot.edu',
            created_at: new Date(Date.now() - 86400000).toISOString()
        }
    ];

    // ─── Real Assignment Submissions (Starts empty, only real logged submissions) ──
    const SEED_ASSIGNMENT_SUBMISSIONS = [];

    // ─── Real Student Inactivity Reasons (Starts empty, only real logged reasons) ───
    const SEED_INACTIVITY_REASONS = [];

    // ─── Real Messages (Starts empty, only real sent messages) ────────────────────
    const SEED_MESSAGES = [];

    class MSOTRBACController {
        constructor() {
            this.questions             = this.loadQuestions();
            this.auditLogs             = this.loadAuditLogs();
            this.submissions           = this.loadSubmissions();
            this.assignments           = this.loadAssignments();
            this.assignmentSubmissions = this.loadAssignmentSubmissions();
            this.inactivityReasons     = this.loadInactivityReasons();
            this.messages              = this.loadMessages();
            this.adminNotifications    = this.loadAdminNotifications();

            this.activeAdminTab        = 'overview';
            this.activeFacultyTab      = 'overview';
            this.searchQuery           = '';
            this.roleFilter            = 'ALL';
            this.statusFilter          = 'ALL';
            this.activityFilter        = 'ALL';
            this.sectionFilter         = 'ALL';

            window.msotRBAC = this;
            setTimeout(() => { this.syncFromSupabase(); }, 500);

            // Listen for cross-tab registration and login requests in real time
            window.addEventListener('storage', (e) => {
                if (e.key === 'MSOT_ADMIN_NOTIFICATIONS_V1' || e.key === 'MSOT_LEARN_ACCOUNTS_V2') {
                    this.adminNotifications = this.loadAdminNotifications();
                    const adminBadge = document.getElementById('adminNotifBadge');
                    if (adminBadge) {
                        const cnt = this.getUnreadNotificationsCount();
                        adminBadge.textContent = cnt;
                        adminBadge.style.display = cnt > 0 ? 'inline-block' : 'none';
                    }
                    if (window.msotPlatform && typeof window.msotPlatform.renderAdminRules === 'function') {
                        const adminSec = document.getElementById('adminSection');
                        if (adminSec && adminSec.classList.contains('active')) {
                            window.msotPlatform.renderAdminRules();
                        }
                    }
                }
            });

            // Periodic background sync for Admin to capture new logins / registrations
            setInterval(() => {
                const curRole = (this.getCurrentRole() || (window.msotAuth && window.msotAuth.session?.role) || '').toUpperCase();
                if (curRole === 'ADMIN') {
                    this.syncFromSupabase();
                }
            }, 6000);

            console.log("⚡ MSOT RBAC & Governance Engine Initialized with Real-Time Notification Pipeline!");
        }

        // ─── Storage Helpers ─────────────────────────────────────────────────
        loadQuestions() {
            try {
                const raw = localStorage.getItem(STORAGE_QUESTIONS_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                }
            } catch (e) {}
            this.saveQuestions(SEED_QUESTIONS);
            return SEED_QUESTIONS;
        }

        saveQuestions(data) {
            try {
                localStorage.setItem(STORAGE_QUESTIONS_KEY, JSON.stringify(data));
                this.questions = data;
            } catch (e) {}
        }

        loadAuditLogs() {
            try {
                const raw = localStorage.getItem(STORAGE_AUDIT_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch (e) { return []; }
        }

        saveAuditLogs(logs) {
            try {
                localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(logs.slice(0, 100)));
                this.auditLogs = logs;
            } catch (e) {}
        }

        loadSubmissions() {
            try {
                const raw = localStorage.getItem(STORAGE_SUBMISSIONS_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch (e) { return []; }
        }

        saveSubmissions(subs) {
            try {
                localStorage.setItem(STORAGE_SUBMISSIONS_KEY, JSON.stringify(subs.slice(0, 500)));
                this.submissions = subs;
            } catch (e) {}
        }

        normalizeAssignment(asg) {
            if (!asg || typeof asg !== 'object') return asg;
            const isPub = (asg.is_published !== undefined) ? !!asg.is_published : (asg.isPublished !== undefined ? !!asg.isPublished : true);
            const maxM = asg.max_marks !== undefined ? asg.max_marks : (asg.maxMarks !== undefined ? asg.maxMarks : 100);
            const xp = asg.xp_reward !== undefined ? asg.xp_reward : (asg.xpReward !== undefined ? asg.xpReward : 50);
            const cName = asg.creator_name || asg.creatorName || 'Utkarsh Raj';
            const cEmail = asg.creator_email || asg.creatorEmail || 'faculty@msot.edu';

            asg.is_published = isPub;
            asg.isPublished = isPub;
            asg.max_marks = maxM;
            asg.maxMarks = maxM;
            asg.xp_reward = xp;
            asg.xpReward = xp;
            asg.creator_name = cName;
            asg.creatorName = cName;
            asg.creator_email = cEmail;
            asg.creatorEmail = cEmail;
            if (!asg.status) {
                asg.status = isPub ? 'ACTIVE' : 'DRAFT';
            }
            return asg;
        }

        loadAssignments() {
            try {
                const raw = localStorage.getItem(STORAGE_ASSIGNMENTS_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed.map(a => this.normalizeAssignment(a));
                    }
                }
            } catch (e) {}
            const seeded = (SEED_ASSIGNMENTS || []).map(a => this.normalizeAssignment(a));
            this.saveAssignments(seeded);
            return seeded;
        }

        saveAssignments(data) {
            try {
                localStorage.setItem(STORAGE_ASSIGNMENTS_KEY, JSON.stringify(data));
                this.assignments = data;
            } catch (e) {}
        }

        loadAssignmentSubmissions() {
            try {
                const raw = localStorage.getItem(STORAGE_ASSIGNMENT_SUBS_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                        const realSubs = parsed.filter(s => s && s.student_name !== 'Priya Patel' && s.id !== 'sub-01' && s.id !== 'sub-02' && s.id !== 'sub-03');
                        return realSubs;
                    }
                }
            } catch (e) {}
            return [];
        }

        saveAssignmentSubmissions(data) {
            try {
                localStorage.setItem(STORAGE_ASSIGNMENT_SUBS_KEY, JSON.stringify(data));
                this.assignmentSubmissions = data;
            } catch (e) {}
        }

        loadInactivityReasons() {
            try {
                const raw = localStorage.getItem(STORAGE_INACTIVITY_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                        const realReasons = parsed.filter(r => r && r.id !== 'inact-01' && r.id !== 'inact-02' && r.id !== 'inact-03' && r.id !== 'inact-04');
                        return realReasons;
                    }
                }
            } catch (e) {}
            return [];
        }

        saveInactivityReasons(data) {
            try {
                localStorage.setItem(STORAGE_INACTIVITY_KEY, JSON.stringify(data));
                this.inactivityReasons = data;
            } catch (e) {}
        }

        normalizeMessage(m) {
            if (!m || typeof m !== 'object') return m;
            const sName = m.sender_name || m.senderName || 'Academic Staff';
            const sEmail = m.sender_email || m.senderEmail || 'faculty@msot.edu';
            const rName = m.receiver_name || m.receiverName || m.studentName || 'Cadet';
            const rEmail = m.receiver_email || m.receiverEmail || m.studentEmail || '';
            const body = m.content || m.body || '';
            const cAt = m.created_at || m.createdAt || new Date().toISOString();

            m.sender_name = sName;
            m.senderName = sName;
            m.sender_email = sEmail;
            m.senderEmail = sEmail;
            m.receiver_name = rName;
            m.receiverName = rName;
            m.student_name = rName;
            m.studentName = rName;
            m.receiver_email = rEmail;
            m.receiverEmail = rEmail;
            m.student_email = rEmail;
            m.studentEmail = rEmail;
            m.content = body;
            m.body = body;
            m.created_at = cAt;
            m.createdAt = cAt;
            return m;
        }

        loadMessages() {
            try {
                const raw = localStorage.getItem(STORAGE_MESSAGES_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                        const realMsgs = parsed.filter(m => m && m.id !== 'msg-01' && m.id !== 'msg-02' && m.id !== 'msg-03' && m.id !== 'msg-04');
                        return realMsgs.map(m => this.normalizeMessage(m));
                    }
                }
            } catch (e) {}
            return [];
        }

        saveMessages(data) {
            try {
                localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(data));
                this.messages = data;
            } catch (e) {}
        }

        // ─── Role Verification & Permission Checking ────────────────────────
        getCurrentUser() {
            return window.msotAuth?.session || null;
        }

        getCurrentRole() {
            const user = this.getCurrentUser();
            return (user?.role || window.msotPlatform?.activeRole || 'STUDENT').toUpperCase();
        }

        isAdmin() {
            return this.getCurrentRole() === 'ADMIN';
        }

        isFaculty() {
            return this.getCurrentRole() === 'FACULTY';
        }

        isStudent() {
            return this.getCurrentRole() === 'STUDENT';
        }

        // ─── Student Activity Status Calculator ─────────────────────────────
        calculateActivity(lastActiveISO) {
            if (!lastActiveISO) {
                return {
                    status: 'LONG_INACTIVE',
                    label: 'Long Inactive',
                    badgeClass: 'status-long-inactive',
                    daysInactive: 99,
                    formatted: 'Never active',
                    dateFormatted: 'No record',
                    icon: '🔴'
                };
            }
            const then = new Date(lastActiveISO).getTime();
            const now = Date.now();
            const diffMs = Math.max(0, now - then);
            const diffHours = diffMs / (1000 * 60 * 60);
            const diffDays = Math.floor(diffHours / 24);

            let status = 'ACTIVE';
            let label = 'Active';
            let badgeClass = 'status-active';
            let icon = '🟢';

            if (diffHours < 24) {
                status = 'ACTIVE';
                label = 'Active';
                badgeClass = 'status-active';
                icon = '🟢';
            } else if (diffDays >= 1 && diffDays <= 3) {
                status = 'RECENTLY_ACTIVE';
                label = 'Recently Active';
                badgeClass = 'status-recently';
                icon = '🟡';
            } else if (diffDays >= 4 && diffDays <= 7) {
                status = 'INACTIVE';
                label = 'Inactive';
                badgeClass = 'status-inactive';
                icon = '🟠';
            } else {
                status = 'LONG_INACTIVE';
                label = 'Long Inactive';
                badgeClass = 'status-long-inactive';
                icon = '🔴';
            }

            const formatted = diffDays === 0 ? 'Active Today (< 24h)' : (diffDays === 1 ? '1 day ago' : `${diffDays} days ago`);
            const dateFormatted = new Date(lastActiveISO).toLocaleString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return {
                status,
                label,
                badgeClass,
                daysInactive: diffDays,
                formatted,
                dateFormatted,
                icon
            };
        }

        recordUserActivity(email) {
            if (!email) return;
            const nowISO = new Date().toISOString();
            try {
                const stored = localStorage.getItem('MSOT_LEARN_ACCOUNTS_V2');
                const accounts = stored ? JSON.parse(stored) : {};
                if (accounts[email.toLowerCase()]) {
                    accounts[email.toLowerCase()].lastActive = nowISO;
                    localStorage.setItem('MSOT_LEARN_ACCOUNTS_V2', JSON.stringify(accounts));
                }
                const sess = window.msotAuth?.session;
                if (sess && sess.email.toLowerCase() === email.toLowerCase()) {
                    sess.lastActive = nowISO;
                    localStorage.setItem('MSOT_LEARN_AUTH_SESSION_V1', JSON.stringify(sess));
                }
            } catch (e) {}

            if (window.supabaseClient) {
                window.supabaseClient.from('user_stats')
                    .update({ last_active: nowISO })
                    .eq('user_id', window.msotAuth?.session?.id || '')
                    .then().catch(() => {});
            }
        }

        // ─── Audit Logging ──────────────────────────────────────────────────
        logAudit(action, targetType, targetId, details = {}) {
            const user = this.getCurrentUser() || { email: 'system', role: 'SYSTEM' };
            const entry = {
                id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                timestamp: new Date().toISOString(),
                actor_email: user.email,
                actor_role: (user.role || 'STUDENT').toUpperCase(),
                action,
                target_type: targetType,
                target_id: targetId,
                details
            };
            const updated = [entry, ...this.auditLogs];
            this.saveAuditLogs(updated);

            if (window.supabaseClient) {
                window.supabaseClient.from('audit_logs').insert([{
                    actor_email: user.email,
                    actor_role: (user.role || 'student').toLowerCase(),
                    action,
                    target_type: targetType,
                    target_id: String(targetId),
                    details
                }]).then().catch(() => {});
            }
        }

        // ─── User Management (Admin & Faculty Views) ────────────────────────
        getAllUsers() {
            const builtin = {
                'harsh5217a@gmail.com': {
                    id: 'usr_harsh_01',
                    email: 'harsh5217a@gmail.com',
                    name: 'harsh',
                    username: 'harsjh5217',
                    callsign: 'Harsh',
                    profilePic: 'assets/images/cadets/cadet_dev.jpg',
                    studentId: 'msot 2026',
                    role: 'STUDENT',
                    status: 'ACTIVE',
                    avatar: '⚔️',
                    branch: 'Computer Science & Engineering (CSE)',
                    section: 'Section Beta',
                    semester: 'Semester 1',
                    academicYear: '2026–2027 (1st Year)',
                    year: '1st Year',
                    phone: '+917209458098',
                    track: 'C++ Algorithms & DSA',
                    attendance: '92%',
                    attendanceNum: 92,
                    attendancePresent: 37,
                    attendanceTotal: 40,
                    stats: { force: 85, agility: 80, endurance: 92, intelligence: 88 },
                    academicRemarks: 'Registered cadet in Section Beta. Active in algorithmic practice and C++ compiler labs.',
                    xp: 850,
                    streak: 3,
                    questionsSolved: 8,
                    assignmentsCompleted: 1,
                    lastActive: new Date().toISOString(),
                    registeredAt: '2026-08-20T08:00:00Z',
                    leagueTier: 'Gold League',
                    leagueRank: 5,
                    guildName: 'Binary Blades',
                    guildRole: 'Cadet',
                    battleClashShare: '30% (2 Solved)'
                },
                'billiff98015@gmail.com': {
                    id: 'usr_harshsingh_02',
                    email: 'billiff98015@gmail.com',
                    name: 'harsh singh',
                    username: 'harshsingh',
                    callsign: 'Harsh S',
                    profilePic: 'assets/images/cadets/cadet_manish.jpg',
                    studentId: '260458',
                    role: 'STUDENT',
                    status: 'ACTIVE',
                    avatar: '⚔️',
                    branch: 'Computer Science & Engineering (CSE)',
                    section: 'Section Beta',
                    semester: 'Semester 1',
                    academicYear: '2026–2027 (1st Year)',
                    year: '1st Year',
                    phone: '',
                    track: 'C++ Algorithms & DSA',
                    attendance: '88%',
                    attendanceNum: 88,
                    attendancePresent: 35,
                    attendanceTotal: 40,
                    stats: { force: 80, agility: 82, endurance: 88, intelligence: 84 },
                    academicRemarks: 'Registered cadet in Section Beta. Focuses on data structures and foundational problem solving.',
                    xp: 720,
                    streak: 2,
                    questionsSolved: 6,
                    assignmentsCompleted: 0,
                    lastActive: new Date(Date.now() - 86400000).toISOString(),
                    registeredAt: '2026-08-22T08:00:00Z',
                    leagueTier: 'Silver League',
                    leagueRank: 8,
                    guildName: 'Cyber Ronin',
                    guildRole: 'Recruit',
                    battleClashShare: '20% (1 Solved)'
                },
                'cadet.utkarsh.msot@gmail.com': {
                    id: 'usr_utkarsh_cadet_03',
                    email: 'cadet.utkarsh.msot@gmail.com',
                    name: 'Utkarsh Cadet',
                    username: 'utkarsh_cadet',
                    callsign: 'Cadet',
                    profilePic: 'assets/images/cadets/cadet_rohan.jpg',
                    studentId: 'MSOT-2026-004',
                    role: 'STUDENT',
                    status: 'ACTIVE',
                    avatar: '⚔️',
                    branch: 'Computer Science & Engineering (CSE)',
                    section: 'Section Alpha',
                    semester: 'Semester 1',
                    academicYear: '2026–2027 (1st Year)',
                    year: '1st Year',
                    phone: '',
                    track: 'C++ Algorithms & DSA',
                    attendance: '90%',
                    attendanceNum: 90,
                    attendancePresent: 36,
                    attendanceTotal: 40,
                    stats: { force: 88, agility: 86, endurance: 90, intelligence: 91 },
                    academicRemarks: 'Registered cadet in Section Alpha. Active participant in daily trials and code problem sprints.',
                    xp: 980,
                    streak: 4,
                    questionsSolved: 10,
                    assignmentsCompleted: 1,
                    lastActive: new Date().toISOString(),
                    registeredAt: '2026-09-01T08:00:00Z',
                    leagueTier: 'Platinum League',
                    leagueRank: 4,
                    guildName: 'Binary Blades',
                    guildRole: 'Cadet',
                    battleClashShare: '35% (3 Solved)'
                },
                'aarav@gmail.com': {
                    id: 'usr_aarav_04',
                    email: 'aarav@gmail.com',
                    name: 'aarav',
                    username: 'aarav',
                    callsign: 'Aarav',
                    profilePic: 'assets/images/cadets/cadet_aarav.jpg',
                    studentId: 'MSOT-2026-005',
                    role: 'STUDENT',
                    status: 'ACTIVE',
                    avatar: '🛡️',
                    branch: 'Computer Science & Engineering (CSE)',
                    section: 'Section Alpha',
                    semester: 'Semester 1',
                    academicYear: '2026–2027 (1st Year)',
                    year: '1st Year',
                    phone: '',
                    track: 'C++ Algorithms (7 Trials)',
                    attendance: '85%',
                    attendanceNum: 85,
                    attendancePresent: 34,
                    attendanceTotal: 40,
                    stats: { force: 82, agility: 84, endurance: 85, intelligence: 86 },
                    academicRemarks: 'Registered cadet in Section Alpha. Active in Sacred Trials and daily challenges.',
                    xp: 640,
                    streak: 2,
                    questionsSolved: 5,
                    assignmentsCompleted: 0,
                    lastActive: new Date(Date.now() - 86400000 * 2).toISOString(),
                    registeredAt: '2026-09-05T08:00:00Z',
                    leagueTier: 'Gold League',
                    leagueRank: 11,
                    guildName: 'Quantum Kitsune',
                    guildRole: 'Recruit',
                    battleClashShare: '15% (1 Solved)'
                },
                'student@msot.edu': {
                    id: 'usr_student_msot',
                    email: 'student@msot.edu',
                    name: 'Utkarsh Raj',
                    username: 'utkarsh_cadet',
                    callsign: 'Utkarsh',
                    profilePic: 'assets/images/cadets/cadet_aarav.jpg',
                    studentId: 'MSOT-2026-001',
                    role: 'STUDENT',
                    status: 'ACTIVE',
                    avatar: '⚔️',
                    branch: 'Computer Science & Engineering (CSE)',
                    section: 'Section Alpha',
                    semester: 'Semester 1',
                    academicYear: '2026–2027 (1st Year)',
                    year: '1st Year',
                    phone: '',
                    track: 'C++ Algorithms & DSA',
                    attendance: '96%',
                    attendanceNum: 96,
                    attendancePresent: 38,
                    attendanceTotal: 40,
                    stats: { force: 94, agility: 92, endurance: 96, intelligence: 95 },
                    academicRemarks: 'Active enrolled cadet in Section Alpha. High engagement in compiler lab and algorithmic challenges.',
                    xp: 1540,
                    streak: 6,
                    questionsSolved: 14,
                    assignmentsCompleted: 2,
                    lastActive: new Date().toISOString(),
                    registeredAt: '2026-08-15T08:00:00Z',
                    leagueTier: 'Diamond League',
                    leagueRank: 2,
                    guildName: 'Binary Blades',
                    guildRole: 'Cadet',
                    battleClashShare: '45% (5 Solved)'
                },
                'admin@msot.edu': {
                    id: 'usr_admin_01',
                    email: 'admin@msot.edu',
                    name: 'Utkarsh Raj',
                    username: 'utkarsh_raj',
                    callsign: 'Utkarsh',
                    profilePic: 'assets/images/cadets/cadet_aarav.jpg',
                    studentId: 'ADM-MSOT-001',
                    role: 'ADMIN',
                    status: 'ACTIVE',
                    avatar: '🛡️',
                    branch: 'System Governance & Academic Control',
                    section: 'All Sectors',
                    semester: 'Master Control',
                    academicYear: '2026–2027',
                    year: 'System Administrator',
                    phone: '',
                    track: 'System Governance',
                    attendance: '98%',
                    attendanceNum: 98,
                    attendancePresent: 39,
                    attendanceTotal: 40,
                    stats: { force: 98, agility: 96, endurance: 98, intelligence: 99 },
                    academicRemarks: 'Master Administrator and Academy Lead. Complete platform governance and curriculum authority.',
                    xp: 15400,
                    streak: 45,
                    questionsSolved: 120,
                    lastActive: new Date().toISOString(),
                    registeredAt: '2026-08-01T08:00:00Z'
                },
                'utkarshraj142006@gmail.com': {
                    id: 'usr_utkarsh_real',
                    email: 'utkarshraj142006@gmail.com',
                    name: 'Utkarsh Raj',
                    username: 'utkarsh_raj',
                    callsign: 'Utkarsh',
                    profilePic: 'assets/images/cadets/cadet_aarav.jpg',
                    studentId: 'ADM-MSOT-001',
                    role: 'ADMIN',
                    status: 'ACTIVE',
                    avatar: '🛡️',
                    branch: 'Computer Science & Engineering (CSE)',
                    section: 'Section Alpha',
                    semester: 'Semester 4',
                    academicYear: '2026–2027',
                    year: 'Administrator',
                    phone: '',
                    track: 'C++ Algorithms & DSA',
                    attendance: '98%',
                    attendanceNum: 98,
                    attendancePresent: 39,
                    attendanceTotal: 40,
                    stats: { force: 98, agility: 96, endurance: 98, intelligence: 99 },
                    academicRemarks: 'Master Administrator account. Unrestricted platform governance and system access.',
                    xp: 15400,
                    streak: 45,
                    questionsSolved: 120,
                    lastActive: new Date().toISOString(),
                    registeredAt: '2026-08-01T08:00:00Z'
                }
            };

            // Merge with local accounts
            try {
                const stored = localStorage.getItem('MSOT_LEARN_ACCOUNTS_V2');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const isCustomUrl = (url) => Boolean(url && typeof url === 'string' && (url.startsWith('data:') || url.startsWith('http') || url.startsWith('blob:') || url.startsWith('/storage')) && !url.includes('cadet_') && !url.includes('gateway_') && !url.includes('default'));

                    for (const [em, acc] of Object.entries(parsed)) {
                        const emailKey = em.toLowerCase();
                        let customPhoto = null;
                        if (isCustomUrl(acc.customPhotoUrl)) customPhoto = acc.customPhotoUrl;
                        else if (isCustomUrl(acc.profile_pic)) customPhoto = acc.profile_pic;
                        else if (isCustomUrl(acc.profilePic)) customPhoto = acc.profilePic;
                        else if (isCustomUrl(acc.avatar_url)) customPhoto = acc.avatar_url;
                        else if (isCustomUrl(acc.avatar)) customPhoto = acc.avatar;

                        try {
                            const userStoreKey = `MSOT_STUDENT_PROFILE_${emailKey.replace(/[^a-z0-9]/g, '_')}`;
                            const localProf = JSON.parse(localStorage.getItem(userStoreKey) || 'null');
                            if (localProf) {
                                if (isCustomUrl(localProf.customPhotoUrl)) customPhoto = localProf.customPhotoUrl;
                                else if (isCustomUrl(localProf.profilePic)) customPhoto = localProf.profilePic;
                                else if (isCustomUrl(localProf.avatar_url)) customPhoto = localProf.avatar_url;
                                else if (isCustomUrl(localProf.avatar)) customPhoto = localProf.avatar;
                                else if (localProf.customPhotoUrl === null || localProf.customPhotoUrl === '') customPhoto = null;
                            }
                        } catch(e) {}

                        if (acc.customPhotoUrl === null || acc.customPhotoUrl === '') {
                            customPhoto = null;
                        }

                        if (!builtin[emailKey]) {
                            builtin[emailKey] = {
                                id: acc.id || `usr_${Date.now()}`,
                                email: acc.email,
                                name: acc.name,
                                username: acc.username,
                                studentId: acc.studentId || 'MSOT-CADET',
                                role: (acc.role || 'STUDENT').toUpperCase(),
                                requested_role: (acc.requested_role || acc.role || 'STUDENT').toUpperCase(),
                                approval_status: (acc.approval_status || (acc.status === 'PENDING' ? 'PENDING' : 'APPROVED')).toUpperCase(),
                                status: acc.status || 'ACTIVE',
                                rejection_reason: acc.rejection_reason || '',
                                approved_at: acc.approved_at || null,
                                approved_by: acc.approved_by || null,
                                avatar: customPhoto || acc.avatar || '⚔️',
                                profilePic: customPhoto || 'assets/images/cadets/cadet_aarav.jpg',
                                customPhotoUrl: customPhoto || null,
                                branch: acc.branch || 'Computer Science & Engineering (CSE)',
                                section: acc.section || 'Section Alpha',
                                semester: acc.semester || 'Semester 4',
                                year: acc.year || '2nd Year',
                                phone: acc.phone || '',
                                track: acc.track || 'C++ Algorithms & DSA',
                                xp: acc.xp || 450,
                                streak: acc.streak || 1,
                                questionsSolved: acc.questionsSolved || 3,
                                lastActive: acc.lastActive || new Date().toISOString(),
                                registeredAt: acc.registeredAt || new Date().toISOString(),
                                leagueTier: acc.leagueTier || 'Diamond League',
                                leagueRank: acc.leagueRank || 9,
                                guildName: acc.guildName || 'Binary Blades',
                                guildRole: acc.guildRole || 'Cadet',
                                battleClashShare: acc.battleClashShare || '35% (3 Solved)'
                            };
                        } else {
                            if (acc.status) builtin[emailKey].status = acc.status;
                            if (acc.role) builtin[emailKey].role = acc.role;
                            if (acc.requested_role) builtin[emailKey].requested_role = acc.requested_role;
                            if (acc.approval_status) builtin[emailKey].approval_status = acc.approval_status;
                            if (acc.rejection_reason !== undefined) builtin[emailKey].rejection_reason = acc.rejection_reason;
                            if (acc.lastActive) builtin[emailKey].lastActive = acc.lastActive;
                            if (customPhoto) {
                                builtin[emailKey].profilePic = customPhoto;
                                builtin[emailKey].customPhotoUrl = customPhoto;
                                builtin[emailKey].avatar = customPhoto;
                            } else {
                                delete builtin[emailKey].customPhotoUrl;
                                builtin[emailKey].profilePic = 'assets/images/cadets/cadet_aarav.jpg';
                            }
                        }
                    }
                }
            } catch (e) {}

            // Dynamically merge active logged-in user
            const sess = this.getCurrentUser();
            if (sess && sess.email) {
                const sKey = sess.email.toLowerCase();
                const isCustomUrl = (url) => Boolean(url && typeof url === 'string' && (url.startsWith('data:') || url.startsWith('http') || url.startsWith('blob:') || url.startsWith('/storage')) && !url.includes('cadet_') && !url.includes('gateway_') && !url.includes('default'));
                let sessPhoto = null;
                if (isCustomUrl(sess.customPhotoUrl)) sessPhoto = sess.customPhotoUrl;
                else if (isCustomUrl(sess.profile_pic)) sessPhoto = sess.profile_pic;
                else if (isCustomUrl(sess.profilePic)) sessPhoto = sess.profilePic;
                else if (isCustomUrl(sess.avatar_url)) sessPhoto = sess.avatar_url;
                else if (isCustomUrl(sess.avatar)) sessPhoto = sess.avatar;

                if (!builtin[sKey]) {
                    builtin[sKey] = {
                        id: sess.id || `usr_curr_${Date.now()}`,
                        email: sess.email,
                        name: sess.name || sess.email.split('@')[0],
                        username: sess.username || sess.alias || sess.email.split('@')[0],
                        callsign: (sess.name || sess.email.split('@')[0]).split(' ')[0],
                        studentId: sess.studentId || 'MSOT-CADET',
                        role: (sess.role || 'STUDENT').toUpperCase(),
                        status: 'ACTIVE',
                        avatar: sessPhoto || sess.avatar || '⚔️',
                        profilePic: sessPhoto || 'assets/images/cadets/cadet_aarav.jpg',
                        customPhotoUrl: sessPhoto || null,
                        branch: sess.branch || 'Computer Science & Engineering (CSE)',
                        section: sess.section || 'Section Alpha',
                        semester: sess.semester || 'Semester 1',
                        academicYear: sess.academicYear || '2026–2027 (1st Year)',
                        year: sess.year || '1st Year',
                        phone: sess.phone || '',
                        track: sess.track || 'C++ Algorithms & DSA',
                        attendance: sess.attendance || '94%',
                        attendanceNum: sess.attendanceNum || 94,
                        attendancePresent: 38,
                        attendanceTotal: 40,
                        lastActive: new Date().toISOString(),
                        registeredAt: sess.registeredAt || new Date().toISOString()
                    };
                } else {
                    if (sess.name) builtin[sKey].name = sess.name;
                    if (sess.role) builtin[sKey].role = sess.role.toUpperCase();
                    if (sess.studentId) builtin[sKey].studentId = sess.studentId;
                    if (sessPhoto) {
                        builtin[sKey].profilePic = sessPhoto;
                        builtin[sKey].customPhotoUrl = sessPhoto;
                        builtin[sKey].avatar = sessPhoto;
                    } else if (sess.customPhotoUrl === null || sess.customPhotoUrl === '') {
                        delete builtin[sKey].customPhotoUrl;
                        builtin[sKey].profilePic = 'assets/images/cadets/cadet_aarav.jpg';
                    }
                }
            }

            return Object.values(builtin);
        }

        getStudentsOnly(sectionFilter = 'ALL') {
            const all = this.getAllUsers().filter(u => u.role === 'STUDENT');
            if (sectionFilter !== 'ALL') {
                return all.filter(u => u.section && u.section.toLowerCase().includes(sectionFilter.toLowerCase()));
            }
            return all;
        }

        getStudentUsers(sectionFilter = 'ALL') {
            return this.getStudentsOnly(sectionFilter);
        }

        getFacultyOnly() {
            return this.getAllUsers().filter(u => u.role === 'FACULTY');
        }

        getFacultyUsers() {
            return this.getFacultyOnly();
        }

        getUser(email) {
            return this.getUserByEmail(email);
        }

        getUserByEmail(email) {
            if (!email) return null;
            const clean = email.toLowerCase().trim();
            const all = this.getAllUsers();
            let found = all.find(u => u.email.toLowerCase() === clean);
            if (found) return found;
            return all.find(u => (u.name && u.name.toLowerCase() === clean) || (u.username && u.username.toLowerCase() === clean) || (u.callsign && u.callsign.toLowerCase() === clean)) || null;
        }

        updateUserRole(email, newRole) {
            if (!this.isAdmin()) {
                alert('⚠️ Access Denied: Only Administrators can modify user roles.');
                return false;
            }

            const cleanEmail = email.toLowerCase();
            const validRoles = ['STUDENT', 'FACULTY', 'ADMIN'];
            if (!validRoles.includes(newRole.toUpperCase())) {
                alert('Invalid role specified.');
                return false;
            }

            if (cleanEmail === 'admin@msot.edu' && newRole !== 'ADMIN') {
                alert('⚠️ Protection: The Master System Administrator account role cannot be changed.');
                return false;
            }

            try {
                const stored = localStorage.getItem('MSOT_LEARN_ACCOUNTS_V2');
                const accounts = stored ? JSON.parse(stored) : {};
                if (!accounts[cleanEmail]) {
                    const existing = this.getUserByEmail(cleanEmail);
                    accounts[cleanEmail] = existing ? { ...existing } : { email: cleanEmail, name: email.split('@')[0] };
                }
                accounts[cleanEmail].role = newRole.toUpperCase();
                localStorage.setItem('MSOT_LEARN_ACCOUNTS_V2', JSON.stringify(accounts));

                const sess = window.msotAuth?.session;
                if (sess && sess.email.toLowerCase() === cleanEmail) {
                    sess.role = newRole.toUpperCase();
                    localStorage.setItem('MSOT_LEARN_AUTH_SESSION_V1', JSON.stringify(sess));
                }

                this.logAudit('USER_ROLE_UPDATED', 'user', cleanEmail, { new_role: newRole });
                return true;
            } catch (e) {
                return false;
            }
        }

        updateUserPhoto(email, photoUrl) {
            const cleanEmail = (email || '').toLowerCase().trim();
            if (!cleanEmail) return false;

            const sessionEmail = (window.msotAuth?.session?.email || '').toLowerCase().trim();
            const isAdmin = this.isAdmin();

            // Security constraint: Students can only change their own photo; Admin can manage all
            if (!isAdmin && sessionEmail !== cleanEmail) {
                alert('⚠️ Access Denied: You are only authorized to modify your own profile photo.');
                return false;
            }

            try {
                const stored = localStorage.getItem('MSOT_LEARN_ACCOUNTS_V2');
                const accounts = stored ? JSON.parse(stored) : {};
                if (!accounts[cleanEmail]) {
                    const existing = this.getUserByEmail(cleanEmail);
                    accounts[cleanEmail] = existing ? { ...existing } : { email: cleanEmail, name: email.split('@')[0] };
                }

                if (photoUrl) {
                    accounts[cleanEmail].customPhotoUrl = photoUrl;
                    accounts[cleanEmail].profilePic = photoUrl;
                    accounts[cleanEmail].avatar_url = photoUrl;
                    accounts[cleanEmail].avatar = photoUrl;
                } else {
                    delete accounts[cleanEmail].customPhotoUrl;
                    delete accounts[cleanEmail].profilePic;
                    delete accounts[cleanEmail].avatar_url;
                    // Revert to default AI avatar
                    accounts[cleanEmail].profilePic = 'assets/images/cadets/cadet_aarav.jpg';
                    accounts[cleanEmail].avatar = accounts[cleanEmail].defaultAvatar || '⚔️';
                }
                localStorage.setItem('MSOT_LEARN_ACCOUNTS_V2', JSON.stringify(accounts));

                // Synchronize student profile state store
                const userStoreKey = `MSOT_STUDENT_PROFILE_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
                const savedProfile = localStorage.getItem(userStoreKey);
                if (savedProfile) {
                    try {
                        const parsed = JSON.parse(savedProfile);
                        if (photoUrl) {
                            parsed.customPhotoUrl = photoUrl;
                            parsed.profilePic = photoUrl;
                            parsed.avatar_url = photoUrl;
                            parsed.avatar = photoUrl;
                        } else {
                            delete parsed.customPhotoUrl;
                            delete parsed.profilePic;
                            delete parsed.avatar_url;
                            parsed.avatar = parsed.defaultAvatar || '⚔️';
                        }
                        localStorage.setItem(userStoreKey, JSON.stringify(parsed));
                    } catch (err) {}
                }

                // Update active user session if applicable
                const sess = window.msotAuth?.session;
                if (sess && sess.email.toLowerCase() === cleanEmail) {
                    if (photoUrl) {
                        sess.customPhotoUrl = photoUrl;
                        sess.profilePic = photoUrl;
                        sess.avatar_url = photoUrl;
                        sess.avatar = photoUrl;
                    } else {
                        delete sess.customPhotoUrl;
                        delete sess.profilePic;
                        delete sess.avatar_url;
                        sess.avatar = sess.defaultAvatar || '⚔️';
                    }
                    localStorage.setItem('MSOT_LEARN_AUTH_SESSION_V1', JSON.stringify(sess));
                }

                // Update active platform state
                if (window.msotState?.student && (window.msotState.student.email || '').toLowerCase() === cleanEmail) {
                    if (photoUrl) {
                        window.msotState.student.customPhotoUrl = photoUrl;
                        window.msotState.student.profilePic = photoUrl;
                        window.msotState.student.avatar_url = photoUrl;
                        window.msotState.student.avatar = photoUrl;
                    } else {
                        delete window.msotState.student.customPhotoUrl;
                        delete window.msotState.student.profilePic;
                        delete window.msotState.student.avatar_url;
                        window.msotState.student.avatar = window.msotState.student.defaultAvatar || '⚔️';
                    }
                    if (window.msotState.save) window.msotState.save();
                }

                // Sync with remote Supabase database if connected
                if (window.msotAuth?.supabaseClient) {
                    window.msotAuth.supabaseClient
                        .from('profiles')
                        .update({
                            avatar_url: photoUrl || null,
                            custom_photo_url: photoUrl || null,
                            profile_pic: photoUrl || null,
                            updated_at: new Date().toISOString()
                        })
                        .eq('email', cleanEmail)
                        .then(() => {})
                        .catch(() => {});
                }

                // Audit logging
                this.logAudit(photoUrl ? 'USER_PHOTO_UPDATED' : 'USER_PHOTO_REMOVED', 'user', cleanEmail, {
                    hasCustomPhoto: Boolean(photoUrl)
                });

                // Trigger seamless re-renders across views
                if (window.msotPlatform) {
                    if (window.msotPlatform.updateHeaderStats) window.msotPlatform.updateHeaderStats();
                    if (window.location.hash === '#/profile' && window.msotPlatform.renderStudentProfile) {
                        window.msotPlatform.renderStudentProfile();
                    }
                    const facultyDashboard = document.getElementById('facultyDashboardSection');
                    if (facultyDashboard && facultyDashboard.style.display !== 'none' && window.msotPlatform.renderFacultyDashboard) {
                        window.msotPlatform.renderFacultyDashboard();
                    }
                }

                window.dispatchEvent(new CustomEvent('msot:profile-photo-updated', { detail: { email: cleanEmail, photoUrl } }));
                return true;
            } catch (e) {
                console.error('Failed to update user profile photo:', e);
                return false;
            }
        }

        toggleUserStatus(email) {
            if (!this.isAdmin()) {
                alert('⚠️ Access Denied: Only Administrators can activate or deactivate accounts.');
                return false;
            }

            const cleanEmail = email.toLowerCase();
            if (cleanEmail === 'admin@msot.edu') {
                alert('⚠️ Protection: Master Administrator account cannot be deactivated.');
                return false;
            }

            try {
                const stored = localStorage.getItem('MSOT_LEARN_ACCOUNTS_V2');
                const accounts = stored ? JSON.parse(stored) : {};
                const currentStatus = accounts[cleanEmail]?.status || this.getUserByEmail(cleanEmail)?.status || 'ACTIVE';
                const newStatus = (currentStatus === 'ACTIVE') ? 'INACTIVE' : 'ACTIVE';

                if (!accounts[cleanEmail]) {
                    const existing = this.getUserByEmail(cleanEmail);
                    accounts[cleanEmail] = existing ? { ...existing } : { email: cleanEmail, name: email.split('@')[0] };
                }
                accounts[cleanEmail].status = newStatus;
                localStorage.setItem('MSOT_LEARN_ACCOUNTS_V2', JSON.stringify(accounts));

                this.logAudit('USER_STATUS_TOGGLED', 'user', cleanEmail, { new_status: newStatus });
                return newStatus;
            } catch (e) {
                return false;
            }
        }

        resetUserPassword(email) {
            if (!this.isAdmin()) {
                alert('⚠️ Access Denied: Only Admins can trigger password resets for other users.');
                return false;
            }

            const cleanEmail = email.toLowerCase();
            if (window.supabaseClient) {
                window.supabaseClient.auth.resetPasswordForEmail(cleanEmail)
                    .then(() => console.log("Password reset dispatched to Supabase."))
                    .catch(() => {});
            }

            this.logAudit('PASSWORD_RESET_DISPATCHED', 'user', cleanEmail);
            return true;
        }

        // ─── Registration Approvals & Notifications Governance ────────────────
        async syncFromSupabase() {
            if (!window.supabaseClient) return;
            try {
                const { data: profiles, error: pErr } = await window.supabaseClient
                    .from('profiles')
                    .select('*');
                if (profiles && !pErr && profiles.length > 0) {
                    const stored = localStorage.getItem('MSOT_LEARN_ACCOUNTS_V2');
                    const accounts = stored ? JSON.parse(stored) : {};
                    profiles.forEach(p => {
                        const em = (p.email || '').toLowerCase().trim();
                        if (em) {
                            const appStatus = (p.approval_status || accounts[em]?.approval_status || 'PENDING').toUpperCase();
                            accounts[em] = {
                                ...(accounts[em] || {}),
                                id: p.id,
                                email: p.email,
                                name: p.display_name || p.full_name || accounts[em]?.name || em.split('@')[0],
                                username: p.username || accounts[em]?.username,
                                studentId: p.student_id || accounts[em]?.studentId,
                                role: (p.role || accounts[em]?.role || 'STUDENT').toUpperCase(),
                                requested_role: (p.requested_role || accounts[em]?.requested_role || p.role || 'STUDENT').toUpperCase(),
                                approval_status: appStatus,
                                status: (p.status || accounts[em]?.status || appStatus || 'ACTIVE').toUpperCase(),
                                rejection_reason: p.rejection_reason || accounts[em]?.rejection_reason || null,
                                year: p.year || accounts[em]?.year,
                                semester: p.semester || accounts[em]?.semester,
                                section: p.section || accounts[em]?.section,
                                branch: p.branch || accounts[em]?.branch,
                                phone: p.phone || accounts[em]?.phone,
                                avatar: p.avatar || accounts[em]?.avatar,
                                registeredAt: p.created_at || accounts[em]?.registeredAt || new Date().toISOString(),
                                approvedAt: p.approved_at || accounts[em]?.approvedAt,
                                approvedBy: p.approved_by || accounts[em]?.approvedBy
                            };
                        }
                    });
                    localStorage.setItem('MSOT_LEARN_ACCOUNTS_V2', JSON.stringify(accounts));
                }

                const { data: notifs, error: nErr } = await window.supabaseClient
                    .from('admin_notifications')
                    .select('*')
                    .order('created_at', { ascending: false });

                const localNotifs = this.loadAdminNotifications();
                const notifMap = new Map();
                localNotifs.forEach(n => {
                    const k = n.id || n.userEmail || n.user_email;
                    if (k) notifMap.set(k, n);
                });

                if (notifs && !nErr && notifs.length > 0) {
                    notifs.forEach(n => {
                        const em = (n.user_email || n.userEmail || '').toLowerCase();
                        const rRole = (n.requested_role || n.requestedRole || 'STUDENT').toUpperCase();
                        const nType = n.notification_type || n.type || 'REGISTRATION_REQUEST';
                        const cAt = n.created_at || n.createdAt || new Date().toISOString();
                        notifMap.set(n.id || em, {
                            id: n.id,
                            userId: n.user_id || n.userId,
                            user_id: n.user_id || n.userId,
                            userName: n.user_name || n.userName || 'New Candidate',
                            user_name: n.user_name || n.userName || 'New Candidate',
                            userEmail: em,
                            user_email: em,
                            requestedRole: rRole,
                            requested_role: rRole,
                            type: nType,
                            notification_type: nType,
                            title: n.title || (nType === 'LOGIN_REQUEST' ? `⚠️ Login Attempt: ${n.user_name || em} awaits approval` : `New ${rRole} registration requires approval.`),
                            message: n.message || `Candidate ${em} requires administrative approval.`,
                            read: Boolean(n.read),
                            createdAt: cAt,
                            created_at: cAt
                        });
                    });
                }

                // If any profile in profiles is PENDING but has no notification yet, synthesize one
                if (profiles && profiles.length > 0) {
                    profiles.forEach(p => {
                        const em = (p.email || '').toLowerCase().trim();
                        const appStatus = (p.approval_status || '').toUpperCase();
                        if (em && appStatus === 'PENDING') {
                            const hasNotif = Array.from(notifMap.values()).some(n => (n.userEmail === em || n.user_email === em));
                            if (!hasNotif) {
                                const rRole = (p.requested_role || p.role || 'STUDENT').toUpperCase();
                                const uName = p.display_name || p.full_name || em.split('@')[0];
                                notifMap.set(`synth_${em}`, {
                                    id: `notif_prof_${em}`,
                                    userId: p.id,
                                    user_id: p.id,
                                    userName: uName,
                                    user_name: uName,
                                    userEmail: em,
                                    user_email: em,
                                    requestedRole: rRole,
                                    requested_role: rRole,
                                    type: 'REGISTRATION_REQUEST',
                                    notification_type: 'REGISTRATION_REQUEST',
                                    title: `New ${rRole} registration requires approval.`,
                                    message: `${uName} (${em}) has registered as ${rRole} and is awaiting administrative verification.`,
                                    read: false,
                                    createdAt: p.created_at || new Date().toISOString(),
                                    created_at: p.created_at || new Date().toISOString()
                                });
                            }
                        }
                    });
                }

                const merged = Array.from(notifMap.values()).sort((a,b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
                this.saveAdminNotifications(merged);

                // Update notification bell badge in HUD
                const adminBadge = document.getElementById('adminNotifBadge');
                if (adminBadge) {
                    const cnt = this.getUnreadNotificationsCount();
                    adminBadge.textContent = cnt;
                    adminBadge.style.display = cnt > 0 ? 'inline-block' : 'none';
                }

                // Live update Admin view if currently open
                if (window.msotPlatform && typeof window.msotPlatform.renderAdminRules === 'function') {
                    const adminSec = document.getElementById('adminSection');
                    if (adminSec && adminSec.classList.contains('active')) {
                        window.msotPlatform.renderAdminRules();
                    }
                }
            } catch (err) {
                console.warn("Supabase RBAC sync note:", err);
            }
        }

        loadAdminNotifications() {
            try {
                const raw = localStorage.getItem('MSOT_ADMIN_NOTIFICATIONS_V1');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) return parsed;
                }
            } catch (e) {}
            return [];
        }

        saveAdminNotifications(notifs) {
            try {
                localStorage.setItem('MSOT_ADMIN_NOTIFICATIONS_V1', JSON.stringify((notifs || []).slice(0, 200)));
                this.adminNotifications = notifs;
            } catch (e) {}
        }

        addAdminNotification(notif) {
            const list = this.loadAdminNotifications();
            const uEmail = (notif.userEmail || notif.user_email || '').toLowerCase();
            const uName = notif.userName || notif.user_name || 'New Candidate';
            const reqRole = (notif.requestedRole || notif.requested_role || 'STUDENT').toUpperCase();
            const nType = notif.type || notif.notification_type || 'REGISTRATION_REQUEST';
            const cAt = notif.createdAt || notif.created_at || new Date().toISOString();
            const nId = notif.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
            const nTitle = notif.title || (nType === 'LOGIN_REQUEST' ? `⚠️ Login Attempt: ${uName} awaits approval` : `New ${reqRole} registration requires Admin approval`);
            const nMsg = notif.message || (nType === 'LOGIN_REQUEST' ? `${uName} (${uEmail}) attempted to log in, but their ${reqRole} account is pending approval.` : `New registration requires Admin approval`);

            // Prevent duplicate unread notifications of the same type for the same email
            const existingIdx = list.findIndex(n => (n.userEmail === uEmail || n.user_email === uEmail) && !n.read && (n.type === nType || n.notification_type === nType));

            const newNotif = {
                id: nId,
                userId: notif.userId || notif.user_id || '',
                user_id: notif.userId || notif.user_id || '',
                userName: uName,
                user_name: uName,
                userEmail: uEmail,
                user_email: uEmail,
                requestedRole: reqRole,
                requested_role: reqRole,
                type: nType,
                notification_type: nType,
                title: nTitle,
                message: nMsg,
                read: false,
                createdAt: cAt,
                created_at: cAt
            };

            if (existingIdx !== -1) {
                list[existingIdx] = newNotif;
            } else {
                list.unshift(newNotif);
            }

            this.saveAdminNotifications(list);

            if (window.supabaseClient) {
                try {
                    window.supabaseClient.from('admin_notifications').insert([{
                        user_id: newNotif.userId || null,
                        user_name: newNotif.userName,
                        user_email: newNotif.userEmail,
                        requested_role: newNotif.requestedRole.toLowerCase(),
                        notification_type: newNotif.type,
                        title: newNotif.title,
                        message: newNotif.message,
                        read: false,
                        created_at: newNotif.createdAt
                    }]).then(() => {}).catch(err => console.warn("Supabase notification insert note:", err.message));
                } catch(e) {}
            }

            // Immediately update notification bell badge in HUD
            const adminBadge = document.getElementById('adminNotifBadge');
            if (adminBadge) {
                const unread = this.getUnreadNotificationsCount();
                adminBadge.textContent = unread;
                adminBadge.style.display = unread > 0 ? 'inline-block' : 'none';
            }

            // If Admin section is currently open, trigger live UI refresh
            if (window.msotPlatform && typeof window.msotPlatform.renderAdminRules === 'function') {
                const adminSec = document.getElementById('adminSection');
                if (adminSec && adminSec.classList.contains('active')) {
                    window.msotPlatform.renderAdminRules();
                }
            }

            return newNotif;
        }

        getAdminNotifications() {
            return this.loadAdminNotifications();
        }

        getUnreadNotificationsCount() {
            return this.loadAdminNotifications().filter(n => !n.read).length;
        }

        markNotificationRead(id) {
            const list = this.loadAdminNotifications();
            const target = list.find(n => n.id === id);
            if (target) {
                target.read = true;
                target.readAt = new Date().toISOString();
                this.saveAdminNotifications(list);
            }
            if (window.supabaseClient) {
                try {
                    window.supabaseClient.from('admin_notifications')
                        .update({ read: true, read_at: new Date().toISOString() })
                        .eq('id', id)
                        .then(() => {}).catch(() => {});
                } catch(e) {}
            }
            if (window.msotPlatform?.renderAdminRules) {
                window.msotPlatform.renderAdminRules();
            }
        }

        markAllNotificationsRead() {
            const list = this.loadAdminNotifications();
            list.forEach(n => { n.read = true; n.readAt = new Date().toISOString(); });
            this.saveAdminNotifications(list);
            if (window.supabaseClient) {
                try {
                    window.supabaseClient.from('admin_notifications')
                        .update({ read: true, read_at: new Date().toISOString() })
                        .eq('read', false)
                        .then(() => {}).catch(() => {});
                } catch(e) {}
            }
            if (window.msotPlatform?.renderAdminRules) {
                window.msotPlatform.renderAdminRules();
            }
        }

        getAllRegistrations() {
            const stored = localStorage.getItem('MSOT_LEARN_ACCOUNTS_V2');
            const accounts = stored ? JSON.parse(stored) : {};
            const list = Object.values(accounts);
            return list.map(acc => {
                const reqRole = (acc.requested_role || acc.requestedRole || acc.role || 'STUDENT').toUpperCase();
                const actualRole = (acc.role || reqRole || 'STUDENT').toUpperCase();
                let appStatus = (acc.approval_status || acc.approvalStatus || '').toUpperCase();
                if (!appStatus) {
                    if (acc.status === 'PENDING') appStatus = 'PENDING';
                    else if (acc.status === 'INACTIVE') appStatus = 'REJECTED';
                    else if (acc.status === 'SUSPENDED') appStatus = 'SUSPENDED';
                    else appStatus = 'APPROVED';
                }
                const regDate = acc.registeredAt || acc.registered_at || acc.created_at || new Date().toISOString();
                return {
                    id: acc.id || `acc_${acc.email}`,
                    email: acc.email,
                    name: acc.name || acc.email.split('@')[0],
                    username: acc.username || acc.alias || acc.email.split('@')[0],
                    studentId: acc.studentId || acc.student_id || '',
                    year: acc.year || '1st Year',
                    semester: acc.semester || 'Semester 1',
                    section: acc.section || 'Section Alpha',
                    branch: acc.branch || 'CSE',
                    track: acc.track || 'C++ Algorithms & DSA',
                    phone: acc.phone || '',
                    avatar: acc.avatar || (actualRole === 'FACULTY' ? '🎓' : '⚔️'),
                    requestedRole: reqRole,
                    requested_role: reqRole,
                    role: actualRole,
                    approvalStatus: appStatus,
                    approval_status: appStatus,
                    status: (acc.status || appStatus || 'ACTIVE').toUpperCase(),
                    rejectionReason: acc.rejection_reason || acc.rejectionReason || null,
                    rejection_reason: acc.rejection_reason || acc.rejectionReason || null,
                    registeredAt: regDate,
                    registered_at: regDate,
                    approvedAt: acc.approved_at || acc.approvedAt || null,
                    approved_at: acc.approved_at || acc.approvedAt || null,
                    approvedBy: acc.approved_by || acc.approvedBy || null,
                    approved_by: acc.approved_by || acc.approvedBy || null
                };
            });
        }

        getPendingApprovals() {
            return this.getAllRegistrations().filter(r => r.approvalStatus === 'PENDING' || r.approval_status === 'PENDING' || r.status === 'PENDING');
        }

        async approveRegistration(emailOrId) {
            if (!this.isAdmin()) {
                safeAlert('⚠️ Access Denied: Only Administrators can approve registrations.');
                return false;
            }
            const cleanTarget = (emailOrId || '').toLowerCase().trim();
            const stored = localStorage.getItem('MSOT_LEARN_ACCOUNTS_V2');
            const accounts = stored ? JSON.parse(stored) : {};

            let targetKey = null;
            for (const [k, v] of Object.entries(accounts)) {
                if (k.toLowerCase() === cleanTarget || (v.id && String(v.id).toLowerCase() === cleanTarget)) {
                    targetKey = k;
                    break;
                }
            }

            if (!targetKey) {
                safeAlert(`Registration record not found for [${emailOrId}].`);
                return false;
            }

            const acc = accounts[targetKey];
            const assignedRole = (acc.requested_role || acc.role || 'STUDENT').toUpperCase();

            // Permanent approval decision
            acc.approval_status = 'APPROVED';
            acc.status = 'ACTIVE';
            acc.role = assignedRole;
            acc.approved_at = new Date().toISOString();
            acc.approved_by = this.getCurrentUser()?.email || 'admin@msot.edu';
            acc.rejection_reason = null;

            localStorage.setItem('MSOT_LEARN_ACCOUNTS_V2', JSON.stringify(accounts));

            // Sync with Supabase profiles table
            if (window.supabaseClient) {
                try {
                    if (acc.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(acc.id)) {
                        await window.supabaseClient.rpc('admin_decide_registration', {
                            p_user_id: acc.id,
                            p_decision: 'approve'
                        });
                    } else {
                        await window.supabaseClient.from('profiles').update({
                            role: assignedRole.toLowerCase(),
                            status: 'active',
                            approval_status: 'approved',
                            rejection_reason: null,
                            approved_at: acc.approved_at,
                            updated_at: new Date().toISOString()
                        }).eq('email', acc.email);
                    }
                } catch(e) {
                    console.warn("Supabase approval sync note:", e.message);
                }
            }

            // Mark notifications for this candidate as read
            const notifs = this.loadAdminNotifications();
            notifs.forEach(n => {
                if (n.userEmail === acc.email.toLowerCase()) {
                    n.read = true;
                    n.readAt = new Date().toISOString();
                }
            });
            this.saveAdminNotifications(notifs);

            this.logAudit('ADMIN_APPROVE_REGISTRATION', 'user', acc.email, {
                approved_role: assignedRole,
                candidate_name: acc.name
            });

            if (window.miraiAudio) window.miraiAudio.playSuccess?.();

            if (window.msotPlatform?.renderAdminRules) {
                window.msotPlatform.renderAdminRules();
            }

            return true;
        }

        async rejectRegistration(emailOrId, reason) {
            if (!this.isAdmin()) {
                safeAlert('⚠️ Access Denied: Only Administrators can reject registrations.');
                return false;
            }
            const cleanTarget = (emailOrId || '').toLowerCase().trim();
            const stored = localStorage.getItem('MSOT_LEARN_ACCOUNTS_V2');
            const accounts = stored ? JSON.parse(stored) : {};

            let targetKey = null;
            for (const [k, v] of Object.entries(accounts)) {
                if (k.toLowerCase() === cleanTarget || (v.id && String(v.id).toLowerCase() === cleanTarget)) {
                    targetKey = k;
                    break;
                }
            }

            if (!targetKey) {
                safeAlert(`Registration record not found for [${emailOrId}].`);
                return false;
            }

            const acc = accounts[targetKey];
            const rejectReason = reason || 'Registration details or academic credentials could not be verified by Administrator';

            acc.approval_status = 'REJECTED';
            acc.status = 'INACTIVE';
            acc.rejection_reason = rejectReason;
            acc.rejected_at = new Date().toISOString();

            localStorage.setItem('MSOT_LEARN_ACCOUNTS_V2', JSON.stringify(accounts));

            // Sync with Supabase profiles table
            if (window.supabaseClient) {
                try {
                    if (acc.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(acc.id)) {
                        await window.supabaseClient.rpc('admin_decide_registration', {
                            p_user_id: acc.id,
                            p_decision: 'reject',
                            p_reason: rejectReason
                        });
                    } else {
                        await window.supabaseClient.from('profiles').update({
                            status: 'inactive',
                            approval_status: 'rejected',
                            rejection_reason: rejectReason,
                            updated_at: new Date().toISOString()
                        }).eq('email', acc.email);
                    }
                } catch(e) {
                    console.warn("Supabase rejection sync note:", e.message);
                }
            }

            // Mark notification as read
            const notifs = this.loadAdminNotifications();
            notifs.forEach(n => {
                if (n.userEmail === acc.email.toLowerCase()) {
                    n.read = true;
                    n.readAt = new Date().toISOString();
                }
            });
            this.saveAdminNotifications(notifs);

            this.logAudit('ADMIN_REJECT_REGISTRATION', 'user', acc.email, {
                reason: rejectReason,
                candidate_name: acc.name
            });

            if (window.msotPlatform?.renderAdminRules) {
                window.msotPlatform.renderAdminRules();
            }

            return true;
        }

        suspendAccount(emailOrId) {
            if (!this.isAdmin()) return false;
            const cleanTarget = (emailOrId || '').toLowerCase().trim();
            const stored = localStorage.getItem('MSOT_LEARN_ACCOUNTS_V2');
            const accounts = stored ? JSON.parse(stored) : {};

            let targetKey = null;
            for (const [k, v] of Object.entries(accounts)) {
                if (k.toLowerCase() === cleanTarget || (v.id && String(v.id).toLowerCase() === cleanTarget)) {
                    targetKey = k;
                    break;
                }
            }
            if (!targetKey) return false;

            const acc = accounts[targetKey];
            acc.status = 'SUSPENDED';
            acc.approval_status = 'SUSPENDED';
            localStorage.setItem('MSOT_LEARN_ACCOUNTS_V2', JSON.stringify(accounts));

            if (window.supabaseClient) {
                try {
                    window.supabaseClient.from('profiles').update({ status: 'suspended', approval_status: 'suspended' }).eq('email', acc.email);
                } catch(e) {}
            }

            this.logAudit('ADMIN_SUSPEND_ACCOUNT', 'user', acc.email);
            if (window.msotPlatform?.renderAdminRules) window.msotPlatform.renderAdminRules();
            return true;
        }

        restoreAccount(emailOrId) {
            if (!this.isAdmin()) return false;
            const cleanTarget = (emailOrId || '').toLowerCase().trim();
            const stored = localStorage.getItem('MSOT_LEARN_ACCOUNTS_V2');
            const accounts = stored ? JSON.parse(stored) : {};

            let targetKey = null;
            for (const [k, v] of Object.entries(accounts)) {
                if (k.toLowerCase() === cleanTarget || (v.id && String(v.id).toLowerCase() === cleanTarget)) {
                    targetKey = k;
                    break;
                }
            }
            if (!targetKey) return false;

            const acc = accounts[targetKey];
            acc.status = 'ACTIVE';
            acc.approval_status = 'APPROVED';
            acc.rejection_reason = null;
            localStorage.setItem('MSOT_LEARN_ACCOUNTS_V2', JSON.stringify(accounts));

            if (window.supabaseClient) {
                try {
                    window.supabaseClient.from('profiles').update({ status: 'active', approval_status: 'approved', rejection_reason: null }).eq('email', acc.email);
                } catch(e) {}
            }

            this.logAudit('ADMIN_RESTORE_ACCOUNT', 'user', acc.email);
            if (window.msotPlatform?.renderAdminRules) window.msotPlatform.renderAdminRules();
            return true;
        }

        // ─── Assignments Engine (Faculty & Admin) ───────────────────────────
        getAssignments(sectionOrRole = 'ALL', statusFilter = 'ALL') {
            let list = (this.assignments || []).map(a => this.normalizeAssignment(a));
            if (sectionOrRole && sectionOrRole !== 'ALL' && sectionOrRole !== 'FACULTY' && sectionOrRole !== 'ADMIN' && sectionOrRole !== 'STUDENT') {
                list = list.filter(a => a.target_section === 'ALL' || a.target_section === sectionOrRole);
            }
            if (statusFilter === 'published') {
                list = list.filter(a => (a.is_published === true || a.isPublished === true));
            } else if (statusFilter === 'draft') {
                list = list.filter(a => (a.is_published === false || a.isPublished === false));
            }

            if (this.isStudent() || sectionOrRole === 'STUDENT') {
                list = list.filter(a => (a.is_published === true || a.isPublished === true));
            }

            return list;
        }

        getAssignmentById(id) {
            const found = this.assignments.find(a => a.id === id);
            return found ? this.normalizeAssignment(found) : null;
        }

        createAssignment(data) {
            if (!this.isAdmin() && !this.isFaculty()) {
                alert('⚠️ Permission Denied: Students cannot create assignments.');
                return false;
            }
            const user = this.getCurrentUser();
            const isPub = (data.is_published !== undefined) ? !!data.is_published : (data.isPublished !== undefined ? !!data.isPublished : true);
            const maxM = parseInt(data.max_marks || data.maxMarks, 10) || 100;
            const xp = parseInt(data.xp_reward || data.xpReward, 10) || 50;
            const cName = user?.name || 'Utkarsh Raj';
            const cEmail = user?.email || 'faculty@msot.edu';

            const newAsg = {
                id: `asg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                title: data.title ? data.title.trim() : 'New Assignment',
                description: data.description ? data.description.trim() : '',
                subject: data.subject || 'C++ Systems Architecture',
                topic: data.topic || 'General Algorithms',
                deadline: data.deadline || new Date(Date.now() + 86400000 * 5).toISOString(),
                xp_reward: xp,
                xpReward: xp,
                max_marks: maxM,
                maxMarks: maxM,
                target_section: data.target_section || 'ALL',
                resource_url: data.resource_url ? data.resource_url.trim() : '',
                is_published: isPub,
                isPublished: isPub,
                status: isPub ? 'ACTIVE' : 'DRAFT',
                creator_id: user?.id || 'usr_faculty',
                creator_name: cName,
                creatorName: cName,
                creator_email: cEmail,
                creatorEmail: cEmail,
                created_at: new Date().toISOString()
            };

            const updated = [newAsg, ...this.assignments];
            this.saveAssignments(updated);
            this.logAudit('ASSIGNMENT_CREATED', 'assignment', newAsg.id, { title: newAsg.title, section: newAsg.target_section });

            if (window.miraiAudio && typeof window.miraiAudio.playSuccess === 'function') {
                window.miraiAudio.playSuccess();
            } else if (window.miraiAudio && typeof window.miraiAudio.playClick === 'function') {
                window.miraiAudio.playClick();
            }

            if (window.supabaseClient) {
                window.supabaseClient.from('assignments').insert([{
                    title: newAsg.title,
                    description: newAsg.description,
                    subject: newAsg.subject,
                    topic: newAsg.topic,
                    deadline: newAsg.deadline,
                    xp_reward: newAsg.xp_reward,
                    max_marks: newAsg.max_marks,
                    target_section: newAsg.target_section,
                    resource_url: newAsg.resource_url,
                    is_published: newAsg.is_published,
                    creator_name: newAsg.creator_name,
                    creator_email: newAsg.creator_email
                }]).then().catch(() => {});
            }

            return newAsg;
        }

        updateAssignment(id, data) {
            const index = this.assignments.findIndex(a => a.id === id);
            if (index === -1) return false;
            const existing = this.assignments[index];

            if (!this.isAdmin() && !this.isFaculty()) {
                alert('⚠️ Permission Denied: You do not have permission to edit assignments.');
                return false;
            }

            const isPub = (data.is_published !== undefined) ? !!data.is_published : (data.isPublished !== undefined ? !!data.isPublished : (existing.is_published !== undefined ? !!existing.is_published : !!existing.isPublished));
            const maxM = data.max_marks !== undefined ? parseInt(data.max_marks, 10) : (data.maxMarks !== undefined ? parseInt(data.maxMarks, 10) : (existing.max_marks || existing.maxMarks || 100));
            const xp = data.xp_reward !== undefined ? parseInt(data.xp_reward, 10) : (data.xpReward !== undefined ? parseInt(data.xpReward, 10) : (existing.xp_reward || existing.xpReward || 50));

            const updatedAsg = {
                ...existing,
                title: data.title ? data.title.trim() : existing.title,
                description: data.description !== undefined ? data.description.trim() : existing.description,
                subject: data.subject || existing.subject,
                topic: data.topic || existing.topic,
                deadline: data.deadline || existing.deadline,
                xp_reward: xp,
                xpReward: xp,
                max_marks: maxM,
                maxMarks: maxM,
                target_section: data.target_section || existing.target_section,
                resource_url: data.resource_url !== undefined ? data.resource_url.trim() : existing.resource_url,
                is_published: isPub,
                isPublished: isPub,
                status: isPub ? 'ACTIVE' : 'DRAFT',
                creator_name: existing.creator_name || existing.creatorName || 'Utkarsh Raj',
                creatorName: existing.creator_name || existing.creatorName || 'Utkarsh Raj',
                creator_email: existing.creator_email || existing.creatorEmail || 'faculty@msot.edu',
                creatorEmail: existing.creator_email || existing.creatorEmail || 'faculty@msot.edu',
                updated_at: new Date().toISOString()
            };

            this.assignments[index] = updatedAsg;
            this.saveAssignments(this.assignments);
            this.logAudit('ASSIGNMENT_UPDATED', 'assignment', id, { title: updatedAsg.title });

            if (window.miraiAudio && typeof window.miraiAudio.playSuccess === 'function') {
                window.miraiAudio.playSuccess();
            } else if (window.miraiAudio && typeof window.miraiAudio.playClick === 'function') {
                window.miraiAudio.playClick();
            }

            return updatedAsg;
        }

        deleteAssignment(id) {
            const asg = this.getAssignmentById(id);
            if (!asg) return false;
            if (!this.isAdmin() && !this.isFaculty()) {
                alert('⚠️ Permission Denied: You cannot delete this assignment.');
                return false;
            }

            if (!confirm(`Are you sure you want to delete assignment "${asg.title}"?`)) return false;

            const filtered = this.assignments.filter(a => a.id !== id);
            this.saveAssignments(filtered);
            this.logAudit('ASSIGNMENT_DELETED', 'assignment', id, { title: asg.title });

            if (window.miraiAudio && typeof window.miraiAudio.playClick === 'function') {
                window.miraiAudio.playClick();
            }

            return true;
        }

        togglePublishAssignment(id) {
            const asg = this.getAssignmentById(id);
            if (!asg) return false;
            if (!this.isAdmin() && !this.isFaculty()) {
                alert('⚠️ Permission Denied: You cannot modify publishing status for this assignment.');
                return false;
            }

            const curStatus = (asg.is_published !== undefined) ? !!asg.is_published : (asg.isPublished !== undefined ? !!asg.isPublished : false);
            const nextStatus = !curStatus;

            asg.is_published = nextStatus;
            asg.isPublished = nextStatus;
            asg.status = nextStatus ? 'ACTIVE' : 'DRAFT';
            asg.updated_at = new Date().toISOString();
            this.saveAssignments(this.assignments);
            this.logAudit('ASSIGNMENT_PUBLISH_TOGGLED', 'assignment', id, { is_published: nextStatus });

            if (window.miraiAudio && typeof window.miraiAudio.playSuccess === 'function') {
                window.miraiAudio.playSuccess();
            } else if (window.miraiAudio && typeof window.miraiAudio.playClick === 'function') {
                window.miraiAudio.playClick();
            }

            return nextStatus;
        }

        // ─── Submissions & Grading Engine ───────────────────────────────────
        getAssignmentSubmissions(assignmentId = null, studentEmail = null) {
            let list = [...this.assignmentSubmissions];
            if (assignmentId) list = list.filter(s => s.assignment_id === assignmentId);
            if (studentEmail) list = list.filter(s => s.student_email?.toLowerCase() === studentEmail.toLowerCase());
            return list;
        }

        submitAssignmentSolution(assignmentId, { content, fileUrl }) {
            const user = this.getCurrentUser();
            if (!user) {
                alert('Please sign in to submit your assignment.');
                return false;
            }

            const asg = this.getAssignmentById(assignmentId);
            if (!asg) {
                alert('Assignment not found.');
                return false;
            }

            const existingIdx = this.assignmentSubmissions.findIndex(s => s.assignment_id === assignmentId && s.student_email?.toLowerCase() === user.email.toLowerCase());

            const submission = {
                id: existingIdx >= 0 ? this.assignmentSubmissions[existingIdx].id : `sub_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                assignment_id: assignmentId,
                assignment_title: asg.title,
                student_id: user.id || `usr_${Date.now()}`,
                student_name: user.name || 'Cadet',
                student_email: user.email,
                submission_content: content.trim(),
                file_url: fileUrl ? fileUrl.trim() : '',
                status: 'SUBMITTED',
                grade_score: null,
                grade_xp: 0,
                feedback: null,
                graded_by: null,
                graded_by_name: null,
                submitted_at: new Date().toISOString(),
                graded_at: null
            };

            if (existingIdx >= 0) {
                this.assignmentSubmissions[existingIdx] = submission;
            } else {
                this.assignmentSubmissions.unshift(submission);
            }

            this.saveAssignmentSubmissions(this.assignmentSubmissions);
            this.recordUserActivity(user.email);
            this.logAudit('ASSIGNMENT_SUBMITTED', 'submission', submission.id, { assignment: asg.title });

            return submission;
        }

        gradeAssignmentSubmission(submissionId, { gradeScore, gradeXp, feedback }) {
            if (!this.isAdmin() && !this.isFaculty()) {
                alert('⚠️ Permission Denied: Only Faculty and Administrators can grade submissions.');
                return false;
            }

            const idx = this.assignmentSubmissions.findIndex(s => s.id === submissionId);
            if (idx === -1) return false;

            const user = this.getCurrentUser();
            const sub = this.assignmentSubmissions[idx];
            sub.grade_score = parseInt(gradeScore, 10) || 0;
            sub.grade_xp = parseInt(gradeXp, 10) || 0;
            sub.feedback = feedback ? feedback.trim() : 'Graded by instructor.';
            sub.status = 'GRADED';
            sub.graded_by = user?.id || 'usr_faculty';
            sub.graded_by_name = user?.name || 'Utkarsh Raj';
            sub.graded_at = new Date().toISOString();

            this.assignmentSubmissions[idx] = sub;
            this.saveAssignmentSubmissions(this.assignmentSubmissions);

            // Dispatch message to student
            this.sendMessage({
                receiver_email: sub.student_email,
                receiver_name: sub.student_name,
                subject: `Graded: ${sub.assignment_title || 'Assignment'} (Score: ${sub.grade_score}/100)`,
                content: `Your assignment submission has been reviewed by ${sub.graded_by_name}.\nScore: ${sub.grade_score}/100 (+${sub.grade_xp} XP Awarded).\nFeedback: ${sub.feedback}`,
                related_assignment_id: sub.assignment_id
            });

            this.logAudit('SUBMISSION_GRADED', 'submission', submissionId, { grade: sub.grade_score, xp: sub.grade_xp });
            return sub;
        }

        // ─── Inactivity Reasons Engine ──────────────────────────────────────
        getInactivityReasons(studentEmailFilter = null, statusFilter = 'ALL') {
            let list = [...this.inactivityReasons];
            if (studentEmailFilter) {
                list = list.filter(r => r.student_email?.toLowerCase() === studentEmailFilter.toLowerCase());
            }
            if (statusFilter !== 'ALL') {
                list = list.filter(r => r.status === statusFilter);
            }
            return list;
        }

        submitInactivityReason({ category, reason_text, date_from, date_to }) {
            const user = this.getCurrentUser();
            if (!user) {
                alert('Please sign in to submit an inactivity notice.');
                return false;
            }

            const newReason = {
                id: `inact_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                student_id: user.id || `usr_${Date.now()}`,
                student_name: user.name || 'Cadet',
                student_email: user.email,
                category: category || 'PERSONAL',
                reason_text: reason_text.trim(),
                date_from: date_from || new Date().toISOString().slice(0, 10),
                date_to: date_to || new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
                status: 'PENDING',
                faculty_response: null,
                responded_by_name: null,
                responded_by_email: null,
                responded_at: null,
                created_at: new Date().toISOString()
            };

            const updated = [newReason, ...this.inactivityReasons];
            this.saveInactivityReasons(updated);
            this.recordUserActivity(user.email);
            this.logAudit('INACTIVITY_REASON_SUBMITTED', 'inactivity_reason', newReason.id, { category: newReason.category });

            if (window.supabaseClient) {
                window.supabaseClient.from('student_inactivity_reasons').insert([{
                    student_name: newReason.student_name,
                    student_email: newReason.student_email,
                    category: newReason.category,
                    reason_text: newReason.reason_text,
                    date_from: newReason.date_from,
                    date_to: newReason.date_to,
                    status: newReason.status
                }]).then().catch(() => {});
            }

            return newReason;
        }

        respondToInactivityReason(reasonId, { response_text, status }) {
            if (!this.isAdmin() && !this.isFaculty()) {
                alert('⚠️ Permission Denied: Only Faculty and Administrators can respond to student inactivity reasons.');
                return false;
            }

            const idx = this.inactivityReasons.findIndex(r => r.id === reasonId);
            if (idx === -1) return false;

            const user = this.getCurrentUser();
            const reason = this.inactivityReasons[idx];
            reason.faculty_response = response_text.trim();
            reason.status = status || 'ACKNOWLEDGED';
            reason.responded_by_name = user?.name || 'Utkarsh Raj';
            reason.responded_by_email = user?.email || 'admin@msot.edu';
            reason.responded_at = new Date().toISOString();

            this.inactivityReasons[idx] = reason;
            this.saveInactivityReasons(this.inactivityReasons);

            // Dispatch notice to student
            this.sendMessage({
                receiver_email: reason.student_email,
                receiver_name: reason.student_name,
                subject: `Inactivity Notice Status: ${reason.status} (${reason.category})`,
                content: `Response from ${reason.responded_by_name}:\n"${reason.faculty_response}"\nYour absence dates: ${reason.date_from} to ${reason.date_to}.`,
                related_reason_id: reason.id
            });

            this.logAudit('INACTIVITY_REASON_RESPONDED', 'inactivity_reason', reasonId, { status: reason.status });
            return reason;
        }

        // ─── 2-Way Academic Communication Engine ────────────────────────────
        getMessages(userEmail = null) {
            if (!userEmail) return [...this.messages];
            const clean = userEmail.toLowerCase();
            return this.messages.filter(m => m.receiver_email?.toLowerCase() === clean || m.sender_email?.toLowerCase() === clean);
        }

        getStudentMessages(userEmail = null) {
            return this.getMessages(userEmail);
        }

        sendMessage({ receiver_email, receiver_name, subject, content, related_assignment_id, related_reason_id, in_reply_to }) {
            const sender = this.getCurrentUser() || { email: 'admin@msot.edu', name: 'Utkarsh Raj', role: 'ADMIN' };
            const cleanReceiver = receiver_email.toLowerCase();
            const receiverUser = this.getUserByEmail(cleanReceiver);

            const msg = this.normalizeMessage({
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                sender_id: sender.id || 'usr_sender',
                sender_name: sender.name || 'Academic Staff',
                sender_email: sender.email,
                sender_role: (sender.role || 'STUDENT').toUpperCase(),
                receiver_id: receiverUser?.id || 'usr_receiver',
                receiver_name: receiver_name || receiverUser?.name || cleanReceiver.split('@')[0],
                receiver_email: cleanReceiver,
                subject: subject ? subject.trim() : 'Academic Communication',
                content: content.trim(),
                body: content.trim(),
                related_assignment_id: related_assignment_id || null,
                related_reason_id: related_reason_id || null,
                in_reply_to: in_reply_to || null,
                is_read: false,
                created_at: new Date().toISOString()
            });

            const updated = [msg, ...this.messages];
            this.saveMessages(updated);
            this.logAudit('MESSAGE_SENT', 'message', msg.id, { to: msg.receiver_email, subject: msg.subject });

            if (window.supabaseClient) {
                window.supabaseClient.from('student_messages').insert([{
                    sender_name: msg.sender_name,
                    sender_email: msg.sender_email,
                    sender_role: msg.sender_role.toLowerCase(),
                    receiver_name: msg.receiver_name,
                    receiver_email: msg.receiver_email,
                    subject: msg.subject,
                    content: msg.content,
                    related_assignment_id: msg.related_assignment_id,
                    related_reason_id: msg.related_reason_id,
                    in_reply_to: msg.in_reply_to
                }]).then().catch(() => {});
            }

            return msg;
        }

        markMessageRead(messageId) {
            const msg = this.messages.find(m => m.id === messageId);
            if (msg) {
                msg.is_read = true;
                this.saveMessages(this.messages);
            }
        }

        getConversationWith(otherEmail) {
            const myEmail = (this.getCurrentUser()?.email || '').toLowerCase();
            const theirEmail = (otherEmail || '').toLowerCase();
            return this.messages.filter(m => 
                (m.sender_email?.toLowerCase() === myEmail && m.receiver_email?.toLowerCase() === theirEmail) ||
                (m.sender_email?.toLowerCase() === theirEmail && m.receiver_email?.toLowerCase() === myEmail)
            ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }

        // ─── Student & Faculty Dossier Builders ─────────────────────────────
        getStudentFullDossier(email) {
            const student = this.getUserByEmail(email);
            if (!student) return null;

            const activity = this.calculateActivity(student.lastActive);
            const reasons = this.getInactivityReasons(email);
            const submissions = this.getAssignmentSubmissions(null, email);
            const allAsgs = this.getAssignments('ALL', 'published');
            const messages = this.getConversationWith(email);

            return {
                ...student,
                activity,
                inactivityReasons: reasons,
                submissions,
                totalAssignmentsAvailable: allAsgs.length,
                completedAssignmentsCount: submissions.length,
                messages
            };
        }

        getFacultyFullDossier(email) {
            const faculty = this.getUserByEmail(email);
            if (!faculty) return null;

            const activity = this.calculateActivity(faculty.lastActive);
            const authoredQuestions = this.getQuestions('ALL', 'ALL').filter(q => q.creator_email?.toLowerCase() === email.toLowerCase());
            const authoredAssignments = this.assignments.filter(a => a.creator_email?.toLowerCase() === email.toLowerCase());
            const messages = this.getConversationWith(email);

            return {
                ...faculty,
                activity,
                authoredQuestions,
                authoredAssignments,
                messages
            };
        }

        // ─── Interactive UI Modals ──────────────────────────────────────────
        openStudentDossierModal(email) {
            const dossier = this.getStudentFullDossier(email);
            if (!dossier) {
                alert('Cadet record not found.');
                return;
            }

            const currentRole = this.getCurrentRole();
            const isAdminView = (currentRole === 'ADMIN');

            let modal = document.getElementById('msotStudentDossierModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'msotStudentDossierModal';
                modal.className = 'rbac-modal-overlay';
                document.body.appendChild(modal);
            }

            const act = dossier.activity;

            modal.innerHTML = `
                <div class="rbac-modal-card dossier-modal-card" style="max-width: 780px;">
                    <div class="rbac-modal-header">
                        <div class="rm-title-box">
                            <span class="rm-tag">${isAdminView ? 'ADMIN CONTROL // STUDENT DOSSIER' : 'FACULTY ACADEMIC MONITOR // STUDENT DOSSIER'}</span>
                            <div style="display:flex; align-items:center; gap:12px; margin-top:4px;">
                                ${window.msotPlatform?.renderDynamicAvatar 
                                    ? window.msotPlatform.renderDynamicAvatar(dossier, { size: 42 })
                                    : `<span style="font-size:28px;">${dossier.avatar || '⚔️'}</span>`
                                }
                                <div>
                                    <h3 style="margin:0;">${dossier.name}</h3>
                                    <span style="font-size:12px; color:var(--text-dim); font-family:'JetBrains Mono', monospace;">${dossier.studentId || 'MSOT-CADET'} • ${dossier.email}</span>
                                </div>
                            </div>
                        </div>
                        <button type="button" class="rm-close-btn" onclick="document.getElementById('msotStudentDossierModal').style.display='none'">✕</button>
                    </div>

                    <!-- Top Status Strip -->
                    <div class="dossier-status-strip">
                        <div class="d-chip ${act.badgeClass}">
                            <span>${act.icon}</span>
                            <strong>${act.label}</strong>
                            <span style="font-size:11px; opacity:0.85;">(${act.formatted})</span>
                        </div>
                        <div class="d-chip account-status-${dossier.status.toLowerCase()}">
                            <span>ACCOUNT:</span>
                            <strong>${dossier.status}</strong>
                        </div>
                        <div class="d-chip section-chip">
                            <span>SECTION:</span>
                            <strong>${dossier.section}</strong>
                        </div>
                        <div class="d-chip league-chip">
                            <span>TIER:</span>
                            <strong>${dossier.leagueTier || 'Diamond League'}</strong>
                        </div>
                    </div>

                    <!-- 3-Column Metrics Deck -->
                    <div class="rbac-kpi-grid mt-14" style="grid-template-columns: repeat(4, 1fr);">
                        <div class="rbac-kpi-card">
                            <span class="rk-icon">⚡</span>
                            <div>
                                <div class="rk-num text-purple">${(dossier.xp || 0).toLocaleString()}</div>
                                <div class="rk-lbl">Total XP</div>
                            </div>
                        </div>
                        <div class="rbac-kpi-card">
                            <span class="rk-icon">🔥</span>
                            <div>
                                <div class="rk-num text-gold">${dossier.streak || 0}d</div>
                                <div class="rk-lbl">Active Streak</div>
                            </div>
                        </div>
                        <div class="rbac-kpi-card">
                            <span class="rk-icon">⚔️</span>
                            <div>
                                <div class="rk-num text-cyan">${dossier.questionsSolved || 0}</div>
                                <div class="rk-lbl">Solved Trials</div>
                            </div>
                        </div>
                        <div class="rbac-kpi-card">
                            <span class="rk-icon">💻</span>
                            <div>
                                <div class="rk-num text-green">${dossier.completedAssignmentsCount}/${dossier.totalAssignmentsAvailable}</div>
                                <div class="rk-lbl">Assignments</div>
                            </div>
                        </div>
                    </div>

                    <!-- Academic & Platform Record Details -->
                    <div class="dossier-details-grid mt-16">
                        <div class="d-detail-box">
                            <h4>🎓 Academic Enrolment</h4>
                            <div class="d-row"><span>Branch:</span><strong>${dossier.branch}</strong></div>
                            <div class="d-row"><span>Year & Semester:</span><strong>${dossier.year} • ${dossier.semester}</strong></div>
                            <div class="d-row"><span>Specialization Track:</span><strong>${dossier.track}</strong></div>
                            <div class="d-row"><span>Registered Date:</span><strong>${new Date(dossier.registeredAt).toLocaleDateString()}</strong></div>
                        </div>

                        <div class="d-detail-box">
                            <h4>⚔️ League & Clan Dynamics</h4>
                            <div class="d-row"><span>Cohort League:</span><strong>${dossier.leagueTier} (Rank #${dossier.leagueRank})</strong></div>
                            <div class="d-row"><span>Guild Alliance:</span><strong>${dossier.guildName} (${dossier.guildRole})</strong></div>
                            <div class="d-row"><span>Inter-Section Battle:</span><strong>${dossier.battleClashShare}</strong></div>
                            <div class="d-row"><span>Last Active Record:</span><strong>${act.dateFormatted}</strong></div>
                        </div>
                    </div>

                    <!-- Assignments Progress Table -->
                    <div class="mt-16">
                        <h4 style="margin: 0 0 8px; font-size: 13px; font-family:'JetBrains Mono', monospace; color:#38bdf8;">📝 ASSIGNMENTS & ACADEMIC SUBMISSIONS</h4>
                        <div class="rbac-table-wrap" style="max-height: 180px;">
                            <table class="rbac-data-table">
                                <thead>
                                    <tr>
                                        <th>ASSIGNMENT TITLE</th>
                                        <th>STATUS</th>
                                        <th>SCORE / XP</th>
                                        <th>FEEDBACK</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${dossier.submissions.length === 0 ? `
                                        <tr><td colspan="4" style="text-align:center; color:var(--text-dim); padding:16px;">No assignment submissions recorded yet.</td></tr>
                                    ` : dossier.submissions.map(s => `
                                        <tr>
                                            <td><strong>${s.assignment_title || 'Assignment'}</strong></td>
                                            <td><span class="badge-status ${s.status === 'GRADED' ? 'active' : 'pending'}">${s.status}</span></td>
                                            <td>${s.status === 'GRADED' ? `${s.grade_score}/100 (+${s.grade_xp} XP)` : 'Pending review'}</td>
                                            <td style="font-size:11.5px; color:#cbd5e1;">${s.feedback || 'Awaiting feedback'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Inactivity Reasons & Leave History -->
                    <div class="mt-16">
                        <h4 style="margin: 0 0 8px; font-size: 13px; font-family:'JetBrains Mono', monospace; color:#f59e0b;">📋 SUBMITTED INACTIVITY REASONS & NOTICES</h4>
                        ${dossier.inactivityReasons.length === 0 ? `
                            <div class="empty-reasons-card">No inactivity reasons or leave notices filed by this cadet.</div>
                        ` : dossier.inactivityReasons.map(r => `
                            <div class="inactivity-reason-item">
                                <div class="iri-head">
                                    <span class="iri-category">${r.category}</span>
                                    <span class="badge-status ${r.status === 'ACKNOWLEDGED' || r.status === 'EXCUSED' ? 'active' : 'pending'}">${r.status}</span>
                                    <span class="iri-dates">From: ${r.date_from} To: ${r.date_to}</span>
                                </div>
                                <p class="iri-text">"${r.reason_text}"</p>
                                ${r.faculty_response ? `
                                    <div class="iri-response">
                                        <strong>Response from ${r.responded_by_name}:</strong>
                                        <p>"${r.faculty_response}"</p>
                                    </div>
                                ` : `
                                    <div style="margin-top:6px;">
                                        <button class="btn-action-sm highlight" onclick="window.msotRBAC.openRespondInactivityModal('${r.id}')">✍️ RESPOND TO THIS REASON</button>
                                    </div>
                                `}
                            </div>
                        `).join('')}
                    </div>

                    <!-- Actions & Communication Footer -->
                    <div class="rm-actions mt-18" style="justify-content: space-between;">
                        <div>
                            ${isAdminView ? `
                                <button type="button" class="btn-action-sm ${dossier.status === 'ACTIVE' ? 'danger' : 'success'}" onclick="window.msotRBAC.toggleUserStatus('${dossier.email}'); window.msotRBAC.openStudentDossierModal('${dossier.email}');">
                                    ${dossier.status === 'ACTIVE' ? '🚫 DEACTIVATE ACCOUNT' : '✅ ACTIVATE ACCOUNT'}
                                </button>
                            ` : ''}
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button type="button" class="secondary-btn" onclick="document.getElementById('msotStudentDossierModal').style.display='none'">CLOSE</button>
                            <button type="button" class="primary-btn" onclick="window.msotRBAC.openMessageModal('${dossier.email}', 'Academic Guidance')">💬 MESSAGE CADET ➔</button>
                        </div>
                    </div>
                </div>
            `;

            modal.style.display = 'flex';
        }

        closeStudentFlashCardModal() {
            const modal = document.getElementById('msotStudentFlashModal');
            if (modal) {
                modal.classList.remove('active');
                modal.style.setProperty('display', 'none', 'important');
                modal.style.setProperty('pointer-events', 'none', 'important');
                modal.style.setProperty('visibility', 'hidden', 'important');
            }
            if (window.miraiAudio && typeof window.miraiAudio.playClick === 'function') {
                window.miraiAudio.playClick();
            }
        }

        openStudentFlashCardModal(email) {
            const user = this.getUserByEmail(email);
            if (!user) {
                alert('Cadet record not found.');
                return;
            }

            const allStudents = (this.getStudentUsers && this.getStudentUsers().length > 0) ? this.getStudentUsers() : [user];
            const currentIndex = allStudents.findIndex(s => (s.email || '').toLowerCase() === (user.email || '').toLowerCase());
            const prevCadet = currentIndex > 0 ? allStudents[currentIndex - 1] : allStudents[allStudents.length - 1];
            const nextCadet = (currentIndex >= 0 && currentIndex < allStudents.length - 1) ? allStudents[currentIndex + 1] : allStudents[0];

            const act = this.calculateActivity(user.lastActive);
            const stats = user.stats || { force: 85, agility: 80, endurance: user.attendanceNum || 90, intelligence: 88 };
            const attendancePct = user.attendanceNum || parseInt(user.attendance) || 92;

            let modal = document.getElementById('msotStudentFlashModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'msotStudentFlashModal';
                modal.className = 'cadet-flash-modal-overlay active';
                document.body.appendChild(modal);
            }

            modal.onclick = (e) => {
                if (e.target === modal) this.closeStudentFlashCardModal();
            };

            modal.innerHTML = `
                <div class="cadet-flash-modal-box">
                    <button type="button" class="cadet-flash-modal-close" onclick="window.msotRBAC ? window.msotRBAC.closeStudentFlashCardModal() : (document.getElementById('msotStudentFlashModal').style.display='none')" title="Close">✕</button>
                    
                    <div class="cadet-flash-card">
                        <!-- Left Column: Portrait & Ornate Gold Banner -->
                        <div class="flash-portrait-col">
                            <div class="flash-portrait-frame ${window.msotPlatform?.resolveStudentAvatarAndFrame(user).frameClass || ''}">
                                ${window.msotPlatform && window.msotPlatform.resolveStudentAvatarAndFrame(user).isImage
                                    ? `<img src="${window.msotPlatform.resolveStudentAvatarAndFrame(user).photo}" alt="${user.name}" class="flash-portrait-img" onerror="this.src='assets/images/cadets/cadet_aarav.jpg'">`
                                    : (window.msotPlatform
                                        ? `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:56px;background:rgba(255,255,255,0.05);">${window.msotPlatform.resolveStudentAvatarAndFrame(user).photo}</div>`
                                        : `<img src="${user.customPhotoUrl || user.profilePic || user.profile_pic || 'assets/images/cadets/cadet_aarav.jpg'}" alt="${user.name}" class="flash-portrait-img" onerror="this.src='assets/images/cadets/cadet_aarav.jpg'">`
                                    )
                                }
                            </div>
                            <div class="ornate-gold-nameplate">
                                <span class="ornate-callsign-text">${user.callsign || user.name.split(' ')[0]}</span>
                            </div>
                            <div style="font-size:11px; color:#94a3b8; font-family:var(--font-mono, monospace); text-align:center;">
                                <code>${user.studentId || 'MSOT-CADET'}</code>
                            </div>
                        </div>

                        <!-- Right Column: Profile Details, Stats & Meters -->
                        <div class="flash-details-col">
                            <div class="flash-header-row">
                                <div>
                                    <h2 class="flash-cadet-name">${user.name}</h2>
                                    <div class="flash-cadet-meta">
                                        <span class="flash-cadet-username">@${user.username || 'cadet'}</span>
                                        <span>•</span>
                                        <span>${user.branch || 'CSE'}</span>
                                        <span>•</span>
                                        <span class="status-badge ${act.badgeClass}" style="font-size:10px; padding:2px 8px;">${act.label}</span>
                                    </div>
                                </div>
                                <div class="flash-nav-arrows">
                                    <button type="button" class="flash-arrow-btn" onclick="window.msotRBAC.openStudentFlashCardModal('${prevCadet.email}')" title="Previous Cadet">‹</button>
                                    <button type="button" class="flash-arrow-btn" onclick="window.msotRBAC.openStudentFlashCardModal('${nextCadet.email}')" title="Next Cadet">›</button>
                                </div>
                            </div>

                            <!-- 4 Key Academic Stat Meters (Requested by User) -->
                            <div class="flash-meters-grid">
                                <!-- 1. ATTENDANCE -->
                                <div class="flash-stat-item">
                                    <div class="stat-item-top">
                                        <span class="stat-label-title">📊 ATTENDANCE</span>
                                        <span class="stat-value-badge">${user.attendance || attendancePct + '%'}</span>
                                    </div>
                                    <div class="carved-meter-bar">
                                        <div class="carved-meter-fill" style="width: ${attendancePct}%;"></div>
                                    </div>
                                    <div class="stat-subtext-detail">${user.attendancePresent || 38}/${user.attendanceTotal || 40} Sessions Attended (${attendancePct >= 85 ? '🟢 Exemplary' : attendancePct >= 75 ? '🟡 Standard' : '🔴 At Risk'})</div>
                                </div>

                                <!-- 2. SECTION -->
                                <div class="flash-stat-item">
                                    <div class="stat-item-top">
                                        <span class="stat-label-title">🏷️ SECTION</span>
                                        <span class="stat-value-badge" style="color:#a855f7;">${user.section || 'Section Alpha'}</span>
                                    </div>
                                    <div class="carved-meter-bar">
                                        <div class="carved-meter-fill emerald" style="width: 100%;"></div>
                                    </div>
                                    <div class="stat-subtext-detail">${user.track || 'C++ Algorithms & Systems Architecture'}</div>
                                </div>

                                <!-- 3. SEMESTER -->
                                <div class="flash-stat-item">
                                    <div class="stat-item-top">
                                        <span class="stat-label-title">🎓 SEMESTER</span>
                                        <span class="stat-value-badge" style="color:#38bdf8;">${user.semester || 'Semester 4'}</span>
                                    </div>
                                    <div class="carved-meter-bar">
                                        <div class="carved-meter-fill cyan" style="width: 65%;"></div>
                                    </div>
                                    <div class="stat-subtext-detail">Undergraduate Engineering Curriculum</div>
                                </div>

                                <!-- 4. ACADEMIC YEAR -->
                                <div class="flash-stat-item">
                                    <div class="stat-item-top">
                                        <span class="stat-label-title">📅 ACADEMIC YEAR</span>
                                        <span class="stat-value-badge">${user.academicYear || '2026–2027'}</span>
                                    </div>
                                    <div class="carved-meter-bar">
                                        <div class="carved-meter-fill" style="width: 50%;"></div>
                                    </div>
                                    <div class="stat-subtext-detail">${user.year || '2nd Year'} Cohort • Active Term</div>
                                </div>
                            </div>

                            <!-- Academic Narrative / Remarks (Witcher Lore Box) -->
                            <div class="flash-narrative-box">
                                "${user.academicRemarks || 'Active cadet enrolled in Mirai School of Technology. Demonstrates high engagement in algorithmic problem solving and compiler verification.'}"
                            </div>

                            <!-- Action Toolbar -->
                            <div class="flash-actions-bar">
                                <div class="flash-actions-left">
                                    <button type="button" class="flash-btn-primary" onclick="(window.msotRBAC ? window.msotRBAC.closeStudentFlashCardModal() : (document.getElementById('msotStudentFlashModal').style.display='none')); window.msotRBAC.openMessageModal('${user.email}', 'Academic Feedback');">
                                        💬 MESSAGE CADET
                                    </button>
                                    <button type="button" class="flash-btn-secondary" onclick="(window.msotRBAC ? window.msotRBAC.closeStudentFlashCardModal() : (document.getElementById('msotStudentFlashModal').style.display='none')); window.msotRBAC.openStudentDossierModal('${user.email}');">
                                        👤 FULL DOSSIER
                                    </button>
                                </div>
                                <div style="font-family:var(--font-mono, monospace); font-size:11.5px; color:#94a3b8;">
                                    🏆 <strong style="color:#ffd700;">${(user.xp || 1400).toLocaleString()} XP</strong> • ${user.leagueTier || 'Diamond League'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            modal.classList.add('active');
            modal.style.setProperty('display', 'flex', 'important');
            modal.style.setProperty('pointer-events', 'auto', 'important');
            modal.style.setProperty('visibility', 'visible', 'important');
            if (window.miraiAudio && typeof window.miraiAudio.playClick === 'function') {
                window.miraiAudio.playClick();
            }
        }

        openFacultyDossierModal(email) {
            const dossier = this.getFacultyFullDossier(email);
            if (!dossier) {
                alert('Faculty record not found.');
                return;
            }

            let modal = document.getElementById('msotFacultyDossierModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'msotFacultyDossierModal';
                modal.className = 'rbac-modal-overlay';
                document.body.appendChild(modal);
            }

            const act = dossier.activity;

            modal.innerHTML = `
                <div class="rbac-modal-card dossier-modal-card" style="max-width: 740px;">
                    <div class="rbac-modal-header">
                        <div class="rm-title-box">
                            <span class="rm-tag">ADMIN GOVERNANCE // FACULTY PROFILE</span>
                            <div style="display:flex; align-items:center; gap:12px; margin-top:4px;">
                                <span style="font-size:28px;">${dossier.avatar || '🎓'}</span>
                                <div>
                                    <h3 style="margin:0;">${dossier.name}</h3>
                                    <span style="font-size:12px; color:var(--text-dim); font-family:'JetBrains Mono', monospace;">${dossier.studentId || 'FAC-MSOT'} • ${dossier.email}</span>
                                </div>
                            </div>
                        </div>
                        <button type="button" class="rm-close-btn" onclick="document.getElementById('msotFacultyDossierModal').style.display='none'">✕</button>
                    </div>

                    <!-- Top Status Strip -->
                    <div class="dossier-status-strip">
                        <div class="d-chip ${act.badgeClass}">
                            <span>${act.icon}</span>
                            <strong>${act.label}</strong>
                            <span style="font-size:11px; opacity:0.85;">(${act.formatted})</span>
                        </div>
                        <div class="d-chip account-status-${dossier.status.toLowerCase()}">
                            <span>STATUS:</span>
                            <strong>${dossier.status}</strong>
                        </div>
                        <div class="d-chip section-chip">
                            <span>ASSIGNMENT:</span>
                            <strong>${dossier.branch}</strong>
                        </div>
                    </div>

                    <!-- Metrics Grid -->
                    <div class="rbac-kpi-grid mt-14">
                        <div class="rbac-kpi-card">
                            <span class="rk-icon">📝</span>
                            <div>
                                <div class="rk-num text-purple">${dossier.authoredAssignments.length}</div>
                                <div class="rk-lbl">Authored Assignments</div>
                            </div>
                        </div>
                        <div class="rbac-kpi-card">
                            <span class="rk-icon">❓</span>
                            <div>
                                <div class="rk-num text-cyan">${dossier.authoredQuestions.length}</div>
                                <div class="rk-lbl">Trial Questions</div>
                            </div>
                        </div>
                        <div class="rbac-kpi-card">
                            <span class="rk-icon">💬</span>
                            <div>
                                <div class="rk-num text-green">${dossier.messages.length}</div>
                                <div class="rk-lbl">Interactions Logged</div>
                            </div>
                        </div>
                    </div>

                    <!-- Published Assignments List -->
                    <div class="mt-16">
                        <h4 style="margin: 0 0 8px; font-size: 13px; font-family:'JetBrains Mono', monospace; color:#38bdf8;">📚 FACULTY ASSIGNMENTS & LABS</h4>
                        <div class="rbac-table-wrap">
                            <table class="rbac-data-table">
                                <thead>
                                    <tr>
                                        <th>TITLE</th>
                                        <th>TOPIC</th>
                                        <th>DEADLINE</th>
                                        <th>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${dossier.authoredAssignments.length === 0 ? `
                                        <tr><td colspan="4" style="text-align:center; padding:16px;">No assignments created yet.</td></tr>
                                    ` : dossier.authoredAssignments.map(a => `
                                        <tr>
                                            <td><strong>${a.title}</strong></td>
                                            <td>${a.topic}</td>
                                            <td>${new Date(a.deadline).toLocaleDateString()}</td>
                                            <td><span class="badge-status ${a.is_published ? 'active' : 'pending'}">${a.is_published ? 'PUBLISHED' : 'DRAFT'}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Footer Actions -->
                    <div class="rm-actions mt-18" style="justify-content: space-between;">
                        <div>
                            <button type="button" class="btn-action-sm ${dossier.status === 'ACTIVE' ? 'danger' : 'success'}" onclick="window.msotRBAC.toggleUserStatus('${dossier.email}'); window.msotRBAC.openFacultyDossierModal('${dossier.email}');">
                                ${dossier.status === 'ACTIVE' ? '🚫 DEACTIVATE FACULTY ACCOUNT' : '✅ ACTIVATE FACULTY ACCOUNT'}
                            </button>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button type="button" class="secondary-btn" onclick="document.getElementById('msotFacultyDossierModal').style.display='none'">CLOSE</button>
                            <button type="button" class="primary-btn" onclick="window.msotRBAC.openMessageModal('${dossier.email}', 'Administrative Communication')">✉️ MESSAGE FACULTY ➔</button>
                        </div>
                    </div>
                </div>
            `;

            modal.style.display = 'flex';
        }

        // ─── Assignment Authoring Modal ─────────────────────────────────────
        openAssignmentModal(assignmentId = null) {
            if (!assignmentId && typeof window.openCreateAssignmentModal === 'function') {
                window.openCreateAssignmentModal();
                return;
            }
            const isEdit = !!assignmentId;
            const asg = isEdit ? this.getAssignmentById(assignmentId) : {
                title: '',
                description: '',
                subject: 'C++ Systems Architecture',
                topic: 'Pointers & Dynamic Memory',
                deadline: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 16),
                xp_reward: 50,
                max_marks: 100,
                target_section: 'ALL',
                resource_url: '',
                is_published: true,
                isPublished: true
            };

            let modal = document.getElementById('msotAssignmentModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'msotAssignmentModal';
                document.body.appendChild(modal);
            }

            modal.className = 'rbac-modal-overlay active';
            modal.classList.add('active');
            modal.style.display = 'flex';

            const isPub = asg ? ((asg.is_published !== undefined) ? !!asg.is_published : (asg.isPublished !== undefined ? !!asg.isPublished : true)) : true;
            const maxMarks = asg ? (asg.max_marks || asg.maxMarks || 100) : 100;
            const xpReward = asg ? (asg.xp_reward || asg.xpReward || 50) : 50;
            const deadlineVal = asg && asg.deadline ? asg.deadline.slice(0, 16) : '';

            modal.innerHTML = `
                <div class="rbac-modal-card" style="max-width: 620px;">
                    <div class="rbac-modal-header">
                        <div class="rm-title-box">
                            <span class="rm-tag">FACULTY CURRICULUM // ASSIGNMENT AUTHORING</span>
                            <h3>${isEdit ? 'Edit Assignment' : 'Publish New Academic Assignment'}</h3>
                        </div>
                        <button type="button" class="rm-close-btn" onclick="window.msotRBAC.closeAssignmentModal()">✕</button>
                    </div>

                    <form class="rbac-form" onsubmit="window.msotRBAC.handleAssignmentFormSubmit(event, '${assignmentId || ''}')">
                        <div class="form-group">
                            <label class="auth-label">ASSIGNMENT TITLE</label>
                            <input id="asgTitle" type="text" value="${asg && asg.title ? asg.title.replace(/"/g, '&quot;') : ''}" placeholder="e.g. Dynamic Heap Allocation Vector Implementation" required class="opt-input" style="width:100%;">
                        </div>

                        <div class="form-row-2">
                            <div class="form-group">
                                <label class="auth-label">SUBJECT</label>
                                <input id="asgSubject" type="text" value="${asg && asg.subject ? asg.subject.replace(/"/g, '&quot;') : ''}" placeholder="e.g. C++ DSA" required class="opt-input" style="width:100%;">
                            </div>
                            <div class="form-group">
                                <label class="auth-label">SPECIFIC TOPIC</label>
                                <input id="asgTopic" type="text" value="${asg && asg.topic ? asg.topic.replace(/"/g, '&quot;') : ''}" placeholder="e.g. Pointers & Free Store" required class="opt-input" style="width:100%;">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="auth-label">DESCRIPTION & INSTRUCTIONS</label>
                            <textarea id="asgDesc" rows="4" class="rbac-textarea" placeholder="Detail the problem requirements, expected algorithm, and deliverables..." required>${asg && asg.description ? asg.description : ''}</textarea>
                        </div>

                        <div class="form-row-2">
                            <div class="form-group">
                                <label class="auth-label">SUBMISSION DEADLINE</label>
                                <input id="asgDeadline" type="datetime-local" value="${deadlineVal}" required class="opt-input" style="width:100%;">
                            </div>
                            <div class="form-group">
                                <label class="auth-label">TARGET SECTION</label>
                                <select id="asgSection" class="opt-input" style="width:100%;">
                                    <option value="ALL" ${!asg || asg.target_section === 'ALL' ? 'selected' : ''}>All Sections (Alpha & Beta)</option>
                                    <option value="Section Alpha" ${asg && (asg.target_section === 'Section Alpha' || asg.targetSection === 'Section Alpha') ? 'selected' : ''}>Section Alpha Only</option>
                                    <option value="Section Beta" ${asg && (asg.target_section === 'Section Beta' || asg.targetSection === 'Section Beta') ? 'selected' : ''}>Section Beta Only</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row-2">
                            <div class="form-group">
                                <label class="auth-label">MAXIMUM MARKS</label>
                                <input id="asgMarks" type="number" value="${maxMarks}" min="10" max="100" class="opt-input" style="width:100%;">
                            </div>
                            <div class="form-group">
                                <label class="auth-label">XP REWARD (GAMIFICATION)</label>
                                <input id="asgXP" type="number" value="${xpReward}" min="10" max="250" class="opt-input" style="width:100%;">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="auth-label">REFERENCE / RESOURCE URL</label>
                            <input id="asgResource" type="url" value="${asg && (asg.resource_url || asg.resourceUrl) ? (asg.resource_url || asg.resourceUrl) : ''}" placeholder="e.g. https://en.cppreference.com/..." class="opt-input" style="width:100%;">
                        </div>

                        <div class="form-group" style="display:flex; align-items:center; gap:10px; margin-top:4px;">
                            <input id="asgPublished" type="checkbox" ${isPub ? 'checked' : ''} style="width:18px; height:18px;">
                            <label for="asgPublished" style="font-size:13px; font-weight:700; color:#fff; cursor:pointer;">Publish Immediately (Visible to Students)</label>
                        </div>

                        <div class="rm-actions">
                            <button type="button" class="secondary-btn" onclick="window.msotRBAC.closeAssignmentModal()">CANCEL</button>
                            <button type="submit" class="primary-btn">${isEdit ? 'SAVE CHANGES' : 'PUBLISH ASSIGNMENT ➔'}</button>
                        </div>
                    </form>
                </div>
            `;

            if (window.miraiAudio && typeof window.miraiAudio.playClick === 'function') {
                window.miraiAudio.playClick();
            }
        }

        closeAssignmentModal() {
            const modal = document.getElementById('msotAssignmentModal');
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
            if (window.miraiAudio && typeof window.miraiAudio.playClick === 'function') {
                window.miraiAudio.playClick();
            }
        }

        handleAssignmentFormSubmit(e, id) {
            if (e && e.preventDefault) e.preventDefault();
            const titleEl = document.getElementById('asgTitle');
            const subjectEl = document.getElementById('asgSubject');
            const topicEl = document.getElementById('asgTopic');
            const descEl = document.getElementById('asgDesc');
            const deadlineEl = document.getElementById('asgDeadline');
            const sectionEl = document.getElementById('asgSection');
            const marksEl = document.getElementById('asgMarks');
            const xpEl = document.getElementById('asgXP');
            const resourceEl = document.getElementById('asgResource');
            const publishedEl = document.getElementById('asgPublished');

            const isPub = publishedEl ? !!publishedEl.checked : true;
            const maxM = parseInt(marksEl?.value, 10) || 100;
            const xp = parseInt(xpEl?.value, 10) || 50;

            const data = {
                title: titleEl?.value || 'New Assignment',
                subject: subjectEl?.value || 'C++ Systems Architecture',
                topic: topicEl?.value || 'General Algorithms',
                description: descEl?.value || '',
                deadline: deadlineEl?.value ? new Date(deadlineEl.value).toISOString() : new Date().toISOString(),
                target_section: sectionEl?.value || 'ALL',
                max_marks: maxM,
                maxMarks: maxM,
                xp_reward: xp,
                xpReward: xp,
                resource_url: resourceEl?.value || '',
                is_published: isPub,
                isPublished: isPub
            };

            if (id) {
                this.updateAssignment(id, data);
                if (typeof window.showToast === 'function') {
                    window.showToast('✅ Assignment updated successfully!');
                }
            } else {
                this.createAssignment(data);
                if (typeof window.showToast === 'function') {
                    window.showToast('🚀 Assignment created successfully!');
                }
            }

            this.closeAssignmentModal();

            if (window.msotPlatform) {
                window.msotPlatform.renderFacultyDashboard?.();
                window.msotPlatform.renderAdminRules?.();
                window.msotPlatform.renderAssignments?.();
            }
        }

        // ─── Student Submit Assignment Modal ────────────────────────────────
        openSubmitAssignmentModal(assignmentId) {
            const asg = this.getAssignmentById(assignmentId);
            if (!asg) {
                alert('Assignment not found.');
                return;
            }

            const user = this.getCurrentUser();
            const existingSub = user ? this.assignmentSubmissions.find(s => s.assignment_id === assignmentId && s.student_email?.toLowerCase() === user.email.toLowerCase()) : null;

            let modal = document.getElementById('msotSubmitAssignmentModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'msotSubmitAssignmentModal';
                modal.className = 'rbac-modal-overlay';
                document.body.appendChild(modal);
            }

            modal.innerHTML = `
                <div class="rbac-modal-card" style="max-width: 600px;">
                    <div class="rbac-modal-header">
                        <div class="rm-title-box">
                            <span class="rm-tag">STUDENT PORTAL // ACADEMIC SUBMISSION</span>
                            <h3>Submit Assignment Solution</h3>
                        </div>
                        <button type="button" class="rm-close-btn" onclick="document.getElementById('msotSubmitAssignmentModal').style.display='none'">✕</button>
                    </div>

                    <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px 16px; margin-bottom:14px;">
                        <h4 style="margin:0 0 4px; font-size:15px; color:#fff;">${asg.title}</h4>
                        <div style="font-size:12px; color:#38bdf8; font-family:'JetBrains Mono', monospace;">
                            Subject: ${asg.subject} • Topic: ${asg.topic} • Reward: +${asg.xp_reward} XP
                        </div>
                        <p style="font-size:12.5px; color:var(--text-secondary); margin:8px 0 0;">${asg.description}</p>
                    </div>

                    <form class="rbac-form" onsubmit="window.msotRBAC.handleSubmitAssignmentFormSubmit(event, '${assignmentId}')">
                        <div class="form-group">
                            <label class="auth-label">SOLUTION CODE / WRITTEN EXPLANATION</label>
                            <textarea id="subContent" rows="6" class="rbac-textarea" placeholder="Paste your C++ code, algorithm explanation, or solution approach here..." required>${existingSub ? existingSub.submission_content : ''}</textarea>
                        </div>

                        <div class="form-group">
                            <label class="auth-label">REPOSITORY / GITHUB / RESOURCE LINK (OPTIONAL)</label>
                            <input id="subFileUrl" type="url" value="${existingSub ? (existingSub.file_url || '') : ''}" placeholder="e.g. https://github.com/myusername/solution.cpp" class="opt-input" style="width:100%;">
                        </div>

                        <div class="rm-actions">
                            <button type="button" class="secondary-btn" onclick="document.getElementById('msotSubmitAssignmentModal').style.display='none'">CANCEL</button>
                            <button type="submit" class="primary-btn">${existingSub ? 'UPDATE SUBMISSION ➔' : 'SUBMIT ASSIGNMENT ➔'}</button>
                        </div>
                    </form>
                </div>
            `;

            modal.style.display = 'flex';
        }

        handleSubmitAssignmentFormSubmit(e, assignmentId) {
            e.preventDefault();
            const content = document.getElementById('subContent').value;
            const fileUrl = document.getElementById('subFileUrl').value;

            const res = this.submitAssignmentSolution(assignmentId, { content, fileUrl });
            if (res) {
                alert('Assignment submitted successfully! Your instructor will review and grade your solution.');
                document.getElementById('msotSubmitAssignmentModal').style.display = 'none';
                if (window.msotPlatform) {
                    window.msotPlatform.renderAssignments?.();
                    window.msotPlatform.renderFacultyDashboard?.();
                }
            }
        }

        // ─── Grade Submission Modal (Faculty & Admin) ───────────────────────
        openGradeSubmissionModal(submissionId) {
            const sub = this.assignmentSubmissions.find(s => s.id === submissionId);
            if (!sub) {
                alert('Submission record not found.');
                return;
            }

            const asg = this.getAssignmentById(sub.assignment_id);

            let modal = document.getElementById('msotGradeSubmissionModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'msotGradeSubmissionModal';
                modal.className = 'rbac-modal-overlay';
                document.body.appendChild(modal);
            }

            modal.innerHTML = `
                <div class="rbac-modal-card" style="max-width: 640px;">
                    <div class="rbac-modal-header">
                        <div class="rm-title-box">
                            <span class="rm-tag">FACULTY INSTRUCTION // SUBMISSION REVIEW</span>
                            <h3>Grade Cadet Submission</h3>
                        </div>
                        <button type="button" class="rm-close-btn" onclick="document.getElementById('msotGradeSubmissionModal').style.display='none'">✕</button>
                    </div>

                    <div style="background:rgba(255,255,255,0.04); border-radius:10px; padding:12px; margin-bottom:14px; font-size:12.5px;">
                        <div><strong>Cadet:</strong> ${sub.student_name} (${sub.student_email})</div>
                        <div><strong>Assignment:</strong> ${sub.assignment_title || asg?.title}</div>
                        <div><strong>Submitted At:</strong> ${new Date(sub.submitted_at).toLocaleString()}</div>
                        ${sub.file_url ? `<div><strong>Resource:</strong> <a href="${sub.file_url}" target="_blank" style="color:#00f0ff;">${sub.file_url}</a></div>` : ''}
                    </div>

                    <div style="margin-bottom:14px;">
                        <label class="auth-label">SUBMITTED CONTENT:</label>
                        <pre style="background:#0a0910; border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:12px; color:#e2e8f0; font-family:'JetBrains Mono', monospace; font-size:12px; max-height:180px; overflow-y:auto; white-space:pre-wrap;">${sub.submission_content}</pre>
                    </div>

                    <form class="rbac-form" onsubmit="window.msotRBAC.handleGradeSubmissionSubmit(event, '${submissionId}')">
                        <div class="form-row-2">
                            <div class="form-group">
                                <label class="auth-label">GRADE SCORE (0 - 100)</label>
                                <input id="gradeScore" type="number" min="0" max="100" value="${sub.grade_score !== null ? sub.grade_score : 90}" required class="opt-input" style="width:100%;">
                            </div>
                            <div class="form-group">
                                <label class="auth-label">XP REWARD (GAMIFICATION)</label>
                                <input id="gradeXP" type="number" min="0" max="200" value="${sub.grade_xp ? sub.grade_xp : (asg?.xp_reward || 50)}" required class="opt-input" style="width:100%;">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="auth-label">FACULTY FEEDBACK & REMARKS</label>
                            <textarea id="gradeFeedback" rows="3" class="rbac-textarea" placeholder="Provide constructive remarks, code suggestions, and feedback..." required>${sub.feedback || 'Great solution approach!'}</textarea>
                        </div>

                        <div class="rm-actions">
                            <button type="button" class="secondary-btn" onclick="document.getElementById('msotGradeSubmissionModal').style.display='none'">CANCEL</button>
                            <button type="submit" class="primary-btn">SAVE GRADE & NOTIFY CADET ➔</button>
                        </div>
                    </form>
                </div>
            `;

            modal.style.display = 'flex';
        }

        handleGradeSubmissionSubmit(e, submissionId) {
            e.preventDefault();
            const gradeScore = document.getElementById('gradeScore').value;
            const gradeXp = document.getElementById('gradeXP').value;
            const feedback = document.getElementById('gradeFeedback').value;

            this.gradeAssignmentSubmission(submissionId, { gradeScore, gradeXp, feedback });
            alert('Submission graded and feedback dispatched to cadet!');
            document.getElementById('msotGradeSubmissionModal').style.display = 'none';

            if (window.msotPlatform) {
                window.msotPlatform.renderFacultyDashboard?.();
                window.msotPlatform.renderAdminRules?.();
            }
        }

        // ─── Submit Inactivity Reason Modal (Student) ───────────────────────
        openSubmitInactivityModal() {
            let modal = document.getElementById('msotSubmitInactivityModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'msotSubmitInactivityModal';
                modal.className = 'rbac-modal-overlay';
                document.body.appendChild(modal);
            }

            modal.innerHTML = `
                <div class="rbac-modal-card" style="max-width: 540px;">
                    <div class="rbac-modal-header">
                        <div class="rm-title-box">
                            <span class="rm-tag">CADET SUPPORT // INACTIVITY NOTICE</span>
                            <h3>Submit Inactivity / Leave Reason</h3>
                        </div>
                        <button type="button" class="rm-close-btn" onclick="document.getElementById('msotSubmitInactivityModal').style.display='none'">✕</button>
                    </div>

                    <p style="font-size:12.5px; color:var(--text-secondary); margin-bottom:14px;">
                        If you are unable to attend daily trials, complete weekend labs, or log in for personal or medical reasons, file a formal notice below. 
                        Your instructor will review and acknowledge it, preserving your streak shield.
                    </p>

                    <form class="rbac-form" onsubmit="window.msotRBAC.handleSubmitInactivityFormSubmit(event)">
                        <div class="form-group">
                            <label class="auth-label">REASON CATEGORY</label>
                            <select id="inactCategory" class="opt-input" style="width:100%;" required>
                                <option value="HEALTH">🩺 Health / Medical Issue</option>
                                <option value="PERSONAL">👤 Personal / Family Matter</option>
                                <option value="ACADEMIC_WORKLOAD">📚 Academic Workload & Exams</option>
                                <option value="TECHNICAL_ISSUE">💻 Technical & Network Issue</option>
                                <option value="LEAVE">✈️ Sanctioned Leave / Travel</option>
                                <option value="OTHER">📝 Other Academic Circumstance</option>
                            </select>
                        </div>

                        <div class="form-row-2">
                            <div class="form-group">
                                <label class="auth-label">FROM DATE</label>
                                <input id="inactDateFrom" type="date" value="${new Date().toISOString().slice(0, 10)}" required class="opt-input" style="width:100%;">
                            </div>
                            <div class="form-group">
                                <label class="auth-label">TO DATE</label>
                                <input id="inactDateTo" type="date" value="${new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)}" required class="opt-input" style="width:100%;">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="auth-label">DETAILED EXPLANATION</label>
                            <textarea id="inactReasonText" rows="4" class="rbac-textarea" placeholder="Explain your situation clearly for your course instructor..." required></textarea>
                        </div>

                        <div class="rm-actions">
                            <button type="button" class="secondary-btn" onclick="document.getElementById('msotSubmitInactivityModal').style.display='none'">CANCEL</button>
                            <button type="submit" class="primary-btn">FILE INACTIVITY NOTICE ➔</button>
                        </div>
                    </form>
                </div>
            `;

            modal.style.display = 'flex';
        }

        handleSubmitInactivityFormSubmit(e) {
            e.preventDefault();
            const category = document.getElementById('inactCategory').value;
            const date_from = document.getElementById('inactDateFrom').value;
            const date_to = document.getElementById('inactDateTo').value;
            const reason_text = document.getElementById('inactReasonText').value;

            this.submitInactivityReason({ category, reason_text, date_from, date_to });
            alert('Your inactivity notice has been filed and routed to your course faculty for acknowledgment.');
            document.getElementById('msotSubmitInactivityModal').style.display = 'none';

            if (window.msotPlatform) {
                window.msotPlatform.renderDashboard?.();
                window.msotPlatform.renderFacultyDashboard?.();
            }
        }

        // ─── Respond to Inactivity Reason Modal (Faculty & Admin) ───────────
        openRespondInactivityModal(reasonId) {
            const reason = this.inactivityReasons.find(r => r.id === reasonId);
            if (!reason) {
                alert('Inactivity notice record not found.');
                return;
            }

            let modal = document.getElementById('msotRespondInactivityModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'msotRespondInactivityModal';
                modal.className = 'rbac-modal-overlay';
                document.body.appendChild(modal);
            }

            modal.innerHTML = `
                <div class="rbac-modal-card" style="max-width: 560px;">
                    <div class="rbac-modal-header">
                        <div class="rm-title-box">
                            <span class="rm-tag">FACULTY GOVERNANCE // INACTIVITY REVIEW</span>
                            <h3>Respond to Student Inactivity Reason</h3>
                        </div>
                        <button type="button" class="rm-close-btn" onclick="document.getElementById('msotRespondInactivityModal').style.display='none'">✕</button>
                    </div>

                    <div style="background:rgba(255,255,255,0.04); border-radius:10px; padding:12px; margin-bottom:14px; font-size:12.5px;">
                        <div><strong>Cadet:</strong> ${reason.student_name} (${reason.student_email})</div>
                        <div><strong>Category:</strong> ${reason.category} • <strong>Dates:</strong> ${reason.date_from} to ${reason.date_to}</div>
                        <div style="margin-top:6px; color:#cbd5e1; font-style:italic;">"${reason.reason_text}"</div>
                    </div>

                    <form class="rbac-form" onsubmit="window.msotRBAC.handleRespondInactivityFormSubmit(event, '${reasonId}')">
                        <div class="form-group">
                            <label class="auth-label">ACTION / STATUS</label>
                            <select id="respStatus" class="opt-input" style="width:100%;" required>
                                <option value="ACKNOWLEDGED" ${reason.status === 'ACKNOWLEDGED' ? 'selected' : ''}>✅ Acknowledge & Grant Streak Shield</option>
                                <option value="EXCUSED" ${reason.status === 'EXCUSED' ? 'selected' : ''}>🛡️ Excuse & Extend Lab Deadlines</option>
                                <option value="PENDING" ${reason.status === 'PENDING' ? 'selected' : ''}>⏳ Keep Pending Further Verification</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="auth-label">FACULTY RESPONSE MESSAGE TO CADET</label>
                            <textarea id="respText" rows="4" class="rbac-textarea" placeholder="e.g. Okay, take care and update us once available. Your streak shield is granted." required>${reason.faculty_response || 'Acknowledged. Take care and update us when you are ready to resume.'}</textarea>
                        </div>

                        <div class="rm-actions">
                            <button type="button" class="secondary-btn" onclick="document.getElementById('msotRespondInactivityModal').style.display='none'">CANCEL</button>
                            <button type="submit" class="primary-btn">DISPATCH RESPONSE TO CADET ➔</button>
                        </div>
                    </form>
                </div>
            `;

            modal.style.display = 'flex';
        }

        handleRespondInactivityFormSubmit(e, reasonId) {
            e.preventDefault();
            const status = document.getElementById('respStatus').value;
            const response_text = document.getElementById('respText').value;

            this.respondToInactivityReason(reasonId, { response_text, status });
            alert('Response recorded and dispatched to cadet inbox!');
            document.getElementById('msotRespondInactivityModal').style.display = 'none';

            if (window.msotPlatform) {
                window.msotPlatform.renderFacultyDashboard?.();
                window.msotPlatform.renderAdminRules?.();
            }
        }

        // ─── 2-Way Message Modal (Faculty ↔️ Student) ────────────────────────
        openMessageModal(receiverEmail, subjectPrefix = '', relatedAsgId = null, relatedReasonId = null) {
            if (!receiverEmail && typeof window.openSendMessageModal === 'function') {
                window.openSendMessageModal();
                return;
            }
            const receiverUser = this.getUserByEmail(receiverEmail);
            const myUser = this.getCurrentUser();

            let modal = document.getElementById('msotMessageModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'msotMessageModal';
                modal.className = 'rbac-modal-overlay';
                document.body.appendChild(modal);
            }

            modal.onclick = (e) => {
                if (e.target === modal) {
                    this.closeMessageModal();
                }
            };

            modal.innerHTML = `
                <div class="rbac-modal-card" style="max-width: 560px;">
                    <div class="rbac-modal-header">
                        <div class="rm-title-box">
                            <span class="rm-tag">COMMUNICATION // DIRECT DISPATCH</span>
                            <h3>Send Message</h3>
                        </div>
                        <button type="button" class="rm-close-btn" onclick="window.msotRBAC ? window.msotRBAC.closeMessageModal() : (document.getElementById('msotMessageModal').style.display='none')">✕</button>
                    </div>

                    <div style="background:rgba(255,255,255,0.04); border-radius:10px; padding:10px 14px; margin-bottom:12px; font-size:12.5px;">
                        <div><strong>Recipient:</strong> ${receiverUser?.name || receiverEmail} (${receiverEmail}) [${receiverUser?.role || 'CADET'}]</div>
                        <div><strong>Sender:</strong> ${myUser?.name || 'Academic Staff'} (${myUser?.email || ''})</div>
                    </div>

                    <form class="rbac-form" onsubmit="window.msotRBAC.handleSendMessageSubmit(event, '${receiverEmail}', '${relatedAsgId || ''}', '${relatedReasonId || ''}')">
                        <div class="form-group">
                            <label class="auth-label">SUBJECT</label>
                            <input id="msgSubject" type="text" value="${subjectPrefix || 'Academic Guidance'}" required class="opt-input" style="width:100%;">
                        </div>

                        <div class="form-group">
                            <label class="auth-label">MESSAGE CONTENT</label>
                            <textarea id="msgContent" rows="5" class="rbac-textarea" placeholder="Type your message clearly..." required></textarea>
                        </div>

                        <div class="rm-actions">
                            <button type="button" class="secondary-btn" onclick="window.msotRBAC ? window.msotRBAC.closeMessageModal() : (document.getElementById('msotMessageModal').style.display='none')">CANCEL</button>
                            <button type="submit" class="primary-btn">SEND MESSAGE ➔</button>
                        </div>
                    </form>
                </div>
            `;

            modal.classList.add('active');
            modal.style.display = 'flex';
        }

        closeMessageModal() {
            const modal = document.getElementById('msotMessageModal');
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
                modal.style.setProperty('display', 'none', 'important');
            }
            if (window.miraiAudio && typeof window.miraiAudio.playClick === 'function') {
                window.miraiAudio.playClick();
            }
        }

        handleSendMessageSubmit(e, receiverEmail, relatedAsgId, relatedReasonId) {
            e.preventDefault();
            const subject = document.getElementById('msgSubject').value;
            const content = document.getElementById('msgContent').value;

            this.sendMessage({
                receiver_email: receiverEmail,
                subject,
                content,
                related_assignment_id: relatedAsgId || null,
                related_reason_id: relatedReasonId || null
            });

            alert('Message dispatched successfully!');
            this.closeMessageModal();

            if (window.msotPlatform) {
                window.msotPlatform.renderFacultyDashboard?.();
                window.msotPlatform.renderAdminRules?.();
            }
        }

        closeStudentInboxModal() {
            const modal = document.getElementById('msotStudentInboxModal');
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
                modal.style.setProperty('display', 'none', 'important');
            }
            if (window.miraiAudio && typeof window.miraiAudio.playClick === 'function') {
                window.miraiAudio.playClick();
            }
        }

        openStudentInboxModal() {
            const user = this.getCurrentUser();
            const userEmail = (user?.email || '').toLowerCase();
            const msgs = this.getMessages(userEmail).sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));

            let modal = document.getElementById('msotStudentInboxModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'msotStudentInboxModal';
                document.body.appendChild(modal);
            }

            modal.onclick = (e) => {
                if (e.target === modal) {
                    this.closeStudentInboxModal();
                }
            };

            modal.className = 'rbac-modal-overlay active';
            modal.classList.add('active');
            modal.style.display = 'flex';

            modal.innerHTML = `
                <div class="rbac-modal-card" style="max-width: 640px;">
                    <div class="rbac-modal-header">
                        <div class="rm-title-box">
                            <span class="rm-tag">ACADEMIC INBOX // FACULTY CORRESPONDENCE</span>
                            <h3>Faculty Messages (${msgs.length})</h3>
                        </div>
                        <button type="button" class="rm-close-btn" onclick="window.msotRBAC ? window.msotRBAC.closeStudentInboxModal() : (document.getElementById('msotStudentInboxModal').style.display='none')">✕</button>
                    </div>

                    <div style="display:flex;flex-direction:column;gap:12px;max-height:60vh;overflow-y:auto;padding-right:4px;">
                        ${msgs.length === 0 ? `
                            <div style="text-align:center;padding:40px 16px;color:#8c96a8;">
                                <div style="font-size:38px;margin-bottom:8px;">📬</div>
                                <h4>No Messages in your Inbox</h4>
                                <p style="font-size:12px;margin-top:6px;">When faculty instructors send you guidance, assignment notes, or feedback, they will appear here.</p>
                            </div>
                        ` : msgs.map(m => {
                            const senderName = m.sender_name || m.senderName || 'Faculty Instructor';
                            const senderEmail = m.sender_email || m.senderEmail || '';
                            const dateVal = m.created_at || m.createdAt;
                            const dateStr = dateVal ? new Date(dateVal).toLocaleString() : 'Recent';
                            const bodyText = m.content || m.body || '';
                            return `
                                <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(0,240,255,0.2);border-radius:12px;padding:16px;">
                                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                                        <div>
                                            <strong style="color:#00f0ff;font-size:14px;">🎓 ${senderName}</strong>
                                            <span style="font-size:12px;color:#8c96a8;"> (${senderEmail})</span>
                                        </div>
                                        <span style="font-size:11px;color:#64748b;">${dateStr}</span>
                                    </div>
                                    <h4 style="color:#fff;margin:0 0 6px 0;font-size:13.5px;">${m.subject || 'Academic Communication'}</h4>
                                    <p style="color:#cbd5e1;font-size:13px;line-height:1.5;margin:0;white-space:pre-wrap;">${bodyText}</p>
                                    <div style="display:flex;justify-content:flex-end;margin-top:12px;">
                                        <button class="btn-action-sm" onclick="(window.msotRBAC ? window.msotRBAC.closeStudentInboxModal() : (document.getElementById('msotStudentInboxModal').style.display='none')); window.msotRBAC.openMessageModal('${senderEmail}', 'Re: ${(m.subject || '').replace(/'/g, "\\'")}')">
                                            REPLY TO INSTRUCTOR ➔
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <div class="rm-actions" style="margin-top:16px;">
                        <button type="button" class="primary-btn" onclick="window.msotRBAC ? window.msotRBAC.closeStudentInboxModal() : (document.getElementById('msotStudentInboxModal').style.display='none')">CLOSE INBOX</button>
                    </div>
                </div>
            `;
            if (window.miraiAudio && typeof window.miraiAudio.playClick === 'function') {
                window.miraiAudio.playClick();
            }
        }

        // ─── Question Bank (Preserved) ──────────────────────────────────────
        getQuestions(activityFilter = 'ALL', statusFilter = 'ALL') {
            let list = [...this.questions];
            if (activityFilter !== 'ALL') {
                list = list.filter(q => q.activity_type === activityFilter);
            }
            if (statusFilter === 'published') {
                list = list.filter(q => q.is_published === true);
            } else if (statusFilter === 'draft') {
                list = list.filter(q => q.is_published === false);
            }
            if (this.isStudent()) {
                list = list.filter(q => q.is_published === true);
            }
            return list;
        }

        getQuestionById(id) {
            return this.questions.find(q => q.id === id) || null;
        }

        createQuestion(data) {
            if (!this.isAdmin() && !this.isFaculty()) {
                alert('⚠️ Permission Denied: Students cannot create questions.');
                return false;
            }
            const user = this.getCurrentUser();
            const newQ = {
                id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                title: data.title.trim(),
                description: data.description ? data.description.trim() : '',
                options: data.options || [
                    { id: 'A', text: 'Option A' },
                    { id: 'B', text: 'Option B' },
                    { id: 'C', text: 'Option C' },
                    { id: 'D', text: 'Option D' }
                ],
                correct_answer: data.correct_answer.toUpperCase(),
                explanation: data.explanation ? data.explanation.trim() : 'Server verified answer explanation.',
                difficulty: data.difficulty || 'beginner',
                category: data.category || 'C++ DSA',
                activity_type: data.activity_type || 'daily_trial',
                is_published: data.is_published !== undefined ? data.is_published : true,
                creator_email: user?.email || 'admin@msot.edu',
                creator_name: user?.name || 'Academic Faculty',
                xp_reward: parseInt(data.xp_reward, 10) || 15,
                created_at: new Date().toISOString()
            };

            const updated = [newQ, ...this.questions];
            this.saveQuestions(updated);
            this.logAudit('QUESTION_CREATED', 'question', newQ.id, { title: newQ.title, type: newQ.activity_type });
            return newQ;
        }

        updateQuestion(id, data) {
            const index = this.questions.findIndex(q => q.id === id);
            if (index === -1) return false;
            const existing = this.questions[index];

            if (!this.isAdmin() && (!this.isFaculty() || existing.creator_email?.toLowerCase() !== this.getCurrentUser()?.email?.toLowerCase())) {
                alert('⚠️ Permission Denied: You cannot modify this question.');
                return false;
            }

            const updated = {
                ...existing,
                title: data.title ? data.title.trim() : existing.title,
                description: data.description !== undefined ? data.description.trim() : existing.description,
                options: data.options || existing.options,
                correct_answer: data.correct_answer ? data.correct_answer.toUpperCase() : existing.correct_answer,
                explanation: data.explanation !== undefined ? data.explanation.trim() : existing.explanation,
                difficulty: data.difficulty || existing.difficulty,
                category: data.category || existing.category,
                activity_type: data.activity_type || existing.activity_type,
                is_published: data.is_published !== undefined ? data.is_published : existing.is_published,
                xp_reward: data.xp_reward ? parseInt(data.xp_reward, 10) : existing.xp_reward,
                updated_at: new Date().toISOString()
            };

            this.questions[index] = updated;
            this.saveQuestions(this.questions);
            this.logAudit('QUESTION_UPDATED', 'question', id, { title: updated.title });
            return updated;
        }

        deleteQuestion(id) {
            const q = this.getQuestionById(id);
            if (!q) return false;
            if (!this.isAdmin() && (!this.isFaculty() || q.creator_email?.toLowerCase() !== this.getCurrentUser()?.email?.toLowerCase())) {
                alert('⚠️ Permission Denied: You cannot delete this question.');
                return false;
            }

            if (!confirm(`Are you sure you want to delete question "${q.title}"?`)) return false;

            const filtered = this.questions.filter(item => item.id !== id);
            this.saveQuestions(filtered);
            this.logAudit('QUESTION_DELETED', 'question', id, { title: q.title });
            return true;
        }

        togglePublishQuestion(id) {
            const q = this.getQuestionById(id);
            if (!q) return false;
            if (!this.isAdmin() && (!this.isFaculty() || q.creator_email?.toLowerCase() !== this.getCurrentUser()?.email?.toLowerCase())) {
                alert('⚠️ Permission Denied: You cannot change publish status for this question.');
                return false;
            }

            q.is_published = !q.is_published;
            q.updated_at = new Date().toISOString();
            this.saveQuestions(this.questions);
            this.logAudit('QUESTION_PUBLISH_TOGGLED', 'question', id, { is_published: q.is_published });
            return q.is_published;
        }

        openQuestionModal(questionId = null, defaultType = 'daily_trial') {
            const isEdit = !!questionId;
            const q = isEdit ? this.getQuestionById(questionId) : {
                title: '',
                description: '',
                options: [
                    { id: 'A', text: '' },
                    { id: 'B', text: '' },
                    { id: 'C', text: '' },
                    { id: 'D', text: '' }
                ],
                correct_answer: 'A',
                explanation: '',
                difficulty: 'beginner',
                category: 'C++ DSA',
                activity_type: defaultType,
                is_published: true,
                xp_reward: defaultType === 'weekend_lab' ? 35 : 15
            };

            let modal = document.getElementById('msotQuestionModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'msotQuestionModal';
                modal.className = 'rbac-modal-overlay';
                document.body.appendChild(modal);
            }

            modal.innerHTML = `
                <div class="rbac-modal-card" style="max-width: 620px;">
                    <div class="rbac-modal-header">
                        <div class="rm-title-box">
                            <span class="rm-tag">CURRICULUM INSTRUCTION // QUESTION BANK</span>
                            <h3>${isEdit ? 'Edit Trial Question' : 'Author New Trial Question'}</h3>
                        </div>
                        <button type="button" class="rm-close-btn" onclick="document.getElementById('msotQuestionModal').style.display='none'">✕</button>
                    </div>

                    <form class="rbac-form" onsubmit="window.msotRBAC.handleQuestionFormSubmit(event, '${questionId || ''}')">
                        <div class="form-group">
                            <label class="auth-label">QUESTION TITLE / CODE SNIPPET</label>
                            <input id="qTitle" type="text" value="${q.title || ''}" placeholder="e.g. Pointer arithmetic evaluating *(arr + 2)" required class="opt-input" style="width:100%;">
                        </div>

                        <div class="form-row-2">
                            <div class="form-group">
                                <label class="auth-label">MODULE TYPE</label>
                                <select id="qType" class="opt-input" style="width:100%;">
                                    <option value="daily_trial" ${q.activity_type === 'daily_trial' ? 'selected' : ''}>⚡ Daily Speed Trial</option>
                                    <option value="weekend_lab" ${q.activity_type === 'weekend_lab' ? 'selected' : ''}>💻 Weekend Lab Sprint</option>
                                    <option value="general" ${q.activity_type === 'general' ? 'selected' : ''}>⚔️ General Arcade</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="auth-label">DIFFICULTY</label>
                                <select id="qDiff" class="opt-input" style="width:100%;">
                                    <option value="beginner" ${q.difficulty === 'beginner' ? 'selected' : ''}>Beginner</option>
                                    <option value="intermediate" ${q.difficulty === 'intermediate' ? 'selected' : ''}>Intermediate</option>
                                    <option value="advanced" ${q.difficulty === 'advanced' ? 'selected' : ''}>Advanced</option>
                                </select>
                            </div>
                        </div>

                        <div class="options-group-box">
                            <label class="auth-label">MULTIPLE CHOICE OPTIONS</label>
                            <div class="option-row"><span class="opt-key">A</span><input id="optA" type="text" value="${q.options?.[0]?.text || ''}" required class="opt-input" placeholder="Option A text"></div>
                            <div class="option-row"><span class="opt-key">B</span><input id="optB" type="text" value="${q.options?.[1]?.text || ''}" required class="opt-input" placeholder="Option B text"></div>
                            <div class="option-row"><span class="opt-key">C</span><input id="optC" type="text" value="${q.options?.[2]?.text || ''}" required class="opt-input" placeholder="Option C text"></div>
                            <div class="option-row"><span class="opt-key">D</span><input id="optD" type="text" value="${q.options?.[3]?.text || ''}" required class="opt-input" placeholder="Option D text"></div>
                        </div>

                        <div class="form-row-2">
                            <div class="form-group">
                                <label class="auth-label">CORRECT ANSWER KEY</label>
                                <select id="qCorrect" class="opt-input" style="width:100%;">
                                    <option value="A" ${q.correct_answer === 'A' ? 'selected' : ''}>Option A</option>
                                    <option value="B" ${q.correct_answer === 'B' ? 'selected' : ''}>Option B</option>
                                    <option value="C" ${q.correct_answer === 'C' ? 'selected' : ''}>Option C</option>
                                    <option value="D" ${q.correct_answer === 'D' ? 'selected' : ''}>Option D</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="auth-label">XP REWARD</label>
                                <input id="qXP" type="number" value="${q.xp_reward || 15}" min="5" max="100" class="opt-input" style="width:100%;">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="auth-label">EXPLANATION</label>
                            <textarea id="qExpl" rows="3" class="rbac-textarea" placeholder="Explain why the answer is correct for cadet review..." required>${q.explanation || ''}</textarea>
                        </div>

                        <div class="rm-actions">
                            <button type="button" class="secondary-btn" onclick="document.getElementById('msotQuestionModal').style.display='none'">CANCEL</button>
                            <button type="submit" class="primary-btn">${isEdit ? 'SAVE QUESTION' : 'ADD TO QUESTION BANK ➔'}</button>
                        </div>
                    </form>
                </div>
            `;

            modal.style.display = 'flex';
        }

        handleQuestionFormSubmit(e, id) {
            e.preventDefault();
            const data = {
                title: document.getElementById('qTitle').value,
                activity_type: document.getElementById('qType').value,
                difficulty: document.getElementById('qDiff').value,
                options: [
                    { id: 'A', text: document.getElementById('optA').value.trim() },
                    { id: 'B', text: document.getElementById('optB').value.trim() },
                    { id: 'C', text: document.getElementById('optC').value.trim() },
                    { id: 'D', text: document.getElementById('optD').value.trim() }
                ],
                correct_answer: document.getElementById('qCorrect').value,
                xp_reward: document.getElementById('qXP').value,
                explanation: document.getElementById('qExpl').value,
                is_published: true
            };

            if (id) {
                this.updateQuestion(id, data);
                alert('Question updated!');
            } else {
                this.createQuestion(data);
                alert('Question added to Question Bank!');
            }

            document.getElementById('msotQuestionModal').style.display = 'none';
            if (window.msotPlatform) {
                window.msotPlatform.renderFacultyDashboard?.();
                window.msotPlatform.renderAdminRules?.();
            }
        }

        // ─── Add User Modal (Admin Provisioning) ────────────────────────────
        openAddUserModal() {
            let modal = document.getElementById('rbacAddUserModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'rbacAddUserModal';
                modal.className = 'rbac-modal-overlay';
                document.body.appendChild(modal);
            }

            modal.innerHTML = `
                <div class="rbac-modal-card" style="max-width:520px;">
                    <div class="rbac-modal-header">
                        <div class="rm-title-box">
                            <span class="rm-tag">ADMIN USER PROVISIONING</span>
                            <h3>Provision New Account</h3>
                        </div>
                        <button type="button" class="rm-close-btn" onclick="document.getElementById('rbacAddUserModal').style.display='none'">✕</button>
                    </div>

                    <form id="rbacAddUserForm" class="rbac-form" onsubmit="window.msotRBAC.handleAddUserSubmit(event)">
                        <div class="form-row-2">
                            <div class="form-group">
                                <label class="auth-label">FULL NAME</label>
                                <input id="nuName" type="text" placeholder="e.g. Harsh Singh" required class="opt-input" style="width:100%;">
                            </div>
                            <div class="form-group">
                                <label class="auth-label">USERNAME</label>
                                <input id="nuUsername" type="text" placeholder="e.g. harshsingh" required class="opt-input" style="width:100%;">
                            </div>
                        </div>

                        <div class="form-row-2">
                            <div class="form-group">
                                <label class="auth-label">EMAIL ADDRESS</label>
                                <input id="nuEmail" type="email" placeholder="e.g. harsh@example.com" required class="opt-input" style="width:100%;">
                            </div>
                            <div class="form-group">
                                <label class="auth-label">STUDENT / STAFF ID</label>
                                <input id="nuId" type="text" placeholder="e.g. MSOT-2026-001" required class="opt-input" style="width:100%;">
                            </div>
                        </div>

                        <div class="form-row-2">
                            <div class="form-group">
                                <label class="auth-label">ROLE ASSIGNMENT</label>
                                <select id="nuRole" required class="opt-input" style="width:100%;">
                                    <option value="STUDENT" selected>⚔️ STUDENT (Cadet)</option>
                                    <option value="FACULTY">🎓 FACULTY (Instructor)</option>
                                    <option value="ADMIN">🛡️ ADMIN (Administrator)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="auth-label">INITIAL PASSWORD</label>
                                <input id="nuPassword" type="text" value="msot1234" required class="opt-input" style="width:100%;">
                            </div>
                        </div>

                        <div class="rm-actions">
                            <button type="button" class="secondary-btn" onclick="document.getElementById('rbacAddUserModal').style.display='none'">CANCEL</button>
                            <button type="submit" class="primary-btn">CREATE & PROVISION ACCOUNT ➔</button>
                        </div>
                    </form>
                </div>
            `;

            modal.style.display = 'flex';
        }

        handleAddUserSubmit(e) {
            e.preventDefault();
            const name = document.getElementById('nuName').value.trim();
            const username = document.getElementById('nuUsername').value.trim().toLowerCase();
            const email = document.getElementById('nuEmail').value.trim().toLowerCase();
            const studentId = document.getElementById('nuId').value.trim();
            const role = document.getElementById('nuRole').value;
            const password = document.getElementById('nuPassword').value;

            const newAcc = {
                id: `usr_${Date.now()}`,
                name,
                username,
                alias: `@${username}`,
                email,
                studentId,
                role,
                status: 'ACTIVE',
                avatar: role === 'ADMIN' ? '🛡️' : (role === 'FACULTY' ? '🎓' : '⚔️'),
                password,
                registeredAt: new Date().toISOString(),
                lastActive: new Date().toISOString()
            };

            try {
                const stored = localStorage.getItem('MSOT_LEARN_ACCOUNTS_V2');
                const accounts = stored ? JSON.parse(stored) : {};
                accounts[email] = newAcc;
                localStorage.setItem('MSOT_LEARN_ACCOUNTS_V2', JSON.stringify(accounts));

                this.logAudit('USER_CREATED_BY_ADMIN', 'user', email, { role });
                alert(`Account ${email} successfully created with role [${role}]!`);
                document.getElementById('rbacAddUserModal').style.display = 'none';

                if (window.msotPlatform?.renderAdminRules) {
                    window.msotPlatform.renderAdminRules();
                }
            } catch (err) {
                alert('Could not save new account.');
            }
        }
    }

    // Instantiate RBAC Controller
    window.msotRBAC = new MSOTRBACController();
})();
