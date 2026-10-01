import type { GuardPredicate } from "../useEffectWhen";

/** An object discriminated by a literal-valued field at key `K`. */
export type Discriminant<K extends PropertyKey> = Record<K, PropertyKey>;

/**
 * Narrows a single dependency `Q` (discriminated by `K`) down to the variant
 * whose `K` field equals `V`.
 */
export type MatchedDeps<
  K extends PropertyKey,
  Q extends Discriminant<K>,
  V extends Q[K] | ReadonlyArray<Q[K]>,
> = readonly [Extract<Q, Record<K, V extends ReadonlyArray<infer E> ? E : V>>];

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
) => GuardPredicate<readonly [Q], readonly [Extract<Q, Record<K, V>>]>;
