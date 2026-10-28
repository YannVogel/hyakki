import { frameCover, SCENE_HEIGHT, SCENE_WIDTH, sceneLayout, toBox } from './layout';

describe('scene layout', () => {
  it('covers the box and keeps the scene centered (slice)', () => {
    const tall = sceneLayout(360, 600);
    expect(tall.scale).toBeCloseTo(600 / SCENE_HEIGHT, 10);
    expect(tall.offsetY).toBeCloseTo(0, 10);
    expect(toBox(tall, SCENE_WIDTH / 2, 0).x).toBeCloseTo(180, 10);
    const wide = sceneLayout(800, 400);
    expect(wide.scale).toBeCloseTo(800 / SCENE_WIDTH, 10);
    expect(toBox(wide, 0, SCENE_HEIGHT / 2).y).toBeCloseTo(200, 10);
  });

  it('covers the frame with a square image, cropping its sides', () => {
    const layout = sceneLayout(SCENE_WIDTH, SCENE_HEIGHT);
    const cover = frameCover(layout, 1254, 1254);
    expect(cover.width).toBeCloseTo(SCENE_HEIGHT, 10);
    expect(cover.height).toBeCloseTo(SCENE_HEIGHT, 10);
    expect(cover.left).toBeCloseTo((SCENE_WIDTH - SCENE_HEIGHT) / 2, 10);
    expect(cover.top).toBeCloseTo(0, 10);
  });

  it('keeps an image in the frame, whatever the box', () => {
    const layout = sceneLayout(360, 600);
    const cover = frameCover(layout, 1254, 1254);
    const feet = toBox(layout, 0, 302).y;
    // The ground of the image (at 302 / 400 of its height) stays under the fighters' feet.
    expect(cover.top + (cover.height * 302) / SCENE_HEIGHT).toBeCloseTo(feet, 10);
    expect(cover.left).toBeLessThanOrEqual(0);
    expect(cover.left + cover.width).toBeGreaterThanOrEqual(360);
    expect(cover.top).toBeLessThanOrEqual(0);
    expect(cover.top + cover.height).toBeGreaterThanOrEqual(600);
  });
});
