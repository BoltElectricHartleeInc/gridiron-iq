import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '../generated/prisma';

export const gamesRouter = Router();

const prisma = new PrismaClient();

const SaveGameSchema = z.object({
  homeTeamId: z.string(),
  homeTeamName: z.string(),
  homeScore: z.number().int(),
  awayTeamId: z.string(),
  awayTeamName: z.string(),
  awayScore: z.number().int(),
  league: z.string(), // NFL | NCAA
});

// POST /api/games — save a game result
gamesRouter.post('/', async (req, res) => {
  const parsed = SaveGameSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid game data', details: parsed.error.flatten() });
  }

  try {
    const result = await prisma.gameResult.create({
      data: {
        homeTeamId: parsed.data.homeTeamId,
        homeTeamName: parsed.data.homeTeamName,
        homeScore: parsed.data.homeScore,
        awayTeamId: parsed.data.awayTeamId,
        awayTeamName: parsed.data.awayTeamName,
        awayScore: parsed.data.awayScore,
        league: parsed.data.league,
      },
    });
    return res.status(201).json(result);
  } catch (err) {
    console.error('[games] save error:', err);
    return res.status(500).json({ error: 'Failed to save game result' });
  }
});

// GET /api/games/recent — last 10 game results
gamesRouter.get('/recent', async (_req, res) => {
  try {
    const results = await prisma.gameResult.findMany({
      orderBy: { playedAt: 'desc' },
      take: 10,
    });
    return res.json(results);
  } catch (err) {
    console.error('[games] fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch recent games' });
  }
});
