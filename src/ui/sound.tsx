import { createContext, type ReactNode, useContext } from 'react';

/** The game's sound effects (assets/audio/sfx, table in assets/README.md). */
export type SoundId =
  | 'tap'
  | 'crit'
  | 'purify'
  | 'capture'
  | 'guardianAppeared'
  | 'guardianDefeated'
  | 'guardianFailed'
  | 'talismanCast'
  | 'purchase'
  | 'festival'
  | 'ui';
export type SoundTrigger = (sound: SoundId) => void;

// ui never talks to the platform: the app root provides the sounds (and the player's settings).
const SoundContext = createContext<SoundTrigger>(() => undefined);

export function SoundProvider({
  trigger,
  children,
}: {
  trigger: SoundTrigger;
  children: ReactNode;
}) {
  return <SoundContext.Provider value={trigger}>{children}</SoundContext.Provider>;
}

export const useSound = (): SoundTrigger => useContext(SoundContext);
