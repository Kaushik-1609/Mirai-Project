'use client';

import React, { useState } from 'react';
import { Target, Award, Sparkles } from 'lucide-react';
import { BadgeGallery } from './BadgeGallery';
import { ActiveQuests } from './ActiveQuests';
import { BadgeUnlockModal } from './BadgeUnlockModal';
import { BadgeUnlockEvent, Quest, StudentBadgeProgress } from '@/types/gamification';

// ==============================================================================
// INITIAL MOCK DATA TEMPLATE
// NOTE: Awaiting user's EXACT 20 badges list for full catalog seeding!
// ==============================================================================
const INITIAL_BADGES_DATA: StudentBadgeProgress[] = [
  {
    badge: {
      id: 'badge-01',
      slug: 'comeback-kid',
      title: 'The Comeback Kid',
      description: 'Achieved a +15% score improvement on consecutive topic tests.',
      unlockInstruction: 'Improve your score on any curriculum test by at least +15% compared to your previous attempt.',
      category: 'IMPROVEMENT',
      rarity: 'RARE',
      iconName: 'TrendingUp',
      badgeColorHex: '#00f0ff',
      xpReward: 100,
      criteriaType: 'TEST_IMPROVEMENT_PERCENT',
      criteriaThreshold: 15,
    },
    isUnlocked: true,
    unlockedAt: '2026-10-08',
    currentValue: 18,
    targetValue: 15,
    progressPercent: 100,
  },
  {
    badge: {
      id: 'badge-02',
      slug: 'iron-will',
      title: 'Iron Will',
      description: 'Maintained an unbroken active learning streak for 7 consecutive days.',
      unlockInstruction: 'Check in, solve problems, or attend classes for 7 days in a row without letting your streak break.',
      category: 'CONSISTENCY',
      rarity: 'EPIC',
      iconName: 'Flame',
      badgeColorHex: '#ff6a00',
      xpReward: 150,
      criteriaType: 'STREAK_DAYS',
      criteriaThreshold: 7,
    },
    isUnlocked: true,
    unlockedAt: '2026-10-09',
    currentValue: 7,
    targetValue: 7,
    progressPercent: 100,
  },
  {
    badge: {
      id: 'badge-03',
      slug: 'the-good-samaritan',
      title: 'The Good Samaritan',
      description: 'Provided accepted peer solutions helping struggling classmates.',
      unlockInstruction: 'Help at least 3 peers in the community forum or peer coding arena with accepted code solutions.',
      category: 'COMMUNITY',
      rarity: 'RARE',
      iconName: 'Users',
      badgeColorHex: '#10b981',
      xpReward: 120,
      criteriaType: 'PEER_HELP_COUNT',
      criteriaThreshold: 3,
    },
    isUnlocked: false,
    currentValue: 2,
    targetValue: 3,
    progressPercent: 66,
  },
  {
    badge: {
      id: 'badge-04',
      slug: 'phoenix-rising',
      title: 'Phoenix Rising',
      description: 'Scored 90%+ on a test after previously scoring under 50%.',
      unlockInstruction: 'Turn a topic struggle into pure mastery by achieving an A-tier score on a retake test.',
      category: 'IMPROVEMENT',
      rarity: 'LEGENDARY',
      iconName: 'Sparkles',
      badgeColorHex: '#ffd700',
      xpReward: 250,
      criteriaType: 'TEST_IMPROVEMENT_PERCENT',
      criteriaThreshold: 40,
    },
    isUnlocked: false,
    currentValue: 1,
    targetValue: 1,
    progressPercent: 0,
  },
];

const INITIAL_QUESTS: Quest[] = [
  {
    id: 'quest-01',
    slug: 'recursion-mastery',
    title: 'Tower of Recursion: Base Case Mastery',
    description: 'Solve 10 recursion problems to demystify call stacks and divide-and-conquer logic.',
    category: 'MASTERY',
    questType: 'WEEKLY',
    targetCount: 10,
    currentCount: 7,
    unitLabel: 'Recursion problems solved',
    xpReward: 120,
    isCompleted: false,
    isClaimed: false,
    expiresAt: 'Sunday 23:59 PM',
  },
  {
    id: 'quest-02',
    slug: 'attendance-dedication',
    title: 'Daily Activeness & Presence',
    description: 'Check in your daily platform attendance 5 times this week to protect your learning streak.',
    category: 'CONSISTENCY',
    questType: 'DAILY',
    targetCount: 5,
    currentCount: 5,
    unitLabel: 'Daily check-ins',
    xpReward: 80,
    isCompleted: true,
    isClaimed: false,
    expiresAt: 'Tomorrow 00:00 AM',
  },
  {
    id: 'quest-03',
    slug: 'peer-code-review',
    title: 'Code Inspector: Help a Classmate',
    description: 'Review and suggest an optimization on a peer’s Weekend Lab pull request.',
    category: 'COMMUNITY',
    questType: 'WEEKLY',
    targetCount: 1,
    currentCount: 0,
    unitLabel: 'Peer reviews',
    xpReward: 60,
    isCompleted: false,
    isClaimed: false,
    expiresAt: 'In 3 Days',
  },
];

export const QuestsAndBadgesModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BADGES' | 'QUESTS'>('BADGES');
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [badges] = useState<StudentBadgeProgress[]>(INITIAL_BADGES_DATA);
  const [unlockEvent, setUnlockEvent] = useState<BadgeUnlockEvent | null>(null);

  // Trigger claim quest reward
  const handleClaimQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          return { ...q, isClaimed: true };
        }
        return q;
      })
    );
  };

  // Demo trigger to preview Framer Motion unlock celebration
  const handleTestUnlock = () => {
    setUnlockEvent({
      badge: {
        id: 'badge-test',
        slug: 'phoenix-rising',
        title: 'Phoenix Rising',
        description: 'Scored 90%+ on a test after previously scoring under 50%. A true triumph of persistence!',
        unlockInstruction: 'Improve from bottom quartile to top tier in topic verification.',
        category: 'IMPROVEMENT',
        rarity: 'LEGENDARY',
        iconName: 'Sparkles',
        badgeColorHex: '#ffd700',
        xpReward: 250,
        criteriaType: 'TEST_IMPROVEMENT_PERCENT',
        criteriaThreshold: 40,
      },
      awardedXP: 250,
      unlockedAt: new Date().toISOString(),
      contextNote: 'Score jumped from 48% to 94% on Trees & Graphs Test',
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 flex flex-col gap-6">
      {/* Module Navigation Tabs & Demo Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/60 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('BADGES')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all cursor-pointer ${
              activeTab === 'BADGES'
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Award className="w-4 h-4" /> BADGE VAULT
          </button>
          <button
            onClick={() => setActiveTab('QUESTS')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all cursor-pointer ${
              activeTab === 'QUESTS'
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="w-4 h-4" /> ACTIVE DIRECTIVES & QUESTS
          </button>
        </div>

        {/* Demo Unlock trigger button */}
        <button
          onClick={handleTestUnlock}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/15 border border-purple-500/40 text-purple-300 hover:bg-purple-500/25 text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" /> TEST UNLOCK CELEBRATION
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'BADGES' ? (
        <BadgeGallery badges={badges} />
      ) : (
        <ActiveQuests quests={quests} onClaimReward={handleClaimQuest} />
      )}

      {/* Unlock Celebration Screen Overlay */}
      <BadgeUnlockModal
        unlockEvent={unlockEvent}
        onClose={() => setUnlockEvent(null)}
      />
    </div>
  );
};
