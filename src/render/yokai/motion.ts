// Idle animations of the prototype (CSS keyframes), as pure functions of the time in ms. They run
// on the UI thread (worklets) and are tested in Node.

const TWO_PI = Math.PI * 2;

/** 0 → 1 → 0 over a period, smoothly (ease-in-out between the keyframes). */
function wave(timeMs: number, periodMs: number): number {
  'worklet';
  const phase = (((timeMs % periodMs) + periodMs) % periodMs) / periodMs;
  return (1 - Math.cos(TWO_PI * phase)) / 2;
}

export const FLOAT_PERIOD_MS = 3200;
export const BLINK_PERIOD_MS = 4400;
export const TONGUE_PERIOD_MS = 1300;
export const FLAME_PERIOD_MS = 900;
export const SPARK_PERIOD_MS = 1600;

/** Floats up by 6 units and back, started `delaySeconds` into the cycle. */
export function floatOffset(timeMs: number, delaySeconds: number): number {
  'worklet';
  return -6 * wave(timeMs + delaySeconds * 1000, FLOAT_PERIOD_MS);
}

/** Eyes stay open, close quickly at 92–95 % of the cycle, then reopen. */
export function blinkScale(timeMs: number): number {
  'worklet';
  const phase = (timeMs % BLINK_PERIOD_MS) / BLINK_PERIOD_MS;
  if (phase < 0.92) {
    return 1;
  }
  if (phase < 0.95) {
    return 1 - (0.9 * (phase - 0.92)) / 0.03;
  }
  return 0.1 + (0.9 * (phase - 0.95)) / 0.05;
}

/** The tongue swings between −8° and 8°, in radians. */
export function tongueAngle(timeMs: number): number {
  'worklet';
  return ((-8 + 16 * wave(timeMs, TONGUE_PERIOD_MS)) * Math.PI) / 180;
}

/** The onibi flame stretches sideways and squashes. */
export function flameScale(timeMs: number): { x: number; y: number } {
  'worklet';
  const k = wave(timeMs, FLAME_PERIOD_MS);
  return { x: 1 + 0.12 * k, y: 1 - 0.1 * k };
}

/** Sparkles grow and shine, then fade. */
export function sparkle(timeMs: number): { scale: number; opacity: number } {
  'worklet';
  const k = wave(timeMs, SPARK_PERIOD_MS);
  return { scale: 0.6 + 0.4 * k, opacity: 0.25 + 0.75 * k };
}
