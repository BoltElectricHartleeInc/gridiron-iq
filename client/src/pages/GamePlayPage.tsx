import { API_BASE } from '../lib/api';
import { useEffect, useRef, useState } from 'react';
import { GameController } from '../components/game/GameController';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { NFL_GAME_TEAMS, NCAA_GAME_TEAMS } from '../game/teams';
import type { GameOverData } from '../game/FootballGame';

export function GamePlayPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);

  const homeId = params.get('home') ?? '';
  const awayId = params.get('away') ?? '';
  const league = (params.get('league') ?? 'nfl') as 'nfl' | 'ncaa';

  const allTeams = [...NFL_GAME_TEAMS, ...NCAA_GAME_TEAMS];
  const homeTeam = allTeams.find(t => t.id === homeId);
  const awayTeam = allTeams.find(t => t.id === awayId);

  const [gameOver, setGameOver] = useState<GameOverData | null>(null);
  const [savedResult, setSavedResult] = useState(false);

  useEffect(() => {
    if (!homeTeam || !awayTeam || !containerRef.current) return;

    // Lazy-load Phaser to avoid SSR issues and keep initial bundle small
    let destroyed = false;
    import('../game/FootballGame').then(({ createFootballGame }) => {
      if (destroyed || !containerRef.current) return;
      gameRef.current = createFootballGame(
        containerRef.current,
        homeTeam,
        awayTeam,
        league,
        (path) => navigate(path),
        (data) => setGameOver(data),
      );
    });

    return () => {
      destroyed = true;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // Auto-save game result to DB when game ends
  useEffect(() => {
    if (!gameOver || savedResult) return;

    setSavedResult(true);
    fetch(API_BASE + '/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        homeTeamId: gameOver.homeTeamId,
        homeTeamName: gameOver.homeTeamName,
        homeScore: gameOver.homeScore,
        awayTeamId: gameOver.awayTeamId,
        awayTeamName: gameOver.awayTeamName,
        awayScore: gameOver.awayScore,
        league: gameOver.league.toUpperCase(),
      }),
    }).catch(() => {
      // Server may not be running — silently ignore
    });
  }, [gameOver, savedResult]);

  if (!homeTeam || !awayTeam) {
    navigate('/game/select');
    return null;
  }

  const winnerColor = gameOver ? `#${gameOver.winnerColor.toString(16).padStart(6, '0')}` : '#ffffff';

  return (
    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden">
      {/* Thin nav bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <button onClick={() => navigate('/game/select')} className="text-gray-500 hover:text-white text-sm">
          ← Change Teams
        </button>
        <div className="text-white font-black text-sm" style={{ fontFamily: 'Impact, sans-serif' }}>
          GRIDIRON<span style={{ color: '#d97706' }}>IQ</span>
          <span className="text-gray-600 font-normal ml-2">Arcade Football</span>
        </div>
        <div
          className="text-xs px-2 py-1 rounded font-bold"
          style={{ backgroundColor: league === 'nfl' ? '#013369' : '#8B0000', color: '#fff' }}
        >
          {league.toUpperCase()}
        </div>
      </div>

      {/* Phaser canvas + controller overlay */}
      <div className="flex-1 w-full relative" style={{ minHeight: 0 }}>
        <div ref={containerRef} className="absolute inset-0" />
        <GameController />
      </div>

      {/* React Game Over Overlay */}
      {gameOver && (
        <div
          className="absolute inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="rounded-2xl p-8 w-full max-w-sm mx-4 text-center"
            style={{
              background: '#0a0a18',
              border: `2px solid ${winnerColor}66`,
              boxShadow: `0 0 60px ${winnerColor}33`,
            }}
          >
            <div className="text-white/40 text-xs uppercase tracking-widest mb-2">Final Score</div>

            {/* Winner */}
            <div
              className="text-3xl font-black mb-1"
              style={{ fontFamily: 'Impact, sans-serif', color: winnerColor }}
            >
              {gameOver.winnerName.toUpperCase()} WIN
            </div>

            {/* Score */}
            <div className="text-white text-5xl font-black mb-1" style={{ fontFamily: 'Impact, sans-serif' }}>
              {gameOver.homeScore} — {gameOver.awayScore}
            </div>
            <div className="text-white/40 text-sm mb-6">
              {gameOver.homeTeamName} vs {gameOver.awayTeamName}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setGameOver(null);
                  setSavedResult(false);
                  navigate(`/game/play?home=${homeId}&away=${awayId}&league=${league}`);
                  // Reload forces Phaser to re-init
                  window.location.reload();
                }}
                className="flex-1 py-3 rounded-xl font-black text-sm tracking-widest transition-all"
                style={{
                  fontFamily: 'Impact, sans-serif',
                  background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                  color: '#fff',
                  boxShadow: '0 0 20px rgba(37,99,235,0.4)',
                }}
              >
                PLAY AGAIN
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3 rounded-xl font-black text-sm tracking-widest transition-all"
                style={{
                  fontFamily: 'Impact, sans-serif',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                GO HOME
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
