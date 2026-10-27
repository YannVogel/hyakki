import * as fc from 'fast-check';

import { step } from '../combat';
import { createNewGame, type GameState } from '../gameState';
import { div, eq, gt, toMantissaExponent, toNumber } from '../numbers';
import { stateAtWave } from '../testing/states';
import { offlineCapMs, simulateOffline } from './simulateOffline';

const HOUR = 3_600_000;

const comparable = (result: ReturnType<typeof simulateOffline>) => ({
  ...result,
  state: {
    ...result.state,
    souls: toMantissaExponent(result.state.souls),
    enemy: { ...result.state.enemy, damage: toMantissaExponent(result.state.enemy.damage) },
  },
  report: {
    ...result.report,
    souls: toMantissaExponent(result.report.souls),
    reachedCap: undefined,
  },
});

describe('offlineCapMs', () => {
  it('starts at 8 h, adds 1 h per lantern level and stops at 24 h', () => {
    expect(offlineCapMs(createNewGame(1))).toBe(8 * HOUR);
    expect(offlineCapMs(stateAtWave(1, 5, { lanterns: 3 }))).toBe(11 * HOUR);
    expect(offlineCapMs(stateAtWave(1, 5, { lanterns: 40 }))).toBe(24 * HOUR);
  });
});

describe('simulateOffline', () => {
  it('gives nothing when the clock went backwards or nothing elapsed', () => {
    fc.assert(
      fc.property(fc.integer(), fc.constantFrom(0, -1, -HOUR, Number.NaN), (seed, elapsed) => {
        const state = stateAtWave(seed, 40, { blade: 30 });
        const { state: after, report } = simulateOffline(state, elapsed);
        expect(after).toBe(state);
        expect(report.yokaiDefeated).toBe(0);
        expect(eq(report.souls, 0)).toBe(true);
        expect(report.waveTo).toBe(40);
      }),
    );
  });

  it('never gains more than the cap allows', () => {
    fc.assert(
      fc.property(
        fc.integer(),
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 1, max: 72 }),
        (seed, lanterns, hours) => {
          const state = stateAtWave(seed, 30, { blade: 25, lanterns });
          const cap = offlineCapMs(state);
          const result = simulateOffline(state, hours * HOUR);
          expect(result.report.durationMs).toBe(Math.min(hours * HOUR, cap));
          expect(result.report.reachedCap).toBe(hours * HOUR > cap);
          expect(comparable(result)).toEqual(
            comparable(simulateOffline(state, Math.min(hours * HOUR, cap))),
          );
        },
      ),
      { numRuns: 25 },
    );
  });

  it('stays close to active play over 10 minutes (±1 wave, ±15 % souls) at full efficiency', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const state = stateAtWave(seed, 20, { blade: 60 });
      const active = step(state, 600_000).state;
      const offline = simulateOffline(state, 600_000, 1).state;
      expect(Math.abs(offline.parade.wave - active.parade.wave)).toBeLessThanOrEqual(1);
      expect(Math.abs(toNumber(div(offline.souls, active.souls)) - 1)).toBeLessThan(0.15);
    }
  });

  it('earns half as much damage as active play by default', () => {
    const state = stateAtWave(7, 60, { blade: 5 });
    const half = simulateOffline(state, 60_000).state.enemy.damage;
    const full = simulateOffline(state, 60_000, 1).state.enemy.damage;
    expect(toNumber(div(full, half))).toBeCloseTo(2, 9);
  });

  it('stops in front of the next guardian and farms the wave before it', () => {
    const state = stateAtWave(3, 95, { blade: 1e9 });
    const { state: after, report } = simulateOffline(state, HOUR);
    expect(report.stoppedAtGuardian).toBe(true);
    expect(report.waveFrom).toBe(95);
    expect(report.waveTo).toBe(100);
    expect(report.yokaiDefeated).toBeGreaterThan(1000);
    expect(after.parade).toMatchObject({ wave: 100, maxWave: 100, farming: false });
    expect(after.enemy.guardian).toEqual({ engaged: false, timeLeftMs: 30_000 });
    expect(after.guardiansDefeated).toEqual([]);
  });

  it('never fights a guardian left mid-fight: it waits again, with its full timer', () => {
    const engaged = step(stateAtWave(4, 200, { blade: 1e20 }), 0, [
      { type: 'engageGuardian' },
    ]).state;
    const { state: after, report } = simulateOffline(engaged, HOUR);
    expect(after.enemy.guardian).toEqual({ engaged: false, timeLeftMs: 30_000 });
    expect(after.parade.wave).toBe(200);
    expect(gt(report.souls, 0)).toBe(true);
  });

  it('keeps farming when the player was farming', () => {
    const fled = step(stateAtWave(5, 300, { blade: 1e20 }), 0, [{ type: 'fleeGuardian' }]).state;
    const { state: after, report } = simulateOffline(fled, HOUR);
    expect(after.parade).toMatchObject({ wave: 299, farming: true });
    expect(report.stoppedAtGuardian).toBe(false);
    expect(after.parade.repeat).toBeGreaterThan(fled.parade.repeat);
  });

  it('extrapolates long absences linearly beyond the simulated sample', () => {
    const state = stateAtWave(6, 99, { blade: 1e9 });
    const twelve = simulateOffline(
      { ...state, sanctuary: { ...state.sanctuary, lanterns: 16 } },
      12 * HOUR,
    ).report;
    const day = simulateOffline(
      { ...state, sanctuary: { ...state.sanctuary, lanterns: 16 } },
      24 * HOUR,
    ).report;
    expect(day.yokaiDefeated).toBeGreaterThan(2000);
    expect(toNumber(div(day.souls, twelve.souls))).toBeCloseTo(2, 2);
  });

  it('draws captures reproducibly and reports level changes', () => {
    const state: GameState = { ...stateAtWave(8, 99, { blade: 1e9 }), shikigami: [] };
    const first = simulateOffline(state, 8 * HOUR);
    expect(simulateOffline(state, 8 * HOUR)).toEqual(first);
    expect(first.report.levelUps.length).toBeGreaterThan(0);
    for (const levelUp of first.report.levelUps) {
      const owned = first.state.shikigami.find((shikigami) => shikigami.seed === levelUp.seed);
      expect(owned?.level).toBe(levelUp.to);
      expect(levelUp.to).toBeGreaterThan(levelUp.from);
    }
  });

  it('lets cooldowns and effects run out', () => {
    const state = stateAtWave(9, 10);
    const busy = {
      ...state,
      cooldowns: { kitsunebi: 20_000, raijin: 90_000, kekkai: 0 },
      effects: { burnMs: 3_000, soulsBoostMs: 9_000 },
    };
    const after = simulateOffline(busy, 60_000).state;
    expect(after.cooldowns).toEqual({ kitsunebi: 0, raijin: 30_000, kekkai: 0 });
    expect(after.effects).toEqual({ burnMs: 0, soulsBoostMs: 0 });
  });
});
