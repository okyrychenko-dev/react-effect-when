import { predicates, useEffectWhen } from "../useEffectWhen";
import type { ReadyDeps, UseEffectWhenEffect, UseEffectWhenOptions } from "../useEffectWhen";
import type { DependencyList } from "react";

export function useEffectWhenReady<T extends DependencyList>(
  effect: UseEffectWhenEffect<ReadyDeps<T>>,
  deps: T,
  options?: UseEffectWhenOptions<T>
): void {
  useEffectWhen(effect, deps, predicates.ready, options);
}
