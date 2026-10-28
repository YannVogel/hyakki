import CanvasKitInit, { type CanvasKit, type Typeface } from 'canvaskit-wasm';

import { type DrawNode, group, shape } from '../../src/render/yokai/nodes';
import { loadDisplayFont, renderComposition } from './composition';

let CK: CanvasKit;
let typeface: Typeface;

beforeAll(async () => {
  CK = await CanvasKitInit();
  typeface = loadDisplayFont(CK);
});

const renderPng = (node: DrawNode, frame: number, size: number) =>
  renderComposition(
    CK,
    { layers: [node], translateX: 0, translateY: 0, scale: 1 },
    typeface,
    frame,
    size,
  );

function pixelAt(png: Uint8Array, x: number, y: number): number[] {
  const image = CK.MakeImageFromEncoded(png);
  if (image === null) {
    throw new Error('Cannot decode the PNG');
  }
  const pixels = image.readPixels(x, y, {
    width: 1,
    height: 1,
    colorType: CK.ColorType.RGBA_8888,
    alphaType: CK.AlphaType.Unpremul,
    colorSpace: CK.ColorSpace.SRGB,
  });
  image.delete();
  return [...(pixels ?? [])];
}

describe('drawNode', () => {
  const square = shape({ kind: 'rect', x: 0, y: 0, width: 10, height: 10 }, { fill: '#ff0000' });

  it('scales the frame to the requested size', () => {
    const png = renderPng(square, 20, 40);
    expect(pixelAt(png, 10, 10)).toEqual([255, 0, 0, 255]);
    expect(pixelAt(png, 30, 30)).toEqual([0, 0, 0, 0]);
  });

  it('applies group translations and scales', () => {
    const moved = group([square], { translateX: 10, translateY: 10, scale: 0.5 });
    const png = renderPng(moved, 20, 20);
    expect(pixelAt(png, 12, 12)).toEqual([255, 0, 0, 255]);
    expect(pixelAt(png, 5, 5)).toEqual([0, 0, 0, 0]);
  });

  it('draws the stroke over the fill', () => {
    const outlined = shape(
      { kind: 'circle', cx: 10, cy: 10, r: 6 },
      { fill: '#ffffff', stroke: '#000000', strokeWidth: 2 },
    );
    const png = renderPng(outlined, 20, 20);
    expect(pixelAt(png, 10, 10)).toEqual([255, 255, 255, 255]);
    expect(pixelAt(png, 16, 10).slice(0, 3)).toEqual([0, 0, 0]);
  });
});
