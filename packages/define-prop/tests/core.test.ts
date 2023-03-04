import { HELPER_PREFIX } from '@vue-macros/common'

import { describe, expect, it } from 'vitest'
import { propsVariableName, transformDefineProp } from '../src/core'

describe('defineProp', () => {
  it('should transform simple prop', () => {
    const setupScript = `
            <script setup lang="ts" >
                const foo = defineProp('foo')
            </script>
        `

    const result = transformDefineProp(setupScript, 'test.vue')

    const code = result?.code ? result.code.trim().replace(/\s+/g, ' ') : ''

    expect(code).includes(
      `const foo = ${HELPER_PREFIX}computed(() => ${propsVariableName}.foo)`
    )
    expect(code).includes(`const ${propsVariableName} = defineProps(['foo'])`)
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

    const result = transformDefineProp(setupScript, 'test.vue')

    const code = result?.code ? result.code.trim().replace(/\s+/g, ' ') : ''

    expect(code).includes(
      `const foo = ${HELPER_PREFIX}computed(() => ${propsVariableName}.foo)`
    )
    
    expect(code).includes(`const ${propsVariableName} = defineProps({ foo: ${propOptions.trim().replace(/\s+/g, ' ')} })`)
  })
})
