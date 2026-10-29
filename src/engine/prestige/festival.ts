import { BALANCE } from '../balance';
import { waveSouls, yokaiProfile } from '../combat/enemy';
import { guardianOfuda, isGuardianWave, tierMultiplier } from '../combat/guardians';
import { combatPower } from '../combat/power';
import { createNewGame, enemySeed, type GameState } from '../gameState';
import { add, mul, ZERO } from '../numbers';
import { createRng, deriveSeed } from '../rng';
import { addCapture, captureChance } from '../shikigami';
import { festivalBonus } from './bonus';

export interface FestivalPreview {
  readonly unlocked: boolean;
  readonly sparksToEarn: number;
  /** Permanent multiplier of damage and souls, now and after the Festival. */
  readonly bonusNow: number;
  readonly bonusAfter: number;
  /** Wave the next parade starts at (Head Start). */
  readonly startWave: number;
}

export type FestivalResult =
  | { readonly ok: true; readonly state: GameState; readonly sparks: number }
  | { readonly ok: false; readonly reason: 'locked' };

/** Sparks of a Festival: +25 % per level of the Kamidana's Festival Flame, rounded down once. */
export function festivalSparks(recordWave: number, flameLevel = 0): number {
  const { sparksBase, sparksExponent } = BALANCE.festival;
  const flame = 1 + BALANCE.kamidana.festivalFlame.sparksPerLevel * flameLevel;
  return Math.floor(sparksBase * (recordWave / 100) ** sparksExponent * flame);
}

/**
 * Head Start: 1 + 25 waves per level, never beyond the hundred of the record (only what was
 * already crossed is skipped). Both bounds are 1 modulo 25, so never a guardian wave.
 */
export function headStartWave(recordWave: number, level: number): number {
  const { every } = BALANCE.guardian;
  const recordHundred = Math.floor((recordWave - 1) / every) * every + 1;
  return Math.max(1, Math.min(1 + BALANCE.kamidana.headStart.wavesPerLevel * level, recordHundred));
}

/**
 * Purifies the waves a Head Start skips, as if they were played: each yōkai gives its souls and
 * its capture draw, each guardian (all beaten in the parade that ends) its souls and ofuda. The
 * harness showed a Head Start slower than none when it gave up the captures and ofuda (#102).
 */
export function clearSkippedWaves(state: GameState, startWave: number): GameState {
  if (startWave <= state.parade.wave) {
    return state;
  }
  const { soulsMultiplier, captureMultiplier } = combatPower(state);
  const rng = createRng(state.rngState);
  const version = state.generatorVersion;
  let souls = state.souls;
  let ofuda = state.ofuda;
  let collection = state.shikigami;
  for (let wave = state.parade.wave; wave < startWave; wave++) {
    const base = waveSouls(wave);
    const multiplier = tierMultiplier(wave) * soulsMultiplier;
    if (isGuardianWave(wave)) {
      souls = add(souls, mul(base, BALANCE.guardian.soulsMultiplier * multiplier));
      ofuda += guardianOfuda(wave);
      continue;
    }
    const seed = enemySeed(state.parade.seed, wave);
    souls = add(souls, mul(base, yokaiProfile(seed, version).soulsFactor * multiplier));
    if (rng.next() < captureChance(seed, version, captureMultiplier)) {
      collection = addCapture(collection, seed, version).collection;
    }
  }
  return {
    ...state,
    parade: {
      ...state.parade,
      wave: startWave,
      maxWave: Math.max(state.parade.maxWave, startWave),
    },
    enemy: { seed: enemySeed(state.parade.seed, startWave), damage: ZERO, guardian: null },
    souls,
    ofuda,
    shikigami: collection,
    rngState: rng.getState(),
  };
}

export function festivalPreview(state: GameState): FestivalPreview {
  const unlocked = state.parade.maxWave > BALANCE.festival.unlockWave;
  const sparksToEarn = unlocked
    ? festivalSparks(state.parade.maxWave, state.kamidana.festivalFlame)
    : 0;
  return {
    unlocked,
    sparksToEarn,
    bonusNow: festivalBonus(state.sparks),
    bonusAfter: festivalBonus(state.sparks + sparksToEarn),
    startWave: headStartWave(state.parade.maxWave, state.kamidana.headStart),
  };
}

/**
 * Restarts the parade stronger: waves, souls, Sanctuary and talismans start over; shikigami,
 * team, ofuda, Kamidana, sparks and the guardian gallery stay. The new parade's seed derives from
 * the old; with Head Start, it begins further on, with what the skipped waves would have given.
 */
export function startFestival(state: GameState): FestivalResult {
  const { unlocked, sparksToEarn, startWave } = festivalPreview(state);
  if (!unlocked) {
    return { ok: false, reason: 'locked' };
  }
  const number = state.parade.number + 1;
  const fresh = createNewGame(deriveSeed(state.parade.seed, number));
  return {
    ok: true,
    sparks: sparksToEarn,
    state: clearSkippedWaves(
      {
        ...fresh,
        parade: { ...fresh.parade, number },
        ofuda: state.ofuda,
        kamidana: state.kamidana,
        sparks: state.sparks + sparksToEarn,
        shikigami: state.shikigami,
        team: state.team,
        attackTimers: { hero: 0, team: state.attackTimers.team },
        guardiansDefeated: state.guardiansDefeated,
      },
      startWave,
    ),
  };
}
