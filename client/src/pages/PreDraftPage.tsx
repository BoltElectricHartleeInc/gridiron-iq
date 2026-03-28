import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraftStore } from '../store/draftStore';
import { NFL_TEAMS } from '../data/teams';
import { getPickValue, getPicksValue } from '../data/tradeChart';
import type { NFLTeam } from '../types/draft';
import { C, GLOBAL_CSS } from '../components/AppShell';
import { useIsMobile } from '../hooks/useIsMobile';

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
  if (trades < 6)  return { label: 'QUIET',  color: C.blueBright, emoji: '😴', pct: 15 };
  if (trades < 16) return { label: 'ACTIVE', color: C.gold,       emoji: '📱', pct: 42 };
  if (trades < 31) return { label: 'HECTIC', color: C.amber,      emoji: '🔥', pct: 75 };
  return              { label: 'FRENZY', color: '#ff00ff',     emoji: '💥', pct: 100 };
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
  const barColor = fair ? C.green : userWins ? C.green : C.red;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.txtSub, marginBottom: 6 }}>
        <span>You send: <strong style={{ color: left > 0 ? C.txt : C.txtMuted }}>{left} pts</strong></span>
        <span>You receive: <strong style={{ color: right > 0 ? C.txt : C.txtMuted }}>{right} pts</strong></span>
      </div>
      <div style={{ height: 8, background: C.border, borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
        <motion.div
          animate={{ width: `${pctL}%` }}
          transition={{ duration: 0.4 }}
          style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: barColor, borderRadius: 6, opacity: .8 }}
        />
        <motion.div
          animate={{ width: `${pctR}%` }}
          transition={{ duration: 0.4 }}
          style={{ position: 'absolute', right: 0, top: 0, height: '100%', background: `${barColor}50`, borderRadius: 6 }}
        />
      </div>
      <div style={{ fontSize: 10, marginTop: 5, textAlign: 'center', fontWeight: 800, color: fair ? C.green : userWins ? C.green : C.red, minHeight: 14 }}>
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
  const isMobile = useIsMobile();
  const { session, acceptTrade } = useDraftStore();

  // Mobile tab state
  const [mobileTab, setMobileTab] = useState<'picks' | 'trade' | 'feed'>('trade');

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

  // ── Shared panel content (used in both mobile and desktop) ──────────────

  const picksPanel = (
    <>
      <div style={{ padding: isMobile ? '14px 14px 0' : '16px 14px 0' }}>
        <div style={{ fontSize: 9, color: C.txtMuted, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>
          Your Picks
        </div>
        {userPicksList.length === 0 ? (
          <div style={{ fontSize: 11, color: C.txtMuted, textAlign: 'center', padding: '20px 0' }}>No picks remaining</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {userPicksList.map(overall => {
              const val = getPickValue(overall);
              const round = Math.ceil(overall / 32);
              const isEarly = overall <= 10;
              return (
                <div key={overall} style={{
                  background: isEarly ? `${C.gold}12` : C.elevated,
                  border: `1px solid ${isEarly ? C.gold + '40' : C.border}`,
                  borderRadius: 10, padding: '8px 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {isEarly && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: C.gold, borderRadius: '10px 0 0 10px' }} />}
                  <div style={{ paddingLeft: isEarly ? 6 : 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: isEarly ? C.goldBright : C.txt }}>{getPickLabelShort(overall)}</div>
                    <div style={{ fontSize: 9, color: C.txtMuted, marginTop: 1 }}>Round {round}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isEarly ? C.goldBright : C.txtSub, background: isEarly ? C.goldSub : 'transparent', borderRadius: 5, padding: isEarly ? '2px 6px' : '0' }}>
                    {val}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ borderTop: `1px solid ${C.border}`, padding: '16px 14px', marginTop: 12 }}>
        <div style={{ fontSize: 9, color: C.txtMuted, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>Market Temp</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 22 }}>{temp.emoji}</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: temp.color, letterSpacing: '0.04em' }}>{temp.label}</span>
        </div>
        <div style={{ height: 8, background: C.border, borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
          <motion.div animate={{ width: `${temp.pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${C.blueBright}, ${temp.color})`, borderRadius: 6, boxShadow: `0 0 8px ${temp.color}60` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.txtMuted, marginBottom: 12 }}>
          <span>Quiet</span><span>Frenzy</span>
        </div>
        <div style={{ fontSize: 11, color: C.txtSub, lineHeight: 1.8 }}>
          <div><span style={{ color: C.green, fontWeight: 800 }}>{totalTradesExecuted}</span> trades executed</div>
          <div><span style={{ color: C.amber, fontWeight: 800 }}>{totalRumors}</span> rumors today</div>
        </div>
      </div>
    </>
  );

  const tradePanel = (
    <div style={{ padding: isMobile ? '14px 14px' : '18px 20px' }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: C.txtMuted, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>Trade Desk</div>
        <div style={{ fontSize: 13, color: selectedTeam ? C.txt : C.txtSub, fontWeight: 600 }}>
          {selectedTeam ? `Trading with ${selectedTeam.city} ${selectedTeam.name}` : 'Select a team below to propose a trade'}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(6, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 5 : 7, marginBottom: 22 }}>
        {NFL_TEAMS.map(team => {
          const isUser = team.id === session!.userTeamId;
          const isSelected = selectedTeam?.id === team.id;
          const picks = getTeamPicks(team.id);
          return (
            <motion.button key={team.id}
              whileHover={{ scale: isUser ? 1 : 1.04 }}
              whileTap={{ scale: isUser ? 1 : 0.96 }}
              onClick={() => !isUser && handleTeamClick(team)}
              style={{
                background: isSelected ? `${team.primaryColor}28` : isUser ? `${team.primaryColor}12` : C.elevated,
                border: `1px solid ${isSelected ? team.primaryColor + '80' : isUser ? team.primaryColor + '30' : C.border}`,
                borderRadius: 8, padding: isMobile ? '7px 4px' : '10px 8px',
                cursor: isUser ? 'default' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? 3 : 5,
                opacity: isUser ? 0.65 : 1, position: 'relative',
                transition: 'all 0.12s',
                boxShadow: isSelected ? `0 0 16px -4px ${team.primaryColor}60` : 'none',
              }}>
              {isUser && <div style={{ position: 'absolute', top: 2, right: 3, fontSize: 6, color: C.goldBright, fontWeight: 800 }}>YOU</div>}
              <div style={{
                width: isMobile ? 24 : 32, height: isMobile ? 24 : 32, borderRadius: 6,
                background: `${team.primaryColor}25`, border: `1px solid ${team.primaryColor}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isMobile ? 6 : 8, fontWeight: 900, color: team.primaryColor,
              }}>{team.abbreviation}</div>
              {!isMobile && <div style={{ fontSize: 9, color: isSelected ? C.txt : C.txtSub, textAlign: 'center', lineHeight: 1.2, fontWeight: 600 }}>{team.abbreviation}</div>}
              <div style={{ fontSize: 7, color: C.txtMuted }}>{picks.length}p</div>
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        {selectedTeam && (
          <motion.div key={selectedTeam.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
            style={{ background: C.surface, border: `1px solid ${C.borderHi}`, borderTop: `3px solid ${selectedTeam.primaryColor}`, borderRadius: 14, padding: isMobile ? '14px' : '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${selectedTeam.primaryColor}08 0%, transparent 50%)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, position: 'relative' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${selectedTeam.primaryColor}25`, border: `1px solid ${selectedTeam.primaryColor}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: selectedTeam.primaryColor, flexShrink: 0 }}>
                {selectedTeam.abbreviation}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.txt }}>{selectedTeam.city} {selectedTeam.name}</div>
                <div style={{ fontSize: 11, color: C.txtSub, marginTop: 2 }}>{getTeamPicks(selectedTeam.id).length} picks available</div>
              </div>
              <button onClick={() => { setSelectedTeam(null); setUserSendPicks([]); setTheirSendPicks([]); setTradeResult(null); }}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: C.txtMuted, cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: 0 }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, position: 'relative' }}>
              <div>
                <div style={{ fontSize: 9, color: C.red, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>You Send</div>
                {userPicksList.length === 0 ? <div style={{ fontSize: 11, color: C.txtMuted }}>No picks</div> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 200, overflowY: 'auto' }}>
                    {userPicksList.map(overall => {
                      const checked = userSendPicks.includes(overall);
                      return (
                        <button key={overall} onClick={() => toggleUserPick(overall)}
                          style={{ background: checked ? `${C.red}18` : C.elevated, border: `1px solid ${checked ? C.red + '70' : C.border}`, borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.12s' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: checked ? C.red : C.txt }}>{getPickLabel(overall)}</span>
                          <span style={{ fontSize: 10, color: C.txtMuted }}>{getPickValue(overall)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 9, color: C.green, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>You Receive</div>
                {getTeamPicks(selectedTeam.id).length === 0 ? <div style={{ fontSize: 11, color: C.txtMuted }}>No picks available</div> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 200, overflowY: 'auto' }}>
                    {getTeamPicks(selectedTeam.id).map(overall => {
                      const checked = theirSendPicks.includes(overall);
                      return (
                        <button key={overall} onClick={() => toggleTheirPick(overall)}
                          style={{ background: checked ? `${C.green}14` : C.elevated, border: `1px solid ${checked ? C.green + '70' : C.border}`, borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.12s' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: checked ? C.green : C.txt }}>{getPickLabel(overall)}</span>
                          <span style={{ fontSize: 10, color: C.txtMuted }}>{getPickValue(overall)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}><ValueBar left={sendValue} right={receiveValue} max={maxVal} /></div>
            <AnimatePresence mode="wait">
              {tradeResult === null ? (
                <motion.button key="propose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleProposeTrade}
                  disabled={userSendPicks.length === 0 || theirSendPicks.length === 0}
                  style={{ width: '100%', background: userSendPicks.length && theirSendPicks.length ? `linear-gradient(135deg, ${C.blueBright}, #6366f1)` : C.elevated, border: 'none', color: userSendPicks.length && theirSendPicks.length ? '#fff' : C.txtMuted, borderRadius: 10, padding: '13px', fontSize: 13, fontWeight: 800, cursor: userSendPicks.length && theirSendPicks.length ? 'pointer' : 'not-allowed', letterSpacing: '0.06em', transition: 'all 0.15s', boxShadow: userSendPicks.length && theirSendPicks.length ? `0 0 20px -6px ${C.blueBright}80` : 'none' }}>
                  PROPOSE TRADE
                </motion.button>
              ) : (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ background: tradeResult === 'accepted' ? `${C.green}12` : `${C.red}12`, border: `1px solid ${tradeResult === 'accepted' ? C.green + '60' : C.red + '60'}`, borderRadius: 10, padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: tradeResult === 'accepted' ? C.green : C.red, letterSpacing: '0.04em', marginBottom: 6 }}>
                    {tradeResult === 'accepted' ? '✓ TRADE ACCEPTED' : '✗ TRADE REJECTED'}
                  </div>
                  <div style={{ fontSize: 12, color: C.txtSub, marginBottom: 12, lineHeight: 1.5 }}>
                    {tradeResult === 'accepted' ? 'Deal is done. Check your updated picks.' : 'They want more value. Try adding a pick.'}
                  </div>
                  <button onClick={() => setTradeResult(null)}
                    style={{ background: 'none', border: `1px solid ${C.border}`, color: C.txtSub, borderRadius: 8, padding: '6px 18px', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
                    Try Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const feedPanel = (
    <>
      <div style={{ padding: '8px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 12, flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: C.green, fontWeight: 800 }}>{totalTradesExecuted} trades</span>
        <span style={{ fontSize: 10, color: C.txtMuted }}>·</span>
        <span style={{ fontSize: 10, color: C.amber, fontWeight: 800 }}>{totalRumors} rumors today</span>
      </div>
      <div ref={feedRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {activityFeed.length === 0 ? (
          <div style={{ padding: '28px 16px', textAlign: 'center', color: C.txtMuted, fontSize: 12 }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>📡</div>Monitoring phone lines...
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {activityFeed.map((item, i) => {
              const isNew = i === 0;
              const borderColor = item.type === 'trade' ? C.green : item.type === 'rumor' ? C.amber : item.type === 'breakdown' ? C.red : C.blueBright;
              const bgColor = item.type === 'trade' ? `${C.green}12` : item.type === 'rumor' ? `${C.amber}10` : item.type === 'breakdown' ? `${C.red}10` : C.blueSub;
              return (
                <motion.div key={item.id} initial={isNew ? { opacity: 0, x: 14, height: 0 } : false} animate={{ opacity: 1, x: 0, height: 'auto' }} transition={{ duration: 0.22 }}
                  style={{ margin: '0 10px 5px', padding: '10px 12px', background: bgColor, border: `1px solid ${borderColor}22`, borderLeft: `3px solid ${borderColor}`, borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: item.type === 'trade' ? 5 : 0 }}>
                    <span style={{ flex: 1, fontSize: 11, fontWeight: item.type === 'trade' ? 800 : 500, color: item.type === 'trade' ? C.txt : C.txtSub, fontStyle: item.type === 'rumor' ? 'italic' : 'normal', opacity: item.type === 'breakdown' ? 0.7 : 1, lineHeight: 1.4 }}>
                      {item.headline}
                    </span>
                    {item.type === 'trade' && (
                      <span style={{ fontSize: 8, fontWeight: 900, color: C.green, background: `${C.green}18`, border: `1px solid ${C.green}50`, borderRadius: 4, padding: '2px 6px', letterSpacing: '0.08em', flexShrink: 0, marginTop: 1 }}>DONE</span>
                    )}
                  </div>
                  {item.type === 'trade' && (
                    <div style={{ fontSize: 9, color: C.txtMuted, display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 3 }}>
                      <span style={{ color: C.red + 'cc' }}>{item.team1Abbr}: {item.picks1.map(p => getPickLabelShort(p)).join(', ')}</span>
                      <span>→</span>
                      <span style={{ color: C.green + 'cc' }}>{item.team2Abbr}: {item.picks2.map(p => getPickLabelShort(p)).join(', ')}</span>
                    </div>
                  )}
                  <div style={{ fontSize: 9, color: C.txtMuted, marginTop: 3 }}>{item.time}</div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.txt, display: 'flex', flexDirection: 'column', fontFamily: C.font }}>
      <style>{GLOBAL_CSS}{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* ── BREAKING TRADE BANNER ─────────────────────────────────────────── */}
      <AnimatePresence>
        {breakingTrade && (
          <motion.div initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'linear-gradient(135deg, #7f1d1d, #dc2626)', borderBottom: `2px solid ${C.red}`, padding: '13px 24px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 8px 40px rgba(220,38,38,0.5)' }}>
            <span style={{ fontSize: 18 }}>🚨</span>
            <span style={{ fontSize: 11, fontWeight: 900, color: '#fca5a5', letterSpacing: '0.2em', textTransform: 'uppercase', flexShrink: 0 }}>BREAKING:</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', flex: 1 }}>{breakingTrade}</span>
            <button onClick={() => setBreakingTrade(null)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SCROLLING TICKER ─────────────────────────────────────────────── */}
      {!isMobile && (
        <div style={{ height: 32, background: '#030508', borderBottom: `1px solid ${C.border}`, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: 90, zIndex: 2, background: 'linear-gradient(90deg, #030508 65%, transparent)', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
            <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} style={{ fontSize: 9, fontWeight: 900, color: C.red, letterSpacing: '0.15em', whiteSpace: 'nowrap' }}>⚡ LIVE</motion.span>
          </div>
          {tickerText ? (
            <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', paddingLeft: 100, animation: 'ticker-scroll 80s linear infinite' }}>
              <span style={{ fontSize: 11, color: C.txtSub, paddingRight: 80 }}>{tickerText}</span>
              <span style={{ fontSize: 11, color: C.txtSub, paddingRight: 80 }}>{tickerText}</span>
            </div>
          ) : (
            <span style={{ paddingLeft: 100, fontSize: 11, color: C.txtMuted }}>Monitoring phone lines...</span>
          )}
        </div>
      )}

      {/* ── TOP NAV ───────────────────────────────────────────────────────── */}
      <div style={{ background: 'rgba(5,8,15,.95)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${C.border}`, padding: isMobile ? '0 12px' : '0 20px', height: 52, display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14, flexShrink: 0 }}>
        <button onClick={() => navigate('/draft/select')}
          style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, color: C.txtSub, cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          ← Back
        </button>
        {!isMobile && <div style={{ width: 1, height: 20, background: C.border, flexShrink: 0 }} />}
        <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 900, letterSpacing: '.06em', color: C.txt, whiteSpace: 'nowrap' }}>
          {isMobile ? <span style={{ color: C.gold }}>War Room</span> : <>Pre-Draft <span style={{ color: C.gold }}>War Room</span></>}
        </div>
        <div style={{ flex: 1 }} />
        {!isMobile && userTeam && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '6px 12px', flexShrink: 0 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: `${userTeam.primaryColor}30`, border: `1px solid ${userTeam.primaryColor}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 900, color: userTeam.primaryColor }}>{userTeam.abbreviation}</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.txt }}>{userTeam.city} {userTeam.name}</span>
          </div>
        )}
        {!isMobile && (
          <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ repeat: Infinity, duration: 2.2 }}
            style={{ background: totalTradesExecuted > 0 ? `${temp.color}18` : C.surface, border: `1px solid ${totalTradesExecuted > 0 ? temp.color + '50' : C.border}`, borderRadius: 10, padding: '6px 12px', fontSize: 11, fontWeight: 700, color: totalTradesExecuted > 0 ? temp.color : C.txtMuted, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: totalTradesExecuted > 0 ? temp.color : C.txtMuted, display: 'inline-block', boxShadow: totalTradesExecuted > 0 ? `0 0 6px ${temp.color}` : 'none' }} />
            {totalTradesExecuted} live trades
          </motion.div>
        )}
        {isMobile && (
          <span style={{ fontSize: 10, color: temp.color, fontWeight: 800 }}>{temp.emoji} {totalTradesExecuted}</span>
        )}
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/draft/board')}
          style={{ background: `linear-gradient(135deg, ${C.blueBright}, #6366f1)`, border: 'none', color: '#fff', borderRadius: 10, padding: isMobile ? '8px 12px' : '9px 18px', fontSize: isMobile ? 11 : 12, fontWeight: 800, cursor: 'pointer', letterSpacing: '0.04em', flexShrink: 0, boxShadow: `0 0 20px -6px ${C.blueBright}80` }}>
          {isMobile ? 'Enter →' : 'Enter Draft Room →'}
        </motion.button>
      </div>

      {/* ── MOBILE: Tab bar ───────────────────────────────────────────────── */}
      {isMobile && (
        <div style={{ display: 'flex', background: C.surface, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          {([['picks', 'MY PICKS'], ['trade', 'TRADE DESK'], ['feed', 'LIVE FEED']] as const).map(([tab, label]) => (
            <button key={tab} onClick={() => setMobileTab(tab)}
              style={{ flex: 1, padding: '11px 4px', background: 'none', border: 'none', borderBottom: `2px solid ${mobileTab === tab ? C.blueBright : 'transparent'}`, color: mobileTab === tab ? C.blueBright : C.txtMuted, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', cursor: 'pointer', transition: 'color 160ms' }}>
              {label}
              {tab === 'feed' && activityFeed.length > 0 && (
                <span style={{ marginLeft: 4, fontSize: 8, background: C.green, color: '#000', borderRadius: 999, padding: '1px 5px', fontWeight: 900 }}>{Math.min(activityFeed.length, 99)}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {isMobile ? (
        /* ── MOBILE LAYOUT: single panel by tab ─────────────────────────── */
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {mobileTab === 'picks' && (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>{picksPanel}</div>
          )}
          {mobileTab === 'trade' && tradePanel}
          {mobileTab === 'feed' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>{feedPanel}</div>
          )}
        </div>
      ) : (
        /* ── DESKTOP: THREE PANELS ───────────────────────────────────────── */
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

          {/* LEFT PANEL */}
          <div style={{ width: 230, flexShrink: 0, borderRight: `1px solid ${C.border}`, background: C.surface, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {picksPanel}
          </div>

          {/* CENTER PANEL */}
          <div style={{ flex: 1, overflow: 'auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {tradePanel}
          </div>

          {/* RIGHT PANEL */}
          <div style={{ width: 290, flexShrink: 0, borderLeft: `1px solid ${C.border}`, background: C.surface, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, background: C.panel }}>
              <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}
                style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, flexShrink: 0, boxShadow: `0 0 6px ${C.green}` }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: C.txt }}>War Room Feed</span>
              <div style={{ marginLeft: 'auto', fontSize: 10, color: C.txtMuted, background: C.elevated, borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>{activityFeed.length}</div>
            </div>
            {feedPanel}
          </div>

        </div>
      )}
    </div>
  );
}
