import type { Random } from './mulberry32';

/** Uniform pick, `Math.floor(random() * length)` like the prototype (draw order is a contract). */
export function pick<T>(random: Random, items: readonly T[]): T {
  if (items.length === 0) {
    throw new RangeError('pick() needs at least one item');
  }
  return items[Math.floor(random() * items.length)];
}

/** True with probability `probability` (0 never, 1 always). */
export function chance(random: Random, probability: number): boolean {
  return random() < probability;
}

/** Uniform integer in [min, max], both inclusive. */
export function randomInt(random: Random, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1));
}
