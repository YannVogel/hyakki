import * as fc from 'fast-check';

import { BALANCE } from '../balance';
import { type GameState, type KamidanaId } from '../gameState';
import { div, gte, toNumber } from '../numbers';
import { simulateOffline } from '../offline';
import { arbitraryGameState } from '../testing/arbitraries';
import { stateAtWave } from '../testing/states';
import { GENERATOR_VERSION } from '../yokai';
import { step } from './step';
import { combatPower, expectedDps } from './power';

const COMBAT_UPGRADES = ['blessing', 'tenguEye', 'inariPalm', 'shikigamiPact'] as const;

const withKamidana = (state: GameState, levels: Partial<GameState['kamidana']>): GameState => ({
  ...state,
  kamidana: { ...state.kamidana, ...levels },
});

const ratio = (a: Parameters<typeof toNumber>[0], b: Parameters<typeof toNumber>[0]) =>
  toNumber(div(a, b));

/** A team of three strong shikigami at wave 30, so that every attacker counts. */
function teamState(seed: number): GameState {
  const base = stateAtWave(seed, 30, { blade: 20 });
  const shikigami = [11, 22, 33].map((seed) => ({
    seed,
    level: 5,
    generatorVersion: GENERATOR_VERSION,
  }));
  return {
    ...base,
    shikigami,
    team: [11, 22, 33],
    attackTimers: { hero: 0, team: [0, 0, 0] },
  };
}

describe('combatPower with the Kamidana', () => {
  it('changes nothing at level 0', () => {
    fc.assert(
      fc.property(arbitraryGameState, (state) => {
        const zero = withKamidana(state, {
          blessing: 0,
          tenguEye: 0,
          inariPalm: 0,
          shikigamiPact: 0,
        });
        const power = combatPower(zero);
        expect(power.critMultiplier).toBe(BALANCE.crit.multiplier);
        expect(ratio(power.tapDamage, power.heroHitDamage)).toBeCloseTo(
          BALANCE.hero.tapMultiplier,
          9,
        );
      }),
    );
  });

  it('multiplies every hit by 1.5 per Blessing level, taps and team included', () => {
    const state = teamState(4);
    const base = combatPower(state);
    const blessed = combatPower(withKamidana(state, { blessing: 3 }));
    expect(ratio(blessed.heroHitDamage, base.heroHitDamage)).toBeCloseTo(1.5 ** 3, 9);
    expect(ratio(blessed.tapDamage, base.tapDamage)).toBeCloseTo(1.5 ** 3, 9);
    blessed.team.forEach((member, index) => {
      expect(ratio(member.hitDamage, base.team[index].hitDamage)).toBeCloseTo(1.5 ** 3, 9);
    });
  });

  it("adds 1 to the critical multiplier per Tengu's Eye level", () => {
    expect(combatPower(withKamidana(teamState(1), { tenguEye: 2 })).critMultiplier).toBe(5);
  });

  it("doubles the taps only, per Inari's Palm level", () => {
    const state = teamState(2);
    const base = combatPower(state);
    const palm = combatPower(withKamidana(state, { inariPalm: 4 }));
    expect(ratio(palm.tapDamage, base.tapDamage)).toBeCloseTo(16, 9);
    expect(ratio(palm.heroHitDamage, base.heroHitDamage)).toBeCloseTo(1, 9);
  });

  it('multiplies the team hits only, per Pact level', () => {
    const state = teamState(3);
    const base = combatPower(state);
    const pact = combatPower(withKamidana(state, { shikigamiPact: 2 }));
    expect(ratio(pact.heroHitDamage, base.heroHitDamage)).toBeCloseTo(1, 9);
    pact.team.forEach((member, index) => {
      expect(ratio(member.hitDamage, base.team[index].hitDamage)).toBeCloseTo(2.25, 9);
    });
  });

  it('never lowers the damage when a combat upgrade gains a level', () => {
    fc.assert(
      fc.property(
        arbitraryGameState,
        fc.constantFrom<KamidanaId>(...COMBAT_UPGRADES),
        (state, upgrade) => {
          const before = combatPower(state);
          const after = combatPower(
            withKamidana(state, { [upgrade]: state.kamidana[upgrade] + 1 }),
          );
          expect(gte(after.heroHitDamage, before.heroHitDamage)).toBe(true);
          expect(gte(after.tapDamage, before.tapDamage)).toBe(true);
          expect(gte(expectedDps(after), expectedDps(before))).toBe(true);
          expect(after.critMultiplier).toBeGreaterThanOrEqual(before.critMultiplier);
        },
      ),
    );
  });
});

describe('critical hits with the Kamidana', () => {
  it("hit for the Tengu's Eye multiplier", () => {
    const state = withKamidana(teamState(5), { tenguEye: 3 });
    const power = combatPower(state);
    const { events } = step(state, 20_000);
    const heroHits = events.filter((event) => event.type === 'hit' && event.source === 'hero');
    const crits = heroHits.filter((event) => event.type === 'hit' && event.crit);
    expect(crits.length).toBeGreaterThan(0);
    for (const event of crits) {
      if (event.type === 'hit') {
        expect(ratio(event.damage, power.heroHitDamage)).toBeCloseTo(6, 9);
      }
    }
  });
});

describe('offline play with the Kamidana', () => {
  it("ignores Inari's Palm: nobody taps while away", () => {
    const state = stateAtWave(8, 40, { blade: 30 });
    const without = simulateOffline(state, 3_600_000).state;
    const palm = simulateOffline(withKamidana(state, { inariPalm: 8 }), 3_600_000).state;
    expect(palm.parade.wave).toBe(without.parade.wave);
    expect(ratio(palm.souls, without.souls)).toBeCloseTo(1, 9);
  });

  it('goes further with the Blessing and the Pact', () => {
    const state = teamState(9);
    const without = simulateOffline(state, 3_600_000).state;
    const blessed = simulateOffline(
      withKamidana(state, { blessing: 4, shikigamiPact: 4 }),
      3_600_000,
    ).state;
    expect(blessed.parade.wave).toBeGreaterThan(without.parade.wave);
  });

  it('stays close to active play over 10 minutes with combat upgrades (±1 wave, ±15 % souls)', () => {
    for (const seed of [1, 2, 3]) {
      const state = withKamidana(teamState(seed), {
        blessing: 2,
        tenguEye: 2,
        inariPalm: 3,
        shikigamiPact: 2,
      });
      const active = step(state, 600_000).state;
      const offline = simulateOffline(state, 600_000, 1).state;
      expect(Math.abs(offline.parade.wave - active.parade.wave)).toBeLessThanOrEqual(1);
      expect(Math.abs(ratio(offline.souls, active.souls) - 1)).toBeLessThan(0.15);
    }
  });
});
