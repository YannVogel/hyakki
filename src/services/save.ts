import { deserialize, type GameState, type LoadResult, serialize } from '@/engine';

import { storage } from './storage';

const SAVE_KEY = 'save';
const CORRUPTED_KEY = 'save.corrupted';

/** The saved game, or null on first launch. Never throws: a broken save gives a typed error. */
export function readSave(): LoadResult | null {
  const text = storage.getString(SAVE_KEY);
  return text === undefined ? null : deserialize(text);
}

export function writeSave(state: GameState, savedAt: number): void {
  storage.set(SAVE_KEY, serialize(state, savedAt));
}

/** Keeps an unreadable save aside instead of overwriting it, so that it can be recovered. */
export function setAsideCorruptedSave(): void {
  const text = storage.getString(SAVE_KEY);
  if (text !== undefined) {
    storage.set(CORRUPTED_KEY, text);
  }
}
