import { renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { ReduceMotionProvider, useReduceMotion } from './motion';

function withSetting(reduce: boolean) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <ReduceMotionProvider reduce={reduce}>{children}</ReduceMotionProvider>;
  };
}

describe('useReduceMotion', () => {
  it('follows the system when the player keeps the animations', async () => {
    const { result } = await renderHook(() => useReduceMotion(), { wrapper: withSetting(false) });
    expect(result.current).toBe(false);
  });

  it("reduces motion when the player asks, whatever the system's choice", async () => {
    const { result } = await renderHook(() => useReduceMotion(), { wrapper: withSetting(true) });
    expect(result.current).toBe(true);
  });
});
