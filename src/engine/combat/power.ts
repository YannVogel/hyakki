import { BALANCE } from '../balance';
import type { GameState } from '../gameState';
import { type BigNum, mul, pow } from '../numbers';
import { festivalBonus } from '../prestige';
import { shikigamiHitRatio, shikigamiIntervalMs, teamBonus, teamMembers } from '../shikigami';

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
 * Bonuses of different sources multiply (Sanctuary × team × Festival); bonuses of one source add up.
 * Intervals stay whole milliseconds so that attack timings do not drift.
 */
export function combatPower(state: GameState): CombatPower {
  const { blade, foxfire, bell } = state.sanctuary;
  const { upgrades, hero, crit } = BALANCE;
  const members = teamMembers(state);
  const bonus = teamBonus(members);
  const speed = 1 + bonus.speed;
  const festival = festivalBonus(state.sparks);
  const heroHitDamage = mul(
    pow(upgrades.blade.damageGrowth, blade),
    hero.baseDamage * (1 + bonus.attack) * festival,
  );
  const team = members.map((member) => ({
    seed: member.seed,
    hitDamage: mul(heroHitDamage, shikigamiHitRatio(member)),
    intervalMs: Math.max(1, Math.round(shikigamiIntervalMs(member) / speed)),
  }));
  return {
    heroHitDamage,
    tapDamage: mul(heroHitDamage, hero.tapMultiplier),
    heroIntervalMs: Math.max(1, Math.round(hero.attackIntervalMs / speed)),
    team,
    critChance: Math.min(crit.maxChance, crit.baseChance + bonus.crit),
    burnRate: upgrades.foxfire.burnPerLevel * foxfire + bonus.burn,
    soulsMultiplier: (1 + upgrades.bell.soulsPerLevel * bell) * (1 + bonus.souls) * festival,
  };
}
