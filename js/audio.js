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

    // Sacred Ancient Japanese Temple Bell (Bonshō 梵鐘 / Kane)
    // Struck by heavy wooden log striker (Shumoku 撞木) - deep 108Hz Buddhist fundamental drone,
    // natural acoustic beating (Uneri 唸り at ~1.2Hz), and lingering warm bronze resonance (Meian 銘暗).
    // Strictly zero high-frequency beeps or clicks!
    playTempleBell() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        this.resume();
        try {
            const now = this.ctx.currentTime;

            // Master Bell Bus with warm saturation gain
            const bellBus = this.ctx.createGain();
            bellBus.gain.setValueAtTime(0.9, now);
            bellBus.connect(this.masterGain);

            // 1. Heavy Wooden Log Striker Hit ("Shumoku" 撞木)
            // Real Bonshō are struck by a suspended wooden trunk, producing a deep, rounded,
            // low-frequency thud with zero metallic clatter or electronic beeps.
            const strikeGain = this.ctx.createGain();
            const strikeFilter = this.ctx.createBiquadFilter();
            strikeFilter.type = 'lowpass';
            strikeFilter.frequency.setValueAtTime(140, now);
            strikeFilter.frequency.exponentialRampToValueAtTime(45, now + 0.22);

            const strikeOsc = this.ctx.createOscillator();
            strikeOsc.type = 'sine';
            strikeOsc.frequency.setValueAtTime(88, now);
            strikeOsc.frequency.exponentialRampToValueAtTime(32, now + 0.2);

            strikeGain.gain.setValueAtTime(0.55, now);
            strikeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

            strikeOsc.connect(strikeFilter);
            strikeFilter.connect(strikeGain);
            strikeGain.connect(bellBus);
            strikeOsc.start(now);
            strikeOsc.stop(now + 0.25);

            // Low-frequency damped friction thud from wood grain meeting cast bronze
            const noiseLen = Math.floor(this.ctx.sampleRate * 0.15);
            const noiseBuf = this.ctx.createBuffer(1, noiseLen, this.ctx.sampleRate);
            const nData = noiseBuf.getChannelData(0);
            for (let i = 0; i < noiseLen; i++) {
                nData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseLen * 0.22));
            }
            const noiseSrc = this.ctx.createBufferSource();
            noiseSrc.buffer = noiseBuf;

            const noiseFilter = this.ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(110, now);
            noiseFilter.Q.value = 1.6;

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.28, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

            noiseSrc.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(bellBus);
            noiseSrc.start(now);
            noiseSrc.stop(now + 0.16);

            // 2. Japanese Temple Bell Acoustic Spectrum (Inharmonic Bronze Modes)
            // - 108 Hz fundamental: Sacred Buddhist number of earthly passions (Joya no Kane)
            // - Paired twin frequencies create natural acoustic beating (Uneri 唸り ~1.2 Hz)
            // - Resonant partials carefully tuned to ancient Japanese temple acoustics
            // - Strictly sine waves below 600 Hz to prevent any synthetic chirp or beep
            const partials = [
                // Deep Fundamental Drone (Tsurigane / Otsu-on)
                { f: 108.0, g: 0.62, d: 6.8 },
                { f: 109.25, g: 0.44, d: 6.4 }, // Interferes with 108.0 Hz -> produces 1.25 Hz slow beating pulse

                // Main Bell Body Resonance (Dō-on)
                { f: 216.0, g: 0.48, d: 5.8 },
                { f: 217.4, g: 0.32, d: 5.4 }, // 1.4 Hz beating on the octave

                // Sacred Japanese Zen Scale Harmonic (Jū-on)
                { f: 271.5, g: 0.30, d: 4.8 },
                { f: 325.0, g: 0.22, d: 4.2 },

                // Upper Bronze Overtones (Mellow, solemn air resonance)
                { f: 433.0, g: 0.14, d: 3.6 },
                { f: 541.0, g: 0.08, d: 2.8 }
            ];

            partials.forEach(p => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(p.f, now);

                // Smooth organic attack (bronze blossoming, no transient click)
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.linearRampToValueAtTime(p.g, now + 0.035);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + p.d);

                osc.connect(gain);
                gain.connect(bellBus);
                osc.start(now);
                osc.stop(now + p.d + 0.1);
            });

            // 3. Sub-Bass Earth Presence (Chest rumble of a 2-ton bronze bell)
            const subOsc = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(54, now); // Sub-octave of 108Hz
            subGain.gain.setValueAtTime(0.0001, now);
            subGain.gain.linearRampToValueAtTime(0.38, now + 0.04);
            subGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.2);

            subOsc.connect(subGain);
            subGain.connect(bellBus);
            subOsc.start(now);
            subOsc.stop(now + 5.3);

        } catch (e) {
            console.warn("Temple bell audio error:", e);
        }
    }

    // Towering Gate Opening with Sacred Bell & Cinematic Stone Rumble
    playGateOpening() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        this.resume();
        try {
            // 1. Ring the sacred ancient Japanese temple bell immediately upon gate opening
            this.playTempleBell();

            // 2. Deep cinematic stone unsealing rumble (extended for ~3.8s sequence)
            const now = this.ctx.currentTime;
            const bufferSize = Math.floor(this.ctx.sampleRate * 3.8);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(45, now);
            filter.frequency.linearRampToValueAtTime(160, now + 1.8);
            filter.frequency.exponentialRampToValueAtTime(40, now + 3.8);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.26, now + 1.2);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            noise.start(now);
            noise.stop(now + 3.8);

            // 3. Low sub-bass earth hum
            const sub = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(40, now);
            sub.frequency.linearRampToValueAtTime(54, now + 1.8);
            subGain.gain.setValueAtTime(0.24, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 3.6);
            sub.connect(subGain);
            subGain.connect(this.masterGain);
            sub.start(now);
            sub.stop(now + 3.6);
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
