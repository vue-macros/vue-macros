import { describe, expect, it } from 'vitest'
import { transformDefineSingle } from '../src/core'
import { EMIT_VARIABLE_NAME } from '../src/core/constants'

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

    const result = transformDefineSingle(setupScript, 'test.vue')

    const code = result?.code ? result.code.trim().replace(/\s+/g, ' ') : ''

    expect(code).includes(`const ${EMIT_VARIABLE_NAME} = defineEmits(['foo'])`)
    expect(code).includes(
      `const foo = (payload) => ${EMIT_VARIABLE_NAME}('foo', payload)`
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

    const result = transformDefineSingle(setupScript, 'test.vue')

    const code = result?.code ? result.code.trim().replace(/\s+/g, ' ') : ''

    expect(code).includes(
      `const foo = (payload) => ${EMIT_VARIABLE_NAME}('foo', payload)`
    )

    expect(code).includes(
      `const ${EMIT_VARIABLE_NAME} = defineEmits({ foo: (payload) => payload.length > 0 })`
    )
  })

  it('it should be able to use defineEmit multiple times', () => {
    const setupScript = `
            <script setup lang="ts" >
                const foo = defineEmit('foo')
                const bar = defineEmit('bar')
            </script>
        `

    const result = transformDefineSingle(setupScript, 'test.vue')

    const code = result?.code ? result.code.trim().replace(/\s+/g, ' ') : ''

    expect(code).includes(
      `const ${EMIT_VARIABLE_NAME} = defineEmits(['foo', 'bar'])`
    )
    expect(code).includes(
      `const foo = (payload) => ${EMIT_VARIABLE_NAME}('foo', payload)`
    )
    expect(code).includes(
      `const bar = (payload) => ${EMIT_VARIABLE_NAME}('bar', payload)`
    )
  })
})
