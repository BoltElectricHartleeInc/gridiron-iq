/**
 * VirtualInput — shared singleton bridge between the on-screen controller
 * (React) and the Phaser game engine. Zero dependencies, zero DOM events.
 */
export const virtualInput = {
  // Analog stick output (-1 to 1 each axis). Set continuously while held.
  dx: 0,
  dy: 0,
  sprint: false,

  // One-shot actions — set true by controller, consumed (reset to false) by game.
  _juke:      false,
  _spin:      false,
  _stiffArm:  false,
  _snap:      false,
  _throwAway: false,
  _throw:     [false, false, false, false] as [boolean,boolean,boolean,boolean],
  _punt:      false,
  _fg:        false,
  _fairCatch: false,

  consumeJuke()      { const v = this._juke;      this._juke      = false; return v; },
  consumeSpin()      { const v = this._spin;      this._spin      = false; return v; },
  consumeStiffArm()  { const v = this._stiffArm;  this._stiffArm  = false; return v; },
  consumeSnap()      { const v = this._snap;      this._snap      = false; return v; },
  consumeThrowAway() { const v = this._throwAway; this._throwAway = false; return v; },
  consumeThrow(i: 0|1|2|3) { const v = this._throw[i]; this._throw[i] = false; return v; },
  consumePunt()      { const v = this._punt;      this._punt      = false; return v; },
  consumeFG()        { const v = this._fg;        this._fg        = false; return v; },
  consumeFairCatch() { const v = this._fairCatch; this._fairCatch = false; return v; },
};
