export const T = {
  // Backgrounds
  bg:        '#06090F',
  surface:   '#0A1018',
  panel:     '#0E1828',
  elevated:  '#121F30',
  overlay:   '#0A1220CC',

  // Borders
  border:    '#172033',
  borderHi:  '#1E2E45',
  borderFoc: '#2A4870',

  // Text
  txt:       '#DDE8F4',
  txtSub:    '#6888A8',
  txtMuted:  '#2A4060',
  txtInvert: '#060A10',

  // Brand
  blue:      '#1565C0',
  blueBright:'#2196F3',
  blueSub:   'rgba(33,150,243,0.10)',
  blueGlow:  'rgba(33,150,243,0.20)',

  // Accent
  gold:      '#D4AF37',
  goldBright:'#F5CC50',
  goldSub:   'rgba(212,175,55,0.10)',

  // Semantic
  green:     '#00C853',
  greenSub:  'rgba(0,200,83,0.10)',
  red:       '#FF1744',
  redSub:    'rgba(255,23,68,0.10)',
  amber:     '#FF8F00',

  // Typography
  fontBase:  "'Inter', -apple-system, system-ui, sans-serif",
  fontMono:  "'JetBrains Mono', 'Fira Code', monospace",
};

// Position color palette — unified source of truth
export const POS: Record<string, { bg: string; border: string; text: string; pill: string }> = {
  QB:   { bg: 'rgba(33,102,245,0.18)',  border: 'rgba(33,102,245,0.5)',  text: '#5B8FF9', pill: '#1E3A8A' },
  RB:   { bg: 'rgba(0,180,80,0.15)',    border: 'rgba(0,180,80,0.45)',   text: '#34D399', pill: '#064E3B' },
  WR:   { bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.45)', text: '#FCD34D', pill: '#78350F' },
  TE:   { bg: 'rgba(139,92,246,0.15)',  border: 'rgba(139,92,246,0.45)', text: '#A78BFA', pill: '#3B1F8C' },
  OT:   { bg: 'rgba(71,85,105,0.20)',   border: 'rgba(71,85,105,0.50)',  text: '#94A3B8', pill: '#1E293B' },
  OG:   { bg: 'rgba(63,75,95,0.20)',    border: 'rgba(63,75,95,0.50)',   text: '#8899BB', pill: '#1A2535' },
  C:    { bg: 'rgba(55,65,81,0.20)',    border: 'rgba(55,65,81,0.50)',   text: '#7B8DA8', pill: '#16202C' },
  EDGE: { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.50)',  text: '#F87171', pill: '#7F1D1D' },
  DE:   { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.50)',  text: '#F87171', pill: '#7F1D1D' },
  DT:   { bg: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.50)', text: '#FB923C', pill: '#7C2D12' },
  LB:   { bg: 'rgba(234,179,8,0.15)',   border: 'rgba(234,179,8,0.50)',  text: '#FDE047', pill: '#713F12' },
  OLB:  { bg: 'rgba(234,179,8,0.15)',   border: 'rgba(234,179,8,0.50)',  text: '#FDE047', pill: '#713F12' },
  CB:   { bg: 'rgba(20,184,166,0.15)',  border: 'rgba(20,184,166,0.50)', text: '#2DD4BF', pill: '#042F2E' },
  S:    { bg: 'rgba(6,182,212,0.15)',   border: 'rgba(6,182,212,0.50)',  text: '#22D3EE', pill: '#083344' },
  K:    { bg: 'rgba(71,85,105,0.12)',   border: 'rgba(71,85,105,0.35)',  text: '#64748B', pill: '#0F172A' },
  P:    { bg: 'rgba(71,85,105,0.12)',   border: 'rgba(71,85,105,0.35)',  text: '#64748B', pill: '#0F172A' },
};

// Grade color + label system
export function gradeColor(g: number): string {
  if (g >= 93) return '#F5CC50';  // Elite — gold
  if (g >= 87) return '#34D399';  // 1st round — green
  if (g >= 80) return '#60A5FA';  // Day 2 — blue
  if (g >= 72) return '#94A3B8';  // Day 3 — slate
  return '#4A5568';               // UDFA — muted
}

export function gradeLetter(g: number): string {
  if (g >= 96) return 'A+';
  if (g >= 93) return 'A';
  if (g >= 90) return 'A-';
  if (g >= 87) return 'B+';
  if (g >= 84) return 'B';
  if (g >= 80) return 'B-';
  if (g >= 77) return 'C+';
  if (g >= 73) return 'C';
  if (g >= 70) return 'C-';
  return 'D';
}

// ESPN CDN logo URL for any NFL team abbreviation
export function teamLogoUrl(abbreviation: string): string {
  const map: Record<string, string> = {
    'ARI': 'ari', 'ATL': 'atl', 'BAL': 'bal', 'BUF': 'buf',
    'CAR': 'car', 'CHI': 'chi', 'CIN': 'cin', 'CLE': 'cle',
    'DAL': 'dal', 'DEN': 'den', 'DET': 'det', 'GB':  'gb',
    'HOU': 'hou', 'IND': 'ind', 'JAX': 'jax', 'KC':  'kc',
    'LAC': 'lac', 'LAR': 'lar', 'LV':  'lv',  'MIA': 'mia',
    'MIN': 'min', 'NE':  'ne',  'NO':  'no',  'NYG': 'nyg',
    'NYJ': 'nyj', 'PHI': 'phi', 'PIT': 'pit', 'SF':  'sf',
    'SEA': 'sea', 'TB':  'tb',  'TEN': 'ten', 'WSH': 'wsh',
  };
  const slug = map[abbreviation.toUpperCase()] ?? abbreviation.toLowerCase();
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${slug}.png`;
}
