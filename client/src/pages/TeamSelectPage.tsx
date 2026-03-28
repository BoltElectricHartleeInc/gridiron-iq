import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamLogoUrl } from '../styles/tokens';
import { AppShell, C, GLOBAL_CSS, TabBar, Badge } from '../components/AppShell';
import { useDraftStore } from '../store/draftStore';
import { useIsMobile } from '../hooks/useIsMobile';

type DivisionTab =
  | 'ALL'
  | 'AFC EAST'
  | 'AFC NORTH'
  | 'AFC SOUTH'
  | 'AFC WEST'
  | 'NFC EAST'
  | 'NFC NORTH'
  | 'NFC SOUTH'
  | 'NFC WEST';

type Team = {
  abbreviation: string;
  city: string;
  name: string;
  conference: 'AFC' | 'NFC';
  division: 'EAST' | 'NORTH' | 'SOUTH' | 'WEST';
  record: string;
  pickNumber: number;
  primaryColor: string;
  needs: string[];
};

type DraftStoreLike = {
  draftClass?: string;
  rounds?: number;
  simulationSpeed?: number;
  bpaNeedsBalance?: number;
  positionWeight?: number;
  aiAdvisorEnabled?: boolean;
  draftCraziness?: number;
  setSetting?: (key: string, value: unknown) => void;
};

type TeamSelectPageProps = {
  draftStore?: DraftStoreLike;
  onStart?: (selectedTeam: Team) => void;
};

const TABS: DivisionTab[] = [
  'ALL',
  'AFC EAST',
  'AFC NORTH',
  'AFC SOUTH',
  'AFC WEST',
  'NFC EAST',
  'NFC NORTH',
  'NFC SOUTH',
  'NFC WEST',
];

const NFL_TEAMS: Team[] = [
  { abbreviation: 'BUF', city: 'Buffalo', name: 'Bills', conference: 'AFC', division: 'EAST', record: '0-0', pickNumber: 1, primaryColor: '#00338D', needs: ['WR', 'DT', 'S', 'CB', 'EDGE'] },
  { abbreviation: 'MIA', city: 'Miami', name: 'Dolphins', conference: 'AFC', division: 'EAST', record: '0-0', pickNumber: 2, primaryColor: '#008E97', needs: ['OL', 'LB', 'S', 'DT', 'TE'] },
  { abbreviation: 'NE', city: 'New England', name: 'Patriots', conference: 'AFC', division: 'EAST', record: '0-0', pickNumber: 3, primaryColor: '#002244', needs: ['QB', 'WR', 'OT', 'EDGE', 'CB'] },
  { abbreviation: 'NYJ', city: 'New York', name: 'Jets', conference: 'AFC', division: 'EAST', record: '0-0', pickNumber: 4, primaryColor: '#125740', needs: ['OT', 'WR', 'S', 'DT', 'TE'] },

  { abbreviation: 'BAL', city: 'Baltimore', name: 'Ravens', conference: 'AFC', division: 'NORTH', record: '0-0', pickNumber: 5, primaryColor: '#241773', needs: ['CB', 'WR', 'EDGE', 'OG', 'RB'] },
  { abbreviation: 'CIN', city: 'Cincinnati', name: 'Bengals', conference: 'AFC', division: 'NORTH', record: '0-0', pickNumber: 6, primaryColor: '#FB4F14', needs: ['DT', 'CB', 'RT', 'TE', 'LB'] },
  { abbreviation: 'CLE', city: 'Cleveland', name: 'Browns', conference: 'AFC', division: 'NORTH', record: '0-0', pickNumber: 7, primaryColor: '#311D00', needs: ['QB', 'OT', 'WR', 'LB', 'S'] },
  { abbreviation: 'PIT', city: 'Pittsburgh', name: 'Steelers', conference: 'AFC', division: 'NORTH', record: '0-0', pickNumber: 8, primaryColor: '#FFB612', needs: ['C', 'CB', 'DT', 'WR', 'OT'] },

  { abbreviation: 'HOU', city: 'Houston', name: 'Texans', conference: 'AFC', division: 'SOUTH', record: '0-0', pickNumber: 9, primaryColor: '#03202F', needs: ['CB', 'DT', 'RB', 'G', 'S'] },
  { abbreviation: 'IND', city: 'Indianapolis', name: 'Colts', conference: 'AFC', division: 'SOUTH', record: '0-0', pickNumber: 10, primaryColor: '#002C5F', needs: ['WR', 'CB', 'TE', 'DT', 'LB'] },
  { abbreviation: 'JAX', city: 'Jacksonville', name: 'Jaguars', conference: 'AFC', division: 'SOUTH', record: '0-0', pickNumber: 11, primaryColor: '#006778', needs: ['CB', 'OG', 'WR', 'S', 'EDGE'] },
  { abbreviation: 'TEN', city: 'Tennessee', name: 'Titans', conference: 'AFC', division: 'SOUTH', record: '0-0', pickNumber: 12, primaryColor: '#0C2340', needs: ['QB', 'OT', 'WR', 'EDGE', 'LB'] },

  { abbreviation: 'DEN', city: 'Denver', name: 'Broncos', conference: 'AFC', division: 'WEST', record: '0-0', pickNumber: 13, primaryColor: '#FB4F14', needs: ['WR', 'DE', 'CB', 'TE', 'C'] },
  { abbreviation: 'KC', city: 'Kansas City', name: 'Chiefs', conference: 'AFC', division: 'WEST', record: '0-0', pickNumber: 14, primaryColor: '#E31837', needs: ['OT', 'WR', 'DT', 'CB', 'LB'] },
  { abbreviation: 'LV', city: 'Las Vegas', name: 'Raiders', conference: 'AFC', division: 'WEST', record: '0-0', pickNumber: 15, primaryColor: '#111111', needs: ['QB', 'RT', 'CB', 'DT', 'RB'] },
  { abbreviation: 'LAC', city: 'Los Angeles', name: 'Chargers', conference: 'AFC', division: 'WEST', record: '0-0', pickNumber: 16, primaryColor: '#0080C6', needs: ['CB', 'WR', 'C', 'DT', 'EDGE'] },

  { abbreviation: 'DAL', city: 'Dallas', name: 'Cowboys', conference: 'NFC', division: 'EAST', record: '0-0', pickNumber: 17, primaryColor: '#003594', needs: ['RB', 'OT', 'CB', 'LB', 'DT'] },
  { abbreviation: 'NYG', city: 'New York', name: 'Giants', conference: 'NFC', division: 'EAST', record: '0-0', pickNumber: 18, primaryColor: '#0B2265', needs: ['QB', 'WR', 'CB', 'IOL', 'DL'] },
  { abbreviation: 'PHI', city: 'Philadelphia', name: 'Eagles', conference: 'NFC', division: 'EAST', record: '0-0', pickNumber: 19, primaryColor: '#004C54', needs: ['CB', 'S', 'LB', 'RG', 'EDGE'] },
  { abbreviation: 'WSH', city: 'Washington', name: 'Commanders', conference: 'NFC', division: 'EAST', record: '0-0', pickNumber: 20, primaryColor: '#5A1414', needs: ['OT', 'CB', 'WR', 'EDGE', 'S'] },

  { abbreviation: 'CHI', city: 'Chicago', name: 'Bears', conference: 'NFC', division: 'NORTH', record: '0-0', pickNumber: 21, primaryColor: '#0B162A', needs: ['EDGE', 'WR', 'C', 'S', 'DT'] },
  { abbreviation: 'DET', city: 'Detroit', name: 'Lions', conference: 'NFC', division: 'NORTH', record: '0-0', pickNumber: 22, primaryColor: '#0076B6', needs: ['CB', 'WR', 'OLB', 'DT', 'G'] },
  { abbreviation: 'GB', city: 'Green Bay', name: 'Packers', conference: 'NFC', division: 'NORTH', record: '0-0', pickNumber: 23, primaryColor: '#203731', needs: ['S', 'CB', 'RB', 'OT', 'LB'] },
  { abbreviation: 'MIN', city: 'Minnesota', name: 'Vikings', conference: 'NFC', division: 'NORTH', record: '0-0', pickNumber: 24, primaryColor: '#4F2683', needs: ['QB', 'CB', 'IDL', 'G', 'EDGE'] },

  { abbreviation: 'ATL', city: 'Atlanta', name: 'Falcons', conference: 'NFC', division: 'SOUTH', record: '0-0', pickNumber: 25, primaryColor: '#A71930', needs: ['EDGE', 'CB', 'WR', 'S', 'OT'] },
  { abbreviation: 'CAR', city: 'Carolina', name: 'Panthers', conference: 'NFC', division: 'SOUTH', record: '0-0', pickNumber: 26, primaryColor: '#0085CA', needs: ['WR', 'EDGE', 'CB', 'TE', 'C'] },
  { abbreviation: 'NO', city: 'New Orleans', name: 'Saints', conference: 'NFC', division: 'SOUTH', record: '0-0', pickNumber: 27, primaryColor: '#D3BC8D', needs: ['OT', 'WR', 'DT', 'S', 'QB'] },
  { abbreviation: 'TB', city: 'Tampa Bay', name: 'Buccaneers', conference: 'NFC', division: 'SOUTH', record: '0-0', pickNumber: 28, primaryColor: '#D50A0A', needs: ['EDGE', 'CB', 'IOL', 'LB', 'RB'] },

  { abbreviation: 'ARI', city: 'Arizona', name: 'Cardinals', conference: 'NFC', division: 'WEST', record: '0-0', pickNumber: 29, primaryColor: '#97233F', needs: ['WR', 'CB', 'DE', 'OG', 'TE'] },
  { abbreviation: 'LAR', city: 'Los Angeles', name: 'Rams', conference: 'NFC', division: 'WEST', record: '0-0', pickNumber: 30, primaryColor: '#003594', needs: ['OT', 'EDGE', 'CB', 'WR', 'DT'] },
  { abbreviation: 'SF', city: 'San Francisco', name: '49ers', conference: 'NFC', division: 'WEST', record: '0-0', pickNumber: 31, primaryColor: '#AA0000', needs: ['CB', 'RT', 'S', 'WR', 'DL'] },
  { abbreviation: 'SEA', city: 'Seattle', name: 'Seahawks', conference: 'NFC', division: 'WEST', record: '0-0', pickNumber: 32, primaryColor: '#002244', needs: ['IOL', 'LB', 'CB', 'WR', 'RB'] },
];

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '').trim();
  const short = normalized.length === 3;
  const value = short
    ? normalized
        .split('')
        .map((part) => `${part}${part}`)
        .join('')
    : normalized;
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function divisionTabForTeam(team: Team): DivisionTab {
  return `${team.conference} ${team.division}` as DivisionTab;
}

function updateDraftStoreSetting(store: DraftStoreLike | undefined, key: string, value: unknown): void {
  if (!store) return;
  if (typeof store.setSetting === 'function') {
    store.setSetting(key, value);
    return;
  }
  (store as Record<string, unknown>)[key] = value;
}

// Compact card for mobile — logo + abbreviation only
function MobileTeamCard({ team, selected, onSelect }: { team: Team; selected: boolean; onSelect: () => void }) {
  const primaryRgba = (a: number) => hexToRgba(team.primaryColor, a);
  return (
    <button type="button" onClick={onSelect}
      style={{
        background: selected ? `linear-gradient(160deg, ${primaryRgba(0.2)} 0%, ${C.surface} 100%)` : C.surface,
        border: `1px solid ${selected ? primaryRgba(0.7) : C.border}`,
        borderRadius: 12, padding: '10px 6px 8px',
        cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        position: 'relative', overflow: 'hidden',
        boxShadow: selected ? `0 0 0 1px ${primaryRgba(0.4)}, 0 4px 20px ${primaryRgba(0.3)}` : 'none',
        transition: 'all 160ms', fontFamily: C.font, minHeight: 80,
      }}>
      {selected && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${team.primaryColor}, transparent)` }} />
      )}
      <div style={{ fontSize: 9, fontWeight: 800, color: selected ? team.primaryColor : C.txtMuted, letterSpacing: 0.5, alignSelf: 'flex-start', paddingLeft: 2 }}>#{team.pickNumber}</div>
      <img src={teamLogoUrl(team.abbreviation)} alt={team.abbreviation}
        style={{ width: 40, height: 40, objectFit: 'contain', opacity: selected ? 1 : 0.6, filter: selected ? `drop-shadow(0 0 8px ${primaryRgba(0.6)})` : 'none' }} />
      <div style={{ fontSize: 11, fontWeight: 800, color: selected ? C.txt : C.txtSub }}>{team.abbreviation}</div>
    </button>
  );
}

function TeamCard({ team, selected, onSelect }: { team: Team; selected: boolean; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  const active = selected || hovered;
  const primaryRgba = (a: number) => hexToRgba(team.primaryColor, a);

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: selected
          ? `linear-gradient(160deg, ${primaryRgba(0.18)} 0%, ${C.surface} 100%)`
          : hovered
            ? `linear-gradient(160deg, ${primaryRgba(0.1)} 0%, ${C.surface} 100%)`
            : C.surface,
        border: `1px solid ${selected ? primaryRgba(0.7) : hovered ? primaryRgba(0.4) : C.border}`,
        borderRadius: 14,
        padding: '14px 12px 12px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 180ms, background 180ms, box-shadow 180ms',
        boxShadow: selected
          ? `0 0 0 1px ${primaryRgba(0.4)}, 0 8px 32px ${primaryRgba(0.35)}, 0 0 60px ${primaryRgba(0.15)}`
          : hovered
            ? `0 0 0 1px ${primaryRgba(0.2)}, 0 4px 16px ${primaryRgba(0.2)}`
            : 'none',
        fontFamily: C.font,
        textAlign: 'center',
        minHeight: 178,
      }}
    >
      {/* Pick number badge */}
      <div style={{
        position: 'absolute', top: 8, left: 10,
        fontSize: 11, fontWeight: 800,
        color: selected ? team.primaryColor : C.txtSub,
        letterSpacing: 0.5,
        transition: 'color 180ms',
      }}>
        #{team.pickNumber}
      </div>

      {/* Conference badge */}
      <div style={{
        position: 'absolute', top: 8, right: 10,
        fontSize: 9, fontWeight: 800,
        color: selected ? team.primaryColor : C.txtMuted,
        letterSpacing: 1,
        transition: 'color 180ms',
      }}>
        {team.abbreviation}
      </div>

      {/* Bottom accent bar */}
      {selected && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, transparent, ${team.primaryColor}, transparent)`,
        }} />
      )}

      {/* Logo */}
      <div style={{
        width: 80, height: 80,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 14,
        filter: selected
          ? `drop-shadow(0 0 16px ${primaryRgba(0.6)})`
          : hovered
            ? `drop-shadow(0 0 8px ${primaryRgba(0.4)})`
            : 'none',
        transition: 'filter 180ms',
        transform: selected ? 'scale(1.06)' : hovered ? 'scale(1.03)' : 'scale(1)',
      }}>
        <img
          src={teamLogoUrl(team.abbreviation)}
          alt={`${team.city} ${team.name}`}
          style={{
            width: 72, height: 72,
            objectFit: 'contain',
            opacity: active ? 1 : 0.65,
            transition: 'opacity 180ms, transform 180ms',
          }}
        />
      </div>

      {/* Team name */}
      <div>
        <div style={{
          fontSize: 11, fontWeight: 700,
          color: selected ? C.txt : C.txtSub,
          lineHeight: 1.3,
          transition: 'color 180ms',
        }}>
          {team.city}
        </div>
        <div style={{
          fontSize: 13, fontWeight: 800,
          color: selected ? C.txt : C.txtSub,
          transition: 'color 180ms',
        }}>
          {team.name}
        </div>
      </div>

      {/* Needs pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
        {team.needs.slice(0, 3).map((need) => (
          <span
            key={`${team.abbreviation}-${need}`}
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase' as const,
              color: selected ? team.primaryColor : C.txtSub,
              background: selected ? primaryRgba(0.15) : C.elevated,
              border: `1px solid ${selected ? primaryRgba(0.4) : C.border}`,
              borderRadius: 999,
              padding: '2px 6px',
              transition: 'all 180ms',
            }}
          >
            {need}
          </span>
        ))}
      </div>
    </button>
  );
}

function TeamSelectPageInner({ draftStore, onStart }: TeamSelectPageProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<DivisionTab>('ALL');
  const [selectedAbbreviation, setSelectedAbbreviation] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [draftClass, setDraftClass] = useState(draftStore?.draftClass ?? '2026');
  const [rounds, setRounds] = useState(draftStore?.rounds ?? 7);
  const [simulationSpeed, setSimulationSpeed] = useState(draftStore?.simulationSpeed ?? 60);
  const [bpaNeedsBalance, setBpaNeedsBalance] = useState(draftStore?.bpaNeedsBalance ?? 50);
  const [positionWeight, setPositionWeight] = useState(draftStore?.positionWeight ?? 55);
  const [aiAdvisorEnabled, setAiAdvisorEnabled] = useState(draftStore?.aiAdvisorEnabled ?? true);
  const [draftCraziness, setDraftCraziness] = useState(draftStore?.draftCraziness ?? 35);

  const filteredTeams = useMemo(() => {
    if (activeTab === 'ALL') return NFL_TEAMS;
    return NFL_TEAMS.filter((team) => divisionTabForTeam(team) === activeTab);
  }, [activeTab]);

  const selectedTeam = useMemo(
    () => NFL_TEAMS.find((team) => team.abbreviation === selectedAbbreviation) ?? null,
    [selectedAbbreviation],
  );

  const tabItems = TABS.map(t => ({ id: t, label: t === 'ALL' ? 'ALL' : t.replace('AFC ', 'A-').replace('NFC ', 'N-') }));

  const sectionLabel = {
    color: C.txtMuted,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  };

  const inputCard = {
    background: C.elevated,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: 10,
  };

  // Settings panel (shared between mobile and desktop)
  const settingsPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Selected Team Preview */}
      <div style={{
        borderRadius: 12, overflow: 'hidden',
        border: `1px solid ${selectedTeam ? hexToRgba(selectedTeam.primaryColor, 0.5) : C.border}`,
        background: selectedTeam
          ? `linear-gradient(135deg, ${hexToRgba(selectedTeam.primaryColor, 0.12)} 0%, ${C.panel} 100%)`
          : C.panel,
        padding: 14, position: 'relative',
        transition: 'border-color 300ms, background 300ms',
      }}>
        {selectedTeam && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, transparent, ${selectedTeam.primaryColor}, transparent)`,
          }} />
        )}
        <div style={sectionLabel}>Selected Team</div>
        {selectedTeam ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ filter: `drop-shadow(0 0 12px ${hexToRgba(selectedTeam.primaryColor, 0.6)})` }}>
                <img src={teamLogoUrl(selectedTeam.abbreviation)} alt={`${selectedTeam.city} ${selectedTeam.name} logo`}
                  style={{ width: 56, height: 56, objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.txt }}>{selectedTeam.city} {selectedTeam.name}</div>
                <div style={{ fontSize: 11, color: C.txtSub, marginTop: 2 }}>{selectedTeam.record} · Pick #{selectedTeam.pickNumber}</div>
                <div style={{ fontSize: 11, color: C.txtSub }}>{selectedTeam.conference} {selectedTeam.division}</div>
              </div>
            </div>
            <div>
              <div style={{ ...sectionLabel, marginBottom: 6 }}>Top 5 Needs</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {selectedTeam.needs.slice(0, 5).map((need) => (
                  <span key={`${selectedTeam.abbreviation}-preview-${need}`} style={{
                    fontSize: 10, fontWeight: 800, color: selectedTeam.primaryColor,
                    background: hexToRgba(selectedTeam.primaryColor, 0.12),
                    border: `1px solid ${hexToRgba(selectedTeam.primaryColor, 0.4)}`,
                    borderRadius: 999, padding: '3px 8px',
                    letterSpacing: '0.05em', textTransform: 'uppercase' as const,
                  }}>{need}</span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div style={{ color: C.txtSub, fontSize: 12, fontStyle: 'italic' }}>
            Select a team to preview front-office context.
          </div>
        )}
      </div>

      {/* Draft Settings */}
      <div>
        <div style={sectionLabel}>Draft Class</div>
        <div style={inputCard}>
          <select value={draftClass} onChange={(e) => { const v = e.target.value; setDraftClass(v); updateDraftStoreSetting(draftStore, 'draftClass', v); }}
            style={{ width: '100%', background: C.elevated, border: `1px solid ${C.borderHi}`, borderRadius: 8, color: C.txt, fontSize: 13, padding: '9px 10px', outline: 'none', fontFamily: C.font }}>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="Historic Mix">Historic Mix</option>
          </select>
        </div>
      </div>
      <div>
        <div style={sectionLabel}>Rounds ({rounds})</div>
        <div style={inputCard}><input type="range" min={1} max={7} value={rounds} onChange={(e) => { const v = Number(e.target.value); setRounds(v); updateDraftStoreSetting(draftStore, 'rounds', v); }} style={{ width: '100%', accentColor: C.blueBright }} /></div>
      </div>
      <div>
        <div style={sectionLabel}>Simulation Speed ({simulationSpeed})</div>
        <div style={inputCard}><input type="range" min={0} max={100} value={simulationSpeed} onChange={(e) => { const v = Number(e.target.value); setSimulationSpeed(v); updateDraftStoreSetting(draftStore, 'simulationSpeed', v); }} style={{ width: '100%', accentColor: C.green }} /></div>
      </div>
      <div>
        <div style={sectionLabel}>BPA vs Needs ({bpaNeedsBalance}/{100 - bpaNeedsBalance})</div>
        <div style={inputCard}><input type="range" min={0} max={100} value={bpaNeedsBalance} onChange={(e) => { const v = Number(e.target.value); setBpaNeedsBalance(v); updateDraftStoreSetting(draftStore, 'bpaNeedsBalance', v); }} style={{ width: '100%', accentColor: C.blue }} /></div>
      </div>
      <div>
        <div style={sectionLabel}>Position Weight ({positionWeight})</div>
        <div style={inputCard}><input type="range" min={0} max={100} value={positionWeight} onChange={(e) => { const v = Number(e.target.value); setPositionWeight(v); updateDraftStoreSetting(draftStore, 'positionWeight', v); }} style={{ width: '100%', accentColor: C.green }} /></div>
      </div>
      <div>
        <div style={sectionLabel}>AI Advisor</div>
        <div style={{ ...inputCard, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: aiAdvisorEnabled ? C.green : C.txtSub, fontSize: 12, fontWeight: 700 }}>{aiAdvisorEnabled ? 'ENABLED' : 'DISABLED'}</span>
          <button type="button" onClick={() => { const v = !aiAdvisorEnabled; setAiAdvisorEnabled(v); updateDraftStoreSetting(draftStore, 'aiAdvisorEnabled', v); }}
            style={{ width: 44, height: 24, borderRadius: 999, border: `1px solid ${aiAdvisorEnabled ? hexToRgba(C.green, 0.65) : C.borderHi}`, background: aiAdvisorEnabled ? hexToRgba(C.green, 0.2) : C.elevated, position: 'relative', cursor: 'pointer', transition: 'background 160ms ease, border-color 160ms ease' }}
            aria-label="Toggle AI advisor" aria-pressed={aiAdvisorEnabled}>
            <span style={{ position: 'absolute', top: 2, left: aiAdvisorEnabled ? 22 : 2, width: 18, height: 18, borderRadius: '50%', background: aiAdvisorEnabled ? C.green : C.txtSub, transition: 'left 160ms ease' }} />
          </button>
        </div>
      </div>
      <div>
        <div style={sectionLabel}>Draft Craziness ({draftCraziness})</div>
        <div style={inputCard}>
          <input type="range" min={0} max={100} value={draftCraziness} onChange={(e) => { const v = Number(e.target.value); setDraftCraziness(v); updateDraftStoreSetting(draftStore, 'draftCraziness', v); }} style={{ width: '100%', accentColor: C.amber }} />
          <div style={{ marginTop: 6, fontSize: 10, color: C.txtSub, letterSpacing: '0.08em', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
            <span>QUIET</span><span>← →</span><span>CHAOS</span>
          </div>
        </div>
      </div>
    </div>
  );

  // CTA button (shared)
  const ctaButton = (
    <button type="button" onClick={() => { if (selectedTeam && onStart) onStart(selectedTeam); }} disabled={!selectedTeam}
      style={{
        width: '100%', height: 52, borderRadius: 12,
        border: `1px solid ${selectedTeam ? hexToRgba(selectedTeam.primaryColor, 0.8) : C.borderHi}`,
        background: selectedTeam ? `linear-gradient(135deg, ${hexToRgba(selectedTeam.primaryColor, 0.95)} 0%, ${hexToRgba(selectedTeam.primaryColor, 0.75)} 100%)` : C.elevated,
        color: selectedTeam ? '#fff' : C.txtSub,
        fontSize: 14, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.06em',
        cursor: selectedTeam ? 'pointer' : 'not-allowed',
        transition: 'all 200ms',
        boxShadow: selectedTeam ? `0 4px 24px ${hexToRgba(selectedTeam.primaryColor, 0.4)}` : 'none',
        fontFamily: C.font,
      }}>
      {selectedTeam ? `ENTER WAR ROOM AS ${selectedTeam.abbreviation} →` : 'SELECT A TEAM TO CONTINUE'}
    </button>
  );

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <AppShell title="Team Select" backTo="/" backLabel="Home" maxWidth={1400}>
        {isMobile ? (
          /* ── MOBILE LAYOUT ── */
          <div style={{ paddingBottom: 'calc(140px + env(safe-area-inset-bottom, 0px))' }}>
            {/* Header */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: C.gold, letterSpacing: 3, fontWeight: 700, marginBottom: 4 }}>
                NFL DRAFT — SELECT YOUR FRANCHISE
              </div>
              <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
                <TabBar tabs={tabItems} active={activeTab} onChange={(id) => setActiveTab(id as DivisionTab)} style={{ width: 'max-content' }} />
              </div>
            </div>

            {/* Team grid: 3 columns on mobile */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
              {filteredTeams.map((team) => (
                <MobileTeamCard key={team.abbreviation} team={team} selected={selectedTeam?.abbreviation === team.abbreviation} onSelect={() => setSelectedAbbreviation(team.abbreviation)} />
              ))}
            </div>

            {/* Settings toggle */}
            <button type="button" onClick={() => setSettingsOpen(o => !o)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, color: C.txtSub, fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: settingsOpen ? 0 : 0 }}>
              <span>⚙ Draft Settings</span>
              <span>{settingsOpen ? '▲' : '▼'}</span>
            </button>
            {settingsOpen && (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '12px 14px', marginBottom: 8 }}>
                {settingsPanel}
              </div>
            )}

            {/* Sticky CTA at bottom — sits above the 60px bottom tab bar */}
            <div style={{
              position: 'fixed',
              bottom: 'calc(60px + env(safe-area-inset-bottom, 0px))',
              left: 0, right: 0,
              zIndex: 150,
              padding: '12px 16px',
              background: 'rgba(8,10,18,0.97)',
              backdropFilter: 'blur(12px)',
              borderTop: `1px solid ${C.border}`,
            }}>
              {ctaButton}
            </div>
          </div>
        ) : (
          /* ── DESKTOP LAYOUT ── */
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 20, alignItems: 'start' }}>
            {/* ── Left: Team grid ── */}
            <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: C.gold, letterSpacing: 3, fontWeight: 700, marginBottom: 4 }}>NFL DRAFT — SELECT YOUR FRANCHISE</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: C.txt, marginBottom: 14 }}>32 Teams · {filteredTeams.length} Shown</div>
                <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
                  <TabBar tabs={tabItems} active={activeTab} onChange={(id) => setActiveTab(id as DivisionTab)} style={{ width: 'max-content' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: 12 }}>
                {filteredTeams.map((team) => (
                  <TeamCard key={team.abbreviation} team={team} selected={selectedTeam?.abbreviation === team.abbreviation} onSelect={() => setSelectedAbbreviation(team.abbreviation)} />
                ))}
              </div>
            </section>

            {/* ── Right: Settings + CTA ── */}
            <aside style={{ position: 'sticky', top: 20, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {settingsPanel}
              <div style={{ marginTop: 4 }}>{ctaButton}</div>
            </aside>
          </div>
        )}
      </AppShell>
    </>
  );
}

export function TeamSelectPage(props: TeamSelectPageProps) {
  const navigate = useNavigate();
  const { startDraft } = useDraftStore();

  const handleStart = (team: Team) => {
    if (props.onStart) {
      props.onStart(team);
    } else {
      startDraft(team.abbreviation.toLowerCase());
      navigate('/draft/pregame');
    }
  };

  return <TeamSelectPageInner {...props} onStart={handleStart} />;
}

export default TeamSelectPage;
