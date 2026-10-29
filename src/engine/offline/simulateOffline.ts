import { BALANCE } from '../balance';
import { burnDps } from '../combat/battle';
import { waveHp, waveSouls, yokaiProfile } from '../combat/enemy';
import { isGuardianWave, tierMultiplier } from '../combat/guardians';
import { combatPower, expectedDps } from '../combat/power';
import { enemySeed, type GameState, type Shikigami, TALISMAN_IDS } from '../gameState';
import { add, type BigNum, div, mul, sub, toNumber, ZERO } from '../numbers';
import { createRng } from '../rng';
import { addCapture, captureChance } from '../shikigami';
import type { GeneratorVersion } from '../yokai';

const HOUR_MS = 3_600_000;

export interface LevelUp {
  readonly seed: number;
  /** Generator of the shikigami's look (its first capture). */
  readonly generatorVersion: GeneratorVersion;
  /** 0 when the shikigami was captured for the first time. */
  readonly from: number;
  readonly to: number;
}

export interface OfflineReport {
  /** Time taken into account: the absence, capped. */
  readonly durationMs: number;
  readonly capMs: number;
  readonly reachedCap: boolean;
  readonly yokaiDefeated: number;
  readonly souls: BigNum;
  readonly waveFrom: number;
  readonly waveTo: number;
  /** The parade stopped in front of a guardian (guardians are never fought offline). */
  readonly stoppedAtGuardian: boolean;
  readonly levelUps: readonly LevelUp[];
}

/** Offline cap: 8 h, +1 h per level of the Lanterns of vigil, 24 h at most. */
export function offlineCapMs(state: GameState): number {
  const { baseCapHours, maxCapHours } = BALANCE.offline;
  const hours =
    baseCapHours + BALANCE.upgrades.lanterns.offlineHoursPerLevel * state.sanctuary.lanterns;
  return Math.min(maxCapHours, hours) * HOUR_MS;
}

/** Share of the active damage dealt while away: 50 %, +10 points per Vigil level, 100 % at most. */
export function offlineEfficiency(state: GameState): number {
  const { efficiencyPerLevel, maxLevel } = BALANCE.kamidana.vigil;
  const level = Math.min(state.kamidana.vigil, maxLevel);
  return Math.min(1, BALANCE.offline.efficiency + efficiencyPerLevel * level);
}

/**
 * Time to finish an enemy with steady hits and a burn capped like in active play, and the damage
 * dealt after any shorter time.
 */
function fightTimeline(maxHp: BigNum, damage: BigNum, dps: BigNum, burnRate: number) {
  const perMs = div(add(dps, burnDps(maxHp, burnRate, dps)), 1000);
  return {
    msToKill: toNumber(div(sub(maxHp, damage), perMs)),
    damageAfter: (ms: number): BigNum => add(damage, mul(perMs, ms)),
  };
}

interface Simulation {
  wave: number;
  repeat: number;
  farming: boolean;
  seed: number;
  damage: BigNum;
  souls: BigNum;
  kills: number;
  collection: Shikigami[];
  /** Wave of the guardian the parade stopped in front of. */
  guardianWave: number | null;
}

/**
 * What the team achieved while the player was away, computed yōkai by yōkai with the expected
 * damage (no replay of ticks). Guardians are never fought: the parade stops in front of the next
 * one and farms the wave before it. A clock that went backwards (elapsed ≤ 0) gives nothing.
 */
export function simulateOffline(
  state: GameState,
  elapsedMs: number,
  efficiency: number = offlineEfficiency(state),
): { state: GameState; report: OfflineReport } {
  const capMs = offlineCapMs(state);
  const durationMs = Number.isFinite(elapsedMs) ? Math.min(Math.max(0, elapsedMs), capMs) : 0;
  const power = combatPower(state);
  const dps = mul(expectedDps(power), efficiency);
  const burnRate = power.burnRate * efficiency;
  const rng = createRng(state.rngState);
  const { parade } = state;
  const onGuardian = state.enemy.guardian !== null;
  const sim: Simulation = {
    wave: onGuardian ? parade.wave - 1 : parade.wave,
    repeat: onGuardian ? 1 : parade.repeat,
    farming: parade.farming,
    seed: onGuardian ? enemySeed(parade.seed, parade.wave - 1, 1) : state.enemy.seed,
    damage: onGuardian ? ZERO : state.enemy.damage,
    souls: state.souls,
    kills: 0,
    collection: [...state.shikigami],
    guardianWave: onGuardian ? parade.wave : null,
  };
  const fastestAttackMs = Math.min(
    power.heroIntervalMs,
    ...power.team.map((member) => member.intervalMs),
  );
  const levelUps = new Map<number, LevelUp>();
  let remaining = durationMs;
  let farmedMs = 0;
  let farmedSouls = ZERO;
  let farmedKills = 0;

  while (remaining > 0 && sim.kills < BALANCE.offline.maxSimulatedKills) {
    const stuck = sim.farming || sim.guardianWave !== null;
    const profile = yokaiProfile(sim.seed, state.generatorVersion);
    const maxHp = mul(waveHp(sim.wave), profile.hpFactor);
    const fight = fightTimeline(maxHp, sim.damage, dps, burnRate);
    // A yōkai never falls faster than one hit of the fastest attacker.
    const msToKill = Math.max(fight.msToKill, fastestAttackMs);
    if (msToKill > remaining) {
      sim.damage = fight.damageAfter(remaining);
      remaining = 0;
      break;
    }
    remaining -= msToKill;
    const souls = mul(
      waveSouls(sim.wave),
      profile.soulsFactor * tierMultiplier(sim.wave) * power.soulsMultiplier,
    );
    sim.souls = add(sim.souls, souls);
    sim.kills += 1;
    if (stuck) {
      farmedMs += msToKill;
      farmedSouls = add(farmedSouls, souls);
      farmedKills += 1;
    }
    if (rng.next() < captureChance(sim.seed, state.generatorVersion, power.captureMultiplier)) {
      const capture = addCapture(sim.collection, sim.seed, state.generatorVersion);
      sim.collection = capture.collection;
      const previous = levelUps.get(sim.seed);
      levelUps.set(sim.seed, {
        seed: sim.seed,
        generatorVersion: capture.shikigami.generatorVersion,
        from: previous?.from ?? capture.shikigami.level - 1,
        to: capture.shikigami.level,
      });
    }
    sim.damage = ZERO;
    if (!stuck && isGuardianWave(sim.wave + 1)) {
      sim.guardianWave = sim.wave + 1;
    }
    if (stuck || sim.guardianWave !== null) {
      sim.repeat += 1;
    } else {
      sim.wave += 1;
      sim.repeat = 0;
    }
    sim.seed = enemySeed(parade.seed, sim.wave, sim.repeat);
  }

  // Beyond the simulated sample, the parade farms a single wave: extrapolate its average yield.
  if (remaining > 0 && farmedKills > 0) {
    const extraKills = Math.floor((remaining * farmedKills) / farmedMs);
    sim.kills += extraKills;
    sim.souls = add(sim.souls, mul(farmedSouls, extraKills / farmedKills));
  }

  const stoppedAtGuardian = sim.guardianWave !== null;
  const finalWave = sim.guardianWave ?? sim.wave;
  const nextState: GameState = {
    ...state,
    parade: {
      ...parade,
      wave: finalWave,
      maxWave: Math.max(parade.maxWave, finalWave),
      repeat: stoppedAtGuardian ? 0 : sim.repeat,
      farming: stoppedAtGuardian ? false : sim.farming,
    },
    enemy: stoppedAtGuardian
      ? {
          seed: enemySeed(parade.seed, finalWave),
          damage: ZERO,
          guardian: { engaged: false, timeLeftMs: power.guardianTimeMs },
        }
      : { seed: sim.seed, damage: sim.damage, guardian: null },
    souls: sim.souls,
    shikigami: sim.collection,
    cooldowns: Object.fromEntries(
      TALISMAN_IDS.map((id) => [id, Math.max(0, state.cooldowns[id] - durationMs)]),
    ) as GameState['cooldowns'],
    effects: {
      burnMs: Math.max(0, state.effects.burnMs - durationMs),
      soulsBoostMs: Math.max(0, state.effects.soulsBoostMs - durationMs),
    },
    rngState: rng.getState(),
  };
  return {
    state: durationMs > 0 ? nextState : state,
    report: {
      durationMs,
      capMs,
      reachedCap: elapsedMs > capMs,
      yokaiDefeated: sim.kills,
      souls: sub(sim.souls, state.souls),
      waveFrom: parade.wave,
      waveTo: durationMs > 0 ? finalWave : parade.wave,
      stoppedAtGuardian: durationMs > 0 && stoppedAtGuardian,
      levelUps: [...levelUps.values()],
    },
  };
}
