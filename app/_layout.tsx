import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { playHaptic } from '@/services/haptics';
import { fontAssets } from '@/ui/fonts';
import { HapticsProvider } from '@/ui/haptics';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const ready = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <HapticsProvider trigger={playHaptic}>
      <Stack screenOptions={{ headerShown: false }} />
    </HapticsProvider>
  );
}
