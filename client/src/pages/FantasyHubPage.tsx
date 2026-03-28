import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFantasyStore } from '../store/fantasyStore';
import type { LeagueSettings } from '../types/fantasy';
import { AppShell, C, Badge, Btn } from '../components/AppShell';

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
    background: C.elevated,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    color: C.txt,
    fontFamily: C.font,
    fontSize: 14,
    padding: '10px 14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 160ms',
  };

  const segBtn = (active: boolean, accent: string): React.CSSProperties => ({
    background: active ? `${accent}20` : C.elevated,
    border: `1px solid ${active ? accent + '80' : C.border}`,
    borderRadius: 8,
    color: active ? accent : C.txtSub,
    cursor: 'pointer',
    fontFamily: C.font,
    fontSize: 12,
    fontWeight: 700,
    padding: '7px 14px',
    transition: 'all 140ms',
    letterSpacing: '.03em',
  });

  return (
    <AppShell backTo="/" title="Fantasy" maxWidth={1040}>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.18em', color: C.txtMuted, textTransform: 'uppercase', marginBottom: 8 }}>
          Fantasy Hub
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: C.txt, margin: 0, letterSpacing: '-.03em', lineHeight: 1 }}>
          Build Your Empire
        </h1>
        <p style={{ color: C.txtSub, fontSize: 14, margin: '10px 0 0', fontWeight: 500 }}>
          Season-long leagues and daily fantasy contests
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* ── Season-Long League Card ── */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'border-color 200ms, box-shadow 200ms',
        }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.borderColor = `${C.gold}60`;
            el.style.boxShadow = `0 0 32px -8px ${C.gold}40`;
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.borderColor = C.border;
            el.style.boxShadow = '';
          }}
        >
          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.gold}0A 0%, transparent 50%)`, pointerEvents: 'none' }} />
          {/* Top accent bar */}
          <div style={{ height: 3, background: `linear-gradient(90deg, ${C.gold}, ${C.goldBright}, transparent)` }} />

          {/* Card Header */}
          <div style={{
            padding: '22px 24px 18px',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: C.goldSub,
              border: `1px solid ${C.gold}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>🏆</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: C.txt, fontWeight: 800, fontSize: 18, letterSpacing: '-.01em' }}>Season-Long League</div>
              <div style={{ color: C.txtSub, fontSize: 12, marginTop: 3, fontWeight: 500 }}>17 weeks · Snake draft · Full roster management</div>
            </div>
            {league && (
              <Badge color={league.draftStatus === 'complete' ? C.green : league.draftStatus === 'drafting' ? C.gold : C.blueBright} dot={league.draftStatus === 'drafting'}>
                {league.draftStatus === 'complete' ? 'Active' : league.draftStatus === 'drafting' ? 'Drafting' : 'Pending'}
              </Badge>
            )}
          </div>

          <div style={{ padding: '22px 24px 24px', flex: 1 }}>
            {!league ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: C.txtSub, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                    League Name
                  </label>
                  <input
                    style={inputStyle}
                    value={leagueName}
                    onChange={(e) => setLeagueName(e.target.value)}
                    placeholder="My Fantasy League"
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: C.txtSub, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                    Your Team Name
                  </label>
                  <input
                    style={inputStyle}
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="My Team"
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: C.txtSub, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                    Team Count
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {([8, 10, 12] as const).map((n) => (
                      <button key={n} style={segBtn(teamCount === n, C.gold)} onClick={() => setTeamCount(n)}>
                        {n} Teams
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ color: C.txtSub, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                    Scoring
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['ppr', 'half-ppr', 'standard'] as const).map((s) => (
                      <button key={s} style={segBtn(scoringType === s, C.gold)} onClick={() => setScoringType(s)}>
                        {s === 'ppr' ? 'PPR' : s === 'half-ppr' ? '½ PPR' : 'Std'}
                      </button>
                    ))}
                  </div>
                </div>
                <Btn
                  accent={C.gold}
                  size="lg"
                  style={{ width: '100%', marginBottom: 10 }}
                  onClick={handleCreateLeague}
                >
                  Create League
                </Btn>

                <button
                  style={{
                    width: '100%', background: 'transparent', border: `1px solid ${C.border}`,
                    borderRadius: 8, color: C.txtSub, cursor: 'pointer', fontFamily: C.font,
                    fontSize: 13, fontWeight: 600, padding: '10px', transition: 'border-color 160ms',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.borderHi; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; }}
                  onClick={() => setShowJoin((v) => !v)}
                >
                  {showJoin ? 'Cancel' : 'Join with Invite Code'}
                </button>
                {showJoin && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <input
                      style={{ ...inputStyle, flex: 1, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                      value={inviteInput}
                      onChange={(e) => setInviteInput(e.target.value.toUpperCase().slice(0, 6))}
                      placeholder="ABC123"
                      maxLength={6}
                    />
                    <Btn accent={C.gold} onClick={handleJoinLeague}>Join</Btn>
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ color: C.txtMuted, fontSize: 10, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 6 }}>League</div>
                  <div style={{ color: C.txt, fontWeight: 800, fontSize: 20, letterSpacing: '-.01em' }}>{league.name}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    <Badge color={C.blueBright}>{league.settings.scoringType.toUpperCase()}</Badge>
                    <Badge color={C.txtSub}>{league.settings.teamCount} Teams</Badge>
                    <Badge color={C.txtSub}>Week {league.currentWeek}</Badge>
                  </div>
                </div>

                {userTeam && (
                  <div style={{
                    background: C.elevated,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: '16px 18px',
                    marginBottom: 18,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ color: C.txtSub, fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{userTeam.name}</div>
                      <div style={{ color: C.txt, fontWeight: 900, fontSize: 24, letterSpacing: '-.02em' }}>
                        {userTeam.record.wins}–{userTeam.record.losses}
                        {userTeam.record.ties > 0 ? `–${userTeam.record.ties}` : ''}
                      </div>
                    </div>
                    {opponent && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: C.txtSub, fontSize: 11, marginBottom: 4 }}>vs.</div>
                        <div style={{ color: C.txt, fontWeight: 700, fontSize: 13 }}>{opponent.name}</div>
                      </div>
                    )}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: C.txtSub, fontSize: 11, marginBottom: 4 }}>Season Pts</div>
                      <div style={{ color: C.gold, fontWeight: 800, fontSize: 20, letterSpacing: '-.02em' }}>
                        {userTeam.totalPoints.toFixed(1)}
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Btn accent={C.blueBright} onClick={() => navigate('/fantasy/league')}>League</Btn>
                  <Btn accent={C.blueBright} onClick={() => navigate('/fantasy/league?tab=myteam')}>My Team</Btn>
                  {league.draftStatus !== 'complete' && (
                    <Btn
                      accent={C.gold}
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
                    </Btn>
                  )}
                  <Btn variant="ghost" onClick={() => useFantasyStore.getState().resetLeague()}>Reset</Btn>
                </div>

                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: C.txtMuted, fontSize: 12 }}>Invite code:</span>
                  <span style={{
                    background: C.elevated, border: `1px solid ${C.borderHi}`,
                    borderRadius: 6, color: C.blueBright,
                    fontSize: 13, fontWeight: 800, letterSpacing: '0.14em', padding: '4px 12px',
                  }}>
                    {league.inviteCode}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── DFS Contest Card ── */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'border-color 200ms, box-shadow 200ms',
        }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.borderColor = `${C.blueBright}60`;
            el.style.boxShadow = `0 0 32px -8px ${C.blueBright}40`;
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.borderColor = C.border;
            el.style.boxShadow = '';
          }}
        >
          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.blueBright}0A 0%, transparent 50%)`, pointerEvents: 'none' }} />
          {/* Top accent bar */}
          <div style={{ height: 3, background: `linear-gradient(90deg, ${C.blueBright}, transparent)` }} />

          {/* Card Header */}
          <div style={{
            padding: '22px 24px 18px',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: C.blueSub,
              border: `1px solid ${C.blueBright}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>⚡</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: C.txt, fontWeight: 800, fontSize: 18, letterSpacing: '-.01em' }}>DFS Contests</div>
              <div style={{ color: C.txtSub, fontSize: 12, marginTop: 3, fontWeight: 500 }}>$50,000 salary cap · 9-player lineup · Weekly</div>
            </div>
            {dfsContest && <Badge color={C.green} dot>Live</Badge>}
          </div>

          <div style={{ padding: '22px 24px 24px', flex: 1 }}>
            {!dfsContest ? (
              <>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ color: C.txtSub, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                    Select Week
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {Array.from({ length: 17 }, (_, i) => i + 1).map((w) => (
                      <button key={w} style={segBtn(selectedWeek === w, C.blueBright)} onClick={() => setSelectedWeek(w)}>
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
                  {[
                    { label: 'Salary Cap', value: '$50,000' },
                    { label: 'Slots', value: '9 players' },
                    { label: 'Positions', value: 'QB·RB·WR·TE·DST' },
                  ].map((item) => (
                    <div key={item.label} style={{
                      background: C.elevated, border: `1px solid ${C.border}`,
                      borderRadius: 10, padding: '12px 14px',
                    }}>
                      <div style={{ color: C.txtMuted, fontSize: 9, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 5 }}>
                        {item.label}
                      </div>
                      <div style={{ color: C.txt, fontSize: 12, fontWeight: 700 }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <Btn
                  accent={C.blueBright}
                  size="lg"
                  style={{ width: '100%' }}
                  onClick={handleStartDFS}
                >
                  Start Week {selectedWeek} Contest
                </Btn>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ color: C.txtMuted, fontSize: 10, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 6 }}>Active Contest</div>
                  <div style={{ color: C.txt, fontWeight: 800, fontSize: 18, letterSpacing: '-.01em' }}>{dfsContest.name}</div>
                </div>

                <div style={{
                  background: C.elevated, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '16px 18px', marginBottom: 18,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div>
                      <div style={{ color: C.txtSub, fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Lineup</div>
                      <div style={{ color: dfsFilledSlots === 9 ? C.green : C.txt, fontWeight: 900, fontSize: 26, letterSpacing: '-.02em', lineHeight: 1 }}>
                        {dfsFilledSlots}<span style={{ color: C.txtSub, fontSize: 16, fontWeight: 500 }}>/9</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: C.txtSub, fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Salary Used</div>
                      <div style={{ color: dfsContest.totalSalary > 50000 ? C.red : C.txt, fontWeight: 800, fontSize: 18 }}>
                        ${dfsContest.totalSalary.toLocaleString()}
                      </div>
                      <div style={{ color: C.txtMuted, fontSize: 10 }}>/ $50,000</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: C.txtSub, fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Projected</div>
                      <div style={{ color: C.gold, fontWeight: 800, fontSize: 18 }}>
                        {dfsContest.projectedPoints.toFixed(1)} pts
                      </div>
                    </div>
                  </div>
                  <div style={{ background: C.border, borderRadius: 6, height: 6, overflow: 'hidden' }}>
                    <div style={{
                      background: dfsContest.totalSalary > 50000
                        ? `linear-gradient(90deg, ${C.red}, #ff6b6b)`
                        : `linear-gradient(90deg, ${C.blueBright}, ${C.green})`,
                      height: '100%',
                      width: `${Math.min(100, (dfsContest.totalSalary / 50000) * 100)}%`,
                      borderRadius: 6,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>

                {dfsContest.lockedIn && (
                  <div style={{
                    background: C.greenSub, border: `1px solid ${C.green}60`,
                    borderRadius: 10, padding: '10px 16px', marginBottom: 16,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ color: C.green, fontSize: 16 }}>✓</span>
                    <span style={{ color: C.green, fontSize: 13, fontWeight: 700 }}>
                      Locked — Score: {dfsContest.score.toFixed(1)} pts
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn accent={C.blueBright} style={{ flex: 1 }} onClick={() => navigate('/fantasy/dfs')}>
                    {dfsContest.lockedIn ? 'View Leaderboard' : 'Continue Lineup'}
                  </Btn>
                  <Btn variant="ghost" onClick={() => useFantasyStore.setState({ dfsContest: null })}>
                    New Contest
                  </Btn>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Standings Preview */}
      {league && (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: '20px 24px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.gold}06 0%, transparent 50%)`, pointerEvents: 'none' }} />
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.16em', color: C.txtMuted, textTransform: 'uppercase', marginBottom: 16 }}>
            Standings Preview
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
                  borderRight: `1px solid ${C.border}`,
                  padding: '0 20px',
                  minWidth: 130,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ color: i < 3 ? C.gold : C.txtMuted, fontSize: 11, fontWeight: 800 }}>#{i + 1}</span>
                    {team.isUser && <Badge color={C.blueBright}>You</Badge>}
                  </div>
                  <div style={{ color: C.txt, fontSize: 13, fontWeight: 700, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 115 }}>
                    {team.name}
                  </div>
                  <div style={{ color: C.txtSub, fontSize: 12, fontWeight: 600 }}>
                    {team.record.wins}–{team.record.losses}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
