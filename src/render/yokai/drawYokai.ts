import type { YokaiSpec } from '@/engine';

import { INK, PALETTE_COLORS } from './colors';
import { backLayer, frontLayer, sparks, topLayer } from './extras';
import { blush, EYES_DRAWINGS, MOUTH_DRAWINGS } from './face';
import { group, type GroupNode, shape } from './nodes';
import { OBJECT_DRAWINGS } from './objects';

/** Size of the drawing frame: every coordinate lives in a 200 × 200 square. */
export const YOKAI_FRAME = 200;

/** Legs lift the body so that the feet stay on the ground. */
const LEGS_LIFT = -14;

/**
 * The drawing of a yōkai, layer by layer (docs/PROCEDURAL_YOKAI.md § 6): shadow, then in the
 * floating group horns and limbs, object, details, face, bell and onibi; sparkles on top.
 */
export function drawYokai(spec: YokaiSpec): GroupNode {
  const object = OBJECT_DRAWINGS[spec.object];
  const palette = PALETTE_COLORS[spec.palette];
  const { face } = object.anchors;
  const legs = spec.limbs === 'leg' || spec.limbs === 'legs';
  const body = group(
    [
      ...backLayer(spec, object.anchors, palette),
      ...object.draw(palette),
      ...frontLayer(spec, object.anchors),
      ...blush(face),
      ...EYES_DRAWINGS[spec.eyes](face, spec.gaze.x, spec.gaze.y),
      ...MOUTH_DRAWINGS[spec.mouth](face.x, face.y + face.w * 0.34, face.w * 0.28),
      ...topLayer(spec, object.anchors),
    ],
    { translateY: legs ? LEGS_LIFT : 0 },
  );
  return group([
    shape({ kind: 'ellipse', cx: 100, cy: 190, rx: 44, ry: 6 }, { fill: INK, opacity: 0.18 }),
    group([body], { animation: 'float', delay: spec.animationDelay }),
    ...sparks(spec),
  ]);
}
