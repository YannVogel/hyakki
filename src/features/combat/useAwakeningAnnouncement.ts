import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { awakeningLevel, type CombatEvent, CYCLE_WAVES, waveInCycle } from '@/engine';
import { strings } from '@/i18n';
import { useGameStore } from '@/state';

/** How long the announcement stays on screen. */
export const AWAKENING_ANNOUNCEMENT_MS = 4000;

/** The awakening level reached in this step: the tenth guardian fell, the parade starts over. */
export function awakeningReached(events: readonly CombatEvent[]): number | null {
  for (const event of events) {
    if (event.type === 'guardianDefeated' && waveInCycle(event.wave) === CYCLE_WAVES) {
      return awakeningLevel(event.wave) + 1;
    }
  }
  return null;
}

/** The new awakening level for a few seconds after Nurarihyon's defeat, else null. */
export function useAwakeningAnnouncement(): number | null {
  const store = useGameStore();
  const [level, setLevel] = useState<number | null>(null);

  useEffect(
    () =>
      store.subscribe((state, previous) => {
        if (state.eventBatch === previous.eventBatch) {
          return;
        }
        const reached = awakeningReached(state.events);
        if (reached !== null) {
          setLevel(reached);
          AccessibilityInfo.announceForAccessibility(
            `${strings.combat.awakeningTitle(reached)} ${strings.combat.awakeningBody}`,
          );
        }
      }),
    [store],
  );

  useEffect(() => {
    if (level === null) {
      return;
    }
    const timer = setTimeout(() => setLevel(null), AWAKENING_ANNOUNCEMENT_MS);
    return () => clearTimeout(timer);
  }, [level]);

  return level;
}
