import source from '../../design/tokens.json';
import {
  colors,
  fontSizes,
  radii,
  rarityColors,
  shadows,
  spacing,
  statColors,
  strokes,
  touchTarget,
} from './tokens';

describe('design tokens', () => {
  it('expose every value of design/tokens.json, so that editing the file changes the app', () => {
    const groups = [
      [colors, source.color],
      [rarityColors, source.rarity],
      [statColors, source.stat],
      [fontSizes, source.fontSize],
      [radii, source.radius],
      [strokes, source.stroke],
      [spacing, source.spacing],
      [shadows, source.shadow],
    ] as const;
    for (const [tokens, group] of groups) {
      const expected = Object.fromEntries(
        Object.entries(group).map(([key, token]) => [key, token.$value]),
      );
      expect(tokens).toEqual(expected);
    }
    expect(touchTarget).toBe(44);
  });

  it('keep the reference colors of the design system', () => {
    expect(colors.ink).toBe('#2B1D3F');
    expect(colors.cream).toBe('#FFF4DC');
    expect(rarityColors.legendaire).toBe('#FFD23F');
  });
});
