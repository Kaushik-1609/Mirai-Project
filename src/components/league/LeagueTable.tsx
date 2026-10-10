'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Crown, 
  Flame, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Zap, 
  Award 
} from 'lucide-react';
import { LeagueCadetEntry, LeagueRoomInfo, LeagueTier } from '@/types/league';

// Visual styles mapped per Tier
const tierThemeConfig: Record<LeagueTier, { name: string; accent: string; badgeBg: string; border: string; glow: string }> = {
  BRONZE: {
    name: 'BRONZE LEAGUE',
    accent: 'text-[#cd7f32]',
    badgeBg: 'bg-[#cd7f32]/20',
    border: 'border-[#cd7f32]/40',
    glow: 'shadow-[0_0_30px_rgba(205,127,50,0.3)]'
  },
  SILVER: {
    name: 'SILVER LEAGUE',
    accent: 'text-[#e2e8f0]',
    badgeBg: 'bg-slate-400/20',
    border: 'border-slate-400/40',
    glow: 'shadow-[0_0_30px_rgba(226,232,240,0.3)]'
  },
  GOLD: {
    name: 'GOLD LEAGUE',
    accent: 'text-[#ffd700]',
    badgeBg: 'bg-amber-400/20',
    border: 'border-amber-400/40',
    glow: 'shadow-[0_0_30px_rgba(255,215,0,0.35)]'
  },
  PLATINUM: {
    name: 'PLATINUM LEAGUE',
    accent: 'text-[#00f0ff]',
    badgeBg: 'bg-cyan-400/20',
    border: 'border-cyan-400/40',
    glow: 'shadow-[0_0_35px_rgba(0,240,255,0.4)]'
  },
  DIAMOND: {
    name: 'DIAMOND LEAGUE',
    accent: 'text-[#c084fc]',
    badgeBg: 'bg-purple-400/20',
    border: 'border-purple-400/40',
    glow: 'shadow-[0_0_40px_rgba(192,132,252,0.45)]'
  }
};

interface LeagueTableProps {
  room: LeagueRoomInfo;
  cadets: LeagueCadetEntry[];
  currentUserIsAnonymous: boolean;
  currentUserId: string;
}

export const LeagueTable: React.FC<LeagueTableProps> = ({
  room,
  cadets,
  currentUserIsAnonymous,
  currentUserId,
}) => {
  const tierConfig = tierThemeConfig[room.tier];

  // Helper to render rank badge
  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-300 to-amber-600 text-black flex items-center justify-center font-black text-sm shadow-[0_0_15px_rgba(251,191,36,0.6)]">
          <Crown className="w-4 h-4 fill-black" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-200 to-slate-400 text-black flex items-center justify-center font-black text-sm shadow-[0_0_12px_rgba(203,213,225,0.4)]">
          2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center font-black text-sm shadow-[0_0_12px_rgba(180,83,9,0.4)]">
          3
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 flex items-center justify-center font-mono font-bold text-xs">
        {rank}
      </div>
    );
  };

  return (
    <div className={`w-full bg-[#080912]/95 border ${tierConfig.border} rounded-2xl p-4 sm:p-6 backdrop-blur-2xl ${tierConfig.glow} shadow-2xl relative overflow-hidden`}>
      {/* Background Ambience */}
      <div className="absolute -top-32 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-black tracking-widest uppercase border ${tierConfig.badgeBg} ${tierConfig.accent} ${tierConfig.border}`}>
              <Trophy className="w-3.5 h-3.5" /> {tierConfig.name}
            </span>
            <span className="text-xs font-mono text-zinc-500 px-2 py-0.5 rounded bg-white/5 border border-white/5">
              ROOM: {room.groupCode}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            COHORT LEAGUE MATCHMAKING
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            You are matched with 19 peers of equal skill. Sunday at midnight, Top 5 advance, Bottom 5 drop tiers.
          </p>
        </div>

        {/* Countdown Resolution Widget */}
        <div className="flex items-center gap-3 bg-zinc-900/90 border border-white/10 px-5 py-3 rounded-xl font-mono">
          <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">LEAGUE RESOLUTION</div>
            <div className="text-sm font-black text-white">Sunday 23:59 PM (48h left)</div>
          </div>
        </div>
      </div>

      {/* Zone Legend Indicator Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 text-xs font-mono font-bold relative z-10 border-b border-white/5">
        <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-500/30 px-3.5 py-2 rounded-lg text-emerald-400">
          <ArrowUp className="w-4 h-4" />
          <span>PROMOTION ZONE (Ranks 1 – 5)</span>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/40 border border-white/10 px-3.5 py-2 rounded-lg text-zinc-400">
          <Minus className="w-4 h-4" />
          <span>SAFE ZONE (Ranks 6 – 15)</span>
        </div>
        <div className="flex items-center gap-2 bg-rose-950/30 border border-rose-500/30 px-3.5 py-2 rounded-lg text-rose-400">
          <ArrowDown className="w-4 h-4" />
          <span>RELEGATION DANGER (Ranks 16 – 20)</span>
        </div>
      </div>

      {/* 20-Cadet Matchmaking League Table */}
      <div className="flex flex-col gap-2 pt-4 relative z-10">
        {cadets.map((cadet, index) => {
          const isCurrentUser = cadet.userId === currentUserId || cadet.isCurrentUser;
          const isPromotionZone = cadet.currentRank <= 5;
          const isRelegationZone = cadet.currentRank >= 16;
          const isSafeZone = !isPromotionZone && !isRelegationZone;

          // Compute rendered name & avatar considering incognito override for current user
          const displayName = isCurrentUser
            ? (currentUserIsAnonymous ? cadet.gamerTag : cadet.realName)
            : (cadet.isAnonymous ? cadet.gamerTag : cadet.realName);

          const displayAvatar = isCurrentUser
            ? (currentUserIsAnonymous ? cadet.anonymousAvatar : cadet.realAvatar)
            : (cadet.isAnonymous ? cadet.anonymousAvatar : cadet.realAvatar);

          const isIncognitoActive = isCurrentUser ? currentUserIsAnonymous : cadet.isAnonymous;

          return (
            <React.Fragment key={cadet.userId}>
              {/* Divider Banners separating the Zones */}
              {index === 0 && (
                <div className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-2 pt-1 pb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  TOP 5 ADVANCE TO NEXT LEAGUE TIER
                </div>
              )}
              {index === 5 && (
                <div className="text-[11px] font-mono font-bold text-zinc-500 flex items-center gap-2 pt-3 pb-1 border-t border-white/5">
                  <span>─── RETAIN CURRENT TIER (SAFE ZONE) ───</span>
                </div>
              )}
              {index === 15 && (
                <div className="text-[11px] font-mono font-bold text-rose-400 flex items-center gap-2 pt-3 pb-1 border-t border-white/5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  BOTTOM 5 DROP TO LOWER TIER NEXT WEEK
                </div>
              )}

              {/* Cadet Row Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all duration-200 relative overflow-hidden ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-cyan-950/60 via-[#101930] to-cyan-950/60 border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.35)] ring-1 ring-cyan-400'
                    : isPromotionZone
                    ? 'bg-emerald-950/15 border-emerald-500/25 hover:border-emerald-500/50 hover:bg-emerald-950/30'
                    : isRelegationZone
                    ? 'bg-rose-950/15 border-rose-500/25 hover:border-rose-500/50 hover:bg-rose-950/30'
                    : 'bg-zinc-900/50 border-white/5 hover:border-white/20 hover:bg-zinc-900/80'
                }`}
              >
                {/* Active Player Pulse Edge */}
                {isCurrentUser && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 via-emerald-400 to-cyan-400 animate-pulse" />
                )}

                {/* Left: Rank, Avatar & Nameplate */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    {renderRankBadge(cadet.currentRank)}
                  </div>

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div 
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xl border ${
                        isCurrentUser
                          ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                          : isIncognitoActive
                          ? 'border-purple-500/50 bg-purple-950/30 text-purple-300'
                          : 'border-white/10 bg-zinc-900 text-white'
                      }`}
                    >
                      {displayAvatar?.startsWith('http') || displayAvatar?.startsWith('/') ? (
                        <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        displayAvatar || '⚔️'
                      )}
                    </div>
                  </div>

                  {/* Cadet Name & Meta */}
                  <div className="min-w-0 flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm sm:text-base font-black truncate tracking-tight ${
                        isCurrentUser 
                          ? 'text-cyan-300 font-mono' 
                          : isIncognitoActive
                          ? 'text-purple-300 font-mono'
                          : 'text-white'
                      }`}>
                        {displayName}
                      </span>

                      {/* YOU pill for active user */}
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-black text-[9px] font-black font-mono tracking-wider">
                          YOU
                        </span>
                      )}

                      {/* Incognito badge */}
                      {isIncognitoActive && (
                        <span className="text-[10px] text-purple-400 font-mono px-1.5 py-0.5 rounded bg-purple-950/40 border border-purple-500/30">
                          🥷 MASKED
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono mt-0.5">
                      <span>{cadet.questionsSolved} Solved</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-500/90">
                        <Flame className="w-3 h-3 text-amber-400" /> {cadet.streakDays}d Streak
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Trend & Weekly XP */}
                <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                  {/* Trend Indicator */}
                  <div className="hidden sm:flex items-center font-mono text-xs">
                    {cadet.trend === 'UP' && (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <ArrowUp className="w-3.5 h-3.5" /> +2
                      </span>
                    )}
                    {cadet.trend === 'DOWN' && (
                      <span className="text-rose-400 flex items-center gap-0.5">
                        <ArrowDown className="w-3.5 h-3.5" /> -1
                      </span>
                    )}
                    {cadet.trend === 'SAME' && (
                      <span className="text-zinc-600 flex items-center">
                        <Minus className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {/* Weekly XP Pill */}
                  <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border text-right font-mono ${
                    isPromotionZone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : isRelegationZone
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-zinc-900 border-white/10 text-white'
                  }`}>
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">WEEKLY XP</div>
                    <div className="text-sm sm:text-base font-black flex items-center justify-end gap-1">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      {cadet.weeklyXP.toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
