import { storage } from './storage';

const SETTINGS_KEY = 'settings';

export const readSettings = (): string | undefined => storage.getString(SETTINGS_KEY);

export const writeSettings = (text: string): void => storage.set(SETTINGS_KEY, text);
