import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  FantasyLeague,
  FantasyPlayer,
  FantasyTeam,
  FantasyMatchup,
  FantasyRosterSlot,
  LeagueSettings,
  DFSContest,
  DFSLineupSlot,
  DFSSlotType,
  RosterSlotType,
} from '../types/fantasy';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function getDraftPickTeam(pickIndex: number, teamCount: number, draftOrder: string[]): string {
  const round = Math.floor(pickIndex / teamCount);
  const posInRound = pickIndex % teamCount;
  const isEvenRound = round % 2 === 1;
  const idx = isEvenRound ? teamCount - 1 - posInRound : posInRound;
  return draftOrder[idx];
}

export function calculateTeamNeeds(roster: string[], players: FantasyPlayer[]): string[] {
  const rosterPlayers = players.filter((p) => roster.includes(p.id));
  const counts: Record<string, number> = { QB: 0, RB: 0, WR: 0, TE: 0, DEF: 0, K: 0 };
  for (const p of rosterPlayers) counts[p.position] = (counts[p.position] || 0) + 1;
  const needs: string[] = [];
  if (counts.QB < 2) needs.push('QB');
  if (counts.RB < 4) needs.push('RB');
  if (counts.WR < 4) needs.push('WR');
  if (counts.TE < 2) needs.push('TE');
  if (counts.DEF < 1) needs.push('DEF');
  if (counts.K < 1) needs.push('K');
  return needs;
}

export function generateSchedule(teams: FantasyTeam[], weeks: number): FantasyMatchup[] {
  const matchups: FantasyMatchup[] = [];
  const teamIds = teams.map((t) => t.id);
  const n = teamIds.length;

  for (let week = 1; week <= weeks; week++) {
    const paired = new Set<number>();
    for (let i = 0; i < n; i++) {
      if (paired.has(i)) continue;
      for (let j = i + 1; j < n; j++) {
        if (paired.has(j)) continue;
        // Simple rotation: shift by week
        const homeIdx = (i + week - 1) % n;
        const awayIdx = (j + week - 1) % n;
        if (homeIdx === awayIdx) continue;
        paired.add(i);
        paired.add(j);
        matchups.push({
          week,
          homeTeamId: teamIds[homeIdx],
          awayTeamId: teamIds[awayIdx],
          homeScore: 0,
          awayScore: 0,
          status: 'upcoming',
        });
        break;
      }
    }
  }
  return matchups;
}

const CPU_TEAM_NAMES = [
  'The Blitz', 'Grid Iron Giants', 'Touchdown Factory', 'Red Zone Raiders',
  'Endzone Elite', 'The Pocket Rockets', 'Field Goal Fanatics', 'Hail Mary Crew',
  'Sack Masters', 'Fourth & Forever', 'Two Minute Drill', 'The Audibles',
];

function buildEmptyLineup(): FantasyRosterSlot[] {
  const slots: RosterSlotType[] = ['QB', 'RB', 'WR', 'TE', 'FLEX', 'DEF', 'K',
    'BN', 'BN', 'BN', 'BN', 'BN', 'BN', 'BN'];
  return slots.map((type) => ({ type, playerId: null }));
}

function buildDFSLineup(): DFSLineupSlot[] {
  const slots: DFSSlotType[] = ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'WR3', 'TE', 'FLEX', 'DST'];
  return slots.map((slot) => ({ slot, playerId: null, points: 0 }));
}

// ─── Mock player pool ─────────────────────────────────────────────────────────

export const MOCK_PLAYERS: FantasyPlayer[] = [
  // QBs
  { id: 'p001', name: 'Lamar Jackson', position: 'QB', team: 'BAL', age: 27, yearsExp: 6, salary: 8400, projectedPoints: 28.4, avgPoints: 27.1, rank: 1 },
  { id: 'p002', name: 'Josh Allen', position: 'QB', team: 'BUF', age: 28, yearsExp: 6, salary: 8200, projectedPoints: 27.8, avgPoints: 26.4, rank: 2 },
  { id: 'p003', name: 'Patrick Mahomes', position: 'QB', team: 'KC', age: 29, yearsExp: 8, salary: 8100, projectedPoints: 27.2, avgPoints: 25.9, rank: 3 },
  { id: 'p004', name: 'Jalen Hurts', position: 'QB', team: 'PHI', age: 26, yearsExp: 4, salary: 7900, projectedPoints: 26.5, avgPoints: 25.2, rank: 5 },
  { id: 'p005', name: 'Dak Prescott', position: 'QB', team: 'DAL', age: 31, yearsExp: 9, salary: 7400, projectedPoints: 23.1, avgPoints: 22.8, rank: 12 },
  { id: 'p006', name: 'Tua Tagovailoa', position: 'QB', team: 'MIA', age: 26, yearsExp: 5, salary: 7100, projectedPoints: 22.4, avgPoints: 21.9, rank: 14 },
  { id: 'p007', name: 'Jordan Love', position: 'QB', team: 'GB', age: 26, yearsExp: 5, salary: 7000, projectedPoints: 22.1, avgPoints: 21.5, rank: 15 },
  { id: 'p008', name: 'C.J. Stroud', position: 'QB', team: 'HOU', age: 23, yearsExp: 2, salary: 6800, projectedPoints: 21.7, avgPoints: 21.2, rank: 17 },
  { id: 'p009', name: 'Sam Howell', position: 'QB', team: 'WAS', age: 24, yearsExp: 2, salary: 5500, projectedPoints: 18.2, avgPoints: 17.8, rank: 28 },
  { id: 'p010', name: 'Deshaun Watson', position: 'QB', team: 'CLE', age: 29, yearsExp: 7, salary: 5200, projectedPoints: 16.5, avgPoints: 16.1, rank: 32 },
  // RBs
  { id: 'p011', name: "Christian McCaffrey", position: 'RB', team: 'SF', age: 28, yearsExp: 7, salary: 9000, projectedPoints: 26.2, avgPoints: 25.8, rank: 4 },
  { id: 'p012', name: 'Austin Ekeler', position: 'RB', team: 'WSH', age: 29, yearsExp: 6, salary: 7800, projectedPoints: 20.4, avgPoints: 19.7, rank: 8 },
  { id: 'p013', name: 'Breece Hall', position: 'RB', team: 'NYJ', age: 23, yearsExp: 3, salary: 7600, projectedPoints: 20.1, avgPoints: 19.3, rank: 9 },
  { id: 'p014', name: 'Bijan Robinson', position: 'RB', team: 'ATL', age: 22, yearsExp: 2, salary: 7500, projectedPoints: 19.8, avgPoints: 19.1, rank: 10 },
  { id: 'p015', name: 'Derrick Henry', position: 'RB', team: 'TEN', age: 30, yearsExp: 9, salary: 7200, projectedPoints: 18.9, avgPoints: 18.5, rank: 11 },
  { id: 'p016', name: 'Tony Pollard', position: 'RB', team: 'TEN', age: 27, yearsExp: 5, salary: 6500, projectedPoints: 16.2, avgPoints: 15.8, rank: 20 },
  { id: 'p017', name: 'Kyren Williams', position: 'RB', team: 'LAR', age: 24, yearsExp: 2, salary: 6400, projectedPoints: 15.9, avgPoints: 15.4, rank: 21 },
  { id: 'p018', name: 'Josh Jacobs', position: 'RB', team: 'GB', age: 26, yearsExp: 5, salary: 6200, projectedPoints: 15.4, avgPoints: 15.1, rank: 23 },
  { id: 'p019', name: 'D\'Andre Swift', position: 'RB', team: 'CHI', age: 25, yearsExp: 4, salary: 6100, projectedPoints: 15.1, avgPoints: 14.8, rank: 24 },
  { id: 'p020', name: 'Jahmyr Gibbs', position: 'RB', team: 'DET', age: 22, yearsExp: 2, salary: 6000, projectedPoints: 14.8, avgPoints: 14.4, rank: 25 },
  { id: 'p021', name: 'Alvin Kamara', position: 'RB', team: 'NO', age: 29, yearsExp: 7, salary: 5800, projectedPoints: 14.2, avgPoints: 13.9, rank: 26 },
  { id: 'p022', name: 'Raheem Mostert', position: 'RB', team: 'MIA', age: 31, yearsExp: 7, salary: 5500, projectedPoints: 13.5, avgPoints: 13.2, rank: 29 },
  // WRs
  { id: 'p023', name: 'Tyreek Hill', position: 'WR', team: 'MIA', age: 30, yearsExp: 8, salary: 8800, projectedPoints: 22.8, avgPoints: 22.1, rank: 6 },
  { id: 'p024', name: 'Davante Adams', position: 'WR', team: 'LV', age: 31, yearsExp: 10, salary: 8000, projectedPoints: 20.5, avgPoints: 20.1, rank: 7 },
  { id: 'p025', name: 'Stefon Diggs', position: 'WR', team: 'BUF', age: 30, yearsExp: 9, salary: 7600, projectedPoints: 18.4, avgPoints: 18.0, rank: 13 },
  { id: 'p026', name: 'CeeDee Lamb', position: 'WR', team: 'DAL', age: 25, yearsExp: 4, salary: 8500, projectedPoints: 21.8, avgPoints: 21.2, rank: 16 },
  { id: 'p027', name: 'Justin Jefferson', position: 'WR', team: 'MIN', age: 25, yearsExp: 4, salary: 8600, projectedPoints: 22.1, avgPoints: 21.5, rank: 18 },
  { id: 'p028', name: 'Amon-Ra St. Brown', position: 'WR', team: 'DET', age: 24, yearsExp: 3, salary: 7400, projectedPoints: 18.9, avgPoints: 18.4, rank: 19 },
  { id: 'p029', name: 'Ja\'Marr Chase', position: 'WR', team: 'CIN', age: 24, yearsExp: 3, salary: 8300, projectedPoints: 21.2, avgPoints: 20.7, rank: 22 },
  { id: 'p030', name: 'A.J. Brown', position: 'WR', team: 'PHI', age: 26, yearsExp: 5, salary: 7800, projectedPoints: 19.5, avgPoints: 19.0, rank: 27 },
  { id: 'p031', name: 'Keenan Allen', position: 'WR', team: 'CHI', age: 31, yearsExp: 11, salary: 6200, projectedPoints: 14.5, avgPoints: 14.1, rank: 30 },
  { id: 'p032', name: 'Mike Evans', position: 'WR', team: 'TB', age: 30, yearsExp: 10, salary: 7100, projectedPoints: 17.2, avgPoints: 16.8, rank: 31 },
  { id: 'p033', name: 'Puka Nacua', position: 'WR', team: 'LAR', age: 23, yearsExp: 2, salary: 6800, projectedPoints: 16.4, avgPoints: 16.0, rank: 33 },
  { id: 'p034', name: 'DeVonta Smith', position: 'WR', team: 'PHI', age: 25, yearsExp: 3, salary: 6600, projectedPoints: 15.8, avgPoints: 15.4, rank: 34 },
  { id: 'p035', name: 'Tee Higgins', position: 'WR', team: 'CIN', age: 25, yearsExp: 4, salary: 7000, projectedPoints: 16.9, avgPoints: 16.5, rank: 35 },
  { id: 'p036', name: 'Brandon Aiyuk', position: 'WR', team: 'SF', age: 26, yearsExp: 4, salary: 7300, projectedPoints: 17.8, avgPoints: 17.3, rank: 36 },
  // TEs
  { id: 'p037', name: 'Travis Kelce', position: 'TE', team: 'KC', age: 34, yearsExp: 12, salary: 7500, projectedPoints: 18.2, avgPoints: 17.8, rank: 37 },
  { id: 'p038', name: 'Sam LaPorta', position: 'TE', team: 'DET', age: 23, yearsExp: 2, salary: 6200, projectedPoints: 14.5, avgPoints: 14.1, rank: 38 },
  { id: 'p039', name: 'Mark Andrews', position: 'TE', team: 'BAL', age: 29, yearsExp: 6, salary: 6800, projectedPoints: 15.9, avgPoints: 15.5, rank: 39 },
  { id: 'p040', name: 'T.J. Hockenson', position: 'TE', team: 'MIN', age: 27, yearsExp: 5, salary: 6400, projectedPoints: 15.2, avgPoints: 14.8, rank: 40 },
  { id: 'p041', name: 'Dalton Kincaid', position: 'TE', team: 'BUF', age: 24, yearsExp: 2, salary: 5800, projectedPoints: 13.2, avgPoints: 12.9, rank: 41 },
  { id: 'p042', name: 'Cole Kmet', position: 'TE', team: 'CHI', age: 24, yearsExp: 4, salary: 5500, projectedPoints: 12.8, avgPoints: 12.4, rank: 42 },
  // Ks
  { id: 'p043', name: 'Justin Tucker', position: 'K', team: 'BAL', age: 34, yearsExp: 12, salary: 4500, projectedPoints: 9.2, avgPoints: 8.9, rank: 43 },
  { id: 'p044', name: 'Evan McPherson', position: 'K', team: 'CIN', age: 24, yearsExp: 3, salary: 4200, projectedPoints: 8.8, avgPoints: 8.5, rank: 44 },
  { id: 'p045', name: 'Tyler Bass', position: 'K', team: 'BUF', age: 27, yearsExp: 4, salary: 4100, projectedPoints: 8.5, avgPoints: 8.2, rank: 45 },
  // DEFs
  { id: 'p046', name: 'San Francisco 49ers', position: 'DEF', team: 'SF', age: 0, yearsExp: 0, salary: 4800, projectedPoints: 10.2, avgPoints: 9.8, rank: 46 },
  { id: 'p047', name: 'Dallas Cowboys', position: 'DEF', team: 'DAL', age: 0, yearsExp: 0, salary: 4500, projectedPoints: 9.8, avgPoints: 9.5, rank: 47 },
  { id: 'p048', name: 'Buffalo Bills', position: 'DEF', team: 'BUF', age: 0, yearsExp: 0, salary: 4300, projectedPoints: 9.5, avgPoints: 9.1, rank: 48 },
  { id: 'p049', name: 'New York Jets', position: 'DEF', team: 'NYJ', age: 0, yearsExp: 0, salary: 4100, projectedPoints: 9.1, avgPoints: 8.8, rank: 49 },
  { id: 'p050', name: 'Kansas City Chiefs', position: 'DEF', team: 'KC', age: 0, yearsExp: 0, salary: 4000, projectedPoints: 8.8, avgPoints: 8.5, rank: 50 },
  // More RBs/WRs for depth
  { id: 'p051', name: 'Isiah Pacheco', position: 'RB', team: 'KC', age: 25, yearsExp: 3, salary: 5600, projectedPoints: 13.8, avgPoints: 13.5, rank: 51 },
  { id: 'p052', name: 'Jonathan Taylor', position: 'RB', team: 'IND', age: 25, yearsExp: 4, salary: 6800, projectedPoints: 16.5, avgPoints: 16.1, rank: 52 },
  { id: 'p053', name: 'Rachaad White', position: 'RB', team: 'TB', age: 25, yearsExp: 3, salary: 5400, projectedPoints: 13.2, avgPoints: 12.9, rank: 53 },
  { id: 'p054', name: 'Travis Etienne', position: 'RB', team: 'JAX', age: 25, yearsExp: 3, salary: 6500, projectedPoints: 16.1, avgPoints: 15.7, rank: 54 },
  { id: 'p055', name: 'Deebo Samuel', position: 'WR', team: 'SF', age: 28, yearsExp: 5, salary: 6900, projectedPoints: 16.7, avgPoints: 16.3, rank: 55 },
  { id: 'p056', name: 'Jaylen Waddle', position: 'WR', team: 'MIA', age: 26, yearsExp: 3, salary: 7200, projectedPoints: 17.5, avgPoints: 17.1, rank: 56 },
  { id: 'p057', name: 'Chris Olave', position: 'WR', team: 'NO', age: 24, yearsExp: 3, salary: 6700, projectedPoints: 16.2, avgPoints: 15.8, rank: 57 },
  { id: 'p058', name: 'Gabe Davis', position: 'WR', team: 'BUF', age: 25, yearsExp: 4, salary: 5800, projectedPoints: 13.5, avgPoints: 13.2, rank: 58 },
  { id: 'p059', name: 'Tank Dell', position: 'WR', team: 'HOU', age: 24, yearsExp: 2, salary: 5900, projectedPoints: 13.8, avgPoints: 13.5, rank: 59 },
  { id: 'p060', name: 'Rashee Rice', position: 'WR', team: 'KC', age: 23, yearsExp: 2, salary: 6300, projectedPoints: 15.1, avgPoints: 14.7, rank: 60 },
];

// ─── Store ────────────────────────────────────────────────────────────────────

interface FantasyState {
  league: FantasyLeague | null;
  players: FantasyPlayer[];
  playersLoaded: boolean;
  dfsContest: DFSContest | null;
  activeTab: 'season' | 'dfs';
  lastCpuPick: { playerName: string; teamName: string } | null;
}

interface FantasyActions {
  createLeague: (name: string, teamName: string, settings: LeagueSettings) => void;
  joinLeague: (inviteCode: string) => void;
  setPlayers: (players: FantasyPlayer[]) => void;
  makeDraftPick: (playerId: string) => void;
  setLineup: (teamId: string, lineup: FantasyRosterSlot[]) => void;
  createDFSContest: (week: number) => void;
  setDFSSlot: (slot: string, playerId: string | null) => void;
  lockDFSLineup: () => void;
  simulateWeek: () => void;
  setActiveTab: (tab: 'season' | 'dfs') => void;
  clearLastCpuPick: () => void;
  resetLeague: () => void;
}

function cpuAutoPick(
  draftOrder: string[],
  currentPick: number,
  draftedIds: string[],
  teams: FantasyTeam[],
  players: FantasyPlayer[]
): string {
  const teamId = getDraftPickTeam(currentPick, draftOrder.length, draftOrder);
  const team = teams.find((t) => t.id === teamId);
  const available = players.filter((p) => !draftedIds.includes(p.id));
  if (available.length === 0) return '';
  const needs = team ? calculateTeamNeeds(team.roster, players) : [];
  // Score by need + rank
  const scored = available.map((p) => {
    const needBonus = needs.includes(p.position) ? 20 : 0;
    return { id: p.id, score: (100 - p.rank) + needBonus };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].id;
}

export const useFantasyStore = create<FantasyState & FantasyActions>()(
  persist(
    (set, get) => ({
      league: null,
      players: MOCK_PLAYERS,
      playersLoaded: true,
      dfsContest: null,
      activeTab: 'season',
      lastCpuPick: null,

      setActiveTab: (tab) => set({ activeTab: tab }),
      clearLastCpuPick: () => set({ lastCpuPick: null }),
      resetLeague: () => set({ league: null }),

      createLeague: (name, teamName, settings) => {
        const userId = randomId();
        const userTeam: FantasyTeam = {
          id: userId,
          name: teamName,
          ownerName: 'You',
          isUser: true,
          isHuman: true,
          roster: [],
          lineup: buildEmptyLineup(),
          record: { wins: 0, losses: 0, ties: 0 },
          totalPoints: 0,
          weeklyPoints: Array(17).fill(0),
        };
        const cpuNames = [...CPU_TEAM_NAMES].sort(() => Math.random() - 0.5);
        const cpuTeams: FantasyTeam[] = Array.from({ length: settings.teamCount - 1 }, (_, i) => ({
          id: randomId(),
          name: cpuNames[i] || `Team ${i + 2}`,
          ownerName: `CPU ${i + 1}`,
          isUser: false,
          isHuman: false,
          roster: [],
          lineup: buildEmptyLineup(),
          record: { wins: 0, losses: 0, ties: 0 },
          totalPoints: 0,
          weeklyPoints: Array(17).fill(0),
        }));
        const teams = [userTeam, ...cpuTeams];
        const draftOrder = [...teams.map((t) => t.id)].sort(() => Math.random() - 0.5);
        const matchups = generateSchedule(teams, 17);
        const league: FantasyLeague = {
          id: randomId(),
          name,
          inviteCode: generateInviteCode(),
          type: 'season',
          season: 2025,
          settings,
          teams,
          matchups,
          currentWeek: 1,
          draftStatus: 'pending',
          draftOrder,
          currentDraftPick: 0,
          draftedPlayerIds: [],
        };
        set({ league });
      },

      joinLeague: (_inviteCode) => {
        // Stub: in production would hit an API
        console.log('joinLeague stub');
      },

      setPlayers: (players) => set({ players, playersLoaded: true }),

      makeDraftPick: (playerId) => {
        const { league, players } = get();
        if (!league) return;
        if (league.draftStatus === 'complete') return;

        const totalPicks = league.settings.rosterSize * league.settings.teamCount;
        let state = { ...league };

        const applyPick = (pid: string, pickIdx: number) => {
          const teamId = getDraftPickTeam(state.currentDraftPick, state.draftOrder.length, state.draftOrder);
          state = {
            ...state,
            draftedPlayerIds: [...state.draftedPlayerIds, pid],
            currentDraftPick: pickIdx + 1,
            teams: state.teams.map((t) =>
              t.id === teamId ? { ...t, roster: [...t.roster, pid] } : t
            ),
          };
        };

        applyPick(playerId, league.currentDraftPick);

        // If draft is complete
        if (state.currentDraftPick >= totalPicks) {
          set({ league: { ...state, draftStatus: 'complete' } });
          return;
        }

        // Advance through CPU picks
        set({ league: state }, false);

        // Use timeout chain for CPU picks
        const runCpuPicks = () => {
          const current = get().league;
          if (!current) return;
          const currentPickTeamId = getDraftPickTeam(
            current.currentDraftPick,
            current.draftOrder.length,
            current.draftOrder
          );
          const isUserTurn = currentPickTeamId === current.teams.find((t) => t.isUser)?.id;
          if (isUserTurn) return;
          if (current.currentDraftPick >= totalPicks) {
            set({ league: { ...current, draftStatus: 'complete' } });
            return;
          }
          const cpuPickId = cpuAutoPick(
            current.draftOrder,
            current.currentDraftPick,
            current.draftedPlayerIds,
            current.teams,
            players
          );
          if (!cpuPickId) return;
          const cpuTeamId = getDraftPickTeam(current.currentDraftPick, current.draftOrder.length, current.draftOrder);
          const cpuTeam = current.teams.find((t) => t.id === cpuTeamId);
          const cpuPlayer = players.find((p) => p.id === cpuPickId);
          const newDraftedIds = [...current.draftedPlayerIds, cpuPickId];
          const newPick = current.currentDraftPick + 1;
          const newTeams = current.teams.map((t) =>
            t.id === cpuTeamId ? { ...t, roster: [...t.roster, cpuPickId] } : t
          );
          const isDraftComplete = newPick >= totalPicks;
          set({
            league: {
              ...current,
              draftedPlayerIds: newDraftedIds,
              currentDraftPick: newPick,
              teams: newTeams,
              draftStatus: isDraftComplete ? 'complete' : current.draftStatus,
            },
            lastCpuPick: {
              playerName: cpuPlayer?.name ?? 'Unknown',
              teamName: cpuTeam?.name ?? 'CPU',
            },
          });
          if (!isDraftComplete) {
            setTimeout(runCpuPicks, 1200);
          }
        };

        setTimeout(runCpuPicks, 800);
      },

      setLineup: (teamId, lineup) => {
        const { league } = get();
        if (!league) return;
        set({
          league: {
            ...league,
            teams: league.teams.map((t) => (t.id === teamId ? { ...t, lineup } : t)),
          },
        });
      },

      createDFSContest: (week) => {
        const contest: DFSContest = {
          id: randomId(),
          name: `Week ${week} Showdown`,
          week,
          salaryCap: 50000,
          lineup: buildDFSLineup(),
          totalSalary: 0,
          projectedPoints: 0,
          lockedIn: false,
          score: 0,
        };
        set({ dfsContest: contest });
      },

      setDFSSlot: (slot, playerId) => {
        const { dfsContest, players } = get();
        if (!dfsContest) return;
        const newLineup = dfsContest.lineup.map((s) =>
          s.slot === slot ? { ...s, playerId } : s
        );
        const totalSalary = newLineup.reduce((acc, s) => {
          if (!s.playerId) return acc;
          const p = players.find((pl) => pl.id === s.playerId);
          return acc + (p?.salary ?? 0);
        }, 0);
        const projectedPoints = newLineup.reduce((acc, s) => {
          if (!s.playerId) return acc;
          const p = players.find((pl) => pl.id === s.playerId);
          return acc + (p?.projectedPoints ?? 0);
        }, 0);
        set({ dfsContest: { ...dfsContest, lineup: newLineup, totalSalary, projectedPoints } });
      },

      lockDFSLineup: () => {
        const { dfsContest, players } = get();
        if (!dfsContest) return;
        const score = dfsContest.lineup.reduce((acc, s) => {
          if (!s.playerId) return acc;
          const p = players.find((pl) => pl.id === s.playerId);
          if (!p) return acc;
          const variance = 0.7 + Math.random() * 0.6;
          return acc + p.avgPoints * variance;
        }, 0);
        set({ dfsContest: { ...dfsContest, lockedIn: true, score: Math.round(score * 10) / 10 } });
      },

      simulateWeek: () => {
        const { league, players } = get();
        if (!league) return;
        const week = league.currentWeek;
        const weekMatchups = league.matchups.filter((m) => m.week === week);

        const teamScores: Record<string, number> = {};
        for (const team of league.teams) {
          const base = team.roster.reduce((acc, pid) => {
            const p = players.find((pl) => pl.id === pid);
            if (!p) return acc;
            const variance = 0.7 + Math.random() * 0.6;
            return acc + p.avgPoints * variance;
          }, 0);
          teamScores[team.id] = Math.round((base / Math.max(team.roster.length, 1)) * 10) / 10;
        }

        const updatedMatchups = league.matchups.map((m) => {
          if (m.week !== week) return m;
          return {
            ...m,
            homeScore: teamScores[m.homeTeamId] ?? 0,
            awayScore: teamScores[m.awayTeamId] ?? 0,
            status: 'final' as const,
          };
        });

        const updatedTeams = league.teams.map((t) => {
          const matchup = weekMatchups.find(
            (m) => m.homeTeamId === t.id || m.awayTeamId === t.id
          );
          if (!matchup) return t;
          const myScore = matchup.homeTeamId === t.id ? teamScores[t.id] : teamScores[t.id];
          const oppId = matchup.homeTeamId === t.id ? matchup.awayTeamId : matchup.homeTeamId;
          const oppScore = teamScores[oppId] ?? 0;
          const myActual = teamScores[t.id] ?? 0;
          const newWeeklyPoints = [...t.weeklyPoints];
          newWeeklyPoints[week - 1] = myActual;
          const wins = myActual > oppScore ? t.record.wins + 1 : t.record.wins;
          const losses = myActual < oppScore ? t.record.losses + 1 : t.record.losses;
          const ties = myActual === oppScore ? t.record.ties + 1 : t.record.ties;
          return {
            ...t,
            record: { wins, losses, ties },
            totalPoints: t.totalPoints + myActual,
            weeklyPoints: newWeeklyPoints,
          };
        });

        set({
          league: {
            ...league,
            matchups: updatedMatchups,
            teams: updatedTeams,
            currentWeek: Math.min(week + 1, 17),
          },
        });
      },
    }),
    {
      name: 'gridiron-fantasy-v1',
      partialize: (state) => ({
        league: state.league,
        players: state.players,
        playersLoaded: state.playersLoaded,
        dfsContest: state.dfsContest,
        activeTab: state.activeTab,
      }),
    }
  )
);
