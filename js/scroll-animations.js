/**
 * Mirai School of Technology - Scroll-Triggered Animations & Micro-Interactions
 * Features:
 * 1. Intersection Observer Scrollytelling (Staggered fade, elevation, and slide-up)
 * 2. 3D Card Tilt with Specular Glare spotlight following mouse cursor
 * 3. Magnetic button hover micro-interactions
 * 4. Header frosted glassmorphism elevation on scroll
 */

class MiraiScrollAnimator {
    constructor() {
        this.initScrollReveal();
        this.initCardTiltEffects();
        this.initMagneticButtons();
        this.initHeaderScroll();
    }

    // 1. Scroll-Triggered Reveal Animations
    initScrollReveal() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -60px 0px',
            threshold: 0.12
        };

        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    // Stagger child cards if container
                    const staggers = entry.target.querySelectorAll('.stagger-item');
                    staggers.forEach((el, idx) => {
                        el.style.animationDelay = `${idx * 0.08}s`;
                        el.classList.add('in-view');
                    });
                }
            });
        }, observerOptions);

        document.querySelectorAll('.scroll-reveal, .arcade-cards-grid, .factions-grid, .faculty-grid, .profile-metrics-row').forEach(el => {
            revealObserver.observe(el);
        });

        // Re-observe dynamic elements after arcade re-renders
        this.refreshObservers = () => {
            document.querySelectorAll('.game-card, .faction-card, .dashboard-panel').forEach(card => {
                revealObserver.observe(card);
                this.bindTiltToCard(card);
            });
        };
    }

    // 2. 3D Card Tilt with Specular Glare
    initCardTiltEffects() {
        document.querySelectorAll('.game-card, .faction-card, .daily-quiz-card, .dashboard-panel').forEach(card => {
            this.bindTiltToCard(card);
        });
    }

    bindTiltToCard(card) {
        if (card.dataset.tiltBound) return;
        card.dataset.tiltBound = 'true';

        // Create specular glare overlay element
        let glare = card.querySelector('.card-glare');
        if (!glare) {
            glare = document.createElement('div');
            glare.className = 'card-glare';
            card.appendChild(glare);
        }

        let isHovered = false;

        card.addEventListener('mouseenter', () => {
            isHovered = true;
            if (window.miraiAudio) window.miraiAudio.playHover();
        });

        card.addEventListener('mousemove', (e) => {
            if (!isHovered) return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

            // Update specular glare position
            glare.style.opacity = '1';
            glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 240, 255, 0.16) 0%, rgba(168, 85, 240, 0.08) 35%, transparent 65%)`;
        });

        card.addEventListener('mouseleave', () => {
            isHovered = false;
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            glare.style.opacity = '0';
        });
    }

    // 3. Magnetic Button Micro-Interactions
    initMagneticButtons() {
        const buttons = document.querySelectorAll('.enter-gate-btn, .primary-btn, .launch-game-btn, .sound-toggle-btn');
        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - (rect.left + rect.width / 2);
                const y = e.clientY - (rect.top + rect.height / 2);

                btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px) scale(1.04)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0px, 0px) scale(1)';
            });

            btn.addEventListener('mouseenter', () => {
                if (window.miraiAudio) window.miraiAudio.playHover();
            });
        });
    }

    // 4. Header Frosted Glass Elevation on Scroll
    initHeaderScroll() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });
    }
}

window.MiraiScrollAnimator = MiraiScrollAnimator;
