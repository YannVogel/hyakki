import { generate, traitsOf } from '@/engine';
import { loadPrototype } from '@/engine/yokai/testing/prototype';

import { describeYokai, traitEffectText, traitLabel } from './yokai';

// The prototype uses plain spaces; the game uses narrow no-break spaces before « % ».
const plainSpaces = (text: string) => text.replace(/ /g, ' ');

describe('yōkai texts', () => {
  const prototype = loadPrototype();

  it('describe yōkai like the prototype (10 000 seeds)', () => {
    for (let seed = 0; seed < 10_000; seed++) {
      expect(describeYokai(generate(seed, 1))).toBe(prototype.descOf(prototype.generate(seed)));
    }
  });

  it('label traits and their effects like the prototype (10 000 seeds)', () => {
    for (let seed = 0; seed < 10_000; seed++) {
      const texts = traitsOf(generate(seed, 1)).map((trait) => ({
        label: traitLabel(trait.source),
        effect: plainSpaces(traitEffectText(trait)),
      }));
      expect(texts).toEqual(prototype.statsOf(prototype.generate(seed)).traits);
    }
  });

  it.each([
    [42, 'Tambour hilare à trois yeux'],
    [2026, 'Théière étonnée et farceuse'],
    [999_999, 'Lanterne moqueuse à trois yeux'],
  ])('describes seed %d as « %s »', (seed, description) => {
    expect(describeYokai(generate(seed, 1))).toBe(description);
  });

  it('describes and labels every part of version 2', () => {
    for (let seed = 0; seed < 3_000; seed++) {
      const spec = generate(seed, 2);
      expect(describeYokai(spec)).not.toMatch(/undefined/);
      for (const trait of traitsOf(spec)) {
        expect(traitLabel(trait.source)).not.toBe('');
        expect(traitEffectText(trait)).not.toBe('');
      }
    }
  });

  it('agrees the new objects in gender', () => {
    const fan = {
      ...generate(0, 2),
      object: 'fan' as const,
      mouth: 'grin' as const,
      eyes: 'sly' as const,
    };
    expect(describeYokai(fan)).toBe('Éventail rieur et sournois');
    expect(describeYokai({ ...fan, object: 'templeBell' })).toBe('Cloche rieuse et sournoise');
  });
});
