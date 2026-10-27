import * as fc from 'fast-check';

import {
  add,
  big,
  BigNumParseError,
  compare,
  div,
  eq,
  floor,
  gt,
  gte,
  log10,
  lt,
  lte,
  max,
  min,
  mul,
  ONE,
  parseBigNum,
  pow,
  stringifyBigNum,
  sub,
  toMantissaExponent,
  toNumber,
  ZERO,
} from './bigNum';

// Any representable value, including far beyond the range of `number`.
const anyBigNum = fc
  .tuple(fc.double({ min: 1, max: 9.999999, noNaN: true }), fc.integer({ min: -50, max: 1e6 }))
  .map(([mantissa, exponent]) => mul(mantissa, pow(10, exponent)));

describe('BigNum arithmetic', () => {
  it('computes like plain numbers in the safe range', () => {
    expect(toNumber(add(2, 3))).toBe(5);
    expect(toNumber(sub(10, 4))).toBe(6);
    expect(toNumber(mul(6, 7))).toBe(42);
    expect(toNumber(div(1, 4))).toBe(0.25);
    expect(toNumber(floor(big(3.7)))).toBe(3);
    expect(toNumber(min(2, 9))).toBe(2);
    expect(toNumber(max(2, 9))).toBe(9);
    expect(toNumber(ZERO)).toBe(0);
    expect(toNumber(ONE)).toBe(1);
  });

  it('goes far beyond 1e308', () => {
    const huge = pow(1.165, 5000);
    expect(toNumber(huge)).toBe(Infinity);
    expect(log10(huge)).toBeCloseTo(5000 * Math.log10(1.165), 6);
    expect(gt(huge, 1e308)).toBe(true);
  });

  it('compares values', () => {
    expect(compare(1, 2)).toBe(-1);
    expect(compare(2, 2)).toBe(0);
    expect(compare(pow(10, 400), pow(10, 399))).toBe(1);
    expect(eq(big(5), 5)).toBe(true);
    expect(lt(1, 2) && lte(2, 2) && gte(2, 2) && gt(3, 2)).toBe(true);
  });

  it('exposes a normalized mantissa and exponent', () => {
    expect(toMantissaExponent(48249)).toEqual({ mantissa: 4.8249, exponent: 4 });
    expect(toMantissaExponent(0)).toEqual({ mantissa: 0, exponent: 0 });
  });
});

describe('BigNum serialization', () => {
  it('round-trips exactly', () => {
    fc.assert(
      fc.property(anyBigNum, (value) => {
        const restored = parseBigNum(stringifyBigNum(value));
        expect(toMantissaExponent(restored)).toEqual(toMantissaExponent(value));
      }),
    );
  });

  it('round-trips zero and negative values', () => {
    for (const value of [0, -1.5, -123456789]) {
      expect(toMantissaExponent(parseBigNum(stringifyBigNum(value)))).toEqual(
        toMantissaExponent(value),
      );
    }
  });

  it.each(['', 'abc', '1.5', 'e5', '12e3', '1.5ex', '1.5e2.5', 'NaNe1', 'Infinitye0'])(
    'rejects %p with a typed error',
    (text) => {
      expect(() => parseBigNum(text)).toThrow(BigNumParseError);
    },
  );
});
