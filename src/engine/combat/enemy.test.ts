import * as fc from 'fast-check';

import { div, log10, toNumber } from '../numbers';
import { generate, GENERATOR_VERSIONS, rarityMultiplier, statsOf } from '../yokai';
import { waveHp, waveSouls, yokaiMaxHp, yokaiProfile } from './enemy';

const version = fc.constantFrom(...GENERATOR_VERSIONS);

describe('enemy formulas', () => {
  it('follows 12 × 1.13^(v − 1) for the wave HP', () => {
    expect(toNumber(waveHp(1))).toBe(12);
    expect(toNumber(waveHp(2))).toBeCloseTo(13.56, 10);
    expect(log10(waveHp(4001))).toBeCloseTo(Math.log10(12) + 4000 * Math.log10(1.13), 6);
  });

  it('follows 2 × 1.13^(v − 1) for the wave souls', () => {
    expect(toNumber(waveSouls(1))).toBe(2);
    expect(toNumber(waveSouls(11))).toBeCloseTo(2 * 1.13 ** 10, 10);
  });

  it('scales a yōkai HP with its HP stat', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 2 ** 31 - 1 }),
        fc.integer({ min: 1, max: 5000 }),
        version,
        (seed, wave, drawn) => {
          const ratio = toNumber(div(yokaiMaxHp(wave, seed, drawn), waveHp(wave)));
          expect(ratio).toBeCloseTo(statsOf(generate(seed, drawn)).hp / 100, 10);
        },
      ),
    );
  });

  it('pays rare and bell-wearing yōkai more souls', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 ** 31 - 1 }), version, (seed, drawn) => {
        const spec = generate(seed, drawn);
        const expected = rarityMultiplier(spec) * (1 + statsOf(spec).soulsBonus);
        expect(yokaiProfile(seed, drawn).soulsFactor).toBeCloseTo(expected, 12);
        expect(yokaiProfile(seed, drawn)).toBe(yokaiProfile(seed, drawn));
      }),
    );
  });

  it('keeps the profile cache bounded', () => {
    for (let seed = 0; seed < 3000; seed++) {
      yokaiProfile(seed, 2);
    }
    expect(yokaiProfile(1, 2).hpFactor).toBe(statsOf(generate(1, 2)).hp / 100);
  });

  it('keeps the yōkai of each version apart', () => {
    const differs = Array.from({ length: 50 }, (_, seed) => seed).some(
      (seed) => yokaiProfile(seed, 1).hpFactor !== yokaiProfile(seed, 2).hpFactor,
    );
    expect(differs).toBe(true);
    expect(yokaiProfile(3, 1).hpFactor).toBe(statsOf(generate(3, 1)).hp / 100);
  });
});
