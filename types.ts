export const APP_VERSION = '0.61';

export interface Participant {
  id: number | string;
  name: string;
  color: string;
  createdAt: number;
  warriorRank?: number; // 0-12
  martialNotes?: string;
  artsNotes?: string;
  martialRecommendations?: string[];
  artsRecommendations?: string[];
}

export type PlayerRole = 'fighter' | 'reeve' | 'artisan' | 'judge';

export interface Player {
  id: string;
  name: string;
  roles: PlayerRole[];
  warriorRank: number;
  recentPerformance: string;
  color: string;
  createdAt: number;
}

export interface Team {
  id: string; // "A", "B", "C"...
  name: string;
  fighterIds: number[];
  color: string;
}

export interface Judge {
  id: number;
  name: string;
}

export interface Reeve {
  id: number;
  name: string;
}

export interface ParticipantStats {
  participantId: number | string;
  wins: number;
  currentStreak: number;
  maxStreak: number;
}

export interface Match {
  id: string;
  roundIndex: number;
  matchIndex: number;
  participant1Id: number | string | null;
  participant2Id: number | string | null;
  participant1Wins: number;
  participant2Wins: number;
  winnerId: number | string | null;
  nextMatchId: string | null;
  loserNextMatchId?: string | null;
  loserNextMatchSlot?: 1 | 2;
  bracketType: 'primary' | 'secondary' | 'final' | 'third-place' | 'round-robin' | 'swiss' | 'arts-listing';
  // A&S Specific fields
  title?: string;
  division?: 'owl' | 'garber' | 'dragon' | 'smith';
  subcategory?: string;
  judgeScores?: Record<number, number>; // JudgeID to Score
  judgePasses?: Record<number, boolean>; // JudgeID to Pass Status
  judgeNotes?: Record<number, string>; // JudgeID to Feedback Note
}

export interface TournamentConfig {
  eventType: 'martial' | 'arts';
  type: 'single-elimination' | 'double-elimination' | 'ironman' | 'round-robin' | 'swiss' | 'listing';
  winMode: 'rounds' | 'points';
  requiredWins: number;
  duration?: number;
  swissRounds?: number;
  swissTiebreak?: 'round-points' | 'buchholz';
  includeThirdPlaceMatch?: boolean;
  isSeeded?: boolean;
  weaponClass?: string;
  isPoolsToBracket?: boolean;
  poolType?: 'round-robin' | 'ironman';
  autoProgressionWins?: number;
  autoProgressionStreak?: number;
  finalistCount?: number;
  scoringCondition?: 'full' | 'drop-lowest' | 'drop-highest' | 'outliers' | 'count-zeros';
  selectedJudgeIds?: number[];
  selectedReeveIds?: number[];
  selectedFighterIds?: number[];
  isAnonymous?: boolean;
  isPartialRounds?: boolean;
  maxRounds?: number;
  enabledSubcategories?: string[];
  isTeams?: boolean;
  teams?: Team[];
}

export interface LocalTournamentConfig extends Omit<TournamentConfig, 'selectedFighterIds' | 'selectedJudgeIds' | 'selectedReeveIds'> {
  id: string;
  name: string;
  selectedFighterIds: number[];
  selectedJudgeIds: number[];
  selectedReeveIds: number[];
  isExpanded: boolean;
  winConditionIdx: number;
  durationIdx: number;
  customDuration: number;
}

export interface Tournament {
  id: string;
  name: string;
  date: string;
  participants: Participant[];
  rounds: Match[][]; 
  loserRounds: Match[][]; 
  grandFinal: Match | null; 
  grandFinalReset: Match | null; 
  thirdPlaceMatch: Match | null;
  status: 'draft' | 'preparation' | 'active' | 'completed';
  stage?: 'pools' | 'bracket';
  config: TournamentConfig;
  ironmanStats?: Record<number | string, ParticipantStats>;
  ironmanRings?: (number | string | null)[];
  progressedIds?: (number | string)[];
  lastWinnerId?: number | string | null;
  needsRegeneration?: boolean;
  currentSwissRound?: number;
  notes?: string;
}

export interface AppState {
  eventName: string;
  eventDate: string;
  kingdom: string;
  parkTitle: string;
  parkName: string;
  participants: Participant[];
  judges: Judge[];
  reeves: Reeve[];
  masterPlayers: Player[];
  tournaments: Tournament[];
  activeTournamentId: string | null;
  nextParticipantId: number;
  nextJudgeId: number;
  nextReeveId: number;
  isDarkMode: boolean;
  pendingTournaments: LocalTournamentConfig[];
}