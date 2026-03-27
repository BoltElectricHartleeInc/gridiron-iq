import { API_BASE } from '../../lib/api';
import { useState } from 'react';
import type { Prospect } from '../../types/draft';

interface Props {
  prospect: Prospect;
}

const POSITION_COLORS: Record<string, { bg: string; text: string }> = {
  QB:   { bg: 'rgba(185,28,28,0.2)',  text: '#fca5a5' },
  RB:   { bg: 'rgba(29,78,216,0.2)',  text: '#93c5fd' },
  WR:   { bg: 'rgba(21,128,61,0.2)',  text: '#86efac' },
  TE:   { bg: 'rgba(109,40,217,0.2)', text: '#c4b5fd' },
  OT:   { bg: 'rgba(161,98,7,0.2)',   text: '#fde68a' },
  OG:   { bg: 'rgba(161,98,7,0.2)',   text: '#fde68a' },
  C:    { bg: 'rgba(161,98,7,0.2)',   text: '#fde68a' },
  EDGE: { bg: 'rgba(194,65,12,0.2)',  text: '#fdba74' },
  DT:   { bg: 'rgba(194,65,12,0.2)',  text: '#fdba74' },
  LB:   { bg: 'rgba(15,118,110,0.2)', text: '#5eead4' },
  CB:   { bg: 'rgba(157,23,77,0.2)',  text: '#f9a8d4' },
  S:    { bg: 'rgba(157,23,77,0.2)',  text: '#f9a8d4' },
};

export function ProspectCard({ prospect }: Props) {
  const posColor = POSITION_COLORS[prospect.position] ?? { bg: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.6)' };

  const [scoutReport, setScoutReport] = useState<string>('');
  const [scoutLoading, setScoutLoading] = useState(false);
  const [scoutOpen, setScoutOpen] = useState(false);

  const handleScout = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Toggle off if already open
    if (scoutOpen && scoutReport) {
      setScoutOpen(false);
      return;
    }

    // Already fetched — just show
    if (scoutReport) {
      setScoutOpen(true);
      return;
    }

    setScoutLoading(true);
    setScoutOpen(true);

    try {
      const res = await fetch(API_BASE + '/api/scouting/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: prospect.name,
          position: prospect.position,
          college: prospect.college,
          grade: prospect.grade,
          traits: prospect.traits,
          description: prospect.description,
        }),
      });

      if (!res.ok || !res.body) {
        setScoutReport('Failed to load scouting report. Make sure the server is running.');
        setScoutLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setScoutReport(full);
      }
    } catch {
      setScoutReport('Failed to connect to server. Make sure the server is running on port 4000.');
    } finally {
      setScoutLoading(false);
    }
  };

  return (
    <div className="px-3 pb-3 space-y-2.5">
      {/* Bio row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-xs font-black px-2 py-0.5 rounded-full"
          style={{ background: posColor.bg, color: posColor.text, fontWeight: 700, letterSpacing: '0.05em' }}
        >
          {prospect.position}
        </span>
        <span className="text-white/30 text-xs">{prospect.height} · {prospect.weight} lbs</span>
        {prospect.fortyTime && (
          <span className="text-white/30 text-xs">{prospect.fortyTime}s 40</span>
        )}
        {prospect.comparableTo && (
          <span className="text-white/20 text-xs">Comp: {prospect.comparableTo}</span>
        )}
      </div>

      {/* Description */}
      <p className="text-white/50 text-xs leading-relaxed">{prospect.description}</p>

      {/* Traits */}
      <div className="flex flex-wrap gap-1">
        {prospect.traits.map(trait => (
          <span
            key={trait}
            className="text-xs px-1.5 py-0.5 rounded-md"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}
          >
            {trait}
          </span>
        ))}
      </div>

      {/* Strengths / Weaknesses */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-xs font-semibold text-green-400/70 mb-1">Strengths</div>
          {prospect.strengths.slice(0, 3).map(s => (
            <div key={s} className="text-xs text-white/40">+ {s}</div>
          ))}
        </div>
        <div>
          <div className="text-xs font-semibold text-red-400/70 mb-1">Weaknesses</div>
          {prospect.weaknesses.slice(0, 2).map(w => (
            <div key={w} className="text-xs text-white/40">− {w}</div>
          ))}
        </div>
      </div>

      {/* Scout Report button */}
      <button
        onClick={handleScout}
        className="w-full text-xs py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5"
        style={{
          background: scoutOpen ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
          border: scoutOpen ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)',
          color: scoutOpen ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
        }}
      >
        {scoutLoading ? (
          <>
            <span
              className="w-3 h-3 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin inline-block"
            />
            Generating Scout Report…
          </>
        ) : scoutOpen ? (
          '▲ Hide Scout Report'
        ) : (
          '🔍 Scout Report'
        )}
      </button>

      {/* Streaming scout report panel */}
      {scoutOpen && (
        <div
          className="rounded-xl p-3 text-xs leading-relaxed whitespace-pre-wrap"
          style={{
            background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.15)',
            color: 'rgba(255,255,255,0.65)',
          }}
        >
          {scoutLoading && !scoutReport ? (
            <span className="text-white/30">Analyzing prospect…</span>
          ) : (
            scoutReport
          )}
        </div>
      )}
    </div>
  );
}
