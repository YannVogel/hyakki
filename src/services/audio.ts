import { type AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

import type { SoundId } from '@/ui/sound';

import { now } from './clock';

// The effects of assets/audio/sfx (table in assets/README.md); the tap has five variants, played
// in turn so that fast taps do not sound like a machine gun.
const SOURCES: Readonly<Record<SoundId, readonly number[]>> = {
  tap: [
    require('../../assets/audio/sfx/tap-1.wav'),
    require('../../assets/audio/sfx/tap-2.wav'),
    require('../../assets/audio/sfx/tap-3.wav'),
    require('../../assets/audio/sfx/tap-4.wav'),
    require('../../assets/audio/sfx/tap-5.wav'),
  ],
  crit: [require('../../assets/audio/sfx/crit.wav')],
  purify: [require('../../assets/audio/sfx/purify.wav')],
  capture: [require('../../assets/audio/sfx/capture.wav')],
  guardianAppeared: [require('../../assets/audio/sfx/guardian-appeared.wav')],
  guardianDefeated: [require('../../assets/audio/sfx/guardian-defeated.wav')],
  guardianFailed: [require('../../assets/audio/sfx/guardian-failed.wav')],
  talismanCast: [require('../../assets/audio/sfx/talisman-cast.wav')],
  purchase: [require('../../assets/audio/sfx/purchase.wav')],
  festival: [require('../../assets/audio/sfx/festival.wav')],
  ui: [require('../../assets/audio/sfx/ui.wav')],
};

/** The parade's theme, and the guardian's while it blocks the way (assets/audio/music). */
export type MusicTrack = 'parade' | 'guardian';
const MUSIC: Readonly<Record<MusicTrack, number>> = {
  parade: require('../../assets/audio/music/defile-en-fete.m4a'),
  guardian: require('../../assets/audio/music/gardien-approche.m4a'),
};

/** Shortest gap between two plays of the same sound: quick taps and kills never pile up. */
export const MIN_GAP_MS: Readonly<Record<SoundId, number>> = {
  tap: 50,
  crit: 120,
  purify: 150,
  capture: 300,
  guardianAppeared: 300,
  guardianDefeated: 300,
  guardianFailed: 300,
  talismanCast: 120,
  purchase: 80,
  festival: 300,
  ui: 60,
};

/**
 * Silent when the phone is on silent, mixed with the music the player may already be listening
 * to, and quiet in the background. A device that refuses never disturbs the game.
 */
export function configureAudio(): void {
  setAudioModeAsync({
    playsInSilentMode: false,
    interruptionMode: 'mixWithOthers',
    shouldPlayInBackground: false,
  }).catch(() => undefined);
}

/** Which sound may play now, and which variant: the gap and the rotation, without any I/O. */
export function createSoundGate(clock: () => number = now) {
  const lastPlayed = new Map<SoundId, number>();
  const turns = new Map<SoundId, number>();
  return (sound: SoundId): number | null => {
    const time = clock();
    const last = lastPlayed.get(sound);
    if (last !== undefined && time - last < MIN_GAP_MS[sound]) {
      return null;
    }
    lastPlayed.set(sound, time);
    const turn = turns.get(sound) ?? 0;
    turns.set(sound, turn + 1);
    return turn % SOURCES[sound].length;
  };
}

export interface SoundPlayer {
  /** Volume from 0 to 1. */
  readonly play: (sound: SoundId, volume: number) => void;
}

/** The effects, loaded once at launch so that the first tap sounds at once. */
export function createSoundPlayer(clock: () => number = now): SoundPlayer {
  const players = Object.fromEntries(
    Object.entries(SOURCES).map(([sound, sources]) => [
      sound,
      sources.map((source) => createAudioPlayer(source)),
    ]),
  ) as Record<SoundId, AudioPlayer[]>;
  const gate = createSoundGate(clock);
  return {
    play: (sound, volume) => {
      const variant = gate(sound);
      if (variant === null || volume <= 0) {
        return;
      }
      const player = players[sound][variant];
      player.volume = volume;
      // Restarted from the top if it is still ringing: the same effect never doubles up.
      player.seekTo(0).catch(() => undefined);
      player.play();
    },
  };
}

export interface MusicPlayer {
  /** The track to hear, or none. */
  readonly play: (track: MusicTrack | null) => void;
  /** From 0 to 1, for both tracks. */
  readonly setVolume: (volume: number) => void;
}

/**
 * « Le défilé en fête » and « Le Gardien approche », each in a loop. The guardian's theme starts
 * from the top at every guardian; the parade's resumes where it stopped.
 */
export function createMusicPlayer(): MusicPlayer {
  const players: Record<MusicTrack, AudioPlayer> = {
    parade: createAudioPlayer(MUSIC.parade),
    guardian: createAudioPlayer(MUSIC.guardian),
  };
  players.parade.loop = true;
  players.guardian.loop = true;
  let current: MusicTrack | null = null;
  return {
    play: (track) => {
      if (track === current) {
        return;
      }
      if (current !== null) {
        players[current].pause();
      }
      if (track === 'guardian') {
        players.guardian.seekTo(0).catch(() => undefined);
      }
      if (track !== null) {
        players[track].play();
      }
      current = track;
    },
    setVolume: (volume) => {
      players.parade.volume = volume;
      players.guardian.volume = volume;
    },
  };
}
