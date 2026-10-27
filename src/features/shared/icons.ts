import { colors, type IconPart } from '@/ui';

// Icons of the mockups (design/mockups), 24 × 24.

export const SOULS_ICON: readonly IconPart[] = [
  {
    d: 'M12 2c3 5 7 8 7 13a7 7 0 0 1-14 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4 1-7 2-10z',
    fill: colors.yellow,
    stroke: colors.ink,
    strokeWidth: 1.8,
  },
];

export const OFUDA_ICON: readonly IconPart[] = [
  {
    d: 'M8.5 2.5 h7 a1.5 1.5 0 0 1 1.5 1.5 v16 a1.5 1.5 0 0 1 -1.5 1.5 h-7 a1.5 1.5 0 0 1 -1.5 -1.5 v-16 a1.5 1.5 0 0 1 1.5 -1.5 z',
    fill: colors.paper,
    stroke: colors.ink,
    strokeWidth: 1.8,
  },
  { d: 'M10.8 6 h2.4 v12 h-2.4 z', fill: colors.red },
];

const line =
  (d: string) =>
  (color: string): IconPart[] => [{ d, stroke: color }];

export const TAB_ICONS = {
  combat: line(
    'M9 3 h6 a1 1 0 0 1 1 1 v16 a1 1 0 0 1 -1 1 h-6 a1 1 0 0 1 -1 -1 v-16 a1 1 0 0 1 1 -1 z M12 7v10M10 10h4',
  ),
  shikigami: line('M5 4l4 5h6l4-5v9c0 4-3 7-7 7s-7-3-7-7z M9 13h.01M15 13h.01'),
  sanctuary: line('M3 6c6-1.5 12-1.5 18 0 M5 9.5h14 M7 7v14M17 7v14'),
  festival: line(
    'M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8',
  ),
} as const;
