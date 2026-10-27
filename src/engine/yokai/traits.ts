import type { YokaiSpec } from './generate';
import {
  type AccessoryId,
  type EyesId,
  type LimbsId,
  type MouthId,
  type PaletteId,
  RARITIES,
  type StatId,
} from './parts';

/** Bonuses are fractions: 0.08 means +8 %. */
export type TraitEffect =
  | { readonly kind: 'stat'; readonly stat: StatId; readonly value: number }
  /** Added to the critical hit chance (0.08 = +8 points). */
  | { readonly kind: 'crit'; readonly value: number }
  /** Burn dealt per second, as a fraction of the target's max HP. */
  | { readonly kind: 'burn'; readonly value: number }
  | { readonly kind: 'souls'; readonly value: number }
  /** Rarity palette: multiplies every stat. */
  | { readonly kind: 'allStats'; readonly multiplier: number };

export type TraitSource =
  | { readonly part: 'eyes'; readonly id: EyesId }
  | { readonly part: 'mouth'; readonly id: MouthId }
  | { readonly part: 'limbs'; readonly id: LimbsId }
  | { readonly part: 'accessory'; readonly id: AccessoryId }
  | { readonly part: 'palette'; readonly id: PaletteId };

export interface Trait {
  readonly source: TraitSource;
  readonly effects: readonly TraitEffect[];
}

const stat = (statId: StatId, value: number): TraitEffect => ({
  kind: 'stat',
  stat: statId,
  value,
});
const crit = (value: number): TraitEffect => ({ kind: 'crit', value });

// docs/PROCEDURAL_YOKAI.md § 4. Parts absent from these tables give no bonus.
export const EYES_EFFECTS: Partial<Record<EyesId, readonly TraitEffect[]>> = {
  cyclops: [crit(0.08)],
  slit: [crit(0.1)],
  three: [crit(0.15)],
  sly: [stat('attack', 0.08)],
  big: [stat('hp', 0.1)],
};

export const MOUTH_EFFECTS: Partial<Record<MouthId, readonly TraitEffect[]>> = {
  fangs: [stat('attack', 0.15)],
  teeth: [stat('attack', 0.1), stat('defense', 0.1)],
  tongue: [stat('speed', 0.1)],
};

export const LIMBS_EFFECTS: Partial<Record<LimbsId, readonly TraitEffect[]>> = {
  leg: [stat('speed', 0.15)],
  legs: [stat('speed', 0.25)],
  arms: [stat('attack', 0.15)],
};

export const ACCESSORY_EFFECTS: Record<AccessoryId, readonly TraitEffect[]> = {
  horns: [stat('attack', 0.2)],
  horn: [stat('attack', 0.1), crit(0.05)],
  onibi: [{ kind: 'burn', value: 0.03 }],
  ofuda: [stat('defense', 0.25)],
  cracks: [stat('attack', 0.15), stat('defense', -0.15)],
  hachimaki: [stat('speed', 0.2)],
  bell: [{ kind: 'souls', value: 0.1 }],
  bandage: [stat('hp', 0.2)],
  leaf: [{ kind: 'souls', value: 0.1 }],
  beads: [stat('hp', 0.15)],
  tail: [crit(0.06)],
  pipe: [stat('attack', 0.1)],
};

export function rarityMultiplier(spec: YokaiSpec): number {
  const tier = RARITIES.find((candidate) => candidate.id === spec.rarity);
  return tier?.statMultiplier ?? 1;
}

/** The yōkai's visible traits with their effects, in the order of the parts. */
export function traitsOf(spec: YokaiSpec): Trait[] {
  const traits: Trait[] = [];
  const add = (source: TraitSource, effects: readonly TraitEffect[] | undefined) => {
    if (effects !== undefined) {
      traits.push({ source, effects });
    }
  };
  add({ part: 'eyes', id: spec.eyes }, EYES_EFFECTS[spec.eyes]);
  add({ part: 'mouth', id: spec.mouth }, MOUTH_EFFECTS[spec.mouth]);
  add({ part: 'limbs', id: spec.limbs }, LIMBS_EFFECTS[spec.limbs]);
  for (const accessory of spec.accessories) {
    add({ part: 'accessory', id: accessory }, ACCESSORY_EFFECTS[accessory]);
  }
  if (spec.rarity !== 'common') {
    add({ part: 'palette', id: spec.palette }, [
      { kind: 'allStats', multiplier: rarityMultiplier(spec) },
    ]);
  }
  return traits;
}
