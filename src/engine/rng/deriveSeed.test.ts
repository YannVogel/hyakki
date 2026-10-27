import * as fc from 'fast-check';

import { deriveSeed } from './deriveSeed';

describe('deriveSeed', () => {
  it('is stable across versions (regression values)', () => {
    expect([deriveSeed(0, 0), deriveSeed(1, 1), deriveSeed(2026, 100)]).toMatchSnapshot();
  });

  it('is a deterministic unsigned 32-bit integer', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (seed, index) => {
        const derived = deriveSeed(seed, index);
        expect(derived).toBe(deriveSeed(seed, index));
        expect(Number.isInteger(derived)).toBe(true);
        expect(derived).toBeGreaterThanOrEqual(0);
        expect(derived).toBeLessThan(2 ** 32);
      }),
    );
  });

  it('gives distinct seeds to the first 10 000 waves of a parade', () => {
    fc.assert(
      fc.property(fc.integer(), (runSeed) => {
        const seeds = new Set(
          Array.from({ length: 10_000 }, (_, wave) => deriveSeed(runSeed, wave)),
        );
        expect(seeds.size).toBe(10_000);
      }),
      { numRuns: 20 },
    );
  });

  it('depends on both the seed and the index', () => {
    expect(deriveSeed(1, 2)).not.toBe(deriveSeed(2, 1));
    expect(deriveSeed(7, 0)).not.toBe(deriveSeed(8, 0));
  });
});
