import * as fc from 'fast-check';

import { chance, pick, randomInt } from './draw';
import { mulberry32 } from './mulberry32';

const constant = (value: number) => () => value;

describe('pick', () => {
  it('maps the draw to an index like the prototype', () => {
    const items = ['a', 'b', 'c', 'd'];
    expect(pick(constant(0), items)).toBe('a');
    expect(pick(constant(0.49), items)).toBe('b');
    expect(pick(constant(0.999), items)).toBe('d');
  });

  it('always returns one of the items', () => {
    fc.assert(
      fc.property(fc.integer(), fc.array(fc.string(), { minLength: 1 }), (seed, items) => {
        expect(items).toContain(pick(mulberry32(seed), items));
      }),
    );
  });

  it('refuses an empty list', () => {
    expect(() => pick(constant(0), [])).toThrow(RangeError);
  });
});

describe('chance', () => {
  it('never succeeds at 0 and always at 1', () => {
    fc.assert(
      fc.property(fc.integer(), (seed) => {
        const random = mulberry32(seed);
        expect(chance(random, 0)).toBe(false);
        expect(chance(random, 1)).toBe(true);
      }),
    );
  });

  it('succeeds when the draw is below the probability', () => {
    expect(chance(constant(0.19), 0.2)).toBe(true);
    expect(chance(constant(0.2), 0.2)).toBe(false);
  });
});

describe('randomInt', () => {
  it('stays within inclusive bounds', () => {
    fc.assert(
      fc.property(
        fc.integer(),
        fc.integer({ min: -1000, max: 1000 }),
        fc.nat(1000),
        (seed, min, span) => {
          const value = randomInt(mulberry32(seed), min, min + span);
          expect(Number.isInteger(value)).toBe(true);
          expect(value).toBeGreaterThanOrEqual(min);
          expect(value).toBeLessThanOrEqual(min + span);
        },
      ),
    );
  });

  it('reaches both bounds', () => {
    expect(randomInt(constant(0), 3, 5)).toBe(3);
    expect(randomInt(constant(0.999), 3, 5)).toBe(5);
  });
});
