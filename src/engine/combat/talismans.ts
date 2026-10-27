import { BALANCE } from '../balance';
import type { GameState, TalismanId } from '../gameState';
import { mul } from '../numbers';
import { type Battle, hit, isPaused } from './battle';
import { type Element, GUARDIANS, guardianAt } from './guardians';

const ELEMENTS: Partial<Record<TalismanId, Element>> = { kitsunebi: 'fire', raijin: 'thunder' };

/** Cooldown after the Kekkai upgrade: −2 % per level, at most −50 %. */
export function talismanCooldownMs(talisman: TalismanId, kekkaiLevel: number): number {
  const { maxCooldownReduction } = BALANCE.talismans;
  const reduction = Math.min(
    maxCooldownReduction,
    BALANCE.upgrades.kekkai.cooldownPerLevel * kekkaiLevel,
  );
  return Math.round(BALANCE.talismans[talisman].cooldownMs * (1 - reduction));
}

function weaknessMultiplier(battle: Battle, talisman: TalismanId): number {
  if (battle.guardian === null) {
    return 1;
  }
  const weakness = GUARDIANS[guardianAt(battle.wave).index].weakness;
  return ELEMENTS[talisman] === weakness ? BALANCE.talismans.weaknessMultiplier : 1;
}

/** Casts a talisman if it is ready (and the fight is not waiting for the player). */
export function castTalisman(battle: Battle, state: GameState, talisman: TalismanId): void {
  if (battle.cooldowns[talisman] > 0 || isPaused(battle)) {
    battle.events.push({
      type: 'talismanNotReady',
      talisman,
      cooldownMs: battle.cooldowns[talisman],
      atMs: battle.elapsed,
    });
    return;
  }
  battle.cooldowns[talisman] = talismanCooldownMs(talisman, state.sanctuary.kekkai);
  battle.events.push({ type: 'talismanCast', talisman, atMs: battle.elapsed });
  const { kitsunebi, raijin, kekkai } = BALANCE.talismans;
  const weakness = weaknessMultiplier(battle, talisman);
  switch (talisman) {
    case 'kitsunebi':
      battle.effects.burnMs = kitsunebi.burnDurationMs;
      hit(battle, mul(battle.power.heroHitDamage, kitsunebi.damageMultiplier * weakness), talisman);
      break;
    case 'raijin':
      hit(battle, mul(battle.power.heroHitDamage, raijin.damageMultiplier * weakness), talisman);
      break;
    case 'kekkai':
      if (battle.guardian !== null) {
        battle.guardian.timeLeftMs += kekkai.guardianExtraMs;
      } else {
        battle.effects.soulsBoostMs = kekkai.soulsBoostDurationMs;
      }
      break;
  }
}
