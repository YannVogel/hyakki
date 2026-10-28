import CanvasKitInit, { type CanvasKit, type Typeface } from 'canvaskit-wasm';

import { colors } from '../../src/ui/tokens';
import type { IconComposition, KanjiLayer } from '../../src/render/icon/appIcon';
import { shape } from '../../src/render/yokai/nodes';
import { loadDisplayFont, renderComposition } from './composition';

let CK: CanvasKit;
let typeface: Typeface;

beforeAll(async () => {
  CK = await CanvasKitInit();
  typeface = loadDisplayFont(CK);
});

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

const rgb = (hex: string) => [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));

describe('renderComposition', () => {
  const square = shape({ kind: 'rect', x: 0, y: 0, width: 10, height: 10 }, { fill: '#ff0000' });

  it('places the layers with the composition translation and scale', () => {
    const composition: IconComposition = {
      layers: [square],
      translateX: 10,
      translateY: 10,
      scale: 0.5,
    };
    const png = renderComposition(CK, composition, typeface, 20, 20);
    expect(pixelAt(png, 12, 12)).toEqual([255, 0, 0, 255]);
    expect(pixelAt(png, 5, 5)).toEqual([0, 0, 0, 0]);
  });

  it('draws the kanji as a sticker: fill inside, white border, then ink outline', () => {
    // A horizontal stroke of 一, centered on x = 100: the fill sits on its axis, the white border
    // just above it and the ink outline further out.
    const kanji: KanjiLayer = {
      kind: 'kanji',
      text: '一',
      size: 160,
      x: 100,
      baseline: 100,
      fill: colors.yellow,
      border: colors.paper,
      borderWidth: 20,
      outline: colors.ink,
      outlineWidth: 40,
      shadow: { dx: 0, dy: 0 },
    };
    const composition: IconComposition = {
      layers: [kanji],
      translateX: 0,
      translateY: 0,
      scale: 1,
    };
    const png = renderComposition(CK, composition, typeface, 200, 200);
    const column = Array.from({ length: 200 }, (_, y) => pixelAt(png, 100, y));
    const top = column.findIndex(([, , , alpha]) => alpha === 255);
    const fillRow = column.findIndex(
      (pixel) => pixel.slice(0, 3).join() === rgb(colors.yellow).join(),
    );
    expect(top).toBeGreaterThan(0);
    expect(column[top + 2]?.slice(0, 3)).toEqual(rgb(colors.ink));
    expect(
      column
        .slice(top, fillRow)
        .some((pixel) => pixel.slice(0, 3).join() === rgb(colors.paper).join()),
    ).toBe(true);
    expect(fillRow).toBeGreaterThan(top);
  });
});
