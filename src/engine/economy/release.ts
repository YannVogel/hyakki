import { BALANCE } from '../balance';
import { waveSouls } from '../combat/enemy';
import { tierMultiplier } from '../combat/guardians';
import { combatPower } from '../combat/power';
import type { GameState, Shikigami } from '../gameState';
import { add, type BigNum, mul } from '../numbers';
import { generate, type Rarity } from '../yokai';

export type ReleaseResult =
  | {
      readonly ok: true;
      readonly state: GameState;
      readonly released: number;
      readonly souls: BigNum;
    }
  | { readonly ok: false; readonly reason: 'nothing-to-release' | 'not-owned' | 'in-team' };

const rarityOf = (shikigami: Shikigami): Rarity =>
  generate(shikigami.seed, shikigami.generatorVersion).rarity;

/** What a shikigami is worth when released, in ordinary yōkai of the current wave. */
export function releaseWorth(rarity: Rarity, level: number): number {
  return BALANCE.shikigami.releaseYokai[rarity] * level;
}

/** Souls of `yokai` ordinary yōkai of the current wave, every souls bonus included but Kekkai's. */
export function releaseSouls(state: GameState, yokai: number): BigNum {
  const { wave } = state.parade;
  return mul(waveSouls(wave), yokai * tierMultiplier(wave) * combatPower(state).soulsMultiplier);
}

/**
 * Releases owned shikigami for souls, never a team member. A released seed can be captured again,
 * as a new shikigami. Deterministic: no draw of the RNG.
 */
export function releaseShikigami(state: GameState, seeds: readonly number[]): ReleaseResult {
  const wanted = new Set(seeds);
  if (wanted.size === 0) {
    return { ok: false, reason: 'nothing-to-release' };
  }
  if (state.team.some((seed) => wanted.has(seed))) {
    return { ok: false, reason: 'in-team' };
  }
  const released = state.shikigami.filter((shikigami) => wanted.has(shikigami.seed));
  if (released.length !== wanted.size) {
    return { ok: false, reason: 'not-owned' };
  }
  const yokai = released.reduce(
    (total, shikigami) => total + releaseWorth(rarityOf(shikigami), shikigami.level),
    0,
  );
  const souls = releaseSouls(state, yokai);
  return {
    ok: true,
    released: released.length,
    souls,
    state: {
      ...state,
      souls: add(state.souls, souls),
      shikigami: state.shikigami.filter((shikigami) => !wanted.has(shikigami.seed)),
    },
  };
}
