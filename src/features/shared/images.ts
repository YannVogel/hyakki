import type { ImageSourcePropType } from 'react-native';

// Illustrations of the hero and the guardians (assets/images, docs/ART_PIPELINE.md).

export const HERO_POSES = {
  idle: require('../../../assets/images/hero/hero-01-idle.png'),
  attack: require('../../../assets/images/hero/hero-02-attaque.png'),
  fire: require('../../../assets/images/hero/hero-03-feu.png'),
  thunder: require('../../../assets/images/hero/hero-04-foudre.png'),
  barrier: require('../../../assets/images/hero/hero-05-barriere.png'),
  hit: require('../../../assets/images/hero/hero-06-touche.png'),
  knockedOut: require('../../../assets/images/hero/hero-07-ko.png'),
  victory: require('../../../assets/images/hero/hero-08-victoire.png'),
  sleep: require('../../../assets/images/hero/hero-09-sommeil.png'),
  surprised: require('../../../assets/images/hero/hero-10-surpris.png'),
} satisfies Record<string, ImageSourcePropType>;

export type HeroPose = keyof typeof HERO_POSES;

/** Width / height of the hero poses (the cut-out figures share one size). */
export const HERO_ASPECT = 257 / 449;

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
