import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { createNewGame, enemySeed, type GameState } from '@/engine';
import { REACTION_SHAPES, REDUCED_DIM } from '@/render';
import { GameStoreProvider } from '@/state';
import { createFakeStore } from '@/state/testing/fakeStore';

import { useHitReaction } from './useHitReaction';

// Each animation settles on its first step, the peak: the test reads what a reaction aims for.
jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated'),
  withDelay: (_delay: number, animation: unknown) => animation,
  withSequence: (first: unknown) => first,
  withTiming: (to: number) => to,
}));

/** Wave 60 without upgrades: Raijin hits hard but does not kill, the yōkai stays to flinch. */
function sturdyEnemy(): GameState {
  const state = createNewGame(2026);
  return {
    ...state,
    parade: { ...state.parade, wave: 60, maxWave: 60 },
    enemy: { ...state.enemy, seed: enemySeed(2026, 60) },
  };
}

async function renderReaction(motion: 'full' | 'reduced') {
  const { store } = createFakeStore({ game: sturdyEnemy() });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <GameStoreProvider store={store}>{children}</GameStoreProvider>
  );
  const hook = await renderHook(() => useHitReaction(motion), { wrapper });
  return { store, values: hook.result.current, unmount: hook.unmount };
}

describe('useHitReaction', () => {
  it('makes the enemy recoil, squash and flash at a tap', async () => {
    const { store, values } = await renderReaction('full');
    await act(() => {
      store.getState().tap();
      store.getState().tick(16);
    });
    expect(values.recoil.value).toBe(REACTION_SHAPES.medium.recoil);
    expect(values.squash.value).toBe(REACTION_SHAPES.medium.squash);
    expect(values.flash.value).toBe(REACTION_SHAPES.medium.flash);
  });

  it('reacts strongly to Raijin', async () => {
    const { store, values } = await renderReaction('full');
    await act(() => {
      store.getState().castTalisman('raijin');
      store.getState().tick(16);
    });
    expect(values.recoil.value).toBe(REACTION_SHAPES.strong.recoil);
  });

  it('only dims the enemy for a strong hit when motion is reduced', async () => {
    const { store, values } = await renderReaction('reduced');
    await act(() => {
      store.getState().tap();
      store.getState().tick(16);
    });
    expect(values.dim.value).toBe(0);
    await act(() => {
      store.getState().castTalisman('raijin');
      store.getState().tick(16);
    });
    expect(values.recoil.value).toBe(0);
    expect(values.flash.value).toBe(0);
    expect(values.dim.value).toBe(REDUCED_DIM.opacity);
  });

  it('stops listening once unmounted', async () => {
    const { store, values, unmount } = await renderReaction('full');
    await unmount();
    store.getState().tap();
    store.getState().tick(16);
    expect(values.recoil.value).toBe(0);
  });
});
