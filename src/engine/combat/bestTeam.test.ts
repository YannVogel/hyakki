import * as fc from 'fast-check';

import { createNewGame, type GameState, TEAM_SIZE } from '../gameState';
import { compare } from '../numbers';
import { teamBonus, teamMembers } from '../shikigami';
import { bestTeam, shikigamiDps, teamDps } from './bestTeam';

const owning = (seeds: readonly number[], levels: readonly number[] = []): GameState => {
  const state = createNewGame(1);
  return {
    ...state,
    parade: { ...state.parade, wave: 250, maxWave: 250 },
    sanctuary: { ...state.sanctuary, blade: 80, foxfire: 10 },
    shikigami: seeds.map((seed, index) => ({
      seed,
      level: levels[index] ?? 1,
      generatorVersion: 2,
    })),
  };
};

const atLevelOne = (state: GameState): GameState => ({
  ...state,
  shikigami: state.shikigami.map((entry) => ({ ...entry, level: 1 })),
});

const subsets = (seeds: readonly number[], size: number): number[][] =>
  size === 0
    ? [[]]
    : seeds.flatMap((seed, index) =>
        subsets(seeds.slice(index + 1), size - 1).map((rest) => [seed, ...rest]),
      );

const sorted = (seeds: readonly number[]) => [...seeds].sort((a, b) => a - b);
const SEEDS = Array.from({ length: 40 }, (_, index) => 1000 + index * 7919);

describe('bestTeam', () => {
  it('fields nobody from an empty collection, everybody from a small one', () => {
    expect(bestTeam(owning([]))).toEqual([]);
    expect(sorted(bestTeam(owning([5, 9])))).toEqual([5, 9]);
  });

  it('is deterministic, whatever the order of the collection', () => {
    const forward = bestTeam(owning(SEEDS));
    expect(forward).toHaveLength(TEAM_SIZE);
    expect(bestTeam(owning(SEEDS))).toEqual(forward);
    expect(sorted(bestTeam(owning([...SEEDS].reverse())))).toEqual(sorted(forward));
  });

  it('judges every yōkai at level 1: a heavily levelled one can leave the team', () => {
    const levelOne = owning(SEEDS);
    const best = bestTeam(levelOne);
    const weakest = [...levelOne.shikigami].sort((a, b) =>
      compare(shikigamiDps(a), shikigamiDps(b)),
    )[0];
    expect(best).not.toContain(weakest.seed);
    const levels = SEEDS.map((seed) => (seed === weakest.seed ? 200 : 1));
    expect(bestTeam(owning(SEEDS, levels))).toEqual(best);
  });

  it('beats or ties every other team of a small collection (brute force)', () => {
    const collection = fc.uniqueArray(fc.integer({ min: 0, max: 2 ** 31 - 1 }), {
      minLength: 1,
      maxLength: 7,
    });
    const context = fc.record({
      wave: fc.integer({ min: 1, max: 1000 }),
      foxfire: fc.integer({ min: 0, max: 60 }),
    });
    fc.assert(
      fc.property(collection, context, (seeds, { wave, foxfire }) => {
        const base = owning(seeds);
        const state = {
          ...base,
          parade: { ...base.parade, wave, maxWave: wave },
          sanctuary: { ...base.sanctuary, foxfire },
        };
        const levelOne = atLevelOne(state);
        const best = bestTeam(state);
        const score = (team: readonly number[]) => ({
          dps: teamDps(levelOne, team),
          souls: teamBonus(teamMembers({ ...levelOne, team: [...team] })).souls,
        });
        const chosen = score(best);
        for (const other of subsets(seeds, Math.min(TEAM_SIZE, seeds.length))) {
          const rival = score(other);
          const order = compare(rival.dps, chosen.dps);
          expect(order <= 0).toBe(true);
          if (order === 0) {
            expect(rival.souls).toBeLessThanOrEqual(chosen.souls);
          }
        }
      }),
      { numRuns: 60 },
    );
  });

  it('chooses instantly among 500 shikigami', () => {
    const state = owning(Array.from({ length: 500 }, (_, index) => index * 104_729 + 3));
    bestTeam(state);
    const started = performance.now();
    expect(bestTeam(state)).toHaveLength(TEAM_SIZE);
    expect(performance.now() - started).toBeLessThan(100);
  });
});
