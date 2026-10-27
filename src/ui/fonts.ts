import type { FontSource } from 'expo-font';

// One family name per weight: Android ignores fontWeight on custom fonts.
export const fontFamily = {
  display: 'MochiyPopOne',
  body500: 'MPLUSRounded1c-Medium',
  body700: 'MPLUSRounded1c-Bold',
  body800: 'MPLUSRounded1c-ExtraBold',
} as const;

/** The display font file, also drawn by Skia in the combat effects. */
export const displayFontFile: number = require('../../assets/fonts/MochiyPopOne-Regular.ttf');

export const fontAssets: Record<string, FontSource> = {
  [fontFamily.display]: displayFontFile,
  [fontFamily.body500]: require('../../assets/fonts/MPLUSRounded1c-Medium.ttf'),
  [fontFamily.body700]: require('../../assets/fonts/MPLUSRounded1c-Bold.ttf'),
  [fontFamily.body800]: require('../../assets/fonts/MPLUSRounded1c-ExtraBold.ttf'),
};
