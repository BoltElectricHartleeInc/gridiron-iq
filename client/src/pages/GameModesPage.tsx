import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell, C, Badge, ModCard, SectionHead, GLOBAL_CSS } from '../components/AppShell';

// ─── Mode definitions ─────────────────────────────────────────────────────────

interface ModeConfig {
  key: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: string;
  accent: string;
  tag: string;
  route: string;
  badge?: string;
  badgeColor?: string;
  wide?: boolean;
  featured?: boolean;
}

const MAIN_GAMES: ModeConfig[] = [
  {
    key: 'exhibition',
    title: 'Exhibition',
    subtitle: 'Quick Game',
    desc: 'Pick any two NFL or NCAA teams and kick off immediately. No setup, pure football.',
    icon: '⚡',
    accent: C.blueBright,
    tag: 'QUICK PLAY',
    route: '/game/select',
  },
  {
    key: 'season',
    title: 'Season Mode',
    subtitle: '18-Week NFL Season',
    desc: 'Simulate or play every week. Full division standings. Chase a playoff spot.',
    icon: '📅',
    accent: C.green,
    tag: '18 WEEKS',
    route: '/game/season',
  },
  {
    key: 'franchise',
    title: 'Franchise Mode',
    subtitle: 'Dynasty Builder',
    desc: 'Roster management, salary cap ($255M), free agency, contract negotiations. Build a multi-year dynasty.',
    icon: '🏟️',
    accent: C.amber,
    tag: 'MULTI-YEAR',
    route: '/game/franchise',
  },
];

const DRAFT_TOOLS: ModeConfig[] = [
  {
    key: 'draft',
    title: 'Mock Draft Simulator',
    subtitle: 'War Room',
    desc: '480 real 2026 prospects. 32 franchises. AI opponents. Live trade engine with pre-draft war room pressure.',
    icon: '📋',
    accent: C.blueBright,
    tag: '2026 CLASS',
    route: '/draft/select',
    wide: true,
    featured: true,
  },
  {
    key: 'scouting',
    title: 'Scouting Hub',
    subtitle: 'Big Board',
    desc: 'Claude AI deep dives on every prospect. 2025–2028 classes. Watchlist builder.',
    icon: '🔭',
    accent: C.purple,
    tag: 'CLAUDE AI',
    route: '/scouting',
  },
  {
    key: 'analytics',
    title: 'Analytics Dashboard',
    subtitle: 'Advanced Stats',
    desc: 'EPA, Win Probability, draft analytics, combine metrics. The analytics layer Madden never built.',
    icon: '📊',
    accent: '#0EA5E9',
    tag: 'ANALYTICS',
    route: '/analytics',
    badge: 'NEW',
    badgeColor: C.green,
  },
];

const MORE_MODES: ModeConfig[] = [
  {
    key: 'career',
    title: 'Road to Glory',
    subtitle: 'Career Mode',
    desc: 'Create a player. Build from high school through the NFL Draft and into a pro career.',
    icon: '⭐',
    accent: C.purple,
    tag: 'CAREER MODE',
    route: '/career',
    badge: 'NEW',
    badgeColor: C.purple,
  },
  {
    key: 'rebuild',
    title: 'Rebuild Challenge',
    subtitle: 'From the Bottom',
    desc: 'Worst team. 10 years. Browns, a complete teardown, or a window-closing contender.',
    icon: '📉',
    accent: C.red,
    tag: 'CHALLENGE',
    route: '/rebuild',
    badge: 'NEW',
    badgeColor: C.red,
  },
  {
    key: 'historical',
    title: 'Historical Eras',
    subtitle: 'Legends Mode',
    desc: "'85 Bears. 2007 Pats. Legion of Boom. 12 legendary rosters with authentic ratings.",
    icon: '🏛️',
    accent: C.gold,
    tag: '12 LEGENDS',
    route: '/game/historical',
    badge: 'NEW',
    badgeColor: C.gold,
  },
  {
    key: 'playoffs',
    title: 'Playoff Mode',
    subtitle: '14-Team Bracket',
    desc: 'Seed the bracket your way. Play every round from Wild Card through the Super Bowl.',
    icon: '🏆',
    accent: '#F97316',
    tag: 'BRACKET',
    route: '/game/playoffs',
  },
  {
    key: 'recruiting',
    title: 'Recruiting',
    subtitle: 'Build Your Class',
    desc: 'Call 100 real recruits. Make your pitch. AI-powered conversations with every prospect. Transfer portal.',
    icon: '📞',
    accent: '#06B6D4',
    tag: 'AI CONVERSATIONS',
    route: '/recruiting',
    badge: 'NEW',
    badgeColor: '#06B6D4',
    wide: true,
  },
  {
    key: 'combine',
    title: 'NFL Combine',
    subtitle: '5 Mini-Games',
    desc: '40-yard dash, bench press, Wonderlic, route running, QB accuracy drill. One combined grade.',
    icon: '🏃',
    accent: '#84CC16',
    tag: '5 EVENTS',
    route: '/combine',
    badge: 'NEW',
    badgeColor: '#84CC16',
  },
  {
    key: 'fantasy',
    title: 'Fantasy League',
    subtitle: 'Season-Long & DFS',
    desc: 'Real NFL players. Snake draft. Live scoring. Full season-long fantasy league plus DFS contests.',
    icon: '🏅',
    accent: C.gold,
    tag: 'LIVE',
    route: '/fantasy',
  },
];

// ─── Card grid helper ──────────────────────────────────────────────────────────

function ModeGrid({ modes, cols = 3 }: { modes: ModeConfig[]; cols?: number }) {
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 14,
    }}>
      {modes.map(m => (
        <ModCard
          key={m.key}
          title={m.title}
          tag={m.subtitle}
          desc={m.desc}
          accent={m.accent}
          badge={m.badge}
          badgeColor={m.badgeColor}
          onClick={() => navigate(m.route)}
          style={m.wide ? { gridColumn: 'span 2' } : undefined}
        >
          {/* Icon + tag row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 26 }}>{m.icon}</span>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '.12em',
              textTransform: 'uppercase', color: m.accent,
              background: `color-mix(in srgb, ${m.accent} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${m.accent} 25%, transparent)`,
              borderRadius: 6, padding: '3px 8px',
            }}>
              {m.tag}
            </span>
          </div>
        </ModCard>
      ))}
    </div>
  );
}

// ─── Featured hero card for main games ────────────────────────────────────────

function FeaturedCard({ mode }: { mode: ModeConfig }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => navigate(mode.route)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: C.surface,
        border: `1px solid ${hovered ? mode.accent : C.border}`,
        borderRadius: 16,
        padding: '28px 28px 24px',
        cursor: 'pointer',
        transition: 'transform 160ms, border-color 160ms, box-shadow 160ms',
        transform: hovered ? 'translateY(-3px)' : '',
        boxShadow: hovered ? `0 0 32px -6px ${mode.accent}60` : '',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minHeight: 170,
      }}
    >
      {/* Gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${mode.accent}18 0%, transparent 60%)`, pointerEvents: 'none' }} />
      {/* Glow blob */}
      <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: `${mode.accent}14`, filter: 'blur(50px)', pointerEvents: 'none' }} />
      {/* Bottom bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${mode.accent}, transparent)` }} />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: 34 }}>{mode.icon}</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {mode.badge && (
            <Badge color={mode.badgeColor ?? C.green}>{mode.badge}</Badge>
          )}
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase',
            color: mode.accent,
            background: `color-mix(in srgb, ${mode.accent} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${mode.accent} 25%, transparent)`,
            borderRadius: 6, padding: '3px 8px',
          }}>
            {mode.tag}
          </span>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.txtMuted, marginBottom: 4 }}>
          {mode.subtitle}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.txt, letterSpacing: '-.02em', marginBottom: 6 }}>
          {mode.title}
        </div>
        <div style={{ fontSize: 12, color: C.txtSub, lineHeight: 1.6 }}>
          {mode.desc}
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        <div style={{ height: 1, flex: 1, background: `linear-gradient(to right, ${mode.accent}55, transparent)` }} />
        <span style={{ fontSize: 14, color: mode.accent }}>→</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function GameModesPage() {
  const navigate = useNavigate();

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ minHeight: '100vh', background: C.bg, color: C.txt, fontFamily: C.font }}>

        {/* ── Nav ── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          height: 56, background: `rgba(5,8,15,.93)`, backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center',
          padding: '0 24px', gap: 12,
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none', border: `1px solid ${C.border}`,
              borderRadius: 8, color: C.txtSub, cursor: 'pointer',
              fontSize: 12, fontWeight: 700, padding: '6px 12px',
              transition: 'border-color 160ms, color 160ms',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.borderHi; (e.currentTarget as HTMLButtonElement).style.color = C.txt; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.txtSub; }}
          >
            ← Home
          </button>
          <span style={{ color: C.border, fontSize: 16 }}>|</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.txt }}>Game Modes</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { label: 'Draft', route: '/draft/select' },
              { label: 'Scouting', route: '/scouting' },
              { label: 'Analytics', route: '/analytics' },
              { label: 'Fantasy', route: '/fantasy' },
            ].map(l => (
              <button
                key={l.route}
                onClick={() => navigate(l.route)}
                style={{
                  fontSize: 11, fontWeight: 700, color: C.txtSub,
                  background: 'none', border: `1px solid transparent`,
                  borderRadius: 7, cursor: 'pointer', padding: '5px 12px',
                  transition: 'color 140ms, border-color 140ms',
                }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = C.txt; b.style.borderColor = C.border; }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = C.txtSub; b.style.borderColor = 'transparent'; }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </nav>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 72px' }}>

          {/* ── Hero header ── */}
          <div style={{ marginBottom: 52, animation: 'fadeUp .35s ease both' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: C.txtMuted, marginBottom: 10 }}>
              GridironIQ · Front Office Platform
            </div>
            <h1 style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-.04em', margin: '0 0 10px', color: C.txt, lineHeight: 1 }}>
              CHOOSE YOUR MODE
            </h1>
            <p style={{ fontSize: 14, color: C.txtSub, margin: 0, lineHeight: 1.7, maxWidth: 600 }}>
              Draft simulator · AI Recruiting · Road to Glory · Franchise · Season · Playoffs · Combine · Analytics · Historical Eras · Rebuild Challenge
            </p>
          </div>

          {/* ── Section 1: Main Game Modes ── */}
          <section style={{ marginBottom: 44, animation: 'fadeUp .4s .05s ease both' }}>
            <SectionHead
              sub="Exhibition, Season, and Franchise football"
              style={{ marginBottom: 18 }}
            >
              Main Game Modes
            </SectionHead>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {MAIN_GAMES.map(m => (
                <FeaturedCard key={m.key} mode={m} />
              ))}
            </div>
          </section>

          {/* ── Section 2: Draft & Scouting ── */}
          <section style={{ marginBottom: 44, animation: 'fadeUp .4s .1s ease both' }}>
            <SectionHead
              sub="Mock draft, big board, and analytics tools"
              style={{ marginBottom: 18 }}
            >
              Draft &amp; Scouting
            </SectionHead>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {DRAFT_TOOLS.map(m => (
                <FeaturedCard key={m.key} mode={m} />
              ))}
            </div>
          </section>

          {/* ── Section 3: More Modes ── */}
          <section style={{ animation: 'fadeUp .4s .15s ease both' }}>
            <SectionHead
              sub="Career, Rebuild, Historical, Recruiting, Combine, Fantasy"
              style={{ marginBottom: 18 }}
            >
              More Modes
            </SectionHead>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {MORE_MODES.map(m => (
                <FeaturedCard key={m.key} mode={m} />
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
