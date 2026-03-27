import { API_BASE } from '../../lib/api';
import { useState } from 'react';
import type { Prospect } from '../../types/draft';

// Local fallback — generates a realistic scouting report without the server
function generateLocalScoutReport(p: Prospect): string {
  const tier = p.grade >= 90 ? 'elite' : p.grade >= 82 ? 'high' : p.grade >= 74 ? 'solid' : 'developmental';
  const roundLabel = p.round === 1 ? 'first-round' : p.round === 2 ? 'second-round' : p.round <= 4 ? 'day-two' : 'day-three';
  const strengths = (p.strengths ?? []).slice(0, 3).join(', ') || 'athleticism and football IQ';
  const weaknesses = (p.weaknesses ?? []).slice(0, 2).join(' and ') || 'consistency in contested situations';

  const positionProfile: Record<string, string> = {
    QB: 'arm talent and pre-snap processing',
    RB: 'vision between the tackles and contact balance',
    WR: 'route precision and separation ability',
    TE: 'inline blocking versatility and seam-stretching',
    OT: 'pass-set footwork and anchor strength',
    OG: 'drive blocking power and pull efficiency',
    C: 'shotgun snapping reliability and line communication',
    EDGE: 'pass-rush repertoire and motor off the snap',
    DT: 'gap-penetration and two-gap control',
    LB: 'sideline-to-sideline range and blitz timing',
    CB: 'press technique and ball production',
    S: 'zone recognition and run-support angles',
    DE: 'edge setting and contain discipline',
    OLB: 'coverage versatility and rush upside',
  };
  const posKey = positionProfile[p.position] ?? 'athleticism and positional versatility';

  const para1 = `${p.name} is a ${tier}-level ${p.position} prospect out of ${p.college} with a ${p.grade} overall grade. His profile centers on ${posKey} — specifically his ability to ${strengths.toLowerCase()}. At ${p.height}, ${p.weight} lbs${p.fortyTime ? ` with a ${p.fortyTime}s 40` : ''}, he has the physical tools to compete immediately. ${p.comparableTo ? `Scouts have drawn comparisons to ${p.comparableTo}, a fair ceiling given the similar size-speed profile.` : ''}`;

  const para2 = `The concern on tape is ${weaknesses.toLowerCase()}. This isn't a disqualifier — it's a development point that a quality position coach can address — but teams in win-now mode should factor it in. He fits best in a scheme that prioritizes ${p.traits?.slice(0, 2).join(' and ')?.toLowerCase() ?? 'athleticism and effort'}, and his ability to contribute in year one is realistic if the situation is right.`;

  const para3 = `Draft recommendation: ${roundLabel} value projected in round ${p.round}. Teams that should prioritize him are those needing ${p.position} depth with an eye toward a starter within two years. If he falls past his projected slot, he becomes one of the better value picks in his class. Don't overthink it — ${p.name} is a football player.`;

  return [para1, para2, para3].join('\n\n');
}

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

  const fetchScoutReport = async () => {
    setScoutLoading(true);
    setScoutReport('');

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
        // Fallback: generate locally
        setScoutReport(generateLocalScoutReport(prospect));
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
      // Fallback: generate locally so the user always gets a report
      setScoutReport(generateLocalScoutReport(prospect));
    } finally {
      setScoutLoading(false);
    }
  };

  const handleScout = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Toggle off if already open and successful
    if (scoutOpen && scoutReport) {
      setScoutOpen(false);
      return;
    }

    setScoutOpen(true);

    // Already fetched successfully — just show
    if (scoutReport) return;

    await fetchScoutReport();
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
