'use client';

import React, { useState } from 'react';
import { Trophy, Shield, Info, ArrowUp, ArrowDown } from 'lucide-react';
import { LeagueTable } from './LeagueTable';
import { AnonymousToggle } from './AnonymousToggle';
import { LeagueCadetEntry, LeagueRoomInfo, LeagueTier } from '@/types/league';

// ==============================================================================
// HIGH-QUALITY MOCK DATA: EXACTLY 20 CADETS FOR ROOM "GOLD-ROOM-042"
// (Top 5 Promotion, Middle 10 Safe, Bottom 5 Relegation)
// ==============================================================================
const INITIAL_CADETS_20: LeagueCadetEntry[] = [
  // --- PROMOTION ZONE (RANKS 1 - 5) ---
  {
    userId: 'cadet-01',
    currentRank: 1,
    realName: 'Aarav Sharma',
    gamerTag: 'Algo_Phantom_99',
    realAvatar: '👑',
    anonymousAvatar: '🥷',
    weeklyXP: 1420,
    questionsSolved: 48,
    streakDays: 14,
    timeSpentMins: 460,
    isAnonymous: false,
    isCurrentUser: false,
    zone: 'PROMOTION',
    trend: 'UP',
  },
  {
    userId: 'cadet-02',
    currentRank: 2,
    realName: 'Priya Patel',
    gamerTag: 'Zero_Day_Samurai',
    realAvatar: '⚔️',
    anonymousAvatar: '🎭',
    weeklyXP: 1280,
    questionsSolved: 42,
    streakDays: 12,
    timeSpentMins: 410,
    isAnonymous: true,
    isCurrentUser: false,
    zone: 'PROMOTION',
    trend: 'SAME',
  },
  {
    userId: 'cadet-03',
    currentRank: 3,
    realName: 'Dev Mehta',
    gamerTag: 'Byte_Valkyrie',
    realAvatar: '⚡',
    anonymousAvatar: '🦾',
    weeklyXP: 1150,
    questionsSolved: 39,
    streakDays: 9,
    timeSpentMins: 380,
    isAnonymous: false,
    isCurrentUser: false,
    zone: 'PROMOTION',
    trend: 'UP',
  },
  {
    // LOGGED IN USER IN PROMOTION ZONE (RANK 4)
    userId: 'current-user-cadet',
    currentRank: 4,
    realName: 'Utkarsh Raj',
    gamerTag: 'Ninja_Coder_007',
    realAvatar: '🔥',
    anonymousAvatar: '🥷',
    weeklyXP: 1040,
    questionsSolved: 35,
    streakDays: 8,
    timeSpentMins: 350,
    isAnonymous: false,
    isCurrentUser: true,
    zone: 'PROMOTION',
    trend: 'UP',
  },
  {
    userId: 'cadet-05',
    currentRank: 5,
    realName: 'Ananya Roy',
    gamerTag: 'Cyber_Kitsune',
    realAvatar: '🦊',
    anonymousAvatar: '🤖',
    weeklyXP: 990,
    questionsSolved: 32,
    streakDays: 7,
    timeSpentMins: 320,
    isAnonymous: true,
    isCurrentUser: false,
    zone: 'PROMOTION',
    trend: 'DOWN',
  },

  // --- SAFE ZONE (RANKS 6 - 15) ---
  {
    userId: 'cadet-06',
    currentRank: 6,
    realName: 'Rohan Verma',
    gamerTag: 'Stack_Overlord',
    realAvatar: '🛡️',
    anonymousAvatar: '🕶️',
    weeklyXP: 870,
    questionsSolved: 28,
    streakDays: 6,
    timeSpentMins: 290,
    isAnonymous: false,
    isCurrentUser: false,
    zone: 'SAFE',
    trend: 'SAME',
  },
  {
    userId: 'cadet-07',
    currentRank: 7,
    realName: 'Tanvi Iyer',
    gamerTag: 'Binary_Monk',
    realAvatar: '🌸',
    anonymousAvatar: '🧙',
    weeklyXP: 820,
    questionsSolved: 26,
    streakDays: 5,
    timeSpentMins: 270,
    isAnonymous: true,
    isCurrentUser: false,
    zone: 'SAFE',
    trend: 'UP',
  },
  {
    userId: 'cadet-08',
    currentRank: 8,
    realName: 'Kabir Das',
    gamerTag: 'Kernel_Panic_X',
    realAvatar: '🐺',
    anonymousAvatar: '💀',
    weeklyXP: 780,
    questionsSolved: 25,
    streakDays: 5,
    timeSpentMins: 250,
    isAnonymous: false,
    isCurrentUser: false,
    zone: 'SAFE',
    trend: 'DOWN',
  },
  {
    userId: 'cadet-09',
    currentRank: 9,
    realName: 'Simran Kaur',
    gamerTag: 'Matrix_Lotus',
    realAvatar: '🌺',
    anonymousAvatar: '👻',
    weeklyXP: 740,
    questionsSolved: 23,
    streakDays: 4,
    timeSpentMins: 230,
    isAnonymous: false,
    isCurrentUser: false,
    zone: 'SAFE',
    trend: 'SAME',
  },
  {
    userId: 'cadet-10',
    currentRank: 10,
    realName: 'Aditya Nair',
    gamerTag: 'Null_Pointer_Sage',
    realAvatar: '🏹',
    anonymousAvatar: '👽',
    weeklyXP: 690,
    questionsSolved: 21,
    streakDays: 4,
    timeSpentMins: 210,
    isAnonymous: true,
    isCurrentUser: false,
    zone: 'SAFE',
    trend: 'UP',
  },
  {
    userId: 'cadet-11',
    currentRank: 11,
    realName: 'Meera Sen',
    gamerTag: 'Quantum_Leap',
    realAvatar: '🪐',
    anonymousAvatar: '🤖',
    weeklyXP: 650,
    questionsSolved: 20,
    streakDays: 3,
    timeSpentMins: 195,
    isAnonymous: false,
    isCurrentUser: false,
    zone: 'SAFE',
    trend: 'DOWN',
  },
  {
    userId: 'cadet-12',
    currentRank: 12,
    realName: 'Varun Joshi',
    gamerTag: 'Heap_Hero',
    realAvatar: '💎',
    anonymousAvatar: '🥷',
    weeklyXP: 610,
    questionsSolved: 18,
    streakDays: 3,
    timeSpentMins: 180,
    isAnonymous: false,
    isCurrentUser: false,
    zone: 'SAFE',
    trend: 'SAME',
  },
  {
    userId: 'cadet-13',
    currentRank: 13,
    realName: 'Kavya Bhat',
    gamerTag: 'Glitch_Artist',
    realAvatar: '🎨',
    anonymousAvatar: '👾',
    weeklyXP: 570,
    questionsSolved: 17,
    streakDays: 2,
    timeSpentMins: 165,
    isAnonymous: true,
    isCurrentUser: false,
    zone: 'SAFE',
    trend: 'SAME',
  },
  {
    userId: 'cadet-14',
    currentRank: 14,
    realName: 'Arjun Reddy',
    gamerTag: 'Recursion_Rogue',
    realAvatar: '🗡️',
    anonymousAvatar: '🦇',
    weeklyXP: 530,
    questionsSolved: 16,
    streakDays: 2,
    timeSpentMins: 150,
    isAnonymous: false,
    isCurrentUser: false,
    zone: 'SAFE',
    trend: 'DOWN',
  },
  {
    userId: 'cadet-15',
    currentRank: 15,
    realName: 'Sneha Rao',
    gamerTag: 'Bitwise_Baroness',
    realAvatar: '🌟',
    anonymousAvatar: '🦉',
    weeklyXP: 490,
    questionsSolved: 14,
    streakDays: 2,
    timeSpentMins: 135,
    isAnonymous: false,
    isCurrentUser: false,
    zone: 'SAFE',
    trend: 'UP',
  },

  // --- RELEGATION DANGER ZONE (RANKS 16 - 20) ---
  {
    userId: 'cadet-16',
    currentRank: 16,
    realName: 'Nikhil Kulkarni',
    gamerTag: 'Thread_Racer',
    realAvatar: '🏎️',
    anonymousAvatar: '🧟',
    weeklyXP: 380,
    questionsSolved: 11,
    streakDays: 1,
    timeSpentMins: 110,
    isAnonymous: true,
    isCurrentUser: false,
    zone: 'RELEGATION',
    trend: 'DOWN',
  },
  {
    userId: 'cadet-17',
    currentRank: 17,
    realName: 'Deepa Menon',
    gamerTag: 'Syntax_Specter',
    realAvatar: '🌙',
    anonymousAvatar: '🌫️',
    weeklyXP: 320,
    questionsSolved: 9,
    streakDays: 1,
    timeSpentMins: 90,
    isAnonymous: false,
    isCurrentUser: false,
    zone: 'RELEGATION',
    trend: 'DOWN',
  },
  {
    userId: 'cadet-18',
    currentRank: 18,
    realName: 'Harsh Vardhan',
    gamerTag: 'Overflow_Knight',
    realAvatar: '🛡️',
    anonymousAvatar: '👹',
    weeklyXP: 260,
    questionsSolved: 7,
    streakDays: 1,
    timeSpentMins: 75,
    isAnonymous: false,
    isCurrentUser: false,
    zone: 'RELEGATION',
    trend: 'SAME',
  },
  {
    userId: 'cadet-19',
    currentRank: 19,
    realName: 'Zara Khan',
    gamerTag: 'Bug_Hunter_99',
    realAvatar: '🦋',
    anonymousAvatar: '🕷️',
    weeklyXP: 190,
    questionsSolved: 5,
    streakDays: 1,
    timeSpentMins: 55,
    isAnonymous: true,
    isCurrentUser: false,
    zone: 'RELEGATION',
    trend: 'DOWN',
  },
  {
    userId: 'cadet-20',
    currentRank: 20,
    realName: 'Yash Gupta',
    gamerTag: 'Zero_Pointer',
    realAvatar: '🎯',
    anonymousAvatar: '🥷',
    weeklyXP: 110,
    questionsSolved: 3,
    streakDays: 0,
    timeSpentMins: 35,
    isAnonymous: false,
    isCurrentUser: false,
    zone: 'RELEGATION',
    trend: 'SAME',
  },
];

export const WeeklyLeaguesModule: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<LeagueTier>('GOLD');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [cadets] = useState<LeagueCadetEntry[]>(INITIAL_CADETS_20);

  const roomInfo: LeagueRoomInfo = {
    id: 'room-gold-42',
    groupCode: `${selectedTier}-ROOM-042`,
    tier: selectedTier,
    weekNumber: 41,
    endsAt: 'Sunday 23:59:59 PM',
    totalCadets: 20,
  };

  const currentCadet = cadets.find((c) => c.isCurrentUser) || cadets[3];

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 flex flex-col gap-6">
      {/* Tier Switcher Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/60 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'] as LeagueTier[]).map((tier) => {
            const isActive = selectedTier === tier;
            return (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-black tracking-widest uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                {tier}
              </button>
            );
          })}
        </div>

        {/* Info Tip */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Micro-matchmaking: Exactly 20 students per room</span>
        </div>
      </div>

      {/* 1. Anonymous Settings Card ("Play Incognito") */}
      <AnonymousToggle
        isAnonymous={isAnonymous}
        realName={currentCadet.realName}
        gamerTag={currentCadet.gamerTag}
        realAvatar={currentCadet.realAvatar}
        anonymousAvatar={currentCadet.anonymousAvatar}
        onToggle={(state) => setIsAnonymous(state)}
      />

      {/* 2. Visual League Leaderboard with 20 Cadets & Zones */}
      <LeagueTable
        room={roomInfo}
        cadets={cadets}
        currentUserIsAnonymous={isAnonymous}
        currentUserId={currentCadet.userId}
      />
    </div>
  );
};
