import { compileTemplate } from '@vue/compiler-sfc'
import { describe, expect, test } from 'vitest'
import { transformShortVmodel, type Prefix } from '../src'

function compile(code: string, prefix?: Prefix) {
  return compileTemplate({
    source: code,
    filename: 'anonymous.vue',
    id: 'xxx',
    compilerOptions: {
      nodeTransforms: prefix ? [transformShortVmodel({ prefix })] : undefined,
    },
  })
}

describe('compiler', () => {
  describe('double bind', () => {
    test('default name', () => {
      const original = compile(`<input v-model="foo" />`)
      const sugar = compile(`<input ::="foo" />`, '::')
      expect(sugar.code).toBe(original.code)
      expect((sugar.ast as any).children[0].props[0]).matchSnapshot()
    })

    test('w/ name', () => {
      const original = compile(`<input v-model:foo="foo" />`)
      const sugar = compile(`<input ::foo="foo" />`, '::')
      expect(sugar.code).toBe(original.code)
      expect((sugar.ast as any).children[0].props[0]).matchSnapshot()
    })
  })

  describe('dollar sign', () => {
    test('default name', () => {
      const original = compile(`<input v-model="foo" />`)
      const sugar = compile(`<input $="foo" />`, '$')
      expect(sugar.code).toBe(original.code)
      expect((sugar.ast as any).children[0].props[0]).matchSnapshot()
    })

    test('w/ name', () => {
      const original = compile(`<input v-model:foo="foo" />`)
      const sugar = compile(`<input $foo="foo" />`, '$')
      expect(sugar.code).toBe(original.code)
      expect((sugar.ast as any).children[0].props[0]).matchSnapshot()
    })
  })

  describe('asterisk sign', () => {
    test('default name', () => {
      const original = compile(`<input v-model="foo" />`)
      const sugar = compile(`<input *="foo" />`, '*')
      expect(sugar.code).toBe(original.code)
      expect((sugar.ast as any).children[0].props[0]).matchSnapshot()
    })

    test('w/ name', () => {
      const original = compile(`<input v-model:foo="foo" />`)
      const sugar = compile(`<input *foo="foo" />`, '*')
      expect(sugar.code).toBe(original.code)
      expect((sugar.ast as any).children[0].props[0]).matchSnapshot()
    })
  })
})
