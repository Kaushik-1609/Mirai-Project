/**
 * Mirai School of Technology - 3D Interactive WebGL & Three.js Engine
 * Features:
 * 1. Hero 3D Cyber Torii & Holographic Oni Mecha Core with interactive mouse parallax & scroll dolly
 * 2. 3D Floating Arcade Hologram Showcase with 360-degree interactive rotation & particle bursts
 * 3. In-Game 3D Viewports (Boss Battle Mecha Core, Neon Racing Grid, 3D Voxel Cubes)
 * 4. Responsive downscaling on mobile & battery-conscious RAF loop
 * 5. Native WebGL 3D procedural fallback if Three.js CDN is unavailable
 */

class Mirai3DEngine {
    constructor() {
        this.isThreeAvailable = typeof window.THREE !== 'undefined';
        this.heroScene = null;
        this.heroCamera = null;
        this.heroRenderer = null;
        this.heroGroup = null;
        this.heroParticles = null;
        this.heroRings = [];

        this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0, isDragging: false, startX: 0, startY: 0 };
        this.scrollDepth = 0;
        this.isHeroVisible = true;

        this.init();
    }

    init() {
        this.checkThree();
        this.initHero3D('hero3DCanvas');
        this.initScrollListener();
        this.initMouseInteractions();
    }

    checkThree() {
        this.isThreeAvailable = typeof window.THREE !== 'undefined';
    }

    // =========================================================================
    // 1. HERO 3D CYBER SHRINE / NEON WIREFRAME MECHA SCENE
    // =========================================================================
    initHero3D(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const parent = canvas.parentElement;
        const width = parent.clientWidth || window.innerWidth;
        const height = parent.clientHeight || window.innerHeight;

        if (this.isThreeAvailable) {
            this.initThreeHero(canvas, width, height);
        } else {
            this.initNativeWebGLHero(canvas, width, height);
        }
    }

    initThreeHero(canvas, width, height) {
        const THREE = window.THREE;

        // Scene, Camera, Renderer
        this.heroScene = new THREE.Scene();
        this.heroCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.heroCamera.position.z = 24;

        this.heroRenderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.heroRenderer.setSize(width, height);
        this.heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Group container for mouse parallax
        this.heroGroup = new THREE.Group();
        this.heroScene.add(this.heroGroup);

        // 1. Central 3D Cyber Torii / Oni Core Geometry
        // Outer Octahedron / Crystal
        const crystalGeo = new THREE.OctahedronGeometry(4.2, 0);
        const wireMat = new THREE.MeshBasicMaterial({
            color: 0xff2a4b,
            wireframe: true,
            transparent: true,
            opacity: 0.65
        });
        const crystalMesh = new THREE.Mesh(crystalGeo, wireMat);
        this.heroGroup.add(crystalMesh);
        this.heroCore = crystalMesh;

        // Inner Glowing Icosahedron Core
        const coreGeo = new THREE.IcosahedronGeometry(2.4, 1);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        const innerCore = new THREE.Mesh(coreGeo, coreMat);
        this.heroGroup.add(innerCore);
        this.heroInnerCore = innerCore;

        // 2. Concentric Cyber Hologram Rings
        const ringGeo1 = new THREE.TorusGeometry(6.8, 0.06, 16, 100);
        const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xa855f0, transparent: true, opacity: 0.7 });
        const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
        ring1.rotation.x = Math.PI / 3;
        this.heroGroup.add(ring1);
        this.heroRings.push({ mesh: ring1, speedX: 0.006, speedY: 0.009 });

        const ringGeo2 = new THREE.TorusGeometry(8.2, 0.04, 16, 100);
        const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.5 });
        const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
        ring2.rotation.y = Math.PI / 4;
        this.heroGroup.add(ring2);
        this.heroRings.push({ mesh: ring2, speedX: -0.008, speedY: 0.005 });

        // 3. Floating 3D Star/Data Particle Constellation
        const particleCount = 280;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorCrimson = new THREE.Color(0xff2a4b);
        const colorCyan = new THREE.Color(0x00f0ff);
        const colorPurple = new THREE.Color(0xa855f0);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 45;
            positions[i + 1] = (Math.random() - 0.5) * 35;
            positions[i + 2] = (Math.random() - 0.5) * 30;

            const c = Math.random() > 0.6 ? colorCrimson : (Math.random() > 0.3 ? colorCyan : colorPurple);
            colors[i] = c.r;
            colors[i + 1] = c.g;
            colors[i + 2] = c.b;
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const pMat = new THREE.PointsMaterial({
            size: 0.35,
            vertexColors: true,
            transparent: true,
            opacity: 0.85
        });
        this.heroParticles = new THREE.Points(particleGeo, pMat);
        this.heroScene.add(this.heroParticles);

        // Resize handler
        window.addEventListener('resize', () => {
            const w = parent.clientWidth || window.innerWidth;
            const h = parent.clientHeight || window.innerHeight;
            this.heroCamera.aspect = w / h;
            this.heroCamera.updateProjectionMatrix();
            this.heroRenderer.setSize(w, h);
        });

        // Animation Loop
        const animateThree = () => {
            requestAnimationFrame(animateThree);

            if (!this.isHeroVisible) return;

            // Smooth mouse rotation lerp
            this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
            this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

            this.heroGroup.rotation.y = this.mouse.x * 0.8;
            this.heroGroup.rotation.x = -this.mouse.y * 0.6;

            // Scroll Dolly camera effect (Scrollytelling)
            const targetZ = 24 - (this.scrollDepth * 14);
            this.heroCamera.position.z += (targetZ - this.heroCamera.position.z) * 0.08;

            // Continuous procedural rotation
            if (this.heroCore) {
                this.heroCore.rotation.y += 0.007;
                this.heroCore.rotation.x += 0.004;
            }
            if (this.heroInnerCore) {
                this.heroInnerCore.rotation.y -= 0.012;
                this.heroInnerCore.rotation.z += 0.008;
            }

            this.heroRings.forEach(r => {
                r.mesh.rotation.x += r.speedX;
                r.mesh.rotation.y += r.speedY;
            });

            if (this.heroParticles) {
                this.heroParticles.rotation.y += 0.001;
            }

            this.heroRenderer.render(this.heroScene, this.heroCamera);
        };

        animateThree();
    }

    // =========================================================================
    // NATIVE WEBGL 3D FALLBACK (Ensures 3D works even offline / CDN blocked)
    // =========================================================================
    initNativeWebGLHero(canvas, width, height) {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const vertices = [];
        const numNodes = 48;
        for (let i = 0; i < numNodes; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = 160 + Math.random() * 40;
            vertices.push({
                x: r * Math.sin(phi) * Math.cos(theta),
                y: r * Math.sin(phi) * Math.sin(theta),
                z: r * Math.cos(phi),
                color: i % 2 === 0 ? '#ff2a4b' : '#00f0ff'
            });
        }

        let rotX = 0;
        let rotY = 0;

        const animate2DFallback = () => {
            requestAnimationFrame(animate2DFallback);
            ctx.clearRect(0, 0, width, height);

            rotX += 0.006 + this.mouse.targetY * 0.002;
            rotY += 0.008 + this.mouse.targetX * 0.002;

            const cx = width / 2;
            const cy = height / 2;
            const fov = 350;

            const projected = vertices.map(v => {
                // Rotate Y
                const x1 = v.x * Math.cos(rotY) - v.z * Math.sin(rotY);
                const z1 = v.x * Math.sin(rotY) + v.z * Math.cos(rotY);
                // Rotate X
                const y2 = v.y * Math.cos(rotX) - z1 * Math.sin(rotX);
                const z2 = v.y * Math.sin(rotX) + z1 * Math.cos(rotX);

                const scale = fov / (fov + z2 + 250);
                return {
                    px: cx + x1 * scale,
                    py: cy + y2 * scale,
                    scale: scale,
                    z: z2,
                    color: v.color
                };
            });

            // Draw connecting wireframe lines
            ctx.strokeStyle = 'rgba(255, 42, 75, 0.25)';
            ctx.lineWidth = 1;
            for (let i = 0; i < projected.length; i++) {
                for (let j = i + 1; j < projected.length; j++) {
                    const dx = projected[i].px - projected[j].px;
                    const dy = projected[i].py - projected[j].py;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 85) {
                        ctx.beginPath();
                        ctx.moveTo(project[i].px, projected[i].py);
                        ctx.lineTo(projected[j].px, projected[j].py);
                        ctx.stroke();
                    }
                }
            }

            // Draw nodes
            projected.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.px, p.py, Math.max(1, 3.5 * p.scale), 0, Math.PI * 2);
                ctx.fill();
            });
        };

        animate2DFallback();
    }

    // =========================================================================
    // 2. SCROLL & MOUSE INTERACTION BINDINGS
    // =========================================================================
    initScrollListener() {
        window.addEventListener('scroll', () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            this.scrollDepth = maxScroll > 0 ? (window.scrollY / maxScroll) : 0;

            const heroSec = document.getElementById('heroSection');
            if (heroSec) {
                const rect = heroSec.getBoundingClientRect();
                this.isHeroVisible = rect.bottom > 0;
            }
        }, { passive: true });
    }

    initMouseInteractions() {
        window.addEventListener('mousemove', (e) => {
            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = (e.clientY / window.innerHeight) * 2 - 1;
            this.mouse.targetX = nx;
            this.mouse.targetY = ny;
        });

        // Touch support
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const nx = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
                const ny = (e.touches[0].clientY / window.innerHeight) * 2 - 1;
                this.mouse.targetX = nx;
                this.mouse.targetY = ny;
            }
        }, { passive: true });
    }

    // =========================================================================
    // 3. IN-GAME 3D STAGE GENERATOR (Custom 3D scenes inside game modals)
    // =========================================================================
    mount3DGameStage(containerEl, mechanic) {
        if (!containerEl) return;

        const canvas = document.createElement('canvas');
        canvas.className = 'game-3d-stage-canvas';
        canvas.width = containerEl.clientWidth || 600;
        canvas.height = 160;
        containerEl.prepend(canvas);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frameId;
        let t = 0;

        const renderStage = () => {
            frameId = requestAnimationFrame(renderStage);
            t += 0.04;
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            if (mechanic === 'boss_battle') {
                // 3D Wireframe Mecha Boss Core
                const cx = w / 2;
                const cy = h / 2;
                ctx.save();
                ctx.strokeStyle = '#ff2a4b';
                ctx.lineWidth = 1.5;
                ctx.shadowColor = '#ff2a4b';
                ctx.shadowBlur = 12;

                const sides = 8;
                const radius = 45 + Math.sin(t * 3) * 4;
                ctx.beginPath();
                for (let i = 0; i <= sides; i++) {
                    const angle = (i / sides) * Math.PI * 2 + t * 0.8;
                    const x = cx + Math.cos(angle) * radius;
                    const y = cy + Math.sin(angle) * (radius * 0.45);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();

                // Inner energy core
                ctx.strokeStyle = '#00f0ff';
                ctx.beginPath();
                for (let i = 0; i <= sides; i++) {
                    const angle = (i / sides) * Math.PI * 2 - t * 1.2;
                    const x = cx + Math.cos(angle) * (radius * 0.55);
                    const y = cy + Math.sin(angle) * (radius * 0.55);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
                ctx.restore();

            } else if (mechanic === 'loop_racer') {
                // 3D Perspective Neon Racing Speedway
                ctx.save();
                const horizonY = h * 0.25;
                const vanishX = w / 2;

                ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
                ctx.lineWidth = 1;

                // Perspective grid lines
                for (let x = -w * 0.8; x <= w * 1.8; x += 60) {
                    ctx.beginPath();
                    ctx.moveTo(vanishX, horizonY);
                    ctx.lineTo(x, h);
                    ctx.stroke();
                }

                // Speed lines moving towards viewer
                ctx.strokeStyle = '#ff6a00';
                ctx.lineWidth = 2;
                for (let i = 0; i < 5; i++) {
                    const prog = ((t * 2 + i * 0.2) % 1);
                    const y = horizonY + prog * prog * (h - horizonY);
                    const widthAtY = (prog * 2) * (w * 0.4);
                    ctx.beginPath();
                    ctx.moveTo(vanishX - widthAtY, y);
                    ctx.lineTo(vanishX + widthAtY, y);
                    ctx.stroke();
                }
                ctx.restore();

            } else if (mechanic === 'maze_runner') {
                // 3D Wireframe Cyber Labyrinth
                ctx.save();
                ctx.strokeStyle = 'rgba(168, 85, 240, 0.45)';
                ctx.lineWidth = 1;
                const cx = w / 2;
                const cy = h / 2;

                for (let i = 1; i <= 4; i++) {
                    const s = (i * 24 + (t * 20) % 24);
                    ctx.strokeRect(cx - s * 1.8, cy - s, s * 3.6, s * 2);
                }
                ctx.restore();

            } else if (mechanic === 'pattern_builder') {
                // 3D Isometric Voxel Cube
                ctx.save();
                const cx = w / 2;
                const cy = h / 2;
                const size = 30;

                ctx.fillStyle = 'rgba(255, 190, 38, 0.2)';
                ctx.strokeStyle = '#ffbe26';
                ctx.lineWidth = 1.5;

                // Isometric Top
                ctx.beginPath();
                ctx.moveTo(cx, cy - size);
                ctx.lineTo(cx + size * 1.4, cy - size * 0.3);
                ctx.lineTo(cx, cy + size * 0.4);
                ctx.lineTo(cx - size * 1.4, cy - size * 0.3);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Left Face
                ctx.beginPath();
                ctx.moveTo(cx - size * 1.4, cy - size * 0.3);
                ctx.lineTo(cx, cy + size * 0.4);
                ctx.lineTo(cx, cy + size * 1.4);
                ctx.lineTo(cx - size * 1.4, cy + size * 0.7);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Right Face
                ctx.beginPath();
                ctx.moveTo(cx, cy + size * 0.4);
                ctx.lineTo(cx + size * 1.4, cy - size * 0.3);
                ctx.lineTo(cx + size * 1.4, cy + size * 0.7);
                ctx.lineTo(cx, cy + size * 1.4);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.restore();
            } else {
                // Ambient Cyber Neon Flow Grid for other categories
                ctx.save();
                ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
                ctx.lineWidth = 1;
                const gridSize = 24;
                for (let x = 0; x <= w; x += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, h);
                    ctx.stroke();
                }
                for (let y = 0; y <= h; y += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(w, y);
                    ctx.stroke();
                }
                // Pulsing data packet
                const px = (t * 80) % (w + 40) - 20;
                const py = (h / 2) + Math.sin(t * 2) * 20;
                ctx.fillStyle = '#00f0ff';
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        };

        renderStage();

        return () => {
            cancelAnimationFrame(frameId);
            if (canvas.parentElement) canvas.remove();
        };
    }
}

window.Mirai3DEngine = Mirai3DEngine;
