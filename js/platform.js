/**
 * MSOT LEARN — Unified Platform Controller & Interactive Interfaces
 * Manages:
 * - Role-Based Access Control (Student, Faculty, Admin views)
 * - Game-Like Student Home Dashboard (Level 12, XP bar, Streaks, Quests, League)
 * - Anti-Cheat Daily Quiz Engine (1 attempt/day, rapid click alert, randomized)
 * - Active Quests System & Interactive Checklists
 * - 5-Category Badges Vault (Learning, Consistency, Improvement, Community, Challenge)
 * - Weekly Leagues with Weekly XP & Anonymous Mode ("Anonymous Student #482")
 * - Multi-Dimensional Fairness Leaderboards (Most Improved, Consistency, Personal Bests)
 * - Real-Time Team Battles (Section A vs Section B Sprint & Tri-Campus War)
 * - Faculty Dashboard (Engagement KPIs, Topic Radar, Nudge Dispatch, Attendance/Homework loggers, Audit log)
 * - Admin XP Rule Engine Console (Dynamic rule modifications without code changes)
 * - Immutable XP Transaction Ledger View
 */

class MSOTPlatformController {
    constructor() {
        this.activeArcadeFilter = 'all';
        this.activeBadgeFilter = 'all';
        this.activeFairnessTab = 'weeklyXP';
        this.battleTimerInterval = null;
        this.activeAssignmentFilter = 'all';
        this.currentArenaAssignment = null;
        this.currentArenaLanguage = 'javascript';
        this.arenaActiveTab = 'terminal'; // 'terminal' | 'testcases' | 'stdin'
    }

    init() {
        this.bindRoleSwitcher();
        this.renderDashboard();
        this.renderStudentDashboard();
        this.renderArcade();
        this.renderDailyQuizCard();
        this.renderAssignments();
        this.renderQuests();
        this.renderLeagues();
        this.renderFairnessBoards();
        this.renderTeamBattles();
        this.renderBadgesVault();
        this.renderFacultyDashboard();
        this.renderAdminRules();
        this.renderAboutSection();
        this.renderXPLedger();
        this.renderStudentProfile();
        this.updateHeaderStats();
        this.startLiveBattleTicks();
        this.startTimeTracker();
    }

    startTimeTracker() {
        if (this.timeTrackerInterval) return;
        this.timeTrackerInterval = setInterval(() => {
            if (window.msotState && window.msotState.student) {
                window.msotState.student.weeklyTimeSpentMinutes = (window.msotState.student.weeklyTimeSpentMinutes || 0) + 1;
                window.msotState.save();
                const leaguesSection = document.getElementById('leaguesSection');
                if (leaguesSection && leaguesSection.classList.contains('active')) {
                    this.renderLeagues();
                }
            }
        }, 60000);
    }

    refreshAll() {
        this.updateHeaderStats();
        this.renderDashboard();
        this.renderStudentDashboard();
        this.renderArcade();
        this.renderAssignments();
        this.renderQuests();
        this.renderLeagues();
        this.renderFairnessBoards();
        this.renderTeamBattles();
        this.renderBadgesVault();
        this.renderFacultyDashboard();
        this.renderAdminRules();
        this.renderAboutSection();
        this.renderXPLedger();
        this.renderStudentProfile();
    }

    // =========================================================================
    // 0. ROLE-BASED ACCESS CONTROL & HEADER HUD
    // =========================================================================
    bindRoleSwitcher() {
        // Apply permissions for current authenticated role
        const sessionRole = (window.msotAuth?.session?.role || window.msotState?.currentRole || 'STUDENT').toUpperCase();
        this.applyRolePermissions(sessionRole);
    }

    setEffectiveRole(targetRole, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        this.activeRole = targetRole.toUpperCase();
        if (window.msotState) {
            window.msotState.currentRole = this.activeRole;
        }
        if (window.msotRBAC?.setCurrentRole) {
            window.msotRBAC.setCurrentRole(this.activeRole);
        }
        if (window.msotAuth && window.msotAuth.session) {
            window.msotAuth.session.role = this.activeRole;
        }
        this.applyRolePermissions(this.activeRole);
        this.renderAssignments();
        if (typeof window.updateNavRoleVisibility === 'function') {
            window.updateNavRoleVisibility();
        }

        if (this.activeRole === 'ADMIN') {
            this.renderAdminRules();
            window.switchSection('adminSection', true);
        } else if (this.activeRole === 'FACULTY') {
            this.renderFacultyDashboard();
            window.switchSection('facultySection', true);
        } else {
            // Student mode: redirect away from restricted sections
            const activeSec = document.querySelector('.app-section.active')?.id;
            if (activeSec === 'adminSection' || activeSec === 'facultySection') {
                window.switchSection('dashboardSection', true);
            }
        }
        if (window.miraiAudio && window.miraiAudio.playClick) window.miraiAudio.playClick();
    }

    applyRolePermissions(role) {
        const session = window.msotAuth?.session || {};
        const isTrueAdmin = (session.role === 'ADMIN' || session.email === 'admin@msot.edu');
        
        if (!this.activeRole) {
            this.activeRole = isTrueAdmin ? 'ADMIN' : ((session.role || role || 'STUDENT').toUpperCase());
        }
        const effectiveRole = (this.activeRole || session.role || role || 'STUDENT').toUpperCase();
        document.body.setAttribute('data-user-role', effectiveRole);

        // Update single role display in header
        const roleLabel = document.getElementById('roleLabelIndicator');
        if (roleLabel) {
            roleLabel.textContent = isTrueAdmin 
                ? (effectiveRole === 'ADMIN' ? 'ADMIN (MASTER)' : (effectiveRole === 'FACULTY' ? 'FACULTY (OPERATIONS)' : 'STUDENT (PREVIEW)')) 
                : effectiveRole;
        }

        const roleIcon = document.getElementById('roleIconIndicator');
        if (roleIcon) {
            roleIcon.textContent = effectiveRole === 'STUDENT' ? '⚔️' : (effectiveRole === 'FACULTY' ? '🎓' : '🛡️');
        }

        const rolePill = document.getElementById('loggedInRolePill');
        if (rolePill) {
            rolePill.className = `logged-in-role-pill role-${effectiveRole.toLowerCase()} ${isTrueAdmin ? 'has-facility-switcher' : ''}`;
            if (isTrueAdmin) {
                const subLabel = effectiveRole === 'ADMIN' 
                    ? 'MASTER ADMIN' 
                    : (effectiveRole === 'FACULTY' ? 'FACULTY OPERATIONS VIEW' : 'STUDENT PREVIEW');
                const mainName = effectiveRole === 'ADMIN' 
                    ? '🛡️ ADMIN (CAN CHANGE ALL)' 
                    : (effectiveRole === 'FACULTY' ? '🎓 FACULTY (SEE & CHANGE ALL)' : '⚔️ STUDENT (SOLVER ONLY)');

                rolePill.innerHTML = `
                    <span class="role-status-dot">●</span>
                    <span class="role-icon-indicator" id="roleIconIndicator">${effectiveRole === 'ADMIN' ? '🛡️' : (effectiveRole === 'FACULTY' ? '🎓' : '⚔️')}</span>
                    <div class="role-text-box">
                        <span class="role-tiny-label">UTKARSH RAJ // ${subLabel}</span>
                        <span class="role-main-name" id="roleLabelIndicator">${mainName}</span>
                    </div>
                    <div class="facility-toggle-group">
                        <button type="button" class="facility-btn ${effectiveRole === 'ADMIN' ? 'active' : ''}" 
                                onclick="window.msotPlatform.setEffectiveRole('ADMIN', event)" 
                                title="Admin Mode: Complete governance, manage faculty, students, system rules">
                            🛡️ ADMIN
                        </button>
                        <button type="button" class="facility-btn ${effectiveRole === 'FACULTY' ? 'active' : ''}" 
                                onclick="window.msotPlatform.setEffectiveRole('FACULTY', event)" 
                                title="Faculty Mode: View all students, character flashcards, grade submissions, author assignments, excuse reasons">
                            🎓 FACULTY VIEW
                        </button>
                        <button type="button" class="facility-btn ${effectiveRole === 'STUDENT' ? 'active' : ''}" 
                                onclick="window.msotPlatform.setEffectiveRole('STUDENT', event)" 
                                title="Student Mode: View website as a student (only solve questions, cannot make changes)">
                            ⚔️ STUDENT VIEW
                        </button>
                    </div>
                `;
            } else {
                rolePill.innerHTML = `
                    <span class="role-status-dot">●</span>
                    <span class="role-icon-indicator" id="roleIconIndicator">${effectiveRole === 'STUDENT' ? '⚔️' : (effectiveRole === 'FACULTY' ? '🎓' : '🛡️')}</span>
                    <div class="role-text-box">
                        <span class="role-tiny-label">LOGGED IN AS</span>
                        <span class="role-main-name" id="roleLabelIndicator">${effectiveRole}</span>
                    </div>
                `;
            }
        }

        const hiddenRoleSelect = document.getElementById('userRoleSelect');
        if (hiddenRoleSelect) hiddenRoleSelect.value = effectiveRole;

        // Filter navigation links: Students only see student tabs, Faculty sees Faculty and shared tabs, Admin sees all
        document.querySelectorAll('[data-nav-role]').forEach(el => {
            const reqRoles = (el.getAttribute('data-nav-role') || '').split(',').map(r => r.trim().toUpperCase());
            if (effectiveRole === 'ADMIN') {
                el.style.display = '';
            } else if (effectiveRole === 'FACULTY') {
                el.style.display = reqRoles.includes('FACULTY') ? '' : 'none';
            } else {
                // STUDENT: Hide faculty, admin, and staff-only tabs
                el.style.display = reqRoles.includes('STUDENT') ? '' : 'none';
            }
        });

        // Update role indicator banner
        const roleBanner = document.getElementById('roleIndicatorBanner');
        if (roleBanner) {
            roleBanner.className = `role-indicator-banner ${effectiveRole.toLowerCase()}`;
            roleBanner.innerHTML = `
                <span>ACTIVE SESSION: <strong>${effectiveRole} ROLE</strong> ${isTrueAdmin && effectiveRole === 'STUDENT' ? '(STUDENT PREVIEW ACTIVE — CHANGES LOCKED)' : ''}</span>
                <span class="role-desc">
                    ${effectiveRole === 'STUDENT' ? (isTrueAdmin ? 'Previewing site as student: only problem solving & compiler lab accessible. Changes locked. <a href="javascript:void(0)" onclick="window.msotPlatform.setEffectiveRole(\'ADMIN\')" style="color:#00f0ff;text-decoration:underline;margin-left:8px;font-weight:700;">Restore Admin 🛡️</a>' : 'Student Cadet View: Access personal learning dashboard, quests, leagues, and solve problems in the compiler lab.') : ''}
                    ${effectiveRole === 'FACULTY' ? 'Full access to student engagement KPIs, syllabus topic radar, and AI Question Review.' : ''}
                    ${effectiveRole === 'ADMIN' ? 'System governance active. Full privileges: push weekend assignments, configure XP rules, audit ledger.' : ''}
                </span>
            `;
        }

        // Render preview floating bar if admin is previewing student view
        let previewBar = document.getElementById('adminPreviewBar');
        if (isTrueAdmin && effectiveRole === 'STUDENT') {
            if (!previewBar) {
                previewBar = document.createElement('div');
                previewBar.id = 'adminPreviewBar';
                previewBar.className = 'admin-preview-floating-bar';
                document.body.appendChild(previewBar);
            }
            previewBar.style.display = 'flex';
            previewBar.innerHTML = `
                <div class="apb-content">
                    <span class="apb-badge">👁️ STUDENT PREVIEW MODE</span>
                    <span class="apb-text">You are testing the site with student facilities. Pushing assignments & rule editing are locked.</span>
                    <button type="button" class="apb-switch-btn" onclick="window.msotPlatform.setEffectiveRole('ADMIN', event)">
                        RESTORE ADMIN MASTER ACCESS 🛡️
                    </button>
                </div>
            `;
        } else if (previewBar) {
            previewBar.style.display = 'none';
        }
    }

    updateHeaderStats() {
        const student = window.msotState.student;
        if (!student) return;
        const levelData = calculateLevelData(student.lifetimeXP || 0);

        const xpEl = document.getElementById('headerXP');
        const levelEl = document.getElementById('headerLevel');
        const streakEl = document.getElementById('headerStreak');
        const freezeEl = document.getElementById('headerFreezes');
        const avatarEl = document.getElementById('headerAvatar');

        if (xpEl) xpEl.innerText = `${(student.lifetimeXP || 0).toLocaleString()} XP`;
        if (levelEl) levelEl.innerText = `LVL ${levelData.level}`;
        if (streakEl) {
            if (student.isStreakFrozen) {
                streakEl.innerHTML = `<span style="color:#00f0ff;font-weight:800;letter-spacing:0.5px;">${student.streak || 1}d 🧊 FROZEN</span>`;
                streakEl.title = 'Streak is currently frozen (Protected up to 2 days while away)';
            } else {
                streakEl.innerText = `${student.streak || 1} Days 🔥`;
                streakEl.title = 'Daily Activeness Streak';
            }
        }
        if (freezeEl) {
            freezeEl.innerText = student.isStreakFrozen ? 'FROZEN 🧊' : '2d FREEZE 🛡️';
            freezeEl.title = student.isStreakFrozen ? 'Streak currently frozen (Protected up to 2 days)' : 'Streak Freeze Available (Protects for up to 2 days)';
        }
        if (avatarEl) {
            if (student.avatar && (student.avatar.startsWith('data:') || student.avatar.startsWith('http') || student.avatar.startsWith('/'))) {
                avatarEl.innerHTML = `<img src="${student.avatar}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;">`;
            } else {
                avatarEl.innerText = student.avatar || '⚔️';
            }
        }
    }

    // =========================================================================
    // 0.5 MODERN EDTECH STUDENT DASHBOARD (EXACT VISUAL REPLICA OF BYJU'S MOCKUP)
    // =========================================================================
    renderDashboard() {
        const container = document.getElementById('dashboardContainer');
        if (!container) return;

        const activeUser = window.msotAuth?.session || {};
        const s = window.msotState?.student || {
            name: activeUser.name || 'Utkarsh Raj',
            year: activeUser.year || '1st Year',
            avatar: activeUser.avatar || '🛡️',
            streak: 7,
            lifetimeXP: 1450,
            weeklyXP: 420
        };

        const currentTheme = document.documentElement.getAttribute('data-theme') || (function(){ try { return localStorage.getItem('MSOT_THEME'); } catch(e){} })() || 'lavender';
        const displayName = s.name || activeUser.name || 'Utkarsh Raj';
        const displayClass = s.year ? (s.year.includes('Class') ? s.year : `${s.year} • 2026–2027`) : '1st Year • 2026–2027';
        
        let avatarContent = '👦';
        if (s.avatar) {
            if (s.avatar.startsWith('http') || s.avatar.startsWith('data:')) {
                avatarContent = `<img src="${s.avatar}" alt="Avatar" style="width:100%;height:100%;border-radius:inherit;object-fit:cover;display:block;">`;
            } else {
                avatarContent = `<span>${this.escapeHTML(s.avatar)}</span>`;
            }
        }

        const weeklyMins = s.weeklyTimeSpentMinutes || 385;
        const weeklyHrs = (weeklyMins / 60).toFixed(1);
        const levelData = typeof calculateLevelData === 'function' ? calculateLevelData(s.lifetimeXP || 685) : { level: 2, currentLevelXP: 285, xpNeededForLevel: 500, progressPercent: 57 };

        // Real Data Integration from dashboard services
        const progressData = window.msotProgressService?.getProgress() || {
            dsa: { completed: 3, total: 7, pct: 43, color: '#f59e0b' },
            webDev: { completed: 3, total: 10, pct: 30, color: '#7c3aed' }
        };

        const dailyHours = window.msotActivityTracker?.getDailyHours() || [
            { day: 'SUN', minutes: 72, hours: 1.2, color: '#f472b6', isToday: false },
            { day: 'MON', minutes: 168, hours: 2.8, color: '#38bdf8', isToday: false },
            { day: 'TUE', minutes: 96, hours: 1.6, color: '#2dd4bf', isToday: false },
            { day: 'WED', minutes: 192, hours: 3.2, color: '#facc15', isToday: true },
            { day: 'THU', minutes: 126, hours: 2.1, color: '#c084fc', isToday: false },
            { day: 'FRI', minutes: 156, hours: 2.6, color: '#fb7185', isToday: false },
            { day: 'SAT', minutes: 84, hours: 1.4, color: '#fbbf24', isToday: false }
        ];

        const totalWeeklyHours = window.msotActivityTracker?.getTotalHours() || 14.9;
        const totalWeeklyMins = dailyHours.reduce((acc, d) => acc + d.minutes, 0);

        const attendancePct = s.attendance || '92%';

        container.innerHTML = `
            <div class="edtech-dashboard-wrapper scroll-reveal in-view">
                <!-- 3-Column Modern Educational Dashboard Layout -->
                <div class="edtech-dash-3col-layout">

                    <!-- ========================================================= -->
                    <!-- COLUMN 1: LEFT NAVIGATION SIDEBAR (Exact 7 items in order) -->
                    <!-- ========================================================= -->
                    <aside class="dash-left-sidebar" aria-label="Dashboard Navigation">
                        <div class="dash-sidebar-brand">
                            <div class="brand-badge-square">M</div>
                            <div class="brand-title-box">
                                <span class="brand-title-primary">Mirai Tech</span>
                                <span class="brand-title-sub">STUDENT ACADEMY</span>
                            </div>
                        </div>

                        <nav class="dash-sidebar-menu">
                            <button type="button" class="dash-nav-btn active" onclick="window.switchSection('dashboardSection', true)" title="Dashboard Overview">
                                <span class="nav-ico">🏠</span>
                                <span class="nav-text">Dashboard</span>
                            </button>
                            <button type="button" class="dash-nav-btn" onclick="window.switchSection('arcadeSection', true)" title="1. Sacred Trials Arcade">
                                <span class="nav-ico">🎮</span>
                                <span class="nav-text">Arcade</span>
                            </button>
                            <button type="button" class="dash-nav-btn" onclick="window.switchSection('dailySection', true)" title="2. Daily Speed Trial">
                                <span class="nav-ico">⚡</span>
                                <span class="nav-text">Daily Trial</span>
                            </button>
                            <button type="button" class="dash-nav-btn" onclick="window.switchSection('assignmentsSection', true)" title="3. Weekend Compiler Lab">
                                <span class="nav-ico">💻</span>
                                <span class="nav-text">Weekend Lab</span>
                            </button>
                            <button type="button" class="dash-nav-btn" onclick="window.switchSection('leaguesSection', true)" title="4. Cadet Leagues & Fairness">
                                <span class="nav-ico">🏆</span>
                                <span class="nav-text">Leagues</span>
                            </button>
                            <button type="button" class="dash-nav-btn" onclick="window.switchSection('battleSection', true)" title="5. Live PvP Battle Arena">
                                <span class="nav-ico">⚔️</span>
                                <span class="nav-text">Battle</span>
                            </button>
                            <button type="button" class="dash-nav-btn" onclick="window.switchSection('aboutSection', true)" title="6. About Academy & Pedagogy">
                                <span class="nav-ico">📖</span>
                                <span class="nav-text">About</span>
                            </button>
                            <button type="button" class="dash-nav-btn" onclick="window.switchSection('profileSection', true)" title="7. Cadet Dossier & Profile">
                                <span class="nav-ico">👤</span>
                                <span class="nav-text">Profile</span>
                            </button>
                        </nav>
                    </aside>

                    <!-- ========================================================= -->
                    <!-- COLUMN 2: CENTER COLUMN (Header, Progress, Hours, Performance) -->
                    <!-- ========================================================= -->
                    <main class="edtech-center-col">
                        <!-- Welcome Header matching reference screenshot -->
                        <div class="edtech-dash-header">
                            <div>
                                <span class="edtech-subheading">Hello, <span class="student-name-highlight">${this.escapeHTML(displayName)}</span>, Welcome Back! 👋</span>
                                <h1 class="edtech-main-title">Your Learning Dashboard</h1>
                            </div>
                            <div class="dash-theme-badge-box">
                                <span class="theme-badge-label">THEME:</span>
                                <button type="button" class="theme-choice-btn ${currentTheme === 'lavender' ? 'active' : ''}" onclick="window.msotSetTheme('lavender', event)">
                                    <span class="theme-dot" style="background:#8b5cf6;"></span> 💜 Lavender
                                </button>
                                <button type="button" class="theme-choice-btn ${currentTheme === 'cyber' ? 'active' : ''}" onclick="window.msotSetTheme('cyber', event)">
                                    <span class="theme-dot" style="background:#f43f5e;"></span> 🌙 Cyber
                                </button>
                                <button type="button" class="theme-choice-btn ${currentTheme === 'midnight' ? 'active' : ''}" onclick="window.msotSetTheme('midnight', event)">
                                    <span class="theme-dot" style="background:#38bdf8;"></span> 🌌 Slate
                                </button>
                            </div>
                        </div>

                        <!-- Top Row: Results Card (DSA & Web Dev) + Attendance/Calendar -->
                        <div class="edtech-grid-row-1">
                            <!-- Results Card: EXACTLY DSA AND WEB DEVELOPMENT -->
                            <div class="edtech-card edtech-results-card">
                                <div class="edtech-card-head">
                                    <h3>Results</h3>
                                    <button type="button" class="card-dots-btn" onclick="window.msotProgressService?.openSyllabusModal()" title="View & Manage Curriculum">⋮</button>
                                </div>
                                <div class="subject-results-list">
                                    <!-- Category 1: DSA -->
                                    <div class="subject-result-row">
                                        <div class="subj-meta">
                                            <span class="subj-bullet" style="background:#f59e0b;"></span>
                                            <span class="subj-name">DSA</span>
                                        </div>
                                        <div class="subj-bar-wrap">
                                            <div class="subj-bar-fill" style="width: ${progressData.dsa.pct}%; background:#f59e0b;"></div>
                                        </div>
                                        <span class="subj-pct">${progressData.dsa.pct}%</span>
                                    </div>
                                    <!-- Category 2: Web Development -->
                                    <div class="subject-result-row">
                                        <div class="subj-meta">
                                            <span class="subj-bullet" style="background:#7c3aed;"></span>
                                            <span class="subj-name">Web Development</span>
                                        </div>
                                        <div class="subj-bar-wrap">
                                            <div class="subj-bar-fill" style="width: ${progressData.webDev.pct}%; background:#7c3aed;"></div>
                                        </div>
                                        <span class="subj-pct">${progressData.webDev.pct}%</span>
                                    </div>
                                </div>

                                <button type="button" class="syllabus-manage-btn" onclick="window.msotProgressService?.openSyllabusModal()">
                                    <span>📚</span> View & Track Syllabus Topics (${progressData.dsa.completed + progressData.webDev.completed}/${progressData.dsa.total + progressData.webDev.total}) ➔
                                </button>
                            </div>

                            <!-- Attendance & Calendar Column -->
                            <div class="edtech-calendar-attendance-col">
                                <!-- Attendance Card -->
                                <div class="edtech-card attendance-card">
                                    <div class="attendee-avatar-box">
                                        ${avatarContent}
                                    </div>
                                    <div class="attendee-info">
                                        <h4>${this.escapeHTML(displayName)}</h4>
                                        <span class="attendee-label">Attendance</span>
                                    </div>
                                    <div class="attendee-pct-box">
                                        <span>${attendancePct}</span>
                                    </div>
                                </div>

                                <!-- Weekly Calendar Card -->
                                <div class="edtech-card weekly-calendar-card">
                                    <div class="calendar-header-strip">
                                        <button type="button" class="cal-nav-arrow" onclick="window.msotPlatform.shiftCalendar(-1)">‹</button>
                                        <span class="cal-month-title" id="calMonthTitle">march 2026</span>
                                        <button type="button" class="cal-nav-arrow" onclick="window.msotPlatform.shiftCalendar(1)">›</button>
                                    </div>
                                    <div class="calendar-days-row" id="calDaysRow">
                                        <button type="button" class="cal-day-pill" onclick="window.msotPlatform.selectCalDay(this, 18)">
                                            <span class="day-lbl">SUN</span>
                                            <span class="day-num">18</span>
                                        </button>
                                        <button type="button" class="cal-day-pill" onclick="window.msotPlatform.selectCalDay(this, 19)">
                                            <span class="day-lbl">MON</span>
                                            <span class="day-num">19</span>
                                        </button>
                                        <button type="button" class="cal-day-pill" onclick="window.msotPlatform.selectCalDay(this, 20)">
                                            <span class="day-lbl">TUE</span>
                                            <span class="day-num">20</span>
                                        </button>
                                        <button type="button" class="cal-day-pill active" onclick="window.msotPlatform.selectCalDay(this, 21)">
                                            <span class="day-lbl">WED</span>
                                            <span class="day-num">21</span>
                                        </button>
                                        <button type="button" class="cal-day-pill" onclick="window.msotPlatform.selectCalDay(this, 22)">
                                            <span class="day-lbl">THU</span>
                                            <span class="day-num">22</span>
                                        </button>
                                        <button type="button" class="cal-day-pill" onclick="window.msotPlatform.selectCalDay(this, 23)">
                                            <span class="day-lbl">FRI</span>
                                            <span class="day-num">23</span>
                                        </button>
                                        <button type="button" class="cal-day-pill" onclick="window.msotPlatform.selectCalDay(this, 24)">
                                            <span class="day-lbl">SAT</span>
                                            <span class="day-num">24</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Bottom Row: Hours Spent & Performance Curve -->
                        <div class="edtech-grid-row-2">
                            <!-- Hours Spent Vertical Bar Chart -->
                            <div class="edtech-card">
                                <div class="edtech-card-head">
                                    <h3>Hours Spent</h3>
                                    <button type="button" class="card-dots-btn" title="Options">⋮</button>
                                </div>
                                <div style="font-size:11.5px; font-weight:700; color:var(--text-secondary); margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                                    <span>WEEKLY STUDY TIME</span>
                                    <span style="color:var(--primary-red); font-weight:800;">⏱️ ${totalWeeklyHours} hrs (${totalWeeklyMins} mins)</span>
                                </div>
                                <div class="hours-chart-container">
                                    <div class="hours-bars-grid">
                                        ${dailyHours.map(d => {
                                            const maxScaleMins = 240;
                                            const barHeightPct = Math.min(100, Math.max(14, Math.round((d.minutes / maxScaleMins) * 100)));
                                            return `
                                                <div class="bar-col" style="position:relative;">
                                                    <div class="bar-track">
                                                        <div class="bar-fill" style="height: ${barHeightPct}%; background: ${d.color};"></div>
                                                    </div>
                                                    <span class="bar-day-lbl ${d.isToday ? 'active' : ''}">${d.day}</span>
                                                    <div class="hours-bar-tooltip">
                                                        ${d.day}: ${d.hours} hrs (${d.minutes}m)
                                                    </div>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            </div>

                            <!-- Performance Card: Student vs Topper Reference Benchmark -->
                            <div class="edtech-card">
                                <div class="edtech-card-head">
                                    <h3>Performance</h3>
                                    <span class="d-chip" style="background: rgba(124, 58, 237, 0.12); color: #7c3aed; font-size: 10px; font-weight: 800;">STUDENT VS TOPPER</span>
                                </div>
                                <div class="perf-legend-row">
                                    <div class="perf-legend-item">
                                        <span class="perf-legend-dot" style="background:#7c3aed;"></span>
                                        <span style="color:var(--text-primary);">Student (Your XP)</span>
                                    </div>
                                    <div class="perf-legend-item">
                                        <span class="perf-legend-dot" style="background:#94a3b8; opacity:0.6;"></span>
                                        <span style="color:var(--text-secondary);">Topper Benchmark (90th %ile)</span>
                                    </div>
                                </div>
                                <div class="performance-chart-container">
                                    <svg class="performance-wave-svg" viewBox="0 0 500 140" preserveAspectRatio="none">
                                        <!-- Background reference grid lines -->
                                        <line x1="0" y1="35" x2="500" y2="35" stroke="rgba(255,255,255,0.05)" stroke-width="1" stroke-dasharray="3,3" />
                                        <line x1="0" y1="70" x2="500" y2="70" stroke="rgba(255,255,255,0.05)" stroke-width="1" stroke-dasharray="3,3" />
                                        <line x1="0" y1="105" x2="500" y2="105" stroke="rgba(255,255,255,0.05)" stroke-width="1" stroke-dasharray="3,3" />

                                        <!-- Series B: Light, low-opacity Topper Reference wave -->
                                        <path d="M 0 110 C 60 110, 80 15, 130 15 C 180 15, 200 130, 260 130 C 320 130, 340 70, 400 70 C 440 70, 460 115, 500 115"
                                              fill="none" stroke="rgba(148, 163, 184, 0.55)" stroke-width="2.5" stroke-dasharray="4,4" stroke-linecap="round"/>
                                        
                                        <!-- Series A: Darker, prominent Student Performance wave -->
                                        <path class="perf-wave-line"
                                              d="M 0 95 C 30 95, 60 45, 95 45 C 130 45, 170 125, 230 125 C 290 125, 330 35, 390 35 C 430 35, 450 50, 480 50 C 490 50, 495 105, 500 105"
                                              fill="none" stroke="#7c3aed" stroke-width="3.5" stroke-linecap="round"/>
                                    </svg>
                                    <div class="perf-days-labels">
                                        <span>SUN</span>
                                        <span class="active-lbl">MON</span>
                                        <span>TUE</span>
                                        <span>WED</span>
                                        <span>THU</span>
                                        <span>FRI</span>
                                        <span>SAT</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>

                    <!-- ========================================================= -->
                    <!-- COLUMN 3: RIGHT SIDEBAR (Profile, Upcoming Events, Recent Activity, Achievements) -->
                    <!-- ========================================================= -->
                    <aside class="edtech-right-col" aria-label="Student Dossier & Activities">
                        <!-- Student Profile Mini Card -->
                        <div class="edtech-card student-profile-mini-card" onclick="window.switchSection('profileSection', true)" style="cursor: pointer;" title="Open Cadet Profile">
                            <div class="sp-avatar-wrap">
                                ${avatarContent}
                            </div>
                            <div class="sp-details">
                                <h4 class="sp-name">${this.escapeHTML(displayName)}</h4>
                                <span class="sp-class">${this.escapeHTML(displayClass)}</span>
                            </div>
                            <button type="button" class="sp-edit-btn" title="Edit Profile">✏️</button>
                        </div>

                        <!-- Upcoming Events Card -->
                        <div class="edtech-card upcoming-events-card">
                            <div class="edtech-card-head">
                                <h4>Upcoming Events</h4>
                                <button type="button" class="card-dots-btn" title="Options">⋮</button>
                            </div>
                            <div class="events-list">
                                <div class="event-item" onclick="window.switchSection('assignmentsSection', true)">
                                    <div class="event-icon-box" style="background:#fef3c7;">
                                        <span>💻</span>
                                    </div>
                                    <div class="event-info">
                                        <span class="event-title">DSA Weekly Lab Contest</span>
                                        <span class="event-time">Thursday 12:30 PM</span>
                                    </div>
                                    <span class="event-arrow">›</span>
                                </div>
                                <div class="event-item" onclick="window.switchSection('arcadeSection', true)">
                                    <div class="event-icon-box" style="background:#e0f2fe;">
                                        <span>🌐</span>
                                    </div>
                                    <div class="event-info">
                                        <span class="event-title">Web Dev Speed Sprint</span>
                                        <span class="event-time">Friday 04:00 PM</span>
                                    </div>
                                    <span class="event-arrow">›</span>
                                </div>
                                <div class="event-item" onclick="window.switchSection('battleSection', true)">
                                    <div class="event-icon-box" style="background:#fce7f3;">
                                        <span>⚔️</span>
                                    </div>
                                    <div class="event-info">
                                        <span class="event-title">Inter-Guild PvP Battle</span>
                                        <span class="event-time">Saturday 07:30 PM</span>
                                    </div>
                                    <span class="event-arrow">›</span>
                                </div>
                            </div>
                        </div>

                        <!-- Recent Activity Card -->
                        <div class="edtech-card recent-activity-card">
                            <div class="edtech-card-head">
                                <h4>Recent Activity</h4>
                                <button type="button" class="card-dots-btn" title="Options">⋮</button>
                            </div>
                            <div class="activity-timeline-list">
                                <div class="activity-item" onclick="window.switchSection('arcadeSection', true)">
                                    <div class="act-icon-wrap" style="background:#ede9fe; color:#7c3aed;">
                                        <span>⚡</span>
                                    </div>
                                    <div class="act-details">
                                        <span class="act-title">DSA Practice Completed</span>
                                        <span class="act-sub">C++ Pointers & Memory Stack (Passed)</span>
                                        <span class="act-time">Today, 10:15 AM</span>
                                    </div>
                                    <span class="act-arrow">›</span>
                                </div>
                                <div class="activity-item" onclick="window.switchSection('arcadeSection', true)">
                                    <div class="act-icon-wrap" style="background:#ecfdf5; color:#059669;">
                                        <span>🌐</span>
                                    </div>
                                    <div class="act-details">
                                        <span class="act-title">Web Dev Topic Mastered</span>
                                        <span class="act-sub">HTML5 Semantic & Accessible Layout</span>
                                        <span class="act-time">Yesterday, 04:30 PM</span>
                                    </div>
                                    <span class="act-arrow">›</span>
                                </div>
                                <div class="activity-item" onclick="window.switchSection('assignmentsSection', true)">
                                    <div class="act-icon-wrap" style="background:#fffbeb; color:#d97706;">
                                        <span>💻</span>
                                    </div>
                                    <div class="act-details">
                                        <span class="act-title">Assessment Submitted</span>
                                        <span class="act-sub">Weekend Lab 02: Structs & Arrays</span>
                                        <span class="act-time">2 days ago</span>
                                    </div>
                                    <span class="act-arrow">›</span>
                                </div>
                            </div>
                        </div>

                        <!-- Achievements Card -->
                        <div class="achievements-banner-card" onclick="window.switchSection('profileSection', true); window.msotPlatform && window.msotPlatform.renderBadgesVault();" style="cursor:pointer;" title="View Badges Vault">
                            <div class="achieve-content">
                                <h4>Achievements & Badges</h4>
                                <div class="achieve-graphic-wrap">
                                    <span class="trophy-badge-icon">🏆</span>
                                    <div class="celebration-avatars">
                                        <span>🧑‍🎓</span>
                                        <span>🎖️</span>
                                        <span>🎉</span>
                                    </div>
                                </div>
                                <div class="achieve-status-pill">
                                    <span>🏅 Academic Star</span>
                                    <span style="color:#7c3aed; font-weight:900;">+250 XP</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        `;
    }

    selectCalDay(btn, dayNum) {
        if (!btn) return;
        document.querySelectorAll('.cal-day-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    shiftCalendar(dir) {
        const titleEl = document.getElementById('calMonthTitle');
        if (!titleEl) return;
        const months = [
            'january 2026', 'february 2026', 'march 2026', 'april 2026',
            'may 2026', 'june 2026', 'july 2026', 'august 2026',
            'september 2026', 'october 2026', 'november 2026', 'december 2026'
        ];
        let cur = months.indexOf(titleEl.innerText.toLowerCase());
        if (cur === -1) cur = 2; // March 2026 default
        let next = cur + dir;
        if (next < 0) next = months.length - 1;
        if (next >= months.length) next = 0;
        titleEl.innerText = months[next];
    }

    cycleGamingSector(dir) {
        if (!window.gamingSectors) {
            window.gamingSectors = [
                {
                    title: 'SECTOR ALPHA // CYBER CITADEL',
                    type: 'Core Algorithmic Arena',
                    curriculum: 'C++ Algorithms & Data Structures',
                    track: 'Systems Architecture & Memory Model',
                    status: 'Active Cadet Deployment • 17 Trials'
                },
                {
                    title: 'SECTOR BETA // NEO-TOKYO WEB CORE',
                    type: 'Interface Engineering & DOM',
                    curriculum: 'Web Architecture & Modern JavaScript',
                    track: 'Async Systems & Dynamic Applications',
                    status: '10 Weekend Trials Unlocked'
                },
                {
                    title: 'SECTOR GAMMA // ASTRAL MATRIX',
                    type: 'Real-Time Arena & Guild Battles',
                    curriculum: 'Competitive Problem Solving & PvP',
                    track: 'Algorithmic Speed & Accuracy Duel',
                    status: 'Cadet League Competition Active'
                }
            ];
            window.currentGamingSectorIdx = 0;
        }
        if (typeof dir === 'number' && dir >= 0 && dir < window.gamingSectors.length) {
            window.currentGamingSectorIdx = dir;
        } else {
            window.currentGamingSectorIdx = ((window.currentGamingSectorIdx || 0) + dir + window.gamingSectors.length) % window.gamingSectors.length;
        }
        const sec = window.gamingSectors[window.currentGamingSectorIdx];
        const t = document.getElementById('hudSectorTitle');
        const type = document.getElementById('hudSectorType');
        const curr = document.getElementById('hudSectorCurriculum');
        const tr = document.getElementById('hudSectorTrack');
        const st = document.getElementById('hudSectorStatus');
        if (t) t.innerHTML = `<span>📍</span><span>${sec.title}</span>`;
        if (type) type.innerText = sec.type;
        if (curr) curr.innerText = sec.curriculum;
        if (tr) tr.innerText = sec.track;
        if (st) st.innerText = sec.status;

        document.querySelectorAll('.gaming-nodes-row .node-pill').forEach((pill, idx) => {
            if (idx === window.currentGamingSectorIdx) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });
    }

    // =========================================================================
    // 1. GAME-LIKE STUDENT HOME DASHBOARD (Matching Section 4 Prompt Specs)
    // =========================================================================
    renderStudentDashboard() {
        const container = document.getElementById('studentDashboardSection');
        if (!container) return;

        const s = window.msotState.student;
        const levelData = calculateLevelData(s.lifetimeXP);
        const quests = window.msotState.quests;

        container.innerHTML = `
            <div class="msot-student-dashboard scroll-reveal">
                <!-- Top Level & Progression Banner -->
                <div class="dash-level-card">
                    <div class="level-badge-display">
                        <span class="lvl-title">LEVEL ${levelData.level}</span>
                        <span class="lvl-sub">ACADEMY RANK: CADET SENIOR</span>
                    </div>

                    <div class="level-progress-block">
                        <div class="level-bar-labels">
                            <span class="xp-ratio">${levelData.currentLevelXP.toLocaleString()} / ${levelData.xpNeededForLevel.toLocaleString()} XP</span>
                            <span class="xp-pct">${levelData.progressPercent}% to Level ${levelData.level + 1}</span>
                        </div>
                        <div class="dash-xp-track">
                            <div class="dash-xp-fill" style="width: ${levelData.progressPercent}%"></div>
                        </div>
                    </div>

                    <div class="level-streak-badge">
                        <span class="streak-flame">🔥 ${s.streak} DAY STREAK</span>
                        <span class="freeze-shield">🛡️ ${s.streakFreezes} Streak Freezes Available</span>
                    </div>
                </div>

                <!-- 3-Column Game Dashboard Grid -->
                <div class="dash-widgets-grid">
                    <!-- Column 1: Today's Mission & Micro-Learning -->
                    <div class="dash-widget-card today-mission">
                        <div class="widget-header">
                            <span class="w-icon">⚡</span>
                            <h4>Today's Mission</h4>
                            <span class="daily-badge">DAILY TRIAL</span>
                        </div>
                        <div class="mission-body">
                            <p class="mission-prompt">5 Speed questions on C++ Pointers and HTML Layouts. Maintain your streak and earn up to +40 XP!</p>
                            <div class="mission-rewards-pill">
                                <span>+15 XP Base</span> • <span>+5 XP / Correct</span> • <span>Streak Shield</span>
                            </div>
                            <button class="primary-btn pulse-glow w-full" onclick="window.msotPlatform.startDailyQuiz()">
                                START DAILY QUIZ ➔
                            </button>
                        </div>
                    </div>

                    <!-- Column 2: Active Quests Checklist -->
                    <div class="dash-widget-card active-quests">
                        <div class="widget-header">
                            <span class="w-icon">📜</span>
                            <h4>Active Quests</h4>
                            <span class="quest-count">${quests.filter(q => !q.completed).length} In Progress</span>
                        </div>
                        <div class="quest-list-body">
                            ${quests.map(q => `
                                <div class="quest-preview-item ${q.completed ? 'completed' : ''}">
                                    <div class="qp-header">
                                        <strong>${q.title}</strong>
                                        <span class="qp-reward">+${q.xpReward} XP</span>
                                    </div>
                                    <div class="qp-tasks">
                                        ${q.tasks.map(t => `
                                            <div class="qp-task-row" onclick="window.msotPlatform.toggleTask('${q.id}', '${t.id}')">
                                                <span class="qp-box ${t.done ? 'checked' : ''}">${t.done ? '✓' : '□'}</span>
                                                <span class="qp-text ${t.done ? 'done' : ''}">${t.text}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Column 3: Leaderboard Standing & Personal Bests -->
                    <div class="dash-widget-card league-personal">
                        <div class="widget-header">
                            <span class="w-icon">🏆</span>
                            <h4>Cohort Standing</h4>
                            <span class="league-gold-badge">Rank #${s.leagueRank || 1}</span>
                        </div>
                        <div class="league-status-body">
                            <div class="league-rank-plate">
                                <span class="lr-rank">Rank #${s.leagueRank || 1} in Cohort</span>
                                <span class="lr-weekly">Weekly XP: <strong>${(s.weeklyXP || 0).toLocaleString()} XP</strong></span>
                            </div>
                            <div class="league-zone-indicator">
                                <span class="zone-text safe">🎯 ${s.questionsSolved || 0} Questions Solved • ${s.streak || 1}d Streak 🔥</span>
                            </div>

                            <div class="personal-bests-preview">
                                <div class="pb-title">👑 Personal Bests</div>
                                ${s.personalBests.map(pb => `
                                    <div class="pb-row">
                                        <span class="pb-metric">${pb.metric}:</span>
                                        <span class="pb-val">${pb.value}</span>
                                    </div>
                                `).join('')}
                            </div>

                            <button class="secondary-btn w-full mt-10" onclick="window.switchSection('leaguesSection')">
                                VIEW FULL LEADERBOARD ➔
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    toggleTask(questId, taskId) {
        const res = window.msotState.toggleQuestTask(questId, taskId);
        if (res && res.questCompleted) {
            if (window.miraiAudio) window.miraiAudio.playBadgeFanfare();
            alert(`🎉 QUEST COMPLETED! Awarded bonus XP and badge reward.`);
        } else {
            if (window.miraiAudio) window.miraiAudio.playClick();
        }
        this.renderStudentDashboard();
        this.renderQuests();
    }

    // =========================================================================
    // 2. DAILY SPEED QUIZ WITH ANTI-CHEATING SAFEGUARDS
    // =========================================================================
    renderDailyQuizCard() {
        const container = document.getElementById('dailyQuizSection');
        if (!container) return;

        const s = window.msotState.student;
        const today = new Date().toLocaleDateString();
        const alreadyDone = s.lastDailyQuizDate === today;

        container.innerHTML = `
            <div class="daily-quiz-card scroll-reveal">
                <div class="dq-header">
                    <div class="dq-icon">⚡</div>
                    <div>
                        <div class="dq-badge">MICRO-LEARNING MODULE // ANTI-CHEAT VERIFIED</div>
                        <h2 class="section-title">DAILY TRIAL OF MASTERY</h2>
                        <p class="section-subtitle">
                            5 Curated speed questions aligned with this week's official syllabus topics. 
                            Features server-side answer verification, randomized options, and rapid-click bot detection.
                        </p>
                    </div>
                </div>

                <div class="dq-metrics">
                    <div class="dq-metric-item">
                        <span class="m-val">5 Questions</span>
                        <span class="m-lbl">Predict Output, Debugging & Bug Spotting</span>
                    </div>
                    <div class="dq-metric-item">
                        <span class="m-val">45 Seconds</span>
                        <span class="m-lbl">Anti-Cheat Rapid Lock Timer</span>
                    </div>
                    <div class="dq-metric-item">
                        <span class="m-val">+40 XP</span>
                        <span class="m-lbl">15 Base XP + 5 Per Correct Question</span>
                    </div>
                </div>

                <div class="anti-cheat-rules-bar">
                    <span class="rule-chip">🛡️ 1 Attempt Per Day</span>
                    <span class="rule-chip">⚡ Rapid-Click Anomaly Flagging</span>
                    <span class="rule-chip">🔀 Randomized Option Order</span>
                    <span class="rule-chip">📋 Copy-Paste Disabled</span>
                </div>

                <div class="dq-cta mt-16">
                    ${alreadyDone ? `
                        <div class="dq-completed-badge">
                            ✅ TODAY'S TRIAL ALREADY SUBMITTED! Your streak is safely preserved. Return tomorrow for new topics.
                        </div>
                    ` : `
                        <button class="primary-btn pulse-glow" onclick="window.msotPlatform.startDailyQuiz()">
                            BEGIN 5-QUESTION SPEED TRIAL ➔
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    startDailyQuiz() {
        const allQuestions = [];

        // 1. Prioritize published questions from Question Bank
        if (window.msotRBAC) {
            const rbacQs = window.msotRBAC.getQuestions('daily_trial', 'published');
            rbacQs.forEach(q => {
                allQuestions.push({
                    q: q.title + (q.description ? `\n\n${q.description}` : ''),
                    code: q.description || '',
                    options: (q.options || []).map(o => o.text),
                    correct: q.correct_answer === 'A' ? 0 : (q.correct_answer === 'B' ? 1 : (q.correct_answer === 'C' ? 2 : 3)),
                    explain: q.explanation || 'Verified correct algorithmic answer.',
                    topic: q.category || 'Syllabus Micro-Trial',
                    gameTitle: 'Daily Trial of Mastery'
                });
            });
        }

        // 2. Supplement with curriculum game questions if fewer than 5
        window.MIRAI_GAMES.forEach(g => {
            g.questions.forEach(q => allQuestions.push({ ...q, gameTitle: g.title }));
        });

        const shuffled = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);

        const dailyGame = {
            id: 'daily_speed_trial',
            track: 'dsa_web',
            trackName: 'Daily Micro-Learning Gauntlet',
            topicNum: 42,
            title: 'Daily Trial of Mastery',
            topic: 'Bi-Weekly Syllabus Synthesis',
            badge: { id: 'quiz_master', name: 'Quiz Master', icon: '🎯', desc: 'Conquered the daily micro-learning gauntlet with verified accuracy!' },
            story: 'This timed gauntlet assesses rapid cognitive recall across C++ DSA and web architecture with server-validated anti-cheat scoring.',
            rules: 'Answer 5 questions. Earn 15 base XP + 5 XP per correct answer. Speed responses under 10 seconds award critical points!',
            mechanic: 'boss_battle',
            questions: shuffled
        };

        window.MIRAI_GAMES.push(dailyGame);
        window.miraiGame.openGame('daily_speed_trial');
        if (window.msotState?.student) {
            window.msotState.student.lastDailyQuizDate = new Date().toLocaleDateString();
            window.msotState.save();
        }
    }

    // =========================================================================
    // 3. QUESTS SYSTEM (Daily, Weekly, Topic Quests)
    // =========================================================================
    renderQuests() {
        const container = document.getElementById('aboutQuestsContainer') || document.getElementById('questsSectionContainer');
        if (!container) return;

        const quests = window.msotState.quests;

        container.innerHTML = `
            <div class="quests-showcase-card scroll-reveal">
                <div class="section-intro-block">
                    <span class="section-tagline">GOAL-DRIVEN CURRICULUM PROGRESSION</span>
                    <h2 class="section-title">ACADEMY QUESTS & CAMPAIGNS</h2>
                    <p class="section-subtitle">
                        Every quest pairs theoretical study with practical problem solving, peer discussion, and revision.
                    </p>
                </div>

                <div class="quests-deck-grid">
                    ${quests.map(q => `
                        <div class="quest-full-card ${q.completed ? 'quest-done' : ''}">
                            <div class="qfc-badge">${q.category}</div>
                            <h3 class="qfc-title">${q.title}</h3>
                            <p class="qfc-desc">${q.description}</p>

                            <div class="qfc-tasks-list">
                                ${q.tasks.map(t => `
                                    <div class="qfc-task-item ${t.done ? 'task-done' : ''}" onclick="window.msotPlatform.toggleTask('${q.id}', '${t.id}')">
                                        <span class="qfc-check">${t.done ? '✓' : '□'}</span>
                                        <span class="qfc-label">${t.text}</span>
                                    </div>
                                `).join('')}
                            </div>

                            <div class="qfc-footer">
                                <div class="qfc-reward">
                                    <span class="r-xp">+${q.xpReward} XP</span>
                                    ${q.badgeReward ? `<span class="r-badge">🏆 ${q.badgeReward}</span>` : ''}
                                </div>
                                <span class="qfc-status">${q.completed ? 'COMPLETED ✓' : 'IN PROGRESS'}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // =========================================================================
    // 4. WEEKLY LEAGUES WITH WEEKLY XP & ANONYMOUS MODE
    // =========================================================================
    renderLeagues() {
        const tbody = document.getElementById('leagueTableBody');
        const anonToggle = document.getElementById('anonModeToggle');
        if (!tbody) return;

        const s = window.msotState.student;
        if (anonToggle) anonToggle.checked = !!s.anonymousMode;

        const anonText = document.getElementById('anonAliasText');
        if (anonText) {
            const alias = s.alias || `@${s.username || 'cadet'}`;
            anonText.innerHTML = `Anonymous Mode (Alias: <strong>${alias}</strong>)`;
        }

        const list = window.msotState.getLeagueStandings ? window.msotState.getLeagueStandings() : [];

        const countEl = document.getElementById('lbCadetCountInfo');
        if (countEl) {
            countEl.innerText = `${list.length} Registered Cadet${list.length === 1 ? '' : 's'} • Ranked by Weekly XP & Questions Solved`;
        }

        if (list.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div style="padding: 40px 16px; text-align: center; color: var(--text-muted);">
                            <div style="font-size: 36px; margin-bottom: 10px;">📋</div>
                            <strong style="color: var(--text-primary); font-size: 15px; display: block; margin-bottom: 6px;">No Registered Cadets in Leaderboard</strong>
                            <p style="font-size: 13px; max-width: 440px; margin: 0 auto;">Register student accounts using the <strong>Register Cadet</strong> tab to start competing and tracking live standings.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const formatTime = (minutes) => {
            if (!minutes || minutes <= 0) return '0h 0m';
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            return `${h}h ${m}m`;
        };

        tbody.innerHTML = list.map((cadet) => {
            const rank = cadet.rank;
            const isSelf = cadet.isSelf;
            const displayName = isSelf && s.anonymousMode 
                ? `${s.alias} (You)` 
                : (isSelf ? `${s.name} (You)` : (s.anonymousMode ? cadet.alias : cadet.name));

            let rankBadgeClass = 'rank-other';
            let rankDisplay = `${rank}`;
            if (rank === 1) {
                rankBadgeClass = 'rank-1';
                rankDisplay = `🥇 1`;
            } else if (rank === 2) {
                rankBadgeClass = 'rank-2';
                rankDisplay = `🥈 2`;
            } else if (rank === 3) {
                rankBadgeClass = 'rank-3';
                rankDisplay = `🥉 3`;
            }

            const moveIcon = cadet.trend === 'up' ? '▲' : (cadet.trend === 'down' ? '▼' : '–');
            const moveClass = cadet.trend === 'up' ? 'up' : (cadet.trend === 'down' ? 'down' : 'same');

            const isPhoto = isSelf && (s.avatar?.startsWith('data:') || s.avatar?.startsWith('http') || s.avatar?.startsWith('/'));

            return `
                <tr class="league-row ${isSelf ? 'current-player' : ''}">
                    <td class="col-rank">
                        <div class="rank-container">
                            <span class="rank-badge ${rankBadgeClass}">${rankDisplay}</span>
                            <span class="trend-icon ${moveClass}" title="Rank Trend">${moveIcon}</span>
                        </div>
                    </td>
                    <td class="col-name">
                        <div class="student-nameplate">
                            <div class="student-avatar-frame ${rank <= 3 ? 'top-tier' : ''}">
                                ${isPhoto 
                                    ? `<img src="${s.avatar}" alt="${displayName}" class="cadet-avatar-img">`
                                    : `<span class="cadet-avatar-char">${isSelf ? s.avatar : (cadet.avatar || '👤')}</span>`
                                }
                            </div>
                            <div class="student-info-col">
                                <div class="student-name-row">
                                    <span class="student-name-text">${displayName}</span>
                                    ${isSelf ? '<span class="you-pill">YOU</span>' : ''}
                                    ${rank === 1 ? '<span class="crown-icon" title="Leader">👑</span>' : ''}
                                </div>
                                <div class="student-meta-sub">
                                    <span class="cadet-handle">${cadet.handle || cadet.alias}</span>
                                    <span class="bullet-dot">•</span>
                                    <span class="cadet-section-tag">${cadet.section || 'Section Alpha'}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="col-solved">
                        <div class="solved-cell">
                            <span class="solved-count-pill">
                                <span class="sc-icon">🎯</span>
                                <strong>${cadet.questionsSolved || 0}</strong> Solved
                            </span>
                        </div>
                    </td>
                    <td class="col-xp">
                        <div class="xp-cell">
                            <span class="weekly-xp-pill">
                                <span class="xp-bolt">⚡</span>
                                <strong>${(cadet.weeklyXP || 0).toLocaleString()}</strong> XP
                            </span>
                        </div>
                    </td>
                    <td class="col-streak">
                        <div class="streak-cell">
                            <span class="weekly-streak-pill">
                                <span class="streak-flame">🔥</span>
                                <strong>${cadet.streak || 0}</strong> Days
                            </span>
                        </div>
                    </td>
                    <td class="col-time">
                        <div class="time-cell">
                            <span class="time-spent-pill">
                                <span class="time-clock">⏱️</span>
                                <strong>${formatTime(cadet.weeklyTimeSpentMinutes || 0)}</strong>
                            </span>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        if (window.msotGuild && typeof window.msotGuild.render === 'function') {
            window.msotGuild.render();
        }
    }

    toggleAnonymousMode() {
        const isAnon = window.msotState.toggleAnonymousMode();
        this.renderLeagues();
        this.renderFairnessBoards();
        this.renderStudentDashboard();
        if (window.msotGuild && typeof window.msotGuild.render === 'function') {
            window.msotGuild.render();
        }
        if (window.miraiAudio) window.miraiAudio.playClick();
    }

    // =========================================================================
    // 5. MULTI-DIMENSIONAL FAIRNESS LEADERBOARDS (Section 15)
    // =========================================================================
    renderFairnessBoards() {
        const container = document.getElementById('aboutFairnessContainer') || document.getElementById('fairnessLeaderboardContainer');
        if (!container) return;

        const fairness = window.msotState.fairness;
        const tab = this.activeFairnessTab;
        const isAnon = window.msotState.student.anonymousMode;

        container.innerHTML = `
            <div class="fairness-card scroll-reveal">
                <div class="fairness-header">
                    <div>
                        <span class="fairness-tag">PRINCIPLE: FAIR & INCLUSIVE COMPETITION</span>
                        <h2 class="section-title">MULTI-PATH ACHIEVEMENT BOARDS</h2>
                        <p class="section-subtitle">
                            Every student can shine: compete on Weekly XP, Celebrate Massive Improvement (+34%), 
                            or prove consistency via continuous learning streaks.
                        </p>
                    </div>
                    <div class="fairness-tabs">
                        <button class="f-tab ${tab === 'weeklyXP' ? 'active' : ''}" onclick="window.msotPlatform.setFairnessTab('weeklyXP')">🏆 WEEKLY XP</button>
                        <button class="f-tab ${tab === 'mostImproved' ? 'active' : ''}" onclick="window.msotPlatform.setFairnessTab('mostImproved')">🚀 MOST IMPROVED</button>
                        <button class="f-tab ${tab === 'consistency' ? 'active' : ''}" onclick="window.msotPlatform.setFairnessTab('consistency')">🔥 CONSISTENCY</button>
                    </div>
                </div>

                <div class="fairness-content-table">
                    ${this.renderFairnessTableContent(fairness, tab, isAnon)}
                </div>
            </div>
        `;
    }

    setFairnessTab(tabName) {
        this.activeFairnessTab = tabName;
        this.renderFairnessBoards();
        if (window.miraiAudio) window.miraiAudio.playClick();
    }

    renderFairnessTableContent(fairness, tab, isAnon) {
        const cadets = window.msotState.getLeagueStandings ? window.msotState.getLeagueStandings() : [];
        const s = window.msotState.student;

        if (!cadets || cadets.length === 0) {
            return `
                <div style="padding: 32px 16px; text-align: center; color: var(--text-muted);">
                    <div style="font-size: 28px; margin-bottom: 6px;">📋</div>
                    <strong style="color: var(--text-primary); font-size: 14px;">No Registered Cadets in Standings</strong>
                    <p style="font-size: 12px; margin-top: 4px;">Registered cadets will automatically appear on the multi-dimensional achievement boards.</p>
                </div>
            `;
        }

        if (tab === 'weeklyXP') {
            return `
                <table class="fairness-table">
                    <thead>
                        <tr><th>RANK</th><th>CADET</th><th>ACTIVE STREAK</th><th>WEEKLY XP TOTAL</th></tr>
                    </thead>
                    <tbody>
                        ${cadets.map(item => {
                            const displayName = item.isSelf && isAnon ? `${s.alias} (You)` : (item.isSelf ? `${s.name} (You)` : (isAnon ? item.alias : item.name));
                            return `
                                <tr class="${item.isSelf ? 'current-player' : ''}">
                                    <td><span class="rank-badge ${item.rank <= 3 ? 'top' : ''}">${item.rank}</span></td>
                                    <td><strong>${displayName}</strong></td>
                                    <td>${item.streak || 1} Days 🔥</td>
                                    <td><span class="xp-val-green">+${(item.weeklyXP || 0).toLocaleString()} XP</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        } else if (tab === 'mostImproved') {
            const sortedBySolved = [...cadets].sort((a, b) => (b.questionsSolved || 0) - (a.questionsSolved || 0));
            return `
                <table class="fairness-table">
                    <thead>
                        <tr><th>RANK</th><th>CADET</th><th>QUESTIONS SOLVED</th><th>LEARNING PACE</th></tr>
                    </thead>
                    <tbody>
                        ${sortedBySolved.map((item, idx) => {
                            const rank = idx + 1;
                            const displayName = item.isSelf && isAnon ? `${s.alias} (You)` : (item.isSelf ? `${s.name} (You)` : (isAnon ? item.alias : item.name));
                            const rate = (item.questionsSolved || 0) >= 10 ? '+34% Velocity' : ((item.questionsSolved || 0) >= 5 ? '+20% Velocity' : '+10% Active');
                            return `
                                <tr class="${item.isSelf ? 'current-player' : ''}">
                                    <td><span class="rank-badge ${rank <= 3 ? 'top' : ''}">${rank}</span></td>
                                    <td><strong>${displayName}</strong></td>
                                    <td><span class="badge-improved">${item.questionsSolved || 0} Questions Solved</span></td>
                                    <td>${rate} across curriculum</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        } else if (tab === 'consistency') {
            const sortedByStreak = [...cadets].sort((a, b) => (b.streak || 0) - (a.streak || 0));
            return `
                <table class="fairness-table">
                    <thead>
                        <tr><th>RANK</th><th>CADET</th><th>UNBROKEN STUDY STREAK</th><th>STATUS</th></tr>
                    </thead>
                    <tbody>
                        ${sortedByStreak.map((item, idx) => {
                            const rank = idx + 1;
                            const displayName = item.isSelf && isAnon ? `${s.alias} (You)` : (item.isSelf ? `${s.name} (You)` : (isAnon ? item.alias : item.name));
                            return `
                                <tr class="${item.isSelf ? 'current-player' : ''}">
                                    <td><span class="rank-badge ${rank <= 3 ? 'top' : ''}">${rank}</span></td>
                                    <td><strong>${displayName}</strong></td>
                                    <td><strong>${item.streak || 1} Days Continuous</strong></td>
                                    <td><span class="consistency-tag">🔥 ${item.streak || 1}-Day Streak</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }
    }

    // =========================================================================
    // 5B. ABOUT ACADEMY & PEDAGOGY BLUEPRINT (FACULTY & ADMIN ONLY)
    // =========================================================================
    renderAboutSection() {
        const container = document.getElementById('aboutSectionContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="about-pedagogy-wrapper">
                <!-- 1. Header Banner -->
                <div class="about-hero-banner">
                    <div class="about-hero-badge">
                        <span class="live-pulse-dot" style="background: #38bdf8;"></span>
                        PEDAGOGICAL & CURRICULUM BLUEPRINT • ACADEMY OVERVIEW
                    </div>
                    <h1 class="about-hero-title">About MSOT Learn: Fair & Inclusive Learning Architecture</h1>
                    <p class="about-hero-sub">
                        A transparent, comprehensive guide for all cadets, faculty, and administrators on how our educational gamification system works,
                        why it prevents student burnout, and how multi-path achievement metrics give every student a fair chance to succeed.
                    </p>
                    <div class="about-quick-tags">
                        <span class="aq-tag">⛩️ Mirai Academy Guide</span>
                        <span class="aq-tag">⚖️ Multi-Path Fairness</span>
                        <span class="aq-tag">📈 +34% Improvement Tracking</span>
                        <span class="aq-tag">🔥 Daily Habit Streaks</span>
                        <span class="aq-tag">🛡️ Anti-Burnout Design</span>
                    </div>
                </div>

                <!-- 2. Core Philosophy & Inclusive Gamification -->
                <div class="about-card">
                    <div class="about-card-header">
                        <div class="ach-icon-circle" style="background: rgba(0,240,255,0.1); border-color: rgba(0,240,255,0.3); color: #00f0ff;">💡</div>
                        <div>
                            <span class="about-section-tag">CORE TEACHING PHILOSOPHY</span>
                            <h2 class="about-card-title">Why MSOT Learn is Built Differently</h2>
                            <p class="about-card-desc">Understanding our solution to the "Top-10% Trap" in computer science education.</p>
                        </div>
                    </div>
                    <div class="about-prose">
                        <p>
                            In traditional college computer science courses, standard grade curves and public leaderboards often create anxiety. 
                            The top 10% of students—frequently those with prior programming backgrounds before college—dominate the ranks. 
                            Meanwhile, hard-working students in the bottom and middle quartiles become discouraged, feel they "aren't cut out for coding," and give up.
                        </p>
                        <p>
                            <strong>MSOT Learn was designed to solve this problem.</strong> Our core philosophy is <em>Inclusive Gamification</em>: 
                            rewarding personal progress, unbroken effort, and peer collaboration so that any student who puts in steady practice can experience the joy of achievement and build true coding confidence.
                        </p>
                    </div>

                    <div class="about-pillars-grid">
                        <div class="about-pillar-box">
                            <div class="apb-icon">🌱</div>
                            <h3 class="apb-title">1. Growth Over Raw Speed</h3>
                            <p class="apb-desc">Students are evaluated against their own baseline rather than being penalized for taking longer on their first try.</p>
                        </div>
                        <div class="about-pillar-box">
                            <div class="apb-icon">📅</div>
                            <h3 class="apb-title">2. Daily Habit Consistency</h3>
                            <p class="apb-desc">Solving 1 problem every single day creates vastly better neural retention than pulling an all-nighter before exam deadlines.</p>
                        </div>
                        <div class="about-pillar-box">
                            <div class="apb-icon">🤝</div>
                            <h3 class="apb-title">3. Collaborative Debugging</h3>
                            <p class="apb-desc">Real software engineers work in teams. Quests reward students for explaining solutions and helping classmates fix memory leaks.</p>
                        </div>
                    </div>
                </div>

                <!-- 3. Principle: Fair & Inclusive Competition (Multi-Path Achievement Boards) -->
                <div class="about-card" style="border-color: rgba(168, 85, 247, 0.35);">
                    <div class="about-card-header">
                        <div class="ach-icon-circle" style="background: rgba(168, 85, 247, 0.1); border-color: rgba(168, 85, 247, 0.3); color: #c084fc;">⚖️</div>
                        <div>
                            <span class="about-section-tag" style="color: #c084fc;">PRINCIPLE: FAIR & INCLUSIVE COMPETITION</span>
                            <h2 class="about-card-title">Multi-Path Achievement Boards Explained</h2>
                            <p class="about-card-desc">Three distinct ways for every student to shine and earn cohort recognition.</p>
                        </div>
                    </div>
                    <div class="about-prose">
                        <p>
                            To prevent single-metric discouragement, we divide academic achievement into three separate, transparent tracks:
                        </p>
                    </div>
                    <div class="about-tracks-grid">
                        <div class="about-track-item">
                            <span class="ati-badge" style="background: rgba(234, 179, 8, 0.15); color: #fbbf24; border: 1px solid rgba(234, 179, 8, 0.3);">🏆 Track 1: Weekly XP Total</span>
                            <h4 class="ati-title">Volume & Effort</h4>
                            <p class="ati-text">Measures the total quantity of problems, arcade puzzles, and compiler assignments solved during the current 7-day academic cycle.</p>
                        </div>
                        <div class="about-track-item">
                            <span class="ati-badge" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3);">🚀 Track 2: Most Improved (+34%)</span>
                            <h4 class="ati-title">Velocity & Comeback</h4>
                            <p class="ati-text">Celebrates students who made the largest percentage jump from their historical test scores. A student jumping from 35% to 70% gets top billing!</p>
                        </div>
                        <div class="about-track-item">
                            <span class="ati-badge" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3);">🔥 Track 3: Consistency Streaks</span>
                            <h4 class="ati-title">Habit & Resilience</h4>
                            <p class="ati-text">Tracks unbroken consecutive study days. Streak Freezes protect students if an emergency happens, keeping motivation intact.</p>
                        </div>
                    </div>

                    <!-- Embedded Interactive Live Fairness Board Container -->
                    <div class="about-live-embed-wrap">
                        <div class="alew-label">
                            <span>📊 LIVE INTERACTIVE PREVIEW (FACULTY & ADMIN INSPECTOR)</span>
                            <span style="font-size: 11px; opacity: 0.7;">Click tabs below to inspect current cohort data</span>
                        </div>
                        <div id="aboutFairnessContainer"></div>
                    </div>
                </div>

                <!-- 4. Goal-Driven Curriculum Progression (Academy Quests & Campaigns) -->
                <div class="about-card" style="border-color: rgba(16, 185, 129, 0.35);">
                    <div class="about-card-header">
                        <div class="ach-icon-circle" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); color: #34d399;">🎯</div>
                        <div>
                            <span class="about-section-tag" style="color: #34d399;">GOAL-DRIVEN CURRICULUM PROGRESSION</span>
                            <h2 class="about-card-title">Academy Quests & Campaigns Framework</h2>
                            <p class="about-card-desc">How paired theoretical and practical tasks replace passive textbook reading.</p>
                        </div>
                    </div>
                    <div class="about-prose">
                        <p>
                            Instead of giving students open-ended textbook chapters, MSOT Learn bundles syllabus requirements into structured <strong>Academy Quests</strong>. 
                            Each quest pairs four essential learning actions:
                        </p>
                        <ul class="about-quest-pillars-list">
                            <li><strong>1. Theoretical Foundation:</strong> Understanding underlying data structures, memory layout, and computational limits.</li>
                            <li><strong>2. Practical Problem Solving:</strong> Writing, compiling, and passing unit tests in the Weekend Compiler Lab.</li>
                            <li><strong>3. Diagnostic Speed Quiz:</strong> Verifying memory retention and edge-case comprehension under gentle time limits.</li>
                            <li><strong>4. Peer Revision & Mentorship:</strong> Reviewing code with peers to build communication and debugging articulation.</li>
                        </ul>
                    </div>

                    <!-- Embedded Interactive Live Quests Deck Container -->
                    <div class="about-live-embed-wrap">
                        <div class="alew-label">
                            <span>🎮 LIVE INTERACTIVE QUESTS PREVIEW (FACULTY & ADMIN INSPECTOR)</span>
                            <span style="font-size: 11px; opacity: 0.7;">Inspect live topic, daily, and weekly quest requirements</span>
                        </div>
                        <div id="aboutQuestsContainer"></div>
                    </div>
                </div>

                <!-- 5. Faculty & Administrator Actionable Guide -->
                <div class="about-card" style="border-color: rgba(245, 158, 11, 0.35);">
                    <div class="about-card-header">
                        <div class="ach-icon-circle" style="background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3); color: #fbbf24;">📋</div>
                        <div>
                            <span class="about-section-tag" style="color: #fbbf24;">OPERATIONAL BEST PRACTICES</span>
                            <h2 class="about-card-title">How Faculty & Admins Should Use This Data</h2>
                            <p class="about-card-desc">Practical tips for office hours, syllabus pacing, and early student intervention.</p>
                        </div>
                    </div>
                    <div class="about-roles-guide-grid">
                        <div class="arg-column">
                            <h3 class="arg-col-title" style="color: #c084fc;">🎓 For Faculty Members</h3>
                            <div class="arg-item">
                                <strong>Early Warning Radar:</strong> Check the Consistency Board weekly. When a student's streak drops to 0 or 1 day, they are likely stuck on a concept. Reach out proactively before exam dropouts occur.
                            </div>
                            <div class="arg-item">
                                <strong>Curriculum Tuning:</strong> When authoring new Daily Trials or Weekend Labs in your Faculty Terminal, target the specific subtopics where diagnostic quiz averages dipped below 70%.
                            </div>
                            <div class="arg-item">
                                <strong>Praise the "Most Improved":</strong> Dedicate 2 minutes in your weekly lecture to shout out students on the Most Improved board. It transforms classroom culture.
                            </div>
                        </div>
                        <div class="arg-column">
                            <h3 class="arg-col-title" style="color: #ff2a4b;">🛡️ For System Administrators</h3>
                            <div class="arg-item">
                                <strong>XP Economy Calibration:</strong> Use the Admin XP Rules console to calibrate daily quiz XP, streak multipliers, and weekend bonuses so gamification stays healthy.
                            </div>
                            <div class="arg-item">
                                <strong>User Governance:</strong> Manage faculty roles, deactivate unauthorized accounts, and review real-time audit logs of all platform administrative events.
                            </div>
                            <div class="arg-item">
                                <strong>Server-Side Security:</strong> All XP awards, test submissions, and badges are protected by Supabase PostgreSQL Row Level Security (RLS) to ensure verifiable grading.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render embedded live boards inside this section
        this.renderFairnessBoards();
        this.renderQuests();
    }

    // =========================================================================
    // 6. REAL-TIME TEAM BATTLES (Section A vs Section B Sprint)
    // =========================================================================
    renderTeamBattles() {
        const container = document.getElementById('teamBattleSection');
        if (!container) return;

        const battle = window.msotState.battle;
        const totalPoints = battle.sectionA.points + battle.sectionB.points;
        const pctA = Math.round((battle.sectionA.points / totalPoints) * 100);
        const pctB = 100 - pctA;

        container.innerHTML = `
            <div class="team-battle-wrapper scroll-reveal">
                <!-- Section Alpha vs Section Beta Real-Time Sprint Banner -->
                <div class="section-battle-card">
                    <div class="sbc-header">
                        <div>
                            <span class="ba-tag">INTER-SECTION COMPETITIVE ARENA</span>
                            <h2 class="section-title">SECTION ALPHA vs SECTION BETA: CODING SPRINT</h2>
                            <p class="section-subtitle">Event Duration: ${battle.duration} • ${battle.scoringGuide}</p>
                        </div>
                        <div class="ba-live-indicator"><span class="pulse-dot"></span> 300 USERS LIVE TICKING</div>
                    </div>

                    <!-- Progress Clash Tug-of-War -->
                    <div class="sprint-clash-bar">
                        <div class="clash-side a" style="width: ${pctA}%">
                            <span class="clash-label">${battle.sectionA.name} (${pctA}%)</span>
                            <span class="clash-pts">${battle.sectionA.points.toLocaleString()} XP</span>
                        </div>
                        <div class="clash-side b" style="width: ${pctB}%">
                            <span class="clash-label">${battle.sectionB.name} (${pctB}%)</span>
                            <span class="clash-pts">${battle.sectionB.points.toLocaleString()} XP</span>
                        </div>
                    </div>

                    <!-- Live Real-Time Submissions Feed -->
                    <div class="sprint-recent-feed">
                        <div class="srf-title">⚡ Real-Time Verified Solutions Stream (Simulated Atomic Transactions):</div>
                        <div class="srf-stream" id="sprintLiveFeed">
                            ${battle.recentSubmissions.map(sub => `
                                <div class="srf-item">
                                    <span class="srf-dot">●</span>
                                    <span class="srf-cadet">${sub.cadet}</span> solved
                                    <strong>${sub.problem}</strong> (${sub.diff})
                                    <span class="srf-xp">+${sub.xp} XP</span>
                                    <span class="srf-time">${sub.time}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Tri-Campus Faction War Showcase -->
                <div class="tri-campus-section mt-30">
                    <h3 class="panel-title">Tri-Campus Guild Alliance</h3>
                    <div class="factions-grid">
                        ${Object.values(window.miraiState.factions || {}).map(f => `
                            <div class="faction-card" style="--faction-color: ${f.color}">
                                <div class="faction-banner-icon">${f.banner}</div>
                                <div class="faction-kanji">${f.kanji}</div>
                                <h3 class="faction-title">${f.name}</h3>
                                <p class="faction-motto">"${f.motto}"</p>
                                <div class="faction-score-plate">
                                    <span class="f-score-val">${f.points.toLocaleString()}</span>
                                    <span class="f-score-lbl">GUILD SCORE</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    startLiveBattleTicks() {
        if (this.battleTimerInterval) clearInterval(this.battleTimerInterval);
        this.battleTimerInterval = setInterval(() => {
            const battle = window.msotState.battle;
            if (!battle) return;

            const isA = Math.random() > 0.48;
            const diffs = [
                { name: 'Easy', xp: 10, prob: 'String Palindrome Two-Pointer' },
                { name: 'Medium', xp: 20, prob: 'Depth First Search Cycle Detection' },
                { name: 'Hard', xp: 40, prob: 'Dynamic Programming Knapsack Matrix' }
            ];
            const chosen = diffs[Math.floor(Math.random() * diffs.length)];

            if (isA) {
                battle.sectionA.points += chosen.xp;
                battle.sectionA.solvedCount++;
            } else {
                battle.sectionB.points += chosen.xp;
                battle.sectionB.solvedCount++;
            }

            const stream = document.getElementById('sprintLiveFeed');
            if (stream) {
                const item = document.createElement('div');
                item.className = 'srf-item';
                item.innerHTML = `
                    <span class="srf-dot">●</span>
                    <span class="srf-cadet">${isA ? 'Section Alpha Cadet' : 'Section Beta Cadet'}</span> solved
                    <strong>${chosen.prob}</strong> (${chosen.name})
                    <span class="srf-xp">+${chosen.xp} XP</span>
                    <span class="srf-time">Just now</span>
                `;
                stream.prepend(item);
                if (stream.children.length > 5) stream.lastElementChild.remove();
            }

            // Update percentage bar
            const total = battle.sectionA.points + battle.sectionB.points;
            const pctA = Math.round((battle.sectionA.points / total) * 100);
            const sideA = document.querySelector('.clash-side.a');
            const sideB = document.querySelector('.clash-side.b');
            if (sideA && sideB) {
                sideA.style.width = `${pctA}%`;
                sideB.style.width = `${100 - pctA}%`;
            }
        }, 2200);
    }

    // =========================================================================
    // 7. COMPREHENSIVE 5-CATEGORY BADGES VAULT (Section 12)
    // =========================================================================
    renderBadgesVault() {
        const container = document.getElementById('badgesVaultContainer');
        if (!container) return;

        const earnedList = Array.isArray(window.msotState.student?.badges) ? window.msotState.student.badges : [];
        const cat = this.activeBadgeFilter;

        let badgesToShow = [];
        if (cat === 'all') {
            Object.values(ALL_BADGES_CATALOG).forEach(list => badgesToShow.push(...list));
        } else if (ALL_BADGES_CATALOG[cat]) {
            badgesToShow = ALL_BADGES_CATALOG[cat];
        }

        container.innerHTML = `
            <div class="badges-vault-card scroll-reveal">
                <div class="section-intro-block">
                    <span class="section-tagline">FIVE RECOGNITION CATEGORIES</span>
                    <h2 class="section-title">HOLOGRAPHIC BADGES & TROPHY VAULT</h2>
                    <p class="section-subtitle">
                        Learning, Consistency, Improvement, Community, and Challenge badges celebrate every kind of effort.
                    </p>
                </div>

                <!-- Category Filters -->
                <div class="badge-cat-tabs">
                    <button class="b-cat-btn ${cat === 'all' ? 'active' : ''}" onclick="window.msotPlatform.setBadgeFilter('all')">ALL BADGES</button>
                    <button class="b-cat-btn ${cat === 'learning' ? 'active' : ''}" onclick="window.msotPlatform.setBadgeFilter('learning')">LEARNING</button>
                    <button class="b-cat-btn ${cat === 'consistency' ? 'active' : ''}" onclick="window.msotPlatform.setBadgeFilter('consistency')">CONSISTENCY</button>
                    <button class="b-cat-btn ${cat === 'improvement' ? 'active' : ''}" onclick="window.msotPlatform.setBadgeFilter('improvement')">IMPROVEMENT</button>
                    <button class="b-cat-btn ${cat === 'community' ? 'active' : ''}" onclick="window.msotPlatform.setBadgeFilter('community')">COMMUNITY</button>
                    <button class="b-cat-btn ${cat === 'challenge' ? 'active' : ''}" onclick="window.msotPlatform.setBadgeFilter('challenge')">CHALLENGE</button>
                </div>

                <div class="badges-grid mt-24">
                    ${badgesToShow.map(b => {
                        const earned = earnedList.includes(b.id);
                        return `
                            <div class="badge-card ${earned ? 'earned' : 'locked'}">
                                <div class="badge-cat-tag">${b.cat}</div>
                                <div class="badge-icon-wrap">${b.icon}</div>
                                <div class="badge-name">${b.name}</div>
                                <div class="badge-desc">${b.desc}</div>
                                <span class="badge-status-tag">${earned ? 'UNLOCKED ✨' : 'LOCKED 🔒'}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    setBadgeFilter(catName) {
        this.activeBadgeFilter = catName;
        this.renderBadgesVault();
        if (window.miraiAudio) window.miraiAudio.playClick();
    }

    // =========================================================================
    // 8. FACULTY DASHBOARD & QUESTION MANAGEMENT (Three-Role RBAC)
    // =========================================================================
    switchFacultySubTab(tab) {
        this.facultySubTab = tab;
        this.renderFacultyDashboard();
        if (window.miraiAudio) window.miraiAudio.playClick?.();
    }

    switchFacultyStudentView(mode) {
        this.facultyStudentsViewMode = mode;
        this.renderFacultyDashboard();
        if (window.miraiAudio) window.miraiAudio.playClick?.();
    }

    selectFacultyStudent(email) {
        this.selectedFacultyStudentEmail = email;
        this.renderFacultyDashboard();
        if (window.miraiAudio) window.miraiAudio.playClick?.();
    }

    cycleFacultyStudent(direction) {
        const rbac = window.msotRBAC;
        const students = rbac ? rbac.getStudentUsers() : [];
        if (!students.length) return;
        const currentIndex = students.findIndex(s => s.email.toLowerCase() === (this.selectedFacultyStudentEmail || students[0].email).toLowerCase());
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = students.length - 1;
        if (newIndex >= students.length) newIndex = 0;
        this.selectedFacultyStudentEmail = students[newIndex].email;
        this.renderFacultyDashboard();
        if (window.miraiAudio) window.miraiAudio.playClick?.();
    }

    renderFacultyDashboard() {
        const container = document.getElementById('facultyDashboardSection');
        if (!container) return;

        const rawRole = (window.msotRBAC ? window.msotRBAC.getCurrentRole() : (this.activeRole || window.msotState?.currentRole || 'STUDENT')).toUpperCase();
        if (rawRole === 'STUDENT') {
            container.innerHTML = `
                <div class="dashboard-panel scroll-reveal" style="text-align: center; padding: 60px 24px;">
                    <div style="font-size: 52px; margin-bottom: 14px;">🎓🔒</div>
                    <h2 class="section-title" style="color: #f59e0b; font-family: var(--font-cyber);">RESTRICTED AREA // FACULTY ACCESS REQUIRED</h2>
                    <p class="section-subtitle" style="max-width: 640px; margin: 12px auto; color: var(--text-dim);">
                        The Faculty Dashboard is reserved for Academic Instructors and Administrators.
                        <strong>Students cannot access this evaluation section.</strong>
                    </p>
                    <div style="margin-top: 24px; display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
                        <button class="primary-btn" onclick="window.switchSection('dashboardSection', true)">➔ GO TO STUDENT DASHBOARD</button>
                    </div>
                </div>
            `;
            return;
        }

        const isAdmin = (rawRole === 'ADMIN' || (window.msotAuth?.session?.role || '').toUpperCase() === 'ADMIN' || window.msotAuth?.session?.email === 'admin@msot.edu');
        const isFaculty = rawRole === 'FACULTY' || (window.msotAuth?.session?.role || '').toUpperCase() === 'FACULTY';
        const currentRole = isAdmin ? 'ADMIN' : (isFaculty ? 'FACULTY' : 'FACULTY');

        const rbac = window.msotRBAC;
        const activeTab = this.facultySubTab || 'students';
        const user = window.msotAuth?.session || { name: 'Utkarsh Raj', email: 'admin@msot.edu', role: 'ADMIN' };
        
        const students = rbac ? rbac.getStudentUsers() : [];
        const assignments = rbac ? rbac.getAssignments(currentRole, user.email) : [];
        const submissions = rbac ? rbac.submissions : [];
        const reasons = rbac ? rbac.inactivityReasons : [];
        const messages = rbac ? (rbac.getStudentMessages ? rbac.getStudentMessages(user.email) : (rbac.getMessages ? rbac.getMessages(user.email) : (rbac.messages || []))) : [];
        const questions = rbac ? rbac.getQuestions('ALL', 'ALL') : [];
        const myQuestions = questions.filter(q => currentRole === 'ADMIN' || (q.creator_email && q.creator_email.toLowerCase() === (user.email || '').toLowerCase()));

        // Student activity metrics
        let activeCount = 0, recentlyCount = 0, inactiveCount = 0, longInactiveCount = 0;
        students.forEach(s => {
            const act = rbac ? rbac.calculateActivity(s.lastActive) : { status: 'ACTIVE' };
            if (act.status === 'ACTIVE') activeCount++;
            else if (act.status === 'RECENTLY_ACTIVE') recentlyCount++;
            else if (act.status === 'INACTIVE') inactiveCount++;
            else if (act.status === 'LONG_INACTIVE') longInactiveCount++;
        });

        const pendingReasonsCount = reasons.filter(r => r.status === 'PENDING').length;
        const pendingSubmissionsCount = submissions.filter(s => s.status === 'SUBMITTED' || !s.grade).length;

        // Filtering for students tab
        const sQuery = (this.facultyStudentQuery || '').toLowerCase();
        const sSecFilter = this.facultySectionFilter || 'ALL';
        const sActFilter = this.facultyActivityFilter || 'ALL';

        const filteredStudents = students.filter(s => {
            const matchesQuery = !sQuery || (
                (s.name && s.name.toLowerCase().includes(sQuery)) ||
                (s.email && s.email.toLowerCase().includes(sQuery)) ||
                (s.studentId && s.studentId.toLowerCase().includes(sQuery))
            );
            const matchesSec = (sSecFilter === 'ALL') || (s.academicSection === sSecFilter);
            const act = rbac ? rbac.calculateActivity(s.lastActive) : { status: 'ACTIVE' };
            const matchesAct = (sActFilter === 'ALL') || (act.status === sActFilter);
            return matchesQuery && matchesSec && matchesAct;
        });

        container.innerHTML = `
            <div class="faculty-card scroll-reveal in-view" style="opacity: 1 !important;">
                ${isAdmin ? `
                    <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.18)); border: 1px solid rgba(245, 158, 11, 0.5); border-radius: 14px; padding: 12px 20px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 22px;">🛡️</span>
                            <div>
                                <strong style="color: #f59e0b; font-size: 13px; font-family: var(--font-mono);">MASTER ADMINISTRATOR OPERATING IN FACULTY VIEW</strong>
                                <div style="font-size: 11.5px; color: #e2e8f0;">You have complete platform control. You can see and change all student character flashcards, grade submissions, excuse leave reasons, and modify coursework.</div>
                            </div>
                        </div>
                        <div style="display:flex;gap:10px;align-items:center;">
                            <button type="button" class="btn-action-sm highlight" onclick="window.switchSection('adminSection', true)" style="white-space: nowrap;">
                                🛡️ SWITCH TO ADMIN CONSOLE ➔
                            </button>
                        </div>
                    </div>
                ` : (!isFaculty ? `
                    <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.16), rgba(59, 130, 246, 0.16)); border: 1.5px solid rgba(168, 85, 247, 0.45); border-radius: 14px; padding: 12px 20px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 22px;">🎓</span>
                            <div>
                                <strong style="color: #c084fc; font-size: 13px; font-family: var(--font-mono);">FACULTY INSTRUCTION DESK // CADET DOSSIER & FLASHCARD INSPECTOR</strong>
                                <div style="font-size: 11.5px; color: #e2e8f0;">Viewing full cadet character flashcards and academic progression. Click any cadet portrait to pop up the flashcard!</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button type="button" class="btn-action-sm highlight" onclick="window.msotPlatform && window.msotPlatform.setEffectiveRole('FACULTY', event)" style="white-space: nowrap;">
                                🎓 FACULTY EDIT MODE
                            </button>
                            <button type="button" class="btn-action-sm" onclick="window.msotPlatform && window.msotPlatform.setEffectiveRole('ADMIN', event)" style="white-space: nowrap;">
                                🛡️ ADMIN MODE
                            </button>
                        </div>
                    </div>
                ` : '')}

                <!-- Faculty Sub-Navigation Strip (CHARACTERS as primary #1 tab) -->
                <div class="faculty-subnav-bar">
                    <button type="button" class="faculty-subnav-btn ${activeTab === 'students' ? 'active' : ''}" onclick="window.msotPlatform.switchFacultySubTab('students')">
                        🎴 CHARACTERS // STUDENTS (${students.length})
                    </button>
                    <button type="button" class="faculty-subnav-btn ${activeTab === 'overview' ? 'active' : ''}" onclick="window.msotPlatform.switchFacultySubTab('overview')">
                        📊 OVERVIEW
                    </button>
                    <button type="button" class="faculty-subnav-btn ${activeTab === 'activity' ? 'active' : ''}" onclick="window.msotPlatform.switchFacultySubTab('activity')">
                        ⏱️ STUDENT ACTIVITY (${inactiveCount + longInactiveCount} Attention)
                    </button>
                    <button type="button" class="faculty-subnav-btn ${activeTab === 'assignments' ? 'active' : ''}" onclick="window.msotPlatform.switchFacultySubTab('assignments')">
                        📚 ASSIGNMENTS (${assignments.length})
                    </button>
                    <button type="button" class="faculty-subnav-btn ${activeTab === 'submissions' ? 'active' : ''}" onclick="window.msotPlatform.switchFacultySubTab('submissions')">
                        📝 SUBMISSIONS (${submissions.length})
                    </button>
                    <button type="button" class="faculty-subnav-btn ${activeTab === 'reasons' ? 'active' : ''}" onclick="window.msotPlatform.switchFacultySubTab('reasons')">
                        📬 INACTIVITY REASONS (${pendingReasonsCount} New)
                    </button>
                    <button type="button" class="faculty-subnav-btn ${activeTab === 'messages' ? 'active' : ''}" onclick="window.msotPlatform.switchFacultySubTab('messages')">
                        💬 MESSAGES (${messages.length})
                    </button>
                    <button type="button" class="faculty-subnav-btn ${activeTab === 'questions' ? 'active' : ''}" onclick="window.msotPlatform.switchFacultySubTab('questions')">
                        ❓ QUESTION BANK (${myQuestions.length})
                    </button>
                    <button type="button" class="faculty-subnav-btn faculty-action-btn-highlight" onclick="window.msotRBAC && window.msotRBAC.openAssignmentModal()">
                        ➕ CREATE ASSIGNMENT
                    </button>
                </div>

                <!-- 1. OVERVIEW TAB -->
                ${activeTab === 'overview' ? `
                    <div>
                        <!-- Direct Link into Student Flashcard Codex -->
                        <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.16), rgba(245, 158, 11, 0.16)); border: 1.5px solid rgba(245, 158, 11, 0.4); border-radius: 16px; padding: 18px 24px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 18px; flex-wrap: wrap;">
                            <div style="display: flex; align-items: center; gap: 14px;">
                                <div style="display: flex;">
                                    ${students.slice(0, 4).map(s => `
                                        <img src="${s.profilePic || 'assets/images/cadets/cadet_aarav.jpg'}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid #f59e0b; margin-right: -10px; cursor: pointer;" onclick="window.msotRBAC.openStudentFlashCardModal('${s.email}')" title="${s.name} (${s.attendance || '90%'} Attendance)">
                                    `).join('')}
                                </div>
                                <div style="margin-left: 14px;">
                                    <h4 style="margin: 0; color: #fff; font-size: 16px;">🎴 CADET CHARACTERS CODEX & FLASHCARDS</h4>
                                    <p style="margin: 4px 0 0; font-size: 12.5px; color: #cbd5e1;">Inspect student profiles, live attendance meters, assigned sections, semesters, and academic years.</p>
                                </div>
                            </div>
                            <div style="display: flex; gap: 10px;">
                                <button type="button" class="primary-btn" onclick="window.msotPlatform.switchFacultySubTab('students')">
                                    🎴 OPEN CHARACTERS SHOWCASE ➔
                                </button>
                                <button type="button" class="secondary-btn" onclick="window.msotRBAC.openStudentFlashCardModal('${students[0]?.email || 'student@msot.edu'}')">
                                    🔍 POPUP FLASHCARD MODAL
                                </button>
                            </div>
                        </div>
                        <div class="faculty-header">
                            <div>
                                <span class="faculty-tag">PEDAGOGICAL COMMAND // FACULTY DESK</span>
                                <h2 class="section-title">STUDENT ACADEMIC & ENGAGEMENT DASHBOARD</h2>
                                <p class="section-subtitle">Monitor assigned students, track active & inactive attendance, publish coursework, and communicate directly with cadets.</p>
                            </div>
                            <div style="display:flex;gap:10px;flex-wrap:wrap;">
                                <button class="primary-btn" onclick="window.msotRBAC && window.msotRBAC.openAssignmentModal()">➕ CREATE ASSIGNMENT</button>
                                <button class="secondary-btn" onclick="window.msotRBAC && window.msotRBAC.openMessageModal()">✉️ SEND MESSAGE</button>
                            </div>
                        </div>

                        <!-- KPI Strip -->
                        <div class="rbac-kpi-grid">
                            <div class="rbac-kpi-card">
                                <span class="rk-icon">👨‍🎓</span>
                                <div>
                                    <div class="rk-num text-cyan">${students.length}</div>
                                    <div class="rk-lbl">Assigned Students</div>
                                </div>
                            </div>
                            <div class="rbac-kpi-card">
                                <span class="rk-icon">🟢</span>
                                <div>
                                    <div class="rk-num text-green">${activeCount}</div>
                                    <div class="rk-lbl">Active (&lt; 24h)</div>
                                </div>
                            </div>
                            <div class="rbac-kpi-card">
                                <span class="rk-icon">🟡</span>
                                <div>
                                    <div class="rk-num text-gold">${recentlyCount}</div>
                                    <div class="rk-lbl">Recently Active (1-3d)</div>
                                </div>
                            </div>
                            <div class="rbac-kpi-card">
                                <span class="rk-icon">🔴</span>
                                <div>
                                    <div class="rk-num text-red">${inactiveCount + longInactiveCount}</div>
                                    <div class="rk-lbl">Inactive (4+ Days)</div>
                                </div>
                            </div>
                            <div class="rbac-kpi-card">
                                <span class="rk-icon">📚</span>
                                <div>
                                    <div class="rk-num text-purple">${assignments.length}</div>
                                    <div class="rk-lbl">Coursework Tasks</div>
                                </div>
                            </div>
                            <div class="rbac-kpi-card">
                                <span class="rk-icon">📬</span>
                                <div>
                                    <div class="rk-num text-orange">${pendingReasonsCount}</div>
                                    <div class="rk-lbl">Pending Leave Notices</div>
                                </div>
                            </div>
                        </div>

                        <!-- 2-Column Overview Body -->
                        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(420px, 1fr));gap:20px;margin-top:24px;">
                            <!-- Inactivity Notices & Requests Card -->
                            <div class="dashboard-panel" style="margin:0;">
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                                    <h4 class="panel-title" style="margin:0;">📬 Recent Student Inactivity Notices</h4>
                                    <button class="btn-action-sm" onclick="window.msotPlatform.switchFacultySubTab('reasons')">VIEW ALL (${reasons.length})</button>
                                </div>
                                <div style="display:flex;flex-direction:column;gap:12px;">
                                    ${reasons.length === 0 ? `
                                        <p style="color:var(--text-dim);font-size:13px;text-align:center;padding:24px;">No student inactivity notices filed yet.</p>
                                    ` : reasons.slice(0, 3).map(r => `
                                        <div class="inactivity-reason-item">
                                            <div class="iri-head">
                                                <div>
                                                    <span class="iri-name">${r.studentName}</span>
                                                    <span style="font-size:12px;color:var(--text-dim);"> (${r.studentRoll})</span>
                                                    <span class="iri-category">${r.category}</span>
                                                </div>
                                                <span class="status-badge ${r.status === 'PENDING' ? 'status-inactive' : 'status-active'}">${r.status}</span>
                                            </div>
                                            <p class="iri-text">"${r.reasonText}"</p>
                                            <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--text-dim);">
                                                <span>Dates: ${r.startDate} to ${r.endDate}</span>
                                                <button class="btn-action-sm" onclick="window.msotRBAC.openRespondInactivityModal('${r.id}')">
                                                    ${r.status === 'PENDING' ? '✍️ RESPOND' : 'UPDATE RESPONSE'}
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- Pending Submissions Card -->
                            <div class="dashboard-panel" style="margin:0;">
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                                    <h4 class="panel-title" style="margin:0;">📝 Recent Assignment Submissions</h4>
                                    <button class="btn-action-sm" onclick="window.msotPlatform.switchFacultySubTab('submissions')">VIEW ALL (${submissions.length})</button>
                                </div>
                                <div style="display:flex;flex-direction:column;gap:12px;">
                                    ${submissions.length === 0 ? `
                                        <p style="color:var(--text-dim);font-size:13px;text-align:center;padding:24px;">No assignment submissions received yet.</p>
                                    ` : submissions.slice(0, 3).map(sub => `
                                        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px;">
                                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                                                <strong style="color:#fff;font-size:13px;">${sub.studentName}</strong>
                                                <span class="status-badge ${sub.grade ? 'status-active' : 'status-inactive'}">${sub.grade ? 'GRADED: ' + sub.grade : 'PENDING REVIEW'}</span>
                                            </div>
                                            <div style="font-size:12px;color:var(--text-cyan);margin-bottom:4px;">${sub.assignmentTitle}</div>
                                            <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--text-dim);margin-top:8px;">
                                                <span>Submitted ${new Date(sub.submittedAt).toLocaleDateString()}</span>
                                                <button class="btn-action-sm" onclick="window.msotRBAC.openGradeSubmissionModal('${sub.id}')">✍️ GRADE & FEEDBACK</button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- 2. MY STUDENTS TAB (CHARACTERS & FLASHCARD SHOWCASE) -->
                ${activeTab === 'students' ? (() => {
                    const viewMode = this.facultyStudentsViewMode || 'flashcard';
                    const activeEmail = this.selectedFacultyStudentEmail || (filteredStudents[0]?.email || 'student@msot.edu');
                    const selectedStudent = filteredStudents.find(s => s.email.toLowerCase() === activeEmail.toLowerCase()) || filteredStudents[0] || students[0];
                    const selectedAct = selectedStudent ? (rbac ? rbac.calculateActivity(selectedStudent.lastActive) : { status: 'ACTIVE', label: 'Active Today', badgeClass: 'status-active', formatted: 'Today' }) : null;
                    const selectedAttPct = selectedStudent ? (selectedStudent.attendanceNum || parseInt(selectedStudent.attendance) || 92) : 92;

                    return `
                    <div>
                        <!-- Header & View Switcher -->
                        <div class="showcase-top-header" style="margin-bottom: 20px;">
                            <div class="showcase-title-block">
                                <span class="faculty-tag">CADET DIRECTORY // CHARACTERS CODEX</span>
                                <h3>👥 MY ASSIGNED CADETS (${students.length})</h3>
                                <p>Faculty academic inspector: examine student dossiers, attendance, semester progression, and send direct counsel.</p>
                            </div>
                            <div class="showcase-view-toggle">
                                <button type="button" class="view-toggle-btn ${viewMode === 'flashcard' ? 'active' : ''}" onclick="window.msotPlatform.switchFacultyStudentView('flashcard')">
                                    🎴 CHARACTERS SHOWCASE
                                </button>
                                <button type="button" class="view-toggle-btn ${viewMode === 'table' ? 'active' : ''}" onclick="window.msotPlatform.switchFacultyStudentView('table')">
                                    📋 SPREADSHEET TABLE
                                </button>
                            </div>
                        </div>

                        <!-- Search & Filter Controls Strip -->
                        <div class="rbac-controls-strip" style="margin-bottom: 24px;">
                            <div class="rbac-search-box">
                                <span>🔍</span>
                                <input type="text" placeholder="Search cadet by name, email, roll number..." value="${this.facultyStudentQuery || ''}" oninput="window.msotPlatform.facultyStudentQuery = this.value; window.msotPlatform.renderFacultyDashboard();">
                            </div>
                            <div class="rbac-filters-group">
                                <select class="rbac-filter-select" onchange="window.msotPlatform.facultySectionFilter = this.value; window.msotPlatform.renderFacultyDashboard();">
                                    <option value="ALL" ${sSecFilter === 'ALL' ? 'selected' : ''}>All Sections</option>
                                    <option value="Section Alpha" ${sSecFilter === 'Section Alpha' ? 'selected' : ''}>Section Alpha (DSA & C++)</option>
                                    <option value="Section Beta" ${sSecFilter === 'Section Beta' ? 'selected' : ''}>Section Beta (Web & Systems)</option>
                                </select>
                                <select class="rbac-filter-select" onchange="window.msotPlatform.facultyActivityFilter = this.value; window.msotPlatform.renderFacultyDashboard();">
                                    <option value="ALL" ${sActFilter === 'ALL' ? 'selected' : ''}>All Activity Statuses</option>
                                    <option value="ACTIVE" ${sActFilter === 'ACTIVE' ? 'selected' : ''}>🟢 Active (&lt; 24h)</option>
                                    <option value="RECENTLY_ACTIVE" ${sActFilter === 'RECENTLY_ACTIVE' ? 'selected' : ''}>🟡 Recently Active (1-3d)</option>
                                    <option value="INACTIVE" ${sActFilter === 'INACTIVE' ? 'selected' : ''}>🟠 Inactive (4-7d)</option>
                                    <option value="LONG_INACTIVE" ${sActFilter === 'LONG_INACTIVE' ? 'selected' : ''}>🔴 Long Inactive (8+d)</option>
                                </select>
                            </div>
                        </div>

                        ${viewMode === 'flashcard' ? `
                            <!-- WITCHER CHARACTER CODEX SHOWCASE ARENA -->
                            <div class="cadet-showcase-arena">
                                <div class="showcase-inner-wrap">
                                    ${filteredStudents.length === 0 ? `
                                        <div style="text-align: center; padding: 60px 20px; color: #94a3b8;">
                                            <div style="font-size: 42px; margin-bottom: 12px;">🔍</div>
                                            <h4 style="color:#fff; margin:0 0 8px;">No Cadets Matched Your Filter</h4>
                                            <p style="font-size: 13px;">Clear search keywords or reset filter to view students.</p>
                                        </div>
                                    ` : `
                                        <div class="codex-layout-grid">
                                            <!-- Left Column: Orbital Cadet Avatar Node Track -->
                                            <div class="orbital-node-track" title="Click any cadet to inspect flash card">
                                                ${filteredStudents.map(s => {
                                                    const isSelected = selectedStudent && (s.email.toLowerCase() === selectedStudent.email.toLowerCase());
                                                    return `
                                                        <div class="cadet-avatar-node ${isSelected ? 'active' : ''}" onclick="window.msotPlatform.selectFacultyStudent('${s.email}')" title="${s.name} (${s.section || 'Section Alpha'})">
                                                            <img src="${s.profilePic || 'assets/images/cadets/cadet_aarav.jpg'}" alt="${s.name}" onerror="this.src='assets/images/gateway_hero_full_bg.jpg'">
                                                            ${isSelected ? `
                                                                <div class="node-connector-line">
                                                                    <div class="node-connector-dot"></div>
                                                                </div>
                                                            ` : ''}
                                                        </div>
                                                    `;
                                                }).join('')}
                                            </div>

                                            <!-- Center Column: The Witcher-Style Flash Card -->
                                            ${selectedStudent ? `
                                                <div class="cadet-flash-card">
                                                    <!-- Left Side: Portrait & Ornate Gold Callsign Plate (Clickable to Pop Up) -->
                                                    <div class="flash-portrait-col">
                                                        <div class="flash-portrait-frame" onclick="window.msotRBAC.openStudentFlashCardModal('${selectedStudent.email}')" style="cursor:pointer;" title="Click to pop up full-screen flash card modal">
                                                            <img src="${selectedStudent.profilePic || 'assets/images/cadets/cadet_aarav.jpg'}" alt="${selectedStudent.name}" class="flash-portrait-img" onerror="this.src='assets/images/gateway_hero_full_bg.jpg'">
                                                        </div>
                                                        <div class="ornate-gold-nameplate" onclick="window.msotRBAC.openStudentFlashCardModal('${selectedStudent.email}')" style="cursor:pointer;" title="Click to pop up full-screen flash card modal">
                                                            <span class="ornate-callsign-text">${selectedStudent.callsign || selectedStudent.name.split(' ')[0]}</span>
                                                        </div>
                                                        <div style="font-size:11px; color:#94a3b8; font-family:var(--font-mono, monospace); text-align:center;">
                                                            <code>${selectedStudent.studentId || 'MSOT-CADET'}</code>
                                                        </div>
                                                    </div>

                                                    <!-- Right Side: Details, Required Stats & Meters -->
                                                    <div class="flash-details-col">
                                                        <div class="flash-header-row">
                                                            <div>
                                                                <h2 class="flash-cadet-name">${selectedStudent.name}</h2>
                                                                <div class="flash-cadet-meta">
                                                                    <span class="flash-cadet-username">@${selectedStudent.username || 'cadet'}</span>
                                                                    <span>•</span>
                                                                    <span>${selectedStudent.branch || 'CSE'}</span>
                                                                    <span>•</span>
                                                                    <span class="status-badge ${selectedAct.badgeClass}" style="font-size:10px; padding:2px 8px;">${selectedAct.label}</span>
                                                                </div>
                                                            </div>
                                                            <div class="flash-nav-arrows">
                                                                <button type="button" class="flash-arrow-btn" onclick="window.msotPlatform.cycleFacultyStudent(-1)" title="Previous Cadet">‹</button>
                                                                <button type="button" class="flash-arrow-btn" onclick="window.msotPlatform.cycleFacultyStudent(1)" title="Next Cadet">›</button>
                                                            </div>
                                                        </div>

                                                        <!-- 4 REQUIRED METRIC BARS (Profile Pic, User Name, Attendance, Section, Semester, Academic Year) -->
                                                        <div class="flash-meters-grid">
                                                            <!-- 1. ATTENDANCE -->
                                                            <div class="flash-stat-item">
                                                                <div class="stat-item-top">
                                                                    <span class="stat-label-title">📊 ATTENDANCE</span>
                                                                    <span class="stat-value-badge">${selectedStudent.attendance || selectedAttPct + '%'}</span>
                                                                </div>
                                                                <div class="carved-meter-bar">
                                                                    <div class="carved-meter-fill" style="width: ${selectedAttPct}%;"></div>
                                                                </div>
                                                                <div class="stat-subtext-detail">${selectedStudent.attendancePresent || 38}/${selectedStudent.attendanceTotal || 40} Sessions Attended (${selectedAttPct >= 85 ? '🟢 Exemplary' : selectedAttPct >= 75 ? '🟡 Standard' : '🔴 At Risk'})</div>
                                                            </div>

                                                            <!-- 2. SECTION -->
                                                            <div class="flash-stat-item">
                                                                <div class="stat-item-top">
                                                                    <span class="stat-label-title">🏷️ SECTION</span>
                                                                    <span class="stat-value-badge" style="color:#a855f7;">${selectedStudent.section || 'Section Alpha'}</span>
                                                                </div>
                                                                <div class="carved-meter-bar">
                                                                    <div class="carved-meter-fill emerald" style="width: 100%;"></div>
                                                                </div>
                                                                <div class="stat-subtext-detail">${selectedStudent.track || 'C++ Algorithms & Systems Architecture'}</div>
                                                            </div>

                                                            <!-- 3. SEMESTER -->
                                                            <div class="flash-stat-item">
                                                                <div class="stat-item-top">
                                                                    <span class="stat-label-title">🎓 SEMESTER</span>
                                                                    <span class="stat-value-badge" style="color:#38bdf8;">${selectedStudent.semester || 'Semester 4'}</span>
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
                                                                    <span class="stat-value-badge">${selectedStudent.academicYear || '2026–2027 (2nd Year)'}</span>
                                                                </div>
                                                                <div class="carved-meter-bar">
                                                                    <div class="carved-meter-fill" style="width: 50%;"></div>
                                                                </div>
                                                                <div class="stat-subtext-detail">${selectedStudent.year || '2nd Year'} Cohort • Active Term</div>
                                                            </div>
                                                        </div>

                                                        <!-- Academic Remarks (Witcher Lore Box) -->
                                                        <div class="flash-narrative-box">
                                                            "${selectedStudent.academicRemarks || 'Active cadet enrolled in Mirai School of Technology. Demonstrates high engagement in algorithmic problem solving and compiler verification.'}"
                                                        </div>

                                                        <!-- Action Toolbar -->
                                                        <div class="flash-actions-bar">
                                                            <div class="flash-actions-left">
                                                                <button type="button" class="flash-btn-primary" onclick="window.msotRBAC.openMessageModal('${selectedStudent.email}', 'Academic Feedback')">
                                                                    💬 MESSAGE CADET
                                                                </button>
                                                                <button type="button" class="flash-btn-secondary" onclick="window.msotRBAC.openStudentDossierModal('${selectedStudent.email}')">
                                                                    👤 FULL DOSSIER
                                                                </button>
                                                                <button type="button" class="flash-btn-secondary" onclick="window.msotRBAC.openStudentFlashCardModal('${selectedStudent.email}')" title="Open large popup modal" style="border-color:#f59e0b; color:#f59e0b; background: rgba(245, 158, 11, 0.12);">
                                                                    🎴 POPUP FLASH CARD ➔
                                                                </button>
                                                            </div>
                                                            <div style="font-family:var(--font-mono, monospace); font-size:11.5px; color:#94a3b8;">
                                                                🏆 <strong style="color:#ffd700;">${(selectedStudent.xp || 1400).toLocaleString()} XP</strong> • ${selectedStudent.leagueTier || 'Diamond League'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ` : ''}
                                        </div>
                                    `}
                                </div>
                            </div>
                        ` : `
                            <!-- SPREADSHEET DATA TABLE VIEW -->
                            <div class="rbac-table-wrap">
                                <table class="rbac-data-table">
                                    <thead>
                                        <tr>
                                            <th>CADET / STUDENT</th>
                                            <th>ROLL NUMBER</th>
                                            <th>ATTENDANCE</th>
                                            <th>SECTION & SEMESTER</th>
                                            <th>ACADEMIC YEAR</th>
                                            <th>ACTIVITY STATUS</th>
                                            <th>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${filteredStudents.length === 0 ? `
                                            <tr><td colspan="7" style="text-align:center;padding:36px;color:#8c96a8;">No students matched the active search or filters.</td></tr>
                                        ` : filteredStudents.map(s => {
                                            const act = rbac ? rbac.calculateActivity(s.lastActive) : { status: 'ACTIVE', formatted: 'Today', daysInactive: 0 };
                                            const badgeClass = act.status === 'ACTIVE' ? 'status-active' : (act.status === 'RECENTLY_ACTIVE' ? 'status-recently' : (act.status === 'INACTIVE' ? 'status-inactive' : 'status-long-inactive'));
                                            return `
                                                <tr>
                                                    <td>
                                                        <div style="display:flex;align-items:center;gap:12px;cursor:pointer;" onclick="window.msotRBAC.openStudentFlashCardModal('${s.email}')">
                                                            <img src="${s.profilePic || 'assets/images/cadets/cadet_aarav.jpg'}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:1px solid #f59e0b;" onerror="this.src='assets/images/gateway_hero_full_bg.jpg'">
                                                            <div>
                                                                <strong style="color:#fff;">${s.name}</strong>
                                                                <div style="font-size:11px;color:#f59e0b;">@${s.username || 'cadet'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td><code>${s.studentId || 'MSOT-CADET'}</code></td>
                                                    <td>
                                                        <strong style="color:#f59e0b;">${s.attendance || '90%'}</strong>
                                                        <div style="font-size:11px;color:#8c96a8;">${s.attendancePresent || 36}/${s.attendanceTotal || 40} Sessions</div>
                                                    </td>
                                                    <td>
                                                        <span style="color:#a855f7;font-weight:600;">${s.section || 'Section Alpha'}</span>
                                                        <div style="font-size:11px;color:#38bdf8;">${s.semester || 'Semester 4'}</div>
                                                    </td>
                                                    <td>
                                                        <strong>${s.academicYear || '2026–2027'}</strong>
                                                        <div style="font-size:11px;color:#8c96a8;">${s.year || '2nd Year'}</div>
                                                    </td>
                                                    <td>
                                                        <span class="status-badge ${badgeClass}">${act.status.replace('_', ' ')}</span>
                                                        <div style="font-size:11px;color:#8c96a8;">${act.formatted}</div>
                                                    </td>
                                                    <td>
                                                        <div style="display:flex;gap:6px;">
                                                            <button class="btn-action-sm highlight" onclick="window.msotRBAC.openStudentFlashCardModal('${s.email}')" title="Pop up Witcher-style Flash Card">🎴 FLASHCARD</button>
                                                            <button class="btn-action-sm" onclick="window.msotRBAC.openStudentDossierModal('${s.email}')">👤 DOSSIER</button>
                                                            <button class="btn-action-sm" onclick="window.msotRBAC.openMessageModal('${s.email}')">💬 MESSAGE</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `}
                    </div>
                    `;
                })() : ''}

                <!-- 3. STUDENT ACTIVITY RADAR TAB -->
                ${activeTab === 'activity' ? `
                    <div>
                        <div class="faculty-header">
                            <div>
                                <span class="faculty-tag">ATTENDANCE RADAR // LAST-SEEN TRACKER</span>
                                <h2 class="section-title">STUDENT ACTIVITY & INACTIVITY MONITOR</h2>
                                <p class="section-subtitle">Real-time attendance indicators derived from authentication system timestamps. View exact days inactive and student-submitted absence reasons.</p>
                            </div>
                        </div>

                        <!-- Activity Status Breakdown Strip -->
                        <div class="rbac-kpi-grid">
                            <div class="rbac-kpi-card">
                                <span class="rk-icon">🟢</span>
                                <div>
                                    <div class="rk-num text-green">${activeCount}</div>
                                    <div class="rk-lbl">Active Today (&lt;24h)</div>
                                </div>
                            </div>
                            <div class="rbac-kpi-card">
                                <span class="rk-icon">🟡</span>
                                <div>
                                    <div class="rk-num text-gold">${recentlyCount}</div>
                                    <div class="rk-lbl">Recently Active (1-3 Days)</div>
                                </div>
                            </div>
                            <div class="rbac-kpi-card">
                                <span class="rk-icon">🟠</span>
                                <div>
                                    <div class="rk-num text-orange">${inactiveCount}</div>
                                    <div class="rk-lbl">Inactive (4-7 Days)</div>
                                </div>
                            </div>
                            <div class="rbac-kpi-card">
                                <span class="rk-icon">🔴</span>
                                <div>
                                    <div class="rk-num text-red">${longInactiveCount}</div>
                                    <div class="rk-lbl">Long Inactive (8+ Days)</div>
                                </div>
                            </div>
                        </div>

                        <!-- Activity Ledger -->
                        <div class="rbac-table-wrap mt-24">
                            <table class="rbac-data-table">
                                <thead>
                                    <tr>
                                        <th>STUDENT CADET</th>
                                        <th>SECTION</th>
                                        <th>LAST ACTIVE TIMESTAMP</th>
                                        <th>INACTIVITY DURATION</th>
                                        <th>STATUS BADGE</th>
                                        <th>INACTIVITY REASON FILED</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${students.map(s => {
                                        const act = rbac ? rbac.calculateActivity(s.lastActive) : { status: 'ACTIVE', formatted: 'Today', daysInactive: 0 };
                                        const badgeClass = act.status === 'ACTIVE' ? 'status-active' : (act.status === 'RECENTLY_ACTIVE' ? 'status-recently' : (act.status === 'INACTIVE' ? 'status-inactive' : 'status-long-inactive'));
                                        const studentReasons = reasons.filter(r => r.studentEmail.toLowerCase() === s.email.toLowerCase());
                                        const latestReason = studentReasons[0];

                                        return `
                                            <tr>
                                                <td>
                                                    <div style="display:flex;align-items:center;gap:10px;">
                                                        <span>${s.avatar || '⚔️'}</span>
                                                        <div>
                                                            <strong style="color:#fff;">${s.name}</strong>
                                                            <div style="font-size:11px;color:#8c96a8;">${s.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><code>${s.academicSection || 'Section Alpha'}</code></td>
                                                <td>${s.lastActive ? new Date(s.lastActive).toLocaleString() : 'Never logged in'}</td>
                                                <td>
                                                    <strong style="color:${act.daysInactive >= 8 ? '#f43f5e' : (act.daysInactive >= 4 ? '#ea580c' : '#34d399')};">
                                                        ${act.daysInactive === 0 ? 'Active within 24h' : act.daysInactive + ' day(s) ago'}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <span class="status-badge ${badgeClass}">${act.status.replace('_', ' ')}</span>
                                                </td>
                                                <td>
                                                    ${latestReason ? `
                                                        <span class="d-chip" style="background:rgba(168,85,247,0.15);color:#c084fc;border:1px solid rgba(168,85,247,0.3);cursor:pointer;" onclick="window.msotRBAC.openRespondInactivityModal('${latestReason.id}')">
                                                            📝 ${latestReason.category} (${latestReason.status})
                                                        </span>
                                                    ` : `
                                                        <span style="color:#8c96a8;font-size:12px;">None filed</span>
                                                    `}
                                                </td>
                                                <td>
                                                    <div style="display:flex;gap:6px;">
                                                        ${latestReason ? `
                                                            <button class="btn-action-sm" onclick="window.msotRBAC.openRespondInactivityModal('${latestReason.id}')">RESPOND</button>
                                                        ` : ''}
                                                        <button class="btn-action-sm" onclick="window.msotRBAC.openMessageModal('${s.email}')">CHECK-IN</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}

                <!-- 4. ASSIGNMENTS TAB -->
                ${activeTab === 'assignments' ? `
                    <div>
                        <div class="faculty-header">
                            <div>
                                <span class="faculty-tag">PEDAGOGICAL CURRICULUM // COURSEWORK</span>
                                <h2 class="section-title">PUBLISHED ASSIGNMENTS & TASKS</h2>
                                <p class="section-subtitle">Author, edit, publish, and manage coursework assignments with clear deadlines and point weights for students.</p>
                            </div>
                            <button class="primary-btn" onclick="window.msotRBAC.openAssignmentModal()">➕ CREATE ASSIGNMENT</button>
                        </div>

                        <!-- Assignments Table -->
                        <div class="rbac-table-wrap">
                            <table class="rbac-data-table">
                                <thead>
                                    <tr>
                                        <th>ASSIGNMENT TITLE</th>
                                        <th>SUBJECT / TOPIC</th>
                                        <th>DEADLINE</th>
                                        <th>TOTAL MARKS / XP</th>
                                        <th>STATUS</th>
                                        <th>SUBMISSIONS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${assignments.length === 0 ? `
                                        <tr><td colspan="7" style="text-align:center;padding:36px;color:#8c96a8;">No assignments created yet. Click "Create Assignment" to publish your first task.</td></tr>
                                    ` : assignments.map(a => {
                                        const subCount = submissions.filter(s => s.assignmentId === a.id).length;
                                        return `
                                            <tr>
                                                <td>
                                                    <strong style="color:#fff;font-size:14px;">${a.title}</strong>
                                                    <div style="font-size:11px;color:#8c96a8;max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a.description}</div>
                                                </td>
                                                <td><span class="d-chip">${a.subject || 'Computer Science'}</span></td>
                                                <td>
                                                    <strong>${new Date(a.deadline).toLocaleDateString()}</strong>
                                                    <div style="font-size:11px;color:#8c96a8;">${new Date(a.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                </td>
                                                <td>
                                                    <strong>${a.maxMarks || 100} Marks</strong>
                                                    <div style="font-size:11px;color:#ffd700;">+${a.xpReward || 50} XP</div>
                                                </td>
                                                <td>
                                                    <span class="status-badge ${a.isPublished ? 'status-active' : 'status-inactive'}">
                                                        ${a.isPublished ? 'PUBLISHED' : 'DRAFT'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong>${subCount} Cadets</strong>
                                                </td>
                                                <td>
                                                    <div style="display:flex;gap:6px;">
                                                        <button class="btn-action-sm" onclick="window.msotRBAC.openAssignmentModal('${a.id}')">EDIT</button>
                                                        <button class="btn-action-sm" onclick="window.msotRBAC.togglePublishAssignment('${a.id}'); window.msotPlatform.renderFacultyDashboard();">
                                                            ${a.isPublished ? 'UNPUBLISH' : 'PUBLISH'}
                                                        </button>
                                                        <button class="btn-action-sm danger" onclick="window.msotRBAC.deleteAssignment('${a.id}'); window.msotPlatform.renderFacultyDashboard();">DEL</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}

                <!-- 5. SUBMISSIONS TAB -->
                ${activeTab === 'submissions' ? `
                    <div>
                        <div class="faculty-header">
                            <div>
                                <span class="faculty-tag">STUDENT WORK // GRADING DESK</span>
                                <h2 class="section-title">ASSIGNMENT SUBMISSIONS & EVALUATION</h2>
                                <p class="section-subtitle">Review submitted student code, written solutions, and provide grades, XP rewards, and academic feedback.</p>
                            </div>
                        </div>

                        <div class="rbac-table-wrap">
                            <table class="rbac-data-table">
                                <thead>
                                    <tr>
                                        <th>SUBMISSION TIME</th>
                                        <th>STUDENT</th>
                                        <th>ASSIGNMENT</th>
                                        <th>SOLUTION PREVIEW</th>
                                        <th>GRADE & MARKS</th>
                                        <th>STATUS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${submissions.length === 0 ? `
                                        <tr><td colspan="7" style="text-align:center;padding:36px;color:#8c96a8;">No submissions recorded yet. When students submit solutions to your assignments, they will appear here.</td></tr>
                                    ` : submissions.map(sub => `
                                        <tr>
                                            <td><small>${new Date(sub.submittedAt).toLocaleString()}</small></td>
                                            <td>
                                                <strong>${sub.studentName}</strong>
                                                <div style="font-size:11px;color:#8c96a8;">${sub.studentEmail}</div>
                                            </td>
                                            <td><strong style="color:var(--text-cyan);">${sub.assignmentTitle}</strong></td>
                                            <td>
                                                <code style="font-size:11px;display:block;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${sub.solutionText || (sub.attachments ? sub.attachments[0] : 'Solution attached')}</code>
                                            </td>
                                            <td>
                                                ${sub.grade ? `
                                                    <strong style="color:#34d399;">${sub.grade}</strong> (${sub.marksAwarded} Marks)
                                                ` : `
                                                    <span style="color:#f59e0b;">Ungraded</span>
                                                `}
                                            </td>
                                            <td>
                                                <span class="status-badge ${sub.status === 'GRADED' ? 'status-active' : 'status-inactive'}">
                                                    ${sub.status || 'SUBMITTED'}
                                                </span>
                                            </td>
                                            <td>
                                                <button class="btn-action-sm" onclick="window.msotRBAC.openGradeSubmissionModal('${sub.id}')">
                                                    ✍️ GRADE & FEEDBACK
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}

                <!-- 6. INACTIVITY REASONS TAB -->
                ${activeTab === 'reasons' ? `
                    <div>
                        <div class="faculty-header">
                            <div>
                                <span class="faculty-tag">STUDENT WELFARE // LEAVE & INACTIVITY NOTICES</span>
                                <h2 class="section-title">STUDENT INACTIVITY REASONS & REQUESTS</h2>
                                <p class="section-subtitle">Review reasons submitted by students for inactivity (health, personal, workload, technical, etc.) and respond with academic guidance.</p>
                            </div>
                        </div>

                        <div style="display:flex;flex-direction:column;gap:16px;">
                            ${reasons.length === 0 ? `
                                <div class="dashboard-panel" style="text-align:center;padding:48px;color:#8c96a8;">
                                    No inactivity reasons or leave requests have been filed by students.
                                </div>
                            ` : reasons.map(r => `
                                <div class="inactivity-reason-item">
                                    <div class="iri-head">
                                        <div>
                                            <span class="iri-name">${r.studentName}</span>
                                            <span style="font-size:13px;color:var(--text-dim);"> (${r.studentRoll || 'Cadet'} • ${r.studentEmail})</span>
                                            <span class="iri-category">${r.category}</span>
                                        </div>
                                        <span class="status-badge ${r.status === 'PENDING' ? 'status-inactive' : 'status-active'}">${r.status}</span>
                                    </div>

                                    <div style="font-size:12px;color:var(--text-dim);margin-bottom:8px;">
                                        📅 <strong>Absence Duration:</strong> ${r.startDate} to ${r.endDate} • Filed on ${new Date(r.createdAt).toLocaleDateString()}
                                    </div>

                                    <div class="iri-text">
                                        "${r.reasonText}"
                                    </div>

                                    ${r.facultyResponse ? `
                                        <div style="background:rgba(52,211,153,0.08);border-left:3px solid #34d399;padding:10px 14px;border-radius:4px;margin-top:10px;">
                                            <div style="font-size:11px;color:#34d399;font-weight:700;margin-bottom:4px;">
                                                🎓 FACULTY RESPONSE (${new Date(r.respondedAt).toLocaleDateString()}):
                                            </div>
                                            <div style="font-size:13px;color:#fff;">
                                                "${r.facultyResponse}"
                                            </div>
                                        </div>
                                    ` : ''}

                                    <div style="display:flex;justify-content:flex-end;margin-top:12px;">
                                        <button class="primary-btn" style="padding:6px 14px;font-size:12px;" onclick="window.msotRBAC.openRespondInactivityModal('${r.id}')">
                                            ${r.status === 'PENDING' ? '✍️ RESPOND TO STUDENT' : '✏️ UPDATE RESPONSE'}
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- 7. MESSAGES TAB -->
                ${activeTab === 'messages' ? `
                    <div>
                        <div class="faculty-header">
                            <div>
                                <span class="faculty-tag">ACADEMIC CORRESPONDENCE // 2-WAY COMMUNICATION</span>
                                <h2 class="section-title">FACULTY ↔️ STUDENT MESSAGES</h2>
                                <p class="section-subtitle">Send announcements, respond to individual student questions, and maintain academic correspondence.</p>
                            </div>
                            <button class="primary-btn" onclick="window.msotRBAC.openMessageModal()">✉️ COMPOSE MESSAGE</button>
                        </div>

                        <div style="display:flex;flex-direction:column;gap:14px;">
                            ${messages.length === 0 ? `
                                <div class="dashboard-panel" style="text-align:center;padding:48px;color:#8c96a8;">
                                    No communication messages recorded yet. Click "Compose Message" to start a conversation with any student.
                                </div>
                            ` : messages.map(m => `
                                <div class="academic-message-item">
                                    <div class="ami-head">
                                        <div>
                                            <span class="ami-author">${m.studentName}</span>
                                            <span style="font-size:12px;color:var(--text-dim);"> (${m.studentEmail})</span>
                                        </div>
                                        <span class="ami-date">${new Date(m.createdAt).toLocaleString()}</span>
                                    </div>
                                    <h4 class="ami-subject">${m.subject}</h4>
                                    <p class="ami-body">${m.body}</p>
                                    <div style="display:flex;justify-content:flex-end;margin-top:10px;">
                                        <button class="btn-action-sm" onclick="window.msotRBAC.openMessageModal('${m.studentEmail}')">REPLY</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- 8. QUESTION BANK TAB (Preserved) -->
                ${activeTab === 'questions' ? `
                    <div>
                        <div class="faculty-header">
                            <div>
                                <span class="faculty-tag">PEDAGOGICAL INSTRUCTION // CURRICULUM AUTHORING</span>
                                <h2 class="section-title">DAILY TRIAL & WEEKEND LAB QUESTION BANK</h2>
                                <p class="section-subtitle">Create, review, and publish questions for daily micro-trials and weekend algorithmic compiler labs.</p>
                            </div>
                            <button class="primary-btn" onclick="window.msotRBAC.openQuestionModal(null, 'daily_trial')">➕ AUTHOR NEW QUESTION</button>
                        </div>

                        <div class="rbac-table-wrap">
                            <table class="rbac-data-table">
                                <thead>
                                    <tr>
                                        <th>QUESTION TITLE</th>
                                        <th>CATEGORY</th>
                                        <th>DIFFICULTY</th>
                                        <th>CORRECT ANSWER</th>
                                        <th>XP REWARD</th>
                                        <th>STATUS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${myQuestions.map(q => `
                                        <tr>
                                            <td>
                                                <strong style="color:#fff;">${q.title}</strong>
                                                <div style="font-size:11px;color:#8c96a8;">${q.activity_type}</div>
                                            </td>
                                            <td><span class="d-chip">${q.category}</span></td>
                                            <td><strong style="color:#fbbf24;">${(q.difficulty || 'intermediate').toUpperCase()}</strong></td>
                                            <td><code>Option ${q.correct_answer}</code></td>
                                            <td><strong style="color:#ffd700;">+${q.xp_reward || 15} XP</strong></td>
                                            <td>
                                                <span class="status-badge ${q.is_published ? 'status-active' : 'status-inactive'}">
                                                    ${q.is_published ? 'PUBLISHED' : 'DRAFT'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style="display:flex;gap:6px;">
                                                    <button class="btn-action-sm" onclick="window.msotRBAC.openQuestionModal('${q.id}')">EDIT</button>
                                                    <button class="btn-action-sm" onclick="window.msotRBAC.togglePublishQuestion('${q.id}'); window.msotPlatform.renderFacultyDashboard();">
                                                        ${q.is_published ? 'UNPUBLISH' : 'PUBLISH'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // =========================================================================
    // 9. ADMIN COMMAND CENTER & USER MANAGEMENT (Three-Role RBAC)
    // =========================================================================
    switchAdminSubTab(tab) {
        this.adminSubTab = tab;
        this.renderAdminRules();
        if (window.miraiAudio) window.miraiAudio.playClick?.();
    }

    renderAdminRules() {
        const container = document.getElementById('adminRulesSection');
        if (!container) return;

        const currentRole = (window.msotRBAC ? window.msotRBAC.getCurrentRole() : (this.activeRole || window.msotState?.currentRole || 'STUDENT')).toUpperCase();
        if (currentRole !== 'ADMIN') {
            container.innerHTML = `
                <div class="dashboard-panel scroll-reveal" style="text-align: center; padding: 60px 24px;">
                    <div style="font-size: 52px; margin-bottom: 14px;">🛡️🔒</div>
                    <h2 class="section-title" style="color: #ff2a4b; font-family: var(--font-cyber);">RESTRICTED AREA // SYSTEM ADMINISTRATOR ACCESS REQUIRED</h2>
                    <p class="section-subtitle" style="max-width: 640px; margin: 12px auto; color: var(--text-dim);">
                        The Master Admin Command Center allows full platform control across Students, Faculty, Assignments, Leagues, Guilds, and System XP rules.
                        <strong>Students and Faculty cannot access this control plane.</strong>
                    </p>
                    <div style="margin-top: 24px; display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
                        <button class="primary-btn" onclick="window.switchSection('assignmentsSection', true)">➔ GO TO WEEKEND COMPILER LAB</button>
                        <button class="secondary-btn" onclick="window.switchSection('arcadeSection', true)">⚔️ PLAY SACRED ARCADE</button>
                    </div>
                </div>
            `;
            return;
        }

        const rbac = window.msotRBAC;
        const activeTab = this.adminSubTab || 'overview';
        const users = rbac ? rbac.getAllUsers() : [];
        const students = rbac ? rbac.getStudentUsers() : [];
        const faculty = rbac ? rbac.getFacultyUsers() : [];
        const assignments = rbac ? rbac.getAssignments('ADMIN') : [];
        const reasons = rbac ? rbac.inactivityReasons : [];
        const messages = rbac ? rbac.messages : [];
        const questions = rbac ? rbac.getQuestions('ALL', 'ALL') : [];
        const rules = window.msotState?.rules || DEFAULT_XP_RULES;
        const auditLogs = rbac ? rbac.auditLogs : [];

        // Filters for students
        const qFilter = (this.adminSearchQuery || '').toLowerCase();
        const roleFilt = this.adminRoleFilter || 'ALL';
        const statusFilt = this.adminStatusFilter || 'ALL';
        const actFilt = this.adminActivityFilter || 'ALL';

        const filteredStudents = students.filter(s => {
            const matchesQuery = !qFilter || (
                (s.name && s.name.toLowerCase().includes(qFilter)) ||
                (s.email && s.email.toLowerCase().includes(qFilter)) ||
                (s.studentId && s.studentId.toLowerCase().includes(qFilter))
            );
            const matchesStatus = (statusFilt === 'ALL') || ((s.status || 'ACTIVE') === statusFilt);
            const act = rbac ? rbac.calculateActivity(s.lastActive) : { status: 'ACTIVE' };
            const matchesAct = (actFilt === 'ALL') || (act.status === actFilt);
            return matchesQuery && matchesStatus && matchesAct;
        });

        const filteredFaculty = faculty.filter(f => {
            const matchesQuery = !qFilter || (
                (f.name && f.name.toLowerCase().includes(qFilter)) ||
                (f.email && f.email.toLowerCase().includes(qFilter))
            );
            const matchesStatus = (statusFilt === 'ALL') || ((f.status || 'ACTIVE') === statusFilt);
            return matchesQuery && matchesStatus;
        });

        container.innerHTML = `
            <div class="admin-rules-card scroll-reveal">
                <!-- Admin Sub-Navigation Strip -->
                <div class="admin-subnav-bar">
                    <button type="button" class="admin-subnav-btn ${activeTab === 'overview' ? 'active' : ''}" onclick="window.msotPlatform.switchAdminSubTab('overview')">
                        🛡️ OVERVIEW & CONTROL
                    </button>
                    <button type="button" class="admin-subnav-btn ${activeTab === 'faculty' ? 'active' : ''}" onclick="window.msotPlatform.switchAdminSubTab('faculty')">
                        🎓 FACULTY (${faculty.length})
                    </button>
                    <button type="button" class="admin-subnav-btn ${activeTab === 'students' ? 'active' : ''}" onclick="window.msotPlatform.switchAdminSubTab('students')">
                        👥 STUDENTS (${students.length})
                    </button>
                    <button type="button" class="admin-subnav-btn ${activeTab === 'assignments' ? 'active' : ''}" onclick="window.msotPlatform.switchAdminSubTab('assignments')">
                        📚 ASSIGNMENTS (${assignments.length})
                    </button>
                    <button type="button" class="admin-subnav-btn ${activeTab === 'leagues_guilds' ? 'active' : ''}" onclick="window.msotPlatform.switchAdminSubTab('leagues_guilds')">
                        🏆 LEAGUES & GUILDS
                    </button>
                    <button type="button" class="admin-subnav-btn ${activeTab === 'requests' ? 'active' : ''}" onclick="window.msotPlatform.switchAdminSubTab('requests')">
                        📬 REQUESTS (${reasons.length})
                    </button>
                    <button type="button" class="admin-subnav-btn ${activeTab === 'messages' ? 'active' : ''}" onclick="window.msotPlatform.switchAdminSubTab('messages')">
                        💬 MESSAGES (${messages.length})
                    </button>
                    <button type="button" class="admin-subnav-btn ${activeTab === 'questions' ? 'active' : ''}" onclick="window.msotPlatform.switchAdminSubTab('questions')">
                        ❓ QUESTION BANK (${questions.length})
                    </button>
                    <button type="button" class="admin-subnav-btn ${activeTab === 'rules' ? 'active' : ''}" onclick="window.msotPlatform.switchAdminSubTab('rules')">
                        ⚙️ XP RULES
                    </button>
                    <button type="button" class="admin-subnav-btn ${activeTab === 'audit' ? 'active' : ''}" onclick="window.msotPlatform.switchAdminSubTab('audit')">
                        📜 AUDIT LOGS (${auditLogs.length})
                    </button>
                    <button type="button" class="admin-subnav-btn admin-action-btn-highlight" onclick="window.msotRBAC && window.msotRBAC.openAddUserModal()">
                        ➕ PROVISION USER
                    </button>
                </div>

                <!-- 1. OVERVIEW & HEALTH -->
                ${activeTab === 'overview' ? `
                    <div>
                        <div class="admin-header">
                            <div>
                                <span class="admin-tag">MASTER GOVERNANCE // CENTRAL CONTROL TOWER</span>
                                <h2 class="section-title">ADMINISTRATIVE PLATFORM CONTROL CENTER</h2>
                                <p class="section-subtitle">Total platform oversight: Faculty accounts, Student ecosystem, Assignments, Leagues, Guilds, and System configuration.</p>
                            </div>
                        </div>

                        <!-- Dual-Control Fast Bridge into Faculty Operations Terminal -->
                        <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(245, 158, 11, 0.16)); border: 1.5px solid rgba(168, 85, 247, 0.45); border-radius: 16px; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); flex-wrap: wrap;">
                            <div style="max-width: 650px;">
                                <div style="display:flex; align-items:center; gap:8px; margin-bottom: 4px;">
                                    <span style="font-size: 20px;">🎓</span>
                                    <strong style="color: #f59e0b; font-family: var(--font-mono); font-size: 13px; letter-spacing: 1px;">ADMIN DUAL-ACCESS // FACULTY TERMINAL & STUDENT FLASHCARD CODEX</strong>
                                </div>
                                <h3 style="margin: 0; color: #fff; font-size: 18px;">Inspect & Change Everything in the Faculty Workspace</h3>
                                <p style="margin: 6px 0 0; font-size: 13px; color: #cbd5e1; line-height: 1.5;">
                                    As Master Administrator, you have full live access to the Faculty Section: inspect all student character flashcards, grade assignments, excuse student absence reasons, and dispatch academic counsel directly.
                                </p>
                            </div>
                            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                                <button type="button" class="primary-btn" onclick="window.switchSection('facultySection', true)" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; font-weight: 800;">
                                    <span>🎓 OPEN FACULTY VIEW</span>
                                    <span>➔</span>
                                </button>
                                <button type="button" class="secondary-btn" onclick="window.msotPlatform && window.msotPlatform.setEffectiveRole('FACULTY', event)" style="padding: 12px 18px; font-weight: 700;">
                                    <span>🔄 SWITCH TO FACULTY MODE</span>
                                </button>
                            </div>
                        </div>

                        <!-- Platform-Wide KPI Grid -->
                        <div class="rbac-kpi-grid">
                            <div class="rbac-kpi-card">
                                <span class="rk-icon">👥</span>
                                <div>
                                    <div class="rk-num text-cyan">${users.length}</div>
                                    <div class="rk-lbl">Total Registered Users</div>
                                </div>
                            </div>
                            <div class="rbac-kpi-card">
                                <span class="rk-icon">🎓</span>
                                <div>
                                    <div class="rk-num text-purple">${faculty.length}</div>
                                    <div class="rk-lbl">Faculty Staff</div>
                                </div>
                            </div>
                            <div class="rbac-kpi-card">
                                <span class="rk-icon">⚔️</span>
                                <div>
                                    <div class="rk-num text-green">${students.length}</div>
                                    <div class="rk-lbl">Student Cadets</div>
                                </div>
                            </div>
                            <div class="rbac-kpi-card">
                                <span class="rk-icon">📚</span>
                                <div>
                                    <div class="rk-num text-gold">${assignments.length}</div>
                                    <div class="rk-lbl">Published Tasks</div>
                                </div>
                            </div>
                            <div class="rbac-kpi-card">
                                <span class="rk-icon">📬</span>
                                <div>
                                    <div class="rk-num text-orange">${reasons.length}</div>
                                    <div class="rk-lbl">Inactivity Requests</div>
                                </div>
                            </div>
                            <div class="rbac-kpi-card">
                                <span class="rk-icon">📜</span>
                                <div>
                                    <div class="rk-num text-red">${auditLogs.length}</div>
                                    <div class="rk-lbl">Security Audit Events</div>
                                </div>
                            </div>
                        </div>

                        <!-- Central Fast-Jump Deck -->
                        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;margin-top:24px;">
                            <div class="dashboard-panel" style="cursor:pointer;" onclick="window.msotPlatform.switchAdminSubTab('faculty')">
                                <h4 style="color:#c084fc;margin-bottom:8px;">🎓 Faculty Management</h4>
                                <p style="font-size:13px;color:var(--text-dim);margin:0;">Manage professors, monitor authored assignments, and review instructor-student interactions.</p>
                            </div>
                            <div class="dashboard-panel" style="cursor:pointer;" onclick="window.msotPlatform.switchAdminSubTab('students')">
                                <h4 style="color:#34d399;margin-bottom:8px;">👥 Student Ecosystem</h4>
                                <p style="font-size:13px;color:var(--text-dim);margin:0;">Inspect individual student dossiers, League rankings, Guild teams, and Battle records.</p>
                            </div>
                            <div class="dashboard-panel" style="cursor:pointer;" onclick="window.msotPlatform.switchAdminSubTab('assignments')">
                                <h4 style="color:#38bdf8;margin-bottom:8px;">📚 Assignment Oversight</h4>
                                <p style="font-size:13px;color:var(--text-dim);margin:0;">Review all faculty coursework, edit or toggle publication status, and inspect submissions.</p>
                            </div>
                            <div class="dashboard-panel" style="cursor:pointer;" onclick="window.msotPlatform.switchAdminSubTab('requests')">
                                <h4 style="color:#fbbf24;margin-bottom:8px;">📬 Absence & Inactivity Ledger</h4>
                                <p style="font-size:13px;color:var(--text-dim);margin:0;">Review absence reasons filed across all sections with complete response history.</p>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- 2. FACULTY MANAGEMENT -->
                ${activeTab === 'faculty' ? `
                    <div>
                        <div class="admin-header">
                            <div>
                                <span class="admin-tag">INSTRUCTIONAL STAFF // FACULTY ROSTER</span>
                                <h2 class="section-title">FACULTY MEMBERS & ACADEMIC STAFF</h2>
                                <p class="section-subtitle">View complete faculty profiles, monitor authored assignments, manage account activation, and communicate with instructors.</p>
                            </div>
                        </div>

                        <div style="background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 20px; flex-wrap: wrap;">
                            <div>
                                <strong style="color: #c084fc; font-size: 13.5px;">🎓 Live Faculty Terminal & Student Codex</strong>
                                <p style="font-size: 12px; color: #cbd5e1; margin: 4px 0 0;">Inspect student Witcher character flashcards, edit assignment rubrics, and grade directly from the Faculty dashboard.</p>
                            </div>
                            <button type="button" class="primary-btn" onclick="window.switchSection('facultySection', true)" style="padding: 9px 16px; font-size: 12px; white-space: nowrap;">
                                🎓 OPEN FACULTY TERMINAL ➔
                            </button>
                        </div>

                        <div class="rbac-table-wrap">
                            <table class="rbac-data-table">
                                <thead>
                                    <tr>
                                        <th>FACULTY MEMBER</th>
                                        <th>DEPARTMENT & TITLE</th>
                                        <th>ASSIGNED SECTIONS</th>
                                        <th>AUTHORED TASKS</th>
                                        <th>STATUS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${filteredFaculty.map(f => {
                                        const facultyAssignments = assignments.filter(a => a.creatorEmail?.toLowerCase() === f.email.toLowerCase());
                                        return `
                                            <tr>
                                                <td>
                                                    <div style="display:flex;align-items:center;gap:10px;">
                                                        <span style="font-size:24px;">${f.avatar || '🎓'}</span>
                                                        <div>
                                                            <strong style="color:#fff;">${f.name}</strong>
                                                            <div style="font-size:11px;color:#8c96a8;">${f.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <strong>${f.department || 'Computer Science & Engineering'}</strong>
                                                    <div style="font-size:11px;color:#8c96a8;">${f.title || 'Course Professor'}</div>
                                                </td>
                                                <td>
                                                    <span class="d-chip">${f.assignedSections ? f.assignedSections.join(', ') : 'All Sections'}</span>
                                                </td>
                                                <td>
                                                    <strong style="color:var(--text-cyan);">${facultyAssignments.length} Assignments</strong>
                                                </td>
                                                <td>
                                                    <span class="status-badge ${(f.status || 'ACTIVE') === 'ACTIVE' ? 'status-active' : 'status-inactive'}">
                                                        ${f.status || 'ACTIVE'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style="display:flex;gap:6px;">
                                                        <button class="btn-action-sm" onclick="window.msotRBAC.openFacultyDossierModal('${f.email}')">👤 DOSSIER</button>
                                                        <button class="btn-action-sm ${(f.status || 'ACTIVE') === 'ACTIVE' ? 'danger' : ''}" onclick="window.msotRBAC.toggleUserStatus('${f.email}'); window.msotPlatform.renderAdminRules();">
                                                            ${(f.status || 'ACTIVE') === 'ACTIVE' ? 'DEACTIVATE' : 'ACTIVATE'}
                                                        </button>
                                                        <button class="btn-action-sm" onclick="window.msotRBAC.openMessageModal('${f.email}')">💬 MESSAGE</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}

                <!-- 3. STUDENT ECOSYSTEM -->
                ${activeTab === 'students' ? `
                    <div>
                        <div class="admin-header">
                            <div>
                                <span class="admin-tag">CADET CORPS // COMPLETE STUDENT ECOSYSTEM</span>
                                <h2 class="section-title">REGISTERED STUDENTS & PLATFORM ECOSYSTEM</h2>
                                <p class="section-subtitle">Search, filter, inspect full student profiles with League, Guild, and Battle records, and take administrative action.</p>
                            </div>
                        </div>

                        <!-- Filter Controls -->
                        <div class="rbac-controls-strip">
                            <div class="rbac-search-box">
                                <span>🔍</span>
                                <input type="text" placeholder="Search by name, roll no, email..." value="${this.adminSearchQuery || ''}" oninput="window.msotPlatform.adminSearchQuery = this.value; window.msotPlatform.renderAdminRules();">
                            </div>
                            <div class="rbac-filters-group">
                                <select class="rbac-filter-select" onchange="window.msotPlatform.adminStatusFilter = this.value; window.msotPlatform.renderAdminRules();">
                                    <option value="ALL" ${statusFilt === 'ALL' ? 'selected' : ''}>All Account Statuses</option>
                                    <option value="ACTIVE" ${statusFilt === 'ACTIVE' ? 'selected' : ''}>Active Accounts</option>
                                    <option value="INACTIVE" ${statusFilt === 'INACTIVE' ? 'selected' : ''}>Deactivated Accounts</option>
                                </select>
                                <select class="rbac-filter-select" onchange="window.msotPlatform.adminActivityFilter = this.value; window.msotPlatform.renderAdminRules();">
                                    <option value="ALL" ${actFilt === 'ALL' ? 'selected' : ''}>All Activity Statuses</option>
                                    <option value="ACTIVE" ${actFilt === 'ACTIVE' ? 'selected' : ''}>🟢 Active (&lt; 24h)</option>
                                    <option value="RECENTLY_ACTIVE" ${actFilt === 'RECENTLY_ACTIVE' ? 'selected' : ''}>🟡 Recently Active (1-3d)</option>
                                    <option value="INACTIVE" ${actFilt === 'INACTIVE' ? 'selected' : ''}>🟠 Inactive (4-7d)</option>
                                    <option value="LONG_INACTIVE" ${actFilt === 'LONG_INACTIVE' ? 'selected' : ''}>🔴 Long Inactive (8+d)</option>
                                </select>
                            </div>
                        </div>

                        <div class="rbac-table-wrap">
                            <table class="rbac-data-table">
                                <thead>
                                    <tr>
                                        <th>STUDENT CADET</th>
                                        <th>COLLEGE ROLL NO</th>
                                        <th>SECTION & BRANCH</th>
                                        <th>ACTIVITY STATUS</th>
                                        <th>INACTIVITY TIME</th>
                                        <th>ACCOUNT STATUS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${filteredStudents.map(s => {
                                        const act = rbac ? rbac.calculateActivity(s.lastActive) : { status: 'ACTIVE', formatted: 'Today', daysInactive: 0 };
                                        const badgeClass = act.status === 'ACTIVE' ? 'status-active' : (act.status === 'RECENTLY_ACTIVE' ? 'status-recently' : (act.status === 'INACTIVE' ? 'status-inactive' : 'status-long-inactive'));
                                        return `
                                            <tr>
                                                <td>
                                                    <div style="display:flex;align-items:center;gap:10px;">
                                                        <span style="font-size:22px;">${s.avatar || '⚔️'}</span>
                                                        <div>
                                                            <strong style="color:#fff;">${s.name}</strong>
                                                            <div style="font-size:11px;color:#8c96a8;">${s.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><code>${s.studentId || 'MSOT-CADET'}</code></td>
                                                <td>
                                                    <span style="color:#a855f7;font-weight:600;">${s.academicSection || 'Section Alpha'}</span>
                                                    <div style="font-size:11px;color:#8c96a8;">${s.branch || 'CSE'}</div>
                                                </td>
                                                <td>
                                                    <span class="status-badge ${badgeClass}">${act.status.replace('_', ' ')}</span>
                                                </td>
                                                <td>
                                                    <strong>${act.daysInactive === 0 ? 'Active Today' : act.daysInactive + ' Days'}</strong>
                                                    <div style="font-size:11px;color:#8c96a8;">${act.formatted}</div>
                                                </td>
                                                <td>
                                                    <span class="status-badge ${(s.status || 'ACTIVE') === 'ACTIVE' ? 'status-active' : 'status-inactive'}">
                                                        ${s.status || 'ACTIVE'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style="display:flex;gap:6px;">
                                                        <button class="btn-action-sm" onclick="window.msotRBAC.openStudentDossierModal('${s.email}')">👤 DOSSIER</button>
                                                        <button class="btn-action-sm ${(s.status || 'ACTIVE') === 'ACTIVE' ? 'danger' : ''}" onclick="window.msotRBAC.toggleUserStatus('${s.email}'); window.msotPlatform.renderAdminRules();">
                                                            ${(s.status || 'ACTIVE') === 'ACTIVE' ? 'DEACTIVATE' : 'ACTIVATE'}
                                                        </button>
                                                        <button class="btn-action-sm" onclick="window.msotRBAC.openMessageModal('${s.email}')">💬 MESSAGE</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}

                <!-- 4. ASSIGNMENTS OVERSIGHT -->
                ${activeTab === 'assignments' ? `
                    <div>
                        <div class="admin-header">
                            <div>
                                <span class="admin-tag">PLATFORM-WIDE CURRICULUM // CENTRAL REPOSITORY</span>
                                <h2 class="section-title">ALL COURSEWORK ASSIGNMENTS</h2>
                                <p class="section-subtitle">Oversee all assignments published across all faculty instructors. Manage publication status and review student submissions.</p>
                            </div>
                        </div>

                        <div class="rbac-table-wrap">
                            <table class="rbac-data-table">
                                <thead>
                                    <tr>
                                        <th>ASSIGNMENT TITLE</th>
                                        <th>FACULTY AUTHOR</th>
                                        <th>DEADLINE</th>
                                        <th>MARKS / XP</th>
                                        <th>STATUS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${assignments.map(a => `
                                        <tr>
                                            <td>
                                                <strong style="color:#fff;font-size:14px;">${a.title}</strong>
                                                <div style="font-size:11px;color:#8c96a8;">${a.subject || 'Computer Science'}</div>
                                            </td>
                                            <td><small>${a.creatorName || a.creatorEmail}</small></td>
                                            <td>${new Date(a.deadline).toLocaleDateString()}</td>
                                            <td>${a.maxMarks || 100} Marks (+${a.xpReward || 50} XP)</td>
                                            <td>
                                                <span class="status-badge ${a.isPublished ? 'status-active' : 'status-inactive'}">
                                                    ${a.isPublished ? 'PUBLISHED' : 'DRAFT'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style="display:flex;gap:6px;">
                                                    <button class="btn-action-sm" onclick="window.msotRBAC.openAssignmentModal('${a.id}')">EDIT</button>
                                                    <button class="btn-action-sm" onclick="window.msotRBAC.togglePublishAssignment('${a.id}'); window.msotPlatform.renderAdminRules();">
                                                        ${a.isPublished ? 'UNPUBLISH' : 'PUBLISH'}
                                                    </button>
                                                    <button class="btn-action-sm danger" onclick="window.msotRBAC.deleteAssignment('${a.id}'); window.msotPlatform.renderAdminRules();">DEL</button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}

                <!-- 5. LEAGUES & GUILDS OVERSIGHT -->
                ${activeTab === 'leagues_guilds' ? `
                    <div>
                        <div class="admin-header">
                            <div>
                                <span class="admin-tag">COMPETITIVE ECOSYSTEM // LEAGUES & FACTIONS</span>
                                <h2 class="section-title">CADET LEAGUES, GUILDS & BATTLE SYSTEM</h2>
                                <p class="section-subtitle">Real-time competitive health, weekly promotion tiers, Guild standings, and PvP Battle matchmaking overview.</p>
                            </div>
                        </div>

                        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:20px;">
                            <div class="dashboard-panel">
                                <h4 class="panel-title">🏆 Cadet League Distribution</h4>
                                <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px;">
                                    <div style="display:flex;justify-content:space-between;"><span>💎 Diamond League</span><strong>3 Cadets (Top 5%)</strong></div>
                                    <div style="display:flex;justify-content:space-between;"><span>🥇 Platinum League</span><strong>8 Cadets (Top 15%)</strong></div>
                                    <div style="display:flex;justify-content:space-between;"><span>🥈 Gold League</span><strong>14 Cadets (Top 35%)</strong></div>
                                    <div style="display:flex;justify-content:space-between;"><span>🥉 Silver League</span><strong>22 Cadets (Middle 40%)</strong></div>
                                    <div style="display:flex;justify-content:space-between;"><span>🛡️ Bronze & Iron</span><strong>30 Cadets (Cadet Tiers)</strong></div>
                                </div>
                                <div style="margin-top:16px;">
                                    <button class="secondary-btn" style="width:100%;" onclick="window.switchSection('leaguesSection', true)">LAUNCH LEAGUES BOARD ➔</button>
                                </div>
                            </div>

                            <div class="dashboard-panel">
                                <h4 class="panel-title">⚔️ Guild Factions & Team Battles</h4>
                                <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px;">
                                    <div style="display:flex;justify-content:space-between;"><span>🐉 Cyber Ronin</span><strong>Tier 4 • 18 Cadets</strong></div>
                                    <div style="display:flex;justify-content:space-between;"><span>⚡ Neo Spark</span><strong>Tier 3 • 14 Cadets</strong></div>
                                    <div style="display:flex;justify-content:space-between;"><span>🐺 Shadow Wolves</span><strong>Tier 3 • 12 Cadets</strong></div>
                                    <div style="display:flex;justify-content:space-between;"><span>⛩️ Quantum Lotus</span><strong>Tier 2 • 9 Cadets</strong></div>
                                </div>
                                <div style="margin-top:16px;">
                                    <button class="secondary-btn" style="width:100%;" onclick="window.switchSection('battleSection', true)">LAUNCH BATTLE ARENA ➔</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- 6. REQUESTS & INACTIVITY REASONS -->
                ${activeTab === 'requests' ? `
                    <div>
                        <div class="admin-header">
                            <div>
                                <span class="admin-tag">CENTRAL STUDENT REQUESTS // REASONS LEDGER</span>
                                <h2 class="section-title">ALL STUDENT INACTIVITY NOTICES & REQUESTS</h2>
                                <p class="section-subtitle">Platform-wide log of student absence reasons with full faculty response history and administrative review capabilities.</p>
                            </div>
                        </div>

                        <div style="display:flex;flex-direction:column;gap:16px;">
                            ${reasons.map(r => `
                                <div class="inactivity-reason-item">
                                    <div class="iri-head">
                                        <div>
                                            <span class="iri-name">${r.studentName}</span>
                                            <span style="font-size:12px;color:var(--text-dim);"> (${r.studentRoll || 'Cadet'} • ${r.studentEmail})</span>
                                            <span class="iri-category">${r.category}</span>
                                        </div>
                                        <span class="status-badge ${r.status === 'PENDING' ? 'status-inactive' : 'status-active'}">${r.status}</span>
                                    </div>
                                    <div style="font-size:12px;color:var(--text-dim);margin-bottom:8px;">
                                        Dates: ${r.startDate} to ${r.endDate} • Submitted on ${new Date(r.createdAt).toLocaleDateString()}
                                    </div>
                                    <p class="iri-text">"${r.reasonText}"</p>
                                    ${r.facultyResponse ? `
                                        <div style="background:rgba(52,211,153,0.08);border-left:3px solid #34d399;padding:10px 14px;border-radius:4px;margin-top:8px;">
                                            <div style="font-size:11px;color:#34d399;font-weight:700;">FACULTY RESPONSE:</div>
                                            <div style="font-size:13px;color:#fff;">"${r.facultyResponse}"</div>
                                        </div>
                                    ` : ''}
                                    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px;">
                                        <button class="btn-action-sm" onclick="window.msotRBAC.openRespondInactivityModal('${r.id}')">EDIT RESPONSE</button>
                                        <button class="btn-action-sm" onclick="window.msotRBAC.openMessageModal('${r.studentEmail}')">MESSAGE CADET</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- 7. MESSAGES AUDIT -->
                ${activeTab === 'messages' ? `
                    <div>
                        <div class="admin-header">
                            <div>
                                <span class="admin-tag">COMMUNICATION AUDIT // ACADEMIC DIALOGUE</span>
                                <h2 class="section-title">CENTRAL PLATFORM MESSAGES LOG</h2>
                                <p class="section-subtitle">Audit log of correspondence between faculty instructors and students across the platform.</p>
                            </div>
                            <button class="primary-btn" onclick="window.msotRBAC.openMessageModal()">✉️ BROADCAST MESSAGE</button>
                        </div>

                        <div style="display:flex;flex-direction:column;gap:12px;">
                            ${messages.map(m => `
                                <div class="academic-message-item">
                                    <div class="ami-head">
                                        <div>
                                            <strong style="color:#fff;">${m.studentName}</strong>
                                            <span style="font-size:12px;color:var(--text-dim);"> (${m.studentEmail})</span>
                                        </div>
                                        <span class="ami-date">${new Date(m.createdAt).toLocaleString()}</span>
                                    </div>
                                    <h4 class="ami-subject">${m.subject}</h4>
                                    <p class="ami-body">${m.body}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- 8. QUESTION BANK (Preserved) -->
                ${activeTab === 'questions' ? `
                    <div>
                        <div class="admin-header">
                            <div>
                                <span class="admin-tag">CENTRAL LEARNING ASSETS // QUESTION BANK</span>
                                <h2 class="section-title">PLATFORM QUESTION BANK & LAB MANAGEMENT</h2>
                                <p class="section-subtitle">Manage questions across Daily Trials and Weekend Labs. Author, edit, publish, or delete questions with strict server enforcement.</p>
                            </div>
                            <button class="primary-btn" onclick="window.msotRBAC.openQuestionModal()">➕ CREATE NEW QUESTION</button>
                        </div>

                        <div class="rbac-table-wrap">
                            <table class="rbac-data-table">
                                <thead>
                                    <tr>
                                        <th>QUESTION TITLE</th>
                                        <th>MODULE</th>
                                        <th>DIFFICULTY</th>
                                        <th>ANSWER KEY</th>
                                        <th>XP VALUE</th>
                                        <th>AUTHOR</th>
                                        <th>STATUS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${questions.map(q => `
                                        <tr>
                                            <td>
                                                <strong style="color:#fff;">${q.title}</strong>
                                                <div style="font-size:11px;color:#8c96a8;">${q.category}</div>
                                            </td>
                                            <td>
                                                <span class="badge-role ${q.activity_type === 'daily_trial' ? 'student' : 'faculty'}">
                                                    ${q.activity_type === 'daily_trial' ? '⚡ Daily Trial' : (q.activity_type === 'weekend_lab' ? '💻 Weekend Lab' : '📚 General')}
                                                </span>
                                            </td>
                                            <td>
                                                <span style="font-weight:700;color:${q.difficulty === 'beginner' ? '#34d399' : (q.difficulty === 'intermediate' ? '#fbbf24' : '#f87171')};">
                                                    ${(q.difficulty || 'intermediate').toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <span style="font-weight:900;color:#00f0ff;background:rgba(0,240,255,0.1);padding:2px 8px;border-radius:4px;">
                                                    ${q.correct_answer}
                                                </span>
                                            </td>
                                            <td><strong>+${q.xp_reward || 15} XP</strong></td>
                                            <td><small>${q.creator_name || q.creator_email}</small></td>
                                            <td>
                                                <span class="status-badge ${q.is_published ? 'status-active' : 'status-inactive'}">
                                                    ${q.is_published ? 'PUBLISHED' : 'DRAFT'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style="display:flex;gap:6px;">
                                                    <button class="btn-action-sm" onclick="window.msotRBAC.openQuestionModal('${q.id}')">EDIT</button>
                                                    <button class="btn-action-sm" onclick="window.msotRBAC.togglePublishQuestion('${q.id}'); window.msotPlatform.renderAdminRules();">
                                                        ${q.is_published ? 'UNPUBLISH' : 'PUBLISH'}
                                                    </button>
                                                    <button class="btn-action-sm danger" onclick="window.msotRBAC.deleteQuestion('${q.id}'); window.msotPlatform.renderAdminRules();">DEL</button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}

                <!-- 9. XP RULES (Preserved) -->
                ${activeTab === 'rules' ? `
                    <div>
                        <div class="admin-header">
                            <div>
                                <span class="admin-tag">SYSTEM GOVERNANCE // CONFIGURABLE XP ENGINE</span>
                                <h2 class="section-title">XP RULES CONFIGURATION CONSOLE (xp_rules)</h2>
                                <p class="section-subtitle">
                                    Admins can edit base points, daily limits, and multipliers dynamically. 
                                    <strong>No source code changes required.</strong>
                                </p>
                            </div>
                            <button class="secondary-btn" onclick="window.msotPlatform.resetRulesToDefault()">RESET TO DEFAULTS ↺</button>
                        </div>

                        <div class="rules-table-wrap">
                            <table class="rules-table">
                                <thead>
                                    <tr>
                                        <th>ACTION IDENTIFIER</th>
                                        <th>DESCRIPTION</th>
                                        <th>BASE XP</th>
                                        <th>DAILY CAP</th>
                                        <th>ENABLED</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.entries(rules).map(([key, r]) => `
                                        <tr>
                                            <td><code>${r.action_type}</code></td>
                                            <td>${r.description}</td>
                                            <td>
                                                <input type="number" min="1" max="500" value="${r.base_xp}" id="xpInput_${key}" class="xp-num-input">
                                            </td>
                                            <td>
                                                <input type="number" min="5" max="1000" value="${r.max_daily_xp}" id="capInput_${key}" class="xp-num-input">
                                            </td>
                                            <td>
                                                <input type="checkbox" ${r.enabled ? 'checked' : ''} id="enabledInput_${key}">
                                            </td>
                                            <td>
                                                <button class="save-rule-btn" onclick="window.msotPlatform.saveAdminRule('${key}')">APPLY</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}

                <!-- 10. AUDIT LOGS (Preserved) -->
                ${activeTab === 'audit' ? `
                    <div>
                        <div class="admin-header">
                            <div>
                                <span class="admin-tag">SECURITY AUDIT // IMMUTABLE HISTORY</span>
                                <h2 class="section-title">ADMINISTRATIVE ACTIVITY AUDIT LOG</h2>
                                <p class="section-subtitle">Cryptographic log of user role updates, account status changes, and learning question publications.</p>
                            </div>
                        </div>

                        <div class="rbac-table-wrap">
                            <table class="rbac-data-table">
                                <thead>
                                    <tr>
                                        <th>TIMESTAMP</th>
                                        <th>ADMINISTRATOR</th>
                                        <th>SECURITY ACTION</th>
                                        <th>TARGET ENTITY</th>
                                        <th>METADATA / DETAILS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${auditLogs.length === 0 ? `
                                        <tr><td colspan="5" style="text-align:center;padding:36px;color:#8c96a8;">No administrative events recorded yet.</td></tr>
                                    ` : auditLogs.slice(0, 30).map(log => `
                                        <tr>
                                            <td><small>${new Date(log.timestamp).toLocaleTimeString()} • ${new Date(log.timestamp).toLocaleDateString()}</small></td>
                                            <td><code>${log.admin_email}</code></td>
                                            <td><span class="badge-role admin">${log.action}</span></td>
                                            <td><strong>${log.target_type} // ${log.target_id}</strong></td>
                                            <td><small style="color:#8c96a8;">${typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}</small></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    saveAdminRule(key) {
        const currentRole = (this.activeRole || window.msotState?.currentRole || window.msotAuth?.session?.role || 'STUDENT').toUpperCase();
        if (currentRole !== 'ADMIN') {
            alert('⚠️ Permission Denied: Only Admins can modify XP rules.');
            return;
        }

        const xpInput = document.getElementById(`xpInput_${key}`);
        const capInput = document.getElementById(`capInput_${key}`);
        const enabledInput = document.getElementById(`enabledInput_${key}`);

        if (xpInput && capInput && enabledInput) {
            const updates = {
                base_xp: parseInt(xpInput.value, 10),
                max_daily_xp: parseInt(capInput.value, 10),
                enabled: enabledInput.checked
            };
            window.msotState.updateRule(key, updates);
            if (window.msotRBAC) {
                window.msotRBAC.logAudit('XP_RULE_UPDATED', 'rule', key, updates);
            }
            if (window.miraiAudio) window.miraiAudio.playClick();
            alert(`Rule [${key}] successfully updated in database.`);
            this.renderAdminRules();
        }
    }

    resetRulesToDefault() {
        const currentRole = (this.activeRole || window.msotState?.currentRole || window.msotAuth?.session?.role || 'STUDENT').toUpperCase();
        if (currentRole !== 'ADMIN') {
            alert('⚠️ Permission Denied: Only Admins can reset XP rules.');
            return;
        }

        if (confirm('Reset all XP economy rules to default academy specifications?')) {
            window.msotState.rules = JSON.parse(JSON.stringify(DEFAULT_XP_RULES));
            window.msotState.save();
            if (window.msotRBAC) {
                window.msotRBAC.logAudit('XP_RULES_RESET_TO_DEFAULT', 'system', 'all');
            }
            this.refreshAll();
        }
    }

    // =========================================================================
    // 10. IMMUTABLE XP TRANSACTIONS LEDGER VIEW (Section 6)
    // =========================================================================
    renderXPLedger() {
        const container = document.getElementById('xpLedgerContainer');
        if (!container) return;

        const txs = window.msotState.transactions;

        container.innerHTML = `
            <div class="ledger-full-card scroll-reveal">
                <div class="section-intro-block">
                    <span class="section-tagline">TRANSACTIONAL AUDIT HISTORY</span>
                    <h2 class="section-title">IMMUTABLE XP TRANSACTIONS LEDGER (xp_transactions)</h2>
                    <p class="section-subtitle">
                        Every XP award is logged as an immutable financial-grade transaction with cryptographic timestamp, 
                        source attribution, and anti-fraud validation status.
                    </p>
                </div>

                <div class="ledger-table-wrap">
                    <table class="audit-table">
                        <thead>
                            <tr>
                                <th>TX ID</th>
                                <th>TIMESTAMP</th>
                                <th>ACTION TYPE</th>
                                <th>POINTS</th>
                                <th>JUSTIFICATION REASON</th>
                                <th>CREATED BY</th>
                                <th>INTEGRITY STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${txs.map(t => `
                                <tr class="${t.status === 'VOIDED' ? 'voided-row' : ''}">
                                    <td><code>${t.id}</code></td>
                                    <td>${t.created_at}</td>
                                    <td><span class="action-tag">${t.action_type}</span></td>
                                    <td><strong class="${t.status === 'VOIDED' ? 'text-strike' : 'text-green'}">+${t.xp_amount} XP</strong></td>
                                    <td>${t.reason}</td>
                                    <td><small>${t.created_by}</small></td>
                                    <td><span class="status-chip ${t.status.toLowerCase()}">${t.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // =========================================================================
    // 11. ARCADE CATALOG & 17 CURRICULUM GAMES
    // =========================================================================
    renderArcade() {
        const grid = document.getElementById('arcadeGrid');
        if (!grid) return;

        const completedList = Array.isArray(window.msotState?.student?.completedGames)
            ? window.msotState.student.completedGames
            : [];

        const games = (window.MIRAI_GAMES || []).filter(g => {
            if (this.activeArcadeFilter === 'all') return true;
            if (this.activeArcadeFilter === 'cpp') return g.track === 'cpp';
            if (this.activeArcadeFilter === 'html') return g.track === 'html';
            if (this.activeArcadeFilter === 'completed') return completedList.includes(g.id);
            return true;
        });

        grid.innerHTML = games.map(g => {
            const isCompleted = completedList.includes(g.id);

            return `
                <div class="game-card ${isCompleted ? 'completed' : ''}" data-track="${g.track}">
                    <div class="card-badge-header">
                        <span class="track-tag ${g.track}">${g.track === 'cpp' ? '⚡ ' + g.trackName : '🌐 ' + g.trackName}</span>
                        <span class="topic-pill">TOPIC ${String(g.topicNum).padStart(2, '0')}</span>
                        <span class="status-pill ${isCompleted ? 'clear' : 'unlocked'}">${isCompleted ? 'CLEARED ✓' : 'CHAMBER OPEN ⚔️'}</span>
                    </div>

                    <div class="card-hero-wrap">
                        <div class="card-hero-halo ${g.track}"></div>
                        <div class="card-hero-icon">${g.badge.icon}</div>
                    </div>

                    <h3 class="card-title">${g.title}</h3>
                    <div class="card-topic-name">
                        <span class="topic-dot ${g.track}"></span>
                        <span>${g.topic}</span>
                    </div>
                    <p class="card-story">${g.story}</p>

                    <div class="card-footer">
                        <div class="badge-reward-preview">
                            <span class="reward-icon">${g.badge.icon}</span>
                            <div class="reward-info">
                                <span class="reward-label">REWARD BADGE</span>
                                <span class="reward-title">${g.badge.name}</span>
                            </div>
                        </div>
                        <button class="launch-game-btn ${g.track}" onclick="window.miraiGame.openGame('${g.id}')">
                            <span>${isCompleted ? 'REPLAY ↺' : 'DEPLOY GAME ➔'}</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        if (window.miraiScroll && window.miraiScroll.refreshObservers) {
            window.miraiScroll.refreshObservers();
        }

        // Force all cards immediately visible (IntersectionObserver won't fire
        // when the arcade section is at viewport top after navigation)
        grid.querySelectorAll('.game-card, .scroll-reveal, .stagger-item').forEach(el => {
            el.classList.add('in-view');
        });
    }

    setFilter(filterName, btnEl) {
        this.activeArcadeFilter = filterName;
        document.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
        if (btnEl) btnEl.classList.add('active');
        this.renderArcade();
        if (window.miraiAudio) window.miraiAudio.playClick();
    }

    // =========================================================================
    // 12. STUDENT PROFILE DOSSIER
    // =========================================================================
    renderStudentProfile() {
        const container = document.getElementById('profileCardContainer');
        if (!container) return;

        const s = window.msotState.student || {};
        const levelData = calculateLevelData(s.lifetimeXP || 0);

        const role = s.role || 'Student';
        const year = s.year || '2nd Year';
        const semester = s.semester || 'Semester 4';
        const section = (s.section === 'Section Beta' || s.section === 'Beta' || s.section === 'Section B') ? 'Section Beta' : 'Section Alpha';
        const rank = s.leagueRank || 8;
        const id = s.id || 'MSOT-2026-482';
        const name = s.name || 'Cadet';
        const avatar = s.avatar || '⚔️';
        const isPhoto = (avatar.startsWith('data:') || avatar.startsWith('http') || avatar.startsWith('/'));

        const pbList = (Array.isArray(s.personalBests) && s.personalBests.length > 0) ? s.personalBests : [
            { metric: 'Quickest Perfect Quiz', value: '5/5 in 38s', date: 'Yesterday' },
            { metric: 'Highest Weekly XP Surge', value: '+520 XP', date: 'Last Week' },
            { metric: 'Longest Unbroken Streak', value: `${s.streak || 7} Days`, date: 'Current' }
        ];

        container.innerHTML = `
            <div class="profile-dashboard-card scroll-reveal">
                <!-- Top Identity Dossier Header -->
                <div class="profile-header-banner">
                    <!-- Profile Picture Frame with Edit Trigger -->
                    <div class="profile-avatar-frame-wrap">
                        <div class="profile-avatar-box" id="profileAvatarDisplay" onclick="window.msotPlatform.openAvatarModal()" title="Click to Change Photo / Avatar">
                            ${isPhoto 
                                ? `<img src="${avatar}" alt="Cadet Avatar" class="avatar-img-view">` 
                                : `<span class="p-avatar">${avatar}</span>`
                            }
                            <div class="avatar-edit-overlay">
                                <span>📷 CHANGE</span>
                            </div>
                        </div>
                    </div>

                    <div class="profile-details-column">
                        <div class="profile-title-row">
                            <h2 class="p-name">${name}</h2>
                            <button type="button" class="edit-name-btn" onclick="window.msotPlatform.openEditProfileModal()" title="Edit Profile Details">✎ Edit Profile</button>
                            <span class="role-badge-student ${role.toUpperCase() === 'ADMIN' ? 'role-badge-admin' : ''}">
                                ${role.toUpperCase() === 'ADMIN' ? '🛡️ ADMIN (MASTER)' : (role.toUpperCase() === 'FACULTY' ? '🎓 FACULTY' : '⚔️ STUDENT')}
                            </span>
                            <span class="cadet-rank-badge">🏆 COHORT RANK #${rank}</span>
                        </div>

                        <div class="profile-sub-badges-row">
                            <div class="cadet-id-pill" onclick="window.msotPlatform.copyCadetId('${id}')" title="Click to copy Cadet ID">
                                <span class="id-icon">🪪</span>
                                <span class="id-label">STUDENT ID:</span>
                                <span class="id-val">${id}</span>
                                <span class="copy-hint" id="copyHintText">📋 Copy</span>
                            </div>
                            <span class="p-alias">${s.alias || `@${s.username || 'cadet'}`}</span>
                            <span class="p-campus-pill">✉ ${s.email || 'cadet@gmail.com'}</span>
                            <span class="p-batch-pill">🏛️ ${s.branch || 'Computer Science (CSE)'}</span>
                            ${s.phone ? `<span class="p-campus-pill">📱 ${s.phone}</span>` : ''}
                            <span class="p-campus-pill">📍 ${s.campus || 'Mirai Central Campus'}</span>
                        </div>
                    </div>

                    <div class="profile-settings-switches">
                        <label class="switch-lbl">
                            <input type="checkbox" ${s.anonymousMode ? 'checked' : ''} onchange="window.msotPlatform.toggleAnonymousMode()">
                            <span>Incognito Leaderboard ("${s.alias || 'Anonymous'}")</span>
                        </label>
                    </div>
                </div>

                <!-- Academic Standing & Cohort Selector (Year, Semester, Section A/B) -->
                <div class="academic-config-hub">
                    <div class="acad-config-header">
                        <span class="ach-icon">⛩️</span>
                        <div>
                            <h3 class="ach-title">ACADEMIC STANDING & COHORT ASSIGNMENT</h3>
                            <p class="ach-desc">Live synchronization with your active curriculum track, grade semester, and team battles.</p>
                        </div>
                    </div>

                    <div class="acad-grid-controls">
                        <!-- Academic Year Selector -->
                        <div class="acad-control-box">
                            <span class="ac-label">ACADEMIC YEAR</span>
                            <div class="ac-pills-row">
                                ${['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => `
                                    <button type="button" class="ac-btn ${(year === y) ? 'active' : ''}" onclick="window.msotState.updateStudentProfile({ year: '${y}' })">${y}</button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Current Semester Selector -->
                        <div class="acad-control-box">
                            <span class="ac-label">SEMESTER</span>
                            <div class="ac-pills-row semester-pills">
                                ${['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'].map((sem, idx) => `
                                    <button type="button" class="ac-btn ${(semester === `Semester ${idx+1}` || semester === sem) ? 'active' : ''}" onclick="window.msotState.updateStudentProfile({ semester: 'Semester ${idx+1}' })">${sem}</button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Section Alpha / Beta Switcher -->
                        <div class="acad-control-box section-box">
                            <span class="ac-label">SECTION / COHORT</span>
                            <div class="section-switch-container">
                                <button type="button" class="section-choice-btn ${(section === 'Section Alpha') ? 'active' : ''}" onclick="window.msotState.updateStudentProfile({ section: 'Section Alpha' })">
                                    <span class="sec-flag">⚔️</span>
                                    <div class="sec-text">
                                        <strong>SECTION ALPHA</strong>
                                        <small>Cybernetics & DSA</small>
                                    </div>
                                </button>
                                <button type="button" class="section-choice-btn ${(section === 'Section Beta') ? 'active' : ''}" onclick="window.msotState.updateStudentProfile({ section: 'Section Beta' })">
                                    <span class="sec-flag">🛡️</span>
                                    <div class="sec-text">
                                        <strong>SECTION BETA</strong>
                                        <small>Systems & Web Dev</small>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Metrics Row: Level, Lifetime XP, Streak, Rank -->
                <div class="profile-metrics-row mt-24">
                    <div class="pm-box level-pm-box">
                        <span class="pm-lbl">ACADEMY LEVEL</span>
                        <div class="pm-level-row">
                            <span class="pm-val">Level ${levelData.level}</span>
                            <span class="level-sub-title">${levelData.level >= 12 ? 'Elite Arch-Coder' : (levelData.level >= 5 ? 'Senior Cyber Cadet' : 'Initiate')}</span>
                        </div>
                        <div class="level-progress-bar">
                            <div class="lp-fill" style="width: ${levelData.progressPercent}%"></div>
                        </div>
                        <span class="pm-sub">${levelData.currentLevelXP.toLocaleString()} / ${levelData.xpNeededForLevel.toLocaleString()} XP to Level ${levelData.level + 1} (${levelData.progressPercent}%)</span>
                    </div>

                    <div class="pm-box">
                        <span class="pm-lbl">LIFETIME XP REPUTATION</span>
                        <span class="pm-val text-red">${(s.lifetimeXP || 0).toLocaleString()} XP</span>
                        <span class="pm-sub">Weekly Contribution: ${(s.weeklyXP || 0).toLocaleString()} XP</span>
                    </div>

                    <div class="pm-box">
                        <span class="pm-lbl">ACTIVE STUDY STREAK</span>
                        <span class="pm-val">${s.streak || 1} Days 🔥</span>
                        <span class="pm-sub">${s.streakFreezes || 0} Streak Freezes Available 🛡️</span>
                    </div>

                    <div class="pm-box rank-pm-box">
                        <span class="pm-lbl">COHORT RANK</span>
                        <span class="pm-val text-gold">Rank #${rank}</span>
                        <span class="pm-sub">${s.questionsSolved || 32} Solved • ${s.streak || 7}d Streak 🔥</span>
                    </div>
                </div>

                <!-- Personal Bests Showcase -->
                <div class="personal-bests-section mt-24">
                    <h3 class="vault-title">👑 Verified Personal Bests</h3>
                    <div class="pb-grid-cards">
                        ${pbList.map(pb => `
                            <div class="pb-card">
                                <span class="pb-card-lbl">${pb.metric}</span>
                                <span class="pb-card-val">${pb.value}</span>
                                <span class="pb-card-date">${pb.date}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Avatar & Profile Photo Modal -->
                <div class="avatar-modal-overlay" id="avatarPickerModal" style="display:none;" onclick="if(event.target===this) window.msotPlatform.closeAvatarModal()">
                    <div class="avatar-modal-card">
                        <div class="am-header">
                            <h3>🎨 CHOOSE PROFILE PICTURE / AVATAR</h3>
                            <button type="button" class="am-close-btn" onclick="window.msotPlatform.closeAvatarModal()">✕</button>
                        </div>
                        <p class="am-subtitle">Pick an anime/cyberpunk cadet avatar, upload a picture, or paste an image URL.</p>
                        
                        <div class="am-presets-title">⚡ CADET AVATAR PRESETS</div>
                        <div class="avatar-presets-grid">
                            ${['⚔️', '🛡️', '🧙‍♂️', '👾', '🤖', '🦊', '⚡', '🌸', '👑', '🎯', '🐱', '🔥', '🐉', '🔮', '🚀', '🥋'].map(av => `
                                <button type="button" class="av-preset-btn ${avatar === av ? 'active' : ''}" onclick="window.msotPlatform.selectAvatarPreset('${av}')">${av}</button>
                            `).join('')}
                        </div>

                        <div class="am-divider"><span>OR UPLOAD CUSTOM PHOTO</span></div>

                        <div class="am-upload-block">
                            <label class="am-file-label">
                                📁 Upload Photo from Device
                                <input type="file" id="avatarFileInput" accept="image/*" style="display:none;" onchange="window.msotPlatform.handlePhotoUpload(this)">
                            </label>
                            <div class="am-url-row">
                                <input type="text" id="avatarUrlInput" placeholder="Or paste image URL (https://...)" class="am-url-field">
                                <button type="button" class="am-url-btn" onclick="window.msotPlatform.saveAvatarFromUrl()">APPLY</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Edit Profile Dossier Modal (Unique Username, Name, Student ID) -->
                <div class="avatar-modal-overlay" id="editProfileModal" style="display:none;" onclick="if(event.target===this) window.msotPlatform.closeEditProfileModal()">
                    <div class="avatar-modal-card">
                        <div class="am-header">
                            <h3>✎ EDIT CADET DOSSIER</h3>
                            <button type="button" class="am-close-btn" onclick="window.msotPlatform.closeEditProfileModal()">✕</button>
                        </div>
                        <p class="am-subtitle">Update your official student name, unique username, and student ID.</p>
                        
                        <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:18px;">
                            <div class="form-group">
                                <label class="ac-label">FULL NAME</label>
                                <div class="auth-input-wrap">
                                    <input type="text" id="editProfileNameInput" value="${name}" class="am-url-field" style="width:100%;background:transparent;border:none;">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="ac-label">UNIQUE USERNAME (MUST BE UNIQUE)</label>
                                <div class="auth-input-wrap">
                                    <span style="color:var(--cyber-cyan);margin-right:4px;">@</span>
                                    <input type="text" id="editProfileUsernameInput" value="${(s.username || '').replace(/^@/, '')}" class="am-url-field" style="width:100%;background:transparent;border:none;">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="ac-label">STUDENT / CADET ID</label>
                                <div class="auth-input-wrap">
                                    <input type="text" id="editProfileIdInput" value="${id}" class="am-url-field" style="width:100%;background:transparent;border:none;">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="ac-label">BRANCH / DEPARTMENT</label>
                                <div class="auth-input-wrap">
                                    <input type="text" id="editProfileBranchInput" value="${s.branch || 'Computer Science & Engineering (CSE)'}" class="am-url-field" style="width:100%;background:transparent;border:none;">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="ac-label">PHONE NUMBER (OPTIONAL)</label>
                                <div class="auth-input-wrap">
                                    <input type="tel" id="editProfilePhoneInput" value="${s.phone || ''}" placeholder="+91..." class="am-url-field" style="width:100%;background:transparent;border:none;">
                                </div>
                            </div>
                        </div>

                        <div id="editProfileError" style="color:#ff2a4b;font-size:12px;margin-bottom:12px;display:none;"></div>

                        <div style="display:flex;justify-content:flex-end;gap:10px;">
                            <button type="button" class="ac-btn" onclick="window.msotPlatform.closeEditProfileModal()">CANCEL</button>
                            <button type="button" class="am-url-btn" onclick="window.msotPlatform.saveProfileDetails()">SAVE CHANGES ➔</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    copyCadetId(id) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(id).then(() => {
                const h = document.getElementById('copyHintText');
                if (h) {
                    h.innerText = '✓ COPIED!';
                    h.style.color = 'var(--cyber-cyan)';
                    setTimeout(() => { if (h) { h.innerText = '📋 Copy'; h.style.color = ''; } }, 2000);
                }
            }).catch(() => {});
        }
        if (window.miraiAudio && window.miraiAudio.playClick) window.miraiAudio.playClick();
    }

    openEditProfileModal() {
        const m = document.getElementById('editProfileModal');
        if (m) m.style.display = 'flex';
        const errEl = document.getElementById('editProfileError');
        if (errEl) errEl.style.display = 'none';
        if (window.miraiAudio && window.miraiAudio.playClick) window.miraiAudio.playClick();
    }

    closeEditProfileModal() {
        const m = document.getElementById('editProfileModal');
        if (m) m.style.display = 'none';
    }

    saveProfileDetails() {
        const nameInput = document.getElementById('editProfileNameInput');
        const userInput = document.getElementById('editProfileUsernameInput');
        const idInput = document.getElementById('editProfileIdInput');
        const branchInput = document.getElementById('editProfileBranchInput');
        const phoneInput = document.getElementById('editProfilePhoneInput');
        const errEl = document.getElementById('editProfileError');

        const newName = (nameInput ? nameInput.value : '').trim();
        const newUsername = (userInput ? userInput.value : '').replace(/^@/, '').trim().toLowerCase();
        const newId = (idInput ? idInput.value : '').trim();
        const newBranch = (branchInput ? branchInput.value : '').trim() || 'Computer Science & Engineering (CSE)';
        const newPhone = (phoneInput ? phoneInput.value : '').trim();
        const curEmail = window.msotState.currentUserEmail || window.msotState.student?.email;

        if (!newName) {
            if (errEl) { errEl.textContent = 'Please enter your full name.'; errEl.style.display = 'block'; }
            return;
        }

        if (!newUsername || newUsername.length < 3) {
            if (errEl) { errEl.textContent = 'Username must be at least 3 characters.'; errEl.style.display = 'block'; }
            return;
        }

        if (!/^[a-z0-9_.-]+$/.test(newUsername)) {
            if (errEl) { errEl.textContent = 'Username can only contain letters, numbers, underscores, dots, or dashes.'; errEl.style.display = 'block'; }
            return;
        }

        // Check if username is already taken by another cadet
        if (window.msotAuth && window.msotAuth.isUsernameTaken && window.msotAuth.isUsernameTaken(newUsername, curEmail)) {
            if (errEl) { errEl.textContent = `Username "@${newUsername}" is already taken by another cadet. Please pick a unique username.`; errEl.style.display = 'block'; }
            if (window.miraiAudio && window.miraiAudio.playError) window.miraiAudio.playError();
            return;
        }

        if (!newId) {
            if (errEl) { errEl.textContent = 'Please enter your Student ID.'; errEl.style.display = 'block'; }
            return;
        }

        window.msotState.updateStudentProfile({
            name: newName,
            username: newUsername,
            alias: `@${newUsername}`,
            id: newId,
            branch: newBranch,
            phone: newPhone
        });

        // Also sync local accounts store
        try {
            const raw = localStorage.getItem('MSOT_LEARN_ACCOUNTS_V2');
            if (raw && curEmail) {
                const accounts = JSON.parse(raw);
                if (accounts[curEmail.toLowerCase()]) {
                    accounts[curEmail.toLowerCase()].name = newName;
                    accounts[curEmail.toLowerCase()].username = newUsername;
                    accounts[curEmail.toLowerCase()].alias = `@${newUsername}`;
                    accounts[curEmail.toLowerCase()].studentId = newId;
                    accounts[curEmail.toLowerCase()].branch = newBranch;
                    accounts[curEmail.toLowerCase()].phone = newPhone;
                    localStorage.setItem('MSOT_LEARN_ACCOUNTS_V2', JSON.stringify(accounts));
                }
            }
        } catch(e) {}

        this.closeEditProfileModal();
        if (window.miraiAudio && window.miraiAudio.playLevelUp) window.miraiAudio.playLevelUp();
    }

    openAvatarModal() {
        const m = document.getElementById('avatarPickerModal');
        if (m) m.style.display = 'flex';
        if (window.miraiAudio && window.miraiAudio.playClick) window.miraiAudio.playClick();
    }

    closeAvatarModal() {
        const m = document.getElementById('avatarPickerModal');
        if (m) m.style.display = 'none';
    }

    selectAvatarPreset(av) {
        window.msotState.updateStudentProfile({ avatar: av });
        this.closeAvatarModal();
        if (window.miraiAudio && window.miraiAudio.playClick) window.miraiAudio.playClick();
    }

    handlePhotoUpload(input) {
        if (!input || !input.files || !input.files[0]) return;
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            window.msotState.updateStudentProfile({ avatar: dataUrl });
            this.closeAvatarModal();
            if (window.miraiAudio && window.miraiAudio.playLevelUp) window.miraiAudio.playLevelUp();
        };
        reader.readAsDataURL(file);
    }

    saveAvatarFromUrl() {
        const urlInput = document.getElementById('avatarUrlInput');
        if (!urlInput || !urlInput.value.trim()) return;
        const url = urlInput.value.trim();
        window.msotState.updateStudentProfile({ avatar: url });
        this.closeAvatarModal();
        if (window.miraiAudio && window.miraiAudio.playLevelUp) window.miraiAudio.playLevelUp();
    }

    // =========================================================================
    // 11. WEEKEND ASSIGNMENTS & IN-BROWSER COMPILER LAB
    // =========================================================================
    renderAssignments() {
        const container = document.getElementById('assignmentsContainer');
        if (!container) return;

        const assignments = window.msotState?.assignments || [];
        const student = window.msotState?.student || {};
        const completedList = Array.isArray(student.completedAssignments) ? student.completedAssignments : [];
        const completedCount = assignments.filter(a => completedList.includes(a.id)).length;
        const totalXP = assignments.reduce((acc, a) => acc + (a.xpReward || 0), 0);

        const labView = this.activeAssignmentLabView || 'sprints';
        const facultyAssignments = window.msotRBAC ? window.msotRBAC.getAssignments('STUDENT') : [];
        const studentEmail = (window.msotAuth?.session?.email || '').toLowerCase();
        const submissions = window.msotRBAC ? window.msotRBAC.submissions : [];        // Filter assignments based on active filter
        let filtered = assignments;
        if (this.activeAssignmentFilter === 'pending') {
            filtered = assignments.filter(a => !completedList.includes(a.id));
        } else if (this.activeAssignmentFilter === 'solved') {
            filtered = assignments.filter(a => completedList.includes(a.id));
        }

        container.innerHTML = `
            <div class="assignments-hub-wrapper">
                <!-- 1. Header Hero Banner -->
                <div class="assignments-header-banner scroll-reveal">
                    <div class="ah-badge-row">
                        <span class="cyber-badge-cyan">⚡ ACADEMIC LAB SPRINT</span>
                        <span class="cyber-badge-gold">⏳ DUE EVERY SUNDAY 23:59 PM</span>
                        <span class="cyber-badge-purple">RUNTIME: C++17 • PYTHON 3 • NODE.JS</span>
                    </div>
                    <div class="ah-title-box">
                        <h2 class="ah-main-title">WEEKEND CODE SPRINTS & COMPILER LAB</h2>
                        <p class="ah-subtitle">
                            Solve weekly algorithmic challenges, test against edge cases, and run your code directly in the integrated compiler to earn verified XP.
                        </p>
                    </div>

                    <!-- 2. HUD Metrics Grid -->
                    <div class="ah-metrics-grid">
                        <div class="ah-metric-card">
                            <span class="ah-m-icon">🎯</span>
                            <div class="ah-m-info">
                                <span class="ah-m-value">${assignments.length}</span>
                                <span class="ah-m-label">ACTIVE SPRINTS</span>
                            </div>
                        </div>
                        <div class="ah-metric-card">
                            <span class="ah-m-icon">✅</span>
                            <div class="ah-m-info">
                                <span class="ah-m-value">${completedCount} / ${assignments.length}</span>
                                <span class="ah-m-label">SOLVED BY YOU</span>
                            </div>
                        </div>
                        <div class="ah-metric-card">
                            <span class="ah-m-icon">💎</span>
                            <div class="ah-m-info">
                                <span class="ah-m-value">+${totalXP} XP</span>
                                <span class="ah-m-label">XP REWARD POOL</span>
                            </div>
                        <div class="ah-metric-card highlight-pulse">
                            <span class="ah-m-icon">⚡</span>
                            <div class="ah-m-info">
                                <span class="ah-m-value">LIVE</span>
                                <span class="ah-m-label">BROWSER COMPILER</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Segmented View Selector -->
                <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;" class="scroll-reveal">
                    <button class="assign-filter-btn ${labView === 'sprints' ? 'active' : ''}" style="font-size:12px;padding:8px 16px;font-weight:700;" onclick="window.msotPlatform.activeAssignmentLabView = 'sprints'; window.msotPlatform.renderAssignments();">
                        ⚡ WEEKEND COMPILER LABS (${assignments.length})
                    </button>
                    <button class="assign-filter-btn ${labView === 'faculty_coursework' ? 'active' : ''}" style="font-size:12px;padding:8px 16px;font-weight:700;" onclick="window.msotPlatform.activeAssignmentLabView = 'faculty_coursework'; window.msotPlatform.renderAssignments();">
                        📚 FACULTY COURSEWORK ASSIGNMENTS (${facultyAssignments.length})
                    </button>
                </div>

                <!-- 3. Toolbar: Filters & Push Assignment Action -->
                <div class="assignments-toolbar scroll-reveal">
                    <div class="assignments-filter-tabs">
                        <button class="assign-filter-btn ${this.activeAssignmentFilter === 'all' ? 'active' : ''}" 
                                onclick="window.msotPlatform.filterAssignments('all')">
                            ALL SPRINTS (${assignments.length})
                        </button>
                        <button class="assign-filter-btn ${this.activeAssignmentFilter === 'pending' ? 'active' : ''}" 
                                onclick="window.msotPlatform.filterAssignments('pending')">
                            PENDING (${assignments.length - completedCount})
                        </button>
                        <button class="assign-filter-btn ${this.activeAssignmentFilter === 'solved' ? 'active' : ''}" 
                                onclick="window.msotPlatform.filterAssignments('solved')">
                            SOLVED (${completedCount})
                        </button>
                    </div>

                    <div class="assignments-actions-wrap">
                        <button class="how-xp-lab-btn" onclick="window.msotPlatform.openXPExplainedModal()" title="See how and why your XP increases in MSOT Learn">
                            <span class="btn-icon">💡</span>
                            <span class="btn-text">HOW & WHY XP INCREASES</span>
                        </button>
                        ${(this.activeRole === 'ADMIN' || this.activeRole === 'FACULTY') ? `
                            <button class="push-assignment-btn" onclick="window.msotPlatform.openPushAssignmentModal()" title="Admins and instructors can push new weekend challenges">
                                <span class="btn-icon">➕</span>
                                <span class="btn-text">PUSH WEEKEND ASSIGNMENT</span>
                                <span class="btn-pulse-ring"></span>
                            </button>
                        ` : `
                            <div class="student-facility-badge" title="Student Facility: Solve coding problems and run tests in the compiler">
                                <span class="sfb-icon">⚔️</span>
                                <span class="sfb-text">STUDENT FACILITY: SOLVE & RUN COMPILER</span>
                            </div>
                        `}
                    </div>
                </div>

                ${labView === 'faculty_coursework' ? `
                    <!-- Faculty Coursework Grid -->
                    <div class="assignments-grid scroll-reveal">
                        ${facultyAssignments.length === 0 ? `
                            <div class="assignments-empty-state">
                                <div class="empty-icon">📚</div>
                                <h3>No Coursework Assignments Published Yet</h3>
                                <p>Your course professors publish academic assignments here. Check back soon for new coursework!</p>
                            </div>
                        ` : facultyAssignments.map(a => {
                            const studentSub = submissions.find(s => s.assignmentId === a.id && s.studentEmail.toLowerCase() === studentEmail);
                            const isSubmitted = !!studentSub;
                            const isGraded = studentSub && studentSub.grade;
                            return `
                                <div class="assignment-card ${isSubmitted ? 'is-solved' : ''}">
                                    <div class="ac-header">
                                        <div class="ac-week-pill">${a.subject || 'COURSEWORK'}</div>
                                        <div class="ac-badges">
                                            <span class="diff-badge diff-medium">${a.maxMarks || 100} MARKS</span>
                                            <span class="xp-badge">+${a.xpReward || 50} XP</span>
                                        </div>
                                    </div>

                                    <h3 class="ac-title">${a.title}</h3>
                                    <div class="ac-track">
                                        <span class="track-icon">🎓</span> Instructor: ${a.creatorName || a.creatorEmail}
                                    </div>

                                    <p class="ac-excerpt">${a.description}</p>

                                    ${a.attachments && a.attachments.length ? `
                                        <div style="font-size:11px;color:var(--text-cyan);margin-bottom:8px;">
                                            🔗 <strong>Reference Material:</strong> <a href="${a.attachments[0]}" target="_blank" style="color:#00f0ff;text-decoration:underline;">Course Resource Link</a>
                                        </div>
                                    ` : ''}

                                    <div class="ac-footer">
                                        <div class="ac-status-box">
                                            ${isGraded ? `
                                                <span class="ac-solved-badge">
                                                    <span class="check-icon">✓</span> GRADED: ${studentSub.grade} (${studentSub.marksAwarded} Marks, +${studentSub.xpAwarded} XP)
                                                </span>
                                            ` : isSubmitted ? `
                                                <span style="color:#f59e0b;font-weight:700;font-size:12px;">
                                                    ⏳ SUBMITTED (Pending Faculty Review)
                                                </span>
                                            ` : `
                                                <span class="ac-due-note">⏰ Due ${new Date(a.deadline).toLocaleDateString()}</span>
                                            `}
                                        </div>
                                        <div class="ac-actions-cell" style="display:flex;align-items:center;gap:8px;">
                                            <button class="ac-launch-btn ${isSubmitted ? 'btn-solved' : 'btn-launch'}" onclick="window.msotRBAC.openSubmitAssignmentModal('${a.id}')">
                                                ${isSubmitted ? '📝 VIEW / RESUBMIT' : '📤 SUBMIT SOLUTION'}
                                            </button>
                                        </div>
                                    </div>

                                    ${isGraded && studentSub.feedback ? `
                                        <div style="background:rgba(52,211,153,0.08);border-left:3px solid #34d399;padding:8px 12px;border-radius:4px;margin-top:10px;font-size:12px;">
                                            <strong style="color:#34d399;">Instructor Feedback:</strong> "${studentSub.feedback}"
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                <!-- 4. Assignments Grid (ONLY genuinely pushed assignments appear here) -->
                <div class="assignments-grid scroll-reveal">
                    ${assignments.length === 0 ? `
                        <div class="assignments-empty-state">
                            <div class="empty-icon">⛩️</div>
                            <h3>No Weekend Assignments Currently Active</h3>
                            <p>
                                ${(this.activeRole === 'ADMIN' || this.activeRole === 'FACULTY')
                                    ? 'Click below to push the first weekend coding challenge for all students.'
                                    : 'Your instructors and administrator will push weekend coding challenges here. When published, launch the compiler to solve them and earn verified XP.'}
                            </p>
                            ${(this.activeRole === 'ADMIN' || this.activeRole === 'FACULTY') ? `
                                <button class="push-assignment-btn" onclick="window.msotPlatform.openPushAssignmentModal()" style="margin: 16px auto 0;">
                                    <span class="btn-icon">➕</span>
                                    <span class="btn-text">PUSH FIRST WEEKEND ASSIGNMENT</span>
                                </button>
                            ` : ''}
                        </div>
                    ` : filtered.length === 0 ? `
                        <div class="assignments-empty-state">
                            <div class="empty-icon">📂</div>
                            <h3>No assignments in this filter</h3>
                            <p>All current sprint assignments in this view have been completed or none match the filter (${this.activeAssignmentFilter.toUpperCase()}).</p>
                            <button class="assign-filter-btn" onclick="window.msotPlatform.filterAssignments('all')">View All Sprints</button>
                        </div>
                    ` : filtered.map(item => {
                        const isSolved = completedList.includes(item.id);
                        const diffClass = (item.difficulty || 'medium').toLowerCase();
                        const canDelete = (this.activeRole === 'ADMIN' || this.activeRole === 'FACULTY');
                        return `
                            <div class="assignment-card ${isSolved ? 'is-solved' : ''}">
                                <div class="ac-header">
                                    <div class="ac-week-pill">${item.weekNumber || 'WEEKEND SPRINT'}</div>
                                    <div class="ac-badges">
                                        <span class="diff-badge diff-${diffClass}">${item.difficulty || 'MEDIUM'}</span>
                                        <span class="xp-badge">+${item.xpReward || 50} XP</span>
                                    </div>
                                </div>

                                <h3 class="ac-title">${item.title}</h3>
                                <div class="ac-track">
                                    <span class="track-icon">🏷️</span> ${item.track || 'Algorithms'}
                                </div>

                                <p class="ac-excerpt">${this.stripMarkdownExcerpt(item.description)}</p>

                                <div class="ac-tags">
                                    ${(item.tags || []).map(t => `<span class="ac-tag">#${t}</span>`).join('')}
                                </div>

                                <div class="ac-footer">
                                    <div class="ac-status-box">
                                        ${isSolved ? `
                                            <span class="ac-solved-badge">
                                                <span class="check-icon">✓</span> SOLVED (+${item.xpReward} XP)
                                            </span>
                                        ` : `
                                            <span class="ac-due-note">⏰ Due ${item.dueDate || 'Sunday 23:59 PM'}</span>
                                        `}
                                    </div>
                                    <div class="ac-actions-cell" style="display:flex;align-items:center;gap:8px;">
                                        ${canDelete ? `
                                            <button class="ac-delete-btn" onclick="window.msotPlatform.deleteAssignment('${item.id}', event)" title="Delete assignment (Admin Facility)">
                                                🗑️
                                            </button>
                                        ` : ''}
                                        <button class="ac-launch-btn ${isSolved ? 'btn-solved' : 'btn-launch'}" 
                                                onclick="window.msotPlatform.openAssignmentArena('${item.id}')">
                                            ${isSolved ? '📝 VIEW / PRACTICE' : '⚡ LAUNCH COMPILER'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>


                `}
                <!-- 5. Educational Banner: How & Why Student XP Increases -->
                <div class="xp-explanation-card scroll-reveal">
                    <div class="xpe-header">
                        <div class="xpe-title-wrap">
                            <span class="xpe-tag">TRANSPARENT GAMIFIED REWARDS</span>
                            <h3 class="xpe-main-title">How & Why Your XP Increases in MSOT Learn</h3>
                            <p class="xpe-subtitle">Every single XP point represents verified, authentic educational effort. Points are never arbitrary.</p>
                        </div>
                        <button class="xpe-learn-more-btn" onclick="window.msotPlatform.openXPExplainedModal()">
                            📖 VIEW FULL XP DOSSIER ➔
                        </button>
                    </div>

                    <div class="xpe-grid">
                        <div class="xpe-col">
                            <div class="xpe-icon-row">
                                <span class="xpe-icon">🏫</span>
                                <span class="xpe-xp-tag">+20 XP Daily</span>
                            </div>
                            <h4 class="xpe-h4">Student Attendance</h4>
                            <p class="xpe-desc"><strong>Why:</strong> XP depends directly on student attendance. Mark attendance daily to earn verified points and build your streak.</p>
                            <span class="xpe-benefit">Attendance Drives XP & Streak</span>
                        </div>
                        <div class="xpe-col">
                            <div class="xpe-icon-row">
                                <span class="xpe-icon">🎯</span>
                                <span class="xpe-xp-tag">+10 XP / Question</span>
                            </div>
                            <h4 class="xpe-h4">Questions Solved</h4>
                            <p class="xpe-desc"><strong>Why:</strong> Number of questions solved increases XP by +10 XP for each problem solved in trials, arcade, and labs.</p>
                            <span class="xpe-benefit">+10 XP Every Question</span>
                        </div>
                        <div class="xpe-col">
                            <div class="xpe-icon-row">
                                <span class="xpe-icon">🧊</span>
                                <span class="xpe-xp-tag">2-Day Max Protection</span>
                            </div>
                            <h4 class="xpe-h4">Streak & 2-Day Freeze</h4>
                            <p class="xpe-desc"><strong>Why:</strong> Daily activeness builds your streak. Busy or out somewhere? Freeze your streak for up to 2 days; resets if away > 2 days.</p>
                            <span class="xpe-benefit">Protected Up To 2 Days</span>
                        </div>
                        <div class="xpe-col">
                            <div class="xpe-icon-row">
                                <span class="xpe-icon">💻</span>
                                <span class="xpe-xp-tag">+150 to +300 XP</span>
                            </div>
                            <h4 class="xpe-h4">Weekend Code Sprints</h4>
                            <p class="xpe-desc"><strong>Why:</strong> Pushed by instructor. Solution executes in online compiler passing 100% of unit test benchmarks.</p>
                            <span class="xpe-benefit">Direct Cohort Rank Surge</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modals Markup -->
            ${this.renderPushAssignmentModalHTML()}
            ${this.renderAssignmentArenaModalHTML()}
            ${this.renderXPExplainedModalHTML()}
            ${this.renderArenaVictoryModalHTML()}
        `;
    }

    stripMarkdownExcerpt(md) {
        if (!md) return '';
        const plain = md
            .replace(/###.*?\n/g, '')
            .replace(/####.*?\n/g, '')
            .replace(/\*\*.*?\*\*/g, '')
            .replace(/`.*?`/g, '')
            .replace(/\[.*?\]/g, '')
            .replace(/\n+/g, ' ')
            .trim();
        return plain.length > 120 ? plain.substring(0, 117) + '...' : plain;
    }

    filterAssignments(filter) {
        this.activeAssignmentFilter = filter;
        if (window.miraiAudio && window.miraiAudio.playClick) window.miraiAudio.playClick();
        this.renderAssignments();
    }

    renderPushAssignmentModalHTML() {
        return `
            <div class="assign-modal-overlay" id="pushAssignmentModal" style="display:none;" onclick="if(event.target===this) window.msotPlatform.closePushAssignmentModal()">
                <div class="assign-modal-card">
                    <div class="amc-header">
                        <div class="amc-title-box">
                            <span class="amc-sub">FACULTY & ADMIN DISPATCH</span>
                            <h3>Push Weekend Coding Assignment</h3>
                        </div>
                        <button class="amc-close-btn" onclick="window.msotPlatform.closePushAssignmentModal()">✕</button>
                    </div>

                    <form id="pushAssignmentForm" class="push-assign-form" onsubmit="window.msotPlatform.savePushedAssignment(event)">
                        <div class="form-row-2">
                            <div class="form-group">
                                <label class="auth-label" for="pAssignTitle">PROBLEM TITLE</label>
                                <input id="pAssignTitle" type="text" class="auth-input" placeholder="e.g. Weekend Sprint #4: Reverse Linked List" required>
                            </div>
                            <div class="form-group">
                                <label class="auth-label" for="pAssignWeek">WEEK NUMBER / TAG</label>
                                <input id="pAssignWeek" type="text" class="auth-input" placeholder="e.g. WEEK 4 WEEKEND" value="WEEK ${(window.msotState?.assignments?.length || 3) + 1} WEEKEND" required>
                            </div>
                        </div>

                        <div class="form-row-3">
                            <div class="form-group">
                                <label class="auth-label" for="pAssignDiff">DIFFICULTY</label>
                                <select id="pAssignDiff" class="auth-input">
                                    <option value="EASY">EASY (30-40 XP)</option>
                                    <option value="MEDIUM" selected>MEDIUM (50-70 XP)</option>
                                    <option value="HARD">HARD (80-120 XP)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="auth-label" for="pAssignTrack">SYLLABUS TRACK</label>
                                <input id="pAssignTrack" type="text" class="auth-input" placeholder="e.g. Dynamic Programming" value="Algorithms & Data Structures" required>
                            </div>
                            <div class="form-group">
                                <label class="auth-label" for="pAssignXP">XP BOUNTY</label>
                                <input id="pAssignXP" type="number" class="auth-input" min="10" max="300" value="50" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="auth-label" for="pAssignDesc">PROBLEM STATEMENT & CONSTRAINTS (MARKDOWN SUPPORTED)</label>
                            <textarea id="pAssignDesc" class="auth-input auth-textarea" rows="5" placeholder="Describe the problem, examples, and constraints..." required>### Problem Description
Given an array of integers nums and an integer k, find the maximum sum of any contiguous subarray of size k.

#### Example 1:
- **Input:** nums = [2, 1, 5, 1, 3, 2], k = 3
- **Output:** 9 (Subarray [5, 1, 3])

#### Constraints:
- 1 <= nums.length <= 10^5
- 1 <= k <= nums.length</textarea>
                        </div>

                        <div class="form-row-2">
                            <div class="form-group">
                                <label class="auth-label" for="pAssignTags">TAGS (COMMA SEPARATED)</label>
                                <input id="pAssignTags" type="text" class="auth-input" placeholder="Sliding Window, Array, Two Pointers" value="Array, Sliding Window">
                            </div>
                            <div class="form-group">
                                <label class="auth-label" for="pAssignDue">SUBMISSION DEADLINE</label>
                                <input id="pAssignDue" type="text" class="auth-input" value="Sunday 23:59 PM">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="auth-label" for="pAssignStarterJS">STARTER CODE (JAVASCRIPT)</label>
                            <textarea id="pAssignStarterJS" class="auth-input auth-code-area" rows="3">function maxSubArrayLen(nums, k) {
    // Write your code here
    return 0;
}</textarea>
                        </div>

                        <div class="form-group">
                            <label class="auth-label" for="pAssignStarterPy">STARTER CODE (PYTHON 3)</label>
                            <textarea id="pAssignStarterPy" class="auth-input auth-code-area" rows="3">def max_sub_array_len(nums, k):
    # Write your code here
    return 0</textarea>
                        </div>

                        <div class="amc-actions">
                            <button type="button" class="btn-cancel" onclick="window.msotPlatform.closePushAssignmentModal()">CANCEL</button>
                            <button type="submit" class="btn-publish-assign">🚀 PUBLISH TO ALL STUDENTS</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    openPushAssignmentModal() {
        const currentRole = (this.activeRole || window.msotState?.currentRole || window.msotAuth?.session?.role || 'STUDENT').toUpperCase();
        if (currentRole !== 'ADMIN' && currentRole !== 'FACULTY') {
            alert('⚠️ Permission Denied: Only Admins and Faculty can push assignments. As a student cadet, your facilities are focused on solving challenges in the compiler!');
            return;
        }
        const m = document.getElementById('pushAssignmentModal');
        if (m) m.style.display = 'flex';
        if (window.miraiAudio && window.miraiAudio.playClick) window.miraiAudio.playClick();
    }

    closePushAssignmentModal() {
        const m = document.getElementById('pushAssignmentModal');
        if (m) m.style.display = 'none';
    }

    savePushedAssignment(e) {
        if (e && e.preventDefault) e.preventDefault();
        const currentRole = (this.activeRole || window.msotState?.currentRole || window.msotAuth?.session?.role || 'STUDENT').toUpperCase();
        if (currentRole !== 'ADMIN' && currentRole !== 'FACULTY') {
            alert('⚠️ Permission Denied: Only Admins and Faculty can push assignments.');
            return;
        }

        const title = document.getElementById('pAssignTitle')?.value;
        const week = document.getElementById('pAssignWeek')?.value;
        const diff = document.getElementById('pAssignDiff')?.value;
        const track = document.getElementById('pAssignTrack')?.value;
        const xp = document.getElementById('pAssignXP')?.value;
        const desc = document.getElementById('pAssignDesc')?.value;
        const tags = document.getElementById('pAssignTags')?.value;
        const due = document.getElementById('pAssignDue')?.value;
        const starterJS = document.getElementById('pAssignStarterJS')?.value;
        const starterPy = document.getElementById('pAssignStarterPy')?.value;

        if (!title || !desc) {
            alert('Please provide a title and problem description.');
            return;
        }

        const newAssignment = window.msotState.pushAssignment({
            title: title,
            weekNumber: week,
            difficulty: diff,
            track: track,
            xpReward: Number(xp) || 50,
            description: desc,
            tags: tags,
            dueDate: due,
            starterCode: {
                javascript: starterJS || `function solution(nums) {\n    return 0;\n}`,
                python: starterPy || `def solution(nums):\n    return 0`,
                cpp: `#include <iostream>\n\nint main() {\n    std::cout << "0" << std::endl;\n    return 0;\n}`
            },
            testCases: [
                { id: 1, input: 'Sample Case 1', args: [[2, 1, 5, 1, 3, 2], 3], expected: '9' }
            ]
        });

        this.closePushAssignmentModal();
        this.renderAssignments();

        if (window.miraiAudio && window.miraiAudio.playLevelUp) window.miraiAudio.playLevelUp();
        alert(`✨ Weekend Assignment "${title}" published successfully! All cadets can now open the compiler & solve.`);
    }

    deleteAssignment(id, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        const currentRole = (this.activeRole || window.msotState?.currentRole || window.msotAuth?.session?.role || 'STUDENT').toUpperCase();
        if (currentRole !== 'ADMIN' && currentRole !== 'FACULTY') {
            alert('⚠️ Permission Denied: Only Admins and Faculty can delete assignments.');
            return;
        }
        if (confirm('Are you sure you want to delete this weekend assignment sprint?')) {
            window.msotState.deleteAssignment(id);
            this.renderAssignments();
            if (window.miraiAudio && window.miraiAudio.playClick) window.miraiAudio.playClick();
            alert('Assignment removed successfully.');
        }
    }

    renderAssignmentArenaModalHTML() {
        return `
            <div class="arena-modal-overlay" id="assignmentArenaModal" style="display:none;">
                <div class="arena-studio-card">
                    <!-- Top Navigation Bar -->
                    <div class="arena-nav-bar">
                        <div class="arena-brand-group">
                            <button class="arena-back-btn" onclick="window.msotPlatform.closeAssignmentArena()" title="Return to Weekend Hub">
                                ➔ RETURN TO HUB
                            </button>
                            <div class="arena-title-wrap">
                                <span class="arena-track-tag" id="arenaTrackTag">ALGORITHMS</span>
                                <h3 class="arena-prob-title" id="arenaProbTitle">Weekend Sprint #1: Two Sum Target</h3>
                            </div>
                        </div>

                        <div class="arena-hud-center">
                            <span class="arena-diff-pill" id="arenaDiffPill">EASY</span>
                            <span class="arena-xp-pill" id="arenaXPPill">+40 XP</span>
                            <span class="arena-status-pill" id="arenaStatusPill">PENDING</span>
                        </div>

                        <div class="arena-controls-right">
                            <div class="lang-selector-box">
                                <label for="arenaLanguageSelect" class="lang-label">LANGUAGE:</label>
                                <select id="arenaLanguageSelect" class="arena-select" onchange="window.msotPlatform.switchArenaLanguage(this.value)">
                                    <option value="javascript">JavaScript (Node/ES6)</option>
                                    <option value="python">Python 3</option>
                                    <option value="cpp">C++ (g++ 17)</option>
                                </select>
                            </div>
                            <button class="arena-reset-btn" onclick="window.msotPlatform.resetArenaCode()" title="Reset code to original starter template">
                                ↺ RESET CODE
                            </button>
                            <button class="arena-close-btn" onclick="window.msotPlatform.closeAssignmentArena()">✕</button>
                        </div>
                    </div>

                    <!-- Split Studio Work Area -->
                    <div class="arena-body-split">
                        <!-- Left Pane: Problem Dossier -->
                        <div class="arena-pane-left">
                            <div class="arena-pane-header">
                                <div class="pane-tab-btn active">PROBLEM SPECIFICATION</div>
                            </div>
                            <div class="arena-problem-content" id="arenaProblemContent">
                                <!-- Dynamically populated by renderMarkdownProblem -->
                            </div>
                        </div>

                        <!-- Right Pane: Code Editor & Compiler Console -->
                        <div class="arena-pane-right">
                            <!-- Code Editor Section -->
                            <div class="arena-editor-wrap">
                                <div class="editor-header-bar">
                                    <div class="eh-left">
                                        <span class="eh-lang-icon" id="ehLangIcon">⚡</span>
                                        <span class="eh-file-name" id="ehFileName">solution.js</span>
                                        <span class="eh-badge">AUTO-INDENT & TAB KEY ENABLED</span>
                                    </div>
                                    <div class="eh-right">
                                        <span class="eh-shortcut-hint">Shortcuts: Ctrl+Enter (Run)</span>
                                    </div>
                                </div>

                                <div class="editor-workspace">
                                    <div class="editor-line-numbers" id="arenaLineNumbers">1</div>
                                    <textarea id="arenaCodeEditor" class="arena-code-textarea" 
                                              spellcheck="false" 
                                              oninput="window.msotPlatform.updateEditorLineNumbers()" 
                                              onkeydown="window.msotPlatform.handleEditorKeyDown(event)"></textarea>
                                </div>
                            </div>

                            <!-- Bottom Console & Compiler Execution Panel -->
                            <div class="arena-console-wrap">
                                <div class="console-nav-bar">
                                    <div class="console-tabs">
                                        <button class="console-tab-btn ${this.arenaActiveTab === 'terminal' ? 'active' : ''}" 
                                                id="tabBtnTerminal" 
                                                onclick="window.msotPlatform.switchArenaTab('terminal')">
                                            🖥️ TERMINAL OUTPUT
                                        </button>
                                        <button class="console-tab-btn ${this.arenaActiveTab === 'testcases' ? 'active' : ''}" 
                                                id="tabBtnTestCases" 
                                                onclick="window.msotPlatform.switchArenaTab('testcases')">
                                            🧪 TEST CASES (<span id="testCasesCountBadge">0</span>)
                                        </button>
                                        <button class="console-tab-btn ${this.arenaActiveTab === 'stdin' ? 'active' : ''}" 
                                                id="tabBtnStdin" 
                                                onclick="window.msotPlatform.switchArenaTab('stdin')">
                                            ⌨️ CUSTOM INPUT (STDIN)
                                        </button>
                                    </div>

                                    <div class="console-action-buttons">
                                        <button class="btn-run-code" onclick="window.msotPlatform.runArenaCode()" title="Run against test case 1 or custom input">
                                            ▶ RUN CODE
                                        </button>
                                        <button class="btn-test-all" onclick="window.msotPlatform.testAllArenaCases()" title="Run all test benches">
                                            🧪 TEST ALL CASES
                                        </button>
                                        <button class="btn-submit-solution" onclick="window.msotPlatform.submitArenaSolution()" title="Submit to verify and award XP">
                                            🚀 SUBMIT SOLUTION
                                        </button>
                                    </div>
                                </div>

                                <!-- Tab 1: Terminal Output (STDOUT) -->
                                <div class="console-pane-body" id="consoleTerminalPane" style="${this.arenaActiveTab === 'terminal' ? 'display:block;' : 'display:none;'}">
                                    <div class="terminal-box" id="arenaTerminalOutput">
                                        <div class="term-line term-intro">Mirai In-Browser Execution Engine v2.4 initialized.</div>
                                        <div class="term-line term-prompt">> Ready to compile. Press "Run Code" or "Test All Cases".</div>
                                    </div>
                                </div>

                                <!-- Tab 2: Test Cases Results -->
                                <div class="console-pane-body" id="consoleTestCasesPane" style="${this.arenaActiveTab === 'testcases' ? 'display:block;' : 'display:none;'}">
                                    <div class="testcases-list" id="arenaTestCasesList">
                                        <!-- Test case result items rendered here -->
                                    </div>
                                </div>

                                <!-- Tab 3: Custom STDIN -->
                                <div class="console-pane-body" id="consoleStdinPane" style="${this.arenaActiveTab === 'stdin' ? 'display:block;' : 'display:none;'}">
                                    <div class="stdin-box">
                                        <label class="stdin-label" for="arenaCustomInput">CUSTOM STDIN (Pass arguments or standard input lines):</label>
                                        <textarea id="arenaCustomInput" class="stdin-textarea" placeholder="e.g. nums = [2, 7, 11, 15], target = 9"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    openAssignmentArena(assignmentId) {
        const assignment = (window.msotState?.assignments || []).find(a => a.id === assignmentId);
        if (!assignment) return;

        this.currentArenaAssignment = assignment;
        this.currentArenaLanguage = 'javascript';
        this.arenaActiveTab = 'terminal';

        const modal = document.getElementById('assignmentArenaModal');
        if (modal) modal.style.display = 'flex';

        // Update Nav & Problem Header
        const titleEl = document.getElementById('arenaProbTitle');
        const trackEl = document.getElementById('arenaTrackTag');
        const diffEl = document.getElementById('arenaDiffPill');
        const xpEl = document.getElementById('arenaXPPill');
        const statusEl = document.getElementById('arenaStatusPill');
        const contentEl = document.getElementById('arenaProblemContent');
        const langSelect = document.getElementById('arenaLanguageSelect');

        if (titleEl) titleEl.textContent = assignment.title;
        if (trackEl) trackEl.textContent = assignment.track || 'ALGORITHMS';
        if (diffEl) {
            diffEl.textContent = assignment.difficulty || 'MEDIUM';
            diffEl.className = `arena-diff-pill diff-${(assignment.difficulty || 'medium').toLowerCase()}`;
        }
        if (xpEl) xpEl.textContent = `+${assignment.xpReward || 50} XP`;

        const isSolved = (window.msotState?.student?.completedAssignments || []).includes(assignment.id);
        if (statusEl) {
            statusEl.textContent = isSolved ? '✅ SOLVED' : '⏳ PENDING';
            statusEl.className = isSolved ? 'arena-status-pill solved' : 'arena-status-pill pending';
        }

        if (langSelect) langSelect.value = 'javascript';
        if (contentEl) contentEl.innerHTML = this.renderMarkdownProblem(assignment.description);

        // Populate starter code
        this.loadStarterCodeForLanguage('javascript');

        // Render test cases count badge
        const badge = document.getElementById('testCasesCountBadge');
        if (badge) badge.textContent = (assignment.testCases || []).length;

        // Reset console terminal
        const term = document.getElementById('arenaTerminalOutput');
        if (term) {
            term.innerHTML = `
                <div class="term-line term-intro">Mirai In-Browser Execution Engine v2.4 initialized.</div>
                <div class="term-line term-meta">Target: ${assignment.title} • Bounty: +${assignment.xpReward} XP</div>
                <div class="term-line term-prompt">> Ready to compile. Press "▶ Run Code" or "🧪 Test All Cases".</div>
            `;
        }

        // Render public test case specs into testcases pane
        this.renderInitialTestCases(assignment);

        if (window.miraiAudio && window.miraiAudio.playClick) window.miraiAudio.playClick();
    }

    closeAssignmentArena() {
        const modal = document.getElementById('assignmentArenaModal');
        if (modal) modal.style.display = 'none';
        this.currentArenaAssignment = null;
    }

    switchArenaLanguage(lang) {
        this.currentArenaLanguage = lang;
        this.loadStarterCodeForLanguage(lang);
        if (window.miraiAudio && window.miraiAudio.playClick) window.miraiAudio.playClick();
    }

    loadStarterCodeForLanguage(lang) {
        if (!this.currentArenaAssignment) return;
        const editor = document.getElementById('arenaCodeEditor');
        const fileIcon = document.getElementById('ehLangIcon');
        const fileName = document.getElementById('ehFileName');

        const starter = this.currentArenaAssignment.starterCode?.[lang] || `// Write your ${lang} code here`;
        if (editor) {
            editor.value = starter;
            this.updateEditorLineNumbers();
        }

        if (lang === 'javascript') {
            if (fileIcon) fileIcon.textContent = '⚡';
            if (fileName) fileName.textContent = 'solution.js';
        } else if (lang === 'python') {
            if (fileIcon) fileIcon.textContent = '🐍';
            if (fileName) fileName.textContent = 'solution.py';
        } else if (lang === 'cpp') {
            if (fileIcon) fileIcon.textContent = '⚙️';
            if (fileName) fileName.textContent = 'solution.cpp';
        }
    }

    resetArenaCode() {
        if (!this.currentArenaAssignment) return;
        if (confirm('Reset code to original starter template? Any unsaved edits will be lost.')) {
            this.loadStarterCodeForLanguage(this.currentArenaLanguage);
        }
    }

    switchArenaTab(tab) {
        this.arenaActiveTab = tab;
        const termPane = document.getElementById('consoleTerminalPane');
        const tcPane = document.getElementById('consoleTestCasesPane');
        const stdinPane = document.getElementById('consoleStdinPane');
        const btnTerm = document.getElementById('tabBtnTerminal');
        const btnTc = document.getElementById('tabBtnTestCases');
        const btnStdin = document.getElementById('tabBtnStdin');

        if (termPane) termPane.style.display = tab === 'terminal' ? 'block' : 'none';
        if (tcPane) tcPane.style.display = tab === 'testcases' ? 'block' : 'none';
        if (stdinPane) stdinPane.style.display = tab === 'stdin' ? 'block' : 'none';

        if (btnTerm) btnTerm.classList.toggle('active', tab === 'terminal');
        if (btnTc) btnTc.classList.toggle('active', tab === 'testcases');
        if (btnStdin) btnStdin.classList.toggle('active', tab === 'stdin');
    }

    updateEditorLineNumbers() {
        const editor = document.getElementById('arenaCodeEditor');
        const gutter = document.getElementById('arenaLineNumbers');
        if (!editor || !gutter) return;

        const lines = editor.value.split('\n').length;
        let lineNumbersHTML = '';
        for (let i = 1; i <= lines; i++) {
            lineNumbersHTML += `<div>${i}</div>`;
        }
        gutter.innerHTML = lineNumbersHTML;
    }

    handleEditorKeyDown(e) {
        const editor = e.target;
        // Tab key support
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + 4;
            this.updateEditorLineNumbers();
        }
        // Ctrl+Enter or Cmd+Enter to run code
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            this.runArenaCode();
        }
    }

    renderMarkdownProblem(text) {
        if (!text) return '';
        let html = text
            .replace(/### (.*?)\n/g, '<h3 class="prob-h3">$1</h3>')
            .replace(/#### (.*?)\n/g, '<h4 class="prob-h4">$1</h4>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.*?)`/g, '<code class="prob-inline-code">$1</code>')
            .replace(/- \*\*(.*?)\*\*: (.*?)\n/g, '<li class="prob-li"><strong>$1</strong>: $2</li>')
            .replace(/- (.*?)\n/g, '<li class="prob-li">$1</li>')
            .replace(/\n\n/g, '<p class="prob-p"></p>')
            .replace(/\n/g, '<br>');
        return html;
    }

    renderInitialTestCases(assignment) {
        const list = document.getElementById('arenaTestCasesList');
        if (!list) return;

        const testCases = assignment.testCases || [];
        list.innerHTML = testCases.map((tc, idx) => `
            <div class="testcase-item" id="tcItem-${idx}">
                <div class="tc-item-header">
                    <span class="tc-num">Test Case ${idx + 1}</span>
                    <span class="tc-status-pill status-ready">READY</span>
                </div>
                <div class="tc-details">
                    <div class="tc-row">
                        <span class="tc-label">Input:</span>
                        <code class="tc-code">${tc.input || JSON.stringify(tc.args)}</code>
                    </div>
                    <div class="tc-row">
                        <span class="tc-label">Expected:</span>
                        <code class="tc-code">${tc.expected}</code>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // =========================================================================
    // COMPILER & EXECUTION ENGINE RUNNERS
    // =========================================================================
    runArenaCode() {
        if (!this.currentArenaAssignment) return;
        const code = document.getElementById('arenaCodeEditor')?.value || '';
        const lang = this.currentArenaLanguage;
        const customStdin = document.getElementById('arenaCustomInput')?.value;
        const assignment = this.currentArenaAssignment;
        const firstCase = (assignment.testCases && assignment.testCases[0]) || { args: [], expected: '' };

        this.switchArenaTab('terminal');
        const term = document.getElementById('arenaTerminalOutput');

        if (term) {
            term.innerHTML = `
                <div class="term-line term-intro">> Compiling ${lang.toUpperCase()} source...</div>
            `;
        }

        setTimeout(() => {
            const execRes = this.executeCompiler(code, lang, assignment, firstCase.args, customStdin);

            if (term) {
                if (execRes.success) {
                    term.innerHTML = `
                        <div class="term-line term-meta">⚡ Execution Status: SUCCESS (0 errors, 0 warnings)</div>
                        <div class="term-line term-meta">⏱️ Runtime: ${execRes.executionTimeMs} ms • Memory: 4.8 MB</div>
                        <div class="term-divider">────────────────────────────────────────</div>
                        <div class="term-line term-header">> Program Output (STDOUT):</div>
                        <div class="term-output-block">${this.escapeHTML(execRes.output || 'No output to STDOUT.')}</div>
                        <div class="term-divider">────────────────────────────────────────</div>
                        <div class="term-line term-ret">> Returned Value: <b>${this.escapeHTML(JSON.stringify(execRes.result))}</b></div>
                        <div class="term-line term-success">✔ Process completed with exit code 0.</div>
                    `;
                } else {
                    term.innerHTML = `
                        <div class="term-line term-error">❌ Execution Status: FAILED (Exit code 1)</div>
                        <div class="term-line term-meta">⏱️ Time Elapsed: ${execRes.executionTimeMs} ms</div>
                        <div class="term-divider">────────────────────────────────────────</div>
                        <div class="term-line term-header">> Diagnostics & Traceback:</div>
                        <div class="term-error-block">${this.escapeHTML(execRes.output || execRes.error)}</div>
                    `;
                }
            }

            if (window.miraiAudio && window.miraiAudio.playClick) window.miraiAudio.playClick();
        }, 120);
    }

    testAllArenaCases() {
        if (!this.currentArenaAssignment) return;
        const code = document.getElementById('arenaCodeEditor')?.value || '';
        const lang = this.currentArenaLanguage;
        const assignment = this.currentArenaAssignment;
        const testCases = assignment.testCases || [];

        this.switchArenaTab('testcases');
        const list = document.getElementById('arenaTestCasesList');

        let passedCount = 0;
        let resultsHTML = '';

        testCases.forEach((tc, idx) => {
            const execRes = this.executeCompiler(code, lang, assignment, tc.args, null);
            const isMatch = execRes.success && this.areResultsEqual(execRes.result, tc.expected);
            if (isMatch) passedCount++;

            resultsHTML += `
                <div class="testcase-item ${isMatch ? 'item-pass' : 'item-fail'}">
                    <div class="tc-item-header">
                        <span class="tc-num">Test Case ${idx + 1}</span>
                        <span class="tc-status-pill ${isMatch ? 'status-pass' : 'status-fail'}">
                            ${isMatch ? '✔ PASS' : '✖ FAIL'} (${execRes.executionTimeMs}ms)
                        </span>
                    </div>
                    <div class="tc-details">
                        <div class="tc-row">
                            <span class="tc-label">Input:</span>
                            <code class="tc-code">${tc.input || JSON.stringify(tc.args)}</code>
                        </div>
                        <div class="tc-row">
                            <span class="tc-label">Expected:</span>
                            <code class="tc-code">${tc.expected}</code>
                        </div>
                        <div class="tc-row">
                            <span class="tc-label">Your Output:</span>
                            <code class="tc-code ${isMatch ? 'out-match' : 'out-mismatch'}">${execRes.success ? JSON.stringify(execRes.result) : '[Error] ' + execRes.error}</code>
                        </div>
                    </div>
                </div>
            `;
        });

        if (list) {
            list.innerHTML = `
                <div class="testcases-summary-bar ${passedCount === testCases.length ? 'all-pass' : 'some-fail'}">
                    <span>${passedCount === testCases.length ? '🎉 ALL TEST BENCHES PASSED' : '⚠️ TEST CASES SUMMARY'}</span>
                    <strong>${passedCount} / ${testCases.length} Passed</strong>
                </div>
                ${resultsHTML}
            `;
        }

        if (window.miraiAudio) {
            if (passedCount === testCases.length && window.miraiAudio.playSuccess) {
                window.miraiAudio.playSuccess();
            } else if (window.miraiAudio.playClick) {
                window.miraiAudio.playClick();
            }
        }
    }

    submitArenaSolution() {
        if (!this.currentArenaAssignment) return;
        const code = document.getElementById('arenaCodeEditor')?.value || '';
        const lang = this.currentArenaLanguage;
        const assignment = this.currentArenaAssignment;
        const testCases = assignment.testCases || [];

        let passedCount = 0;
        testCases.forEach(tc => {
            const execRes = this.executeCompiler(code, lang, assignment, tc.args, null);
            if (execRes.success && this.areResultsEqual(execRes.result, tc.expected)) {
                passedCount++;
            }
        });

        if (passedCount === testCases.length) {
            // All test cases passed! Submit solution to state & record XP
            const submitRes = window.msotState.submitAssignment(assignment.id, code, lang, passedCount, testCases.length);

            // Re-render assignments hub & header stats
            this.updateHeaderStats();
            this.renderAssignments();

            // Update status pill inside arena
            const statusEl = document.getElementById('arenaStatusPill');
            if (statusEl) {
                statusEl.textContent = '✅ SOLVED';
                statusEl.className = 'arena-status-pill solved';
            }

            // Switch to testcases tab showing full green
            this.testAllArenaCases();

            if (window.miraiAudio && window.miraiAudio.playLevelUp) window.miraiAudio.playLevelUp();

            // Display rich victory & XP breakdown modal!
            this.showArenaVictoryXPModal(submitRes, assignment, lang, passedCount, testCases.length);
        } else {
            this.testAllArenaCases();
            alert(`⚠️ Submission Rejected: Solution passed ${passedCount} of ${testCases.length} test cases.\n\nPlease inspect the failing test cases in the Test Cases tab to adjust your logic.`);
        }
    }

    // Smart Multi-Language In-Browser Compiler & Sandboxed Runner
    executeCompiler(code, lang, assignment, args, customStdin) {
        const startTime = performance.now();
        const logs = [];
        const customConsole = {
            log: (...a) => logs.push(a.map(x => (typeof x === 'object' && x !== null) ? JSON.stringify(x) : String(x)).join(' ')),
            error: (...a) => logs.push('[ERROR] ' + a.join(' ')),
            warn: (...a) => logs.push('[WARN] ' + a.join(' '))
        };

        const fnName = this.extractFunctionName(assignment, code, lang);

        try {
            let executableJS = code;
            if (lang === 'python') {
                executableJS = this.transpilePythonToJS(code, fnName);
            } else if (lang === 'cpp') {
                executableJS = this.transpileCppToJS(code, fnName);
            }

            const wrappedCode = `
                ${executableJS}
                ;
                if (typeof ${fnName} === 'function') return ${fnName};
                return null;
            `;

            const fnFactory = new Function('console', 'stdin', wrappedCode);
            const userFn = fnFactory(customConsole, customStdin);

            let result = undefined;
            if (typeof userFn === 'function') {
                result = userFn(...(args || []));
            } else {
                // Top-level runner
                const scriptRunner = new Function('console', 'stdin', executableJS);
                result = scriptRunner(customConsole, customStdin);
            }

            const execTime = Math.max(1, Math.round(performance.now() - startTime));
            return {
                success: true,
                result: result,
                output: logs.join('\n') || (result !== undefined ? String(result) : ''),
                executionTimeMs: execTime
            };
        } catch (err) {
            const execTime = Math.max(1, Math.round(performance.now() - startTime));
            return {
                success: false,
                error: err.message,
                output: (lang === 'python') 
                    ? `Traceback (most recent call last):\n  File "solution.py", line 1\n${err.message}` 
                    : (lang === 'cpp') 
                        ? `solution.cpp: error: ${err.message}\ng++ compilation failed.`
                        : `Runtime Error: ${err.message}`,
                executionTimeMs: execTime
            };
        }
    }

    extractFunctionName(assignment, code, lang) {
        if (assignment.id === 'assign-w1') return (lang === 'python') ? 'two_sum' : 'twoSum';
        if (assignment.id === 'assign-w2') return (lang === 'python') ? 'max_sub_array' : 'maxSubArray';
        if (assignment.id === 'assign-w3') return (lang === 'python') ? 'is_valid' : 'isValid';

        // Extract candidate from code
        const pyMatch = code.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
        if (pyMatch) return pyMatch[1];

        const jsMatch = code.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);
        if (jsMatch) return jsMatch[1];

        return 'solution';
    }

    transpilePythonToJS(code, fnName) {
        const lines = code.split('\n');
        const jsLines = [];
        const indentStack = [0];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            const currentIndent = line.search(/\S/);

            while (indentStack.length > 1 && currentIndent <= indentStack[indentStack.length - 1] && currentIndent !== -1) {
                if (currentIndent === indentStack[indentStack.length - 1] && !trimmed.startsWith('elif') && !trimmed.startsWith('else:')) {
                    break;
                }
                indentStack.pop();
                jsLines.push(' '.repeat(indentStack[indentStack.length - 1] || 0) + '}');
            }

            let converted = trimmed;
            converted = converted.replace(/#.*$/, '');
            converted = converted.replace(/\bTrue\b/g, 'true');
            converted = converted.replace(/\bFalse\b/g, 'false');
            converted = converted.replace(/\bNone\b/g, 'null');
            converted = converted.replace(/\band\b/g, '&&');
            converted = converted.replace(/\bor\b/g, '||');
            converted = converted.replace(/\bnot\s+/g, '!');
            converted = converted.replace(/\blen\((.*?)\)/g, '($1.length)');
            converted = converted.replace(/\bprint\((.*?)\)/g, 'console.log($1)');
            converted = converted.replace(/\.append\((.*?)\)/g, '.push($1)');

            if (converted.startsWith('def ')) {
                const match = converted.match(/^def\s+([a-zA-Z0-9_]+)\s*\((.*?)\):/);
                if (match) {
                    converted = `function ${match[1]}(${match[2]}) {`;
                    indentStack.push(currentIndent);
                }
            } else if (converted.startsWith('elif ')) {
                const match = converted.match(/^elif\s+(.*?):/);
                if (match) {
                    converted = `else if (${match[1]}) {`;
                    indentStack.push(currentIndent);
                }
            } else if (converted.startsWith('if ')) {
                const match = converted.match(/^if\s+(.*?):/);
                if (match) {
                    converted = `if (${match[1]}) {`;
                    indentStack.push(currentIndent);
                }
            } else if (converted.startsWith('else:')) {
                converted = 'else {';
                indentStack.push(currentIndent);
            } else if (converted.startsWith('for ')) {
                const enumMatch = converted.match(/^for\s+([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s+in\s+enumerate\((.*?)\):/);
                const forInMatch = converted.match(/^for\s+([a-zA-Z0-9_]+)\s+in\s+(.*?):/);
                if (enumMatch) {
                    converted = `for (let [${enumMatch[1]}, ${enumMatch[2]}] of ${enumMatch[3]}.entries()) {`;
                    indentStack.push(currentIndent);
                } else if (forInMatch) {
                    converted = `for (let ${forInMatch[1]} of ${forInMatch[2]}) {`;
                    indentStack.push(currentIndent);
                }
            } else if (converted.startsWith('while ')) {
                const match = converted.match(/^while\s+(.*?):/);
                if (match) {
                    converted = `while (${match[1]}) {`;
                    indentStack.push(currentIndent);
                }
            } else if (!converted.endsWith('{') && !converted.endsWith('}') && !converted.endsWith(';')) {
                if (/^[a-zA-Z0-9_]+\s*=/.test(converted) && !converted.startsWith('return ')) {
                    converted = 'let ' + converted + ';';
                } else {
                    converted = converted + ';';
                }
            }

            jsLines.push(' '.repeat(Math.max(0, currentIndent)) + converted);
        }

        while (indentStack.length > 1) {
            indentStack.pop();
            jsLines.push('}');
        }

        return jsLines.join('\n');
    }

    transpileCppToJS(code, fnName) {
        let js = code;
        js = js.replace(/#include\s*<.*?>/g, '');
        js = js.replace(/using\s+namespace\s+std\s*;/g, '');
        js = js.replace(/std::vector\s*<.*?>/g, 'let');
        js = js.replace(/vector\s*<.*?>/g, 'let');
        js = js.replace(/std::unordered_map\s*<.*?>\s+([a-zA-Z0-9_]+)\s*;/g, 'const $1 = new Map();');
        js = js.replace(/unordered_map\s*<.*?>\s+([a-zA-Z0-9_]+)\s*;/g, 'const $1 = new Map();');
        js = js.replace(/std::stack\s*<.*?>\s+([a-zA-Z0-9_]+)\s*;/g, 'const $1 = [];');
        js = js.replace(/stack\s*<.*?>\s+([a-zA-Z0-9_]+)\s*;/g, 'const $1 = [];');
        js = js.replace(/const\s+std::string\s*&\s*/g, '');
        js = js.replace(/const\s+string\s*&\s*/g, '');
        js = js.replace(/const\s+vector\s*<.*?>\s*&\s*/g, '');
        js = js.replace(/const\s+std::vector\s*<.*?>\s*&\s*/g, '');
        js = js.replace(/\bint\b|\bbool\b|\bchar\b|\bstring\b|\bsize_t\b/g, 'let');
        js = js.replace(/\b([a-zA-Z0-9_]+)\.count\((.*?)\)/g, '$1.has($2)');
        js = js.replace(/\b([a-zA-Z0-9_]+)\.empty\(\)/g, '($1.length === 0)');
        js = js.replace(/\b([a-zA-Z0-9_]+)\.top\(\)/g, '$1[$1.length - 1]');
        js = js.replace(/\bstd::max\b|\bmax\b/g, 'Math.max');
        js = js.replace(/\bstd::min\b|\bmin\b/g, 'Math.min');
        js = js.replace(/std::cout\s*<<\s*(.*?)\s*<<\s*std::endl\s*;/g, 'console.log($1);');
        js = js.replace(/cout\s*<<\s*(.*?)\s*<<\s*endl\s*;/g, 'console.log($1);');
        js = js.replace(/([a-zA-Z0-9_]+)\[(.*?)\]\s*=\s*(.*?);/g, (m, map, key, val) => {
            return `if (${map} instanceof Map) ${map}.set(${key}, ${val}); else ${map}[${key}] = ${val};`;
        });
        js = js.replace(/([a-zA-Z0-9_]+)\[(.*?)\]/g, (m, map, key) => {
            return `(${map} instanceof Map ? ${map}.get(${key}) : ${map}[${key}])`;
        });
        js = js.replace(/let\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*\{/g, 'function $1($2) {');
        js = js.replace(/let\s+main\s*\(\)\s*\{/, 'function main() {');
        return js;
    }

    areResultsEqual(actual, expected) {
        if (actual === undefined && expected === undefined) return true;
        const normActual = this.normalizeOutput(actual).replace(/\s+/g, '');
        const normExpected = this.normalizeOutput(expected).replace(/\s+/g, '');
        if (normActual === normExpected) return true;

        try {
            const parsedActual = JSON.parse(normActual);
            const parsedExpected = JSON.parse(normExpected);
            if (JSON.stringify(parsedActual) === JSON.stringify(parsedExpected)) return true;
        } catch (e) {}

        if (String(actual).toLowerCase() === String(expected).toLowerCase()) return true;
        if (Number(actual) === Number(expected)) return true;
        return false;
    }

    normalizeOutput(val) {
        if (val === undefined || val === null) return '';
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val).trim();
    }

    // =========================================================================
    // 12. "HOW & WHY XP INCREASES" TRANSPARENCY & TOAST NOTIFICATION ENGINE
    // =========================================================================
    showXPGainToast(xpAmount, reason, actionKey, tx) {
        let container = document.getElementById('xpToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'xpToastContainer';
            container.className = 'xp-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'xp-toast-card animate-toast-pop';
        toast.innerHTML = `
            <div class="xpt-badge-col">
                <span class="xpt-sparkle">⚡</span>
                <span class="xpt-amount">+${xpAmount} XP</span>
            </div>
            <div class="xpt-body-col">
                <div class="xpt-top-row">
                    <span class="xpt-tag">${actionKey || 'ACADEMIC REWARD'}</span>
                    <span class="xpt-time">Just Now</span>
                </div>
                <div class="xpt-reason">${this.escapeHTML(reason || 'Verified educational activity completed')}</div>
                <div class="xpt-explain-hint">
                    <span class="hint-bullet">💡</span> Why: Points added to Lifetime Balance & Weekly Cadet Standings
                </div>
            </div>
            <button class="xpt-dismiss-btn" onclick="this.closest('.xp-toast-card').remove()">✕</button>
        `;

        container.appendChild(toast);

        if (window.miraiAudio && window.miraiAudio.playSuccess) {
            try { window.miraiAudio.playSuccess(); } catch (e) {}
        }

        // Auto remove after 4.5 seconds
        setTimeout(() => {
            if (toast && toast.parentElement) {
                toast.classList.add('animate-toast-fade');
                setTimeout(() => toast.remove(), 400);
            }
        }, 4500);

        this.updateHeaderStats();
    }

    openXPExplainedModal() {
        let modal = document.getElementById('xpExplainedModal');
        if (!modal) {
            const wrap = document.createElement('div');
            wrap.innerHTML = this.renderXPExplainedModalHTML();
            document.body.appendChild(wrap.firstElementChild);
            modal = document.getElementById('xpExplainedModal');
        }
        if (modal) {
            modal.style.display = 'flex';
            this.updateXPExplainedLiveStats();
        }
        if (window.miraiAudio && window.miraiAudio.playClick) window.miraiAudio.playClick();
    }

    closeXPExplainedModal() {
        const modal = document.getElementById('xpExplainedModal');
        if (modal) modal.style.display = 'none';
    }

    markDailyAttendance() {
        const res = window.msotState.markDailyAttendance();
        this.updateHeaderStats();
        this.updateXPExplainedLiveStats();
        if (res.message) {
            this.showXPGainToast(res.awarded || 0, res.message, 'ATTEND_CLASS');
        }
        if (window.miraiAudio) {
            if (res.success) window.miraiAudio.playSuccess?.();
            else window.miraiAudio.playClick?.();
        }
    }

    toggleStreakFreeze() {
        const res = window.msotState.toggleStreakFreeze();
        this.updateHeaderStats();
        this.updateXPExplainedLiveStats();
        if (res.message) {
            this.showXPGainToast(0, res.message, 'STREAK_FREEZE');
        }
        if (window.miraiAudio && window.miraiAudio.playClick) window.miraiAudio.playClick();
    }

    updateXPExplainedLiveStats() {
        const student = window.msotState?.student || {};
        const lifetimeEl = document.getElementById('xpeLiveLifetime');
        const weeklyEl = document.getElementById('xpeLiveWeekly');
        const levelEl = document.getElementById('xpeLiveLevel');
        const qEl = document.getElementById('xpeLiveQuestions');
        const streakEl = document.getElementById('xpeLiveStreak');
        const recentList = document.getElementById('xpeLiveRecentTransactions');

        if (lifetimeEl) lifetimeEl.textContent = `${(student.lifetimeXP || 0).toLocaleString()} XP`;
        if (weeklyEl) weeklyEl.textContent = `${(student.weeklyXP || 0).toLocaleString()} XP`;
        if (levelEl) levelEl.textContent = `Level ${(window.calculateLevelData ? window.calculateLevelData(student.lifetimeXP).level : 12)}`;
        if (qEl) qEl.textContent = `${student.questionsSolved || 0} Solved`;
        if (streakEl) {
            if (student.isStreakFrozen) {
                streakEl.textContent = `${student.streak || 1}d 🧊 FROZEN`;
            } else {
                streakEl.textContent = `${student.streak || 1} Days 🔥`;
            }
        }

        // 1. Live Attendance Check-In Widget
        const attWrap = document.getElementById('xpeAttendanceActionWrap');
        if (attWrap) {
            const todayStr = new Date().toISOString().split('T')[0];
            const isAttended = Array.isArray(student.attendanceHistory) && student.attendanceHistory.includes(todayStr);
            if (isAttended) {
                attWrap.innerHTML = `
                    <div class="xpe-att-checked-badge">
                        <span class="att-check-icon">✓</span>
                        <span>Today's Attendance Officially Verified (+20 XP Earned)</span>
                    </div>
                `;
            } else {
                attWrap.innerHTML = `
                    <button type="button" class="xpe-deck-btn attend-btn" onclick="window.msotPlatform.markDailyAttendance()">
                        🏫 CHECK IN TODAY'S ATTENDANCE (+20 XP)
                    </button>
                `;
            }
        }

        // 2. Live Questions Solved Counter & XP Math
        const qBadge = document.getElementById('xpeQuestionsBadge');
        if (qBadge) {
            const qCount = student.questionsSolved || 0;
            const qXP = qCount * 10;
            qBadge.innerHTML = `<strong>${qCount} Questions Solved</strong> • Earned: <span class="xpe-highlight-green">+${qXP.toLocaleString()} XP</span> (+10 XP per question)`;
        }

        // 3. Live Streak Freeze Control Widget
        const freezeWrap = document.getElementById('xpeFreezeActionWrap');
        const freezeIcon = document.getElementById('xpeFreezeIcon');
        if (freezeWrap) {
            if (student.isStreakFrozen) {
                if (freezeIcon) freezeIcon.textContent = '🧊';
                freezeWrap.innerHTML = `
                    <button type="button" class="xpe-deck-btn unfreeze-btn" onclick="window.msotPlatform.toggleStreakFreeze()">
                        🔥 RESUME ACTIVE STREAK
                    </button>
                    <span class="xpe-freeze-info frozen">
                        Status: 🧊 <strong>STREAK FROZEN</strong> (Protected up to 2 days while busy/away). Return within 2 days to continue unbroken!
                    </span>
                `;
            } else {
                if (freezeIcon) freezeIcon.textContent = '🔥';
                freezeWrap.innerHTML = `
                    <button type="button" class="xpe-deck-btn freeze-btn" onclick="window.msotPlatform.toggleStreakFreeze()">
                        🧊 FREEZE MY STREAK (MAX 2 DAYS)
                    </button>
                    <span class="xpe-freeze-info active">
                        Status: 🔥 <strong>ACTIVE (${student.streak || 1} Days Unbroken)</strong> • Freeze available if you are busy or traveling.
                    </span>
                `;
            }
        }

        // 4. Ledger transactions
        if (recentList) {
            const txs = (window.msotState?.transactions || []).slice(0, 4);
            if (txs.length === 0) {
                recentList.innerHTML = `<div class="xpe-tx-empty">No recent transactions recorded yet. Complete attendance, quizzes, or coding sprints to start earning verified XP.</div>`;
            } else {
                recentList.innerHTML = txs.map(t => `
                    <div class="xpe-tx-row">
                        <div class="xpe-tx-left">
                            <span class="xpe-tx-pill">+${t.xp_amount} XP</span>
                            <div class="xpe-tx-desc">
                                <strong>${this.escapeHTML(t.reason || t.action_type)}</strong>
                                <small>${t.created_at || 'Today'} • Rule: ${t.action_type}</small>
                            </div>
                        </div>
                        <span class="xpe-tx-status">✔ VERIFIED</span>
                    </div>
                `).join('');
            }
        }
    }

    renderXPExplainedModalHTML() {
        return `
            <div class="assign-modal-overlay" id="xpExplainedModal" style="display:none;" onclick="if(event.target===this) window.msotPlatform.closeXPExplainedModal()">
                <div class="assign-modal-card xpe-modal-card">
                    <div class="amc-header">
                        <div class="amc-title-box">
                            <span class="amc-sub">MSOT LEARN ACADEMIC PROTOCOL</span>
                            <h3>How & Why Your XP Increases</h3>
                        </div>
                        <button class="amc-close-btn" onclick="window.msotPlatform.closeXPExplainedModal()">✕</button>
                    </div>

                    <div class="xpe-modal-body">
                        <!-- 1. The Core Philosophy -->
                        <div class="xpe-philosophy-banner">
                            <div class="xpb-badge">⚡ THE CORE PRINCIPLE</div>
                            <p>
                                <strong>XP directly depends on your educational commitment.</strong> In MSOT Learn, XP is driven by 3 primary factors: 
                                <strong>Student Attendance</strong>, <strong>Number of Questions Solved (+10 XP each)</strong>, and <strong>Daily Activeness with a 2-Day Streak Freeze Option</strong>.
                            </p>
                        </div>

                        <!-- 2. Live Interactive Hub: Attendance, Questions, and Streak Freeze -->
                        <div class="xpe-interactive-deck">
                            <!-- Card A: Student Attendance -->
                            <div class="xpe-deck-card">
                                <div class="xped-header">
                                    <span class="xped-icon">🏫</span>
                                    <div class="xped-title-wrap">
                                        <h4>Student Attendance</h4>
                                        <span class="xped-points">+20 XP Daily</span>
                                    </div>
                                </div>
                                <p class="xped-desc">
                                    Your XP depends directly on student attendance. Checking in daily grants verified XP and fuels your learning streak.
                                </p>
                                <div class="xped-action-row" id="xpeAttendanceActionWrap">
                                    <!-- Populated dynamically by updateXPExplainedLiveStats -->
                                </div>
                            </div>

                            <!-- Card B: Questions Solved -->
                            <div class="xpe-deck-card">
                                <div class="xped-header">
                                    <span class="xped-icon">🎯</span>
                                    <div class="xped-title-wrap">
                                        <h4>Questions Solved</h4>
                                        <span class="xped-points">+10 XP / Question</span>
                                    </div>
                                </div>
                                <p class="xped-desc">
                                    Number of questions solved increases your XP by <strong>+10 XP</strong> for every single question solved across Daily Trials, Arcade, and Weekend Labs.
                                </p>
                                <div class="xped-stat-box" id="xpeQuestionsBadge">
                                    <!-- Populated dynamically -->
                                </div>
                            </div>

                            <!-- Card C: Daily Streak & 2-Day Freeze -->
                            <div class="xpe-deck-card xpe-deck-freeze">
                                <div class="xped-header">
                                    <span class="xped-icon" id="xpeFreezeIcon">🔥</span>
                                    <div class="xped-title-wrap">
                                        <h4>Daily Activeness Streak & Freeze</h4>
                                        <span class="xped-points">2-Day Max Protection</span>
                                    </div>
                                </div>
                                <p class="xped-desc">
                                    Streak represents consecutive days of daily activeness. Busy or out somewhere? <strong>Freeze your streak for up to 2 days</strong> so it doesn't break while away. When you return within 2 days, your streak continues! If away more than 2 days, your streak resets.
                                </p>
                                <div class="xped-action-row" id="xpeFreezeActionWrap">
                                    <!-- Populated dynamically by updateXPExplainedLiveStats -->
                                </div>
                            </div>
                        </div>

                        <!-- 3. Action to XP Matrix Table -->
                        <div class="xpe-table-section">
                            <h4 class="xpe-section-title">Verified Reward Matrix (Rules Engine Table)</h4>
                            <div class="xpe-table-wrap">
                                <table class="xpe-rules-table">
                                    <thead>
                                        <tr>
                                            <th>EDUCATIONAL ACTION</th>
                                            <th>XP AWARDED</th>
                                            <th>WHY XP INCREASES (ACADEMIC CRITERIA)</th>
                                            <th>LIMIT / RESET</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><strong>🏫 Student Attendance</strong></td>
                                            <td><span class="xpt-cell-xp">+20 XP</span></td>
                                            <td>Daily attendance check-in and lecture presence verified. Directly fuels streak and attendance record.</td>
                                            <td>Daily presence</td>
                                        </tr>
                                        <tr>
                                            <td><strong>🎯 Questions Solved</strong></td>
                                            <td><span class="xpt-cell-xp">+10 XP / question</span></td>
                                            <td>Every problem solved in Daily Trials, Arcade, or Weekend Labs increases XP by +10 XP.</td>
                                            <td>Unlimited practice</td>
                                        </tr>
                                        <tr>
                                            <td><strong>🔥 Daily Activeness Streak</strong></td>
                                            <td><span class="xpt-cell-xp">+10 XP / day</span></td>
                                            <td>Consecutive active days on MSOT Learn. Builds velocity and weekly leaderboard standing.</td>
                                            <td>Continuous daily habit</td>
                                        </tr>
                                        <tr>
                                            <td><strong>🧊 Streak Freeze Option</strong></td>
                                            <td><span class="xpt-cell-xp">Streak Protected</span></td>
                                            <td>Busy or away? Freezes streak for up to 2 days. Return within 2 days to continue unbroken; resets after 2 days.</td>
                                            <td>Max 2 Days Freeze</td>
                                        </tr>
                                        <tr>
                                            <td><strong>💻 Weekend Code Sprint</strong></td>
                                            <td><span class="xpt-cell-xp">+150 to +300 XP</span></td>
                                            <td>Pushed by instructor. Solution executes in online compiler passing 100% of unit test benchmarks.</td>
                                            <td>Per weekend sprint</td>
                                        </tr>
                                        <tr>
                                            <td><strong>🎮 Arcade 17 Sacred Trials</strong></td>
                                            <td><span class="xpt-cell-xp">+10 XP / Q + Clear</span></td>
                                            <td>Solving interactive simulations across Data Structures, Algorithms, C++, Web, and Operating Systems.</td>
                                            <td>Topic completion</td>
                                        </tr>
                                        <tr>
                                            <td><strong>🏫 College Lecture/Lab Attendance</strong></td>
                                            <td><span class="xpt-cell-xp">+10 XP</span></td>
                                            <td>Verified in-person presence in campus computer lab sessions and theory lectures.</td>
                                            <td>Max 30 XP / day</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 4. Why Weekly XP Resets vs Lifetime XP -->
                        <div class="xpe-two-columns">
                            <div class="xpe-col-box">
                                <div class="xpe-col-icon">🏆</div>
                                <h4>Why Weekly XP Resets (Every Sunday 23:59 PM)</h4>
                                <p>
                                    To protect fairness and inclusion, the League Standings reset weekly. This guarantees that new cadets and students who join later can immediately compete for top weekly ranks without being permanently locked out by senior students.
                                </p>
                            </div>
                            <div class="xpe-col-box">
                                <div class="xpe-col-icon">⭐</div>
                                <h4>Why Lifetime XP Never Resets (Level Progression)</h4>
                                <p>
                                    Your Lifetime XP represents your permanent engineering portfolio. It increases continuously from Level 1 up to Level 12+, unlocking exclusive badges, dossiers, and academic honors that never disappear.
                                </p>
                            </div>
                        </div>

                        <!-- 5. Live Cadet Dossier & Audit Snapshot -->
                        <div class="xpe-live-snapshot">
                            <h4 class="xpe-section-title">Your Live XP Account Dossier</h4>
                            <div class="xpe-stats-row">
                                <div class="xpe-stat-pill">
                                    <span class="xpsp-val" id="xpeLiveLifetime">0 XP</span>
                                    <span class="xpsp-lbl">LIFETIME XP</span>
                                </div>
                                <div class="xpe-stat-pill">
                                    <span class="xpsp-val" id="xpeLiveWeekly">0 XP</span>
                                    <span class="xpsp-lbl">WEEKLY LEAGUE XP</span>
                                </div>
                                <div class="xpe-stat-pill">
                                    <span class="xpsp-val" id="xpeLiveLevel">Level 12</span>
                                    <span class="xpsp-lbl">CADET RANK</span>
                                </div>
                                <div class="xpe-stat-pill">
                                    <span class="xpsp-val" id="xpeLiveQuestions">0</span>
                                    <span class="xpsp-lbl">QUESTIONS SOLVED</span>
                                </div>
                                <div class="xpe-stat-pill">
                                    <span class="xpsp-val" id="xpeLiveStreak">7 Days 🔥</span>
                                    <span class="xpsp-lbl">ACTIVE STREAK</span>
                                </div>
                            </div>

                            <div class="xpe-recent-tx-wrap">
                                <span class="xpe-recent-hdr">Recent Verified Ledger Transactions:</span>
                                <div class="xpe-recent-list" id="xpeLiveRecentTransactions">
                                    <!-- Populated dynamically by updateXPExplainedLiveStats -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="amc-actions">
                        <button type="button" class="btn-publish-assign" onclick="window.msotPlatform.closeXPExplainedModal()">
                            ✔ UNDERSTOOD — BACK TO WORKSPACE
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showArenaVictoryXPModal(submitRes, assignment, lang, passedCount, totalCount) {
        let modal = document.getElementById('arenaVictoryModal');
        if (!modal) {
            const wrap = document.createElement('div');
            wrap.innerHTML = this.renderArenaVictoryModalHTML();
            document.body.appendChild(wrap.firstElementChild);
            modal = document.getElementById('arenaVictoryModal');
        }

        const vTitle = document.getElementById('avmProblemTitle');
        const vXP = document.getElementById('avmXPAmount');
        const vReason = document.getElementById('avmReason');
        const vTests = document.getElementById('avmTestsPassed');
        const vLifetime = document.getElementById('avmLifetimeXP');
        const vWeekly = document.getElementById('avmWeeklyXP');

        if (vTitle) vTitle.textContent = assignment.title;
        if (vXP) vXP.textContent = `+${submitRes.xpAwarded} XP`;
        if (vReason) vReason.textContent = `Verified 100% test case pass in ${lang.toUpperCase()} compiler runtime.`;
        if (vTests) vTests.textContent = `${passedCount} / ${totalCount} (100% Correct)`;
        if (vLifetime) vLifetime.textContent = `${submitRes.totalXP} XP (Level ${submitRes.newLevel || 12})`;
        if (vWeekly) vWeekly.textContent = `+${submitRes.xpAwarded} XP added to Cadet League Standings`;

        if (modal) modal.style.display = 'flex';
    }

    closeArenaVictoryModal() {
        const modal = document.getElementById('arenaVictoryModal');
        if (modal) modal.style.display = 'none';
    }

    renderArenaVictoryModalHTML() {
        return `
            <div class="arena-victory-overlay" id="arenaVictoryModal" style="display:none;" onclick="if(event.target===this) window.msotPlatform.closeArenaVictoryModal()">
                <div class="arena-victory-card animate-victory-pop">
                    <div class="avc-confetti-banner">🎉</div>
                    <div class="avc-badge-pill">ALL TEST BENCHES VERIFIED</div>
                    <h2 class="avc-title">CHALLENGE CLEARED!</h2>
                    <h3 class="avc-subtitle" id="avmProblemTitle">Weekend Code Sprint</h3>

                    <div class="avc-xp-celebration-box">
                        <div class="avc-xp-big" id="avmXPAmount">+50 XP</div>
                        <div class="avc-xp-tag">VERIFIED XP CREDITED TO WALLET</div>
                    </div>

                    <div class="avc-breakdown-details">
                        <div class="avc-row">
                            <span class="avc-label">Why XP Increased:</span>
                            <span class="avc-val" id="avmReason">Passed all unit test benches with optimal execution.</span>
                        </div>
                        <div class="avc-row">
                            <span class="avc-label">Test Benches Cleared:</span>
                            <span class="avc-val" id="avmTestsPassed">3 / 3 (100%)</span>
                        </div>
                        <div class="avc-row">
                            <span class="avc-label">New Lifetime Balance:</span>
                            <span class="avc-val" id="avmLifetimeXP">4,540 XP</span>
                        </div>
                        <div class="avc-row">
                            <span class="avc-label">Cadet League Impact:</span>
                            <span class="avc-val" id="avmWeeklyXP">+50 XP added to Weekly Leaderboard</span>
                        </div>
                    </div>

                    <button class="avc-continue-btn" onclick="window.msotPlatform.closeArenaVictoryModal()">
                        CONTINUE EXPLORING ➔
                    </button>
                </div>
            </div>
        `;
    }

    escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

window.msotPlatform = new MSOTPlatformController();
// Pointer for backward compatibility
window.miraiPlatform = window.msotPlatform;

// ─── Global Multi-Theme Controller (Lavender, Cyber, Slate) ───────────────────
window.msotSetTheme = function(themeName, event) {
    if (event) {
        try {
            event.preventDefault();
            event.stopPropagation();
        } catch(e) {}
    }
    const validThemes = ['lavender', 'cyber', 'midnight'];
    if (!validThemes.includes(themeName)) themeName = 'lavender';

    document.documentElement.setAttribute('data-theme', themeName);
    try {
        localStorage.setItem('MSOT_THEME', themeName);
    } catch(e) {}

    // Update active class on all header HUD and dashboard theme buttons
    document.querySelectorAll('.theme-pill-btn').forEach(btn => {
        if (btn.getAttribute('data-theme') === themeName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    document.querySelectorAll('.theme-choice-btn').forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(themeName)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Notify listeners
    window.dispatchEvent(new CustomEvent('msot-theme-change', { detail: { theme: themeName } }));

    // Re-render dashboard if currently visible so dynamic badges update
    const dashSec = document.getElementById('dashboardSection');
    if (dashSec && (dashSec.classList.contains('active') || dashSec.style.display !== 'none')) {
        window.msotPlatform?.renderDashboard?.();
    }
};

// Sync active buttons on DOMContentLoaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const curTheme = document.documentElement.getAttribute('data-theme') || (function(){ try { return localStorage.getItem('MSOT_THEME'); } catch(e){} })() || 'lavender';
        document.querySelectorAll('.theme-pill-btn').forEach(btn => {
            if (btn.getAttribute('data-theme') === curTheme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    });
}

// Expose sector navigation globally for the Hero Gateway
window.cycleGamingSector = function(dir) {
    if (window.msotPlatform && window.msotPlatform.cycleGamingSector) {
        window.msotPlatform.cycleGamingSector(dir);
    }
};
