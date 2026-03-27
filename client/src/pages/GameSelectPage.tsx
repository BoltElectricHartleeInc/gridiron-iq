import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { NFL_GAME_TEAMS, NCAA_GAME_TEAMS } from '../game/teams';
import type { GameTeam } from '../game/teams';

type League = 'nfl' | 'ncaa';

function hexStr(hex: number) { return `#${hex.toString(16).padStart(6, '0')}`; }

export function GameSelectPage() {
  const navigate = useNavigate();
  const [league, setLeague] = useState<League>('nfl');
  const [home, setHome] = useState<GameTeam | null>(null);
  const [away, setAway] = useState<GameTeam | null>(null);
  const [picking, setPicking] = useState<'home' | 'away'>('home');

  const teams = league === 'nfl' ? NFL_GAME_TEAMS : NCAA_GAME_TEAMS;
  const canPlay = home && away;

  const handleTeam = (team: GameTeam) => {
    if (picking === 'home') { setHome(team); setPicking('away'); }
    else { if (team.id === home?.id) return; setAway(team); }
  };

  return (
    <div className="min-h-screen bg-[#080810] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/3 w-72 h-72 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-green-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/game')}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all text-sm"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'Impact, sans-serif' }}>
              ARCADE FOOTBALL
            </h1>
            <p className="text-white/30 text-xs tracking-widest uppercase">Select League & Teams</p>
          </div>
        </div>

        {/* League toggle */}
        <div className="flex gap-1 mb-8 bg-white/5 border border-white/8 rounded-xl p-1 w-fit">
          {(['nfl', 'ncaa'] as League[]).map(l => (
            <button
              key={l}
              onClick={() => { setLeague(l); setHome(null); setAway(null); setPicking('home'); }}
              className={`relative px-8 py-2 rounded-lg font-black text-sm tracking-widest transition-all ${
                league === l ? 'text-white' : 'text-white/30 hover:text-white/60'
              }`}
              style={{ fontFamily: 'Impact, sans-serif' }}
            >
              {league === l && (
                <motion.div
                  layoutId="leagueTab"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: l === 'nfl' ? 'linear-gradient(135deg,#013369,#0a4a9a)' : 'linear-gradient(135deg,#5a0000,#8B0000)' }}
                />
              )}
              <span className="relative z-10">{l.toUpperCase()}</span>
            </button>
          ))}
        </div>

        {/* VS Display */}
        <div className="flex items-center gap-4 mb-8">
          <TeamSlot team={home} label="HOME" active={picking === 'home'} onClick={() => setPicking('home')} side="left" />
          <div className="flex flex-col items-center gap-1">
            <div className="text-white/20 text-2xl font-black" style={{ fontFamily: 'Impact, sans-serif' }}>VS</div>
            {canPlay && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs text-green-400/60 uppercase tracking-wider"
              >
                Ready
              </motion.div>
            )}
          </div>
          <TeamSlot team={away} label="AWAY" active={picking === 'away'} onClick={() => setPicking('away')} side="right" />
        </div>

        {/* Select prompt */}
        <p className="text-white/20 text-xs uppercase tracking-[0.3em] mb-4">
          {picking === 'home' ? '← Select Home Team' : '← Select Away Team'}
        </p>

        {/* Team grid */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {teams.map(team => {
            const isHome = home?.id === team.id;
            const isAway = away?.id === team.id;
            const disabled = picking === 'away' && isHome;
            return (
              <motion.button
                key={team.id}
                whileHover={!disabled ? { scale: 1.04 } : {}}
                whileTap={!disabled ? { scale: 0.96 } : {}}
                onClick={() => !disabled && handleTeam(team)}
                className={`relative p-3 rounded-xl border transition-all text-left overflow-hidden ${
                  isHome ? 'border-blue-500/60' :
                  isAway ? 'border-red-500/60' :
                  'border-white/5 hover:border-white/15'
                } ${disabled ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{
                  background: isHome
                    ? `linear-gradient(135deg, ${hexStr(team.primaryColor)}22, #050515)`
                    : isAway
                    ? `linear-gradient(135deg, ${hexStr(team.primaryColor)}22, #150505)`
                    : '#0d0d1a',
                }}
              >
                {/* Subtle color wash */}
                {(isHome || isAway) && (
                  <div
                    className="absolute inset-0 opacity-10 rounded-xl"
                    style={{ background: hexStr(team.primaryColor) }}
                  />
                )}

                <div className="relative flex flex-col items-center gap-1.5">
                  {/* Team helmet circle */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-xs shadow-lg"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${hexStr(team.primaryColor)}ff, ${hexStr(team.primaryColor)}99)`,
                      boxShadow: `0 0 20px ${hexStr(team.primaryColor)}44`,
                    }}
                  >
                    {team.abbreviation.slice(0, 3)}
                  </div>

                  <div className="text-center">
                    <div className="text-white text-xs font-semibold leading-tight">{team.city}</div>
                    <div className="text-white/40 text-xs leading-tight">{team.name}</div>
                  </div>

                  {(isHome || isAway) && (
                    <div
                      className={`text-xs font-black tracking-widest px-2 py-0.5 rounded-full ${
                        isHome ? 'text-blue-400 bg-blue-400/10' : 'text-red-400 bg-red-400/10'
                      }`}
                      style={{ fontFamily: 'Impact, sans-serif', fontSize: '9px' }}
                    >
                      {isHome ? 'HOME' : 'AWAY'}
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Ratings bar */}
        <AnimatePresence>
          {canPlay && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white/3 border border-white/8 rounded-xl p-4 mb-4"
            >
              <div className="grid grid-cols-3 gap-y-2 text-center text-sm">
                {[
                  ['Offense', home!.offenseRating, away!.offenseRating],
                  ['Defense', home!.defenseRating, away!.defenseRating],
                  ['Speed', home!.speedRating, away!.speedRating],
                ].map(([label, h, a]) => (
                  <>
                    <div key={`h-${label}`} className="font-black text-blue-400" style={{ fontFamily: 'Impact, sans-serif' }}>{h}</div>
                    <div key={`l-${label}`} className="text-white/25 text-xs uppercase tracking-wider self-center">{label}</div>
                    <div key={`a-${label}`} className="font-black text-red-400" style={{ fontFamily: 'Impact, sans-serif' }}>{a}</div>
                  </>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kickoff button */}
        <motion.button
          whileHover={canPlay ? { scale: 1.02 } : {}}
          whileTap={canPlay ? { scale: 0.98 } : {}}
          onClick={() => canPlay && navigate(`/game/play?home=${home!.id}&away=${away!.id}&league=${league}`)}
          disabled={!canPlay}
          className="w-full py-4 rounded-xl font-black text-lg tracking-widest transition-all relative overflow-hidden"
          style={{
            fontFamily: 'Impact, Arial Narrow, sans-serif',
            background: canPlay
              ? 'linear-gradient(135deg, #1a4a1a, #2d7a2d)'
              : '#0d0d1a',
            color: canPlay ? '#ffffff' : '#333355',
            border: canPlay ? '1px solid rgba(45,122,45,0.5)' : '1px solid rgba(255,255,255,0.05)',
            boxShadow: canPlay ? '0 0 40px rgba(45,150,45,0.25)' : 'none',
          }}
        >
          {canPlay
            ? `KICKOFF — ${home!.abbreviation} vs ${away!.abbreviation}`
            : 'SELECT BOTH TEAMS TO PLAY'}
        </motion.button>
      </div>
    </div>
  );
}

function TeamSlot({ team, label, active, onClick, side }: {
  team: GameTeam | null; label: string; active: boolean; onClick: () => void; side: 'left' | 'right';
}) {
  function hexStr(hex: number) { return `#${hex.toString(16).padStart(6, '0')}`; }
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      className={`flex-1 rounded-2xl border p-4 text-center transition-all relative overflow-hidden ${
        active ? 'border-white/30' : 'border-white/8'
      }`}
      style={{ background: team ? `linear-gradient(135deg, ${hexStr(team.primaryColor)}18, #0a0a18)` : '#0a0a18' }}
    >
      {team && (
        <div
          className="absolute inset-0 opacity-5"
          style={{ background: hexStr(team.primaryColor) }}
        />
      )}
      <div className="relative">
        <div className="text-white/25 text-xs tracking-widest uppercase mb-2">{label}</div>
        {team ? (
          <>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center font-black text-white mx-auto mb-2 text-sm"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${hexStr(team.primaryColor)}, ${hexStr(team.primaryColor)}88)`,
                boxShadow: `0 0 30px ${hexStr(team.primaryColor)}55`,
              }}
            >
              {team.abbreviation.slice(0, 3)}
            </div>
            <div className="text-white font-semibold text-sm">{team.city}</div>
            <div className="text-white/40 text-xs">{team.name}</div>
          </>
        ) : (
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/10 mx-auto flex items-center justify-center text-white/15 text-2xl">
            ?
          </div>
        )}
      </div>
    </motion.button>
  );
}
