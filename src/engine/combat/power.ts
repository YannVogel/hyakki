import { BALANCE } from '../balance';
import type { GameState } from '../gameState';
import { add, type BigNum, mul, pow, ZERO } from '../numbers';
// The leaf module, not the index: the Festival computes Head Start souls with combatPower.
import { festivalBonus } from '../prestige/bonus';
import { shikigamiHitRatio, shikigamiIntervalMs, teamBonus, teamMembers } from '../shikigami';
import { guardianTimeLimitMs } from './guardians';

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
  /** Damage of a critical hit, in normal hits. */
  readonly critMultiplier: number;
  /** Permanent burn on the current enemy, as a fraction of its max HP per second. */
  readonly burnRate: number;
  readonly soulsMultiplier: number;
  /** Multiplier of the capture chances (the chance itself never exceeds 100 %). */
  readonly captureMultiplier: number;
  /** Talismans: damage multiplier of Kitsune-bi and Raijin, and the guardian weakness bonus. */
  readonly talismanMultiplier: number;
  readonly weaknessMultiplier: number;
  /** Duration of Kekkai's souls boost. */
  readonly soulsBoostMs: number;
  /** Timer of a guardian when the fight starts. */
  readonly guardianTimeMs: number;
}

/**
 * Bonuses of different sources multiply (Sanctuary × team × Festival × Kamidana); bonuses of one
 * source add up. Intervals stay whole milliseconds so that attack timings do not drift.
 */
export function combatPower(state: GameState): CombatPower {
  const { blade, foxfire, bell } = state.sanctuary;
  const {
    blessing,
    tenguEye,
    inariPalm,
    shikigamiPact,
    riftEye,
    greaterTalismans,
    sacredPurse,
    yokaiCall,
  } = state.kamidana;
  const { upgrades, hero, crit, kamidana, talismans } = BALANCE;
  const members = teamMembers(state);
  const bonus = teamBonus(members);
  const speed = 1 + bonus.speed;
  const festival = festivalBonus(state.sparks);
  const heroHitDamage = mul(
    mul(pow(upgrades.blade.damageGrowth, blade), pow(kamidana.blessing.damageGrowth, blessing)),
    hero.baseDamage * (1 + bonus.attack) * festival,
  );
  const pact = pow(kamidana.shikigamiPact.teamDamageGrowth, shikigamiPact);
  const team = members.map((member) => ({
    seed: member.seed,
    hitDamage: mul(mul(heroHitDamage, shikigamiHitRatio(member)), pact),
    intervalMs: Math.max(1, Math.round(shikigamiIntervalMs(member) / speed)),
  }));
  return {
    heroHitDamage,
    tapDamage: mul(
      mul(heroHitDamage, hero.tapMultiplier),
      pow(kamidana.inariPalm.tapGrowth, inariPalm),
    ),
    heroIntervalMs: Math.max(1, Math.round(hero.attackIntervalMs / speed)),
    team,
    critChance: Math.min(crit.maxChance, crit.baseChance + bonus.crit),
    critMultiplier: crit.multiplier + kamidana.tenguEye.critMultiplierPerLevel * tenguEye,
    burnRate: upgrades.foxfire.burnPerLevel * foxfire + bonus.burn,
    soulsMultiplier:
      (1 + upgrades.bell.soulsPerLevel * bell) *
      (1 + bonus.souls) *
      festival *
      kamidana.sacredPurse.soulsGrowth ** sacredPurse,
    captureMultiplier: kamidana.yokaiCall.captureGrowth ** yokaiCall,
    talismanMultiplier: kamidana.greaterTalismans.damageGrowth ** greaterTalismans,
    weaknessMultiplier: talismans.weaknessMultiplier + kamidana.riftEye.weaknessPerLevel * riftEye,
    soulsBoostMs:
      talismans.kekkai.soulsBoostDurationMs +
      kamidana.greaterTalismans.soulsBoostMsPerLevel * greaterTalismans,
    guardianTimeMs: guardianTimeLimitMs(state),
  };
}

/** Expected damage per second of the automatic hits (critical hits averaged, taps excluded). */
export function expectedDps(power: CombatPower): BigNum {
  const critFactor = 1 + power.critChance * (power.critMultiplier - 1);
  const attackers = [
    { hitDamage: power.heroHitDamage, intervalMs: power.heroIntervalMs },
    ...power.team,
  ];
  return attackers.reduce(
    (total, attacker) =>
      add(total, mul(attacker.hitDamage, (critFactor * 1000) / attacker.intervalMs)),
    ZERO,
  );
}
