import { BALANCE } from '../balance';
import { waveSouls } from '../combat/enemy';
import { tierMultiplier } from '../combat/guardians';
import { combatPower } from '../combat/power';
import { createNewGame, enemySeed, type GameState } from '../gameState';
import { add, type BigNum, mul, ZERO } from '../numbers';
import { deriveSeed } from '../rng';
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

export function festivalSparks(recordWave: number): number {
  const { sparksBase, sparksExponent } = BALANCE.festival;
  return Math.floor(sparksBase * (recordWave / 100) ** sparksExponent);
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

/** Souls the skipped waves would have given: one ordinary yōkai each (rarity ×1, no capture). */
export function headStartSouls(state: GameState, startWave: number): BigNum {
  const { soulsMultiplier } = combatPower(state);
  let souls = ZERO;
  for (let wave = 1; wave < startWave; wave++) {
    souls = add(souls, mul(waveSouls(wave), tierMultiplier(wave) * soulsMultiplier));
  }
  return souls;
}

export function festivalPreview(state: GameState): FestivalPreview {
  const unlocked = state.parade.maxWave > BALANCE.festival.unlockWave;
  const sparksToEarn = unlocked ? festivalSparks(state.parade.maxWave) : 0;
  return {
    unlocked,
    sparksToEarn,
    bonusNow: festivalBonus(state.sparks),
    bonusAfter: festivalBonus(state.sparks + sparksToEarn),
    startWave: headStartWave(state.parade.maxWave, state.kamidana.headStart),
  };
}

/** Moves a fresh parade to its Head Start wave, with the souls of the waves it skips. */
function skipTo(state: GameState, startWave: number): GameState {
  if (startWave === 1) {
    return state;
  }
  return {
    ...state,
    parade: { ...state.parade, wave: startWave, maxWave: startWave },
    enemy: { ...state.enemy, seed: enemySeed(state.parade.seed, startWave) },
    souls: headStartSouls(state, startWave),
  };
}

/**
 * Restarts the parade stronger: waves, souls, Sanctuary and talismans start over; shikigami,
 * team, ofuda, Kamidana, sparks and the guardian gallery stay. The new parade's seed derives from
 * the old; with Head Start, it begins further on. Skipped guardians give neither ofuda nor souls.
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
    state: skipTo(
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
