import { big, type CombatEvent } from '@/engine';

import { MAX_SOUNDS_PER_STEP, soundsForEvents } from './combatSounds';

const hit = (source: 'hero' | 'tap' | 'shikigami', crit: boolean): CombatEvent => ({
  type: 'hit',
  source,
  damage: big(10),
  crit,
  atMs: 0,
});
const purified: CombatEvent = { type: 'yokaiDefeated', wave: 3, seed: 1, souls: big(2), atMs: 0 };
const captured: CombatEvent = {
  type: 'shikigamiCaptured',
  seed: 1,
  level: 1,
  isNew: true,
  atMs: 0,
};
const appeared: CombatEvent = {
  type: 'guardianAppeared',
  wave: 100,
  index: 0,
  awakening: 0,
  atMs: 0,
};
const victory: CombatEvent = {
  type: 'guardianDefeated',
  wave: 100,
  index: 0,
  ofuda: 5,
  souls: big(1),
  firstTime: true,
  atMs: 0,
};

describe('soundsForEvents', () => {
  it('stays silent for ordinary hits', () => {
    expect(soundsForEvents([hit('hero', false), hit('shikigami', true)])).toEqual([]);
  });

  it("rings for the hero's and the player's critical strikes only", () => {
    expect(soundsForEvents([hit('tap', true)])).toEqual(['crit']);
    expect(soundsForEvents([hit('hero', true)])).toEqual(['crit']);
  });

  it('plays each kind once per step, the most telling first', () => {
    expect(soundsForEvents([purified, purified, hit('tap', true), captured])).toEqual([
      'capture',
      'crit',
    ]);
    expect(soundsForEvents([purified, victory])).toEqual(['guardianDefeated', 'purify']);
  });

  it('never plays more than a few sounds at once', () => {
    const busy: CombatEvent[] = [
      purified,
      hit('tap', true),
      captured,
      victory,
      { type: 'talismanCast', talisman: 'raijin', atMs: 0 },
    ];
    expect(soundsForEvents(busy)).toHaveLength(MAX_SOUNDS_PER_STEP);
  });

  it('marks a guardian that appears, is beaten, fails or is fled', () => {
    expect(soundsForEvents([appeared])).toEqual(['guardianAppeared']);
    expect(soundsForEvents([{ type: 'guardianFailed', wave: 100, index: 0, atMs: 0 }])).toEqual([
      'guardianFailed',
    ]);
    expect(soundsForEvents([{ type: 'guardianFled', wave: 100, atMs: 0 }])).toEqual([
      'guardianFailed',
    ]);
  });
});
