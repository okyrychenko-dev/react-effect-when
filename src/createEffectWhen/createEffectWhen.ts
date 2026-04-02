import { useEffectWhen } from "../useEffectWhen";
import type {
  GuardPredicate,
  Predicate,
  UseEffectWhenEffect,
  UseEffectWhenOptions,
} from "../useEffectWhen";
import type { DependencyList } from "react";

/**
 * Factory that bakes a predicate into a reusable hook.
 *
 * Use this when the same predicate repeats across multiple components
 * and you want a named, consistent hook instead of repeating the inline condition.
 *
 * @example — shared auth guard
 * const useEffectWhenAuthed = createEffectWhen(
 *   ([user, token]: [User | null, string | null]) => user !== null && token !== null
 * );
 *
 * // in any component:
 * useEffectWhenAuthed(
 *   ([user, token]) => { initDashboard(user, token); },
 *   [user, token]
 * );
 *
 * @example — with a guard predicate for type narrowing
 * const useEffectWhenReady = createEffectWhen(
 *   (deps): deps is ReadyDeps<typeof deps> => predicates.ready(deps)
 * );
 */
export function createEffectWhen<T extends DependencyList, U extends T>(
  predicate: GuardPredicate<T, U>
): (effect: UseEffectWhenEffect<U>, deps: T, options?: UseEffectWhenOptions<T>) => void;
export function createEffectWhen<T extends DependencyList>(
  predicate: Predicate<T>
): (effect: UseEffectWhenEffect<T>, deps: T, options?: UseEffectWhenOptions<T>) => void;
export function createEffectWhen<T extends DependencyList>(predicate: Predicate<T>) {
  return function useCreatedEffectWhen(
    effect: UseEffectWhenEffect<T>,
    deps: T,
    options?: UseEffectWhenOptions<T>
  ): void {
    useEffectWhen(effect, deps, predicate, options);
  };
}
