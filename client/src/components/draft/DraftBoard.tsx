import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { POS, T, gradeColor, gradeLetter, teamLogoUrl } from '../../styles/tokens';

type TeamRef = {
  abbreviation: string;
  city?: string;
  name?: string;
  primaryColor?: string;
};

type DraftPlayer = {
  id?: string | number;
  fullName?: string;
  name?: string;
  position: string;
  grade: number;
};

type PickOutcome = 'STEAL' | 'REACH' | 'VALUE';

type DraftPick = {
  round: number;
  pickInRound: number;
  overall: number;
  team: TeamRef;
  player?: DraftPlayer | null;
  isUserTeam?: boolean;
  outcome?: PickOutcome | null;
};

type DraftBoardProps = {
  picks: DraftPick[];
  currentOverallPick: number;
  rounds?: number;
  picksPerRound?: number;
  className?: string;
  style?: CSSProperties;
};

export const POSITION_COLORS = POS;

const STEAL_REACH_VALUE_COLORS: Record<PickOutcome, string> = {
  STEAL: T.green,
  REACH: T.red,
  VALUE: T.blueBright,
};

function safeLastName(player?: DraftPlayer | null): string {
  const candidate = (player?.fullName ?? player?.name ?? '').trim();
  if (!candidate) return '—';
  const parts = candidate.split(/\s+/);
  return parts[parts.length - 1]?.toUpperCase() ?? '—';
}

function inferOutcomeFromGrade(grade: number): PickOutcome {
  if (grade >= 88) return 'STEAL';
  if (grade <= 72) return 'REACH';
  return 'VALUE';
}

function normalizePick(pick: DraftPick): DraftPick {
  if (pick.outcome) return pick;
  if (!pick.player) return pick;
  return { ...pick, outcome: inferOutcomeFromGrade(pick.player.grade) };
}

function groupPicksByRound(picks: DraftPick[], rounds: number, picksPerRound: number): DraftPick[][] {
  const map = new Map<number, DraftPick[]>();
  for (let round = 1; round <= rounds; round += 1) map.set(round, []);
  picks.forEach((pick) => {
    if (!map.has(pick.round)) map.set(pick.round, []);
    map.get(pick.round)!.push(normalizePick(pick));
  });
  const grouped: DraftPick[][] = [];
  for (let round = 1; round <= rounds; round += 1) {
    const roundPicks = (map.get(round) ?? []).slice().sort((a, b) => a.pickInRound - b.pickInRound);
    for (let i = 1; i <= picksPerRound; i += 1) {
      const existing = roundPicks.find((pick) => pick.pickInRound === i);
      if (!existing) {
        roundPicks.push({
          round,
          pickInRound: i,
          overall: (round - 1) * picksPerRound + i,
          team: { abbreviation: 'TBD' },
          player: null,
          isUserTeam: false,
          outcome: null,
        });
      }
    }
    grouped.push(roundPicks.sort((a, b) => a.pickInRound - b.pickInRound));
  }
  return grouped;
}

function outcomeLabel(outcome?: PickOutcome | null): PickOutcome | null {
  if (!outcome) return null;
  return outcome;
}

function positionStyle(position: string): { bg: string; border: string; text: string; pill: string } {
  return POS[position] ?? { bg: T.blueSub, border: T.borderFoc, text: T.blueBright, pill: T.panel };
}

export default function DraftBoard({
  picks,
  currentOverallPick,
  rounds = 7,
  picksPerRound = 32,
  className,
  style,
}: DraftBoardProps) {
  const livePickRef = useRef<HTMLDivElement | null>(null);

  const groupedPicks = useMemo(
    () => groupPicksByRound(picks, rounds, picksPerRound),
    [picks, rounds, picksPerRound],
  );

  useEffect(() => {
    if (!livePickRef.current) return;
    livePickRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  }, [currentOverallPick, groupedPicks]);

  return (
    <div
      className={className}
      style={{
        minHeight: 0,
        overflow: 'auto',
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: 10,
        fontFamily: T.fontBase,
        ...style,
      }}
    >
      <style>
        {`
          @keyframes boardPulse {
            0%   { opacity: 0.65; filter: drop-shadow(0 0 0 rgba(0,200,83,0)); }
            50%  { opacity: 1; filter: drop-shadow(0 0 5px rgba(0,200,83,0.36)); }
            100% { opacity: 0.65; filter: drop-shadow(0 0 0 rgba(0,200,83,0)); }
          }

          .draft-board-round-header {
            position: sticky;
            top: 0;
            z-index: 5;
            background: linear-gradient(180deg, ${T.surface} 0%, ${T.surface} 86%, ${hexFade(T.surface, 0)} 100%);
            padding: 8px 0 7px;
            margin-bottom: 8px;
          }

          .draft-board-round-divider {
            margin-top: 7px;
            height: 1px;
            background: ${T.border};
            width: 100%;
          }

          .draft-board-grid {
            display: grid;
            grid-template-columns: repeat(8, minmax(0, 1fr));
            gap: 2px;
          }

          .draft-pick-cell {
            position: relative;
            height: 88px;
            border: 1px solid ${T.border};
            background: ${T.panel};
            border-radius: 6px;
            padding: 4px 5px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            text-align: center;
          }
        `}
      </style>

      {groupedPicks.map((roundPicks, index) => {
        const roundNumber = index + 1;
        const completedCount = roundPicks.filter((pick) => pick.player).length;
        return (
          <section key={`round-${roundNumber}`} style={{ marginBottom: 10 }}>
            <header className="draft-board-round-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: T.txtSub,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  ROUND {roundNumber}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: T.txtMuted,
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '0.04em',
                  }}
                >
                  {completedCount}/{picksPerRound} picks
                </div>
              </div>
              <div className="draft-board-round-divider" />
            </header>

            <div className="draft-board-grid">
              {roundPicks.map((pick) => {
                const isLive = pick.overall === currentOverallPick;
                const isCompleted = Boolean(pick.player) && !isLive;
                const isUserTeam = Boolean(pick.isUserTeam);
                const pos = isCompleted ? positionStyle(pick.player!.position) : null;
                const outcome = isCompleted ? outcomeLabel(pick.outcome) : null;
                const outcomeColor = outcome ? STEAL_REACH_VALUE_COLORS[outcome] : null;

                const ref = isLive ? livePickRef : undefined;

                return (
                  <div
                    key={`pick-${pick.round}-${pick.pickInRound}-${pick.overall}`}
                    ref={ref}
                    className="draft-pick-cell"
                    style={{
                      border: isLive
                        ? `1px solid rgba(0,200,83,0.6)`
                        : isCompleted
                          ? `1px solid ${isUserTeam ? hexFade(T.blueBright, 0.45) : T.borderHi}`
                          : `1px solid ${isUserTeam ? T.blueGlow : T.border}`,
                      background: isLive
                        ? `linear-gradient(180deg, ${hexFade(T.green, 0.12)} 0%, ${T.panel} 100%)`
                        : isCompleted
                          ? T.elevated
                          : isUserTeam
                            ? `linear-gradient(180deg, ${hexFade(T.blueBright, 0.08)} 0%, ${T.panel} 100%)`
                            : T.panel,
                      boxShadow: isLive
                        ? '0 0 16px rgba(0,200,83,0.2)'
                        : isUserTeam && isCompleted
                          ? `0 0 0 1px ${hexFade(T.blueBright, 0.18)}`
                          : 'none',
                    }}
                  >
                    {!isCompleted && !isLive && (
                      <>
                        <div
                          style={{
                            fontSize: 9,
                            lineHeight: 1,
                            color: T.txtMuted,
                            fontVariantNumeric: 'tabular-nums',
                            marginTop: 1,
                          }}
                        >
                          #{pick.overall}
                        </div>
                        <img
                          src={teamLogoUrl(pick.team.abbreviation)}
                          alt={`${pick.team.abbreviation} logo`}
                          style={{
                            width: 32,
                            height: 32,
                            objectFit: 'contain',
                            opacity: 0.35,
                          }}
                        />
                        <div style={{ fontSize: 9, color: T.txtMuted, marginBottom: 1 }}>{pick.team.abbreviation}</div>
                      </>
                    )}

                    {isLive && (
                      <>
                        <div
                          style={{
                            fontSize: 9,
                            lineHeight: 1,
                            color: T.green,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            animation: 'boardPulse 1.15s ease-in-out infinite',
                            marginTop: 1,
                          }}
                        >
                          ON THE CLOCK
                        </div>
                        <img
                          src={teamLogoUrl(pick.team.abbreviation)}
                          alt={`${pick.team.abbreviation} logo`}
                          style={{ width: 36, height: 36, objectFit: 'contain', opacity: 1 }}
                        />
                        <div style={{ fontSize: 9, color: T.txtSub }}>{pick.team.abbreviation}</div>
                        {isUserTeam && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 3,
                              left: 5,
                              fontSize: 9,
                              fontWeight: 700,
                              color: T.blueBright,
                              letterSpacing: '0.04em',
                            }}
                          >
                            YOUR PICK
                          </div>
                        )}
                      </>
                    )}

                    {isCompleted && (
                      <>
                        <div
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            fontSize: 8,
                            lineHeight: 1,
                            color: T.txtMuted,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          #{pick.overall}
                        </div>

                        <img
                          src={teamLogoUrl(pick.team.abbreviation)}
                          alt={`${pick.team.abbreviation} logo`}
                          style={{ width: 28, height: 28, objectFit: 'contain', opacity: 1 }}
                        />

                        <div
                          style={{
                            width: '100%',
                            fontSize: 10,
                            lineHeight: 1.1,
                            fontWeight: 700,
                            color: T.txt,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textTransform: 'uppercase',
                          }}
                        >
                          {safeLastName(pick.player)}
                        </div>

                        <div
                          style={{
                            fontSize: 8,
                            lineHeight: 1,
                            borderRadius: 999,
                            padding: '2px 6px',
                            color: pos!.text,
                            border: `1px solid ${pos!.border}`,
                            background: pos!.bg,
                            fontWeight: 700,
                          }}
                        >
                          {pick.player!.position}
                        </div>

                        <div
                          style={{
                            fontSize: 9,
                            lineHeight: 1,
                            color: gradeColor(pick.player!.grade),
                            fontWeight: 800,
                          }}
                        >
                          {gradeLetter(pick.player!.grade)}
                        </div>

                        {outcome && outcomeColor && (
                          <div
                            style={{
                              position: 'absolute',
                              right: 4,
                              bottom: 3,
                              minHeight: 14,
                              padding: '0 3px',
                              borderRadius: 4,
                              background: hexFade(outcomeColor, 0.14),
                              border: `1px solid ${hexFade(outcomeColor, 0.35)}`,
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: 7,
                              lineHeight: 1,
                              color: outcomeColor,
                              fontWeight: 800,
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase',
                            }}
                          >
                            {outcome}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function hexFade(color: string, alpha: number): string {
  if (color.startsWith('rgba') || color.startsWith('rgb')) {
    const [r, g, b] = color
      .replace(/[^\d,]/g, '')
      .split(',')
      .slice(0, 3)
      .map((v) => Number.parseInt(v, 10));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const raw = color.replace('#', '').trim();
  const normalized =
    raw.length === 3
      ? raw
          .split('')
          .map((part) => `${part}${part}`)
          .join('')
      : raw;

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
