import { type GameState, TALISMAN_IDS, type TalismanId } from '../gameState';
import { div, eq, mul, toNumber } from '../numbers';
import { stateAtWave } from '../testing/states';
import { guardianMaxHp } from './guardians';
import { combatPower } from './power';
import { step } from './step';
import { talismanCooldownMs } from './talismans';

const cast = (talisman: TalismanId) => ({ type: 'castTalisman', talisman }) as const;
const ENGAGE = { type: 'engageGuardian' } as const;
/** The hero never attacks: only talismans deal damage. */
const idle = (state: GameState): GameState => ({
  ...state,
  attackTimers: { hero: 1e12, team: [] },
});
const hits = (result: ReturnType<typeof step>) =>
  result.events.filter((event) => event.type === 'hit');

describe('talismans', () => {
  it('Raijin deals 50 hero hits at once, without critical hits', () => {
    const result = step(idle(stateAtWave(1, 50)), 0, [cast('raijin')]);
    expect(hits(result)).toEqual([expect.objectContaining({ source: 'raijin', crit: false })]);
    const [raijin] = hits(result);
    expect(raijin.type === 'hit' && toNumber(raijin.damage)).toBe(50);
    expect(result.state.cooldowns.raijin).toBe(60_000);
  });

  it('Kitsune-bi deals 20 hero hits, then burns 1 % of max HP per second for 5 s', () => {
    // The Blade keeps the burn under its cap (9 times the hits), without one-shotting the guardian.
    const state = idle(stateAtWave(2, 200, { blade: 260 }));
    const engaged = step(state, 0, [ENGAGE, cast('kitsunebi')]);
    const fire = hits(engaged)[0];
    const fireDamage = mul(combatPower(state).heroHitDamage, 20);
    // Guardian of wave 200 (Kappa) is weak to thunder: no bonus for fire.
    expect(fire.type === 'hit' && eq(fire.damage, fireDamage)).toBe(true);
    const after = step(engaged.state, 10_000).state;
    const burnt = toNumber(div(after.enemy.damage, guardianMaxHp(200)));
    // 5 s × 1 %/s, at 20 % efficiency against a guardian, on top of the 20 hits.
    const hitsShare = toNumber(div(fireDamage, guardianMaxHp(200)));
    expect(burnt - hitsShare).toBeCloseTo(0.05 * 0.2, 9);
    expect(after.effects.burnMs).toBe(0);
  });

  it('doubles talisman damage on the guardian weak to it', () => {
    const kappa = step(idle(stateAtWave(3, 200)), 0, [ENGAGE, cast('raijin')]);
    const danuki = step(idle(stateAtWave(3, 100)), 0, [ENGAGE, cast('raijin')]);
    const damage = (result: ReturnType<typeof step>) => {
      const [event] = hits(result);
      return event.type === 'hit' ? toNumber(event.damage) : 0;
    };
    expect(damage(kappa)).toBe(100);
    expect(damage(danuki)).toBe(50);
  });

  it('Kekkai adds 5 s against an engaged guardian', () => {
    const result = step(idle(stateAtWave(4, 300)), 1000, [ENGAGE, cast('kekkai')]);
    expect(result.state.enemy.guardian).toEqual({ engaged: true, timeLeftMs: 34_000 });
  });

  it('Kekkai doubles souls for 10 s otherwise', () => {
    const state = stateAtWave(5, 10, { blade: 100 });
    const boosted = step(state, 0, [cast('kekkai'), { type: 'tap' }]);
    const plain = step(state, 0, [{ type: 'tap' }]);
    expect(toNumber(div(boosted.state.souls, plain.state.souls))).toBeCloseTo(2, 9);
    expect(boosted.state.effects.soulsBoostMs).toBe(10_000);
    const later = step(boosted.state, 10_000).state;
    expect(later.effects.soulsBoostMs).toBe(0);
  });

  it('refuses a talisman still recharging', () => {
    const first = step(idle(stateAtWave(6, 20)), 1000, [cast('raijin')]);
    const second = step(first.state, 0, [cast('raijin')]);
    expect(second.events).toEqual([
      { type: 'talismanNotReady', talisman: 'raijin', cooldownMs: 59_000, atMs: 0 },
    ]);
    const ready = step(first.state, 59_000).state;
    expect(step(ready, 0, [cast('raijin')]).events[0]).toMatchObject({ type: 'talismanCast' });
  });

  it('refuses talismans during a guardian cut-in, but cooldowns keep running', () => {
    const waiting = stateAtWave(7, 100);
    expect(step(waiting, 0, [cast('raijin')]).events).toEqual([
      { type: 'talismanNotReady', talisman: 'raijin', cooldownMs: 0, atMs: 0 },
    ]);
    const recharging = { ...waiting, cooldowns: { ...waiting.cooldowns, kekkai: 9_000 } };
    expect(step(recharging, 5_000).state.cooldowns.kekkai).toBe(4_000);
  });

  it('shortens cooldowns by 2 % per Kekkai level, up to 50 %', () => {
    expect(TALISMAN_IDS.map((id) => talismanCooldownMs(id, 0))).toEqual([30_000, 60_000, 45_000]);
    expect(talismanCooldownMs('raijin', 10)).toBe(48_000);
    expect(talismanCooldownMs('raijin', 25)).toBe(30_000);
    expect(talismanCooldownMs('raijin', 40)).toBe(30_000);
    const upgraded = step(idle(stateAtWave(8, 20, { kekkai: 10 })), 0, [cast('raijin')]);
    expect(upgraded.state.cooldowns.raijin).toBe(48_000);
  });

  it('does not depend on the tick size while Kitsune-bi burns', () => {
    const start = step(stateAtWave(9, 40, { blade: 50 }), 0, [cast('kitsunebi')]).state;
    const single = step(start, 12_000).state;
    let split = start;
    for (let i = 0; i < 48; i++) {
      split = step(split, 250).state;
    }
    expect(split.parade).toEqual(single.parade);
    expect(split.rngState).toBe(single.rngState);
    expect(split.cooldowns).toEqual(single.cooldowns);
    expect(
      eq(split.souls, single.souls) ||
        Math.abs(toNumber(div(split.souls, single.souls)) - 1) < 1e-9,
    ).toBe(true);
  });
});

describe('Kamidana: guardians and talismans', () => {
  const withKamidana = (state: GameState, levels: Partial<GameState['kamidana']>): GameState => ({
    ...state,
    kamidana: { ...state.kamidana, ...levels },
  });

  it('gives the guardian 5 s more per Hourglass level when the fight starts, 50 s at most', () => {
    const engage = (hourglass: number) =>
      step(withKamidana(stateAtWave(1, 100), { hourglass }), 0, [ENGAGE]).state.enemy.guardian;
    expect(engage(0)?.timeLeftMs).toBe(30_000);
    expect(engage(2)?.timeLeftMs).toBe(40_000);
    expect(engage(9)?.timeLeftMs).toBe(50_000);
  });

  it('gives a new guardian the longer timer from its appearance', () => {
    const state = withKamidana(stateAtWave(4, 99, { blade: 400 }), { hourglass: 3 });
    const guardian = step(state, 5_000).state.enemy.guardian;
    expect(guardian).toEqual({ engaged: false, timeLeftMs: 45_000 });
  });

  it('leaves a running timer alone when the Hourglass changes mid-fight', () => {
    const state = idle(stateAtWave(1, 100));
    const fighting = {
      ...state,
      enemy: { ...state.enemy, guardian: { engaged: true, timeLeftMs: 12_000 } },
    };
    const bought = withKamidana(fighting, { hourglass: 4 });
    expect(step(bought, 0, [ENGAGE]).state.enemy.guardian?.timeLeftMs).toBe(12_000);
  });

  it("adds 1 to the weakness bonus per Rift's Eye level", () => {
    // Kappa (wave 200) is weak to thunder.
    const raijin = (riftEye: number) => {
      const state = withKamidana(idle(stateAtWave(3, 200, { blade: 300 })), { riftEye });
      const [hit] = hits(step(state, 0, [ENGAGE, cast('raijin')]));
      return hit.type === 'hit' ? toNumber(div(hit.damage, combatPower(state).heroHitDamage)) : 0;
    };
    expect(raijin(0)).toBeCloseTo(100, 9);
    expect(raijin(2)).toBeCloseTo(200, 9);
  });

  it('doubles Kitsune-bi and Raijin per Greater Talismans level', () => {
    const state = withKamidana(idle(stateAtWave(5, 50)), { greaterTalismans: 2 });
    const [raijin] = hits(step(state, 0, [cast('raijin')]));
    const [fire] = hits(step(state, 0, [cast('kitsunebi')]));
    expect(raijin.type === 'hit' && toNumber(raijin.damage)).toBe(200);
    expect(fire.type === 'hit' && toNumber(fire.damage)).toBe(80);
  });

  it("doubles Kitsune-bi's burn too, still under the burn cap", () => {
    const burn = (greaterTalismans: number) => {
      const state = withKamidana(idle(stateAtWave(2, 200, { blade: 260 })), { greaterTalismans });
      const engaged = step(state, 0, [ENGAGE, cast('kitsunebi')]);
      const [fire] = hits(engaged);
      const after = step(engaged.state, 10_000).state.enemy.damage;
      return fire.type === 'hit' ? toNumber(div(after, guardianMaxHp(200))) : 0;
    };
    const fireShare = (level: number) =>
      toNumber(
        div(
          mul(combatPower(stateAtWave(2, 200, { blade: 260 })).heroHitDamage, 20 * 2 ** level),
          guardianMaxHp(200),
        ),
      );
    expect(burn(1) - fireShare(1)).toBeCloseTo(2 * (burn(0) - fireShare(0)), 9);
  });

  it("lengthens Kekkai's souls boost by 5 s per Greater Talismans level", () => {
    const state = withKamidana(stateAtWave(6, 40), { greaterTalismans: 2 });
    expect(step(state, 0, [cast('kekkai')]).state.effects.soulsBoostMs).toBe(20_000);
  });

  it('keeps the talismans as they were at level 0', () => {
    for (const talisman of TALISMAN_IDS) {
      const state = idle(stateAtWave(7, 300, { blade: 100 }));
      const zero = withKamidana(state, { riftEye: 0, greaterTalismans: 0, hourglass: 0 });
      expect(step(zero, 0, [ENGAGE, cast(talisman)])).toEqual(
        step(state, 0, [ENGAGE, cast(talisman)]),
      );
    }
  });
});
