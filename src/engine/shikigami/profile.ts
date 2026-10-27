import { BALANCE } from '../balance';
import { generate, statsOf, type YokaiStats } from '../yokai';

const statsCache = new Map<number, YokaiStats>();
const STATS_CACHE_SIZE = 1024;

/** Stats of a shikigami's yōkai (pure, cached by seed). */
export function shikigamiStats(seed: number): YokaiStats {
  const cached = statsCache.get(seed);
  if (cached !== undefined) {
    return cached;
  }
  const stats = statsOf(generate(seed));
  if (statsCache.size >= STATS_CACHE_SIZE) {
    statsCache.clear();
  }
  statsCache.set(seed, stats);
  return stats;
}

/** Time between two attacks: faster yōkai attack more often. */
export function shikigamiIntervalMs(seed: number): number {
  return Math.round((BALANCE.shikigami.baseIntervalMs * 100) / shikigamiStats(seed).speed);
}

/** Multiplier of the hero's hit for one hit of this shikigami. */
export function shikigamiHitRatio(seed: number, level: number): number {
  const { damageRatio, damagePerLevel } = BALANCE.shikigami;
  return damageRatio * (shikigamiStats(seed).attack / 100) * (1 + damagePerLevel * (level - 1));
}

export interface TeamBonus {
  /** Fractions: 0.2 = +20 %. */
  readonly attack: number;
  readonly speed: number;
  readonly crit: number;
  readonly souls: number;
  /** Fraction of the enemy's max HP per second. */
  readonly burn: number;
}

/** Sum of the offensive traits of the team (HP and defense traits only matter for enemies). */
export function teamBonus(seeds: readonly number[]): TeamBonus {
  const bonus = { attack: 0, speed: 0, crit: 0, souls: 0, burn: 0 };
  for (const seed of seeds) {
    for (const effect of shikigamiStats(seed).traits.flatMap((trait) => trait.effects)) {
      if (effect.kind === 'stat' && effect.stat === 'attack') {
        bonus.attack += effect.value;
      } else if (effect.kind === 'stat' && effect.stat === 'speed') {
        bonus.speed += effect.value;
      } else if (effect.kind === 'crit' || effect.kind === 'souls' || effect.kind === 'burn') {
        bonus[effect.kind] += effect.value;
      }
    }
  }
  return bonus;
}
