// Part lists of generator V1. The order of every list is part of the draw contract
// (docs/PROCEDURAL_YOKAI.md § 2): never reorder, insert or remove an entry.

export type StatId = 'hp' | 'attack' | 'defense' | 'speed';
export type BaseStats = Readonly<Record<StatId, number>>;

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export type ObjectId = 'lantern' | 'umbrella' | 'teapot' | 'drum' | 'geta' | 'scroll';
export type EyesId = 'cyclops' | 'pair' | 'wink' | 'three' | 'sly' | 'dots' | 'slit' | 'big';
export type MouthId = 'grin' | 'fangs' | 'tongue' | 'o' | 'wavy' | 'teeth';
export type LimbsId = 'none' | 'leg' | 'legs' | 'arms';
export type AccessoryId =
  'horns' | 'horn' | 'onibi' | 'ofuda' | 'cracks' | 'hachimaki' | 'bell' | 'bandage';
export type PaletteId =
  'paper' | 'wood' | 'lacquer' | 'celadon' | 'indigo' | 'sakura' | 'spectral' | 'gold';
export type SuffixId = 'obake' | 'bo' | 'kozo' | 'nyudo';

export interface ObjectPart {
  readonly id: ObjectId;
  /** Japanese name, used in the yōkai's name. */
  readonly japanese: string;
  readonly stats: BaseStats;
  readonly hasLegs: boolean;
  readonly excludedAccessories: readonly AccessoryId[];
}

export const OBJECTS: readonly ObjectPart[] = [
  {
    id: 'lantern',
    japanese: 'Chōchin',
    stats: { hp: 100, attack: 90, defense: 80, speed: 110 },
    hasLegs: true,
    excludedAccessories: [],
  },
  {
    id: 'umbrella',
    japanese: 'Kasa',
    stats: { hp: 80, attack: 100, defense: 70, speed: 130 },
    hasLegs: true,
    excludedAccessories: ['hachimaki'],
  },
  {
    id: 'teapot',
    japanese: 'Dobin',
    stats: { hp: 140, attack: 80, defense: 110, speed: 60 },
    hasLegs: true,
    excludedAccessories: [],
  },
  {
    id: 'drum',
    japanese: 'Taiko',
    stats: { hp: 130, attack: 100, defense: 100, speed: 70 },
    hasLegs: true,
    excludedAccessories: [],
  },
  {
    id: 'geta',
    japanese: 'Geta',
    stats: { hp: 90, attack: 120, defense: 90, speed: 100 },
    hasLegs: false,
    excludedAccessories: ['hachimaki'],
  },
  {
    id: 'scroll',
    japanese: 'Makimono',
    stats: { hp: 85, attack: 90, defense: 75, speed: 120 },
    hasLegs: true,
    excludedAccessories: [],
  },
];

export interface EyesPart {
  readonly id: EyesId;
  /** Name prefix given by the gaze (Hitotsume, Mitsume), which wins over the palette's. */
  readonly namePrefix?: string;
}

export const EYES: readonly EyesPart[] = [
  { id: 'cyclops', namePrefix: 'Hitotsume' },
  { id: 'pair' },
  { id: 'wink' },
  { id: 'three', namePrefix: 'Mitsume' },
  { id: 'sly' },
  { id: 'dots' },
  { id: 'slit', namePrefix: 'Hitotsume' },
  { id: 'big' },
];

export const MOUTHS: readonly MouthId[] = ['grin', 'fangs', 'tongue', 'o', 'wavy', 'teeth'];

export interface LimbsPart {
  readonly id: LimbsId;
  readonly needsLegs: boolean;
}

export const LIMBS: readonly LimbsPart[] = [
  { id: 'none', needsLegs: false },
  { id: 'leg', needsLegs: true },
  { id: 'legs', needsLegs: true },
  { id: 'arms', needsLegs: false },
];

export interface AccessoryPart {
  readonly id: AccessoryId;
  readonly conflictsWith?: AccessoryId;
}

export const ACCESSORIES: readonly AccessoryPart[] = [
  { id: 'horns', conflictsWith: 'horn' },
  { id: 'horn', conflictsWith: 'horns' },
  { id: 'onibi' },
  { id: 'ofuda' },
  { id: 'cracks' },
  { id: 'hachimaki' },
  { id: 'bell' },
  { id: 'bandage' },
];

/** Accessory count draw: 0 below 0.35, 1 below 0.8, else 2. */
export const ACCESSORY_COUNT_THRESHOLDS = [0.35, 0.8] as const;

export interface PalettePart {
  readonly id: PaletteId;
  readonly rarity: Rarity;
  /** Name prefix (Aka, Ao, Kon…); none for paper and wood. */
  readonly namePrefix?: string;
}

export const PALETTES: readonly PalettePart[] = [
  { id: 'paper', rarity: 'common' },
  { id: 'wood', rarity: 'common' },
  { id: 'lacquer', rarity: 'common', namePrefix: 'Aka' },
  { id: 'celadon', rarity: 'common', namePrefix: 'Ao' },
  { id: 'indigo', rarity: 'rare', namePrefix: 'Kon' },
  { id: 'sakura', rarity: 'rare', namePrefix: 'Sakura' },
  { id: 'spectral', rarity: 'epic', namePrefix: 'Yūrei' },
  { id: 'gold', rarity: 'legendary', namePrefix: 'Kin' },
];

export interface RarityTier {
  readonly id: Rarity;
  /** The tier is drawn when the roll is below this bound (and above the previous tier's). */
  readonly drawUpperBound: number;
  /** Multiplier applied to every stat. */
  readonly statMultiplier: number;
}

// Explicit bounds rather than summed probabilities: 0.04 + 0.11 is not exactly 0.15 in floats.
// Probabilities: legendary 4 %, epic 11 %, rare 25 %, common 60 %.
export const RARITIES: readonly RarityTier[] = [
  { id: 'legendary', drawUpperBound: 0.04, statMultiplier: 2.2 },
  { id: 'epic', drawUpperBound: 0.15, statMultiplier: 1.6 },
  { id: 'rare', drawUpperBound: 0.4, statMultiplier: 1.25 },
  { id: 'common', drawUpperBound: 1, statMultiplier: 1 },
];

export const SUFFIXES: readonly { readonly id: SuffixId; readonly japanese: string }[] = [
  { id: 'obake', japanese: 'obake' },
  { id: 'bo', japanese: 'bō' },
  { id: 'kozo', japanese: 'kozō' },
  { id: 'nyudo', japanese: 'nyūdō' },
];

/** Suffix of every horned yōkai, whatever the draw. */
export const ONI_SUFFIX = 'oni';
