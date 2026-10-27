import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { GameState } from '@/engine';
import { GameStoreProvider } from '@/state';
import { createFakeStore } from '@/state/testing/fakeStore';

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/** Renders a screen with the app's providers and an in-memory game store. */
export async function renderScreen(ui: ReactElement, game?: GameState) {
  const fake = createFakeStore({ game });
  const result = await render(
    <GestureHandlerRootView>
      <SafeAreaProvider initialMetrics={METRICS}>
        <GameStoreProvider store={fake.store}>{ui}</GameStoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>,
  );
  return { ...result, store: fake.store };
}
