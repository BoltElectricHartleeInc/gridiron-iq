import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const S = {
  bg:       '#050508',
  surface:  '#0a0a14',
  elevated: '#0f0f1e',
  border:   'rgba(255,255,255,0.06)',
  borderHi: 'rgba(255,255,255,0.12)',
  txt:      '#e2e8f0',
  txtSub:   '#8890a8',
  txtMuted: '#3a3d52',
  gold:     '#c49a1a',
};

interface ModeCard {
  key: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: string;
  color: string;
  tag: string;
  route: string;
  wide?: boolean;
  badge?: string;
}

const SECTIONS: { label: string; icon: string; modes: ModeCard[] }[] = [
  {
    label: 'ARCADE FOOTBALL',
    icon: '🏈',
    modes: [
      {
        key: 'exhibition',
        title: 'Exhibition',
        subtitle: 'Quick Game',
        desc: 'Pick any two NFL or NCAA teams and kick off immediately. No setup, pure football.',
        icon: '⚡',
        color: '#3b7dd8',
        tag: 'QUICK PLAY',
        route: '/game/select',
      },
      {
        key: 'historical',
        title: 'Historical Eras',
        subtitle: 'Legends Mode',
        desc: "'85 Bears. 2007 Pats. Legion of Boom. 12 legendary rosters with authentic ratings.",
        icon: '🏛️',
        color: '#c49a1a',
        tag: '12 LEGENDS',
        route: '/game/historical',
        badge: 'NEW',
      },
    ],
  },
  {
    label: 'CAREER & FRANCHISE',
    icon: '🏟️',
    modes: [
      {
        key: 'career',
        title: 'Road to Glory',
        subtitle: 'Career Mode',
        desc: 'Create a player. Build from high school through the NFL Draft and into a pro career. Every snap of your journey matters.',
        icon: '⭐',
        color: '#a855f7',
        tag: 'CAREER MODE',
        route: '/career',
        wide: true,
        badge: 'NEW',
      },
      {
        key: 'franchise',
        title: 'Franchise Mode',
        subtitle: 'Dynasty Builder',
        desc: 'Roster management, salary cap ($255M), free agency, contract negotiations. Build a multi-year dynasty.',
        icon: '🏟️',
        color: '#f59e0b',
        tag: 'MULTI-YEAR',
        route: '/game/franchise',
      },
      {
        key: 'rebuild',
        title: 'Rebuild Challenge',
        subtitle: 'From the Bottom',
        desc: 'Worst team. 10 years. The Browns, a complete teardown, or a window-closing contender. Community leaderboard.',
        icon: '📉',
        color: '#ef4444',
        tag: 'CHALLENGE',
        route: '/rebuild',
        badge: 'NEW',
      },
    ],
  },
  {
    label: 'SEASON & PLAYOFFS',
    icon: '📅',
    modes: [
      {
        key: 'season',
        title: 'Season Mode',
        subtitle: '18-Week NFL Season',
        desc: 'Simulate or play every week of the NFL season. Full division standings. Chase a playoff spot.',
        icon: '📅',
        color: '#22c55e',
        tag: '18 WEEKS',
        route: '/game/season',
      },
      {
        key: 'playoffs',
        title: 'Playoff Mode',
        subtitle: '14-Team Bracket',
        desc: 'Seed the bracket your way. Play every round from Wild Card through the Super Bowl.',
        icon: '🏆',
        color: '#f97316',
        tag: 'BRACKET',
        route: '/game/playoffs',
      },
    ],
  },
  {
    label: 'COLLEGE FOOTBALL',
    icon: '🎓',
    modes: [
      {
        key: 'recruiting',
        title: 'Recruiting',
        subtitle: 'Build Your Class',
        desc: 'Call 100 real recruits. Make your pitch. Watch them respond in real time — AI-powered conversations with every prospect. Transfer portal. Signing Day.',
        icon: '📞',
        color: '#06b6d4',
        tag: 'AI CONVERSATIONS',
        route: '/recruiting',
        wide: true,
        badge: 'NEW',
      },
    ],
  },
  {
    label: 'SCOUTING & DRAFT',
    icon: '📋',
    modes: [
      {
        key: 'draft',
        title: 'Mock Draft Simulator',
        subtitle: 'War Room',
        desc: '480 real 2026 prospects. 32 franchises. AI opponents. Live trade engine with hectic pre-draft war room.',
        icon: '📋',
        color: '#3b7dd8',
        tag: '2026 CLASS',
        route: '/draft/select',
        wide: true,
      },
      {
        key: 'combine',
        title: 'NFL Combine',
        subtitle: '5 Mini-Games',
        desc: '40-yard dash, bench press, Wonderlic, route running, QB accuracy drill. One combined grade.',
        icon: '🏃',
        color: '#84cc16',
        tag: '5 EVENTS',
        route: '/combine',
        badge: 'NEW',
      },
      {
        key: 'scouting',
        title: 'Scouting Hub',
        subtitle: 'Big Board',
        desc: 'Claude-powered deep dives on every prospect. 2025–2028 classes. Watchlist builder.',
        icon: '🔭',
        color: '#7c3aed',
        tag: 'CLAUDE AI',
        route: '/scouting',
      },
      {
        key: 'analytics',
        title: 'Analytics Dashboard',
        subtitle: 'Advanced Stats',
        desc: 'EPA, Win Probability, draft analytics, combine metrics. The analytics layer Madden never built.',
        icon: '📊',
        color: '#0ea5e9',
        tag: 'ANALYTICS',
        route: '/analytics',
        badge: 'NEW',
      },
    ],
  },
  {
    label: 'FANTASY',
    icon: '🏅',
    modes: [
      {
        key: 'fantasy',
        title: 'Fantasy League',
        subtitle: 'Season-Long & DFS',
        desc: 'Real NFL players. Snake draft. Live scoring. Full season-long fantasy league plus DFS contests.',
        icon: '🏅',
        color: '#c49a1a',
        tag: 'LIVE',
        route: '/fantasy',
      },
    ],
  },
];

export function GameModesPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: S.bg, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Nav */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 24px', height: 50,
        background: S.surface, borderBottom: `1px solid ${S.border}`,
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <button onClick={() => navigate('/')} style={{ fontSize: 12, color: S.txtSub, background: 'none', border: 'none', cursor: 'pointer', marginRight: 16 }}>
          ← Back
        </button>
        <span style={{ fontSize: 15, fontWeight: 800, color: S.txt, letterSpacing: '-0.02em' }}>
          Gridiron<span style={{ color: S.gold }}>IQ</span>
        </span>
        <span style={{ marginLeft: 10, fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.txtMuted }}>
          · All Modes
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {[
            { label: 'Draft', route: '/draft/select' },
            { label: 'Recruiting', route: '/recruiting' },
            { label: 'Analytics', route: '/analytics' },
            { label: 'Fantasy', route: '/fantasy' },
          ].map(l => (
            <button
              key={l.route}
              onClick={() => navigate(l.route)}
              style={{ fontSize: 11, color: S.txtSub, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: 4 }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '40px 24px 60px' }}>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ marginBottom: 44 }}
        >
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: S.txtMuted, marginBottom: 8 }}>
            GridironIQ · Front Office Platform
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: S.txt, letterSpacing: '-0.04em', margin: '0 0 8px', fontFamily: 'Impact, system-ui, sans-serif' }}>
            CHOOSE YOUR MODE
          </h1>
          <p style={{ fontSize: 13, color: S.txtSub, margin: 0, lineHeight: 1.7 }}>
            Draft simulator · AI Recruiting · Road to Glory · Franchise · Season · Playoffs · Combine · Analytics · Historical Eras · Rebuild Challenge
          </p>
        </motion.div>

        {/* Sections */}
        {SECTIONS.map((section, si) => (
          <motion.div
            key={section.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.07 + 0.1, duration: 0.3 }}
            style={{ marginBottom: 36 }}
          >
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 13 }}>{section.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.txtMuted }}>
                {section.label}
              </span>
              <div style={{ flex: 1, height: 1, background: S.border }} />
            </div>

            {/* Card grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {section.modes.map((mode, mi) => (
                <motion.button
                  key={mode.key}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: si * 0.07 + mi * 0.04 + 0.15 }}
                  whileHover={{ scale: 1.018, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(mode.route)}
                  style={{
                    gridColumn: mode.wide ? 'span 2' : 'span 1',
                    padding: '18px 16px',
                    borderRadius: 10,
                    background: S.surface,
                    border: `1px solid ${S.border}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'border-color 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = mode.color + '44')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = S.border)}
                >
                  {/* Glow */}
                  <div style={{
                    position: 'absolute', top: -20, right: -20, width: 100, height: 100,
                    borderRadius: '50%', background: `${mode.color}14`, filter: 'blur(30px)', pointerEvents: 'none',
                  }} />

                  <div style={{ position: 'relative' }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 22 }}>{mode.icon}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {mode.badge && (
                          <span style={{
                            fontSize: 8, fontWeight: 800, letterSpacing: '0.08em', padding: '2px 5px',
                            borderRadius: 3, background: `${mode.color}22`, border: `1px solid ${mode.color}44`,
                            color: mode.color,
                          }}>
                            {mode.badge}
                          </span>
                        )}
                        <span style={{
                          fontSize: 8, fontWeight: 600, letterSpacing: '0.08em', padding: '2px 5px',
                          borderRadius: 3, background: 'rgba(255,255,255,0.04)', border: `1px solid ${S.border}`,
                          color: S.txtMuted,
                        }}>
                          {mode.tag}
                        </span>
                      </div>
                    </div>

                    {/* Text */}
                    <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.txtMuted, marginBottom: 3 }}>
                      {mode.subtitle}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: S.txt, letterSpacing: '-0.02em', marginBottom: 5, fontFamily: 'Impact, system-ui, sans-serif' }}>
                      {mode.title}
                    </div>
                    <div style={{ fontSize: 11, color: S.txtSub, lineHeight: 1.6 }}>
                      {mode.desc}
                    </div>

                    {/* Arrow line */}
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ height: 1, flex: 1, background: `linear-gradient(to right, ${mode.color}44, transparent)` }} />
                      <span style={{ fontSize: 12, color: mode.color }}>→</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
