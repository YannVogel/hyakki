import type { YokaiSpec } from './generate';
import { OBJECTS, type StatId } from './parts';
import { rarityMultiplier, type Trait, traitsOf } from './traits';

export const BASE_CRIT_CHANCE = 0.05;

export interface YokaiStats {
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly speed: number;
  /** Critical hit chance, as a fraction. */
  readonly critChance: number;
  /** Burn per second as a fraction of the target's max HP (onibi). */
  readonly burnRate: number;
  /** Extra souls, as a fraction (bell). */
  readonly soulsBonus: number;
  readonly traits: readonly Trait[];
}

const STAT_IDS: readonly StatId[] = ['hp', 'attack', 'defense', 'speed'];

/**
 * Final stat = object stat × (1 + sum of the bonuses of that stat) × rarity multiplier, rounded
 * like the prototype. Bonuses are summed in part order, like the prototype, so that rounding
 * matches it exactly.
 */
export function statsOf(spec: YokaiSpec): YokaiStats {
  const object = OBJECTS.find((candidate) => candidate.id === spec.object);
  if (object === undefined) {
    throw new RangeError(`Unknown object: ${spec.object}`);
  }
  const traits = traitsOf(spec);
  const multipliers: Record<StatId, number> = { hp: 1, attack: 1, defense: 1, speed: 1 };
  let critChance = BASE_CRIT_CHANCE;
  let burnRate = 0;
  let soulsBonus = 0;

  for (const effect of traits.flatMap((trait) => trait.effects)) {
    switch (effect.kind) {
      case 'stat':
        multipliers[effect.stat] += effect.value;
        break;
      case 'crit':
        critChance += effect.value;
        break;
      case 'burn':
        burnRate += effect.value;
        break;
      case 'souls':
        soulsBonus += effect.value;
        break;
      case 'allStats':
        break;
    }
  }

  const rarity = rarityMultiplier(spec);
  const [hp, attack, defense, speed] = STAT_IDS.map((id) =>
    Math.round(object.stats[id] * multipliers[id] * rarity),
  );
  return { hp, attack, defense, speed, critChance, burnRate, soulsBonus, traits };
}
