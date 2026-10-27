import type { TalismanId } from '../gameState';
import type { BigNum } from '../numbers';

export type HitSource = 'hero' | 'tap' | 'shikigami' | 'kitsunebi' | 'raijin';

/** What happened during a step, for the UI to animate. `atMs` is the offset within the step. */
export type CombatEvent =
  | {
      readonly type: 'hit';
      readonly source: HitSource;
      readonly damage: BigNum;
      readonly crit: boolean;
      readonly atMs: number;
    }
  | {
      readonly type: 'yokaiDefeated';
      readonly wave: number;
      readonly seed: number;
      readonly souls: BigNum;
      readonly atMs: number;
    }
  | {
      readonly type: 'waveStarted';
      readonly wave: number;
      readonly seed: number;
      readonly atMs: number;
    }
  | {
      readonly type: 'shikigamiCaptured';
      readonly seed: number;
      /** Level after the capture: 1 for a new shikigami, +1 for a duplicate. */
      readonly level: number;
      readonly isNew: boolean;
      readonly atMs: number;
    }
  | {
      readonly type: 'guardianAppeared';
      readonly wave: number;
      /** Guardian index, 0 to 9, and awakening cycle (0 below wave 1001). */
      readonly index: number;
      readonly awakening: number;
      readonly atMs: number;
    }
  | { readonly type: 'guardianEngaged'; readonly wave: number; readonly atMs: number }
  | {
      readonly type: 'guardianDefeated';
      readonly wave: number;
      readonly index: number;
      readonly ofuda: number;
      readonly souls: BigNum;
      /** First victory over this guardian: it joins the gallery. */
      readonly firstTime: boolean;
      readonly atMs: number;
    }
  | {
      readonly type: 'guardianFailed';
      readonly wave: number;
      readonly index: number;
      readonly atMs: number;
    }
  | { readonly type: 'guardianFled'; readonly wave: number; readonly atMs: number }
  | { readonly type: 'talismanCast'; readonly talisman: TalismanId; readonly atMs: number }
  | {
      readonly type: 'talismanNotReady';
      readonly talisman: TalismanId;
      /** Cooldown left; 0 when refused because a guardian waits for the player. */
      readonly cooldownMs: number;
      readonly atMs: number;
    };

/** What the player did since the previous step. */
export type CombatInput =
  | { readonly type: 'tap' }
  /** Starts the guardian's timer after its cut-in. */
  | { readonly type: 'engageGuardian' }
  /** Runs from the guardian: back to the previous wave, farming. */
  | { readonly type: 'fleeGuardian' }
  /** Leaves farming to face the guardian again. */
  | { readonly type: 'challengeGuardian' }
  | { readonly type: 'castTalisman'; readonly talisman: TalismanId };
