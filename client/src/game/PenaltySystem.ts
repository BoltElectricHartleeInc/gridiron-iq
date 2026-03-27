export type PenaltyType =
  | "false_start"
  | "offsides"
  | "holding"
  | "dpi"
  | "opi"
  | "roughing_passer"
  | "delay_of_game";

export interface Penalty {
  type: PenaltyType;
  yards: number;
  description: string;
  onOffense: boolean;
  automaticFirstDown: boolean;
  lossOfDown: boolean;
}

const DEFS: Record<PenaltyType, Penalty> = {
  false_start:     { type: "false_start",     yards: 5,  description: "False Start",                   onOffense: true,  automaticFirstDown: false, lossOfDown: false },
  offsides:        { type: "offsides",         yards: 5,  description: "Offsides",                      onOffense: false, automaticFirstDown: false, lossOfDown: false },
  holding:         { type: "holding",          yards: 10, description: "Holding",                       onOffense: true,  automaticFirstDown: false, lossOfDown: false },
  dpi:             { type: "dpi",              yards: 15, description: "Defensive Pass Interference",   onOffense: false, automaticFirstDown: true,  lossOfDown: false },
  opi:             { type: "opi",              yards: 10, description: "Offensive Pass Interference",   onOffense: true,  automaticFirstDown: false, lossOfDown: true  },
  roughing_passer: { type: "roughing_passer",  yards: 15, description: "Roughing the Passer",          onOffense: false, automaticFirstDown: true,  lossOfDown: false },
  delay_of_game:   { type: "delay_of_game",    yards: 5,  description: "Delay of Game",                onOffense: true,  automaticFirstDown: false, lossOfDown: false },
};

export class PenaltySystem {
  private pending: Penalty | null = null;
  private history: Penalty[] = [];

  checkFalseStart(tooEarly: boolean): Penalty | null {
    if (tooEarly && Math.random() < 0.88) return this.issue("false_start");
    return null;
  }

  checkOffsides(crossedLos: boolean): Penalty | null {
    if (crossedLos && Math.random() < 0.9) return this.issue("offsides");
    return null;
  }

  checkHolding(shedTooFast: boolean): Penalty | null {
    if (shedTooFast && Math.random() < 0.11) return this.issue("holding");
    return null;
  }

  checkDpi(contactBeforeBall: boolean): Penalty | null {
    if (contactBeforeBall && Math.random() < 0.55) return this.issue("dpi");
    return null;
  }

  checkRoughingPasser(hitAfterRelease: boolean): Penalty | null {
    if (hitAfterRelease && Math.random() < 0.65) return this.issue("roughing_passer");
    return null;
  }

  private issue(type: PenaltyType): Penalty {
    const p = { ...DEFS[type] };
    this.pending = p;
    this.history.push(p);
    return p;
  }

  consume(): Penalty | null {
    const p = this.pending;
    this.pending = null;
    return p;
  }

  hasPending(): boolean { return this.pending !== null; }
  getHistory(): Penalty[] { return this.history; }
}
