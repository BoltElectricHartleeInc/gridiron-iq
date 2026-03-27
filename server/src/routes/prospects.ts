import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { scrapeAndWrite } from '../scripts/scrapeProspects';

export const prospectsRouter = Router();

const DATA_DIR = path.join(__dirname, '../../data');
const SCRAPE_SECRET = process.env.SCRAPE_SECRET ?? 'gridiron-scrape-2026';

// GET /api/prospects/status — check what's cached
prospectsRouter.get('/status', (_req, res) => {
  if (!fs.existsSync(DATA_DIR)) {
    return res.json({ cached: [], message: 'No scraped data yet. POST /api/prospects/scrape to fetch.' });
  }

  const files = fs.readdirSync(DATA_DIR).filter(f => f.startsWith('prospects-') && f.endsWith('.json'));
  const cached = files.map(f => {
    const year = parseInt(f.replace('prospects-', '').replace('.json', ''), 10);
    const filePath = path.join(DATA_DIR, f);
    const stat = fs.statSync(filePath);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return {
      year,
      count: data.length,
      lastUpdated: stat.mtime.toISOString(),
      ageHours: Math.round((Date.now() - stat.mtimeMs) / 3600000),
    };
  });

  res.json({ cached, message: 'POST /api/prospects/scrape to refresh.' });
});

// POST /api/prospects/scrape — trigger a live scrape
// Body: { secret: string, years?: number[] }
prospectsRouter.post('/scrape', async (req, res) => {
  const { secret, years } = req.body;

  if (secret !== SCRAPE_SECRET) {
    return res.status(401).json({ error: 'Invalid secret' });
  }

  const targetYears: number[] = Array.isArray(years)
    ? years.filter((y: unknown) => typeof y === 'number' && y >= 2026 && y <= 2030)
    : [2026, 2027, 2028];

  if (targetYears.length === 0) {
    return res.status(400).json({ error: 'No valid years specified (2026–2030)' });
  }

  // Respond immediately, scrape in background
  res.json({
    message: `Scraping started for ${targetYears.join(', ')}. Check /api/prospects/status for progress.`,
    years: targetYears,
  });

  // Fire and forget
  scrapeAndWrite(targetYears)
    .then(results => console.log('[prospects] Scrape complete:', results))
    .catch(err => console.error('[prospects] Scrape error:', err));
});

// POST /api/prospects/save — accept browser-scraped data and write to disk
// Body: { secret: string, year: number, prospects: object[] }
prospectsRouter.post('/save', (req, res) => {
  const { secret, year, prospects } = req.body;

  if (secret !== SCRAPE_SECRET) {
    return res.status(401).json({ error: 'Invalid secret' });
  }

  const yr = parseInt(year, 10);
  if (isNaN(yr) || yr < 2026 || yr > 2030) {
    return res.status(400).json({ error: 'Invalid year' });
  }

  if (!Array.isArray(prospects) || prospects.length === 0) {
    return res.status(400).json({ error: 'No prospects provided' });
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const filePath = path.join(DATA_DIR, `prospects-${yr}.json`);
  fs.writeFileSync(filePath, JSON.stringify(prospects, null, 2), 'utf8');

  console.log(`[prospects] Saved ${prospects.length} prospects for ${yr} via browser-scrape`);
  res.json({ ok: true, year: yr, count: prospects.length });
});

// GET /api/prospects/:year — serve scraped data as JSON
prospectsRouter.get('/:year', (req, res) => {
  const year = parseInt(req.params.year, 10);
  if (isNaN(year) || year < 2026 || year > 2035) {
    return res.status(400).json({ error: 'Invalid year' });
  }

  const filePath = path.join(DATA_DIR, `prospects-${year}.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: `No data for ${year}. Trigger a scrape via POST /api/prospects/scrape`,
    });
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const stat = fs.statSync(filePath);
  res.json({
    year,
    count: data.length,
    lastUpdated: stat.mtime.toISOString(),
    prospects: data,
  });
});
