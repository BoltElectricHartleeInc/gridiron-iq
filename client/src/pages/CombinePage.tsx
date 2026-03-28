import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell, C, GLOBAL_CSS, Btn } from '../components/AppShell';

// ─── Types ────────────────────────────────────────────────────────────────────
type EventKey = 'dash' | 'bench' | 'wonderlic' | 'routes' | 'qb';
type EventPhase = 'idle' | 'set' | 'countdown' | 'go' | 'drive' | 'release' | 'result' | 'done';

interface EventResult {
  key: EventKey;
  label: string;
  icon: string;
  value: string;
  grade: string;
  numericScore: number; // 0-100 normalized
  skipped?: boolean;
}

// ─── Grade helpers ────────────────────────────────────────────────────────────
function dashGrade(time: number): string {
  if (time < 4.35) return 'A+';
  if (time < 4.45) return 'A';
  if (time < 4.55) return 'B+';
  if (time < 4.65) return 'B';
  if (time < 4.75) return 'C+';
  if (time < 4.9) return 'C';
  return 'D';
}
function dashScore(time: number): number {
  if (time < 4.35) return 100;
  if (time < 4.45) return 90;
  if (time < 4.55) return 80;
  if (time < 4.65) return 70;
  if (time < 4.75) return 60;
  if (time < 4.9) return 50;
  return 35;
}
function benchGrade(reps: number): string {
  if (reps >= 30) return 'A+';
  if (reps >= 25) return 'A';
  if (reps >= 20) return 'B+';
  if (reps >= 15) return 'B';
  if (reps >= 10) return 'C';
  return 'D';
}
function benchScore(reps: number): number {
  return Math.min(100, Math.round((reps / 30) * 100));
}
function wonderlicGrade(correct: number): string {
  if (correct >= 11) return 'A+';
  if (correct >= 9) return 'A';
  if (correct >= 7) return 'B';
  if (correct >= 5) return 'C';
  return 'D';
}
function wonderlicScore(correct: number): number {
  return Math.round((correct / 12) * 100);
}
function routeGrade(pts: number): string {
  if (pts >= 450) return 'A+';
  if (pts >= 380) return 'A';
  if (pts >= 300) return 'B';
  if (pts >= 200) return 'C';
  return 'D';
}
function routeScore(pts: number): number {
  return Math.min(100, Math.round((pts / 500) * 100));
}
function qbGrade(pct: number): string {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  return 'D';
}
function qbScore(pct: number): number {
  return pct;
}
function gradeToGPA(g: string): number {
  const m: Record<string, number> = {
    'A+': 4.3, A: 4.0, 'A-': 3.7, 'B+': 3.3, B: 3.0, 'B-': 2.7,
    'C+': 2.3, C: 2.0, 'C-': 1.7, D: 1.0, F: 0,
  };
  return m[g] ?? 2.0;
}
function gpaToGrade(gpa: number): string {
  if (gpa >= 4.1) return 'A+';
  if (gpa >= 3.85) return 'A';
  if (gpa >= 3.5) return 'A-';
  if (gpa >= 3.15) return 'B+';
  if (gpa >= 2.85) return 'B';
  if (gpa >= 2.5) return 'B-';
  if (gpa >= 2.15) return 'C+';
  if (gpa >= 1.85) return 'C';
  if (gpa >= 1.5) return 'C-';
  if (gpa >= 1.0) return 'D';
  return 'F';
}
function gradeColor(g: string): string {
  if (g.startsWith('A')) return C.green;
  if (g.startsWith('B')) return C.blueBright;
  if (g.startsWith('C')) return C.gold;
  return C.red;
}
function draftProjection(g: string): string {
  if (g === 'A+') return 'NFL scouts are comparing you to generational athletes';
  if (g === 'A') return 'Projected Top 10 Pick';
  if (g === 'A-') return 'First Round talent';
  if (g === 'B+') return 'Day 2 prospect';
  if (g === 'B') return 'Day 3 value';
  if (g === 'B-') return 'Undrafted Free Agent candidate';
  return 'Camp body — needs development';
}

// ─── Shared button style ───────────────────────────────────────────────────────
function btnStyle(variant: 'primary' | 'secondary'): React.CSSProperties {
  return {
    padding: '12px 28px',
    borderRadius: 10,
    border: `1px solid ${variant === 'primary' ? C.green : C.border}`,
    background: variant === 'primary' ? C.green : C.surface,
    color: variant === 'primary' ? C.txtInvert : C.txt,
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    letterSpacing: 1,
    transition: 'all 0.2s',
    fontFamily: C.font,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// ── 40-Yard Dash ──────────────────────────────────────────────────────────────
function DashEvent({ onComplete }: { onComplete: (result: EventResult) => void }) {
  const [phase, setPhase] = useState<EventPhase>('idle');
  const [countdown, setCountdown] = useState(3);
  const [power, setPower] = useState(0);
  const [holding, setHolding] = useState(false);
  const [falseStart, setFalseStart] = useState(false);
  const [time, setTime] = useState<number | null>(null);
  const [runnerPos, setRunnerPos] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const powerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const goReadyRef = useRef(false);
  const pressedRef = useRef(false);

  const clearAll = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (powerRef.current) clearInterval(powerRef.current);
    timerRef.current = null;
    powerRef.current = null;
  };

  const startDrill = () => {
    setPhase('set');
    setCountdown(3);
    setFalseStart(false);
    setPower(0);
    setRunnerPos(0);
    setTime(null);
    goReadyRef.current = false;
    pressedRef.current = false;

    let c = 3;
    timerRef.current = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearAll();
        const delay = 800 + Math.random() * 1000;
        setTimeout(() => {
          goReadyRef.current = true;
          setPhase('go');
        }, delay);
      }
    }, 1000);
  };

  useEffect(() => {
    if (holding && phase === 'drive') {
      powerRef.current = setInterval(() => {
        setPower(p => {
          const next = Math.min(100, p + 100 / 80);
          if (next >= 100) {
            clearInterval(powerRef.current!);
            release(100);
          }
          return next;
        });
      }, 10);
    } else {
      if (powerRef.current) clearInterval(powerRef.current);
    }
    return () => { if (powerRef.current) clearInterval(powerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holding, phase]);

  const release = useCallback((p: number) => {
    clearAll();
    const optimal = p >= 85 && p <= 95;
    const slightly = p >= 75 && p < 85;
    let result: number;
    if (optimal) result = 4.28 + Math.random() * 0.1;
    else if (slightly) result = 4.38 + Math.random() * 0.07;
    else if (p < 75) result = 4.5 + Math.random() * 0.2;
    else result = 4.44 + Math.random() * 0.08;
    setTime(result);
    setPhase('result');

    let pos = 0;
    const run = setInterval(() => {
      pos = Math.min(100, pos + 2.5);
      setRunnerPos(pos);
      if (pos >= 100) clearInterval(run);
    }, 20);
  }, []);

  const handleInteract = useCallback(() => {
    if (phase === 'idle' || phase === 'result') return;
    if (phase === 'set' || phase === 'countdown') {
      clearAll();
      setFalseStart(true);
      setPhase('idle');
      return;
    }
    if (phase === 'go') {
      setPhase('drive');
      setHolding(true);
      pressedRef.current = true;
    }
  }, [phase]);

  const handleRelease = useCallback(() => {
    if (phase === 'drive' && holding) {
      setHolding(false);
      release(power);
    }
  }, [phase, holding, power, release]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (e.type === 'keydown' && !e.repeat) handleInteract();
        if (e.type === 'keyup') handleRelease();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, [handleInteract, handleRelease]);

  const submit = () => {
    if (time === null) return;
    onComplete({
      key: 'dash',
      label: '40-Yard Dash',
      icon: '🏃',
      value: `${time.toFixed(2)}s`,
      grade: dashGrade(time),
      numericScore: dashScore(time),
    });
  };

  const phaseLabel: Record<string, string> = {
    idle: 'Ready to run?',
    set: 'GET SET...',
    countdown: `${countdown}...`,
    go: 'DRIVE!',
    drive: 'HOLD FOR POWER — RELEASE AT 85-95%',
    result: time !== null ? `${time.toFixed(2)}s — ${dashGrade(time)}` : '',
  };

  const powerColor = power >= 85 && power <= 95 ? C.green : power > 95 ? C.red : C.gold;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Track */}
      <div style={{
        background: 'linear-gradient(180deg, #0a1a0a 0%, #0d200d 100%)',
        borderRadius: 12,
        height: 90,
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${C.border}`,
        boxShadow: `inset 0 1px 0 rgba(0,200,83,0.08)`,
      }}>
        {[0.25, 0.5, 0.75].map(y => (
          <div key={y} style={{
            position: 'absolute', left: 0, right: 0,
            top: `${y * 100}%`, height: 1, background: 'rgba(255,255,255,0.06)',
          }} />
        ))}
        <div style={{
          position: 'absolute', right: 20, top: 0, bottom: 0,
          width: 3, background: 'white', opacity: 0.5,
        }} />
        <motion.div
          animate={{ left: `${Math.max(2, runnerPos - 4)}%` }}
          transition={{ ease: 'linear', duration: 0.05 }}
          style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            width: 32, height: 32,
          }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: C.green,
            boxShadow: `0 0 16px ${C.green}`,
            margin: '0 auto',
          }} />
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 4,
            marginTop: 2,
            animation: phase === 'drive' || runnerPos > 0 ? 'leg-run 0.3s infinite alternate' : 'none',
          }}>
            <div style={{ width: 4, height: 8, background: C.green, borderRadius: 2 }} />
            <div style={{ width: 4, height: 8, background: C.green, borderRadius: 2 }} />
          </div>
        </motion.div>
      </div>

      {/* Phase indicator */}
      <div style={{ textAlign: 'center' }}>
        <motion.div
          key={phase}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            fontSize: phase === 'go' ? 52 : 24,
            fontWeight: 900,
            color: phase === 'go' ? C.green : C.txt,
            letterSpacing: 3,
            textShadow: phase === 'go' ? `0 0 40px ${C.green}` : 'none',
          }}
        >
          {phase === 'go' ? 'GO!' : phaseLabel[phase] ?? ''}
        </motion.div>
        {falseStart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: C.red, marginTop: 8, fontWeight: 700 }}
          >
            FALSE START — Try again
          </motion.div>
        )}
      </div>

      {/* Power meter */}
      {(phase === 'drive' || phase === 'result') && (
        <div style={{ padding: '0 32px' }}>
          <div style={{ fontSize: 11, color: C.txtSub, marginBottom: 6, letterSpacing: 1 }}>
            POWER METER — Release in green zone (85-95%)
          </div>
          <div style={{
            height: 28, background: C.elevated, borderRadius: 14,
            overflow: 'hidden', position: 'relative', border: `1px solid ${C.border}`,
          }}>
            <motion.div
              animate={{ width: `${power}%` }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${powerColor}88, ${powerColor})`,
                borderRadius: 14,
                transition: 'background 0.1s',
                boxShadow: `0 0 12px ${powerColor}50`,
              }}
            />
            <div style={{
              position: 'absolute', left: '85%', top: 0, bottom: 0,
              width: '10%', background: `${C.green}20`,
              border: `1px solid ${C.green}`,
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11, color: C.txtSub }}>
            <span>0%</span>
            <span style={{ color: C.green, fontWeight: 700 }}>SWEET ZONE 85-95%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Result */}
      {phase === 'result' && time !== null && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{
            fontSize: 72, fontWeight: 900,
            color: gradeColor(dashGrade(time)), letterSpacing: -2,
            textShadow: `0 0 40px ${gradeColor(dashGrade(time))}50`,
          }}>
            {time.toFixed(2)}s
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: gradeColor(dashGrade(time)) }}>
            Grade: {dashGrade(time)}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
            <button onClick={startDrill} style={btnStyle('secondary')}>Retry</button>
            <button onClick={submit} style={btnStyle('primary')}>Lock In Score</button>
          </div>
        </motion.div>
      )}

      {phase === 'idle' && (
        <div style={{ textAlign: 'center' }}>
          <button
            onMouseDown={handleInteract}
            onClick={() => { if (phase === 'idle') startDrill(); }}
            style={btnStyle('primary')}
          >
            {time !== null ? 'Run Again' : 'Press READY'}
          </button>
          <div style={{ color: C.txtSub, marginTop: 10, fontSize: 12 }}>
            Press SPACE or click to interact during the drill
          </div>
        </div>
      )}

      {(phase === 'set' || phase === 'go' || phase === 'drive') && (
        <div style={{ textAlign: 'center' }}>
          <button
            onMouseDown={handleInteract}
            onMouseUp={handleRelease}
            style={{
              ...btnStyle('primary'),
              background: phase === 'go' ? C.green : C.surface,
              color: phase === 'go' ? C.txtInvert : C.txt,
              transform: holding ? 'scale(0.97)' : 'scale(1)',
              boxShadow: phase === 'go' ? `0 0 24px ${C.green}60` : 'none',
            }}
          >
            {phase === 'set' ? 'WAIT...' : phase === 'go' ? 'DRIVE!' : 'HOLDING — RELEASE!'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Bench Press ───────────────────────────────────────────────────────────────
function BenchEvent({ onComplete }: { onComplete: (r: EventResult) => void }) {
  const [phase, setPhase] = useState<'idle' | 'active' | 'result'>('idle');
  const [reps, setReps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [barY, setBarY] = useState(0);
  const [atTop, setAtTop] = useState(true);
  const [barSpeed, setBarSpeed] = useState(1800);
  const [lastPress, setLastPress] = useState<'hit' | 'miss' | null>(null);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const atTopRef = useRef(true);
  const repsRef = useRef(0);
  const barSpeedRef = useRef(1800);

  const start = () => {
    setPhase('active');
    setReps(0);
    repsRef.current = 0;
    setTimeLeft(60);
    setBarY(0);
    setAtTop(true);
    atTopRef.current = true;
    setBarSpeed(1800);
    barSpeedRef.current = 1800;
    setLastPress(null);

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          endDrill();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    startCycle(1800);
  };

  const startCycle = (speed: number) => {
    if (cycleRef.current) clearInterval(cycleRef.current);
    let going = false;
    cycleRef.current = setInterval(() => {
      going = !going;
      if (!going) {
        setBarY(1);
        setAtTop(false);
        atTopRef.current = false;
      } else {
        setBarY(0);
        setAtTop(true);
        atTopRef.current = true;
      }
    }, speed / 2);
  };

  const endDrill = () => {
    if (cycleRef.current) clearInterval(cycleRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('result');
  };

  const press = useCallback(() => {
    if (!atTopRef.current) {
      setLastPress('miss');
      return;
    }
    repsRef.current++;
    setReps(repsRef.current);
    setLastPress('hit');
    if (repsRef.current === 15) {
      barSpeedRef.current = 1400;
      startCycle(1400);
    } else if (repsRef.current === 25) {
      barSpeedRef.current = 1100;
      startCycle(1100);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.type === 'keydown' && !e.repeat) {
        e.preventDefault();
        if (phase === 'active') press();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, press]);

  useEffect(() => {
    return () => {
      if (cycleRef.current) clearInterval(cycleRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const submit = () => {
    onComplete({
      key: 'bench',
      label: 'Bench Press (225 lbs)',
      icon: '🏋️',
      value: `${repsRef.current} reps`,
      grade: benchGrade(repsRef.current),
      numericScore: benchScore(repsRef.current),
    });
  };

  const barTop = barY === 0 ? 20 : 90;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {phase === 'active' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: timeLeft < 10 ? C.red : C.txt }}>
            {timeLeft}s
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.green }}>
            {reps} REPS
          </div>
        </div>
      )}

      {/* Barbell animation */}
      <div style={{
        background: 'linear-gradient(180deg, #10180f 0%, #0a1209 100%)',
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        height: 200,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `inset 0 1px 0 rgba(0,200,83,0.06)`,
      }}>
        <div style={{
          position: 'absolute', top: 10, left: 0, right: 0, height: 60,
          background: atTop && phase === 'active' ? `${C.green}12` : 'transparent',
          border: atTop && phase === 'active' ? `1px solid ${C.green}` : `1px dashed ${C.border}`,
          margin: '0 20px',
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: C.green, fontWeight: 700, letterSpacing: 2,
          transition: 'all 0.15s',
          boxShadow: atTop && phase === 'active' ? `0 0 20px ${C.green}20` : 'none',
        }}>
          {atTop && phase === 'active' ? 'PRESS NOW!' : 'PRESS ZONE'}
        </div>

        <motion.div
          animate={{ top: barTop }}
          transition={{ duration: barSpeedRef.current / 2000, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            left: '10%', right: '10%',
            height: 16,
            top: barTop,
          }}
        >
          <div style={{
            position: 'absolute', left: -8, top: -12,
            width: 24, height: 40, borderRadius: 4,
            background: '#666', border: '2px solid #444',
          }} />
          <div style={{
            position: 'absolute', left: 12, top: -8,
            width: 18, height: 32, borderRadius: 3,
            background: '#555', border: '2px solid #333',
          }} />
          <div style={{
            position: 'absolute', left: 0, right: 0,
            height: 16, background: '#999', borderRadius: 8,
          }} />
          <div style={{
            position: 'absolute', right: 12, top: -8,
            width: 18, height: 32, borderRadius: 3,
            background: '#555', border: '2px solid #333',
          }} />
          <div style={{
            position: 'absolute', right: -8, top: -12,
            width: 24, height: 40, borderRadius: 4,
            background: '#666', border: '2px solid #444',
          }} />
        </motion.div>
      </div>

      <AnimatePresence>
        {lastPress && (
          <motion.div
            key={`${lastPress}-${reps}`}
            initial={{ y: -10, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              textAlign: 'center', fontWeight: 900, fontSize: 22,
              color: lastPress === 'hit' ? C.green : C.red,
              textShadow: `0 0 20px ${lastPress === 'hit' ? C.green : C.red}50`,
            }}
          >
            {lastPress === 'hit' ? `✓ REP ${reps}!` : '✗ Missed window!'}
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'idle' && (
        <div style={{ textAlign: 'center' }}>
          <button onClick={start} style={btnStyle('primary')}>Start Bench Press</button>
          <div style={{ color: C.txtSub, marginTop: 10, fontSize: 12 }}>
            Click or press SPACE when bar is in the green zone
          </div>
        </div>
      )}

      {phase === 'active' && (
        <div style={{ textAlign: 'center' }}>
          <button onMouseDown={press} style={{ ...btnStyle('primary'), minWidth: 220 }}>
            PRESS (SPACE)
          </button>
        </div>
      )}

      {phase === 'result' && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 72, fontWeight: 900,
            color: gradeColor(benchGrade(reps)),
            textShadow: `0 0 40px ${gradeColor(benchGrade(reps))}50`,
          }}>{reps}</div>
          <div style={{ fontSize: 20, color: C.txtSub }}>REPS AT 225 LBS</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: gradeColor(benchGrade(reps)), marginTop: 8 }}>
            Grade: {benchGrade(reps)}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
            <button onClick={start} style={btnStyle('secondary')}>Retry</button>
            <button onClick={submit} style={btnStyle('primary')}>Lock In Score</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Wonderlic ─────────────────────────────────────────────────────────────────
const WONDERLIC_QS = [
  { q: 'A Cover 2 defense leaves which area most vulnerable?', opts: ['Flat', 'Deep Sidelines', 'Middle/Hole', 'Corner'], answer: 1 },
  { q: 'Which route beats press man coverage most effectively?', opts: ['Post', 'Slant', 'Corner', 'Comeback'], answer: 1 },
  { q: 'If the defense shows 8 in the box pre-snap, the offense should...', opts: ['Run Power', 'Call a screen', 'Audible to pass/RPO', 'Call a timeout'], answer: 2 },
  { q: 'Zone blocking is designed to...', opts: ['Double team every DL', 'Create cut-back lanes', 'Win individual 1-on-1 battles', 'Pull guards outside'], answer: 1 },
  { q: "A 'Tampa 2' differs from Cover 2 because...", opts: ['There are 3 safeties', 'The MLB drops into the deep middle', 'CBs play off coverage', "It's a man coverage"], answer: 1 },
  { q: "The 'air yards' metric measures...", opts: ['Total passing yards', 'Distance ball travels past LOS to catch point', 'Quarterback height', 'Yards after catch'], answer: 1 },
  { q: "What does 'MIKE' linebacker designation tell an offense?", opts: ["He's the fastest LB", 'Sets protection alignments', 'He always blitzes', 'He covers the TE'], answer: 1 },
  { q: 'Bunch formation creates problems for defense because...', opts: ["It's illegal to defend", 'Rubs/picks are easier to run', 'It means 5 receivers', 'QB has better sight lines'], answer: 1 },
  { q: 'Play-action works best when...', opts: ['Defense expects pass', 'Running game has been effective', "You're behind by 14", 'Wide receivers are covered'], answer: 1 },
  { q: "A '4-3 Under' front means...", opts: ['4 DL shift toward weak side', '4 DL shift toward tight end', '3 DL rush, 4 drop', '43 in the playbook'], answer: 0 },
  { q: 'Yards after contact (YAC) per carry is most important for:', opts: ['Offensive linemen', 'Running back value', 'Quarterback rating', 'Tight end grades'], answer: 1 },
  { q: "Linebacker 'Mike' designation traditionally goes to the...", opts: ['Weakside LB', 'Middle/playside LB', 'Blitzing LB', 'Highest-rated LB'], answer: 1 },
];

function WonderlicEvent({ onComplete }: { onComplete: (r: EventResult) => void }) {
  const [phase, setPhase] = useState<'idle' | 'active' | 'result'>('idle');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    setPhase('active');
    setCurrent(0);
    setSelected(null);
    setCorrect(0);
    setTimeLeft(90);
    setAnswers([]);

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setPhase('result');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const pick = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === WONDERLIC_QS[current].answer;
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);

    if (isCorrect) setCorrect(c => c + 1);

    setTimeout(() => {
      const next = current + 1;
      if (next >= WONDERLIC_QS.length) {
        clearInterval(timerRef.current!);
        setPhase('result');
      } else {
        setCurrent(next);
        setSelected(null);
      }
    }, 700);
  };

  const finalCorrect = answers.filter((a, i) => a === WONDERLIC_QS[i].answer).length;

  const submit = () => {
    onComplete({
      key: 'wonderlic',
      label: 'Football IQ (Wonderlic)',
      icon: '🧠',
      value: `${finalCorrect}/12`,
      grade: wonderlicGrade(finalCorrect),
      numericScore: wonderlicScore(finalCorrect),
    });
  };

  const q = WONDERLIC_QS[current];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {phase === 'active' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: C.txtSub, fontSize: 13, fontWeight: 600 }}>
              Question {current + 1} of {WONDERLIC_QS.length}
            </div>
            <div style={{
              fontSize: 28, fontWeight: 900,
              color: timeLeft < 20 ? C.red : C.gold,
              textShadow: timeLeft < 20 ? `0 0 20px ${C.red}50` : 'none',
            }}>
              {timeLeft}s
            </div>
          </div>

          <div style={{ height: 4, background: C.elevated, borderRadius: 2 }}>
            <div style={{
              height: '100%', borderRadius: 2,
              width: `${(current / WONDERLIC_QS.length) * 100}%`,
              background: C.green,
              transition: 'width 0.3s',
              boxShadow: `0 0 8px ${C.green}40`,
            }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <div style={{
                fontSize: 18, fontWeight: 700, color: C.txt,
                padding: '20px 24px',
                background: C.elevated,
                borderRadius: 12,
                border: `1px solid ${C.borderHi}`,
                lineHeight: 1.6,
              }}>
                {q.q}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {q.opts.map((opt, i) => {
                  const isSelected = selected === i;
                  const isCorrectOpt = i === q.answer;
                  let bg = C.surface;
                  let border = C.border;
                  let color = C.txt;
                  if (selected !== null) {
                    if (isCorrectOpt) { bg = C.greenSub; border = C.green; color = C.green; }
                    else if (isSelected) { bg = C.redSub; border = C.red; color = C.red; }
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => pick(i)}
                      style={{
                        padding: '14px 20px',
                        background: bg,
                        border: `1px solid ${border}`,
                        borderRadius: 10,
                        color,
                        fontSize: 15,
                        cursor: selected !== null ? 'default' : 'pointer',
                        textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: 14,
                        transition: 'all 0.2s',
                        fontFamily: C.font,
                      }}
                    >
                      <span style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: C.elevated,
                        border: `1px solid ${border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 12, flexShrink: 0, color,
                      }}>
                        {['A', 'B', 'C', 'D'][i]}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {phase === 'idle' && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🧠</div>
          <div style={{ fontSize: 20, color: C.txt, fontWeight: 700, marginBottom: 8 }}>
            12 Football IQ Questions
          </div>
          <div style={{ color: C.txtSub, marginBottom: 28 }}>90 seconds — answer as many as you can</div>
          <button onClick={start} style={btnStyle('primary')}>Start Quiz</button>
        </div>
      )}

      {phase === 'result' && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 72, fontWeight: 900,
            color: gradeColor(wonderlicGrade(finalCorrect)),
            textShadow: `0 0 40px ${gradeColor(wonderlicGrade(finalCorrect))}50`,
          }}>
            {finalCorrect}/12
          </div>
          <div style={{ fontSize: 18, color: C.txtSub }}>Correct Answers</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: gradeColor(wonderlicGrade(finalCorrect)), marginTop: 8 }}>
            Grade: {wonderlicGrade(finalCorrect)}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
            <button onClick={start} style={btnStyle('secondary')}>Retry</button>
            <button onClick={submit} style={btnStyle('primary')}>Lock In Score</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Route Running ─────────────────────────────────────────────────────────────
const ROUTES = [
  { name: 'Slant', cones: [{ x: 50, y: 80 }, { x: 55, y: 65 }, { x: 65, y: 50 }, { x: 75, y: 35 }, { x: 82, y: 20 }] },
  { name: 'Post', cones: [{ x: 50, y: 80 }, { x: 50, y: 60 }, { x: 50, y: 40 }, { x: 65, y: 25 }, { x: 75, y: 12 }] },
  { name: 'Corner', cones: [{ x: 50, y: 80 }, { x: 50, y: 60 }, { x: 50, y: 40 }, { x: 35, y: 25 }, { x: 22, y: 14 }] },
  { name: 'Dig', cones: [{ x: 50, y: 80 }, { x: 50, y: 65 }, { x: 50, y: 50 }, { x: 35, y: 50 }, { x: 20, y: 50 }] },
  { name: 'Curl', cones: [{ x: 50, y: 80 }, { x: 50, y: 60 }, { x: 50, y: 42 }, { x: 50, y: 35 }, { x: 50, y: 42 }] },
];

function RouteEvent({ onComplete }: { onComplete: (r: EventResult) => void }) {
  const [phase, setPhase] = useState<'idle' | 'active' | 'result'>('idle');
  const [routeIdx, setRouteIdx] = useState(0);
  const [coneIdx, setConeIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [coneTimer, setConeTimer] = useState(2);
  const [coneResult, setConeResult] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const coneIdxRef = useRef(0);
  const scoreRef = useRef(0);

  const route = ROUTES[routeIdx % ROUTES.length];

  const nextCone = () => {
    const next = coneIdxRef.current + 1;
    if (next >= route.cones.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      setTotalScore(scoreRef.current);
      setPhase('result');
      return;
    }
    coneIdxRef.current = next;
    setConeIdx(next);
    setConeTimer(2);
    setConeResult(null);
  };

  const startDrill = () => {
    setPhase('active');
    setConeIdx(0);
    coneIdxRef.current = 0;
    setScore(0);
    scoreRef.current = 0;
    setConeTimer(2);
    setConeResult(null);

    timerRef.current = setInterval(() => {
      setConeTimer(t => {
        if (t <= 0.1) {
          setConeResult('Miss');
          setTimeout(nextCone, 400);
          return 2;
        }
        return t - 0.1;
      });
    }, 100);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleFieldClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'active') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = ((e.clientX - rect.left) / rect.width) * 100;
    const cy = ((e.clientY - rect.top) / rect.height) * 100;
    const cone = route.cones[coneIdxRef.current];
    const dist = Math.sqrt((cx - cone.x) ** 2 + (cy - cone.y) ** 2) * (rect.width / 100);
    let pts = 0;
    let label = '';
    if (dist < 5) { pts = 100; label = 'PERFECT! +100'; }
    else if (dist < 15) { pts = 70; label = 'GOOD! +70'; }
    else if (dist < 30) { pts = 40; label = 'OK +40'; }
    else { pts = 0; label = 'Miss'; }

    scoreRef.current += pts;
    setScore(scoreRef.current);
    setConeResult(label);
    setTimeout(nextCone, 300);
  };

  const submit = () => {
    onComplete({
      key: 'routes',
      label: 'Route Running',
      icon: '🎯',
      value: `${totalScore}/500`,
      grade: routeGrade(totalScore),
      numericScore: routeScore(totalScore),
    });
  };

  const activeCone = route.cones[coneIdx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {phase === 'active' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: C.txtSub }}>
            Route: <span style={{ color: C.gold, fontWeight: 700 }}>{route.name}</span>
          </div>
          <div style={{ color: C.green, fontWeight: 700 }}>Score: {score}</div>
          <div style={{ color: coneTimer < 0.5 ? C.red : C.txt, fontWeight: 700 }}>
            {coneTimer.toFixed(1)}s
          </div>
        </div>
      )}

      {/* Field */}
      <div
        ref={containerRef}
        onClick={handleFieldClick}
        style={{
          background: 'linear-gradient(180deg, #0a1a0a 0%, #0d200d 50%, #0a1a0a 100%)',
          borderRadius: 12,
          height: 320,
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${C.border}`,
          cursor: phase === 'active' ? 'crosshair' : 'default',
          boxShadow: `inset 0 0 60px rgba(0,0,0,0.4)`,
        }}
      >
        {[20, 40, 60, 80].map(y => (
          <div key={y} style={{
            position: 'absolute', left: 0, right: 0,
            top: `${y}%`, height: 1, background: 'rgba(255,255,255,0.08)',
          }} />
        ))}

        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} overflow="visible">
          {route.cones.map((cone, i) => {
            if (i === 0) return null;
            const prev = route.cones[i - 1];
            return (
              <line
                key={i}
                x1={`${prev.x}%`} y1={`${prev.y}%`}
                x2={`${cone.x}%`} y2={`${cone.y}%`}
                stroke={`${C.gold}30`}
                strokeWidth={2}
                strokeDasharray="6,4"
              />
            );
          })}
        </svg>

        {phase === 'active' && route.cones.slice(0, coneIdx).map((cone, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${cone.x}%`, top: `${cone.y}%`,
            transform: 'translate(-50%, -50%)',
            width: 14, height: 14, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: `1px solid rgba(255,255,255,0.2)`,
          }} />
        ))}

        {phase === 'active' && activeCone && (
          <motion.div
            key={coneIdx}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1.2, 1], opacity: 1 }}
            style={{
              position: 'absolute',
              left: `${activeCone.x}%`, top: `${activeCone.y}%`,
              transform: 'translate(-50%, -50%)',
              width: 32, height: 32, borderRadius: '50%',
              background: C.gold,
              boxShadow: `0 0 20px ${C.gold}, 0 0 40px ${C.gold}40`,
              border: `3px solid white`,
            }}
          />
        )}

        {phase !== 'active' && route.cones.map((cone, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${cone.x}%`, top: `${cone.y}%`,
            transform: 'translate(-50%, -50%)',
            width: 16, height: 16, borderRadius: '50%',
            background: C.gold, opacity: 0.4,
            border: `1px solid ${C.gold}`,
          }} />
        ))}

        {coneResult && (
          <motion.div
            key={coneResult + coneIdx}
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'absolute',
              left: `${activeCone?.x ?? 50}%`, top: `${activeCone?.y ?? 50}%`,
              transform: 'translate(-50%, -50%)',
              color: coneResult.includes('PERFECT') ? C.green : coneResult === 'Miss' ? C.red : C.gold,
              fontWeight: 900, fontSize: 16, whiteSpace: 'nowrap',
              pointerEvents: 'none',
              textShadow: `0 0 12px currentColor`,
            }}
          >
            {coneResult}
          </motion.div>
        )}

        {phase === 'active' && (
          <div style={{
            position: 'absolute', bottom: 8, left: 8, right: 8, height: 5,
            background: C.elevated, borderRadius: 3,
          }}>
            <div style={{
              height: '100%',
              background: coneTimer < 0.5 ? C.red : C.green,
              width: `${(coneTimer / 2) * 100}%`,
              transition: 'width 0.1s, background 0.2s',
              borderRadius: 3,
              boxShadow: `0 0 8px ${coneTimer < 0.5 ? C.red : C.green}50`,
            }} />
          </div>
        )}
      </div>

      {phase === 'idle' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: C.txtSub, marginBottom: 14 }}>
            Route: <span style={{ color: C.gold, fontWeight: 700 }}>{route.name}</span> — Click each cone as it appears
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
            {ROUTES.map((r, i) => (
              <button key={i} onClick={() => setRouteIdx(i)} style={{
                padding: '7px 16px',
                background: routeIdx === i ? C.goldSub : C.surface,
                color: routeIdx === i ? C.gold : C.txtSub,
                border: `1px solid ${routeIdx === i ? C.gold : C.border}`,
                borderRadius: 20, cursor: 'pointer', fontSize: 13,
                fontFamily: C.font, fontWeight: routeIdx === i ? 700 : 400,
                transition: 'all 0.2s',
              }}>
                {r.name}
              </button>
            ))}
          </div>
          <button onClick={startDrill} style={btnStyle('primary')}>Run Route</button>
        </div>
      )}

      {phase === 'result' && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 72, fontWeight: 900,
            color: gradeColor(routeGrade(totalScore)),
            textShadow: `0 0 40px ${gradeColor(routeGrade(totalScore))}50`,
          }}>
            {totalScore}/500
          </div>
          <div style={{ fontSize: 18, color: C.txtSub }}>Route Precision Score</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: gradeColor(routeGrade(totalScore)), marginTop: 8 }}>
            Grade: {routeGrade(totalScore)}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
            <button onClick={startDrill} style={btnStyle('secondary')}>Retry</button>
            <button onClick={submit} style={btnStyle('primary')}>Lock In Score</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── QB Accuracy ───────────────────────────────────────────────────────────────
const RECEIVER_POSITIONS = [
  { label: 'Short', x: 20, y: 70 },
  { label: 'Mid', x: 50, y: 45 },
  { label: 'Deep', x: 80, y: 20 },
];

function QBEvent({ onComplete }: { onComplete: (r: EventResult) => void }) {
  const [phase, setPhase] = useState<'idle' | 'active' | 'result'>('idle');
  const [throwCount, setThrowCount] = useState(0);
  const [completions, setCompletions] = useState(0);
  const [activeRec, setActiveRec] = useState<number | null>(null);
  const [openTime, setOpenTime] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const completionsRef = useRef(0);
  const throwRef = useRef(0);
  const scoreRef = useRef(0);
  const openTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openStartRef = useRef(0);

  const nextThrow = useCallback(() => {
    if (throwRef.current >= 10) {
      setTotalScore(scoreRef.current);
      setPhase('result');
      return;
    }
    const rec = Math.floor(Math.random() * 3);
    setActiveRec(rec);
    openStartRef.current = Date.now();

    flashTimeoutRef.current = setTimeout(() => {
      throwRef.current++;
      setThrowCount(throwRef.current);
      setActiveRec(null);
      setTimeout(nextThrow, 400);
    }, 1200);
  }, []);

  const start = () => {
    setPhase('active');
    setThrowCount(0);
    throwRef.current = 0;
    setCompletions(0);
    completionsRef.current = 0;
    setTotalScore(0);
    scoreRef.current = 0;
    setTimeout(nextThrow, 500);
  };

  const throw_ = (recIdx: number) => {
    if (activeRec !== recIdx) return;
    clearTimeout(flashTimeoutRef.current!);
    const elapsed = Date.now() - openStartRef.current;
    const accuracy = elapsed < 500 ? 1.0 : Math.max(0.6, 1.0 - ((elapsed - 500) / 700) * 0.4);
    const pts = Math.round(accuracy * 10);
    scoreRef.current += pts;
    completionsRef.current++;
    setCompletions(completionsRef.current);
    throwRef.current++;
    setThrowCount(throwRef.current);
    setActiveRec(null);
    setTimeout(nextThrow, 400);
  };

  useEffect(() => () => {
    clearTimeout(flashTimeoutRef.current!);
    clearInterval(openTimerRef.current!);
  }, []);

  const finalPct = Math.round((completions / 10) * 100);

  const submit = () => {
    onComplete({
      key: 'qb',
      label: 'QB Accuracy Drill',
      icon: '🏈',
      value: `${finalPct}%`,
      grade: qbGrade(finalPct),
      numericScore: qbScore(finalPct),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {phase === 'active' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: C.txtSub, fontWeight: 600 }}>Throw {throwCount + 1} / 10</div>
          <div style={{ color: C.green, fontWeight: 700 }}>{completions} completions</div>
        </div>
      )}

      {/* Field */}
      <div style={{
        background: 'linear-gradient(180deg, #0a1a0a 0%, #0d200d 50%, #0a1a0a 100%)',
        borderRadius: 12,
        height: 280,
        position: 'relative',
        border: `1px solid ${C.border}`,
        boxShadow: `inset 0 0 60px rgba(0,0,0,0.4)`,
      }}>
        {[33, 66].map(y => (
          <div key={y} style={{ position: 'absolute', left: 0, right: 0, top: `${y}%`, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        ))}
        <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: C.txtSub, letterSpacing: 2 }}>
          LOS
        </div>

        {RECEIVER_POSITIONS.map((rec, i) => {
          const isOpen = activeRec === i && phase === 'active';
          return (
            <motion.div
              key={i}
              onClick={() => throw_(i)}
              animate={isOpen ? {
                boxShadow: [`0 0 0px ${C.green}`, `0 0 28px ${C.green}`, `0 0 0px ${C.green}`],
              } : {}}
              transition={{ duration: 0.6, repeat: Infinity }}
              style={{
                position: 'absolute',
                left: `${rec.x}%`, top: `${rec.y}%`,
                transform: 'translate(-50%, -50%)',
                width: 48, height: 48,
                borderRadius: '50%',
                background: isOpen ? C.greenSub : C.elevated,
                border: `3px solid ${isOpen ? C.green : C.borderHi}`,
                cursor: isOpen ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: isOpen ? C.green : C.txtSub,
                fontWeight: 700,
                transition: 'all 0.15s',
                letterSpacing: 0.5,
              }}
            >
              {rec.label}
            </motion.div>
          );
        })}
      </div>

      {phase === 'idle' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: C.txtSub, marginBottom: 14, fontSize: 13 }}>
            Click glowing receivers to throw — quicker = higher accuracy
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={start} style={btnStyle('primary')}>Start Drill</button>
            <button onClick={() => onComplete({
              key: 'qb', label: 'QB Accuracy Drill', icon: '🏈',
              value: 'Skipped', grade: 'N/A', numericScore: 0, skipped: true,
            })} style={btnStyle('secondary')}>Skip (Non-QB)</button>
          </div>
        </div>
      )}

      {phase === 'result' && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 72, fontWeight: 900,
            color: gradeColor(qbGrade(finalPct)),
            textShadow: `0 0 40px ${gradeColor(qbGrade(finalPct))}50`,
          }}>
            {completions}/10
          </div>
          <div style={{ fontSize: 18, color: C.txtSub }}>
            Completions ({finalPct}%)
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: gradeColor(qbGrade(finalPct)), marginTop: 8 }}>
            Grade: {qbGrade(finalPct)}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
            <button onClick={start} style={btnStyle('secondary')}>Retry</button>
            <button onClick={submit} style={btnStyle('primary')}>Lock In Score</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Results Screen ─────────────────────────────────────────────────────────────
function ResultsScreen({
  results,
  onPlayAgain,
  onBack,
}: {
  results: EventResult[];
  onPlayAgain: () => void;
  onBack: () => void;
}) {
  const weights = { dash: 0.3, bench: 0.15, wonderlic: 0.2, routes: 0.2, qb: 0.15 };
  let total = 0;
  let totalWeight = 0;
  results.forEach(r => {
    if (!r.skipped) {
      const w = weights[r.key] ?? 0.2;
      total += r.numericScore * w;
      totalWeight += w;
    }
  });
  const avg = totalWeight > 0 ? total / totalWeight : 0;
  const overallGrade = avg >= 95 ? 'A+' : avg >= 88 ? 'A' : avg >= 82 ? 'A-' : avg >= 76 ? 'B+' : avg >= 70 ? 'B' : avg >= 64 ? 'B-' : avg >= 58 ? 'C+' : avg >= 52 ? 'C' : 'D';

  const shareText = results.map(r => `${r.icon} ${r.label}: ${r.value} (${r.grade})`).join('\n') + `\n\nOverall: ${overallGrade}`;

  useEffect(() => {
    localStorage.setItem('combine-results', JSON.stringify({ results, overallGrade, avg }));
  }, []);

  const overallColor = gradeColor(overallGrade);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Overall banner */}
      <div style={{
        textAlign: 'center', padding: '40px 24px 28px',
        background: `linear-gradient(135deg, ${C.surface} 0%, ${overallColor}08 100%)`,
        borderRadius: 16,
        border: `1px solid ${overallColor}30`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, transparent, ${overallColor}, transparent)`,
        }} />
        <div style={{ fontSize: 13, color: C.txtSub, letterSpacing: 3, marginBottom: 10, fontWeight: 600 }}>
          YOUR COMBINE GRADE
        </div>
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          style={{
            fontSize: 108, fontWeight: 900, lineHeight: 1,
            color: overallColor,
            textShadow: `0 0 80px ${overallColor}50`,
          }}
        >
          {overallGrade}
        </motion.div>
        <div style={{ fontSize: 18, color: C.txtSub, marginTop: 14, fontWeight: 500 }}>
          {draftProjection(overallGrade)}
        </div>
      </div>

      {/* Event result cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {results.map((r, i) => {
          const gc = gradeColor(r.grade);
          return (
            <motion.div
              key={r.key}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: `linear-gradient(135deg, ${C.surface} 0%, ${gc}06 100%)`,
                borderRadius: 12,
                padding: '14px 20px',
                border: `1px solid ${C.border}`,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                background: gc,
                boxShadow: `0 0 8px ${gc}50`,
              }} />
              <span style={{ fontSize: 26, marginLeft: 8 }}>{r.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 6, color: C.txt }}>{r.label}</div>
                <div style={{
                  height: 6, background: C.elevated, borderRadius: 3, overflow: 'hidden',
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.numericScore}%` }}
                    transition={{ delay: i * 0.08 + 0.3, duration: 0.6 }}
                    style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${gc}88, ${gc})`,
                      borderRadius: 3,
                      boxShadow: `0 0 6px ${gc}40`,
                    }}
                  />
                </div>
              </div>
              <div style={{ textAlign: 'right', minWidth: 90 }}>
                <div style={{ fontWeight: 600, color: C.txtSub, fontSize: 13 }}>{r.value}</div>
                <div style={{ fontWeight: 900, color: gc, fontSize: 22 }}>{r.grade}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', paddingTop: 8 }}>
        <button onClick={() => navigator.clipboard.writeText(shareText)} style={btnStyle('secondary')}>
          Share Results
        </button>
        <button onClick={onPlayAgain} style={btnStyle('secondary')}>Play Again</button>
        <button onClick={onBack} style={btnStyle('primary')}>Back to Draft</button>
      </div>
    </motion.div>
  );
}

// ─── Event config ─────────────────────────────────────────────────────────────
const EVENT_LIST: { key: EventKey; label: string; icon: string; desc: string }[] = [
  { key: 'dash', label: '40-Yard Dash', icon: '🏃', desc: 'Sprint speed test — hold for power, release at the optimal window' },
  { key: 'bench', label: 'Bench Press', icon: '🏋️', desc: 'Max reps at 225 lbs in 60 seconds' },
  { key: 'wonderlic', label: 'Football IQ', icon: '🧠', desc: '12 football knowledge questions, 90 seconds' },
  { key: 'routes', label: 'Route Running', icon: '🎯', desc: 'Click cones along a route path as they appear' },
  { key: 'qb', label: 'QB Accuracy', icon: '🏈', desc: '10 throws — hit glowing receivers before the window closes' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CombinePage() {
  const navigate = useNavigate();
  const [currentEventIdx, setCurrentEventIdx] = useState(0);
  const [results, setResults] = useState<EventResult[]>([]);
  const [done, setDone] = useState(false);

  const handleComplete = (result: EventResult) => {
    const newResults = [...results, result];
    setResults(newResults);
    if (currentEventIdx + 1 >= EVENT_LIST.length) {
      setDone(true);
    } else {
      setCurrentEventIdx(i => i + 1);
    }
  };

  const reset = () => {
    setCurrentEventIdx(0);
    setResults([]);
    setDone(false);
  };

  const currentEvent = EVENT_LIST[currentEventIdx];

  // Event progress indicator for nav right slot
  const progressDots = !done ? (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {EVENT_LIST.map((e, i) => (
        <div
          key={e.key}
          title={e.label}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: i < currentEventIdx
              ? C.green
              : i === currentEventIdx
                ? C.goldSub
                : C.elevated,
            border: `2px solid ${
              i < currentEventIdx
                ? C.green
                : i === currentEventIdx
                  ? C.gold
                  : C.border
            }`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
            transition: 'all 0.3s',
            boxShadow: i === currentEventIdx ? `0 0 14px ${C.gold}40` : 'none',
          }}
        >
          {i < currentEventIdx ? '✓' : e.icon}
        </div>
      ))}
    </div>
  ) : null;

  return (
    <>
      <style>{`
        ${GLOBAL_CSS}
        @keyframes leg-run {
          from { transform: skewX(-20deg); }
          to { transform: skewX(20deg); }
        }
      `}</style>
      <AppShell backTo="/game" title="NFL Combine" right={progressDots}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ResultsScreen results={results} onPlayAgain={reset} onBack={() => navigate('/game')} />
              </motion.div>
            ) : (
              <motion.div
                key={currentEvent.key}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
              >
                {/* Event header card */}
                <div style={{
                  background: `linear-gradient(135deg, ${C.surface} 0%, ${C.elevated} 100%)`,
                  borderRadius: 16,
                  padding: '24px 28px',
                  marginBottom: 28,
                  border: `1px solid ${C.borderHi}`,
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
                    background: `linear-gradient(90deg, ${C.gold}, ${C.blueBright})`,
                  }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 6 }}>
                    <span style={{ fontSize: 42 }}>{currentEvent.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, color: C.gold, letterSpacing: 3, fontWeight: 700, marginBottom: 2 }}>
                        EVENT {currentEventIdx + 1} OF {EVENT_LIST.length}
                      </div>
                      <div style={{ fontSize: 26, fontWeight: 900, color: C.txt }}>{currentEvent.label}</div>
                    </div>
                  </div>
                  <div style={{ color: C.txtSub, fontSize: 14, marginTop: 4 }}>{currentEvent.desc}</div>
                </div>

                {/* Event component */}
                {currentEvent.key === 'dash' && <DashEvent onComplete={handleComplete} />}
                {currentEvent.key === 'bench' && <BenchEvent onComplete={handleComplete} />}
                {currentEvent.key === 'wonderlic' && <WonderlicEvent onComplete={handleComplete} />}
                {currentEvent.key === 'routes' && <RouteEvent onComplete={handleComplete} />}
                {currentEvent.key === 'qb' && <QBEvent onComplete={handleComplete} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AppShell>
    </>
  );
}
