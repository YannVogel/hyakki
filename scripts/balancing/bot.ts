import {
  buyUpgradeLevels,
  type GameState,
  guardianMaxHp,
  gt,
  gte,
  levelUpCost,
  ZERO,
  levelUpShikigami,
  log10,
  lt,
  mul,
  setTeam,
  type Shikigami,
  shikigamiHitRatio,
  shikigamiIntervalMs,
  TEAM_SIZE,
  upgradeCost,
  UPGRADE_IDS,
  upgradeMaxLevel,
  type BigNum,
  add,
  BALANCE,
  combatPower,
  expectedDps,
  festivalPreview,
} from '../../src/engine';

// A simple, deterministic player used to measure the balance. It is not smart: it buys the
// cheapest thing it can afford, fields its strongest shikigami and taps at a steady pace.

const SEARCH_STEPS = 60;
const MAX_TOP_UPS = 100;

interface Option {
  readonly buy: (state: GameState, count: number) => { ok: boolean; state?: GameState };
  /** Cost of the next level, and of `count` levels. */
  readonly next: BigNum;
  readonly cost: (count: number) => BigNum;
  readonly growth: number;
  readonly cap: number;
}

function purchaseOptions(state: GameState): Option[] {
  const upgrades = UPGRADE_IDS.filter((id) => state.sanctuary[id] < upgradeMaxLevel(id)).map(
    (id): Option => ({
      buy: (current, count) => buyUpgradeLevels(current, id, count),
      next: upgradeCost(id, state.sanctuary[id], 1),
      cost: (count) => upgradeCost(id, state.sanctuary[id], count),
      growth: BALANCE.upgrades.costGrowth,
      cap: upgradeMaxLevel(id) - state.sanctuary[id],
    }),
  );
  const team = state.team.map((seed): Option => {
    const level = state.shikigami.find((entry) => entry.seed === seed)?.level ?? 1;
    return {
      buy: (current, count) => levelUpShikigami(current, seed, count),
      next: levelUpCost(level),
      cost: (count) => levelUpCost(level, count),
      growth: BALANCE.shikigami.levelUpCostGrowth,
      cap: Infinity,
    };
  });
  return [...upgrades, ...team];
}

/** Levels of each option whose cost is at most 10^log10Threshold. */
const countsBelow = (options: readonly Option[], log10Threshold: number) =>
  options.map((option) =>
    Math.min(
      option.cap,
      Math.max(
        0,
        Math.floor((log10Threshold - log10(option.next)) / Math.log10(option.growth)) + 1,
      ),
    ),
  );

const totalCost = (options: readonly Option[], counts: readonly number[]) =>
  options.reduce((total, option, index) => add(total, option.cost(counts[index])), ZERO);

function buyCounts(
  state: GameState,
  options: readonly Option[],
  counts: readonly number[],
): GameState {
  return options.reduce((current, option, index) => {
    const result = counts[index] > 0 ? option.buy(current, counts[index]) : { ok: false };
    return result.ok && result.state !== undefined ? result.state : current;
  }, state);
}

/**
 * Buys the cheapest upgrade or team level-up, again and again, while the souls allow it. Solved
 * directly rather than one level at a time: every level costing at most a threshold T is bought,
 * with T the highest threshold the souls can pay (binary search), then the cheapest levels left.
 */
export function spendSouls(state: GameState): GameState {
  const options = purchaseOptions(state);
  if (options.length === 0) {
    return state;
  }
  let low = Math.min(...options.map((option) => log10(option.next)));
  let high = log10(state.souls);
  if (high < low) {
    return state;
  }
  for (let i = 0; i < SEARCH_STEPS; i++) {
    const middle = (low + high) / 2;
    if (gt(totalCost(options, countsBelow(options, middle)), state.souls)) {
      high = middle;
    } else {
      low = middle;
    }
  }
  let current = buyCounts(state, options, countsBelow(options, low));
  for (let i = 0; i < MAX_TOP_UPS; i++) {
    const [cheapest] = purchaseOptions(current).sort((a, b) => (lt(a.next, b.next) ? -1 : 1));
    if (cheapest === undefined || lt(current.souls, cheapest.next)) {
      break;
    }
    const result = cheapest.buy(current, 1);
    if (!result.ok || result.state === undefined) {
      break;
    }
    current = result.state;
  }
  return current;
}

/** log10 of the damage per second of a shikigami, per unit of hero damage. */
const shikigamiStrength = (shikigami: Shikigami) =>
  log10(shikigamiHitRatio(shikigami)) + Math.log10(1000 / shikigamiIntervalMs(shikigami));

/** Fields the strongest shikigami. */
export function pickTeam(state: GameState): GameState {
  const best = [...state.shikigami]
    .sort((a, b) => shikigamiStrength(b) - shikigamiStrength(a))
    .slice(0, TEAM_SIZE)
    .map((shikigami) => shikigami.seed);
  const unchanged =
    best.length === state.team.length && best.every((seed) => state.team.includes(seed));
  if (unchanged) {
    return state;
  }
  const result = setTeam(state, best);
  return result.ok ? result.state : state;
}

/**
 * Damage the bot expects to deal to a guardian in its 30 s: automatic attacks, taps and the two
 * attack talismans (kept for guardians), critical hits averaged.
 */
export function guardianDamageEstimate(state: GameState, tapsPerSecond: number): BigNum {
  const power = combatPower(state);
  const seconds = BALANCE.guardian.timeLimitMs / 1000;
  const critFactor = 1 + power.critChance * (BALANCE.crit.multiplier - 1);
  const { kitsunebi, raijin } = BALANCE.talismans;
  const talismanHits = kitsunebi.damageMultiplier + raijin.damageMultiplier;
  return add(
    mul(expectedDps(power), seconds),
    mul(power.heroHitDamage, tapsPerSecond * seconds * critFactor + talismanHits),
  );
}

export function canBeatGuardian(state: GameState, wave: number, tapsPerSecond: number): boolean {
  return gte(guardianDamageEstimate(state, tapsPerSecond), guardianMaxHp(wave));
}

/** Starts a Festival when the bot is stuck and the permanent bonus would grow by 15 % or more. */
export function wantsFestival(state: GameState): boolean {
  const preview = festivalPreview(state);
  return preview.unlocked && state.parade.farming && preview.bonusAfter >= preview.bonusNow * 1.15;
}
