import type { NFLTeam, Position, DraftStyle } from '../types/draft';

export const NFL_TEAMS: NFLTeam[] = [
  // AFC North
  { id: 'bal', name: 'Ravens', city: 'Baltimore', abbreviation: 'BAL', conference: 'AFC', division: 'North', primaryColor: '#241773', secondaryColor: '#9E7C0C', needs: ['WR', 'CB', 'OT'], draftStyle: 'bpa', picks: [], pick1: 26 },
  { id: 'cin', name: 'Bengals', city: 'Cincinnati', abbreviation: 'CIN', conference: 'AFC', division: 'North', primaryColor: '#FB4F14', secondaryColor: '#000000', needs: ['OT', 'OG', 'EDGE'], draftStyle: 'need', picks: [], pick1: 17 },
  { id: 'cle', name: 'Browns', city: 'Cleveland', abbreviation: 'CLE', conference: 'AFC', division: 'North', primaryColor: '#311D00', secondaryColor: '#FF3C00', needs: ['WR', 'QB', 'CB'], draftStyle: 'bpa', picks: [], pick1: 2 },
  { id: 'pit', name: 'Steelers', city: 'Pittsburgh', abbreviation: 'PIT', conference: 'AFC', division: 'North', primaryColor: '#101820', secondaryColor: '#FFB612', needs: ['QB', 'WR', 'EDGE'], draftStyle: 'bpa', picks: [], pick1: 21 },
  // AFC South
  { id: 'hou', name: 'Texans', city: 'Houston', abbreviation: 'HOU', conference: 'AFC', division: 'South', primaryColor: '#03202F', secondaryColor: '#A71930', needs: ['CB', 'OT', 'DT'], draftStyle: 'need', picks: [], pick1: 0 },
  { id: 'ind', name: 'Colts', city: 'Indianapolis', abbreviation: 'IND', conference: 'AFC', division: 'South', primaryColor: '#002C5F', secondaryColor: '#A2AAAD', needs: ['EDGE', 'WR', 'CB'], draftStyle: 'bpa', picks: [], pick1: 14 },
  { id: 'jax', name: 'Jaguars', city: 'Jacksonville', abbreviation: 'JAX', conference: 'AFC', division: 'South', primaryColor: '#006778', secondaryColor: '#D7A22A', needs: ['EDGE', 'OT', 'S'], draftStyle: 'trade-down', picks: [], pick1: 5 },
  { id: 'ten', name: 'Titans', city: 'Tennessee', abbreviation: 'TEN', conference: 'AFC', division: 'South', primaryColor: '#0C2340', secondaryColor: '#4B92DB', needs: ['QB', 'WR', 'EDGE'], draftStyle: 'qb-hunter', picks: [], pick1: 1 },
  // AFC East
  { id: 'buf', name: 'Bills', city: 'Buffalo', abbreviation: 'BUF', conference: 'AFC', division: 'East', primaryColor: '#00338D', secondaryColor: '#C60C30', needs: ['OT', 'CB', 'S'], draftStyle: 'need', picks: [], pick1: 28 },
  { id: 'mia', name: 'Dolphins', city: 'Miami', abbreviation: 'MIA', conference: 'AFC', division: 'East', primaryColor: '#008E97', secondaryColor: '#FC4C02', needs: ['EDGE', 'OT', 'DT'], draftStyle: 'bpa', picks: [], pick1: 13 },
  { id: 'ne', name: 'Patriots', city: 'New England', abbreviation: 'NE', conference: 'AFC', division: 'East', primaryColor: '#002244', secondaryColor: '#C60C30', needs: ['QB', 'WR', 'OT'], draftStyle: 'qb-hunter', picks: [], pick1: 4 },
  { id: 'nyj', name: 'Jets', city: 'New York', abbreviation: 'NYJ', conference: 'AFC', division: 'East', primaryColor: '#125740', secondaryColor: '#000000', needs: ['WR', 'OT', 'EDGE'], draftStyle: 'need', picks: [], pick1: 7 },
  // AFC West
  { id: 'den', name: 'Broncos', city: 'Denver', abbreviation: 'DEN', conference: 'AFC', division: 'West', primaryColor: '#FB4F14', secondaryColor: '#002244', needs: ['WR', 'OT', 'EDGE'], draftStyle: 'need', picks: [], pick1: 20 },
  { id: 'kc', name: 'Chiefs', city: 'Kansas City', abbreviation: 'KC', conference: 'AFC', division: 'West', primaryColor: '#E31837', secondaryColor: '#FFB81C', needs: ['CB', 'WR', 'OT'], draftStyle: 'trade-up', picks: [], pick1: 27 },
  { id: 'lv', name: 'Raiders', city: 'Las Vegas', abbreviation: 'LV', conference: 'AFC', division: 'West', primaryColor: '#000000', secondaryColor: '#A5ACAF', needs: ['QB', 'EDGE', 'OT'], draftStyle: 'bpa', picks: [], pick1: 6 },
  { id: 'lac', name: 'Chargers', city: 'Los Angeles', abbreviation: 'LAC', conference: 'AFC', division: 'West', primaryColor: '#002A5E', secondaryColor: '#FFC20E', needs: ['OT', 'LB', 'CB'], draftStyle: 'need', picks: [], pick1: 22 },
  // NFC North
  { id: 'chi', name: 'Bears', city: 'Chicago', abbreviation: 'CHI', conference: 'NFC', division: 'North', primaryColor: '#0B162A', secondaryColor: '#C83803', needs: ['WR', 'EDGE', 'OT'], draftStyle: 'trade-down', picks: [], pick1: 10 },
  { id: 'det', name: 'Lions', city: 'Detroit', abbreviation: 'DET', conference: 'NFC', division: 'North', primaryColor: '#0076B6', secondaryColor: '#B0B7BC', needs: ['S', 'CB', 'EDGE'], draftStyle: 'bpa', picks: [], pick1: 31 },
  { id: 'gb', name: 'Packers', city: 'Green Bay', abbreviation: 'GB', conference: 'NFC', division: 'North', primaryColor: '#203731', secondaryColor: '#FFB612', needs: ['CB', 'S', 'OT'], draftStyle: 'bpa', picks: [], pick1: 24 },
  { id: 'min', name: 'Vikings', city: 'Minnesota', abbreviation: 'MIN', conference: 'NFC', division: 'North', primaryColor: '#4F2683', secondaryColor: '#FFC62F', needs: ['CB', 'OT', 'EDGE'], draftStyle: 'need', picks: [], pick1: 23 },
  // NFC South
  { id: 'atl', name: 'Falcons', city: 'Atlanta', abbreviation: 'ATL', conference: 'NFC', division: 'South', primaryColor: '#A71930', secondaryColor: '#000000', needs: ['EDGE', 'OT', 'S'], draftStyle: 'bpa', picks: [], pick1: 15 },
  { id: 'car', name: 'Panthers', city: 'Carolina', abbreviation: 'CAR', conference: 'NFC', division: 'South', primaryColor: '#0085CA', secondaryColor: '#101820', needs: ['QB', 'OT', 'CB'], draftStyle: 'qb-hunter', picks: [], pick1: 8 },
  { id: 'no', name: 'Saints', city: 'New Orleans', abbreviation: 'NO', conference: 'NFC', division: 'South', primaryColor: '#D3BC8D', secondaryColor: '#101820', needs: ['WR', 'EDGE', 'CB'], draftStyle: 'need', picks: [], pick1: 9 },
  { id: 'tb', name: 'Buccaneers', city: 'Tampa Bay', abbreviation: 'TB', conference: 'NFC', division: 'South', primaryColor: '#D50A0A', secondaryColor: '#FF7900', needs: ['OT', 'LB', 'S'], draftStyle: 'bpa', picks: [], pick1: 19 },
  // NFC East
  { id: 'dal', name: 'Cowboys', city: 'Dallas', abbreviation: 'DAL', conference: 'NFC', division: 'East', primaryColor: '#003594', secondaryColor: '#869397', needs: ['CB', 'EDGE', 'OT'], draftStyle: 'bpa', picks: [], pick1: 12 },
  { id: 'nyg', name: 'Giants', city: 'New York', abbreviation: 'NYG', conference: 'NFC', division: 'East', primaryColor: '#0B2265', secondaryColor: '#A71930', needs: ['OT', 'EDGE', 'WR'], draftStyle: 'need', picks: [], pick1: 3 },
  { id: 'phi', name: 'Eagles', city: 'Philadelphia', abbreviation: 'PHI', conference: 'NFC', division: 'East', primaryColor: '#004C54', secondaryColor: '#A5ACAF', needs: ['CB', 'WR', 'S'], draftStyle: 'trade-down', picks: [], pick1: 29 },
  { id: 'wsh', name: 'Commanders', city: 'Washington', abbreviation: 'WSH', conference: 'NFC', division: 'East', primaryColor: '#5A1414', secondaryColor: '#FFB612', needs: ['OT', 'LB', 'WR'], draftStyle: 'need', picks: [], pick1: 25 },
  // NFC West
  { id: 'ari', name: 'Cardinals', city: 'Arizona', abbreviation: 'ARI', conference: 'NFC', division: 'West', primaryColor: '#97233F', secondaryColor: '#000000', needs: ['OT', 'EDGE', 'S'], draftStyle: 'bpa', picks: [], pick1: 16 },
  { id: 'lar', name: 'Rams', city: 'Los Angeles', abbreviation: 'LAR', conference: 'NFC', division: 'West', primaryColor: '#003594', secondaryColor: '#FFA300', needs: ['EDGE', 'OT', 'CB'], draftStyle: 'trade-up', picks: [], pick1: 30 },
  { id: 'sf', name: '49ers', city: 'San Francisco', abbreviation: 'SF', conference: 'NFC', division: 'West', primaryColor: '#AA0000', secondaryColor: '#B3995D', needs: ['QB', 'WR', 'OT'], draftStyle: 'qb-hunter', picks: [], pick1: 11 },
  { id: 'sea', name: 'Seahawks', city: 'Seattle', abbreviation: 'SEA', conference: 'NFC', division: 'West', primaryColor: '#002244', secondaryColor: '#69BE28', needs: ['EDGE', 'OT', 'CB'], draftStyle: 'bpa', picks: [], pick1: 18 },
];

export const getTeam = (id: string) => NFL_TEAMS.find(t => t.id === id);

// ─── Official 2026 NFL Draft first-round order (32 picks) ────────────────────
// Traded picks included: NYJ owns #2 & #16 (IND's), CLE owns #6 & #24 (JAX's),
// KC owns #9 & #29 (LAR's), DAL owns #12 & #20 (GB's),
// MIA owns #11 & #30 (DEN's), LAR owns #13 (ATL's)
export const DRAFT_2026_R1_ORDER: string[] = [
  'lv',  // 1
  'nyj', // 2
  'ari', // 3
  'ten', // 4
  'nyg', // 5
  'cle', // 6
  'wsh', // 7
  'no',  // 8
  'kc',  // 9
  'cin', // 10
  'mia', // 11
  'dal', // 12
  'lar', // 13 — holds ATL's pick
  'bal', // 14
  'tb',  // 15
  'nyj', // 16 — holds IND's pick
  'det', // 17
  'min', // 18
  'car', // 19
  'dal', // 20 — holds GB's pick
  'pit', // 21
  'lac', // 22
  'phi', // 23
  'cle', // 24 — holds JAX's pick
  'chi', // 25
  'buf', // 26
  'sf',  // 27
  'hou', // 28
  'kc',  // 29 — holds LAR's own pick
  'mia', // 30 — holds DEN's pick
  'ne',  // 31
  'sea', // 32
];

// All 32 teams in standings order for rounds 2–7 (each team once, traded-away
// teams re-inserted at their approximate standings position)
export const DRAFT_2026_SUBSEQUENT_ORDER: string[] = [
  'lv',  // 1
  'nyj', // 2
  'ari', // 3
  'ten', // 4
  'nyg', // 5
  'cle', // 6
  'wsh', // 7
  'no',  // 8
  'kc',  // 9
  'cin', // 10
  'mia', // 11
  'dal', // 12
  'atl', // 13 — traded R1, still picks in R2+
  'lar', // 14
  'bal', // 15
  'ind', // 16 — traded R1, still picks in R2+
  'tb',  // 17
  'det', // 18
  'min', // 19
  'car', // 20
  'gb',  // 21 — traded R1, still picks in R2+
  'pit', // 22
  'lac', // 23
  'phi', // 24
  'jax', // 25 — traded R1, still picks in R2+
  'chi', // 26
  'buf', // 27
  'sf',  // 28
  'hou', // 29
  'den', // 30 — traded R1, still picks in R2+
  'ne',  // 31
  'sea', // 32
];

// Returns a team's first-round pick number in 2026 (0 = traded away)
export function getTeamR1Pick(teamId: string): number {
  const idx = DRAFT_2026_R1_ORDER.indexOf(teamId);
  return idx === -1 ? 0 : idx + 1;
}

export const TEAMS_BY_DRAFT_ORDER = [...NFL_TEAMS]
  .sort((a, b) => {
    const posA = DRAFT_2026_SUBSEQUENT_ORDER.indexOf(a.id);
    const posB = DRAFT_2026_SUBSEQUENT_ORDER.indexOf(b.id);
    return posA - posB;
  });
