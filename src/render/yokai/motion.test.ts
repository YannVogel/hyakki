import * as fc from 'fast-check';

import {
  BLINK_PERIOD_MS,
  blinkScale,
  FLOAT_PERIOD_MS,
  flameScale,
  floatOffset,
  sparkle,
  tongueAngle,
} from './motion';

const anyTime = fc.integer({ min: 0, max: 10_000_000 });

describe('idle animations', () => {
  it('float between 0 and 6 units up, offset by the seed delay', () => {
    expect(floatOffset(0, 0)).toBeCloseTo(0, 10);
    expect(floatOffset(FLOAT_PERIOD_MS / 2, 0)).toBeCloseTo(-6, 10);
    expect(floatOffset(0, 1.6)).toBeCloseTo(-6, 10);
    fc.assert(
      fc.property(anyTime, fc.double({ min: 0, max: 3, noNaN: true }), (time, delay) => {
        const offset = floatOffset(time, delay);
        expect(offset).toBeLessThanOrEqual(1e-9);
        expect(offset).toBeGreaterThanOrEqual(-6 - 1e-9);
      }),
    );
  });

  it('blink once per cycle, closing to 10 %', () => {
    expect(blinkScale(0)).toBe(1);
    expect(blinkScale(BLINK_PERIOD_MS * 0.5)).toBe(1);
    expect(blinkScale(BLINK_PERIOD_MS * 0.95)).toBeCloseTo(0.1, 10);
    expect(blinkScale(BLINK_PERIOD_MS * 0.999)).toBeGreaterThan(0.95);
  });

  it('keep every animation within its keyframes', () => {
    fc.assert(
      fc.property(anyTime, (time) => {
        expect(Math.abs(tongueAngle(time))).toBeLessThanOrEqual((8 * Math.PI) / 180 + 1e-12);
        const flame = flameScale(time);
        expect(flame.x).toBeGreaterThanOrEqual(1);
        expect(flame.x).toBeLessThanOrEqual(1.12 + 1e-12);
        expect(flame.y).toBeGreaterThanOrEqual(0.9 - 1e-12);
        const spark = sparkle(time);
        expect(spark.opacity).toBeGreaterThanOrEqual(0.25 - 1e-12);
        expect(spark.scale).toBeLessThanOrEqual(1 + 1e-12);
        const blink = blinkScale(time);
        expect(blink).toBeGreaterThanOrEqual(0.1 - 1e-12);
        expect(blink).toBeLessThanOrEqual(1);
      }),
    );
  });
});
