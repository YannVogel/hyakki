import * as fc from 'fast-check';

import { div, log10, toNumber } from '../numbers';
import { generate, rarityMultiplier, statsOf } from '../yokai';
import { waveHp, waveSouls, yokaiMaxHp, yokaiProfile } from './enemy';

describe('enemy formulas', () => {
  it('follows 12 × 1.165^(v − 1) for the wave HP', () => {
    expect(toNumber(waveHp(1))).toBe(12);
    expect(toNumber(waveHp(2))).toBeCloseTo(13.98, 10);
    expect(log10(waveHp(4001))).toBeCloseTo(Math.log10(12) + 4000 * Math.log10(1.165), 6);
  });

  it('follows 2 × 1.14^(v − 1) for the wave souls', () => {
    expect(toNumber(waveSouls(1))).toBe(2);
    expect(toNumber(waveSouls(11))).toBeCloseTo(2 * 1.14 ** 10, 10);
  });

  it('scales a yōkai HP with its HP stat', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 2 ** 31 - 1 }),
        fc.integer({ min: 1, max: 5000 }),
        (seed, wave) => {
          const ratio = toNumber(div(yokaiMaxHp(wave, seed), waveHp(wave)));
          expect(ratio).toBeCloseTo(statsOf(generate(seed)).hp / 100, 10);
        },
      ),
    );
  });

  it('pays rare and bell-wearing yōkai more souls', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 ** 31 - 1 }), (seed) => {
        const spec = generate(seed);
        const expected = rarityMultiplier(spec) * (1 + statsOf(spec).soulsBonus);
        expect(yokaiProfile(seed).soulsFactor).toBeCloseTo(expected, 12);
        expect(yokaiProfile(seed)).toBe(yokaiProfile(seed));
      }),
    );
  });

  it('keeps the profile cache bounded', () => {
    for (let seed = 0; seed < 3000; seed++) {
      yokaiProfile(seed);
    }
    expect(yokaiProfile(1).hpFactor).toBe(statsOf(generate(1)).hp / 100);
  });
});
