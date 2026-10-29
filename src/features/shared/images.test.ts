import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { BATTLE_BACKDROPS, FESTIVAL_HEADER, HERO_POSES, heroPoseSize } from './images';

const HERO_DIR = path.resolve(__dirname, '../../../assets/images/hero');
const BACKDROP_DIR = path.resolve(__dirname, '../../../assets/images/backdrops');

/** Width and height from the PNG header (IHDR chunk). */
function pngSize(file: string): { width: number; height: number } {
  const bytes = readFileSync(file);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

/** Width and height from the frame header of a lossy WebP (`VP8 ` chunk, as cwebp writes it). */
function webpSize(file: string): { width: number; height: number } {
  const bytes = readFileSync(file);
  expect(bytes.toString('ascii', 12, 16)).toBe('VP8 ');
  return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
}

const sizeOf = ({ width, height }: { width: number; height: number }) => ({ width, height });

describe('hero poses', () => {
  it('know the real size of each PNG, in the order of the files', () => {
    const files = readdirSync(HERO_DIR)
      .filter((file) => file.endsWith('.png'))
      .sort();
    const sizes = files.map((file) => pngSize(path.join(HERO_DIR, file)));
    expect(Object.values(HERO_POSES).map(sizeOf)).toEqual(sizes);
  });

  it('draws every pose at the scale of the idle pose', () => {
    const idle = heroPoseSize('idle', 200);
    expect(idle.height).toBe(200);
    expect(idle.width).toBeCloseTo((707 * 200) / 1310);
    expect(heroPoseSize('knockedOut', 1310)).toEqual({ width: 1366, height: 969 });
  });
});

describe('backdrops', () => {
  it('know the real size of each WebP, in the order of the files', () => {
    const files = readdirSync(BACKDROP_DIR)
      .filter((file) => file.endsWith('.webp'))
      .sort();
    const declared = [BATTLE_BACKDROPS.parade, ...BATTLE_BACKDROPS.guardians, FESTIVAL_HEADER];
    expect(declared.map(sizeOf)).toEqual(
      files.map((file) => webpSize(path.join(BACKDROP_DIR, file))),
    );
  });

  it('give each of the ten guardians its own backdrop', () => {
    expect(new Set(BATTLE_BACKDROPS.guardians.map(({ source }) => source)).size).toBe(10);
  });
});
