import { useEffect } from 'react';
import { AppState } from 'react-native';

import type { MusicTrack } from '@/services/audio';

import type { GameStore } from './gameStore';
import type { SettingsStore } from './settings';

/** What the music needs from the platform (`src/services/audio`), injected for the tests. */
export interface Music {
  readonly play: (track: MusicTrack | null) => void;
  readonly setVolume: (volume: number) => void;
}

/**
 * Plays the parade's theme, or the guardian's from its cut-in to the end of its fight, while the
 * app is in front and the setting is on, at the chosen volume.
 */
export function useMusic(settings: SettingsStore, game: GameStore, music: Music): void {
  useEffect(() => {
    let inFront = AppState.currentState === 'active';
    const apply = () => {
      const { music: on, musicVolume } = settings.getState().settings;
      const track = game.getState().game.enemy.guardian === null ? 'parade' : 'guardian';
      music.setVolume(musicVolume);
      music.play(on && inFront ? track : null);
    };
    apply();
    const unsubscribeSettings = settings.subscribe(apply);
    const unsubscribeGame = game.subscribe((state, previous) => {
      if ((state.game.enemy.guardian === null) !== (previous.game.enemy.guardian === null)) {
        apply();
      }
    });
    const subscription = AppState.addEventListener('change', (status) => {
      inFront = status === 'active';
      apply();
    });
    return () => {
      unsubscribeSettings();
      unsubscribeGame();
      subscription.remove();
      music.play(null);
    };
  }, [settings, game, music]);
}
