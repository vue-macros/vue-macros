import { describe, expect, it } from 'vitest'
import { emitVariableName, transformDefineEmit } from '../src/core'

describe('defineEmit', () => {
  it('should transform simple emit', () => {
    const setupScript = `
            <script setup lang="ts" >
                const foo = defineEmit('foo')
            </script>
            
            <template>    
                <button @click="foo">foo</button>
            </template>
        `

    const result = transformDefineEmit(setupScript, 'test.vue')

    const code = result?.code ? result.code.trim().replace(/\s+/g, ' ') : ''

    expect(code).includes(`const ${emitVariableName} = defineEmits(['foo'])`)
    expect(code).includes(
      `const foo = (payload) => ${emitVariableName}('foo', payload)`
    )
  })

  it('should transform emit with validation', () => {
    const setupScript = `
            <script setup lang="ts" >
                const foo = defineEmit('foo', (payload) => payload.length > 0)
            </script>
            
            <template>    
                <button @click="foo">foo</button>
            </template>
        `

    const result = transformDefineEmit(setupScript, 'test.vue')

    const code = result?.code ? result.code.trim().replace(/\s+/g, ' ') : ''

    expect(code).includes(
      `const foo = (payload) => ${emitVariableName}('foo', payload)`
    )

    expect(code).includes(`const ${emitVariableName} = defineEmits({ foo: (payload) => payload.length > 0 })`)
  })

  it('it should be able to use defineEmit multiple times', () => {
    const setupScript = `
            <script setup lang="ts" >
                const foo = defineEmit('foo')
                const bar = defineEmit('bar')
            </script>
        `

    const result = transformDefineEmit(setupScript, 'test.vue')

    const code = result?.code ? result.code.trim().replace(/\s+/g, ' ') : ''

    expect(code).includes(`const ${emitVariableName} = defineEmits(['foo', 'bar'])`)
    expect(code).includes(
      `const foo = (payload) => ${emitVariableName}('foo', payload)`
    )
    expect(code).includes(
      `const bar = (payload) => ${emitVariableName}('bar', payload)`
    )
  })
})
