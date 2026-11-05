import { add, type BigNum, div, gt, log10, lte, mul, pow, sub, ZERO } from '../numbers';

/** Cost of `count` levels whose prices grow by `growth`, the first one costing `first`. */
export function geometricCost(first: BigNum, growth: number, count: number): BigNum {
  if (count <= 0) {
    return ZERO;
  }
  return div(mul(first, sub(pow(growth, count), 1)), growth - 1);
}

/** Most levels affordable with `budget`, `limit` at most (closed form, then checked exactly). */
export function maxGeometricCount(
  first: BigNum,
  growth: number,
  budget: BigNum,
  limit = Infinity,
): number {
  if (limit <= 0 || gt(first, budget)) {
    return 0;
  }
  const ratio = add(div(mul(budget, growth - 1), first), 1);
  let count = Math.min(limit, Math.floor(log10(ratio) / Math.log10(growth)));
  // The logarithm may be off by one either way because of float rounding.
  while (count > 0 && gt(geometricCost(first, growth, count), budget)) {
    count -= 1;
  }
  while (count < limit && lte(geometricCost(first, growth, count + 1), budget)) {
    count += 1;
  }
  return count;
}
