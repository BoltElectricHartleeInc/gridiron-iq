import Phaser from "phaser";

export interface ControlledPlayer extends Phaser.GameObjects.Container {
  speedRating: number;
  strengthRating: number;
  btkRating: number;
  stamina: number;
}

export interface Defender extends Phaser.GameObjects.Container {
  tackleRating: number;
  speedRating: number;
}

export class PlayerController {
  private scene: Phaser.Scene;
  private player: ControlledPlayer;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private speed = 0;
  private maxSpeed: number;
  private isBursting = false;
  private staminaDrain = 0;

  constructor(scene: Phaser.Scene, player: ControlledPlayer) {
    this.scene = scene;
    this.player = player;
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.maxSpeed = 2.2 + (player.speedRating - 70) * 0.04;
  }

  update(_delta: number): void {
    const accel = 0.18;
    const friction = 0.88;
    let vx = 0;
    let vy = 0;

    if (this.cursors.right?.isDown) vx = 1;
    else if (this.cursors.left?.isDown) vx = -0.5;
    if (this.cursors.up?.isDown) vy = -1;
    else if (this.cursors.down?.isDown) vy = 1;

    // Sprint (shift)
    const shift = this.scene.input.keyboard?.addKey("SHIFT");
    const sprint = shift?.isDown && this.player.stamina > 0;
    const sprintMult = sprint ? 1.45 : 1;
    if (sprint) {
      this.player.stamina = Math.max(0, this.player.stamina - 0.4);
      this.staminaDrain += 1;
    }

    const targetSpeed = Math.hypot(vx, vy) * this.maxSpeed * sprintMult;
    this.speed = Phaser.Math.Linear(this.speed, targetSpeed, accel);
    this.speed *= friction;

    if (Math.hypot(vx, vy) > 0) {
      const ang = Math.atan2(vy, vx);
      this.player.x += Math.cos(ang) * this.speed;
      this.player.y += Math.sin(ang) * this.speed;
    }

    // Juke — Z key
    const zKey = this.scene.input.keyboard?.addKey("Z");
    if (Phaser.Input.Keyboard.JustDown(zKey!)) {
      this.doJuke();
    }

    // Spin — X key
    const xKey = this.scene.input.keyboard?.addKey("X");
    if (Phaser.Input.Keyboard.JustDown(xKey!)) {
      this.doSpin();
    }

    // Stiff arm — C key
    const cKey = this.scene.input.keyboard?.addKey("C");
    if (Phaser.Input.Keyboard.JustDown(cKey!)) {
      this.doStiffArm();
    }
  }

  private doJuke(): void {
    const dir = Math.random() > 0.5 ? -18 : 18;
    this.scene.tweens.add({
      targets: this.player,
      y: this.player.y + dir,
      duration: 120,
      yoyo: true,
      ease: "Sine.easeOut",
    });
  }

  private doSpin(): void {
    this.scene.tweens.add({
      targets: this.player,
      angle: this.player.angle + 360,
      duration: 280,
      ease: "Quad.easeOut",
    });
  }

  private doStiffArm(): void {
    this.scene.tweens.add({
      targets: this.player,
      scaleX: 1.4,
      duration: 80,
      yoyo: true,
    });
  }

  updateDefenders(defenders: Defender[]): { tackled: boolean } {
    for (const d of defenders) {
      // AI pursuit
      const ang = Phaser.Math.Angle.Between(d.x, d.y, this.player.x, this.player.y);
      const defSpeed = 1.4 + (d.speedRating - 70) * 0.025;
      d.x += Math.cos(ang) * defSpeed;
      d.y += Math.sin(ang) * defSpeed;

      const dist = Phaser.Math.Distance.Between(d.x, d.y, this.player.x, this.player.y);
      if (dist < 14) {
        const tackleChance = (d.tackleRating / 99) * 0.75;
        if (Math.random() < tackleChance) return { tackled: true };
      }
    }
    return { tackled: false };
  }
}
