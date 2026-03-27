import type { VercelRequest, VercelResponse } from '@vercel/node';

// Fetch actual weekly stats from Sleeper for scoring
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const week = Number(req.query.week) || 18;
  const season = Number(req.query.season) || 2024;
  const type = (req.query.type as string) || 'regular';

  if (week < 1 || week > 22) return res.status(400).json({ error: 'Invalid week' });

  try {
    const statsRes = await fetch(
      `https://api.sleeper.app/v1/stats/nfl/${type}/${season}/${week}`
    );
    const stats = await statsRes.json() as Record<string, any>;

    // Map to { playerId: { pts_ppr, pts_std, pts_half_ppr, ...key stats } }
    const scores: Record<string, { pts_ppr: number; pts_std: number; pass_td: number; pass_yd: number; rush_td: number; rush_yd: number; rec_td: number; rec_yd: number; rec: number }> = {};

    for (const [id, s] of Object.entries(stats)) {
      if (s.pts_ppr || s.pts_std) {
        scores[id] = {
          pts_ppr: Math.round((s.pts_ppr ?? 0) * 10) / 10,
          pts_std: Math.round((s.pts_std ?? 0) * 10) / 10,
          pass_td: s.pass_td ?? 0,
          pass_yd: s.pass_yd ?? 0,
          rush_td: s.rush_td ?? 0,
          rush_yd: s.rush_yd ?? 0,
          rec_td: s.rec_td ?? 0,
          rec_yd: s.rec_yd ?? 0,
          rec: s.rec ?? 0,
        };
      }
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.json({ week, season, scores });
  } catch (err) {
    console.error('[fantasy/scores]', err);
    return res.status(500).json({ error: 'Failed to fetch scores' });
  }
}
