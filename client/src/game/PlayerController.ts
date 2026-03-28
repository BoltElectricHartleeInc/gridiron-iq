import Phaser from "phaser";
import { virtualInput } from './VirtualInput';

export interface ControlledPlayer extends Phaser.GameObjects.Container {
  speedRating: number;
  strengthRating: number;
  btkRating: number;
  stamina: number;
  velX: number;
  velY: number;
}

export interface Defender extends Phaser.GameObjects.Container {
  tackleRating: number;
  speedRating: number;
  /** Set true by BlockingEngine when this defender is engaged */
  blocked: boolean;
  velX: number;
  velY: number;
}

export class PlayerController {
  private scene: Phaser.Scene;
  private player: ControlledPlayer;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private speed = 0;
  private maxSpeed: number;

  // Move state
  private juking = false;
  private spinning = false;
  private stiffArming = false;
  private jukeDir = 0;

  // Keys
  private zKey: Phaser.Input.Keyboard.Key;
  private xKey: Phaser.Input.Keyboard.Key;
  private cKey: Phaser.Input.Keyboard.Key;
  private shiftKey: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, player: ControlledPlayer) {
    this.scene = scene;
    this.player = player;
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.maxSpeed = 2.1 + (player.speedRating - 70) * 0.046;
    this.zKey = scene.input.keyboard!.addKey("Z");
    this.xKey = scene.input.keyboard!.addKey("X");
    this.cKey = scene.input.keyboard!.addKey("C");
    this.shiftKey = scene.input.keyboard!.addKey("SHIFT");
    player.velX = 0;
    player.velY = 0;
  }

  update(delta: number): void {
    const scale = delta / 16.67;
    let dx = 0, dy = 0;

    // Keyboard
    if (this.cursors.right?.isDown) dx = 1;
    else if (this.cursors.left?.isDown) dx = -0.55;
    if (this.cursors.up?.isDown) dy = -1;
    else if (this.cursors.down?.isDown) dy = 1;

    // Virtual (on-screen controller) — overrides keyboard if stick is active
    if (Math.abs(virtualInput.dx) > 0.05 || Math.abs(virtualInput.dy) > 0.05) {
      dx = virtualInput.dx;
      dy = virtualInput.dy;
    }

    const sprint = (this.shiftKey.isDown || virtualInput.sprint) && this.player.stamina > 0;
    const sprintMult = sprint ? 1.52 : 1;
    if (sprint) this.player.stamina = Math.max(0, this.player.stamina - 0.28);

    const accel = 0.19;
    const friction = 0.875;
    const targetSpeed = Math.hypot(dx, dy) * this.maxSpeed * sprintMult * scale;
    this.speed = Phaser.Math.Linear(this.speed, targetSpeed, accel);
    this.speed *= friction;

    if (Math.hypot(dx, dy) > 0.01) {
      const ang = Math.atan2(dy, dx);
      const mx = Math.cos(ang) * this.speed;
      const my = Math.sin(ang) * this.speed;
      this.player.x += mx;
      this.player.y += my;
      this.player.velX = mx;
      this.player.velY = my;
    } else {
      this.player.velX *= 0.78;
      this.player.velY *= 0.78;
    }

    // Special moves — keyboard or virtual controller
    if (Phaser.Input.Keyboard.JustDown(this.zKey) || virtualInput.consumeJuke())     this.doJuke();
    if (Phaser.Input.Keyboard.JustDown(this.xKey) || virtualInput.consumeSpin())     this.doSpin();
    if (Phaser.Input.Keyboard.JustDown(this.cKey) || virtualInput.consumeStiffArm()) this.doStiffArm();
  }

  private doJuke(): void {
    if (this.juking) return;
    this.juking = true;
    const btk = this.player.btkRating / 99;
    const dir = Math.random() > 0.5 ? 1 : -1;
    this.jukeDir = dir;
    const dist = 18 + btk * 14;
    this.scene.tweens.add({
      targets: this.player,
      y: this.player.y + dir * dist,
      duration: 95 + (1 - btk) * 65,
      yoyo: true,
      ease: "Sine.easeOut",
      onComplete: () => { this.juking = false; this.jukeDir = 0; },
    });
  }

  private doSpin(): void {
    if (this.spinning) return;
    this.spinning = true;
    const str = this.player.strengthRating / 99;
    this.scene.tweens.add({
      targets: this.player,
      angle: this.player.angle + 360,
      duration: 230 + (1 - str) * 130,
      ease: "Quad.easeOut",
      onComplete: () => { this.spinning = false; },
    });
  }

  private doStiffArm(): void {
    if (this.stiffArming) return;
    this.stiffArming = true;
    this.scene.tweens.add({
      targets: this.player,
      scaleX: 1.55,
      duration: 65,
      yoyo: true,
      onComplete: () => { this.stiffArming = false; },
    });
  }

  isJuking(): boolean { return this.juking; }
  isSpinning(): boolean { return this.spinning; }
  isStiffArming(): boolean { return this.stiffArming; }
  getJukeDir(): number { return this.jukeDir; }
  getCurrentSpeed(): number { return this.speed; }

  /**
   * Move all defenders using pursuit angles & tackle cone detection.
   * Blocked defenders skip tackling.
   * Returns {tackled, penaltyRough} each frame.
   */
  updateDefenders(defenders: Defender[]): { tackled: boolean; penaltyRough: boolean } {
    const cx = this.player.x;
    const cy = this.player.y;
    const cvx = this.player.velX;
    const cvy = this.player.velY;

    for (const d of defenders) {
      if (d.blocked) {
        // Blocked defender: slow drift, no tackle
        d.velX = 0;
        d.velY = 0;
        continue;
      }

      const defSpeed = 1.4 + (d.speedRating - 70) * 0.026;

      // Pursuit intercept point
      const dist = Phaser.Math.Distance.Between(d.x, d.y, cx, cy);
      const tEst = dist / (defSpeed * 60);
      const futX = cx + cvx * tEst * 28;
      const futY = cy + cvy * tEst * 28;
      const ang = Phaser.Math.Angle.Between(d.x, d.y, futX, futY);
      d.x += Math.cos(ang) * defSpeed;
      d.y += Math.sin(ang) * defSpeed;
      d.velX = Math.cos(ang) * defSpeed;
      d.velY = Math.sin(ang) * defSpeed;

      // Tackle cone: defender must be within ~130° arc facing carrier
      if (dist < 15) {
        const toCarrierAng = Phaser.Math.Angle.Between(d.x, d.y, cx, cy);
        const defFacing = Math.atan2(d.velY, d.velX);
        const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(toCarrierAng - defFacing));

        if (angleDiff < Math.PI * 0.72) {
          const base = (d.tackleRating / 99) * 0.84;
          const jukeReduct = this.juking ? 0.45 : 1;
          const spinReduct = this.spinning ? 0.68 : 1;
          if (this.stiffArming && Math.random() < 0.48) continue; // stiff arm breaks attempt
          if (Math.random() < base * jukeReduct * spinReduct) {
            return { tackled: true, penaltyRough: false };
          }
        }
      }
    }
    return { tackled: false, penaltyRough: false };
  }
}
