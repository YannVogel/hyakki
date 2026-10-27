export type Random = () => number;

export interface Rng {
  /** Next float in [0, 1). */
  readonly next: Random;
  /** Internal state: `createRng(state)` resumes the sequence exactly where it stopped. */
  readonly getState: () => number;
}

// Verbatim port of the generator in design/prototypes/fabrique-a-yokai.html: the sequence produced
// by a seed is a contract (same seed, same yōkai), never change it.
export function createRng(seed: number): Rng {
  let a = seed | 0;
  return {
    next: () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    getState: () => a,
  };
}

export function mulberry32(seed: number): Random {
  return createRng(seed).next;
}
