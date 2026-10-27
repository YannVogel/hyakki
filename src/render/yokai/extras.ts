import type { YokaiSpec } from '@/engine';

import { ART, INK, type PaletteColors } from './colors';
import { type DrawNode, group, r1, shape } from './nodes';
import { type Anchors, outlinedRect } from './objects';

const has = (spec: YokaiSpec, accessory: YokaiSpec['accessories'][number]) =>
  spec.accessories.includes(accessory);

/** Behind the object: horns, legs, arms. */
export function backLayer(spec: YokaiSpec, anchors: Anchors, palette: PaletteColors): DrawNode[] {
  const nodes: DrawNode[] = [];
  const { horn, bottom, sides } = anchors;
  if (has(spec, 'horns')) {
    for (const side of [-1, 1]) {
      const x = 100 + side * horn.spread;
      const y = horn.y;
      nodes.push(
        shape(
          { kind: 'path', d: `M${x - 8} ${y + 8} L${x + side * 7} ${y - 20} L${x + 8} ${y + 8} Z` },
          { fill: ART.horn, stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' },
        ),
      );
    }
  }
  if (has(spec, 'horn')) {
    nodes.push(
      shape(
        { kind: 'path', d: `M91 ${horn.y + 8} L100 ${horn.y - 26} L109 ${horn.y + 8} Z` },
        { fill: ART.horn, stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' },
      ),
    );
  }
  if (spec.limbs === 'leg' && bottom !== null) {
    const { x, y } = bottom;
    nodes.push(
      shape(
        { kind: 'path', d: `M${x} ${y - 4} L${x} ${y + 14}` },
        { stroke: INK, strokeWidth: 5, strokeLinecap: 'round' },
      ),
      outlinedRect(x - 14, y + 14, 28, 7, 2, ART.getaWood, 2.5),
      shape({ kind: 'rect', x: x - 10, y: y + 21, width: 5, height: 5 }, { fill: INK }),
      shape({ kind: 'rect', x: x + 5, y: y + 21, width: 5, height: 5 }, { fill: INK }),
    );
  }
  if (spec.limbs === 'legs' && bottom !== null) {
    for (const side of [-1, 1]) {
      const x = bottom.x + side * 16;
      const y = bottom.y;
      nodes.push(
        shape(
          { kind: 'path', d: `M${x} ${y - 6} L${x} ${y + 14}` },
          { stroke: INK, strokeWidth: 5, strokeLinecap: 'round' },
        ),
        shape({ kind: 'ellipse', cx: x + side * 4, cy: y + 17, rx: 8, ry: 4.5 }, { fill: INK }),
      );
    }
  }
  if (spec.limbs === 'arms') {
    const arm = (start: number, elbow: number, hand: number): DrawNode[] => [
      shape(
        {
          kind: 'path',
          d: `M${start} ${sides.y} Q${elbow} ${sides.y + 4} ${hand} ${sides.y - 16}`,
        },
        { fill: 'none', stroke: INK, strokeWidth: 4.5, strokeLinecap: 'round' },
      ),
      shape(
        { kind: 'circle', cx: hand, cy: sides.y - 19, r: 5.5 },
        { fill: palette.body, stroke: INK, strokeWidth: 2.5 },
      ),
    ];
    nodes.push(
      ...arm(sides.l + 6, sides.l - 16, sides.l - 22),
      ...arm(sides.r - 6, sides.r + 16, sides.r + 22),
    );
  }
  return nodes;
}

/** On the object: cracks, headband, ofuda, bandage. */
export function frontLayer(spec: YokaiSpec, anchors: Anchors): DrawNode[] {
  const nodes: DrawNode[] = [];
  const f = anchors.face;
  if (has(spec, 'cracks')) {
    const cx = f.x - f.w * 0.5;
    const cy = f.y + f.w * 0.12;
    nodes.push(
      shape(
        { kind: 'path', d: `M${r1(cx)} ${r1(cy - 14)} l5 7 l-5 6 l6 8` },
        {
          fill: 'none',
          stroke: INK,
          strokeWidth: 2.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
      ),
    );
  }
  if (has(spec, 'hachimaki')) {
    const hy = f.y - f.w * 0.5 - 6;
    const hx = f.x - f.w * 0.62;
    const hw = f.w * 1.24;
    nodes.push(
      shape(
        { kind: 'rect', x: r1(hx), y: r1(hy - 5), width: r1(hw), height: 10, rx: 5 },
        { fill: ART.red, stroke: INK, strokeWidth: 2.5 },
      ),
      shape(
        {
          kind: 'path',
          d: `M${r1(hx + hw - 4)} ${r1(hy)} l16 -9 l2 9 Z M${r1(hx + hw - 4)} ${r1(hy)} l14 8 l-4 5 Z`,
        },
        { fill: ART.red, stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round' },
      ),
    );
  }
  if (has(spec, 'ofuda')) {
    const ox = r1(f.x + f.w * 0.48);
    const oy = r1(f.y - f.w * 0.28);
    nodes.push(
      group(
        [
          outlinedRect(r1(ox - 7), r1(oy - 15), 14, 30, 1.5, ART.white, 2.5),
          shape(
            { kind: 'rect', x: r1(ox - 2), y: r1(oy - 10), width: 4, height: 20 },
            { fill: ART.red },
          ),
        ],
        { rotate: { angle: 18, cx: ox, cy: oy } },
      ),
    );
  }
  if (has(spec, 'bandage')) {
    const px = r1(f.x - f.w * 0.45);
    const py = r1(f.y - f.w * 0.32);
    for (const angle of [45, -45]) {
      nodes.push(
        group([outlinedRect(r1(px - 12), r1(py - 4), 24, 8, 3, ART.bandage, 2.2)], {
          rotate: { angle, cx: px, cy: py },
        }),
      );
    }
  }
  return nodes;
}

/** Above everything: the bell and the onibi flame. */
export function topLayer(spec: YokaiSpec, anchors: Anchors): DrawNode[] {
  const nodes: DrawNode[] = [];
  if (has(spec, 'bell')) {
    const x = anchors.sides.r;
    const y = anchors.sides.y;
    nodes.push(
      shape(
        { kind: 'path', d: `M${x - 10} ${y} Q${x + 2} ${y + 4} ${x} ${y + 13}` },
        { fill: 'none', stroke: INK, strokeWidth: 2.5 },
      ),
      shape(
        { kind: 'circle', cx: x, cy: y + 22, r: 9 },
        { fill: ART.bell, stroke: INK, strokeWidth: 2.5 },
      ),
      shape(
        { kind: 'path', d: `M${x - 5} ${y + 24} L${x + 5} ${y + 24}` },
        { stroke: INK, strokeWidth: 2 },
      ),
      shape({ kind: 'circle', cx: x, cy: y + 27, r: 1.6 }, { fill: INK }),
    );
  }
  if (has(spec, 'onibi')) {
    nodes.push(
      group(
        [
          shape(
            {
              kind: 'path',
              d: 'M162 22 C168 34 176 40 174 52 C172 62 166 66 162 66 C158 66 151 62 150 54 C148 44 156 38 162 22 Z',
            },
            { fill: ART.onibi, stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round' },
          ),
          shape(
            {
              kind: 'path',
              d: 'M162 40 C165 46 168 49 167 54 C166 59 164 60 162 60 C160 60 157 58 157 54 C157 49 160 46 162 40 Z',
            },
            { fill: ART.onibiCore },
          ),
        ],
        // Flickers from the bottom center of the flame.
        { animation: 'flame', origin: { x: 162, y: 66 } },
      ),
    );
  }
  return nodes;
}

function star(x: number, y: number, size: number, fill: string): DrawNode {
  const q = size * 0.25;
  return group(
    [
      shape(
        {
          kind: 'path',
          d: `M${x} ${y - size} L${x + q} ${y - q} L${x + size} ${y} L${x + q} ${y + q} L${x} ${y + size} L${x - q} ${y + q} L${x - size} ${y} L${x - q} ${y - q} Z`,
        },
        { fill, stroke: INK, strokeWidth: 1.5, strokeLinejoin: 'round' },
      ),
    ],
    { animation: 'spark', origin: { x, y } },
  );
}

/** Sparkles around epic and legendary yōkai. */
export function sparks(spec: YokaiSpec): DrawNode[] {
  if (spec.rarity === 'legendary') {
    return [
      star(26, 40, 9, ART.goldSpark),
      star(178, 96, 7, ART.goldSpark),
      star(22, 140, 6, ART.white),
      star(150, 18, 6, ART.white),
    ];
  }
  if (spec.rarity === 'epic') {
    return [star(28, 50, 7, ART.epicSpark), star(176, 120, 6, ART.epicSpark)];
  }
  return [];
}
