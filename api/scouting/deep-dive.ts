/**
 * Vercel Serverless Function — /api/scouting/deep-dive
 * Streams an AI scouting report for a prospect directly from Anthropic.
 * No Railway server dependency.
 */

export default async function handler(req: any, res: any) {
  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const p = req.body;
  if (!p?.name || !p?.position) {
    return res.status(400).json({ error: 'name and position required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  const prompt = `You are a senior NFL draft analyst writing an elite-level deep-dive scouting report. This report will be read by NFL general managers and head coaches.

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
What jumps off the tape? Describe specific plays and situations. How do the measurables translate?

**2. PASS GAME IMPACT / DEFENSIVE DOMINANCE**
Position-specific deep dive. Route running, pass rushing, coverage technique, playmaking — whatever fits the position.

**3. SCHEME FIT & NFL SYSTEM PROJECTION**
What NFL systems fit best? What coordinator maximizes their potential?

**4. NFL FLOOR / CEILING & ROLE PROJECTION**
Honest assessment. Year 1 vs Year 3. Starter, rotational, special teams?

**5. DRAFT STOCK TRAJECTORY & FINAL RECOMMENDATION**
Where does he land? Which team types benefit most? Any red flags? Final verdict.

Write like a scout with 20 years of experience. Be specific, vivid, and opinionated.`;

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
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

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      return res.status(502).json({ error: `Anthropic error: ${err.slice(0, 200)}` });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const reader = anthropicRes.body!.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop()!;
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const event = JSON.parse(data);
          if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
            res.write(event.delta.text);
          }
        } catch { /* skip malformed SSE lines */ }
      }
    }

    res.end();
  } catch (err: any) {
    console.error('[deep-dive]', err);
    // If headers already sent (streaming started), just end
    if (!res.headersSent) {
      res.status(500).json({ error: 'Streaming failed' });
    } else {
      res.end();
    }
  }
}
