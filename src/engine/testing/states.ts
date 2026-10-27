import { BALANCE } from '../balance';
import { isGuardianWave } from '../combat/guardians';
import { createNewGame, enemySeed, type GameState } from '../gameState';

/** A new game moved to `wave`, with the enemy of that wave (a waiting guardian on ×100 waves). */
export function stateAtWave(
  seed: number,
  wave: number,
  sanctuary: Partial<GameState['sanctuary']> = {},
): GameState {
  const state = createNewGame(seed);
  return {
    ...state,
    parade: { ...state.parade, wave, maxWave: wave },
    enemy: {
      ...state.enemy,
      seed: enemySeed(seed, wave),
      guardian: isGuardianWave(wave)
        ? { engaged: false, timeLeftMs: BALANCE.guardian.timeLimitMs }
        : null,
    },
    sanctuary: { ...state.sanctuary, ...sanctuary },
  };
}
