import { useState } from 'react';
import { motion } from 'framer-motion';
import { NFL_TEAMS } from '../../data/teams';
import { NFL_ROSTERS } from '../../data/rosters';
import { useDraftStore } from '../../store/draftStore';
import { getPickValue, getPicksValue } from '../../data/tradeChart';
import type { DraftSession, RosterPlayer } from '../../types/draft';
import type { Prospect } from '../../types/draft';

interface Props {
  session: DraftSession;
  availableProspects: Prospect[];
  onClose: () => void;
}

function getRatingColor(rating: number): string {
  if (rating >= 90) return '#f59e0b';
  if (rating >= 80) return '#3b82f6';
  if (rating >= 70) return '#22c55e';
  return '#6b7280';
}

export function TradeModal({ session, onClose }: Props) {
  const { proposeTrade, acceptTrade } = useDraftStore();
  const [targetTeamId, setTargetTeamId] = useState('');
  const [myOfferPicks, setMyOfferPicks] = useState<number[]>([]);
  const [theirPicks, setTheirPicks] = useState<number[]>([]);
  const [myOfferPlayers, setMyOfferPlayers] = useState<string[]>([]);
  const [theirOfferPlayers, setTheirOfferPlayers] = useState<string[]>([]);
  const [result, setResult] = useState<'accepted' | 'rejected' | null>(null);

  const myPicks = session.picks.filter(p => p.teamId === session.userTeamId && !p.prospect);
  const targetTeamPicks = targetTeamId
    ? session.picks.filter(p => p.teamId === targetTeamId && !p.prospect)
    : [];

  const myRoster: RosterPlayer[] = NFL_ROSTERS[session.userTeamId] ?? [];
  const targetRoster: RosterPlayer[] = targetTeamId ? (NFL_ROSTERS[targetTeamId] ?? []) : [];

  const selectedMyPlayers = myRoster.filter(p => myOfferPlayers.includes(p.id));
  const selectedTheirPlayers = targetRoster.filter(p => theirOfferPlayers.includes(p.id));

  // Player value: rating * 2 as rough trade point equivalent
  const myPlayerValue = selectedMyPlayers.reduce((sum, p) => sum + p.rating * 2, 0);
  const theirPlayerValue = selectedTheirPlayers.reduce((sum, p) => sum + p.rating * 2, 0);

  const myValue = getPicksValue(myOfferPicks) + myPlayerValue;
  const theirValue = getPicksValue(theirPicks) + theirPlayerValue;
  const diff = myValue - theirValue;

  const handlePropose = () => {
    if (!targetTeamId || (myOfferPicks.length === 0 && selectedMyPlayers.length === 0)) return;
    if (theirPicks.length === 0 && selectedTheirPlayers.length === 0) return;

    const pkg = {
      offeringTeamId: session.userTeamId,
      receivingTeamId: targetTeamId,
      offeringPicks: myOfferPicks,
      receivingPicks: theirPicks,
      jimJohnsonValue: diff,
    };

    const accepted = proposeTrade(pkg);
    if (accepted) {
      acceptTrade(pkg);
      setResult('accepted');
      setTimeout(onClose, 1500);
    } else {
      setResult('rejected');
      setTimeout(() => setResult(null), 2000);
    }
  };

  const toggleMyPick = (overall: number) => {
    setMyOfferPicks(prev =>
      prev.includes(overall) ? prev.filter(p => p !== overall) : [...prev, overall]
    );
  };

  const toggleTheirPick = (overall: number) => {
    setTheirPicks(prev =>
      prev.includes(overall) ? prev.filter(p => p !== overall) : [...prev, overall]
    );
  };

  const toggleMyPlayer = (playerId: string) => {
    setMyOfferPlayers(prev =>
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );
  };

  const toggleTheirPlayer = (playerId: string) => {
    setTheirOfferPlayers(prev =>
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl"
        style={{
          background: 'linear-gradient(160deg, #0d0d1a 0%, #0a0a14 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
        }}
      >
        <div
          className="p-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2
            className="text-white font-black text-lg uppercase tracking-widest"
            style={{ fontWeight: 700 }}
          >
            &#128258; Propose Trade
          </h2>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            &#10005;
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Target team */}
          <div>
            <label
              className="text-xs font-black uppercase tracking-widest block mb-1.5"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Trade With
            </label>
            <select
              value={targetTeamId}
              onChange={e => { setTargetTeamId(e.target.value); setTheirPicks([]); setTheirOfferPlayers([]); }}
              className="w-full rounded-xl px-3 py-2 text-sm font-semibold text-white"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                outline: 'none',
              }}
            >
              <option value="" style={{ background: '#0d0d1a' }}>Select a team...</option>
              {NFL_TEAMS.filter(t => t.id !== session.userTeamId).map(team => (
                <option key={team.id} value={team.id} style={{ background: '#0d0d1a' }}>
                  {team.city} {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* My picks to send */}
            <div>
              <label
                className="text-xs font-black uppercase tracking-widest block mb-1.5"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                You Send (Value: {myValue})
              </label>
              <div className="space-y-1">
                {myPicks.map(pick => (
                  <button
                    key={pick.overall}
                    onClick={() => toggleMyPick(pick.overall)}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs transition-all font-semibold"
                    style={{
                      background: myOfferPicks.includes(pick.overall)
                        ? 'rgba(239,68,68,0.15)'
                        : 'rgba(255,255,255,0.04)',
                      border: myOfferPicks.includes(pick.overall)
                        ? '1px solid rgba(239,68,68,0.3)'
                        : '1px solid rgba(255,255,255,0.06)',
                      color: myOfferPicks.includes(pick.overall) ? '#f87171' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <span className="text-white/70">Pick #{pick.overall}</span>
                    <span className="text-white/30 ml-1">(R{pick.round})</span>
                    <span
                      className="float-right font-bold text-xs"
                      style={{ color: 'rgba(255,255,255,0.25)' }}
                    >
                      {getPickValue(pick.overall)} pts
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Their picks to receive */}
            <div>
              <label
                className="text-xs font-black uppercase tracking-widest block mb-1.5"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                You Receive (Value: {theirValue})
              </label>
              <div className="space-y-1">
                {targetTeamPicks.length === 0 ? (
                  <div className="text-xs px-2 py-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    Select a team first
                  </div>
                ) : (
                  targetTeamPicks.map(pick => (
                    <button
                      key={pick.overall}
                      onClick={() => toggleTheirPick(pick.overall)}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs transition-all font-semibold"
                      style={{
                        background: theirPicks.includes(pick.overall)
                          ? 'rgba(34,197,94,0.15)'
                          : 'rgba(255,255,255,0.04)',
                        border: theirPicks.includes(pick.overall)
                          ? '1px solid rgba(34,197,94,0.3)'
                          : '1px solid rgba(255,255,255,0.06)',
                        color: theirPicks.includes(pick.overall) ? '#4ade80' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      <span className="text-white/70">Pick #{pick.overall}</span>
                      <span className="text-white/30 ml-1">(R{pick.round})</span>
                      <span
                        className="float-right font-bold text-xs"
                        style={{ color: 'rgba(255,255,255,0.25)' }}
                      >
                        {getPickValue(pick.overall)} pts
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* INCLUDE PLAYERS section */}
          <div>
            <div
              className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}
            >
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              Include Players
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* My roster players */}
              <div>
                <div
                  className="text-xs font-semibold mb-2"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  Your Roster
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {myRoster.length === 0 ? (
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>No roster data</div>
                  ) : (
                    myRoster.map(player => {
                      const selected = myOfferPlayers.includes(player.id);
                      return (
                        <button
                          key={player.id}
                          onClick={() => toggleMyPlayer(player.id)}
                          className="w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center gap-2"
                          style={{
                            background: selected ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.03)',
                            border: selected ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                            style={{
                              background: `${getRatingColor(player.rating)}22`,
                              color: getRatingColor(player.rating),
                              fontSize: '9px',
                            }}
                          >
                            {player.rating}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className="text-xs font-semibold truncate"
                              style={{ color: selected ? '#f87171' : 'rgba(255,255,255,0.6)' }}
                            >
                              {player.name}
                            </div>
                            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                              {player.position} · {player.contractYears}yr
                            </div>
                          </div>
                          {selected && (
                            <div className="text-xs font-bold flex-shrink-0" style={{ color: '#f87171' }}>
                              &#10003;
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Their roster players */}
              <div>
                <div
                  className="text-xs font-semibold mb-2"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  Their Roster
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {!targetTeamId ? (
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Select a team first</div>
                  ) : targetRoster.length === 0 ? (
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>No roster data</div>
                  ) : (
                    targetRoster.map(player => {
                      const selected = theirOfferPlayers.includes(player.id);
                      return (
                        <button
                          key={player.id}
                          onClick={() => toggleTheirPlayer(player.id)}
                          className="w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center gap-2"
                          style={{
                            background: selected ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.03)',
                            border: selected ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                            style={{
                              background: `${getRatingColor(player.rating)}22`,
                              color: getRatingColor(player.rating),
                              fontSize: '9px',
                            }}
                          >
                            {player.rating}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className="text-xs font-semibold truncate"
                              style={{ color: selected ? '#4ade80' : 'rgba(255,255,255,0.6)' }}
                            >
                              {player.name}
                            </div>
                            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                              {player.position} · {player.contractYears}yr
                            </div>
                          </div>
                          {selected && (
                            <div className="text-xs font-bold flex-shrink-0" style={{ color: '#4ade80' }}>
                              &#10003;
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Selected player summary */}
            {(selectedMyPlayers.length > 0 || selectedTheirPlayers.length > 0) && (
              <div
                className="mt-2 p-2 rounded-xl text-xs"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex justify-between" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {selectedMyPlayers.length > 0 && (
                    <span>You include: {selectedMyPlayers.map(p => p.name).join(', ')} (+{myPlayerValue} pts)</span>
                  )}
                  {selectedTheirPlayers.length > 0 && (
                    <span>They include: {selectedTheirPlayers.map(p => p.name).join(', ')} (+{theirPlayerValue} pts)</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Value analysis */}
          {(myOfferPicks.length > 0 || theirPicks.length > 0 || myOfferPlayers.length > 0 || theirOfferPlayers.length > 0) && (
            <div
              className="rounded-xl p-3 text-sm font-semibold"
              style={{
                background: Math.abs(diff) <= myValue * 0.1
                  ? 'rgba(34,197,94,0.08)'
                  : diff > 0
                    ? 'rgba(239,68,68,0.08)'
                    : 'rgba(59,130,246,0.08)',
                border: Math.abs(diff) <= myValue * 0.1
                  ? '1px solid rgba(34,197,94,0.2)'
                  : diff > 0
                    ? '1px solid rgba(239,68,68,0.2)'
                    : '1px solid rgba(59,130,246,0.2)',
                color: Math.abs(diff) <= myValue * 0.1
                  ? '#4ade80'
                  : diff > 0
                    ? '#f87171'
                    : '#60a5fa',
              }}
            >
              {Math.abs(diff) <= myValue * 0.1
                ? '&#10003; Fair trade — likely to be accepted'
                : diff > 0
                  ? `&#9888; You're giving up ${diff} pts more — might be rejected`
                  : `&#10003; You're getting ${Math.abs(diff)} pts more in value`}
            </div>
          )}

          {/* Result */}
          {result && (
            <div
              className="rounded-xl p-3 text-center font-black text-sm uppercase tracking-widest"
              style={{
                fontWeight: 700,
                background: result === 'accepted' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                border: result === 'accepted' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)',
                color: result === 'accepted' ? '#4ade80' : '#f87171',
              }}
            >
              {result === 'accepted' ? '&#10003; TRADE ACCEPTED!' : '&#10005; Trade Rejected'}
            </div>
          )}

          <button
            onClick={handlePropose}
            disabled={
              !targetTeamId ||
              (myOfferPicks.length === 0 && myOfferPlayers.length === 0) ||
              (theirPicks.length === 0 && theirOfferPlayers.length === 0)
            }
            className="w-full font-black py-2.5 rounded-xl transition-all text-sm uppercase tracking-widest"
            style={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, rgba(180,130,0,0.3), rgba(180,130,0,0.15))',
              border: '1px solid rgba(180,130,0,0.4)',
              color: '#fbbf24',
              opacity: (!targetTeamId || (myOfferPicks.length === 0 && myOfferPlayers.length === 0) || (theirPicks.length === 0 && theirOfferPlayers.length === 0)) ? 0.4 : 1,
              cursor: (!targetTeamId || (myOfferPicks.length === 0 && myOfferPlayers.length === 0) || (theirPicks.length === 0 && theirOfferPlayers.length === 0)) ? 'not-allowed' : 'pointer',
            }}
          >
            Propose Trade
          </button>
        </div>
      </motion.div>
    </div>
  );
}
