import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const S = {
  bg: '#080810',
  surface: '#0d0d1a',
  elevated: '#12122a',
  border: 'rgba(255,255,255,0.06)',
  txt: '#e8eaf0',
  txtSub: '#8890a8',
  txtMuted: '#3a3d52',
};

const MODES = [
  {
    key: 'exhibition',
    title: 'Exhibition',
    subtitle: 'Quick Game',
    desc: 'Pick any two teams and play a single game. NFL or NCAA. Jump right in.',
    icon: '⚡',
    color: '#3b7dd8',
    glow: 'rgba(59,125,216,0.15)',
    tag: 'QUICK PLAY',
    route: '/game/select',
  },
  {
    key: 'season',
    title: 'Season Mode',
    subtitle: '18-Week NFL Season',
    desc: 'Play or simulate every week of the NFL season. Chase a playoff spot. Win the Super Bowl.',
    icon: '📅',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.12)',
    tag: '18 WEEKS',
    route: '/game/season',
  },
  {
    key: 'franchise',
    title: 'Franchise Mode',
    subtitle: 'Multi-Year Dynasty',
    desc: 'Build a dynasty over multiple seasons. Manage your roster, salary cap, free agency, and draft.',
    icon: '🏟️',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.12)',
    tag: 'MULTI-YEAR',
    route: '/game/franchise',
  },
  {
    key: 'playoffs',
    title: 'Playoff Mode',
    subtitle: '14-Team NFL Bracket',
    desc: 'Start from Wild Card weekend and play all the way to the Super Bowl. Seed the bracket your way.',
    icon: '🏆',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.12)',
    tag: 'BRACKET',
    route: '/game/playoffs',
  },
];

export function GameModesPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: S.bg, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px', height: 50, background: S.surface, borderBottom: `1px solid ${S.border}` }}>
        <button
          onClick={() => navigate('/')}
          style={{ fontSize: 12, color: S.txtSub, background: 'none', border: 'none', cursor: 'pointer', marginRight: 16 }}
        >
          ← Back
        </button>
        <span style={{ fontSize: 15, fontWeight: 800, color: S.txt, letterSpacing: '-0.02em' }}>
          Gridiron<span style={{ color: '#f59e0b' }}>IQ</span>
        </span>
        <span style={{ marginLeft: 10, fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.txtMuted }}>
          Game Modes
        </span>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.txtMuted, marginBottom: 8 }}>
            Arcade Football
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 900, color: S.txt, letterSpacing: '-0.04em', margin: '0 0 6px', fontFamily: 'Impact, system-ui, sans-serif' }}>
            CHOOSE YOUR MODE
          </h1>
          <p style={{ fontSize: 13, color: S.txtSub, margin: '0 0 40px', lineHeight: 1.6 }}>
            NFL & NCAA · Tecmo Bowl-style gameplay · All 32 teams
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {MODES.map((mode, i) => (
            <motion.button
              key={mode.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 + 0.1, duration: 0.35 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(mode.route)}
              style={{
                padding: '28px 24px',
                borderRadius: 14,
                background: S.surface,
                border: `1px solid ${S.border}`,
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.15s',
              }}
            >
              {/* Glow */}
              <div style={{ position: 'absolute', top: -20, right: -20, width: 140, height: 140, borderRadius: '50%', background: mode.glow, filter: 'blur(40px)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 32 }}>{mode.icon}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', padding: '3px 8px', borderRadius: 4, background: `${mode.color}18`, border: `1px solid ${mode.color}33`, color: mode.color }}>
                    {mode.tag}
                  </span>
                </div>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.txtMuted, marginBottom: 4 }}>
                  {mode.subtitle}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: S.txt, letterSpacing: '-0.02em', marginBottom: 8, fontFamily: 'Impact, system-ui, sans-serif' }}>
                  {mode.title}
                </div>
                <div style={{ fontSize: 12, color: S.txtSub, lineHeight: 1.6 }}>
                  {mode.desc}
                </div>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ height: 2, flex: 1, background: `linear-gradient(to right, ${mode.color}66, transparent)`, borderRadius: 1 }} />
                  <span style={{ fontSize: 14, color: mode.color }}>→</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
