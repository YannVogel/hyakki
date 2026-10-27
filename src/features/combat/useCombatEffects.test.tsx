import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { createNewGame } from '@/engine';
import { GameStoreProvider } from '@/state';
import { createFakeStore } from '@/state/testing/fakeStore';

import { useCombatEffects } from './useCombatEffects';

const mockSpawn = jest.fn();

jest.mock('@/render', () => ({
  ...jest.requireActual('@/render'),
  useEffectPool: () => ({ spawn: mockSpawn }),
}));

async function renderEffects(motion: 'full' | 'reduced') {
  const { store } = createFakeStore({ game: createNewGame(2026) });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <GameStoreProvider store={store}>{children}</GameStoreProvider>
  );
  const hook = await renderHook(() => useCombatEffects(motion), { wrapper });
  return { store, unmount: hook.unmount };
}

describe('useCombatEffects', () => {
  beforeEach(() => mockSpawn.mockClear());

  it("turns each engine step's events into effects", async () => {
    const { store } = await renderEffects('full');
    await act(() => {
      store.getState().tap();
      store.getState().tick(100);
    });
    expect(mockSpawn).toHaveBeenCalledTimes(1);
    const kinds = mockSpawn.mock.calls[0][0].map((effect: { kind: string }) => effect.kind);
    expect(kinds).toEqual(expect.arrayContaining(['ofuda', 'impact', 'damage']));
  });

  it('follows reduced motion', async () => {
    const { store } = await renderEffects('reduced');
    await act(() => {
      store.getState().tap();
      store.getState().tick(100);
    });
    const kinds = mockSpawn.mock.calls[0][0].map((effect: { kind: string }) => effect.kind);
    expect(kinds).not.toContain('ofuda');
  });

  it('stops listening once unmounted', async () => {
    const { store, unmount } = await renderEffects('full');
    await unmount();
    store.getState().tick(1000);
    expect(mockSpawn).not.toHaveBeenCalled();
  });
});
