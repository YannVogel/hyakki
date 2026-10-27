// Renders the app icon set (#40) from the vector compositions of src/render/icon to
// assets/images/app/. Usage: npx tsx scripts/render-icons.ts [preview-dir]
// With a preview directory, also writes the icon at launcher sizes to check its legibility.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import CanvasKitInit, { type CanvasKit } from 'canvaskit-wasm';

import {
  adaptiveBackground,
  adaptiveForeground,
  appIcon,
  ICON_FRAME,
  splashLogo,
} from '../src/render/icon/appIcon';
import { renderPng } from './icons/drawNodes';
import { toMonochrome } from './icons/monochrome';

const SIZE = 1024;
const PREVIEW_SIZES = [48, 96, 180];
const outputDir = path.resolve(__dirname, '../assets/images/app');

function monochromePng(CK: CanvasKit, png: Uint8Array): Uint8Array {
  const image = CK.MakeImageFromEncoded(png);
  const info = {
    width: SIZE,
    height: SIZE,
    colorType: CK.ColorType.RGBA_8888,
    alphaType: CK.AlphaType.Unpremul,
    colorSpace: CK.ColorSpace.SRGB,
  };
  const pixels = image?.readPixels(0, 0, info);
  if (
    image === null ||
    pixels === null ||
    pixels === undefined ||
    !(pixels instanceof Uint8Array)
  ) {
    throw new Error('Cannot read the foreground pixels');
  }
  image.delete();
  const silhouette = CK.MakeImage(info, toMonochrome(pixels), SIZE * 4);
  const result = silhouette?.encodeToBytes();
  silhouette?.delete();
  if (result === null || result === undefined) {
    throw new Error('Cannot encode the monochrome icon');
  }
  return result;
}

async function main(): Promise<void> {
  const CK = await CanvasKitInit();
  const foreground = renderPng(CK, adaptiveForeground(), ICON_FRAME, SIZE);
  const files: Record<string, Uint8Array> = {
    'icon.png': renderPng(CK, appIcon(), ICON_FRAME, SIZE),
    'android-icon-foreground.png': foreground,
    'android-icon-background.png': renderPng(CK, adaptiveBackground(), ICON_FRAME, SIZE),
    'android-icon-monochrome.png': monochromePng(CK, foreground),
    'splash-icon.png': renderPng(CK, splashLogo(), ICON_FRAME, SIZE),
  };
  for (const [name, png] of Object.entries(files)) {
    writeFileSync(path.join(outputDir, name), png);
  }
  console.log(`${Object.keys(files).length} images écrites dans ${outputDir}`);

  const previewDir = process.argv[2];
  if (previewDir !== undefined) {
    mkdirSync(previewDir, { recursive: true });
    for (const size of PREVIEW_SIZES) {
      writeFileSync(
        path.join(previewDir, `icon-${size}.png`),
        renderPng(CK, appIcon(), ICON_FRAME, size),
      );
    }
  }
}

void main();
