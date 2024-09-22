function getByPath(obj: any, path: string[] = []) {
  while (path.length) {
    obj = obj[path.shift()!]
  }
  return obj
}

export function createDefaultPropsProxy(
  props: any,
  defaults?: any,
): Record<string, any> {
  const ret: Record<string, any> = {}
  for (const key of Object.keys(defaults)) {
    const path = key.split(/[.?[\]]/).filter(Boolean)
    Object.defineProperty(ret, key, {
      enumerable: true,
      get: () => getByPath(props, path) ?? getByPath(defaults, path),
    })
  }
  return ret
}
