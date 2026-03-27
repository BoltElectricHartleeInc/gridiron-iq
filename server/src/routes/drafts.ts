import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '../generated/prisma';

export const draftsRouter = Router();

const prisma = new PrismaClient();

const DraftPickInputSchema = z.object({
  overall: z.number().int(),
  round: z.number().int(),
  pickInRound: z.number().int(),
  teamId: z.string(),
  teamName: z.string(),
  prospectId: z.string(),
  prospectName: z.string(),
  prospectPosition: z.string(),
  prospectGrade: z.number().int(),
  isUserPick: z.boolean().optional().default(false),
  isTrade: z.boolean().optional().default(false),
});

const SaveDraftSchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
  grade: z.string(),
  gradeScore: z.number().int(),
  picks: z.array(DraftPickInputSchema),
});

// POST /api/drafts — save a completed draft session with all picks
draftsRouter.post('/', async (req, res) => {
  const parsed = SaveDraftSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid draft data', details: parsed.error.flatten() });
  }

  const { teamId, teamName, grade, gradeScore, picks } = parsed.data;

  try {
    const session = await prisma.draftSession.create({
      data: {
        teamId,
        teamName,
        status: 'completed',
        completedAt: new Date(),
        grade,
        gradeScore,
        picks: {
          create: picks.map(p => ({
            overall: p.overall,
            round: p.round,
            pickInRound: p.pickInRound,
            teamId: p.teamId,
            teamName: p.teamName,
            prospectId: p.prospectId,
            prospectName: p.prospectName,
            prospectPosition: p.prospectPosition,
            prospectGrade: p.prospectGrade,
            isUserPick: p.isUserPick ?? false,
            isTrade: p.isTrade ?? false,
          })),
        },
      },
      include: { picks: true },
    });

    return res.status(201).json(session);
  } catch (err) {
    console.error('[drafts] save error:', err);
    return res.status(500).json({ error: 'Failed to save draft' });
  }
});

// GET /api/drafts — list recent draft sessions (last 20)
draftsRouter.get('/', async (_req, res) => {
  try {
    const sessions = await prisma.draftSession.findMany({
      orderBy: { completedAt: 'desc' },
      take: 20,
      include: {
        picks: {
          where: { isUserPick: true },
          orderBy: { overall: 'asc' },
        },
      },
    });
    return res.json(sessions);
  } catch (err) {
    console.error('[drafts] list error:', err);
    return res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

// GET /api/drafts/:id — get a single session with all picks
draftsRouter.get('/:id', async (req, res) => {
  try {
    const session = await prisma.draftSession.findUnique({
      where: { id: req.params.id },
      include: { picks: { orderBy: { overall: 'asc' } } },
    });

    if (!session) return res.status(404).json({ error: 'Draft session not found' });
    return res.json(session);
  } catch (err) {
    console.error('[drafts] get error:', err);
    return res.status(500).json({ error: 'Failed to fetch draft' });
  }
});
