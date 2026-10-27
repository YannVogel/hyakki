import { BALANCE } from '../balance';
import { enemySeed, type GameState, type Shikigami } from '../gameState';
import { add, type BigNum, div, gte, mul, sub, toNumber, ZERO } from '../numbers';
import { createRng, type Rng } from '../rng';
import { addCapture, captureChance } from '../shikigami';
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
  readonly generatorVersion: number;
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
  collection: Shikigami[];
  /** Time until the next attack: the hero, then each team member. */
  timers: number[];
  elapsed: number;
}

function startBattle(state: GameState): Battle {
  const { parade, enemy } = state;
  return {
    paradeSeed: parade.seed,
    generatorVersion: state.generatorVersion,
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
    collection: [...state.shikigami],
    timers: [state.attackTimers.hero, ...state.attackTimers.team],
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
  if (battle.rng.next() < captureChance(battle.seed)) {
    const capture = addCapture(battle.collection, battle.seed, battle.generatorVersion);
    battle.collection = capture.collection;
    battle.events.push({
      type: 'shikigamiCaptured',
      seed: battle.seed,
      level: capture.shikigami.level,
      isNew: capture.isNew,
      atMs: battle.elapsed,
    });
  }
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

/** Attacker 0 is the hero, attacker i the (i − 1)-th team member. */
function strike(battle: Battle, attacker: number): void {
  const { power } = battle;
  if (attacker === 0) {
    hit(battle, power.heroHitDamage, 'hero');
    battle.timers[0] = power.heroIntervalMs;
  } else {
    const member = power.team[attacker - 1];
    hit(battle, member.hitDamage, 'shikigami');
    battle.timers[attacker] = member.intervalMs;
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
  // Attackers due at the same time strike in order: the hero, then the team.
  let remaining = duration;
  while (remaining > 0) {
    const next = Math.min(...battle.timers);
    const elapsed = Math.min(next, remaining);
    advance(battle, elapsed);
    remaining -= elapsed;
    battle.timers = battle.timers.map((timer) => timer - elapsed);
    if (next < remaining + elapsed) {
      battle.timers.forEach((timer, index) => {
        if (timer <= 0) {
          strike(battle, index);
        }
      });
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
      shikigami: battle.collection,
      attackTimers: { hero: battle.timers[0], team: battle.timers.slice(1) },
      rngState: battle.rng.getState(),
    },
    events: battle.events,
  };
}
