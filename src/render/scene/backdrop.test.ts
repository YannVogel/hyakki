import { colors } from '@/ui/tokens';

import { isGroup } from '../yokai/nodes';
import { backdrop, SCENE_HEIGHT, SCENE_WIDTH, sceneLayout, toBox } from './backdrop';

describe('battle backdrop', () => {
  it('paints the torii in the accent color', () => {
    const torii = backdrop('#123456').filter(
      (node) => !isGroup(node) && node.paint.fill === '#123456',
    );
    expect(torii).toHaveLength(5);
    expect(backdrop().some((node) => !isGroup(node) && node.paint.fill === colors.red)).toBe(true);
  });

  it('covers the box and keeps the scene centered (slice)', () => {
    const tall = sceneLayout(360, 600);
    expect(tall.scale).toBeCloseTo(600 / SCENE_HEIGHT, 10);
    expect(tall.offsetY).toBeCloseTo(0, 10);
    expect(toBox(tall, SCENE_WIDTH / 2, 0).x).toBeCloseTo(180, 10);
    const wide = sceneLayout(800, 400);
    expect(wide.scale).toBeCloseTo(800 / SCENE_WIDTH, 10);
    expect(toBox(wide, 0, SCENE_HEIGHT / 2).y).toBeCloseTo(200, 10);
  });
});
