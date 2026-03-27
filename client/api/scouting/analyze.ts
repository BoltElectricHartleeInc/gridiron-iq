import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, position, college, grade, traits, description } = req.body;
  if (!name || !position) return res.status(400).json({ error: 'Invalid prospect data' });

  try {
    const stream = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      stream: true,
      messages: [{
        role: 'user',
        content: `You are an NFL scout writing a detailed scouting report.

Prospect: ${name}
Position: ${position}
College: ${college}
Overall Grade: ${grade}/100
Traits: ${traits?.join(', ')}
Summary: ${description}

Write a 3-paragraph scouting report covering:
1. What makes this player special and their impact at the next level
2. The team fit / scheme fit analysis
3. Draft recommendation (which round, which team type benefits most)

Be specific, use football terminology, and write like a real scout would. Keep it tight.`,
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
    console.error('[scouting/analyze]', err);
    res.status(500).json({ error: 'Failed to generate scouting report' });
  }
}
