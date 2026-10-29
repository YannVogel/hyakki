import { fireEvent, render, screen } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { createNewGame } from '@/engine';
import { strings } from '@/i18n';
import { createSettingsStore, GameStoreProvider, SettingsStoreProvider } from '@/state';
import { createFakeStore } from '@/state/testing/fakeStore';

import { MainScreen } from './MainScreen';

const METRICS = {
  frame: { x: 0, y: 0, width: 375, height: 667 },
  insets: { top: 20, left: 0, right: 0, bottom: 0 },
};

async function renderMain() {
  const { store } = createFakeStore({ game: createNewGame(1) });
  const write = jest.fn();
  const settings = createSettingsStore({ read: () => undefined, write });
  await render(
    <GestureHandlerRootView>
      <SafeAreaProvider initialMetrics={METRICS}>
        <GameStoreProvider store={store}>
          <SettingsStoreProvider store={settings}>
            <MainScreen initialTab="sanctuary" />
          </SettingsStoreProvider>
        </GameStoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>,
  );
  return { write };
}

describe('MainScreen', () => {
  it('has five tabs, the last one for the options', async () => {
    await renderMain();
    const { combat, shikigami, sanctuary, festival, options } = strings.tabs;
    for (const label of [combat, shikigami, sanctuary, festival, options]) {
      expect(screen.getByRole('tab', { name: label })).toBeOnTheScreen();
    }
  });

  it('opens the settings in the Options tab, and a setting changes there', async () => {
    const { write } = await renderMain();
    await fireEvent.press(screen.getByTestId('tab-options'));
    expect(screen.getByText(strings.settings.title)).toBeOnTheScreen();
    await fireEvent(screen.getByTestId('setting-reduceMotion'), 'valueChange', true);
    expect(write).toHaveBeenCalledWith(expect.stringContaining('"reduceMotion":true'));
  });

  it('no longer sends the Sanctuary to a separate settings page', async () => {
    await renderMain();
    expect(screen.queryByTestId('open-settings')).toBeNull();
  });
});
