/**
 * Vercel Serverless Function — /api/lumen
 * Lumen AI data endpoint for Gridiron IQ.
 * Auth: x-lumen-key header matching LUMEN_API_KEY env var.
 *
 * GET  /api/lumen?type=leagues       — fantasy leagues
 * GET  /api/lumen?type=drafts        — draft sessions
 * GET  /api/lumen?type=games         — game sessions
 * GET  /api/lumen?type=summary       — all of the above
 * POST /api/lumen?action=scout       — proxy to scouting deep-dive
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function authenticate(req: VercelRequest): boolean {
  const apiKey = process.env.LUMEN_API_KEY;
  if (!apiKey) return false;
  const provided = req.headers['x-lumen-key'];
  return provided === apiKey;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-lumen-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const type = (req.query.type as string) ?? 'summary';

      if (type === 'leagues') {
        return res.json(await getLeagues());
      }
      if (type === 'drafts') {
        return res.json(await getDrafts());
      }
      if (type === 'games') {
        return res.json(await getGames());
      }
      // summary: all
      const [leagues, drafts, games] = await Promise.all([getLeagues(), getDrafts(), getGames()]);
      return res.json({ leagues, drafts, games });
    }

    if (req.method === 'POST') {
      const action = req.query.action as string;

      if (action === 'scout') {
        return await proxyScouting(req, res);
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[lumen gridiron]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ── Data fetchers ─────────────────────────────────────────────────────────────

async function getLeagues() {
  const leagues = await prisma.fantasyLeague.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  return {
    leagues: leagues.map(l => ({
      id: l.id,
      name: l.name,
      status: l.status,
      createdAt: l.createdAt,
    })),
  };
}

async function getDrafts() {
  const sessions = await prisma.draftSession.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5,
  });
  return {
    drafts: sessions.map(s => ({
      id: s.id,
      leagueMode: s.leagueMode,
      status: s.status,
      userTeamId: s.userTeamId,
      updatedAt: s.updatedAt,
      pickCount: Array.isArray(s.picksJson) ? (s.picksJson as unknown[]).length : 0,
    })),
  };
}

async function getGames() {
  const games = await prisma.gameSession.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });
  return {
    games: games.map(g => ({
      id: g.id,
      homeTeamId: g.homeTeamId,
      awayTeamId: g.awayTeamId,
      homeScore: g.homeScore,
      awayScore: g.awayScore,
      status: g.status,
      leagueMode: g.leagueMode,
      updatedAt: g.updatedAt,
    })),
  };
}

// ── Scouting proxy ────────────────────────────────────────────────────────────

async function proxyScouting(req: VercelRequest, res: VercelResponse) {
  const apiKey = (process.env.ANTHROPIC_API_KEY ?? '').trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const p = req.body;
  if (!p?.name || !p?.position) {
    return res.status(400).json({ error: 'name and position required' });
  }

  const prompt = `You are a senior NFL draft analyst. Write a concise 3-paragraph scouting report.

PROSPECT: ${p.name} | ${p.position} | ${p.college ?? 'Unknown'}
Measurables: ${p.height ?? '—'}, ${p.weight ? `${p.weight} lbs` : '—'}, ${p.fortyTime ? `${p.fortyTime}s 40` : '—'}
Grade: ${p.grade ?? '—'}/100 | Round: ${p.round ?? '—'}
Traits: ${Array.isArray(p.traits) ? p.traits.join(', ') : (p.traits ?? '—')}
Notes: ${p.description ?? '—'}

Cover: (1) Physical tools & film, (2) NFL role projection, (3) Draft recommendation. Be specific and opinionated.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    return res.status(502).json({ error: 'Anthropic API error' });
  }

  const data = await response.json() as { content: Array<{ type: string; text: string }> };
  const report = data.content.find(c => c.type === 'text')?.text ?? '';
  return res.json({ report, player: p.name });
}
