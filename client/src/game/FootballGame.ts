import Phaser from 'phaser';
import type { GameTeam } from './teams';

// ─── Types ────────────────────────────────────────────────────────────────────
interface OffensePlay {
  id: 'power_run' | 'sweep' | 'quick_pass' | 'bomb';
  name: string; emoji: string; subtitle: string;
  type: 'run' | 'pass'; baseGain: number; variance: number; successChance: number;
}
interface DefensePlay {
  id: 'stack_box' | 'blitz' | 'man_cover' | 'zone';
  name: string; emoji: string; subtitle: string;
}
interface GameState {
  quarter: number; timeLeft: number; possession: 'home' | 'away';
  down: number; yardsToGo: number; fieldPosition: number;
  homeScore: number; awayScore: number;
  homeTeam: GameTeam; awayTeam: GameTeam; league: 'nfl' | 'ncaa';
  gameOver: boolean; momentum: number;
  offPlayHistory: Partial<Record<OffensePlay['id'], number>>;
}
interface PlayerSprite {
  container: Phaser.GameObjects.Container;
  gfx: Phaser.GameObjects.Graphics;
  role: 'qb' | 'rb' | 'wr' | 'ol' | 'dl' | 'lb' | 'cb' | 's';
  side: 'off' | 'def'; homeX: number; homeY: number;
  facing: 'left' | 'right'; team: GameTeam; isStar: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const OFFENSE_PLAYS: OffensePlay[] = [
  { id: 'power_run',  name: 'POWER RUN',   emoji: '💪', subtitle: 'Up the middle',  type: 'run',  baseGain: 4,  variance: 4,  successChance: 0.78 },
  { id: 'sweep',      name: 'SPEED SWEEP', emoji: '⚡', subtitle: 'Outside run',    type: 'run',  baseGain: 5,  variance: 8,  successChance: 0.65 },
  { id: 'quick_pass', name: 'SHORT PASS',  emoji: '➡️', subtitle: 'Quick slant',    type: 'pass', baseGain: 8,  variance: 5,  successChance: 0.74 },
  { id: 'bomb',       name: 'DEEP BOMB',   emoji: '🚀', subtitle: 'Go route — risky', type: 'pass', baseGain: 24, variance: 14, successChance: 0.38 },
];
const DEFENSE_PLAYS: DefensePlay[] = [
  { id: 'stack_box', name: 'STACK BOX', emoji: '🛡', subtitle: 'Stop the run' },
  { id: 'blitz',     name: 'BLITZ',     emoji: '💨', subtitle: 'Rush the QB' },
  { id: 'man_cover', name: 'MAN COVER', emoji: '👊', subtitle: 'Press coverage' },
  { id: 'zone',      name: 'ZONE DEF',  emoji: '🔰', subtitle: 'Protect deep' },
];
// multiplier on yards: 0.05 = stuffed, 1.0 = normal, 2.2 = open, 3.0 = huge
const MATCHUP: Record<OffensePlay['id'], Record<DefensePlay['id'], number>> = {
  power_run:  { stack_box: 0.05, blitz: 1.6,  man_cover: 1.0,  zone: 1.0  },
  sweep:      { stack_box: 0.06, blitz: 2.8,  man_cover: 1.1,  zone: 1.1  },
  quick_pass: { stack_box: 2.0,  blitz: 1.4,  man_cover: 0.05, zone: 1.2  },
  bomb:       { stack_box: 2.5,  blitz: 0.05, man_cover: 1.4,  zone: 0.08 },
};
const MATCHUP_LABEL: Record<number, string> = {
  // approximate buckets
};
function matchupVerdict(mult: number): { text: string; color: number } {
  if (mult <= 0.08) return { text: '🛑 STUFFED! DEFENSE CALLED IT!', color: 0xff2222 };
  if (mult >= 2.4)  return { text: '🔥 WIDE OPEN! HUGE ADVANTAGE!',  color: 0xffcc00 };
  if (mult >= 1.5)  return { text: '✅ OPEN FIELD! ADVANTAGE YOURS', color: 0x44ff88 };
  return { text: '⚡ NORMAL PLAY', color: 0x88aaff };
}

// ─── Sound Engine ─────────────────────────────────────────────────────────────
class SoundEngine {
  private ctx: AudioContext | null = null;
  private getCtx(): AudioContext | null {
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    } catch { return null; }
  }
  private play(freq: number, type: OscillatorType, dur: number, gain: number, freqEnd?: number, delay = 0) {
    const ctx = this.getCtx(); if (!ctx) return;
    try {
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = type; osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + delay + dur * 0.8);
      g.gain.setValueAtTime(gain, ctx.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + dur);
      osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + dur);
    } catch {}
  }
  whistle()    { this.play(2800, 'sine',     0.22, 0.22, 2100); }
  tackle()     { this.play(90,   'sawtooth', 0.18, 0.40, 28); this.play(350, 'square', 0.06, 0.15, 80); }
  catch()      { this.play(900,  'sine',     0.12, 0.14, 1300); }
  incomplete() { this.play(400,  'sine',     0.10, 0.12, 200); }
  crowd(intensity: number) {
    const ctx = this.getCtx(); if (!ctx) return;
    try {
      const sr = ctx.sampleRate; const len = Math.floor(sr * 0.28);
      const buf = ctx.createBuffer(1, len, sr); const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1);
      const src = ctx.createBufferSource(); src.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass';
      f.frequency.value = 700 + intensity * 500; f.Q.value = 0.7;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.18 * intensity, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
      src.connect(f); f.connect(g); g.connect(ctx.destination);
      src.start(); src.stop(ctx.currentTime + 0.28);
    } catch {}
  }
  touchdown() {
    [523, 659, 784, 1047, 1568].forEach((hz, i) => {
      this.play(hz, 'triangle', 0.45, 0.22, undefined, i * 0.11);
    });
    this.crowd(1.0);
  }
  bigPlay() { this.play(220, 'sawtooth', 0.30, 0.10, 660); this.crowd(0.7); }
  sack()    { this.play(80,  'sawtooth', 0.20, 0.45, 30); this.crowd(0.6); }
  fieldGoal() {
    [880, 1100, 1320].forEach((hz, i) => this.play(hz, 'sine', 0.4, 0.18, undefined, i * 0.09));
    this.crowd(0.8);
  }
}
const SFX = new SoundEngine();

// ─── Helpers ─────────────────────────────────────────────────────────────────
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function hexStr(hex: number) { return `#${hex.toString(16).padStart(6, '0')}`; }
function lighten(hex: number, amt: number) {
  return (clamp(((hex >> 16) & 0xff) + amt, 0, 255) << 16) |
         (clamp(((hex >> 8)  & 0xff) + amt, 0, 255) << 8)  |
         (clamp((hex & 0xff) + amt, 0, 255));
}
function darken(hex: number, amt: number) { return lighten(hex, -amt); }

// ─── Player Sprite ────────────────────────────────────────────────────────────
function drawSprite(
  gfx: Phaser.GameObjects.Graphics, primary: number, secondary: number,
  facing: 'left' | 'right', role: PlayerSprite['role'],
  walkFrame: number, running: boolean, isStar = false,
) {
  gfx.clear();
  const dir = facing === 'right' ? 1 : -1;
  const lp = walkFrame % 2;
  const legOff = running ? (lp === 0 ? 6 : -6) : (lp === 0 ? 2 : -2);
  const isLineman = role === 'ol' || role === 'dl';
  const bW = isLineman ? 14 : 10; const pW = isLineman ? 18 : 14;

  // Star player glow
  if (isStar) {
    gfx.fillStyle(0xffdd00, 0.18);
    gfx.fillEllipse(0, 0, 34, 34);
  }

  // Shadow
  gfx.fillStyle(0x000000, 0.25);
  gfx.fillEllipse(0, 16, isLineman ? 22 : 17, 5);

  // Legs
  gfx.fillStyle(darken(primary, 60));
  gfx.fillRect(-5, 7, 4, 9 + legOff);
  gfx.fillRect(1,  7, 4, 9 - legOff);

  // Cleats
  gfx.fillStyle(0x111111);
  gfx.fillRect(-6 + dir, 16 + legOff, 6, 3);
  gfx.fillRect(0  + dir, 16 - legOff, 6, 3);

  // Jersey
  gfx.fillStyle(primary);
  gfx.fillRect(-Math.floor(bW / 2), -3, bW, 11);
  gfx.fillStyle(secondary, 0.9);
  gfx.fillRect(-3, -1, 6, 3);

  // Shoulder pads
  gfx.fillStyle(lighten(primary, 40));
  gfx.fillRect(-Math.floor(pW / 2), -6, pW, 5);
  gfx.lineStyle(1.5, secondary, 1);
  gfx.strokeRect(-Math.floor(pW / 2), -6, pW, 5);

  // Arms
  gfx.fillStyle(lighten(primary, 25));
  if (role === 'qb' && !running) {
    gfx.fillRect(Math.floor(pW / 2) * dir, -10, 3 * dir, 8);
  } else {
    gfx.fillRect(-Math.floor(pW / 2) - 3, -5, 3, 6);
    gfx.fillRect(Math.floor(pW / 2),      -5, 3, 6);
  }

  // Helmet
  gfx.fillStyle(primary);
  gfx.fillEllipse(0, -13, 15, 14);
  gfx.fillStyle(0xffffff, 0.12);
  gfx.fillEllipse(-2, -16, 5, 4);

  // Face mask
  gfx.lineStyle(1.5, 0xdddddd, 0.95);
  gfx.beginPath(); gfx.moveTo(2 * dir, -9);  gfx.lineTo(8 * dir, -9);  gfx.strokePath();
  gfx.beginPath(); gfx.moveTo(2 * dir, -11); gfx.lineTo(8 * dir, -11); gfx.strokePath();

  // Helmet stripe
  gfx.lineStyle(2.5, secondary, 1);
  gfx.beginPath(); gfx.moveTo(0, -19); gfx.lineTo(0, -7); gfx.strokePath();

  // Star badge
  if (isStar) {
    gfx.fillStyle(0xffdd00, 1);
    gfx.fillTriangle(-3, -19, 0, -24, 3, -19);
  }
}

function drawBall(gfx: Phaser.GameObjects.Graphics, spin = 0) {
  gfx.clear();
  gfx.save();
  gfx.fillStyle(0x7B3F00);
  gfx.fillEllipse(0, 0, 16, 10);
  gfx.fillStyle(0xA0522D, 0.65);
  gfx.fillEllipse(-2, -2, 6, 3);
  gfx.lineStyle(1.5, 0xffffff, 0.9);
  gfx.beginPath(); gfx.moveTo(-4, 0); gfx.lineTo(4, 0); gfx.strokePath();
  for (let i = -1; i <= 1; i++) {
    gfx.lineStyle(1, 0xffffff, 0.7);
    gfx.beginPath(); gfx.moveTo(i * 2.5 + spin * 2, -4); gfx.lineTo(i * 2.5 - spin * 2, 4); gfx.strokePath();
  }
  gfx.restore();
}

// ─── Module-level data ───────────────────────────────────────────────────────
let _gameData: { homeTeam: GameTeam; awayTeam: GameTeam; league: 'nfl' | 'ncaa' } | null = null;

// ─── Main Game Scene ─────────────────────────────────────────────────────────
class GameScene extends Phaser.Scene {
  private state!: GameState;
  private animating = false;
  private selectingPlay = false;
  private aiTimer = 0;
  private walkFrame = 0;
  private spinFrame = 0;

  private F = { left: 0, top: 0, right: 0, bottom: 0, w: 0, h: 0, midY: 0 };

  private crowdLayer!:    Phaser.GameObjects.Graphics;
  private fieldLayer!:    Phaser.GameObjects.Graphics;
  private uiLayer!:       Phaser.GameObjects.Graphics;
  private menuLayer!:     Phaser.GameObjects.Graphics;
  private momentumLayer!: Phaser.GameObjects.Graphics;

  private offPlayers:  PlayerSprite[] = [];
  private defPlayers:  PlayerSprite[] = [];
  private ballContainer!: Phaser.GameObjects.Container;
  private ballGfx!:    Phaser.GameObjects.Graphics;

  private fieldTexts: Phaser.GameObjects.Text[] = [];
  private uiTexts:    Phaser.GameObjects.Text[] = [];
  private menuItems:  (Phaser.GameObjects.Graphics | Phaser.GameObjects.Text)[] = [];
  private resultBanner!: Phaser.GameObjects.Text;
  private comboText!:    Phaser.GameObjects.Text;

  private consecutiveFirstDowns = 0;
  private pendingOffPlay: OffensePlay | null = null;

  constructor() { super('Game'); }

  init(data: Partial<{ homeTeam: GameTeam; awayTeam: GameTeam; league: 'nfl' | 'ncaa' }>) {
    const d = (data?.homeTeam ? data : _gameData) as typeof _gameData;
    if (!d) return;
    this.state = {
      quarter: 1, timeLeft: 900, possession: 'home',
      down: 1, yardsToGo: 10, fieldPosition: 20,
      homeScore: 0, awayScore: 0,
      homeTeam: d.homeTeam, awayTeam: d.awayTeam,
      league: d.league, gameOver: false,
      momentum: 50,
      offPlayHistory: {},
    };
    this.animating = false; this.selectingPlay = false;
    this.aiTimer = 0; this.walkFrame = 0; this.spinFrame = 0;
    this.consecutiveFirstDowns = 0; this.pendingOffPlay = null;
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    const top = 145, bottom = H - 48, left = 28, right = W - 28;
    this.F = { left, top, right, bottom, w: right - left, h: bottom - top, midY: (top + bottom) / 2 };

    this.crowdLayer    = this.add.graphics().setDepth(0);
    this.fieldLayer    = this.add.graphics().setDepth(1);
    this.uiLayer       = this.add.graphics().setDepth(10);
    this.momentumLayer = this.add.graphics().setDepth(11);
    this.menuLayer     = this.add.graphics().setDepth(15);

    this.resultBanner = this.add.text(W / 2, this.F.midY - 50, '', {
      fontSize: '28px', fontFamily: 'system-ui, Arial Black, sans-serif', fontStyle: 'bold',
      color: '#ffffff', stroke: '#000000', strokeThickness: 7,
      shadow: { blur: 20, color: '#000', fill: true },
    }).setOrigin(0.5).setDepth(26).setAlpha(0);

    this.comboText = this.add.text(W / 2, this.F.top + 30, '', {
      fontSize: '16px', fontFamily: 'system-ui, sans-serif', fontStyle: 'bold',
      color: '#ffcc00', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(26).setAlpha(0);

    this.ballGfx = this.add.graphics();
    this.ballContainer = this.add.container(0, 0, [this.ballGfx]).setDepth(6);
    drawBall(this.ballGfx);

    this.drawCrowd();
    this.drawField();
    this.drawScoreboard();
    this.drawMomentumBar();
    this.spawnFormation();

    this.time.addEvent({
      delay: 180, loop: true,
      callback: () => {
        this.walkFrame = (this.walkFrame + 1) % 4;
        this.spinFrame = (this.spinFrame + 1) % 8;
        if (!this.animating) {
          this.redrawIdlePlayers();
          drawBall(this.ballGfx, Math.sin(this.spinFrame * 0.4) * 0.5);
        }
      },
    });

    if (this.state.possession === 'home') {
      this.time.delayedCall(400, () => this.showOffenseMenu());
    }
  }

  // ── Coords ──────────────────────────────────────────────────────────────────
  private yd2px(yards: number) { return this.F.left + this.F.w * yards / 100; }

  // ── Crowd ───────────────────────────────────────────────────────────────────
  private drawCrowd() {
    const W = this.scale.width; const { top } = this.F;
    const g = this.crowdLayer; g.clear();
    g.fillStyle(0x080812); g.fillRect(0, 0, W, top + 2);
    const rowColors = [0x181830, 0x121224, 0x1c1c38, 0x0e0e1e];
    for (let row = 0; row < 10; row++) {
      g.fillStyle(rowColors[row % 4]);
      g.fillRect(0, row * 12, W, 11);
      for (let col = 4; col < W - 4; col += 8) {
        const h = (col * 11 + row * 7) % 19;
        if (h > 6) {
          const colors = [0xcc2200, 0x0055bb, 0xddbb00, 0xffffff, 0x22aa44, 0xaa0077];
          g.fillStyle(colors[h % colors.length], 0.55);
          g.fillRect(col + row % 3, row * 12 + 3, 5, 7);
        }
      }
    }
    // Stadium rim
    g.lineStyle(3, 0x334466, 0.8);
    g.beginPath(); g.moveTo(0, top); g.lineTo(W, top); g.strokePath();
    g.fillStyle(0x111122, 0.5); g.fillRect(0, top - 4, W, 4);
  }

  // ── Field ───────────────────────────────────────────────────────────────────
  private drawField() {
    const { F, state } = this; const g = this.fieldLayer; g.clear();
    const { homeTeam, awayTeam, possession, fieldPosition, yardsToGo } = state;

    // Field base
    for (let i = 0; i < 10; i++) {
      g.fillStyle(i % 2 === 0 ? 0x1f7018 : 0x1a6013);
      g.fillRect(F.left + F.w * 0.1 + F.w * 0.8 / 10 * i, F.top, F.w * 0.8 / 10 + 1, F.h);
    }

    // End zones with team colors + team name
    const drawEndZone = (x: number, team: GameTeam) => {
      g.fillStyle(team.primaryColor, 0.85);
      g.fillRect(x, F.top, F.w * 0.1, F.h);
      g.fillStyle(team.secondaryColor, 0.3);
      g.fillRect(x + 2, F.top, F.w * 0.1 - 4, F.h);
    };
    drawEndZone(F.left, homeTeam);
    drawEndZone(F.left + F.w * 0.9, awayTeam);

    // Outer border
    g.lineStyle(2, 0xffffff, 0.2); g.strokeRect(F.left, F.top, F.w, F.h);
    g.lineStyle(2, 0xffffff, 0.18); g.strokeRect(F.left + F.w * 0.1, F.top, F.w * 0.8, F.h);

    // Goal lines
    g.lineStyle(4, 0xffffff, 1);
    g.beginPath(); g.moveTo(F.left + F.w * 0.1, F.top); g.lineTo(F.left + F.w * 0.1, F.bottom); g.strokePath();
    g.beginPath(); g.moveTo(F.left + F.w * 0.9, F.top); g.lineTo(F.left + F.w * 0.9, F.bottom); g.strokePath();

    // Yard lines
    g.lineStyle(1.5, 0xffffff, 0.45);
    for (let y = 10; y <= 90; y += 10) {
      if (y === 50) continue;
      const x = F.left + F.w * y / 100;
      g.beginPath(); g.moveTo(x, F.top); g.lineTo(x, F.bottom); g.strokePath();
    }
    g.lineStyle(2.5, 0xffffff, 0.75);
    const mid = F.left + F.w / 2;
    g.beginPath(); g.moveTo(mid, F.top); g.lineTo(mid, F.bottom); g.strokePath();

    // Hash marks
    g.lineStyle(1.5, 0xffffff, 0.38);
    for (let y = 5; y <= 95; y += 5) {
      const x = F.left + F.w * y / 100;
      const h1 = F.top + F.h * 0.36, h2 = F.top + F.h * 0.40;
      const h3 = F.top + F.h * 0.60, h4 = F.top + F.h * 0.64;
      g.beginPath(); g.moveTo(x, h1); g.lineTo(x, h2); g.strokePath();
      g.beginPath(); g.moveTo(x, h3); g.lineTo(x, h4); g.strokePath();
    }

    // Yard numbers
    this.fieldTexts.forEach(t => t.destroy()); this.fieldTexts = [];
    const numStyle = { fontSize: '11px', fontFamily: 'system-ui, Arial, sans-serif', fontStyle: 'bold', color: 'rgba(255,255,255,0.5)', align: 'center' };
    [10,20,30,40,50,40,30,20,10].forEach((n, i) => {
      const x = F.left + F.w * (i + 1) * 0.1;
      this.fieldTexts.push(
        this.add.text(x, F.top + 8, String(n), numStyle).setOrigin(0.5).setDepth(3),
        this.add.text(x, F.bottom - 12, String(n), numStyle).setOrigin(0.5).setDepth(3),
      );
    });

    // End zone text
    const ezStyle = { fontSize: '9px', fontFamily: 'system-ui, sans-serif', fontStyle: 'bold', color: 'rgba(255,255,255,0.6)', align: 'center' };
    const ezMidX1 = F.left + F.w * 0.05;
    const ezMidX2 = F.left + F.w * 0.95;
    this.fieldTexts.push(
      this.add.text(ezMidX1, F.midY, homeTeam.abbreviation, ezStyle).setOrigin(0.5).setDepth(3).setAngle(-90),
      this.add.text(ezMidX2, F.midY, awayTeam.abbreviation, ezStyle).setOrigin(0.5).setDepth(3).setAngle(90),
    );

    // Line of scrimmage
    const ballX = this.yd2px(fieldPosition);
    g.lineStyle(2.5, 0xffff00, 0.9);
    g.beginPath(); g.moveTo(ballX, F.top); g.lineTo(ballX, F.bottom); g.strokePath();

    // First down marker
    const fdDir = possession === 'home' ? 1 : -1;
    const fdYards = clamp(fieldPosition + yardsToGo * fdDir, 0, 100);
    const fdX = this.yd2px(fdYards);
    g.lineStyle(3, 0xff6600, 0.95);
    g.beginPath(); g.moveTo(fdX, F.top); g.lineTo(fdX, F.bottom); g.strokePath();
    g.fillStyle(0xff6600);
    g.fillTriangle(fdX, F.bottom + 9, fdX - 6, F.bottom, fdX + 6, F.bottom);

    // Goal posts
    [[F.left + F.w * 0.05], [F.left + F.w * 0.95]].forEach(([px]) => {
      g.lineStyle(4, 0xffd700, 1);
      g.beginPath(); g.moveTo(px, F.top - 5); g.lineTo(px, F.top - 50); g.strokePath();
      g.beginPath(); g.moveTo(px - 20, F.top - 50); g.lineTo(px + 20, F.top - 50); g.strokePath();
      g.lineStyle(3, 0xffd700, 1);
      g.beginPath(); g.moveTo(px - 20, F.top - 38); g.lineTo(px - 20, F.top - 50); g.strokePath();
      g.beginPath(); g.moveTo(px + 20, F.top - 38); g.lineTo(px + 20, F.top - 50); g.strokePath();
    });
  }

  // ── Scoreboard ───────────────────────────────────────────────────────────────
  private drawScoreboard() {
    const W = this.scale.width; const g = this.uiLayer; g.clear();
    this.uiTexts.forEach(t => t.destroy()); this.uiTexts = [];
    const { homeTeam, awayTeam, homeScore, awayScore, quarter, timeLeft, down, yardsToGo, possession, league, fieldPosition } = this.state;
    const qStr = quarter > 4 ? 'OT' : `Q${quarter}`;
    const mins = Math.floor(timeLeft / 60), secs = timeLeft % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
    const ord = ['st','nd','rd','th'][Math.min(down - 1, 3)];
    const posStr = fieldPosition === 50 ? '50' : fieldPosition > 50 ? `OPP ${100 - fieldPosition}` : `OWN ${fieldPosition}`;

    const sbW = W - 20, sbH = 110, sbX = 10, sbY = 6;

    // Main bg
    g.fillStyle(0x050510, 0.96); g.fillRoundedRect(sbX, sbY, sbW, sbH, 12);

    // Team color sidebars
    g.fillStyle(homeTeam.primaryColor, 0.95);
    g.fillRoundedRect(sbX, sbY, sbW * 0.3, sbH, { tl: 12, tr: 0, bl: 12, br: 0 });
    g.fillStyle(0x000000, 0.55);
    g.fillRoundedRect(sbX, sbY, sbW * 0.3, sbH, { tl: 12, tr: 0, bl: 12, br: 0 });

    g.fillStyle(awayTeam.primaryColor, 0.95);
    g.fillRoundedRect(sbX + sbW * 0.7, sbY, sbW * 0.3, sbH, { tl: 0, tr: 12, bl: 0, br: 12 });
    g.fillStyle(0x000000, 0.55);
    g.fillRoundedRect(sbX + sbW * 0.7, sbY, sbW * 0.3, sbH, { tl: 0, tr: 12, bl: 0, br: 12 });

    // Center bg
    g.fillStyle(0x0a0a1a, 0.98); g.fillRect(sbX + sbW * 0.3, sbY, sbW * 0.4, sbH);

    // Border
    g.lineStyle(1.5, 0xffffff, 0.08); g.strokeRoundedRect(sbX, sbY, sbW, sbH, 12);

    // Team primary color accent line
    g.lineStyle(3, homeTeam.primaryColor, 0.7);
    g.beginPath(); g.moveTo(sbX, sbY + sbH); g.lineTo(sbX + sbW * 0.3, sbY + sbH); g.strokePath();
    g.lineStyle(3, awayTeam.primaryColor, 0.7);
    g.beginPath(); g.moveTo(sbX + sbW * 0.7, sbY + sbH); g.lineTo(sbX + sbW, sbY + sbH); g.strokePath();

    // Possession arrow
    const posArrowX = possession === 'home' ? sbX + sbW * 0.31 + 14 : sbX + sbW * 0.69 - 14;
    g.fillStyle(0xffff44);
    if (possession === 'home') {
      g.fillTriangle(posArrowX, sbY + sbH / 2, posArrowX - 10, sbY + sbH / 2 - 7, posArrowX - 10, sbY + sbH / 2 + 7);
    } else {
      g.fillTriangle(posArrowX, sbY + sbH / 2, posArrowX + 10, sbY + sbH / 2 - 7, posArrowX + 10, sbY + sbH / 2 + 7);
    }

    const add = (x: number, y: number, str: string, size: string, color = '#fff', bold = false) => {
      const t = this.add.text(x, y, str, {
        fontSize: size, fontFamily: 'system-ui, Arial, sans-serif',
        fontStyle: bold ? 'bold' : 'normal', color, align: 'center',
      }).setOrigin(0.5).setDepth(11);
      this.uiTexts.push(t);
    };

    // Team names + scores
    const homeX = sbX + sbW * 0.15, awayX = sbX + sbW * 0.85, cX = sbX + sbW * 0.5;
    add(homeX, sbY + 28, homeTeam.abbreviation, '13px', 'rgba(255,255,255,0.7)');
    add(homeX, sbY + 62, String(homeScore), '44px', '#ffffff', true);
    add(awayX, sbY + 28, awayTeam.abbreviation, '13px', 'rgba(255,255,255,0.7)');
    add(awayX, sbY + 62, String(awayScore), '44px', '#ffffff', true);

    // Center info
    add(cX, sbY + 22, `${qStr}   ${timeStr}`, '15px', '#ffffff', true);
    add(cX, sbY + 44, `${down}${ord} & ${yardsToGo}`, '18px', '#ffdd66', true);
    add(cX, sbY + 68, `Ball at ${posStr}`, '11px', 'rgba(255,255,255,0.4)');
    add(cX, sbY + 88, league.toUpperCase(), '9px', 'rgba(255,255,255,0.3)');
  }

  // ── Momentum Bar ─────────────────────────────────────────────────────────────
  private drawMomentumBar() {
    const W = this.scale.width; const g = this.momentumLayer; g.clear();
    const { homeTeam, awayTeam, momentum } = this.state;
    const barY = this.F.bottom + 6, barH = 10, barX = this.F.left, barW = this.F.w;

    g.fillStyle(0x111122); g.fillRoundedRect(barX, barY, barW, barH, 5);
    const fillW = barW * momentum / 100;
    g.fillStyle(homeTeam.primaryColor); g.fillRoundedRect(barX, barY, Math.max(4, fillW), barH, 5);
    g.fillStyle(awayTeam.primaryColor); g.fillRoundedRect(barX + fillW, barY, Math.max(4, barW - fillW), barH, 5);
    g.lineStyle(1, 0xffffff, 0.1); g.strokeRoundedRect(barX, barY, barW, barH, 5);
    // Center notch
    g.lineStyle(1.5, 0xffffff, 0.3);
    g.beginPath(); g.moveTo(barX + barW / 2, barY); g.lineTo(barX + barW / 2, barY + barH); g.strokePath();
  }

  // ── Formation ────────────────────────────────────────────────────────────────
  private getOffPositions(): { x: number; y: number; role: PlayerSprite['role'] }[] {
    const { fieldPosition, possession } = this.state;
    const dir = possession === 'home' ? -1 : 1;
    const bx = this.yd2px(fieldPosition), my = this.F.midY, yd = this.F.w / 100;
    return [
      { x: bx, y: my - 34, role: 'ol' }, { x: bx, y: my - 17, role: 'ol' },
      { x: bx, y: my,      role: 'ol' }, { x: bx, y: my + 17, role: 'ol' },
      { x: bx, y: my + 34, role: 'ol' },
      { x: bx + dir * yd * 4.5, y: my,       role: 'qb' },
      { x: bx + dir * yd * 8,   y: my,       role: 'rb' },
      { x: bx + dir * yd * 1.5, y: my - 110, role: 'wr' },
      { x: bx + dir * yd * 1.5, y: my + 110, role: 'wr' },
      { x: bx + dir * yd * 1,   y: my - 65,  role: 'wr' },
      { x: bx + dir * yd * 0.5, y: my + 48,  role: 'wr' },
    ];
  }
  private getDefPositions(): { x: number; y: number; role: PlayerSprite['role'] }[] {
    const { fieldPosition, possession } = this.state;
    const dir = possession === 'home' ? 1 : -1;
    const bx = this.yd2px(fieldPosition), my = this.F.midY, yd = this.F.w / 100;
    const dl = clamp(bx + dir * yd * 1.8, this.F.left + 40, this.F.right - 40);
    const lb = clamp(bx + dir * yd * 7,   this.F.left + 40, this.F.right - 40);
    const cb = clamp(bx + dir * yd * 2.5, this.F.left + 40, this.F.right - 40);
    const s  = clamp(bx + dir * yd * 15,  this.F.left + 40, this.F.right - 40);
    return [
      { x: dl, y: my - 36, role: 'dl' }, { x: dl, y: my - 12, role: 'dl' },
      { x: dl, y: my + 12, role: 'dl' }, { x: dl, y: my + 36, role: 'dl' },
      { x: lb, y: my - 32, role: 'lb' }, { x: lb, y: my,      role: 'lb' },
      { x: lb, y: my + 32, role: 'lb' },
      { x: cb, y: my - 105, role: 'cb' }, { x: cb, y: my + 105, role: 'cb' },
      { x: s,  y: my - 38,  role: 's'  }, { x: s,  y: my + 38,  role: 's'  },
    ];
  }

  private spawnFormation() {
    this.offPlayers.forEach(p => p.container.destroy());
    this.defPlayers.forEach(p => p.container.destroy());
    this.offPlayers = []; this.defPlayers = [];
    const { possession, homeTeam, awayTeam } = this.state;
    const offTeam = possession === 'home' ? homeTeam : awayTeam;
    const defTeam = possession === 'home' ? awayTeam : homeTeam;
    const offFacing: 'left' | 'right' = possession === 'home' ? 'right' : 'left';
    const defFacing: 'left' | 'right' = offFacing === 'right' ? 'left' : 'right';
    const bx = this.yd2px(this.state.fieldPosition);
    this.ballContainer.setPosition(bx, this.F.midY - 20).setScale(1).setAlpha(1);
    drawBall(this.ballGfx);

    const mk = (pos: { x: number; y: number; role: PlayerSprite['role'] }, team: GameTeam, facing: 'left' | 'right', side: 'off' | 'def', idx: number): PlayerSprite => {
      const isStar = (side === 'off' && (pos.role === 'rb' || pos.role === 'wr') && idx === 0) ||
                     (side === 'def' && pos.role === 'lb' && idx === 0);
      const gfx = this.add.graphics();
      const container = this.add.container(pos.x, pos.y, [gfx]).setDepth(side === 'off' ? 5 : 4);
      drawSprite(gfx, team.primaryColor, team.secondaryColor, facing, pos.role, 0, false, isStar);
      return { container, gfx, role: pos.role, side, homeX: pos.x, homeY: pos.y, facing, team, isStar };
    };
    let offStar = 0, defStar = 0;
    this.getOffPositions().forEach(pos => {
      const p = mk(pos, offTeam, offFacing, 'off', offStar);
      if (pos.role === 'rb' || pos.role === 'wr') offStar++;
      this.offPlayers.push(p);
    });
    this.getDefPositions().forEach(pos => {
      const p = mk(pos, defTeam, defFacing, 'def', defStar);
      if (pos.role === 'lb') defStar++;
      this.defPlayers.push(p);
    });
  }

  private redrawIdlePlayers() {
    const f = Math.floor(this.walkFrame / 2) % 2;
    [...this.offPlayers, ...this.defPlayers].forEach(p => {
      if (p.container.active)
        drawSprite(p.gfx, p.team.primaryColor, p.team.secondaryColor, p.facing, p.role, f, false, p.isStar);
    });
  }

  // ── Particles ─────────────────────────────────────────────────────────────────
  private burst(x: number, y: number, color: number, count = 14) {
    for (let i = 0; i < count; i++) {
      const g = this.add.graphics().setDepth(30);
      const sz = 3 + Math.random() * 4;
      g.fillStyle(color, 1); g.fillCircle(0, 0, sz);
      g.setPosition(x, y);
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const spd = 40 + Math.random() * 90;
      this.tweens.add({
        targets: g, x: x + Math.cos(angle) * spd, y: y + Math.sin(angle) * spd,
        alpha: 0, scaleX: 0.3, scaleY: 0.3,
        duration: 400 + Math.random() * 300, ease: 'Power2',
        onComplete: () => g.destroy(),
      });
    }
  }

  private confetti(x: number, y: number) {
    const cols = [0xff2222, 0xffdd00, 0x22ddff, 0xffffff, 0x44ff88, 0xff88ff];
    for (let i = 0; i < 32; i++) {
      const g = this.add.graphics().setDepth(30);
      g.fillStyle(cols[i % cols.length], 1); g.fillRect(-3, -5, 6, 10);
      g.setPosition(x + (Math.random() - 0.5) * 80, y - 20);
      this.tweens.add({
        targets: g,
        x: g.x + (Math.random() - 0.5) * 160,
        y: g.y + 120 + Math.random() * 80,
        angle: Math.random() * 720 - 360,
        alpha: 0,
        duration: 900 + Math.random() * 500,
        ease: 'Power1',
        onComplete: () => g.destroy(),
      });
    }
  }

  private speedTrail(container: Phaser.GameObjects.Container, color: number) {
    const g = this.add.graphics().setDepth(4).setAlpha(0.5);
    g.fillStyle(color, 0.4); g.fillEllipse(0, 0, 12, 8);
    g.setPosition(container.x, container.y);
    this.tweens.add({ targets: g, alpha: 0, scaleX: 0.3, duration: 200, onComplete: () => g.destroy() });
  }

  // ── Offense Play Menu ─────────────────────────────────────────────────────────
  private showOffenseMenu() {
    if (this.state.gameOver || this.animating || this.selectingPlay) return;
    this.selectingPlay = true;
    this.clearMenu();

    const W = this.scale.width, H = this.scale.height;
    const g = this.menuLayer; g.clear();
    const mH = 230, mY = H - mH - 8;
    const offTeam = this.state.possession === 'home' ? this.state.homeTeam : this.state.awayTeam;

    // Backdrop
    g.fillStyle(0x020208, 0.97); g.fillRoundedRect(8, mY, W - 16, mH, 14);
    g.lineStyle(2, offTeam.primaryColor, 0.4); g.strokeRoundedRect(8, mY, W - 16, mH, 14);
    g.lineStyle(3, offTeam.primaryColor, 0.6);
    g.beginPath(); g.moveTo(18, mY + 1); g.lineTo(W - 18, mY + 1); g.strokePath();

    const hdr = this.add.text(W / 2, mY + 16, '— SELECT YOUR PLAY —', {
      fontSize: '10px', fontFamily: 'system-ui, sans-serif', fontStyle: 'bold',
      color: '#ffffff55', letterSpacing: 4,
    }).setOrigin(0.5).setDepth(16);
    this.menuItems.push(hdr);

    const cols = 4, padX = 20, gap = 10;
    const avail = W - 16 - padX * 2;
    const cW = (avail - gap * (cols - 1)) / cols, cH = 140;
    const cY = mY + 36;

    OFFENSE_PLAYS.forEach((play, i) => {
      const cx = 8 + padX + i * (cW + gap) + cW / 2;
      const cy = cY + cH / 2;
      const typeColor = play.type === 'run' ? 0x2255aa : 0x225533;
      const borderColor = play.type === 'run' ? 0x4488ff : 0x44ff88;

      const bg = this.add.graphics().setDepth(16);
      this.menuItems.push(bg);

      const drawCard = (hover: boolean) => {
        bg.clear();
        bg.fillStyle(hover ? lighten(typeColor, 30) : typeColor, 1);
        bg.fillRoundedRect(-cW / 2, -cH / 2, cW, cH, 10);
        bg.lineStyle(hover ? 2.5 : 1.5, hover ? 0xffffff : borderColor, hover ? 0.7 : 0.5);
        bg.strokeRoundedRect(-cW / 2, -cH / 2, cW, cH, 10);
        if (hover) {
          bg.lineStyle(2, offTeam.primaryColor, 0.5);
          bg.strokeRoundedRect(-cW / 2 + 2, -cH / 2 + 2, cW - 4, cH - 4, 9);
        }
      };
      drawCard(false);
      bg.setPosition(cx, cy);
      bg.setInteractive(new Phaser.Geom.Rectangle(-cW / 2, -cH / 2, cW, cH), Phaser.Geom.Rectangle.Contains);
      bg.on('pointerover',  () => drawCard(true));
      bg.on('pointerout',   () => drawCard(false));
      bg.on('pointerdown',  () => {
        SFX.whistle();
        this.onOffensePlaySelected(play);
      });

      const emj = this.add.text(cx, cy - 35, play.emoji, { fontSize: '28px' }).setOrigin(0.5).setDepth(17);
      const nm  = this.add.text(cx, cy + 4,  play.name, {
        fontSize: '12px', fontFamily: 'system-ui, sans-serif', fontStyle: 'bold',
        color: play.type === 'run' ? '#88bbff' : '#88ffbb',
      }).setOrigin(0.5).setDepth(17);
      const sub = this.add.text(cx, cy + 24, play.subtitle, {
        fontSize: '10px', fontFamily: 'system-ui, sans-serif', color: 'rgba(255,255,255,0.4)',
      }).setOrigin(0.5).setDepth(17);
      const pct = this.add.text(cx, cy + 50, `${Math.round(play.successChance * 100)}% base`, {
        fontSize: '9px', fontFamily: 'system-ui, sans-serif', color: 'rgba(255,255,255,0.25)',
      }).setOrigin(0.5).setDepth(17);
      this.menuItems.push(emj, nm, sub, pct);
    });
  }

  private onOffensePlaySelected(play: OffensePlay) {
    this.pendingOffPlay = play;
    this.clearMenu();

    // Track play history
    this.state.offPlayHistory[play.id] = (this.state.offPlayHistory[play.id] ?? 0) + 1;

    // AI picks defense
    const defPlay = this.pickAIDefense();
    const mult = MATCHUP[play.id][defPlay.id];
    const verdict = matchupVerdict(mult);

    // Show reveal screen
    const W = this.scale.width, H = this.scale.height;
    const g = this.menuLayer; g.clear();
    const mY = H * 0.28;

    g.fillStyle(0x000000, 0.88); g.fillRect(0, 0, W, H);

    // Offense card
    const ox = W / 2 - 130, oy = H / 2 - 40;
    g.fillStyle(0x1a3a6a); g.fillRoundedRect(ox, oy, 110, 80, 10);
    g.lineStyle(2, 0x4488ff, 0.8); g.strokeRoundedRect(ox, oy, 110, 80, 10);
    const offLbl = this.add.text(ox + 55, oy + 14, '⚔️ OFFENSE', { fontSize: '8px', fontFamily: 'system-ui', color: '#88aaff' }).setOrigin(0.5).setDepth(20);
    const offNm  = this.add.text(ox + 55, oy + 40, `${play.emoji} ${play.name}`, { fontSize: '13px', fontFamily: 'system-ui', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5).setDepth(20);
    this.menuItems.push(offLbl, offNm);

    // VS
    const vsT = this.add.text(W / 2, H / 2 - 6, 'vs', { fontSize: '18px', fontFamily: 'system-ui', fontStyle: 'bold', color: '#ffffff44' }).setOrigin(0.5).setDepth(20);
    this.menuItems.push(vsT);

    // Defense card - delayed reveal
    this.time.delayedCall(500, () => {
      SFX.crowd(0.35);
      const dx = W / 2 + 20, dy = H / 2 - 40;
      g.fillStyle(0x3a1a1a); g.fillRoundedRect(dx, dy, 110, 80, 10);
      g.lineStyle(2, 0xff4444, 0.8); g.strokeRoundedRect(dx, dy, 110, 80, 10);
      const defLbl = this.add.text(dx + 55, dy + 14, '🛡 DEFENSE', { fontSize: '8px', fontFamily: 'system-ui', color: '#ffaaaa' }).setOrigin(0.5).setDepth(20);
      const defNm  = this.add.text(dx + 55, dy + 40, `${defPlay.emoji} ${defPlay.name}`, { fontSize: '13px', fontFamily: 'system-ui', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5).setDepth(20);
      this.menuItems.push(defLbl, defNm);

      // Verdict
      this.time.delayedCall(400, () => {
        g.fillStyle(verdict.color, 0.12);
        g.fillRoundedRect(W / 2 - 200, H / 2 + 50, 400, 44, 10);
        g.lineStyle(2, verdict.color, 0.5);
        g.strokeRoundedRect(W / 2 - 200, H / 2 + 50, 400, 44, 10);
        const vt = this.add.text(W / 2, H / 2 + 72, verdict.text, {
          fontSize: '14px', fontFamily: 'system-ui', fontStyle: 'bold',
          color: hexStr(verdict.color),
        }).setOrigin(0.5).setDepth(20);
        this.menuItems.push(vt);
        if (mult >= 2.0) SFX.bigPlay();
        else if (mult <= 0.08) SFX.sack();

        // Execute play after reveal
        this.time.delayedCall(700, () => {
          this.clearMenu();
          this.executePlay(play, defPlay, mult);
        });
      });
    });
  }

  // ── AI Offense (when AI has ball) ────────────────────────────────────────────
  private showAITurn() {
    const { state } = this;
    let candidates = OFFENSE_PLAYS.filter(p => p.type !== 'run' || state.yardsToGo < 8);
    if (state.down === 4) {
      const dist = state.possession === 'away' ? state.fieldPosition : 100 - state.fieldPosition;
      if (state.yardsToGo <= 2) candidates = [OFFENSE_PLAYS[0]]; // power run
      else if (dist <= 37)      candidates = [this.fakeSpecialPlay('field_goal')].filter(Boolean) as OffensePlay[];
      else                      candidates = [this.fakeSpecialPlay('punt')].filter(Boolean) as OffensePlay[];
    } else if (state.yardsToGo >= 10) {
      candidates = OFFENSE_PLAYS.filter(p => p.type === 'pass');
    }
    if (!candidates.length) candidates = OFFENSE_PLAYS;
    const play = candidates[Math.floor(Math.random() * candidates.length)];
    const defPlay = DEFENSE_PLAYS[Math.floor(Math.random() * DEFENSE_PLAYS.length)];
    const mult = MATCHUP[play.id]?.[defPlay.id] ?? 1.0;
    this.executePlay(play, defPlay, mult);
  }

  private fakeSpecialPlay(id: 'field_goal' | 'punt'): OffensePlay {
    return {
      id: 'power_run', name: id === 'field_goal' ? 'Field Goal' : 'Punt',
      emoji: id === 'field_goal' ? '🎯' : '🦵', subtitle: '',
      type: 'run', baseGain: 0, variance: 0, successChance: 1,
    };
  }

  // ── Defense pick AI ─────────────────────────────────────────────────────────
  private pickAIDefense(): DefensePlay {
    const hist = this.state.offPlayHistory;
    const sorted = (Object.entries(hist) as [OffensePlay['id'], number][]).sort((a, b) => b[1] - a[1]);
    const mostUsed = sorted[0]?.[0];
    if (mostUsed && Math.random() < 0.62) {
      if (mostUsed === 'power_run' || mostUsed === 'sweep') return DEFENSE_PLAYS[0]; // stack box
      if (mostUsed === 'bomb')       return DEFENSE_PLAYS[1]; // blitz
      if (mostUsed === 'quick_pass') return DEFENSE_PLAYS[2]; // man
    }
    return DEFENSE_PLAYS[Math.floor(Math.random() * DEFENSE_PLAYS.length)];
  }

  // ── Execute Play ──────────────────────────────────────────────────────────────
  private executePlay(play: OffensePlay, _defPlay: DefensePlay, mult: number) {
    if (this.animating || this.state.gameOver) return;
    this.animating = true; this.selectingPlay = false;

    const { state } = this;
    const offTeam = state.possession === 'home' ? state.homeTeam : state.awayTeam;
    const defTeam = state.possession === 'home' ? state.awayTeam : state.homeTeam;
    const dir = state.possession === 'home' ? 1 : -1;

    // Special plays (reuse name check)
    if (play.name === 'Field Goal') {
      const dist = (state.possession === 'home' ? 100 - state.fieldPosition : state.fieldPosition) + 17;
      const made = Math.random() < (dist <= 40 ? 0.95 : dist <= 50 ? 0.80 : 0.52);
      this.animateKick(made, () => {
        if (made) {
          if (state.possession === 'home') state.homeScore += 3; else state.awayScore += 3;
          SFX.fieldGoal();
          this.confetti(this.scale.width / 2, this.F.midY);
          this.afterPlay(`⚡ FIELD GOAL GOOD! +3`, true);
          this.resetAfterScore();
        } else {
          state.possession = state.possession === 'home' ? 'away' : 'home';
          state.fieldPosition = 20; state.down = 1; state.yardsToGo = 10;
          this.afterPlay('✗ Field Goal No Good', true);
        }
      });
      return;
    }
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

    // Ratings modifiers
    const offBonus  = (offTeam.offenseRating - 50) / 100;
    const defPenalty = (defTeam.defenseRating - 50) / 100;
    const baseChance = clamp(play.successChance + offBonus - defPenalty * 0.5, 0.05, 0.97);
    const success = Math.random() < baseChance;

    // Turnover
    const turnoverChance = !success ? (play.type === 'pass' ? 0.22 : 0.08) * (1 / Math.max(mult, 0.5)) : 0;
    if (Math.random() < turnoverChance) {
      const tType = play.type === 'pass' ? '🚨 INTERCEPTION!' : '💀 FUMBLE!';
      SFX.tackle(); SFX.crowd(0.9);
      this.cameras.main.shake(180, 0.012);
      this.burst(this.ballContainer.x, this.ballContainer.y, defTeam.primaryColor, 20);
      this.state.momentum = clamp(state.possession === 'home' ? state.momentum - 20 : state.momentum + 20, 0, 100);
      this.consecutiveFirstDowns = 0;
      this.time.delayedCall(200, () => {
        state.possession = state.possession === 'home' ? 'away' : 'home';
        state.fieldPosition = clamp(100 - state.fieldPosition, 5, 90);
        state.down = 1; state.yardsToGo = 10;
        this.animating = false;
        this.afterPlay(`${tType} ${defTeam.abbreviation} ball!`, true);
      });
      return;
    }

    let yards = 0;
    if (success) {
      const speedBonus = (offTeam.speedRating - 50) / 50;
      const isBreakaway = play.id === 'sweep' || play.id === 'bomb';
      const spdMult = isBreakaway ? (1 + speedBonus * 0.4) : 1;
      yards = Math.max(0, Math.round(
        (play.baseGain + (Math.random() - 0.25) * play.variance + offBonus * 4) * mult * spdMult,
      ));
    } else {
      yards = play.type === 'pass' ? 0 : -(Math.floor(Math.random() * 4) + 1);
    }

    const newPos = clamp(state.fieldPosition + yards * dir, 0, 100);
    const gainPx = this.yd2px(newPos) - this.yd2px(state.fieldPosition);

    const onDone = () => {
      state.fieldPosition = newPos;
      let result = '';

      // Touchdown
      if ((state.possession === 'home' && state.fieldPosition >= 100) ||
          (state.possession === 'away' && state.fieldPosition <= 0)) {
        if (state.possession === 'home') state.homeScore += 7; else state.awayScore += 7;
        SFX.touchdown();
        this.state.momentum = clamp(state.possession === 'home' ? state.momentum + 25 : state.momentum - 25, 0, 100);
        this.confetti(this.scale.width / 2, this.F.midY - 20);
        this.confetti(this.scale.width / 3, this.F.midY + 10);
        this.confetti(this.scale.width * 2 / 3, this.F.midY - 30);
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
        this.afterPlay('⚡ SAFETY! +2', true);
        return;
      }

      // Down/distance
      const yStr = yards > 0 ? `+${yards}` : `${yards}`;
      state.yardsToGo -= yards * dir;

      if (state.yardsToGo <= 0) {
        state.down = 1; state.yardsToGo = 10;
        this.consecutiveFirstDowns++;
        this.state.momentum = clamp(state.possession === 'home' ? state.momentum + 6 : state.momentum - 6, 0, 100);
        if (yards >= 20) {
          result = `🔥 BIG PLAY! ${play.name} — ${yStr} yds  1ST DOWN!`;
          SFX.bigPlay();
        } else {
          result = `${play.name} — ${yStr} yds  1ST DOWN!`;
        }
        if (this.consecutiveFirstDowns >= 3) {
          this.showCombo(`🔥 ON FIRE! ${this.consecutiveFirstDowns} straight first downs!`);
        }
      } else if (!success && play.type === 'pass') {
        result = `✗ Incomplete — ${play.name}`;
        SFX.incomplete();
        this.consecutiveFirstDowns = 0;
      } else {
        state.down++;
        this.consecutiveFirstDowns = 0;
        if (state.down > 4) {
          state.possession = state.possession === 'home' ? 'away' : 'home';
          state.fieldPosition = clamp(100 - state.fieldPosition, 5, 95);
          state.down = 1; state.yardsToGo = 10;
          result = `${play.name} — ${yStr} yds  TURNOVER ON DOWNS`;
        } else {
          result = `${play.name} — ${yStr} yds`;
        }
      }

      // Clock
      state.timeLeft = Math.max(0, state.timeLeft - (18 + Math.floor(Math.random() * 22)));
      if (state.timeLeft === 0) {
        state.quarter++;
        if (state.quarter > 4) {
          if (state.homeScore !== state.awayScore) state.gameOver = true;
          else { state.timeLeft = 600; }
        } else {
          state.timeLeft = 900;
          if (state.quarter === 3) {
            state.possession = 'away'; state.fieldPosition = 20; state.down = 1; state.yardsToGo = 10;
            result += '\n— HALF —';
          }
        }
      }
      this.afterPlay(result, !state.gameOver);
    };

    if (play.type === 'run') this.animateRun(gainPx, success, dir, yards, onDone);
    else                     this.animatePass(gainPx, success, dir, play.id === 'bomb', onDone);
  }

  // ── Run Animation ─────────────────────────────────────────────────────────────
  private animateRun(gainPx: number, success: boolean, dir: number, yards: number, onDone: () => void) {
    const qb = this.offPlayers[5], rb = this.offPlayers[6];
    const ol = this.offPlayers.slice(0, 5), def = this.defPlayers;
    const carrier = rb;
    const targetX = carrier.container.x + gainPx;

    // OL surge
    ol.forEach((p, i) => {
      drawSprite(p.gfx, p.team.primaryColor, p.team.secondaryColor, p.facing, p.role, 1, true, p.isStar);
      this.tweens.add({ targets: p.container, x: p.container.x + 22 * dir, duration: 180, ease: 'Power2', delay: i * 30 });
    });
    // DL pushed back
    def.slice(0, 4).forEach(p => {
      this.tweens.add({ targets: p.container, x: p.container.x + 12 * dir, duration: 220, ease: 'Power1', delay: 80 });
    });
    // QB hands off
    this.tweens.add({ targets: qb.container, x: qb.container.x + 10 * dir, duration: 180, ease: 'Power1' });

    // Ball + carrier run
    this.tweens.add({ targets: this.ballContainer, x: targetX, y: this.F.midY - 20, duration: 440, ease: 'Power2', delay: 120 });
    this.tweens.add({
      targets: carrier.container, x: targetX, duration: 440, ease: 'Power2', delay: 120,
      onUpdate: () => {
        const f = Math.floor(this.walkFrame) % 2;
        drawSprite(carrier.gfx, carrier.team.primaryColor, carrier.team.secondaryColor, carrier.facing, carrier.role, f, true, carrier.isStar);
        if (yards >= 10 && Math.random() < 0.3) this.speedTrail(carrier.container, carrier.team.primaryColor);
      },
    });

    // Defenders converge
    const convergers = success ? def.slice(4, 7) : def.slice(0, 5);
    convergers.forEach((d, i) => {
      this.tweens.add({ targets: d.container, x: targetX + (Math.random() - 0.5) * 12, y: carrier.container.y + (Math.random() - 0.5) * 12, duration: 200, ease: 'Power2', delay: 550 + i * 25 });
    });

    // Impact
    this.time.delayedCall(780, () => {
      SFX.tackle();
      this.cameras.main.shake(yards >= 10 ? 160 : 100, yards >= 10 ? 0.010 : 0.006);
      this.burst(targetX, carrier.container.y, success ? 0xffdd00 : 0xff4444, success ? 10 : 6);
      const flash = this.add.graphics().setDepth(50);
      flash.fillStyle(0xffffff, 0.10); flash.fillRect(0, 0, this.scale.width, this.scale.height);
      this.tweens.add({ targets: flash, alpha: 0, duration: 140, onComplete: () => flash.destroy() });
      onDone();
    });
  }

  // ── Pass Animation ────────────────────────────────────────────────────────────
  private animatePass(gainPx: number, success: boolean, dir: number, isDeep: boolean, onDone: () => void) {
    const qb = this.offPlayers[5];
    const receiver = this.offPlayers[isDeep ? 7 : 9]; // deep = WR1, short = slot
    const qbDropX = qb.container.x - 30 * dir;

    // QB drop
    this.tweens.add({ targets: qb.container, x: qbDropX, duration: 250, ease: 'Power1' });
    // LBs/CBs fan out
    this.defPlayers.slice(4, 9).forEach((d, i) => {
      this.tweens.add({ targets: d.container, x: d.container.x + 14 * dir, y: d.container.y + (i - 2) * 20, duration: 320, ease: 'Sine.easeOut', delay: i * 35 });
    });
    // Receivers run routes
    this.offPlayers.slice(7).forEach((wr, i) => {
      const isTarget = wr === receiver;
      const routeX = isTarget && success ? receiver.container.x + gainPx : wr.container.x + gainPx * 0.3 * dir;
      const routeY = isTarget && success ? wr.container.y + (isDeep ? 0 : (i % 2 === 0 ? -12 : 12)) : wr.container.y + (i % 2 === 0 ? -20 : 20);
      this.tweens.add({
        targets: wr.container, x: routeX, y: routeY,
        duration: isDeep ? 600 : 400, ease: 'Sine.easeOut', delay: 60 + i * 25,
        onUpdate: () => drawSprite(wr.gfx, wr.team.primaryColor, wr.team.secondaryColor, wr.facing, wr.role, Math.floor(this.walkFrame) % 2, true, wr.isStar),
      });
    });

    // Ball throw
    const startBx = qbDropX, startBy = this.F.midY - 20;
    const catchX = receiver.container.x + gainPx;
    const catchY = receiver.container.y + (isDeep ? 0 : -12);
    const peak = startBy - (isDeep ? 80 : 50);
    this.ballContainer.setPosition(startBx, startBy);

    if (success) {
      this.tweens.add({ targets: this.ballContainer, x: catchX, y: peak, duration: isDeep ? 320 : 210, ease: 'Sine.easeOut', delay: 280 });
      this.tweens.add({ targets: this.ballContainer, x: catchX, y: catchY, duration: isDeep ? 260 : 170, ease: 'Sine.easeIn', delay: 280 + (isDeep ? 320 : 210) });

      this.time.delayedCall(280 + (isDeep ? 320 : 210) + (isDeep ? 260 : 170), () => {
        SFX.catch();
        this.cameras.main.shake(80, 0.005);
        this.burst(catchX, catchY, 0x44ff88, isDeep ? 18 : 10);
        if (isDeep) this.speedTrail(receiver.container, receiver.team.primaryColor);
        this.defPlayers.slice(7, 10).forEach(d => {
          this.tweens.add({ targets: d.container, x: catchX, y: catchY, duration: 230, ease: 'Power2' });
        });
        this.time.delayedCall(320, () => { SFX.tackle(); this.cameras.main.shake(90, 0.007); onDone(); });
      });
    } else {
      this.tweens.add({ targets: this.ballContainer, x: receiver.container.x + gainPx * 0.5 * dir, y: peak, duration: 220, ease: 'Sine.easeOut', delay: 280 });
      this.tweens.add({ targets: this.ballContainer, y: this.F.midY + 25, duration: 200, ease: 'Bounce.easeOut', delay: 500 });
      this.time.delayedCall(900, onDone);
    }
  }

  // ── Kick / Punt ───────────────────────────────────────────────────────────────
  private animateKick(made: boolean, onDone: () => void) {
    const kicker = this.offPlayers[6];
    const goalX = this.state.possession === 'home' ? this.F.left + this.F.w * 0.95 : this.F.left + this.F.w * 0.05;
    const peak = this.F.top - 70;
    this.tweens.add({ targets: kicker.container, x: this.ballContainer.x, duration: 280, ease: 'Power2' });
    this.tweens.add({ targets: this.ballContainer, x: goalX, y: peak, duration: 420, ease: 'Sine.easeOut', delay: 280 });
    this.tweens.add({ targets: this.ballContainer, y: made ? peak + 20 : this.F.midY + 30, duration: 280, ease: made ? 'Linear' : 'Bounce.easeOut', delay: 700 });
    this.time.delayedCall(1200, () => { if (made) { SFX.crowd(0.75); this.cameras.main.shake(80, 0.006); } onDone(); });
  }

  private animatePunt(totalPx: number, onDone: () => void) {
    const px = this.ballContainer.x + totalPx * (this.F.w / 100);
    this.tweens.add({ targets: this.ballContainer, x: px, y: this.F.top - 35, duration: 470, ease: 'Sine.easeOut' });
    this.tweens.add({ targets: this.ballContainer, y: this.F.midY - 20, duration: 320, ease: 'Bounce.easeOut', delay: 470 });
    this.time.delayedCall(970, onDone);
  }

  // ── After Play ────────────────────────────────────────────────────────────────
  private afterPlay(text: string, continueGame: boolean) {
    this.tweens.killTweensOf(this.resultBanner);
    this.resultBanner.setText(text).setAlpha(1).setScale(1.1);
    this.tweens.add({ targets: this.resultBanner, scaleX: 1, scaleY: 1, duration: 150, ease: 'Back.easeOut' });
    this.tweens.add({
      targets: this.resultBanner, alpha: 0, delay: 2000, duration: 300,
      onComplete: () => {
        this.animating = false;
        if (this.state.gameOver) { this.showGameOver(); return; }
        if (!continueGame) return;
        this.drawField(); this.drawScoreboard(); this.drawMomentumBar(); this.spawnFormation();
        if (this.state.possession === 'home') this.time.delayedCall(300, () => this.showOffenseMenu());
        else this.aiTimer = 900;
      },
    });
  }

  private showCombo(text: string) {
    this.tweens.killTweensOf(this.comboText);
    this.comboText.setText(text).setAlpha(1);
    this.tweens.add({ targets: this.comboText, alpha: 0, delay: 2200, duration: 400 });
  }

  private resetAfterScore() {
    this.state.possession = this.state.possession === 'home' ? 'away' : 'home';
    this.state.fieldPosition = 20; this.state.down = 1; this.state.yardsToGo = 10;
    this.consecutiveFirstDowns = 0;
  }

  // ── Game Over ─────────────────────────────────────────────────────────────────
  private showGameOver() {
    const W = this.scale.width, H = this.scale.height;
    const { state } = this;
    const homeWins = state.homeScore > state.awayScore;
    const winner = homeWins ? state.homeTeam : state.awayTeam;

    this.game.events.emit('gameOver', {
      homeTeamId: state.homeTeam.id, homeTeamName: `${state.homeTeam.city} ${state.homeTeam.name}`,
      homeScore: state.homeScore,    awayTeamId: state.awayTeam.id,
      awayTeamName: `${state.awayTeam.city} ${state.awayTeam.name}`,
      awayScore: state.awayScore,    league: state.league,
      winnerId: winner.id,           winnerName: `${winner.city} ${winner.name}`,
      winnerColor: winner.primaryColor,
    });

    const ov = this.add.graphics().setDepth(30);
    ov.fillStyle(0x000000, 0.90); ov.fillRect(0, 0, W, H);

    const pW = 420, pH = 240;
    ov.fillStyle(winner.primaryColor, 0.15); ov.fillRoundedRect(W/2-pW/2, H/2-pH/2, pW, pH, 18);
    ov.fillStyle(0x08080f, 0.95); ov.fillRoundedRect(W/2-pW/2+2, H/2-pH/2+2, pW-4, pH-4, 17);
    ov.lineStyle(3, winner.primaryColor, 0.9); ov.strokeRoundedRect(W/2-pW/2, H/2-pH/2, pW, pH, 18);

    this.add.text(W/2, H/2-95, 'FINAL', { fontSize: '10px', fontFamily: 'system-ui', color: '#ffffff33', letterSpacing: 6 }).setOrigin(0.5).setDepth(31);
    this.add.text(W/2, H/2-62, `${winner.city.toUpperCase()} WIN`, {
      fontSize: '42px', fontFamily: 'system-ui', fontStyle: 'bold',
      color: hexStr(winner.primaryColor), stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(31);
    this.add.text(W/2, H/2-14, `${state.homeTeam.abbreviation}  ${state.homeScore}  —  ${state.awayScore}  ${state.awayTeam.abbreviation}`, {
      fontSize: '26px', fontFamily: 'system-ui', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5).setDepth(31);
    this.add.text(W/2, H/2+22, `${state.homeTeam.city} ${state.homeTeam.name} vs ${state.awayTeam.city} ${state.awayTeam.name}`, {
      fontSize: '11px', fontFamily: 'system-ui', color: '#ffffff44',
    }).setOrigin(0.5).setDepth(31);

    const mkBtn = (x: number, label: string, color: string, bg: string, cb: () => void) => {
      this.add.text(x, H/2+78, label, {
        fontSize: '14px', fontFamily: 'system-ui', fontStyle: 'bold', color,
        backgroundColor: bg, padding: { x: 22, y: 12 },
      }).setOrigin(0.5).setDepth(31).setInteractive({ useHandCursor: true }).on('pointerdown', cb);
    };
    mkBtn(W/2-90, 'PLAY AGAIN',   '#fff', '#1e3a5f', () => this.scene.restart({ homeTeam: state.homeTeam, awayTeam: state.awayTeam, league: state.league }));
    mkBtn(W/2+90, 'CHANGE TEAMS', '#aaa', '#111122', () => this.game.events.emit('navigate', '/game/select'));
  }

  // ── Menu cleanup ──────────────────────────────────────────────────────────────
  private clearMenu() {
    this.menuLayer.clear();
    this.menuItems.forEach(item => item.destroy());
    this.menuItems = [];
  }

  // ── Update loop ───────────────────────────────────────────────────────────────
  update(_t: number, delta: number) {
    if (this.aiTimer > 0 && !this.animating && !this.selectingPlay && !this.state.gameOver) {
      this.aiTimer -= delta;
      if (this.aiTimer <= 0) { this.aiTimer = 0; this.showAITurn(); }
    }
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export interface GameOverData {
  homeTeamId: string; homeTeamName: string; homeScore: number;
  awayTeamId: string; awayTeamName: string; awayScore: number;
  league: 'nfl' | 'ncaa'; winnerId: string; winnerName: string; winnerColor: number;
}

export function createFootballGame(
  container: HTMLElement, homeTeam: GameTeam, awayTeam: GameTeam, league: 'nfl' | 'ncaa',
  onNavigate: (path: string) => void, onGameOver?: (data: GameOverData) => void,
): Phaser.Game {
  _gameData = { homeTeam, awayTeam, league };
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: container.clientWidth  || 960,
    height: container.clientHeight || 560,
    backgroundColor: '#050510',
    parent: container,
    scene: [GameScene],
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true, pixelArt: false },
  });
  game.events.on('navigate', (path: string) => onNavigate(path));
  if (onGameOver) game.events.on('gameOver', (data: GameOverData) => onGameOver(data));
  return game;
}
