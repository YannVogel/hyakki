import Decimal from 'break_infinity.js';

// Adapter over break_infinity.js: the rest of the engine only sees the opaque BigNum type and the
// functions below, so the library can be swapped without touching game code.
declare const bigNumBrand: unique symbol;
export type BigNum = { readonly [bigNumBrand]: true };
export type BigNumSource = BigNum | number;

export class BigNumParseError extends Error {
  constructor(readonly input: string) {
    super(`Invalid BigNum: "${input}"`);
    this.name = 'BigNumParseError';
  }
}

const toDecimal = (value: BigNumSource): Decimal =>
  typeof value === 'number' ? new Decimal(value) : (value as unknown as Decimal);
const fromDecimal = (value: Decimal): BigNum => value as unknown as BigNum;

export const big = (value: number): BigNum => fromDecimal(new Decimal(value));
export const isBigNum = (value: unknown): value is BigNum => value instanceof Decimal;
export const ZERO = big(0);
export const ONE = big(1);

export const add = (a: BigNumSource, b: BigNumSource): BigNum =>
  fromDecimal(Decimal.add(toDecimal(a), toDecimal(b)));
export const sub = (a: BigNumSource, b: BigNumSource): BigNum =>
  fromDecimal(Decimal.sub(toDecimal(a), toDecimal(b)));
export const mul = (a: BigNumSource, b: BigNumSource): BigNum =>
  fromDecimal(Decimal.mul(toDecimal(a), toDecimal(b)));
export const div = (a: BigNumSource, b: BigNumSource): BigNum =>
  fromDecimal(Decimal.div(toDecimal(a), toDecimal(b)));
export const pow = (base: BigNumSource, exponent: number): BigNum =>
  fromDecimal(Decimal.pow(toDecimal(base), exponent));
export const floor = (value: BigNumSource): BigNum => fromDecimal(Decimal.floor(toDecimal(value)));
export const min = (a: BigNumSource, b: BigNumSource): BigNum =>
  fromDecimal(Decimal.min(toDecimal(a), toDecimal(b)));
export const max = (a: BigNumSource, b: BigNumSource): BigNum =>
  fromDecimal(Decimal.max(toDecimal(a), toDecimal(b)));

export const compare = (a: BigNumSource, b: BigNumSource): -1 | 0 | 1 =>
  Decimal.cmp(toDecimal(a), toDecimal(b));
export const eq = (a: BigNumSource, b: BigNumSource): boolean => compare(a, b) === 0;
export const lt = (a: BigNumSource, b: BigNumSource): boolean => compare(a, b) < 0;
export const lte = (a: BigNumSource, b: BigNumSource): boolean => compare(a, b) <= 0;
export const gt = (a: BigNumSource, b: BigNumSource): boolean => compare(a, b) > 0;
export const gte = (a: BigNumSource, b: BigNumSource): boolean => compare(a, b) >= 0;

/** Plain number; `Infinity` beyond ~1.8e308. */
export const toNumber = (value: BigNumSource): number => toDecimal(value).toNumber();
/** log10 of a positive value (works far beyond the range of `number`). */
export const log10 = (value: BigNumSource): number => Decimal.log10(toDecimal(value));

/** value = mantissa × 10^exponent, with |mantissa| in [1, 10) or exactly 0. */
export function toMantissaExponent(value: BigNumSource): { mantissa: number; exponent: number } {
  const decimal = toDecimal(value);
  return { mantissa: decimal.mantissa, exponent: decimal.exponent };
}

/** Lossless text form for the save file: `<mantissa>e<exponent>`. */
export function stringifyBigNum(value: BigNumSource): string {
  const { mantissa, exponent } = toMantissaExponent(value);
  return `${mantissa}e${exponent}`;
}

export function parseBigNum(text: string): BigNum {
  const separator = text.lastIndexOf('e');
  const mantissa = Number(text.slice(0, separator));
  const exponent = Number(text.slice(separator + 1));
  const normalized = mantissa === 0 || (Math.abs(mantissa) >= 1 && Math.abs(mantissa) < 10);
  if (separator <= 0 || !Number.isFinite(mantissa) || !Number.isInteger(exponent) || !normalized) {
    throw new BigNumParseError(text);
  }
  return fromDecimal(Decimal.fromMantissaExponent_noNormalize(mantissa, exponent));
}
