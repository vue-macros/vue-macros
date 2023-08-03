import { compileTemplate } from '@vue/compiler-sfc'
import { describe, expect, test } from 'vitest'
import { transformBooleanProp } from '../src'

function compile(code: string) {
  return compileTemplate({
    source: code,
    filename: 'anonymous.vue',
    id: 'xxx',
    compilerOptions: {
      nodeTransforms: [transformBooleanProp()],
    },
  })
}

describe('compiler', () => {
  test('basic', () => {
    const original = compile(`<input :checked="true" />`)
    const sugar = compile(`<input check />`)
    expect(sugar.code).toBe(original.code)
    expect((sugar.ast as any).children[0].props[0]).matchSnapshot()
  })
})
