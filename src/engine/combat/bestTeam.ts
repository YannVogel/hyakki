import { type GameState, type Shikigami, TEAM_SIZE } from '../gameState';
import { add, type BigNum, compare, mul } from '../numbers';
import { shikigamiHitRatio, shikigamiIntervalMs, teamBonus, teamMembers } from '../shikigami';
import { burnDps } from './battle';
import { waveHp } from './enemy';
import { combatPower, expectedDps } from './power';

/** Damage per second of a shikigami on its own, in hero hits (no team bonus). */
export const shikigamiDps = (shikigami: Shikigami): BigNum =>
  mul(shikigamiHitRatio(shikigami), 1000 / shikigamiIntervalMs(shikigami));

/**
 * Expected damage per second of the hero and a team on the current wave: the hits (team bonuses
 * for attack, speed and critical hits included), then the burns they cap.
 */
export function teamDps(state: GameState, team: readonly number[]): BigNum {
  // Sorted: the same members always add up in the same order, to the same rounding.
  const power = combatPower({ ...state, team: [...team].sort((a, b) => a - b) });
  const hits = expectedDps(power);
  return add(hits, burnDps(waveHp(state.parade.wave), power.burnRate, hits));
}

/** Shikigami kept for the combinations: the best on their own, so the search stays instant. */
const SHORTLIST = 12;

interface Candidate {
  readonly team: readonly number[];
  readonly dps: BigNum;
  readonly souls: number;
}

/** Best first: damage, then the souls bonus, then the smallest seeds (a stable choice). */
function byStrength(a: Candidate, b: Candidate): number {
  const seeds = (candidate: Candidate) => [...candidate.team].sort((x, y) => x - y);
  const [seedsA, seedsB] = [seeds(a), seeds(b)];
  const firstDifferent = seedsA.findIndex((seed, index) => seed !== seedsB[index]);
  return (
    compare(b.dps, a.dps) ||
    b.souls - a.souls ||
    (firstDifferent === -1 ? 0 : seedsA[firstDifferent] - seedsB[firstDifferent])
  );
}

function combinations(items: readonly number[], size: number): number[][] {
  if (size === 0) {
    return [[]];
  }
  return items.flatMap((item, index) =>
    combinations(items.slice(index + 1), size - 1).map((rest) => [item, ...rest]),
  );
}

/**
 * The `TEAM_SIZE` shikigami that deal the most damage together, each judged at level 1: the
 * yōkai itself counts, not the levels invested in it. Exact when the collection is no larger than
 * the shortlist; beyond, the combinations are limited to the best shikigami on their own.
 */
export function bestTeam(state: GameState): number[] {
  const levelOne = {
    ...state,
    shikigami: state.shikigami.map((entry) => ({ ...entry, level: 1 })),
  };
  const candidate = (team: readonly number[]): Candidate => ({
    team,
    dps: teamDps(levelOne, team),
    souls: teamBonus(teamMembers({ ...levelOne, team: [...team] })).souls,
  });
  const shortlist = levelOne.shikigami
    .map((entry) => candidate([entry.seed]))
    .sort(byStrength)
    .slice(0, SHORTLIST)
    .map((entry) => entry.team[0]);
  const [best] = combinations(shortlist, Math.min(TEAM_SIZE, shortlist.length))
    .map(candidate)
    .sort(byStrength);
  return [...(best?.team ?? [])];
}
