import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFantasyStore, getDraftPickTeam, MOCK_PLAYERS } from '../store/fantasyStore';
import type { FantasyPlayer } from '../types/fantasy';

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
};

function PosBadge({ pos }: { pos: string }) {
  const c = POS_COLORS[pos] ?? { bg: 'rgba(59,125,216,0.15)', color: '#6b82a0' };
  return (
    <span style={{
      background: c.bg,
      borderRadius: 4,
      color: c.color,
      display: 'inline-block',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.04em',
      minWidth: 30,
      padding: '2px 6px',
      textAlign: 'center',
    }}>
      {pos}
    </span>
  );
}

const PICK_CLOCK = 90; // seconds

export function FantasyDraftPage() {
  const navigate = useNavigate();
  const { league, players, makeDraftPick, lastCpuPick, clearLastCpuPick } = useFantasyStore();

  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState<string>('ALL');
  const [clockTime, setClockTime] = useState(PICK_CLOCK);
  const [toast, setToast] = useState<string | null>(null);
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const allPlayers: FantasyPlayer[] = players.length > 0 ? players : MOCK_PLAYERS;

  // If no league, redirect
  useEffect(() => {
    if (!league) navigate('/fantasy');
  }, [league, navigate]);

  // Start draft if pending
  useEffect(() => {
    if (league?.draftStatus === 'pending') {
      useFantasyStore.setState((s) => ({
        league: s.league ? { ...s.league, draftStatus: 'drafting' } : null,
      }));
    }
  }, []);

  // Redirect on draft complete
  useEffect(() => {
    if (league?.draftStatus === 'complete') {
      setTimeout(() => navigate('/fantasy/league'), 2000);
    }
  }, [league?.draftStatus, navigate]);

  // CPU pick toast
  useEffect(() => {
    if (lastCpuPick) {
      setToast(`${lastCpuPick.teamName} selected ${lastCpuPick.playerName}`);
      clearLastCpuPick();
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [lastCpuPick, clearLastCpuPick]);

  // Pick clock
  useEffect(() => {
    if (!league || league.draftStatus !== 'drafting') return;
    const userTeam = league.teams.find((t) => t.isUser);
    if (!userTeam) return;
    const currentTeamId = getDraftPickTeam(
      league.currentDraftPick,
      league.draftOrder.length,
      league.draftOrder
    );
    const isMyTurn = currentTeamId === userTeam.id;
    if (!isMyTurn) {
      setClockTime(PICK_CLOCK);
      return;
    }
    setClockTime(PICK_CLOCK);
    clockRef.current = setInterval(() => {
      setClockTime((t) => {
        if (t <= 1) {
          // Auto-pick best available
          const available = allPlayers.filter((p) => !league.draftedPlayerIds.includes(p.id));
          if (available.length > 0) makeDraftPick(available[0].id);
          return PICK_CLOCK;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (clockRef.current) clearInterval(clockRef.current);
    };
  }, [league?.currentDraftPick, league?.draftStatus]);

  if (!league) return null;

  const userTeam = league.teams.find((t) => t.isUser);
  const totalPicks = league.settings.rosterSize * league.settings.teamCount;
  const currentTeamId = getDraftPickTeam(
    league.currentDraftPick,
    league.draftOrder.length,
    league.draftOrder
  );
  const currentTeam = league.teams.find((t) => t.id === currentTeamId);
  const isMyTurn = currentTeamId === userTeam?.id;

  const available = allPlayers
    .filter((p) => !league.draftedPlayerIds.includes(p.id))
    .filter((p) => posFilter === 'ALL' || p.position === posFilter)
    .filter((p) =>
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.team.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.rank - b.rank);

  const userRoster = allPlayers.filter((p) => userTeam?.roster.includes(p.id));

  const clockPct = (clockTime / PICK_CLOCK) * 100;
  const clockColor = clockTime > 30 ? S.green : clockTime > 10 ? S.gold : S.red;

  // Draft board: group by round
  const roundCount = league.settings.rosterSize;
  const teamCount = league.settings.teamCount;

  const draftBoard: Array<{ round: number; picks: Array<{ teamId: string; playerId: string | null }> }> = [];
  for (let r = 0; r < roundCount; r++) {
    const picks = [];
    for (let i = 0; i < teamCount; i++) {
      const pickIdx = r * teamCount + i;
      const teamId = getDraftPickTeam(pickIdx, teamCount, league.draftOrder);
      const team = league.teams.find((t) => t.id === teamId);
      // Find which player was drafted by this team at this round
      const teamRosterAtRound = team?.roster[r] ?? null;
      picks.push({ teamId, playerId: teamRosterAtRound ?? null });
    }
    draftBoard.push({ round: r + 1, picks });
  }

  return (
    <div style={{ background: S.bg, minHeight: '100vh', fontFamily: font, display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <div style={{
        background: S.surface,
        borderBottom: `1px solid ${S.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px',
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
        <span style={{ color: S.txtMuted, fontSize: 14 }}>|</span>
        <span style={{ color: S.txtSub, fontSize: 14 }}>Snake Draft</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: S.txtSub, fontSize: 12 }}>
            Pick {league.currentDraftPick + 1} / {totalPicks}
          </span>
          <div style={{
            background: isMyTurn ? S.greenSub : S.elevated,
            border: `1px solid ${isMyTurn ? S.green : S.border}`,
            borderRadius: 6,
            color: isMyTurn ? S.green : S.txtSub,
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 10px',
          }}>
            {league.draftStatus === 'complete' ? 'Draft Complete!' : isMyTurn ? 'Your Pick' : `${currentTeam?.name ?? 'CPU'} Picking`}
          </div>
        </div>
      </div>

      {/* Draft Complete Banner */}
      <AnimatePresence>
        {league.draftStatus === 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: S.greenSub,
              border: `1px solid ${S.green}`,
              padding: '12px 20px',
              textAlign: 'center',
              color: S.green,
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Draft Complete! Redirecting to your league...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            style={{
              position: 'fixed',
              top: 64,
              right: 16,
              zIndex: 100,
              background: S.elevated,
              border: `1px solid ${S.border}`,
              borderLeft: `3px solid ${S.gold}`,
              borderRadius: 8,
              color: S.txt,
              fontSize: 13,
              padding: '10px 16px',
              maxWidth: 280,
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            <span style={{ color: S.gold, fontWeight: 600 }}>CPU Pick: </span>{toast.replace('selected', '→')}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 52px)' }}>

        {/* ── Left Panel: Available Players ── */}
        <div style={{
          width: 240,
          borderRight: `1px solid ${S.border}`,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          background: S.surface,
        }}>
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

          {/* Position filter */}
          <div style={{ display: 'flex', gap: 4, padding: '0 12px 10px', flexWrap: 'wrap' }}>
            {['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'].map((pos) => (
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
                  padding: '3px 7px',
                }}
              >
                {pos}
              </button>
            ))}
          </div>

          <div style={{ color: S.txtMuted, fontSize: 11, padding: '0 12px 6px', fontWeight: 500 }}>
            {available.length} available
          </div>

          {/* Player list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {available.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                isMyTurn={isMyTurn && league.draftStatus === 'drafting'}
                onDraft={() => makeDraftPick(player.id)}
              />
            ))}
            {available.length === 0 && (
              <div style={{ color: S.txtMuted, fontSize: 13, padding: '20px 12px', textAlign: 'center' }}>
                No players found
              </div>
            )}
          </div>
        </div>

        {/* ── Center: Draft Board ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            borderBottom: `1px solid ${S.border}`,
            overflowX: 'auto',
            flexShrink: 0,
          }}>
            {/* Team headers */}
            <div style={{ display: 'flex', minWidth: teamCount * 100 + 60 }}>
              <div style={{
                width: 60,
                borderRight: `1px solid ${S.border}`,
                background: S.elevated,
                padding: '8px',
                color: S.txtMuted,
                fontSize: 11,
                fontWeight: 600,
                flexShrink: 0,
              }}>
                RND
              </div>
              {league.draftOrder.map((teamId) => {
                const team = league.teams.find((t) => t.id === teamId);
                const isUser = team?.isUser;
                return (
                  <div key={teamId} style={{
                    width: 100,
                    borderRight: `1px solid ${S.border}`,
                    background: isUser ? 'rgba(59,125,216,0.06)' : S.elevated,
                    padding: '7px 8px',
                    borderBottom: `2px solid ${isUser ? S.blue : 'transparent'}`,
                    flexShrink: 0,
                  }}>
                    <div style={{ color: isUser ? S.blue : S.txt, fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {team?.name}
                    </div>
                    {isUser && <div style={{ color: S.blue, fontSize: 9, fontWeight: 700, marginTop: 1 }}>YOU</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
            {draftBoard.map(({ round, picks }) => (
              <div key={round} style={{ display: 'flex', minWidth: teamCount * 100 + 60, borderBottom: `1px solid ${S.border}` }}>
                <div style={{
                  width: 60,
                  borderRight: `1px solid ${S.border}`,
                  flexShrink: 0,
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: S.elevated,
                }}>
                  <span style={{ color: S.txtMuted, fontSize: 12, fontWeight: 700 }}>{round}</span>
                </div>
                {picks.map(({ teamId, playerId }, i) => {
                  const pickIdx = (round - 1) * teamCount + i;
                  const isCurrent = pickIdx === league.currentDraftPick && league.draftStatus === 'drafting';
                  const team = league.teams.find((t) => t.id === teamId);
                  const pickedPlayer = playerId ? allPlayers.find((p) => p.id === playerId) : null;
                  return (
                    <div key={i} style={{
                      width: 100,
                      borderRight: `1px solid ${S.border}`,
                      flexShrink: 0,
                      padding: '5px 6px',
                      background: isCurrent
                        ? 'rgba(59,125,216,0.1)'
                        : team?.isUser
                        ? 'rgba(59,125,216,0.03)'
                        : 'transparent',
                      outline: isCurrent ? `1px solid ${S.blue}` : 'none',
                      outlineOffset: -1,
                      minHeight: 44,
                    }}>
                      {pickedPlayer ? (
                        <>
                          <div style={{ marginBottom: 2 }}>
                            <PosBadge pos={pickedPlayer.position} />
                          </div>
                          <div style={{ color: S.txt, fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pickedPlayer.name.split(' ').slice(-1)[0]}
                          </div>
                          <div style={{ color: S.txtMuted, fontSize: 10 }}>{pickedPlayer.team}</div>
                        </>
                      ) : isCurrent ? (
                        <div style={{ color: S.blue, fontSize: 10, fontWeight: 600, paddingTop: 4 }}>
                          {team?.isUser ? '⬅ YOUR PICK' : 'Picking...'}
                        </div>
                      ) : (
                        <div style={{ color: S.txtMuted, fontSize: 10, paddingTop: 4 }}>–</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Panel: Your Roster + Clock ── */}
        <div style={{
          width: 200,
          borderLeft: `1px solid ${S.border}`,
          background: S.surface,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}>
          {/* Pick clock */}
          {isMyTurn && league.draftStatus === 'drafting' && (
            <div style={{
              background: S.elevated,
              borderBottom: `1px solid ${S.border}`,
              padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: S.txtSub, fontSize: 11, fontWeight: 600 }}>PICK CLOCK</span>
                <span style={{ color: clockColor, fontSize: 18, fontWeight: 700 }}>{clockTime}s</span>
              </div>
              <div style={{ background: S.border, borderRadius: 4, height: 5, overflow: 'hidden' }}>
                <motion.div
                  style={{
                    background: clockColor,
                    height: '100%',
                    borderRadius: 4,
                    width: `${clockPct}%`,
                  }}
                  animate={{ width: `${clockPct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          <div style={{ padding: '10px 14px 6px' }}>
            <div style={{ color: S.txtSub, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em' }}>
              YOUR ROSTER
            </div>
            <div style={{ color: S.txtMuted, fontSize: 11, marginTop: 2 }}>
              {userRoster.length} / {league.settings.rosterSize}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {userRoster.length === 0 && (
              <div style={{ color: S.txtMuted, fontSize: 12, padding: '12px 14px', textAlign: 'center' }}>
                No picks yet
              </div>
            )}
            {userRoster.map((player, i) => (
              <div key={player.id} style={{
                borderBottom: `1px solid ${S.border}`,
                padding: '7px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span style={{ color: S.txtMuted, fontSize: 10, minWidth: 14 }}>{i + 1}</span>
                <PosBadge pos={player.position} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ color: S.txt, fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {player.name.split(' ').slice(-1)[0]}
                  </div>
                  <div style={{ color: S.txtMuted, fontSize: 10 }}>{player.team}</div>
                </div>
                <div style={{ color: S.gold, fontSize: 10, fontWeight: 600 }}>
                  {player.projectedPoints.toFixed(1)}
                </div>
              </div>
            ))}
          </div>

          {/* Roster breakdown */}
          {userRoster.length > 0 && (
            <div style={{
              borderTop: `1px solid ${S.border}`,
              padding: '10px 14px',
            }}>
              <div style={{ color: S.txtSub, fontSize: 10, fontWeight: 600, marginBottom: 8 }}>POSITIONS</div>
              {(['QB', 'RB', 'WR', 'TE', 'K', 'DEF'] as const).map((pos) => {
                const count = userRoster.filter((p) => p.position === pos).length;
                return count > 0 ? (
                  <div key={pos} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <PosBadge pos={pos} />
                    <span style={{ color: S.txtSub, fontSize: 11 }}>{count}</span>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlayerRow({
  player,
  isMyTurn,
  onDraft,
}: {
  player: FantasyPlayer;
  isMyTurn: boolean;
  onDraft: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: `1px solid ${S.border}`,
        padding: '7px 12px',
        background: hovered ? S.elevated : 'transparent',
        cursor: isMyTurn ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'background 0.12s',
      }}
    >
      <span style={{ color: S.txtMuted, fontSize: 10, minWidth: 20, textAlign: 'right' }}>
        {player.rank}
      </span>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
          <PosBadge pos={player.position} />
          <span style={{ color: S.txt, fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {player.name}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ color: S.txtMuted, fontSize: 10 }}>{player.team}</span>
          <span style={{ color: S.gold, fontSize: 10, fontWeight: 600 }}>{player.projectedPoints.toFixed(1)} pts</span>
        </div>
      </div>
      {isMyTurn && (
        <button
          onClick={onDraft}
          style={{
            background: hovered ? S.blue : S.blueSub,
            border: `1px solid ${S.blue}`,
            borderRadius: 4,
            color: hovered ? '#fff' : S.blue,
            cursor: 'pointer',
            fontFamily: font,
            fontSize: 10,
            fontWeight: 700,
            padding: '3px 7px',
            letterSpacing: '0.04em',
            transition: 'all 0.12s',
          }}
        >
          DRAFT
        </button>
      )}
    </div>
  );
}
