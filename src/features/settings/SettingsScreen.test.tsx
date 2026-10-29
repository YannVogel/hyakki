import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { strings } from '@/i18n';
import { createSettingsStore, parseSettings, SettingsStoreProvider } from '@/state';
import { HapticsProvider, SoundProvider } from '@/ui';

import { SettingsScreen } from './SettingsScreen';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderSettings(saved?: string) {
  const write = jest.fn();
  const haptics = jest.fn();
  const sound = jest.fn();
  const store = createSettingsStore({ read: () => saved, write });
  await render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <SettingsStoreProvider store={store}>
        <HapticsProvider trigger={haptics}>
          <SoundProvider trigger={sound}>
            <SettingsScreen />
          </SoundProvider>
        </HapticsProvider>
      </SettingsStoreProvider>
    </SafeAreaProvider>,
  );
  return { store, write, haptics, sound };
}

describe('SettingsScreen', () => {
  it('gives the sounds and the music a switch and a volume each', async () => {
    await renderSettings('{"music":false,"soundVolume":0.3}');
    const { sound, music, volume } = strings.settings;
    expect(screen.getByRole('switch', { name: sound.label })).toHaveProp('value', true);
    expect(screen.getByRole('switch', { name: music.label })).toHaveProp('value', false);
    expect(screen.getByLabelText(volume(sound.label))).toHaveProp('accessibilityValue', {
      min: 0,
      max: 100,
      now: 30,
      text: '30 %',
    });
    // The music is off: its volume waits, greyed out.
    expect(screen.getByLabelText(volume(music.label))).toHaveProp('accessibilityState', {
      disabled: true,
    });
  });

  it('sets the volumes apart, by tenths with a screen reader', async () => {
    const { store } = await renderSettings();
    const { sound, music, volume } = strings.settings;
    await fireEvent(screen.getByLabelText(volume(sound.label)), 'accessibilityAction', {
      nativeEvent: { actionName: 'decrement' },
    });
    await fireEvent(screen.getByLabelText(volume(music.label)), 'accessibilityAction', {
      nativeEvent: { actionName: 'increment' },
    });
    expect(store.getState().settings.soundVolume).toBe(0.7);
    expect(store.getState().settings.musicVolume).toBe(0.6);
  });

  it('sets a volume with a touch along the track', async () => {
    const { store } = await renderSettings();
    const slider = screen.getByTestId('setting-musicVolume');
    await fireEvent(slider, 'layout', { nativeEvent: { layout: { width: 200 } } });
    await fireEvent(slider, 'responderGrant', { nativeEvent: { locationX: 50 } });
    expect(store.getState().settings.musicVolume).toBe(0.25);
  });

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
    const { store, write, haptics, sound } = await renderSettings();
    await fireEvent(screen.getByTestId('setting-reduceMotion'), 'valueChange', true);
    expect(store.getState().settings.reduceMotion).toBe(true);
    expect(parseSettings(write.mock.calls.at(-1)?.[0]).reduceMotion).toBe(true);
    expect(haptics).toHaveBeenCalledWith('selection');
    expect(sound).toHaveBeenCalledWith('ui');
  });

  it('goes back', async () => {
    await renderSettings();
    await fireEvent.press(screen.getByTestId('settings-back'));
    expect(router.back).toHaveBeenCalled();
  });
});
