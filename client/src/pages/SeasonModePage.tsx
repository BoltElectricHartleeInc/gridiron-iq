import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSeasonStore } from '../store/seasonStore';
import { NFL_GAME_TEAMS, type GameTeam } from '../game/teams';
import { AppShell, C, Badge, Btn, GLOBAL_CSS } from '../components/AppShell';

// ESPN CDN slug map — team.id → ESPN slug
const ESPN_SLUG: Record<string, string> = {
  ari: 'ari', atl: 'atl', bal: 'bal', buf: 'buf', car: 'car',
  chi: 'chi', cin: 'cin', cle: 'cle', dal: 'dal', den: 'den',
  det: 'det', gb: 'gb',  hou: 'hou', ind: 'ind', jax: 'jax',
  kc: 'kc',  lac: 'lac', lar: 'lar', lv: 'lv',  mia: 'mia',
  min: 'min', ne: 'ne',  no: 'no',   nyg: 'nyg', nyj: 'nyj',
  phi: 'phi', pit: 'pit', sea: 'sea', sf: 'sf',  tb: 'tb',
  ten: 'ten', was: 'wsh',
};

function teamLogo(id: string) {
  const slug = ESPN_SLUG[id] ?? id;
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${slug}.png`;
}

function hexStr(n: number): string {
  return `#${n.toString(16).padStart(6, '0')}`;
}

const DIVISIONS = [
  { conf: 'AFC', div: 'North' },
  { conf: 'AFC', div: 'South' },
  { conf: 'AFC', div: 'East' },
  { conf: 'AFC', div: 'West' },
  { conf: 'NFC', div: 'North' },
  { conf: 'NFC', div: 'South' },
  { conf: 'NFC', div: 'East' },
  { conf: 'NFC', div: 'West' },
] as const;

export function SeasonModePage() {
  const navigate = useNavigate();
  const {
    userTeamId, currentWeek, schedule, records,
    startSeason, simGame, simWeek, advanceWeek, resetSeason,
  } = useSeasonStore();

  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null);

  // ── Team picker ──────────────────────────────────────────────────────────
  if (!userTeamId) {
    return (
      <AppShell title="Season Mode" backTo="/game" noPad={true}>
        <style>{GLOBAL_CSS}</style>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px 80px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: `${C.goldSub}`, border: `1px solid ${C.gold}30`,
              borderRadius: 999, padding: '6px 18px', marginBottom: 20,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold, display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite' }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.16em', color: C.gold, textTransform: 'uppercase' }}>18-Week Regular Season</span>
            </div>
            <h1 style={{
              fontSize: 52, fontWeight: 900, fontFamily: 'Impact, sans-serif',
              letterSpacing: '.04em', margin: 0, color: C.txt,
              textShadow: `0 0 60px ${C.gold}30`,
            }}>
              SEASON MODE
            </h1>
            <p style={{ color: C.txtSub, marginTop: 12, fontSize: 15, fontWeight: 500 }}>
              Choose your franchise and guide them through a full NFL season
            </p>
          </div>

          {/* Team grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {NFL_GAME_TEAMS.map(team => {
              const isHovered = hoveredTeam === team.id;
              const primary = hexStr(team.primaryColor);
              return (
                <button
                  key={team.id}
                  onMouseEnter={() => setHoveredTeam(team.id)}
                  onMouseLeave={() => setHoveredTeam(null)}
                  onClick={() => startSeason(team.id)}
                  style={{
                    position: 'relative',
                    background: isHovered ? `${primary}18` : C.surface,
                    border: `1px solid ${isHovered ? primary + '80' : C.border}`,
                    borderRadius: 14,
                    padding: '18px 12px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'all 180ms ease',
                    transform: isHovered ? 'translateY(-3px)' : 'none',
                    boxShadow: isHovered ? `0 8px 32px ${primary}28` : 'none',
                    overflow: 'hidden',
                  }}
                >
                  {/* Gradient overlay on hover */}
                  {isHovered && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: `linear-gradient(135deg, ${primary}12 0%, transparent 60%)`,
                      pointerEvents: 'none',
                    }} />
                  )}
                  {/* Bottom accent bar */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                    background: isHovered ? `linear-gradient(90deg, ${primary}, transparent)` : 'transparent',
                    transition: 'background 180ms',
                  }} />

                  {/* ESPN Logo */}
                  <div style={{
                    width: 52, height: 52,
                    borderRadius: '50%',
                    background: isHovered ? `${primary}20` : `${C.panel}`,
                    border: `1px solid ${isHovered ? primary + '60' : C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: isHovered ? `0 0 20px ${primary}40` : 'none',
                    transition: 'all 180ms',
                    flexShrink: 0,
                  }}>
                    <img
                      src={teamLogo(team.id)}
                      alt={team.abbreviation}
                      style={{ width: 38, height: 38, objectFit: 'contain' }}
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement;
                        el.style.display = 'none';
                        const parent = el.parentElement;
                        if (parent) {
                          parent.style.background = primary;
                          parent.innerHTML = `<span style="font-size:11px;font-weight:900;color:#fff;font-family:Impact,sans-serif">${team.abbreviation}</span>`;
                        }
                      }}
                    />
                  </div>

                  <div style={{ position: 'relative', textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: isHovered ? C.txt : C.txtSub, lineHeight: 1.2, transition: 'color 180ms' }}>
                      {team.city}
                    </div>
                    <div style={{ fontSize: 11, color: C.txtMuted, marginTop: 2 }}>
                      {team.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Active season ────────────────────────────────────────────────────────
  const userTeam = NFL_GAME_TEAMS.find(t => t.id === userTeamId)!;
  const userPrimary = hexStr(userTeam.primaryColor);
  const weekData = schedule.find(w => w.week === currentWeek);
  const allWeeksGames = weekData?.games ?? [];

  const allPlayed = allWeeksGames.every(g => g.played);
  const userGames = allWeeksGames.filter(g => g.homeTeamId === userTeamId || g.awayTeamId === userTeamId);
  const userGamesAllPlayed = userGames.every(g => g.played);

  const getTeam = (id: string): GameTeam => NFL_GAME_TEAMS.find(t => t.id === id)!;
  const getRec = (id: string) => records[id] ?? { wins: 0, losses: 0, ties: 0 };

  // Build standings grouped by division
  const standingsGroups = DIVISIONS.map(({ conf, div }) => {
    const teams = NFL_GAME_TEAMS
      .filter(t => t.conference === `${conf} ${div}`)
      .sort((a, b) => {
        const ra = getRec(a.id);
        const rb = getRec(b.id);
        return rb.wins - ra.wins;
      });
    return { label: `${conf} ${div}`, teams };
  });

  const handleSimAll = () => {
    simWeek(currentWeek);
    advanceWeek();
  };

  const userRec = getRec(userTeamId);
  const seasonComplete = currentWeek > 18;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.txt, fontFamily: C.font, display: 'flex', flexDirection: 'column' }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── Sticky top bar ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: `rgba(5,8,15,.94)`, backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
        padding: '0 24px',
        height: 58,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flexShrink: 0,
      }}>
        <button
          onClick={() => { resetSeason(); navigate('/game/select'); }}
          style={{
            background: 'none', border: `1px solid ${C.border}`,
            borderRadius: 8, color: C.txtSub, cursor: 'pointer',
            fontSize: 12, fontWeight: 700, padding: '6px 12px',
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'border-color 160ms, color 160ms',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.borderHi; (e.currentTarget as HTMLButtonElement).style.color = C.txt; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.txtSub; }}
        >
          ← Back
        </button>

        <div style={{ width: 1, height: 22, background: C.border }} />

        {/* Team logo */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: `${userPrimary}20`,
          border: `1px solid ${userPrimary}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', flexShrink: 0,
        }}>
          <img src={teamLogo(userTeamId)} alt={userTeam.abbreviation} style={{ width: 26, height: 26, objectFit: 'contain' }} />
        </div>

        <span style={{ fontWeight: 800, fontSize: 15, color: C.txt, letterSpacing: '-.01em' }}>
          {userTeam.city} {userTeam.name}
        </span>

        <div style={{ flex: 1 }} />

        {/* W-L Record */}
        <div style={{
          background: C.panel, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: '5px 14px',
          fontSize: 13, fontWeight: 800, color: C.txt,
          letterSpacing: '.02em',
        }}>
          {userRec.wins}–{userRec.losses}
        </div>

        {/* Week badge */}
        <Badge color={seasonComplete ? C.gold : C.blueBright} dot={!seasonComplete}>
          {seasonComplete ? 'Season Complete' : `Week ${currentWeek} of 18`}
        </Badge>
      </div>

      {/* Season complete banner */}
      {seasonComplete && (
        <div style={{
          background: `linear-gradient(135deg, ${C.goldSub}, rgba(212,175,55,0.05))`,
          borderBottom: `1px solid ${C.gold}40`,
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Impact, sans-serif', color: C.gold, letterSpacing: '.04em' }}>
              REGULAR SEASON COMPLETE
            </div>
            <div style={{ color: C.txtSub, fontSize: 13, marginTop: 4 }}>
              Final record: <strong style={{ color: C.txt }}>{userRec.wins}–{userRec.losses}</strong> — Time to make your playoff push
            </div>
          </div>
          <Btn
            onClick={() => navigate('/game/playoffs')}
            accent={C.gold}
            size="lg"
          >
            VIEW PLAYOFF PICTURE →
          </Btn>
        </div>
      )}

      {/* ── Main layout ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* Left sidebar: standings */}
        <div style={{
          width: 248,
          flexShrink: 0,
          background: C.surface,
          borderRight: `1px solid ${C.border}`,
          overflowY: 'auto',
          padding: '14px 0',
        }}>
          <div style={{
            padding: '0 14px 10px',
            fontSize: 9, letterSpacing: '.18em', color: C.txtMuted,
            textTransform: 'uppercase', fontWeight: 800,
          }}>
            Conference Standings
          </div>

          {standingsGroups.map(({ label, teams }) => (
            <div key={label} style={{ marginBottom: 4 }}>
              {/* Division header */}
              <div style={{
                padding: '5px 14px',
                fontSize: 9, fontWeight: 800,
                color: C.txtSub,
                letterSpacing: '.14em', textTransform: 'uppercase',
                background: C.elevated,
                borderTop: `1px solid ${C.border}`,
                borderBottom: `1px solid ${C.border}`,
              }}>
                {label}
              </div>

              {/* Column headers */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '20px 28px 1fr 44px',
                padding: '3px 14px',
                fontSize: 8, fontWeight: 700, color: C.txtMuted,
                letterSpacing: '.12em', textTransform: 'uppercase',
              }}>
                <span>#</span>
                <span />
                <span>Team</span>
                <span style={{ textAlign: 'right' }}>W-L</span>
              </div>

              {teams.slice(0, 4).map((team, i) => {
                const rec = getRec(team.id);
                const isUser = team.id === userTeamId;
                const p = hexStr(team.primaryColor);
                return (
                  <div
                    key={team.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '20px 28px 1fr 44px',
                      padding: '5px 14px',
                      alignItems: 'center',
                      background: isUser ? `${userPrimary}14` : 'transparent',
                      borderLeft: isUser ? `2px solid ${userPrimary}` : '2px solid transparent',
                      transition: 'background 120ms',
                    }}
                  >
                    <span style={{ fontSize: 10, color: i === 0 ? C.gold : C.txtMuted, fontWeight: 700 }}>
                      {i + 1}
                    </span>
                    <div style={{
                      width: 20, height: 20,
                      borderRadius: '50%',
                      background: `${p}18`,
                      border: `1px solid ${p}50`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', flexShrink: 0,
                    }}>
                      <img
                        src={teamLogo(team.id)}
                        alt={team.abbreviation}
                        style={{ width: 14, height: 14, objectFit: 'contain' }}
                        onError={e => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.style.display = 'none';
                          const parent = el.parentElement;
                          if (parent) {
                            parent.style.background = p;
                            parent.innerHTML = `<span style="font-size:7px;font-weight:900;color:#fff">${team.abbreviation.slice(0,2)}</span>`;
                          }
                        }}
                      />
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: isUser ? 700 : 500,
                      color: isUser ? C.txt : C.txtSub,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {team.abbreviation}
                    </span>
                    <span style={{
                      fontSize: 11, color: C.txtSub,
                      fontVariantNumeric: 'tabular-nums',
                      textAlign: 'right',
                      fontWeight: isUser ? 700 : 400,
                    }}>
                      {rec.wins}–{rec.losses}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Main content: weekly games ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {currentWeek <= 18 && (
            <>
              {/* Week header */}
              <div style={{ marginBottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{
                    fontSize: 24, fontWeight: 900, fontFamily: 'Impact, sans-serif',
                    margin: 0, color: C.txt, letterSpacing: '.04em',
                  }}>
                    WEEK {currentWeek} GAMES
                  </h2>
                  <div style={{ fontSize: 12, color: C.txtSub, marginTop: 4, fontWeight: 500 }}>
                    {allWeeksGames.filter(g => g.played).length} of {allWeeksGames.length} games played
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="ghost" size="sm" onClick={handleSimAll}>
                    SIM ALL WEEK
                  </Btn>
                  {userGamesAllPlayed && !allPlayed && (
                    <Btn variant="secondary" size="sm" onClick={advanceWeek}>
                      ADVANCE WEEK →
                    </Btn>
                  )}
                  {allPlayed && (
                    <Btn variant="primary" size="sm" accent={C.green} onClick={advanceWeek}>
                      NEXT WEEK →
                    </Btn>
                  )}
                </div>
              </div>

              {/* Game cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <AnimatePresence>
                  {allWeeksGames.map((game, i) => {
                    const home = getTeam(game.homeTeamId);
                    const away = getTeam(game.awayTeamId);
                    const isUserGame = game.homeTeamId === userTeamId || game.awayTeamId === userTeamId;
                    const homeRec = getRec(game.homeTeamId);
                    const awayRec = getRec(game.awayTeamId);
                    const homeWon = game.played && game.homeScore > game.awayScore;
                    const awayWon = game.played && game.awayScore > game.homeScore;
                    const homePrimary = hexStr(home.primaryColor);
                    const awayPrimary = hexStr(away.primaryColor);

                    return (
                      <motion.div
                        key={`${game.homeTeamId}-${game.awayTeamId}-${i}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        style={{
                          position: 'relative',
                          background: isUserGame ? `${userPrimary}0C` : C.surface,
                          border: `1px solid ${isUserGame ? userPrimary + '40' : C.border}`,
                          borderRadius: 14,
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          overflow: 'hidden',
                        }}
                      >
                        {/* Gradient bg */}
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: `linear-gradient(90deg, ${awayPrimary}06 0%, transparent 40%, transparent 60%, ${homePrimary}06 100%)`,
                          pointerEvents: 'none',
                        }} />

                        {/* Away team */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, position: 'relative' }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: `${awayPrimary}18`,
                            border: `1px solid ${awayPrimary}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', flexShrink: 0,
                            opacity: game.played && !awayWon ? 0.4 : 1,
                            transition: 'opacity 200ms',
                          }}>
                            <img src={teamLogo(away.id)} alt={away.abbreviation} style={{ width: 28, height: 28, objectFit: 'contain' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: awayWon ? C.txt : C.txtSub, lineHeight: 1.2 }}>
                              {away.city} {away.name}
                            </div>
                            <div style={{ fontSize: 10, color: C.txtMuted, marginTop: 2 }}>
                              {awayRec.wins}–{awayRec.losses} · Away
                            </div>
                          </div>
                        </div>

                        {/* Score or action */}
                        {game.played ? (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            minWidth: 120, justifyContent: 'center', position: 'relative',
                          }}>
                            <span style={{
                              fontSize: 28, fontWeight: 900, fontFamily: 'Impact, sans-serif',
                              color: awayWon ? C.green : C.txtMuted,
                              lineHeight: 1,
                            }}>
                              {game.awayScore}
                            </span>
                            <span style={{ fontSize: 11, color: C.txtMuted, fontWeight: 600 }}>FINAL</span>
                            <span style={{
                              fontSize: 28, fontWeight: 900, fontFamily: 'Impact, sans-serif',
                              color: homeWon ? C.green : C.txtMuted,
                              lineHeight: 1,
                            }}>
                              {game.homeScore}
                            </span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 8, minWidth: 120, justifyContent: 'center', position: 'relative' }}>
                            <button
                              onClick={() => simGame(game.homeTeamId, game.awayTeamId, currentWeek)}
                              style={{
                                background: C.elevated, border: `1px solid ${C.border}`,
                                color: C.txtSub, borderRadius: 7,
                                padding: '6px 14px', fontSize: 11, fontWeight: 700,
                                cursor: 'pointer', letterSpacing: '.05em',
                                transition: 'border-color 140ms, color 140ms',
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.borderHi; (e.currentTarget as HTMLButtonElement).style.color = C.txt; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.txtSub; }}
                            >
                              SIM
                            </button>
                            <button
                              onClick={() => navigate(`/game/play?home=${game.homeTeamId}&away=${game.awayTeamId}&league=nfl&returnTo=/game/season`)}
                              style={{
                                background: `linear-gradient(135deg, ${C.blueBright}, #42a5f5)`,
                                border: 'none', color: '#fff', borderRadius: 7,
                                padding: '6px 14px', fontSize: 11, fontWeight: 700,
                                cursor: 'pointer', letterSpacing: '.05em',
                                transition: 'opacity 140ms',
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '.8'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                            >
                              PLAY
                            </button>
                          </div>
                        )}

                        {/* Home team */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          flex: 1, justifyContent: 'flex-end',
                          flexDirection: 'row-reverse', position: 'relative',
                        }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: `${homePrimary}18`,
                            border: `1px solid ${homePrimary}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', flexShrink: 0,
                            opacity: game.played && !homeWon ? 0.4 : 1,
                            transition: 'opacity 200ms',
                          }}>
                            <img src={teamLogo(home.id)} alt={home.abbreviation} style={{ width: 28, height: 28, objectFit: 'contain' }} />
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: homeWon ? C.txt : C.txtSub, lineHeight: 1.2 }}>
                              {home.city} {home.name}
                            </div>
                            <div style={{ fontSize: 10, color: C.txtMuted, marginTop: 2 }}>
                              {homeRec.wins}–{homeRec.losses} · Home
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Bottom quick-sim controls ── */}
      {currentWeek <= 18 && (
        <div style={{
          background: C.surface,
          borderTop: `1px solid ${C.border}`,
          padding: '12px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 12, color: C.txtSub, fontWeight: 500 }}>
            Record: <strong style={{ color: C.txt, fontWeight: 800 }}>{userRec.wins}–{userRec.losses}</strong>
          </div>
          <div style={{ flex: 1 }} />
          <Btn variant="ghost" size="sm" onClick={handleSimAll}>
            SIM ALL →
          </Btn>
          {userGamesAllPlayed && (
            <Btn variant="primary" size="sm" onClick={advanceWeek}>
              ADVANCE WEEK →
            </Btn>
          )}
        </div>
      )}
    </div>
  );
}
