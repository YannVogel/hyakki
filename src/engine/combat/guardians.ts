import { BALANCE } from '../balance';
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

/** Guardian met at a guardian wave: its index (0 to 9) and awakening cycle (0 below wave 1001). */
export function guardianAt(wave: number): { index: number; awakening: number } {
  const rank = wave / BALANCE.guardian.every - 1;
  return {
    index: rank % BALANCE.guardian.count,
    awakening: Math.floor(rank / BALANCE.guardian.count),
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
