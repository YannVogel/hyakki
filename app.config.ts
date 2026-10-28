import type { ExpoConfig } from 'expo/config';

import tokens from './design/tokens.json';

const APP_ID = 'com.parallaxworks.hyakki';
const BACKGROUND = tokens.color.cream.$value;

const config: ExpoConfig = {
  name: 'Hyakki',
  slug: 'hyakki',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/app/icon.png',
  scheme: 'hyakki',
  platforms: ['ios', 'android'],
  userInterfaceStyle: 'light',
  backgroundColor: BACKGROUND,
  ios: {
    bundleIdentifier: APP_ID,
    supportsTablet: false,
    // No network at all, hence no encryption to declare: skips the export compliance question.
    config: { usesNonExemptEncryption: false },
  },
  android: {
    package: APP_ID,
    adaptiveIcon: {
      backgroundColor: BACKGROUND,
      foregroundImage: './assets/images/app/android-icon-foreground.png',
      backgroundImage: './assets/images/app/android-icon-background.png',
      monochromeImage: './assets/images/app/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    // Added by the Expo template but never used: the game reads no files and draws no overlay.
    blockedPermissions: [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.SYSTEM_ALERT_WINDOW',
    ],
  },
  plugins: [
    'expo-router',
    [
      // Local reminders only: no push, hence no APNs entitlement.
      'expo-notifications',
      {
        enableRemoteNotifications: false,
        icon: './assets/images/app/android-icon-monochrome.png',
        color: tokens.color.red.$value,
      },
    ],
    // The SDK 58 precompiled XCFrameworks are out of sync (ExpoFileSystem crashes at launch
    // on a missing ExpoModulesCore symbol): build Expo modules from source instead.
    [
      'expo-build-properties',
      {
        ios: { usePrecompiledModules: false },
        // Real phones are ARM: skipping the x86 emulator ABIs halves the native build, which ran
        // the EAS worker out of memory (Gradle daemon killed) with all four.
        android: { buildArchs: ['armeabi-v7a', 'arm64-v8a'] },
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: BACKGROUND,
        image: './assets/images/app/splash-icon.png',
        imageWidth: 160,
      },
    ],
  ],
  experiments: {
    reactCompiler: true,
  },
  // EAS Build project (production builds, see docs/store/publication.md).
  extra: {
    eas: { projectId: 'f9510b10-006b-4a87-b93b-402ac1badcd0' },
  },
};

export default config;
