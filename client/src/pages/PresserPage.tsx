import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell, C, Badge } from '../components/AppShell';

// ─── Types ────────────────────────────────────────────────────────────────────
type AnswerTone = 'fired' | 'measured' | 'funny';

interface QuestionSet {
  reporter: string;
  question: string;
  answers: {
    tone: AnswerTone;
    label: string;
    text: string;
    consequence: string;
    consequenceType: 'positive' | 'negative' | 'neutral';
    bonus: { label: string; value: number };
  }[];
}

// ─── Question Sets (WIN) ───────────────────────────────────────────────────────
const WIN_QUESTIONS: QuestionSet[] = [
  {
    reporter: 'Sarah Mitchell, ESPN',
    question: "Coach, great win tonight. What was the key adjustment you made in the second half?",
    answers: [
      {
        tone: 'fired',
        label: 'FIRED UP',
        text: "We knew they couldn't stop our play-action all night. I told the guys at halftime — they're playing soft coverage and we're going to exploit it until they adjust. They never adjusted. That's on them.",
        consequence: "Bulletin board material! Opponent gets +3 motivation next game",
        consequenceType: 'negative',
        bonus: { label: 'Player Confidence', value: 2 },
      },
      {
        tone: 'measured',
        label: 'MEASURED',
        text: "We made some schematic tweaks — tightened our protection schemes and got the ball out quicker on third down. Credit to our offensive staff for the adjustments and the players for executing.",
        consequence: "Respected response — +1 free agent attraction",
        consequenceType: 'positive',
        bonus: { label: 'Reputation', value: 1 },
      },
      {
        tone: 'funny',
        label: 'FUNNY',
        text: "Honestly? I reminded them the snack table after the game is better when we win. Works every time. But seriously, our guys made the plays when it counted.",
        consequence: "Crowd & players love it — +2 team chemistry",
        consequenceType: 'positive',
        bonus: { label: 'Team Chemistry', value: 2 },
      },
    ],
  },
  {
    reporter: 'Marcus Torres, NFL Network',
    question: "Your offense looked unstoppable in that third quarter. What schematic advantage did you identify?",
    answers: [
      {
        tone: 'fired',
        label: 'FIRED UP',
        text: "They were playing two-high all game and we had our best matchups in the slot. Once we found that, it was over. Honestly, their coordinator should've seen it coming a mile away.",
        consequence: "Bulletin board material! +2 opponent motivation",
        consequenceType: 'negative',
        bonus: { label: 'Player Hype', value: 3 },
      },
      {
        tone: 'measured',
        label: 'MEASURED',
        text: "Our guys identified some coverage tendencies during the week. We had specific route concepts designed to attack their leverage and our receivers ran clean routes to exploit the space.",
        consequence: "Film room credibility — +1 scout interest",
        consequenceType: 'positive',
        bonus: { label: 'Recruiting', value: 1 },
      },
      {
        tone: 'funny',
        label: 'FUNNY',
        text: "We ran the same play 11 times and they never figured it out. I don't know if that says more about us or them. I'm just glad it worked.",
        consequence: "Players are laughing in the locker room — +2 morale",
        consequenceType: 'positive',
        bonus: { label: 'Team Morale', value: 2 },
      },
    ],
  },
  {
    reporter: 'Dana Reed, The Athletic',
    question: "Your quarterback had another elite performance tonight. How much does his leadership mean to this team?",
    answers: [
      {
        tone: 'fired',
        label: 'FIRED UP',
        text: "He's the best player in this league and it's not close. Anyone who doesn't see that isn't watching the film. He wills this team to win. Period.",
        consequence: "QB loves the support — +3 QB morale, but media scrutiny incoming",
        consequenceType: 'positive',
        bonus: { label: 'QB Trust', value: 3 },
      },
      {
        tone: 'measured',
        label: 'MEASURED',
        text: "He's a tremendous leader both on and off the field. He prepares at an incredibly high level and his teammates feed off his energy. We're fortunate to have him.",
        consequence: "Balanced praise — +1 locker room culture",
        consequenceType: 'positive',
        bonus: { label: 'Locker Room', value: 1 },
      },
      {
        tone: 'funny',
        label: 'FUNNY',
        text: "He threatened to call the media on me if I didn't answer more questions about him. So — he's great, he's wonderful, he's the best. [laughs] No but seriously, he's everything to this team.",
        consequence: "Fan favorite response — +2 public support",
        consequenceType: 'positive',
        bonus: { label: 'Fan Support', value: 2 },
      },
    ],
  },
  {
    reporter: 'Jake Freeman, CBS Sports',
    question: "You're now 8-2. Are you thinking about home field advantage in the playoffs?",
    answers: [
      {
        tone: 'fired',
        label: 'FIRED UP',
        text: "Home field? We're thinking about a Super Bowl. Home field's just a step. We have bigger goals than that and this team knows it. We don't celebrate stepping stones.",
        consequence: "Big statement — +4 player motivation, pressure increases",
        consequenceType: 'positive',
        bonus: { label: 'Ambition', value: 4 },
      },
      {
        tone: 'measured',
        label: 'MEASURED',
        text: "We're taking it one game at a time. The next game on our schedule is all that matters. If home field takes care of itself, great. But we won't get ahead of ourselves.",
        consequence: "Classic coach-speak — media sighs, players stay focused",
        consequenceType: 'neutral',
        bonus: { label: 'Focus', value: 1 },
      },
      {
        tone: 'funny',
        label: 'FUNNY',
        text: "My wife wants to know if we'll get home field because she's tired of traveling. I'll let her answer that question for me. As for us — we'll see.",
        consequence: "Twitter loves the answer — +2 fan engagement",
        consequenceType: 'positive',
        bonus: { label: 'Fan Engagement', value: 2 },
      },
    ],
  },
];

// ─── Question Sets (LOSS) ─────────────────────────────────────────────────────
const LOSS_QUESTIONS: QuestionSet[] = [
  {
    reporter: 'Sarah Mitchell, ESPN',
    question: "Coach, what went wrong in the second half? You had the lead.",
    answers: [
      {
        tone: 'fired',
        label: 'FIRED UP',
        text: "We let our foot off the gas. That's on me and I'm not going to sugarcoat it. We stopped executing when it mattered and I won't tolerate that. Changes are coming this week.",
        consequence: "Players rattled — team morale drops but accountability respected",
        consequenceType: 'negative',
        bonus: { label: 'Accountability', value: 2 },
      },
      {
        tone: 'measured',
        label: 'MEASURED',
        text: "They made some good adjustments and we weren't able to counter. We'll go back to the film and identify what we can do better. It's a learning opportunity for this group.",
        consequence: "Calm response appreciated — +1 player trust",
        consequenceType: 'neutral',
        bonus: { label: 'Player Trust', value: 1 },
      },
      {
        tone: 'funny',
        label: 'FUNNY',
        text: "I'd like to blame Mercury being in retrograde but my coordinators would fire me. We just didn't play our best when it counted. Simple as that.",
        consequence: "Players appreciate the deflection — +1 team chemistry",
        consequenceType: 'positive',
        bonus: { label: 'Team Chemistry', value: 1 },
      },
    ],
  },
  {
    reporter: 'Marcus Torres, NFL Network',
    question: "Three turnovers tonight — is that a personnel issue or a scheme issue?",
    answers: [
      {
        tone: 'fired',
        label: 'FIRED UP',
        text: "Neither. It's an execution issue. We have the right guys and the right scheme. Some players need to make better decisions with the football. That's the bottom line.",
        consequence: "Players feel called out — -1 morale, +2 discipline",
        consequenceType: 'negative',
        bonus: { label: 'Discipline', value: 2 },
      },
      {
        tone: 'measured',
        label: 'MEASURED',
        text: "I'd prefer not to place blame publicly. We'll evaluate everything — personnel, scheme, situational awareness — and address it this week in practice.",
        consequence: "Players feel protected — +2 trust, +1 free agent appeal",
        consequenceType: 'positive',
        bonus: { label: 'Player Loyalty', value: 2 },
      },
      {
        tone: 'funny',
        label: 'FUNNY',
        text: "My grandmother watching at home could've caught two of those. But she's 78 and her hands aren't what they were, so. Look — we need to protect the ball better. That's it.",
        consequence: "Tense room gets lighter — +1 team chemistry",
        consequenceType: 'positive',
        bonus: { label: 'Tension Relief', value: 1 },
      },
    ],
  },
  {
    reporter: 'Dana Reed, The Athletic',
    question: "Are you concerned about your team's ability to close out games this season?",
    answers: [
      {
        tone: 'fired',
        label: 'FIRED UP',
        text: "Concerned? No. Pissed off? Absolutely. We know how to win. We've done it. We just didn't do it tonight and I will make sure that doesn't happen again. Watch.",
        consequence: "Bold guarantee — +3 player motivation, pressure on everyone",
        consequenceType: 'positive',
        bonus: { label: 'Team Fire', value: 3 },
      },
      {
        tone: 'measured',
        label: 'MEASURED',
        text: "Every team goes through stretches like this. What defines you is how you respond. I have full confidence in this group's ability to make the necessary corrections.",
        consequence: "Steady hand — +1 veteran player confidence",
        consequenceType: 'neutral',
        bonus: { label: 'Steadiness', value: 1 },
      },
      {
        tone: 'funny',
        label: 'FUNNY',
        text: "My therapist is concerned. I'm not paying her $400 an hour to be wrong. But as for the team — we're fine. We'll figure it out.",
        consequence: "Room erupts — players respect the honesty, +2 chemistry",
        consequenceType: 'positive',
        bonus: { label: 'Authenticity', value: 2 },
      },
    ],
  },
  {
    reporter: 'Jake Freeman, CBS Sports',
    question: "This is your third loss in five games. What message did you give the team after the game?",
    answers: [
      {
        tone: 'fired',
        label: 'FIRED UP',
        text: "I told them exactly what I thought. The ones who want to be great heard it and the ones who don't — won't be here long. Simple message. Simple consequences.",
        consequence: "Intense delivery — some players nervous, others energized. +1/-1 net",
        consequenceType: 'neutral',
        bonus: { label: 'Intensity', value: 1 },
      },
      {
        tone: 'measured',
        label: 'MEASURED',
        text: "I reminded them who they are. This locker room has too much talent and too much character to let this stretch define us. We'll bounce back.",
        consequence: "Strong leader moment — +2 team morale, +1 vet buy-in",
        consequenceType: 'positive',
        bonus: { label: 'Leadership', value: 2 },
      },
      {
        tone: 'funny',
        label: 'FUNNY',
        text: "I said: 'I love you all, but this is embarrassing and my kids are watching.' They laughed. Then we got serious. Sometimes that's what you need.",
        consequence: "Humanizing moment — players feel connected to coach, +2 trust",
        consequenceType: 'positive',
        bonus: { label: 'Connection', value: 2 },
      },
    ],
  },
];

// ─── Presser style determination ──────────────────────────────────────────────
function getPresserStyle(tones: AnswerTone[]): string {
  const counts = { fired: 0, measured: 0, funny: 0 };
  tones.forEach(t => counts[t]++);
  if (counts.fired >= 2) return 'FIRED UP COACH';
  if (counts.measured >= 2) return 'CALCULATED';
  if (counts.funny >= 2) return 'FAN FAVORITE';
  return 'WELL-ROUNDED';
}

const TONE_CONFIG = {
  fired:   { color: C.red,       label: 'FIRED UP', emoji: '⚡' },
  measured:{ color: C.blueBright,label: 'MEASURED',  emoji: '📊' },
  funny:   { color: C.gold,      label: 'FUNNY',    emoji: '😄' },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PresserPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const teamId    = searchParams.get('teamId') ?? 'kc';
  const opponent  = searchParams.get('opponent') ?? 'Ravens';
  const playerWon = searchParams.get('playerWon') !== 'false';
  const score     = searchParams.get('score') ?? '31-24';
  const week      = searchParams.get('week') ?? '12';

  const questionPool = playerWon ? WIN_QUESTIONS : LOSS_QUESTIONS;
  const [questions] = useState<QuestionSet[]>(() => {
    const shuffled = [...questionPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });

  const [currentQ,      setCurrentQ]      = useState(0);
  const [selectedTones, setSelectedTones] = useState<AnswerTone[]>([]);
  const [showAnswer,    setShowAnswer]    = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<(typeof questions[0]['answers'][0]) | null>(null);
  const [done,          setDone]          = useState(false);
  const [totalBonuses,  setTotalBonuses]  = useState<{ label: string; value: number }[]>([]);
  const [headline,      setHeadline]      = useState('');

  const handleAnswer = (ans: typeof questions[0]['answers'][0]) => {
    setSelectedAnswer(ans);
    setShowAnswer(true);
  };

  const advance = () => {
    if (!selectedAnswer) return;
    const newTones   = [...selectedTones, selectedAnswer.tone];
    setSelectedTones(newTones);
    const newBonuses = [...totalBonuses, selectedAnswer.bonus];
    setTotalBonuses(newBonuses);

    if (currentQ + 1 >= questions.length) {
      const headlineBase = selectedAnswer.text.split('.')[0];
      setHeadline(headlineBase.slice(0, 80) + (headlineBase.length > 80 ? '...' : ''));
      setDone(true);
    } else {
      setCurrentQ(q => q + 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
    }
  };

  const q            = questions[currentQ];
  const homeScore    = score.split('-')[0];
  const awayScore    = score.split('-')[1];
  const presserStyle = getPresserStyle(selectedTones);
  const teamAbbr     = teamId.toUpperCase();

  const styleColor = presserStyle === 'FIRED UP COACH' ? C.red
    : presserStyle === 'FAN FAVORITE' ? C.gold
    : presserStyle === 'CALCULATED'   ? C.blueBright : C.green;

  return (
    <AppShell backTo="/" title="Press Conference" maxWidth={760}>
      {/* Podium header */}
      <div style={{
        background: `linear-gradient(180deg, ${C.panel} 0%, ${C.bg} 100%)`,
        border: `1px solid ${C.border}`,
        borderRadius: 16, marginBottom: 28,
        padding: '28px 28px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Spotlight effect */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Team badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 52, height: 52, borderRadius: 12,
          background: C.elevated, border: `2px solid ${C.borderHi}`,
          fontWeight: 900, fontSize: 16, color: C.txt, marginBottom: 14,
        }}>
          {teamAbbr}
        </div>

        <div style={{ fontSize: 10, letterSpacing: '.22em', color: C.txtMuted, marginBottom: 10, fontWeight: 700 }}>
          POST-GAME PRESS CONFERENCE
        </div>

        {/* Score */}
        <div style={{ fontSize: 26, fontWeight: 900, color: C.txt, marginBottom: 6 }}>
          {teamAbbr} <span style={{ color: playerWon ? C.green : C.txt }}>{homeScore}</span>
          <span style={{ color: C.txtMuted, margin: '0 12px', fontSize: 18 }}>vs</span>
          {opponent} {awayScore}
          <span style={{
            fontSize: 11, letterSpacing: '.1em', color: C.gold,
            background: C.goldSub, border: `1px solid ${C.gold}40`,
            padding: '3px 10px', borderRadius: 6, marginLeft: 14,
            verticalAlign: 'middle', fontWeight: 700,
          }}>FINAL</span>
        </div>

        <div style={{ fontSize: 12, color: C.txtSub, marginBottom: 14 }}>
          Week {week} · 2026 NFL Season
        </div>

        <div style={{ display: 'inline-block' }}>
          <Badge
            color={playerWon ? C.green : C.red}
            dot
          >
            {playerWon ? 'WIN' : 'LOSS'}
          </Badge>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key={`q-${currentQ}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            {/* Progress */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {questions.map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: i < currentQ ? C.green : i === currentQ ? C.borderHi : C.border,
                  transition: 'all 0.3s',
                }} />
              ))}
              <span style={{ fontSize: 11, color: C.txtSub, marginLeft: 8, fontWeight: 700, flexShrink: 0 }}>
                {currentQ + 1}/{questions.length}
              </span>
            </div>

            {/* Reporter info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: C.panel, border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>
                🎤
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.txt }}>{q.reporter}</div>
                <div style={{ fontSize: 11, color: C.txtSub }}>Press Row</div>
              </div>
            </div>

            {/* Question card */}
            <div style={{
              fontSize: 18, fontWeight: 600, lineHeight: 1.55, color: C.txt,
              padding: '20px 24px',
              background: C.surface,
              borderRadius: 14,
              border: `1px solid ${C.border}`,
              borderLeft: `4px solid ${C.borderHi}`,
            }}>
              "{q.question}"
            </div>

            {/* Answer buttons */}
            {!showAnswer && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: C.txtMuted, marginBottom: 2 }}>
                  CHOOSE YOUR RESPONSE
                </div>
                {q.answers.map((ans) => {
                  const cfg = TONE_CONFIG[ans.tone];
                  return (
                    <motion.button
                      key={ans.tone}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAnswer(ans)}
                      style={{
                        padding: '16px 20px',
                        background: `color-mix(in srgb, ${cfg.color} 8%, ${C.surface})`,
                        border: `1px solid color-mix(in srgb, ${cfg.color} 30%, transparent)`,
                        borderRadius: 12,
                        color: C.txt,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex', gap: 16, alignItems: 'flex-start',
                        transition: 'border-color 140ms, background 140ms',
                      }}
                    >
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{cfg.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 800, color: cfg.color, fontSize: 11, letterSpacing: '.1em', marginBottom: 6 }}>
                          {cfg.label}
                        </div>
                        <div style={{ fontSize: 13, color: C.txtSub, lineHeight: 1.5 }}>
                          {ans.label}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Answer reveal */}
            {showAnswer && selectedAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                {/* Quote */}
                <div style={{
                  padding: '20px 24px',
                  background: C.surface,
                  borderRadius: 14,
                  border: `1px solid ${TONE_CONFIG[selectedAnswer.tone].color}30`,
                  borderLeft: `4px solid ${TONE_CONFIG[selectedAnswer.tone].color}`,
                }}>
                  <div style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: '.16em',
                    color: TONE_CONFIG[selectedAnswer.tone].color,
                    marginBottom: 10,
                  }}>
                    YOUR RESPONSE {TONE_CONFIG[selectedAnswer.tone].emoji}
                  </div>
                  <div style={{ fontSize: 15, lineHeight: 1.7, color: C.txt }}>
                    "{selectedAnswer.text}"
                  </div>
                </div>

                {/* Consequence */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  style={{
                    padding: '14px 18px',
                    background: selectedAnswer.consequenceType === 'positive'
                      ? C.greenSub
                      : selectedAnswer.consequenceType === 'negative'
                      ? C.redSub
                      : C.blueSub,
                    borderRadius: 12,
                    border: `1px solid ${selectedAnswer.consequenceType === 'positive'
                      ? `${C.green}30`
                      : selectedAnswer.consequenceType === 'negative'
                      ? `${C.red}30`
                      : `${C.blueBright}30`}`,
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>
                    {selectedAnswer.consequenceType === 'positive' ? '✅'
                      : selectedAnswer.consequenceType === 'negative' ? '⚠️' : '📋'}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.txt, marginBottom: 4 }}>
                      {selectedAnswer.consequence}
                    </div>
                    <div style={{ fontSize: 13, color: C.green, fontWeight: 700 }}>
                      +{selectedAnswer.bonus.value} {selectedAnswer.bonus.label}
                    </div>
                  </div>
                </motion.div>

                <button
                  onClick={advance}
                  style={{
                    padding: '14px 28px',
                    background: C.green,
                    color: '#000',
                    border: 'none', borderRadius: 10,
                    fontWeight: 800, fontSize: 14, cursor: 'pointer',
                    alignSelf: 'flex-start', letterSpacing: '.04em',
                  }}
                >
                  {currentQ + 1 >= questions.length ? 'See Presser Summary →' : 'Next Question →'}
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            {/* Presser style */}
            <div style={{
              textAlign: 'center', padding: '32px 24px 24px',
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(ellipse at 50% 100%, ${styleColor}15 0%, transparent 60%)`,
                pointerEvents: 'none',
              }} />
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', color: C.txtMuted, marginBottom: 14 }}>
                YOUR PRESSER STYLE
              </div>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.4 }}
                style={{ fontSize: 32, fontWeight: 900, letterSpacing: '.04em', color: styleColor }}
              >
                {presserStyle === 'FIRED UP COACH' ? '⚡' : presserStyle === 'FAN FAVORITE' ? '😄' : presserStyle === 'CALCULATED' ? '📊' : '🏆'} {presserStyle}
              </motion.div>
            </div>

            {/* Tone breakdown */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {selectedTones.map((tone, i) => {
                const cfg = TONE_CONFIG[tone];
                return (
                  <div key={i} style={{
                    padding: '8px 16px', borderRadius: 999,
                    background: `color-mix(in srgb, ${cfg.color} 12%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${cfg.color} 30%, transparent)`,
                    color: cfg.color, fontWeight: 700, fontSize: 12,
                    display: 'flex', gap: 6, alignItems: 'center',
                  }}>
                    {cfg.emoji} Q{i + 1}: {cfg.label}
                  </div>
                );
              })}
            </div>

            {/* Bonuses earned */}
            <div style={{ background: C.surface, borderRadius: 14, padding: 20, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.txt, marginBottom: 14 }}>Bonuses Earned</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {totalBonuses.map((b, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0', borderBottom: `1px solid ${C.border}`,
                  }}>
                    <span style={{ color: C.txtSub, fontSize: 13 }}>{b.label}</span>
                    <span style={{ fontWeight: 700, color: C.green, fontSize: 13 }}>+{b.value}</span>
                  </div>
                ))}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: 12, fontWeight: 700,
                }}>
                  <span style={{ color: C.txt }}>Total Bonus Points</span>
                  <span style={{ color: C.green, fontSize: 22, fontWeight: 900 }}>
                    +{totalBonuses.reduce((s, b) => s + b.value, 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Generated headline */}
            {headline && (
              <div style={{ background: C.surface, borderRadius: 14, padding: 20, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.18em', color: C.txtMuted, marginBottom: 10 }}>
                  GENERATED HEADLINE
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.45, color: C.gold }}>
                  "{headline}"
                </div>
              </div>
            )}

            {/* Return */}
            <button
              onClick={() => navigate(-1)}
              style={{
                width: '100%', padding: '15px 0',
                background: C.green, color: '#000',
                border: 'none', borderRadius: 10,
                fontWeight: 800, fontSize: 15, cursor: 'pointer', letterSpacing: '.04em',
              }}
            >
              Return to Game
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
