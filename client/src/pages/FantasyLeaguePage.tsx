import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFantasyStore, MOCK_PLAYERS } from '../store/fantasyStore';
import type { FantasyPlayer, FantasyRosterSlot, RosterSlotType } from '../types/fantasy';

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
  FLEX: { bg: 'rgba(140,80,200,0.18)', color: '#c080f0' },
  BN: { bg: 'rgba(50,60,80,0.4)', color: '#6b82a0' },
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

type TabId = 'matchup' | 'standings' | 'myteam' | 'waiver';

export function FantasyLeaguePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabId) ?? 'matchup';
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [swapSlot, setSwapSlot] = useState<number | null>(null);
  const [waiverSearch, setWaiverSearch] = useState('');
  const [waiverPos, setWaiverPos] = useState('ALL');

  const { league, players, setLineup, simulateWeek } = useFantasyStore();
  const allPlayers: FantasyPlayer[] = players.length > 0 ? players : MOCK_PLAYERS;

  useEffect(() => {
    if (!league) navigate('/fantasy');
  }, [league, navigate]);

  if (!league) return null;

  const userTeam = league.teams.find((t) => t.isUser);
  if (!userTeam) return null;

  const currentMatchup = league.matchups.find(
    (m) =>
      m.week === league.currentWeek &&
      (m.homeTeamId === userTeam.id || m.awayTeamId === userTeam.id)
  );
  const opponentId = currentMatchup
    ? currentMatchup.homeTeamId === userTeam.id
      ? currentMatchup.awayTeamId
      : currentMatchup.homeTeamId
    : null;
  const opponentTeam = league.teams.find((t) => t.id === opponentId);

  const sortedTeams = [...league.teams].sort((a, b) => {
    if (b.record.wins !== a.record.wins) return b.record.wins - a.record.wins;
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return 0;
  });

  const draftedIds = new Set(league.teams.flatMap((t) => t.roster));
  const waiverPlayers = allPlayers
    .filter((p) => !draftedIds.has(p.id))
    .filter((p) => waiverPos === 'ALL' || p.position === waiverPos)
    .filter((p) => waiverSearch === '' || p.name.toLowerCase().includes(waiverSearch.toLowerCase()))
    .sort((a, b) => b.projectedPoints - a.projectedPoints);

  const tabBtn = (id: TabId, label: string) => (
    <button
      key={id}
      onClick={() => setActiveTab(id)}
      style={{
        background: 'none',
        border: 'none',
        borderBottom: `2px solid ${activeTab === id ? S.blue : 'transparent'}`,
        color: activeTab === id ? S.txt : S.txtSub,
        cursor: 'pointer',
        fontFamily: font,
        fontSize: 13,
        fontWeight: activeTab === id ? 600 : 400,
        padding: '12px 16px',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );

  // Build roster slots with player data
  const userRosterPlayers = allPlayers.filter((p) => userTeam.roster.includes(p.id));

  // Matchup side renderer
  const renderMatchupSide = (teamId: string, isUser: boolean) => {
    const team = league.teams.find((t) => t.id === teamId);
    if (!team) return null;
    const roster = allPlayers
      .filter((p) => team.roster.includes(p.id))
      .sort((a, b) => b.projectedPoints - a.projectedPoints)
      .slice(0, 10);
    const projected = roster.reduce((s, p) => s + p.projectedPoints, 0);
    const actual = currentMatchup?.status === 'final'
      ? (isUser
          ? (currentMatchup.homeTeamId === teamId ? currentMatchup.homeScore : currentMatchup.awayScore)
          : (currentMatchup.homeTeamId === teamId ? currentMatchup.homeScore : currentMatchup.awayScore))
      : null;

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Team header */}
        <div style={{
          background: isUser ? 'rgba(59,125,216,0.06)' : S.elevated,
          borderBottom: `1px solid ${S.border}`,
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: S.txt, fontWeight: 700, fontSize: 15 }}>{team.name}</span>
              {isUser && (
                <span style={{ background: S.blueSub, color: S.blue, borderRadius: 4, fontSize: 10, padding: '2px 6px', fontWeight: 700 }}>
                  YOU
                </span>
              )}
            </div>
            <div style={{ color: S.txtSub, fontSize: 12, marginTop: 2 }}>
              {team.record.wins}–{team.record.losses}
              {team.record.ties > 0 ? `–${team.record.ties}` : ''}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: S.txtMuted, fontSize: 11, marginBottom: 2 }}>
              {actual !== null ? 'Final' : 'Projected'}
            </div>
            <div style={{ color: actual !== null ? S.txt : S.gold, fontWeight: 700, fontSize: 22 }}>
              {actual !== null ? actual.toFixed(1) : projected.toFixed(1)}
            </div>
          </div>
        </div>
        {/* Players */}
        {roster.map((player) => (
          <div key={player.id} style={{
            borderBottom: `1px solid ${S.border}`,
            padding: '9px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <PosBadge pos={player.position} />
            <div style={{ flex: 1 }}>
              <div style={{ color: S.txt, fontSize: 13, fontWeight: 500 }}>{player.name}</div>
              <div style={{ color: S.txtMuted, fontSize: 11 }}>{player.team}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: S.gold, fontSize: 13, fontWeight: 600 }}>
                {player.projectedPoints.toFixed(1)}
              </div>
              <div style={{ color: S.txtMuted, fontSize: 10 }}>proj</div>
            </div>
          </div>
        ))}
        {roster.length === 0 && (
          <div style={{ color: S.txtMuted, fontSize: 13, padding: 20, textAlign: 'center' }}>
            No roster set
          </div>
        )}
      </div>
    );
  };

  // Lineup swap UI
  const handleSwap = (fromSlotIdx: number, toPlayerId: string) => {
    if (!userTeam) return;
    const newLineup: FantasyRosterSlot[] = userTeam.lineup.map((slot, i) =>
      i === fromSlotIdx ? { ...slot, playerId: toPlayerId } : slot
    );
    setLineup(userTeam.id, newLineup);
    setSwapSlot(null);
  };

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
        <span style={{ color: S.txtSub, fontSize: 14 }}>{league.name}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: S.txtSub, fontSize: 12 }}>Week {league.currentWeek}</span>
          <button
            onClick={simulateWeek}
            style={{
              background: S.elevated,
              border: `1px solid ${S.border}`,
              borderRadius: 6,
              color: S.txtSub,
              cursor: 'pointer',
              fontFamily: font,
              fontSize: 12,
              padding: '5px 12px',
            }}
          >
            Sim Week →
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: S.surface,
        borderBottom: `1px solid ${S.border}`,
        display: 'flex',
        overflowX: 'auto',
        flexShrink: 0,
      }}>
        {tabBtn('matchup', 'Matchup')}
        {tabBtn('standings', 'Standings')}
        {tabBtn('myteam', 'My Team')}
        {tabBtn('waiver', 'Waiver Wire')}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >

            {/* ── MATCHUP TAB ── */}
            {activeTab === 'matchup' && (
              <div>
                {/* Week nav */}
                <div style={{
                  background: S.elevated,
                  borderBottom: `1px solid ${S.border}`,
                  padding: '10px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ color: S.txtSub, fontSize: 13, fontWeight: 600 }}>
                    Week {league.currentWeek} — {currentMatchup?.status === 'final' ? 'Final' : currentMatchup?.status === 'live' ? 'Live' : 'Upcoming'}
                  </span>
                  {currentMatchup?.status === 'upcoming' && (
                    <span style={{ color: S.txtMuted, fontSize: 12 }}>Projected scores shown</span>
                  )}
                </div>

                {currentMatchup && opponentTeam ? (
                  <div style={{ display: 'flex', borderBottom: `1px solid ${S.border}` }}>
                    {renderMatchupSide(userTeam.id, true)}
                    <div style={{
                      borderLeft: `1px solid ${S.border}`,
                      borderRight: `1px solid ${S.border}`,
                      width: 48,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      paddingTop: 22,
                    }}>
                      <span style={{ color: S.txtMuted, fontSize: 12, fontWeight: 700, writingMode: 'vertical-rl' }}>VS</span>
                    </div>
                    {renderMatchupSide(opponentTeam.id, false)}
                  </div>
                ) : (
                  <div style={{ color: S.txtMuted, padding: 40, textAlign: 'center', fontSize: 14 }}>
                    No matchup scheduled for this week.
                  </div>
                )}
              </div>
            )}

            {/* ── STANDINGS TAB ── */}
            {activeTab === 'standings' && (
              <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 20px' }}>
                <div style={{
                  background: S.surface,
                  border: `1px solid ${S.border}`,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}>
                  {/* Header */}
                  <div style={{
                    background: S.elevated,
                    display: 'grid',
                    gridTemplateColumns: '32px 1fr 80px 80px 80px',
                    gap: 0,
                    padding: '10px 16px',
                    borderBottom: `1px solid ${S.border}`,
                  }}>
                    {['#', 'Team', 'W-L-T', 'PF', 'PA'].map((h) => (
                      <div key={h} style={{ color: S.txtMuted, fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}>
                        {h}
                      </div>
                    ))}
                  </div>
                  {sortedTeams.map((team, i) => {
                    const pa = league.matchups
                      .filter((m) => m.status === 'final' && (m.homeTeamId === team.id || m.awayTeamId === team.id))
                      .reduce((acc, m) =>
                        acc + (m.homeTeamId === team.id ? m.awayScore : m.homeScore), 0);
                    return (
                      <div
                        key={team.id}
                        style={{
                          background: team.isUser ? 'rgba(59,125,216,0.06)' : 'transparent',
                          borderBottom: i < sortedTeams.length - 1 ? `1px solid ${S.border}` : 'none',
                          borderLeft: team.isUser ? `3px solid ${S.blue}` : '3px solid transparent',
                          display: 'grid',
                          gridTemplateColumns: '32px 1fr 80px 80px 80px',
                          padding: '11px 16px',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ color: i < 4 ? S.gold : S.txtMuted, fontSize: 13, fontWeight: 700 }}>
                          {i + 1}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: S.txt, fontSize: 13, fontWeight: team.isUser ? 700 : 500 }}>
                              {team.name}
                            </span>
                            {team.isUser && (
                              <span style={{ background: S.blueSub, color: S.blue, borderRadius: 3, fontSize: 9, padding: '1px 5px', fontWeight: 700 }}>
                                YOU
                              </span>
                            )}
                          </div>
                          <div style={{ color: S.txtMuted, fontSize: 11 }}>{team.ownerName}</div>
                        </div>
                        <div style={{ color: S.txt, fontSize: 13, fontWeight: 600 }}>
                          {team.record.wins}–{team.record.losses}
                          {team.record.ties > 0 ? `–${team.record.ties}` : ''}
                        </div>
                        <div style={{ color: S.gold, fontSize: 13, fontWeight: 600 }}>
                          {team.totalPoints.toFixed(1)}
                        </div>
                        <div style={{ color: S.txtSub, fontSize: 13 }}>
                          {pa.toFixed(1)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Playoff threshold */}
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 1, background: S.border }} />
                  <span style={{ color: S.txtMuted, fontSize: 11, padding: '0 8px', whiteSpace: 'nowrap' }}>
                    Playoff cutoff (Top {Math.floor(league.settings.teamCount / 2)})
                  </span>
                  <div style={{ flex: 1, height: 1, background: S.border }} />
                </div>
              </div>
            )}

            {/* ── MY TEAM TAB ── */}
            {activeTab === 'myteam' && (
              <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h2 style={{ color: S.txt, fontSize: 18, fontWeight: 700, margin: 0 }}>{userTeam.name}</h2>
                    <p style={{ color: S.txtSub, fontSize: 13, margin: '4px 0 0' }}>
                      {userTeam.record.wins}–{userTeam.record.losses} · {userTeam.totalPoints.toFixed(1)} pts
                    </p>
                  </div>
                  {swapSlot !== null && (
                    <button
                      onClick={() => setSwapSlot(null)}
                      style={{
                        background: S.elevated,
                        border: `1px solid ${S.border}`,
                        borderRadius: 6,
                        color: S.txtSub,
                        cursor: 'pointer',
                        fontFamily: font,
                        fontSize: 12,
                        padding: '6px 12px',
                      }}
                    >
                      Cancel Swap
                    </button>
                  )}
                </div>

                {/* Starters */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ color: S.txtMuted, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 8 }}>
                    STARTERS
                  </div>
                  <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, overflow: 'hidden' }}>
                    {userTeam.lineup
                      .filter((slot) => slot.type !== 'BN')
                      .map((slot, i) => {
                        const player = slot.playerId ? allPlayers.find((p) => p.id === slot.playerId) : null;
                        const isSwapping = swapSlot !== null;
                        return (
                          <div
                            key={i}
                            style={{
                              borderBottom: `1px solid ${S.border}`,
                              padding: '10px 16px',
                              display: 'grid',
                              gridTemplateColumns: '64px 1fr 80px 60px',
                              alignItems: 'center',
                              gap: 8,
                              background: swapSlot === i ? 'rgba(59,125,216,0.08)' : 'transparent',
                            }}
                          >
                            <PosBadge pos={slot.type} />
                            {player ? (
                              <>
                                <div>
                                  <div style={{ color: S.txt, fontSize: 13, fontWeight: 600 }}>{player.name}</div>
                                  <div style={{ color: S.txtMuted, fontSize: 11 }}>{player.team} · {player.position}</div>
                                </div>
                                <div style={{ color: S.gold, fontSize: 13, fontWeight: 600 }}>
                                  {player.projectedPoints.toFixed(1)} pts
                                </div>
                                <button
                                  onClick={() => setSwapSlot(swapSlot === i ? null : i)}
                                  style={{
                                    background: swapSlot === i ? S.blue : S.elevated,
                                    border: `1px solid ${swapSlot === i ? S.blue : S.border}`,
                                    borderRadius: 4,
                                    color: swapSlot === i ? '#fff' : S.txtSub,
                                    cursor: 'pointer',
                                    fontFamily: font,
                                    fontSize: 11,
                                    padding: '4px 8px',
                                  }}
                                >
                                  Swap
                                </button>
                              </>
                            ) : (
                              <>
                                <div style={{ color: S.txtMuted, fontSize: 13 }}>— Empty —</div>
                                <div />
                                <button
                                  onClick={() => setSwapSlot(i)}
                                  style={{
                                    background: S.elevated,
                                    border: `1px solid ${S.border}`,
                                    borderRadius: 4,
                                    color: S.blue,
                                    cursor: 'pointer',
                                    fontFamily: font,
                                    fontSize: 11,
                                    padding: '4px 8px',
                                  }}
                                >
                                  Set
                                </button>
                              </>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Bench */}
                <div>
                  <div style={{ color: S.txtMuted, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 8 }}>
                    BENCH
                  </div>
                  <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, overflow: 'hidden' }}>
                    {userRosterPlayers
                      .filter((p) => !userTeam.lineup.some((s) => s.playerId === p.id && s.type !== 'BN'))
                      .map((player, i, arr) => (
                        <div
                          key={player.id}
                          style={{
                            borderBottom: i < arr.length - 1 ? `1px solid ${S.border}` : 'none',
                            padding: '10px 16px',
                            display: 'grid',
                            gridTemplateColumns: '64px 1fr 80px 60px',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <PosBadge pos={player.position} />
                          <div>
                            <div style={{ color: S.txtSub, fontSize: 13, fontWeight: 500 }}>{player.name}</div>
                            <div style={{ color: S.txtMuted, fontSize: 11 }}>{player.team}</div>
                          </div>
                          <div style={{ color: S.txtSub, fontSize: 13 }}>
                            {player.projectedPoints.toFixed(1)} pts
                          </div>
                          {swapSlot !== null && (
                            <button
                              onClick={() => handleSwap(swapSlot, player.id)}
                              style={{
                                background: S.green,
                                border: 'none',
                                borderRadius: 4,
                                color: '#fff',
                                cursor: 'pointer',
                                fontFamily: font,
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '4px 8px',
                              }}
                            >
                              Start
                            </button>
                          )}
                        </div>
                      ))}
                    {userRosterPlayers.length === 0 && (
                      <div style={{ color: S.txtMuted, padding: '20px', textAlign: 'center', fontSize: 13 }}>
                        No players on roster yet. Complete the draft first.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── WAIVER WIRE TAB ── */}
            {activeTab === 'waiver' && (
              <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 20px' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    style={{
                      background: S.elevated,
                      border: `1px solid ${S.border}`,
                      borderRadius: 6,
                      color: S.txt,
                      fontFamily: font,
                      fontSize: 13,
                      outline: 'none',
                      padding: '7px 12px',
                      flex: '1 1 180px',
                    }}
                    placeholder="Search players..."
                    value={waiverSearch}
                    onChange={(e) => setWaiverSearch(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setWaiverPos(pos)}
                        style={{
                          background: waiverPos === pos ? S.blue : S.elevated,
                          border: `1px solid ${waiverPos === pos ? S.blue : S.border}`,
                          borderRadius: 4,
                          color: waiverPos === pos ? '#fff' : S.txtSub,
                          cursor: 'pointer',
                          fontFamily: font,
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '4px 9px',
                        }}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ color: S.txtMuted, fontSize: 12, marginBottom: 10 }}>
                  {waiverPlayers.length} players available
                </div>

                <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, overflow: 'hidden' }}>
                  {/* Header row */}
                  <div style={{
                    background: S.elevated,
                    borderBottom: `1px solid ${S.border}`,
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 60px 80px 80px 80px',
                    padding: '8px 16px',
                    gap: 8,
                  }}>
                    {['#', 'Player', 'Pos', 'Team', 'Avg Pts', ''].map((h) => (
                      <div key={h} style={{ color: S.txtMuted, fontSize: 10, fontWeight: 600, letterSpacing: '0.05em' }}>{h}</div>
                    ))}
                  </div>
                  {waiverPlayers.slice(0, 40).map((player, i) => (
                    <WaiverRow
                      key={player.id}
                      player={player}
                      rank={i + 1}
                      canAdd={userTeam.roster.length < 17}
                      onAdd={() => {
                        useFantasyStore.setState((s) => ({
                          league: s.league ? {
                            ...s.league,
                            teams: s.league.teams.map((t) =>
                              t.isUser ? { ...t, roster: [...t.roster, player.id] } : t
                            ),
                          } : null,
                        }));
                      }}
                      isLast={i === Math.min(waiverPlayers.length, 40) - 1}
                    />
                  ))}
                  {waiverPlayers.length === 0 && (
                    <div style={{ color: S.txtMuted, padding: 24, textAlign: 'center', fontSize: 13 }}>
                      No players available on waivers
                    </div>
                  )}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function WaiverRow({
  player,
  rank,
  canAdd,
  onAdd,
  isLast,
}: {
  player: FantasyPlayer;
  rank: number;
  canAdd: boolean;
  onAdd: () => void;
  isLast: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const POS_COLORS_LOCAL: Record<string, { bg: string; color: string }> = {
    QB: { bg: 'rgba(181,56,56,0.18)', color: '#e06060' },
    RB: { bg: 'rgba(30,140,78,0.18)', color: '#4dc08a' },
    WR: { bg: 'rgba(59,125,216,0.18)', color: '#6fa8e8' },
    TE: { bg: 'rgba(196,154,26,0.18)', color: '#d4aa40' },
    K: { bg: 'rgba(107,130,160,0.18)', color: '#8fa8c8' },
    DEF: { bg: 'rgba(107,130,160,0.22)', color: '#a0b8d0' },
  };
  const pc = POS_COLORS_LOCAL[player.position] ?? { bg: 'rgba(59,125,216,0.15)', color: '#6b82a0' };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? S.elevated : 'transparent',
        borderBottom: isLast ? 'none' : `1px solid ${S.border}`,
        display: 'grid',
        gridTemplateColumns: '40px 1fr 60px 80px 80px 80px',
        padding: '10px 16px',
        gap: 8,
        alignItems: 'center',
        transition: 'background 0.1s',
      }}
    >
      <div style={{ color: S.txtMuted, fontSize: 12 }}>{rank}</div>
      <div>
        <div style={{ color: S.txt, fontSize: 13, fontWeight: 600 }}>{player.name}</div>
        <div style={{ color: S.txtMuted, fontSize: 11 }}>{player.yearsExp} yr exp</div>
      </div>
      <span style={{
        background: pc.bg, borderRadius: 4, color: pc.color,
        fontSize: 10, fontWeight: 700, padding: '2px 6px', textAlign: 'center',
      }}>
        {player.position}
      </span>
      <div style={{ color: S.txtSub, fontSize: 12 }}>{player.team}</div>
      <div style={{ color: S.gold, fontSize: 13, fontWeight: 600 }}>
        {player.avgPoints.toFixed(1)}
      </div>
      <button
        onClick={onAdd}
        disabled={!canAdd}
        style={{
          background: canAdd ? (hovered ? S.green : S.greenSub) : S.elevated,
          border: `1px solid ${canAdd ? S.green : S.border}`,
          borderRadius: 4,
          color: canAdd ? (hovered ? '#fff' : S.green) : S.txtMuted,
          cursor: canAdd ? 'pointer' : 'not-allowed',
          fontFamily: font,
          fontSize: 11,
          fontWeight: 700,
          padding: '4px 10px',
          transition: 'all 0.12s',
        }}
      >
        {canAdd ? 'ADD' : 'FULL'}
      </button>
    </div>
  );
}

