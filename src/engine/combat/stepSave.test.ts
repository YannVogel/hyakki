import * as fc from 'fast-check';

import { type CombatInput, step } from '.';
import type { GameState } from '../gameState';
import { deserialize, serialize } from '../save';
import { setTeam } from '../shikigami';
import { stateAtWave } from '../testing/states';

function withTeam(state: GameState, seeds: number[]): GameState {
  const owned = {
    ...state,
    shikigami: seeds.map((seed) => ({ seed, level: 1, generatorVersion: 1 })),
  };
  const result = setTeam(owned, seeds);
  if (!result.ok) throw new Error(result.reason);
  return result.state;
}

const anyInput: fc.Arbitrary<CombatInput> = fc.oneof(
  fc.constant({ type: 'tap' } as const),
  fc.constant({ type: 'engageGuardian' } as const),
  fc.constant({ type: 'fleeGuardian' } as const),
  fc.constant({ type: 'challengeGuardian' } as const),
  fc.constantFrom('kitsunebi', 'raijin', 'kekkai').map((talisman) => ({
    type: 'castTalisman' as const,
    talisman,
  })),
);

describe('step and the save file', () => {
  it('only produces states that the save accepts, whatever the durations and inputs', () => {
    fc.assert(
      fc.property(
        fc.integer(),
        fc.integer({ min: 1, max: 350 }),
        fc.array(
          fc.tuple(
            fc.double({ min: 0, max: 5000, noNaN: true }),
            fc.array(anyInput, { maxLength: 4 }),
          ),
          { maxLength: 30 },
        ),
        (seed, wave, steps) => {
          let state = withTeam(stateAtWave(seed, wave, { blade: 40, foxfire: 10 }), [7, 8, 9]);
          for (const [dtMs, inputs] of steps) {
            state = step(state, dtMs, inputs).state;
          }
          const loaded = deserialize(serialize(state, 0));
          expect(loaded.ok ? 'ok' : loaded.error.message).toBe('ok');
        },
      ),
      { numRuns: 300 },
    );
  });
});
