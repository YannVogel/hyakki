import { type GameState, TALISMAN_IDS, type TalismanId } from '../gameState';
import { div, eq, toNumber } from '../numbers';
import { stateAtWave } from '../testing/states';
import { guardianMaxHp } from './guardians';
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
    const state = idle(stateAtWave(2, 200));
    const engaged = step(state, 0, [ENGAGE, cast('kitsunebi')]);
    const fire = hits(engaged)[0];
    // Guardian of wave 200 (Kappa) is weak to thunder: no bonus for fire.
    expect(fire.type === 'hit' && toNumber(fire.damage)).toBe(20);
    const after = step(engaged.state, 10_000).state;
    const burnt = toNumber(div(after.enemy.damage, guardianMaxHp(200)));
    // 5 s × 1 %/s, at 20 % efficiency against a guardian, on top of the 20 hits.
    const hitsShare = toNumber(div(20, guardianMaxHp(200)));
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
    const state = stateAtWave(5, 10, { blade: 1e6 });
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
