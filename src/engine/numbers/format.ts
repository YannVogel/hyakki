import { type BigNumSource, toMantissaExponent } from './bigNum';

const NARROW_NBSP = ' ';
const FULL_DISPLAY_LIMIT_EXPONENT = 4; // Below 10 000, numbers are shown in full: « 1 284 ».
const SIGNIFICANT_DIGITS = 3;
const NAMED_UNITS = ['', 'k', 'M', 'Md'];
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const LETTER_UNIT_COUNT = LETTERS.length * LETTERS.length;
// Absorbs float noise so that 4.82 × 100 is never truncated to 481.
const EPSILON = 1e-9;

function groupThousands(integer: number): string {
  return String(integer).replace(/\B(?=(\d{3})+(?!\d))/g, NARROW_NBSP);
}

function unitFor(group: number): string | undefined {
  if (group < NAMED_UNITS.length) {
    return NAMED_UNITS[group];
  }
  const index = group - NAMED_UNITS.length;
  if (index >= LETTER_UNIT_COUNT) {
    return undefined;
  }
  return LETTERS[Math.floor(index / LETTERS.length)] + LETTERS[index % LETTERS.length];
}

function truncateDecimals(value: number, decimals: number): string {
  const factor = 10 ** decimals;
  const truncated = Math.floor(value * factor + EPSILON) / factor;
  return truncated
    .toFixed(decimals)
    .replace(/\.?0+$/, '')
    .replace('.', ',');
}

/**
 * French display of a game quantity, truncated (never rounded up: the player never sees more than
 * they have). « 1 284 », « 48,2 k », « 1,28 M », « 3,4 Md », then « 1 aa », « 1 ab »…
 */
export function formatNumber(value: BigNumSource): string {
  const { mantissa, exponent } = toMantissaExponent(value);
  const sign = mantissa < 0 ? '-' : '';
  const magnitude = Math.abs(mantissa);

  if (exponent < FULL_DISPLAY_LIMIT_EXPONENT) {
    return sign + groupThousands(Math.floor(magnitude * 10 ** exponent + EPSILON));
  }

  const group = Math.floor(exponent / 3);
  const integerDigits = (exponent % 3) + 1;
  const unit = unitFor(group);
  if (unit === undefined) {
    return `${sign}${truncateDecimals(magnitude, SIGNIFICANT_DIGITS - 1)}e${exponent}`;
  }
  const scaled = magnitude * 10 ** (integerDigits - 1);
  return `${sign}${truncateDecimals(scaled, SIGNIFICANT_DIGITS - integerDigits)}${NARROW_NBSP}${unit}`;
}
