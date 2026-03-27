export interface GameTeam {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  primaryColor: number;   // Phaser hex
  secondaryColor: number;
  offenseRating: number;  // 1-99
  defenseRating: number;
  speedRating: number;
  league: 'nfl' | 'ncaa';
  conference?: string;
}

export const NFL_GAME_TEAMS: GameTeam[] = [
  { id: 'kc',  name: 'Chiefs',    city: 'Kansas City',   abbreviation: 'KC',  primaryColor: 0xE31837, secondaryColor: 0xFFB81C, offenseRating: 95, defenseRating: 82, speedRating: 88, league: 'nfl', conference: 'AFC West' },
  { id: 'sf',  name: '49ers',     city: 'San Francisco', abbreviation: 'SF',  primaryColor: 0xAA0000, secondaryColor: 0xB3995D, offenseRating: 92, defenseRating: 90, speedRating: 85, league: 'nfl', conference: 'NFC West' },
  { id: 'bal', name: 'Ravens',    city: 'Baltimore',     abbreviation: 'BAL', primaryColor: 0x241773, secondaryColor: 0x9E7C0C, offenseRating: 90, defenseRating: 91, speedRating: 92, league: 'nfl', conference: 'AFC North' },
  { id: 'buf', name: 'Bills',     city: 'Buffalo',       abbreviation: 'BUF', primaryColor: 0x00338D, secondaryColor: 0xC60C30, offenseRating: 91, defenseRating: 84, speedRating: 86, league: 'nfl', conference: 'AFC East' },
  { id: 'phi', name: 'Eagles',    city: 'Philadelphia',  abbreviation: 'PHI', primaryColor: 0x004C54, secondaryColor: 0xA5ACAF, offenseRating: 93, defenseRating: 89, speedRating: 87, league: 'nfl', conference: 'NFC East' },
  { id: 'det', name: 'Lions',     city: 'Detroit',       abbreviation: 'DET', primaryColor: 0x0076B6, secondaryColor: 0xB0B7BC, offenseRating: 90, defenseRating: 83, speedRating: 85, league: 'nfl', conference: 'NFC North' },
  { id: 'dal', name: 'Cowboys',   city: 'Dallas',        abbreviation: 'DAL', primaryColor: 0x003594, secondaryColor: 0x869397, offenseRating: 85, defenseRating: 86, speedRating: 84, league: 'nfl', conference: 'NFC East' },
  { id: 'mia', name: 'Dolphins',  city: 'Miami',         abbreviation: 'MIA', primaryColor: 0x008E97, secondaryColor: 0xFC4C02, offenseRating: 87, defenseRating: 78, speedRating: 93, league: 'nfl', conference: 'AFC East' },
  { id: 'gb',  name: 'Packers',   city: 'Green Bay',     abbreviation: 'GB',  primaryColor: 0x203731, secondaryColor: 0xFFB612, offenseRating: 86, defenseRating: 82, speedRating: 83, league: 'nfl', conference: 'NFC North' },
  { id: 'cin', name: 'Bengals',   city: 'Cincinnati',    abbreviation: 'CIN', primaryColor: 0xFB4F14, secondaryColor: 0x000000, offenseRating: 88, defenseRating: 80, speedRating: 87, league: 'nfl', conference: 'AFC North' },
  { id: 'pit', name: 'Steelers',  city: 'Pittsburgh',    abbreviation: 'PIT', primaryColor: 0x101820, secondaryColor: 0xFFB612, offenseRating: 80, defenseRating: 88, speedRating: 82, league: 'nfl', conference: 'AFC North' },
  { id: 'lar', name: 'Rams',      city: 'Los Angeles',   abbreviation: 'LAR', primaryColor: 0x003594, secondaryColor: 0xFFA300, offenseRating: 84, defenseRating: 85, speedRating: 86, league: 'nfl', conference: 'NFC West' },
];

export const NCAA_GAME_TEAMS: GameTeam[] = [
  { id: 'uga',  name: 'Bulldogs',    city: 'Georgia',       abbreviation: 'UGA', primaryColor: 0xBA0C2F, secondaryColor: 0x000000, offenseRating: 92, defenseRating: 95, speedRating: 89, league: 'ncaa', conference: 'SEC' },
  { id: 'mich', name: 'Wolverines',  city: 'Michigan',      abbreviation: 'MICH', primaryColor: 0x00274C, secondaryColor: 0xFFCB05, offenseRating: 90, defenseRating: 91, speedRating: 85, league: 'ncaa', conference: 'Big Ten' },
  { id: 'ala',  name: 'Crimson Tide',city: 'Alabama',       abbreviation: 'ALA', primaryColor: 0x9E1B32, secondaryColor: 0x828A8F, offenseRating: 93, defenseRating: 90, speedRating: 88, league: 'ncaa', conference: 'SEC' },
  { id: 'osu',  name: 'Buckeyes',    city: 'Ohio State',    abbreviation: 'OSU', primaryColor: 0xBB0000, secondaryColor: 0x666666, offenseRating: 91, defenseRating: 89, speedRating: 87, league: 'ncaa', conference: 'Big Ten' },
  { id: 'tex',  name: 'Longhorns',   city: 'Texas',         abbreviation: 'TEX', primaryColor: 0xBF5700, secondaryColor: 0xFFFFFF, offenseRating: 88, defenseRating: 87, speedRating: 88, league: 'ncaa', conference: 'SEC' },
  { id: 'ore',  name: 'Ducks',       city: 'Oregon',        abbreviation: 'ORE', primaryColor: 0x004F27, secondaryColor: 0xFEE123, offenseRating: 90, defenseRating: 85, speedRating: 93, league: 'ncaa', conference: 'Big Ten' },
  { id: 'penn', name: 'Nittany Lions',city:'Penn State',    abbreviation: 'PSU', primaryColor: 0x041E42, secondaryColor: 0xFFFFFF, offenseRating: 87, defenseRating: 90, speedRating: 85, league: 'ncaa', conference: 'Big Ten' },
  { id: 'lsu',  name: 'Tigers',      city: 'LSU',           abbreviation: 'LSU', primaryColor: 0x461D7C, secondaryColor: 0xFDD023, offenseRating: 89, defenseRating: 86, speedRating: 89, league: 'ncaa', conference: 'SEC' },
  { id: 'nd',   name: 'Fighting Irish',city:'Notre Dame',   abbreviation: 'ND',  primaryColor: 0x0C2340, secondaryColor: 0xC99700, offenseRating: 86, defenseRating: 88, speedRating: 84, league: 'ncaa', conference: 'ACC' },
  { id: 'tenn', name: 'Volunteers',  city: 'Tennessee',     abbreviation: 'TENN', primaryColor: 0xFF8200, secondaryColor: 0xFFFFFF, offenseRating: 87, defenseRating: 85, speedRating: 88, league: 'ncaa', conference: 'SEC' },
  { id: 'col',  name: 'Buffaloes',   city: 'Colorado',      abbreviation: 'COL', primaryColor: 0x000000, secondaryColor: 0xCFB87C, offenseRating: 82, defenseRating: 78, speedRating: 86, league: 'ncaa', conference: 'Big 12' },
  { id: 'fla',  name: 'Gators',      city: 'Florida',       abbreviation: 'FLA', primaryColor: 0x0021A5, secondaryColor: 0xFA4616, offenseRating: 84, defenseRating: 83, speedRating: 87, league: 'ncaa', conference: 'SEC' },
];

export const ALL_GAME_TEAMS = [...NFL_GAME_TEAMS, ...NCAA_GAME_TEAMS];
