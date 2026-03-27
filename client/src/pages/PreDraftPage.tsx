import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraftStore } from '../store/draftStore';
import { NFL_TEAMS } from '../data/teams';
import { getPickValue, getPicksValue } from '../data/tradeChart';
import type { NFLTeam } from '../types/draft';

// ── Color palette ─────────────────────────────────────────────────────────────
const S = {
  bg:          '#08090f',
  surface:     '#0d1220',
  elevated:    '#111827',
  card:        '#131f30',
  border:      '#1a2840',
  borderHi:    '#223350',
  txt:         '#d1dce8',
  txtSub:      '#607898',
  txtMuted:    '#2e4060',
  blue:        '#3b7dd8',
  blueSub:     'rgba(59,125,216,0.10)',
  gold:        '#c49a1a',
  goldBright:  '#f59e0b',
  goldSub:     'rgba(196,154,26,0.10)',
  green:       '#16a34a',
  greenBright: '#22c55e',
  greenSub:    'rgba(22,163,74,0.12)',
  red:         '#dc2626',
  redBright:   '#ef4444',
  redSub:      'rgba(220,38,38,0.12)',
  yellow:      '#ca8a04',
  yellowSub:   'rgba(202,138,4,0.12)',
  accent:      '#4f8ef7',
  accentSub:   'rgba(79,142,247,0.10)',
  pulse:       '#22c55e',
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface ActivityItem {
  id: string;
  type: 'trade' | 'rumor' | 'interest' | 'breakdown';
  team1Abbr: string;
  team2Abbr: string;
  picks1: number[];
  picks2: number[];
  value1: number;
  value2: number;
  executed: boolean;
  time: string;
  headline: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getPickLabel(overall: number): string {
  const round = Math.ceil(overall / 32);
  const pick = overall - (round - 1) * 32;
  return `R${round}P${pick} (#${overall})`;
}

function getPickLabelShort(overall: number): string {
  const round = Math.ceil(overall / 32);
  const pick = overall - (round - 1) * 32;
  if (round === 1) return `#${overall}`;
  return `R${round}P${pick}`;
}

function formatTime(): string {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

function marketTemp(trades: number): { label: string; color: string; emoji: string; pct: number } {
  if (trades < 6)  return { label: 'QUIET',  color: S.blue,      emoji: '😴', pct: 15 };
  if (trades < 16) return { label: 'ACTIVE', color: S.gold,      emoji: '📱', pct: 42 };
  if (trades < 31) return { label: 'HECTIC', color: S.redBright, emoji: '🔥', pct: 75 };
  return              { label: 'FRENZY', color: '#ff00ff',    emoji: '💥', pct: 100 };
}

function genHeadline(
  type: ActivityItem['type'],
  t1: string,
  t2: string,
  picks1: number[],
  picks2: number[]
): string {
  const p1 = picks1.map(p => getPickLabelShort(p)).join(', ');
  const p2 = picks2.map(p => getPickLabelShort(p)).join(', ');
  switch (type) {
    case 'trade':
      if (picks1[0] <= 10)
        return `TRADE ALERT: ${t1} sends ${p1} to ${t2} for ${p2}`;
      if (picks1.length > 1)
        return `TRADE: ${t1} packages ${p1} → ${t2} receives ${p2}`;
      return `DEAL DONE: ${t1} and ${t2} swap picks (${p1} for ${p2})`;
    case 'rumor':
      return picks1[0] <= 15
        ? `${t1} and ${t2} in 'advanced discussions' about ${p1}`
        : `${t1} and ${t2} talking — sources say a deal is close`;
    case 'interest':
      return picks1[0] <= 10
        ? `${t1} has 'called everyone' about moving up to ${p1}`
        : `${t1} has called ${t2} about their ${p1} pick`;
    case 'breakdown':
      return picks1[0] <= 15
        ? `⚡ Talks between ${t1} and ${t2} COLLAPSE — ${t1} stays put`
        : `Talks between ${t1} and ${t2} have broken down for now`;
  }
}

// ── Value bar ─────────────────────────────────────────────────────────────────
function ValueBar({ left, right, max }: { left: number; right: number; max: number }) {
  const pctL = max > 0 ? Math.min(100, (left / max) * 100) : 0;
  const pctR = max > 0 ? Math.min(100, (right / max) * 100) : 0;
  const fair = left > 0 && right > 0 && Math.abs(left - right) / Math.max(left, right) < 0.15;
  const userWins = left > 0 && right > left * 1.05;
  const barColor = fair ? S.greenBright : userWins ? S.greenBright : S.redBright;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: S.txtSub, marginBottom: 4 }}>
        <span>You send: <strong style={{ color: left > 0 ? S.txt : S.txtMuted }}>{left} pts</strong></span>
        <span>You receive: <strong style={{ color: right > 0 ? S.txt : S.txtMuted }}>{right} pts</strong></span>
      </div>
      <div style={{ height: 8, background: S.elevated, borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
        <motion.div
          animate={{ width: `${pctL}%` }}
          transition={{ duration: 0.4 }}
          style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: barColor, borderRadius: 4 }}
        />
        <motion.div
          animate={{ width: `${pctR}%` }}
          transition={{ duration: 0.4 }}
          style={{ position: 'absolute', right: 0, top: 0, height: '100%', background: `${barColor}60`, borderRadius: 4 }}
        />
      </div>
      <div style={{ fontSize: 10, marginTop: 4, textAlign: 'center', fontWeight: 700, color: fair ? S.greenBright : userWins ? S.greenBright : S.redBright, minHeight: 14 }}>
        {left === 0 && right === 0 ? '' :
          fair ? '✓ Fair trade' :
          userWins ? '✓ You win this trade' :
          `⚠ You overpay by ${Math.round(Math.abs(right - left))} pts`}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function PreDraftPage() {
  const navigate = useNavigate();
  const { session, acceptTrade } = useDraftStore();

  // User trade state
  const [selectedTeam, setSelectedTeam] = useState<NFLTeam | null>(null);
  const [userSendPicks, setUserSendPicks] = useState<number[]>([]);
  const [theirSendPicks, setTheirSendPicks] = useState<number[]>([]);
  const [tradeResult, setTradeResult] = useState<'accepted' | 'rejected' | null>(null);

  // Activity feed state
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [breakingTrade, setBreakingTrade] = useState<string | null>(null);
  const [totalTradesExecuted, setTotalTradesExecuted] = useState(0);
  const [totalRumors, setTotalRumors] = useState(0);

  const feedRef = useRef<HTMLDivElement>(null);
  const breakingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Use a ref so the timer callback always reads the latest session without re-scheduling
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const isHecticRef = useRef(false);

  // ── AI activity engine ───────────────────────────────────────────────────
  const scheduleNextActivity = useCallback(() => {
    const delay = isHecticRef.current
      ? 1200 + Math.random() * 2300
      : 2000 + Math.random() * 4000;

    activityTimerRef.current = setTimeout(() => {
      const s = sessionRef.current;
      if (!s) { scheduleNextActivity(); return; }

      const allTeams = NFL_TEAMS.filter(t => t.id !== s.userTeamId);
      if (allTeams.length < 2) { scheduleNextActivity(); return; }

      const idx1 = Math.floor(Math.random() * allTeams.length);
      let idx2 = Math.floor(Math.random() * (allTeams.length - 1));
      if (idx2 >= idx1) idx2++;
      const team1 = allTeams[idx1];
      const team2 = allTeams[idx2];

      const t1Picks = s.picks
        .filter(p => p.teamId === team1.id && !p.prospect)
        .map(p => p.overall)
        .sort((a, b) => a - b);
      const t2Picks = s.picks
        .filter(p => p.teamId === team2.id && !p.prospect)
        .map(p => p.overall)
        .sort((a, b) => a - b);

      if (t1Picks.length === 0 || t2Picks.length === 0) {
        scheduleNextActivity();
        return;
      }

      const numP1 = Math.min(1 + Math.floor(Math.random() * 3), t1Picks.length);
      const numP2 = Math.min(1 + Math.floor(Math.random() * 3), t2Picks.length);
      const picks1 = t1Picks.slice(0, numP1);
      const picks2 = t2Picks.slice(0, numP2);
      const value1 = getPicksValue(picks1);
      const value2 = getPicksValue(picks2);

      const valueDiff = Math.abs(value1 - value2) / Math.max(value1, value2, 1);
      const canExecute = valueDiff <= 0.25 && Math.random() < 0.4;

      let type: ActivityItem['type'];
      if (canExecute) {
        type = 'trade';
      } else {
        const r = Math.random();
        type = r < 0.4 ? 'rumor' : r < 0.7 ? 'interest' : 'breakdown';
      }

      const headline = genHeadline(type, team1.abbreviation, team2.abbreviation, picks1, picks2);
      const item: ActivityItem = {
        id: crypto.randomUUID(),
        type,
        team1Abbr: team1.abbreviation,
        team2Abbr: team2.abbreviation,
        picks1,
        picks2,
        value1,
        value2,
        executed: type === 'trade',
        time: formatTime(),
        headline,
      };

      if (type === 'trade') {
        acceptTrade({
          offeringTeamId: team1.id,
          receivingTeamId: team2.id,
          offeringPicks: picks1,
          receivingPicks: picks2,
          jimJohnsonValue: value2 - value1,
        });
        setTotalTradesExecuted(n => {
          const next = n + 1;
          isHecticRef.current = next >= 16;
          return next;
        });

        if (picks1[0] <= 10 || picks2[0] <= 10) {
          setBreakingTrade(headline);
          if (breakingTimerRef.current) clearTimeout(breakingTimerRef.current);
          breakingTimerRef.current = setTimeout(() => setBreakingTrade(null), 3500);
        }
      } else {
        setTotalRumors(n => n + 1);
      }

      setActivityFeed(prev => [item, ...prev].slice(0, 50));
      if (feedRef.current) feedRef.current.scrollTop = 0;

      scheduleNextActivity();
    }, delay);
  }, [acceptTrade]);

  useEffect(() => {
    if (!session) return;
    scheduleNextActivity();
    return () => {
      if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (breakingTimerRef.current) clearTimeout(breakingTimerRef.current);
    };
  }, []);

  if (!session) {
    navigate('/draft/select');
    return null;
  }

  const userTeam = NFL_TEAMS.find(t => t.id === session.userTeamId);

  const userPicksList = session.picks
    .filter(p => p.teamId === session.userTeamId && !p.prospect)
    .map(p => p.overall)
    .sort((a, b) => a - b);

  const getTeamPicks = (teamId: string) =>
    session.picks
      .filter(p => p.teamId === teamId && !p.prospect)
      .map(p => p.overall)
      .sort((a, b) => a - b);

  const handleTeamClick = (team: NFLTeam) => {
    if (team.id === session.userTeamId) return;
    setSelectedTeam(team);
    setUserSendPicks([]);
    setTheirSendPicks([]);
    setTradeResult(null);
  };

  const toggleUserPick = (overall: number) => {
    setUserSendPicks(prev =>
      prev.includes(overall) ? prev.filter(p => p !== overall) : [...prev, overall]
    );
  };

  const toggleTheirPick = (overall: number) => {
    setTheirSendPicks(prev =>
      prev.includes(overall) ? prev.filter(p => p !== overall) : [...prev, overall]
    );
  };

  const handleProposeTrade = () => {
    if (!selectedTeam || userSendPicks.length === 0 || theirSendPicks.length === 0) return;
    const offerValue = getPicksValue(userSendPicks);
    const receiveValue = getPicksValue(theirSendPicks);
    const accepted = receiveValue >= offerValue * 0.9;
    setTradeResult(accepted ? 'accepted' : 'rejected');

    if (accepted) {
      acceptTrade({
        offeringTeamId: session.userTeamId,
        receivingTeamId: selectedTeam.id,
        offeringPicks: userSendPicks,
        receivingPicks: theirSendPicks,
        jimJohnsonValue: receiveValue - offerValue,
      });

      const headline = `YOU TRADED: ${userSendPicks.map(p => getPickLabelShort(p)).join(', ')} → ${selectedTeam.abbreviation} for ${theirSendPicks.map(p => getPickLabelShort(p)).join(', ')}`;
      const item: ActivityItem = {
        id: crypto.randomUUID(),
        type: 'trade',
        team1Abbr: userTeam?.abbreviation ?? 'YOU',
        team2Abbr: selectedTeam.abbreviation,
        picks1: userSendPicks,
        picks2: theirSendPicks,
        value1: offerValue,
        value2: receiveValue,
        executed: true,
        time: formatTime(),
        headline,
      };
      setActivityFeed(prev => [item, ...prev].slice(0, 50));
      setTotalTradesExecuted(n => n + 1);
      setUserSendPicks([]);
      setTheirSendPicks([]);
      setSelectedTeam(null);
    }
  };

  const sendValue = getPicksValue(userSendPicks);
  const receiveValue = getPicksValue(theirSendPicks);
  const maxVal = Math.max(sendValue, receiveValue, 500);
  const temp = marketTemp(totalTradesExecuted);
  const tickerText = activityFeed.map(a => a.headline).join('   ·   ');

  return (
    <div style={{
      minHeight: '100vh',
      background: S.bg,
      color: S.txt,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
    }}>

      {/* ── BREAKING TRADE BANNER ─────────────────────────────────────────── */}
      <AnimatePresence>
        {breakingTrade && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              background: 'linear-gradient(135deg, #7f1d1d, #dc2626)',
              borderBottom: '2px solid #ef4444',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 8px 40px rgba(220,38,38,0.5)',
            }}
          >
            <span style={{ fontSize: 18 }}>🚨</span>
            <span style={{ fontSize: 11, fontWeight: 900, color: '#fca5a5', letterSpacing: '0.2em', textTransform: 'uppercase', flexShrink: 0 }}>
              BREAKING:
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', flex: 1 }}>
              {breakingTrade}
            </span>
            <button
              onClick={() => setBreakingTrade(null)}
              style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0 }}
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SCROLLING TICKER ─────────────────────────────────────────────── */}
      <div style={{
        height: 32,
        background: '#050810',
        borderBottom: `1px solid ${S.border}`,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <style>{`
          @keyframes ticker-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        {/* Left fade + LIVE badge */}
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%', width: 80, zIndex: 2,
          background: 'linear-gradient(90deg, #050810 60%, transparent)',
          display: 'flex', alignItems: 'center', padding: '0 10px',
        }}>
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            style={{ fontSize: 9, fontWeight: 900, color: S.redBright, letterSpacing: '0.15em', whiteSpace: 'nowrap' }}
          >
            ⚡ LIVE
          </motion.span>
        </div>

        {tickerText ? (
          <div style={{
            display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
            paddingLeft: 90,
            animation: 'ticker-scroll 80s linear infinite',
          }}>
            <span style={{ fontSize: 11, color: S.txtSub, paddingRight: 80 }}>{tickerText}</span>
            <span style={{ fontSize: 11, color: S.txtSub, paddingRight: 80 }}>{tickerText}</span>
          </div>
        ) : (
          <span style={{ paddingLeft: 90, fontSize: 11, color: S.txtMuted }}>
            Monitoring phone lines...
          </span>
        )}
      </div>

      {/* ── TOP NAV ───────────────────────────────────────────────────────── */}
      <div style={{
        background: S.surface,
        borderBottom: `1px solid ${S.border}`,
        padding: '0 20px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/draft/select')}
          style={{ background: 'none', border: 'none', color: S.txtSub, cursor: 'pointer', fontSize: 12, flexShrink: 0 }}
        >
          ← Back
        </button>
        <div style={{ width: 1, height: 18, background: S.border, flexShrink: 0 }} />

        <div style={{ fontSize: 13, fontWeight: 900, fontFamily: 'Impact, sans-serif', letterSpacing: '0.08em', color: S.txt, whiteSpace: 'nowrap' }}>
          GridironIQ Pre-Draft War Room
        </div>

        <div style={{ flex: 1 }} />

        {/* Team badge */}
        {userTeam && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: S.elevated, border: `1px solid ${S.border}`,
            borderRadius: 8, padding: '4px 10px', flexShrink: 0,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: userTeam.primaryColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 7, fontWeight: 900, color: userTeam.secondaryColor,
              fontFamily: 'Impact, sans-serif',
            }}>
              {userTeam.abbreviation}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: S.txt }}>{userTeam.city} {userTeam.name}</span>
          </div>
        )}

        {/* Activity badge */}
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
          style={{
            background: totalTradesExecuted > 0 ? `${temp.color}18` : S.elevated,
            border: `1px solid ${totalTradesExecuted > 0 ? temp.color + '50' : S.border}`,
            borderRadius: 8,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 700,
            color: totalTradesExecuted > 0 ? temp.color : S.txtMuted,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            flexShrink: 0,
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: totalTradesExecuted > 0 ? temp.color : S.txtMuted,
            display: 'inline-block',
            boxShadow: totalTradesExecuted > 0 ? `0 0 6px ${temp.color}` : 'none',
          }} />
          {totalTradesExecuted} live trades
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/draft/board')}
          style={{
            background: `linear-gradient(135deg, ${S.accent}, #6366f1)`,
            border: 'none',
            color: '#fff',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.05em',
            flexShrink: 0,
          }}
        >
          Enter Draft Room →
        </motion.button>
      </div>

      {/* ── THREE PANELS ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
        <div style={{
          width: 220,
          flexShrink: 0,
          borderRight: `1px solid ${S.border}`,
          background: S.surface,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}>
          <div style={{ padding: '14px 14px 0' }}>
            <div style={{ fontSize: 10, color: S.txtMuted, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
              Your Picks
            </div>
            {userPicksList.length === 0 ? (
              <div style={{ fontSize: 11, color: S.txtMuted, textAlign: 'center', padding: '20px 0' }}>
                No picks remaining
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {userPicksList.map(overall => {
                  const val = getPickValue(overall);
                  const round = Math.ceil(overall / 32);
                  const isEarly = overall <= 10;
                  return (
                    <div key={overall} style={{
                      background: isEarly ? `${S.gold}18` : S.elevated,
                      border: `1px solid ${isEarly ? S.gold + '50' : S.border}`,
                      borderRadius: 8,
                      padding: '7px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: isEarly ? S.goldBright : S.txt }}>
                          {getPickLabelShort(overall)}
                        </div>
                        <div style={{ fontSize: 9, color: S.txtMuted }}>Round {round}</div>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: isEarly ? S.goldBright : S.txtSub,
                        background: isEarly ? S.goldSub : 'transparent',
                        borderRadius: 4,
                        padding: isEarly ? '2px 5px' : '0',
                      }}>
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* Market temperature */}
          <div style={{ borderTop: `1px solid ${S.border}`, padding: '14px', marginTop: 12 }}>
            <div style={{ fontSize: 10, color: S.txtMuted, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
              Market Temp
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>{temp.emoji}</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: temp.color, fontFamily: 'Impact, sans-serif', letterSpacing: '0.05em' }}>
                {temp.label}
              </span>
            </div>
            <div style={{ height: 8, background: S.elevated, borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
              <motion.div
                animate={{ width: `${temp.pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: `linear-gradient(90deg, ${S.blue}, ${temp.color})`,
                  borderRadius: 4,
                  boxShadow: `0 0 8px ${temp.color}60`,
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: S.txtMuted, marginBottom: 10 }}>
              <span>Quiet</span>
              <span>Frenzy</span>
            </div>
            <div style={{ fontSize: 10, color: S.txtSub, lineHeight: 1.6 }}>
              <div><span style={{ color: S.greenBright, fontWeight: 700 }}>{totalTradesExecuted}</span> trades executed</div>
              <div><span style={{ color: S.yellow, fontWeight: 700 }}>{totalRumors}</span> rumors today</div>
            </div>
          </div>
        </div>

        {/* ── CENTER PANEL ───────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflow: 'auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 10, color: S.txtMuted, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
              {selectedTeam
                ? `Trading with ${selectedTeam.city} ${selectedTeam.name}`
                : 'Select a team to propose a trade'}
            </div>

            {/* Team grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 20 }}>
              {NFL_TEAMS.map(team => {
                const isUser = team.id === session.userTeamId;
                const isSelected = selectedTeam?.id === team.id;
                const picks = getTeamPicks(team.id);
                return (
                  <motion.button
                    key={team.id}
                    whileHover={{ scale: isUser ? 1 : 1.04 }}
                    whileTap={{ scale: isUser ? 1 : 0.96 }}
                    onClick={() => !isUser && handleTeamClick(team)}
                    style={{
                      background: isSelected
                        ? `${team.primaryColor}30`
                        : isUser ? `${team.primaryColor}15`
                        : S.elevated,
                      border: `1px solid ${
                        isSelected ? team.primaryColor + '90'
                        : isUser ? team.primaryColor + '40'
                        : S.border
                      }`,
                      borderRadius: 8,
                      padding: '8px 6px',
                      cursor: isUser ? 'default' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      opacity: isUser ? 0.7 : 1,
                      position: 'relative',
                      transition: 'all 0.12s',
                    }}
                  >
                    {isUser && (
                      <div style={{ position: 'absolute', top: 3, right: 4, fontSize: 7, color: S.goldBright, fontWeight: 700 }}>
                        YOU
                      </div>
                    )}
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: team.primaryColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8, fontWeight: 900, color: team.secondaryColor,
                      fontFamily: 'Impact, sans-serif',
                    }}>
                      {team.abbreviation}
                    </div>
                    <div style={{ fontSize: 9, color: isSelected ? S.txt : S.txtSub, textAlign: 'center', lineHeight: 1.2 }}>
                      {team.abbreviation}
                    </div>
                    <div style={{ fontSize: 8, color: S.txtMuted }}>{picks.length} picks</div>
                  </motion.button>
                );
              })}
            </div>

            {/* Trade builder */}
            <AnimatePresence mode="wait">
              {selectedTeam && (
                <motion.div
                  key={selectedTeam.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: S.card,
                    border: `1px solid ${S.borderHi}`,
                    borderTop: `3px solid ${selectedTeam.primaryColor}`,
                    borderRadius: 12,
                    padding: '18px',
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: selectedTeam.primaryColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 900, color: selectedTeam.secondaryColor,
                      fontFamily: 'Impact, sans-serif',
                    }}>
                      {selectedTeam.abbreviation}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: S.txt }}>
                        {selectedTeam.city} {selectedTeam.name}
                      </div>
                      <div style={{ fontSize: 10, color: S.txtSub }}>
                        {getTeamPicks(selectedTeam.id).length} picks available
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedTeam(null); setUserSendPicks([]); setTheirSendPicks([]); setTradeResult(null); }}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', color: S.txtMuted, cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0 }}
                    >
                      ×
                    </button>
                  </div>

                  {/* Pick selectors */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    {/* You send */}
                    <div>
                      <div style={{ fontSize: 10, color: S.red, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                        You Send
                      </div>
                      {userPicksList.length === 0 ? (
                        <div style={{ fontSize: 11, color: S.txtMuted }}>No picks</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 220, overflowY: 'auto' }}>
                          {userPicksList.map(overall => {
                            const checked = userSendPicks.includes(overall);
                            return (
                              <button
                                key={overall}
                                onClick={() => toggleUserPick(overall)}
                                style={{
                                  background: checked ? S.redSub : S.elevated,
                                  border: `1px solid ${checked ? S.red + '80' : S.border}`,
                                  borderRadius: 6,
                                  padding: '6px 10px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  transition: 'all 0.12s',
                                }}
                              >
                                <span style={{ fontSize: 11, fontWeight: 600, color: checked ? S.redBright : S.txt }}>
                                  {getPickLabel(overall)}
                                </span>
                                <span style={{ fontSize: 10, color: S.txtMuted }}>{getPickValue(overall)}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* You receive */}
                    <div>
                      <div style={{ fontSize: 10, color: S.greenBright, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                        You Receive
                      </div>
                      {getTeamPicks(selectedTeam.id).length === 0 ? (
                        <div style={{ fontSize: 11, color: S.txtMuted }}>No picks available</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 220, overflowY: 'auto' }}>
                          {getTeamPicks(selectedTeam.id).map(overall => {
                            const checked = theirSendPicks.includes(overall);
                            return (
                              <button
                                key={overall}
                                onClick={() => toggleTheirPick(overall)}
                                style={{
                                  background: checked ? S.greenSub : S.elevated,
                                  border: `1px solid ${checked ? S.green + '80' : S.border}`,
                                  borderRadius: 6,
                                  padding: '6px 10px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  transition: 'all 0.12s',
                                }}
                              >
                                <span style={{ fontSize: 11, fontWeight: 600, color: checked ? S.greenBright : S.txt }}>
                                  {getPickLabel(overall)}
                                </span>
                                <span style={{ fontSize: 10, color: S.txtMuted }}>{getPickValue(overall)}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Value bar */}
                  <div style={{ marginBottom: 14 }}>
                    <ValueBar left={sendValue} right={receiveValue} max={maxVal} />
                  </div>

                  {/* Propose / result */}
                  <AnimatePresence mode="wait">
                    {tradeResult === null ? (
                      <motion.button
                        key="propose"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={handleProposeTrade}
                        disabled={userSendPicks.length === 0 || theirSendPicks.length === 0}
                        style={{
                          width: '100%',
                          background: userSendPicks.length && theirSendPicks.length
                            ? `linear-gradient(135deg, ${S.accent}, #6366f1)`
                            : S.elevated,
                          border: 'none',
                          color: userSendPicks.length && theirSendPicks.length ? '#fff' : S.txtMuted,
                          borderRadius: 8,
                          padding: '11px',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: userSendPicks.length && theirSendPicks.length ? 'pointer' : 'not-allowed',
                          letterSpacing: '0.05em',
                          transition: 'all 0.15s',
                        }}
                      >
                        PROPOSE TRADE
                      </motion.button>
                    ) : (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                          background: tradeResult === 'accepted' ? S.greenSub : S.redSub,
                          border: `1px solid ${tradeResult === 'accepted' ? S.green + '80' : S.red + '80'}`,
                          borderRadius: 8,
                          padding: '12px',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: 14, fontWeight: 900, color: tradeResult === 'accepted' ? S.greenBright : S.redBright, fontFamily: 'Impact, sans-serif', letterSpacing: '0.05em' }}>
                          {tradeResult === 'accepted' ? '✓ TRADE ACCEPTED' : '✗ TRADE REJECTED'}
                        </div>
                        <div style={{ fontSize: 11, color: S.txtSub, marginTop: 4 }}>
                          {tradeResult === 'accepted'
                            ? 'Deal is done. Check your updated picks.'
                            : 'They want more value. Try adding a pick.'}
                        </div>
                        <button
                          onClick={() => setTradeResult(null)}
                          style={{
                            marginTop: 8, background: 'none', border: `1px solid ${S.border}`,
                            color: S.txtSub, borderRadius: 6, padding: '4px 14px',
                            fontSize: 11, cursor: 'pointer', fontWeight: 600,
                          }}
                        >
                          Try Again
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT PANEL: Live feed ──────────────────────────────────────── */}
        <div style={{
          width: 280,
          flexShrink: 0,
          borderLeft: `1px solid ${S.border}`,
          background: S.surface,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Feed header */}
          <div style={{
            padding: '12px 14px',
            borderBottom: `1px solid ${S.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}>
            <motion.div
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              style={{ width: 8, height: 8, borderRadius: '50%', background: S.pulse, flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, fontWeight: 700, color: S.txt }}>⚡ War Room Feed</span>
            <div style={{
              marginLeft: 'auto', fontSize: 10, color: S.txtMuted,
              background: S.elevated, borderRadius: 4, padding: '2px 6px',
            }}>
              {activityFeed.length}
            </div>
          </div>

          {/* Count summary */}
          <div style={{
            padding: '7px 14px',
            borderBottom: `1px solid ${S.border}`,
            display: 'flex',
            gap: 10,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 10, color: S.greenBright, fontWeight: 700 }}>
              {totalTradesExecuted} trades
            </span>
            <span style={{ fontSize: 10, color: S.txtMuted }}>·</span>
            <span style={{ fontSize: 10, color: S.yellow, fontWeight: 700 }}>
              {totalRumors} rumors today
            </span>
          </div>

          {/* Feed items */}
          <div ref={feedRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {activityFeed.length === 0 ? (
              <div style={{ padding: '24px 14px', textAlign: 'center', color: S.txtMuted, fontSize: 12 }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>📡</div>
                Monitoring phone lines...
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {activityFeed.map((item, i) => {
                  const isNew = i === 0;
                  const borderColor =
                    item.type === 'trade' ? S.greenBright :
                    item.type === 'rumor' ? S.yellow :
                    item.type === 'breakdown' ? S.redBright :
                    S.blue;
                  const bgColor =
                    item.type === 'trade' ? S.greenSub :
                    item.type === 'rumor' ? S.yellowSub :
                    item.type === 'breakdown' ? S.redSub :
                    S.accentSub;

                  return (
                    <motion.div
                      key={item.id}
                      initial={isNew ? { opacity: 0, x: 14, height: 0 } : false}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      transition={{ duration: 0.22 }}
                      style={{
                        margin: '0 8px 4px',
                        padding: '8px 10px',
                        background: bgColor,
                        border: `1px solid ${borderColor}25`,
                        borderLeft: `3px solid ${borderColor}`,
                        borderRadius: 8,
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: item.type === 'trade' ? 4 : 0 }}>
                        <span style={{
                          flex: 1,
                          fontSize: 11,
                          fontWeight: item.type === 'trade' ? 800 : 500,
                          color: item.type === 'trade' ? S.txt : S.txtSub,
                          fontStyle: item.type === 'rumor' ? 'italic' : 'normal',
                          lineHeight: 1.35,
                          textDecoration: item.type === 'breakdown' ? 'none' : 'none',
                          opacity: item.type === 'breakdown' ? 0.7 : 1,
                        }}>
                          {item.headline}
                        </span>
                        {item.type === 'trade' && (
                          <span style={{
                            fontSize: 8, fontWeight: 900, color: S.greenBright,
                            background: S.greenSub, border: `1px solid ${S.green}60`,
                            borderRadius: 3, padding: '1px 5px', letterSpacing: '0.08em',
                            flexShrink: 0, marginTop: 2,
                          }}>
                            DONE
                          </span>
                        )}
                      </div>

                      {item.type === 'trade' && (
                        <div style={{ fontSize: 9, color: S.txtMuted, display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 2 }}>
                          <span style={{ color: S.red + 'bb' }}>
                            {item.team1Abbr}: {item.picks1.map(p => getPickLabelShort(p)).join(', ')}
                          </span>
                          <span>→</span>
                          <span style={{ color: S.greenBright + 'bb' }}>
                            {item.team2Abbr}: {item.picks2.map(p => getPickLabelShort(p)).join(', ')}
                          </span>
                        </div>
                      )}

                      <div style={{ fontSize: 9, color: S.txtMuted, marginTop: 2 }}>
                        {item.time}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
