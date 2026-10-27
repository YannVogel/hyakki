import * as fc from 'fast-check';

import { countCombinations, generate, GENERATOR_VERSION, type YokaiSpec } from './generate';
import { GENERATOR_VERSIONS, PARTS } from './parts';
import { loadPrototype, toEngineShape } from './testing/prototype';

const REFERENCE_SEEDS = [0, 1, 7, 42, 2026, 999_999];

const withoutSeed = ({ seed: _seed, generatorVersion: _version, ...rest }: YokaiSpec) => rest;
const v1 = (seed: number) => generate(seed, 1);
const v2 = (seed: number) => generate(seed, 2);
const version = fc.constantFrom(...GENERATOR_VERSIONS);

describe('generate', () => {
  it('produces exactly the prototype yōkai in version 1 (10 000 seeds)', () => {
    const prototype = loadPrototype();
    for (let seed = 0; seed < 10_000; seed++) {
      expect(withoutSeed(v1(seed))).toEqual(toEngineShape(prototype.generate(seed)));
    }
  });

  it('matches the prototype on random seeds', () => {
    const prototype = loadPrototype();
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 999_999_999 }), (seed) => {
        expect(withoutSeed(v1(seed))).toEqual(toEngineShape(prototype.generate(seed)));
      }),
    );
  });

  it('keeps the reference seeds stable (values from the prototype run in Node)', () => {
    expect(REFERENCE_SEEDS.map(v1)).toMatchSnapshot();
  });

  it('keeps the reference seeds of version 2 stable', () => {
    expect(REFERENCE_SEEDS.map(v2)).toMatchSnapshot();
  });

  it('draws new parades with version 2', () => {
    expect(GENERATOR_VERSION).toBe(2);
  });

  it('keeps every part of version 1 in version 2, at the same place', () => {
    expect(PARTS[2].objects.slice(0, PARTS[1].objects.length)).toEqual(PARTS[1].objects);
    expect(PARTS[2].accessories.map((accessory) => accessory.id).slice(0, 8)).toEqual(
      PARTS[1].accessories.map((accessory) => accessory.id),
    );
  });

  it('meets every new object and accessory in version 2', () => {
    const objects = new Set<string>();
    const accessories = new Set<string>();
    for (let seed = 0; seed < 5_000; seed++) {
      const spec = v2(seed);
      objects.add(spec.object);
      spec.accessories.forEach((accessory) => accessories.add(accessory));
    }
    expect(objects.size).toBe(12);
    expect(accessories.size).toBe(12);
  });

  it('is deterministic and stamps the generator version', () => {
    fc.assert(
      fc.property(fc.integer(), version, (seed, drawn) => {
        const spec = generate(seed, drawn);
        expect(generate(seed, drawn)).toEqual(spec);
        expect(spec.seed).toBe(seed);
        expect(spec.generatorVersion).toBe(drawn);
      }),
    );
  });

  it('never combines excluded parts', () => {
    fc.assert(
      fc.property(fc.integer(), version, (seed, drawn) => {
        const { object, limbs, accessories } = generate(seed, drawn);
        expect(accessories.includes('horns') && accessories.includes('horn')).toBe(false);
        expect(accessories.includes('horn') && accessories.includes('leaf')).toBe(false);
        expect(new Set(accessories).size).toBe(accessories.length);
        expect(accessories.length).toBeLessThanOrEqual(2);
        if (['umbrella', 'geta', 'fan', 'sandal'].includes(object)) {
          expect(accessories).not.toContain('hachimaki');
        }
        if (object === 'geta' || object === 'sandal') {
          expect(['leg', 'legs']).not.toContain(limbs);
        }
      }),
      { numRuns: 4000 },
    );
  });

  it('draws rarities within one point of their targets over 100 000 seeds', () => {
    const counts = { common: 0, rare: 0, epic: 0, legendary: 0 };
    const draws = 100_000;
    for (let seed = 0; seed < draws; seed++) {
      counts[v2(seed).rarity]++;
    }
    const targets = { common: 0.6, rare: 0.25, epic: 0.11, legendary: 0.04 };
    for (const rarity of Object.keys(targets) as (keyof typeof targets)[]) {
      expect(Math.abs(counts[rarity] / draws - targets[rarity])).toBeLessThan(0.01);
    }
  });

  it('counts the same 285 696 combinations as the prototype in version 1', () => {
    expect(countCombinations(1)).toBe(285_696);
    expect(countCombinations(1)).toBe(loadPrototype().COMBOS);
  });

  it('counts the combinations of version 2 (docs/PROCEDURAL_YOKAI.md § 3)', () => {
    expect(countCombinations(2)).toBe(1_245_696);
  });
});
