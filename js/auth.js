/**
 * MSOT LEARN — Supabase Authentication & Cadet Registration System
 * Connected to Supabase Project: zsxdsyfjlxtcunhqgcdj
 * Features:
 * - Real Supabase Auth: signUp, signInWithPassword, signOut, getSession
 * - User Metadata Sync: name, role, track, avatar
 * - Seamless fallback for 1-Click Demo Accounts (Student, Faculty, Admin)
 * - Avatar selection gallery (8 anime/cyber badges)
 * - Reactive HUD and state synchronization
 */

(function () {
    const SUPABASE_URL = "https://zsxdsyfjlxtcunhqgcdj.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_9-cjPrufltHmmdOcI5A_IA_JqQFZxG6";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzeGRzeWZqbHh0Y3VuaHFnY2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1MTI0OTksImV4cCI6MjEwNzA4ODQ5OX0.n223hw6kl5iuAEz5llQ6BBhhtXRQkKHU86n2gf_lD8k";
    const SUPABASE_KEY = SUPABASE_PUBLISHABLE_KEY || SUPABASE_ANON_KEY;

    const SESSION_KEY = 'MSOT_LEARN_AUTH_SESSION_V1';
    const ACCOUNTS_KEY = 'MSOT_LEARN_ACCOUNTS_V2';
    const DEFAULT_PASS = 'msot1234';
    let activeSession = null;

    // ─── Initialize Supabase Client ──────────────────────────────────────────
    let supabaseClient = null;
    try {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });
            window.supabaseClient = supabaseClient;
            window.msotSupabase = supabaseClient;
            console.log("⚡ Supabase Client initialized in auth.js!");
        }
    } catch (e) {
        console.warn("Supabase init note:", e.message);
    }

    // Notice: Client-side operations strictly use public anon/publishable credentials.
    // Privileged admin functions are handled via PostgreSQL RLS & stored procedures.

    const BUILTIN_USERS = {
        'admin@msot.edu': {
            email: 'admin@msot.edu',
            name: 'Utkarsh Raj',
            username: 'utkarsh_raj',
            alias: '@utkarsh_admin',
            studentId: 'ADM-MSOT-001',
            year: 'System Administrator',
            semester: 'Master Control & Governance',
            section: 'All Sectors',
            role: 'ADMIN',
            approval_status: 'APPROVED',
            status: 'ACTIVE',
            avatar: '🛡️',
            track: 'System Governance & Academic Control',
            password: DEFAULT_PASS
        },
        'utkarshraj142006@gmail.com': {
            email: 'utkarshraj142006@gmail.com',
            name: 'Utkarsh Raj',
            username: 'utkarsh_raj',
            alias: '@utkarsh_raj',
            studentId: 'ADM-MSOT-001',
            year: 'System Administrator',
            semester: 'Master Control',
            section: 'All Sectors',
            role: 'ADMIN',
            approval_status: 'APPROVED',
            status: 'ACTIVE',
            avatar: '🛡️',
            track: 'C++ Algorithms & DSA',
            password: DEFAULT_PASS
        },
        'student@msot.edu': {
            email: 'student@msot.edu',
            name: 'Utkarsh Raj',
            username: 'utkarsh_cadet',
            alias: '@utkarsh_cadet',
            studentId: 'MSOT-2026-001',
            year: '1st Year',
            semester: 'Semester 1',
            section: 'Section Alpha',
            role: 'STUDENT',
            approval_status: 'APPROVED',
            status: 'ACTIVE',
            avatar: '⚔️',
            track: 'C++ Algorithms & DSA',
            password: DEFAULT_PASS
        },
        'faculty@msot.edu': {
            email: 'faculty@msot.edu',
            name: 'Utkarsh Raj',
            username: 'utkarsh_faculty',
            alias: '@utkarsh_faculty',
            studentId: 'FAC-MSOT-001',
            year: 'Faculty Lead',
            semester: 'Academic Instruction',
            section: 'Section Alpha & Beta',
            role: 'FACULTY',
            approval_status: 'APPROVED',
            status: 'ACTIVE',
            avatar: '🎓',
            track: 'Academic Instruction & Review',
            password: DEFAULT_PASS
        },
        'harsh5217a@gmail.com': {
            email: 'harsh5217a@gmail.com',
            name: 'harsh',
            username: 'harsjh5217',
            alias: '@harsjh5217',
            studentId: 'msot 2026',
            year: '1st Year',
            semester: 'Semester 1',
            section: 'Section Beta',
            role: 'STUDENT',
            approval_status: 'APPROVED',
            status: 'ACTIVE',
            avatar: '⚔️',
            track: 'C++ Algorithms & DSA',
            password: DEFAULT_PASS
        },
        'billiff98015@gmail.com': {
            email: 'billiff98015@gmail.com',
            name: 'harsh singh',
            username: 'harshsingh',
            alias: '@harshsingh',
            studentId: '260458',
            year: '1st Year',
            semester: 'Semester 1',
            section: 'Section Beta',
            role: 'STUDENT',
            approval_status: 'APPROVED',
            status: 'ACTIVE',
            avatar: '⚔️',
            track: 'C++ Algorithms & DSA',
            password: DEFAULT_PASS
        },
        'cadet.utkarsh.msot@gmail.com': {
            email: 'cadet.utkarsh.msot@gmail.com',
            name: 'Utkarsh Cadet',
            username: 'utkarsh_cadet',
            alias: '@utkarsh_cadet',
            studentId: 'MSOT-2026-004',
            year: '1st Year',
            semester: 'Semester 1',
            section: 'Section Alpha',
            role: 'STUDENT',
            approval_status: 'APPROVED',
            status: 'ACTIVE',
            avatar: '⚔️',
            track: 'C++ Algorithms & DSA',
            password: DEFAULT_PASS
        },
        'aarav@gmail.com': {
            email: 'aarav@gmail.com',
            name: 'aarav',
            username: 'aarav',
            alias: '@aarav',
            studentId: 'MSOT-2026-005',
            year: '1st Year',
            semester: 'Semester 1',
            section: 'Section Alpha',
            role: 'STUDENT',
            approval_status: 'APPROVED',
            status: 'ACTIVE',
            avatar: '🛡️',
            track: 'C++ Algorithms (7 Trials)',
            password: DEFAULT_PASS
        }
    };

    const $ = id => document.getElementById(id);

    function normalizeSection(sec) {
        if (!sec) return 'Section Alpha';
        const s = String(sec).trim();
        if (s === 'Section Beta' || s === 'Beta' || s === 'Section B' || s === 'B') return 'Section Beta';
        if (s === 'Section Alpha' || s === 'Alpha' || s === 'Section A' || s === 'A') return 'Section Alpha';
        return s;
    }

    function getStoredAccounts() {
        try {
            const raw = localStorage.getItem(ACCOUNTS_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function getAllAccounts() {
        const stored = getStoredAccounts();
        return { ...BUILTIN_USERS, ...stored };
    }

    function isUsernameTaken(rawUsername, excludeEmail = null) {
        const clean = (rawUsername || '').replace(/^@/, '').trim().toLowerCase();
        if (!clean) return false;

        // Check against builtin users
        for (const [em, u] of Object.entries(BUILTIN_USERS)) {
            if (excludeEmail && em.toLowerCase() === excludeEmail.toLowerCase()) continue;
            const existUser = (u.username || u.alias || em.split('@')[0]).replace(/^@/, '').trim().toLowerCase();
            if (existUser === clean) return true;
        }

        // Check against locally saved accounts
        const stored = getStoredAccounts();
        for (const [em, acc] of Object.entries(stored)) {
            if (excludeEmail && em.toLowerCase() === excludeEmail.toLowerCase()) continue;
            const existUser = (acc.username || acc.alias || '').replace(/^@/, '').trim().toLowerCase();
            if (existUser === clean) return true;
        }

        // Check against student profile states in localStorage
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('MSOT_STUDENT_PROFILE_')) {
                    const prof = JSON.parse(localStorage.getItem(k));
                    if (prof && prof.email && excludeEmail && prof.email.toLowerCase() === excludeEmail.toLowerCase()) continue;
                    if (prof) {
                        const profUser = (prof.username || prof.alias || '').replace(/^@/, '').trim().toLowerCase();
                        if (profUser === clean) return true;
                    }
                }
            }
        } catch(e) {}

        return false;
    }

    function saveAccount(acc) {
        try {
            const stored = getStoredAccounts();
            stored[acc.email.toLowerCase()] = acc;
            localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(stored));
        } catch (e) {
            console.warn("Could not save account locally:", e);
        }
    }

    function getSession() {
        try {
            const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            const sess = JSON.parse(raw);
            if (sess) {
                // Ensure role is consistent without overriding student/faculty roles
                if (!sess.role) {
                    sess.role = (sess.email === 'admin@msot.edu') ? 'ADMIN' : (sess.email === 'faculty@msot.edu' ? 'FACULTY' : 'STUDENT');
                } else if (sess.email === 'admin@msot.edu') {
                    sess.role = 'ADMIN';
                }
            }
            return sess;
        } catch (e) {
            return null;
        }
    }

    function ensureDefaultStudentSession() {
        let sess = getSession();
        if (!sess) {
            sess = {
                ...BUILTIN_USERS['student@msot.edu'],
                loginAt: new Date().toISOString()
            };
            setSession(sess, true);
        }
        activeSession = sess;
        if (window.msotAuth) {
            window.msotAuth.session = sess;
        }
        applySessionToUI(sess);
        return sess;
    }

    function setSession(session, remember = true) {
        try {
            const str = JSON.stringify(session);
            if (remember) {
                localStorage.setItem(SESSION_KEY, str);
                sessionStorage.removeItem(SESSION_KEY);
            } else {
                sessionStorage.setItem(SESSION_KEY, str);
                localStorage.removeItem(SESSION_KEY);
            }
            if (session) {
                document.documentElement.classList.add('has-session');
            }
        } catch (e) {}
    }

    function clearSession() {
        try {
            localStorage.removeItem(SESSION_KEY);
            sessionStorage.removeItem(SESSION_KEY);
            document.documentElement.classList.remove('has-session');
        } catch (e) {}
    }

    function showAuthScreen(show) {
        const screen = $('authScreen');
        if (screen) {
            screen.classList.toggle('hidden', !show);
            screen.classList.toggle('active', Boolean(show));
            screen.style.display = show ? 'flex' : 'none';
        }
        document.body.classList.toggle('auth-locked', Boolean(show));
        if (show) {
            document.documentElement.classList.remove('has-session');
        } else {
            document.documentElement.classList.add('has-session');
        }
    }

    function showLoginError(msg) {
        const err = $('loginError');
        const succ = $('loginSuccess');
        if (succ) succ.classList.remove('show');
        if (err) {
            err.textContent = msg;
            err.classList.add('show');
            setTimeout(() => err.classList.remove('show'), 7000);
        }
    }

    function showLoginSuccess(msg) {
        const err = $('loginError');
        const succ = $('loginSuccess');
        if (err) err.classList.remove('show');
        if (succ) {
            succ.textContent = msg;
            succ.classList.add('show');
        }
    }

    function showRegisterError(msg) {
        const err = $('registerError');
        const succ = $('registerSuccess');
        if (succ) succ.classList.remove('show');
        if (err) {
            err.textContent = msg;
            err.classList.add('show');
            setTimeout(() => err.classList.remove('show'), 7000);
        }
    }

    function showRegisterSuccess(msg) {
        const err = $('registerError');
        const succ = $('registerSuccess');
        if (err) err.classList.remove('show');
        if (succ) {
            succ.textContent = msg;
            succ.classList.add('show');
        }
    }

    function showAccountStatusModal(status, details = {}) {
        const modal = $('accountStatusModal');
        if (!modal) return;
        const icon = $('accountStatusIcon');
        const tag = $('accountStatusTag');
        const title = $('accountStatusTitle');
        const text = $('accountStatusText');
        const nameEl = $('asmApplicantName');
        const emailEl = $('asmApplicantEmail');
        const roleEl = $('asmApplicantRole');
        const badgeEl = $('asmStatusBadge');

        const cleanStatus = (status || 'PENDING').toUpperCase();

        if (nameEl) nameEl.textContent = details.name || details.fullName || 'Registered Applicant';
        if (emailEl) emailEl.textContent = details.email || '—';
        if (roleEl) roleEl.textContent = (details.requestedRole || details.role || 'STUDENT').toUpperCase();

        if (cleanStatus === 'PENDING') {
            if (icon) icon.textContent = '⏳';
            if (tag) {
                tag.textContent = 'REGISTRATION PENDING ADMIN APPROVAL';
                tag.style.color = '#f59e0b';
            }
            if (title) title.textContent = 'ACCOUNT PENDING APPROVAL';
            if (text) {
                text.textContent = 'Your registration has been submitted successfully and is waiting for Admin approval. You will receive access after your account has been verified.';
            }
            if (badgeEl) {
                badgeEl.textContent = 'PENDING';
                badgeEl.style.cssText = 'background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4); padding: 2px 8px; border-radius: 6px; font-weight: 700;';
            }
        } else if (cleanStatus === 'REJECTED') {
            if (icon) icon.textContent = '❌';
            if (tag) {
                tag.textContent = 'APPLICATION STATUS // REJECTED';
                tag.style.color = '#ff2a4b';
            }
            if (title) title.textContent = 'REGISTRATION NOT APPROVED';
            const reason = details.reason ? ` Reason provided by Administrator: "${details.reason}".` : '';
            if (text) {
                text.textContent = `Your registration request was not approved by the Administrator.${reason} If you believe this is in error, please contact the MSOT Academy Admissions Department.`;
            }
            if (badgeEl) {
                badgeEl.textContent = 'REJECTED';
                badgeEl.style.cssText = 'background: rgba(255, 42, 75, 0.2); color: #ff2a4b; border: 1px solid rgba(255, 42, 75, 0.4); padding: 2px 8px; border-radius: 6px; font-weight: 700;';
            }
        } else if (cleanStatus === 'SUSPENDED') {
            if (icon) icon.textContent = '🚫';
            if (tag) {
                tag.textContent = 'SECURITY LOCKOUT // SUSPENDED';
                tag.style.color = '#ff2a4b';
            }
            if (title) title.textContent = 'ACCOUNT ACCESS SUSPENDED';
            if (text) {
                text.textContent = 'This account has been suspended by the System Administrator. Protected platform functionality is temporarily disabled until an authorized Admin restores access.';
            }
            if (badgeEl) {
                badgeEl.textContent = 'SUSPENDED';
                badgeEl.style.cssText = 'background: rgba(255, 42, 75, 0.2); color: #ff2a4b; border: 1px solid rgba(255, 42, 75, 0.4); padding: 2px 8px; border-radius: 6px; font-weight: 700;';
            }
        }

        modal.classList.add('active');
        modal.style.setProperty('display', 'flex', 'important');
        modal.style.setProperty('pointer-events', 'auto', 'important');
        modal.style.setProperty('visibility', 'visible', 'important');
        if (window.miraiAudio) window.miraiAudio.playError?.();
    }

    function closeAccountStatusModal() {
        const modal = $('accountStatusModal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.setProperty('display', 'none', 'important');
            modal.style.setProperty('pointer-events', 'none', 'important');
            modal.style.setProperty('visibility', 'hidden', 'important');
        }
        showAuthScreen(true);
        showPortalSelector();
        switchAuthTab('signin');
    }

    let currentLoginRole = 'STUDENT';

    function selectLoginRole(role) {
        currentLoginRole = (role || 'STUDENT').toUpperCase();
        const portalSelector = $('rolePortalSelector');
        const formContainer = $('roleLoginFormContainer');
        const rab = $('roleActiveBanner');
        const rabIcon = $('rabIcon');
        const rabTag = $('rabTag');
        const rabTitle = $('rabTitle');
        const noticeRoleText = $('roleNoticeRoleText');
        const submitBtn = $('loginSubmitBtn');
        const demoBtn = $('roleSpecificDemoBtn');
        const emailInput = $('loginEmail');
        const passInput = $('loginPassword');
        const loginErr = $('loginError');
        const loginSucc = $('loginSuccess');

        if (loginErr) loginErr.classList.remove('show');
        if (loginSucc) loginSucc.classList.remove('show');
        if (passInput) passInput.value = '';

        if (portalSelector) portalSelector.style.display = 'none';
        if (formContainer) formContainer.style.display = 'block';

        if (currentLoginRole === 'ADMIN') {
            if (rab) rab.style.cssText = '--role-active-color: #ff2a4b; --role-active-glow: rgba(255, 42, 75, 0.3); border-color: rgba(255, 42, 75, 0.4);';
            if (rabIcon) rabIcon.textContent = '🛡️';
            if (rabTag) rabTag.textContent = 'MASTER SYSTEM ADMINISTRATION';
            if (rabTitle) rabTitle.textContent = 'Admin Login';
            if (noticeRoleText) noticeRoleText.textContent = 'SYSTEM ADMINISTRATORS';
            if (submitBtn) submitBtn.innerHTML = 'AUTHORIZE MASTER ADMIN <span>➔</span>';
            if (demoBtn) demoBtn.style.display = 'none';
        } else if (currentLoginRole === 'FACULTY') {
            if (rab) rab.style.cssText = '--role-active-color: #a855f0; --role-active-glow: rgba(168, 85, 240, 0.3); border-color: rgba(168, 85, 240, 0.4);';
            if (rabIcon) rabIcon.textContent = '🎓';
            if (rabTag) rabTag.textContent = 'PEDAGOGICAL INSTRUCTION COMMAND';
            if (rabTitle) rabTitle.textContent = 'Faculty Login';
            if (noticeRoleText) noticeRoleText.textContent = 'FACULTY INSTRUCTORS';
            if (submitBtn) submitBtn.innerHTML = 'AUTHENTICATE FACULTY LEAD <span>➔</span>';
            if (demoBtn) demoBtn.style.display = 'none';
        } else {
            if (rab) rab.style.cssText = '--role-active-color: #00f0ff; --role-active-glow: rgba(0, 240, 255, 0.3); border-color: rgba(0, 240, 255, 0.4);';
            if (rabIcon) rabIcon.textContent = '⚔️';
            if (rabTag) rabTag.textContent = 'CADET ADMISSIONS & ARCADE';
            if (rabTitle) rabTitle.textContent = 'Student Login';
            if (noticeRoleText) noticeRoleText.textContent = 'STUDENT CADETS';
            if (submitBtn) submitBtn.innerHTML = 'ACCESS AS STUDENT CADET <span>➔</span>';
            if (demoBtn) demoBtn.style.display = 'none';
        }

        const roleDemoSec = $('roleDemoSection');
        if (roleDemoSec) roleDemoSec.style.display = 'none';

        emailInput?.focus();
    }

    function showPortalSelector() {
        const portalSelector = $('rolePortalSelector');
        const formContainer = $('roleLoginFormContainer');
        const loginErr = $('loginError');
        const loginSucc = $('loginSuccess');

        if (loginErr) loginErr.classList.remove('show');
        if (loginSucc) loginSucc.classList.remove('show');

        if (portalSelector) portalSelector.style.display = 'block';
        if (formContainer) formContainer.style.display = 'none';
    }

    function switchAuthTab(tab) {
        const signInBtn = $('tabSignInBtn');
        const signUpBtn = $('tabSignUpBtn');
        const signInPane = $('signInPane');
        const signUpPane = $('signUpPane');
        const loginErr = $('loginError');
        const regErr = $('registerError');

        if (loginErr) loginErr.classList.remove('show');
        if (regErr) regErr.classList.remove('show');

        if (tab === 'signup') {
            signInBtn?.classList.remove('active');
            signUpBtn?.classList.add('active');
            if (signInPane) signInPane.style.display = 'none';
            if (signUpPane) signUpPane.style.display = 'block';
            $('regName')?.focus();
        } else {
            signUpBtn?.classList.remove('active');
            signInBtn?.classList.add('active');
            if (signUpPane) signUpPane.style.display = 'none';
            if (signInPane) signInPane.style.display = 'block';
            showPortalSelector();
        }
    }

    function applySessionToUI(session) {
        if (!session) return;
        closeAccountStatusModal();
        if (session.section) session.section = normalizeSection(session.section);
        window.msotAuth.session = session;

        // Sync with Platform State (isolates user data per account)
        if (window.msotState) {
            if (typeof window.msotState.switchUser === 'function') {
                window.msotState.switchUser(session);
            } else if (window.msotState.student) {
                window.msotState.student.name = session.name;
                window.msotState.student.avatar = session.avatar || '⚔️';
                window.msotState.student.email = session.email;
            }
            if (window.msotState.setRole) {
                window.msotState.setRole(session.role);
            }
        }

        // Sync header role indicator (Displays ONLY the single role user logged in as)
        const roleLabel = $('roleLabelIndicator');
        if (roleLabel) roleLabel.textContent = session.role || 'STUDENT';

        const roleIcon = $('roleIconIndicator');
        if (roleIcon) {
            roleIcon.textContent = session.role === 'STUDENT' ? '⚔️' : (session.role === 'FACULTY' ? '🎓' : '🛡️');
        }

        const rolePill = $('loggedInRolePill');
        if (rolePill) {
            rolePill.className = `logged-in-role-pill role-${(session.role || 'STUDENT').toLowerCase()}`;
        }

        const hiddenRoleSelect = $('userRoleSelect');
        if (hiddenRoleSelect) hiddenRoleSelect.value = session.role || 'STUDENT';

        const curRole = (session.role || 'STUDENT').toUpperCase();
        document.body.setAttribute('data-user-role', curRole);
        document.querySelectorAll('[data-nav-role]').forEach(el => {
            const reqRoles = (el.getAttribute('data-nav-role') || '').split(',').map(r => r.trim().toUpperCase());
            if (curRole === 'ADMIN') {
                el.style.removeProperty('display');
            } else if (curRole === 'FACULTY') {
                if (reqRoles.includes('FACULTY')) {
                    el.style.removeProperty('display');
                } else {
                    el.style.setProperty('display', 'none', 'important');
                }
            } else {
                // STUDENT: Hide faculty, admin, and staff-only options
                if (reqRoles.includes('STUDENT')) {
                    el.style.removeProperty('display');
                } else {
                    el.style.setProperty('display', 'none', 'important');
                }
            }
        });

        // Admin Notification Bell HUD
        const adminBell = $('adminNotifBellBtn');
        const adminBadge = $('adminNotifBadge');
        if (adminBell) {
            if (curRole === 'ADMIN') {
                adminBell.style.display = 'inline-flex';
                const unreadCount = window.msotRBAC ? window.msotRBAC.getUnreadNotificationsCount() : 0;
                if (adminBadge) {
                    adminBadge.textContent = unreadCount;
                    adminBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
                }
            } else {
                adminBell.style.display = 'none';
            }
        }

        const avatar = $('headerAvatar');
        if (avatar) avatar.textContent = session.avatar || '⚔️';

        if (window.msotPlatform?.applyRolePermissions) {
            window.msotPlatform.applyRolePermissions(session.role || 'STUDENT');
        }

        if (window.msotPlatform?.updateHeaderStats) {
            window.msotPlatform.updateHeaderStats();
        }

        // Re-render active profile view if currently open
        if (window.location.hash === '#/profile' && window.msotPlatform?.renderStudentProfile) {
            window.msotPlatform.renderStudentProfile();
        }

        // Update logout button text and title
        document.querySelectorAll('.logout-btn').forEach(btn => {
            btn.innerHTML = '⎋ LOGOUT';
            btn.title = `Signed in as ${session.email} (${session.name})`;
        });

        // Once a valid session is applied, dismiss auth screen
        showAuthScreen(false);
        const curHash = (window.location.hash || '').toLowerCase();
        if (curHash === '#/login' || curHash === '#/signup' || !curHash || curHash === '#') {
            navigateToRoleDefault(session.role);
        }
    }

    function navigateToRoleDefault(role) {
        const cleanRole = (role || 'STUDENT').toUpperCase();
        if (cleanRole === 'FACULTY') {
            window.location.hash = '#/faculty';
        } else if (cleanRole === 'ADMIN') {
            window.location.hash = '#/admin';
        } else {
            window.location.hash = '#/dashboard';
        }
    }

    // ─── Supabase + Local Login ──────────────────────────────────────────────
    async function login(emailOrUsername, password, remember = true) {
        let inputVal = (emailOrUsername || '').trim();

        if (!inputVal || !password) {
            showLoginError('Please enter your college email or username and password.');
            return false;
        }

        // 1. Resolve username to email if input is not already an email address
        let email = inputVal.toLowerCase();
        if (!inputVal.includes('@') || !inputVal.includes('.')) {
            const cleanUser = inputVal.replace(/^@/, '').toLowerCase();
            const all = getAllAccounts();
            let foundEmail = null;
            for (const [em, acc] of Object.entries(all)) {
                const u = (acc.username || acc.alias || '').replace(/^@/, '').toLowerCase();
                if (u === cleanUser) {
                    foundEmail = em;
                    break;
                }
            }
            if (foundEmail) {
                email = foundEmail;
            }
        }

        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        const origBtnText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>⚡ CONNECTING TO SUPABASE...</span>';
        }

        let supaSession = null;
        let supaError = null;

        // 1. Direct Supabase Auth Login
        if (supabaseClient) {
            try {
                let { data, error } = await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) {
                    supaError = error;
                } else if (data?.session) {
                    supaSession = data.session;
                }
            } catch (err) {
                console.warn("Supabase network error:", err);
                supaError = err;
            }
        }

        // 2. Demo accounts check
        const builtIn = BUILTIN_USERS[email];
        if (!supaSession && builtIn && password === DEFAULT_PASS && supabaseClient) {
            try {
                const retry = await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: builtIn.name,
                            username: builtIn.username,
                            studentId: builtIn.studentId,
                            year: builtIn.year,
                            semester: builtIn.semester,
                            section: builtIn.section,
                            role: builtIn.role,
                            requested_role: builtIn.role,
                            approval_status: 'APPROVED',
                            avatar: builtIn.avatar,
                            track: builtIn.track
                        }
                    }
                });
                if (retry.data?.session) {
                    supaSession = retry.data.session;
                    supaError = null;
                }
            } catch(e) {}
        }

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origBtnText;
        }

        // Supabase login success!
        if (supaSession && supaSession.user) {
            const u = supaSession.user;
            const meta = u.user_metadata || {};
            const cleanUser = (meta.username || (builtIn ? builtIn.username : u.email.split('@')[0])).replace(/^@/, '');
            const rawName = meta.name || (builtIn ? builtIn.name : cleanUser);
            const isAdminAccount = (u.email?.toLowerCase() === 'admin@msot.edu' || meta.role === 'ADMIN' || (builtIn && builtIn.role === 'ADMIN'));
            const userRole = isAdminAccount ? 'ADMIN' : (meta.role || (builtIn ? builtIn.role : (currentLoginRole || 'STUDENT')));

            const session = {
                id: u.id,
                email: u.email,
                name: rawName,
                username: cleanUser,
                alias: `@${cleanUser}`,
                studentId: meta.studentId || (builtIn ? builtIn.studentId : `MSOT-${cleanUser.toUpperCase()}`),
                year: meta.year || (builtIn ? builtIn.year : '2nd Year'),
                semester: meta.semester || (builtIn ? builtIn.semester : 'Semester 4'),
                section: normalizeSection(meta.section || (builtIn ? builtIn.section : 'Section Alpha')),
                branch: meta.branch || (builtIn ? 'Computer Science & Engineering' : 'Computer Science & Engineering (CSE)'),
                phone: meta.phone || '',
                role: userRole,
                avatar: meta.avatar || (builtIn ? builtIn.avatar : (userRole === 'ADMIN' ? '🛡️' : (userRole === 'FACULTY' ? '🎓' : '⚔️'))),
                track: meta.track || (builtIn ? builtIn.track : 'C++ Algorithms & DSA'),
                loginAt: new Date().toISOString(),
                isSupabase: true
            };

            // Check Approval Status (Supabase Profiles + Local RBAC store)
            let approvalStatus = (builtIn && builtIn.approval_status) || (isAdminAccount ? 'APPROVED' : (meta.approval_status || 'PENDING'));
            let profileRole = userRole;
            let rejectionReason = meta.rejection_reason || '';

            if (supabaseClient && u.id) {
                try {
                    const { data: prof, error: profErr } = await supabaseClient
                        .from('profiles')
                        .select('role, requested_role, approval_status, rejection_reason')
                        .eq('id', u.id)
                        .maybeSingle();
                    if (prof && !profErr) {
                        if (prof.approval_status) approvalStatus = prof.approval_status;
                        if (prof.role) profileRole = prof.role;
                        if (prof.rejection_reason) rejectionReason = prof.rejection_reason;
                    }
                } catch (pe) {
                    console.warn("Supabase profile check:", pe);
                }
            }

            if (window.msotRBAC) {
                const rbacUser = typeof window.msotRBAC.getUser === 'function' ? window.msotRBAC.getUser(email) : (typeof window.msotRBAC.getUserByEmail === 'function' ? window.msotRBAC.getUserByEmail(email) : null);
                if (rbacUser) {
                    if (rbacUser.approval_status) approvalStatus = rbacUser.approval_status;
                    if (rbacUser.role) profileRole = rbacUser.role;
                    if (rbacUser.rejection_reason) rejectionReason = rbacUser.rejection_reason;
                }
            }

            approvalStatus = String(approvalStatus).toUpperCase();
            if (isAdminAccount) approvalStatus = 'APPROVED';

            // 1. Pending Approval Check
            if (approvalStatus === 'PENDING') {
                showAccountStatusModal('PENDING', {
                    name: rawName,
                    email: u.email,
                    requestedRole: meta.requested_role || profileRole,
                    status: 'PENDING'
                });
                clearSession();
                if (supabaseClient) {
                    try { await supabaseClient.auth.signOut(); } catch(e){}
                }
                return false;
            }

            // 2. Rejected Registration Check
            if (approvalStatus === 'REJECTED') {
                showAccountStatusModal('REJECTED', {
                    name: rawName,
                    email: u.email,
                    requestedRole: meta.requested_role || profileRole,
                    reason: rejectionReason,
                    status: 'REJECTED'
                });
                clearSession();
                if (supabaseClient) {
                    try { await supabaseClient.auth.signOut(); } catch(e){}
                }
                return false;
            }

            // 3. Suspended Account Check
            if (approvalStatus === 'SUSPENDED') {
                showAccountStatusModal('SUSPENDED', {
                    name: rawName,
                    email: u.email,
                    requestedRole: profileRole,
                    status: 'SUSPENDED'
                });
                clearSession();
                if (supabaseClient) {
                    try { await supabaseClient.auth.signOut(); } catch(e){}
                }
                return false;
            }

            // Inactive Account Check
            const localAccs = getStoredAccounts();
            if (localAccs[email.toLowerCase()] && localAccs[email.toLowerCase()].status === 'INACTIVE') {
                showLoginError('⚠️ Account Inactive: This account has been deactivated by the System Administrator.');
                if (window.miraiAudio) window.miraiAudio.playError?.();
                clearSession();
                return false;
            }

            session.approval_status = 'APPROVED';
            session.role = profileRole;

            // Strict Role-Based Portal Validation (Prevents cross-role privilege escalation)
            const actualRole = (session.role || 'STUDENT').toUpperCase();
            if (currentLoginRole && actualRole !== currentLoginRole) {
                showLoginError(`⚠️ Role Access Mismatch: Account [${email}] is registered as [${actualRole}]. You cannot sign in through the ${currentLoginRole} Portal. Please click "Change Role" above and log in via the ${actualRole} Login portal.`);
                if (window.miraiAudio) window.miraiAudio.playError?.();
                clearSession();
                return false;
            }

            setSession(session, remember);
            applySessionToUI(session);
            showLoginSuccess('✅ Supabase Authentication Successful!');
            if (window.miraiAudio) window.miraiAudio.playSuccess?.();
            navigateToRoleDefault(session.role);
            return true;
        }

        // 3. Fallback to locally registered and builtin accounts (resilient authentication)
        const localAccounts = getAllAccounts();
        const localUser = localAccounts[email];
        if (localUser && localUser.password === password) {
            const cleanUser = (localUser.username || localUser.name || email.split('@')[0]).replace(/^@/, '');
            const rawName = localUser.name || cleanUser;
            const isAdminAccount = (email === 'admin@msot.edu' || localUser.role === 'ADMIN');
            const userRole = isAdminAccount ? 'ADMIN' : (localUser.role || (currentLoginRole || 'STUDENT'));

            // Approval check for local fallback
            let localApproval = localUser.approval_status || (isAdminAccount ? 'APPROVED' : 'PENDING');
            if (window.msotRBAC) {
                const rbacUser = typeof window.msotRBAC.getUser === 'function' ? window.msotRBAC.getUser(email) : (typeof window.msotRBAC.getUserByEmail === 'function' ? window.msotRBAC.getUserByEmail(email) : null);
                if (rbacUser && rbacUser.approval_status) localApproval = rbacUser.approval_status;
            }
            localApproval = String(localApproval).toUpperCase();
            if (isAdminAccount) localApproval = 'APPROVED';

            if (localApproval === 'PENDING') {
                showAccountStatusModal('PENDING', {
                    name: rawName,
                    email: localUser.email,
                    requestedRole: localUser.requested_role || userRole,
                    status: 'PENDING'
                });
                clearSession();
                return false;
            }
            if (localApproval === 'REJECTED') {
                showAccountStatusModal('REJECTED', {
                    name: rawName,
                    email: localUser.email,
                    requestedRole: localUser.requested_role || userRole,
                    reason: localUser.rejection_reason || '',
                    status: 'REJECTED'
                });
                clearSession();
                return false;
            }
            if (localApproval === 'SUSPENDED') {
                showAccountStatusModal('SUSPENDED', {
                    name: rawName,
                    email: localUser.email,
                    requestedRole: userRole,
                    status: 'SUSPENDED'
                });
                clearSession();
                return false;
            }

            const session = {
                id: localUser.id || `local_${email}`,
                email: localUser.email,
                name: rawName,
                username: cleanUser,
                alias: `@${cleanUser}`,
                studentId: localUser.studentId || `MSOT-${cleanUser.toUpperCase()}`,
                year: localUser.year || '2nd Year',
                semester: localUser.semester || 'Semester 4',
                section: normalizeSection(localUser.section || 'Section Alpha'),
                branch: localUser.branch || 'Computer Science & Engineering (CSE)',
                phone: localUser.phone || '',
                role: userRole,
                approval_status: 'APPROVED',
                avatar: localUser.avatar || (userRole === 'ADMIN' ? '🛡️' : (userRole === 'FACULTY' ? '🎓' : '⚔️')),
                track: localUser.track || 'C++ Algorithms & DSA',
                loginAt: new Date().toISOString()
            };

            // Inactive Account Check
            if (localUser.status === 'INACTIVE') {
                showLoginError('⚠️ Account Inactive: This account has been deactivated by the System Administrator.');
                if (window.miraiAudio) window.miraiAudio.playError?.();
                clearSession();
                return false;
            }

            // Strict Role-Based Portal Validation
            const actualRole = (session.role || 'STUDENT').toUpperCase();
            if (currentLoginRole && actualRole !== currentLoginRole) {
                showLoginError(`⚠️ Role Access Mismatch: Account [${email}] is registered as [${actualRole}]. You cannot sign in through the ${currentLoginRole} Portal. Please click "Change Role" above and log in via the ${actualRole} Login portal.`);
                if (window.miraiAudio) window.miraiAudio.playError?.();
                clearSession();
                return false;
            }

            setSession(session, remember);
            applySessionToUI(session);
            if (window.miraiAudio) window.miraiAudio.playSuccess?.();
            navigateToRoleDefault(session.role);
            return true;
        }

        // 4. Report error from Supabase
        let errorMsg = 'Invalid email/username or password. Please verify credentials or click "Register Cadet" above.';
        if (supaError) {
            if (supaError.message?.includes('Email not confirmed')) {
                errorMsg = '⚡ Supabase: Email not confirmed. Please retry password.';
            } else if (supaError.message?.includes('Invalid login credentials')) {
                errorMsg = 'Invalid email/username or password. New Cadets should click "Register Cadet" tab above.';
            } else {
                errorMsg = `Supabase: ${supaError.message || supaError}`;
            }
        }

        showLoginError(errorMsg);
        if (window.miraiAudio) window.miraiAudio.playError?.();
        return false;
    }

    // ─── Supabase + Local Registration ───────────────────────────────────────
    async function register(data) {
        const name = (data.name || '').trim();
        const rawUsername = (data.username || '').trim();
        const username = rawUsername.replace(/^@/, '').trim().toLowerCase();
        const studentId = (data.studentId || '').trim();
        const email = (data.email || '').trim().toLowerCase();
        const year = data.year || '2nd Year';
        const semester = data.semester || 'Semester 4';
        const section = normalizeSection(data.section || 'Section Alpha');
        const password = data.password || '';
        const confirmPassword = data.confirmPassword || '';
        if ((data.role || '').toUpperCase() === 'ADMIN') {
            showRegisterError('Security Alert: Administrative accounts cannot be registered publicly. System security violation.');
            if (window.miraiAudio) window.miraiAudio.playError?.();
            return false;
        }

        const requestedRole = (data.role || '').toUpperCase() === 'FACULTY' ? 'FACULTY' : 'STUDENT';
        const role = requestedRole;
        const track = data.track || 'C++ Algorithms & DSA';
        const avatar = data.avatar || '⚔️';

        const branch = (data.branch || 'Computer Science & Engineering (CSE)').trim();
        const phone = (data.phone || '').trim();

        if (!name) {
            showRegisterError('Please enter your full name.');
            return false;
        }

        if (!username || username.length < 3) {
            showRegisterError('Please enter a unique username (at least 3 characters).');
            return false;
        }

        if (!/^[a-z0-9_.-]+$/.test(username)) {
            showRegisterError('Username can only contain letters, numbers, underscores, dots, or dashes.');
            return false;
        }

        if (isUsernameTaken(username)) {
            showRegisterError(`Username "@${username}" is already claimed by another student. Every cadet must have a unique username.`);
            if (window.miraiAudio) window.miraiAudio.playError?.();
            return false;
        }

        if (!studentId) {
            showRegisterError('Please enter your Student ID / Roll Number (e.g. MSOT-2026-089).');
            return false;
        }

        if (!email || !email.includes('@')) {
            showRegisterError('Please enter a valid Gmail or college email address.');
            return false;
        }

        if (password.length < 6) {
            showRegisterError('Password must contain at least 6 characters for Supabase.');
            return false;
        }

        if (password !== confirmPassword) {
            showRegisterError('Passwords do not match. Please re-type carefully.');
            return false;
        }

        // Submit button loading indicator
        const submitBtn = document.querySelector('#registerForm button[type="submit"]');
        const origBtnText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>⚡ SUBMITTING FOR APPROVAL...</span>';
        }

        let supaUser = null;
        let supaSession = null;
        let supaError = null;

        // Step 1: Use Supabase Client Auth to create user with requested_role and pending status
        const userMetadata = {
            name,
            username,
            alias: `@${username}`,
            studentId,
            year,
            semester,
            section,
            branch,
            phone,
            role: requestedRole,
            requested_role: requestedRole,
            approval_status: 'PENDING',
            track,
            avatar
        };

        if (supabaseClient) {
            try {
                const { data: authData, error } = await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: { data: userMetadata }
                });

                if (error) {
                    if (
                        error.message?.includes('already registered') ||
                        error.message?.includes('User already registered') ||
                        error.status === 422
                    ) {
                        supaError = new Error("This email is already registered in the system. Please sign in with your password, or use a different email.");
                    } else if (error.message?.includes('rate limit')) {
                        console.warn("Supabase rate limited, saving registration locally");
                        supaError = null;
                    } else {
                        supaError = error;
                    }
                } else if (authData?.user) {
                    supaUser = authData.user;
                    supaSession = authData.session;
                }
            } catch (err) {
                console.warn("Supabase signup error:", err);
                supaError = err;
            }
        }

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origBtnText;
        }

        if (supaError) {
            showRegisterError(`Registration: ${supaError.message || supaError}`);
            if (window.miraiAudio) window.miraiAudio.playError?.();
            return false;
        }

        // Step 2: Sync to Supabase profiles table with approval_status = 'pending'
        if (supabaseClient && supaUser?.id) {
            try {
                await supabaseClient.from('profiles').upsert({
                    id: supaUser.id,
                    email: email,
                    display_name: name,
                    full_name: name,
                    username: username,
                    student_id: studentId,
                    role: requestedRole.toLowerCase(),
                    requested_role: requestedRole.toLowerCase(),
                    approval_status: 'pending',
                    status: 'pending',
                    year: year,
                    semester: semester,
                    section: section,
                    branch: branch,
                    phone: phone,
                    avatar: avatar,
                    track: track,
                    updated_at: new Date().toISOString()
                });
            } catch (pe) {
                console.warn("Supabase profile sync note:", pe);
            }
        }

        // Step 3: Create Persistent Admin Notification
        const notifData = {
            id: 'notif_' + Date.now(),
            type: 'REGISTRATION_REQUEST',
            user_id: supaUser?.id || `cadet_${Date.now()}`,
            user_name: name,
            user_email: email,
            requested_role: requestedRole,
            title: `New ${requestedRole === 'FACULTY' ? 'Faculty' : 'Student'} registration requires approval.`,
            message: `${name} (${email}) submitted registration for ${requestedRole} role and is awaiting administrative verification.`,
            read: false,
            created_at: new Date().toISOString()
        };

        if (window.msotRBAC && window.msotRBAC.addAdminNotification) {
            window.msotRBAC.addAdminNotification(notifData);
        }

        if (supabaseClient) {
            try {
                await supabaseClient.from('admin_notifications').insert({
                    type: 'REGISTRATION_REQUEST',
                    user_id: supaUser?.id || null,
                    user_name: name,
                    user_email: email,
                    requested_role: requestedRole,
                    title: `New ${requestedRole === 'FACULTY' ? 'Faculty' : 'Student'} registration requires approval.`,
                    message: `${name} (${email}) submitted registration for ${requestedRole} role and is awaiting administrative verification.`,
                    read: false
                });
            } catch (ne) {
                console.warn("Supabase notification insert note:", ne);
            }
        }

        // Step 4: Save account persistently in local store with status PENDING
        const newAccount = {
            id: supaUser?.id || `cadet_${Date.now()}`,
            email,
            name,
            username,
            alias: `@${username}`,
            studentId,
            year,
            semester,
            section,
            branch,
            phone,
            password,
            role: requestedRole,
            requested_role: requestedRole,
            approval_status: 'PENDING',
            status: 'PENDING',
            track,
            avatar,
            registeredAt: new Date().toISOString(),
            isSupabase: !!supaUser
        };
        saveAccount(newAccount);

        // Step 5: Enforce that user CANNOT access protected dashboard before approval
        clearSession();
        if (supabaseClient) {
            try { await supabaseClient.auth.signOut(); } catch(e){}
        }

        // Step 6: Render clear pending approval modal with exact required message
        showAccountStatusModal('PENDING', {
            name,
            email,
            requestedRole,
            status: 'PENDING'
        });

        showRegisterSuccess('✅ Registration submitted successfully! Waiting for Admin approval.');
        if (window.miraiAudio) window.miraiAudio.playSuccess?.();

        return true;
    }

    async function logout() {
        if (supabaseClient) {
            try {
                await supabaseClient.auth.signOut();
            } catch (e) {}
        }
        clearSession();
        if (window.msotAuth) window.msotAuth.session = null;

        if (window.msotState) {
            window.msotState.currentUserEmail = null;
        }

        showAuthScreen(true);
        showPortalSelector();
        switchAuthTab('signin');
        window.location.hash = '#/login';

        document.querySelectorAll('.logout-btn').forEach(btn => {
            btn.innerHTML = '🔑 SIGN IN';
            btn.title = 'Access MSOT Learn';
        });

        $('loginEmail')?.focus();
    }

    window.msotAuth = {
        login,
        register,
        logout,
        switchAuthTab,
        showAuthScreen,
        selectLoginRole,
        showPortalSelector,
        showAccountStatusModal,
        closeAccountStatusModal,
        ensureDefaultStudentSession,
        get currentLoginRole() { return currentLoginRole; },
        set currentLoginRole(r) { currentLoginRole = (r || 'STUDENT').toUpperCase(); },
        isUsernameTaken,
        get session() { return activeSession || getSession(); },
        set session(s) { activeSession = s; },
        supabaseClient
    };

    // ─── Initialize Listeners & Session Recovery on DOM Load ─────────────────
    window.addEventListener('DOMContentLoaded', async () => {
        // 1. Try restoring session from Supabase
        activeSession = null;
        if (supabaseClient) {
            try {
                const { data } = await supabaseClient.auth.getSession();
                if (data?.session?.user) {
                    const u = data.session.user;
                    const meta = u.user_metadata || {};
                    const cleanUser = (meta.username || u.email.split('@')[0]).replace(/^@/, '');
                    const rawName = meta.name || cleanUser;
                    const isAdminAccount = (u.email?.toLowerCase() === 'admin@msot.edu' || meta.role === 'ADMIN');
                    const userRole = isAdminAccount ? 'ADMIN' : (meta.role || 'STUDENT');

                    let approvalStatus = isAdminAccount ? 'APPROVED' : (meta.approval_status || 'PENDING');
                    let rejectionReason = meta.rejection_reason || '';

                    try {
                        const { data: prof } = await supabaseClient
                            .from('profiles')
                            .select('role, requested_role, approval_status, rejection_reason')
                            .eq('id', u.id)
                            .maybeSingle();
                        if (prof) {
                            if (prof.approval_status) approvalStatus = prof.approval_status;
                            if (prof.rejection_reason) rejectionReason = prof.rejection_reason;
                        }
                    } catch (pe) {}

                    if (window.msotRBAC) {
                        const rbacUser = typeof window.msotRBAC.getUser === 'function' ? window.msotRBAC.getUser(u.email) : (typeof window.msotRBAC.getUserByEmail === 'function' ? window.msotRBAC.getUserByEmail(u.email) : null);
                        if (rbacUser && rbacUser.approval_status) approvalStatus = rbacUser.approval_status;
                    }

                    approvalStatus = String(approvalStatus).toUpperCase();
                    if (isAdminAccount) approvalStatus = 'APPROVED';

                    if (approvalStatus !== 'APPROVED') {
                        clearSession();
                        activeSession = null;
                        if (supabaseClient) {
                            try { await supabaseClient.auth.signOut(); } catch (e) {}
                        }
                        showAccountStatusModal(approvalStatus, {
                            name: rawName,
                            email: u.email,
                            requestedRole: meta.requested_role || userRole,
                            reason: rejectionReason,
                            status: approvalStatus
                        });
                        return;
                    }

                    activeSession = {
                        id: u.id,
                        email: u.email,
                        name: rawName,
                        username: cleanUser,
                        alias: `@${cleanUser}`,
                        studentId: meta.studentId || `MSOT-${cleanUser.toUpperCase()}`,
                        year: meta.year || '2nd Year',
                        semester: meta.semester || 'Semester 4',
                        section: normalizeSection(meta.section || 'Section Alpha'),
                        branch: meta.branch || 'Computer Science & Engineering (CSE)',
                        phone: meta.phone || '',
                        role: userRole,
                        approval_status: 'APPROVED',
                        avatar: meta.avatar || (userRole === 'ADMIN' ? '🛡️' : (userRole === 'FACULTY' ? '🎓' : '⚔️')),
                        track: meta.track || 'C++ Algorithms & DSA',
                        loginAt: new Date().toISOString(),
                        isSupabase: true
                    };
                    setSession(activeSession, true);
                }
            } catch (e) {
                console.warn("Supabase getSession note:", e);
            }
        }

        // 2. Fallback to local session
        if (!activeSession) {
            activeSession = getSession();
        }

        if (activeSession && activeSession.email !== 'admin@msot.edu') {
            const rbacUser = window.msotRBAC ? (typeof window.msotRBAC.getUser === 'function' ? window.msotRBAC.getUser(activeSession.email) : (typeof window.msotRBAC.getUserByEmail === 'function' ? window.msotRBAC.getUserByEmail(activeSession.email) : null)) : null;
            const curStatus = (rbacUser?.approval_status || activeSession.approval_status || 'APPROVED').toUpperCase();
            if (curStatus !== 'APPROVED') {
                clearSession();
                const invalidSess = activeSession;
                activeSession = null;
                showAccountStatusModal(curStatus, {
                    name: invalidSess.name,
                    email: invalidSess.email,
                    requestedRole: invalidSess.role,
                    reason: rbacUser?.rejection_reason || '',
                    status: curStatus
                });
                return;
            }
        }

        const curHash = (window.location.hash || '').toLowerCase();
        const isAuthRoute = (curHash === '#/login' || curHash === '#/signup');

        // 3. User session initialization & seamless access
        if (activeSession) {
            applySessionToUI(activeSession);
            if (isAuthRoute) {
                showAuthScreen(true);
                if (curHash === '#/signup') switchAuthTab('signup');
                else {
                    switchAuthTab('signin');
                    showPortalSelector();
                }
            } else {
                showAuthScreen(false);
            }
        } else {
            const isPublicRoute = (curHash === '#/gates' || curHash === '#/intro' || curHash === '#/about' || !curHash || curHash === '#');
            if (isAuthRoute) {
                showAuthScreen(true);
                if (curHash === '#/signup') {
                    switchAuthTab('signup');
                } else {
                    switchAuthTab('signin');
                    showPortalSelector();
                }
            } else if (isPublicRoute) {
                showAuthScreen(false);
            } else {
                // Protected route with no session -> redirect to login
                showAuthScreen(true);
                switchAuthTab('signin');
                showPortalSelector();
            }
        }

        // Auth Tabs toggle
        $('tabSignInBtn')?.addEventListener('click', () => switchAuthTab('signin'));
        $('tabSignUpBtn')?.addEventListener('click', () => switchAuthTab('signup'));
        $('switchToSignUpLink')?.addEventListener('click', (e) => { e.preventDefault(); switchAuthTab('signup'); });
        $('switchToSignInLink')?.addEventListener('click', (e) => { e.preventDefault(); switchAuthTab('signin'); });

        // Sign In Form submission
        $('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = $('loginEmail')?.value;
            const pass = $('loginPassword')?.value;
            const remember = $('rememberMe')?.checked ?? true;
            login(email, pass, remember);
        });

        // Sign Up Form submission
        $('registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const avatarSelected = document.querySelector('.avatar-choice-btn.selected')?.dataset.avatar || '⚔️';
            register({
                name: $('regName')?.value,
                username: $('regUsername')?.value,
                studentId: $('regStudentId')?.value,
                email: $('regEmail')?.value,
                year: $('regYear')?.value,
                semester: $('regSemester')?.value,
                section: $('regSection')?.value,
                branch: $('regBranch')?.value,
                phone: $('regPhone')?.value,
                password: $('regPassword')?.value,
                confirmPassword: $('regConfirmPassword')?.value,
                role: $('regRole')?.value,
                track: $('regTrack')?.value,
                avatar: avatarSelected
            });
        });

        // Avatar selector clicks
        document.querySelectorAll('.avatar-choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.avatar-choice-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                const prev = $('regAvatarPreview');
                if (prev) prev.textContent = btn.dataset.avatar;
            });
        });

        // Password visibility toggles
        $('passwordToggle')?.addEventListener('click', () => {
            const input = $('loginPassword');
            if (input) input.type = input.type === 'password' ? 'text' : 'password';
        });

        $('regPasswordToggle')?.addEventListener('click', () => {
            const input = $('regPassword');
            if (input) input.type = input.type === 'password' ? 'text' : 'password';
        });

        // 1-Click Demo Badges
        document.querySelectorAll('[data-demo-email]').forEach(btn => {
            btn.addEventListener('click', () => {
                login(btn.dataset.demoEmail, DEFAULT_PASS, true);
            });
        });

        // Logout buttons (desktop header + mobile drawer)
        document.querySelectorAll('.logout-btn, #logoutBtn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        });

        // Forgot password modal
        const forgotModal = $('forgotPasswordModal');
        $('forgotPasswordBtn')?.addEventListener('click', () => {
            if (forgotModal) {
                forgotModal.classList.add('active');
                forgotModal.style.setProperty('display', 'flex', 'important');
                forgotModal.style.setProperty('pointer-events', 'auto', 'important');
                forgotModal.style.setProperty('visibility', 'visible', 'important');
            }
        });
        $('closeForgotModalBtn')?.addEventListener('click', () => {
            if (forgotModal) {
                forgotModal.classList.remove('active');
                forgotModal.style.setProperty('display', 'none', 'important');
                forgotModal.style.setProperty('pointer-events', 'none', 'important');
                forgotModal.style.setProperty('visibility', 'hidden', 'important');
            }
        });
        $('forgotPasswordForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = $('forgotEmail')?.value?.trim();
            const feedback = $('forgotFeedback');
            if (feedback) {
                feedback.style.display = 'block';
                feedback.innerHTML = '⚡ Dispatching recovery protocol...';
            }
            if (email && supabaseClient) {
                try {
                    await supabaseClient.auth.resetPasswordForEmail(email);
                } catch (err) {
                    console.warn("Supabase reset note:", err);
                }
            }
            if (feedback) {
                feedback.innerHTML = `⚡ <strong>Reset Link Dispatched:</strong> Recovery instructions sent to <b>${email || 'your email'}</b>. Check your inbox.`;
            }
        });
    });
})();
