import { colors } from '@/ui/tokens';

import { type DrawNode, shape } from '../yokai/nodes';

// Festival scene (design/mockups/Aube.dc.html), 366 × 220: fireworks and lanterns over a torii.

export const FESTIVAL_WIDTH = 366;
export const FESTIVAL_HEIGHT = 220;

function firework(cx: number, cy: number, radius: number, color: string): DrawNode[] {
  return Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * Math.PI * 2;
    const x = (cx + Math.cos(angle) * radius).toFixed(1);
    const y = (cy + Math.sin(angle) * radius).toFixed(1);
    return shape(
      { kind: 'path', d: `M${cx} ${cy} L${x} ${y}` },
      { stroke: color, strokeWidth: 4, strokeLinecap: 'round' },
    );
  });
}

function lantern(x: number, y: number): DrawNode[] {
  return [
    shape(
      { kind: 'path', d: `M${x} ${y - 20} L${x} ${y - 12}` },
      { stroke: colors.ink, strokeWidth: 2 },
    ),
    shape(
      { kind: 'ellipse', cx: x, cy: y, rx: 12, ry: 14 },
      { fill: colors.red, stroke: colors.ink, strokeWidth: 2.5 },
    ),
    shape({ kind: 'rect', x: x - 7, y: y - 16, width: 14, height: 4, rx: 1 }, { fill: colors.ink }),
    shape({ kind: 'rect', x: x - 7, y: y + 12, width: 14, height: 4, rx: 1 }, { fill: colors.ink }),
  ];
}

export function festivalScene(): DrawNode[] {
  const torii = {
    fill: colors.red,
    stroke: colors.ink,
    strokeWidth: 3,
    strokeLinejoin: 'round' as const,
  };
  return [
    ...firework(70, 60, 34, colors.yellow),
    ...firework(290, 46, 28, colors.pink),
    ...firework(200, 92, 22, colors.paper),
    ...[40, 110, 180, 250, 320].flatMap((x, index) => lantern(x, 130 + (index % 2) * 10)),
    shape(
      { kind: 'path', d: 'M0 190 L366 190 L366 220 L0 220 Z' },
      { fill: colors.sky, stroke: colors.ink, strokeWidth: 3 },
    ),
    shape({ kind: 'rect', x: 140, y: 150, width: 12, height: 56 }, torii),
    shape({ kind: 'rect', x: 214, y: 150, width: 12, height: 56 }, torii),
    shape({ kind: 'rect', x: 130, y: 162, width: 106, height: 9 }, torii),
    shape(
      { kind: 'path', d: 'M118 150 Q 183 140 248 150 L 252 140 Q 183 128 114 140 Z' },
      { fill: colors.ink },
    ),
  ];
}
