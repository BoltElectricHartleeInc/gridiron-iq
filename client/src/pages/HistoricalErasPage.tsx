import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppShell, C, Badge, Btn, SectionHead } from '../components/AppShell';
import type { GameTeam } from '../game/teams';

// ─── Historical Team Interface ────────────────────────────────────────────────

interface HistoricalTeam extends GameTeam {
  era: string;
  keyPlayers: string;
  badge: string;
  historicalNote: string;
  offenseRating: number;
  defenseRating: number;
  speedRating: number;
}

// ─── The 12 legendary teams ───────────────────────────────────────────────────

export const HISTORICAL_TEAMS: HistoricalTeam[] = [
  {
    id:            'hist_1985_bears',
    name:          'Bears',
    city:          '1985 Chicago',
    abbreviation:  'CHI',
    primaryColor:  0x0B162A,
    secondaryColor:0xC83803,
    offenseRating: 78,
    defenseRating: 99,
    speedRating:   85,
    league:        'nfl',
    era:           '1985',
    keyPlayers:    '46 Defense · Walter Payton · Jim McMahon',
    badge:         'SUPER BOWL XX CHAMPIONS',
    historicalNote:'Buddy Ryan\'s 46 Defense terrorized offenses all season. The Bears allowed a record-low 198 points and obliterated the Patriots 46-10 in the Super Bowl.',
  },
  {
    id:            'hist_1994_49ers',
    name:          '49ers',
    city:          '1994 San Francisco',
    abbreviation:  'SF',
    primaryColor:  0xAA0000,
    secondaryColor:0xB3995D,
    offenseRating: 96,
    defenseRating: 88,
    speedRating:   90,
    league:        'nfl',
    era:           '1994',
    keyPlayers:    'Steve Young · Jerry Rice · Ricky Watters',
    badge:         'SUPER BOWL XXIX CHAMPIONS',
    historicalNote:'Steve Young threw a then-record 6 touchdown passes in the Super Bowl. Loaded with Hall of Famers, this was the capstone of the dynasty that Montana built.',
  },
  {
    id:            'hist_1998_broncos',
    name:          'Broncos',
    city:          '1998 Denver',
    abbreviation:  'DEN',
    primaryColor:  0xFB4F14,
    secondaryColor:0x002244,
    offenseRating: 92,
    defenseRating: 85,
    speedRating:   88,
    league:        'nfl',
    era:           '1998',
    keyPlayers:    'John Elway · Terrell Davis · Shannon Sharpe',
    badge:         'BACK-TO-BACK CHAMPS',
    historicalNote:'Terrell Davis rushed for 2,008 yards and won MVP. Elway finally got his rings, retiring on top after back-to-back titles that cemented the Broncos as a dynasty.',
  },
  {
    id:            'hist_2001_rams',
    name:          'Rams',
    city:          '2001 St. Louis',
    abbreviation:  'LAR',
    primaryColor:  0x003594,
    secondaryColor:0xFFA300,
    offenseRating: 99,
    defenseRating: 78,
    speedRating:   92,
    league:        'nfl',
    era:           '2001',
    keyPlayers:    'Kurt Warner · Marshall Faulk · Torry Holt',
    badge:         'SUPER BOWL XXXVI',
    historicalNote:'The Greatest Show on Turf averaged 31 points per game. Kurt Warner threw for over 4,800 yards and Marshall Faulk had over 2,000 yards from scrimmage.',
  },
  {
    id:            'hist_2004_patriots',
    name:          'Patriots',
    city:          '2004 New England',
    abbreviation:  'NE',
    primaryColor:  0x002244,
    secondaryColor:0xC60C30,
    offenseRating: 88,
    defenseRating: 91,
    speedRating:   84,
    league:        'nfl',
    era:           '2004',
    keyPlayers:    'Tom Brady · Rodney Harrison · Tedy Bruschi',
    badge:         '3 RINGS IN 4 YEARS',
    historicalNote:'Belichick\'s system turned undrafted free agents into champions. Brady was the cold-blooded leader of a defense-first dynasty built on film study and situational football.',
  },
  {
    id:            'hist_2007_patriots',
    name:          'Patriots',
    city:          '2007 New England',
    abbreviation:  'NE',
    primaryColor:  0x002244,
    secondaryColor:0xC60C30,
    offenseRating: 99,
    defenseRating: 90,
    speedRating:   88,
    league:        'nfl',
    era:           '2007',
    keyPlayers:    'Tom Brady · Randy Moss · Wes Welker',
    badge:         '16-0 REGULAR SEASON',
    historicalNote:'Brady threw a then-record 50 touchdown passes. Moss caught a record 23 TDs. They went 16-0 before the improbable Super Bowl loss to Eli Manning and the Giants.',
  },
  {
    id:            'hist_2009_saints',
    name:          'Saints',
    city:          '2009 New Orleans',
    abbreviation:  'NO',
    primaryColor:  0xD3BC8D,
    secondaryColor:0x101820,
    offenseRating: 93,
    defenseRating: 83,
    speedRating:   86,
    league:        'nfl',
    era:           '2009',
    keyPlayers:    'Drew Brees · Marques Colston · Reggie Bush',
    badge:         'SUPER BOWL XLIV CHAMPIONS',
    historicalNote:'Who Dat Nation had waited a lifetime. Brees completed 70% of his passes for 4,388 yards, and an onside kick to open the second half changed the Super Bowl forever.',
  },
  {
    id:            'hist_2012_49ers',
    name:          '49ers',
    city:          '2012 San Francisco',
    abbreviation:  'SF',
    primaryColor:  0xAA0000,
    secondaryColor:0xB3995D,
    offenseRating: 86,
    defenseRating: 95,
    speedRating:   89,
    league:        'nfl',
    era:           '2012',
    keyPlayers:    'Colin Kaepernick · Aldon Smith · Patrick Willis',
    badge:         'NFC CHAMPIONS',
    historicalNote:'Jim Harbaugh\'s machine was built on a ferocious defense led by Willis and Smith. Kaepernick\'s playoff emergence and read-option explosion nearly delivered a ring.',
  },
  {
    id:            'hist_2013_seahawks',
    name:          'Seahawks',
    city:          '2013 Seattle',
    abbreviation:  'SEA',
    primaryColor:  0x002244,
    secondaryColor:0x69BE28,
    offenseRating: 85,
    defenseRating: 99,
    speedRating:   91,
    league:        'nfl',
    era:           '2013',
    keyPlayers:    'Russell Wilson · Richard Sherman · Earl Thomas · Kam Chancellor',
    badge:         'SUPER BOWL XLVIII CHAMPIONS',
    historicalNote:'The Legion of Boom held Peyton Manning\'s record-setting offense to 8 points in Super Bowl XLVIII. The greatest defense of the modern era.',
  },
  {
    id:            'hist_2018_chiefs',
    name:          'Chiefs',
    city:          '2018 Kansas City',
    abbreviation:  'KC',
    primaryColor:  0xE31837,
    secondaryColor:0xFFB81C,
    offenseRating: 98,
    defenseRating: 78,
    speedRating:   93,
    league:        'nfl',
    era:           '2018',
    keyPlayers:    'Patrick Mahomes · Travis Kelce · Tyreek Hill',
    badge:         '50 TOUCHDOWNS · 5,000 YARDS',
    historicalNote:'Mahomes became the second player ever to throw 50 touchdowns before his 24th birthday. His improvisation and arm talent were unlike anything the NFL had seen.',
  },
  {
    id:            'hist_2019_ravens',
    name:          'Ravens',
    city:          '2019 Baltimore',
    abbreviation:  'BAL',
    primaryColor:  0x241773,
    secondaryColor:0x9E7C0C,
    offenseRating: 95,
    defenseRating: 89,
    speedRating:   97,
    league:        'nfl',
    era:           '2019',
    keyPlayers:    'Lamar Jackson · Mark Andrews · Marquise Brown',
    badge:         'UNANIMOUS MVP · 14-2',
    historicalNote:'Lamar Jackson rewrote the record books with 36 TDs and just 6 INTs. His unanimous MVP was the highest-ever vote total. The Ravens\' rushing attack was historically dominant.',
  },
  {
    id:            'hist_2024_lions',
    name:          'Lions',
    city:          '2024 Detroit',
    abbreviation:  'DET',
    primaryColor:  0x0076B6,
    secondaryColor:0xB0B7BC,
    offenseRating: 93,
    defenseRating: 85,
    speedRating:   88,
    league:        'nfl',
    era:           '2024',
    keyPlayers:    'Jared Goff · Amon-Ra St. Brown · Aidan Hutchinson',
    badge:         'NFC NORTH DYNASTY BEGINS',
    historicalNote:'After decades of futility, Dan Campbell\'s Lions became the class of the NFC. Goff shed the bust label with elite decision-making and the city fell in love with football again.',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToCss(hex: number): string {
  return `#${hex.toString(16).padStart(6, '0')}`;
}

function ratingColor(v: number): string {
  if (v >= 95) return C.gold;
  if (v >= 90) return C.green;
  if (v >= 85) return C.blueBright;
  return C.txt;
}

// ─── Rating Bar ───────────────────────────────────────────────────────────────

function RatingBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.txtSub, letterSpacing: '.08em' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: ratingColor(value) }}>{value}</span>
      </div>
      <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', borderRadius: 2, background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ─── Historical Team Card ─────────────────────────────────────────────────────

interface TeamCardProps {
  team: HistoricalTeam;
  selected: boolean;
  role: 'home' | 'away' | null;
  onSelect: (role: 'home' | 'away') => void;
}

function TeamCard({ team, selected, role, onSelect }: TeamCardProps) {
  const primary = hexToCss(team.primaryColor);
  const secondary = hexToCss(team.secondaryColor);
  const [hovered, setHovered] = useState(false);

  const borderColor = role === 'home' ? C.blueBright
    : role === 'away' ? C.red
    : hovered ? C.borderHi : C.border;

  const glowColor = role === 'home' ? `${C.blueBright}40`
    : role === 'away' ? `${C.red}40`
    : hovered ? `${primary}30` : 'transparent';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: C.surface,
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 160ms, box-shadow 160ms, transform 160ms',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: role ? `0 0 28px -4px ${glowColor}` : hovered ? `0 0 20px -6px ${glowColor}` : 'none',
      }}
    >
      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, ${primary}18 0%, transparent 55%)`,
        pointerEvents: 'none',
      }} />
      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${primary}, ${secondary})`,
      }} />

      {/* Role badge */}
      {role && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          fontSize: 9, fontWeight: 800, letterSpacing: '.12em',
          padding: '3px 8px', borderRadius: 999,
          background: role === 'home' ? C.blueBright : C.red,
          color: '#fff',
        }}>
          {role.toUpperCase()}
        </div>
      )}

      <div style={{ padding: '20px 18px 16px' }}>
        {/* Header */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.16em', color: secondary, marginBottom: 2 }}>
            {team.era}
          </div>
          <div style={{ fontSize: 17, fontWeight: 900, color: C.txt, lineHeight: 1.2 }}>
            {team.city.split(' ').slice(1).join(' ')} {team.name}
          </div>
          <div style={{ fontSize: 11, color: C.txtSub, marginTop: 3 }}>{team.keyPlayers}</div>
        </div>

        {/* Rating bars */}
        <div style={{ marginBottom: 12 }}>
          <RatingBar label="OFFENSE" value={team.offenseRating} color={C.blueBright} />
          <RatingBar label="DEFENSE" value={team.defenseRating} color={C.red} />
          <RatingBar label="SPEED"   value={team.speedRating}   color={C.green} />
        </div>

        {/* Historical note */}
        <p style={{
          fontSize: 11, color: C.txtSub, lineHeight: 1.55,
          marginBottom: 12,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {team.historicalNote}
        </p>

        {/* Badge */}
        <div style={{
          fontSize: 9, fontWeight: 800, letterSpacing: '.12em',
          padding: '5px 10px', borderRadius: 6, textAlign: 'center',
          background: `${secondary}18`,
          color: secondary,
          border: `1px solid ${secondary}50`,
          marginBottom: 12,
        }}>
          {team.badge}
        </div>

        {/* Select buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={e => { e.stopPropagation(); onSelect('home'); }}
            style={{
              flex: 1, fontSize: 10, fontWeight: 800, letterSpacing: '.08em',
              padding: '8px 0', borderRadius: 8,
              background: role === 'home' ? C.blueBright : C.blueSub,
              border: `1px solid ${role === 'home' ? C.blueBright : C.borderFoc}`,
              color: role === 'home' ? '#fff' : C.blueBright,
              cursor: 'pointer', transition: 'all 140ms',
            }}
          >
            HOME
          </button>
          <button
            onClick={e => { e.stopPropagation(); onSelect('away'); }}
            style={{
              flex: 1, fontSize: 10, fontWeight: 800, letterSpacing: '.08em',
              padding: '8px 0', borderRadius: 8,
              background: role === 'away' ? C.red : C.redSub,
              border: `1px solid ${role === 'away' ? C.red : `${C.red}40`}`,
              color: role === 'away' ? '#fff' : C.red,
              cursor: 'pointer', transition: 'all 140ms',
            }}
          >
            AWAY
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── VS Matchup Bar ───────────────────────────────────────────────────────────

interface MatchupBarProps {
  homeTeam: HistoricalTeam | null;
  awayTeam: HistoricalTeam | null;
  onPlay: () => void;
}

function MatchupBar({ homeTeam, awayTeam, onPlay }: MatchupBarProps) {
  if (!homeTeam && !awayTeam) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'sticky', bottom: 0, zIndex: 50,
        background: `rgba(9,13,24,0.96)`, backdropFilter: 'blur(14px)',
        borderTop: `1px solid ${C.border}`,
        padding: '14px 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Home */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          {homeTeam ? (
            <>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.16em', color: C.blueBright, marginBottom: 2 }}>HOME</div>
              <div style={{ fontWeight: 800, color: C.txt }}>{homeTeam.city} {homeTeam.name}</div>
              <div style={{ fontSize: 11, color: C.txtSub }}>{homeTeam.era} · OFF {homeTeam.offenseRating} · DEF {homeTeam.defenseRating}</div>
            </>
          ) : (
            <div style={{ color: C.txtMuted, fontSize: 13 }}>Select home team</div>
          )}
        </div>

        {/* VS */}
        <div style={{ fontSize: 20, fontWeight: 900, color: C.border, flexShrink: 0 }}>VS</div>

        {/* Away */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          {awayTeam ? (
            <>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.16em', color: C.red, marginBottom: 2 }}>AWAY</div>
              <div style={{ fontWeight: 800, color: C.txt }}>{awayTeam.city} {awayTeam.name}</div>
              <div style={{ fontSize: 11, color: C.txtSub }}>{awayTeam.era} · OFF {awayTeam.offenseRating} · DEF {awayTeam.defenseRating}</div>
            </>
          ) : (
            <div style={{ color: C.txtMuted, fontSize: 13 }}>Select away team</div>
          )}
        </div>

        <button
          onClick={onPlay}
          disabled={!homeTeam || !awayTeam}
          style={{
            padding: '12px 28px', borderRadius: 10, fontWeight: 800, fontSize: 14,
            letterSpacing: '.06em', cursor: homeTeam && awayTeam ? 'pointer' : 'not-allowed',
            background: homeTeam && awayTeam
              ? `linear-gradient(135deg, ${C.green}, #00a844)`
              : C.border,
            color: homeTeam && awayTeam ? '#000' : C.txtMuted,
            border: 'none', transition: 'opacity 160ms',
            opacity: homeTeam && awayTeam ? 1 : 0.5,
            flexShrink: 0,
          }}
        >
          PLAY MATCHUP →
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function HistoricalErasPage() {
  const navigate = useNavigate();
  const [homeTeamId, setHomeTeamId] = useState<string | null>(null);
  const [awayTeamId, setAwayTeamId] = useState<string | null>(null);
  const [detailTeam, setDetailTeam] = useState<HistoricalTeam | null>(null);

  const homeTeam = HISTORICAL_TEAMS.find(t => t.id === homeTeamId) ?? null;
  const awayTeam = HISTORICAL_TEAMS.find(t => t.id === awayTeamId) ?? null;

  function handleSelect(teamId: string, role: 'home' | 'away') {
    if (role === 'home') {
      if (awayTeamId === teamId) setAwayTeamId(null);
      setHomeTeamId(teamId);
    } else {
      if (homeTeamId === teamId) setHomeTeamId(null);
      setAwayTeamId(teamId);
    }
  }

  function handlePlay() {
    if (!homeTeam || !awayTeam) return;
    navigate(`/game/play?home=${homeTeam.id}&away=${awayTeam.id}&league=historical`);
  }

  function teamRole(teamId: string): 'home' | 'away' | null {
    if (homeTeamId === teamId) return 'home';
    if (awayTeamId === teamId) return 'away';
    return null;
  }

  const sortedForRankings = [...HISTORICAL_TEAMS].sort(
    (a, b) => (b.offenseRating + b.defenseRating + b.speedRating) - (a.offenseRating + a.defenseRating + a.speedRating)
  );

  return (
    <AppShell backTo="/game" title="Historical Eras" maxWidth={1200} noPad>
      <div style={{ padding: '32px 24px 0' }}>
        {/* Hero */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', color: C.gold, marginBottom: 6 }}>
            LEGENDS OF THE GAME
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: C.txt, margin: 0, letterSpacing: '-.02em' }}>
            Historical Eras
          </h1>
          <p style={{ color: C.txtSub, fontSize: 14, marginTop: 6 }}>
            12 legendary teams. All playable. Step into football history.
          </p>
        </div>

        {/* Instructions strip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: C.panel, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: '10px 16px', marginBottom: 28, flexWrap: 'wrap',
        }}>
          <Badge color={C.blueBright}>1. Pick HOME</Badge>
          <span style={{ color: C.txtMuted, fontSize: 12 }}>then</span>
          <Badge color={C.red}>2. Pick AWAY</Badge>
          <span style={{ color: C.txtMuted, fontSize: 12 }}>then</span>
          <Badge color={C.green}>3. Play Matchup</Badge>
        </div>

        {/* Team Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16, marginBottom: 40,
        }}>
          {HISTORICAL_TEAMS.map(team => (
            <div
              key={team.id}
              onClick={() => setDetailTeam(team)}
            >
              <TeamCard
                team={team}
                selected={homeTeamId === team.id || awayTeamId === team.id}
                role={teamRole(team.id)}
                onSelect={(role) => handleSelect(team.id, role)}
              />
            </div>
          ))}
        </div>

        {/* All-time rankings table */}
        <div style={{ marginBottom: 40 }}>
          <SectionHead sub="Sorted by combined ratings">All-Time Rankings</SectionHead>
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 14, overflow: 'hidden',
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '40px 1fr 60px 60px 60px 70px',
              gap: 8, padding: '10px 16px',
              borderBottom: `1px solid ${C.border}`,
              fontSize: 9, fontWeight: 800, letterSpacing: '.14em', color: C.txtMuted,
            }}>
              <span>#</span>
              <span>TEAM</span>
              <span>OFF</span>
              <span>DEF</span>
              <span>SPD</span>
              <span>TOTAL</span>
            </div>
            {sortedForRankings.map((team, i) => {
              const isHome = homeTeamId === team.id;
              const isAway = awayTeamId === team.id;
              const total = team.offenseRating + team.defenseRating + team.speedRating;
              return (
                <div
                  key={team.id}
                  onClick={() => setDetailTeam(team)}
                  style={{
                    display: 'grid', gridTemplateColumns: '40px 1fr 60px 60px 60px 70px',
                    gap: 8, padding: '10px 16px',
                    borderBottom: `1px solid ${C.border}`,
                    cursor: 'pointer',
                    background: isHome ? `${C.blueBright}10` : isAway ? `${C.red}10` : i % 2 === 0 ? 'transparent' : `${C.border}20`,
                    transition: 'background 140ms',
                  }}
                  onMouseEnter={e => { if (!isHome && !isAway) (e.currentTarget as HTMLDivElement).style.background = C.panel; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isHome ? `${C.blueBright}10` : isAway ? `${C.red}10` : i % 2 === 0 ? 'transparent' : `${C.border}20`; }}
                >
                  <span style={{ color: C.txtMuted, fontWeight: 700, fontSize: 12 }}>{i + 1}</span>
                  <span style={{ color: C.txt, fontWeight: 700, fontSize: 13 }}>
                    {isHome && <span style={{ color: C.blueBright, marginRight: 6, fontSize: 10 }}>H</span>}
                    {isAway && <span style={{ color: C.red, marginRight: 6, fontSize: 10 }}>A</span>}
                    {team.era} {team.city.split(' ').slice(1).join(' ')}
                  </span>
                  <span style={{ color: ratingColor(team.offenseRating), fontWeight: 700, fontSize: 13 }}>{team.offenseRating}</span>
                  <span style={{ color: ratingColor(team.defenseRating), fontWeight: 700, fontSize: 13 }}>{team.defenseRating}</span>
                  <span style={{ color: ratingColor(team.speedRating), fontWeight: 700, fontSize: 13 }}>{team.speedRating}</span>
                  <span style={{ color: total >= 270 ? C.gold : C.txt, fontWeight: 800, fontSize: 13 }}>{total}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailTeam && (
          <motion.div
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
              padding: 24,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailTeam(null)}
          >
            <motion.div
              style={{
                width: '100%', maxWidth: 480,
                background: C.surface,
                border: `2px solid ${hexToCss(detailTeam.primaryColor)}`,
                borderRadius: 20, overflow: 'hidden',
                boxShadow: `0 0 60px -10px ${hexToCss(detailTeam.primaryColor)}60`,
              }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{
                height: 4,
                background: `linear-gradient(90deg, ${hexToCss(detailTeam.primaryColor)}, ${hexToCss(detailTeam.secondaryColor)})`,
              }} />
              <div style={{ padding: 28 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', color: hexToCss(detailTeam.secondaryColor), marginBottom: 4 }}>
                  {detailTeam.era} ERA
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: C.txt, margin: '0 0 4px' }}>
                  {detailTeam.city} {detailTeam.name}
                </h2>
                <p style={{ color: C.txtSub, fontSize: 13, margin: '0 0 20px' }}>{detailTeam.keyPlayers}</p>

                <div style={{ marginBottom: 20 }}>
                  <RatingBar label="OFFENSE" value={detailTeam.offenseRating} color={C.blueBright} />
                  <RatingBar label="DEFENSE" value={detailTeam.defenseRating} color={C.red} />
                  <RatingBar label="SPEED"   value={detailTeam.speedRating}   color={C.green} />
                </div>

                <p style={{ color: C.txt, fontSize: 14, lineHeight: 1.65, marginBottom: 16 }}>{detailTeam.historicalNote}</p>

                <div style={{
                  fontSize: 10, fontWeight: 800, letterSpacing: '.12em',
                  padding: '8px 14px', borderRadius: 8, textAlign: 'center',
                  background: `${hexToCss(detailTeam.secondaryColor)}18`,
                  color: hexToCss(detailTeam.secondaryColor),
                  border: `1px solid ${hexToCss(detailTeam.secondaryColor)}50`,
                  marginBottom: 20,
                }}>
                  {detailTeam.badge}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn
                    variant="secondary"
                    accent={C.blueBright}
                    onClick={() => { handleSelect(detailTeam.id, 'home'); setDetailTeam(null); }}
                    style={{ flex: 1 }}
                  >
                    Set as HOME
                  </Btn>
                  <Btn
                    variant="danger"
                    onClick={() => { handleSelect(detailTeam.id, 'away'); setDetailTeam(null); }}
                    style={{ flex: 1 }}
                  >
                    Set as AWAY
                  </Btn>
                  <button
                    onClick={() => setDetailTeam(null)}
                    style={{
                      padding: '12px 14px', borderRadius: 10,
                      background: C.panel, border: `1px solid ${C.border}`,
                      color: C.txtSub, cursor: 'pointer', fontSize: 14,
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky matchup bar */}
      <MatchupBar homeTeam={homeTeam} awayTeam={awayTeam} onPlay={handlePlay} />
    </AppShell>
  );
}
