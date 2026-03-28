import { API_BASE } from '../lib/api';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraftStore } from '../store/draftStore';
import { NFL_TEAMS } from '../data/teams';
import { AppShell, C, Badge, Btn, TabBar } from '../components/AppShell';

// ─── Grade config ──────────────────────────────────────────────────────────────
const GRADE_CONFIG: Record<string, { color: string; glow: string }> = {
  'A+': { color: C.gold,      glow: `0 0 48px -8px ${C.gold}` },
  'A':  { color: C.green,     glow: `0 0 48px -8px ${C.green}` },
  'A-': { color: C.green,     glow: `0 0 36px -10px ${C.green}` },
  'B+': { color: C.blueBright, glow: `0 0 40px -10px ${C.blueBright}` },
  'B':  { color: C.blueBright, glow: `0 0 32px -10px ${C.blueBright}` },
  'B-': { color: C.blueBright, glow: `0 0 24px -12px ${C.blueBright}` },
  'C+': { color: '#8ECAE6',   glow: 'none' },
  'C':  { color: C.txtSub,    glow: 'none' },
  'C-': { color: C.txtSub,    glow: 'none' },
  'D':  { color: C.amber,     glow: 'none' },
  'F':  { color: C.red,       glow: `0 0 32px -10px ${C.red}` },
};

function GradeHero({ grade }: { grade: string }) {
  const gc = GRADE_CONFIG[grade] ?? { color: C.txt, glow: 'none' };
  return (
    <div style={{
      width: 100, height: 100, borderRadius: 20, flexShrink: 0,
      background: `${gc.color}18`,
      border: `2px solid ${gc.color}50`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: gc.color, fontSize: 44, fontWeight: 900, letterSpacing: '-0.03em',
      boxShadow: gc.glow,
    }}>
      {grade}
    </div>
  );
}

function GradeSmall({ grade }: { grade: string }) {
  const gc = GRADE_CONFIG[grade] ?? { color: C.txt, glow: 'none' };
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 10, flexShrink: 0,
      background: `${gc.color}18`, border: `1px solid ${gc.color}50`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: gc.color, fontSize: 17, fontWeight: 800,
    }}>
      {grade}
    </div>
  );
}

function GradeNum({ grade }: { grade: number }) {
  const color = grade >= 90 ? C.gold : grade >= 80 ? C.blueBright : grade >= 70 ? C.green : C.txtMuted;
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 8,
      background: `${color}18`, border: `1px solid ${color}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, fontSize: 11, fontWeight: 800, flexShrink: 0, fontVariantNumeric: 'tabular-nums',
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
      fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
      background: c.bg, color: c.text, letterSpacing: '0.06em', flexShrink: 0,
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

  const gc = myGrade ? (GRADE_CONFIG[myGrade.grade] ?? { color: C.txt, glow: 'none' }) : null;

  const TABS = [
    { id: 'my-team', label: 'My Picks' },
    { id: 'all-grades', label: 'All Grades' },
    { id: 'full-board', label: 'Full Board' },
  ];

  return (
    <AppShell
      backTo="/"
      title="Draft Results"
      maxWidth={960}
      right={
        <Btn accent={C.blueBright} size="sm" onClick={() => { resetDraft(); navigate('/draft/select'); }}>
          Draft Again
        </Btn>
      }
    >

      {/* ── HERO GRADE CARD ─────────────────────────────────────────────────── */}
      {myGrade && userTeam && gc && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '28px 32px', borderRadius: 16, marginBottom: 24,
            background: C.surface, border: `1px solid ${C.border}`,
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Gradient overlay keyed to team color */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(135deg, ${userTeam.primaryColor}12 0%, transparent 50%)`,
            pointerEvents: 'none',
          }} />
          {/* Top accent bar = team color */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${userTeam.primaryColor}, transparent)` }} />
          {/* Grade glow bottom-right */}
          <div style={{ position: 'absolute', bottom: -40, right: 40, width: 180, height: 180, borderRadius: '50%', background: `${gc.color}0A`, pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, position: 'relative' }}>
            {/* Team badge */}
            <div style={{
              width: 72, height: 72, borderRadius: 14, flexShrink: 0,
              background: `${userTeam.primaryColor}20`, border: `1px solid ${userTeam.primaryColor}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 900, color: userTeam.primaryColor,
              letterSpacing: '.04em',
            }}>
              {userTeam.abbreviation}
            </div>

            {/* Team + analysis */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.txtMuted }}>
                  Draft Complete
                </div>
                <Badge color={C.green}>{myPicks.length} Selections</Badge>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.txt, letterSpacing: '-0.02em', marginBottom: 10 }}>
                {userTeam.city} {userTeam.name}
              </div>
              <p style={{ fontSize: 13, color: C.txtSub, lineHeight: 1.65, maxWidth: 560, margin: 0, fontWeight: 500 }}>
                {myGrade.analysis}
              </p>
              {myGrade.bestPick && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', color: C.txtMuted, textTransform: 'uppercase' }}>Best Pick</span>
                  <span style={{ color: C.txt, fontWeight: 700, fontSize: 13 }}>{myGrade.bestPick.prospect!.name}</span>
                  <span style={{ color: C.txtMuted, fontSize: 12 }}>· #{myGrade.bestPick.overall} overall</span>
                </div>
              )}
            </div>

            {/* Grade */}
            <div style={{ flexShrink: 0, textAlign: 'center' }}>
              <GradeHero grade={myGrade.grade} />
              <div style={{ fontSize: 9, color: C.txtMuted, marginTop: 8, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>Draft Grade</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── TABS ─────────────────────────────────────────────────────────────── */}
      <TabBar
        tabs={TABS}
        active={activeTab}
        onChange={(id) => setActiveTab(id as typeof activeTab)}
        style={{ marginBottom: 20, width: 'fit-content' }}
      />

      {/* ── PANELS ───────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* MY PICKS */}
        {activeTab === 'my-team' && (
          <motion.div key="my-team" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
              {/* Table header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '56px 52px 1fr 80px 60px',
                padding: '8px 20px', background: C.panel, borderBottom: `1px solid ${C.border}`,
              }}>
                {['#', 'GRADE', 'PLAYER', 'VALUE', ''].map((h, i) => (
                  <div key={i} style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.txtMuted }}>
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
                    transition={{ delay: i * 0.03 }}
                    style={{
                      display: 'grid', gridTemplateColumns: '56px 52px 1fr 80px 60px',
                      alignItems: 'center', padding: '12px 20px',
                      borderBottom: i < myPicks.length - 1 ? `1px solid ${C.border}` : 'none',
                      transition: 'background 120ms',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = C.panel; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.txt, fontVariantNumeric: 'tabular-nums' }}>#{pick.overall}</div>
                      <div style={{ fontSize: 9, color: C.txtMuted, marginTop: 1 }}>R{pick.round}</div>
                    </div>

                    <GradeNum grade={pick.prospect!.grade} />

                    <div style={{ paddingLeft: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.txt }}>{pick.prospect!.name}</span>
                        <PosBadge pos={pick.prospect!.position} />
                      </div>
                      <div style={{ fontSize: 11, color: C.txtMuted }}>
                        {pick.prospect!.college}
                        {pick.prospect!.comparableTo && (
                          <span> · Comp: {pick.prospect!.comparableTo}</span>
                        )}
                      </div>
                    </div>

                    <div>
                      {isSteal && (
                        <Badge color={C.green}>STEAL</Badge>
                      )}
                      {isReach && (
                        <Badge color={C.red}>REACH</Badge>
                      )}
                    </div>
                    <div />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ALL GRADES */}
        {activeTab === 'all-grades' && (
          <motion.div key="all-grades" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '44px 52px 1fr 64px',
                padding: '8px 20px', background: C.panel, borderBottom: `1px solid ${C.border}`,
              }}>
                {['RK', 'TEAM', 'ANALYSIS', 'GRADE'].map((h, i) => (
                  <div key={i} style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.txtMuted }}>
                    {h}
                  </div>
                ))}
              </div>
              {sortedGrades.map((grade, i) => {
                const team = NFL_TEAMS.find(t => t.id === grade.teamId);
                if (!team) return null;
                const isUser = grade.teamId === session.userTeamId;
                const medal = i === 0 ? C.gold : i === 1 ? '#8ECAE6' : i === 2 ? C.amber : null;
                return (
                  <motion.div
                    key={grade.teamId}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.012 }}
                    style={{
                      display: 'grid', gridTemplateColumns: '44px 52px 1fr 64px',
                      alignItems: 'center', padding: '10px 20px',
                      borderBottom: i < sortedGrades.length - 1 ? `1px solid ${C.border}` : 'none',
                      background: isUser ? `${team.primaryColor}08` : 'transparent',
                      transition: 'background 120ms',
                    }}
                    onMouseEnter={e => { if (!isUser) (e.currentTarget as HTMLDivElement).style.background = C.panel; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isUser ? `${team.primaryColor}08` : 'transparent'; }}
                  >
                    <div style={{
                      fontSize: 13, fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                      color: medal ?? C.txtMuted,
                    }}>
                      {i + 1}
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 36, height: 36, borderRadius: 8,
                      background: `${team.primaryColor}20`, border: `1px solid ${team.primaryColor}40`,
                      fontSize: 8, fontWeight: 800, color: team.primaryColor, letterSpacing: '.02em',
                    }}>
                      {team.abbreviation.slice(0, 3)}
                    </div>
                    <div style={{ paddingLeft: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: isUser ? 800 : 600, color: isUser ? C.txt : C.txtSub }}>
                          {team.city} {team.name}
                        </span>
                        {isUser && <Badge color={C.blueBright}>You</Badge>}
                      </div>
                      <div style={{ fontSize: 10, color: C.txtMuted }}>
                        {grade.picks.length} picks · {grade.analysis.slice(0, 58)}…
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <GradeSmall grade={grade.grade} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* FULL BOARD */}
        {activeTab === 'full-board' && (
          <motion.div key="full-board" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
              {[1, 2, 3, 4, 5, 6, 7].map(round => {
                const roundPicks = session.picks.filter(p => p.round === round && p.prospect);
                if (roundPicks.length === 0) return null;
                return (
                  <div key={round} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <div style={{
                      padding: '8px 20px', background: C.panel, borderBottom: `1px solid ${C.border}`,
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: round === 1 ? C.gold : C.txtMuted }}>
                        Round {round}
                      </span>
                      {round === 1 && <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold, display: 'inline-block' }} />}
                      <div style={{ flex: 1, height: 1, background: C.border }} />
                      <span style={{ fontSize: 9, color: C.txtMuted, fontVariantNumeric: 'tabular-nums' }}>{roundPicks.length} picks</span>
                    </div>
                    {roundPicks.map((pick, i) => {
                      const team = NFL_TEAMS.find(t => t.id === pick.teamId);
                      const isUser = pick.teamId === session.userTeamId;
                      return (
                        <div
                          key={pick.overall}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            padding: '9px 20px',
                            borderBottom: i < roundPicks.length - 1 ? `1px solid ${C.border}` : 'none',
                            background: isUser ? `${C.blueBright}08` : 'transparent',
                            transition: 'background 120ms',
                          }}
                          onMouseEnter={e => { if (!isUser) (e.currentTarget as HTMLDivElement).style.background = C.panel; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isUser ? `${C.blueBright}08` : 'transparent'; }}
                        >
                          <div style={{ fontSize: 11, color: C.txtMuted, width: 30, fontVariantNumeric: 'tabular-nums', flexShrink: 0, fontWeight: 700 }}>
                            {pick.overall}
                          </div>
                          <div style={{
                            width: 30, height: 30, borderRadius: 6, flexShrink: 0,
                            background: `${team?.primaryColor ?? C.border}20`, border: `1px solid ${team?.primaryColor ?? C.border}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 7, fontWeight: 900, color: team?.primaryColor ?? C.txtMuted,
                          }}>
                            {team?.abbreviation?.slice(0, 3)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 13, fontWeight: isUser ? 700 : 500, color: isUser ? C.txt : C.txtSub }}>
                              {pick.prospect!.name}
                            </span>
                            <PosBadge pos={pick.prospect!.position} />
                            <span style={{ fontSize: 11, color: C.txtMuted }}>{pick.prospect!.college}</span>
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
    </AppShell>
  );
}
