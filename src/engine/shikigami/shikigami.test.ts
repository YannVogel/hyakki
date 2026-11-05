import * as fc from 'fast-check';

import { createNewGame, type GameState, type Shikigami } from '../gameState';
import { add, big, div, eq, gte, lt, pow, sub, toNumber, ZERO } from '../numbers';
import { arbitraryBigNum } from '../testing/arbitraries';
import { generate, GENERATOR_VERSIONS, statsOf } from '../yokai';
import {
  addCapture,
  captureChance,
  levelUpCost,
  levelUpCount,
  type LevelUpMode,
  levelUpShikigami,
  maxLevelUps,
  setTeam,
  teamMembers,
} from './collection';
import { shikigamiHitRatio, shikigamiIntervalMs, teamBonus } from './profile';

const anySeed = fc.integer({ min: 0, max: 2 ** 31 - 1 });
const anyVersion = fc.constantFrom(...GENERATOR_VERSIONS);
const anyLevel = fc.integer({ min: 1, max: 3000 });
const v1 = (seed: number): Shikigami => ({ seed, level: 1, generatorVersion: 1 });

const owning = (seeds: number[], state: GameState = createNewGame(1)): GameState => ({
  ...state,
  shikigami: seeds.map(v1),
});

describe('captures', () => {
  it('uses the rarity capture rates of the game design', () => {
    const rates = { common: 0.02, rare: 0.01, epic: 0.004, legendary: 0.001 };
    fc.assert(
      fc.property(anySeed, anyVersion, (seed, version) => {
        expect(captureChance(seed, version)).toBe(rates[generate(seed, version).rarity]);
      }),
    );
  });

  it('adds a new shikigami at level 1', () => {
    const { collection, shikigami, isNew } = addCapture([], 42, 1);
    expect(isNew).toBe(true);
    expect(shikigami).toEqual({ seed: 42, level: 1, generatorVersion: 1 });
    expect(collection).toEqual([shikigami]);
  });

  it('levels up a duplicate instead of adding it, keeping the look of its first capture', () => {
    const owned: Shikigami[] = [{ seed: 42, level: 3, generatorVersion: 1 }];
    const { collection, shikigami, isNew } = addCapture(owned, 42, 2);
    expect(isNew).toBe(false);
    expect(shikigami).toEqual({ seed: 42, level: 4, generatorVersion: 1 });
    expect(collection).toEqual([shikigami]);
  });

  it('never holds the same seed twice', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 0, max: 20 }), { maxLength: 60 }), (seeds) => {
        const collection = seeds.reduce<Shikigami[]>(
          (current, seed) => addCapture(current, seed, 1).collection,
          [],
        );
        expect(new Set(collection.map((entry) => entry.seed)).size).toBe(collection.length);
        expect(collection.reduce((sum, entry) => sum + entry.level, 0)).toBe(seeds.length);
      }),
    );
  });
});

describe('team', () => {
  it('accepts up to three distinct owned shikigami, starting a full attack cycle', () => {
    const result = setTeam(owning([1, 2, 3]), [3, 1]);
    expect(result.ok && result.state.team).toEqual([3, 1]);
    expect(result.ok && result.state.attackTimers.team).toEqual([
      shikigamiIntervalMs(v1(3)),
      shikigamiIntervalMs(v1(1)),
    ]);
  });

  it('keeps the timers of members who stay', () => {
    const first = setTeam(owning([1, 2]), [1]);
    if (!first.ok) throw new Error(first.reason);
    const started = { ...first.state, attackTimers: { hero: 0, team: [5] } };
    const second = setTeam(started, [2, 1]);
    expect(second.ok && second.state.attackTimers.team).toEqual([shikigamiIntervalMs(v1(2)), 5]);
  });

  it.each([
    [[1, 2, 3, 4], 'team-too-large'],
    [[1, 1], 'duplicate'],
    [[9], 'not-owned'],
  ])('refuses %p (%s)', (seeds, reason) => {
    expect(setTeam(owning([1, 2, 3, 4]), seeds)).toEqual({ ok: false, reason });
  });

  it('sums the offensive traits of the team', () => {
    fc.assert(
      fc.property(fc.uniqueArray(anySeed, { maxLength: 3 }), anyVersion, (seeds, version) => {
        const members = seeds.map((seed) => ({ seed, generatorVersion: version }));
        const effects = seeds.flatMap((seed) =>
          statsOf(generate(seed, version)).traits.flatMap((trait) => trait.effects),
        );
        const sum = (keep: (effect: (typeof effects)[number]) => number) =>
          effects.reduce((total, effect) => total + keep(effect), 0);
        const bonus = teamBonus(members);
        expect(bonus.attack).toBeCloseTo(
          sum((e) => (e.kind === 'stat' && e.stat === 'attack' ? e.value : 0)),
          12,
        );
        expect(bonus.crit).toBeCloseTo(
          sum((e) => (e.kind === 'crit' ? e.value : 0)),
          12,
        );
        expect(bonus.burn).toBeCloseTo(
          sum((e) => (e.kind === 'burn' ? e.value : 0)),
          12,
        );
      }),
    );
  });
});

describe('versions', () => {
  it('draws each shikigami with the generator of its capture', () => {
    const seeds = Array.from({ length: 40 }, (_, seed) => seed);
    const looks = (version: 1 | 2) =>
      seeds.map((seed) => shikigamiIntervalMs({ seed, generatorVersion: version }));
    expect(looks(1)).toEqual(
      seeds.map((seed) => Math.round(100_000 / statsOf(generate(seed, 1)).speed)),
    );
    expect(looks(1)).not.toEqual(looks(2));
  });

  it('lists the team members in team order', () => {
    const state = { ...owning([1, 2, 3]), team: [3, 1] };
    expect(teamMembers(state).map((member) => member.seed)).toEqual([3, 1]);
  });
});

describe('shikigami power', () => {
  it('attacks faster when faster', () => {
    fc.assert(
      fc.property(anySeed, anyVersion, (seed, version) => {
        expect(shikigamiIntervalMs({ seed, generatorVersion: version })).toBe(
          Math.round(100_000 / statsOf(generate(seed, version)).speed),
        );
      }),
    );
  });

  it('hits harder with attack and levels', () => {
    fc.assert(
      fc.property(anySeed, fc.integer({ min: 1, max: 200 }), anyVersion, (seed, level, version) => {
        const attack = statsOf(generate(seed, version)).attack;
        const shikigami = { seed, level, generatorVersion: version };
        expect(toNumber(shikigamiHitRatio(shikigami))).toBeCloseTo(
          0.5 * (attack / 100) * (1 + 0.1 * (level - 1)),
          12,
        );
      }),
    );
  });
});

describe('level up', () => {
  it('costs 100 souls at level 1, then 18 % more per level', () => {
    expect(toNumber(levelUpCost(1))).toBe(100);
    expect(toNumber(levelUpCost(2))).toBeCloseTo(118, 10);
  });

  it('spends souls and raises the level', () => {
    const state = { ...owning([7]), souls: big(250) };
    const result = levelUpShikigami(state, 7);
    expect(result.ok && result.state.shikigami[0].level).toBe(2);
    expect(result.ok && eq(result.state.souls, 150)).toBe(true);
  });

  it('refuses without enough souls or for a shikigami not owned', () => {
    expect(levelUpShikigami({ ...owning([7]), souls: big(99) }, 7)).toEqual({
      ok: false,
      reason: 'not-enough-souls',
    });
    expect(levelUpShikigami(owning([7]), 8)).toEqual({ ok: false, reason: 'not-owned' });
  });

  it('costs exactly ten and a hundred single level-ups for ×10 and ×100', () => {
    const relativeGap = (a: ReturnType<typeof big>, b: ReturnType<typeof big>) =>
      eq(a, b) ? 0 : Math.abs(toNumber(div(sub(a, b), a)));
    fc.assert(
      fc.property(anyLevel, fc.constantFrom(10, 100), (level, count) => {
        let sum = ZERO;
        for (let i = 0; i < count; i++) {
          sum = add(sum, levelUpCost(level + i));
        }
        expect(relativeGap(levelUpCost(level, count), sum)).toBeLessThan(1e-9);
      }),
    );
  });

  it('affords as many levels as possible, never more than the souls allow', () => {
    fc.assert(
      fc.property(anyLevel, arbitraryBigNum, (level, souls) => {
        const count = maxLevelUps(level, souls);
        expect(gte(souls, levelUpCost(level, count))).toBe(true);
        expect(lt(souls, levelUpCost(level, count + 1))).toBe(true);
      }),
    );
    expect(maxLevelUps(1, big(99))).toBe(0);
    expect(maxLevelUps(1, big(101))).toBe(1);
    expect(maxLevelUps(1, pow(10, 300))).toBeGreaterThan(3000);
  });

  it('buys the count of ×1, ×10 and ×100, and at least one level in « Max »', () => {
    expect(([1, 10, 100] as const).map((mode) => levelUpCount(5, ZERO, mode))).toEqual([
      1, 10, 100,
    ]);
    expect(levelUpCount(1, ZERO, 'max')).toBe(1);
    expect(levelUpCount(1, levelUpCost(1, 42), 'max')).toBe(42);
  });

  it('never leaves a negative balance, and changes nothing when a mode is not affordable', () => {
    fc.assert(
      fc.property(
        anyLevel,
        arbitraryBigNum,
        fc.constantFrom<LevelUpMode[]>(1, 10, 100, 'max'),
        (level, souls, mode) => {
          const state = { ...owning([7]), souls, shikigami: [{ ...v1(7), level }] };
          const count = levelUpCount(level, souls, mode);
          const result = levelUpShikigami(state, 7, count);
          if (result.ok) {
            expect(gte(result.state.souls, 0)).toBe(true);
            expect(result.state.shikigami[0].level).toBe(level + count);
          } else {
            expect(result.reason).toBe('not-enough-souls');
            expect(lt(souls, levelUpCost(level, count))).toBe(true);
          }
        },
      ),
    );
  });
});
