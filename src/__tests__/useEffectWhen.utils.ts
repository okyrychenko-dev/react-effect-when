import { DependencyList } from "react";
import { predicates } from "../useEffectWhen";

export function tuple<T>(value: T): [T] {
  return [value];
}

export function pair<T1, T2>(first: T1, second: T2): [T1, T2] {
  return [first, second];
}

export function ready(deps: DependencyList): boolean {
  return predicates.ready(deps);
}

export function truthy(deps: DependencyList): boolean {
  return predicates.truthy(deps);
}

export function always(deps: DependencyList): boolean {
  return predicates.always(deps);
}
