import { createNewGame, KAMIDANA_IDS } from '../../gameState';
import { deserialize, serialize } from '../serialize';
import { v1ToV2 } from './v1-to-v2';

/** A save written by the 1.0 (schema 1): no Kamidana yet. */
function v1Save(): string {
  const raw = JSON.parse(serialize({ ...createNewGame(3), ofuda: 85 }, 1000));
  delete raw.state.kamidana;
  raw.state.schemaVersion = 1;
  return JSON.stringify(raw);
}

describe('v1ToV2', () => {
  it('adds every Kamidana upgrade at level 0 and keeps the rest', () => {
    const state = { schemaVersion: 1, ofuda: 12, souls: '1e3' };
    expect(v1ToV2(state)).toEqual({
      schemaVersion: 2,
      ofuda: 12,
      souls: '1e3',
      kamidana: Object.fromEntries(KAMIDANA_IDS.map((id) => [id, 0])),
    });
  });

  it('loads a 1.0 save without loss, its ofuda ready to spend', () => {
    const loaded = deserialize(v1Save());
    expect(loaded.ok).toBe(true);
    expect(loaded.ok && loaded.state.schemaVersion).toBe(2);
    expect(loaded.ok && loaded.state.ofuda).toBe(85);
    expect(loaded.ok && loaded.state.kamidana).toEqual(createNewGame(3).kamidana);
  });
});
