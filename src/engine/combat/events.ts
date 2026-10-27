import type { BigNum } from '../numbers';

export type HitSource = 'hero' | 'tap' | 'shikigami';

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
    };

/** What the player did since the previous step. */
export type CombatInput = { readonly type: 'tap' };
