import { BALANCE } from '../balance';
import type { GameState, UpgradeId } from '../gameState';
import { add, type BigNum, div, gt, log10, lte, mul, pow, sub, ZERO } from '../numbers';

export type PurchaseMode = 1 | 10 | 'max';

export type PurchaseResult =
  | { readonly ok: true; readonly state: GameState; readonly levels: number; readonly cost: BigNum }
  | { readonly ok: false; readonly reason: 'not-enough-souls' | 'max-level' };

const GROWTH = BALANCE.upgrades.costGrowth;

export function upgradeMaxLevel(upgrade: UpgradeId): number {
  const data = BALANCE.upgrades[upgrade];
  return 'maxLevel' in data ? data.maxLevel : Infinity;
}

/** Cost of buying `count` levels from `level`: base × 1.15^level × (1.15^count − 1) / 0.15. */
export function upgradeCost(upgrade: UpgradeId, level: number, count: number): BigNum {
  if (count <= 0) {
    return ZERO;
  }
  const first = mul(BALANCE.upgrades[upgrade].baseCost, pow(GROWTH, level));
  return div(mul(first, sub(pow(GROWTH, count), 1)), GROWTH - 1);
}

/** Most levels affordable with `souls` from `level` (closed form, then checked exactly). */
export function maxAffordable(upgrade: UpgradeId, level: number, souls: BigNum): number {
  const remaining = upgradeMaxLevel(upgrade) - level;
  if (remaining <= 0 || gt(upgradeCost(upgrade, level, 1), souls)) {
    return 0;
  }
  const first = mul(BALANCE.upgrades[upgrade].baseCost, pow(GROWTH, level));
  const ratio = add(div(mul(souls, GROWTH - 1), first), 1);
  let count = Math.min(remaining, Math.floor(log10(ratio) / Math.log10(GROWTH)));
  // The logarithm may be off by one either way because of float rounding.
  while (count > 0 && gt(upgradeCost(upgrade, level, count), souls)) {
    count -= 1;
  }
  while (count < remaining && lte(upgradeCost(upgrade, level, count + 1), souls)) {
    count += 1;
  }
  return count;
}

/** Buys ×1, ×10 (or what is left below the max level) or as many levels as possible. */
export function buyUpgrade(
  state: GameState,
  upgrade: UpgradeId,
  mode: PurchaseMode,
): PurchaseResult {
  const level = state.sanctuary[upgrade];
  const remaining = upgradeMaxLevel(upgrade) - level;
  if (remaining <= 0) {
    return { ok: false, reason: 'max-level' };
  }
  const levels =
    mode === 'max' ? maxAffordable(upgrade, level, state.souls) : Math.min(mode, remaining);
  const cost = upgradeCost(upgrade, level, levels);
  if (levels === 0 || gt(cost, state.souls)) {
    return { ok: false, reason: 'not-enough-souls' };
  }
  return {
    ok: true,
    levels,
    cost,
    state: {
      ...state,
      souls: sub(state.souls, cost),
      sanctuary: { ...state.sanctuary, [upgrade]: level + levels },
    },
  };
}
