/**
 * Vercel Serverless Function — /api/scouting/analyze
 * Uses native fetch (Node 20 built-in) to avoid node-fetch header validation issues.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, position, college, grade, traits, description } = req.body;
  if (!name || !position) return res.status(400).json({ error: 'Invalid prospect data' });

  const apiKey = (process.env.ANTHROPIC_API_KEY ?? '').trim();
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  const prompt = `You are an NFL scout writing a detailed scouting report.

Prospect: ${name}
Position: ${position}
College: ${college}
Overall Grade: ${grade}/100
Traits: ${Array.isArray(traits) ? traits.join(', ') : (traits ?? '—')}
Summary: ${description ?? '—'}

Your response MUST start with exactly these two lines (no intro, no preamble):
STRENGTHS: [3 specific strengths, comma-separated, each 2-5 words, football-specific]
CONCERNS: [2 specific concerns, comma-separated, each 2-5 words, football-specific]

Then a blank line, then write a 3-paragraph scouting report covering:
1. What makes this player special and their impact at the next level
2. The team fit / scheme fit analysis
3. Draft recommendation (which round, which team type benefits most)

Be specific, use football terminology, write like a real scout. Keep it tight.`;

  try {
    const upstream = await (globalThis as any).fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 600,
        stream: true,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => 'unknown');
      console.error('[scouting/analyze] upstream error', upstream.status, errText);
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
        } catch { /* skip malformed SSE */ }
      }
    }

    res.end();
  } catch (err: any) {
    console.error('[scouting/analyze]', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate scouting report', detail: String(err?.message ?? err).slice(0, 200) });
    } else {
      res.end();
    }
  }
}
