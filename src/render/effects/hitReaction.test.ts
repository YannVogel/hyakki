import * as fc from 'fast-check';

import { big, type CombatEvent, type HitSource } from '@/engine';

import { DURATION_MS, FLASH_MIN_GAP_MS } from './effects';
import {
  type ActiveReaction,
  flashMatrix,
  hitStrength,
  NO_REACTION,
  planReaction,
  REACTION_SHAPES,
  reactionForEvents,
} from './hitReaction';

const hit = (source: HitSource, atMs = 0, crit = false): CombatEvent => ({
  type: 'hit',
  source,
  damage: big(10),
  crit,
  atMs,
});
const SOURCES: readonly HitSource[] = ['hero', 'tap', 'shikigami', 'kitsunebi', 'raijin'];

describe('hitStrength', () => {
  it('keeps the team discreet and makes critical hits and talismans strong', () => {
    expect(hitStrength('shikigami', false)).toBe('light');
    expect(hitStrength('hero', false)).toBe('medium');
    expect(hitStrength('tap', false)).toBe('medium');
    expect(hitStrength('kitsunebi', false)).toBe('strong');
    expect(hitStrength('raijin', false)).toBe('strong');
    for (const source of SOURCES) {
      expect(hitStrength(source, true)).toBe('strong');
    }
  });
});

describe('reactionForEvents', () => {
  it('reacts to the strongest hit of the step, when it lands', () => {
    const events = [hit('shikigami', 10), hit('tap', 20), hit('shikigami', 30)];
    expect(reactionForEvents(events, 'full')).toEqual({
      strength: 'medium',
      delayMs: 20 + DURATION_MS.ofuda,
    });
    expect(reactionForEvents(events, 'reduced')).toEqual({ strength: 'medium', delayMs: 20 });
  });

  it('ignores the hits on an enemy that fell during the step', () => {
    const events: CombatEvent[] = [
      hit('raijin', 0),
      { type: 'yokaiDefeated', wave: 3, seed: 1, souls: big(1), atMs: 0 },
      { type: 'waveStarted', wave: 4, seed: 2, atMs: 0 },
      hit('shikigami', 40),
    ];
    expect(reactionForEvents(events, 'full')).toEqual({ strength: 'light', delayMs: 40 });
    expect(reactionForEvents(events.slice(0, 3), 'full')).toBeNull();
  });

  it('gives nothing for a step without hits', () => {
    expect(reactionForEvents([], 'full')).toBeNull();
  });
});

describe('planReaction', () => {
  const running = (strength: ActiveReaction['strength'], endsAtMs: number): ActiveReaction => ({
    strength,
    endsAtMs,
    lastFlashMs: -Infinity,
  });

  it('never lets a weaker reaction cut a stronger one under way', () => {
    const { plan, active } = planReaction(
      running('strong', 1100),
      { strength: 'light', delayMs: 0 },
      1000,
    );
    expect(plan).toBeNull();
    expect(active).toEqual(running('strong', 1100));
  });

  it('restarts on an equal or stronger hit, and after the current reaction', () => {
    const at = 1000;
    expect(
      planReaction(running('medium', 1100), { strength: 'medium', delayMs: 0 }, at).plan,
    ).not.toBeNull();
    expect(
      planReaction(running('medium', 1100), { strength: 'strong', delayMs: 0 }, at).plan,
    ).not.toBeNull();
    expect(
      planReaction(running('strong', 900), { strength: 'light', delayMs: 0 }, at).plan,
    ).not.toBeNull();
  });

  it('ends a reaction after its duration', () => {
    const { active } = planReaction(NO_REACTION, { strength: 'strong', delayMs: 140 }, 1000);
    expect(active.endsAtMs).toBe(1000 + 140 + REACTION_SHAPES.strong.durationMs);
  });

  it('never flashes the team hits, and never more than 2.5 times per second', () => {
    expect(planReaction(NO_REACTION, { strength: 'light', delayMs: 0 }, 0).plan?.flash).toBe(false);
    fc.assert(
      fc.property(
        fc.array(fc.tuple(fc.integer({ min: 0, max: 300 }), fc.constantFrom('medium', 'strong')), {
          maxLength: 60,
        }),
        (steps) => {
          let active = NO_REACTION;
          let now = 0;
          const flashes: number[] = [];
          for (const [gap, strength] of steps) {
            now += gap;
            const result = planReaction(active, { strength, delayMs: 0 }, now);
            active = result.active;
            if (result.plan?.flash) {
              flashes.push(now);
            }
          }
          for (let index = 1; index < flashes.length; index++) {
            expect(flashes[index] - flashes[index - 1]).toBeGreaterThanOrEqual(FLASH_MIN_GAP_MS);
          }
        },
      ),
    );
  });
});

describe('reaction shapes', () => {
  it('stay short and grow with the strength of the hit', () => {
    const order = [REACTION_SHAPES.light, REACTION_SHAPES.medium, REACTION_SHAPES.strong];
    for (let index = 1; index < order.length; index++) {
      expect(order[index].recoil).toBeGreaterThan(order[index - 1].recoil);
      expect(order[index].squash).toBeGreaterThan(order[index - 1].squash);
    }
    for (const shape of order) {
      expect(shape.durationMs).toBeLessThan(200);
    }
  });
});

describe('flashMatrix', () => {
  it('leaves colours alone at 0 and turns them white at 1, alpha untouched', () => {
    const identity = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
    expect(flashMatrix(0)).toEqual(identity);
    const white = flashMatrix(1);
    expect([white[0], white[4], white[6], white[9], white[12], white[14]]).toEqual([
      0, 1, 0, 1, 0, 1,
    ]);
    expect(white.slice(15)).toEqual([0, 0, 0, 1, 0]);
  });
});
