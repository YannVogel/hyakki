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
};
