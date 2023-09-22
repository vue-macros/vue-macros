import { compileTemplate } from '@vue/compiler-sfc'
import { describe, expect, test } from 'vitest'
import { transformShortBind } from '../src/core'

function compile(code: string) {
  return compileTemplate({
    source: code,
    filename: 'anonymous.vue',
    id: 'xxx',
    compilerOptions: {
      nodeTransforms: [transformShortBind()],
    },
  })
}

describe('compiler', () => {
  describe('short bind', () => {
    test('default name', () => {
      const original = compile(`<input :value="value" />`)
      const sugar = compile(`<input :value />`)
      expect(sugar.code).toBe(original.code)
      expect((sugar.ast as any).children[0].props[0]).matchSnapshot()
    })

    test('w/ name', () => {
      const original = compile(`<input :foo="foo" />`)
      const sugar = compile(`<input :foo />`)
      expect(sugar.code).toBe(original.code)
      expect((sugar.ast as any).children[0].props[0]).matchSnapshot()
    })
  })

  describe('double bind', () => {
    test('default name', () => {
      const original = compile(`<input ::model-value="modelValue" />`)
      const sugar = compile(`<input ::model-value />`)
      expect(sugar.code).toBe(original.code)
      expect((sugar.ast as any).children[0].props[0]).matchSnapshot()
    })

    test('w/ name', () => {
      const original = compile(`<input ::foo="foo" />`)
      const sugar = compile(`<input ::foo />`)
      expect(sugar.code).toBe(original.code)
      expect((sugar.ast as any).children[0].props[0]).matchSnapshot()
    })
  })

  describe('dollar sign', () => {
    test('default name', () => {
      const original = compile(`<input $model-value="modelValue" />`)
      const sugar = compile(`<input $model-value />`)
      expect(sugar.code).toBe(original.code)
      expect((sugar.ast as any).children[0].props[0]).matchSnapshot()
    })

    test('w/ name', () => {
      const original = compile(`<input $foo="foo" />`)
      const sugar = compile(`<input $foo />`)
      expect(sugar.code).toBe(original.code)
      expect((sugar.ast as any).children[0].props[0]).matchSnapshot()
    })
  })

  describe('asterisk sign', () => {
    test('default name', () => {
      const original = compile(`<input *model-value="modelValue" />`)
      const sugar = compile(`<input *model-value />`)
      expect(sugar.code).toBe(original.code)
      expect((sugar.ast as any).children[0].props[0]).matchSnapshot()
    })

    test('w/ name', () => {
      const original = compile(`<input *foo="foo" />`)
      const sugar = compile(`<input *foo />`)
      expect(sugar.code).toBe(original.code)
      expect((sugar.ast as any).children[0].props[0]).matchSnapshot()
    })
  })
})
