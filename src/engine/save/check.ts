import { type BigNum, parseBigNum } from '../numbers';

// Minimal runtime validation for save files: each check returns the typed value or throws a
// ShapeError naming the faulty path.

export class ShapeError extends Error {
  constructor(
    readonly path: string,
    expected: string,
  ) {
    super(`${path || 'save'}: expected ${expected}`);
    this.name = 'ShapeError';
  }
}

export type Check<T> = (value: unknown, path: string) => T;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const integer =
  (min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER): Check<number> =>
  (value, path) => {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
      throw new ShapeError(path, `an integer in [${min}, ${max}]`);
    }
    return value;
  };

export const nonNegative: Check<number> = (value, path) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new ShapeError(path, 'a finite number ≥ 0');
  }
  return value;
};

export const boolean: Check<boolean> = (value, path) => {
  if (typeof value !== 'boolean') {
    throw new ShapeError(path, 'a boolean');
  }
  return value;
};

export const bigNum: Check<BigNum> = (value, path) => {
  if (typeof value !== 'string') {
    throw new ShapeError(path, 'a BigNum string');
  }
  try {
    return parseBigNum(value);
  } catch {
    throw new ShapeError(path, 'a BigNum string');
  }
};

export const array =
  <T>(item: Check<T>, maxLength = Number.MAX_SAFE_INTEGER): Check<T[]> =>
  (value, path) => {
    if (!Array.isArray(value) || value.length > maxLength) {
      throw new ShapeError(path, `an array of at most ${maxLength} items`);
    }
    return value.map((entry, index) => item(entry, `${path}[${index}]`));
  };

export const nullable =
  <T>(check: Check<T>): Check<T | null> =>
  (value, path) =>
    value === null ? null : check(value, path);

export const object =
  <T>(shape: { [K in keyof T]-?: Check<T[K]> }): Check<T> =>
  (value, path) => {
    if (!isRecord(value)) {
      throw new ShapeError(path, 'an object');
    }
    const result = {} as T;
    for (const key of Object.keys(shape) as (keyof T & string)[]) {
      result[key] = shape[key](value[key], path ? `${path}.${key}` : key);
    }
    return result;
  };

export function keyed<K extends string, T>(
  keys: readonly K[],
  check: Check<T>,
): Check<Record<K, T>> {
  const shape = Object.fromEntries(keys.map((key) => [key, check])) as {
    [P in K]-?: Check<Record<K, T>[P]>;
  };
  return object<Record<K, T>>(shape);
}
