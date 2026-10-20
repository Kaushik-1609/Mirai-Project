/**
 * MSOT LEARN — Daily Speed Trial Controller & Engine
 * Manages 7-Day Question Rotation (Asia/Kolkata timezone),
 * Dual Categories (DSA in C++ & HTML Web), Single/Multi MCQ Evaluation,
 * Atomic Scoring, State Persistence & Supabase Synchronization.
 */

(function () {
    'use strict';

    class DailyTrialSystem {
        constructor() {
            this.activeSubject = null;
            this.activeQuestionIndex = 0;
            this.selectedOptions = []; // Array of selected option letters, e.g. ['A'] or ['A', 'C']
            this.questionAnswered = false;
            this.timerInterval = null;
            this.timeRemaining = 45;
        }

        // =====================================================================
        // 1. ASIA/KOLKATA TIMEZONE & 7-DAY ROTATION
        // =====================================================================

        getKolkataDateString() {
            try {
                const formatter = new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'Asia/Kolkata',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
                return formatter.format(new Date()); // YYYY-MM-DD
            } catch (e) {
                const d = new Date();
                return d.toISOString().split('T')[0];
            }
        }

        getKolkataDisplayDate() {
            try {
                return new Intl.DateTimeFormat('en-US', {
                    timeZone: 'Asia/Kolkata',
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }).format(new Date());
            } catch (e) {
                return new Date().toLocaleDateString();
            }
        }

        getKolkataDayNumber() {
            // Consistent date-based rotation using Asia/Kolkata midnight epoch days
            try {
                const kolkataDateStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
                const kolkataDate = new Date(kolkataDateStr);
                const utcMidnight = Date.UTC(kolkataDate.getFullYear(), kolkataDate.getMonth(), kolkataDate.getDate());
                const epochDays = Math.floor(utcMidnight / (1000 * 60 * 60 * 24));
                // Cycle 1 to 7
                const dayNum = ((epochDays % 7) + 7) % 7 + 1;
                return dayNum;
            } catch (e) {
                const day = new Date().getDay(); // 0-6
                return day === 0 ? 7 : day;
            }
        }

        // =====================================================================
        // 2. QUESTION BANK LOOKUP
        // =====================================================================

        getQuestionsForToday(subject) {
            const dayNum = this.getKolkataDayNumber();
            const bank = subject === 'dsa' ? window.QUESTIONS_DSA : window.QUESTIONS_HTML;
            if (!bank || !bank.days || !bank.days[dayNum]) {
                return [];
            }
            return bank.days[dayNum].questions || [];
        }

        getDayMeta(subject) {
            const dayNum = this.getKolkataDayNumber();
            const bank = subject === 'dsa' ? window.QUESTIONS_DSA : window.QUESTIONS_HTML;
            if (!bank || !bank.days || !bank.days[dayNum]) {
                return { title: `Day ${dayNum}`, questions: [] };
            }
            return bank.days[dayNum];
        }

        // =====================================================================
        // 3. USER IDENTIFICATION & PERSISTENCE
        // =====================================================================

        getUserEmail() {
            return (
                window.msotAuth?.session?.email ||
                window.msotState?.student?.email ||
                'student@msot.edu'
            ).toLowerCase().trim();
        }

        getStorageKey(subject) {
            const email = this.getUserEmail();
            const date = this.getKolkataDateString();
            return `MSOT_DAILY_TRIAL_${email}_${date}_${subject}`;
        }

        getTrialState(subject) {
            const key = this.getStorageKey(subject);
            try {
                const raw = localStorage.getItem(key);
                if (raw) {
                    return JSON.parse(raw);
                }
            } catch (e) {}

            return {
                email: this.getUserEmail(),
                date: this.getKolkataDateString(),
                dayNum: this.getKolkataDayNumber(),
                subject: subject,
                currentQIndex: 0,
                score: 0,
                correctCount: 0,
                incorrectCount: 0,
                answers: {}, // questionId: { selected: ['A'], isCorrect: true, xp: 10, answeredAt: '...' }
                completed: false,
                xpAwarded: false,
                startedAt: null,
                completedAt: null
            };
        }

        saveTrialState(subject, state) {
            const key = this.getStorageKey(subject);
            try {
                localStorage.setItem(key, JSON.stringify(state));
            } catch (e) {}

            // Background sync to Supabase if connected
            this.syncToSupabase(subject, state);
        }

        async syncToSupabase(subject, state) {
            const client = window.supabaseClient || window.msotSupabase;
            if (!client || !state) return;

            try {
                const payload = {
                    p_user_email: state.email,
                    p_trial_date: state.date,
                    p_day_number: state.dayNum,
                    p_subject: subject,
                    p_score: state.score || 0,
                    p_correct_count: state.correctCount || 0,
                    p_incorrect_count: state.incorrectCount || 0,
                    p_answers: state.answers || {},
                    p_is_completed: Boolean(state.completed)
                };

                // Try RPC first for atomic update
                const { error: rpcErr } = await client.rpc('sync_daily_trial_attempt', payload);
                if (rpcErr) {
                    // Fallback to table upsert
                    await client.from('daily_trial_attempts').upsert({
                        user_email: state.email,
                        trial_date: state.date,
                        day_number: state.dayNum,
                        subject: subject,
                        score: state.score || 0,
                        correct_count: state.correctCount || 0,
                        incorrect_count: state.incorrectCount || 0,
                        answers_json: state.answers || {},
                        is_completed: Boolean(state.completed),
                        completed_at: state.completed ? new Date().toISOString() : null,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_email,trial_date,subject' });
                }
            } catch (e) {
                // Silent catch, local cache is authoritative
            }
        }

        // =====================================================================
        // 4. DASHBOARD VIEW (Both DSA in C++ & HTML visible together)
        // =====================================================================

        renderDashboard(containerId = 'dailyQuizSection') {
            this.stopDailyTimer();
            const container = document.getElementById(containerId);
            if (!container) return;

            const dayNum = this.getKolkataDayNumber();
            const dateStr = this.getKolkataDisplayDate();

            const dsaState = this.getTrialState('dsa');
            const htmlState = this.getTrialState('html');

            const dsaMeta = this.getDayMeta('dsa');
            const htmlMeta = this.getDayMeta('html');

            const totalScore = (dsaState.score || 0) + (htmlState.score || 0);
            const totalAnswered = Object.keys(dsaState.answers || {}).length + Object.keys(htmlState.answers || {}).length;
            const totalCorrect = (dsaState.correctCount || 0) + (htmlState.correctCount || 0);
            const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
            const bothCompleted = Boolean(dsaState.completed && htmlState.completed);

            container.innerHTML = `
                <div class="dt-dashboard-wrapper scroll-reveal">
                    <!-- Main Header Banner -->
                    <div class="dt-main-banner">
                        <div class="dt-banner-top">
                            <span class="dt-badge-tag">⚡ ACADEMY DAILY TRIAL // ROTATION CYCLE</span>
                            <span class="dt-date-pill">📅 ${dateStr} • DAY ${dayNum} OF 7</span>
                        </div>
                        <h2 class="dt-banner-title">
                            <span>⚔️ DAILY SPEED TRIALS OF MASTERY</span>
                        </h2>
                        <p class="dt-banner-subtitle">
                            Every morning, two 5-question speed trials are unlocked across <strong>DSA in C++</strong> and <strong>Web HTML</strong>. 
                            Earn up to <strong>120 XP daily</strong> (+10 XP per single-correct, +20 XP per multi-select) while preserving your active academy study streak.
                        </p>

                        <!-- Overall Stats Strip -->
                        <div class="dt-summary-strip">
                            <div class="dt-stat-box">
                                <span class="dt-stat-icon">⚡</span>
                                <div>
                                    <div class="dt-stat-val" style="color: #00f0ff;">${totalScore} / 120 XP</div>
                                    <div class="dt-stat-lbl">Today's Total XP</div>
                                </div>
                            </div>
                            <div class="dt-stat-box">
                                <span class="dt-stat-icon">🎯</span>
                                <div>
                                    <div class="dt-stat-val" style="color: #10b981;">${totalAnswered} / 10</div>
                                    <div class="dt-stat-lbl">Questions Attempted</div>
                                </div>
                            </div>
                            <div class="dt-stat-box">
                                <span class="dt-stat-icon">📊</span>
                                <div>
                                    <div class="dt-stat-val" style="color: #a855f7;">${overallAccuracy}%</div>
                                    <div class="dt-stat-lbl">Overall Accuracy</div>
                                </div>
                            </div>
                            <div class="dt-stat-box">
                                <span class="dt-stat-icon">🔥</span>
                                <div>
                                    <div class="dt-stat-val" style="color: #f59e0b;">${bothCompleted ? '2/2 COMPLETED' : (dsaState.completed || htmlState.completed ? '1/2 IN PROGRESS' : '0/2 ACTIVE')}</div>
                                    <div class="dt-stat-lbl">Daily Status</div>
                                </div>
                            </div>
                        </div>

                        ${bothCompleted ? `
                            <div style="margin-top: 18px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 12px; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 28px;">🏆</span>
                                    <div>
                                        <strong style="color: #10b981; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">ALL DAILY TRIALS COMPLETED!</strong>
                                        <div style="font-size: 12.5px; color: #cbd5e1;">You conquered both DSA and HTML trials for today. Your daily study streak is securely extended!</div>
                                    </div>
                                </div>
                                <button type="button" class="btn-action-sm highlight" onclick="window.msotDailyTrial.renderDailyMasterSummary()">
                                    📊 VIEW COMBINED REPORT ➔
                                </button>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Category Cards Grid: DSA in C++ & HTML Web -->
                    <div class="dt-category-grid">
                        <!-- 1. DSA in C++ Category Card -->
                        ${this.renderCategoryCard('dsa', dsaState, dsaMeta)}

                        <!-- 2. HTML Web Category Card -->
                        ${this.renderCategoryCard('html', htmlState, htmlMeta)}
                    </div>
                </div>
            `;
        }

        renderCategoryCard(subject, state, meta) {
            const isDsa = subject === 'dsa';
            const icon = isDsa ? '⚡' : '🌐';
            const title = isDsa ? 'DSA in C++' : 'HTML & Web Architecture';
            const dayTitle = meta.title || `Day ${this.getKolkataDayNumber()}`;
            const questions = meta.questions || [];
            const totalQ = questions.length || 5;

            const answeredCount = Object.keys(state.answers || {}).length;
            const progressPct = Math.round((answeredCount / totalQ) * 100);

            let statusClass = 'notstarted';
            let statusLabel = 'NOT STARTED';
            if (state.completed) {
                statusClass = 'completed';
                statusLabel = 'COMPLETED ✓';
            } else if (answeredCount > 0) {
                statusClass = 'inprogress';
                statusLabel = `IN PROGRESS (${answeredCount}/${totalQ})`;
            }

            let btnText = 'START TRIAL ➔';
            let btnClass = 'dt-card-action-btn';
            let onClickAction = `window.msotDailyTrial.startTrial('${subject}')`;

            if (state.completed) {
                btnText = 'REVIEW TRIAL ANSWERS 📊';
                btnClass = 'dt-card-action-btn review-btn';
                onClickAction = `window.msotDailyTrial.renderResults('${subject}')`;
            } else if (answeredCount > 0) {
                btnText = 'CONTINUE TRIAL ➔';
            }

            return `
                <div class="dt-category-card ${subject}">
                    <div>
                        <div class="dt-card-header">
                            <div class="dt-card-hero">
                                <div class="dt-card-icon">${icon}</div>
                                <div class="dt-card-title-group">
                                    <h3>${title}</h3>
                                    <p class="dt-card-subtitle">${dayTitle}</p>
                                </div>
                            </div>
                            <span class="dt-status-chip ${statusClass}">${statusLabel}</span>
                        </div>

                        <!-- Progress Meter -->
                        <div class="dt-card-meter-box">
                            <div class="dt-meter-top">
                                <span>Progress (${answeredCount}/${totalQ} Questions)</span>
                                <strong>${progressPct}%</strong>
                            </div>
                            <div class="dt-meter-track">
                                <div class="dt-meter-fill" style="width: ${progressPct}%;"></div>
                            </div>
                        </div>

                        <!-- Spec Pills -->
                        <div class="dt-card-specs">
                            <div class="dt-spec-pill">
                                <span>🎯 Questions:</span>
                                <strong>5 Today</strong>
                            </div>
                            <div class="dt-spec-pill">
                                <span>⚡ Score:</span>
                                <strong>${state.score || 0} / 60 XP</strong>
                            </div>
                            <div class="dt-spec-pill">
                                <span>📋 Format:</span>
                                <strong>4 Single + 1 Multi</strong>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button type="button" class="${btnClass}" onclick="${onClickAction}">
                            ${btnText}
                        </button>
                    </div>
                </div>
            `;
        }

        // =====================================================================
        // 5. ACTIVE TRIAL RUNNER (Single & Multi-Select Logic)
        // =====================================================================

        startTrial(subject) {
            this.activeSubject = subject;
            const state = this.getTrialState(subject);

            if (!state.startedAt) {
                state.startedAt = Date.now();
                this.saveTrialState(subject, state);
            }

            // Find first unanswered question or start from beginning
            const questions = this.getQuestionsForToday(subject);
            let nextIndex = 0;
            for (let i = 0; i < questions.length; i++) {
                if (!state.answers[questions[i].id]) {
                    nextIndex = i;
                    break;
                }
            }

            if (state.completed) {
                this.renderResults(subject);
                return;
            }

            this.activeQuestionIndex = nextIndex;
            this.renderQuestion();
            if (window.miraiAudio) window.miraiAudio.playClick?.();
        }

        renderQuestion() {
            const container = document.getElementById('dailyQuizSection');
            if (!container) return;

            const subject = this.activeSubject;
            const questions = this.getQuestionsForToday(subject);
            const q = questions[this.activeQuestionIndex];
            if (!q) {
                this.finishTrial(subject);
                return;
            }

            const state = this.getTrialState(subject);
            const totalQ = questions.length || 5;
            const qNum = this.activeQuestionIndex + 1;
            const isMulti = q.type === 'multiple';

            // Check if already answered
            const prevAnswer = state.answers[q.id];
            this.questionAnswered = Boolean(prevAnswer);
            this.selectedOptions = prevAnswer ? [...prevAnswer.selected] : [];

            const isDsa = subject === 'dsa';
            const subjectTitle = isDsa ? 'DSA in C++' : 'HTML Web Architecture';
            const subjectIcon = isDsa ? '⚡' : '🌐';
            const maxXP = isMulti ? 20 : 10;

            container.innerHTML = `
                <div class="dt-runner-container scroll-reveal">
                    <!-- Top Navigation & Status -->
                    <div class="dt-runner-nav">
                        <button type="button" class="dt-runner-back-btn" onclick="window.msotDailyTrial.renderDashboard()">
                            ‹ EXIT TO DASHBOARD
                        </button>
                        <div class="dt-runner-badges-row">
                            <span class="dt-q-step-badge">${subjectIcon} ${subjectTitle} // Q${qNum} of ${totalQ}</span>
                            <span class="dt-q-type-chip ${isMulti ? 'multiple' : 'single'}">
                                ${isMulti ? '☑️ MULTI-SELECT (+20 XP)' : '🔘 SINGLE-CORRECT (+10 XP)'}
                            </span>
                        </div>
                        <div id="dailyTimerDisplay" class="daily-trial-timer pulse-glow" title="45-Second Rapid Lock Timer">
                            ⏱️ 00:45
                        </div>
                        <div style="font-family: var(--font-mono, monospace); font-size: 13px; font-weight: 800; color: #00f0ff;">
                            SCORE: ${state.score || 0} XP
                        </div>
                    </div>

                    <!-- Progress Track -->
                    <div class="dt-meter-track" style="margin-top: -6px;">
                        <div class="dt-meter-fill" style="width: ${Math.round(((qNum - 1) / totalQ) * 100)}%;"></div>
                    </div>

                    <!-- Question Prompt Card -->
                    <div class="dt-prompt-card">
                        <h3 class="dt-prompt-title">${this.escapeHtml(q.prompt)}</h3>
                        ${q.code ? `
                            <pre class="dt-code-snippet"><code>${this.escapeHtml(q.code)}</code></pre>
                        ` : ''}
                        ${isMulti ? `
                            <div class="dt-multi-select-notice">
                                <span>⚠️</span>
                                <strong>Select all correct options.</strong> You must select all correct answers and no incorrect ones to earn full points.
                            </div>
                        ` : ''}
                    </div>

                    <!-- Options List -->
                    <div class="dt-options-list" id="dtOptionsList">
                        ${q.options.map((optText, idx) => {
                            const optLetter = String.fromCharCode(65 + idx); // 'A', 'B', 'C', 'D'
                            const isSelected = this.selectedOptions.includes(optLetter);
                            let statusClass = '';

                            if (this.questionAnswered) {
                                statusClass += ' locked';
                                const isCorrectOpt = q.correct.includes(optLetter);
                                if (isCorrectOpt) {
                                    statusClass += ' correct';
                                } else if (isSelected && !isCorrectOpt) {
                                    statusClass += ' incorrect';
                                }
                            } else if (isSelected) {
                                statusClass += ' selected';
                            }

                            return `
                                <div class="dt-option-item ${statusClass}" 
                                     data-opt="${optLetter}" 
                                     onclick="window.msotDailyTrial.toggleOption('${optLetter}')">
                                    <div class="dt-opt-indicator">
                                        ${this.questionAnswered
                                            ? (q.correct.includes(optLetter) ? '✓' : (isSelected ? '✕' : optLetter))
                                            : (isMulti ? (isSelected ? '☑' : '□') : optLetter)
                                        }
                                    </div>
                                    <div class="dt-opt-text">
                                        <strong>${optLetter}.</strong> ${this.escapeHtml(optText)}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <!-- Feedback Box (After Submission) -->
                    <div id="dtFeedbackContainer">
                        ${this.questionAnswered ? this.renderFeedbackHtml(q, prevAnswer) : ''}
                    </div>

                    <!-- Action Buttons -->
                    <div class="dt-runner-actions">
                        ${!this.questionAnswered ? `
                            <button type="button" class="dt-submit-btn" id="dtSubmitBtn" 
                                    onclick="window.msotDailyTrial.submitAnswer()" 
                                    ${this.selectedOptions.length === 0 ? 'disabled' : ''}>
                                SUBMIT ANSWER ✓
                            </button>
                        ` : `
                            <button type="button" class="dt-next-btn" onclick="window.msotDailyTrial.nextQuestion()">
                                ${qNum < totalQ ? 'NEXT QUESTION ➔' : 'VIEW TRIAL RESULTS 🏆'}
                            </button>
                        `}
                    </div>
                </div>
            `;

            // Start or stop 45s countdown timer based on question status
            if (!this.questionAnswered) {
                this.startDailyTimer(45);
            } else {
                this.stopDailyTimer();
            }
        }

        // =====================================================================
        // 45-SECOND COUNTDOWN TIMER & AUTO-SUBMIT LOGIC
        // =====================================================================

        startDailyTimer(totalSeconds = 45) {
            this.stopDailyTimer();
            this.timeRemaining = totalSeconds;
            this.updateTimerDisplay();

            this.timerInterval = setInterval(() => {
                this.timeRemaining--;
                this.updateTimerDisplay();

                if (this.timeRemaining <= 0) {
                    this.stopDailyTimer();
                    this.handleTimeExpired();
                }
            }, 1000);
        }

        stopDailyTimer() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        }

        updateTimerDisplay() {
            const timerEl = document.getElementById('dailyTimerDisplay');
            if (!timerEl) return;
            const seconds = Math.max(0, this.timeRemaining);
            const minsStr = String(Math.floor(seconds / 60)).padStart(2, '0');
            const secsStr = String(seconds % 60).padStart(2, '0');
            timerEl.textContent = `⏱️ ${minsStr}:${secsStr}`;

            if (seconds <= 10) {
                timerEl.classList.add('timer-warning');
            } else {
                timerEl.classList.remove('timer-warning');
            }
        }

        handleTimeExpired() {
            if (this.questionAnswered) return;

            // 1. Lock all question inputs immediately
            const listEl = document.getElementById('dtOptionsList');
            if (listEl) {
                listEl.querySelectorAll('.dt-option-item').forEach(item => {
                    item.classList.add('locked');
                });
            }
            const submitBtn = document.getElementById('dtSubmitBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
            }

            // 2. Audio cue
            if (window.miraiAudio && window.miraiAudio.playWrong) {
                window.miraiAudio.playWrong();
            }

            // 3. Auto-submit logic
            if (this.selectedOptions && this.selectedOptions.length > 0) {
                this.submitAnswer();
            } else {
                this.autoSubmitTimeoutAnswer();
            }
        }

        autoSubmitTimeoutAnswer() {
            if (this.questionAnswered) return;
            const subject = this.activeSubject;
            const questions = this.getQuestionsForToday(subject);
            const q = questions[this.activeQuestionIndex];
            if (!q) return;

            const state = this.getTrialState(subject);

            // Record timed-out answer with 0 XP
            state.answers[q.id] = {
                selected: [],
                isCorrect: false,
                xp: 0,
                timedOut: true,
                answeredAt: new Date().toISOString()
            };
            state.incorrectCount = (state.incorrectCount || 0) + 1;

            const totalQ = questions.length || 5;
            if (Object.keys(state.answers).length >= totalQ) {
                state.completed = true;
                state.completedAt = Date.now();
                this.awardStudentPlatformXP(subject, state);
            }

            this.saveTrialState(subject, state);
            this.questionAnswered = true;
            this.renderQuestion();
        }

        toggleOption(optLetter) {
            if (this.questionAnswered) return;

            const questions = this.getQuestionsForToday(this.activeSubject);
            const q = questions[this.activeQuestionIndex];
            const isMulti = q.type === 'multiple';

            if (isMulti) {
                // Checkbox toggle
                const idx = this.selectedOptions.indexOf(optLetter);
                if (idx !== -1) {
                    this.selectedOptions.splice(idx, 1);
                } else {
                    this.selectedOptions.push(optLetter);
                }
            } else {
                // Radio toggle
                this.selectedOptions = [optLetter];
            }

            if (window.miraiAudio) window.miraiAudio.playClick?.();

            // Re-render option states
            const listEl = document.getElementById('dtOptionsList');
            if (listEl) {
                const items = listEl.querySelectorAll('.dt-option-item');
                items.forEach(item => {
                    const letter = item.getAttribute('data-opt');
                    const isSel = this.selectedOptions.includes(letter);
                    item.className = `dt-option-item ${isSel ? 'selected' : ''}`;
                    const ind = item.querySelector('.dt-opt-indicator');
                    if (ind) {
                        ind.textContent = isMulti ? (isSel ? '☑' : '□') : letter;
                    }
                });
            }

            // Enable/disable submit button
            const submitBtn = document.getElementById('dtSubmitBtn');
            if (submitBtn) {
                submitBtn.disabled = this.selectedOptions.length === 0;
            }
        }

        submitAnswer() {
            this.stopDailyTimer();
            if (this.questionAnswered || this.selectedOptions.length === 0) return;

            const subject = this.activeSubject;
            const questions = this.getQuestionsForToday(subject);
            const q = questions[this.activeQuestionIndex];
            const isMulti = q.type === 'multiple';

            // Evaluate correctness
            const userSorted = [...this.selectedOptions].sort();
            const correctSorted = [...q.correct].sort();
            const isCorrect = userSorted.length === correctSorted.length && 
                              userSorted.every((val, index) => val === correctSorted[index]);

            const xpEarned = isCorrect ? (isMulti ? 20 : 10) : 0;

            const state = this.getTrialState(subject);

            // Record answer
            state.answers[q.id] = {
                selected: userSorted,
                isCorrect: isCorrect,
                xp: xpEarned,
                answeredAt: new Date().toISOString()
            };

            state.score = (state.score || 0) + xpEarned;
            if (isCorrect) {
                state.correctCount = (state.correctCount || 0) + 1;
            } else {
                state.incorrectCount = (state.incorrectCount || 0) + 1;
            }

            // Check if this was the final question
            const totalQ = questions.length || 5;
            if (Object.keys(state.answers).length >= totalQ) {
                state.completed = true;
                state.completedAt = Date.now();
                this.awardStudentPlatformXP(subject, state);
            }

            this.saveTrialState(subject, state);
            this.questionAnswered = true;

            // Audio feedback
            if (window.miraiAudio) {
                if (isCorrect) window.miraiAudio.playCorrect?.();
                else window.miraiAudio.playWrong?.();
            }

            // Re-render question to locked state with explanations
            this.renderQuestion();
        }

        renderFeedbackHtml(q, answerRecord) {
            const isCorrect = answerRecord.isCorrect;
            const correctStr = q.correct.join(', ');

            return `
                <div class="dt-feedback-box ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="dt-feedback-title">
                        <span>${isCorrect ? '✅ EXCELLENT! CORRECT ANSWER' : (answerRecord.timedOut ? '⏱️ TIME EXPIRED! (+0 XP)' : '❌ INCORRECT')}</span>
                        <span style="font-size: 13px; font-weight: 800; font-family: var(--font-mono, monospace);">
                            ${isCorrect ? `+${answerRecord.xp} XP AWARDED` : '+0 XP'}
                        </span>
                    </div>
                    <div class="dt-feedback-answer">
                        Correct Answer Key: <strong>${correctStr}</strong>
                    </div>
                    <p class="dt-feedback-explain">
                        <strong>Explanation:</strong> ${this.escapeHtml(q.explanation || 'Verified syllabus concept.')}
                    </p>
                </div>
            `;
        }

        nextQuestion() {
            const questions = this.getQuestionsForToday(this.activeSubject);
            if (this.activeQuestionIndex < questions.length - 1) {
                this.activeQuestionIndex++;
                this.questionAnswered = false;
                this.selectedOptions = [];
                this.renderQuestion();
            } else {
                this.finishTrial(this.activeSubject);
            }
        }

        // =====================================================================
        // 6. SCORING, XP & COMPLETION
        // =====================================================================

        awardStudentPlatformXP(subject, state) {
            if (state.xpAwarded) return;
            state.xpAwarded = true;

            const xpAmount = state.score || 0;
            const subjectName = subject === 'dsa' ? 'C++ DSA' : 'HTML Web';

            if (window.msotState && xpAmount > 0) {
                if (typeof window.msotState.awardXP === 'function') {
                    window.msotState.awardXP('DAILY_QUIZ', xpAmount, `Daily Trial: ${subjectName} Mastery`);
                } else if (typeof window.msotState.recordXP === 'function') {
                    window.msotState.recordXP('DAILY_QUIZ', xpAmount, `Daily Trial: ${subjectName} Mastery`);
                }

                // Preserve streak
                if (window.msotState.student) {
                    window.msotState.student.lastDailyQuizDate = new Date().toLocaleDateString();
                    window.msotState.save();
                }
            }

            // Update UI HUD
            if (window.msotPlatform && typeof window.msotPlatform.updateHeaderStats === 'function') {
                window.msotPlatform.updateHeaderStats();
            }
        }

        finishTrial(subject) {
            this.stopDailyTimer();
            const state = this.getTrialState(subject);
            state.completed = true;
            if (!state.completedAt) state.completedAt = Date.now();
            this.awardStudentPlatformXP(subject, state);
            this.saveTrialState(subject, state);

            if (window.miraiAudio) window.miraiAudio.playBadgeFanfare?.();
            this.renderResults(subject);
        }

        // =====================================================================
        // 7. RESULTS SCREEN & QUESTION-WISE REVIEW
        // =====================================================================

        renderResults(subject) {
            const container = document.getElementById('dailyQuizSection');
            if (!container) return;

            const state = this.getTrialState(subject);
            const questions = this.getQuestionsForToday(subject);
            const totalQ = questions.length || 5;
            const isDsa = subject === 'dsa';
            const subjectTitle = isDsa ? 'DSA in C++' : 'HTML & Web Architecture';
            const subjectIcon = isDsa ? '⚡' : '🌐';

            const correct = state.correctCount || 0;
            const incorrect = state.incorrectCount || 0;
            const accuracy = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
            const score = state.score || 0;

            let timeElapsedStr = '1m 15s';
            if (state.startedAt && state.completedAt) {
                const diffMs = Math.max(1000, state.completedAt - state.startedAt);
                const secs = Math.floor(diffMs / 1000);
                const m = Math.floor(secs / 60);
                const s = secs % 60;
                timeElapsedStr = m > 0 ? `${m}m ${s}s` : `${s}s`;
            }

            container.innerHTML = `
                <div class="dt-results-card scroll-reveal">
                    <div class="dt-results-header">
                        <div class="dt-results-icon">${subjectIcon}</div>
                        <h2 class="dt-results-title">${subjectTitle}: Trial Cleared!</h2>
                        <p class="dt-results-subtitle">Day ${state.dayNum || 1} Assessment Completed • Results recorded in live audit ledger</p>
                    </div>

                    <!-- Metrics Grid -->
                    <div class="dt-results-grid">
                        <div class="dt-result-stat-box">
                            <div class="r-val" style="color: #00f0ff;">+${score} XP</div>
                            <div class="r-lbl">Total XP Earned</div>
                        </div>
                        <div class="dt-result-stat-box">
                            <div class="r-val" style="color: #10b981;">${correct} / ${totalQ}</div>
                            <div class="r-lbl">Correct Answers</div>
                        </div>
                        <div class="dt-result-stat-box">
                            <div class="r-val" style="color: #ef4444;">${incorrect} / ${totalQ}</div>
                            <div class="r-lbl">Incorrect Answers</div>
                        </div>
                        <div class="dt-result-stat-box">
                            <div class="r-val" style="color: #a855f7;">${accuracy}%</div>
                            <div class="r-lbl">Accuracy Rating</div>
                        </div>
                        <div class="dt-result-stat-box">
                            <div class="r-val" style="color: #f59e0b;">${timeElapsedStr}</div>
                            <div class="r-lbl">Completion Time</div>
                        </div>
                    </div>

                    <!-- Question-Wise Answer Review -->
                    <div class="dt-review-deck">
                        <div class="dt-review-header">📋 DETAILED QUESTION-WISE PERFORMANCE REVIEW:</div>
                        ${questions.map((q, idx) => {
                            const ans = state.answers[q.id] || { selected: [], isCorrect: false };
                            const isPass = ans.isCorrect;
                            const userAnsStr = ans.selected.length > 0 ? ans.selected.join(', ') : 'Not Answered';
                            const correctStr = q.correct.join(', ');

                            return `
                                <div class="dt-review-item ${isPass ? 'pass' : 'fail'}">
                                    <div class="dt-review-q-title">
                                        Q${idx + 1}. ${this.escapeHtml(q.prompt)}
                                    </div>
                                    <div class="dt-review-answer-line">
                                        Your Choice: <strong>${userAnsStr}</strong> 
                                        ${isPass ? '🟢 (Correct)' : '🔴 (Incorrect)'} • 
                                        Correct Key: <strong>${correctStr}</strong>
                                    </div>
                                    <div class="dt-review-explain">
                                        💡 ${this.escapeHtml(q.explanation || 'Verified syllabus concept.')}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <!-- Actions -->
                    <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-top: 10px;">
                        <button type="button" class="primary-btn pulse-glow" onclick="window.msotDailyTrial.renderDashboard()">
                            ➔ RETURN TO DAILY DASHBOARD
                        </button>
                    </div>
                </div>
            `;
        }

        renderDailyMasterSummary() {
            const dsa = this.getTrialState('dsa');
            const html = this.getTrialState('html');
            const container = document.getElementById('dailyQuizSection');
            if (!container) return;

            const totalScore = (dsa.score || 0) + (html.score || 0);
            const totalCorrect = (dsa.correctCount || 0) + (html.correctCount || 0);

            container.innerHTML = `
                <div class="dt-results-card scroll-reveal">
                    <div class="dt-results-header">
                        <div class="dt-results-icon">🏆✨</div>
                        <h2 class="dt-results-title">DAILY ACADEMY MASTER SUMMARY</h2>
                        <p class="dt-results-subtitle">Complete daily telemetry for ${this.getKolkataDisplayDate()}</p>
                    </div>

                    <div class="dt-results-grid">
                        <div class="dt-result-stat-box">
                            <div class="r-val" style="color: #00f0ff;">${totalScore} / 120 XP</div>
                            <div class="r-lbl">Combined Daily XP</div>
                        </div>
                        <div class="dt-result-stat-box">
                            <div class="r-val" style="color: #10b981;">${totalCorrect} / 10</div>
                            <div class="r-lbl">Total Correct Solved</div>
                        </div>
                        <div class="dt-result-stat-box">
                            <div class="r-val" style="color: #a855f7;">${Math.round((totalCorrect / 10) * 100)}%</div>
                            <div class="r-lbl">Combined Accuracy</div>
                        </div>
                        <div class="dt-result-stat-box">
                            <div class="r-val" style="color: #f59e0b;">🔥 PRESERVED</div>
                            <div class="r-lbl">Study Streak</div>
                        </div>
                    </div>

                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 18px 24px; margin-top: 10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <span>⚡ DSA in C++:</span>
                            <strong style="color:#00f0ff;">${dsa.score || 0} / 60 XP (${dsa.correctCount || 0}/5 Correct)</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span>🌐 HTML Web:</span>
                            <strong style="color:#f59e0b;">${html.score || 0} / 60 XP (${html.correctCount || 0}/5 Correct)</strong>
                        </div>
                    </div>

                    <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-top: 10px;">
                        <button type="button" class="primary-btn" onclick="window.msotDailyTrial.renderDashboard()">
                            ➔ RETURN TO DASHBOARD
                        </button>
                    </div>
                </div>
            `;
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
    }

    // Initialize globally
    window.msotDailyTrial = new DailyTrialSystem();

    // Auto-mount when document is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.msotDailyTrial.renderDashboard();
        });
    } else {
        window.msotDailyTrial.renderDashboard();
    }
})();
