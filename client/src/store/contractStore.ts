import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ContractOffer {
  years: number;
  totalValue: number;
  guaranteedMoney: number;
  signingBonus: number;
  annualAverage: number;
  incentives: number;
  noTradeClause: boolean;
}

export interface NegotiationState {
  playerId: string;
  playerName: string;
  playerPosition: string;
  playerRating: number;
  playerAge: number;
  contractsInLeague: { topDeal: number; avgDeal: number };

  stage: 'opening' | 'countering' | 'finalizing' | 'signed' | 'holdout' | 'walked';
  round: number;

  agentDemand: ContractOffer;
  teamOffer: ContractOffer;
  agentMood: 'hostile' | 'tense' | 'neutral' | 'interested' | 'warm';

  agentMessages: string[];
  teamMessages: string[];

  deadCapIfCut: number;
}

export interface SignedContract {
  playerId: string;
  playerName: string;
  position: string;
  contract: ContractOffer;
  signedAt: number;
  teamId: string;
}

interface ContractStoreState {
  activeNegotiation: NegotiationState | null;
  signedContracts: SignedContract[];
  holdouts: string[];

  startNegotiation: (
    playerId: string,
    playerName: string,
    position: string,
    rating: number,
    age: number,
  ) => void;
  makeOffer: (offer: ContractOffer) => void;
  acceptDeal: () => void;
  walkAway: () => void;
  playerHoldsOut: () => void;
  resolveHoldout: (concession: 'team' | 'player' | 'compromise') => void;
  resetNegotiation: () => void;
}

// Market comps by position (AAV top deal / avg deal)
function getMarketComps(position: string): { topDeal: number; avgDeal: number } {
  const comps: Record<string, { topDeal: number; avgDeal: number }> = {
    QB:  { topDeal: 55, avgDeal: 35 },
    WR:  { topDeal: 32, avgDeal: 18 },
    CB:  { topDeal: 28, avgDeal: 16 },
    DE:  { topDeal: 30, avgDeal: 17 },
    OL:  { topDeal: 24, avgDeal: 14 },
    LT:  { topDeal: 26, avgDeal: 15 },
    RG:  { topDeal: 22, avgDeal: 12 },
    C:   { topDeal: 20, avgDeal: 11 },
    RB:  { topDeal: 18, avgDeal: 10 },
    TE:  { topDeal: 22, avgDeal: 12 },
    S:   { topDeal: 20, avgDeal: 12 },
    LB:  { topDeal: 22, avgDeal: 13 },
    DT:  { topDeal: 25, avgDeal: 14 },
    K:   { topDeal:  8, avgDeal:  4 },
    P:   { topDeal:  6, avgDeal:  3 },
  };
  return comps[position] ?? { topDeal: 20, avgDeal: 12 };
}

function buildInitialAgentDemand(
  position: string,
  rating: number,
  age: number,
): ContractOffer {
  const { topDeal, avgDeal } = getMarketComps(position);

  // Scale AAV by rating (75-99 range mapped to avg..top)
  const ratingFactor = Math.max(0, Math.min(1, (rating - 70) / 29));
  const aav = avgDeal + (topDeal - avgDeal) * ratingFactor;

  // Younger elite players demand more years; aging players may accept shorter deals
  const years = age <= 27 ? 5 : age <= 30 ? 4 : age <= 32 ? 3 : 2;
  const totalValue = Math.round(aav * years * 10) / 10;
  const guaranteedMoney = Math.round(totalValue * (rating >= 90 ? 0.75 : rating >= 80 ? 0.60 : 0.50) * 10) / 10;
  const signingBonus = Math.round(guaranteedMoney * 0.30 * 10) / 10;
  const incentives = Math.round(aav * 0.15 * 10) / 10;

  return {
    years,
    totalValue,
    guaranteedMoney,
    signingBonus,
    annualAverage: Math.round(aav * 10) / 10,
    incentives,
    noTradeClause: rating >= 90,
  };
}

function generateAgentMessage(
  mood: NegotiationState['agentMood'],
  round: number,
  playerName: string,
  gapPercent: number,
): string {
  const firstName = playerName.split(' ')[0];

  if (mood === 'hostile') {
    const lines = [
      `${firstName} is insulted by this offer. We're exploring other options.`,
      `This is not serious money for a player of ${firstName}'s caliber. Don't waste our time.`,
      `We have multiple teams calling. This offer isn't close to what we need.`,
      `${firstName} will test the market if you can't do better than this.`,
    ];
    return lines[round % lines.length];
  }

  if (mood === 'tense') {
    const lines = [
      `We're far apart on the guaranteed money. That's the sticking point for us.`,
      `The years work, but the total value needs to come up significantly.`,
      `${firstName} believes in this organization, but the money has to reflect his value.`,
      `We're not there yet. The guaranteed portion is non-negotiable at this level.`,
    ];
    return lines[round % lines.length];
  }

  if (mood === 'neutral') {
    const lines = [
      `Appreciate the offer. Our counter reflects current market value for this position.`,
      `We've reviewed the proposal. We're still apart on the guarantees — here's our revised ask.`,
      `${firstName} wants to be here long term. Let's find a number that works for both sides.`,
      `Getting warmer, but we need more movement on the total value before we can close.`,
    ];
    return lines[round % lines.length];
  }

  if (mood === 'interested') {
    const lines = [
      `Now we're talking. ${firstName} is very interested in staying. Push a little more on the guarantees.`,
      `We like where this is heading. One more move from your side and we can get this done.`,
      `${firstName} is committed to this franchise. Let's lock this up — bump the AAV slightly.`,
      `Almost there. The total value is close; just need the guaranteed money to reflect his loyalty.`,
    ];
    return lines[round % lines.length];
  }

  // warm
  const lines = [
    `We're getting very close. ${firstName} wants to be your cornerstone. Let's finalize this.`,
    `One more push on the guarantees and ${firstName} signs today. You're almost there.`,
    `${firstName} loves this city and this organization. Bring it home and we'll get the pen out.`,
    `We're essentially there. Small gap remaining — let's close it and get back to football.`,
  ];
  return lines[round % lines.length];
}

function computeMood(
  gapPercent: number,
  round: number,
): NegotiationState['agentMood'] {
  if (gapPercent > 0.40) return 'hostile';
  if (gapPercent > 0.25) return 'tense';
  if (gapPercent > 0.15) return 'neutral';
  if (gapPercent > 0.05) return 'interested';
  return 'warm';
}

export const useContractStore = create<ContractStoreState>()(
  persist(
    (set, get) => ({
      activeNegotiation: null,
      signedContracts: [],
      holdouts: [],

      startNegotiation: (playerId, playerName, position, rating, age) => {
        const comps = getMarketComps(position);
        const agentDemand = buildInitialAgentDemand(position, rating, age);
        const deadCap = Math.round(agentDemand.signingBonus * 0.5 * 10) / 10;

        const teamOffer: ContractOffer = {
          years: agentDemand.years,
          totalValue: Math.round(agentDemand.totalValue * 0.80 * 10) / 10,
          guaranteedMoney: Math.round(agentDemand.guaranteedMoney * 0.65 * 10) / 10,
          signingBonus: Math.round(agentDemand.signingBonus * 0.60 * 10) / 10,
          annualAverage: Math.round(agentDemand.annualAverage * 0.80 * 10) / 10,
          incentives: 0,
          noTradeClause: false,
        };

        const openingMsg = generateAgentMessage('neutral', 0, playerName, 0.20);

        set({
          activeNegotiation: {
            playerId,
            playerName,
            playerPosition: position,
            playerRating: rating,
            playerAge: age,
            contractsInLeague: comps,
            stage: 'opening',
            round: 0,
            agentDemand,
            teamOffer,
            agentMood: 'neutral',
            agentMessages: [openingMsg],
            teamMessages: [],
            deadCapIfCut: deadCap,
          },
        });
      },

      makeOffer: (offer: ContractOffer) => {
        const neg = get().activeNegotiation;
        if (!neg) return;

        // Recompute AAV from total/years
        const sanitizedOffer: ContractOffer = {
          ...offer,
          annualAverage: Math.round((offer.totalValue / offer.years) * 10) / 10,
        };

        const offerAAV = sanitizedOffer.annualAverage;
        const demandAAV = neg.agentDemand.annualAverage;
        const ratio = offerAAV / demandAAV; // 0..1+ (1 = meeting demand exactly)
        const gap = Math.max(0, 1 - ratio);
        const newRound = neg.round + 1;

        // Immediate sign if offer meets 95%+ of demand
        if (ratio >= 0.95) {
          const sigMsg = generateAgentMessage('warm', newRound, neg.playerName, 0);
          set({
            activeNegotiation: {
              ...neg,
              stage: 'signed',
              round: newRound,
              teamOffer: sanitizedOffer,
              agentMood: 'warm',
              agentMessages: [...neg.agentMessages, sigMsg],
              teamMessages: [...neg.teamMessages, `We'd like to offer ${sanitizedOffer.annualAverage}M AAV.`],
            },
          });
          return;
        }

        // Hostile/walkaway territory
        if (ratio < 0.60) {
          const mood: NegotiationState['agentMood'] = 'hostile';
          const hostileMsg = generateAgentMessage('hostile', newRound, neg.playerName, gap);

          // After round 3+ in hostile territory, player walks
          if (newRound >= 3 && Math.random() < 0.55) {
            set({
              activeNegotiation: {
                ...neg,
                stage: 'walked',
                round: newRound,
                teamOffer: sanitizedOffer,
                agentMood: mood,
                agentMessages: [...neg.agentMessages, hostileMsg],
                teamMessages: [...neg.teamMessages, `We'd like to offer ${sanitizedOffer.annualAverage}M AAV.`],
              },
            });
            return;
          }

          const moodUpdate = computeMood(gap, newRound);
          const counterMsg = generateAgentMessage(moodUpdate, newRound, neg.playerName, gap);
          set({
            activeNegotiation: {
              ...neg,
              stage: 'countering',
              round: newRound,
              teamOffer: sanitizedOffer,
              agentMood: mood,
              agentMessages: [...neg.agentMessages, hostileMsg, counterMsg],
              teamMessages: [...neg.teamMessages, `We'd like to offer ${sanitizedOffer.annualAverage}M AAV.`],
            },
          });
          return;
        }

        // 60-95%: agent counters — moves demand 20-40% toward team offer
        const moveRatio = 0.20 + Math.random() * 0.20;
        const newDemandAAV = demandAAV - (demandAAV - offerAAV) * moveRatio;
        const newDemandTotal = Math.round(newDemandAAV * neg.agentDemand.years * 10) / 10;
        const newDemandGuaranteed = Math.round(newDemandTotal * (neg.agentDemand.guaranteedMoney / neg.agentDemand.totalValue) * 10) / 10;
        const newDemandSigning = Math.round(newDemandGuaranteed * 0.30 * 10) / 10;

        const newAgentDemand: ContractOffer = {
          ...neg.agentDemand,
          totalValue: newDemandTotal,
          guaranteedMoney: newDemandGuaranteed,
          signingBonus: newDemandSigning,
          annualAverage: Math.round(newDemandAAV * 10) / 10,
        };

        const newGap = Math.max(0, 1 - offerAAV / newDemandAAV);
        const newMood = computeMood(newGap, newRound);

        // Max 5 rounds before mandatory walkaway or holdout
        let newStage: NegotiationState['stage'] = 'countering';
        if (newRound >= 5) {
          // Hostile at round 5 means walkaway; warm/interested means sign
          if (newMood === 'hostile' || newMood === 'tense') {
            newStage = Math.random() < 0.6 ? 'walked' : 'holdout';
          } else if (newMood === 'warm' || newMood === 'interested') {
            newStage = 'signed';
          } else {
            newStage = Math.random() < 0.4 ? 'holdout' : 'walked';
          }
        } else {
          newStage = 'countering';
        }

        const counterMsg = generateAgentMessage(newMood, newRound, neg.playerName, newGap);

        set({
          activeNegotiation: {
            ...neg,
            stage: newStage,
            round: newRound,
            teamOffer: sanitizedOffer,
            agentDemand: newAgentDemand,
            agentMood: newMood,
            agentMessages: [...neg.agentMessages, counterMsg],
            teamMessages: [...neg.teamMessages, `We'd like to offer ${sanitizedOffer.annualAverage}M AAV.`],
            deadCapIfCut: Math.round(sanitizedOffer.signingBonus * 0.5 * 10) / 10,
          },
        });
      },

      acceptDeal: () => {
        const neg = get().activeNegotiation;
        if (!neg) return;
        const contract = neg.teamOffer;
        const signed: SignedContract = {
          playerId: neg.playerId,
          playerName: neg.playerName,
          position: neg.playerPosition,
          contract,
          signedAt: Date.now(),
          teamId: 'user_team',
        };
        set(state => ({
          activeNegotiation: { ...neg, stage: 'signed' },
          signedContracts: [...state.signedContracts, signed],
        }));
      },

      walkAway: () => {
        const neg = get().activeNegotiation;
        if (!neg) return;
        set({ activeNegotiation: { ...neg, stage: 'walked' } });
      },

      playerHoldsOut: () => {
        const neg = get().activeNegotiation;
        if (!neg) return;
        set(state => ({
          activeNegotiation: { ...neg, stage: 'holdout' },
          holdouts: [...state.holdouts, neg.playerId],
        }));
      },

      resolveHoldout: (concession: 'team' | 'player' | 'compromise') => {
        const neg = get().activeNegotiation;
        if (!neg) return;

        if (concession === 'team') {
          // Team concedes — accept agent demand
          const signed: SignedContract = {
            playerId: neg.playerId,
            playerName: neg.playerName,
            position: neg.playerPosition,
            contract: neg.agentDemand,
            signedAt: Date.now(),
            teamId: 'user_team',
          };
          set(state => ({
            activeNegotiation: { ...neg, stage: 'signed', teamOffer: neg.agentDemand },
            signedContracts: [...state.signedContracts, signed],
            holdouts: state.holdouts.filter(id => id !== neg.playerId),
          }));
        } else if (concession === 'player') {
          // Player accepts team offer
          const signed: SignedContract = {
            playerId: neg.playerId,
            playerName: neg.playerName,
            position: neg.playerPosition,
            contract: neg.teamOffer,
            signedAt: Date.now(),
            teamId: 'user_team',
          };
          set(state => ({
            activeNegotiation: { ...neg, stage: 'signed' },
            signedContracts: [...state.signedContracts, signed],
            holdouts: state.holdouts.filter(id => id !== neg.playerId),
          }));
        } else {
          // Compromise — split the difference
          const compromise: ContractOffer = {
            years: neg.agentDemand.years,
            totalValue: Math.round(((neg.agentDemand.totalValue + neg.teamOffer.totalValue) / 2) * 10) / 10,
            guaranteedMoney: Math.round(((neg.agentDemand.guaranteedMoney + neg.teamOffer.guaranteedMoney) / 2) * 10) / 10,
            signingBonus: Math.round(((neg.agentDemand.signingBonus + neg.teamOffer.signingBonus) / 2) * 10) / 10,
            annualAverage: Math.round((((neg.agentDemand.totalValue + neg.teamOffer.totalValue) / 2) / neg.agentDemand.years) * 10) / 10,
            incentives: Math.round(((neg.agentDemand.incentives + neg.teamOffer.incentives) / 2) * 10) / 10,
            noTradeClause: neg.agentDemand.noTradeClause && neg.teamOffer.noTradeClause,
          };
          const signed: SignedContract = {
            playerId: neg.playerId,
            playerName: neg.playerName,
            position: neg.playerPosition,
            contract: compromise,
            signedAt: Date.now(),
            teamId: 'user_team',
          };
          set(state => ({
            activeNegotiation: { ...neg, stage: 'signed', teamOffer: compromise },
            signedContracts: [...state.signedContracts, signed],
            holdouts: state.holdouts.filter(id => id !== neg.playerId),
          }));
        }
      },

      resetNegotiation: () => {
        set({ activeNegotiation: null });
      },
    }),
    { name: 'contract-store' },
  ),
);
