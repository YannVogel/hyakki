import {
  BALANCE,
  type BigNum,
  combatPower,
  div,
  expectedDps,
  gte,
  maxAffordable,
  min,
  mul,
  type PurchaseMode,
  tierMultiplier,
  UPGRADE_IDS,
  upgradeCost,
  type UpgradeId,
  upgradeMaxLevel,
  waveHp,
  waveSouls,
  type GameState,
  generate,
  guardianAt,
  guardianMaxHp,
  isGuardianWave,
  nameOf,
  sub,
  TALISMAN_IDS,
  talismanCooldownMs,
  type TalismanId,
  toNumber,
  yokaiMaxHp,
  type YokaiSpec,
} from '@/engine';

export type EnemyView =
  | {
      readonly kind: 'yokai';
      readonly spec: YokaiSpec;
      readonly name: string;
      readonly hpRatio: number;
    }
  | {
      readonly kind: 'guardian';
      readonly index: number;
      readonly awakening: number;
      readonly hpRatio: number;
      readonly engaged: boolean;
      readonly timeLeftMs: number;
      /** Share of the 30 s still available. */
      readonly timeRatio: number;
    };

const remainingRatio = (maxHp: BigNum, damage: BigNum) =>
  Math.min(1, Math.max(0, toNumber(div(sub(maxHp, damage), maxHp))));

export function enemyView(state: GameState): EnemyView {
  const { parade, enemy } = state;
  if (enemy.guardian !== null && isGuardianWave(parade.wave)) {
    return {
      kind: 'guardian',
      ...guardianAt(parade.wave),
      hpRatio: remainingRatio(guardianMaxHp(parade.wave), enemy.damage),
      engaged: enemy.guardian.engaged,
      timeLeftMs: enemy.guardian.timeLeftMs,
      timeRatio: Math.min(1, enemy.guardian.timeLeftMs / BALANCE.guardian.timeLimitMs),
    };
  }
  const spec = generate(enemy.seed);
  return {
    kind: 'yokai',
    spec,
    name: nameOf(spec),
    hpRatio: remainingRatio(yokaiMaxHp(parade.wave, enemy.seed), enemy.damage),
  };
}

export interface ParadeView {
  readonly number: number;
  readonly wave: number;
  /** Position in the current hundred, 1 to 100. */
  readonly waveInTier: number;
  /** Progress toward the next guardian, 0 to 1. */
  readonly tierProgress: number;
  readonly nextGuardianWave: number;
  readonly farming: boolean;
}

export function paradeView(state: GameState): ParadeView {
  const { wave, number, farming } = state.parade;
  const every = BALANCE.guardian.every;
  const waveInTier = ((wave - 1) % every) + 1;
  return {
    number,
    wave,
    waveInTier,
    tierProgress: waveInTier / every,
    nextGuardianWave: Math.ceil(wave / every) * every,
    farming,
  };
}

/** Expected damage per second of the hero and the team (« Puissance »). */
export const powerPerSecond = (state: GameState): BigNum => expectedDps(combatPower(state));

export interface TalismanView {
  readonly id: TalismanId;
  readonly cooldownMs: number;
  /** 0 when ready, 1 just after a cast. */
  readonly cooldownRatio: number;
}

export function talismanViews(state: GameState): TalismanView[] {
  return TALISMAN_IDS.map((id) => {
    const total = talismanCooldownMs(id, state.sanctuary.kekkai);
    const cooldownMs = state.cooldowns[id];
    return { id, cooldownMs, cooldownRatio: total > 0 ? Math.min(1, cooldownMs / total) : 0 };
  });
}

export type PurchaseView = {
  readonly id: UpgradeId;
  readonly level: number;
  readonly maxed: boolean;
  /** Levels the chosen mode would buy (at least 1, to show the next price). */
  readonly count: number;
  readonly cost: BigNum;
  readonly affordable: boolean;
};

/** The Sanctuary's upgrades for a purchase mode (×1, ×10, Max). */
export function upgradeViews(state: GameState, mode: PurchaseMode): PurchaseView[] {
  return UPGRADE_IDS.map((id) => {
    const level = state.sanctuary[id];
    const remaining = upgradeMaxLevel(id) - level;
    const wanted = mode === 'max' ? maxAffordable(id, level, state.souls) : mode;
    const count = Math.max(1, Math.min(wanted, remaining));
    const cost = upgradeCost(id, level, count);
    return {
      id,
      level,
      maxed: remaining <= 0,
      count,
      cost,
      affordable: remaining > 0 && gte(state.souls, cost),
    };
  });
}

/** Souls earned per second at the current wave, with the expected damage. */
export function soulsPerSecond(state: GameState): BigNum {
  const power = combatPower(state);
  const { wave } = state.parade;
  const attacksPerSecond = [
    power.heroIntervalMs,
    ...power.team.map((member) => member.intervalMs),
  ].reduce((total, interval) => total + 1000 / interval, 0);
  const killsPerSecond = min(div(expectedDps(power), waveHp(wave)), attacksPerSecond);
  return mul(mul(waveSouls(wave), power.soulsMultiplier * tierMultiplier(wave)), killsPerSecond);
}

export interface ShikigamiView {
  readonly seed: number;
  readonly level: number;
  readonly spec: YokaiSpec;
  readonly name: string;
  readonly inTeam: boolean;
}

/** The collection, team members first, then by rarity and level. */
export function collectionView(state: GameState): ShikigamiView[] {
  const rank = { legendary: 0, epic: 1, rare: 2, common: 3 } as const;
  return state.shikigami
    .map((shikigami) => {
      const spec = generate(shikigami.seed);
      return {
        seed: shikigami.seed,
        level: shikigami.level,
        spec,
        name: nameOf(spec),
        inTeam: state.team.includes(shikigami.seed),
      };
    })
    .sort(
      (a, b) =>
        Number(b.inTeam) - Number(a.inTeam) ||
        rank[a.spec.rarity] - rank[b.spec.rarity] ||
        b.level - a.level,
    );
}

export type GuardianStatus = 'defeated' | 'next' | 'upcoming';

export interface GuardianCard {
  readonly index: number;
  readonly wave: number;
  readonly status: GuardianStatus;
  /** Defeated once, or met in the current parade: its look is known. */
  readonly revealed: boolean;
}

/** The ten guardians of the V1 sheet, as the gallery shows them. */
export function guardianGallery(state: GameState): GuardianCard[] {
  const { every, count } = BALANCE.guardian;
  const nextWave = Math.ceil(state.parade.wave / every) * every;
  const nextIndex = guardianAt(nextWave).index;
  return Array.from({ length: count }, (_, index) => {
    const wave = (index + 1) * every;
    const defeated = state.guardiansDefeated.includes(index);
    return {
      index,
      wave,
      status: defeated ? 'defeated' : index === nextIndex ? 'next' : 'upcoming',
      revealed: defeated || state.parade.maxWave >= wave,
    };
  });
}
