import source from '../../design/tokens.json';

// Typed design tokens, read from design/tokens.json (the single source): editing that file
// changes every screen. Screens and components never hard-code a color, size, radius or shadow.

const values = <K extends string, V>(group: Record<K, { $value: V }>) =>
  Object.fromEntries(
    Object.entries<{ $value: V }>(group).map(([key, token]) => [key, token.$value]),
  ) as Record<K, V>;

export const colors = values(source.color);
export const rarityColors = values(source.rarity);
export const statColors = values(source.stat);
export const fontSizes = values(source.fontSize);
export const radii = values(source.radius);
export const strokes = values(source.stroke);
export const spacing = values(source.spacing);
export const shadows = values(source.shadow);
export const touchTarget = source.touchTarget.min.$value;

export type ColorToken = keyof typeof colors;
export type ShadowToken = keyof typeof shadows;
