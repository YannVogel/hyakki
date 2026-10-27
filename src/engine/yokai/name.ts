import type { YokaiSpec } from './generate';
import { EYES, OBJECTS, ONI_SUFFIX, PALETTES, SUFFIXES } from './parts';

/**
 * Japanese name, the same in every language: `[prefix-]Object-suffix`. The gaze prefix
 * (Hitotsume, Mitsume) wins over the palette's; horned yōkai are always « oni ».
 */
export function nameOf(spec: YokaiSpec): string {
  const prefix =
    EYES.find((eyes) => eyes.id === spec.eyes)?.namePrefix ??
    PALETTES.find((palette) => palette.id === spec.palette)?.namePrefix;
  const object = OBJECTS.find((candidate) => candidate.id === spec.object)?.japanese ?? '';
  const horned = spec.accessories.includes('horns') || spec.accessories.includes('horn');
  const suffix = horned
    ? ONI_SUFFIX
    : (SUFFIXES.find((candidate) => candidate.id === spec.suffix)?.japanese ?? '');
  return `${prefix === undefined ? '' : `${prefix}-`}${object}-${suffix}`;
}
