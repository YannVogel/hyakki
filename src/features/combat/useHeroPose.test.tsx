import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { createNewGame } from '@/engine';
import { GameStoreProvider } from '@/state';
import { createFakeStore } from '@/state/testing/fakeStore';

import { POSE_HOLD_MS } from './heroPose';
import { useHeroPose } from './useHeroPose';

async function renderPose() {
  const { store, clock } = createFakeStore({ game: createNewGame(2026) });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <GameStoreProvider store={store}>{children}</GameStoreProvider>
  );
  const hook = await renderHook(() => useHeroPose(), { wrapper });
  return { store, clock, result: hook.result };
}

describe('useHeroPose', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('stands idle, strikes on a tap, then goes back to idle', async () => {
    const { store, result } = await renderPose();
    expect(result.current).toBe('idle');
    await act(() => {
      store.getState().tap();
      store.getState().tick(50);
    });
    expect(result.current).toBe('attack');
    await act(() => jest.advanceTimersByTime(POSE_HOLD_MS.attack));
    expect(result.current).toBe('idle');
  });

  it('casts a spell with a talisman', async () => {
    const { store, result } = await renderPose();
    await act(() => {
      store.getState().castTalisman('raijin');
      store.getState().tick(50);
    });
    expect(result.current).toBe('thunder');
  });

  it('sleeps while the offline report is shown', async () => {
    const { store, clock, result } = await renderPose();
    clock.now += 3_600_000;
    await act(() => store.getState().resume());
    expect(result.current).toBe('sleep');
  });
});
