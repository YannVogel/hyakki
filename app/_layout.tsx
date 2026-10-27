import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { playHaptic } from '@/services/haptics';
import { createAppStore, GameStoreProvider, useGameLoop } from '@/state';
import { fontAssets } from '@/ui/fonts';
import { HapticsProvider } from '@/ui/haptics';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const [store] = useState(createAppStore);
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
          <HapticsProvider trigger={playHaptic}>
            <Stack screenOptions={{ headerShown: false }} />
          </HapticsProvider>
        </GameStoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
