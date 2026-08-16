import type { GuardPredicate } from "../useEffectWhen";
import type { Discriminant, MatchedDeps } from "./useEffectWhenMatch.types";

export function isMatch<K extends PropertyKey, Q extends Discriminant<K>, V extends Q[K]>(
  key: K,
  value: V
): GuardPredicate<readonly [Q], MatchedDeps<K, Q, V>> {
  return function matchesDiscriminant(deps): deps is MatchedDeps<K, Q, V> {
    return deps[0][key] === value;
  };
}
