/**
 * Vercel Serverless Function — /api/scouting/deep-dive
 * Uses native fetch (Node 20 built-in) to avoid node-fetch header validation issues.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const p = req.body;
  if (!p?.name || !p?.position) {
    return res.status(400).json({ error: 'name and position required' });
  }

  const apiKey = (process.env.ANTHROPIC_API_KEY ?? '').trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const prompt = `You are a senior NFL draft analyst writing an elite-level deep-dive scouting report for NFL GMs and head coaches.

PROSPECT FILE:
Name: ${p.name} | Position: ${p.position} | College: ${p.college ?? 'Unknown'} | Draft Year: ${p.year ?? 'N/A'}
Measurables: ${p.height ?? '—'}, ${p.weight ? `${p.weight} lbs` : '—'}${p.fortyTime ? `, ${p.fortyTime}s 40` : ''}
Grade: ${p.grade ?? '—'}/100 | Projected Round: ${p.round ?? 'N/A'}
Key Traits: ${Array.isArray(p.traits) ? p.traits.join(', ') : (p.traits ?? '—')}
Summary: ${p.description ?? '—'}
Strengths: ${Array.isArray(p.strengths) ? p.strengths.join(', ') : (p.strengths ?? '—')}
Weaknesses: ${Array.isArray(p.weaknesses) ? p.weaknesses.join(', ') : (p.weaknesses ?? '—')}
NFL Comp: ${p.comparableTo ?? 'N/A'} | Draft Stock: ${p.draftStockTrend ?? 'steady'}

Write a comprehensive 5-paragraph scouting report:
**1. FILM STUDY & PHYSICAL TOOLS** — What jumps off the screen? Specific plays and situations.
**2. PASS GAME IMPACT / DEFENSIVE DOMINANCE** — Position-specific deep dive on technique and impact.
**3. SCHEME FIT & NFL SYSTEM PROJECTION** — Which systems fit best? Which coordinators maximize their potential?
**4. NFL FLOOR / CEILING & ROLE PROJECTION** — Year 1 vs Year 3. Realistic role.
**5. DRAFT STOCK TRAJECTORY & FINAL RECOMMENDATION** — Round, team types, red flags, final verdict.

Write like a scout with 20 years of experience. Use football terminology. Be specific and opinionated.`;

  try {
    const upstream = await (globalThis as any).fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        stream: true,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => 'unknown');
      console.error('[deep-dive] upstream error', upstream.status, errText);
      return res.status(502).json({ error: 'Anthropic API error', detail: errText.slice(0, 300) });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');

    const reader = (upstream.body as any).getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const evt = JSON.parse(data);
          if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
            res.write(evt.delta.text);
          }
        } catch {
          // malformed SSE line — skip
        }
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
