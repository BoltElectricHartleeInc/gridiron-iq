import Phaser from 'phaser';
import type { GameTeam } from './teams';

interface Play {
  name: string;
  type: 'run' | 'pass' | 'special';
  baseGain: number;
  variance: number;
  successChance: number;
  routeTarget: 'middle' | 'outside' | 'deep' | 'short' | 'screen';
}

interface GameState {
  quarter: number;
  timeLeft: number;
  possession: 'home' | 'away';
  down: number;
  yardsToGo: number;
  fieldPosition: number;
  homeScore: number;
  awayScore: number;
  homeTeam: GameTeam;
  awayTeam: GameTeam;
  league: 'nfl' | 'ncaa';
  gameOver: boolean;
}

interface PlayerSprite {
  container: Phaser.GameObjects.Container;
  gfx: Phaser.GameObjects.Graphics;
  role: 'qb' | 'rb' | 'wr' | 'ol' | 'dl' | 'lb' | 'cb' | 's';
  side: 'off' | 'def';
  homeX: number;
  homeY: number;
  facing: 'left' | 'right';
  team: GameTeam;
}

const PLAYS: Play[] = [
  { name: 'HB Dive',       type: 'run',     baseGain: 3,  variance: 4,  successChance: 0.72, routeTarget: 'middle'  },
  { name: 'Outside Zone',  type: 'run',     baseGain: 4,  variance: 6,  successChance: 0.68, routeTarget: 'outside' },
  { name: 'Power Run',     type: 'run',     baseGain: 2,  variance: 3,  successChance: 0.78, routeTarget: 'middle'  },
  { name: 'QB Sneak',      type: 'run',     baseGain: 1,  variance: 2,  successChance: 0.85, routeTarget: 'middle'  },
  { name: 'Slant Route',   type: 'pass',    baseGain: 6,  variance: 5,  successChance: 0.74, routeTarget: 'short'   },
  { name: 'Curl Route',    type: 'pass',    baseGain: 8,  variance: 6,  successChance: 0.68, routeTarget: 'short'   },
  { name: 'Go Route',      type: 'pass',    baseGain: 18, variance: 12, successChance: 0.42, routeTarget: 'deep'    },
  { name: 'Screen Pass',   type: 'pass',    baseGain: 5,  variance: 8,  successChance: 0.70, routeTarget: 'screen'  },
  { name: 'Cross Route',   type: 'pass',    baseGain: 10, variance: 8,  successChance: 0.58, routeTarget: 'middle'  },
  { name: 'Hail Mary',     type: 'pass',    baseGain: 40, variance: 10, successChance: 0.12, routeTarget: 'deep'    },
  { name: 'Field Goal',    type: 'special', baseGain: 0,  variance: 0,  successChance: 0.85, routeTarget: 'middle'  },
  { name: 'Punt',          type: 'special', baseGain: 0,  variance: 0,  successChance: 1.0,  routeTarget: 'middle'  },
];

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function hexStr(hex: number) { return `#${hex.toString(16).padStart(6, '0')}`; }
function lighten(hex: number, amt: number) {
  const r = clamp(((hex >> 16) & 0xff) + amt, 0, 255);
  const g = clamp(((hex >> 8) & 0xff) + amt, 0, 255);
  const b = clamp((hex & 0xff) + amt, 0, 255);
  return (r << 16) | (g << 8) | b;
}

// ─── Draw a Tecmo-style player sprite onto a Graphics object ──────────────────
function drawSprite(
  gfx: Phaser.GameObjects.Graphics,
  primaryColor: number,
  secondaryColor: number,
  facing: 'left' | 'right',
  role: 'qb' | 'rb' | 'wr' | 'ol' | 'dl' | 'lb' | 'cb' | 's',
  walkFrame: number,
  running: boolean,
) {
  gfx.clear();
  const dir = facing === 'right' ? 1 : -1;
  const legPhase = walkFrame % 2;
  const legOff = running
    ? (legPhase === 0 ? 5 : -5)   // big stride when running
    : (legPhase === 0 ? 2 : -2);  // small shuffle when idle
  const isLineman = role === 'ol' || role === 'dl';
  const bodyW = isLineman ? 13 : 10;
  const padW  = isLineman ? 17 : 13;

  // Shadow
  gfx.fillStyle(0x000000, 0.2);
  gfx.fillEllipse(0, 14, 18, 5);

  // Legs
  gfx.fillStyle(0x1a1a3e);
  gfx.fillRect(-4, 6, 4, 8 + legOff);
  gfx.fillRect(1,  6, 4, 8 - legOff);

  // Shoes
  gfx.fillStyle(0xdddddd);
  gfx.fillRect(-5 + dir, 14 + legOff, 5, 3);
  gfx.fillRect( 1 + dir, 14 - legOff, 5, 3);

  // Jersey
  gfx.fillStyle(primaryColor);
  gfx.fillRect(-Math.floor(bodyW / 2), -2, bodyW, 10);
  // Number stripe
  gfx.fillStyle(secondaryColor, 0.85);
  gfx.fillRect(-2, -1, 5, 2);

  // Shoulder pads
  gfx.fillStyle(lighten(primaryColor, 35));
  gfx.fillRect(-Math.floor(padW / 2), -5, padW, 5);
  gfx.lineStyle(1, secondaryColor, 0.9);
  gfx.strokeRect(-Math.floor(padW / 2), -5, padW, 5);

  // Arms
  gfx.fillStyle(lighten(primaryColor, 20));
  if (role === 'qb' && !running) {
    // QB passing arm raised
    gfx.fillRect(Math.floor(padW / 2) * dir - dir, -9, 3 * dir, 7);
  } else {
    gfx.fillRect(-Math.floor(padW / 2) - 2, -4, 3, 5);
    gfx.fillRect( Math.floor(padW / 2),      -4, 3, 5);
  }

  // Helmet
  gfx.fillStyle(primaryColor);
  gfx.fillEllipse(0, -11, 13, 12);
  gfx.fillStyle(0xffffff, 0.14);
  gfx.fillEllipse(-2, -14, 5, 4);

  // Face mask
  gfx.lineStyle(1, 0xcccccc, 0.9);
  gfx.beginPath(); gfx.moveTo(2 * dir, -8); gfx.lineTo(7 * dir, -8); gfx.strokePath();
  gfx.beginPath(); gfx.moveTo(2 * dir,-10); gfx.lineTo(7 * dir,-10); gfx.strokePath();

  // Helmet stripe
  gfx.lineStyle(2, secondaryColor, 1);
  gfx.beginPath(); gfx.moveTo(0, -17); gfx.lineTo(0, -6); gfx.strokePath();

  // Eye black
  gfx.fillStyle(0x000000, 0.8);
  gfx.fillRect(3 * dir, -12, 2, 1);
}

// ─── Ball as a standalone sprite ─────────────────────────────────────────────
function drawBallSprite(gfx: Phaser.GameObjects.Graphics) {
  gfx.clear();
  gfx.fillStyle(0x7B3F00);
  gfx.fillEllipse(0, 0, 14, 9);
  gfx.fillStyle(0xA0522D, 0.7);
  gfx.fillEllipse(-2, -2, 5, 3);
  gfx.lineStyle(1, 0xffffff, 0.85);
  for (let i = -1; i <= 1; i++) {
    gfx.beginPath(); gfx.moveTo(i * 2 - 1, -3); gfx.lineTo(i * 2 - 1, 3); gfx.strokePath();
  }
  gfx.beginPath(); gfx.moveTo(-3, 0); gfx.lineTo(3, 0); gfx.strokePath();
}

// Module-level game data — set before Phaser initialises so GameScene.init() has it
let _gameData: { homeTeam: GameTeam; awayTeam: GameTeam; league: 'nfl' | 'ncaa' } | null = null;

// ─── Main Game Scene ──────────────────────────────────────────────────────────
class GameScene extends Phaser.Scene {
  private state!: GameState;
  private animating = false;
  private aiTimer = 0;
  private walkFrame = 0;
  private walkTimer = 0;
  private fieldTexts: Phaser.GameObjects.Text[] = [];

  // Field metrics
  private F = { left: 0, top: 0, right: 0, bottom: 0, w: 0, h: 0, midY: 0 };

  // Static layers
  private crowdLayer!: Phaser.GameObjects.Graphics;
  private fieldLayer!: Phaser.GameObjects.Graphics;
  private uiLayer!: Phaser.GameObjects.Graphics;
  private playMenuLayer!: Phaser.GameObjects.Graphics;

  // Dynamic sprite objects
  private offPlayers: PlayerSprite[] = [];
  private defPlayers: PlayerSprite[] = [];
  private ballContainer!: Phaser.GameObjects.Container;
  private ballGfx!: Phaser.GameObjects.Graphics;
  private ballShadow!: Phaser.GameObjects.Graphics;

  // UI texts
  private uiTexts: Phaser.GameObjects.Text[] = [];
  private playButtons: Phaser.GameObjects.Graphics[] = [];
  private playTexts: Phaser.GameObjects.Text[] = [];
  private resultBanner!: Phaser.GameObjects.Text;

  constructor() { super('Game'); }

  init(data: Partial<{ homeTeam: GameTeam; awayTeam: GameTeam; league: 'nfl' | 'ncaa' }>) {
    // Prefer data passed directly (scene.restart), fall back to module-level store
    const d = (data?.homeTeam ? data : _gameData) as { homeTeam: GameTeam; awayTeam: GameTeam; league: 'nfl' | 'ncaa' };
    this.state = {
      quarter: 1, timeLeft: 900, possession: 'home',
      down: 1, yardsToGo: 10, fieldPosition: 20,
      homeScore: 0, awayScore: 0,
      homeTeam: d.homeTeam, awayTeam: d.awayTeam,
      league: d.league, gameOver: false,
    };
    this.animating = false;
    this.aiTimer = 0;
    this.walkFrame = 0;
    this.walkTimer = 0;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const top = 130, bottom = H - 10, left = 30, right = W - 30;
    this.F = { left, top, right, bottom, w: right - left, h: bottom - top, midY: (top + bottom) / 2 };

    this.crowdLayer   = this.add.graphics().setDepth(0);
    this.fieldLayer   = this.add.graphics().setDepth(1);
    this.uiLayer      = this.add.graphics().setDepth(10);
    this.playMenuLayer= this.add.graphics().setDepth(15);

    this.resultBanner = this.add.text(W / 2, this.F.midY - 40, '', {
      fontSize: '24px', fontFamily: 'Impact, Arial Narrow, sans-serif',
      color: '#ffffff', stroke: '#000000', strokeThickness: 6,
      align: 'center', shadow: { blur: 12, color: '#000', fill: true },
    }).setOrigin(0.5).setDepth(25).setAlpha(0);

    // Ball shadow (on ground)
    this.ballShadow = this.add.graphics().setDepth(4);
    // Ball container
    this.ballGfx = this.add.graphics();
    this.ballContainer = this.add.container(0, 0, [this.ballGfx]).setDepth(6);
    drawBallSprite(this.ballGfx);

    this.drawCrowd();
    this.drawField();
    this.drawScoreboard();
    this.spawnFormation();

    // Walking animation timer
    this.time.addEvent({
      delay: 200,
      loop: true,
      callback: () => {
        if (!this.animating) {
          this.walkFrame = (this.walkFrame + 1) % 4;
          this.redrawIdlePlayers();
        }
      },
    });

    if (this.state.possession === 'home') this.showPlayMenu();
  }

  // ── Coordinate helpers ──────────────────────────────────────────────────────
  private yardsToPx(yards: number): number {
    return this.F.left + this.F.w * yards / 100;
  }

  // ── Formation positions ──────────────────────────────────────────────────────
  private getOffensePositions(): { x: number; y: number; role: PlayerSprite['role'] }[] {
    const { fieldPosition, possession } = this.state;
    const dir = possession === 'home' ? -1 : 1; // snap direction (back from ball)
    const bx = this.yardsToPx(fieldPosition);
    const my = this.F.midY;
    const yd = this.F.w / 100; // px per yard
    return [
      { x: bx,                   y: my - 32, role: 'ol' },
      { x: bx,                   y: my - 16, role: 'ol' },
      { x: bx,                   y: my,      role: 'ol' },
      { x: bx,                   y: my + 16, role: 'ol' },
      { x: bx,                   y: my + 32, role: 'ol' },
      { x: bx + dir * yd * 4,    y: my,      role: 'qb' }, // QB 4yds back
      { x: bx + dir * yd * 7,    y: my,      role: 'rb' }, // RB 7yds back
      { x: bx + dir * yd * 1,    y: my - 100,role: 'wr' }, // WR split left
      { x: bx + dir * yd * 1,    y: my + 100,role: 'wr' }, // WR split right
      { x: bx + dir * yd * 0.5,  y: my - 60, role: 'wr' }, // Slot
      { x: bx + dir * yd * 0.2,  y: my + 44, role: 'wr' }, // TE
    ];
  }

  private getDefensePositions(): { x: number; y: number; role: PlayerSprite['role'] }[] {
    const { fieldPosition, possession } = this.state;
    const dir = possession === 'home' ? 1 : -1; // attack direction
    const bx = this.yardsToPx(fieldPosition);
    const my = this.F.midY;
    const yd = this.F.w / 100;
    const dlX = clamp(bx + dir * yd * 1.5, this.F.left + 40, this.F.right - 40);
    const lbX = clamp(bx + dir * yd * 6,   this.F.left + 40, this.F.right - 40);
    const cbX = clamp(bx + dir * yd * 2,   this.F.left + 40, this.F.right - 40);
    const sX  = clamp(bx + dir * yd * 13,  this.F.left + 40, this.F.right - 40);
    return [
      { x: dlX, y: my - 33, role: 'dl' },
      { x: dlX, y: my - 11, role: 'dl' },
      { x: dlX, y: my + 11, role: 'dl' },
      { x: dlX, y: my + 33, role: 'dl' },
      { x: lbX, y: my - 30, role: 'lb' },
      { x: lbX, y: my,      role: 'lb' },
      { x: lbX, y: my + 30, role: 'lb' },
      { x: cbX, y: my - 100,role: 'cb' },
      { x: cbX, y: my + 100,role: 'cb' },
      { x: sX,  y: my - 35, role: 's'  },
      { x: sX,  y: my + 35, role: 's'  },
    ];
  }

  private spawnFormation() {
    this.offPlayers.forEach(p => p.container.destroy());
    this.defPlayers.forEach(p => p.container.destroy());
    this.offPlayers = [];
    this.defPlayers = [];

    const { possession, homeTeam, awayTeam } = this.state;
    const offTeam = possession === 'home' ? homeTeam : awayTeam;
    const defTeam = possession === 'home' ? awayTeam : homeTeam;
    const offFacing: 'left' | 'right' = possession === 'home' ? 'right' : 'left';
    const defFacing: 'left' | 'right' = offFacing === 'right' ? 'left' : 'right';

    // Ball position
    const bx = this.yardsToPx(this.state.fieldPosition);
    this.ballContainer.setPosition(bx, this.F.midY - 18);
    this.ballContainer.setScale(1);
    this.ballContainer.setAlpha(1);
    drawBallSprite(this.ballGfx);

    const mkPlayer = (
      pos: { x: number; y: number; role: PlayerSprite['role'] },
      team: GameTeam,
      facing: 'left' | 'right',
      side: 'off' | 'def',
    ): PlayerSprite => {
      const gfx = this.add.graphics();
      const container = this.add.container(pos.x, pos.y, [gfx]).setDepth(side === 'off' ? 5 : 4);
      drawSprite(gfx, team.primaryColor, team.secondaryColor, facing, pos.role, 0, false);
      return { container, gfx, role: pos.role, side, homeX: pos.x, homeY: pos.y, facing, team };
    };

    this.getOffensePositions().forEach(pos => {
      this.offPlayers.push(mkPlayer(pos, offTeam, offFacing, 'off'));
    });
    this.getDefensePositions().forEach(pos => {
      this.defPlayers.push(mkPlayer(pos, defTeam, defFacing, 'def'));
    });
  }

  private redrawIdlePlayers() {
    const frame = Math.floor(this.walkFrame / 2) % 2;
    this.offPlayers.forEach(p => {
      if (!p.container.active) return;
      drawSprite(p.gfx, p.team.primaryColor, p.team.secondaryColor, p.facing, p.role, frame, false);
    });
    this.defPlayers.forEach(p => {
      if (!p.container.active) return;
      drawSprite(p.gfx, p.team.primaryColor, p.team.secondaryColor, p.facing, p.role, frame, false);
    });
  }

  // ── Play execution with real animations ─────────────────────────────────────
  private executePlay(play: Play) {
    if (this.animating || this.state.gameOver) return;
    this.clearPlayMenu();
    this.animating = true;

    const { state } = this;
    const offTeam = state.possession === 'home' ? state.homeTeam : state.awayTeam;
    const defTeam = state.possession === 'home' ? state.awayTeam : state.homeTeam;
    const dir = state.possession === 'home' ? 1 : -1;

    // ── Field goal ──
    if (play.name === 'Field Goal') {
      const dist = (state.possession === 'home' ? 100 - state.fieldPosition : state.fieldPosition) + 17;
      const made = Math.random() < (dist <= 40 ? 0.95 : dist <= 50 ? 0.82 : 0.55);
      this.animateKick(made, () => {
        if (made) {
          if (state.possession === 'home') state.homeScore += 3; else state.awayScore += 3;
          this.afterPlay(`⚡ FIELD GOAL GOOD! ${offTeam.abbreviation} +3`, true);
          this.resetAfterScore();
        } else {
          state.possession = state.possession === 'home' ? 'away' : 'home';
          state.fieldPosition = 20; state.down = 1; state.yardsToGo = 10;
          this.afterPlay(`✗ Field Goal No Good`, true);
        }
      });
      return;
    }

    // ── Punt ──
    if (play.name === 'Punt') {
      const dist = 38 + Math.floor(Math.random() * 15);
      this.animatePunt(dist * dir, () => {
        state.possession = state.possession === 'home' ? 'away' : 'home';
        state.fieldPosition = clamp(100 - (state.fieldPosition + dist * dir), 10, 35);
        state.down = 1; state.yardsToGo = 10;
        this.afterPlay(`🦵 Punt — ${dist} yards`, true);
      });
      return;
    }

    // ── Scrimmage play ──
    // successModifier: offenseRating=50 → neutral, 99 → +0.49, 1 → -0.49
    const offBonus = (offTeam.offenseRating - 50) / 100;
    // defPenalty: defenseRating=50 → neutral, 99 → -0.49
    const defPenalty = (defTeam.defenseRating - 50) / 100;
    const chance = clamp(play.successChance + offBonus - defPenalty * 0.5, 0.05, 0.97);
    const success = Math.random() < chance;

    // Turnover check first
    const turnover = !success && Math.random() < 0.07;
    if (turnover) {
      const tType = play.type === 'pass' ? 'INTERCEPTION' : 'FUMBLE';
      const defPlayer = this.defPlayers[4]; // LB intercepts
      this.animateTurnover(play.type, defPlayer, dir, () => {
        state.possession = state.possession === 'home' ? 'away' : 'home';
        state.fieldPosition = clamp(100 - state.fieldPosition, 5, 90);
        state.down = 1; state.yardsToGo = 10;
        this.afterPlay(`🚨 ${tType}! ${defTeam.abbreviation} ball!`, true);
      });
      return;
    }

    let yardsGained = 0;
    if (success) {
      // speedModifier: speedRating=50 → neutral, 99 → +1.96x for breakaway plays
      const speedBonus = (offTeam.speedRating - 50) / 50;
      const isBreakaway = play.routeTarget === 'deep' || play.routeTarget === 'outside';
      const speedMultiplier = isBreakaway ? (1 + speedBonus * 0.5) : 1;
      yardsGained = Math.max(0, Math.round(
        (play.baseGain + (Math.random() - 0.3) * play.variance + offBonus * 5) * speedMultiplier,
      ));
    } else {
      yardsGained = play.type === 'pass' ? 0 : -(Math.floor(Math.random() * 3) + 1);
    }

    const newPos = clamp(state.fieldPosition + yardsGained * dir, 0, 100);
    const gainPx = this.yardsToPx(newPos) - this.yardsToPx(state.fieldPosition); // signed screen-space pixels

    const onAnimDone = () => {
      state.fieldPosition = newPos;
      let result = '';

      // Touchdown
      if ((state.possession === 'home' && state.fieldPosition >= 100) ||
          (state.possession === 'away' && state.fieldPosition <= 0)) {
        if (state.possession === 'home') state.homeScore += 7; else state.awayScore += 7;
        result = `🏈 TOUCHDOWN! ${offTeam.abbreviation} scores! +7`;
        this.resetAfterScore();
        this.afterPlay(result, true);
        return;
      }

      // Safety
      if ((state.possession === 'home' && state.fieldPosition <= 0) ||
          (state.possession === 'away' && state.fieldPosition >= 100)) {
        if (state.possession === 'home') state.awayScore += 2; else state.homeScore += 2;
        state.possession = state.possession === 'home' ? 'away' : 'home';
        state.fieldPosition = 20; state.down = 1; state.yardsToGo = 10;
        this.afterPlay(`⚡ SAFETY! ${defTeam.abbreviation} +2`, true);
        return;
      }

      // Down/distance
      const yardsStr = yardsGained > 0 ? `+${yardsGained} yds` : `${yardsGained} yds`;
      state.yardsToGo -= yardsGained * dir;
      if (state.yardsToGo <= 0) {
        state.down = 1; state.yardsToGo = 10;
        result = yardsGained >= 20
          ? `🔥 BIG PLAY! ${play.name} — ${yardsStr}  1ST DOWN!`
          : `${play.name} — ${yardsStr}  1ST DOWN!`;
      } else if (!success && play.type === 'pass') {
        result = `✗ Incomplete — ${play.name}`;
      } else {
        state.down++;
        if (state.down > 4) {
          state.possession = state.possession === 'home' ? 'away' : 'home';
          state.fieldPosition = clamp(100 - state.fieldPosition, 5, 95);
          state.down = 1; state.yardsToGo = 10;
          result = `${play.name} — ${yardsStr}\nTURNOVER ON DOWNS`;
        } else {
          result = `${play.name} — ${yardsStr}`;
        }
      }

      // Clock
      state.timeLeft = Math.max(0, state.timeLeft - (20 + Math.floor(Math.random() * 25)));
      if (state.timeLeft === 0) {
        state.quarter++;
        if (state.quarter > 4) {
          if (state.homeScore !== state.awayScore) state.gameOver = true;
          else state.timeLeft = 600;
        } else {
          state.timeLeft = 900;
          if (state.quarter === 3) {
            state.possession = 'away'; state.fieldPosition = 20; state.down = 1; state.yardsToGo = 10;
            result += '\n— HALFTIME —';
          }
        }
      }

      this.afterPlay(result, !state.gameOver);
    };

    if (play.type === 'run') {
      this.animateRunPlay(play, gainPx, success, dir, onAnimDone);
    } else {
      this.animatePassPlay(play, gainPx, success, yardsGained, dir, onAnimDone);
    }
  }

  // ── Run play animation ─────────────────────────────────────────────────────
  private animateRunPlay(
    play: Play,
    gainPx: number,
    success: boolean,
    dir: number,
    onDone: () => void,
  ) {
    const qb  = this.offPlayers[5];
    const rb  = this.offPlayers[6];
    const ol  = this.offPlayers.slice(0, 5);
    const def = this.defPlayers;
    const isQbSneak = play.name === 'QB Sneak';
    const carrier = isQbSneak ? qb : rb;
    const surgeDir = dir;

    // Mark carrier as running
    drawSprite(carrier.gfx, carrier.team.primaryColor, carrier.team.secondaryColor,
      carrier.facing, carrier.role, 0, true);

    const targetX = carrier.container.x + gainPx;
    const tackleX = targetX;

    // 1. OL surge (150ms)
    ol.forEach((p, i) => {
      this.tweens.add({
        targets: p.container, x: p.container.x + 18 * surgeDir,
        duration: 200, ease: 'Power1',
      });
      // OL animation
      this.time.delayedCall(50 * i, () => {
        drawSprite(p.gfx, p.team.primaryColor, p.team.secondaryColor, p.facing, p.role, 1, true);
      });
    });

    // DL push back
    def.slice(0, 4).forEach((p) => {
      this.tweens.add({
        targets: p.container, x: p.container.x + 10 * surgeDir,
        duration: 250, ease: 'Power1', delay: 100,
      });
    });

    // 2. Ball carrier runs (delay 150ms, duration 480ms → done at 630ms)
    this.tweens.add({
      targets: this.ballContainer,
      x: targetX, y: this.F.midY - 18,
      duration: 480, ease: 'Power2', delay: 150,
    });

    this.tweens.add({
      targets: carrier.container,
      x: targetX,
      duration: 480, ease: 'Power2', delay: 150,
      onUpdate: () => {
        const t = Math.floor(this.walkFrame / 1) % 2;
        drawSprite(carrier.gfx, carrier.team.primaryColor, carrier.team.secondaryColor,
          carrier.facing, carrier.role, t, true);
      },
    });

    // 3. Defenders converge after carrier finishes (at 640ms)
    const convergers = success ? def.slice(4, 7) : def.slice(0, 4);
    const carrierY = carrier.container.y;
    convergers.forEach((d, i) => {
      this.tweens.add({
        targets: d.container,
        x: tackleX + (Math.random() - 0.5) * 10,
        y: carrierY + (Math.random() - 0.5) * 10,
        duration: 200, ease: 'Power2', delay: 640 + i * 30,
      });
    });

    // Tackle impact at 820ms — single top-level call, always fires
    this.time.delayedCall(820, () => {
      this.cameras.main.shake(120, 0.007);
      const flash = this.add.graphics().setDepth(50);
      flash.fillStyle(0xffffff, 0.12);
      flash.fillRect(0, 0, this.scale.width, this.scale.height);
      this.tweens.add({ targets: flash, alpha: 0, duration: 150, onComplete: () => flash.destroy() });
      onDone();
    });
  }

  // ── Pass play animation ────────────────────────────────────────────────────
  private animatePassPlay(
    play: Play,
    gainPx: number,
    success: boolean,
    yardsGained: number,
    dir: number,
    onDone: () => void,
  ) {
    const qb  = this.offPlayers[5];
    const routeTarget = play.routeTarget;

    // Choose which WR to target based on route
    let receiverIdx = 7; // default WR left
    if (routeTarget === 'outside') receiverIdx = 8;
    else if (routeTarget === 'screen') receiverIdx = 9; // slot
    else if (routeTarget === 'deep')   receiverIdx = 7;
    const receiver = this.offPlayers[receiverIdx];

    const qbStartX = qb.container.x;
    const qbDropX  = qbStartX - 28 * dir;

    // 1. QB drops back
    this.tweens.add({
      targets: qb.container,
      x: qbDropX,
      duration: 280, ease: 'Power1',
    });

    // LBs and CBs fan out to cover routes
    this.defPlayers.slice(4, 9).forEach((d, i) => {
      const spread = (i - 2) * 18;
      this.tweens.add({
        targets: d.container,
        x: d.container.x + 15 * dir,
        y: d.container.y + spread,
        duration: 350, ease: 'Sine.easeOut', delay: i * 40,
      });
    });

    // 2. WRs run routes — catchX is receiver's current pos + gainPx
    const catchX = receiver.container.x + gainPx;
    const routeOffset: Record<string, number> = {
      middle: 0, outside: 30 * Math.sign(receiver.homeY - this.F.midY),
      deep: 0, short: 0, screen: 20 * Math.sign(receiver.homeY - this.F.midY),
    };
    const catchY = receiver.container.y + routeOffset[routeTarget];

    // WRs run patterns
    this.offPlayers.slice(7).forEach((wr, i) => {
      const isTarget = i === receiverIdx - 7;
      const routeX = isTarget && success ? catchX : wr.container.x + gainPx * 0.4 * dir;
      const routeY = isTarget && success ? catchY : wr.container.y + (i % 2 === 0 ? -15 : 15);
      this.tweens.add({
        targets: wr.container,
        x: routeX, y: routeY,
        duration: routeTarget === 'deep' ? 650 : 450,
        ease: 'Sine.easeOut',
        delay: 80 + i * 30,
        onUpdate: () => {
          drawSprite(wr.gfx, wr.team.primaryColor, wr.team.secondaryColor, wr.facing, wr.role,
            Math.floor(this.walkFrame / 1) % 2, true);
        },
      });
    });

    // 3. Ball arc from QB drop-back point to catch
    const startBx = qbDropX;
    const startBy = this.F.midY - 18;
    const arcPeak  = startBy - (routeTarget === 'deep' ? 70 : routeTarget === 'screen' ? 20 : 45);
    const upDur    = routeTarget === 'deep' ? 320 : 220;
    const downDur  = routeTarget === 'deep' ? 280 : 180;

    this.ballContainer.setPosition(startBx, startBy);

    if (success) {
      // Arc up (delay 300ms, upDur ms) → done at 300+upDur
      this.tweens.add({
        targets: this.ballContainer,
        x: catchX, y: arcPeak,
        duration: upDur, ease: 'Sine.easeOut', delay: 300,
      });
      // Arc down (delay 300+upDur, downDur ms) → done at 300+upDur+downDur
      this.tweens.add({
        targets: this.ballContainer,
        x: catchX, y: catchY - 10,
        duration: downDur, ease: 'Sine.easeIn', delay: 300 + upDur,
      });
      // Catch shake and tacklers converge at catch time
      this.time.delayedCall(300 + upDur + downDur, () => {
        this.cameras.main.shake(80, 0.005);
        this.defPlayers.slice(7, 10).forEach((d) => {
          this.tweens.add({ targets: d.container, x: catchX, y: catchY, duration: 250, ease: 'Power2' });
        });
      });
      // Tackle impact and done — total: 300+upDur+downDur+300 ms
      this.time.delayedCall(300 + upDur + downDur + 300, () => {
        this.cameras.main.shake(100, 0.007);
        onDone();
      });
    } else {
      // Incomplete — ball arcs out and falls (delay 300, 250ms up) → done at 550ms
      this.tweens.add({
        targets: this.ballContainer,
        x: receiver.container.x + gainPx * 0.6 * dir,
        y: arcPeak,
        duration: 250, ease: 'Sine.easeOut', delay: 300,
      });
      // Ball falls (delay 550ms, 220ms) → done at 770ms
      this.tweens.add({
        targets: this.ballContainer,
        y: this.F.midY + 20,
        duration: 220, ease: 'Bounce.easeOut', delay: 550,
      });
      // Done at 970ms
      this.time.delayedCall(970, onDone);
    }
  }

  // ── Special play animations ─────────────────────────────────────────────────
  private animateKick(made: boolean, onDone: () => void) {
    const { possession } = this.state;
    const kicker = this.offPlayers[6];
    const goalX = possession === 'home'
      ? this.F.left + this.F.w * 0.95
      : this.F.left + this.F.w * 0.05;
    const peakY = this.F.top - 60;

    // Kicker charges (300ms)
    this.tweens.add({ targets: kicker.container, x: this.ballContainer.x, duration: 300, ease: 'Power2' });
    drawSprite(kicker.gfx, kicker.team.primaryColor, kicker.team.secondaryColor, kicker.facing, kicker.role, 1, true);

    // Ball arc up (delay 300ms, 450ms) → done at 750ms
    this.tweens.add({ targets: this.ballContainer, x: goalX, y: peakY, duration: 450, ease: 'Sine.easeOut', delay: 300 });
    // Ball arc down (delay 750ms, 300ms) → done at 1050ms
    this.tweens.add({ targets: this.ballContainer, y: made ? peakY + 20 : this.F.midY + 30,
      duration: 300, ease: made ? 'Linear' : 'Bounce.easeOut', delay: 750 });

    // Done at 1350ms
    this.time.delayedCall(1350, () => {
      if (made) this.cameras.main.shake(80, 0.006);
      onDone();
    });
  }

  private animatePunt(totalPx: number, onDone: () => void) {
    const punter = this.offPlayers[6];
    drawSprite(punter.gfx, punter.team.primaryColor, punter.team.secondaryColor, punter.facing, punter.role, 1, true);

    // Ball arc up (500ms) → down (350ms) → done at 850ms + 200ms = 1050ms
    this.tweens.add({
      targets: this.ballContainer,
      x: this.ballContainer.x + totalPx * (this.F.w / 100),
      y: this.F.top - 30,
      duration: 500, ease: 'Sine.easeOut',
    });
    this.tweens.add({ targets: this.ballContainer, y: this.F.midY - 18, duration: 350, ease: 'Bounce.easeOut', delay: 500 });
    this.time.delayedCall(1050, onDone);
  }

  private animateTurnover(playType: 'run' | 'pass' | 'special', defPlayer: PlayerSprite, dir: number, onDone: () => void) {
    if (playType === 'pass') {
      // INT: defender jumps to ball (350ms), ball moves to defender (delay 350, 200ms)
      const targetX = this.ballContainer.x + 30 * dir;
      const targetY = this.ballContainer.y - 20;
      this.tweens.add({ targets: defPlayer.container, x: targetX, y: targetY, duration: 350, ease: 'Power2' });
      this.tweens.add({ targets: this.ballContainer, x: targetX, y: targetY, duration: 200, delay: 350 });
      // Done at 350+200+300 = 850ms
      this.time.delayedCall(850, () => {
        this.cameras.main.shake(100, 0.008);
        onDone();
      });
    } else {
      this.cameras.main.shake(150, 0.010);
      this.time.delayedCall(400, onDone);
    }
  }

  // ── After play: show result, reset, continue ────────────────────────────────
  private afterPlay(text: string, continueGame: boolean) {
    this.tweens.killTweensOf(this.resultBanner);
    this.resultBanner.setText(text).setAlpha(1);
    this.tweens.add({
      targets: this.resultBanner, alpha: 0,
      delay: 1800, duration: 350,
      onComplete: () => {
        this.animating = false;
        if (this.state.gameOver) {
          this.showGameOver();
        } else if (continueGame) {
          this.drawField();
          this.drawScoreboard();
          this.spawnFormation();
          if (this.state.possession === 'home') this.showPlayMenu();
          else this.aiTimer = 1200;
        }
      },
    });
  }

  private resetAfterScore() {
    this.state.possession = this.state.possession === 'home' ? 'away' : 'home';
    this.state.fieldPosition = 20; this.state.down = 1; this.state.yardsToGo = 10;
  }

  // ── Field drawing ────────────────────────────────────────────────────────────
  private drawField() {
    const { F, state } = this;
    const g = this.fieldLayer;
    g.clear();

    const { homeTeam, awayTeam, possession, fieldPosition, yardsToGo, down } = state;

    // End zones
    g.fillStyle(homeTeam.primaryColor);
    g.fillRect(F.left, F.top, F.w * 0.1, F.h);
    g.fillStyle(homeTeam.secondaryColor, 0.3);
    g.fillRect(F.left + 2, F.top, F.w * 0.1 - 4, F.h);

    g.fillStyle(awayTeam.primaryColor);
    g.fillRect(F.left + F.w * 0.9, F.top, F.w * 0.1, F.h);
    g.fillStyle(awayTeam.secondaryColor, 0.3);
    g.fillRect(F.left + F.w * 0.9 + 2, F.top, F.w * 0.1 - 4, F.h);

    // Field stripes
    for (let i = 0; i < 10; i++) {
      g.fillStyle(i % 2 === 0 ? 0x1e6b18 : 0x195914);
      g.fillRect(F.left + F.w * 0.1 + F.w * 0.8 / 10 * i, F.top, F.w * 0.8 / 10 + 1, F.h);
    }

    g.lineStyle(2, 0xffffff, 0.4);
    g.strokeRect(F.left + F.w * 0.1, F.top, F.w * 0.8, F.h);

    // Goal lines
    g.lineStyle(3, 0xffffff, 0.9);
    g.beginPath(); g.moveTo(F.left + F.w * 0.1, F.top); g.lineTo(F.left + F.w * 0.1, F.bottom); g.strokePath();
    g.beginPath(); g.moveTo(F.left + F.w * 0.9, F.top); g.lineTo(F.left + F.w * 0.9, F.bottom); g.strokePath();

    // Yard lines
    g.lineStyle(2, 0xffffff, 0.5);
    for (let y = 10; y <= 90; y += 10) {
      if (y === 50) continue;
      const x = F.left + F.w * y / 100;
      g.beginPath(); g.moveTo(x, F.top); g.lineTo(x, F.bottom); g.strokePath();
    }
    g.lineStyle(3, 0xffffff, 0.8);
    const mid = F.left + F.w / 2;
    g.beginPath(); g.moveTo(mid, F.top); g.lineTo(mid, F.bottom); g.strokePath();

    // Hash marks
    g.lineStyle(2, 0xffffff, 0.35);
    for (let y = 5; y <= 95; y += 5) {
      const x = F.left + F.w * y / 100;
      const h1 = F.top + F.h * 0.36, h2 = F.top + F.h * 0.40;
      const h3 = F.top + F.h * 0.60, h4 = F.top + F.h * 0.64;
      g.beginPath(); g.moveTo(x, h1); g.lineTo(x, h2); g.strokePath();
      g.beginPath(); g.moveTo(x, h3); g.lineTo(x, h4); g.strokePath();
    }

    // Yard numbers — destroy old texts before recreating
    this.fieldTexts.forEach(t => t.destroy());
    this.fieldTexts = [];
    const numStyle = { fontSize: '10px', fontFamily: 'Arial', color: 'rgba(255,255,255,0.4)', align: 'center' };
    [10,20,30,40,50,40,30,20,10].forEach((n, i) => {
      const x = F.left + F.w * (i + 1) * 0.1;
      this.fieldTexts.push(
        this.add.text(x, F.top + 8, String(n), numStyle).setOrigin(0.5).setDepth(3),
        this.add.text(x, F.bottom - 10, String(n), numStyle).setOrigin(0.5).setDepth(3),
      );
    });

    // Line of scrimmage (yellow)
    const ballX = this.yardsToPx(fieldPosition);
    g.lineStyle(2, 0xFFFF00, 0.85);
    g.beginPath(); g.moveTo(ballX, F.top); g.lineTo(ballX, F.bottom); g.strokePath();

    // First down marker (orange)
    const fdDir = possession === 'home' ? 1 : -1;
    const fdYards = clamp(fieldPosition + yardsToGo * fdDir, 0, 100);
    const fdX = this.yardsToPx(fdYards);
    g.lineStyle(3, 0xFF6600, 0.9);
    g.beginPath(); g.moveTo(fdX, F.top); g.lineTo(fdX, F.bottom); g.strokePath();
    g.fillStyle(0xFF6600, 0.9);
    g.fillTriangle(fdX, F.bottom + 8, fdX - 5, F.bottom, fdX + 5, F.bottom);

    // Goal posts
    const gpostColor = 0xFFD700;
    [[F.left + F.w * 0.05], [F.left + F.w * 0.95]].forEach(([px]) => {
      g.lineStyle(4, gpostColor, 1);
      g.beginPath(); g.moveTo(px, F.top - 5); g.lineTo(px, F.top - 45); g.strokePath();
      g.beginPath(); g.moveTo(px - 18, F.top - 45); g.lineTo(px + 18, F.top - 45); g.strokePath();
      g.lineStyle(3, gpostColor, 1);
      g.beginPath(); g.moveTo(px - 18, F.top - 35); g.lineTo(px - 18, F.top - 45); g.strokePath();
      g.beginPath(); g.moveTo(px + 18, F.top - 35); g.lineTo(px + 18, F.top - 45); g.strokePath();
    });

    // Down indicator text
    void down; // used in scoreboard
  }

  private drawCrowd() {
    const W = this.scale.width;
    const { top } = this.F;
    const g = this.crowdLayer;
    g.clear();
    g.fillStyle(0x0a0a15);
    g.fillRect(0, 0, W, top);
    const rowColors = [0x1a1a35, 0x151525, 0x1e1e3a, 0x0f0f20];
    const rowH = 12;
    for (let row = 0; row < 8; row++) {
      g.fillStyle(rowColors[row % 4]);
      g.fillRect(0, row * rowH, W, rowH - 1);
      for (let col = 0; col < W; col += 7) {
        const rng = ((col * 13 + row * 7) % 17);
        if (rng > 5) {
          g.fillStyle([0xcc2200, 0x0055cc, 0xeecc00, 0xffffff, 0x222244][rng % 5], 0.5);
          g.fillRect(col + row % 3, row * rowH + 3, 5, 6);
        }
      }
    }
    g.lineStyle(2, 0x334466, 0.6);
    g.beginPath(); g.moveTo(0, top); g.lineTo(W, top); g.strokePath();
  }

  private drawScoreboard() {
    const W = this.scale.width;
    const g = this.uiLayer;
    g.clear();
    this.uiTexts.forEach(t => t.destroy());
    this.uiTexts = [];

    const { homeTeam, awayTeam, homeScore, awayScore, quarter, timeLeft, down, yardsToGo, possession, league, fieldPosition } = this.state;
    const qStr = quarter > 4 ? 'OT' : `Q${quarter}`;
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
    const downOrd = ['st','nd','rd','th'][Math.min(down - 1, 3)];
    const posStr = fieldPosition === 50 ? '50' : fieldPosition > 50 ? `OPP ${100 - fieldPosition}` : `OWN ${fieldPosition}`;

    const sbW = 440, sbH = 100, sbX = W / 2 - sbW / 2, sbY = 8;
    g.fillStyle(0x000000, 0.85);
    g.fillRoundedRect(sbX, sbY, sbW, sbH, 14);
    g.lineStyle(1, 0xffffff, 0.08);
    g.strokeRoundedRect(sbX, sbY, sbW, sbH, 14);
    g.fillStyle(0xffffff, 0.03);
    g.fillRoundedRect(sbX + 2, sbY + 2, sbW - 4, 30, 12);
    g.fillStyle(homeTeam.primaryColor);
    g.fillRoundedRect(sbX, sbY, 6, sbH, { tl: 14, tr: 0, bl: 14, br: 0 });
    g.fillStyle(awayTeam.primaryColor);
    g.fillRoundedRect(sbX + sbW - 6, sbY, 6, sbH, { tl: 0, tr: 14, bl: 0, br: 14 });
    g.lineStyle(1, 0xffffff, 0.1);
    g.beginPath(); g.moveTo(W / 2, sbY + 12); g.lineTo(W / 2, sbY + sbH - 12); g.strokePath();

    // Possession triangle
    const posX = possession === 'home' ? W / 2 - 100 : W / 2 + 100;
    g.fillStyle(0xFFFF00);
    const pty = sbY + sbH / 2;
    if (possession === 'home') g.fillTriangle(posX + 10, pty, posX, pty - 6, posX, pty + 6);
    else g.fillTriangle(posX - 10, pty, posX, pty - 6, posX, pty + 6);

    const badgeColor = league === 'nfl' ? 0x013369 : 0x8B0000;
    g.fillStyle(badgeColor);
    g.fillRoundedRect(sbX + sbW - 60, sbY + sbH + 5, 50, 18, 4);

    const addTxt = (x: number, y: number, str: string, size: string, color = '#ffffff', impact = false) => {
      const t = this.add.text(x, y, str, {
        fontSize: size, fontFamily: impact ? 'Impact, Arial Narrow, sans-serif' : 'Arial, sans-serif',
        color, align: 'center',
      }).setOrigin(0.5).setDepth(11);
      this.uiTexts.push(t);
    };

    addTxt(sbX + sbW - 35, sbY + sbH + 14, league.toUpperCase(), '9px', '#ffffff');
    addTxt(sbX + 75, sbY + 24, homeTeam.abbreviation, '11px', '#ffffff88');
    addTxt(sbX + sbW - 75, sbY + 24, awayTeam.abbreviation, '11px', '#ffffff88');
    addTxt(sbX + 75, sbY + 54, String(homeScore), '36px', '#ffffff', true);
    addTxt(sbX + sbW - 75, sbY + 54, String(awayScore), '36px', '#ffffff', true);
    addTxt(W / 2, sbY + 26, `${qStr}  ${timeStr}`, '14px', '#ffffffcc', true);
    addTxt(W / 2, sbY + 56, `${down}${downOrd} & ${yardsToGo}`, '12px', '#aaaaaa');
    addTxt(W / 2, sbY + 75, `Ball at ${posStr}`, '10px', '#666666');
  }

  // ── Play menu ────────────────────────────────────────────────────────────────
  private showPlayMenu() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.clearPlayMenu();

    const g = this.playMenuLayer;
    g.clear();
    const menuH = 185, menuY = H - menuH - 5;

    g.fillStyle(0x050510, 0.96);
    g.fillRoundedRect(10, menuY, W - 20, menuH, 12);
    g.lineStyle(1, 0xffffff, 0.08);
    g.strokeRoundedRect(10, menuY, W - 20, menuH, 12);
    g.lineStyle(2, 0x2244aa, 0.6);
    g.beginPath(); g.moveTo(20, menuY + 1); g.lineTo(W - 20, menuY + 1); g.strokePath();

    const label = this.add.text(W / 2, menuY + 14, 'SELECT A PLAY', {
      fontSize: '9px', fontFamily: 'Arial', color: '#ffffff44', letterSpacing: 5,
    }).setOrigin(0.5).setDepth(16);
    this.playTexts.push(label);

    const cols = 4, padX = 16, padY = 28;
    const availW = W - 20 - padX * 2;
    const btnW = availW / cols - 8, btnH = 36, rowGap = 8;

    PLAYS.forEach((play, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const bx = 10 + padX + col * (btnW + 8) + btnW / 2;
      const by = menuY + padY + row * (btnH + rowGap) + btnH / 2;

      const bgColor = play.type === 'run' ? 0x0d2040 : play.type === 'pass' ? 0x0d2818 : 0x2a1800;
      const borderColor = play.type === 'run' ? 0x1e4080 : play.type === 'pass' ? 0x1e5030 : 0x664400;

      const btnGfx = this.add.graphics().setDepth(16);
      this.playButtons.push(btnGfx);

      const draw = (hover: boolean) => {
        btnGfx.clear();
        btnGfx.fillStyle(hover ? lighten(bgColor, 20) : bgColor, 1);
        btnGfx.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        btnGfx.lineStyle(1, hover ? 0xffffff : borderColor, hover ? 0.4 : 1);
        btnGfx.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      };

      draw(false);
      btnGfx.setPosition(bx, by);
      btnGfx.setInteractive(new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH), Phaser.Geom.Rectangle.Contains);
      btnGfx.on('pointerover', () => draw(true));
      btnGfx.on('pointerout',  () => draw(false));
      btnGfx.on('pointerdown', () => this.executePlay(play));

      const nameColor = play.type === 'run' ? '#7ab3ff' : play.type === 'pass' ? '#7affab' : '#ffcc66';
      this.playTexts.push(
        this.add.text(bx, by - 6, play.name, { fontSize: '11px', fontFamily: 'Arial', fontStyle: 'bold', color: nameColor })
          .setOrigin(0.5).setDepth(17),
        this.add.text(bx, by + 10, `${Math.round(play.successChance * 100)}%`, { fontSize: '9px', fontFamily: 'Arial', color: '#555577' })
          .setOrigin(0.5).setDepth(17),
      );
    });
  }

  private clearPlayMenu() {
    this.playMenuLayer.clear();
    this.playButtons.forEach(b => b.destroy()); this.playButtons = [];
    this.playTexts.forEach(t => t.destroy());   this.playTexts = [];
  }

  private executeAIPlay() {
    const { state } = this;
    let candidates = PLAYS.filter(p => p.type !== 'special');
    if (state.down === 4) {
      if (state.yardsToGo <= 2) candidates = [PLAYS.find(p => p.name === 'QB Sneak')!];
      else if (state.fieldPosition > 65) candidates = [PLAYS.find(p => p.name === 'Field Goal')!];
      else candidates = [PLAYS.find(p => p.name === 'Punt')!];
    } else if (state.yardsToGo >= 8) {
      candidates = PLAYS.filter(p => p.type === 'pass');
    }
    this.executePlay(candidates[Math.floor(Math.random() * candidates.length)]);
  }

  private showGameOver() {
    const W = this.scale.width; const H = this.scale.height;
    const { state } = this;
    const homeWins = state.homeScore > state.awayScore;
    const winner = homeWins ? state.homeTeam : state.awayTeam;

    // Emit game over data so React overlay can handle DB saving and navigation
    this.game.events.emit('gameOver', {
      homeTeamId: state.homeTeam.id,
      homeTeamName: `${state.homeTeam.city} ${state.homeTeam.name}`,
      homeScore: state.homeScore,
      awayTeamId: state.awayTeam.id,
      awayTeamName: `${state.awayTeam.city} ${state.awayTeam.name}`,
      awayScore: state.awayScore,
      league: state.league,
      winnerId: winner.id,
      winnerName: `${winner.city} ${winner.name}`,
      winnerColor: winner.primaryColor,
    });

    const ov = this.add.graphics().setDepth(30);
    ov.fillStyle(0x000000, 0.88);
    ov.fillRect(0, 0, W, H);
    const panelW = 380, panelH = 220;
    ov.fillStyle(0x0a0a18, 1);
    ov.fillRoundedRect(W / 2 - panelW / 2, H / 2 - panelH / 2, panelW, panelH, 16);
    ov.lineStyle(3, winner.primaryColor, 0.8);
    ov.strokeRoundedRect(W / 2 - panelW / 2, H / 2 - panelH / 2, panelW, panelH, 16);

    this.add.text(W / 2, H / 2 - 85, 'FINAL', { fontSize: '11px', fontFamily: 'Arial', color: '#ffffff33', letterSpacing: 6 }).setOrigin(0.5).setDepth(31);
    this.add.text(W / 2, H / 2 - 55, `${winner.city.toUpperCase()} WIN`, {
      fontSize: '40px', fontFamily: 'Impact, Arial Narrow, sans-serif',
      color: hexStr(winner.primaryColor), stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(31);
    this.add.text(W / 2, H / 2, `${state.homeTeam.abbreviation}  ${state.homeScore}  —  ${state.awayScore}  ${state.awayTeam.abbreviation}`, {
      fontSize: '22px', fontFamily: 'Impact, sans-serif', color: '#ffffff',
    }).setOrigin(0.5).setDepth(31);

    this.add.text(W / 2 - 90, H / 2 + 60, 'PLAY AGAIN', {
      fontSize: '14px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffffff',
      backgroundColor: '#1e3a5f', padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setDepth(31).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.restart({ homeTeam: state.homeTeam, awayTeam: state.awayTeam, league: state.league }));

    this.add.text(W / 2 + 90, H / 2 + 60, 'CHANGE TEAMS', {
      fontSize: '14px', fontFamily: 'Arial', fontStyle: 'bold', color: '#aaaaaa',
      backgroundColor: '#111111', padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setDepth(31).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.game.events.emit('navigate', '/game/select'));
  }

  update(_time: number, delta: number) {
    this.walkTimer += delta;
    if (this.walkTimer > 200) { this.walkTimer = 0; }

    // AI turn
    if (this.aiTimer > 0 && !this.animating && !this.state.gameOver) {
      this.aiTimer -= delta;
      if (this.aiTimer <= 0) { this.aiTimer = 0; this.executeAIPlay(); }
    }
  }
}

export interface GameOverData {
  homeTeamId: string;
  homeTeamName: string;
  homeScore: number;
  awayTeamId: string;
  awayTeamName: string;
  awayScore: number;
  league: 'nfl' | 'ncaa';
  winnerId: string;
  winnerName: string;
  winnerColor: number;
}

// ─── Factory ─────────────────────────────────────────────────────────────────
export function createFootballGame(
  container: HTMLElement,
  homeTeam: GameTeam,
  awayTeam: GameTeam,
  league: 'nfl' | 'ncaa',
  onNavigate: (path: string) => void,
  onGameOver?: (data: GameOverData) => void,
): Phaser.Game {
  // Store team data before Phaser starts so GameScene.init() can read it
  _gameData = { homeTeam, awayTeam, league };

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: container.clientWidth || 960,
    height: container.clientHeight || 600,
    backgroundColor: '#080810',
    parent: container,
    scene: [GameScene],  // No BootScene — GameScene starts directly with _gameData
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true, pixelArt: false },
  });

  game.events.on('navigate', (path: string) => { onNavigate(path); });
  if (onGameOver) {
    game.events.on('gameOver', (data: GameOverData) => { onGameOver(data); });
  }
  return game;
}
