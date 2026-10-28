import { colors } from '@/ui/tokens';

import { type DrawNode, shape } from '../yokai/nodes';

// The app icon (#59): a little oni hides behind the kanji 百 (hyaku, the hundred of Hyakki
// Yagyō), drawn like a sticker on the festival sky. Everything is laid out in a 512 × 512 design
// box, the size of the mock-ups, then fitted to the 200 × 200 frame of the renderers. The kanji is
// a glyph of the display font: the renderer draws it between the oni and its hands, so this module
// stays free of fonts.

export const ICON_FRAME = 200;
const DESIGN = 512;
/** Android adaptive icons only show the central 66 dp of 108 dp: keep the oni inside. */
export const ADAPTIVE_SAFE_ZONE = 66 / 108;
/** Center of the oni and its kanji, and the distance from it to their farthest point. */
export const CONTENT_CENTER = { x: 256, y: 250 } as const;
export const CONTENT_RADIUS = 284;

/** The kanji, drawn as a sticker: a hard ink shadow, an ink outline, a white border, the fill. */
export interface KanjiLayer {
  readonly kind: 'kanji';
  readonly text: string;
  /** Size of the display font, and the glyph's horizontal center and baseline. */
  readonly size: number;
  readonly x: number;
  readonly baseline: number;
  readonly fill: string;
  readonly border: string;
  readonly borderWidth: number;
  readonly outline: string;
  readonly outlineWidth: number;
  readonly shadow: { readonly dx: number; readonly dy: number };
}

export type IconLayer = DrawNode | KanjiLayer;

/** Layers drawn back to front, then placed in the frame by `translate` and `scale`. */
export interface IconComposition {
  readonly layers: readonly IconLayer[];
  readonly translateX: number;
  readonly translateY: number;
  readonly scale: number;
}

export const isKanji = (layer: IconLayer): layer is KanjiLayer =>
  'kind' in layer && layer.kind === 'kanji';

const RAYS =
  'M256 256 L256 -164 L365 -150 Z M256 256 L466 -108 L553 -41 Z M256 256 L620 46 L662 147 Z ' +
  'M256 256 L676 256 L662 365 Z M256 256 L620 466 L553 553 Z M256 256 L466 620 L365 662 Z ' +
  'M256 256 L256 676 L147 662 Z M256 256 L46 620 L-41 553 Z M256 256 L-108 466 L-150 365 Z ' +
  'M256 256 L-164 256 L-150 147 Z M256 256 L-108 46 L-41 -41 Z M256 256 L46 -108 L147 -150 Z';

const outlined = (width: number) =>
  ({ stroke: colors.ink, strokeWidth: width, strokeLinejoin: 'round' }) as const;

function background(): DrawNode[] {
  return [
    shape({ kind: 'rect', x: 0, y: 0, width: DESIGN, height: DESIGN }, { fill: colors.sky }),
    shape({ kind: 'path', d: RAYS }, { fill: colors.skyLight }),
  ];
}

/** The oni peeking over the kanji: horns, head, frowning yellow eyes. */
function oni(): DrawNode[] {
  const brow = { stroke: colors.ink, strokeWidth: 12, strokeLinecap: 'round' } as const;
  return [
    shape(
      { kind: 'path', d: 'M178 88 L 190 22 L 216 78 Z' },
      { fill: colors.cream, ...outlined(8) },
    ),
    shape(
      { kind: 'path', d: 'M334 88 L 322 22 L 296 78 Z' },
      { fill: colors.cream, ...outlined(8) },
    ),
    shape(
      { kind: 'path', d: 'M142 200 Q 150 66 256 60 Q 362 66 370 200 Z' },
      { fill: colors.red, ...outlined(12) },
    ),
    shape(
      { kind: 'path', d: 'M184 74 Q 220 50 256 74 Q 292 50 328 74' },
      { fill: 'none', ...outlined(10), strokeLinecap: 'round' },
    ),
    shape({ kind: 'circle', cx: 208, cy: 128, r: 30 }, { fill: colors.sun, ...outlined(9) }),
    shape({ kind: 'circle', cx: 304, cy: 128, r: 30 }, { fill: colors.sun, ...outlined(9) }),
    shape({ kind: 'circle', cx: 214, cy: 138, r: 13 }, { fill: colors.ink }),
    shape({ kind: 'circle', cx: 298, cy: 138, r: 13 }, { fill: colors.ink }),
    shape({ kind: 'path', d: 'M174 92 L 238 110' }, brow),
    shape({ kind: 'path', d: 'M338 92 L 274 110' }, brow),
  ];
}

const kanji = (): KanjiLayer => ({
  kind: 'kanji',
  text: '百',
  size: 280,
  x: 256,
  baseline: 410,
  fill: colors.yellow,
  border: colors.paper,
  borderWidth: 28,
  outline: colors.ink,
  outlineWidth: 52,
  shadow: { dx: 8, dy: 14 },
});

/** The oni's hands, gripping the top of the kanji. */
function hands(): DrawNode[] {
  return [
    shape(
      {
        kind: 'path',
        d: 'M112 206 Q 104 176 122 168 Q 134 164 138 178 Q 142 162 156 166 Q 170 172 162 198 Z',
      },
      { fill: colors.red, ...outlined(8) },
    ),
    shape(
      {
        kind: 'path',
        d: 'M400 206 Q 408 176 390 168 Q 378 164 374 178 Q 370 162 356 166 Q 342 172 350 198 Z',
      },
      { fill: colors.red, ...outlined(8) },
    ),
  ];
}

const oniAndKanji = (): IconLayer[] => [...oni(), kanji(), ...hands()];

/** The oni and its kanji scaled by `scale` (1 = the full icon) and centered in the frame. */
function centered(layers: IconLayer[], scale: number): IconComposition {
  const fit = (ICON_FRAME / DESIGN) * scale;
  return {
    layers,
    translateX: ICON_FRAME / 2 - CONTENT_CENTER.x * fit,
    translateY: ICON_FRAME / 2 - CONTENT_CENTER.y * fit,
    scale: fit,
  };
}

/** Largest scale that keeps the oni and its kanji inside the adaptive icon's safe zone. */
export const FOREGROUND_SCALE =
  Math.floor(((ADAPTIVE_SAFE_ZONE * DESIGN) / 2 / CONTENT_RADIUS) * 100) / 100;

/** iOS and stores: opaque square, the oni over the full sky. */
export const appIcon = (): IconComposition => ({
  layers: [...background(), ...oniAndKanji()],
  translateX: 0,
  translateY: 0,
  scale: ICON_FRAME / DESIGN,
});

export const adaptiveBackground = (): IconComposition => ({
  layers: background(),
  translateX: 0,
  translateY: 0,
  scale: ICON_FRAME / DESIGN,
});

/** Android adaptive foreground: the oni and its kanji inside the safe zone, on transparency. */
export const adaptiveForeground = (): IconComposition => centered(oniAndKanji(), FOREGROUND_SCALE);

/**
 * Android 13+ themed icon: tinting merges the yellow fill with the white border, so the kanji keeps
 * only its ink outline and its strokes stay readable once cut out.
 */
export const monochromeForeground = (): IconComposition =>
  centered([...oni(), { ...kanji(), border: colors.ink }, ...hands()], FOREGROUND_SCALE);

/** Splash screen logo, on transparency (the splash background is cream). */
export const splashLogo = (): IconComposition => centered(oniAndKanji(), 0.85);
