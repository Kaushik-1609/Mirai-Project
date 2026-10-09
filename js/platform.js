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
    }

    init() {
        this.bindRoleSwitcher();
        this.renderStudentDashboard();
        this.renderArcade();
        this.renderDailyQuizCard();
        this.renderQuests();
        this.renderLeagues();
        this.renderFairnessBoards();
        this.renderTeamBattles();
        this.renderBadgesVault();
        this.renderFacultyDashboard();
        this.renderAdminRules();
        this.renderXPLedger();
        this.renderStudentProfile();
        this.updateHeaderStats();
        this.startLiveBattleTicks();
    }

    refreshAll() {
        this.updateHeaderStats();
        this.renderStudentDashboard();
        this.renderArcade();
        this.renderQuests();
        this.renderLeagues();
        this.renderFairnessBoards();
        this.renderTeamBattles();
        this.renderBadgesVault();
        this.renderFacultyDashboard();
        this.renderAdminRules();
        this.renderXPLedger();
        this.renderStudentProfile();
    }

    // =========================================================================
    // 0. ROLE-BASED ACCESS CONTROL & HEADER HUD
    // =========================================================================
    bindRoleSwitcher() {
        const roleSelect = document.getElementById('userRoleSelect');
        const roleIcon = document.getElementById('roleIconIndicator');
        if (roleSelect) {
            roleSelect.value = window.msotState.currentRole;
            if (roleIcon) {
                roleIcon.textContent = roleSelect.value === 'STUDENT' ? '⚔️' : (roleSelect.value === 'FACULTY' ? '🎓' : '🛡️');
            }
            roleSelect.addEventListener('change', (e) => {
                const role = e.target.value;
                if (roleIcon) {
                    roleIcon.textContent = role === 'STUDENT' ? '⚔️' : (role === 'FACULTY' ? '🎓' : '🛡️');
                }
                window.msotState.setRole(role);
                this.applyRolePermissions(role);
                if (window.miraiAudio) window.miraiAudio.playClick();
            });
            this.applyRolePermissions(window.msotState.currentRole);
        }
    }

    applyRolePermissions(role) {
        document.body.setAttribute('data-user-role', role);

        // Update role indicator banner
        const roleBanner = document.getElementById('roleIndicatorBanner');
        if (roleBanner) {
            roleBanner.className = `role-indicator-banner ${role.toLowerCase()}`;
            roleBanner.innerHTML = `
                <span>ACTIVE SESSION: <strong>${role} ROLE</strong></span>
                <span class="role-desc">
                    ${role === 'STUDENT' ? 'Viewing personalized learning dashboard, quests, badges, and leagues.' : ''}
                    ${role === 'FACULTY' ? 'Full access to student engagement KPIs, syllabus topic radar, and AI Question Review.' : ''}
                    ${role === 'ADMIN' ? 'System governance active. XP economy rules and audit controls unlocked.' : ''}
                </span>
            `;
        }
        // NOTE: No auto-navigation on role change — users navigate via nav links
    }

    updateHeaderStats() {
        const student = window.msotState.student;
        const levelData = calculateLevelData(student.lifetimeXP);

        const xpEl = document.getElementById('headerXP');
        const levelEl = document.getElementById('headerLevel');
        const streakEl = document.getElementById('headerStreak');
        const freezeEl = document.getElementById('headerFreezes');
        const avatarEl = document.getElementById('headerAvatar');

        if (xpEl) xpEl.innerText = `${student.lifetimeXP.toLocaleString()} XP`;
        if (levelEl) levelEl.innerText = `LVL ${levelData.level}`;
        if (streakEl) streakEl.innerText = `${student.streak} Days 🔥`;
        if (freezeEl) freezeEl.innerText = `${student.streakFreezes} 🛡️`;
        if (avatarEl) avatarEl.innerText = student.avatar;
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

                    <!-- Column 3: League Standing & Personal Bests -->
                    <div class="dash-widget-card league-personal">
                        <div class="widget-header">
                            <span class="w-icon">🏆</span>
                            <h4>Current League</h4>
                            <span class="league-gold-badge">${s.league}</span>
                        </div>
                        <div class="league-status-body">
                            <div class="league-rank-plate">
                                <span class="lr-rank">Rank #${s.leagueRank} / 20</span>
                                <span class="lr-weekly">Weekly XP: <strong>${s.weeklyXP} XP</strong></span>
                            </div>
                            <div class="league-zone-indicator">
                                <span class="zone-text safe">Safe Zone (Top 3 Promoted)</span>
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
                                VIEW FULL LEAGUE STANDINGS ➔
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
        // Collect 5 questions across curriculum
        const allQuestions = [];
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
        window.msotState.student.lastDailyQuizDate = new Date().toLocaleDateString();
        window.msotState.save();
    }

    // =========================================================================
    // 3. QUESTS SYSTEM (Daily, Weekly, Topic Quests)
    // =========================================================================
    renderQuests() {
        const container = document.getElementById('questsSectionContainer');
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
        if (anonToggle) anonToggle.checked = s.anonymousMode;

        const list = window.miraiState.leagues || [];

        tbody.innerHTML = list.map((cadet, idx) => {
            const rank = idx + 1;
            const isSelf = cadet.isCurrent;
            const displayName = isSelf && s.anonymousMode ? `${s.alias} (You)` : (isSelf ? `${s.name} (You)` : cadet.name);
            const zoneClass = rank <= 3 ? 'promotion-zone' : (rank >= 18 ? 'relegation-zone' : '');
            const moveIcon = rank <= 3 ? '▲' : (rank >= 18 ? '▼' : '–');
            const moveClass = rank <= 3 ? 'up' : (rank >= 18 ? 'down' : 'same');

            return `
                <tr class="league-row ${isSelf ? 'current-player' : ''} ${zoneClass}">
                    <td class="col-rank">
                        <span class="rank-badge ${rank <= 3 ? 'top' : ''}">${rank}</span>
                    </td>
                    <td class="col-trend"><span class="trend-icon ${moveClass}">${moveIcon}</span></td>
                    <td class="col-name">
                        <div class="student-nameplate">
                            <span class="student-avatar">${isSelf ? s.avatar : '👤'}</span>
                            <span class="student-name-text">${displayName}</span>
                            ${rank <= 3 ? '<span class="crown-icon">👑</span>' : ''}
                        </div>
                    </td>
                    <td class="col-streak">${cadet.streak} 🔥</td>
                    <td class="col-xp"><strong>${cadet.xp} Weekly XP</strong></td>
                </tr>
            `;
        }).join('');
    }

    toggleAnonymousMode() {
        const isAnon = window.msotState.toggleAnonymousMode();
        this.renderLeagues();
        this.renderFairnessBoards();
        this.renderStudentDashboard();
        if (window.miraiAudio) window.miraiAudio.playClick();
    }

    // =========================================================================
    // 5. MULTI-DIMENSIONAL FAIRNESS LEADERBOARDS (Section 15)
    // =========================================================================
    renderFairnessBoards() {
        const container = document.getElementById('fairnessLeaderboardContainer');
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
        if (tab === 'weeklyXP') {
            return `
                <table class="fairness-table">
                    <thead>
                        <tr><th>RANK</th><th>CADET</th><th>ACTIVE STREAK</th><th>WEEKLY XP TOTAL</th></tr>
                    </thead>
                    <tbody>
                        ${fairness.weeklyXP.map(item => `
                            <tr class="${item.isSelf ? 'current-player' : ''}">
                                <td><span class="rank-badge ${item.rank <= 3 ? 'top' : ''}">${item.rank}</span></td>
                                <td><strong>${item.isSelf && isAnon ? 'Anonymous Student #482 (You)' : (item.isSelf ? item.name + ' (You)' : (isAnon ? item.alias : item.name))}</strong></td>
                                <td>${item.streak} Days 🔥</td>
                                <td><span class="xp-val-green">+${item.weeklyXP} XP</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else if (tab === 'mostImproved') {
            return `
                <table class="fairness-table">
                    <thead>
                        <tr><th>RANK</th><th>CADET</th><th>MEASURED LEAP</th><th>EVALUATION BASIS</th></tr>
                    </thead>
                    <tbody>
                        ${fairness.mostImproved.map(item => `
                            <tr class="${item.isSelf ? 'current-player' : ''}">
                                <td><span class="rank-badge ${item.rank <= 3 ? 'top' : ''}">${item.rank}</span></td>
                                <td><strong>${item.isSelf && isAnon ? 'Anonymous Student #482 (You)' : (item.isSelf ? item.name + ' (You)' : (isAnon ? item.alias : item.name))}</strong></td>
                                <td><span class="badge-improved">${item.improvement}</span></td>
                                <td>${item.reason}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else if (tab === 'consistency') {
            return `
                <table class="fairness-table">
                    <thead>
                        <tr><th>RANK</th><th>CADET</th><th>UNBROKEN STUDY STREAK</th><th>STATUS</th></tr>
                    </thead>
                    <tbody>
                        ${fairness.consistency.map(item => `
                            <tr class="${item.isSelf ? 'current-player' : ''}">
                                <td><span class="rank-badge ${item.rank <= 3 ? 'top' : ''}">${item.rank}</span></td>
                                <td><strong>${item.isSelf && isAnon ? 'Anonymous Student #482 (You)' : (item.isSelf ? item.name + ' (You)' : (isAnon ? item.alias : item.name))}</strong></td>
                                <td><strong>${item.streakDays} Days Continuous</strong></td>
                                <td><span class="consistency-tag">🔥 ${item.tag}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
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
                <!-- Section A vs Section B Real-Time Sprint Banner -->
                <div class="section-battle-card">
                    <div class="sbc-header">
                        <div>
                            <span class="ba-tag">INTER-SECTION COMPETITIVE ARENA</span>
                            <h2 class="section-title">SECTION A vs SECTION B: CODING SPRINT</h2>
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
                    <span class="srf-cadet">${isA ? 'Section A Cadet' : 'Section B Cadet'}</span> solved
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

        const earnedList = window.msotState.student.badges;
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
    // 8. FACULTY DASHBOARD & ENGAGEMENT METRICS (Section 18)
    // =========================================================================
    renderFacultyDashboard() {
        const container = document.getElementById('facultyDashboardSection');
        if (!container) return;

        const kpis = window.msotState.facultyKPIs;
        const txs = window.msotState.transactions;

        container.innerHTML = `
            <div class="faculty-card scroll-reveal">
                <div class="faculty-header">
                    <div>
                        <span class="faculty-tag">FACULTY PORTAL // PEDAGOGICAL SURVEILLANCE</span>
                        <h2 class="section-title">ACADEMIC ENGAGEMENT & DIFFICULTY RADAR</h2>
                        <p class="section-subtitle">Real-time cohort engagement analytics, syllabus difficulty radar, and AI question review gate.</p>
                    </div>
                    <div class="faculty-quick-actions">
                        <button class="action-btn" onclick="window.msotPlatform.logClassAttendance()">+ LOG CLASS ATTENDANCE (+10 XP)</button>
                        <button class="action-btn" onclick="window.msotPlatform.gradeHomework()">+ VERIFY HOMEWORK (+20 XP)</button>
                    </div>
                </div>

                <!-- Section 18 Engagement KPI Cards -->
                <div class="faculty-kpis-grid">
                    <div class="fk-card">
                        <span class="fk-val text-green">${kpis.dailyActivePct}%</span>
                        <span class="fk-lbl">Daily Active Students</span>
                    </div>
                    <div class="fk-card">
                        <span class="fk-val text-cyan">${kpis.weeklyActivePct}%</span>
                        <span class="fk-lbl">Weekly Active Students</span>
                    </div>
                    <div class="fk-card">
                        <span class="fk-val text-gold">${kpis.quizCompletionPct}%</span>
                        <span class="fk-lbl">Quiz Completion Rate</span>
                    </div>
                    <div class="fk-card">
                        <span class="fk-val text-orange">${kpis.avgStreakDays} Days</span>
                        <span class="fk-lbl">Cohort Average Streak</span>
                    </div>
                    <div class="fk-card alert">
                        <span class="fk-val text-red">${kpis.inactiveStudentsCount} Cadets</span>
                        <span class="fk-lbl">Inactive Students (5+ Days)</span>
                    </div>
                </div>

                <div class="faculty-grid mt-24">
                    <!-- Topic Difficulty Radar -->
                    <div class="dashboard-panel">
                        <h4 class="panel-title">📊 Syllabus Vulnerability & Topic Accuracy Radar</h4>
                        <div class="weak-topic-bars">
                            ${kpis.topicDifficulty.map(td => `
                                <div class="wt-item">
                                    <div class="wt-labels">
                                        <span>${td.topic}</span>
                                        <span class="wt-pct">${td.accuracy}% Accuracy (${td.need})</span>
                                    </div>
                                    <div class="wt-track">
                                        <div class="wt-bar ${td.accuracy < 50 ? 'alert' : (td.accuracy < 70 ? 'warning' : 'ok')}" style="width: ${td.accuracy}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Quiet Students Alert List -->
                    <div class="dashboard-panel">
                        <h4 class="panel-title">⚠️ Quiet Students Alert (5+ Days Inactive)</h4>
                        <div class="quiet-list">
                            ${(window.miraiState.quietStudents || []).map(qs => `
                                <div class="qs-card">
                                    <div class="qs-info">
                                        <strong>${qs.name}</strong> (${qs.id})
                                        <div class="qs-sub">${qs.batch} • Inactive for ${qs.daysQuiet} days • Last seen: ${qs.lastTopic}</div>
                                    </div>
                                    <button class="nudge-btn" onclick="alert('Nudge sent to ${qs.name} via Telegram / Email bot!')">SEND NUDGE 🔔</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Section 9 AI Question Generation Workflow Container -->
                <div id="facultyAIWorkflowContainer" class="mt-24"></div>

                <!-- Immutable Transactions Audit & Override Table -->
                <div class="dashboard-panel full-width mt-24">
                    <h4 class="panel-title">🛡️ Faculty XP Ledger Audit & Override Console</h4>
                    <div class="audit-table-wrap">
                        <table class="audit-table">
                            <thead>
                                <tr>
                                    <th>TX ID</th>
                                    <th>TIMESTAMP</th>
                                    <th>ACTION TYPE</th>
                                    <th>XP AWARD</th>
                                    <th>JUSTIFICATION / METADATA</th>
                                    <th>STATUS</th>
                                    <th>FACULTY OVERRIDE</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${txs.slice(0, 8).map(tx => `
                                    <tr class="${tx.status === 'VOIDED' ? 'voided-row' : ''}">
                                        <td><code>${tx.id}</code></td>
                                        <td>${tx.created_at}</td>
                                        <td><span class="action-tag">${tx.action_type}</span></td>
                                        <td><strong>+${tx.xp_amount} XP</strong></td>
                                        <td>${tx.reason}</td>
                                        <td><span class="status-chip ${tx.status.toLowerCase()}">${tx.status}</span></td>
                                        <td>
                                            ${tx.status === 'VALID' ? `
                                                <button class="void-btn" onclick="window.msotPlatform.promptVoidXP('${tx.id}')">VOID XP & REVERT</button>
                                            ` : `<span class="audited-text">REVERTED</span>`}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Render AI Question Review Workflow
        if (window.msotAI) {
            window.msotAI.renderWorkflow('facultyAIWorkflowContainer');
        }
    }

    promptVoidXP(txId) {
        const reason = prompt('Enter Faculty Override Justification for voiding this transaction:');
        if (reason && reason.trim()) {
            window.msotState.voidTransaction(txId, reason.trim());
            alert(`Transaction ${txId} successfully voided. XP adjusted in immutable ledger.`);
            this.refreshAll();
        }
    }

    logClassAttendance() {
        const res = window.msotState.recordXP('ATTEND_CLASS', null, 'Lecture Attendance verified by instructor', { hall: 'L-04' }, 'faculty_override');
        if (window.miraiAudio) window.miraiAudio.playSuccess();
        alert(`Attendance officially logged! Awarded +${res.awarded} XP. Total Lifetime XP: ${res.totalXP}`);
        this.refreshAll();
    }

    gradeHomework() {
        const res = window.msotState.recordXP('HOMEWORK', null, 'Lab assignment verified on-time by faculty', { assignment: 'Recursion Lab' }, 'faculty_override');
        if (window.miraiAudio) window.miraiAudio.playSuccess();
        alert(`Homework officially verified on-time! Awarded +${res.awarded} XP.`);
        this.refreshAll();
    }

    // =========================================================================
    // 9. ADMIN XP RULE ENGINE CONSOLE (Section 5)
    // =========================================================================
    renderAdminRules() {
        const container = document.getElementById('adminRulesSection');
        if (!container) return;

        const rules = window.msotState.rules;

        container.innerHTML = `
            <div class="admin-rules-card scroll-reveal">
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
        `;
    }

    saveAdminRule(key) {
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
            if (window.miraiAudio) window.miraiAudio.playClick();
            alert(`Rule [${key}] successfully updated in database.`);
            this.renderAdminRules();
        }
    }

    resetRulesToDefault() {
        if (confirm('Reset all XP economy rules to default academy specifications?')) {
            window.msotState.rules = JSON.parse(JSON.stringify(DEFAULT_XP_RULES));
            window.msotState.save();
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

        const games = window.MIRAI_GAMES.filter(g => {
            if (this.activeArcadeFilter === 'all') return true;
            if (this.activeArcadeFilter === 'cpp') return g.track === 'cpp';
            if (this.activeArcadeFilter === 'html') return g.track === 'html';
            if (this.activeArcadeFilter === 'completed') return window.msotState.student.completedGames.includes(g.id);
            return true;
        });

        grid.innerHTML = games.map(g => {
            const isCompleted = window.msotState.student.completedGames.includes(g.id);

            return `
                <div class="game-card ${isCompleted ? 'completed' : ''}" data-track="${g.track}">
                    <div class="card-badge-header">
                        <span class="track-tag ${g.track}">${g.trackName}</span>
                        <span class="topic-pill">Topic ${g.topicNum}</span>
                        ${isCompleted ? '<span class="status-pill clear">CLEARED ✓</span>' : ''}
                    </div>

                    <div class="card-hero-icon">${g.badge.icon}</div>
                    <h3 class="card-title">${g.title}</h3>
                    <div class="card-topic-name">${g.topic}</div>
                    <p class="card-story">${g.story}</p>

                    <div class="card-footer">
                        <div class="badge-reward-preview">
                            <span class="reward-icon">${g.badge.icon}</span>
                            <span class="reward-title">${g.badge.name}</span>
                        </div>
                        <button class="launch-game-btn" onclick="window.miraiGame.openGame('${g.id}')">
                            ${isCompleted ? 'PLAY AGAIN ↺' : 'DEPLOY GAME ➔'}
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

        const s = window.msotState.student;
        const levelData = calculateLevelData(s.lifetimeXP);

        container.innerHTML = `
            <div class="profile-dashboard-card scroll-reveal">
                <div class="profile-header-banner">
                    <div class="profile-avatar-box">
                        <span class="p-avatar">${s.avatar}</span>
                    </div>
                    <div class="profile-details">
                        <h2 class="p-name">${s.name} <span class="p-alias">@${s.alias}</span></h2>
                        <div class="p-meta">
                            <span>ID: ${s.id}</span> • <span>${s.batch}</span> • <span>${s.section}</span> • <span>${s.campus}</span>
                        </div>
                    </div>
                    <div class="profile-settings-switches">
                        <label class="switch-lbl">
                            <input type="checkbox" ${s.anonymousMode ? 'checked' : ''} onchange="window.msotPlatform.toggleAnonymousMode()">
                            <span>Appear Anonymously on Leaderboards ("${s.alias}")</span>
                        </label>
                    </div>
                </div>

                <div class="profile-metrics-row">
                    <div class="pm-box">
                        <span class="pm-lbl">ACADEMY LEVEL</span>
                        <span class="pm-val">Level ${levelData.level}</span>
                        <div class="level-progress-bar">
                            <div class="lp-fill" style="width: ${levelData.progressPercent}%"></div>
                        </div>
                        <span class="pm-sub">${levelData.currentLevelXP.toLocaleString()} / ${levelData.xpNeededForLevel.toLocaleString()} XP to Level ${levelData.level + 1}</span>
                    </div>

                    <div class="pm-box">
                        <span class="pm-lbl">LIFETIME XP REPUTATION</span>
                        <span class="pm-val text-red">${s.lifetimeXP.toLocaleString()} XP</span>
                        <span class="pm-sub">Weekly Contribution: ${s.weeklyXP} XP</span>
                    </div>

                    <div class="pm-box">
                        <span class="pm-lbl">ACTIVE STUDY STREAK</span>
                        <span class="pm-val">${s.streak} Days 🔥</span>
                        <span class="pm-sub">${s.streakFreezes} Streak Freezes Available 🛡️</span>
                    </div>

                    <div class="pm-box">
                        <span class="pm-lbl">LEAGUE & RANK</span>
                        <span class="pm-val text-gold">${s.league}</span>
                        <span class="pm-sub">Rank #${s.leagueRank} of 20 Cohort Cadets</span>
                    </div>
                </div>

                <!-- Personal Bests Showcase -->
                <div class="personal-bests-section mt-24">
                    <h3 class="vault-title">👑 Verified Personal Bests</h3>
                    <div class="pb-grid-cards">
                        ${s.personalBests.map(pb => `
                            <div class="pb-card">
                                <span class="pb-card-lbl">${pb.metric}</span>
                                <span class="pb-card-val">${pb.value}</span>
                                <span class="pb-card-date">${pb.date}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
}

window.msotPlatform = new MSOTPlatformController();
// Pointer for backward compatibility
window.miraiPlatform = window.msotPlatform;
