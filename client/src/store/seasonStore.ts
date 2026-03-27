import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NFL_GAME_TEAMS, type GameTeam } from '../game/teams';

export interface GameResult {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  week: number;
  played: boolean;
}

export interface TeamRecord {
  teamId: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  divisionWins: number;
  divisionLosses: number;
}

export interface SeasonSchedule {
  week: number;
  games: GameResult[];
}

interface SeasonState {
  userTeamId: string | null;
  currentWeek: number;
  schedule: SeasonSchedule[];
  records: Record<string, TeamRecord>;
  isPlayoffTime: boolean;
  seasonYear: number;

  startSeason: (teamId: string) => void;
  simGame: (homeTeamId: string, awayTeamId: string, week: number) => void;
  simWeek: (week: number) => void;
  advanceWeek: () => void;
  resetSeason: () => void;
}

// Generate a full 18-week NFL schedule (simplified: each team plays 17 opponents)
function generateSchedule(teams: GameTeam[]): SeasonSchedule[] {
  // Build weekly matchups - simplified round-robin style
  const schedule: SeasonSchedule[] = [];
  const teamIds = teams.map(t => t.id);

  for (let week = 1; week <= 18; week++) {
    const games: GameResult[] = [];
    const shuffled = [...teamIds].sort(() => Math.random() - 0.5);
    // Pair up teams (16 games per week, 32 teams / 2)
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      games.push({
        homeTeamId: shuffled[i],
        awayTeamId: shuffled[i + 1],
        homeScore: 0,
        awayScore: 0,
        week,
        played: false,
      });
    }
    schedule.push({ week, games });
  }

  return schedule;
}

function simSingleGame(homeTeam: GameTeam, awayTeam: GameTeam): { homeScore: number; awayScore: number } {
  // Simple sim based on ratings
  const homeOvr = (homeTeam.offenseRating + homeTeam.defenseRating + homeTeam.speedRating) / 3 + 3; // home field advantage
  const awayOvr = (awayTeam.offenseRating + awayTeam.defenseRating + awayTeam.speedRating) / 3;

  const basePts = 21;
  const variance = 14;

  const homeScore = Math.round(basePts + (homeOvr - 80) * 0.5 + (Math.random() - 0.5) * variance);
  const awayScore = Math.round(basePts + (awayOvr - 80) * 0.5 + (Math.random() - 0.5) * variance);

  return {
    homeScore: Math.max(0, homeScore),
    awayScore: Math.max(0, awayScore),
  };
}

const initialRecords = (): Record<string, TeamRecord> => {
  const r: Record<string, TeamRecord> = {};
  for (const t of NFL_GAME_TEAMS) {
    r[t.id] = { teamId: t.id, wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0, divisionWins: 0, divisionLosses: 0 };
  }
  return r;
};

export const useSeasonStore = create<SeasonState>()(
  persist(
    (set, get) => ({
      userTeamId: null,
      currentWeek: 1,
      schedule: [],
      records: {},
      isPlayoffTime: false,
      seasonYear: 2026,

      startSeason: (teamId: string) => {
        const schedule = generateSchedule(NFL_GAME_TEAMS);
        set({
          userTeamId: teamId,
          currentWeek: 1,
          schedule,
          records: initialRecords(),
          isPlayoffTime: false,
        });
      },

      simGame: (homeTeamId: string, awayTeamId: string, week: number) => {
        const homeTeam = NFL_GAME_TEAMS.find(t => t.id === homeTeamId)!;
        const awayTeam = NFL_GAME_TEAMS.find(t => t.id === awayTeamId)!;
        const result = simSingleGame(homeTeam, awayTeam);

        set(state => {
          const schedule = state.schedule.map(w => {
            if (w.week !== week) return w;
            return {
              ...w,
              games: w.games.map(g => {
                if (g.homeTeamId !== homeTeamId || g.awayTeamId !== awayTeamId) return g;
                return { ...g, homeScore: result.homeScore, awayScore: result.awayScore, played: true };
              }),
            };
          });

          const records = { ...state.records };
          const homeRec = { ...records[homeTeamId] };
          const awayRec = { ...records[awayTeamId] };

          homeRec.pointsFor += result.homeScore;
          homeRec.pointsAgainst += result.awayScore;
          awayRec.pointsFor += result.awayScore;
          awayRec.pointsAgainst += result.homeScore;

          if (result.homeScore > result.awayScore) {
            homeRec.wins++;
            awayRec.losses++;
          } else if (result.awayScore > result.homeScore) {
            awayRec.wins++;
            homeRec.losses++;
          } else {
            homeRec.ties++;
            awayRec.ties++;
          }

          records[homeTeamId] = homeRec;
          records[awayTeamId] = awayRec;

          return { schedule, records };
        });
      },

      simWeek: (week: number) => {
        const { schedule, simGame } = get();
        const weekData = schedule.find(w => w.week === week);
        if (!weekData) return;
        for (const game of weekData.games) {
          if (!game.played) {
            simGame(game.homeTeamId, game.awayTeamId, week);
          }
        }
      },

      advanceWeek: () => {
        set(state => {
          const next = state.currentWeek + 1;
          return { currentWeek: Math.min(next, 18), isPlayoffTime: next > 18 };
        });
      },

      resetSeason: () => set({
        userTeamId: null,
        currentWeek: 1,
        schedule: [],
        records: {},
        isPlayoffTime: false,
      }),
    }),
    { name: 'season-store' }
  )
);
