import { useEffect, useMemo, useRef } from 'react';
import {
  Easing,
  type SharedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {
  type MotionLevel,
  NO_REACTION,
  planReaction,
  REACTION_ATTACK_SHARE,
  REACTION_SHAPES,
  type ReactionPlan,
  reactionForEvents,
  REDUCED_DIM,
} from '@/render';
import { useGameStore } from '@/state';

export interface HitReactionValues {
  /** Recoil away from the hero, in scene units. */
  readonly recoil: SharedValue<number>;
  /** Squash share: wider and flatter by this much. */
  readonly squash: SharedValue<number>;
  /** White flash over the silhouette, 0 to 1. */
  readonly flash: SharedValue<number>;
  /** Reduced motion: how much the enemy fades for a strong hit. */
  readonly dim: SharedValue<number>;
}

const EASE = Easing.out(Easing.quad);

/** Up to the peak, then back to rest, from wherever the value stands: reactions never add up. */
function pulse(peak: number, plan: ReactionPlan, durationMs: number) {
  'worklet';
  const attack = durationMs * REACTION_ATTACK_SHARE;
  return withDelay(
    plan.delayMs,
    withSequence(
      withTiming(peak, { duration: attack, easing: EASE }),
      withTiming(0, { duration: durationMs - attack, easing: EASE }),
    ),
  );
}

function play(values: HitReactionValues, plan: ReactionPlan, motion: MotionLevel): void {
  if (motion === 'reduced') {
    if (plan.strength === 'strong') {
      values.dim.value = pulse(REDUCED_DIM.opacity, plan, REDUCED_DIM.durationMs);
    }
    return;
  }
  const shape = REACTION_SHAPES[plan.strength];
  values.recoil.value = pulse(shape.recoil, plan, shape.durationMs);
  values.squash.value = pulse(shape.squash, plan, shape.durationMs);
  if (plan.flash) {
    values.flash.value = pulse(shape.flash, plan, shape.durationMs);
  }
}

/** The enemy flinches at the hits of each engine step, on the UI thread: no React render. */
export function useHitReaction(motion: MotionLevel): HitReactionValues {
  const store = useGameStore();
  const recoil = useSharedValue(0);
  const squash = useSharedValue(0);
  const flash = useSharedValue(0);
  const dim = useSharedValue(0);
  const values = useMemo(() => ({ recoil, squash, flash, dim }), [recoil, squash, flash, dim]);
  const active = useRef(NO_REACTION);
  useEffect(
    () =>
      store.subscribe((state, previous) => {
        if (state.eventBatch === previous.eventBatch) {
          return;
        }
        const next = planReaction(
          active.current,
          reactionForEvents(state.events, motion),
          performance.now(),
        );
        active.current = next.active;
        if (next.plan !== null) {
          play(values, next.plan, motion);
        }
      }),
    [store, motion, values],
  );
  return values;
}
