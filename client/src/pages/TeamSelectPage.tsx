import { useMemo, useState } from 'react';
import { T, teamLogoUrl } from '../styles/tokens';

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

const sectionLabelStyle = {
  color: T.txtMuted,
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  marginBottom: 8,
};

const inputCardStyle = {
  background: T.panel,
  border: `1px solid ${T.border}`,
  borderRadius: 10,
  padding: 10,
};

export default function TeamSelectPage({ draftStore, onStart }: TeamSelectPageProps) {
  const [activeTab, setActiveTab] = useState<DivisionTab>('ALL');
  const [selectedAbbreviation, setSelectedAbbreviation] = useState<string | null>(null);

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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        color: T.txt,
        fontFamily: T.fontBase,
        padding: 24,
      }}
    >
      <style>
        {`
          .conference-tab {
            position: relative;
            color: ${T.txtSub};
            background: transparent;
            border: none;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            padding: 10px 0;
            cursor: pointer;
            transition: color 140ms ease;
            white-space: nowrap;
          }

          .conference-tab:hover {
            color: ${T.txt};
          }

          .conference-tab.active {
            color: ${T.blueBright};
          }

          .conference-tab.active::after {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            bottom: -1px;
            height: 2px;
            border-radius: 999px;
            background: ${T.blueBright};
          }

          .team-select-card {
            min-height: 160px;
            border-radius: 12px;
            border: 1px solid ${T.border};
            background: ${T.panel};
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 8px;
            padding: 12px;
            transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
            cursor: pointer;
          }

          .team-select-card .team-logo {
            width: 52px;
            height: 52px;
            object-fit: contain;
            opacity: 0.7;
            transition: opacity 170ms ease, transform 170ms ease;
          }

          .team-select-card:hover .team-logo {
            opacity: 1;
            transform: scale(1.015);
          }

          .team-select-card.selected .team-logo {
            opacity: 1;
          }
        `}
      </style>

      <div
        style={{
          maxWidth: 1360,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: 20,
          alignItems: 'start',
        }}
      >
        <section
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 18,
              overflowX: 'auto',
              paddingBottom: 8,
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`conference-tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            {filteredTeams.map((team) => {
              const selected = selectedTeam?.abbreviation === team.abbreviation;
              const selectedBorder = hexToRgba(team.primaryColor, 0.7);
              const selectedBackground = `linear-gradient(180deg, ${hexToRgba(team.primaryColor, 0.1)} 0%, ${T.panel} 100%)`;
              const selectedGlow = `0 0 0 1px ${hexToRgba(team.primaryColor, 0.35)}, 0 12px 30px ${hexToRgba(team.primaryColor, 0.3)}`;

              return (
                <button
                  key={team.abbreviation}
                  type="button"
                  className={`team-select-card${selected ? ' selected' : ''}`}
                  style={{
                    borderColor: selected ? selectedBorder : T.border,
                    background: selected ? selectedBackground : T.panel,
                    boxShadow: selected ? selectedGlow : 'none',
                    textAlign: 'left',
                  }}
                  onClick={() => setSelectedAbbreviation(team.abbreviation)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        color: team.primaryColor,
                        fontSize: 28,
                        lineHeight: 1,
                        fontWeight: 800,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {team.pickNumber}
                    </div>
                    <div style={{ color: T.txtSub, fontSize: 12, fontWeight: 600 }}>{team.abbreviation}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 56 }}>
                    <img className="team-logo" src={teamLogoUrl(team.abbreviation)} alt={`${team.city} ${team.name} logo`} />
                  </div>

                  <div>
                    <div style={{ color: T.txt, fontSize: 12, fontWeight: 600 }}>
                      {team.city} {team.name}
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {team.needs.slice(0, 3).map((need) => (
                        <span
                          key={`${team.abbreviation}-${need}`}
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            color: team.primaryColor,
                            background: hexToRgba(team.primaryColor, 0.12),
                            border: `1px solid ${hexToRgba(team.primaryColor, 0.35)}`,
                            borderRadius: 999,
                            padding: '3px 7px',
                          }}
                        >
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <aside
          style={{
            width: 340,
            position: 'sticky',
            top: 20,
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div>
            <div style={sectionLabelStyle}>Draft Class</div>
            <div style={inputCardStyle}>
              <select
                value={draftClass}
                onChange={(event) => {
                  const next = event.target.value;
                  setDraftClass(next);
                  updateDraftStoreSetting(draftStore, 'draftClass', next);
                }}
                style={{
                  width: '100%',
                  background: T.elevated,
                  border: `1px solid ${T.borderHi}`,
                  borderRadius: 8,
                  color: T.txt,
                  fontSize: 13,
                  padding: '9px 10px',
                  outline: 'none',
                }}
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="Historic Mix">Historic Mix</option>
              </select>
            </div>
          </div>

          <div>
            <div style={sectionLabelStyle}>Rounds ({rounds})</div>
            <div style={inputCardStyle}>
              <input
                type="range"
                min={1}
                max={7}
                value={rounds}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setRounds(next);
                  updateDraftStoreSetting(draftStore, 'rounds', next);
                }}
                style={{ width: '100%', accentColor: T.blueBright }}
              />
            </div>
          </div>

          <div>
            <div style={sectionLabelStyle}>Simulation Speed ({simulationSpeed})</div>
            <div style={inputCardStyle}>
              <input
                type="range"
                min={0}
                max={100}
                value={simulationSpeed}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setSimulationSpeed(next);
                  updateDraftStoreSetting(draftStore, 'simulationSpeed', next);
                }}
                style={{ width: '100%', accentColor: T.green }}
              />
            </div>
          </div>

          <div>
            <div style={sectionLabelStyle}>BPA vs Needs ({bpaNeedsBalance}/{100 - bpaNeedsBalance})</div>
            <div style={inputCardStyle}>
              <input
                type="range"
                min={0}
                max={100}
                value={bpaNeedsBalance}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setBpaNeedsBalance(next);
                  updateDraftStoreSetting(draftStore, 'bpaNeedsBalance', next);
                }}
                style={{ width: '100%', accentColor: T.blue }}
              />
            </div>
          </div>

          <div>
            <div style={sectionLabelStyle}>Position Weight ({positionWeight})</div>
            <div style={inputCardStyle}>
              <input
                type="range"
                min={0}
                max={100}
                value={positionWeight}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setPositionWeight(next);
                  updateDraftStoreSetting(draftStore, 'positionWeight', next);
                }}
                style={{ width: '100%', accentColor: T.green }}
              />
            </div>
          </div>

          <div>
            <div style={sectionLabelStyle}>AI Advisor</div>
            <div style={{ ...inputCardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: aiAdvisorEnabled ? T.green : T.txtSub, fontSize: 12, fontWeight: 600 }}>
                {aiAdvisorEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
              <button
                type="button"
                onClick={() => {
                  const next = !aiAdvisorEnabled;
                  setAiAdvisorEnabled(next);
                  updateDraftStoreSetting(draftStore, 'aiAdvisorEnabled', next);
                }}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 999,
                  border: `1px solid ${aiAdvisorEnabled ? hexToRgba(T.green, 0.65) : T.borderHi}`,
                  background: aiAdvisorEnabled ? hexToRgba(T.green, 0.2) : T.elevated,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 160ms ease, border-color 160ms ease',
                }}
                aria-label="Toggle AI advisor"
                aria-pressed={aiAdvisorEnabled}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: aiAdvisorEnabled ? 22 : 2,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: aiAdvisorEnabled ? T.green : T.txtSub,
                    transition: 'left 160ms ease',
                  }}
                />
              </button>
            </div>
          </div>

          <div>
            <div style={sectionLabelStyle}>Draft Craziness ({draftCraziness})</div>
            <div style={inputCardStyle}>
              <input
                type="range"
                min={0}
                max={100}
                value={draftCraziness}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setDraftCraziness(next);
                  updateDraftStoreSetting(draftStore, 'draftCraziness', next);
                }}
                style={{ width: '100%', accentColor: T.amber }}
              />
              <div
                style={{
                  marginTop: 6,
                  fontSize: 10,
                  color: T.txtSub,
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>QUIET</span>
                <span>← →</span>
                <span>CHAOS</span>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 4,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              background: T.panel,
              padding: 12,
            }}
          >
            <div style={sectionLabelStyle}>Selected Team</div>
            {selectedTeam ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src={teamLogoUrl(selectedTeam.abbreviation)}
                    alt={`${selectedTeam.city} ${selectedTeam.name} logo`}
                    style={{ width: 46, height: 46, objectFit: 'contain' }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.txt }}>
                      {selectedTeam.city} {selectedTeam.name}
                    </div>
                    <div style={{ fontSize: 11, color: T.txtSub, marginTop: 2 }}>
                      {selectedTeam.record} | Pick #{selectedTeam.pickNumber}
                    </div>
                    <div style={{ fontSize: 11, color: T.txtSub }}>
                      {selectedTeam.conference} {selectedTeam.division}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ ...sectionLabelStyle, marginBottom: 6 }}>Top 5 Needs</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedTeam.needs.slice(0, 5).map((need) => (
                      <span
                        key={`${selectedTeam.abbreviation}-preview-${need}`}
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: selectedTeam.primaryColor,
                          background: hexToRgba(selectedTeam.primaryColor, 0.12),
                          border: `1px solid ${hexToRgba(selectedTeam.primaryColor, 0.35)}`,
                          borderRadius: 999,
                          padding: '3px 7px',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {need}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: T.txtSub, fontSize: 12 }}>Select a team to preview front-office context.</div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (selectedTeam && onStart) onStart(selectedTeam);
            }}
            disabled={!selectedTeam}
            style={{
              marginTop: 2,
              width: '100%',
              height: 48,
              borderRadius: 10,
              border: `1px solid ${selectedTeam ? hexToRgba(selectedTeam.primaryColor, 0.8) : T.borderHi}`,
              background: selectedTeam
                ? `linear-gradient(135deg, ${hexToRgba(selectedTeam.primaryColor, 0.95)} 0%, ${hexToRgba(selectedTeam.primaryColor, 0.75)} 100%)`
                : T.elevated,
              color: selectedTeam ? T.txtInvert : T.txtSub,
              fontSize: 14,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              cursor: selectedTeam ? 'pointer' : 'not-allowed',
            }}
          >
            {selectedTeam ? `ENTER WAR ROOM AS ${selectedTeam.abbreviation} →` : 'SELECT A TEAM TO CONTINUE'}
          </button>
        </aside>
      </div>
    </div>
  );
}

export { TeamSelectPage };
