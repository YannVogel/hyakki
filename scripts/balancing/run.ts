import {
  type CombatInput,
  createNewGame,
  type GameState,
  log10,
  simulateOffline,
  startFestival,
  step,
  TALISMAN_IDS,
  type TalismanId,
} from '../../src/engine';
import { canBeatGuardian, pickTeam, spendSouls, wantsFestival } from './bot';
import type { Profile } from './profiles';

const HOUR_MS = 3_600_000;
const TICK_MS = 1000;
const VISIT_EVERY_TICKS = 30;

export interface Snapshot {
  readonly day: number;
  readonly realHours: number;
  readonly activeMinutes: number;
  readonly parade: number;
  readonly wave: number;
  readonly maxWave: number;
  readonly bestWave: number;
  readonly soulsLog10: number;
  readonly sparks: number;
  readonly ofuda: number;
  readonly shikigami: number;
  readonly guardians: number;
}

export interface Milestone {
  readonly event: string;
  readonly realHours: number;
  readonly activeMinutes: number;
}

export interface RunResult {
  readonly profile: Profile;
  readonly snapshots: readonly Snapshot[];
  readonly milestones: readonly Milestone[];
}

interface Clock {
  realMs: number;
  activeMs: number;
  lastGuardianTryMs: number;
  /** Best wave over all parades. */
  bestWave: number;
}

const FORCED_RETRY_MS = 5 * 60_000;

/** What the bot does when it looks at the game: Festival, team, purchases, retry a guardian. */
function visit(
  state: GameState,
  clock: Clock,
  milestones: Milestone[],
  tapsPerSecond: number,
): GameState {
  let current = state;
  if (wantsFestival(current)) {
    const festival = startFestival(current);
    if (festival.ok) {
      current = festival.state;
      milestones.push(milestoneAt(`festival-${current.parade.number - 1}`, clock));
    }
  }
  current = spendSouls(pickTeam(current));
  const retry =
    canBeatGuardian(current, current.parade.wave + 1, tapsPerSecond) ||
    clock.activeMs - clock.lastGuardianTryMs >= FORCED_RETRY_MS;
  if (current.parade.farming && retry) {
    current = step(current, 0, [{ type: 'challengeGuardian' }]).state;
  }
  return current;
}

function milestoneAt(event: string, clock: Clock): Milestone {
  return {
    event,
    realHours: clock.realMs / HOUR_MS,
    activeMinutes: clock.activeMs / 60_000,
  };
}

/** Always faces the guardian; attack talismans are kept for guardians, Kekkai boosts souls. */
function inputsFor(state: GameState, tapsPerSecond: number, clock: Clock): CombatInput[] {
  const { guardian } = state.enemy;
  if (guardian !== null && !guardian.engaged) {
    clock.lastGuardianTryMs = clock.activeMs;
    return [{ type: 'engageGuardian' }];
  }
  const usable: readonly TalismanId[] = guardian !== null ? TALISMAN_IDS : ['kekkai'];
  const talismans = usable
    .filter((id) => state.cooldowns[id] === 0)
    .map((talisman): CombatInput => ({ type: 'castTalisman', talisman }));
  const taps = Array.from({ length: tapsPerSecond }, (): CombatInput => ({ type: 'tap' }));
  return [...talismans, ...taps];
}

const RECORD_MILESTONES = [100, 250, 500, 800, 1000, 1500, 2000];

function recordMilestones(
  state: GameState,
  before: GameState,
  clock: Clock,
  milestones: Milestone[],
) {
  for (const index of state.guardiansDefeated) {
    if (!before.guardiansDefeated.includes(index)) {
      milestones.push(milestoneAt(`gardien-${index + 1}`, clock));
    }
  }
  for (const wave of RECORD_MILESTONES) {
    if (state.parade.maxWave >= wave && clock.bestWave < wave) {
      milestones.push(milestoneAt(`record-${wave}`, clock));
    }
  }
  clock.bestWave = Math.max(clock.bestWave, state.parade.maxWave);
}

function playActive(
  start: GameState,
  minutes: number,
  profile: Profile,
  clock: Clock,
  milestones: Milestone[],
): GameState {
  let state = start;
  for (let tick = 0; tick < minutes * 60; tick++) {
    const before = state;
    state = step(state, TICK_MS, inputsFor(state, profile.tapsPerSecond, clock)).state;
    clock.realMs += TICK_MS;
    clock.activeMs += TICK_MS;
    recordMilestones(state, before, clock, milestones);
    if (tick % VISIT_EVERY_TICKS === VISIT_EVERY_TICKS - 1) {
      state = visit(state, clock, milestones, profile.tapsPerSecond);
    }
  }
  return state;
}

function snapshotOf(state: GameState, day: number, clock: Clock): Snapshot {
  return {
    bestWave: clock.bestWave,
    day,
    realHours: clock.realMs / HOUR_MS,
    activeMinutes: clock.activeMs / 60_000,
    parade: state.parade.number,
    wave: state.parade.wave,
    maxWave: state.parade.maxWave,
    soulsLog10: log10(state.souls),
    sparks: state.sparks,
    ofuda: state.ofuda,
    shikigami: state.shikigami.length,
    guardians: state.guardiansDefeated.length,
  };
}

/** Plays `days` days of a profile, deterministically (same seed, same result). */
export function runProfile(profile: Profile, days: number, seed = 2026): RunResult {
  let state = createNewGame(seed);
  const snapshots: Snapshot[] = [];
  const milestones: Milestone[] = [];
  const firstSession = profile.sessions[0].atHour * HOUR_MS;
  const clock: Clock = { realMs: firstSession, activeMs: 0, lastGuardianTryMs: 0, bestWave: 1 };

  for (let day = 0; day < days; day++) {
    for (const session of profile.sessions) {
      const sessionStart = (day * 24 + session.atHour) * HOUR_MS;
      if (sessionStart > clock.realMs) {
        const before = state;
        state = simulateOffline(state, sessionStart - clock.realMs).state;
        clock.realMs = sessionStart;
        recordMilestones(state, before, clock, milestones);
      }
      state = visit(state, clock, milestones, profile.tapsPerSecond);
      state = playActive(state, session.activeMinutes, profile, clock, milestones);
      state = visit(state, clock, milestones, profile.tapsPerSecond);
      snapshots.push(snapshotOf(state, day + 1, clock));
    }
  }
  return {
    profile,
    snapshots,
    milestones: milestones.map((milestone) => ({
      ...milestone,
      realHours: milestone.realHours - firstSession / HOUR_MS,
    })),
  };
}
