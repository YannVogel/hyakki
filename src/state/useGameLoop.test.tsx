import { renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';

import { createFakeStore } from './testing/fakeStore';
import { AUTOSAVE_MS, TICK_MS, useGameLoop } from './useGameLoop';

describe('useGameLoop', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('ticks about 10 times per second and saves every 5 s', async () => {
    const { store, saves } = createFakeStore();
    let time = 0;
    const tick = jest.spyOn(store.getState(), 'tick');
    await renderHook(() => useGameLoop(store, () => time));
    for (let i = 0; i < AUTOSAVE_MS / TICK_MS; i++) {
      time += TICK_MS;
      jest.advanceTimersByTime(TICK_MS);
    }
    expect(tick).toHaveBeenCalledTimes(AUTOSAVE_MS / TICK_MS);
    expect(tick).toHaveBeenLastCalledWith(TICK_MS);
    expect(saves).toHaveLength(1);
  });

  it('saves and stops when the app leaves the foreground', async () => {
    const { store, saves } = createFakeStore();
    const listeners: ((status: string) => void)[] = [];
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
      listeners.push(listener as (status: string) => void);
      return { remove: jest.fn() };
    });
    const tick = jest.spyOn(store.getState(), 'tick');
    await renderHook(() => useGameLoop(store, () => 0));
    listeners.forEach((listener) => listener('background'));
    expect(saves).toHaveLength(1);
    jest.advanceTimersByTime(1000);
    expect(tick).not.toHaveBeenCalled();
  });
});
