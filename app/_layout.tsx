import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStore } from 'zustand';

import { strings } from '@/i18n';
import { configureAudio, createMusicPlayer, createSoundPlayer } from '@/services/audio';
import { playHaptic } from '@/services/haptics';
import { createCapReminder } from '@/services/notifications';
import {
  createAppSettingsStore,
  createAppStore,
  GameStoreProvider,
  SettingsStoreProvider,
  useCapReminder,
  useGameLoop,
  useMusic,
} from '@/state';
import { fontAssets } from '@/ui/fonts';
import { type HapticKind, HapticsProvider } from '@/ui/haptics';
import { ReduceMotionProvider } from '@/ui/motion';
import { type SoundId, SoundProvider } from '@/ui/sound';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const [store] = useState(createAppStore);
  const [settings] = useState(createAppSettingsStore);
  const [reminder] = useState(() => createCapReminder(strings.notifications.cap));
  const [sounds] = useState(createSoundPlayer);
  const [music] = useState(createMusicPlayer);
  const reduceMotion = useStore(settings, (state) => state.settings.reduceMotion);
  const haptic = useCallback(
    (kind: HapticKind) => {
      if (settings.getState().settings.haptics) {
        playHaptic(kind);
      }
    },
    [settings],
  );
  const sound = useCallback(
    (id: SoundId) => {
      const { sound: on, soundVolume } = settings.getState().settings;
      if (on) {
        sounds.play(id, soundVolume);
      }
    },
    [settings, sounds],
  );
  const ready = fontsLoaded || fontError !== null;
  useGameLoop(store);
  useCapReminder(store, settings, reminder);
  useMusic(settings, store, music);
  useEffect(configureAudio, []);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <GameStoreProvider store={store}>
          <SettingsStoreProvider store={settings}>
            <HapticsProvider trigger={haptic}>
              <SoundProvider trigger={sound}>
                <ReduceMotionProvider reduce={reduceMotion}>
                  <Stack screenOptions={{ headerShown: false }} />
                </ReduceMotionProvider>
              </SoundProvider>
            </HapticsProvider>
          </SettingsStoreProvider>
        </GameStoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
