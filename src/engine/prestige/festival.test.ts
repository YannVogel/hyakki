import * as fc from 'fast-check';

import { combatPower } from '../combat';
import { type GameState, UPGRADE_IDS } from '../gameState';
import { div, eq, toNumber } from '../numbers';
import { deriveSeed } from '../rng';
import { arbitraryGameState } from '../testing/arbitraries';
import { festivalBonus, festivalPreview, festivalSparks, startFestival } from './festival';

const withRecord = (state: GameState, maxWave: number): GameState => ({
  ...state,
  parade: { ...state.parade, wave: Math.min(state.parade.wave, maxWave), maxWave },
});

describe('festival sparks', () => {
  it.each([
    [101, 5],
    [200, 17],
    [500, 90],
    [1000, 315],
  ])('a record of wave %d earns %d sparks', (record, sparks) => {
    expect(festivalSparks(record)).toBe(sparks);
  });

  it('gives +5 % of damage and souls per spark', () => {
    expect(festivalBonus(0)).toBe(1);
    expect(festivalBonus(38)).toBeCloseTo(2.9, 10);
  });
});

describe('festivalPreview', () => {
  it('is locked until the first guardian is behind', () => {
    fc.assert(
      fc.property(arbitraryGameState, (state) => {
        const preview = festivalPreview(state);
        expect(preview.unlocked).toBe(state.parade.maxWave > 100);
        expect(preview.bonusAfter).toBeCloseTo(
          festivalBonus(state.sparks + preview.sparksToEarn),
          10,
        );
      }),
    );
  });
});

describe('startFestival', () => {
  it('refuses before wave 100 is passed', () => {
    fc.assert(
      fc.property(arbitraryGameState, (state) => {
        expect(startFestival(withRecord(state, Math.min(state.parade.maxWave, 100)))).toEqual({
          ok: false,
          reason: 'locked',
        });
      }),
    );
  });

  it('resets waves, souls and the Sanctuary, keeps shikigami, ofuda, Kamidana and gallery', () => {
    fc.assert(
      fc.property(arbitraryGameState, fc.integer({ min: 101, max: 5000 }), (base, record) => {
        const state = withRecord(base, record);
        const result = startFestival(state);
        if (!result.ok) throw new Error(result.reason);
        const next = result.state;
        expect(next.parade).toEqual({
          number: state.parade.number + 1,
          seed: deriveSeed(state.parade.seed, state.parade.number + 1),
          wave: 1,
          maxWave: 1,
          farming: false,
          repeat: 0,
        });
        expect(eq(next.souls, 0)).toBe(true);
        expect(UPGRADE_IDS.every((id) => next.sanctuary[id] === 0)).toBe(true);
        expect(next.enemy.guardian).toBeNull();
        expect(next.shikigami).toEqual(state.shikigami);
        expect(next.team).toEqual(state.team);
        expect(next.ofuda).toBe(state.ofuda);
        expect(next.kamidana).toEqual(state.kamidana);
        expect(next.guardiansDefeated).toEqual(state.guardiansDefeated);
        expect(next.sparks).toBe(state.sparks + festivalSparks(record));
        expect(result.sparks).toBe(festivalSparks(record));
      }),
    );
  });

  it('makes the next parade stronger: more damage and more souls', () => {
    fc.assert(
      fc.property(arbitraryGameState, (base) => {
        const state = { ...withRecord(base, 1000), sparks: 0 };
        const result = startFestival(state);
        if (!result.ok) throw new Error(result.reason);
        const before = combatPower({ ...result.state, sparks: 0 });
        const after = combatPower(result.state);
        const ratio = festivalBonus(result.state.sparks);
        expect(toNumber(div(after.heroHitDamage, before.heroHitDamage))).toBeCloseTo(ratio, 9);
        expect(after.soulsMultiplier / before.soulsMultiplier).toBeCloseTo(ratio, 9);
      }),
      { numRuns: 30 },
    );
  });
});
