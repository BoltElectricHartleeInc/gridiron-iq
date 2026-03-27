import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RebuildChallenge {
  id: string;
  name: string;
  emoji: string;
  difficulty: 'Medium' | 'Medium-Hard' | 'Hard' | 'Extreme' | 'Nightmare';
  description: string;
  flavor: string;
  startRecord: string;
  startCap: number; // millions
  startPicks: number;
  faInterestModifier: number; // -15 = hard to attract FA
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
  // Round 1 options per year (cycling)
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
  // Round 2 options per year
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
  // Round 3 options per year
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

function difficultyColor(d: string): string {
  switch (d) {
    case 'Medium':       return 'text-green-400 border-green-700 bg-green-950';
    case 'Medium-Hard':  return 'text-yellow-400 border-yellow-700 bg-yellow-950';
    case 'Hard':         return 'text-orange-400 border-orange-700 bg-orange-950';
    case 'Extreme':      return 'text-red-400 border-red-700 bg-red-950';
    case 'Nightmare':    return 'text-purple-400 border-purple-700 bg-purple-950';
    default:             return 'text-gray-400 border-gray-700 bg-gray-950';
  }
}

function objectiveStatus(obj: YearObjective, currentYear: number, results: YearResult[]): ObjectiveStatus {
  const completedYear = results.find(r => r.year === obj.year);
  if (completedYear) {
    const passed = checkObjective(obj, completedYear);
    return passed ? 'completed' : 'failed';
  }
  if (obj.year === currentYear) return 'in_progress';
  if (obj.year > currentYear)   return 'locked';
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
    if (r.playoffResult === 'WC')          score += 30;
    if (r.playoffResult === 'DIV')         score += 50;
    if (r.playoffResult === 'CONF')        score += 80;
    if (r.playoffResult === 'SB_LOSS')     score += 100;
    if (r.playoffResult === 'CHAMPION')    score += 200;
  }
  const tier = score >= 800 ? 'S' : score >= 600 ? 'A' : score >= 400 ? 'B' : score >= 200 ? 'C' : 'D';
  return { score, tier };
}

function tierColor(tier: string): string {
  switch (tier) {
    case 'S': return 'text-yellow-300';
    case 'A': return 'text-green-400';
    case 'B': return 'text-blue-400';
    case 'C': return 'text-gray-300';
    default:  return 'text-gray-500';
  }
}

function simYear(
  year: number,
  teamRating: number,
  challenge: RebuildChallenge,
  morale: number,
): YearResult {
  const effectiveRating = Math.max(30, Math.min(99, teamRating + morale * 0.3));
  const winChance = 0.20 + (effectiveRating / 99) * 0.60;

  let wins = 0;
  for (let g = 0; g < 17; g++) {
    if (Math.random() < winChance) wins++;
  }

  // Year 1 Browns QB injury modifier
  if (challenge.id === 'browns' && year === 1) {
    wins = Math.max(0, wins - 3);
  }

  const losses = 17 - wins;

  // Playoff determination
  let playoffResult: string | null = null;
  const playoffChance = wins >= 11 ? 0.95 : wins >= 9 ? 0.70 : wins >= 7 ? 0.35 : 0.05;
  if (Math.random() < playoffChance) {
    const roll = Math.random();
    if (roll < 0.35)       playoffResult = 'WC';
    else if (roll < 0.60)  playoffResult = 'DIV';
    else if (roll < 0.80)  playoffResult = 'CONF';
    else if (roll < 0.92)  playoffResult = 'SB_LOSS';
    else                   playoffResult = 'CHAMPION';
  }

  const events: string[] = [
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
  const keyEvent = events[Math.floor(Math.random() * events.length)];

  return { year, wins, losses, playoffResult, keyEvent };
}

// ─── Leaderboard (localStorage) ───────────────────────────────────────────────

const LB_KEY = 'rebuild_leaderboard';

function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLeaderboard(entries: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(LB_KEY, JSON.stringify(entries));
  } catch { /* ignore */ }
}

// ─── Components ───────────────────────────────────────────────────────────────

interface ChallengeCardProps {
  challenge: RebuildChallenge;
  selected: boolean;
  onSelect: () => void;
}

function ChallengeCard({ challenge, selected, onSelect }: ChallengeCardProps) {
  return (
    <motion.div
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
        selected
          ? 'border-blue-500 bg-blue-950/30'
          : 'border-gray-700 bg-gray-900 hover:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-2xl mr-2">{challenge.emoji}</span>
          <span className="font-black text-sm tracking-wider">{challenge.name}</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${difficultyColor(challenge.difficulty)}`}>
          {challenge.difficulty.toUpperCase()}
        </span>
      </div>
      <p className="text-gray-300 text-xs mb-1">{challenge.description}</p>
      <p className="text-gray-500 text-xs italic mb-3">"{challenge.flavor}"</p>
      <div className="flex gap-3 text-xs text-gray-500">
        <span>Start: {challenge.startRecord}</span>
        <span>Cap: ${challenge.startCap}M</span>
        <span>Picks: {challenge.startPicks}</span>
      </div>
      {challenge.modifier && (
        <div className="mt-2 text-xs text-red-400 bg-red-950/30 rounded px-2 py-1">
          ⚠ {challenge.modifier}
        </div>
      )}
    </motion.div>
  );
}

function ObjectivePill({ status, label, year }: { status: ObjectiveStatus; label: string; year: number }) {
  const style = {
    locked:      'bg-gray-800 border-gray-700 text-gray-600',
    in_progress: 'bg-yellow-950 border-yellow-600 text-yellow-300 animate-pulse',
    completed:   'bg-green-950 border-green-600 text-green-300',
    failed:      'bg-red-950 border-red-700 text-red-400',
  }[status];

  const icon = {
    locked:      '🔒',
    in_progress: '⚡',
    completed:   '✅',
    failed:      '❌',
  }[status];

  return (
    <div className={`rounded-lg border px-3 py-2 text-xs ${style}`}>
      <div className="flex items-center gap-1.5">
        <span>{icon}</span>
        <span className="font-bold">Year {year}</span>
      </div>
      <div className="mt-0.5 text-xs opacity-80">{label}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Phase = 'setup' | 'active' | 'deciding' | 'simming' | 'done';

export function RebuildChallengePage() {
  const navigate = useNavigate();

  // Setup state
  const [selectedChallenge, setSelectedChallenge] = useState<RebuildChallenge | null>(null);
  const [phase, setPhase]     = useState<Phase>('setup');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(loadLeaderboard);

  // Active rebuild state
  const [currentYear,   setCurrentYear]   = useState(1);
  const [teamRating,    setTeamRating]     = useState(55);
  const [capSpace,      setCapSpace]       = useState(0);
  const [draftPicks,    setDraftPicks]     = useState(0);
  const [morale,        setMorale]         = useState(0);
  const [yearResults,   setYearResults]    = useState<YearResult[]>([]);

  // Decision state
  const [decisionRound,  setDecisionRound]  = useState(0);
  const [activeDecision, setActiveDecision] = useState<Decision | null>(null);
  const [decisionHistory, setDecisionHistory] = useState<string[]>([]);

  // Sim state
  const [simResult, setSimResult] = useState<YearResult | null>(null);

  function handleStartRebuild() {
    if (!selectedChallenge) return;
    setTeamRating(
      selectedChallenge.id === 'window_now' ? 82
        : selectedChallenge.id === 'underdog' ? 68
        : selectedChallenge.id === 'small_market' ? 62
        : selectedChallenge.id === 'teardown' ? 45
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

    setCapSpace(newCap);
    setDraftPicks(newPicks);
    setTeamRating(newRating);
    setMorale(newMorale);
    setDecisionHistory(prev => [...prev, `Year ${currentYear} R${decisionRound}: ${choice.effect}`]);

    const nextRound = decisionRound + 1;
    if (nextRound <= 3) {
      const nextDecision = DECISIONS_BY_ROUND[nextRound - 1][(currentYear - 1) % DECISIONS_BY_ROUND[nextRound - 1].length];
      setActiveDecision(nextDecision);
      setDecisionRound(nextRound);
    } else {
      // All 3 decisions made — simulate the year
      setPhase('simming');
      const result = simYear(currentYear, newRating, selectedChallenge, newMorale);
      setSimResult(result);
    }
  }

  function handleAdvanceYear() {
    if (!simResult || !selectedChallenge) return;
    const newResults = [...yearResults, simResult];
    setYearResults(newResults);
    setSimResult(null);
    setDecisionRound(0);
    setActiveDecision(null);

    const nextYear = currentYear + 1;
    if (nextYear > 10) {
      // Rebuild complete
      const { score, tier } = scoreRebuild(newResults);
      const champYears = newResults.filter(r => r.playoffResult === 'CHAMPION');
      const firstChamp = champYears.length > 0 ? champYears[0].year : null;

      const entry: LeaderboardEntry = {
        id: Date.now().toString(),
        challengeId: selectedChallenge.id,
        teamName: selectedChallenge.name,
        finalRecord: `${newResults[newResults.length - 1].wins}-${newResults[newResults.length - 1].losses}`,
        yearsToFirstChampionship: firstChamp,
        totalChampionships: champYears.length,
        score,
        tier,
        date: Date.now(),
      };

      const newBoard = [entry, ...leaderboard].sort((a, b) => b.score - a.score).slice(0, 20);
      setLeaderboard(newBoard);
      saveLeaderboard(newBoard);
      setPhase('done');
    } else {
      setCurrentYear(nextYear);
      // Add draft picks at start of each year
      setDraftPicks(prev => prev + 7);
      setPhase('active');
    }
  }

  // ─── Setup Screen ─────────────────────────────────────────────────────────

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-6 text-center">
          <h1 className="text-4xl font-black tracking-widest mb-1">REBUILD CHALLENGE</h1>
          <p className="text-gray-400 text-sm">Start from the bottom. Build a dynasty.</p>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Challenge selection */}
          <div>
            <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Select Your Challenge</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHALLENGES.map(c => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  selected={selectedChallenge?.id === c.id}
                  onSelect={() => setSelectedChallenge(c)}
                />
              ))}
            </div>
          </div>

          <motion.button
            onClick={handleStartRebuild}
            disabled={!selectedChallenge}
            whileTap={{ scale: 0.97 }}
            className={`w-full py-4 rounded-xl font-black tracking-widest text-lg transition ${
              selectedChallenge
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            {selectedChallenge ? `BEGIN REBUILD: ${selectedChallenge.name}` : 'SELECT A CHALLENGE'}
          </motion.button>

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div>
              <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Past Rebuild Attempts</h2>
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="grid grid-cols-5 text-xs text-gray-500 uppercase tracking-wider px-4 py-2 border-b border-gray-800">
                  <span>Team</span>
                  <span>Final Record</span>
                  <span>Yrs to 1st Title</span>
                  <span>Championships</span>
                  <span>Score</span>
                </div>
                {leaderboard.slice(0, 8).map((e, i) => (
                  <div
                    key={e.id}
                    className={`grid grid-cols-5 text-sm px-4 py-2 ${i % 2 === 0 ? 'bg-gray-850' : 'bg-gray-900'}`}
                  >
                    <span className="text-white font-bold truncate">{e.teamName}</span>
                    <span className="text-gray-300">{e.finalRecord}</span>
                    <span className="text-gray-300">{e.yearsToFirstChampionship ?? '—'}</span>
                    <span className="text-yellow-400 font-bold">{e.totalChampionships}x 🏆</span>
                    <span className={`font-black ${tierColor(e.tier)}`}>{e.tier} — {e.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/game')}
            className="text-xs text-gray-600 hover:text-gray-400 transition"
          >
            ← Back to Game Modes
          </button>
        </div>
      </div>
    );
  }

  // ─── Active Rebuild ────────────────────────────────────────────────────────

  if (!selectedChallenge) return null;

  const { score: currentScore, tier: currentTier } = scoreRebuild(yearResults);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Status Bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">{selectedChallenge.emoji}</span>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">{selectedChallenge.name}</div>
              <div className="font-black text-sm">Year {currentYear} / 10</div>
            </div>
          </div>
          <div className="flex gap-6 text-xs">
            <div>
              <div className="text-gray-500 uppercase tracking-widest">Team Rating</div>
              <div className="font-black text-white text-lg">{teamRating}</div>
            </div>
            <div>
              <div className="text-gray-500 uppercase tracking-widest">Cap Space</div>
              <div className="font-black text-green-400 text-lg">${capSpace}M</div>
            </div>
            <div>
              <div className="text-gray-500 uppercase tracking-widest">Draft Picks</div>
              <div className="font-black text-blue-400 text-lg">{draftPicks}</div>
            </div>
            <div>
              <div className="text-gray-500 uppercase tracking-widest">Morale</div>
              <div className={`font-black text-lg ${morale > 0 ? 'text-green-400' : morale < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {morale > 0 ? '+' : ''}{morale}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Progress Tracker */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Rebuild Progress</div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(yr => {
              const result = yearResults.find(r => r.year === yr);
              const isCurrent = yr === currentYear;
              return (
                <div
                  key={yr}
                  className={`flex-1 min-w-[64px] rounded-lg p-2 text-center text-xs border transition-all ${
                    result
                      ? result.playoffResult === 'CHAMPION'
                        ? 'bg-yellow-950 border-yellow-500 text-yellow-300'
                        : 'bg-green-950/40 border-green-800 text-green-300'
                      : isCurrent
                      ? 'bg-blue-950/40 border-blue-600 text-blue-300 ring-1 ring-blue-500'
                      : 'bg-gray-800 border-gray-700 text-gray-600'
                  }`}
                >
                  <div className="font-bold">Yr {yr}</div>
                  {result ? (
                    <>
                      <div>{result.wins}-{result.losses}</div>
                      <div className="text-xs opacity-70">{result.playoffResult ?? '—'}</div>
                    </>
                  ) : isCurrent ? (
                    <div className="text-xs animate-pulse">IN PROGRESS</div>
                  ) : (
                    <div className="text-xs">🔒</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Objectives */}
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-3">Objectives</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {YEAR_OBJECTIVES.map(obj => (
              <ObjectivePill
                key={obj.year}
                status={objectiveStatus(obj, currentYear, yearResults)}
                label={obj.label}
                year={obj.year}
              />
            ))}
          </div>
        </div>

        {/* Past results summary */}
        {yearResults.length > 0 && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-3">Season History</div>
            <div className="space-y-2">
              {yearResults.map(r => (
                <div key={r.year} className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500 min-w-[50px]">Year {r.year}</span>
                  <span className="font-bold text-white min-w-[48px]">{r.wins}-{r.losses}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    r.playoffResult === 'CHAMPION' ? 'bg-yellow-600 text-white'
                    : r.playoffResult ? 'bg-blue-800 text-blue-200'
                    : 'bg-gray-800 text-gray-500'
                  }`}>
                    {r.playoffResult ?? 'Missed Playoffs'}
                  </span>
                  <span className="text-xs text-gray-500 hidden sm:block">{r.keyEvent}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decision Panel */}
        <AnimatePresence mode="wait">
          {phase === 'deciding' && activeDecision && (
            <motion.div
              key={`decision-${decisionRound}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-900 rounded-xl border border-yellow-700 p-5"
            >
              <div className="text-xs text-yellow-500 uppercase tracking-widest mb-3">
                Decision Round {decisionRound} / 3
              </div>
              <p className="font-bold text-white mb-4">{activeDecision.prompt}</p>
              <div className="space-y-2">
                {activeDecision.choices.map((choice, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleDecisionChoice(idx)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left p-3 rounded-lg bg-gray-800 border border-gray-700 hover:border-blue-600 hover:bg-gray-750 transition"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-blue-400 font-black min-w-[18px]">{String.fromCharCode(65 + idx)})</span>
                      <div>
                        <div className="text-sm text-white font-semibold">{choice.label}</div>
                        <div className="flex gap-3 mt-1 text-xs text-gray-500">
                          {choice.capDelta !== 0 && (
                            <span className={choice.capDelta > 0 ? 'text-green-400' : 'text-red-400'}>
                              Cap: {choice.capDelta > 0 ? '+' : ''}{choice.capDelta}M
                            </span>
                          )}
                          {choice.pickDelta !== 0 && (
                            <span className={choice.pickDelta > 0 ? 'text-blue-400' : 'text-orange-400'}>
                              Picks: {choice.pickDelta > 0 ? '+' : ''}{choice.pickDelta}
                            </span>
                          )}
                          {choice.ratingDelta !== 0 && (
                            <span className={choice.ratingDelta > 0 ? 'text-green-400' : 'text-red-400'}>
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gray-900 rounded-xl border border-blue-700 p-6 text-center"
            >
              <div className="text-xs text-blue-400 uppercase tracking-widest mb-2">Year {currentYear} Results</div>
              <div className="text-5xl font-black mb-1">
                {simResult.wins} — {simResult.losses}
              </div>
              {simResult.playoffResult && (
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-3 ${
                  simResult.playoffResult === 'CHAMPION'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-blue-700 text-white'
                }`}>
                  {simResult.playoffResult === 'CHAMPION' ? '🏆 SUPER BOWL CHAMPIONS' : `Playoffs: ${simResult.playoffResult}`}
                </div>
              )}
              {!simResult.playoffResult && (
                <div className="text-gray-500 text-sm mb-3">Missed the playoffs</div>
              )}
              <p className="text-gray-400 text-sm italic mb-4">"{simResult.keyEvent}"</p>
              <motion.button
                onClick={handleAdvanceYear}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black tracking-wider text-sm transition"
              >
                {currentYear < 10 ? `ADVANCE TO YEAR ${currentYear + 1} →` : 'COMPLETE REBUILD →'}
              </motion.button>
            </motion.div>
          )}

          {phase === 'active' && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.button
                onClick={handleBeginDecisions}
                whileTap={{ scale: 0.97 }}
                className="w-full max-w-sm mx-auto block py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black tracking-widest text-lg transition"
              >
                SIMULATE YEAR {currentYear} →
              </motion.button>
              <p className="text-xs text-gray-600 mt-2">Make 3 key decisions before the season simulates</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decision history */}
        {decisionHistory.length > 0 && (
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-600 uppercase tracking-widest mb-2">Decision Log</div>
            <div className="space-y-1">
              {decisionHistory.map((d, i) => (
                <div key={i} className="text-xs text-gray-500">› {d}</div>
              ))}
            </div>
          </div>
        )}

        {/* Done screen */}
        {phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-2xl border border-yellow-600 p-8 text-center"
          >
            <h2 className="text-3xl font-black mb-2">REBUILD COMPLETE</h2>
            <div className={`text-6xl font-black mb-1 ${tierColor(currentTier)}`}>{currentTier}-TIER</div>
            <div className="text-2xl text-gray-300 mb-4">{currentScore} pts</div>
            <div className="flex gap-6 justify-center mb-6">
              <div>
                <div className="text-xs text-gray-500 uppercase">Championships</div>
                <div className="text-2xl font-black text-yellow-400">
                  {yearResults.filter(r => r.playoffResult === 'CHAMPION').length}x 🏆
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Playoff Wins</div>
                <div className="text-2xl font-black text-blue-400">
                  {yearResults.filter(r => r.playoffResult && r.playoffResult !== 'WC').length}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Total Wins</div>
                <div className="text-2xl font-black text-green-400">
                  {yearResults.reduce((s, r) => s + r.wins, 0)}
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setPhase('setup'); setYearResults([]); setSelectedChallenge(null); }}
                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition"
              >
                New Rebuild
              </button>
              <button
                onClick={() => navigate('/game')}
                className="px-6 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold transition"
              >
                Game Modes
              </button>
            </div>
          </motion.div>
        )}

        <button
          onClick={() => navigate('/game')}
          className="text-xs text-gray-600 hover:text-gray-400 transition"
        >
          ← Back to Game Modes
        </button>
      </div>
    </div>
  );
}
