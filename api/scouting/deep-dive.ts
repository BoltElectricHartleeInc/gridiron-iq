/**
 * Vercel Serverless Function — /api/scouting/deep-dive
 * Uses native fetch (Node 20 built-in) to avoid node-fetch header validation issues.
 */

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

  const apiKey = (process.env.ANTHROPIC_API_KEY ?? '').trim();
  if (!apiKey) {
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
      return res.status(502).json({ error: 'Anthropic API error', detail: errText.slice(0, 200) });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');

    const reader = upstream.body!.getReader();
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
