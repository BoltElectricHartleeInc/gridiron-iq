import Phaser from "phaser";
import type { PlayDef, Formation } from "./Playbook";
import { NFL_PLAYBOOK } from "./Playbook";

interface GameSituation {
  down: number;
  distance: number;
  yardLine: number;
  quarter: number;
  scoreDiff: number;
  timeLeftMs: number;
}

export interface DefAI {
  x: number;
  y: number;
  speedRating: number;
  tackleRating: number;
  role: "DL" | "LB" | "CB" | "S";
  /** Outside contain rusher — holds edge, doesn't chase inside */
  isContain: boolean;
  /** Zone holder — waits in zone until receiver enters */
  zoneX: number;
  zoneY: number;
  /** Once pursuit triggered, aim at intercept point */
  inPursuit: boolean;
  /** Velocity output — written each update for use by caller */
  velX: number;
  velY: number;
}

export class AIEngine {
  // ── Formation / play selection ────────────────────────────────────────
  selectFormation(sit: GameSituation): Formation {
    const { down, distance, yardLine, scoreDiff, timeLeftMs } = sit;
    if (yardLine >= 92) return this.find("goalline");
    if (down === 4 && distance > 8) return this.find("hailmary");
    if (down <= 2 && distance <= 2) return this.find("iform");
    if (down === 3 && distance >= 7) return this.find("shotgun");
    if (scoreDiff < -14 && timeLeftMs < 5 * 60 * 1000) return this.find("shotgun");
    if (yardLine >= 75 && down <= 2) return this.find("iform");
    return this.find("shotgun");
  }

  selectPlay(formation: Formation, sit: GameSituation): PlayDef {
    const { down, distance, yardLine, scoreDiff, timeLeftMs } = sit;
    const runs = formation.plays.filter(p => p.isRun);
    const passes = formation.plays.filter(p => !p.isRun);
    const pool = (arr: PlayDef[]) => arr[Math.floor(Math.random() * arr.length)];

    // 4th down
    if (down === 4) {
      return distance > 5 && passes.length ? pool(passes) : (runs.length ? pool(runs) : pool(formation.plays));
    }
    // 2-min drill
    if (timeLeftMs < 2 * 60 * 1000 && scoreDiff < 0 && passes.length) return pool(passes);
    // Short yardage run
    if (distance <= 2 && runs.length && Math.random() < 0.72) return pool(runs);
    // Red zone run tendency
    if (yardLine >= 88 && runs.length && Math.random() < 0.55) return pool(runs);

    const runBias = down <= 2 ? 0.46 : distance <= 4 ? 0.4 : 0.24;
    if (Math.random() < runBias && runs.length) return pool(runs);
    return passes.length ? pool(passes) : pool(formation.plays);
  }

  // ── Defensive AI ─────────────────────────────────────────────────────

  /**
   * Update a single defender's position using proper pursuit angles.
   * Contain rushers hold edge leverage.
   * Zone defenders wait in their zone until carrier enters range.
   */
  updateDefender(
    def: DefAI,
    carrierX: number,
    carrierY: number,
    carrierVelX: number,
    carrierVelY: number,
    delta: number,
  ): void {
    const speed = (1.35 + (def.speedRating - 70) * 0.026) * (delta / 16.67);

    if (def.isContain) {
      // Contain: mirror carrier's Y while staying outside (+X)
      const targX = carrierX + 18;
      const targY = Phaser.Math.Clamp(carrierY, def.y - 30, def.y + 30);
      const ang = Phaser.Math.Angle.Between(def.x, def.y, targX, targY);
      def.x += Math.cos(ang) * speed;
      def.y += Math.sin(ang) * speed;
      def.velX = Math.cos(ang) * speed;
      def.velY = Math.sin(ang) * speed;
      return;
    }

    const distToCarrier = Phaser.Math.Distance.Between(def.x, def.y, carrierX, carrierY);

    if (!def.inPursuit) {
      // Zone: drift to zone center
      const dToZone = Phaser.Math.Distance.Between(def.x, def.y, def.zoneX, def.zoneY);
      if (dToZone > 6) {
        const ang = Phaser.Math.Angle.Between(def.x, def.y, def.zoneX, def.zoneY);
        def.x += Math.cos(ang) * speed * 0.55;
        def.y += Math.sin(ang) * speed * 0.55;
        def.velX = Math.cos(ang) * speed * 0.55;
        def.velY = Math.sin(ang) * speed * 0.55;
      }
      // Trigger pursuit when carrier enters zone radius
      if (distToCarrier < 90) def.inPursuit = true;
      return;
    }

    // Pursuit: intercept point calculation (3-iteration refinement)
    const intercept = this.interceptPoint(def.x, def.y, speed, carrierX, carrierY, carrierVelX, carrierVelY);
    const ang = Phaser.Math.Angle.Between(def.x, def.y, intercept.x, intercept.y);
    def.x += Math.cos(ang) * speed;
    def.y += Math.sin(ang) * speed;
    def.velX = Math.cos(ang) * speed;
    def.velY = Math.sin(ang) * speed;
  }

  private interceptPoint(
    defX: number, defY: number, defSpeed: number,
    carrX: number, carrY: number, carrVx: number, carrVy: number,
  ): { x: number; y: number } {
    const dist = Phaser.Math.Distance.Between(defX, defY, carrX, carrY);
    let tEst = dist / (Math.max(defSpeed, 0.1) * 60);
    for (let i = 0; i < 3; i++) {
      const fx = carrX + carrVx * tEst * 30;
      const fy = carrY + carrVy * tEst * 30;
      const d2 = Phaser.Math.Distance.Between(defX, defY, fx, fy);
      tEst = d2 / (Math.max(defSpeed, 0.1) * 60);
    }
    return { x: carrX + carrVx * tEst * 30, y: carrY + carrVy * tEst * 30 };
  }

  private find(id: string): Formation {
    return NFL_PLAYBOOK.find(f => f.id === id) ?? NFL_PLAYBOOK[0];
  }
}
