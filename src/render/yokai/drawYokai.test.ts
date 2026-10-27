import * as fc from 'fast-check';

import { generate } from '@/engine';
import { loadPrototype } from '@/engine/yokai/testing/prototype';

import { drawYokai } from './drawYokai';
import { type DrawNode, isGroup } from './nodes';
import { normalizePrototype, parseSvg, toSvgTree } from './testing/svgTree';

type PrototypeWithSvg = ReturnType<typeof loadPrototype> & {
  svgOf: (spec: ReturnType<ReturnType<typeof loadPrototype>['generate']>, label: string) => string;
};

const animations = (node: DrawNode): string[] =>
  isGroup(node)
    ? [
        ...(node.group.animation ? [node.group.animation] : []),
        ...node.children.flatMap(animations),
      ]
    : [];

describe('drawYokai', () => {
  const prototype = loadPrototype() as PrototypeWithSvg;

  it('draws exactly what the prototype draws (3 000 seeds)', () => {
    for (let seed = 0; seed < 3000; seed++) {
      const expected = normalizePrototype(parseSvg(prototype.svgOf(prototype.generate(seed), 'x')));
      expect(toSvgTree(drawYokai(generate(seed)))).toEqual(expected);
    }
  });

  it('matches the prototype on random seeds', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 999_999_999 }), (seed) => {
        const expected = normalizePrototype(
          parseSvg(prototype.svgOf(prototype.generate(seed), 'x')),
        );
        expect(toSvgTree(drawYokai(generate(seed)))).toEqual(expected);
      }),
    );
  });

  it('animates what the yōkai has: floating always, tongue, flame and sparkles when present', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 ** 31 - 1 }), (seed) => {
        const spec = generate(seed);
        const used = animations(drawYokai(spec));
        expect(used.filter((name) => name === 'float')).toHaveLength(1);
        expect(used.includes('tongue')).toBe(spec.mouth === 'tongue');
        expect(used.includes('flame')).toBe(spec.accessories.includes('onibi'));
        const sparkCount = { common: 0, rare: 0, epic: 2, legendary: 4 }[spec.rarity];
        expect(used.filter((name) => name === 'spark')).toHaveLength(sparkCount);
      }),
    );
  });

  it('offsets the floating animation by the seed delay', () => {
    const spec = generate(42);
    const [, float] = drawYokai(spec).children;
    expect(isGroup(float) && float.group).toEqual({
      animation: 'float',
      delay: spec.animationDelay,
    });
  });
});
