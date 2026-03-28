import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFantasyStore, MOCK_PLAYERS } from '../store/fantasyStore';
import type { FantasyPlayer, DFSSlotType } from '../types/fantasy';

const S = {
  bg: '#0b0f18', surface: '#0f1623', elevated: '#141d2e',
  border: '#1c2d40', txt: '#cdd8e8', txtSub: '#6b82a0', txtMuted: '#334560',
  blue: '#3b7dd8', blueSub: 'rgba(59,125,216,0.12)',
  gold: '#c49a1a', goldSub: 'rgba(196,154,26,0.10)',
  green: '#1e8c4e', greenSub: 'rgba(30,140,78,0.12)',
  red: '#b53838', redSub: 'rgba(181,56,56,0.12)',
};
const font = 'system-ui, -apple-system, sans-serif';

const POS_COLORS: Record<string, { bg: string; color: string }> = {
  QB: { bg: 'rgba(181,56,56,0.18)', color: '#e06060' },
  RB: { bg: 'rgba(30,140,78,0.18)', color: '#4dc08a' },
  WR: { bg: 'rgba(59,125,216,0.18)', color: '#6fa8e8' },
  TE: { bg: 'rgba(196,154,26,0.18)', color: '#d4aa40' },
  K: { bg: 'rgba(107,130,160,0.18)', color: '#8fa8c8' },
  DEF: { bg: 'rgba(107,130,160,0.22)', color: '#a0b8d0' },
  DST: { bg: 'rgba(107,130,160,0.22)', color: '#a0b8d0' },
  FLEX: { bg: 'rgba(140,80,200,0.18)', color: '#c080f0' },
};

function PosBadge({ pos }: { pos: string }) {
  const c = POS_COLORS[pos] ?? { bg: 'rgba(59,125,216,0.15)', color: '#6b82a0' };
  return (
    <span style={{
      background: c.bg, borderRadius: 4, color: c.color, display: 'inline-block',
      fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', minWidth: 32,
      padding: '2px 6px', textAlign: 'center',
    }}>{pos}</span>
  );
}

// Slot definitions with eligible positions
const SLOT_CONFIG: Record<DFSSlotType, { label: string; eligible: string[] }> = {
  QB:   { label: 'QB',   eligible: ['QB'] },
  RB1:  { label: 'RB',   eligible: ['RB'] },
  RB2:  { label: 'RB',   eligible: ['RB'] },
  WR1:  { label: 'WR',   eligible: ['WR'] },
  WR2:  { label: 'WR',   eligible: ['WR'] },
  WR3:  { label: 'WR',   eligible: ['WR'] },
  TE:   { label: 'TE',   eligible: ['TE'] },
  FLEX: { label: 'FLEX', eligible: ['RB', 'WR', 'TE'] },
  DST:  { label: 'DST',  eligible: ['DEF'] },
};

// Generate CPU lineups for leaderboard
function generateCpuLineup(players: FantasyPlayer[], userScore: number, entryNum: number): {
  name: string;
  score: number;
  players: string[];
} {
  const names = [
    'GridironGuru', 'DraftKingz', 'TDMachine', 'FantasyPro', 'StackMaster',
    'WeeklyWinner', 'SleeperPick', 'NFLshark', 'ChalkPlayer', 'BreakoutFade',
  ];

  // Build a simple salary-constrained lineup
  const budget = 50000;
  let remaining = budget;
  const picked: FantasyPlayer[] = [];
  const positions: DFSSlotType[] = ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'WR3', 'TE', 'FLEX', 'DST'];
  const shuffled = [...players].sort(() => Math.random() - 0.5);

  for (const slot of positions) {
    const eligible = SLOT_CONFIG[slot].eligible;
    const usedIds = new Set(picked.map((p) => p.id));
    const candidates = shuffled.filter(
      (p) => eligible.includes(p.position) && !usedIds.has(p.id) && p.salary <= remaining
    );
    if (candidates.length > 0) {
      const idx = Math.floor(Math.random() * Math.min(candidates.length, 8));
      picked.push(candidates[idx]);
      remaining -= candidates[idx].salary;
    }
  }

  const rawScore = picked.reduce((acc, p) => {
    const variance = 0.6 + Math.random() * 0.8;
    return acc + p.avgPoints * variance;
  }, 0);

  // Spread scores around user's score
  const spread = (Math.random() - 0.5) * userScore * 0.4;
  const finalScore = Math.max(50, Math.round((rawScore + spread) * 10) / 10);

  return {
    name: names[entryNum % names.length],
    score: finalScore,
    players: picked.map((p) => p.id),
  };
}

export function DFSPage() {
  const navigate = useNavigate();
  const { dfsContest, players, setDFSSlot, lockDFSLineup } = useFantasyStore();
  const allPlayers: FantasyPlayer[] = players.length > 0 ? players : MOCK_PLAYERS;

  const [posFilter, setPosFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'projected' | 'salary'>('projected');
  const [focusedSlot, setFocusedSlot] = useState<DFSSlotType | null>(null);
  const [cpuEntries, setCpuEntries] = useState<Array<{ name: string; score: number; players: string[] }>>([]);

  // When lineup is locked, generate CPU entries once
  const handleLock = () => {
    if (!dfsContest) return;
    lockDFSLineup();
    const entries = Array.from({ length: 9 }, (_, i) =>
      generateCpuLineup(allPlayers, dfsContest.projectedPoints, i)
    );
    setCpuEntries(entries);
  };

  // Derive which players are already in lineup
  const usedPlayerIds = new Set((dfsContest?.lineup ?? []).map((s) => s.playerId).filter(Boolean));

  // Filter player pool
  const activeEligible = focusedSlot ? SLOT_CONFIG[focusedSlot].eligible : null;
  const filteredPlayers = useMemo(() => {
    return allPlayers
      .filter((p) => {
        if (posFilter !== 'ALL' && p.position !== posFilter && !(posFilter === 'DST' && p.position === 'DEF')) return false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.team.toLowerCase().includes(search.toLowerCase())) return false;
        if (activeEligible && !activeEligible.includes(p.position)) return false;
        return true;
      })
      .sort((a, b) => sortBy === 'projected' ? b.projectedPoints - a.projectedPoints : b.salary - a.salary);
  }, [allPlayers, posFilter, search, sortBy, activeEligible]);

  if (!dfsContest) {
    return (
      <div style={{ background: S.bg, minHeight: '100vh', fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: S.txt, fontSize: 18, fontWeight: 600, marginBottom: 12 }}>No active contest</div>
          <button
            onClick={() => navigate('/fantasy')}
            style={{
              background: S.blue, border: 'none', borderRadius: 6, color: '#fff',
              cursor: 'pointer', fontFamily: font, fontSize: 14, fontWeight: 600, padding: '10px 20px',
            }}
          >
            Go to Fantasy Hub
          </button>
        </div>
      </div>
    );
  }

  const filledCount = dfsContest.lineup.filter((s) => s.playerId !== null).length;
  const isOver = dfsContest.totalSalary > 50000;
  const canLock = filledCount === 9 && !isOver && !dfsContest.lockedIn;

  // Leaderboard: combine user + cpu
  const leaderboard = dfsContest.lockedIn
    ? [
        { name: 'You', score: dfsContest.score, isUser: true, players: dfsContest.lineup.map((s) => s.playerId ?? '') },
        ...cpuEntries.map((e) => ({ ...e, isUser: false })),
      ].sort((a, b) => b.score - a.score)
    : [];

  const userRank = dfsContest.lockedIn ? leaderboard.findIndex((e) => e.isUser) + 1 : 0;

  return (
    <div style={{ background: S.bg, minHeight: '100vh', fontFamily: font, display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <div style={{
        background: S.surface,
        borderBottom: `1px solid ${S.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 20px',
        height: 52,
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/fantasy')}
          style={{ background: 'none', border: 'none', color: S.txtSub, cursor: 'pointer', fontSize: 18, padding: 0 }}
        >
          ←
        </button>
        <span style={{ color: S.txt, fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>
          Gridiron<span style={{ color: S.blue }}>IQ</span>
        </span>
        <span style={{ color: S.txtMuted }}>|</span>
        <span style={{ color: S.txtSub, fontSize: 14 }}>DFS — {dfsContest.name}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: isOver ? S.redSub : S.greenSub,
            border: `1px solid ${isOver ? S.red : S.green}`,
            borderRadius: 5,
            color: isOver ? S.red : S.green,
            fontSize: 12,
            fontWeight: 700,
            padding: '4px 10px',
          }}>
            ${dfsContest.totalSalary.toLocaleString()} / $50,000
          </div>
          <div style={{ color: S.gold, fontSize: 13, fontWeight: 700 }}>
            {dfsContest.projectedPoints.toFixed(1)} pts proj.
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 52px)' }}>

        {/* ── Left Panel: Player Pool ── */}
        <div style={{
          width: 260,
          borderRight: `1px solid ${S.border}`,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          background: S.surface,
        }}>
          {/* Search */}
          <div style={{ padding: '12px 12px 8px' }}>
            <input
              style={{
                background: S.elevated,
                border: `1px solid ${S.border}`,
                borderRadius: 6,
                color: S.txt,
                fontFamily: font,
                fontSize: 13,
                outline: 'none',
                padding: '7px 10px',
                width: '100%',
                boxSizing: 'border-box',
              }}
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Pos filter */}
          <div style={{ display: 'flex', gap: 4, padding: '0 12px 8px', flexWrap: 'wrap' }}>
            {['ALL', 'QB', 'RB', 'WR', 'TE', 'DST'].map((pos) => (
              <button
                key={pos}
                onClick={() => setPosFilter(pos)}
                style={{
                  background: posFilter === pos ? S.blue : S.elevated,
                  border: `1px solid ${posFilter === pos ? S.blue : S.border}`,
                  borderRadius: 4,
                  color: posFilter === pos ? '#fff' : S.txtSub,
                  cursor: 'pointer',
                  fontFamily: font,
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '3px 8px',
                }}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', gap: 4, padding: '0 12px 10px' }}>
            {(['projected', 'salary'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                style={{
                  background: sortBy === s ? S.elevated : 'transparent',
                  border: `1px solid ${sortBy === s ? S.border : 'transparent'}`,
                  borderRadius: 4,
                  color: sortBy === s ? S.txt : S.txtMuted,
                  cursor: 'pointer',
                  fontFamily: font,
                  fontSize: 11,
                  padding: '3px 8px',
                }}
              >
                {s === 'projected' ? 'Projected ▼' : 'Salary ▼'}
              </button>
            ))}
          </div>

          {focusedSlot && (
            <div style={{
              background: S.goldSub,
              borderBottom: `1px solid ${S.border}`,
              color: S.gold,
              fontSize: 11,
              fontWeight: 600,
              padding: '6px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>Filling: {focusedSlot}</span>
              <button
                onClick={() => setFocusedSlot(null)}
                style={{ background: 'none', border: 'none', color: S.gold, cursor: 'pointer', fontSize: 13 }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Player list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* Column headers */}
            <div style={{
              background: S.elevated,
              borderBottom: `1px solid ${S.border}`,
              display: 'grid',
              gridTemplateColumns: '1fr 52px 48px 32px',
              padding: '5px 12px',
              gap: 4,
            }}>
              {['Player', 'Salary', 'Proj', ''].map((h) => (
                <div key={h} style={{ color: S.txtMuted, fontSize: 10, fontWeight: 600 }}>{h}</div>
              ))}
            </div>
            {filteredPlayers.map((player) => {
              const inLineup = usedPlayerIds.has(player.id);
              // Find the first open slot eligible for this player (prefer focused slot)
              const targetSlot: DFSSlotType | null = (() => {
                if (inLineup) return null;
                if (focusedSlot && SLOT_CONFIG[focusedSlot].eligible.includes(player.position)) {
                  const slot = dfsContest.lineup.find((s) => s.slot === focusedSlot && s.playerId === null);
                  if (slot) return focusedSlot;
                }
                const openSlot = dfsContest.lineup.find(
                  (s) => s.playerId === null && SLOT_CONFIG[s.slot].eligible.includes(player.position)
                );
                return openSlot ? openSlot.slot : null;
              })();
              const canAdd = targetSlot !== null;
              return (
                <DFSPlayerRow
                  key={player.id}
                  player={player}
                  inLineup={inLineup}
                  canAdd={canAdd}
                  isLocked={dfsContest.lockedIn}
                  onAdd={() => {
                    if (targetSlot) {
                      setDFSSlot(targetSlot, player.id);
                      setFocusedSlot(null);
                    }
                  }}
                  onRemove={() => {
                    // Find slot with this player and clear it
                    const slot = dfsContest.lineup.find((s) => s.playerId === player.id);
                    if (slot) setDFSSlot(slot.slot, null);
                  }}
                />
              );
            })}
            {filteredPlayers.length === 0 && (
              <div style={{ color: S.txtMuted, fontSize: 12, padding: '20px 12px', textAlign: 'center' }}>
                No players match filter
              </div>
            )}
          </div>
        </div>

        {/* ── Right Panel: Lineup + Leaderboard ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <div style={{ maxWidth: 520, margin: '0 auto' }}>

            {/* Lineup Card */}
            <div style={{
              background: S.surface,
              border: `1px solid ${S.border}`,
              borderRadius: 10,
              overflow: 'hidden',
              marginBottom: 20,
            }}>
              {/* Card header */}
              <div style={{
                background: S.elevated,
                borderBottom: `1px solid ${S.border}`,
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ color: S.txt, fontWeight: 700, fontSize: 15 }}>Your Lineup</div>
                  <div style={{ color: S.txtSub, fontSize: 12, marginTop: 2 }}>
                    {filledCount}/9 filled · Week {dfsContest.week}
                  </div>
                </div>
                {dfsContest.lockedIn && (
                  <div style={{
                    background: S.greenSub,
                    border: `1px solid ${S.green}`,
                    borderRadius: 6,
                    color: S.green,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '5px 12px',
                  }}>
                    ✓ Locked — {dfsContest.score.toFixed(1)} pts
                  </div>
                )}
              </div>

              {/* Slots */}
              {dfsContest.lineup.map((lineupSlot, i) => {
                const player = lineupSlot.playerId ? allPlayers.find((p) => p.id === lineupSlot.playerId) : null;
                const slotConfig = SLOT_CONFIG[lineupSlot.slot];
                const isFocused = focusedSlot === lineupSlot.slot;
                return (
                  <div
                    key={lineupSlot.slot}
                    style={{
                      borderBottom: i < dfsContest.lineup.length - 1 ? `1px solid ${S.border}` : 'none',
                      padding: '10px 18px',
                      display: 'grid',
                      gridTemplateColumns: '48px 1fr auto',
                      alignItems: 'center',
                      gap: 10,
                      background: isFocused ? 'rgba(59,125,216,0.08)' : player ? 'transparent' : 'rgba(20,29,46,0.3)',
                      cursor: !dfsContest.lockedIn ? 'pointer' : 'default',
                      transition: 'background 0.12s',
                    }}
                    onClick={() => {
                      if (dfsContest.lockedIn) return;
                      if (!player) {
                        setFocusedSlot(lineupSlot.slot);
                        setPosFilter(slotConfig.eligible[0] === 'DEF' ? 'DST' : slotConfig.eligible[0]);
                      }
                    }}
                  >
                    <PosBadge pos={slotConfig.label} />
                    {player ? (
                      <>
                        <div>
                          <div style={{ color: S.txt, fontSize: 13, fontWeight: 600 }}>{player.name}</div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                            <span style={{ color: S.txtMuted, fontSize: 11 }}>{player.team}</span>
                            <span style={{ color: S.gold, fontSize: 11, fontWeight: 600 }}>
                              ${player.salary.toLocaleString()}
                            </span>
                            <span style={{ color: S.green, fontSize: 11 }}>
                              {player.projectedPoints.toFixed(1)} pts
                            </span>
                          </div>
                        </div>
                        {!dfsContest.lockedIn && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDFSSlot(lineupSlot.slot, null);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: S.txtMuted,
                              cursor: 'pointer',
                              fontSize: 16,
                              padding: '2px 4px',
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </>
                    ) : (
                      <div style={{ color: isFocused ? S.blue : S.txtMuted, fontSize: 13 }}>
                        {isFocused ? `← Select a ${slotConfig.label}` : `Click to add ${slotConfig.eligible.join('/')}`}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Footer */}
              <div style={{
                background: S.elevated,
                borderTop: `1px solid ${S.border}`,
                padding: '14px 18px',
              }}>
                {/* Salary bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ color: S.txtSub, fontSize: 12 }}>Salary Used</span>
                    <span style={{ color: isOver ? S.red : S.txt, fontSize: 12, fontWeight: 700 }}>
                      ${dfsContest.totalSalary.toLocaleString()}
                      <span style={{ color: S.txtMuted, fontWeight: 400 }}> / $50,000</span>
                    </span>
                  </div>
                  <div style={{ background: S.border, borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <motion.div
                      style={{
                        background: isOver ? S.red : dfsContest.totalSalary > 45000 ? S.gold : S.green,
                        height: '100%',
                        borderRadius: 4,
                      }}
                      animate={{ width: `${Math.min(100, (dfsContest.totalSalary / 50000) * 100)}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ color: S.txtMuted, fontSize: 10 }}>
                      ${(50000 - dfsContest.totalSalary).toLocaleString()} remaining
                    </span>
                    <span style={{ color: S.gold, fontSize: 12, fontWeight: 700 }}>
                      {dfsContest.projectedPoints.toFixed(1)} pts projected
                    </span>
                  </div>
                </div>

                {!dfsContest.lockedIn && (
                  <button
                    onClick={handleLock}
                    disabled={!canLock}
                    style={{
                      background: canLock ? S.blue : S.elevated,
                      border: `1px solid ${canLock ? S.blue : S.border}`,
                      borderRadius: 7,
                      color: canLock ? '#fff' : S.txtMuted,
                      cursor: canLock ? 'pointer' : 'not-allowed',
                      fontFamily: font,
                      fontSize: 14,
                      fontWeight: 700,
                      padding: '11px 0',
                      width: '100%',
                      letterSpacing: '0.02em',
                      transition: 'all 0.15s',
                    }}
                  >
                    {filledCount < 9 ? `Fill ${9 - filledCount} More Slot${9 - filledCount !== 1 ? 's' : ''}` : isOver ? 'Over Salary Cap' : 'Lock In Lineup'}
                  </button>
                )}
              </div>
            </div>

            {/* ── Leaderboard ── */}
            <AnimatePresence>
              {dfsContest.lockedIn && leaderboard.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: S.surface,
                    border: `1px solid ${S.border}`,
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    background: S.elevated,
                    borderBottom: `1px solid ${S.border}`,
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div style={{ color: S.txt, fontWeight: 700, fontSize: 15 }}>Leaderboard</div>
                    <div style={{
                      background: userRank === 1 ? S.goldSub : S.blueSub,
                      border: `1px solid ${userRank === 1 ? S.gold : S.blue}`,
                      borderRadius: 5,
                      color: userRank === 1 ? S.gold : S.blue,
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '4px 10px',
                    }}>
                      {userRank === 1 ? '🏆 ' : ''}Rank #{userRank}
                    </div>
                  </div>

                  {leaderboard.map((entry, i) => (
                    <div
                      key={i}
                      style={{
                        background: entry.isUser ? 'rgba(59,125,216,0.07)' : 'transparent',
                        borderBottom: i < leaderboard.length - 1 ? `1px solid ${S.border}` : 'none',
                        borderLeft: entry.isUser ? `3px solid ${S.blue}` : '3px solid transparent',
                        padding: '11px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <div style={{
                        color: i === 0 ? S.gold : i < 3 ? S.txt : S.txtMuted,
                        fontSize: 15,
                        fontWeight: 700,
                        minWidth: 24,
                        textAlign: 'center',
                      }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: entry.isUser ? S.blue : S.txt, fontSize: 13, fontWeight: entry.isUser ? 700 : 500 }}>
                            {entry.name}
                          </span>
                          {entry.isUser && (
                            <span style={{ background: S.blueSub, color: S.blue, borderRadius: 3, fontSize: 9, padding: '1px 5px', fontWeight: 700 }}>
                              YOU
                            </span>
                          )}
                        </div>
                        <div style={{ color: S.txtMuted, fontSize: 11, marginTop: 2 }}>
                          {entry.players.slice(0, 3).map((pid) => {
                            const p = allPlayers.find((pl) => pl.id === pid);
                            return p ? p.name.split(' ').slice(-1)[0] : '';
                          }).filter(Boolean).join(', ')}
                          {entry.players.length > 3 && ` +${entry.players.length - 3} more`}
                        </div>
                      </div>
                      <div style={{
                        color: i === 0 ? S.gold : entry.isUser ? S.blue : S.txt,
                        fontSize: 18,
                        fontWeight: 700,
                        textAlign: 'right',
                      }}>
                        {entry.score.toFixed(1)}
                        <div style={{ color: S.txtMuted, fontSize: 10, fontWeight: 400, marginTop: 1 }}>pts</div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
}

function DFSPlayerRow({
  player,
  inLineup,
  canAdd,
  isLocked,
  onAdd,
  onRemove,
}: {
  player: FantasyPlayer;
  inLineup: boolean;
  canAdd: boolean;
  isLocked: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const pc = POS_COLORS[player.position] ?? { bg: 'rgba(59,125,216,0.15)', color: '#6b82a0' };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: inLineup
          ? 'rgba(30,140,78,0.07)'
          : hovered
          ? S.elevated
          : 'transparent',
        borderBottom: `1px solid ${S.border}`,
        display: 'grid',
        gridTemplateColumns: '1fr 52px 48px 32px',
        gap: 4,
        padding: '8px 12px',
        transition: 'background 0.1s',
        alignItems: 'center',
      }}
    >
      <div style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
          <span style={{
            background: pc.bg, borderRadius: 4, color: pc.color, fontSize: 9, fontWeight: 700,
            padding: '1px 5px', flexShrink: 0,
          }}>
            {player.position}
          </span>
          <span style={{ color: S.txt, fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {player.name}
          </span>
        </div>
        <span style={{ color: S.txtMuted, fontSize: 10 }}>{player.team}</span>
      </div>
      <div style={{ color: S.txtSub, fontSize: 11, textAlign: 'right' }}>
        ${(player.salary / 1000).toFixed(1)}k
      </div>
      <div style={{ color: S.gold, fontSize: 11, fontWeight: 600, textAlign: 'right' }}>
        {player.projectedPoints.toFixed(1)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {inLineup ? (
          !isLocked && (
            <button
              onClick={onRemove}
              style={{
                background: 'none',
                border: 'none',
                color: S.red,
                cursor: 'pointer',
                fontSize: 14,
                padding: 0,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          )
        ) : canAdd && !isLocked ? (
          <button
            onClick={onAdd}
            style={{
              background: hovered ? S.blue : S.blueSub,
              border: `1px solid ${S.blue}`,
              borderRadius: 3,
              color: hovered ? '#fff' : S.blue,
              cursor: 'pointer',
              fontFamily: font,
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 5px',
              lineHeight: 1.4,
              transition: 'all 0.1s',
            }}
          >
            +
          </button>
        ) : null}
      </div>
    </div>
  );
}
