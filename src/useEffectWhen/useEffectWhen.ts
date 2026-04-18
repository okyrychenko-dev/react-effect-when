import { type DependencyList, useEffect, useRef } from "react";
import type {
  GuardPredicate,
  Predicate,
  UseEffectWhenEffect,
  UseEffectWhenOptions,
} from "./useEffectWhen.types";

/**
 * A universal `useEffect` that fires only when `predicate(deps)` returns `true`.
 *
 * Design decisions:
 * - `predicate` and `onSkip` are stored in refs so they are always fresh
 *   but don't need to be listed in deps — they are not reactive values.
 * - `onSkip` is called only when deps change AND predicate returns false,
 *   matching useEffect semantics (not on every render).
 * - `once: false` re-runs the effect every time predicate becomes true.
 *   React handles calling the previous cleanup automatically via the return fn.
 * - `effect` receives the current deps tuple for convenience and better typing.
 *
 * @example — run once when isOpen becomes true
 * useEffectWhen(
 *   ([open]) => { fetchData(open); },
 *   [isOpen],
 *   ([open]) => open === true,
 * );
 *
 * @example — run once when user & socket are ready
 * useEffectWhen(
 *   ([user, socket]) => { socket.emit("identify", user.id); },
 *   [user, socket],
 *   predicates.ready,
 * );
 *
 * @example — re-run every time score > 100
 * useEffectWhen(
 *   ([score]) => { showConfetti(score); },
 *   [score],
 *   ([s]) => s > 100,
 *   { once: false },
 * );
 */
export function useEffectWhen<T extends DependencyList, U extends T>(
  effect: UseEffectWhenEffect<U>,
  deps: T,
  predicate: GuardPredicate<T, U>,
  options?: UseEffectWhenOptions<T>
): void;
export function useEffectWhen<T extends DependencyList>(
  effect: UseEffectWhenEffect<T>,
  deps: T,
  predicate: Predicate<T>,
  options?: UseEffectWhenOptions<T>
): void;
export function useEffectWhen<T extends DependencyList>(
  effect: UseEffectWhenEffect<T>,
  deps: T,
  predicate: Predicate<T>,
  { once = true, onSkip }: UseEffectWhenOptions<T> = {}
): void {
  const hasRun = useRef<boolean>(false);

  const predicateRef = useRef<Predicate<T>>(predicate);
  const onceRef = useRef<boolean>(once);
  const onSkipRef = useRef<UseEffectWhenOptions<T>["onSkip"]>(onSkip);

  predicateRef.current = predicate;
  onceRef.current = once;
  onSkipRef.current = onSkip;

  useEffect(() => {
    if (onceRef.current && hasRun.current) {
      return;
    }

    if (!predicateRef.current(deps)) {
      onSkipRef.current?.(deps);
      return;
    }

    hasRun.current = true;

    const cleanup = effect(deps);

    return () => {
      if (cleanup) {
        cleanup();
      }

      if (!onceRef.current) {
        hasRun.current = false;
      }
    };

    // React should re-run only when the dependency tuple changes.
    // `predicate`, `onSkip`, and `once` stay fresh through refs and are intentionally
    // not treated as reactive dependencies of this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
