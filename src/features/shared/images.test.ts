import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { HERO_POSES, heroPoseSize } from './images';

const HERO_DIR = path.resolve(__dirname, '../../../assets/images/hero');

/** Width and height from the PNG header (IHDR chunk). */
function pngSize(file: string): { width: number; height: number } {
  const bytes = readFileSync(file);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe('hero poses', () => {
  it('know the real size of each PNG, in the order of the files', () => {
    const files = readdirSync(HERO_DIR)
      .filter((file) => file.endsWith('.png'))
      .sort();
    const sizes = files.map((file) => pngSize(path.join(HERO_DIR, file)));
    expect(Object.values(HERO_POSES).map(({ width, height }) => ({ width, height }))).toEqual(
      sizes,
    );
  });

  it('draws every pose at the scale of the idle pose', () => {
    const idle = heroPoseSize('idle', 200);
    expect(idle.height).toBe(200);
    expect(idle.width).toBeCloseTo((257 * 200) / 449);
    expect(heroPoseSize('knockedOut', 449)).toEqual({ width: 384, height: 332 });
  });
});
