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
})
