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
 * NOTE: this bakes `predicate`'s deps shape in at creation time, so it fits a
 * fixed deps shape reused across call sites. It's not a fit for the
 * universal predicates like `predicates.ready`/`predicates.truthy` — those
 * need to narrow a different deps tuple on every call, which is what
 * `useEffectWhenReady`/`useEffectWhenTruthy` are for.
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
