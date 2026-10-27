import { createNewGame, type GameState, type LoadResult } from '@/engine';

import { createGameStore, type GameStoreDeps } from '../gameStore';

/** A game store with in-memory persistence and a manual clock, for tests. */
export function createFakeStore(
  options: { game?: GameState; save?: LoadResult | null; now?: number } = {},
) {
  const saves: { state: GameState; savedAt: number }[] = [];
  const clock = { now: options.now ?? 1_000_000 };
  const deps: GameStoreDeps = {
    readSave: () =>
      options.save !== undefined
        ? options.save
        : options.game === undefined
          ? null
          : { ok: true, state: options.game, savedAt: clock.now },
    writeSave: (state, savedAt) => saves.push({ state, savedAt }),
    setAsideCorruptedSave: jest.fn(),
    now: () => clock.now,
    newParadeSeed: () => 2026,
  };
  return { store: createGameStore(deps), saves, clock, deps, fresh: () => createNewGame(2026) };
}
