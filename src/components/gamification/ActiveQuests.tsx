'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Gift, 
  Zap, 
  Flame, 
  Award 
} from 'lucide-react';
import { Quest } from '@/types/gamification';

interface ActiveQuestsProps {
  quests: Quest[];
  onClaimReward?: (questId: string) => void;
}

export const ActiveQuests: React.FC<ActiveQuestsProps> = ({ quests, onClaimReward }) => {
  const completedCount = quests.filter((q) => q.isCompleted).length;

  return (
    <div className="w-full bg-[#08080f]/90 border border-cyan-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase mb-2">
            <Target className="w-3.5 h-3.5" /> Ongoing Directives
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            ACTIVE MISSIONS & CAMPAIGNS
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Complete daily and weekly study targets to power your level progression and earn exclusive codex badges.
          </p>
        </div>

        {/* Missions Badge summary */}
        <div className="bg-zinc-900/80 border border-white/10 px-4 py-2.5 rounded-xl flex items-center gap-3 font-mono text-xs">
          <span className="text-zinc-400">STATUS:</span>
          <span className="font-bold text-white">
            <strong className="text-emerald-400">{completedCount}</strong> / {quests.length} Completed
          </span>
        </div>
      </div>

      {/* Quests Progress-Bar List */}
      <div className="flex flex-col gap-4 pt-6 relative z-10">
        {quests.map((quest) => {
          const progressPercent = Math.min(
            100,
            Math.round((quest.currentCount / Math.max(1, quest.targetCount)) * 100)
          );
          const isComplete = quest.currentCount >= quest.targetCount;

          return (
            <motion.div
              key={quest.id}
              whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              className={`rounded-xl p-5 border transition-all duration-300 relative overflow-hidden ${
                quest.isClaimed
                  ? 'bg-zinc-900/30 border-white/5 opacity-60'
                  : isComplete
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : 'bg-zinc-900/60 border-white/10 hover:border-cyan-500/40'
              }`}
            >
              {/* Quest Header Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-10 h-10 rounded-lg flex items-center justify-center border font-black ${
                      isComplete 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    }`}
                  >
                    {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
                        {quest.questType}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-cyan-400">
                        {quest.category}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-white tracking-tight mt-0.5">
                      {quest.title}
                    </h3>
                  </div>
                </div>

                {/* Right Rewards & Timer */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  {quest.expiresAt && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500">
                      <Clock className="w-3 h-3" />
                      <span>{quest.expiresAt}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-black">
                    <Sparkles className="w-3.5 h-3.5" />
                    +{quest.xpReward} XP
                  </div>

                  {quest.rewardBadge && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
                      <Award className="w-3.5 h-3.5" />
                      Badge Unlock
                    </div>
                  )}
                </div>
              </div>

              {/* Quest Lore / Description */}
              <p className="text-xs text-zinc-400 mb-4 max-w-2xl leading-relaxed">
                {quest.description}
              </p>

              {/* Progress Bar Container */}
              <div className="w-full">
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-zinc-400">
                    Progress: <strong className="text-white">{quest.currentCount}</strong> / {quest.targetCount} {quest.unitLabel}
                  </span>
                  <span className={`font-black ${isComplete ? 'text-emerald-400' : 'text-cyan-400'}`}>
                    {progressPercent}%
                  </span>
                </div>

                <div className="w-full h-2.5 bg-zinc-950 rounded-full border border-white/5 overflow-hidden p-0.5 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full transition-all relative overflow-hidden ${
                      isComplete
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                    }`}
                  >
                    {/* Animated Shimmer Ray */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  </motion.div>
                </div>
              </div>

              {/* Claim Action for completed quests */}
              {isComplete && !quest.isClaimed && (
                <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Directive Objective Satisfied!
                  </span>
                  <button
                    onClick={() => onClaimReward && onClaimReward(quest.id)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs font-mono tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)] cursor-pointer flex items-center gap-1.5"
                  >
                    <Gift className="w-3.5 h-3.5" /> Claim Reward
                  </button>
                </div>
              )}

              {quest.isClaimed && (
                <div className="mt-3 text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" /> Reward Claimed & Logged to Ledger
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
