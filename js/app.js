/**
 * Mirai School of Technology - Main Application Controller & Direct Route Manager
 */

// ─── Supabase Client (Integration Ready) ──────────────────────────────────────
const SUPABASE_URL = "https://zsxdsyfjlxtcunhqgcdj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzeGRzeWZqbHh0Y3VuaHFnY2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1MTI0OTksImV4cCI6MjEwNzA4ODQ5OX0.n223hw6kl5iuAEz5llQ6BBhhtXRQkKHU86n2gf_lD8k";

let supabase = null;
try {
    if (window.supabase?.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("✅ Supabase client initialized!");
    }
} catch (err) {
    console.warn("Supabase init note:", err.message);
}

// ─── Route Registry ──────────────────────────────────────────────────────────
const ROUTE_MAP = {
    '#/gates':     { section: 'heroSection',     title: 'The Gates • MSOT Learn' },
    '#/home':      { section: 'heroSection',     title: 'The Gates • MSOT Learn' },
    '#/arcade':    { section: 'arcadeSection',   title: '17 Sacred Trials • MSOT Learn' },
    '#/daily':     { section: 'dailySection',    title: 'Daily Speed Trial • MSOT Learn' },
    '#/leagues':   { section: 'leaguesSection',  title: 'Cadet Leagues & Fairness • MSOT Learn' },
    '#/league':    { section: 'leaguesSection',  title: 'Cadet Leagues & Fairness • MSOT Learn' },
    '#/guild-war': { section: 'battleSection',   title: 'Guild War & Team Clash • MSOT Learn' },
    '#/battle':    { section: 'battleSection',   title: 'Guild War & Team Clash • MSOT Learn' },
    '#/faculty':   { section: 'facultySection',  title: 'Faculty Dashboard • MSOT Learn' },
    '#/admin':     { section: 'adminSection',    title: 'Admin XP Economy Rules • MSOT Learn' },
    '#/xp-rules':  { section: 'adminSection',    title: 'Admin XP Economy Rules • MSOT Learn' },
    '#/profile':   { section: 'profileSection',  title: 'Cadet Profile & Dossier • MSOT Learn' },
    '#/login':     { authMode: 'signin',         title: 'Sign In • MSOT Learn' },
    '#/signup':    { authMode: 'signup',         title: 'Register Cadet • MSOT Learn' }
};

const SECTION_TO_HASH = {
    'heroSection':     '#/gates',
    'arcadeSection':   '#/arcade',
    'dailySection':    '#/daily',
    'leaguesSection':  '#/leagues',
    'battleSection':   '#/guild-war',
    'facultySection':  '#/faculty',
    'adminSection':    '#/admin',
    'profileSection':  '#/profile'
};

let _gateEngine = null;

// ─── Direct Unconditional Section Switcher ───────────────────────────────────
window.switchSection = function (sectionId, updateHash = true) {
    if (!sectionId) sectionId = 'heroSection';

    // 1. Hide all sections completely (use display:none only — no opacity fighting)
    document.querySelectorAll('.app-section').forEach(sec => {
        sec.classList.remove('active');
        sec.style.display = 'none';
        sec.style.opacity = '';
    });

    // 2. Remove active state from all nav links
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(l => l.classList.remove('active'));

    // 3. Show target section immediately - let CSS .active class control display type
    //    (.app-section.active = display:block; .hero-gate-section = display:flex via CSS)
    const targetSec = document.getElementById(sectionId);
    if (targetSec) {
        targetSec.classList.add('active');
        targetSec.style.display = '';
        targetSec.style.opacity = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 4. Highlight active nav link on both desktop & mobile
    const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');

    const activeMobileLink = document.querySelector(`.mobile-nav-link[data-section="${sectionId}"]`);
    if (activeMobileLink) activeMobileLink.classList.add('active');

    // 5. Reactive renders for dynamic views
    if (sectionId === 'arcadeSection') {
        window.msotPlatform?.renderArcade?.();
    } else if (sectionId === 'leaguesSection') {
        window.msotPlatform?.renderLeagues?.();
        window.msotPlatform?.renderFairnessBoards?.();
        window.msotPlatform?.renderQuests?.();
    } else if (sectionId === 'battleSection') {
        window.msotPlatform?.renderTeamBattles?.();
    } else if (sectionId === 'dailySection') {
        window.msotPlatform?.renderDailyQuizCard?.();
    } else if (sectionId === 'facultySection') {
        window.msotPlatform?.renderFacultyDashboard?.();
    } else if (sectionId === 'adminSection') {
        window.msotPlatform?.renderAdminRules?.();
    } else if (sectionId === 'profileSection') {
        window.msotPlatform?.renderStudentProfile?.();
        window.msotPlatform?.renderBadgesVault?.();
        window.msotPlatform?.renderXPLedger?.();
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

    // 7. Sync URL hash without triggering duplicate events
    if (updateHash && SECTION_TO_HASH[sectionId]) {
        const targetHash = SECTION_TO_HASH[sectionId];
        if (window.location.hash.toLowerCase() !== targetHash) {
            history.pushState(null, '', targetHash);
        }
    }

    // 8. Dynamic document title
    if (SECTION_TO_HASH[sectionId] && ROUTE_MAP[SECTION_TO_HASH[sectionId]]) {
        document.title = ROUTE_MAP[SECTION_TO_HASH[sectionId]].title;
    }

    // 9. Gate canvas parting simulation
    if (_gateEngine && _gateEngine.setGateParting) {
        if (sectionId === 'heroSection') {
            _gateEngine.setGateParting(0.70, false);
            if (_gateEngine.initCanvasSize) {
                _gateEngine.initCanvasSize();
            }
        } else {
            _gateEngine.setGateParting(1.0, false);
        }
    }

    // 10. Close mobile drawer
    const drawer = document.getElementById('mobileNavDrawer');
    if (drawer) drawer.classList.remove('open');
};

// ─── Route Dispatcher ────────────────────────────────────────────────────────
function handleRoute() {
    let hash = window.location.hash.toLowerCase();
    if (!hash || hash === '#') hash = '#/gates';
    if (hash.includes('?')) hash = hash.split('?')[0];

    const route = ROUTE_MAP[hash];

    // Auth screen routes
    if (route && route.authMode) {
        if (window.msotAuth) {
            window.msotAuth.showAuthScreen(true);
            window.msotAuth.switchAuthTab(route.authMode);
        }
        document.title = route.title;
        return;
    }

    // Standard application routes
    if (route && route.section) {
        window.switchSection(route.section, false);
        document.title = route.title;
    } else {
        window.switchSection('heroSection', false);
        document.title = 'The Gates • MSOT Learn';
    }
}

// ─── Initializer & Event Listeners ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

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
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');
            if (window.miraiAudio) window.miraiAudio.playClick?.();
            window.switchSection(targetSection, true);
        });
    });

    // 5. Initial route dispatch and history listeners
    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);

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

    // 7. Hero CTA "ENTER THE GATES" button
    const enterGateBtn = document.getElementById('enterGateBtn');
    if (enterGateBtn) {
        enterGateBtn.addEventListener('click', () => {
            try {
                if (_gateEngine) _gateEngine.setGateParting(1.0, true);
                if (window.miraiAudio) window.miraiAudio.playClick?.();
            } catch (e) {}
            setTimeout(() => {
                window.switchSection('arcadeSection', true);
            }, 650);
        });
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

    // 12. Role dropdown switcher
    const roleSelect = document.getElementById('userRoleSelect');
    const roleIcon = document.getElementById('roleIconIndicator');
    if (roleSelect) {
        roleSelect.addEventListener('change', (e) => {
            const role = e.target.value;
            if (roleIcon) {
                roleIcon.textContent = role === 'STUDENT' ? '⚔️' : (role === 'FACULTY' ? '🎓' : '🛡️');
            }
            if (window.msotState?.setRole) {
                window.msotState.setRole(role);
            }
            if (role === 'FACULTY') {
                window.switchSection('facultySection', true);
            } else if (role === 'ADMIN') {
                window.switchSection('adminSection', true);
            } else {
                window.switchSection('heroSection', true);
            }
        });
    }
});
