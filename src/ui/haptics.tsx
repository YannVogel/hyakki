import { createContext, type ReactNode, useContext } from 'react';

export type HapticKind = 'selection' | 'light' | 'medium' | 'success';
export type HapticTrigger = (kind: HapticKind) => void;

// ui never talks to the platform: the app root provides the haptics (and the player's setting).
const HapticsContext = createContext<HapticTrigger>(() => undefined);

export function HapticsProvider({
  trigger,
  children,
}: {
  trigger: HapticTrigger;
  children: ReactNode;
}) {
  return <HapticsContext.Provider value={trigger}>{children}</HapticsContext.Provider>;
}

export const useHaptics = (): HapticTrigger => useContext(HapticsContext);
