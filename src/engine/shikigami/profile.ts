import { BALANCE } from '../balance';
import { big, type BigNum } from '../numbers';
import type { Shikigami } from '../gameState';
import { generate, statsOf, type YokaiStats } from '../yokai';

/** What identifies a shikigami's look: its seed, drawn with the generator of its capture. */
export type ShikigamiLook = Pick<Shikigami, 'seed' | 'generatorVersion'>;

const statsCache = new Map<string, YokaiStats>();
const STATS_CACHE_SIZE = 1024;

/** Stats of a shikigami's yōkai (pure, cached). */
export function shikigamiStats({ seed, generatorVersion }: ShikigamiLook): YokaiStats {
  const key = `${generatorVersion}:${seed}`;
  const cached = statsCache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  const stats = statsOf(generate(seed, generatorVersion));
  if (statsCache.size >= STATS_CACHE_SIZE) {
    statsCache.clear();
  }
  statsCache.set(key, stats);
  return stats;
}

/** Time between two attacks: faster yōkai attack more often. */
export function shikigamiIntervalMs(shikigami: ShikigamiLook): number {
  return Math.round((BALANCE.shikigami.baseIntervalMs * 100) / shikigamiStats(shikigami).speed);
}

/** Multiplier of the hero's hit for one hit of this shikigami. */
export function shikigamiHitRatio(shikigami: Shikigami): BigNum {
  const { damageRatio, damagePerLevel } = BALANCE.shikigami;
  return big(
    damageRatio *
      (shikigamiStats(shikigami).attack / 100) *
      (1 + damagePerLevel * (shikigami.level - 1)),
  );
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
export function teamBonus(members: readonly ShikigamiLook[]): TeamBonus {
  const bonus = { attack: 0, speed: 0, crit: 0, souls: 0, burn: 0 };
  for (const member of members) {
    for (const effect of shikigamiStats(member).traits.flatMap((trait) => trait.effects)) {
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
