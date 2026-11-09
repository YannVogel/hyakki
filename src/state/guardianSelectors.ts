import { BALANCE, type GameState, guardianAt } from '@/engine';

import { paradeView } from './selectors';

export type GuardianStatus = 'defeated' | 'next' | 'upcoming';

export interface GuardianCard {
  readonly index: number;
  readonly wave: number;
  readonly status: GuardianStatus;
  /** Defeated once, or met in the current parade: its look is known. */
  readonly revealed: boolean;
}

/** Defeated once, or met in the current parade: its look is known. */
const isGuardianRevealed = (state: GameState, index: number): boolean =>
  state.guardiansDefeated.includes(index) ||
  state.parade.maxWave >= (index + 1) * BALANCE.guardian.every;

export interface NextGuardianView {
  readonly index: number;
  /** Above 0, the guardian is awakened: it keeps its look, with an aura. */
  readonly awakening: number;
  readonly revealed: boolean;
}

/** The guardian waiting at the end of the current hundred; an awakened one keeps its look. */
export function nextGuardianView(state: GameState): NextGuardianView {
  const { index, awakening } = guardianAt(paradeView(state).nextGuardianWave);
  return { index, awakening, revealed: isGuardianRevealed(state, index) };
}

const guardianStatus = (defeated: boolean, next: boolean): GuardianStatus =>
  defeated ? 'defeated' : next ? 'next' : 'upcoming';

/** The ten guardians of the V1 sheet, as the gallery shows them. */
export function guardianGallery(state: GameState): GuardianCard[] {
  const { every, count } = BALANCE.guardian;
  const nextIndex = nextGuardianView(state).index;
  return Array.from({ length: count }, (_, index) => ({
    index,
    wave: (index + 1) * every,
    status: guardianStatus(state.guardiansDefeated.includes(index), index === nextIndex),
    revealed: isGuardianRevealed(state, index),
  }));
}

export interface AwakenedGuardianCard {
  readonly index: number;
  /** Wave of the guardian in its awakening level (100 to 1000). */
  readonly wave: number;
  readonly status: GuardianStatus;
  /** Highest awakening level it fell at (« Éveil N »), null while its awakened self never fell. */
  readonly bestLevel: number | null;
}

/**
 * The awakened guardians and the highest awakening level each fell at (#133). Null until
 * Nurarihyon has fallen once: before that, no guardian has come back awakened.
 */
export function awakenedGuardianGallery(state: GameState): AwakenedGuardianCard[] | null {
  const { every, count } = BALANCE.guardian;
  if (!state.guardiansDefeated.includes(count - 1)) {
    return null;
  }
  const next = nextGuardianView(state);
  return state.guardiansBestAwakening.map((awakening, index) => ({
    index,
    wave: (index + 1) * every,
    status: guardianStatus(awakening > 0, next.awakening > 0 && index === next.index),
    bestLevel: awakening > 0 ? awakening + 1 : null,
  }));
}
