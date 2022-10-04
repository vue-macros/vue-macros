import { compileTemplate } from '@vue/compiler-sfc'
import { describe, expect, test } from 'vitest'
import { transformShortVmodel } from '../src'

function compile(code: string) {
  return compileTemplate({
    source: code,
    filename: 'anonymous.vue',
    id: 'xxx',
    compilerOptions: {
      nodeTransforms: [transformShortVmodel()],
    },
  }).code
}

describe('compiler', () => {
  test('default name', () => {
    const original = compile(`<input v-model="foo" />`)
    const sugar = compile(`<input ::="foo" />`)
    expect(sugar).toBe(original)
  })

  test('w/ name', () => {
    const original = compile(`<input v-model:foo="foo" />`)
    const sugar = compile(`<input ::foo="foo" />`)
    expect(sugar).toBe(original)
  })
})
