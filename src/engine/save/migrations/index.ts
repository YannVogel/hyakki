import { v1ToV2 } from './v1-to-v2';

/** Raw (JSON) game state, before validation. */
export type RawState = Record<string, unknown>;

/** Turns a state of schema version N into version N + 1. */
export type Migration = (state: RawState) => RawState;

/**
 * Migrations by source version: MIGRATIONS[1] turns a v1 state into v2. Each migration lives in
 * its own file (`v1-to-v2.ts`) with its test, and sets the new `schemaVersion`.
 */
export const MIGRATIONS: Readonly<Record<number, Migration>> = { 1: v1ToV2 };

export class MissingMigrationError extends Error {
  constructor(readonly fromVersion: number) {
    super(`No migration from schema version ${fromVersion}`);
    this.name = 'MissingMigrationError';
  }
}

export function migrate(
  state: RawState,
  fromVersion: number,
  toVersion: number,
  migrations: Readonly<Record<number, Migration>> = MIGRATIONS,
): RawState {
  let current = state;
  for (let version = fromVersion; version < toVersion; version++) {
    const migration = migrations[version];
    if (migration === undefined) {
      throw new MissingMigrationError(version);
    }
    current = migration(current);
  }
  return current;
}
