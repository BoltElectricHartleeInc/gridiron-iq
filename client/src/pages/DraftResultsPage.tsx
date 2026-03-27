import { API_BASE } from '../lib/api';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraftStore } from '../store/draftStore';
import { NFL_TEAMS } from '../data/teams';

// ─── Design tokens ────────────────────────────────────────────────────────────
const S = {
  bg:       '#0b0f18',
  surface:  '#0f1623',
  elevated: '#141d2e',
  border:   '#1c2d40',
  txt:      '#cdd8e8',
  txtSub:   '#6b82a0',
  txtMuted: '#334560',
  blue:     '#3b7dd8',
  blueSub:  'rgba(59,125,216,0.12)',
  gold:     '#c49a1a',
  goldSub:  'rgba(196,154,26,0.12)',
  green:    '#1e8c4e',
  greenSub: 'rgba(30,140,78,0.12)',
  red:      '#b53838',
};

const GRADE_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  'A+': { color: '#c49a1a', bg: 'rgba(196,154,26,0.15)', border: 'rgba(196,154,26,0.4)' },
  'A':  { color: '#3dba78', bg: 'rgba(30,140,78,0.15)',  border: 'rgba(30,140,78,0.4)'  },
  'A-': { color: '#3dba78', bg: 'rgba(30,140,78,0.12)',  border: 'rgba(30,140,78,0.3)'  },
  'B+': { color: '#3b7dd8', bg: 'rgba(59,125,216,0.15)', border: 'rgba(59,125,216,0.4)' },
  'B':  { color: '#3b7dd8', bg: 'rgba(59,125,216,0.12)', border: 'rgba(59,125,216,0.3)' },
  'B-': { color: '#3b7dd8', bg: 'rgba(59,125,216,0.10)', border: 'rgba(59,125,216,0.25)' },
  'C+': { color: '#8a9bb0', bg: 'rgba(138,155,176,0.1)', border: 'rgba(138,155,176,0.25)' },
  'C':  { color: '#6b82a0', bg: 'rgba(107,130,160,0.08)', border: 'rgba(107,130,160,0.2)' },
  'C-': { color: '#6b82a0', bg: 'rgba(107,130,160,0.08)', border: 'rgba(107,130,160,0.18)' },
  'D':  { color: '#c4783a', bg: 'rgba(196,120,58,0.12)', border: 'rgba(196,120,58,0.3)' },
  'F':  { color: '#b53838', bg: 'rgba(181,56,56,0.12)',  border: 'rgba(181,56,56,0.3)'  },
};

function GradeDisplay({ grade, size = 'lg' }: { grade: string; size?: 'sm' | 'lg' }) {
  const gc = GRADE_CONFIG[grade] ?? { color: S.txt, bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.15)' };
  const dim = size === 'lg' ? 72 : 40;
  return (
    <div style={{
      width: dim, height: dim, borderRadius: size === 'lg' ? 12 : 8,
      background: gc.bg, border: `1px solid ${gc.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: gc.color, fontSize: size === 'lg' ? 28 : 16, fontWeight: 800,
      flexShrink: 0, letterSpacing: '-0.02em',
    }}>
      {grade}
    </div>
  );
}

function GradeNum({ grade }: { grade: number }) {
  const color = grade >= 90 ? S.gold : grade >= 80 ? S.blue : grade >= 70 ? S.green : S.txtMuted;
  const bg = grade >= 90 ? 'rgba(196,154,26,0.15)' : grade >= 80 ? 'rgba(59,125,216,0.15)' : grade >= 70 ? 'rgba(30,140,78,0.15)' : 'rgba(255,255,255,0.04)';
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 7, background: bg,
      border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, fontSize: 11, fontWeight: 700, flexShrink: 0, fontVariantNumeric: 'tabular-nums',
    }}>
      {grade % 1 === 0 ? grade : grade.toFixed(1)}
    </div>
  );
}

function PosBadge({ pos }: { pos: string }) {
  const POS_COLORS: Record<string, { bg: string; text: string }> = {
    QB:   { bg: 'rgba(37,99,235,0.18)',   text: '#6699e8' },
    RB:   { bg: 'rgba(22,163,74,0.18)',   text: '#55b87a' },
    WR:   { bg: 'rgba(180,100,0,0.18)',   text: '#c07820' },
    TE:   { bg: 'rgba(100,30,180,0.18)',  text: '#9966cc' },
    OT:   { bg: 'rgba(60,80,100,0.18)',   text: '#7a95aa' },
    OG:   { bg: 'rgba(50,70,90,0.18)',    text: '#6a8898' },
    C:    { bg: 'rgba(40,60,80,0.18)',    text: '#5a7888' },
    EDGE: { bg: 'rgba(180,35,35,0.18)',   text: '#cc5555' },
    DE:   { bg: 'rgba(180,35,35,0.18)',   text: '#cc5555' },
    DT:   { bg: 'rgba(180,70,20,0.18)',   text: '#c06030' },
    LB:   { bg: 'rgba(150,110,0,0.18)',   text: '#b88818' },
    OLB:  { bg: 'rgba(150,110,0,0.18)',   text: '#b88818' },
    CB:   { bg: 'rgba(10,120,110,0.18)',  text: '#28a898' },
    S:    { bg: 'rgba(5,110,145,0.18)',   text: '#2090b8' },
    K:    { bg: 'rgba(60,70,85,0.18)',    text: '#7080a0' },
    P:    { bg: 'rgba(60,70,85,0.18)',    text: '#7080a0' },
  };
  const c = POS_COLORS[pos] ?? POS_COLORS['K'];
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
      background: c.bg, color: c.text, letterSpacing: '0.04em', flexShrink: 0,
    }}>
      {pos}
    </span>
  );
}

export function DraftResultsPage() {
  const navigate = useNavigate();
  const { session, calculateGrades, grades, resetDraft } = useDraftStore();
  const [activeTab, setActiveTab] = useState<'my-team' | 'all-grades' | 'full-board'>('my-team');
  const savedRef = useRef(false);

  useEffect(() => {
    if (!session) { navigate('/'); return; }
    if (grades.length === 0) calculateGrades();
  }, [session, grades, calculateGrades, navigate]);

  // Save draft to DB once grades are calculated
  useEffect(() => {
    if (!session || grades.length === 0 || savedRef.current) return;
    const myGrade = grades.find(g => g.teamId === session.userTeamId);
    if (!myGrade) return;
    savedRef.current = true;

    const userTeam = NFL_TEAMS.find(t => t.id === session.userTeamId);
    const completedPicks = session.picks.filter(p => p.prospect);

    fetch(API_BASE + '/api/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamId: session.userTeamId,
        teamName: userTeam ? `${userTeam.city} ${userTeam.name}` : session.userTeamId,
        grade: myGrade.grade,
        gradeScore: myGrade.score,
        picks: completedPicks.map(p => ({
          overall: p.overall,
          round: p.round,
          pickInRound: p.pickInRound,
          teamId: p.teamId,
          teamName: NFL_TEAMS.find(t => t.id === p.teamId)?.name ?? p.teamId,
          prospectId: p.prospect!.id,
          prospectName: p.prospect!.name,
          prospectPosition: p.prospect!.position,
          prospectGrade: p.prospect!.grade,
          isUserPick: p.isUserPick,
          isTrade: p.teamId !== p.originalTeamId,
        })),
      }),
    }).catch(() => {});
  }, [session, grades]);

  if (!session) return null;

  const userTeam = NFL_TEAMS.find(t => t.id === session.userTeamId);
  const myGrade = grades.find(g => g.teamId === session.userTeamId);
  const myPicks = session.picks.filter(p => p.teamId === session.userTeamId && p.prospect);
  const sortedGrades = [...grades].sort((a, b) => b.score - a.score);

  const TABS = [
    { id: 'my-team' as const, label: 'My Picks' },
    { id: 'all-grades' as const, label: 'All Grades' },
    { id: 'full-board' as const, label: 'Full Board' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: S.bg, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── TOP NAV ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px', height: 48, background: S.surface, borderBottom: `1px solid ${S.border}` }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: S.txt, letterSpacing: '-0.03em' }}>
          Gridiron<span style={{ color: S.gold }}>IQ</span>
        </span>
        <span style={{ width: 1, height: 14, background: S.border, margin: '0 10px' }} />
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.txtMuted }}>
          Draft Results
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            onClick={() => { resetDraft(); navigate('/draft/select'); }}
            style={{ fontSize: 11, padding: '4px 14px', borderRadius: 4, background: S.blueSub, border: `1px solid rgba(59,125,216,0.3)`, color: S.blue, cursor: 'pointer', fontWeight: 600 }}
          >
            Draft Again
          </button>
          <button
            onClick={() => { resetDraft(); navigate('/'); }}
            style={{ fontSize: 11, padding: '4px 14px', borderRadius: 4, background: S.elevated, border: `1px solid ${S.border}`, color: S.txtSub, cursor: 'pointer', fontWeight: 600 }}
          >
            Home
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── HERO GRADE CARD ────────────────────────────────────────────── */}
        {myGrade && userTeam && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '24px 28px', borderRadius: 12, marginBottom: 20,
              background: S.surface, border: `1px solid ${S.border}`,
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Team color accent */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: userTeam.primaryColor, opacity: 0.7 }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
              {/* Team badge */}
              <div style={{
                width: 56, height: 56, borderRadius: 10, flexShrink: 0,
                background: `${userTeam.primaryColor}22`, border: `1px solid ${userTeam.primaryColor}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: userTeam.primaryColor,
              }}>
                {userTeam.abbreviation}
              </div>

              {/* Team + analysis */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.txtMuted, marginBottom: 4 }}>
                  Draft Complete · {myPicks.length} Selections
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: S.txt, letterSpacing: '-0.02em', marginBottom: 6 }}>
                  {userTeam.city} {userTeam.name}
                </div>
                <p style={{ fontSize: 12, color: S.txtSub, lineHeight: 1.6, maxWidth: 580 }}>
                  {myGrade.analysis}
                </p>
                {myGrade.bestPick && (
                  <div style={{ marginTop: 8, fontSize: 11, color: S.txtMuted }}>
                    Best Pick:&nbsp;
                    <span style={{ color: S.txt, fontWeight: 600 }}>{myGrade.bestPick.prospect!.name}</span>
                    <span style={{ color: S.txtMuted }}> · #{myGrade.bestPick.overall} overall</span>
                  </div>
                )}
              </div>

              {/* Grade */}
              <div style={{ flexShrink: 0, textAlign: 'center' }}>
                <GradeDisplay grade={myGrade.grade} size="lg" />
                <div style={{ fontSize: 9, color: S.txtMuted, marginTop: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Draft Grade</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TABS ───────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 16, padding: 3, borderRadius: 8, background: S.elevated, border: `1px solid ${S.border}`, width: 'fit-content' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '5px 18px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: activeTab === tab.id ? S.surface : 'transparent',
                border: activeTab === tab.id ? `1px solid ${S.border}` : '1px solid transparent',
                color: activeTab === tab.id ? S.txt : S.txtMuted,
                transition: 'all 0.12s', letterSpacing: '0.03em',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── PANELS ─────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* MY PICKS */}
          {activeTab === 'my-team' && (
            <motion.div key="my-team" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, overflow: 'hidden' }}>
                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '48px 48px 1fr auto auto', gap: 0, padding: '6px 16px', background: S.elevated, borderBottom: `1px solid ${S.border}` }}>
                  {['#', 'GRD', 'PLAYER', 'VALUE', ''].map((h, i) => (
                    <div key={i} style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.txtMuted }}>
                      {h}
                    </div>
                  ))}
                </div>
                {myPicks.map((pick, i) => {
                  const isSteal = pick.prospect!.round > pick.round;
                  const isReach = pick.prospect!.round < pick.round;
                  return (
                    <motion.div
                      key={pick.overall}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.035 }}
                      style={{
                        display: 'grid', gridTemplateColumns: '48px 48px 1fr auto auto',
                        alignItems: 'center', gap: 0, padding: '10px 16px',
                        borderBottom: i < myPicks.length - 1 ? `1px solid ${S.border}` : 'none',
                        background: 'transparent',
                      }}
                    >
                      {/* Pick number */}
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: S.txt, fontVariantNumeric: 'tabular-nums' }}>#{pick.overall}</div>
                        <div style={{ fontSize: 9, color: S.txtMuted }}>R{pick.round}</div>
                      </div>

                      {/* Grade */}
                      <GradeNum grade={pick.prospect!.grade} />

                      {/* Prospect */}
                      <div style={{ paddingLeft: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: S.txt }}>{pick.prospect!.name}</span>
                          <PosBadge pos={pick.prospect!.position} />
                        </div>
                        <div style={{ fontSize: 11, color: S.txtMuted }}>
                          {pick.prospect!.college}
                          {pick.prospect!.comparableTo && (
                            <span style={{ color: S.txtMuted }}> · Comp: {pick.prospect!.comparableTo}</span>
                          )}
                        </div>
                      </div>

                      {/* Value tag */}
                      <div style={{ paddingRight: 12 }}>
                        {isSteal && (
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: S.greenSub, border: `1px solid rgba(30,140,78,0.35)`, color: S.green, letterSpacing: '0.06em' }}>
                            STEAL
                          </span>
                        )}
                        {isReach && (
                          <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: 'rgba(181,56,56,0.12)', border: `1px solid rgba(181,56,56,0.3)`, color: S.red, letterSpacing: '0.06em' }}>
                            REACH
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ALL GRADES */}
          {activeTab === 'all-grades' && (
            <motion.div key="all-grades" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, overflow: 'hidden' }}>
                {/* Column headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '32px 44px 1fr 56px', padding: '6px 16px', background: S.elevated, borderBottom: `1px solid ${S.border}` }}>
                  {['RK', 'TEAM', 'ANALYSIS', 'GRADE'].map((h, i) => (
                    <div key={i} style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.txtMuted }}>
                      {h}
                    </div>
                  ))}
                </div>
                {sortedGrades.map((grade, i) => {
                  const team = NFL_TEAMS.find(t => t.id === grade.teamId);
                  if (!team) return null;
                  const isUser = grade.teamId === session.userTeamId;
                  return (
                    <motion.div
                      key={grade.teamId}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.015 }}
                      style={{
                        display: 'grid', gridTemplateColumns: '32px 44px 1fr 56px',
                        alignItems: 'center', padding: '9px 16px',
                        borderBottom: i < sortedGrades.length - 1 ? `1px solid ${S.border}` : 'none',
                        background: isUser ? `${team.primaryColor}08` : 'transparent',
                      }}
                    >
                      <div style={{ fontSize: 10, color: S.txtMuted, fontVariantNumeric: 'tabular-nums' }}>{i + 1}</div>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 32, height: 32, borderRadius: 6,
                        background: `${team.primaryColor}22`, border: `1px solid ${team.primaryColor}44`,
                        fontSize: 8, fontWeight: 800, color: team.primaryColor,
                      }}>
                        {team.abbreviation.slice(0, 3)}
                      </div>
                      <div style={{ paddingLeft: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: isUser ? S.txt : S.txtSub, marginBottom: 1 }}>
                          {team.city} {team.name}
                          {isUser && <span style={{ fontSize: 9, color: S.txtMuted, marginLeft: 6 }}>← You</span>}
                        </div>
                        <div style={{ fontSize: 10, color: S.txtMuted }}>
                          {grade.picks.length} picks · {grade.analysis.slice(0, 55)}…
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <GradeDisplay grade={grade.grade} size="sm" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* FULL BOARD */}
          {activeTab === 'full-board' && (
            <motion.div key="full-board" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, overflow: 'hidden' }}>
                {[1, 2, 3, 4, 5, 6, 7].map(round => {
                  const roundPicks = session.picks.filter(p => p.round === round && p.prospect);
                  if (roundPicks.length === 0) return null;
                  return (
                    <div key={round} style={{ borderBottom: `1px solid ${S.border}` }}>
                      {/* Round header */}
                      <div style={{
                        padding: '5px 16px', background: S.elevated, borderBottom: `1px solid ${S.border}`,
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}>
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.txtMuted }}>Round {round}</span>
                        <div style={{ flex: 1, height: 1, background: S.border }} />
                        <span style={{ fontSize: 9, color: S.txtMuted, fontVariantNumeric: 'tabular-nums' }}>{roundPicks.length} picks</span>
                      </div>
                      {roundPicks.map((pick, i) => {
                        const team = NFL_TEAMS.find(t => t.id === pick.teamId);
                        const isUser = pick.teamId === session.userTeamId;
                        return (
                          <div
                            key={pick.overall}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '7px 16px',
                              borderBottom: i < roundPicks.length - 1 ? `1px solid ${S.border}` : 'none',
                              background: isUser ? 'rgba(59,125,216,0.06)' : 'transparent',
                            }}
                          >
                            <div style={{ fontSize: 10, color: S.txtMuted, width: 28, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                              {pick.overall}
                            </div>
                            <div style={{
                              width: 28, height: 28, borderRadius: 5, flexShrink: 0,
                              background: `${team?.primaryColor ?? '#334560'}22`, border: `1px solid ${team?.primaryColor ?? '#334560'}44`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 7, fontWeight: 800, color: team?.primaryColor ?? S.txtMuted,
                            }}>
                              {team?.abbreviation?.slice(0, 3)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 12, fontWeight: isUser ? 600 : 500, color: isUser ? '#8ab4e8' : S.txtSub }}>
                                {pick.prospect!.name}
                              </span>
                              <PosBadge pos={pick.prospect!.position} />
                              <span style={{ fontSize: 10, color: S.txtMuted }}>{pick.prospect!.college}</span>
                            </div>
                            <GradeNum grade={pick.prospect!.grade} />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
