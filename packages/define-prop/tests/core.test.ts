import {
    DEFINE_PROP,
    DEFINE_PROPS,
    HELPER_PREFIX
  } from '@vue-macros/common'

import { describe, it, expect } from 'vitest'
import { transformDefineProp, propsVariableName } from '../src/core'

describe('defineProp',  () => {

    it('should transform simple prop', () => {
        const setupScript = `
            <script setup lang="ts" >
                const foo = defineProp('foo')
            </script>
        `

        const result = transformDefineProp(setupScript, 'test.vue')

        const code = result?.code ? result.code.trim().replace(/\s+/g, ' ') : ''

        expect(code).includes(`const foo = ${HELPER_PREFIX}computed(() => ${propsVariableName}.foo)`)
        expect(code).includes(`const ${propsVariableName} = defineProps(['foo'])`)
    })
})    

