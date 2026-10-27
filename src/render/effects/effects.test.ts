import { big, type CombatEvent, formatNumber } from '@/engine';

import {
  createPool,
  DURATION_MS,
  type EffectKind,
  effectFrame,
  effectsForEvents,
  FLASH_MIN_GAP_MS,
  POOL_SIZES,
  REDUCED_DURATION_MS,
  spawnInto,
  type SpawnRequest,
  starPath,
  variantOf,
} from './effects';

const stage = { hand: { x: 96, y: 168 }, target: { x: 270, y: 222 } };
const hit = (source: 'hero' | 'tap' | 'shikigami' | 'raijin', crit = false, atMs = 0) =>
  ({ type: 'hit', source, damage: big(1234), crit, atMs }) as const satisfies CombatEvent;
const kinds = (requests: readonly SpawnRequest[]) => requests.map((request) => request.kind);
const spawn = (kind: EffectKind, delayMs = 0): SpawnRequest => ({
  kind,
  delayMs,
  x: 10,
  y: 20,
  toX: 10,
  toY: 20,
  size: 1,
  variant: 0.5,
  text: '',
});

describe('effectsForEvents', () => {
  it('throws an ofuda for the hero and taps, which strikes when it lands', () => {
    const requests = effectsForEvents([hit('tap', false, 30)], stage, 'full', 1);
    expect(kinds(requests)).toEqual(['ofuda', 'impact', 'damage']);
    expect(requests[0]).toMatchObject({ delayMs: 30, x: 96, y: 168, toX: 270, toY: 222 });
    expect(requests[1].delayMs).toBe(30 + DURATION_MS.ofuda);
    expect(requests[2].text).toBe(formatNumber(big(1234)));
  });

  it('strikes at once for shikigami and talismans, smaller for shikigami', () => {
    const [impact] = effectsForEvents([hit('shikigami', false, 50)], stage, 'full', 1);
    const [bigImpact] = effectsForEvents([hit('raijin')], stage, 'full', 1);
    expect(impact).toMatchObject({ kind: 'impact', delayMs: 50 });
    expect(impact.size).toBeLessThan(bigImpact.size);
  });

  it('adds the label, speed lines and an impact frame on a critical hit', () => {
    const requests = effectsForEvents([hit('shikigami', true)], stage, 'full', 1);
    expect(kinds(requests)).toEqual(['impact', 'damage', 'critLabel', 'speedLines', 'flash']);
    const [, plain] = effectsForEvents([hit('shikigami')], stage, 'full', 1);
    expect(requests[1].size).toBeGreaterThan(plain.size);
  });

  it('scatters sakura petals when a yōkai falls', () => {
    const defeated: CombatEvent = {
      type: 'yokaiDefeated',
      wave: 1,
      seed: 1,
      souls: big(2),
      atMs: 0,
    };
    const petals = effectsForEvents([defeated], stage, 'full', 1);
    expect(kinds(petals)).toEqual(Array(6).fill('petal'));
    expect(new Set(petals.map((petal) => petal.variant)).size).toBe(6);
  });

  it('keeps only fading numbers and impacts when motion is reduced', () => {
    const defeated: CombatEvent = {
      type: 'yokaiDefeated',
      wave: 1,
      seed: 1,
      souls: big(2),
      atMs: 0,
    };
    const requests = effectsForEvents([hit('tap', true), defeated], stage, 'reduced', 1);
    expect(kinds(requests)).toEqual(['impact', 'damage', 'critLabel']);
    expect(requests[0].delayMs).toBe(0);
  });

  it('places the same step the same way, and the next step elsewhere', () => {
    const [, first] = effectsForEvents([hit('raijin')], stage, 'full', 7);
    const [, again] = effectsForEvents([hit('raijin')], stage, 'full', 7);
    const [, next] = effectsForEvents([hit('raijin')], stage, 'full', 8);
    expect(again).toEqual(first);
    expect(next.x).not.toBe(first.x);
  });

  it('ignores events without effects', () => {
    const cast: CombatEvent = { type: 'talismanCast', talisman: 'raijin', atMs: 0 };
    expect(effectsForEvents([cast], stage, 'full', 1)).toEqual([]);
  });
});

describe('variantOf', () => {
  it('stays in [0, 1[', () => {
    for (let index = 0; index < 100; index += 1) {
      const value = variantOf(index * 31, index);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('effect pool', () => {
  it('allocates every slot once, idle', () => {
    const pool = createPool();
    const total = Object.values(POOL_SIZES).reduce((sum, size) => sum + size, 0);
    expect(pool).toHaveLength(total);
    expect(pool.every((slot) => effectFrame(slot, 0, 'full').opacity === 0)).toBe(true);
  });

  it('starts a request in a slot of its kind, after its delay', () => {
    const pool = spawnInto(createPool(), [spawn('damage', 40)], 1000);
    const started = pool.filter((slot) => slot.startMs === 1040);
    expect(started).toEqual([expect.objectContaining({ kind: 'damage', x: 10 })]);
  });

  it('recycles the oldest effect of a kind when all its slots are busy', () => {
    let pool = createPool();
    for (let index = 0; index < POOL_SIZES.damage; index += 1) {
      pool = spawnInto(pool, [spawn('damage')], index * 10);
    }
    pool = spawnInto(pool, [spawn('damage')], 500);
    const starts = pool.filter((slot) => slot.kind === 'damage').map((slot) => slot.startMs);
    expect(starts).not.toContain(0);
    expect(starts).toContain(500);
    expect(pool).toHaveLength(createPool().length);
  });

  it('never flashes twice within the minimum gap', () => {
    const once = spawnInto(createPool(), [spawn('flash')], 1000);
    const twice = spawnInto(once, [spawn('flash')], 1000 + FLASH_MIN_GAP_MS - 1);
    const later = spawnInto(once, [spawn('flash')], 1000 + FLASH_MIN_GAP_MS);
    const flashStart = (pool: typeof once) => pool.find((slot) => slot.kind === 'flash')?.startMs;
    expect(flashStart(twice)).toBe(1000);
    expect(flashStart(later)).toBe(1000 + FLASH_MIN_GAP_MS);
  });
});

describe('effectFrame', () => {
  const started = (kind: EffectKind, extra: Partial<SpawnRequest> = {}) => {
    const pool = spawnInto(createPool(), [{ ...spawn(kind), ...extra }], 0);
    const slot = pool.find((candidate) => candidate.kind === kind && candidate.startMs === 0);
    if (slot === undefined) {
      throw new Error(`No ${kind} slot started`);
    }
    return slot;
  };

  it('hides an effect before its start and after its end', () => {
    const slot = started('damage');
    expect(effectFrame(slot, -1, 'full').opacity).toBe(0);
    expect(effectFrame(slot, DURATION_MS.damage, 'full').opacity).toBe(0);
  });

  it('pops the damage number in, then makes it rise and fade', () => {
    const slot = started('damage');
    const burst = effectFrame(slot, DURATION_MS.damage * 0.12, 'full');
    const late = effectFrame(slot, DURATION_MS.damage * 0.95, 'full');
    expect(burst.scale).toBeCloseTo(1.18);
    expect(late.y).toBeLessThan(slot.y - 24);
    expect(late.opacity).toBeLessThan(0.3);
  });

  it('flies the ofuda from the hand to the target, in an arc', () => {
    const slot = started('ofuda', { x: 0, y: 100, toX: 200, toY: 100 });
    const middle = effectFrame(slot, DURATION_MS.ofuda / 2, 'full');
    expect(middle.x).toBeCloseTo(100);
    expect(middle.y).toBeLessThan(100);
  });

  it('only fades, in place and without turning, when motion is reduced', () => {
    const slot = started('impact', { variant: 0.9 });
    const frame = effectFrame(slot, REDUCED_DURATION_MS.impact / 2, 'reduced');
    expect(frame).toEqual({ x: slot.x, y: slot.y, scale: 1, rotation: 0, opacity: 0.5 });
  });

  it('never shows the effects that reduced motion removes', () => {
    for (const kind of ['ofuda', 'speedLines', 'flash', 'petal'] as const) {
      expect(effectFrame(started(kind), 10, 'reduced').opacity).toBe(0);
    }
  });
});

describe('starPath', () => {
  it('alternates outer and inner points', () => {
    const path = starPath(4, 10, 5);
    expect(path.startsWith('M0.0 -10.0 L')).toBe(true);
    expect(path.split(' L')).toHaveLength(8);
  });
});

describe('damage numbers', () => {
  it('scatter over an area instead of a line', () => {
    const hits = Array.from({ length: 8 }, (_, index) => hit('shikigami', false, index * 10));
    const numbers = effectsForEvents(hits, stage, 'full', 3).filter(
      (effect) => effect.kind === 'damage',
    );
    const xs = numbers.map((number) => number.x);
    const ys = numbers.map((number) => number.y);
    const range = (values: number[]) => Math.max(...values) - Math.min(...values);
    expect(range(xs)).toBeGreaterThan(40);
    expect(range(ys)).toBeGreaterThan(20);
    // Not on one line: the y offset does not follow the x offset.
    const slopes = numbers.slice(1).map((n, i) => (n.y - ys[i]) / (n.x - xs[i]));
    expect(new Set(slopes.map((slope) => slope.toFixed(2))).size).toBeGreaterThan(1);
  });
});
