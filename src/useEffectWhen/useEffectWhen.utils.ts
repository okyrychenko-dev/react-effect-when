import type { ReadyDeps, TruthyDeps, UseEffectWhenPredicates } from "./useEffectWhen.types";
import type { DependencyList } from "react";

function isReady<T extends DependencyList>(deps: T): deps is ReadyDeps<T> {
  return deps.every((dep) => dep !== null && dep !== undefined);
}

function isTruthy<T extends DependencyList>(deps: T): deps is TruthyDeps<T> {
  return deps.every(Boolean);
}

function isAlways<T extends DependencyList>(_deps: T): _deps is T {
  return true;
}

export const predicates: UseEffectWhenPredicates = {
  /** Satisfied when ALL deps are non-null and non-undefined */
  ready: isReady,

  /** Satisfied when ALL deps are truthy */
  truthy: isTruthy,

  /** Always satisfied — equivalent to plain useEffect */
  always: isAlways,
};
