/**
 * MSOT LEARN — Academy Authentication & Cadet Registration System
 * Features:
 * - Dual-mode: Sign In and Register Cadet (Sign Up)
 * - Built-in demo accounts (Student, Faculty, Admin)
 * - Persistent local account registration stored in localStorage
 * - Avatar selection gallery (8 anime/cyber badges)
 * - Role & Track specialization assignment
 * - Remember me persistence & secure session recovery
 * - Reactive HUD and state synchronization
 */

(function () {
    const SESSION_KEY = 'MSOT_LEARN_AUTH_SESSION_V1';
    const ACCOUNTS_KEY = 'MSOT_LEARN_ACCOUNTS_V2';
    const DEFAULT_PASS = 'msot1234';

    const BUILTIN_USERS = {
        'student@msot.edu': {
            email: 'student@msot.edu',
            name: 'Utkarsh Raj',
            role: 'STUDENT',
            avatar: '⚔️',
            track: 'C++ Algorithms & DSA',
            password: DEFAULT_PASS
        },
        'faculty@msot.edu': {
            email: 'faculty@msot.edu',
            name: 'Prof. Kenji Takahashi',
            role: 'FACULTY',
            avatar: '🎓',
            track: 'Faculty Instruction & Review',
            password: DEFAULT_PASS
        },
        'admin@msot.edu': {
            email: 'admin@msot.edu',
            name: 'MSOT Administrator',
            role: 'ADMIN',
            avatar: '🛡️',
            track: 'System Governance',
            password: DEFAULT_PASS
        }
    };

    const $ = id => document.getElementById(id);

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

    function saveAccount(acc) {
        try {
            const stored = getStoredAccounts();
            stored[acc.email.toLowerCase()] = acc;
            localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(stored));
        } catch (e) {
            console.warn("Could not save account to localStorage:", e);
        }
    }

    function getSession() {
        try {
            const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
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
        } catch (e) {}
    }

    function clearSession() {
        try {
            localStorage.removeItem(SESSION_KEY);
            sessionStorage.removeItem(SESSION_KEY);
        } catch (e) {}
    }

    function showAuthScreen(show) {
        const screen = $('authScreen');
        if (screen) {
            screen.classList.toggle('hidden', !show);
        }
        document.body.classList.toggle('auth-locked', show);
    }

    function showLoginError(msg) {
        const el = $('loginError');
        if (el) {
            el.textContent = msg;
            el.classList.add('show');
            setTimeout(() => el.classList.remove('show'), 6000);
        }
    }

    function showRegisterError(msg) {
        const el = $('registerError');
        if (el) {
            el.textContent = msg;
            el.classList.add('show');
            setTimeout(() => el.classList.remove('show'), 6000);
        }
    }

    function switchAuthTab(tab) {
        const signInBtn = $('tabSignInBtn');
        const signUpBtn = $('tabSignUpBtn');
        const signInPane = $('signInPane');
        const signUpPane = $('signUpPane');

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
            $('loginEmail')?.focus();
        }
    }

    function applySessionToUI(session) {
        if (!session) return;
        window.msotAuth.session = session;

        // Sync with Platform State
        if (window.msotState) {
            if (window.msotState.student) {
                window.msotState.student.name = session.name;
                window.msotState.student.avatar = session.avatar || '⚔️';
                window.msotState.student.email = session.email;
            }
            if (window.msotState.setRole) {
                window.msotState.setRole(session.role);
            }
        }

        // Sync header controls
        const roleSelect = $('userRoleSelect');
        if (roleSelect) roleSelect.value = session.role;

        const roleIcon = $('roleIconIndicator');
        if (roleIcon) {
            roleIcon.textContent = session.role === 'STUDENT' ? '⚔️' : (session.role === 'FACULTY' ? '🎓' : '🛡️');
        }

        const avatar = $('headerAvatar');
        if (avatar) avatar.textContent = session.avatar || '⚔️';

        if (window.msotPlatform?.updateHeaderStats) {
            window.msotPlatform.updateHeaderStats();
        }

        showAuthScreen(false);
    }

    function login(email, password, remember = true) {
        email = (email || '').trim().toLowerCase();
        const accounts = getAllAccounts();
        const user = accounts[email];

        if (!user || user.password !== password) {
            showLoginError('Invalid academy credentials. Check password or use 1-click Demo below.');
            if (window.miraiAudio) window.miraiAudio.playFail?.();
            return false;
        }

        const session = {
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar || '⚔️',
            track: user.track || 'C++ Algorithms & DSA',
            loginAt: new Date().toISOString()
        };

        setSession(session, remember);
        applySessionToUI(session);

        if (window.miraiAudio) window.miraiAudio.playSuccess?.();

        // Navigate to appropriate section based on role
        if (session.role === 'FACULTY') {
            window.location.hash = '#/faculty';
        } else if (session.role === 'ADMIN') {
            window.location.hash = '#/admin';
        } else {
            if (window.location.hash === '#/login' || window.location.hash === '#/signup' || !window.location.hash) {
                window.location.hash = '#/gates';
            }
        }

        return true;
    }

    function register(data) {
        const name = (data.name || '').trim();
        const email = (data.email || '').trim().toLowerCase();
        const password = data.password || '';
        const confirmPassword = data.confirmPassword || '';
        const role = data.role || 'STUDENT';
        const track = data.track || 'C++ Algorithms & DSA';
        const avatar = data.avatar || '⚔️';

        if (!name) {
            showRegisterError('Please enter your full name or cadet codename.');
            return false;
        }

        if (!email || !email.includes('@')) {
            showRegisterError('Please enter a valid academy or personal email address.');
            return false;
        }

        if (password.length < 4) {
            showRegisterError('Password must contain at least 4 characters.');
            return false;
        }

        if (password !== confirmPassword) {
            showRegisterError('Passwords do not match. Please re-type carefully.');
            return false;
        }

        const accounts = getAllAccounts();
        if (accounts[email]) {
            showRegisterError('An account with this email already exists. Sign in instead.');
            return false;
        }

        // Save new user account
        const newAccount = {
            email,
            name,
            password,
            role,
            track,
            avatar,
            registeredAt: new Date().toISOString()
        };

        saveAccount(newAccount);

        // Immediate Login
        const session = {
            email: newAccount.email,
            name: newAccount.name,
            role: newAccount.role,
            avatar: newAccount.avatar,
            track: newAccount.track,
            loginAt: new Date().toISOString()
        };

        setSession(session, true);
        applySessionToUI(session);

        if (window.miraiAudio) window.miraiAudio.playSuccess?.();
        window.location.hash = '#/gates';
        return true;
    }

    function logout() {
        clearSession();
        window.msotAuth.session = null;
        showAuthScreen(true);
        switchAuthTab('signin');
        window.location.hash = '#/login';
        $('loginEmail')?.focus();
    }

    window.msotAuth = {
        login,
        register,
        logout,
        switchAuthTab,
        showAuthScreen,
        session: getSession()
    };

    // Initialize listeners on DOM load
    window.addEventListener('DOMContentLoaded', () => {
        let session = getSession();

        if (!session) {
            // Auto-initialize demo cadet session so platform and arcade routes are fully unlocked
            session = {
                email: 'student@msot.edu',
                name: 'Utkarsh Raj',
                role: 'STUDENT',
                avatar: '⚔️',
                track: 'C++ Algorithms & DSA',
                loginAt: new Date().toISOString()
            };
            setSession(session, true);
        }

        applySessionToUI(session);

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
                email: $('regEmail')?.value,
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

        // Logout button
        $('logoutBtn')?.addEventListener('click', logout);

        // Forgot password modal
        const forgotModal = $('forgotPasswordModal');
        $('forgotPasswordBtn')?.addEventListener('click', () => {
            if (forgotModal) forgotModal.classList.add('active');
        });
        $('closeForgotModalBtn')?.addEventListener('click', () => {
            if (forgotModal) forgotModal.classList.remove('active');
        });
        $('forgotPasswordForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const feedback = $('forgotFeedback');
            if (feedback) {
                feedback.style.display = 'block';
                feedback.innerHTML = '⚡ <strong>Reset Link Dispatched:</strong> Instructions sent to your email. (Demo hint: default password is <code>msot1234</code>).';
            }
        });
    });
})();
