export function createPropsRestProxy(
  props: any,
  excludedKeys: string[],
): Record<string, any> {
  const ret: Record<string, any> = Object.create(null)
  // eslint-disable-next-line no-restricted-syntax
  for (const key in props) {
    if (!excludedKeys.includes(key)) {
      Object.defineProperty(ret, key, {
        enumerable: true,
        get: () => props[key],
      })
    }
  }
  return ret
}
