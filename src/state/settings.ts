import { createStore, type StoreApi } from 'zustand/vanilla';

/** The player's preferences, kept apart from the game save. */
export interface Settings {
  /** Sound effects, and their volume from 0 to 1. */
  readonly sound: boolean;
  readonly soundVolume: number;
  /** Background music, and its volume from 0 to 1. */
  readonly music: boolean;
  readonly musicVolume: number;
  readonly haptics: boolean;
  /** Notify when the offline gains reach their cap. */
  readonly notifications: boolean;
  /** On top of the system setting, which is always respected. */
  readonly reduceMotion: boolean;
}

export type SettingKey = keyof Settings;
export type ToggleSetting = {
  [K in SettingKey]: Settings[K] extends boolean ? K : never;
}[SettingKey];
export type VolumeSetting = Exclude<SettingKey, ToggleSetting>;

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  soundVolume: 0.8,
  music: true,
  musicVolume: 0.5,
  haptics: true,
  notifications: true,
  reduceMotion: false,
};

/** Reads saved settings; anything missing or malformed falls back to its default. */
export function parseSettings(text: string | undefined): Settings {
  let saved: unknown = null;
  try {
    saved = text === undefined ? null : JSON.parse(text);
  } catch {
    // A malformed entry is replaced on the next change: the defaults apply meanwhile.
  }
  const record = typeof saved === 'object' && saved !== null ? saved : {};
  const valueOf = (key: SettingKey): unknown => (record as Record<string, unknown>)[key];
  const pick = (key: ToggleSetting): boolean => {
    const value = valueOf(key);
    return typeof value === 'boolean' ? value : DEFAULT_SETTINGS[key];
  };
  const volume = (key: VolumeSetting): number => {
    const value = valueOf(key);
    return typeof value === 'number' && value >= 0 && value <= 1 ? value : DEFAULT_SETTINGS[key];
  };
  return {
    sound: pick('sound'),
    soundVolume: volume('soundVolume'),
    music: pick('music'),
    musicVolume: volume('musicVolume'),
    haptics: pick('haptics'),
    notifications: pick('notifications'),
    reduceMotion: pick('reduceMotion'),
  };
}

export interface SettingsStoreState {
  readonly settings: Settings;
  readonly change: <K extends SettingKey>(key: K, value: Settings[K]) => void;
}

export type SettingsStore = StoreApi<SettingsStoreState>;

export interface SettingsStoreDeps {
  readonly read: () => string | undefined;
  readonly write: (text: string) => void;
}

/** Settings loaded once, saved at every change. */
export function createSettingsStore(deps: SettingsStoreDeps): SettingsStore {
  return createStore<SettingsStoreState>()((set, get) => ({
    settings: parseSettings(deps.read()),
    change: (key, value) => {
      const settings = { ...get().settings, [key]: value };
      deps.write(JSON.stringify(settings));
      set({ settings });
    },
  }));
}
