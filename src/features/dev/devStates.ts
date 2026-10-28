import {
  BALANCE,
  big,
  createNewGame,
  enemySeed,
  type GameState,
  generate,
  GENERATOR_VERSION,
  type Rarity,
  setTeam,
  type Shikigami,
} from '@/engine';

/** Development shortcut: the first parade, in front of the guardian of `wave`, strong enough to win. */
export function devGuardianState(seed: number, wave: number): GameState {
  const state = createNewGame(seed);
  return {
    ...state,
    parade: { ...state.parade, wave, maxWave: wave },
    enemy: {
      seed: enemySeed(seed, wave),
      damage: state.enemy.damage,
      guardian: { engaged: false, timeLeftMs: BALANCE.guardian.timeLimitMs },
    },
    sanctuary: { ...state.sanctuary, blade: wave },
  };
}

// The collection of the showcase: a legendary and two epics in the team, rares and commons behind.
const SHOWCASE_COLLECTION: readonly { rarity: Rarity; level: number }[] = [
  { rarity: 'legendary', level: 9 },
  { rarity: 'epic', level: 14 },
  { rarity: 'epic', level: 6 },
  { rarity: 'rare', level: 12 },
  { rarity: 'rare', level: 8 },
  { rarity: 'rare', level: 5 },
  { rarity: 'rare', level: 3 },
  { rarity: 'common', level: 21 },
  { rarity: 'common', level: 17 },
  { rarity: 'common', level: 11 },
  { rarity: 'common', level: 7 },
  { rarity: 'common', level: 2 },
];
const SHOWCASE_WAVE = 247;

/** The first seeds, from `start`, whose yōkai have the requested rarities (one seed each). */
function seedsByRarity(start: number, rarities: readonly Rarity[]): number[] {
  const seeds: number[] = [];
  for (let seed = start; seeds.length < rarities.length; seed++) {
    if (generate(seed, GENERATOR_VERSION).rarity === rarities[seeds.length]) {
      seeds.push(seed);
    }
  }
  return seeds;
}

/**
 * Development shortcut for the store screenshots: a third parade well under way, with a varied
 * collection, a strong team, two guardians beaten and a Festival within reach.
 */
export function devShowcaseState(seed: number): GameState {
  const fresh = createNewGame(seed);
  const seeds = seedsByRarity(
    seed,
    SHOWCASE_COLLECTION.map((entry) => entry.rarity),
  );
  const shikigami: Shikigami[] = SHOWCASE_COLLECTION.map((entry, index) => ({
    seed: seeds[index],
    level: entry.level,
    generatorVersion: GENERATOR_VERSION,
  }));
  const state: GameState = {
    ...fresh,
    parade: { ...fresh.parade, number: 3, wave: SHOWCASE_WAVE, maxWave: 312 },
    enemy: { seed: enemySeed(seed, SHOWCASE_WAVE), damage: big(0), guardian: null },
    // Strong enough for its wave: a yōkai falls in about a second, the next Blade level is in reach.
    souls: big(6.3e17),
    ofuda: 85,
    sparks: 24,
    sanctuary: { blade: 345, foxfire: 40, bell: 60, kekkai: 12, lanterns: 6 },
    shikigami,
    guardiansDefeated: [0, 1],
  };
  const team = setTeam(state, seeds.slice(0, 3));
  return team.ok ? team.state : state;
}
