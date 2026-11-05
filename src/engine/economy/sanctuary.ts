import { BALANCE } from '../balance';
import type { GameState, UpgradeId } from '../gameState';
import { type BigNum, gt, mul, pow, sub } from '../numbers';
import { geometricCost, maxGeometricCount } from './geometric';

export type PurchaseMode = 1 | 10 | 'max';

export type PurchaseResult =
  | { readonly ok: true; readonly state: GameState; readonly levels: number; readonly cost: BigNum }
  | { readonly ok: false; readonly reason: 'not-enough-souls' | 'max-level' };

const GROWTH = BALANCE.upgrades.costGrowth;

export function upgradeMaxLevel(upgrade: UpgradeId): number {
  const data = BALANCE.upgrades[upgrade];
  return 'maxLevel' in data ? data.maxLevel : Infinity;
}

const firstCost = (upgrade: UpgradeId, level: number): BigNum =>
  mul(BALANCE.upgrades[upgrade].baseCost, pow(GROWTH, level));

/** Cost of buying `count` levels from `level`: base × 1.15^level × (1.15^count − 1) / 0.15. */
export function upgradeCost(upgrade: UpgradeId, level: number, count: number): BigNum {
  return geometricCost(firstCost(upgrade, level), GROWTH, count);
}

/** Most levels affordable with `souls` from `level` (closed form, then checked exactly). */
export function maxAffordable(upgrade: UpgradeId, level: number, souls: BigNum): number {
  const remaining = upgradeMaxLevel(upgrade) - level;
  return maxGeometricCount(firstCost(upgrade, level), GROWTH, souls, remaining);
}

/** Buys exactly `count` levels (fewer if the max level is closer). */
export function buyUpgradeLevels(
  state: GameState,
  upgrade: UpgradeId,
  count: number,
): PurchaseResult {
  const level = state.sanctuary[upgrade];
  const remaining = upgradeMaxLevel(upgrade) - level;
  if (remaining <= 0) {
    return { ok: false, reason: 'max-level' };
  }
  const levels = Math.min(count, remaining);
  const cost = upgradeCost(upgrade, level, levels);
  if (levels <= 0 || gt(cost, state.souls)) {
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

/** Buys ×1, ×10 (or what is left below the max level) or as many levels as possible. */
export function buyUpgrade(
  state: GameState,
  upgrade: UpgradeId,
  mode: PurchaseMode,
): PurchaseResult {
  const count =
    mode === 'max' ? maxAffordable(upgrade, state.sanctuary[upgrade], state.souls) : mode;
  return buyUpgradeLevels(state, upgrade, count);
}
