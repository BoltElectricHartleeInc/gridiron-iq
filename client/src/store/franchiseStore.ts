import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FranchisePlayer {
  id: string;
  name: string;
  position: string;
  age: number;
  rating: number;
  salary: number; // millions/year
  yearsLeft: number;
  isFreeAgent?: boolean;
}

export interface FranchiseYear {
  year: number;
  wins: number;
  losses: number;
  playoffResult: string | null; // 'WC', 'DIV', 'CONF', 'SB_LOSS', 'CHAMPION', null
  draftPicks: string[]; // descriptions like "Round 1 Pick 15"
}

interface FranchiseState {
  teamId: string | null;
  teamName: string;
  year: number;
  roster: FranchisePlayer[];
  salaryCap: number; // 255 million
  usedCap: number;
  history: FranchiseYear[];
  draftCapital: string[]; // future picks

  startFranchise: (teamId: string, teamName: string) => void;
  signPlayer: (player: FranchisePlayer) => void;
  releasePlayer: (playerId: string) => void;
  advanceYear: (wins: number, losses: number, playoffResult: string | null) => void;
  resetFranchise: () => void;
}

function generateStarterRoster(teamId: string): FranchisePlayer[] {
  const positions = ['QB', 'RB', 'WR', 'WR', 'TE', 'OL', 'OL', 'DE', 'DT', 'LB', 'CB', 'S'];
  const names = [
    ['Marcus Johnson', 'Tyler Williams', 'Jordan Davis', 'Casey Thompson'],
    ['DeShawn Carter', 'Malik Robinson', 'Chris Evans', 'Tre Brown'],
    ['Antoine Walker', 'Devon Harris', 'Darius King', 'Jamal Thompson'],
  ];

  return positions.map((pos, i) => {
    const nameArr = names[i % 3];
    const name = nameArr[i % 4];
    const rating = 72 + Math.floor(Math.random() * 20);
    const salary = pos === 'QB' ? 35 + Math.random() * 25
      : pos === 'WR' || pos === 'CB' ? 10 + Math.random() * 15
      : 5 + Math.random() * 12;

    return {
      id: `${teamId}_${pos}_${i}`,
      name: `${name} ${i + 1}`,
      position: pos,
      age: 23 + Math.floor(Math.random() * 8),
      rating,
      salary: Math.round(salary * 10) / 10,
      yearsLeft: 1 + Math.floor(Math.random() * 4),
    };
  });
}

export const useFranchiseStore = create<FranchiseState>()(
  persist(
    (set, get) => ({
      teamId: null,
      teamName: '',
      year: 2026,
      roster: [],
      salaryCap: 255,
      usedCap: 0,
      history: [],
      draftCapital: ['2026 R1', '2026 R2', '2026 R3', '2026 R4', '2026 R5', '2026 R6', '2026 R7'],

      startFranchise: (teamId: string, teamName: string) => {
        const roster = generateStarterRoster(teamId);
        const usedCap = roster.reduce((sum, p) => sum + p.salary, 0);
        set({
          teamId,
          teamName,
          year: 2026,
          roster,
          usedCap: Math.round(usedCap * 10) / 10,
          history: [],
          draftCapital: ['2026 R1', '2026 R2', '2026 R3', '2026 R4', '2026 R5', '2026 R6', '2026 R7'],
        });
      },

      signPlayer: (player: FranchisePlayer) => {
        set(state => {
          if (state.usedCap + player.salary > state.salaryCap) return state;
          return {
            roster: [...state.roster, player],
            usedCap: Math.round((state.usedCap + player.salary) * 10) / 10,
          };
        });
      },

      releasePlayer: (playerId: string) => {
        set(state => {
          const player = state.roster.find(p => p.id === playerId);
          if (!player) return state;
          return {
            roster: state.roster.filter(p => p.id !== playerId),
            usedCap: Math.round((state.usedCap - player.salary) * 10) / 10,
          };
        });
      },

      advanceYear: (wins, losses, playoffResult) => {
        set(state => ({
          year: state.year + 1,
          history: [...state.history, { year: state.year, wins, losses, playoffResult, draftPicks: [...state.draftCapital] }],
          draftCapital: [`${state.year + 1} R1`, `${state.year + 1} R2`, `${state.year + 1} R3`, `${state.year + 1} R4`, `${state.year + 1} R5`, `${state.year + 1} R6`, `${state.year + 1} R7`],
          roster: state.roster.map(p => ({ ...p, age: p.age + 1, yearsLeft: Math.max(0, p.yearsLeft - 1) })),
        }));
      },

      resetFranchise: () => set({ teamId: null, teamName: '', year: 2026, roster: [], usedCap: 0, history: [], draftCapital: [] }),
    }),
    { name: 'franchise-store' }
  )
);
