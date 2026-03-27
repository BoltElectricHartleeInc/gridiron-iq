import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { NFL_GAME_TEAMS } from '../game/teams';
import { useDraftStore } from '../store/draftStore';

// ─── Theme ────────────────────────────────────────────────────────────────────
const BG = '#050508';
const SURFACE = '#0a0a14';
const BORDER = 'rgba(255,255,255,0.06)';
const GREEN = '#00ff87';
const RED = '#ff4757';
const GOLD = '#ffd700';
const BLUE = '#4fc3f7';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hexToRgb(hex: number): string {
  const r = (hex >> 16) & 0xff;
  const g = (hex >> 8) & 0xff;
  const b = hex & 0xff;
  return `rgb(${r},${g},${b})`;
}

function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── Tab types ────────────────────────────────────────────────────────────────
type TabKey = 'league' | 'epa' | 'draft' | 'combine';

// ─── League Analytics ─────────────────────────────────────────────────────────
interface TeamRow {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  primaryColor: number;
  conference: string;
  wins: number;
  losses: number;
  pf: number;
  pa: number;
  offRank: number;
  defRank: number;
  passYpg: number;
  rushYpg: number;
  toDiff: number;
  epaPlay: number;
}

function buildLeagueData(): TeamRow[] {
  const nflTeams = NFL_GAME_TEAMS.filter(t => t.league === 'nfl');
  const rows: TeamRow[] = nflTeams.map(team => {
    const rand = seededRand(team.id.charCodeAt(0) * 1337 + team.offenseRating * 17);
    const offBase = team.offenseRating;
    const defBase = team.defenseRating;
    const wins = Math.min(16, Math.max(1, Math.round(rand() * 8 + (offBase - 75) * 0.4 + 4)));
    const losses = 17 - wins;
    const pf = Math.round(rand() * 80 + offBase * 2.8 + 60);
    const pa = Math.round(rand() * 80 + (100 - defBase) * 2.0 + 100);
    const passYpg = Math.round(rand() * 60 + offBase * 2.5 + 100);
    const rushYpg = Math.round(rand() * 40 + offBase * 0.9 + 60);
    const toDiff = Math.round((wins - losses) * 0.3 + rand() * 6 - 3);
    const epaPlay = parseFloat(((rand() * 0.3 - 0.1) + (offBase - 80) * 0.015).toFixed(2));
    return {
      id: team.id,
      name: team.name,
      city: team.city,
      abbreviation: team.abbreviation,
      primaryColor: team.primaryColor,
      conference: team.conference ?? 'Unknown',
      wins, losses, pf, pa,
      offRank: 0, defRank: 0,
      passYpg, rushYpg, toDiff, epaPlay,
    };
  });

  // Rank offense/defense
  const sorted_off = [...rows].sort((a, b) => b.pf - a.pf);
  const sorted_def = [...rows].sort((a, b) => a.pa - b.pa);
  sorted_off.forEach((r, i) => { rows.find(x => x.id === r.id)!.offRank = i + 1; });
  sorted_def.forEach((r, i) => { rows.find(x => x.id === r.id)!.defRank = i + 1; });

  return rows;
}

const LEAGUE_DATA = buildLeagueData();

type SortKey = keyof TeamRow;

function LeagueAnalytics() {
  const [sortKey, setSortKey] = useState<SortKey>('wins');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [confFilter, setConfFilter] = useState<string>('All');

  const conferences = ['All', ...Array.from(new Set(LEAGUE_DATA.map(t => t.conference))).sort()];

  const sorted = useMemo(() => {
    let data = confFilter === 'All' ? LEAGUE_DATA : LEAGUE_DATA.filter(t => t.conference === confFilter);
    data = [...data].sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      const dir = sortDir === 'desc' ? -1 : 1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return data;
  }, [sortKey, sortDir, confFilter]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const cols: { key: SortKey; label: string; format?: (v: TeamRow) => string }[] = [
    { key: 'wins', label: 'W-L', format: r => `${r.wins}-${r.losses}` },
    { key: 'pf', label: 'PF' },
    { key: 'pa', label: 'PA' },
    { key: 'offRank', label: 'Off Rank', format: r => `#${r.offRank}` },
    { key: 'defRank', label: 'Def Rank', format: r => `#${r.defRank}` },
    { key: 'passYpg', label: 'Pass Yds/G' },
    { key: 'rushYpg', label: 'Rush Yds/G' },
    { key: 'toDiff', label: 'TO Diff', format: r => r.toDiff > 0 ? `+${r.toDiff}` : String(r.toDiff) },
    { key: 'epaPlay', label: 'EPA/Play', format: r => r.epaPlay > 0 ? `+${r.epaPlay}` : String(r.epaPlay) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Conference filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {conferences.map(c => (
          <button key={c} onClick={() => setConfFilter(c)} style={{
            padding: '6px 14px',
            background: confFilter === c ? GREEN : SURFACE,
            color: confFilter === c ? '#000' : 'rgba(255,255,255,0.6)',
            border: `1px solid ${confFilter === c ? GREEN : BORDER}`,
            borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600,
          }}>
            {c}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: SURFACE }}>
              <th style={{ ...thStyle, textAlign: 'left', paddingLeft: 16 }}>Team</th>
              {cols.map(c => (
                <th key={c.key} onClick={() => handleSort(c.key)} style={{ ...thStyle, cursor: 'pointer' }}>
                  {c.label} {sortKey === c.key ? (sortDir === 'desc' ? '▼' : '▲') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                style={{
                  borderBottom: `1px solid ${BORDER}`,
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                }}
              >
                <td style={{ padding: '10px 0 10px 0', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 4, height: 36, borderRadius: 2,
                      background: hexToRgb(row.primaryColor),
                      flexShrink: 0,
                    }} />
                    <div>
                      <div style={{ fontWeight: 700 }}>{row.city} {row.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{row.conference}</div>
                    </div>
                  </div>
                </td>
                {cols.map(c => {
                  const val = c.format ? c.format(row) : String(row[c.key]);
                  let color = 'white';
                  if (c.key === 'toDiff') color = (row.toDiff > 0 ? GREEN : row.toDiff < 0 ? RED : 'white');
                  if (c.key === 'epaPlay') color = (row.epaPlay > 0 ? GREEN : row.epaPlay < 0 ? RED : 'white');
                  if (c.key === 'offRank') color = row.offRank <= 8 ? GREEN : row.offRank >= 25 ? RED : 'white';
                  if (c.key === 'defRank') color = row.defRank <= 8 ? GREEN : row.defRank >= 25 ? RED : 'white';
                  return (
                    <td key={c.key} style={{ ...tdStyle, color, fontWeight: c.key === 'wins' ? 700 : 400 }}>
                      {val}
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── EPA Tracker ──────────────────────────────────────────────────────────────
const PLAYS = [
  { down: '1st & 10', desc: 'Mahomes play-action deep to Kelce, 22 yards', yards: 22, epa: 2.4 },
  { down: '1st & 10', desc: 'Henry up the middle, 4 yards', yards: 4, epa: -0.3 },
  { down: '2nd & 6', desc: 'Jackson scrambles right, 8 yards and first down', yards: 8, epa: 1.2 },
  { down: '1st & 10', desc: 'Hill bubble screen, tackled for 1 yard', yards: 1, epa: -0.8 },
  { down: '2nd & 9', desc: 'Mahomes incomplete — pressure by Hutchinson', yards: 0, epa: -1.1 },
  { down: '3rd & 9', desc: 'Mahomes slant to Rice, 11 yards and first down', yards: 11, epa: 2.8 },
  { down: '1st & 10', desc: 'Henry outside zone, cuts back, 12 yards', yards: 12, epa: 1.4 },
  { down: '1st & 10', desc: 'Jackson deep post to Andrews, 31 yards', yards: 31, epa: 3.6 },
  { down: '1st & Goal 8', desc: 'Henry TD run — Ravens go up 7-0', yards: 8, epa: 4.2 },
  { down: '1st & 10', desc: 'Mahomes RPO keep, 6 yards', yards: 6, epa: 0.3 },
  { down: '2nd & 4', desc: 'Rice crossing route, 14 yards', yards: 14, epa: 1.8 },
  { down: '1st & 10', desc: 'Jackson interception — tipped by Clark', yards: -15, epa: -4.8 },
  { down: '1st & 10', desc: 'Mahomes TD strike to Kelce — Chiefs lead 7-6', yards: 24, epa: 5.1 },
  { down: '1st & 10', desc: 'Henry sweep, 3 yards', yards: 3, epa: -0.4 },
  { down: '2nd & 7', desc: 'Jackson hurried, checkdown to Henry, 5 yards', yards: 5, epa: -0.2 },
  { down: '3rd & 2', desc: 'Jackson QB sneak — first down', yards: 3, epa: 1.5 },
  { down: '1st & 10', desc: 'Andrews over the middle — FUMBLE recovered by KC', yards: 6, epa: -3.2 },
  { down: '1st & 10', desc: 'Mahomes finds Worthy on a deep ball, 43 yards', yards: 43, epa: 4.8 },
  { down: '1st & Goal 6', desc: 'Mahomes scramble TD — Chiefs lead 14-6', yards: 6, epa: 4.5 },
];

// Win probability curve points (x: play index, y: KC win prob 0-100)
const WP_POINTS = [50, 48, 52, 50, 52, 54, 52, 56, 44, 48, 52, 38, 62, 58, 54, 56, 44, 62, 74];

function EPATracker() {
  let runningEPA = 0;

  // SVG path for WP
  const svgW = 600, svgH = 180;
  const pad = { l: 40, r: 20, t: 20, b: 40 };
  const pts = WP_POINTS.map((wp, i) => {
    const x = pad.l + (i / (WP_POINTS.length - 1)) * (svgW - pad.l - pad.r);
    const y = pad.t + ((100 - wp) / 100) * (svgH - pad.t - pad.b);
    return [x, y] as [number, number];
  });
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const fillD = pathD + ` L${pts[pts.length - 1][0]},${svgH - pad.b} L${pts[0][0]},${svgH - pad.b} Z`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* EPA explainer */}
      <div style={{
        background: SURFACE, borderRadius: 14, padding: 20,
        border: `1px solid ${BORDER}`,
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>What is EPA?</div>
        <div style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, fontSize: 14 }}>
          <strong style={{ color: GREEN }}>Expected Points Added (EPA)</strong> measures how much a play changes a team's expected points.
          A first down with 8 yards gained on 3rd & 7 adds more expected points than 8 yards on 1st & 10 because
          the down-and-distance context matters. Positive EPA = offense gained value. Negative EPA = defense won the play.
          EPA per play is the single best metric for evaluating team and player performance.
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 14, flexWrap: 'wrap' }}>
          {[['TD Pass', '+5.1 EPA'], ['Pick-6', '-4.8 EPA'], ['3rd-down Conv.', '+2.8 EPA'], ['3-and-out', '-1.4 EPA']].map(([label, val]) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 14px',
              border: `1px solid ${BORDER}`,
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{label}</div>
              <div style={{ fontWeight: 700, color: val.startsWith('+') ? GREEN : RED }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Win probability graph */}
      <div style={{ background: SURFACE, borderRadius: 14, padding: 20, border: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Win Probability — Chiefs vs. Ravens</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>Chiefs Win % over game progression</div>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', maxHeight: 180 }}>
          <defs>
            <linearGradient id="wpGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GREEN} stopOpacity="0.25" />
              <stop offset="100%" stopColor={GREEN} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[25, 50, 75].map(y => {
            const sy = pad.t + ((100 - y) / 100) * (svgH - pad.t - pad.b);
            return (
              <g key={y}>
                <line x1={pad.l} x2={svgW - pad.r} y1={sy} y2={sy} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                <text x={pad.l - 6} y={sy + 4} fill="rgba(255,255,255,0.3)" fontSize={10} textAnchor="end">{y}%</text>
              </g>
            );
          })}
          {/* 50% line */}
          {(() => {
            const sy = pad.t + 0.5 * (svgH - pad.t - pad.b);
            return <line x1={pad.l} x2={svgW - pad.r} y1={sy} y2={sy} stroke="rgba(255,255,255,0.25)" strokeWidth={1} strokeDasharray="4,4" />;
          })()}
          {/* Fill */}
          <path d={fillD} fill="url(#wpGrad)" />
          {/* Line */}
          <path d={pathD} fill="none" stroke={GREEN} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {/* Points */}
          {pts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3} fill={GREEN} opacity={0.6} />
          ))}
          {/* Quarter labels */}
          {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => {
            const x = pad.l + ((i * 0.33 + 0.16) * (svgW - pad.l - pad.r));
            return <text key={q} x={x} y={svgH - 6} fill="rgba(255,255,255,0.35)" fontSize={11} textAnchor="middle">{q}</text>;
          })}
        </svg>
      </div>

      {/* Play-by-play log */}
      <div style={{ background: SURFACE, borderRadius: 14, padding: 20, border: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Play-by-Play EPA Log</div>
          <div style={{ fontSize: 13, display: 'flex', gap: 16 }}>
            <span style={{ color: GREEN }}>Chiefs off: +8.2 EPA</span>
            <span style={{ color: RED }}>Ravens def: -6.1 EPA</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {PLAYS.map((play, i) => {
            runningEPA += play.epa;
            const pos = play.epa >= 0;
            return (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 60px 70px 80px',
                gap: 8,
                padding: '8px 12px',
                borderBottom: `1px solid ${BORDER}`,
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                fontSize: 13,
                alignItems: 'center',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{play.down}</span>
                <span style={{ color: 'rgba(255,255,255,0.85)' }}>{play.desc}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{play.yards > 0 ? `+${play.yards}` : play.yards} yds</span>
                <span style={{ fontWeight: 700, color: pos ? GREEN : RED }}>
                  {pos ? '+' : ''}{play.epa.toFixed(1)}
                </span>
                <span style={{ color: runningEPA >= 0 ? GREEN : RED, fontSize: 12 }}>
                  Running: {runningEPA >= 0 ? '+' : ''}{runningEPA.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Draft Analytics ──────────────────────────────────────────────────────────
const MOCK_DRAFTS = [
  { year: 2025, class: 'Below Average', avgGrade: 'C+', teams: [
    { team: 'Chiefs', picks: [{ name: 'Marcus Webb', pos: 'OT', pick: 28, grade: 'A', expected: 'B+', delta: 'STEAL' }] },
    { team: 'Eagles', picks: [{ name: 'Jordan Kidd', pos: 'CB', pick: 4, grade: 'B', expected: 'A-', delta: 'REACH' }] },
  ]},
  { year: 2024, class: 'Strong', avgGrade: 'B+', teams: [] },
];

function DraftAnalytics() {
  const draftStore = useDraftStore();
  // Access completed draft data if available
  const session = (draftStore as { session?: { picks?: { playerName?: string; position?: string; overall?: number; teamId?: string }[] } }).session;
  const hasDraft = session?.picks && session.picks.length > 0;

  const [selectedYear, setSelectedYear] = useState(0);
  const mock = MOCK_DRAFTS[selectedYear];

  const getGradeColor = (g: string) => {
    if (g.startsWith('A')) return GREEN;
    if (g.startsWith('B')) return BLUE;
    if (g.startsWith('C')) return GOLD;
    return RED;
  };

  const getDeltaColor = (d: string) => d === 'STEAL' ? GREEN : d === 'REACH' ? RED : GOLD;

  if (hasDraft && session?.picks) {
    const picks = session.picks;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Your Draft Results</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {picks.slice(0, 32).map((pick, i) => {
            if (!pick.playerName) return null;
            const mockGrade = pick.overall! <= 10 ? 'A+' : pick.overall! <= 32 ? 'A' : pick.overall! <= 64 ? 'B+' : 'B';
            const expectedGrade = pick.overall! <= 10 ? 'A' : pick.overall! <= 32 ? 'A-' : pick.overall! <= 64 ? 'B' : 'C+';
            const delta = mockGrade === expectedGrade ? 'VALUE' : mockGrade > expectedGrade ? 'STEAL' : 'REACH';
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '40px 1fr 60px 60px 60px 70px',
                gap: 12, padding: '10px 16px',
                background: SURFACE, borderRadius: 10,
                border: `1px solid ${BORDER}`, fontSize: 13, alignItems: 'center',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>#{pick.overall}</span>
                <div>
                  <div style={{ fontWeight: 700 }}>{pick.playerName}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{pick.teamId?.toUpperCase()}</div>
                </div>
                <span style={{
                  padding: '2px 8px', borderRadius: 6,
                  background: 'rgba(255,255,255,0.06)', fontSize: 12, fontWeight: 700,
                }}>{pick.position}</span>
                <span style={{ fontWeight: 700, color: getGradeColor(mockGrade) }}>{mockGrade}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>exp: {expectedGrade}</span>
                <span style={{
                  fontWeight: 700, color: getDeltaColor(delta), fontSize: 11, letterSpacing: 1,
                }}>{delta}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{
        background: 'rgba(255,215,0,0.06)', border: `1px solid rgba(255,215,0,0.2)`,
        borderRadius: 12, padding: '14px 18px', fontSize: 14, color: 'rgba(255,255,255,0.7)',
      }}>
        No completed draft found. Showing historical mock draft analytics.
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {MOCK_DRAFTS.map((d, i) => (
          <button key={i} onClick={() => setSelectedYear(i)} style={{
            padding: '8px 16px',
            background: selectedYear === i ? GOLD : SURFACE,
            color: selectedYear === i ? '#000' : 'white',
            border: `1px solid ${selectedYear === i ? GOLD : BORDER}`,
            borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: 13,
          }}>{d.year} Draft</button>
        ))}
      </div>

      {mock && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            display: 'flex', gap: 20, flexWrap: 'wrap',
            background: SURFACE, borderRadius: 12, padding: 20, border: `1px solid ${BORDER}`,
          }}>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>DRAFT YEAR</div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>{mock.year}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>CLASS GRADE</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: getGradeColor(mock.avgGrade) }}>{mock.avgGrade}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>CLASS STRENGTH</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: BLUE }}>{mock.class}</div>
            </div>
          </div>

          {mock.teams.length > 0 ? mock.teams.map(t => (
            <div key={t.team} style={{ background: SURFACE, borderRadius: 12, padding: 16, border: `1px solid ${BORDER}` }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>{t.team}</div>
              {t.picks.map(p => (
                <div key={p.name} style={{
                  display: 'flex', gap: 16, alignItems: 'center',
                  padding: '8px 0', borderBottom: `1px solid ${BORDER}`,
                  fontSize: 14,
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>#{p.pick}</span>
                  <span style={{ flex: 1, fontWeight: 600 }}>{p.name}</span>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{p.pos}</span>
                  <span style={{ color: getGradeColor(p.grade), fontWeight: 700 }}>{p.grade}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>exp {p.expected}</span>
                  <span style={{
                    padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: p.delta === 'STEAL' ? 'rgba(0,255,135,0.1)' : 'rgba(255,71,87,0.1)',
                    color: getDeltaColor(p.delta),
                    border: `1px solid ${getDeltaColor(p.delta)}40`,
                  }}>{p.delta}</span>
                </div>
              ))}
            </div>
          )) : (
            <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px 0' }}>
              Detailed pick data not available for this class
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Combine Metrics ──────────────────────────────────────────────────────────
const POSITION_AVERAGES = [
  { pos: 'QB', dash: 4.79, bench: 18, iq: 26, route: 340 },
  { pos: 'RB', dash: 4.45, bench: 20, iq: 18, route: 380 },
  { pos: 'WR', dash: 4.43, bench: 14, iq: 17, route: 410 },
  { pos: 'TE', dash: 4.65, bench: 22, iq: 20, route: 310 },
  { pos: 'OL', dash: 5.10, bench: 35, iq: 19, route: 200 },
  { pos: 'DL', dash: 4.85, bench: 32, iq: 18, route: 220 },
  { pos: 'LB', dash: 4.65, bench: 26, iq: 21, route: 280 },
  { pos: 'CB', dash: 4.48, bench: 17, iq: 18, route: 360 },
  { pos: 'S', dash: 4.55, bench: 20, iq: 19, route: 320 },
];

function CombineMetrics() {
  const stored = (() => {
    try {
      return JSON.parse(localStorage.getItem('combine-results') ?? 'null');
    } catch {
      return null;
    }
  })();

  type MetricKey = 'dash' | 'bench' | 'iq' | 'route';

  const [metric, setMetric] = useState<MetricKey>('dash');

  const metricConfig: Record<MetricKey, { label: string; unit: string; higherBetter: boolean; maxVal: number }> = {
    dash: { label: '40-Yard Dash (s)', unit: 's', higherBetter: false, maxVal: 5.5 },
    bench: { label: 'Bench Press (reps)', unit: ' reps', higherBetter: true, maxVal: 40 },
    iq: { label: 'Wonderlic Score', unit: ' pts', higherBetter: true, maxVal: 50 },
    route: { label: 'Route Running', unit: ' pts', higherBetter: true, maxVal: 500 },
  };

  const m = metricConfig[metric];

  const maxBarWidth = (val: number) => {
    if (!m.higherBetter) {
      return ((m.maxVal - val) / (m.maxVal - 4.3)) * 100;
    }
    return (val / m.maxVal) * 100;
  };

  const gradeColor = (pct: number) => pct >= 80 ? GREEN : pct >= 60 ? BLUE : pct >= 40 ? GOLD : RED;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {stored && (
        <div style={{
          background: 'rgba(0,255,135,0.06)', border: `1px solid ${GREEN}30`,
          borderRadius: 14, padding: 20,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Your Combine Results</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {stored.results?.map((r: { icon: string; label: string; value: string; grade: string }) => (
              <div key={r.label} style={{
                background: SURFACE, borderRadius: 10, padding: '10px 16px',
                border: `1px solid ${BORDER}`,
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{r.icon}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{r.label}</div>
                <div style={{ fontWeight: 700 }}>{r.value}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: gradeColor(70) }}>{r.grade}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 20, fontWeight: 900 }}>
            Overall: <span style={{ color: GREEN }}>{stored.overallGrade}</span>
          </div>
        </div>
      )}

      {/* Metric selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(Object.keys(metricConfig) as MetricKey[]).map(k => (
          <button key={k} onClick={() => setMetric(k)} style={{
            padding: '8px 18px',
            background: metric === k ? GREEN : SURFACE,
            color: metric === k ? '#000' : 'rgba(255,255,255,0.7)',
            border: `1px solid ${metric === k ? GREEN : BORDER}`,
            borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: 13,
          }}>
            {metricConfig[k].label.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ background: SURFACE, borderRadius: 14, padding: 20, border: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{m.label} — Position Averages</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {POSITION_AVERAGES.map(pos => {
            const val = pos[metric as keyof typeof pos] as number;
            const pct = Math.max(5, Math.min(100, maxBarWidth(val)));
            return (
              <div key={pos.pos} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                  {pos.pos}
                </div>
                <div style={{ flex: 1, height: 20, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{
                      height: '100%', borderRadius: 4,
                      background: gradeColor(pct),
                    }}
                  />
                </div>
                <div style={{ width: 70, textAlign: 'right', fontWeight: 700, fontSize: 13 }}>
                  {val}{m.unit}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!stored && (
        <div style={{
          textAlign: 'center', padding: '30px',
          background: SURFACE, borderRadius: 12, border: `1px dashed ${BORDER}`,
          color: 'rgba(255,255,255,0.4)',
        }}>
          Play the NFL Combine to see your personal percentile rankings here
        </div>
      )}
    </div>
  );
}

// ─── Shared table styles ──────────────────────────────────────────────────────
const thStyle: React.CSSProperties = {
  padding: '10px 12px',
  color: 'rgba(255,255,255,0.5)',
  fontWeight: 600,
  fontSize: 12,
  letterSpacing: 1,
  textAlign: 'center',
  userSelect: 'none',
};
const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  textAlign: 'center',
  fontSize: 13,
};

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'league', label: 'League Analytics', icon: '📊' },
  { key: 'epa', label: 'EPA Tracker', icon: '⚡' },
  { key: 'draft', label: 'Draft Analytics', icon: '📋' },
  { key: 'combine', label: 'Combine Metrics', icon: '🏃' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AnalyticsDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('league');

  return (
    <div style={{ background: BG, minHeight: '100vh', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      {/* Top nav */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '16px 24px',
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
          <span style={{ color: GREEN }}>ANALYTICS</span> HUB
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginLeft: 8 }}>
          2026 NFL Season
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 0,
        borderBottom: `1px solid ${BORDER}`,
        background: SURFACE,
        overflowX: 'auto',
        padding: '0 24px',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '14px 20px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.key ? GREEN : 'transparent'}`,
              color: activeTab === tab.key ? 'white' : 'rgba(255,255,255,0.45)',
              fontWeight: activeTab === tab.key ? 700 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'league' && <LeagueAnalytics />}
            {activeTab === 'epa' && <EPATracker />}
            {activeTab === 'draft' && <DraftAnalytics />}
            {activeTab === 'combine' && <CombineMetrics />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
