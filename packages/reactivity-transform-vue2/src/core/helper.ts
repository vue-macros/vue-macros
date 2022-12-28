export const helperId = '/vue2-reactivity-transform-helper'
export const helperCode = `export function createPropsRestProxy(props, excludedKeys) {
  const ret = {}
  for (const key in props) {
    if (!excludedKeys.includes(key)) {
      Object.defineProperty(ret, key, {
        enumerable: true,
        get: () => props[key],
      })
    }
  }
  return ret
}`
