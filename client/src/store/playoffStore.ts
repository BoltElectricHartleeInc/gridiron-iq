import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NFL_GAME_TEAMS, type GameTeam } from '../game/teams';

export type PlayoffRound = 'wildcard' | 'divisional' | 'conference' | 'superbowl';

export interface PlayoffGame {
  id: string;
  round: PlayoffRound;
  conference: 'AFC' | 'NFC' | 'Super Bowl';
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  played: boolean;
  winnerId: string | null;
  slot: number; // position in bracket
}

export interface PlayoffBracket {
  afcSeeds: string[]; // 7 team ids, index 0 = 1 seed
  nfcSeeds: string[];
  games: PlayoffGame[];
  champion: string | null;
  currentRound: PlayoffRound;
}

interface PlayoffState {
  bracket: PlayoffBracket | null;
  userTeamId: string | null;

  startPlayoffs: (afcSeeds: string[], nfcSeeds: string[], userTeamId: string) => void;
  simGame: (gameId: string) => void;
  playGame: (gameId: string, homeScore: number, awayScore: number) => void;
  advanceRound: () => void;
  resetPlayoffs: () => void;
}

function simPlayoffGame(homeId: string, awayId: string): { homeScore: number; awayScore: number } {
  const home = NFL_GAME_TEAMS.find((t: GameTeam) => t.id === homeId)!;
  const away = NFL_GAME_TEAMS.find((t: GameTeam) => t.id === awayId)!;
  const homeOvr = (home.offenseRating + home.defenseRating) / 2 + 4;
  const awayOvr = (away.offenseRating + away.defenseRating) / 2;
  let homeScore = Math.round(21 + (homeOvr - 80) * 0.6 + (Math.random() - 0.5) * 16);
  let awayScore = Math.round(21 + (awayOvr - 80) * 0.6 + (Math.random() - 0.5) * 16);
  homeScore = Math.max(3, homeScore);
  awayScore = Math.max(0, awayScore);
  if (homeScore === awayScore) homeScore++; // no ties in playoffs
  return { homeScore, awayScore };
}

function buildWildcardGames(afcSeeds: string[], nfcSeeds: string[]): PlayoffGame[] {
  // AFC: 2v7, 3v6, 4v5 | NFC: 2v7, 3v6, 4v5 (1 seed gets bye)
  const games: PlayoffGame[] = [];
  const matchups = [[1, 6], [2, 5], [3, 4]]; // 0-indexed → seeds 2v7, 3v6, 4v5

  matchups.forEach(([hi, ai], i) => {
    games.push({
      id: `afc_wc_${i}`,
      round: 'wildcard',
      conference: 'AFC',
      homeTeamId: afcSeeds[hi - 1] || afcSeeds[0],
      awayTeamId: afcSeeds[ai] || afcSeeds[1],
      homeScore: 0, awayScore: 0, played: false, winnerId: null, slot: i,
    });
    games.push({
      id: `nfc_wc_${i}`,
      round: 'wildcard',
      conference: 'NFC',
      homeTeamId: nfcSeeds[hi - 1] || nfcSeeds[0],
      awayTeamId: nfcSeeds[ai] || nfcSeeds[1],
      homeScore: 0, awayScore: 0, played: false, winnerId: null, slot: i + 3,
    });
  });

  return games;
}

export const usePlayoffStore = create<PlayoffState>()(
  persist(
    (set, get) => ({
      bracket: null,
      userTeamId: null,

      startPlayoffs: (afcSeeds, nfcSeeds, userTeamId) => {
        const games = buildWildcardGames(afcSeeds, nfcSeeds);
        set({
          userTeamId,
          bracket: {
            afcSeeds,
            nfcSeeds,
            games,
            champion: null,
            currentRound: 'wildcard',
          },
        });
      },

      simGame: (gameId: string) => {
        set(state => {
          if (!state.bracket) return state;
          const games = state.bracket.games.map(g => {
            if (g.id !== gameId || g.played) return g;
            const { homeScore, awayScore } = simPlayoffGame(g.homeTeamId, g.awayTeamId);
            return {
              ...g,
              homeScore,
              awayScore,
              played: true,
              winnerId: homeScore > awayScore ? g.homeTeamId : g.awayTeamId,
            };
          });
          return { bracket: { ...state.bracket, games } };
        });
      },

      playGame: (gameId: string, homeScore: number, awayScore: number) => {
        set(state => {
          if (!state.bracket) return state;
          const games = state.bracket.games.map(g => {
            if (g.id !== gameId) return g;
            return {
              ...g,
              homeScore,
              awayScore,
              played: true,
              winnerId: homeScore > awayScore ? g.homeTeamId : g.awayTeamId,
            };
          });
          return { bracket: { ...state.bracket, games } };
        });
      },

      advanceRound: () => {
        set(state => {
          if (!state.bracket) return state;
          const { currentRound, games, afcSeeds, nfcSeeds } = state.bracket;

          const wcGames = games.filter(g => g.round === 'wildcard');
          const allPlayed = wcGames.every(g => g.played);
          if (!allPlayed && currentRound === 'wildcard') return state;

          let newGames: PlayoffGame[] = [...games];
          let nextRound: PlayoffRound = currentRound;

          if (currentRound === 'wildcard') {
            // Build divisional: 1-seed vs lowest remaining, etc.
            const afcWinners = wcGames.filter(g => g.conference === 'AFC').map(g => g.winnerId!).filter(Boolean);
            const nfcWinners = wcGames.filter(g => g.conference === 'NFC').map(g => g.winnerId!).filter(Boolean);

            // 1 seed hosts lowest winner, 2 seed hosts next
            newGames = newGames.concat([
              { id: 'afc_div_0', round: 'divisional', conference: 'AFC', homeTeamId: afcSeeds[0], awayTeamId: afcWinners[2] || afcWinners[0], homeScore: 0, awayScore: 0, played: false, winnerId: null, slot: 0 },
              { id: 'afc_div_1', round: 'divisional', conference: 'AFC', homeTeamId: afcSeeds[1], awayTeamId: afcWinners[1] || afcWinners[0], homeScore: 0, awayScore: 0, played: false, winnerId: null, slot: 1 },
              { id: 'nfc_div_0', round: 'divisional', conference: 'NFC', homeTeamId: nfcSeeds[0], awayTeamId: nfcWinners[2] || nfcWinners[0], homeScore: 0, awayScore: 0, played: false, winnerId: null, slot: 2 },
              { id: 'nfc_div_1', round: 'divisional', conference: 'NFC', homeTeamId: nfcSeeds[1], awayTeamId: nfcWinners[1] || nfcWinners[0], homeScore: 0, awayScore: 0, played: false, winnerId: null, slot: 3 },
            ]);
            nextRound = 'divisional';
          } else if (currentRound === 'divisional') {
            const divGames = games.filter(g => g.round === 'divisional');
            const afcDiv = divGames.filter(g => g.conference === 'AFC').map(g => g.winnerId!);
            const nfcDiv = divGames.filter(g => g.conference === 'NFC').map(g => g.winnerId!);
            newGames = newGames.concat([
              { id: 'afc_conf', round: 'conference', conference: 'AFC', homeTeamId: afcDiv[0] || afcSeeds[0], awayTeamId: afcDiv[1] || afcSeeds[1], homeScore: 0, awayScore: 0, played: false, winnerId: null, slot: 0 },
              { id: 'nfc_conf', round: 'conference', conference: 'NFC', homeTeamId: nfcDiv[0] || nfcSeeds[0], awayTeamId: nfcDiv[1] || nfcSeeds[1], homeScore: 0, awayScore: 0, played: false, winnerId: null, slot: 1 },
            ]);
            nextRound = 'conference';
          } else if (currentRound === 'conference') {
            const confGames = games.filter(g => g.round === 'conference');
            const afcChamp = confGames.find(g => g.conference === 'AFC')?.winnerId || afcSeeds[0];
            const nfcChamp = confGames.find(g => g.conference === 'NFC')?.winnerId || nfcSeeds[0];
            newGames = newGames.concat([
              { id: 'superbowl', round: 'superbowl', conference: 'Super Bowl', homeTeamId: afcChamp, awayTeamId: nfcChamp, homeScore: 0, awayScore: 0, played: false, winnerId: null, slot: 0 },
            ]);
            nextRound = 'superbowl';
          } else if (currentRound === 'superbowl') {
            const sb = games.find(g => g.round === 'superbowl');
            if (sb?.played) {
              return { bracket: { ...state.bracket, games: newGames, champion: sb.winnerId, currentRound: 'superbowl' } };
            }
          }

          return { bracket: { ...state.bracket, games: newGames, currentRound: nextRound } };
        });
      },

      resetPlayoffs: () => set({ bracket: null, userTeamId: null }),
    }),
    { name: 'playoff-store' }
  )
);
