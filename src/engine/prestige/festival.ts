import { BALANCE } from '../balance';
import { createNewGame, type GameState } from '../gameState';
import { deriveSeed } from '../rng';

export interface FestivalPreview {
  readonly unlocked: boolean;
  readonly sparksToEarn: number;
  /** Permanent multiplier of damage and souls, now and after the Festival. */
  readonly bonusNow: number;
  readonly bonusAfter: number;
}

export type FestivalResult =
  | { readonly ok: true; readonly state: GameState; readonly sparks: number }
  | { readonly ok: false; readonly reason: 'locked' };

/** × (1 + 5 % per spark earned over all parades). */
export function festivalBonus(sparks: number): number {
  return 1 + BALANCE.festival.bonusPerSpark * sparks;
}

export function festivalSparks(recordWave: number): number {
  const { sparksBase, sparksExponent } = BALANCE.festival;
  return Math.floor(sparksBase * (recordWave / 100) ** sparksExponent);
}

export function festivalPreview(state: GameState): FestivalPreview {
  const unlocked = state.parade.maxWave > BALANCE.festival.unlockWave;
  const sparksToEarn = unlocked ? festivalSparks(state.parade.maxWave) : 0;
  return {
    unlocked,
    sparksToEarn,
    bonusNow: festivalBonus(state.sparks),
    bonusAfter: festivalBonus(state.sparks + sparksToEarn),
  };
}

/**
 * Restarts the parade stronger: waves, souls, Sanctuary and talismans start over; shikigami,
 * team, ofuda, sparks and the guardian gallery stay. The new parade's seed derives from the old.
 */
export function startFestival(state: GameState): FestivalResult {
  const { unlocked, sparksToEarn } = festivalPreview(state);
  if (!unlocked) {
    return { ok: false, reason: 'locked' };
  }
  const number = state.parade.number + 1;
  const fresh = createNewGame(deriveSeed(state.parade.seed, number));
  return {
    ok: true,
    sparks: sparksToEarn,
    state: {
      ...fresh,
      parade: { ...fresh.parade, number },
      ofuda: state.ofuda,
      sparks: state.sparks + sparksToEarn,
      shikigami: state.shikigami,
      team: state.team,
      attackTimers: { hero: 0, team: state.attackTimers.team },
      guardiansDefeated: state.guardiansDefeated,
    },
  };
}
