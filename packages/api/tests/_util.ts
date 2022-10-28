import { expect } from 'vitest'

export function hideAstLocation<T>(ast: T): T {
  return JSON.parse(
    JSON.stringify(ast, (key, value) => {
      if (key === 'scope') return undefined

      return key === 'ast' ||
        (typeof value === 'object' && 'type' in value && 'loc' in value)
        ? `${value.type}...`
        : value
    })
  )
}

export function snapshot(obj: any) {
  expect(obj).toMatchSnapshot()
}
