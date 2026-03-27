import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useContractStore, type ContractOffer } from '../store/contractStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return `$${n.toFixed(1)}M`;
}

function moodColor(mood: string): string {
  switch (mood) {
    case 'hostile':   return 'bg-red-600 text-white';
    case 'tense':     return 'bg-orange-500 text-white';
    case 'neutral':   return 'bg-gray-500 text-white';
    case 'interested':return 'bg-blue-500 text-white';
    case 'warm':      return 'bg-green-500 text-white';
    default:          return 'bg-gray-600 text-white';
  }
}

function moodLabel(mood: string): string {
  switch (mood) {
    case 'hostile':   return 'HOSTILE';
    case 'tense':     return 'TENSE';
    case 'neutral':   return 'NEUTRAL';
    case 'interested':return 'INTERESTED';
    case 'warm':      return 'WARM';
    default:          return mood.toUpperCase();
  }
}

function gapPercent(teamAAV: number, agentAAV: number): number {
  if (agentAAV === 0) return 0;
  return Math.max(0, Math.min(1, (agentAAV - teamAAV) / agentAAV));
}

function gapColor(gap: number): string {
  if (gap > 0.30) return '#ef4444';
  if (gap > 0.15) return '#f97316';
  if (gap > 0.05) return '#eab308';
  return '#22c55e';
}

// ─── Sliders ──────────────────────────────────────────────────────────────────

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, step, format, onChange }: SliderRowProps) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span className="text-white font-bold">{format(value)}</span>
      </div>
      <input
        type="range"
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: '#3b82f6' }}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between text-xs text-gray-600 mt-0.5">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

// ─── Contract Breakdown Table ──────────────────────────────────────────────────

interface ContractTableProps {
  offer: ContractOffer;
  highlight?: boolean;
}

function ContractTable({ offer, highlight }: ContractTableProps) {
  const rows = [
    { label: 'Years',         value: `${offer.years} yrs` },
    { label: 'Total Value',   value: fmt(offer.totalValue) },
    { label: 'Guaranteed',    value: fmt(offer.guaranteedMoney) },
    { label: 'AAV',           value: `${fmt(offer.annualAverage)}/yr` },
    { label: 'Signing Bonus', value: fmt(offer.signingBonus) },
    { label: 'Incentives',    value: fmt(offer.incentives) },
    { label: 'NTC',           value: offer.noTradeClause ? 'Yes' : 'No' },
  ];
  return (
    <div className={`rounded-lg border ${highlight ? 'border-blue-500' : 'border-gray-700'} overflow-hidden`}>
      {rows.map((r, i) => (
        <div
          key={r.label}
          className={`flex justify-between px-3 py-1.5 text-sm ${
            i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'
          }`}
        >
          <span className="text-gray-400">{r.label}</span>
          <span className={`font-semibold ${highlight ? 'text-blue-300' : 'text-white'}`}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Outcome Modal ─────────────────────────────────────────────────────────────

interface OutcomeModalProps {
  stage: string;
  playerName: string;
  offer: ContractOffer | null;
  deadCap: number;
  onClose: () => void;
  onHoldoutResolve?: (c: 'team' | 'player' | 'compromise') => void;
}

function OutcomeModal({ stage, playerName, offer, deadCap, onClose, onHoldoutResolve }: OutcomeModalProps) {
  const isSigned  = stage === 'signed';
  const isHoldout = stage === 'holdout';
  const isWalked  = stage === 'walked';

  const bg    = isSigned ? 'border-green-500 bg-green-950' : isHoldout ? 'border-orange-500 bg-orange-950' : 'border-red-600 bg-red-950';
  const title = isSigned ? '✅ CONTRACT SIGNED' : isHoldout ? '⚠️ HOLDOUT' : '🚪 PLAYER WALKED';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`w-full max-w-md mx-4 rounded-2xl border-2 p-6 ${bg}`}
        initial={{ scale: 0.85, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 40 }}
      >
        <h2 className="text-2xl font-black tracking-widest text-center mb-2">{title}</h2>
        <p className="text-center text-gray-300 mb-4 text-sm">{playerName}</p>

        {isSigned && offer && (
          <div className="space-y-2 mb-4">
            <ContractTable offer={offer} highlight />
            <div className="flex justify-between text-xs text-gray-400 px-1 pt-2">
              <span>Cap hit yr 1:</span>
              <span className="text-white">{fmt(offer.annualAverage)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 px-1">
              <span>Dead cap if cut:</span>
              <span className="text-red-400">{fmt(deadCap)}</span>
            </div>
          </div>
        )}

        {isHoldout && (
          <div className="space-y-2 mb-4">
            <p className="text-orange-200 text-sm text-center">{playerName} did not report to training camp.</p>
            <p className="text-gray-300 text-xs text-center">How do you want to resolve this?</p>
            <div className="flex flex-col gap-2 mt-3">
              <button
                onClick={() => onHoldoutResolve?.('team')}
                className="w-full py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold transition"
              >
                Concede — Meet Agent Demand
              </button>
              <button
                onClick={() => onHoldoutResolve?.('compromise')}
                className="w-full py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-bold transition"
              >
                Split the Difference
              </button>
              <button
                onClick={() => onHoldoutResolve?.('player')}
                className="w-full py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white text-sm font-bold transition"
              >
                Hold Firm — Player Signs on Your Terms
              </button>
            </div>
          </div>
        )}

        {isWalked && (
          <div className="mb-4 text-center">
            <p className="text-red-200 text-sm">{playerName} has chosen to test free agency.</p>
            <p className="text-gray-400 text-xs mt-1">He will sign elsewhere. No compensation.</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-2 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm transition"
        >
          {isSigned ? 'Return to Franchise' : isWalked ? 'Acknowledge' : 'Close'}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ContractNegotiationPage() {
  const [params] = useSearchParams();
  const navigate  = useNavigate();

  const playerId   = params.get('playerId')   ?? 'player_1';
  const playerName = params.get('playerName') ?? 'Unknown Player';
  const position   = params.get('position')   ?? 'WR';
  const rating     = parseInt(params.get('rating') ?? '82', 10);
  const age        = parseInt(params.get('age')    ?? '27', 10);

  const {
    activeNegotiation,
    startNegotiation,
    makeOffer,
    resetNegotiation,
    resolveHoldout,
  } = useContractStore();

  // Initialize negotiation on mount if not already started for this player
  useEffect(() => {
    if (!activeNegotiation || activeNegotiation.playerId !== playerId) {
      startNegotiation(playerId, playerName, position, rating, age);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const neg = activeNegotiation;

  // Local offer state (controlled by sliders)
  const [offerYears,       setOfferYears]       = useState(3);
  const [offerTotal,       setOfferTotal]       = useState(0);
  const [offerGuaranteed,  setOfferGuaranteed]  = useState(0);
  const [offerSigning,     setOfferSigning]     = useState(0);
  const [offerIncentives,  setOfferIncentives]  = useState(0);
  const [offerNTC,         setOfferNTC]         = useState(false);
  const [showOutcome,      setShowOutcome]      = useState(false);

  // Sync slider defaults when negotiation initialises
  useEffect(() => {
    if (!neg) return;
    setOfferYears(neg.teamOffer.years);
    setOfferTotal(neg.teamOffer.totalValue);
    setOfferGuaranteed(neg.teamOffer.guaranteedMoney);
    setOfferSigning(neg.teamOffer.signingBonus);
    setOfferIncentives(neg.teamOffer.incentives);
    setOfferNTC(neg.teamOffer.noTradeClause);
  }, [neg?.playerId]); // only on player change

  // Show outcome modal when stage resolves
  useEffect(() => {
    if (!neg) return;
    if (['signed', 'holdout', 'walked'].includes(neg.stage)) {
      setShowOutcome(true);
    }
  }, [neg?.stage]);

  if (!neg) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading negotiation…</p>
      </div>
    );
  }

  const agentAAV    = neg.agentDemand.annualAverage;
  const teamAAV     = offerTotal / offerYears;
  const gap         = gapPercent(teamAAV, agentAAV);
  const gapAmt      = Math.max(0, agentAAV - teamAAV);
  const gapPct      = Math.round(gap * 100);
  const sliderMin   = Math.round(neg.agentDemand.totalValue * 0.50 * 10) / 10;
  const sliderMax   = Math.round(neg.agentDemand.totalValue * 1.20 * 10) / 10;

  const negotiating = !['signed', 'holdout', 'walked'].includes(neg.stage);

  function handleMakeOffer() {
    if (!negotiating) return;
    const offer: ContractOffer = {
      years:           offerYears,
      totalValue:      offerTotal,
      guaranteedMoney: offerGuaranteed,
      signingBonus:    offerSigning,
      annualAverage:   Math.round((offerTotal / offerYears) * 10) / 10,
      incentives:      offerIncentives,
      noTradeClause:   offerNTC,
    };
    makeOffer(offer);
  }

  function handleCloseOutcome() {
    setShowOutcome(false);
    resetNegotiation();
    navigate('/game/franchise');
  }

  const contextLines = [
    age >= 32
      ? 'Player is in the twilight of his career. Shorter deals preferred.'
      : age <= 24
      ? 'Young talent with ceiling. The next 4-5 years are his prime.'
      : 'Prime-age player. Both sides want a long-term commitment.',
    neg.round >= 3
      ? 'Talks have dragged on. Patience is wearing thin on both sides.'
      : 'Early in negotiations. Room to maneuver.',
    neg.agentMood === 'warm' || neg.agentMood === 'interested'
      ? 'The agent has signaled genuine interest in staying here.'
      : neg.agentMood === 'hostile'
      ? 'Warning: The agent has other offers on the table. Act quickly.'
      : 'Approaching free agency. He can test the market in 72 hours.',
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Contract Negotiations</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl font-black">{neg.playerName}</span>
              <span className="text-sm text-gray-400">{neg.playerPosition}</span>
              <span className="px-2 py-0.5 rounded bg-blue-600 text-xs font-black">OVR {neg.playerRating}</span>
              <span className="text-xs text-gray-500">Age {neg.playerAge}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-widest">Round</div>
            <div className="text-3xl font-black text-yellow-400">{neg.round + 1} <span className="text-gray-600 text-lg">/ 5</span></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Value Gap Meter */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Team: <span className="text-white font-bold">{fmt(teamAAV)} AAV</span></span>
            <span className="font-bold" style={{ color: gapColor(gap) }}>
              Gap: {fmt(gapAmt)}
            </span>
            <span>Agent: <span className="text-white font-bold">{fmt(agentAAV)} AAV</span></span>
          </div>
          <div className="w-full h-4 rounded-full bg-gray-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: gapColor(gap) }}
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(100, (1 - gap) * 100)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-red-400">Far Apart</span>
            <span className="text-gray-500">{100 - gapPct}% agreement</span>
            <span className="text-green-400">Deal Zone</span>
          </div>
        </div>

        {/* Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT: Agent Side */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
            {/* Agent header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-2xl">
                👔
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">Sports Agency Group</div>
                <div className="font-bold text-sm">Representing {neg.playerName}</div>
              </div>
              <div className="ml-auto">
                <span className={`px-2 py-1 rounded-full text-xs font-black ${moodColor(neg.agentMood)}`}>
                  {moodLabel(neg.agentMood)}
                </span>
              </div>
            </div>

            {/* Agent demand */}
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Agent Demand</div>
              <ContractTable offer={neg.agentDemand} />
            </div>

            {/* Speech bubble */}
            <AnimatePresence mode="wait">
              <motion.div
                key={neg.agentMessages[neg.agentMessages.length - 1]}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="bg-gray-800 rounded-xl rounded-tl-none p-3 border-l-2 border-gray-600"
              >
                <p className="text-sm text-gray-300 italic">
                  "{neg.agentMessages[neg.agentMessages.length - 1]}"
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Market Comps */}
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Market Comps ({neg.playerPosition})</div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Top deal</span>
                <span className="font-bold text-yellow-400">{fmt(neg.contractsInLeague.topDeal)}/yr</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">League avg</span>
                <span className="font-bold text-gray-200">{fmt(neg.contractsInLeague.avgDeal)}/yr</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Your Offer */}
          <div className="bg-gray-900 rounded-xl border border-blue-900 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs font-black tracking-widest text-blue-400 uppercase">Your Franchise Offer</span>
            </div>

            {/* Sliders */}
            <div>
              <SliderRow
                label="Contract Length"
                value={offerYears}
                min={1}
                max={5}
                step={1}
                format={v => `${v} yr${v !== 1 ? 's' : ''}`}
                onChange={setOfferYears}
              />
              <SliderRow
                label="Total Value"
                value={offerTotal}
                min={sliderMin}
                max={sliderMax}
                step={0.5}
                format={fmt}
                onChange={v => {
                  setOfferTotal(v);
                  // Keep ratios roughly consistent
                  setOfferGuaranteed(prev => Math.min(prev, v));
                }}
              />
              <SliderRow
                label="Guaranteed Money"
                value={offerGuaranteed}
                min={0}
                max={offerTotal}
                step={0.5}
                format={fmt}
                onChange={setOfferGuaranteed}
              />
              <SliderRow
                label="Signing Bonus"
                value={offerSigning}
                min={0}
                max={Math.round(offerTotal * 0.30 * 10) / 10}
                step={0.5}
                format={fmt}
                onChange={setOfferSigning}
              />
              <SliderRow
                label="Incentives"
                value={offerIncentives}
                min={0}
                max={Math.round(neg.agentDemand.annualAverage * 0.25 * 10) / 10}
                step={0.5}
                format={fmt}
                onChange={setOfferIncentives}
              />
            </div>

            {/* Toggles */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setOfferNTC(v => !v)}
                  className={`w-10 h-5 rounded-full transition-colors ${offerNTC ? 'bg-blue-500' : 'bg-gray-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${offerNTC ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="text-xs text-gray-400">No-Trade Clause</span>
              </label>
            </div>

            {/* Live preview */}
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Your Current Offer</div>
              <ContractTable
                offer={{
                  years:           offerYears,
                  totalValue:      offerTotal,
                  guaranteedMoney: offerGuaranteed,
                  signingBonus:    offerSigning,
                  annualAverage:   Math.round((offerTotal / offerYears) * 10) / 10,
                  incentives:      offerIncentives,
                  noTradeClause:   offerNTC,
                }}
                highlight
              />
            </div>

            <motion.button
              onClick={handleMakeOffer}
              disabled={!negotiating}
              whileTap={{ scale: 0.97 }}
              className={`w-full py-3 rounded-xl font-black tracking-widest text-sm transition ${
                negotiating
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {negotiating ? 'MAKE OFFER →' : 'NEGOTIATION CLOSED'}
            </motion.button>
          </div>
        </div>

        {/* Negotiation History */}
        {neg.round > 0 && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Negotiation History</div>
            <div className="space-y-2">
              {neg.agentMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 text-sm"
                >
                  <span className="text-xs text-gray-600 min-w-[60px] mt-0.5">Round {i + 1}</span>
                  <span className="text-gray-400 italic">"{msg}"</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Context strip */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-1">
          {contextLines.map((line, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
              <span className="text-yellow-500">›</span>
              <span>{line}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/game/franchise')}
          className="text-xs text-gray-600 hover:text-gray-400 transition"
        >
          ← Back to Franchise
        </button>
      </div>

      {/* Outcome Modal */}
      <AnimatePresence>
        {showOutcome && (
          <OutcomeModal
            stage={neg.stage}
            playerName={neg.playerName}
            offer={neg.teamOffer}
            deadCap={neg.deadCapIfCut}
            onClose={handleCloseOutcome}
            onHoldoutResolve={(concession) => {
              resolveHoldout(concession);
              setShowOutcome(false);
              setTimeout(() => {
                resetNegotiation();
                navigate('/game/franchise');
              }, 400);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
