import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecruitingStore, selectCommittedRecruits, selectClassGrade } from '../store/recruitingStore';
import { type Recruit } from '../data/recruits';
import { NCAA_GAME_TEAMS } from '../game/teams';

// ─── Design tokens ────────────────────────────────────────────────────────────
const S = {
  bg:         '#050508',
  card:       '#0a0a14',
  cardHi:     '#0f0f1e',
  border:     'rgba(255,255,255,0.06)',
  borderHi:   'rgba(255,255,255,0.14)',
  txt:        '#e2e8f0',
  txtSub:     '#8892a0',
  txtMuted:   '#3d4a58',
  gold:       '#c49a1a',
  goldBright: '#fbbf24',
  goldSub:    'rgba(196,154,26,0.12)',
  green:      '#16a34a',
  greenBright:'#22c55e',
  greenSub:   'rgba(22,163,74,0.12)',
  red:        '#dc2626',
  redSub:     'rgba(220,38,38,0.10)',
  blue:       '#3b82f6',
  blueSub:    'rgba(59,130,246,0.10)',
  orange:     '#f97316',
  orangeSub:  'rgba(249,115,22,0.10)',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function starsDisplay(n: number): string {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function interestColor(v: number): string {
  if (v >= 85) return S.greenBright;
  if (v >= 70) return S.orange;
  if (v >= 40) return S.goldBright;
  return '#60a5fa';
}

function interestLabel(v: number): string {
  if (v >= 85) return 'COMMIT TERRITORY';
  if (v >= 70) return 'HOT';
  if (v >= 40) return 'WARM';
  if (v > 0)   return 'INTERESTED';
  return 'COLD';
}

function posColor(pos: string): string {
  const map: Record<string, string> = {
    QB: '#f97316', RB: '#22c55e', WR: '#3b82f6', TE: '#a78bfa',
    OT: '#64748b', IOL: '#94a3b8', DE: '#ef4444', DT: '#f87171',
    LB: '#fbbf24', CB: '#06b6d4', S: '#0ea5e9', K: '#e2e8f0',
  };
  return map[pos] ?? '#e2e8f0';
}

function hexToRgb(hex: number): string {
  const r = (hex >> 16) & 0xff;
  const g = (hex >> 8) & 0xff;
  const b = hex & 0xff;
  return `${r}, ${g}, ${b}`;
}

function parseInterestDelta(text: string): { clean: string; delta: number } {
  const match = text.match(/\{"interest_delta":\s*(-?\d+)\}/);
  const delta = match ? parseInt(match[1], 10) : 0;
  const clean = text.replace(/\n?\{"interest_delta":\s*-?\d+\}\s*$/, '').trim();
  return { clean, delta };
}

// ─── School setup screen ──────────────────────────────────────────────────────
const PRIORITY_SCHOOLS = NCAA_GAME_TEAMS.filter(t =>
  ['ala','uga','osu','tex','lsu','usc','mich','nd','clem','oreg','fsu','penn','okla','ten','aub','fla','wash','uta','ksu','iowa'].includes(t.id)
).slice(0, 20);

function SetupScreen() {
  const setSchool = useRecruitingStore(s => s.setSchool);

  return (
    <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: S.gold, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase' }}>
            College Football Recruiting
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 800, color: S.txt, margin: 0, lineHeight: 1.1, letterSpacing: -1 }}>
            BUILD YOUR PROGRAM
          </h1>
          <p style={{ color: S.txtSub, marginTop: 16, fontSize: 16 }}>
            Choose your school to begin recruiting the Class of 2026
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, maxWidth: 900 }}>
          {NCAA_GAME_TEAMS.map(team => (
            <motion.div
              key={team.id}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSchool(team.id, `${team.city} ${team.name}`, team.conference ?? 'Independent', team.offenseRating)}
              style={{
                background: S.card,
                border: `1px solid ${S.border}`,
                borderRadius: 12,
                padding: '16px 20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: `rgb(${hexToRgb(team.primaryColor)})`,
                marginBottom: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, color: '#fff',
              }}>
                {team.abbreviation.slice(0, 2)}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: S.txt }}>{team.city}</div>
              <div style={{ fontSize: 11, color: S.txtSub }}>{team.name}</div>
              <div style={{ fontSize: 10, color: S.txtMuted, marginTop: 4 }}>{team.conference}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 10, color: S.gold }}>OFF {team.offenseRating}</span>
                <span style={{ fontSize: 10, color: '#60a5fa' }}>DEF {team.defenseRating}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Call modal ───────────────────────────────────────────────────────────────
interface CallModalProps {
  recruit: Recruit;
  onClose: () => void;
}

function CallModal({ recruit, onClose }: CallModalProps) {
  const store = useRecruitingStore();
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [showDelta, setShowDelta] = useState<{ delta: number; key: number } | null>(null);
  const [callUsed, setCallUsed] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const conversation = store.conversations[recruit.id];
  const messages = conversation?.messages ?? [];
  const interest = recruit.schoolInterest[store.userSchoolId ?? ''] ?? 0;
  const isOffered = store.offeredScholarships.has(recruit.id);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Build preset pitches based on recruit's top priorities
  const presets = useMemo(() => {
    const p = recruit.priorities;
    const sorted = Object.entries(p).sort(([, a], [, b]) => b - a);
    const pitches: { label: string; text: string }[] = [];
    for (const [key] of sorted) {
      if (pitches.length >= 4) break;
      if (key === 'nflPipeline')    pitches.push({ label: 'NFL Pipeline', text: `Coach here — I want to talk about our NFL draft history. We've sent ${store.userSchoolNFLDraftPicks} players to the league in the last 5 years. Your position group specifically has produced multiple pros. That's our track record.` });
      else if (key === 'proximity') pitches.push({ label: 'Close to Home', text: `I know family is important to you. Our campus is close enough that your folks can make every home game. That matters to us — we want your family part of this program.` });
      else if (key === 'playingTime') pitches.push({ label: 'Early Playing Time', text: `I'll be straight with you — we have a need at your position right now. You come in and compete from Day 1. I'm not promising a start, but you will get a real shot. No redshirting in the dark.` });
      else if (key === 'facilities') pitches.push({ label: 'Facilities & NIL', text: `Come take a tour of our facility. It's the best in the conference. And our NIL collective is putting together a real deal for the right players. You have a brand — we want to help you build it.` });
      else if (key === 'winningCulture') pitches.push({ label: 'Championship Culture', text: `We're not building toward something — we're there. Our program competes for championships. I want you to be part of the next run.` });
      else if (key === 'exposure')   pitches.push({ label: 'National Exposure', text: `We play on national TV every week. College GameDay, primetime games — this is the biggest stage in college football. You perform here, the whole country sees it.` });
      else if (key === 'academics')  pitches.push({ label: 'Academics', text: `Our graduation rate for football players is among the best in the country. We have academic advisors dedicated to athletes. You get a real degree here, whatever you pursue.` });
    }
    return pitches.slice(0, 4);
  }, [recruit.priorities, store.userSchoolNFLDraftPicks]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    if (!store.userSchoolId) return;

    setInput('');
    setIsStreaming(true);
    setStreamingText('');

    // Add coach message
    const coachMsg = {
      id: `msg-${Date.now()}-coach`,
      role: 'coach' as const,
      content: text,
      interestDelta: 0,
      timestamp: Date.now(),
    };
    store.addConversationMessage(recruit.id, coachMsg);

    if (!callUsed) {
      setCallUsed(true);
    }

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const resp = await fetch('/api/recruit/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recruitName: recruit.name,
          recruitStars: recruit.stars,
          position: recruit.position,
          hometown: recruit.hometown,
          state: recruit.state,
          personalityType: recruit.personalityType,
          priorities: recruit.priorities,
          currentInterest: interest,
          schoolName: store.userSchoolName,
          schoolConference: store.userSchoolConference,
          schoolPrestige: store.userSchoolPrestige,
          schoolNFLPicks: store.userSchoolNFLDraftPicks,
          schoolChampionships: store.userSchoolChampionships,
          schoolFacilitiesRating: store.userSchoolFacilitiesRating,
          schoolAcademicsRating: store.userSchoolAcademicsRating,
          backstory: recruit.backstory,
          weekNumber: store.weekNumber,
          userMessage: text,
          conversationHistory: history,
        }),
      });

      if (!resp.ok) throw new Error('API error');
      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setStreamingText(full);
      }

      const { clean, delta } = parseInterestDelta(full);

      const recruitMsg = {
        id: `msg-${Date.now()}-recruit`,
        role: 'recruit' as const,
        content: clean,
        interestDelta: delta,
        timestamp: Date.now(),
      };
      store.addConversationMessage(recruit.id, recruitMsg);
      store.updateInterest(recruit.id, delta);

      setShowDelta({ delta, key: Date.now() });
      setTimeout(() => setShowDelta(null), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsStreaming(false);
      setStreamingText('');
      inputRef.current?.focus();
    }
  }, [isStreaming, store, recruit, messages, interest, callUsed]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const commitReady = interest >= 85 && isOffered;
  const nearCommit = interest >= 85 && !isOffered;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
        style={{
          width: '100%', maxWidth: 700,
          height: '75vh',
          background: S.bg,
          borderRadius: '20px 20px 0 0',
          border: `1px solid ${S.border}`,
          borderBottom: 'none',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: S.txt }}>{recruit.name}</span>
              <span style={{ fontSize: 14, color: S.goldBright }}>{starsDisplay(recruit.stars)}</span>
              <span style={{ fontSize: 11, background: posColor(recruit.position) + '22', color: posColor(recruit.position), padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>{recruit.position}</span>
            </div>
            <div style={{ fontSize: 12, color: S.txtSub, marginTop: 2 }}>{recruit.hometown}, {recruit.state}</div>
          </div>

          {/* Interest gauge */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: S.txtMuted, letterSpacing: 1, textTransform: 'uppercase' }}>Interest</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: interestColor(interest) }}>{interest}%</div>
            </div>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: `conic-gradient(${interestColor(interest)} ${interest * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16 }}>📞</span>
              </div>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: S.txtSub, fontSize: 20, cursor: 'pointer', padding: 4 }}>✕</button>
        </div>

        {/* Commit banner */}
        <AnimatePresence>
          {nearCommit && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ background: 'rgba(22,163,74,0.15)', borderBottom: `1px solid rgba(22,163,74,0.3)`, padding: '10px 20px', textAlign: 'center', flexShrink: 0 }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: S.greenBright }}>
                🟢 He's ready to commit — Offer the scholarship to lock him in!
              </span>
            </motion.div>
          )}
          {commitReady && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              style={{ background: 'rgba(22,163,74,0.2)', borderBottom: `1px solid rgba(22,163,74,0.4)`, padding: '10px 20px', textAlign: 'center', flexShrink: 0 }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: S.greenBright }}>
                🎉 COMMITMENT IMMINENT — He's about to be part of your class!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Opening line if no messages */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', justifyContent: 'flex-start' }}
            >
              <div style={{
                maxWidth: '75%', background: '#1a1a2e', border: `1px solid ${S.border}`,
                borderRadius: '16px 16px 16px 4px', padding: '10px 14px',
              }}>
                <div style={{ fontSize: 10, color: S.txtMuted, marginBottom: 4, fontWeight: 600 }}>{recruit.name.split(' ')[0].toUpperCase()}</div>
                <div style={{ fontSize: 14, color: S.txt, lineHeight: 1.5 }}>{recruit.openingLine}</div>
              </div>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.role === 'coach' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              style={{ display: 'flex', justifyContent: msg.role === 'coach' ? 'flex-end' : 'flex-start' }}
            >
              <div style={{
                maxWidth: '75%',
                background: msg.role === 'coach' ? 'rgba(59,130,246,0.15)' : '#1a1a2e',
                border: `1px solid ${msg.role === 'coach' ? 'rgba(59,130,246,0.25)' : S.border}`,
                borderRadius: msg.role === 'coach' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding: '10px 14px',
              }}>
                <div style={{ fontSize: 10, color: S.txtMuted, marginBottom: 4, fontWeight: 600 }}>
                  {msg.role === 'coach' ? 'COACH' : recruit.name.split(' ')[0].toUpperCase()}
                </div>
                <div style={{ fontSize: 14, color: S.txt, lineHeight: 1.5 }}>{msg.content}</div>
                {msg.role === 'recruit' && msg.interestDelta !== 0 && (
                  <div style={{
                    fontSize: 10, marginTop: 6, fontWeight: 700,
                    color: msg.interestDelta > 0 ? S.greenBright : S.red,
                  }}>
                    {msg.interestDelta > 0 ? `+${msg.interestDelta}` : msg.interestDelta} interest {msg.interestDelta > 0 ? '📈' : '📉'}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Streaming response */}
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', justifyContent: 'flex-start' }}
            >
              <div style={{
                maxWidth: '75%', background: '#1a1a2e', border: `1px solid ${S.border}`,
                borderRadius: '16px 16px 16px 4px', padding: '10px 14px',
              }}>
                <div style={{ fontSize: 10, color: S.txtMuted, marginBottom: 4, fontWeight: 600 }}>{recruit.name.split(' ')[0].toUpperCase()}</div>
                {streamingText ? (
                  <div style={{ fontSize: 14, color: S.txt, lineHeight: 1.5 }}>
                    {parseInterestDelta(streamingText).clean}
                    <span style={{ opacity: 0.5, animation: 'blink 1s infinite' }}>▋</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 4, padding: '4px 0' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                        style={{ width: 7, height: 7, borderRadius: '50%', background: S.txtSub }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Interest delta badge */}
        <AnimatePresence>
          {showDelta && (
            <motion.div
              key={showDelta.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute', bottom: 160, right: 20,
                background: showDelta.delta >= 0 ? S.greenSub : S.redSub,
                border: `1px solid ${showDelta.delta >= 0 ? S.greenBright : S.red}`,
                borderRadius: 8, padding: '6px 14px',
                fontSize: 13, fontWeight: 700,
                color: showDelta.delta >= 0 ? S.greenBright : S.red,
              }}
            >
              {showDelta.delta >= 0 ? `+${showDelta.delta} interest gained 📈` : `${showDelta.delta} interest lost 📉`}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preset pitches */}
        <div style={{ padding: '8px 20px', display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: `1px solid ${S.border}`, flexShrink: 0 }}>
          {presets.map(p => (
            <button
              key={p.label}
              onClick={() => sendMessage(p.text)}
              disabled={isStreaming}
              style={{
                background: S.goldSub, border: `1px solid rgba(196,154,26,0.25)`,
                borderRadius: 20, padding: '5px 12px', fontSize: 11, fontWeight: 600,
                color: S.gold, cursor: isStreaming ? 'not-allowed' : 'pointer',
                opacity: isStreaming ? 0.5 : 1, whiteSpace: 'nowrap',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${S.border}`, display: 'flex', gap: 10, flexShrink: 0 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say something to the recruit..."
            disabled={isStreaming}
            style={{
              flex: 1, background: S.card, border: `1px solid ${S.border}`,
              borderRadius: 10, padding: '10px 14px', fontSize: 14,
              color: S.txt, outline: 'none',
              fontFamily: 'inherit',
            }}
            autoFocus
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            style={{
              background: isStreaming || !input.trim() ? S.card : S.blue,
              border: 'none', borderRadius: 10, padding: '10px 20px',
              color: S.txt, fontSize: 14, fontWeight: 700,
              cursor: isStreaming || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: isStreaming || !input.trim() ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
          >
            Send
          </button>
        </div>

        {callUsed && (
          <div style={{ padding: '6px 20px 10px', fontSize: 11, color: S.txtMuted, textAlign: 'center', flexShrink: 0 }}>
            📞 Call counted against your weekly limit
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Recruit detail panel ─────────────────────────────────────────────────────
function RecruitDetail({ recruit, onCall, onVisit, onOffer }: {
  recruit: Recruit;
  onCall: () => void;
  onVisit: () => void;
  onOffer: () => void;
}) {
  const store = useRecruitingStore();
  const schoolId = store.userSchoolId ?? '';
  const interest = recruit.schoolInterest[schoolId] ?? 0;
  const isOffered = store.offeredScholarships.has(recruit.id);
  const hasVisit = recruit.hasVisit[schoolId];
  const isCommittedToMe = recruit.committedTo === schoolId;
  const isCommittedElsewhere = recruit.committedTo && recruit.committedTo !== schoolId;
  const conversation = store.conversations[recruit.id];
  const callCount = conversation?.callCount ?? 0;

  const PRIORITY_KEYS: (keyof typeof recruit.priorities)[] = [
    'nflPipeline','winningCulture','facilities','playingTime','exposure','proximity','academics'
  ];
  const PRIORITY_LABELS: Record<string, string> = {
    nflPipeline: 'NFL Pipeline',
    winningCulture: 'Win Culture',
    facilities: 'NIL / Facilities',
    playingTime: 'Playing Time',
    exposure: 'National Exposure',
    proximity: 'Stay Close',
    academics: 'Academics',
  };

  // How well does our school match each priority?
  function schoolFitForPriority(key: string): number {
    switch (key) {
      case 'nflPipeline':    return Math.min(10, Math.round(store.userSchoolNFLDraftPicks / 3));
      case 'winningCulture': return Math.min(10, store.userSchoolChampionships * 3 + 4);
      case 'facilities':     return store.userSchoolFacilitiesRating;
      case 'academics':      return store.userSchoolAcademicsRating;
      case 'exposure':       return Math.round(store.userSchoolPrestige / 10);
      case 'proximity':      return 5; // unknown without geo data
      case 'playingTime':    return 6; // always a pitch
      default: return 5;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      style={{ height: '100%', overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {/* Hero card */}
      <div style={{ background: S.cardHi, borderRadius: 14, padding: 20, border: `1px solid ${S.border}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: S.txt, lineHeight: 1.1 }}>{recruit.name}</div>
            <div style={{ fontSize: 14, color: S.goldBright, marginTop: 4, letterSpacing: 1 }}>{starsDisplay(recruit.stars)}</div>
            <div style={{ fontSize: 12, color: S.txtSub, marginTop: 4 }}>{recruit.hometown}, {recruit.state}</div>
          </div>
          <div style={{
            padding: '4px 12px', borderRadius: 8,
            background: posColor(recruit.position) + '20',
            color: posColor(recruit.position),
            fontSize: 14, fontWeight: 800, letterSpacing: 1,
          }}>
            {recruit.position}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
          <div><span style={{ color: S.txtMuted }}>HT </span><span style={{ color: S.txt, fontWeight: 700 }}>{recruit.height}</span></div>
          <div><span style={{ color: S.txtMuted }}>WT </span><span style={{ color: S.txt, fontWeight: 700 }}>{recruit.weight}</span></div>
          <div><span style={{ color: S.txtMuted }}>RTG </span><span style={{ color: S.txt, fontWeight: 700 }}>{recruit.rating}</span></div>
        </div>

        <div style={{ marginTop: 12, padding: '8px 12px', background: S.bg, borderRadius: 8, border: `1px solid ${S.border}` }}>
          <div style={{ fontSize: 10, color: S.txtMuted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>247Sports Composite</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: S.gold }}>{recruit.compositeScore.toFixed(4)}</div>
          <div style={{ fontSize: 11, color: S.txtSub }}>#{recruit.nationalRank} National · #{recruit.positionRank} {recruit.position}</div>
        </div>
      </div>

      {/* Interest gauge */}
      <div style={{ background: S.card, borderRadius: 12, padding: 16, border: `1px solid ${S.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 11, letterSpacing: 2, color: S.txtMuted, textTransform: 'uppercase', fontWeight: 700 }}>Your Interest Level</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: interestColor(interest), letterSpacing: 1 }}>{interestLabel(interest)}</span>
        </div>
        <div style={{ position: 'relative', height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${interest}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            style={{ position: 'absolute', inset: '0 auto 0 0', background: interestColor(interest), borderRadius: 5 }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: S.txtMuted }}>
          <span>0</span>
          <span style={{ fontWeight: 700, fontSize: 18, color: interestColor(interest) }}>{interest}</span>
          <span>100</span>
        </div>
      </div>

      {/* Priority bars */}
      <div style={{ background: S.card, borderRadius: 12, padding: 16, border: `1px solid ${S.border}` }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: S.txtMuted, textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Recruit Priorities</div>
        {PRIORITY_KEYS.map(key => {
          const importance = recruit.priorities[key];
          const fit = schoolFitForPriority(key as string);
          const fitColor = fit >= 7 ? S.greenBright : fit >= 4 ? S.goldBright : S.red;
          return (
            <div key={key} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                <span style={{ color: S.txtSub }}>{PRIORITY_LABELS[key]}</span>
                <span style={{ color: fitColor, fontWeight: 700, fontSize: 11 }}>Your fit: {fit}/10</span>
              </div>
              <div style={{ position: 'relative', height: 5, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${importance * 10}%` }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  style={{ position: 'absolute', inset: '0 auto 0 0', background: fitColor, borderRadius: 3, opacity: 0.85 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Competitors */}
      {recruit.topCompetitors.length > 0 && (
        <div style={{ background: S.card, borderRadius: 12, padding: 16, border: `1px solid ${S.border}` }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: S.txtMuted, textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Top Competitors</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {recruit.topCompetitors.map(s => (
              <div key={s} style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                background: S.redSub, border: `1px solid rgba(220,38,38,0.2)`,
                color: '#f87171',
              }}>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity */}
      <div style={{ background: S.card, borderRadius: 12, padding: 16, border: `1px solid ${S.border}` }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: S.txtMuted, textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Recruiting Activity</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: S.txtSub }}>
          <div>📞 Called by you: <strong style={{ color: S.txt }}>{callCount}x</strong></div>
          <div>🏫 Official visit: <strong style={{ color: hasVisit ? S.greenBright : S.txtMuted }}>{hasVisit ? 'Scheduled' : 'Not scheduled'}</strong></div>
          <div>📋 Scholarship offer: <strong style={{ color: isOffered ? S.greenBright : S.txtMuted }}>{isOffered ? 'Extended' : 'Not offered'}</strong></div>
          {recruit.committedTo && (
            <div style={{ marginTop: 4, padding: '6px 10px', borderRadius: 6, background: isCommittedToMe ? S.greenSub : S.redSub, border: `1px solid ${isCommittedToMe ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.2)'}` }}>
              <strong style={{ color: isCommittedToMe ? S.greenBright : S.red }}>
                {isCommittedToMe ? `🎉 COMMITTED TO YOU` : `❌ Committed to ${recruit.committedTo}`}
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* Backstory */}
      <div style={{ background: S.card, borderRadius: 12, padding: 16, border: `1px solid ${S.border}` }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: S.txtMuted, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Scouting Report</div>
        <p style={{ fontSize: 13, color: S.txtSub, lineHeight: 1.6, margin: 0 }}>{recruit.backstory}</p>
      </div>

      {/* Action buttons */}
      {!isCommittedElsewhere && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {isCommittedToMe ? (
            <div style={{
              padding: '14px 20px', borderRadius: 10, textAlign: 'center',
              background: 'rgba(22,163,74,0.15)', border: `1px solid rgba(22,163,74,0.3)`,
              fontSize: 14, fontWeight: 700, color: S.greenBright,
            }}>
              🎉 COMMITTED — {recruit.name.split(' ')[0]} is in your class!
            </div>
          ) : (
            <>
              <button
                onClick={onCall}
                disabled={store.callsRemainingThisWeek <= 0}
                style={{
                  padding: '13px 20px', borderRadius: 10,
                  background: store.callsRemainingThisWeek <= 0 ? S.card : S.blue,
                  border: `1px solid ${store.callsRemainingThisWeek <= 0 ? S.border : 'rgba(59,130,246,0.4)'}`,
                  color: store.callsRemainingThisWeek <= 0 ? S.txtMuted : '#fff',
                  fontSize: 14, fontWeight: 700, cursor: store.callsRemainingThisWeek <= 0 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                📞 CALL {recruit.name.split(' ')[0].toUpperCase()}
                {store.callsRemainingThisWeek <= 0 && <span style={{ fontSize: 11, opacity: 0.7 }}>(No calls left)</span>}
              </button>

              <button
                onClick={onVisit}
                disabled={hasVisit || store.visitsRemainingThisSeason <= 0}
                style={{
                  padding: '11px 20px', borderRadius: 10,
                  background: hasVisit ? S.greenSub : S.card,
                  border: `1px solid ${hasVisit ? 'rgba(22,163,74,0.3)' : S.border}`,
                  color: hasVisit ? S.greenBright : S.txtSub,
                  fontSize: 13, fontWeight: 600, cursor: hasVisit || store.visitsRemainingThisSeason <= 0 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: store.visitsRemainingThisSeason <= 0 && !hasVisit ? 0.5 : 1,
                }}
              >
                🏫 {hasVisit ? 'VISIT SCHEDULED ✓' : 'SCHEDULE OFFICIAL VISIT'}
              </button>

              <button
                onClick={onOffer}
                disabled={isOffered}
                style={{
                  padding: '11px 20px', borderRadius: 10,
                  background: isOffered ? S.greenSub : 'rgba(22,163,74,0.15)',
                  border: `1px solid ${isOffered ? 'rgba(22,163,74,0.4)' : 'rgba(22,163,74,0.3)'}`,
                  color: isOffered ? S.greenBright : S.green,
                  fontSize: 13, fontWeight: 600, cursor: isOffered ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                📋 {isOffered ? 'SCHOLARSHIP OFFERED ✓' : 'OFFER SCHOLARSHIP'}
              </button>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── Main recruiting hub ──────────────────────────────────────────────────────
function RecruitingHub() {
  const store = useRecruitingStore();
  const [selectedRecruit, setSelectedRecruit] = useState<Recruit | null>(null);
  const [callModalRecruit, setCallModalRecruit] = useState<Recruit | null>(null);
  const [filterStars, setFilterStars] = useState<number | null>(null);
  const [filterPos, setFilterPos] = useState<string>('');
  const [filterState, setFilterState] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const schoolId = store.userSchoolId ?? '';
  const committed = store.recruits.filter(r => r.committedTo === schoolId);
  const grade = selectClassGrade(store as any);

  // Build school color from NCAA_GAME_TEAMS
  const schoolTeam = NCAA_GAME_TEAMS.find(t => t.id === store.userSchoolId);
  const accentColor = schoolTeam ? `rgb(${hexToRgb(schoolTeam.primaryColor)})` : S.gold;

  const positions = useMemo(() => {
    const pos = new Set(store.recruits.map(r => r.position));
    return Array.from(pos).sort();
  }, [store.recruits]);

  const states = useMemo(() => {
    const st = new Set(store.recruits.map(r => r.state));
    return Array.from(st).sort();
  }, [store.recruits]);

  const filtered = useMemo(() => {
    return store.recruits.filter(r => {
      if (filterStars !== null && r.stars !== filterStars) return false;
      if (filterPos && r.position !== filterPos) return false;
      if (filterState && r.state !== filterState) return false;
      if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [store.recruits, filterStars, filterPos, filterState, searchQuery]);

  const handleCall = (recruit: Recruit) => {
    const success = store.makePhoneCall(recruit.id);
    if (success) {
      setCallModalRecruit(recruit);
    }
  };

  const handleCloseCallModal = () => {
    setCallModalRecruit(null);
    // Check for new commitments after call
    store.checkForCommitments();
  };

  return (
    <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        height: 56, background: S.card, borderBottom: `1px solid ${S.border}`,
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 20, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor }} />
          <span style={{ fontSize: 14, fontWeight: 800, color: S.txt, letterSpacing: 0.5 }}>{store.userSchoolName}</span>
          <span style={{ fontSize: 11, color: S.txtMuted }}>{store.userSchoolConference}</span>
        </div>
        <div style={{ fontSize: 12, color: S.goldBright, fontWeight: 700, marginLeft: 'auto' }}>
          CLASS OF 2026 RECRUITING
        </div>
        <div style={{ fontSize: 12, color: S.txtSub }}>
          Week <strong style={{ color: S.txt }}>{store.weekNumber}</strong> / 20
        </div>
        <button
          onClick={() => store.advanceWeek()}
          disabled={store.weekNumber >= 20}
          style={{
            padding: '6px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700,
            background: store.weekNumber >= 20 ? S.card : 'rgba(196,154,26,0.15)',
            border: `1px solid ${store.weekNumber >= 20 ? S.border : 'rgba(196,154,26,0.3)'}`,
            color: store.weekNumber >= 20 ? S.txtMuted : S.gold,
            cursor: store.weekNumber >= 20 ? 'not-allowed' : 'pointer',
          }}
        >
          {store.weekNumber >= 20 ? 'SIGNING DAY' : 'ADVANCE WEEK ▶'}
        </button>
      </div>

      {/* Three-column layout */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        {/* LEFT: Your class */}
        <div style={{
          width: 240, background: S.card, borderRight: `1px solid ${S.border}`,
          display: 'flex', flexDirection: 'column', flexShrink: 0,
        }}>
          <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${S.border}` }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: S.txtMuted, textTransform: 'uppercase', fontWeight: 700 }}>Class of 2026</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <div style={{
                padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                background: S.greenSub, border: `1px solid rgba(22,163,74,0.3)`,
                color: S.greenBright,
              }}>
                ▲ {committed.length} SIGNED
              </div>
              {committed.length > 0 && (
                <div style={{
                  padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                  background: S.goldSub, border: `1px solid rgba(196,154,26,0.3)`,
                  color: S.gold,
                }}>
                  {grade}
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${S.border}` }}>
            <div style={{ fontSize: 11, color: S.txtMuted, marginBottom: 4 }}>📞 Calls remaining</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${(store.callsRemainingThisWeek / 10) * 100}%`, height: '100%', background: S.blue, borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: store.callsRemainingThisWeek === 0 ? S.red : S.txt }}>
                {store.callsRemainingThisWeek}/10
              </span>
            </div>
            <div style={{ fontSize: 11, color: S.txtMuted, marginTop: 8, marginBottom: 4 }}>🏫 Official visits</div>
            <span style={{ fontSize: 13, fontWeight: 700, color: S.txt }}>{store.visitsRemainingThisSeason}</span>
            <span style={{ fontSize: 11, color: S.txtMuted }}>/5 remaining</span>
          </div>

          {/* Committed list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {committed.length === 0 ? (
              <div style={{ fontSize: 12, color: S.txtMuted, textAlign: 'center', padding: 20, lineHeight: 1.6 }}>
                No commits yet.<br />Call recruits and build interest.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {committed.map(r => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedRecruit(r)}
                    style={{
                      padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                      background: S.cardHi, border: `1px solid ${S.border}`,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    <div style={{ fontSize: 10, color: S.goldBright }}>{starsDisplay(r.stars)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: S.txt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                      <div style={{ fontSize: 10, color: S.txtSub }}>{r.position} · {r.hometown.split(',')[0]}</div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: S.gold }}>{r.rating}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CENTER: Big board */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* Filter bar */}
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${S.border}`, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
            {/* Stars filter */}
            <div style={{ display: 'flex', gap: 6 }}>
              {[null, 5, 4, 3, 2].map(s => (
                <button
                  key={String(s)}
                  onClick={() => setFilterStars(s as number | null)}
                  style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: filterStars === s ? S.goldSub : 'transparent',
                    border: `1px solid ${filterStars === s ? 'rgba(196,154,26,0.4)' : S.border}`,
                    color: filterStars === s ? S.gold : S.txtSub,
                    cursor: 'pointer',
                  }}
                >
                  {s === null ? 'All' : '★'.repeat(s)}
                </button>
              ))}
            </div>

            <select
              value={filterPos}
              onChange={e => setFilterPos(e.target.value)}
              style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, padding: '4px 8px', color: S.txt, fontSize: 11, outline: 'none' }}
            >
              <option value=''>All Positions</option>
              {positions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select
              value={filterState}
              onChange={e => setFilterState(e.target.value)}
              style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, padding: '4px 8px', color: S.txt, fontSize: 11, outline: 'none' }}
            >
              <option value=''>All States</option>
              {states.map(st => <option key={st} value={st}>{st}</option>)}
            </select>

            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search recruits..."
              style={{
                flex: 1, minWidth: 120, maxWidth: 200,
                background: S.card, border: `1px solid ${S.border}`,
                borderRadius: 6, padding: '4px 10px', color: S.txt, fontSize: 11, outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <span style={{ fontSize: 11, color: S.txtMuted, marginLeft: 'auto' }}>{filtered.length} prospects</span>
          </div>

          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '40px 70px 1fr 50px 80px 100px 70px 100px 80px',
            padding: '6px 16px', gap: 8,
            fontSize: 10, letterSpacing: 1, color: S.txtMuted, textTransform: 'uppercase', fontWeight: 700,
            borderBottom: `1px solid ${S.border}`, flexShrink: 0,
          }}>
            <div>#</div>
            <div>Stars</div>
            <div>Name</div>
            <div>Pos</div>
            <div>Ht / Wt</div>
            <div>Hometown</div>
            <div>Comp</div>
            <div>Interest</div>
            <div>Status</div>
          </div>

          {/* Recruit rows */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.map(recruit => {
              const interest = recruit.schoolInterest[schoolId] ?? 0;
              const isSelected = selectedRecruit?.id === recruit.id;
              const isCommittedToMe = recruit.committedTo === schoolId;
              const isCommittedElse = recruit.committedTo && !isCommittedToMe;
              const isHot = interest >= 75;

              return (
                <motion.div
                  key={recruit.id}
                  whileHover={{ scale: 1.005, backgroundColor: '#0f0f1e' }}
                  onClick={() => setSelectedRecruit(isSelected ? null : recruit)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 70px 1fr 50px 80px 100px 70px 100px 80px',
                    padding: '9px 16px', gap: 8,
                    borderBottom: `1px solid ${S.border}`,
                    background: isSelected ? '#0f0f24' : isHot ? 'rgba(196,154,26,0.04)' : 'transparent',
                    cursor: 'pointer',
                    opacity: isCommittedElse ? 0.45 : 1,
                    textDecoration: isCommittedElse ? 'line-through' : 'none',
                    borderLeft: isSelected ? `2px solid ${accentColor}` : '2px solid transparent',
                    transition: 'all 0.15s',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ fontSize: 11, color: S.txtMuted }}>{recruit.nationalRank}</div>
                  <div style={{ fontSize: 11, color: recruit.stars === 5 ? '#ff6b6b' : recruit.stars === 4 ? S.goldBright : S.txtSub }}>
                    {'★'.repeat(recruit.stars)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isCommittedToMe ? S.greenBright : S.txt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {recruit.name}
                    </div>
                  </div>
                  <div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                      background: posColor(recruit.position) + '18',
                      color: posColor(recruit.position),
                    }}>
                      {recruit.position}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: S.txtSub }}>{recruit.height} / {recruit.weight}</div>
                  <div style={{ fontSize: 11, color: S.txtSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {recruit.hometown.split(',')[0]}, {recruit.state}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: S.gold }}>{recruit.compositeScore.toFixed(4)}</div>

                  {/* Interest bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
                      <motion.div
                        animate={{ width: `${interest}%` }}
                        transition={{ type: 'spring', stiffness: 60 }}
                        style={{ height: '100%', background: interestColor(interest), borderRadius: 2 }}
                      />
                    </div>
                    <div style={{ fontSize: 10, color: interestColor(interest), fontWeight: 600 }}>{interest}%</div>
                  </div>

                  {/* Status badge */}
                  <div>
                    {isCommittedToMe ? (
                      <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: S.greenSub, color: S.greenBright, border: `1px solid rgba(22,163,74,0.3)` }}>
                        COMMITTED
                      </span>
                    ) : isCommittedElse ? (
                      <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: S.redSub, color: '#f87171', border: `1px solid rgba(220,38,38,0.2)` }}>
                        LOST
                      </span>
                    ) : store.offeredScholarships.has(recruit.id) && interest >= 85 ? (
                      <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: 'rgba(22,163,74,0.08)', color: S.greenBright, border: `1px solid rgba(22,163,74,0.2)` }}>
                        SOFT COMMIT
                      </span>
                    ) : store.offeredScholarships.has(recruit.id) ? (
                      <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: S.blueSub, color: '#93c5fd', border: `1px solid rgba(59,130,246,0.2)` }}>
                        OFFERED
                      </span>
                    ) : interest > 0 ? (
                      <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: S.goldSub, color: S.gold, border: `1px solid rgba(196,154,26,0.2)` }}>
                        {interestLabel(interest)}
                      </span>
                    ) : (
                      <span style={{ fontSize: 9, color: S.txtMuted }}>—</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Recruit detail or leaderboard */}
        <div style={{
          width: 320, background: S.card, borderLeft: `1px solid ${S.border}`,
          display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
        }}>
          <AnimatePresence mode='wait'>
            {selectedRecruit ? (
              <RecruitDetail
                key={selectedRecruit.id}
                recruit={selectedRecruit}
                onCall={() => handleCall(selectedRecruit)}
                onVisit={() => store.scheduleVisit(selectedRecruit.id)}
                onOffer={() => store.offerScholarship(selectedRecruit.id)}
              />
            ) : (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ padding: 20 }}
              >
                <div style={{ fontSize: 11, letterSpacing: 2, color: S.txtMuted, textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>
                  Class Leaderboard
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { name: 'Alabama', avg: 0.9541, count: 18, color: '#9E1B32' },
                    { name: 'Georgia', avg: 0.9389, count: 20, color: '#BA0C2F' },
                    { name: store.userSchoolName || 'Your School', avg: committed.length > 0 ? committed.reduce((s, r) => s + r.compositeScore, 0) / committed.length : 0, count: committed.length, color: schoolTeam ? `rgb(${hexToRgb(schoolTeam.primaryColor)})` : S.gold, isUser: true },
                    { name: 'Ohio State', avg: 0.9201, count: 17, color: '#BB0000' },
                    { name: 'Texas', avg: 0.9154, count: 19, color: '#BF5700' },
                    { name: 'LSU', avg: 0.9003, count: 16, color: '#461D7C' },
                    { name: 'Michigan', avg: 0.8897, count: 15, color: '#00274C' },
                  ].sort((a, b) => b.avg - a.avg).map((school, i) => (
                    <div
                      key={school.name}
                      style={{
                        padding: '10px 14px', borderRadius: 10,
                        background: (school as any).isUser ? 'rgba(196,154,26,0.08)' : S.cardHi,
                        border: `1px solid ${(school as any).isUser ? 'rgba(196,154,26,0.25)' : S.border}`,
                        display: 'flex', alignItems: 'center', gap: 12,
                      }}
                    >
                      <div style={{ fontSize: 16, fontWeight: 800, color: S.txtMuted, width: 20 }}>#{i + 1}</div>
                      <div style={{ width: 6, height: 28, borderRadius: 3, background: school.color, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: (school as any).isUser ? S.gold : S.txt }}>{school.name}</div>
                        <div style={{ fontSize: 10, color: S.txtMuted }}>{school.count} commits</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: (school as any).isUser ? S.gold : S.txt }}>{school.avg > 0 ? school.avg.toFixed(4) : '—'}</div>
                        <div style={{ fontSize: 10, color: S.txtMuted }}>avg composite</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, padding: 14, borderRadius: 10, background: S.cardHi, border: `1px solid ${S.border}` }}>
                  <div style={{ fontSize: 11, color: S.txtMuted, marginBottom: 6 }}>💡 Click a recruit on the board to view their profile and begin recruiting them.</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Call modal */}
      <AnimatePresence>
        {callModalRecruit && (
          <CallModal
            recruit={callModalRecruit}
            onClose={handleCloseCallModal}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </div>
  );
}

// ─── Signing Day screen ───────────────────────────────────────────────────────
function SigningDayScreen() {
  const store = useRecruitingStore();
  const navigate = useNavigate();
  const schoolId = store.userSchoolId ?? '';
  const committed = store.recruits.filter(r => r.committedTo === schoolId);
  const grade = selectClassGrade(store as any);

  const gradeColor = grade.startsWith('A') ? S.greenBright : grade.startsWith('B') ? S.gold : S.orange;

  return (
    <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} style={{ textAlign: 'center', maxWidth: 700 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: S.gold, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase' }}>National Signing Day</div>
        <h1 style={{ fontSize: 56, fontWeight: 900, color: S.txt, margin: 0, lineHeight: 1.05, letterSpacing: -2 }}>
          CLASS OF 2026<br />IS COMPLETE
        </h1>
        <p style={{ color: S.txtSub, fontSize: 16, marginTop: 16 }}>{store.userSchoolName} · {store.userSchoolConference}</p>

        {/* Grade reveal */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          style={{
            margin: '32px auto',
            width: 120, height: 120, borderRadius: '50%',
            background: `radial-gradient(circle at 40% 40%, ${gradeColor}33, ${gradeColor}11)`,
            border: `3px solid ${gradeColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 52, fontWeight: 900, color: gradeColor }}>{grade}</span>
        </motion.div>

        <div style={{ fontSize: 16, color: S.txtSub, marginBottom: 32 }}>
          {committed.length} commitments · Avg composite {committed.length > 0 ? (committed.reduce((s, r) => s + r.compositeScore, 0) / committed.length).toFixed(4) : '—'}
        </div>

        {/* Hat ceremony list */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, maxWidth: 700, margin: '0 auto 40px' }}>
          {committed.map((recruit, i) => (
            <motion.div
              key={recruit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              style={{
                padding: '14px 16px', borderRadius: 12,
                background: S.card, border: `1px solid ${S.border}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>🎓</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: S.txt }}>{recruit.name}</div>
              <div style={{ fontSize: 11, color: posColor(recruit.position), fontWeight: 700, marginTop: 2 }}>{recruit.position}</div>
              <div style={{ fontSize: 10, color: S.goldBright, marginTop: 4 }}>{'★'.repeat(recruit.stars)}</div>
              <div style={{ fontSize: 10, color: S.txtMuted, marginTop: 4 }}>{recruit.hometown}</div>
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => store.resetRecruiting()}
          style={{
            padding: '14px 36px', borderRadius: 10, fontSize: 14, fontWeight: 700,
            background: S.gold, border: 'none', color: '#000', cursor: 'pointer',
          }}
        >
          Start New Recruiting Class
        </button>
      </motion.div>
    </div>
  );
}

// ─── Top-level router ─────────────────────────────────────────────────────────
export function RecruitingPage() {
  const store = useRecruitingStore();

  if (!store.userSchoolId) {
    return <SetupScreen />;
  }

  if (store.weekNumber >= 20) {
    const schoolId = store.userSchoolId;
    const anyCommits = store.recruits.some(r => r.committedTo === schoolId);
    if (anyCommits) {
      return <SigningDayScreen />;
    }
  }

  return <RecruitingHub />;
}

export default RecruitingPage;
