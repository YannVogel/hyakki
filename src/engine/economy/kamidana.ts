import { BALANCE } from '../balance';
import { type GameState, KAMIDANA_IDS, type KamidanaId } from '../gameState';

export type KamidanaPurchaseResult =
  | { readonly ok: true; readonly state: GameState; readonly cost: number }
  | { readonly ok: false; readonly reason: 'not-enough-ofuda' | 'max-level' };

export type KamidanaRefundResult =
  | { readonly ok: true; readonly state: GameState; readonly ofuda: number }
  | { readonly ok: false; readonly reason: 'nothing-to-refund' };

export function kamidanaMaxLevel(upgrade: KamidanaId): number {
  return BALANCE.kamidana[upgrade].maxLevel;
}

/**
 * The main value an upgrade gives at `level`, as the engine applies it: a multiplier (damage,
 * critical hits, taps, team, weakness, talismans, souls, sparks, captures), the guardian timer in
 * seconds, the Head Start wave (before the record's cap) or the offline efficiency.
 */
export function kamidanaEffect(upgrade: KamidanaId, level: number): number {
  const { kamidana, crit, hero, guardian, talismans, offline } = BALANCE;
  switch (upgrade) {
    case 'blessing':
      return kamidana.blessing.damageGrowth ** level;
    case 'tenguEye':
      return crit.multiplier + kamidana.tenguEye.critMultiplierPerLevel * level;
    case 'inariPalm':
      return hero.tapMultiplier * kamidana.inariPalm.tapGrowth ** level;
    case 'shikigamiPact':
      return kamidana.shikigamiPact.teamDamageGrowth ** level;
    case 'hourglass':
      return (
        (guardian.timeLimitMs +
          kamidana.hourglass.extraMsPerLevel * Math.min(level, kamidana.hourglass.maxLevel)) /
        1000
      );
    case 'riftEye':
      return talismans.weaknessMultiplier + kamidana.riftEye.weaknessPerLevel * level;
    case 'greaterTalismans':
      return kamidana.greaterTalismans.damageGrowth ** level;
    case 'headStart':
      return 1 + kamidana.headStart.wavesPerLevel * level;
    case 'sacredPurse':
      return kamidana.sacredPurse.soulsGrowth ** level;
    case 'festivalFlame':
      return 1 + kamidana.festivalFlame.sparksPerLevel * level;
    case 'vigil':
      return Math.min(
        1,
        offline.efficiency +
          kamidana.vigil.efficiencyPerLevel * Math.min(level, kamidana.vigil.maxLevel),
      );
    case 'yokaiCall':
      return kamidana.yokaiCall.captureGrowth ** level;
  }
}

/** Ofuda to go from `level` to `level + 1`: whole ofuda, since the balance is a count. */
export function kamidanaCost(upgrade: KamidanaId, level: number): number {
  return Math.round(BALANCE.kamidana[upgrade].baseCost * BALANCE.kamidana.costGrowth ** level);
}

/**
 * Ofuda given back by a full refund: the price of the levels owned, at today's costs. A refund
 * is therefore always worth exactly what buying the same levels again costs.
 */
export function kamidanaRefund(state: GameState): number {
  let ofuda = 0;
  for (const upgrade of KAMIDANA_IDS) {
    for (let level = 0; level < state.kamidana[upgrade]; level++) {
      ofuda += kamidanaCost(upgrade, level);
    }
  }
  return ofuda;
}

/** Buys one level: the costs double, so ×10 or Max purchases would make no sense. */
export function buyKamidana(state: GameState, upgrade: KamidanaId): KamidanaPurchaseResult {
  const level = state.kamidana[upgrade];
  if (level >= kamidanaMaxLevel(upgrade)) {
    return { ok: false, reason: 'max-level' };
  }
  const cost = kamidanaCost(upgrade, level);
  if (cost > state.ofuda) {
    return { ok: false, reason: 'not-enough-ofuda' };
  }
  return {
    ok: true,
    cost,
    state: {
      ...state,
      ofuda: state.ofuda - cost,
      kamidana: { ...state.kamidana, [upgrade]: level + 1 },
    },
  };
}

/** Takes every ofuda back from the altar, free of charge, to place them elsewhere. */
export function refundKamidana(state: GameState): KamidanaRefundResult {
  const ofuda = kamidanaRefund(state);
  if (ofuda === 0) {
    return { ok: false, reason: 'nothing-to-refund' };
  }
  const kamidana = Object.fromEntries(KAMIDANA_IDS.map((id) => [id, 0])) as Record<
    KamidanaId,
    number
  >;
  return { ok: true, ofuda, state: { ...state, ofuda: state.ofuda + ofuda, kamidana } };
}
