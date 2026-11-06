import {
  compileTemplate,
  type SFCTemplateCompileResults,
} from '@vue/compiler-sfc'
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

function collectOffsets(node: unknown, offsets: number[] = []): number[] {
  if (node && typeof node === 'object')
    for (const [key, value] of Object.entries(node)) {
      if (key === 'offset') offsets.push(value)
      else collectOffsets(value, offsets)
    }
  return offsets
}

function expectProp({ ast, source }: SFCTemplateCompileResults) {
  const prop = (ast as any).children[0].props[0]
  expect(
    collectOffsets(prop).filter(
      (offset) =>
        !Number.isInteger(offset) || offset < 0 || offset > source.length,
    ),
  ).toEqual([])
  expect(prop).matchSnapshot()
}

describe('compiler', () => {
  describe('short bind', () => {
    test('default name', () => {
      const original = compile(`<input :value="value" />`)
      const sugar = compile(`<input :value />`)
      expect(sugar.code).toBe(original.code)
      expectProp(sugar)
    })

    test('w/ name', () => {
      const original = compile(`<input :foo="foo" />`)
      const sugar = compile(`<input :foo />`)
      expect(sugar.code).toBe(original.code)
      expectProp(sugar)
    })
  })

  describe('double bind', () => {
    test('default name', () => {
      const original = compile(`<input ::model-value="modelValue" />`)
      const sugar = compile(`<input ::model-value />`)
      expect(sugar.code).toBe(original.code)
      expectProp(sugar)
    })

    test('w/ name', () => {
      const original = compile(`<input ::foo="foo" />`)
      const sugar = compile(`<input ::foo />`)
      expect(sugar.code).toBe(original.code)
      expectProp(sugar)
    })
  })

  describe('dollar sign', () => {
    test('default name', () => {
      const original = compile(`<input $model-value="modelValue" />`)
      const sugar = compile(`<input $model-value />`)
      expect(sugar.code).toBe(original.code)
      expectProp(sugar)
    })

    test('w/ name', () => {
      const original = compile(`<input $foo="foo" />`)
      const sugar = compile(`<input $foo />`)
      expect(sugar.code).toBe(original.code)
      expectProp(sugar)
    })
  })

  describe('asterisk sign', () => {
    test('default name', () => {
      const original = compile(`<input *model-value="modelValue" />`)
      const sugar = compile(`<input *model-value />`)
      expect(sugar.code).toBe(original.code)
      expectProp(sugar)
    })

    test('w/ name', () => {
      const original = compile(`<input *foo="foo" />`)
      const sugar = compile(`<input *foo />`)
      expect(sugar.code).toBe(original.code)
      expectProp(sugar)
    })
  })
})
