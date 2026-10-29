import * as fc from 'fast-check';

import { combatPower, waveSouls, yokaiProfile } from '../combat';
import { createNewGame, enemySeed, type GameState, UPGRADE_IDS } from '../gameState';
import { add, div, eq, gt, mul, toNumber } from '../numbers';
import { deriveSeed } from '../rng';
import { arbitraryGameState } from '../testing/arbitraries';
import { festivalBonus } from './bonus';
import {
  festivalPreview,
  festivalSparks,
  clearSkippedWaves,
  headStartWave,
  startFestival,
} from './festival';

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
        // Without Head Start: the next parade starts at wave 1.
        const state = { ...withRecord(base, record), kamidana: { ...base.kamidana, headStart: 0 } };
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
        expect(next.sparks).toBe(
          state.sparks + festivalSparks(record, state.kamidana.festivalFlame),
        );
        expect(result.sparks).toBe(festivalSparks(record, state.kamidana.festivalFlame));
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

describe('Head Start', () => {
  it('starts 25 waves further per level, within the hundred of the record', () => {
    expect(headStartWave(500, 0)).toBe(1);
    expect(headStartWave(500, 1)).toBe(26);
    expect(headStartWave(500, 4)).toBe(101);
    expect(headStartWave(350, 8)).toBe(201);
    expect(headStartWave(150, 8)).toBe(101);
    expect(headStartWave(101, 3)).toBe(76);
  });

  it('never starts on a guardian wave nor beyond what was already crossed', () => {
    fc.assert(
      fc.property(fc.integer({ min: 101, max: 20_000 }), fc.nat(50), (record, level) => {
        const wave = headStartWave(record, level);
        expect(wave).toBeGreaterThanOrEqual(1);
        expect(wave).toBeLessThanOrEqual(record);
        expect(wave % 100).not.toBe(0);
        expect(headStartWave(record, level)).toBe(wave);
      }),
    );
  });

  it('purifies the skipped waves as if played: souls of each yōkai, then of the guardian', () => {
    const state = createNewGame(5);
    const { soulsMultiplier } = combatPower(state);
    const yokai = (wave: number) =>
      mul(
        waveSouls(wave),
        yokaiProfile(enemySeed(state.parade.seed, wave), state.generatorVersion).soulsFactor *
          soulsMultiplier,
      );
    const cleared = clearSkippedWaves(state, 3);
    expect(toNumber(cleared.souls)).toBeCloseTo(toNumber(add(yokai(1), yokai(2))), 9);
    expect(cleared.parade).toMatchObject({ wave: 3, maxWave: 3 });
    expect(cleared.enemy).toEqual({
      seed: enemySeed(state.parade.seed, 3),
      damage: cleared.enemy.damage,
      guardian: null,
    });
    expect(clearSkippedWaves(state, 1)).toBe(state);
  });

  it('gives the ofuda of the skipped guardians, all beaten in the parade that ends', () => {
    const state = createNewGame(6);
    expect(clearSkippedWaves(state, 76).ofuda).toBe(0);
    expect(clearSkippedWaves(state, 101).ofuda).toBe(5);
    expect(clearSkippedWaves(state, 201).ofuda).toBe(5 + 10);
  });

  it('draws the captures of the skipped yōkai, deterministically', () => {
    const state = { ...createNewGame(7), kamidana: { ...createNewGame(7).kamidana, yokaiCall: 6 } };
    const cleared = clearSkippedWaves(state, 201);
    expect(cleared.shikigami.length).toBeGreaterThan(0);
    expect(cleared.rngState).not.toBe(state.rngState);
    expect(clearSkippedWaves(state, 201)).toEqual(cleared);
  });

  it('opens the next parade further on, with what the skipped waves give', () => {
    fc.assert(
      fc.property(arbitraryGameState, fc.integer({ min: 1, max: 8 }), (base, level) => {
        const state = {
          ...withRecord(base, 650),
          kamidana: { ...base.kamidana, headStart: level },
        };
        const result = startFestival(state);
        if (!result.ok) throw new Error(result.reason);
        const next = result.state;
        const start = 1 + 25 * level;
        expect(festivalPreview(state).startWave).toBe(start);
        expect(next.parade).toMatchObject({ wave: start, maxWave: start, farming: false });
        expect(next.enemy.guardian).toBeNull();
        expect(gt(next.souls, 0)).toBe(true);
        expect(next.ofuda).toBeGreaterThanOrEqual(state.ofuda);
        expect(next.shikigami.length).toBeGreaterThanOrEqual(state.shikigami.length);
        expect(next.guardiansDefeated).toEqual(state.guardiansDefeated);
        expect(startFestival(state)).toEqual(result);
      }),
      { numRuns: 30 },
    );
  });
});

describe('Festival Flame', () => {
  it('adds 25 % of sparks per level, rounded down once', () => {
    expect(festivalSparks(1000)).toBe(315);
    expect(festivalSparks(1000, 2)).toBe(473);
  });

  it('never gives fewer sparks with more levels, and shows them in the preview', () => {
    fc.assert(
      fc.property(arbitraryGameState, fc.integer({ min: 101, max: 5000 }), (base, record) => {
        const state = withRecord(base, record);
        const level = state.kamidana.festivalFlame;
        expect(festivalSparks(record, level + 1)).toBeGreaterThanOrEqual(
          festivalSparks(record, level),
        );
        expect(festivalPreview(state).sparksToEarn).toBe(festivalSparks(record, level));
      }),
    );
  });
});
