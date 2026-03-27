import { motion } from 'framer-motion';
import { NFL_TEAMS } from '../../data/teams';
import type { AITradeOffer } from '../../types/draft';
import { getPickValue } from '../../data/tradeChart';

interface Props {
  offer: AITradeOffer;
  currentPickIndex: number;
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

export function IncomingTradeOffer({ offer, currentPickIndex, onAccept, onDecline }: Props) {
  const fromTeam = NFL_TEAMS.find(t => t.id === offer.fromTeamId);
  const accentColor = fromTeam?.primaryColor ?? '#6366f1';
  const picksLeft = offer.expiresAtPickIndex - currentPickIndex;

  const offeredPicksValue = offer.offersPickOveralls.reduce((sum, p) => sum + getPickValue(p), 0);
  const playerSweetenerValue = offer.offersPlayers.reduce((sum, p) => sum + p.rating * 2, 0);
  const totalOffer = offeredPicksValue + playerSweetenerValue;
  const requestedValue = getPickValue(offer.wantsPickOverall);

  const valuePct = Math.min(100, Math.round((totalOffer / Math.max(requestedValue, 1)) * 100));
  const isFavorable = totalOffer >= requestedValue * 0.95;

  return (
    <motion.div
      initial={{ x: 420, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 420, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute right-0 top-0 bottom-0 z-40 flex items-center pointer-events-none"
      style={{ width: '380px' }}
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

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
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
        </div>
      </div>
    </motion.div>
  );
}
