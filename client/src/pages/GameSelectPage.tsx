import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { NFL_GAME_TEAMS, NCAA_GAME_TEAMS } from '../game/teams';
import type { GameTeam } from '../game/teams';
import { AppShell, C, GLOBAL_CSS } from '../components/AppShell';

type League = 'nfl' | 'ncaa';

function hexStr(hex: number) { return `#${hex.toString(16).padStart(6, '0')}`; }

// ESPN CDN slug map for NFL teams
const ESPN_SLUG: Record<string, string> = {
  ari: 'ari', atl: 'atl', bal: 'bal', buf: 'buf', car: 'car',
  chi: 'chi', cin: 'cin', cle: 'cle', dal: 'dal', den: 'den',
  det: 'det', gb: 'gb',  hou: 'hou', ind: 'ind', jax: 'jax',
  kc: 'kc',  lac: 'lac', lar: 'lar', lv: 'lv',  mia: 'mia',
  min: 'min', ne: 'ne',  no: 'no',   nyg: 'nyg', nyj: 'nyj',
  phi: 'phi', pit: 'pit', sea: 'sea', sf: 'sf',  tb: 'tb',
  ten: 'ten', was: 'wsh',
};

function teamLogo(team: GameTeam) {
  if (team.league !== 'nfl') return null;
  const slug = ESPN_SLUG[team.id] ?? team.id;
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${slug}.png`;
}

function TeamAvatar({ team, size = 48 }: { team: GameTeam; size?: number }) {
  const primary = hexStr(team.primaryColor);
  const logo = teamLogo(team);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${primary}18`, border: `1px solid ${primary}50`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flexShrink: 0,
    }}>
      {logo ? (
        <img
          src={logo}
          alt={team.abbreviation}
          style={{ width: size * 0.72, height: size * 0.72, objectFit: 'contain' }}
          onError={e => {
            const el = e.currentTarget as HTMLImageElement;
            el.style.display = 'none';
            const parent = el.parentElement;
            if (parent) {
              parent.style.background = primary;
              parent.innerHTML = `<span style="font-size:${size * 0.22}px;font-weight:900;color:#fff;font-family:Impact,sans-serif">${team.abbreviation.slice(0, 3)}</span>`;
            }
          }}
        />
      ) : (
        <span style={{
          fontSize: size * 0.22, fontWeight: 900, color: '#fff',
          fontFamily: 'Impact, sans-serif',
          background: primary,
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%',
        }}>
          {team.abbreviation.slice(0, 3)}
        </span>
      )}
    </div>
  );
}

function TeamSlot({
  team, label, active, onClick, side,
}: {
  team: GameTeam | null;
  label: string;
  active: boolean;
  onClick: () => void;
  side: 'left' | 'right';
}) {
  const primary = team ? hexStr(team.primaryColor) : C.border;
  const isLeft = side === 'left';
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        borderRadius: 18,
        border: `1px solid ${active ? (team ? primary + '70' : C.borderFoc) : C.border}`,
        padding: '22px 16px',
        textAlign: 'center',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        background: team
          ? `linear-gradient(${isLeft ? '135deg' : '225deg'}, ${primary}14 0%, ${C.surface} 55%)`
          : C.surface,
        transition: 'border-color 200ms, box-shadow 200ms',
        boxShadow: active
          ? `0 0 28px ${team ? primary + '28' : C.blueFoc}`
          : 'none',
      }}
    >
      {/* Gradient wash */}
      {team && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(${isLeft ? '135deg' : '225deg'}, ${primary}0A 0%, transparent 50%)`,
          pointerEvents: 'none',
        }} />
      )}
      {/* Active indicator bar */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0, height: 2,
        background: active
          ? `linear-gradient(90deg, ${team ? primary : C.blueBright}, transparent)`
          : 'transparent',
        transition: 'background 200ms',
      }} />

      <div style={{ position: 'relative' }}>
        <div style={{
          fontSize: 9, fontWeight: 800, letterSpacing: '.18em',
          color: active ? (team ? primary : C.blueBright) : C.txtMuted,
          textTransform: 'uppercase', marginBottom: 14,
          transition: 'color 200ms',
        }}>
          {label}
        </div>

        {team ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <TeamAvatar team={team} size={64} />
            </div>
            <div style={{
              fontSize: 13, fontWeight: 700, color: C.txt, lineHeight: 1.2, marginBottom: 2,
            }}>
              {team.city}
            </div>
            <div style={{ fontSize: 11, color: C.txtSub }}>{team.name}</div>
          </>
        ) : (
          <>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              border: `2px dashed ${active ? C.borderFoc : C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 10px',
              fontSize: 22, color: active ? C.txtSub : C.txtMuted,
              transition: 'border-color 200ms, color 200ms',
            }}>
              ?
            </div>
            <div style={{ fontSize: 12, color: active ? C.txtSub : C.txtMuted, fontWeight: 600, transition: 'color 200ms' }}>
              {active ? 'Click a team below' : 'Not selected'}
            </div>
          </>
        )}
      </div>
    </button>
  );
}

export function GameSelectPage() {
  const navigate = useNavigate();
  const [league, setLeague] = useState<League>('nfl');
  const [home, setHome] = useState<GameTeam | null>(null);
  const [away, setAway] = useState<GameTeam | null>(null);
  const [picking, setPicking] = useState<'home' | 'away'>('home');

  const teams = league === 'nfl' ? NFL_GAME_TEAMS : NCAA_GAME_TEAMS;
  const canPlay = !!(home && away);

  const handleTeam = (team: GameTeam) => {
    if (picking === 'home') { setHome(team); setPicking('away'); }
    else { if (team.id === home?.id) return; setAway(team); }
  };

  const homePrimary = home ? hexStr(home.primaryColor) : C.blueBright;
  const awayPrimary = away ? hexStr(away.primaryColor) : C.red;

  return (
    <AppShell title="Exhibition" backTo="/game" noPad={true}>
      <style>{GLOBAL_CSS}</style>

      <div style={{
        minHeight: 'calc(100vh - 56px)',
        background: C.bg,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient glows */}
        <div style={{
          position: 'absolute', top: -60, left: '20%',
          width: 400, height: 400,
          background: `radial-gradient(circle, ${homePrimary}12 0%, transparent 70%)`,
          borderRadius: '50%', pointerEvents: 'none',
          transition: 'background 600ms',
        }} />
        <div style={{
          position: 'absolute', top: -60, right: '20%',
          width: 400, height: 400,
          background: `radial-gradient(circle, ${awayPrimary}12 0%, transparent 70%)`,
          borderRadius: '50%', pointerEvents: 'none',
          transition: 'background 600ms',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 820, margin: '0 auto', padding: '40px 24px 64px' }}>

          {/* ── League toggle ── */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
            <div style={{
              display: 'flex', gap: 4,
              background: C.panel, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: 4,
            }}>
              {(['nfl', 'ncaa'] as League[]).map(l => {
                const isActive = league === l;
                return (
                  <button
                    key={l}
                    onClick={() => {
                      setLeague(l);
                      setHome(null); setAway(null); setPicking('home');
                    }}
                    style={{
                      position: 'relative',
                      padding: '10px 36px',
                      borderRadius: 9,
                      border: isActive ? `1px solid ${C.borderHi}` : '1px solid transparent',
                      background: isActive
                        ? l === 'nfl'
                          ? 'linear-gradient(135deg, #01245A, #0a4a9a)'
                          : 'linear-gradient(135deg, #5a0000, #8B0000)'
                        : 'transparent',
                      color: isActive ? '#fff' : C.txtMuted,
                      cursor: 'pointer',
                      fontSize: 13, fontWeight: 800, letterSpacing: '.12em',
                      fontFamily: 'Impact, sans-serif',
                      transition: 'all 180ms ease',
                      boxShadow: isActive ? `0 2px 18px ${l === 'nfl' ? '#0a4a9a' : '#8B0000'}40` : 'none',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = C.txt;
                    }}
                    onMouseLeave={e => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = C.txtMuted;
                    }}
                  >
                    {l.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── VS screen ── */}
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 16, marginBottom: 36 }}>
            <TeamSlot
              team={home} label="HOME"
              active={picking === 'home'}
              onClick={() => setPicking('home')}
              side="left"
            />

            {/* VS center */}
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              minWidth: 56, flexShrink: 0,
            }}>
              <div style={{
                fontSize: 28, fontWeight: 900, fontFamily: 'Impact, sans-serif',
                color: canPlay ? C.txt : C.txtMuted,
                letterSpacing: '.06em',
                textShadow: canPlay ? `0 0 28px ${C.txt}40` : 'none',
                transition: 'color 300ms, text-shadow 300ms',
              }}>
                VS
              </div>
              <AnimatePresence>
                {canPlay && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: '.14em',
                      color: C.green, textTransform: 'uppercase',
                    }}
                  >
                    Ready
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <TeamSlot
              team={away} label="AWAY"
              active={picking === 'away'}
              onClick={() => setPicking('away')}
              side="right"
            />
          </div>

          {/* ── Selecting prompt ── */}
          <p style={{
            fontSize: 10, fontWeight: 800, letterSpacing: '.2em', color: C.txtMuted,
            textTransform: 'uppercase', textAlign: 'center', marginBottom: 18,
          }}>
            {picking === 'home' ? '↓ Select Home Team' : '↓ Select Away Team'}
          </p>

          {/* ── Team grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
            {teams.map(team => {
              const isHome    = home?.id === team.id;
              const isAway    = away?.id === team.id;
              const disabled  = picking === 'away' && isHome;
              const primary   = hexStr(team.primaryColor);
              const logo      = teamLogo(team);
              const isSelected = isHome || isAway;

              return (
                <button
                  key={team.id}
                  onClick={() => !disabled && handleTeam(team)}
                  disabled={disabled}
                  style={{
                    position: 'relative',
                    padding: '12px 8px',
                    borderRadius: 12,
                    border: `1px solid ${
                      isHome ? C.blueBright + '70'
                      : isAway ? C.red + '70'
                      : C.border
                    }`,
                    background: isSelected
                      ? `linear-gradient(135deg, ${primary}1A, ${C.surface})`
                      : C.surface,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.25 : 1,
                    overflow: 'hidden',
                    transition: 'all 160ms ease',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  }}
                  onMouseEnter={e => {
                    if (disabled) return;
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.borderColor = primary + '80';
                    el.style.transform = 'translateY(-2px)';
                    el.style.boxShadow = `0 6px 24px ${primary}24`;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.borderColor = isHome ? C.blueBright + '70' : isAway ? C.red + '70' : C.border;
                    el.style.transform = '';
                    el.style.boxShadow = '';
                  }}
                >
                  {/* Gradient overlay */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: `linear-gradient(135deg, ${primary}10 0%, transparent 55%)`,
                      pointerEvents: 'none',
                    }} />
                  )}
                  {/* Bottom accent */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                    background: isHome
                      ? `linear-gradient(90deg, ${C.blueBright}, transparent)`
                      : isAway
                      ? `linear-gradient(90deg, ${C.red}, transparent)`
                      : 'transparent',
                  }} />

                  {/* Logo */}
                  <div style={{
                    position: 'relative',
                    width: 44, height: 44, borderRadius: '50%',
                    background: isSelected ? `${primary}20` : C.panel,
                    border: `1px solid ${isSelected ? primary + '60' : C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', flexShrink: 0,
                    boxShadow: isSelected ? `0 0 16px ${primary}40` : 'none',
                  }}>
                    {logo ? (
                      <img
                        src={logo}
                        alt={team.abbreviation}
                        style={{ width: 32, height: 32, objectFit: 'contain' }}
                        onError={e => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.style.display = 'none';
                          const parent = el.parentElement;
                          if (parent) {
                            parent.style.background = primary;
                            parent.innerHTML = `<span style="font-size:10px;font-weight:900;color:#fff;font-family:Impact,sans-serif">${team.abbreviation.slice(0,3)}</span>`;
                          }
                        }}
                      />
                    ) : (
                      <span style={{
                        fontSize: 10, fontWeight: 900, color: '#fff',
                        fontFamily: 'Impact, sans-serif',
                        background: primary,
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '50%',
                      }}>
                        {team.abbreviation.slice(0, 3)}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <div style={{ position: 'relative', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.txt, lineHeight: 1.2 }}>{team.city}</div>
                    <div style={{ fontSize: 10, color: C.txtSub, lineHeight: 1.2 }}>{team.name}</div>
                  </div>

                  {/* Home/Away badge */}
                  {(isHome || isAway) && (
                    <div style={{
                      position: 'relative',
                      fontSize: 8, fontWeight: 800, letterSpacing: '.14em',
                      color: isHome ? C.blueBright : C.red,
                      background: isHome ? C.blueSub : C.redSub,
                      border: `1px solid ${isHome ? C.blueBright + '30' : C.red + '30'}`,
                      borderRadius: 999, padding: '2px 8px',
                      textTransform: 'uppercase',
                    }}>
                      {isHome ? 'HOME' : 'AWAY'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Matchup rating bars ── */}
          <AnimatePresence>
            {canPlay && home && away && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: '18px 24px', marginBottom: 16,
                }}
              >
                {(
                  [
                    ['Offense', home.offenseRating, away.offenseRating],
                    ['Defense', home.defenseRating, away.defenseRating],
                    ['Speed',   home.speedRating,   away.speedRating],
                  ] as [string, number, number][]
                ).map(([label, h, a]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{
                      fontSize: 15, fontWeight: 900, fontFamily: 'Impact, sans-serif',
                      color: C.blueBright, minWidth: 28, textAlign: 'center',
                    }}>
                      {h}
                    </span>
                    <div style={{ flex: 1, height: 6, background: C.elevated, borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                      {/* Home bar fills from center-left */}
                      <div style={{
                        position: 'absolute', right: '50%', top: 0, bottom: 0,
                        width: `${h / 2}%`,
                        background: `linear-gradient(270deg, ${C.blueBright}, ${C.blueBright}80)`,
                        borderRadius: '3px 0 0 3px',
                      }} />
                      {/* Away bar fills from center-right */}
                      <div style={{
                        position: 'absolute', left: '50%', top: 0, bottom: 0,
                        width: `${a / 2}%`,
                        background: `linear-gradient(90deg, ${C.red}, ${C.red}80)`,
                        borderRadius: '0 3px 3px 0',
                      }} />
                    </div>
                    <span style={{
                      fontSize: 8, fontWeight: 800, letterSpacing: '.14em',
                      color: C.txtMuted, textTransform: 'uppercase',
                      minWidth: 44, textAlign: 'center',
                    }}>
                      {label}
                    </span>
                    <div style={{ flex: 1, height: 6, background: C.elevated, borderRadius: 3, overflow: 'hidden', position: 'relative', transform: 'scaleX(-1)' }}>
                      <div style={{
                        position: 'absolute', right: '50%', top: 0, bottom: 0,
                        width: `${a / 2}%`,
                        background: `linear-gradient(270deg, ${C.red}, ${C.red}80)`,
                        borderRadius: '3px 0 0 3px',
                      }} />
                    </div>
                    <span style={{
                      fontSize: 15, fontWeight: 900, fontFamily: 'Impact, sans-serif',
                      color: C.red, minWidth: 28, textAlign: 'center',
                    }}>
                      {a}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── KICKOFF button ── */}
          <button
            onClick={() => canPlay && home && away && navigate(`/game/play?home=${home.id}&away=${away.id}&league=${league}`)}
            disabled={!canPlay}
            style={{
              width: '100%',
              padding: '20px 24px',
              borderRadius: 16,
              border: canPlay
                ? `1px solid ${C.green}50`
                : `1px solid ${C.border}`,
              background: canPlay
                ? `linear-gradient(135deg, #0d3d12, #1a6e20)`
                : C.surface,
              color: canPlay ? '#fff' : C.txtMuted,
              cursor: canPlay ? 'pointer' : 'not-allowed',
              fontSize: 20, fontWeight: 900,
              fontFamily: 'Impact, Arial Narrow, sans-serif',
              letterSpacing: '.08em',
              boxShadow: canPlay ? `0 0 48px ${C.green}28, inset 0 1px 0 rgba(255,255,255,.08)` : 'none',
              transition: 'all 200ms ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              if (!canPlay) return;
              const el = e.currentTarget as HTMLButtonElement;
              el.style.transform = 'translateY(-2px)';
              el.style.boxShadow = `0 0 64px ${C.green}40, inset 0 1px 0 rgba(255,255,255,.1)`;
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.transform = '';
              el.style.boxShadow = canPlay ? `0 0 48px ${C.green}28, inset 0 1px 0 rgba(255,255,255,.08)` : 'none';
            }}
          >
            {/* Shimmer on hover when ready */}
            {canPlay && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0) 40%, rgba(255,255,255,.04) 50%, rgba(255,255,255,0) 60%)',
                pointerEvents: 'none',
              }} />
            )}
            <span style={{ position: 'relative' }}>
              {canPlay && home && away
                ? `KICKOFF → ${home.abbreviation} vs ${away.abbreviation}`
                : 'SELECT BOTH TEAMS TO PLAY'
              }
            </span>
          </button>

        </div>
      </div>
    </AppShell>
  );
}
