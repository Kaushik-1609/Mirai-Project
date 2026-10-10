// ==============================================================================
// TYPES: MATCHMAKING LEAGUES & INCOGNITO SYSTEM
// ==============================================================================

export type LeagueTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

export type MovementZone = 'PROMOTION' | 'SAFE' | 'RELEGATION';

export interface LeagueCadetEntry {
  userId: string;
  currentRank: number;
  realName: string;
  gamerTag: string;
  realAvatar: string;
  anonymousAvatar: string;
  weeklyXP: number;
  questionsSolved: number;
  streakDays: number;
  timeSpentMins: number;
  isAnonymous: boolean;
  isCurrentUser: boolean;
  zone: MovementZone;
  trend: 'UP' | 'DOWN' | 'SAME';
}

export interface LeagueRoomInfo {
  id: string;
  groupCode: string; // e.g. "GOLD-ROOM-042"
  tier: LeagueTier;
  weekNumber: number;
  endsAt: string; // ISO string e.g. Sunday 23:59:59 PM
  totalCadets: number; // Exactly 20
}
