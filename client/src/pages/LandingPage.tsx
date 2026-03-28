import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { T, gradeColor, gradeLetter, teamLogoUrl } from '../styles/tokens';

type ActiveDraftSession = {
  teamAbbreviation: string;
  teamName: string;
  teamPrimaryColor: string;
  currentOverallPick: number;
  currentRound: number;
  pickInRound: number;
};

type ModuleStatus = 'READY' | 'ACTIVE' | 'IN PROGRESS' | 'BETA' | 'LOCKED';

type ModuleCard = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  status: ModuleStatus;
  featured?: boolean;
};

type StatItem = {
  label: string;
  value: string;
};

type RecentSession = {
  id: string | number;
  teamAbbreviation: string;
  teamName: string;
  grade: number;
  dateLabel: string;
};

type LandingPageProps = {
  activeDraft?: ActiveDraftSession | null;
  onResumeDraft?: () => void;
  onOpenModule?: (moduleId: string) => void;
  recentSessions?: RecentSession[];
  stats?: StatItem[];
  style?: CSSProperties;
};

const DEFAULT_MODULES: ModuleCard[] = [
  {
    id: 'mock-draft',
    title: 'Mock Draft Simulator',
    subtitle: 'Draft Engine',
    description: 'Run full-board simulations with live war room control.',
    color: T.blueBright,
    status: 'ACTIVE',
    featured: true,
  },
  {
    id: 'scouting-hub',
    title: 'Scouting Hub',
    subtitle: 'Analytics',
    description: 'Rank prospects and evaluate fit against team needs.',
    color: T.green,
    status: 'READY',
  },
  {
    id: 'recruiting',
    title: 'Recruiting',
    subtitle: 'Career Mode',
    description: 'Track pipelines and long-horizon roster strategy.',
    color: T.gold,
    status: 'BETA',
  },
  {
    id: 'nfl-combine',
    title: 'NFL Combine',
    subtitle: 'Franchise Mode',
    description: 'Review testing profiles, benchmarks, and comparables.',
    color: T.amber,
    status: 'READY',
  },
  {
    id: 'fantasy-league',
    title: 'Fantasy League',
    subtitle: 'Historical Eras',
    description: 'Model alternate-era draft outcomes and roster builds.',
    color: T.blue,
    status: 'IN PROGRESS',
  },
];

const DEFAULT_STATS: StatItem[] = [
  { label: 'PROSPECTS GRADED', value: '412' },
  { label: 'SCOUTING REPORTS', value: '96' },
  { label: 'SIMULATIONS RUN', value: '128' },
  { label: 'AVG CLASS GRADE', value: 'B+' },
  { label: 'TRADES MODELED', value: '37' },
];

function toRgba(hex: string, alpha: number): string {
  const raw = hex.replace('#', '').trim();
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

function statusBadgeStyle(status: ModuleStatus): { bg: string; border: string; text: string } {
  switch (status) {
    case 'ACTIVE':
      return { bg: T.greenSub, border: toRgba(T.green, 0.4), text: T.green };
    case 'READY':
      return { bg: T.blueSub, border: toRgba(T.blueBright, 0.45), text: T.blueBright };
    case 'IN PROGRESS':
      return { bg: toRgba(T.amber, 0.12), border: toRgba(T.amber, 0.4), text: T.amber };
    case 'BETA':
      return { bg: toRgba(T.gold, 0.12), border: toRgba(T.gold, 0.4), text: T.goldBright };
    case 'LOCKED':
    default:
      return { bg: T.panel, border: T.border, text: T.txtMuted };
  }
}

export default function LandingPage({
  activeDraft = null,
  onResumeDraft,
  onOpenModule,
  recentSessions = [],
  stats = DEFAULT_STATS,
  style,
}: LandingPageProps) {
  const modules = useMemo(() => DEFAULT_MODULES, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        color: T.txt,
        fontFamily: T.fontBase,
        ...style,
      }}
    >
      <style>
        {`
          @keyframes livePulse {
            0% { opacity: 0.45; transform: scale(0.92); }
            50% { opacity: 1; transform: scale(1.06); }
            100% { opacity: 0.45; transform: scale(0.92); }
          }

          .landing-module-card {
            border: 1px solid ${T.border};
            border-radius: 11px;
            background: ${T.surface};
            overflow: hidden;
            cursor: pointer;
            transition: border-color 140ms ease, transform 140ms ease, background 140ms ease;
          }

          .landing-module-card:hover {
            border-color: ${T.borderHi};
            background: ${T.elevated};
            transform: translateY(-1px);
          }
        `}
      </style>

      <header
        style={{
          height: 56,
          borderBottom: `1px solid ${T.border}`,
          background: T.surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.01em', color: T.txt }}>GridironIQ</div>
          <div style={{ color: T.borderHi }}>|</div>
          <div style={{ fontSize: 10, color: T.txtMuted, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            Front Office Platform
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              borderRadius: 999,
              border: `1px solid ${toRgba(T.green, 0.45)}`,
              background: T.greenSub,
              padding: '5px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: T.green,
                animation: 'livePulse 1.05s ease-in-out infinite',
              }}
            />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: T.green, whiteSpace: 'nowrap' }}>2026 NFL DRAFT LIVE</span>
          </div>
          {activeDraft && (
            <button
              type="button"
              onClick={onResumeDraft}
              style={{
                border: `1px solid ${T.borderFoc}`,
                background: T.blueSub,
                color: T.blueBright,
                borderRadius: 9,
                fontSize: 11,
                fontWeight: 700,
                padding: '7px 10px',
                cursor: 'pointer',
              }}
            >
              Resume Draft →
            </button>
          )}
        </div>
      </header>

      <main
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '32px 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {activeDraft && (
          <section
            style={{
              minHeight: 120,
              borderRadius: 14,
              border: `1px solid ${toRgba(activeDraft.teamPrimaryColor, 0.4)}`,
              background: `linear-gradient(120deg, ${toRgba(activeDraft.teamPrimaryColor, 0.08)} 0%, ${T.surface} 48%, ${T.surface} 100%)`,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <img
                src={teamLogoUrl(activeDraft.teamAbbreviation)}
                alt={`${activeDraft.teamName} logo`}
                style={{ width: 64, height: 64, objectFit: 'contain' }}
              />
              <div>
                <div style={{ fontSize: 10, color: T.txtMuted, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Draft in Progress
                </div>
                <div style={{ marginTop: 5, fontSize: 20, color: T.txt, fontWeight: 800 }}>{activeDraft.teamName}</div>
                <div style={{ marginTop: 4, fontSize: 12, color: T.txtSub }}>
                  Pick #{activeDraft.currentOverallPick} · Rd {activeDraft.currentRound} · {activeDraft.pickInRound} of 32
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onResumeDraft}
              style={{
                border: `1px solid ${toRgba(activeDraft.teamPrimaryColor, 0.65)}`,
                background: `linear-gradient(135deg, ${toRgba(activeDraft.teamPrimaryColor, 0.95)} 0%, ${toRgba(activeDraft.teamPrimaryColor, 0.75)} 100%)`,
                color: T.txtInvert,
                borderRadius: 10,
                height: 44,
                minWidth: 210,
                padding: '0 14px',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Resume War Room →
            </button>
          </section>
        )}

        <section>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {modules.map((module) => {
              const badge = statusBadgeStyle(module.status);
              const height = module.featured ? 112 : 72;
              const gridColumn = module.featured ? '1 / -1' : undefined;
              return (
                <button
                  key={module.id}
                  type="button"
                  className="landing-module-card"
                  onClick={() => onOpenModule?.(module.id)}
                  style={{
                    height,
                    gridColumn,
                    padding: 0,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ height: 3, background: module.color }} />
                  <div style={{ height: `calc(100% - 3px)`, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: T.txt, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {module.title}
                        </div>
                        <div style={{ fontSize: 9, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>
                          {module.subtitle}
                        </div>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 11, color: T.txtSub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {module.description}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span
                        style={{
                          borderRadius: 999,
                          border: `1px solid ${badge.border}`,
                          background: badge.bg,
                          color: badge.text,
                          fontSize: 8,
                          fontWeight: 800,
                          letterSpacing: '0.06em',
                          padding: '4px 7px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {module.status}
                      </span>
                      <span style={{ fontSize: 16, color: T.txtSub, lineHeight: 1 }}>→</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section
          style={{
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            background: T.surface,
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          }}
        >
          {stats.slice(0, 5).map((item, index) => (
            <div
              key={item.label}
              style={{
                padding: '12px 10px',
                borderLeft: index === 0 ? 'none' : `1px solid ${T.border}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, color: T.txt, lineHeight: 1.1 }}>{item.value}</div>
              <div style={{ marginTop: 6, fontSize: 9, color: T.txtMuted, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {item.label}
              </div>
            </div>
          ))}
        </section>

        {recentSessions.length > 0 && (
          <section
            style={{
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              background: T.surface,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: T.txtMuted,
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '10px 12px',
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              Recent Sessions
            </div>

            <div>
              {recentSessions.slice(0, 5).map((session, idx) => (
                <div
                  key={session.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '28px 1fr 44px 100px',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    borderTop: idx === 0 ? 'none' : `1px solid ${T.border}`,
                  }}
                >
                  <img
                    src={teamLogoUrl(session.teamAbbreviation)}
                    alt={`${session.teamName} logo`}
                    style={{ width: 22, height: 22, objectFit: 'contain' }}
                  />
                  <div style={{ fontSize: 12, color: T.txt, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {session.teamName}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: gradeColor(session.grade),
                    }}
                  >
                    {gradeLetter(session.grade)}
                  </div>
                  <div style={{ fontSize: 10, color: T.txtSub, textAlign: 'right' }}>{session.dateLabel}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export { LandingPage };
