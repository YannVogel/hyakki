import * as fc from 'fast-check';

import {
  createNewGame,
  enemySeed,
  KAMIDANA_IDS,
  SCHEMA_VERSION,
  TALISMAN_IDS,
  UPGRADE_IDS,
} from './gameState';
import { eq } from './numbers';
import { deriveSeed } from './rng';
import { GENERATOR_VERSION } from './yokai';

describe('createNewGame', () => {
  it('starts the first parade at wave 1 with nothing owned', () => {
    const state = createNewGame(2026);
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(state.generatorVersion).toBe(GENERATOR_VERSION);
    expect(state.parade).toEqual({
      number: 1,
      seed: 2026,
      wave: 1,
      maxWave: 1,
      farming: false,
      repeat: 0,
    });
    expect(eq(state.souls, 0) && eq(state.enemy.damage, 0)).toBe(true);
    expect(state.enemy.guardian).toBeNull();
    expect(state.shikigami).toEqual([]);
    expect(state.team).toEqual([]);
    expect(Object.keys(state.sanctuary)).toEqual([...UPGRADE_IDS]);
    expect(state.kamidana).toEqual(Object.fromEntries(KAMIDANA_IDS.map((id) => [id, 0])));
    expect(Object.keys(state.cooldowns)).toEqual([...TALISMAN_IDS]);
  });

  it('is deterministic', () => {
    fc.assert(
      fc.property(fc.integer(), (seed) => {
        expect(createNewGame(seed)).toEqual(createNewGame(seed));
      }),
    );
  });
});

describe('enemySeed', () => {
  it('derives the wave seed from the parade seed', () => {
    expect(enemySeed(7, 12)).toBe(deriveSeed(7, 12));
    expect(createNewGame(7).enemy.seed).toBe(enemySeed(7, 1));
  });

  it('gives each farming repeat its own yōkai', () => {
    const seeds = new Set([0, 1, 2, 3].map((repeat) => enemySeed(7, 99, repeat)));
    expect(seeds.size).toBe(4);
  });
});
