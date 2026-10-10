'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Award, 
  Zap, 
  X, 
  CheckCircle, 
  TrendingUp, 
  Flame, 
  ShieldCheck, 
  Users 
} from 'lucide-react';
import { BadgeUnlockEvent } from '@/types/gamification';

interface BadgeUnlockModalProps {
  unlockEvent: BadgeUnlockEvent | null;
  onClose: () => void;
}

// Confetti particle definition
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  velocity: { x: number; y: number };
}

const CONFETTI_COLORS = [
  '#00f0ff', // Cyber cyan
  '#ffd700', // Imperial gold
  '#ff2a4b', // Crimson
  '#00ff88', // Emerald
  '#a855f0', // Purple
  '#ffffff'  // Pure white
];

export const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({ unlockEvent, onClose }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!unlockEvent) return;

    // Generate confetti particle explosion
    const newParticles: Particle[] = Array.from({ length: 65 }).map((_, i) => ({
      id: i,
      x: 0,
      y: 0,
      size: Math.random() * 8 + 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      velocity: {
        x: (Math.random() - 0.5) * 600,
        y: (Math.random() - 0.7) * 700,
      }
    }));
    setParticles(newParticles);
  }, [unlockEvent]);

  if (!unlockEvent) return null;

  const { badge, awardedXP, contextNote } = unlockEvent;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dark Obsidian Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#04040a]/90 backdrop-blur-xl"
        />

        {/* Confetti Explosion Burst */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
              animate={{ 
                x: p.velocity.x, 
                y: p.velocity.y + 400, 
                opacity: [1, 1, 0], 
                scale: [0, 1.2, 0.5], 
                rotate: p.rotation + 720 
              }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              style={{
                width: p.size,
                height: p.size * (Math.random() > 0.5 ? 1 : 2),
                backgroundColor: p.color,
                boxShadow: `0 0 10px ${p.color}`,
                borderRadius: p.size > 8 ? '2px' : '50%'
              }}
              className="absolute"
            />
          ))}
        </div>

        {/* Main RPG Unlock Card */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          className="relative z-10 w-full max-w-lg bg-gradient-to-b from-[#121424] to-[#070810] border-2 border-cyan-400/50 rounded-3xl p-8 sm:p-10 shadow-[0_0_60px_rgba(6,182,212,0.35)] text-center overflow-hidden"
        >
          {/* Rotating Holographic Background Rays */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="w-[600px] h-[600px] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(0,240,255,0.4)_40deg,transparent_60deg,rgba(255,42,75,0.4)_140deg,transparent_160deg,rgba(255,215,0,0.4)_240deg,transparent_260deg)]"
            />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-mono text-xs font-black tracking-widest uppercase mb-6 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
            ACHIEVEMENT UNLOCKED
          </motion.div>

          {/* Animated 3D Badge Avatar Container */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', damping: 14, stiffness: 200 }}
            className="relative mx-auto mb-6 w-28 h-28 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center p-2 border-4 shadow-2xl"
            style={{
              backgroundColor: 'rgba(15,18,32,0.95)',
              borderColor: badge.badgeColorHex || '#00f0ff',
              boxShadow: `0 0 50px ${badge.badgeColorHex || '#00f0ff'}80, inset 0 0 25px ${badge.badgeColorHex || '#00f0ff'}40`,
            }}
          >
            {/* Glowing Icon */}
            <div 
              className="drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] text-5xl sm:text-6xl"
              style={{ color: badge.badgeColorHex || '#00f0ff' }}
            >
              <Award className="w-16 h-16 sm:w-20 sm:h-20" />
            </div>

            {/* Radiant Corner Crests */}
            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-white/60" />
            <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-white/60" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-white/60" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-white/60" />
          </motion.div>

          {/* Badge Title & Category Subhead */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-1">
              {badge.category} • {badge.rarity} TIER
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {badge.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-sm mx-auto leading-relaxed">
              {badge.description}
            </p>
          </motion.div>

          {/* Context Note (If improvement or streak) */}
          {contextNote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold inline-block"
            >
              🎯 {contextNote}
            </motion.div>
          )}

          {/* Reward Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-6 p-4 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-around font-mono"
          >
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">XP Awarded</span>
              <span className="text-xl font-black text-emerald-400 flex items-center gap-1">
                <Zap className="w-4 h-4" /> +{awardedXP || badge.xpReward} XP
              </span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Codex Status</span>
              <span className="text-xl font-black text-cyan-400 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> VERIFIED
              </span>
            </div>
          </motion.div>

          {/* Claim / Continue Button */}
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="mt-6 w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(6,182,212,0.6)] cursor-pointer transition-all"
          >
            EQUIP TO PROFILE & CONTINUE ➔
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
