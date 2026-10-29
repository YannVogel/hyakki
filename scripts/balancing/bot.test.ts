import * as fc from 'fast-check';

import {
  add,
  createNewGame,
  type GameState,
  gte,
  gt,
  levelUpCost,
  mul,
  pow,
  type Shikigami,
  shikigamiHitRatio,
  shikigamiIntervalMs,
  log10,
  sub,
  toNumber,
  upgradeCost,
  UPGRADE_IDS,
  upgradeMaxLevel,
  eq,
  div,
  KAMIDANA_IDS,
  kamidanaCost,
  kamidanaMaxLevel,
} from '../../src/engine';
import { canBeatGuardian, pickTeam, spendOfuda, spendSouls, wantsFestival } from './bot';

const anySouls = fc
  .tuple(fc.double({ min: 1, max: 9.99, noNaN: true }), fc.integer({ min: 0, max: 60 }))
  .map(([mantissa, exponent]) => mul(mantissa, pow(10, exponent)));

const withCollection = (seeds: number[], state: GameState = createNewGame(1)): GameState => ({
  ...state,
  shikigami: seeds.map((seed, index) => ({ seed, level: 1 + index, generatorVersion: 1 as const })),
});

describe('spendSouls', () => {
  it('spends until nothing is affordable, never going below zero', () => {
    fc.assert(
      fc.property(anySouls, (souls) => {
        const state = pickTeam(withCollection([11, 22, 33, 44], { ...createNewGame(3), souls }));
        const after = spendSouls(state);
        expect(gte(after.souls, 0)).toBe(true);
        const nextCosts = [
          ...UPGRADE_IDS.filter((id) => after.sanctuary[id] < upgradeMaxLevel(id)).map((id) =>
            upgradeCost(id, after.sanctuary[id], 1),
          ),
          ...after.team.map((seed) =>
            levelUpCost(after.shikigami.find((entry) => entry.seed === seed)?.level ?? 1),
          ),
        ];
        expect(nextCosts.every((cost) => gt(cost, after.souls))).toBe(true);
      }),
      { numRuns: 40 },
    );
  });

  it('buys the cheapest option first', () => {
    // Exactly the price of the first Blade level (5 souls): the only affordable option.
    const state = { ...createNewGame(1), souls: upgradeCost('blade', 0, 1) };
    const after = spendSouls(state);
    expect(after.sanctuary.blade).toBe(1);
    expect(eq(after.souls, 0)).toBe(true);
  });

  it('spends exactly what the purchases cost', () => {
    const souls = pow(10, 12);
    const after = spendSouls({ ...createNewGame(1), souls });
    const spent = UPGRADE_IDS.reduce(
      (total, id) => add(total, upgradeCost(id, 0, after.sanctuary[id])),
      add(after.souls, 0),
    );
    expect(Math.abs(toNumber(div(sub(spent, souls), souls)))).toBeLessThan(1e-9);
  });
});

describe('pickTeam', () => {
  it('fields the three strongest shikigami', () => {
    const seeds = [5, 6, 7, 8, 9, 10];
    const state = pickTeam(withCollection(seeds));
    const strength = (shikigami: Shikigami) =>
      log10(shikigamiHitRatio(shikigami)) - Math.log10(shikigamiIntervalMs(shikigami));
    const ranked = withCollection(seeds)
      .shikigami.map((entry) => ({ seed: entry.seed, value: strength(entry) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map((entry) => entry.seed);
    expect([...state.team].sort()).toEqual([...ranked].sort());
  });

  it('leaves the state untouched without shikigami', () => {
    const state = createNewGame(1);
    expect(pickTeam(state)).toBe(state);
  });
});

describe('guardian and Festival decisions', () => {
  it('needs more power for later guardians', () => {
    const state = { ...createNewGame(1), sanctuary: { ...createNewGame(1).sanctuary, blade: 160 } };
    expect(canBeatGuardian(state, 100, 0)).toBe(true);
    expect(canBeatGuardian(state, 300, 0)).toBe(false);
  });

  it('starts a Festival only when stuck and worth it', () => {
    const base = createNewGame(1);
    const stuck = { ...base, parade: { ...base.parade, wave: 299, maxWave: 300, farming: true } };
    expect(wantsFestival(stuck, 1.15)).toBe(true);
    expect(wantsFestival({ ...stuck, parade: { ...stuck.parade, farming: false } }, 1.15)).toBe(
      false,
    );
    expect(wantsFestival({ ...stuck, sparks: 1000 }, 1.15)).toBe(false);
    // 300 sparks: the bonus would grow by 11 %, enough for a persevering player only.
    expect(wantsFestival({ ...stuck, sparks: 300 }, 1.15)).toBe(false);
    expect(wantsFestival({ ...stuck, sparks: 300 }, 1.05)).toBe(true);
  });
});

describe('spendOfuda', () => {
  const withOfuda = (ofuda: number): GameState => ({ ...createNewGame(1), ofuda });

  it('buys the cheapest blessings first, in the engine order on ties', () => {
    const after = spendOfuda(withOfuda(30));
    expect(after.kamidana.inariPalm).toBe(1);
    expect(after.kamidana.yokaiCall).toBe(1);
    expect(after.ofuda).toBe(0);
  });

  it('never goes into debt, never beyond a max level, and leaves nothing it could buy', () => {
    fc.assert(
      fc.property(fc.nat(100_000), (ofuda) => {
        const after = spendOfuda(withOfuda(ofuda));
        expect(after.ofuda).toBeGreaterThanOrEqual(0);
        for (const id of KAMIDANA_IDS) {
          expect(after.kamidana[id]).toBeLessThanOrEqual(kamidanaMaxLevel(id));
          if (after.kamidana[id] < kamidanaMaxLevel(id)) {
            expect(kamidanaCost(id, after.kamidana[id])).toBeGreaterThan(after.ofuda);
          }
        }
      }),
      { numRuns: 50 },
    );
  });
});
