// Google Play graphics (#46): the 512 px icon and the 1024 × 500 feature graphic, drawn like the app
// icon (CanvasKit, the game's fonts and real yōkai). Usage: npx tsx scripts/render-store-graphics.ts
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import CanvasKitInit, { type Canvas, type CanvasKit } from 'canvaskit-wasm';

import { generate, GENERATOR_VERSION } from '../src/engine';
import { appIcon, ICON_FRAME } from '../src/render/icon/appIcon';
import { drawYokai, YOKAI_FRAME } from '../src/render/yokai/drawYokai';
import { group, shape } from '../src/render/yokai/nodes';
import { colors } from '../src/ui/tokens';
import { drawNode, renderPng } from './icons/drawNodes';

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'store-captures/google-play');
const WIDTH = 1024;
const HEIGHT = 500;
// Seeds of the parade shown on the banner (generator of the new parades).
const PARADE = [
  { seed: 4, x: 500, y: 250, scale: 0.95 },
  { seed: 31, x: 650, y: 215, scale: 1.05 },
  { seed: 77, x: 800, y: 250, scale: 0.95 },
  { seed: 12, x: 930, y: 285, scale: 0.8 },
];

function scenery() {
  return group([
    shape({ kind: 'rect', x: 0, y: 0, width: WIDTH, height: HEIGHT }, { fill: colors.sky }),
    shape(
      { kind: 'circle', cx: 940, cy: 80, r: 52 },
      { fill: colors.sun, stroke: colors.ink, strokeWidth: 5 },
    ),
    shape(
      { kind: 'path', d: 'M-10 380 Q 250 330 520 370 Q 780 320 1034 360 L 1034 510 L -10 510 Z' },
      { fill: colors.grass, stroke: colors.ink, strokeWidth: 5, strokeLinejoin: 'round' },
    ),
    shape(
      { kind: 'path', d: 'M-10 440 Q 300 410 560 436 Q 800 410 1034 430 L 1034 510 L -10 510 Z' },
      { fill: colors.grassDeep, stroke: colors.ink, strokeWidth: 5, strokeLinejoin: 'round' },
    ),
  ]);
}

function outlinedText(
  CK: CanvasKit,
  canvas: Canvas,
  text: string,
  x: number,
  y: number,
  size: number,
) {
  const file = readFileSync(path.join(ROOT, 'assets/fonts/MochiyPopOne-Regular.ttf'));
  const typeface = CK.Typeface.MakeTypefaceFromData(
    file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength),
  );
  if (typeface === null) {
    throw new Error('Cannot load the display font');
  }
  const font = new CK.Font(typeface, size);
  const stroke = new CK.Paint();
  stroke.setAntiAlias(true);
  stroke.setStyle(CK.PaintStyle.Stroke);
  stroke.setStrokeWidth(size / 8);
  stroke.setStrokeJoin(CK.StrokeJoin.Round);
  stroke.setColor(CK.parseColorString(colors.ink));
  const fill = new CK.Paint();
  fill.setAntiAlias(true);
  fill.setColor(CK.parseColorString(colors.paper));
  canvas.drawText(text, x, y + size * 0.08, stroke, font);
  canvas.drawText(text, x, y, stroke, font);
  canvas.drawText(text, x, y, fill, font);
}

function featureGraphic(CK: CanvasKit): Uint8Array {
  const surface = CK.MakeSurface(WIDTH, HEIGHT);
  if (surface === null) {
    throw new Error('Cannot create the feature graphic surface');
  }
  const canvas = surface.getCanvas();
  drawNode(CK, canvas, scenery());
  const hero = CK.MakeImageFromEncoded(
    readFileSync(path.join(ROOT, 'assets/images/hero/hero-02-attaque.png')),
  );
  if (hero !== null) {
    const height = 300;
    const width = (hero.width() / hero.height()) * height;
    canvas.drawImageRect(
      hero,
      CK.XYWHRect(0, 0, hero.width(), hero.height()),
      CK.XYWHRect(250, HEIGHT - height - 30, width, height),
      new CK.Paint(),
    );
  }
  for (const { seed, x, y, scale } of PARADE) {
    const half = (YOKAI_FRAME / 2) * scale;
    drawNode(
      CK,
      canvas,
      group([drawYokai(generate(seed, GENERATOR_VERSION))], {
        translateX: x - half,
        translateY: y - half,
        scale,
      }),
    );
  }
  outlinedText(CK, canvas, 'Hyakki', 40, 150, 110);
  outlinedText(CK, canvas, '百鬼夜行', 48, 215, 42);
  const image = surface.makeImageSnapshot();
  const png = image.encodeToBytes();
  if (png === null) {
    throw new Error('PNG encoding failed');
  }
  return png;
}

async function main(): Promise<void> {
  const CK = await CanvasKitInit();
  mkdirSync(OUTPUT, { recursive: true });
  writeFileSync(path.join(OUTPUT, 'icone-512.png'), renderPng(CK, appIcon(), ICON_FRAME, 512));
  writeFileSync(path.join(OUTPUT, 'presentation-1024x500.png'), featureGraphic(CK));
  console.log(`Images Google Play écrites dans ${OUTPUT}`);
}

void main();
