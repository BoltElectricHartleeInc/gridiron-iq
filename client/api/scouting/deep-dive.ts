import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, position, college, grade, height, weight, fortyTime, traits,
    description, strengths, weaknesses, comparableTo, year, draftStockTrend, round } = req.body;

  if (!name || !position) return res.status(400).json({ error: 'Invalid prospect data' });

  try {
    const stream = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      stream: true,
      messages: [{
        role: 'user',
        content: `You are a senior NFL draft analyst writing an elite-level deep-dive scouting report for NFL GMs and head coaches.

PROSPECT FILE:
Name: ${name} | Position: ${position} | College: ${college} | Draft Year: ${year ?? 'N/A'}
Measurables: ${height}, ${weight} lbs${fortyTime ? `, ${fortyTime}s 40` : ''}
Grade: ${grade}/100 | Projected Round: ${round ?? 'N/A'}
Key Traits: ${Array.isArray(traits) ? traits.join(', ') : traits}
Summary: ${description}
Strengths: ${Array.isArray(strengths) ? strengths.join(', ') : strengths}
Weaknesses: ${Array.isArray(weaknesses) ? weaknesses.join(', ') : weaknesses}
NFL Comp: ${comparableTo ?? 'N/A'} | Draft Stock: ${draftStockTrend ?? 'steady'}

Write a comprehensive 5-paragraph scouting report:
**1. FILM STUDY & PHYSICAL TOOLS** — What jumps off the screen? Specific plays and situations.
**2. PASS GAME IMPACT / DEFENSIVE DOMINANCE** — Position-specific deep dive on technique and impact.
**3. SCHEME FIT & NFL SYSTEM PROJECTION** — Which systems fit best? Which coordinators maximize their potential?
**4. NFL FLOOR / CEILING & ROLE PROJECTION** — Year 1 vs Year 3. Realistic role.
**5. DRAFT STOCK TRAJECTORY & FINAL RECOMMENDATION** — Round, team types, red flags, final verdict.

Write like a scout with 20 years of experience. Use football terminology. Be specific and opinionated.`,
      }],
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
    console.error('[scouting/deep-dive]', err);
    res.status(500).json({ error: 'Failed to generate deep-dive report' });
  }
}
