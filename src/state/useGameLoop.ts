import { useEffect } from 'react';
import { AppState } from 'react-native';

import type { GameStore } from './gameStore';

export const TICK_MS = 100;
export const AUTOSAVE_MS = 5000;

/**
 * Runs the engine about 10 times per second while the app is in the foreground, and saves every
 * 5 s and whenever the app leaves the foreground. Time comes from a monotonic clock.
 */
export function useGameLoop(
  store: GameStore,
  monotonicNow: () => number = () => performance.now(),
) {
  useEffect(() => {
    let last = monotonicNow();
    let sinceSave = 0;
    let timer: ReturnType<typeof setInterval> | null = null;

    const frame = () => {
      const current = monotonicNow();
      const dt = current - last;
      last = current;
      store.getState().tick(dt);
      sinceSave += dt;
      if (sinceSave >= AUTOSAVE_MS) {
        sinceSave = 0;
        store.getState().save();
      }
    };
    const start = () => {
      if (timer === null) {
        last = monotonicNow();
        timer = setInterval(frame, TICK_MS);
      }
    };
    const stop = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };

    start();
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') {
        start();
      } else {
        stop();
        store.getState().save();
      }
    });
    return () => {
      subscription.remove();
      stop();
    };
  }, [store, monotonicNow]);
}
