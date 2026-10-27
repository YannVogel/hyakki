import { BALANCE } from '../balance';
import { enemySeed, type GameState } from '../gameState';
import { add, type BigNum, div, gte, mul, sub, toNumber, ZERO } from '../numbers';
import { createRng, type Rng } from '../rng';
import { waveSouls, yokaiMaxHp, yokaiProfile } from './enemy';
import type { CombatEvent, CombatInput, HitSource } from './events';
import { type CombatPower, combatPower } from './power';

export interface StepResult {
  readonly state: GameState;
  readonly events: readonly CombatEvent[];
}

/** Mutable working copy of the fight during one step. */
interface Battle {
  readonly paradeSeed: number;
  readonly power: CombatPower;
  readonly rng: Rng;
  readonly events: CombatEvent[];
  wave: number;
  maxWave: number;
  repeat: number;
  seed: number;
  damage: BigNum;
  maxHp: BigNum;
  souls: BigNum;
  heroTimer: number;
  elapsed: number;
}

function startBattle(state: GameState): Battle {
  const { parade, enemy } = state;
  return {
    paradeSeed: parade.seed,
    power: combatPower(state),
    rng: createRng(state.rngState),
    events: [],
    wave: parade.wave,
    maxWave: parade.maxWave,
    repeat: parade.repeat,
    seed: enemy.seed,
    damage: enemy.damage,
    maxHp: yokaiMaxHp(parade.wave, enemy.seed),
    souls: state.souls,
    heroTimer: state.attackTimers.hero,
    elapsed: 0,
  };
}

function defeatEnemy(battle: Battle): void {
  const reward = mul(
    waveSouls(battle.wave),
    yokaiProfile(battle.seed).soulsFactor * battle.power.soulsMultiplier,
  );
  battle.souls = add(battle.souls, reward);
  battle.events.push({
    type: 'yokaiDefeated',
    wave: battle.wave,
    seed: battle.seed,
    souls: reward,
    atMs: battle.elapsed,
  });
  battle.wave += 1;
  battle.maxWave = Math.max(battle.maxWave, battle.wave);
  battle.repeat = 0;
  battle.seed = enemySeed(battle.paradeSeed, battle.wave);
  battle.damage = ZERO;
  battle.maxHp = yokaiMaxHp(battle.wave, battle.seed);
  battle.events.push({
    type: 'waveStarted',
    wave: battle.wave,
    seed: battle.seed,
    atMs: battle.elapsed,
  });
}

function hit(battle: Battle, baseDamage: BigNum, source: HitSource): void {
  const crit = battle.rng.next() < battle.power.critChance;
  const damage = crit ? mul(baseDamage, BALANCE.crit.multiplier) : baseDamage;
  battle.events.push({ type: 'hit', source, damage, crit, atMs: battle.elapsed });
  battle.damage = add(battle.damage, damage);
  if (gte(battle.damage, battle.maxHp)) {
    defeatEnemy(battle);
  }
}

/** Lets `durationMs` pass with the continuous effects (burn), which may defeat enemies. */
function advance(battle: Battle, durationMs: number): void {
  let left = durationMs;
  const { burnRate } = battle.power;
  while (left > 0) {
    if (burnRate <= 0) {
      battle.elapsed += left;
      return;
    }
    const burnPerMs = mul(battle.maxHp, burnRate / 1000);
    const msToKill = toNumber(div(sub(battle.maxHp, battle.damage), burnPerMs));
    if (msToKill > left) {
      battle.damage = add(battle.damage, mul(burnPerMs, left));
      battle.elapsed += left;
      return;
    }
    battle.elapsed += msToKill;
    left -= msToKill;
    defeatEnemy(battle);
  }
}

/**
 * Advances the fight by `dtMs` (injected time, never read from a clock). Pure: the same state,
 * duration and inputs always give the same result. Inputs happen at the start of the step;
 * automatic attacks happen on fixed integer timers, so splitting a duration into several steps
 * gives the same hits in the same order (burn damage only differs by float rounding).
 */
export function step(
  state: GameState,
  dtMs: number,
  inputs: readonly CombatInput[] = [],
): StepResult {
  const duration = Number.isFinite(dtMs) && dtMs > 0 ? dtMs : 0;
  if (duration === 0 && inputs.length === 0) {
    return { state, events: [] };
  }
  const battle = startBattle(state);

  for (const input of inputs) {
    if (input.type === 'tap') {
      hit(battle, battle.power.tapDamage, 'tap');
    }
  }

  // Half-open interval [start, end[: an attack due exactly at the end belongs to the next step.
  let remaining = duration;
  while (remaining > 0) {
    if (battle.heroTimer >= remaining) {
      advance(battle, remaining);
      battle.heroTimer -= remaining;
      remaining = 0;
    } else {
      advance(battle, battle.heroTimer);
      remaining -= battle.heroTimer;
      hit(battle, battle.power.heroHitDamage, 'hero');
      battle.heroTimer = battle.power.heroIntervalMs;
    }
  }

  return {
    state: {
      ...state,
      parade: {
        ...state.parade,
        wave: battle.wave,
        maxWave: battle.maxWave,
        repeat: battle.repeat,
      },
      enemy: { ...state.enemy, seed: battle.seed, damage: battle.damage },
      souls: battle.souls,
      attackTimers: { ...state.attackTimers, hero: battle.heroTimer },
      rngState: battle.rng.getState(),
    },
    events: battle.events,
  };
}
