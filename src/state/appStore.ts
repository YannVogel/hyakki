import { now, newParadeSeed } from '@/services/clock';
import { readSave, setAsideCorruptedSave, writeSave } from '@/services/save';
import { readSettings, writeSettings } from '@/services/settings';

import { createGameStore } from './gameStore';
import { createSettingsStore } from './settings';

/** The game store of the app, wired to the device's storage and clock. */
export const createAppStore = () =>
  createGameStore({ readSave, writeSave, setAsideCorruptedSave, now, newParadeSeed });

/** The player's settings, kept in the device's storage. */
export const createAppSettingsStore = () =>
  createSettingsStore({ read: readSettings, write: writeSettings });
