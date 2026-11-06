/**
 * Fastest of `runs` timed calls of `run`, in ms, after one untimed warm-up call. A single timing
 * on a shared CI runner, slowed down by coverage, can catch a garbage collection or a busy
 * neighbour: « Meilleure équipe » once took 135 ms for 100 allowed, then passed on a rerun.
 */
export function fastestMs(run: () => void, runs = 3): number {
  run();
  let fastest = Infinity;
  for (let i = 0; i < runs; i++) {
    const started = performance.now();
    run();
    fastest = Math.min(fastest, performance.now() - started);
  }
  return fastest;
}
