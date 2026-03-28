import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFranchiseStore, type FranchisePlayer } from '../store/franchiseStore';
import { NFL_GAME_TEAMS } from '../game/teams';
import { AppShell, C, Badge, Btn, TabBar, GLOBAL_CSS } from '../components/AppShell';

// ESPN CDN slug map
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

type Tab = 'roster' | 'cap' | 'history' | 'freeagency';

const RANDOM_FIRST = ['Marcus', 'DeShawn', 'Malik', 'Jordan', 'Tyler', 'Antoine', 'Darius', 'Tre', 'Chris', 'Devon', 'Jamal', 'Kendrick', 'Isaiah', 'Lamar', 'Tyreek'];
const RANDOM_LAST  = ['Williams', 'Johnson', 'Davis', 'Brown', 'Carter', 'Harris', 'Robinson', 'Thompson', 'Evans', 'King', 'Walker', 'Green', 'Moore', 'Jackson', 'White'];
const FA_POSITIONS = ['QB', 'WR', 'RB', 'TE', 'OT', 'CB', 'S', 'EDGE', 'DT', 'LB'];

function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateFreeAgents(seed: number): FranchisePlayer[] {
  return Array.from({ length: 8 }, (_, i) => {
    const r = (off: number) => seededRand(seed + i * 13 + off);
    const pos = FA_POSITIONS[Math.floor(r(0) * FA_POSITIONS.length)];
    const rating = 68 + Math.floor(r(1) * 24);
    const salary = pos === 'QB' ? 18 + r(2) * 20
      : pos === 'WR' || pos === 'CB' || pos === 'EDGE' ? 8 + r(2) * 14
      : 4 + r(2) * 10;
    return {
      id: `fa_${seed}_${i}`,
      name: `${RANDOM_FIRST[Math.floor(r(3) * RANDOM_FIRST.length)]} ${RANDOM_LAST[Math.floor(r(4) * RANDOM_LAST.length)]}`,
      position: pos,
      age: 24 + Math.floor(r(5) * 9),
      rating,
      salary: Math.round(salary * 10) / 10,
      yearsLeft: 2 + Math.floor(r(6) * 3),
      isFreeAgent: true,
    };
  });
}

const PLAYOFF_LABELS: Record<string, string> = {
  CHAMPION:  'Champions',
  SB_LOSS:   'Super Bowl Loss',
  CONF:      'Conference Finals',
  DIV:       'Divisional Round',
  WC:        'Wild Card',
};

const POS_COLORS: Record<string, string> = {
  QB: C.gold, WR: C.blueBright, RB: C.green, TE: C.amber,
  OT: C.txtSub, CB: C.purple, S: C.purple, EDGE: C.red,
  DT: C.red, LB: C.amber,
};
function posColor(pos: string) { return POS_COLORS[pos] ?? C.txtSub; }

function RatingBadge({ rating }: { rating: number }) {
  const color = rating >= 85 ? C.green : rating >= 75 ? C.blueBright : rating >= 65 ? C.gold : C.red;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{ width: 56, height: 5, background: C.elevated, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${rating}%`, height: '100%', background: color, borderRadius: 3, transition: 'width .4s' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color, minWidth: 22, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{rating}</span>
    </div>
  );
}

export function FranchiseModePage() {
  const navigate = useNavigate();
  const {
    teamId, teamName, year, roster, salaryCap, usedCap, history,
    startFranchise, signPlayer, releasePlayer, advanceYear, resetFranchise,
  } = useFranchiseStore();

  const [activeTab, setActiveTab] = useState<Tab>('roster');
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null);

  const faSeed = useMemo(() => Math.floor(Math.random() * 1000), [teamId, year]);
  const freeAgents = useMemo(() => generateFreeAgents(faSeed), [faSeed]);

  const capPct   = Math.min(100, (usedCap / salaryCap) * 100);
  const capColor = capPct > 90 ? C.red : capPct > 75 ? C.gold : C.green;
  const capSpace = Math.round((salaryCap - usedCap) * 10) / 10;
  const topEarners = [...roster].sort((a, b) => b.salary - a.salary).slice(0, 5);

  const handleAdvanceYear = () => {
    const wins   = 8 + Math.floor(Math.random() * 3);
    const losses = 17 - wins;
    const r = Math.random();
    const result = r < 0.15 ? 'CHAMPION'
      : r < 0.25 ? 'SB_LOSS'
      : r < 0.38 ? 'CONF'
      : r < 0.52 ? 'DIV'
      : r < 0.65 ? 'WC'
      : null;
    advanceYear(wins, losses, result);
  };

  // ── Team picker ──────────────────────────────────────────────────────────
  if (!teamId) {
    return (
      <AppShell title="Franchise Mode" backTo="/game" noPad={true}>
        <style>{GLOBAL_CSS}</style>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px 80px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: C.goldSub, border: `1px solid ${C.gold}30`,
              borderRadius: 999, padding: '6px 18px', marginBottom: 20,
            }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.16em', color: C.gold, textTransform: 'uppercase' }}>Multi-Year Dynasty Builder</span>
            </div>
            <h1 style={{
              fontSize: 52, fontWeight: 900, fontFamily: 'Impact, sans-serif',
              letterSpacing: '.04em', margin: 0, color: C.txt,
              textShadow: `0 0 60px ${C.gold}30`,
            }}>
              FRANCHISE MODE
            </h1>
            <p style={{ color: C.txtSub, marginTop: 12, fontSize: 15, fontWeight: 500 }}>
              Build a dynasty — manage your roster, salary cap, and legacy for years to come
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
                  onClick={() => startFranchise(team.id, `${team.city} ${team.name}`)}
                  style={{
                    position: 'relative',
                    background: isHovered ? `${primary}18` : C.surface,
                    border: `1px solid ${isHovered ? primary + '80' : C.border}`,
                    borderRadius: 14,
                    padding: '18px 12px 14px',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    transition: 'all 180ms ease',
                    transform: isHovered ? 'translateY(-3px)' : 'none',
                    boxShadow: isHovered ? `0 8px 32px ${primary}28` : 'none',
                    overflow: 'hidden',
                  }}
                >
                  {isHovered && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: `linear-gradient(135deg, ${primary}12 0%, transparent 60%)`,
                      pointerEvents: 'none',
                    }} />
                  )}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                    background: isHovered ? `linear-gradient(90deg, ${primary}, transparent)` : 'transparent',
                    transition: 'background 180ms',
                  }} />

                  <div style={{
                    position: 'relative',
                    width: 52, height: 52, borderRadius: '50%',
                    background: isHovered ? `${primary}20` : C.panel,
                    border: `1px solid ${isHovered ? primary + '60' : C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: isHovered ? `0 0 20px ${primary}40` : 'none',
                    transition: 'all 180ms', flexShrink: 0,
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
                    <div style={{ fontSize: 11, color: C.txtMuted, marginTop: 2 }}>{team.name}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Active franchise ─────────────────────────────────────────────────────
  const activeTeam = NFL_GAME_TEAMS.find(t => t.id === teamId)!;
  const activePrimary = hexStr(activeTeam.primaryColor);

  const TABS: { id: string; label: string }[] = [
    { id: 'roster',     label: 'Roster' },
    { id: 'cap',        label: 'Cap' },
    { id: 'history',    label: 'History' },
    { id: 'freeagency', label: 'Free Agency' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.txt, fontFamily: C.font, display: 'flex', flexDirection: 'column' }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── Sticky top bar ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(5,8,15,.94)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
        padding: '0 24px', height: 58,
        display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
      }}>
        <button
          onClick={() => { resetFranchise(); navigate('/game/select'); }}
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
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: `${activePrimary}20`, border: `1px solid ${activePrimary}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', flexShrink: 0,
        }}>
          <img src={teamLogo(teamId)} alt={activeTeam.abbreviation} style={{ width: 26, height: 26, objectFit: 'contain' }} />
        </div>
        <span style={{ fontWeight: 800, fontSize: 15, color: C.txt }}>{teamName}</span>
        <div style={{ flex: 1 }} />
        <Badge color={C.gold}>{year} Season</Badge>
        <div style={{ fontSize: 12, color: C.txtSub, fontWeight: 500 }}>
          Cap: <strong style={{ color: capColor }}>${usedCap}M</strong>
          <span style={{ color: C.txtMuted }}> / $255M</span>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: '10px 24px', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <TabBar
          tabs={TABS}
          active={activeTab}
          onChange={id => setActiveTab(id as Tab)}
        />
      </div>

      {/* ── Tab content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 60px' }}>
        <AnimatePresence mode="wait">

          {/* ROSTER */}
          {activeTab === 'roster' && (
            <motion.div key="roster" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Impact, sans-serif', margin: 0, color: C.txt, letterSpacing: '.04em' }}>
                    ROSTER
                  </h2>
                  <div style={{ fontSize: 12, color: C.txtSub, marginTop: 4 }}>{roster.length} players on active roster</div>
                </div>
              </div>

              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 56px 44px 110px 80px 62px 80px',
                  padding: '9px 18px',
                  borderBottom: `1px solid ${C.border}`,
                  fontSize: 9, color: C.txtMuted, textTransform: 'uppercase',
                  letterSpacing: '.14em', fontWeight: 800,
                }}>
                  <span>Name</span>
                  <span>POS</span>
                  <span>Age</span>
                  <span>Rating</span>
                  <span>Salary</span>
                  <span>Yrs</span>
                  <span />
                </div>
                {roster.map((player, i) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 56px 44px 110px 80px 62px 80px',
                      padding: '11px 18px',
                      borderBottom: `1px solid ${C.border}`,
                      alignItems: 'center',
                      background: i % 2 === 0 ? 'transparent' : `${C.elevated}50`,
                      transition: 'background 120ms',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.txt }}>{player.name}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 800,
                      color: posColor(player.position),
                      background: `color-mix(in srgb, ${posColor(player.position)} 12%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${posColor(player.position)} 28%, transparent)`,
                      borderRadius: 5, padding: '2px 6px', width: 'fit-content',
                    }}>
                      {player.position}
                    </span>
                    <span style={{ fontSize: 12, color: C.txtSub }}>{player.age}</span>
                    <RatingBadge rating={player.rating} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.gold }}>${player.salary}M</span>
                    <span style={{ fontSize: 12, color: player.yearsLeft <= 1 ? C.red : C.txtSub, fontWeight: player.yearsLeft <= 1 ? 700 : 400 }}>
                      {player.yearsLeft}yr
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => releasePlayer(player.id)}
                        style={{
                          background: C.redSub, border: `1px solid ${C.red}40`,
                          color: C.red, borderRadius: 6,
                          padding: '4px 10px', fontSize: 10, fontWeight: 700,
                          cursor: 'pointer', letterSpacing: '.05em',
                          transition: 'background 140ms',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${C.red}20`; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.redSub; }}
                      >
                        RELEASE
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* SALARY CAP */}
          {activeTab === 'cap' && (
            <motion.div key="cap" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Impact, sans-serif', margin: '0 0 22px', color: C.txt, letterSpacing: '.04em' }}>
                SALARY CAP
              </h2>

              {/* Cap visual */}
              <div style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 16, padding: '32px 36px', marginBottom: 24,
                textAlign: 'center', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(135deg, ${capColor}08 0%, transparent 50%)`,
                  pointerEvents: 'none',
                }} />
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: C.txtMuted, textTransform: 'uppercase', marginBottom: 10 }}>
                  Cap Utilized
                </div>
                <div style={{ fontSize: 52, fontWeight: 900, fontFamily: 'Impact, sans-serif', color: capColor, letterSpacing: '-.02em', lineHeight: 1 }}>
                  ${usedCap}M
                </div>
                <div style={{ fontSize: 16, color: C.txtSub, margin: '6px 0 24px' }}>of $255M total cap</div>

                {/* Cap bar */}
                <div style={{ height: 18, background: C.elevated, borderRadius: 9, overflow: 'hidden', marginBottom: 14, position: 'relative' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${capPct}%` }}
                    transition={{ duration: .8, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${capColor}88, ${capColor})`,
                      borderRadius: 9,
                    }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '.06em',
                  }}>
                    {capPct.toFixed(0)}%
                  </div>
                </div>

                <div style={{ fontSize: 15, fontWeight: 700, color: capSpace > 0 ? C.green : C.red }}>
                  {capSpace > 0
                    ? `$${capSpace}M available cap space`
                    : `$${Math.abs(capSpace)}M OVER THE CAP`
                  }
                </div>
              </div>

              {/* Top earners */}
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', color: C.txtMuted, textTransform: 'uppercase', marginBottom: 12 }}>
                Top Contracts
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
                {topEarners.map((player, i) => (
                  <div key={player.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '13px 18px',
                    borderBottom: i < topEarners.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: i === 0 ? C.gold : C.txtMuted, width: 22, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.txt }}>{player.name}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 800,
                      color: posColor(player.position),
                      background: `color-mix(in srgb, ${posColor(player.position)} 12%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${posColor(player.position)} 28%, transparent)`,
                      borderRadius: 5, padding: '2px 7px',
                    }}>
                      {player.position}
                    </span>
                    <div style={{ width: 90, height: 5, background: C.elevated, borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{
                        width: `${(player.salary / (topEarners[0]?.salary || 1)) * 100}%`,
                        height: '100%', background: C.gold, borderRadius: 3,
                      }} />
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: C.gold, minWidth: 64, textAlign: 'right' }}>
                      ${player.salary}M
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* HISTORY */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Impact, sans-serif', margin: '0 0 22px', color: C.txt, letterSpacing: '.04em' }}>
                FRANCHISE HISTORY
              </h2>
              {history.length === 0 ? (
                <div style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: '52px 24px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.txtSub }}>No seasons completed yet</div>
                  <div style={{ fontSize: 13, color: C.txtMuted, marginTop: 6 }}>Advance a season from the bottom bar to start building your legacy.</div>
                </div>
              ) : (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '80px 100px 1fr 1fr',
                    padding: '9px 18px', borderBottom: `1px solid ${C.border}`,
                    fontSize: 9, color: C.txtMuted, textTransform: 'uppercase',
                    letterSpacing: '.14em', fontWeight: 800,
                  }}>
                    <span>Year</span>
                    <span>Record</span>
                    <span>Playoff Result</span>
                    <span>Draft Capital</span>
                  </div>
                  {[...history].reverse().map((season, i) => {
                    const isChamp = season.playoffResult === 'CHAMPION';
                    const resultColor = isChamp ? C.gold
                      : season.playoffResult === 'SB_LOSS' ? C.amber
                      : season.playoffResult ? C.blueBright
                      : C.txtMuted;
                    return (
                      <div
                        key={season.year}
                        style={{
                          display: 'grid', gridTemplateColumns: '80px 100px 1fr 1fr',
                          padding: '13px 18px',
                          borderBottom: `1px solid ${C.border}`,
                          alignItems: 'center',
                          background: isChamp
                            ? `linear-gradient(90deg, ${C.gold}0F 0%, transparent 40%)`
                            : i % 2 === 0 ? 'transparent' : `${C.elevated}50`,
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.txt }}>{season.year}</span>
                        <span style={{
                          fontSize: 13, fontWeight: 700,
                          color: season.wins >= 10 ? C.green : season.wins < 6 ? C.red : C.txt,
                        }}>
                          {season.wins}–{season.losses}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {isChamp && <span style={{ fontSize: 14 }}>🏆</span>}
                          <span style={{ fontSize: 12, fontWeight: 700, color: resultColor }}>
                            {season.playoffResult
                              ? PLAYOFF_LABELS[season.playoffResult] ?? season.playoffResult
                              : 'Missed Playoffs'}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: C.txtSub }}>
                          {season.draftPicks.slice(0, 3).join(', ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* FREE AGENCY */}
          {activeTab === 'freeagency' && (
            <motion.div key="freeagency" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Impact, sans-serif', margin: 0, color: C.txt, letterSpacing: '.04em' }}>
                    FREE AGENCY
                  </h2>
                  <div style={{ fontSize: 12, color: C.txtSub, marginTop: 4 }}>
                    Available cap: <strong style={{ color: capColor }}>${capSpace}M</strong>
                  </div>
                </div>
              </div>

              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 56px 44px 110px 80px 62px 90px',
                  padding: '9px 18px', borderBottom: `1px solid ${C.border}`,
                  fontSize: 9, color: C.txtMuted, textTransform: 'uppercase',
                  letterSpacing: '.14em', fontWeight: 800,
                }}>
                  <span>Player</span>
                  <span>POS</span>
                  <span>Age</span>
                  <span>Rating</span>
                  <span>Ask</span>
                  <span>Yrs</span>
                  <span />
                </div>
                {freeAgents.map((player, i) => {
                  const canSign      = capSpace >= player.salary;
                  const alreadySigned = roster.some(r => r.id === player.id);
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 56px 44px 110px 80px 62px 90px',
                        padding: '11px 18px',
                        borderBottom: i < freeAgents.length - 1 ? `1px solid ${C.border}` : 'none',
                        alignItems: 'center',
                        background: i % 2 === 0 ? 'transparent' : `${C.elevated}50`,
                        opacity: alreadySigned ? 0.4 : 1,
                        transition: 'background 120ms',
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.txt }}>{player.name}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 800,
                        color: posColor(player.position),
                        background: `color-mix(in srgb, ${posColor(player.position)} 12%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${posColor(player.position)} 28%, transparent)`,
                        borderRadius: 5, padding: '2px 6px', width: 'fit-content',
                      }}>
                        {player.position}
                      </span>
                      <span style={{ fontSize: 12, color: C.txtSub }}>{player.age}</span>
                      <RatingBadge rating={player.rating} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: canSign ? C.gold : C.red }}>${player.salary}M</span>
                      <span style={{ fontSize: 12, color: C.txtSub }}>{player.yearsLeft}yr</span>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {alreadySigned ? (
                          <span style={{ fontSize: 10, color: C.green, fontWeight: 800, letterSpacing: '.06em' }}>SIGNED</span>
                        ) : (
                          <button
                            onClick={() => canSign && signPlayer(player)}
                            disabled={!canSign}
                            style={{
                              background: canSign ? C.greenSub : C.elevated,
                              border: `1px solid ${canSign ? C.green + '60' : C.border}`,
                              color: canSign ? C.green : C.txtMuted,
                              borderRadius: 6, padding: '4px 12px',
                              fontSize: 10, fontWeight: 800,
                              cursor: canSign ? 'pointer' : 'not-allowed',
                              letterSpacing: '.06em',
                              transition: 'all 140ms',
                            }}
                            onMouseEnter={e => {
                              if (canSign) (e.currentTarget as HTMLButtonElement).style.background = `${C.green}22`;
                            }}
                            onMouseLeave={e => {
                              if (canSign) (e.currentTarget as HTMLButtonElement).style.background = C.greenSub;
                            }}
                          >
                            SIGN
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{
        background: C.surface, borderTop: `1px solid ${C.border}`,
        padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
      }}>
        <div style={{ fontSize: 12, color: C.txtSub, fontWeight: 500 }}>
          Cap: <strong style={{ color: capColor }}>${usedCap}M / $255M</strong>
          {'  ·  '}
          Roster: <strong style={{ color: C.txt }}>{roster.length}</strong>
        </div>
        <div style={{ flex: 1 }} />
        <Btn variant="primary" size="sm" onClick={handleAdvanceYear}>
          ADVANCE TO {year + 1} SEASON →
        </Btn>
      </div>
    </div>
  );
}
