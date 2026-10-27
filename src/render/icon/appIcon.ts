import { generate } from '@/engine';
import { colors } from '@/ui/tokens';

import { drawYokai, YOKAI_FRAME } from '../yokai/drawYokai';
import { type DrawNode, group, type GroupNode, isGroup, shape } from '../yokai/nodes';

// The app icon: the mascot is a real generated yōkai, Hitotsume-Chōchin-obake (seed 116 300),
// on the festival sky. Everything is drawn in a 200 × 200 frame.

export const ICON_FRAME = 200;
export const ICON_MASCOT_SEED = 116_300;
/** Android adaptive icons only show the central 66 dp of 108 dp: keep the mascot inside. */
export const ADAPTIVE_SAFE_ZONE = 66 / 108;

function background(): DrawNode[] {
  return [
    shape(
      { kind: 'rect', x: 0, y: 0, width: ICON_FRAME, height: ICON_FRAME },
      { fill: colors.sky },
    ),
    shape(
      { kind: 'circle', cx: 160, cy: 40, r: 24 },
      { fill: colors.sun, stroke: colors.ink, strokeWidth: 4 },
    ),
    shape(
      { kind: 'path', d: 'M-10 166 Q 50 148 100 158 Q 150 146 210 156 L 210 210 L -10 210 Z' },
      { fill: colors.grass, stroke: colors.ink, strokeWidth: 4, strokeLinejoin: 'round' },
    ),
    shape(
      { kind: 'path', d: 'M-10 186 Q 60 176 110 184 Q 160 176 210 182 L 210 210 L -10 210 Z' },
      { fill: colors.grassDeep, stroke: colors.ink, strokeWidth: 4, strokeLinejoin: 'round' },
    ),
  ];
}

/** Drops the animations: icons are still pictures. */
function still(node: DrawNode): DrawNode {
  if (!isGroup(node)) {
    return node;
  }
  const { animation: _animation, delay: _delay, origin: _origin, ...rest } = node.group;
  return group(node.children.map(still), rest);
}

/** The mascot, scaled by `scale` and centered on (cx, cy). */
export function mascot(scale: number, cx: number, cy: number): GroupNode {
  const half = YOKAI_FRAME / 2;
  return group([still(drawYokai(generate(ICON_MASCOT_SEED)))], {
    translateX: cx - half * scale,
    translateY: cy - half * scale,
    scale,
  });
}

/** iOS and stores: opaque square, the mascot large on the sky. */
export const appIcon = (): GroupNode => group([...background(), mascot(0.95, 100, 96)]);

export const adaptiveBackground = (): GroupNode => group(background());

/** Android adaptive foreground: the mascot inside the safe zone, on transparency. */
export const adaptiveForeground = (): GroupNode =>
  group([mascot(ADAPTIVE_SAFE_ZONE * 0.98, 100, 100)]);

/** Splash screen logo, on transparency (the splash background is cream). */
export const splashLogo = (): GroupNode => group([mascot(1, 100, 100)]);
