import {
  BALANCE,
  type BigNum,
  combatPower,
  div,
  expectedDps,
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
