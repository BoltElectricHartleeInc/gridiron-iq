/**
 * GameController — on-screen touch/mouse controller overlay for GridironIQ.
 * Sits on top of the Phaser canvas. Communicates via VirtualInput singleton.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { virtualInput } from '../../game/VirtualInput';
import { PlayPhase } from '../../game/FootballGame';

type PhaseInfo = {
  phase: string;
  down: number;
  distance: number;
  yardLine: number;
};

// ─── Joystick ─────────────────────────────────────────────────────────────────

const STICK_RADIUS = 52;   // outer ring radius
const KNOB_RADIUS  = 22;   // draggable knob radius
const DEAD_ZONE    = 0.12; // ignore tiny movements

function Joystick({ onMove }: { onMove: (dx: number, dy: number) => void }) {
  const baseRef  = useRef<HTMLDivElement>(null);
  const knobRef  = useRef<HTMLDivElement>(null);
  const active   = useRef(false);
  const originX  = useRef(0);
  const originY  = useRef(0);

  const setKnob = (kx: number, ky: number) => {
    if (!knobRef.current) return;
    knobRef.current.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
  };

  const handleStart = useCallback((cx: number, cy: number) => {
    if (!baseRef.current) return;
    const rect = baseRef.current.getBoundingClientRect();
    originX.current = rect.left + rect.width  / 2;
    originY.current = rect.top  + rect.height / 2;
    active.current = true;
    move(cx, cy);
  }, []);

  const move = useCallback((cx: number, cy: number) => {
    if (!active.current) return;
    let dx = cx - originX.current;
    let dy = cy - originY.current;
    const dist = Math.hypot(dx, dy);
    const max  = STICK_RADIUS - KNOB_RADIUS;
    if (dist > max) { dx = dx / dist * max; dy = dy / dist * max; }
    setKnob(dx, dy);
    // Normalize to -1…1
    let nx = dx / max;
    let ny = dy / max;
    if (Math.abs(nx) < DEAD_ZONE) nx = 0;
    if (Math.abs(ny) < DEAD_ZONE) ny = 0;
    onMove(nx, ny);
  }, [onMove]);

  const end = useCallback(() => {
    active.current = false;
    setKnob(0, 0);
    onMove(0, 0);
  }, [onMove]);

  useEffect(() => {
    const el = baseRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => { e.preventDefault(); const t = e.touches[0]; handleStart(t.clientX, t.clientY); };
    const onTouchMove  = (e: TouchEvent) => { e.preventDefault(); const t = e.touches[0]; move(t.clientX, t.clientY); };
    const onTouchEnd   = (e: TouchEvent) => { e.preventDefault(); end(); };
    const onMouseDown  = (e: MouseEvent) => { handleStart(e.clientX, e.clientY); };

    el.addEventListener('touchstart',  onTouchStart, { passive: false });
    el.addEventListener('touchmove',   onTouchMove,  { passive: false });
    el.addEventListener('touchend',    onTouchEnd,   { passive: false });
    el.addEventListener('touchcancel', onTouchEnd,   { passive: false });
    el.addEventListener('mousedown',   onMouseDown);

    const onMouseMove = (e: MouseEvent) => { if (active.current) move(e.clientX, e.clientY); };
    const onMouseUp   = () => { if (active.current) end(); };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);

    return () => {
      el.removeEventListener('touchstart',  onTouchStart);
      el.removeEventListener('touchmove',   onTouchMove);
      el.removeEventListener('touchend',    onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
      el.removeEventListener('mousedown',   onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
  }, [handleStart, move, end]);

  return (
    <div
      ref={baseRef}
      style={{
        width:  STICK_RADIUS * 2,
        height: STICK_RADIUS * 2,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
        border: '2px solid rgba(255,255,255,0.18)',
        position: 'relative',
        flexShrink: 0,
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      {/* knob */}
      <div
        ref={knobRef}
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width:  KNOB_RADIUS * 2,
          height: KNOB_RADIUS * 2,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.22)',
          border: '2px solid rgba(255,255,255,0.45)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          transition: 'transform 40ms linear',
        }}
      />
    </div>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────

type BtnColor = { bg: string; border: string; text: string; glow?: string };

function ActionBtn({
  label, sub, color, size = 56, onPress, disabled = false,
}: {
  label: string; sub?: string; color: BtnColor; size?: number;
  onPress: () => void; disabled?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const pressing = useRef(false);

  const press = () => {
    if (disabled || pressing.current) return;
    pressing.current = true;
    onPress();
    if (ref.current) {
      ref.current.style.transform = 'scale(0.91)';
      ref.current.style.opacity   = '0.75';
    }
    setTimeout(() => {
      pressing.current = false;
      if (ref.current) {
        ref.current.style.transform = '';
        ref.current.style.opacity   = '';
      }
    }, 120);
  };

  return (
    <button
      ref={ref}
      onPointerDown={(e) => { e.preventDefault(); press(); }}
      style={{
        width: size, height: size,
        borderRadius: size / 2,
        background: disabled ? 'rgba(255,255,255,0.04)' : color.bg,
        border: `2px solid ${disabled ? 'rgba(255,255,255,0.08)' : color.border}`,
        color: disabled ? 'rgba(255,255,255,0.2)' : color.text,
        boxShadow: !disabled && color.glow ? `0 0 16px ${color.glow}` : 'none',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        touchAction: 'none', userSelect: 'none',
        transition: 'transform 80ms, opacity 80ms',
        fontFamily: 'system-ui',
        fontWeight: 900,
        gap: 1,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: size > 50 ? 13 : 11, lineHeight: 1 }}>{label}</span>
      {sub && <span style={{ fontSize: 9, opacity: 0.7, lineHeight: 1 }}>{sub}</span>}
    </button>
  );
}

// ─── Colors ───────────────────────────────────────────────────────────────────

const COLORS = {
  snap:   { bg: 'rgba(22,163,74,0.35)',  border: 'rgba(22,163,74,0.7)',  text: '#4ade80', glow: 'rgba(22,163,74,0.4)' },
  recv1:  { bg: 'rgba(37,99,235,0.35)', border: 'rgba(37,99,235,0.7)',  text: '#93c5fd', glow: 'rgba(37,99,235,0.4)' },
  recv2:  { bg: 'rgba(124,58,237,0.35)',border: 'rgba(124,58,237,0.7)', text: '#c4b5fd', glow: 'rgba(124,58,237,0.4)' },
  recv3:  { bg: 'rgba(220,38,38,0.35)', border: 'rgba(220,38,38,0.7)',  text: '#fca5a5', glow: 'rgba(220,38,38,0.4)' },
  recv4:  { bg: 'rgba(234,88,12,0.35)', border: 'rgba(234,88,12,0.7)',  text: '#fdba74', glow: 'rgba(234,88,12,0.4)' },
  juke:   { bg: 'rgba(234,179,8,0.25)', border: 'rgba(234,179,8,0.6)',  text: '#fde047' },
  spin:   { bg: 'rgba(168,85,247,0.25)',border: 'rgba(168,85,247,0.6)', text: '#d8b4fe' },
  stiff:  { bg: 'rgba(239,68,68,0.25)', border: 'rgba(239,68,68,0.6)',  text: '#fca5a5' },
  sprint: { bg: 'rgba(255,255,255,0.1)',border: 'rgba(255,255,255,0.3)', text: '#ffffff' },
  away:   { bg: 'rgba(107,114,128,0.25)',border: 'rgba(107,114,128,0.5)',text: '#9ca3af' },
  special:{ bg: 'rgba(251,191,36,0.25)',border: 'rgba(251,191,36,0.6)', text: '#fde68a', glow: 'rgba(251,191,36,0.3)' },
  fg:     { bg: 'rgba(234,88,12,0.25)', border: 'rgba(234,88,12,0.6)',  text: '#fdba74' },
};

// ─── Main controller ──────────────────────────────────────────────────────────

// ─── Gamepad support ──────────────────────────────────────────────────────────
//
// Standard Gamepad layout (works with any Bluetooth controller — Xbox, PS,
// Nintendo, and snap-on phone controllers like abxylute):
//   axes[0/1]   = left stick X/Y
//   axes[2/3]   = right stick X/Y
//   buttons[0]  = A / Cross     → Snap (pre-snap) or throw WR1 (live)
//   buttons[1]  = B / Circle    → Throw WR2 / throw away
//   buttons[2]  = X / Square    → Throw WR3 / juke
//   buttons[3]  = Y / Triangle  → Throw WR4 / spin
//   buttons[4]  = LB / L1       → Juke
//   buttons[5]  = RB / R1       → Spin
//   buttons[6]  = LT / L2       → Stiff arm
//   buttons[7]  = RT / R2       → Sprint (hold)
//   buttons[9]  = Start/+       → Snap
//   buttons[12-15]              = D-pad (movement fallback)

const GPAD_DEAD = 0.15; // analog dead zone

function useGamepadInput(setGamepadConnected: (v: boolean) => void) {
  const rafRef  = useRef<number | null>(null);
  const prevBtn = useRef<boolean[]>([]);

  useEffect(() => {
    const onConnect    = () => setGamepadConnected(true);
    const onDisconnect = () => {
      // Reset movement when controller disconnects
      virtualInput.dx = 0;
      virtualInput.dy = 0;
      virtualInput.sprint = false;
      setGamepadConnected(false);
    };

    window.addEventListener('gamepadconnected',    onConnect);
    window.addEventListener('gamepaddisconnected', onDisconnect);

    const applyDead = (v: number) => Math.abs(v) < GPAD_DEAD ? 0 : v;

    const justPressed = (idx: number, btns: readonly GamepadButton[]): boolean => {
      const now  = btns[idx]?.pressed ?? false;
      const prev = prevBtn.current[idx] ?? false;
      prevBtn.current[idx] = now;
      return now && !prev;
    };

    const poll = () => {
      rafRef.current = requestAnimationFrame(poll);
      const gamepads = navigator.getGamepads();
      const gp = gamepads[0]; // use first connected controller
      if (!gp) return;

      // ── Analog stick → movement ─────────────────────────────────────────
      const lx = applyDead(gp.axes[0] ?? 0);
      const ly = applyDead(gp.axes[1] ?? 0);

      // D-pad fallback (buttons 12-15)
      const dUp    = gp.buttons[12]?.pressed;
      const dDown  = gp.buttons[13]?.pressed;
      const dLeft  = gp.buttons[14]?.pressed;
      const dRight = gp.buttons[15]?.pressed;

      virtualInput.dx = lx !== 0 ? lx : dRight ? 1 : dLeft ? -0.7 : 0;
      virtualInput.dy = ly !== 0 ? ly : dDown  ? 1 : dUp   ? -1   : 0;

      // ── RT hold → sprint ────────────────────────────────────────────────
      virtualInput.sprint = (gp.buttons[7]?.value ?? 0) > 0.25;

      // ── One-shot buttons ─────────────────────────────────────────────────
      // Snap: A (0) or Start (9)
      if (justPressed(0, gp.buttons) || justPressed(9, gp.buttons)) {
        virtualInput._snap = true;
        virtualInput._throw[0] = true;   // in LIVE_PLAY this throws to WR1
      }
      // B → WR2 / throw away
      if (justPressed(1, gp.buttons)) {
        virtualInput._throw[1]  = true;
        virtualInput._throwAway = true;
      }
      // X → WR3 / juke
      if (justPressed(2, gp.buttons)) {
        virtualInput._throw[2] = true;
        virtualInput._juke     = true;
      }
      // Y → WR4 / spin
      if (justPressed(3, gp.buttons)) {
        virtualInput._throw[3] = true;
        virtualInput._spin     = true;
      }
      // LB → juke
      if (justPressed(4, gp.buttons)) virtualInput._juke     = true;
      // RB → spin
      if (justPressed(5, gp.buttons)) virtualInput._spin     = true;
      // LT → stiff arm
      if ((gp.buttons[6]?.value ?? 0) > 0.25 && !prevBtn.current[6]) {
        virtualInput._stiffArm = true;
      }
      prevBtn.current[6] = (gp.buttons[6]?.value ?? 0) > 0.25;

      // Select/back (8) → punt on 4th
      if (justPressed(8, gp.buttons)) virtualInput._punt = true;
    };

    rafRef.current = requestAnimationFrame(poll);
    return () => {
      window.removeEventListener('gamepadconnected',    onConnect);
      window.removeEventListener('gamepaddisconnected', onDisconnect);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [setGamepadConnected]);
}

export function GameController() {
  const [phaseInfo, setPhaseInfo] = useState<PhaseInfo>({ phase: PlayPhase.FORMATION, down: 1, distance: 10, yardLine: 25 });
  const [sprintOn, setSprintOn] = useState(false);
  const [gamepadConnected, setGamepadConnected] = useState(false);

  // Physical Bluetooth controller support (Gamepad API)
  useGamepadInput(setGamepadConnected);

  // Listen for phase changes emitted by the game
  useEffect(() => {
    const handler = (e: Event) => {
      setPhaseInfo((e as CustomEvent).detail as PhaseInfo);
    };
    window.addEventListener('gridiron:phase', handler);
    return () => window.removeEventListener('gridiron:phase', handler);
  }, []);

  const handleStick = useCallback((dx: number, dy: number) => {
    virtualInput.dx = dx;
    virtualInput.dy = dy;
  }, []);

  const toggleSprint = () => {
    const next = !sprintOn;
    setSprintOn(next);
    virtualInput.sprint = next;
  };

  const { phase, down } = phaseInfo;
  const isLivePlay  = phase === PlayPhase.LIVE_PLAY;
  const isPreSnap   = phase === PlayPhase.PRE_SNAP || phase === PlayPhase.FORMATION;
  const isSnap      = phase === PlayPhase.PRE_SNAP;
  const isFG        = phase === PlayPhase.FG_ATTEMPT;
  const isKickRet   = phase === PlayPhase.KICKOFF_RET || phase === PlayPhase.PUNT;
  const is4th       = phase === PlayPhase.FORMATION && down === 4;

  // Determine if the active play is a run — we don't know from outside but
  // in LIVE_PLAY we show all buttons; irrelevant ones just do nothing.
  const showReceivers = isLivePlay;
  const showMoves     = isLivePlay;

  // Suppress unused variable warning
  void isPreSnap;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 12px 16px',
        zIndex: 30,
      }}
    >
      {/* Gamepad connected badge */}
      {gamepadConnected && (
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(22,163,74,0.25)', border: '1px solid rgba(22,163,74,0.55)',
          borderRadius: 20, padding: '4px 14px',
          color: '#4ade80', fontSize: 12, fontWeight: 700, fontFamily: 'system-ui',
          letterSpacing: '0.04em', pointerEvents: 'none',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 15 }}>🎮</span> CONTROLLER CONNECTED
        </div>
      )}

      {/* When a physical controller is active, hide touch controls to reduce clutter */}
      {!gamepadConnected && (
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>

        {/* ── LEFT: Joystick ── */}
        <div style={{ pointerEvents: 'auto', flexShrink: 0 }}>
          <Joystick onMove={handleStick} />
        </div>

        {/* ── CENTER: context buttons ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'auto', minWidth: 0 }}>

          {/* Receiver row (live play) */}
          {showReceivers && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {([COLORS.recv1, COLORS.recv2, COLORS.recv3, COLORS.recv4] as BtnColor[]).map((c, i) => (
                <ActionBtn
                  key={i}
                  label={`WR${i + 1}`}
                  color={c}
                  size={60}
                  onPress={() => { virtualInput._throw[i as 0|1|2|3] = true; }}
                />
              ))}
              <ActionBtn label="AWAY" sub="throw" color={COLORS.away} size={60} onPress={() => { virtualInput._throwAway = true; }} />
            </div>
          )}

          {/* Snap button */}
          {(isSnap || isFG) && (
            <ActionBtn
              label={isFG ? 'KICK' : 'SNAP'}
              color={COLORS.snap}
              size={76}
              onPress={() => { virtualInput._snap = true; }}
            />
          )}

          {/* 4th down options */}
          {is4th && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <ActionBtn label="PUNT" color={COLORS.special} size={64} onPress={() => { virtualInput._punt = true; }} />
              <ActionBtn label="FG" color={COLORS.fg} size={64} onPress={() => { virtualInput._fg = true; }} />
            </div>
          )}

          {/* Fair catch */}
          {isKickRet && (
            <ActionBtn label="FAIR CATCH" color={COLORS.special} size={76} onPress={() => { virtualInput._fairCatch = true; }} />
          )}
        </div>

        {/* ── RIGHT: action buttons ── */}
        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
          {/* Sprint toggle — always visible */}
          <ActionBtn
            label={sprintOn ? '⚡ ON' : 'SPRINT'}
            color={{ ...COLORS.sprint, bg: sprintOn ? 'rgba(255,255,255,0.2)' : COLORS.sprint.bg, glow: sprintOn ? 'rgba(255,255,255,0.25)' : undefined }}
            size={52}
            onPress={toggleSprint}
          />

          {/* Special moves — during live play */}
          {showMoves && (
            <>
              <ActionBtn label="JUKE"  sub="Z" color={COLORS.juke}  size={52} onPress={() => { virtualInput._juke     = true; }} />
              <ActionBtn label="SPIN"  sub="X" color={COLORS.spin}  size={52} onPress={() => { virtualInput._spin     = true; }} />
              <ActionBtn label="STIFF" sub="C" color={COLORS.stiff} size={52} onPress={() => { virtualInput._stiffArm = true; }} />
            </>
          )}
        </div>

      </div>
      )}
    </div>
  );
}
