/**
 * Vercel Serverless Function — /api/scouting/chat
 * Lets users ask follow-up questions to the AI scout about a specific prospect.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prospect, report, messages, question } = req.body;
  if (!prospect || !question) return res.status(400).json({ error: 'Missing prospect or question' });

  const apiKey = (process.env.ANTHROPIC_API_KEY ?? '').trim();
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  const systemPrompt = `You are an experienced NFL scout who just wrote the following scouting report on ${prospect.name} (${prospect.position}, ${prospect.college}):

${report ?? '(report not yet generated)'}

The prospect's data:
- Overall Grade: ${prospect.grade}/100
- Traits: ${Array.isArray(prospect.traits) ? prospect.traits.join(', ') : '—'}
- Height/Weight: ${prospect.height ?? '—'} / ${prospect.weight ?? '—'} lbs
- Comparable player: ${prospect.comparableTo ?? '—'}

Answer the user's follow-up questions about this player concisely and specifically — like a scout talking to a GM. Use football terminology. Keep answers under 120 words. Don't repeat what was already in the report unless directly asked.`;

  // Build message history for multi-turn conversation
  const history = Array.isArray(messages) ? messages : [];
  const allMessages = [
    ...history,
    { role: 'user', content: question },
  ];

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
        max_tokens: 300,
        stream: true,
        system: systemPrompt,
        messages: allMessages,
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => 'unknown');
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
    console.error('[scouting/chat]', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed', detail: String(err?.message ?? err).slice(0, 200) });
    } else {
      res.end();
    }
  }
}
