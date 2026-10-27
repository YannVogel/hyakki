import * as fc from 'fast-check';

import { big, mul, pow } from './bigNum';
import { formatNumber } from './format';

const NNBSP = ' ';

describe('formatNumber', () => {
  it.each([
    [0, '0'],
    [7, '7'],
    [999.9, '999'],
    [1284, `1${NNBSP}284`],
    [9999, `9${NNBSP}999`],
    [10_000, `10${NNBSP}k`],
    [48_249, `48,2${NNBSP}k`],
    [123_456, `123${NNBSP}k`],
    [1_280_000, `1,28${NNBSP}M`],
    [1_289_999, `1,28${NNBSP}M`],
    [3_400_000_000, `3,4${NNBSP}Md`],
    [1e12, `1${NNBSP}aa`],
    [2.5e15, `2,5${NNBSP}ab`],
    [4.82e3 * 1e3, `4,82${NNBSP}M`],
    [-48_249, `-48,2${NNBSP}k`],
  ])('formats %p as %p', (value, expected) => {
    expect(formatNumber(value)).toBe(expected);
  });

  it('switches to two-letter units after Md', () => {
    expect(formatNumber(pow(10, 90))).toBe(`1${NNBSP}ba`);
    expect(formatNumber(mul(5.5, pow(10, 2037)))).toBe(`5,5${NNBSP}zz`);
  });

  it('falls back to scientific notation beyond the last unit', () => {
    expect(formatNumber(mul(1.234, pow(10, 2040)))).toBe('1,23e2040');
  });

  it('never shows more than three significant digits above 10 000', () => {
    fc.assert(
      fc.property(fc.double({ min: 1e4, max: 1e300, noNaN: true }), (value) => {
        const digits = formatNumber(big(value)).replace(/[^0-9]/g, '');
        expect(digits.length).toBeLessThanOrEqual(3);
      }),
    );
  });
});
