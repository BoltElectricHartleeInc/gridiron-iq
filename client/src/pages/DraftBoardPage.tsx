import type { CSSProperties, ReactNode } from 'react';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useDraftStore } from '../store/draftStore';
import { NFL_TEAMS } from '../data/teams';
import { IncomingTradeOffer } from '../components/draft/IncomingTradeOffer';
import DraftBoard from '../components/draft/DraftBoard';
import { POS, T, gradeColor, gradeLetter, teamLogoUrl } from '../styles/tokens';
import { API_BASE } from '../lib/api';
import type { Prospect } from '../types/draft';

type SimulationSpeed = 'FAST' | 'NORMAL' | 'SLOW';
type ValueTag = 'STEAL' | 'REACH' | 'VALUE';

type TeamInfo = {
  abbreviation: string;
  city?: string;
  name: string;
  needs: string[];
  avatarUrl?: string;
};

type DraftPlayer = {
  id?: string | number;
  fullName?: string;
  name?: string;
  position: string;
  grade: number;
};

type DraftPick = {
  round: number;
  pickInRound: number;
  overall: number;
  team: { abbreviation: string };
  player?: DraftPlayer | null;
  isUserTeam?: boolean;
  outcome?: ValueTag | null;
};

type BigBoardProspect = {
  id?: string | number;
  rank: number;
  fullName: string;
  school: string;
  position: string;
  grade: number;
  valueTag?: ValueTag;
};

type AdvisorIntel = {
  pick: string;
  fit: string;
  intel: string;
  concern?: string;
};

type ProjectedPick = {
  round: number;
  overall: number;
  positionProjection: string;
};

type DraftBoardPageProps = {
  userTeam: TeamInfo;
  teams: TeamInfo[];
  picks: DraftPick[];
  prospects: BigBoardProspect[];
  currentOverallPick: number;
  speed?: SimulationSpeed;
  paused?: boolean;
  simulationNumber?: number;
  pickClock?: ReactNode;
  advisorLoading?: boolean;
  advisorIntel?: AdvisorIntel | null;
  projectedUserPicks?: ProjectedPick[];
  onSpeedChange?: (speed: SimulationSpeed) => void;
  onPauseToggle?: () => void;
  onSkipToMyPick?: () => void;
  onOpenProspectCard?: (prospect: BigBoardProspect) => void;
  renderProspectCard?: (prospect: BigBoardProspect, close: () => void) => ReactNode;
  tradeModal?: ReactNode;
  incomingTradeOffer?: ReactNode;
  compareModal?: ReactNode;
  style?: CSSProperties;
};

const POSITION_FILTERS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'OT', 'OG', 'C', 'EDGE', 'DT', 'LB', 'CB', 'S'] as const;

const VALUE_COLORS: Record<ValueTag, string> = {
  STEAL: T.green,
  REACH: T.red,
  VALUE: T.blueBright,
};

const SPEEDS: SimulationSpeed[] = ['FAST', 'NORMAL', 'SLOW'];

function keyFromName(value: string): string {
  return value.trim().toUpperCase();
}

function lastName(value: string): string {
  const parts = value.trim().split(/\s+/);
  return (parts[parts.length - 1] ?? value).toUpperCase();
}

function projectedRoundFromOverall(overall: number): number {
  return Math.max(1, Math.ceil(overall / 32));
}

function projectedPickInRound(overall: number): number {
  return ((overall - 1) % 32) + 1;
}

function rowNeedTint(position: string): string {
  const palette = POS[position];
  return palette?.bg ?? T.blueSub;
}

function initials(team: TeamInfo): string {
  return team.abbreviation.slice(0, 2).toUpperCase();
}

function resolveValueTag(prospect: BigBoardProspect): ValueTag {
  if (prospect.valueTag) return prospect.valueTag;
  if (prospect.grade >= 88) return 'STEAL';
  if (prospect.grade <= 72) return 'REACH';
  return 'VALUE';
}

function getRoundClockSeconds(round: number): number {
  if (round === 1) return 600; // 10 min
  if (round === 2) return 420; // 7 min
  return 300;                  // 5 min rounds 3-7
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function clockColor(seconds: number, maxSeconds: number): string {
  const pct = seconds / maxSeconds;
  if (pct > 0.5) return '#00C853';   // green
  if (pct > 0.2) return '#FF8F00';   // amber
  return '#F44336';                   // red
}

type ProspectCardProps = {
  prospect: BigBoardProspect;
  fullProspect?: Prospect;
  isUserTurn: boolean;
  onDraft: () => void;
  onClose: () => void;
};

function ProspectCard({ prospect, fullProspect, isUserTurn, onDraft, onClose }: ProspectCardProps) {
  const [tab, setTab] = useState<'card' | 'report'>('card');
  const [reportText, setReportText] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const posPalette = POS[prospect.position] ?? { bg: T.blueSub, border: T.borderFoc, text: T.blueBright, pill: T.panel };

  const fetchReport = async () => {
    if (reportText || reportLoading) return;
    setReportLoading(true);
    setReportError('');
    try {
      const body = fullProspect
        ? { ...fullProspect }
        : { name: prospect.fullName, position: prospect.position, college: prospect.school, grade: prospect.grade, traits: [], description: '', strengths: [], weaknesses: [] };
      const res = await fetch(`${API_BASE}/api/scouting/deep-dive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok || !res.body) throw new Error('Request failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        if (chunk.value) setReportText(prev => prev + decoder.decode(chunk.value));
      }
    } catch {
      setReportError('Failed to load. Check server connection.');
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'report') fetchReport();
  }, [tab]);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(4,9,17,0.82)', display: 'grid', placeItems: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: 'min(560px,100%)', background: T.surface, border: `1px solid ${T.borderHi}`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '88vh' }}
      >
        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: T.txt, letterSpacing: '-.01em' }}>{prospect.fullName}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 800, borderRadius: 999, border: `1px solid ${posPalette.border}`, background: posPalette.bg, color: posPalette.text, padding: '3px 9px' }}>
                  {prospect.position}
                </span>
                <span style={{ fontSize: 12, color: T.txtSub }}>{prospect.school}</span>
                <span style={{ fontSize: 11, color: T.txtMuted }}>#{prospect.rank}</span>
                {fullProspect?.comparableTo && (
                  <span style={{ fontSize: 10, color: T.gold, fontWeight: 700 }}>comp: {fullProspect.comparableTo}</span>
                )}
              </div>
            </div>
            <div style={{ fontSize: 52, fontWeight: 900, color: gradeColor(prospect.grade), lineHeight: 1, letterSpacing: '-.02em' }}>
              {gradeLetter(prospect.grade)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          {(['card', 'report'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '10px 0', background: 'none', border: 'none',
                borderBottom: tab === t ? `2px solid ${T.blueBright}` : '2px solid transparent',
                color: tab === t ? T.blueBright : T.txtSub,
                fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'color 120ms',
              }}
            >
              {t === 'card' ? 'CARD' : '⚡ SCOUT REPORT'}
            </button>
          ))}
        </div>

        {/* Card tab */}
        {tab === 'card' && (
          <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
            {fullProspect ? (
              <>
                {/* Measurables */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
                  {[
                    { label: 'Height', val: fullProspect.height },
                    { label: 'Weight', val: `${fullProspect.weight} lbs` },
                    { label: '40-Yard', val: fullProspect.fortyTime ? `${fullProspect.fortyTime}s` : '—' },
                    { label: 'Round', val: `Round ${fullProspect.round}` },
                    { label: 'Trend', val: fullProspect.draftStockTrend ?? 'steady' },
                    { label: 'Grade', val: String(fullProspect.grade) },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, color: T.txtMuted, fontWeight: 800, letterSpacing: '.12em', marginBottom: 3 }}>{label.toUpperCase()}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.txt }}>{val}</div>
                    </div>
                  ))}
                </div>
                {/* Traits */}
                {fullProspect.traits.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 9, color: T.txtMuted, fontWeight: 800, letterSpacing: '.12em', marginBottom: 6 }}>KEY TRAITS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {fullProspect.traits.map(tr => (
                        <span key={tr} style={{ fontSize: 10, fontWeight: 700, borderRadius: 999, background: T.elevated, border: `1px solid ${T.borderHi}`, color: T.txtSub, padding: '3px 9px' }}>{tr}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Strengths / Weaknesses */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 9, color: T.green, fontWeight: 800, letterSpacing: '.12em', marginBottom: 6 }}>STRENGTHS</div>
                    {fullProspect.strengths.map(s => <div key={s} style={{ fontSize: 11, color: T.txtSub, marginBottom: 3 }}>✓ {s}</div>)}
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: T.red, fontWeight: 800, letterSpacing: '.12em', marginBottom: 6 }}>CONCERNS</div>
                    {fullProspect.weaknesses.map(w => <div key={w} style={{ fontSize: 11, color: T.txtSub, marginBottom: 3 }}>⚠ {w}</div>)}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: T.txtSub, fontSize: 12, padding: '16px 0' }}>No extended data available for this prospect.</div>
            )}
          </div>
        )}

        {/* Scout report tab */}
        {tab === 'report' && (
          <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
            {reportLoading && !reportText && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: T.txtSub, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.blueBright, animation: 'commandPulse 1s ease-in-out infinite', display: 'inline-block' }} />
                Generating scouting report...
              </div>
            )}
            {reportError && <div style={{ color: T.red, fontSize: 12 }}>{reportError}</div>}
            {reportText && (
              <div style={{ fontSize: 12, color: T.txtSub, lineHeight: 1.75, whiteSpace: 'pre-wrap', fontFamily: T.fontBase }}>
                {reportText}
                {reportLoading && <span style={{ opacity: 0.5, animation: 'commandPulse 0.8s ease-in-out infinite', display: 'inline-block', marginLeft: 2 }}>▋</span>}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 10, flexShrink: 0 }}>
          {isUserTurn && (
            <button
              onClick={onDraft}
              style={{ flex: 1, background: `linear-gradient(135deg, #1565C0, #2196F3)`, border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 800, padding: '13px 0', cursor: 'pointer', letterSpacing: '.04em' }}
            >
              DRAFT {prospect.fullName.split(' ').pop()?.toUpperCase()} →
            </button>
          )}
          <button
            onClick={onClose}
            style={{ padding: '13px 20px', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 10, color: T.txtSub, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function defaultProspectCard(prospect: BigBoardProspect, close: () => void): ReactNode {
  const posPalette = POS[prospect.position] ?? { bg: T.blueSub, border: T.borderFoc, text: T.blueBright, pill: T.panel };
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(4, 9, 17, 0.7)',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
      }}
      onClick={close}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 'min(540px, 100%)',
          background: T.surface,
          border: `1px solid ${T.borderHi}`,
          borderRadius: 14,
          padding: 16,
          color: T.txt,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.txt, letterSpacing: '-.01em' }}>{prospect.fullName}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', borderRadius: 999, border: `1px solid ${posPalette.border}`, background: posPalette.bg, color: posPalette.text, padding: '4px 8px' }}>
                {prospect.position}
              </span>
              <span style={{ color: T.txtSub, fontSize: 11 }}>{prospect.school}</span>
              <span style={{ color: T.txtMuted, fontSize: 11 }}>#{prospect.rank}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ fontSize: 42, fontWeight: 900, color: gradeColor(prospect.grade), lineHeight: 1 }}>{gradeLetter(prospect.grade)}</div>
            <button
              type="button"
              onClick={close}
              style={{ border: `1px solid ${T.border}`, background: T.panel, color: T.txtSub, borderRadius: 8, fontSize: 11, padding: '6px 9px', cursor: 'pointer' }}
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DraftBoardLayout({
  userTeam,
  teams,
  picks,
  prospects,
  currentOverallPick,
  speed = 'NORMAL',
  paused = false,
  simulationNumber = 1,
  pickClock,
  advisorLoading = false,
  advisorIntel = null,
  projectedUserPicks,
  onSpeedChange,
  onPauseToggle,
  onSkipToMyPick,
  onOpenProspectCard,
  renderProspectCard,
  tradeModal,
  incomingTradeOffer,
  compareModal,
  style,
}: DraftBoardPageProps) {
  const [activePosition, setActivePosition] = useState<(typeof POSITION_FILTERS)[number]>('ALL');
  const [selectedProspect, setSelectedProspect] = useState<BigBoardProspect | null>(null);

  const teamLookup = useMemo(() => {
    const map = new Map<string, TeamInfo>();
    teams.forEach((team) => map.set(team.abbreviation, team));
    map.set(userTeam.abbreviation, userTeam);
    return map;
  }, [teams, userTeam]);

  const currentPick = useMemo(() => picks.find((pick) => pick.overall === currentOverallPick) ?? null, [picks, currentOverallPick]);
  const onClockTeam = useMemo(() => {
    if (!currentPick) return userTeam;
    return teamLookup.get(currentPick.team.abbreviation) ?? { abbreviation: currentPick.team.abbreviation, name: currentPick.team.abbreviation, needs: [] };
  }, [currentPick, teamLookup, userTeam]);

  const isUsersTurn = onClockTeam.abbreviation === userTeam.abbreviation;
  const currentRound = currentPick?.round ?? projectedRoundFromOverall(currentOverallPick);
  const currentPickInRound = currentPick?.pickInRound ?? projectedPickInRound(currentOverallPick);
  const currentNeed = onClockTeam.needs[0] ?? '';

  const draftedNames = useMemo(() => {
    const set = new Set<string>();
    picks.forEach((pick) => {
      const n = pick.player?.fullName ?? pick.player?.name;
      if (n) set.add(keyFromName(n));
    });
    return set;
  }, [picks]);

  const remainingProspects = useMemo(
    () => prospects.filter((prospect) => !draftedNames.has(keyFromName(prospect.fullName))),
    [prospects, draftedNames],
  );

  const filteredProspects = useMemo(() => {
    const sorted = remainingProspects.slice().sort((a, b) => a.rank - b.rank);
    if (activePosition === 'ALL') return sorted;
    return sorted.filter((prospect) => prospect.position === activePosition);
  }, [remainingProspects, activePosition]);

  const myPicksTotal = Math.max(7, picks.filter((pick) => pick.isUserTeam).length || 7);
  const myCompletedPicks = picks.filter((pick) => pick.isUserTeam && pick.player);
  const myUpcomingFromBoard = picks
    .filter((pick) => pick.isUserTeam && !pick.player)
    .slice()
    .sort((a, b) => a.overall - b.overall)
    .map((pick, idx) => ({
      round: pick.round,
      overall: pick.overall,
      positionProjection:
        remainingProspects[Math.min(idx, Math.max(remainingProspects.length - 1, 0))]?.position ?? (userTeam.needs[idx] ?? userTeam.needs[0] ?? 'BPA'),
    }));
  const myUpcomingPicks = projectedUserPicks ?? myUpcomingFromBoard;

  const runningGrade = useMemo(() => {
    if (!myCompletedPicks.length) return 70;
    const total = myCompletedPicks.reduce((sum, pick) => sum + (pick.player?.grade ?? 70), 0);
    return total / myCompletedPicks.length;
  }, [myCompletedPicks]);

  const recentPicks = useMemo(() => {
    return picks
      .filter((pick) => pick.player)
      .slice()
      .sort((a, b) => b.overall - a.overall)
      .slice(0, 5);
  }, [picks]);

  const closeProspectCard = () => setSelectedProspect(null);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        height: '100vh',
        background: T.bg,
        color: T.txt,
        fontFamily: T.fontBase,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      <style>
        {`
          @keyframes commandPulse {
            0% { opacity: 0.55; transform: scale(0.95); }
            50% { opacity: 1; transform: scale(1.05); }
            100% { opacity: 0.55; transform: scale(0.95); }
          }

          @keyframes skeletonShimmer {
            0% { background-position: -200px 0; }
            100% { background-position: calc(200px + 100%) 0; }
          }

          .position-filter-pill {
            border: 1px solid ${T.border};
            background: ${T.panel};
            color: ${T.txtSub};
            border-radius: 999px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.04em;
            padding: 4px 8px;
            cursor: pointer;
            text-transform: uppercase;
            white-space: nowrap;
          }

          .position-filter-pill.active {
            color: ${T.blueBright};
            border-color: ${T.borderFoc};
            background: ${T.blueSub};
          }

          .big-board-row {
            border: 1px solid transparent;
            border-radius: 7px;
            transition: background 120ms ease, border-color 120ms ease;
          }

          .big-board-row:hover {
            background: ${T.elevated};
            border-color: ${T.borderHi};
          }

          .advisor-skeleton {
            height: 9px;
            border-radius: 999px;
            background: linear-gradient(90deg, ${T.panel} 0px, ${T.elevated} 40px, ${T.panel} 80px);
            background-size: 200px 9px;
            animation: skeletonShimmer 1.2s linear infinite;
          }
        `}
      </style>

      <header
        style={{
          height: 44,
          minHeight: 44,
          borderBottom: `1px solid ${T.border}`,
          background: T.surface,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 10,
          alignItems: 'center',
          padding: '0 12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              background: `linear-gradient(135deg, ${T.blueBright} 0%, ${T.blue} 100%)`,
              display: 'grid',
              placeItems: 'center',
              fontSize: 10,
              color: T.txtInvert,
              fontWeight: 900,
            }}
          >
            GIQ
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: T.txtSub, whiteSpace: 'nowrap' }}>
            2026 NFL DRAFT — LIVE BOARD
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <img src={teamLogoUrl(onClockTeam.abbreviation)} alt={`${onClockTeam.name} logo`} style={{ width: 24, height: 24, objectFit: 'contain' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: T.txt, fontSize: 12, whiteSpace: 'nowrap' }}>
            <span style={{ fontWeight: 700 }}>{onClockTeam.name.toUpperCase()} ON THE CLOCK</span>
            <span style={{ color: T.txtSub }}>
              Pick #{currentOverallPick} · Rd {currentRound} · {currentPickInRound} of 32
            </span>
            {isUsersTurn && (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: T.blueBright,
                  animation: 'commandPulse 1.1s ease-in-out infinite',
                }}
              />
            )}
          </div>
          {pickClock && (
            <>
              <span style={{ color: T.border, fontSize: 14, marginLeft: 4 }}>|</span>
              {pickClock}
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {SPEEDS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onSpeedChange?.(item)}
                style={{
                  border: `1px solid ${speed === item ? T.borderFoc : T.border}`,
                  background: speed === item ? T.blueSub : T.panel,
                  color: speed === item ? T.blueBright : T.txtSub,
                  borderRadius: 7,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '4px 8px',
                  cursor: 'pointer',
                }}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onPauseToggle}
            style={{
              border: `1px solid ${paused ? T.borderFoc : T.border}`,
              background: paused ? T.blueSub : T.panel,
              color: paused ? T.blueBright : T.txtSub,
              borderRadius: 7,
              fontSize: 10,
              fontWeight: 700,
              padding: '4px 9px',
              cursor: 'pointer',
            }}
          >
            PAUSE
          </button>
          <div
            style={{
              border: `1px solid ${T.border}`,
              borderRadius: 7,
              background: T.panel,
              color: T.txtSub,
              fontSize: 10,
              fontWeight: 700,
              padding: '4px 8px',
              whiteSpace: 'nowrap',
            }}
          >
            Sim {simulationNumber}
          </div>
          <button
            type="button"
            onClick={onSkipToMyPick}
            style={{
              border: `1px solid ${T.borderFoc}`,
              borderRadius: 7,
              background: T.blueSub,
              color: T.blueBright,
              fontSize: 10,
              fontWeight: 700,
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            Skip to My Pick →
          </button>
          {pickClock}
        </div>
      </header>

      <main
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '280px minmax(0, 1fr) 300px',
          gap: 0,
        }}
      >
        <aside
          style={{
            minHeight: 0,
            borderRight: `1px solid ${T.border}`,
            background: T.surface,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: '10px 10px 8px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: T.txtSub }}>BIG BOARD</div>
              <div style={{ fontSize: 10, color: T.txtMuted, fontWeight: 700 }}>{remainingProspects.length} remaining</div>
            </div>
            <div style={{ marginTop: 8, display: 'flex', overflowX: 'auto', gap: 6, paddingBottom: 2 }}>
              {POSITION_FILTERS.map((position) => (
                <button
                  key={position}
                  type="button"
                  className={`position-filter-pill${activePosition === position ? ' active' : ''}`}
                  onClick={() => setActivePosition(position)}
                >
                  {position}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 8 }}>
            {filteredProspects.map((prospect) => {
              const posPalette = POS[prospect.position] ?? { bg: T.blueSub, border: T.borderFoc, text: T.blueBright, pill: T.panel };
              const valueTag = resolveValueTag(prospect);
              const needMatch = Boolean(currentNeed && prospect.position === currentNeed);
              return (
                <button
                  key={`${prospect.rank}-${prospect.fullName}`}
                  type="button"
                  className="big-board-row"
                  onClick={() => {
                    setSelectedProspect(prospect);
                    onOpenProspectCard?.(prospect);
                  }}
                  style={{
                    width: '100%',
                    height: 40,
                    display: 'grid',
                    gridTemplateColumns: '24px 32px minmax(0, 1fr) auto auto',
                    alignItems: 'center',
                    gap: 7,
                    padding: '0 6px',
                    textAlign: 'left',
                    background: needMatch ? rowNeedTint(prospect.position) : 'transparent',
                    marginBottom: 4,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ color: T.txtMuted, fontSize: 10, fontVariantNumeric: 'tabular-nums' }}>{prospect.rank}</div>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 7,
                      border: `1px solid ${gradeColor(prospect.grade)}`,
                      color: gradeColor(prospect.grade),
                      background: `${gradeColor(prospect.grade)}1A`,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {gradeLetter(prospect.grade)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        color: T.txt,
                        fontSize: 13,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {prospect.fullName}
                    </div>
                    <div style={{ color: T.txtSub, fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {prospect.school}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      color: posPalette.text,
                      border: `1px solid ${posPalette.border}`,
                      background: posPalette.bg,
                      borderRadius: 999,
                      padding: '3px 6px',
                    }}
                  >
                    {prospect.position}
                  </span>
                  <span style={{ fontSize: 8, fontWeight: 800, color: VALUE_COLORS[valueTag], letterSpacing: '0.04em' }}>{valueTag}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section style={{ minHeight: 0, background: T.bg, padding: 8 }}>
          <DraftBoard
            picks={picks}
            currentOverallPick={currentOverallPick}
            rounds={Math.max(1, Math.ceil((Math.max(...picks.map((pick) => pick.overall), 224)) / 32))}
            picksPerRound={32}
            style={{ width: '100%', height: '100%' }}
          />
        </section>

        <aside
          style={{
            minHeight: 0,
            borderLeft: `1px solid ${T.border}`,
            background: T.surface,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: 10,
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: T.txtSub }}>WAR ROOM</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {userTeam.avatarUrl ? (
                <img src={userTeam.avatarUrl} alt={`${userTeam.abbreviation} avatar`} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    border: `1px solid ${T.borderFoc}`,
                    background: T.blueSub,
                    color: T.blueBright,
                    fontSize: 10,
                    fontWeight: 800,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {initials(userTeam)}
                </div>
              )}
              <span style={{ color: T.txt, fontSize: 11, fontWeight: 700 }}>{userTeam.abbreviation}</span>
            </div>
          </div>

          <section
            style={{
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              background: T.panel,
              padding: 10,
            }}
          >
            <div style={{ fontSize: 9, color: T.txtMuted, fontWeight: 800, letterSpacing: '0.14em', marginBottom: 8 }}>TEAM NEEDS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {userTeam.needs.slice(0, 5).map((need, idx) => {
                const palette = POS[need] ?? { bg: T.blueSub, border: T.borderFoc, text: T.blueBright, pill: T.panel };
                return (
                  <div key={`${need}-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {idx === 0 && (
                      <div style={{ fontSize: 8, color: T.goldBright, fontWeight: 800, letterSpacing: '0.06em' }}>PRIMARY NEED</div>
                    )}
                    <span
                      style={{
                        fontSize: 8,
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        borderRadius: 999,
                        border: `1px solid ${palette.border}`,
                        background: palette.bg,
                        color: palette.text,
                        padding: '4px 7px',
                      }}
                    >
                      #{idx + 1} {need}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section
            style={{
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              background: T.panel,
              padding: 10,
            }}
          >
            <div style={{ fontSize: 9, color: T.txtMuted, fontWeight: 800, letterSpacing: '0.14em', marginBottom: 8 }}>
              MY PICKS — {myCompletedPicks.length} of {myPicksTotal}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {/* ── Completed picks: player name + grade ── */}
              {myCompletedPicks.map((pick) => {
                const fullName = pick.player?.fullName ?? pick.player?.name ?? '—';
                const last = fullName.split(' ').slice(-1)[0];
                const grade = pick.player?.grade ?? 70;
                const gradeLabel = grade >= 90 ? 'A+' : grade >= 85 ? 'A' : grade >= 80 ? 'A-' : grade >= 77 ? 'B+' : grade >= 73 ? 'B' : grade >= 70 ? 'B-' : 'C+';
                const gradeColor = grade >= 85 ? T.green : grade >= 77 ? T.blueBright : grade >= 70 ? T.gold : T.txtSub;
                return (
                  <div
                    key={`my-done-${pick.overall}`}
                    style={{
                      display: 'grid', gridTemplateColumns: '32px 1fr auto auto',
                      gap: 5, alignItems: 'center', padding: '5px 7px',
                      borderRadius: 7, border: `1px solid ${T.green}30`,
                      background: `${T.green}08`,
                    }}
                  >
                    <span style={{ fontSize: 9, color: T.txtMuted, fontWeight: 700 }}>R{pick.round}</span>
                    <span style={{ fontSize: 11, color: T.txt, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{last}</span>
                    <span style={{ fontSize: 9, color: T.txtSub, fontWeight: 600 }}>{pick.player?.position}</span>
                    <span style={{ fontSize: 11, fontWeight: 900, color: gradeColor }}>{gradeLabel}</span>
                  </div>
                );
              })}
              {/* ── Upcoming picks ── */}
              {myUpcomingPicks.slice(0, Math.max(0, 6 - myCompletedPicks.length)).map((pick) => (
                <div
                  key={`my-proj-${pick.round}-${pick.overall}`}
                  style={{
                    display: 'grid', gridTemplateColumns: '32px 44px 1fr',
                    gap: 5, alignItems: 'center', padding: '5px 7px',
                    borderRadius: 7, border: `1px dashed ${T.border}`,
                    background: T.elevated, opacity: 0.65,
                  }}
                >
                  <span style={{ fontSize: 9, color: T.txtSub, fontWeight: 700 }}>R{pick.round}</span>
                  <span style={{ fontSize: 9, color: T.txtMuted, fontWeight: 700 }}>#{pick.overall}</span>
                  <span style={{ fontSize: 10, color: T.txtSub, fontWeight: 700 }}>{pick.positionProjection}</span>
                </div>
              ))}
            </div>
          </section>

          <section
            style={{
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              background: T.panel,
              padding: 10,
            }}
          >
            <div style={{ fontSize: 9, color: T.txtMuted, fontWeight: 800, letterSpacing: '0.14em', marginBottom: 8 }}>AI WAR ROOM ADVISOR</div>
            {advisorLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="advisor-skeleton" style={{ width: '58%' }} />
                <div className="advisor-skeleton" style={{ width: '92%' }} />
                <div className="advisor-skeleton" style={{ width: '84%' }} />
                <div className="advisor-skeleton" style={{ width: '67%' }} />
              </div>
            ) : advisorIntel ? (
              <div
                style={{
                  borderRadius: 9,
                  border: `1px solid ${T.gold}`,
                  background: T.goldSub,
                  padding: 9,
                }}
              >
                <div style={{ fontSize: 9, color: T.goldBright, fontWeight: 900, letterSpacing: '0.08em' }}>⚡ WAR ROOM INTEL</div>
                <div style={{ marginTop: 7, fontSize: 11, color: T.txt }}>
                  <strong>PICK:</strong> {advisorIntel.pick}
                </div>
                <div style={{ marginTop: 4, fontSize: 11, color: T.txtSub }}>
                  <strong>FIT:</strong> {advisorIntel.fit}
                </div>
                <div style={{ marginTop: 4, fontSize: 11, color: T.txtSub }}>
                  <strong>INTEL:</strong> {advisorIntel.intel}
                </div>
                {advisorIntel.concern && (
                  <div style={{ marginTop: 4, fontSize: 11, color: T.amber }}>
                    <strong>CONCERN:</strong> {advisorIntel.concern}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: T.txtSub, fontSize: 11 }}>Advisor standing by for next actionable window.</div>
            )}
          </section>

          <section
            style={{
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              background: T.panel,
              padding: 10,
            }}
          >
            <div style={{ fontSize: 9, color: T.txtMuted, fontWeight: 800, letterSpacing: '0.14em', marginBottom: 8 }}>DRAFT GRADE TRACKER</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  minWidth: 44,
                  textAlign: 'center',
                  borderRadius: 999,
                  border: `1px solid ${gradeColor(runningGrade)}`,
                  color: gradeColor(runningGrade),
                  background: `${gradeColor(runningGrade)}1A`,
                  fontSize: 12,
                  fontWeight: 900,
                  padding: '4px 8px',
                }}
              >
                {gradeLetter(runningGrade)}
              </span>
              <span style={{ color: T.txtSub, fontSize: 11, fontWeight: 600 }}>
                Avg grade {runningGrade.toFixed(1)} across {myCompletedPicks.length || 0} user picks
              </span>
            </div>
          </section>

          <section
            style={{
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              background: T.panel,
              padding: 10,
            }}
          >
            <div style={{ fontSize: 9, color: T.txtMuted, fontWeight: 800, letterSpacing: '0.14em', marginBottom: 8 }}>RECENT PICKS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {recentPicks.map((pick) => {
                const name = pick.player?.fullName ?? pick.player?.name ?? 'Unknown';
                return (
                  <div key={`recent-${pick.overall}`} style={{ display: 'grid', gridTemplateColumns: '20px 1fr auto', alignItems: 'center', gap: 7 }}>
                    <img src={teamLogoUrl(pick.team.abbreviation)} alt={`${pick.team.abbreviation} logo`} style={{ width: 18, height: 18, objectFit: 'contain' }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: T.txt, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lastName(name)}
                      </div>
                      <div style={{ fontSize: 9, color: T.txtSub }}>#{pick.overall}</div>
                    </div>
                    <div style={{ fontSize: 9, color: T.txtMuted, fontWeight: 700 }}>{pick.player?.position ?? 'BPA'}</div>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </main>

      {incomingTradeOffer}
      {tradeModal}
      {compareModal}

      {selectedProspect &&
        (renderProspectCard ? renderProspectCard(selectedProspect, closeProspectCard) : defaultProspectCard(selectedProspect, closeProspectCard))}
    </div>
  );
}

// ─── Store-connected page (used by App router with no props) ─────────────────
export function DraftBoardPage() {
  const navigate = useNavigate();
  const {
    session, availableProspects,
    simulateNextPick, simulateToUserPick, makePick,
    incomingTradeOffer, generateAITradeOffer, respondToAITradeOffer, dismissTradeOffer,
  } = useDraftStore();

  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<SimulationSpeed>('NORMAL');
  const simRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const speedMs: Record<SimulationSpeed, number> = { FAST: 600, NORMAL: 1400, SLOW: 2800 };

  // ── Simulation engine: auto-advance AI picks ──────────────────────────────
  const tick = useCallback(() => {
    if (!session || session.status !== 'drafting' || paused) return;
    const currentPick = session.picks[session.currentPickIndex];
    if (!currentPick) return;
    if (currentPick.isUserPick) return; // stop and wait for user
    simulateNextPick();
  }, [session, paused, simulateNextPick]);

  useEffect(() => {
    if (simRef.current) clearTimeout(simRef.current);
    if (!session || session.status !== 'drafting' || paused) return;
    const currentPick = session.picks[session.currentPickIndex];
    if (!currentPick || currentPick.isUserPick) return;
    simRef.current = setTimeout(tick, speedMs[speed]);
    return () => { if (simRef.current) clearTimeout(simRef.current); };
  }, [session?.currentPickIndex, paused, speed, tick]);

  // Navigate to results when draft completes
  useEffect(() => {
    if (session?.status === 'complete') navigate('/draft/results');
  }, [session?.status]);

  const teamMap = useMemo(() => {
    const m = new Map<string, typeof NFL_TEAMS[number]>();
    NFL_TEAMS.forEach((t) => m.set(t.id, t));
    return m;
  }, []);

  const toTeamInfo = (teamId: string): TeamInfo => {
    const t = teamMap.get(teamId);
    return {
      abbreviation: t?.abbreviation ?? teamId.toUpperCase(),
      city: t?.city,
      name: t?.name ?? teamId,
      needs: (t?.needs ?? []) as string[],
    };
  };

  const teams: TeamInfo[] = useMemo(
    () => NFL_TEAMS.map((t) => toTeamInfo(t.id)),
    [teamMap]
  );

  const userTeam: TeamInfo = useMemo(
    () => (session ? toTeamInfo(session.userTeamId) : { abbreviation: '', name: '', needs: [] }),
    [session, teamMap]
  );

  const picks: DraftPick[] = useMemo(
    () =>
      (session?.picks ?? []).map((p) => ({
        round: p.round,
        pickInRound: p.pickInRound,
        overall: p.overall,
        team: { abbreviation: teamMap.get(p.teamId)?.abbreviation ?? p.teamId.toUpperCase() },
        player: p.prospect
          ? { id: p.prospect.id, fullName: p.prospect.name, position: p.prospect.position, grade: p.prospect.grade }
          : null,
        isUserTeam: p.isUserPick,
        outcome: null,
      })),
    [session, teamMap]
  );

  const prospects: BigBoardProspect[] = useMemo(
    () =>
      availableProspects.map((p, i) => ({
        id: p.id,
        rank: i + 1,
        fullName: p.name,
        school: p.college,
        position: p.position,
        grade: p.grade,
        valueTag: undefined,
      })),
    [availableProspects]
  );

  const currentOverallPick = session
    ? (session.picks[session.currentPickIndex]?.overall ?? 1)
    : 1;

  const isUserTurn = session
    ? (session.picks[session.currentPickIndex]?.isUserPick ?? false)
    : false;

  // ── Fire trade offer the moment the user's pick arrives ──────────────────
  const wasUserTurnRef = useRef(false);
  useEffect(() => {
    if (isUserTurn && !wasUserTurnRef.current) {
      generateAITradeOffer();
    }
    wasUserTurnRef.current = isUserTurn;
  }, [isUserTurn]);

  // ── Auto-dismiss any offer that has expired ───────────────────────────────
  useEffect(() => {
    if (incomingTradeOffer && session && session.currentPickIndex > incomingTradeOffer.expiresAtPickIndex) {
      dismissTradeOffer();
    }
  }, [session?.currentPickIndex]);

  // ── NFL pick clock ────────────────────────────────────────────────────────
  const [clockSeconds, setClockSeconds] = useState(600);
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockMaxRef = useRef(600);

  // Reset clock when the pick changes
  useEffect(() => {
    const currentPick = session?.picks[session.currentPickIndex];
    const round = currentPick?.round ?? 1;
    const maxSec = getRoundClockSeconds(round);
    clockMaxRef.current = maxSec;
    setClockSeconds(maxSec);

    if (clockRef.current) clearInterval(clockRef.current);
    if (!session || session.status !== 'drafting') return;

    clockRef.current = setInterval(() => {
      setClockSeconds(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => { if (clockRef.current) clearInterval(clockRef.current); };
  }, [session?.currentPickIndex, session?.status]);

  // Auto-pick when clock expires on user's turn
  useEffect(() => {
    if (clockSeconds === 0 && isUserTurn && availableProspects.length > 0) {
      makePick(availableProspects[0].id);
    }
  }, [clockSeconds]);

  const renderProspectCard = useCallback((prospect: BigBoardProspect, close: () => void) => {
    const fullProspect = availableProspects.find(p => p.id === String(prospect.id));
    return (
      <ProspectCard
        prospect={prospect}
        fullProspect={fullProspect}
        isUserTurn={isUserTurn}
        onDraft={() => { makePick(String(prospect.id)); close(); }}
        onClose={close}
      />
    );
  }, [isUserTurn, makePick, availableProspects]);

  // ── User's raw store picks (needed by IncomingTradeOffer for counter logic) ─
  const userStorePicks = session?.picks.filter(p => p.isUserPick) ?? [];

  const incomingTradeOfferNode = incomingTradeOffer ? (
    <AnimatePresence>
      <IncomingTradeOffer
        key={incomingTradeOffer.id}
        offer={incomingTradeOffer}
        currentPickIndex={session?.currentPickIndex ?? 0}
        userPicks={userStorePicks}
        onAccept={() => respondToAITradeOffer(true)}
        onDecline={() => dismissTradeOffer()}
      />
    </AnimatePresence>
  ) : null;

  const currentRoundForClock = session?.picks[session.currentPickIndex]?.round ?? 1;
  const clockMax = getRoundClockSeconds(currentRoundForClock);
  const clockCol = clockColor(clockSeconds, clockMax);

  const pickClockNode = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      background: `${clockCol}15`,
      border: `1px solid ${clockCol}50`,
      borderRadius: 7, padding: '3px 9px',
      animation: clockSeconds <= 10 && isUserTurn ? 'commandPulse 0.6s ease-in-out infinite' : 'none',
    }}>
      <span style={{ fontSize: 10, color: clockCol, fontWeight: 700, opacity: 0.7 }}>⏱</span>
      <span style={{ fontSize: 13, fontWeight: 900, color: clockCol, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
        {formatClock(clockSeconds)}
      </span>
      <span style={{ fontSize: 9, color: clockCol, fontWeight: 700, opacity: 0.6 }}>
        RD{currentRoundForClock}
      </span>
    </div>
  );

  return (
    <DraftBoardLayout
      userTeam={userTeam}
      teams={teams}
      picks={picks}
      prospects={prospects}
      currentOverallPick={currentOverallPick}
      paused={paused}
      speed={speed}
      onPauseToggle={() => setPaused(p => !p)}
      onSpeedChange={setSpeed}
      onSkipToMyPick={() => { setPaused(false); simulateToUserPick(); }}
      renderProspectCard={renderProspectCard}
      incomingTradeOffer={incomingTradeOfferNode}
      pickClock={pickClockNode}
    />
  );
}

export default DraftBoardPage;
