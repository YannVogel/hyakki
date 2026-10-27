import { BALANCE } from '../balance';
import type { GameState } from '../gameState';
import { type BigNum, mul } from '../numbers';

/** What the player's side deals, derived from the state (upgrades, team, Festival). */
export interface CombatPower {
  readonly heroHitDamage: BigNum;
  readonly tapDamage: BigNum;
  readonly heroIntervalMs: number;
  readonly critChance: number;
  /** Permanent burn on the current enemy, as a fraction of its max HP per second. */
  readonly burnRate: number;
  readonly soulsMultiplier: number;
}

export function combatPower(state: GameState): CombatPower {
  const { blade, foxfire, bell } = state.sanctuary;
  const { upgrades, hero, crit } = BALANCE;
  const heroHitDamage = mul(hero.baseDamage, 1 + upgrades.blade.damagePerLevel * blade);
  return {
    heroHitDamage,
    tapDamage: mul(heroHitDamage, hero.tapMultiplier),
    heroIntervalMs: hero.attackIntervalMs,
    critChance: Math.min(crit.maxChance, crit.baseChance),
    burnRate: upgrades.foxfire.burnPerLevel * foxfire,
    soulsMultiplier: 1 + upgrades.bell.soulsPerLevel * bell,
  };
}
