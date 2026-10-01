import type {
  BoundMatchPredicate,
  Discriminant,
  DiscriminantKey,
  MatchedDeps,
} from "./useEffectWhenMatch.types";
import type { GuardPredicate } from "../useEffectWhen";

function isReadonlyArray<T>(value: T | ReadonlyArray<T>): value is ReadonlyArray<T> {
  return Array.isArray(value);
}

function includesValue<T>(values: ReadonlyArray<T>, candidate: T): boolean {
  return values.includes(candidate);
}

function matchesValue<T>(value: T | ReadonlyArray<T>, candidate: T): boolean {
  if (isReadonlyArray(value)) {
    return includesValue(value, candidate);
  }

  return candidate === value;
}

export function matchPredicate<K extends PropertyKey, Q extends Discriminant<K>, V extends Q[K]>(
  key: K,
  value: V | ReadonlyArray<V>
): GuardPredicate<readonly [Q], MatchedDeps<K, Q, V>> {
  return function matchesDiscriminant(deps): deps is MatchedDeps<K, Q, V> {
    return matchesValue<Q[K]>(value, deps[0][key]);
  };
}

/**
 * Binds the complete source union once, then infers each key and selection.
 * Existing explicit-generic matchPredicate calls remain supported.
 */
export function matchPredicateFor<Q extends object>(): BoundMatchPredicate<Q> {
  return function matchSource<K extends DiscriminantKey<Q>, V extends Q[K] & PropertyKey>(
    key: K,
    value: V | ReadonlyArray<V>
  ): GuardPredicate<readonly [Q], readonly [Extract<Q, Record<K, V>>]> {
    return function matchesDiscriminant(deps): deps is readonly [Extract<Q, Record<K, V>>] {
      return matchesValue<Q[K]>(value, deps[0][key]);
    };
  };
}
