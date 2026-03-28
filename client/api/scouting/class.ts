/**
 * Vercel Serverless Function — /api/scouting/class
 * Uses native fetch (Node 20 built-in) to avoid node-fetch header validation issues.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { year } = req.body;
  if (!year || typeof year !== 'number' || year < 2025 || year > 2030) {
    return res.status(400).json({ error: 'Invalid year. Must be between 2025 and 2030.' });
  }

  const apiKey = (process.env.ANTHROPIC_API_KEY ?? '').trim();
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  const realPlayersNote = year === 2027
    ? `For 2027, generate fictional but realistic prospects based on current recruiting classes.`
    : `For ${year}, generate fictional but realistic NFL draft prospects from the ${year - 4} to ${year - 3} recruiting classes.`;

  const prompt = `You are an elite NFL draft analyst. Generate the top 60 prospects for the ${year} NFL Draft class.

${realPlayersNote}

Return ONLY valid JSON array — no markdown, no explanation — just the raw JSON array starting with [ and ending with ].
[{
  "id": "player-name-${year}",
  "name": "Player Name",
  "position": "QB",
  "college": "Alabama",
  "year": ${year},
  "height": "6'4\\"",
  "weight": 225,
  "fortyTime": 4.65,
  "grade": 92,
  "round": 1,
  "traits": ["Trait1", "Trait2"],
  "description": "Two sentence description.",
  "strengths": ["Strength 1"],
  "weaknesses": ["Weakness 1"],
  "comparableTo": "NFL Comp",
  "draftStockTrend": "rising"
}]

Rules: grades R1=82-99, R2=70-81, R3=60-69, R4-5=50-59. draftStockTrend must be "rising", "falling", or "steady".
Include: 4-5 QBs, 4-5 RBs, 8-10 WRs, 3 TEs, 4 OTs, 2 OGs, 5-6 EDGEs, 3-4 DTs, 3 LBs, 4-5 CBs, 3 Ss.
Return exactly 60 prospects.`;

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
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => 'unknown');
      console.error('[scouting/class] upstream error', upstream.status, errText);
      return res.status(502).json({ error: 'Anthropic API error', detail: errText.slice(0, 300) });
    }

    const data = await upstream.json();
    const rawText = data?.content?.[0]?.type === 'text' ? data.content[0].text : '';
    const jsonText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

    try {
      const prospects = JSON.parse(jsonText);
      if (!Array.isArray(prospects)) throw new Error('Not an array');
      return res.json({ year, prospects, generatedAt: new Date().toISOString() });
    } catch {
      return res.status(500).json({ error: 'Failed to parse draft class JSON' });
    }
  } catch (err: any) {
    console.error('[scouting/class]', err);
    return res.status(500).json({ error: 'Failed to generate draft class', detail: String(err?.message ?? err).slice(0, 200) });
  }
}
