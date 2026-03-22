import { useEffectWhen } from "../useEffectWhen";
import { isTruthy } from "./useEffectWhenTruthy.utils";
import type { TruthyDeps, UseEffectWhenEffect, UseEffectWhenOptions } from "../useEffectWhen";
import type { DependencyList } from "react";

export function useEffectWhenTruthy<T extends DependencyList>(
  effect: UseEffectWhenEffect<TruthyDeps<T>>,
  deps: T,
  options?: UseEffectWhenOptions<T>
): void {
  useEffectWhen(effect, deps, isTruthy, options);
}
