import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DraftSession, DraftPick, Prospect, NFLTeam, TradePackage, DraftGrade, AITradeOffer, RosterPlayer } from '../types/draft';
import { NFL_TEAMS, TEAMS_BY_DRAFT_ORDER, DRAFT_2026_R1_ORDER, DRAFT_2026_SUBSEQUENT_ORDER } from '../data/teams';
import { PROSPECTS_2026 } from '../data/prospects2026';
import { PROSPECTS_2027 } from '../data/prospects2027';
import { getPickValue, getPicksValue } from '../data/tradeChart';
import { NFL_ROSTERS } from '../data/rosters';

// Generate picks across N rounds using official 2026 NFL Draft order
function generateInitialPicks(rounds: number): DraftPick[] {
  const picks: DraftPick[] = [];
  let overall = 1;

  // Round 1: exact 32-pick official order (includes teams with traded picks)
  // Rounds 2+: all 32 teams once in standings order (snake-style even/odd)
  const r1Order = DRAFT_2026_R1_ORDER;
  const subOrder = DRAFT_2026_SUBSEQUENT_ORDER;

  for (let round = 1; round <= rounds; round++) {
    const order = round === 1
      ? r1Order
      : round % 2 === 0
        ? [...subOrder].reverse()
        : [...subOrder];

    for (let i = 0; i < order.length; i++) {
      const teamId = order[i];
      picks.push({
        overall,
        round,
        pickInRound: i + 1,
        teamId,
        originalTeamId: teamId,
        isUserPick: false,
      });
      overall++;
    }

    // Compensatory picks in rounds 3-7 (top 2 needs teams)
    if (round >= 3) {
      const compTeams = subOrder.slice(0, 2);
      for (const teamId of compTeams) {
        picks.push({
          overall,
          round,
          pickInRound: order.length + 1,
          teamId,
          originalTeamId: teamId,
          isUserPick: false,
        });
        overall++;
      }
    }
  }

  return picks;
}

interface DraftSettings {
  rounds: number;
  simSpeed: number;
  needsWeight: number;
  positionWeight: number;
  tradeFrequency: number;   // 0–100, default 35
  draftCraziness: number;   // 0–100, default 20
  commissionerMode: boolean;
  aiAdvisorEnabled: boolean;
  draftYear: number;
}

interface DraftStore {
  session: DraftSession | null;
  availableProspects: Prospect[];
  grades: DraftGrade[];

  // Draft settings
  rounds: number;
  simSpeed: number;
  needsWeight: number;
  positionWeight: number;
  tradeFrequency: number;
  draftCraziness: number;
  commissionerMode: boolean;
  aiAdvisorEnabled: boolean;
  draftYear: number;

  // Commentary
  commentary: string | null;
  commentaryType: 'user' | 'ai' | null;

  // Comparison
  compareList: Prospect[];

  // AI Trade offer
  incomingTradeOffer: AITradeOffer | null;
  acquiredPlayers: RosterPlayer[];

  // Actions
  setDraftSettings: (settings: Partial<DraftSettings>) => void;
  startDraft: (userTeamId: string) => void;
  makePick: (prospectId: string) => void;
  simulateNextPick: () => void;
  simulateToUserPick: () => void;
  proposeTrade: (pkg: TradePackage) => boolean;
  acceptTrade: (pkg: TradePackage) => void;
  calculateGrades: () => DraftGrade[];
  resetDraft: () => void;
  setCommentary: (text: string | null, type: 'user' | 'ai' | null) => void;
  addToCompare: (prospect: Prospect) => void;
  removeFromCompare: (prospectId: string) => void;
  clearCompare: () => void;
  generateAITradeOffer: () => void;
  respondToAITradeOffer: (accept: boolean) => void;
  dismissTradeOffer: () => void;
}

// Position value tiers for positional scarcity
const POSITION_VALUE: Record<string, number> = {
  QB: 100, EDGE: 90, OT: 85, CB: 82, WR: 80,
  DT: 75, S: 70, LB: 68, TE: 65, OG: 60,
  RB: 55, C: 50, K: 20, P: 20,
};

function getAIPickForTeam(
  team: NFLTeam,
  available: Prospect[],
  draftStyle: string,
  needsWeight: number,
  positionWeight: number,
  draftCraziness: number = 20,
): Prospect {
  const sorted = [...available].sort((a, b) => b.grade - a.grade);
  if (sorted.length === 0) return available[0]; // fallback

  // Score each prospect based on settings
  const scored = sorted.map(prospect => {
    // BPA score (normalized 0-100)
    const bpaScore = prospect.grade;

    // Needs score: bonus if position matches a team need
    const needIndex = team.needs.indexOf(prospect.position);
    const needScore = needIndex === -1 ? 30 : 100 - (needIndex * 20); // top need = 100, 2nd = 80, 3rd = 60

    // Position value score
    const posScore = POSITION_VALUE[prospect.position] ?? 50;

    // Blend: needsWeight controls BPA vs needs, positionWeight adds positional scarcity
    const nw = needsWeight / 100;  // 0 = pure BPA, 1 = pure needs
    const pw = positionWeight / 100;

    const baseScore = bpaScore * (1 - nw) + needScore * nw;
    const finalScore = baseScore * (1 - pw * 0.3) + posScore * (pw * 0.3);

    return { prospect, score: finalScore };
  });

  // Apply draft style modifications
  switch (draftStyle) {
    case 'qb-hunter': {
      const qb = scored.find(s => s.prospect.position === 'QB' && s.prospect.grade >= 70);
      if (qb) {
        qb.score += 25; // Big bonus for QBs
      }
      break;
    }
    case 'trade-down': {
      // Slight randomness in top 3
      const top3 = scored.slice(0, 3);
      const pick = top3[Math.floor(Math.random() * top3.length)];
      return pick.prospect;
    }
    default:
      break;
  }

  scored.sort((a, b) => b.score - a.score);
  // Craziness: randomly pick from top N candidates (higher craziness = wilder picks)
  const poolSize = Math.max(1, Math.round(1 + (draftCraziness / 100) * 4)); // 1–5 candidates
  const pool = scored.slice(0, Math.min(poolSize, scored.length));
  return pool[Math.floor(Math.random() * pool.length)].prospect;
}

function getPickIndicator(pick: DraftPick): 'steal' | 'reach' | 'value' | null {
  if (!pick.prospect) return null;
  const projMidpoint = (pick.prospect.round - 1) * 32 + 16; // midpoint of projected round
  const diff = projMidpoint - pick.overall;
  // STEAL = projected to go much earlier but fell to this pick (diff negative: projMidpoint << overall)
  // REACH = projected to go much later, taken early (diff positive: projMidpoint >> overall)
  if (diff <= -20) return 'steal';
  if (diff >= 20) return 'reach';
  return 'value';
}

function generateCommentary(pick: DraftPick, isUser: boolean): string {
  if (!pick.prospect) return '';
  const team = NFL_TEAMS.find(t => t.id === pick.teamId);
  const indicator = getPickIndicator(pick);

  if (isUser) {
    const assessment = indicator === 'steal'
      ? 'Outstanding value pick!'
      : indicator === 'reach'
        ? 'A bit of a reach, but you know your roster.'
        : 'Solid pick right in the sweet spot.';
    return `YOUR PICK: ${pick.prospect.name} — ${assessment}`;
  }

  const trait = pick.prospect.traits[0] ?? pick.prospect.position;
  const suffix = indicator === 'steal'
    ? 'Excellent value.'
    : indicator === 'reach'
      ? 'Surprising choice.'
      : '';
  return `${team?.city ?? ''} selects ${pick.prospect.name} — ${trait}. ${suffix}`.trim();
}

function calculateTeamGrade(teamId: string, picks: DraftPick[]): DraftGrade {
  const teamPicks = picks.filter(p => p.teamId === teamId && p.prospect);
  if (teamPicks.length === 0) {
    return { teamId, grade: 'C', score: 70, analysis: 'No picks made', picks: [] };
  }

  let score = 0;
  let bestPick: DraftPick | undefined;
  let reach: DraftPick | undefined;
  let steal: DraftPick | undefined;

  for (const pick of teamPicks) {
    const prospect = pick.prospect!;
    const expectedRound = prospect.round;
    const actualRound = pick.round;
    const diff = expectedRound - actualRound;

    if (diff >= 2) {
      score += 20;
      steal = steal || pick;
    } else if (diff === 1) {
      score += 12;
    } else if (diff === 0) {
      score += 8;
    } else if (diff === -1) {
      score += 3;
      reach = reach ?? pick;
    } else {
      score += 0;
      reach = pick;
    }

    if (prospect.grade >= 90) score += 10;
    else if (prospect.grade >= 80) score += 5;

    if (!bestPick || prospect.grade > (bestPick.prospect?.grade ?? 0)) {
      bestPick = pick;
    }
  }

  const avgScore = score / teamPicks.length;
  const gradeMap: Array<[number, DraftGrade['grade']]> = [
    [95, 'A+'], [90, 'A'], [85, 'A-'], [80, 'B+'], [75, 'B'],
    [70, 'B-'], [65, 'C+'], [60, 'C'], [55, 'C-'], [50, 'D'], [0, 'F'],
  ];

  const grade = gradeMap.find(([min]) => avgScore >= min)?.[1] ?? 'F';

  return {
    teamId,
    grade,
    score: Math.round(avgScore),
    analysis: `${teamPicks.length} picks made. ${steal ? `Stole ${steal.prospect!.name} in round ${steal.round}. ` : ''}${reach ? `Reached for ${reach.prospect!.name}. ` : ''}`,
    picks: teamPicks,
    bestPick,
    reach,
    steal,
  };
}

export { getPickIndicator, generateCommentary };

export const useDraftStore = create<DraftStore>()(
  persist(
    (set, get) => ({
      session: null,
      availableProspects: [],
      grades: [],

      // Settings defaults
      rounds: 7,
      simSpeed: 800,
      needsWeight: 50,
      positionWeight: 50,
      tradeFrequency: 35,
      draftCraziness: 20,
      commissionerMode: false,
      aiAdvisorEnabled: true,
      draftYear: 2026,

      // Commentary
      commentary: null,
      commentaryType: null,

      // Comparison
      compareList: [],

      // AI Trade offer
      incomingTradeOffer: null,
      acquiredPlayers: [],

      setDraftSettings: (settings: Partial<DraftSettings>) => {
        set(settings);
      },

      startDraft: (userTeamId: string) => {
        const { rounds, commissionerMode, draftYear } = get();
        const picks = generateInitialPicks(rounds);
        const markedPicks = picks.map(p => ({
          ...p,
          isUserPick: commissionerMode ? true : p.teamId === userTeamId,
        }));

        const prospectPool = draftYear === 2027 ? [...PROSPECTS_2027] : [...PROSPECTS_2026];

        set({
          session: {
            id: crypto.randomUUID(),
            userTeamId,
            leagueMode: 'nfl',
            picks: markedPicks,
            currentPickIndex: 0,
            status: 'drafting',
            tradeHistory: [],
            createdAt: new Date().toISOString(),
          },
          availableProspects: prospectPool,
          grades: [],
          commentary: null,
          commentaryType: null,
        });
      },

      makePick: (prospectId: string) => {
        const { session, availableProspects } = get();
        if (!session || session.status !== 'drafting') return;

        const pick = session.picks[session.currentPickIndex];
        if (!pick?.isUserPick) return;

        const prospect = availableProspects.find(p => p.id === prospectId);
        if (!prospect) return;

        const updatedPicks = [...session.picks];
        updatedPicks[session.currentPickIndex] = { ...pick, prospect };

        const nextIndex = session.currentPickIndex + 1;
        const status = nextIndex >= session.picks.length ? 'complete' : 'drafting';

        const completedPick = { ...pick, prospect };
        const commentaryText = generateCommentary(completedPick, true);

        set({
          session: { ...session, picks: updatedPicks, currentPickIndex: nextIndex, status },
          availableProspects: availableProspects.filter(p => p.id !== prospectId),
          commentary: commentaryText,
          commentaryType: 'user',
        });
      },

      simulateNextPick: () => {
        const { session, availableProspects, needsWeight, positionWeight, draftCraziness } = get();
        if (!session || session.status !== 'drafting') return;

        const pick = session.picks[session.currentPickIndex];
        if (!pick || pick.isUserPick) return;

        const team = NFL_TEAMS.find(t => t.id === pick.teamId);
        if (!team) return;

        const aiPick = getAIPickForTeam(team, availableProspects, team.draftStyle, needsWeight, positionWeight, draftCraziness);

        const updatedPicks = [...session.picks];
        updatedPicks[session.currentPickIndex] = { ...pick, prospect: aiPick };

        const nextIndex = session.currentPickIndex + 1;
        const status = nextIndex >= session.picks.length ? 'complete' : 'drafting';

        const completedPick = { ...pick, prospect: aiPick };
        const commentaryText = generateCommentary(completedPick, false);

        set({
          session: { ...session, picks: updatedPicks, currentPickIndex: nextIndex, status },
          availableProspects: availableProspects.filter(p => p.id !== aiPick.id),
          commentary: commentaryText,
          commentaryType: 'ai',
        });
      },

      simulateToUserPick: () => {
        const state = get();
        if (!state.session) return;

        let { session, availableProspects } = state;
        const { needsWeight, positionWeight, draftCraziness } = state;
        let lastCommentary = '';

        while (
          session.status === 'drafting' &&
          session.currentPickIndex < session.picks.length &&
          !session.picks[session.currentPickIndex].isUserPick
        ) {
          const pick = session.picks[session.currentPickIndex];
          const team = NFL_TEAMS.find(t => t.id === pick.teamId);
          if (!team) break;

          const aiPick = getAIPickForTeam(team, availableProspects, team.draftStyle, needsWeight, positionWeight, draftCraziness);
          const updatedPicks = [...session.picks];
          updatedPicks[session.currentPickIndex] = { ...pick, prospect: aiPick };

          const completedPick = { ...pick, prospect: aiPick };
          lastCommentary = generateCommentary(completedPick, false);

          availableProspects = availableProspects.filter(p => p.id !== aiPick.id);
          const nextIndex = session.currentPickIndex + 1;
          session = {
            ...session,
            picks: updatedPicks,
            currentPickIndex: nextIndex,
            status: nextIndex >= session.picks.length ? 'complete' : 'drafting',
          };
        }

        set({
          session,
          availableProspects,
          commentary: lastCommentary || null,
          commentaryType: lastCommentary ? 'ai' : null,
        });
      },

      proposeTrade: (_pkg: TradePackage) => {
        const { session } = get();
        if (!session) return false;

        const offerValue = getPicksValue(_pkg.offeringPicks);
        const receiveValue = getPicksValue(_pkg.receivingPicks);

        return receiveValue >= offerValue * 0.9;
      },

      acceptTrade: (pkg: TradePackage) => {
        const { session } = get();
        if (!session) return;

        const updatedPicks = session.picks.map(pick => {
          if (pkg.offeringPicks.includes(pick.overall)) {
            return { ...pick, teamId: pkg.receivingTeamId, isUserPick: pkg.receivingTeamId === session.userTeamId };
          }
          if (pkg.receivingPicks.includes(pick.overall)) {
            return { ...pick, teamId: pkg.offeringTeamId, isUserPick: pkg.offeringTeamId === session.userTeamId };
          }
          return pick;
        });

        set({
          session: {
            ...session,
            picks: updatedPicks,
            tradeHistory: [...session.tradeHistory, pkg],
          },
        });
      },

      calculateGrades: () => {
        const { session } = get();
        if (!session) return [];

        const grades = NFL_TEAMS.map(team => calculateTeamGrade(team.id, session.picks));
        set({ grades });
        return grades;
      },

      resetDraft: () => set({ session: null, availableProspects: [], grades: [], commentary: null, commentaryType: null, compareList: [], incomingTradeOffer: null, acquiredPlayers: [] }),

      setCommentary: (text, type) => set({ commentary: text, commentaryType: type }),

      addToCompare: (prospect: Prospect) => {
        const { compareList } = get();
        if (compareList.length >= 2) return;
        if (compareList.find(p => p.id === prospect.id)) return;
        set({ compareList: [...compareList, prospect] });
      },

      removeFromCompare: (prospectId: string) => {
        set({ compareList: get().compareList.filter(p => p.id !== prospectId) });
      },

      clearCompare: () => set({ compareList: [] }),

      generateAITradeOffer: () => {
        const { session, incomingTradeOffer } = get();
        if (!session || session.status !== 'drafting') return;
        if (incomingTradeOffer) return; // Already have an offer pending

        const currentPickIndex = session.currentPickIndex;
        const currentPick = session.picks[currentPickIndex];
        if (!currentPick?.isUserPick) return;

        const { tradeFrequency } = get();
        if (Math.random() > tradeFrequency / 100) return;

        // Find teams picking after the user (1-8 picks away) that need a position
        const userPickValue = getPickValue(currentPick.overall);
        const lookaheadPicks = session.picks
          .slice(currentPickIndex + 1, currentPickIndex + 9)
          .filter(p => !p.isUserPick && !p.prospect);

        if (lookaheadPicks.length === 0) return;

        // Pick a random team from the lookahead window that has roster needs
        const shuffled = [...lookaheadPicks].sort(() => Math.random() - 0.5);
        const targetPick = shuffled[0];
        const fromTeam = NFL_TEAMS.find(t => t.id === targetPick.teamId);
        if (!fromTeam) return;

        // The AI team wants the user's pick to jump ahead for their top need
        const targetPosition = fromTeam.needs[0] ?? 'QB';

        // Find what picks they own after the current user pick
        const theirFuturePicks = session.picks
          .filter(p => p.teamId === fromTeam.id && !p.prospect && p.overall > currentPick.overall)
          .map(p => p.overall)
          .sort((a, b) => a - b);

        if (theirFuturePicks.length === 0) return;

        // Build an offer that totals slightly more value than user's pick
        const targetOfferValue = userPickValue * (1.05 + Math.random() * 0.15); // 5-20% overpay
        const offersPickOveralls: number[] = [];
        let offeredPicksValue = 0;

        for (const pickOverall of theirFuturePicks) {
          if (offeredPicksValue >= targetOfferValue) break;
          offersPickOveralls.push(pickOverall);
          offeredPicksValue += getPickValue(pickOverall);
          if (offeredPicksValue >= targetOfferValue * 0.85) break;
        }

        if (offersPickOveralls.length === 0) return;

        // Determine if we need a player sweetener (if gap > 15%)
        const offersPlayers: RosterPlayer[] = [];
        const valueGapPercent = (userPickValue - offeredPicksValue) / userPickValue;

        if (valueGapPercent > 0.15) {
          const teamRoster = NFL_ROSTERS[fromTeam.id] ?? [];
          // Pick a non-elite player to sweeten the deal (rating 65-80)
          const sweetener = teamRoster
            .filter(p => p.rating >= 65 && p.rating <= 82 && p.contractYears >= 2)
            .sort(() => Math.random() - 0.5)[0];
          if (sweetener) {
            offersPlayers.push(sweetener);
            offeredPicksValue += sweetener.rating * 2; // rough player value approximation
          }
        }

        const totalOfferedValue = offeredPicksValue;
        const totalRequestedValue = userPickValue;

        // Build narrative
        const positionLabels: Record<string, string> = {
          QB: 'a franchise quarterback',
          WR: 'a wide receiver',
          EDGE: 'an edge rusher',
          OT: 'an offensive tackle',
          CB: 'a cornerback',
          DT: 'a defensive tackle',
          LB: 'a linebacker',
          S: 'a safety',
          TE: 'a tight end',
          RB: 'a running back',
          OG: 'a guard',
          C: 'a center',
        };
        const posLabel = positionLabels[targetPosition] ?? targetPosition;
        const narrative = `The ${fromTeam.city} ${fromTeam.name} want to trade up to grab ${posLabel}. They're offering ${offersPickOveralls.length > 1 ? 'multiple picks' : `pick #${offersPickOveralls[0]}`}${offersPlayers.length > 0 ? ` plus ${offersPlayers[0].name}` : ''} to move up to #${currentPick.overall}.`;

        const offer: AITradeOffer = {
          id: crypto.randomUUID(),
          fromTeamId: fromTeam.id,
          wantsPickOverall: currentPick.overall,
          offersPickOveralls,
          offersPlayers,
          requestsPlayers: [],
          totalOfferedValue,
          totalRequestedValue,
          narrative,
          expiresAtPickIndex: currentPickIndex + 5,
        };

        set({ incomingTradeOffer: offer });
      },

      respondToAITradeOffer: (accept: boolean) => {
        const { session, incomingTradeOffer, acquiredPlayers } = get();
        if (!incomingTradeOffer) return;

        if (accept && session) {
          // Execute the trade: user gives up wantsPickOverall, receives offersPickOveralls
          const pkg: TradePackage = {
            offeringTeamId: incomingTradeOffer.fromTeamId,
            receivingTeamId: session.userTeamId,
            offeringPicks: incomingTradeOffer.offersPickOveralls,
            receivingPicks: [incomingTradeOffer.wantsPickOverall],
            jimJohnsonValue: incomingTradeOffer.totalOfferedValue - incomingTradeOffer.totalRequestedValue,
          };

          const { acceptTrade } = get();
          acceptTrade(pkg);

          // Add any offered roster players to acquired players list
          if (incomingTradeOffer.offersPlayers.length > 0) {
            set({ acquiredPlayers: [...acquiredPlayers, ...incomingTradeOffer.offersPlayers] });
          }
        }

        set({ incomingTradeOffer: null });
      },

      dismissTradeOffer: () => set({ incomingTradeOffer: null }),
    }),
    {
      name: 'gridiron-iq-v2',
      partialize: (state) => ({ session: state.session }),
    }
  )
);
