import { createStore, type StoreApi } from 'zustand/vanilla';

import {
  buyUpgrade,
  type CombatEvent,
  type CombatInput,
  createNewGame,
  type GameState,
  levelUpShikigami,
  type LoadResult,
  type PurchaseMode,
  type PurchaseResult,
  type RosterResult,
  setTeam,
  startFestival,
  step,
  type TalismanId,
  type UpgradeId,
  type FestivalResult,
} from '@/engine';

/** What the store needs from the outside world (persistence, clock, randomness). */
export interface GameStoreDeps {
  readonly readSave: () => LoadResult | null;
  readonly writeSave: (state: GameState, savedAt: number) => void;
  readonly setAsideCorruptedSave: () => void;
  readonly now: () => number;
  readonly newParadeSeed: () => number;
}

export interface GameStoreState {
  readonly game: GameState;
  /** Events of the last step, for the effects; `eventBatch` changes with every step. */
  readonly events: readonly CombatEvent[];
  readonly eventBatch: number;
  /** Time of the last save (or of the launch), wall clock. */
  readonly savedAt: number;
  readonly loadError: string | null;
  readonly pendingInputs: readonly CombatInput[];
  readonly tap: () => void;
  readonly castTalisman: (talisman: TalismanId) => void;
  readonly engageGuardian: () => void;
  readonly fleeGuardian: () => void;
  readonly challengeGuardian: () => void;
  readonly tick: (dtMs: number) => void;
  readonly buyUpgrade: (upgrade: UpgradeId, mode: PurchaseMode) => PurchaseResult;
  readonly setTeam: (seeds: readonly number[]) => RosterResult;
  readonly levelUpShikigami: (seed: number) => RosterResult;
  readonly startFestival: () => FestivalResult;
  readonly save: () => void;
}

export type GameStore = StoreApi<GameStoreState>;

/** Longest step the loop applies at once: a stalled app does not replay minutes of combat. */
export const MAX_STEP_MS = 1000;

function initialGame(deps: GameStoreDeps): {
  game: GameState;
  savedAt: number;
  loadError: string | null;
} {
  const loaded = deps.readSave();
  if (loaded?.ok === true) {
    return { game: loaded.state, savedAt: loaded.savedAt, loadError: null };
  }
  if (loaded?.ok === false) {
    deps.setAsideCorruptedSave();
  }
  return {
    game: createNewGame(deps.newParadeSeed()),
    savedAt: deps.now(),
    loadError: loaded?.ok === false ? loaded.error.message : null,
  };
}

/** The game store: holds the state, queues the player's inputs and runs the engine. */
export function createGameStore(deps: GameStoreDeps): GameStore {
  return createStore<GameStoreState>()((set, get) => {
    const queue = (input: CombatInput) => set({ pendingInputs: [...get().pendingInputs, input] });
    const apply = <R extends { ok: boolean; state?: GameState }>(result: R): R => {
      if (result.ok && result.state !== undefined) {
        set({ game: result.state });
      }
      return result;
    };
    return {
      ...initialGame(deps),
      events: [],
      eventBatch: 0,
      pendingInputs: [],
      tap: () => queue({ type: 'tap' }),
      castTalisman: (talisman) => queue({ type: 'castTalisman', talisman }),
      engageGuardian: () => queue({ type: 'engageGuardian' }),
      fleeGuardian: () => queue({ type: 'fleeGuardian' }),
      challengeGuardian: () => queue({ type: 'challengeGuardian' }),
      tick: (dtMs) => {
        const { game, pendingInputs, eventBatch } = get();
        const { state, events } = step(game, Math.min(dtMs, MAX_STEP_MS), pendingInputs);
        set({ game: state, events, eventBatch: eventBatch + 1, pendingInputs: [] });
      },
      buyUpgrade: (upgrade, mode) => apply(buyUpgrade(get().game, upgrade, mode)),
      setTeam: (seeds) => apply(setTeam(get().game, seeds)),
      levelUpShikigami: (seed) => apply(levelUpShikigami(get().game, seed)),
      startFestival: () => apply(startFestival(get().game)),
      save: () => {
        const savedAt = deps.now();
        deps.writeSave(get().game, savedAt);
        set({ savedAt });
      },
    };
  });
}
