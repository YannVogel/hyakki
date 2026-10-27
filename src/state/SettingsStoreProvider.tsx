import { createContext, type ReactNode, useContext } from 'react';
import { useStore } from 'zustand';

import type { SettingsStore, SettingsStoreState } from './settings';

const SettingsStoreContext = createContext<SettingsStore | null>(null);

export function SettingsStoreProvider({
  store,
  children,
}: {
  store: SettingsStore;
  children: ReactNode;
}) {
  return <SettingsStoreContext.Provider value={store}>{children}</SettingsStoreContext.Provider>;
}

/** Reads a slice of the settings and re-renders when it changes. */
export function useSettings<T>(selector: (state: SettingsStoreState) => T): T {
  const store = useContext(SettingsStoreContext);
  if (store === null) {
    throw new Error('useSettings must be used inside a SettingsStoreProvider');
  }
  return useStore(store, selector);
}
