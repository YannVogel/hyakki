import { useEffect } from 'react';

import { type EffectPool, effectsForEvents, type MotionLevel, useEffectPool } from '@/render';
import { useGameStore } from '@/state';

import { effectStage } from './BattleScene';

/** Turns each engine step's events into combat effects, without re-rendering the screen. */
export function useCombatEffects(motion: MotionLevel): EffectPool {
  const pool = useEffectPool();
  const store = useGameStore();
  useEffect(
    () =>
      store.subscribe((state, previous) => {
        if (state.eventBatch === previous.eventBatch) {
          return;
        }
        const stage = effectStage(state.game.enemy.guardian !== null);
        pool.spawn(effectsForEvents(state.events, stage, motion, state.eventBatch));
      }),
    [store, pool, motion],
  );
  return pool;
}
