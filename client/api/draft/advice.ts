/**
 * Vercel Serverless Function — /api/draft/advice
 * Uses native fetch (Node 20 built-in) to avoid node-fetch header validation issues.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    teamId, teamName, teamNeeds, teamDraftStyle,
    availableProspects = [], pickNumber, round, pickInRound,
    needsWeight = 50, completedPicks = [], userPicksMade = [],
    totalProspectsRemaining,
  } = req.body;

  if (!teamId || !pickNumber) return res.status(400).json({ error: 'Missing required fields' });

  const apiKey = (process.env.ANTHROPIC_API_KEY ?? '').trim();
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  const positionRunMap: Record<string, number> = {};
  for (const pick of completedPicks) {
    positionRunMap[pick.position] = (positionRunMap[pick.position] ?? 0) + 1;
  }
  const posRunSummary = Object.entries(positionRunMap)
    .sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([pos, count]) => `${pos}: ${count}`).join(', ');

  const elite = availableProspects.filter((p: any) => p.grade >= 85).slice(0, 3);
  const solid = availableProspects.filter((p: any) => p.grade >= 75 && p.grade < 85).slice(0, 3);
  const prospectList = availableProspects.slice(0, 12)
    .map((p: any, i: number) => `${i + 1}. ${p.name} | ${p.position} | ${p.college} | ${p.grade} | Proj R${p.round}`)
    .join('\n');

  const userPicksSummary = userPicksMade.length > 0
    ? `Your picks so far: ${userPicksMade.map((p: any) => `${p.name} (${p.position}, ${p.grade})`).join(', ')}`
    : 'No picks made yet.';

  const strategyNote = needsWeight > 70 ? 'GM philosophy: fill needs over BPA'
    : needsWeight < 30 ? 'GM philosophy: strictly best player available'
    : 'GM philosophy: balanced BPA/needs';

  const systemPrompt = `You are the Director of Player Personnel for an NFL franchise, running your war room on draft day. You have 20 years of scouting experience. Your analysis is sharp, specific, and data-driven — no fluff.

Format your response in exactly this structure:
PICK: [Player Name] ([Position], [College])
FIT: [One sentence on scheme/need fit]
INTEL: [One sentence on what's happening on the board that affects this pick]
CONCERN: [One brief concern or "None — clean pick."]

Keep it under 80 words total. Sound like a real GM, not a chatbot.`;

  const userContent = `TEAM: ${(teamName ?? teamId).toUpperCase()}
PICK #${pickNumber} | ROUND ${round} | PICK ${pickInRound} IN ROUND
Priority needs: ${teamNeeds?.slice(0, 5).join(', ') || 'None identified'}
${strategyNote}
${teamDraftStyle ? `Team draft tendencies: ${teamDraftStyle}` : ''}

BOARD SITUATION:
Picks made: ${completedPicks.length} | Prospects remaining: ${totalProspectsRemaining ?? availableProspects.length}
Position volume (taken so far): ${posRunSummary || 'Draft just started'}
${userPicksSummary}

AVAILABLE TALENT (top 12 by grade):
${prospectList}

Elite still on board: ${elite.map((p: any) => `${p.name} (${p.position}, ${p.grade})`).join(', ') || 'None above 85'}
Solid value: ${solid.map((p: any) => `${p.name} (${p.position})`).join(', ') || 'None above 75'}

Give your war room recommendation.`;

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
        max_tokens: 250,
        stream: true,
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }],
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => 'unknown');
      console.error('[advice] upstream error', upstream.status, errText);
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
    console.error('[advice]', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate draft advice', detail: String(err?.message ?? err).slice(0, 200) });
    } else {
      res.end();
    }
  }
}
