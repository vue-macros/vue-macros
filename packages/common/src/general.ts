const isArray: (arg: unknown) => arg is any[] | readonly any[] = Array.isArray

export function toArray<T>(
  thing: readonly T[] | T | undefined | null,
): readonly T[] {
  if (isArray(thing)) return thing
  if (thing == null) return []
  return [thing]
}
