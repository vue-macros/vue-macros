import {
    DEFINE_PROP,
    DEFINE_PROPS,
  } from '@vue-macros/common'

import { describe, it, expect } from 'vitest'
import { transformDefineProp } from '../src/core'

describe('defineProp',  () => {

    it('should throw an error when using defineProp & defineProps together', () => {
    
        const setupScript = `
            <script setup>
                const foo = defineProp('foo')
    
                const props = defineProps(['foo'])
            </script>    
        `


        expect(() => transformDefineProp(setupScript, 2))
            .toThrow(`[${DEFINE_PROP}] ${DEFINE_PROPS} can not be used with ${DEFINE_PROP}.`)
    
    })
})    

