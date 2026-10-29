import * as fc from 'fast-check';

import {
  type GameState,
  KAMIDANA_IDS,
  SCHEMA_VERSION,
  type Shikigami,
  TALISMAN_IDS,
  TEAM_SIZE,
  UPGRADE_IDS,
} from '../gameState';
import { type BigNum, mul, pow } from '../numbers';
import { GENERATOR_VERSIONS } from '../yokai';

// fast-check generators of valid engine values, shared by the engine's property tests.

export const arbitraryBigNum: fc.Arbitrary<BigNum> = fc
  .tuple(fc.double({ min: 1, max: 9.999, noNaN: true }), fc.integer({ min: 0, max: 5000 }))
  .map(([mantissa, exponent]) => mul(mantissa, pow(10, exponent)));

const uint32 = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const int32 = fc.integer({ min: -(2 ** 31), max: 2 ** 31 - 1 });
const duration = fc.integer({ min: 0, max: 60_000 });

const arbitraryShikigami: fc.Arbitrary<Shikigami[]> = fc.uniqueArray(
  fc.record({
    seed: uint32,
    level: fc.integer({ min: 1, max: 500 }),
    generatorVersion: fc.constantFrom(...GENERATOR_VERSIONS),
  }),
  { selector: (shikigami) => shikigami.seed, maxLength: 12 },
);

export const arbitraryGameState: fc.Arbitrary<GameState> = fc
  .tuple(arbitraryShikigami, fc.integer({ min: 1, max: 5000 }), fc.integer({ min: 0, max: 500 }))
  .chain(([shikigami, wave, extraWaves]) =>
    fc
      .subarray(
        shikigami.map((entry) => entry.seed),
        { maxLength: Math.min(TEAM_SIZE, shikigami.length) },
      )
      .chain((team) =>
        fc.record({
          schemaVersion: fc.constant(SCHEMA_VERSION),
          generatorVersion: fc.constantFrom(...GENERATOR_VERSIONS),
          parade: fc.record({
            number: fc.integer({ min: 1, max: 50 }),
            seed: int32,
            wave: fc.constant(wave),
            maxWave: fc.constant(wave + extraWaves),
            farming: fc.boolean(),
            repeat: fc.nat(100),
          }),
          enemy: fc.record({
            seed: uint32,
            damage: arbitraryBigNum,
            guardian: fc.option(fc.record({ engaged: fc.boolean(), timeLeftMs: duration })),
          }),
          souls: arbitraryBigNum,
          ofuda: fc.nat(100_000),
          sparks: fc.nat(100_000),
          sanctuary: fc.record(
            Object.fromEntries(UPGRADE_IDS.map((id) => [id, fc.nat(1000)])) as Record<
              (typeof UPGRADE_IDS)[number],
              fc.Arbitrary<number>
            >,
          ),
          kamidana: fc.record(
            Object.fromEntries(KAMIDANA_IDS.map((id) => [id, fc.nat(20)])) as Record<
              (typeof KAMIDANA_IDS)[number],
              fc.Arbitrary<number>
            >,
          ),
          shikigami: fc.constant(shikigami),
          team: fc.constant(team),
          cooldowns: fc.record(
            Object.fromEntries(TALISMAN_IDS.map((id) => [id, duration])) as Record<
              (typeof TALISMAN_IDS)[number],
              fc.Arbitrary<number>
            >,
          ),
          effects: fc.record({ burnMs: duration, soulsBoostMs: duration }),
          attackTimers: fc.record({
            hero: duration,
            team: fc.array(duration, { minLength: team.length, maxLength: team.length }),
          }),
          rngState: int32,
          guardiansDefeated: fc.uniqueArray(fc.integer({ min: 0, max: 9 }), { maxLength: 10 }),
        }),
      ),
  );
