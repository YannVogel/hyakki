/**
 * Stable 32-bit hash of (seed, index): the seed of the yōkai at wave `index` of a parade whose seed
 * is `seed`. Mixing (murmur3 finalizer) decorrelates neighbouring waves, which mulberry32 alone
 * does not do for small consecutive seeds.
 */
export function deriveSeed(seed: number, index: number): number {
  let h = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
  h ^= Math.imul(index ^ 0x7f4a7c15, 0xc2b2ae35);
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}
