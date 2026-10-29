import { BALANCE } from '../balance';

/** × (1 + 5 % per spark earned over all parades). */
export function festivalBonus(sparks: number): number {
  return 1 + BALANCE.festival.bonusPerSpark * sparks;
}
