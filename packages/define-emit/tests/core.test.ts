import {
    DEFINE_EMIT,
    DEFINE_EMITS,
    HELPER_PREFIX
  } from '@vue-macros/common'

import { describe, it, expect } from 'vitest'
import { transformDefineEmit } from '../src/core'

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

        expect(code).includes(`const ${HELPER_PREFIX}emit = defineEmits(['foo'])`)
        expect(code).includes(`const foo = ${HELPER_PREFIX}emit('foo')`)
    })

    it('should transform emit with arrow function validation', () => {

        const setupScript = `
            <script setup lang="ts" >
                const foo = defineEmit('foo', (value: string) => value.length > 0)
            </script>
            
            <template>    
                <button @click="foo">foo</button>
            </template>
        `

        const result = transformDefineEmit(setupScript, 'test.vue')

        const code = result?.code ? result.code.trim().replace(/\s+/g, ' ') : ''

        expect(code).includes(`const ${HELPER_PREFIX}emit = defineEmits({ foo: (value: string) => value.length > 0 })`)
        
    })

    it('should throw an error when using defineEmit & defineEmits together', () => {
    
        const setupScript = `
            <script setup>
                const foo = defineEmit('foo')
    
                const emit = defineEmits(['foo'])
            </script>    
        `


        expect(() => transformDefineEmit(setupScript, 2))
            .toThrow(`[${DEFINE_EMIT}] ${DEFINE_EMITS} can not be used with ${DEFINE_EMIT}.`)
    
    })
})    

