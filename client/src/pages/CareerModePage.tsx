import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCareerStore, CareerPosition, CareerStage, CareerPlayer } from '../store/careerStore';
import { NCAA_GAME_TEAMS, NFL_GAME_TEAMS } from '../game/teams';
import { AppShell, C, Badge, Btn, SectionHead, DataRow } from '../components/AppShell';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hexToRgb(hex: number): string {
  const r = (hex >> 16) & 0xff;
  const g = (hex >> 8) & 0xff;
  const b = hex & 0xff;
  return `rgb(${r},${g},${b})`;
}

function stageLabel(stage: CareerStage): string {
  const map: Record<CareerStage, string> = {
    highschool:        'HIGH SCHOOL',
    college_freshman:  'FRESHMAN',
    college_sophomore: 'SOPHOMORE',
    college_junior:    'JUNIOR',
    college_senior:    'SENIOR',
    nfl_draft:         'NFL DRAFT',
    nfl_rookie:        'NFL ROOKIE',
    nfl_year2:         'NFL YEAR 2',
    nfl_year3plus:     'NFL VETERAN',
    retired:           'RETIRED',
  };
  return map[stage] ?? stage;
}

function stageBadgeColor(stage: CareerStage): string {
  if (stage.startsWith('nfl')) return C.green;
  if (stage === 'nfl_draft')   return C.gold;
  if (stage === 'highschool')  return C.purple;
  return C.blueBright;
}

function ovrColor(ovr: number): string {
  if (ovr >= 90) return C.green;
  if (ovr >= 80) return C.blueBright;
  if (ovr >= 70) return C.gold;
  if (ovr >= 60) return C.txt;
  return C.red;
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
  passingYards: 'Pass Yds', touchdowns: 'TDs', interceptions: 'INTs',
  completions: 'Completions', attempts: 'Attempts',
  rushingYards: 'Rush Yds', yardsPerCarry: 'Yds/Carry', receptions: 'Rec',
  receivingYards: 'Rec Yds', yardsPerCatch: 'Yds/Catch', targets: 'Targets',
  tackles: 'Tackles', pbus: 'PBUs', coverageGrade: 'Cov Grade',
  sacks: 'Sacks', tfls: 'TFLs', pressures: 'Pressures',
  passRushWinRate: 'PR Win%', coverageSnaps: 'Cov Snaps',
};

const HS_STARS = [
  { stars: 5 as 5, label: '5-Star Recruit', ovr: 82, desc: 'Top recruit in the nation. All-American on Day 1.' },
  { stars: 4 as 4, label: '4-Star Recruit', ovr: 75, desc: 'Elite prospect. High major offer from start.' },
  { stars: 3 as 3, label: '3-Star Recruit', ovr: 68, desc: 'Solid prospect. Room to prove doubters wrong.' },
  { stars: 2 as 2, label: '2-Star Recruit', ovr: 60, desc: 'Under the radar. Chip on shoulder mentality.' },
  { stars: 1 as 1, label: 'Walk-On',         ovr: 54, desc: 'No scholarship. The ultimate underdog story.' },
];

function getAttributeKeys(pos: CareerPosition): string[] {
  const base = ['speed', 'strength', 'agility', 'awareness'];
  const extras: Record<CareerPosition, string[]> = {
    QB: ['throwing'], RB: ['catching'], WR: ['catching'],
    CB: ['coverage', 'tackle'], DE: ['passRush', 'tackle'], LB: ['tackle'],
  };
  return [...base, ...(extras[pos] ?? [])];
}

const ATTR_LABEL: Record<string, string> = {
  speed: 'Speed', strength: 'Strength', agility: 'Agility',
  awareness: 'Awareness', throwing: 'Throwing', catching: 'Catching',
  coverage: 'Coverage', passRush: 'Pass Rush', tackle: 'Tackle',
};

function draftProjection(ovr: number): { pick: string; round: string } {
  if (ovr >= 92) return { pick: '1-5',    round: 'Round 1' };
  if (ovr >= 87) return { pick: '6-32',   round: 'Round 1' };
  if (ovr >= 82) return { pick: '33-64',  round: 'Round 2' };
  if (ovr >= 77) return { pick: '65-100', round: 'Round 3' };
  if (ovr >= 72) return { pick: '101-150', round: 'Rounds 4-5' };
  if (ovr >= 65) return { pick: '151-220', round: 'Rounds 6-7' };
  return { pick: 'UDFA', round: 'Undrafted' };
}

function legacyPercentile(score: number): number {
  return Math.min(99, Math.round((score / 1000) * 100));
}

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
function AttributeModal({ player, onClose }: { player: CareerPlayer; onClose: () => void }) {
  const { spendAttributePoint } = useCareerStore();
  const attrs = getAttributeKeys(player.position);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 24, backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: C.surface, border: `1px solid ${C.borderHi}`,
          borderRadius: 18, padding: 28, maxWidth: 480, width: '100%',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: C.txt }}>Spend Attribute Points</div>
            <div style={{ fontSize: 13, color: C.green, marginTop: 2, fontWeight: 700 }}>{player.attributePoints} points available</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.txtMuted, fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {attrs.map(attr => {
            const val = (player as unknown as Record<string, number>)[attr] ?? 0;
            const boost = val < 70 ? 3 : val < 85 ? 2 : 1;
            const disabled = player.attributePoints <= 0 || val >= 99;
            return (
              <div key={attr} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '10px 14px', background: C.panel,
                border: `1px solid ${C.border}`, borderRadius: 10,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: C.txt, marginBottom: 4 }}>{ATTR_LABEL[attr]}</div>
                  <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${val}%`, background: ovrColor(val), borderRadius: 3 }} />
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, width: 36, textAlign: 'center', color: ovrColor(val) }}>{val}</div>
                <Btn
                  size="sm"
                  variant={disabled ? 'ghost' : 'primary'}
                  accent={C.green}
                  disabled={disabled}
                  onClick={() => { spendAttributePoint(attr); }}
                >
                  +{boost}
                </Btn>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Draft Night Modal ────────────────────────────────────────────────────────
function DraftNightModal({ player, onClose }: { player: CareerPlayer; onClose: () => void }) {
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
      setTimeout(() => setPhase('team'),   2500),
      setTimeout(() => setPhase('reveal'), 5000),
      setTimeout(() => setPhase('done'),   7500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase === 'done') {
      enterNFLDraft(pickNum, selectedTeam.id, `${selectedTeam.city} ${selectedTeam.name}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const teamColor = hexToRgb(selectedTeam.primaryColor);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, flexDirection: 'column',
        backgroundImage: `radial-gradient(ellipse at 50% 20%, ${C.goldSub} 0%, transparent 60%)`,
      }}
    >
      <AnimatePresence mode="wait">
        {phase === 'commissioner' && (
          <motion.div key="comm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ textAlign: 'center', padding: 40 }}
          >
            <div style={{ fontSize: 48, marginBottom: 20 }}>🎩</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.gold }}>The Commissioner approaches the podium...</div>
            <div style={{ marginTop: 16, color: C.txtSub, fontSize: 16 }}>2026 NFL Draft — {proj.round}</div>
            <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 2.5 }}
              style={{ height: 2, background: C.gold, margin: '24px auto 0', borderRadius: 2 }} />
          </motion.div>
        )}
        {phase === 'team' && (
          <motion.div key="team" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
            style={{ textAlign: 'center', padding: 40 }}
          >
            <div style={{ fontSize: 14, color: C.txtSub, letterSpacing: 4, marginBottom: 20 }}>
              WITH THE {pickNum}th PICK IN THE 2026 NFL DRAFT...
            </div>
            <div style={{
              width: 120, height: 120, borderRadius: 20, margin: '0 auto 20px',
              background: teamColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 900, color: 'white',
              boxShadow: `0 0 60px ${teamColor}60`,
            }}>
              {selectedTeam.abbreviation}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.txt }}>
              THE {selectedTeam.city.toUpperCase()} {selectedTeam.name.toUpperCase()}
            </div>
          </motion.div>
        )}
        {phase === 'reveal' && (
          <motion.div key="reveal" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: 40 }}
          >
            <div style={{ fontSize: 13, color: C.txtSub, letterSpacing: 4, marginBottom: 16 }}>SELECTS...</div>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              style={{
                fontSize: 52, fontWeight: 900,
                background: `linear-gradient(135deg, ${C.gold}, ${C.txt})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: 12,
              }}
            >
              {player.name}
            </motion.div>
            <div style={{
              display: 'inline-block', padding: '8px 20px', borderRadius: 12,
              background: `${teamColor}20`, border: `2px solid ${teamColor}`,
              color: C.txt, fontWeight: 700, fontSize: 20, marginBottom: 20,
            }}>
              {player.position}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              {['🎉', '🏈', '⭐', '🎊', '🏆', '⚡', '🔥'].map((e, i) => (
                <motion.span key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.08 }} style={{ fontSize: 28 }}>{e}</motion.span>
              ))}
            </div>
          </motion.div>
        )}
        {phase === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: 40, maxWidth: 500 }}
          >
            <div style={{ fontSize: 13, color: C.gold, letterSpacing: 3, marginBottom: 12 }}>YOUR NFL CAREER BEGINS</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.txt, marginBottom: 8 }}>#{pickNum} Overall Pick</div>
            <div style={{ fontSize: 18, color: C.txtSub, marginBottom: 24 }}>
              {selectedTeam.city} {selectedTeam.name} — {proj.round}
            </div>
            <div style={{
              display: 'inline-block', padding: '10px 24px', borderRadius: 12,
              background: C.greenSub, border: `1px solid ${C.green}30`,
              color: C.green, fontWeight: 700, fontSize: 16, marginBottom: 24,
            }}>
              +3 Attribute Points Earned
            </div>
            <button onClick={onClose} style={{
              display: 'block', width: '100%', padding: '16px 0',
              background: C.green, color: '#000', border: 'none', borderRadius: 12,
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
  const [name,      setName]      = useState('');
  const [position,  setPosition]  = useState<CareerPosition>('QB');
  const [stars,     setStars]     = useState<1|2|3|4|5>(3);
  const [collegeId, setCollegeId] = useState('');

  const colleges = NCAA_GAME_TEAMS.slice(0, 32);
  const selectedCollege = colleges.find(c => c.id === collegeId);
  const selectedPos     = POSITIONS.find(p => p.key === position)!;
  const selectedStars   = HS_STARS.find(s => s.stars === stars)!;
  const canCreate = name.trim() && collegeId;

  const handleCreate = () => {
    if (!canCreate) return;
    createPlayer(name.trim(), position, stars, collegeId, selectedCollege?.city ?? 'Unknown');
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 64px' }}>
      {/* Hero */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', color: C.gold, marginBottom: 6 }}>
          PLAYER CREATION
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: C.txt, margin: '0 0 8px', letterSpacing: '-.02em' }}>
          Road to Glory
        </h1>
        <p style={{ color: C.txtSub, fontSize: 14, margin: 0 }}>
          Build your player from high school to the NFL Hall of Fame.
        </p>
      </div>

      {/* Step 1: Position */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', color: C.txtMuted, marginBottom: 14 }}>
          1 — CHOOSE YOUR POSITION
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {POSITIONS.map(pos => (
            <button
              key={pos.key}
              onClick={() => setPosition(pos.key)}
              style={{
                padding: '16px 12px', textAlign: 'center', cursor: 'pointer',
                background: position === pos.key ? C.greenSub : C.surface,
                border: `2px solid ${position === pos.key ? C.green : C.border}`,
                borderRadius: 12, color: C.txt, transition: 'border-color 140ms, background 140ms',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{pos.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: position === pos.key ? C.green : C.txt }}>{pos.key}</div>
              <div style={{ fontSize: 11, color: C.txtSub, marginTop: 2 }}>{pos.label}</div>
            </button>
          ))}
        </div>
        {selectedPos && (
          <div style={{
            marginTop: 10, padding: '10px 14px',
            background: C.panel, borderRadius: 10, border: `1px solid ${C.border}`,
            fontSize: 13, color: C.txtSub,
          }}>
            {selectedPos.desc}
          </div>
        )}
      </div>

      {/* Step 2: Stars */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', color: C.txtMuted, marginBottom: 14 }}>
          2 — RECRUITMENT CLASS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {HS_STARS.map(opt => (
            <button
              key={opt.stars}
              onClick={() => setStars(opt.stars)}
              style={{
                padding: '14px 18px', cursor: 'pointer', textAlign: 'left',
                background: stars === opt.stars ? C.goldSub : C.surface,
                border: `1px solid ${stars === opt.stars ? C.gold : C.border}`,
                borderRadius: 10, color: C.txt, display: 'flex', alignItems: 'center', gap: 14,
                transition: 'border-color 140ms, background 140ms',
              }}
            >
              <div style={{ fontSize: 18, minWidth: 90, textAlign: 'left' }}>{'⭐'.repeat(opt.stars)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: stars === opt.stars ? C.gold : C.txt }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: C.txtSub, marginTop: 2 }}>{opt.desc}</div>
              </div>
              <div style={{
                fontSize: 20, fontWeight: 900, color: ovrColor(opt.ovr), minWidth: 60, textAlign: 'right',
              }}>
                {opt.ovr} OVR
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: College */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', color: C.txtMuted, marginBottom: 14 }}>
          3 — CHOOSE YOUR COLLEGE
        </div>
        <div style={{
          maxHeight: 240, overflowY: 'auto',
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8,
        }}>
          {colleges.map(c => (
            <button
              key={c.id}
              onClick={() => setCollegeId(c.id)}
              style={{
                padding: '10px 14px', cursor: 'pointer', textAlign: 'left', fontSize: 13,
                background: collegeId === c.id ? C.blueSub : C.surface,
                border: `1px solid ${collegeId === c.id ? C.blueBright : C.border}`,
                borderRadius: 10, color: C.txt, transition: 'border-color 140ms, background 140ms',
              }}
            >
              <div style={{ fontWeight: 600, color: collegeId === c.id ? C.blueBright : C.txt }}>{c.city}</div>
              <div style={{ fontSize: 11, color: C.txtMuted }}>{c.conference}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 4: Name */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', color: C.txtMuted, marginBottom: 14 }}>
          4 — YOUR NAME
        </div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter player name..."
          style={{
            width: '100%', padding: '14px 18px',
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 10, color: C.txt, fontSize: 15,
            outline: 'none', boxSizing: 'border-box',
            fontFamily: C.font, transition: 'border-color 140ms',
          }}
          onFocus={e => { e.target.style.borderColor = C.borderFoc; }}
          onBlur={e => { e.target.style.borderColor = C.border; }}
        />
      </div>

      {/* Preview */}
      {canCreate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: C.greenSub, border: `1px solid ${C.green}30`,
            borderRadius: 12, padding: '14px 18px', marginBottom: 20,
            display: 'flex', gap: 16, alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 32 }}>{selectedPos.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: C.txt }}>{name}</div>
            <div style={{ fontSize: 13, color: C.txtSub }}>
              {position} · {selectedStars.label} · {selectedCollege?.city}
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: ovrColor(selectedStars.ovr), flexShrink: 0 }}>
            {selectedStars.ovr} <span style={{ fontSize: 14 }}>OVR</span>
          </div>
        </motion.div>
      )}

      <button
        onClick={handleCreate}
        disabled={!canCreate}
        style={{
          width: '100%', padding: '16px 0',
          background: canCreate ? C.green : C.elevated,
          color: canCreate ? '#000' : C.txtMuted,
          border: `1px solid ${canCreate ? C.green : C.border}`,
          borderRadius: 12, fontWeight: 800, fontSize: 16,
          cursor: canCreate ? 'pointer' : 'not-allowed', letterSpacing: '.06em',
        }}
      >
        CREATE PLAYER
      </button>
    </div>
  );
}

// ─── Career Hub ───────────────────────────────────────────────────────────────
function CareerHub({ player }: { player: CareerPlayer }) {
  const { recordGamePerformance, advanceSeason, resetCareer } = useCareerStore();
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [showDraftNight,     setShowDraftNight]     = useState(false);
  const [simResult, setSimResult] = useState<null | { stats: Record<string, number>; won: boolean; xp: number }>(null);

  const posInfo  = POSITIONS.find(p => p.key === player.position)!;
  const proj     = draftProjection(player.overallRating);
  const legacy   = legacyPercentile(player.legacyScore);
  const attrKeys = getAttributeKeys(player.position);

  const isHighSchool = player.stage === 'highschool';
  const isCollege  = ['college_freshman', 'college_sophomore', 'college_junior', 'college_senior'].includes(player.stage);
  const isNFL      = ['nfl_rookie', 'nfl_year2', 'nfl_year3plus'].includes(player.stage);
  const inDraftLimbo = player.stage === 'nfl_draft'; // landed here via ADVANCE SEASON
  const canPlay    = isHighSchool || isCollege || isNFL;
  const canDeclare = ['college_junior', 'college_senior'].includes(player.stage);

  // If somehow in nfl_draft stage (via advance season), auto-open draft night
  useEffect(() => {
    if (inDraftLimbo) setShowDraftNight(true);
  }, [inDraftLimbo]);

  const simGame = () => {
    const stats = simGameStats(player.position, player.overallRating);
    const won = Math.random() > 0.45;
    recordGamePerformance(stats, won);
    setSimResult({ stats, won, xp: (won ? 40 : 20) + 30 });
  };

  const xpPct = Math.round((player.experiencePoints / player.nextLevelXP) * 100);
  const stageAccent = stageBadgeColor(player.stage);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 24px 64px' }}>
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: `linear-gradient(135deg, ${C.panel} 0%, ${C.surface} 100%)`,
          border: `1px solid ${C.borderHi}`, borderRadius: 18,
          padding: '24px 28px', marginBottom: 24,
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: `${stageAccent}18`, filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${stageAccent}, transparent)` }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* OVR ring */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width={80} height={80} viewBox="0 0 80 80">
              <circle cx={40} cy={40} r={35} fill="none" stroke={C.border} strokeWidth={6} />
              <circle
                cx={40} cy={40} r={35} fill="none"
                stroke={ovrColor(player.overallRating)}
                strokeWidth={6}
                strokeDasharray={`${2 * Math.PI * 35 * player.overallRating / 99} ${2 * Math.PI * 35}`}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
              />
              <text x={40} y={38} textAnchor="middle" fill={C.txt} fontSize={20} fontWeight="900">{player.overallRating}</text>
              <text x={40} y={53} textAnchor="middle" fill={C.txtSub} fontSize={10}>OVR</text>
            </svg>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-.02em', color: C.txt }}>{player.name}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <Badge color={C.txtSub}>{player.position}</Badge>
              <Badge color={stageAccent} dot>{stageLabel(player.stage)}</Badge>
              <Badge color={C.txtSub}>Age {player.age}</Badge>
              {player.nflTeamName && <Badge color={C.green}>{player.nflTeamName}</Badge>}
              {!player.nflTeamName && player.collegeName && <Badge color={C.txtSub}>{player.collegeName}</Badge>}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {canPlay && (
              <Btn onClick={simGame} accent={C.green}>
                {isHighSchool ? 'SIM HS SEASON' : 'SIM GAME'}
              </Btn>
            )}
            {canPlay && (
              <Btn variant="ghost" onClick={() => { advanceSeason(); setSimResult(null); }}>
                {isHighSchool ? 'COMMIT TO COLLEGE' : isCollege ? 'ADVANCE SEASON' : 'NEXT SEASON'}
              </Btn>
            )}
            {canDeclare && !isNFL && (
              <Btn onClick={() => setShowDraftNight(true)} accent={C.gold}>
                DECLARE FOR DRAFT
              </Btn>
            )}
          </div>
        </div>
      </motion.div>

      {/* Sim result toast */}
      <AnimatePresence>
        {simResult && (
          <motion.div
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            style={{
              background: simResult.won ? C.greenSub : C.redSub,
              border: `1px solid ${simResult.won ? C.green : C.red}30`,
              borderRadius: 12, padding: '14px 20px', marginBottom: 20,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: simResult.won ? C.green : C.red }}>
                {simResult.won ? 'TEAM WIN' : 'TEAM LOSS'} — +{simResult.xp} XP
              </div>
              <div style={{ fontSize: 13, color: C.txtSub, marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {Object.entries(simResult.stats).slice(0, 4).map(([k, v]) => (
                  <span key={k}>{STAT_LABELS[k] ?? k}: <strong style={{ color: C.txt }}>{v}</strong></span>
                ))}
              </div>
            </div>
            <button onClick={() => setSimResult(null)} style={{
              background: 'none', border: 'none', color: C.txtMuted, fontSize: 18, cursor: 'pointer',
            }}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* Season Stats */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.blueBright}08 0%, transparent 50%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.blueBright}, transparent)` }} />
          <SectionHead>Season Stats</SectionHead>
          {posInfo.statKeys.map(key => (
            <DataRow key={key} label={STAT_LABELS[key] ?? key} value={player.seasonStats[key] ?? 0} />
          ))}
          <div style={{ marginTop: 10, fontSize: 11, color: C.txtMuted }}>2026 Season</div>
        </div>

        {/* Career Stats */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.purple}08 0%, transparent 50%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.purple}, transparent)` }} />
          <SectionHead>Career Stats</SectionHead>
          {posInfo.statKeys.map(key => (
            <DataRow key={key} label={STAT_LABELS[key] ?? key} value={player.careerStats[key] ?? 0} />
          ))}
          <div style={{ marginTop: 10, fontSize: 11, color: C.txtMuted }}>All-time</div>
        </div>

        {/* Progression Panel */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.gold}08 0%, transparent 50%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.gold}, transparent)` }} />
          <SectionHead>Progression</SectionHead>

          {/* XP bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: C.txtSub }}>Experience Points</span>
              <span style={{ color: C.gold, fontWeight: 700 }}>{player.experiencePoints}/{player.nextLevelXP} XP</span>
            </div>
            <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${xpPct}%` }}
                style={{ height: '100%', background: C.gold, borderRadius: 4 }}
              />
            </div>
          </div>

          {/* Attribute bars */}
          {attrKeys.map(attr => {
            const val = (player as unknown as Record<string, number>)[attr] ?? 0;
            return (
              <div key={attr} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span style={{ color: C.txtSub }}>{ATTR_LABEL[attr]}</span>
                  <span style={{ fontWeight: 700, color: ovrColor(val) }}>{val}</span>
                </div>
                <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${val}%`, background: ovrColor(val), borderRadius: 3, transition: 'width 0.5s' }} />
                </div>
              </div>
            );
          })}

          {player.attributePoints > 0 && (
            <button
              onClick={() => setShowAttributeModal(true)}
              style={{
                marginTop: 14, width: '100%', padding: '10px 0',
                background: C.greenSub, color: C.green,
                border: `1px solid ${C.green}30`, borderRadius: 8,
                fontWeight: 700, cursor: 'pointer', fontSize: 13, letterSpacing: '.04em',
              }}
            >
              SPEND {player.attributePoints} ATTRIBUTE POINT{player.attributePoints > 1 ? 'S' : ''}
            </button>
          )}
        </div>

        {/* Awards & Legacy */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.amber}08 0%, transparent 50%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.amber}, transparent)` }} />
          <SectionHead>Awards & Legacy</SectionHead>

          {player.awards.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {player.awards.map(award => (
                <Badge key={award} color={C.gold}>{award}</Badge>
              ))}
            </div>
          ) : (
            <div style={{ color: C.txtMuted, fontSize: 12, marginBottom: 16 }}>No awards yet — keep playing</div>
          )}

          {/* Legacy score */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: C.txtSub }}>Legacy Score</span>
              <span style={{ fontWeight: 700, color: C.purple }}>{Math.round(player.legacyScore)}/1000</span>
            </div>
            <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${(player.legacyScore / 1000) * 100}%` }}
                style={{ height: '100%', background: C.purple, borderRadius: 4 }}
              />
            </div>
            <div style={{ fontSize: 11, color: C.txtMuted, marginTop: 4 }}>
              Better than {legacy}% of players at your stage
            </div>
          </div>

          {/* Draft stock */}
          {canDeclare && (
            <div style={{
              background: C.goldSub, border: `1px solid ${C.gold}30`,
              borderRadius: 10, padding: '12px 14px',
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.16em', color: C.gold, marginBottom: 4 }}>MOCK DRAFT PROJECTION</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.txt }}>Pick {proj.pick}</div>
              <div style={{ fontSize: 13, color: C.txtSub }}>{proj.round}</div>
            </div>
          )}

          {/* NFL team info */}
          {player.draftPickNumber && (
            <div style={{
              background: C.greenSub, border: `1px solid ${C.green}20`,
              borderRadius: 10, padding: '12px 14px', marginTop: 12,
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.16em', color: C.green, marginBottom: 4 }}>DRAFTED</div>
              <div style={{ fontWeight: 700, color: C.txt }}>#{player.draftPickNumber} Overall — {player.draftYear}</div>
              <div style={{ fontSize: 13, color: C.txtSub }}>{player.nflTeamName}</div>
            </div>
          )}
        </div>
      </div>

      {/* Reset */}
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <button
          onClick={() => { if (confirm('Reset your career? This cannot be undone.')) resetCareer(); }}
          style={{
            background: 'none', border: `1px solid ${C.red}30`,
            color: `${C.red}80`, borderRadius: 8,
            padding: '8px 20px', cursor: 'pointer', fontSize: 13, fontFamily: C.font,
          }}
        >
          Reset Career
        </button>
      </div>

      <AnimatePresence>
        {showAttributeModal && <AttributeModal player={player} onClose={() => setShowAttributeModal(false)} />}
        {showDraftNight     && <DraftNightModal player={player} onClose={() => setShowDraftNight(false)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CareerModePage() {
  const { player } = useCareerStore();

  return (
    <AppShell
      backTo="/game"
      title="Career Mode"
      maxWidth={960}
      noPad
      right={player ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: C.txtSub, fontSize: 13 }}>{player.name}</span>
          <Badge color={ovrColor(player.overallRating)}>{player.overallRating} OVR</Badge>
        </div>
      ) : undefined}
    >
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
    </AppShell>
  );
}
