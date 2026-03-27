/**
 * Prospect Scraper — GridironIQ
 *
 * PRIMARY SOURCE: NFLDraftBuzz.com
 *   - 480+ prospects per class, real 0-100 ratings, scouting text, measurables
 *   - URL: https://www.nfldraftbuzz.com/positions/ALL/{page}/{year}
 *   - 12 players/page, ~40 pages for 2026, pages available for 2027
 *
 * FALLBACK: DraftTek.com
 *   - 385 prospects, rank-derived grades, real heights/weights
 *
 * Run standalone:  npm run scrape:2026 | scrape:2027 | scrape:all
 * API trigger:     POST /api/prospects/scrape { secret, years }
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR    = path.join(__dirname, '../../data');
const CLIENT_DATA = path.join(__dirname, '../../../client/src/data');

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const HEADERS = {
  'User-Agent': UA,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.nfldraftbuzz.com/',
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export interface ScrapedProspect {
  name: string;
  position: string;
  college: string;
  grade: number;         // 0-100 from NFLDraftBuzz rating or rank-derived
  round: number;
  height?: string;
  weight?: number;
  fortyTime?: number;
  traits?: string[];     // scouting strengths
  weaknesses?: string[];
  description?: string;  // scouting summary
  source?: string;
}

// ─── Position normaliser ───────────────────────────────────────────────────
const VALID = new Set(['QB','RB','WR','TE','OT','OG','C','EDGE','DT','LB','CB','S']);
const POS_MAP: Record<string, string> = {
  OLB:'EDGE', DE:'EDGE', RUSH:'EDGE', OL:'OT', T:'OT', G:'OG', IOL:'OG',
  NT:'DT', IDL:'DT', ILB:'LB', MLB:'LB', FS:'S', SS:'S', FB:'RB', FL:'WR',
  DB:'S', DL:'DT',
};

function normalise(raw: string): string {
  const p = raw.trim().toUpperCase().replace(/[^A-Z]/g, '');
  return VALID.has(p) ? p : (POS_MAP[p] ?? '');
}

// ─── Grade → round ─────────────────────────────────────────────────────────
// NFLDraftBuzz ratings are 0-100. Map to draft rounds.
function roundFromGrade(grade: number): number {
  if (grade >= 88) return 1;
  if (grade >= 78) return 2;
  if (grade >= 68) return 3;
  if (grade >= 58) return 4;
  if (grade >= 48) return 5;
  if (grade >= 38) return 6;
  return 7;
}

// Fallback: derive grade from rank
function gradeFromRank(rank: number): { grade: number; round: number } {
  if (rank <=  5) return { grade: 97 - (rank - 1),                   round: 1 };
  if (rank <= 15) return { grade: 92 - Math.floor((rank - 6)  / 2),  round: 1 };
  if (rank <= 32) return { grade: 87 - Math.floor((rank - 16) / 3),  round: 1 };
  if (rank <= 64) return { grade: 81 - Math.floor((rank - 33) / 5),  round: 2 };
  if (rank <=100) return { grade: 74 - Math.floor((rank - 65) / 6),  round: 3 };
  if (rank <=150) return { grade: 67 - Math.floor((rank - 101) / 7), round: 4 };
  if (rank <=200) return { grade: 60 - Math.floor((rank - 151) / 8), round: 5 };
  if (rank <=250) return { grade: 53 - Math.floor((rank - 201) / 9), round: 6 };
  return { grade: Math.max(40, 47 - Math.floor((rank - 251) / 10)),   round: 7 };
}

// ─── NFLDraftBuzz scraper ──────────────────────────────────────────────────
// URL: /positions/ALL/{page}/{year}  — 12 players/page, ~40 pages for 2026
// Table: #positionRankTable tbody tr
// Cells: [0]=rank [1]=name+link [3]=pos [4]=college-img [5]=weight [6]=height [7]=40yd [10]=rating [11]=summary
async function scrapeNFLDraftBuzz(year: number): Promise<ScrapedProspect[]> {
  const results: ScrapedProspect[] = [];
  const BASE = `https://www.nfldraftbuzz.com/positions/ALL`;
  let page = 1;
  let consecutiveEmpty = 0;

  console.log(`  [NFLDraftBuzz] ${year} — scanning pages...`);

  while (consecutiveEmpty < 2) {
    const url = `${BASE}/${page}/${year}`;
    try {
      const { data } = await axios.get(url, { headers: HEADERS, timeout: 20000 });
      const $ = cheerio.load(data);
      const rows = $('#positionRankTable tbody tr');

      if (rows.length === 0) {
        consecutiveEmpty++;
        if (consecutiveEmpty >= 2) break;
        await sleep(800);
        page++;
        continue;
      }
      consecutiveEmpty = 0;

      let pageCount = 0;
      rows.each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length < 10) return;

        // Rank
        const rankText = $(cells[0]).find('i').text().trim() || $(cells[0]).text().trim();
        const rank = parseInt(rankText, 10);
        if (isNaN(rank)) return;

        // Name — from the anchor text inside cell 1
        const nameEl = $(cells[1]).find('a').first();
        const name = nameEl.text().replace(/\s+/g, ' ').trim();
        if (!name || name.length < 2) return;

        // Position — cell 3
        const posRaw = $(cells[3]).text().trim();
        const pos = normalise(posRaw);
        if (!pos || !VALID.has(pos)) return;

        // College — from img alt attribute in cell 4, strip " Mascot" or "   Mascot"
        const collegeRaw = $(cells[4]).find('img').attr('alt') ?? '';
        const college = collegeRaw.replace(/\s*(Mascot|mascot)\s*$/i, '').trim() || 'Unknown';

        // Weight — cell 5
        const wtRaw = $(cells[5]).text().replace(/[^0-9]/g, '');
        const weight = wtRaw ? parseInt(wtRaw, 10) : undefined;

        // Height — cell 6, format "6-3" → convert to "6'3""
        const htRaw = $(cells[6]).text().trim();
        const htMatch = htRaw.match(/^(\d)-(\d+)/);
        const height = htMatch ? `${htMatch[1]}'${htMatch[2]}"` : undefined;

        // 40-yard dash — cell 7
        const fortyRaw = $(cells[7]).text().trim();
        const fortyTime = parseFloat(fortyRaw);

        // Rating — cell 10, strip any non-numeric suffix
        const ratingRaw = $(cells[10]).text().replace(/[^0-9.]/g, '').trim();
        const rating = parseFloat(ratingRaw);

        // Summary — cell 11
        const summary = $(cells[11]).text().replace(/\s+/g, ' ').trim();

        // Use rating if valid (30-100), else derive from rank
        let grade: number;
        let round: number;
        if (!isNaN(rating) && rating >= 30 && rating <= 100) {
          grade = Math.round(rating);
          round = roundFromGrade(grade);
        } else {
          const derived = gradeFromRank(rank);
          grade = derived.grade;
          round = derived.round;
        }

        results.push({
          name,
          position: pos,
          college,
          grade,
          round,
          height,
          weight: !isNaN(weight as number) && (weight as number) > 100 ? weight : undefined,
          fortyTime: !isNaN(fortyTime) && fortyTime > 3 && fortyTime < 6 ? fortyTime : undefined,
          description: summary || undefined,
          source: 'NFLDraftBuzz',
        });
        pageCount++;
      });

      if (pageCount > 0) {
        process.stdout.write(`\r  [NFLDraftBuzz] ${year}: page ${page} +${pageCount} (total: ${results.length})   `);
      }

      await sleep(900);
      page++;
    } catch (err: any) {
      const status = err.response?.status ?? err.message;
      if (status === 404 || status === 410) break;
      console.warn(`\n  [NFLDraftBuzz] page ${page} error: ${status}`);
      consecutiveEmpty++;
      await sleep(2000);
      page++;
    }
  }

  console.log(`\n  [NFLDraftBuzz] ${year}: ${results.length} prospects across ${page - 1} pages`);
  return results;
}

// ─── DraftTek fallback ─────────────────────────────────────────────────────
// Only used if NFLDraftBuzz returns 0 results
// Cell layout: [0]=rank [2]=name [3]=college [4]=pos [5]=ht [6]=wt
async function scrapeDraftTek(year: number): Promise<ScrapedProspect[]> {
  const results: ScrapedProspect[] = [];
  const pages = year === 2026 ? 6 : 3;

  for (let page = 1; page <= pages; page++) {
    const url = `https://www.drafttek.com/${year}-NFL-Draft-Big-Board/Top-NFL-Draft-Prospects-${year}-Page-${page}.asp`;
    try {
      console.log(`  [DraftTek fallback] ${year} page ${page}/${pages}...`);
      const { data } = await axios.get(url, { headers: HEADERS, timeout: 20000 });
      const $ = cheerio.load(data);
      let pageCount = 0;

      $('tr').each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length < 5) return;
        const rank = parseInt($(cells[0]).text().trim(), 10);
        if (isNaN(rank) || rank < 1) return;
        const name    = $(cells[2]).text().trim();
        const college = $(cells[3]).text().trim();
        const posRaw  = $(cells[4]).text().trim();
        const htRaw   = $(cells[5])?.text().trim();
        const wtRaw   = $(cells[6])?.text().trim();
        if (!name || name.length < 2 || /^(rank|player|name)/i.test(name)) return;
        const pos = normalise(posRaw);
        if (!VALID.has(pos)) return;
        const { grade, round } = gradeFromRank(rank + (page - 1) * 100);
        const weight = wtRaw ? parseInt(wtRaw, 10) : undefined;
        results.push({
          name, position: pos, college: college || 'Unknown', grade, round,
          height: htRaw || undefined,
          weight: !isNaN(weight as number) ? weight : undefined,
          source: 'DraftTek',
        });
        pageCount++;
      });

      console.log(`  [DraftTek] page ${page}: +${pageCount}`);
      await sleep(1500);
    } catch (err: any) {
      console.warn(`  [DraftTek] page ${page} failed: ${err.response?.status ?? err.message}`);
      if (page === 1) break;
    }
  }

  return results;
}

// ─── Dedup ─────────────────────────────────────────────────────────────────
function dedup(prospects: ScrapedProspect[]): ScrapedProspect[] {
  const map = new Map<string, ScrapedProspect>();
  for (const p of prospects) {
    const key = p.name.toLowerCase().replace(/[^a-z]/g, '');
    if (!map.has(key)) map.set(key, p);
  }
  return Array.from(map.values()).sort((a, b) => b.grade - a.grade);
}

// ─── TypeScript generator ──────────────────────────────────────────────────
const DEFAULT_PHYS: Record<string, [number, number, number, number]> = {
  QB: [74,77,215,240], RB: [69,73,195,225], WR: [70,75,185,215],
  TE: [75,78,240,265], OT: [76,79,305,335], OG: [74,77,305,330],
  C:  [74,76,295,315], EDGE:[74,77,240,270], DT: [73,76,290,325],
  LB: [73,76,225,250], CB: [70,74,185,205], S:  [71,74,198,218],
};
const COMPS: Record<string, Record<number, string[]>> = {
  QB:   {1:['Patrick Mahomes','Josh Allen','Lamar Jackson'],2:['Sam Darnold','Jordan Love'],3:['Ryan Tannehill'],4:['Jacoby Brissett'],5:['Mac Jones'],6:['Cooper Rush'],7:['Practice squad arm']},
  RB:   {1:['Christian McCaffrey','Saquon Barkley'],2:['Jahmyr Gibbs','Breece Hall'],3:['AJ Dillon'],4:['Ty Johnson'],5:['Dare Ogunbowale'],6:['UDFA back'],7:['Camp back']},
  WR:   {1:['Justin Jefferson','CeeDee Lamb'],2:['Christian Watson','Tee Higgins'],3:['Parris Campbell'],4:['Kendrick Bourne'],5:['Steven Sims'],6:['UDFA receiver'],7:['Camp wideout']},
  TE:   {1:['Sam LaPorta','Trey McBride'],2:['Noah Fant','Hunter Henry'],3:['Mo Alie-Cox'],4:['Cole Kmet'],5:['Marcedes Lewis'],6:['Practice squad TE'],7:['Blocking specialist']},
  OT:   {1:['Penei Sewell','Christian Darrisaw'],2:['Rashawn Slater'],3:['Kolton Miller'],4:['Dennis Daley'],5:['Cedric Ogbuehi'],6:['Swing tackle'],7:['Camp OT']},
  OG:   {1:['Quenton Nelson','Zack Martin'],2:['Kevin Zeitler'],3:['Nate Davis'],4:['Damien Lewis'],5:['Oday Aboushi'],6:['Interior swing'],7:['Camp OG']},
  C:    {1:['Frank Ragnow','Creed Humphrey'],2:['Corey Linsley'],3:['Patrick Mekari'],4:['Austin Corbett'],5:['B.J. Finney'],6:['Practice squad C'],7:['Interior depth']},
  EDGE: {1:['Myles Garrett','Maxx Crosby'],2:['Kayvon Thibodeaux'],3:['Trey Hendrickson'],4:['Genard Avery'],5:['Arden Key'],6:['Camp rusher'],7:['Camp edge']},
  DT:   {1:['Jalen Carter','Chris Jones'],2:['Vita Vea','DaRon Payne'],3:['Sheldon Rankins'],4:['Austin Johnson'],5:['Tim Settle'],6:['Practice squad DT'],7:['Interior depth']},
  LB:   {1:['Micah Parsons','Fred Warner'],2:['Zach Cunningham'],3:['Cody Barton'],4:['Joe Thomas'],5:['Dylan Cole'],6:['Special teams LB'],7:['Camp LB']},
  CB:   {1:['Patrick Surtain II','Sauce Gardner'],2:['Marshon Lattimore'],3:['Troy Hill'],4:['Isaiah Rodgers'],5:['Tremon Smith'],6:['Practice squad CB'],7:['Camp CB']},
  S:    {1:['Kyle Hamilton','Harrison Smith'],2:['Jordan Poyer'],3:['Tashaun Gipson'],4:['Jovante Winfrey'],5:['George Odum'],6:['Practice squad S'],7:['UDFA safety']},
};
const DEFAULT_STR: Record<string, string[]> = {
  QB:   ['Arm strength','Accuracy','Football IQ','Pocket presence','Mobility','Pre-snap reads','Deep ball'],
  RB:   ['Vision','Contact balance','Speed','Pass protection','Route running','Burst','Pass catching'],
  WR:   ['Route running','Separation','Hands','RAC ability','Contested catches','Deep threat','YAC'],
  TE:   ['Blocking','Receiving','Seam threat','Redzone target','Athleticism','Route running','Versatility'],
  OT:   ['Pass protection','Run blocking','Footwork','Athleticism','Anchor strength','Hand technique','Length'],
  OG:   ['Run blocking','Pass protection','Leverage','Strength','Pull blocking','Interior power','Consistency'],
  C:    ['Shotgun snapping','Pass protection','Run blocking','Communication','Leverage','Football IQ','Leadership'],
  EDGE: ['Pass rush','Motor','Bend','Explosive first step','Counter moves','Run defense','Power'],
  DT:   ['Interior push','Pass rush','Run stopping','Hand technique','Leverage','Motor','Gap penetration'],
  LB:   ['Coverage','Tackling','Blitzing','Run stopping','Football IQ','Athleticism','Leadership'],
  CB:   ['Man coverage','Zone coverage','Ball skills','Recovery speed','Press technique','Athleticism','Awareness'],
  S:    ['Range','Coverage','Run support','Ball hawking','Communication','Tackling','Football IQ'],
};
const DEFAULT_WK: Record<string, string[]> = {
  QB:   ['Footwork inconsistency','Happy feet under pressure','Ball security','Decision making'],
  RB:   ['Pass protection','Ball security','Durability','Route running'],
  WR:   ['Consistency','Blocking effort','Drops','Separation vs press'],
  TE:   ['Blocking vs power','Pass protection','Route polish','Drops'],
  OT:   ['Anchor vs power','Inside counter moves','Weight management','Footwork'],
  OG:   ['Athleticism in space','Pass protection vs stunts','Footwork','Pad level'],
  C:    ['Athleticism','Power vs nose tackles','Reach blocks','Consistency'],
  EDGE: ['Run defense','Setting edge','Stamina','Counter moves'],
  DT:   ['Stamina','When doubled','Pursuit angles','Weight management'],
  LB:   ['Man coverage','Against speed','Block shedding','Blitz timing'],
  CB:   ['Tackling','Press release','Man vs elite speed','Recovery'],
  S:    ['Man coverage','Tackling in space','Zone drops','Lateral agility'],
};

function seededRand(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 0xffffffff; };
}

function generateTS(prospects: ScrapedProspect[], year: number): string {
  const lines = [
    `// AUTO-GENERATED by scrapeProspects.ts — ${new Date().toISOString()}`,
    `// PRIMARY SOURCE: NFLDraftBuzz.com | Total: ${prospects.length} prospects`,
    `import type { Prospect } from '../types/draft';`,
    ``,
    `export const PROSPECTS_${year}: Prospect[] = [`,
  ];

  for (const p of prospects) {
    const pos  = p.position;
    const phys = DEFAULT_PHYS[pos] ?? DEFAULT_PHYS['LB'];
    const rng  = seededRand(p.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0));

    // Use real height/weight from NFLDraftBuzz if available
    const htStr  = p.height ?? `${phys[0] + Math.floor(rng() * (phys[1] - phys[0] + 1))}'${Math.floor(rng() * 12)}"`;
    const wt     = (p.weight && p.weight > 150) ? p.weight : phys[2] + Math.floor(rng() * (phys[3] - phys[2] + 1));
    const htEsc  = htStr.replace(/"/g, '\\"');

    // Use real scouting text from NFLDraftBuzz if available
    const strPool  = DEFAULT_STR[pos] ?? DEFAULT_STR['LB'];
    const wkPool   = DEFAULT_WK[pos]  ?? DEFAULT_WK['LB'];
    const strShuf  = [...strPool].sort(() => rng() - 0.5);
    const wkShuf   = [...wkPool].sort(() => rng() - 0.5);
    const nStr     = p.round <= 2 ? 3 : 2;
    const nWk      = p.round <= 2 ? 2 : 1;
    const strengths  = p.traits?.length    ? p.traits.slice(0, nStr)    : strShuf.slice(0, nStr);
    const weaknesses = p.weaknesses?.length ? p.weaknesses.slice(0, nWk) : wkShuf.slice(0, nWk);
    const traits     = strengths.slice(0, 2);

    const compOpts = (COMPS[pos] ?? COMPS['LB'])[Math.min(p.round, 7)];
    const comp     = compOpts[Math.floor(rng() * compOpts.length)];

    // Use real description from NFLDraftBuzz if available
    const tier = p.grade >= 90 ? 'elite' : p.grade >= 80 ? 'quality' : p.grade >= 70 ? 'solid' : 'developmental';
    const desc = p.description && p.description.length > 20
      ? p.description.substring(0, 200)
      : `${p.name} is a ${tier} ${pos} prospect out of ${p.college}. Projects as a Round ${p.round} selection with a grade of ${p.grade}/100.`;

    const pid   = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const trend: string = p.grade >= 90 ? 'rising' : p.grade >= 75 ? (rng() > 0.5 ? 'rising' : 'steady') : 'steady';

    const esc   = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const jsArr = (a: string[]) => `[${a.map(x => `'${esc(x)}'`).join(', ')}]`;

    lines.push(
      `  {`,
      `    id: '${pid}',`,
      `    name: '${esc(p.name)}',`,
      `    position: '${pos}',`,
      `    college: '${esc(p.college)}',`,
      `    height: "${htEsc}",`,
      `    weight: ${wt},`,
      `    grade: ${p.grade},`,
      `    round: ${p.round},`,
      `    traits: ${jsArr(traits)},`,
      `    description: '${esc(desc)}',`,
      `    strengths: ${jsArr(strengths)},`,
      `    weaknesses: ${jsArr(weaknesses)},`,
      `    comparableTo: '${esc(comp)}',`,
      `    year: ${year},`,
      `    draftStockTrend: '${trend}',`,
      `  },`,
    );
  }

  lines.push(
    `];`,
    ``,
    `export function getProspectsByRound(round: number): Prospect[] {`,
    `  return PROSPECTS_${year}.filter(p => p.round === round);`,
    `}`,
    ``,
    `export function getProspectsByPosition(position: string): Prospect[] {`,
    `  return PROSPECTS_${year}.filter(p => p.position === position);`,
    `}`,
    ``,
  );

  return lines.join('\n');
}

// ─── Public API ────────────────────────────────────────────────────────────
export async function scrapeYear(year: number): Promise<ScrapedProspect[]> {
  console.log(`\n[Scraper] ${year} NFL Draft class — NFLDraftBuzz primary...`);

  const buzz = await scrapeNFLDraftBuzz(year);

  if (buzz.length > 50) {
    return dedup(buzz);
  }

  // Fallback to DraftTek if NFLDraftBuzz failed
  console.log(`[Scraper] NFLDraftBuzz insufficient (${buzz.length}), falling back to DraftTek...`);
  const dt = await scrapeDraftTek(year);
  return dedup([...buzz, ...dt]);
}

export async function scrapeAndWrite(years: number[]): Promise<Record<number, number>> {
  if (!fs.existsSync(DATA_DIR))    fs.mkdirSync(DATA_DIR,    { recursive: true });
  if (!fs.existsSync(CLIENT_DATA)) fs.mkdirSync(CLIENT_DATA, { recursive: true });

  const results: Record<number, number> = {};

  for (const year of years) {
    const prospects = await scrapeYear(year);

    if (prospects.length === 0) {
      console.warn(`[Scraper] No data for ${year} — skipping`);
      results[year] = 0;
      continue;
    }

    const jsonPath = path.join(DATA_DIR, `prospects-${year}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(prospects, null, 2));

    const tsPath = path.join(CLIENT_DATA, `prospects${year}.ts`);
    fs.writeFileSync(tsPath, generateTS(prospects, year));

    console.log(`[Scraper] ✓ ${year}: ${prospects.length} players → ${tsPath}`);
    results[year] = prospects.length;

    if (years.indexOf(year) < years.length - 1) await sleep(3000);
  }

  return results;
}

// ─── CLI ───────────────────────────────────────────────────────────────────
if (require.main === module) {
  const yearArg = process.argv[2];
  const years = yearArg ? [parseInt(yearArg, 10)] : [2026, 2027];
  scrapeAndWrite(years)
    .then(r => { console.log('\n[Scraper] Done:', r); process.exit(0); })
    .catch(e => { console.error('[Scraper] Fatal:', e); process.exit(1); });
}
