import { createStore, type StoreApi } from 'zustand/vanilla';

import {
  buyKamidana,
  buyUpgrade,
  type CombatEvent,
  type CombatInput,
  createNewGame,
  type GameState,
  type KamidanaId,
  type KamidanaPurchaseResult,
  type KamidanaRefundResult,
  levelUpShikigami,
  type LoadResult,
  type PurchaseMode,
  type PurchaseResult,
  refundKamidana,
  type RosterResult,
  setTeam,
  startFestival,
  step,
  type TalismanId,
  type UpgradeId,
  type FestivalResult,
  type OfflineReport,
  simulateOffline,
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
  /** What the team achieved while the player was away, until the player collects it. */
  readonly offlineReport: OfflineReport | null;
  /** Applies the time elapsed since the last save (launch, back to the foreground). */
  readonly resume: () => void;
  readonly dismissOfflineReport: () => void;
  readonly tap: () => void;
  readonly castTalisman: (talisman: TalismanId) => void;
  readonly engageGuardian: () => void;
  readonly fleeGuardian: () => void;
  readonly challengeGuardian: () => void;
  readonly tick: (dtMs: number) => void;
  readonly buyUpgrade: (upgrade: UpgradeId, mode: PurchaseMode) => PurchaseResult;
  readonly buyKamidana: (upgrade: KamidanaId) => KamidanaPurchaseResult;
  readonly refundKamidana: () => KamidanaRefundResult;
  readonly setTeam: (seeds: readonly number[]) => RosterResult;
  readonly levelUpShikigami: (seed: number) => RosterResult;
  readonly startFestival: () => FestivalResult;
  readonly save: () => void;
}

export type GameStore = StoreApi<GameStoreState>;

/** Longest step the loop applies at once: a stalled app does not replay minutes of combat. */
export const MAX_STEP_MS = 1000;

/** Below this absence, no offline report: the player barely left. */
export const MIN_OFFLINE_MS = 60_000;

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
      offlineReport: null,
      resume: () => {
        const now = deps.now();
        const elapsed = now - get().savedAt;
        if (elapsed < MIN_OFFLINE_MS) {
          return;
        }
        const { state, report } = simulateOffline(get().game, elapsed);
        deps.writeSave(state, now);
        set({ game: state, savedAt: now, offlineReport: report });
      },
      dismissOfflineReport: () => set({ offlineReport: null }),
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
      buyKamidana: (upgrade) => apply(buyKamidana(get().game, upgrade)),
      refundKamidana: () => apply(refundKamidana(get().game)),
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
