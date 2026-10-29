import { createSettingsStore, DEFAULT_SETTINGS, parseSettings } from './settings';

describe('parseSettings', () => {
  it('gives the defaults on first launch', () => {
    expect(parseSettings(undefined)).toEqual(DEFAULT_SETTINGS);
  });

  it('reads saved settings', () => {
    const saved = {
      sound: false,
      soundVolume: 0.3,
      music: true,
      musicVolume: 0,
      haptics: false,
      notifications: false,
      reduceMotion: true,
    };
    expect(parseSettings(JSON.stringify(saved))).toEqual(saved);
  });

  it('falls back to the default of each missing or malformed setting', () => {
    expect(parseSettings('{"haptics":false,"reduceMotion":"yes"}')).toEqual({
      ...DEFAULT_SETTINGS,
      haptics: false,
    });
    expect(parseSettings('{"soundVolume":1.5,"musicVolume":"fort","music":0}')).toEqual(
      DEFAULT_SETTINGS,
    );
    expect(parseSettings('not json')).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings('[true]')).toEqual(DEFAULT_SETTINGS);
  });
});

describe('createSettingsStore', () => {
  it('saves every change', () => {
    const write = jest.fn();
    const store = createSettingsStore({ read: () => undefined, write });
    store.getState().change('reduceMotion', true);
    expect(store.getState().settings.reduceMotion).toBe(true);
    expect(parseSettings(write.mock.calls[0][0])).toEqual({
      ...DEFAULT_SETTINGS,
      reduceMotion: true,
    });
  });

  it('saves a volume', () => {
    const write = jest.fn();
    const store = createSettingsStore({ read: () => undefined, write });
    store.getState().change('soundVolume', 0.25);
    expect(parseSettings(write.mock.calls[0][0]).soundVolume).toBe(0.25);
  });

  it('reads the saves of version 1.0, made before the sounds', () => {
    const before = '{"haptics":false,"notifications":true,"reduceMotion":false}';
    expect(parseSettings(before)).toEqual({ ...DEFAULT_SETTINGS, haptics: false });
  });

  it('starts from what was saved', () => {
    const store = createSettingsStore({ read: () => '{"haptics":false}', write: jest.fn() });
    expect(store.getState().settings.haptics).toBe(false);
  });
});
