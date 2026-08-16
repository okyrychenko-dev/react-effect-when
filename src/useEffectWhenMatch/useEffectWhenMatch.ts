import { useEffectWhen } from "../useEffectWhen";
import { isMatch } from "./useEffectWhenMatch.utils";
import type { UseEffectWhenEffect, UseEffectWhenOptions } from "../useEffectWhen";
import type { Discriminant, MatchedDeps } from "./useEffectWhenMatch.types";

/**
 * Gates an effect on a discriminated union at `deps[0]` whose field at `key`
 * equals `value`, narrowing the effect's dependency to that matched variant
 * (e.g. a query result narrowed to its "success" shape).
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
  value: V,
  options?: UseEffectWhenOptions<readonly [Q]>
): void {
  useEffectWhen(effect, deps, isMatch<K, Q, V>(key, value), options);
}
