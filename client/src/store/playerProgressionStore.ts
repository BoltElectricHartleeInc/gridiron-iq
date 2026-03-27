import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DevelopmentTrait = 'normal' | 'star' | 'superstar' | 'xfactor';

export interface PlayerDevelopment {
  playerId: string;
  playerName: string;
  position: string;
  age: number;
  rating: number;
  developmentTrait: DevelopmentTrait;

  trainingAllocation: {
    physical: number;      // speed, strength, agility
    technique: number;     // position-specific skill
    mentalGame: number;    // awareness, clutch
    conditioning: number;  // stamina, injury resistance
  };

  breakoutScenario: {
    description: string;
    targetAttribute: string;
    triggerCondition: string;
    triggered: boolean;
    completed: boolean;
  } | null;

  ratingHistory: { week: number; rating: number; change: number; reason: string }[];

  regressionStartAge: number;
}

interface ProgressionState {
  playerDevelopments: Record<string, PlayerDevelopment>;
  weeklyBreakoutCandidates: string[];

  initializePlayer: (
    playerId: string,
    name: string,
    position: string,
    age: number,
    rating: number,
    trait?: DevelopmentTrait,
  ) => void;
  setTrainingAllocation: (
    playerId: string,
    allocation: PlayerDevelopment['trainingAllocation'],
  ) => void;
  processWeeklyDevelopment: (week: number) => Record<string, number>;
  triggerBreakoutScenario: (playerId: string) => void;
  completeBreakout: (playerId: string) => number;
  generateBreakoutScenarios: (playerIds: string[]) => void;
  processSeasonRegression: () => string[];
}

// ─── Position-based regression age ───────────────────────────────────────────

function getRegressionStartAge(position: string): number {
  switch (position) {
    case 'QB':         return 35;
    case 'OL':
    case 'LT':
    case 'RG':
    case 'C':          return 34;
    case 'WR':
    case 'TE':         return 32;
    case 'DE':
    case 'DT':
    case 'LB':         return 31;
    case 'CB':
    case 'S':          return 30;
    case 'RB':         return 30;
    default:           return 31;
  }
}

// ─── Breakout scenarios ───────────────────────────────────────────────────────

interface BreakoutTemplate {
  description: string;
  targetAttribute: string;
  triggerCondition: string;
}

function getBreakoutTemplates(position: string): BreakoutTemplate[] {
  switch (position) {
    case 'QB':
      return [
        { description: 'Has not thrown an incompletion in 8 consecutive plays', targetAttribute: 'accuracy', triggerCondition: 'Complete 8 passes in a row without an incompletion' },
        { description: 'Has been under pressure on 5 straight snaps without a sack', targetAttribute: 'pocket_presence', triggerCondition: 'Escape pressure 5 consecutive times without a sack' },
        { description: 'Has converted 3rd and long 4 times this game', targetAttribute: 'clutch', triggerCondition: 'Convert 4 third-and-long situations in a single game' },
      ];
    case 'WR':
      return [
        { description: 'Has been open on 6+ consecutive passing plays', targetAttribute: 'route_running', triggerCondition: 'Beat coverage on 6 straight routes' },
        { description: 'Has not dropped a catchable ball all game', targetAttribute: 'catching', triggerCondition: 'Catch every targeted ball in the game (min 5 targets)' },
        { description: 'Has created separation of 3+ yards on every route', targetAttribute: 'speed', triggerCondition: 'Generate elite separation on 5+ routes' },
      ];
    case 'RB':
      return [
        { description: 'Has broken 3 tackles on a single run', targetAttribute: 'break_tackle', triggerCondition: 'Break 3 tackles on one carry' },
        { description: 'Has averaged 7+ YPC through the first half', targetAttribute: 'elusiveness', triggerCondition: 'Maintain 7+ yards per carry through half' },
        { description: 'Has converted 4 rushes of 10+ yards', targetAttribute: 'burst', triggerCondition: 'Record 4 carries of 10+ yards' },
      ];
    case 'TE':
      return [
        { description: 'Has been targeted in coverage 4 times with no pick', targetAttribute: 'route_running', triggerCondition: '4 contested catches in coverage' },
        { description: 'Has gained 10+ YAC on 3 consecutive receptions', targetAttribute: 'yac', triggerCondition: 'Record 3 straight catches with 10+ yards after catch' },
      ];
    case 'DE':
    case 'OLB':
      return [
        { description: 'Has registered a TFL or QB hurry on back-to-back snaps', targetAttribute: 'pass_rush', triggerCondition: 'Pressure or TFL on 2 consecutive pass rush snaps' },
        { description: 'Has beaten the same blocker 3 straight times', targetAttribute: 'finesse_move', triggerCondition: 'Win the 1-on-1 vs same OL 3 times in a row' },
      ];
    case 'DT':
      return [
        { description: 'Has collapsed the pocket on 4 straight pass rush snaps', targetAttribute: 'power_move', triggerCondition: 'Collapse pocket or push tackle back 4 times in a row' },
        { description: 'Has been double-teamed on 5 consecutive plays', targetAttribute: 'dominance', triggerCondition: 'Draw double team on 5 straight snaps' },
      ];
    case 'LB':
      return [
        { description: 'Has registered a TFL or hurry on back-to-back plays', targetAttribute: 'instincts', triggerCondition: 'TFL or hurry on 2 consecutive plays' },
        { description: 'Has made 5+ tackles in a row without a miss', targetAttribute: 'tackling', triggerCondition: 'Make 5 consecutive tackles without a miss' },
      ];
    case 'CB':
      return [
        { description: 'Has been tested in coverage 5 times without a catch allowed', targetAttribute: 'coverage', triggerCondition: 'Allow zero completions in 5 coverage targets' },
        { description: 'Has held his assignment under 10 yards total receiving', targetAttribute: 'man_coverage', triggerCondition: 'Hold assignment to under 10 receiving yards all game' },
      ];
    case 'S':
      return [
        { description: 'Has delivered a hit on 3 straight run plays to stop for loss or no gain', targetAttribute: 'hitting', triggerCondition: 'Stuff 3 consecutive runs at or behind the line' },
        { description: 'Has broken up 2 passes in coverage and added a tackle for loss', targetAttribute: 'awareness', triggerCondition: 'PBU + TFL in the same half' },
      ];
    default:
      return [
        { description: 'Has performed at an elite level for 5 consecutive plays', targetAttribute: 'overall', triggerCondition: 'Grade as elite on 5 straight snaps' },
      ];
  }
}

// ─── Weekly development logic ─────────────────────────────────────────────────

function rollDevelopment(
  player: PlayerDevelopment,
  week: number,
): { change: number; reason: string } {
  const { age, rating, developmentTrait, trainingAllocation, breakoutScenario, regressionStartAge } = player;

  // Breakout bonus
  if (breakoutScenario?.triggered && !breakoutScenario.completed) {
    const bonus = 3 + Math.floor(Math.random() * 6); // 3-8
    return { change: bonus, reason: 'Breakout scenario completed' };
  }

  // Age penalty
  const ageOverRegression = Math.max(0, age - regressionStartAge);

  // Technique allocation bonus: 0-10% boost to gain chances
  const techniqueBonus = (trainingAllocation.technique / 100) * 0.10;
  const conditionBonus = (trainingAllocation.conditioning / 100) * 0.05;
  const physBonus      = (trainingAllocation.physical / 100) * 0.05;

  // Rating ceiling dampening: elite players gain slower
  const ceilingFactor = rating >= 95 ? 0.3 : rating >= 90 ? 0.6 : rating >= 85 ? 0.8 : 1.0;

  let roll = Math.random();

  // Apply trait multipliers
  switch (developmentTrait) {
    case 'xfactor':
    case 'superstar': {
      const gain3Chance  = 0.10;
      const gain2Chance  = 0.25;
      const gain1Chance  = 0.50;
      const loseChance   = ageOverRegression > 0 ? 0.05 + ageOverRegression * 0.02 : 0;

      const adjGain3 = gain3Chance * ceilingFactor * (developmentTrait === 'xfactor' ? 2.0 : 1.5);
      const adjGain2 = gain2Chance * ceilingFactor;
      const adjGain1 = gain1Chance * ceilingFactor + techniqueBonus + physBonus;

      if (roll < adjGain3) return { change: 3, reason: `${developmentTrait === 'xfactor' ? 'X-Factor' : 'Superstar'} breakout week` };
      roll -= adjGain3;
      if (roll < adjGain2) return { change: 2, reason: 'Elite development week' };
      roll -= adjGain2;
      if (roll < adjGain1) return { change: 1, reason: 'Solid progression' };
      roll -= adjGain1;
      if (roll < loseChance) return { change: -1, reason: 'Age-related decline' };
      return { change: 0, reason: 'Maintained current level' };
    }

    case 'star': {
      const gain2Chance = 0.15 * ceilingFactor + techniqueBonus;
      const gain1Chance = 0.40 * ceilingFactor + physBonus + conditionBonus;
      const loseChance  = ageOverRegression > 0 ? 0.02 + ageOverRegression * 0.015 : 0;

      if (roll < gain2Chance) return { change: 2, reason: 'Star player strong week' };
      roll -= gain2Chance;
      if (roll < gain1Chance) return { change: 1, reason: 'Star development' };
      roll -= gain1Chance;
      if (roll < loseChance) return { change: -1, reason: 'Age-related regression' };
      return { change: 0, reason: 'Held steady' };
    }

    default: { // normal
      const gain1Chance = (0.30 + techniqueBonus + physBonus) * ceilingFactor;
      const loseChance  = ageOverRegression > 0 ? 0.05 + ageOverRegression * 0.03 : 0.05;
      // Conditioning reduces injury/regression chance
      const adjustedLose = Math.max(0, loseChance - conditionBonus);

      if (roll < gain1Chance) return { change: 1, reason: 'Regular development' };
      roll -= gain1Chance;
      if (roll < adjustedLose) return { change: -1, reason: ageOverRegression > 0 ? 'Age-related decline' : 'Off week' };
      return { change: 0, reason: 'No change this week' };
    }
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePlayerProgressionStore = create<ProgressionState>()(
  persist(
    (set, get) => ({
      playerDevelopments: {},
      weeklyBreakoutCandidates: [],

      initializePlayer: (playerId, name, position, age, rating, trait = 'normal') => {
        const existing = get().playerDevelopments[playerId];
        if (existing) return; // already initialized

        const regressionStartAge = getRegressionStartAge(position);

        const newPlayer: PlayerDevelopment = {
          playerId,
          playerName: name,
          position,
          age,
          rating,
          developmentTrait: trait,
          trainingAllocation: {
            physical:     25,
            technique:    25,
            mentalGame:   25,
            conditioning: 25,
          },
          breakoutScenario: null,
          ratingHistory: [],
          regressionStartAge,
        };

        set(state => ({
          playerDevelopments: { ...state.playerDevelopments, [playerId]: newPlayer },
        }));
      },

      setTrainingAllocation: (playerId, allocation) => {
        // Validate that the values sum to 100
        const total = allocation.physical + allocation.technique + allocation.mentalGame + allocation.conditioning;
        if (Math.abs(total - 100) > 1) {
          console.warn(`Training allocation must sum to 100 (got ${total})`);
          return;
        }

        set(state => {
          const player = state.playerDevelopments[playerId];
          if (!player) return state;
          return {
            playerDevelopments: {
              ...state.playerDevelopments,
              [playerId]: { ...player, trainingAllocation: allocation },
            },
          };
        });
      },

      processWeeklyDevelopment: (week: number) => {
        const { playerDevelopments } = get();
        const changes: Record<string, number> = {};
        const updatedDevelopments = { ...playerDevelopments };

        for (const [playerId, player] of Object.entries(playerDevelopments)) {
          const { change, reason } = rollDevelopment(player, week);
          const newRating = Math.max(40, Math.min(99, player.rating + change));
          changes[playerId] = change;

          updatedDevelopments[playerId] = {
            ...player,
            rating: newRating,
            ratingHistory: [
              ...player.ratingHistory,
              { week, rating: newRating, change, reason },
            ],
          };
        }

        set({ playerDevelopments: updatedDevelopments });
        return changes;
      },

      triggerBreakoutScenario: (playerId: string) => {
        set(state => {
          const player = state.playerDevelopments[playerId];
          if (!player || !player.breakoutScenario || player.breakoutScenario.triggered) return state;
          return {
            playerDevelopments: {
              ...state.playerDevelopments,
              [playerId]: {
                ...player,
                breakoutScenario: { ...player.breakoutScenario, triggered: true },
              },
            },
          };
        });
      },

      completeBreakout: (playerId: string): number => {
        const player = get().playerDevelopments[playerId];
        if (!player || !player.breakoutScenario?.triggered) return 0;

        const boost = 3 + Math.floor(Math.random() * 6); // 3-8

        set(state => {
          const p = state.playerDevelopments[playerId];
          if (!p) return state;
          const newRating = Math.min(99, p.rating + boost);
          return {
            playerDevelopments: {
              ...state.playerDevelopments,
              [playerId]: {
                ...p,
                rating: newRating,
                breakoutScenario: p.breakoutScenario
                  ? { ...p.breakoutScenario, completed: true }
                  : null,
                ratingHistory: [
                  ...p.ratingHistory,
                  { week: 0, rating: newRating, change: boost, reason: 'Breakout scenario completed!' },
                ],
              },
            },
          };
        });

        return boost;
      },

      generateBreakoutScenarios: (playerIds: string[]) => {
        const { playerDevelopments } = get();
        const updates: Record<string, PlayerDevelopment> = {};
        const candidates: string[] = [];

        for (const playerId of playerIds) {
          const player = playerDevelopments[playerId];
          if (!player) continue;

          // Eligibility: rating 70-92, not already in breakout, younger players more likely
          const ageEligible = player.age <= 28;
          const ratingEligible = player.rating >= 70 && player.rating <= 92;
          const traitBoost = player.developmentTrait === 'xfactor' ? 0.30
            : player.developmentTrait === 'superstar' ? 0.20
            : player.developmentTrait === 'star' ? 0.12
            : 0.06;

          const chance = (ageEligible ? 0.08 : 0.04) + (ratingEligible ? traitBoost : 0);

          if (Math.random() < chance && !player.breakoutScenario) {
            const templates = getBreakoutTemplates(player.position);
            const template = templates[Math.floor(Math.random() * templates.length)];
            updates[playerId] = {
              ...player,
              breakoutScenario: {
                description:      template.description,
                targetAttribute:  template.targetAttribute,
                triggerCondition: template.triggerCondition,
                triggered:        false,
                completed:        false,
              },
            };
            candidates.push(playerId);
          }
        }

        set(state => ({
          playerDevelopments: { ...state.playerDevelopments, ...updates },
          weeklyBreakoutCandidates: candidates,
        }));
      },

      processSeasonRegression: (): string[] => {
        const { playerDevelopments } = get();
        const regressed: string[] = [];
        const updates: Record<string, PlayerDevelopment> = {};

        for (const [playerId, player] of Object.entries(playerDevelopments)) {
          const age = player.age + 1; // they've aged one year
          const overRegression = Math.max(0, age - player.regressionStartAge);

          let regAmount = 0;
          if (overRegression >= 5)      regAmount = 2 + Math.floor(Math.random() * 2); // -2 to -3
          else if (overRegression >= 3) regAmount = 1 + (Math.random() < 0.5 ? 1 : 0); // -1 to -2
          else if (overRegression >= 1) regAmount = Math.random() < 0.50 ? 1 : 0;       // 50% chance -1
          else                          regAmount = 0;

          // Stars/Superstars regress slightly slower
          if (player.developmentTrait === 'star')      regAmount = Math.max(0, regAmount - 1);
          if (player.developmentTrait === 'superstar' || player.developmentTrait === 'xfactor')
                                                        regAmount = Math.max(0, regAmount - 2);

          const newRating = Math.max(40, player.rating - regAmount);

          updates[playerId] = {
            ...player,
            age,
            rating: newRating,
            ratingHistory: regAmount > 0
              ? [...player.ratingHistory, {
                  week:   0,
                  rating: newRating,
                  change: -regAmount,
                  reason: `Off-season regression (Age ${age})`,
                }]
              : player.ratingHistory,
          };

          if (regAmount > 0) regressed.push(playerId);
        }

        set({ playerDevelopments: { ...playerDevelopments, ...updates } });
        return regressed;
      },
    }),
    { name: 'player-progression-store' },
  ),
);
