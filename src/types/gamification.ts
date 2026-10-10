// ==============================================================================
// TYPES: INCLUSIVE GAMIFICATION SYSTEM (NEXT.JS + TYPESCRIPT)
// ==============================================================================

export type BadgeCategory = 'IMPROVEMENT' | 'CONSISTENCY' | 'MASTERY' | 'COMMUNITY' | 'FUN';

export type RarityTier = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';

export type CriteriaType = 
  | 'TEST_IMPROVEMENT_PERCENT'
  | 'STREAK_DAYS'
  | 'QUESTIONS_SOLVED'
  | 'PEER_HELP_COUNT'
  | 'ATTENDANCE_COUNT'
  | 'SPEED_ACCURACY'
  | 'SPECIAL_EVENT';

export type QuestType = 'DAILY' | 'WEEKLY' | 'MILESTONE' | 'SPECIAL';

export interface Badge {
  id: string;
  slug: string;
  title: string;
  description: string;
  unlockInstruction: string;
  category: BadgeCategory;
  rarity: RarityTier;
  iconName: string; // Lucide React icon name
  badgeColorHex: string;
  xpReward: number;
  criteriaType: CriteriaType;
  criteriaThreshold: number;
  criteriaMetadata?: Record<string, any>;
  isSecret?: boolean;
}

export interface StudentBadgeProgress {
  badge: Badge;
  isUnlocked: boolean;
  unlockedAt?: string | null;
  currentValue: number;
  targetValue: number;
  progressPercent: number;
}

export interface Quest {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: BadgeCategory;
  questType: QuestType;
  targetCount: number;
  currentCount: number;
  unitLabel: string;
  xpReward: number;
  rewardBadge?: Badge | null;
  isCompleted: boolean;
  isClaimed: boolean;
  expiresAt?: string | null;
}

export interface BadgeUnlockEvent {
  badge: Badge;
  awardedXP: number;
  unlockedAt: string;
  contextNote?: string;
}
