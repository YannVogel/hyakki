import { BALANCE } from '../balance';
import {
  enemySeed,
  type GameState,
  type GuardianFight,
  type Shikigami,
  type TalismanId,
} from '../gameState';
import { add, type BigNum, div, gte, mul, sub, toNumber, ZERO } from '../numbers';
import { createRng, type Rng } from '../rng';
import { addCapture, captureChance } from '../shikigami';
import { waveSouls, yokaiMaxHp, yokaiProfile } from './enemy';
import type { CombatEvent, HitSource } from './events';
import {
  guardianAt,
  guardianMaxHp,
  guardianOfuda,
  isGuardianWave,
  tierMultiplier,
} from './guardians';
import { type CombatPower, combatPower } from './power';

/** Mutable working copy of the fight during one step. */
export interface Battle {
  readonly paradeSeed: number;
  readonly generatorVersion: number;
  readonly power: CombatPower;
  readonly rng: Rng;
  readonly events: CombatEvent[];
  wave: number;
  maxWave: number;
  repeat: number;
  farming: boolean;
  seed: number;
  damage: BigNum;
  maxHp: BigNum;
  guardian: { engaged: boolean; timeLeftMs: number } | null;
  souls: BigNum;
  ofuda: number;
  guardiansDefeated: number[];
  collection: Shikigami[];
  /** Time until the next attack: the hero, then each team member. */
  timers: number[];
  cooldowns: Record<TalismanId, number>;
  effects: { burnMs: number; soulsBoostMs: number };
  elapsed: number;
}

const enemyMaxHp = (wave: number, seed: number): BigNum =>
  isGuardianWave(wave) ? guardianMaxHp(wave) : yokaiMaxHp(wave, seed);

export function startBattle(state: GameState): Battle {
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
    farming: parade.farming,
    seed: enemy.seed,
    damage: enemy.damage,
    maxHp: enemyMaxHp(parade.wave, enemy.seed),
    guardian: enemy.guardian === null ? null : { ...enemy.guardian },
    souls: state.souls,
    ofuda: state.ofuda,
    guardiansDefeated: [...state.guardiansDefeated],
    collection: [...state.shikigami],
    timers: [state.attackTimers.hero, ...state.attackTimers.team],
    cooldowns: { ...state.cooldowns },
    effects: { ...state.effects },
    elapsed: 0,
  };
}

export function finishBattle(state: GameState, battle: Battle): GameState {
  const guardian: GuardianFight | null = battle.guardian === null ? null : { ...battle.guardian };
  return {
    ...state,
    parade: {
      ...state.parade,
      wave: battle.wave,
      maxWave: battle.maxWave,
      repeat: battle.repeat,
      farming: battle.farming,
    },
    enemy: { seed: battle.seed, damage: battle.damage, guardian },
    souls: battle.souls,
    ofuda: battle.ofuda,
    guardiansDefeated: battle.guardiansDefeated,
    shikigami: battle.collection,
    attackTimers: { hero: battle.timers[0], team: battle.timers.slice(1) },
    cooldowns: battle.cooldowns,
    effects: battle.effects,
    rngState: battle.rng.getState(),
  };
}

/** Multiplier of the Kekkai talisman's souls boost, when active. */
const soulsBoost = (battle: Battle): number =>
  battle.effects.soulsBoostMs > 0 ? BALANCE.talismans.kekkai.soulsBoostMultiplier : 1;

/** A guardian waiting for the player (cut-in): nothing fights until it is engaged. */
export const isPaused = (battle: Battle): boolean =>
  battle.guardian !== null && !battle.guardian.engaged;

export function spawnEnemy(battle: Battle, wave: number, repeat: number): void {
  battle.wave = wave;
  battle.repeat = repeat;
  battle.maxWave = Math.max(battle.maxWave, wave);
  battle.seed = enemySeed(battle.paradeSeed, wave, repeat);
  battle.damage = ZERO;
  battle.maxHp = enemyMaxHp(wave, battle.seed);
  battle.events.push({ type: 'waveStarted', wave, seed: battle.seed, atMs: battle.elapsed });
  if (isGuardianWave(wave)) {
    battle.guardian = { engaged: false, timeLeftMs: BALANCE.guardian.timeLimitMs };
    battle.events.push({
      type: 'guardianAppeared',
      wave,
      ...guardianAt(wave),
      atMs: battle.elapsed,
    });
  } else {
    battle.guardian = null;
  }
}

/** Back to the wave before the guardian, farming it with fresh yōkai until a new try. */
export function retreat(battle: Battle): void {
  battle.farming = true;
  spawnEnemy(battle, battle.wave - 1, 1);
}

function defeatGuardian(battle: Battle): void {
  const { wave } = battle;
  const { index } = guardianAt(wave);
  const ofuda = guardianOfuda(wave);
  const souls = mul(
    waveSouls(wave),
    BALANCE.guardian.soulsMultiplier *
      tierMultiplier(wave) *
      battle.power.soulsMultiplier *
      soulsBoost(battle),
  );
  const firstTime = !battle.guardiansDefeated.includes(index);
  if (firstTime) {
    battle.guardiansDefeated.push(index);
  }
  battle.ofuda += ofuda;
  battle.souls = add(battle.souls, souls);
  battle.events.push({
    type: 'guardianDefeated',
    wave,
    index,
    ofuda,
    souls,
    firstTime,
    atMs: battle.elapsed,
  });
  battle.farming = false;
  spawnEnemy(battle, wave + 1, 0);
}

function defeatYokai(battle: Battle): void {
  const { wave, seed } = battle;
  const souls = mul(
    waveSouls(wave),
    yokaiProfile(seed).soulsFactor *
      tierMultiplier(wave) *
      battle.power.soulsMultiplier *
      soulsBoost(battle),
  );
  battle.souls = add(battle.souls, souls);
  battle.events.push({ type: 'yokaiDefeated', wave, seed, souls, atMs: battle.elapsed });
  if (battle.rng.next() < captureChance(seed)) {
    const capture = addCapture(battle.collection, seed, battle.generatorVersion);
    battle.collection = capture.collection;
    battle.events.push({
      type: 'shikigamiCaptured',
      seed,
      level: capture.shikigami.level,
      isNew: capture.isNew,
      atMs: battle.elapsed,
    });
  }
  if (battle.farming) {
    spawnEnemy(battle, wave, battle.repeat + 1);
  } else {
    spawnEnemy(battle, wave + 1, 0);
  }
}

function defeatEnemy(battle: Battle): void {
  if (battle.guardian === null) {
    defeatYokai(battle);
  } else {
    defeatGuardian(battle);
  }
}

/** Talismans never land critical hits. */
export function hit(battle: Battle, baseDamage: BigNum, source: HitSource): void {
  if (isPaused(battle)) {
    return;
  }
  const canCrit = source === 'hero' || source === 'tap' || source === 'shikigami';
  const crit = canCrit && battle.rng.next() < battle.power.critChance;
  const damage = crit ? mul(baseDamage, BALANCE.crit.multiplier) : baseDamage;
  battle.events.push({ type: 'hit', source, damage, crit, atMs: battle.elapsed });
  battle.damage = add(battle.damage, damage);
  if (gte(battle.damage, battle.maxHp)) {
    defeatEnemy(battle);
  }
}

/** Attacker 0 is the hero, attacker i the (i − 1)-th team member. */
export function strike(battle: Battle, attacker: number): void {
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

/**
 * Lets `durationMs` pass with the continuous effects: burn (which may defeat enemies) and the
 * guardian timer. Stops early if a waiting guardian shows up.
 */
export function advance(battle: Battle, durationMs: number): void {
  let left = durationMs;
  while (left > 0 && !isPaused(battle)) {
    const { effects } = battle;
    const talismanBurn = effects.burnMs > 0 ? BALANCE.talismans.kitsunebi.burnRate : 0;
    const burnRate =
      (battle.power.burnRate + talismanBurn) *
      (battle.guardian === null ? 1 : BALANCE.guardian.burnFactor);
    const burnPerMs = mul(battle.maxHp, burnRate / 1000);
    const msToKill =
      burnRate > 0 ? toNumber(div(sub(battle.maxHp, battle.damage), burnPerMs)) : Infinity;
    // The talisman burn stops at its exact end: the burn rate changes there.
    const burnEnd = effects.burnMs > 0 ? effects.burnMs : Infinity;
    const piece = Math.min(left, msToKill, burnEnd);
    if (battle.guardian !== null) {
      battle.guardian.timeLeftMs -= piece;
    }
    effects.burnMs = Math.max(0, effects.burnMs - piece);
    effects.soulsBoostMs = Math.max(0, effects.soulsBoostMs - piece);
    battle.elapsed += piece;
    left -= piece;
    if (piece === msToKill) {
      defeatEnemy(battle);
    } else if (burnRate > 0) {
      battle.damage = add(battle.damage, mul(burnPerMs, piece));
    }
  }
}
