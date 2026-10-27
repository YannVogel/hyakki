import { colors } from '@/ui/tokens';

import { type DrawNode, shape } from '../yokai/nodes';

// Art of the guardian cut-in (design/mockups/Boss.dc.html): rays behind, and the guardian's eyes
// bursting out in close-up (390 × 120 frame).

export const EYES_WIDTH = 390;
export const EYES_HEIGHT = 120;

const eye = (whiteD: string, irisX: number, browD: string, lidD: string): DrawNode[] => [
  shape(
    { kind: 'path', d: whiteD },
    { fill: colors.sun, stroke: colors.ink, strokeWidth: 3.5, strokeLinejoin: 'round' },
  ),
  shape(
    { kind: 'circle', cx: irisX, cy: 58, r: 11 },
    { fill: colors.red, stroke: colors.ink, strokeWidth: 3 },
  ),
  shape({ kind: 'ellipse', cx: irisX, cy: 58, rx: 3, ry: 10 }, { fill: colors.ink }),
  shape({ kind: 'circle', cx: irisX - 5, cy: 53, r: 2.5 }, { fill: colors.paper }),
  shape(
    { kind: 'path', d: lidD },
    { fill: 'none', stroke: colors.ink, strokeWidth: 6, strokeLinecap: 'round' },
  ),
  shape({ kind: 'path', d: browD }, { stroke: colors.ink, strokeWidth: 7, strokeLinecap: 'round' }),
];

export const GUARDIAN_EYES: DrawNode[] = [
  ...eye(
    'M68 66 Q 118 30 172 56 Q 120 78 68 66 Z',
    124,
    'M58 30 L 172 42',
    'M60 64 Q 118 22 180 54',
  ),
  ...eye(
    'M322 66 Q 272 30 218 56 Q 270 78 322 66 Z',
    266,
    'M332 30 L 218 42',
    'M330 64 Q 272 22 210 54',
  ),
];

/** Wedges of the rotating rays: `count` alternating slices around (0, 0), of the given radius. */
export function rayWedges(count: number, radius: number): string[] {
  const step = (Math.PI * 2) / count;
  return Array.from({ length: count / 2 }, (_, index) => {
    const start = index * 2 * step;
    const end = start + step;
    const point = (angle: number) =>
      `${(Math.cos(angle) * radius).toFixed(1)} ${(Math.sin(angle) * radius).toFixed(1)}`;
    return `M0 0 L${point(start)} L${point(end)} Z`;
  });
}
