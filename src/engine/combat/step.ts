import type { GameState } from '../gameState';
import {
  advance,
  type Battle,
  finishBattle,
  hit,
  isPaused,
  retreat,
  spawnEnemy,
  startBattle,
  strike,
} from './battle';
import type { CombatEvent, CombatInput } from './events';
import { guardianAt } from './guardians';

export interface StepResult {
  readonly state: GameState;
  readonly events: readonly CombatEvent[];
}

function applyInput(battle: Battle, input: CombatInput): void {
  const { guardian } = battle;
  switch (input.type) {
    case 'tap':
      hit(battle, battle.power.tapDamage, 'tap');
      break;
    case 'engageGuardian':
      if (guardian !== null && !guardian.engaged) {
        guardian.engaged = true;
        battle.events.push({ type: 'guardianEngaged', wave: battle.wave, atMs: battle.elapsed });
      }
      break;
    case 'fleeGuardian':
      if (guardian !== null) {
        battle.events.push({ type: 'guardianFled', wave: battle.wave, atMs: battle.elapsed });
        retreat(battle);
      }
      break;
    case 'challengeGuardian':
      if (battle.farming) {
        battle.farming = false;
        spawnEnemy(battle, battle.wave + 1, 0);
      }
      break;
  }
}

function failGuardian(battle: Battle): void {
  battle.events.push({
    type: 'guardianFailed',
    wave: battle.wave,
    index: guardianAt(battle.wave).index,
    atMs: battle.elapsed,
  });
  retreat(battle);
}

/**
 * Advances the fight by `dtMs` (injected time, never read from a clock). Pure: the same state,
 * duration and inputs always give the same result. Inputs happen at the start of the step;
 * automatic attacks happen on fixed integer timers, so splitting a duration into several steps
 * gives the same hits in the same order (burn damage only differs by float rounding).
 * A guardian waiting for the player pauses the fight until `engageGuardian`.
 */
export function step(
  state: GameState,
  dtMs: number,
  inputs: readonly CombatInput[] = [],
): StepResult {
  const duration = Number.isFinite(dtMs) && dtMs > 0 ? dtMs : 0;
  if (duration === 0 && inputs.length === 0) {
    return { state, events: [] };
  }
  const battle = startBattle(state);
  inputs.forEach((input) => applyInput(battle, input));

  // Half-open interval [start, end[: what is due exactly at the end belongs to the next step.
  // Attackers due at the same time strike in order (hero, then team), before a guardian timeout.
  let remaining = duration;
  while (remaining > 0 && !isPaused(battle)) {
    const guardianLeft = battle.guardian?.timeLeftMs ?? Infinity;
    const next = Math.min(...battle.timers, guardianLeft);
    const elapsed = Math.min(next, remaining);
    const before = battle.timers.map((timer) => timer - elapsed);
    advance(battle, elapsed);
    remaining -= elapsed;
    if (isPaused(battle)) {
      break;
    }
    battle.timers = before;
    if (next < remaining + elapsed) {
      battle.timers.forEach((timer, index) => {
        if (timer <= 0) {
          strike(battle, index);
        }
      });
      if (battle.guardian !== null && battle.guardian.engaged && battle.guardian.timeLeftMs <= 0) {
        failGuardian(battle);
      }
    }
  }

  return { state: finishBattle(state, battle), events: battle.events };
}
