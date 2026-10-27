import * as fc from 'fast-check';

import { div, eq, toNumber } from '../numbers';
import { stateAtWave } from '../testing/states';
import { waveHp } from './enemy';
import type { CombatEvent } from './events';
import {
  guardianAt,
  guardianMaxHp,
  guardianOfuda,
  GUARDIANS,
  isGuardianWave,
  tierMultiplier,
} from './guardians';
import { step } from './step';

const types = (events: readonly CombatEvent[]) => events.map((event) => event.type);
const ENGAGE = { type: 'engageGuardian' } as const;
// Strong enough to one-shot anything before wave 1100, weak = level 0.
const STRONG = { blade: 2000 };

describe('guardian formulas', () => {
  it('only puts guardians on multiples of 100', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100_000 }), (wave) => {
        expect(isGuardianWave(wave)).toBe(wave % 100 === 0);
      }),
    );
  });

  it('meets the ten guardians in order, then their awakened versions', () => {
    expect(guardianAt(100)).toEqual({ index: 0, awakening: 0 });
    expect(guardianAt(1000)).toEqual({ index: 9, awakening: 0 });
    expect(guardianAt(1100)).toEqual({ index: 0, awakening: 1 });
    expect(guardianAt(2000)).toEqual({ index: 9, awakening: 1 });
    expect(guardianAt(2100)).toEqual({ index: 0, awakening: 2 });
    expect(GUARDIANS).toHaveLength(10);
  });

  it('gives guardians 12 × the wave HP, doubled per awakening', () => {
    expect(toNumber(div(guardianMaxHp(100), waveHp(100)))).toBeCloseTo(12, 9);
    expect(toNumber(div(guardianMaxHp(1100), waveHp(1100)))).toBeCloseTo(24, 9);
  });

  it('pays more ofuda for later and awakened guardians', () => {
    expect(guardianOfuda(100)).toBe(5);
    expect(guardianOfuda(1000)).toBe(50);
    expect(guardianOfuda(1100)).toBe(10);
  });

  it('raises the souls of each tier passed', () => {
    expect(tierMultiplier(1)).toBe(1);
    expect(tierMultiplier(100)).toBe(1);
    expect(tierMultiplier(101)).toBe(1.5);
    expect(tierMultiplier(250)).toBe(2);
  });
});

describe('guardian fights', () => {
  it('waits at the cut-in: no damage and no timer until engaged', () => {
    const state = stateAtWave(1, 99, STRONG);
    const reached = step(state, 1000).state;
    expect(reached.parade.wave).toBe(100);
    expect(reached.enemy.guardian).toEqual({ engaged: false, timeLeftMs: 30_000 });
    const waited = step(reached, 60_000, [{ type: 'tap' }]);
    expect(waited.state.enemy).toEqual(reached.enemy);
    expect(waited.events).toEqual([]);
  });

  it('announces the guardian when it appears', () => {
    const { events } = step(stateAtWave(1, 99, STRONG), 1);
    expect(types(events)).toEqual(['hit', 'yokaiDefeated', 'waveStarted', 'guardianAppeared']);
    expect(events[3]).toMatchObject({ wave: 100, index: 0, awakening: 0 });
  });

  it('sends the player back to farm the previous wave after 30 s', () => {
    const state = stateAtWave(4, 100);
    const engaged = step(state, 0, [ENGAGE]).state;
    expect(engaged.enemy.guardian).toEqual({ engaged: true, timeLeftMs: 30_000 });
    const before = step(engaged, 29_999).state;
    expect(before.parade.wave).toBe(100);
    const { state: failed, events } = step(before, 2);
    expect(types(events)).toContain('guardianFailed');
    expect(failed.parade).toMatchObject({ wave: 99, farming: true, repeat: 1 });
    expect(failed.enemy.guardian).toBeNull();
  });

  it('rewards a victory with ofuda, the gallery and the next wave', () => {
    const state = stateAtWave(6, 300, STRONG);
    const { state: won, events } = step(state, 1, [ENGAGE]);
    expect(events).toContainEqual(
      expect.objectContaining({
        type: 'guardianDefeated',
        wave: 300,
        index: 2,
        ofuda: 15,
        firstTime: true,
      }),
    );
    expect(won.ofuda).toBe(15);
    expect(won.guardiansDefeated).toEqual([2]);
    expect(won.parade).toMatchObject({ wave: 301, maxWave: 301, farming: false });
    const again = step({ ...state, guardiansDefeated: [2] }, 1, [ENGAGE]).events;
    expect(again).toContainEqual(
      expect.objectContaining({ type: 'guardianDefeated', firstTime: false }),
    );
  });

  it('never lets a guardian be captured', () => {
    const { events } = step(stateAtWave(6, 100, STRONG), 1, [ENGAGE]);
    expect(types(events)).not.toContain('shikigamiCaptured');
  });

  it('farms fresh yōkai on the previous wave, then lets the player try again', () => {
    const farming = step(
      step(stateAtWave(9, 100, STRONG), 0, [{ type: 'fleeGuardian' }]).state,
      0,
    ).state;
    expect(farming.parade).toMatchObject({ wave: 99, farming: true, repeat: 1 });
    const seeds = new Set<number>();
    let current = farming;
    for (let i = 0; i < 5; i++) {
      current = step(current, 1000).state;
      seeds.add(current.enemy.seed);
    }
    expect(current.parade.wave).toBe(99);
    expect(seeds.size).toBe(5);
    const challenged = step(current, 0, [{ type: 'challengeGuardian' }]).state;
    expect(challenged.parade).toMatchObject({ wave: 100, farming: false });
    expect(challenged.enemy.guardian).toEqual({ engaged: false, timeLeftMs: 30_000 });
  });

  it('cycles through awakened guardians beyond wave 1000', () => {
    const { events } = step(stateAtWave(2, 1099, STRONG), 1);
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'guardianAppeared', wave: 1100, index: 0, awakening: 1 }),
    );
    const won = step(stateAtWave(2, 1100, STRONG), 1, [ENGAGE]);
    expect(won.events).toContainEqual(
      expect.objectContaining({ type: 'guardianDefeated', index: 0, ofuda: 10 }),
    );
  });

  it('weakens percentage burns against guardians', () => {
    // 50 levels of fox fire burn 10 %/s of a yōkai, but only 2 %/s of a guardian.
    const state = stateAtWave(3, 100, { foxfire: 50 });
    const engaged = step(state, 0, [ENGAGE]).state;
    const idle = { ...engaged, attackTimers: { hero: 1e9, team: [] } };
    const burnt = step(idle, 10_000).state;
    expect(toNumber(div(burnt.enemy.damage, guardianMaxHp(100)))).toBeCloseTo(0.2, 9);
  });

  it('does not depend on the tick size during a guardian fight', () => {
    const engaged = step(stateAtWave(5, 200, { blade: 250 }), 0, [ENGAGE]).state;
    const single = step(engaged, 40_000).state;
    let split = engaged;
    for (let i = 0; i < 40; i++) {
      split = step(split, 1000).state;
    }
    expect(split.parade).toEqual(single.parade);
    expect(split.rngState).toBe(single.rngState);
    expect(eq(split.souls, single.souls)).toBe(true);
  });
});
