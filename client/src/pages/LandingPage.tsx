import { API_BASE } from '../lib/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDraftStore } from '../store/draftStore';

const S = {
  bg:       '#0b0f18',
  surface:  '#0f1623',
  elevated: '#141d2e',
  border:   '#1c2d40',
  txt:      '#cdd8e8',
  txtSub:   '#6b82a0',
  txtMuted: '#334560',
  blue:     '#3b7dd8',
  blueSub:  'rgba(59,125,216,0.10)',
  gold:     '#c49a1a',
  goldSub:  'rgba(196,154,26,0.10)',
  green:    '#1e8c4e',
  greenSub: 'rgba(30,140,78,0.10)',
};

interface RecentDraft {
  id: string;
  teamName: string;
  grade: string | null;
  gradeScore: number | null;
  completedAt: string | null;
}

const MODULES = [
  {
    key: 'draft',
    title: 'Mock Draft Simulator',
    subtitle: 'War Room',
    desc: '480 real 2026 prospects · 32 franchises · AI opponents · Live trade engine',
    tag: '2026 & 2027 Classes',
    tagColor: S.blue,
    accent: '#1e3460',
    span: 2,
    icon: '📋',
  },
  {
    key: 'scouting',
    title: 'Scouting Hub',
    subtitle: 'Big Board',
    desc: 'AI-generated deep dives · 2025–2028 classes · Watchlist',
    tag: 'Claude Powered',
    tagColor: '#7c3aed',
    accent: '#1a1035',
    span: 1,
    icon: '🔭',
  },
  {
    key: 'fantasy',
    title: 'Fantasy League',
    subtitle: 'Season-Long & DFS',
    desc: 'Real NFL players · Snake draft · DFS contests · Sleeper-powered live scoring',
    tag: 'Live',
    tagColor: S.gold,
    accent: '#1e1a00',
    span: 1,
    icon: '🏆',
  },
  {
    key: 'game',
    title: 'Arcade Football',
    subtitle: 'Game Mode',
    desc: 'NFL & NCAA · Tecmo Bowl-style gameplay',
    tag: 'Live',
    tagColor: S.green,
    accent: '#0e2018',
    span: 1,
    icon: '🏈',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { session, resetDraft } = useDraftStore();
  const [recentDrafts, setRecentDrafts] = useState<RecentDraft[]>([]);

  useEffect(() => {
    fetch(API_BASE + '/api/drafts')
      .then(r => r.json())
      .then((data: RecentDraft[]) => setRecentDrafts(data.slice(0, 5)))
      .catch(() => {});
  }, []);

  const handleNav = (key: string) => {
    if (key === 'draft') {
      if (session?.status === 'drafting') navigate('/draft/board');
      else { resetDraft(); navigate('/draft/select'); }
    } else if (key === 'scouting') navigate('/scouting');
    else if (key === 'fantasy') navigate('/fantasy');
    else if (key === 'game') navigate('/game/select');
  };

  return (
    <div style={{ minHeight: '100vh', background: S.bg, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── TOP NAV ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 28px', height: 52, background: S.surface, borderBottom: `1px solid ${S.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: S.txt, letterSpacing: '-0.03em' }}>
            Gridiron<span style={{ color: S.gold }}>IQ</span>
          </span>
          <span style={{ width: 1, height: 16, background: S.border }} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.txtMuted }}>
            Front Office Platform
          </span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 4, background: S.greenSub, border: `1px solid rgba(30,140,78,0.25)` }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: S.green, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: S.green, letterSpacing: '0.08em' }}>2026 NFL DRAFT LIVE</span>
          </div>
          {session?.status === 'drafting' && (
            <button
              onClick={() => navigate('/draft/board')}
              style={{ fontSize: 11, padding: '4px 12px', borderRadius: 4, background: S.blueSub, border: `1px solid rgba(59,125,216,0.3)`, color: S.blue, cursor: 'pointer', fontWeight: 600 }}
            >
              Resume Draft →
            </button>
          )}
        </div>
      </div>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 28px 0' }}>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ marginBottom: 6, fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.txtMuted }}>
            NFL · NCAA · AI-Powered Scouting
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 800, color: S.txt, letterSpacing: '-0.04em', lineHeight: 1.05, margin: 0 }}>
            Your Front Office.<br />
            <span style={{ color: S.gold }}>Your Draft Room.</span>
          </h1>
          <p style={{ fontSize: 14, color: S.txtSub, marginTop: 12, maxWidth: 480, lineHeight: 1.6 }}>
            Mock draft like a real GM. 480 real 2026 prospects, AI war room advisor, live trade engine, and full scouting reports on every player.
          </p>
        </motion.div>

        {/* ── MODULE CARDS ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 32 }}
        >
          {MODULES.map(mod => (
            <motion.button
              key={mod.key}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleNav(mod.key)}
              style={{
                gridColumn: mod.span === 2 ? '1 / -1' : 'auto',
                padding: mod.span === 2 ? '22px 24px' : '18px 20px',
                borderRadius: 10,
                background: S.surface,
                border: `1px solid ${S.border}`,
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
                display: 'block',
                transition: 'all 0.12s',
              }}
            >
              {/* Accent glow */}
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: mod.accent, filter: 'blur(40px)', opacity: 0.6, pointerEvents: 'none' }} />

              <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: mod.span === 2 ? 22 : 18 }}>{mod.icon}</span>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.txtMuted }}>{mod.subtitle}</div>
                      <div style={{ fontSize: mod.span === 2 ? 18 : 15, fontWeight: 700, color: S.txt, lineHeight: 1.1 }}>{mod.title}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: S.txtSub, lineHeight: 1.5, maxWidth: mod.span === 2 ? 500 : 220 }}>{mod.desc}</div>
                  {mod.key === 'draft' && session?.status === 'drafting' && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, padding: '4px 10px', borderRadius: 4, background: S.goldSub, border: `1px solid rgba(196,154,26,0.3)` }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: S.gold, animation: 'pulse 1.5s infinite' }} />
                      <span style={{ fontSize: 10, fontWeight: 600, color: S.gold }}>Draft in progress — resume</span>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: `${mod.tagColor}18`, border: `1px solid ${mod.tagColor}44`, color: mod.tagColor, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                    {mod.tag}
                  </span>
                  <span style={{ fontSize: 18, color: S.txtMuted }}>→</span>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* ── STATS ROW ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 10 }}
        >
          {[
            { label: 'Prospects', value: '759', sub: '2026 & 2027 classes' },
            { label: 'NFL Teams', value: '32', sub: 'All franchises' },
            { label: 'Draft Rounds', value: '7', sub: 'Full simulation' },
            { label: 'AI Engine', value: 'Claude', sub: 'War room advisor' },
          ].map(stat => (
            <div key={stat.label} style={{ padding: '12px 14px', borderRadius: 8, background: S.elevated, border: `1px solid ${S.border}` }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: S.txt, letterSpacing: '-0.02em' }}>{stat.value}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: S.txtSub, marginTop: 2 }}>{stat.label}</div>
              <div style={{ fontSize: 9, color: S.txtMuted, marginTop: 1 }}>{stat.sub}</div>
            </div>
          ))}
        </motion.div>

        {/* ── COMING SOON ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}
        >
          {[
            { label: 'Live Scores', desc: 'Real-time tracking', icon: '📊' },
            { label: 'News Hub', desc: 'NFL analysis & rumors', icon: '📰' },
            { label: 'Trade Analyzer', desc: 'Fantasy trade grades', icon: '📈' },
          ].map(item => (
            <div key={item.label} style={{ padding: '12px 14px', borderRadius: 8, background: S.surface, border: `1px solid ${S.border}`, opacity: 0.5, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: S.txt }}>{item.label}</div>
                <div style={{ fontSize: 9, color: S.txtMuted }}>{item.desc} · Coming Soon</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── RECENT DRAFTS ─────────────────────────────────────────────── */}
        {recentDrafts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ marginTop: 24, marginBottom: 32 }}
          >
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.txtMuted, marginBottom: 8 }}>
              Recent Sessions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recentDrafts.map(draft => (
                <div key={draft.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', borderRadius: 6, background: S.elevated, border: `1px solid ${S.border}` }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: S.txtSub, flex: 1 }}>{draft.teamName}</span>
                  {draft.grade && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: S.blue }}>{draft.grade}</span>
                  )}
                  {draft.completedAt && (
                    <span style={{ fontSize: 9, color: S.txtMuted }}>{new Date(draft.completedAt).toLocaleDateString()}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
