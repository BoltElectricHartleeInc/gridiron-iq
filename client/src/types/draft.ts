export type LeagueMode = 'nfl' | 'ncaa';

export interface NFLTeam {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  conference: 'AFC' | 'NFC';
  division: 'North' | 'South' | 'East' | 'West';
  primaryColor: string;
  secondaryColor: string;
  needs: Position[];
  draftStyle: DraftStyle;
  picks: number[]; // pick numbers owned
  pick1: number; // first-round pick number in 2025 draft order
}

export type Position =
  | 'QB' | 'RB' | 'WR' | 'TE' | 'OT' | 'OG' | 'C'
  | 'EDGE' | 'DE' | 'DT' | 'LB' | 'OLB' | 'CB' | 'S' | 'K' | 'P';

export type DraftStyle =
  | 'bpa'          // best player available
  | 'need'         // fills roster needs
  | 'trade-up'     // aggressive, trades up for elite talent
  | 'trade-down'   // stockpiles picks
  | 'qb-hunter';   // desperate for QB

export interface Prospect {
  id: string;
  name: string;
  position: Position;
  college: string;
  height: string; // e.g. "6'4\""
  weight: number; // lbs
  fortyTime?: number; // 40-yard dash in seconds
  grade: number;  // 0-100 overall grade
  round: number;  // projected round (1-7)
  traits: string[];
  description: string;
  strengths: string[];
  weaknesses: string[];
  comparableTo?: string; // NFL comp
  year?: number; // draft class year
  draftStockTrend?: 'rising' | 'falling' | 'steady';
}

export interface DraftPick {
  overall: number;
  round: number;
  pickInRound: number;
  teamId: string;
  originalTeamId: string; // who originally owned it (before trades)
  prospect?: Prospect;
  isUserPick: boolean;
}

export interface TradePackage {
  offeringTeamId: string;
  receivingTeamId: string;
  offeringPicks: number[];   // overall pick numbers
  receivingPicks: number[];  // overall pick numbers
  offeringFuturePickIds?: string[];  // future pick IDs
  receivingFuturePickIds?: string[]; // future pick IDs
  jimJohnsonValue: number;   // net value (positive = offering team wins)
}

export interface DraftSession {
  id: string;
  userTeamId: string;
  leagueMode: LeagueMode;
  picks: DraftPick[];
  currentPickIndex: number;
  status: 'setup' | 'drafting' | 'complete';
  tradeHistory: TradePackage[];
  createdAt: string;
}

export interface DraftGrade {
  teamId: string;
  grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';
  score: number;
  analysis: string;
  picks: DraftPick[];
  bestPick?: DraftPick;
  reach?: DraftPick;
  steal?: DraftPick;
}

export interface RosterPlayer {
  id: string;
  teamId: string;
  name: string;
  position: string;
  rating: number;
  contractYears: number;
  salary: number; // annual salary in millions, e.g. 35.5
}

export interface FuturePick {
  id: string;           // e.g. "2027-R1-kc"
  year: number;         // 2027 or 2028
  round: number;        // 1–7
  teamId: string;       // current owner
  originalTeamId: string;
}

export interface AITradeOffer {
  id: string;
  fromTeamId: string;
  wantsPickOverall: number;
  offersPickOveralls: number[];
  offersPlayers: RosterPlayer[];
  requestsPlayers: RosterPlayer[];
  totalOfferedValue: number;
  totalRequestedValue: number;
  narrative: string;
  expiresAtPickIndex: number;
}
