import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFantasyStore } from '../store/fantasyStore';
import type { LeagueSettings } from '../types/fantasy';

const S = {
  bg: '#0b0f18', surface: '#0f1623', elevated: '#141d2e',
  border: '#1c2d40', txt: '#cdd8e8', txtSub: '#6b82a0', txtMuted: '#334560',
  blue: '#3b7dd8', blueSub: 'rgba(59,125,216,0.12)',
  gold: '#c49a1a', goldSub: 'rgba(196,154,26,0.10)',
  green: '#1e8c4e', greenSub: 'rgba(30,140,78,0.12)',
  red: '#b53838', redSub: 'rgba(181,56,56,0.12)',
};

const font = 'system-ui, -apple-system, sans-serif';

export function FantasyHubPage() {
  const navigate = useNavigate();
  const { league, dfsContest, createLeague, joinLeague, createDFSContest, setActiveTab } = useFantasyStore();

  const [leagueName, setLeagueName] = useState('My Fantasy League');
  const [teamName, setTeamName] = useState('My Team');
  const [teamCount, setTeamCount] = useState<8 | 10 | 12>(10);
  const [scoringType, setScoringType] = useState<'ppr' | 'half-ppr' | 'standard'>('ppr');
  const [inviteInput, setInviteInput] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [showJoin, setShowJoin] = useState(false);

  const handleCreateLeague = () => {
    const settings: LeagueSettings = {
      teamCount,
      scoringType,
      draftType: 'snake',
      playoffWeeks: 3,
      rosterSize: 17,
    };
    createLeague(leagueName, teamName, settings);
  };

  const handleJoinLeague = () => {
    if (inviteInput.trim().length === 6) {
      joinLeague(inviteInput.trim().toUpperCase());
    }
  };

  const handleStartDFS = () => {
    createDFSContest(selectedWeek);
    setActiveTab('dfs');
    navigate('/fantasy/dfs');
  };

  const userTeam = league?.teams.find((t) => t.isUser);
  const currentMatchup = league
    ? league.matchups.find(
        (m) =>
          m.week === league.currentWeek &&
          (m.homeTeamId === userTeam?.id || m.awayTeamId === userTeam?.id)
      )
    : null;
  const opponentId = currentMatchup
    ? currentMatchup.homeTeamId === userTeam?.id
      ? currentMatchup.awayTeamId
      : currentMatchup.homeTeamId
    : null;
  const opponent = league?.teams.find((t) => t.id === opponentId);

  const dfsFilledSlots = dfsContest?.lineup.filter((s) => s.playerId !== null).length ?? 0;

  const inputStyle: React.CSSProperties = {
    background: S.elevated,
    border: `1px solid ${S.border}`,
    borderRadius: 6,
    color: S.txt,
    fontFamily: font,
    fontSize: 14,
    padding: '8px 12px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const btnPrimary: React.CSSProperties = {
    background: S.blue,
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    cursor: 'pointer',
    fontFamily: font,
    fontSize: 13,
    fontWeight: 600,
    padding: '9px 18px',
    letterSpacing: '0.02em',
  };

  const btnGhost: React.CSSProperties = {
    background: 'transparent',
    border: `1px solid ${S.border}`,
    borderRadius: 6,
    color: S.txtSub,
    cursor: 'pointer',
    fontFamily: font,
    fontSize: 13,
    padding: '8px 14px',
  };

  const segBtn = (active: boolean): React.CSSProperties => ({
    background: active ? S.blue : S.elevated,
    border: `1px solid ${active ? S.blue : S.border}`,
    borderRadius: 4,
    color: active ? '#fff' : S.txtSub,
    cursor: 'pointer',
    fontFamily: font,
    fontSize: 12,
    fontWeight: active ? 600 : 400,
    padding: '5px 12px',
  });

  return (
    <div style={{ background: S.bg, minHeight: '100vh', fontFamily: font }}>
      {/* Nav */}
      <div style={{
        background: S.surface,
        borderBottom: `1px solid ${S.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 24px',
        height: 52,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: S.txtSub, cursor: 'pointer', fontSize: 18, padding: 0, lineHeight: 1 }}
        >
          ←
        </button>
        <span style={{ color: S.txt, fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em' }}>
          Gridiron<span style={{ color: S.blue }}>IQ</span>
        </span>
        <span style={{ color: S.txtMuted, fontSize: 14 }}>|</span>
        <span style={{ color: S.txtSub, fontSize: 14, fontWeight: 500 }}>Fantasy</span>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ color: S.txt, fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            Fantasy Hub
          </h1>
          <p style={{ color: S.txtSub, fontSize: 14, margin: '6px 0 0' }}>
            Season-long leagues and daily fantasy contests
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* ── Season-Long League Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              background: S.surface,
              border: `1px solid ${S.border}`,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            {/* Card Header */}
            <div style={{
              background: `linear-gradient(135deg, ${S.elevated} 0%, rgba(59,125,216,0.08) 100%)`,
              borderBottom: `1px solid ${S.border}`,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                background: S.blueSub,
                borderRadius: 8,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}>🏆</div>
              <div>
                <div style={{ color: S.txt, fontWeight: 700, fontSize: 16 }}>Season-Long League</div>
                <div style={{ color: S.txtSub, fontSize: 12, marginTop: 2 }}>17 weeks · Snake draft · Full roster management</div>
              </div>
            </div>

            <div style={{ padding: '20px' }}>
              {!league ? (
                <>
                  {/* Create Form */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ color: S.txtSub, fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                      LEAGUE NAME
                    </label>
                    <input
                      style={inputStyle}
                      value={leagueName}
                      onChange={(e) => setLeagueName(e.target.value)}
                      placeholder="My Fantasy League"
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ color: S.txtSub, fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                      YOUR TEAM NAME
                    </label>
                    <input
                      style={inputStyle}
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="My Team"
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ color: S.txtSub, fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 8 }}>
                      TEAM COUNT
                    </label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {([8, 10, 12] as const).map((n) => (
                        <button key={n} style={segBtn(teamCount === n)} onClick={() => setTeamCount(n)}>
                          {n} Teams
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ color: S.txtSub, fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 8 }}>
                      SCORING
                    </label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(['ppr', 'half-ppr', 'standard'] as const).map((s) => (
                        <button key={s} style={segBtn(scoringType === s)} onClick={() => setScoringType(s)}>
                          {s === 'ppr' ? 'PPR' : s === 'half-ppr' ? '½ PPR' : 'Std'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    style={{ ...btnPrimary, width: '100%', fontSize: 14, padding: '11px 0', marginBottom: 10 }}
                    onClick={handleCreateLeague}
                  >
                    Create League
                  </button>

                  {/* Join section */}
                  <button style={{ ...btnGhost, width: '100%', textAlign: 'center' }} onClick={() => setShowJoin((v) => !v)}>
                    {showJoin ? 'Cancel' : 'Join with Invite Code'}
                  </button>
                  {showJoin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{ marginTop: 12 }}
                    >
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          style={{ ...inputStyle, flex: 1, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                          value={inviteInput}
                          onChange={(e) => setInviteInput(e.target.value.toUpperCase().slice(0, 6))}
                          placeholder="ABC123"
                          maxLength={6}
                        />
                        <button style={btnPrimary} onClick={handleJoinLeague}>
                          Join
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                /* League Summary */
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: S.txtSub, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 8 }}>
                      LEAGUE
                    </div>
                    <div style={{ color: S.txt, fontWeight: 700, fontSize: 17 }}>{league.name}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                      <span style={{ background: S.blueSub, color: S.blue, borderRadius: 4, fontSize: 11, padding: '3px 8px', fontWeight: 600 }}>
                        {league.settings.scoringType.toUpperCase()}
                      </span>
                      <span style={{ background: S.elevated, color: S.txtSub, borderRadius: 4, fontSize: 11, padding: '3px 8px' }}>
                        {league.settings.teamCount} Teams
                      </span>
                      <span style={{ background: S.elevated, color: S.txtSub, borderRadius: 4, fontSize: 11, padding: '3px 8px' }}>
                        Week {league.currentWeek}
                      </span>
                      <span style={{
                        background: league.draftStatus === 'complete' ? S.greenSub : league.draftStatus === 'drafting' ? S.goldSub : S.elevated,
                        color: league.draftStatus === 'complete' ? S.green : league.draftStatus === 'drafting' ? S.gold : S.txtSub,
                        borderRadius: 4, fontSize: 11, padding: '3px 8px', fontWeight: 600,
                      }}>
                        Draft {league.draftStatus === 'complete' ? 'Complete' : league.draftStatus === 'drafting' ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Record */}
                  {userTeam && (
                    <div style={{
                      background: S.elevated,
                      borderRadius: 8,
                      padding: '12px 14px',
                      marginBottom: 16,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ color: S.txtSub, fontSize: 11, fontWeight: 600, marginBottom: 3 }}>{userTeam.name}</div>
                        <div style={{ color: S.txt, fontWeight: 700, fontSize: 20 }}>
                          {userTeam.record.wins}–{userTeam.record.losses}
                          {userTeam.record.ties > 0 ? `–${userTeam.record.ties}` : ''}
                        </div>
                      </div>
                      {opponent && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: S.txtSub, fontSize: 11, marginBottom: 3 }}>Next vs.</div>
                          <div style={{ color: S.txt, fontWeight: 600, fontSize: 13 }}>{opponent.name}</div>
                        </div>
                      )}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: S.txtSub, fontSize: 11, marginBottom: 3 }}>Season Pts</div>
                        <div style={{ color: S.gold, fontWeight: 700, fontSize: 16 }}>
                          {userTeam.totalPoints.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button style={btnPrimary} onClick={() => navigate('/fantasy/league')}>
                      League
                    </button>
                    <button style={btnPrimary} onClick={() => navigate('/fantasy/league?tab=myteam')}>
                      My Team
                    </button>
                    {league.draftStatus !== 'complete' && (
                      <button
                        style={{ ...btnPrimary, background: S.gold }}
                        onClick={() => {
                          if (league.draftStatus === 'pending') {
                            useFantasyStore.setState((s) => ({
                              league: s.league ? { ...s.league, draftStatus: 'drafting' } : null,
                            }));
                          }
                          navigate('/fantasy/draft');
                        }}
                      >
                        {league.draftStatus === 'drafting' ? 'Resume Draft' : 'Start Draft'}
                      </button>
                    )}
                    <button style={btnGhost} onClick={() => useFantasyStore.getState().resetLeague()}>
                      Reset
                    </button>
                  </div>

                  {/* Invite code */}
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: S.txtMuted, fontSize: 12 }}>Invite code:</span>
                    <span style={{
                      background: S.elevated,
                      border: `1px solid ${S.border}`,
                      borderRadius: 4,
                      color: S.blue,
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      padding: '3px 10px',
                    }}>
                      {league.inviteCode}
                    </span>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* ── DFS Contest Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.08 }}
            style={{
              background: S.surface,
              border: `1px solid ${S.border}`,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <div style={{
              background: `linear-gradient(135deg, ${S.elevated} 0%, rgba(196,154,26,0.08) 100%)`,
              borderBottom: `1px solid ${S.border}`,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                background: S.goldSub,
                borderRadius: 8,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}>⚡</div>
              <div>
                <div style={{ color: S.txt, fontWeight: 700, fontSize: 16 }}>DFS Contest</div>
                <div style={{ color: S.txtSub, fontSize: 12, marginTop: 2 }}>$50,000 salary cap · 9-player lineup · Weekly</div>
              </div>
            </div>

            <div style={{ padding: '20px' }}>
              {!dfsContest ? (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ color: S.txtSub, fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 8 }}>
                      SELECT WEEK
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {Array.from({ length: 17 }, (_, i) => i + 1).map((w) => (
                        <button key={w} style={segBtn(selectedWeek === w)} onClick={() => setSelectedWeek(w)}>
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* DFS info pills */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Salary Cap', value: '$50,000' },
                      { label: 'Slots', value: '9 players' },
                      { label: 'Positions', value: 'QB·RB·WR·TE·FLEX·DST' },
                    ].map((item) => (
                      <div key={item.label} style={{
                        background: S.elevated,
                        borderRadius: 6,
                        padding: '8px 12px',
                        flex: 1,
                        minWidth: 100,
                      }}>
                        <div style={{ color: S.txtMuted, fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 3 }}>
                          {item.label}
                        </div>
                        <div style={{ color: S.txt, fontSize: 13, fontWeight: 600 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <button
                    style={{ ...btnPrimary, background: S.gold, width: '100%', fontSize: 14, padding: '11px 0' }}
                    onClick={handleStartDFS}
                  >
                    Start Week {selectedWeek} Contest
                  </button>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: S.txtSub, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 8 }}>
                      ACTIVE CONTEST
                    </div>
                    <div style={{ color: S.txt, fontWeight: 700, fontSize: 16 }}>{dfsContest.name}</div>
                  </div>

                  {/* Progress */}
                  <div style={{
                    background: S.elevated,
                    borderRadius: 8,
                    padding: '14px',
                    marginBottom: 16,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <div style={{ color: S.txtSub, fontSize: 11, marginBottom: 3 }}>Lineup</div>
                        <div style={{ color: dfsFilledSlots === 9 ? S.green : S.txt, fontWeight: 700, fontSize: 22 }}>
                          {dfsFilledSlots}<span style={{ color: S.txtSub, fontSize: 14, fontWeight: 400 }}>/9</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: S.txtSub, fontSize: 11, marginBottom: 3 }}>Salary</div>
                        <div style={{
                          color: dfsContest.totalSalary > 50000 ? S.red : S.txt,
                          fontWeight: 700,
                          fontSize: 16,
                        }}>
                          ${dfsContest.totalSalary.toLocaleString()}
                        </div>
                        <div style={{ color: S.txtMuted, fontSize: 10 }}>/ $50,000</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: S.txtSub, fontSize: 11, marginBottom: 3 }}>Projected</div>
                        <div style={{ color: S.gold, fontWeight: 700, fontSize: 16 }}>
                          {dfsContest.projectedPoints.toFixed(1)} pts
                        </div>
                      </div>
                    </div>
                    {/* Salary bar */}
                    <div style={{ background: S.border, borderRadius: 4, height: 4, overflow: 'hidden' }}>
                      <div style={{
                        background: dfsContest.totalSalary > 50000 ? S.red : S.green,
                        height: '100%',
                        width: `${Math.min(100, (dfsContest.totalSalary / 50000) * 100)}%`,
                        borderRadius: 4,
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>

                  {dfsContest.lockedIn && (
                    <div style={{
                      background: S.greenSub,
                      border: `1px solid ${S.green}`,
                      borderRadius: 6,
                      padding: '8px 12px',
                      marginBottom: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <span style={{ color: S.green, fontSize: 13 }}>✓</span>
                      <span style={{ color: S.green, fontSize: 13, fontWeight: 600 }}>
                        Locked — Score: {dfsContest.score.toFixed(1)} pts
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      style={{ ...btnPrimary, background: S.gold, flex: 1 }}
                      onClick={() => navigate('/fantasy/dfs')}
                    >
                      {dfsContest.lockedIn ? 'View Leaderboard' : 'Continue Lineup'}
                    </button>
                    <button
                      style={btnGhost}
                      onClick={() => useFantasyStore.setState({ dfsContest: null })}
                    >
                      New Contest
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick stats row if league exists */}
        {league && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              marginTop: 20,
              background: S.surface,
              border: `1px solid ${S.border}`,
              borderRadius: 10,
              padding: '16px 20px',
            }}
          >
            <div style={{ color: S.txtSub, fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 12 }}>
              STANDINGS PREVIEW
            </div>
            <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
              {[...league.teams]
                .sort((a, b) => {
                  const aW = a.record.wins, bW = b.record.wins;
                  if (bW !== aW) return bW - aW;
                  return b.totalPoints - a.totalPoints;
                })
                .slice(0, 6)
                .map((team, i) => (
                  <div key={team.id} style={{
                    flex: '0 0 auto',
                    borderRight: `1px solid ${S.border}`,
                    padding: '0 16px',
                    minWidth: 120,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ color: S.txtMuted, fontSize: 11 }}>#{i + 1}</span>
                      {team.isUser && (
                        <span style={{ background: S.blueSub, color: S.blue, borderRadius: 3, fontSize: 9, padding: '1px 5px', fontWeight: 700 }}>
                          YOU
                        </span>
                      )}
                    </div>
                    <div style={{ color: S.txt, fontSize: 13, fontWeight: 600, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 110 }}>
                      {team.name}
                    </div>
                    <div style={{ color: S.txtSub, fontSize: 12 }}>
                      {team.record.wins}–{team.record.losses}
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
