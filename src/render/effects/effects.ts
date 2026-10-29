// Combat effects as pure data: what to spawn for the engine's events, a fixed pool of slots that
// recycles the oldest effect of a kind, and each effect's frame as a function of time. The frame
// functions run on the UI thread (worklets) and are tested in Node. Positions are in the
// 366 × 400 frame of the battle scene.
import { type CombatEvent, formatNumber, type HitSource } from '@/engine';

export type EffectKind =
  'impact' | 'ofuda' | 'damage' | 'critLabel' | 'speedLines' | 'flash' | 'petal';

/** `reduced` follows "reduce motion": short fades, nothing moves, turns or flashes. */
export type MotionLevel = 'full' | 'reduced';

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** Where the hero throws from and where the enemy stands. */
export interface EffectStage {
  readonly hand: Point;
  readonly target: Point;
}

export interface SpawnRequest {
  readonly kind: EffectKind;
  /** Delay before the effect starts, from the moment the step's events are shown. */
  readonly delayMs: number;
  readonly x: number;
  readonly y: number;
  /** End of the ofuda's flight. */
  readonly toX: number;
  readonly toY: number;
  readonly size: number;
  /** 0 to 1: varies angles and drifts from one effect to the next. */
  readonly variant: number;
  readonly text: string;
}

export interface EffectSlot extends SpawnRequest {
  readonly startMs: number;
}

export interface EffectFrame {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  /** Radians. */
  readonly rotation: number;
  readonly opacity: number;
}

/**
 * Slots per kind, allocated once: at 10 hits per second, the oldest effects are recycled. Six damage
 * numbers at most stay readable when the whole team strikes.
 */
export const POOL_SIZES: Readonly<Record<EffectKind, number>> = {
  impact: 3,
  ofuda: 4,
  damage: 6,
  critLabel: 2,
  speedLines: 1,
  flash: 1,
  petal: 12,
};

export const DURATION_MS: Readonly<Record<EffectKind, number>> = {
  impact: 260,
  ofuda: 140,
  damage: 750,
  critLabel: 750,
  speedLines: 300,
  flash: 120,
  petal: 1100,
};

/** With reduced motion, only short fades remain (0: the effect is not shown). */
export const REDUCED_DURATION_MS: Readonly<Record<EffectKind, number>> = {
  impact: 200,
  ofuda: 0,
  damage: 600,
  critLabel: 600,
  speedLines: 0,
  flash: 0,
  petal: 0,
};

/** At most 2.5 flashes per second, under the 3 per second of photosensitivity guidelines. */
export const FLASH_MIN_GAP_MS = 400;
const FLASH_OPACITY = 0.55;
const PETALS_PER_DEFEAT = 6;
const OFUDA_ARC = 30;
const DAMAGE_RISE = 24;
const DAMAGE_FADE_RISE = 40;
const PETAL_SPREAD = 70;
const PETAL_FALL = 60;
const NUMBER_SPREAD_X = 150;
const NUMBER_SPREAD_Y = 90;
const IDLE_START_MS = -1e9;

// The player's own strikes stand out; the team's frequent hits stay discreet.
const SOURCE_SIZE: Readonly<Record<HitSource, number>> = {
  hero: 0.85,
  tap: 1,
  shikigami: 0.6,
  kitsunebi: 1.3,
  raijin: 1.3,
};
const CRIT_SIZE = 1.3;
const THROWN: readonly HitSource[] = ['hero', 'tap'];

const HIDDEN: EffectFrame = { x: 0, y: 0, scale: 0, rotation: 0, opacity: 0 };
// The display font has no narrow no-break space (U+202F), the French digit separator, and Skia
// draws with that font alone (no fallback, unlike React Native's Text): Android showed a tofu box.
// The thin space, which the font has, takes its place.
const NARROW_NBSP = /\u202f/g;
const THIN_SPACE = '\u2009';
const drawableNumber = (text: string) => text.replace(NARROW_NBSP, THIN_SPACE);

/** Every slot of the pool, idle, grouped by kind. */
export function createPool(): EffectSlot[] {
  return (Object.keys(POOL_SIZES) as EffectKind[]).flatMap((kind) =>
    Array.from({ length: POOL_SIZES[kind] }, () => ({
      kind,
      delayMs: 0,
      x: 0,
      y: 0,
      toX: 0,
      toY: 0,
      size: 1,
      variant: 0,
      text: '',
      startMs: IDLE_START_MS,
    })),
  );
}

/** Starts the requests at `nowMs` (plus their delay), each in the oldest slot of its kind. */
export function spawnInto(
  slots: readonly EffectSlot[],
  requests: readonly SpawnRequest[],
  nowMs: number,
): EffectSlot[] {
  'worklet';
  const next = slots.slice();
  for (const request of requests) {
    const startMs = nowMs + request.delayMs;
    let oldest = -1;
    for (let index = 0; index < next.length; index += 1) {
      if (
        next[index].kind === request.kind &&
        (oldest === -1 || next[index].startMs < next[oldest].startMs)
      ) {
        oldest = index;
      }
    }
    if (oldest === -1) {
      continue;
    }
    // The flash has a single slot: its last start is the latest flash.
    const tooSoon = request.kind === 'flash' && startMs - next[oldest].startMs < FLASH_MIN_GAP_MS;
    if (!tooSoon) {
      next[oldest] = { ...request, startMs };
    }
  }
  return next;
}

/** A stable pseudo-random number in [0, 1[ for the index-th effect of a batch. */
export function variantOf(salt: number, index: number): number {
  const value = Math.sin(salt * 12.9898 + index * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function request(
  kind: EffectKind,
  delayMs: number,
  at: Point,
  options: Partial<Omit<SpawnRequest, 'kind' | 'delayMs' | 'x' | 'y'>> = {},
): SpawnRequest {
  return {
    kind,
    delayMs,
    x: at.x,
    y: at.y,
    toX: at.x,
    toY: at.y,
    size: 1,
    variant: 0,
    text: '',
    ...options,
  };
}

export type HitEvent = Extract<CombatEvent, { type: 'hit' }>;

/** When a hit lands, from the moment the step's events are shown: a thrown ofuda flies first. */
export function landingDelayMs(event: HitEvent, motion: MotionLevel): number {
  const thrown = motion === 'full' && THROWN.includes(event.source);
  return event.atMs + (thrown ? DURATION_MS.ofuda : 0);
}

function hitEffects(
  event: HitEvent,
  stage: EffectStage,
  motion: MotionLevel,
  variant: number,
  spread: number,
): SpawnRequest[] {
  const full = motion === 'full';
  const thrown = full && THROWN.includes(event.source);
  const landsAt = landingDelayMs(event, motion);
  const size = SOURCE_SIZE[event.source] * (event.crit ? CRIT_SIZE : 1);
  const { target } = stage;
  // Above and left of the enemy, clear of its HUD in the top right corner. Two independent draws
  // scatter the numbers of quick hits instead of lining them up.
  const number = {
    x: target.x - 90 + (variant - 0.5) * NUMBER_SPREAD_X,
    y: target.y - 85 + (spread - 0.5) * NUMBER_SPREAD_Y,
  };
  const effects = [
    request('impact', landsAt, target, { size, variant }),
    request('damage', landsAt, number, {
      size,
      variant,
      text: drawableNumber(formatNumber(event.damage)),
    }),
  ];
  if (thrown) {
    effects.unshift(
      request('ofuda', event.atMs, stage.hand, { toX: target.x, toY: target.y, variant }),
    );
  }
  if (event.crit) {
    effects.push(request('critLabel', landsAt, { x: number.x, y: number.y - 34 * size }));
    if (full) {
      effects.push(
        request('speedLines', landsAt, target),
        request('flash', landsAt, { x: 0, y: 0 }),
      );
    }
  }
  return effects;
}

/**
 * The effects of one engine step. `salt` (the batch number) varies positions from one step to
 * the next, the same way for the same step.
 */
export function effectsForEvents(
  events: readonly CombatEvent[],
  stage: EffectStage,
  motion: MotionLevel,
  salt: number,
): SpawnRequest[] {
  return events.flatMap((event, index) => {
    const variant = variantOf(salt, index);
    switch (event.type) {
      case 'hit':
        return hitEffects(event, stage, motion, variant, variantOf(salt + 0.5, index));
      case 'yokaiDefeated':
        return motion === 'full'
          ? Array.from({ length: PETALS_PER_DEFEAT }, (_, petal) =>
              request('petal', event.atMs, stage.target, {
                variant: (petal + variant) / PETALS_PER_DEFEAT,
              }),
            )
          : [];
      default:
        return [];
    }
  });
}

/** CSS `hk-pop` of the mockup: bursts in, rises, then fades while rising further. */
function pop(t: number): { dy: number; scale: number; opacity: number } {
  'worklet';
  if (t < 0.12) {
    const k = t / 0.12;
    return { dy: 8 * (1 - k), scale: 0.6 + 0.58 * k, opacity: k };
  }
  if (t < 0.24) {
    return { dy: 0, scale: 1.18 - (0.18 * (t - 0.12)) / 0.12, opacity: 1 };
  }
  if (t < 0.78) {
    return { dy: (-DAMAGE_RISE * (t - 0.24)) / 0.54, scale: 1, opacity: 1 };
  }
  const k = (t - 0.78) / 0.22;
  return { dy: -DAMAGE_RISE - (DAMAGE_FADE_RISE - DAMAGE_RISE) * k, scale: 1, opacity: 1 - k };
}

/** Where and how an effect is drawn at `nowMs`; hidden before its start and after its end. */
export function effectFrame(slot: EffectSlot, nowMs: number, motion: MotionLevel): EffectFrame {
  'worklet';
  const duration = (motion === 'full' ? DURATION_MS : REDUCED_DURATION_MS)[slot.kind];
  const t = duration > 0 ? (nowMs - slot.startMs) / duration : -1;
  if (t < 0 || t >= 1) {
    return HIDDEN;
  }
  const still = { x: slot.x, y: slot.y, scale: slot.size, rotation: 0, opacity: 1 };
  if (motion === 'reduced') {
    return { ...still, opacity: 1 - t };
  }
  switch (slot.kind) {
    case 'ofuda':
      return {
        ...still,
        x: slot.x + (slot.toX - slot.x) * t,
        y: slot.y + (slot.toY - slot.y) * t - Math.sin(Math.PI * t) * OFUDA_ARC,
        rotation: t * 4 * Math.PI,
      };
    case 'impact': {
      const grow =
        t < 0.3 ? 0.4 + 0.75 * (1 - (1 - t / 0.3) ** 2) : 1.15 - (0.15 * (t - 0.3)) / 0.7;
      return {
        ...still,
        scale: slot.size * grow,
        rotation: (slot.variant - 0.5) * 0.5,
        opacity: t < 0.5 ? 1 : 1 - (t - 0.5) / 0.5,
      };
    }
    case 'damage':
    case 'critLabel': {
      const { dy, scale, opacity } = pop(t);
      return { ...still, y: slot.y + dy, scale: slot.size * scale, opacity };
    }
    case 'speedLines':
      return { ...still, scale: 0.9 + 0.2 * t, opacity: 1 - t };
    case 'flash':
      return { ...still, scale: 1, opacity: FLASH_OPACITY * (1 - t) };
    case 'petal': {
      const angle = -Math.PI / 2 + (slot.variant - 0.5) * Math.PI * 1.4;
      return {
        ...still,
        x: slot.x + Math.cos(angle) * PETAL_SPREAD * t,
        y: slot.y + Math.sin(angle) * PETAL_SPREAD * t + PETAL_FALL * t * t,
        rotation: (slot.variant + t) * 2 * Math.PI,
        opacity: t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3,
      };
    }
  }
}

/** A star with `points` branches, centered on (0, 0), as an SVG path. */
export function starPath(points: number, outer: number, inner: number): string {
  const vertices = Array.from({ length: points * 2 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = (index * Math.PI) / points - Math.PI / 2;
    return `${(Math.cos(angle) * radius).toFixed(1)} ${(Math.sin(angle) * radius).toFixed(1)}`;
  });
  return `M${vertices.join(' L')} Z`;
}

/** Manga speed lines converging on (0, 0), between two radii. */
export function speedLinesPath(count: number, inner: number, outer: number): string {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index * 2 * Math.PI) / count;
    // Alternate lengths, like hand-drawn lines.
    const start = inner + (index % 3) * 12;
    const point = (radius: number) =>
      `${(Math.cos(angle) * radius).toFixed(1)} ${(Math.sin(angle) * radius).toFixed(1)}`;
    return `M${point(start)} L${point(outer)}`;
  }).join(' ');
}
