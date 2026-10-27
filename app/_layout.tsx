import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { playHaptic } from '@/services/haptics';
import {
  createAppSettingsStore,
  createAppStore,
  GameStoreProvider,
  SettingsStoreProvider,
  useGameLoop,
} from '@/state';
import { fontAssets } from '@/ui/fonts';
import { type HapticKind, HapticsProvider } from '@/ui/haptics';
import { ReduceMotionProvider } from '@/ui/motion';
import { useStore } from 'zustand';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const [store] = useState(createAppStore);
  const [settings] = useState(createAppSettingsStore);
  const reduceMotion = useStore(settings, (state) => state.settings.reduceMotion);
  const haptic = useCallback(
    (kind: HapticKind) => {
      if (settings.getState().settings.haptics) {
        playHaptic(kind);
      }
    },
    [settings],
  );
  const ready = fontsLoaded || fontError !== null;
  useGameLoop(store);

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
              <ReduceMotionProvider reduce={reduceMotion}>
                <Stack screenOptions={{ headerShown: false }} />
              </ReduceMotionProvider>
            </HapticsProvider>
          </SettingsStoreProvider>
        </GameStoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
