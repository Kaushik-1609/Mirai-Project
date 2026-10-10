'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, EyeOff, Eye, Sparkles, UserCheck } from 'lucide-react';

interface AnonymousToggleProps {
  isAnonymous: boolean;
  realName: string;
  gamerTag: string;
  realAvatar: string;
  anonymousAvatar: string;
  onToggle: (newState: boolean) => void;
}

export const AnonymousToggle: React.FC<AnonymousToggleProps> = ({
  isAnonymous,
  realName,
  gamerTag,
  realAvatar,
  anonymousAvatar,
  onToggle
}) => {
  return (
    <div className="w-full bg-[#0c0d18]/90 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Background Ambience */}
      <div 
        className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
          isAnonymous ? 'bg-purple-600/20' : 'bg-cyan-500/15'
        }`}
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        {/* Left Identity Preview with Framer Motion Transformation */}
        <div className="flex items-center gap-4">
          {/* Animated Avatar Frame */}
          <div className="relative">
            <motion.div
              key={isAnonymous ? 'ninja-avatar' : 'real-avatar'}
              initial={{ scale: 0.8, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.8, rotate: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 14, stiffness: 220 }}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl border-2 shadow-lg ${
                isAnonymous
                  ? 'bg-gradient-to-br from-purple-900/60 to-zinc-950 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                  : 'bg-gradient-to-br from-cyan-900/40 to-zinc-900 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
              }`}
            >
              {isAnonymous ? (
                anonymousAvatar || '🥷'
              ) : (
                realAvatar?.startsWith('http') || realAvatar?.startsWith('/') ? (
                  <img src={realAvatar} alt="Cadet" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  realAvatar || '⚔️'
                )
              )}
            </motion.div>

            {/* Micro Badge */}
            <div className={`absolute -bottom-1 -right-1 p-1 rounded-full text-black text-[10px] font-bold ${
              isAnonymous ? 'bg-purple-400' : 'bg-cyan-400'
            }`}>
              {isAnonymous ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </div>
          </div>

          {/* Identity Text with Smooth Transformation */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-black uppercase tracking-wider text-zinc-400">
                ACTIVE IDENTITY:
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                isAnonymous 
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' 
                  : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
              }`}>
                {isAnonymous ? 'INCOGNITO MASKED' : 'PUBLIC PROFILE'}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isAnonymous ? gamerTag : realName}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5"
              >
                {isAnonymous ? (
                  <>
                    <span className="text-purple-400 font-mono">{gamerTag}</span>
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </>
                ) : (
                  <>
                    <span>{realName}</span>
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <p className="text-xs text-zinc-400 mt-0.5 max-w-sm sm:max-w-md leading-relaxed">
              {isAnonymous
                ? 'Your real identity and photo are completely hidden on all 20-cadet boards.'
                : 'Your real cadet name and photo are visible on the cohort leaderboard.'}
            </p>
          </div>
        </div>

        {/* Right Toggle Control */}
        <div className="flex items-center gap-4 bg-zinc-950/80 border border-white/10 p-3.5 sm:p-4 rounded-xl self-stretch md:self-auto justify-between md:justify-start">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-black text-white tracking-wider flex items-center gap-1.5 font-mono">
              <Shield className="w-3.5 h-3.5 text-cyan-400" /> Go Anonymous
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              {isAnonymous ? 'Mask Active (Real Name Hidden)' : 'Click to Hide Real Name'}
            </span>
          </div>

          {/* Interactive Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={isAnonymous}
            onClick={() => onToggle(!isAnonymous)}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              isAnonymous ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-zinc-800'
            }`}
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-[10px] ${
                isAnonymous ? 'ml-auto text-purple-600' : 'text-zinc-600'
              }`}
            >
              {isAnonymous ? '🥷' : '👁️'}
            </motion.div>
          </button>
        </div>
      </div>
    </div>
  );
};
