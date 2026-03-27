import type { VercelRequest, VercelResponse } from '@vercel/node';

// Fetch active fantasy-relevant players from Sleeper API
// Cached for 24h via Vercel edge cache headers
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const [playersRes, projRes] = await Promise.all([
      fetch('https://api.sleeper.app/v1/players/nfl'),
      fetch('https://api.sleeper.app/v1/projections/nfl/regular/2025/18'),
    ]);

    const [allPlayers, projections] = await Promise.all([
      playersRes.json() as Promise<Record<string, any>>,
      projRes.json() as Promise<Record<string, any>>,
    ]);

    const POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K'];
    const SALARY_BASE: Record<string, number> = { QB: 7000, RB: 6500, WR: 6500, TE: 5500, K: 4500 };

    // Filter to active players with a team
    const players = Object.entries(allPlayers)
      .filter(([, p]) =>
        p.active &&
        p.team &&
        POSITIONS.includes(p.position) &&
        p.first_name &&
        p.last_name
      )
      .map(([id, p]) => {
        const proj = projections[id];
        const pts = proj?.pts_ppr ?? 0;
        // Salary: base + projected points scaling + variance
        const base = SALARY_BASE[p.position] ?? 5000;
        const salaryRaw = base + Math.round(pts * 180) + (Math.random() * 600 - 300);
        const salary = Math.max(3000, Math.min(9800, Math.round(salaryRaw / 100) * 100));

        return {
          id,
          name: `${p.first_name} ${p.last_name}`,
          position: p.position,
          team: p.team,
          age: p.age ?? 0,
          yearsExp: p.years_exp ?? 0,
          salary,
          projectedPoints: pts ? Math.round(pts * 10) / 10 : 0,
          avgPoints: pts ? Math.round(pts * 10) / 10 : 0,
          rank: 9999,
        };
      })
      // Sort by projected points desc within position, then assign ranks
      .sort((a, b) => b.projectedPoints - a.projectedPoints);

    // Assign overall rank
    players.forEach((p, i) => { p.rank = i + 1; });

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    return res.json({ players, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[fantasy/players]', err);
    return res.status(500).json({ error: 'Failed to fetch player data' });
  }
}
