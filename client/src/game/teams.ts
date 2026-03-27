export interface GameTeam {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  primaryColor: number;   // Phaser hex e.g. 0xE31837
  secondaryColor: number;
  offenseRating: number;  // 1-99
  defenseRating: number;
  speedRating: number;
  league: 'nfl' | 'ncaa';
  conference?: string;
}

export const NFL_GAME_TEAMS: GameTeam[] = [
  // AFC East (4)
  { id: 'buf', name: 'Bills', city: 'Buffalo', abbreviation: 'BUF', primaryColor: 0x00338D, secondaryColor: 0xC60C30, offenseRating: 91, defenseRating: 84, speedRating: 86, league: 'nfl', conference: 'AFC East' },
  { id: 'mia', name: 'Dolphins', city: 'Miami', abbreviation: 'MIA', primaryColor: 0x008E97, secondaryColor: 0xFC4C02, offenseRating: 87, defenseRating: 78, speedRating: 93, league: 'nfl', conference: 'AFC East' },
  { id: 'ne', name: 'Patriots', city: 'New England', abbreviation: 'NE', primaryColor: 0x002244, secondaryColor: 0xC60C30, offenseRating: 72, defenseRating: 78, speedRating: 80, league: 'nfl', conference: 'AFC East' },
  { id: 'nyj', name: 'Jets', city: 'New York', abbreviation: 'NYJ', primaryColor: 0x125740, secondaryColor: 0xFFFFFF, offenseRating: 78, defenseRating: 85, speedRating: 82, league: 'nfl', conference: 'AFC East' },
  // AFC North (4)
  { id: 'bal', name: 'Ravens', city: 'Baltimore', abbreviation: 'BAL', primaryColor: 0x241773, secondaryColor: 0x9E7C0C, offenseRating: 90, defenseRating: 91, speedRating: 92, league: 'nfl', conference: 'AFC North' },
  { id: 'cin', name: 'Bengals', city: 'Cincinnati', abbreviation: 'CIN', primaryColor: 0xFB4F14, secondaryColor: 0x000000, offenseRating: 88, defenseRating: 80, speedRating: 87, league: 'nfl', conference: 'AFC North' },
  { id: 'cle', name: 'Browns', city: 'Cleveland', abbreviation: 'CLE', primaryColor: 0xFF3C00, secondaryColor: 0x311D00, offenseRating: 75, defenseRating: 81, speedRating: 81, league: 'nfl', conference: 'AFC North' },
  { id: 'pit', name: 'Steelers', city: 'Pittsburgh', abbreviation: 'PIT', primaryColor: 0x101820, secondaryColor: 0xFFB612, offenseRating: 80, defenseRating: 88, speedRating: 82, league: 'nfl', conference: 'AFC North' },
  // AFC South (4)
  { id: 'hou', name: 'Texans', city: 'Houston', abbreviation: 'HOU', primaryColor: 0x03202F, secondaryColor: 0xA71930, offenseRating: 84, defenseRating: 83, speedRating: 86, league: 'nfl', conference: 'AFC South' },
  { id: 'ind', name: 'Colts', city: 'Indianapolis', abbreviation: 'IND', primaryColor: 0x002C5F, secondaryColor: 0xA2AAAD, offenseRating: 79, defenseRating: 78, speedRating: 82, league: 'nfl', conference: 'AFC South' },
  { id: 'jax', name: 'Jaguars', city: 'Jacksonville', abbreviation: 'JAX', primaryColor: 0x006778, secondaryColor: 0x9F792C, offenseRating: 76, defenseRating: 75, speedRating: 83, league: 'nfl', conference: 'AFC South' },
  { id: 'ten', name: 'Titans', city: 'Tennessee', abbreviation: 'TEN', primaryColor: 0x0C2340, secondaryColor: 0x4B92DB, offenseRating: 73, defenseRating: 76, speedRating: 80, league: 'nfl', conference: 'AFC South' },
  // AFC West (4)
  { id: 'den', name: 'Broncos', city: 'Denver', abbreviation: 'DEN', primaryColor: 0xFB4F14, secondaryColor: 0x002244, offenseRating: 80, defenseRating: 84, speedRating: 83, league: 'nfl', conference: 'AFC West' },
  { id: 'kc', name: 'Chiefs', city: 'Kansas City', abbreviation: 'KC', primaryColor: 0xE31837, secondaryColor: 0xFFB81C, offenseRating: 95, defenseRating: 82, speedRating: 88, league: 'nfl', conference: 'AFC West' },
  { id: 'lv', name: 'Raiders', city: 'Las Vegas', abbreviation: 'LV', primaryColor: 0x000000, secondaryColor: 0xA5ACAF, offenseRating: 75, defenseRating: 74, speedRating: 80, league: 'nfl', conference: 'AFC West' },
  { id: 'lac', name: 'Chargers', city: 'Los Angeles', abbreviation: 'LAC', primaryColor: 0x0080C6, secondaryColor: 0xFFC20E, offenseRating: 83, defenseRating: 81, speedRating: 85, league: 'nfl', conference: 'AFC West' },
  // NFC East (4)
  { id: 'dal', name: 'Cowboys', city: 'Dallas', abbreviation: 'DAL', primaryColor: 0x003594, secondaryColor: 0x869397, offenseRating: 85, defenseRating: 86, speedRating: 84, league: 'nfl', conference: 'NFC East' },
  { id: 'nyg', name: 'Giants', city: 'New York', abbreviation: 'NYG', primaryColor: 0x0B2265, secondaryColor: 0xA71930, offenseRating: 73, defenseRating: 76, speedRating: 79, league: 'nfl', conference: 'NFC East' },
  { id: 'phi', name: 'Eagles', city: 'Philadelphia', abbreviation: 'PHI', primaryColor: 0x004C54, secondaryColor: 0xA5ACAF, offenseRating: 93, defenseRating: 89, speedRating: 87, league: 'nfl', conference: 'NFC East' },
  { id: 'was', name: 'Commanders', city: 'Washington', abbreviation: 'WAS', primaryColor: 0x5A1414, secondaryColor: 0xFFB612, offenseRating: 82, defenseRating: 80, speedRating: 84, league: 'nfl', conference: 'NFC East' },
  // NFC North (4)
  { id: 'chi', name: 'Bears', city: 'Chicago', abbreviation: 'CHI', primaryColor: 0x0B162A, secondaryColor: 0xC83803, offenseRating: 75, defenseRating: 78, speedRating: 81, league: 'nfl', conference: 'NFC North' },
  { id: 'det', name: 'Lions', city: 'Detroit', abbreviation: 'DET', primaryColor: 0x0076B6, secondaryColor: 0xB0B7BC, offenseRating: 90, defenseRating: 83, speedRating: 85, league: 'nfl', conference: 'NFC North' },
  { id: 'gb', name: 'Packers', city: 'Green Bay', abbreviation: 'GB', primaryColor: 0x203731, secondaryColor: 0xFFB612, offenseRating: 86, defenseRating: 82, speedRating: 83, league: 'nfl', conference: 'NFC North' },
  { id: 'min', name: 'Vikings', city: 'Minnesota', abbreviation: 'MIN', primaryColor: 0x4F2683, secondaryColor: 0xFFC62F, offenseRating: 85, defenseRating: 81, speedRating: 84, league: 'nfl', conference: 'NFC North' },
  // NFC South (4)
  { id: 'atl', name: 'Falcons', city: 'Atlanta', abbreviation: 'ATL', primaryColor: 0xA71930, secondaryColor: 0x000000, offenseRating: 84, defenseRating: 77, speedRating: 86, league: 'nfl', conference: 'NFC South' },
  { id: 'car', name: 'Panthers', city: 'Carolina', abbreviation: 'CAR', primaryColor: 0x0085CA, secondaryColor: 0x101820, offenseRating: 70, defenseRating: 72, speedRating: 79, league: 'nfl', conference: 'NFC South' },
  { id: 'no', name: 'Saints', city: 'New Orleans', abbreviation: 'NO', primaryColor: 0xD3BC8D, secondaryColor: 0x101820, offenseRating: 79, defenseRating: 80, speedRating: 82, league: 'nfl', conference: 'NFC South' },
  { id: 'tb', name: 'Buccaneers', city: 'Tampa Bay', abbreviation: 'TB', primaryColor: 0xD50A0A, secondaryColor: 0xFF7900, offenseRating: 83, defenseRating: 79, speedRating: 84, league: 'nfl', conference: 'NFC South' },
  // NFC West (4)
  { id: 'ari', name: 'Cardinals', city: 'Arizona', abbreviation: 'ARI', primaryColor: 0x97233F, secondaryColor: 0x000000, offenseRating: 77, defenseRating: 76, speedRating: 82, league: 'nfl', conference: 'NFC West' },
  { id: 'lar', name: 'Rams', city: 'Los Angeles', abbreviation: 'LAR', primaryColor: 0x003594, secondaryColor: 0xFFA300, offenseRating: 84, defenseRating: 85, speedRating: 86, league: 'nfl', conference: 'NFC West' },
  { id: 'sea', name: 'Seahawks', city: 'Seattle', abbreviation: 'SEA', primaryColor: 0x002244, secondaryColor: 0x69BE28, offenseRating: 80, defenseRating: 79, speedRating: 84, league: 'nfl', conference: 'NFC West' },
  { id: 'sf', name: '49ers', city: 'San Francisco', abbreviation: 'SF', primaryColor: 0xAA0000, secondaryColor: 0xB3995D, offenseRating: 92, defenseRating: 90, speedRating: 85, league: 'nfl', conference: 'NFC West' },
];

export const NCAA_GAME_TEAMS: GameTeam[] = [
  // SEC (16)
  { id: 'ala', name: 'Crimson Tide', city: 'Alabama', abbreviation: 'ALA', primaryColor: 0x9E1B32, secondaryColor: 0x828A8F, offenseRating: 91, defenseRating: 90, speedRating: 88, league: 'ncaa', conference: 'SEC' },
  { id: 'ark', name: 'Razorbacks', city: 'Arkansas', abbreviation: 'ARK', primaryColor: 0x9D2235, secondaryColor: 0xFFFFFF, offenseRating: 78, defenseRating: 76, speedRating: 80, league: 'ncaa', conference: 'SEC' },
  { id: 'aub', name: 'Tigers', city: 'Auburn', abbreviation: 'AUB', primaryColor: 0x0C2340, secondaryColor: 0xE87722, offenseRating: 80, defenseRating: 79, speedRating: 82, league: 'ncaa', conference: 'SEC' },
  { id: 'fla', name: 'Gators', city: 'Florida', abbreviation: 'FLA', primaryColor: 0x0021A5, secondaryColor: 0xFA4616, offenseRating: 82, defenseRating: 80, speedRating: 85, league: 'ncaa', conference: 'SEC' },
  { id: 'uga', name: 'Bulldogs', city: 'Georgia', abbreviation: 'UGA', primaryColor: 0xBA0C2F, secondaryColor: 0x000000, offenseRating: 93, defenseRating: 94, speedRating: 89, league: 'ncaa', conference: 'SEC' },
  { id: 'uk', name: 'Wildcats', city: 'Kentucky', abbreviation: 'UK', primaryColor: 0x0033A0, secondaryColor: 0xFFFFFF, offenseRating: 75, defenseRating: 77, speedRating: 78, league: 'ncaa', conference: 'SEC' },
  { id: 'lsu', name: 'Tigers', city: 'LSU', abbreviation: 'LSU', primaryColor: 0x461D7C, secondaryColor: 0xFDD023, offenseRating: 88, defenseRating: 87, speedRating: 87, league: 'ncaa', conference: 'SEC' },
  { id: 'msst', name: 'Bulldogs', city: 'Mississippi State', abbreviation: 'MSST', primaryColor: 0x660000, secondaryColor: 0xFFFFFF, offenseRating: 74, defenseRating: 75, speedRating: 77, league: 'ncaa', conference: 'SEC' },
  { id: 'miz', name: 'Tigers', city: 'Missouri', abbreviation: 'MIZ', primaryColor: 0xF1B82D, secondaryColor: 0x000000, offenseRating: 79, defenseRating: 76, speedRating: 81, league: 'ncaa', conference: 'SEC' },
  { id: 'okla_ncaa', name: 'Sooners', city: 'Oklahoma', abbreviation: 'OU', primaryColor: 0xAD0000, secondaryColor: 0xFCE500, offenseRating: 86, defenseRating: 82, speedRating: 85, league: 'ncaa', conference: 'SEC' },
  { id: 'miss', name: 'Rebels', city: 'Ole Miss', abbreviation: 'MISS', primaryColor: 0xCE1126, secondaryColor: 0x14213D, offenseRating: 84, defenseRating: 80, speedRating: 83, league: 'ncaa', conference: 'SEC' },
  { id: 'sc', name: 'Gamecocks', city: 'South Carolina', abbreviation: 'SC', primaryColor: 0x73000A, secondaryColor: 0xFFFFFF, offenseRating: 76, defenseRating: 77, speedRating: 79, league: 'ncaa', conference: 'SEC' },
  { id: 'tamu', name: 'Aggies', city: 'Texas A&M', abbreviation: 'TAMU', primaryColor: 0x500000, secondaryColor: 0xFFFFFF, offenseRating: 83, defenseRating: 84, speedRating: 82, league: 'ncaa', conference: 'SEC' },
  { id: 'tenn', name: 'Volunteers', city: 'Tennessee', abbreviation: 'TENN', primaryColor: 0xFF8200, secondaryColor: 0xFFFFFF, offenseRating: 87, defenseRating: 85, speedRating: 86, league: 'ncaa', conference: 'SEC' },
  { id: 'tex_ncaa', name: 'Longhorns', city: 'Texas', abbreviation: 'TEX', primaryColor: 0xBF5700, secondaryColor: 0xFFFFFF, offenseRating: 90, defenseRating: 88, speedRating: 87, league: 'ncaa', conference: 'SEC' },
  { id: 'van', name: 'Commodores', city: 'Vanderbilt', abbreviation: 'VAN', primaryColor: 0x866D4B, secondaryColor: 0x000000, offenseRating: 70, defenseRating: 68, speedRating: 73, league: 'ncaa', conference: 'SEC' },

  // Big Ten (19)
  { id: 'ill', name: 'Fighting Illini', city: 'Illinois', abbreviation: 'ILL', primaryColor: 0xE84A27, secondaryColor: 0x13294B, offenseRating: 74, defenseRating: 73, speedRating: 76, league: 'ncaa', conference: 'Big Ten' },
  { id: 'ind_ncaa', name: 'Hoosiers', city: 'Indiana', abbreviation: 'IND', primaryColor: 0x990000, secondaryColor: 0xFFFFFF, offenseRating: 76, defenseRating: 72, speedRating: 78, league: 'ncaa', conference: 'Big Ten' },
  { id: 'iow', name: 'Hawkeyes', city: 'Iowa', abbreviation: 'IOW', primaryColor: 0xFFCD00, secondaryColor: 0x000000, offenseRating: 77, defenseRating: 82, speedRating: 76, league: 'ncaa', conference: 'Big Ten' },
  { id: 'umd', name: 'Terrapins', city: 'Maryland', abbreviation: 'UMD', primaryColor: 0xE03A3E, secondaryColor: 0xFFD200, offenseRating: 75, defenseRating: 74, speedRating: 79, league: 'ncaa', conference: 'Big Ten' },
  { id: 'mich', name: 'Wolverines', city: 'Michigan', abbreviation: 'MICH', primaryColor: 0x00274C, secondaryColor: 0xFFCB05, offenseRating: 89, defenseRating: 88, speedRating: 84, league: 'ncaa', conference: 'Big Ten' },
  { id: 'msu', name: 'Spartans', city: 'Michigan State', abbreviation: 'MSU', primaryColor: 0x18453B, secondaryColor: 0xFFFFFF, offenseRating: 76, defenseRating: 78, speedRating: 79, league: 'ncaa', conference: 'Big Ten' },
  { id: 'umn', name: 'Golden Gophers', city: 'Minnesota', abbreviation: 'UMN', primaryColor: 0x7A0019, secondaryColor: 0xFFCC33, offenseRating: 75, defenseRating: 76, speedRating: 77, league: 'ncaa', conference: 'Big Ten' },
  { id: 'neb', name: 'Cornhuskers', city: 'Nebraska', abbreviation: 'NEB', primaryColor: 0xE41C38, secondaryColor: 0xFFFFFF, offenseRating: 78, defenseRating: 77, speedRating: 80, league: 'ncaa', conference: 'Big Ten' },
  { id: 'nw', name: 'Wildcats', city: 'Northwestern', abbreviation: 'NW', primaryColor: 0x4E2683, secondaryColor: 0xFFFFFF, offenseRating: 72, defenseRating: 74, speedRating: 75, league: 'ncaa', conference: 'Big Ten' },
  { id: 'osu', name: 'Buckeyes', city: 'Ohio State', abbreviation: 'OSU', primaryColor: 0xBB0000, secondaryColor: 0x666666, offenseRating: 95, defenseRating: 92, speedRating: 90, league: 'ncaa', conference: 'Big Ten' },
  { id: 'ore', name: 'Ducks', city: 'Oregon', abbreviation: 'ORE', primaryColor: 0x154733, secondaryColor: 0xFEE123, offenseRating: 91, defenseRating: 87, speedRating: 91, league: 'ncaa', conference: 'Big Ten' },
  { id: 'orst', name: 'Beavers', city: 'Oregon State', abbreviation: 'ORST', primaryColor: 0xDC4405, secondaryColor: 0x000000, offenseRating: 72, defenseRating: 71, speedRating: 75, league: 'ncaa', conference: 'Big Ten' },
  { id: 'psu', name: 'Nittany Lions', city: 'Penn State', abbreviation: 'PSU', primaryColor: 0x041E42, secondaryColor: 0xFFFFFF, offenseRating: 88, defenseRating: 89, speedRating: 85, league: 'ncaa', conference: 'Big Ten' },
  { id: 'pur', name: 'Boilermakers', city: 'Purdue', abbreviation: 'PUR', primaryColor: 0xCEB888, secondaryColor: 0x000000, offenseRating: 73, defenseRating: 72, speedRating: 76, league: 'ncaa', conference: 'Big Ten' },
  { id: 'rut', name: 'Scarlet Knights', city: 'Rutgers', abbreviation: 'RUT', primaryColor: 0xCC0033, secondaryColor: 0xFFFFFF, offenseRating: 71, defenseRating: 73, speedRating: 75, league: 'ncaa', conference: 'Big Ten' },
  { id: 'ucla_ncaa', name: 'Bruins', city: 'UCLA', abbreviation: 'UCLA', primaryColor: 0x2D68C4, secondaryColor: 0xF2A900, offenseRating: 79, defenseRating: 77, speedRating: 81, league: 'ncaa', conference: 'Big Ten' },
  { id: 'usc', name: 'Trojans', city: 'USC', abbreviation: 'USC', primaryColor: 0x990000, secondaryColor: 0xFFC72C, offenseRating: 85, defenseRating: 82, speedRating: 86, league: 'ncaa', conference: 'Big Ten' },
  { id: 'uw', name: 'Huskies', city: 'Washington', abbreviation: 'UW', primaryColor: 0x4B2E83, secondaryColor: 0xB7A57A, offenseRating: 83, defenseRating: 81, speedRating: 84, league: 'ncaa', conference: 'Big Ten' },
  { id: 'wis', name: 'Badgers', city: 'Wisconsin', abbreviation: 'WIS', primaryColor: 0xC5050C, secondaryColor: 0xFFFFFF, offenseRating: 80, defenseRating: 83, speedRating: 78, league: 'ncaa', conference: 'Big Ten' },

  // Big 12 (15)
  { id: 'ari_ncaa', name: 'Wildcats', city: 'Arizona', abbreviation: 'ARIZ', primaryColor: 0xCC0033, secondaryColor: 0x003366, offenseRating: 78, defenseRating: 76, speedRating: 80, league: 'ncaa', conference: 'Big 12' },
  { id: 'asu', name: 'Sun Devils', city: 'Arizona State', abbreviation: 'ASU', primaryColor: 0x8C1D40, secondaryColor: 0xFFC627, offenseRating: 80, defenseRating: 78, speedRating: 82, league: 'ncaa', conference: 'Big 12' },
  { id: 'bay', name: 'Bears', city: 'Baylor', abbreviation: 'BAY', primaryColor: 0x154734, secondaryColor: 0xFDBE57, offenseRating: 81, defenseRating: 79, speedRating: 82, league: 'ncaa', conference: 'Big 12' },
  { id: 'byu', name: 'Cougars', city: 'BYU', abbreviation: 'BYU', primaryColor: 0x002E5D, secondaryColor: 0xFFFFFF, offenseRating: 82, defenseRating: 80, speedRating: 81, league: 'ncaa', conference: 'Big 12' },
  { id: 'col', name: 'Buffaloes', city: 'Colorado', abbreviation: 'COL', primaryColor: 0xCFB87C, secondaryColor: 0x000000, offenseRating: 83, defenseRating: 79, speedRating: 84, league: 'ncaa', conference: 'Big 12' },
  { id: 'hou_ncaa', name: 'Cougars', city: 'Houston', abbreviation: 'UHCOU', primaryColor: 0xC8102E, secondaryColor: 0x909090, offenseRating: 77, defenseRating: 76, speedRating: 80, league: 'ncaa', conference: 'Big 12' },
  { id: 'iast', name: 'Cyclones', city: 'Iowa State', abbreviation: 'ISU', primaryColor: 0xC8102E, secondaryColor: 0xF1BE48, offenseRating: 80, defenseRating: 79, speedRating: 80, league: 'ncaa', conference: 'Big 12' },
  { id: 'kan', name: 'Jayhawks', city: 'Kansas', abbreviation: 'KAN', primaryColor: 0x0051A5, secondaryColor: 0xE8000D, offenseRating: 74, defenseRating: 72, speedRating: 76, league: 'ncaa', conference: 'Big 12' },
  { id: 'kst', name: 'Wildcats', city: 'Kansas State', abbreviation: 'KST', primaryColor: 0x512888, secondaryColor: 0xFFFFFF, offenseRating: 79, defenseRating: 80, speedRating: 79, league: 'ncaa', conference: 'Big 12' },
  { id: 'okst', name: 'Cowboys', city: 'Oklahoma State', abbreviation: 'OKST', primaryColor: 0xFF7300, secondaryColor: 0x000000, offenseRating: 82, defenseRating: 80, speedRating: 83, league: 'ncaa', conference: 'Big 12' },
  { id: 'tcu', name: 'Horned Frogs', city: 'TCU', abbreviation: 'TCU', primaryColor: 0x4D1979, secondaryColor: 0xA3A9AC, offenseRating: 80, defenseRating: 79, speedRating: 81, league: 'ncaa', conference: 'Big 12' },
  { id: 'ttu', name: 'Red Raiders', city: 'Texas Tech', abbreviation: 'TTU', primaryColor: 0xCC0000, secondaryColor: 0x000000, offenseRating: 79, defenseRating: 76, speedRating: 80, league: 'ncaa', conference: 'Big 12' },
  { id: 'ucf', name: 'Knights', city: 'UCF', abbreviation: 'UCF', primaryColor: 0xFFC904, secondaryColor: 0x000000, offenseRating: 78, defenseRating: 75, speedRating: 82, league: 'ncaa', conference: 'Big 12' },
  { id: 'utah', name: 'Utes', city: 'Utah', abbreviation: 'UTAH', primaryColor: 0xCC0000, secondaryColor: 0x000000, offenseRating: 83, defenseRating: 84, speedRating: 81, league: 'ncaa', conference: 'Big 12' },
  { id: 'wvu', name: 'Mountaineers', city: 'West Virginia', abbreviation: 'WVU', primaryColor: 0x002855, secondaryColor: 0xEAAA00, offenseRating: 76, defenseRating: 77, speedRating: 78, league: 'ncaa', conference: 'Big 12' },

  // ACC (18)
  { id: 'bc', name: 'Eagles', city: 'Boston College', abbreviation: 'BC', primaryColor: 0x8B0000, secondaryColor: 0xC5A323, offenseRating: 73, defenseRating: 74, speedRating: 76, league: 'ncaa', conference: 'ACC' },
  { id: 'cal', name: 'Golden Bears', city: 'Cal', abbreviation: 'CAL', primaryColor: 0x003262, secondaryColor: 0xFDB515, offenseRating: 75, defenseRating: 73, speedRating: 78, league: 'ncaa', conference: 'ACC' },
  { id: 'clem', name: 'Tigers', city: 'Clemson', abbreviation: 'CLEM', primaryColor: 0xF56600, secondaryColor: 0x522D80, offenseRating: 87, defenseRating: 88, speedRating: 87, league: 'ncaa', conference: 'ACC' },
  { id: 'duke', name: 'Blue Devils', city: 'Duke', abbreviation: 'DUKE', primaryColor: 0x003087, secondaryColor: 0x000000, offenseRating: 76, defenseRating: 75, speedRating: 77, league: 'ncaa', conference: 'ACC' },
  { id: 'fsu', name: 'Seminoles', city: 'Florida State', abbreviation: 'FSU', primaryColor: 0x782F40, secondaryColor: 0xCEB888, offenseRating: 86, defenseRating: 85, speedRating: 88, league: 'ncaa', conference: 'ACC' },
  { id: 'gt', name: 'Yellow Jackets', city: 'Georgia Tech', abbreviation: 'GT', primaryColor: 0xB3A369, secondaryColor: 0x003057, offenseRating: 75, defenseRating: 74, speedRating: 80, league: 'ncaa', conference: 'ACC' },
  { id: 'lou', name: 'Cardinals', city: 'Louisville', abbreviation: 'LOU', primaryColor: 0xAD0000, secondaryColor: 0x000000, offenseRating: 80, defenseRating: 79, speedRating: 82, league: 'ncaa', conference: 'ACC' },
  { id: 'um', name: 'Hurricanes', city: 'Miami', abbreviation: 'UMIA', primaryColor: 0x005030, secondaryColor: 0xF47321, offenseRating: 85, defenseRating: 84, speedRating: 86, league: 'ncaa', conference: 'ACC' },
  { id: 'nd', name: 'Fighting Irish', city: 'Notre Dame', abbreviation: 'ND', primaryColor: 0x0C2340, secondaryColor: 0xC99700, offenseRating: 88, defenseRating: 87, speedRating: 84, league: 'ncaa', conference: 'ACC' },
  { id: 'unc', name: 'Tar Heels', city: 'UNC', abbreviation: 'UNC', primaryColor: 0x4B9CD3, secondaryColor: 0xFFFFFF, offenseRating: 79, defenseRating: 77, speedRating: 81, league: 'ncaa', conference: 'ACC' },
  { id: 'ncst', name: 'Wolfpack', city: 'NC State', abbreviation: 'NCST', primaryColor: 0xCC0000, secondaryColor: 0x000000, offenseRating: 78, defenseRating: 79, speedRating: 79, league: 'ncaa', conference: 'ACC' },
  { id: 'pitt', name: 'Panthers', city: 'Pittsburgh', abbreviation: 'PITT', primaryColor: 0x003594, secondaryColor: 0xFFB81C, offenseRating: 79, defenseRating: 80, speedRating: 80, league: 'ncaa', conference: 'ACC' },
  { id: 'smu', name: 'Mustangs', city: 'SMU', abbreviation: 'SMU', primaryColor: 0x0033A0, secondaryColor: 0xC8102E, offenseRating: 82, defenseRating: 79, speedRating: 83, league: 'ncaa', conference: 'ACC' },
  { id: 'stan', name: 'Cardinal', city: 'Stanford', abbreviation: 'STAN', primaryColor: 0x8C1515, secondaryColor: 0xFFFFFF, offenseRating: 78, defenseRating: 77, speedRating: 79, league: 'ncaa', conference: 'ACC' },
  { id: 'syr', name: 'Orange', city: 'Syracuse', abbreviation: 'SYR', primaryColor: 0xF76900, secondaryColor: 0x000E54, offenseRating: 75, defenseRating: 76, speedRating: 78, league: 'ncaa', conference: 'ACC' },
  { id: 'uva', name: 'Cavaliers', city: 'Virginia', abbreviation: 'UVA', primaryColor: 0x232D4B, secondaryColor: 0xF84C1E, offenseRating: 73, defenseRating: 74, speedRating: 76, league: 'ncaa', conference: 'ACC' },
  { id: 'vt', name: 'Hokies', city: 'Virginia Tech', abbreviation: 'VT', primaryColor: 0x630031, secondaryColor: 0xCF4420, offenseRating: 77, defenseRating: 78, speedRating: 80, league: 'ncaa', conference: 'ACC' },
  { id: 'wf', name: 'Demon Deacons', city: 'Wake Forest', abbreviation: 'WF', primaryColor: 0x9E7E38, secondaryColor: 0x000000, offenseRating: 74, defenseRating: 73, speedRating: 77, league: 'ncaa', conference: 'ACC' },
];

export const ALL_GAME_TEAMS = [...NFL_GAME_TEAMS, ...NCAA_GAME_TEAMS];
