/**
 * Mirai School of Technology - Procedural Web Audio Engine
 * Uses Web Audio API to generate dark synth ambient drones, fire crackles,
 * anime sword slashes, boss lasers, UI clicks, victory fanfares, and error buzzers.
 * No external MP3/WAV files required!
 */

class MiraiAudioEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.ambientPlaying = false;
        this.ambientNodes = [];
        this.masterGain = null;
    }

    init() {
        if (this.ctx) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.7;
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            console.warn("Web Audio not supported", e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.7, this.ctx.currentTime);
        }
        return this.muted;
    }

    setVolume(val) {
        if (this.masterGain && this.ctx) {
            const clamped = Math.max(0, Math.min(1, val));
            this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
        }
    }

    // Subtle UI Hover Micro-Tick
    playHover() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        this.resume();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(2200, this.ctx.currentTime + 0.025);

            gain.gain.setValueAtTime(0.035, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.025);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.03);
        } catch (e) {}
    }

    // 3D Card Orbit / Hologram Tilt Resonant Hum
    playTilt() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        this.resume();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(420, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(560, this.ctx.currentTime + 0.06);

            gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.07);
        } catch (e) {}
    }

    // UI Click / Beep
    playClick() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        this.resume();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.06);
        } catch (e) {}
    }

    // Anime Katana Slash / Tech Whoosh
    playSlash() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        this.resume();
        try {
            // White noise burst with bandpass sweep
            const bufferSize = this.ctx.sampleRate * 0.25;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.Q.value = 4;
            filter.frequency.setValueAtTime(3500, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.22);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            noise.start();
            noise.stop(this.ctx.currentTime + 0.26);

            // Also add metallic chime ping
            const osc = this.ctx.createOscillator();
            const oscGain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.15);
            oscGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            oscGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
            osc.connect(oscGain);
            oscGain.connect(this.masterGain);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.16);
        } catch (e) {}
    }

    // Boss Laser / Critical Attack
    playLaser() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        this.resume();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(880, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.35);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2200, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.35);

            gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.36);
        } catch (e) {}
    }

    // Correct Answer / Clue Found chime
    playSuccess() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        this.resume();
        try {
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                const startTime = this.ctx.currentTime + idx * 0.07;
                gain.gain.setValueAtTime(0.2, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start(startTime);
                osc.stop(startTime + 0.26);
            });
        } catch (e) {}
    }

    // Wrong Answer / Life Lost Thud
    playError() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        this.resume();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(130, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(55, this.ctx.currentTime + 0.25);

            gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.26);
        } catch (e) {}
    }

    // Badge Unlocked / Stage Clear Fanfare
    playBadgeFanfare() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        this.resume();
        try {
            const arpeggio = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
            arpeggio.forEach((f, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = f;
                const t = this.ctx.currentTime + i * 0.08;
                gain.gain.setValueAtTime(0.25, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start(t);
                osc.stop(t + 0.55);
            });
        } catch (e) {}
    }

    // Towering Gate Opening Rumble
    playGateOpening() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        this.resume();
        try {
            const bufferSize = this.ctx.sampleRate * 2.5;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(80, this.ctx.currentTime);
            filter.frequency.linearRampToValueAtTime(220, this.ctx.currentTime + 1.2);
            filter.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 2.4);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.8);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.5);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            noise.start();
            noise.stop(this.ctx.currentTime + 2.5);

            // Low sub-bass hum
            const sub = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(45, this.ctx.currentTime);
            sub.frequency.linearRampToValueAtTime(65, this.ctx.currentTime + 1.0);
            subGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
            subGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.2);
            sub.connect(subGain);
            subGain.connect(this.masterGain);
            sub.start();
            sub.stop(this.ctx.currentTime + 2.2);
        } catch (e) {}
    }

    // Dark Ambient Fire & Synth Drone Loop
    toggleAmbient() {
        this.init();
        if (!this.ctx) return false;
        this.resume();
        if (this.ambientPlaying) {
            this.stopAmbient();
            return false;
        } else {
            this.startAmbient();
            return true;
        }
    }

    startAmbient() {
        if (this.ambientPlaying || this.muted) return;
        this.init();
        if (!this.ctx) return;
        this.resume();

        try {
            // 1. Dark droning pad (minor chord F# - C# - A)
            const freqs = [92.5, 138.59, 174.61]; // F#2, C#3, F3

            freqs.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;

                const lfo = this.ctx.createOscillator();
                const lfoGain = this.ctx.createGain();
                lfo.frequency.value = 0.2 + Math.random() * 0.15;
                lfoGain.gain.value = 2.0;
                lfo.connect(osc.frequency);
                lfo.start();

                gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start();

                this.ambientNodes.push(osc, gain, lfo, lfoGain);
            });

            this.ambientPlaying = true;
        } catch (e) {}
    }

    stopAmbient() {
        this.ambientNodes.forEach(node => {
            try {
                if (node.stop) node.stop();
                if (node.disconnect) node.disconnect();
            } catch (e) {}
        });
        this.ambientNodes = [];
        this.ambientPlaying = false;
    }
}

// Global audio singleton
window.miraiAudio = new MiraiAudioEngine();
