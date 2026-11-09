import * as fc from 'fast-check';

import { guardianAt, isGuardianWave } from '../../combat/guardians';
import { createNewGame } from '../../gameState';
import { deserialize, serialize } from '../serialize';
import { bestAwakeningsBelow, v2ToV3 } from './v2-to-v3';

/** A save written before #133 (schema 2): no record of the awakened guardians. */
function v2Save(maxWave: number): string {
  const fresh = createNewGame(3);
  const state = { ...fresh, parade: { ...fresh.parade, wave: maxWave, maxWave }, ofuda: 85 };
  const raw = JSON.parse(serialize(state, 1000));
  delete raw.state.guardiansBestAwakening;
  raw.state.schemaVersion = 2;
  return JSON.stringify(raw);
}

/** The same record, by walking every guardian wave the parade has passed. */
function walked(record: number): number[] {
  const best = Array.from({ length: 10 }, () => 0);
  for (let wave = 1; wave < record; wave++) {
    if (isGuardianWave(wave)) {
      const { index, awakening } = guardianAt(wave);
      best[index] = Math.max(best[index], awakening);
    }
  }
  return best;
}

describe('bestAwakeningsBelow', () => {
  it('knows no awakened guardian before Bake-danuki falls at Éveil 2', () => {
    expect(bestAwakeningsBelow(1)).toEqual(Array(10).fill(0));
    expect(bestAwakeningsBelow(1100)).toEqual(Array(10).fill(0));
    expect(bestAwakeningsBelow(1101)).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('keeps for each guardian the highest awakening its record passed', () => {
    expect(bestAwakeningsBelow(2501)).toEqual([2, 2, 2, 2, 2, 1, 1, 1, 1, 1]);
  });

  it('agrees with a walk through every guardian wave below the record', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 12_000 }), (record) => {
        expect(bestAwakeningsBelow(record)).toEqual(walked(record));
      }),
      { numRuns: 200 },
    );
  });
});

describe('v2ToV3', () => {
  it('rebuilds the record from the current parade and keeps the rest', () => {
    const state = { schemaVersion: 2, ofuda: 12, parade: { maxWave: 1301 } };
    expect(v2ToV3(state)).toEqual({
      ...state,
      schemaVersion: 3,
      guardiansBestAwakening: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    });
  });

  it('records nothing from a parade it cannot read, which validation then refuses', () => {
    expect(v2ToV3({ schemaVersion: 2 }).guardiansBestAwakening).toEqual(Array(10).fill(0));
    expect(v2ToV3({ parade: { maxWave: 'x' } }).guardiansBestAwakening).toEqual(Array(10).fill(0));
  });

  it('loads a schema 2 save without loss, awakened guardians already beaten included', () => {
    const loaded = deserialize(v2Save(1450));
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.state.schemaVersion).toBe(3);
    expect(loaded.state.ofuda).toBe(85);
    expect(loaded.state.parade.maxWave).toBe(1450);
    expect(loaded.state.guardiansBestAwakening).toEqual([1, 1, 1, 1, 0, 0, 0, 0, 0, 0]);
  });
});
