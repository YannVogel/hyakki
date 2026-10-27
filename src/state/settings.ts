import { createStore, type StoreApi } from 'zustand/vanilla';

/** The player's preferences, kept apart from the game save. */
export interface Settings {
  readonly haptics: boolean;
  /** Notify when the offline gains reach their cap. */
  readonly notifications: boolean;
  /** On top of the system setting, which is always respected. */
  readonly reduceMotion: boolean;
}

export type SettingKey = keyof Settings;

export const DEFAULT_SETTINGS: Settings = {
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
  const pick = (key: SettingKey): boolean => {
    const value: unknown = (record as Record<string, unknown>)[key];
    return typeof value === 'boolean' ? value : DEFAULT_SETTINGS[key];
  };
  return {
    haptics: pick('haptics'),
    notifications: pick('notifications'),
    reduceMotion: pick('reduceMotion'),
  };
}

export interface SettingsStoreState {
  readonly settings: Settings;
  readonly change: (key: SettingKey, value: boolean) => void;
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
