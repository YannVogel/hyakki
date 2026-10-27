// Performance spike for the BigNum adapter (#15): 1 million multiplications.
// Run with: npx tsx scripts/bench-bignum.ts
import { big, mul, toMantissaExponent } from '../src/engine/numbers';

const ITERATIONS = 1_000_000;
const RUNS = 5;

function run(): number {
  let value = big(1.5);
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    value = mul(value, 1.0001);
  }
  const elapsed = performance.now() - start;
  if (toMantissaExponent(value).exponent < 0) {
    throw new Error('unexpected result');
  }
  return elapsed;
}

const timings = Array.from({ length: RUNS }, run).sort((a, b) => a - b);
console.log(
  `${ITERATIONS} multiplications — median ${timings[Math.floor(RUNS / 2)].toFixed(1)} ms, ` +
    `min ${timings[0].toFixed(1)} ms, max ${timings[RUNS - 1].toFixed(1)} ms (Node ${process.version})`,
);
