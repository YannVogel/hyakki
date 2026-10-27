import * as fc from 'fast-check';

import { generate, type YokaiSpec } from './generate';
import { nameOf } from './name';
import { statsOf } from './stats';
import { loadPrototype } from './testing/prototype';
import { traitsOf } from './traits';

const REFERENCE_SEEDS = [0, 1, 7, 42, 2026, 999_999];
const anySeed = fc.integer({ min: 0, max: 2 ** 31 - 1 });

describe('statsOf and nameOf', () => {
  it('match the prototype on the first 10 000 seeds', () => {
    const prototype = loadPrototype();
    for (let seed = 0; seed < 10_000; seed++) {
      const spec = generate(seed, 1);
      const expected = prototype.statsOf(prototype.generate(seed));
      const stats = statsOf(spec);
      expect({
        name: nameOf(spec),
        hp: stats.hp,
        attack: stats.attack,
        defense: stats.defense,
        speed: stats.speed,
        crit: Math.round(stats.critChance * 100),
        burn: Math.round(stats.burnRate * 100),
        souls: Math.round(stats.soulsBonus * 100),
      }).toEqual({
        name: prototype.nameOf(prototype.generate(seed)),
        hp: expected.pv,
        attack: expected.atq,
        defense: expected.def,
        speed: expected.vit,
        crit: expected.crit,
        burn: expected.burn,
        souls: expected.souls,
      });
    }
  });

  it('keeps the reference seeds stable', () => {
    expect(
      REFERENCE_SEEDS.map((seed) => {
        const spec = generate(seed, 1);
        return { seed, name: nameOf(spec), stats: statsOf(spec) };
      }),
    ).toMatchSnapshot();
  });

  it('always gives strictly positive stats', () => {
    fc.assert(
      fc.property(anySeed, (seed) => {
        const { hp, attack, defense, speed, critChance } = statsOf(generate(seed, 1));
        for (const value of [hp, attack, defense, speed, critChance]) {
          expect(value).toBeGreaterThan(0);
        }
      }),
      { numRuns: 2000 },
    );
  });

  it('names horned yōkai « oni »', () => {
    fc.assert(
      fc.property(anySeed, (seed) => {
        const spec = generate(seed, 1);
        const horned = spec.accessories.includes('horns') || spec.accessories.includes('horn');
        expect(nameOf(spec).endsWith('-oni')).toBe(horned);
      }),
      { numRuns: 2000 },
    );
  });
});

describe('traitsOf', () => {
  it('lists as many traits as the prototype (labels are checked in src/i18n)', () => {
    const prototype = loadPrototype();
    for (let seed = 0; seed < 2000; seed++) {
      const expected = prototype.statsOf(prototype.generate(seed)).traits;
      expect(traitsOf(generate(seed, 1))).toHaveLength(expected.length);
    }
  });

  it('only lists parts the yōkai actually has', () => {
    fc.assert(
      fc.property(anySeed, (seed) => {
        const spec = generate(seed, 1);
        for (const { source } of traitsOf(spec)) {
          switch (source.part) {
            case 'eyes':
              expect(source.id).toBe(spec.eyes);
              break;
            case 'mouth':
              expect(source.id).toBe(spec.mouth);
              break;
            case 'limbs':
              expect(source.id).toBe(spec.limbs);
              break;
            case 'accessory':
              expect(spec.accessories).toContain(source.id);
              break;
            case 'palette':
              expect(source.id).toBe(spec.palette);
              expect(spec.rarity).not.toBe('common');
              break;
          }
        }
      }),
      { numRuns: 2000 },
    );
  });

  it('lists every accessory', () => {
    fc.assert(
      fc.property(anySeed, (seed) => {
        const spec = generate(seed, 1);
        const accessories = traitsOf(spec)
          .map(({ source }) => source)
          .filter((source) => source.part === 'accessory')
          .map((source) => source.id);
        expect(accessories).toEqual(spec.accessories);
      }),
    );
  });

  it('reads the parts of version 2', () => {
    const kettle: YokaiSpec = {
      ...generate(1, 2),
      object: 'kettle',
      eyes: 'pair',
      mouth: 'grin',
      limbs: 'none',
      accessories: ['leaf', 'beads'],
      rarity: 'common',
      palette: 'paper',
      suffix: 'obake',
    };
    expect(statsOf(kettle)).toMatchObject({ hp: 132, attack: 95, defense: 100, speed: 85 });
    expect(statsOf(kettle).soulsBonus).toBeCloseTo(0.1);
    expect(nameOf(kettle)).toBe('Yakan-obake');
    const pipeAndTail = { ...kettle, accessories: ['pipe', 'tail'] as const };
    expect(statsOf(pipeAndTail).attack).toBe(105);
    expect(statsOf(pipeAndTail).critChance).toBeCloseTo(0.11);
  });
});
