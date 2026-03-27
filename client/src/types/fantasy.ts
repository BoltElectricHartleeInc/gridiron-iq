export type FantasyPosition = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';

export interface FantasyPlayer {
  id: string; // Sleeper player_id
  name: string;
  position: FantasyPosition;
  team: string; // NFL team abbreviation
  age: number;
  yearsExp: number;
  salary: number; // DFS salary
  projectedPoints: number;
  avgPoints: number; // season average
  rank: number; // overall fantasy rank
}

export type RosterSlotType = 'QB' | 'RB' | 'WR' | 'TE' | 'FLEX' | 'DEF' | 'K' | 'BN';

export interface FantasyRosterSlot {
  type: RosterSlotType;
  playerId: string | null;
}

export interface FantasyTeam {
  id: string;
  name: string;
  ownerName: string;
  isUser: boolean;
  isHuman: boolean; // for multiplayer
  roster: string[]; // player ids
  lineup: FantasyRosterSlot[];
  record: { wins: number; losses: number; ties: number };
  totalPoints: number;
  weeklyPoints: number[]; // 17 weeks
}

export interface FantasyMatchup {
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status: 'upcoming' | 'live' | 'final';
}

export interface LeagueSettings {
  teamCount: 8 | 10 | 12;
  scoringType: 'ppr' | 'half-ppr' | 'standard';
  draftType: 'snake';
  playoffWeeks: 3;
  rosterSize: 17; // 10 starters + 7 bench
}

export interface FantasyLeague {
  id: string;
  name: string;
  inviteCode: string; // 6-char
  type: 'season';
  season: number;
  settings: LeagueSettings;
  teams: FantasyTeam[];
  matchups: FantasyMatchup[];
  currentWeek: number;
  draftStatus: 'pending' | 'drafting' | 'complete';
  draftOrder: string[]; // team ids in draft order
  currentDraftPick: number;
  draftedPlayerIds: string[];
}

export type DFSSlotType = 'QB' | 'RB1' | 'RB2' | 'WR1' | 'WR2' | 'WR3' | 'TE' | 'FLEX' | 'DST';

export interface DFSLineupSlot {
  slot: DFSSlotType;
  playerId: string | null;
  points: number;
}

export interface DFSContest {
  id: string;
  name: string;
  week: number;
  salaryCap: 50000;
  lineup: DFSLineupSlot[];
  totalSalary: number;
  projectedPoints: number;
  lockedIn: boolean;
  score: number;
}
