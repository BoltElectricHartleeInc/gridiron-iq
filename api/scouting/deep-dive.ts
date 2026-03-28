/**
 * Vercel Serverless Function — /api/scouting/deep-dive
 * Uses @anthropic-ai/sdk (available in root node_modules via workspaces).
 */
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY?.trim() });

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const p = req.body;
  if (!p?.name || !p?.position) {
    return res.status(400).json({ error: 'name and position required' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const prompt = `You are a senior NFL draft analyst writing an elite-level deep-dive scouting report.

PROSPECT FILE:
Name: ${p.name}
Position: ${p.position}
College: ${p.college ?? 'Unknown'}
Measurables: ${p.height ?? '—'}, ${p.weight ? `${p.weight} lbs` : '—'}, ${p.fortyTime ? `${p.fortyTime}s 40-yard dash` : '—'}
Overall Grade: ${p.grade ?? '—'}/100
Projected Round: ${p.round ?? '—'}
Key Traits: ${Array.isArray(p.traits) ? p.traits.join(', ') : (p.traits ?? '—')}
Brief Summary: ${p.description ?? '—'}
Strengths: ${Array.isArray(p.strengths) ? p.strengths.join(', ') : (p.strengths ?? '—')}
Weaknesses: ${Array.isArray(p.weaknesses) ? p.weaknesses.join(', ') : (p.weaknesses ?? '—')}
NFL Comparable: ${p.comparableTo ?? '—'}
Draft Stock Trend: ${p.draftStockTrend ?? 'steady'}

Write a comprehensive 5-paragraph scouting report covering:

**1. FILM STUDY & PHYSICAL TOOLS**
**2. PASS GAME IMPACT / DEFENSIVE DOMINANCE**
**3. SCHEME FIT & NFL SYSTEM PROJECTION**
**4. NFL FLOOR / CEILING & ROLE PROJECTION**
**5. DRAFT STOCK TRAJECTORY & FINAL RECOMMENDATION**

Write like a scout with 20 years of experience. Be specific, vivid, and opinionated.`;

  try {
    const stream = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
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
  } catch (err: any) {
    console.error('[deep-dive]', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate scouting report', detail: String(err?.message ?? err).slice(0, 200) });
    } else {
      res.end();
    }
  }
}
