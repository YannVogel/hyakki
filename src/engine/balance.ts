// Every tunable number of the game, in one place (docs/GAME_DESIGN.md § 5). The balancing harness
// (scripts/simulate.ts) measures their effect; change them here only.

export const BALANCE = {
  enemy: {
    /** HP of a wave-1 yōkai whose HP stat is 100. */
    baseHp: 12,
    /** HP × hpGrowth per wave. */
    hpGrowth: 1.165,
  },
  souls: {
    base: 2,
    growth: 1.14,
  },
  hero: {
    baseDamage: 1,
    attackIntervalMs: 1000,
    /** A tap hits like an automatic attack of the hero. */
    tapMultiplier: 1,
  },
  crit: {
    baseChance: 0.05,
    multiplier: 3,
    maxChance: 0.75,
  },
  /** Upgrades of the Sanctuary: cost of level n = baseCost × costGrowth^n. */
  upgrades: {
    costGrowth: 1.15,
    blade: { baseCost: 10, damagePerLevel: 0.08 },
    foxfire: { baseCost: 500, burnPerLevel: 0.002 },
    bell: { baseCost: 150, soulsPerLevel: 0.05 },
    kekkai: { baseCost: 5000, cooldownPerLevel: 0.02, maxLevel: 25 },
    lanterns: { baseCost: 50_000, offlineHoursPerLevel: 1, maxLevel: 16 },
  },
} as const;
