import type { EyesId, MouthId } from '@/engine';

import { ART, INK } from './colors';
import type { Anchors } from './objects';
import { type DrawNode, group, r1, shape } from './nodes';

type Face = Anchors['face'];

/** A round eye with pupil and highlights; `big` adds a second highlight (kawaii eyes). */
function eye(x: number, y: number, r: number, gazeX: number, gazeY: number, big = false): DrawNode {
  const pupil = r * (big ? 0.64 : 0.52);
  const px = x + gazeX * r * 0.22;
  const py = y + gazeY * r * 0.22;
  const children: DrawNode[] = [
    shape(
      { kind: 'circle', cx: r1(x), cy: r1(y), r: r1(r) },
      { fill: ART.white, stroke: INK, strokeWidth: 3 },
    ),
    shape({ kind: 'circle', cx: r1(px), cy: r1(py), r: r1(pupil) }, { fill: INK }),
    shape(
      { kind: 'circle', cx: r1(px - pupil * 0.35), cy: r1(py - pupil * 0.38), r: r1(pupil * 0.34) },
      { fill: ART.white },
    ),
  ];
  if (big) {
    children.push(
      shape(
        {
          kind: 'circle',
          cx: r1(px + pupil * 0.38),
          cy: r1(py + pupil * 0.3),
          r: r1(pupil * 0.16),
        },
        { fill: ART.white },
      ),
    );
  }
  return group(children, { animation: 'eye', origin: { x: r1(x), y: r1(y) } });
}

type EyesDrawing = (face: Face, gazeX: number, gazeY: number) => DrawNode[];

export const EYES_DRAWINGS: Readonly<Record<EyesId, EyesDrawing>> = {
  cyclops: (f, gx, gy) => [eye(f.x, f.y - 4, f.w * 0.26, gx, gy)],
  pair: (f, gx, gy) => [
    eye(f.x - f.w * 0.22, f.y - 6, f.w * 0.15, gx, gy),
    eye(f.x + f.w * 0.22, f.y - 6, f.w * 0.15, gx, gy),
  ],
  wink: (f, gx, gy) => {
    const x = f.x - f.w * 0.22;
    const y = f.y - 6;
    return [
      eye(f.x + f.w * 0.2, f.y - 6, f.w * 0.19, gx, gy),
      shape(
        { kind: 'path', d: `M${r1(x - 8)} ${r1(y)} Q${r1(x)} ${r1(y - 10)} ${r1(x + 8)} ${r1(y)}` },
        { fill: 'none', stroke: INK, strokeWidth: 3.5, strokeLinecap: 'round' },
      ),
    ];
  },
  three: (f, gx, gy) => [
    eye(f.x - f.w * 0.22, f.y - 2, f.w * 0.14, gx, gy),
    eye(f.x + f.w * 0.22, f.y - 2, f.w * 0.14, gx, gy),
    eye(f.x, f.y - f.w * 0.3, f.w * 0.11, gx, gy),
  ],
  sly: (f) =>
    [-1, 1].flatMap((side) => {
      const x = f.x + side * f.w * 0.22;
      const y = f.y - 6;
      return [
        shape(
          {
            kind: 'path',
            d: `M${r1(x - 9)} ${r1(y + 2)} Q${r1(x)} ${r1(y - 8)} ${r1(x + 9)} ${r1(y + 2)} Q${r1(x)} ${r1(y - 1)} ${r1(x - 9)} ${r1(y + 2)} Z`,
          },
          { fill: INK, stroke: INK, strokeWidth: 1.5, strokeLinejoin: 'round' },
        ),
        shape(
          {
            kind: 'path',
            d: `M${r1(x + side * 10)} ${r1(y - 15)} L${r1(x - side * 9)} ${r1(y - 9)}`,
          },
          { stroke: INK, strokeWidth: 3.5, strokeLinecap: 'round' },
        ),
      ];
    }),
  dots: (f) =>
    [-1, 1].map((side) => {
      const x = f.x + side * f.w * 0.2;
      const y = f.y - 4;
      return group(
        [
          shape({ kind: 'circle', cx: r1(x), cy: r1(y), r: 4.8 }, { fill: INK }),
          shape({ kind: 'circle', cx: r1(x - 1.4), cy: r1(y - 1.6), r: 1.5 }, { fill: ART.white }),
        ],
        { animation: 'eye', origin: { x: r1(x), y: r1(y) } },
      );
    }),
  slit: (f, gx) => {
    const x = f.x;
    const y = f.y - 6;
    const rx = f.w * 0.15;
    const ry = f.w * 0.26;
    return [
      group(
        [
          shape(
            { kind: 'ellipse', cx: r1(x), cy: r1(y), rx: r1(rx), ry: r1(ry) },
            { fill: ART.white, stroke: INK, strokeWidth: 3 },
          ),
          shape(
            { kind: 'ellipse', cx: r1(x + gx * 2), cy: r1(y), rx: 3.2, ry: r1(ry * 0.78) },
            { fill: INK },
          ),
          shape(
            { kind: 'circle', cx: r1(x - rx * 0.4), cy: r1(y - ry * 0.45), r: 2.2 },
            { fill: ART.white },
          ),
        ],
        { animation: 'eye', origin: { x: r1(x), y: r1(y) } },
      ),
    ];
  },
  big: (f, gx, gy) => [
    eye(f.x - f.w * 0.22, f.y - 6, f.w * 0.16, gx, gy, true),
    eye(f.x + f.w * 0.22, f.y - 6, f.w * 0.16, gx, gy, true),
  ],
};

function grin(mx: number, my: number, w: number): DrawNode {
  return shape(
    {
      kind: 'path',
      d: `M${r1(mx - w)} ${r1(my)} Q${r1(mx)} ${r1(my + w * 0.9)} ${r1(mx + w)} ${r1(my)} Q${r1(mx)} ${r1(my + w * 0.3)} ${r1(mx - w)} ${r1(my)} Z`,
    },
    { fill: INK, stroke: INK, strokeWidth: 2, strokeLinejoin: 'round' },
  );
}

const fang = (mx: number, my: number, w: number, side: -1 | 1): DrawNode =>
  shape(
    {
      kind: 'path',
      d: `M${r1(mx + side * w * 0.55)} ${r1(my + w * 0.14)} L${r1(mx + side * w * 0.42)} ${r1(my + w * 0.52)} L${r1(mx + side * w * 0.28)} ${r1(my + w * 0.22)} Z`,
    },
    { fill: ART.white },
  );

type MouthDrawing = (mx: number, my: number, w: number) => DrawNode[];

export const MOUTH_DRAWINGS: Readonly<Record<MouthId, MouthDrawing>> = {
  grin: (mx, my, w) => [grin(mx, my, w)],
  fangs: (mx, my, w) => [grin(mx, my, w), fang(mx, my, w, -1), fang(mx, my, w, 1)],
  tongue: (mx, my, w) => [
    grin(mx, my, w),
    group(
      [
        shape(
          {
            kind: 'path',
            d: `M${r1(mx - w * 0.28)} ${r1(my + w * 0.36)} C${r1(mx - w * 0.38)} ${r1(my + w * 1.5)} ${r1(mx + w * 0.38)} ${r1(my + w * 1.7)} ${r1(mx + w * 0.3)} ${r1(my + w * 0.36)} Z`,
          },
          { fill: ART.tongue, stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round' },
        ),
      ],
      // Swings from the top center of the tongue.
      { animation: 'tongue', origin: { x: r1(mx + w * 0.01), y: r1(my + w * 0.36) } },
    ),
  ],
  o: (mx, my) => [
    shape({ kind: 'ellipse', cx: r1(mx), cy: r1(my + 5), rx: 5.5, ry: 7 }, { fill: INK }),
  ],
  wavy: (mx, my, w) => [
    shape(
      {
        kind: 'path',
        d: `M${r1(mx - w)} ${r1(my + 4)} q ${r1(w / 4)} -6 ${r1(w / 2)} 0 t ${r1(w / 2)} 0 t ${r1(w / 2)} 0 t ${r1(w / 2)} 0`,
      },
      {
        fill: 'none',
        stroke: INK,
        strokeWidth: 3.2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
    ),
  ],
  teeth: (mx, my, w) => {
    const b = my + w * 0.85;
    return [
      shape(
        {
          kind: 'path',
          d: `M${r1(mx - w)} ${r1(my)} L${r1(mx + w)} ${r1(my)} Q${r1(mx + w)} ${r1(b)} ${r1(mx)} ${r1(b)} Q${r1(mx - w)} ${r1(b)} ${r1(mx - w)} ${r1(my)} Z`,
        },
        { fill: ART.white, stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' },
      ),
      shape(
        {
          kind: 'path',
          d: `M${r1(mx - w * 0.36)} ${r1(my)} L${r1(mx - w * 0.36)} ${r1(my + w * 0.6)} M${r1(mx)} ${r1(my)} L${r1(mx)} ${r1(my + w * 0.75)} M${r1(mx + w * 0.36)} ${r1(my)} L${r1(mx + w * 0.36)} ${r1(my + w * 0.6)}`,
        },
        { stroke: INK, strokeWidth: 2 },
      ),
    ];
  },
};

export function blush(face: Face): DrawNode[] {
  return [-1, 1].map((side) =>
    shape(
      {
        kind: 'ellipse',
        cx: r1(face.x + side * face.w * 0.4),
        cy: r1(face.y + face.w * 0.12),
        rx: r1(face.w * 0.08),
        ry: r1(face.w * 0.045),
      },
      { fill: ART.blush, opacity: 0.75 },
    ),
  );
}
