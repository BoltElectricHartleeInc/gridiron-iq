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

export class AIEngine {
  selectFormation(situation: GameSituation): Formation {
    const { down, distance, yardLine } = situation;
    if (yardLine >= 90) return NFL_PLAYBOOK.find(f => f.id === "goalline") ?? NFL_PLAYBOOK[0];
    if (down === 4 && distance > 8) return NFL_PLAYBOOK.find(f => f.id === "hailmary") ?? NFL_PLAYBOOK[0];
    if (down <= 2 && distance <= 3) return NFL_PLAYBOOK.find(f => f.id === "iform") ?? NFL_PLAYBOOK[0];
    return NFL_PLAYBOOK.find(f => f.id === "shotgun") ?? NFL_PLAYBOOK[0];
  }

  selectPlay(formation: Formation, situation: GameSituation): PlayDef {
    const { down, distance } = situation;
    const runPlays = formation.plays.filter(p => p.isRun);
    const passPlays = formation.plays.filter(p => !p.isRun);

    if (down === 4 && distance > 5 && passPlays.length > 0) {
      return passPlays[Math.floor(Math.random() * passPlays.length)];
    }
    const runBias = down <= 2 ? 0.5 : distance <= 4 ? 0.45 : 0.25;
    if (Math.random() < runBias && runPlays.length > 0) {
      return runPlays[Math.floor(Math.random() * runPlays.length)];
    }
    const pool = passPlays.length > 0 ? passPlays : formation.plays;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
