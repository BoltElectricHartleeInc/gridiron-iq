/**
 * AppShell — consistent page wrapper used by every page in GridironIQ.
 * Provides: sticky nav, dark background, Inter font, global animation styles.
 */
import type { ReactNode, CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

export const C = {
  bg:        '#05080F',
  surface:   '#090D18',
  panel:     '#0C1220',
  elevated:  '#101828',
  border:    '#172033',
  borderHi:  '#1E2E45',
  borderFoc: '#2A4870',

  txt:       '#DDE8F4',
  txtSub:    '#6888A8',
  txtMuted:  '#2A4060',
  txtInvert: '#05080F',

  gold:      '#D4AF37',
  goldBright:'#F5CC50',
  goldSub:   'rgba(212,175,55,0.10)',

  blue:      '#1565C0',
  blueBright:'#2196F3',
  blueSub:   'rgba(33,150,243,0.10)',
  blueFoc:   'rgba(33,150,243,0.20)',

  green:     '#00C853',
  greenSub:  'rgba(0,200,83,0.10)',

  red:       '#F44336',
  redSub:    'rgba(244,67,54,0.10)',

  amber:     '#FF8F00',
  amberSub:  'rgba(255,143,0,0.10)',

  purple:    '#AA00FF',
  purpleSub: 'rgba(170,0,255,0.10)',

  font: "'Inter', system-ui, -apple-system, sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', monospace",
};

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { background: ${C.bg}; color: ${C.txt}; font-family: ${C.font}; margin: 0; }

  @keyframes pulse {
    0%,100% { opacity:.5; transform:scale(.9); }
    50%      { opacity:1; transform:scale(1.1); }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes slideIn {
    from { opacity:0; transform:translateX(16px); }
    to   { opacity:1; transform:translateX(0); }
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width:6px; height:6px; }
  ::-webkit-scrollbar-track { background:${C.bg}; }
  ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:3px; }
  ::-webkit-scrollbar-thumb:hover { background:${C.borderHi}; }

  /* Button reset */
  button { font-family: inherit; }
`;

type AppShellProps = {
  children: ReactNode;
  title?: string;
  backTo?: string;
  backLabel?: string;
  right?: ReactNode;
  /** Additional nav items shown center */
  navCenter?: ReactNode;
  maxWidth?: number | string;
  noPad?: boolean;
  style?: CSSProperties;
};

// ─── Bottom Tab Bar (mobile only) ─────────────────────────────────────────────
const TABS = [
  { label: 'Home',    icon: '🏠', path: '/' },
  { label: 'Draft',   icon: '📋', path: '/draft/select' },
  { label: 'Game',    icon: '🏈', path: '/game' },
  { label: 'Fantasy', icon: '⭐', path: '/fantasy' },
  { label: 'Scout',   icon: '🔍', path: '/scouting' },
];

function BottomTabBar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const active = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
      background: `rgba(5,8,15,0.97)`, backdropFilter: 'blur(20px)',
      borderTop: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'stretch',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
    }}>
      {TABS.map(tab => {
        const isActive = active(tab.path);
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1, background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3, paddingTop: 8, paddingBottom: 4,
              color: isActive ? C.blueBright : C.txtMuted,
              transition: 'color 140ms',
              minHeight: 0,
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.icon}</span>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '.04em',
              color: isActive ? C.blueBright : C.txtMuted,
            }}>
              {tab.label.toUpperCase()}
            </span>
            {isActive && (
              <span style={{
                position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px))',
                width: 28, height: 2, background: C.blueBright, borderRadius: 2,
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  title,
  backTo,
  backLabel = 'Back',
  right,
  navCenter,
  maxWidth = 1200,
  noPad = false,
  style,
}: AppShellProps) {
  const navigate  = useNavigate();
  const isMobile  = useIsMobile();

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.txt, fontFamily: C.font, ...style }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: isMobile ? 50 : 56,
        background: `rgba(5,8,15,.95)`, backdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center',
        padding: isMobile ? '0 14px' : '0 20px', gap: 10,
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
          {backTo ? (
            <button
              onClick={() => navigate(backTo)}
              style={{
                background: 'none', border: `1px solid ${C.border}`,
                borderRadius: 8, color: C.txtSub, cursor: 'pointer',
                fontSize: isMobile ? 11 : 12, fontWeight: 700,
                padding: isMobile ? '5px 10px' : '6px 12px',
                display: 'flex', alignItems: 'center', gap: 5,
                minHeight: 36,
              }}
            >
              ← {!isMobile && backLabel}
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto' }}
            >
              <span style={{ fontSize: isMobile ? 15 : 17, fontWeight: 900, letterSpacing: '-.02em', color: C.txt }}>
                {isMobile ? 'GIQ' : 'GridironIQ'}
              </span>
            </button>
          )}
          {title && !isMobile && (
            <>
              <span style={{ color: C.border, fontSize: 16 }}>|</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.txt, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {title}
              </span>
            </>
          )}
          {title && isMobile && (
            <span style={{ fontSize: 13, fontWeight: 700, color: C.txt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </span>
          )}
        </div>

        {/* Center */}
        {navCenter && !isMobile && (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            {navCenter}
          </div>
        )}

        {/* Right */}
        {right && <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>{right}</div>}
      </nav>

      {/* ── Content ── */}
      <div style={noPad ? { paddingBottom: isMobile ? 'calc(60px + env(safe-area-inset-bottom, 0px))' : 0 } : {
        maxWidth,
        margin: '0 auto',
        padding: isMobile ? '16px 14px calc(80px + env(safe-area-inset-bottom, 0px))' : '32px 24px 64px',
      }}>
        {children}
      </div>

      {/* ── Bottom tab bar (mobile only) ── */}
      {isMobile && <BottomTabBar />}
    </div>
  );
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

type BadgeProps = {
  children: ReactNode;
  color?: string;
  dot?: boolean;
  style?: CSSProperties;
};
export function Badge({ children, color = C.blueBright, dot, style }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 9, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
      color,
      background: `color-mix(in srgb, ${color} 12%, transparent)`,
      border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
      borderRadius: 999, padding: '3px 9px',
      ...style,
    }}>
      {dot && (
        <span style={{
          width: 6, height: 6, borderRadius: '50%', background: color,
          animation: 'pulse 1.2s ease-in-out infinite', flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  );
}

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  accent?: string;
  disabled?: boolean;
  style?: CSSProperties;
};
export function Btn({ children, onClick, variant = 'primary', size = 'md', accent = C.blueBright, disabled, style }: BtnProps) {
  const pad = { sm: '8px 16px', md: '12px 24px', lg: '16px 36px' }[size];
  const fs  = { sm: 11, md: 13, lg: 15 }[size];

  const base: CSSProperties = {
    fontFamily: 'inherit', fontWeight: 800, fontSize: fs,
    letterSpacing: '.04em', borderRadius: 10, cursor: disabled ? 'not-allowed' : 'pointer',
    padding: pad, border: 'none', transition: 'opacity 160ms, transform 160ms',
    opacity: disabled ? .45 : 1,
  };

  const variants: Record<string, CSSProperties> = {
    primary:   { background: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 75%, #fff))`, color: '#fff' },
    secondary: { background: C.blueFoc, border: `1px solid ${C.borderFoc}`, color: C.blueBright },
    ghost:     { background: 'transparent', border: `1px solid ${C.border}`, color: C.txtSub },
    danger:    { background: C.redSub, border: `1px solid ${C.red}40`, color: C.red },
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLButtonElement).style.opacity = '.85'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
    >
      {children}
    </button>
  );
}

type TabBarProps = {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  style?: CSSProperties;
};
export function TabBar({ tabs, active, onChange, style }: TabBarProps) {
  return (
    <div style={{
      display: 'flex', gap: 2,
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: 4, ...style,
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            background: active === t.id ? C.elevated : 'transparent',
            border: active === t.id ? `1px solid ${C.borderHi}` : '1px solid transparent',
            borderRadius: 7, color: active === t.id ? C.txt : C.txtSub,
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 12, fontWeight: 700, padding: '7px 16px',
            transition: 'all 140ms ease',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

type SectionHeadProps = {
  children: ReactNode;
  right?: ReactNode;
  sub?: string;
  style?: CSSProperties;
};
export function SectionHead({ children, right, sub, style }: SectionHeadProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16, ...style }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', color: C.txtMuted, textTransform: 'uppercase', marginBottom: sub ? 6 : 0 }}>
          {children}
        </div>
        {sub && <div style={{ fontSize: 13, fontWeight: 600, color: C.txtSub }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

type ModCardProps = {
  title: string;
  tag?: string;
  desc?: string;
  accent?: string;
  badge?: string;
  badgeColor?: string;
  onClick?: () => void;
  wide?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
};
export function ModCard({ title, tag, desc, accent = C.blueBright, badge, badgeColor = C.green, onClick, wide, children, style }: ModCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative', background: C.surface,
        border: `1px solid ${C.border}`, borderRadius: 16,
        padding: '24px 24px 20px', cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 160ms, border-color 160ms, box-shadow 160ms',
        overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 8,
        minHeight: wide ? 140 : 180,
        ...style,
      }}
      onMouseEnter={e => {
        if (!onClick) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(-3px)';
        el.style.borderColor = accent;
        el.style.boxShadow = `0 0 28px -6px ${accent}60`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = '';
        el.style.borderColor = C.border;
        el.style.boxShadow = '';
      }}
    >
      {/* Gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${accent}0D 0%, transparent 55%)`, pointerEvents: 'none' }} />
      {/* Bottom accent bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${accent}, transparent)` }} />

      {tag || badge ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          {tag && <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.16em', color: C.txtMuted, textTransform: 'uppercase' }}>{tag}</span>}
          {badge && <Badge color={badgeColor}>{badge}</Badge>}
        </div>
      ) : null}

      <div style={{ fontSize: 20, fontWeight: 800, color: C.txt, letterSpacing: '-.01em' }}>{title}</div>
      {desc && <div style={{ fontSize: 12, color: C.txtSub, fontWeight: 500, lineHeight: 1.55, flex: 1 }}>{desc}</div>}
      {children}
      {onClick && <div style={{ alignSelf: 'flex-end', fontSize: 16, color: C.txtMuted, marginTop: 4 }}>→</div>}
    </div>
  );
}

type DataRowProps = {
  label: string;
  value: ReactNode;
  accent?: string;
  style?: CSSProperties;
};
export function DataRow({ label, value, accent, style }: DataRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}`, ...style }}>
      <span style={{ fontSize: 12, color: C.txtSub, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: accent ?? C.txt }}>{value}</span>
    </div>
  );
}

type StatTileProps = {
  n: string | number;
  label: string;
  sub?: string;
  accent?: string;
  style?: CSSProperties;
};
export function StatTile({ n, label, sub, accent = C.txt, style }: StatTileProps) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px', textAlign: 'center', ...style }}>
      <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-.03em', color: accent, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.txtSub, marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.txtMuted, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}
