import { API_BASE } from '../lib/api';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Prospect } from '../types/draft';
import { PROSPECTS_2025 } from '../data/prospects2025';
import { PROSPECTS_2026 } from '../data/prospects2026';
import { PROSPECTS_2027 } from '../data/prospects2027';
import { C, GLOBAL_CSS, Badge } from '../components/AppShell';

// ─── Types ────────────────────────────────────────────────────────────────────

type DraftYear = 2025 | 2026 | 2027 | 2028;
type PositionFilter = 'ALL' | 'QB' | 'RB' | 'WR' | 'TE' | 'OT' | 'OG' | 'EDGE' | 'DT' | 'LB' | 'CB' | 'S';
type RoundFilter = 'All' | 'R1' | 'R2' | 'R3+';

// ─── Position color map ───────────────────────────────────────────────────────

const POS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
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
  if (g >= 90) return C.gold;
  if (g >= 80) return C.blueBright;
  if (g >= 70) return C.green;
  return C.txtMuted;
}

function PosBadge({ pos }: { pos: string }) {
  const pc = POS_COLORS[pos];
  if (!pc) return <span style={{ fontSize: 10, color: C.txtMuted }}>{pos}</span>;
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase',
      padding: '2px 7px', borderRadius: 5,
      background: pc.bg, border: `1px solid ${pc.border}`, color: pc.text,
    }}>
      {pos}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
    <>
      <style>{GLOBAL_CSS}</style>
      <style>{`
        @media (max-width: 768px) {
          .scouting-sidebar { display: none !important; }
          .scouting-board-header { grid-template-columns: 40px 36px 1fr 56px 40px 28px !important; }
          .scouting-board-row { grid-template-columns: 40px 36px 1fr 56px 40px 28px !important; }
          .scouting-board-header > *:nth-child(5),
          .scouting-board-header > *:nth-child(6),
          .scouting-board-header > *:nth-child(7),
          .scouting-board-header > *:nth-child(8),
          .scouting-board-row > *:nth-child(5),
          .scouting-board-row > *:nth-child(6),
          .scouting-board-row > *:nth-child(7),
          .scouting-board-row > *:nth-child(8) { display: none !important; }
          .scouting-scout-panel { width: 100% !important; position: fixed !important; inset: 0 !important; z-index: 300; overflow-y: auto !important; }
          .scouting-mobile-search { display: flex !important; }
        }
        .scouting-mobile-search { display: none; }
      `}</style>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: C.bg, fontFamily: C.font, overflow: 'hidden', color: C.txt }}>

        {/* ── TOP NAV ── */}
        <nav style={{
          display: 'flex', alignItems: 'center', padding: '0 20px', height: 56, flexShrink: 0,
          background: 'rgba(5,8,15,.93)', backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${C.border}`, gap: 12, zIndex: 100,
        }}>
          {/* Back */}
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none', border: `1px solid ${C.border}`,
              borderRadius: 8, color: C.txtSub, cursor: 'pointer',
              fontSize: 12, fontWeight: 700, padding: '6px 12px',
              transition: 'border-color 160ms, color 160ms', flexShrink: 0,
            }}
            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = C.borderHi; b.style.color = C.txt; }}
            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = C.border; b.style.color = C.txtSub; }}
          >
            ← Home
          </button>

          <span style={{ color: C.border, fontSize: 16 }}>|</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.txt, letterSpacing: '-.01em' }}>Scouting Hub</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: C.txtMuted }}>· Big Board</span>

          {/* Year selector */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 9, padding: 3 }}>
            {YEARS.map(year => (
              <button
                key={year}
                onClick={() => handleYearSelect(year)}
                style={{
                  fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 6,
                  background: selectedYear === year ? C.elevated : 'transparent',
                  border: selectedYear === year ? `1px solid ${C.borderHi}` : '1px solid transparent',
                  color: selectedYear === year ? C.txt : C.txtSub,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 140ms',
                }}
              >
                {year}
                {loadingYear === year && (
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.gold, animation: 'pulse 1s infinite', display: 'inline-block' }} />
                )}
                {!classes[year] && year > 2027 && loadingYear !== year && (
                  <span style={{ fontSize: 8, color: C.purple, fontWeight: 800 }}>AI</span>
                )}
              </button>
            ))}
          </div>

          {/* Watchlist badge */}
          {watchlist.length > 0 && (
            <Badge color={C.gold} dot>
              {watchlist.length} watching
            </Badge>
          )}
        </nav>

        {/* ── MOBILE SEARCH BAR (hidden on desktop via CSS) ── */}
        <div className="scouting-mobile-search" style={{ padding: '8px 12px', borderBottom: `1px solid ${C.border}`, background: C.surface, gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search player or school…"
            style={{
              flex: 1, background: C.panel, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: '7px 10px', fontSize: 12, color: C.txt,
              outline: 'none',
            }}
          />
          <select
            value={posFilter}
            onChange={e => setPosFilter(e.target.value as PositionFilter)}
            style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 8px', fontSize: 12, color: C.txt, outline: 'none' }}
          >
            {(['ALL', 'QB', 'RB', 'WR', 'TE', 'OT', 'OG', 'EDGE', 'DT', 'LB', 'CB', 'S'] as PositionFilter[]).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* ── LEFT SIDEBAR FILTERS ── */}
          <div className="scouting-sidebar" style={{
            width: 180, flexShrink: 0, display: 'flex', flexDirection: 'column',
            borderRight: `1px solid ${C.border}`, overflowY: 'auto', background: C.surface,
          }}>
            {/* Search */}
            <div style={{ padding: '12px', borderBottom: `1px solid ${C.border}` }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name or school…"
                style={{
                  width: '100%', background: C.panel, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: '7px 10px', fontSize: 11, color: C.txt,
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 160ms',
                }}
                onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = C.borderFoc}
                onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = C.border}
              />
            </div>

            {/* Position filter */}
            <div style={{ padding: '10px 10px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.txtMuted, marginBottom: 6 }}>Position</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {POSITIONS.map(pos => {
                  const pc = POS_COLORS[pos];
                  const active = posFilter === pos;
                  return (
                    <button
                      key={pos}
                      onClick={() => setPosFilter(pos)}
                      style={{
                        textAlign: 'left', padding: '5px 8px', borderRadius: 6,
                        background: active ? (pc ? pc.bg : C.blueSub) : 'transparent',
                        border: `1px solid ${active ? (pc ? pc.border : C.borderFoc) : 'transparent'}`,
                        color: active ? (pc ? pc.text : C.blueBright) : C.txtSub,
                        fontSize: 11, fontWeight: active ? 800 : 500,
                        cursor: 'pointer', transition: 'all 120ms',
                      }}
                    >
                      {pos}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Round filter */}
            <div style={{ padding: '10px 10px' }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.txtMuted, marginBottom: 6 }}>Round</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {ROUNDS.map(r => (
                  <button
                    key={r}
                    onClick={() => setRoundFilter(r)}
                    style={{
                      textAlign: 'left', padding: '5px 8px', borderRadius: 6,
                      background: roundFilter === r ? C.blueSub : 'transparent',
                      border: `1px solid ${roundFilter === r ? C.borderFoc : 'transparent'}`,
                      color: roundFilter === r ? C.blueBright : C.txtSub,
                      fontSize: 11, fontWeight: roundFilter === r ? 800 : 500,
                      cursor: 'pointer', transition: 'all 120ms',
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── BIG BOARD ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Table header */}
            <div className="scouting-board-header" style={{
              display: 'grid',
              gridTemplateColumns: '46px 44px 1fr 72px 130px 56px 48px 48px 48px',
              padding: '8px 14px',
              background: C.panel, borderBottom: `1px solid ${C.border}`,
              flexShrink: 0,
            }}>
              {['#', 'GRD', 'PLAYER', 'POS', 'SCHOOL', 'RD', 'HT', 'WT', '★'].map(col => (
                <div key={col} style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.12em', color: C.txtMuted, textTransform: 'uppercase' }}>{col}</div>
              ))}
            </div>

            {/* Loading state */}
            {loadingYear === selectedYear && (
              <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.txtSub, fontSize: 12, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.gold, animation: 'pulse 1s infinite' }} />
                  Generating {selectedYear} Draft Class with AI…
                </div>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} style={{
                    height: 38, borderRadius: 8,
                    background: `linear-gradient(90deg, ${C.panel}, ${C.elevated}, ${C.panel})`,
                    opacity: 1 - i * 0.08, animation: 'pulse 1.8s infinite',
                    animationDelay: `${i * 0.06}s`,
                  }} />
                ))}
              </div>
            )}

            {/* Error state */}
            {loadingError && !classes[selectedYear] && loadingYear !== selectedYear && (
              <div style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 28 }}>⚠️</div>
                <div style={{ color: C.red, fontSize: 13, fontWeight: 600 }}>{loadingError}</div>
                <button
                  onClick={() => fetchClass(selectedYear)}
                  style={{
                    padding: '9px 20px', borderRadius: 8, background: C.redSub,
                    border: `1px solid ${C.red}40`, color: C.red,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty / generate state */}
            {!loadingYear && !classes[selectedYear] && (
              <div style={{ padding: 56, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 40 }}>🔭</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.txt }}>{selectedYear} Draft Class</div>
                <div style={{ fontSize: 13, color: C.txtSub, maxWidth: 280, lineHeight: 1.6 }}>
                  This class hasn't been generated yet. Use AI to build a realistic prospect board.
                </div>
                <button
                  onClick={() => fetchClass(selectedYear)}
                  style={{
                    padding: '11px 24px', borderRadius: 10,
                    background: `linear-gradient(135deg, ${C.purple}, ${C.blue})`,
                    border: 'none', color: '#fff', fontSize: 13, fontWeight: 800,
                    cursor: 'pointer', letterSpacing: '.03em',
                    boxShadow: `0 4px 20px ${C.purple}40`,
                  }}
                >
                  Generate {selectedYear} Class with AI
                </button>
              </div>
            )}

            {/* Prospect list */}
            {classes[selectedYear] && loadingYear !== selectedYear && (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {/* Count bar */}
                <div style={{
                  padding: '6px 14px', borderBottom: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: C.bg,
                }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: C.txtMuted, letterSpacing: '.1em' }}>
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
                      style={{ fontSize: 9, color: C.txtMuted, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    >
                      ↻ Regenerate
                    </button>
                  )}
                </div>

                {filtered.length === 0 && (
                  <div style={{ padding: 40, textAlign: 'center', color: C.txtMuted, fontSize: 13 }}>
                    No prospects match your filters
                  </div>
                )}

                {filtered.map((prospect, idx) => {
                  const rank = currentClass.indexOf(prospect) + 1;
                  const isSelected = selectedProspect?.id === prospect.id;
                  const inWatchlist = watchlist.includes(prospect.id);
                  const gc = gradeColor(prospect.grade);

                  return (
                    <motion.div
                      key={prospect.id}
                      className="scouting-board-row"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(idx * 0.007, 0.25) }}
                      onClick={() => { setSelectedProspect(isSelected ? null : prospect); setDeepDiveText(''); }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '46px 44px 1fr 72px 130px 56px 48px 48px 48px',
                        padding: '8px 14px',
                        borderBottom: `1px solid ${C.border}`,
                        cursor: 'pointer',
                        background: isSelected
                          ? `linear-gradient(90deg, ${C.blueSub}, transparent)`
                          : 'transparent',
                        borderLeft: isSelected ? `2px solid ${C.blueBright}` : '2px solid transparent',
                        transition: 'background 120ms, border-color 120ms',
                      }}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = C.panel; }}
                      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                    >
                      {/* Rank */}
                      <div style={{ display: 'flex', alignItems: 'center', fontSize: 10, color: C.txtMuted, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                        {rank}
                      </div>

                      {/* Grade */}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                          width: 30, height: 24, borderRadius: 6,
                          background: `color-mix(in srgb, ${gc} 12%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${gc} 35%, transparent)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 800, color: gc, fontVariantNumeric: 'tabular-nums',
                        }}>
                          {prospect.grade % 1 === 0 ? prospect.grade : prospect.grade.toFixed(1)}
                        </div>
                      </div>

                      {/* Name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                        {inWatchlist && <span style={{ fontSize: 10, color: C.gold, flexShrink: 0 }}>★</span>}
                        <span style={{
                          fontSize: 12, fontWeight: 700,
                          color: isSelected ? C.blueBright : C.txt,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {prospect.name}
                        </span>
                        {prospect.draftStockTrend === 'rising' && <span style={{ fontSize: 11, color: C.green, flexShrink: 0 }}>↑</span>}
                        {prospect.draftStockTrend === 'falling' && <span style={{ fontSize: 11, color: C.red, flexShrink: 0 }}>↓</span>}
                      </div>

                      {/* Position */}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <PosBadge pos={prospect.position} />
                      </div>

                      {/* College */}
                      <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                        <span style={{ fontSize: 11, color: C.txtSub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prospect.college}
                        </span>
                      </div>

                      {/* Round */}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{
                          fontSize: 11, fontWeight: prospect.round === 1 ? 800 : 500,
                          color: prospect.round === 1 ? C.gold : C.txtSub,
                        }}>
                          Rd {prospect.round}
                        </span>
                      </div>

                      {/* Height */}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: C.txtMuted, fontVariantNumeric: 'tabular-nums' }}>
                          {prospect.height || '—'}
                        </span>
                      </div>

                      {/* Weight */}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: C.txtMuted, fontVariantNumeric: 'tabular-nums' }}>
                          {prospect.weight || '—'}
                        </span>
                      </div>

                      {/* Watchlist */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button
                          onClick={e => { e.stopPropagation(); toggleWatchlist(prospect.id); }}
                          style={{
                            fontSize: 14, color: inWatchlist ? C.gold : C.txtMuted,
                            background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1,
                            transition: 'color 120ms, transform 120ms',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.2)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
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

          {/* ── SCOUT REPORT PANEL ── */}
          <AnimatePresence>
            {selectedProspect && (() => {
              const gc = gradeColor(selectedProspect.grade);
              const pc = POS_COLORS[selectedProspect.position];
              const inWatchlist = watchlist.includes(selectedProspect.id);

              return (
                <motion.div
                  className="scouting-scout-panel"
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  style={{
                    width: 340, flexShrink: 0,
                    borderLeft: `1px solid ${C.border}`,
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden', background: C.surface,
                  }}
                >
                  {/* Panel header */}
                  <div style={{
                    padding: '12px 16px', borderBottom: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: C.panel, flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: C.txtMuted }}>
                      Scout Report
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button
                        onClick={() => toggleWatchlist(selectedProspect.id)}
                        style={{ fontSize: 16, color: inWatchlist ? C.gold : C.txtMuted, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 120ms' }}
                        title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                      >
                        {inWatchlist ? '★' : '☆'}
                      </button>
                      <button
                        onClick={() => { setSelectedProspect(null); setDeepDiveText(''); }}
                        style={{ fontSize: 18, color: C.txtMuted, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, transition: 'color 120ms' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.txt; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.txtMuted; }}
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto' }}>

                    {/* ── Player hero block ── */}
                    <div style={{
                      padding: '18px 16px 16px',
                      borderBottom: `1px solid ${C.border}`,
                      background: `linear-gradient(135deg, color-mix(in srgb, ${gc} 8%, transparent), transparent)`,
                      position: 'relative', overflow: 'hidden',
                    }}>
                      {/* Glow */}
                      <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: `${gc}18`, filter: 'blur(40px)', pointerEvents: 'none' }} />
                      {/* Bottom bar */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${gc}60, transparent)` }} />

                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 18, fontWeight: 900, color: C.txt, letterSpacing: '-.02em', lineHeight: 1.1, marginBottom: 3 }}>
                            {selectedProspect.name}
                          </div>
                          <div style={{ fontSize: 12, color: C.txtSub, fontWeight: 500 }}>
                            {selectedProspect.college}
                          </div>
                        </div>
                        {/* Grade orb */}
                        <div style={{
                          width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                          background: `color-mix(in srgb, ${gc} 14%, ${C.panel})`,
                          border: `2px solid color-mix(in srgb, ${gc} 50%, transparent)`,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          boxShadow: `0 0 20px ${gc}30`,
                        }}>
                          <span style={{ fontSize: 17, fontWeight: 900, color: gc, letterSpacing: '-.02em', lineHeight: 1 }}>
                            {selectedProspect.grade % 1 === 0 ? selectedProspect.grade : selectedProspect.grade.toFixed(1)}
                          </span>
                          <span style={{ fontSize: 8, fontWeight: 700, color: C.txtMuted, letterSpacing: '.08em', marginTop: 1 }}>GRD</span>
                        </div>
                      </div>

                      {/* Badges row */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                        {pc && (
                          <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 6, background: pc.bg, border: `1px solid ${pc.border}`, color: pc.text }}>
                            {selectedProspect.position}
                          </span>
                        )}
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: C.panel, border: `1px solid ${C.border}`, color: C.txtSub }}>
                          Round {selectedProspect.round}
                        </span>
                        {selectedProspect.year && (
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: C.panel, border: `1px solid ${C.border}`, color: C.txtMuted }}>
                            {selectedProspect.year} Class
                          </span>
                        )}
                        {selectedProspect.draftStockTrend === 'rising' && (
                          <span style={{ fontSize: 10, color: C.green, fontWeight: 700 }}>↑ Rising</span>
                        )}
                        {selectedProspect.draftStockTrend === 'falling' && (
                          <span style={{ fontSize: 10, color: C.red, fontWeight: 700 }}>↓ Falling</span>
                        )}
                      </div>

                      {/* Measurables */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                        {[
                          { label: 'Height', value: selectedProspect.height || '—' },
                          { label: 'Weight', value: selectedProspect.weight ? `${selectedProspect.weight}` : '—' },
                          { label: '40-Yd', value: selectedProspect.fortyTime ? `${selectedProspect.fortyTime}s` : '—' },
                        ].map(m => (
                          <div key={m.label} style={{
                            padding: '7px 8px', borderRadius: 8,
                            background: C.panel, border: `1px solid ${C.border}`, textAlign: 'center',
                          }}>
                            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.txtMuted, marginBottom: 3 }}>
                              {m.label}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: C.txt }}>{m.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    {selectedProspect.description && (
                      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.txtMuted, marginBottom: 8 }}>Summary</div>
                        <p style={{ fontSize: 11, color: C.txtSub, lineHeight: 1.65, margin: 0 }}>
                          {selectedProspect.description}
                        </p>
                      </div>
                    )}

                    {/* Strengths / Concerns */}
                    {((selectedProspect.strengths?.length ?? 0) > 0 || (selectedProspect.weaknesses?.length ?? 0) > 0) && (
                      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.green, marginBottom: 8 }}>Strengths</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {(selectedProspect.strengths ?? []).slice(0, 4).map(s => (
                              <div key={s} style={{ fontSize: 10, color: C.txtSub, display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                                <span style={{ color: C.green, flexShrink: 0, fontWeight: 900, marginTop: 1 }}>+</span>
                                <span>{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.red, marginBottom: 8 }}>Concerns</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {(selectedProspect.weaknesses ?? []).slice(0, 4).map(w => (
                              <div key={w} style={{ fontSize: 10, color: C.txtSub, display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                                <span style={{ color: C.red, flexShrink: 0, fontWeight: 900, marginTop: 1 }}>−</span>
                                <span>{w}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Traits */}
                    {(selectedProspect.traits?.length ?? 0) > 0 && (
                      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.txtMuted, marginBottom: 8 }}>Scouting Tags</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {selectedProspect.traits!.map(t => (
                            <span key={t} style={{
                              fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                              background: C.panel, border: `1px solid ${C.border}`, color: C.txtSub,
                            }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* NFL Comp */}
                    {selectedProspect.comparableTo && (
                      <div style={{
                        padding: '12px 16px', borderBottom: `1px solid ${C.border}`,
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}>
                        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.txtMuted }}>NFL Comp</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: C.blueBright }}>{selectedProspect.comparableTo}</span>
                      </div>
                    )}

                    {/* ── AI Deep Dive ── */}
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.purple, boxShadow: `0 0 8px ${C.purple}` }} />
                          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.purple }}>
                            AI Deep Dive
                          </span>
                        </div>
                        {deepDiveText && !deepDiveLoading && (
                          <button
                            onClick={() => generateDeepDive(selectedProspect)}
                            style={{ fontSize: 9, fontWeight: 700, color: C.txtMuted, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 120ms' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.txt; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.txtMuted; }}
                          >
                            ↻ Regenerate
                          </button>
                        )}
                      </div>

                      {/* Generate button */}
                      {!deepDiveText && !deepDiveLoading && (
                        <button
                          onClick={() => generateDeepDive(selectedProspect)}
                          style={{
                            width: '100%', padding: '11px', borderRadius: 10,
                            background: `linear-gradient(135deg, ${C.purple}22, ${C.blue}22)`,
                            border: `1px solid ${C.purple}40`,
                            color: C.txt, fontSize: 12, fontWeight: 800,
                            cursor: 'pointer', letterSpacing: '.02em',
                            transition: 'all 160ms',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          }}
                          onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = `linear-gradient(135deg, ${C.purple}35, ${C.blue}35)`; b.style.borderColor = `${C.purple}70`; }}
                          onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = `linear-gradient(135deg, ${C.purple}22, ${C.blue}22)`; b.style.borderColor = `${C.purple}40`; }}
                        >
                          <span style={{ fontSize: 14 }}>🔮</span>
                          Generate Full Scout Report
                        </button>
                      )}

                      {/* Loading animation */}
                      {deepDiveLoading && !deepDiveText && (
                        <div style={{
                          padding: '16px', borderRadius: 10,
                          background: `linear-gradient(135deg, ${C.purple}10, ${C.blue}10)`,
                          border: `1px solid ${C.purple}25`,
                          display: 'flex', alignItems: 'center', gap: 12, color: C.txtSub, fontSize: 11,
                        }}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {[0, 1, 2].map(i => (
                              <div
                                key={i}
                                style={{
                                  width: 6, height: 6, borderRadius: '50%',
                                  background: C.purple,
                                  animation: 'pulse 0.9s infinite',
                                  animationDelay: `${i * 0.18}s`,
                                }}
                              />
                            ))}
                          </div>
                          Analyzing tape with Claude AI…
                        </div>
                      )}

                      {/* Deep dive text */}
                      {deepDiveText && (
                        <div
                          ref={deepDiveRef}
                          style={{
                            fontSize: 11, color: C.txtSub, lineHeight: 1.7,
                            maxHeight: 320, overflowY: 'auto',
                            padding: '12px 14px', borderRadius: 10,
                            background: C.panel, border: `1px solid ${C.border}`,
                          }}
                        >
                          {deepDiveText.split('\n\n').map((para, i) => (
                            <p key={i} style={{
                              margin: '0 0 10px',
                              color: para.startsWith('**') ? C.txt : C.txtSub,
                              fontWeight: para.startsWith('**') ? 700 : 400,
                            }}>
                              {para.replace(/\*\*/g, '')}
                            </p>
                          ))}
                          {deepDiveLoading && (
                            <span style={{
                              display: 'inline-block', width: 8, height: 13,
                              background: C.purple, borderRadius: 2,
                              animation: 'pulse 0.7s infinite',
                            }} />
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

        </div>
      </div>
    </>
  );
}
