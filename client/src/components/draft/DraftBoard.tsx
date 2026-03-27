import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NFL_TEAMS } from '../../data/teams';
import { getPickIndicator } from '../../store/draftStore';
import type { DraftPick } from '../../types/draft';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const S = {
  bg:       '#0b0f18',
  surface:  '#0f1623',
  elevated: '#141d2e',
  border:   '#1c2d40',
  txt:      '#cdd8e8',
  txtSub:   '#6b82a0',
  txtMuted: '#334560',
  blue:     '#3b7dd8',
  gold:     '#c49a1a',
  green:    '#1e8c4e',
  red:      '#b53838',
};

// ─── Position color map — exported for use in DraftBoardPage ────────────────
export const POSITION_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  QB:   { bg: 'rgba(37,99,235,0.18)',   border: 'rgba(37,99,235,0.45)',   text: '#6699e8' },
  RB:   { bg: 'rgba(22,163,74,0.18)',   border: 'rgba(22,163,74,0.45)',   text: '#55b87a' },
  WR:   { bg: 'rgba(180,100,0,0.18)',   border: 'rgba(180,100,0,0.45)',   text: '#c07820' },
  TE:   { bg: 'rgba(100,30,180,0.18)',  border: 'rgba(100,30,180,0.45)',  text: '#9966cc' },
  OT:   { bg: 'rgba(60,80,100,0.18)',   border: 'rgba(60,80,100,0.45)',   text: '#7a95aa' },
  OG:   { bg: 'rgba(50,70,90,0.18)',    border: 'rgba(50,70,90,0.45)',    text: '#6a8898' },
  C:    { bg: 'rgba(40,60,80,0.18)',    border: 'rgba(40,60,80,0.45)',    text: '#5a7888' },
  EDGE: { bg: 'rgba(180,35,35,0.18)',   border: 'rgba(180,35,35,0.45)',   text: '#cc5555' },
  DE:   { bg: 'rgba(180,35,35,0.18)',   border: 'rgba(180,35,35,0.45)',   text: '#cc5555' },
  DT:   { bg: 'rgba(180,70,20,0.18)',   border: 'rgba(180,70,20,0.45)',   text: '#c06030' },
  LB:   { bg: 'rgba(150,110,0,0.18)',   border: 'rgba(150,110,0,0.45)',   text: '#b88818' },
  OLB:  { bg: 'rgba(150,110,0,0.18)',   border: 'rgba(150,110,0,0.45)',   text: '#b88818' },
  CB:   { bg: 'rgba(10,120,110,0.18)',  border: 'rgba(10,120,110,0.45)',  text: '#28a898' },
  S:    { bg: 'rgba(5,110,145,0.18)',   border: 'rgba(5,110,145,0.45)',   text: '#2090b8' },
  K:    { bg: 'rgba(60,70,85,0.18)',    border: 'rgba(60,70,85,0.4)',     text: '#7080a0' },
  P:    { bg: 'rgba(60,70,85,0.18)',    border: 'rgba(60,70,85,0.4)',     text: '#7080a0' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function gradeColor(g: number) {
  if (g >= 90) return S.gold;
  if (g >= 80) return S.blue;
  if (g >= 70) return S.green;
  return S.txtMuted;
}

function IndicatorDot({ pick }: { pick: DraftPick }) {
  const ind = getPickIndicator(pick);
  if (!ind) return null;
  const colors = { steal: S.green, reach: S.red, value: S.blue };
  return (
    <div style={{ position: 'absolute', top: 3, right: 3, width: 5, height: 5, borderRadius: '50%', background: colors[ind] }} title={ind.toUpperCase()} />
  );
}

interface Props {
  picks: DraftPick[];
  currentPickIndex: number;
  userTeamId: string;
}

export function DraftBoard({ picks, currentPickIndex, userTeamId }: Props) {
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentPickIndex]);

  const roundSet = new Set(picks.map(p => p.round));
  const ROUNDS = Array.from(roundSet).sort((a, b) => a - b);
  const picksByRound: Record<number, DraftPick[]> = {};
  for (const round of ROUNDS) {
    picksByRound[round] = picks.filter(p => p.round === round);
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: S.bg }}>
      {ROUNDS.map(round => (
        <div key={round}>
          {/* Round header */}
          <div style={{ position: 'sticky', top: 0, zIndex: 10, background: S.surface, borderBottom: `1px solid ${S.border}`, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.txtMuted }}>Round {round}</span>
            <div style={{ flex: 1, height: 1, background: S.border }} />
            <span style={{ fontSize: 9, color: S.txtMuted, fontVariantNumeric: 'tabular-nums' }}>
              {picksByRound[round]?.filter(p => p.prospect).length}/{picksByRound[round]?.length} picks
            </span>
          </div>

          {/* Pick grid — 8 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 1, padding: '2px 4px 8px', background: S.bg }}>
            {picksByRound[round]?.map(pick => {
              const team = NFL_TEAMS.find(t => t.id === pick.teamId);
              const idx = picks.indexOf(pick);
              const isCurrent = idx === currentPickIndex;
              const isUser = pick.teamId === userTeamId;
              const isDrafted = !!pick.prospect;
              const pos = pick.prospect?.position;
              const posColor = pos ? POSITION_COLORS[pos] : null;

              return (
                <motion.div
                  key={pick.overall}
                  ref={isCurrent ? currentRef : null}
                  layout
                  style={{
                    position: 'relative',
                    minHeight: 64,
                    borderRadius: 4,
                    padding: '5px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: isCurrent
                      ? 'rgba(30,140,78,0.12)'
                      : isUser && !isDrafted
                        ? 'rgba(59,125,216,0.06)'
                        : isDrafted
                          ? S.elevated
                          : S.surface,
                    border: `1px solid ${isCurrent ? 'rgba(30,140,78,0.4)' : isUser && isDrafted ? 'rgba(59,125,216,0.2)' : isUser ? 'rgba(59,125,216,0.18)' : S.border}`,
                    boxShadow: isCurrent ? '0 0 10px rgba(30,140,78,0.15)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {isDrafted && <IndicatorDot pick={pick} />}

                  {/* Pick number */}
                  <div style={{ fontSize: 8, color: S.txtMuted, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{pick.overall}</div>

                  {/* Team color bar */}
                  <div style={{ width: 20, height: 3, borderRadius: 2, background: team?.primaryColor ?? S.border, margin: '3px 0', opacity: isDrafted || isCurrent ? 0.9 : 0.35 }} />

                  {isDrafted ? (
                    <>
                      {/* Player last name */}
                      <div style={{ fontSize: 9, fontWeight: 600, color: isUser ? '#8ab4e8' : S.txt, textAlign: 'center', lineHeight: 1.2, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pick.prospect!.name.split(' ').slice(-1)[0]}
                      </div>
                      {/* Position badge */}
                      {posColor && (
                        <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 3px', borderRadius: 2, background: posColor.bg, border: `1px solid ${posColor.border}`, color: posColor.text, marginTop: 2, letterSpacing: '0.03em' }}>
                          {pos}
                        </span>
                      )}
                      {/* Grade */}
                      <div style={{ fontSize: 8, fontWeight: 700, color: gradeColor(pick.prospect!.grade), marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                        {pick.prospect!.grade % 1 === 0 ? pick.prospect!.grade : pick.prospect!.grade.toFixed(1)}
                      </div>
                    </>
                  ) : isCurrent ? (
                    <div style={{ fontSize: 8, fontWeight: 700, color: S.green, letterSpacing: '0.08em', animation: 'pulse 1.5s infinite', textAlign: 'center', lineHeight: 1.3 }}>
                      {isUser ? 'YOUR\nPICK' : 'LIVE'}
                    </div>
                  ) : (
                    <div style={{ fontSize: 8, color: S.txtMuted }}>
                      {team?.abbreviation?.slice(0, 3) ?? '—'}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
