import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

import {
  configureAudio,
  createMusicPlayer,
  createSoundGate,
  createSoundPlayer,
  MIN_GAP_MS,
} from './audio';

const players = () => jest.mocked(createAudioPlayer).mock.results.map((result) => result.value);

beforeEach(() => jest.mocked(createAudioPlayer).mockClear());

describe('configureAudio', () => {
  it('stays silent on silent mode and never stops the music already playing', () => {
    configureAudio();
    expect(setAudioModeAsync).toHaveBeenCalledWith({
      playsInSilentMode: false,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
    });
  });
});

describe('createSoundGate', () => {
  it('lets a sound ring again only after its minimal gap', () => {
    let time = 0;
    const gate = createSoundGate(() => time);
    expect(gate('purify')).toBe(0);
    time = MIN_GAP_MS.purify - 1;
    expect(gate('purify')).toBeNull();
    time = MIN_GAP_MS.purify;
    expect(gate('purify')).toBe(0);
  });

  it('plays the five tap variants in turn', () => {
    let time = 0;
    const gate = createSoundGate(() => time);
    const variants = Array.from({ length: 6 }, () => {
      time += MIN_GAP_MS.tap;
      return gate('tap');
    });
    expect(variants).toEqual([0, 1, 2, 3, 4, 0]);
  });

  it('keeps the sounds apart: a tap never silences a crit', () => {
    const gate = createSoundGate(() => 0);
    expect(gate('tap')).toBe(0);
    expect(gate('crit')).toBe(0);
  });
});

describe('createSoundPlayer', () => {
  it('loads every effect once, at launch', () => {
    createSoundPlayer(() => 0);
    // 5 taps and 10 other effects.
    expect(createAudioPlayer).toHaveBeenCalledTimes(15);
  });

  it('plays an effect from the top, at the chosen volume', () => {
    const sounds = createSoundPlayer(() => 0);
    const loaded = players();
    sounds.play('crit', 0.4);
    const crit = loaded.find((player) => player.play.mock.calls.length > 0);
    expect(crit?.volume).toBe(0.4);
    expect(crit?.seekTo).toHaveBeenCalledWith(0);
  });

  it('stays quiet at volume zero', () => {
    const sounds = createSoundPlayer(() => 0);
    sounds.play('ui', 0);
    expect(players().every((player) => player.play.mock.calls.length === 0)).toBe(true);
  });
});

describe('createMusicPlayer', () => {
  it('loops both themes at the chosen volume', () => {
    const music = createMusicPlayer();
    const [parade, guardian] = players();
    music.setVolume(0.3);
    expect([parade.loop, guardian.loop]).toEqual([true, true]);
    expect([parade.volume, guardian.volume]).toEqual([0.3, 0.3]);
  });

  it("switches to the guardian's theme from its top, then back to the parade's", () => {
    const music = createMusicPlayer();
    const [parade, guardian] = players();
    music.play('parade');
    music.play('parade');
    expect(parade.play).toHaveBeenCalledTimes(1);
    music.play('guardian');
    expect(parade.pause).toHaveBeenCalledTimes(1);
    expect(guardian.seekTo).toHaveBeenCalledWith(0);
    expect(guardian.play).toHaveBeenCalledTimes(1);
    music.play('parade');
    expect(guardian.pause).toHaveBeenCalledTimes(1);
    expect(parade.play).toHaveBeenCalledTimes(2);
  });

  it('falls silent', () => {
    const music = createMusicPlayer();
    const [parade] = players();
    music.play('parade');
    music.play(null);
    expect(parade.pause).toHaveBeenCalledTimes(1);
  });
});
