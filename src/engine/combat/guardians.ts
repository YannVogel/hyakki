import { BALANCE } from '../balance';
import type { GameState } from '../gameState';
import { type BigNum, mul, pow } from '../numbers';
import { waveHp } from './enemy';

export type Element = 'fire' | 'thunder';

export interface Guardian {
  readonly id: string;
  /** Talisman element dealing double damage to this guardian. */
  readonly weakness: Element;
}

/** The ten guardians of the V1 sheet, in order of appearance (waves 100 to 1000). */
export const GUARDIANS: readonly Guardian[] = [
  { id: 'bake-danuki', weakness: 'fire' },
  { id: 'kappa', weakness: 'thunder' },
  { id: 'karasu-tengu', weakness: 'fire' },
  { id: 'tsuchigumo', weakness: 'fire' },
  { id: 'yuki-onna', weakness: 'fire' },
  { id: 'gashadokuro', weakness: 'thunder' },
  { id: 'nue', weakness: 'thunder' },
  { id: 'ibaraki-doji', weakness: 'thunder' },
  { id: 'kyubi', weakness: 'thunder' },
  { id: 'nurarihyon', weakness: 'fire' },
];

export const isGuardianWave = (wave: number): boolean =>
  wave > 0 && wave % BALANCE.guardian.every === 0;

/** Waves of one awakening level: the ten guardians, a hundred waves apart. */
export const CYCLE_WAVES = BALANCE.guardian.every * BALANCE.guardian.count;

/**
 * Awakening level (« Éveil ») of a wave: 1 for waves 1 to 1000, 2 once Nurarihyon has fallen and
 * the parade starts over, and so on. The state keeps the absolute wave: the level derives from it.
 */
export const awakeningLevel = (wave: number): number => Math.floor((wave - 1) / CYCLE_WAVES) + 1;

/** Position of a wave in its awakening level, 1 to 1000. */
export const waveInCycle = (wave: number): number => ((wave - 1) % CYCLE_WAVES) + 1;

/** Guardian met at a guardian wave: its index (0 to 9) and awakening (its level minus one). */
export function guardianAt(wave: number): { index: number; awakening: number } {
  return {
    index: waveInCycle(wave) / BALANCE.guardian.every - 1,
    awakening: awakeningLevel(wave) - 1,
  };
}

export function guardianMaxHp(wave: number): BigNum {
  const { hpMultiplier, awakeningHpMultiplier } = BALANCE.guardian;
  return mul(
    waveHp(wave),
    mul(hpMultiplier, pow(awakeningHpMultiplier, guardianAt(wave).awakening)),
  );
}

export function guardianOfuda(wave: number): number {
  const { index, awakening } = guardianAt(wave);
  return BALANCE.guardian.baseOfuda * (index + 1) * (awakening + 1);
}

/** Souls multiplier of the tier: +50 % for each guardian wave already behind. */
export function tierMultiplier(wave: number): number {
  return 1 + BALANCE.souls.tierBonus * Math.floor((wave - 1) / BALANCE.guardian.every);
}

/** A guardian's timer: 30 s, plus 5 s per level of the Kamidana's Hourglass (50 s at most). */
export function guardianTimeLimitMs(state: GameState): number {
  const { extraMsPerLevel, maxLevel } = BALANCE.kamidana.hourglass;
  return (
    BALANCE.guardian.timeLimitMs + extraMsPerLevel * Math.min(state.kamidana.hourglass, maxLevel)
  );
}
