import * as fc from 'fast-check';

import { clamp } from './math';

describe('clamp', () => {
  it.each([
    [5, 0, 10, 5],
    [-3, 0, 10, 0],
    [42, 0, 10, 10],
    [0, 0, 10, 0],
    [10, 0, 10, 10],
  ])('clamp(%d, %d, %d) = %d', (value, min, max, expected) => {
    expect(clamp(value, min, max)).toBe(expected);
  });

  it('always returns a value within the bounds', () => {
    fc.assert(
      fc.property(
        fc.double({ noNaN: true }),
        fc.double({ noNaN: true }),
        fc.double({ noNaN: true }),
        (value, a, b) => {
          const [min, max] = a <= b ? [a, b] : [b, a];
          const result = clamp(value, min, max);
          expect(result).toBeGreaterThanOrEqual(min);
          expect(result).toBeLessThanOrEqual(max);
        },
      ),
    );
  });
});
