// How the enemy reacts to the hits it takes, as pure data: which hit of a step it reacts to, how
// strongly, and whether a new reaction may cut the current one. The animation itself runs on the
// UI thread (src/features/combat/useHitReaction.ts). Distances are in the 366 × 400 frame of the
// battle scene.
import type { CombatEvent, HitSource } from '@/engine';

import { FLASH_MIN_GAP_MS, landingDelayMs, type MotionLevel } from './effects';

export type HitStrength = 'light' | 'medium' | 'strong';

const RANK: Readonly<Record<HitStrength, number>> = { light: 1, medium: 2, strong: 3 };

export interface ReactionShape {
  /** Recoil away from the hero, in scene units. */
  readonly recoil: number;
  /** Squash at the peak: wider by this share, flatter by the same. */
  readonly squash: number;
  /** Opacity of the white flash over the silhouette at its peak (0: no flash). */
  readonly flash: number;
  readonly durationMs: number;
}

/** The team's frequent hits stay discreet: without a flash, the enemy would blink all the time. */
export const REACTION_SHAPES: Readonly<Record<HitStrength, ReactionShape>> = {
  light: { recoil: 3, squash: 0.03, flash: 0, durationMs: 120 },
  medium: { recoil: 7, squash: 0.06, flash: 0.45, durationMs: 150 },
  strong: { recoil: 12, squash: 0.1, flash: 0.75, durationMs: 180 },
};

/** Share of a reaction spent reaching its peak: the hit lands hard, then the enemy settles. */
export const REACTION_ATTACK_SHARE = 0.25;

/** With reduced motion, nothing moves nor flashes: a strong hit only dims the enemy briefly. */
export const REDUCED_DIM = { opacity: 0.25, durationMs: 200 } as const;

export function hitStrength(source: HitSource, crit: boolean): HitStrength {
  if (crit || source === 'kitsunebi' || source === 'raijin') {
    return 'strong';
  }
  return source === 'shikigami' ? 'light' : 'medium';
}

export interface HitReaction {
  readonly strength: HitStrength;
  /** When it starts, from the moment the step's events are shown (the hit lands). */
  readonly delayMs: number;
}

/**
 * The strongest hit of a step on the enemy now standing, or null. Hits before the last
 * `waveStarted` struck an enemy that is gone: its petals take over.
 */
export function reactionForEvents(
  events: readonly CombatEvent[],
  motion: MotionLevel,
): HitReaction | null {
  const lastWave = events.findLastIndex((event) => event.type === 'waveStarted');
  let best: HitReaction | null = null;
  for (const event of events.slice(lastWave + 1)) {
    if (event.type !== 'hit') {
      continue;
    }
    const strength = hitStrength(event.source, event.crit);
    if (best === null || RANK[strength] > RANK[best.strength]) {
      best = { strength, delayMs: landingDelayMs(event, motion) };
    }
  }
  return best;
}

export interface ActiveReaction {
  readonly strength: HitStrength;
  readonly endsAtMs: number;
  /** Start of the last flash, to keep under 2.5 flashes per second. */
  readonly lastFlashMs: number;
}

export const NO_REACTION: ActiveReaction = {
  strength: 'light',
  endsAtMs: -Infinity,
  lastFlashMs: -Infinity,
};

export interface ReactionPlan {
  readonly strength: HitStrength;
  readonly delayMs: number;
  readonly flash: boolean;
}

/**
 * What to play for a step, given the reaction under way: a weaker reaction never cuts a stronger
 * one; an equal or stronger one restarts from where the enemy stands, without adding up.
 */
export function planReaction(
  active: ActiveReaction,
  reaction: HitReaction | null,
  nowMs: number,
): { readonly active: ActiveReaction; readonly plan: ReactionPlan | null } {
  if (reaction === null) {
    return { active, plan: null };
  }
  const startsAtMs = nowMs + reaction.delayMs;
  const busy = startsAtMs < active.endsAtMs && RANK[reaction.strength] < RANK[active.strength];
  if (busy) {
    return { active, plan: null };
  }
  const shape = REACTION_SHAPES[reaction.strength];
  const flash = shape.flash > 0 && startsAtMs - active.lastFlashMs >= FLASH_MIN_GAP_MS;
  return {
    active: {
      strength: reaction.strength,
      endsAtMs: startsAtMs + shape.durationMs,
      lastFlashMs: flash ? startsAtMs : active.lastFlashMs,
    },
    plan: { strength: reaction.strength, delayMs: reaction.delayMs, flash },
  };
}

/** Skia colour matrix moving every colour toward white by `amount` (0 to 1), alpha untouched. */
export function flashMatrix(amount: number): number[] {
  'worklet';
  const keep = 1 - amount;
  // prettier-ignore
  return [
    keep, 0, 0, 0, amount,
    0, keep, 0, 0, amount,
    0, 0, keep, 0, amount,
    0, 0, 0, 1, 0,
  ];
}
