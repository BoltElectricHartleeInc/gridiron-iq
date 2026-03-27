import Phaser from "phaser";

export interface Blocker extends Phaser.GameObjects.Container {
  blockRating: number;
  blockTarget: Rusher | null;
  engaged: boolean;
  engageTimer: number;
}

export interface Rusher extends Phaser.GameObjects.Container {
  rushRating: number;
  shedTimer: number;
  blockedBy: Blocker | null;
}

const ENGAGE_DIST = 24;
// Chance per ms that rusher sheds the block (scaled by rating ratio)
const SHED_BASE = 0.00016;

export class BlockingEngine {
  private scene: Phaser.Scene;
  private blockers: Blocker[] = [];
  private rushers: Rusher[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  register(blockers: Blocker[], rushers: Rusher[]): void {
    this.blockers = blockers;
    this.rushers = rushers;
    // Reset state
    for (const b of blockers) { b.blockTarget = null; b.engaged = false; b.engageTimer = 0; }
    for (const r of rushers) { r.blockedBy = null; r.shedTimer = 0; }
    this.assignBlocks();
  }

  private assignBlocks(): void {
    const taken = new Set<number>();
    for (const b of this.blockers) {
      let nearestIdx = -1;
      let nearDist = Infinity;
      this.rushers.forEach((r, ri) => {
        if (taken.has(ri)) return;
        const d = Phaser.Math.Distance.Between(b.x, b.y, r.x, r.y);
        if (d < nearDist) { nearDist = d; nearestIdx = ri; }
      });
      if (nearestIdx >= 0) {
        const nearest = this.rushers[nearestIdx];
        taken.add(nearestIdx);
        b.blockTarget = nearest;
        nearest.blockedBy = b;
      }
    }
  }

  update(delta: number): void {
    for (const b of this.blockers) {
      if (!b.blockTarget) continue;
      const r = b.blockTarget;
      const dist = Phaser.Math.Distance.Between(b.x, b.y, r.x, r.y);

      if (!b.engaged) {
        if (dist > ENGAGE_DIST) {
          const ang = Phaser.Math.Angle.Between(b.x, b.y, r.x, r.y);
          b.x += Math.cos(ang) * 1.5;
          b.y += Math.sin(ang) * 1.5;
        } else {
          b.engaged = true;
          b.engageTimer = 0;
          r.blockedBy = b;
        }
      } else {
        b.engageTimer += delta;
        // Shed check: rushRating vs blockRating
        const shedChance = SHED_BASE * (r.rushRating / b.blockRating) * delta;
        if (Math.random() < shedChance) {
          b.engaged = false;
          b.blockTarget = null;
          r.blockedBy = null;
        } else {
          // Keep rusher in place — blocker absorbs the push
          r.x = Phaser.Math.Linear(r.x, b.x + 12, 0.06);
          r.y = Phaser.Math.Linear(r.y, b.y, 0.04);
        }
      }
    }
  }

  isBlocked(r: Rusher): boolean {
    return r.blockedBy !== null && r.blockedBy.engaged;
  }

  /** 0 = path stuffed, 1 = wide open lane */
  getLaneQuality(targetX: number, targetY: number): number {
    const freeRushers = this.rushers.filter(r => !this.isBlocked(r));
    if (freeRushers.length === 0) return 1;
    const nearLane = freeRushers.filter(r =>
      Phaser.Math.Distance.Between(r.x, r.y, targetX, targetY) < 65
    );
    return Math.max(0.1, 1 - (nearLane.length / this.rushers.length) * 0.85);
  }

  reset(): void {
    this.blockers = [];
    this.rushers = [];
  }
}
