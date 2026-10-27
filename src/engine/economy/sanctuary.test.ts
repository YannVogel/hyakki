import * as fc from 'fast-check';

import { createNewGame, type GameState, UPGRADE_IDS } from '../gameState';
import { add, big, div, eq, gte, lt, mul, pow, sub, toNumber, ZERO } from '../numbers';
import { arbitraryBigNum } from '../testing/arbitraries';
import {
  buyUpgrade,
  maxAffordable,
  type PurchaseMode,
  upgradeCost,
  upgradeMaxLevel,
} from './sanctuary';

const anyUpgrade = fc.constantFrom(...UPGRADE_IDS);
const anyLevel = fc.integer({ min: 0, max: 3000 });

const relativeGap = (a: ReturnType<typeof big>, b: ReturnType<typeof big>) =>
  eq(a, b) ? 0 : Math.abs(toNumber(div(sub(a, b), a)));

const withSouls = (
  souls: ReturnType<typeof big>,
  sanctuary: Partial<GameState['sanctuary']> = {},
) => {
  const state = createNewGame(1);
  return { ...state, souls, sanctuary: { ...state.sanctuary, ...sanctuary } };
};

describe('upgradeCost', () => {
  it('starts at the base cost of the game design', () => {
    expect(UPGRADE_IDS.map((id) => toNumber(upgradeCost(id, 0, 1)))).toEqual([
      10, 500, 150, 5000, 50_000,
    ]);
    expect(toNumber(upgradeCost('blade', 1, 1))).toBeCloseTo(11.5, 10);
  });

  it('costs exactly ten single purchases for a ×10 purchase', () => {
    fc.assert(
      fc.property(anyUpgrade, anyLevel, (upgrade, level) => {
        let sum = ZERO;
        for (let i = 0; i < 10; i++) {
          sum = add(sum, upgradeCost(upgrade, level + i, 1));
        }
        expect(relativeGap(upgradeCost(upgrade, level, 10), sum)).toBeLessThan(1e-9);
      }),
    );
  });

  it('is free for zero levels', () => {
    expect(eq(upgradeCost('bell', 12, 0), 0)).toBe(true);
  });
});

describe('maxAffordable', () => {
  it('buys as many levels as possible, never more than the souls allow', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('blade', 'foxfire', 'bell' as const),
        anyLevel,
        arbitraryBigNum,
        (upgrade, level, souls) => {
          const count = maxAffordable(upgrade, level, souls);
          expect(gte(souls, upgradeCost(upgrade, level, count))).toBe(true);
          expect(lt(souls, upgradeCost(upgrade, level, count + 1))).toBe(true);
        },
      ),
    );
  });

  it('stops at the maximum level', () => {
    expect(maxAffordable('kekkai', 20, pow(10, 300))).toBe(5);
    expect(maxAffordable('lanterns', 16, pow(10, 300))).toBe(0);
    expect(upgradeMaxLevel('blade')).toBe(Infinity);
  });
});

describe('buyUpgrade', () => {
  it('buys one level', () => {
    const result = buyUpgrade(withSouls(big(25)), 'blade', 1);
    expect(result.ok && result.levels).toBe(1);
    expect(result.ok && result.state.sanctuary.blade).toBe(1);
    expect(result.ok && toNumber(result.state.souls)).toBe(15);
  });

  it('buys ten levels at the cost of ten', () => {
    const cost = upgradeCost('bell', 0, 10);
    const result = buyUpgrade(withSouls(mul(cost, 1.0001)), 'bell', 10);
    expect(result.ok && result.state.sanctuary.bell).toBe(10);
  });

  it('refuses when the souls are not enough', () => {
    expect(buyUpgrade(withSouls(big(9)), 'blade', 1)).toEqual({
      ok: false,
      reason: 'not-enough-souls',
    });
    expect(buyUpgrade(withSouls(big(100)), 'blade', 10)).toEqual({
      ok: false,
      reason: 'not-enough-souls',
    });
    expect(buyUpgrade(withSouls(big(9)), 'blade', 'max')).toEqual({
      ok: false,
      reason: 'not-enough-souls',
    });
  });

  it('refuses beyond the maximum level, and ×10 buys only what is left', () => {
    expect(buyUpgrade(withSouls(pow(10, 50), { kekkai: 25 }), 'kekkai', 1)).toEqual({
      ok: false,
      reason: 'max-level',
    });
    const result = buyUpgrade(withSouls(pow(10, 50), { kekkai: 22 }), 'kekkai', 10);
    expect(result.ok && result.levels).toBe(3);
  });

  it('never leaves a negative balance, whatever the mode', () => {
    fc.assert(
      fc.property(
        anyUpgrade,
        fc.integer({ min: 0, max: 15 }),
        arbitraryBigNum,
        fc.constantFrom<PurchaseMode>(1, 10, 'max'),
        (upgrade, level, souls, mode) => {
          const result = buyUpgrade(withSouls(souls, { [upgrade]: level }), upgrade, mode);
          if (result.ok) {
            expect(gte(result.state.souls, 0)).toBe(true);
            expect(
              eq(add(result.state.souls, result.cost), souls) ||
                relativeGap(add(result.state.souls, result.cost), souls) < 1e-9,
            ).toBe(true);
            expect(result.state.sanctuary[upgrade]).toBeLessThanOrEqual(upgradeMaxLevel(upgrade));
          }
        },
      ),
    );
  });
});
