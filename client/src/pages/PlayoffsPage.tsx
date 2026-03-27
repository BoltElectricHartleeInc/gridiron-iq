import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayoffStore, type PlayoffBracket } from '../store/playoffStore';
import { NFL_GAME_TEAMS, type GameTeam } from '../game/teams';

const S = {
  bg:        '#0b0f18',
  surface:   '#0f1623',
  elevated:  '#141d2e',
  border:    '#1c2d40',
  borderHi:  '#253352',
  txt:       '#cdd8e8',
  txtSub:    '#6b82a0',
  txtMuted:  '#334560',
  blue:      '#3b7dd8',
  blueSub:   'rgba(59,125,216,0.12)',
  gold:      '#c49a1a',
  goldBright: '#f59e0b',
  goldSub:   'rgba(196,154,26,0.12)',
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

const ROUND_LABELS: Record<string, string> = {
  wildcard: 'WILD CARD WEEKEND',
  divisional: 'DIVISIONAL ROUND',
  conference: 'CONFERENCE CHAMPIONSHIPS',
  superbowl: 'SUPER BOWL',
};

const CONF_LABEL_COLORS: Record<string, string> = {
  AFC: '#c60c30',
  NFC: '#003594',
  'Super Bowl': '#c49a1a',
};

function getTeam(id: string): GameTeam | undefined {
  return NFL_GAME_TEAMS.find(t => t.id === id);
}

function TeamCircle({ teamId, size = 48, winner = false, loser = false }: {
  teamId: string; size?: number; winner?: boolean; loser?: boolean;
}) {
  const team = getTeam(teamId);
  if (!team) return null;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: hexStr(team.primaryColor),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.22, fontWeight: 900,
      color: hexStr(team.secondaryColor),
      fontFamily: 'Impact, sans-serif',
      letterSpacing: '0.03em',
      boxShadow: winner ? `0 0 16px ${hexStr(team.primaryColor)}80` : 'none',
      opacity: loser ? 0.35 : 1,
      border: winner ? `2px solid ${hexStr(team.primaryColor)}` : '2px solid transparent',
      transition: 'all 0.3s',
      flexShrink: 0,
    }}>
      {team.abbreviation}
    </div>
  );
}

// ── Seed slot picker ─────────────────────────────────────────────────────────
function SeedSlotPicker({ seed, seedNum, conf, assignedIds, onAssign }: {
  seed: string | null;
  seedNum: number;
  conf: 'AFC' | 'NFC';
  assignedIds: string[];
  onAssign: (teamId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const team = seed ? getTeam(seed) : null;

  const available = NFL_GAME_TEAMS.filter(t => {
    const c = t.conference ?? '';
    const inConf = c.startsWith(conf);
    const notTaken = !assignedIds.includes(t.id) || t.id === seed;
    return inConf && notTaken;
  });

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: team ? `${hexStr(team.primaryColor)}22` : S.elevated,
          border: `1px solid ${team ? hexStr(team.primaryColor) + '60' : S.border}`,
          borderRadius: 10,
          padding: '10px 14px',
          cursor: 'pointer',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          transition: 'all 0.15s',
        }}
      >
        <span style={{ fontSize: 11, color: S.txtMuted, minWidth: 16, fontWeight: 700 }}>{seedNum}</span>
        {team ? (
          <>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: hexStr(team.primaryColor),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 8, fontWeight: 900, color: hexStr(team.secondaryColor),
              fontFamily: 'Impact, sans-serif', flexShrink: 0,
            }}>
              {team.abbreviation}
            </div>
            <span style={{ fontSize: 12, color: S.txt, fontWeight: 700 }}>{team.city} {team.name}</span>
          </>
        ) : (
          <span style={{ fontSize: 12, color: S.txtMuted }}>Select team...</span>
        )}
        <span style={{ marginLeft: 'auto', color: S.txtMuted, fontSize: 10 }}>▼</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 100,
              background: S.elevated,
              border: `1px solid ${S.borderHi}`,
              borderRadius: 10,
              marginTop: 4,
              maxHeight: 220,
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {available.map(t => (
              <button
                key={t.id}
                onClick={() => { onAssign(t.id); setOpen(false); }}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = S.borderHi)}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: hexStr(t.primaryColor),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 7, fontWeight: 900, color: hexStr(t.secondaryColor),
                  fontFamily: 'Impact, sans-serif', flexShrink: 0,
                }}>
                  {t.abbreviation}
                </div>
                <span style={{ fontSize: 12, color: S.txt }}>{t.city} {t.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Game matchup card ─────────────────────────────────────────────────────────
function MatchupCard({ game, onSim, onPlay, conf }: {
  game: PlayoffBracket['games'][number];
  onSim: () => void;
  onPlay: () => void;
  conf: string;
}) {
  const home = getTeam(game.homeTeamId);
  const away = getTeam(game.awayTeamId);
  if (!home || !away) return null;

  const accentColor = CONF_LABEL_COLORS[conf] ?? S.accent;
  const homeWon = game.played && game.homeScore > game.awayScore;
  const awayWon = game.played && game.awayScore > game.homeScore;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: S.surface,
        border: `1px solid ${S.border}`,
        borderTop: `3px solid ${accentColor}`,
        borderRadius: 14,
        padding: '20px 22px',
        minWidth: 280,
      }}
    >
      <div style={{ fontSize: 10, color: accentColor, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 16, textTransform: 'uppercase' }}>
        {conf}
      </div>

      {/* Away team row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 10px',
        borderRadius: 8,
        background: awayWon ? `${hexStr(away.primaryColor)}18` : 'transparent',
        marginBottom: 6,
      }}>
        <TeamCircle teamId={game.awayTeamId} size={44} winner={awayWon} loser={homeWon} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: awayWon ? S.txt : S.txtSub }}>
            {away.city} {away.name}
          </div>
          <div style={{ fontSize: 10, color: S.txtMuted }}>Away</div>
        </div>
        {game.played && (
          <span style={{
            fontSize: 28, fontWeight: 900, fontFamily: 'Impact, sans-serif',
            color: awayWon ? S.greenBright : S.txtMuted,
          }}>
            {game.awayScore}
          </span>
        )}
      </div>

      <div style={{ textAlign: 'center', fontSize: 10, color: S.txtMuted, margin: '4px 0' }}>vs</div>

      {/* Home team row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 10px',
        borderRadius: 8,
        background: homeWon ? `${hexStr(home.primaryColor)}18` : 'transparent',
        marginBottom: 16,
      }}>
        <TeamCircle teamId={game.homeTeamId} size={44} winner={homeWon} loser={awayWon} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: homeWon ? S.txt : S.txtSub }}>
            {home.city} {home.name}
          </div>
          <div style={{ fontSize: 10, color: S.txtMuted }}>Home</div>
        </div>
        {game.played && (
          <span style={{
            fontSize: 28, fontWeight: 900, fontFamily: 'Impact, sans-serif',
            color: homeWon ? S.greenBright : S.txtMuted,
          }}>
            {game.homeScore}
          </span>
        )}
      </div>

      {/* Actions */}
      {!game.played ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onSim}
            style={{
              flex: 1,
              background: S.elevated,
              border: `1px solid ${S.border}`,
              color: S.txtSub,
              borderRadius: 8,
              padding: '9px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            SIM
          </button>
          <button
            onClick={onPlay}
            style={{
              flex: 1,
              background: accentColor,
              border: 'none',
              color: '#fff',
              borderRadius: 8,
              padding: '9px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            PLAY
          </button>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          fontSize: 11,
          color: S.greenBright,
          fontWeight: 700,
          letterSpacing: '0.1em',
          padding: '6px',
          background: S.greenSub,
          borderRadius: 6,
        }}>
          FINAL
        </div>
      )}
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function PlayoffsPage() {
  const navigate = useNavigate();
  const { bracket, userTeamId, startPlayoffs, simGame, advanceRound, resetPlayoffs } = usePlayoffStore();

  const [afcSeeds, setAfcSeeds] = useState<(string | null)[]>(Array(7).fill(null));
  const [nfcSeeds, setNfcSeeds] = useState<(string | null)[]>(Array(7).fill(null));

  const allAssigned = afcSeeds.every(Boolean) && nfcSeeds.every(Boolean);

  const autoSeed = () => {
    const afcTeams = NFL_GAME_TEAMS
      .filter(t => (t.conference ?? '').startsWith('AFC'))
      .sort((a, b) => ((b.offenseRating + b.defenseRating) / 2) - ((a.offenseRating + a.defenseRating) / 2))
      .slice(0, 7)
      .map(t => t.id);
    const nfcTeams = NFL_GAME_TEAMS
      .filter(t => (t.conference ?? '').startsWith('NFC'))
      .sort((a, b) => ((b.offenseRating + b.defenseRating) / 2) - ((a.offenseRating + a.defenseRating) / 2))
      .slice(0, 7)
      .map(t => t.id);
    setAfcSeeds(afcTeams);
    setNfcSeeds(nfcTeams);
  };

  const handleStartPlayoffs = () => {
    if (!allAssigned) return;
    const uid = userTeamId ?? afcSeeds[0]!;
    startPlayoffs(afcSeeds as string[], nfcSeeds as string[], uid);
  };

  // ── No bracket yet: seeding UI ───────────────────────────────────────────
  if (!bracket) {
    const allAssignedIds = [...afcSeeds, ...nfcSeeds].filter(Boolean) as string[];

    return (
      <div style={{ minHeight: '100vh', background: S.bg, color: S.txt, padding: '40px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <button
            onClick={() => navigate('/game/select')}
            style={{ background: 'none', border: 'none', color: S.txtSub, cursor: 'pointer', fontSize: 13, marginBottom: 32 }}
          >
            ← Back
          </button>

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', color: S.txtMuted, marginBottom: 8, textTransform: 'uppercase' }}>
              GridironIQ
            </div>
            <h1 style={{ fontSize: 38, fontWeight: 900, fontFamily: 'Impact, sans-serif', letterSpacing: '0.05em', margin: 0, color: S.txt }}>
              NFL PLAYOFFS
            </h1>
            <p style={{ color: S.txtSub, marginTop: 8, fontSize: 14 }}>
              Seed all 14 playoff teams to begin
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={autoSeed}
              style={{
                background: S.elevated,
                border: `1px solid ${S.border}`,
                color: S.txt,
                borderRadius: 8,
                padding: '8px 20px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: 12,
                letterSpacing: '0.05em',
              }}
            >
              AUTO-SEED BY RATING
            </motion.button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            {(['AFC', 'NFC'] as const).map((conf, ci) => {
              const seeds = ci === 0 ? afcSeeds : nfcSeeds;
              const setSeeds = ci === 0 ? setAfcSeeds : setNfcSeeds;
              return (
                <div key={conf}>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 900,
                    fontFamily: 'Impact, sans-serif',
                    letterSpacing: '0.1em',
                    color: CONF_LABEL_COLORS[conf],
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <div style={{ width: 4, height: 20, borderRadius: 2, background: CONF_LABEL_COLORS[conf] }} />
                    {conf} SEEDS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {seeds.map((seed, i) => (
                      <SeedSlotPicker
                        key={i}
                        seed={seed}
                        seedNum={i + 1}
                        conf={conf}
                        assignedIds={allAssignedIds}
                        onAssign={teamId => {
                          const next = [...seeds];
                          next[i] = teamId;
                          setSeeds(next);
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <motion.button
              whileHover={{ scale: allAssigned ? 1.04 : 1 }}
              whileTap={{ scale: allAssigned ? 0.97 : 1 }}
              onClick={handleStartPlayoffs}
              disabled={!allAssigned}
              style={{
                background: allAssigned
                  ? `linear-gradient(135deg, ${S.gold}, #f59e0b)`
                  : S.elevated,
                border: 'none',
                color: allAssigned ? '#000' : S.txtMuted,
                borderRadius: 12,
                padding: '14px 48px',
                fontSize: 16,
                fontWeight: 900,
                cursor: allAssigned ? 'pointer' : 'not-allowed',
                fontFamily: 'Impact, sans-serif',
                letterSpacing: '0.08em',
                transition: 'all 0.2s',
              }}
            >
              START PLAYOFFS
            </motion.button>
            {!allAssigned && (
              <div style={{ fontSize: 12, color: S.txtMuted, marginTop: 8 }}>
                Assign all 14 seeds to continue
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Active bracket ──────────────────────────────────────────────────────────
  const currentRoundGames = bracket.games.filter(g => g.round === bracket.currentRound);
  const allCurrentPlayed = currentRoundGames.every(g => g.played);

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
          onClick={() => navigate('/game/select')}
          style={{ background: 'none', border: 'none', color: S.txtSub, cursor: 'pointer', fontSize: 13 }}
        >
          ← Back
        </button>
        <div style={{ width: 1, height: 20, background: S.border }} />
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: 20,
            fontWeight: 900,
            fontFamily: 'Impact, sans-serif',
            letterSpacing: '0.08em',
            margin: 0,
            color: bracket.currentRound === 'superbowl' ? S.goldBright : S.txt,
          }}>
            {ROUND_LABELS[bracket.currentRound]}
          </h1>
        </div>
        {allCurrentPlayed && !bracket.champion && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={advanceRound}
            style={{
              background: `linear-gradient(135deg, ${S.accent}, #6366f1)`,
              border: 'none',
              color: '#fff',
              borderRadius: 8,
              padding: '8px 20px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            ADVANCE ROUND →
          </motion.button>
        )}
      </div>

      {/* Champion display */}
      <AnimatePresence>
        {bracket.champion && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: `linear-gradient(135deg, ${S.gold}30, ${S.goldSub})`,
              border: `1px solid ${S.gold}80`,
              padding: '32px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 12, letterSpacing: '0.2em', color: S.goldBright, textTransform: 'uppercase', marginBottom: 8 }}>
              Super Bowl Champions
            </div>
            {(() => {
              const champ = getTeam(bracket.champion);
              return champ ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
                  <TeamCircle teamId={bracket.champion} size={72} winner />
                  <div>
                    <div style={{ fontSize: 36, fontWeight: 900, fontFamily: 'Impact, sans-serif', color: S.gold }}>
                      {champ.city}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Impact, sans-serif', color: S.txt }}>
                      {champ.name}
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={resetPlayoffs}
              style={{
                background: S.gold,
                border: 'none',
                color: '#000',
                borderRadius: 10,
                padding: '10px 28px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              RESET PLAYOFFS
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Games grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px' }}>
        {!bracket.champion && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: S.txtSub, marginBottom: 4 }}>
                {currentRoundGames.filter(g => g.played).length} of {currentRoundGames.length} games played
              </div>
              {allCurrentPlayed && (
                <div style={{ fontSize: 12, color: S.greenBright, fontWeight: 600 }}>
                  All games complete — advance to the next round
                </div>
              )}
            </div>

            {/* AFC games */}
            {(['AFC', 'NFC', 'Super Bowl'] as const).map(conf => {
              const confGames = currentRoundGames.filter(g => g.conference === conf);
              if (confGames.length === 0) return null;
              return (
                <div key={conf} style={{ marginBottom: 36 }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: '0.15em',
                    color: CONF_LABEL_COLORS[conf] ?? S.txtSub,
                    textTransform: 'uppercase',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <div style={{ width: 3, height: 14, borderRadius: 2, background: CONF_LABEL_COLORS[conf] ?? S.border }} />
                    {conf}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    {confGames.map(game => (
                      <MatchupCard
                        key={game.id}
                        game={game}
                        conf={conf}
                        onSim={() => simGame(game.id)}
                        onPlay={() => navigate(`/game/play?home=${game.homeTeamId}&away=${game.awayTeamId}&league=nfl&returnTo=/game/playoffs`)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Previous rounds summary */}
        {(['wildcard', 'divisional', 'conference', 'superbowl'] as const)
          .filter(r => r !== bracket.currentRound || bracket.champion)
          .map(round => {
            const rGames = bracket.games.filter(g => g.round === round && g.played);
            if (rGames.length === 0) return null;
            return (
              <div key={round} style={{ marginTop: 32 }}>
                <div style={{
                  fontSize: 10,
                  letterSpacing: '0.15em',
                  color: S.txtMuted,
                  textTransform: 'uppercase',
                  marginBottom: 10,
                  fontWeight: 700,
                }}>
                  {ROUND_LABELS[round]} — Results
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {rGames.map(game => {
                    const home = getTeam(game.homeTeamId);
                    const away = getTeam(game.awayTeamId);
                    if (!home || !away) return null;
                    const homeWon = game.homeScore > game.awayScore;
                    return (
                      <div key={game.id} style={{
                        background: S.surface,
                        border: `1px solid ${S.border}`,
                        borderRadius: 8,
                        padding: '8px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        fontSize: 12,
                      }}>
                        <TeamCircle teamId={game.awayTeamId} size={26} winner={!homeWon} loser={homeWon} />
                        <span style={{ color: !homeWon ? S.greenBright : S.txtMuted, fontWeight: 700 }}>{game.awayScore}</span>
                        <span style={{ color: S.txtMuted }}>–</span>
                        <span style={{ color: homeWon ? S.greenBright : S.txtMuted, fontWeight: 700 }}>{game.homeScore}</span>
                        <TeamCircle teamId={game.homeTeamId} size={26} winner={homeWon} loser={!homeWon} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      {/* Bottom action bar */}
      {!bracket.champion && (
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
            Round: <strong style={{ color: S.txt }}>{ROUND_LABELS[bracket.currentRound]}</strong>
          </div>
          <div style={{ flex: 1 }} />
          {allCurrentPlayed && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={advanceRound}
              style={{
                background: `linear-gradient(135deg, ${S.accent}, #6366f1)`,
                border: 'none',
                color: '#fff',
                borderRadius: 8,
                padding: '10px 24px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              ADVANCE ROUND →
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}
