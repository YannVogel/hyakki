import { createContext, type ReactNode, useContext } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

// ui never reads the settings store: the app root provides the player's choice.
const ReduceMotionContext = createContext(false);

export function ReduceMotionProvider({
  reduce,
  children,
}: {
  reduce: boolean;
  children: ReactNode;
}) {
  return <ReduceMotionContext.Provider value={reduce}>{children}</ReduceMotionContext.Provider>;
}

/** True when the system or the player's setting asks for less motion. */
export function useReduceMotion(): boolean {
  const system = useReducedMotion();
  const player = useContext(ReduceMotionContext);
  return system || player;
}
