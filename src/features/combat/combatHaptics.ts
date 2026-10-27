import { useEffect } from 'react';

import type { CombatEvent } from '@/engine';
import { useGameStore } from '@/state';
import { type HapticKind, useHaptics } from '@/ui';

/**
 * The strongest feedback of a step: a guardian beaten, else a critical strike of the hero or of
 * the player (the team's crits would buzz non-stop). Taps buzz on touch, before the engine runs.
 */
export function hapticForEvents(events: readonly CombatEvent[]): HapticKind | null {
  if (events.some((event) => event.type === 'guardianDefeated')) {
    return 'success';
  }
  const crit = events.some(
    (event) =>
      event.type === 'hit' && event.crit && (event.source === 'hero' || event.source === 'tap'),
  );
  return crit ? 'medium' : null;
}

/** Plays the step's haptic feedback (the player's setting is applied by the app root). */
export function useCombatHaptics(): void {
  const store = useGameStore();
  const haptics = useHaptics();
  useEffect(
    () =>
      store.subscribe((state, previous) => {
        if (state.eventBatch === previous.eventBatch) {
          return;
        }
        const kind = hapticForEvents(state.events);
        if (kind !== null) {
          haptics(kind);
        }
      }),
    [store, haptics],
  );
}
