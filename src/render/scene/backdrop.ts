import { colors } from '@/ui/tokens';

import { type DrawNode, shape } from '../yokai/nodes';

// The festival battlefield of the combat mockup (design/mockups/Main.dc.html), in its 366 × 400
// frame: sun, clouds, hills, sakura tree, torii, path.

export const SCENE_WIDTH = 366;
export const SCENE_HEIGHT = 400;

/** Scene art colors that are not interface tokens. */
const SCENE_ART = {
  sunGlow: '#FFF2A6',
  sunRays: '#FFB800',
  trunk: '#9B6A4A',
  path: '#F7DDB0',
} as const;

const inked = (fill: string, strokeWidth = 3) => ({
  fill,
  stroke: colors.ink,
  strokeWidth,
  strokeLinejoin: 'round' as const,
});

export function backdrop(toriiColor: string = colors.red): DrawNode[] {
  return [
    shape({ kind: 'circle', cx: 306, cy: 62, r: 50 }, { fill: SCENE_ART.sunGlow, opacity: 0.7 }),
    shape(
      {
        kind: 'path',
        d: 'M306 6 L 306 18 M306 106 L 306 118 M250 62 L 262 62 M350 62 L 362 62 M266 22 L 274 30 M338 94 L 346 102 M266 102 L 274 94 M338 30 L 346 22',
      },
      { stroke: SCENE_ART.sunRays, strokeWidth: 5, strokeLinecap: 'round' },
    ),
    shape(
      { kind: 'circle', cx: 306, cy: 62, r: 32 },
      { fill: colors.sun, stroke: colors.ink, strokeWidth: 3 },
    ),
    shape(
      { kind: 'path', d: 'M30 112 a18 18 0 0 1 30 -16 a22 22 0 0 1 40 4 a16 16 0 0 1 24 18 z' },
      inked(colors.paper),
    ),
    shape(
      { kind: 'path', d: 'M170 70 a14 14 0 0 1 24 -12 a20 20 0 0 1 36 2 a14 14 0 0 1 20 14 z' },
      inked(colors.paper),
    ),
    shape(
      {
        kind: 'path',
        d: 'M0 250 Q 60 200 130 236 Q 200 190 270 230 Q 320 205 366 222 L 366 400 L 0 400 Z',
      },
      inked(colors.grass),
    ),
    shape(
      { kind: 'rect', x: 24, y: 214, width: 10, height: 34 },
      { fill: SCENE_ART.trunk, stroke: colors.ink, strokeWidth: 2.5 },
    ),
    shape(
      { kind: 'path', d: 'M2 222 a24 24 0 0 1 22 -34 a22 22 0 0 1 38 4 a20 20 0 0 1 2 34 z' },
      inked(colors.sakura),
    ),
    shape({ kind: 'rect', x: 124, y: 150, width: 16, height: 150 }, inked(toriiColor)),
    shape({ kind: 'rect', x: 226, y: 150, width: 16, height: 150 }, inked(toriiColor)),
    shape({ kind: 'rect', x: 110, y: 186, width: 146, height: 12 }, inked(toriiColor)),
    shape({ kind: 'rect', x: 176, y: 162, width: 14, height: 24 }, inked(toriiColor)),
    shape({ kind: 'rect', x: 96, y: 150, width: 174, height: 12 }, inked(toriiColor)),
    shape(
      { kind: 'path', d: 'M86 150 Q 183 136 280 150 L 284 136 Q 183 118 82 136 Z' },
      inked(colors.ink),
    ),
    shape(
      { kind: 'path', d: 'M0 290 Q 90 262 180 282 Q 270 262 366 278 L 366 400 L 0 400 Z' },
      inked(colors.grassDeep),
    ),
    shape({ kind: 'path', d: 'M150 400 L 166 300 L 200 300 L 216 400 Z' }, inked(SCENE_ART.path)),
    shape({ kind: 'ellipse', cx: 80, cy: 304, rx: 40, ry: 7 }, { fill: colors.ink, opacity: 0.2 }),
  ];
}

export interface SceneLayout {
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

/** Fits the scene into a box like CSS `xMidYMid slice`: cover the box, keep the center. */
export function sceneLayout(width: number, height: number): SceneLayout {
  const scale = Math.max(width / SCENE_WIDTH, height / SCENE_HEIGHT);
  return {
    scale,
    offsetX: (width - SCENE_WIDTH * scale) / 2,
    offsetY: (height - SCENE_HEIGHT * scale) / 2,
  };
}

/** A point of the scene frame, in the box's points. */
export const toBox = (layout: SceneLayout, x: number, y: number) => ({
  x: layout.offsetX + x * layout.scale,
  y: layout.offsetY + y * layout.scale,
});
