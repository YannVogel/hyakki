import type { ObjectId } from '@/engine';

import { INK, ART, type PaletteColors } from './colors';
import { type DrawNode, shape } from './nodes';

export interface Anchors {
  /** Face center and width. */
  readonly face: { readonly x: number; readonly y: number; readonly w: number };
  readonly horn: { readonly y: number; readonly spread: number };
  /** Where legs attach; null for objects without legs. */
  readonly bottom: { readonly x: number; readonly y: number } | null;
  readonly sides: { readonly l: number; readonly r: number; readonly y: number };
}

export interface ObjectDrawing {
  readonly anchors: Anchors;
  readonly draw: (palette: PaletteColors) => DrawNode[];
}

/** Outlined rounded rectangle, the prototype's `rect` helper. */
export const outlinedRect = (
  x: number,
  y: number,
  width: number,
  height: number,
  rx: number,
  fill: string,
  strokeWidth: number,
): DrawNode => shape({ kind: 'rect', x, y, width, height, rx }, { fill, stroke: INK, strokeWidth });

const body = (palette: PaletteColors, strokeWidth = 3.5) => ({
  fill: palette.body,
  fillOpacity: palette.opacity,
  stroke: INK,
  strokeWidth,
});

const drumStuds = (): DrawNode[] => {
  const studs: DrawNode[] = [];
  for (let x = 52; x <= 148; x += 16) {
    studs.push(shape({ kind: 'circle', cx: x, cy: 84, r: 2.4 }, { fill: INK }));
    studs.push(shape({ kind: 'circle', cx: x, cy: 140, r: 2.4 }, { fill: INK }));
  }
  return studs;
};

export const OBJECT_DRAWINGS: Readonly<Record<ObjectId, ObjectDrawing>> = {
  lantern: {
    anchors: {
      face: { x: 100, y: 102, w: 64 },
      horn: { y: 40, spread: 22 },
      bottom: { x: 100, y: 176 },
      sides: { l: 48, r: 152, y: 112 },
    },
    draw: (p) => [
      shape({ kind: 'rect', x: 94, y: 20, width: 12, height: 14, rx: 2 }, { fill: INK }),
      shape({ kind: 'ellipse', cx: 100, cy: 104, rx: 52, ry: 62 }, body(p)),
      shape(
        { kind: 'path', d: 'M62 64 Q100 72 138 64 M62 146 Q100 154 138 146' },
        { fill: 'none', stroke: p.shade, strokeWidth: 2.5, strokeLinecap: 'round' },
      ),
      outlinedRect(70, 32, 60, 14, 5, p.accent, 3),
      outlinedRect(70, 162, 60, 14, 5, p.accent, 3),
    ],
  },
  umbrella: {
    anchors: {
      face: { x: 100, y: 76, w: 52 },
      horn: { y: 44, spread: 12 },
      bottom: { x: 100, y: 166 },
      sides: { l: 32, r: 168, y: 108 },
    },
    draw: (p) => [
      shape(
        { kind: 'path', d: 'M100 104 L100 166' },
        { stroke: INK, strokeWidth: 7, strokeLinecap: 'round' },
      ),
      shape(
        { kind: 'path', d: 'M100 104 L100 166' },
        { stroke: p.shade, strokeWidth: 2.5, strokeLinecap: 'round' },
      ),
      shape(
        { kind: 'path', d: 'M26 112 L100 28 L174 112 Q137 100 100 112 Q63 100 26 112 Z' },
        { ...body(p), strokeLinejoin: 'round' },
      ),
      shape(
        { kind: 'path', d: 'M100 32 L62 104 M100 32 L138 104' },
        { stroke: p.shade, strokeWidth: 2, fill: 'none' },
      ),
      shape(
        { kind: 'circle', cx: 100, cy: 26, r: 6 },
        { fill: p.accent, stroke: INK, strokeWidth: 2.5 },
      ),
    ],
  },
  teapot: {
    anchors: {
      face: { x: 100, y: 124, w: 72 },
      horn: { y: 74, spread: 22 },
      bottom: { x: 100, y: 168 },
      sides: { l: 40, r: 158, y: 140 },
    },
    draw: (p) => [
      shape(
        { kind: 'path', d: 'M58 88 Q100 22 142 88' },
        { fill: 'none', stroke: INK, strokeWidth: 10, strokeLinecap: 'round' },
      ),
      shape(
        { kind: 'path', d: 'M58 88 Q100 22 142 88' },
        { fill: 'none', stroke: p.shade, strokeWidth: 4.5, strokeLinecap: 'round' },
      ),
      shape(
        { kind: 'path', d: 'M146 114 Q176 106 184 82 L172 76 Q166 96 144 100 Z' },
        { ...body(p, 3), strokeLinejoin: 'round' },
      ),
      shape({ kind: 'ellipse', cx: 100, cy: 120, rx: 60, ry: 48 }, body(p)),
      shape(
        { kind: 'ellipse', cx: 100, cy: 76, rx: 30, ry: 9 },
        { fill: p.accent, stroke: INK, strokeWidth: 3 },
      ),
      shape(
        { kind: 'circle', cx: 100, cy: 64, r: 7 },
        { fill: p.accent, stroke: INK, strokeWidth: 3 },
      ),
    ],
  },
  drum: {
    anchors: {
      face: { x: 100, y: 112, w: 78 },
      horn: { y: 60, spread: 30 },
      bottom: { x: 100, y: 158 },
      sides: { l: 42, r: 158, y: 112 },
    },
    draw: (p) => [
      shape(
        { kind: 'path', d: 'M44 68 Q100 56 156 68 L162 146 Q100 162 38 146 Z' },
        { ...body(p), strokeLinejoin: 'round' },
      ),
      ...drumStuds(),
      shape(
        { kind: 'ellipse', cx: 100, cy: 66, rx: 56, ry: 13 },
        { fill: ART.drumSkin, stroke: INK, strokeWidth: 3 },
      ),
      shape(
        { kind: 'path', d: 'M80 66 a10 5 0 0 1 20 0 a10 5 0 0 0 20 0' },
        { fill: 'none', stroke: p.accent, strokeWidth: 3, strokeLinecap: 'round' },
      ),
    ],
  },
  geta: {
    anchors: {
      face: { x: 100, y: 96, w: 66 },
      horn: { y: 78, spread: 36 },
      bottom: null,
      sides: { l: 34, r: 166, y: 104 },
    },
    draw: (p) => [
      outlinedRect(54, 128, 26, 38, 4, p.shade, 3),
      outlinedRect(120, 128, 26, 38, 4, p.shade, 3),
      shape({ kind: 'rect', x: 34, y: 70, width: 132, height: 66, rx: 16 }, body(p)),
      shape(
        { kind: 'path', d: 'M56 74 Q100 30 144 74' },
        { fill: 'none', stroke: INK, strokeWidth: 9, strokeLinecap: 'round' },
      ),
      shape(
        { kind: 'path', d: 'M56 74 Q100 30 144 74' },
        { fill: 'none', stroke: p.accent, strokeWidth: 4.5, strokeLinecap: 'round' },
      ),
      shape(
        { kind: 'circle', cx: 100, cy: 52, r: 6 },
        { fill: p.accent, stroke: INK, strokeWidth: 2.5 },
      ),
    ],
  },
  scroll: {
    anchors: {
      face: { x: 100, y: 96, w: 60 },
      horn: { y: 34, spread: 30 },
      bottom: { x: 100, y: 174 },
      sides: { l: 58, r: 142, y: 104 },
    },
    draw: (p) => [
      shape({ kind: 'rect', x: 60, y: 38, width: 80, height: 126 }, body(p)),
      shape(
        { kind: 'path', d: 'M72 136 L72 154 M80 142 L80 152 M128 52 L128 70 M120 56 L120 64' },
        { stroke: p.shade, strokeWidth: 3, strokeLinecap: 'round' },
      ),
      outlinedRect(48, 28, 104, 16, 8, p.accent, 3),
      outlinedRect(48, 158, 104, 16, 8, p.accent, 3),
    ],
  },
  // Version 2 objects.
  kettle: {
    anchors: {
      face: { x: 100, y: 116, w: 70 },
      horn: { y: 62, spread: 26 },
      bottom: { x: 100, y: 160 },
      sides: { l: 46, r: 154, y: 120 },
    },
    draw: (p) => [
      shape(
        { kind: 'path', d: 'M66 82 Q100 18 134 82' },
        { fill: 'none', stroke: INK, strokeWidth: 6, strokeLinecap: 'round' },
      ),
      shape(
        { kind: 'path', d: 'M52 112 Q30 104 22 78 L33 73 Q40 94 56 98 Z' },
        { ...body(p, 3), strokeLinejoin: 'round' },
      ),
      shape(
        { kind: 'path', d: 'M62 80 Q100 70 138 80 L158 148 Q100 166 42 148 Z' },
        { ...body(p), strokeLinejoin: 'round' },
      ),
      shape(
        { kind: 'path', d: 'M50 136 Q100 150 150 136' },
        { fill: 'none', stroke: p.shade, strokeWidth: 2.5, strokeLinecap: 'round' },
      ),
      shape(
        { kind: 'path', d: 'M76 80 Q100 58 124 80 Z' },
        { fill: p.accent, stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' },
      ),
      shape(
        { kind: 'circle', cx: 100, cy: 64, r: 6 },
        { fill: p.accent, stroke: INK, strokeWidth: 2.5 },
      ),
    ],
  },
  fan: {
    anchors: {
      face: { x: 100, y: 90, w: 64 },
      horn: { y: 38, spread: 28 },
      bottom: { x: 100, y: 174 },
      sides: { l: 44, r: 156, y: 100 },
    },
    draw: (p) => [
      outlinedRect(93, 134, 14, 42, 4, p.accent, 3),
      shape({ kind: 'circle', cx: 100, cy: 88, r: 58 }, body(p)),
      shape(
        {
          kind: 'path',
          d: 'M100 140 L53 61 M100 140 L73 41 M100 140 L127 41 M100 140 L147 61',
        },
        { fill: 'none', stroke: p.shade, strokeWidth: 2, strokeLinecap: 'round' },
      ),
      shape(
        { kind: 'circle', cx: 100, cy: 88, r: 50 },
        { fill: 'none', stroke: p.shade, strokeWidth: 2.5 },
      ),
    ],
  },
  mask: {
    anchors: {
      face: { x: 100, y: 102, w: 70 },
      horn: { y: 38, spread: 26 },
      bottom: { x: 100, y: 170 },
      sides: { l: 46, r: 154, y: 110 },
    },
    draw: (p) => [
      shape(
        { kind: 'path', d: 'M46 94 Q30 88 22 104 M154 94 Q170 88 178 104' },
        { fill: 'none', stroke: INK, strokeWidth: 6, strokeLinecap: 'round' },
      ),
      shape(
        { kind: 'path', d: 'M46 94 Q30 88 22 104 M154 94 Q170 88 178 104' },
        { fill: 'none', stroke: p.accent, strokeWidth: 2.5, strokeLinecap: 'round' },
      ),
      shape(
        {
          kind: 'path',
          d: 'M100 32 C150 32 160 80 156 116 C152 154 126 172 100 172 C74 172 48 154 44 116 C40 80 50 32 100 32 Z',
        },
        { ...body(p), strokeLinejoin: 'round' },
      ),
      shape({ kind: 'ellipse', cx: 76, cy: 60, rx: 9, ry: 5 }, { fill: p.shade }),
      shape({ kind: 'ellipse', cx: 124, cy: 60, rx: 9, ry: 5 }, { fill: p.shade }),
      shape(
        { kind: 'path', d: 'M84 158 Q100 164 116 158' },
        { fill: 'none', stroke: p.shade, strokeWidth: 2.5, strokeLinecap: 'round' },
      ),
    ],
  },
  sandal: {
    anchors: {
      face: { x: 100, y: 112, w: 66 },
      horn: { y: 52, spread: 30 },
      bottom: null,
      sides: { l: 46, r: 154, y: 116 },
    },
    draw: (p) => [
      shape({ kind: 'rect', x: 46, y: 50, width: 108, height: 120, rx: 50 }, body(p)),
      shape(
        {
          kind: 'path',
          d: 'M62 150 L138 150 M68 160 L132 160 M70 62 L130 62 M52 84 L62 86 M50 100 L60 101 M50 116 L60 116 M50 132 L61 131 M148 84 L138 86 M150 100 L140 101 M150 116 L140 116 M150 132 L139 131',
        },
        { fill: 'none', stroke: p.shade, strokeWidth: 2.5, strokeLinecap: 'round' },
      ),
      shape(
        { kind: 'path', d: 'M58 70 Q100 104 142 70' },
        { fill: 'none', stroke: INK, strokeWidth: 8, strokeLinecap: 'round' },
      ),
      shape(
        { kind: 'path', d: 'M58 70 Q100 104 142 70' },
        { fill: 'none', stroke: p.accent, strokeWidth: 4, strokeLinecap: 'round' },
      ),
      shape(
        { kind: 'circle', cx: 100, cy: 86, r: 5 },
        { fill: p.accent, stroke: INK, strokeWidth: 2.5 },
      ),
    ],
  },
  templeBell: {
    anchors: {
      face: { x: 100, y: 112, w: 64 },
      horn: { y: 46, spread: 28 },
      bottom: { x: 100, y: 166 },
      sides: { l: 54, r: 146, y: 116 },
    },
    draw: (p) => [
      shape(
        { kind: 'path', d: 'M88 42 Q88 20 100 20 Q112 20 112 42' },
        { fill: 'none', stroke: INK, strokeWidth: 8, strokeLinecap: 'round' },
      ),
      shape(
        { kind: 'path', d: 'M88 42 Q88 20 100 20 Q112 20 112 42' },
        { fill: 'none', stroke: p.accent, strokeWidth: 3.5, strokeLinecap: 'round' },
      ),
      shape(
        { kind: 'path', d: 'M60 62 Q60 40 100 40 Q140 40 140 62 L146 150 Q100 158 54 150 Z' },
        { ...body(p), strokeLinejoin: 'round' },
      ),
      ...[72, 86, 100, 114, 128].flatMap((x) => [
        shape({ kind: 'circle', cx: x, cy: 60, r: 3 }, { fill: p.shade }),
        shape({ kind: 'circle', cx: x, cy: 71, r: 3 }, { fill: p.shade }),
      ]),
      shape(
        { kind: 'path', d: 'M59 82 L141 82' },
        { fill: 'none', stroke: p.shade, strokeWidth: 2.5, strokeLinecap: 'round' },
      ),
      outlinedRect(50, 146, 100, 14, 6, p.accent, 3),
    ],
  },
  mortar: {
    anchors: {
      face: { x: 100, y: 118, w: 70 },
      horn: { y: 66, spread: 34 },
      bottom: { x: 100, y: 166 },
      sides: { l: 48, r: 152, y: 120 },
    },
    draw: (p) => [
      shape(
        {
          kind: 'path',
          d: 'M42 74 L50 112 Q54 122 50 132 L44 158 Q100 172 156 158 L150 132 Q146 122 150 112 L158 74 Z',
        },
        { ...body(p), strokeLinejoin: 'round' },
      ),
      shape(
        { kind: 'path', d: 'M50 104 Q100 114 150 104' },
        { fill: 'none', stroke: p.shade, strokeWidth: 2.5, strokeLinecap: 'round' },
      ),
      shape(
        { kind: 'ellipse', cx: 100, cy: 74, rx: 58, ry: 12 },
        { fill: p.accent, stroke: INK, strokeWidth: 3 },
      ),
      shape({ kind: 'ellipse', cx: 100, cy: 74, rx: 42, ry: 7 }, { fill: p.shade }),
    ],
  },
};
