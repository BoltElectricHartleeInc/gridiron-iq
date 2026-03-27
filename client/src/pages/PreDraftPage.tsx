import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraftStore } from '../store/draftStore';
import { NFL_TEAMS } from '../data/teams';
import { getPickValue, getPicksValue } from '../data/tradeChart';
import type { NFLTeam } from '../types/draft';

const S = {
  bg:       '#0b0f18',
  surface:  '#0f1623',
  elevated: '#141d2e',
  border:   '#1c2d40',
  borderHi: '#253352',
  txt:      '#cdd8e8',
  txtSub:   '#6b82a0',
  txtMuted: '#334560',
  blue:     '#3b7dd8',
  blueSub:  'rgba(59,125,216,0.10)',
  gold:     '#c49a1a',
  goldSub:  'rgba(196,154,26,0.10)',
  green:    '#1e8c4e',
  greenSub: 'rgba(30,140,78,0.10)',
  red:      '#b53838',
  redSub:   'rgba(181,56,56,0.10)',
};

function getPickLabel(overall: number): string {
  const round = Math.ceil(overall / 32);
  const pickInRound = overall - (round - 1) * 32;
  return `R${round} P${pickInRound} (#${overall})`;
}

interface TradeLogEntry {
  id: string;
  fromTeam: string;
  toTeam: string;
  sent: number[];
  received: number[];
}

export function PreDraftPage() {
  const navigate = useNavigate();
  const { session, acceptTrade } = useDraftStore();

  const [selectedTeam, setSelectedTeam] = useState<NFLTeam | null>(null);
  const [userSendPicks, setUserSendPicks] = useState<number[]>([]);
  const [theirSendPicks, setTheirSendPicks] = useState<number[]>([]);
  const [tradeLog, setTradeLog] = useState<TradeLogEntry[]>([]);
  const [tradeResult, setTradeResult] = useState<'accepted' | 'rejected' | null>(null);

  if (!session) {
    navigate('/draft/select');
    return null;
  }

  const userTeam = NFL_TEAMS.find(t => t.id === session.userTeamId);

  // Get current picks per team from session
  const userPicksList = session.picks.filter(p => p.teamId === session.userTeamId && !p.prospect).map(p => p.overall).sort((a, b) => a - b);

  const getTeamPicks = (teamId: string) =>
    session.picks.filter(p => p.teamId === teamId && !p.prospect).map(p => p.overall).sort((a, b) => a - b);

  const handleTeamClick = (team: NFLTeam) => {
    if (team.id === session.userTeamId) return;
    setSelectedTeam(team);
    setUserSendPicks([]);
    setTheirSendPicks([]);
    setTradeResult(null);
  };

  const toggleUserPick = (overall: number) => {
    setUserSendPicks(prev =>
      prev.includes(overall) ? prev.filter(p => p !== overall) : [...prev, overall]
    );
  };

  const toggleTheirPick = (overall: number) => {
    setTheirSendPicks(prev =>
      prev.includes(overall) ? prev.filter(p => p !== overall) : [...prev, overall]
    );
  };

  const handleProposeTrade = () => {
    if (!selectedTeam || userSendPicks.length === 0 || theirSendPicks.length === 0) return;

    const offerValue = getPicksValue(userSendPicks);
    const receiveValue = getPicksValue(theirSendPicks);
    const accepted = receiveValue >= offerValue * 0.9;

    setTradeResult(accepted ? 'accepted' : 'rejected');

    if (accepted) {
      acceptTrade({
        offeringTeamId: session.userTeamId,
        receivingTeamId: selectedTeam.id,
        offeringPicks: userSendPicks,
        receivingPicks: theirSendPicks,
        jimJohnsonValue: receiveValue - offerValue,
      });
      setTradeLog(prev => [{
        id: crypto.randomUUID(),
        fromTeam: userTeam?.abbreviation ?? 'YOU',
        toTeam: selectedTeam.abbreviation,
        sent: [...userSendPicks],
        received: [...theirSendPicks],
      }, ...prev]);
      setUserSendPicks([]);
      setTheirSendPicks([]);
    }

    setTimeout(() => setTradeResult(null), 2500);
  };

  const offerValue = getPicksValue(userSendPicks);
  const receiveValue = getPicksValue(theirSendPicks);
  const valueDiff = receiveValue - offerValue;
  const isFair = receiveValue >= offerValue * 0.9;
  const totalValue = Math.max(offerValue, receiveValue, 1);
  const userBarPct = Math.min(100, Math.round((offerValue / totalValue) * 100));
  const theirBarPct = Math.min(100, Math.round((receiveValue / totalValue) * 100));

  const selectedTeamPicks = selectedTeam ? getTeamPicks(selectedTeam.id) : [];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: S.bg, fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}>

      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px', height: 48, background: S.surface, borderBottom: `1px solid ${S.border}`, flexShrink: 0, gap: 16 }}>
        <button
          onClick={() => navigate('/draft/select')}
          style={{ fontSize: 12, color: S.txtSub, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ← Back
        </button>
        <div style={{ width: 1, height: 16, background: S.border }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: S.txt }}>
          Gridiron<span style={{ color: S.gold }}>IQ</span>
        </span>
        <div style={{ width: 1, height: 16, background: S.border }} />
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.txtMuted }}>
          Pre-Draft War Room
        </span>
        {userTeam && (
          <>
            <div style={{ width: 1, height: 16, background: S.border }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: userTeam.primaryColor, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: S.txt }}>{userTeam.city} {userTeam.name}</span>
            </div>
          </>
        )}
        <div style={{ marginLeft: 'auto' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/draft/board')}
            style={{ padding: '8px 20px', borderRadius: 7, background: `linear-gradient(135deg, ${S.green}cc, ${S.green}88)`, border: `1px solid ${S.green}55`, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em', boxShadow: `0 4px 16px ${S.green}33` }}
          >
            Enter Draft Room →
          </motion.button>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left: Your Picks */}
        <div style={{ width: 220, display: 'flex', flexDirection: 'column', background: S.surface, borderRight: `1px solid ${S.border}`, flexShrink: 0 }}>
          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${S.border}` }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.txtMuted }}>Your Picks</div>
            <div style={{ fontSize: 10, color: S.txtSub, marginTop: 2 }}>{userPicksList.length} picks total</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {userPicksList.map(overall => {
              const round = Math.ceil(overall / 32);
              const pickInRound = overall - (round - 1) * 32;
              return (
                <div
                  key={overall}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderBottom: `1px solid ${S.border}` }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 5, background: S.elevated, border: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: S.txtSub, fontVariantNumeric: 'tabular-nums' }}>#{overall}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: S.txt }}>Round {round}</div>
                    <div style={{ fontSize: 10, color: S.txtMuted }}>Pick {pickInRound} · {getPickValue(overall)} pts</div>
                  </div>
                </div>
              );
            })}
            {userPicksList.length === 0 && (
              <div style={{ padding: '16px 12px', fontSize: 11, color: S.txtMuted }}>No picks remaining</div>
            )}
          </div>
        </div>

        {/* Center: Team Grid + Trade Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Team grid header */}
          <div style={{ padding: '8px 12px', borderBottom: `1px solid ${S.border}`, background: S.elevated }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.txtMuted }}>
              Select a Team to Propose a Trade
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {/* Team grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 16 }}>
              {NFL_TEAMS.filter(t => t.id !== session.userTeamId).map(team => {
                const isSelected = selectedTeam?.id === team.id;
                const teamPicks = getTeamPicks(team.id);
                return (
                  <motion.div
                    key={team.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTeamClick(team)}
                    style={{ padding: '10px', borderRadius: 8, cursor: 'pointer', background: isSelected ? `linear-gradient(135deg, ${team.primaryColor}18, ${S.elevated})` : S.elevated, border: `1px solid ${isSelected ? team.primaryColor + '55' : S.border}`, boxShadow: isSelected ? `0 0 14px ${team.primaryColor}22` : 'none', transition: 'all 0.12s' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <div style={{ width: 3, height: 20, borderRadius: 2, background: team.primaryColor, opacity: isSelected ? 1 : 0.5 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: isSelected ? S.txt : S.txtSub }}>{team.abbreviation}</div>
                        <div style={{ fontSize: 9, color: S.txtMuted }}>{teamPicks.length} picks</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: S.txtSub }}>{team.city} {team.name}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Trade panel */}
            <AnimatePresence>
              {selectedTeam && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{ borderRadius: 10, background: S.surface, border: `1px solid ${selectedTeam.primaryColor}40`, overflow: 'hidden' }}
                >
                  {/* Trade panel header */}
                  <div
                    style={{ padding: '10px 14px', borderBottom: `1px solid ${S.border}`, background: `linear-gradient(135deg, ${selectedTeam.primaryColor}12, ${S.elevated})` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: selectedTeam.primaryColor, flexShrink: 0, boxShadow: `0 0 12px ${selectedTeam.primaryColor}55` }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: S.txt }}>{selectedTeam.city} {selectedTeam.name}</div>
                        <div style={{ fontSize: 10, color: S.txtSub }}>Propose a trade — select picks from both sides</div>
                      </div>
                      <button
                        onClick={() => setSelectedTeam(null)}
                        style={{ marginLeft: 'auto', fontSize: 11, color: S.txtMuted, background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {/* User picks to send */}
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.red, marginBottom: 8 }}>
                        You Send
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {userPicksList.map(overall => {
                          const selected = userSendPicks.includes(overall);
                          return (
                            <div
                              key={overall}
                              onClick={() => toggleUserPick(overall)}
                              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, cursor: 'pointer', background: selected ? S.redSub : S.elevated, border: `1px solid ${selected ? 'rgba(181,56,56,0.4)' : S.border}`, transition: 'all 0.1s' }}
                            >
                              <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${selected ? S.red : S.txtMuted}`, background: selected ? S.red : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {selected && <span style={{ fontSize: 9, color: '#fff', fontWeight: 900 }}>✓</span>}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: selected ? '#e07070' : S.txtSub }}>{getPickLabel(overall)}</div>
                                <div style={{ fontSize: 9, color: S.txtMuted }}>{getPickValue(overall)} pts</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Their picks to receive */}
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.green, marginBottom: 8 }}>
                        You Receive
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {selectedTeamPicks.map(overall => {
                          const selected = theirSendPicks.includes(overall);
                          return (
                            <div
                              key={overall}
                              onClick={() => toggleTheirPick(overall)}
                              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, cursor: 'pointer', background: selected ? S.greenSub : S.elevated, border: `1px solid ${selected ? 'rgba(30,140,78,0.4)' : S.border}`, transition: 'all 0.1s' }}
                            >
                              <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${selected ? S.green : S.txtMuted}`, background: selected ? S.green : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {selected && <span style={{ fontSize: 9, color: '#fff', fontWeight: 900 }}>✓</span>}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: selected ? '#4ade80' : S.txtSub }}>{getPickLabel(overall)}</div>
                                <div style={{ fontSize: 9, color: S.txtMuted }}>{getPickValue(overall)} pts</div>
                              </div>
                            </div>
                          );
                        })}
                        {selectedTeamPicks.length === 0 && (
                          <div style={{ fontSize: 11, color: S.txtMuted, padding: '6px 10px' }}>No picks available</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Value bar */}
                  {(userSendPicks.length > 0 || theirSendPicks.length > 0) && (
                    <div style={{ padding: '0 14px 10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 10, color: S.txtSub }}>
                        <span>You send: {offerValue} pts</span>
                        <span style={{ color: isFair ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                          {valueDiff > 0 ? `+${valueDiff} in your favor` : valueDiff < 0 ? `${valueDiff} pts` : 'Even'}
                        </span>
                        <span>You receive: {receiveValue} pts</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: S.border, overflow: 'hidden', display: 'flex' }}>
                        <div style={{ height: '100%', width: `${userBarPct}%`, background: 'linear-gradient(to right, #b53838, #e07070)', borderRadius: '3px 0 0 3px', transition: 'width 0.3s' }} />
                        <div style={{ height: '100%', width: `${theirBarPct}%`, background: 'linear-gradient(to right, #1e8c4e, #4ade80)', borderRadius: '0 3px 3px 0', marginLeft: 'auto', transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  )}

                  {/* Result feedback */}
                  <AnimatePresence>
                    {tradeResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ margin: '0 14px 10px', padding: '10px', borderRadius: 7, textAlign: 'center', fontSize: 12, fontWeight: 700, background: tradeResult === 'accepted' ? 'rgba(30,140,78,0.15)' : 'rgba(181,56,56,0.12)', border: `1px solid ${tradeResult === 'accepted' ? 'rgba(30,140,78,0.4)' : 'rgba(181,56,56,0.3)'}`, color: tradeResult === 'accepted' ? '#4ade80' : '#f87171' }}
                      >
                        {tradeResult === 'accepted' ? 'Trade Accepted!' : 'Trade Rejected — try offering more value'}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Propose button */}
                  <div style={{ padding: '0 14px 14px' }}>
                    <button
                      onClick={handleProposeTrade}
                      disabled={userSendPicks.length === 0 || theirSendPicks.length === 0}
                      style={{ width: '100%', padding: '10px', borderRadius: 7, background: userSendPicks.length > 0 && theirSendPicks.length > 0 ? `linear-gradient(135deg, ${selectedTeam.primaryColor}cc, ${selectedTeam.primaryColor}88)` : S.elevated, border: `1px solid ${userSendPicks.length > 0 && theirSendPicks.length > 0 ? selectedTeam.primaryColor + '55' : S.border}`, color: userSendPicks.length > 0 && theirSendPicks.length > 0 ? '#fff' : S.txtMuted, fontSize: 12, fontWeight: 700, cursor: userSendPicks.length > 0 && theirSendPicks.length > 0 ? 'pointer' : 'not-allowed', letterSpacing: '0.05em', transition: 'all 0.15s' }}
                    >
                      Propose Trade
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Trade Log */}
        <div style={{ width: 240, display: 'flex', flexDirection: 'column', background: S.surface, borderLeft: `1px solid ${S.border}`, flexShrink: 0 }}>
          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${S.border}` }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.txtMuted }}>Trade Log</div>
            <div style={{ fontSize: 10, color: S.txtSub, marginTop: 2 }}>{tradeLog.length} pre-draft trades</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {tradeLog.length === 0 && (
              <div style={{ padding: '16px 12px', fontSize: 11, color: S.txtMuted, lineHeight: 1.6 }}>
                No trades yet. Click a team to start negotiating.
              </div>
            )}
            {tradeLog.map(entry => (
              <div
                key={entry.id}
                style={{ padding: '8px 12px', borderBottom: `1px solid ${S.border}` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: S.green }}>✓ Trade Complete</span>
                </div>
                <div style={{ fontSize: 10, color: S.txtSub, marginBottom: 3 }}>
                  <span style={{ color: S.txt, fontWeight: 600 }}>{entry.fromTeam}</span> sent:{' '}
                  {entry.sent.map(o => `#${o}`).join(', ')}
                </div>
                <div style={{ fontSize: 10, color: S.txtSub }}>
                  <span style={{ color: S.txt, fontWeight: 600 }}>{entry.toTeam}</span> sent:{' '}
                  {entry.received.map(o => `#${o}`).join(', ')}
                </div>
              </div>
            ))}
          </div>

          {/* Enter draft button at bottom */}
          <div style={{ padding: '14px 12px', borderTop: `1px solid ${S.border}` }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/draft/board')}
              style={{ width: '100%', padding: '11px', borderRadius: 7, background: `linear-gradient(135deg, ${S.green}cc, ${S.green}88)`, border: `1px solid ${S.green}55`, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em', boxShadow: `0 4px 16px ${S.green}33` }}
            >
              Enter Draft Room →
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
