import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { GameTeam } from '../game/teams';

// ─── Historical Team Interface ────────────────────────────────────────────────

interface HistoricalTeam extends GameTeam {
  era: string;                  // e.g. "1985"
  keyPlayers: string;           // e.g. "Walter Payton · Jim McMahon"
  badge: string;                // e.g. "SUPER BOWL XX CHAMPIONS"
  historicalNote: string;       // 1-2 sentence blurb
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

// ─── Rating Bar ───────────────────────────────────────────────────────────────

function RatingBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-1">
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-gray-500">{label}</span>
        <span className="font-bold text-white">{value}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-gray-800">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
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

function hexToCss(hex: number): string {
  return `#${hex.toString(16).padStart(6, '0')}`;
}

function TeamCard({ team, selected, role, onSelect }: TeamCardProps) {
  const primary = hexToCss(team.primaryColor);
  const secondary = hexToCss(team.secondaryColor);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
        role === 'home'
          ? 'border-blue-500 ring-2 ring-blue-500/30'
          : role === 'away'
          ? 'border-red-500 ring-2 ring-red-500/30'
          : selected
          ? 'border-gray-500'
          : 'border-gray-800 hover:border-gray-600'
      }`}
      style={{
        background: `linear-gradient(135deg, ${primary}22 0%, #111827 60%)`,
        boxShadow: role ? `0 0 20px ${role === 'home' ? '#3b82f688' : '#ef444488'}` : undefined,
      }}
    >
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }}
      />

      {/* Role badge */}
      {role && (
        <div className={`absolute top-3 right-3 text-xs font-black px-2 py-0.5 rounded-full ${
          role === 'home' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {role.toUpperCase()}
        </div>
      )}

      <div className="p-4 pt-5">
        {/* Header */}
        <div className="mb-3">
          <div
            className="text-xs font-bold tracking-widest mb-0.5"
            style={{ color: secondary }}
          >
            {team.era}
          </div>
          <div className="text-lg font-black text-white leading-tight">
            {team.city.split(' ').slice(1).join(' ')} {team.name}
          </div>
          <div className="text-xs text-gray-400">{team.keyPlayers}</div>
        </div>

        {/* Rating bars */}
        <div className="mb-3">
          <RatingBar label="OFF" value={team.offenseRating} color="#3b82f6" />
          <RatingBar label="DEF" value={team.defenseRating} color="#ef4444" />
          <RatingBar label="SPD" value={team.speedRating}   color="#22c55e" />
        </div>

        {/* Historical note */}
        <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
          {team.historicalNote}
        </p>

        {/* Badge */}
        <div
          className="text-xs font-black tracking-wider px-2 py-1 rounded text-center"
          style={{ background: `${secondary}22`, color: secondary, borderColor: secondary, border: '1px solid' }}
        >
          🏆 {team.badge}
        </div>

        {/* Select buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={e => { e.stopPropagation(); onSelect('home'); }}
            className={`flex-1 text-xs py-1.5 rounded-lg font-bold transition ${
              role === 'home'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-blue-900 hover:text-blue-300'
            }`}
          >
            HOME
          </button>
          <button
            onClick={e => { e.stopPropagation(); onSelect('away'); }}
            className={`flex-1 text-xs py-1.5 rounded-lg font-bold transition ${
              role === 'away'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-red-900 hover:text-red-300'
            }`}
          >
            AWAY
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── VS Matchup Panel ─────────────────────────────────────────────────────────

interface MatchupPanelProps {
  homeTeam: HistoricalTeam | null;
  awayTeam: HistoricalTeam | null;
  onPlay: () => void;
}

function MatchupPanel({ homeTeam, awayTeam, onPlay }: MatchupPanelProps) {
  if (!homeTeam && !awayTeam) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 px-6 py-4"
    >
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        {/* Home */}
        <div className="flex-1 text-center">
          {homeTeam ? (
            <div>
              <div className="text-xs text-blue-400 uppercase tracking-widest mb-0.5">Home</div>
              <div className="font-black text-white">{homeTeam.city} {homeTeam.name}</div>
              <div className="text-xs text-gray-500">{homeTeam.era} · OFF {homeTeam.offenseRating} · DEF {homeTeam.defenseRating}</div>
            </div>
          ) : (
            <div className="text-gray-600 text-sm">Select home team</div>
          )}
        </div>

        {/* VS */}
        <div className="text-2xl font-black text-gray-600">VS</div>

        {/* Away */}
        <div className="flex-1 text-center">
          {awayTeam ? (
            <div>
              <div className="text-xs text-red-400 uppercase tracking-widest mb-0.5">Away</div>
              <div className="font-black text-white">{awayTeam.city} {awayTeam.name}</div>
              <div className="text-xs text-gray-500">{awayTeam.era} · OFF {awayTeam.offenseRating} · DEF {awayTeam.defenseRating}</div>
            </div>
          ) : (
            <div className="text-gray-600 text-sm">Select away team</div>
          )}
        </div>

        {/* Play button */}
        <motion.button
          onClick={onPlay}
          disabled={!homeTeam || !awayTeam}
          whileTap={{ scale: 0.97 }}
          className={`px-6 py-3 rounded-xl font-black tracking-wider text-sm transition whitespace-nowrap ${
            homeTeam && awayTeam
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          PLAY THIS MATCHUP →
        </motion.button>
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
      // If this team was already away, clear away
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

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-28">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-black tracking-widest mb-1">HISTORICAL ERAS</h1>
          <p className="text-gray-400 text-sm">Step into football history. 12 legendary teams, all playable.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Instructions strip */}
        <div className="flex items-center gap-3 mb-6 text-sm text-gray-500 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
          <span className="text-blue-400 font-bold">1.</span> Select a <span className="text-blue-400 font-semibold">HOME</span> team
          <span className="text-gray-700 mx-1">|</span>
          <span className="text-red-400 font-bold">2.</span> Select an <span className="text-red-400 font-semibold">AWAY</span> team
          <span className="text-gray-700 mx-1">|</span>
          <span className="text-green-400 font-bold">3.</span> Click <span className="text-green-400 font-semibold">PLAY THIS MATCHUP</span>
        </div>

        {/* Team Cards Grid — 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HISTORICAL_TEAMS.map(team => (
            <TeamCard
              key={team.id}
              team={team}
              selected={homeTeamId === team.id || awayTeamId === team.id}
              role={teamRole(team.id)}
              onSelect={(role) => handleSelect(team.id, role)}
            />
          ))}
        </div>

        {/* Era comparison section */}
        <div className="mt-10">
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4">All-Time Rankings by Rating</h2>
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="grid grid-cols-5 text-xs text-gray-500 uppercase tracking-wider px-4 py-2 border-b border-gray-800">
              <span>#</span>
              <span>Team</span>
              <span>OFF</span>
              <span>DEF</span>
              <span>SPD</span>
            </div>
            {[...HISTORICAL_TEAMS]
              .sort((a, b) => (b.offenseRating + b.defenseRating + b.speedRating) - (a.offenseRating + a.defenseRating + a.speedRating))
              .map((team, i) => {
                const isHome = homeTeamId === team.id;
                const isAway = awayTeamId === team.id;
                return (
                  <div
                    key={team.id}
                    onClick={() => setDetailTeam(team)}
                    className={`grid grid-cols-5 text-sm px-4 py-2 cursor-pointer transition-colors ${
                      isHome ? 'bg-blue-950/40' : isAway ? 'bg-red-950/40' : i % 2 === 0 ? 'bg-gray-800/30 hover:bg-gray-800/60' : 'hover:bg-gray-800/40'
                    }`}
                  >
                    <span className="text-gray-600 font-mono">{i + 1}</span>
                    <span className="text-white font-bold">
                      {isHome && <span className="text-blue-400 mr-1">H</span>}
                      {isAway && <span className="text-red-400 mr-1">A</span>}
                      {team.era} {team.city.split(' ').slice(1).join(' ')}
                    </span>
                    <span className={`font-bold ${team.offenseRating >= 95 ? 'text-yellow-400' : team.offenseRating >= 90 ? 'text-green-400' : 'text-white'}`}>
                      {team.offenseRating}
                    </span>
                    <span className={`font-bold ${team.defenseRating >= 95 ? 'text-yellow-400' : team.defenseRating >= 90 ? 'text-green-400' : 'text-white'}`}>
                      {team.defenseRating}
                    </span>
                    <span className={`font-bold ${team.speedRating >= 95 ? 'text-yellow-400' : team.speedRating >= 90 ? 'text-green-400' : 'text-white'}`}>
                      {team.speedRating}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        <button
          onClick={() => navigate('/game')}
          className="mt-6 text-xs text-gray-600 hover:text-gray-400 transition"
        >
          ← Back to Game Modes
        </button>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailTeam && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailTeam(null)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl bg-gray-900 border-2 overflow-hidden"
              style={{ borderColor: hexToCss(detailTeam.primaryColor) }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div
                className="h-2"
                style={{ background: `linear-gradient(to right, ${hexToCss(detailTeam.primaryColor)}, ${hexToCss(detailTeam.secondaryColor)})` }}
              />
              <div className="p-6">
                <div
                  className="text-xs font-bold tracking-widest mb-1"
                  style={{ color: hexToCss(detailTeam.secondaryColor) }}
                >
                  {detailTeam.era} ERA
                </div>
                <h2 className="text-2xl font-black mb-1">{detailTeam.city} {detailTeam.name}</h2>
                <p className="text-gray-400 text-sm mb-4">{detailTeam.keyPlayers}</p>

                <div className="mb-4">
                  <RatingBar label="Offense" value={detailTeam.offenseRating} color="#3b82f6" />
                  <RatingBar label="Defense" value={detailTeam.defenseRating} color="#ef4444" />
                  <RatingBar label="Speed"   value={detailTeam.speedRating}   color="#22c55e" />
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-4">{detailTeam.historicalNote}</p>

                <div
                  className="text-xs font-black tracking-wider px-3 py-2 rounded text-center mb-4"
                  style={{
                    background: `${hexToCss(detailTeam.secondaryColor)}22`,
                    color: hexToCss(detailTeam.secondaryColor),
                    border: `1px solid ${hexToCss(detailTeam.secondaryColor)}`,
                  }}
                >
                  🏆 {detailTeam.badge}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { handleSelect(detailTeam.id, 'home'); setDetailTeam(null); }}
                    className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition"
                  >
                    Set as HOME
                  </button>
                  <button
                    onClick={() => { handleSelect(detailTeam.id, 'away'); setDetailTeam(null); }}
                    className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition"
                  >
                    Set as AWAY
                  </button>
                  <button
                    onClick={() => setDetailTeam(null)}
                    className="py-2 px-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky matchup panel */}
      <MatchupPanel homeTeam={homeTeam} awayTeam={awayTeam} onPlay={handlePlay} />
    </div>
  );
}
