import { useEffectWhen } from "../useEffectWhen";
import { isReady } from "./useEffectWhenReady.utils";
import type { ReadyDeps, UseEffectWhenEffect, UseEffectWhenOptions } from "../useEffectWhen";
import type { DependencyList } from "react";

export function useEffectWhenReady<T extends DependencyList>(
  effect: UseEffectWhenEffect<ReadyDeps<T>>,
  deps: T,
  options?: UseEffectWhenOptions<T>
): void {
  useEffectWhen(effect, deps, isReady, options);
}
