import { useEffect } from 'react';

import type { CombatEvent } from '@/engine';
import { useGameStore } from '@/state';
import { type SoundId, useSound } from '@/ui';

/** The most telling first: a step that beats a guardian does not also click for a purified yōkai. */
const PRIORITY: readonly SoundId[] = [
  'guardianDefeated',
  'guardianFailed',
  'guardianAppeared',
  'capture',
  'talismanCast',
  'crit',
  'purify',
];

/** A step lasts about 100 ms: more than two sounds at once would turn the parade into noise. */
export const MAX_SOUNDS_PER_STEP = 2;

function soundOf(event: CombatEvent): SoundId | null {
  switch (event.type) {
    case 'guardianDefeated':
      return 'guardianDefeated';
    case 'guardianFailed':
    case 'guardianFled':
      return 'guardianFailed';
    case 'guardianAppeared':
      return 'guardianAppeared';
    case 'shikigamiCaptured':
      return 'capture';
    case 'talismanCast':
      return 'talismanCast';
    case 'yokaiDefeated':
      return 'purify';
    case 'hit':
      // The team's crits would ring non-stop: only the hero's and the player's count.
      return event.crit && (event.source === 'hero' || event.source === 'tap') ? 'crit' : null;
    default:
      return null;
  }
}

/** The sounds of one engine step: one of each kind at most, the most telling first. */
export function soundsForEvents(events: readonly CombatEvent[]): SoundId[] {
  const heard = new Set(events.map(soundOf));
  return PRIORITY.filter((sound) => heard.has(sound)).slice(0, MAX_SOUNDS_PER_STEP);
}

/** Plays the step's sounds (the player's settings are applied by the app root). */
export function useCombatSounds(): void {
  const store = useGameStore();
  const play = useSound();
  useEffect(
    () =>
      store.subscribe((state, previous) => {
        if (state.eventBatch !== previous.eventBatch) {
          soundsForEvents(state.events).forEach(play);
        }
      }),
    [store, play],
  );
}
