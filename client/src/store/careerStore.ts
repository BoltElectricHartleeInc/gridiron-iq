import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CareerPosition = 'QB' | 'RB' | 'WR' | 'CB' | 'DE' | 'LB';
export type CareerStage =
  | 'highschool'
  | 'college_freshman'
  | 'college_sophomore'
  | 'college_junior'
  | 'college_senior'
  | 'nfl_draft'
  | 'nfl_rookie'
  | 'nfl_year2'
  | 'nfl_year3plus'
  | 'retired';

export interface CareerPlayer {
  id: string;
  name: string;
  position: CareerPosition;

  // Ratings
  speed: number;
  strength: number;
  agility: number;
  awareness: number;
  catching?: number;
  throwing?: number;
  coverage?: number;
  passRush?: number;
  tackle?: number;

  overallRating: number;

  // Career metadata
  age: number;
  stage: CareerStage;
  collegeName: string;
  collegeId: string;
  nflTeamId: string | null;
  nflTeamName: string | null;

  // Stats
  careerStats: Record<string, number>;
  seasonStats: Record<string, number>;

  // Awards
  awards: string[];

  // Legacy
  legacyScore: number;
  draftPickNumber: number | null;
  draftYear: number | null;

  // Development
  experiencePoints: number;
  nextLevelXP: number;
  attributePoints: number;
}

interface CareerState {
  player: CareerPlayer | null;
  currentGameResult: {
    playerStats: Record<string, number>;
    teamWon: boolean;
    xpEarned: number;
  } | null;

  createPlayer: (
    name: string,
    position: CareerPosition,
    hsStars: 1 | 2 | 3 | 4 | 5,
    collegeId: string,
    collegeName: string
  ) => void;
  recordGamePerformance: (stats: Record<string, number>, teamWon: boolean) => void;
  spendAttributePoint: (attribute: string) => void;
  advanceSeason: () => void;
  enterNFLDraft: (pickNumber: number, teamId: string, teamName: string) => void;
  addAward: (award: string) => void;
  resetCareer: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Base attribute ranges per position, scaled by star rating */
function buildBaseRatings(
  position: CareerPosition,
  stars: 1 | 2 | 3 | 4 | 5
): Partial<CareerPlayer> {
  const starBonus = (stars - 1) * 6; // 0, 6, 12, 18, 24 bonus

  const clamp = (v: number) => Math.min(99, Math.max(40, v));
  const base = (low: number) => clamp(low + starBonus);

  switch (position) {
    case 'QB':
      return {
        speed: base(55),
        strength: base(50),
        agility: base(55),
        awareness: base(58),
        throwing: base(60),
      };
    case 'RB':
      return {
        speed: base(63),
        strength: base(56),
        agility: base(62),
        awareness: base(52),
        catching: base(50),
      };
    case 'WR':
      return {
        speed: base(65),
        strength: base(48),
        agility: base(63),
        awareness: base(52),
        catching: base(60),
      };
    case 'CB':
      return {
        speed: base(63),
        strength: base(50),
        agility: base(61),
        awareness: base(54),
        coverage: base(58),
        tackle: base(50),
      };
    case 'DE':
      return {
        speed: base(58),
        strength: base(62),
        agility: base(56),
        awareness: base(52),
        passRush: base(58),
        tackle: base(56),
      };
    case 'LB':
      return {
        speed: base(58),
        strength: base(59),
        agility: base(57),
        awareness: base(56),
        tackle: base(58),
      };
  }
}

/** Overall rating calculation weighted by position */
function calcOverall(player: Partial<CareerPlayer>): number {
  const pos = player.position;
  const s = (v?: number) => v ?? 50;

  let total = 0;
  switch (pos) {
    case 'QB':
      total =
        s(player.throwing) * 0.4 +
        s(player.awareness) * 0.3 +
        s(player.speed) * 0.15 +
        s(player.agility) * 0.15;
      break;
    case 'RB':
      total =
        s(player.speed) * 0.35 +
        s(player.agility) * 0.25 +
        s(player.strength) * 0.2 +
        s(player.catching) * 0.1 +
        s(player.awareness) * 0.1;
      break;
    case 'WR':
      total =
        s(player.speed) * 0.3 +
        s(player.catching) * 0.35 +
        s(player.agility) * 0.2 +
        s(player.awareness) * 0.15;
      break;
    case 'CB':
      total =
        s(player.coverage) * 0.35 +
        s(player.speed) * 0.3 +
        s(player.agility) * 0.2 +
        s(player.tackle) * 0.1 +
        s(player.awareness) * 0.05;
      break;
    case 'DE':
      total =
        s(player.passRush) * 0.4 +
        s(player.strength) * 0.25 +
        s(player.speed) * 0.15 +
        s(player.tackle) * 0.1 +
        s(player.awareness) * 0.1;
      break;
    case 'LB':
      total =
        s(player.tackle) * 0.35 +
        s(player.strength) * 0.2 +
        s(player.speed) * 0.2 +
        s(player.awareness) * 0.15 +
        s(player.agility) * 0.1;
      break;
    default:
      total = (s(player.speed) + s(player.strength) + s(player.agility) + s(player.awareness)) / 4;
  }

  return Math.round(Math.min(99, Math.max(40, total)));
}

/** XP thresholds per career stage */
function xpThreshold(stage: CareerStage): number {
  const map: Record<CareerStage, number> = {
    highschool: 200,
    college_freshman: 400,
    college_sophomore: 500,
    college_junior: 600,
    college_senior: 700,
    nfl_draft: 800,
    nfl_rookie: 1000,
    nfl_year2: 1200,
    nfl_year3plus: 1500,
    retired: 9999,
  };
  return map[stage] ?? 500;
}

/** XP earned for a game based on raw stats and position */
function computeXP(stats: Record<string, number>, position: CareerPosition, teamWon: boolean): number {
  let xp = teamWon ? 40 : 20;

  switch (position) {
    case 'QB':
      xp += (stats.passingYards ?? 0) * 0.05;
      xp += (stats.touchdowns ?? 0) * 15;
      xp -= (stats.interceptions ?? 0) * 10;
      break;
    case 'RB':
      xp += (stats.rushingYards ?? 0) * 0.07;
      xp += (stats.touchdowns ?? 0) * 15;
      break;
    case 'WR':
      xp += (stats.receivingYards ?? 0) * 0.07;
      xp += (stats.touchdowns ?? 0) * 15;
      xp += (stats.receptions ?? 0) * 3;
      break;
    case 'CB':
      xp += (stats.tackles ?? 0) * 5;
      xp += (stats.interceptions ?? 0) * 20;
      xp += (stats.pbus ?? 0) * 8;
      break;
    case 'DE':
      xp += (stats.sacks ?? 0) * 20;
      xp += (stats.tackles ?? 0) * 5;
      xp += (stats.tfls ?? 0) * 10;
      break;
    case 'LB':
      xp += (stats.tackles ?? 0) * 5;
      xp += (stats.sacks ?? 0) * 20;
      xp += (stats.tfls ?? 0) * 10;
      break;
  }

  return Math.round(Math.max(10, xp));
}

/** Stage progression order */
const STAGE_ORDER: CareerStage[] = [
  'highschool',
  'college_freshman',
  'college_sophomore',
  'college_junior',
  'college_senior',
  'nfl_draft',
  'nfl_rookie',
  'nfl_year2',
  'nfl_year3plus',
  'retired',
];

function nextStage(current: CareerStage): CareerStage {
  const idx = STAGE_ORDER.indexOf(current);
  if (idx < 0 || idx >= STAGE_ORDER.length - 1) return 'retired';
  return STAGE_ORDER[idx + 1];
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCareerStore = create<CareerState>()(
  persist(
    (set, get) => ({
      player: null,
      currentGameResult: null,

      createPlayer(name, position, hsStars, collegeId, collegeName) {
        const baseRatings = buildBaseRatings(position, hsStars);
        const partial: Partial<CareerPlayer> = {
          ...baseRatings,
          position,
          name,
        };
        const ovr = calcOverall(partial);

        const player: CareerPlayer = {
          id: uid(),
          name,
          position,
          speed: baseRatings.speed ?? 60,
          strength: baseRatings.strength ?? 60,
          agility: baseRatings.agility ?? 60,
          awareness: baseRatings.awareness ?? 60,
          ...(baseRatings.catching !== undefined && { catching: baseRatings.catching }),
          ...(baseRatings.throwing !== undefined && { throwing: baseRatings.throwing }),
          ...(baseRatings.coverage !== undefined && { coverage: baseRatings.coverage }),
          ...(baseRatings.passRush !== undefined && { passRush: baseRatings.passRush }),
          ...(baseRatings.tackle !== undefined && { tackle: baseRatings.tackle }),
          overallRating: ovr,
          age: 17,
          stage: 'highschool',
          collegeName,
          collegeId,
          nflTeamId: null,
          nflTeamName: null,
          careerStats: {},
          seasonStats: {},
          awards: [],
          legacyScore: 0,
          draftPickNumber: null,
          draftYear: null,
          experiencePoints: 0,
          nextLevelXP: xpThreshold('highschool'),
          attributePoints: hsStars >= 4 ? 2 : hsStars === 3 ? 1 : 0,
        };

        set({ player });
      },

      recordGamePerformance(stats, teamWon) {
        const { player } = get();
        if (!player) return;

        const xpEarned = computeXP(stats, player.position, teamWon);
        let newXP = player.experiencePoints + xpEarned;
        let newNextLevelXP = player.nextLevelXP;
        let newAttributePoints = player.attributePoints;
        let newOverall = player.overallRating;

        // Level up while XP exceeds threshold
        while (newXP >= newNextLevelXP) {
          newXP -= newNextLevelXP;
          newAttributePoints += 1;
          newNextLevelXP = Math.round(newNextLevelXP * 1.15);
        }

        // Merge season and career stats
        const updatedSeasonStats = { ...player.seasonStats };
        const updatedCareerStats = { ...player.careerStats };
        for (const [key, val] of Object.entries(stats)) {
          updatedSeasonStats[key] = (updatedSeasonStats[key] ?? 0) + val;
          updatedCareerStats[key] = (updatedCareerStats[key] ?? 0) + val;
        }

        // Legacy score nudge
        let legacyDelta = xpEarned * 0.05;
        if (teamWon) legacyDelta += 2;

        set({
          player: {
            ...player,
            experiencePoints: newXP,
            nextLevelXP: newNextLevelXP,
            attributePoints: newAttributePoints,
            overallRating: newOverall,
            seasonStats: updatedSeasonStats,
            careerStats: updatedCareerStats,
            legacyScore: Math.min(1000, player.legacyScore + legacyDelta),
          },
          currentGameResult: { playerStats: stats, teamWon, xpEarned },
        });
      },

      spendAttributePoint(attribute) {
        const { player } = get();
        if (!player || player.attributePoints <= 0) return;

        // Boost amount: 1-3 points depending on current value
        const current = (player as unknown as Record<string, unknown>)[attribute];
        if (current === undefined || typeof current !== 'number') return;

        const boost = current < 70 ? 3 : current < 85 ? 2 : 1;
        const newVal = Math.min(99, current + boost);

        const updated: CareerPlayer = {
          ...player,
          [attribute]: newVal,
          attributePoints: player.attributePoints - 1,
        };
        updated.overallRating = calcOverall(updated);

        set({ player: updated });
      },

      advanceSeason() {
        const { player } = get();
        if (!player) return;

        const newStage = nextStage(player.stage);

        set({
          player: {
            ...player,
            stage: newStage,
            age: player.age + 1,
            seasonStats: {},
            legacyScore: Math.min(1000, player.legacyScore + 5),
          },
        });
      },

      enterNFLDraft(pickNumber, teamId, teamName) {
        const { player } = get();
        if (!player) return;

        // Legacy boost based on pick position
        const draftLegacyBoost = pickNumber <= 10 ? 150 : pickNumber <= 32 ? 100 : pickNumber <= 100 ? 60 : 30;

        set({
          player: {
            ...player,
            nflTeamId: teamId,
            nflTeamName: teamName,
            draftPickNumber: pickNumber,
            draftYear: 2026,
            stage: 'nfl_rookie',
            age: player.age,
            legacyScore: Math.min(1000, player.legacyScore + draftLegacyBoost),
            attributePoints: player.attributePoints + 3, // draft bonus
          },
        });
      },

      addAward(award) {
        const { player } = get();
        if (!player) return;
        if (player.awards.includes(award)) return;

        const awardLegacy: Record<string, number> = {
          'Heisman Trophy': 200,
          'All-American': 80,
          'Conference Player of Year': 60,
          'Pro Bowl': 100,
          'All-Pro': 150,
          'Super Bowl MVP': 250,
          'NFL MVP': 250,
          'Defensive Player of Year': 200,
          'Offensive Player of Year': 200,
        };

        const legacyBoost = awardLegacy[award] ?? 30;

        set({
          player: {
            ...player,
            awards: [...player.awards, award],
            legacyScore: Math.min(1000, player.legacyScore + legacyBoost),
          },
        });
      },

      resetCareer() {
        set({ player: null, currentGameResult: null });
      },
    }),
    {
      name: 'career-store',
      version: 1,
    }
  )
);
