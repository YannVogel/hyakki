import { now, newParadeSeed } from '@/services/clock';
import { readSave, setAsideCorruptedSave, writeSave } from '@/services/save';

import { createGameStore } from './gameStore';

/** The game store of the app, wired to the device's storage and clock. */
export const createAppStore = () =>
  createGameStore({ readSave, writeSave, setAsideCorruptedSave, now, newParadeSeed });
