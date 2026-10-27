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
  },
  plugins: [
    'expo-router',
    // The SDK 58 precompiled XCFrameworks are out of sync (ExpoFileSystem crashes at launch
    // on a missing ExpoModulesCore symbol): build Expo modules from source instead.
    ['expo-build-properties', { ios: { usePrecompiledModules: false } }],
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
};

export default config;
