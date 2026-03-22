import { DependencyList } from "react";
import { TruthyDeps } from "../useEffectWhen/useEffectWhen.types";
import { predicates } from "../useEffectWhen/useEffectWhen.utils";

export function isTruthy<T extends DependencyList>(deps: T): deps is TruthyDeps<T> {
  return predicates.truthy(deps);
}
