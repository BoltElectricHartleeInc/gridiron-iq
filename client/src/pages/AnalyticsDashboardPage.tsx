import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NFL_GAME_TEAMS } from '../game/teams';
import { useDraftStore } from '../store/draftStore';
import { AppShell, C, TabBar, SectionHead } from '../components/AppShell';

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
      id: team.id, name: team.name, city: team.city,
      abbreviation: team.abbreviation, primaryColor: team.primaryColor,
      conference: team.conference ?? 'Unknown',
      wins, losses, pf, pa, offRank: 0, defRank: 0,
      passYpg, rushYpg, toDiff, epaPlay,
    };
  });
  const sorted_off = [...rows].sort((a, b) => b.pf - a.pf);
  const sorted_def = [...rows].sort((a, b) => a.pa - b.pa);
  sorted_off.forEach((r, i) => { rows.find(x => x.id === r.id)!.offRank = i + 1; });
  sorted_def.forEach((r, i) => { rows.find(x => x.id === r.id)!.defRank = i + 1; });
  return rows;
}

const LEAGUE_DATA = buildLeagueData();
type SortKey = keyof TeamRow;

function LeagueAnalytics() {
  const [sortKey,    setSortKey]    = useState<SortKey>('wins');
  const [sortDir,    setSortDir]    = useState<'asc' | 'desc'>('desc');
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
    { key: 'wins',    label: 'W-L',       format: r => `${r.wins}-${r.losses}` },
    { key: 'pf',      label: 'PF' },
    { key: 'pa',      label: 'PA' },
    { key: 'offRank', label: 'Off Rank',  format: r => `#${r.offRank}` },
    { key: 'defRank', label: 'Def Rank',  format: r => `#${r.defRank}` },
    { key: 'passYpg', label: 'Pass Yds/G' },
    { key: 'rushYpg', label: 'Rush Yds/G' },
    { key: 'toDiff',  label: 'TO Diff',   format: r => r.toDiff > 0 ? `+${r.toDiff}` : String(r.toDiff) },
    { key: 'epaPlay', label: 'EPA/Play',  format: r => r.epaPlay > 0 ? `+${r.epaPlay}` : String(r.epaPlay) },
  ];

  const thS: React.CSSProperties = {
    padding: '10px 12px', color: C.txtSub, fontWeight: 700,
    fontSize: 10, letterSpacing: '.1em', textAlign: 'center',
    userSelect: 'none', textTransform: 'uppercase',
  };
  const tdS: React.CSSProperties = { padding: '8px 12px', textAlign: 'center', fontSize: 13 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Conference filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {conferences.map(c => (
          <button key={c} onClick={() => setConfFilter(c)} style={{
            padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
            background: confFilter === c ? C.green : C.surface,
            color: confFilter === c ? '#000' : C.txtSub,
            border: `1px solid ${confFilter === c ? C.green : C.border}`,
            fontWeight: 700, fontSize: 12, transition: 'all 140ms',
          }}>
            {c}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              <th style={{ ...thS, textAlign: 'left', paddingLeft: 16 }}>Team</th>
              {cols.map(c => (
                <th key={c.key} onClick={() => handleSort(c.key)} style={{ ...thS, cursor: 'pointer' }}>
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
                transition={{ delay: i * 0.015 }}
                style={{
                  borderBottom: `1px solid ${C.border}`,
                  background: i % 2 === 0 ? 'transparent' : `${C.border}18`,
                }}
              >
                <td style={{ padding: '10px 0 10px 4px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 4, height: 36, borderRadius: 2,
                      background: hexToRgb(row.primaryColor), flexShrink: 0,
                    }} />
                    <div>
                      <div style={{ fontWeight: 700, color: C.txt }}>{row.city} {row.name}</div>
                      <div style={{ fontSize: 10, color: C.txtMuted }}>{row.conference}</div>
                    </div>
                  </div>
                </td>
                {cols.map(c => {
                  const val = c.format ? c.format(row) : String(row[c.key]);
                  let color = C.txt;
                  if (c.key === 'toDiff')  color = row.toDiff  > 0 ? C.green : row.toDiff  < 0 ? C.red : C.txt;
                  if (c.key === 'epaPlay') color = row.epaPlay > 0 ? C.green : row.epaPlay < 0 ? C.red : C.txt;
                  if (c.key === 'offRank') color = row.offRank <= 8 ? C.green : row.offRank >= 25 ? C.red : C.txt;
                  if (c.key === 'defRank') color = row.defRank <= 8 ? C.green : row.defRank >= 25 ? C.red : C.txt;
                  return (
                    <td key={c.key} style={{ ...tdS, color, fontWeight: c.key === 'wins' ? 800 : 400 }}>
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
  { down: '2nd & 6',  desc: 'Jackson scrambles right, 8 yards and first down', yards: 8, epa: 1.2 },
  { down: '1st & 10', desc: 'Hill bubble screen, tackled for 1 yard', yards: 1, epa: -0.8 },
  { down: '2nd & 9',  desc: 'Mahomes incomplete — pressure by Hutchinson', yards: 0, epa: -1.1 },
  { down: '3rd & 9',  desc: 'Mahomes slant to Rice, 11 yards and first down', yards: 11, epa: 2.8 },
  { down: '1st & 10', desc: 'Henry outside zone, cuts back, 12 yards', yards: 12, epa: 1.4 },
  { down: '1st & 10', desc: 'Jackson deep post to Andrews, 31 yards', yards: 31, epa: 3.6 },
  { down: '1st & Goal 8', desc: 'Henry TD run — Ravens go up 7-0', yards: 8, epa: 4.2 },
  { down: '1st & 10', desc: 'Mahomes RPO keep, 6 yards', yards: 6, epa: 0.3 },
  { down: '2nd & 4',  desc: 'Rice crossing route, 14 yards', yards: 14, epa: 1.8 },
  { down: '1st & 10', desc: 'Jackson interception — tipped by Clark', yards: -15, epa: -4.8 },
  { down: '1st & 10', desc: 'Mahomes TD strike to Kelce — Chiefs lead 7-6', yards: 24, epa: 5.1 },
  { down: '1st & 10', desc: 'Henry sweep, 3 yards', yards: 3, epa: -0.4 },
  { down: '2nd & 7',  desc: 'Jackson hurried, checkdown to Henry, 5 yards', yards: 5, epa: -0.2 },
  { down: '3rd & 2',  desc: 'Jackson QB sneak — first down', yards: 3, epa: 1.5 },
  { down: '1st & 10', desc: 'Andrews over the middle — FUMBLE recovered by KC', yards: 6, epa: -3.2 },
  { down: '1st & 10', desc: 'Mahomes finds Worthy on a deep ball, 43 yards', yards: 43, epa: 4.8 },
  { down: '1st & Goal 6', desc: 'Mahomes scramble TD — Chiefs lead 14-6', yards: 6, epa: 4.5 },
];

const WP_POINTS = [50, 48, 52, 50, 52, 54, 52, 56, 44, 48, 52, 38, 62, 58, 54, 56, 44, 62, 74];

function EPATracker() {
  let runningEPA = 0;
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* EPA explainer */}
      <div style={{ background: C.surface, borderRadius: 14, padding: 20, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.txt, marginBottom: 10 }}>What is EPA?</div>
        <div style={{ color: C.txtSub, lineHeight: 1.7, fontSize: 14 }}>
          <strong style={{ color: C.green }}>Expected Points Added (EPA)</strong> measures how much a play changes a team's expected points.
          A first down with 8 yards gained on 3rd & 7 adds more expected points than 8 yards on 1st & 10 because
          the down-and-distance context matters. Positive EPA = offense gained value. Negative EPA = defense won the play.
          EPA per play is the single best metric for evaluating team and player performance.
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 16, flexWrap: 'wrap' }}>
          {[['TD Pass', '+5.1 EPA', C.green], ['Pick-6', '-4.8 EPA', C.red], ['3rd-down Conv.', '+2.8 EPA', C.green], ['3-and-out', '-1.4 EPA', C.red]].map(([label, val, color]) => (
            <div key={label} style={{
              background: C.panel, borderRadius: 8, padding: '8px 14px', border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 2, fontWeight: 600 }}>{label}</div>
              <div style={{ fontWeight: 700, color: color as string }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Win probability graph */}
      <div style={{ background: C.surface, borderRadius: 14, padding: 20, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.txt, marginBottom: 2 }}>Win Probability — Chiefs vs. Ravens</div>
        <div style={{ fontSize: 11, color: C.txtSub, marginBottom: 14 }}>Chiefs Win % over game progression</div>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', maxHeight: 180 }}>
          <defs>
            <linearGradient id="wpGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.green} stopOpacity="0.25" />
              <stop offset="100%" stopColor={C.green} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[25, 50, 75].map(y => {
            const sy = pad.t + ((100 - y) / 100) * (svgH - pad.t - pad.b);
            return (
              <g key={y}>
                <line x1={pad.l} x2={svgW - pad.r} y1={sy} y2={sy} stroke={C.border} strokeWidth={1} />
                <text x={pad.l - 6} y={sy + 4} fill={C.txtMuted} fontSize={10} textAnchor="end">{y}%</text>
              </g>
            );
          })}
          {(() => {
            const sy = pad.t + 0.5 * (svgH - pad.t - pad.b);
            return <line x1={pad.l} x2={svgW - pad.r} y1={sy} y2={sy} stroke={C.borderHi} strokeWidth={1} strokeDasharray="4,4" />;
          })()}
          <path d={fillD} fill="url(#wpGrad)" />
          <path d={pathD} fill="none" stroke={C.green} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill={C.green} opacity={0.7} />)}
          {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => {
            const x = pad.l + ((i * 0.33 + 0.16) * (svgW - pad.l - pad.r));
            return <text key={q} x={x} y={svgH - 6} fill={C.txtMuted} fontSize={11} textAnchor="middle">{q}</text>;
          })}
        </svg>
      </div>

      {/* Play-by-play */}
      <div style={{ background: C.surface, borderRadius: 14, padding: 20, border: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.txt }}>Play-by-Play EPA Log</div>
          <div style={{ fontSize: 12, display: 'flex', gap: 16 }}>
            <span style={{ color: C.green, fontWeight: 700 }}>Chiefs off: +8.2 EPA</span>
            <span style={{ color: C.red, fontWeight: 700 }}>Ravens def: -6.1 EPA</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {PLAYS.map((play, i) => {
            runningEPA += play.epa;
            const pos = play.epa >= 0;
            return (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 60px 70px 80px',
                gap: 8, padding: '8px 12px',
                borderBottom: `1px solid ${C.border}`,
                background: i % 2 === 0 ? 'transparent' : `${C.border}15`,
                fontSize: 13, alignItems: 'center',
              }}>
                <span style={{ color: C.txtSub, fontSize: 11 }}>{play.down}</span>
                <span style={{ color: C.txt }}>{play.desc}</span>
                <span style={{ color: C.txtSub }}>{play.yards > 0 ? `+${play.yards}` : play.yards} yds</span>
                <span style={{ fontWeight: 700, color: pos ? C.green : C.red }}>
                  {pos ? '+' : ''}{play.epa.toFixed(1)}
                </span>
                <span style={{ color: runningEPA >= 0 ? C.green : C.red, fontSize: 11 }}>
                  {runningEPA >= 0 ? '+' : ''}{runningEPA.toFixed(1)}
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
  const session = (draftStore as { session?: { picks?: { playerName?: string; position?: string; overall?: number; teamId?: string }[] } }).session;
  const hasDraft = session?.picks && session.picks.length > 0;
  const [selectedYear, setSelectedYear] = useState(0);
  const mock = MOCK_DRAFTS[selectedYear];

  const getGradeColor = (g: string) => {
    if (g.startsWith('A')) return C.green;
    if (g.startsWith('B')) return C.blueBright;
    if (g.startsWith('C')) return C.gold;
    return C.red;
  };
  const getDeltaColor = (d: string) => d === 'STEAL' ? C.green : d === 'REACH' ? C.red : C.gold;

  if (hasDraft && session?.picks) {
    const picks = session.picks;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.txt }}>Your Draft Results</div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          {picks.slice(0, 32).map((pick, i) => {
            if (!pick.playerName) return null;
            const mockGrade = pick.overall! <= 10 ? 'A+' : pick.overall! <= 32 ? 'A' : pick.overall! <= 64 ? 'B+' : 'B';
            const expectedGrade = pick.overall! <= 10 ? 'A' : pick.overall! <= 32 ? 'A-' : pick.overall! <= 64 ? 'B' : 'C+';
            const delta = mockGrade === expectedGrade ? 'VALUE' : mockGrade > expectedGrade ? 'STEAL' : 'REACH';
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '40px 1fr 60px 60px 60px 70px',
                gap: 12, padding: '10px 16px',
                borderBottom: `1px solid ${C.border}`,
                background: C.surface, fontSize: 13, alignItems: 'center',
              }}>
                <span style={{ color: C.txtSub, fontWeight: 700 }}>#{pick.overall}</span>
                <div>
                  <div style={{ fontWeight: 700, color: C.txt }}>{pick.playerName}</div>
                  <div style={{ fontSize: 11, color: C.txtMuted }}>{pick.teamId?.toUpperCase()}</div>
                </div>
                <span style={{
                  padding: '2px 8px', borderRadius: 6,
                  background: C.panel, fontSize: 11, fontWeight: 700, color: C.txtSub,
                }}>{pick.position}</span>
                <span style={{ fontWeight: 800, color: getGradeColor(mockGrade) }}>{mockGrade}</span>
                <span style={{ color: C.txtMuted, fontSize: 11 }}>exp: {expectedGrade}</span>
                <span style={{
                  fontWeight: 800, color: getDeltaColor(delta), fontSize: 11, letterSpacing: '.08em',
                }}>{delta}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{
        background: C.goldSub, border: `1px solid ${C.gold}40`,
        borderRadius: 12, padding: '14px 18px', fontSize: 14, color: C.txtSub,
      }}>
        No completed draft found. Showing historical mock draft analytics.
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {MOCK_DRAFTS.map((d, i) => (
          <button key={i} onClick={() => setSelectedYear(i)} style={{
            padding: '8px 18px', borderRadius: 999, cursor: 'pointer', fontWeight: 700, fontSize: 12,
            background: selectedYear === i ? C.gold : C.surface,
            color: selectedYear === i ? '#000' : C.txt,
            border: `1px solid ${selectedYear === i ? C.gold : C.border}`,
            transition: 'all 140ms',
          }}>{d.year} Draft</button>
        ))}
      </div>

      {mock && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            display: 'flex', gap: 20, flexWrap: 'wrap',
            background: C.surface, borderRadius: 14, padding: 20, border: `1px solid ${C.border}`,
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', color: C.txtMuted, marginBottom: 4 }}>DRAFT YEAR</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.txt }}>{mock.year}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', color: C.txtMuted, marginBottom: 4 }}>CLASS GRADE</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: getGradeColor(mock.avgGrade) }}>{mock.avgGrade}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', color: C.txtMuted, marginBottom: 4 }}>CLASS STRENGTH</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.blueBright }}>{mock.class}</div>
            </div>
          </div>

          {mock.teams.length > 0 ? mock.teams.map(t => (
            <div key={t.team} style={{ background: C.surface, borderRadius: 14, padding: 16, border: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.txt, marginBottom: 12 }}>{t.team}</div>
              {t.picks.map(p => (
                <div key={p.name} style={{
                  display: 'flex', gap: 16, alignItems: 'center',
                  padding: '8px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13,
                }}>
                  <span style={{ color: C.txtMuted }}>#{p.pick}</span>
                  <span style={{ flex: 1, fontWeight: 600, color: C.txt }}>{p.name}</span>
                  <span style={{
                    background: C.panel, padding: '2px 8px', borderRadius: 6,
                    fontSize: 11, fontWeight: 700, color: C.txtSub,
                  }}>{p.pos}</span>
                  <span style={{ color: getGradeColor(p.grade), fontWeight: 800 }}>{p.grade}</span>
                  <span style={{ color: C.txtMuted, fontSize: 11 }}>exp {p.expected}</span>
                  <span style={{
                    padding: '2px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800,
                    background: p.delta === 'STEAL' ? C.greenSub : C.redSub,
                    color: getDeltaColor(p.delta),
                    border: `1px solid ${getDeltaColor(p.delta)}40`,
                  }}>{p.delta}</span>
                </div>
              ))}
            </div>
          )) : (
            <div style={{ color: C.txtMuted, textAlign: 'center', padding: '40px 0', fontSize: 14 }}>
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
  { pos: 'S',  dash: 4.55, bench: 20, iq: 19, route: 320 },
];

function CombineMetrics() {
  const stored = (() => {
    try { return JSON.parse(localStorage.getItem('combine-results') ?? 'null'); } catch { return null; }
  })();

  type MetricKey = 'dash' | 'bench' | 'iq' | 'route';
  const [metric, setMetric] = useState<MetricKey>('dash');

  const metricConfig: Record<MetricKey, { label: string; unit: string; higherBetter: boolean; maxVal: number }> = {
    dash:  { label: '40-Yard Dash (s)',   unit: 's',    higherBetter: false, maxVal: 5.5 },
    bench: { label: 'Bench Press (reps)', unit: ' reps', higherBetter: true, maxVal: 40 },
    iq:    { label: 'Wonderlic Score',    unit: ' pts',  higherBetter: true, maxVal: 50 },
    route: { label: 'Route Running',      unit: ' pts',  higherBetter: true, maxVal: 500 },
  };
  const m = metricConfig[metric];

  const maxBarWidth = (val: number) => {
    if (!m.higherBetter) return ((m.maxVal - val) / (m.maxVal - 4.3)) * 100;
    return (val / m.maxVal) * 100;
  };
  const gradeColor = (pct: number) => pct >= 80 ? C.green : pct >= 60 ? C.blueBright : pct >= 40 ? C.gold : C.red;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {stored && (
        <div style={{ background: C.greenSub, border: `1px solid ${C.green}30`, borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.txt, marginBottom: 12 }}>Your Combine Results</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {stored.results?.map((r: { icon: string; label: string; value: string; grade: string }) => (
              <div key={r.label} style={{ background: C.surface, borderRadius: 10, padding: '10px 16px', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{r.icon}</div>
                <div style={{ fontSize: 11, color: C.txtSub, marginBottom: 2 }}>{r.label}</div>
                <div style={{ fontWeight: 700, color: C.txt }}>{r.value}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: gradeColor(70) }}>{r.grade}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 18, fontWeight: 900, color: C.txt }}>
            Overall: <span style={{ color: C.green }}>{stored.overallGrade}</span>
          </div>
        </div>
      )}

      {/* Metric selector */}
      <TabBar
        tabs={(Object.keys(metricConfig) as MetricKey[]).map(k => ({
          id: k, label: metricConfig[k].label.split(' (')[0],
        }))}
        active={metric}
        onChange={k => setMetric(k as MetricKey)}
      />

      {/* Bar chart */}
      <div style={{ background: C.surface, borderRadius: 14, padding: 20, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.txt, marginBottom: 16 }}>{m.label} — Position Averages</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {POSITION_AVERAGES.map(pos => {
            const val = pos[metric as keyof typeof pos] as number;
            const pct = Math.max(5, Math.min(100, maxBarWidth(val)));
            return (
              <div key={pos.pos} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, fontWeight: 800, fontSize: 12, color: C.txtSub }}>{pos.pos}</div>
                <div style={{ flex: 1, height: 22, background: C.border, borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 4, background: gradeColor(pct) }}
                  />
                </div>
                <div style={{ width: 70, textAlign: 'right', fontWeight: 700, fontSize: 13, color: gradeColor(pct) }}>
                  {val}{m.unit}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!stored && (
        <div style={{
          textAlign: 'center', padding: 32,
          background: C.surface, borderRadius: 12, border: `1px dashed ${C.border}`,
          color: C.txtMuted, fontSize: 14,
        }}>
          Play the NFL Combine to see your personal percentile rankings here
        </div>
      )}
    </div>
  );
}

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS: { key: TabKey; label: string }[] = [
  { key: 'league',  label: 'League' },
  { key: 'epa',     label: 'EPA' },
  { key: 'draft',   label: 'Draft' },
  { key: 'combine', label: 'Combine' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AnalyticsDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('league');

  return (
    <AppShell backTo="/" title="Analytics" maxWidth={1100}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', color: C.gold, marginBottom: 6 }}>
          DATA CENTER
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: C.txt, margin: '0 0 6px', letterSpacing: '-.02em' }}>
          Analytics Hub
        </h1>
        <p style={{ color: C.txtSub, fontSize: 13, margin: 0 }}>2026 NFL Season — Live stats, EPA tracking, draft grades, combine metrics.</p>
      </div>

      <TabBar
        tabs={TABS.map(t => ({ id: t.key, label: t.label }))}
        active={activeTab}
        onChange={k => setActiveTab(k as TabKey)}
        style={{ marginBottom: 24 }}
      />

      <SectionHead>
        {TABS.find(t => t.key === activeTab)?.label ?? ''}
      </SectionHead>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'league'  && <LeagueAnalytics />}
          {activeTab === 'epa'     && <EPATracker />}
          {activeTab === 'draft'   && <DraftAnalytics />}
          {activeTab === 'combine' && <CombineMetrics />}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
