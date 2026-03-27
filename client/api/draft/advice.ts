import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    teamId, teamName, teamNeeds, teamDraftStyle,
    availableProspects = [], pickNumber, round, pickInRound,
    needsWeight = 50, completedPicks = [], userPicksMade = [],
    totalProspectsRemaining,
  } = req.body;

  if (!teamId || !pickNumber) return res.status(400).json({ error: 'Missing required fields' });

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

  try {
    const stream = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 250,
      stream: true,
      system: `You are the Director of Player Personnel for an NFL franchise, running your war room on draft day. You have 20 years of scouting experience. Your analysis is sharp, specific, and data-driven — no fluff.

Format your response in exactly this structure:
PICK: [Player Name] ([Position], [College])
FIT: [One sentence on scheme/need fit]
INTEL: [One sentence on what's happening on the board that affects this pick]
CONCERN: [One brief concern or "None — clean pick."]

Keep it under 80 words total. Sound like a real GM, not a chatbot.`,
      messages: [{
        role: 'user',
        content: `TEAM: ${(teamName ?? teamId).toUpperCase()}
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

Give your war room recommendation.`,
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
    console.error('[advice]', err);
    res.status(500).json({ error: 'Failed to generate draft advice' });
  }
}
