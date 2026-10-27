import { BALANCE, createNewGame, enemySeed, type GameState } from '@/engine';

/** Development shortcut: the first parade, in front of the guardian of `wave`, strong enough to win. */
export function devGuardianState(seed: number, wave: number): GameState {
  const state = createNewGame(seed);
  return {
    ...state,
    parade: { ...state.parade, wave, maxWave: wave },
    enemy: {
      seed: enemySeed(seed, wave),
      damage: state.enemy.damage,
      guardian: { engaged: false, timeLeftMs: BALANCE.guardian.timeLimitMs },
    },
    sanctuary: { ...state.sanctuary, blade: wave },
  };
}
