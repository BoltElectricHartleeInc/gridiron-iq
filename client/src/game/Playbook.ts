export interface RouteNode { dx: number; dy: number }
export interface Route { playerId: number; nodes: RouteNode[]; isTarget?: boolean }
export interface PlayDef {
  id: string;
  name: string;
  description: string;
  type: "run" | "pass" | "option" | "special";
  formation: string;
  isRun: boolean;
  ballCarrierIdx?: number;
  routes: Route[];
}
export interface Formation {
  id: string;
  name: string;
  family: string;
  plays: PlayDef[];
}

const shotgunPlays: PlayDef[] = [
  { id: "sg_hb_draw", name: "HB Draw", description: "RB delays then hits gap", type: "run", formation: "shotgun", isRun: true, ballCarrierIdx: 5, routes: [] },
  { id: "sg_slants", name: "Slants", description: "Quick inside routes", type: "pass", formation: "shotgun", isRun: false, routes: [
    { playerId: 1, nodes: [{ dx: 58, dy: 30 }] },
    { playerId: 2, nodes: [{ dx: 62, dy: -28 }] },
    { playerId: 3, nodes: [{ dx: 55, dy: 32 }] },
    { playerId: 4, nodes: [{ dx: 60, dy: -30 }] },
  ]},
  { id: "sg_4_verts", name: "4 Verticals", description: "All receivers go deep", type: "pass", formation: "shotgun", isRun: false, routes: [
    { playerId: 1, nodes: [{ dx: 180, dy: 0 }] },
    { playerId: 2, nodes: [{ dx: 175, dy: 10 }] },
    { playerId: 3, nodes: [{ dx: 175, dy: -10 }] },
    { playerId: 4, nodes: [{ dx: 180, dy: 0 }] },
  ]},
  { id: "sg_curl_flat", name: "Curl/Flat", description: "Curls and flats combo", type: "pass", formation: "shotgun", isRun: false, routes: [
    { playerId: 1, nodes: [{ dx: 80, dy: 0 }] },
    { playerId: 2, nodes: [{ dx: 22, dy: -38 }] },
    { playerId: 3, nodes: [{ dx: 78, dy: 0 }] },
    { playerId: 4, nodes: [{ dx: 20, dy: 38 }] },
  ]},
];

const iformPlays: PlayDef[] = [
  { id: "if_power", name: "Power O", description: "FB lead block, HB follows", type: "run", formation: "iform", isRun: true, ballCarrierIdx: 5, routes: [] },
  { id: "if_iso", name: "Iso", description: "HB isolates linebacker", type: "run", formation: "iform", isRun: true, ballCarrierIdx: 5, routes: [] },
  { id: "if_pa_post", name: "PA Post", description: "Play-action, deep post", type: "pass", formation: "iform", isRun: false, routes: [
    { playerId: 1, nodes: [{ dx: 80, dy: 0 }, { dx: 150, dy: -50 }] },
    { playerId: 2, nodes: [{ dx: 78, dy: 0 }, { dx: 148, dy: 50 }] },
    { playerId: 3, nodes: [{ dx: 60, dy: -24 }] },
    { playerId: 4, nodes: [{ dx: 18, dy: 36 }] },
  ]},
  { id: "if_counter", name: "Counter", description: "Counter step, guard pull", type: "run", formation: "iform", isRun: true, ballCarrierIdx: 5, routes: [] },
];

const pistolPlays: PlayDef[] = [
  { id: "pis_zone_read", name: "Zone Read", description: "QB reads DE, hand or keep", type: "option", formation: "pistol", isRun: true, ballCarrierIdx: 0, routes: [] },
  { id: "pis_inside_zone", name: "Inside Zone", description: "Inside zone blocking scheme", type: "run", formation: "pistol", isRun: true, ballCarrierIdx: 5, routes: [] },
  { id: "pis_mesh", name: "Mesh", description: "Crossing routes, quick mesh", type: "pass", formation: "pistol", isRun: false, routes: [
    { playerId: 1, nodes: [{ dx: 50, dy: 45 }] },
    { playerId: 2, nodes: [{ dx: 50, dy: -45 }] },
    { playerId: 3, nodes: [{ dx: 90, dy: 0 }] },
    { playerId: 4, nodes: [{ dx: 20, dy: 36 }] },
  ]},
];

const wildcatPlays: PlayDef[] = [
  { id: "wc_sweep", name: "Wildcat Sweep", description: "HB direct snap, outside sweep", type: "run", formation: "wildcat", isRun: true, ballCarrierIdx: 5, routes: [] },
  { id: "wc_option", name: "WC Option", description: "HB keeps or pitches", type: "option", formation: "wildcat", isRun: true, ballCarrierIdx: 5, routes: [] },
  { id: "wc_pass", name: "WC Pass", description: "HB throws on reverse fake", type: "pass", formation: "wildcat", isRun: false, routes: [
    { playerId: 1, nodes: [{ dx: 170, dy: 0 }] },
    { playerId: 2, nodes: [{ dx: 80, dy: -30 }] },
    { playerId: 3, nodes: [{ dx: 80, dy: 30 }] },
    { playerId: 4, nodes: [{ dx: 22, dy: -36 }] },
  ]},
];

const goalLinePlays: PlayDef[] = [
  { id: "gl_qb_sneak", name: "QB Sneak", description: "QB sneaks behind center", type: "run", formation: "goalline", isRun: true, ballCarrierIdx: 0, routes: [] },
  { id: "gl_fb_dive", name: "FB Dive", description: "Fullback up the gut", type: "run", formation: "goalline", isRun: true, ballCarrierIdx: 5, routes: [] },
  { id: "gl_boot", name: "Bootleg", description: "QB boots, back shoulder fade", type: "pass", formation: "goalline", isRun: false, routes: [
    { playerId: 1, nodes: [{ dx: 20, dy: 0 }] },
    { playerId: 2, nodes: [{ dx: 22, dy: 0 }] },
    { playerId: 3, nodes: [{ dx: 24, dy: -20 }] },
    { playerId: 4, nodes: [{ dx: 24, dy: 20 }] },
  ]},
];

const singlebackPlays: PlayDef[] = [
  { id: "sb_stretch", name: "Outside Zone", description: "Stretch to the boundary", type: "run", formation: "singleback", isRun: true, ballCarrierIdx: 5, routes: [] },
  { id: "sb_spacing", name: "Spacing", description: "3-level horizontal stretch", type: "pass", formation: "singleback", isRun: false, routes: [
    { playerId: 1, nodes: [{ dx: 170, dy: 0 }] },
    { playerId: 2, nodes: [{ dx: 80, dy: 0 }, { dx: 50, dy: -30 }] },
    { playerId: 3, nodes: [{ dx: 70, dy: 0 }] },
    { playerId: 4, nodes: [{ dx: 20, dy: 36 }] },
  ]},
  { id: "sb_dig", name: "Dig Route", description: "Underneath crossing dig", type: "pass", formation: "singleback", isRun: false, routes: [
    { playerId: 1, nodes: [{ dx: 75, dy: 0 }, { dx: 110, dy: 40 }] },
    { playerId: 2, nodes: [{ dx: 72, dy: 0 }, { dx: 108, dy: -40 }] },
    { playerId: 3, nodes: [{ dx: 60, dy: -22 }] },
    { playerId: 4, nodes: [{ dx: 18, dy: 36 }] },
  ]},
];

const nickelPlays: PlayDef[] = [
  { id: "nic_bunch", name: "Bunch", description: "3-receiver bunch set", type: "pass", formation: "nickel", isRun: false, routes: [
    { playerId: 1, nodes: [{ dx: 58, dy: 26 }] },
    { playerId: 2, nodes: [{ dx: 60, dy: 0 }] },
    { playerId: 3, nodes: [{ dx: 60, dy: -26 }] },
    { playerId: 4, nodes: [{ dx: 170, dy: 0 }] },
  ]},
  { id: "nic_screen", name: "RB Screen", description: "Screen pass to RB in flat", type: "pass", formation: "nickel", isRun: false, routes: [
    { playerId: 1, nodes: [{ dx: 170, dy: 0 }] },
    { playerId: 2, nodes: [{ dx: 170, dy: 0 }] },
    { playerId: 3, nodes: [{ dx: 170, dy: 0 }] },
    { playerId: 4, nodes: [{ dx: 15, dy: 40 }] },
  ]},
];

const hailMaryPlays: PlayDef[] = [
  { id: "hm_hail_mary", name: "Hail Mary", description: "All receivers go to end zone", type: "pass", formation: "hailmary", isRun: false, routes: [
    { playerId: 1, nodes: [{ dx: 330, dy: -20 }] },
    { playerId: 2, nodes: [{ dx: 340, dy: 0 }] },
    { playerId: 3, nodes: [{ dx: 330, dy: 20 }] },
    { playerId: 4, nodes: [{ dx: 320, dy: 0 }] },
  ]},
];

export const NFL_PLAYBOOK: Formation[] = [
  { id: "shotgun", name: "Shotgun", family: "shotgun", plays: shotgunPlays },
  { id: "iform", name: "I-Formation", family: "iform", plays: iformPlays },
  { id: "pistol", name: "Pistol", family: "pistol", plays: pistolPlays },
  { id: "wildcat", name: "Wildcat", family: "wildcat", plays: wildcatPlays },
  { id: "goalline", name: "Goal Line", family: "goalline", plays: goalLinePlays },
  { id: "singleback", name: "Singleback", family: "singleback", plays: singlebackPlays },
  { id: "nickel", name: "Nickel", family: "nickel", plays: nickelPlays },
  { id: "hailmary", name: "Hail Mary", family: "hailmary", plays: hailMaryPlays },
];
