import { motion } from 'framer-motion';
import type { Prospect } from '../../types/draft';
import { useDraftStore } from '../../store/draftStore';

interface Props {
  prospects: [Prospect, Prospect];
  onClose: () => void;
  onDraft?: (prospectId: string) => void;
  canDraft: boolean;
}

function better(a: number | undefined, b: number | undefined, lowerBetter = false): 'a' | 'b' | 'tie' {
  if (a === undefined && b === undefined) return 'tie';
  if (a === undefined) return 'b';
  if (b === undefined) return 'a';
  if (a === b) return 'tie';
  if (lowerBetter) return a < b ? 'a' : 'b';
  return a > b ? 'a' : 'b';
}

function StatRow({ label, valueA, valueB, lowerBetter: lb = false }: {
  label: string;
  valueA: string | number | undefined;
  valueB: string | number | undefined;
  lowerBetter?: boolean;
}) {
  const numA = typeof valueA === 'number' ? valueA : parseFloat(String(valueA ?? ''));
  const numB = typeof valueB === 'number' ? valueB : parseFloat(String(valueB ?? ''));
  const winner = better(isNaN(numA) ? undefined : numA, isNaN(numB) ? undefined : numB, lb);

  return (
    <div className="flex items-center py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div
        className="flex-1 text-right text-sm font-semibold pr-3"
        style={{ color: winner === 'a' ? '#4ade80' : 'rgba(255,255,255,0.6)' }}
      >
        {valueA ?? '—'}
      </div>
      <div className="w-24 text-center text-xs text-white/30 font-semibold uppercase tracking-wider">
        {label}
      </div>
      <div
        className="flex-1 text-left text-sm font-semibold pl-3"
        style={{ color: winner === 'b' ? '#4ade80' : 'rgba(255,255,255,0.6)' }}
      >
        {valueB ?? '—'}
      </div>
    </div>
  );
}

export function ProspectCompare({ prospects, onClose, onDraft, canDraft }: Props) {
  const [a, b] = prospects;
  const clearCompare = useDraftStore(s => s.clearCompare);

  const traitsA = new Set(a.traits);
  const traitsB = new Set(b.traits);
  const shared = a.traits.filter(t => traitsB.has(t));
  const uniqueA = a.traits.filter(t => !traitsB.has(t));
  const uniqueB = b.traits.filter(t => !traitsA.has(t));

  const handleDraft = (id: string) => {
    if (onDraft) onDraft(id);
    clearCompare();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-[700px] max-h-[85vh] overflow-y-auto rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, #111128 0%, #0a0a18 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 0 60px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-lg font-black text-white tracking-tight" style={{ fontWeight: 700 }}>
            PROSPECT COMPARISON
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors text-xs"
          >
            &#10005;
          </button>
        </div>

        {/* Names */}
        <div className="flex px-5 pb-4">
          <div className="flex-1 text-right pr-3">
            <div className="text-white font-bold text-lg">{a.name}</div>
            <div className="text-white/40 text-sm">{a.position} | {a.college}</div>
          </div>
          <div className="w-24 flex items-center justify-center">
            <span className="text-white/15 font-black text-xl" style={{ fontWeight: 700 }}>VS</span>
          </div>
          <div className="flex-1 text-left pl-3">
            <div className="text-white font-bold text-lg">{b.name}</div>
            <div className="text-white/40 text-sm">{b.position} | {b.college}</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-5 pb-4">
          <StatRow label="Grade" valueA={a.grade} valueB={b.grade} />
          <StatRow label="Height" valueA={a.height} valueB={b.height} />
          <StatRow label="Weight" valueA={a.weight} valueB={b.weight} />
          <StatRow label="40-Time" valueA={a.fortyTime} valueB={b.fortyTime} lowerBetter />
          <StatRow label="Proj. Rd" valueA={a.round} valueB={b.round} lowerBetter />
        </div>

        {/* Traits */}
        <div className="px-5 pb-4">
          <div className="text-xs font-black text-white/25 uppercase tracking-widest mb-2" style={{ fontWeight: 700 }}>
            Traits
          </div>
          {shared.length > 0 && (
            <div className="mb-2">
              <span className="text-xs text-white/25 mr-2">Shared:</span>
              {shared.map(t => (
                <span key={t} className="text-xs px-1.5 py-0.5 rounded-md mr-1" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-4">
            <div className="flex-1 text-right">
              {uniqueA.map(t => (
                <span key={t} className="text-xs px-1.5 py-0.5 rounded-md mr-1 inline-block mb-1" style={{ background: 'rgba(34,197,94,0.1)', color: '#86efac' }}>
                  {t}
                </span>
              ))}
            </div>
            <div className="w-24" />
            <div className="flex-1 text-left">
              {uniqueB.map(t => (
                <span key={t} className="text-xs px-1.5 py-0.5 rounded-md mr-1 inline-block mb-1" style={{ background: 'rgba(234,179,8,0.1)', color: '#fde68a' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Strengths / Weaknesses */}
        <div className="px-5 pb-4">
          <div className="text-xs font-black text-white/25 uppercase tracking-widest mb-2" style={{ fontWeight: 700 }}>
            Strengths & Weaknesses
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-xs text-green-400/70 font-semibold mb-1 text-right">Strengths</div>
              {a.strengths.map(s => (
                <div key={s} className="text-xs text-white/40 text-right mb-0.5">+ {s}</div>
              ))}
              <div className="text-xs text-red-400/70 font-semibold mb-1 mt-2 text-right">Weaknesses</div>
              {a.weaknesses.map(w => (
                <div key={w} className="text-xs text-white/40 text-right mb-0.5">- {w}</div>
              ))}
            </div>
            <div className="w-24" />
            <div className="flex-1">
              <div className="text-xs text-green-400/70 font-semibold mb-1">Strengths</div>
              {b.strengths.map(s => (
                <div key={s} className="text-xs text-white/40 mb-0.5">+ {s}</div>
              ))}
              <div className="text-xs text-red-400/70 font-semibold mb-1 mt-2">Weaknesses</div>
              {b.weaknesses.map(w => (
                <div key={w} className="text-xs text-white/40 mb-0.5">- {w}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Draft Buttons */}
        {canDraft && (
          <div className="flex gap-3 px-5 pb-5">
            <button
              onClick={() => handleDraft(a.id)}
              className="flex-1 font-black py-2.5 rounded-xl text-sm tracking-widest transition-all"
              style={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                color: '#fff',
                boxShadow: '0 0 16px rgba(37,99,235,0.3)',
              }}
            >
              DRAFT {a.name.split(' ').pop()?.toUpperCase()}
            </button>
            <button
              onClick={() => handleDraft(b.id)}
              className="flex-1 font-black py-2.5 rounded-xl text-sm tracking-widest transition-all"
              style={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                color: '#fff',
                boxShadow: '0 0 16px rgba(37,99,235,0.3)',
              }}
            >
              DRAFT {b.name.split(' ').pop()?.toUpperCase()}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
