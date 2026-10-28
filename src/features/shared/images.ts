import type { ImageSourcePropType } from 'react-native';

// Illustrations of the hero and the guardians (assets/images, docs/ART_PIPELINE.md).

export interface Illustration {
  readonly source: ImageSourcePropType;
  /** Size of the PNG, in pixels. */
  readonly width: number;
  readonly height: number;
}

// The poses are cut from one sheet at one scale, each to its own size; every figure stands on
// its bottom edge (6 to 7 px of margin under the feet, see scripts/check_figures.py).
export const HERO_POSES = {
  idle: {
    source: require('../../../assets/images/hero/hero-01-idle.png'),
    width: 257,
    height: 449,
  },
  attack: {
    source: require('../../../assets/images/hero/hero-02-attaque.png'),
    width: 363,
    height: 422,
  },
  fire: { source: require('../../../assets/images/hero/hero-03-feu.png'), width: 319, height: 435 },
  thunder: {
    source: require('../../../assets/images/hero/hero-04-foudre.png'),
    width: 283,
    height: 461,
  },
  barrier: {
    source: require('../../../assets/images/hero/hero-05-barriere.png'),
    width: 221,
    height: 446,
  },
  hit: {
    source: require('../../../assets/images/hero/hero-06-touche.png'),
    width: 293,
    height: 441,
  },
  knockedOut: {
    source: require('../../../assets/images/hero/hero-07-ko.png'),
    width: 384,
    height: 332,
  },
  victory: {
    source: require('../../../assets/images/hero/hero-08-victoire.png'),
    width: 311,
    height: 415,
  },
  sleep: {
    source: require('../../../assets/images/hero/hero-09-sommeil.png'),
    width: 289,
    height: 386,
  },
  surprised: {
    source: require('../../../assets/images/hero/hero-10-surpris.png'),
    width: 315,
    height: 443,
  },
} satisfies Record<string, Illustration>;

export type HeroPose = keyof typeof HERO_POSES;

/**
 * Size of a pose drawn at the scale that makes the idle pose `idleHeight` tall: every pose keeps
 * its proportions, and anchoring the bottom edge keeps the feet in place.
 */
export function heroPoseSize(pose: HeroPose, idleHeight: number) {
  const scale = idleHeight / HERO_POSES.idle.height;
  return { width: HERO_POSES[pose].width * scale, height: HERO_POSES[pose].height * scale };
}

/** The ten guardians, in order of appearance. */
export const GUARDIAN_IMAGES: readonly ImageSourcePropType[] = [
  require('../../../assets/images/bosses/boss-01-bake-danuki.png'),
  require('../../../assets/images/bosses/boss-02-kappa.png'),
  require('../../../assets/images/bosses/boss-03-karasu-tengu.png'),
  require('../../../assets/images/bosses/boss-04-tsuchigumo.png'),
  require('../../../assets/images/bosses/boss-05-yuki-onna.png'),
  require('../../../assets/images/bosses/boss-06-gashadokuro.png'),
  require('../../../assets/images/bosses/boss-07-nue.png'),
  require('../../../assets/images/bosses/boss-08-ibaraki-doji.png'),
  require('../../../assets/images/bosses/boss-09-kyubi.png'),
  require('../../../assets/images/bosses/boss-10-nurarihyon.png'),
];

const BACKDROP_SIZE = { width: 1254, height: 1254 };

/**
 * Battle backdrops (docs/ART_PIPELINE.md, « Décors »): the parade's for the ordinary waves, then
 * one per guardian, in order of appearance. Square, they cover the scene frame.
 */
export const BATTLE_BACKDROPS: {
  readonly parade: Illustration;
  readonly guardians: readonly Illustration[];
} = {
  parade: {
    source: require('../../../assets/images/backdrops/combat-00-parade.webp'),
    ...BACKDROP_SIZE,
  },
  guardians: [
    require('../../../assets/images/backdrops/combat-01-bake-danuki.webp'),
    require('../../../assets/images/backdrops/combat-02-kappa.webp'),
    require('../../../assets/images/backdrops/combat-03-karasu-tengu.webp'),
    require('../../../assets/images/backdrops/combat-04-tsuchigumo.webp'),
    require('../../../assets/images/backdrops/combat-05-yuki-onna.webp'),
    require('../../../assets/images/backdrops/combat-06-gashadokuro.webp'),
    require('../../../assets/images/backdrops/combat-07-nue.webp'),
    require('../../../assets/images/backdrops/combat-08-ibaraki-doji.webp'),
    require('../../../assets/images/backdrops/combat-09-kyubi.webp'),
    require('../../../assets/images/backdrops/combat-10-nurarihyon.webp'),
  ].map((source: ImageSourcePropType) => ({ source, ...BACKDROP_SIZE })),
};

/** Header of the Festival screen; the hero is drawn over its bottom left. */
export const FESTIVAL_HEADER: Illustration = {
  source: require('../../../assets/images/backdrops/festival-header.webp'),
  width: 1200,
  height: 800,
};
