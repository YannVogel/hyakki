import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { strings } from '@/i18n';
import { createSettingsStore, parseSettings, SettingsStoreProvider } from '@/state';
import { HapticsProvider } from '@/ui';

import { SettingsScreen } from './SettingsScreen';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderSettings(saved?: string) {
  const write = jest.fn();
  const haptics = jest.fn();
  const store = createSettingsStore({ read: () => saved, write });
  await render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <SettingsStoreProvider store={store}>
        <HapticsProvider trigger={haptics}>
          <SettingsScreen />
        </HapticsProvider>
      </SettingsStoreProvider>
    </SafeAreaProvider>,
  );
  return { store, write, haptics };
}

describe('SettingsScreen', () => {
  it('shows the three settings with their current value', async () => {
    await renderSettings('{"haptics":false}');
    expect(screen.getByRole('switch', { name: strings.settings.haptics.label })).toHaveProp(
      'value',
      false,
    );
    expect(screen.getByRole('switch', { name: strings.settings.notifications.label })).toHaveProp(
      'value',
      true,
    );
    expect(screen.getByRole('switch', { name: strings.settings.reduceMotion.label })).toHaveProp(
      'value',
      false,
    );
  });

  it('saves a change at once', async () => {
    const { store, write, haptics } = await renderSettings();
    await fireEvent(screen.getByTestId('setting-reduceMotion'), 'valueChange', true);
    expect(store.getState().settings.reduceMotion).toBe(true);
    expect(parseSettings(write.mock.calls.at(-1)?.[0]).reduceMotion).toBe(true);
    expect(haptics).toHaveBeenCalledWith('selection');
  });

  it('goes back', async () => {
    await renderSettings();
    await fireEvent.press(screen.getByTestId('settings-back'));
    expect(router.back).toHaveBeenCalled();
  });
});
