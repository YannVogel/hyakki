import { createRng, pick, type Random } from '../rng';
import {
  ACCESSORIES,
  ACCESSORY_COUNT_THRESHOLDS,
  type AccessoryId,
  type AccessoryPart,
  EYES,
  type EyesId,
  LIMBS,
  type LimbsId,
  MOUTHS,
  type MouthId,
  type ObjectId,
  type ObjectPart,
  OBJECTS,
  type PaletteId,
  PALETTES,
  type Rarity,
  RARITIES,
  type SuffixId,
  SUFFIXES,
} from './parts';

export const GENERATOR_VERSION = 1;

export interface YokaiSpec {
  readonly seed: number;
  readonly generatorVersion: number;
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

function drawAccessories(random: Random, object: ObjectPart): AccessoryId[] {
  const roll = random();
  const count = ACCESSORY_COUNT_THRESHOLDS.filter((threshold) => roll >= threshold).length;
  let pool: AccessoryPart[] = ACCESSORIES.filter(
    (accessory) => !object.excludedAccessories.includes(accessory.id),
  );
  const drawn: AccessoryId[] = [];
  while (drawn.length < count && pool.length > 0) {
    const [accessory] = pool.splice(Math.floor(random() * pool.length), 1);
    drawn.push(accessory.id);
    pool = pool.filter((candidate) => candidate.id !== accessory.conflictsWith);
  }
  return drawn;
}

function drawRarity(random: Random): Rarity {
  const roll = random();
  const tier = RARITIES.find((candidate) => roll < candidate.drawUpperBound);
  return (tier ?? RARITIES[RARITIES.length - 1]).id;
}

/**
 * The yōkai of a seed. Pure and deterministic; the draw order is a contract shared with the
 * prototype (docs/PROCEDURAL_YOKAI.md § 2): object, eyes, mouth, limbs, accessory count,
 * accessories, rarity, palette, gaze x, gaze y, animation delay, suffix.
 */
export function generate(seed: number): YokaiSpec {
  const random = createRng(seed).next;
  const object = pick(random, OBJECTS);
  const eyes = pick(random, EYES).id;
  const mouth = pick(random, MOUTHS);
  const limbs = pick(
    random,
    LIMBS.filter((limb) => object.hasLegs || !limb.needsLegs),
  ).id;
  const accessories = drawAccessories(random, object);
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
    generatorVersion: GENERATOR_VERSION,
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

/** Number of distinct yōkai the parts can produce (gaze and animation delay aside). */
export function countCombinations(): number {
  const perObject = OBJECTS.reduce((total, object) => {
    const accessories = ACCESSORIES.filter(
      (accessory) => !object.excludedAccessories.includes(accessory.id),
    ).length;
    // None, one, or an unordered pair minus the forbidden horns + horn pair.
    const accessorySets = 1 + accessories + (accessories * (accessories - 1)) / 2 - 1;
    const limbs = LIMBS.filter((limb) => object.hasLegs || !limb.needsLegs).length;
    return total + limbs * accessorySets;
  }, 0);
  return perObject * EYES.length * MOUTHS.length * PALETTES.length;
}
