import { HELPER_PREFIX } from '@vue-macros/common'

import { describe, expect, it } from 'vitest'
import { transformDefineSingle } from '../src/core'
import { PROPS_VARIABLE_NAME } from '../src/core/constants'

describe('defineProp', () => {
  it('should transform simple prop', () => {
    const setupScript = `
            <script setup lang="ts" >
                const foo = defineProp('foo')
            </script>
        `

    const result = transformDefineSingle(setupScript, 'test.vue')

    const code = result?.code ? result.code.trim().replace(/\s+/g, ' ') : ''

    expect(code).includes(
      `const foo = ${HELPER_PREFIX}computed(() => ${PROPS_VARIABLE_NAME}.foo)`
    )
    expect(code).includes(`const ${PROPS_VARIABLE_NAME} = defineProps(['foo'])`)
  })

  it('should transform prop with options', () => {
    const propOptions = `{
        type: [String, Number],
        required: true,
        default: () => Math.random() > 0.5 ? 'foo' : 1
      }
    `

    const setupScript = `
      <script setup lang="ts" >
          const foo = defineProp('foo', ${propOptions})
      </script>
    `

    const result = transformDefineSingle(setupScript, 'test.vue')

    const code = result?.code ? result.code.trim().replace(/\s+/g, ' ') : ''

    expect(code).includes(
      `const foo = ${HELPER_PREFIX}computed(() => ${PROPS_VARIABLE_NAME}.foo)`
    )

    expect(code).includes(
      `const ${PROPS_VARIABLE_NAME} = defineProps({ foo: ${propOptions
        .trim()
        .replace(/\s+/g, ' ')} })`
    )
  })

  it('shoud be able to use defineProp multiple times', () => {
    const setupScript = `
      <script setup lang="ts" >
          const foo = defineProp('foo')
          const bar = defineProp('bar')
      </script>
    `

    const result = transformDefineSingle(setupScript, 'test.vue')

    const code = result?.code ? result.code.trim().replace(/\s+/g, ' ') : ''

    expect(code).includes(
      `const foo = ${HELPER_PREFIX}computed(() => ${PROPS_VARIABLE_NAME}.foo)`
    )
    expect(code).includes(
      `const bar = ${HELPER_PREFIX}computed(() => ${PROPS_VARIABLE_NAME}.bar)`
    )
    expect(code).includes(
      `const ${PROPS_VARIABLE_NAME} = defineProps(['foo', 'bar'])`
    )
  })
})
