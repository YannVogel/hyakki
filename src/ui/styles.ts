import type { TextStyle, ViewStyle } from 'react-native';

import { fontFamily } from './fonts';
import { colors, fontSizes, type ShadowToken, shadows, strokes } from './tokens';

/** Hard shadow (no blur), the same on iOS and Android: `0 5px 0 ink`. */
export function hardShadow(token: ShadowToken): ViewStyle {
  const { offsetX, offsetY, blur, color } = shadows[token];
  return { boxShadow: `${offsetX}px ${offsetY}px ${blur}px ${color}` };
}

/** Ink outline of cards (3), controls (2.5) or small elements (2). */
export function outline(width: keyof typeof strokes): ViewStyle {
  return { borderWidth: strokes[width], borderColor: colors.ink };
}

type FontSize = keyof typeof fontSizes;

/** Mochiy Pop One: titles, game figures, main buttons. */
export function displayText(size: FontSize): TextStyle {
  return { fontFamily: fontFamily.display, fontSize: fontSizes[size], color: colors.ink };
}

/** M PLUS Rounded 1c: interface text, in weight 500, 700 or 800. */
export function bodyText(size: FontSize, weight: 500 | 700 | 800 = 700): TextStyle {
  const family = { 500: fontFamily.body500, 700: fontFamily.body700, 800: fontFamily.body800 }[
    weight
  ];
  return { fontFamily: family, fontSize: fontSizes[size], color: colors.ink };
}
