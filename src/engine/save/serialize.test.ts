import * as fc from 'fast-check';

import { createNewGame, type GameState, SCHEMA_VERSION } from '../gameState';
import { toMantissaExponent } from '../numbers';
import { arbitraryGameState } from '../testing/arbitraries';
import { deserialize, serialize } from './serialize';

// BigNum instances compare by value through their mantissa and exponent.
const comparable = (state: GameState) => ({
  ...state,
  souls: toMantissaExponent(state.souls),
  enemy: { ...state.enemy, damage: toMantissaExponent(state.enemy.damage) },
});

const corrupt = (mutate: (raw: { savedAt: unknown; state: Record<string, unknown> }) => void) => {
  const raw = JSON.parse(serialize(createNewGame(42), 1000));
  mutate(raw);
  return deserialize(JSON.stringify(raw));
};

describe('serialize / deserialize', () => {
  it('round-trips any valid state exactly', () => {
    fc.assert(
      fc.property(arbitraryGameState, fc.nat(), (state, savedAt) => {
        const loaded = deserialize(serialize(state, savedAt));
        if (!loaded.ok) {
          throw new Error(loaded.error.message);
        }
        expect(loaded.savedAt).toBe(savedAt);
        expect(comparable(loaded.state)).toEqual(comparable(state));
      }),
    );
  });

  it('loads a brand new game', () => {
    const loaded = deserialize(serialize(createNewGame(7), 123));
    expect(loaded.ok && comparable(loaded.state)).toEqual(comparable(createNewGame(7)));
  });

  it('rejects text that is not JSON', () => {
    expect(deserialize('{oops')).toEqual({
      ok: false,
      error: { reason: 'invalid-json', message: expect.any(String) },
    });
  });

  it.each([
    ['a missing field', (raw: { state: Record<string, unknown> }) => delete raw.state.souls],
    ['a wrong type', (raw: { state: Record<string, unknown> }) => (raw.state.ofuda = 'many')],
    ['a broken BigNum', (raw: { state: Record<string, unknown> }) => (raw.state.souls = '12')],
    [
      'a negative wave',
      (raw: { state: Record<string, unknown> }) =>
        (raw.state.parade = { ...(raw.state.parade as object), wave: -3 }),
    ],
    [
      'a team member not in the collection',
      (raw: { state: Record<string, unknown> }) => {
        raw.state.team = [123];
        raw.state.attackTimers = { hero: 0, team: [0] };
      },
    ],
    ['an unknown upgrade', (raw: { state: Record<string, unknown> }) => (raw.state.sanctuary = {})],
    ['a missing state', (raw: { state: unknown }) => (raw.state = null)],
    ['a state that is a list', (raw: { state: unknown }) => (raw.state = [])],
    ['a negative save time', (raw: { savedAt: unknown }) => (raw.savedAt = -1)],
    [
      'the same shikigami twice',
      (raw: { state: Record<string, unknown> }) =>
        (raw.state.shikigami = [
          { seed: 5, level: 1, generatorVersion: 1 },
          { seed: 5, level: 2, generatorVersion: 1 },
        ]),
    ],
    [
      'a team without its attack timers',
      (raw: { state: Record<string, unknown> }) => {
        raw.state.shikigami = [{ seed: 5, level: 1, generatorVersion: 1 }];
        raw.state.team = [5];
      },
    ],
    [
      'a parade drawn by an unknown generator version',
      (raw: { state: Record<string, unknown> }) => (raw.state.generatorVersion = 3),
    ],
    [
      'a shikigami drawn by an unknown generator version',
      (raw: { state: Record<string, unknown> }) =>
        (raw.state.shikigami = [{ seed: 5, level: 1, generatorVersion: 0 }]),
    ],
    [
      'a record below the current wave',
      (raw: { state: Record<string, unknown> }) =>
        (raw.state.parade = { ...(raw.state.parade as object), wave: 9, maxWave: 3 }),
    ],
  ])('rejects %s with a typed error', (_label, mutate) => {
    const loaded = corrupt(mutate as never);
    expect(loaded.ok).toBe(false);
    expect(!loaded.ok && loaded.error.reason).toBe('invalid-shape');
  });

  it('rejects a save from a newer version of the game', () => {
    const loaded = corrupt((raw) => (raw.state.schemaVersion = SCHEMA_VERSION + 1));
    expect(!loaded.ok && loaded.error.reason).toBe('unsupported-version');
  });

  it('never throws, whatever the input', () => {
    fc.assert(
      fc.property(fc.oneof(fc.string(), fc.json()), (text) => {
        expect(() => deserialize(text)).not.toThrow();
      }),
    );
  });
});
