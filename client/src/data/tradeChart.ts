// Jimmy Johnson Draft Trade Value Chart
// Every pick 1-262 has a point value for trade calculations

const CHART: Record<number, number> = {
  1: 3000, 2: 2600, 3: 2200, 4: 1800, 5: 1700, 6: 1600, 7: 1500, 8: 1400, 9: 1350, 10: 1300,
  11: 1250, 12: 1200, 13: 1150, 14: 1100, 15: 1050, 16: 1000, 17: 950, 18: 900, 19: 875, 20: 850,
  21: 800, 22: 780, 23: 760, 24: 740, 25: 720, 26: 700, 27: 680, 28: 660, 29: 640, 30: 620,
  31: 600, 32: 590,
  33: 580, 34: 560, 35: 550, 36: 540, 37: 530, 38: 520, 39: 510, 40: 500,
  41: 490, 42: 480, 43: 470, 44: 460, 45: 450, 46: 440, 47: 430, 48: 420, 49: 410, 50: 400,
  51: 390, 52: 380, 53: 370, 54: 360, 55: 350, 56: 340, 57: 330, 58: 320, 59: 310, 60: 300,
  61: 292, 62: 284, 63: 276, 64: 270,
  65: 265, 66: 260, 67: 255, 68: 250, 69: 245, 70: 240,
  71: 235, 72: 230, 73: 225, 74: 220, 75: 215, 76: 210, 77: 205, 78: 200, 79: 195, 80: 190,
  81: 185, 82: 180, 83: 175, 84: 172, 85: 170, 86: 168, 87: 166, 88: 164, 89: 162, 90: 160,
  91: 158, 92: 156, 93: 154, 94: 152, 95: 150, 96: 148,
  97: 144, 98: 140, 99: 136, 100: 132, 101: 130, 102: 128, 103: 126, 104: 124, 105: 122, 106: 120,
  107: 118, 108: 116, 109: 114, 110: 112, 111: 110, 112: 108, 113: 106, 114: 104, 115: 102, 116: 100,
  117: 99, 118: 98, 119: 97, 120: 96, 121: 95, 122: 94, 123: 93, 124: 92, 125: 91, 126: 90,
  127: 89, 128: 88,
  129: 87, 130: 86, 131: 85, 132: 84, 133: 83, 134: 82, 135: 81, 136: 80, 137: 79, 138: 78,
  139: 77, 140: 76, 141: 75, 142: 74, 143: 73, 144: 72, 145: 71, 146: 70, 147: 69, 148: 68,
  149: 67, 150: 66, 151: 65, 152: 64, 153: 63, 154: 62, 155: 61, 156: 60, 157: 59, 158: 58,
  159: 57, 160: 56,
  161: 55, 162: 54, 163: 53, 164: 52, 165: 51, 166: 50, 167: 49, 168: 48, 169: 47, 170: 46,
  171: 45, 172: 44, 173: 43, 174: 42, 175: 41, 176: 40, 177: 39, 178: 38, 179: 37, 180: 36,
  181: 35, 182: 34, 183: 33, 184: 32, 185: 31, 186: 30, 187: 29, 188: 28, 189: 27, 190: 26,
  191: 25, 192: 24, 193: 23, 194: 22, 195: 21, 196: 20,
  197: 19, 198: 18, 199: 17, 200: 16, 201: 15, 202: 14, 203: 13, 204: 12, 205: 11, 206: 10,
  207: 9, 208: 8, 209: 7, 210: 6,
  211: 6, 212: 5, 213: 5, 214: 5, 215: 5, 216: 4, 217: 4, 218: 4, 219: 4, 220: 4,
  221: 3, 222: 3, 223: 3, 224: 3, 225: 3, 226: 3, 227: 3, 228: 3, 229: 3, 230: 3,
  231: 2, 232: 2, 233: 2, 234: 2, 235: 2, 236: 2, 237: 2, 238: 2, 239: 2, 240: 2,
  241: 1, 242: 1, 243: 1, 244: 1, 245: 1, 246: 1, 247: 1, 248: 1, 249: 1, 250: 1,
  251: 1, 252: 1, 253: 1, 254: 1, 255: 1, 256: 1, 257: 1, 258: 1, 259: 1, 260: 1,
  261: 1, 262: 1,
};

export function getPickValue(overall: number): number {
  return CHART[overall] ?? 1;
}

export function getPicksValue(picks: number[]): number {
  return picks.reduce((sum, pick) => sum + getPickValue(pick), 0);
}

export function isTradeReasonable(
  offeringPicks: number[],
  receivingPicks: number[],
  tolerance = 0.1
): boolean {
  const offeringValue = getPicksValue(offeringPicks);
  const receivingValue = getPicksValue(receivingPicks);
  const diff = Math.abs(offeringValue - receivingValue) / Math.max(offeringValue, receivingValue);
  return diff <= tolerance;
}

export function findFairReturn(pickNumber: number, availablePicks: number[]): number[] {
  const target = getPickValue(pickNumber);
  const tolerance = target * 0.15;

  // Try single pick first
  for (const p of availablePicks) {
    if (Math.abs(getPickValue(p) - target) <= tolerance) return [p];
  }

  // Try 2-pick combinations
  for (let i = 0; i < availablePicks.length; i++) {
    for (let j = i + 1; j < availablePicks.length; j++) {
      const combo = getPickValue(availablePicks[i]) + getPickValue(availablePicks[j]);
      if (Math.abs(combo - target) <= tolerance) return [availablePicks[i], availablePicks[j]];
    }
  }

  return [];
}
