import { useEffect } from 'react';
import { AppState } from 'react-native';

import { offlineCapMs } from '@/engine';

import type { GameStore } from './gameStore';
import type { SettingsStore } from './settings';

export interface CapReminder {
  readonly schedule: (delayMs: number) => void;
  readonly cancel: () => void;
  /** Shows the system prompt, once, if the player was never asked. */
  readonly askPermission: () => void;
}

/**
 * Reminds the player when the offline gains reach their cap: scheduled when the app leaves the
 * foreground, cancelled when it comes back. Permission is asked once the player knows what it is
 * for (after the first offline report, or when turning notifications on), never at first launch.
 */
export function useCapReminder(game: GameStore, settings: SettingsStore, reminder: CapReminder) {
  useEffect(() => {
    reminder.cancel();
    const appState = AppState.addEventListener('change', (status) => {
      if (status === 'active') {
        reminder.cancel();
      } else if (settings.getState().settings.notifications) {
        reminder.schedule(offlineCapMs(game.getState().game));
      }
    });
    const reportClosed = game.subscribe((state, previous) => {
      if (previous.offlineReport !== null && state.offlineReport === null) {
        if (settings.getState().settings.notifications) {
          reminder.askPermission();
        }
      }
    });
    const turnedOn = settings.subscribe((state, previous) => {
      if (state.settings.notifications && !previous.settings.notifications) {
        reminder.askPermission();
      }
    });
    return () => {
      appState.remove();
      reportClosed();
      turnedOn();
    };
  }, [game, settings, reminder]);
}
