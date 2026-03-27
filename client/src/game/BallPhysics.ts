import Phaser from "phaser";

type ThrowPower = "bullet" | "touch" | "lob";

export class BallPhysics {
  private scene: Phaser.Scene;
  private ballGraphic?: Phaser.GameObjects.Ellipse;
  private trail: Phaser.GameObjects.Arc[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  throwBall(
    fromX: number, fromY: number,
    toX: number, toY: number,
    power: ThrowPower,
    accuracy: number,
    _throwOnRun: boolean,
    onCatch: () => void,
    onIncomplete: () => void,
    onInterception: () => void,
  ): void {
    this.clearBall();

    // Apply accuracy scatter
    const scatter = (100 - accuracy) * 0.6;
    const tx = toX + Phaser.Math.FloatBetween(-scatter, scatter);
    const ty = toY + Phaser.Math.FloatBetween(-scatter * 0.5, scatter * 0.5);

    // Duration by power type
    const duration = power === "bullet" ? 280 : power === "touch" ? 420 : 600;

    // Create ball
    const ball = this.scene.add.ellipse(fromX, fromY, 14, 10, 0xc8a05a).setDepth(25);
    this.ballGraphic = ball;

    // Arc height
    const arcHeight = power === "lob" ? -120 : power === "touch" ? -70 : -35;
    const midX = (fromX + tx) / 2;
    const midY = (fromY + ty) / 2 + arcHeight;

    // Trail dots
    const trailCount = 6;
    for (let i = 0; i < trailCount; i++) {
      const dot = this.scene.add.circle(fromX, fromY, 3, 0xffd084, 0.5 - i * 0.07).setDepth(24);
      this.trail.push(dot);
    }

    // Spin animation
    this.scene.tweens.add({
      targets: ball,
      angle: 360,
      duration: duration,
      repeat: 0,
    });

    // Path tween via two-segment (from → mid → to)
    let progress = 0;
    const totalSteps = 40;
    const timer = this.scene.time.addEvent({
      delay: duration / totalSteps,
      repeat: totalSteps - 1,
      callback: () => {
        progress += 1 / totalSteps;
        const t = progress;
        // Quadratic bezier
        const bx = (1 - t) * (1 - t) * fromX + 2 * (1 - t) * t * midX + t * t * tx;
        const by = (1 - t) * (1 - t) * fromY + 2 * (1 - t) * t * midY + t * t * ty;
        ball.setPosition(bx, by);

        // Update trail
        this.trail.forEach((dot, i) => {
          const tp = Math.max(0, progress - (i + 1) * (0.8 / totalSteps));
          const dbx = (1 - tp) * (1 - tp) * fromX + 2 * (1 - tp) * tp * midX + tp * tp * tx;
          const dby = (1 - tp) * (1 - tp) * fromY + 2 * (1 - tp) * tp * midY + tp * tp * ty;
          dot.setPosition(dbx, dby);
        });

        if (progress >= 1) {
          timer.remove();
          this.clearBall();
          this.resolveThrow(accuracy, onCatch, onIncomplete, onInterception);
        }
      },
    });
  }

  private resolveThrow(
    accuracy: number,
    onCatch: () => void,
    onIncomplete: () => void,
    onInterception: () => void,
  ): void {
    const catchRoll = Math.random() * 100;
    const intRoll = Math.random();
    const intChance = this.scene.registry.get("throwIntChance") as number ?? 0.08;
    const catchChance = this.scene.registry.get("catchChance") as number ?? 0.72;

    if (intRoll < intChance) {
      onInterception();
    } else if (catchRoll < accuracy * catchChance) {
      onCatch();
    } else {
      onIncomplete();
    }
  }

  kickBall(fromX: number, fromY: number, toX: number, toY: number, onLand: () => void): void {
    this.clearBall();
    const ball = this.scene.add.ellipse(fromX, fromY, 12, 9, 0xc8a05a).setDepth(25);
    this.ballGraphic = ball;
    this.scene.tweens.add({
      targets: ball,
      x: toX,
      y: toY,
      duration: 800,
      ease: "Sine.easeOut",
      onComplete: () => {
        this.clearBall();
        onLand();
      },
    });
  }

  private clearBall(): void {
    this.ballGraphic?.destroy();
    this.ballGraphic = undefined;
    this.trail.forEach(d => d.destroy());
    this.trail = [];
  }
}
