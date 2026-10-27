import { big, type CombatEvent } from '@/engine';

import { heroPoseAt, IDLE_POSE, nextHeroPose, POSE_HOLD_MS } from './heroPose';

const strike = (source: 'hero' | 'tap' | 'shikigami', atMs = 0): CombatEvent => ({
  type: 'hit',
  source,
  damage: big(10),
  crit: false,
  atMs,
});

describe('nextHeroPose', () => {
  it("strikes on the hero's attacks and the player's taps, not on the team's", () => {
    expect(nextHeroPose(IDLE_POSE, [strike('tap')], 0).pose).toBe('attack');
    expect(nextHeroPose(IDLE_POSE, [strike('hero')], 0).pose).toBe('attack');
    expect(nextHeroPose(IDLE_POSE, [strike('shikigami')], 0)).toBe(IDLE_POSE);
  });

  it('casts each talisman with its own pose', () => {
    const cast = (talisman: 'kitsunebi' | 'raijin' | 'kekkai') =>
      nextHeroPose(IDLE_POSE, [{ type: 'talismanCast', talisman, atMs: 0 }], 0).pose;
    expect([cast('kitsunebi'), cast('raijin'), cast('kekkai')]).toEqual([
      'fire',
      'thunder',
      'barrier',
    ]);
  });

  it('reacts to the guardians', () => {
    const after = (event: CombatEvent) => nextHeroPose(IDLE_POSE, [event], 0).pose;
    expect(after({ type: 'guardianAppeared', wave: 100, index: 0, awakening: 0, atMs: 0 })).toBe(
      'surprised',
    );
    const defeated: CombatEvent = {
      type: 'guardianDefeated',
      wave: 100,
      index: 0,
      ofuda: 5,
      souls: big(1),
      firstTime: true,
      atMs: 0,
    };
    expect(after(defeated)).toBe('victory');
    expect(after({ type: 'guardianFailed', wave: 100, index: 0, atMs: 0 })).toBe('knockedOut');
    expect(after({ type: 'guardianFled', wave: 100, atMs: 0 })).toBe('hit');
  });

  it('holds a reaction, then goes back to idle', () => {
    const state = nextHeroPose(IDLE_POSE, [strike('tap', 40)], 1000);
    expect(heroPoseAt(state, 1000 + 40 + POSE_HOLD_MS.attack - 1)).toBe('attack');
    expect(heroPoseAt(state, 1000 + 40 + POSE_HOLD_MS.attack)).toBe('idle');
  });

  it('never lets a strike cut a stronger reaction short', () => {
    const victory = nextHeroPose(
      IDLE_POSE,
      [
        {
          type: 'guardianDefeated',
          wave: 100,
          index: 0,
          ofuda: 5,
          souls: big(1),
          firstTime: false,
          atMs: 0,
        },
      ],
      0,
    );
    expect(nextHeroPose(victory, [strike('tap')], 100)).toBe(victory);
    expect(nextHeroPose(victory, [strike('tap')], POSE_HOLD_MS.victory).pose).toBe('attack');
  });

  it('restarts the same reaction when it happens again', () => {
    const first = nextHeroPose(IDLE_POSE, [strike('tap')], 0);
    expect(nextHeroPose(first, [strike('tap')], 200).untilMs).toBe(200 + POSE_HOLD_MS.attack);
  });
});
