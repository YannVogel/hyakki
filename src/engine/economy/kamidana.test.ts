import * as fc from 'fast-check';

import { createNewGame, type GameState, KAMIDANA_IDS, type KamidanaId } from '../gameState';
import { arbitraryGameState } from '../testing/arbitraries';
import {
  buyKamidana,
  kamidanaCost,
  kamidanaMaxLevel,
  kamidanaRefund,
  refundKamidana,
} from './kamidana';

const anyUpgrade = fc.constantFrom(...KAMIDANA_IDS);

const withOfuda = (ofuda: number, kamidana: Partial<GameState['kamidana']> = {}): GameState => {
  const state = createNewGame(1);
  return { ...state, ofuda, kamidana: { ...state.kamidana, ...kamidana } };
};

/** Buys the upgrades in order, skipping a refused purchase. */
function buyAll(state: GameState, upgrades: readonly KamidanaId[]): GameState {
  return upgrades.reduce((current, upgrade) => {
    const result = buyKamidana(current, upgrade);
    return result.ok ? result.state : current;
  }, state);
}

describe('kamidanaCost', () => {
  it('starts at the base cost and doubles at each level', () => {
    expect(kamidanaCost('blessing', 0)).toBe(10);
    expect(kamidanaCost('blessing', 1)).toBe(20);
    expect(kamidanaCost('blessing', 3)).toBe(80);
    expect(kamidanaCost('inariPalm', 0)).toBe(5);
  });

  it('is a whole, positive number of ofuda up to the max level', () => {
    for (const upgrade of KAMIDANA_IDS) {
      for (let level = 0; level < kamidanaMaxLevel(upgrade); level++) {
        const cost = kamidanaCost(upgrade, level);
        expect(Number.isInteger(cost) && cost > 0).toBe(true);
      }
    }
  });

  it('caps the guardian timer at 50 s and the offline efficiency at 100 %', () => {
    expect(kamidanaMaxLevel('hourglass')).toBe(4);
    expect(kamidanaMaxLevel('vigil')).toBe(5);
  });
});

describe('buyKamidana', () => {
  it('spends the cost and raises the level by one', () => {
    const result = buyKamidana(withOfuda(25), 'blessing');
    expect(result.ok && result.cost).toBe(10);
    expect(result.ok && result.state.ofuda).toBe(15);
    expect(result.ok && result.state.kamidana.blessing).toBe(1);
  });

  it('refuses a purchase the ofuda cannot pay', () => {
    expect(buyKamidana(withOfuda(9), 'blessing')).toEqual({
      ok: false,
      reason: 'not-enough-ofuda',
    });
  });

  it('refuses a level beyond the maximum, even with ofuda to spare', () => {
    expect(buyKamidana(withOfuda(1_000_000, { hourglass: 4 }), 'hourglass')).toEqual({
      ok: false,
      reason: 'max-level',
    });
  });

  it('never goes into debt nor beyond the max level', () => {
    fc.assert(
      fc.property(arbitraryGameState, fc.array(anyUpgrade, { maxLength: 40 }), (state, buys) => {
        const start = { ...state, kamidana: withOfuda(0).kamidana };
        const end = buyAll(start, buys);
        expect(end.ofuda).toBeGreaterThanOrEqual(0);
        for (const upgrade of KAMIDANA_IDS) {
          expect(end.kamidana[upgrade]).toBeLessThanOrEqual(kamidanaMaxLevel(upgrade));
        }
      }),
    );
  });

  it('changes nothing else in the state', () => {
    const state = withOfuda(100);
    const result = buyKamidana(state, 'vigil');
    expect(result.ok && { ...result.state, ofuda: 0, kamidana: state.kamidana }).toEqual({
      ...state,
      ofuda: 0,
    });
  });
});

describe('refundKamidana', () => {
  it('gives back every ofuda spent and puts every level back to zero', () => {
    fc.assert(
      fc.property(fc.nat(20_000), fc.array(anyUpgrade, { maxLength: 40 }), (ofuda, buys) => {
        const bought = buyAll(withOfuda(ofuda), buys);
        const result = refundKamidana(bought);
        if (!result.ok) {
          expect(bought).toEqual(withOfuda(ofuda));
          return;
        }
        expect(result.state.ofuda).toBe(ofuda);
        expect(result.ofuda).toBe(ofuda - bought.ofuda);
        expect(result.state.kamidana).toEqual(withOfuda(0).kamidana);
      }),
    );
  });

  it('is worth exactly the price of buying the same levels again', () => {
    fc.assert(
      fc.property(arbitraryGameState, (state) => {
        const refund = kamidanaRefund(state);
        const emptied = { ...state, ofuda: refund, kamidana: withOfuda(0).kamidana };
        const levels = KAMIDANA_IDS.flatMap((upgrade) =>
          Array.from({ length: state.kamidana[upgrade] }, () => upgrade),
        );
        const rebought = levels.reduce((current, upgrade) => {
          const cost = kamidanaCost(upgrade, current.kamidana[upgrade]);
          return {
            ...current,
            ofuda: current.ofuda - cost,
            kamidana: { ...current.kamidana, [upgrade]: current.kamidana[upgrade] + 1 },
          };
        }, emptied);
        expect(rebought.ofuda).toBe(0);
        expect(rebought.kamidana).toEqual(state.kamidana);
      }),
    );
  });

  it('refuses when nothing was bought', () => {
    expect(refundKamidana(withOfuda(50))).toEqual({ ok: false, reason: 'nothing-to-refund' });
  });

  it('refunds levels above a lowered maximum too', () => {
    const result = refundKamidana(withOfuda(0, { hourglass: 6 }));
    expect(result.ok && result.ofuda).toBe(10 + 20 + 40 + 80 + 160 + 320);
  });
});
