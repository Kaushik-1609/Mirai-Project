/**
 * Mirai School of Technology — Asur Guardian Protocol Cinematic Intro
 * Sacred Mask Gate Opening & Portal Emergence
 *
 * Choreography:
 * 1. Slow-motion approach of the 2.8K Asur mask video (playbackRate 0.75, GPU-accelerated 60FPS)
 * 2. Background music (asur_dark_side_intro_bgm.mp3) plays continuously throughout
 * 3. NO BLAST, NO CUBES:
 *    At the peak moment, a brilliant laser crevice ignites down the center line of the mask.
 *    The mask splits and opens like a sacred temple portal gate from the middle (Left and Right doors swing open in 3D perspective).
 * 4. Radiant golden portal light and streaming embers pour forward through the opening gate.
 * 5. Out from within the opened gate, the glowing fiery orange website title emerges:
 *    "MIRAI SCHOOL OF TECHNOLOGY"
 *    and the "ENTER CADET DASHBOARD ➔" button comes into view.
 */

(function () {
    'use strict';

    const STORAGE_KEY_INTRO_SEEN = 'msot_intro_seen_v1';
    const BGM_AUDIO_SRC = 'assets/audio/asur_dark_side_intro_bgm.mp3';

    class IntroVideoController {
        constructor() {
            this.overlay = null;
            this.stage = null;
            this.maskContainer = null;
            this.unifiedWrap = null;
            this.gateDoors = null;
            this.gateBeam = null;
            this.heroVideo = null;
            this.ambientVideo = null;
            this.fireTextReveal = null;
            this.canvas = null;
            this.ctx = null;
            this.bgmAudio = null;
            this.unmuteBtn = null;
            this.portalOverlay = null;

            this.isOpen = false;
            this.isSoundEnabled = false;
            this.isPlaying = false;
            this.isTransitioning = false;
            this.gateOpened = false;

            this.ambientEmbers = [];
            this.portalEmbers = [];
            this.animationFrameId = null;
            this.gateTimeout = null;
            this.textEmergeTimeout = null;

            // 3D Mouse Parallax
            this.mouseX = 0;
            this.mouseY = 0;
            this.currentTiltX = 0;
            this.currentTiltY = 0;
        }

        init() {
            this.cacheDom();
            this.initCanvas();
            this.bindEvents();

            if (this.bgmAudio) {
                this.bgmAudio.src = BGM_AUDIO_SRC;
                this.bgmAudio.loop = true;
                this.bgmAudio.volume = 0.95;
                this.bgmAudio.load();
            }

            // Auto-trigger on initial visit
            const hasSeen = sessionStorage.getItem(STORAGE_KEY_INTRO_SEEN);
            const isIntroHash = window.location.hash === '#/intro';

            if (isIntroHash || (!hasSeen && (window.location.hash === '' || window.location.hash === '#/' || window.location.hash === '#/dashboard' || window.location.hash === '#/gates'))) {
                setTimeout(() => {
                    this.playIntro();
                }, 350);
            }
        }

        cacheDom() {
            this.overlay = document.getElementById('msotIntroOverlay');
            this.stage = document.getElementById('msotIntroStage');
            this.maskContainer = document.getElementById('msotMaskContainer');
            this.videoWrap = document.getElementById('msotMaskVideoWrap');
            this.gateDoors = document.getElementById('msotMaskGateDoors');
            this.centerCrevice = document.getElementById('msotCenterCrevice');
            this.heroVideo = document.getElementById('msotHeroVideo');
            this.ambientVideo = document.getElementById('msotIntroAmbientVideo');
            this.fireTextReveal = document.getElementById('msotFireTextReveal');
            this.canvas = document.getElementById('msotMaskCanvas');
            this.bgmAudio = document.getElementById('msotIntroBgmAudio');
            this.unmuteBtn = document.getElementById('msotIntroUnmuteBtn');
            this.portalOverlay = document.getElementById('msotTransitionPortal');
        }

        initCanvas() {
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d', { alpha: true });
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());

            this.ambientEmbers = [];
            this.portalEmbers = [];
            const count = 80;
            for (let i = 0; i < count; i++) {
                this.ambientEmbers.push(this.createEmber(true));
            }
        }

        resizeCanvas() {
            if (!this.canvas) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.canvas.width = window.innerWidth * dpr;
            this.canvas.height = window.innerHeight * dpr;
            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';
            if (this.ctx) {
                this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
        }

        createEmber(initial = false) {
            const w = window.innerWidth;
            const h = window.innerHeight;
            return {
                x: Math.random() * w,
                y: initial ? Math.random() * h : h + Math.random() * 20,
                radius: Math.random() * 2.2 + 0.8,
                speedY: Math.random() * 1.5 + 0.6,
                speedX: (Math.random() - 0.5) * 0.9,
                opacity: Math.random() * 0.7 + 0.25,
                hue: Math.random() < 0.4 ? 42 : (Math.random() < 0.75 ? 24 : 12),
                decay: Math.random() * 0.0025 + 0.0012,
                wobble: Math.random() * Math.PI * 2
            };
        }

        createPortalStreamEmber() {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3.8 + 1.2;
            return {
                x: cx + (Math.random() - 0.5) * 20,
                y: cy + (Math.random() - 0.5) * 180,
                vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
                vy: Math.sin(angle) * speed - Math.random() * 1.5,
                radius: Math.random() * 2.8 + 1.2,
                opacity: 1.0,
                hue: Math.random() < 0.5 ? 44 : 26,
                decay: Math.random() * 0.012 + 0.006
            };
        }

        /**
         * THE MASK GATE OPENING:
         * Splits the mask down the middle and swings open both door halves in 3D perspective!
         */
        triggerGateOpen() {
            if (this.gateOpened) return;
            this.gateOpened = true;

            // 1. Hide hero video and wrap, activate the split slider gate doors
            if (this.videoWrap) {
                this.videoWrap.classList.add('hidden');
            }
            if (this.heroVideo) {
                this.heroVideo.classList.add('hidden');
                this.heroVideo.pause();
            }
            if (this.gateDoors) {
                this.gateDoors.classList.add('active');
                void this.gateDoors.offsetWidth; // Force CSS reflow
                this.gateDoors.classList.add('opening');
            }

            // 2. Stream portal embers bursting forward out of the center crevice
            for (let i = 0; i < 50; i++) {
                this.portalEmbers.push(this.createPortalStreamEmber());
            }

            // 3. Orange fire text in center layer emerges from behind the parting sliding doors
            clearTimeout(this.textEmergeTimeout);
            this.textEmergeTimeout = setTimeout(() => {
                if (this.isOpen && !this.isTransitioning && this.fireTextReveal) {
                    this.fireTextReveal.classList.add('gate-emerge');
                }
            }, 350);
        }

        startRenderLoop() {
            const render = () => {
                if (!this.isOpen) return;
                this.updateAndDrawScene();
                this.updateParallax();
                this.animationFrameId = requestAnimationFrame(render);
            };
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = requestAnimationFrame(render);
        }

        stopRenderLoop() {
            cancelAnimationFrame(this.animationFrameId);
        }

        updateParallax() {
            if (!this.stage) return;
            this.currentTiltX += (this.mouseY * 4 - this.currentTiltX) * 0.06;
            this.currentTiltY += (this.mouseX * 6 - this.currentTiltY) * 0.06;
            this.stage.style.transform = `perspective(1400px) rotateX(${-this.currentTiltX.toFixed(2)}deg) rotateY(${this.currentTiltY.toFixed(2)}deg)`;
        }

        updateAndDrawScene() {
            if (!this.ctx || !this.canvas) return;
            const ctx = this.ctx;
            const w = window.innerWidth;
            const h = window.innerHeight;

            ctx.clearRect(0, 0, w, h);

            // 1. Ambient rising fire embers
            for (let i = 0; i < this.ambientEmbers.length; i++) {
                const p = this.ambientEmbers[i];
                p.wobble += 0.03;
                p.y -= p.speedY;
                p.x += p.speedX + Math.sin(p.wobble) * 0.4;
                p.opacity -= p.decay;

                if (p.y < -15 || p.opacity <= 0) {
                    this.ambientEmbers[i] = this.createEmber(false);
                    continue;
                }

                ctx.save();
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 95%, 60%, ${p.opacity})`;
                ctx.shadowColor = `hsla(${p.hue}, 100%, 50%, 0.8)`;
                ctx.shadowBlur = p.radius * 3;
                ctx.fill();
                ctx.restore();
            }

            // 2. Portal Stream Embers (emerging through the opening gate)
            for (let i = this.portalEmbers.length - 1; i >= 0; i--) {
                const pe = this.portalEmbers[i];
                pe.x += pe.vx;
                pe.y += pe.vy;
                pe.vx *= 0.985;
                pe.vy *= 0.985;
                pe.opacity -= pe.decay;

                if (pe.opacity <= 0) {
                    this.portalEmbers.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.beginPath();
                ctx.arc(pe.x, pe.y, pe.radius, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${pe.hue}, 100%, 65%, ${pe.opacity})`;
                ctx.shadowColor = `hsla(${pe.hue}, 100%, 50%, 0.9)`;
                ctx.shadowBlur = pe.radius * 4;
                ctx.fill();
                ctx.restore();
            }
        }

        bindEvents() {
            if (!this.overlay) return;

            window.addEventListener('mousemove', (e) => {
                if (!this.isOpen) return;
                this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
                this.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
            });

            window.addEventListener('keydown', (e) => {
                if (!this.isOpen || this.isTransitioning) return;

                if (e.key === 'Escape' || e.key === 'Enter') {
                    e.preventDefault();
                    this.enterDashboardWithTransition();
                } else if (e.key === ' ' || e.code === 'Space') {
                    if (document.activeElement?.tagName !== 'INPUT') {
                        e.preventDefault();
                        this.togglePlayPause();
                    }
                } else if (e.key === 'm' || e.key === 'M') {
                    if (document.activeElement?.tagName !== 'INPUT') {
                        e.preventDefault();
                        this.toggleMute();
                    }
                }
            });

            if (this.heroVideo) {
                this.heroVideo.addEventListener('timeupdate', () => {
                    if (!this.gateOpened && this.heroVideo.currentTime >= 2.8) {
                        this.triggerGateOpen();
                    }
                });
                this.heroVideo.addEventListener('ended', () => {
                    if (!this.gateOpened) {
                        this.triggerGateOpen();
                    }
                });
            }
        }

        playIntro() {
            if (!this.overlay) return;
            this.isOpen = true;
            this.isPlaying = true;
            this.isTransitioning = false;
            this.gateOpened = false;
            this.portalEmbers = [];
            this.overlay.classList.add('active');

            // Reset animation state cleanly
            this.resetAnimationState();

            this.resizeCanvas();
            this.startRenderLoop();

            // Smooth Slow-Motion Video Playback (rate 0.75)
            if (this.heroVideo) {
                this.heroVideo.playbackRate = 0.75;
                this.heroVideo.currentTime = 0;
                this.heroVideo.play().catch(e => console.warn('Hero video note:', e));
            }

            if (this.ambientVideo) {
                this.ambientVideo.playbackRate = 0.75;
                this.ambientVideo.currentTime = 0;
                this.ambientVideo.play().catch(e => console.warn('Ambient video note:', e));
            }

            // Continuous Background Music
            if (this.bgmAudio) {
                this.bgmAudio.loop = true;
                this.bgmAudio.currentTime = 0;
                if (this.isSoundEnabled) {
                    this.bgmAudio.play().catch(e => console.warn('BGM audio note:', e));
                }
            }

            // Trigger the Mask Gate Opening at peak slow-motion approach (~3.0s)
            clearTimeout(this.gateTimeout);
            this.gateTimeout = setTimeout(() => {
                if (this.isOpen && !this.isTransitioning && !this.gateOpened) {
                    this.triggerGateOpen();
                }
            }, 3000);

            this.updateMuteButton();
        }

        resetAnimationState() {
            if (this.videoWrap) {
                this.videoWrap.classList.remove('hidden');
            }

            if (this.heroVideo) {
                this.heroVideo.classList.remove('hidden');
            }

            if (this.gateDoors) {
                this.gateDoors.classList.remove('active', 'opening');
            }

            if (this.fireTextReveal) {
                this.fireTextReveal.classList.remove('gate-emerge');
            }

            if (this.stage) {
                this.stage.style.transform = '';
            }
        }

        togglePlayPause() {
            this.isPlaying = !this.isPlaying;
            if (this.heroVideo) {
                if (this.isPlaying) this.heroVideo.play().catch(() => {});
                else this.heroVideo.pause();
            }
            if (this.ambientVideo) {
                if (this.isPlaying) this.ambientVideo.play().catch(() => {});
                else this.ambientVideo.pause();
            }
            if (this.bgmAudio) {
                if (this.isPlaying && this.isSoundEnabled) {
                    this.bgmAudio.play().catch(() => {});
                } else {
                    this.bgmAudio.pause();
                }
            }
        }

        toggleMute() {
            this.isSoundEnabled = !this.isSoundEnabled;

            if (this.bgmAudio) {
                if (this.isSoundEnabled) {
                    this.bgmAudio.loop = true;
                    this.bgmAudio.play().catch((e) => console.warn('Audio play note:', e));
                } else {
                    this.bgmAudio.pause();
                }
            }

            this.updateMuteButton();
        }

        updateMuteButton() {
            if (!this.unmuteBtn) return;
            if (!this.isSoundEnabled) {
                this.unmuteBtn.innerHTML = '<span>🔊</span><span>ENABLE AUDIO</span>';
                this.unmuteBtn.classList.add('btn-unmute');
            } else {
                this.unmuteBtn.innerHTML = '<span>🔇</span><span>MUTE AUDIO</span>';
                this.unmuteBtn.classList.remove('btn-unmute');
            }
        }

        enterDashboardWithTransition() {
            if (this.isTransitioning) return;
            this.isTransitioning = true;
            clearTimeout(this.gateTimeout);
            clearTimeout(this.textEmergeTimeout);

            // 1. Reveal Portal Gateway Overlay
            if (this.portalOverlay) {
                this.portalOverlay.classList.add('portal-active');
            }

            // 2. Play temple bell / chime if available
            try {
                if (window.miraiAudio && typeof window.miraiAudio.playTempleBell === 'function') {
                    window.miraiAudio.playTempleBell();
                }
            } catch (e) {}

            // 3. Smooth audio fade out only when entering dashboard
            if (this.bgmAudio && !this.bgmAudio.paused) {
                const fadeSteps = 7;
                let currentStep = 0;
                const initialVol = this.bgmAudio.volume;
                const fadeInterval = setInterval(() => {
                    currentStep++;
                    this.bgmAudio.volume = Math.max(0, initialVol * (1 - currentStep / fadeSteps));
                    if (currentStep >= fadeSteps) {
                        clearInterval(fadeInterval);
                        this.bgmAudio.pause();
                        this.bgmAudio.volume = initialVol;
                    }
                }, 100);
            }

            if (this.heroVideo) this.heroVideo.pause();
            if (this.ambientVideo) this.ambientVideo.pause();

            // 4. Enter Cadet Dashboard
            setTimeout(() => {
                sessionStorage.setItem(STORAGE_KEY_INTRO_SEEN, 'true');
                this.isOpen = false;
                this.stopRenderLoop();

                if (window.switchSection) {
                    window.switchSection('dashboardSection', true);
                }
                window.location.hash = '#/dashboard';

                if (this.overlay) {
                    this.overlay.classList.remove('active');
                }

                setTimeout(() => {
                    if (this.portalOverlay) {
                        this.portalOverlay.classList.remove('portal-active');
                    }
                    this.resetAnimationState();
                }, 400);

            }, 1150);
        }
    }

    window.msotIntroVideo = new IntroVideoController();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.msotIntroVideo.init());
    } else {
        window.msotIntroVideo.init();
    }
})();
