/** An object discriminated by a literal-valued field at key `K`. */
export type Discriminant<K extends PropertyKey> = Record<K, PropertyKey>;

/**
 * Narrows a single dependency `Q` (discriminated by `K`) down to the variant
 * whose `K` field equals `V`.
 */
export type MatchedDeps<
  K extends PropertyKey,
  Q extends Discriminant<K>,
  V extends Q[K],
> = readonly [Extract<Q, Record<K, V>>];
