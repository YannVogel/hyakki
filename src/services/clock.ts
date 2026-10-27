/** Wall clock, injected into the game (the engine never reads time itself). */
export const now = (): number => Date.now();

/** Seed of a new parade: the only randomness that does not come from the seeded RNG. */
export const newParadeSeed = (): number => Math.floor(Math.random() * 2 ** 31);
