import { API_BASE } from '../lib/api';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Prospect } from '../types/draft';
import { PROSPECTS_2025 } from '../data/prospects2025';
import { PROSPECTS_2026 } from '../data/prospects2026';
import { PROSPECTS_2027 } from '../data/prospects2027';

// ─── Design tokens ────────────────────────────────────────────────────────────
const S = {
  bg:       '#0b0f18',
  surface:  '#0f1623',
  elevated: '#141d2e',
  border:   '#1c2d40',
  borderHi: '#253352',
  txt:      '#cdd8e8',
  txtSub:   '#6b82a0',
  txtMuted: '#334560',
  blue:     '#3b7dd8',
  blueSub:  'rgba(59,125,216,0.10)',
  gold:     '#c49a1a',
  goldSub:  'rgba(196,154,26,0.10)',
  green:    '#1e8c4e',
  greenSub: 'rgba(30,140,78,0.10)',
  red:      '#b53838',
  redSub:   'rgba(181,56,56,0.10)',
};

type DraftYear = 2025 | 2026 | 2027 | 2028;
type PositionFilter = 'ALL' | 'QB' | 'RB' | 'WR' | 'TE' | 'OT' | 'OG' | 'EDGE' | 'DT' | 'LB' | 'CB' | 'S';
type RoundFilter = 'All' | 'R1' | 'R2' | 'R3+';

const POSITION_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  QB:   { bg: 'rgba(37,99,235,0.18)',  border: 'rgba(37,99,235,0.4)',  text: '#6699e8' },
  RB:   { bg: 'rgba(22,163,74,0.18)',  border: 'rgba(22,163,74,0.4)',  text: '#55b87a' },
  WR:   { bg: 'rgba(180,100,0,0.18)',  border: 'rgba(180,100,0,0.4)',  text: '#c07820' },
  TE:   { bg: 'rgba(100,30,180,0.18)', border: 'rgba(100,30,180,0.4)', text: '#9966cc' },
  OT:   { bg: 'rgba(60,80,100,0.18)',  border: 'rgba(60,80,100,0.4)',  text: '#7a95aa' },
  OG:   { bg: 'rgba(50,70,90,0.18)',   border: 'rgba(50,70,90,0.4)',   text: '#6a8898' },
  C:    { bg: 'rgba(40,60,80,0.18)',   border: 'rgba(40,60,80,0.4)',   text: '#5a7888' },
  EDGE: { bg: 'rgba(180,35,35,0.18)',  border: 'rgba(180,35,35,0.4)',  text: '#cc5555' },
  DT:   { bg: 'rgba(180,70,20,0.18)',  border: 'rgba(180,70,20,0.4)',  text: '#c06030' },
  LB:   { bg: 'rgba(150,110,0,0.18)',  border: 'rgba(150,110,0,0.4)',  text: '#b88818' },
  OLB:  { bg: 'rgba(150,110,0,0.18)',  border: 'rgba(150,110,0,0.4)',  text: '#b88818' },
  CB:   { bg: 'rgba(10,120,110,0.18)', border: 'rgba(10,120,110,0.4)', text: '#28a898' },
  S:    { bg: 'rgba(5,110,145,0.18)',  border: 'rgba(5,110,145,0.4)',  text: '#2090b8' },
  K:    { bg: 'rgba(60,70,85,0.18)',   border: 'rgba(60,70,85,0.35)',  text: '#7080a0' },
  DE:   { bg: 'rgba(180,35,35,0.18)',  border: 'rgba(180,35,35,0.4)',  text: '#cc5555' },
};

function gradeColor(g: number) {
  if (g >= 90) return S.gold;
  if (g >= 80) return S.blue;
  if (g >= 70) return S.green;
  return S.txtMuted;
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: S.txtMuted, marginBottom: 6 }}>{children}</div>;
}

export function ScoutingPage() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<DraftYear>(2026);
  const [posFilter, setPosFilter] = useState<PositionFilter>('ALL');
  const [roundFilter, setRoundFilter] = useState<RoundFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [classes, setClasses] = useState<Record<number, Prospect[]>>({
    2025: PROSPECTS_2025,
    2026: PROSPECTS_2026,
    2027: PROSPECTS_2027,
  });
  const [loadingYear, setLoadingYear] = useState<number | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [deepDiveText, setDeepDiveText] = useState('');
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);
  const deepDiveRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('gridiron_watchlist');
    if (stored) { try { setWatchlist(JSON.parse(stored)); } catch { /* ignore */ } }
  }, []);

  useEffect(() => {
    [2028].forEach(year => {
      const cached = localStorage.getItem(`gridiron_class_${year}`);
      if (cached) { try { setClasses(prev => ({ ...prev, [year]: JSON.parse(cached) })); } catch { /* ignore */ } }
    });
  }, []);

  useEffect(() => {
    if (deepDiveRef.current) deepDiveRef.current.scrollTop = deepDiveRef.current.scrollHeight;
  }, [deepDiveText]);

  async function fetchClass(year: number) {
    setLoadingYear(year);
    setLoadingError(null);
    try {
      const res = await fetch(API_BASE + '/api/scouting/class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      const data = await res.json();
      setClasses(prev => ({ ...prev, [year]: data.prospects }));
      localStorage.setItem(`gridiron_class_${year}`, JSON.stringify(data.prospects));
    } catch (err: unknown) {
      setLoadingError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoadingYear(null);
    }
  }

  function handleYearSelect(year: DraftYear) {
    setSelectedYear(year);
    setSelectedProspect(null);
    setDeepDiveText('');
    if (!classes[year] && loadingYear !== year) fetchClass(year);
  }

  async function generateDeepDive(prospect: Prospect) {
    setDeepDiveText('');
    setDeepDiveLoading(true);
    try {
      const res = await fetch(API_BASE + '/api/scouting/deep-dive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prospect),
      });
      if (!res.ok || !res.body) throw new Error('Stream failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) setDeepDiveText(prev => prev + decoder.decode(value));
      }
    } catch (err: unknown) {
      setDeepDiveText(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDeepDiveLoading(false);
    }
  }

  function toggleWatchlist(id: string) {
    setWatchlist(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('gridiron_watchlist', JSON.stringify(next));
      return next;
    });
  }

  const currentClass = classes[selectedYear] ?? [];
  const filtered = currentClass
    .filter(p => posFilter === 'ALL' || p.position === posFilter)
    .filter(p => roundFilter === 'All' || (roundFilter === 'R1' && p.round === 1) || (roundFilter === 'R2' && p.round === 2) || (roundFilter === 'R3+' && p.round >= 3))
    .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.college.toLowerCase().includes(searchQuery.toLowerCase()));

  const YEARS: DraftYear[] = [2025, 2026, 2027, 2028];
  const POSITIONS: PositionFilter[] = ['ALL', 'QB', 'RB', 'WR', 'TE', 'OT', 'OG', 'EDGE', 'DT', 'LB', 'CB', 'S'];
  const ROUNDS: RoundFilter[] = ['All', 'R1', 'R2', 'R3+'];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: S.bg, fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}>

      {/* ── TOP BAR ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px', height: 48, background: S.surface, borderBottom: `1px solid ${S.border}`, flexShrink: 0, gap: 16 }}>
        <button onClick={() => navigate('/')} style={{ fontSize: 12, color: S.txtSub, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>← Home</button>
        <div style={{ width: 1, height: 16, background: S.border }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: S.txt }}>Gridiron<span style={{ color: S.gold }}>IQ</span></span>
        <div style={{ width: 1, height: 16, background: S.border }} />
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.txtMuted }}>Scouting Hub — Big Board</span>

        {/* Year tabs */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {YEARS.map(year => (
            <button
              key={year}
              onClick={() => handleYearSelect(year)}
              style={{ fontSize: 12, padding: '5px 14px', borderRadius: 5, background: selectedYear === year ? S.blueSub : 'transparent', border: `1px solid ${selectedYear === year ? 'rgba(59,125,216,0.4)' : S.border}`, color: selectedYear === year ? S.blue : S.txtSub, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {year}
              {loadingYear === year && <span style={{ width: 5, height: 5, borderRadius: '50%', background: S.gold, animation: 'pulse 1s infinite', display: 'inline-block' }} />}
              {!classes[year] && year > 2027 && loadingYear !== year && <span style={{ fontSize: 9, color: S.txtMuted }}>AI</span>}
            </button>
          ))}
        </div>

        {/* Watchlist badge */}
        {watchlist.length > 0 && (
          <div style={{ padding: '4px 10px', borderRadius: 4, background: S.goldSub, border: `1px solid rgba(196,154,26,0.3)`, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 9, color: S.gold }}>★</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: S.gold }}>{watchlist.length} watchlisted</span>
          </div>
        )}
      </div>

      {/* ── MAIN LAYOUT ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── LEFT FILTERS ─────────────────────────────────────────────── */}
        <div style={{ width: 176, flexShrink: 0, borderRight: `1px solid ${S.border}`, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${S.border}` }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search name or school…"
              style={{ width: '100%', background: S.elevated, border: `1px solid ${S.border}`, borderRadius: 5, padding: '5px 8px', fontSize: 11, color: S.txt, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${S.border}` }}>
            <Label>Position</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {POSITIONS.map(pos => {
                const pc = POSITION_COLORS[pos];
                return (
                  <button key={pos} onClick={() => setPosFilter(pos)} style={{ textAlign: 'left', padding: '4px 8px', borderRadius: 4, background: posFilter === pos ? (pc ? pc.bg : S.blueSub) : 'transparent', border: `1px solid ${posFilter === pos ? (pc ? pc.border : S.blue) : 'transparent'}`, color: posFilter === pos ? (pc ? pc.text : S.txt) : S.txtSub, fontSize: 11, fontWeight: posFilter === pos ? 700 : 500, cursor: 'pointer' }}>
                    {pos}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ padding: '10px 12px' }}>
            <Label>Round</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {ROUNDS.map(r => (
                <button key={r} onClick={() => setRoundFilter(r)} style={{ textAlign: 'left', padding: '4px 8px', borderRadius: 4, background: roundFilter === r ? S.blueSub : 'transparent', border: `1px solid ${roundFilter === r ? 'rgba(59,125,216,0.4)' : 'transparent'}`, color: roundFilter === r ? S.blue : S.txtSub, fontSize: 11, fontWeight: roundFilter === r ? 700 : 500, cursor: 'pointer' }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── BIG BOARD TABLE ───────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '42px 36px 1fr 70px 120px 52px 46px 46px 50px', gap: 0, padding: '7px 12px', background: S.elevated, borderBottom: `1px solid ${S.border}`, flexShrink: 0 }}>
            {['#', 'GRD', 'PLAYER', 'POS', 'SCHOOL', 'RD', 'HT', 'WT', '★'].map(col => (
              <div key={col} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: S.txtMuted }}>{col}</div>
            ))}
          </div>

          {/* Loading / empty states */}
          {loadingYear === selectedYear && (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: S.txtSub, fontSize: 12 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: S.gold, animation: 'pulse 1s infinite' }} />
                Generating {selectedYear} Draft Class with AI…
              </div>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ height: 36, borderRadius: 5, background: S.elevated, animation: 'pulse 1.5s infinite', opacity: 1 - i * 0.1 }} />
              ))}
            </div>
          )}

          {loadingError && !classes[selectedYear] && loadingYear !== selectedYear && (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ color: S.red, fontSize: 12, marginBottom: 12 }}>{loadingError}</div>
              <button onClick={() => fetchClass(selectedYear)} style={{ padding: '7px 16px', borderRadius: 5, background: S.elevated, border: `1px solid ${S.border}`, color: S.txtSub, fontSize: 12, cursor: 'pointer' }}>Retry</button>
            </div>
          )}

          {!loadingYear && !classes[selectedYear] && (
            <div style={{ padding: 48, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 32 }}>🔭</div>
              <div style={{ fontSize: 13, color: S.txtSub }}>
                {selectedYear} Draft Class not yet available
              </div>
              <button
                onClick={() => fetchClass(selectedYear)}
                style={{ padding: '9px 20px', borderRadius: 6, background: S.blueSub, border: `1px solid rgba(59,125,216,0.4)`, color: S.blue, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Generate {selectedYear} Class with AI
              </button>
            </div>
          )}

          {/* Prospect rows */}
          {classes[selectedYear] && loadingYear !== selectedYear && (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {/* Row count */}
              <div style={{ padding: '5px 12px', borderBottom: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 9, color: S.txtMuted, letterSpacing: '0.08em' }}>
                  {filtered.length.toLocaleString()} PROSPECTS
                  {posFilter !== 'ALL' && ` · ${posFilter}`}
                  {roundFilter !== 'All' && ` · ${roundFilter}`}
                </span>
                {selectedYear >= 2028 && (
                  <button
                    onClick={() => {
                      localStorage.removeItem(`gridiron_class_${selectedYear}`);
                      setClasses(prev => { const n = { ...prev }; delete n[selectedYear]; return n; });
                    }}
                    style={{ fontSize: 9, color: S.txtMuted, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    ↻ Regenerate
                  </button>
                )}
              </div>

              {filtered.length === 0 && (
                <div style={{ padding: 32, textAlign: 'center', color: S.txtMuted, fontSize: 12 }}>No prospects match your filters</div>
              )}

              {filtered.map((prospect, idx) => {
                const rank = currentClass.indexOf(prospect) + 1;
                const isSelected = selectedProspect?.id === prospect.id;
                const inWatchlist = watchlist.includes(prospect.id);
                const pc = POSITION_COLORS[prospect.position];

                return (
                  <motion.div
                    key={prospect.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(idx * 0.008, 0.3) }}
                    onClick={() => { setSelectedProspect(isSelected ? null : prospect); setDeepDiveText(''); }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '42px 36px 1fr 70px 120px 52px 46px 46px 50px',
                      gap: 0,
                      padding: '7px 12px',
                      borderBottom: `1px solid ${S.border}`,
                      cursor: 'pointer',
                      background: isSelected ? S.blueSub : 'transparent',
                      transition: 'background 0.1s',
                    }}
                  >
                    {/* Rank */}
                    <div style={{ fontSize: 10, color: S.txtMuted, fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center' }}>{rank}</div>

                    {/* Grade */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: 28, height: 22, borderRadius: 4, background: `${gradeColor(prospect.grade)}18`, border: `1px solid ${gradeColor(prospect.grade)}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: gradeColor(prospect.grade), fontVariantNumeric: 'tabular-nums' }}>
                        {prospect.grade % 1 === 0 ? prospect.grade : prospect.grade.toFixed(1)}
                      </div>
                    </div>

                    {/* Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                      {inWatchlist && <span style={{ fontSize: 9, color: S.gold, flexShrink: 0 }}>★</span>}
                      <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? '#a8c6f0' : S.txt, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {prospect.name}
                      </span>
                      {prospect.draftStockTrend === 'rising' && <span style={{ fontSize: 10, color: S.green, flexShrink: 0 }}>↑</span>}
                      {prospect.draftStockTrend === 'falling' && <span style={{ fontSize: 10, color: S.red, flexShrink: 0 }}>↓</span>}
                    </div>

                    {/* Position */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {pc && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: pc.bg, border: `1px solid ${pc.border}`, color: pc.text }}>
                          {prospect.position}
                        </span>
                      )}
                    </div>

                    {/* College */}
                    <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                      <span style={{ fontSize: 11, color: S.txtSub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prospect.college}</span>
                    </div>

                    {/* Round */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: prospect.round === 1 ? S.gold : S.txtSub, fontWeight: prospect.round === 1 ? 700 : 400 }}>Rd {prospect.round}</span>
                    </div>

                    {/* Height */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: S.txtMuted, fontVariantNumeric: 'tabular-nums' }}>{prospect.height || '—'}</span>
                    </div>

                    {/* Weight */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: S.txtMuted, fontVariantNumeric: 'tabular-nums' }}>{prospect.weight || '—'}</span>
                    </div>

                    {/* Watchlist toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <button
                        onClick={e => { e.stopPropagation(); toggleWatchlist(prospect.id); }}
                        style={{ fontSize: 13, color: inWatchlist ? S.gold : S.txtMuted, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
                      >
                        {inWatchlist ? '★' : '☆'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── SCOUT REPORT PANEL ────────────────────────────────────────── */}
        <AnimatePresence>
          {selectedProspect && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{ width: 320, flexShrink: 0, borderLeft: `1px solid ${S.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: S.surface }}
            >

              {/* Report header */}
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: S.txtMuted }}>Scout Report</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => toggleWatchlist(selectedProspect.id)} style={{ fontSize: 14, color: watchlist.includes(selectedProspect.id) ? S.gold : S.txtMuted, background: 'none', border: 'none', cursor: 'pointer' }}>
                    {watchlist.includes(selectedProspect.id) ? '★' : '☆'}
                  </button>
                  <button onClick={() => { setSelectedProspect(null); setDeepDiveText(''); }} style={{ fontSize: 16, color: S.txtMuted, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>

                {/* Player header */}
                <div style={{ padding: '14px', borderBottom: `1px solid ${S.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: S.txt, lineHeight: 1.2 }}>{selectedProspect.name}</div>
                      <div style={{ fontSize: 11, color: S.txtSub, marginTop: 3 }}>{selectedProspect.college}</div>
                    </div>
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: `${gradeColor(selectedProspect.grade)}15`, border: `1px solid ${gradeColor(selectedProspect.grade)}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: gradeColor(selectedProspect.grade), fontSize: 15, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                      {selectedProspect.grade % 1 === 0 ? selectedProspect.grade : selectedProspect.grade.toFixed(1)}
                    </div>
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                    {(() => { const pc = POSITION_COLORS[selectedProspect.position]; return pc ? (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: pc.bg, border: `1px solid ${pc.border}`, color: pc.text }}>{selectedProspect.position}</span>
                    ) : null; })()}
                    <span style={{ fontSize: 10, color: S.txtSub, padding: '2px 5px', borderRadius: 4, background: S.elevated, border: `1px solid ${S.border}` }}>Round {selectedProspect.round}</span>
                    {selectedProspect.year && <span style={{ fontSize: 10, color: S.txtMuted, padding: '2px 5px', borderRadius: 4, background: S.elevated, border: `1px solid ${S.border}` }}>{selectedProspect.year} Class</span>}
                    {selectedProspect.draftStockTrend === 'rising' && <span style={{ fontSize: 10, color: S.green }}>↑ Rising</span>}
                    {selectedProspect.draftStockTrend === 'falling' && <span style={{ fontSize: 10, color: S.red }}>↓ Falling</span>}
                  </div>

                  {/* Measurables */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                    {[
                      { label: 'Height', value: selectedProspect.height || '—' },
                      { label: 'Weight', value: selectedProspect.weight ? `${selectedProspect.weight}` : '—' },
                      { label: '40-Yd', value: selectedProspect.fortyTime ? `${selectedProspect.fortyTime}s` : '—' },
                    ].map(m => (
                      <div key={m.label} style={{ padding: '6px 8px', borderRadius: 6, background: S.elevated, border: `1px solid ${S.border}`, textAlign: 'center' }}>
                        <div style={{ fontSize: 9, color: S.txtMuted, marginBottom: 2 }}>{m.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: S.txt }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                {selectedProspect.description && (
                  <div style={{ padding: '12px 14px', borderBottom: `1px solid ${S.border}` }}>
                    <Label>Summary</Label>
                    <p style={{ fontSize: 11, color: S.txtSub, lineHeight: 1.6, margin: 0 }}>{selectedProspect.description}</p>
                  </div>
                )}

                {/* Strengths / Weaknesses */}
                {((selectedProspect.strengths?.length ?? 0) > 0 || (selectedProspect.weaknesses?.length ?? 0) > 0) && (
                  <div style={{ padding: '12px 14px', borderBottom: `1px solid ${S.border}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <Label>Strengths</Label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {(selectedProspect.strengths ?? []).slice(0, 4).map(s => (
                          <div key={s} style={{ fontSize: 10, color: S.txtSub, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                            <span style={{ color: S.green, flexShrink: 0, marginTop: 1 }}>+</span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Concerns</Label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {(selectedProspect.weaknesses ?? []).slice(0, 4).map(w => (
                          <div key={w} style={{ fontSize: 10, color: S.txtSub, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                            <span style={{ color: S.red, flexShrink: 0, marginTop: 1 }}>−</span>
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Traits */}
                {(selectedProspect.traits?.length ?? 0) > 0 && (
                  <div style={{ padding: '10px 14px', borderBottom: `1px solid ${S.border}` }}>
                    <Label>Scouting Tags</Label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {selectedProspect.traits!.map(t => (
                        <span key={t} style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: S.elevated, border: `1px solid ${S.border}`, color: S.txtSub }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* NFL Comp */}
                {selectedProspect.comparableTo && (
                  <div style={{ padding: '10px 14px', borderBottom: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: S.txtMuted }}>NFL Comp</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: S.blue }}>{selectedProspect.comparableTo}</span>
                  </div>
                )}

                {/* AI Deep Dive */}
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Label>AI Deep Dive</Label>
                    {deepDiveText && !deepDiveLoading && (
                      <button onClick={() => generateDeepDive(selectedProspect)} style={{ fontSize: 9, color: S.txtMuted, background: 'none', border: 'none', cursor: 'pointer' }}>↻ Regenerate</button>
                    )}
                  </div>

                  {!deepDiveText && !deepDiveLoading && (
                    <button
                      onClick={() => generateDeepDive(selectedProspect)}
                      style={{ width: '100%', padding: '9px', borderRadius: 6, background: S.blueSub, border: `1px solid rgba(59,125,216,0.3)`, color: S.blue, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Generate Full Scout Report
                    </button>
                  )}

                  {deepDiveLoading && !deepDiveText && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: S.txtMuted, fontSize: 11 }}>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: S.blue, animation: 'bounce 0.8s infinite', animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                      Analyzing tape…
                    </div>
                  )}

                  {deepDiveText && (
                    <div ref={deepDiveRef} style={{ fontSize: 11, color: S.txtSub, lineHeight: 1.65, maxHeight: 280, overflowY: 'auto' }}>
                      {deepDiveText.split('\n\n').map((para, i) => (
                        <p key={i} style={{ margin: '0 0 10px', fontWeight: para.startsWith('**') ? 600 : 400, color: para.startsWith('**') ? S.txt : S.txtSub }}>
                          {para.replace(/\*\*/g, '')}
                        </p>
                      ))}
                      {deepDiveLoading && <span style={{ display: 'inline-block', width: 8, height: 12, background: S.txtMuted, animation: 'pulse 0.8s infinite', borderRadius: 2 }} />}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
