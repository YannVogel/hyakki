import type { ImageSourcePropType } from 'react-native';

// Illustrations of the hero, the guardians, the backdrops and the ofuda (assets/images,
// docs/ART_PIPELINE.md).

export interface Illustration {
  readonly source: ImageSourcePropType;
  /** Size of the PNG, in pixels. */
  readonly width: number;
  readonly height: number;
}

// The poses share one scale (scripts/scale_poses.py), each cut to its own size; every figure stands
// on its bottom edge (5 to 7 px of margin under the feet, see scripts/check_figures.py).
export const HERO_POSES = {
  idle: {
    source: require('../../../assets/images/hero/hero-01-idle.png'),
    width: 707,
    height: 1310,
  },
  attack: {
    source: require('../../../assets/images/hero/hero-02-attaque.png'),
    width: 937,
    height: 1231,
  },
  fire: {
    source: require('../../../assets/images/hero/hero-03-feu.png'),
    width: 931,
    height: 1269,
  },
  thunder: {
    source: require('../../../assets/images/hero/hero-04-foudre.png'),
    width: 845,
    height: 1345,
  },
  barrier: {
    source: require('../../../assets/images/hero/hero-05-barriere.png'),
    width: 636,
    height: 1301,
  },
  hit: {
    source: require('../../../assets/images/hero/hero-06-touche.png'),
    width: 869,
    height: 1287,
  },
  knockedOut: {
    source: require('../../../assets/images/hero/hero-07-ko.png'),
    width: 1366,
    height: 969,
  },
  victory: {
    source: require('../../../assets/images/hero/hero-08-victoire.png'),
    width: 789,
    height: 1211,
  },
  sleep: {
    source: require('../../../assets/images/hero/hero-09-sommeil.png'),
    width: 800,
    height: 1126,
  },
  surprised: {
    source: require('../../../assets/images/hero/hero-10-surpris.png'),
    width: 895,
    height: 1292,
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

/** The ofuda currency, drawn in ChatGPT (#103): a square of 3 × its largest display size. */
export const OFUDA_IMAGE: Illustration = {
  source: require('../../../assets/images/icons/ofuda.png'),
  width: 144,
  height: 144,
};
