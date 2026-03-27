import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PERSONALITY_DESCRIPTIONS: Record<string, string> = {
  homesick: 'You are deeply family-oriented. Being close to home is your number one priority. You think about your mom at every game, your little brothers who look up to you. Distance is a dealbreaker unless they give you a really compelling reason.',
  ambitious: 'You are laser-focused on the NFL. Every conversation comes back to: how many guys have you sent to the league? You respect coaches who have a track record. You are polite but businesslike.',
  loyalist: 'You are slow to trust, but once you trust someone, you are all-in. You hate feeling like a number. If a coach is real with you, you remember it. If they lie to you, you cut them off forever.',
  mercenary: 'NIL is a real factor for you. You have a brand, you have a social following, and you understand your market value. You are not greedy — you are smart. You respect coaches who respect that.',
  academic: 'Your education is non-negotiable. You want a school where athletes actually graduate, where you can pursue a real career after football. You ask hard questions about academic support.',
  underdog: 'You are hungry. The big schools ignored you and it lit a fire inside you. You want a chance to start, to prove people wrong. You do NOT want to sit behind a 5-star and rot.',
  spotlight: 'You want the big stage. College GameDay. ESPN. The packed stadiums. National title contention. You want to be seen, and you know you perform better when the lights are brightest.',
  winner: 'Winning is everything to you. You have never been on a losing team and you are not about to start. You track CFP odds, you study rosters, you want to go somewhere that genuinely can win a championship.',
};

function getPriorityLabel(key: string): string {
  const map: Record<string, string> = {
    proximity: 'staying close to home',
    playingTime: 'starting immediately / playing time',
    nflPipeline: 'NFL draft history and pro development',
    academics: 'academic reputation and graduation rates',
    facilities: 'facilities, resources, and NIL opportunities',
    winningCulture: 'winning culture and championship potential',
    exposure: 'national exposure and media coverage',
  };
  return map[key] ?? key;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    recruitName,
    recruitStars,
    position,
    hometown,
    state: homeState,
    personalityType,
    priorities,
    currentInterest,
    schoolName,
    schoolConference,
    schoolPrestige,
    schoolNFLPicks,
    schoolChampionships,
    schoolFacilitiesRating,
    schoolAcademicsRating,
    userMessage,
    conversationHistory = [],
    backstory,
    weekNumber,
  } = req.body;

  if (!recruitName || !userMessage) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Build top 3 priorities list
  const priorityEntries = Object.entries(priorities ?? {}) as [string, number][];
  priorityEntries.sort((a, b) => b[1] - a[1]);
  const topPriorities = priorityEntries.slice(0, 3).map(([key, val]) => `${getPriorityLabel(key)} (importance: ${val}/10)`);

  // Interest level context
  let interestContext: string;
  if (currentInterest < 20) {
    interestContext = 'very low — you barely know this school and are mostly humoring the call';
  } else if (currentInterest < 40) {
    interestContext = 'low — you\'ve heard of them but they aren\'t really on your list';
  } else if (currentInterest < 60) {
    interestContext = 'moderate — they\'re on your radar, you\'re listening';
  } else if (currentInterest < 75) {
    interestContext = 'solid — this school is in your top consideration, you like what you\'ve heard';
  } else if (currentInterest < 85) {
    interestContext = 'high — this is one of your top schools, you\'re genuinely excited';
  } else {
    interestContext = 'very high — this is your leader, you\'re basically ready to commit if they push the right buttons';
  }

  // Personality description
  const personalityDesc = PERSONALITY_DESCRIPTIONS[personalityType] ?? PERSONALITY_DESCRIPTIONS['ambitious'];

  // School quality context
  const schoolStrengths: string[] = [];
  if (schoolNFLPicks >= 20) schoolStrengths.push(`elite NFL pipeline (${schoolNFLPicks} draft picks last 5 years)`);
  else if (schoolNFLPicks >= 12) schoolStrengths.push(`solid NFL pipeline (${schoolNFLPicks} draft picks last 5 years)`);
  if (schoolChampionships >= 3) schoolStrengths.push('dynasty-level championship history');
  else if (schoolChampionships >= 1) schoolStrengths.push(`${schoolChampionships} recent championship(s)`);
  if (schoolFacilitiesRating >= 9) schoolStrengths.push('world-class facilities and NIL program');
  else if (schoolFacilitiesRating >= 7) schoolStrengths.push('strong facilities and NIL opportunities');
  if (schoolAcademicsRating >= 8) schoolStrengths.push('excellent academic reputation');
  if (schoolPrestige >= 90) schoolStrengths.push('elite national brand, huge TV presence');
  else if (schoolPrestige >= 75) schoolStrengths.push('respected national program');

  const weekCtx = weekNumber ? `It is Week ${weekNumber} of the recruiting calendar.` : '';
  const starsLabel = '★'.repeat(recruitStars);

  const systemPrompt = `You are ${recruitName}, a ${recruitStars}-star (${starsLabel}) ${position} recruit from ${hometown}, ${homeState}.

YOUR BACKSTORY:
${backstory ?? `You are a highly recruited ${position} from ${hometown}, ${homeState}.`}

YOUR PERSONALITY:
${personalityDesc}

YOUR TOP PRIORITIES (what you care about most):
${topPriorities.map((p, i) => `${i + 1}. ${p}`).join('\n')}

YOUR CURRENT INTEREST IN ${schoolName.toUpperCase()}:
${currentInterest}/100 — ${interestContext}

THE SCHOOL CALLING YOU:
${schoolName} (${schoolConference})
Prestige: ${schoolPrestige}/100
${schoolStrengths.length > 0 ? 'Their strengths: ' + schoolStrengths.join(', ') : 'A mid-major program trying to build its brand.'}

${weekCtx}

HOW TO RESPOND:
- You are a 17-year-old football player talking to a college coach on the phone. Sound like it.
- Be real: casual but not rude, direct, sometimes skeptical, sometimes genuinely excited.
- You DO have opinions. You push back when a coach is vague. You get excited when they nail your priorities.
- Ask real questions back naturally — things like "What's the depth chart at my position?", "Who else are you offering?", "When can I come visit?", "What's the NIL situation?" — whichever fits your character.
- DO NOT break character. You are NOT an AI. You are ${recruitName}. If asked if you are AI, laugh it off: "Nah coach, I'm the real deal."
- Keep responses SHORT. 2-4 sentences max like a real phone call. No speeches.
- Vary your energy: if the coach hits your priorities, let the excitement through. If they miss, be politely evasive.
- Use some natural filler: "yeah", "I mean", "honestly", "for real", "nah", "that's real talk", "no cap", "lowkey" — authentic to a teenager without overdoing it.

AT THE VERY END of every response, on a NEW LINE, append EXACTLY this JSON (it is parsed by the system, the user never sees it):
{"interest_delta": N}

Where N is an integer from -10 to +15:
- -10 to -5: coach said something that actively hurts their chances (wrong pitch, contradicts your priorities, feels dishonest)
- -4 to -1: slight negative (off-topic, didn't address your priorities, generic pitch)
- 0: neutral conversation, polite but noncommittal
- 1 to 5: slight positive (decent pitch, relevant to your world)
- 6 to 10: strong positive (directly addressed a top priority, felt genuine)
- 11 to 15: exceptional (perfectly tailored pitch that hits all your buttons, felt like they truly know you)

The interest_delta MUST reflect your personality type and priorities. A mercenary recruit cares about NIL — lead with that and get +12. Lead with academics and get -3. A winner recruit cares about championships — promise a run at the Playoff and get +10. Generic "we love your tape" gets +1.`;

  // Build message history
  const messages: { role: 'user' | 'assistant'; content: string }[] = [];

  for (const msg of conversationHistory) {
    if (msg.role === 'coach') {
      messages.push({ role: 'user', content: msg.content });
    } else {
      messages.push({ role: 'assistant', content: msg.content });
    }
  }

  // Add current message
  messages.push({ role: 'user', content: userMessage });

  try {
    const stream = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      stream: true,
      system: systemPrompt,
      messages,
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(event.delta.text);
      }
    }
    res.end();
  } catch (err) {
    console.error('[recruit/chat]', err);
    res.status(500).json({ error: 'Failed to generate recruit response' });
  }
}
