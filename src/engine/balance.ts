// Every tunable number of the game, in one place (docs/GAME_DESIGN.md § 5). Calibrated with the
// balancing harness (scripts/simulate.ts, docs/balancing/): rerun it after any change here.

export const BALANCE = {
  enemy: {
    /** HP of a wave-1 yōkai whose HP stat is 100. */
    baseHp: 12,
    /** HP × hpGrowth per wave. */
    hpGrowth: 1.13,
  },
  souls: {
    base: 2,
    growth: 1.13,
    /** +50 % souls per guardian tier passed (waves 101+, 201+…). */
    tierBonus: 0.5,
  },
  guardian: {
    /** A guardian appears every `every` waves. */
    every: 100,
    count: 10,
    /** Guardian HP = hpMultiplier × wave HP, × awakeningHpMultiplier per cycle past wave 1000. */
    hpMultiplier: 12,
    awakeningHpMultiplier: 2,
    soulsMultiplier: 15,
    timeLimitMs: 30_000,
    /** Ofuda = baseOfuda × guardian rank (1 to 10) × (cycle + 1). */
    baseOfuda: 5,
    /** Burns in % of max HP are this effective against guardians (they would trivialize them). */
    burnFactor: 0.2,
  },
  hero: {
    baseDamage: 1,
    attackIntervalMs: 1000,
    /** A tap hits like an automatic attack of the hero. */
    tapMultiplier: 1,
  },
  burn: {
    /** A burn deals at most this multiple of the hits' expected damage per second. */
    maxHitsMultiple: 9,
  },
  crit: {
    baseChance: 0.05,
    multiplier: 3,
    maxChance: 0.75,
  },
  /** Upgrades of the Sanctuary: cost of level n = baseCost × costGrowth^n. */
  upgrades: {
    costGrowth: 1.12,
    /** Each level multiplies damage (compounding: costs grow exponentially, so must damage). */
    blade: { baseCost: 5, damageGrowth: 1.0925 },
    foxfire: { baseCost: 500, burnPerLevel: 0.002 },
    bell: { baseCost: 150, soulsPerLevel: 0.05 },
    kekkai: { baseCost: 5000, cooldownPerLevel: 0.02, maxLevel: 25 },
    lanterns: { baseCost: 50_000, offlineHoursPerLevel: 1, maxLevel: 16 },
  },
  shikigami: {
    /** Chance that a defeated yōkai joins the collection, by rarity. */
    captureChance: { common: 0.02, rare: 0.01, epic: 0.004, legendary: 0.001 },
    /**
     * A shikigami hit = hero hit × damageRatio × attack / 100 × (1 + damagePerLevel × (level − 1)).
     * Linear on purpose: the hero hit already compounds with the Blade.
     */
    damageRatio: 0.5,
    damagePerLevel: 0.1,
    /** Attack interval = baseIntervalMs × 100 / speed. */
    baseIntervalMs: 1000,
    levelUpBaseCost: 100,
    levelUpCostGrowth: 1.18,
  },
  talismans: {
    kitsunebi: {
      cooldownMs: 30_000,
      /** Fire damage = hero hit × damageMultiplier, then burnRate of max HP per second. */
      damageMultiplier: 20,
      burnRate: 0.01,
      burnDurationMs: 5_000,
    },
    raijin: { cooldownMs: 60_000, damageMultiplier: 50 },
    kekkai: {
      cooldownMs: 45_000,
      /** Against an engaged guardian: extra time. Otherwise: souls boost. */
      guardianExtraMs: 5_000,
      soulsBoostMultiplier: 2,
      soulsBoostDurationMs: 10_000,
    },
    /** Damage multiplier of a talisman matching the guardian's weakness. */
    weaknessMultiplier: 2,
    /** The Kekkai upgrade never cuts cooldowns by more than this. */
    maxCooldownReduction: 0.5,
  },
  offline: {
    /** Share of the active damage dealt while away. */
    efficiency: 0.5,
    baseCapHours: 8,
    maxCapHours: 24,
    /** Yōkai simulated one by one; beyond, souls are extrapolated from them. */
    maxSimulatedKills: 2000,
  },
  festival: {
    /** Unlocked once the record wave is above this one (the first guardian is behind). */
    unlockWave: 100,
    /** Sparks = floor(sparksBase × (record wave / 100)^sparksExponent). */
    sparksBase: 5,
    sparksExponent: 1.8,
    /** Permanent bonus on damage and souls: × (1 + bonusPerSpark × total sparks). */
    bonusPerSpark: 0.05,
  },
} as const;
