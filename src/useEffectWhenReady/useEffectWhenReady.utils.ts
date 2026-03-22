import { DependencyList } from "react";
import { ReadyDeps, predicates } from "../useEffectWhen";

export function isReady<T extends DependencyList>(deps: T): deps is ReadyDeps<T> {
  return predicates.ready(deps);
}
