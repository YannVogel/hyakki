import * as fc from 'fast-check';

import { countCombinations, generate, GENERATOR_VERSION, type YokaiSpec } from './generate';
import { loadPrototype, toEngineShape } from './testing/prototype';

const REFERENCE_SEEDS = [0, 1, 7, 42, 2026, 999_999];

const withoutSeed = ({ seed: _seed, generatorVersion: _version, ...rest }: YokaiSpec) => rest;

describe('generate', () => {
  it('produces exactly the prototype yōkai (10 000 seeds)', () => {
    const prototype = loadPrototype();
    for (let seed = 0; seed < 10_000; seed++) {
      expect(withoutSeed(generate(seed))).toEqual(toEngineShape(prototype.generate(seed)));
    }
  });

  it('matches the prototype on random seeds', () => {
    const prototype = loadPrototype();
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 999_999_999 }), (seed) => {
        expect(withoutSeed(generate(seed))).toEqual(toEngineShape(prototype.generate(seed)));
      }),
    );
  });

  it('keeps the reference seeds stable (values from the prototype run in Node)', () => {
    expect(REFERENCE_SEEDS.map(generate)).toMatchSnapshot();
  });

  it('is deterministic and stamps the generator version', () => {
    fc.assert(
      fc.property(fc.integer(), (seed) => {
        const spec = generate(seed);
        expect(generate(seed)).toEqual(spec);
        expect(spec.seed).toBe(seed);
        expect(spec.generatorVersion).toBe(GENERATOR_VERSION);
      }),
    );
  });

  it('never combines excluded parts', () => {
    fc.assert(
      fc.property(fc.integer(), (seed) => {
        const { object, limbs, accessories } = generate(seed);
        expect(accessories.includes('horns') && accessories.includes('horn')).toBe(false);
        expect(new Set(accessories).size).toBe(accessories.length);
        expect(accessories.length).toBeLessThanOrEqual(2);
        if (object === 'umbrella' || object === 'geta') {
          expect(accessories).not.toContain('hachimaki');
        }
        if (object === 'geta') {
          expect(['leg', 'legs']).not.toContain(limbs);
        }
      }),
      { numRuns: 2000 },
    );
  });

  it('draws rarities within one point of their targets over 100 000 seeds', () => {
    const counts = { common: 0, rare: 0, epic: 0, legendary: 0 };
    const draws = 100_000;
    for (let seed = 0; seed < draws; seed++) {
      counts[generate(seed).rarity]++;
    }
    const targets = { common: 0.6, rare: 0.25, epic: 0.11, legendary: 0.04 };
    for (const rarity of Object.keys(targets) as (keyof typeof targets)[]) {
      expect(Math.abs(counts[rarity] / draws - targets[rarity])).toBeLessThan(0.01);
    }
  });

  it('counts the same 285 696 combinations as the prototype', () => {
    expect(countCombinations()).toBe(285_696);
    expect(countCombinations()).toBe(loadPrototype().COMBOS);
  });
});
