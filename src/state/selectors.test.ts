import { big, createNewGame, enemySeed, generate, gt, nameOf, step } from '@/engine';

import {
  enemyView,
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
    expect(view.kind === 'yokai' && view.name).toBe(nameOf(generate(state.enemy.seed)));
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
    const max = upgradeViews(rich(25), 'max').find((view) => view.id === 'blade');
    expect(max?.count).toBe(2);
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
