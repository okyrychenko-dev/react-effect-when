export function tuple<T>(value: T): [T] {
  return [value];
}

export function pair<T1, T2>(first: T1, second: T2): [T1, T2] {
  return [first, second];
}
