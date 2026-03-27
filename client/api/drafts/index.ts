import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory store for draft sessions (persists per serverless instance)
// For production persistence, connect Vercel Postgres or KV here
const sessions: any[] = [];

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.json(sessions.slice(-5).reverse());
  }

  if (req.method === 'POST') {
    const { teamId, teamName, grade, gradeScore } = req.body;
    if (!teamId || !teamName) return res.status(400).json({ error: 'Missing fields' });

    const session = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      teamId,
      teamName,
      grade: grade ?? null,
      gradeScore: gradeScore ?? null,
      completedAt: new Date().toISOString(),
    };
    sessions.push(session);
    return res.status(201).json(session);
  }

  return res.status(405).end();
}
