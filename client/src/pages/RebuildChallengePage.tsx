import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppShell, C, Badge, Btn, SectionHead, StatTile } from '../components/AppShell';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RebuildChallenge {
  id: string;
  name: string;
  emoji: string;
  difficulty: 'Medium' | 'Medium-Hard' | 'Hard' | 'Extreme' | 'Nightmare';
  description: string;
  flavor: string;
  startRecord: string;
  startCap: number;
  startPicks: number;
  faInterestModifier: number;
  modifier?: string;
}

interface YearObjective {
  year: number;
  label: string;
  description: string;
}

interface YearResult {
  year: number;
  wins: number;
  losses: number;
  playoffResult: string | null;
  keyEvent: string;
}

interface Decision {
  prompt: string;
  choices: { label: string; effect: string; capDelta: number; pickDelta: number; ratingDelta: number; moraleDelta: number }[];
}

type ObjectiveStatus = 'locked' | 'in_progress' | 'completed' | 'failed';

interface LeaderboardEntry {
  id: string;
  challengeId: string;
  teamName: string;
  finalRecord: string;
  yearsToFirstChampionship: number | null;
  totalChampionships: number;
  score: number;
  tier: string;
  date: number;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const CHALLENGES: RebuildChallenge[] = [
  {
    id: 'browns',
    name: 'THE BROWNS',
    emoji: '🔥',
    difficulty: 'Extreme',
    description: '1-16 record, no picks, $0 cap space.',
    flavor: 'The most cursed franchise in football. History is against you.',
    startRecord: '1-16',
    startCap: 0,
    startPicks: 0,
    faInterestModifier: -10,
    modifier: 'Your QB1 gets injured in Week 2 every Year 1.',
  },
  {
    id: 'teardown',
    name: 'COMPLETE TEARDOWN',
    emoji: '💀',
    difficulty: 'Nightmare',
    description: 'Release your entire roster. 5 high picks but absolutely nothing else.',
    flavor: 'Pure GM talent. Can you build from literally nothing?',
    startRecord: '0-0',
    startCap: 255,
    startPicks: 5,
    faInterestModifier: -5,
  },
  {
    id: 'small_market',
    name: 'SMALL MARKET GRIND',
    emoji: '📉',
    difficulty: 'Hard',
    description: 'Jacksonville, Buffalo, or Carolina. Hard time attracting free agents.',
    flavor: 'Must develop everything internally. No marquee signings.',
    startRecord: '5-12',
    startCap: 40,
    startPicks: 3,
    faInterestModifier: -15,
  },
  {
    id: 'window_now',
    name: 'WINDOW IS NOW',
    emoji: '⏰',
    difficulty: 'Medium-Hard',
    description: 'Contender team, but your star QB retires in 2 years.',
    flavor: 'Build a dynasty before the window slams shut.',
    startRecord: '11-6',
    startCap: 15,
    startPicks: 2,
    faInterestModifier: 5,
    modifier: 'Franchise QB retires after Year 2.',
  },
  {
    id: 'underdog',
    name: 'UNDERDOG RUN',
    emoji: '🏆',
    difficulty: 'Medium',
    description: 'Randomly selected 6-11 team. Make the Super Bowl within 3 years.',
    flavor: 'Nobody believes in you. Prove them wrong.',
    startRecord: '6-11',
    startCap: 55,
    startPicks: 3,
    faInterestModifier: 0,
  },
];

const YEAR_OBJECTIVES: YearObjective[] = [
  { year: 1,  label: 'Win 4+ games',           description: 'Show the league you\'re competitive' },
  { year: 2,  label: 'Win 8+ games',            description: 'Cross the .500 threshold' },
  { year: 3,  label: 'Make the playoffs',       description: 'Postseason appearance' },
  { year: 5,  label: 'Win your division',       description: 'Division champion' },
  { year: 7,  label: 'Conference Championship', description: 'One game from the big one' },
  { year: 10, label: 'WIN THE SUPER BOWL',      description: 'Dynasty complete' },
];

const DECISIONS_BY_ROUND: Decision[][] = [
  [
    {
      prompt: 'Your franchise QB is in year 3 of his development. Do you:',
      choices: [
        { label: 'Trade up for a top pick', effect: 'Invested in the future. Lost 2 draft picks.', capDelta: -5, pickDelta: -2, ratingDelta: 3, moraleDelta: 2 },
        { label: 'Stay the course', effect: 'Current QB gets one more year to prove himself.', capDelta: 0, pickDelta: 0, ratingDelta: 1, moraleDelta: 0 },
        { label: 'Sign veteran FA bridge QB', effect: 'Veteran signed. Locker room dynamics shift.', capDelta: -18, pickDelta: 0, ratingDelta: 4, moraleDelta: -2 },
      ],
    },
    {
      prompt: 'A rival team is offering a 1st rounder for your best pass rusher. Do you:',
      choices: [
        { label: 'Accept the trade', effect: 'Collected assets. Defense weakened short-term.', capDelta: 10, pickDelta: 1, ratingDelta: -3, moraleDelta: -3 },
        { label: 'Decline, he\'s untouchable', effect: 'Pass rusher stays. Team galvanized.', capDelta: 0, pickDelta: 0, ratingDelta: 2, moraleDelta: 3 },
        { label: 'Counter: demand 2 firsts', effect: 'Rival walks away. Player knows his value.', capDelta: 0, pickDelta: 0, ratingDelta: 0, moraleDelta: -1 },
      ],
    },
    {
      prompt: 'Your offensive coordinator just got a head coach offer elsewhere. Do you:',
      choices: [
        { label: 'Let him go, promote from within', effect: 'Internal candidate steps up. Continuity preserved.', capDelta: 0, pickDelta: 0, ratingDelta: -1, moraleDelta: 1 },
        { label: 'Block his departure, pay raise', effect: 'OC stays, costs you $4M/yr cap space.', capDelta: -4, pickDelta: 0, ratingDelta: 2, moraleDelta: 2 },
        { label: 'Hire outside coordinator', effect: 'New voice in the building. Transition period.', capDelta: -2, pickDelta: 0, ratingDelta: 0, moraleDelta: -1 },
      ],
    },
  ],
  [
    {
      prompt: 'You have $42M in cap space. What\'s the priority?',
      choices: [
        { label: 'Pass rush DE ($25M/yr)', effect: 'Elite pass rusher signed. Immediate defensive upgrade.', capDelta: -25, pickDelta: 0, ratingDelta: 5, moraleDelta: 2 },
        { label: 'Upgrade offensive line (2x $12M)', effect: 'O-line rebuilt. QB will have time. Long-term payoff.', capDelta: -24, pickDelta: 0, ratingDelta: 4, moraleDelta: 3 },
        { label: 'Stockpile picks, don\'t spend', effect: 'No splashy moves. Fans unhappy. Draft capital stacks.', capDelta: 10, pickDelta: 2, ratingDelta: 0, moraleDelta: -3 },
      ],
    },
    {
      prompt: 'Injury report: your starting RB is out 4-8 weeks. Do you:',
      choices: [
        { label: 'Sign a veteran free agent RB', effect: 'Bridge back signed. Roster depth improved.', capDelta: -8, pickDelta: 0, ratingDelta: 2, moraleDelta: 1 },
        { label: 'Promote from the practice squad', effect: 'Internal solution. Saves cap. Risky.', capDelta: 0, pickDelta: 0, ratingDelta: -1, moraleDelta: 0 },
        { label: 'Shift to a pass-heavy scheme', effect: 'Adapt scheme. WRs get more targets.', capDelta: 0, pickDelta: 0, ratingDelta: 1, moraleDelta: 1 },
      ],
    },
    {
      prompt: 'The NFL trade deadline is here. Your team is 6-3. Do you:',
      choices: [
        { label: 'Buy: trade 2nd rounder for CB upgrade', effect: 'Corners reinforced for the playoff push.', capDelta: 0, pickDelta: -1, ratingDelta: 3, moraleDelta: 4 },
        { label: 'Sell: ship veteran LB for draft capital', effect: 'Future-first approach. Weakens now.', capDelta: 5, pickDelta: 1, ratingDelta: -2, moraleDelta: -2 },
        { label: 'Stand pat, trust the roster', effect: 'No trades. Team believes in themselves.', capDelta: 0, pickDelta: 0, ratingDelta: 0, moraleDelta: 2 },
      ],
    },
  ],
  [
    {
      prompt: 'Your best player is demanding a trade. Do you:',
      choices: [
        { label: 'Trade him, collect assets', effect: 'Haul of picks and a young player returned.', capDelta: 15, pickDelta: 2, ratingDelta: -4, moraleDelta: -4 },
        { label: 'Extend him at market value', effect: 'Franchise cornerstone stays. Big cap hit.', capDelta: -30, pickDelta: 0, ratingDelta: 2, moraleDelta: 5 },
        { label: 'Let him walk in free agency', effect: 'Compensatory pick in 2 years. Nothing now.', capDelta: 0, pickDelta: 0, ratingDelta: -3, moraleDelta: -5 },
      ],
    },
    {
      prompt: 'The media is calling for the coach\'s job after a 2-7 start. Do you:',
      choices: [
        { label: 'Fire the coach midseason', effect: 'Interim takes over. Culture reset. Messy.', capDelta: -8, pickDelta: 0, ratingDelta: -1, moraleDelta: -3 },
        { label: 'Back him publicly and let him finish', effect: 'Trust in the process. Team rallies or falls apart.', capDelta: 0, pickDelta: 0, ratingDelta: 0, moraleDelta: 2 },
        { label: 'Shake up the coaching staff', effect: 'DC and OC both replaced. Players divided.', capDelta: -4, pickDelta: 0, ratingDelta: 1, moraleDelta: -1 },
      ],
    },
    {
      prompt: 'You\'ve reached the NFC Championship. Your starting QB is nursing an injury. Do you:',
      choices: [
        { label: 'Start him — he plays through it', effect: 'Guts it out. 70% effectiveness but plays.', capDelta: 0, pickDelta: 0, ratingDelta: 0, moraleDelta: 5 },
        { label: 'Start the backup', effect: 'Fresh QB. Less talent. Team rallies around him.', capDelta: 0, pickDelta: 0, ratingDelta: -2, moraleDelta: 1 },
        { label: 'Scratch him, protect long-term', effect: 'Backup starts. Future protected. Fans question it.', capDelta: 0, pickDelta: 0, ratingDelta: -3, moraleDelta: -2 },
      ],
    },
  ],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function difficultyAccent(d: string): string {
  switch (d) {
    case 'Medium':      return C.green;
    case 'Medium-Hard': return C.gold;
    case 'Hard':        return C.amber;
    case 'Extreme':     return C.red;
    case 'Nightmare':   return C.purple;
    default:            return C.txtSub;
  }
}

function objectiveStatus(obj: YearObjective, currentYear: number, results: YearResult[]): ObjectiveStatus {
  const completedYear = results.find(r => r.year === obj.year);
  if (completedYear) {
    return checkObjective(obj, completedYear) ? 'completed' : 'failed';
  }
  if (obj.year === currentYear) return 'in_progress';
  if (obj.year > currentYear)  return 'locked';
  return 'failed';
}

function checkObjective(obj: YearObjective, result: YearResult): boolean {
  switch (obj.year) {
    case 1:  return result.wins >= 4;
    case 2:  return result.wins >= 8;
    case 3:  return result.playoffResult !== null;
    case 5:  return result.playoffResult !== null && result.wins >= 11;
    case 7:  return result.playoffResult === 'CONF' || result.playoffResult === 'SB_LOSS' || result.playoffResult === 'CHAMPION';
    case 10: return result.playoffResult === 'CHAMPION';
    default: return false;
  }
}

function scoreRebuild(results: YearResult[]): { score: number; tier: string } {
  let score = 0;
  for (const r of results) {
    score += r.wins * 5;
    if (r.playoffResult === 'WC')       score += 30;
    if (r.playoffResult === 'DIV')      score += 50;
    if (r.playoffResult === 'CONF')     score += 80;
    if (r.playoffResult === 'SB_LOSS')  score += 100;
    if (r.playoffResult === 'CHAMPION') score += 200;
  }
  const tier = score >= 800 ? 'S' : score >= 600 ? 'A' : score >= 400 ? 'B' : score >= 200 ? 'C' : 'D';
  return { score, tier };
}

function tierColor(tier: string): string {
  switch (tier) {
    case 'S': return C.gold;
    case 'A': return C.green;
    case 'B': return C.blueBright;
    case 'C': return C.txtSub;
    default:  return C.txtMuted;
  }
}

function simYear(year: number, teamRating: number, challenge: RebuildChallenge, morale: number): YearResult {
  const effectiveRating = Math.max(30, Math.min(99, teamRating + morale * 0.3));
  const winChance = 0.20 + (effectiveRating / 99) * 0.60;
  let wins = 0;
  for (let g = 0; g < 17; g++) if (Math.random() < winChance) wins++;
  if (challenge.id === 'browns' && year === 1) wins = Math.max(0, wins - 3);
  const losses = 17 - wins;
  let playoffResult: string | null = null;
  const playoffChance = wins >= 11 ? 0.95 : wins >= 9 ? 0.70 : wins >= 7 ? 0.35 : 0.05;
  if (Math.random() < playoffChance) {
    const roll = Math.random();
    if (roll < 0.35)      playoffResult = 'WC';
    else if (roll < 0.60) playoffResult = 'DIV';
    else if (roll < 0.80) playoffResult = 'CONF';
    else if (roll < 0.92) playoffResult = 'SB_LOSS';
    else                  playoffResult = 'CHAMPION';
  }
  const events = [
    'Rookie WR emerged as a top-10 receiver.',
    'Offensive line ranked top-5 by season\'s end.',
    'Defense allowed fewest points in the conference.',
    'Star CB elected to Pro Bowl.',
    'Franchise QB set a new team passing record.',
    'Running game led the league in yards per carry.',
    'Late-season collapse dropped you out of playoff contention.',
    'Historic comeback win energized the fan base.',
    'Draft pick bust; 1st round pick cut before midseason.',
    'Surprise veteran FA proved to be the missing piece.',
  ];
  return { year, wins, losses, playoffResult, keyEvent: events[Math.floor(Math.random() * events.length)] };
}

// ─── Leaderboard (localStorage) ───────────────────────────────────────────────

const LB_KEY = 'rebuild_leaderboard';
function loadLeaderboard(): LeaderboardEntry[] {
  try { return JSON.parse(localStorage.getItem(LB_KEY) ?? 'null') ?? []; } catch { return []; }
}
function saveLeaderboard(entries: LeaderboardEntry[]): void {
  try { localStorage.setItem(LB_KEY, JSON.stringify(entries)); } catch { /* ignore */ }
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Phase = 'setup' | 'active' | 'deciding' | 'simming' | 'done';

export function RebuildChallengePage() {
  const navigate = useNavigate();

  const [selectedChallenge, setSelectedChallenge] = useState<RebuildChallenge | null>(null);
  const [phase,             setPhase]             = useState<Phase>('setup');
  const [leaderboard,       setLeaderboard]       = useState<LeaderboardEntry[]>(loadLeaderboard);
  const [currentYear,       setCurrentYear]       = useState(1);
  const [teamRating,        setTeamRating]        = useState(55);
  const [capSpace,          setCapSpace]          = useState(0);
  const [draftPicks,        setDraftPicks]        = useState(0);
  const [morale,            setMorale]            = useState(0);
  const [yearResults,       setYearResults]       = useState<YearResult[]>([]);
  const [decisionRound,     setDecisionRound]     = useState(0);
  const [activeDecision,    setActiveDecision]    = useState<Decision | null>(null);
  const [decisionHistory,   setDecisionHistory]   = useState<string[]>([]);
  const [simResult,         setSimResult]         = useState<YearResult | null>(null);

  function handleStartRebuild() {
    if (!selectedChallenge) return;
    setTeamRating(
      selectedChallenge.id === 'window_now'   ? 82
        : selectedChallenge.id === 'underdog'     ? 68
        : selectedChallenge.id === 'small_market' ? 62
        : selectedChallenge.id === 'teardown'     ? 45
        : 40,
    );
    setCapSpace(selectedChallenge.startCap);
    setDraftPicks(selectedChallenge.startPicks);
    setMorale(0);
    setCurrentYear(1);
    setYearResults([]);
    setDecisionRound(0);
    setDecisionHistory([]);
    setPhase('active');
  }

  function handleBeginDecisions() {
    const decision = DECISIONS_BY_ROUND[0][(currentYear - 1) % DECISIONS_BY_ROUND[0].length];
    setActiveDecision(decision);
    setDecisionRound(1);
    setPhase('deciding');
  }

  function handleDecisionChoice(idx: number) {
    if (!activeDecision || !selectedChallenge) return;
    const choice = activeDecision.choices[idx];
    const newCap    = Math.max(0, capSpace + choice.capDelta);
    const newPicks  = Math.max(0, draftPicks + choice.pickDelta);
    const newRating = Math.max(40, Math.min(99, teamRating + choice.ratingDelta));
    const newMorale = Math.max(-10, Math.min(10, morale + choice.moraleDelta));
    setCapSpace(newCap); setDraftPicks(newPicks); setTeamRating(newRating); setMorale(newMorale);
    setDecisionHistory(prev => [...prev, `Year ${currentYear} R${decisionRound}: ${choice.effect}`]);
    const nextRound = decisionRound + 1;
    if (nextRound <= 3) {
      const nextDecision = DECISIONS_BY_ROUND[nextRound - 1][(currentYear - 1) % DECISIONS_BY_ROUND[nextRound - 1].length];
      setActiveDecision(nextDecision);
      setDecisionRound(nextRound);
    } else {
      setPhase('simming');
      const result = simYear(currentYear, newRating, selectedChallenge, newMorale);
      setSimResult(result);
    }
  }

  function handleAdvanceYear() {
    if (!simResult || !selectedChallenge) return;
    const newResults = [...yearResults, simResult];
    setYearResults(newResults);
    setSimResult(null); setDecisionRound(0); setActiveDecision(null);
    const nextYear = currentYear + 1;
    if (nextYear > 10) {
      const { score, tier } = scoreRebuild(newResults);
      const champYears = newResults.filter(r => r.playoffResult === 'CHAMPION');
      const entry: LeaderboardEntry = {
        id: Date.now().toString(),
        challengeId: selectedChallenge.id,
        teamName: selectedChallenge.name,
        finalRecord: `${newResults[newResults.length - 1].wins}-${newResults[newResults.length - 1].losses}`,
        yearsToFirstChampionship: champYears.length > 0 ? champYears[0].year : null,
        totalChampionships: champYears.length,
        score, tier, date: Date.now(),
      };
      const newBoard = [entry, ...leaderboard].sort((a, b) => b.score - a.score).slice(0, 20);
      setLeaderboard(newBoard); saveLeaderboard(newBoard); setPhase('done');
    } else {
      setCurrentYear(nextYear);
      setDraftPicks(prev => prev + 7);
      setPhase('active');
    }
  }

  const { score: currentScore, tier: currentTier } = scoreRebuild(yearResults);

  // ─── Setup Screen ─────────────────────────────────────────────────────────

  if (phase === 'setup') {
    return (
      <AppShell backTo="/game" title="Rebuild Challenge" maxWidth={960}>
        {/* Hero */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', color: C.gold, marginBottom: 6 }}>
            FRANCHISE MODE
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: C.txt, margin: '0 0 8px', letterSpacing: '-.02em' }}>
            Rebuild Challenge
          </h1>
          <p style={{ color: C.txtSub, fontSize: 14, margin: 0 }}>
            Start from the bottom. Build a dynasty. 10 years, countless decisions.
          </p>
        </div>

        {/* Challenge grid */}
        <SectionHead sub="Choose your starting scenario">Select Challenge</SectionHead>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14, marginBottom: 28 }}>
          {CHALLENGES.map(c => {
            const accent = difficultyAccent(c.difficulty);
            const selected = selectedChallenge?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedChallenge(c)}
                style={{
                  position: 'relative', background: C.surface,
                  border: `1px solid ${selected ? accent : C.border}`,
                  borderRadius: 14, padding: '20px 20px 18px',
                  cursor: 'pointer', overflow: 'hidden',
                  transition: 'border-color 160ms, box-shadow 160ms, transform 160ms',
                  transform: selected ? 'translateY(-2px)' : 'none',
                  boxShadow: selected ? `0 0 24px -6px ${accent}50` : 'none',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = accent; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = selected ? accent : C.border; }}
              >
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${accent}0D 0%, transparent 50%)`, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${accent}, transparent)` }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{c.emoji}</span>
                    <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: '.04em', color: C.txt }}>{c.name}</span>
                  </div>
                  <Badge color={accent}>{c.difficulty}</Badge>
                </div>

                <p style={{ fontSize: 12, color: C.txt, margin: '0 0 4px', fontWeight: 500 }}>{c.description}</p>
                <p style={{ fontSize: 11, color: C.txtSub, fontStyle: 'italic', margin: '0 0 12px' }}>"{c.flavor}"</p>

                <div style={{ display: 'flex', gap: 14, fontSize: 11, color: C.txtSub }}>
                  <span>Start: <strong style={{ color: C.txt }}>{c.startRecord}</strong></span>
                  <span>Cap: <strong style={{ color: C.green }}>${c.startCap}M</strong></span>
                  <span>Picks: <strong style={{ color: C.blueBright }}>{c.startPicks}</strong></span>
                </div>

                {c.modifier && (
                  <div style={{
                    marginTop: 10, fontSize: 11, color: C.red,
                    background: C.redSub, borderRadius: 6, padding: '5px 10px',
                    border: `1px solid ${C.red}30`,
                  }}>
                    ⚠ {c.modifier}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Btn
          onClick={handleStartRebuild}
          disabled={!selectedChallenge}
          size="lg"
          style={{ width: '100%', marginBottom: 36 }}
        >
          {selectedChallenge ? `BEGIN REBUILD: ${selectedChallenge.name} →` : 'SELECT A CHALLENGE'}
        </Btn>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div>
            <SectionHead sub="Your best rebuild runs">Past Attempts</SectionHead>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 100px 120px 110px 90px',
                gap: 8, padding: '10px 16px',
                borderBottom: `1px solid ${C.border}`,
                fontSize: 9, fontWeight: 800, letterSpacing: '.14em', color: C.txtMuted,
              }}>
                <span>TEAM</span><span>RECORD</span><span>YRS TO TITLE</span><span>RINGS</span><span>SCORE</span>
              </div>
              {leaderboard.slice(0, 8).map((e, i) => (
                <div key={e.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 100px 120px 110px 90px',
                  gap: 8, padding: '10px 16px',
                  borderBottom: `1px solid ${C.border}`,
                  background: i % 2 === 0 ? 'transparent' : `${C.border}20`,
                  fontSize: 13,
                }}>
                  <span style={{ fontWeight: 700, color: C.txt }}>{e.teamName}</span>
                  <span style={{ color: C.txtSub }}>{e.finalRecord}</span>
                  <span style={{ color: C.txtSub }}>{e.yearsToFirstChampionship ?? '—'}</span>
                  <span style={{ color: C.gold, fontWeight: 700 }}>{e.totalChampionships}x</span>
                  <span style={{ fontWeight: 900, color: tierColor(e.tier) }}>{e.tier} — {e.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </AppShell>
    );
  }

  // ─── Active Rebuild ────────────────────────────────────────────────────────

  if (!selectedChallenge) return null;

  return (
    <AppShell backTo="/game" title="Rebuild Challenge" maxWidth={960}>
      {/* Status bar */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
        padding: '16px 20px', marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 26 }}>{selectedChallenge.emoji}</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.16em', color: C.txtMuted }}>{selectedChallenge.name}</div>
            <div style={{ fontWeight: 900, fontSize: 18, color: C.txt }}>Year {currentYear} / 10</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', color: C.txtMuted }}>RATING</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: teamRating >= 80 ? C.green : teamRating >= 65 ? C.gold : C.red }}>{teamRating}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', color: C.txtMuted }}>CAP</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.green }}>${capSpace}M</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', color: C.txtMuted }}>PICKS</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.blueBright }}>{draftPicks}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', color: C.txtMuted }}>MORALE</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: morale > 0 ? C.green : morale < 0 ? C.red : C.txtSub }}>
              {morale > 0 ? '+' : ''}{morale}
            </div>
          </div>
        </div>
      </div>

      {/* Year progress track */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.16em', color: C.txtMuted, marginBottom: 14 }}>REBUILD TIMELINE</div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map(yr => {
            const result = yearResults.find(r => r.year === yr);
            const isCurrent = yr === currentYear;
            const accent = result?.playoffResult === 'CHAMPION' ? C.gold
              : result ? C.green
              : isCurrent ? C.blueBright
              : C.border;
            return (
              <div key={yr} style={{
                flex: '1 0 60px', borderRadius: 10, padding: '8px 4px',
                textAlign: 'center', fontSize: 10,
                background: result?.playoffResult === 'CHAMPION' ? C.goldSub
                  : result ? C.greenSub
                  : isCurrent ? C.blueSub
                  : 'transparent',
                border: `1px solid ${accent}`,
                fontWeight: 700, color: accent,
              }}>
                <div>Yr {yr}</div>
                {result ? (
                  <>
                    <div style={{ fontSize: 11 }}>{result.wins}-{result.losses}</div>
                    <div style={{ fontSize: 9, opacity: 0.8 }}>{result.playoffResult ?? '—'}</div>
                  </>
                ) : isCurrent ? (
                  <div style={{ fontSize: 9, opacity: 0.7 }}>NOW</div>
                ) : (
                  <div style={{ fontSize: 11 }}>—</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Objectives */}
      <div style={{ marginBottom: 20 }}>
        <SectionHead>Objectives</SectionHead>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {YEAR_OBJECTIVES.map(obj => {
            const st = objectiveStatus(obj, currentYear, yearResults);
            const accent = st === 'completed' ? C.green : st === 'in_progress' ? C.gold : st === 'failed' ? C.red : C.border;
            return (
              <div key={obj.year} style={{
                background: C.panel, border: `1px solid ${accent}`,
                borderRadius: 10, padding: '10px 12px', fontSize: 11,
                opacity: st === 'locked' ? 0.4 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span>{st === 'completed' ? '✅' : st === 'in_progress' ? '⚡' : st === 'failed' ? '❌' : '🔒'}</span>
                  <span style={{ fontWeight: 800, color: accent }}>Year {obj.year}</span>
                </div>
                <div style={{ color: C.txtSub, lineHeight: 1.4 }}>{obj.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Season history */}
      {yearResults.length > 0 && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
          <SectionHead>Season History</SectionHead>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {yearResults.map(r => (
              <div key={r.year} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0',
                borderBottom: `1px solid ${C.border}`, fontSize: 13,
              }}>
                <span style={{ color: C.txtMuted, minWidth: 60, fontWeight: 700 }}>Year {r.year}</span>
                <span style={{ fontWeight: 900, color: C.txt, minWidth: 52 }}>{r.wins}-{r.losses}</span>
                <div style={{
                  fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6,
                  background: r.playoffResult === 'CHAMPION' ? C.goldSub : r.playoffResult ? C.blueSub : 'transparent',
                  color: r.playoffResult === 'CHAMPION' ? C.gold : r.playoffResult ? C.blueBright : C.txtMuted,
                  border: `1px solid ${r.playoffResult === 'CHAMPION' ? `${C.gold}40` : r.playoffResult ? `${C.blueBright}30` : C.border}`,
                }}>
                  {r.playoffResult ?? 'MISSED PLAYOFFS'}
                </div>
                <span style={{ fontSize: 11, color: C.txtSub, display: 'none', flex: 1 }} className="sm-show">{r.keyEvent}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision / Sim panels */}
      <AnimatePresence mode="wait">
        {phase === 'deciding' && activeDecision && (
          <motion.div
            key={`decision-${decisionRound}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{
              background: C.surface, border: `1px solid ${C.amber}`,
              borderRadius: 14, padding: '20px 20px', marginBottom: 20,
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.amber}08 0%, transparent 50%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.amber}, transparent)` }} />
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: C.amber, marginBottom: 12 }}>
              DECISION {decisionRound} / 3 — YEAR {currentYear}
            </div>
            <p style={{ fontWeight: 700, fontSize: 16, color: C.txt, margin: '0 0 16px', lineHeight: 1.45 }}>{activeDecision.prompt}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeDecision.choices.map((choice, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleDecisionChoice(idx)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: C.panel, border: `1px solid ${C.border}`,
                    borderRadius: 10, padding: '14px 16px', cursor: 'pointer',
                    textAlign: 'left', color: C.txt, transition: 'border-color 140ms',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.blueBright; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ color: C.blueBright, fontWeight: 900, fontSize: 13, minWidth: 20 }}>
                      {String.fromCharCode(65 + idx)})
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.txt, marginBottom: 6 }}>{choice.label}</div>
                      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        {choice.capDelta !== 0 && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: choice.capDelta > 0 ? C.green : C.red }}>
                            Cap: {choice.capDelta > 0 ? '+' : ''}{choice.capDelta}M
                          </span>
                        )}
                        {choice.pickDelta !== 0 && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: choice.pickDelta > 0 ? C.blueBright : C.amber }}>
                            Picks: {choice.pickDelta > 0 ? '+' : ''}{choice.pickDelta}
                          </span>
                        )}
                        {choice.ratingDelta !== 0 && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: choice.ratingDelta > 0 ? C.green : C.red }}>
                            Rating: {choice.ratingDelta > 0 ? '+' : ''}{choice.ratingDelta}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'simming' && simResult && (
          <motion.div
            key="simming"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{
              background: C.surface, border: `1px solid ${C.blueBright}`,
              borderRadius: 14, padding: '28px 24px', textAlign: 'center', marginBottom: 20,
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${C.blueSub} 0%, transparent 60%)`, pointerEvents: 'none' }} />
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.18em', color: C.blueBright, marginBottom: 10 }}>
              YEAR {currentYear} RESULTS
            </div>
            <div style={{ fontSize: 52, fontWeight: 900, color: C.txt, letterSpacing: '-.02em', marginBottom: 8 }}>
              {simResult.wins} — {simResult.losses}
            </div>
            {simResult.playoffResult ? (
              <div style={{
                display: 'inline-block', marginBottom: 14, padding: '6px 18px', borderRadius: 20,
                background: simResult.playoffResult === 'CHAMPION' ? C.goldSub : C.blueSub,
                border: `1px solid ${simResult.playoffResult === 'CHAMPION' ? `${C.gold}50` : `${C.blueBright}40`}`,
                color: simResult.playoffResult === 'CHAMPION' ? C.gold : C.blueBright,
                fontWeight: 800, fontSize: 13, letterSpacing: '.06em',
              }}>
                {simResult.playoffResult === 'CHAMPION' ? 'SUPER BOWL CHAMPIONS' : `PLAYOFFS: ${simResult.playoffResult}`}
              </div>
            ) : (
              <div style={{ color: C.txtSub, marginBottom: 14, fontSize: 13 }}>Missed the playoffs</div>
            )}
            <p style={{ color: C.txtSub, fontSize: 13, fontStyle: 'italic', marginBottom: 20 }}>"{simResult.keyEvent}"</p>
            <Btn onClick={handleAdvanceYear} size="lg">
              {currentYear < 10 ? `ADVANCE TO YEAR ${currentYear + 1} →` : 'COMPLETE REBUILD →'}
            </Btn>
          </motion.div>
        )}

        {phase === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginBottom: 20 }}
          >
            <Btn onClick={handleBeginDecisions} size="lg" style={{ minWidth: 320 }}>
              SIMULATE YEAR {currentYear} →
            </Btn>
            <p style={{ fontSize: 11, color: C.txtMuted, marginTop: 8 }}>Make 3 key decisions before the season simulates</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decision history log */}
      {decisionHistory.length > 0 && (
        <div style={{
          background: C.panel, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: '14px 16px', marginBottom: 20,
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.16em', color: C.txtMuted, marginBottom: 8 }}>DECISION LOG</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {decisionHistory.map((d, i) => (
              <div key={i} style={{ fontSize: 12, color: C.txtSub }}>› {d}</div>
            ))}
          </div>
        </div>
      )}

      {/* Done screen */}
      {phase === 'done' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            background: C.surface, border: `2px solid ${C.gold}`,
            borderRadius: 20, padding: '40px 28px', textAlign: 'center',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${C.goldSub} 0%, transparent 60%)`, pointerEvents: 'none' }} />
          <h2 style={{ fontSize: 28, fontWeight: 900, color: C.txt, margin: '0 0 8px' }}>REBUILD COMPLETE</h2>
          <div style={{ fontSize: 64, fontWeight: 900, color: tierColor(currentTier), letterSpacing: '-.02em', lineHeight: 1 }}>{currentTier}</div>
          <div style={{ fontSize: 20, color: C.txtSub, marginBottom: 24 }}>{currentScore} pts</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
            <StatTile
              n={`${yearResults.filter(r => r.playoffResult === 'CHAMPION').length}x`}
              label="Championships"
              accent={C.gold}
            />
            <StatTile
              n={yearResults.filter(r => r.playoffResult && r.playoffResult !== 'WC').length}
              label="Playoff Wins"
              accent={C.blueBright}
            />
            <StatTile
              n={yearResults.reduce((s, r) => s + r.wins, 0)}
              label="Total Wins"
              accent={C.green}
            />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Btn onClick={() => { setPhase('setup'); setYearResults([]); setSelectedChallenge(null); }}>
              New Rebuild
            </Btn>
            <Btn variant="ghost" onClick={() => navigate('/game')}>Game Modes</Btn>
          </div>
        </motion.div>
      )}
    </AppShell>
  );
}
