import { big, type CombatEvent } from '@/engine';

import { hapticForEvents } from './combatHaptics';

const hit = (source: 'hero' | 'tap' | 'shikigami', crit: boolean): CombatEvent => ({
  type: 'hit',
  source,
  damage: big(10),
  crit,
  atMs: 0,
});
const victory: CombatEvent = {
  type: 'guardianDefeated',
  wave: 100,
  index: 0,
  ofuda: 5,
  souls: big(1),
  firstTime: true,
  atMs: 0,
};

describe('hapticForEvents', () => {
  it('celebrates a guardian beaten, above anything else', () => {
    expect(hapticForEvents([hit('tap', true), victory])).toBe('success');
  });

  it("marks the hero's and the player's critical strikes", () => {
    expect(hapticForEvents([hit('tap', true)])).toBe('medium');
    expect(hapticForEvents([hit('hero', true)])).toBe('medium');
  });

  it("stays quiet for ordinary strikes and the team's crits", () => {
    expect(hapticForEvents([hit('tap', false), hit('shikigami', true)])).toBeNull();
  });
});
