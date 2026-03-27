import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TEAMS_BY_DRAFT_ORDER, getTeamR1Pick } from '../data/teams';
import { useDraftStore } from '../store/draftStore';
import type { NFLTeam } from '../types/draft';

const S = {
  bg:       '#0b0f18',
  surface:  '#0f1623',
  elevated: '#141d2e',
  border:   '#1c2d40',
  borderHi: '#253352',
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

const ROUND_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const YEAR_OPTIONS = [
  { year: 2026, label: '2026', count: 480 },
  { year: 2027, label: '2027', count: 279 },
];
const SPEED_LABELS = [
  { label: 'Methodical', value: 2000 },
  { label: 'Standard', value: 800 },
  { label: 'War Speed', value: 100 },
];

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: S.txtMuted, marginBottom: 8 }}>{children}</div>;
}

function Divider() {
  return <div style={{ height: 1, background: S.border, margin: '16px 0' }} />;
}

export function TeamSelectPage() {
  const navigate = useNavigate();
  const { startDraft, setDraftSettings, rounds, simSpeed, needsWeight, positionWeight, commissionerMode, aiAdvisorEnabled, draftYear } = useDraftStore();
  const [selected, setSelected] = useState<NFLTeam | null>(null);
  const [search, setSearch] = useState('');

  const handleStart = () => {
    if (!selected && !commissionerMode) return;
    const teamId = selected?.id ?? TEAMS_BY_DRAFT_ORDER[0].id;
    startDraft(teamId);
    navigate('/draft/pregame');
  };

  const speedIndex = SPEED_LABELS.findIndex(s => s.value === simSpeed);
  const filteredTeams = TEAMS_BY_DRAFT_ORDER.filter(t =>
    !search || t.city.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase()) || t.abbreviation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: S.bg, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── LEFT: TEAM GRID ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${S.border}`, background: S.surface, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate('/')}
            style={{ width: 30, height: 30, borderRadius: 6, background: S.elevated, border: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: S.txtSub, fontSize: 13, flexShrink: 0 }}
          >←</button>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: S.txt, letterSpacing: '-0.02em' }}>
              Gridiron<span style={{ color: S.gold }}>IQ</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: S.txtMuted, marginLeft: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {draftYear} NFL Draft Setup
              </span>
            </div>
            <div style={{ fontSize: 11, color: S.txtSub, marginTop: 2 }}>
              Select your franchise to begin the {draftYear} mock draft
            </div>
          </div>

          {/* Commissioner mode */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setDraftSettings({ commissionerMode: !commissionerMode })}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 6, background: commissionerMode ? S.goldSub : S.elevated, border: `1px solid ${commissionerMode ? 'rgba(196,154,26,0.35)' : S.border}`, cursor: 'pointer', color: commissionerMode ? S.gold : S.txtSub, fontSize: 11, fontWeight: 600 }}
            >
              <div style={{ width: 28, height: 14, borderRadius: 7, background: commissionerMode ? 'rgba(196,154,26,0.4)' : S.border, position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: commissionerMode ? S.gold : S.txtMuted, position: 'absolute', top: 2, left: commissionerMode ? 16 : 2, transition: 'left 0.15s' }} />
              </div>
              Commissioner Mode
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '10px 16px', borderBottom: `1px solid ${S.border}` }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search team, city, or abbreviation…"
            style={{ width: '100%', background: S.elevated, border: `1px solid ${S.border}`, borderRadius: 6, padding: '7px 12px', fontSize: 12, color: S.txt, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Team grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {filteredTeams.map(team => {
              const isSelected = selected?.id === team.id;
              return (
                <motion.div
                  key={team.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelected(isSelected ? null : team)}
                  style={{
                    borderRadius: 8,
                    padding: '10px',
                    cursor: 'pointer',
                    background: isSelected ? `linear-gradient(135deg, ${team.primaryColor}14, ${S.surface})` : S.elevated,
                    border: `1px solid ${isSelected ? team.primaryColor + '55' : S.border}`,
                    boxShadow: isSelected ? `0 0 16px ${team.primaryColor}22` : 'none',
                    transition: 'all 0.12s',
                    position: 'relative',
                  }}
                >
                  {isSelected && (
                    <div style={{ position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: '50%', background: team.primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: 9, fontWeight: 900 }}>✓</span>
                    </div>
                  )}

                  {/* Pick number + team color bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                    <div style={{ width: 3, height: 24, borderRadius: 2, background: team.primaryColor, flexShrink: 0, opacity: isSelected ? 1 : 0.5 }} />
                    <span style={{ fontSize: 18, fontWeight: 800, color: isSelected ? team.primaryColor : S.txtSub, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                      {getTeamR1Pick(team.id) || '—'}
                    </span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? S.txt : S.txtSub }}>{team.abbreviation}</div>
                      <div style={{ fontSize: 9, color: S.txtMuted }}>{team.conference} {team.division}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 500, color: S.txt, marginBottom: 6 }}>{team.city} {team.name}</div>

                  {/* Needs */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {team.needs.slice(0, 3).map((n, i) => (
                      <span key={n} style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: i === 0 && isSelected ? `${team.primaryColor}22` : S.surface, border: `1px solid ${i === 0 && isSelected ? team.primaryColor + '44' : S.border}`, color: i === 0 && isSelected ? team.primaryColor : S.txtMuted, fontWeight: 600 }}>
                        {n}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RIGHT: SETTINGS PANEL ────────────────────────────────────────── */}
      <div style={{ width: 300, display: 'flex', flexDirection: 'column', background: S.surface, borderLeft: `1px solid ${S.border}`, overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${S.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: S.txt }}>Draft Configuration</div>
          <div style={{ fontSize: 10, color: S.txtMuted, marginTop: 2 }}>Set up your front office strategy</div>
        </div>

        <div style={{ padding: '16px', flex: 1 }}>

          {/* Draft Class */}
          <Label>Draft Class</Label>
          <div style={{ display: 'flex', gap: 6, marginBottom: 0 }}>
            {YEAR_OPTIONS.map(opt => (
              <button
                key={opt.year}
                onClick={() => setDraftSettings({ draftYear: opt.year })}
                style={{ flex: 1, padding: '8px 6px', borderRadius: 6, background: draftYear === opt.year ? S.goldSub : S.elevated, border: `1px solid ${draftYear === opt.year ? 'rgba(196,154,26,0.4)' : S.border}`, color: draftYear === opt.year ? S.gold : S.txtSub, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
              >
                <span style={{ fontSize: 15, fontWeight: 700 }}>{opt.label}</span>
                <span style={{ fontSize: 9, color: draftYear === opt.year ? 'rgba(196,154,26,0.7)' : S.txtMuted }}>{opt.count} prospects</span>
              </button>
            ))}
          </div>

          <Divider />

          {/* Rounds */}
          <Label>Rounds</Label>
          <div style={{ display: 'flex', gap: 4, marginBottom: 0 }}>
            {ROUND_OPTIONS.map(r => (
              <button
                key={r}
                onClick={() => setDraftSettings({ rounds: r })}
                style={{ flex: 1, padding: '6px 0', borderRadius: 5, background: rounds === r ? S.blueSub : S.elevated, border: `1px solid ${rounds === r ? 'rgba(59,125,216,0.45)' : S.border}`, color: rounds === r ? S.blue : S.txtSub, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
              >
                {r}
              </button>
            ))}
          </div>

          <Divider />

          {/* Simulation speed */}
          <Label>Simulation Speed</Label>
          <div style={{ display: 'flex', gap: 4 }}>
            {SPEED_LABELS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setDraftSettings({ simSpeed: s.value })}
                style={{ flex: 1, padding: '6px 4px', borderRadius: 5, background: simSpeed === s.value ? S.blueSub : S.elevated, border: `1px solid ${simSpeed === s.value ? 'rgba(59,125,216,0.45)' : S.border}`, color: simSpeed === s.value ? S.blue : S.txtSub, cursor: 'pointer', fontSize: 9, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <Divider />

          {/* Draft Strategy */}
          <Label>Draft Philosophy</Label>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 10, color: S.txtSub }}>Best Player Available</span>
              <span style={{ fontSize: 10, color: S.txtSub }}>Needs-Based</span>
            </div>
            <input
              type="range" min={0} max={100} value={needsWeight}
              onChange={e => setDraftSettings({ needsWeight: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: S.green }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
              <span style={{ fontSize: 9, color: needsWeight < 40 ? S.green : S.txtMuted }}>BPA</span>
              <span style={{ fontSize: 9, color: S.txtMuted, fontVariantNumeric: 'tabular-nums' }}>{needsWeight}</span>
              <span style={{ fontSize: 9, color: needsWeight > 60 ? S.green : S.txtMuted }}>NEEDS</span>
            </div>
          </div>

          <div style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 10, color: S.txtSub }}>Ignore Position Value</span>
              <span style={{ fontSize: 10, color: S.txtSub }}>Positional Scarcity</span>
            </div>
            <input
              type="range" min={0} max={100} value={positionWeight}
              onChange={e => setDraftSettings({ positionWeight: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#9333ea' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
              <span style={{ fontSize: 9, color: S.txtMuted }}>FLAT</span>
              <span style={{ fontSize: 9, color: S.txtMuted, fontVariantNumeric: 'tabular-nums' }}>{positionWeight}</span>
              <span style={{ fontSize: 9, color: S.txtMuted }}>POSITIONAL</span>
            </div>
          </div>

          <Divider />

          {/* AI Advisor */}
          <Label>AI War Room Advisor</Label>
          <button
            onClick={() => setDraftSettings({ aiAdvisorEnabled: !aiAdvisorEnabled })}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 7, background: aiAdvisorEnabled ? S.greenSub : S.elevated, border: `1px solid ${aiAdvisorEnabled ? 'rgba(30,140,78,0.35)' : S.border}`, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: aiAdvisorEnabled ? '#4ade80' : S.txtSub }}>
                {aiAdvisorEnabled ? 'Advisor Active' : 'Advisor Disabled'}
              </span>
              <span style={{ fontSize: 10, color: S.txtMuted }}>Claude AI — real-time scouting</span>
            </div>
            <div style={{ width: 36, height: 18, borderRadius: 9, background: aiAdvisorEnabled ? 'rgba(30,140,78,0.45)' : S.border, position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 13, height: 13, borderRadius: '50%', background: aiAdvisorEnabled ? '#4ade80' : S.txtMuted, position: 'absolute', top: 2.5, left: aiAdvisorEnabled ? 20 : 2.5, transition: 'left 0.15s' }} />
            </div>
          </button>
          {aiAdvisorEnabled && (
            <div style={{ fontSize: 10, color: S.txtMuted, marginTop: 6, lineHeight: 1.5 }}>
              Structured war room analysis with pick recommendations, scheme fit, and board intelligence on every user turn.
            </div>
          )}
        </div>

        {/* Selected team preview + start */}
        <div style={{ padding: '14px 16px', borderTop: `1px solid ${S.border}` }}>
          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                <div style={{ padding: '10px 12px', borderRadius: 8, background: `linear-gradient(135deg, ${selected.primaryColor}12, ${S.elevated})`, border: `1px solid ${selected.primaryColor}40`, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: selected.primaryColor, flexShrink: 0, boxShadow: `0 0 14px ${selected.primaryColor}55` }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: S.txt }}>{selected.city} {selected.name}</div>
                      <div style={{ fontSize: 10, color: S.txtSub }}>{getTeamR1Pick(selected.id) ? `Pick #${getTeamR1Pick(selected.id)}` : 'No R1 pick'} · {selected.conference} {selected.division}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {selected.needs.slice(0, 5).map((n, i) => (
                      <span key={n} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: i < 2 ? `${selected.primaryColor}18` : S.surface, border: `1px solid ${i < 2 ? selected.primaryColor + '40' : S.border}`, color: i < 2 ? selected.primaryColor : S.txtSub, fontWeight: 600 }}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={selected || commissionerMode ? { scale: 1.01 } : {}}
            whileTap={selected || commissionerMode ? { scale: 0.98 } : {}}
            onClick={handleStart}
            disabled={!selected && !commissionerMode}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              background: selected || commissionerMode
                ? `linear-gradient(135deg, ${selected?.primaryColor ?? S.blue}cc, ${selected?.primaryColor ?? S.blue}88)`
                : S.elevated,
              border: `1px solid ${selected || commissionerMode ? (selected?.primaryColor ?? S.blue) + '55' : S.border}`,
              color: selected || commissionerMode ? '#fff' : S.txtMuted,
              fontSize: 13,
              fontWeight: 700,
              cursor: selected || commissionerMode ? 'pointer' : 'not-allowed',
              letterSpacing: '0.06em',
              textTransform: 'uppercase' as const,
              boxShadow: selected || commissionerMode ? `0 4px 20px ${(selected?.primaryColor ?? S.blue)}33` : 'none',
            }}
          >
            {commissionerMode ? 'Enter Commissioner Mode' : selected ? `Enter War Room as ${selected.abbreviation} →` : 'Select a Team'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
