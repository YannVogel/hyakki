import { createContext, type ReactNode, useContext } from 'react';
import { useStore } from 'zustand';

import type { GameStore, GameStoreState } from './gameStore';

const GameStoreContext = createContext<GameStore | null>(null);

export function GameStoreProvider({ store, children }: { store: GameStore; children: ReactNode }) {
  return <GameStoreContext.Provider value={store}>{children}</GameStoreContext.Provider>;
}

export function useGameStore(): GameStore {
  const store = useContext(GameStoreContext);
  if (store === null) {
    throw new Error('useGameStore must be used inside a GameStoreProvider');
  }
  return store;
}

/** Reads a slice of the game store and re-renders when it changes. */
export function useGame<T>(selector: (state: GameStoreState) => T): T {
  return useStore(useGameStore(), selector);
}
