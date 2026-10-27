import type { Rarity, Trait } from '@/engine';
import { traitEffectText } from '@/i18n';
import type { RarityToken } from '@/ui';

export const RARITY_TOKEN: Record<Rarity, RarityToken> = {
  common: 'commun',
  rare: 'rare',
  epic: 'epique',
  legendary: 'legendaire',
};

const OFFENSIVE = new Set(['crit', 'burn', 'souls']);

/** Main team bonus of a shikigami: its first offensive trait (attack, speed, crit…). */
export function mainTeamBonus(traits: readonly Trait[]): string | null {
  const trait = traits.find((candidate) =>
    candidate.effects.some(
      (effect) =>
        OFFENSIVE.has(effect.kind) ||
        (effect.kind === 'stat' &&
          (effect.stat === 'attack' || effect.stat === 'speed') &&
          effect.value > 0),
    ),
  );
  return trait === undefined ? null : traitEffectText(trait);
}
