import type { PaletteId } from '@/engine';

// Art colors of the generated yōkai, from the prototype. They are drawing data of the generator
// (like its shapes), not interface colors: the UI takes its colors from the design tokens.

export const INK = '#2B1D3F';

export const ART = {
  white: '#FFFFFF',
  horn: '#FFE45C',
  drumSkin: '#FFF4DC',
  getaWood: '#E9B37A',
  blush: '#FF8FC7',
  tongue: '#FF8FC7',
  red: '#FF4B3E',
  bandage: '#FFE7C7',
  bell: '#FFD23F',
  onibi: '#5CC8FF',
  onibiCore: '#E6F8FF',
  goldSpark: '#FFE45C',
  epicSpark: '#D9C2FF',
} as const;

export interface PaletteColors {
  readonly body: string;
  readonly shade: string;
  readonly accent: string;
  /** Opacity of the body fill (translucent spectral yōkai). */
  readonly opacity: number;
}

export const PALETTE_COLORS: Readonly<Record<PaletteId, PaletteColors>> = {
  paper: { body: '#FFF8E1', shade: '#F3C98B', accent: '#FF4B3E', opacity: 1 },
  wood: { body: '#E9B37A', shade: '#B9784A', accent: '#FFD23F', opacity: 1 },
  lacquer: { body: '#FF6B57', shade: '#C93A2C', accent: '#FFD23F', opacity: 1 },
  celadon: { body: '#9FE6C4', shade: '#4FB58A', accent: '#FF8FC7', opacity: 1 },
  indigo: { body: '#8FA2FF', shade: '#4A5FD1', accent: '#FFD23F', opacity: 1 },
  sakura: { body: '#FFA6D1', shade: '#E26AA6', accent: '#FFFFFF', opacity: 1 },
  spectral: { body: '#CFF4FF', shade: '#7FD1F0', accent: '#B06BFF', opacity: 0.82 },
  gold: { body: '#FFD84D', shade: '#E0A800', accent: '#FF4B3E', opacity: 1 },
};
