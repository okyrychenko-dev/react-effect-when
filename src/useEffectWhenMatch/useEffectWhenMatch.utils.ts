import type { Discriminant, MatchedDeps } from "./useEffectWhenMatch.types";
import type { GuardPredicate } from "../useEffectWhen";

function isReadonlyArray<T>(value: T | ReadonlyArray<T>): value is ReadonlyArray<T> {
  return Array.isArray(value);
}

function includesValue<T>(values: ReadonlyArray<T>, candidate: T): boolean {
  return values.includes(candidate);
}

export function matchPredicate<K extends PropertyKey, Q extends Discriminant<K>, V extends Q[K]>(
  key: K,
  value: V | ReadonlyArray<V>
): GuardPredicate<readonly [Q], MatchedDeps<K, Q, V>> {
  return function matchesDiscriminant(deps): deps is MatchedDeps<K, Q, V> {
    if (isReadonlyArray(value)) {
      return includesValue(value, deps[0][key]);
    }

    return deps[0][key] === value;
  };
}
