import { BALANCE } from '../balance';
import type { GameState } from '../gameState';
import { type BigNum, mul } from '../numbers';
import { shikigamiHitRatio, shikigamiIntervalMs, teamBonus } from '../shikigami';

export interface TeamAttacker {
  readonly seed: number;
  readonly hitDamage: BigNum;
  readonly intervalMs: number;
}

/** What the player's side deals, derived from the state (upgrades, team, Festival). */
export interface CombatPower {
  readonly heroHitDamage: BigNum;
  readonly tapDamage: BigNum;
  readonly heroIntervalMs: number;
  /** Active team members, in team order. */
  readonly team: readonly TeamAttacker[];
  readonly critChance: number;
  /** Permanent burn on the current enemy, as a fraction of its max HP per second. */
  readonly burnRate: number;
  readonly soulsMultiplier: number;
}

/**
 * Bonuses of different sources multiply (Sanctuary × team); bonuses of one source add up.
 * Intervals stay whole milliseconds so that attack timings do not drift.
 */
export function combatPower(state: GameState): CombatPower {
  const { blade, foxfire, bell } = state.sanctuary;
  const { upgrades, hero, crit } = BALANCE;
  const bonus = teamBonus(state.team);
  const speed = 1 + bonus.speed;
  const heroHitDamage = mul(
    hero.baseDamage,
    (1 + upgrades.blade.damagePerLevel * blade) * (1 + bonus.attack),
  );
  const team = state.team.map((seed) => {
    const level = state.shikigami.find((shikigami) => shikigami.seed === seed)?.level ?? 1;
    return {
      seed,
      hitDamage: mul(heroHitDamage, shikigamiHitRatio(seed, level)),
      intervalMs: Math.max(1, Math.round(shikigamiIntervalMs(seed) / speed)),
    };
  });
  return {
    heroHitDamage,
    tapDamage: mul(heroHitDamage, hero.tapMultiplier),
    heroIntervalMs: Math.max(1, Math.round(hero.attackIntervalMs / speed)),
    team,
    critChance: Math.min(crit.maxChance, crit.baseChance + bonus.crit),
    burnRate: upgrades.foxfire.burnPerLevel * foxfire + bonus.burn,
    soulsMultiplier: (1 + upgrades.bell.soulsPerLevel * bell) * (1 + bonus.souls),
  };
}
