import { createNewGame, enemySeed, type GameState, startFestival } from '@/engine';

import { awakenedGuardianGallery, guardianGallery, nextGuardianView } from './guardianSelectors';

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

const ALL_TEN = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

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
    expect(nextGuardianView(createNewGame(1))).toEqual({ index: 0, awakening: 0, revealed: false });
  });

  it('moves on to a still unknown guardian once the previous one is defeated', () => {
    expect(nextGuardianView(afterBakeDanuki)).toEqual({
      index: 1,
      awakening: 0,
      revealed: false,
    });
  });

  it('reveals a guardian met in the current parade', () => {
    expect(nextGuardianView(atWave(100))).toEqual({ index: 0, awakening: 0, revealed: true });
  });

  it('keeps a defeated guardian revealed in the next parade', () => {
    const festival = startFestival(afterBakeDanuki);
    expect(festival.ok && nextGuardianView(festival.state)).toEqual({
      index: 0,
      awakening: 0,
      revealed: true,
    });
  });

  it('shows an awakened guardian as its normal self, with its awakening', () => {
    expect(nextGuardianView(atWave(1050))).toEqual({ index: 0, awakening: 1, revealed: true });
  });
});

describe('awakenedGuardianGallery', () => {
  const awakened = (wave: number, best: number[]): GameState => ({
    ...atWave(wave),
    guardiansDefeated: ALL_TEN,
    guardiansBestAwakening: best,
  });

  it('stays hidden until Nurarihyon has fallen once', () => {
    expect(awakenedGuardianGallery(atWave(950))).toBeNull();
    expect(
      awakenedGuardianGallery({ ...atWave(950), guardiansDefeated: [0, 1, 2, 3, 4, 5, 6, 7, 8] }),
    ).toBeNull();
  });

  it('opens at Éveil 2 with no awakened guardian beaten, the first one next', () => {
    const gallery = awakenedGuardianGallery(awakened(1001, Array(10).fill(0)));
    expect(gallery).toHaveLength(10);
    expect(gallery?.map((card) => card.status)).toEqual(['next', ...Array(9).fill('upcoming')]);
    expect(gallery?.every((card) => card.bestLevel === null)).toBe(true);
    expect(gallery?.map((card) => card.wave)).toEqual(ALL_TEN.map((index) => (index + 1) * 100));
  });

  it('shows the highest awakening level each guardian fell at', () => {
    const gallery = awakenedGuardianGallery(awakened(2250, [2, 2, 1, 1, 0, 0, 0, 0, 0, 0]));
    expect(gallery?.map((card) => card.bestLevel)).toEqual([3, 3, 2, 2, ...Array(6).fill(null)]);
    // Karasu-tengu waits at Éveil 3, but it already fell at Éveil 2: it stays « defeated ».
    expect(gallery?.map((card) => card.status).slice(0, 5)).toEqual([
      'defeated',
      'defeated',
      'defeated',
      'defeated',
      'upcoming',
    ]);
  });

  it('marks no awakened guardian as next while the parade is back at Éveil 1', () => {
    const gallery = awakenedGuardianGallery(awakened(150, [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
    expect(gallery?.map((card) => card.status)).toEqual(['defeated', ...Array(9).fill('upcoming')]);
  });
});
