// The battle scene frame of the combat mockup (design/mockups/Main.dc.html): 366 × 400. Fighters,
// effects and the illustrated backdrop are placed in it, then the frame covers the scene box.

export const SCENE_WIDTH = 366;
export const SCENE_HEIGHT = 400;

export interface SceneLayout {
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

/** Fits the scene into a box like CSS `xMidYMid slice`: cover the box, keep the center. */
export function sceneLayout(width: number, height: number): SceneLayout {
  const scale = Math.max(width / SCENE_WIDTH, height / SCENE_HEIGHT);
  return {
    scale,
    offsetX: (width - SCENE_WIDTH * scale) / 2,
    offsetY: (height - SCENE_HEIGHT * scale) / 2,
  };
}

/** A point of the scene frame, in the box's points. */
export const toBox = (layout: SceneLayout, x: number, y: number) => ({
  x: layout.offsetX + x * layout.scale,
  y: layout.offsetY + y * layout.scale,
});

/**
 * Where to draw an image of `width × height` pixels so that it covers the scene frame, centered:
 * its ground lines up with the fighters' feet, whatever the box.
 */
export function frameCover(layout: SceneLayout, width: number, height: number) {
  const scale = Math.max(SCENE_WIDTH / width, SCENE_HEIGHT / height);
  const topLeft = toBox(
    layout,
    (SCENE_WIDTH - width * scale) / 2,
    (SCENE_HEIGHT - height * scale) / 2,
  );
  return {
    left: topLeft.x,
    top: topLeft.y,
    width: width * scale * layout.scale,
    height: height * scale * layout.scale,
  };
}
