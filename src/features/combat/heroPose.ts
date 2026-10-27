import type { CombatEvent, TalismanId } from '@/engine';

import type { HeroPose } from '../shared/images';

// Which pose the hero takes after the engine's events, and for how long. Pure: time is passed in.

/** How long each reaction is held before the hero goes back to idle. */
export const POSE_HOLD_MS: Readonly<Record<HeroPose, number>> = {
  idle: 0,
  attack: 250,
  fire: 700,
  thunder: 700,
  barrier: 700,
  hit: 800,
  surprised: 1200,
  victory: 1500,
  knockedOut: 1500,
  sleep: 0,
};

// A stronger reaction is never interrupted by a weaker one (a strike does not cut a victory).
const PRIORITY: Readonly<Record<HeroPose, number>> = {
  idle: 0,
  sleep: 0,
  attack: 1,
  hit: 2,
  fire: 3,
  thunder: 3,
  barrier: 3,
  surprised: 4,
  victory: 5,
  knockedOut: 5,
};

const SPELL_POSES: Readonly<Record<TalismanId, HeroPose>> = {
  kitsunebi: 'fire',
  raijin: 'thunder',
  kekkai: 'barrier',
};

export interface HeroPoseState {
  readonly pose: HeroPose;
  /** When the pose ends, on the caller's clock. */
  readonly untilMs: number;
}

export const IDLE_POSE: HeroPoseState = { pose: 'idle', untilMs: 0 };

function reactionTo(event: CombatEvent): HeroPose | null {
  switch (event.type) {
    case 'hit':
      // Shikigami and talisman damage are not the hero's own strikes.
      return event.source === 'hero' || event.source === 'tap' ? 'attack' : null;
    case 'talismanCast':
      return SPELL_POSES[event.talisman];
    case 'guardianAppeared':
      return 'surprised';
    case 'guardianDefeated':
      return 'victory';
    case 'guardianFailed':
      return 'knockedOut';
    case 'guardianFled':
      return 'hit';
    default:
      return null;
  }
}

/** The pose after a step's events, shown at `nowMs`. */
export function nextHeroPose(
  current: HeroPoseState,
  events: readonly CombatEvent[],
  nowMs: number,
): HeroPoseState {
  return events.reduce((state, event) => {
    const pose = reactionTo(event);
    const holding = nowMs < state.untilMs;
    if (pose === null || (holding && PRIORITY[pose] < PRIORITY[state.pose])) {
      return state;
    }
    return { pose, untilMs: nowMs + event.atMs + POSE_HOLD_MS[pose] };
  }, current);
}

/** The pose shown at `nowMs`: back to idle once the reaction is over. */
export const heroPoseAt = (state: HeroPoseState, nowMs: number): HeroPose =>
  nowMs < state.untilMs ? state.pose : 'idle';
