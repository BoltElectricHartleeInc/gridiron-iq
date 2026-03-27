import Phaser from "phaser";
import { NFL_PLAYBOOK, type PlayDef } from "./Playbook";
import { BallPhysics } from "./BallPhysics";
import { StatsTracker } from "./StatsTracker";
import { PlayerController, type ControlledPlayer, type Defender } from "./PlayerController";
import { AIEngine, type DefAI } from "./AIEngine";
import { WeatherSystem, type WeatherType } from "./WeatherSystem";
import { BlockingEngine, type Blocker, type Rusher } from "./BlockingEngine";
import { PenaltySystem } from "./PenaltySystem";

// ── Play phase state machine ──────────────────────────────────────────────────
export enum PlayPhase {
  FORMATION   = "FORMATION",
  PLAY_ART    = "PLAY_ART",
  PRE_SNAP    = "PRE_SNAP",
  SNAP        = "SNAP",
  LIVE_PLAY   = "LIVE_PLAY",
  WHISTLE     = "WHISTLE",
  RESULT      = "RESULT",
  NEXT_PLAY   = "NEXT_PLAY",
  KICKOFF     = "KICKOFF",
  KICKOFF_RET = "KICKOFF_RET",
  PUNT        = "PUNT",
  FG_ATTEMPT  = "FG_ATTEMPT",
}

type LiveBoxPayload = {
  homeTeam: string; awayTeam: string;
  homeScore: number; awayScore: number;
  quarter: number; clock: string; downDistance: string;
  home: { passYds: number; rushYds: number; totalYds: number; firstDowns: number; turnovers: number; thirdDown: string; top: string };
  away: { passYds: number; rushYds: number; totalYds: number; firstDowns: number; turnovers: number; thirdDown: string; top: string };
};

interface GameOptions {
  mode?: "quick" | string;
  league?: "nfl" | "ncaa";
  homeTeamId?: string;
  awayTeamId?: string;
  difficulty?: string;
  twoPlayers?: boolean;
  weatherRandom?: boolean;
}

interface ReceiverIcon {
  id: number;
  sprite: Phaser.GameObjects.Container;
  label: Phaser.GameObjects.Text;
}

interface RouteDraw {
  playerId: number;
  graphics: Phaser.GameObjects.Graphics;
  dots: Phaser.GameObjects.Arc[];
}

const FIELD = { left: 80, right: 1200, top: 80, bottom: 640, midY: 360 };
const PLAYCLOCK_SECONDS = 35;
const PRE_SNAP_SECONDS = 8;

export default class FootballGame extends Phaser.Scene {
  // Core systems
  private ballPhysics!: BallPhysics;
  private stats!: StatsTracker;
  private ai!: AIEngine;
  private weather!: WeatherSystem;
  private blocking!: BlockingEngine;
  private penalties!: PenaltySystem;

  // Game state
  private options: GameOptions = {};
  private offenseTeamId = "HOME";
  private defenseTeamId = "AWAY";
  private homeScore = 0;
  private awayScore = 0;
  private quarter = 1;
  private gameClockMs = 15 * 60 * 1000;
  private playClock = PLAYCLOCK_SECONDS;
  private down = 1;
  private distance = 10;
  private yardLine = 25;
  private possession: "home" | "away" = "home";

  // State machine
  private phase: PlayPhase = PlayPhase.FORMATION;
  private preSnapRemaining = PRE_SNAP_SECONDS;
  private lastStatsEmitAt = 0;
  private whistleTimer = 0;

  // Special teams state
  private fgPowerMeter = 0;
  private fgMeterDir = 1;
  private fgPowerBar?: Phaser.GameObjects.Rectangle;
  private fgPowerBarBg?: Phaser.GameObjects.Rectangle;
  private fgPowerLocked = false;
  private kickReturnStartX = 0;
  private kickReturnStartY = 0;

  // Pass play
  private passWindowMs = 3500;
  private qbPressureTimer = 0;
  private passerUnderPressure = false;
  private throwHoldStart = 0;
  private waitingForThrow = false;
  private selectedReceiver = 1;

  // Input
  private keys!: {
    one: Phaser.Input.Keyboard.Key;
    two: Phaser.Input.Keyboard.Key;
    three: Phaser.Input.Keyboard.Key;
    four: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    h: Phaser.Input.Keyboard.Key;
    tab: Phaser.Input.Keyboard.Key;
    t: Phaser.Input.Keyboard.Key;
    f: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    tilde: Phaser.Input.Keyboard.Key;
    p: Phaser.Input.Keyboard.Key;
  };

  // Objects
  private uiLayer!: Phaser.GameObjects.Container;
  private scoreboardText!: Phaser.GameObjects.Text;
  private playClockText!: Phaser.GameObjects.Text;
  private preSnapToolbar?: Phaser.GameObjects.Container;
  private resultBanner?: Phaser.GameObjects.Text;
  private fieldGfx!: Phaser.GameObjects.Graphics;

  // Players
  private offensePlayers: Phaser.GameObjects.Container[] = [];
  private defensePlayers: Phaser.GameObjects.Container[] = [];
  private carrier!: ControlledPlayer;
  private defenders: Defender[] = [];
  private defAIs: DefAI[] = [];
  private controller!: PlayerController;
  private qb!: Phaser.GameObjects.Container;
  private olPlayers: Phaser.GameObjects.Container[] = [];
  private dlPlayers: Phaser.GameObjects.Container[] = [];

  // Pass receivers
  private receiverIcons: ReceiverIcon[] = [];
  private routeDraws: RouteDraw[] = [];
  private activePlay: PlayDef | null = null;
  private hotRouteReceiverId: number | null = null;

  // Visual FX
  private crowdWave?: Phaser.GameObjects.Graphics;
  private blurOverlay?: Phaser.GameObjects.Rectangle;
  private tackleFlash?: Phaser.GameObjects.Rectangle;
  private inCanvasBox?: Phaser.GameObjects.Container;

  // Debug overlay
  private debugOverlay?: Phaser.GameObjects.Container;
  private debugVisible = false;
  private debugTexts: Phaser.GameObjects.Text[] = [];

  constructor() { super("FootballGame"); }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  create(): void {
    this.options = (this.registry.get("gameOptions") as GameOptions | undefined) ?? {};
    this.offenseTeamId = (this.options.homeTeamId ?? "HOME").toUpperCase();
    this.defenseTeamId = (this.options.awayTeamId ?? "AWAY").toUpperCase();
    this.cameras.main.setBackgroundColor(0x113311);

    this.keys = this.input.keyboard!.addKeys({
      one: "ONE", two: "TWO", three: "THREE", four: "FOUR",
      space: "SPACE", h: "H", tab: "TAB", t: "T", f: "F", s: "S",
      tilde: "BACKTICK", p: "P",
    }) as unknown as typeof this.keys;

    this.ballPhysics = new BallPhysics(this);
    this.stats = new StatsTracker(this.offenseTeamId, this.defenseTeamId);
    this.ai = new AIEngine();
    this.blocking = new BlockingEngine(this);
    this.penalties = new PenaltySystem();
    const weatherType = this.pickWeather();
    this.weather = new WeatherSystem(this, weatherType);
    this.weather.create();

    this.createField();
    this.createUi();
    this.createTeams();
    this.setupInputEvents();
    this.setupGlobalEvents();
    this.phase = PlayPhase.KICKOFF;
    this.startKickoff();
    this.emitLiveStats();
  }

  update(time: number, delta: number): void {
    this.weather.update();
    this.cleanupTransient();

    // Clock management by phase
    switch (this.phase) {
      case PlayPhase.LIVE_PLAY:
        this.gameClockMs = Math.max(0, this.gameClockMs - delta);
        this.playClock = Math.max(0, this.playClock - delta / 1000);
        if (this.playClock <= 0) this.applyPenalty("delay_of_game");
        break;
      case PlayPhase.PRE_SNAP:
        this.preSnapRemaining = Math.max(0, this.preSnapRemaining - delta / 1000);
        this.playClock = Math.max(0, this.playClock - delta / 1000);
        if (this.preSnapRemaining <= 0 || this.playClock <= 0) this.snapBall();
        // Offsides check
        this.checkOffsidesPreSnap();
        break;
      case PlayPhase.WHISTLE:
        this.whistleTimer -= delta;
        if (this.whistleTimer <= 0) this.transitionToNextPlay();
        break;
      case PlayPhase.FG_ATTEMPT:
        this.updateFgMeter(delta);
        break;
    }

    // Live play updates
    if (this.phase === PlayPhase.LIVE_PLAY) {
      this.blocking.update(delta);

      if (this.activePlay?.isRun) {
        this.controller.update(delta);
        this.updateRunDefenders(delta);
        const result = this.controller.updateDefenders(this.defenders);
        if (result.tackled) this.handleTackle();
        this.applyBurstBlur();
      }

      if (this.waitingForThrow && this.activePlay && !this.activePlay.isRun) {
        this.passWindowMs -= delta;
        this.updateReceiverOpenStates();
        this.updatePassRush(delta);
        if (this.passWindowMs <= 0) {
          this.waitingForThrow = false;
          this.startQbScramble();
        }
      }
    }

    if (this.phase === PlayPhase.KICKOFF_RET) {
      this.controller.update(delta);
      const result = this.controller.updateDefenders(this.defenders);
      if (result.tackled) {
        const returnYards = Math.round((this.carrier.x - this.kickReturnStartX) / 5.6);
        this.yardLine = Phaser.Math.Clamp(20 + Math.max(0, returnYards), 1, 99);
        this.down = 1; this.distance = 10;
        this.endPlay(`Return +${Math.max(0, returnYards)}`, "normal");
      }
    }

    // Scoreboard
    this.updateScoreboardText();
    if (time - this.lastStatsEmitAt > 1200) {
      this.emitLiveStats();
      this.lastStatsEmitAt = time;
    }
    if (this.gameClockMs <= 0 && this.phase === PlayPhase.LIVE_PLAY) {
      this.handleQuarterEnd();
    }

    // Debug overlay
    if (this.debugVisible) this.updateDebugOverlay();
  }

  // ── Scene setup ───────────────────────────────────────────────────────────

  private createField(): void {
    this.fieldGfx = this.add.graphics();
    this.redrawField();
  }

  private redrawField(): void {
    this.fieldGfx.clear();
    this.fieldGfx.fillStyle(0x2f8f2f, 1);
    this.fieldGfx.fillRect(0, 0, 1280, 720);
    this.fieldGfx.fillStyle(0x237523, 1);
    this.fieldGfx.fillRect(FIELD.left, FIELD.top, FIELD.right - FIELD.left, FIELD.bottom - FIELD.top);
    this.fieldGfx.lineStyle(2, 0xffffff, 0.35);
    for (let x = FIELD.left; x <= FIELD.right; x += 56) {
      this.fieldGfx.lineBetween(x, FIELD.top, x, FIELD.bottom);
    }
    this.fieldGfx.lineStyle(3, 0xffffff, 0.8);
    this.fieldGfx.strokeRect(FIELD.left, FIELD.top, FIELD.right - FIELD.left, FIELD.bottom - FIELD.top);
    const losX = this.yardToX(this.yardLine);
    this.fieldGfx.lineStyle(3, 0x00d9ff, 0.9);
    this.fieldGfx.lineBetween(losX, FIELD.top, losX, FIELD.bottom);
    const firstX = this.yardToX(this.yardLine + this.distance);
    this.fieldGfx.lineStyle(3, 0xffdd00, 0.9);
    this.fieldGfx.lineBetween(firstX, FIELD.top, firstX, FIELD.bottom);
  }

  private createUi(): void {
    this.uiLayer = this.add.container(0, 0).setDepth(50);
    const topBar = this.add.rectangle(640, 26, 1240, 44, 0x0b1220, 0.92).setScrollFactor(0);
    this.scoreboardText = this.add.text(24, 12, "", { color: "#ffffff", fontSize: "16px", fontFamily: "system-ui" }).setScrollFactor(0);
    this.playClockText = this.add.text(980, 12, "", { color: "#ffcc00", fontSize: "16px", fontFamily: "system-ui" }).setScrollFactor(0);
    this.uiLayer.add([topBar, this.scoreboardText, this.playClockText]);
    this.blurOverlay = this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0).setDepth(45).setScrollFactor(0);
    this.tackleFlash = this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0).setDepth(46).setScrollFactor(0);
    this.crowdWave = this.add.graphics().setDepth(5);
    this.drawCrowdBand();
  }

  private drawCrowdBand(): void {
    if (!this.crowdWave) return;
    this.crowdWave.clear();
    this.crowdWave.fillStyle(0x1f2937, 1);
    this.crowdWave.fillRect(0, 0, 1280, 70);
    this.crowdWave.fillRect(0, 650, 1280, 70);
  }

  private createTeams(): void {
    this.offensePlayers.forEach(p => p.destroy());
    this.defensePlayers.forEach(p => p.destroy());
    this.offensePlayers = [];
    this.defensePlayers = [];
    this.defenders = [];
    this.defAIs = [];
    this.olPlayers = [];
    this.dlPlayers = [];
    this.receiverIcons.forEach(r => { r.sprite.destroy(); r.label.destroy(); });
    this.receiverIcons = [];

    const losX = this.yardToX(this.yardLine);

    // QB
    this.qb = this.makePlayer(losX - 18, FIELD.midY, 0x1e3a8a, "QB");
    this.offensePlayers.push(this.qb);

    // 4 receivers
    const wrY = [FIELD.midY - 120, FIELD.midY - 50, FIELD.midY + 50, FIELD.midY + 120];
    for (let i = 0; i < 4; i++) {
      const wr = this.makePlayer(losX - 30, wrY[i], 0x1e3a8a, `WR${i + 1}`);
      this.offensePlayers.push(wr);
    }

    // RB
    const rb = this.makePlayer(losX - 42, FIELD.midY + 20, 0x1e3a8a, "HB");
    this.offensePlayers.push(rb);

    // O-line (5 blockers)
    for (let i = -2; i <= 2; i++) {
      const ol = this.makePlayer(losX - 6, FIELD.midY + i * 18, 0x1d4ed8, `OL${i + 3}`) as Blocker;
      ol.blockRating = 76 + Math.abs(i) * 2;
      ol.blockTarget = null;
      ol.engaged = false;
      ol.engageTimer = 0;
      this.offensePlayers.push(ol);
      this.olPlayers.push(ol);
    }

    // Defense — 4 DL (2 contain), 3 LB, 4 DB
    const defLayout = [
      // DL
      { x: losX + 10, y: FIELD.midY - 36, label: "DL1", role: "DL" as const, contain: true  },
      { x: losX + 10, y: FIELD.midY - 12, label: "DL2", role: "DL" as const, contain: false },
      { x: losX + 10, y: FIELD.midY + 12, label: "DL3", role: "DL" as const, contain: false },
      { x: losX + 10, y: FIELD.midY + 36, label: "DL4", role: "DL" as const, contain: true  },
      // LB
      { x: losX + 44, y: FIELD.midY - 50, label: "LB1", role: "LB" as const, contain: false },
      { x: losX + 44, y: FIELD.midY,      label: "LB2", role: "LB" as const, contain: false },
      { x: losX + 44, y: FIELD.midY + 50, label: "LB3", role: "LB" as const, contain: false },
      // CBs / Safeties
      { x: losX + 30, y: FIELD.midY - 100, label: "CB1", role: "CB" as const, contain: false },
      { x: losX + 30, y: FIELD.midY + 100, label: "CB2", role: "CB" as const, contain: false },
      { x: losX + 80, y: FIELD.midY - 60,  label: "S1",  role: "S"  as const, contain: false },
      { x: losX + 80, y: FIELD.midY + 60,  label: "S2",  role: "S"  as const, contain: false },
    ];

    defLayout.forEach((d, i) => {
      const def = this.makePlayer(d.x, d.y, 0x991b1b, d.label) as Defender;
      def.tackleRating = 72 + (i % 6) * 4;
      def.speedRating = 74 + (i % 5) * 4;
      def.blocked = false;
      def.velX = 0;
      def.velY = 0;
      this.defensePlayers.push(def);
      this.defenders.push(def);

      // DefAI companion
      this.defAIs.push({
        x: d.x, y: d.y,
        speedRating: def.speedRating,
        tackleRating: def.tackleRating,
        role: d.role,
        isContain: d.contain,
        zoneX: d.x + 40,
        zoneY: d.y,
        inPursuit: d.role === "DL" || d.role === "LB",
        velX: 0,
        velY: 0,
      });

      // DL go into blocking engine as rushers
      if (d.role === "DL") {
        const rusher = def as unknown as Rusher;
        rusher.rushRating = 74 + (i % 4) * 5;
        rusher.shedTimer = 0;
        rusher.blockedBy = null;
        this.dlPlayers.push(def);
      }
    });

    // Register OL/DL with blocking engine
    this.blocking.reset();
    this.blocking.register(
      this.olPlayers as unknown as Blocker[],
      this.dlPlayers as unknown as Rusher[],
    );

    // Set carrier to QB by default
    this.carrier = this.qb as ControlledPlayer;
    this.carrier.speedRating = 86;
    this.carrier.strengthRating = 74;
    this.carrier.btkRating = 76;
    this.carrier.stamina = 100;
    this.carrier.velX = 0;
    this.carrier.velY = 0;
    this.controller = new PlayerController(this, this.carrier);
    this.createReceiverIcons();
  }

  private makePlayer(x: number, y: number, color: number, label: string): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const body = this.add.rectangle(0, 0, 18, 18, color).setStrokeStyle(1, 0xffffff, 0.4);
    const txt = this.add.text(-7, -6, label.slice(0, 2), { color: "#ffffff", fontSize: "8px", fontFamily: "system-ui" });
    c.add([body, txt]);
    c.setDepth(20);
    return c;
  }

  private createReceiverIcons(): void {
    for (let i = 1; i <= 4; i++) {
      const wr = this.offensePlayers[i];
      const bubble = this.add.container(wr.x, wr.y - 24).setDepth(24)
        .setInteractive(new Phaser.Geom.Circle(0, 0, 12), Phaser.Geom.Circle.Contains);
      const circle = this.add.circle(0, 0, 11, 0x00ff66, 0.8).setStrokeStyle(1, 0xffffff, 0.8);
      const num = this.add.text(-3, -6, String(i), { color: "#000000", fontSize: "12px", fontFamily: "system-ui" });
      bubble.add([circle, num]);
      bubble.on("pointerdown", () => this.attemptThrow(i));
      this.receiverIcons.push({ id: i, sprite: bubble, label: num });
    }
  }

  // ── Input ─────────────────────────────────────────────────────────────────

  private setupInputEvents(): void {
    this.input.keyboard?.on("keydown-SPACE", () => {
      if (this.phase === PlayPhase.PRE_SNAP) this.snapBall();
      if (this.phase === PlayPhase.FG_ATTEMPT) this.lockFgPower();
    });
    this.input.keyboard?.on("keydown-ONE",   () => this.attemptThrow(1));
    this.input.keyboard?.on("keydown-TWO",   () => this.attemptThrow(2));
    this.input.keyboard?.on("keydown-THREE", () => this.attemptThrow(3));
    this.input.keyboard?.on("keydown-FOUR",  () => this.attemptThrow(4));
    this.input.keyboard?.on("keydown-TAB",   (e: KeyboardEvent) => {
      e.preventDefault();
      this.toggleInCanvasBox();
      window.dispatchEvent(new CustomEvent("gridiron:boxscore-toggle"));
    });
    this.input.keyboard?.on("keydown-H", () => {
      if (this.phase !== PlayPhase.LIVE_PLAY && this.phase !== PlayPhase.PRE_SNAP && this.activePlay) {
        this.phase = PlayPhase.PRE_SNAP;
        this.preSnapRemaining = 2;
        this.playClock = 15;
        this.showPreSnapToolbar();
      }
    });
    this.input.keyboard?.on("keydown-S", () => {
      if (this.phase === PlayPhase.LIVE_PLAY && this.activePlay && !this.activePlay.isRun) {
        this.endPassIncomplete("Throw Away");
      }
    });
    this.input.keyboard?.on("keydown-F", () => {
      if (this.phase === PlayPhase.KICKOFF_RET || this.phase === PlayPhase.PUNT) {
        this.showMiniBanner("FAIR CATCH");
        this.yardLine = Phaser.Math.Clamp(this.carrier.x / 5.6, 1, 40);
        this.endPlay("Fair Catch", "normal");
      }
    });
    this.input.keyboard?.on("keydown-P", () => {
      // P key on 4th down = punt
      if (this.phase === PlayPhase.FORMATION && this.down === 4) {
        this.startPunt();
      }
    });
    this.input.keyboard?.on("keydown-G", () => {
      // G key on 4th down = attempt FG
      if (this.phase === PlayPhase.FORMATION && this.down === 4) {
        this.startFgAttempt();
      }
    });
    this.input.keyboard?.on("keydown-BACKTICK", () => {
      this.debugVisible = !this.debugVisible;
      if (!this.debugVisible && this.debugOverlay) {
        this.debugOverlay.destroy();
        this.debugOverlay = undefined;
      }
    });
    this.input.on("pointerdown", () => { this.throwHoldStart = this.time.now; });
  }

  private setupGlobalEvents(): void {
    window.addEventListener("gridiron:toggle-boxscore", this.onExternalToggle);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.shutdownScene, this);
  }

  private onExternalToggle = (): void => { this.toggleInCanvasBox(); };
  private shutdownScene(): void {
    window.removeEventListener("gridiron:toggle-boxscore", this.onExternalToggle);
  }

  // ── Special teams ─────────────────────────────────────────────────────────

  private startKickoff(): void {
    this.phase = PlayPhase.KICKOFF;
    this.clearTransientUi();
    this.showMiniBanner("KICKOFF — Kicking off…");

    const fromX = this.yardToX(35);
    const fromY = FIELD.midY;
    const toX = this.yardToX(88);
    const toY = FIELD.midY + Phaser.Math.Between(-30, 30);

    this.ballPhysics.kickBall(fromX, fromY, toX, toY, () => {
      // Ball lands — switch to return mode
      this.kickReturnStartX = toX;
      this.kickReturnStartY = toY;
      this.carrier.x = toX;
      this.carrier.y = toY;
      this.carrier.speedRating = 90;
      this.carrier.btkRating = 82;
      this.carrier.stamina = 100;
      this.controller = new PlayerController(this, this.carrier);
      this.phase = PlayPhase.KICKOFF_RET;
      this.showMiniBanner("RETURN IT! — F = Fair Catch");
      // Place coverage defenders
      this.defenders.forEach((d, i) => {
        d.x = this.yardToX(40 + i * 6);
        d.y = FIELD.midY + (i % 3 === 0 ? -60 : i % 3 === 1 ? 0 : 60);
        const dai = this.defAIs[i];
        if (dai) { dai.x = d.x; dai.y = d.y; dai.inPursuit = true; }
      });
    });
  }

  private startPunt(): void {
    this.phase = PlayPhase.PUNT;
    this.clearTransientUi();
    const distance = Phaser.Math.Between(38, 52);
    const toX = this.yardToX(Math.min(99, this.yardLine + distance));
    const toY = FIELD.midY + Phaser.Math.Between(-20, 20);
    this.showMiniBanner(`PUNT — ${distance} yards`);
    this.ballPhysics.kickBall(this.yardToX(this.yardLine), FIELD.midY, toX, toY, () => {
      // Turnover: defense becomes offense at landing spot
      const newYardLine = Math.min(98, this.yardLine + distance - 5);
      this.swapPossession();
      this.yardLine = 100 - newYardLine;
      this.down = 1;
      this.distance = 10;
      this.endPlay(`Punt — ${distance} yards`, "normal");
    });
  }

  private startFgAttempt(): void {
    this.phase = PlayPhase.FG_ATTEMPT;
    this.fgPowerMeter = 0;
    this.fgMeterDir = 1;
    this.fgPowerLocked = false;
    this.clearTransientUi();
    // Power meter bar
    this.fgPowerBarBg = this.add.rectangle(640, 640, 300, 22, 0x111827, 0.95).setDepth(65).setScrollFactor(0);
    this.fgPowerBar = this.add.rectangle(490, 640, 0, 16, 0x22c55e, 1).setOrigin(0, 0.5).setDepth(66).setScrollFactor(0);
    this.showMiniBanner("FG ATTEMPT — Press SPACE to set power");
  }

  private updateFgMeter(delta: number): void {
    if (this.fgPowerLocked) return;
    this.fgPowerMeter += this.fgMeterDir * delta * 0.12;
    if (this.fgPowerMeter >= 100) { this.fgPowerMeter = 100; this.fgMeterDir = -1; }
    if (this.fgPowerMeter <= 0)   { this.fgPowerMeter = 0;   this.fgMeterDir =  1; }
    if (this.fgPowerBar) this.fgPowerBar.width = this.fgPowerMeter * 3;
  }

  private lockFgPower(): void {
    if (this.fgPowerLocked) return;
    this.fgPowerLocked = true;
    const power = this.fgPowerMeter;
    const yards = 100 - this.yardLine + 17; // approximate distance
    // Good FG: needs ~45+ power for short, more for long
    const needed = (yards / 60) * 80;
    const made = power >= needed - 10 && power <= 100;
    this.fgPowerBar?.destroy();
    this.fgPowerBarBg?.destroy();

    if (made) {
      this.showResultBanner("FIELD GOAL GOOD! ✓", "first_down");
      if (this.possession === "home") this.homeScore += 3;
      else this.awayScore += 3;
      this.swapPossession();
      this.yardLine = 25;
      this.down = 1;
      this.distance = 10;
      this.time.delayedCall(1800, () => this.startKickoff());
    } else {
      this.showResultBanner(`FIELD GOAL NO GOOD (${yards} yds)`, "turnover");
      this.swapPossession();
      this.yardLine = 100 - Math.max(20, this.yardLine);
      this.down = 1;
      this.distance = 10;
      this.time.delayedCall(1800, () => {
        this.createTeams();
        this.phase = PlayPhase.FORMATION;
        this.showFormationSelect();
      });
    }
  }

  // ── Play flow ─────────────────────────────────────────────────────────────

  private showFormationSelect(): void {
    this.clearTransientUi();
    const hint4th = this.down === 4
      ? "  [P] = Punt   [G] = Field Goal"
      : "";
    const panel = this.add.container(80, 90).setDepth(60);
    const bg = this.add.rectangle(0, 0, 1120, hint4th ? 240 : 220, 0x0f172a, 0.92).setOrigin(0);
    panel.add(bg);
    const title = this.add.text(16, 12, `FORMATION SELECT${hint4th}`, { color: "#ffffff", fontSize: "18px", fontFamily: "system-ui" });
    panel.add(title);
    const formations = NFL_PLAYBOOK.slice(0, 8);
    formations.forEach((f, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const x = 16 + col * 272;
      const y = 48 + row * 78;
      const card = this.add.rectangle(x, y, 256, 64, this.familyColor(f.family), 0.85).setOrigin(0).setInteractive();
      const text = this.add.text(x + 10, y + 10, `${f.name}\n${f.plays.length} plays`, { color: "#ffffff", fontSize: "14px", fontFamily: "system-ui" });
      card.on("pointerdown", () => this.showPlaySelect(f.id));
      panel.add([card, text]);
    });
    panel.setData("role", "overlay");
  }

  private showPlaySelect(formationId: string): void {
    this.clearTransientUi();
    const formation = NFL_PLAYBOOK.find(f => f.id === formationId) ?? NFL_PLAYBOOK[0];
    const panel = this.add.container(80, 90).setDepth(60);
    const bg = this.add.rectangle(0, 0, 1120, 220, 0x111827, 0.94).setOrigin(0);
    const title = this.add.text(16, 12, `PLAY SELECT — ${formation.name}`, { color: "#ffffff", fontSize: "18px", fontFamily: "system-ui" });
    panel.add([bg, title]);
    formation.plays.forEach((pl, idx) => {
      const x = 16 + idx * 220;
      const y = 56;
      const card = this.add.rectangle(x, y, 206, 140, this.typeColor(pl.type), 0.9).setOrigin(0).setInteractive();
      const text = this.add.text(x + 8, y + 8, `${pl.name}\n[${pl.type.toUpperCase()}]\n${pl.description}`,
        { color: "#ffffff", fontSize: "12px", fontFamily: "system-ui", wordWrap: { width: 190 } });
      card.on("pointerdown", () => { this.activePlay = pl; this.startPreSnap(); });
      panel.add([card, text]);
    });
    const back = this.add.rectangle(980, 16, 120, 30, 0x374151, 0.95).setOrigin(0).setInteractive();
    const backText = this.add.text(1018, 22, "BACK", { color: "#ffffff", fontSize: "12px", fontFamily: "system-ui" });
    back.on("pointerdown", () => this.showFormationSelect());
    panel.add([back, backText]);
    panel.setData("role", "overlay");
  }

  private startPreSnap(): void {
    this.phase = PlayPhase.PRE_SNAP;
    this.preSnapRemaining = PRE_SNAP_SECONDS;
    this.playClock = PLAYCLOCK_SECONDS;
    this.redrawField();
    this.clearTransientUi();
    this.drawPlayArt();
    this.showPreSnapToolbar();
    this.showMiniBanner("PLAY ART");
  }

  /** False start check — called when snap input fires very early in pre-snap */
  private snapTooEarlyTimer = 0;

  private checkOffsidesPreSnap(): void {
    // Check if any DL has drifted across LOS
    const losX = this.yardToX(this.yardLine);
    for (const d of this.dlPlayers) {
      if (d.x < losX) {
        const pen = this.penalties.checkOffsides(true);
        if (pen) {
          this.applyPenalty(pen.type as "offsides");
          return;
        }
      }
    }
  }

  private applyPenalty(type: string): void {
    if (type === "delay_of_game") {
      this.yardLine = Math.max(1, this.yardLine - 5);
      this.distance += 5;
      this.endPlay("Delay of Game -5", "penalty");
    } else if (type === "offsides") {
      this.yardLine = Math.min(99, this.yardLine + 5);
      this.distance = Math.max(1, this.distance - 5);
      if (this.distance <= 0) { this.down = 1; this.distance = 10; }
      this.endPlay("Offsides — Free Play", "penalty");
    } else if (type === "holding") {
      this.yardLine = Math.max(1, this.yardLine - 10);
      this.distance += 10;
      this.endPlay("Holding -10", "penalty");
    } else if (type === "false_start") {
      this.yardLine = Math.max(1, this.yardLine - 5);
      this.distance += 5;
      this.endPlay("False Start -5", "penalty");
    }
  }

  private snapBall(): void {
    if (!this.activePlay) return;
    this.phase = PlayPhase.SNAP;
    this.playClock = PLAYCLOCK_SECONDS;
    this.hidePreSnapToolbar();
    this.clearPlayArt();
    this.tweens.add({ targets: this.qb, x: this.qb.x - 28, duration: 400, ease: "Sine.easeOut" });

    // Short delay then go LIVE
    this.time.delayedCall(180, () => {
      this.phase = PlayPhase.LIVE_PLAY;
      if (this.activePlay!.isRun) this.startRunPlay();
      else this.startPassPlay();
    });
  }

  private startRunPlay(): void {
    const idx = Phaser.Math.Clamp(this.activePlay?.ballCarrierIdx ?? 0, 0, this.offensePlayers.length - 1);
    this.carrier = this.offensePlayers[idx] as ControlledPlayer;
    this.carrier.speedRating = 88;
    this.carrier.strengthRating = 76;
    this.carrier.btkRating = 80;
    this.carrier.stamina = 100;
    this.carrier.velX = 0;
    this.carrier.velY = 0;
    this.controller = new PlayerController(this, this.carrier);
    this.tweens.add({ targets: this.carrier, x: this.carrier.x + 24, duration: 260, ease: "Quad.easeOut" });
    // AI defenders enter pursuit mode
    this.defAIs.forEach(d => { d.inPursuit = true; });
  }

  private startPassPlay(): void {
    this.passWindowMs = 3500;
    this.qbPressureTimer = 0;
    this.passerUnderPressure = false;
    this.waitingForThrow = true;
    this.runReceiverRoutes();
    this.runDefensiveCoverage();
    this.showMiniBanner("PASS — 1 / 2 / 3 / 4");
  }

  private runReceiverRoutes(): void {
    if (!this.activePlay) return;
    this.activePlay.routes.forEach(rt => {
      const wr = this.offensePlayers[rt.playerId];
      if (!wr) return;
      let px = wr.x, py = wr.y;
      rt.nodes.forEach((n, i) => {
        const tx = px + n.dx, ty = py + n.dy;
        this.tweens.add({ targets: wr, x: tx, y: ty, duration: 360 + i * 120, ease: "Linear", delay: i * 360 });
        px = tx; py = ty;
      });
    });
  }

  private runDefensiveCoverage(): void {
    this.defenders.forEach((d, i) => {
      const target = this.offensePlayers[1 + (i % 4)];
      if (!target) return;
      // Assign zone near the receiver's route endpoint
      const dai = this.defAIs[i];
      if (dai && i >= 4) { // LB/DB go to zone
        dai.zoneX = target.x + 50 + Phaser.Math.Between(10, 30);
        dai.zoneY = target.y + Phaser.Math.Between(-15, 15);
        dai.inPursuit = false;
      }
      this.tweens.add({
        targets: d,
        x: target.x + Phaser.Math.Between(8, 20),
        y: target.y + Phaser.Math.Between(-14, 14),
        duration: 1100 + i * 60,
        ease: "Sine.easeInOut",
      });
    });
  }

  private updateRunDefenders(delta: number): void {
    const cx = this.carrier.x;
    const cy = this.carrier.y;
    const cvx = this.carrier.velX;
    const cvy = this.carrier.velY;
    const losX = this.yardToX(this.yardLine);

    this.defenders.forEach((d, i) => {
      const dai = this.defAIs[i];
      if (!dai) return;
      // Sync position back to actual container
      dai.x = d.x; dai.y = d.y;
      this.ai.updateDefender(dai, cx, cy, cvx, cvy, delta);
      d.x = dai.x; d.y = dai.y;

      // Mark blocked status from blocking engine
      const rusher = d as unknown as Rusher;
      d.blocked = this.blocking.isBlocked(rusher);
    });
  }

  private attemptThrow(receiverId: number): void {
    if (this.phase !== PlayPhase.LIVE_PLAY || !this.activePlay || this.activePlay.isRun || !this.waitingForThrow) return;
    const wr = this.offensePlayers[receiverId];
    if (!wr) return;
    this.selectedReceiver = receiverId;
    this.waitingForThrow = false;
    const held = this.time.now - this.throwHoldStart;
    const power = held < 300 ? "bullet" : held < 650 ? "touch" : "lob";
    const qbX = this.qb.x, qbY = this.qb.y;
    let leadX = wr.x + 22, leadY = wr.y;
    const baseAcc = this.passerUnderPressure ? 64 : 86;
    const windAdj = this.weather.applyWind(leadX, leadY);
    leadX = windAdj.x; leadY = windAdj.y;
    const intChance = this.isThrowLaneContested(qbX, qbY, leadX, leadY) ? 0.28 : 0.07;
    this.registry.set("throwIntChance", intChance);
    const sep = this.receiverSeparation(receiverId);
    const catchChance = sep > 32 ? 0.86 : sep > 12 ? 0.64 : 0.40;
    this.registry.set("catchChance", catchChance);

    // DPI check — if defender too close at time of throw
    const closestDef = this.getClosestDefenderToReceiver(receiverId);
    if (closestDef < 8) {
      const pen = this.penalties.checkDpi(true);
      if (pen) {
        this.yardLine = Math.min(99, this.yardLine + pen.yards);
        this.down = 1; this.distance = 10;
        this.showResultBanner("DPI +15 Auto-1st", "first_down");
        this.endPlay("Defensive PI", "first_down");
        return;
      }
    }

    this.ballPhysics.throwBall(
      qbX, qbY, leadX, leadY, power, baseAcc, this.passerUnderPressure,
      () => {
        const yards = Math.max(0, Math.round((leadX - this.yardToX(this.yardLine)) / 5.6));
        this.stats.addPass(this.offenseTeamId, yards, true, false, false);
        this.stats.addTOP(this.offenseTeamId, 7000);
        this.advanceDownAndDistance(yards);
        this.endPlay(`Complete +${yards}`, yards >= this.distance ? "first_down" : "normal");
      },
      () => {
        this.stats.addPass(this.offenseTeamId, 0, false, false, false);
        this.endPlay("Incomplete", "incomplete");
      },
      () => {
        this.stats.addPass(this.offenseTeamId, 0, false, false, true);
        this.turnover();
        this.endPlay("Intercepted", "turnover");
      },
    );
  }

  private startQbScramble(): void {
    this.carrier = this.qb as ControlledPlayer;
    this.carrier.speedRating = 82;
    this.carrier.strengthRating = 70;
    this.carrier.btkRating = 72;
    this.carrier.stamina = 100;
    this.carrier.velX = 0;
    this.carrier.velY = 0;
    this.controller = new PlayerController(this, this.carrier);
    this.activePlay = { ...(this.activePlay as PlayDef), isRun: true };
    this.defAIs.forEach(d => { d.inPursuit = true; });
    this.showMiniBanner("QB SCRAMBLE");
  }

  private updatePassRush(delta: number): void {
    const losX = this.yardToX(this.yardLine);
    // Only unblocked DL rush
    for (let i = 0; i < 4; i++) {
      const r = this.dlPlayers[i] as unknown as Rusher;
      if (this.blocking.isBlocked(r)) continue;
      const d = this.defenders[i];
      const ang = Phaser.Math.Angle.Between(d.x, d.y, this.qb.x, this.qb.y);
      d.x += Math.cos(ang) * 1.9;
      d.y += Math.sin(ang) * 1.9;
      const dist = Phaser.Math.Distance.Between(d.x, d.y, this.qb.x, this.qb.y);
      if (dist < 28) {
        this.passerUnderPressure = true;
        this.qbPressureTimer += delta;
        this.flashQbPressure();
        if (this.qbPressureTimer > 480 && this.waitingForThrow) {
          // Roughing check if QB threw
          this.waitingForThrow = false;
          this.stats.addPass(this.offenseTeamId, 0, false, false, false);
          this.endPlay("Sack", "sack");
        }
      }
    }
    void losX;
  }

  private updateReceiverOpenStates(): void {
    for (let i = 1; i <= 4; i++) {
      const sep = this.receiverSeparation(i);
      const icon = this.receiverIcons.find(r => r.id === i);
      if (!icon) continue;
      const circle = icon.sprite.list[0] as Phaser.GameObjects.Arc;
      const color = sep > 32 ? 0x00ff66 : sep > 12 ? 0xffd84a : 0xff4d4d;
      circle.setFillStyle(color, 0.85);
      const wr = this.offensePlayers[i];
      icon.sprite.setPosition(wr.x, wr.y - 24);
    }
  }

  private receiverSeparation(receiverId: number): number {
    const wr = this.offensePlayers[receiverId];
    if (!wr) return 0;
    let min = Infinity;
    this.defenders.forEach(d => {
      const dist = Phaser.Math.Distance.Between(wr.x, wr.y, d.x, d.y);
      if (dist < min) min = dist;
    });
    return min;
  }

  private getClosestDefenderToReceiver(receiverId: number): number {
    const wr = this.offensePlayers[receiverId];
    if (!wr) return Infinity;
    let min = Infinity;
    this.defenders.forEach(d => {
      const dist = Phaser.Math.Distance.Between(wr.x, wr.y, d.x, d.y);
      if (dist < min) min = dist;
    });
    return min;
  }

  private isThrowLaneContested(x1: number, y1: number, x2: number, y2: number): boolean {
    const dx = x2 - x1, dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    for (const d of this.defenders) {
      let t = lenSq > 0 ? ((d.x - x1) * dx + (d.y - y1) * dy) / lenSq : 0;
      t = Math.max(0, Math.min(1, t));
      const cx = x1 + t * dx, cy = y1 + t * dy;
      if (Phaser.Math.Distance.Between(d.x, d.y, cx, cy) < 26) return true;
    }
    return false;
  }

  private handleTackle(): void {
    this.playTackleFx();
    const laneQ = this.blocking.getLaneQuality(this.carrier.x, this.carrier.y);
    const baseYards = Phaser.Math.Between(-1, 8);
    const yards = Math.round(baseYards * laneQ);
    this.stats.addRush(this.offenseTeamId, yards, false, false);
    this.advanceDownAndDistance(yards);
    this.endPlay(`Tackle ${yards >= 0 ? "+" : ""}${yards}`, "normal");
  }

  private advanceDownAndDistance(yards: number): void {
    this.yardLine = Phaser.Math.Clamp(this.yardLine + yards, 1, 99);
    if (yards >= this.distance) {
      this.down = 1;
      this.distance = Math.min(10, 100 - this.yardLine);
      this.stats.get(this.offenseTeamId).team.firstDowns += 1;
    } else {
      this.down += 1;
      this.distance = Math.max(1, this.distance - Math.max(0, yards));
    }
    if (this.yardLine >= 100) {
      this.scoretouchdown();
      return;
    }
    if (this.down > 4) this.turnoverOnDowns();
  }

  private scoretouchdown(): void {
    this.showResultBanner("TOUCHDOWN! 🏈", "first_down");
    if (this.possession === "home") this.homeScore += 7;
    else this.awayScore += 7;
    this.swapPossession();
    this.yardLine = 25;
    this.down = 1;
    this.distance = 10;
    this.phase = PlayPhase.WHISTLE;
    this.whistleTimer = 2200;
    this.time.delayedCall(2200, () => {
      this.createTeams();
      this.startKickoff();
    });
  }

  private turnoverOnDowns(): void {
    this.swapPossession();
    this.down = 1;
    this.distance = 10;
    this.yardLine = 100 - this.yardLine;
  }

  private turnover(): void {
    this.swapPossession();
    this.down = 1;
    this.distance = 10;
    this.yardLine = 100 - this.yardLine;
  }

  private swapPossession(): void {
    const prev = this.offenseTeamId;
    this.offenseTeamId = this.defenseTeamId;
    this.defenseTeamId = prev;
    this.possession = this.possession === "home" ? "away" : "home";
  }

  private endPassIncomplete(reason: string): void {
    this.stats.addPass(this.offenseTeamId, 0, false, false, false);
    this.endPlay(reason, "incomplete");
  }

  private endPlay(
    result: string,
    kind: "normal" | "first_down" | "turnover" | "incomplete" | "sack" | "penalty",
  ): void {
    this.phase = PlayPhase.WHISTLE;
    this.waitingForThrow = false;
    this.clearPlayArt();
    this.redrawField();
    this.showResultBanner(result, kind);
    this.whistleTimer = 700;
  }

  private transitionToNextPlay(): void {
    this.phase = PlayPhase.NEXT_PLAY;
    this.createTeams();
    this.emitLiveStats();

    // Check game over
    if (this.gameClockMs <= 0 && this.quarter >= 4) {
      this.showResultBanner("FINAL", "normal");
      this.emitGameOver();
      return;
    }
    this.phase = PlayPhase.FORMATION;
    this.showFormationSelect();
  }

  private handleQuarterEnd(): void {
    if (this.quarter >= 4) {
      this.phase = PlayPhase.WHISTLE;
      this.whistleTimer = 3000;
      this.time.delayedCall(3000, () => {
        this.showResultBanner("FINAL", "normal");
        this.emitGameOver();
      });
      return;
    }
    this.quarter += 1;
    this.gameClockMs = 15 * 60 * 1000;
    this.showResultBanner(`START Q${this.quarter}`, "normal");
  }

  // ── Pre-snap toolbar ───────────────────────────────────────────────────────

  private showPreSnapToolbar(): void {
    this.hidePreSnapToolbar();
    const bar = this.add.container(80, 668).setDepth(62);
    const bg = this.add.rectangle(0, 0, 1120, 40, 0x0f172a, 0.92).setOrigin(0);
    bar.add(bg);
    const buttons = [
      { label: "SNAP", onClick: () => this.snapBall() },
      { label: "HOT ROUTE", onClick: () => this.openHotRouteMenu() },
      { label: "MOTION", onClick: () => this.runMotion() },
      { label: "AUDIBLE", onClick: () => this.openAudibleMenu() },
      { label: "PROTECT", onClick: () => this.cycleProtection() },
    ];
    buttons.forEach((b, i) => {
      const x = 12 + i * 218;
      const btn = this.add.rectangle(x, 5, 200, 30, 0x1f2937, 0.95).setOrigin(0).setInteractive();
      const txt = this.add.text(x + 8, 12, b.label, { color: "#ffffff", fontSize: "13px", fontFamily: "system-ui" });
      btn.on("pointerdown", b.onClick);
      bar.add([btn, txt]);
    });
    this.preSnapToolbar = bar;
  }

  private hidePreSnapToolbar(): void {
    this.preSnapToolbar?.destroy();
    this.preSnapToolbar = undefined;
  }

  private openHotRouteMenu(): void {
    this.showMiniBanner("HOT ROUTE: TAP WR ICON");
    this.hotRouteReceiverId = null;
    const menu = this.add.container(920, 430).setDepth(65);
    const bg = this.add.rectangle(0, 0, 250, 180, 0x111827, 0.96).setOrigin(0);
    menu.add(bg);
    menu.add(this.add.text(8, 8, "HOT ROUTE", { color: "#ffd700", fontSize: "14px", fontFamily: "system-ui" }));
    const routes = ["Go", "Slant", "Curl", "Out", "Flat", "Drag", "Post", "Corner"];
    routes.forEach((r, idx) => {
      const x = 10 + (idx % 2) * 118, y = 30 + Math.floor(idx / 2) * 34;
      const b = this.add.rectangle(x, y, 110, 28, 0x374151, 0.95).setOrigin(0).setInteractive();
      const t = this.add.text(x + 8, y + 7, r, { color: "#ffffff", fontSize: "12px", fontFamily: "system-ui" });
      b.on("pointerdown", () => {
        if (this.hotRouteReceiverId == null) { this.showMiniBanner("SELECT RECEIVER FIRST"); return; }
        this.applyHotRoute(this.hotRouteReceiverId, r);
        menu.destroy();
      });
      menu.add([b, t]);
    });
    menu.setData("role", "overlay");
    this.receiverIcons.forEach(ic => {
      ic.sprite.once("pointerdown", () => {
        this.hotRouteReceiverId = ic.id;
        this.showMiniBanner(`WR${ic.id} SELECTED`);
      });
    });
  }

  private applyHotRoute(receiverId: number, route: string): void {
    if (!this.activePlay) return;
    const rt = this.activePlay.routes.find(r => r.playerId === receiverId);
    if (!rt) return;
    const map: Record<string, { dx: number; dy: number }[]> = {
      Go:     [{ dx: 170, dy: 0 }],
      Slant:  [{ dx: 58, dy: receiverId <= 2 ? 30 : -30 }],
      Curl:   [{ dx: 80, dy: 0 }, { dx: -22, dy: 0 }],
      Out:    [{ dx: 70, dy: 0 }, { dx: 92, dy: receiverId <= 2 ? -24 : 24 }],
      Flat:   [{ dx: 22, dy: receiverId <= 2 ? -38 : 38 }],
      Drag:   [{ dx: 50, dy: receiverId <= 2 ? 45 : -45 }],
      Post:   [{ dx: 78, dy: 0 }, { dx: 150, dy: receiverId <= 2 ? -50 : 50 }],
      Corner: [{ dx: 80, dy: 0 }, { dx: 155, dy: receiverId <= 2 ? 50 : -50 }],
    };
    rt.nodes = map[route] ?? rt.nodes;
    rt.isTarget = true;
    this.drawPlayArt(true);
    this.showMiniBanner(`HOT ROUTE: ${route.toUpperCase()}`);
  }

  private runMotion(): void {
    const wr = this.offensePlayers[4];
    const startX = wr.x;
    const targetY = wr.y < FIELD.midY ? FIELD.midY + 90 : FIELD.midY - 90;
    this.tweens.add({
      targets: wr, y: targetY, duration: 1200, ease: "Sine.easeInOut",
      onComplete: () => this.showMiniBanner(Math.random() > 0.5 ? "MAN!" : "ZONE!"),
    });
    this.time.delayedCall(1700, () => { this.tweens.add({ targets: wr, x: startX, duration: 500 }); });
  }

  private openAudibleMenu(): void {
    if (!this.activePlay) return;
    const formation = NFL_PLAYBOOK.find(f => f.id === this.activePlay?.formation.toLowerCase()) ?? NFL_PLAYBOOK[0];
    const options = formation.plays.slice(0, 4);
    const panel = this.add.container(880, 250).setDepth(65);
    const bg = this.add.rectangle(0, 0, 290, 190, 0x111827, 0.96).setOrigin(0);
    panel.add(bg);
    panel.add(this.add.text(8, 8, "AUDIBLE", { color: "#ffffff", fontSize: "14px", fontFamily: "system-ui" }));
    options.forEach((pl, i) => {
      const y = 30 + i * 38;
      const b = this.add.rectangle(10, y, 270, 30, 0x374151, 0.95).setOrigin(0).setInteractive();
      const t = this.add.text(16, y + 8, pl.name, { color: "#ffffff", fontSize: "12px", fontFamily: "system-ui" });
      b.on("pointerdown", () => {
        this.activePlay = pl;
        this.drawPlayArt();
        panel.destroy();
        this.showMiniBanner(`AUDIBLE: ${pl.name.toUpperCase()}`);
      });
      panel.add([b, t]);
    });
    panel.setData("role", "overlay");
  }

  private cycleProtection(): void {
    const opts = ["Slide Left", "Slide Right", "Half Slide", "Max Protect"];
    const pick = opts[Phaser.Math.Between(0, opts.length - 1)];
    this.showMiniBanner(`PROTECT: ${pick.toUpperCase()}`);
  }

  // ── Play art ──────────────────────────────────────────────────────────────

  private drawPlayArt(hotRoute = false): void {
    if (!this.activePlay) return;
    this.clearPlayArt();
    this.activePlay.routes.forEach(rt => {
      const player = this.offensePlayers[rt.playerId];
      if (!player) return;
      const g = this.add.graphics().setDepth(18);
      const dots: Phaser.GameObjects.Arc[] = [];
      const color = hotRoute && rt.playerId === this.hotRouteReceiverId ? 0xffd700 : this.routeColor(rt);
      g.lineStyle(2, color, 0.95);
      let x = player.x, y = player.y;
      g.moveTo(x, y);
      rt.nodes.forEach((n, i) => {
        const nx = x + n.dx, ny = y + n.dy;
        g.lineTo(nx, ny);
        const dot = this.add.circle(nx, ny, 3, color, 0.95).setDepth(19);
        dots.push(dot);
        dot.setAlpha(0);
        this.tweens.add({ targets: dot, alpha: 1, duration: 250, delay: i * 90 });
        x = nx; y = ny;
      });
      g.strokePath();
      if (rt.playerId >= 1 && rt.playerId <= 4) {
        const circle = this.add.circle(player.x, player.y - 18, 9, 0xffffff, 0.85).setDepth(20);
        const label = this.add.text(player.x - 3, player.y - 24, `${rt.playerId}`, { color: "#000000", fontSize: "11px", fontFamily: "system-ui" }).setDepth(21);
        dots.push(circle as unknown as Phaser.GameObjects.Arc);
        dots.push(label as unknown as Phaser.GameObjects.Arc);
      }
      this.routeDraws.push({ playerId: rt.playerId, graphics: g, dots });
    });
    // Coverage lines
    this.defenders.slice(0, 4).forEach((d, i) => {
      const zone = this.add.rectangle(d.x + 50, d.y, 90, 70, 0x60a5fa, 0.12).setDepth(16);
      const wr = this.offensePlayers[1 + (i % 4)];
      const line = this.add.graphics().setDepth(17).lineStyle(1, 0xfff4, 0.65);
      line.lineBetween(d.x, d.y, wr.x, wr.y);
      this.routeDraws.push({ playerId: 100 + i, graphics: line, dots: [zone as unknown as Phaser.GameObjects.Arc] });
    });
  }

  private clearPlayArt(): void {
    this.routeDraws.forEach(r => { r.graphics.destroy(); r.dots.forEach(d => d.destroy()); });
    this.routeDraws = [];
  }

  private routeColor(rt: { nodes: { dx: number; dy: number }[] }): number {
    const n = rt.nodes[0];
    if (!n) return 0xffffff;
    if (Math.abs(n.dy) > 40 && Math.abs(n.dx) < 40) return 0x84cc16;
    if (Math.abs(n.dy) > 20 && n.dx > 40) return 0x22d3ee;
    if (n.dx > 140 && Math.abs(n.dy) < 20) return 0xfacc15;
    if (n.dx > 70 && Math.abs(n.dy) < 10) return 0xffffff;
    return 0xa855f7;
  }

  // ── Debug overlay ─────────────────────────────────────────────────────────

  private updateDebugOverlay(): void {
    this.debugOverlay?.destroy();
    const lines: string[] = [
      `── DEBUG  [BACKTICK to hide] ──`,
      `Phase: ${this.phase}`,
      `Down: ${this.down} & ${this.distance}  |  YardLine: ${this.yardLine}`,
      `QB Pressure: ${this.passerUnderPressure ? "YES" : "no"}  PressTimer: ${this.qbPressureTimer.toFixed(0)}ms`,
    ];
    for (let i = 1; i <= 4; i++) {
      const sep = this.receiverSeparation(i);
      const color = sep > 32 ? "OPEN" : sep > 12 ? "COVERED" : "BLANKETED";
      lines.push(`WR${i} sep: ${sep.toFixed(0)}px  [${color}]`);
    }
    lines.push(`Lane quality: ${this.blocking.getLaneQuality(this.carrier?.x ?? 0, this.carrier?.y ?? 0).toFixed(2)}`);
    lines.push(`Blocked DL: ${this.dlPlayers.filter(d => this.blocking.isBlocked(d as unknown as Rusher)).length}/${this.dlPlayers.length}`);
    lines.push(`Penalty history: ${this.penalties.getHistory().map(p => p.description).join(", ") || "none"}`);

    const bg = this.add.rectangle(5, 50, 320, lines.length * 16 + 14, 0x000000, 0.72).setOrigin(0).setDepth(80);
    const txt = this.add.text(12, 56, lines.join("\n"), {
      color: "#00ff88", fontSize: "11px", fontFamily: "monospace",
    }).setDepth(81);
    this.debugOverlay = this.add.container(0, 0, [bg, txt]);
  }

  // ── Effects / UI helpers ──────────────────────────────────────────────────

  private showResultBanner(text: string, kind: "normal" | "first_down" | "turnover" | "incomplete" | "sack" | "penalty"): void {
    this.resultBanner?.destroy();
    const color =
      kind === "turnover"   ? "#ff4d4d" :
      kind === "first_down" ? "#22c55e" :
      kind === "incomplete" ? "#9ca3af" :
      kind === "sack"       ? "#fb923c" :
      kind === "penalty"    ? "#f97316" : "#ffffff";
    const banner = this.add.text(640, 120, text.toUpperCase(), {
      color, fontSize: "40px", fontFamily: "system-ui", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(66).setScale(0);
    this.resultBanner = banner;
    this.tweens.add({ targets: banner, scale: 1.2, duration: 100, yoyo: true, hold: 1500, onComplete: () => banner.destroy() });
  }

  private showMiniBanner(msg: string): void {
    const t = this.add.text(640, 160, msg, {
      color: "#ffffff", fontSize: "20px", fontFamily: "system-ui",
      backgroundColor: "#111827", padding: { left: 10, right: 10, top: 4, bottom: 4 },
    }).setOrigin(0.5).setDepth(64);
    this.tweens.add({ targets: t, alpha: 0, duration: 900, delay: 600, onComplete: () => t.destroy() });
  }

  private playTackleFx(): void {
    this.cameras.main.shake(150, 0.008);
    if (this.tackleFlash) {
      this.tackleFlash.setAlpha(0.12);
      this.tweens.add({ targets: this.tackleFlash, alpha: 0, duration: 220, ease: "Sine.easeOut" });
    }
    if (this.carrier) {
      this.tweens.add({
        targets: this.carrier, scaleX: 1.3, scaleY: 1.3, duration: 80, yoyo: true, repeat: 1,
        onComplete: () => { this.carrier.angle = 90; this.carrier.alpha = 0.75;
          this.time.delayedCall(220, () => { this.carrier.angle = 0; this.carrier.alpha = 1; }); },
      });
    }
  }

  private flashQbPressure(): void {
    const ring = this.add.circle(this.qb.x, this.qb.y, 18, 0xff0000, 0.2).setDepth(30);
    this.tweens.add({ targets: ring, alpha: 0, scale: 1.5, duration: 180, onComplete: () => ring.destroy() });
  }

  private applyBurstBlur(): void {
    if (!this.blurOverlay || !this.controller) return;
    const fast = this.controller.getCurrentSpeed() > 1.95;
    const target = fast ? 0.08 : 0;
    this.blurOverlay.alpha = Phaser.Math.Linear(this.blurOverlay.alpha, target, 0.12);
  }

  private emitGameOver(): void {
    const isHomeWin = this.homeScore > this.awayScore;
    const data: GameOverData = {
      homeTeamId: this.offenseTeamId,
      homeTeamName: this.offenseTeamId,
      homeScore: this.homeScore,
      awayTeamId: this.defenseTeamId,
      awayTeamName: this.defenseTeamId,
      awayScore: this.awayScore,
      winnerName: isHomeWin ? this.offenseTeamId : this.defenseTeamId,
      winnerColor: 0x22c55e,
      league: this.options.league ?? "nfl",
    };
    window.dispatchEvent(new CustomEvent<GameOverData>("gridiron:gameover", { detail: data }));
  }

  // ── Stats output ──────────────────────────────────────────────────────────

  private emitLiveStats(): void {
    const all = this.stats.getAll();
    const home = all[this.offenseTeamId] ?? Object.values(all)[0];
    const away = all[this.defenseTeamId] ?? Object.values(all)[1] ?? home;
    if (!home || !away) return;
    const payload: LiveBoxPayload = {
      homeTeam: this.offenseTeamId, awayTeam: this.defenseTeamId,
      homeScore: this.homeScore, awayScore: this.awayScore,
      quarter: this.quarter, clock: this.msToClock(this.gameClockMs),
      downDistance: `${this.down}${this.ordinal(this.down)} & ${this.distance}`,
      home: { passYds: home.passing.yards, rushYds: home.rushing.yards, totalYds: home.team.totalYards, firstDowns: home.team.firstDowns, turnovers: home.team.turnovers, thirdDown: `${home.team.thirdDownConv}/${home.team.thirdDownAtt}`, top: this.msToClock(home.team.timeOfPossessionMs) },
      away: { passYds: away.passing.yards, rushYds: away.rushing.yards, totalYds: away.team.totalYards, firstDowns: away.team.firstDowns, turnovers: away.team.turnovers, thirdDown: `${away.team.thirdDownConv}/${away.team.thirdDownAtt}`, top: this.msToClock(away.team.timeOfPossessionMs) },
    };
    window.dispatchEvent(new CustomEvent<LiveBoxPayload>("gridiron:stats", { detail: payload }));
  }

  private updateScoreboardText(): void {
    const phaseLabel =
      this.phase === PlayPhase.PRE_SNAP   ? `PRESNAP ${Math.ceil(this.preSnapRemaining)}s` :
      this.phase === PlayPhase.LIVE_PLAY  ? "LIVE" :
      this.phase === PlayPhase.KICKOFF    ? "KICKOFF" :
      this.phase === PlayPhase.KICKOFF_RET ? "RETURN" :
      this.phase === PlayPhase.PUNT       ? "PUNT" :
      this.phase === PlayPhase.FG_ATTEMPT ? "FG METER" : "DEAD";
    this.scoreboardText.setText(
      `${this.awayScore} ${this.defenseTeamId}   @   ${this.homeScore} ${this.offenseTeamId}   |   Q${this.quarter} ${this.msToClock(this.gameClockMs)}   |   ${this.down}${this.ordinal(this.down)} & ${this.distance}`,
    );
    this.playClockText.setText(`${phaseLabel}   |   ⏱ ${Math.ceil(this.playClock)}`);
  }

  private toggleInCanvasBox(): void {
    if (this.inCanvasBox) { this.inCanvasBox.destroy(); this.inCanvasBox = undefined; return; }
    const all = this.stats.getAll();
    const h = all[this.offenseTeamId] ?? Object.values(all)[0];
    const a = all[this.defenseTeamId] ?? Object.values(all)[1] ?? h;
    if (!h || !a) return;
    const bg = this.add.rectangle(640, 360, 700, 360, 0x000000, 0.78).setDepth(70);
    const txt = this.add.text(320, 220, [
      "LIVE BOX SCORE",
      `${this.defenseTeamId} ${this.awayScore}   —   ${this.offenseTeamId} ${this.homeScore}`,
      "",
      `Pass Yds   ${a.passing.yards} | ${h.passing.yards}`,
      `Rush Yds   ${a.rushing.yards} | ${h.rushing.yards}`,
      `Total Yds  ${a.team.totalYards} | ${h.team.totalYards}`,
      `1st Downs  ${a.team.firstDowns} | ${h.team.firstDowns}`,
      `Turnovers  ${a.team.turnovers} | ${h.team.turnovers}`,
      `3rd Downs  ${a.team.thirdDownConv}/${a.team.thirdDownAtt} | ${h.team.thirdDownConv}/${h.team.thirdDownAtt}`,
      `TOP        ${this.msToClock(a.team.timeOfPossessionMs)} | ${this.msToClock(h.team.timeOfPossessionMs)}`,
    ].join("\n"), { color: "#ffffff", fontSize: "22px", fontFamily: "system-ui" }).setDepth(71);
    this.inCanvasBox = this.add.container(0, 0, [bg, txt]);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private msToClock(ms: number): string {
    const s = Math.max(0, Math.floor(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  private ordinal(n: number): string {
    return n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
  }

  private yardToX(yard: number): number {
    return FIELD.left + ((FIELD.right - FIELD.left) * yard) / 100;
  }

  private clearTransientUi(): void {
    this.children.getAll().forEach(obj => {
      if ((obj as Phaser.GameObjects.GameObject).getData?.("role") === "overlay") obj.destroy();
    });
  }

  private cleanupTransient(): void {
    this.children.each(obj => {
      const ttl = (obj as Phaser.GameObjects.GameObject).getData?.("ttl") as number | undefined;
      if (ttl && ttl < this.time.now) obj.destroy();
    });
  }

  private familyColor(family: string): number {
    switch (family) {
      case "shotgun": return 0x1d4ed8; case "iform": return 0x16a34a;
      case "pistol": return 0x0d9488; case "wildcat": return 0xf97316;
      case "goalline": return 0xdc2626; case "singleback": return 0x7c3aed;
      default: return 0x334155;
    }
  }

  private typeColor(type: string): number {
    switch (type) {
      case "run": return 0x14532d; case "pass": return 0x1e3a8a;
      case "option": return 0x92400e; case "special": return 0x7c2d12;
      default: return 0x374151;
    }
  }

  private pickWeather(): WeatherType {
    if (this.options.weatherRandom === false) return "Clear";
    const pool: WeatherType[] = ["Clear", "Rain", "Snow", "Wind", "Fog", "Cold"];
    return Phaser.Utils.Array.GetRandom(pool);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
import type { GameTeam } from "./teams";

export interface GameOverData {
  homeTeamId: string; homeTeamName: string; homeScore: number;
  awayTeamId: string; awayTeamName: string; awayScore: number;
  winnerName: string; winnerColor: number; league: string;
}

export function createFootballGame(
  parent: HTMLElement,
  homeTeam: GameTeam,
  awayTeam: GameTeam,
  league: "nfl" | "ncaa",
  _onNavigate: (path: string) => void,
  onGameOver: (data: GameOverData) => void,
): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: parent.clientWidth || 1280,
    height: parent.clientHeight || 680,
    backgroundColor: "#113311",
    scene: FootballGame,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  };

  const game = new Phaser.Game(config);

  game.events.once("ready", () => {
    game.registry.set("gameOptions", {
      league,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      weatherRandom: true,
    });
  });

  window.addEventListener("gridiron:gameover", (e: Event) => {
    onGameOver((e as CustomEvent<GameOverData>).detail);
  }, { once: true });

  return game;
}
