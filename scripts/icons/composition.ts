import { readFileSync } from 'node:fs';
import path from 'node:path';

import type { Canvas, CanvasKit, Typeface } from 'canvaskit-wasm';

import { type IconComposition, isKanji, type KanjiLayer } from '../../src/render/icon/appIcon';
import { drawNode } from './drawNodes';

const DISPLAY_FONT = path.resolve(__dirname, '../../assets/fonts/MochiyPopOne-Regular.ttf');

export function loadDisplayFont(CK: CanvasKit): Typeface {
  const file = readFileSync(DISPLAY_FONT);
  const typeface = CK.Typeface.MakeTypefaceFromData(
    file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength),
  );
  if (typeface === null) {
    throw new Error('Cannot load the display font');
  }
  return typeface;
}

/** The kanji as a sticker: hard shadow, ink outline, white border, then the fill on top. */
function drawKanji(CK: CanvasKit, canvas: Canvas, typeface: Typeface, layer: KanjiLayer): void {
  const font = new CK.Font(typeface, layer.size);
  const width = font
    .getGlyphWidths(font.getGlyphIDs(layer.text))
    .reduce((total, glyph) => total + glyph, 0);
  const x = layer.x - width / 2;
  const draw = (color: string, dx: number, dy: number, strokeWidth?: number) => {
    const paint = new CK.Paint();
    paint.setAntiAlias(true);
    paint.setColor(CK.parseColorString(color));
    if (strokeWidth !== undefined) {
      paint.setStyle(CK.PaintStyle.Stroke);
      paint.setStrokeWidth(strokeWidth);
      paint.setStrokeJoin(CK.StrokeJoin.Round);
    }
    canvas.drawText(layer.text, x + dx, layer.baseline + dy, paint, font);
    paint.delete();
  };
  const { dx, dy } = layer.shadow;
  draw(layer.outline, dx, dy, layer.outlineWidth);
  draw(layer.outline, dx, dy);
  draw(layer.outline, 0, 0, layer.outlineWidth);
  draw(layer.border, 0, 0, layer.borderWidth);
  draw(layer.fill, 0, 0);
  font.delete();
}

/** Renders an icon composition, laid out in a `frame` × `frame` box, to a `size` px PNG. */
export function renderComposition(
  CK: CanvasKit,
  composition: IconComposition,
  typeface: Typeface,
  frame: number,
  size: number,
): Uint8Array {
  const surface = CK.MakeSurface(size, size);
  if (surface === null) {
    throw new Error(`Cannot create a ${size} px surface`);
  }
  const canvas = surface.getCanvas();
  canvas.clear(CK.TRANSPARENT);
  canvas.scale(size / frame, size / frame);
  canvas.translate(composition.translateX, composition.translateY);
  canvas.scale(composition.scale, composition.scale);
  for (const layer of composition.layers) {
    if (isKanji(layer)) {
      drawKanji(CK, canvas, typeface, layer);
    } else {
      drawNode(CK, canvas, layer);
    }
  }
  const image = surface.makeImageSnapshot();
  const png = image.encodeToBytes();
  image.delete();
  surface.delete();
  if (png === null) {
    throw new Error('PNG encoding failed');
  }
  return png;
}
