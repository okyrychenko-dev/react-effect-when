import { type DependencyList, useEffect, useRef } from "react";
import type { UseEffectWhenEffect } from "../useEffectWhen";

/**
 * A `useEffect` variant that skips the initial mount and runs only after deps change.
 *
 * Use this when you want update-only behavior without repeating a `useRef(true)` guard
 * in every component.
 */
export function useEffectWhenChanged<T extends DependencyList>(
  effect: UseEffectWhenEffect<T>,
  deps: T
): void {
  const prevDepsRef = useRef<T | null>(null);

  useEffect(() => {
    const prevDeps = prevDepsRef.current;
    prevDepsRef.current = deps;

    if (prevDeps === null) {
      return;
    }

    const hasChanged = prevDeps.some((dep, index) => !Object.is(dep, deps[index]));

    if (!hasChanged) {
      return;
    }

    return effect(deps);

    // React should re-run only when the dependency tuple changes.
    // Previous deps are tracked internally so the initial mount and same-value updates can be skipped,
    // including Strict Mode's development-only setup replay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
