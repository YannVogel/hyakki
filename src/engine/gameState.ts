import { type BigNum, ZERO } from './numbers';
import { deriveSeed } from './rng';
import { GENERATOR_VERSION } from './yokai';

export const SCHEMA_VERSION = 1;

export const UPGRADE_IDS = ['blade', 'foxfire', 'bell', 'kekkai', 'lanterns'] as const;
export type UpgradeId = (typeof UPGRADE_IDS)[number];

export const TALISMAN_IDS = ['kitsunebi', 'raijin', 'kekkai'] as const;
export type TalismanId = (typeof TALISMAN_IDS)[number];

export const TEAM_SIZE = 3;

export interface Shikigami {
  readonly seed: number;
  readonly level: number;
  /** Generator version at capture time: the shikigami keeps its look forever. */
  readonly generatorVersion: number;
}

export interface GuardianFight {
  /** False while the cut-in waits for the player: the timer does not run. */
  readonly engaged: boolean;
  readonly timeLeftMs: number;
}

export interface EnemyState {
  readonly seed: number;
  /** Damage taken so far; max HP is derived from the wave and the seed. */
  readonly damage: BigNum;
  /** Present on guardian waves (multiples of 100). */
  readonly guardian: GuardianFight | null;
}

export interface ParadeState {
  /** Parade number, +1 at each Festival. */
  readonly number: number;
  readonly seed: number;
  readonly wave: number;
  readonly maxWave: number;
  /** Stuck before a guardian (after a defeat or a retreat): the wave repeats until a new try. */
  readonly farming: boolean;
  /** How many times the current wave was repeated while farming (varies the yōkai's seed). */
  readonly repeat: number;
}

export interface GameState {
  readonly schemaVersion: number;
  /** Generator version of the yōkai of the current parade. */
  readonly generatorVersion: number;
  readonly parade: ParadeState;
  readonly enemy: EnemyState;
  readonly souls: BigNum;
  readonly ofuda: number;
  /** Festival sparks earned over all parades (permanent bonus). */
  readonly sparks: number;
  readonly sanctuary: Readonly<Record<UpgradeId, number>>;
  readonly shikigami: readonly Shikigami[];
  /** Seeds of the active team, at most TEAM_SIZE, all present in `shikigami`. */
  readonly team: readonly number[];
  /** Remaining cooldown of each talisman, in ms. */
  readonly cooldowns: Readonly<Record<TalismanId, number>>;
  readonly effects: { readonly burnMs: number; readonly soulsBoostMs: number };
  /** Time until the next automatic attack, in ms: the hero, then each team member. */
  readonly attackTimers: { readonly hero: number; readonly team: readonly number[] };
  /** State of the seeded RNG used for critical hits and captures. */
  readonly rngState: number;
  /** Guardian indices (0 to 9) defeated at least once, in any parade. */
  readonly guardiansDefeated: readonly number[];
}

const zeroBy = <K extends string>(ids: readonly K[]) =>
  Object.fromEntries(ids.map((id) => [id, 0])) as Record<K, number>;

/** Seed of the yōkai met at `wave`; repeats (farming) get their own seeds. */
export function enemySeed(paradeSeed: number, wave: number, repeat = 0): number {
  const waveSeed = deriveSeed(paradeSeed, wave);
  return repeat === 0 ? waveSeed : deriveSeed(waveSeed, repeat);
}

export function createNewGame(seed: number): GameState {
  return {
    schemaVersion: SCHEMA_VERSION,
    generatorVersion: GENERATOR_VERSION,
    parade: { number: 1, seed, wave: 1, maxWave: 1, farming: false, repeat: 0 },
    enemy: { seed: enemySeed(seed, 1), damage: ZERO, guardian: null },
    souls: ZERO,
    ofuda: 0,
    sparks: 0,
    sanctuary: zeroBy(UPGRADE_IDS),
    shikigami: [],
    team: [],
    cooldowns: zeroBy(TALISMAN_IDS),
    effects: { burnMs: 0, soulsBoostMs: 0 },
    attackTimers: { hero: 0, team: [] },
    // Wave 0 never hosts a yōkai: its derived seed is free for the combat RNG.
    rngState: deriveSeed(seed, 0),
    guardiansDefeated: [],
  };
}
