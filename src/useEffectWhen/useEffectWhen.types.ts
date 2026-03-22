import type { DependencyList, EffectCallback } from "react";

export type Predicate<T extends DependencyList> = (deps: T) => boolean;

export type GuardPredicate<T extends DependencyList, U extends T> = (deps: T) => deps is U;

export type EffectResult = ReturnType<EffectCallback>;

export type UseEffectWhenEffect<T extends DependencyList> = (deps: T) => EffectResult;

export type ReadyDeps<T extends DependencyList> = {
  [K in keyof T]: NonNullable<T[K]>;
};

export type Falsy = false | 0 | 0n | "" | null | undefined;

export type TruthyDeps<T extends DependencyList> = {
  [K in keyof T]: Exclude<T[K], Falsy>;
};

export interface UseEffectWhenOptions<T extends DependencyList> {
  /**
   * Run the effect only once when predicate is first satisfied.
   * @default true
   */
  once?: boolean;

  /**
   * Called when deps change and predicate returns false.
   * Stops being called after the effect runs if `once: true`.
   * Useful for debugging or analytics.
   *
   * NOTE: onSkip fires only when deps change and predicate returns false —
   * it does NOT fire on every render, because useEffect only re-runs when deps change.
   */
  onSkip?: (deps: T) => void;
}

export interface UseEffectWhenPredicates {
  ready<T extends DependencyList>(deps: T): deps is ReadyDeps<T>;
  truthy<T extends DependencyList>(deps: T): deps is TruthyDeps<T>;
  always<T extends DependencyList>(deps: T): deps is T;
}
