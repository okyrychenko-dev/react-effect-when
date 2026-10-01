import type { GuardPredicate } from "../useEffectWhen";

/** An object with a string, number or symbol field at key `K`. */
export type Discriminant<K extends PropertyKey> = Record<K, PropertyKey>;

/** Retains each source variant whose field overlaps a selected value. */
export type MatchedVariant<K extends PropertyKey, Q, V> =
  Q extends Record<K, unknown> ? ([Q[K] & V] extends [never] ? never : Q) : never;

/** Narrows a single dependency to variants whose field can match the selection. */
export type MatchedDeps<
  K extends PropertyKey,
  Q extends Discriminant<K>,
  V extends Q[K] | ReadonlyArray<Q[K]>,
> = readonly [MatchedVariant<K, Q, V extends ReadonlyArray<infer E> ? E : V>];

/** Common, required fields whose values can discriminate the source union. */
export type DiscriminantKey<Q extends object, K extends keyof Q = keyof Q> = K extends keyof Q
  ? [Q] extends [Discriminant<K>]
    ? K
    : never
  : never;

/** A matching factory with its complete source union bound once. */
export type BoundMatchPredicate<Q extends object> = <
  K extends DiscriminantKey<Q>,
  V extends Q[K] & PropertyKey,
>(
  key: K,
  value: V | ReadonlyArray<V>
) => GuardPredicate<readonly [Q], readonly [MatchedVariant<K, Q, V>]>;
