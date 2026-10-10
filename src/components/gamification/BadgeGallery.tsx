'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Flame, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  HelpCircle, 
  X, 
  Award,
  Zap,
  Info
} from 'lucide-react';
import { Badge, BadgeCategory, StudentBadgeProgress, RarityTier } from '@/types/gamification';

// Dynamic Lucide Icon Mapper
const getBadgeIcon = (iconName: string, className = "w-6 h-6") => {
  switch (iconName.toLowerCase()) {
    case 'trendingup':
    case 'comeback':
      return <TrendingUp className={className} />;
    case 'flame':
    case 'streak':
      return <Flame className={className} />;
    case 'shieldcheck':
    case 'ironwill':
      return <ShieldCheck className={className} />;
    case 'users':
    case 'samaritan':
      return <Users className={className} />;
    case 'sparkles':
    case 'phoenix':
      return <Sparkles className={className} />;
    case 'zap':
      return <Zap className={className} />;
    default:
      return <Award className={className} />;
  }
};

// Rarity styles mapping
const rarityStyles: Record<RarityTier, { border: string; glow: string; text: string; bg: string }> = {
  COMMON: {
    border: 'border-zinc-700/80',
    glow: 'group-hover:shadow-[0_0_20px_rgba(161,161,170,0.3)]',
    text: 'text-zinc-400',
    bg: 'bg-zinc-800/40'
  },
  RARE: {
    border: 'border-cyan-500/50',
    glow: 'group-hover:shadow-[0_0_25px_rgba(6,182,212,0.45)]',
    text: 'text-cyan-400',
    bg: 'bg-cyan-950/20'
  },
  EPIC: {
    border: 'border-purple-500/50',
    glow: 'group-hover:shadow-[0_0_25px_rgba(168,85,247,0.45)]',
    text: 'text-purple-400',
    bg: 'bg-purple-950/20'
  },
  LEGENDARY: {
    border: 'border-amber-400/60',
    glow: 'group-hover:shadow-[0_0_30px_rgba(251,191,36,0.55)]',
    text: 'text-amber-400',
    bg: 'bg-amber-950/25'
  },
  MYTHIC: {
    border: 'border-rose-500/70',
    glow: 'group-hover:shadow-[0_0_35px_rgba(244,63,94,0.65)]',
    text: 'text-rose-400',
    bg: 'bg-rose-950/30'
  }
};

const categoryTabs: { label: string; value: 'ALL' | BadgeCategory; icon: React.ReactNode }[] = [
  { label: 'All Badges', value: 'ALL', icon: <Award className="w-4 h-4" /> },
  { label: 'Improvement', value: 'IMPROVEMENT', icon: <TrendingUp className="w-4 h-4" /> },
  { label: 'Consistency', value: 'CONSISTENCY', icon: <Flame className="w-4 h-4" /> },
  { label: 'Mastery', value: 'MASTERY', icon: <ShieldCheck className="w-4 h-4" /> },
  { label: 'Community', value: 'COMMUNITY', icon: <Users className="w-4 h-4" /> },
  { label: 'Fun', value: 'FUN', icon: <Sparkles className="w-4 h-4" /> },
];

interface BadgeGalleryProps {
  badges: StudentBadgeProgress[];
  onBadgeClick?: (item: StudentBadgeProgress) => void;
}

export const BadgeGallery: React.FC<BadgeGalleryProps> = ({ badges }) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | BadgeCategory>('ALL');
  const [activeModalBadge, setActiveModalBadge] = useState<StudentBadgeProgress | null>(null);

  // Filter badges
  const filteredBadges = badges.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.badge.category === selectedCategory;
  });

  const unlockedCount = badges.filter(b => b.isUnlocked).length;
  const totalCount = badges.length;
  const completionPercent = Math.round((unlockedCount / Math.max(1, totalCount)) * 100);

  return (
    <div className="w-full bg-[#08080f]/90 border border-cyan-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Overall Progression */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase mb-2">
            <Award className="w-3.5 h-3.5" /> Inclusive Codex
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            ACADEMY BADGE VAULT
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            Rewarding growth, consistency, and peer contribution—so every cadet has equal opportunity to claim legendary status.
          </p>
        </div>

        {/* Global Progress Dial */}
        <div className="flex items-center gap-4 bg-zinc-900/80 border border-white/10 px-5 py-3 rounded-xl">
          <div className="text-right">
            <div className="text-xs text-zinc-400 font-mono font-bold tracking-wider uppercase">Unlocked</div>
            <div className="text-xl font-black text-white font-mono">
              <span className="text-cyan-400">{unlockedCount}</span> / {totalCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center relative">
            <div 
              className="absolute inset-0 rounded-full border-2 border-cyan-400 transition-all duration-700"
              style={{
                clipPath: `polygon(50% 50%, -50% -50%, ${completionPercent}% -50%)`,
              }}
            />
            <span className="text-xs font-black text-cyan-300 font-mono">{completionPercent}%</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-5 no-scrollbar relative z-10">
        {categoryTabs.map((tab) => {
          const isActive = selectedCategory === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setSelectedCategory(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)] font-black'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Badges RPG Grid */}
      <motion.div 
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 pt-3 relative z-10"
      >
        <AnimatePresence>
          {filteredBadges.map((item) => {
            const { badge, isUnlocked, currentValue, targetValue, progressPercent } = item;
            const rStyle = rarityStyles[badge.rarity];

            return (
              <motion.div
                key={badge.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={() => setActiveModalBadge(item)}
                className={`group relative rounded-xl p-4 flex flex-col items-center text-center cursor-pointer border transition-all duration-300 overflow-hidden ${rStyle.border} ${rStyle.glow} ${
                  isUnlocked
                    ? `${rStyle.bg} backdrop-blur-md`
                    : 'bg-zinc-950/70 opacity-60 hover:opacity-90 border-dashed border-zinc-800'
                }`}
              >
                {/* Unlocked Radiant Sweep Effect */}
                {isUnlocked && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                )}

                {/* Badge Rarity Pill */}
                <div className="w-full flex items-center justify-between mb-3 text-[10px] font-mono font-black uppercase tracking-wider">
                  <span className={isUnlocked ? rStyle.text : 'text-zinc-600'}>
                    {badge.rarity}
                  </span>
                  <span className="text-zinc-500">
                    +{badge.xpReward} XP
                  </span>
                </div>

                {/* Badge Avatar Frame */}
                <div className="relative mb-3">
                  <div
                    className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 shadow-inner'
                        : 'bg-zinc-900/90 border border-zinc-800 text-zinc-600'
                    }`}
                    style={{
                      borderColor: isUnlocked ? badge.badgeColorHex : 'rgba(255,255,255,0.08)',
                      boxShadow: isUnlocked ? `0 0 20px ${badge.badgeColorHex}40` : 'none',
                    }}
                  >
                    {isUnlocked ? (
                      <div style={{ color: badge.badgeColorHex }}>
                        {getBadgeIcon(badge.iconName, "w-8 h-8 sm:w-9 sm:h-9 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]")}
                      </div>
                    ) : (
                      <Lock className="w-7 h-7 text-zinc-600" />
                    )}
                  </div>

                  {/* Solved Checkmark Icon */}
                  {isUnlocked && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 text-black rounded-full p-0.5 shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Badge Title & Short Lore */}
                <h3 className={`text-xs sm:text-sm font-black tracking-tight line-clamp-1 ${isUnlocked ? 'text-white' : 'text-zinc-400'}`}>
                  {badge.title}
                </h3>
                <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1 leading-snug">
                  {badge.description}
                </p>

                {/* Progress / Status Bottom Bar */}
                <div className="w-full mt-3 pt-2 border-t border-white/5">
                  {isUnlocked ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> CLAIMED
                    </span>
                  ) : (
                    <div className="w-full">
                      <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
                        <span>LOCKED</span>
                        <span>{currentValue}/{targetValue}</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, progressPercent)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Inspect & Unlock Criteria Modal */}
      <AnimatePresence>
        {activeModalBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0b0c16] border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Top ambient color */}
              <div 
                className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: activeModalBadge.badge.badgeColorHex }}
              />

              <button
                onClick={() => setActiveModalBadge(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-900/60 border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center pt-2">
                {/* Modal Badge Icon Frame */}
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center border-2 mb-4 relative"
                  style={{
                    backgroundColor: 'rgba(15,17,28,0.9)',
                    borderColor: activeModalBadge.badge.badgeColorHex,
                    boxShadow: `0 0 30px ${activeModalBadge.badge.badgeColorHex}50`
                  }}
                >
                  <div style={{ color: activeModalBadge.badge.badgeColorHex }}>
                    {getBadgeIcon(activeModalBadge.badge.iconName, "w-10 h-10")}
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest mb-2">
                  {activeModalBadge.badge.category} • {activeModalBadge.badge.rarity}
                </div>

                <h3 className="text-xl font-black text-white tracking-tight">
                  {activeModalBadge.badge.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  {activeModalBadge.badge.description}
                </p>

                {/* How to Unlock Instruction Card */}
                <div className="w-full bg-zinc-900/70 border border-white/10 rounded-xl p-4 my-5 text-left">
                  <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Info className="w-3.5 h-3.5" /> How to Unlock This Badge
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {activeModalBadge.badge.unlockInstruction}
                  </p>

                  {/* Progress tracker inside modal */}
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
                      <span>Requirement Progress</span>
                      <span className="font-bold text-white">
                        {activeModalBadge.currentValue} / {activeModalBadge.targetValue}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, activeModalBadge.progressPercent)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Rewards & Status */}
                <div className="w-full flex items-center justify-between text-xs font-mono text-zinc-400 border-t border-white/10 pt-4">
                  <span>Reward: <strong className="text-amber-400">+{activeModalBadge.badge.xpReward} XP</strong></span>
                  <span>
                    Status: {activeModalBadge.isUnlocked ? (
                      <strong className="text-emerald-400">UNLOCKED ✓</strong>
                    ) : (
                      <strong className="text-zinc-500">IN PROGRESS ({activeModalBadge.progressPercent}%)</strong>
                    )}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
