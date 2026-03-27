// ─── 2026 College Football Recruit Class ─────────────────────────────────────
// Deterministic seeded generator — stable across reloads.

export type RecruitStars = 1 | 2 | 3 | 4 | 5;

export type PersonalityType =
  | 'homesick'
  | 'ambitious'
  | 'loyalist'
  | 'mercenary'
  | 'academic'
  | 'underdog'
  | 'spotlight'
  | 'winner';

export interface RecruitPriorities {
  proximity: number;
  playingTime: number;
  nflPipeline: number;
  academics: number;
  facilities: number;
  winningCulture: number;
  exposure: number;
}

export interface Recruit {
  id: string;
  name: string;
  stars: RecruitStars;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'OT' | 'IOL' | 'DE' | 'DT' | 'LB' | 'CB' | 'S' | 'K';
  hometown: string;
  state: string;
  height: string;
  weight: number;
  rating: number;
  compositeScore: number;

  priorities: RecruitPriorities;
  personalityType: PersonalityType;

  backstory: string;
  openingLine: string;
  ceremonyLocation: string;

  topCompetitors: string[];
  schoolInterest: Record<string, number>;

  committedTo: string | null;
  hasVisit: Record<string, boolean>;
  callCount: number;

  nationalRank: number;
  positionRank: number;
}

// ─── LCG Seeded RNG ───────────────────────────────────────────────────────────
function makeLCG(seed: number) {
  let s = seed >>> 0;
  return function rng(): number {
    s = ((s * 1664525 + 1013904223) & 0xffffffff) >>> 0;
    return s / 4294967296;
  };
}

// ─── Data tables ─────────────────────────────────────────────────────────────
const FIRST_NAMES = [
  'Marcus','DeShawn','Khalil','Tyler','Mason','Trey','Jordan','Malik','Chase','Cole',
  'Bryce','Devon','Jaylen','Hunter','Zach','Traylon','Christian','Darius','Nate','Caden',
  'Elijah','Jonah','Cam','Dante','Reece','Jalen','Keegan','Donovan','Lance','Paxton',
  'DeVontae','Treyvon','Kaden','Aiden','Isaiah','Deion','Brayden','Colton','Koby','Tavion',
  'Micah','Noah','Caleb','Xavier','Zyaire','Tre','Damien','Aaron','Quentin','Ryheem',
];

const LAST_NAMES = [
  'Williams','Johnson','Carter','Davis','Brown','Thompson','Moore','Jackson','Taylor','Anderson',
  'Harris','White','Robinson','Walker','Lewis','King','Evans','Mitchell','Parker','Rivera',
  'Cruz','Peterson','Coleman','Bell','Turner','Murphy','Brooks','Reed','Cook','Butler',
  'Sanders','Price','Henderson','Coleman','Russell','Griffin','Foster','Hayes','Simmons','Grant',
  'Webb','Jenkins','Perry','Long','Patterson','Howard','James','Warren','Dixon','Ross',
];

const TX_CITIES = ['Houston','Dallas','San Antonio','Austin','Plano','Katy','Allen','Denton','Odessa','Tyler','Corpus Christi','Lubbock'];
const FL_CITIES = ['Miami','Orlando','Tampa','Jacksonville','Fort Lauderdale','Gainesville','Tallahassee','Bradenton','Ocala','Pensacola'];
const GA_AL_CITIES = ['Atlanta','Macon','Columbus GA','Huntsville','Birmingham','Montgomery','Augusta','Savannah','Tuscaloosa'];
const OH_PA_CITIES = ['Columbus OH','Cleveland','Cincinnati','Pittsburgh','Philadelphia','Akron','Youngstown','Altoona'];
const CA_CITIES = ['Los Angeles','San Diego','Fresno','Bakersfield','Riverside','Stockton','Long Beach','Oakland'];
const OTHER_CITIES = ['Chicago','New Orleans','Memphis','Charlotte','Raleigh','Kansas City','St. Louis','Detroit','Newark','Baltimore','Nashville','Minneapolis','Seattle','Denver','Phoenix','Las Vegas','Indianapolis','Louisville','Richmond','Baton Rouge'];

const SCHOOL_ABBREVS = ['UGA','ALA','OSU','BAMA','UF','LSU','OHIO','ND','CLEM','PSU','MICH','TEX','USC','FSU','OKLA','TENN','MISS','AUB','OREG','WASH'];

const CEREMONY_LOCATIONS = [
  'his high school gym','the family living room','his church','the school cafeteria',
  'on the 50-yard line of his high school stadium','a local sports bar surrounded by family',
  'his grandmother\'s back yard','the local Boys & Girls Club where he grew up',
  'the weight room that made him','his AAU coach\'s facility',
];

type PersonalityData = {
  type: PersonalityType;
  backstoryTemplate: (name: string, hometown: string, pos: string) => string;
  openingTemplate: (name: string) => string;
  priorities: Partial<RecruitPriorities>;
};

const PERSONALITY_DATA: PersonalityData[] = [
  {
    type: 'homesick',
    backstoryTemplate: (n, h) => `${n} grew up watching his older brothers play at the local community college. His mom works two jobs and drives four hours to every game — he won't stray far from ${h}.`,
    openingTemplate: () => `"Coach, real talk — how far is your campus from the highway? My mom can't drive more than three hours."`,
    priorities: { proximity: 9, playingTime: 6, nflPipeline: 5, winningCulture: 5 },
  },
  {
    type: 'ambitious',
    backstoryTemplate: (n, _, pos) => `${n} has one goal: first round. He trains 6 AM every morning, tracks every ${pos} taken in the top-10 since 2018, and owns a whiteboard of his 40 time progression.`,
    openingTemplate: () => `"Before we get into it — how many players at my position have you sent to the first round in the last five years?"`,
    priorities: { nflPipeline: 10, facilities: 8, exposure: 7, winningCulture: 6 },
  },
  {
    type: 'loyalist',
    backstoryTemplate: (n, h) => `${n}'s father played at a small D-I school and taught him that your word is everything. Once ${n} tells you he's your guy, he's your guy — but you have to earn it first in ${h}.`,
    openingTemplate: () => `"I appreciate you calling, Coach. I don't waste people's time and I don't want mine wasted. You serious about me or is this a numbers game?"`,
    priorities: { playingTime: 8, proximity: 6, winningCulture: 7, nflPipeline: 6 },
  },
  {
    type: 'mercenary',
    backstoryTemplate: (n) => `${n} has seen what NIL changed for his older teammates. He's business-minded, has a social media following of 40K, and he knows his worth. He's polite about it but money talks.`,
    openingTemplate: () => `"What's the NIL situation looking like at your school? I'm just being honest — it's a big part of my decision."`,
    priorities: { facilities: 10, exposure: 8, nflPipeline: 7, winningCulture: 5 },
  },
  {
    type: 'academic',
    backstoryTemplate: (n) => `${n} carries a 3.8 GPA and has been accepted to three universities on academic merit alone. He wants to play in the NFL but won't sacrifice his education — he's pre-med.`,
    openingTemplate: () => `"Coach, what's the graduation rate for football players at your school? And do you have a sports medicine program?"`,
    priorities: { academics: 10, proximity: 6, playingTime: 6, facilities: 5 },
  },
  {
    type: 'underdog',
    backstoryTemplate: (n, h) => `${n} didn't get his first D-I offer until junior year. The big schools slept on him in ${h} and he burns with something to prove — he wants to see the faces of every team that passed.`,
    openingTemplate: () => `"I need a school that actually believes in me, Coach. Not one that's calling me as a backup option. You been watching my film?"`,
    priorities: { playingTime: 10, nflPipeline: 7, winningCulture: 6, exposure: 6 },
  },
  {
    type: 'spotlight',
    backstoryTemplate: (n) => `${n} got 2.1 million views on his junior year highlights reel. He wants the biggest stage — national TV games, ESPN coverage, the packed stadiums. He was built for it.`,
    openingTemplate: () => `"How many nationally televised games do you have on the schedule next season? That College GameDay atmosphere — that's what I'm about."`,
    priorities: { exposure: 10, winningCulture: 8, facilities: 7, nflPipeline: 6 },
  },
  {
    type: 'winner',
    backstoryTemplate: (n) => `${n} has never been on a losing team — not in Pop Warner, not in high school. He tracks CFP rankings religiously and will follow the best program on the map, no exceptions.`,
    openingTemplate: () => `"I appreciate the call, but straight up — what's realistic for your program in terms of the Playoff? I need to compete for a title."`,
    priorities: { winningCulture: 10, nflPipeline: 8, exposure: 7, facilities: 6 },
  },
];

// Position weight maps for height/weight
type PosConfig = { hMin: number; hMax: number; wMin: number; wMax: number };
const POS_PHYSICALS: Record<string, PosConfig> = {
  QB:  { hMin: 73, hMax: 78, wMin: 210, wMax: 235 },
  RB:  { hMin: 68, hMax: 73, wMin: 195, wMax: 225 },
  WR:  { hMin: 70, hMax: 76, wMin: 180, wMax: 210 },
  TE:  { hMin: 75, hMax: 79, wMin: 240, wMax: 265 },
  OT:  { hMin: 77, hMax: 81, wMin: 295, wMax: 330 },
  IOL: { hMin: 74, hMax: 78, wMin: 290, wMax: 320 },
  DE:  { hMin: 75, hMax: 79, wMin: 245, wMax: 275 },
  DT:  { hMin: 74, hMax: 78, wMin: 290, wMax: 330 },
  LB:  { hMin: 72, hMax: 76, wMin: 225, wMax: 250 },
  CB:  { hMin: 70, hMax: 74, wMin: 180, wMax: 205 },
  S:   { hMin: 71, hMax: 75, wMin: 195, wMax: 220 },
  K:   { hMin: 70, hMax: 75, wMin: 180, wMax: 205 },
};

function inchesToHeight(inches: number): string {
  const ft = Math.floor(inches / 12);
  const i = inches % 12;
  return `${ft}'${i}"`;
}

// ─── Main generator ───────────────────────────────────────────────────────────
export function generateRecruits(): Recruit[] {
  // Position distribution
  const POSITION_POOL: Recruit['position'][] = [
    ...Array(8).fill('QB'),
    ...Array(10).fill('RB'),
    ...Array(18).fill('WR'),
    ...Array(6).fill('TE'),
    ...Array(10).fill('OT'),
    ...Array(6).fill('IOL'),
    ...Array(10).fill('DE'),
    ...Array(8).fill('DT'),
    ...Array(10).fill('LB'),
    ...Array(10).fill('CB'),
    ...Array(8).fill('S'),
    ...Array(6).fill('K'),
  ]; // total 110, we pick first 100

  // Star distribution: 3×5, 18×4, 45×3, 34×2
  const STAR_POOL: RecruitStars[] = [
    ...Array(3).fill(5 as RecruitStars),
    ...Array(18).fill(4 as RecruitStars),
    ...Array(45).fill(3 as RecruitStars),
    ...Array(34).fill(2 as RecruitStars),
  ];

  const recruits: Recruit[] = [];
  const positionCounters: Record<string, number> = {};

  const masterRng = makeLCG(12345);

  for (let i = 0; i < 100; i++) {
    const rng = makeLCG(12345 + i * 997); // deterministic per recruit

    const position = POSITION_POOL[i];
    const stars = STAR_POOL[i];

    // Name
    const firstName = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const name = `${firstName} ${lastName}`;

    // Geography — weighted regions
    const geoRoll = rng();
    let hometown: string;
    let state: string;
    if (geoRoll < 0.25) {
      hometown = TX_CITIES[Math.floor(rng() * TX_CITIES.length)];
      state = 'TX';
    } else if (geoRoll < 0.45) {
      hometown = FL_CITIES[Math.floor(rng() * FL_CITIES.length)];
      state = 'FL';
    } else if (geoRoll < 0.60) {
      const city = GA_AL_CITIES[Math.floor(rng() * GA_AL_CITIES.length)];
      hometown = city;
      state = city.includes('AL') || city === 'Birmingham' || city === 'Montgomery' || city === 'Huntsville' || city === 'Tuscaloosa' ? 'AL' : 'GA';
    } else if (geoRoll < 0.70) {
      hometown = OH_PA_CITIES[Math.floor(rng() * OH_PA_CITIES.length)];
      state = hometown.includes('Pittsburgh') || hometown.includes('Philadelphia') || hometown.includes('Altoona') ? 'PA' : 'OH';
    } else if (geoRoll < 0.80) {
      hometown = CA_CITIES[Math.floor(rng() * CA_CITIES.length)];
      state = 'CA';
    } else {
      hometown = OTHER_CITIES[Math.floor(rng() * OTHER_CITIES.length)];
      // Map city → state
      const cityStateMap: Record<string, string> = {
        'Chicago': 'IL','New Orleans': 'LA','Memphis': 'TN','Charlotte': 'NC','Raleigh': 'NC',
        'Kansas City': 'MO','St. Louis': 'MO','Detroit': 'MI','Newark': 'NJ','Baltimore': 'MD',
        'Nashville': 'TN','Minneapolis': 'MN','Seattle': 'WA','Denver': 'CO','Phoenix': 'AZ',
        'Las Vegas': 'NV','Indianapolis': 'IN','Louisville': 'KY','Richmond': 'VA','Baton Rouge': 'LA',
      };
      state = cityStateMap[hometown] ?? 'TX';
    }

    // Physical attributes
    const physCfg = POS_PHYSICALS[position];
    const heightInches = physCfg.hMin + Math.floor(rng() * (physCfg.hMax - physCfg.hMin + 1));
    const weight = physCfg.wMin + Math.floor(rng() * (physCfg.wMax - physCfg.wMin + 1));
    const height = inchesToHeight(heightInches);

    // Rating & composite
    let rating: number;
    let compositeScore: number;
    if (stars === 5) {
      rating = 93 + Math.floor(rng() * 7); // 93-99
      compositeScore = parseFloat((0.9800 + rng() * 0.0200).toFixed(4));
    } else if (stars === 4) {
      rating = 83 + Math.floor(rng() * 10); // 83-92
      compositeScore = parseFloat((0.9000 + rng() * 0.0799).toFixed(4));
    } else if (stars === 3) {
      rating = 72 + Math.floor(rng() * 11); // 72-82
      compositeScore = parseFloat((0.8500 + rng() * 0.0499).toFixed(4));
    } else {
      rating = 60 + Math.floor(rng() * 12); // 60-71
      compositeScore = parseFloat((0.8000 + rng() * 0.0499).toFixed(4));
    }

    // Personality
    const pIdx = Math.floor(rng() * PERSONALITY_DATA.length);
    const pData = PERSONALITY_DATA[pIdx];
    const personality = pData.type;

    // Build priorities (base + personality overlay)
    const basePriorities: RecruitPriorities = {
      proximity: 1 + Math.floor(rng() * 10),
      playingTime: 1 + Math.floor(rng() * 10),
      nflPipeline: 1 + Math.floor(rng() * 10),
      academics: 1 + Math.floor(rng() * 10),
      facilities: 1 + Math.floor(rng() * 10),
      winningCulture: 1 + Math.floor(rng() * 10),
      exposure: 1 + Math.floor(rng() * 10),
    };
    const override = pData.priorities;
    const priorities: RecruitPriorities = {
      proximity: override.proximity ?? basePriorities.proximity,
      playingTime: override.playingTime ?? basePriorities.playingTime,
      nflPipeline: override.nflPipeline ?? basePriorities.nflPipeline,
      academics: override.academics ?? basePriorities.academics,
      facilities: override.facilities ?? basePriorities.facilities,
      winningCulture: override.winningCulture ?? basePriorities.winningCulture,
      exposure: override.exposure ?? basePriorities.exposure,
    };

    // Backstory & opening
    const backstory = pData.backstoryTemplate(firstName, hometown, position);
    const openingLine = pData.openingTemplate(firstName);

    // Ceremony location
    const ceremony = CEREMONY_LOCATIONS[Math.floor(rng() * CEREMONY_LOCATIONS.length)];

    // Competitor schools (more for higher stars)
    const numCompetitors = stars >= 4 ? 5 + Math.floor(rng() * 4) : 2 + Math.floor(rng() * 4);
    const competitors: string[] = [];
    const usedSchools = new Set<string>();
    while (competitors.length < numCompetitors) {
      const school = SCHOOL_ABBREVS[Math.floor(rng() * SCHOOL_ABBREVS.length)];
      if (!usedSchools.has(school)) {
        usedSchools.add(school);
        competitors.push(school);
      }
    }

    // Pre-seeded interest for top recruits
    const schoolInterest: Record<string, number> = {};
    if (stars >= 4) {
      for (const s of competitors.slice(0, 3)) {
        schoolInterest[s] = 20 + Math.floor(rng() * 50);
      }
    } else if (stars === 3 && rng() > 0.5) {
      const s = competitors[0];
      if (s) schoolInterest[s] = 10 + Math.floor(rng() * 30);
    }

    // Position rank
    positionCounters[position] = (positionCounters[position] ?? 0) + 1;
    const positionRank = positionCounters[position];

    const recruit: Recruit = {
      id: `recruit-2026-${String(i + 1).padStart(3, '0')}`,
      name,
      stars,
      position,
      hometown,
      state,
      height,
      weight,
      rating,
      compositeScore,
      priorities,
      personalityType: personality,
      backstory,
      openingLine,
      ceremonyLocation: ceremony,
      topCompetitors: competitors,
      schoolInterest,
      committedTo: null,
      hasVisit: {},
      callCount: 0,
      nationalRank: i + 1,
      positionRank,
    };

    recruits.push(recruit);
  }

  // Sort by compositeScore descending and assign national ranks
  recruits.sort((a, b) => b.compositeScore - a.compositeScore);
  recruits.forEach((r, idx) => {
    r.nationalRank = idx + 1;
  });

  // Re-assign position ranks after final sort
  const posRankMap: Record<string, number> = {};
  for (const r of recruits) {
    posRankMap[r.position] = (posRankMap[r.position] ?? 0) + 1;
    r.positionRank = posRankMap[r.position];
  }

  return recruits;
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export const RECRUIT_CLASS_2026: Recruit[] = generateRecruits();

export function getRecruitsByPosition(pos: string): Recruit[] {
  return RECRUIT_CLASS_2026.filter(r => r.position === pos);
}

export function getTopRecruits(n: number): Recruit[] {
  return RECRUIT_CLASS_2026.slice(0, n);
}

export function getRecruitById(id: string): Recruit | undefined {
  return RECRUIT_CLASS_2026.find(r => r.id === id);
}

export function getStateHotbeds(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of RECRUIT_CLASS_2026) {
    counts[r.state] = (counts[r.state] ?? 0) + 1;
  }
  return counts;
}
