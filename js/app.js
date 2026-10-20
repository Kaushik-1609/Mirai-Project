/**
 * Mirai School of Technology - Main Application Controller & Direct Route Manager
 */

// ─── Supabase Client (Integration Ready) ──────────────────────────────────────
const SUPABASE_URL = "https://zsxdsyfjlxtcunhqgcdj.supabase.co";
const SUPABASE_KEY = "sb_publishable_9-cjPrufltHmmdOcI5A_IA_JqQFZxG6";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzeGRzeWZqbHh0Y3VuaHFnY2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1MTI0OTksImV4cCI6MjEwNzA4ODQ5OX0.n223hw6kl5iuAEz5llQ6BBhhtXRQkKHU86n2gf_lD8k";

var appSupabase = window.supabaseClient || null;
try {
    if (!appSupabase && window.supabase?.createClient) {
        appSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY || SUPABASE_ANON_KEY);
    }
} catch (err) {
    console.warn("Supabase init note:", err.message);
}

// ─── Route Registry ──────────────────────────────────────────────────────────
const ROUTE_MAP = {
    '#/dashboard': { section: 'dashboardSection', title: 'Dashboard Today • MSOT Learn' },
    '#/gates':     { section: 'dashboardSection', title: 'Dashboard Today • MSOT Learn' },
    '#/home':      { section: 'dashboardSection', title: 'Dashboard Today • MSOT Learn' },
    '#/arcade':    { section: 'arcadeSection',   title: '17 Sacred Trials • MSOT Learn' },
    '#/daily':     { section: 'dailySection',    title: 'Daily Speed Trial • MSOT Learn' },
    '#/leagues':   { section: 'leaguesSection',  title: 'Cadet Leagues & Fairness • MSOT Learn' },
    '#/league':    { section: 'leaguesSection',  title: 'Cadet Leagues & Fairness • MSOT Learn' },
    '#/guild':     { section: 'leaguesSection',  title: 'My Guild • MSOT Learn', guildTab: 'my-guild' },
    '#/guilds':    { section: 'leaguesSection',  title: 'Find Guilds • MSOT Learn', guildTab: 'find-guild' },
    '#/battles':   { section: 'leaguesSection',  title: 'Guild Battles • MSOT Learn', guildTab: 'guild-battles' },
    '#/rankings':  { section: 'leaguesSection',  title: 'Guild Rankings • MSOT Learn', guildTab: 'guild-rankings' },
    '#/assignments': { section: 'assignmentsSection', title: 'Weekend Assignments & Compiler • MSOT Learn' },
    '#/assignment':  { section: 'assignmentsSection', title: 'Weekend Assignments & Compiler • MSOT Learn' },
    '#/compiler':    { section: 'assignmentsSection', title: 'Weekend Assignments & Compiler • MSOT Learn' },
    '#/guild-war': { section: 'battleSection',   title: 'Battle Arena • MSOT Learn' },
    '#/battle':    { section: 'battleSection',   title: 'Battle Arena • MSOT Learn' },
    '#/faculty':             { section: 'facultySection',  title: 'Faculty Dashboard • MSOT Learn', facultyTab: 'overview' },
    '#/faculty/assignments': { section: 'facultySection',  title: 'Faculty Coursework • MSOT Learn', facultyTab: 'assignments' },
    '#/faculty-assignments': { section: 'facultySection',  title: 'Faculty Coursework • MSOT Learn', facultyTab: 'assignments' },
    '#/faculty/submissions': { section: 'facultySection',  title: 'Faculty Submissions • MSOT Learn', facultyTab: 'submissions' },
    '#/faculty/students':    { section: 'facultySection',  title: 'Faculty Student Roster • MSOT Learn', facultyTab: 'students' },
    '#/admin':     { section: 'adminSection',    title: 'Admin XP Economy Rules • MSOT Learn' },
    '#/xp-rules':  { section: 'adminSection',    title: 'Admin XP Economy Rules • MSOT Learn' },
    '#/about':     { section: 'aboutSection',    title: 'About Academy & Pedagogy • MSOT Learn', allowedRoles: ['STUDENT', 'FACULTY', 'ADMIN'] },
    '#/profile':   { section: 'profileSection',  title: 'Cadet Profile & Dossier • MSOT Learn' },
    '#/beta':      { section: 'betaSection',     title: 'Beta AI Learning Companion • MSOT Learn' },
    '#/tracker':   { section: 'trackerSection',  title: 'Study & Coding Tracker • MSOT Learn' },
    '#/study-tracker': { section: 'trackerSection', title: 'Study & Coding Tracker • MSOT Learn' },
    '#/rewards':   { section: 'storeSection',    title: 'Reward Store • MSOT Learn' },
    '#/store':     { section: 'storeSection',    title: 'Reward Store • MSOT Learn' },
    '#/login':     { authMode: 'signin',         title: 'Sign In • MSOT Learn' },
    '#/signup':    { authMode: 'signup',         title: 'Register Cadet • MSOT Learn' },
    '#/intro':     { section: 'dashboardSection', title: 'Cadet Dashboard • MSOT Learn', isIntro: true }
};

const SECTION_TO_HASH = {
    'dashboardSection':   '#/dashboard',
    'heroSection':        '#/gates',
    'betaSection':        '#/beta',
    'trackerSection':     '#/tracker',
    'storeSection':       '#/rewards',
    'arcadeSection':      '#/arcade',
    'dailySection':       '#/daily',
    'assignmentsSection': '#/assignments',
    'leaguesSection':     '#/leagues',
    'battleSection':      '#/battle',
    'facultySection':     '#/faculty',
    'adminSection':       '#/admin',
    'aboutSection':       '#/about',
    'profileSection':     '#/profile'
};

let _gateEngine = null;

window.updateNavRoleVisibility = function () {
    const session = window.msotAuth?.session;
    const isTrueAdmin = (window.msotPlatform && typeof window.msotPlatform.isVerifiedAdmin === 'function')
        ? window.msotPlatform.isVerifiedAdmin(session)
        : (session?.baseRole === 'ADMIN' || session?.role === 'ADMIN' || session?.email === 'admin@msot.edu' || session?.email === 'utkarshraj142006@gmail.com');
    const role = (window.msotPlatform?.activeRole || (window.msotRBAC ? window.msotRBAC.getCurrentRole() : (window.msotState?.currentRole || session?.role || 'STUDENT'))).toUpperCase();

    document.body.setAttribute('data-user-role', role);

    document.querySelectorAll('[data-nav-role]').forEach(el => {
        const reqRoles = (el.getAttribute('data-nav-role') || '').split(',').map(r => r.trim().toUpperCase());
        if (role === 'ADMIN') {
            el.style.removeProperty('display');
        } else if (role === 'FACULTY') {
            if (reqRoles.includes('FACULTY')) {
                el.style.removeProperty('display');
            } else {
                el.style.setProperty('display', 'none', 'important');
            }
        } else {
            // STUDENT: Completely hide Admin and Faculty navigation
            if (reqRoles.includes('STUDENT')) {
                el.style.removeProperty('display');
            } else {
                el.style.setProperty('display', 'none', 'important');
            }
        }
    });
};

// ─── Direct Unconditional Section Switcher ───────────────────────────────────
window.switchSection = function (sectionId, updateHash = true) {
    if (!sectionId || sectionId === 'heroSection') sectionId = 'dashboardSection';

    // Role-based navigation guard (Three-Role RBAC Enforcement)
    const effectiveRole = (window.msotRBAC ? window.msotRBAC.getCurrentRole() : (window.msotPlatform?.activeRole || window.msotState?.currentRole || window.msotAuth?.session?.role || 'STUDENT')).toUpperCase();
    if (sectionId === 'adminSection' && effectiveRole !== 'ADMIN') {
        console.warn('⚠️ Access Denied: The Admin Command Center is reserved for System Administrators.');
        if (typeof window.showToast === 'function') window.showToast('⚠️ Access Denied: Admin section is restricted.');
        sectionId = (effectiveRole === 'FACULTY') ? 'facultySection' : 'dashboardSection';
    } else if (sectionId === 'facultySection' && effectiveRole !== 'FACULTY' && effectiveRole !== 'ADMIN') {
        console.warn('⚠️ Access Denied: The Faculty Evaluation Section is reserved for Faculty and Administrators.');
        if (typeof window.showToast === 'function') window.showToast('⚠️ Access Denied: Faculty section is restricted.');
        sectionId = 'dashboardSection';
    }

    if (typeof window.updateNavRoleVisibility === 'function') {
        window.updateNavRoleVisibility();
    }

    // 1. Hide all sections completely (use display:none only — no opacity fighting)
    document.querySelectorAll('.app-section').forEach(sec => {
        sec.classList.remove('active');
        sec.style.display = 'none';
        sec.style.opacity = '';
    });

    // 2. Remove active state from all nav links
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(l => l.classList.remove('active'));

    // 3. Show target section immediately
    const targetSec = document.getElementById(sectionId);
    if (targetSec) {
        targetSec.classList.add('active');
        targetSec.style.display = (sectionId === 'heroSection') ? 'flex' : 'block';
        targetSec.style.opacity = '';
        if (sectionId === 'heroSection') {
            targetSec.classList.remove('gate-overlay-transition');
            const hw = document.getElementById('heroGateWrapper');
            if (hw) hw.classList.remove('gate-opening', 'gate-flythrough');
        }
        if (typeof window.scrollTo === 'function') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // 4. Highlight active nav link on both desktop & mobile
    const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');

    const activeMobileLink = document.querySelector(`.mobile-nav-link[data-section="${sectionId}"]`);
    if (activeMobileLink) activeMobileLink.classList.add('active');

    // 5. Reactive renders for dynamic views (isolated so errors never block UI switching)
    const p = window.msotPlatform || window.miraiPlatform;
    if (p) {
        try {
            if (sectionId === 'dashboardSection') {
                p.renderDashboard?.();
            } else if (sectionId === 'arcadeSection') {
                p.renderArcade?.();
            } else if (sectionId === 'assignmentsSection') {
                p.renderAssignments?.();
            } else if (sectionId === 'leaguesSection') {
                p.renderLeagues?.();
                p.renderFairnessBoards?.();
                p.renderQuests?.();
                const curRoute = typeof ROUTE_MAP !== 'undefined' ? ROUTE_MAP[(window.location.hash || '').toLowerCase()] : null;
                if (curRoute && curRoute.guildTab && window.msotGuild) {
                    window.msotGuild.switchLeagueSubTab(curRoute.guildTab);
                }
            } else if (sectionId === 'aboutSection') {
                p.renderAboutSection?.();
            } else if (sectionId === 'battleSection') {
                if (window.msotBattle && window.msotBattle.renderBattleArena) {
                    window.msotBattle.renderBattleArena();
                } else {
                    p.renderTeamBattles?.();
                }
            } else if (sectionId === 'dailySection') {
                p.renderDailyQuizCard?.();
            } else if (sectionId === 'facultySection') {
                const curRoute = typeof ROUTE_MAP !== 'undefined' ? ROUTE_MAP[(window.location.hash || '').toLowerCase()] : null;
                if (curRoute && curRoute.facultyTab && typeof p.switchFacultySubTab === 'function') {
                    p.switchFacultySubTab(curRoute.facultyTab);
                } else {
                    p.renderFacultyDashboard?.();
                }
            } else if (sectionId === 'adminSection') {
                p.renderAdminRules?.();
            } else if (sectionId === 'profileSection') {
                p.renderStudentProfile?.();
                p.renderBadgesVault?.();
                p.renderXPLedger?.();
            } else if (sectionId === 'betaSection') {
                if (window.msotBeta && typeof window.msotBeta.initView === 'function') {
                    window.msotBeta.initView();
                }
            } else if (sectionId === 'trackerSection') {
                if (window.msotTracker && typeof window.msotTracker.initView === 'function') {
                    window.msotTracker.initView();
                }
            } else if (sectionId === 'storeSection') {
                if (window.msotStore && typeof window.msotStore.initView === 'function') {
                    window.msotStore.initView();
                }
            }
        } catch (renderErr) {
            console.warn("Reactive section render note:", renderErr);
        }
    }

    // 6. CRITICAL: Force all scroll-reveal elements inside the active section to become
    //    immediately visible. IntersectionObserver won't fire for elements already at
    //    the top of the viewport on navigation, so we must force in-view manually.
    if (targetSec) {
        // Small delay to let dynamic renders (renderArcade etc) finish injecting DOM
        setTimeout(() => {
            targetSec.querySelectorAll(
                '.scroll-reveal, .stagger-item, .game-card, .faction-card, ' +
                '.daily-quiz-card, .dashboard-panel, .quest-full-card, ' +
                '.arcade-3d-showcase, .fairness-card, .faculty-metric-card, ' +
                '.admin-rule-card, .profile-dashboard-card, .xp-ledger-card, ' +
                '.badges-vault-card, .team-battle-card'
            ).forEach(el => {
                el.classList.add('in-view');
            });
        }, 80);
    }

    // 7. Sync URL hash cleanly
    if (updateHash && SECTION_TO_HASH[sectionId]) {
        const targetHash = SECTION_TO_HASH[sectionId];
        if (window.location.hash.toLowerCase() !== targetHash) {
            window.location.hash = targetHash;
        }
    }

    // 8. Dynamic document title
    if (SECTION_TO_HASH[sectionId] && ROUTE_MAP[SECTION_TO_HASH[sectionId]]) {
        document.title = ROUTE_MAP[SECTION_TO_HASH[sectionId]].title;
    }

    // 9. Gate canvas parting simulation & reset
    if (_gateEngine && _gateEngine.setGateParting) {
        if (sectionId === 'heroSection') {
            _gateEngine.setGateParting(0.0, false);
            const heroWrapper = document.getElementById('heroGateWrapper');
            if (heroWrapper) heroWrapper.classList.remove('gate-opening', 'gate-flythrough');
            if (_gateEngine.initCanvasSize) {
                _gateEngine.initCanvasSize();
            }
        }
    }

    // 10. Close mobile drawer
    const drawer = document.getElementById('mobileNavDrawer');
    if (drawer) drawer.classList.remove('open');
};

// ─── 3D Anime Torii Gate Opening & Direct Arcade Transition ──────────────────
window.openGateAndEnterArcade = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    // Ensure session is available
    if ((!window.msotAuth || !window.msotAuth.session) && window.msotAuth?.ensureDefaultStudentSession) {
        window.msotAuth.ensureDefaultStudentSession();
    }

    try {
        if (window.miraiAudio && window.miraiAudio.playTempleBell) {
            window.miraiAudio.playTempleBell();
        }
    } catch (err) {}

    window.switchSection('arcadeSection', true);
    window.location.hash = '#/arcade';
};

// ─── Route Dispatcher ────────────────────────────────────────────────────────
function handleRoute() {
    let hash = window.location.hash.toLowerCase();
    if (!hash || hash === '#') hash = '#/gates';
    if (hash.includes('?')) hash = hash.split('?')[0];

    const route = ROUTE_MAP[hash];

    // Auth screen routes: explicitly display auth modal
    if (route && route.authMode) {
        if (window.msotAuth && typeof window.msotAuth.showAuthScreen === 'function') {
            window.msotAuth.showAuthScreen(true);
            window.msotAuth.switchAuthTab?.(route.authMode);
            const rawHash = window.location.hash.toLowerCase();
            if (rawHash.includes('role=admin')) {
                window.msotAuth.selectLoginRole?.('ADMIN');
            } else if (rawHash.includes('role=faculty')) {
                window.msotAuth.selectLoginRole?.('FACULTY');
            } else if (rawHash.includes('role=student')) {
                window.msotAuth.selectLoginRole?.('STUDENT');
            }
        }
        document.title = route.title;
        return;
    }

    // 1. Session authentication & route protection
    const session = window.msotAuth?.session;
    const isPublicRoute = (hash === '#/gates' || hash === '#/intro' || hash === '#/about' || !hash || hash === '#');

    if (!session && !isPublicRoute) {
        window.location.hash = '#/login';
        if (window.msotAuth && typeof window.msotAuth.showAuthScreen === 'function') {
            window.msotAuth.showAuthScreen(true);
            window.msotAuth.switchAuthTab?.('signin');
        }
        return;
    }

    // 2. APPROVAL STATUS CHECK for authenticated users
    if (session) {
        const approvalStatus = (session.approval_status || 'APPROVED').toUpperCase();
        if (session.email !== 'admin@msot.edu' && approvalStatus !== 'APPROVED') {
            window.location.hash = '#/login';
            if (window.msotAuth?.showAccountStatusModal) {
                window.msotAuth.showAccountStatusModal(approvalStatus, {
                    name: session.name,
                    email: session.email,
                    requestedRole: session.role,
                    status: approvalStatus
                });
            }
            return;
        }
    }

    // 3. ROLE ACCESS GUARD for protected URL paths
    const isTrueAdmin = (window.msotPlatform && typeof window.msotPlatform.isVerifiedAdmin === 'function')
        ? window.msotPlatform.isVerifiedAdmin(session)
        : (session?.baseRole === 'ADMIN' || session?.role === 'ADMIN' || session?.email === 'admin@msot.edu' || session?.email === 'utkarshraj142006@gmail.com');
    const userRole = (session?.role || (window.msotRBAC ? window.msotRBAC.getCurrentRole() : 'STUDENT')).toUpperCase();

    if (hash === '#/admin' || hash === '#/xp-rules') {
        if (isTrueAdmin) {
            // If admin was previewing student/faculty and returns to #/admin, automatically restore Admin mode!
            if (window.msotPlatform && window.msotPlatform.activeRole !== 'ADMIN') {
                window.msotPlatform.setEffectiveRole('ADMIN');
            }
        } else {
            console.warn('⚠️ Access Denied: The Admin Command Center is reserved for System Administrators.');
            if (typeof window.showToast === 'function') window.showToast('⚠️ Access Denied: Admin route is restricted.');
            window.location.hash = userRole === 'FACULTY' ? '#/faculty' : '#/dashboard';
            return;
        }
    }
    if (hash === '#/faculty' || hash.startsWith('#/faculty/') || hash.startsWith('#/faculty-')) {
        if (isTrueAdmin) {
            // Verified Admin can view faculty
        } else if (userRole !== 'FACULTY') {
            console.warn('⚠️ Access Denied: The Faculty Dashboard is reserved for Faculty and Administrators.');
            if (typeof window.showToast === 'function') window.showToast('⚠️ Access Denied: Faculty route is restricted.');
            window.location.hash = '#/dashboard';
            return;
        }
    }

    // Standard application routes: close auth modal
    if (window.msotAuth && typeof window.msotAuth.showAuthScreen === 'function') {
        window.msotAuth.showAuthScreen(false);
    }

    // Intro route -> direct to The Gates
    if (hash === '#/intro' || route?.isIntro) {
        window.switchSection('heroSection', false);
        document.title = 'The Gates • MSOT Learn';
        return;
    }

    if (route && route.section) {
        window.switchSection(route.section, false);
        document.title = route.title;
    } else {
        window.switchSection('heroSection', false);
        document.title = 'The Gates • MSOT Learn';
    }
}

// ─── Immediate Route Listener Registration ───────────────────────────────────
window.addEventListener('hashchange', handleRoute);
window.addEventListener('popstate', handleRoute);

// ─── Initializer & Event Listeners ───────────────────────────────────────────
function initApp() {

    // 1. Three.js 3D Viewport & Scroll Animator
    try {
        if (window.Mirai3DEngine) window.mirai3D = new Mirai3DEngine();
        if (window.MiraiScrollAnimator) window.miraiScroll = new MiraiScrollAnimator();
    } catch (e) {
        console.warn("3D/Scroll init note:", e.message);
    }

    // 2. Gate Canvas Engine
    try {
        _gateEngine = new MiraiGateEngine('gateCanvas', 'heroGateWrapper');
        window.miraiGateEngine = _gateEngine;
    } catch (e) {
        console.warn("Gate engine note:", e.message);
    }

    // 3. Platform Controller (Populates initial views)
    try {
        if (window.miraiPlatform) window.miraiPlatform.init();
    } catch (e) {
        console.warn("Platform init note:", e.message);
    }

    // 4. Attach DIRECT CLICK LISTENERS to all navigation items
    document.querySelectorAll('.nav-link[data-section], .mobile-nav-link[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            if (e && e.preventDefault) e.preventDefault();
            const targetSection = link.getAttribute('data-section');
            if (window.miraiAudio) window.miraiAudio.playClick?.();
            window.switchSection(targetSection, true);
        });
    });

    // 5. Initial route dispatch
    handleRoute();

    // 6. Sound atmospheric toggle
    const soundBtn = document.getElementById('soundToggleBtn');
    if (soundBtn) {
        soundBtn.addEventListener('click', () => {
            try {
                const isPlaying = window.miraiAudio ? window.miraiAudio.toggleAmbient() : false;
                soundBtn.classList.toggle('playing', isPlaying);
                const textEl = document.getElementById('soundBtnText');
                if (textEl) {
                    textEl.textContent = isPlaying ? '🔊 SOUND ON' : '🔇 MUTED';
                }
            } catch (e) {
                console.warn("Audio toggle note:", e.message);
            }
        });
    }

    // 7. Hero CTA "ENTER THE GATE" button (3D Anime Torii Opening -> Arcade)
    const enterGateBtn = document.getElementById('enterGateBtn');
    if (enterGateBtn) {
        enterGateBtn.onclick = window.openGateAndEnterArcade;
        enterGateBtn.addEventListener('click', window.openGateAndEnterArcade);
    }

    // 8. Mobile Navigation Drawer Controls
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');
    const mobileNavDrawer = document.getElementById('mobileNavDrawer');

    if (mobileMenuBtn && mobileNavDrawer) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNavDrawer.classList.add('open');
            if (window.miraiAudio) window.miraiAudio.playClick?.();
        });
    }

    if (mobileCloseBtn && mobileNavDrawer) {
        mobileCloseBtn.addEventListener('click', () => {
            mobileNavDrawer.classList.remove('open');
        });
    }

    // 9. Curtain physics side panel toggle
    const togglePanelBtn = document.getElementById('toggleCurtainPanelBtn');
    const curtainPanel   = document.getElementById('curtainSidePanel');
    if (togglePanelBtn && curtainPanel) {
        togglePanelBtn.addEventListener('click', () => {
            curtainPanel.classList.toggle('collapsed');
            if (window.miraiAudio) window.miraiAudio.playClick?.();
        });
    }

    // 10. Curtain physics sliders
    function bindSlider(id, valId, setter) {
        const el = document.getElementById(id);
        const val = document.getElementById(valId);
        if (el) {
            el.addEventListener('input', (e) => {
                setter(e.target.value);
                if (val) val.innerText = e.target.value;
            });
        }
    }

    if (_gateEngine) {
        bindSlider('ctrlGateParting', 'valGateParting', v => {
            _gateEngine.setGateParting(parseFloat(v));
            const lbl = document.getElementById('valGateParting');
            if (lbl) lbl.innerText = Math.round(v * 100) + '%';
        });
        bindSlider('ctrlTextSize',    'valTextSize',    v => { _gateEngine.params.textSize = parseFloat(v); });
        bindSlider('ctrlGlyphWeight', 'valGlyphWeight', v => { _gateEngine.params.glyphWeight = parseFloat(v); });
        bindSlider('ctrlFraying',     'valFraying',     v => { _gateEngine.params.fraying = parseFloat(v); });
        bindSlider('ctrlGravity',     'valGravity',     v => { _gateEngine.params.gravity = parseFloat(v); });
        bindSlider('ctrlDamping',     'valDamping',     v => { _gateEngine.params.damping = parseFloat(v); });
        bindSlider('ctrlSmoke',       'valSmoke',       v => { _gateEngine.params.smokeDensity = parseInt(v, 10); _gateEngine.initSmoke(); });
        bindSlider('ctrlHeat',        'valHeat',        v => { _gateEngine.params.heatIntensity = parseFloat(v); });
    }

    // 11. Reset physics
    const btnResetPhysics = document.getElementById('btnResetPhysics');
    if (btnResetPhysics && _gateEngine) {
        btnResetPhysics.addEventListener('click', () => {
            Object.assign(_gateEngine.params, {
                gateParting: 0.0, textSize: 9.0, glyphWeight: 0.8,
                fraying: 0.1, gravity: 0.1, damping: 0.955,
                smokeDensity: 35, heatIntensity: 1.0
            });
            ['ctrlGateParting','ctrlTextSize','ctrlGlyphWeight','ctrlFraying',
             'ctrlGravity','ctrlDamping','ctrlSmoke','ctrlHeat'].forEach((id, i) => {
                const el = document.getElementById(id);
                if (el) el.value = [0, 9.0, 0.8, 0.1, 0.1, 0.955, 35, 1.0][i];
            });
            ['valGateParting','valTextSize','valGlyphWeight','valFraying',
             'valGravity','valDamping','valSmoke','valHeat'].forEach((id, i) => {
                const el = document.getElementById(id);
                if (el) el.innerText = ['0%','9.00','0.80','0.10','0.10','0.955','35','1.0'][i];
            });
            _gateEngine.setGateParting(0.0, false);
            _gateEngine.initSmoke();
            _gateEngine.initClothGrid();
            if (window.miraiAudio) window.miraiAudio.playClick?.();
        });
    }

    // 12. Role dropdown switcher (strictly for verified Admin mode changes)
    const roleSelect = document.getElementById('userRoleSelect');
    const roleIcon = document.getElementById('roleIconIndicator');
    if (roleSelect && roleSelect.tagName === 'SELECT') {
        roleSelect.addEventListener('change', (e) => {
            const session = window.msotAuth?.session;
            const isTrueAdmin = (window.msotPlatform && typeof window.msotPlatform.isVerifiedAdmin === 'function')
                ? window.msotPlatform.isVerifiedAdmin(session)
                : (session?.baseRole === 'ADMIN' || session?.role === 'ADMIN' || session?.email === 'admin@msot.edu');
            if (!isTrueAdmin) {
                console.warn('⚠️ Unauthorized role change attempt ignored.');
                return;
            }
            const role = e.target.value;
            window.msotPlatform && window.msotPlatform.setEffectiveRole(role);
        });
    }
    if (typeof window.updateNavRoleVisibility === 'function') {
        window.updateNavRoleVisibility();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
