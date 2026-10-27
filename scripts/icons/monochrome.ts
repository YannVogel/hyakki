// Android 13+ themed icons tint a single-color silhouette. The ink outlines become gaps, so the
// yōkai keeps its eye, mouth and folds once tinted.
const INK_LUMINANCE = 0.2;
const SOFT_EDGE = 0.2;

/** Turns RGBA pixels into a white silhouette whose dark outlines are cut out. */
export function toMonochrome(rgba: Uint8Array): Uint8Array {
  const result = new Uint8Array(rgba.length);
  for (let index = 0; index < rgba.length; index += 4) {
    const luminance =
      (0.2126 * rgba[index] + 0.7152 * rgba[index + 1] + 0.0722 * rgba[index + 2]) / 255;
    const keep = Math.min(1, Math.max(0, (luminance - INK_LUMINANCE) / SOFT_EDGE));
    result.set([255, 255, 255, Math.round(rgba[index + 3] * keep)], index);
  }
  return result;
}
