import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

export const scoutingRouter = Router();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ScoutSchema = z.object({
  name: z.string(),
  position: z.string(),
  college: z.string(),
  grade: z.number(),
  traits: z.array(z.string()),
  description: z.string(),
});

// POST /api/scouting/analyze
scoutingRouter.post('/analyze', async (req, res) => {
  const parsed = ScoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid prospect data' });
  }

  const { name, position, college, grade, traits, description } = parsed.data;

  try {
    const stream = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      stream: true,
      messages: [
        {
          role: 'user',
          content: `You are an NFL scout writing a detailed scouting report.

Prospect: ${name}
Position: ${position}
College: ${college}
Overall Grade: ${grade}/100
Traits: ${traits.join(', ')}
Summary: ${description}

Write a 3-paragraph scouting report covering:
1. What makes this player special and their impact at the next level
2. The team fit / scheme fit analysis
3. Draft recommendation (which round, which team type benefits most)

Be specific, use football terminology, and write like a real scout would. Keep it tight.`,
        },
      ],
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(event.delta.text);
      }
    }

    res.end();
  } catch (err) {
    console.error('[scouting]', err);
    res.status(500).json({ error: 'Failed to generate scouting report' });
  }
});

// POST /api/scouting/class — Generate a full draft class for a given year
scoutingRouter.post('/class', async (req, res) => {
  const { year } = req.body;
  if (!year || typeof year !== 'number' || year < 2025 || year > 2030) {
    return res.status(400).json({ error: 'Invalid year. Must be between 2025 and 2030.' });
  }

  const realPlayersNote = year === 2026
    ? `For 2026, base it on REAL current college players who will be draft eligible:
- Arch Manning (QB, Texas) — grandson of Archie Manning, nephew of Peyton and Eli. Elite arm talent, exceptional football IQ.
- Nico Iamaleava (QB, Tennessee) — elite arm talent, big upside, transferred from Tennessee
- Garrett Nussmeier (QB, LSU) — gunslinger with big arm, NFL bloodlines
- Harold Perkins Jr. (EDGE/LB, LSU) — elite athlete, freak motor, versatile pass rusher
- Isaiah Bond (WR, Texas) — explosive speed, big play ability
- Micah Hudson (WR, Texas Tech) — dynamic playmaker, YAC machine
- Dakorien Moore (WR, Lamar) — elite speed, deep threat
- Ollie Gordon II (RB, Oklahoma State) — Doak Walker winner, power back
- Shemar Stewart (EDGE, Texas A&M) — physically gifted, massive upside if still available
- Demetrius Knight Jr. (LB, South Carolina) — instinctive, rangy linebacker
- Five-Star recruits from the 2022-23 recruiting classes who will be juniors/seniors

Fill the rest of the 60 spots with additional realistic prospects across all positions based on current college football talent.`
    : year === 2027
    ? `For 2027, generate fictional but realistic prospects based on current recruiting classes. Include players who would be 2024-2025 freshman/sophomores projected to stay for 3 years. Create diverse prospects across all positions with realistic college programs (Alabama, Georgia, Ohio State, Texas, Michigan, Penn State, Notre Dame, etc.).`
    : `For ${year}, generate fictional but realistic NFL draft prospects. These are players from the ${year - 4} to ${year - 3} recruiting classes. Create diverse, realistic prospects across all 14 positions with authentic college programs and measurables.`;

  const prompt = `You are an elite NFL draft analyst. Generate the top 60 prospects for the ${year} NFL Draft class.

${realPlayersNote}

Return ONLY valid JSON array — no markdown, no explanation, no code blocks — just the raw JSON array starting with [ and ending with ]. Use this exact structure:
[{
  "id": "arch-manning-2026",
  "name": "Arch Manning",
  "position": "QB",
  "college": "Texas",
  "year": ${year},
  "height": "6'4\\"",
  "weight": 220,
  "fortyTime": 4.65,
  "grade": 97,
  "round": 1,
  "traits": ["Elite Bloodline", "NFL Ready", "Arm Talent"],
  "description": "...",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "comparableTo": "Patrick Mahomes",
  "draftStockTrend": "rising"
}]

Rules:
- grades: R1 players 82-99, R2 players 70-81, R3 players 60-69, R4-5 players 50-59
- draftStockTrend must be exactly "rising", "falling", or "steady"
- Include at least: 4-5 QBs, 4-5 RBs, 8-10 WRs, 3 TEs, 4 OTs, 2 OGs, 5-6 EDGEs, 3-4 DTs, 3 LBs, 4-5 CBs, 3 Ss
- Make descriptions vivid and specific (2-3 sentences each)
- fortyTime: QBs 4.55-4.85, skill positions 4.28-4.55, OL 4.85-5.30, DL 4.75-5.15
- Return exactly 60 prospects`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Strip any markdown code blocks if present
    const jsonText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let prospects;
    try {
      prospects = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error('[scouting/class] JSON parse error:', parseErr);
      console.error('[scouting/class] Raw text:', rawText.slice(0, 500));
      return res.status(500).json({ error: 'Failed to parse draft class JSON', raw: rawText.slice(0, 200) });
    }

    if (!Array.isArray(prospects)) {
      return res.status(500).json({ error: 'Response was not an array' });
    }

    return res.json({ year, prospects, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[scouting/class]', err);
    return res.status(500).json({ error: 'Failed to generate draft class' });
  }
});

// POST /api/scouting/deep-dive — Streams a detailed scouting report for a prospect
scoutingRouter.post('/deep-dive', async (req, res) => {
  const prospect = req.body;
  if (!prospect || !prospect.name || !prospect.position) {
    return res.status(400).json({ error: 'Invalid prospect data' });
  }

  const {
    name,
    position,
    college,
    grade,
    height,
    weight,
    fortyTime,
    traits,
    description,
    strengths,
    weaknesses,
    comparableTo,
    year,
    draftStockTrend,
  } = prospect;

  const prompt = `You are a senior NFL draft analyst writing an elite-level deep-dive scouting report. This report will be read by NFL general managers and head coaches.

PROSPECT FILE:
Name: ${name}
Position: ${position}
College: ${college}
Draft Year: ${year || 'N/A'}
Measurables: ${height}, ${weight} lbs, ${fortyTime ? `${fortyTime}s 40-yard dash` : 'N/A'}
Overall Grade: ${grade}/100
Projected Round: ${prospect.round || 'N/A'}
Key Traits: ${Array.isArray(traits) ? traits.join(', ') : traits}
Brief Summary: ${description}
Strengths: ${Array.isArray(strengths) ? strengths.join(', ') : strengths}
Weaknesses: ${Array.isArray(weaknesses) ? weaknesses.join(', ') : weaknesses}
NFL Comparable: ${comparableTo || 'N/A'}
Draft Stock Trend: ${draftStockTrend || 'steady'}

Write a comprehensive 5-paragraph scouting report covering:

**1. FILM STUDY & PHYSICAL TOOLS**
Break down the tape. What jumps off the screen? Describe specific plays and situations. How do the measurables translate? What do you see on every snap?

**2. PASS GAME IMPACT / DEFENSIVE DOMINANCE**
Position-specific deep dive. For offensive players: route running, pass catching, blocking, or playmaking. For defensive players: pass rush moves, coverage technique, run defense, or playmaking ability.

**3. SCHEME FIT & NFL SYSTEM PROJECTION**
What NFL systems fit this player best? What offensive or defensive coordinator would maximize their potential? Are they a fit in multiple looks or scheme-specific?

**4. NFL FLOOR / CEILING & ROLE PROJECTION**
Be honest about best-case vs worst-case scenarios. What does this player look like in Year 1? Year 3? What is the realistic NFL role? Starter, rotational, special teams ace?

**5. DRAFT STOCK TRAJECTORY & FINAL RECOMMENDATION**
Where does he land on your board? What round? Which team types benefit most? Any red flags teams need to know? Final verdict.

Write like a scout with 20 years of experience. Use football terminology. Be specific, vivid, and opinionated. Do not hedge excessively.`;

  try {
    const stream = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(event.delta.text);
      }
    }

    res.end();
  } catch (err) {
    console.error('[scouting/deep-dive]', err);
    res.status(500).json({ error: 'Failed to generate deep-dive report' });
  }
});

// GET /api/scouting/classes — Returns available cached classes info
scoutingRouter.get('/classes', async (_req, res) => {
  // Return metadata about available classes
  res.json({
    available: [2025, 2026, 2027, 2028],
    cached: [], // client manages its own localStorage cache
  });
});
