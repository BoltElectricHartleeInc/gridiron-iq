import { useNavigate } from 'react-router-dom';
import { useDraftStore } from '../store/draftStore';
import { NFL_TEAMS } from '../data/teams';

// ─── ESPN CDN logo helper ─────────────────────────────────────────────────────
const ESPN_SLUGS = [
  'ari','atl','bal','buf','car','chi','cin','cle',
  'dal','den','det','gb','hou','ind','jax','kc',
  'lac','lar','lv','mia','min','ne','no','nyg',
  'nyj','phi','pit','sea','sf','tb','ten','wsh',
];
function logo(slug: string) {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${slug}.png`;
}
function abbrevToSlug(abbr: string): string {
  const map: Record<string, string> = {
    ARI:'ari',ATL:'atl',BAL:'bal',BUF:'buf',CAR:'car',CHI:'chi',
    CIN:'cin',CLE:'cle',DAL:'dal',DEN:'den',DET:'det',GB:'gb',
    HOU:'hou',IND:'ind',JAX:'jax',KC:'kc',LAC:'lac',LAR:'lar',
    LV:'lv',MIA:'mia',MIN:'min',NE:'ne',NO:'no',NYG:'nyg',
    NYJ:'nyj',PHI:'phi',PIT:'pit',SEA:'sea',SF:'sf',TB:'tb',
    TEN:'ten',WSH:'wsh',
  };
  return map[abbr] ?? abbr.toLowerCase();
}

// ─── Module definitions ───────────────────────────────────────────────────────
type Mod = {
  route: string;
  title: string;
  tag: string;
  desc: string;
  accent: string;
  badge: string;
  badgeColor: string;
  wide?: boolean;
};

const MODS: Mod[] = [
  {
    route: '/draft/select',
    title: 'Mock Draft Simulator',
    tag: 'WAR ROOM',
    desc: '480 real 2026 prospects · 32 franchises · AI opponents · Live trade engine',
    accent: '#2979FF',
    badge: 'LIVE',
    badgeColor: '#00E676',
    wide: true,
  },
  {
    route: '/scouting',
    title: 'Scouting Hub',
    tag: 'BIG BOARD',
    desc: 'AI-generated deep dives on every prospect · Claude powered',
    accent: '#AA00FF',
    badge: 'CLAUDE',
    badgeColor: '#CE93D8',
  },
  {
    route: '/fantasy',
    title: 'Fantasy League',
    tag: 'SEASON-LONG & DFS',
    desc: 'Real NFL players · Snake draft · Sleeper-powered live scoring',
    accent: '#D4AF37',
    badge: 'LIVE',
    badgeColor: '#00E676',
  },
  {
    route: '/game',
    title: 'Arcade Football',
    tag: 'GAME MODE',
    desc: 'NFL & NCAA · Tecmo Bowl-style gameplay',
    accent: '#FF6D00',
    badge: 'LIVE',
    badgeColor: '#00E676',
  },
  {
    route: '/career',
    title: 'Career Mode',
    tag: 'FRANCHISE',
    desc: 'Build a dynasty across multiple seasons as head coach',
    accent: '#00BFA5',
    badge: 'BETA',
    badgeColor: '#00BFA5',
  },
  {
    route: '/rebuild',
    title: 'Rebuild Challenge',
    tag: 'CHALLENGE',
    desc: 'Take the worst roster in the league to a championship',
    accent: '#F44336',
    badge: 'LIVE',
    badgeColor: '#00E676',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const { session } = useDraftStore();
  const isDrafting = session?.status === 'drafting';
  const userTeam = isDrafting
    ? NFL_TEAMS.find((t) => t.id === session?.userTeamId)
    : null;

  // Duplicate logos for seamless marquee scroll
  const marqueeLogos = [...ESPN_SLUGS, ...ESPN_SLUGS];

  return (
    <div style={{ minHeight: '100vh', background: '#05080F', color: '#DDE8F4', fontFamily: "'Inter', system-ui, sans-serif", overflowX: 'hidden' }}>

      {/* ── Global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse {
          0%,100% { opacity:.5; transform:scale(.9); }
          50%      { opacity:1; transform:scale(1.1); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .mod-card {
          position: relative;
          background: #0A1220;
          border: 1px solid #172033;
          border-radius: 16px;
          padding: 28px 28px 24px;
          cursor: pointer;
          transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 180px;
        }
        .mod-card:hover {
          transform: translateY(-3px);
          border-color: var(--accent);
          box-shadow: 0 0 32px -8px var(--accent);
        }
        .mod-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 8%, transparent) 0%, transparent 60%);
          pointer-events: none;
        }
        .mod-card-wide {
          grid-column: 1 / -1;
          min-height: 160px;
          flex-direction: row;
          align-items: center;
          gap: 40px;
        }
        @media (max-width: 700px) {
          .mod-card-wide { flex-direction: column; align-items: flex-start; gap: 16px; }
          .mod-grid { grid-template-columns: 1fr !important; }
        }

        .stat-card {
          background: #0A1220;
          border: 1px solid #172033;
          border-radius: 14px;
          padding: 22px 24px;
          text-align: center;
          transition: border-color 180ms ease;
        }
        .stat-card:hover { border-color: #2A4870; }

        .resume-btn {
          background: linear-gradient(135deg, #1565C0, #2196F3);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: inherit;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: .04em;
          padding: 16px 36px;
          cursor: pointer;
          transition: opacity 180ms, transform 180ms;
        }
        .resume-btn:hover { opacity:.9; transform:translateY(-1px); }

        .new-draft-btn {
          background: transparent;
          border: 1px solid #2A4870;
          border-radius: 12px;
          color: #6888A8;
          font-family: inherit;
          font-size: 15px;
          font-weight: 700;
          padding: 16px 36px;
          cursor: pointer;
          transition: border-color 180ms, color 180ms;
        }
        .new-draft-btn:hover { border-color: #2196F3; color: #DDE8F4; }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{ height: 60, borderBottom: '1px solid #172033', background: 'rgba(5,8,15,.9)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-.02em' }}>GridironIQ</span>
          <span style={{ color: '#172033', fontSize: 18 }}>|</span>
          <span style={{ fontSize: 10, color: '#2A4060', fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase' }}>Front Office Platform</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(0,200,83,.08)', border: '1px solid rgba(0,200,83,.25)', borderRadius: 999, padding: '6px 12px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C853', display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite' }} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', color: '#00C853' }}>2026 NFL DRAFT LIVE</span>
          </div>
          {isDrafting && (
            <button className="resume-btn" style={{ padding: '8px 20px', fontSize: 12, borderRadius: 8 }} onClick={() => navigate('/draft/board')}>
              Resume Draft →
            </button>
          )}
        </div>
      </nav>

      {/* ── Team logo marquee ── */}
      <div style={{ borderBottom: '1px solid #0E1828', background: '#070A12', padding: '14px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', animation: 'marquee 30s linear infinite', width: 'max-content', gap: 28 }}>
          {marqueeLogos.map((slug, i) => (
            <img
              key={`${slug}-${i}`}
              src={logo(slug)}
              alt={slug}
              width={38}
              height={38}
              style={{ objectFit: 'contain', opacity: .55, filter: 'grayscale(20%)', flexShrink: 0 }}
            />
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 28px 48px', animation: 'fadeUp .6s ease both' }}>

        {/* Active draft resume banner */}
        {isDrafting && userTeam && (
          <div
            onClick={() => navigate('/draft/board')}
            style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#0A1525', border: '1px solid #1E2E45', borderRadius: 14, padding: '14px 20px', marginBottom: 40, cursor: 'pointer', transition: 'border-color 180ms', maxWidth: 560 }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#2979FF')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E2E45')}
          >
            <img src={logo(abbrevToSlug(userTeam.abbreviation))} width={44} height={44} style={{ objectFit: 'contain' }} alt={userTeam.name} />
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.12em', color: '#2979FF', textTransform: 'uppercase' }}>Draft in Progress</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{userTeam.city} {userTeam.name} · Pick #{session?.picks[session.currentPickIndex]?.overall ?? '—'}</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 20, color: '#2A4060' }}>→</div>
          </div>
        )}

        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.2em', color: '#2A4060', textTransform: 'uppercase', marginBottom: 20 }}>
          NFL · NCAA · AI-POWERED SCOUTING
        </div>

        <h1 style={{ fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-.03em', marginBottom: 20 }}>
          Your Front Office.<br />
          <span style={{ background: 'linear-gradient(90deg, #D4AF37, #F5CC50)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Your Draft Room.
          </span>
        </h1>

        <p style={{ fontSize: 18, color: '#6888A8', fontWeight: 500, lineHeight: 1.6, maxWidth: 560, marginBottom: 36 }}>
          Mock draft like a real GM. 480 real 2026 prospects, AI war room advisor, live trade engine, and full scouting reports on every player.
        </p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <button className="resume-btn" onClick={() => navigate('/draft/select')}>
            {isDrafting ? 'Resume War Room →' : 'Start New Draft →'}
          </button>
          {isDrafting && (
            <button className="new-draft-btn" onClick={() => navigate('/draft/select')}>
              New Draft
            </button>
          )}
        </div>
      </section>

      {/* ── Module grid ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px 64px' }}>
        <div
          className="mod-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}
        >
          {MODS.map((mod) => (
            <button
              key={mod.route}
              className={`mod-card${mod.wide ? ' mod-card-wide' : ''}`}
              style={{ '--accent': mod.accent } as React.CSSProperties}
              onClick={() => navigate(mod.route)}
            >
              {mod.wide ? (
                <>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.16em', color: '#2A4060', textTransform: 'uppercase' }}>{mod.tag}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', color: mod.badgeColor, background: `color-mix(in srgb, ${mod.badgeColor} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${mod.badgeColor} 30%, transparent)`, borderRadius: 999, padding: '3px 9px' }}>{mod.badge}</span>
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: '#DDE8F4', letterSpacing: '-.02em', marginBottom: 8 }}>{mod.title}</div>
                    <div style={{ fontSize: 13, color: '#6888A8', fontWeight: 500, lineHeight: 1.5 }}>{mod.desc}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: -12, flexShrink: 0 }}>
                    {['nyg','dal','phi','wsh'].map((s) => (
                      <img key={s} src={logo(s)} width={48} height={48} alt={s} style={{ objectFit: 'contain', marginLeft: -8, filter: 'drop-shadow(0 0 8px rgba(0,0,0,.8))' }} />
                    ))}
                    <span style={{ marginLeft: 16, fontSize: 22, color: '#2A4060' }}>→</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.16em', color: '#2A4060', textTransform: 'uppercase' }}>{mod.tag}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', color: mod.badgeColor, background: `color-mix(in srgb, ${mod.badgeColor} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${mod.badgeColor} 30%, transparent)`, borderRadius: 999, padding: '3px 9px' }}>{mod.badge}</span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#DDE8F4', letterSpacing: '-.01em', marginTop: 4 }}>{mod.title}</div>
                  <div style={{ fontSize: 12, color: '#6888A8', fontWeight: 500, lineHeight: 1.5, flex: 1 }}>{mod.desc}</div>
                  <div style={{ alignSelf: 'flex-end', fontSize: 18, color: '#2A4060' }}>→</div>
                  {/* bottom accent bar */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${mod.accent}, transparent)` }} />
                </>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { n: '759', label: 'Prospects', sub: '2026 & 2027 classes' },
            { n: '32', label: 'NFL Teams', sub: 'All franchises' },
            { n: '7', label: 'Draft Rounds', sub: 'Full simulation' },
            { n: 'Claude', label: 'AI Engine', sub: 'War room advisor' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-.03em', color: '#DDE8F4', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#8AAAC8', marginTop: 6 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: '#2A4060', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Coming soon strip ── */}
      <section style={{ borderTop: '1px solid #0E1828', background: '#070A12', padding: '24px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.18em', color: '#2A4060', textTransform: 'uppercase' }}>Coming Soon</span>
          {[
            { icon: '📊', label: 'Live Scores' },
            { icon: '📰', label: 'News Hub' },
            { icon: '🔄', label: 'Trade Analyzer' },
            { icon: '📈', label: 'Analytics Dashboard' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <span style={{ fontSize: 12, color: '#2A4060', fontWeight: 600 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export { LandingPage };
