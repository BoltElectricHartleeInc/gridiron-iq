import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSeasonStore } from '../store/seasonStore';
import { NFL_GAME_TEAMS, type GameTeam } from '../game/teams';

const S = {
  bg:        '#0b0f18',
  surface:   '#0f1623',
  elevated:  '#141d2e',
  card:      '#111827',
  border:    '#1c2d40',
  borderHi:  '#253352',
  txt:       '#cdd8e8',
  txtSub:    '#6b82a0',
  txtMuted:  '#334560',
  blue:      '#3b7dd8',
  blueSub:   'rgba(59,125,216,0.12)',
  gold:      '#c49a1a',
  goldSub:   'rgba(196,154,26,0.10)',
  green:     '#1e8c4e',
  greenBright: '#22c55e',
  greenSub:  'rgba(30,140,78,0.12)',
  red:       '#b53838',
  redBright: '#ef4444',
  redSub:    'rgba(181,56,56,0.12)',
  accent:    '#4f8ef7',
};

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

function getTeamConf(id: string): string {
  const t = NFL_GAME_TEAMS.find(t => t.id === id);
  return t?.conference ?? '';
}

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
      <div style={{ minHeight: '100vh', background: S.bg, color: S.txt, padding: '40px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <button
            onClick={() => navigate('/game/select')}
            style={{ background: 'none', border: 'none', color: S.txtSub, cursor: 'pointer', fontSize: 13, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            ← Back
          </button>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', color: S.txtMuted, marginBottom: 8, textTransform: 'uppercase' }}>
              GridironIQ
            </div>
            <h1 style={{ fontSize: 38, fontWeight: 900, fontFamily: 'Impact, sans-serif', letterSpacing: '0.05em', margin: 0, color: S.txt }}>
              SEASON MODE
            </h1>
            <p style={{ color: S.txtSub, marginTop: 8, fontSize: 14 }}>
              Choose your team and lead them through 18 weeks
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {NFL_GAME_TEAMS.map(team => (
              <motion.button
                key={team.id}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onMouseEnter={() => setHoveredTeam(team.id)}
                onMouseLeave={() => setHoveredTeam(null)}
                onClick={() => startSeason(team.id)}
                style={{
                  background: hoveredTeam === team.id
                    ? `${hexStr(team.primaryColor)}22`
                    : S.surface,
                  border: `1px solid ${hoveredTeam === team.id ? hexStr(team.primaryColor) + '80' : S.border}`,
                  borderRadius: 12,
                  padding: '14px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: hexStr(team.primaryColor),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 900, color: hexStr(team.secondaryColor),
                  letterSpacing: '0.05em', fontFamily: 'Impact, sans-serif',
                  boxShadow: `0 0 12px ${hexStr(team.primaryColor)}40`,
                }}>
                  {team.abbreviation}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: S.txt, textAlign: 'center' }}>
                    {team.city}
                  </div>
                  <div style={{ fontSize: 10, color: S.txtSub, textAlign: 'center' }}>
                    {team.name}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Active season ────────────────────────────────────────────────────────
  const userTeam = NFL_GAME_TEAMS.find(t => t.id === userTeamId)!;
  const weekData = schedule.find(w => w.week === currentWeek);
  const allWeeksGames = weekData?.games ?? [];

  const allPlayed = allWeeksGames.every(g => g.played);
  const userGames = allWeeksGames.filter(g => g.homeTeamId === userTeamId || g.awayTeamId === userTeamId);
  const userGamesAllPlayed = userGames.every(g => g.played);

  const getTeam = (id: string): GameTeam => NFL_GAME_TEAMS.find(t => t.id === id)!;
  const getRec = (id: string) => records[id] ?? { wins: 0, losses: 0, ties: 0 };

  const getDivisionTeams = (conf: string, div: string) => {
    return NFL_GAME_TEAMS
      .filter(t => t.conference === conf && t.conference?.includes(conf))
      .filter(t => {
        // Match conference from the game teams
        const confMatch = conf === 'AFC' ? ['AFC East', 'AFC North', 'AFC South', 'AFC West'] : ['NFC East', 'NFC North', 'NFC South', 'NFC West'];
        return confMatch.some(c => c.includes(div) && t.conference === c);
      })
      .sort((a, b) => (getRec(b.id).wins - getRec(a.id).wins));
  };

  // Build standings grouped properly using conference field on GameTeam
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

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.txt, display: 'flex', flexDirection: 'column' }}>
      {/* Top nav */}
      <div style={{
        background: S.surface,
        borderBottom: `1px solid ${S.border}`,
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexShrink: 0,
      }}>
        <button
          onClick={() => { resetSeason(); navigate('/game/select'); }}
          style={{ background: 'none', border: 'none', color: S.txtSub, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          ← Back
        </button>
        <div style={{ width: 1, height: 20, background: S.border }} />
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: hexStr(userTeam.primaryColor),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 900, color: hexStr(userTeam.secondaryColor),
          fontFamily: 'Impact, sans-serif',
        }}>
          {userTeam.abbreviation}
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, color: S.txt }}>
          {userTeam.city} {userTeam.name}
        </span>
        <div style={{ flex: 1 }} />
        <div style={{
          background: S.elevated,
          border: `1px solid ${S.border}`,
          borderRadius: 8,
          padding: '4px 14px',
          fontSize: 13,
          fontWeight: 700,
          color: currentWeek > 18 ? S.gold : S.accent,
        }}>
          {currentWeek > 18 ? 'SEASON COMPLETE' : `Week ${currentWeek} of 18`}
        </div>
      </div>

      {/* Season complete banner */}
      {currentWeek > 18 && (
        <div style={{
          background: `linear-gradient(135deg, ${S.gold}20, ${S.goldSub})`,
          border: `1px solid ${S.gold}60`,
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: S.gold, fontFamily: 'Impact, sans-serif' }}>
              REGULAR SEASON COMPLETE
            </div>
            <div style={{ color: S.txtSub, fontSize: 13, marginTop: 2 }}>
              {getRec(userTeamId).wins}-{getRec(userTeamId).losses} — Time to make your playoff run
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/game/playoffs')}
            style={{
              background: S.gold,
              color: '#000',
              border: 'none',
              borderRadius: 10,
              padding: '12px 28px',
              fontSize: 14,
              fontWeight: 900,
              cursor: 'pointer',
              fontFamily: 'Impact, sans-serif',
              letterSpacing: '0.05em',
            }}
          >
            VIEW PLAYOFF PICTURE →
          </motion.button>
        </div>
      )}

      {/* Main layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar: Standings */}
        <div style={{
          width: 240,
          flexShrink: 0,
          background: S.surface,
          borderRight: `1px solid ${S.border}`,
          overflowY: 'auto',
          padding: '16px 0',
        }}>
          <div style={{ padding: '0 14px 10px', fontSize: 10, letterSpacing: '0.15em', color: S.txtMuted, textTransform: 'uppercase', fontWeight: 700 }}>
            Conference Standings
          </div>
          {standingsGroups.map(({ label, teams }) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{
                padding: '4px 14px',
                fontSize: 10,
                fontWeight: 700,
                color: S.txtSub,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: S.elevated,
                borderTop: `1px solid ${S.border}`,
                borderBottom: `1px solid ${S.border}`,
              }}>
                {label}
              </div>
              {teams.slice(0, 4).map((team, i) => {
                const rec = getRec(team.id);
                const isUser = team.id === userTeamId;
                return (
                  <div
                    key={team.id}
                    style={{
                      padding: '6px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: isUser ? `${hexStr(userTeam.primaryColor)}18` : 'transparent',
                      borderLeft: isUser ? `2px solid ${hexStr(userTeam.primaryColor)}` : '2px solid transparent',
                    }}
                  >
                    <span style={{ fontSize: 10, color: S.txtMuted, width: 12 }}>{i + 1}</span>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: hexStr(team.primaryColor),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8, fontWeight: 900, color: hexStr(team.secondaryColor),
                      fontFamily: 'Impact, sans-serif', flexShrink: 0,
                    }}>
                      {team.abbreviation}
                    </div>
                    <span style={{ fontSize: 11, color: isUser ? S.txt : S.txtSub, fontWeight: isUser ? 700 : 400, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {team.abbreviation}
                    </span>
                    <span style={{ fontSize: 11, color: S.txtSub, fontVariantNumeric: 'tabular-nums' }}>
                      {rec.wins}-{rec.losses}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Main content: weekly games */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {currentWeek <= 18 && (
            <>
              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Impact, sans-serif', margin: 0, color: S.txt, letterSpacing: '0.05em' }}>
                    WEEK {currentWeek} GAMES
                  </h2>
                  <div style={{ fontSize: 12, color: S.txtSub, marginTop: 2 }}>
                    {allWeeksGames.filter(g => g.played).length} of {allWeeksGames.length} games played
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSimAll}
                    style={{
                      background: S.elevated,
                      border: `1px solid ${S.border}`,
                      color: S.txt,
                      borderRadius: 8,
                      padding: '8px 18px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      letterSpacing: '0.05em',
                    }}
                  >
                    SIM ALL WEEK
                  </motion.button>
                  {userGamesAllPlayed && !allPlayed && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={advanceWeek}
                      style={{
                        background: S.accent,
                        border: 'none',
                        color: '#fff',
                        borderRadius: 8,
                        padding: '8px 18px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        letterSpacing: '0.05em',
                      }}
                    >
                      ADVANCE WEEK →
                    </motion.button>
                  )}
                  {allPlayed && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={advanceWeek}
                      style={{
                        background: S.green,
                        border: 'none',
                        color: '#fff',
                        borderRadius: 8,
                        padding: '8px 18px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        letterSpacing: '0.05em',
                      }}
                    >
                      NEXT WEEK →
                    </motion.button>
                  )}
                </div>
              </div>

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

                    return (
                      <motion.div
                        key={`${game.homeTeamId}-${game.awayTeamId}-${i}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        style={{
                          background: isUserGame ? `${hexStr(userTeam.primaryColor)}0e` : S.surface,
                          border: `1px solid ${isUserGame ? hexStr(userTeam.primaryColor) + '50' : S.border}`,
                          borderRadius: 12,
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        {/* Away team */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: hexStr(away.primaryColor),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 9, fontWeight: 900, color: hexStr(away.secondaryColor),
                            fontFamily: 'Impact, sans-serif', flexShrink: 0,
                            opacity: game.played && !awayWon ? 0.5 : 1,
                          }}>
                            {away.abbreviation}
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: awayWon ? S.txt : S.txtSub }}>
                              {away.city} {away.name}
                            </div>
                            <div style={{ fontSize: 10, color: S.txtMuted }}>
                              {awayRec.wins}-{awayRec.losses} · Away
                            </div>
                          </div>
                        </div>

                        {/* Score or action */}
                        {game.played ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 110, justifyContent: 'center' }}>
                            <span style={{
                              fontSize: 22, fontWeight: 900, fontFamily: 'Impact, sans-serif',
                              color: awayWon ? S.greenBright : S.txtMuted,
                            }}>
                              {game.awayScore}
                            </span>
                            <span style={{ fontSize: 12, color: S.txtMuted }}>–</span>
                            <span style={{
                              fontSize: 22, fontWeight: 900, fontFamily: 'Impact, sans-serif',
                              color: homeWon ? S.greenBright : S.txtMuted,
                            }}>
                              {game.homeScore}
                            </span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 8, minWidth: 110, justifyContent: 'center' }}>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => simGame(game.homeTeamId, game.awayTeamId, currentWeek)}
                              style={{
                                background: S.elevated,
                                border: `1px solid ${S.border}`,
                                color: S.txtSub,
                                borderRadius: 6,
                                padding: '5px 12px',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                letterSpacing: '0.05em',
                              }}
                            >
                              SIM
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => navigate(`/game/play?home=${game.homeTeamId}&away=${game.awayTeamId}&league=nfl&returnTo=/game/season`)}
                              style={{
                                background: S.accent,
                                border: 'none',
                                color: '#fff',
                                borderRadius: 6,
                                padding: '5px 12px',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                letterSpacing: '0.05em',
                              }}
                            >
                              PLAY
                            </motion.button>
                          </div>
                        )}

                        {/* Home team */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: hexStr(home.primaryColor),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 9, fontWeight: 900, color: hexStr(home.secondaryColor),
                            fontFamily: 'Impact, sans-serif', flexShrink: 0,
                            opacity: game.played && !homeWon ? 0.5 : 1,
                          }}>
                            {home.abbreviation}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: homeWon ? S.txt : S.txtSub }}>
                              {home.city} {home.name}
                            </div>
                            <div style={{ fontSize: 10, color: S.txtMuted }}>
                              {homeRec.wins}-{homeRec.losses} · Home
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

      {/* Bottom bar */}
      {currentWeek <= 18 && (
        <div style={{
          background: S.surface,
          borderTop: `1px solid ${S.border}`,
          padding: '12px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 12, color: S.txtSub }}>
            Your record: <strong style={{ color: S.txt }}>{getRec(userTeamId).wins}-{getRec(userTeamId).losses}</strong>
          </div>
          <div style={{ flex: 1 }} />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSimAll}
            style={{
              background: S.elevated,
              border: `1px solid ${S.borderHi}`,
              color: S.txt,
              borderRadius: 8,
              padding: '10px 22px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            SIM ALL →
          </motion.button>
          {userGamesAllPlayed && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={advanceWeek}
              style={{
                background: `linear-gradient(135deg, ${S.accent}, #6366f1)`,
                border: 'none',
                color: '#fff',
                borderRadius: 8,
                padding: '10px 22px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              ADVANCE WEEK →
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}
