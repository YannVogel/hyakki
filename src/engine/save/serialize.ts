import { type GameState, SCHEMA_VERSION, TALISMAN_IDS, TEAM_SIZE, UPGRADE_IDS } from '../gameState';
import { stringifyBigNum } from '../numbers';
import { GENERATOR_VERSION, type GeneratorVersion } from '../yokai';
import {
  array,
  bigNum,
  boolean,
  type Check,
  integer,
  keyed,
  nonNegative,
  nullable,
  object,
  ShapeError,
} from './check';
import { migrate, MissingMigrationError, type RawState } from './migrations';

export type SaveErrorReason = 'invalid-json' | 'unsupported-version' | 'invalid-shape';

export interface SaveError {
  readonly reason: SaveErrorReason;
  readonly message: string;
}

export type LoadResult =
  | { readonly ok: true; readonly state: GameState; readonly savedAt: number }
  | { readonly ok: false; readonly error: SaveError };

// Seeds and RNG states are 32-bit integers, signed or not depending on where they come from.
const seed = integer(-(2 ** 31), 2 ** 32 - 1);
const positive = integer(1);
const count = integer(0);
// A save from a newer app (unknown generator) is refused rather than drawn wrong.
const generatorVersion = integer(1, GENERATOR_VERSION) as Check<GeneratorVersion>;

const gameStateCheck: Check<GameState> = object<GameState>({
  schemaVersion: integer(SCHEMA_VERSION, SCHEMA_VERSION),
  generatorVersion,
  parade: object({
    number: positive,
    seed,
    wave: positive,
    maxWave: positive,
    farming: boolean,
    repeat: count,
  }),
  enemy: object({
    seed,
    damage: bigNum,
    guardian: nullable(object({ engaged: boolean, timeLeftMs: nonNegative })),
  }),
  souls: bigNum,
  ofuda: count,
  sparks: count,
  sanctuary: keyed(UPGRADE_IDS, count),
  shikigami: array(object({ seed, level: positive, generatorVersion })),
  team: array(seed, TEAM_SIZE),
  cooldowns: keyed(TALISMAN_IDS, nonNegative),
  effects: object({ burnMs: nonNegative, soulsBoostMs: nonNegative }),
  attackTimers: object({ hero: nonNegative, team: array(nonNegative, TEAM_SIZE) }),
  rngState: seed,
  guardiansDefeated: array(integer(0, 9)),
});

function checkConsistency(state: GameState): void {
  const owned = new Set(state.shikigami.map((shikigami) => shikigami.seed));
  if (owned.size !== state.shikigami.length) {
    throw new ShapeError('shikigami', 'unique seeds');
  }
  if (
    !state.team.every((seed) => owned.has(seed)) ||
    new Set(state.team).size !== state.team.length
  ) {
    throw new ShapeError('team', 'distinct owned shikigami');
  }
  if (state.attackTimers.team.length !== state.team.length) {
    throw new ShapeError('attackTimers.team', 'one timer per team member');
  }
  if (state.parade.maxWave < state.parade.wave) {
    throw new ShapeError('parade.maxWave', 'at least the current wave');
  }
}

/** The save file: the state, with the time of the save (wall clock, injected by the caller). */
export function serialize(state: GameState, savedAt: number): string {
  return JSON.stringify({
    savedAt,
    state: {
      ...state,
      souls: stringifyBigNum(state.souls),
      enemy: {
        ...state.enemy,
        damage: stringifyBigNum(state.enemy.damage),
      },
    },
  });
}

const rawState: Check<RawState> = (value, path) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ShapeError(path, 'an object');
  }
  return value as RawState;
};

const failure = (reason: SaveErrorReason, message: string): LoadResult => ({
  ok: false,
  error: { reason, message },
});

/** Reads a save file. Never throws: a corrupted or unknown file gives a typed error. */
export function deserialize(text: string): LoadResult {
  let envelope: unknown;
  try {
    envelope = JSON.parse(text);
  } catch {
    return failure('invalid-json', 'The save is not valid JSON');
  }
  try {
    const { savedAt, state } = object({ savedAt: nonNegative, state: rawState })(envelope, '');
    const version = integer(1)(state.schemaVersion, 'state.schemaVersion');
    if (version > SCHEMA_VERSION) {
      return failure('unsupported-version', `Schema ${version} is newer than ${SCHEMA_VERSION}`);
    }
    const migrated = migrate(state, version, SCHEMA_VERSION);
    const gameState = gameStateCheck(migrated, 'state');
    checkConsistency(gameState);
    return { ok: true, state: gameState, savedAt };
  } catch (error) {
    if (error instanceof MissingMigrationError) {
      return failure('unsupported-version', error.message);
    }
    if (error instanceof ShapeError) {
      return failure('invalid-shape', error.message);
    }
    throw error;
  }
}
