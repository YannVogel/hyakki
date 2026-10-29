import { BALANCE } from '../balance';
import { type GameState, type Shikigami, TEAM_SIZE } from '../gameState';
import { type BigNum, div, gte, mul, pow, sub } from '../numbers';
import { generate, type GeneratorVersion } from '../yokai';
import { shikigamiIntervalMs } from './profile';

/** Chance that a defeated yōkai joins the collection, by rarity, × `multiplier` (100 % at most). */
export function captureChance(seed: number, version: GeneratorVersion, multiplier = 1): number {
  return Math.min(1, BALANCE.shikigami.captureChance[generate(seed, version).rarity] * multiplier);
}

/** The active team's shikigami, in team order. */
export function teamMembers(state: Pick<GameState, 'team' | 'shikigami'>): Shikigami[] {
  return state.team.flatMap((seed) => {
    const member = state.shikigami.find((shikigami) => shikigami.seed === seed);
    return member === undefined ? [] : [member];
  });
}

/**
 * Adds a captured yōkai, or +1 level if its seed is already in the collection (an owned seed
 * keeps the look of its first capture).
 */
export function addCapture(
  collection: readonly Shikigami[],
  seed: number,
  generatorVersion: GeneratorVersion,
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
  const members = teamMembers({ team: seeds, shikigami: state.shikigami });
  if (members.length !== seeds.length) {
    return { ok: false, reason: 'not-owned' };
  }
  const timers = members.map((member) => {
    const index = state.team.indexOf(member.seed);
    return index >= 0 ? state.attackTimers.team[index] : shikigamiIntervalMs(member);
  });
  return {
    ok: true,
    state: { ...state, team: [...seeds], attackTimers: { ...state.attackTimers, team: timers } },
  };
}

/** Souls needed to gain `count` levels from `level`: a geometric sum, like the Sanctuary. */
export function levelUpCost(level: number, count = 1): BigNum {
  const { levelUpBaseCost, levelUpCostGrowth } = BALANCE.shikigami;
  const first = mul(levelUpBaseCost, pow(levelUpCostGrowth, level - 1));
  return div(mul(first, sub(pow(levelUpCostGrowth, count), 1)), levelUpCostGrowth - 1);
}

export function levelUpShikigami(state: GameState, seed: number, count = 1): RosterResult {
  const owned = state.shikigami.find((shikigami) => shikigami.seed === seed);
  if (owned === undefined) {
    return { ok: false, reason: 'not-owned' };
  }
  const cost = levelUpCost(owned.level, count);
  if (count < 1 || !gte(state.souls, cost)) {
    return { ok: false, reason: 'not-enough-souls' };
  }
  return {
    ok: true,
    state: {
      ...state,
      souls: sub(state.souls, cost),
      shikigami: state.shikigami.map((entry) =>
        entry.seed === seed ? { ...entry, level: entry.level + count } : entry,
      ),
    },
  };
}
