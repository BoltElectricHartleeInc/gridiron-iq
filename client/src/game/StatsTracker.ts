interface PassStats { attempts: number; completions: number; yards: number; tds: number; ints: number }
interface RushStats { attempts: number; yards: number; tds: number; fumbles: number }
interface TeamStats {
  firstDowns: number;
  totalYards: number;
  turnovers: number;
  thirdDownAtt: number;
  thirdDownConv: number;
  timeOfPossessionMs: number;
}
export interface TeamBoxScore {
  passing: PassStats;
  rushing: RushStats;
  team: TeamStats;
}

export class StatsTracker {
  private data: Record<string, TeamBoxScore> = {};

  constructor(...teamIds: string[]) {
    teamIds.forEach((id) => this.initTeam(id));
  }

  private initTeam(id: string): void {
    this.data[id] = {
      passing: { attempts: 0, completions: 0, yards: 0, tds: 0, ints: 0 },
      rushing: { attempts: 0, yards: 0, tds: 0, fumbles: 0 },
      team: { firstDowns: 0, totalYards: 0, turnovers: 0, thirdDownAtt: 0, thirdDownConv: 0, timeOfPossessionMs: 0 },
    };
  }

  get(teamId: string): TeamBoxScore {
    if (!this.data[teamId]) this.initTeam(teamId);
    return this.data[teamId];
  }

  getAll(): Record<string, TeamBoxScore> {
    return this.data;
  }

  addPass(teamId: string, yards: number, complete: boolean, _fumble: boolean, int: boolean): void {
    const t = this.get(teamId);
    t.passing.attempts += 1;
    if (complete) { t.passing.completions += 1; t.passing.yards += yards; }
    if (int) { t.passing.ints += 1; t.team.turnovers += 1; }
    t.team.totalYards = t.passing.yards + t.rushing.yards;
  }

  addRush(teamId: string, yards: number, _td: boolean, fumble: boolean): void {
    const t = this.get(teamId);
    t.rushing.attempts += 1;
    t.rushing.yards += Math.max(-10, yards);
    if (fumble) { t.rushing.fumbles += 1; t.team.turnovers += 1; }
    t.team.totalYards = t.passing.yards + t.rushing.yards;
  }

  addTOP(teamId: string, ms: number): void {
    this.get(teamId).team.timeOfPossessionMs += ms;
  }
}
