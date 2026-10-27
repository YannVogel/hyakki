import { useEffect, useState } from 'react';

import { useGame, useGameStore } from '@/state';

import type { HeroPose } from '../shared/images';
import { IDLE_POSE, nextHeroPose } from './heroPose';

/** The hero's pose, following the engine's events; asleep while the offline report is shown. */
export function useHeroPose(): HeroPose {
  const store = useGameStore();
  const asleep = useGame((state) => state.offlineReport !== null);
  const [pose, setPose] = useState<HeroPose>('idle');
  useEffect(() => {
    let state = IDLE_POSE;
    let backToIdle: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = store.subscribe((game, previous) => {
      if (game.eventBatch === previous.eventBatch) {
        return;
      }
      const nowMs = performance.now();
      const next = nextHeroPose(state, game.events, nowMs);
      if (next === state) {
        return;
      }
      state = next;
      setPose(next.pose);
      clearTimeout(backToIdle);
      backToIdle = setTimeout(() => setPose('idle'), next.untilMs - nowMs);
    });
    return () => {
      unsubscribe();
      clearTimeout(backToIdle);
    };
  }, [store]);
  return asleep ? 'sleep' : pose;
}
