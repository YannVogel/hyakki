import { BALANCE } from '../balance';
import { type BigNum, mul, pow } from '../numbers';
import { generate, type GeneratorVersion, rarityMultiplier, statsOf } from '../yokai';

export interface YokaiProfile {
  /** Multiplier of the wave's HP: the yōkai's HP stat / 100 (object, traits, rarity). */
  readonly hpFactor: number;
  /** Multiplier of the wave's souls: rarity × (1 + bell bonus). */
  readonly soulsFactor: number;
}

// generate() is pure: the profile of a seed never changes, so it is cached.
const profiles = new Map<string, YokaiProfile>();
const PROFILE_CACHE_SIZE = 1024;

export function yokaiProfile(seed: number, version: GeneratorVersion): YokaiProfile {
  const key = `${version}:${seed}`;
  const cached = profiles.get(key);
  if (cached !== undefined) {
    return cached;
  }
  const spec = generate(seed, version);
  const stats = statsOf(spec);
  const profile = {
    hpFactor: stats.hp / 100,
    soulsFactor: rarityMultiplier(spec) * (1 + stats.soulsBonus),
  };
  if (profiles.size >= PROFILE_CACHE_SIZE) {
    profiles.clear();
  }
  profiles.set(key, profile);
  return profile;
}

/** `12 × 1.165^(wave − 1)`: HP of a yōkai whose HP stat is 100. */
export function waveHp(wave: number): BigNum {
  return mul(BALANCE.enemy.baseHp, pow(BALANCE.enemy.hpGrowth, wave - 1));
}

/** `2 × 1.14^(wave − 1)`: souls of an ordinary yōkai before any bonus. */
export function waveSouls(wave: number): BigNum {
  return mul(BALANCE.souls.base, pow(BALANCE.souls.growth, wave - 1));
}

export function yokaiMaxHp(wave: number, seed: number, version: GeneratorVersion): BigNum {
  return mul(waveHp(wave), yokaiProfile(seed, version).hpFactor);
}
