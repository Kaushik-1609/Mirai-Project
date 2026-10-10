/**
 * MSOT LEARN — Pixel Grid Cursor Trail Animation
 * 
 * Reusable full-screen ambient canvas trail:
 * - Invisible grid: 100px squares (desktop), 60px squares (mobile < 600px)
 * - Cursor activates current square in vibrant orange (#e8742a)
 * - 4 adjacent cardinal squares (up, down, left, right) activate in soft orange (plus-shape)
 * - Smooth quadratic fade decay
 * - Fast movement interpolation ensures continuous trail with zero gaps
 * - High-DPI crisp rendering, battery-friendly animation loop
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.PixelGridTrail = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    class PixelGridTrail {
        constructor(canvasId = 'pixel-trail', options = {}) {
            this.canvasId = canvasId;
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

            this.FADE = options.fade || 0.018;
            this.COLOR_RGB = options.color || '168, 85, 240'; // Astral Violet (#a855f0) - Sleek, non-orange
            this.PEAK_ALPHA = options.peakAlpha || 0.55;
            this.NEIGHBOR_ALPHA = options.neighborAlpha || 0.20;

            this.CELL = 100;
            this.W = 0;
            this.H = 0;
            this.dpr = 1;

            this.cells = new Map();
            this.last = null;
            this.isRunning = false;
            this.rafId = null;

            this._handleResize = this.resize.bind(this);
            this._handlePointerMove = this.onPointerMove.bind(this);
            this._handlePointerLeave = this.onPointerLeave.bind(this);
            this._loop = this.frame.bind(this);

            if (this.canvas) {
                this.init();
            }
        }

        init() {
            if (!this.canvas) {
                this.canvas = document.getElementById(this.canvasId);
                if (!this.canvas) return;
                this.ctx = this.canvas.getContext('2d');
            }

            this.resize();
            window.addEventListener('resize', this._handleResize, { passive: true });
            window.addEventListener('pointermove', this._handlePointerMove, { passive: true });
            window.addEventListener('pointerdown', this._handlePointerMove, { passive: true });
            window.addEventListener('pointerleave', this._handlePointerLeave, { passive: true });

            this.start();
        }

        resize() {
            if (!this.canvas || !this.ctx) return;
            this.dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.W = window.innerWidth;
            this.H = window.innerHeight;

            this.canvas.width = Math.floor(this.W * this.dpr);
            this.canvas.height = Math.floor(this.H * this.dpr);
            this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

            this.CELL = this.W < 600 ? 60 : 100;
        }

        light(cx, cy, v) {
            // Check boundary to prevent drawing offscreen
            if (cx < -1 || cy < -1 || cx * this.CELL > this.W || cy * this.CELL > this.H) return;
            const k = cx + ',' + cy;
            const cur = this.cells.get(k) || 0;
            if (v > cur) {
                this.cells.set(k, v);
            }
        }

        hit(x, y) {
            const cx = Math.floor(x / this.CELL);
            const cy = Math.floor(y / this.CELL);

            // Center square: full intensity
            this.light(cx, cy, 1.0);

            // 4 Cardinal neighbors (up, down, left, right): plus shape
            this.light(cx + 1, cy, this.NEIGHBOR_ALPHA);
            this.light(cx - 1, cy, this.NEIGHBOR_ALPHA);
            this.light(cx, cy + 1, this.NEIGHBOR_ALPHA);
            this.light(cx, cy - 1, this.NEIGHBOR_ALPHA);
        }

        onPointerMove(e) {
            const x = e.clientX;
            const y = e.clientY;

            if (this.last) {
                const dx = x - this.last.x;
                const dy = y - this.last.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const step = this.CELL / 2;
                const n = Math.ceil(dist / step);

                for (let i = 1; i <= n; i++) {
                    this.hit(this.last.x + (dx * i) / n, this.last.y + (dy * i) / n);
                }
            } else {
                this.hit(x, y);
            }

            this.last = { x, y };
        }

        onPointerLeave() {
            this.last = null;
        }

        frame() {
            if (!this.isRunning || !this.ctx) return;

            this.ctx.clearRect(0, 0, this.W, this.H);

            if (this.cells.size > 0) {
                this.cells.forEach((v, k) => {
                    const p = k.split(',');
                    const alpha = (v * v * this.PEAK_ALPHA).toFixed(3);
                    this.ctx.fillStyle = `rgba(${this.COLOR_RGB},${alpha})`;
                    this.ctx.fillRect(+p[0] * this.CELL, +p[1] * this.CELL, this.CELL, this.CELL);

                    v -= this.FADE;
                    if (v <= 0.01) {
                        this.cells.delete(k);
                    } else {
                        this.cells.set(k, v);
                    }
                });
            }

            this.rafId = requestAnimationFrame(this._loop);
        }

        start() {
            if (this.isRunning) return;
            this.isRunning = true;
            this.frame();
        }

        stop() {
            this.isRunning = false;
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
        }

        clear() {
            this.cells.clear();
            if (this.ctx) {
                this.ctx.clearRect(0, 0, this.W, this.H);
            }
        }

        destroy() {
            this.stop();
            window.removeEventListener('resize', this._handleResize);
            window.removeEventListener('pointermove', this._handlePointerMove);
            window.removeEventListener('pointerdown', this._handlePointerMove);
            window.removeEventListener('pointerleave', this._handlePointerLeave);
            this.clear();
        }
    }

    // Auto-initialize when DOM is ready
    if (typeof window !== 'undefined') {
        const autoInit = () => {
            const cv = document.getElementById('pixel-trail');
            if (cv && !window.pixelGridTrailInstance) {
                window.pixelGridTrailInstance = new PixelGridTrail('pixel-trail');
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', autoInit);
        } else {
            autoInit();
        }
    }

    return PixelGridTrail;
}));
