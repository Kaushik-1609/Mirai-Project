/**
 * Mirai School of Technology - Universal Interactive Game Engine
 * Powers all 17 Games with:
 * - Specific custom tech/anime animations & UI skins per mechanic
 * - 10 questions per game with full scoring, hints, and explanations
 * - Boss battles with animated HP bars & critical timers
 * - Conveyor belts, maze navigation, and Lego voxel builders
 * - Badge awards and XP integration with local state
 */

class MiraiGameEngine {
    constructor() {
        this.currentGame = null;
        this.currentQIndex = 0;
        this.lives = 3;
        this.score = 0;
        this.combo = 0;
        this.hintUsed = false;
        this.bossHP = 100;
        this.mazeProgress = 0;
        this.raceLaps = 0;
        this.questionStartTime = Date.now();
        this.timerInterval = null;

        this.modal = document.getElementById('gameModal');
        this.container = document.getElementById('gameArenaContainer');

        // Global Escape key shortcut to close game
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const gm = document.getElementById('gameModal');
                if (gm && (gm.classList.contains('active') || gm.style.display === 'flex')) {
                    this.closeGame();
                }
            }
        });
    }

    openGame(gameId) {
        if (!window.MIRAI_GAMES) return;
        const game = window.MIRAI_GAMES.find(g => g.id === gameId);
        if (!game) {
            console.warn("Game not found:", gameId);
            return;
        }

        this.modal = document.getElementById('gameModal');
        this.container = document.getElementById('gameArenaContainer');
        if (!this.modal || !this.container) return;

        this.currentGame = game;
        this.currentQIndex = 0;
        this.lives = 3;
        this.score = 0;
        this.combo = 0;
        this.bossHP = 100;
        this.mazeProgress = 0;
        this.raceLaps = 0;
        this.hintUsed = false;

        this.modal.classList.add('active');
        this.modal.style.setProperty('display', 'flex', 'important');
        this.modal.style.setProperty('pointer-events', 'auto', 'important');
        this.modal.style.setProperty('visibility', 'visible', 'important');
        document.body.style.overflow = 'hidden';

        if (window.miraiAudio) {
            window.miraiAudio.playClick?.();
        }

        this.renderStage();
    }

    closeGame() {
        if (!this.modal) this.modal = document.getElementById('gameModal');
        if (this.modal) {
            this.modal.classList.remove('active');
            this.modal.style.setProperty('display', 'none', 'important');
            this.modal.style.setProperty('pointer-events', 'none', 'important');
            this.modal.style.setProperty('visibility', 'hidden', 'important');
            document.body.style.overflow = 'auto';
        }
        clearInterval(this.timerInterval);
        if (this.cleanup3D) {
            this.cleanup3D();
            this.cleanup3D = null;
        }
    }

    renderStage() {
        if (!this.currentGame) return;

        const totalQCount = (this.currentGame.questions && this.currentGame.questions.length) || 10;
        const q = (this.currentGame.questions && this.currentGame.questions[this.currentQIndex]) || {};
        const progress = Math.round((this.currentQIndex / totalQCount) * 100);
        this.hintUsed = false;
        this.questionStartTime = Date.now();

        const promptText = q.prompt || q.q || q.question || 'Evaluate the logic below and select the correct answer:';
        const qNumber = q.num || (this.currentQIndex + 1);
        const qType = q.type || 'Academic Problem';
        const qHint = q.hint || q.explain || 'Carefully trace each token and branch.';
        const qOptions = Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'];

        let mechanicHtml = this.getMechanicVisuals();

        this.container.innerHTML = `
            <!-- Sticky Top Bar with High-Visibility Exit Button -->
            <div class="game-top-sticky-bar">
                <div class="gt-left-badge">⛩️ ${this.escapeHtml(this.currentGame.title)}</div>
                <button type="button" class="floating-game-close-btn" onclick="window.miraiGame.closeGame()" title="Exit Game & Return (Esc)">
                    <span>✕ EXIT GAME</span>
                </button>
            </div>

            <div class="game-hud">
                <div class="hud-left">
                    <span class="hud-tag">${this.escapeHtml(this.currentGame.trackName || 'CURRICULUM TRIAL')}</span>
                    <h3 class="hud-title">${this.escapeHtml(this.currentGame.title)}</h3>
                    <div class="hud-topic">Topic ${this.currentGame.topicNum || 1}: ${this.escapeHtml(this.currentGame.topic || 'Core Module')}</div>
                </div>
                <div class="hud-right">
                    <div class="hud-stat"><span class="stat-label">LIVES</span> <span class="stat-val heart-val">${'❤️'.repeat(Math.max(0, this.lives))}</span></div>
                    <div class="hud-stat"><span class="stat-label">SCORE</span> <span class="stat-val score-val">${this.score} XP</span></div>
                    <div class="hud-stat"><span class="stat-label">COMBO</span> <span class="stat-val combo-val">${this.combo}x 🔥</span></div>
                    <button type="button" class="game-close-btn" onclick="window.miraiGame.closeGame()" title="Close Game">✕</button>
                </div>
            </div>

            <!-- Progress bar -->
            <div class="game-progress-track">
                <div class="game-progress-fill" style="width: ${progress}%"></div>
            </div>

            <!-- Custom Mechanic Anime Stage -->
            <div class="mechanic-stage ${this.currentGame.mechanic}">
                ${mechanicHtml}
            </div>

            <!-- Story & Rule Banner -->
            <div class="game-story-card">
                <div class="story-icon">📜</div>
                <div class="story-text">
                    <strong>Case File:</strong> ${this.escapeHtml(this.currentGame.story || 'Complete the curriculum simulation.')}
                </div>
            </div>

            <!-- Question Card -->
            <div class="question-card" id="currentQuestionCard">
                <div class="question-header">
                    <span class="q-badge">Question ${qNumber} of ${totalQCount}</span>
                    <span class="q-type-badge">${this.escapeHtml(qType)}</span>
                    <button type="button" class="hint-trigger-btn" id="hintBtn" onclick="window.miraiGame.revealHint()">
                        💡 Need Clue? (-5 XP)
                    </button>
                </div>

                <div class="q-prompt">${this.escapeHtml(promptText)}</div>

                ${q.code ? `
                    <div class="code-terminal">
                        <div class="code-terminal-header">
                            <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
                            <span class="terminal-title">mirai-compiler://${this.currentGame.track || 'terminal'}.cpp</span>
                        </div>
                        <pre><code>${this.escapeHtml(q.code)}</code></pre>
                    </div>
                ` : ''}

                <div class="hint-box" id="hintBox" style="display: none;">
                    <strong>Investigation Clue:</strong> ${this.escapeHtml(qHint)}
                </div>

                <!-- Answer Options -->
                <div class="options-grid">
                    ${qOptions.map((opt, idx) => `
                        <button type="button" class="option-btn" onclick="window.miraiGame.submitAnswer(${idx})">
                            <span class="opt-key">${String.fromCharCode(65 + idx)}</span>
                            <span class="opt-label">${this.escapeHtml(opt)}</span>
                        </button>
                    `).join('')}
                </div>

                <!-- Feedback Area -->
                <div class="feedback-panel" id="feedbackPanel" style="display: none;"></div>
            </div>
        `;

        // Mount In-Game 3D Interactive Viewport
        const stageEl = this.container.querySelector('.mechanic-stage');
        if (stageEl && window.mirai3D) {
            if (this.cleanup3D) this.cleanup3D();
            this.cleanup3D = window.mirai3D.mount3DGameStage(stageEl, this.currentGame.mechanic);
        }
    }

    getMechanicVisuals() {
        const m = this.currentGame.mechanic;
        const qNum = this.currentQIndex + 1;

        if (m === 'boss_battle') {
            return `
                <div class="boss-arena">
                    <div class="boss-nameplate">
                        <span class="boss-title">CYBER MECHA DEMON // ONI-09</span>
                        <span class="boss-hp-text">${this.bossHP} / 100 HP</span>
                    </div>
                    <div class="boss-hp-track">
                        <div class="boss-hp-fill" style="width: ${this.bossHP}%"></div>
                    </div>
                    <div class="boss-visual-container">
                        <div class="boss-sprite">👹⚡</div>
                        <div class="battle-slash-effect" id="slashFx"></div>
                        <div class="damage-number" id="dmgNumber"></div>
                    </div>
                </div>
            `;
        } else if (m === 'detective') {
            return `
                <div class="detective-crime-scene">
                    <div class="scene-radar">
                        <div class="radar-sweep"></div>
                        <div class="radar-dot dot1"></div>
                        <div class="radar-dot dot2"></div>
                    </div>
                    <div class="evidence-board">
                        <div class="evidence-tag">CRIME SCENE #${qNum}</div>
                        <div class="evidence-desc">Scanning compiler traces for logical anomalies...</div>
                    </div>
                </div>
            `;
        } else if (m === 'box_sort') {
            return `
                <div class="warehouse-stage">
                    <div class="warehouse-drop-item" id="warehouseItem">
                        <span class="cargo-tag">DATA CARGO #${qNum}</span>
                    </div>
                    <div class="warehouse-bins">
                        <div class="w-bin bin-int"><span>int</span></div>
                        <div class="w-bin bin-float"><span>float</span></div>
                        <div class="w-bin bin-char"><span>char</span></div>
                        <div class="w-bin bin-bool"><span>bool</span></div>
                        <div class="w-bin bin-string"><span>string</span></div>
                    </div>
                </div>
            `;
        } else if (m === 'maze_runner') {
            return `
                <div class="maze-stage">
                    <div class="maze-gates-track">
                        ${Array.from({ length: 10 }, (_, i) => `
                            <div class="maze-gate-step ${i < this.mazeProgress ? 'cleared' : (i === this.mazeProgress ? 'active' : '')}">
                                <span>${i < this.mazeProgress ? '✓' : (i + 1)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="runner-avatar-track">
                        <span class="runner-avatar" style="left: ${this.mazeProgress * 10}%">🏃‍♂️💨</span>
                    </div>
                </div>
            `;
        } else if (m === 'loop_racer') {
            return `
                <div class="racing-stage">
                    <div class="race-speedometer">
                        <span class="speed-val">NITRO: ${this.raceLaps * 10}%</span>
                        <span class="laps-counter">LAPS COMPLETED: ${this.raceLaps} / 10</span>
                    </div>
                    <div class="race-track-view">
                        <div class="neon-track-line"></div>
                        <div class="race-car" style="left: ${this.raceLaps * 9}%">🏎️🔥</div>
                    </div>
                </div>
            `;
        } else if (m === 'pattern_builder') {
            return `
                <div class="pattern-stage">
                    <div class="voxel-grid-preview" id="patternPreview">
                        <div class="voxel-row">★ ★ ★</div>
                        <div class="voxel-row">★ ★</div>
                        <div class="voxel-row">★</div>
                    </div>
                    <div class="pattern-status">VOXEL BLUEPRINT #${qNum} READY</div>
                </div>
            `;
        } else if (m === 'function_factory') {
            return `
                <div class="factory-stage">
                    <div class="factory-pipe pipe-in"><span>INPUT HOPPER ➔</span></div>
                    <div class="factory-machine">⚙️ CONVERTER MACHINE #0${qNum} ⚙️</div>
                    <div class="factory-pipe pipe-out"><span>➔ OUTPUT CONDUIT</span></div>
                </div>
            `;
        } else {
            // Web HTML themes
            return `
                <div class="generic-theme-stage">
                    <div class="theme-icon-badge">${this.currentGame.badge.icon}</div>
                    <div class="theme-tagline">${this.currentGame.rules}</div>
                </div>
            `;
        }
    }

    revealHint() {
        if (this.hintUsed) return;
        this.hintUsed = true;
        const box = document.getElementById('hintBox');
        const btn = document.getElementById('hintBtn');
        if (box) box.style.display = 'block';
        if (btn) {
            btn.disabled = true;
            btn.innerText = '💡 Clue Active (-5 XP)';
        }
        if (window.miraiAudio) window.miraiAudio.playClick();
    }

    submitAnswer(chosenIdx) {
        const q = (this.currentGame.questions && this.currentGame.questions[this.currentQIndex]) || {};
        const targetCorrect = (typeof q.correctIndex === 'number') ? q.correctIndex : (typeof q.correct === 'number' ? q.correct : 0);
        const isCorrect = chosenIdx === targetCorrect;
        const fbPanel = document.getElementById('feedbackPanel');
        const optionBtns = document.querySelectorAll('.option-btn');
        const timeTaken = (Date.now() - this.questionStartTime) / 1000;
        const isCritical = timeTaken <= 10;

        // Disable all option buttons
        optionBtns.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === targetCorrect) {
                btn.classList.add('correct');
            } else if (idx === chosenIdx) {
                btn.classList.add('wrong');
            }
        });

        if (isCorrect) {
            this.combo++;
            let earnedXP = this.hintUsed ? 5 : 10;
            if (this.combo >= 3) earnedXP += 5; // Combo bonus

            this.score += earnedXP;

            // Trigger specific mechanic animations
            this.triggerMechanicSuccess(isCritical);

            // Trigger anime speedlines
            const speedlines = document.getElementById('animeSpeedlines');
            if (speedlines) {
                speedlines.classList.add('active');
                setTimeout(() => speedlines.classList.remove('active'), 650);
            }

            if (window.miraiAudio) {
                if (isCritical) {
                    window.miraiAudio.playLaser();
                } else {
                    window.miraiAudio.playSlash();
                }
                setTimeout(() => window.miraiAudio.playSuccess(), 120);
            }

            fbPanel.innerHTML = `
                <div class="fb-card success">
                    <div class="fb-title">
                        ✅ EXCELLENT EXECUTION! +${earnedXP} XP ${isCritical ? '⚡ CRITICAL HIT!' : ''}
                    </div>
                    <div class="fb-explanation">${q.explanation}</div>
                    <button class="fb-next-btn" onclick="window.miraiGame.nextQuestion()">CONTINUE ➔</button>
                </div>
            `;
        } else {
            this.combo = 0;
            this.lives--;
            this.triggerMechanicFailure();

            // Trigger screen shake
            const arenaCard = document.querySelector('.game-arena-card');
            if (arenaCard) {
                arenaCard.classList.add('screen-shake');
                setTimeout(() => arenaCard.classList.remove('screen-shake'), 450);
            }

            if (window.miraiAudio) {
                window.miraiAudio.playError();
            }

            // Update hearts in HUD
            const heartDisplay = document.querySelector('.heart-val');
            if (heartDisplay) heartDisplay.innerText = this.lives > 0 ? '❤️'.repeat(this.lives) : '💀 DEAD';

            fbPanel.innerHTML = `
                <div class="fb-card error">
                    <div class="fb-title">
                        ❌ COMPILATION ANOMALY! (-1 Heart)
                    </div>
                    <div class="fb-explanation">${q.explanation}</div>
                    ${this.lives > 0 ? `
                        <button class="fb-next-btn" onclick="window.miraiGame.nextQuestion()">TRY NEXT CASE ➔</button>
                    ` : `
                        <button class="fb-retry-btn" onclick="window.miraiGame.openGame('${this.currentGame.id}')">SYSTEM OVERLOAD: RETRY MISSION ↺</button>
                    `}
                </div>
            `;
        }

        fbPanel.style.display = 'block';

        // Update score & combo in HUD
        const scoreDisplay = document.querySelector('.score-val');
        const comboDisplay = document.querySelector('.combo-val');
        if (scoreDisplay) scoreDisplay.innerText = `${this.score} XP`;
        if (comboDisplay) comboDisplay.innerText = `${this.combo}x 🔥`;
    }

    triggerMechanicSuccess(isCritical) {
        const m = this.currentGame.mechanic;

        if (m === 'boss_battle') {
            const damage = isCritical ? 15 : 10;
            this.bossHP = Math.max(0, this.bossHP - damage);
            const hpFill = document.querySelector('.boss-hp-fill');
            const hpText = document.querySelector('.boss-hp-text');
            const slashFx = document.getElementById('slashFx');
            const dmgNum = document.getElementById('dmgNumber');

            if (hpFill) hpFill.style.width = `${this.bossHP}%`;
            if (hpText) hpText.innerText = `${this.bossHP} / 100 HP`;

            if (slashFx) {
                slashFx.classList.add('active');
                setTimeout(() => slashFx.classList.remove('active'), 500);
            }
            if (dmgNum) {
                dmgNum.innerText = `-${damage} HP!`;
                dmgNum.classList.add('pop');
                setTimeout(() => dmgNum.classList.remove('pop'), 700);
            }
        } else if (m === 'maze_runner') {
            this.mazeProgress = Math.min(10, this.mazeProgress + 1);
        } else if (m === 'loop_racer') {
            this.raceLaps = Math.min(10, this.raceLaps + 1);
        }
    }

    triggerMechanicFailure() {
        const m = this.currentGame.mechanic;
        if (m === 'maze_runner') {
            this.mazeProgress = Math.max(0, this.mazeProgress - 1);
        } else if (m === 'loop_racer') {
            this.raceLaps = Math.max(0, this.raceLaps - 1);
        }
    }

    nextQuestion() {
        this.currentQIndex++;
        if (this.currentQIndex < 10 && this.lives > 0) {
            this.renderStage();
        } else {
            this.finishGame();
        }
    }

    finishGame() {
        // Victory!
        const isVictory = this.lives > 0;
        const badge = this.currentGame.badge;

        if (isVictory) {
            // Award Badge & Platform XP
            if (window.msotState?.awardBadge) {
                window.msotState.awardBadge(badge.id);
            }
            if (window.msotState?.recordXP) {
                window.msotState.recordXP('GAME_TOPIC_CLEAR', this.score, `${this.currentGame.title} Clear`);
            }
            if (window.msotState?.student && !window.msotState.student.completedGames.includes(this.currentGame.id)) {
                window.msotState.student.completedGames.push(this.currentGame.id);
                window.msotState.save();
            }

            if (window.miraiAudio) {
                window.miraiAudio.playBadgeFanfare?.();
            }

            this.container.innerHTML = `
                <div class="victory-modal">
                    <div class="victory-halo">✨</div>
                    <div class="victory-badge-icon">${badge.icon}</div>
                    <h2 class="victory-title">STAGE COMPLETE!</h2>
                    <h4 class="victory-badge-name">Unlocked Badge: ${badge.name}</h4>
                    <p class="victory-desc">${badge.desc}</p>
                    <div class="victory-stats">
                        <div class="v-stat"><span class="v-label">XP EARNED</span><span class="v-num">+${this.score} XP</span></div>
                        <div class="v-stat"><span class="v-label">REMAINING HEARTS</span><span class="v-num">${'❤️'.repeat(this.lives)}</span></div>
                        <div class="v-stat"><span class="v-label">HIGHEST COMBO</span><span class="v-num">${this.combo}x</span></div>
                    </div>
                    <div class="victory-actions">
                        <button class="primary-btn" onclick="window.miraiGame.closeGame(); window.msotPlatform?.refreshAll?.();">
                            COLLECT REWARD & RETURN TO ARCADE ➔
                        </button>
                    </div>
                </div>
            `;
        } else {
            this.container.innerHTML = `
                <div class="victory-modal defeat">
                    <div class="victory-halo">💀</div>
                    <h2 class="victory-title">MISSION FAILED</h2>
                    <p class="victory-desc">You ran out of lives during the cyber trial. Review your concepts and challenge again!</p>
                    <div class="victory-actions">
                        <button class="primary-btn" onclick="window.miraiGame.openGame('${this.currentGame.id}')">
                            RETRY SIMULATION ↺
                        </button>
                        <button class="secondary-btn" onclick="window.miraiGame.closeGame()">
                            EXIT TO ARCADE
                        </button>
                    </div>
                </div>
            `;
        }
    }

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

window.miraiGame = new MiraiGameEngine();
