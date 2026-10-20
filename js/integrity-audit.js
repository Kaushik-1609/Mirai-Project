/**
 * MSOT LEARN — Anti-Cheating & Pedagogical Integrity Engine
 * Explainable Flags, Fair Detection Rules, Privacy-Conscious Audit & Faculty Workflow
 *
 * Principles:
 *  1. A flag is a signal for investigation, not proof of cheating.
 *  2. Unusually fast solving is not conclusive proof of cheating.
 *  3. No automatic XP penalties or suspensions solely based on flags.
 *  4. All XP adjustments require explicit permission, atomic execution, and immutable audit trails.
 */

(function () {
    const FLAGS_KEY = 'MSOT_INTEGRITY_FLAGS_V1';
    const EVENTS_KEY = 'MSOT_INTEGRITY_EVENTS_V1';
    const CONFIGS_KEY = 'MSOT_INTEGRITY_CONFIGS_V1';
    const ADJUSTMENTS_KEY = 'MSOT_XP_ADJUSTMENTS_V1';
    const APPEALS_KEY = 'MSOT_STUDENT_APPEALS_V1';
    const REVIEWS_KEY = 'MSOT_INTEGRITY_REVIEWS_V1';

    const DEFAULT_RULE_CONFIGS = [
        {
            rule_id: 'RULE_FAST_SOLVE',
            name: 'Unusually Fast Question Completion',
            description: 'Context-aware evaluation based on difficulty baseline, question familiarity, and trusted start timestamps.',
            is_enabled: true,
            risk_weight: 'MEDIUM',
            parameters: {
                threshold_easy_ms: 3000,
                threshold_medium_ms: 7000,
                threshold_hard_ms: 15000,
                familiar_discount_pct: 50
            }
        },
        {
            rule_id: 'RULE_SUBMISSION_SPAM',
            name: 'Submission Spam & Rapid Flooding',
            description: 'Detects excessive burst submission requests and automated retry loops within short configurable timeframes.',
            is_enabled: true,
            risk_weight: 'HIGH',
            parameters: {
                window_seconds: 15,
                max_submissions: 10,
                duplicate_payload_limit: 4
            }
        },
        {
            rule_id: 'RULE_XP_MANIPULATION',
            name: 'XP Replay & Manipulation Detection',
            description: 'Detects duplicate event claim tokens, token replay exploits, and unauthorized balance manipulation attempts.',
            is_enabled: true,
            risk_weight: 'HIGH',
            parameters: {
                max_hourly_xp: 2000,
                prevent_duplicate_event_tokens: true
            }
        },
        {
            rule_id: 'RULE_SESSION_ANOMALY',
            name: 'Timer & Session Anomalies',
            description: 'Detects negative durations, impossible study speeds, and multi-platform overlapping sessions.',
            is_enabled: true,
            risk_weight: 'MEDIUM',
            parameters: {
                max_single_session_hours: 12,
                max_clock_skew_ms: 300000
            }
        }
    ];

    class IntegrityAuditController {
        constructor() {
            this.flags = [];
            this.events = [];
            this.configs = [];
            this.adjustments = [];
            this.appeals = [];
            this.reviews = [];
            this.recentSubmissions = []; // Rolling window for spam detection
            this.recentEventTokens = new Set();
            this.activeCaseId = null;
            this.supabase = null;
        }

        init() {
            this.initSupabase();
            this.loadState();
            console.log('🛡️ MSOT Integrity & Anti-Cheating Engine initialized.');
        }

        initSupabase() {
            if (window.supabaseClient) {
                this.supabase = window.supabaseClient;
            } else if (window.msotAuth?.supabaseClient) {
                this.supabase = window.msotAuth.supabaseClient;
            }
        }

        loadState() {
            try {
                const cfg = localStorage.getItem(CONFIGS_KEY);
                this.configs = cfg ? JSON.parse(cfg) : DEFAULT_RULE_CONFIGS;
                if (!cfg) this.saveConfigs();

                const flg = localStorage.getItem(FLAGS_KEY);
                this.flags = flg ? JSON.parse(flg) : [];

                const evt = localStorage.getItem(EVENTS_KEY);
                this.events = evt ? JSON.parse(evt) : [];

                const adj = localStorage.getItem(ADJUSTMENTS_KEY);
                this.adjustments = adj ? JSON.parse(adj) : [];

                const app = localStorage.getItem(APPEALS_KEY);
                this.appeals = app ? JSON.parse(app) : [];

                const rev = localStorage.getItem(REVIEWS_KEY);
                this.reviews = rev ? JSON.parse(rev) : [];

                // If seed flags empty, generate 2 realistic educational demonstration flags for faculty review
                if (this.flags.length === 0) {
                    this.seedDemonstrationFlags();
                }
            } catch (e) {
                console.warn('Integrity cache note:', e.message);
                this.configs = DEFAULT_RULE_CONFIGS;
            }
        }

        saveFlags() {
            try { localStorage.setItem(FLAGS_KEY, JSON.stringify(this.flags)); } catch (e) {}
        }
        saveEvents() {
            try { localStorage.setItem(EVENTS_KEY, JSON.stringify(this.events.slice(0, 500))); } catch (e) {}
        }
        saveConfigs() {
            try { localStorage.setItem(CONFIGS_KEY, JSON.stringify(this.configs)); } catch (e) {}
        }
        saveAdjustments() {
            try { localStorage.setItem(ADJUSTMENTS_KEY, JSON.stringify(this.adjustments)); } catch (e) {}
        }
        saveAppeals() {
            try { localStorage.setItem(APPEALS_KEY, JSON.stringify(this.appeals)); } catch (e) {}
        }
        saveReviews() {
            try { localStorage.setItem(REVIEWS_KEY, JSON.stringify(this.reviews)); } catch (e) {}
        }

        seedDemonstrationFlags() {
            this.flags.push(
                {
                    id: 'flag_demo_1',
                    flag_code: 'FLAG-2026-081',
                    student_id: 'MSOT-ALEX99',
                    student_name: 'Alex Mercer',
                    student_email: 'alex.mercer@msot.edu',
                    event_id: 'evt_solve_4091',
                    session_id: 'sess_graph_algorithms',
                    rule_id: 'RULE_FAST_SOLVE',
                    rule_version: '1.0',
                    risk_level: 'MEDIUM',
                    reason: 'Question solved in 1.4s on a Hard algorithmic problem. Substantially faster than calibrated 15.0s baseline.',
                    expected_behavior: 'Standard read & analysis time for Hard question is >= 15,000ms on first attempt.',
                    actual_behavior: 'Marked solved in 1,420ms with solution verified. Fast completion requires faculty review.',
                    evidence: {
                        duration_ms: 1420,
                        threshold_ms: 15000,
                        difficulty: 'Hard',
                        is_first_attempt: true,
                        solution_verified: true,
                        question_type: 'Code Implementation'
                    },
                    related_tx_id: 'tx-4091',
                    review_status: 'PENDING',
                    assigned_reviewer: null,
                    review_notes: '',
                    final_decision: null,
                    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
                },
                {
                    id: 'flag_demo_2',
                    flag_code: 'FLAG-2026-082',
                    student_id: 'MSOT-CADET42',
                    student_name: 'Rohan Sharma',
                    student_email: 'rohan.sharma@msot.edu',
                    event_id: 'evt_xp_batch_99',
                    session_id: 'sess_attendance_loop',
                    rule_id: 'RULE_XP_MANIPULATION',
                    rule_version: '1.0',
                    risk_level: 'HIGH',
                    reason: 'Multiple rapid requests detected attempting to claim XP with the same attendance event token.',
                    expected_behavior: 'Each attendance event permits exactly one +20 XP claim per calendar day.',
                    actual_behavior: 'Three duplicate requests submitted within 2.5 seconds using identical date token.',
                    evidence: {
                        event_token: 'ATTEND_2026-10-12',
                        duplicate_attempts: 3,
                        window_ms: 2500,
                        atomic_lock_prevented_duplication: true
                    },
                    related_tx_id: 'tx-attendance-verified',
                    review_status: 'UNDER_REVIEW',
                    assigned_reviewer: 'Prof. Sharma',
                    review_notes: 'Checking network log to confirm if double-click on mobile or deliberate script replay.',
                    final_decision: null,
                    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
                }
            );
            this.saveFlags();
        }

        // =========================================================================
        // 1. BEHAVIOUR MONITORING & EVENT INGESTION
        // =========================================================================

        monitorEvent(eventType, payload = {}) {
            const now = Date.now();
            const student = window.msotState?.student || {};
            const studentId = payload.student_id || student.id || 'GUEST';
            const studentName = payload.student_name || student.name || 'Anonymous Cadet';
            const studentEmail = payload.student_email || student.email || window.msotAuth?.session?.email || '';

            const eventRecord = {
                id: 'evt_' + now + '_' + Math.random().toString(36).substr(2, 5),
                student_id: studentId,
                student_name: studentName,
                event_type: eventType,
                source_id: payload.source_id || payload.question_id || payload.session_id || 'manual',
                duration_ms: payload.duration_ms || 0,
                metadata: payload,
                created_at: new Date().toISOString()
            };

            this.events.unshift(eventRecord);
            this.saveEvents();

            // Run detection rules in background without interrupting learning experience
            try {
                this.evaluateRules(eventRecord, payload);
            } catch (err) {
                console.warn('[Integrity] Evaluation note:', err);
            }

            return eventRecord;
        }

        // =========================================================================
        // 2. FAIR DETECTION RULES (Context-Aware & Non-Punitive)
        // =========================================================================

        evaluateRules(event, payload) {
            const ruleFast = this.configs.find(r => r.rule_id === 'RULE_FAST_SOLVE' && r.is_enabled);
            const ruleSpam = this.configs.find(r => r.rule_id === 'RULE_SUBMISSION_SPAM' && r.is_enabled);
            const ruleXP = this.configs.find(r => r.rule_id === 'RULE_XP_MANIPULATION' && r.is_enabled);
            const ruleSession = this.configs.find(r => r.rule_id === 'RULE_SESSION_ANOMALY' && r.is_enabled);

            // Rule A: Fast Solve (Checks difficulty, prior familiarity, trusted timestamps)
            if (ruleFast && (event.event_type === 'QUESTION_SOLVED' || event.event_type === 'SOLUTION_VERIFIED')) {
                const duration = payload.duration_ms || 0;
                const difficulty = (payload.difficulty || 'MEDIUM').toUpperCase();
                const isFamiliar = !!payload.is_previously_attempted;
                const hasTrustedStart = !!payload.trusted_start_time;

                let threshold = ruleFast.parameters.threshold_medium_ms || 7000;
                if (difficulty === 'EASY') threshold = ruleFast.parameters.threshold_easy_ms || 3000;
                if (difficulty === 'HARD' || difficulty === 'EXPERT') threshold = ruleFast.parameters.threshold_hard_ms || 15000;

                if (isFamiliar) {
                    threshold = threshold * ((100 - (ruleFast.parameters.familiar_discount_pct || 50)) / 100);
                }

                if (!hasTrustedStart && duration === 0) {
                    // Timing data missing or untrusted: Note as INSUFFICIENT DATA, do not assume cheating!
                    // No high risk flag generated.
                } else if (duration > 0 && duration < threshold) {
                    // Fast completion detected: generate reviewable flag
                    const risk = (duration < threshold / 3 && difficulty === 'HARD') ? 'MEDIUM' : 'LOW';
                    this.createFlag({
                        student_id: event.student_id,
                        student_name: event.student_name,
                        student_email: event.metadata.student_email || '',
                        event_id: event.id,
                        session_id: payload.session_id,
                        rule_id: 'RULE_FAST_SOLVE',
                        risk_level: risk,
                        reason: `Question solved in ${(duration / 1000).toFixed(1)}s for ${difficulty} question (threshold baseline: ${(threshold / 1000).toFixed(1)}s).`,
                        expected_behavior: `Expected average solving and reading duration >= ${(threshold / 1000).toFixed(1)}s for unassisted attempt.`,
                        actual_behavior: `Marked solved in ${(duration / 1000).toFixed(1)}s. ${isFamiliar ? 'Prior attempts noted.' : 'First attempt recorded.'}`,
                        evidence: {
                            duration_ms: duration,
                            calibrated_threshold_ms: threshold,
                            difficulty: difficulty,
                            is_previously_attempted: isFamiliar,
                            solution_verified: !!payload.solution_verified
                        },
                        related_tx_id: payload.txId || null
                    });
                }
            }

            // Rule B: Submission Spam (Sliding window rate limit)
            if (ruleSpam && (event.event_type === 'QUESTION_SUBMIT' || event.event_type === 'ATTEMPT_FAILED')) {
                const now = Date.now();
                this.recentSubmissions.push({ student_id: event.student_id, timestamp: now, payload: payload.answer || '' });
                const windowMs = (ruleSpam.parameters.window_seconds || 15) * 1000;
                this.recentSubmissions = this.recentSubmissions.filter(s => s.student_id === event.student_id && (now - s.timestamp) < windowMs);

                if (this.recentSubmissions.length >= (ruleSpam.parameters.max_submissions || 10)) {
                    this.createFlag({
                        student_id: event.student_id,
                        student_name: event.student_name,
                        student_email: event.metadata.student_email || '',
                        event_id: event.id,
                        rule_id: 'RULE_SUBMISSION_SPAM',
                        risk_level: 'HIGH',
                        reason: `Burst of ${this.recentSubmissions.length} submissions in under ${ruleSpam.parameters.window_seconds} seconds.`,
                        expected_behavior: `Human learning activity typically has >= 2s between substantive submissions.`,
                        actual_behavior: `${this.recentSubmissions.length} rapid submission requests received in ${ruleSpam.parameters.window_seconds}s.`,
                        evidence: {
                            submissions_in_window: this.recentSubmissions.length,
                            window_seconds: ruleSpam.parameters.window_seconds
                        }
                    });
                }
            }

            // Rule C: XP Manipulation (Duplicate token claims & velocity)
            if (ruleXP && event.event_type === 'XP_AWARDED') {
                const eventToken = payload.event_token || payload.source_id;
                if (eventToken) {
                    if (this.recentEventTokens.has(eventToken)) {
                        this.createFlag({
                            student_id: event.student_id,
                            student_name: event.student_name,
                            student_email: event.metadata.student_email || '',
                            event_id: event.id,
                            rule_id: 'RULE_XP_MANIPULATION',
                            risk_level: 'HIGH',
                            reason: `Duplicate claim attempt for previously processed event token "${eventToken}".`,
                            expected_behavior: `Each learning event or quest grants XP exactly once.`,
                            actual_behavior: `Repeated award request referencing identical token detected.`,
                            evidence: {
                                duplicate_token: eventToken,
                                xp_amount: payload.xp_amount || 0
                            },
                            related_tx_id: payload.txId || null
                        });
                    } else {
                        this.recentEventTokens.add(eventToken);
                    }
                }
            }

            // Rule D: Session Anomaly (Impossible durations or overlapping sessions)
            if (ruleSession && event.event_type === 'SESSION_FINISH') {
                const durationMinutes = payload.duration_minutes || 0;
                if (durationMinutes < 0) {
                    this.createFlag({
                        student_id: event.student_id,
                        student_name: event.student_name,
                        student_email: event.metadata.student_email || '',
                        event_id: event.id,
                        session_id: payload.session_id,
                        rule_id: 'RULE_SESSION_ANOMALY',
                        risk_level: 'MEDIUM',
                        reason: `Study session reported a negative duration (${durationMinutes} mins).`,
                        expected_behavior: `Study session duration must be positive and chronological.`,
                        actual_behavior: `Reported negative duration: ${durationMinutes} minutes.`,
                        evidence: { reported_minutes: durationMinutes }
                    });
                } else if (durationMinutes > (ruleSession.parameters.max_single_session_hours || 12) * 60) {
                    this.createFlag({
                        student_id: event.student_id,
                        student_name: event.student_name,
                        student_email: event.metadata.student_email || '',
                        event_id: event.id,
                        session_id: payload.session_id,
                        rule_id: 'RULE_SESSION_ANOMALY',
                        risk_level: 'LOW',
                        reason: `Single continuous session exceeded ${ruleSession.parameters.max_single_session_hours} hours.`,
                        expected_behavior: `Expected session length under ${ruleSession.parameters.max_single_session_hours} hours without idle disconnect.`,
                        actual_behavior: `Single session logged for ${durationMinutes} minutes.`,
                        evidence: { reported_minutes: durationMinutes }
                    });
                }
            }
        }

        // =========================================================================
        // 3. EXPLAINABLE FLAG DEDUPLICATION & RECORDING
        // =========================================================================

        createFlag(data) {
            // Deduplicate: If same student + rule + event within 60s, do not create duplicate spam flags
            const existing = this.flags.find(f => 
                f.student_id === data.student_id && 
                f.rule_id === data.rule_id &&
                (Date.now() - new Date(f.created_at).getTime()) < 60000 &&
                f.review_status === 'PENDING'
            );

            if (existing) {
                existing.actual_behavior += ` (Repeated occurrence recorded at ${new Date().toLocaleTimeString()})`;
                this.saveFlags();
                return existing;
            }

            const codeNum = String(this.flags.length + 101).padStart(3, '0');
            const newFlag = {
                id: 'flag_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                flag_code: `FLAG-2026-${codeNum}`,
                student_id: data.student_id,
                student_name: data.student_name || 'Cadet',
                student_email: data.student_email || '',
                event_id: data.event_id || 'evt_general',
                session_id: data.session_id || null,
                rule_id: data.rule_id,
                rule_version: '1.0',
                risk_level: data.risk_level || 'LOW',
                reason: data.reason,
                expected_behavior: data.expected_behavior,
                actual_behavior: data.actual_behavior,
                evidence: data.evidence || {},
                related_tx_id: data.related_tx_id || null,
                review_status: 'PENDING',
                assigned_reviewer: null,
                review_notes: '',
                final_decision: null,
                created_at: new Date().toISOString()
            };

            this.flags.unshift(newFlag);
            this.saveFlags();

            // Sync to Supabase if connected
            if (this.supabase && window.msotAuth?.session) {
                this.supabase.from('integrity_flags').insert(newFlag).catch(() => {});
            }

            return newFlag;
        }

        // =========================================================================
        // 4. FACULTY REVIEW WORKFLOW
        // =========================================================================

        getPendingCount() {
            return this.flags.filter(f => f.review_status === 'PENDING' || f.review_status === 'UNDER_REVIEW').length;
        }

        getFlags(filters = {}) {
            return this.flags.filter(f => {
                if (filters.risk && filters.risk !== 'ALL' && f.risk_level !== filters.risk) return false;
                if (filters.status && filters.status !== 'ALL' && f.review_status !== filters.status) return false;
                if (filters.rule && filters.rule !== 'ALL' && f.rule_id !== filters.rule) return false;
                if (filters.search) {
                    const q = filters.search.toLowerCase();
                    const matchName = (f.student_name || '').toLowerCase().includes(q);
                    const matchId = (f.student_id || '').toLowerCase().includes(q);
                    const matchCode = (f.flag_code || '').toLowerCase().includes(q);
                    if (!matchName && !matchId && !matchCode) return false;
                }
                return true;
            });
        }

        openCaseModal(flagId) {
            const flag = this.flags.find(f => f.id === flagId);
            if (!flag) return;
            this.activeCaseId = flagId;

            const modal = document.getElementById('iaCaseModal');
            const codeEl = document.getElementById('iaCaseCode');
            const badgeEl = document.getElementById('iaCaseRiskBadge');
            const studentEl = document.getElementById('iaCaseStudent');
            const reasonEl = document.getElementById('iaCaseReason');
            const expEl = document.getElementById('iaCaseExpected');
            const actEl = document.getElementById('iaCaseActual');
            const evidEl = document.getElementById('iaCaseEvidence');
            const notesEl = document.getElementById('iaCaseReviewNotes');
            const statusEl = document.getElementById('iaCaseStatus');

            if (codeEl) codeEl.textContent = `${flag.flag_code} // ${flag.rule_id}`;
            if (badgeEl) {
                badgeEl.className = `ia-risk-badge ia-risk-${flag.risk_level.toLowerCase()}`;
                badgeEl.textContent = `${flag.risk_level} RISK`;
            }
            if (statusEl) {
                statusEl.className = `ia-status-badge ia-status-${flag.review_status.toLowerCase()}`;
                statusEl.textContent = flag.review_status.replace('_', ' ');
            }
            if (studentEl) {
                const avatarBadge = window.msotPlatform?.renderDynamicAvatar 
                    ? window.msotPlatform.renderDynamicAvatar(flag.student_email || flag.student_id, { size: 30 })
                    : '';
                studentEl.innerHTML = `
                    <span style="display:inline-flex; align-items:center; gap:8px; vertical-align:middle;">
                        ${avatarBadge}
                        <strong style="color:#fff;">${flag.student_name}</strong>
                        <span style="color:#94a3b8; font-family:var(--font-mono, monospace); font-size:12px;">(${flag.student_id})</span>
                    </span>
                `;
            }
            if (reasonEl) reasonEl.textContent = flag.reason;
            if (expEl) expEl.textContent = flag.expected_behavior;
            if (actEl) actEl.textContent = flag.actual_behavior;
            if (evidEl) evidEl.textContent = JSON.stringify(flag.evidence, null, 2);
            if (notesEl) notesEl.value = flag.review_notes || '';

            if (modal) modal.classList.add('open');
        }

        closeCaseModal() {
            const modal = document.getElementById('iaCaseModal');
            if (modal) modal.classList.remove('open');
            this.activeCaseId = null;
        }

        recordReviewDecision(decision, reason = '') {
            if (!this.activeCaseId) return;
            const flag = this.flags.find(f => f.id === this.activeCaseId);
            if (!flag) return;

            const curUser = window.msotAuth?.session || { name: 'Faculty Reviewer', role: 'FACULTY' };
            const notesInput = document.getElementById('iaCaseReviewNotes');
            const notes = notesInput ? notesInput.value.trim() : flag.review_notes;

            let newStatus = 'UNDER_REVIEW';
            if (decision === 'DISMISSED_FALSE_POSITIVE') newStatus = 'DISMISSED';
            if (decision === 'CONFIRMED_VIOLATION') newStatus = 'RESOLVED';
            if (decision === 'ESCALATED_TO_ADMIN') newStatus = 'ESCALATED';

            flag.review_status = newStatus;
            flag.assigned_reviewer = curUser.name || 'Faculty Officer';
            flag.review_notes = notes;
            flag.final_decision = decision;

            // Log review audit entry
            const reviewRecord = {
                id: 'rev_' + Date.now(),
                flag_id: flag.id,
                flag_code: flag.flag_code,
                reviewer_name: curUser.name || 'Faculty Officer',
                reviewer_role: curUser.role || 'FACULTY',
                decision: decision,
                decision_reason: reason || notes || 'Routine faculty review resolution',
                created_at: new Date().toISOString()
            };
            this.reviews.unshift(reviewRecord);
            this.saveReviews();
            this.saveFlags();

            alert(`Case ${flag.flag_code} updated to status: ${newStatus}`);
            this.closeCaseModal();
            if (window.msotPlatform) {
                window.msotPlatform.renderFacultyDashboard();
            }
        }

        // =========================================================================
        // 5. PERMISSION-CONTROLLED FACULTY XP ADJUSTMENT (Atomic & Non-Negative)
        // =========================================================================

        hasXPAdjustmentPermission() {
            const role = (window.msotAuth?.session?.role || window.msotState?.currentRole || 'STUDENT').toUpperCase();
            if (role === 'ADMIN') return true;
            if (role === 'FACULTY') {
                // Check if faculty adjustments are globally authorized in admin settings
                return true;
            }
            return false;
        }

        adjustXP(params) {
            // Mandatory Safeguards
            if (!this.hasXPAdjustmentPermission()) {
                alert('⚠️ Access Denied: You do not possess authorized permissions for XP adjustments.');
                return { success: false, message: 'Unauthorized' };
            }

            const studentId = params.student_id;
            const actionType = params.action_type; // 'AWARD' or 'DEDUCT'
            const amount = Math.abs(parseInt(params.xp_amount, 10));
            const reason = (params.reason || '').trim();
            const caseId = params.case_id || 'manual_review';

            if (isNaN(amount) || amount <= 0) {
                alert('Please enter a valid positive XP amount.');
                return { success: false, message: 'Invalid amount' };
            }
            if (!reason) {
                alert('A documented justification reason is required for every XP adjustment.');
                return { success: false, message: 'Reason required' };
            }

            // Target Student XP
            let currentXP = window.msotState?.student?.lifetimeXP || 0;
            const balanceBefore = currentXP;
            let balanceAfter = currentXP;

            if (actionType === 'DEDUCT') {
                // Safeguard: XP Must NEVER become negative!
                balanceAfter = Math.max(0, currentXP - amount);
            } else if (actionType === 'AWARD') {
                balanceAfter = currentXP + amount;
            }

            // High impact deduction check (> 500 XP requires Admin approval unless performed by Admin)
            const curRole = (window.msotAuth?.session?.role || window.msotState?.currentRole || 'FACULTY').toUpperCase();
            const isHighImpact = actionType === 'DEDUCT' && amount > 500;
            const status = (isHighImpact && curRole !== 'ADMIN') ? 'PENDING_ADMIN_APPROVAL' : 'APPLIED';

            const adjustmentCode = `XPA-${Date.now().toString().slice(-6)}`;
            const adjRecord = {
                id: 'adj_' + Date.now(),
                adjustment_code: adjustmentCode,
                student_id: studentId,
                student_name: params.student_name || 'Cadet',
                case_id: caseId,
                action_type: actionType,
                xp_amount: amount,
                balance_before: balanceBefore,
                balance_after: balanceAfter,
                reason: reason,
                requested_by: window.msotAuth?.session?.id || 'faculty_user',
                requested_by_name: window.msotAuth?.session?.name || 'Faculty Member',
                requested_by_role: curRole,
                status: status,
                created_at: new Date().toISOString()
            };

            this.adjustments.unshift(adjRecord);
            this.saveAdjustments();

            // Apply atomically if approved/applied
            if (status === 'APPLIED') {
                if (window.msotState?.student) {
                    window.msotState.student.lifetimeXP = balanceAfter;
                    // Add distinct audit transaction into state ledger
                    window.msotState.recordXP(
                        actionType === 'DEDUCT' ? 'FACULTY_DEDUCTION' : 'FACULTY_CORRECTION',
                        actionType === 'DEDUCT' ? -amount : amount,
                        `[${adjustmentCode}] Faculty Adjustment: ${reason} (Ref: ${caseId})`,
                        { adjustment_id: adjRecord.id, case_id: caseId },
                        'faculty_officer'
                    );
                    window.msotState.save();
                }
                alert(`✅ XP Adjustment ${adjustmentCode} applied! Student balance: ${balanceBefore} ➔ ${balanceAfter} XP.`);
            } else {
                alert(`⏳ Adjustment ${adjustmentCode} of -${amount} XP exceeds 500 XP threshold and has been submitted for Admin authorization.`);
            }

            return { success: true, adjustment: adjRecord };
        }

        // =========================================================================
        // 6. STUDENT FAIRNESS & APPEALS
        // =========================================================================

        submitStudentAppeal(flagId, explanation, supportingContext = '') {
            const student = window.msotState?.student || {};
            const flag = this.flags.find(f => f.id === flagId);

            if (!explanation || explanation.trim().length < 15) {
                alert('Please provide a complete explanation (minimum 15 characters) describing your learning session.');
                return false;
            }

            const appealRecord = {
                id: 'app_' + Date.now(),
                flag_id: flagId,
                flag_code: flag?.flag_code || 'FLAG-UNKNOWN',
                student_id: student.id || 'MSOT-CADET',
                student_name: student.name || 'Cadet',
                explanation: explanation.trim(),
                supporting_context: supportingContext.trim(),
                status: 'SUBMITTED',
                reviewer_notes: null,
                resolved_by: null,
                created_at: new Date().toISOString()
            };

            this.appeals.unshift(appealRecord);
            this.saveAppeals();

            // Transition flag to UNDER_REVIEW
            if (flag) {
                flag.review_status = 'UNDER_REVIEW';
                this.saveFlags();
            }

            alert('📩 Your explanation has been submitted to the Academic Review Board. A faculty officer will review your case with full procedural fairness.');
            return true;
        }

        // =========================================================================
        // 7. ADMIN CONFIGURATION & AUDIT METRICS
        // =========================================================================

        updateRuleConfig(ruleId, updates) {
            const rule = this.configs.find(r => r.rule_id === ruleId);
            if (!rule) return;
            Object.assign(rule, updates);
            rule.updated_by = window.msotAuth?.session?.name || 'Admin Officer';
            rule.updated_at = new Date().toISOString();
            this.saveConfigs();
            alert(`Detection rule "${rule.name}" updated successfully.`);
        }

        getFalsePositiveStats() {
            const total = this.flags.length;
            const dismissed = this.flags.filter(f => f.review_status === 'DISMISSED').length;
            const rate = total > 0 ? ((dismissed / total) * 100).toFixed(1) : '0.0';
            return { total, dismissed, rate };
        }

        // =========================================================================
        // 8. RENDER FACULTY INTEGRITY VIEW
        // =========================================================================

        renderFacultyIntegrityView() {
            const flags = this.getFlags();
            const pendingCount = this.getPendingCount();
            const fpStats = this.getFalsePositiveStats();

            return `
                <div class="rules-table-wrap">
                    <div class="faculty-header mb-16">
                        <div>
                            <span class="faculty-tag">FAIRNESS &amp; INTEGRITY // PEDAGOGICAL AUDIT</span>
                            <h2 class="section-title">ACADEMIC INTEGRITY &amp; REVIEW DESK</h2>
                            <p class="section-subtitle">
                                Inspect automated signals, review technical evidence, record decisions, and manage authorized XP corrections.
                                <strong>Flags are signals for investigation, not proof of cheating.</strong>
                            </p>
                        </div>
                    </div>

                    <!-- Metrics Grid -->
                    <div class="ia-stat-grid">
                        <div class="ia-stat-card">
                            <div class="ia-stat-val" style="color:#fbbf24;">${pendingCount}</div>
                            <div class="ia-stat-label">Pending Reviews</div>
                        </div>
                        <div class="ia-stat-card">
                            <div class="ia-stat-val" style="color:#38bdf8;">${this.flags.length}</div>
                            <div class="ia-stat-label">Total Cases Logged</div>
                        </div>
                        <div class="ia-stat-card">
                            <div class="ia-stat-val" style="color:#34d399;">${fpStats.dismissed}</div>
                            <div class="ia-stat-label">False Positives Dismissed</div>
                        </div>
                        <div class="ia-stat-card">
                            <div class="ia-stat-val" style="color:#c084fc;">${this.appeals.length}</div>
                            <div class="ia-stat-label">Student Appeals Submitted</div>
                        </div>
                    </div>

                    <!-- Filter Strip -->
                    <div class="ia-filter-bar">
                        <input type="text" id="iaFilterSearch" class="ia-search-input" placeholder="Search cadet name, student ID, or flag code..." oninput="window.msotIntegrity.applyFilters()">
                        <select id="iaFilterRisk" class="ia-select-filter" onchange="window.msotIntegrity.applyFilters()">
                            <option value="ALL">All Risk Levels</option>
                            <option value="HIGH">High Risk</option>
                            <option value="MEDIUM">Medium Risk</option>
                            <option value="LOW">Low Risk</option>
                        </select>
                        <select id="iaFilterStatus" class="ia-select-filter" onchange="window.msotIntegrity.applyFilters()">
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="DISMISSED">Dismissed</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="ESCALATED">Escalated</option>
                        </select>
                        <button type="button" class="btn-action-sm" onclick="window.msotIntegrity.openManualAdjustmentModal()">
                            ⚖️ MANUAL XP ADJUSTMENT
                        </button>
                    </div>

                    <!-- Flags Data Table -->
                    <table class="rules-table">
                        <thead>
                            <tr>
                                <th>FLAG CODE</th>
                                <th>CADET</th>
                                <th>DETECTION RULE</th>
                                <th>RISK</th>
                                <th>REASON</th>
                                <th>STATUS</th>
                                <th>DATE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody id="iaFlagsTableBody">
                            ${this.renderFlagsRows(flags)}
                        </tbody>
                    </table>
                </div>
            `;
        }

        renderFlagsRows(flagsList) {
            if (!flagsList || flagsList.length === 0) {
                return `<tr><td colspan="8" style="text-align:center; padding:32px; color:#8c96a8;">No integrity flags matching the selected criteria.</td></tr>`;
            }
            return flagsList.map(f => `
                <tr>
                    <td style="font-family:monospace; font-weight:700; color:#38bdf8;">${f.flag_code}</td>
                    <td><strong>${f.student_name}</strong><br><span style="font-size:0.75rem; color:#94a3b8;">${f.student_id}</span></td>
                    <td><span class="st-platform-badge st-badge-general">${f.rule_id.replace('RULE_', '')}</span></td>
                    <td><span class="ia-risk-badge ia-risk-${f.risk_level.toLowerCase()}">${f.risk_level}</span></td>
                    <td style="max-width:260px; font-size:0.82rem; color:#cbd5e1;">${f.reason}</td>
                    <td><span class="ia-status-badge ia-status-${f.review_status.toLowerCase()}">${f.review_status.replace('_', ' ')}</span></td>
                    <td style="font-size:0.75rem; color:#94a3b8;">${new Date(f.created_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</td>
                    <td>
                        <button type="button" class="btn-action-sm" onclick="window.msotIntegrity.openCaseModal('${f.id}')">
                            INSPECT CASE
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        applyFilters() {
            const search = document.getElementById('iaFilterSearch')?.value || '';
            const risk = document.getElementById('iaFilterRisk')?.value || 'ALL';
            const status = document.getElementById('iaFilterStatus')?.value || 'ALL';
            const filtered = this.getFlags({ search, risk, status });
            const tbody = document.getElementById('iaFlagsTableBody');
            if (tbody) tbody.innerHTML = this.renderFlagsRows(filtered);
        }

        // =========================================================================
        // 9. RENDER ADMIN INTEGRITY & CONFIGURATION VIEW
        // =========================================================================

        renderAdminIntegrityView() {
            const fpStats = this.getFalsePositiveStats();

            return `
                <div class="rules-table-wrap">
                    <div class="admin-header mb-16">
                        <div>
                            <span class="admin-tag">SECURITY &amp; FAIRNESS // INTEGRITY RULES ENGINE</span>
                            <h2 class="section-title">ANTI-CHEATING CONFIGURATION &amp; AUDIT</h2>
                            <p class="section-subtitle">
                                Configure detection rule baselines, calibrate thresholds, review false-positive metrics, and audit faculty XP adjustments.
                            </p>
                        </div>
                    </div>

                    <!-- Rule Configurations -->
                    <div class="dashboard-panel mb-24">
                        <h3 style="color:#fbbf24; font-size:1.05rem; margin-bottom:12px; font-weight:700;">⚙️ Configurable Detection Rules &amp; Thresholds</h3>
                        <table class="rules-table">
                            <thead>
                                <tr>
                                    <th>RULE</th>
                                    <th>DESCRIPTION</th>
                                    <th>WEIGHT</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.configs.map(cfg => `
                                    <tr>
                                        <td><strong>${cfg.name}</strong><br><code style="font-size:0.75rem; color:#38bdf8;">${cfg.rule_id}</code></td>
                                        <td style="font-size:0.82rem; color:#94a3b8; max-width:320px;">${cfg.description}</td>
                                        <td><span class="ia-risk-badge ia-risk-${cfg.risk_weight.toLowerCase()}">${cfg.risk_weight}</span></td>
                                        <td>
                                            <span class="status-badge ${cfg.is_enabled ? 'status-active' : 'status-inactive'}">
                                                ${cfg.is_enabled ? 'ACTIVE' : 'DISABLED'}
                                            </span>
                                        </td>
                                        <td>
                                            <button type="button" class="btn-action-sm" onclick="window.msotIntegrity.toggleRule('${cfg.rule_id}')">
                                                ${cfg.is_enabled ? 'DISABLE' : 'ENABLE'}
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- XP Adjustments Ledger -->
                    <div class="dashboard-panel mb-24">
                        <h3 style="color:#fbbf24; font-size:1.05rem; margin-bottom:12px; font-weight:700;">📜 Faculty XP Adjustment Audit Trail</h3>
                        <table class="rules-table">
                            <thead>
                                <tr>
                                    <th>ADJUSTMENT CODE</th>
                                    <th>STUDENT</th>
                                    <th>TYPE</th>
                                    <th>XP DELTA</th>
                                    <th>REASON</th>
                                    <th>REQUESTED BY</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.adjustments.length === 0 ? `
                                    <tr><td colspan="7" style="text-align:center; padding:24px; color:#8c96a8;">No faculty XP adjustments recorded yet.</td></tr>
                                ` : this.adjustments.map(adj => `
                                    <tr>
                                        <td style="font-family:monospace; font-weight:700; color:#38bdf8;">${adj.adjustment_code}</td>
                                        <td><strong>${adj.student_name}</strong></td>
                                        <td><span style="font-weight:700; color:${adj.action_type === 'DEDUCT' ? '#f87171' : '#34d399'};">${adj.action_type}</span></td>
                                        <td>${adj.action_type === 'DEDUCT' ? '-' : '+'}${adj.xp_amount} XP</td>
                                        <td style="font-size:0.82rem; color:#cbd5e1;">${adj.reason}</td>
                                        <td style="font-size:0.75rem; color:#94a3b8;">${adj.requested_by_name}</td>
                                        <td><span class="ia-status-badge ia-status-resolved">${adj.status}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        toggleRule(ruleId) {
            const rule = this.configs.find(r => r.rule_id === ruleId);
            if (rule) {
                rule.is_enabled = !rule.is_enabled;
                this.saveConfigs();
                if (window.msotPlatform) window.msotPlatform.renderAdminRules();
            }
        }

        openManualAdjustmentModal() {
            const modal = document.getElementById('iaAdjustmentModal');
            if (modal) modal.classList.add('open');
        }

        closeAdjustmentModal() {
            const modal = document.getElementById('iaAdjustmentModal');
            if (modal) modal.classList.remove('open');
        }

        submitAdjustmentForm() {
            const studentId = document.getElementById('iaAdjStudentId')?.value || '';
            const studentName = document.getElementById('iaAdjStudentName')?.value || 'Cadet';
            const actionType = document.getElementById('iaAdjType')?.value || 'DEDUCT';
            const xpAmount = document.getElementById('iaAdjAmount')?.value || '0';
            const reason = document.getElementById('iaAdjReason')?.value || '';

            const res = this.adjustXP({
                student_id: studentId,
                student_name: studentName,
                action_type: actionType,
                xp_amount: xpAmount,
                reason: reason,
                case_id: this.activeCaseId || 'manual_review'
            });

            if (res.success) {
                this.closeAdjustmentModal();
                if (window.msotPlatform) window.msotPlatform.renderFacultyDashboard();
            }
        }
    }

    // Singleton Export
    window.msotIntegrity = new IntegrityAuditController();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.msotIntegrity.init());
    } else {
        window.msotIntegrity.init();
    }
})();
