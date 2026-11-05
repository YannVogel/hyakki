import * as fc from 'fast-check';

import { big, eq, gte, lt, mul, sub, toNumber } from '../numbers';
import { arbitraryBigNum } from '../testing/arbitraries';
import { geometricCost, maxGeometricCount } from './geometric';

describe('geometricCost', () => {
  it('is free for no level, and costs the first price for one', () => {
    expect(eq(geometricCost(big(5), 1.12, 0), 0)).toBe(true);
    expect(toNumber(geometricCost(big(5), 1.12, 1))).toBeCloseTo(5, 12);
  });
});

describe('maxGeometricCount', () => {
  it('affords as many levels as the budget allows, never more, within the limit', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(1.12, 1.15, 1.18, 2),
        arbitraryBigNum,
        fc.integer({ min: 1, max: 5000 }),
        (growth, budget, limit) => {
          const first = big(100);
          const count = maxGeometricCount(first, growth, budget, limit);
          expect(count).toBeLessThanOrEqual(limit);
          expect(gte(budget, geometricCost(first, growth, count))).toBe(true);
          if (count < limit) {
            expect(lt(budget, geometricCost(first, growth, count + 1))).toBe(true);
          }
        },
      ),
    );
  });

  // The logarithm guesses the count; float rounding can put it one level off either way.
  it('corrects a guess one level too high or too low', () => {
    const justBelowNine = sub(
      geometricCost(big(1), 1.12, 9),
      mul(geometricCost(big(1), 1.12, 9), 1e-15),
    );
    expect(maxGeometricCount(big(1), 1.12, justBelowNine)).toBe(8);
    expect(maxGeometricCount(big(1), 1.12, geometricCost(big(1), 1.12, 2))).toBe(2);
  });

  it('affords nothing below the first price or without room left', () => {
    expect(maxGeometricCount(big(100), 1.18, big(99))).toBe(0);
    expect(maxGeometricCount(big(100), 1.18, big(1e9), 0)).toBe(0);
  });
});
