import * as fc from 'fast-check';

import { createRng, mulberry32 } from './mulberry32';

const take = (next: () => number, count: number) => Array.from({ length: count }, () => next());

describe('mulberry32', () => {
  it('matches the prototype for seed 2026', () => {
    // Values produced by running design/prototypes/fabrique-a-yokai.html's script in Node.
    expect(take(mulberry32(2026), 5)).toEqual([
      0.45540769933722913, 0.30849614599719644, 0.6611574492417276, 0.6184752183035016,
      0.15228010178543627,
    ]);
  });

  it('replays the same sequence for the same seed', () => {
    fc.assert(
      fc.property(fc.integer(), (seed) => {
        expect(take(mulberry32(seed), 20)).toEqual(take(mulberry32(seed), 20));
      }),
    );
  });

  it('always draws in [0, 1)', () => {
    fc.assert(
      fc.property(fc.integer(), (seed) => {
        for (const value of take(mulberry32(seed), 50)) {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThan(1);
        }
      }),
    );
  });

  it('resumes exactly from a saved state', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer({ min: 0, max: 30 }), (seed, drawn) => {
        const rng = createRng(seed);
        take(rng.next, drawn);
        const resumed = createRng(rng.getState());
        expect(take(resumed.next, 10)).toEqual(take(rng.next, 10));
      }),
    );
  });

  it('is uniform over 100 000 draws (chi-squared, 10 buckets)', () => {
    const buckets = new Array<number>(10).fill(0);
    const next = mulberry32(123456789);
    const draws = 100_000;
    for (let i = 0; i < draws; i++) {
      buckets[Math.floor(next() * 10)]++;
    }
    const expected = draws / 10;
    const chiSquared = buckets.reduce((sum, count) => sum + (count - expected) ** 2 / expected, 0);
    // 9 degrees of freedom: 27.88 is the critical value at p = 0.001.
    expect(chiSquared).toBeLessThan(27.88);
  });
});
