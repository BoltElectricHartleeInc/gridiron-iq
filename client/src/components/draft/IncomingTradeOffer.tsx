import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NFL_TEAMS } from '../../data/teams';
import type { AITradeOffer, DraftPick } from '../../types/draft';
import { getPickValue } from '../../data/tradeChart';

interface Props {
  offer: AITradeOffer;
  currentPickIndex: number;
  userPicks: DraftPick[];
  onAccept: () => void;
  onDecline: () => void;
}

function getRatingColor(rating: number): string {
  if (rating >= 90) return '#f59e0b';
  if (rating >= 80) return '#3b82f6';
  if (rating >= 70) return '#22c55e';
  return '#6b7280';
}

function getPickLabel(overall: number): string {
  const round = Math.ceil(overall / 32);
  const pickInRound = overall - (round - 1) * 32;
  return `R${round} P${pickInRound} (#${overall})`;
}

type CounterState = 'idle' | 'editing' | 'accepted' | 'declined';

export function IncomingTradeOffer({ offer, currentPickIndex, userPicks, onAccept, onDecline }: Props) {
  const fromTeam = NFL_TEAMS.find(t => t.id === offer.fromTeamId);
  const accentColor = fromTeam?.primaryColor ?? '#6366f1';
  const picksLeft = offer.expiresAtPickIndex - currentPickIndex;

  const offeredPicksValue = offer.offersPickOveralls.reduce((sum, p) => sum + getPickValue(p), 0);
  const playerSweetenerValue = offer.offersPlayers.reduce((sum, p) => sum + p.rating * 2, 0);
  const totalOffer = offeredPicksValue + playerSweetenerValue;
  const requestedValue = getPickValue(offer.wantsPickOverall);

  const valuePct = Math.min(100, Math.round((totalOffer / Math.max(requestedValue, 1)) * 100));
  const isFavorable = totalOffer >= requestedValue * 0.95;

  // Counter offer state
  const [counterState, setCounterState] = useState<CounterState>('idle');
  // Available picks for counter: user's upcoming picks excluding the one being asked for
  const counterPicks = userPicks.filter(p => !p.prospect && p.overall !== offer.wantsPickOverall);
  const [selectedCounterPick, setSelectedCounterPick] = useState<number>(
    counterPicks[0]?.overall ?? 0
  );

  const handleCounter = () => {
    if (!selectedCounterPick) return;
    // 50% chance AI accepts
    const accepted = Math.random() >= 0.5;
    setCounterState(accepted ? 'accepted' : 'declined');
    if (accepted) {
      setTimeout(() => onAccept(), 1600);
    } else {
      setTimeout(() => onDecline(), 1600);
    }
  };

  return (
    <motion.div
      initial={{ x: 420, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 420, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute right-0 top-0 bottom-0 z-40 flex items-center pointer-events-none"
      style={{ width: counterState === 'editing' ? '480px' : '380px' }}
    >
      <div
        className="pointer-events-auto w-full mx-3 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0d0d1a 0%, #0a0a14 100%)',
          border: `1px solid ${accentColor}40`,
          boxShadow: `0 0 40px ${accentColor}20, 0 20px 60px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Accent header strip */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(to right, ${accentColor}, ${accentColor}88)` }}
        />

        <div className="p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-xs flex-shrink-0"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${accentColor}, ${accentColor}88)`,
                boxShadow: `0 0 16px ${accentColor}55`,
              }}
            >
              {fromTeam?.abbreviation ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-black uppercase tracking-widest"
                  style={{ color: accentColor, letterSpacing: '0.1em' }}
                >
                  &#9889; TRADE OFFER
                </span>
              </div>
              <div className="text-white text-sm font-semibold truncate">
                {fromTeam?.city} {fromTeam?.name}
              </div>
            </div>
            <div
              className="text-xs px-2 py-1 rounded-lg flex-shrink-0"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.35)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {picksLeft > 0 ? `Expires in ${picksLeft} pick${picksLeft !== 1 ? 's' : ''}` : 'Expiring soon'}
            </div>
          </div>

          {/* Narrative */}
          <p
            className="text-sm leading-relaxed mb-4"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            {offer.narrative}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* They offer */}
            <div
              className="rounded-xl p-3"
              style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}
            >
              <div className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: '#4ade80' }}>
                They Offer
              </div>
              <div className="space-y-1.5">
                {offer.offersPickOveralls.map(overall => (
                  <div key={overall} className="flex items-center justify-between">
                    <span className="text-white text-xs font-semibold">{getPickLabel(overall)}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-md font-bold"
                      style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}
                    >
                      {getPickValue(overall)} pts
                    </span>
                  </div>
                ))}
                {offer.offersPlayers.map(player => (
                  <div key={player.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-xs font-semibold truncate">{player.name}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {player.position} · {player.contractYears}yr
                      </div>
                    </div>
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ml-2"
                      style={{
                        background: `${getRatingColor(player.rating)}22`,
                        border: `1px solid ${getRatingColor(player.rating)}55`,
                        color: getRatingColor(player.rating),
                      }}
                    >
                      {player.rating}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* They want */}
            <div
              className="rounded-xl p-3"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              <div className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: '#f87171' }}>
                They Want
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-white text-xs font-semibold">{getPickLabel(offer.wantsPickOverall)}</span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-md font-bold"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}
                  >
                    {getPickValue(offer.wantsPickOverall)} pts
                  </span>
                </div>
                {offer.requestsPlayers.map(player => (
                  <div key={player.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-xs font-semibold truncate">{player.name}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {player.position} · {player.contractYears}yr
                      </div>
                    </div>
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ml-2"
                      style={{
                        background: `${getRatingColor(player.rating)}22`,
                        border: `1px solid ${getRatingColor(player.rating)}55`,
                        color: getRatingColor(player.rating),
                      }}
                    >
                      {player.rating}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Value bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Trade Value
              </span>
              <span
                className="text-xs font-black"
                style={{ color: isFavorable ? '#4ade80' : '#f87171' }}
              >
                {isFavorable ? `+${Math.round(totalOffer - requestedValue)} pts in your favor` : `${Math.round(totalOffer - requestedValue)} pts`}
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(valuePct, 100)}%` }}
                transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: isFavorable
                    ? 'linear-gradient(to right, #22c55e, #4ade80)'
                    : 'linear-gradient(to right, #ef4444, #f87171)',
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Offer: {Math.round(totalOffer)} pts
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Asked: {requestedValue} pts
              </span>
            </div>
          </div>

          {/* Counter result feedback */}
          <AnimatePresence>
            {counterState === 'accepted' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-3 p-3 rounded-xl text-center text-sm font-bold"
                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}
              >
                Counter Accepted!
              </motion.div>
            )}
            {counterState === 'declined' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-3 p-3 rounded-xl text-center text-sm font-bold"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
              >
                Counter Declined
              </motion.div>
            )}
          </AnimatePresence>

          {/* Counter editor panel */}
          <AnimatePresence>
            {counterState === 'editing' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-3 rounded-xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="p-3">
                  <div className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Your Counter Offer
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Their offer side */}
                    <div>
                      <div className="text-xs font-semibold mb-2" style={{ color: '#4ade80' }}>They Give</div>
                      {offer.offersPickOveralls.map(o => (
                        <div key={o} className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          {getPickLabel(o)}
                        </div>
                      ))}
                    </div>
                    {/* User counter pick */}
                    <div>
                      <div className="text-xs font-semibold mb-2" style={{ color: '#f87171' }}>You Send (Counter)</div>
                      {counterPicks.length === 0 ? (
                        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>No other picks available</div>
                      ) : (
                        <select
                          value={selectedCounterPick}
                          onChange={e => setSelectedCounterPick(Number(e.target.value))}
                          style={{ width: '100%', background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '4px 6px', color: 'rgba(255,255,255,0.8)', fontSize: 11, cursor: 'pointer', outline: 'none' }}
                        >
                          {counterPicks.map(p => (
                            <option key={p.overall} value={p.overall}>
                              {getPickLabel(p.overall)} ({getPickValue(p.overall)} pts)
                            </option>
                          ))}
                        </select>
                      )}
                      {selectedCounterPick > 0 && (
                        <div className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          Value: {getPickValue(selectedCounterPick)} pts
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleCounter}
                      disabled={!selectedCounterPick || counterPicks.length === 0}
                      className="flex-1 py-2 rounded-xl font-bold text-xs tracking-wider"
                      style={{ background: 'rgba(59,125,216,0.18)', border: '1px solid rgba(59,125,216,0.4)', color: '#7ab3f0', cursor: selectedCounterPick ? 'pointer' : 'not-allowed', opacity: selectedCounterPick ? 1 : 0.5 }}
                    >
                      Submit Counter
                    </button>
                    <button
                      onClick={() => setCounterState('idle')}
                      className="px-4 py-2 rounded-xl font-bold text-xs"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          {counterState === 'idle' && (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={onAccept}
                className="py-2.5 rounded-xl font-bold text-sm tracking-wider transition-all"
                style={{
                  background: 'rgba(30,140,78,0.18)',
                  border: '1px solid rgba(30,140,78,0.4)',
                  color: '#3dba78',
                  boxShadow: '0 0 16px rgba(30,140,78,0.12)',
                }}
              >
                ✓ ACCEPT
              </button>
              <button
                onClick={() => setCounterState('editing')}
                disabled={counterPicks.length === 0}
                className="py-2.5 rounded-xl font-bold text-sm tracking-wider transition-all"
                style={{
                  background: 'rgba(59,125,216,0.12)',
                  border: '1px solid rgba(59,125,216,0.3)',
                  color: counterPicks.length > 0 ? '#7ab3f0' : 'rgba(255,255,255,0.2)',
                  cursor: counterPicks.length > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                ⇄ COUNTER
              </button>
              <button
                onClick={onDecline}
                className="py-2.5 rounded-xl font-bold text-sm tracking-wider transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                &#10005; DECLINE
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
