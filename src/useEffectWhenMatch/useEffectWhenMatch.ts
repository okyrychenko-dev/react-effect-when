import { useEffectWhen } from "../useEffectWhen";
import { matchPredicate } from "./useEffectWhenMatch.utils";
import type { Discriminant, MatchedDeps } from "./useEffectWhenMatch.types";
import type { UseEffectWhenEffect, UseEffectWhenOptions } from "../useEffectWhen";

/**
 * Gates an effect on a discriminated union at `deps[0]` whose field at `key`
 * equals `value` or any value in a readonly array, narrowing the effect's
 * dependency to the matched variant or union of variants. An empty value array
 * never matches and narrows the effect's dependency to `never`.
 *
 * This specialized helper accepts one dependency. Use `useEffectWhen` with a
 * custom type guard for conditions involving multiple dependencies.
 */
export function useEffectWhenMatch<
  K extends PropertyKey,
  Q extends Discriminant<K>,
  V extends Q[K],
>(
  effect: UseEffectWhenEffect<MatchedDeps<K, Q, V>>,
  deps: readonly [Q],
  key: K,
  value: V | ReadonlyArray<V>,
  options?: UseEffectWhenOptions<readonly [Q]>
): void {
  useEffectWhen(effect, deps, matchPredicate<K, Q, V>(key, value), options);
}
