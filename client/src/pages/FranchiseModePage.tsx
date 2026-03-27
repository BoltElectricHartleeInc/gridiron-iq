import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFranchiseStore, type FranchisePlayer } from '../store/franchiseStore';
import { NFL_GAME_TEAMS } from '../game/teams';

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

type Tab = 'roster' | 'cap' | 'history' | 'freeagency';

const RANDOM_FIRST = ['Marcus', 'DeShawn', 'Malik', 'Jordan', 'Tyler', 'Antoine', 'Darius', 'Tre', 'Chris', 'Devon', 'Jamal', 'Kendrick', 'Isaiah', 'Lamar', 'Tyreek'];
const RANDOM_LAST = ['Williams', 'Johnson', 'Davis', 'Brown', 'Carter', 'Harris', 'Robinson', 'Thompson', 'Evans', 'King', 'Walker', 'Green', 'Moore', 'Jackson', 'White'];
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

const PLAYOFF_RESULTS = [
  'CHAMPION', 'SB_LOSS', 'CONF', 'DIV', 'WC', null, null, null,
];
const PLAYOFF_LABELS: Record<string, string> = {
  CHAMPION: '🏆 Champions',
  SB_LOSS: 'Super Bowl Loss',
  CONF: 'Conference Finals',
  DIV: 'Divisional Round',
  WC: 'Wild Card',
};

function RatingBar({ rating }: { rating: number }) {
  const color = rating >= 85 ? S.greenBright : rating >= 75 ? S.accent : rating >= 65 ? S.gold : S.red;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 60, height: 6, background: S.elevated, borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{
          width: `${rating}%`, height: '100%',
          background: color,
          borderRadius: 3,
          transition: 'width 0.4s',
        }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 24, textAlign: 'right' }}>{rating}</span>
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

  const capPct = Math.min(100, (usedCap / salaryCap) * 100);
  const capColor = capPct > 90 ? S.redBright : capPct > 75 ? S.gold : S.greenBright;
  const capSpace = Math.round((salaryCap - usedCap) * 10) / 10;

  const topEarners = [...roster].sort((a, b) => b.salary - a.salary).slice(0, 5);

  const handleAdvanceYear = () => {
    const wins = 8 + Math.floor(Math.random() * 3);
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
              FRANCHISE MODE
            </h1>
            <p style={{ color: S.txtSub, marginTop: 8, fontSize: 14 }}>
              Build a dynasty — manage your roster, cap, and legacy
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
                onClick={() => startFranchise(team.id, `${team.city} ${team.name}`)}
                style={{
                  background: hoveredTeam === team.id ? `${hexStr(team.primaryColor)}22` : S.surface,
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
                  <div style={{ fontSize: 11, fontWeight: 700, color: S.txt, textAlign: 'center' }}>{team.city}</div>
                  <div style={{ fontSize: 10, color: S.txtSub, textAlign: 'center' }}>{team.name}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Active franchise ─────────────────────────────────────────────────────
  const activeTeam = NFL_GAME_TEAMS.find(t => t.id === teamId)!;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'roster', label: 'ROSTER' },
    { id: 'cap', label: 'SALARY CAP' },
    { id: 'history', label: 'HISTORY' },
    { id: 'freeagency', label: 'FREE AGENCY' },
  ];

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
        gap: 14,
        flexShrink: 0,
      }}>
        <button
          onClick={() => { resetFranchise(); navigate('/game/select'); }}
          style={{ background: 'none', border: 'none', color: S.txtSub, cursor: 'pointer', fontSize: 13 }}
        >
          ← Back
        </button>
        <div style={{ width: 1, height: 20, background: S.border }} />
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: hexStr(activeTeam.primaryColor),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 900, color: hexStr(activeTeam.secondaryColor),
          fontFamily: 'Impact, sans-serif',
        }}>
          {activeTeam.abbreviation}
        </div>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{teamName}</span>
        <div style={{ flex: 1 }} />
        <div style={{
          background: `${S.gold}20`,
          border: `1px solid ${S.gold}60`,
          borderRadius: 8,
          padding: '4px 12px',
          fontSize: 12,
          fontWeight: 700,
          color: S.gold,
        }}>
          {year} SEASON
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        background: S.surface,
        borderBottom: `1px solid ${S.border}`,
        padding: '0 24px',
        display: 'flex',
        gap: 0,
        flexShrink: 0,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? S.accent : 'transparent'}`,
              color: activeTab === tab.id ? S.txt : S.txtSub,
              padding: '12px 20px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.08em',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <AnimatePresence mode="wait">
          {/* ROSTER TAB */}
          {activeTab === 'roster' && (
            <motion.div key="roster" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ marginBottom: 16, fontSize: 18, fontWeight: 900, fontFamily: 'Impact, sans-serif', letterSpacing: '0.05em' }}>
                ROSTER — {roster.length} PLAYERS
              </div>
              <div style={{
                background: S.surface,
                border: `1px solid ${S.border}`,
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 60px 50px 100px 80px 70px 80px',
                  padding: '8px 16px',
                  borderBottom: `1px solid ${S.border}`,
                  fontSize: 10,
                  color: S.txtMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                }}>
                  <span>Name</span>
                  <span>POS</span>
                  <span>AGE</span>
                  <span>Rating</span>
                  <span>Salary</span>
                  <span>Years</span>
                  <span></span>
                </div>
                {roster.map((player, i) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 60px 50px 100px 80px 70px 80px',
                      padding: '10px 16px',
                      borderBottom: `1px solid ${S.border}`,
                      alignItems: 'center',
                      background: i % 2 === 0 ? 'transparent' : `${S.elevated}60`,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: S.txt }}>{player.name}</span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: S.accent,
                      background: S.blueSub,
                      borderRadius: 4,
                      padding: '2px 6px',
                      width: 'fit-content',
                    }}>
                      {player.position}
                    </span>
                    <span style={{ fontSize: 12, color: S.txtSub }}>{player.age}</span>
                    <RatingBar rating={player.rating} />
                    <span style={{ fontSize: 12, color: S.gold }}>${player.salary}M</span>
                    <span style={{ fontSize: 12, color: player.yearsLeft <= 1 ? S.red : S.txtSub }}>
                      {player.yearsLeft}yr
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => releasePlayer(player.id)}
                        style={{
                          background: S.redSub,
                          border: `1px solid ${S.red}60`,
                          color: S.red,
                          borderRadius: 6,
                          padding: '3px 10px',
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: 'pointer',
                          letterSpacing: '0.05em',
                        }}
                      >
                        RELEASE
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* SALARY CAP TAB */}
          {activeTab === 'cap' && (
            <motion.div key="cap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ marginBottom: 24, fontSize: 18, fontWeight: 900, fontFamily: 'Impact, sans-serif', letterSpacing: '0.05em' }}>
                SALARY CAP
              </div>
              <div style={{
                background: S.surface,
                border: `1px solid ${S.border}`,
                borderRadius: 16,
                padding: 28,
                marginBottom: 24,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 11, color: S.txtMuted, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Cap Used / Total
                </div>
                <div style={{ fontSize: 48, fontWeight: 900, fontFamily: 'Impact, sans-serif', color: capColor, letterSpacing: '-0.02em' }}>
                  ${usedCap}M
                </div>
                <div style={{ fontSize: 18, color: S.txtSub, marginBottom: 20 }}>/ $255M</div>
                <div style={{ height: 16, background: S.elevated, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${capPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', background: `linear-gradient(90deg, ${capColor}99, ${capColor})`, borderRadius: 8 }}
                  />
                </div>
                <div style={{ fontSize: 14, color: capSpace > 20 ? S.greenBright : S.red }}>
                  {capSpace > 0 ? `$${capSpace}M available` : `$${Math.abs(capSpace)}M OVER CAP`}
                </div>
              </div>

              <div style={{ fontSize: 14, fontWeight: 700, color: S.txtSub, marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Top Earners
              </div>
              <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, overflow: 'hidden' }}>
                {topEarners.map((player, i) => (
                  <div key={player.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderBottom: i < topEarners.length - 1 ? `1px solid ${S.border}` : 'none',
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: S.txtMuted, width: 24 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: S.txt }}>{player.name}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: S.accent,
                      background: S.blueSub, borderRadius: 4, padding: '2px 6px',
                    }}>
                      {player.position}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: S.gold, minWidth: 60, textAlign: 'right' }}>
                      ${player.salary}M
                    </span>
                    <div style={{
                      width: 80, height: 6, background: S.elevated, borderRadius: 3, overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${(player.salary / topEarners[0].salary) * 100}%`,
                        height: '100%', background: S.gold, borderRadius: 3,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ marginBottom: 20, fontSize: 18, fontWeight: 900, fontFamily: 'Impact, sans-serif', letterSpacing: '0.05em' }}>
                FRANCHISE HISTORY
              </div>
              {history.length === 0 ? (
                <div style={{
                  background: S.surface,
                  border: `1px solid ${S.border}`,
                  borderRadius: 12,
                  padding: '40px 24px',
                  textAlign: 'center',
                  color: S.txtMuted,
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>📋</div>
                  <div>No seasons completed yet. Advance a season to start building your legacy.</div>
                </div>
              ) : (
                <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 1fr 1fr',
                    padding: '8px 16px',
                    borderBottom: `1px solid ${S.border}`,
                    fontSize: 10,
                    color: S.txtMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 700,
                  }}>
                    <span>Year</span>
                    <span>Record</span>
                    <span>Playoff Result</span>
                    <span>Draft Capital</span>
                  </div>
                  {[...history].reverse().map((season, i) => {
                    const isChamp = season.playoffResult === 'CHAMPION';
                    return (
                      <div key={season.year} style={{
                        display: 'grid',
                        gridTemplateColumns: '80px 1fr 1fr 1fr',
                        padding: '12px 16px',
                        borderBottom: `1px solid ${S.border}`,
                        alignItems: 'center',
                        background: isChamp ? `${S.gold}12` : i % 2 === 0 ? 'transparent' : `${S.elevated}60`,
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: S.txt }}>{season.year}</span>
                        <span style={{ fontSize: 13, color: S.txt }}>
                          {season.wins}-{season.losses}
                        </span>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: isChamp ? S.gold : season.playoffResult ? S.accent : S.txtMuted,
                        }}>
                          {season.playoffResult
                            ? PLAYOFF_LABELS[season.playoffResult] ?? season.playoffResult
                            : 'Missed Playoffs'}
                        </span>
                        <span style={{ fontSize: 11, color: S.txtSub }}>
                          {season.draftPicks.slice(0, 3).join(', ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* FREE AGENCY TAB */}
          {activeTab === 'freeagency' && (
            <motion.div key="freeagency" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ marginBottom: 8, fontSize: 18, fontWeight: 900, fontFamily: 'Impact, sans-serif', letterSpacing: '0.05em' }}>
                FREE AGENCY
              </div>
              <div style={{ fontSize: 12, color: S.txtSub, marginBottom: 20 }}>
                Cap space available: <strong style={{ color: capColor }}>${capSpace}M</strong>
              </div>
              <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 60px 50px 100px 80px 70px 90px',
                  padding: '8px 16px',
                  borderBottom: `1px solid ${S.border}`,
                  fontSize: 10,
                  color: S.txtMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                }}>
                  <span>Player</span>
                  <span>POS</span>
                  <span>AGE</span>
                  <span>Rating</span>
                  <span>Ask</span>
                  <span>Years</span>
                  <span></span>
                </div>
                {freeAgents.map((player, i) => {
                  const canSign = capSpace >= player.salary;
                  const alreadySigned = roster.some(r => r.id === player.id);
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 60px 50px 100px 80px 70px 90px',
                        padding: '10px 16px',
                        borderBottom: i < freeAgents.length - 1 ? `1px solid ${S.border}` : 'none',
                        alignItems: 'center',
                        background: i % 2 === 0 ? 'transparent' : `${S.elevated}60`,
                        opacity: alreadySigned ? 0.4 : 1,
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: S.txt }}>{player.name}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: S.accent,
                        background: S.blueSub, borderRadius: 4, padding: '2px 6px', width: 'fit-content',
                      }}>
                        {player.position}
                      </span>
                      <span style={{ fontSize: 12, color: S.txtSub }}>{player.age}</span>
                      <RatingBar rating={player.rating} />
                      <span style={{ fontSize: 12, color: canSign ? S.gold : S.red }}>${player.salary}M</span>
                      <span style={{ fontSize: 12, color: S.txtSub }}>{player.yearsLeft}yr</span>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {alreadySigned ? (
                          <span style={{ fontSize: 10, color: S.greenBright, fontWeight: 700 }}>SIGNED</span>
                        ) : (
                          <button
                            onClick={() => canSign && signPlayer(player)}
                            disabled={!canSign}
                            style={{
                              background: canSign ? S.greenSub : S.elevated,
                              border: `1px solid ${canSign ? S.green + '80' : S.border}`,
                              color: canSign ? S.greenBright : S.txtMuted,
                              borderRadius: 6,
                              padding: '3px 10px',
                              fontSize: 10,
                              fontWeight: 700,
                              cursor: canSign ? 'pointer' : 'not-allowed',
                              letterSpacing: '0.05em',
                              transition: 'all 0.15s',
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

      {/* Bottom bar */}
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
          Cap: <strong style={{ color: capColor }}>${usedCap}M / $255M</strong>
          {' '}· Roster: <strong style={{ color: S.txt }}>{roster.length}</strong>
        </div>
        <div style={{ flex: 1 }} />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAdvanceYear}
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
          ADVANCE TO {year + 1} SEASON →
        </motion.button>
      </div>
    </div>
  );
}
