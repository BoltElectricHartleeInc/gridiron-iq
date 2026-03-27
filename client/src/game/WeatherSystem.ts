import Phaser from "phaser";

export type WeatherType = "Clear" | "Rain" | "Snow" | "Wind" | "Fog" | "Cold";

export class WeatherSystem {
  private scene: Phaser.Scene;
  private type: WeatherType;
  private particles: Phaser.GameObjects.Graphics[] = [];
  private windX = 0;
  private windY = 0;

  constructor(scene: Phaser.Scene, type: WeatherType) {
    this.scene = scene;
    this.type = type;
    if (type === "Wind") {
      this.windX = Phaser.Math.FloatBetween(-12, 12);
      this.windY = Phaser.Math.FloatBetween(-4, 4);
    }
  }

  create(): void {
    if (this.type === "Clear" || this.type === "Cold") return;
    const overlay = this.scene.add.rectangle(640, 360, 1280, 720,
      this.type === "Fog" ? 0xaaaaaa : 0x001133, 
      this.type === "Fog" ? 0.18 : 0.08
    ).setDepth(8);
    this.particles.push(overlay as unknown as Phaser.GameObjects.Graphics);

    if (this.type === "Rain") this.spawnRain();
    if (this.type === "Snow") this.spawnSnow();
  }

  update(): void {
    // Particles animate via tweens; nothing per-frame needed
  }

  applyWind(x: number, y: number): { x: number; y: number } {
    return { x: x + this.windX, y: y + this.windY };
  }

  private spawnRain(): void {
    for (let i = 0; i < 80; i++) {
      const g = this.scene.add.graphics().setDepth(9);
      const rx = Phaser.Math.Between(0, 1280);
      const ry = Phaser.Math.Between(-50, 720);
      g.lineStyle(1, 0x88aaff, 0.5);
      g.lineBetween(rx, ry, rx - 2, ry + 14);
      this.scene.tweens.add({
        targets: g,
        y: 720,
        x: g.x - 8,
        duration: Phaser.Math.Between(400, 700),
        repeat: -1,
        onRepeat: () => {
          g.setPosition(Phaser.Math.Between(0, 1280), -20);
        },
      });
      this.particles.push(g);
    }
  }

  private spawnSnow(): void {
    for (let i = 0; i < 60; i++) {
      const circle = this.scene.add.circle(
        Phaser.Math.Between(0, 1280),
        Phaser.Math.Between(-20, 720),
        Phaser.Math.Between(2, 4),
        0xffffff,
        0.7
      ).setDepth(9);
      this.scene.tweens.add({
        targets: circle,
        y: 740,
        x: circle.x + Phaser.Math.Between(-20, 20),
        duration: Phaser.Math.Between(2000, 4000),
        repeat: -1,
        onRepeat: () => {
          circle.setPosition(Phaser.Math.Between(0, 1280), -10);
        },
      });
      this.particles.push(circle as unknown as Phaser.GameObjects.Graphics);
    }
  }
}
