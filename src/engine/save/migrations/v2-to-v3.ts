import { BALANCE } from '../../balance';
import type { Migration, RawState } from './index';

/** Record of the current parade, 1 when the raw save has none (validation refuses it later). */
function recordWave(state: RawState): number {
  const parade = state.parade;
  if (typeof parade !== 'object' || parade === null) {
    return 1;
  }
  const { maxWave } = parade as Record<string, unknown>;
  return Number.isSafeInteger(maxWave) ? Math.max(1, maxWave as number) : 1;
}

/**
 * Highest awakening each guardian fell at, as far as the record tells: a guardian whose wave the
 * record has passed was beaten in this parade, or before it (the Head Start only skips waves an
 * earlier parade crossed).
 */
export function bestAwakeningsBelow(record: number): number[] {
  const { every, count } = BALANCE.guardian;
  const cycle = every * count;
  return Array.from({ length: count }, (_, index) =>
    Math.max(0, Math.floor((record - 1 - (index + 1) * every) / cycle)),
  );
}

/**
 * Schema 3 records the awakened guardians defeated (#133), rebuilt from the current parade's record:
 * the parades before the last Festival left no trace.
 */
export const v2ToV3: Migration = (state) => ({
  ...state,
  schemaVersion: 3,
  guardiansBestAwakening: bestAwakeningsBelow(recordWave(state)),
});
