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
        this.currentLevel = 1;
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
        this.isSubmitting = false;

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

    renderHeartsHtml() {
        let hearts = '';
        for (let i = 0; i < 3; i++) {
            if (i < this.lives) {
                hearts += '<span class="heart-icon active">❤️</span>';
            } else {
                hearts += '<span class="heart-icon lost">🖤</span>';
            }
        }
        return hearts;
    }

    openGame(gameId, levelNum = null) {
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
        this.currentLevel = (typeof levelNum === 'number') ? levelNum : 1;
        this.currentQIndex = 0;
        this.lives = 3;
        this.score = 0;
        this.combo = 0;
        this.bossHP = 100;
        this.mazeProgress = 0;
        this.raceLaps = 0;
        this.hintUsed = false;
        this.isSubmitting = false;

        this.modal.classList.add('active');
        this.modal.style.setProperty('display', 'flex', 'important');
        this.modal.style.setProperty('pointer-events', 'auto', 'important');
        this.modal.style.setProperty('visibility', 'visible', 'important');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('game-modal-open');

        if (window.miraiAudio) {
            window.miraiAudio.playClick?.();
        }

        if (game.levels && game.levels.length > 0 && levelNum === null) {
            this.renderLevelSelect();
        } else {
            this.renderStage();
        }
    }

    renderLevelSelect() {
        const bgVid = document.getElementById('gameModalBgVideo');
        if (bgVid) {
            bgVid.style.display = 'none';
            try { bgVid.pause(); } catch(e) {}
        }

        if (!this.currentGame || !this.currentGame.levels) {
            this.renderStage();
            return;
        }

        const completedList = Array.isArray(window.msotState?.student?.completedGames)
            ? window.msotState.student.completedGames
            : [];

        const isDetective = this.currentGame.mechanic === 'detective';
        const heroVisual = isDetective ? `
            <div class="detective-crime-scene" style="justify-content: center; margin-bottom: 12px;">
                <div class="scene-radar">
                    <div class="radar-sweep"></div>
                    <div class="radar-dot dot1"></div>
                    <div class="radar-dot dot2"></div>
                </div>
            </div>
        ` : `
            <div class="level-select-hero-icon" style="font-size: 52px; margin-bottom: 8px; text-align: center; filter: drop-shadow(0 0 16px rgba(0, 240, 255, 0.4));">
                ${this.currentGame.badge?.icon || '📦'}
            </div>
        `;

        let chamberTag = 'Challenge Scenarios';
        let launchActionText = 'DEPLOY LEVEL';
        if (this.currentGame.mechanic === 'detective') {
            chamberTag = 'Crime Scenes';
            launchActionText = 'INVESTIGATE LEVEL';
        } else if (this.currentGame.mechanic === 'boss_battle') {
            chamberTag = 'Combat Encounters';
            launchActionText = 'ENGAGE BOSS LEVEL';
        } else if (this.currentGame.mechanic === 'box_sort') {
            chamberTag = 'Cargo Scenarios';
            launchActionText = 'SORT CARGO LEVEL';
        } else if (this.currentGame.mechanic === 'maze_runner') {
            chamberTag = 'Labyrinth Portals';
            launchActionText = 'ENTER MAZE LEVEL';
        } else if (this.currentGame.mechanic === 'loop_racer') {
            chamberTag = 'Grand Prix Circuits';
            launchActionText = 'RACE CIRCUIT LEVEL';
        } else if (this.currentGame.mechanic === 'pattern_builder') {
            chamberTag = 'Voxel Blueprints';
            launchActionText = 'BUILD PATTERN LEVEL';
        } else if (this.currentGame.mechanic === 'function_factory') {
            chamberTag = 'Automation Pipelines';
            launchActionText = 'ENGINEER PIPELINE LEVEL';
        } else if (this.currentGame.mechanic === 'house_builder') {
            chamberTag = 'DOM Scaffolds';
            launchActionText = 'CONSTRUCT DOM LEVEL';
        } else if (this.currentGame.mechanic === 'fashion_show') {
            chamberTag = 'Runway Stages';
            launchActionText = 'STYLE RUNWAY LEVEL';
        } else if (this.currentGame.mechanic === 'shopping_list') {
            chamberTag = 'Market Inventory Carts';
            launchActionText = 'STOCK CART LEVEL';
        } else if (this.currentGame.mechanic === 'treasure_map') {
            chamberTag = 'Cyber Archipelago';
            launchActionText = 'SET SAIL TO ARCHIPELAGO';
        } else if (this.currentGame.mechanic === 'gallery_puzzle') {
            chamberTag = 'Holographic Art Wings';
            launchActionText = 'MOUNT GALLERY EXHIBIT';
        } else if (this.currentGame.mechanic === 'timetable_builder') {
            chamberTag = 'Academy Schedules';
            launchActionText = 'CONSTRUCT SCHEDULE GRID';
        } else if (this.currentGame.mechanic === 'desk_rush') {
            chamberTag = 'Admissions Desks';
            launchActionText = 'PROCESS ADMISSIONS QUEUE';
        } else if (this.currentGame.mechanic === 'city_planner') {
            chamberTag = 'Metropolitan Sectors';
            launchActionText = 'ZONE CITY SECTOR';
        } else if (this.currentGame.mechanic === 'conveyor_sort') {
            chamberTag = 'Sorting Pipelines';
            launchActionText = 'START CONVEYOR SORT';
        } else if (this.currentGame.mechanic === 'secret_codes') {
            chamberTag = 'Cipher Dossiers';
            launchActionText = 'DECRYPT CIPHER LEVEL';
        }

        this.container.innerHTML = `
            <div class="game-top-sticky-bar">
                <div class="gt-left-badge">${this.currentGame.badge?.icon || '🎮'} ${this.escapeHtml(this.currentGame.title)} // LEVEL DOSSIERS</div>
                <button type="button" class="floating-game-close-btn" onclick="window.miraiGame.closeGame()" title="Exit Game & Return (Esc)">
                    <span>✕ EXIT GAME</span>
                </button>
            </div>

            <div class="level-select-container">
                <div class="level-select-header">
                    ${heroVisual}
                    <span class="hud-tag">${this.escapeHtml(this.currentGame.trackName || 'DSA in C++')} • TOPIC ${this.currentGame.topicNum || 1}</span>
                    <h2 class="level-select-title">${this.escapeHtml(this.currentGame.title)}: Level Archive</h2>
                    <p class="level-select-subtitle">${this.escapeHtml(this.currentGame.story || 'Select a difficulty tier below to begin challenge.')}</p>
                </div>

                <div class="level-cards-grid">
                    ${this.currentGame.levels.map(lvl => {
                        const isLvlDone = completedList.includes(`${this.currentGame.id}_lvl${lvl.level}`);
                        const badgeIcon = lvl.badge?.icon || '📦';
                        return `
                            <div class="level-card level-${lvl.level} ${isLvlDone ? 'completed' : ''}">
                                <div class="lvl-card-top">
                                    <span class="lvl-badge-tag">${lvl.badge?.name || ('Level ' + lvl.level)}</span>
                                    <span class="lvl-count-pill">${lvl.questions.length} ${chamberTag}</span>
                                </div>
                                <div class="lvl-hero-icon">${badgeIcon}</div>
                                <h3 class="lvl-card-title">${this.escapeHtml(lvl.title)}</h3>
                                <p class="lvl-card-desc">${this.escapeHtml(lvl.subtitle || '')}</p>
                                <div class="lvl-reward-row">
                                    <span class="reward-icon">${badgeIcon}</span>
                                    <span class="reward-text">Reward: <strong>${this.escapeHtml(lvl.badge?.name || 'Badge')}</strong></span>
                                </div>
                                <button type="button" class="lvl-launch-btn" onclick="window.miraiGame.startLevel(${lvl.level})">
                                    <span>${isLvlDone ? 'REPLAY TIER ↺' : launchActionText + ' ' + lvl.level + ' ➔'}</span>
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="level-select-actions">
                    <button type="button" class="primary-btn" onclick="window.miraiGame.startLevel(1)">
                        <span>🚀 START LEVEL 1 (CADET)</span>
                    </button>
                    <button type="button" class="secondary-btn" onclick="window.miraiGame.closeGame()">
                        <span>EXIT TO ARCADE</span>
                    </button>
                </div>
            </div>
        `;
    }

    startLevel(lvlNum) {
        this.currentLevel = lvlNum;
        this.currentQIndex = 0;
        this.lives = 3;
        this.score = 0;
        this.combo = 0;
        this.bossHP = 100;
        this.mazeProgress = 0;
        this.raceLaps = 0;
        this.hintUsed = false;
        this.isSubmitting = false;
        if (window.miraiAudio) window.miraiAudio.playClick?.();
        this.renderStage();
    }

    getCurrentQuestions() {
        if (this.currentGame && this.currentGame.levels && this.currentLevel) {
            const lvl = this.currentGame.levels.find(l => l.level === this.currentLevel);
            if (lvl && Array.isArray(lvl.questions)) {
                return lvl.questions;
            }
        }
        return (this.currentGame && this.currentGame.questions) || [];
    }

    updateBackgroundVideo() {
        const bgVid = document.getElementById('gameModalBgVideo');
        if (!bgVid) return;
        const currentLvl = (typeof this.currentLevel === 'number') ? this.currentLevel : 1;
        if (currentLvl === 1) {
            bgVid.style.display = 'block';
            const playPromise = bgVid.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    bgVid.muted = true;
                    bgVid.play().catch(() => {});
                });
            }
        } else {
            bgVid.style.display = 'none';
            try { bgVid.pause(); } catch(e) {}
        }
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
        document.body.classList.remove('game-modal-open');
        clearInterval(this.timerInterval);
        const bgVid = document.getElementById('gameModalBgVideo');
        if (bgVid) {
            bgVid.style.display = 'none';
            try { bgVid.pause(); } catch(e) {}
        }
        const activeVid = document.getElementById('arcadeLevelVideo');
        if (activeVid) {
            try { activeVid.pause(); } catch(e) {}
        }
        if (this.cleanup3D) {
            this.cleanup3D();
            this.cleanup3D = null;
        }
    }

    renderStage() {
        if (!this.currentGame) return;
        this.updateBackgroundVideo();

        const lvl = (typeof this.currentLevel === 'number') ? this.currentLevel : 1;
        let videoSrc1 = 'assets/videos/code(MP4).mp4';
        let videoSrc2 = 'assets/videos/code.mp4';
        let videoBadgeText = 'LEVEL 01 // MATRIX GREEN CODE RAIN';
        let levelBadgeClass = 'badge-level-1';
        let levelDotClass = 'dot-level-1';

        if (lvl === 1) {
            videoSrc1 = 'assets/videos/code(MP4).mp4';
            videoSrc2 = 'assets/videos/code.mp4';
            videoBadgeText = 'LEVEL 01 // MATRIX GREEN CODE RAIN';
            levelBadgeClass = 'badge-level-1';
            levelDotClass = 'dot-level-1';
        } else if (lvl === 2) {
            videoSrc1 = 'assets/videos/Y56(MP4).mp4';
            videoSrc2 = 'assets/videos/y56.mp4';
            videoBadgeText = 'LEVEL 02 // QUANTUM CYBER STREAM';
            levelBadgeClass = 'badge-level-2';
            levelDotClass = 'dot-level-2';
        } else if (lvl === 3) {
            videoSrc1 = 'assets/videos/cybergoth.mp4';
            videoSrc2 = 'assets/videos/Code for SHY-shy on Solana [Video]_Cybergoth.mp4';
            videoBadgeText = 'LEVEL 03 // CYBERGOTH NEON STREAM';
            levelBadgeClass = 'badge-level-3';
            levelDotClass = 'dot-level-3';
        } else {
            // For Level > 3: alternate between Quantum and Cybergoth feeds
            if (lvl % 2 === 0) {
                videoSrc1 = 'assets/videos/Y56(MP4).mp4';
                videoSrc2 = 'assets/videos/y56.mp4';
                videoBadgeText = `LEVEL ${String(lvl).padStart(2, '0')} // QUANTUM CYBER STREAM`;
                levelBadgeClass = 'badge-level-2';
                levelDotClass = 'dot-level-2';
            } else {
                videoSrc1 = 'assets/videos/cybergoth.mp4';
                videoSrc2 = 'assets/videos/Code for SHY-shy on Solana [Video]_Cybergoth.mp4';
                videoBadgeText = `LEVEL ${String(lvl).padStart(2, '0')} // CYBERGOTH NEON STREAM`;
                levelBadgeClass = 'badge-level-3';
                levelDotClass = 'dot-level-3';
            }
        }

        const existingVid = document.getElementById('arcadeLevelVideo');
        const prevLevel = existingVid ? existingVid.dataset.level : null;
        const savedTime = (existingVid && prevLevel == lvl) ? existingVid.currentTime : 0;

        const activeQuestions = this.getCurrentQuestions();
        const totalQCount = activeQuestions.length || 10;
        const q = activeQuestions[this.currentQIndex] || {};
        const progress = Math.round((this.currentQIndex / totalQCount) * 100);
        this.hintUsed = false;
        this.questionStartTime = Date.now();

        const promptText = q.prompt || q.q || q.question || 'Evaluate the logic below and select the correct answer:';
        const qNumber = q.num || (this.currentQIndex + 1);
        const qType = q.type || 'Academic Problem';
        const qHint = q.hint || q.explain || 'Carefully trace each token and branch.';
        const qOptions = Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'];

        this.container.innerHTML = `
            <!-- FULL-ARENA BACKGROUND ANIMATION (Levels 1, 2, 3+) -->
            <div class="arcade-backdrop-container">
                <video id="arcadeLevelVideo" class="arcade-backdrop-video arcade-backdrop-animation" data-level="${lvl}" autoplay loop muted playsinline preload="auto">
                    <source src="${videoSrc1}" type="video/mp4">
                    <source src="${videoSrc2}" type="video/mp4">
                </video>
                <div class="arcade-backdrop-overlay"></div>
            </div>

            <!-- SINGLE UNIFIED TOP CYBER HUD -->
            <header class="game-top-sticky-bar" id="gameStickyHeader">
                <div class="hud-bar-left">
                    <div class="gt-left-badge">
                        <span class="gt-game-icon">⛩️</span>
                        <span class="gt-game-title">${this.escapeHtml(this.currentGame.title)}</span>
                    </div>
                    ${this.currentGame.levels ? `
                        <div class="level-pill-group">
                            ${this.currentGame.levels.map(l => `
                                <button type="button" class="level-pill-btn ${l.level === this.currentLevel ? 'active' : ''}" 
                                    onclick="window.miraiGame.startLevel(${l.level})" title="${this.escapeHtml(l.title)}">
                                    <span>LVL ${l.level}</span>
                                </button>
                            `).join('')}
                            <button type="button" class="level-pill-btn select-all-btn" onclick="window.miraiGame.renderLevelSelect()" title="View All Archives">
                                <span>📋 ARCHIVES</span>
                            </button>
                        </div>
                    ` : ''}
                </div>

                <div class="hud-bar-center">
                    <div class="hud-progress-wrap">
                        <span class="hud-q-counter">Q ${qNumber}/${totalQCount}</span>
                        <div class="game-progress-track">
                            <div class="game-progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>

                <div class="hud-bar-right">
                    <div class="hud-stat hud-stat-lives" title="Remaining Lives: ${this.lives}/3">
                        <span class="stat-label">LIVES</span>
                        <span class="stat-val heart-val">${'❤️'.repeat(Math.max(0, this.lives))}</span>
                    </div>
                    <div class="hud-stat hud-stat-score" title="Current Score">
                        <span class="stat-label">XP</span>
                        <span class="stat-val score-val">+${this.score} XP</span>
                        <span class="xp-gain-popup" id="xpGainPopup"></span>
                    </div>
                    <div class="hud-stat hud-stat-combo" title="Streak Combo">
                        <span class="stat-label">COMBO</span>
                        <span class="stat-val combo-val">${this.combo}x 🔥</span>
                    </div>
                    <button type="button" class="video-sound-toggle-btn" onclick="const v = document.getElementById('arcadeLevelVideo'); if (v) { v.muted = !v.muted; this.textContent = v.muted ? '🔇' : '🔊'; }" title="Toggle Audio">🔇</button>
                    <button type="button" class="floating-game-close-btn" onclick="window.miraiGame.closeGame()" title="Exit Game & Return (Esc)">
                        <span>✕ EXIT</span>
                    </button>
                </div>
            </header>

            <!-- TWO-PANE 50/50 WORKSPACE -->
            <div class="game-split-arena" id="currentQuestionCard">
                <!-- LEFT 50% — Question, Prompt, Code Terminal, Clue Hint Box -->
                <div class="game-pane-left" id="gameArenaLeftPane">
                    <div class="pane-header">
                        <span class="pane-tag">📄 ${this.escapeHtml(qType)}</span>
                        <div class="pane-badge-group">
                            <span class="q-badge">Question ${qNumber} of ${totalQCount}</span>
                            <button type="button" class="hint-trigger-btn" id="hintBtn" onclick="window.miraiGame.revealHint()">
                                💡 Need Clue? (-5 XP)
                            </button>
                        </div>
                    </div>

                    <!-- Question Prompt / Description -->
                    <div class="q-prompt">${this.escapeHtml(promptText)}</div>

                    <!-- Code Terminal (Compact & Clear, max-height: 280px) -->
                    ${q.code ? `
                        <div class="code-terminal">
                            <div class="code-terminal-header">
                                <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
                                <span class="terminal-title">compiler://${this.currentGame.track || 'terminal'}.cpp</span>
                            </div>
                            <pre><code>${this.escapeHtml(q.code)}</code></pre>
                        </div>
                    ` : ''}

                    <!-- Hint / Clue Box -->
                    <div class="hint-box" id="hintBox" style="display: none;">
                        <strong>Investigation Clue:</strong> ${this.escapeHtml(qHint)}
                    </div>

                    <!-- THEMED IN-GAME CATEGORY MINI-GAME / SIMULATOR STAGE -->
                    <div class="mechanic-stage category-game-stage" id="categoryGameStage">
                        ${this.getMechanicVisuals()}
                    </div>
                </div>

                <!-- RIGHT 50% — Options & Controls Pane -->
                <div class="game-pane-right" id="gameArenaRightPane">
                    <!-- Top Bar Above Options (.arena-options-topbar) -->
                    <div class="arena-options-topbar">
                        <div class="arena-stat-pill arena-stat-hearts">
                            <span class="stat-pill-label">LIVES</span>
                            <span class="heart-val">${'❤️'.repeat(Math.max(0, this.lives))}</span>
                        </div>
                        <div class="arena-stat-pill arena-stat-xp">
                            <span class="stat-pill-label">EXP</span>
                            <span class="score-val">+${this.score} XP</span>
                        </div>
                        <button type="button" class="arena-cross-exit-btn" onclick="window.miraiGame.closeGame()" title="Exit Game">✕</button>
                    </div>

                    <!-- Below the Top Bar -->
                    <div class="pane-instruction">Select the verified compiler execution or return token:</div>

                    <!-- Options grid: .options-grid containing the 4 choice buttons (A, B, C, D) -->
                    <div class="options-grid" id="arenaOptionsList">
                        ${qOptions.map((opt, idx) => `
                            <button type="button" class="option-btn" data-opt-idx="${idx}" onclick="window.miraiGame.submitAnswer(${idx})">
                                <span class="opt-key">${String.fromCharCode(65 + idx)}</span>
                                <span class="opt-label">${this.escapeHtml(opt)}</span>
                            </button>
                        `).join('')}
                    </div>

                    <!-- Feedback Area (Results, Explanations, Next Action) -->
                    <div class="feedback-panel" id="feedbackPanel" style="display: none;"></div>
                </div>
            </div>
        `;

        // Maintain continuous playback for animation video
        const vid = document.getElementById('arcadeLevelVideo');
        if (vid) {
            if (savedTime > 0) {
                try { vid.currentTime = savedTime; } catch(e) {}
            }
            const playPromise = vid.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    vid.muted = true;
                    vid.play().catch(() => {});
                });
            }
        }

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
        const activeQuestions = this.getCurrentQuestions();
        const totalQCount = (activeQuestions && activeQuestions.length) || 10;
        const currentLevelObj = (this.currentGame.levels && this.currentGame.levels.find(l => l.level === this.currentLevel)) || {};
        const levelTitle = currentLevelObj.title || `Level ${this.currentLevel || 1}`;
        const levelSubtitle = currentLevelObj.subtitle || this.currentGame.topic || '';
        const levelBadgeIcon = currentLevelObj.badge?.icon || this.currentGame.badge?.icon || '🎮';

        if (m === 'boss_battle') {
            return `
                <div class="boss-arena" id="bossArenaStage">
                    <div class="stage-hud-header">
                        <div class="stage-badge-tag"><span class="badge-icon">⚔️</span> <span>CALCULATOR BOSS BATTLE // ${this.escapeHtml(levelTitle.toUpperCase())}</span></div>
                        <div class="stage-telemetry">
                            <span class="telemetry-item"><i class="t-icon">👹</i> BOSS HP: <b>${this.bossHP}</b>/100</span>
                            <span class="telemetry-item"><i class="t-icon">⚔️</i> ATK CHARGE: <b>READY</b></span>
                            <span class="telemetry-item"><i class="t-icon">💥</i> PHASE: <b>OVERDRIVE</b></span>
                        </div>
                    </div>
                    <div class="boss-nameplate">
                        <span class="boss-title">CYBER MECHA ONI // OPERATOR SLAYER</span>
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
                    <div class="stage-action-bar">
                        <span class="stage-instruction">⚔️ The Operator Boss unleashes logic puzzles. Execute verified arithmetic & bitwise expressions to slash the Oni HP!</span>
                        <button type="button" class="stage-interactive-btn" onclick="window.miraiGame && window.miraiGame.strikeBossKatana()">
                            <span>⚔️ KATANA STRIKE</span>
                        </button>
                    </div>
                </div>
            `;
        } else if (m === 'detective') {
            return `
                <div class="detective-crime-scene" id="detectiveStage">
                    <div class="stage-hud-header">
                        <div class="stage-badge-tag"><span class="badge-icon">🔍</span> <span>CODE DETECTIVE // ${this.escapeHtml(levelTitle.toUpperCase())}</span></div>
                        <div class="stage-telemetry">
                            <span class="telemetry-item"><i class="t-icon">🕵️</i> CASE #${qNum}</span>
                            <span class="telemetry-item"><i class="t-icon">🔎</i> EVIDENCE: <b>${Math.max(0, qNum - 1)}</b>/10</span>
                            <span class="telemetry-item"><i class="t-icon">🛡️</i> CLEARANCE: <b>HIGH</b></span>
                        </div>
                    </div>
                    <div class="detective-investigation-arena">
                        <div class="scene-radar">
                            <div class="radar-sweep"></div>
                            <div class="radar-dot dot1"></div>
                            <div class="radar-dot dot2"></div>
                        </div>
                        <div class="evidence-board">
                            <div class="evidence-tag">CRIME SCENE #${qNum}: LOGICAL FORENSICS</div>
                            <div class="evidence-desc">Scanning source code syntax for memory leaks, missing terminators, and uninitialized references.</div>
                            <div class="evidence-status-pill">STATUS: ANOMALY TRACED</div>
                        </div>
                    </div>
                    <div class="stage-action-bar">
                        <span class="stage-instruction">🔍 Every broken program is a cyber crime scene. Inspect the clues, trace the logic, and uncover the compiler bug!</span>
                        <button type="button" class="stage-interactive-btn" onclick="window.miraiGame && window.miraiGame.scanCrimeScene()">
                            <span>🔎 SCAN CRIME SCENE</span>
                        </button>
                    </div>
                </div>
            `;
        } else if (m === 'box_sort') {
            return `
                <div class="warehouse-stage" id="warehouseStage">
                    <div class="stage-hud-header">
                        <div class="stage-badge-tag"><span class="badge-icon">📦</span> <span>BOX SORTING WAREHOUSE // ${this.escapeHtml(levelTitle.toUpperCase())}</span></div>
                        <div class="stage-telemetry">
                            <span class="telemetry-item"><i class="t-icon">📦</i> CARGO #${qNum}</span>
                            <span class="telemetry-item"><i class="t-icon">🏗️</i> CRANE: <b>ACTIVE</b></span>
                            <span class="telemetry-item"><i class="t-icon">⚖️</i> CAPACITY: <b>100%</b></span>
                        </div>
                    </div>
                    <div class="warehouse-sorting-yard">
                        <div class="warehouse-crane-arm">
                            <div class="warehouse-drop-item" id="warehouseItem">
                                <span class="cargo-icon">📦</span>
                                <span class="cargo-tag">DATA CARGO #${qNum}</span>
                            </div>
                        </div>
                        <div class="warehouse-bins">
                            <div class="w-bin bin-int"><span class="bin-type">int</span><span class="bin-size">4B</span></div>
                            <div class="w-bin bin-float"><span class="bin-type">float</span><span class="bin-size">4B</span></div>
                            <div class="w-bin bin-char"><span class="bin-type">char</span><span class="bin-size">1B</span></div>
                            <div class="w-bin bin-bool"><span class="bin-type">bool</span><span class="bin-size">1B</span></div>
                            <div class="w-bin bin-string"><span class="bin-type">string</span><span class="bin-size">VAR</span></div>
                        </div>
                    </div>
                    <div class="stage-action-bar">
                        <span class="stage-instruction">📦 Data values arrive on the conveyor. Classify each literal or variable into its precise memory storage bin!</span>
                        <button type="button" class="stage-interactive-btn" onclick="window.miraiGame && window.miraiGame.dropWarehouseCrate()">
                            <span>📦 DROP DATA CRATE</span>
                        </button>
                    </div>
                </div>
            `;
        } else if (m === 'maze_runner') {
            const totalSteps = totalQCount;
            const pct = Math.min(94, ((this.mazeProgress || 0) / Math.max(1, totalSteps)) * 100);
            return `
                <div class="maze-stage" id="mazeStage">
                    <div class="stage-hud-header">
                        <div class="stage-badge-tag"><span class="badge-icon">🌀</span> <span>MAZE RUNNER // ${this.escapeHtml(levelTitle.toUpperCase())}</span></div>
                        <div class="stage-telemetry">
                            <span class="telemetry-item"><i class="t-icon">🚪</i> GATES: <b>${this.mazeProgress || 0}</b>/${totalSteps}</span>
                            <span class="telemetry-item"><i class="t-icon">📍</i> PROGRESS: <b>${Math.round(pct)}%</b></span>
                            <span class="telemetry-item"><i class="t-icon">🎯</i> PORTAL ALPHA</span>
                        </div>
                    </div>
                    <div class="maze-gates-track">
                        ${Array.from({ length: totalSteps }, (_, i) => `
                            <div class="maze-gate-step ${i < this.mazeProgress ? 'cleared' : (i === this.mazeProgress ? 'active' : '')}" title="Gate ${i+1}">
                                <span class="gate-num">${i < this.mazeProgress ? '✓' : (i + 1)}</span>
                                <span class="gate-label">${i < this.mazeProgress ? 'OPEN' : 'LOCKED'}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="runner-avatar-track">
                        <div class="runner-avatar" style="left: ${pct}%">
                            <span class="drone-icon">🌀</span>
                            <span class="drone-trail">🏃‍♂️💨</span>
                        </div>
                        <span class="exit-portal-node">🌀 EXIT PORTAL</span>
                    </div>
                    <div class="stage-action-bar">
                        <span class="stage-instruction">🌀 Conditional branching controls which portal gates open. Advance the cyber runner through each logical junction!</span>
                        <button type="button" class="stage-interactive-btn" onclick="window.miraiGame && window.miraiGame.pingMazeRadar()">
                            <span>📡 PING RADAR</span>
                        </button>
                    </div>
                </div>
            `;
        } else if (m === 'loop_racer') {
            const totalLaps = totalQCount;
            const currentLaps = this.raceLaps || 0;
            const nitroPct = Math.round((currentLaps / Math.max(1, totalLaps)) * 100);
            const carLeftPct = Math.min(92, (currentLaps / Math.max(1, totalLaps)) * 92);
            const currentSpeed = 220 + currentLaps * 15;
            const currentGear = Math.min(6, 1 + Math.floor(currentLaps / 2));
            return `
                <div class="racing-stage" id="racingStage">
                    <div class="stage-hud-header">
                        <div class="stage-badge-tag"><span class="badge-icon">🏎️</span> <span>SPEED CODER // ${this.escapeHtml(levelTitle.toUpperCase())}</span></div>
                        <div class="stage-telemetry">
                            <span class="telemetry-item"><i class="t-icon">🏁</i> LAP <b>${currentLaps}</b>/${totalLaps}</span>
                            <span class="telemetry-item"><i class="t-icon">⚡</i> <b>${currentSpeed}</b> KM/H</span>
                            <span class="telemetry-item"><i class="t-icon">⚙️</i> GEAR <b>${currentGear}</b></span>
                            <span class="telemetry-item nitro-val"><i class="t-icon">🔥</i> <b>${nitroPct}%</b> NITRO</span>
                        </div>
                    </div>
                    <div class="race-track-view" onclick="window.miraiGame && window.miraiGame.boostNitroCar()">
                        <div class="track-curb track-curb-top"></div>
                        <div class="neon-track-line"></div>
                        <div class="track-curb track-curb-bottom"></div>
                        <div class="race-car" id="raceCarAvatar" style="left: ${carLeftPct}%">
                            <span class="car-body">🏎️</span>
                            <span class="car-exhaust-flame">🔥</span>
                            <span class="car-speed-tag">${currentSpeed} KM/H</span>
                        </div>
                        <div class="finish-line-flag">🏁</div>
                    </div>
                    <div class="stage-action-bar">
                        <span class="stage-instruction">🏎️ Answer verified compiler tokens to accelerate, drift through loop turns & complete Grand Prix circuits!</span>
                        <button type="button" class="stage-interactive-btn" onclick="window.miraiGame && window.miraiGame.boostNitroCar()">
                            <span>🚀 NITRO REV (+45 KM/H)</span>
                        </button>
                    </div>
                </div>
            `;
        } else if (m === 'pattern_builder') {
            return `
                <div class="pattern-stage" id="patternStage">
                    <div class="stage-hud-header">
                        <div class="stage-badge-tag"><span class="badge-icon">🧱</span> <span>PATTERN BUILDER (LEGO STYLE) // ${this.escapeHtml(levelTitle.toUpperCase())}</span></div>
                        <div class="stage-telemetry">
                            <span class="telemetry-item"><i class="t-icon">🧱</i> VOXELS: <b>${Math.min(totalQCount, qNum * 3)}</b> UNITS</span>
                            <span class="telemetry-item"><i class="t-icon">🔄</i> LOOP: <b>i=${qNum}, j=1..${qNum}</b></span>
                            <span class="telemetry-item"><i class="t-icon">🏗️</i> INTEGRITY: <b>100%</b></span>
                        </div>
                    </div>
                    <div class="voxel-construction-yard">
                        <div class="voxel-grid-preview" id="patternPreview">
                            ${Array.from({ length: Math.min(5, qNum) }, (_, r) => `
                                <div class="voxel-row">
                                    ${Array.from({ length: r + 1 }, () => `<span class="lego-brick glow-${(r % 3) + 1}">■</span>`).join(' ')}
                                    <span class="voxel-row-tag">&lt;row ${r+1}&gt;</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="voxel-schematic-hud">
                            <div class="schematic-title">VOXEL SCHEMATIC #${qNum}</div>
                            <div class="schematic-spec">Nested loops generate coordinate matrix. Outer loop controls vertical elevation; inner loop stacks horizontal Lego voxels.</div>
                        </div>
                    </div>
                    <div class="stage-action-bar">
                        <span class="stage-instruction">🧱 Nested loop code is your architectural blueprint. Construct holographic voxel blocks layer-by-layer!</span>
                        <button type="button" class="stage-interactive-btn" onclick="window.miraiGame && window.miraiGame.snapLegoBrick()">
                            <span>🧱 SNAP LEGO VOXEL</span>
                        </button>
                    </div>
                </div>
            `;
        } else if (m === 'function_factory') {
            return `
                <div class="factory-stage" id="factoryStage">
                    <div class="stage-hud-header">
                        <div class="stage-badge-tag"><span class="badge-icon">⚙️</span> <span>FUNCTION FACTORY // ${this.escapeHtml(levelTitle.toUpperCase())}</span></div>
                        <div class="stage-telemetry">
                            <span class="telemetry-item"><i class="t-icon">⚡</i> CONDUIT #${String(qNum).padStart(2, '0')}</span>
                            <span class="telemetry-item"><i class="t-icon">🔄</i> ROTATION: <b>3600 RPM</b></span>
                            <span class="telemetry-item"><i class="t-icon">📦</i> RETURN BUFFER: <b>READY</b></span>
                        </div>
                    </div>
                    <div class="factory-conveyor-assembly">
                        <div class="factory-pipe pipe-in">
                            <span class="pipe-label">INPUT HOPPER</span>
                            <span class="pipe-arg">param(x, y) ➔</span>
                        </div>
                        <div class="factory-machine" id="factoryMachineCore">
                            <span class="factory-gear rotating">⚙️</span>
                            <span class="machine-label">PROCESSOR #${String(qNum).padStart(2, '0')}</span>
                            <span class="factory-gear rotating reverse">⚙️</span>
                        </div>
                        <div class="factory-pipe pipe-out">
                            <span class="pipe-label">OUTPUT CONDUIT</span>
                            <span class="pipe-arg">➔ return 0xAF;</span>
                        </div>
                    </div>
                    <div class="stage-action-bar">
                        <span class="stage-instruction">⚙️ Inputs enter the conveyor, logical parameters are evaluated, and return tokens exit through the conduit!</span>
                        <button type="button" class="stage-interactive-btn" onclick="window.miraiGame && window.miraiGame.cycleFactoryGears()">
                            <span>⚡ CYCLE GEARS</span>
                        </button>
                    </div>
                </div>
            `;
        } else if (m === 'house_builder') {
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="house-builder-stage" id="houseBuilderStage">
                    <div class="stage-hud-header">
                        <div class="stage-badge-tag"><span class="badge-icon">🏛️</span> <span>BUILD THE HOUSE // ${this.escapeHtml(levelTitle.toUpperCase())}</span></div>
                        <div class="stage-telemetry">
                            <span class="telemetry-item"><i class="t-icon">🏗️</i> PROGRESS: <b>${progressPct}%</b></span>
                            <span class="telemetry-item"><i class="t-icon">🧱</i> BLOCKS: <b>${progress}</b>/${totalQCount}</span>
                            <span class="telemetry-item"><i class="t-icon">📐</i> BLUEPRINT: <b>DOM</b></span>
                        </div>
                    </div>
                    <div class="house-blueprint-scaffold">
                        <div class="house-beam beam-roof ${progressPct >= 70 ? 'active' : ''}"><span>▲ ROOF &lt;body&gt; + &lt;header&gt;</span></div>
                        <div class="house-beam beam-walls ${progressPct >= 40 ? 'active' : ''}"><span>■ PILLARS &lt;head&gt; + &lt;title&gt; + &lt;meta&gt;</span></div>
                        <div class="house-beam beam-foundation ${progressPct >= 10 ? 'active' : ''}"><span>▄ FOUNDATION &lt;!DOCTYPE html&gt; + &lt;html&gt;</span></div>
                    </div>
                    <div class="stage-action-bar">
                        <span class="stage-instruction">🏛️ Assemble foundational HTML tags to complete the architectural blueprint of the cyber pagoda!</span>
                        <button type="button" class="stage-interactive-btn" onclick="window.miraiGame && window.miraiGame.inspectHouseBlueprint()">
                            <span>📐 BLUEPRINT SCAN</span>
                        </button>
                    </div>
                </div>
            `;
        } else if (m === 'fashion_show') {
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="fashion-show-stage" id="fashionShowStage">
                    <div class="stage-hud-header">
                        <div class="stage-badge-tag"><span class="badge-icon">✨</span> <span>FONT FASHION SHOW // ${this.escapeHtml(levelTitle.toUpperCase())}</span></div>
                        <div class="stage-telemetry">
                            <span class="telemetry-item"><i class="t-icon">💃</i> MODEL: <b>#${progress + 1}</b></span>
                            <span class="telemetry-item"><i class="t-icon">✨</i> SCORE: <b>${90 + (progress % 10)}/100</b></span>
                            <span class="telemetry-item"><i class="t-icon">⭐</i> ACCLAIM: <b>★★★★★</b></span>
                        </div>
                    </div>
                    <div class="fashion-runway-track">
                        <div class="runway-spotlight">✨ 💃 CYBER RUNWAY MODEL #${String(Math.min(totalQCount, progress + 1)).padStart(2, '0')} 🕺 ✨</div>
                        <div class="runway-text-preview">
                            <span class="preview-tag">&lt;h1&gt;</span>
                            <span class="preview-styled-text">FASHION TYPOGRAPHY</span>
                            <span class="preview-tag">&lt;/h1&gt;</span>
                        </div>
                    </div>
                    <div class="stage-action-bar">
                        <span class="stage-instruction">✨ Style the models with semantic headings, italics, and bold tags to dominate the cyber runway!</span>
                        <button type="button" class="stage-interactive-btn" onclick="window.miraiGame && window.miraiGame.poseRunwayModel()">
                            <span>✨ RUNWAY POSE</span>
                        </button>
                    </div>
                </div>
            `;
        } else if (m === 'shopping_list') {
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="shopping-list-stage" id="shoppingListStage">
                    <div class="stage-hud-header">
                        <div class="stage-badge-tag"><span class="badge-icon">📋</span> <span>SHOPPING LIST CHALLENGE // ${this.escapeHtml(levelTitle.toUpperCase())}</span></div>
                        <div class="stage-telemetry">
                            <span class="telemetry-item"><i class="t-icon">🛒</i> ITEMS: <b>${progress}</b>/${totalQCount}</span>
                            <span class="telemetry-item"><i class="t-icon">📦</i> INVENTORY: <b>${progressPct}%</b></span>
                            <span class="telemetry-item"><i class="t-icon">🏷️</i> LIST: <b>UL/OL</b></span>
                        </div>
                    </div>
                    <div class="shopping-cart-container">
                        <div class="cart-header">🛒 CYBER MART CHECKOUT CART</div>
                        <div class="cart-items-preview">
                            <span class="cart-tag">&lt;ul&gt;</span>
                            <span class="cart-item-slot ${progress >= 1 ? 'filled' : ''}">[📦 &lt;li&gt;ITEM 01&lt;/li&gt;]</span>
                            <span class="cart-item-slot ${progress >= 4 ? 'filled' : ''}">[📦 &lt;li&gt;ITEM 04&lt;/li&gt;]</span>
                            <span class="cart-item-slot ${progress >= 8 ? 'filled' : ''}">[📦 &lt;li&gt;ITEM 08&lt;/li&gt;]</span>
                            <span class="cart-tag">&lt;/ul&gt;</span>
                        </div>
                    </div>
                    <div class="stage-action-bar">
                        <span class="stage-instruction">📋 Assemble ordered and unordered grocery list elements to stock the cyber mart cart!</span>
                        <button type="button" class="stage-interactive-btn" onclick="window.miraiGame && window.miraiGame.scanShoppingItem()">
                            <span>🛒 SCAN ITEM</span>
                        </button>
                    </div>
                </div>
            `;
        } else if (m === 'treasure_map') {
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="treasure-map-stage" id="treasureMapStage">
                    <div class="stage-hud-header">
                        <div class="stage-badge-tag"><span class="badge-icon">🗺️</span> <span>TREASURE MAP NAVIGATION // ${this.escapeHtml(levelTitle.toUpperCase())}</span></div>
                        <div class="stage-telemetry">
                            <span class="telemetry-item"><i class="t-icon">🧭</i> ROUTE: <b>${progress}</b>/${totalQCount}</span>
                            <span class="telemetry-item"><i class="t-icon">⚓</i> ANCHOR: <b>&lt;a href&gt;</b></span>
                            <span class="telemetry-item"><i class="t-icon">🏝️</i> CHART: <b>${progressPct}%</b></span>
                        </div>
                    </div>
                    <div class="treasure-map-container">
                        <div class="map-header">🧭 CYBERSPACE NAVIGATION RADAR</div>
                        <div class="map-archipelago-preview">
                            <span class="map-route-node ${progress >= 0 ? 'visited' : ''}">⚓ [PORT 00]</span>
                            <span class="map-route-line">━━━▶</span>
                            <span class="map-route-node ${progress >= 3 ? 'visited' : ''}">🏝️ [ISLE 03]</span>
                            <span class="map-route-line">━━━▶</span>
                            <span class="map-route-node ${progress >= 7 ? 'visited' : ''}">🌊 [REEF 07]</span>
                            <span class="map-route-line">━━━▶</span>
                            <span class="map-route-node ${progress >= totalQCount ? 'visited' : ''}">👑 [TREASURE]</span>
                        </div>
                    </div>
                    <div class="stage-action-bar">
                        <span class="stage-instruction">🗺️ Chart hyperlink paths and navigation anchors across cyberspace to uncover the pirate treasure!</span>
                        <button type="button" class="stage-interactive-btn" onclick="window.miraiGame && window.miraiGame.dropPirateAnchor()">
                            <span>⚓ DROP ANCHOR</span>
                        </button>
                    </div>
                </div>
            `;
        } else if (m === 'gallery_puzzle') {
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="gallery-puzzle-stage" id="galleryPuzzleStage">
                    <div class="stage-hud-header">
                        <div class="stage-badge-tag"><span class="badge-icon">🖼️</span> <span>PHOTO GALLERY PUZZLE // ${this.escapeHtml(levelTitle.toUpperCase())}</span></div>
                        <div class="stage-telemetry">
                            <span class="telemetry-item"><i class="t-icon">🖼️</i> EXHIBITS: <b>${progress}</b>/${totalQCount}</span>
                            <span class="telemetry-item"><i class="t-icon">📸</i> APERTURE: <b>f/1.4</b></span>
                            <span class="telemetry-item"><i class="t-icon">🌟</i> CURATED: <b>${progressPct}%</b></span>
                        </div>
                    </div>
                    <div class="gallery-canvas-container">
                        <div class="gallery-header">🖼️ MIRAI HOLOGRAPHIC ART GALLERY</div>
                        <div class="gallery-frames-grid">
                            <span class="art-frame ${progress >= 1 ? 'mounted' : ''}">🖼️ [FRAME 01]</span>
                            <span class="art-frame ${progress >= 4 ? 'mounted' : ''}">🎨 [FRAME 04]</span>
                            <span class="art-frame ${progress >= 8 ? 'mounted' : ''}">📽️ [FRAME 08]</span>
                            <span class="art-frame ${progress >= totalQCount ? 'mounted' : ''}">🌟 [MASTERPIECE]</span>
                        </div>
                    </div>
                    <div class="stage-action-bar">
                        <span class="stage-instruction">🖼️ Mount images, configure alt tags, and organize responsive media to complete the exhibit!</span>
                        <button type="button" class="stage-interactive-btn" onclick="window.miraiGame && window.miraiGame.takeGallerySnapshot()">
                            <span>📸 TAKE SNAPSHOT</span>
                        </button>
                    </div>
                </div>
            `;
        } else if (m === 'timetable_builder') {
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="timetable-builder-stage" id="timetableBuilderStage">
                    <div class="stage-hud-header">
                        <div class="stage-badge-tag"><span class="badge-icon">📅</span> <span>CLASSROOM TIMETABLE BUILDER // ${this.escapeHtml(levelTitle.toUpperCase())}</span></div>
                        <div class="stage-telemetry">
                            <span class="telemetry-item"><i class="t-icon">📊</i> MATRIX: <b>${progress}</b>/${totalQCount}</span>
                            <span class="telemetry-item"><i class="t-icon">🔔</i> PERIOD: <b>0${Math.min(8, progress + 1)}</b></span>
                            <span class="telemetry-item"><i class="t-icon">⚡</i> GRID: <b>TABLE</b></span>
                        </div>
                    </div>
                    <div class="timetable-grid-container">
                        <div class="timetable-header">📊 ACADEMY TIMETABLE MATRIX</div>
                        <div class="timetable-matrix-preview">
                            <div class="matrix-row header-row">
                                <span class="matrix-cell th-cell">&lt;th&gt;PERIOD&lt;/th&gt;</span>
                                <span class="matrix-cell th-cell">&lt;th&gt;MON&lt;/th&gt;</span>
                                <span class="matrix-cell th-cell">&lt;th&gt;TUE&lt;/th&gt;</span>
                            </div>
                            <div class="matrix-row">
                                <span class="matrix-cell ${progress >= 1 ? 'filled' : ''}">&lt;td&gt;01&lt;/td&gt;</span>
                                <span class="matrix-cell ${progress >= 4 ? 'filled' : ''}">&lt;td&gt;MATH&lt;/td&gt;</span>
                                <span class="matrix-cell ${progress >= 7 ? 'filled' : ''}">&lt;td&gt;CODE&lt;/td&gt;</span>
                            </div>
                        </div>
                    </div>
                    <div class="stage-action-bar">
                        <span class="stage-instruction">📅 Build HTML table rows, headers, and column spans to assemble the Academy schedule!</span>
                        <button type="button" class="stage-interactive-btn" onclick="window.miraiGame && window.miraiGame.ringTimetableChime()">
                            <span>🔔 RING CHIME</span>
                        </button>
                    </div>
                </div>
            `;
        } else if (m === 'desk_rush') {
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="desk-rush-stage" id="deskRushStage">
                    <div class="stage-hud-header">
                        <div class="stage-badge-tag"><span class="badge-icon">📝</span> <span>REGISTRATION DESK RUSH // ${this.escapeHtml(levelTitle.toUpperCase())}</span></div>
                        <div class="stage-telemetry">
                            <span class="telemetry-item"><i class="t-icon">🪪</i> QUEUE: <b>${progress}</b>/${totalQCount}</span>
                            <span class="telemetry-item"><i class="t-icon">📋</i> FORM: <b>POST</b></span>
                            <span class="telemetry-item"><i class="t-icon">🎓</i> ADMITTED: <b>${progressPct}%</b></span>
                        </div>
                    </div>
                    <div class="desk-queue-container">
                        <div class="desk-header">📝 MIRAI ADMISSIONS REGISTRATION DESK</div>
                        <div class="desk-queue-preview">
                            <span class="queue-cadet ${progress >= 1 ? 'processed' : ''}">🪪 [CADET 01]</span>
                            <span class="queue-cadet ${progress >= 4 ? 'processed' : ''}">🪪 [CADET 04]</span>
                            <span class="queue-cadet ${progress >= 8 ? 'processed' : ''}">🪪 [CADET 08]</span>
                            <span class="queue-cadet ${progress >= totalQCount ? 'processed' : ''}">🎓 [ADMITTED]</span>
                        </div>
                    </div>
                    <div class="stage-action-bar">
                        <span class="stage-instruction">📝 Collect cadet form submissions, validate input tags, and issue holographic ID badges!</span>
                        <button type="button" class="stage-interactive-btn" onclick="window.miraiGame && window.miraiGame.issueAdmissionsBadge()">
                            <span>🪪 ISSUE BADGE</span>
                        </button>
                    </div>
                </div>
            `;
        } else if (m === 'city_planner') {
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="city-planner-stage" id="cityPlannerStage">
                    <div class="stage-hud-header">
                        <div class="stage-badge-tag"><span class="badge-icon">🏙️</span> <span>CITY PLANNER // ${this.escapeHtml(levelTitle.toUpperCase())}</span></div>
                        <div class="stage-telemetry">
                            <span class="telemetry-item"><i class="t-icon">🏙️</i> ZONES: <b>${progress}</b>/${totalQCount}</span>
                            <span class="telemetry-item"><i class="t-icon">⚡</i> GRID: <b>98.4%</b></span>
                            <span class="telemetry-item"><i class="t-icon">📐</i> SEMANTICS: <b>OK</b></span>
                        </div>
                    </div>
                    <div class="city-skyline-container">
                        <div class="city-header">🏙️ NEO-TOKYO METROPOLITAN BLUEPRINT</div>
                        <div class="city-sectors-preview">
                            <span class="city-zone ${progress >= 1 ? 'zoned' : ''}">🏛️ &lt;header&gt;</span>
                            <span class="city-zone ${progress >= 3 ? 'zoned' : ''}">🚇 &lt;nav&gt;</span>
                            <span class="city-zone ${progress >= 5 ? 'zoned' : ''}">🏢 &lt;main&gt;</span>
                            <span class="city-zone ${progress >= 8 ? 'zoned' : ''}">🏬 &lt;aside&gt;</span>
                            <span class="city-zone ${progress >= totalQCount ? 'zoned' : ''}">⚓ &lt;footer&gt;</span>
                        </div>
                    </div>
                    <div class="stage-action-bar">
                        <span class="stage-instruction">🏙️ Structure the metropolitan skyline using semantic HTML tags: header, nav, main, aside, and footer!</span>
                        <button type="button" class="stage-interactive-btn" onclick="window.miraiGame && window.miraiGame.expandCityZone()">
                            <span>🏙️ EXPAND ZONE</span>
                        </button>
                    </div>
                </div>
            `;
        } else if (m === 'conveyor_sort') {
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="conveyor-sort-stage" id="conveyorSortStage">
                    <div class="stage-hud-header">
                        <div class="stage-badge-tag"><span class="badge-icon">📦</span> <span>BLOCK VS INLINE SORTING RACE // ${this.escapeHtml(levelTitle.toUpperCase())}</span></div>
                        <div class="stage-telemetry">
                            <span class="telemetry-item"><i class="t-icon">⚡</i> SORTED: <b>${progress}</b>/${totalQCount}</span>
                            <span class="telemetry-item"><i class="t-icon">📦</i> ACCURACY: <b>100%</b></span>
                            <span class="telemetry-item"><i class="t-icon">🎯</i> PIPELINE: <b>ACTIVE</b></span>
                        </div>
                    </div>
                    <div class="conveyor-belt-container">
                        <div class="conveyor-header">⚡ RENDERING PIPELINE CONVEYOR BELT</div>
                        <div class="conveyor-bins-preview">
                            <div class="conveyor-bin block-bin">
                                <span class="bin-label">📦 BLOCK BIN</span>
                                <span class="bin-tag ${progress >= 1 ? 'sorted' : ''}">&lt;div&gt;</span>
                                <span class="bin-tag ${progress >= 5 ? 'sorted' : ''}">&lt;p&gt;</span>
                            </div>
                            <div class="conveyor-divider">⚡</div>
                            <div class="conveyor-bin inline-bin">
                                <span class="bin-label">🔗 INLINE BIN</span>
                                <span class="bin-tag ${progress >= 3 ? 'sorted' : ''}">&lt;span&gt;</span>
                                <span class="bin-tag ${progress >= 8 ? 'sorted' : ''}">&lt;a&gt;</span>
                            </div>
                        </div>
                    </div>
                    <div class="stage-action-bar">
                        <span class="stage-instruction">📦 Separate full-width block elements from agile inline tags as they race down the conveyor belt!</span>
                        <button type="button" class="stage-interactive-btn" onclick="window.miraiGame && window.miraiGame.switchConveyorPiston()">
                            <span>⚡ SWITCH PISTON</span>
                        </button>
                    </div>
                </div>
            `;
        } else if (m === 'secret_codes') {
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="secret-codes-stage" id="secretCodesStage">
                    <div class="stage-hud-header">
                        <div class="stage-badge-tag"><span class="badge-icon">🕵️</span> <span>SECRET CODES AND HIDDEN NOTES // ${this.escapeHtml(levelTitle.toUpperCase())}</span></div>
                        <div class="stage-telemetry">
                            <span class="telemetry-item"><i class="t-icon">🔐</i> DECRYPTED: <b>${progress}</b>/${totalQCount}</span>
                            <span class="telemetry-item"><i class="t-icon">📜</i> CIPHER: <b>ACTIVE</b></span>
                            <span class="telemetry-item"><i class="t-icon">💎</i> INTEL: <b>${progressPct}%</b></span>
                        </div>
                    </div>
                    <div class="secret-terminal-container">
                        <div class="terminal-header">🕵️ MIRAI INTELLIGENCE CIPHER TERMINAL</div>
                        <div class="terminal-ciphers-preview">
                            <span class="cipher-node ${progress >= 1 ? 'decrypted' : ''}">🔐 &amp;lt;</span>
                            <span class="cipher-node ${progress >= 3 ? 'decrypted' : ''}">📜 &lt;!-- --&gt;</span>
                            <span class="cipher-node ${progress >= 6 ? 'decrypted' : ''}">🛰️ &lt;iframe&gt;</span>
                            <span class="cipher-node ${progress >= 8 ? 'decrypted' : ''}">🏷️ &lt;meta&gt;</span>
                            <span class="cipher-node ${progress >= totalQCount ? 'decrypted' : ''}">💎 [DECRYPTED]</span>
                        </div>
                    </div>
                    <div class="stage-action-bar">
                        <span class="stage-instruction">🕵️ Decode hidden HTML comments, special entities, and metadata tags concealed in the cyber terminal!</span>
                        <button type="button" class="stage-interactive-btn" onclick="window.miraiGame && window.miraiGame.crackSecretCipher()">
                            <span>🔐 CRACK CIPHER</span>
                        </button>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="generic-theme-stage">
                    <div class="stage-hud-header">
                        <div class="stage-badge-tag"><span class="badge-icon">${levelBadgeIcon}</span> <span>${this.escapeHtml(this.currentGame.title.toUpperCase())} // ${this.escapeHtml(levelTitle.toUpperCase())}</span></div>
                    </div>
                    <div class="theme-icon-badge">${this.currentGame.badge?.icon || '🎮'}</div>
                    <div class="theme-tagline">${this.escapeHtml(this.currentGame.rules || 'Solve the puzzle below to advance.')}</div>
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
        if (this.isSubmitting) return;
        this.isSubmitting = true;

        const activeQuestions = this.getCurrentQuestions();
        const q = (activeQuestions && activeQuestions[this.currentQIndex]) || {};
        const targetCorrect = (typeof q.correctIndex === 'number') ? q.correctIndex : (typeof q.correct === 'number' ? q.correct : 0);
        const isCorrect = chosenIdx === targetCorrect;
        const fbPanel = document.getElementById('feedbackPanel');
        const optionBtns = document.querySelectorAll('.option-btn');
        const timeTaken = (Date.now() - this.questionStartTime) / 1000;
        const durationMs = Date.now() - (this.questionStartTime || Date.now());
        const isCritical = timeTaken <= 10;

        // Pedagogical Integrity Telemetry
        if (window.msotIntegrity && typeof window.msotIntegrity.monitorEvent === 'function') {
            window.msotIntegrity.monitorEvent(isCorrect ? 'QUESTION_SOLVED' : 'ATTEMPT_FAILED', {
                question_id: `${this.currentGame?.id || 'game'}_q${this.currentQIndex}`,
                difficulty: this.currentGame?.difficulty || 'MEDIUM',
                duration_ms: durationMs,
                trusted_start_time: !!this.questionStartTime,
                solution_verified: true,
                answer: chosenIdx
            });
        }

        // Disable all option buttons immediately
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

            // Live XP gain animation across all score counters
            document.querySelectorAll('.score-val').forEach(el => {
                el.innerText = `+${this.score} XP`;
                el.classList.add('xp-pulse');
                setTimeout(() => el.classList.remove('xp-pulse'), 600);
            });
            const xpPopup = document.getElementById('xpGainPopup');
            if (xpPopup) {
                xpPopup.textContent = `+${earnedXP} XP!`;
                xpPopup.classList.add('active');
                setTimeout(() => xpPopup.classList.remove('active'), 1200);
            }

            fbPanel.innerHTML = `
                <div class="fb-card success">
                    <div class="fb-title">
                        ✅ EXCELLENT EXECUTION! +${earnedXP} XP ${isCritical ? '⚡ CRITICAL HIT!' : ''}
                    </div>
                    <div class="fb-explanation">${this.escapeHtml(q.explanation || 'Verified correct code syntax and execution.')}</div>
                    <button type="button" class="fb-next-btn" onclick="window.miraiGame.nextQuestion()">CONTINUE ➔</button>
                </div>
            `;
        } else {
            this.combo = 0;
            this.lives = Math.max(0, this.lives - 1);
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

            // Update hearts dynamically across all .heart-val elements with shake
            const heartsStr = '❤️'.repeat(Math.max(0, this.lives));
            document.querySelectorAll('.heart-val').forEach(el => {
                el.innerHTML = heartsStr;
            });
            const hudBoxes = document.querySelectorAll('.arena-stat-hearts, .hud-stat-lives');
            hudBoxes.forEach(box => {
                box.classList.add('heart-lost-shake');
                setTimeout(() => box.classList.remove('heart-lost-shake'), 600);
            });

            // Check if game over (all 3 hearts lost)
            if (this.lives <= 0) {
                fbPanel.innerHTML = `
                    <div class="fb-card error game-over-card">
                        <div class="fb-title">
                            💀 GAME OVER — ALL 3 HEARTS LOST
                        </div>
                        <div class="fb-explanation">${this.escapeHtml(q.explanation || 'You ran out of lives on this challenge.')}</div>
                        <p style="margin: 8px 0; font-size: 13px; color: #f87171;">Your mission has ended. Reset your strategy and challenge Level ${this.currentLevel || 1} again!</p>
                        <button type="button" class="fb-retry-btn" onclick="window.miraiGame.startLevel(${this.currentLevel || 1})">
                            RETRY LEVEL ${this.currentLevel || 1} ↺
                        </button>
                    </div>
                `;
            } else {
                fbPanel.innerHTML = `
                    <div class="fb-card error">
                        <div class="fb-title">
                            ❌ COMPILATION ANOMALY! (-1 Heart)
                        </div>
                        <div class="fb-explanation">${this.escapeHtml(q.explanation || 'Syntax anomaly detected.')}</div>
                        <button type="button" class="fb-next-btn" onclick="window.miraiGame.nextQuestion()">CONTINUE TO NEXT QUESTION ➔</button>
                    </div>
                `;
            }
        }

        fbPanel.style.display = 'block';

        // Update combo in HUD
        const comboDisplay = document.querySelector('.combo-val');
        if (comboDisplay) comboDisplay.innerText = `${this.combo}x 🔥`;
    }

    triggerMechanicSuccess(isCritical) {
        const m = this.currentGame.mechanic;
        const activeQuestions = this.getCurrentQuestions();
        const totalQCount = (activeQuestions && activeQuestions.length) || 10;
        const progressCount = Math.min(totalQCount, this.currentQIndex + 1);
        const progressPct = Math.min(100, Math.round((progressCount / totalQCount) * 100));

        if (m === 'boss_battle') {
            const baseDamage = Math.ceil(100 / totalQCount);
            const damage = isCritical ? Math.min(this.bossHP, Math.ceil(baseDamage * 1.5)) : Math.min(this.bossHP, baseDamage);
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
        } else if (m === 'loop_racer') {
            this.raceLaps = Math.min(totalQCount, (this.raceLaps || 0) + 1);
            const carEl = document.getElementById('raceCarAvatar');
            const targetLeft = Math.min(92, (this.raceLaps / totalQCount) * 92);
            const newSpeed = 220 + this.raceLaps * 18 + (isCritical ? 30 : 0);
            if (carEl) {
                carEl.style.left = `${targetLeft}%`;
                carEl.classList.add('nitro-active');
                const speedTag = carEl.querySelector('.car-speed-tag');
                if (speedTag) speedTag.innerText = `${newSpeed} KM/H`;
                setTimeout(() => carEl.classList.remove('nitro-active'), 800);
            }
            const stage = document.getElementById('racingStage');
            if (stage) {
                stage.classList.add('speed-burst');
                setTimeout(() => stage.classList.remove('speed-burst'), 600);
            }
        } else if (m === 'maze_runner') {
            this.mazeProgress = Math.min(totalQCount, (this.mazeProgress || 0) + 1);
            const avatar = document.querySelector('.runner-avatar');
            const targetLeft = Math.min(94, (this.mazeProgress / totalQCount) * 94);
            if (avatar) avatar.style.left = `${targetLeft}%`;
            const gates = document.querySelectorAll('.maze-gate-step');
            gates.forEach((g, idx) => {
                if (idx < this.mazeProgress) {
                    g.classList.add('cleared');
                    g.classList.remove('active');
                    const num = g.querySelector('.gate-num');
                    const label = g.querySelector('.gate-label');
                    if (num) num.innerText = '✓';
                    if (label) label.innerText = 'OPEN';
                } else if (idx === this.mazeProgress) {
                    g.classList.add('active');
                }
            });
        } else if (m === 'pattern_builder') {
            const preview = document.getElementById('patternPreview');
            if (preview) {
                preview.classList.add('brick-snap-pulse');
                setTimeout(() => preview.classList.remove('brick-snap-pulse'), 500);
            }
        } else if (m === 'function_factory') {
            const machine = document.getElementById('factoryMachineCore');
            if (machine) {
                machine.classList.add('gear-surge');
                setTimeout(() => machine.classList.remove('gear-surge'), 800);
            }
        } else if (m === 'detective') {
            const board = document.querySelector('.evidence-board');
            if (board) {
                const statusPill = board.querySelector('.evidence-status-pill');
                if (statusPill) {
                    statusPill.innerText = `STATUS: ANOMALY #${progressCount} RESOLVED [✓]`;
                    statusPill.style.borderColor = '#10b981';
                    statusPill.style.color = '#10b981';
                }
            }
        } else if (m === 'box_sort') {
            const item = document.getElementById('warehouseItem');
            if (item) {
                item.classList.add('item-sorted');
                setTimeout(() => item.classList.remove('item-sorted'), 700);
            }
            const bins = document.querySelectorAll('.w-bin');
            if (bins.length > 0) {
                const randomBin = bins[Math.floor(Math.random() * bins.length)];
                randomBin.classList.add('bin-highlight');
                setTimeout(() => randomBin.classList.remove('bin-highlight'), 800);
            }
        } else if (m === 'house_builder') {
            const beams = document.querySelectorAll('.house-beam');
            beams.forEach(b => {
                b.classList.add('active');
            });
        } else if (m === 'fashion_show') {
            const runway = document.querySelector('.runway-spotlight');
            if (runway) {
                runway.classList.add('acclaim-glow');
                setTimeout(() => runway.classList.remove('acclaim-glow'), 800);
            }
        } else if (m === 'shopping_list') {
            const slots = document.querySelectorAll('.cart-item-slot');
            slots.forEach((s, idx) => {
                if (idx <= progressCount) s.classList.add('filled');
            });
        } else if (m === 'treasure_map') {
            const nodes = document.querySelectorAll('.map-route-node');
            nodes.forEach((n, idx) => {
                if (idx <= progressCount) n.classList.add('visited');
            });
        } else if (m === 'gallery_puzzle') {
            const frames = document.querySelectorAll('.art-frame');
            frames.forEach((f, idx) => {
                if (idx <= progressCount) f.classList.add('mounted');
            });
        } else if (m === 'timetable_builder') {
            const cells = document.querySelectorAll('.matrix-cell');
            cells.forEach((c, idx) => {
                if (idx <= progressCount) c.classList.add('filled');
            });
        } else if (m === 'desk_rush') {
            const cadets = document.querySelectorAll('.queue-cadet');
            cadets.forEach((cad, idx) => {
                if (idx <= progressCount) cad.classList.add('processed');
            });
        } else if (m === 'city_planner') {
            const zones = document.querySelectorAll('.city-zone');
            zones.forEach((z, idx) => {
                if (idx <= progressCount) z.classList.add('zoned');
            });
        } else if (m === 'conveyor_sort') {
            const tags = document.querySelectorAll('.bin-tag');
            tags.forEach((t, idx) => {
                if (idx <= progressCount) t.classList.add('sorted');
            });
        } else if (m === 'secret_codes') {
            const ciphers = document.querySelectorAll('.cipher-node');
            ciphers.forEach((c, idx) => {
                if (idx <= progressCount) c.classList.add('decrypted');
            });
        }
    }

    triggerMechanicFailure() {
        const stage = document.getElementById('categoryGameStage');
        if (stage) {
            stage.classList.add('stage-shake-error');
            setTimeout(() => stage.classList.remove('stage-shake-error'), 500);
        }
        const m = this.currentGame.mechanic;
        if (m === 'maze_runner') {
            this.mazeProgress = Math.max(0, (this.mazeProgress || 0) - 1);
        } else if (m === 'loop_racer') {
            this.raceLaps = Math.max(0, (this.raceLaps || 0) - 1);
        }
    }

    // =========================================================================
    // THEMED IN-GAME STAGE INTERACTIVE BUTTON ACTIONS (17 CATEGORIES)
    // =========================================================================
    boostNitroCar() {
        const car = document.getElementById('raceCarAvatar');
        const stage = document.getElementById('racingStage');
        if (car) {
            car.classList.add('nitro-active');
            const speedTag = car.querySelector('.car-speed-tag');
            if (speedTag) speedTag.innerText = '380 KM/H ⚡ BOOST!';
            setTimeout(() => {
                car.classList.remove('nitro-active');
                if (speedTag) speedTag.innerText = '290 KM/H';
            }, 900);
        }
        if (stage) {
            stage.classList.add('speed-burst');
            setTimeout(() => stage.classList.remove('speed-burst'), 700);
        }
        if (window.miraiAudio) window.miraiAudio.playLaser?.();
    }

    pingMazeRadar() {
        const stage = document.getElementById('mazeStage');
        if (stage) {
            stage.classList.add('radar-ping-active');
            setTimeout(() => stage.classList.remove('radar-ping-active'), 800);
        }
        if (window.miraiAudio) window.miraiAudio.playClick?.();
    }

    snapLegoBrick() {
        const preview = document.getElementById('patternPreview');
        if (preview) {
            preview.classList.add('brick-snap-pulse');
            setTimeout(() => preview.classList.remove('brick-snap-pulse'), 600);
        }
        if (window.miraiAudio) window.miraiAudio.playClick?.();
    }

    cycleFactoryGears() {
        const machine = document.getElementById('factoryMachineCore');
        if (machine) {
            machine.classList.add('gear-surge');
            setTimeout(() => machine.classList.remove('gear-surge'), 900);
        }
        if (window.miraiAudio) window.miraiAudio.playSlash?.();
    }

    scanCrimeScene() {
        const radar = document.querySelector('.scene-radar');
        const status = document.querySelector('.evidence-status-pill');
        if (radar) {
            radar.classList.add('scan-flash');
            setTimeout(() => radar.classList.remove('scan-flash'), 800);
        }
        if (status) {
            status.innerText = 'STATUS: SCANNING CLUES... [OK]';
            setTimeout(() => {
                status.innerText = 'STATUS: ANOMALY TRACED';
            }, 1200);
        }
        if (window.miraiAudio) window.miraiAudio.playLaser?.();
    }

    dropWarehouseCrate() {
        const item = document.getElementById('warehouseItem');
        if (item) {
            item.classList.add('item-sorted');
            setTimeout(() => item.classList.remove('item-sorted'), 700);
        }
        const bins = document.querySelectorAll('.w-bin');
        if (bins.length > 0) {
            const b = bins[Math.floor(Math.random() * bins.length)];
            b.classList.add('bin-highlight');
            setTimeout(() => b.classList.remove('bin-highlight'), 800);
        }
        if (window.miraiAudio) window.miraiAudio.playClick?.();
    }

    strikeBossKatana() {
        const slashFx = document.getElementById('slashFx');
        const dmgNum = document.getElementById('dmgNumber');
        if (slashFx) {
            slashFx.classList.add('active');
            setTimeout(() => slashFx.classList.remove('active'), 500);
        }
        if (dmgNum) {
            dmgNum.innerText = `-15 HP!`;
            dmgNum.classList.add('pop');
            setTimeout(() => dmgNum.classList.remove('pop'), 700);
        }
        if (window.miraiAudio) window.miraiAudio.playSlash?.();
    }

    inspectHouseBlueprint() {
        const scaffold = document.querySelector('.house-blueprint-scaffold');
        if (scaffold) {
            scaffold.classList.add('blueprint-inspect');
            setTimeout(() => scaffold.classList.remove('blueprint-inspect'), 800);
        }
        if (window.miraiAudio) window.miraiAudio.playLaser?.();
    }

    poseRunwayModel() {
        const track = document.querySelector('.fashion-runway-track');
        if (track) {
            track.classList.add('runway-flash');
            setTimeout(() => track.classList.remove('runway-flash'), 800);
        }
        if (window.miraiAudio) window.miraiAudio.playClick?.();
    }

    scanShoppingItem() {
        const cart = document.querySelector('.shopping-cart-container');
        if (cart) {
            cart.classList.add('cart-scan-pulse');
            setTimeout(() => cart.classList.remove('cart-scan-pulse'), 700);
        }
        if (window.miraiAudio) window.miraiAudio.playClick?.();
    }

    dropPirateAnchor() {
        const map = document.querySelector('.treasure-map-container');
        if (map) {
            map.classList.add('anchor-splash');
            setTimeout(() => map.classList.remove('anchor-splash'), 800);
        }
        if (window.miraiAudio) window.miraiAudio.playClick?.();
    }

    takeGallerySnapshot() {
        const gallery = document.querySelector('.gallery-canvas-container');
        if (gallery) {
            gallery.classList.add('shutter-flash');
            setTimeout(() => gallery.classList.remove('shutter-flash'), 400);
        }
        if (window.miraiAudio) window.miraiAudio.playClick?.();
    }

    ringTimetableChime() {
        const table = document.querySelector('.timetable-grid-container');
        if (table) {
            table.classList.add('chime-ring');
            setTimeout(() => table.classList.remove('chime-ring'), 800);
        }
        if (window.miraiAudio) window.miraiAudio.playSuccess?.();
    }

    issueAdmissionsBadge() {
        const desk = document.querySelector('.desk-queue-container');
        if (desk) {
            desk.classList.add('badge-stamp');
            setTimeout(() => desk.classList.remove('badge-stamp'), 700);
        }
        if (window.miraiAudio) window.miraiAudio.playSuccess?.();
    }

    expandCityZone() {
        const city = document.querySelector('.city-skyline-container');
        if (city) {
            city.classList.add('city-power-surge');
            setTimeout(() => city.classList.remove('city-power-surge'), 800);
        }
        if (window.miraiAudio) window.miraiAudio.playLaser?.();
    }

    switchConveyorPiston() {
        const conveyor = document.querySelector('.conveyor-belt-container');
        if (conveyor) {
            conveyor.classList.add('piston-switch');
            setTimeout(() => conveyor.classList.remove('piston-switch'), 700);
        }
        if (window.miraiAudio) window.miraiAudio.playSlash?.();
    }

    crackSecretCipher() {
        const term = document.querySelector('.secret-terminal-container');
        if (term) {
            term.classList.add('cipher-decrypt-pulse');
            setTimeout(() => term.classList.remove('cipher-decrypt-pulse'), 800);
        }
        if (window.miraiAudio) window.miraiAudio.playSuccess?.();
    }

    nextQuestion() {
        this.isSubmitting = false;
        const activeQuestions = this.getCurrentQuestions();
        const totalQCount = (activeQuestions && activeQuestions.length) || 10;
        this.currentQIndex++;
        if (this.currentQIndex < totalQCount && this.lives > 0) {
            this.renderStage();
        } else {
            this.finishGame();
        }
    }

    finishGame() {
        // Victory or Defeat
        const isVictory = this.lives > 0;
        const currentLevelObj = this.currentGame.levels && this.currentLevel
            ? this.currentGame.levels.find(l => l.level === this.currentLevel)
            : null;
        const badge = currentLevelObj?.badge || this.currentGame.badge;

        if (isVictory) {
            // Award Level Badge & Platform XP
            if (window.msotState?.awardBadge && badge?.id) {
                window.msotState.awardBadge(badge.id);
            }
            if (window.msotState?.recordXP) {
                const clearTitle = currentLevelObj ? `${currentLevelObj.title} Clear` : `${this.currentGame.title} Clear`;
                window.msotState.recordXP('GAME_TOPIC_CLEAR', this.score, clearTitle);
            }
            if (window.msotState?.student) {
                const lvlKey = currentLevelObj ? `${this.currentGame.id}_lvl${this.currentLevel}` : this.currentGame.id;
                if (!window.msotState.student.completedGames.includes(lvlKey)) {
                    window.msotState.student.completedGames.push(lvlKey);
                }
                const isFinalLevel = !this.currentGame.levels || (this.currentLevel === this.currentGame.levels.length);
                if (isFinalLevel && !window.msotState.student.completedGames.includes(this.currentGame.id)) {
                    window.msotState.student.completedGames.push(this.currentGame.id);
                }
                window.msotState.save();
            }

            if (window.miraiAudio) {
                window.miraiAudio.playBadgeFanfare?.();
            }

            const hasNextLevel = this.currentGame.levels && (this.currentLevel < this.currentGame.levels.length);
            const nextLevelNum = this.currentLevel + 1;

            this.container.innerHTML = `
                <div class="victory-modal">
                    <div class="victory-halo">✨</div>
                    <div class="victory-badge-icon">${badge.icon}</div>
                    <h2 class="victory-title">${currentLevelObj ? `${currentLevelObj.title.toUpperCase()} CLEARED!` : 'STAGE COMPLETE!'}</h2>
                    <h4 class="victory-badge-name">Unlocked Badge: ${badge.name}</h4>
                    <p class="victory-desc">${badge.desc}</p>
                    <div class="victory-stats">
                        <div class="v-stat"><span class="v-label">XP EARNED</span><span class="v-num">+${this.score} XP</span></div>
                        <div class="v-stat"><span class="v-label">REMAINING HEARTS</span><span class="v-num">${'❤️'.repeat(this.lives)}</span></div>
                        <div class="v-stat"><span class="v-label">HIGHEST COMBO</span><span class="v-num">${this.combo}x</span></div>
                    </div>
                    <div class="victory-actions">
                        ${hasNextLevel ? `
                            <button class="primary-btn" onclick="window.miraiGame.startLevel(${nextLevelNum})">
                                PROCEED TO LEVEL ${nextLevelNum} ➔
                            </button>
                            <button class="secondary-btn" onclick="window.miraiGame.renderLevelSelect()">
                                LEVEL ARCHIVES (CHOOSE LEVEL) 📋
                            </button>
                        ` : (this.currentGame.levels ? `
                            <button class="primary-btn" onclick="window.miraiGame.renderLevelSelect()">
                                ALL LEVELS COMPLETED! VIEW DOSSIERS 🏆
                            </button>
                            <button class="secondary-btn" onclick="window.miraiGame.startLevel(${this.currentLevel})">
                                REPLAY LEVEL ${this.currentLevel} ↺
                            </button>
                        ` : '')}
                        <button class="${hasNextLevel ? 'secondary-btn' : 'primary-btn'}" onclick="window.miraiGame.closeGame(); window.msotPlatform?.refreshAll?.();">
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
                    <p class="victory-desc">You ran out of lives during ${currentLevelObj ? currentLevelObj.title : 'the cyber trial'}. Review your concepts and challenge again!</p>
                    <div class="victory-actions">
                        <button class="primary-btn" onclick="${this.currentGame.levels ? `window.miraiGame.startLevel(${this.currentLevel})` : `window.miraiGame.openGame('${this.currentGame.id}')`}">
                            RETRY ${currentLevelObj ? 'LEVEL ' + this.currentLevel : 'SIMULATION'} ↺
                        </button>
                        ${this.currentGame.levels ? `
                            <button class="secondary-btn" onclick="window.miraiGame.renderLevelSelect()">
                                CHOOSE ANOTHER LEVEL 📋
                            </button>
                        ` : ''}
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
