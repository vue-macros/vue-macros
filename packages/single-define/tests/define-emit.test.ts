import { describe, expect, it } from 'vitest'
import { transformDefineSingle } from '../src/core'
import { EMIT_VARIABLE_NAME } from '../src/core/constants'
import { removeSpaces } from './utils'

describe('defineEmit', () => {
  it('should transform simple emit', async () => {
    const result = await transformDefineSingle(
      `
      <script setup lang="ts" >
        const foo = defineEmit('foo')
      </script>

      <template>    
        <button @click="foo">foo</button>
      </template>`,
      'test.vue',
      false
    )
    const code = removeSpaces(result!.code)

    expect(code).includes(`const ${EMIT_VARIABLE_NAME} = defineEmits(["foo"])`)
    expect(code).includes(
      `const foo = (...args) => ${EMIT_VARIABLE_NAME}("foo", ...args)`
    )
  })

  it('should transform emit with validation', async () => {
    const result = await transformDefineSingle(
      `
      <script setup lang="ts" >
        const foo = defineEmit('foo', (payload) => payload.length > 0)
      </script>
      
      <template>    
        <button @click="foo">foo</button>
      </template>`,
      'test.vue',
      false
    )

    const code = removeSpaces(result!.code)

    expect(code).includes(
      `const foo = (...args) => ${EMIT_VARIABLE_NAME}("foo", ...args)`
    )
    expect(code).includes(
      `const ${EMIT_VARIABLE_NAME} = defineEmits({ "foo": (payload) => payload.length > 0 })`
    )
  })

  it('it should be able to use defineEmit multiple times', async () => {
    const result = await transformDefineSingle(
      `
      <script setup lang="ts" >
        const foo = defineEmit('foo')
        const bar = defineEmit('bar')
      </script>`,
      'test.vue',
      false
    )

    const code = result?.code ? result.code.trim().replace(/\s+/g, ' ') : ''

    expect(code).includes(
      `const ${EMIT_VARIABLE_NAME} = defineEmits(["foo", "bar"])`
    )
    expect(code).includes(
      `const foo = (...args) => ${EMIT_VARIABLE_NAME}("foo", ...args)`
    )
    expect(code).includes(
      `const bar = (...args) => ${EMIT_VARIABLE_NAME}("bar", ...args)`
    )
  })
})
