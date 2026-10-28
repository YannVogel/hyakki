import { colors } from '@/ui/tokens';

import { isGroup } from '../yokai/nodes';
import {
  ADAPTIVE_SAFE_ZONE,
  adaptiveBackground,
  adaptiveForeground,
  appIcon,
  CONTENT_CENTER,
  CONTENT_RADIUS,
  ICON_FRAME,
  type IconComposition,
  isKanji,
  monochromeForeground,
  splashLogo,
} from './appIcon';

const kanjiIndex = (composition: IconComposition) => composition.layers.findIndex(isKanji);

const usedColors = (composition: IconComposition): string[] =>
  composition.layers.flatMap((layer) => {
    if (isKanji(layer)) {
      return [layer.fill, layer.border, layer.outline];
    }
    if (isGroup(layer)) {
      throw new Error('The icon draws flat shapes only');
    }
    return [layer.paint.fill, layer.paint.stroke].filter(
      (color): color is string => color !== undefined && color !== 'none',
    );
  });

describe('app icon', () => {
  it('fills the whole frame with the sky', () => {
    expect(appIcon().scale * 512).toBe(ICON_FRAME);
    expect(adaptiveBackground().layers.some(isKanji)).toBe(false);
  });

  it('draws the kanji between the oni and the hands gripping it', () => {
    const { layers } = appIcon();
    const index = kanjiIndex(appIcon());
    expect(layers[index]).toMatchObject({ kind: 'kanji', text: '百' });
    expect(layers.slice(index + 1)).toHaveLength(2);
    expect(index).toBeGreaterThan(adaptiveBackground().layers.length);
  });

  it('only paints with design tokens', () => {
    const palette = new Set<string>(Object.values(colors));
    for (const composition of [
      appIcon(),
      adaptiveForeground(),
      monochromeForeground(),
      splashLogo(),
    ]) {
      expect(usedColors(composition).filter((color) => !palette.has(color))).toEqual([]);
    }
  });

  it.each([
    ['adaptive foreground', adaptiveForeground],
    ['splash logo', splashLogo],
  ])('centers the oni and its kanji in the %s', (_, compose) => {
    const { translateX, translateY, scale } = compose();
    expect(translateX + CONTENT_CENTER.x * scale).toBeCloseTo(ICON_FRAME / 2);
    expect(translateY + CONTENT_CENTER.y * scale).toBeCloseTo(ICON_FRAME / 2);
  });

  it('outlines the kanji in ink only on the themed icon, where white and yellow merge', () => {
    const border = (composition: IconComposition) => composition.layers.find(isKanji)?.border;
    expect(border(adaptiveForeground())).toBe(colors.paper);
    expect(border(monochromeForeground())).toBe(colors.ink);
    expect(monochromeForeground()).toMatchObject({
      translateX: adaptiveForeground().translateX,
      scale: adaptiveForeground().scale,
    });
  });

  it('keeps the adaptive foreground inside the Android safe zone', () => {
    const { scale } = adaptiveForeground();
    expect(CONTENT_RADIUS * scale).toBeLessThanOrEqual((ADAPTIVE_SAFE_ZONE * ICON_FRAME) / 2);
  });
});
