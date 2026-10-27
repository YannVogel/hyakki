import * as fc from 'fast-check';

import { createNewGame, enemySeed, type GameState } from '../gameState';
import { setTeam, shikigamiIntervalMs } from '../shikigami';
import { div, eq, gt, mul, sub, toNumber, ZERO } from '../numbers';
import { waveSouls, yokaiMaxHp, yokaiProfile } from './enemy';
import type { CombatEvent } from './events';
import { step } from './step';

const withSanctuary = (state: GameState, levels: Partial<GameState['sanctuary']>): GameState => ({
  ...state,
  sanctuary: { ...state.sanctuary, ...levels },
});

/** Runs `totalMs` as `count` equal steps. */
function runSplit(state: GameState, totalMs: number, count: number) {
  let current = state;
  const events: CombatEvent[] = [];
  for (let i = 0; i < count; i++) {
    const result = step(current, totalMs / count);
    current = result.state;
    events.push(...result.events);
  }
  return { state: current, events };
}

const relativeGap = (a: GameState['souls'], b: GameState['souls']) =>
  eq(a, b) ? 0 : Math.abs(toNumber(div(sub(a, b), a)));

describe('step', () => {
  it('changes nothing when no time passes and nothing happens', () => {
    fc.assert(
      fc.property(fc.integer(), (seed) => {
        const state = createNewGame(seed);
        expect(step(state, 0, [])).toEqual({ state, events: [] });
      }),
    );
  });

  it('ignores negative or invalid durations', () => {
    const state = createNewGame(1);
    expect(step(state, -500).state).toBe(state);
    expect(step(state, Number.NaN).state).toBe(state);
  });

  it('attacks automatically once per second', () => {
    const { events } = step(createNewGame(3), 2500);
    const heroHits = events.filter((event) => event.type === 'hit' && event.source === 'hero');
    expect(heroHits.map((event) => event.atMs)).toEqual([0, 1000, 2000]);
  });

  it('gives the same result whatever the tick size (exact without burn)', () => {
    fc.assert(
      fc.property(fc.integer(), fc.constantFrom(1, 2, 4, 10, 25), (seed, count) => {
        const state = withSanctuary(createNewGame(seed), { blade: 40 });
        const single = step(state, 60_000);
        const split = runSplit(state, 60_000, count);
        expect(split.state).toEqual(single.state);
        expect(split.events.length).toBe(single.events.length);
      }),
      { numRuns: 30 },
    );
  });

  it('gives the same result whatever the tick size, within 1e-9 with burn', () => {
    fc.assert(
      fc.property(fc.integer(), fc.constantFrom(3, 7, 600), (seed, count) => {
        const state = withSanctuary(createNewGame(seed), { blade: 10, foxfire: 20 });
        const single = step(state, 60_000).state;
        const split = runSplit(state, 60_000, count).state;
        expect(split.parade).toEqual(single.parade);
        expect(split.rngState).toBe(single.rngState);
        expect(relativeGap(split.souls, single.souls)).toBeLessThan(1e-9);
      }),
      { numRuns: 30 },
    );
  });

  it('defeats a yōkai, pays its souls and starts the next wave', () => {
    const state = withSanctuary(createNewGame(11), { blade: 10_000 });
    const { state: next, events } = step(state, 1);
    const seed = state.enemy.seed;
    const souls = mul(waveSouls(1), yokaiProfile(seed).soulsFactor);
    expect(events).toEqual([
      expect.objectContaining({ type: 'hit', source: 'hero', atMs: 0 }),
      { type: 'yokaiDefeated', wave: 1, seed, souls, atMs: 0 },
      { type: 'waveStarted', wave: 2, seed: enemySeed(11, 2), atMs: 0 },
    ]);
    expect(next.parade.wave).toBe(2);
    expect(next.parade.maxWave).toBe(2);
    expect(next.enemy.seed).toBe(enemySeed(11, 2));
    expect(eq(next.enemy.damage, ZERO)).toBe(true);
    expect(eq(next.souls, souls)).toBe(true);
  });

  it('adds a hit per tap, at the start of the step', () => {
    const state = createNewGame(5);
    const { events } = step(state, 0, [{ type: 'tap' }, { type: 'tap' }]);
    expect(events.map((event) => event.type === 'hit' && event.source)).toEqual(['tap', 'tap']);
    const tapped = step(
      state,
      10_000,
      Array.from({ length: 30 }, () => ({ type: 'tap' as const })),
    );
    const idle = step(state, 10_000);
    expect(
      tapped.state.parade.wave > idle.state.parade.wave ||
        gt(tapped.state.enemy.damage, idle.state.enemy.damage),
    ).toBe(true);
  });

  it('lands critical hits for triple damage, reproducibly', () => {
    const state = createNewGame(8);
    const taps = Array.from({ length: 200 }, () => ({ type: 'tap' as const }));
    const hits = step(state, 0, taps).events.filter((event) => event.type === 'hit');
    const crits = hits.filter((event) => event.type === 'hit' && event.crit);
    expect(crits.length).toBeGreaterThan(0);
    for (const event of hits) {
      if (event.type === 'hit') {
        expect(toNumber(event.damage)).toBe(event.crit ? 3 : 1);
      }
    }
    expect(step(state, 0, taps)).toEqual(step(state, 0, taps));
  });

  it('burns the enemy continuously with the fox fire upgrade', () => {
    const state = withSanctuary(createNewGame(13), { foxfire: 50 });
    const maxHp = yokaiMaxHp(1, state.enemy.seed);
    // 50 levels × 0.2 % = 10 % of max HP per second: dead in 10 s even without attacks.
    const burnt = step({ ...state, attackTimers: { hero: 1e9, team: [] } }, 9_000).state;
    expect(toNumber(div(burnt.enemy.damage, maxHp))).toBeCloseTo(0.9, 9);
    const killed = step({ ...state, attackTimers: { hero: 1e9, team: [] } }, 10_001);
    expect(killed.events.some((event) => event.type === 'yokaiDefeated')).toBe(true);
  });

  it('pays more souls with the sacred bell', () => {
    const base = withSanctuary(createNewGame(21), { blade: 10_000 });
    const plain = step(base, 1).state.souls;
    const belled = step(withSanctuary(base, { bell: 10 }), 1).state.souls;
    expect(toNumber(div(belled, plain))).toBeCloseTo(1.5, 9);
  });
});

describe('step with a team and captures', () => {
  const withTeam = (state: GameState, seeds: number[]): GameState => {
    const owned = {
      ...state,
      shikigami: seeds.map((seed) => ({ seed, level: 1, generatorVersion: 1 })),
    };
    const result = setTeam(owned, seeds);
    if (!result.ok) throw new Error(result.reason);
    return result.state;
  };

  it('lets each team member attack on its own timer', () => {
    const state = withTeam(createNewGame(4), [10, 20]);
    const { events } = step(state, 10_000);
    const shikigamiHits = events.filter(
      (event) => event.type === 'hit' && event.source === 'shikigami',
    );
    const expected = [10, 20].reduce(
      (total, seed) => total + Math.floor((10_000 - 1) / shikigamiIntervalMs(seed)),
      0,
    );
    expect(shikigamiHits).toHaveLength(expected);
  });

  it('stays independent of the tick size with a team', () => {
    fc.assert(
      fc.property(fc.integer(), fc.constantFrom(2, 5, 40), (seed, count) => {
        const state = withTeam(withSanctuary(createNewGame(seed), { blade: 30 }), [3, 4, 5]);
        expect(runSplit(state, 30_000, count).state).toEqual(step(state, 30_000).state);
      }),
      { numRuns: 20 },
    );
  });

  it('captures yōkai reproducibly, without duplicates in the collection', () => {
    // One-shots every yōkai below wave 100: 98 taps defeat 98 yōkai at 2 % capture chance or less.
    const state = withSanctuary(createNewGame(2), { blade: 1e12 });
    const taps = Array.from({ length: 98 }, () => ({ type: 'tap' as const }));
    const first = step(state, 0, taps);
    expect(step(state, 0, taps)).toEqual(first);
    const captures = first.events.filter((event) => event.type === 'shikigamiCaptured');
    expect(captures.length).toBeGreaterThan(0);
    const seeds = first.state.shikigami.map((shikigami) => shikigami.seed);
    expect(new Set(seeds).size).toBe(seeds.length);
  });
});
