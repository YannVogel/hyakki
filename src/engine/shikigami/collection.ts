import { BALANCE } from '../balance';
import { type GameState, type Shikigami, TEAM_SIZE } from '../gameState';
import { type BigNum, gte, mul, pow, sub } from '../numbers';
import { generate } from '../yokai';
import { shikigamiIntervalMs } from './profile';

export function captureChance(seed: number): number {
  return BALANCE.shikigami.captureChance[generate(seed).rarity];
}

/** Adds a captured yōkai, or +1 level if its seed is already in the collection. */
export function addCapture(
  collection: readonly Shikigami[],
  seed: number,
  generatorVersion: number,
): { collection: Shikigami[]; shikigami: Shikigami; isNew: boolean } {
  const owned = collection.find((shikigami) => shikigami.seed === seed);
  if (owned === undefined) {
    const shikigami = { seed, level: 1, generatorVersion };
    return { collection: [...collection, shikigami], shikigami, isNew: true };
  }
  const shikigami = { ...owned, level: owned.level + 1 };
  return {
    collection: collection.map((entry) => (entry.seed === seed ? shikigami : entry)),
    shikigami,
    isNew: false,
  };
}

export type RosterResult =
  | { readonly ok: true; readonly state: GameState }
  | {
      readonly ok: false;
      readonly reason: 'not-owned' | 'team-too-large' | 'duplicate' | 'not-enough-souls';
    };

/** Picks the active team (at most 3 distinct owned shikigami). New members start a full cycle. */
export function setTeam(state: GameState, seeds: readonly number[]): RosterResult {
  if (seeds.length > TEAM_SIZE) {
    return { ok: false, reason: 'team-too-large' };
  }
  if (new Set(seeds).size !== seeds.length) {
    return { ok: false, reason: 'duplicate' };
  }
  if (!seeds.every((seed) => state.shikigami.some((shikigami) => shikigami.seed === seed))) {
    return { ok: false, reason: 'not-owned' };
  }
  const timers = seeds.map((seed) => {
    const index = state.team.indexOf(seed);
    return index >= 0 ? state.attackTimers.team[index] : shikigamiIntervalMs(seed);
  });
  return {
    ok: true,
    state: { ...state, team: [...seeds], attackTimers: { ...state.attackTimers, team: timers } },
  };
}

/** Souls needed to go from `level` to `level + 1`. */
export function levelUpCost(level: number): BigNum {
  const { levelUpBaseCost, levelUpCostGrowth } = BALANCE.shikigami;
  return mul(levelUpBaseCost, pow(levelUpCostGrowth, level - 1));
}

export function levelUpShikigami(state: GameState, seed: number): RosterResult {
  const owned = state.shikigami.find((shikigami) => shikigami.seed === seed);
  if (owned === undefined) {
    return { ok: false, reason: 'not-owned' };
  }
  const cost = levelUpCost(owned.level);
  if (!gte(state.souls, cost)) {
    return { ok: false, reason: 'not-enough-souls' };
  }
  return {
    ok: true,
    state: {
      ...state,
      souls: sub(state.souls, cost),
      shikigami: state.shikigami.map((entry) =>
        entry.seed === seed ? { ...entry, level: entry.level + 1 } : entry,
      ),
    },
  };
}
