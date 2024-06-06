import { compileTemplate } from '@vue/compiler-sfc'
import { describe, expect, test } from 'vitest'
import { transformBooleanProp } from '../src'

function compile(code: string, negativePrefix?: string) {
  return compileTemplate({
    source: code,
    filename: 'anonymous.vue',
    id: 'xxx',
    compilerOptions: {
      nodeTransforms: [
        transformBooleanProp({
          negativePrefix,
        }),
      ],
    },
  })
}

describe('compiler', () => {
  test('basic', () => {
    const original = compile(`<input :checked="true" />`)
    const sugar = compile(`<input checked />`)
    expect(sugar.code).toBe(original.code)
    expect((sugar.ast as any).children[0].props[0]).matchSnapshot()
  })

  test('false prop', () => {
    const original = compile(`<input :checked="false" />`)
    const sugar = compile(`<input !checked />`)
    expect(sugar.code).toBe(original.code)
    expect((sugar.ast as any).children[0].props[0]).matchSnapshot()
  })

  test('false prop prefix', () => {
    const original = compile(`<input :checked="false" !w-5 />`, '~')
    const sugar = compile(`<input ~checked !w-5 />`, '~')
    expect(sugar.code).toBe(original.code)
    expect((sugar.ast as any).children[0].props[0]).matchSnapshot()
  })
})
