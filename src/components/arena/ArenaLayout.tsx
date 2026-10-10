'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Swords, 
  Shield, 
  Flame, 
  Sparkles, 
  Zap, 
  Clock, 
  Home, 
  BookOpen, 
  Target, 
  User, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Award
} from 'lucide-react';
import { WeeklyLeaguesModule } from '@/components/league/WeeklyLeaguesModule';
import { LeagueRoomInfo, LeagueTier } from '@/types/league';

// ==============================================================================
// MOBILE-FIRST ARENA (COMPETE) LAYOUT COMPONENT
// Features:
// - Top Mobile Bar with Live Tier & Countdown
// - Dedicated Arena / Compete Section hosting Weekly Leagues & 20-Cadet Board
// - Pinned / Glowing Active Bottom Navigation Bar with "Arena" Highlighted
// ==============================================================================

interface ArenaLayoutProps {
  currentTier?: LeagueTier;
  initialAnonymous?: boolean;
}

export const ArenaLayout: React.FC<ArenaLayoutProps> = ({
  currentTier = 'GOLD',
  initialAnonymous = false,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'learn' | 'arena' | 'quests' | 'profile'>('arena');

  const roomInfo: LeagueRoomInfo = {
    id: 'room-gold-42',
    groupCode: 'GOLD-MICRO-042',
    tier: currentTier,
    weekNumber: 6,
    endsAt: 'Sunday 23:59:59 PM',
    totalCadets: 20
  };

  return (
    <div className="min-h-screen bg-[#070811] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black pb-28 sm:pb-24">
      {/* 1. Mobile-First Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#090b17]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Brand & Arena Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              <Swords className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-black tracking-widest text-amber-400 uppercase">
                  THE ARENA
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                WEEKLY LEAGUES
              </h1>
            </div>
          </div>

          {/* League Room & Time Capsule */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="hidden xs:flex items-center gap-1.5 bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-lg text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold">2d 14h left</span>
            </div>
            <div className="bg-amber-400/10 border border-amber-400/30 text-amber-300 font-bold px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentTier}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Arena Scroll Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 pt-5 pb-8">
        {/* Arena Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-zinc-950 border border-amber-500/20 p-5 sm:p-6 mb-6 shadow-2xl">
          {/* Subtle Halos */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  DUOLINGO-STYLE MICRO GROUPS
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  ROOM #{roomInfo.groupCode}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Compete Among 20 Equal Peers
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl leading-relaxed">
                No impossible global top 10. You are grouped with exactly 20 students of matching XP. 
                Top 5 promote, bottom 5 relegate every Sunday at midnight.
              </p>
            </div>

            {/* Quick Mechanics Stats */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-2.5 rounded-xl text-center">
                <div className="text-[10px] font-mono font-bold text-emerald-400">PROMOTION</div>
                <div className="text-base sm:text-lg font-black text-white">TOP 5</div>
              </div>
              <div className="bg-zinc-900/60 border border-white/10 px-3.5 py-2.5 rounded-xl text-center">
                <div className="text-[10px] font-mono font-bold text-zinc-400">SAFE ZONE</div>
                <div className="text-base sm:text-lg font-black text-white">MID 10</div>
              </div>
              <div className="bg-rose-950/40 border border-rose-500/30 px-3.5 py-2.5 rounded-xl text-center">
                <div className="text-[10px] font-mono font-bold text-rose-400">DANGER</div>
                <div className="text-base sm:text-lg font-black text-white">BOT 5</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. The Core Weekly Leagues & 20-Cadet Matchmaking Module */}
        <WeeklyLeaguesModule initialRoom={roomInfo} />
      </main>

      {/* 4. Mobile Bottom Navigation Bar (Fixed with "Arena" Highlighted) */}
      <nav 
        aria-label="Mobile Main Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#090b17]/95 backdrop-blur-2xl border-t border-white/10 py-2 px-3 sm:px-6 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* Tab 1: Home */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              activeTab === 'home' ? 'text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Home</span>
          </button>

          {/* Tab 2: Learn */}
          <button
            type="button"
            onClick={() => setActiveTab('learn')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              activeTab === 'learn' ? 'text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Learn</span>
          </button>

          {/* Tab 3: ARENA (ACTIVE COMPETE TAB) */}
          <button
            type="button"
            onClick={() => setActiveTab('arena')}
            className="flex flex-col items-center justify-center flex-1 py-1 relative group cursor-pointer"
          >
            {/* Glowing Neon Background Pill */}
            <div className="absolute -top-3 w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.6)] transform group-hover:scale-105 transition-all">
              <Swords className="w-6 h-6 text-black fill-black" />
            </div>
            <div className="h-6" /> {/* Spacer for elevated button */}
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400 flex items-center gap-1 mt-1">
              Arena
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
            </span>
          </button>

          {/* Tab 4: Quests */}
          <button
            type="button"
            onClick={() => setActiveTab('quests')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              activeTab === 'quests' ? 'text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Target className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Quests</span>
          </button>

          {/* Tab 5: Profile */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              activeTab === 'profile' ? 'text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
