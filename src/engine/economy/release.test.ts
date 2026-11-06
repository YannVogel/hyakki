import * as fc from 'fast-check';

import { BALANCE } from '../balance';
import { waveSouls } from '../combat/enemy';
import { tierMultiplier } from '../combat/guardians';
import { combatPower } from '../combat/power';
import type { GameState, Shikigami } from '../gameState';
import { add, div, eq, gt, mul, sub, toNumber, ZERO } from '../numbers';
import { addCapture } from '../shikigami';
import { stateAtWave } from '../testing/states';
import { fastestMs } from '../testing/timing';
import { generate, type Rarity } from '../yokai';
import { releaseShikigami, releaseSouls, releaseWorth } from './release';

const RARITIES: readonly Rarity[] = ['common', 'rare', 'epic', 'legendary'];

const owning = (shikigami: Shikigami[], team: number[] = [], wave = 250): GameState => ({
  ...stateAtWave(2026, wave),
  shikigami,
  team,
  attackTimers: { hero: 0, team: team.map(() => 1000) },
});

const shikigamiOf = (seeds: readonly number[], level = 1): Shikigami[] =>
  seeds.map((seed) => ({ seed, level, generatorVersion: 2 }));

/** The first seed from `from` whose yōkai has this rarity. */
const seedOf = (rarity: Rarity, from = 1): number => {
  let seed = from;
  while (generate(seed, 2).rarity !== rarity) {
    seed += 1;
  }
  return seed;
};

const relativeGap = (a: ReturnType<typeof add>, b: ReturnType<typeof add>) =>
  eq(a, b) ? 0 : Math.abs(toNumber(div(sub(a, b), a)));

describe('releaseShikigami', () => {
  it('gives the souls of releaseYokai × level yōkai of the current wave, bonuses included', () => {
    const seed = seedOf('common');
    const state = owning(shikigamiOf([seed], 3));
    const result = releaseShikigami(state, [seed]);
    const perYokai = mul(waveSouls(250), tierMultiplier(250) * combatPower(state).soulsMultiplier);
    const expected = mul(perYokai, BALANCE.shikigami.releaseYokai.common * 3);
    expect(result.ok && relativeGap(result.souls, expected)).toBe(0);
    expect(result.ok && eq(result.state.souls, add(state.souls, result.souls))).toBe(true);
    expect(result.ok && result.state.shikigami).toEqual([]);
  });

  it('is deterministic and never draws from the RNG', () => {
    const seeds = [seedOf('common'), seedOf('rare'), seedOf('epic')];
    const state = owning(shikigamiOf(seeds, 4));
    const first = releaseShikigami(state, seeds);
    const second = releaseShikigami(state, seeds);
    expect(first).toEqual(second);
    expect(first.ok && first.state.rngState).toBe(state.rngState);
  });

  it('pays more for a higher level and a rarer yōkai', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5000 }),
        fc.integer({ min: 0, max: RARITIES.length - 2 }),
        (level, index) => {
          const rarity = RARITIES[index];
          expect(releaseWorth(rarity, level + 1)).toBeGreaterThan(releaseWorth(rarity, level));
          expect(releaseWorth(RARITIES[index + 1], level)).toBeGreaterThan(
            releaseWorth(rarity, level),
          );
        },
      ),
    );
    const state = owning([]);
    expect(gt(releaseSouls(state, 2), releaseSouls(state, 1))).toBe(true);
  });

  it('gives as much in bulk as one shikigami after the other', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 1, max: 2 ** 31 - 1 }), { minLength: 1, maxLength: 8 }),
        fc.integer({ min: 1, max: 300 }),
        (seeds, level) => {
          const state = owning(shikigamiOf(seeds, level));
          const bulk = releaseShikigami(state, seeds);
          let current = state;
          let souls = ZERO;
          for (const seed of seeds) {
            const single = releaseShikigami(current, [seed]);
            if (!single.ok) {
              throw new Error(single.reason);
            }
            current = single.state;
            souls = add(souls, single.souls);
          }
          expect(bulk.ok && bulk.released).toBe(seeds.length);
          expect(bulk.ok && relativeGap(bulk.souls, souls)).toBeLessThan(1e-9);
        },
      ),
    );
  });

  it('never releases a team member, and refuses what is not owned or nothing', () => {
    const state = owning(shikigamiOf([1, 2, 3]), [2]);
    expect(releaseShikigami(state, [1, 2])).toEqual({ ok: false, reason: 'in-team' });
    expect(releaseShikigami(state, [1, 9])).toEqual({ ok: false, reason: 'not-owned' });
    expect(releaseShikigami(state, [])).toEqual({ ok: false, reason: 'nothing-to-release' });
  });

  it('lets a released seed be captured again, as a new shikigami of the current generator', () => {
    const state = owning(shikigamiOf([42], 30));
    const result = releaseShikigami(state, [42]);
    const capture = addCapture(result.ok ? result.state.shikigami : [], 42, 2);
    expect(capture.isNew).toBe(true);
    expect(capture.shikigami).toEqual({ seed: 42, level: 1, generatorVersion: 2 });
  });
});

describe('releasing in bulk', () => {
  it('leaves the team and the other shikigami in place', () => {
    const commons = [seedOf('common'), seedOf('common', 1000), seedOf('common', 2000)];
    const rare = seedOf('rare');
    const state = owning(shikigamiOf([...commons, rare]), [commons[0]]);
    const result = releaseShikigami(state, commons.slice(1));
    expect(result.ok && result.state.team).toEqual([commons[0]]);
    expect(result.ok && result.state.shikigami.map((shikigami) => shikigami.seed)).toEqual([
      commons[0],
      rare,
    ]);
  });

  it('frees 5 000 shikigami at once, instantly', () => {
    const seeds = Array.from({ length: 5000 }, (_, index) => index * 104_729 + 3);
    const state = owning(shikigamiOf(seeds), [3]);
    // The screen hands over the seeds it already shows: only the release itself is timed.
    const spare = seeds.slice(1);
    const result = releaseShikigami(state, spare);
    expect(result.ok && result.state.shikigami).toHaveLength(1);
    expect(fastestMs(() => releaseShikigami(state, spare))).toBeLessThan(250);
  });
});
