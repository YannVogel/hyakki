import { big, createNewGame, enemySeed, generate, gt, nameOf, startFestival, step } from '@/engine';

import {
  collectionView,
  enemyView,
  guardianGallery,
  nextGuardianView,
  paradeView,
  powerPerSecond,
  soulsPerSecond,
  talismanViews,
  upgradeViews,
} from './selectors';

const atWave = (wave: number) => {
  const state = createNewGame(3);
  return {
    ...state,
    parade: { ...state.parade, wave, maxWave: wave },
    enemy: {
      ...state.enemy,
      seed: enemySeed(3, wave),
      guardian: wave % 100 === 0 ? { engaged: false, timeLeftMs: 30_000 } : null,
    },
  };
};

describe('selectors', () => {
  it('describe the current yōkai with its remaining HP', () => {
    const state = createNewGame(3);
    const view = enemyView(state);
    expect(view.kind).toBe('yokai');
    expect(view.kind === 'yokai' && view.name).toBe(
      nameOf(generate(state.enemy.seed, state.generatorVersion)),
    );
    expect(view.hpRatio).toBe(1);
    const hit = step(state, 0, [{ type: 'tap' }]).state;
    expect(enemyView(hit).hpRatio).toBeLessThan(1);
  });

  it('describe a guardian with its timer', () => {
    const view = enemyView(atWave(200));
    expect(view).toMatchObject({
      kind: 'guardian',
      index: 1,
      awakening: 0,
      engaged: false,
      timeRatio: 1,
    });
  });

  it('place the wave in its hundred', () => {
    expect(paradeView(atWave(47))).toMatchObject({
      waveInTier: 47,
      tierProgress: 0.47,
      nextGuardianWave: 100,
    });
    expect(paradeView(atWave(100))).toMatchObject({ waveInTier: 100, nextGuardianWave: 100 });
    expect(paradeView(atWave(101))).toMatchObject({ waveInTier: 1, nextGuardianWave: 200 });
  });

  it('report the power and the talisman cooldowns', () => {
    const state = createNewGame(3);
    expect(powerPerSecond(state)).toBeDefined();
    const cast = step(state, 0, [{ type: 'castTalisman', talisman: 'raijin' }]).state;
    const raijin = talismanViews(cast).find((talisman) => talisman.id === 'raijin');
    expect(raijin).toEqual({ id: 'raijin', cooldownMs: 60_000, cooldownRatio: 1 });
    expect(talismanViews(state).every((talisman) => talisman.cooldownRatio === 0)).toBe(true);
  });
});

describe('Sanctuary selectors', () => {
  const rich = (souls: number) => ({ ...createNewGame(1), souls: big(souls) });

  it('price ×1, ×10 and Max, and tell what is affordable', () => {
    const one = upgradeViews(rich(25), 1).find((view) => view.id === 'blade');
    expect(one).toMatchObject({ level: 0, count: 1, affordable: true, maxed: false });
    const ten = upgradeViews(rich(25), 10).find((view) => view.id === 'blade');
    expect(ten).toMatchObject({ count: 10, affordable: false });
    // 5 + 5.6 + 6.27 + 7.02 ≈ 23.9 souls: four levels.
    const max = upgradeViews(rich(25), 'max').find((view) => view.id === 'blade');
    expect(max?.count).toBe(4);
    const none = upgradeViews(rich(0), 'max').find((view) => view.id === 'blade');
    expect(none).toMatchObject({ count: 1, affordable: false });
  });

  it('mark maxed upgrades', () => {
    const state = { ...rich(1e9), sanctuary: { ...createNewGame(1).sanctuary, kekkai: 25 } };
    expect(upgradeViews(state, 1).find((view) => view.id === 'kekkai')).toMatchObject({
      maxed: true,
      affordable: false,
    });
  });

  it('estimate the souls earned per second', () => {
    expect(gt(soulsPerSecond(createNewGame(1)), 0)).toBe(true);
    const stronger = {
      ...createNewGame(1),
      sanctuary: { ...createNewGame(1).sanctuary, bell: 20 },
    };
    expect(gt(soulsPerSecond(stronger), soulsPerSecond(createNewGame(1)))).toBe(true);
  });
});

describe('collectionView', () => {
  it('puts team members first, then rarer and higher-level shikigami', () => {
    const state = {
      ...createNewGame(1),
      shikigami: [1, 2, 3, 4, 5, 6].map((seed, index) => ({
        seed,
        level: index + 1,
        generatorVersion: 1 as const,
      })),
      team: [6],
    };
    const view = collectionView(state);
    expect(view[0]).toMatchObject({ seed: 6, inTeam: true });
    expect(view).toHaveLength(6);
    const rank = { legendary: 0, epic: 1, rare: 2, common: 3 };
    for (let i = 2; i < view.length; i++) {
      expect(rank[view[i].spec.rarity]).toBeGreaterThanOrEqual(rank[view[i - 1].spec.rarity]);
    }
  });
});

describe('guardianGallery', () => {
  it('marks defeated, next and upcoming guardians, revealing the ones met', () => {
    const state = {
      ...createNewGame(1),
      parade: { ...createNewGame(1).parade, wave: 300, maxWave: 300 },
      guardiansDefeated: [0, 1],
    };
    const gallery = guardianGallery(state);
    expect(gallery.map((card) => card.status)).toEqual([
      'defeated',
      'defeated',
      'next',
      'upcoming',
      'upcoming',
      'upcoming',
      'upcoming',
      'upcoming',
      'upcoming',
      'upcoming',
    ]);
    expect(gallery.map((card) => card.revealed).slice(0, 4)).toEqual([true, true, true, false]);
  });
});

describe('nextGuardianView', () => {
  const afterBakeDanuki = { ...atWave(101), guardiansDefeated: [0] };

  it('hides the first guardian from a new player', () => {
    expect(nextGuardianView(createNewGame(1))).toEqual({ index: 0, revealed: false });
  });

  it('moves on to a still unknown guardian once the previous one is defeated', () => {
    expect(nextGuardianView(afterBakeDanuki)).toEqual({ index: 1, revealed: false });
  });

  it('reveals a guardian met in the current parade', () => {
    expect(nextGuardianView(atWave(100))).toEqual({ index: 0, revealed: true });
  });

  it('keeps a defeated guardian revealed in the next parade', () => {
    const festival = startFestival(afterBakeDanuki);
    expect(festival.ok && nextGuardianView(festival.state)).toEqual({ index: 0, revealed: true });
  });

  it('shows an awakened guardian as its normal self', () => {
    expect(nextGuardianView(atWave(1050))).toEqual({ index: 0, revealed: true });
  });
});
