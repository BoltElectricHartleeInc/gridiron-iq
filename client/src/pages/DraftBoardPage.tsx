import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraftStore } from '../store/draftStore';
import { NFL_TEAMS } from '../data/teams';
import { ProspectCard } from '../components/draft/ProspectCard';
import { DraftBoard, POSITION_COLORS } from '../components/draft/DraftBoard';
import { TradeModal } from '../components/draft/TradeModal';
import { PickClock } from '../components/draft/PickClock';
import { ProspectCompare } from '../components/draft/ProspectCompare';
import { IncomingTradeOffer } from '../components/draft/IncomingTradeOffer';
import type { Prospect, DraftSession } from '../types/draft';

// ─── Design tokens ────────────────────────────────────────────────────────────
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
  goldSub:   'rgba(196,154,26,0.10)',
  green:     '#1e8c4e',
  greenSub:  'rgba(30,140,78,0.12)',
  red:       '#b53838',
  redSub:    'rgba(181,56,56,0.12)',
};

// ─── Label component ──────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.txtMuted }}>
      {children}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHead({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: `1px solid ${S.border}`, background: S.elevated }}>
      <Label>{children}</Label>
      {right}
    </div>
  );
}

// ─── Grade badge ──────────────────────────────────────────────────────────────
function GradeBadge({ grade, size = 'md' }: { grade: number; size?: 'sm' | 'md' }) {
  const color = grade >= 90 ? '#c49a1a' : grade >= 80 ? '#3b7dd8' : grade >= 70 ? '#1e8c4e' : '#334560';
  const bg    = grade >= 90 ? 'rgba(196,154,26,0.15)' : grade >= 80 ? 'rgba(59,125,216,0.15)' : grade >= 70 ? 'rgba(30,140,78,0.15)' : 'rgba(255,255,255,0.04)';
  const w = size === 'sm' ? 28 : 34;
  return (
    <div style={{ width: w, height: w, borderRadius: 6, background: bg, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color, fontSize: size === 'sm' ? 10 : 11, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
      {grade % 1 === 0 ? grade : grade.toFixed(1)}
    </div>
  );
}

// ─── Position badge ───────────────────────────────────────────────────────────
function PosBadge({ position }: { position: string }) {
  const c = POSITION_COLORS[position] ?? POSITION_COLORS['K'];
  return (
    <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: c.bg, border: `1px solid ${c.border}`, color: c.text, flexShrink: 0, letterSpacing: '0.04em' }}>
      {position}
    </span>
  );
}

// ─── Value indicator ──────────────────────────────────────────────────────────
function ValueBadge({ prospect, pickNumber }: { prospect: Prospect; pickNumber: number }) {
  // Compare player's actual grade to what's expected at this pick on the draft curve
  const expectedGrade = Math.max(55, 99 - pickNumber * 0.145);
  const delta = prospect.grade - expectedGrade;
  if (delta >= 7)  return <span style={{ fontSize: '9px', fontWeight: 700, color: S.green, letterSpacing: '0.05em' }}>STEAL</span>;
  if (delta <= -6) return <span style={{ fontSize: '9px', fontWeight: 700, color: S.red, letterSpacing: '0.05em' }}>REACH</span>;
  return <span style={{ fontSize: '9px', fontWeight: 600, color: S.blue, letterSpacing: '0.05em' }}>VALUE</span>;
}

// Local fallback advisor — works without API
const ADVISOR_POS_VALUE: Record<string, number> = {
  QB: 100, EDGE: 90, OT: 85, CB: 82, WR: 80,
  DT: 75, S: 70, LB: 68, TE: 65, OG: 60,
  RB: 55, C: 50, K: 20, P: 20,
};

function generateLocalAdvice(params: {
  teamNeeds: string[];
  availableProspects: Array<{ name: string; position: string; college: string; grade: number; round: number }>;
  pickNumber: number;
  round: number;
  needsWeight: number;
}): string {
  const { teamNeeds, availableProspects, pickNumber, round, needsWeight } = params;
  if (availableProspects.length === 0) return 'PICK: No prospects available\nFIT: Board is empty.\nINTEL: Draft complete.\nCONCERN: None.';

  const nw = needsWeight / 100;
  const scored = availableProspects.map(p => {
    const bpa = p.grade;
    const needIdx = teamNeeds.indexOf(p.position);
    const needScore = needIdx === -1 ? 30 : Math.max(0, 100 - needIdx * 20);
    const posScore = ADVISOR_POS_VALUE[p.position] ?? 50;
    const score = bpa * (1 - nw) + needScore * nw + posScore * 0.08;
    return { p, score };
  }).sort((a, b) => b.score - a.score);

  const top = scored[0].p;
  const second = scored[1]?.p;

  const needIdx = teamNeeds.indexOf(top.position);
  const fitReason = needIdx === 0
    ? `addresses your #1 need at ${top.position}`
    : needIdx > 0 && needIdx <= 2
      ? `fills a roster need at ${top.position}`
      : `best player available at this pick`;

  const roundDiff = top.round - round;
  const concern = roundDiff <= -2
    ? `Projected ${top.round > 0 ? 'R' + top.round : 'undrafted'} — significant reach. Needs justify it.`
    : roundDiff >= 2
      ? `Projected R${top.round} player still available — rare value.`
      : 'None — solid value pick at this slot.';

  const intel = second
    ? `${second.name} (${second.position}) is the next best option if you prefer the position.`
    : 'Thin board — take your top-rated player.';

  return `PICK: ${top.name} (${top.position}, ${top.college})\nFIT: Grade ${top.grade} ${top.position} — ${fitReason} at pick #${pickNumber}.\nINTEL: ${intel}\nCONCERN: ${concern}`;
}

// ─── Board analytics ─────────────────────────────────────────────────────────
function BoardAnalytics({ session }: { session: DraftSession }) {
  const completedPicks = session.picks.slice(0, session.currentPickIndex).filter((p) => p.prospect);
  const posMap: Record<string, number> = {};
  for (const pick of completedPicks) {
    if (pick.prospect) posMap[pick.prospect.position] = (posMap[pick.prospect.position] ?? 0) + 1;
  }
  const topPositions = Object.entries(posMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (topPositions.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '6px 12px', borderBottom: `1px solid ${S.border}` }}>
      {topPositions.map(([pos, cnt]) => (
        <div key={pos} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <PosBadge position={pos} />
          <span style={{ fontSize: 10, color: S.txtSub, fontVariantNumeric: 'tabular-nums' }}>{cnt}</span>
        </div>
      ))}
      <span style={{ fontSize: 9, color: S.txtMuted, alignSelf: 'center' }}>taken</span>
    </div>
  );
}

export function DraftBoardPage() {
  const navigate = useNavigate();
  const {
    session, availableProspects,
    makePick, simulateNextPick, simulateToUserPick,
    resetDraft, simSpeed, setDraftSettings, aiAdvisorEnabled, needsWeight, positionWeight, tradeFrequency, draftCraziness,
    commentary, commentaryType, setCommentary,
    compareList, addToCompare, clearCompare,
    incomingTradeOffer, generateAITradeOffer, respondToAITradeOffer,
  } = useDraftStore();

  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [showTrade, setShowTrade] = useState(false);
  const [posFilter, setPosFilter] = useState<string>('ALL');
  const [autoSim, setAutoSim] = useState(true);
  const [lastPickAnim, setLastPickAnim] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // AI Advisor
  const [advisorText, setAdvisorText] = useState<string>('');
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const advisorFetchedForPick = useRef<number | null>(null);
  const advisorAbortRef = useRef<AbortController | null>(null);

  // Commentary auto-hide
  useEffect(() => {
    if (commentary) {
      const timer = setTimeout(() => setCommentary(null, null), 4000);
      return () => clearTimeout(timer);
    }
  }, [commentary, setCommentary]);

  useEffect(() => { if (!session) navigate('/draft/select'); }, [session, navigate]);
  useEffect(() => { if (session?.status === 'complete') navigate('/draft/results'); }, [session?.status, navigate]);

  // Auto sim
  useEffect(() => {
    if (!autoSim || !session || session.status !== 'drafting') return;
    const currentPick = session.picks[session.currentPickIndex];
    if (!currentPick || currentPick.isUserPick) return; // pause at user turn, don't stop autoSim
    const timer = setTimeout(() => simulateNextPick(), simSpeed);
    return () => clearTimeout(timer);
  }, [autoSim, session, simulateNextPick, simSpeed]);

  // AI Advisor fetch
  useEffect(() => {
    if (!session || !aiAdvisorEnabled) return;
    const currentPick = session.picks[session.currentPickIndex];
    if (!currentPick?.isUserPick) {
      setAdvisorText('');
      advisorFetchedForPick.current = null;
      return;
    }
    if (advisorFetchedForPick.current === currentPick.overall) return;
    advisorFetchedForPick.current = currentPick.overall;

    const team = NFL_TEAMS.find(t => t.id === currentPick.teamId);
    if (!team) return;

    const top12 = [...availableProspects]
      .sort((a, b) => b.grade - a.grade)
      .slice(0, 12)
      .map(p => ({ id: p.id, name: p.name, position: p.position, college: p.college, grade: p.grade, round: p.round, traits: p.traits }));

    // Build completed picks context
    const completedPicks = session.picks
      .slice(0, session.currentPickIndex)
      .filter(p => p.prospect)
      .map(p => ({ teamId: p.teamId, position: p.prospect!.position, name: p.prospect!.name, grade: p.prospect!.grade, round: p.round, overall: p.overall }));

    // User's own picks
    const userPicksMade = session.picks
      .filter(p => p.teamId === session.userTeamId && p.prospect)
      .map(p => ({ position: p.prospect!.position, name: p.prospect!.name, grade: p.prospect!.grade }));

    setAdvisorLoading(true);
    setAdvisorText('');
    generateAITradeOffer();

    advisorAbortRef.current?.abort();
    const ctrl = new AbortController();
    advisorAbortRef.current = ctrl;

    fetch('/api/draft/advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamId: team.id,
        teamName: `${team.city} ${team.name}`,
        teamNeeds: team.needs,
        teamDraftStyle: team.draftStyle,
        availableProspects: top12,
        pickNumber: currentPick.overall,
        round: currentPick.round,
        pickInRound: currentPick.pickInRound,
        needsWeight,
        completedPicks,
        userPicksMade,
        totalProspectsRemaining: availableProspects.length,
      }),
      signal: ctrl.signal,
    })
      .then(async res => {
        if (!res.ok || !res.body) {
          const team = NFL_TEAMS.find(t => t.id === session?.userTeamId);
          const localAdvice = generateLocalAdvice({
            teamNeeds: team?.needs ?? [],
            availableProspects: availableProspects.slice(0, 12).map(p => ({
              name: p.name, position: p.position, college: p.college,
              grade: p.grade, round: p.round,
            })),
            pickNumber: session?.picks[session?.currentPickIndex ?? 0]?.overall ?? 1,
            round: session?.picks[session?.currentPickIndex ?? 0]?.round ?? 1,
            needsWeight,
          });
          setAdvisorText(localAdvice);
          setAdvisorLoading(false);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setAdvisorText(full);
        }
        setAdvisorLoading(false);
      })
      .catch(err => {
        if (err?.name === 'AbortError') return;
        // Fall back to local advisor
        const team = NFL_TEAMS.find(t => t.id === session?.userTeamId);
        const localAdvice = generateLocalAdvice({
          teamNeeds: team?.needs ?? [],
          availableProspects: availableProspects.slice(0, 12).map(p => ({
            name: p.name, position: p.position, college: p.college,
            grade: p.grade, round: p.round,
          })),
          pickNumber: session?.picks[session?.currentPickIndex ?? 0]?.overall ?? 1,
          round: session?.picks[session?.currentPickIndex ?? 0]?.round ?? 1,
          needsWeight,
        });
        setAdvisorText(localAdvice);
        setAdvisorLoading(false);
      });
  }, [session, session?.currentPickIndex, aiAdvisorEnabled, availableProspects, needsWeight, generateAITradeOffer]);

  const handleMakePick = useCallback((prospectId: string) => {
    makePick(prospectId);
    setSelectedProspect(null);
    setLastPickAnim(prospectId);
    setAdvisorText('');
    advisorFetchedForPick.current = null;
    setTimeout(() => setLastPickAnim(null), 1500);
  }, [makePick]);

  if (!session) return null;

  const currentPick = session.picks[session.currentPickIndex];
  const currentTeam = currentPick ? NFL_TEAMS.find(t => t.id === currentPick.teamId) : null;
  const isUserTurn = currentPick?.isUserPick ?? false;
  const userTeam = NFL_TEAMS.find(t => t.id === session.userTeamId);

  const POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'OT', 'OG', 'C', 'DE', 'DT', 'LB', 'OLB', 'CB', 'S'];
  const filteredProspects = availableProspects
    .filter(p => posFilter === 'ALL' || p.position === posFilter)
    .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.college.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.grade - a.grade);

  const round = currentPick?.round ?? 1;
  const pickInRound = currentPick?.pickInRound ?? 1;
  const userPicks = session.picks.filter(p => p.teamId === session.userTeamId);
  const userPicksMade = userPicks.filter(p => p.prospect);
  const userPicksRemaining = userPicks.filter(p => !p.prospect);

  // Parse advisor text into structured sections
  const advisorLines = advisorText.split('\n').filter(Boolean);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: S.bg, overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Commentary banner */}
      <AnimatePresence>
        {commentary && (
          <motion.div
            initial={{ y: -36, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -36, opacity: 0 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, padding: '7px 16px', background: commentaryType === 'user' ? `linear-gradient(to right, rgba(59,125,216,0.18), rgba(59,125,216,0.10))` : 'rgba(30,45,64,0.95)', borderBottom: `1px solid ${commentaryType === 'user' ? 'rgba(59,125,216,0.3)' : S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {commentaryType === 'user' && <span style={{ fontSize: 10, fontWeight: 700, color: S.blue, letterSpacing: '0.1em' }}>YOUR PICK</span>}
            <span style={{ fontSize: 12, fontWeight: 500, color: commentaryType === 'user' ? '#a8c6f0' : S.txtSub }}>{commentary}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: 44, flexShrink: 0, background: S.surface, borderBottom: `1px solid ${S.border}`, gap: 16 }}>

        {/* Logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => { resetDraft(); navigate('/'); }}
            style={{ width: 26, height: 26, borderRadius: 5, background: 'rgba(255,255,255,0.04)', border: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: S.txtSub, fontSize: 12 }}
          >←</button>
          <span style={{ fontSize: 13, fontWeight: 700, color: S.txt, letterSpacing: '-0.01em' }}>
            Gridiron<span style={{ color: S.gold }}>IQ</span>
          </span>
          <span style={{ width: 1, height: 16, background: S.border }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: S.txtMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {session.picks[0]?.round === 1 ? '2026 NFL Draft' : 'Mock Draft'} — Live Board
          </span>
        </div>

        {/* Clock indicator */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          {currentPick && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 6, background: isUserTurn ? S.greenSub : S.elevated, border: `1px solid ${isUserTurn ? 'rgba(30,140,78,0.35)' : S.border}` }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: isUserTurn ? S.green : (currentTeam?.primaryColor ?? S.blue), flexShrink: 0, boxShadow: isUserTurn ? `0 0 6px ${S.green}` : 'none', animation: isUserTurn ? 'pulse 2s infinite' : 'none' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: isUserTurn ? '#4ade80' : S.txt }}>
                {isUserTurn ? 'ON THE CLOCK — YOUR PICK' : `${currentTeam?.city ?? ''} ${currentTeam?.name ?? ''} on the clock`}
              </span>
              <span style={{ fontSize: 10, color: S.txtMuted, fontVariantNumeric: 'tabular-nums' }}>
                Pick #{currentPick.overall} · Rd {round} · {pickInRound} of 32
              </span>
            </div>
          )}
          {isUserTurn && (
            <PickClock seconds={90} onExpire={() => { if (filteredProspects[0]) handleMakePick(filteredProspects[0].id); }} />
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Speed selector — always visible */}
          {(['Fast', 'Normal', 'Slow'] as const).map((label, i) => {
            const speeds = [400, 900, 1800];
            const speed = speeds[i];
            return (
              <button
                key={label}
                onClick={() => setDraftSettings({ simSpeed: speed })}
                style={{ fontSize: 9, padding: '3px 7px', borderRadius: 4, background: simSpeed === speed ? S.blueSub : 'transparent', border: `1px solid ${simSpeed === speed ? 'rgba(59,125,216,0.4)' : S.border}`, color: simSpeed === speed ? S.blue : S.txtMuted, cursor: 'pointer', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}
              >
                {label}
              </button>
            );
          })}
          {/* Pause/Resume — always visible */}
          <button
            onClick={() => setAutoSim(!autoSim)}
            style={{ fontSize: 11, padding: '4px 10px', borderRadius: 5, background: autoSim ? S.goldSub : S.elevated, border: `1px solid ${autoSim ? 'rgba(196,154,26,0.35)' : S.border}`, color: autoSim ? S.gold : S.txtSub, cursor: 'pointer', fontWeight: 600 }}
          >
            {autoSim ? '⏸ Pause' : '▶ Resume'}
          </button>
          {/* Sim controls — secondary */}
          {!isUserTurn && (
            <>
              <button onClick={simulateNextPick} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 5, background: S.elevated, border: `1px solid ${S.border}`, color: S.txtSub, cursor: 'pointer', fontWeight: 500 }}>
                Sim 1
              </button>
              <button onClick={simulateToUserPick} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 5, background: S.elevated, border: `1px solid ${S.border}`, color: S.txtSub, cursor: 'pointer', fontWeight: 500 }}>
                Skip to My Pick →
              </button>
            </>
          )}
          {isUserTurn && (
            <button onClick={() => setShowTrade(true)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 5, background: S.goldSub, border: `1px solid rgba(196,154,26,0.3)`, color: S.gold, cursor: 'pointer', fontWeight: 600 }}>
              ⇄ Trade
            </button>
          )}
          {compareList.length > 0 && (
            <button onClick={clearCompare} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 5, background: S.redSub, border: `1px solid rgba(181,56,56,0.3)`, color: '#e07070', cursor: 'pointer', fontWeight: 600 }}>
              × Compare ({compareList.length}/2)
            </button>
          )}
          <button
            onClick={() => setShowSettings(s => !s)}
            style={{ fontSize: 14, width: 28, height: 28, borderRadius: 5, background: showSettings ? S.blueSub : S.elevated, border: `1px solid ${showSettings ? 'rgba(59,125,216,0.4)' : S.border}`, color: showSettings ? S.blue : S.txtSub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Draft Settings"
          >⚙</button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── LEFT: BIG BOARD ─────────────────────────────────────────────── */}
        <div style={{ width: 288, display: 'flex', flexDirection: 'column', flexShrink: 0, borderRight: `1px solid ${S.border}` }}>

          {/* Header */}
          <SectionHead right={<span style={{ fontSize: 10, color: S.txtMuted, fontVariantNumeric: 'tabular-nums' }}>{availableProspects.length} remaining</span>}>
            Big Board
          </SectionHead>

          {/* Search */}
          <div style={{ padding: '6px 8px', borderBottom: `1px solid ${S.border}` }}>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search player or school…"
              style={{ width: '100%', background: S.elevated, border: `1px solid ${S.border}`, borderRadius: 5, padding: '4px 8px', fontSize: 11, color: S.txt, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Position filter tabs */}
          <div style={{ padding: '5px 6px', borderBottom: `1px solid ${S.border}`, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {POSITIONS.map(pos => (
              <button
                key={pos}
                onClick={() => setPosFilter(pos)}
                style={{ fontSize: 9, padding: '2px 5px', borderRadius: 3, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em', background: posFilter === pos ? (POSITION_COLORS[pos]?.bg ?? S.blueSub) : 'transparent', border: `1px solid ${posFilter === pos ? (POSITION_COLORS[pos]?.border ?? S.blue) : 'transparent'}`, color: posFilter === pos ? (POSITION_COLORS[pos]?.text ?? S.txt) : S.txtMuted }}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Prospect rows */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredProspects.map((prospect, idx) => {
              const isSelected = selectedProspect?.id === prospect.id;
              const inCompare = compareList.some(p => p.id === prospect.id);
              return (
                <motion.div key={prospect.id} layout initial={lastPickAnim === prospect.id ? { opacity: 0 } : false}>

                  {/* Main row */}
                  <div
                    onClick={() => setSelectedProspect(isSelected ? null : prospect)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderBottom: `1px solid ${S.border}`, cursor: 'pointer', background: isSelected ? S.blueSub : inCompare ? S.goldSub : 'transparent', transition: 'background 0.1s' }}
                  >
                    {/* Rank */}
                    <span style={{ fontSize: 9, color: S.txtMuted, width: 20, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{idx + 1}</span>

                    {/* Grade */}
                    <GradeBadge grade={prospect.grade} size="sm" />

                    {/* Name + info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: S.txt, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prospect.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <PosBadge position={prospect.position} />
                        <span style={{ fontSize: 10, color: S.txtSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prospect.college}</span>
                      </div>
                    </div>

                    {/* Value + actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                      <ValueBadge prospect={prospect} pickNumber={currentPick?.overall ?? 1} />
                      <div style={{ display: 'flex', gap: 3 }}>
                        {isUserTurn && (
                          <button
                            onClick={e => { e.stopPropagation(); handleMakePick(prospect.id); }}
                            style={{ fontSize: 9, padding: '2px 7px', borderRadius: 3, background: `linear-gradient(135deg, ${S.blue}cc, ${S.blue}88)`, border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700, letterSpacing: '0.04em' }}
                          >DRAFT</button>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); if (!inCompare) addToCompare(prospect); }}
                          style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: inCompare ? S.goldSub : S.elevated, border: `1px solid ${inCompare ? 'rgba(196,154,26,0.3)' : S.border}`, color: inCompare ? S.gold : S.txtMuted, cursor: 'pointer', fontWeight: 600 }}
                        >CMP</button>
                        <span style={{ fontSize: 9, color: S.txtMuted, padding: '1px 0' }}>R{prospect.round}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ borderBottom: `1px solid ${S.border}` }}>
                          <ProspectCard prospect={prospect} />
                          {isUserTurn && (
                            <div style={{ padding: '0 12px 12px' }}>
                              <button
                                onClick={e => { e.stopPropagation(); handleMakePick(prospect.id); }}
                                style={{ width: '100%', padding: '8px', borderRadius: 6, background: `linear-gradient(135deg, ${S.blue}cc, ${S.blue}88)`, border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em', boxShadow: `0 2px 12px ${S.blue}44` }}
                              >
                                DRAFT {prospect.name.toUpperCase()}
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── CENTER: DRAFT BOARD ──────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <SectionHead right={<span style={{ fontSize: 10, color: S.txtMuted }}>Pick {session.currentPickIndex + 1} of {session.picks.length}</span>}>
            Draft Board
          </SectionHead>
          <BoardAnalytics session={session} />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <DraftBoard picks={session.picks} currentPickIndex={session.currentPickIndex} userTeamId={session.userTeamId} />
          </div>
        </div>

        {/* ── RIGHT: WAR ROOM ──────────────────────────────────────────────── */}
        <div style={{ width: 272, display: 'flex', flexDirection: 'column', flexShrink: 0, borderLeft: `1px solid ${S.border}` }}>

          {/* My Team header */}
          <SectionHead right={
            userTeam && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: userTeam.primaryColor, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: S.txt }}>{userTeam.abbreviation}</span>
              </div>
            )
          }>
            War Room
          </SectionHead>

          {/* Team needs */}
          <div style={{ padding: '8px 12px', borderBottom: `1px solid ${S.border}` }}>
            <Label>Team Needs</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
              {(userTeam?.needs ?? []).slice(0, 6).map((need, i) => (
                <span key={need} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: i === 0 ? S.redSub : i <= 2 ? S.goldSub : S.elevated, border: `1px solid ${i === 0 ? 'rgba(181,56,56,0.3)' : i <= 2 ? 'rgba(196,154,26,0.25)' : S.border}`, color: i === 0 ? '#e07070' : i <= 2 ? S.gold : S.txtSub, fontWeight: 600 }}>
                  {need}
                </span>
              ))}
            </div>
          </div>

          {/* My picks */}
          <div style={{ padding: '8px 12px', borderBottom: `1px solid ${S.border}` }}>
            <Label>My Picks — {userPicksMade.length} of {userPicks.length}</Label>
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {userPicksMade.length === 0 && (
                <span style={{ fontSize: 11, color: S.txtMuted }}>No picks made yet</span>
              )}
              {userPicksMade.slice(-5).map(pick => pick.prospect && (
                <div key={pick.overall} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <GradeBadge grade={pick.prospect.grade} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: S.txt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pick.prospect.name}</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <PosBadge position={pick.prospect.position} />
                      <span style={{ fontSize: 9, color: S.txtMuted }}>Rd{pick.round} #{pick.overall}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming user picks */}
          {userPicksRemaining.length > 0 && (
            <div style={{ padding: '8px 12px', borderBottom: `1px solid ${S.border}` }}>
              <Label>Upcoming Picks</Label>
              <div style={{ marginTop: 5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {userPicksRemaining.slice(0, 5).map(pick => (
                  <div key={pick.overall} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 6px', borderRadius: 4, background: pick.overall === currentPick?.overall ? S.greenSub : S.elevated, border: `1px solid ${pick.overall === currentPick?.overall ? 'rgba(30,140,78,0.35)' : S.border}` }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: pick.overall === currentPick?.overall ? S.green : S.txtMuted, width: 20, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>#{pick.overall}</span>
                    <span style={{ fontSize: 10, color: S.txtSub }}>Round {pick.round}, Pick {pick.pickInRound}</span>
                    {pick.overall === currentPick?.overall && <span style={{ fontSize: 9, color: S.green, fontWeight: 700 }}>NOW</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI War Room Advisor */}
          {aiAdvisorEnabled && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <SectionHead right={advisorLoading ? <span style={{ fontSize: 9, color: S.green, animation: 'pulse 1.5s infinite' }}>● LIVE</span> : null}>
                AI War Room Advisor
              </SectionHead>

              <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
                {!isUserTurn && !advisorText && (
                  <div style={{ color: S.txtMuted, fontSize: 11, lineHeight: 1.6 }}>
                    Advisor activates on your pick. Use the controls to advance the board.
                  </div>
                )}

                {advisorLoading && !advisorText && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[100, 80, 90, 70].map((w, i) => (
                      <div key={i} style={{ height: 10, width: `${w}%`, borderRadius: 3, background: S.elevated, animation: 'pulse 1.5s infinite' }} />
                    ))}
                    <div style={{ fontSize: 10, color: S.txtMuted, marginTop: 4 }}>Analyzing board…</div>
                  </div>
                )}

                {advisorText && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {advisorLines.map((line, i) => {
                      const isPickLine = line.startsWith('PICK:');
                      const isFitLine = line.startsWith('FIT:');
                      const isIntelLine = line.startsWith('INTEL:');
                      const isConcernLine = line.startsWith('CONCERN:');

                      if (isPickLine) {
                        const val = line.replace('PICK:', '').trim();
                        return (
                          <div key={i} style={{ padding: '8px 10px', borderRadius: 6, background: S.blueSub, border: `1px solid rgba(59,125,216,0.25)` }}>
                            <Label>Recommendation</Label>
                            <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: S.txt }}>{val}</div>
                          </div>
                        );
                      }

                      const labelMap: Record<string, string> = { 'FIT:': 'Scheme Fit', 'INTEL:': 'Board Intel', 'CONCERN:': 'Concern' };
                      const colorMap: Record<string, string> = { 'FIT:': S.green, 'INTEL:': S.gold, 'CONCERN:': S.red };
                      const bgMap: Record<string, string> = { 'FIT:': S.greenSub, 'INTEL:': S.goldSub, 'CONCERN:': S.redSub };
                      const borderMap: Record<string, string> = { 'FIT:': 'rgba(30,140,78,0.2)', 'INTEL:': 'rgba(196,154,26,0.2)', 'CONCERN:': 'rgba(181,56,56,0.2)' };

                      const prefix = Object.keys(labelMap).find(k => line.startsWith(k));
                      if (prefix) {
                        const val = line.replace(prefix, '').trim();
                        return (
                          <div key={i} style={{ padding: '7px 10px', borderRadius: 6, background: bgMap[prefix], border: `1px solid ${borderMap[prefix]}` }}>
                            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: colorMap[prefix], marginBottom: 3 }}>{labelMap[prefix]}</div>
                            <div style={{ fontSize: 11, color: S.txtSub, lineHeight: 1.5 }}>{val}</div>
                          </div>
                        );
                      }

                      return <div key={i} style={{ fontSize: 11, color: S.txtSub, lineHeight: 1.6 }}>{line}</div>;
                    })}

                    {/* Take him button */}
                    {isUserTurn && (() => {
                      const pickLine = advisorLines.find(l => l.startsWith('PICK:'))?.replace('PICK:', '').trim();
                      if (!pickLine) return null;
                      // Try to find the recommended prospect
                      const words = pickLine.toLowerCase().split(/[\s,()]+/);
                      const match = availableProspects.find(p => words.some(w => w && p.name.toLowerCase().includes(w) && w.length > 3));
                      if (!match) return null;
                      return (
                        <button
                          onClick={() => handleMakePick(match.id)}
                          style={{ width: '100%', padding: '9px', borderRadius: 6, background: `linear-gradient(135deg, ${S.blue}cc, ${S.blue}88)`, border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em', boxShadow: `0 2px 12px ${S.blue}44`, marginTop: 4 }}
                        >
                          DRAFT {match.name.split(' ').slice(-1)[0].toUpperCase()}  ▸
                        </button>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MODALS ────────────────────────────────────────────────────────── */}
      {showTrade && session && <TradeModal session={session} onClose={() => setShowTrade(false)} />}
      {compareList.length >= 2 && <ProspectCompare prospects={compareList as [Prospect, Prospect]} onClose={clearCompare} canDraft={isUserTurn} onDraft={isUserTurn ? (id) => { handleMakePick(id); clearCompare(); } : undefined} />}
      <AnimatePresence>
        {incomingTradeOffer && (
          <IncomingTradeOffer offer={incomingTradeOffer} currentPickIndex={session?.currentPickIndex ?? 0} userPicks={userPicks} onAccept={() => respondToAITradeOffer(true)} onDecline={() => respondToAITradeOffer(false)} />
        )}
      </AnimatePresence>

      {/* ── SETTINGS DRAWER ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{ position: 'absolute', top: 48, right: 16, zIndex: 60, width: 280, background: S.surface, border: `1px solid ${S.borderHi}`, borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden' }}
          >
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: S.txt, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Draft Settings</span>
              <button onClick={() => setShowSettings(false)} style={{ fontSize: 14, color: S.txtMuted, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Needs vs BPA */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: S.txt }}>Needs vs BPA</span>
                  <span style={{ fontSize: 9, color: S.txtMuted }}>
                    {needsWeight < 25 ? 'Pure BPA' : needsWeight < 45 ? 'BPA Lean' : needsWeight <= 55 ? 'Balanced' : needsWeight < 75 ? 'Needs Lean' : 'Pure Needs'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 9, color: S.txtMuted, width: 28 }}>BPA</span>
                  <input type="range" min={0} max={100} value={needsWeight}
                    onChange={e => setDraftSettings({ needsWeight: Number(e.target.value) })}
                    style={{ flex: 1, accentColor: S.blue }} />
                  <span style={{ fontSize: 9, color: S.txtMuted, width: 36, textAlign: 'right' }}>Needs</span>
                </div>
                <div style={{ fontSize: 9, color: S.txtMuted, marginTop: 3 }}>How much CPU teams prioritize roster needs vs. best player available</div>
              </div>

              {/* Position Scarcity */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: S.txt }}>Position Scarcity Weight</span>
                  <span style={{ fontSize: 9, color: S.txtMuted }}>{positionWeight}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 9, color: S.txtMuted, width: 28 }}>Low</span>
                  <input type="range" min={0} max={100} value={positionWeight}
                    onChange={e => setDraftSettings({ positionWeight: Number(e.target.value) })}
                    style={{ flex: 1, accentColor: S.blue }} />
                  <span style={{ fontSize: 9, color: S.txtMuted, width: 36, textAlign: 'right' }}>High</span>
                </div>
                <div style={{ fontSize: 9, color: S.txtMuted, marginTop: 3 }}>How heavily CPU teams weigh premium positions (QB, EDGE, OT) over others</div>
              </div>

              {/* Trade Frequency */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: S.txt }}>Trade Offer Frequency</span>
                  <span style={{ fontSize: 9, color: S.txtMuted }}>
                    {tradeFrequency < 15 ? 'Rare' : tradeFrequency < 35 ? 'Low' : tradeFrequency < 60 ? 'Normal' : tradeFrequency < 80 ? 'Active' : 'Frenzy'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 9, color: S.txtMuted, width: 28 }}>Rare</span>
                  <input type="range" min={0} max={100} value={tradeFrequency}
                    onChange={e => setDraftSettings({ tradeFrequency: Number(e.target.value) })}
                    style={{ flex: 1, accentColor: S.gold }} />
                  <span style={{ fontSize: 9, color: S.txtMuted, width: 36, textAlign: 'right' }}>Crazy</span>
                </div>
                <div style={{ fontSize: 9, color: S.txtMuted, marginTop: 3 }}>How often CPU teams call you with trade offers on your pick</div>
              </div>

              {/* Draft Craziness */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: S.txt }}>Draft Craziness</span>
                  <span style={{ fontSize: 9, color: S.txtMuted }}>
                    {draftCraziness < 20 ? 'Predictable' : draftCraziness < 45 ? 'Realistic' : draftCraziness < 70 ? 'Unpredictable' : 'Chaos'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 9, color: S.txtMuted, width: 28 }}>Sim</span>
                  <input type="range" min={0} max={100} value={draftCraziness}
                    onChange={e => setDraftSettings({ draftCraziness: Number(e.target.value) })}
                    style={{ flex: 1, accentColor: S.red }} />
                  <span style={{ fontSize: 9, color: S.txtMuted, width: 36, textAlign: 'right' }}>Wild</span>
                </div>
                <div style={{ fontSize: 9, color: S.txtMuted, marginTop: 3 }}>How randomly CPU teams deviate from their top pick — high = more surprises</div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
