import { deserialize, generate, serialize, simulateOffline } from '@/engine';

import { devGuardianState, devShowcaseState } from './devStates';

describe('devGuardianState', () => {
  it('is a valid save, with no guardian behind the first one', () => {
    const state = devGuardianState(2026, 100);
    expect(deserialize(serialize(state, 0)).ok).toBe(true);
    expect(state.guardiansDefeated).toEqual([]);
  });

  it('beats the guardians behind an awakened one, as a real parade would', () => {
    const state = devGuardianState(2026, 1300);
    expect(deserialize(serialize(state, 0)).ok).toBe(true);
    expect(state.guardiansDefeated).toHaveLength(10);
    expect(state.guardiansBestAwakening).toEqual([1, 1, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
});

describe('devShowcaseState', () => {
  const state = devShowcaseState(2026);

  it('is a valid save', () => {
    const loaded = deserialize(serialize(state, 0));
    expect(loaded.ok).toBe(true);
  });

  it('shows a varied collection, the rarest in the team', () => {
    const rarities = state.shikigami.map(
      (shikigami) => generate(shikigami.seed, shikigami.generatorVersion).rarity,
    );
    expect(new Set(rarities)).toEqual(new Set(['legendary', 'epic', 'rare', 'common']));
    expect(state.team).toEqual(state.shikigami.slice(0, 3).map((shikigami) => shikigami.seed));
    expect(state.attackTimers.team).toHaveLength(3);
  });

  it('can start a Festival', () => {
    expect(state.parade.maxWave).toBeGreaterThan(100);
  });

  it('is strong enough for its wave: two hours away bring gains', () => {
    const { report } = simulateOffline(state, 2 * 3_600_000);
    expect(report.yokaiDefeated).toBeGreaterThan(100);
  });
});
