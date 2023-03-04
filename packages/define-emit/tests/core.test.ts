import {
    DEFINE_EMIT,
    DEFINE_EMITS,
    HELPER_PREFIX
  } from '@vue-macros/common'

import { describe, it, expect } from 'vitest'
import { transformDefineEmit, emitVariableName } from '../src/core'

describe('defineEmit',  () => {

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
        expect(code).includes(`const foo = (payload) => ${emitVariableName}('foo', payload)`)
    })

    // it('should transform emit with arrow function validation', () => {

    //     const setupScript = `
    //         <script setup lang="ts" >
    //             const foo = defineEmit('foo', (value: string) => value.length > 0)
    //         </script>
            
    //         <template>    
    //             <button @click="foo">foo</button>
    //         </template>
    //     `

    //     const result = transformDefineEmit(setupScript, 'test.vue')

    //     const code = result?.code ? result.code.trim().replace(/\s+/g, ' ') : ''

    //     expect(code).includes(`const ${HELPER_PREFIX}emit = defineEmits({ foo: (value: string) => value.length > 0 })`)
        
    // })

})    

