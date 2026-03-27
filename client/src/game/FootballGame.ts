import Phaser from "phaser";
import { NFL_PLAYBOOK, type PlayDef } from "./Playbook";
import { BallPhysics } from "./BallPhysics";
import { StatsTracker } from "./StatsTracker";
import { PlayerController, type ControlledPlayer, type Defender } from "./PlayerController";
import { AIEngine } from "./AIEngine";
import { WeatherSystem, type WeatherType } from "./WeatherSystem";
type LiveBoxPayload = {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  quarter: number;
  clock: string;
  downDistance: string;
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
  private yardLine = 25; // offense yards from own goal
  private possession: "home" | "away" = "home";
  private inPlay = false;
  private preSnap = true;
  private preSnapRemaining = PRE_SNAP_SECONDS;
  private lastStatsEmitAt = 0;
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
  private controller!: PlayerController;
  private qb!: Phaser.GameObjects.Container;
  private receiverIcons: ReceiverIcon[] = [];
  private routeDraws: RouteDraw[] = [];
  private activePlay: PlayDef | null = null;
  private selectedReceiver = 1;
  private passWindowMs = 3500;
  private qbPressureTimer = 0;
  private passerUnderPressure = false;
  private throwHoldStart = 0;
  private waitingForThrow = false;
  // Visual FX
  private crowdWave?: Phaser.GameObjects.Graphics;
  private blurOverlay?: Phaser.GameObjects.Rectangle;
  private tackleFlash?: Phaser.GameObjects.Rectangle;
  private hotRouteReceiverId: number | null = null;
  // Stats overlay in-canvas
  private inCanvasBox?: Phaser.GameObjects.Container;
  constructor() {
    super("FootballGame");
  }
  create(): void {
    this.options = (this.registry.get("gameOptions") as GameOptions | undefined) ?? {};
    this.offenseTeamId = (this.options.homeTeamId ?? "HOME").toUpperCase();
    this.defenseTeamId = (this.options.awayTeamId ?? "AWAY").toUpperCase();
    this.cameras.main.setBackgroundColor(0x113311);
    this.keys = this.input.keyboard!.addKeys({
      one: "ONE",
      two: "TWO",
      three: "THREE",
      four: "FOUR",
      space: "SPACE",
      h: "H",
      tab: "TAB",
      t: "T",
      f: "F",
      s: "S",
    }) as unknown as typeof this.keys;
    this.ballPhysics = new BallPhysics(this);
    this.stats = new StatsTracker(this.offenseTeamId, this.defenseTeamId);
    this.ai = new AIEngine();
    const weatherType = this.pickWeather();
    this.weather = new WeatherSystem(this, weatherType);
    this.weather.create();
    this.createField();
    this.createUi();
    this.createTeams();
    this.setupInputEvents();
    this.setupGlobalEvents();
    this.showFormationSelect();
    this.emitLiveStats();
  }
  update(time: number, delta: number): void {
    this.weather.update();
    this.cleanupTransient();
    // clocks
    if (this.inPlay) {
      this.gameClockMs = Math.max(0, this.gameClockMs - delta);
      this.playClock = Math.max(0, this.playClock - delta / 1000);
      if (this.playClock <= 0) this.endPlay("Delay of Game -5", "penalty");
    } else if (this.preSnap) {
      this.preSnapRemaining = Math.max(0, this.preSnapRemaining - delta / 1000);
      this.playClock = Math.max(0, this.playClock - delta / 1000);
      if (this.preSnapRemaining <= 0 || this.playClock <= 0) this.snapBall();
    }
    if (this.controller && this.inPlay && this.activePlay?.isRun) {
      this.controller.update(delta);
      const tackled = this.controller.updateDefenders(this.defenders).tackled;
      if (tackled) this.handleTackle();
      this.applyBurstBlur();
    }
    if (this.waitingForThrow && this.inPlay && this.activePlay && !this.activePlay.isRun) {
      this.passWindowMs -= delta;
      this.updateReceiverOpenStates();
      this.updatePassRush(delta);
      if (this.passWindowMs <= 0) {
        this.waitingForThrow = false;
        this.startQbScramble();
      }
    }
    this.updateScoreboardText();
    if (time - this.lastStatsEmitAt > 1200) {
      this.emitLiveStats();
      this.lastStatsEmitAt = time;
    }
    if (this.gameClockMs <= 0) this.handleQuarterEnd();
  }
  // ---------------------------
  // Scene setup
  // ---------------------------
  private createField(): void {
    this.fieldGfx = this.add.graphics();
    this.redrawField();
  }
  private redrawField(): void {
    this.fieldGfx.clear();
    // turf
    this.fieldGfx.fillStyle(0x2f8f2f, 1);
    this.fieldGfx.fillRect(0, 0, 1280, 720);
    // playable area
    this.fieldGfx.fillStyle(0x237523, 1);
    this.fieldGfx.fillRect(FIELD.left, FIELD.top, FIELD.right - FIELD.left, FIELD.bottom - FIELD.top);
    // hash/yard lines
    this.fieldGfx.lineStyle(2, 0xffffff, 0.35);
    for (let x = FIELD.left; x <= FIELD.right; x += 56) {
      this.fieldGfx.lineBetween(x, FIELD.top, x, FIELD.bottom);
    }
    // sidelines
    this.fieldGfx.lineStyle(3, 0xffffff, 0.8);
    this.fieldGfx.strokeRect(FIELD.left, FIELD.top, FIELD.right - FIELD.left, FIELD.bottom - FIELD.top);
    // LOS marker
    const losX = this.yardToX(this.yardLine);
    this.fieldGfx.lineStyle(3, 0x00d9ff, 0.9);
    this.fieldGfx.lineBetween(losX, FIELD.top, losX, FIELD.bottom);
    // first-down marker
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
    // Clear old
    this.offensePlayers.forEach((p) => p.destroy());
    this.defensePlayers.forEach((p) => p.destroy());
    this.offensePlayers = [];
    this.defensePlayers = [];
    this.defenders = [];
    this.receiverIcons.forEach((r) => { r.sprite.destroy(); r.label.destroy(); });
    this.receiverIcons = [];
    const losX = this.yardToX(this.yardLine);
    // QB + offense layout
    this.qb = this.makePlayer(losX - 18, FIELD.midY, 0x1e3a8a, "QB");
    this.offensePlayers.push(this.qb);
    // 4 receivers + RB
    const wrY = [FIELD.midY - 120, FIELD.midY - 50, FIELD.midY + 50, FIELD.midY + 120];
    for (let i = 0; i < 4; i++) {
      const wr = this.makePlayer(losX - 30, wrY[i], 0x1e3a8a, `WR${i + 1}`);
      this.offensePlayers.push(wr);
    }
    const rb = this.makePlayer(losX - 42, FIELD.midY + 20, 0x1e3a8a, "HB");
    this.offensePlayers.push(rb);
    // O-line
    for (let i = -2; i <= 2; i++) {
      const ol = this.makePlayer(losX - 6, FIELD.midY + i * 18, 0x1d4ed8, `OL${i + 3}`);
      this.offensePlayers.push(ol);
    }
    // Defense
    for (let i = 0; i < 11; i++) {
      const row = i < 4 ? 0 : i < 7 ? 1 : 2;
      const x = losX + 16 + row * 28 + (i % 4) * 8;
      const yBase = row === 0 ? FIELD.midY - 45 : row === 1 ? FIELD.midY : FIELD.midY + 60;
      const y = yBase + (i % 4) * 22 - 30;
      const def = this.makePlayer(x, y, 0x991b1b, `D${i + 1}`) as Defender;
      def.tackleRating = 74 + (i % 5) * 4;
      def.speedRating = 74 + (i % 4) * 5;
      this.defensePlayers.push(def);
      this.defenders.push(def);
    }
    this.carrier = this.qb as ControlledPlayer;
    this.carrier.speedRating = 86;
    this.carrier.strengthRating = 74;
    this.carrier.btkRating = 76;
    this.carrier.stamina = 100;
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
    // WR1..WR4 mapped to offensePlayers[1..4]
    for (let i = 1; i <= 4; i++) {
      const wr = this.offensePlayers[i];
      const bubble = this.add.container(wr.x, wr.y - 24).setDepth(24).setInteractive(new Phaser.Geom.Circle(0, 0, 12), Phaser.Geom.Circle.Contains);
      const circle = this.add.circle(0, 0, 11, 0x00ff66, 0.8).setStrokeStyle(1, 0xffffff, 0.8);
      const num = this.add.text(-3, -6, String(i), { color: "#000000", fontSize: "12px", fontFamily: "system-ui" });
      bubble.add([circle, num]);
      bubble.on("pointerdown", () => this.attemptThrow(i));
      this.receiverIcons.push({ id: i, sprite: bubble, label: num });
    }
  }
  // ---------------------------
  // Input and events
  // ---------------------------
  private setupInputEvents(): void {
    this.input.keyboard?.on("keydown-SPACE", () => {
      if (this.preSnap) this.snapBall();
    });
    this.input.keyboard?.on("keydown-ONE", () => this.attemptThrow(1));
    this.input.keyboard?.on("keydown-TWO", () => this.attemptThrow(2));
    this.input.keyboard?.on("keydown-THREE", () => this.attemptThrow(3));
    this.input.keyboard?.on("keydown-FOUR", () => this.attemptThrow(4));
    this.input.keyboard?.on("keydown-TAB", (e: KeyboardEvent) => {
      e.preventDefault();
      this.toggleInCanvasBox();
      window.dispatchEvent(new CustomEvent("gridiron:boxscore-toggle"));
    });
    this.input.keyboard?.on("keydown-H", () => {
      // Hurry-up: skip formation select and run same play quickly
      if (!this.inPlay && !this.preSnap && this.activePlay) {
        this.preSnap = true;
        this.preSnapRemaining = 2;
        this.playClock = 15;
        this.showPreSnapToolbar();
      }
    });
    this.input.keyboard?.on("keydown-S", () => {
      // Throw away if pass play and in play
      if (this.inPlay && this.activePlay && !this.activePlay.isRun) {
        this.endPassIncomplete("Throw Away");
      }
    });
    this.input.keyboard?.on("keydown-F", () => {
      // Fair catch placeholder
      if (this.inPlay) this.showMiniBanner("FAIR CATCH");
    });
    this.input.keyboard?.on("keydown-T", () => {
      // Touchback placeholder
      if (!this.inPlay) this.showMiniBanner("TOUCHBACK");
    });
    // Hold duration for throw power
    this.input.on("pointerdown", () => { this.throwHoldStart = this.time.now; });
  }
  private setupGlobalEvents(): void {
    window.addEventListener("gridiron:toggle-boxscore", this.onExternalToggle);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.shutdownScene, this);
  }
  private onExternalToggle = (): void => {
    this.toggleInCanvasBox();
  };
  private shutdownScene(): void {
    window.removeEventListener("gridiron:toggle-boxscore", this.onExternalToggle);
  }
  // ---------------------------
  // Play flow
  // ---------------------------
  private showFormationSelect(): void {
    // Simple two-step play selector: formation then play
    this.clearTransientUi();
    const panel = this.add.container(80, 90).setDepth(60);
    const bg = this.add.rectangle(0, 0, 1120, 220, 0x0f172a, 0.92).setOrigin(0);
    panel.add(bg);
    const title = this.add.text(16, 12, "FORMATION SELECT", { color: "#ffffff", fontSize: "20px", fontFamily: "system-ui" });
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
    const formation = NFL_PLAYBOOK.find((f) => f.id === formationId) ?? NFL_PLAYBOOK[0];
    const panel = this.add.container(80, 90).setDepth(60);
    const bg = this.add.rectangle(0, 0, 1120, 220, 0x111827, 0.94).setOrigin(0);
    const title = this.add.text(16, 12, `PLAY SELECT — ${formation.name}`, { color: "#ffffff", fontSize: "20px", fontFamily: "system-ui" });
    panel.add([bg, title]);
    formation.plays.forEach((pl, idx) => {
      const x = 16 + idx * 220;
      const y = 56;
      const card = this.add.rectangle(x, y, 206, 140, this.typeColor(pl.type), 0.9).setOrigin(0).setInteractive();
      const text = this.add.text(
        x + 8,
        y + 8,
        `${pl.name}\n[${pl.type.toUpperCase()}]\n${pl.description}`,
        { color: "#ffffff", fontSize: "12px", fontFamily: "system-ui", wordWrap: { width: 190 } }
      );
      card.on("pointerdown", () => {
        this.activePlay = pl;
        this.startPreSnap();
      });
      panel.add([card, text]);
    });
    const back = this.add.rectangle(980, 16, 120, 30, 0x374151, 0.95).setOrigin(0).setInteractive();
    const backText = this.add.text(1018, 22, "BACK", { color: "#ffffff", fontSize: "12px", fontFamily: "system-ui" });
    back.on("pointerdown", () => this.showFormationSelect());
    panel.add([back, backText]);
    panel.setData("role", "overlay");
  }
  private startPreSnap(): void {
    this.inPlay = false;
    this.preSnap = true;
    this.preSnapRemaining = PRE_SNAP_SECONDS;
    this.playClock = PLAYCLOCK_SECONDS;
    this.redrawField();
    this.clearTransientUi();
    this.drawPlayArt();
    this.showPreSnapToolbar();
    this.showMiniBanner("PLAY ART");
  }
  private snapBall(): void {
    if (!this.activePlay) return;
    this.preSnap = false;
    this.inPlay = true;
    this.playClock = PLAYCLOCK_SECONDS;
    this.hidePreSnapToolbar();
    this.clearPlayArt();
    // QB drop
    this.tweens.add({ targets: this.qb, x: this.qb.x - 28, duration: 400, ease: "Sine.easeOut" });
    if (this.activePlay.isRun) {
      this.startRunPlay();
    } else {
      this.startPassPlay();
    }
  }
  private startRunPlay(): void {
    // Give ball to configured carrier
    const idx = Phaser.Math.Clamp(this.activePlay?.ballCarrierIdx ?? 0, 0, this.offensePlayers.length - 1);
    this.carrier = this.offensePlayers[idx] as ControlledPlayer;
    this.carrier.speedRating = 88;
    this.carrier.strengthRating = 76;
    this.carrier.btkRating = 80;
    this.carrier.stamina = 100;
    this.controller = new PlayerController(this, this.carrier);
    // Initial run nudge
    this.tweens.add({
      targets: this.carrier,
      x: this.carrier.x + 24,
      duration: 260,
      ease: "Quad.easeOut",
    });
  }
  private startPassPlay(): void {
    this.passWindowMs = 3500;
    this.qbPressureTimer = 0;
    this.passerUnderPressure = false;
    this.waitingForThrow = true;
    // Receivers follow route nodes
    this.runReceiverRoutes();
    // Defenders either man-ish trail or zone drift
    this.runDefensiveCoverage();
    this.showMiniBanner("PASS — PRESS 1/2/3/4");
  }
  private runReceiverRoutes(): void {
    if (!this.activePlay) return;
    this.activePlay.routes.forEach((rt) => {
      const wr = this.offensePlayers[rt.playerId];
      if (!wr) return;
      let prevX = wr.x;
      let prevY = wr.y;
      rt.nodes.forEach((n, i) => {
        const tx = prevX + n.dx;
        const ty = prevY + n.dy;
        this.tweens.add({
          targets: wr,
          x: tx,
          y: ty,
          duration: 360 + i * 120,
          ease: "Linear",
          delay: i * 360,
        });
        prevX = tx;
        prevY = ty;
      });
    });
  }
  private runDefensiveCoverage(): void {
    this.defenders.forEach((d, i) => {
      const target = this.offensePlayers[1 + (i % 4)];
      if (!target) return;
      // Smooth tracking for "man"
      this.tweens.add({
        targets: d,
        x: target.x + Phaser.Math.Between(8, 18),
        y: target.y + Phaser.Math.Between(-12, 12),
        duration: 1200,
        ease: "Sine.easeInOut",
      });
    });
  }
  private attemptThrow(receiverId: number): void {
    if (!this.inPlay || !this.activePlay || this.activePlay.isRun || !this.waitingForThrow) return;
    const wr = this.offensePlayers[receiverId];
    if (!wr) return;
    this.selectedReceiver = receiverId;
    this.waitingForThrow = false;
    // Power by hold
    const held = this.time.now - this.throwHoldStart;
    const power = held < 300 ? "bullet" : held < 650 ? "touch" : "lob";
    const qbX = this.qb.x;
    const qbY = this.qb.y;
    let leadX = wr.x + 22;
    let leadY = wr.y;
    // pressure reduces accuracy
    const baseAcc = this.passerUnderPressure ? 66 : 86;
    const throwOnRun = this.passerUnderPressure;
    // wind
    const windAdjusted = this.weather.applyWind(leadX, leadY);
    leadX = windAdjusted.x;
    leadY = windAdjusted.y;
    // lane interception risk
    const intChance = this.isThrowLaneContested(qbX, qbY, leadX, leadY) ? 0.30 : 0.08;
    this.registry.set("throwIntChance", intChance);
    // catch chance by separation
    const sep = this.receiverSeparation(receiverId);
    const catchChance = sep > 30 ? 0.85 : sep > 10 ? 0.62 : 0.42;
    this.registry.set("catchChance", catchChance);
    this.ballPhysics.throwBall(
      qbX,
      qbY,
      leadX,
      leadY,
      power,
      baseAcc,
      throwOnRun,
      () => {
        const yards = Math.max(0, Math.round((leadX - this.yardToX(this.yardLine)) / 5.6));
        this.stats.addPass(this.offenseTeamId, yards, true, false, false);
        this.stats.addTOP(this.offenseTeamId, 7000);
        this.advanceDownAndDistance(yards);
        this.endPlay(`Complete +${yards}`, yards >= this.distance ? "first_down" : "normal");
      },
      () => {
        this.stats.addPass(this.offenseTeamId, 0, false, false, false);
        this.stopClockOnIncomplete();
        this.endPlay("Incomplete", "incomplete");
      },
      () => {
        this.stats.addPass(this.offenseTeamId, 0, false, false, true);
        this.turnover();
        this.endPlay("Intercepted", "turnover");
      }
    );
  }
  private startQbScramble(): void {
    // if no throw, QB becomes runner
    this.carrier = this.qb as ControlledPlayer;
    this.carrier.speedRating = 82;
    this.carrier.strengthRating = 70;
    this.carrier.btkRating = 72;
    this.carrier.stamina = 100;
    this.controller = new PlayerController(this, this.carrier);
    this.activePlay = { ...(this.activePlay as PlayDef), isRun: true };
    this.showMiniBanner("QB SCRAMBLE");
  }
  private updatePassRush(delta: number): void {
    // rush 3 defenders to QB
    for (let i = 0; i < 3; i++) {
      const r = this.defenders[i];
      const ang = Phaser.Math.Angle.Between(r.x, r.y, this.qb.x, this.qb.y);
      r.x += Math.cos(ang) * 1.8;
      r.y += Math.sin(ang) * 1.8;
      const dist = Phaser.Math.Distance.Between(r.x, r.y, this.qb.x, this.qb.y);
      if (dist < 30) {
        this.passerUnderPressure = true;
        this.qbPressureTimer += delta;
        this.flashQbPressure();
        if (this.qbPressureTimer > 500 && this.waitingForThrow) {
          this.waitingForThrow = false;
          this.stats.addPass(this.offenseTeamId, 0, false, false, false);
          this.endPlay("Sack", "sack");
        }
      }
    }
  }
  private updateReceiverOpenStates(): void {
    for (let i = 1; i <= 4; i++) {
      const sep = this.receiverSeparation(i);
      const icon = this.receiverIcons.find((r) => r.id === i);
      if (!icon) continue;
      const circle = icon.sprite.list[0] as Phaser.GameObjects.Arc;
      const color = sep > 30 ? 0x00ff66 : sep > 10 ? 0xffd84a : 0xff4d4d;
      circle.setFillStyle(color, 0.85);
      const wr = this.offensePlayers[i];
      icon.sprite.setPosition(wr.x, wr.y - 24);
    }
  }
  private receiverSeparation(receiverId: number): number {
    const wr = this.offensePlayers[receiverId];
    if (!wr) return 0;
    let min = Infinity;
    this.defenders.forEach((d) => {
      const dist = Phaser.Math.Distance.Between(wr.x, wr.y, d.x, d.y);
      if (dist < min) min = dist;
    });
    return min;
  }
  private isThrowLaneContested(x1: number, y1: number, x2: number, y2: number): boolean {
    // Point-to-segment distance check
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    for (const d of this.defenders) {
      let t = lenSq > 0 ? ((d.x - x1) * dx + (d.y - y1) * dy) / lenSq : 0;
      t = Math.max(0, Math.min(1, t));
      const cx = x1 + t * dx;
      const cy = y1 + t * dy;
      if (Phaser.Math.Distance.Between(d.x, d.y, cx, cy) < 26) return true;
    }
    return false;
  }
  private handleTackle(): void {
    this.playTackleFx();
    this.stats.addRush(this.offenseTeamId, Phaser.Math.Between(-1, 7), false, false);
    this.advanceDownAndDistance(Phaser.Math.Between(-1, 7));
    this.endPlay("Tackle", "normal");
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
    if (this.down > 4) {
      this.turnoverOnDowns();
    }
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
    const prevOff = this.offenseTeamId;
    this.offenseTeamId = this.defenseTeamId;
    this.defenseTeamId = prevOff;
  }
  private stopClockOnIncomplete(): void {
    // NFL-style stop
    // no decrement compensation needed since clock runs in update; next snap resumes naturally.
  }
  private endPassIncomplete(reason: string): void {
    this.stats.addPass(this.offenseTeamId, 0, false, false, false);
    this.stopClockOnIncomplete();
    this.endPlay(reason, "incomplete");
  }
  private endPlay(result: string, kind: "normal" | "first_down" | "turnover" | "incomplete" | "sack" | "penalty"): void {
    this.inPlay = false;
    this.preSnap = false;
    this.waitingForThrow = false;
    this.clearPlayArt();
    this.redrawField();
    this.showResultBanner(result, kind);
    // reset players around LOS for next snap
    this.time.delayedCall(700, () => {
      this.createTeams();
      this.startPreSnap();
      this.emitLiveStats();
    });
  }
  private handleQuarterEnd(): void {
    if (this.quarter >= 4) {
      this.showResultBanner("FINAL", "normal");
      this.inPlay = false;
      this.preSnap = false;
      return;
    }
    this.quarter += 1;
    this.gameClockMs = 15 * 60 * 1000;
    this.showResultBanner(`START Q${this.quarter}`, "normal");
  }
  // ---------------------------
  // Pre-snap toolbar / adjustments
  // ---------------------------
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
    // Choose receiver by clicking icon, then assign quick route
    this.showMiniBanner("HOT ROUTE: TAP WR ICON");
    this.hotRouteReceiverId = null;
    const menu = this.add.container(920, 430).setDepth(65);
    const bg = this.add.rectangle(0, 0, 250, 180, 0x111827, 0.96).setOrigin(0);
    menu.add(bg);
    const title = this.add.text(8, 8, "HOT ROUTE", { color: "#ffd700", fontSize: "14px", fontFamily: "system-ui" });
    menu.add(title);
    const routes = ["Go", "Slant", "Curl", "Out", "Flat", "Drag", "Post", "Corner"];
    routes.forEach((r, idx) => {
      const x = 10 + (idx % 2) * 118;
      const y = 30 + Math.floor(idx / 2) * 34;
      const b = this.add.rectangle(x, y, 110, 28, 0x374151, 0.95).setOrigin(0).setInteractive();
      const t = this.add.text(x + 8, y + 7, r, { color: "#ffffff", fontSize: "12px", fontFamily: "system-ui" });
      b.on("pointerdown", () => {
        if (this.hotRouteReceiverId == null) {
          this.showMiniBanner("SELECT RECEIVER FIRST");
          return;
        }
        this.applyHotRoute(this.hotRouteReceiverId, r);
        menu.destroy();
      });
      menu.add([b, t]);
    });
    menu.setData("role", "overlay");
    // click receiver icon to pick target
    this.receiverIcons.forEach((ic) => {
      ic.sprite.once("pointerdown", () => {
        this.hotRouteReceiverId = ic.id;
        this.showMiniBanner(`WR${ic.id} SELECTED`);
      });
    });
  }
  private applyHotRoute(receiverId: number, route: string): void {
    if (!this.activePlay) return;
    const rt = this.activePlay.routes.find((r) => r.playerId === receiverId);
    if (!rt) return;
    // Replace route nodes with simple presets
    const map: Record<string, { dx: number; dy: number }[]> = {
      Go: [{ dx: 170, dy: 0 }],
      Slant: [{ dx: 58, dy: receiverId <= 2 ? 30 : -30 }],
      Curl: [{ dx: 80, dy: 0 }, { dx: 58, dy: 0 }],
      Out: [{ dx: 70, dy: 0 }, { dx: 92, dy: receiverId <= 2 ? -24 : 24 }],
      Flat: [{ dx: 22, dy: receiverId <= 2 ? -35 : 35 }],
      Drag: [{ dx: 50, dy: receiverId <= 2 ? 45 : -45 }],
      Post: [{ dx: 78, dy: 0 }, { dx: 150, dy: receiverId <= 2 ? -50 : 50 }],
      Corner: [{ dx: 80, dy: 0 }, { dx: 155, dy: receiverId <= 2 ? 50 : -50 }],
    };
    rt.nodes = map[route] ?? rt.nodes;
    rt.isTarget = true;
    this.drawPlayArt(true);
    this.showMiniBanner(`HOT ROUTE: ${route.toUpperCase()}`);
  }
  private runMotion(): void {
    // Move selected WR across formation, reveal man/zone hint
    const wr = this.offensePlayers[4]; // move WR4 by default
    const startX = wr.x;
    const targetY = wr.y < FIELD.midY ? FIELD.midY + 90 : FIELD.midY - 90;
    this.tweens.add({
      targets: wr,
      y: targetY,
      duration: 1200,
      ease: "Sine.easeInOut",
      onComplete: () => {
        const man = Math.random() > 0.5;
        this.showMiniBanner(man ? "MAN!" : "ZONE!");
      },
    });
    // return near original lane before snap if needed
    this.time.delayedCall(1700, () => {
      this.tweens.add({ targets: wr, x: startX, duration: 500 });
    });
  }
  private openAudibleMenu(): void {
    if (!this.activePlay) return;
    const formation = NFL_PLAYBOOK.find((f) => f.id === this.activePlay?.formation.toLowerCase()) ?? NFL_PLAYBOOK[0];
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
  // ---------------------------
  // Play art / coverage visuals
  // ---------------------------
  private drawPlayArt(hotRoute = false): void {
    if (!this.activePlay) return;
    this.clearPlayArt();
    // Draw routes
    this.activePlay.routes.forEach((rt) => {
      const player = this.offensePlayers[rt.playerId];
      if (!player) return;
      const g = this.add.graphics().setDepth(18);
      const dots: Phaser.GameObjects.Arc[] = [];
      const color = hotRoute && rt.playerId === this.hotRouteReceiverId ? 0xffd700 : this.routeColor(rt);
      g.lineStyle(2, color, 0.95);
      let x = player.x;
      let y = player.y;
      g.moveTo(x, y);
      rt.nodes.forEach((n, i) => {
        const nx = x + n.dx;
        const ny = y + n.dy;
        g.lineTo(nx, ny);
        const dot = this.add.circle(nx, ny, 3, color, 0.95).setDepth(19);
        dots.push(dot);
        // little draw animation effect
        dot.setAlpha(0);
        this.tweens.add({ targets: dot, alpha: 1, duration: 250, delay: i * 90 });
        x = nx;
        y = ny;
      });
      g.strokePath();
      // WR number circles (1-4)
      if (rt.playerId >= 1 && rt.playerId <= 4) {
        const circle = this.add.circle(player.x, player.y - 18, 9, 0xffffff, 0.85).setDepth(20);
        const label = this.add.text(player.x - 3, player.y - 24, `${rt.playerId}`, { color: "#000000", fontSize: "11px", fontFamily: "system-ui" }).setDepth(21);
        dots.push(circle as unknown as Phaser.GameObjects.Arc);
        dots.push(label as unknown as Phaser.GameObjects.Arc);
      }
      this.routeDraws.push({ playerId: rt.playerId, graphics: g, dots });
    });
    // Simplified coverage display: zone boxes + man lines
    this.defenders.slice(0, 4).forEach((d, i) => {
      const zone = this.add.rectangle(d.x + 50, d.y, 90, 70, 0x60a5fa, 0.12).setDepth(16);
      const wr = this.offensePlayers[1 + (i % 4)];
      const line = this.add.graphics().setDepth(17).lineStyle(1, 0xfff4, 0.65);
      line.lineBetween(d.x, d.y, wr.x, wr.y);
      this.routeDraws.push({ playerId: 100 + i, graphics: line, dots: [zone as unknown as Phaser.GameObjects.Arc] });
    });
  }
  private clearPlayArt(): void {
    this.routeDraws.forEach((r) => {
      r.graphics.destroy();
      r.dots.forEach((d) => d.destroy());
    });
    this.routeDraws = [];
  }
  private routeColor(rt: { nodes: { dx: number; dy: number }[] }): number {
    // heuristic by first turn
    const n = rt.nodes[0];
    if (!n) return 0xffffff;
    if (Math.abs(n.dy) > 40 && Math.abs(n.dx) < 40) return 0x84cc16; // flat
    if (Math.abs(n.dy) > 20 && n.dx > 40) return 0x22d3ee; // slant-ish
    if (n.dx > 140 && Math.abs(n.dy) < 20) return 0xfacc15; // go
    if (n.dx > 70 && Math.abs(n.dy) < 10) return 0xffffff; // curl/dig
    return 0xa855f7; // drag/post/corner fallback
  }
  // ---------------------------
  // Effects / UI helpers
  // ---------------------------
  private showResultBanner(text: string, kind: "normal" | "first_down" | "turnover" | "incomplete" | "sack" | "penalty"): void {
    this.resultBanner?.destroy();
    const color =
      kind === "turnover" ? "#ff4d4d" :
      kind === "first_down" ? "#22c55e" :
      kind === "incomplete" ? "#9ca3af" :
      kind === "sack" ? "#fb923c" :
      kind === "penalty" ? "#f97316" : "#ffffff";
    const banner = this.add.text(640, 120, text.toUpperCase(), {
      color,
      fontSize: "40px",
      fontFamily: "system-ui",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(66).setScale(0);
    this.resultBanner = banner;
    this.tweens.add({
      targets: banner,
      scale: 1.2,
      duration: 100,
      yoyo: true,
      hold: 1500,
      onComplete: () => banner.destroy(),
    });
  }
  private showMiniBanner(msg: string): void {
    const t = this.add.text(640, 160, msg, {
      color: "#ffffff",
      fontSize: "20px",
      fontFamily: "system-ui",
      backgroundColor: "#111827",
      padding: { left: 10, right: 10, top: 4, bottom: 4 },
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
        targets: this.carrier,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 80,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          this.carrier.angle = 90;
          this.carrier.alpha = 0.75;
          this.time.delayedCall(220, () => {
            this.carrier.angle = 0;
            this.carrier.alpha = 1;
          });
        },
      });
    }
  }
  private flashQbPressure(): void {
    const ring = this.add.circle(this.qb.x, this.qb.y, 18, 0xff0000, 0.2).setDepth(30);
    this.tweens.add({ targets: ring, alpha: 0, scale: 1.5, duration: 180, onComplete: () => ring.destroy() });
  }
  private applyBurstBlur(): void {
    if (!this.blurOverlay || !this.controller) return;
    const burstLike = this.controller["speed"] > this.controller["maxSpeed"] * 0.95;
    const target = burstLike ? 0.08 : 0;
    this.blurOverlay.alpha = Phaser.Math.Linear(this.blurOverlay.alpha, target, 0.12);
  }
  private familyColor(family: string): number {
    switch (family) {
      case "shotgun": return 0x1d4ed8;
      case "iform": return 0x16a34a;
      case "pistol": return 0x0d9488;
      case "wildcat": return 0xf97316;
      case "goalline": return 0xdc2626;
      case "singleback": return 0x7c3aed;
      default: return 0x334155;
    }
  }
  private typeColor(type: string): number {
    switch (type) {
      case "run": return 0x14532d;
      case "pass": return 0x1e3a8a;
      case "option": return 0x92400e;
      case "special": return 0x7c2d12;
      default: return 0x374151;
    }
  }
  private pickWeather(): WeatherType {
    if (this.options.weatherRandom === false) return "Clear";
    const pool: WeatherType[] = ["Clear", "Rain", "Snow", "Wind", "Fog", "Cold"];
    return Phaser.Utils.Array.GetRandom(pool);
  }
  // ---------------------------
  // Stats output + scoreboard
  // ---------------------------
  private emitLiveStats(): void {
    const all = this.stats.getAll();
    const home = all[this.offenseTeamId] ?? Object.values(all)[0];
    const away = all[this.defenseTeamId] ?? Object.values(all)[1] ?? home;
    if (!home || !away) return;
    const payload: LiveBoxPayload = {
      homeTeam: this.offenseTeamId,
      awayTeam: this.defenseTeamId,
      homeScore: this.homeScore,
      awayScore: this.awayScore,
      quarter: this.quarter,
      clock: this.msToClock(this.gameClockMs),
      downDistance: `${this.down}${this.ordinal(this.down)} & ${this.distance}`,
      home: {
        passYds: home.passing.yards,
        rushYds: home.rushing.yards,
        totalYds: home.team.totalYards,
        firstDowns: home.team.firstDowns,
        turnovers: home.team.turnovers,
        thirdDown: `${home.team.thirdDownConv}/${home.team.thirdDownAtt}`,
        top: this.msToClock(home.team.timeOfPossessionMs),
      },
      away: {
        passYds: away.passing.yards,
        rushYds: away.rushing.yards,
        totalYds: away.team.totalYards,
        firstDowns: away.team.firstDowns,
        turnovers: away.team.turnovers,
        thirdDown: `${away.team.thirdDownConv}/${away.team.thirdDownAtt}`,
        top: this.msToClock(away.team.timeOfPossessionMs),
      },
    };
    window.dispatchEvent(new CustomEvent<LiveBoxPayload>("gridiron:stats", { detail: payload }));
  }
  private updateScoreboardText(): void {
    this.scoreboardText.setText(
      `${this.awayScore} ${this.defenseTeamId}   @   ${this.homeScore} ${this.offenseTeamId}   |   Q${this.quarter} ${this.msToClock(this.gameClockMs)}   |   ${this.down}${this.ordinal(this.down)} & ${this.distance}`
    );
    this.playClockText.setText(
      `${this.preSnap ? `PRESNAP ${Math.ceil(this.preSnapRemaining)}s` : this.inPlay ? "LIVE" : "DEAD"}   |   PLAY CLOCK ${Math.ceil(this.playClock)}`
    );
  }
  private toggleInCanvasBox(): void {
    if (this.inCanvasBox) {
      this.inCanvasBox.destroy();
      this.inCanvasBox = undefined;
      return;
    }
    const all = this.stats.getAll();
    const h = all[this.offenseTeamId] ?? Object.values(all)[0];
    const a = all[this.defenseTeamId] ?? Object.values(all)[1] ?? h;
    if (!h || !a) return;
    const bg = this.add.rectangle(640, 360, 700, 360, 0x000000, 0.78).setDepth(70);
    const txt = this.add.text(
      320,
      220,
      [
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
      ].join("\n"),
      { color: "#ffffff", fontSize: "22px", fontFamily: "system-ui" }
    ).setDepth(71);
    this.inCanvasBox = this.add.container(0, 0, [bg, txt]);
  }
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
    this.children.getAll().forEach((obj) => {
      if (obj.getData && obj.getData("role") === "overlay") obj.destroy();
    });
  }
  private cleanupTransient(): void {
    this.children.each((obj) => {
      const ttl = obj.getData?.("ttl") as number | undefined;
      if (ttl && ttl < this.time.now) obj.destroy();
    });
  }
}

// -------------------------------------------------------
// Public API consumed by GamePlayPage
// -------------------------------------------------------
import type { GameTeam } from "./teams";

export interface GameOverData {
  homeTeamId: string;
  homeTeamName: string;
  homeScore: number;
  awayTeamId: string;
  awayTeamName: string;
  awayScore: number;
  winnerName: string;
  winnerColor: number;
  league: string;
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
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
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

  // Listen for game-over event emitted by scene
  window.addEventListener("gridiron:gameover", (e: Event) => {
    const detail = (e as CustomEvent<GameOverData>).detail;
    onGameOver(detail);
  }, { once: true });

  return game;
}
