import { describe, expect, test } from 'vitest'
import { transform } from '../src'

describe('vue 3', () => {
  test('basic usage', () => {
    const code = `
    let { modelValue } = defineModel<{
      modelValue: string
    }>()
    
    console.log(modelValue)
    modelValue = "newValue"`
    expect(transform(code)).toMatchSnapshot()
  })
})
