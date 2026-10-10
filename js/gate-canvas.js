/**
 * Mirai School of Technology - Hero Gate Engine
 * Implements the dramatic cinematic gate:
 * "towering gates part in red smoke and firelight, motion heavy enough to feel like a warning"
 * Features:
 * - Billowing layered crimson smoke clouds
 * - Ascending turbulent fire embers and ash particles
 * - Interactive Torii Gate / Demon Oni cyber mask centerpiece
 * - Heavy physical sliding gate doors that part open
 * - Interactive Cloth / Inscription Grid simulation with mouse drag disturbance
 * - Live tuning controls (as seen in Scrolltide Curtain reference)
 */

class MiraiGateEngine {
    constructor(canvasId, containerId) {
        // Parameters matching reference controls
        this.params = {
            gateParting: 0.0,       // 0 to 1 — closed by default in the center
            smokeDensity: 35,
            emberCount: 75,
            textSize: 9.0,
            glyphWeight: 0.8,
            fraying: 0.1,
            gravity: 0.1,
            damping: 0.955,
            clothStiffness: 0.85,
            heatIntensity: 1.0
        };

        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById(containerId);

        this.particles = [];
        this.smokePuffs = [];
        this.sakuraPetals = [];
        this.clothGrid = [];
        this.cols = 28;
        this.rows = 18;
        this.mouse = { x: -1000, y: -1000, px: -1000, py: -1000, down: false };

        this.initCanvasSize();
        this.initSmoke();
        this.initEmbers();
        this.initSakura();
        this.initClothGrid();
        this.bindEvents();
        this.setGateParting(0.0, false);

        this.lastTime = performance.now();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initCanvasSize() {
        if (!this.canvas) return;
        const rect = this.container ? this.container.getBoundingClientRect() : null;
        const w = (rect && rect.width > 50) ? rect.width : (window.innerWidth || 1200);
        const h = (rect && rect.height > 50) ? rect.height : (window.innerHeight || 800);
        this.width = this.canvas.width = Math.max(320, w);
        this.height = this.canvas.height = Math.max(320, h);
    }

    initSmoke() {
        this.smokePuffs = [];
        for (let i = 0; i < this.params.smokeDensity; i++) {
            this.smokePuffs.push({
                x: Math.random() * this.width,
                y: this.height * 0.4 + Math.random() * (this.height * 0.6),
                radius: 90 + Math.random() * 140,
                baseRadius: 90 + Math.random() * 140,
                vx: (Math.random() - 0.5) * 0.4,
                vy: -0.2 - Math.random() * 0.5,
                alpha: 0.04 + Math.random() * 0.09,
                color: Math.random() > 0.4 ? 'rgba(180, 15, 25,' : 'rgba(80, 5, 10,'
            });
        }
    }

    initEmbers() {
        this.particles = [];
        for (let i = 0; i < this.params.emberCount; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: this.height + Math.random() * 50,
                radius: 1 + Math.random() * 3.5,
                vx: (Math.random() - 0.5) * 1.5,
                vy: -1.2 - Math.random() * 2.8,
                life: Math.random() * 100,
                maxLife: 80 + Math.random() * 120,
                hue: Math.random() > 0.3 ? 10 : 35 // crimson red to blazing orange
            });
        }
    }

    initSakura() {
        this.sakuraPetals = [];
        const count = window.innerWidth < 768 ? 25 : 45;
        for (let i = 0; i < count; i++) {
            this.sakuraPetals.push({
                x: Math.random() * (this.width || 1200),
                y: Math.random() * (this.height || 800),
                size: Math.random() * 6 + 6,
                speedY: Math.random() * 1.2 + 0.8,
                speedX: Math.random() * 1.0 + 0.4,
                swaySpeed: Math.random() * 0.03 + 0.015,
                swayOffset: Math.random() * Math.PI * 2,
                swayAmp: Math.random() * 1.6 + 0.6,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.03,
                flip: Math.random() * Math.PI * 2,
                flipSpeed: Math.random() * 0.04 + 0.02,
                opacity: Math.random() * 0.4 + 0.5,
                colorTop: 'rgba(255, 192, 203, 0.9)',
                colorBottom: 'rgba(255, 105, 180, 0.85)'
            });
        }
    }

    // Interactive Inscription Curtain Grid (Scrolltide reference)
    initClothGrid() {
        this.clothGrid = [];
        const startX = this.width * 0.30;
        const endX = this.width * 0.70;
        const startY = this.height * 0.38;
        const endY = this.height * 0.85;

        const cellW = (endX - startX) / (this.cols - 1);
        const cellH = (endY - startY) / (this.rows - 1);

        const sampleText = [
            "ABANDON ALL HOPE YE WHO ENTER HERE",
            "MIRAI SCHOOL OF TECHNOLOGY • TOKYO",
            "THROUGH ME THE WAY TO THE RED FIRE",
            "FORGE THE ALGORITHM • CONQUER CODE",
            "RECURSION SPIRALS IN THE CRIMSON DARK",
            "CYBER ONI GUARDS THE SACRED ARCHES",
            "NEVER CEASE THE QUEST FOR TRUE LOGIC",
            "ETERNAL KNOWLEDGE AWAITS BEYOND",
            "WHERE BUGS PERISH AND HEROES ARISE"
        ];

        let charIdx = 0;
        for (let r = 0; r < this.rows; r++) {
            const line = sampleText[r % sampleText.length];
            for (let c = 0; c < this.cols; c++) {
                const char = line[c % line.length] || "•";
                const originX = startX + c * cellW;
                const originY = startY + r * cellH;

                this.clothGrid.push({
                    char: char,
                    x: originX,
                    y: originY,
                    ox: originX,
                    oy: originY,
                    vx: 0,
                    vy: 0,
                    pinned: r === 0 // Top row pinned
                });
            }
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.initCanvasSize();
            this.initSmoke();
            this.initEmbers();
            this.initClothGrid();
        });

        const updateMouse = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.px = this.mouse.x;
            this.mouse.py = this.mouse.y;
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        };

        this.canvas.addEventListener('mousemove', (e) => {
            updateMouse(e);
            this.disturbCloth();
        });

        this.canvas.addEventListener('mousedown', (e) => {
            this.mouse.down = true;
            updateMouse(e);
            this.disturbCloth(true);
        });

        window.addEventListener('mouseup', () => {
            this.mouse.down = false;
        });

        // Touch support for mobile
        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.px = this.mouse.x;
                this.mouse.py = this.mouse.y;
                this.mouse.x = touch.clientX - rect.left;
                this.mouse.y = touch.clientY - rect.top;
                this.disturbCloth(true);
            }
        }, { passive: true });
    }

    disturbCloth(force = false) {
        const radius = force ? 90 : 65;
        const strength = force ? 18 : 8;

        for (const pt of this.clothGrid) {
            const dx = pt.x - this.mouse.x;
            const dy = pt.y - this.mouse.y;
            const dist = Math.hypot(dx, dy);

            if (dist < radius && dist > 0.01) {
                const angle = Math.atan2(dy, dx);
                const push = (1 - dist / radius) * strength;
                pt.vx += Math.cos(angle) * push;
                pt.vy += Math.sin(angle) * push;
            }
        }
    }

    updateCloth(dt) {
        // Physical cloth spring & return forces
        const kReturn = 0.04 * (1 - this.params.gateParting); // Looser when parting
        const damping = this.params.damping;

        for (const pt of this.clothGrid) {
            if (pt.pinned) continue;

            // Parting offset based on gate progress
            const centerDist = pt.ox - this.width * 0.5;
            const partingShift = Math.sign(centerDist) * (this.params.gateParting * this.width * 0.38);

            // Target position including gate parting
            const targetX = pt.ox + partingShift;
            const targetY = pt.oy;

            // Spring pull towards target
            const fx = (targetX - pt.x) * kReturn;
            const fy = (targetY - pt.y) * kReturn;

            pt.vx += fx;
            pt.vy += fy + this.params.gravity * 0.2;

            pt.vx *= damping;
            pt.vy *= damping;

            pt.x += pt.vx;
            pt.y += pt.vy;
        }
    }

    drawSmoke() {
        for (const puff of this.smokePuffs) {
            puff.y += puff.vy;
            puff.x += puff.vx;

            // Loop back around
            if (puff.y < -puff.radius) {
                puff.y = this.height + puff.radius * 0.5;
                puff.x = Math.random() * this.width;
            }

            const radGrad = this.ctx.createRadialGradient(
                puff.x, puff.y, 0,
                puff.x, puff.y, puff.radius
            );
            radGrad.addColorStop(0, `${puff.color} ${puff.alpha * this.params.heatIntensity})`);
            radGrad.addColorStop(0.5, `${puff.color} ${puff.alpha * 0.4})`);
            radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            this.ctx.fillStyle = radGrad;
            this.ctx.beginPath();
            this.ctx.arc(puff.x, puff.y, puff.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawEmbers() {
        this.ctx.save();
        for (const p of this.particles) {
            p.y += p.vy;
            p.x += p.vx + Math.sin(p.life * 0.1) * 0.8;
            p.life++;

            if (p.life > p.maxLife || p.y < -10) {
                p.x = Math.random() * this.width;
                p.y = this.height + 10;
                p.life = 0;
            }

            const alpha = Math.sin((p.life / p.maxLife) * Math.PI);
            this.ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${alpha * 0.9})`;
            this.ctx.shadowColor = '#ff2a4b';
            this.ctx.shadowBlur = 8;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    drawClothGrid() {
        this.ctx.save();
        this.ctx.font = `${Math.floor(this.params.textSize)}px 'Cinzel', 'Noto Serif JP', serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Dim when gate is widely parted
        const fadeAlpha = Math.max(0.08, 0.85 - this.params.gateParting * 0.7);

        for (const pt of this.clothGrid) {
            const glowDist = Math.hypot(pt.vx, pt.vy);
            const isAgitated = glowDist > 1.0;

            if (isAgitated) {
                this.ctx.fillStyle = `rgba(255, 120, 100, ${Math.min(1.0, fadeAlpha + 0.3)})`;
                this.ctx.shadowColor = '#ff3344';
                this.ctx.shadowBlur = 12;
            } else {
                this.ctx.fillStyle = `rgba(220, 45, 60, ${fadeAlpha})`;
                this.ctx.shadowBlur = 0;
            }

            this.ctx.fillText(pt.char, pt.x, pt.y);
        }
        this.ctx.restore();
    }

    drawCyberToriiOverlay() {
        // Subtle cyber-torii aesthetic silhouette
        const w = this.width;
        const h = this.height;
        const p = this.params.gateParting;

        this.ctx.save();
        // Fire glow center behind gate opening
        const radialCenter = this.ctx.createRadialGradient(
            w * 0.5, h * 0.5, 20,
            w * 0.5, h * 0.5, w * 0.4
        );
        radialCenter.addColorStop(0, `rgba(255, 42, 60, ${0.15 + p * 0.35})`);
        radialCenter.addColorStop(0.5, `rgba(180, 10, 20, ${0.08 + p * 0.2})`);
        radialCenter.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = radialCenter;
        this.ctx.fillRect(0, 0, w, h);

        this.ctx.restore();
    }

    drawSakura() {
        if (!this.sakuraPetals || !this.sakuraPetals.length) return;
        const time = performance.now();
        for (const p of this.sakuraPetals) {
            p.y += p.speedY;
            p.x += p.speedX + Math.sin(time * p.swaySpeed * 0.05 + p.swayOffset) * p.swayAmp;
            p.rotation += p.rotationSpeed;
            p.flip += p.flipSpeed;

            if (p.y > this.height + 20) {
                p.y = -20;
                p.x = Math.random() * this.width;
            }
            if (p.x > this.width + 30) {
                p.x = -20;
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.scale(1, Math.cos(p.flip));

            this.ctx.beginPath();
            const s = p.size;
            this.ctx.moveTo(0, -s);
            this.ctx.bezierCurveTo(s * 0.85, -s * 0.7, s * 0.9, s * 0.4, 0, s);
            this.ctx.bezierCurveTo(-s * 0.9, s * 0.4, -s * 0.85, -s * 0.7, 0, -s);

            const grad = this.ctx.createLinearGradient(0, -s, 0, s);
            grad.addColorStop(0, p.colorTop);
            grad.addColorStop(1, p.colorBottom);

            this.ctx.fillStyle = grad;
            this.ctx.globalAlpha = p.opacity;
            this.ctx.shadowBlur = 6;
            this.ctx.shadowColor = 'rgba(255, 105, 180, 0.4)';
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    setGateParting(val, triggerAudio = true) {
        if (!this.params) return;
        const clamped = Math.max(0, Math.min(1, val));
        if (Math.abs((this.params.gateParting || 0) - clamped) > 0.05 && triggerAudio && window.miraiAudio) {
            window.miraiAudio.playGateOpening();
        }
        this.params.gateParting = clamped;

        // Toggle 3D CSS classes on heroGateWrapper
        const heroWrapper = document.getElementById('heroGateWrapper');
        const leftDoor = document.getElementById('gateDoorLeft');
        const rightDoor = document.getElementById('gateDoorRight');
        if (leftDoor) leftDoor.style.transform = '';
        if (rightDoor) rightDoor.style.transform = '';

        if (heroWrapper) {
            if (clamped >= 0.5) {
                heroWrapper.classList.add('gate-opening');
            } else {
                heroWrapper.classList.remove('gate-opening', 'gate-flythrough');
            }
        }
    }

    animate(now) {
        const dt = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;

        // Auto-rebuild if canvas had 0 dimensions during initial load
        if (!this.width || !this.height || this.clothGrid.length === 0) {
            this.initCanvasSize();
            this.initSmoke();
            this.initEmbers();
            this.initSakura();
            this.initClothGrid();
        }

        if (this.width > 0 && this.height > 0) {
            this.ctx.clearRect(0, 0, this.width, this.height);

            // Render layers
            this.drawCyberToriiOverlay();
            this.drawSmoke();
            this.updateCloth(dt);
            this.drawClothGrid();
            this.drawEmbers();
            this.drawSakura();
        }

        requestAnimationFrame(this.animate);
    }
}

window.MiraiGateEngine = MiraiGateEngine;
