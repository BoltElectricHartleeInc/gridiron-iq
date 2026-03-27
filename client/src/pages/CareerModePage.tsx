import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCareerStore, CareerPosition, CareerStage, CareerPlayer } from '../store/careerStore';
import { NCAA_GAME_TEAMS, NFL_GAME_TEAMS } from '../game/teams';

// ─── Theme ────────────────────────────────────────────────────────────────────
const BG = '#050508';
const SURFACE = '#0a0a14';
const BORDER = 'rgba(255,255,255,0.06)';
const GREEN = '#00ff87';
const RED = '#ff4757';
const GOLD = '#ffd700';
const BLUE = '#4fc3f7';
const PURPLE = '#9c88ff';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hexToRgb(hex: number): string {
  const r = (hex >> 16) & 0xff;
  const g = (hex >> 8) & 0xff;
  const b = hex & 0xff;
  return `rgb(${r},${g},${b})`;
}

function stageLabel(stage: CareerStage): string {
  const map: Record<CareerStage, string> = {
    highschool: 'HIGH SCHOOL',
    college_freshman: 'FRESHMAN',
    college_sophomore: 'SOPHOMORE',
    college_junior: 'JUNIOR',
    college_senior: 'SENIOR',
    nfl_draft: 'NFL DRAFT',
    nfl_rookie: 'NFL ROOKIE',
    nfl_year2: 'NFL YEAR 2',
    nfl_year3plus: 'NFL VETERAN',
    retired: 'RETIRED',
  };
  return map[stage] ?? stage;
}

function stageBadgeColor(stage: CareerStage): string {
  if (stage.startsWith('nfl')) return GREEN;
  if (stage === 'nfl_draft') return GOLD;
  if (stage === 'highschool') return PURPLE;
  return BLUE;
}

function ovrColor(ovr: number): string {
  if (ovr >= 90) return GREEN;
  if (ovr >= 80) return BLUE;
  if (ovr >= 70) return GOLD;
  if (ovr >= 60) return 'rgba(255,255,255,0.7)';
  return RED;
}

// ─── Position config ──────────────────────────────────────────────────────────
interface PositionInfo {
  key: CareerPosition;
  label: string;
  icon: string;
  desc: string;
  statKeys: string[];
}

const POSITIONS: PositionInfo[] = [
  {
    key: 'QB', label: 'Quarterback', icon: '🏈',
    desc: 'Field general. Reading the defense, making big throws.',
    statKeys: ['passingYards', 'touchdowns', 'interceptions', 'completions', 'attempts'],
  },
  {
    key: 'RB', label: 'Running Back', icon: '💨',
    desc: 'Between the tackles or catching in the flat. Durability king.',
    statKeys: ['rushingYards', 'touchdowns', 'yardsPerCarry', 'receptions'],
  },
  {
    key: 'WR', label: 'Wide Receiver', icon: '⚡',
    desc: 'Vertical threat, route runner, clutch target in traffic.',
    statKeys: ['receivingYards', 'touchdowns', 'receptions', 'yardsPerCatch', 'targets'],
  },
  {
    key: 'CB', label: 'Cornerback', icon: '🛡️',
    desc: 'Lock down corners against the best receivers in the game.',
    statKeys: ['tackles', 'interceptions', 'pbus', 'coverageGrade'],
  },
  {
    key: 'DE', label: 'Defensive End', icon: '💥',
    desc: 'Get to the QB. Dominate the edge. Change the game.',
    statKeys: ['sacks', 'tfls', 'pressures', 'passRushWinRate'],
  },
  {
    key: 'LB', label: 'Linebacker', icon: '🔥',
    desc: 'Sideline to sideline. Stop the run, cover the TE.',
    statKeys: ['tackles', 'tfls', 'sacks', 'coverageSnaps'],
  },
];

const STAT_LABELS: Record<string, string> = {
  passingYards: 'Pass Yds',
  touchdowns: 'TDs',
  interceptions: 'INTs',
  completions: 'Completions',
  attempts: 'Attempts',
  rushingYards: 'Rush Yds',
  yardsPerCarry: 'Yds/Carry',
  receptions: 'Rec',
  receivingYards: 'Rec Yds',
  yardsPerCatch: 'Yds/Catch',
  targets: 'Targets',
  tackles: 'Tackles',
  pbus: 'PBUs',
  coverageGrade: 'Cov Grade',
  sacks: 'Sacks',
  tfls: 'TFLs',
  pressures: 'Pressures',
  passRushWinRate: 'PR Win%',
  coverageSnaps: 'Cov Snaps',
};

// ─── HS Star options ──────────────────────────────────────────────────────────
const HS_STARS = [
  { stars: 5 as 5, label: '5-Star Recruit', ovr: 82, desc: 'Top recruit in the nation. All-American on Day 1.' },
  { stars: 4 as 4, label: '4-Star Recruit', ovr: 75, desc: 'Elite prospect. High major offer from start.' },
  { stars: 3 as 3, label: '3-Star Recruit', ovr: 68, desc: 'Solid prospect. Room to prove doubters wrong.' },
  { stars: 2 as 2, label: '2-Star Recruit', ovr: 60, desc: 'Under the radar. Chip on shoulder mentality.' },
  { stars: 1 as 1, label: 'Walk-On', ovr: 54, desc: 'No scholarship. The ultimate underdog story.' },
];

// ─── Attribute keys per position ──────────────────────────────────────────────
function getAttributeKeys(pos: CareerPosition): string[] {
  const base = ['speed', 'strength', 'agility', 'awareness'];
  const extras: Record<CareerPosition, string[]> = {
    QB: ['throwing'],
    RB: ['catching'],
    WR: ['catching'],
    CB: ['coverage', 'tackle'],
    DE: ['passRush', 'tackle'],
    LB: ['tackle'],
  };
  return [...base, ...(extras[pos] ?? [])];
}

// ─── Attribute display name ────────────────────────────────────────────────────
const ATTR_LABEL: Record<string, string> = {
  speed: 'Speed', strength: 'Strength', agility: 'Agility',
  awareness: 'Awareness', throwing: 'Throwing', catching: 'Catching',
  coverage: 'Coverage', passRush: 'Pass Rush', tackle: 'Tackle',
};

// ─── Draft projections ────────────────────────────────────────────────────────
function draftProjection(ovr: number): { pick: string; round: string } {
  if (ovr >= 92) return { pick: '1-5', round: 'Round 1' };
  if (ovr >= 87) return { pick: '6-32', round: 'Round 1' };
  if (ovr >= 82) return { pick: '33-64', round: 'Round 2' };
  if (ovr >= 77) return { pick: '65-100', round: 'Round 3' };
  if (ovr >= 72) return { pick: '101-150', round: 'Rounds 4-5' };
  if (ovr >= 65) return { pick: '151-220', round: 'Rounds 6-7' };
  return { pick: 'UDFA', round: 'Undrafted' };
}

function legacyPercentile(score: number): number {
  return Math.min(99, Math.round((score / 1000) * 100));
}

// ─── Simulated game stats ─────────────────────────────────────────────────────
function simGameStats(pos: CareerPosition, ovr: number): Record<string, number> {
  const rand = () => Math.random();
  const q = ovr / 99;

  switch (pos) {
    case 'QB':
      return {
        passingYards: Math.round(180 + rand() * 160 * q + 40),
        touchdowns: Math.round(rand() * 4 * q),
        interceptions: Math.round(rand() * 2 * (1 - q * 0.5)),
        completions: Math.round(15 + rand() * 15 * q),
        attempts: Math.round(28 + rand() * 10),
      };
    case 'RB':
      return {
        rushingYards: Math.round(40 + rand() * 120 * q),
        touchdowns: Math.round(rand() * 2),
        yardsPerCarry: parseFloat((3.5 + rand() * 3 * q).toFixed(1)),
        receptions: Math.round(rand() * 5),
      };
    case 'WR':
      return {
        receivingYards: Math.round(30 + rand() * 100 * q),
        touchdowns: Math.round(rand() * 2 * q),
        receptions: Math.round(3 + rand() * 8 * q),
        yardsPerCatch: parseFloat((8 + rand() * 8).toFixed(1)),
        targets: Math.round(5 + rand() * 8),
      };
    case 'CB':
      return {
        tackles: Math.round(3 + rand() * 8),
        interceptions: Math.round(rand() < 0.15 * q ? 1 : 0),
        pbus: Math.round(rand() * 3 * q),
        coverageGrade: Math.round(55 + rand() * 40 * q),
      };
    case 'DE':
      return {
        sacks: parseFloat((rand() * 2 * q).toFixed(1)),
        tfls: Math.round(rand() * 3 * q),
        pressures: Math.round(2 + rand() * 5 * q),
        passRushWinRate: Math.round(30 + rand() * 50 * q),
      };
    case 'LB':
      return {
        tackles: Math.round(4 + rand() * 10),
        tfls: Math.round(rand() * 3 * q),
        sacks: parseFloat((rand() * q).toFixed(1)),
        coverageSnaps: Math.round(10 + rand() * 20),
      };
  }
}

// ─── Attribute spend modal ────────────────────────────────────────────────────
function AttributeModal({
  player,
  onClose,
}: {
  player: CareerPlayer;
  onClose: () => void;
}) {
  const { spendAttributePoint } = useCareerStore();
  const attrs = getAttributeKeys(player.position);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 24,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: SURFACE, border: `1px solid ${BORDER}`,
          borderRadius: 16, padding: 28, maxWidth: 480, width: '100%',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Spend Attribute Points</div>
            <div style={{ fontSize: 13, color: GREEN, marginTop: 2 }}>{player.attributePoints} points available</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {attrs.map(attr => {
            const val = (player as unknown as Record<string, number>)[attr] ?? 0;
            const boost = val < 70 ? 3 : val < 85 ? 2 : 1;
            const disabled = player.attributePoints <= 0 || val >= 99;
            return (
              <div key={attr} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${BORDER}`, borderRadius: 10,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{ATTR_LABEL[attr]}</div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      width: `${val}%`,
                      background: ovrColor(val),
                    }} />
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 18, width: 36, textAlign: 'center', color: ovrColor(val) }}>
                  {val}
                </div>
                <button
                  onClick={() => { spendAttributePoint(attr); }}
                  disabled={disabled}
                  style={{
                    padding: '6px 14px',
                    background: disabled ? 'rgba(255,255,255,0.04)' : GREEN,
                    color: disabled ? 'rgba(255,255,255,0.2)' : '#000',
                    border: `1px solid ${disabled ? BORDER : GREEN}`,
                    borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
                    fontWeight: 700, fontSize: 13,
                  }}
                >
                  +{boost}
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Draft Night Modal ────────────────────────────────────────────────────────
function DraftNightModal({
  player,
  onClose,
}: {
  player: CareerPlayer;
  onClose: () => void;
}) {
  const { enterNFLDraft } = useCareerStore();
  const [phase, setPhase] = useState<'commissioner' | 'team' | 'reveal' | 'done'>('commissioner');
  const [selectedTeam] = useState(() => {
    const nflTeams = NFL_GAME_TEAMS;
    return nflTeams[Math.floor(Math.random() * nflTeams.length)];
  });
  const proj = draftProjection(player.overallRating);
  const pickNum = proj.pick === 'UDFA' ? 253 : parseInt(proj.pick.split('-')[0]) + Math.floor(Math.random() * 10);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('team'), 2500),
      setTimeout(() => setPhase('reveal'), 5000),
      setTimeout(() => setPhase('done'), 7500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase === 'done') {
      enterNFLDraft(pickNum, selectedTeam.id, `${selectedTeam.city} ${selectedTeam.name}`);
    }
  }, [phase]);

  const teamColor = hexToRgb(selectedTeam.primaryColor);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        flexDirection: 'column', gap: 0,
        backgroundImage: 'radial-gradient(ellipse at 50% 20%, rgba(255,215,0,0.08) 0%, transparent 60%)',
      }}
    >
      <AnimatePresence mode="wait">
        {phase === 'commissioner' && (
          <motion.div
            key="comm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ textAlign: 'center', padding: 40 }}
          >
            <div style={{ fontSize: 48, marginBottom: 20 }}>🎩</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: GOLD }}>The Commissioner approaches the podium...</div>
            <div style={{ marginTop: 16, color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>
              2026 NFL Draft — Round {proj.round.split(' ')[1] ?? '1'}
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              transition={{ duration: 2.5 }}
              style={{ height: 2, background: GOLD, margin: '24px auto 0', borderRadius: 2 }}
            />
          </motion.div>
        )}

        {phase === 'team' && (
          <motion.div
            key="team"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            style={{ textAlign: 'center', padding: 40 }}
          >
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', letterSpacing: 4, marginBottom: 20 }}>
              WITH THE {pickNum}th PICK IN THE 2026 NFL DRAFT...
            </div>
            <div style={{
              width: 120, height: 120, borderRadius: 20, margin: '0 auto 20px',
              background: teamColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, fontWeight: 900, color: 'white',
              boxShadow: `0 0 60px ${teamColor}60`,
            }}>
              {selectedTeam.abbreviation}
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: 'white' }}>
              THE {selectedTeam.city.toUpperCase()} {selectedTeam.name.toUpperCase()}
            </div>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>{selectedTeam.conference}</div>
          </motion.div>
        )}

        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: 40 }}
          >
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: 4, marginBottom: 16 }}>
              SELECTS...
            </div>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              style={{
                fontSize: 52, fontWeight: 900,
                background: `linear-gradient(135deg, ${GOLD}, white)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: 12,
              }}
            >
              {player.name}
            </motion.div>
            <div style={{
              display: 'inline-block', padding: '8px 20px', borderRadius: 20,
              background: `${teamColor}20`,
              border: `2px solid ${teamColor}`,
              color: 'white', fontWeight: 700, fontSize: 20, marginBottom: 20,
            }}>
              {player.position}
            </div>
            {/* Confetti burst */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              {['🎉', '🏈', '⭐', '🎊', '🏆', '⚡', '🔥'].map((e, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  style={{ fontSize: 28 }}
                >
                  {e}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: 40, maxWidth: 500 }}
          >
            <div style={{ fontSize: 14, color: GOLD, letterSpacing: 3, marginBottom: 12 }}>
              YOUR NFL CAREER BEGINS
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
              #{pickNum} Overall Pick
            </div>
            <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>
              {selectedTeam.city} {selectedTeam.name} — {proj.round}
            </div>

            <div style={{
              display: 'inline-block', padding: '10px 24px', borderRadius: 12,
              background: 'rgba(0,255,135,0.1)', border: `1px solid ${GREEN}30`,
              color: GREEN, fontWeight: 700, fontSize: 16, marginBottom: 24,
            }}>
              +3 Attribute Points Earned
            </div>

            <button onClick={onClose} style={{
              display: 'block', width: '100%',
              padding: '16px 0',
              background: GREEN, color: '#000',
              border: 'none', borderRadius: 12,
              fontWeight: 800, fontSize: 16, cursor: 'pointer', letterSpacing: 1,
            }}>
              START NFL CAREER
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Player Creation Form ─────────────────────────────────────────────────────
function CreatePlayerForm() {
  const { createPlayer } = useCareerStore();
  const [name, setName] = useState('');
  const [position, setPosition] = useState<CareerPosition>('QB');
  const [stars, setStars] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [collegeId, setCollegeId] = useState('');
  const [step, setStep] = useState<'pos' | 'recruit' | 'college' | 'name'>('pos');

  const colleges = NCAA_GAME_TEAMS.slice(0, 32); // Show top 32 colleges

  const selectedCollege = colleges.find(c => c.id === collegeId);
  const selectedPos = POSITIONS.find(p => p.key === position)!;
  const selectedStars = HS_STARS.find(s => s.stars === stars)!;

  const canCreate = name.trim() && collegeId;

  const handleCreate = () => {
    if (!canCreate) return;
    createPlayer(name.trim(), position, stars, collegeId, selectedCollege?.city ?? 'Unknown');
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          🏈 Road to Glory
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>
          Build your player from high school to the NFL Hall of Fame.
        </div>
      </div>

      {/* Step: Position */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 14 }}>
          1. CHOOSE YOUR POSITION
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {POSITIONS.map(pos => (
            <motion.button
              key={pos.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPosition(pos.key)}
              style={{
                padding: '16px 12px',
                background: position === pos.key ? 'rgba(0,255,135,0.1)' : SURFACE,
                border: `2px solid ${position === pos.key ? GREEN : BORDER}`,
                borderRadius: 12, cursor: 'pointer', color: 'white',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{pos.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{pos.key}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{pos.label}</div>
            </motion.button>
          ))}
        </div>
        {position && (
          <div style={{
            marginTop: 10, padding: '10px 14px',
            background: SURFACE, borderRadius: 10, border: `1px solid ${BORDER}`,
            fontSize: 13, color: 'rgba(255,255,255,0.6)',
          }}>
            {selectedPos.desc}
          </div>
        )}
      </div>

      {/* Step: Recruit Stars */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 14 }}>
          2. RECRUITMENT CLASS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {HS_STARS.map(opt => (
            <motion.button
              key={opt.stars}
              whileHover={{ x: 4 }}
              onClick={() => setStars(opt.stars)}
              style={{
                padding: '14px 18px',
                background: stars === opt.stars ? 'rgba(255,215,0,0.08)' : SURFACE,
                border: `1px solid ${stars === opt.stars ? GOLD : BORDER}`,
                borderRadius: 10, cursor: 'pointer', color: 'white',
                display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              <div style={{ fontSize: 22, minWidth: 100, textAlign: 'left' }}>
                {'⭐'.repeat(opt.stars)}
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: 700 }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{opt.desc}</div>
              </div>
              <div style={{
                fontSize: 20, fontWeight: 900,
                color: ovrColor(opt.ovr),
                minWidth: 60, textAlign: 'right',
              }}>
                {opt.ovr} OVR
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Step: College */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 14 }}>
          3. CHOOSE YOUR COLLEGE
        </div>
        <div style={{
          maxHeight: 220, overflowY: 'auto',
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8,
        }}>
          {colleges.map(c => (
            <button
              key={c.id}
              onClick={() => setCollegeId(c.id)}
              style={{
                padding: '10px 14px',
                background: collegeId === c.id ? `rgba(${hexToRgb(c.primaryColor).replace('rgb(', '').replace(')', '')},0.15)` : SURFACE,
                border: `1px solid ${collegeId === c.id ? hexToRgb(c.primaryColor) : BORDER}`,
                borderRadius: 10, cursor: 'pointer', color: 'white',
                textAlign: 'left', fontSize: 13,
              }}
            >
              <div style={{ fontWeight: 600 }}>{c.city}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{c.conference}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step: Name */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 14 }}>
          4. YOUR NAME
        </div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter player name..."
          style={{
            width: '100%', padding: '14px 18px',
            background: SURFACE, border: `1px solid ${BORDER}`,
            borderRadius: 10, color: 'white', fontSize: 16,
            outline: 'none', boxSizing: 'border-box',
            fontFamily: 'system-ui, sans-serif',
          }}
        />
      </div>

      {/* Preview */}
      {canCreate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(0,255,135,0.05)', border: `1px solid ${GREEN}25`,
            borderRadius: 12, padding: '14px 18px', marginBottom: 20,
            display: 'flex', gap: 16, alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 32 }}>{selectedPos.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{name}</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
              {position} • {selectedStars.label} • {selectedCollege?.city}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 28, fontWeight: 900, color: ovrColor(selectedStars.ovr) }}>
            {selectedStars.ovr} OVR
          </div>
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: canCreate ? 1.02 : 1 }}
        whileTap={{ scale: canCreate ? 0.98 : 1 }}
        onClick={handleCreate}
        disabled={!canCreate}
        style={{
          width: '100%', padding: '16px 0',
          background: canCreate ? GREEN : 'rgba(255,255,255,0.06)',
          color: canCreate ? '#000' : 'rgba(255,255,255,0.2)',
          border: `1px solid ${canCreate ? GREEN : BORDER}`,
          borderRadius: 12, fontWeight: 800, fontSize: 17,
          cursor: canCreate ? 'pointer' : 'not-allowed', letterSpacing: 1,
        }}
      >
        CREATE PLAYER
      </motion.button>
    </div>
  );
}

// ─── Career Hub ────────────────────────────────────────────────────────────────
function CareerHub({ player }: { player: CareerPlayer }) {
  const { recordGamePerformance, advanceSeason, addAward, resetCareer } = useCareerStore();
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [showDraftNight, setShowDraftNight] = useState(false);
  const [simResult, setSimResult] = useState<null | { stats: Record<string, number>; won: boolean; xp: number }>(null);

  const posInfo = POSITIONS.find(p => p.key === player.position)!;
  const proj = draftProjection(player.overallRating);
  const legacy = legacyPercentile(player.legacyScore);
  const attrKeys = getAttributeKeys(player.position);

  const isCollege = ['college_freshman', 'college_sophomore', 'college_junior', 'college_senior'].includes(player.stage);
  const isNFL = ['nfl_rookie', 'nfl_year2', 'nfl_year3plus'].includes(player.stage);
  const canDeclare = ['college_junior', 'college_senior'].includes(player.stage);

  const simGame = () => {
    const stats = simGameStats(player.position, player.overallRating);
    const won = Math.random() > 0.45;
    recordGamePerformance(stats, won);
    const baseXP = won ? 40 : 20;
    setSimResult({ stats, won, xp: baseXP + 30 });
  };

  const xpPct = Math.round((player.experiencePoints / player.nextLevelXP) * 100);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px' }}>
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #0d0d20, #080814)',
          border: `1px solid ${BORDER}`,
          borderRadius: 16, padding: '24px 28px',
          marginBottom: 24,
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: `${stageBadgeColor(player.stage)}15`,
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* OVR ring */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width={80} height={80} viewBox="0 0 80 80">
              <circle cx={40} cy={40} r={35} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
              <circle
                cx={40} cy={40} r={35} fill="none"
                stroke={ovrColor(player.overallRating)}
                strokeWidth={6}
                strokeDasharray={`${2 * Math.PI * 35 * player.overallRating / 99} ${2 * Math.PI * 35}`}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
              />
              <text x={40} y={38} textAnchor="middle" fill="white" fontSize={20} fontWeight="900">{player.overallRating}</text>
              <text x={40} y={53} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={10}>OVR</text>
            </svg>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>{player.name}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{
                padding: '3px 12px', borderRadius: 20,
                background: 'rgba(255,255,255,0.08)',
                fontWeight: 700, fontSize: 13,
              }}>{player.position}</span>
              <span style={{
                padding: '3px 12px', borderRadius: 20,
                background: `${stageBadgeColor(player.stage)}20`,
                color: stageBadgeColor(player.stage),
                border: `1px solid ${stageBadgeColor(player.stage)}30`,
                fontWeight: 700, fontSize: 13,
              }}>{stageLabel(player.stage)}</span>
              <span style={{ padding: '3px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                Age {player.age}
              </span>
              {player.nflTeamName && (
                <span style={{ padding: '3px 12px', borderRadius: 20, background: 'rgba(0,255,135,0.1)', color: GREEN, fontSize: 13, fontWeight: 700 }}>
                  {player.nflTeamName}
                </span>
              )}
              {!player.nflTeamName && (
                <span style={{ padding: '3px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  {player.collegeName}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(isCollege || isNFL) && (
              <button onClick={simGame} style={{
                padding: '10px 20px',
                background: GREEN, color: '#000',
                border: 'none', borderRadius: 10,
                fontWeight: 700, cursor: 'pointer', fontSize: 14,
              }}>
                SIM GAME
              </button>
            )}
            {(isCollege || isNFL) && (
              <button onClick={() => { advanceSeason(); setSimResult(null); }} style={{
                padding: '10px 20px',
                background: SURFACE, color: 'white',
                border: `1px solid ${BORDER}`, borderRadius: 10,
                fontWeight: 600, cursor: 'pointer', fontSize: 14,
              }}>
                ADVANCE SEASON
              </button>
            )}
            {canDeclare && !isNFL && (
              <button onClick={() => setShowDraftNight(true)} style={{
                padding: '10px 20px',
                background: GOLD, color: '#000',
                border: 'none', borderRadius: 10,
                fontWeight: 700, cursor: 'pointer', fontSize: 14,
              }}>
                DECLARE FOR NFL DRAFT
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Sim result toast */}
      <AnimatePresence>
        {simResult && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            style={{
              background: simResult.won ? 'rgba(0,255,135,0.1)' : 'rgba(255,71,87,0.1)',
              border: `1px solid ${simResult.won ? GREEN : RED}30`,
              borderRadius: 12, padding: '14px 20px', marginBottom: 20,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: simResult.won ? GREEN : RED }}>
                {simResult.won ? '🏆 TEAM WIN' : '💔 TEAM LOSS'} — +{simResult.xp} XP
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {Object.entries(simResult.stats).slice(0, 4).map(([k, v]) => (
                  <span key={k}>{STAT_LABELS[k] ?? k}: <strong style={{ color: 'white' }}>{v}</strong></span>
                ))}
              </div>
            </div>
            <button onClick={() => setSimResult(null)} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 18, cursor: 'pointer',
            }}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Season Stats */}
        <div style={{ background: SURFACE, borderRadius: 14, padding: 20, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>
            SEASON STATS
          </div>
          {posInfo.statKeys.map(key => {
            const val = player.seasonStats[key] ?? 0;
            return (
              <div key={key} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '7px 0', borderBottom: `1px solid ${BORDER}`,
                fontSize: 14,
              }}>
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>{STAT_LABELS[key] ?? key}</span>
                <span style={{ fontWeight: 700 }}>{val}</span>
              </div>
            );
          })}
          <div style={{ marginTop: 14, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>2026 Season</div>
        </div>

        {/* Career Stats */}
        <div style={{ background: SURFACE, borderRadius: 14, padding: 20, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>
            CAREER STATS
          </div>
          {posInfo.statKeys.map(key => {
            const val = player.careerStats[key] ?? 0;
            return (
              <div key={key} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '7px 0', borderBottom: `1px solid ${BORDER}`,
                fontSize: 14,
              }}>
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>{STAT_LABELS[key] ?? key}</span>
                <span style={{ fontWeight: 700 }}>{val}</span>
              </div>
            );
          })}
          <div style={{ marginTop: 14, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>All-time</div>
        </div>

        {/* Progression Panel */}
        <div style={{ background: SURFACE, borderRadius: 14, padding: 20, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>
            PROGRESSION
          </div>

          {/* XP bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Experience Points</span>
              <span style={{ color: GOLD }}>{player.experiencePoints}/{player.nextLevelXP} XP</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${xpPct}%` }}
                style={{ height: '100%', background: GOLD, borderRadius: 4 }}
              />
            </div>
          </div>

          {/* Attribute bars */}
          {attrKeys.map(attr => {
            const val = (player as unknown as Record<string, number>)[attr] ?? 0;
            return (
              <div key={attr} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{ATTR_LABEL[attr]}</span>
                  <span style={{ fontWeight: 700, color: ovrColor(val) }}>{val}</span>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${val}%`, background: ovrColor(val), borderRadius: 3, transition: 'width 0.5s' }} />
                </div>
              </div>
            );
          })}

          {player.attributePoints > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowAttributeModal(true)}
              style={{
                marginTop: 14, width: '100%', padding: '10px 0',
                background: 'rgba(0,255,135,0.1)', color: GREEN,
                border: `1px solid ${GREEN}30`, borderRadius: 8,
                fontWeight: 700, cursor: 'pointer', fontSize: 14,
              }}
            >
              SPEND {player.attributePoints} ATTRIBUTE POINT{player.attributePoints > 1 ? 'S' : ''}
            </motion.button>
          )}
        </div>

        {/* Awards & Legacy */}
        <div style={{ background: SURFACE, borderRadius: 14, padding: 20, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>
            AWARDS & LEGACY
          </div>

          {/* Awards */}
          {player.awards.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {player.awards.map(award => (
                <span key={award} style={{
                  padding: '4px 12px', borderRadius: 20,
                  background: 'rgba(255,215,0,0.1)',
                  border: '1px solid rgba(255,215,0,0.2)',
                  color: GOLD, fontSize: 12, fontWeight: 600,
                }}>
                  🏆 {award}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 16 }}>
              No awards yet — keep playing
            </div>
          )}

          {/* Legacy score */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Legacy Score</span>
              <span style={{ fontWeight: 700, color: PURPLE }}>{Math.round(player.legacyScore)}/1000</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${(player.legacyScore / 1000) * 100}%` }}
                style={{ height: '100%', background: PURPLE, borderRadius: 4 }}
              />
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              Better than {legacy}% of players at your stage
            </div>
          </div>

          {/* Draft stock (show in college junior/senior) */}
          {canDeclare && (
            <div style={{
              background: 'rgba(255,215,0,0.05)',
              border: '1px solid rgba(255,215,0,0.15)',
              borderRadius: 10, padding: '12px 14px',
            }}>
              <div style={{ fontSize: 12, color: GOLD, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>MOCK DRAFT PROJECTION</div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>Pick {proj.pick}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{proj.round}</div>
            </div>
          )}

          {/* NFL team (if drafted) */}
          {player.draftPickNumber && (
            <div style={{
              background: 'rgba(0,255,135,0.05)',
              border: `1px solid ${GREEN}20`,
              borderRadius: 10, padding: '12px 14px', marginTop: 12,
            }}>
              <div style={{ fontSize: 12, color: GREEN, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>DRAFTED</div>
              <div style={{ fontWeight: 700 }}>#{player.draftPickNumber} Overall — {player.draftYear}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{player.nflTeamName}</div>
            </div>
          )}
        </div>
      </div>

      {/* Reset */}
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <button onClick={() => { if (confirm('Reset your career? This cannot be undone.')) resetCareer(); }} style={{
          background: 'none', border: `1px solid rgba(255,71,87,0.3)`,
          color: 'rgba(255,71,87,0.6)', borderRadius: 8,
          padding: '8px 20px', cursor: 'pointer', fontSize: 13,
        }}>
          Reset Career
        </button>
      </div>

      <AnimatePresence>
        {showAttributeModal && (
          <AttributeModal player={player} onClose={() => setShowAttributeModal(false)} />
        )}
        {showDraftNight && (
          <DraftNightModal player={player} onClose={() => setShowDraftNight(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CareerModePage() {
  const navigate = useNavigate();
  const { player } = useCareerStore();

  return (
    <div style={{ background: BG, minHeight: '100vh', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      {/* Top nav */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 24px',
        borderBottom: `1px solid ${BORDER}`,
        background: SURFACE,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={() => navigate('/')} style={{
          background: 'none', border: `1px solid ${BORDER}`,
          color: 'rgba(255,255,255,0.6)', borderRadius: 8,
          padding: '6px 14px', cursor: 'pointer', fontSize: 14,
        }}>
          ← Back
        </button>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 2 }}>
          ROAD TO <span style={{ color: GREEN }}>GLORY</span>
        </div>
        {player && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{player.name}</span>
            <span style={{ color: GREEN, fontWeight: 700 }}>{player.overallRating} OVR</span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!player ? (
          <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CreatePlayerForm />
          </motion.div>
        ) : (
          <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CareerHub player={player} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
