/**
 * MSOT LEARN — Study Tracker & Coding Practice Engine
 * Comprehensive external coding practice & study consistency tracking.
 * Supported platforms: LeetCode, HackerRank, Codeforces, CodeChef, General Study, Other.
 */

(function () {
    const STORAGE_PREFIX = 'MSOT_STUDY_TRACKER_';
    const TIMER_STORAGE_KEY_PREFIX = 'MSOT_ACTIVE_STUDY_TIMER_';

    class StudyTrackerController {
        constructor() {
            this.sessions = [];
            this.logs = [];
            this.problemRecords = [];
            this.goals = {
                dailyGoalMinutes: 60,
                weeklyGoalMinutes: 420,
                leetcodeUsername: '',
                codeforcesHandle: '',
                codechefHandle: '',
                hackerrankUsername: ''
            };

            this.activeTimer = null;
            this.timerInterval = null;
            this.currentTab = 'dashboard';
            this.activeFilter = '7days'; // 'today', '7days', '30days', 'all'
            this.editingLogId = null;
            this.editingProblemId = null;
            this.supabase = null;
        }

        init() {
            this.initSupabase();
            this.loadUserData();
            this.recoverActiveTimer();
            this.bindGlobalEvents();
            console.log('⏱️ MSOT Study Tracker Engine initialized.');
        }

        initSupabase() {
            if (window.supabaseClient) {
                this.supabase = window.supabaseClient;
            } else if (window.msotAuth?.supabaseClient) {
                this.supabase = window.msotAuth.supabaseClient;
            }
        }

        getCurrentUserId() {
            const session = window.msotAuth?.session;
            return session?.id || session?.email || 'guest_cadet';
        }

        getStorageKey(key) {
            return `${STORAGE_PREFIX}${key}_${this.getCurrentUserId()}`;
        }

        getTimerStorageKey() {
            return `${TIMER_STORAGE_KEY_PREFIX}${this.getCurrentUserId()}`;
        }

        // =========================================================================
        // DATA PERSISTENCE & RECOVERY (Supabase + LocalStorage Fallback)
        // =========================================================================

        async loadUserData() {
            const userId = this.getCurrentUserId();

            // 1. Try Supabase first
            if (this.supabase && userId !== 'guest_cadet') {
                try {
                    const [sessRes, logsRes, probsRes, goalsRes] = await Promise.all([
                        this.supabase.from('study_sessions').select('*').eq('user_id', userId).order('started_at', { ascending: false }),
                        this.supabase.from('study_logs').select('*').eq('user_id', userId).order('log_date', { ascending: false }),
                        this.supabase.from('study_problem_records').select('*').eq('user_id', userId).order('attempt_date', { ascending: false }),
                        this.supabase.from('study_goals').select('*').eq('user_id', userId).maybeSingle()
                    ]);

                    if (!sessRes.error && Array.isArray(sessRes.data)) this.sessions = sessRes.data;
                    if (!logsRes.error && Array.isArray(logsRes.data)) this.logs = logsRes.data;
                    if (!probsRes.error && Array.isArray(probsRes.data)) this.problemRecords = probsRes.data;
                    if (!goalsRes.error && goalsRes.data) {
                        this.goals = {
                            dailyGoalMinutes: goalsRes.data.daily_goal_minutes || 60,
                            weeklyGoalMinutes: goalsRes.data.weekly_goal_minutes || 420,
                            leetcodeUsername: goalsRes.data.leetcode_username || '',
                            codeforcesHandle: goalsRes.data.codeforces_handle || '',
                            codechefHandle: goalsRes.data.codechef_handle || '',
                            hackerrankUsername: goalsRes.data.hackerrank_username || ''
                        };
                    }
                    this.saveToLocal();
                    this.renderAll();
                    return;
                } catch (err) {
                    console.warn('Supabase Study Tracker query note (using local cache):', err.message);
                }
            }

            // 2. LocalStorage Fallback
            try {
                const localData = localStorage.getItem(this.getStorageKey('DATA'));
                if (localData) {
                    const parsed = JSON.parse(localData);
                    this.sessions = parsed.sessions || [];
                    this.logs = parsed.logs || [];
                    this.problemRecords = parsed.problemRecords || [];
                    this.goals = parsed.goals || this.goals;
                }
            } catch (e) {
                console.error('Error loading study tracker local data:', e);
            }

            this.renderAll();
        }

        saveToLocal() {
            try {
                const payload = {
                    sessions: this.sessions,
                    logs: this.logs,
                    problemRecords: this.problemRecords,
                    goals: this.goals
                };
                localStorage.setItem(this.getStorageKey('DATA'), JSON.stringify(payload));
            } catch (e) {}
        }

        // =========================================================================
        // FEATURE 2: EXTERNAL CODING PRACTICE TIMER (Resilient & Timestamp-based)
        // =========================================================================

        recoverActiveTimer() {
            try {
                const saved = localStorage.getItem(this.getTimerStorageKey());
                if (saved) {
                    this.activeTimer = JSON.parse(saved);
                    this.startTicker();
                    this.updateTimerUI();
                }
            } catch (e) {}
        }

        saveActiveTimerState() {
            if (this.activeTimer) {
                localStorage.setItem(this.getTimerStorageKey(), JSON.stringify(this.activeTimer));
            } else {
                localStorage.removeItem(this.getTimerStorageKey());
            }
        }

        getElapsedMs() {
            if (!this.activeTimer) return 0;
            const accumulated = this.activeTimer.accumulatedMs || 0;
            if (this.activeTimer.isPaused) {
                return accumulated;
            }
            return accumulated + (Date.now() - (this.activeTimer.runningSince || Date.now()));
        }

        startTimerSession() {
            const platform = document.getElementById('stTimerPlatform')?.value || 'LeetCode';
            const problemTitle = document.getElementById('stTimerTitle')?.value?.trim() || '';
            const problemUrl = document.getElementById('stTimerUrl')?.value?.trim() || '';
            const topic = document.getElementById('stTimerTopic')?.value?.trim() || 'General';
            const difficulty = document.getElementById('stTimerDifficulty')?.value || 'Medium';

            const now = Date.now();
            this.activeTimer = {
                clientSessionId: 'sess_' + now + '_' + Math.random().toString(36).substr(2, 6),
                platform,
                problemTitle: problemTitle || `${platform} Practice`,
                problemUrl,
                topic,
                difficulty,
                startedAt: new Date(now).toISOString(),
                runningSince: now,
                accumulatedMs: 0,
                isPaused: false,
                pausedAt: null,
                notes: ''
            };

            this.saveActiveTimerState();
            this.startTicker();
            this.updateTimerUI();
            if (typeof window.showToast === 'function') {
                window.showToast(`⏱️ Started ${platform} study session!`);
            }
        }

        pauseTimerSession() {
            if (!this.activeTimer || this.activeTimer.isPaused) return;
            const now = Date.now();
            this.activeTimer.accumulatedMs += (now - this.activeTimer.runningSince);
            this.activeTimer.isPaused = true;
            this.activeTimer.pausedAt = now;
            this.saveActiveTimerState();
            this.updateTimerUI();
        }

        resumeTimerSession() {
            if (!this.activeTimer || !this.activeTimer.isPaused) return;
            const now = Date.now();
            this.activeTimer.isPaused = false;
            this.activeTimer.runningSince = now;
            this.activeTimer.pausedAt = null;
            this.saveActiveTimerState();
            this.updateTimerUI();
        }

        async stopTimerSession() {
            if (!this.activeTimer) return;

            const elapsedMs = this.getElapsedMs();
            const durationSeconds = Math.round(elapsedMs / 1000);

            if (durationSeconds < 5) {
                if (!confirm('This session is less than 5 seconds. Save anyway?')) {
                    this.discardTimerSession(false);
                    return;
                }
            }

            const notes = document.getElementById('stTimerNotes')?.value?.trim() || '';
            const isSolved = document.getElementById('stTimerMarkSolved')?.checked || false;

            const newSession = {
                id: 'sess_' + Date.now(),
                user_id: this.getCurrentUserId(),
                platform: this.activeTimer.platform,
                session_type: this.activeTimer.platform === 'General Study' ? 'general_study' : 'coding',
                problem_title: this.activeTimer.problemTitle,
                problem_url: this.activeTimer.problemUrl,
                topic: this.activeTimer.topic,
                difficulty: this.activeTimer.difficulty,
                started_at: this.activeTimer.startedAt,
                ended_at: new Date().toISOString(),
                duration_seconds: durationSeconds,
                is_manual: false,
                is_completed: true,
                status: 'completed',
                notes: notes,
                created_at: new Date().toISOString()
            };

            this.sessions.unshift(newSession);

            if (window.msotIntegrity && typeof window.msotIntegrity.monitorEvent === 'function') {
                window.msotIntegrity.monitorEvent('SESSION_FINISH', {
                    session_id: newSession.id,
                    platform: newSession.platform,
                    duration_minutes: Math.round(durationSeconds / 60),
                    duration_seconds: durationSeconds,
                    difficulty: newSession.difficulty
                });
            }


            // If user checked "Mark as Solved", also add to Coding Problem Tracker
            if (isSolved && this.activeTimer.platform !== 'General Study') {
                const newProb = {
                    id: 'prob_' + Date.now(),
                    user_id: this.getCurrentUserId(),
                    platform: this.activeTimer.platform,
                    problem_title: this.activeTimer.problemTitle,
                    problem_url: this.activeTimer.problemUrl,
                    topic: this.activeTimer.topic,
                    difficulty: this.activeTimer.difficulty,
                    attempt_date: new Date().toISOString().split('T')[0],
                    status: 'Solved',
                    time_spent_minutes: Math.ceil(durationSeconds / 60),
                    personal_notes: notes || 'Solved during live session',
                    is_verified: false,
                    verification_source: 'self_reported',
                    created_at: new Date().toISOString()
                };
                this.problemRecords.unshift(newProb);
                this.syncInsertToSupabase('study_problem_records', newProb);
            }

            // Sync session to Supabase
            this.syncInsertToSupabase('study_sessions', newSession);

            this.saveToLocal();
            this.activeTimer = null;
            this.saveActiveTimerState();
            this.stopTicker();
            this.updateTimerUI();
            this.renderAll();

            if (typeof window.showToast === 'function') {
                const mins = Math.round(durationSeconds / 60);
                window.showToast(`🎉 Session saved! +${mins}m recorded.`);
            }
        }

        discardTimerSession(prompt = true) {
            if (!this.activeTimer) return;
            if (prompt && !confirm('Are you sure you want to discard this unfinished session?')) {
                return;
            }
            this.activeTimer = null;
            this.saveActiveTimerState();
            this.stopTicker();
            this.updateTimerUI();
            if (typeof window.showToast === 'function') {
                window.showToast('Session discarded.');
            }
        }

        startTicker() {
            this.stopTicker();
            this.timerInterval = setInterval(() => {
                this.updateClockDisplay();
            }, 1000);
        }

        stopTicker() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        }

        formatDuration(totalSec) {
            const hrs = Math.floor(totalSec / 3600);
            const mins = Math.floor((totalSec % 3600) / 60);
            const secs = totalSec % 60;
            const pad = (n) => String(n).padStart(2, '0');
            return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
        }

        updateClockDisplay() {
            const clockEl = document.getElementById('stTimerClock');
            if (!clockEl) return;
            const totalSec = Math.floor(this.getElapsedMs() / 1000);
            clockEl.textContent = this.formatDuration(totalSec);
        }

        updateTimerUI() {
            const clockEl = document.getElementById('stTimerClock');
            const statePill = document.getElementById('stTimerStatePill');
            const platformTag = document.getElementById('stTimerPlatformTag');
            const startBtn = document.getElementById('stTimerStartBtn');
            const pauseBtn = document.getElementById('stTimerPauseBtn');
            const resumeBtn = document.getElementById('stTimerResumeBtn');
            const stopBtn = document.getElementById('stTimerStopBtn');
            const discardBtn = document.getElementById('stTimerDiscardBtn');
            const activeProbName = document.getElementById('stTimerActiveProbName');

            if (!clockEl) return;

            if (!this.activeTimer) {
                clockEl.textContent = '00:00:00';
                clockEl.className = 'st-timer-clock-display';
                if (statePill) {
                    statePill.className = 'st-timer-state-pill idle';
                    statePill.innerHTML = '<span>●</span><span>IDLE / READY</span>';
                }
                if (platformTag) platformTag.innerHTML = '';
                if (activeProbName) activeProbName.textContent = 'No session active';

                if (startBtn) startBtn.style.display = 'inline-flex';
                if (pauseBtn) pauseBtn.style.display = 'none';
                if (resumeBtn) resumeBtn.style.display = 'none';
                if (stopBtn) stopBtn.style.display = 'none';
                if (discardBtn) discardBtn.style.display = 'none';
            } else {
                this.updateClockDisplay();
                const p = this.activeTimer.platform;
                const badgeClass = this.getPlatformBadgeClass(p);

                if (platformTag) {
                    platformTag.innerHTML = `<span class="st-platform-badge ${badgeClass}">${this.escapeHtml(p)}</span>`;
                }
                if (activeProbName) {
                    activeProbName.textContent = this.activeTimer.problemTitle;
                }

                if (this.activeTimer.isPaused) {
                    clockEl.className = 'st-timer-clock-display paused';
                    if (statePill) {
                        statePill.className = 'st-timer-state-pill paused';
                        statePill.innerHTML = '<span>⏸</span><span>PAUSED</span>';
                    }
                    if (startBtn) startBtn.style.display = 'none';
                    if (pauseBtn) pauseBtn.style.display = 'none';
                    if (resumeBtn) resumeBtn.style.display = 'inline-flex';
                    if (stopBtn) stopBtn.style.display = 'inline-flex';
                    if (discardBtn) discardBtn.style.display = 'inline-flex';
                } else {
                    clockEl.className = 'st-timer-clock-display running';
                    if (statePill) {
                        statePill.className = 'st-timer-state-pill running';
                        statePill.innerHTML = '<span>⚡</span><span>RECORDING IN PROGRESS</span>';
                    }
                    if (startBtn) startBtn.style.display = 'none';
                    if (pauseBtn) pauseBtn.style.display = 'inline-flex';
                    if (resumeBtn) resumeBtn.style.display = 'none';
                    if (stopBtn) stopBtn.style.display = 'inline-flex';
                    if (discardBtn) discardBtn.style.display = 'inline-flex';
                }
            }
        }

        // =========================================================================
        // FEATURE 1 & 6: DASHBOARD, ANALYTICS & GOALS
        // =========================================================================

        setFilter(filter) {
            this.activeFilter = filter;
            document.querySelectorAll('.st-filter-pill').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === filter);
            });
            this.renderDashboard();
        }

        getFilteredSessions() {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            return this.sessions.filter(s => {
                const sDate = (s.started_at || '').split('T')[0];
                if (this.activeFilter === 'today') {
                    return sDate === todayStr;
                } else if (this.activeFilter === '7days') {
                    const diffDays = (now - new Date(s.started_at)) / (1000 * 60 * 60 * 24);
                    return diffDays <= 7;
                } else if (this.activeFilter === '30days') {
                    const diffDays = (now - new Date(s.started_at)) / (1000 * 60 * 60 * 24);
                    return diffDays <= 30;
                }
                return true;
            });
        }

        calculateStreak() {
            // Count consecutive days ending today or yesterday with at least 1 session or log
            const activeDates = new Set();
            this.sessions.forEach(s => {
                if (s.started_at) activeDates.add(s.started_at.split('T')[0]);
            });
            this.logs.forEach(l => {
                if (l.log_date) activeDates.add(l.log_date);
            });

            const sortedDates = Array.from(activeDates).sort().reverse();
            if (sortedDates.length === 0) return 0;

            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (!sortedDates.includes(todayStr) && !sortedDates.includes(yesterdayStr)) {
                return 0;
            }

            let streak = 0;
            let checkDate = sortedDates.includes(todayStr) ? today : yesterday;

            while (true) {
                const str = checkDate.toISOString().split('T')[0];
                if (activeDates.has(str)) {
                    streak++;
                    checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
                } else {
                    break;
                }
            }
            return streak;
        }

        renderDashboard() {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            // 1. Time aggregations
            let todaySec = 0;
            let weekSec = 0;
            let monthSec = 0;
            let codingSec = 0;
            let generalSec = 0;

            this.sessions.forEach(s => {
                const sec = s.duration_seconds || 0;
                const sDate = (s.started_at || '').split('T')[0];

                if (sDate === todayStr) todaySec += sec;

                const diffDays = (now - new Date(s.started_at)) / (1000 * 60 * 60 * 24);
                if (diffDays <= 7) weekSec += sec;
                if (diffDays <= 30) monthSec += sec;

                if (s.session_type === 'general_study' || s.platform === 'General Study') {
                    generalSec += sec;
                } else {
                    codingSec += sec;
                }
            });

            // Also add minutes from daily logs if any manual logs exist
            this.logs.forEach(l => {
                const sec = (l.time_spent_minutes || 0) * 60;
                const lDate = l.log_date;
                if (lDate === todayStr) todaySec += sec;
                const diffDays = (now - new Date(l.log_date)) / (1000 * 60 * 60 * 24);
                if (diffDays <= 7) weekSec += sec;
                if (diffDays <= 30) monthSec += sec;

                if (l.platform === 'General Study') {
                    generalSec += sec;
                } else {
                    codingSec += sec;
                }
            });

            // Problems solved count
            const solvedProblems = this.problemRecords.filter(p => p.status === 'Solved').length;
            const streak = this.calculateStreak();

            // Set metric texts
            this.setElText('stStatToday', this.formatHoursMins(todaySec));
            this.setElText('stStatWeek', this.formatHoursMins(weekSec));
            this.setElText('stStatMonth', this.formatHoursMins(monthSec));
            this.setElText('stStatCoding', this.formatHoursMins(codingSec));
            this.setElText('stStatGeneral', this.formatHoursMins(generalSec));
            this.setElText('stStatSolved', solvedProblems);
            this.setElText('stStatSessions', this.sessions.length);
            this.setElText('stStatStreak', `${streak} Days`);

            // Daily Goal progress
            const dailyGoalMinutes = this.goals.dailyGoalMinutes || 60;
            const todayMins = Math.round(todaySec / 60);
            const goalPct = Math.min(100, Math.round((todayMins / dailyGoalMinutes) * 100));

            const goalBar = document.getElementById('stGoalBarFill');
            if (goalBar) goalBar.style.width = `${goalPct}%`;

            this.setElText('stGoalMinsLabel', `${todayMins}m / ${dailyGoalMinutes}m (${goalPct}%)`);
            const goalMsg = document.getElementById('stGoalStatusMsg');
            if (goalMsg) {
                if (goalPct >= 100) {
                    goalMsg.innerHTML = '🎉 <strong style="color:#34d399;">Daily goal achieved!</strong> Great consistency, Cadet.';
                } else {
                    const remaining = dailyGoalMinutes - todayMins;
                    goalMsg.innerHTML = `🔥 <strong>${remaining} mins remaining</strong> to hit today's target. Keep coding!`;
                }
            }

            // Render Activity Chart & Recent Sessions
            this.renderActivityChart();
            this.renderRecentSessions();
        }

        renderActivityChart() {
            const chartContainer = document.getElementById('stActivityChart');
            if (!chartContainer) return;

            // Generate last 7 days buckets
            const days = [];
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const now = new Date();

            for (let i = 6; i >= 0; i--) {
                const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const str = d.toISOString().split('T')[0];
                const label = `${dayNames[d.getDay()]} ${d.getDate()}`;
                days.push({ dateStr: str, label: label, totalMinutes: 0 });
            }

            // Sum sessions
            this.sessions.forEach(s => {
                const sDate = (s.started_at || '').split('T')[0];
                const match = days.find(d => d.dateStr === sDate);
                if (match) {
                    match.totalMinutes += Math.round((s.duration_seconds || 0) / 60);
                }
            });

            // Sum logs
            this.logs.forEach(l => {
                const match = days.find(d => d.dateStr === l.log_date);
                if (match) {
                    match.totalMinutes += (l.time_spent_minutes || 0);
                }
            });

            const maxMins = Math.max(60, ...days.map(d => d.totalMinutes));

            chartContainer.innerHTML = days.map(d => {
                const heightPct = Math.max(6, Math.min(100, Math.round((d.totalMinutes / maxMins) * 100)));
                return `
                    <div class="st-chart-col">
                        <span class="st-chart-col-val">${d.totalMinutes > 0 ? d.totalMinutes + 'm' : ''}</span>
                        <div class="st-chart-bar-wrap">
                            <div class="st-chart-bar" style="height: ${heightPct}%;" title="${d.label}: ${d.totalMinutes} mins"></div>
                        </div>
                        <span class="st-chart-col-label">${d.label}</span>
                    </div>
                `;
            }).join('');
        }

        renderRecentSessions() {
            const listEl = document.getElementById('stRecentSessionsList');
            if (!listEl) return;

            const recent = this.sessions.slice(0, 6);
            if (recent.length === 0) {
                listEl.innerHTML = `
                    <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                        No study sessions recorded yet.<br>Start the Live Timer to track your first practice session!
                    </div>
                `;
                return;
            }

            listEl.innerHTML = recent.map(s => {
                const durStr = this.formatDuration(s.duration_seconds || 0);
                const dateStr = s.started_at ? new Date(s.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
                const badgeClass = this.getPlatformBadgeClass(s.platform);
                const linkIcon = s.problem_url ? `<a href="${this.escapeHtml(s.problem_url)}" target="_blank" rel="noopener" style="color:#60a5fa; text-decoration:none;" title="Open problem">↗</a>` : '';

                return `
                    <div class="st-session-item">
                        <div class="st-sess-left">
                            <span class="st-platform-badge ${badgeClass}">${this.escapeHtml(s.platform)}</span>
                            <div class="st-sess-title-box">
                                <span class="st-sess-name">${this.escapeHtml(s.problem_title)} ${linkIcon}</span>
                                <span class="st-sess-meta">${dateStr} • ${this.escapeHtml(s.topic || 'General')}</span>
                            </div>
                        </div>
                        <span class="st-sess-dur">${durStr}</span>
                    </div>
                `;
            }).join('');
        }

        // =========================================================================
        // FEATURE 3: DAILY LEARNING LOG
        // =========================================================================

        openAddLogModal(logId = null) {
            this.editingLogId = logId;
            const modal = document.getElementById('stLogModal');
            const titleEl = document.getElementById('stLogModalTitle');
            if (!modal) return;

            if (logId) {
                const log = this.logs.find(l => l.id === logId);
                if (log) {
                    titleEl.textContent = 'Edit Learning Log';
                    document.getElementById('stLogDate').value = log.log_date || '';
                    document.getElementById('stLogSubject').value = log.subject_topic || '';
                    document.getElementById('stLogPlatform').value = log.platform || 'General Study';
                    document.getElementById('stLogTopicName').value = log.topic_problem_name || '';
                    document.getElementById('stLogMinutes').value = log.time_spent_minutes || 0;
                    document.getElementById('stLogAttempted').value = log.problems_attempted || 0;
                    document.getElementById('stLogSolved').value = log.problems_solved || 0;
                    document.getElementById('stLogDifficulty').value = log.difficulty_experienced || 'Medium';
                    document.getElementById('stLogNotes').value = log.learning_notes || '';
                    document.getElementById('stLogLearned').value = log.what_learned || '';
                    document.getElementById('stLogNextGoal').value = log.next_goal || '';
                }
            } else {
                titleEl.textContent = 'Add Daily Learning Log';
                document.getElementById('stLogDate').value = new Date().toISOString().split('T')[0];
                document.getElementById('stLogSubject').value = '';
                document.getElementById('stLogPlatform').value = 'General Study';
                document.getElementById('stLogTopicName').value = '';
                document.getElementById('stLogMinutes').value = 45;
                document.getElementById('stLogAttempted').value = 0;
                document.getElementById('stLogSolved').value = 0;
                document.getElementById('stLogDifficulty').value = 'Medium';
                document.getElementById('stLogNotes').value = '';
                document.getElementById('stLogLearned').value = '';
                document.getElementById('stLogNextGoal').value = '';
            }

            modal.classList.add('open');
        }

        closeAddLogModal() {
            const modal = document.getElementById('stLogModal');
            if (modal) modal.classList.remove('open');
            this.editingLogId = null;
        }

        async saveLogEntry() {
            const date = document.getElementById('stLogDate')?.value || new Date().toISOString().split('T')[0];
            const subject = document.getElementById('stLogSubject')?.value?.trim();
            const platform = document.getElementById('stLogPlatform')?.value || 'General Study';
            const topicName = document.getElementById('stLogTopicName')?.value?.trim() || '';
            const minutes = parseInt(document.getElementById('stLogMinutes')?.value, 10) || 0;
            const attempted = parseInt(document.getElementById('stLogAttempted')?.value, 10) || 0;
            const solved = parseInt(document.getElementById('stLogSolved')?.value, 10) || 0;
            const difficulty = document.getElementById('stLogDifficulty')?.value || 'Medium';
            const notes = document.getElementById('stLogNotes')?.value?.trim() || '';
            const learned = document.getElementById('stLogLearned')?.value?.trim() || '';
            const nextGoal = document.getElementById('stLogNextGoal')?.value?.trim() || '';

            if (!subject) {
                alert('Please enter a subject or topic.');
                return;
            }

            if (this.editingLogId) {
                const log = this.logs.find(l => l.id === this.editingLogId);
                if (log) {
                    log.log_date = date;
                    log.subject_topic = subject;
                    log.platform = platform;
                    log.topic_problem_name = topicName;
                    log.time_spent_minutes = minutes;
                    log.problems_attempted = attempted;
                    log.problems_solved = solved;
                    log.difficulty_experienced = difficulty;
                    log.learning_notes = notes;
                    log.what_learned = learned;
                    log.next_goal = nextGoal;
                    log.updated_at = new Date().toISOString();

                    this.syncUpdateToSupabase('study_logs', log);
                }
            } else {
                const newLog = {
                    id: 'log_' + Date.now(),
                    user_id: this.getCurrentUserId(),
                    log_date: date,
                    subject_topic: subject,
                    platform: platform,
                    topic_problem_name: topicName,
                    time_spent_minutes: minutes,
                    problems_attempted: attempted,
                    problems_solved: solved,
                    difficulty_experienced: difficulty,
                    learning_notes: notes,
                    what_learned: learned,
                    next_goal: nextGoal,
                    is_manual: true,
                    created_at: new Date().toISOString()
                };

                this.logs.unshift(newLog);
                this.syncInsertToSupabase('study_logs', newLog);
            }

            this.saveToLocal();
            this.closeAddLogModal();
            this.renderLogs();
            this.renderDashboard();
            if (typeof window.showToast === 'function') {
                window.showToast('Learning log saved successfully!');
            }
        }

        async deleteLogEntry(logId) {
            if (!confirm('Are you sure you want to delete this learning log entry?')) return;
            this.logs = this.logs.filter(l => l.id !== logId);
            this.syncDeleteToSupabase('study_logs', logId);
            this.saveToLocal();
            this.renderLogs();
            this.renderDashboard();
            if (typeof window.showToast === 'function') {
                window.showToast('Log entry deleted.');
            }
        }

        renderLogs() {
            const tableBody = document.getElementById('stLogsTableBody');
            const summaryBox = document.getElementById('stLogsSummaryBox');
            if (!tableBody) return;

            if (this.logs.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">
                            No daily learning logs yet. Click "+ Add Log Entry" to record your study progress!
                        </td>
                    </tr>
                `;
                if (summaryBox) summaryBox.innerHTML = '';
                return;
            }

            // Summary calculations
            const totalMins = this.logs.reduce((acc, l) => acc + (l.time_spent_minutes || 0), 0);
            const totalSolved = this.logs.reduce((acc, l) => acc + (l.problems_solved || 0), 0);

            if (summaryBox) {
                summaryBox.innerHTML = `
                    <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap; font-size:0.85rem; color:#94a3b8;">
                        <span>📚 <strong>${this.logs.length}</strong> Entries Recorded</span>
                        <span>⏱️ Total Logged: <strong>${Math.round(totalMins / 60)}h ${totalMins % 60}m</strong></span>
                        <span>✅ Total Solved in Logs: <strong>${totalSolved}</strong></span>
                    </div>
                `;
            }

            tableBody.innerHTML = this.logs.map(l => {
                const badgeClass = this.getPlatformBadgeClass(l.platform);
                return `
                    <tr>
                        <td><strong>${this.escapeHtml(l.log_date)}</strong></td>
                        <td>
                            <span class="st-platform-badge ${badgeClass}">${this.escapeHtml(l.platform)}</span>
                        </td>
                        <td>
                            <div style="font-weight:600; color:#f8fafc;">${this.escapeHtml(l.subject_topic)}</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">${this.escapeHtml(l.topic_problem_name || '')}</div>
                        </td>
                        <td><strong>${l.time_spent_minutes || 0}m</strong></td>
                        <td>${l.problems_solved || 0} / ${l.problems_attempted || 0}</td>
                        <td style="max-width:220px; font-size:0.78rem; color:#cbd5e1;">
                            ${this.escapeHtml(l.what_learned || l.learning_notes || '—')}
                        </td>
                        <td>
                            <div class="st-action-btns">
                                <button type="button" class="st-table-btn st-table-btn-edit" onclick="window.msotTracker && window.msotTracker.openAddLogModal('${l.id}')">Edit</button>
                                <button type="button" class="st-table-btn st-table-btn-del" onclick="window.msotTracker && window.msotTracker.deleteLogEntry('${l.id}')">✕</button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // =========================================================================
        // FEATURE 4: CODING PROBLEM TRACKER
        // =========================================================================

        openAddProblemModal(probId = null) {
            this.editingProblemId = probId;
            const modal = document.getElementById('stProblemModal');
            const titleEl = document.getElementById('stProblemModalTitle');
            if (!modal) return;

            if (probId) {
                const p = this.problemRecords.find(item => item.id === probId);
                if (p) {
                    titleEl.textContent = 'Edit Tracked Problem';
                    document.getElementById('stProbPlatform').value = p.platform || 'LeetCode';
                    document.getElementById('stProbTitle').value = p.problem_title || '';
                    document.getElementById('stProbUrl').value = p.problem_url || '';
                    document.getElementById('stProbTopic').value = p.topic || 'General';
                    document.getElementById('stProbDifficulty').value = p.difficulty || 'Medium';
                    document.getElementById('stProbStatus').value = p.status || 'Solved';
                    document.getElementById('stProbTime').value = p.time_spent_minutes || 0;
                    document.getElementById('stProbNotes').value = p.personal_notes || '';
                }
            } else {
                titleEl.textContent = 'Add Problem to Tracker';
                document.getElementById('stProbPlatform').value = 'LeetCode';
                document.getElementById('stProbTitle').value = '';
                document.getElementById('stProbUrl').value = '';
                document.getElementById('stProbTopic').value = 'Arrays';
                document.getElementById('stProbDifficulty').value = 'Medium';
                document.getElementById('stProbStatus').value = 'Solved';
                document.getElementById('stProbTime').value = 25;
                document.getElementById('stProbNotes').value = '';
            }

            modal.classList.add('open');
        }

        closeAddProblemModal() {
            const modal = document.getElementById('stProblemModal');
            if (modal) modal.classList.remove('open');
            this.editingProblemId = null;
        }

        async saveProblemEntry() {
            const platform = document.getElementById('stProbPlatform')?.value || 'LeetCode';
            const title = document.getElementById('stProbTitle')?.value?.trim();
            const url = document.getElementById('stProbUrl')?.value?.trim() || '';
            const topic = document.getElementById('stProbTopic')?.value?.trim() || 'General';
            const diff = document.getElementById('stProbDifficulty')?.value || 'Medium';
            const status = document.getElementById('stProbStatus')?.value || 'Solved';
            const time = parseInt(document.getElementById('stProbTime')?.value, 10) || 0;
            const notes = document.getElementById('stProbNotes')?.value?.trim() || '';

            if (!title) {
                alert('Please enter problem title.');
                return;
            }

            if (this.editingProblemId) {
                const p = this.problemRecords.find(item => item.id === this.editingProblemId);
                if (p) {
                    p.platform = platform;
                    p.problem_title = title;
                    p.problem_url = url;
                    p.topic = topic;
                    p.difficulty = diff;
                    p.status = status;
                    p.time_spent_minutes = time;
                    p.personal_notes = notes;
                    p.updated_at = new Date().toISOString();

                    this.syncUpdateToSupabase('study_problem_records', p);
                }
            } else {
                const newProb = {
                    id: 'prob_' + Date.now(),
                    user_id: this.getCurrentUserId(),
                    platform,
                    problem_title: title,
                    problem_url: url,
                    topic,
                    difficulty: diff,
                    attempt_date: new Date().toISOString().split('T')[0],
                    status,
                    time_spent_minutes: time,
                    personal_notes: notes,
                    is_verified: false,
                    verification_source: 'self_reported',
                    created_at: new Date().toISOString()
                };

                this.problemRecords.unshift(newProb);
                this.syncInsertToSupabase('study_problem_records', newProb);
            }

            this.saveToLocal();
            this.closeAddProblemModal();
            this.renderProblemTracker();
            this.renderDashboard();
            if (typeof window.showToast === 'function') {
                window.showToast('Problem record saved!');
            }
        }

        toggleProblemStatus(probId) {
            const p = this.problemRecords.find(item => item.id === probId);
            if (!p) return;

            // Cycle: Solved -> Needs Revision -> Attempted -> Solved
            if (p.status === 'Solved') {
                p.status = 'Needs Revision';
            } else if (p.status === 'Needs Revision') {
                p.status = 'Attempted';
            } else {
                p.status = 'Solved';
            }

            p.updated_at = new Date().toISOString();
            this.saveToLocal();
            this.syncUpdateToSupabase('study_problem_records', p);
            this.renderProblemTracker();
            this.renderDashboard();
        }

        deleteProblemEntry(probId) {
            if (!confirm('Are you sure you want to remove this problem from your tracker?')) return;
            this.problemRecords = this.problemRecords.filter(p => p.id !== probId);
            this.syncDeleteToSupabase('study_problem_records', probId);
            this.saveToLocal();
            this.renderProblemTracker();
            this.renderDashboard();
        }

        renderProblemTracker() {
            const tableBody = document.getElementById('stProblemsTableBody');
            const summaryBox = document.getElementById('stProblemsSummaryBox');
            if (!tableBody) return;

            const filterPlatform = document.getElementById('stProbFilterPlatform')?.value || 'ALL';
            const filterStatus = document.getElementById('stProbFilterStatus')?.value || 'ALL';

            const filtered = this.problemRecords.filter(p => {
                if (filterPlatform !== 'ALL' && p.platform !== filterPlatform) return false;
                if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
                return true;
            });

            // Summary counts
            const solvedCount = this.problemRecords.filter(p => p.status === 'Solved').length;
            const revCount = this.problemRecords.filter(p => p.status === 'Needs Revision').length;
            const attCount = this.problemRecords.filter(p => p.status === 'Attempted').length;

            if (summaryBox) {
                summaryBox.innerHTML = `
                    <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; font-size:0.85rem;">
                        <span class="st-prob-status-badge st-prob-solved">✓ ${solvedCount} Solved</span>
                        <span class="st-prob-status-badge st-prob-revision">⚠️ ${revCount} Needs Revision</span>
                        <span class="st-prob-status-badge st-prob-attempted">⏳ ${attCount} Attempted</span>
                    </div>
                `;
            }

            if (filtered.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">
                            No coding problems match the filter criteria. Click "+ Add Problem" to log a question!
                        </td>
                    </tr>
                `;
                return;
            }

            tableBody.innerHTML = filtered.map(p => {
                const badgeClass = this.getPlatformBadgeClass(p.platform);
                let statusBadge = '<span class="st-prob-status-badge st-prob-solved">Solved</span>';
                if (p.status === 'Needs Revision') {
                    statusBadge = '<span class="st-prob-status-badge st-prob-revision">Needs Revision</span>';
                } else if (p.status === 'Attempted') {
                    statusBadge = '<span class="st-prob-status-badge st-prob-attempted">Attempted</span>';
                }

                let diffBadge = '<span class="st-diff-pill st-diff-med">Medium</span>';
                if (p.difficulty === 'Easy') diffBadge = '<span class="st-diff-pill st-diff-easy">Easy</span>';
                if (p.difficulty === 'Hard') diffBadge = '<span class="st-diff-pill st-diff-hard">Hard</span>';

                const link = p.problem_url ? `<a href="${this.escapeHtml(p.problem_url)}" target="_blank" rel="noopener" style="color:#60a5fa; text-decoration:none;" title="Open problem link">↗</a>` : '';

                return `
                    <tr>
                        <td>
                            <span class="st-platform-badge ${badgeClass}">${this.escapeHtml(p.platform)}</span>
                        </td>
                        <td>
                            <div style="font-weight:600; color:#ffffff;">${this.escapeHtml(p.problem_title)} ${link}</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">${this.escapeHtml(p.personal_notes || '')}</div>
                        </td>
                        <td>${this.escapeHtml(p.topic || 'General')}</td>
                        <td>${diffBadge}</td>
                        <td>
                            <button type="button" style="background:transparent; border:none; cursor:pointer;" onclick="window.msotTracker && window.msotTracker.toggleProblemStatus('${p.id}')" title="Click to cycle status">
                                ${statusBadge}
                            </button>
                        </td>
                        <td>${p.time_spent_minutes || 0}m</td>
                        <td>
                            <div class="st-action-btns">
                                <button type="button" class="st-table-btn st-table-btn-edit" onclick="window.msotTracker && window.msotTracker.openAddProblemModal('${p.id}')">Edit</button>
                                <button type="button" class="st-table-btn st-table-btn-del" onclick="window.msotTracker && window.msotTracker.deleteProblemEntry('${p.id}')">✕</button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // =========================================================================
        // FEATURE 5 & 6: GOALS & EXTERNAL PROFILE INTEGRATION
        // =========================================================================

        async saveGoalsAndProfiles() {
            const daily = parseInt(document.getElementById('stGoalDailyInput')?.value, 10) || 60;
            const weekly = parseInt(document.getElementById('stGoalWeeklyInput')?.value, 10) || 420;
            const lc = document.getElementById('stProfileLeetcode')?.value?.trim() || '';
            const cf = document.getElementById('stProfileCodeforces')?.value?.trim() || '';
            const cc = document.getElementById('stProfileCodechef')?.value?.trim() || '';
            const hr = document.getElementById('stProfileHackerrank')?.value?.trim() || '';

            this.goals = {
                dailyGoalMinutes: daily,
                weeklyGoalMinutes: weekly,
                leetcodeUsername: lc,
                codeforcesHandle: cf,
                codechefHandle: cc,
                hackerrankUsername: hr
            };

            this.saveToLocal();

            // Sync to Supabase
            if (this.supabase && this.getCurrentUserId() !== 'guest_cadet') {
                try {
                    await this.supabase.from('study_goals').upsert({
                        user_id: this.getCurrentUserId(),
                        daily_goal_minutes: daily,
                        weekly_goal_minutes: weekly,
                        leetcode_username: lc,
                        codeforces_handle: cf,
                        codechef_handle: cc,
                        hackerrank_username: hr,
                        updated_at: new Date().toISOString()
                    });
                } catch (e) {}
            }

            this.renderAnalyticsAndGoals();
            this.renderDashboard();
            if (typeof window.showToast === 'function') {
                window.showToast('Study goals and profiles updated!');
            }
        }

        renderAnalyticsAndGoals() {
            // Inputs
            const dInput = document.getElementById('stGoalDailyInput');
            const wInput = document.getElementById('stGoalWeeklyInput');
            const lcInput = document.getElementById('stProfileLeetcode');
            const cfInput = document.getElementById('stProfileCodeforces');
            const ccInput = document.getElementById('stProfileCodechef');
            const hrInput = document.getElementById('stProfileHackerrank');

            if (dInput) dInput.value = this.goals.dailyGoalMinutes || 60;
            if (wInput) wInput.value = this.goals.weeklyGoalMinutes || 420;
            if (lcInput) lcInput.value = this.goals.leetcodeUsername || '';
            if (cfInput) cfInput.value = this.goals.codeforcesHandle || '';
            if (ccInput) ccInput.value = this.goals.codechefHandle || '';
            if (hrInput) hrInput.value = this.goals.hackerrankUsername || '';

            // Render public links list
            const linksList = document.getElementById('stLinkedProfilesList');
            if (linksList) {
                const items = [];
                if (this.goals.leetcodeUsername) {
                    items.push({
                        name: 'LeetCode',
                        handle: this.goals.leetcodeUsername,
                        url: `https://leetcode.com/u/${encodeURIComponent(this.goals.leetcodeUsername)}/`,
                        icon: '🟡'
                    });
                }
                if (this.goals.codeforcesHandle) {
                    items.push({
                        name: 'Codeforces',
                        handle: this.goals.codeforcesHandle,
                        url: `https://codeforces.com/profile/${encodeURIComponent(this.goals.codeforcesHandle)}`,
                        icon: '🔵'
                    });
                }
                if (this.goals.codechefHandle) {
                    items.push({
                        name: 'CodeChef',
                        handle: this.goals.codechefHandle,
                        url: `https://www.codechef.com/users/${encodeURIComponent(this.goals.codechefHandle)}`,
                        icon: '🟤'
                    });
                }
                if (this.goals.hackerrankUsername) {
                    items.push({
                        name: 'HackerRank',
                        handle: this.goals.hackerrankUsername,
                        url: `https://www.hackerrank.com/${encodeURIComponent(this.goals.hackerrankUsername)}`,
                        icon: '🟢'
                    });
                }

                if (items.length === 0) {
                    linksList.innerHTML = `
                        <div style="padding: 16px; color: var(--text-muted); font-size: 0.82rem; text-align: center;">
                            No public profiles linked yet. Add your username above to link your profile!
                        </div>
                    `;
                } else {
                    linksList.innerHTML = items.map(it => `
                        <div class="st-linked-profile-card">
                            <div class="st-linked-profile-meta">
                                <span class="st-linked-profile-icon">${it.icon}</span>
                                <div>
                                    <div style="font-weight:700; color:#fff; font-size:0.9rem;">${it.name}</div>
                                    <div style="font-size:0.75rem; color:#94a3b8;">@${this.escapeHtml(it.handle)}</div>
                                </div>
                            </div>
                            <a href="${it.url}" target="_blank" rel="noopener" class="btn btn-sm" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); color:#c4b5fd; text-decoration:none; font-size:0.75rem; padding:6px 12px; border-radius:8px;">
                                View Profile ↗
                            </a>
                        </div>
                    `).join('');
                }
            }
        }

        // =========================================================================
        // VIEW SWITCHER & RENDER ALL
        // =========================================================================

        switchTab(tabName) {
            this.currentTab = tabName;
            document.querySelectorAll('.st-nav-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.tab === tabName);
            });
            document.querySelectorAll('.st-view-pane').forEach(pane => {
                pane.classList.toggle('active', pane.id === `stView_${tabName}`);
            });

            if (tabName === 'dashboard') this.renderDashboard();
            if (tabName === 'timer') this.updateTimerUI();
            if (tabName === 'logs') this.renderLogs();
            if (tabName === 'problems') this.renderProblemTracker();
            if (tabName === 'analytics') this.renderAnalyticsAndGoals();
        }

        renderAll() {
            this.renderDashboard();
            this.updateTimerUI();
            this.renderLogs();
            this.renderProblemTracker();
            this.renderAnalyticsAndGoals();
        }

        initView() {
            this.loadUserData();
            this.switchTab(this.currentTab || 'dashboard');
        }

        // =========================================================================
        // SUPABASE SYNC HELPERS (Safe async dispatch)
        // =========================================================================

        async syncInsertToSupabase(table, data) {
            if (!this.supabase || this.getCurrentUserId() === 'guest_cadet') return;
            try {
                await this.supabase.from(table).insert(data);
            } catch (e) {
                console.warn(`Supabase insert to ${table} note:`, e.message);
            }
        }

        async syncUpdateToSupabase(table, data) {
            if (!this.supabase || this.getCurrentUserId() === 'guest_cadet') return;
            try {
                await this.supabase.from(table).update(data).eq('id', data.id);
            } catch (e) {
                console.warn(`Supabase update to ${table} note:`, e.message);
            }
        }

        async syncDeleteToSupabase(table, id) {
            if (!this.supabase || this.getCurrentUserId() === 'guest_cadet') return;
            try {
                await this.supabase.from(table).delete().eq('id', id);
            } catch (e) {
                console.warn(`Supabase delete from ${table} note:`, e.message);
            }
        }

        // =========================================================================
        // UTILITIES
        // =========================================================================

        setElText(id, text) {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        }

        formatHoursMins(totalSec) {
            const hrs = Math.floor(totalSec / 3600);
            const mins = Math.floor((totalSec % 3600) / 60);
            if (hrs > 0) return `${hrs}h ${mins}m`;
            return `${mins}m`;
        }

        getPlatformBadgeClass(platform) {
            const p = (platform || '').toLowerCase();
            if (p.includes('leetcode')) return 'st-badge-leetcode';
            if (p.includes('hackerrank')) return 'st-badge-hackerrank';
            if (p.includes('codeforces')) return 'st-badge-codeforces';
            if (p.includes('codechef')) return 'st-badge-codechef';
            if (p.includes('general')) return 'st-badge-general';
            return 'st-badge-other';
        }

        escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        bindGlobalEvents() {
            // Listen for storage events (e.g. active timer in another tab)
            window.addEventListener('storage', (e) => {
                if (e.key === this.getTimerStorageKey()) {
                    this.recoverActiveTimer();
                }
            });
        }
    }

    // Export singleton
    window.msotTracker = new StudyTrackerController();

    // Auto-init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.msotTracker.init());
    } else {
        window.msotTracker.init();
    }
})();
