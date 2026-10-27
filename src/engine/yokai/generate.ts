import { createRng, pick, type Random } from '../rng';
import {
  ACCESSORY_COUNT_THRESHOLDS,
  type AccessoryId,
  type AccessoryPart,
  EYES,
  type EyesId,
  type GeneratorVersion,
  LIMBS,
  type LimbsId,
  MOUTHS,
  type MouthId,
  type ObjectId,
  type ObjectPart,
  type PaletteId,
  PALETTES,
  PARTS,
  type Rarity,
  RARITIES,
  type SuffixId,
  SUFFIXES,
} from './parts';

/** Version of the new parades. Yōkai already met keep the version they were drawn with. */
export const GENERATOR_VERSION: GeneratorVersion = 2;

export interface YokaiSpec {
  readonly seed: number;
  readonly generatorVersion: GeneratorVersion;
  readonly object: ObjectId;
  readonly eyes: EyesId;
  readonly mouth: MouthId;
  readonly limbs: LimbsId;
  readonly accessories: readonly AccessoryId[];
  readonly rarity: Rarity;
  readonly palette: PaletteId;
  /** Pupil offset, x in [-0.9, 0.9] and y in [-0.5, 0.5] (fraction of the eye radius). */
  readonly gaze: { readonly x: number; readonly y: number };
  /** Start offset of the idle animations, in seconds (0 to 3, one decimal). */
  readonly animationDelay: number;
  /** Drawn suffix; horned yōkai are named « oni » anyway (see nameOf). */
  readonly suffix: SuffixId;
}

const roundToTenth = (value: number) => Math.round(value * 10) / 10;

function drawAccessories(
  random: Random,
  object: ObjectPart,
  accessories: readonly AccessoryPart[],
): AccessoryId[] {
  const roll = random();
  const count = ACCESSORY_COUNT_THRESHOLDS.filter((threshold) => roll >= threshold).length;
  let pool: AccessoryPart[] = accessories.filter(
    (accessory) => !object.excludedAccessories.includes(accessory.id),
  );
  const drawn: AccessoryId[] = [];
  while (drawn.length < count && pool.length > 0) {
    const [accessory] = pool.splice(Math.floor(random() * pool.length), 1);
    drawn.push(accessory.id);
    pool = pool.filter((candidate) => !(accessory.conflicts ?? []).includes(candidate.id));
  }
  return drawn;
}

function drawRarity(random: Random): Rarity {
  const roll = random();
  const tier = RARITIES.find((candidate) => roll < candidate.drawUpperBound);
  return (tier ?? RARITIES[RARITIES.length - 1]).id;
}

/**
 * The yōkai of a seed, with the parts of a generator version. Pure and deterministic; the draw
 * order is a contract shared with the prototype (docs/PROCEDURAL_YOKAI.md § 2): object, eyes,
 * mouth, limbs, accessory count, accessories, rarity, palette, gaze x, gaze y, animation delay,
 * suffix. Version 1 is the prototype's.
 */
export function generate(seed: number, version: GeneratorVersion): YokaiSpec {
  const parts = PARTS[version];
  const random = createRng(seed).next;
  const object = pick(random, parts.objects);
  const eyes = pick(random, EYES).id;
  const mouth = pick(random, MOUTHS);
  const limbs = pick(
    random,
    LIMBS.filter((limb) => object.hasLegs || !limb.needsLegs),
  ).id;
  const accessories = drawAccessories(random, object, parts.accessories);
  const rarity = drawRarity(random);
  const palette = pick(
    random,
    PALETTES.filter((candidate) => candidate.rarity === rarity),
  ).id;
  const gazeX = (random() * 2 - 1) * 0.9;
  const gazeY = (random() * 2 - 1) * 0.5;
  const animationDelay = roundToTenth(random() * 3);
  const suffix = pick(random, SUFFIXES).id;

  return {
    seed,
    generatorVersion: version,
    object: object.id,
    eyes,
    mouth,
    limbs,
    accessories,
    rarity,
    palette,
    gaze: { x: gazeX, y: gazeY },
    animationDelay,
    suffix,
  };
}

/** Unordered pairs of accessories the draw can produce (conflicting pairs never meet). */
function accessoryPairs(pool: readonly AccessoryPart[]): number {
  let pairs = 0;
  pool.forEach((first, index) => {
    for (const second of pool.slice(index + 1)) {
      const apart =
        !(first.conflicts ?? []).includes(second.id) &&
        !(second.conflicts ?? []).includes(first.id);
      pairs += apart ? 1 : 0;
    }
  });
  return pairs;
}

/** Number of distinct yōkai a version can produce (gaze and animation delay aside). */
export function countCombinations(version: GeneratorVersion): number {
  const { objects, accessories } = PARTS[version];
  const perObject = objects.reduce((total, object) => {
    const pool = accessories.filter(
      (accessory) => !object.excludedAccessories.includes(accessory.id),
    );
    // None, one, or a pair.
    const accessorySets = 1 + pool.length + accessoryPairs(pool);
    const limbs = LIMBS.filter((limb) => object.hasLegs || !limb.needsLegs).length;
    return total + limbs * accessorySets;
  }, 0);
  return perObject * EYES.length * MOUTHS.length * PALETTES.length;
}
